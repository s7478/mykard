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