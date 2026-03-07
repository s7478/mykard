import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        // Extract user ID from middleware headers (if available)
        const userId = req.headers.get('x-user-id');

        // Build base where clause for users
        const where: any = {};

        // When authenticated, exclude the requesting user from the results
        if (userId) {
            where.NOT = {
                id: userId,
            };
        }

        // Fetch all users (excluding current user if logged in)
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                fullName: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                phone: true,
                title: true,
                company: true,
                location: true,
                profileImage: true,
                views: true,
                createdAt: true,
                updatedAt: true,
                cards: {
                    select: { skills: true }
                }
            }
        });

        return NextResponse.json({ ok: true, users, isAuthenticated: !!userId });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ ok: false, error: "Failed to fetch users" }, { status: 500 });
    }
}
