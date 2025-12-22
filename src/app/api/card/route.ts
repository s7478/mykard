import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";


const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';

// GET all cards for authenticated user
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };

    // Fetch all cards for the user
    const cards = await prisma.card.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        cardName: true,
        fullName: true,
        firstName: true,
        middleName: true,
        lastName: true,
        prefix: true,
        suffix: true,
        title: true,
        company: true,
        email: true,
        phone: true,
        location: true,
        linkedinUrl: true,
        websiteUrl: true,
        cardActive: true,
        cardType: true,
        selectedDesign: true,
        selectedColor: true,
        selectedColor2: true,
        textColor: true,
        selectedFont: true,
        displayTypes: true,
        profileImage: true,
        bannerImage: true,
        coverImage: true,
        documentUrl: true,
        bio: true,
        description: true,
        skills: true,
        portfolio: true,
        experience: true,
        services: true,
        review: true,
        status: true,
        views: true,
        createdAt: true,
        updatedAt: true,


        customFields: true,


        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            location: true,
          }
        }
      } as any
    });

    console.log('📊 Fetched cards for user:', decoded.userId);
    console.log('📋 Number of cards:', cards.length);
    if (cards.length > 0) {
      console.log('🎨 First card design:', cards[0].selectedDesign);
      console.log('🎨 First card selectedColor2:', cards[0].selectedColor2);
      console.log('🔍 First card data:', JSON.stringify(cards[0], null, 2));
    }

    return NextResponse.json({ 
      success: true,
      cards: cards,
      count: cards.length
    });

  } catch (error: any) {
    console.error("Error fetching cards:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to fetch cards" 
    }, { status: 500 });
  }
}
