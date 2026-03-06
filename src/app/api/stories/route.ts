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

    // 1. Get IDs of connections
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: "ACCEPTED",
      },
      select: { senderId: true, receiverId: true },
    });

    const friendIds = connections.map((c) =>
      c.senderId === userId ? c.receiverId : c.senderId
    );

    // Add self to list (to see own story)
    friendIds.push(userId);

    // 2. Fetch Active Stories (expiresAt > now)
    const activeStories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: new Date() }, // 1. Must be active
        OR: [
          { authorId: { in: friendIds } }, // 2a. Author is my friend or me
          { visibility: "public" },        // 2b. Story is Public (Visible to everyone)
        ],
      },
      include: {
        author: {
          select: { id: true, fullName: true, profileImage: true, username: true },
        },
        views: {
          include: {
            viewer: {
              select: { id: true, fullName: true, profileImage: true, username: true }
            }
          },
          orderBy: { viewedAt: "desc" }
        },
      },
      orderBy: { createdAt: "asc" }, // Oldest first
    });

    // 3. Group stories by User
    const storiesByUser: Record<string, any> = {};

    activeStories.forEach((story) => {
      if (!storiesByUser[story.authorId]) {
        storiesByUser[story.authorId] = {
          user: story.author,
          stories: [],
          hasUnseen: false,
        };
      }
      storiesByUser[story.authorId].stories.push(story);

      // Check if current user has an entry in this story's views
      const hasViewed = story.views.some((v: any) => v.viewerId === userId);
      if (!hasViewed) {
        storiesByUser[story.authorId].hasUnseen = true;
      }
    });

    // Convert object to array and sort (Unseen first, then Recent)
    const storyFeed = Object.values(storiesByUser).sort((a: any, b: any) => {
      if (a.hasUnseen && !b.hasUnseen) return -1;
      if (!a.hasUnseen && b.hasUnseen) return 1;
      return 0;
    });

    return NextResponse.json({ success: true, stories: storyFeed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const body = await req.json();

    // 🟢 EXTRACT CONTENT ALONG WITH MEDIA
    const { imageUrl, videoUrl, content, visibility } = body;

    // Validate: Must have at least one (Media OR Text)
    if (!imageUrl && !videoUrl && !content) {
      return NextResponse.json({ error: "Story must have content or media" }, { status: 400 });
    }

    const story = await prisma.story.create({
      data: {
        authorId: userId,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,

        // 🟢 CRITICAL: Save the text content to the DB
        content: content || null,
        visibility: visibility || "connections",

        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    console.error("Story create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}