import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CACHE_TTL_MS = 10_000; // 10 seconds

type MessagesCacheEntry = {
    timestamp: number;
    payload: {
        ok: boolean;
        messages: any[];
        sentMessages: any[];
        senders: any[];
    };
};

// Per-user in-memory cache to reduce repeated DB hits
const messagesCache = new Map<string, MessagesCacheEntry>();

export async function GET(req: NextRequest) {
    try {
        // Extract user ID from middleware headers
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({
                ok: false,
                error: "Unauthorized - User not authenticated"
            }, { status: 401 });
        }

        const cacheKey = userId;
        const now = Date.now();
        const cached = messagesCache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_TTL_MS) {
            return NextResponse.json(cached.payload);
        }

        // Fetch messages sent *to* the user (incoming)
        const incomingMessages = await (prisma as any).message.findMany({
            where: {
                receiverId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Fetch all messages sent *by* this user (outgoing)
        const allSentMessages = await (prisma as any).message.findMany({
            where: {
                senderId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Combine all unique conversation partners (both senders and receivers)
        const allPartnerIds = new Set([
            ...incomingMessages.map((msg: any) => msg.senderId),
            ...allSentMessages.map((msg: any) => msg.receiverId)
        ]);

        // Fetch details for all conversation partners
        const senders = await (prisma as any).user.findMany({
            where: {
                id: { in: Array.from(allPartnerIds) },
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                title: true,
                company: true,
                profileImage: true,
            },
        });

        // 🟢 MANUAL STORY FETCHING
        const storyIds = new Set<string>();
        [...incomingMessages, ...allSentMessages].forEach((m: any) => {
            if (m.storyId) storyIds.add(m.storyId);
        });

        const stories = await (prisma as any).story.findMany({
            where: { id: { in: Array.from(storyIds) } },
            select: { id: true, imageUrl: true, videoUrl: true, content: true }
        });

        const storyMap = new Map(stories.map((s: any) => [s.id, s]));

        // Helper to attach story
        const attachStory = (msg: any) => ({
            ...msg,
            story: msg.storyId ? storyMap.get(msg.storyId) || null : null
        });

        // For the frontend, we need to structure the data properly
        // Messages sent TO the user (incoming)
        const messages = incomingMessages.map(attachStory);

        // Messages sent BY the user to these partners (outgoing)
        const sentMessages = allSentMessages
            .filter((msg: any) => allPartnerIds.has(msg.receiverId))
            .map(attachStory);

        const payload = {
            ok: true,
            messages,       // incoming messages (others -> user)
            sentMessages,   // outgoing messages (user -> others)
            senders
        };

        messagesCache.set(cacheKey, { timestamp: now, payload });

        return NextResponse.json(payload);

    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({
            ok: false,
            error: "Failed to fetch messages"
        }, { status: 500 });
    }
}