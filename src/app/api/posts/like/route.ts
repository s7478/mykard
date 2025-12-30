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
    const { postId } = await req.json();

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: decoded.userId, postId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { userId_postId: { userId: decoded.userId, postId } } });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId: decoded.userId, postId } });
      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}