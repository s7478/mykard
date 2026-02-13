import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('user_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Decode JWT token to get user id
    const decoded = decodeJWT(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Fetch latest user data from database so fields like profileImage are always fresh
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    // Count accepted connections (where user is either sender or receiver)
    const connectionCount = await prisma.connection.count({
      where: {
        AND: [
          {
            OR: [
              { senderId: decoded.userId },
              { receiverId: decoded.userId }
            ]
          },
          { status: 'ACCEPTED' }
        ]
      }
    })

    // Fetch user's card with documentUrl and analytics (only active cards)
    const card = await prisma.card.findFirst({
      where: { 
        userId: decoded.userId,
        cardActive: true
      },
      select: {
        documentUrl: true,
        views: true,
        shares: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    // Fetch user's recent posts with likes and comments count
    const posts = await prisma.post.findMany({
      where: { authorId: decoded.userId },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        createdAt: true,
        visibility: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || null,
        username: user.username || null,
        profileImage: user.profileImage || null,
        bannerImage: user.bannerImage || null,
        title: user.title || null,
        company: user.company || null,
        location: user.location || null,
        bio: user.bio || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        cardName: user.cardName || null,
        selectedColor: user.selectedColor || null,
        selectedFont: user.selectedFont || null,
        documentUrl: card?.documentUrl || null,
        views: card?.views || 0,
        shares: card?.shares || 0,
        connectionCount: connectionCount,
        posts: posts,
      },
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('user_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = decodeJWT(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { fullName, title, company, location, bio, phone, username, website } = body

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        fullName,
        title,
        company,
        location,
        bio,
        phone,
        username,
        website,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
