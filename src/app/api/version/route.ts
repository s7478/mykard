import { NextResponse } from 'next/server';

export async function GET() {
  // Generate version from build ID or use environment variable
  const version = process.env.BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString();
  
  return NextResponse.json(
    { version, timestamp: Date.now() },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
