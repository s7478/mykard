import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params;

        if (!postId) {
            return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
        }

        const likes = await prisma.like.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        title: true,
                        profileImage: true,
                        username: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const users = likes.map(like => like.user);

        return NextResponse.json({ success: true, users });
    } catch (error: any) {
        console.error("Error fetching post likes:", error);
        return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 });
    }
}
