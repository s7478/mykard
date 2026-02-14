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

    // Get current user to check for existing profile image
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { profileImage: true } as any
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

    // Delete old profile image from Cloudinary if it exists
    const oldProfileImage = (currentUser as any)?.profileImage
    if (oldProfileImage && typeof oldProfileImage === 'string') {
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/MyKard/profile-images/filename.ext
        const urlParts = oldProfileImage.split('/')
        const uploadIndex = urlParts.findIndex(part => part === 'upload')
        
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          // Skip version number (v123456) if present
          const startIndex = urlParts[uploadIndex + 1].startsWith('v') ? uploadIndex + 2 : uploadIndex + 1
          const pathParts = urlParts.slice(startIndex)
          const fileWithExt = pathParts[pathParts.length - 1]
          const fileName = fileWithExt.split('.')[0]
          const folderPath = pathParts.slice(0, -1).join('/')
          const publicId = folderPath ? `${folderPath}/${fileName}` : fileName
          
          console.log('🔍 Upload API: Extracted public ID:', publicId)
          
          console.log('🗑️ Upload API: Deleting old profile image:', publicId)
          await deleteFromCloudinary(publicId)
          console.log('✅ Upload API: Old profile image deleted successfully')
        } else {
          console.warn('⚠️ Upload API: Could not extract public ID from URL:', oldProfileImage)
        }
      } catch (deleteError) {
        console.warn('⚠️ Upload API: Failed to delete old profile image:', deleteError)
        // Continue with upload even if deletion fails
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload new image to Firebase Storage
    const originalName = (file as any).name || 'profile.jpg'
    const safeName = originalName.replace(/[^a-z0-9.]+/gi, '-').toLowerCase()
    const timestamp = Date.now()
    const filePath = `users/profile-images/${decoded.userId}/${timestamp}-${safeName}`

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
    console.log('🔄 Upload API: Updating user profile with image URL:', signedUrl);
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { profileImage: signedUrl } as any,
      select: {
        id: true,
        email: true,
        fullName: true,
        profileImage: true
      } as any
    })
    console.log('✅ Upload API: User updated in database:', updatedUser);

    // Sync profile image to all cards belonging to this user
    const updatedCards = await prisma.card.updateMany({
      where: { userId: decoded.userId },
      data: { profileImage: signedUrl } as any
    })
    console.log(`✅ Upload API: Synced profile image to ${updatedCards.count} cards`);

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully and synced to all cards',
      user: updatedUser,
      imageUrl: signedUrl,
      cardsUpdated: updatedCards.count
    })

  } catch (error) {
    console.error('Profile image upload error:', error)
    
    if (error instanceof Error) {
      // Handle specific JWT errors
      if (error.message.includes('jwt')) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      
      // Handle Cloudinary errors
      if (error.message.includes('cloudinary') || error.message.includes('upload')) {
        return NextResponse.json(
          { error: 'Failed to upload image. Please try again.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while uploading the image' },
      { status: 500 }
    )
  }
}
