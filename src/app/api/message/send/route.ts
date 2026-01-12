import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    // Extract user ID ONLY from middleware-provided headers.
    // Middleware is responsible for decoding tokens and enriching headers.
    const senderId = req.headers.get("x-user-id");

        if (!senderId) {
        return NextResponse.json(
            { ok: false, error: "Unauthorized - User not authenticated" },
            { status: 401 }
        );
    }

    const data = await req.json().catch(() => ({}));
    const { message, receiverId, status, tag, read, storyId } = data ?? {};

    if (!message || typeof message !== "string" || !message.trim()) {
        return NextResponse.json(
            { ok: false, error: "Missing required field: message" },
            { status: 400 }
        );
    }

    // Ensure sender exists to avoid FK errors
    const sender = await prisma.user.findUnique({ where: { id: String(senderId) } });
    if (!sender) {
        return NextResponse.json(
            { ok: false, error: "Invalid senderId. User not found." },
            { status: 400 }
        );
    }

    // Resolve receiver: if missing or placeholder, route to admin/support user
    let resolvedReceiverId = typeof receiverId === 'string' && receiverId.trim() && receiverId !== 'admin123'
        ? receiverId
        : undefined;
    if (!resolvedReceiverId) {
        const supportUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { role: { equals: "SUPER_ADMIN" } },
                    { role: { equals: "ADMIN" } },
                    { email: { equals: "admin@credlink.com" } },
                ],
            },
            orderBy: { createdAt: "asc" },
        });
        resolvedReceiverId = supportUser?.id;
    }

    if (!resolvedReceiverId) {
        // Fallback: route to the sender themselves so the message is persisted and visible
        resolvedReceiverId = String(senderId);
    }

    try {
            const newMessage = await (prisma as any).message.create({
            data: {
                text: message.trim(),
                senderId: String(senderId),
                receiverId: String(resolvedReceiverId),
                // Persist new fields with sensible defaults
                status: (typeof status === 'string' ? status : 'PENDING') as any,
                read: typeof read === 'boolean' ? read : false,
               tag: (typeof tag === 'string' ? (tag as string).toUpperCase() : 'SUPPORT') as any,
               storyId: typeof storyId === 'string' ? storyId : undefined,
            },
        });

        // Trigger real-time update for receiver
        try {
            // This would be handled by a WebSocket or SSE service
            // For now, we'll use a simple approach with event dispatching
            if (typeof global !== 'undefined' && global.dispatchEvent) {
                global.dispatchEvent(new CustomEvent('new-message', {
                    detail: {
                        receiverId: String(resolvedReceiverId),
                        message: newMessage
                    }
                }));
            }
        } catch (eventError) {
            console.error('Error dispatching message event:', eventError);
        }

        return NextResponse.json({ ok: true, message: newMessage }, { status: 201 });
    } catch (err: any) {
            console.error("Failed to create message:", err);
            if (err?.code === 'P1001') {
                // Database unreachable
                return NextResponse.json(
                    { ok: false, error: "Database is unreachable (P1001). Check DATABASE_URL and DB server status." },
                    { status: 503 }
                );
            }
            if (err?.code === 'P2003') {
                return NextResponse.json(
                    { ok: false, error: "Foreign key error. Ensure senderId and receiverId reference existing users." },
                    { status: 400 }
                );
            }
            return NextResponse.json({ ok: false, error: "Failed to send message" }, { status: 500 });
    }
}

// Helpful for direct browser hits; make it clear this endpoint expects POST