"use client";

import React, { useState, useEffect } from "react";
import { CreatePostWidget, SuggestedUsersWidget } from "@/components/feed/FeedWidgets";
import FeedStream from "@/components/feed/FeedStream"; 

export default function FeedPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (e) {}
    };
    fetchMe();
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] px-6 py-8 ">
      <div className="flex w-auto m-auto justify-center gap-8">
        <main className="flex flex-col gap-6 overflow-hidden">
          
          {/* 1. Create Post Widget */}
          <CreatePostWidget currentUser={currentUser} />
          
          {/* 2. Feed Stream (Fetches and renders PostCards automatically) */}
          <FeedStream filter="all" currentUser={currentUser} />
          
          {/* 3. Suggestions */}
          <SuggestedUsersWidget currentUserId={currentUser?.id} />
          
        </main>
      </div>
    </div>
  );
}