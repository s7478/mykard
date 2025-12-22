import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  console.warn('⚠️ /api/logout is deprecated. Please use /api/auth/logout instead.')
  
  // Forward to the centralized auth endpoint
  const response = await fetch(`${req.nextUrl.origin}/api/auth/logout`, {
    method: 'POST'
  })
  
  const data = await response.json()

  const nextResponse = NextResponse.json(data, { status: response.status })

  const setCookieHeader = response.headers.get('set-cookie')
  if (setCookieHeader) {
    nextResponse.headers.set('set-cookie', setCookieHeader)
  }
  
  return nextResponse
}
