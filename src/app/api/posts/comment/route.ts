import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { postId, content } = await req.json();

    if (!postId || !content) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: decoded.userId,
      },
      include: {
        user: { select: { id: true, fullName: true, profileImage: true, username: true } }
      }
    });

    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { commentId } = await req.json();

    if (!commentId) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true }
    });

    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    // Authorized if user wrote the comment OR user wrote the post
    if (comment.userId !== decoded.userId && comment.post.authorId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized to delete this comment" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}