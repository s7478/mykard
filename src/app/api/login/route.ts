// This route is deprecated. Use /api/auth/login instead.
// Redirecting to the correct auth endpoint
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json()

    // Get the base URL from the request
    const baseUrl = new URL(req.url).origin

    // Forward the request to the correct endpoint
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // Get the response data
    const data = await response.json()

    // Create a new response with the same status and data
    const nextResponse = NextResponse.json(data, { status: response.status })

    // Copy cookies from the auth/login response
    const setCookieHeader = response.headers.get('set-cookie')
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader)
    }

    return nextResponse
  } catch (error) {
    console.error('Login proxy error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}