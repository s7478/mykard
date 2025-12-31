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

    // 1. Get IDs of connections (Accepted status)
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
        authorId: { in: friendIds },
        expiresAt: { gt: new Date() },
      },
      include: {
        author: {
          select: { id: true, fullName: true, profileImage: true },
        },
        views: {
          where: { viewerId: userId }, // Check if viewed
          select: { id: true },
        },
      },
      orderBy: { createdAt: "asc" },
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
      if (story.views.length === 0) {
        storiesByUser[story.authorId].hasUnseen = true;
      }
    });

    // Convert object to array and sort (Unseen first, then Recent)
    const storyFeed = Object.values(storiesByUser).sort((a: any, b: any) => {
      // My story first? Or Unseen first? Let's do Unseen first
      if (a.hasUnseen && !b.hasUnseen) return -1;
      if (!a.hasUnseen && b.hasUnseen) return 1;
      return 0;
    });

    return NextResponse.json({ success: true, stories: storyFeed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}