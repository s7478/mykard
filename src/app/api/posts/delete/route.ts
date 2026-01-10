import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    // 1. Verify Ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    
    if (post.authorId !== decoded.userId) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own posts" }, { status: 403 });
    }

    // 2. Delete
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}