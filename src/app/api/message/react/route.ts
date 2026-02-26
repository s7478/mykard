import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({
                ok: false,
                error: "Unauthorized - User not authenticated"
            }, { status: 401 });
        }

        const body = await req.json();
        const { messageId, emoji } = body;

        if (!messageId) {
            return NextResponse.json({
                ok: false,
                error: "Message ID is required."
            }, { status: 400 });
        }

        // Verify the message exists and user is either sender or receiver
        const message = await (prisma as any).message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return NextResponse.json({
                ok: false,
                error: "Message not found."
            }, { status: 404 });
        }

        if (message.senderId !== userId && message.receiverId !== userId) {
            return NextResponse.json({
                ok: false,
                error: "Unauthorized - User is not a participant in this conversation."
            }, { status: 403 });
        }

        // Update the message reaction
        const updatedMessage = await (prisma as any).message.update({
            where: { id: messageId },
            data: { reaction: emoji || null } // If emoji is empty/null, it un-reacts
        });

        return NextResponse.json({
            ok: true,
            message: "Reaction updated successfully.",
            data: updatedMessage
        });

    } catch (error) {
        console.error('Error updating message reaction:', error);
        return NextResponse.json({
            ok: false,
            error: "Failed to update reaction"
        }, { status: 500 });
    }
}
