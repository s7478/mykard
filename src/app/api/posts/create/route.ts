import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // 1. Destructure all possible fields sent from frontend
    const { content, imageUrl, videoUrl, visibility, isStory } = await req.json();

    // 2. Validation: Must have some content or media
    if (!content && !imageUrl && !videoUrl) {
      return NextResponse.json({ error: "Post/Story cannot be empty" }, { status: 400 });
    }

    // 3. HANDLE STORY CREATION
    if (isStory) {
      // Calculate 24-hour expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const story = await prisma.story.create({
        data: {
          imageUrl: imageUrl || "", // Stories usually require media
          videoUrl: videoUrl || null,
          authorId: decoded.userId,
          expiresAt: expiresAt,
          // Note: Stories usually don't have "content" text in your schema, 
          // or 'visibility' (usually visible to connections by default), 
          // adjust if your schema differs.
        },
      });
      return NextResponse.json({ success: true, type: 'story', data: story });
    }

    // 4. HANDLE REGULAR POST CREATION
    // Note: If your Post model doesn't have 'videoUrl', we save video in 'imageUrl' 
    // or you need to add 'videoUrl' to your Post model.
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || videoUrl, // Fallback if Post model lacks videoUrl
        // videoUrl: videoUrl, // Uncomment if you added videoUrl to Post model
        visibility: visibility || "public", // Default to public
        authorId: decoded.userId,
      },
    });

    return NextResponse.json({ success: true, type: 'post', data: post });

  } catch (error: any) {
    console.error("Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}