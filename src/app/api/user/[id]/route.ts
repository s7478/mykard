import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Simple JWT decode function (without verification for now)
function decodeJWT(token: string) {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null

        const payload = parts[1]
        const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
        return decoded
    } catch (error) {
        return null
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetUserId } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('user_token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        // Decode JWT token to get viewer's user id
        const decoded = decodeJWT(token)

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        const viewerId = decoded.userId

        // Fetch target user data
        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                username: true,
                profileImage: true,
                bannerImage: true,
                title: true,
                company: true,
                location: true,
                bio: true,
                website: true,
                firstName: true,
                lastName: true, // Needed for displayUser logic
                cardName: true,
                selectedColor: true,
                selectedFont: true,
                posts: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        content: true,
                        imageUrl: true,
                        createdAt: true,
                        visibility: true,
                        _count: {
                            select: {
                                likes: true,
                                comments: true
                            }
                        }
                    }
                }
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Check connection status
        let connectionStatus = 'NONE'
        let isConnected = false

        if (viewerId === targetUserId) {
            connectionStatus = 'SELF'
            isConnected = true
        } else {
            const connection = await prisma.connection.findFirst({
                where: {
                    OR: [
                        { senderId: viewerId, receiverId: targetUserId },
                        { senderId: targetUserId, receiverId: viewerId }
                    ]
                }
            })

            if (connection) {
                connectionStatus = connection.status // 'PENDING' | 'ACCEPTED' | 'REJECTED' ??
                if (connection.status === 'ACCEPTED') {
                    isConnected = true
                }
            }
        }

        // Count accepted connections (where user is either sender or receiver)
        const connectionCount = await prisma.connection.count({
            where: {
                AND: [
                    {
                        OR: [
                            { senderId: targetUserId },
                            { receiverId: targetUserId }
                        ]
                    },
                    { status: 'ACCEPTED' }
                ]
            }
        })

        // Fetch user's card with documentUrl and analytics (only active cards)
        const card = await prisma.card.findFirst({
            where: {
                userId: targetUserId,
                cardActive: true
            },
            select: {
                documentUrl: true,
                views: true,
                shares: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        // Fetch suggestions (3 random users excluding current viewer and target)
        const suggestions = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { notIn: [targetUserId, viewerId] } },
                    { isActive: true }
                ]
            },
            take: 3,
            orderBy: {
                createdAt: 'desc' // specific order for consistency, could be random(); with raw query but this is fine
            },
            select: {
                id: true,
                fullName: true,
                profileImage: true,
                title: true,
                company: true,
            }
        })

        return NextResponse.json({
            user: {
                ...user,
                connectionCount,
                documentUrl: card?.documentUrl || null,
                views: card?.views || 0,
                shares: card?.shares || 0,
                isConnected, // boolean flag for frontend convenience
                connectionStatus, // specific status
                viewerId, // return viewerId so frontend knows who is looking
                suggestions // Return suggestions
            },
        })

    } catch (error) {
        console.error('Get user profile error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
