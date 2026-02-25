import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { adminStorageBucket } from "@/lib/firebase-admin";
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';
const MAX_DOCUMENT_SIZE_BYTES = 1024 * 1024; // 1MB

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[UPDATE ROUTE] PATCH handler entered! Card ID from params will be resolved next.');
    const cookieStore = await cookies();
    const token = cookieStore.get('user_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const { id: cardId } = await params;

    // Find existing card
    const existingCard = await prisma.card.findUnique({
      where: { id: cardId }
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Verify ownership
    if (existingCard.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Not authorized to update this card' }, { status: 403 });
    }

    // Parse form data
    const formData = await req.formData();

    // DEBUG LOGGING
    console.log(`[API UPDATE] CardId: ${cardId}`);
    console.log('[API UPDATE] showCatalog:', formData.get('showCatalog'));
    console.log('[API UPDATE] catalogTitle:', formData.get('catalogTitle'));
    const rawCatalogItems = formData.get('catalogItems') as string;
    console.log('[API UPDATE] catalogItems length:', rawCatalogItems ? rawCatalogItems.length : 'null');
    console.log('[API UPDATE] catalogItems snippet:', rawCatalogItems ? rawCatalogItems.substring(0, 100) : 'null');

    // Extract card fields
    const updateData: any = {};

    // Personal Information - Extract name fields
    const firstName = formData.get('firstName') as string | null;
    if (firstName !== null) updateData.firstName = firstName || undefined;

    const middleName = formData.get('middleName') as string | null;
    updateData.middleName = middleName ?? "";


    const lastName = formData.get('lastName') as string | null;
    updateData.lastName = lastName ?? "";

    // Construct fullName from firstName/middleName/lastName
    if (firstName !== null || middleName !== null || lastName !== null) {
      const names = [
        firstName ?? "",
        middleName ?? "",
        lastName ?? ""
      ];

      updateData.fullName = names.filter(Boolean).join(' ').trim() || 'Unnamed';
    }

    const prefix = formData.get('prefix') as string;
    if (prefix !== null) updateData.prefix = prefix || undefined;

    const suffix = formData.get('suffix') as string;
    if (suffix !== null) updateData.suffix = suffix || undefined;

    const preferredName = formData.get('preferredName') as string;
    if (preferredName !== null) updateData.preferredName = preferredName || undefined;

    const maidenName = formData.get('maidenName') as string;
    if (maidenName !== null) updateData.maidenName = maidenName || undefined;

    const pronouns = formData.get('pronouns') as string;
    if (pronouns !== null) updateData.pronouns = pronouns || undefined;

    // Professional Information
    const title = formData.get('title') as string;
    if (title !== null) updateData.title = title || undefined;

    const company = formData.get('company') as string;
    if (company !== null) updateData.company = company || undefined;

    const department = formData.get('department') as string;
    if (department !== null) updateData.department = department || undefined;

    const affiliation = formData.get('affiliation') as string;
    if (affiliation !== null) updateData.affiliation = affiliation || undefined;

    const headline = formData.get('headline') as string;
    if (headline !== null) updateData.headline = headline || undefined;

    const accreditations = formData.get('accreditations') as string;
    if (accreditations !== null) updateData.accreditations = accreditations || undefined;

    // Contact Information
    const email = formData.get('email') as string;
    if (email !== null) updateData.email = email || undefined;

    const phone = formData.get('phone') as string;
    if (phone !== null) {
      // If phone is empty string, save as NULL (to delete it). 
      // Otherwise save the phone number.
      updateData.phone = phone === '' ? null : phone;
    }

    const emailLink = formData.get('emailLink') as string;
    updateData.emailLink = emailLink || undefined;

    const phoneLink = formData.get('phoneLink') as string;
    updateData.phoneLink = phoneLink || undefined;

    const location = formData.get('location') as string;
    updateData.location = location || '';

    const linkedinUrl = formData.get('linkedinUrl') as string;
    updateData.linkedinUrl = linkedinUrl || '';

    const websiteUrl = formData.get('websiteUrl') as string;
    updateData.websiteUrl = websiteUrl || '';

    // Card Customization
    const cardName = formData.get('cardName') as string;
    if (cardName !== null) updateData.cardName = cardName || undefined;

    const cardType = formData.get('cardType') as string;
    if (cardType !== null) updateData.cardType = cardType || undefined;

    const selectedDesign = formData.get('selectedDesign') as string;
    if (selectedDesign !== null) updateData.selectedDesign = selectedDesign || undefined;

    const selectedColor = formData.get('selectedColor') as string;
    if (selectedColor !== null) updateData.selectedColor = selectedColor || undefined;

    const selectedColor2 = formData.get('selectedColor2') as string;
    if (selectedColor2 !== null) updateData.selectedColor2 = selectedColor2 || undefined;

    const textColor = formData.get('textColor') as string;
    if (textColor !== null) updateData.textColor = textColor || undefined;

    const selectedFont = formData.get('selectedFont') as string;
    if (selectedFont !== null) updateData.selectedFont = selectedFont || undefined;

    // Content
    const bio = formData.get('bio') as string;
    updateData.bio = bio || '';

    const description = formData.get('description') as string;
    updateData.description = description || '';

    // Card Sections
    const skills = formData.get('skills') as string;
    updateData.skills = skills || '';

    const portfolio = formData.get('portfolio') as string;
    updateData.portfolio = portfolio || '';

    const experience = formData.get('experience') as string;
    updateData.experience = experience || '';

    const services = formData.get('services') as string;
    updateData.services = services || '';

    const review = formData.get('review') as string;
    updateData.review = review || '';

    const customFields = formData.get('customFields') as string;
    if (customFields !== null) updateData.customFields = customFields || '';


    // Status
    const status = formData.get('status') as string;
    if (status !== null) updateData.status = status;

    // Catalog Fields
    const showCatalog = formData.get('showCatalog');
    if (showCatalog !== null) updateData.showCatalog = showCatalog === 'true';

    const catalogTitle = formData.get('catalogTitle') as string;
    if (catalogTitle !== null) updateData.catalogTitle = catalogTitle;

    const catalogItems = formData.get('catalogItems') as string;
    if (catalogItems !== null) {
      console.log('[UPDATE] Processing catalog items...');
      try {
        let items = JSON.parse(catalogItems);

        // 1. Sanitize items first: Remove any blob: URLs or fileKeys immediately
        // This ensures if upload fails, we save clean data without broken images
        const sanitizedItems = Array.isArray(items) ? items.map((item: any) => ({
          ...item,
          images: Array.isArray(item.images)
            ? item.images.filter((img: any) => img.preview && !img.preview.startsWith('blob:') && !img.fileKey)
            : []
        })) : [];

        // Set updateData to use sanitized items by default (fallback)
        updateData.catalogItems = JSON.stringify(sanitizedItems);

        if (Array.isArray(items)) {
          // 2. Try to upload new images
          for (const item of items) {
            if (item.images && Array.isArray(item.images)) {
              const processedImages: any[] = [];
              for (let i = 0; i < item.images.length; i++) {
                const imgEntry = item.images[i];
                try {
                  // Check for new upload attempt
                  if (imgEntry.fileKey) {
                    const bucket = adminStorageBucket();
                    console.log('[UPDATE] Storage Bucket available for upload:', !!bucket);

                    if (!bucket) {
                      throw new Error('Server Storage not configured (missing bucket). Cannot upload image.');
                    }

                    console.log(`[UPDATE] Attempting upload for key matches: ${imgEntry.fileKey}`);
                    const file = formData.get(imgEntry.fileKey) as File;

                    if (!file) {
                      console.error(`[UPDATE] File not found in FormData for key: ${imgEntry.fileKey}`);
                      throw new Error(`Image upload failed: File missing for ${imgEntry.fileKey}`);
                    }

                    if (file.size === 0) {
                      throw new Error('Image file is empty');
                    }

                    console.log(`[UPDATE] Uploading file: ${file.name}, size: ${file.size}`);

                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const safeName = (file.name || 'image.jpg').replace(/[^a-z0-9.]+/gi, '-').toLowerCase();
                    const filePath = `cards/catalog-images/${decoded.userId}/${Date.now()}-${safeName}`;
                    const fileRef = bucket.file(filePath);

                    await fileRef.save(buffer, {
                      metadata: { contentType: file.type || 'application/octet-stream' }
                    });

                    const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '2100-01-01' });
                    console.log('[UPDATE] Upload success:', url);
                    processedImages.push({ preview: url });

                  } else if (imgEntry.preview && !imgEntry.preview.startsWith('blob:')) {
                    // Keep existing valid (non-blob) URLs
                    processedImages.push({ preview: imgEntry.preview });
                  } else {
                    // Found a blob URL but NO fileKey? This shouldn't happen from frontend logic, 
                    // but if it does, it's an error state.
                    console.warn('[UPDATE] Checking invalid image entry:', imgEntry);
                    if (imgEntry.preview?.startsWith('blob:')) {
                      // If we really can't upload, we MUST NOT save the blob.
                      // But we should probably throw to alert the user.
                      throw new Error('Cannot save local image (upload missed). Please try again.');
                    }
                  }
                } catch (imgErr: any) {
                  console.error(`[UPDATE] Error processing specific image:`, imgErr);
                  // Re-throw so the main catch block handles it and returns 500
                  throw new Error(`Failed to save image: ${imgErr.message}`);
                }
              }
              item.images = processedImages;
            }
          }
          // 3. Update with fully processed data (including new uploads)
          updateData.catalogItems = JSON.stringify(items);
        }
      } catch (e) {
        console.error("[UPDATE] Error processing catalog items JSON or Storage:", e);
        // Fallback: updateData.catalogItems is already set to sanitizedItems or potentially undefined if parse failed.
        // If parse failed, we don't update catalogItems at all (keep existing DB value).
      }
    }

    // Handle document upload (optional, Firebase Storage with conversion)
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
        const bucket = adminStorageBucket();
        if (!bucket) {
          return NextResponse.json({ error: 'Storage not available' }, { status: 503 });
        }

        const originalName = (documentFile as any).name || 'document';
        const safeName = originalName.replace(/[^a-z0-9.]+/gi, '-').toLowerCase();
        const ext = safeName.split('.').pop() || '';
        const timestamp = Date.now();
        const targetPdfName = `${timestamp}-${safeName.replace(/\.(docx|doc|pdf)$/i, '')}.pdf`;
        const filePath = `cards/documents/${decoded.userId}/${targetPdfName}`;
        let pdfBuffer: Buffer;

        if (/(docx|doc)$/i.test(ext)) {
          console.log('[card/update] Converting DOC/DOCX to PDF inline');
          const arrayBuffer = await documentFile.arrayBuffer();
          const docBuffer = Buffer.from(arrayBuffer);
          const mammothResult = await mammoth.extractRawText({ buffer: docBuffer });
          const text = mammothResult.value || 'Empty document';

          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const fontSize = 12;
          const lineHeight = fontSize * 1.25;
          const margin = 50;
          const maxWidth = page.getWidth() - margin * 2;

          const words = text.replace(/\r/g, '').split(/\s+/);
          let line = '';
          let y = page.getHeight() - margin - fontSize;

          const lines: string[] = [];
          for (const w of words) {
            const testLine = line ? line + ' ' + w : w;
            const width = font.widthOfTextAtSize(testLine, fontSize);
            if (width > maxWidth) {
              if (line) lines.push(line);
              line = w;
            } else {
              line = testLine;
            }
          }
          if (line) lines.push(line);

          for (const l of lines) {
            if (y < margin) {
              const newPage = pdfDoc.addPage();
              y = newPage.getHeight() - margin - fontSize;
              page.drawText(''); // keep reference
            }
            page.drawText(l, { x: margin, y, size: fontSize, font });
            y -= lineHeight;
          }

          pdfBuffer = Buffer.from(await pdfDoc.save());
        } else if (/pdf/i.test(ext)) {
          console.log('[card/update] Using existing PDF (upload only)');
          const arrayBuffer = await documentFile.arrayBuffer();
          pdfBuffer = Buffer.from(arrayBuffer);
        } else {
          return NextResponse.json(
            { error: 'Unsupported document type. Use PDF, DOC, or DOCX.' },
            { status: 400 }
          );
        }

        const fileRef = bucket.file(filePath);
        await fileRef.save(pdfBuffer, {
          resumable: false,
          metadata: { contentType: 'application/pdf' }
        });
        const [signedUrl] = await fileRef.getSignedUrl({ action: 'read', expires: '2100-01-01' });
        updateData.documentUrl = signedUrl;
      } catch (error: any) {
        console.error('[card/update] Inline document conversion failed:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to process document' },
          { status: 500 }
        );
      }
    }

    // Handle profile image upload
    const profileImageFile = formData.get('profileImage') as File;
    if (profileImageFile && profileImageFile.size > 0) {
      // Delete old image if exists (only relevant for legacy Cloudinary URLs)
      if (existingCard.profileImage) {
        try {
          const publicId = existingCard.profileImage.split('/').slice(-2).join('/').split('.')[0];
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.error('Error deleting old profile image:', err);
        }
      }

      const arrayBuffer = await profileImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const originalName = (profileImageFile as any).name || 'profile.jpg';
      const safeName = originalName.replace(/[^a-z0-9.]+/gi, '-').toLowerCase();
      const timestamp = Date.now();
      const filePath = `cards/profile-images/${decoded.userId}/${timestamp}-${safeName}`;

      const bucket = adminStorageBucket();
      if (!bucket) {
        return NextResponse.json({ error: 'Firebase Storage not available during build' }, { status: 503 });
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

      updateData.profileImage = signedUrl;
    }

    // Handle banner image upload
    const bannerImageFile = formData.get('bannerImage') as File;
    if (bannerImageFile && bannerImageFile.size > 0) {
      // Delete old image if exists (only relevant for legacy Cloudinary URLs)
      if ((existingCard as any).bannerImage) {
        try {
          const publicId = (existingCard as any).bannerImage.split('/').slice(-2).join('/').split('.')[0];
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.error('Error deleting old banner image:', err);
        }
      }

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

      updateData.bannerImage = signedUrl;
    }

    // Handle cover image upload
    const coverImageFile = formData.get('coverImage') as File;
    if (coverImageFile && coverImageFile.size > 0) {
      // Delete old image if exists (only relevant for legacy Cloudinary URLs)
      if (existingCard.coverImage) {
        try {
          const publicId = existingCard.coverImage.split('/').slice(-2).join('/').split('.')[0];
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.error('Error deleting old cover image:', err);
        }
      }

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

      updateData.coverImage = signedUrl;
    }

    // Best-effort: sync basic contact info from card into user profile
    try {
      const profileUpdateData: any = {};
      if (updateData.phone !== undefined) profileUpdateData.phone = updateData.phone;
      if (updateData.location !== undefined) profileUpdateData.location = updateData.location;
      if (updateData.fullName !== undefined) profileUpdateData.fullName = updateData.fullName;

      if (Object.keys(profileUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: decoded.userId },
          data: profileUpdateData,
        });
      }
    } catch (err) {
      console.error('Failed to sync user profile from card data on update:', err);
    }

    // Debug: Log catalog fields being saved
    console.log('[UPDATE] Catalog fields in updateData:', {
      showCatalog: updateData.showCatalog,
      catalogTitle: updateData.catalogTitle,
      catalogItems: updateData.catalogItems ? updateData.catalogItems.substring(0, 200) : 'NOT SET',
    });

    // Update card
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      message: 'Card updated successfully',
      card: updatedCard
    });

  } catch (error: any) {
    console.error("Error updating card:", error);
    return NextResponse.json({
      error: error.message || "Failed to update card"
    }, { status: 500 });
  }
}

