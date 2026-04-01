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
    
    // Get list of receivers and the content ID
    const { receiverIds, postId, cardId, type } = await req.json();

    if (!receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0) {
      return NextResponse.json({ error: "No receivers selected" }, { status: 400 });
    }

    // 🟢 Construct the link dynamically
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    let shareLink = "";
    if (cardId || type === "card") {
      shareLink = `${baseUrl}/cards/public/${cardId || postId}`;
    } else {
      shareLink = `${baseUrl}/post/${postId}`;
    }

    // 🟢 Send Message to all selected users
    await prisma.$transaction(
      receiverIds.map((receiverId: string) => 
        prisma.message.create({
          data: {
            text: shareLink, // Sending the link as the message content
            senderId: decoded.userId,
            receiverId: receiverId,
          }
        })
      )
    );

    return NextResponse.json({ success: true, count: receiverIds.length });

  } catch (error: any) {
    console.error("Share error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}