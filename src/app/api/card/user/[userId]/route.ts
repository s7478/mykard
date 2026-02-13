import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Fetch the user's active card
    const card = await prisma.card.findFirst({
      where: {
        userId: userId,
        cardActive: true,
      },
      select: {
        id: true,
        cardName: true,
        fullName: true,
        email: true,
        phone: true,
        title: true,
        company: true,
        location: true,
        bio: true,
        description: true,
        services: true,
        skills: true,
        portfolio: true,
        experience: true,
        review: true,
        profileImage: true,
        bannerImage: true,
        linkedinUrl: true,
        websiteUrl: true,
        createdAt: true,
      }
    });

    if (!card) {
      return NextResponse.json(
        { error: "User card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, card });
  } catch (error: any) {
    console.error("Error fetching user card:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user card" },
      { status: 500 }
    );
  }
}
