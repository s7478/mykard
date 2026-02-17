import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";
import { adminStorageBucket } from "@/lib/firebase-admin";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_token')?.value;
    // console.log("Received token:", token);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };

    // Parse form data
    const formData = await req.formData();

    // Extract name fields and construct fullName
    const firstName = formData.get('firstName') as string || '';
    const middleName = formData.get('middleName') as string || '';
    const lastName = formData.get('lastName') as string || '';
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim() || 'Unnamed';

    // Extract card fields - only include fields that exist in the Prisma schema
    const cardData: any = {
      userId: decoded.userId,
      cardName: formData.get('cardName') as string || undefined,
      fullName: fullName, // Add the required fullName field
      title: formData.get('title') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      location: formData.get('location') as string || undefined,
      linkedinUrl: formData.get('linkedinUrl') as string || undefined,
      websiteUrl: formData.get('websiteUrl') as string || undefined,
      cardType: formData.get('cardType') as string || 'Personal',
      selectedDesign: formData.get('selectedDesign') as string || 'Classic',
      selectedColor: formData.get('selectedColor') as string || '#145dfd',
      selectedFont: formData.get('selectedFont') as string || 'Arial, sans-serif',
      bio: formData.get('bio') as string || undefined,
      description: formData.get('description') as string || undefined,
      status: formData.get('status') as string || 'draft',
    };

    // console.log('🎨 Card creation - selectedDesign received:', cardData.selectedDesign);
    // console.log('📦 Full cardData:', JSON.stringify(cardData, null, 2));

    // Handle profile image upload (Firebase Storage)
    const profileImageFile = formData.get('profileImage') as File;
    const profileImageUrl = formData.get('profileImageUrl') as string;

    if (profileImageFile && profileImageFile.size > 0) {
      try {
        const arrayBuffer = await profileImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const originalName = (profileImageFile as any).name || 'profile.jpg';
        const safeName = originalName.replace(/[^a-z0-9.]+/gi, '-').toLowerCase();
        const timestamp = Date.now();
        const filePath = `cards/profile-images/${decoded.userId}/${timestamp}-${safeName}`;

        const bucket = adminStorageBucket();
        if (!bucket) {
          console.error('Firebase Storage Bucket not initialized');
          throw new Error('Storage bucket not available');
        }
        const fileRef = bucket.file(filePath);

        await fileRef.save(buffer, {
          resumable: false,
          metadata: {
            contentType: profileImageFile.type || 'application/octet-stream',
          },
        });

        const [signedUrl] = await fileRef.getSignedUrl({
          action: 'read',
          expires: '2100-01-01',
        });

        cardData.profileImage = signedUrl;
      } catch (uploadError: any) {
        console.error("Profile image upload failed:", uploadError);
        // Do not fail the whole request, just skip the image? 
        // Or throw to let the user know?
        // Let's log and throw a more specific error so we catch it in the main block.
        throw new Error(`Profile image upload failed: ${uploadError.message}`);
      }
    } else if (profileImageUrl) {
      // Use existing profile image URL
      cardData.profileImage = profileImageUrl;
    }

    // Handle banner image upload (Firebase Storage)
    const bannerImageFile = formData.get('bannerImage') as File;
    if (bannerImageFile && bannerImageFile.size > 0) {
      const arrayBuffer = await bannerImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const originalName = (bannerImageFile as any).name || 'banner.jpg';
      const safeName = originalName.replace(/[^a-z0-9.]+/gi, '-').toLowerCase();
      const timestamp = Date.now();
      const filePath = `cards/banner-images/${decoded.userId}/${timestamp}-${safeName}`;

      const bucket = adminStorageBucket();
      if (!bucket) {
        return NextResponse.json({ error: 'Firebase Storage not available during build' }, { status: 503 });
      }
      const fileRef = bucket.file(filePath);

      await fileRef.save(buffer, {
        resumable: false,
        metadata: {
          contentType: bannerImageFile.type || 'application/octet-stream',
        },
      });

      const [signedUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '2100-01-01',
      });

      cardData.bannerImage = signedUrl;
    }

    // Handle cover image upload (Firebase Storage)
    const coverImageFile = formData.get('coverImage') as File;
    if (coverImageFile && coverImageFile.size > 0) {
      const arrayBuffer = await coverImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const originalName = (coverImageFile as any).name || 'cover.jpg';
      const safeName = originalName.replace(/[^a-z0-9.]+/gi, '-').toLowerCase();
      const timestamp = Date.now();
      const filePath = `cards/cover-images/${decoded.userId}/${timestamp}-${safeName}`;

      const bucket = adminStorageBucket();
      if (!bucket) {
        return NextResponse.json({ error: 'Firebase Storage not available during build' }, { status: 503 });
      }
      const fileRef = bucket.file(filePath);

      await fileRef.save(buffer, {
        resumable: false,
        metadata: {
          contentType: coverImageFile.type || 'application/octet-stream',
        },
      });

      const [signedUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '2100-01-01',
      });

      cardData.coverImage = signedUrl;
    }

    // Handle document upload (Firebase Storage with conversion)
    const documentFile = formData.get('document') as File;
    if (documentFile && documentFile.size > 0) {
      const maxDocSize = 10 * 1024 * 1024; // 10MB
      if (documentFile.size > maxDocSize) {
        return NextResponse.json(
          { error: 'Document size must be less than 10MB' },
          { status: 400 }
        );
      }

      try {
        // Use the document conversion API for DOC/DOCX conversion
        const convertFormData = new FormData();
        convertFormData.append('file', documentFile);

        // Make internal API call to convert document
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const convertResponse = await fetch(`${baseUrl}/api/document/convert`, {
          method: 'POST',
          body: convertFormData,
          headers: {
            'Cookie': `user_token=${token}`
          }
        });

        if (!convertResponse.ok) {
          const errorData = await convertResponse.json();
          throw new Error(errorData.error || 'Failed to process document');
        }

        const convertResult = await convertResponse.json();
        cardData.documentUrl = convertResult.url;

      } catch (error: any) {
        console.error('Error converting document:', error);
        // Don't fail the entire card creation if document upload fails
        // Just log the error and continue
      }
    }

    // Validate required fields
    if (!cardData.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create card
    const card = await prisma.card.create({
      data: cardData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
          }
        }
      }
    });

    // Best-effort: sync basic contact info from card into user profile
    // so admin lists, settings, search, connections, and messages can rely
    // on a single source of truth for user details.
    try {
      const profileUpdateData: any = {};
      if (cardData.phone) profileUpdateData.phone = cardData.phone;
      if (cardData.location) profileUpdateData.location = cardData.location;
      if (cardData.fullName) profileUpdateData.fullName = cardData.fullName;
      if (cardData.company) profileUpdateData.company = cardData.company;
      if (cardData.title) profileUpdateData.title = cardData.title;
      if (cardData.email) profileUpdateData.email = cardData.email;

      if (Object.keys(profileUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: decoded.userId },
          data: profileUpdateData,
        });
      }
    } catch (err) {
      console.error('Failed to sync user profile from card data:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Card created successfully',
      card
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating card:", error);
    return NextResponse.json({
      error: error.message || "Failed to create card"
    }, { status: 500 });
  }
}

