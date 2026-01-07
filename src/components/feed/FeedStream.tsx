"use client";
import React, { useEffect, useState } from "react";
import { PostCard } from "./FeedWidgets";
import { Loader2 } from "lucide-react";

interface FeedStreamProps {
  filter?: "mine" | "saved" | "like" | "all"; 
  currentUser: any;
}

export default function FeedStream({ filter = "all", currentUser }: FeedStreamProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to refresh posts (passed to CreatePostWidget later)
  const refreshFeed = async () => {
    setLoading(true);
    try {
      let url = "/api/feed";
      if (filter === "mine") url += "?filter=mine";
      if (filter === "saved") url += "?filter=saved";
      if (filter === "like") url += "?filter=like";

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPosts(data.posts);
    } catch (error) {
      console.error("Failed to load feed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFeed();
  }, [filter]);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        {filter === "saved" ? "No saved posts yet." : "No posts found."}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {posts.map((post) => (
        <PostCard key={post.id} currentUser={currentUser} postData={post} />
      ))}
    </div>
  );
}