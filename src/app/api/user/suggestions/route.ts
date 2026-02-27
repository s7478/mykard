import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        let userId: string;
        try {
            const decoded = verify(token, JWT_SECRET) as { userId: string };
            userId = decoded.userId;
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // First fetch the current user's title
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { title: true }
        });

        if (!currentUser || !currentUser.title) {
            return NextResponse.json({ suggestions: [] });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '5', 10);
        const cursor = searchParams.get('cursor');

        // Fetch users the current user is NOT connected to (not sender or receiver)
        const allUnconnectedUsers = await prisma.user.findMany({
            where: {
                id: { not: userId },
                AND: [
                    {
                        sentConnections: {
                            none: { receiverId: userId }
                        }
                    },
                    {
                        receivedConnections: {
                            none: { senderId: userId }
                        }
                    }
                ]
            },
            select: {
                id: true,
                fullName: true,
                title: true,
                profileImage: true,
            },
            take: 50, // Fetch up to 50 unconnected users to shuffle
        });

        // Shuffle in memory for random suggestions
        const shuffled = allUnconnectedUsers.sort(() => 0.5 - Math.random());
        const suggestions = shuffled.slice(0, limit);

        return NextResponse.json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
