import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// PATCH - Accept or reject connection request
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("user_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    const params = await context.params;
    const requestId = params.id;
    const { action } = await req.json(); // "accept" or "reject"

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    // Find the connection request
    const connectionRequest = await prisma.connection.findUnique({
      where: { id: requestId },
    });

    if (!connectionRequest) {
      return NextResponse.json(
        { error: "Connection request not found" },
        { status: 404 }
      );
    }

    // Only receiver can accept/reject
    if (connectionRequest.receiverId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to modify this request" },
        { status: 403 }
      );
    }

    // Update the request status
    const updatedRequest = await prisma.connection.update({
      where: { id: requestId },
      data: {
        status: action === "accept" ? "ACCEPTED" : "REJECTED",
      },
    });

    // Connection status is already updated above - no need for additional user table updates
    // The Connection model handles the relationship through proper foreign keys

    return NextResponse.json({
      message: `Connection request ${action}ed`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating connection request:", error);
    return NextResponse.json(
      { error: "Failed to update connection request" },
      { status: 500 }
    );
  }
}

// DELETE - Remove connection (handles both Connection ID and User ID)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("user_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    const params = await context.params;
    const targetId = params.id; // This could be Connection ID OR User ID

    // 1. First, try to find the connection directly by ID (Dashboard scenario)
    let connectionRequest = await prisma.connection.findUnique({
      where: { id: targetId },
    });

    // 2. If NOT found by ID, assume 'targetId' is a User ID and look for the relationship (PostCard scenario)
    if (!connectionRequest) {
      connectionRequest = await prisma.connection.findFirst({
        where: {
          OR: [
            // Case A: I sent the request, they received it
            { senderId: userId, receiverId: targetId },
            // Case B: They sent the request, I received it
            { senderId: targetId, receiverId: userId },
          ],
        },
      });
    }

    if (!connectionRequest) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Only involved users can remove connection (Security Check)
    if (
      connectionRequest.senderId !== userId &&
      connectionRequest.receiverId !== userId
    ) {
      return NextResponse.json(
        { error: "Unauthorized to remove this connection" },
        { status: 403 }
      );
    }

    // Delete the connection request using the actual Connection ID found
    await prisma.connection.delete({
      where: { id: connectionRequest.id },
    });

    return NextResponse.json({
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Error removing connection:", error);
    return NextResponse.json(
      { error: "Failed to remove connection" },
      { status: 500 }
    );
  }
}