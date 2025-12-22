import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail
      },
      select: {
        id: true
      }
    })

    return NextResponse.json({
      exists: !!existingUser 
    })

  } catch (error: any) {
    console.error('Email check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    )
  }
}
