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

    // Get connection count
    const connectionCount = await prisma.connection.count({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ],
        status: 'ACCEPTED'
      }
    })

    return NextResponse.json({
      user: {
        ...user,
        connectionCount
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