// DELETE card
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const { id: cardId } = await params;

    // Find existing card
    const existingCard: any = await prisma.card.findUnique({
      where: { id: cardId }
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Verify ownership
    if (existingCard.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Not authorized to delete this card' }, { status: 403 });
    }

    // Delete images from Cloudinary
    const deletePromises = [];

    if (existingCard.profileImage) {
      try {
        const publicId = existingCard.profileImage.split('/').slice(-2).join('/').split('.')[0];
        deletePromises.push(deleteFromCloudinary(publicId));
      } catch (err) {
        console.error('Error deleting profile image:', err);
      }
    }

    if (existingCard.bannerImage) {
      try {
        const publicId = existingCard.bannerImage.split('/').slice(-2).join('/').split('.')[0];
        deletePromises.push(deleteFromCloudinary(publicId));
      } catch (err) {
        console.error('Error deleting banner image:', err);
      }
    }

    if (existingCard.coverImage) {
      try {
        const publicId = existingCard.coverImage.split('/').slice(-2).join('/').split('.')[0];
        deletePromises.push(deleteFromCloudinary(publicId));
      } catch (err) {
        console.error('Error deleting cover image:', err);
      }
    }

    await Promise.allSettled(deletePromises);

    // Delete card from database
    await prisma.card.delete({
      where: { id: cardId }
    });

    return NextResponse.json({
      success: true,
      message: 'Card deleted successfully'
    });

  } catch (error: any) {
    console.error("Error deleting card:", error);
    return NextResponse.json({
      error: error.message || "Failed to delete card"
    }, { status: 500 });
  }
}