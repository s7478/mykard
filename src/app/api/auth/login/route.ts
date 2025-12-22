import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { signToken } from '@/lib/jwt'

const TOKEN_EXPIRY = '7d' // 365 days (1 year)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim()

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { 
        email: normalizedEmail
      }
    })

    if (!user) {
      console.log('❌ User not found:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if account is deactivated
    if (user.status === 'inactive') {
      console.log('❌ Account is deactivated:', email)
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact support to reactivate your account.' },
        { status: 403 }
      )
    }

    // Check if user has a password set
    if (!user.password) {
      console.log('❌ User has no password set:', email)
      return NextResponse.json(
        { error: 'Account exists but password not set. Please use signup to set a password.' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('✅ Login successful for user:', email)

    // Check if user has any cards (first-time login check)
    const cardCount = await prisma.card.count({
      where: { userId: user.id }
    })

    const needsOnboarding = cardCount === 0

    // Create JWT token
    const token = signToken(
      {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        username: user.username,
        profileImage: user.profileImage
      },
      { expiresIn: TOKEN_EXPIRY }
    )

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/'
    })

    return NextResponse.json({
      success: true,
      token,
      needsOnboarding,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('User login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
