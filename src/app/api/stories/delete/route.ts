import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("user_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };

        // Expecting body with storyId
        const { storyId } = await req.json();
        if (!storyId) return NextResponse.json({ error: "Story ID required" }, { status: 400 });

        // 1. Verify Ownership
        const story = await prisma.story.findUnique({
            where: { id: storyId },
        });

        if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

        if (story.authorId !== decoded.userId) {
            return NextResponse.json({ error: "Forbidden: You can only delete your own stories" }, { status: 403 });
        }

        // 2. Delete
        await prisma.story.delete({
            where: { id: storyId },
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
