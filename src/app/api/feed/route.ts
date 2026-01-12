import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); 

    // 🟢 STEP 1: Fetch IDs of people I am connected with (ACCEPTED only)
    // We need this list to filter "Connections Only" posts
    const acceptedConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        status: "ACCEPTED" // Only fully connected users count
      },
      select: { senderId: true, receiverId: true }
    });

    const connectedUserIds = acceptedConnections.map(c => 
      c.senderId === userId ? c.receiverId : c.senderId
    );

    // 🟢 STEP 2: Fetch ALL Connections (Pending & Accepted) for UI buttons
    // We do this separately to handle the "Connect/Pending" button states on the frontend
    const allConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      select: { id: true, senderId: true, receiverId: true, status: true }
    });

    // Create Map for UI logic
    const connectionMap = new Map();
    allConnections.forEach(conn => {
      const otherUserId = conn.senderId === userId ? conn.receiverId : conn.senderId;
      connectionMap.set(otherUserId, { status: conn.status, id: conn.id });
    });


    // 🟢 STEP 3: Build the Query with Visibility Logic
    let whereClause: any = {};

    // 3a. Handle specific filters (Saved, Mine, Likes)
    if (filter === "mine") {
      whereClause = { authorId: userId };
    } else if (filter === "saved") {
      whereClause = { savedBy: { some: { userId: userId } } };
    } else if (filter === "like") {
      whereClause = { likes: { some: { userId: userId } } };
    }

    // 3b. 🔒 SECURITY: Enforce Visibility Rules
    // Add an AND condition to whatever filter exists
    whereClause = {
      ...whereClause,
      AND: [
        {
          OR: [
            // 1. Post is Public
            { visibility: "public" }, 
            // 2. Post is mine (I can always see my own, even if private)
            { authorId: userId },     
            // 3. Post is Connections Only AND Author is in my connected list
            { 
              visibility: "connections",
              authorId: { in: connectedUserIds }
            }
          ]
        }
      ]
    };

    // 4. Fetch Posts
    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: {
          select: { id: true, fullName: true, username: true, profileImage: true, title: true },
        },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: userId }, select: { userId: true } },
        savedBy: { where: { userId: userId }, select: { userId: true } },
      },
    });

    // 5. Format Posts
    const formattedPosts = posts.map((post) => {
      const conn = connectionMap.get(post.authorId);
      
      let connectionStatus = 'none';
      if (conn?.status === 'ACCEPTED') connectionStatus = 'connected';
      else if (conn?.status === 'PENDING') connectionStatus = 'pending';

      return {
        ...post,
        isLiked: post.likes.length > 0,
        isSaved: post.savedBy.length > 0,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        
        connectionStatus, 
        connectionId: conn?.id || null,
        isConnected: connectionStatus === 'connected',
        isPending: connectionStatus === 'pending'
      };
    });

    return NextResponse.json({ success: true, posts: formattedPosts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}