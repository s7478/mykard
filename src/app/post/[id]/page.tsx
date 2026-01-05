import React from "react";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/feed/FeedWidgets";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Server Action to fetch data
async function getPostData(postId: string, currentUserId: string) {
  // 1. Fetch Post
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, fullName: true, username: true, profileImage: true, title: true },
      },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: currentUserId }, select: { userId: true } },
      savedBy: { where: { userId: currentUserId }, select: { userId: true } },
    },
  });

  if (!post) return null;

  // 2. Check Connection Status (To show/hide Connect button)
  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: post.authorId },
        { senderId: post.authorId, receiverId: currentUserId }
      ],
      status: "ACCEPTED"
    }
  });

  // 3. Format Data for PostCard
  return {
    ...post,
    isLiked: post.likes.length > 0,
    isSaved: post.savedBy.length > 0,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    // Connected if: Connection exists OR it's my own post
    isConnected: !!connection || post.authorId === currentUserId 
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. Auth Check
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;
  
  if (!token) redirect("/auth/login");

  let currentUser;
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, fullName: true, profileImage: true }
    });
  } catch (e) {
    redirect("/auth/login");
  }

  // 2. Fetch Data
  const postData = await getPostData(id, currentUser?.id!);

  if (!postData) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4">
      
      {/* Back Button */}
      <div className="w-full max-w-xl mb-4">
        <Link 
          href="/dashboard/feed" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Feed
        </Link>
      </div>

      {/* The Post */}
      <div className="w-full max-w-xl">
        <PostCard currentUser={currentUser} postData={postData} />
      </div>
    </div>
  );
}