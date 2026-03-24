import React from "react";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/feed/FeedWidgets";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

// Server Action to fetch data
async function getPostData(postId: string, currentUserId?: string) {
  // 1. Fetch Post
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, fullName: true, username: true, profileImage: true, title: true },
      },
      _count: { select: { likes: true, comments: true } },
      likes: currentUserId
        ? { where: { userId: currentUserId }, select: { userId: true } }
        : false,
      savedBy: currentUserId
        ? { where: { userId: currentUserId }, select: { userId: true } }
        : false,
    },
  });

  if (!post) return null;

  // 2. Check Connection Status (To show/hide Connect button)
  let connection: { id: string } | null = null;
  if (currentUserId && currentUserId !== post.authorId) {
    connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: post.authorId },
          { senderId: post.authorId, receiverId: currentUserId },
        ],
        status: "ACCEPTED",
      },
      select: { id: true },
    });
  }

  const canViewConnectionsOnly =
    !!currentUserId && (post.authorId === currentUserId || !!connection);
  if (post.visibility === "connections" && !canViewConnectionsOnly) {
    return null;
  }

  const likedEntries = Array.isArray((post as any).likes) ? (post as any).likes : [];
  const savedEntries = Array.isArray((post as any).savedBy) ? (post as any).savedBy : [];

  // 3. Format Data for PostCard
  return {
    ...post,
    isLiked: likedEntries.length > 0,
    isSaved: savedEntries.length > 0,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    // Connected if: Connection exists OR it's my own post
    isConnected: !!connection || (currentUserId ? post.authorId === currentUserId : false),
  };
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function getOgImage(imageUrl?: string | null) {
  const baseUrl = getBaseUrl();
  const fallback = `${baseUrl}/assets/my1.png`;
  if (!imageUrl) return fallback;
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(imageUrl)) return fallback;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  return `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      visibility: true,
      author: { select: { fullName: true } },
    },
  });

  if (!post || post.visibility !== "public") {
    return {
      title: "Post | MyKard",
      description: "Shared post on MyKard",
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getBaseUrl();
  const postUrl = `${baseUrl}/post/${post.id}`;
  const raw = (post.content || "Shared a post on MyKard").replace(/\s+/g, " ").trim();
  const description = raw.length > 160 ? `${raw.slice(0, 157)}...` : raw;
  const title = `${post.author.fullName} on MyKard`;
  const image = getOgImage(post.imageUrl);

  return {
    title,
    description,
    alternates: { canonical: postUrl },
    openGraph: {
      type: "article",
      url: postUrl,
      title,
      description,
      siteName: "MyKard",
      images: [{ url: image, width: 1200, height: 630, alt: "MyKard shared post" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Auth is optional so link-preview crawlers can access this page metadata.
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;

  let currentUser: { id: string; fullName: string | null; profileImage: string | null } | null = null;
  if (token) {
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
      currentUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, fullName: true, profileImage: true },
      });
    } catch {
      currentUser = null;
    }
  }

  // 2. Fetch Data
  const postData = await getPostData(id, currentUser?.id);

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