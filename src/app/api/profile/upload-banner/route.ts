import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { deleteFromCloudinary } from '@/lib/cloudinary'
import { adminStorageBucket } from '@/lib/firebase-admin'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('user_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token and get user ID
    const decoded = verify(token, JWT_SECRET) as {
      userId: string
      email: string
      fullName: string
    }

    // Get current user to check for existing banner image
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { bannerImage: true } as any
    })

    // Get form data
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Delete old banner image from Cloudinary if it exists
    const oldBannerImage = (currentUser as any)?.bannerImage
    if (oldBannerImage && typeof oldBannerImage === 'string') {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = oldBannerImage.split('/')
        const uploadIndex = urlParts.findIndex(part => part === 'upload')
        
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          const startIndex = urlParts[uploadIndex + 1].startsWith('v') ? uploadIndex + 2 : uploadIndex + 1
          const pathParts = urlParts.slice(startIndex)
          const fileWithExt = pathParts[pathParts.length - 1]
          const fileName = fileWithExt.split('.')[0]
          const folderPath = pathParts.slice(0, -1).join('/')
          const publicId = folderPath ? `${folderPath}/${fileName}` : fileName
          
          console.log('🔍 Banner Upload API: Extracted public ID:', publicId)
          
          console.log('🗑️ Banner Upload API: Deleting old banner image:', publicId)
          await deleteFromCloudinary(publicId)
          console.log('✅ Banner Upload API: Old banner image deleted successfully')
        } else {
          console.warn('⚠️ Banner Upload API: Could not extract public ID from URL:', oldBannerImage)
        }
      } catch (deleteError) {
        console.warn('⚠️ Banner Upload API: Failed to delete old banner image:', deleteError)
        // Continue with upload even if deletion fails
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload new image to Firebase Storage
    const originalName = (file as any).name || 'banner.jpg'
    const safeName = originalName.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()
    const timestamp = Date.now()
    const filePath = `users/banner-images/${decoded.userId}/${timestamp}-${safeName}`

    const bucket = adminStorageBucket();
    if (!bucket) {
      return NextResponse.json({ error: 'Firebase Storage not available during build' }, { status: 503 });
    }
    const fileRef = bucket.file(filePath)

    await fileRef.save(buffer, {
      resumable: false,
      metadata: {
        contentType: file.type || 'application/octet-stream',
      },
    })

    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '2100-01-01',
    })

    // Update user profile in database
    console.log('🔄 Banner Upload API: Updating user profile with banner URL:', signedUrl);
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { bannerImage: signedUrl } as any,
      select: {
        id: true,
        email: true,
        fullName: true,
        bannerImage: true
      } as any
    })
    console.log('✅ Banner Upload API: User updated in database:', updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Banner image uploaded successfully',
      user: updatedUser,
      url: signedUrl
    })

  } catch (error) {
    console.error('Banner image upload error:', error)
    
    if (error instanceof Error) {
      // Handle specific JWT errors
      if (error.message.includes('jwt')) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      
      // Handle upload errors
      if (error.message.includes('cloudinary') || error.message.includes('upload')) {
        return NextResponse.json(
          { error: 'Failed to upload image. Please try again.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while uploading the banner image' },
      { status: 500 }
    )
  }
}
