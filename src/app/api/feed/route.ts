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
    const filter = searchParams.get("filter"); // 'mine', 'saved', or 'all'

    let whereClause: any = {};

    if (filter === "mine") {
      whereClause = { authorId: userId };
    } else if (filter === "saved") {
      whereClause = { savedBy: { some: { userId: userId } } };
    }

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

    const formattedPosts = posts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isSaved: post.savedBy.length > 0,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
    }));

    return NextResponse.json({ success: true, posts: formattedPosts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}