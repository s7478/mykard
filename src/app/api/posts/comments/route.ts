import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) return NextResponse.json({ error: "Post ID required" }, { status: 400 });

    const comments = await prisma.comment.findMany({
      where: { postId: postId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            username: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, comments });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}