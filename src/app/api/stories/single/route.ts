import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Story ID missing" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            username: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Check expiration
    if (new Date() > new Date(story.expiresAt)) {
        return NextResponse.json({ error: "Story expired" }, { status: 410 });
    }

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}