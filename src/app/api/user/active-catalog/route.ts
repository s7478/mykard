import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Simple JWT decode function
function decodeJWT(token: string) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        return JSON.parse(Buffer.from(payload, 'base64url').toString());
    } catch (error) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('user_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = decodeJWT(token);

        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { activeCatalogCardId } = body;

        // If activeCatalogCardId is null/undefined, we could theoretically clear it, 
        // but for this endpoint its primary use is setting it.
        if (activeCatalogCardId === undefined) {
            return NextResponse.json({ error: 'Missing activeCatalogCardId' }, { status: 400 });
        }

        // Verify the card belongs to the user
        if (activeCatalogCardId !== null) {
            const card = await prisma.card.findUnique({
                where: {
                    id: activeCatalogCardId,
                }
            });

            if (!card || card.userId !== decoded.userId) {
                return NextResponse.json({ error: 'Card not found or unauthorized' }, { status: 403 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: { activeCatalogCardId },
        });

        return NextResponse.json({
            success: true,
            activeCatalogCardId: updatedUser.activeCatalogCardId
        });

    } catch (error) {
        console.error('Error updating active catalog:', error);
        return NextResponse.json(
            { error: 'Failed to update active catalog selection' },
            { status: 500 }
        );
    }
}
