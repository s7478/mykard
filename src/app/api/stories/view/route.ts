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
    const { storyId } = await req.json();

    if (!storyId) return NextResponse.json({ error: "Story ID required" }, { status: 400 });

    // Upsert: Create view if not exists, otherwise do nothing
    await prisma.storyView.upsert({
      where: {
        storyId_viewerId: {
          storyId: storyId,
          viewerId: decoded.userId,
        },
      },
      update: {}, 
      create: {
        storyId: storyId,
        viewerId: decoded.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}