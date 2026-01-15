import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. AUTHENTICATION (Copying your pattern)
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    // 2. GET POST ID
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Post ID missing" }, { status: 400 });
    }

    // 3. CREATE SHARE RECORD
    await prisma.postShare.create({
      data: {
        userId: userId,
        postId: postId,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}