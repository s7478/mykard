import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for connection request
const connectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  email: z.string().email("Invalid email format").max(320, "Email too long"),
  phone: z.string().min(1, "Phone is required").max(50, "Phone too long"),
  sourceUrl: z.string().optional(),
});

// POST - Save connection request for a card
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params;
    const body = await req.json();

    // Validate input data
    const validatedData = connectionSchema.parse(body);

    // Capture source URL from referer header or request body
    const sourceUrl = validatedData.sourceUrl || req.headers.get("referer") || null;

    // Check if card exists and get owner info
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, fullName: true, userId: true }
    });

    if (!card) {
      return NextResponse.json({
        error: 'Card not found'
      }, { status: 404 });
    }

    // Check for duplicate connection request (same email OR phone for this card)
    const existingConnection = await prisma.cardConnection.findFirst({
      where: {
        cardId: cardId,
        OR: [
          { email: validatedData.email },
          { phone: validatedData.phone }
        ]
      }
    });

    if (existingConnection) {
      if (existingConnection.email.toLowerCase() === validatedData.email.toLowerCase()) {
        return NextResponse.json({
          error: 'This email address has already been used to connect with this card.'
        }, { status: 409 });
      } else {
        return NextResponse.json({
          error: 'This phone number has already been used to connect with this card.'
        }, { status: 409 });
      }
    }

    // Create the connection request
    const connection = await prisma.cardConnection.create({
      data: {
        cardId: cardId,
        ownerUserId: card.userId,
        name: validatedData.name.trim(),
        email: validatedData.email.toLowerCase().trim(),
        phone: validatedData.phone.trim(),
        sourceUrl: sourceUrl,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Connection request submitted successfully!',
      connectionId: connection.id
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error saving connection request:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    // Handle other errors
    return NextResponse.json({
      error: error.message || "Failed to submit connection request"
    }, { status: 500 });
  }
}

// GET - Retrieve connection requests for a card (for card owner)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params;

    // Check if card exists
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true, userId: true }
    });

    if (!card) {
      return NextResponse.json({
        error: 'Card not found'
      }, { status: 404 });
    }

    // Get all connection requests for this card
    const connections = await prisma.cardConnection.findMany({
      where: { cardId: cardId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      connections: connections,
      count: connections.length
    });

  } catch (error: any) {
    console.error("Error fetching connection requests:", error);
    return NextResponse.json({
      error: error.message || "Failed to fetch connection requests"
    }, { status: 500 });
  }
}
