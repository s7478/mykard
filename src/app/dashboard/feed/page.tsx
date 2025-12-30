"use client";

import React, { useState, useEffect } from "react";
import { CreatePostWidget, SuggestedUsersWidget } from "@/components/feed/FeedWidgets";
import FeedStream from "@/components/feed/FeedStream"; 
// 🟢 IMPORT STORY BAR
import StoryBar from "@/components/feed/StoryBar"; 

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
    <div className="min-h-screen bg-[#F3F4F6] px-4 py-8 flex justify-center">
        <main className="flex flex-col gap-6 w-full lg:w-7/12 mx-auto">
          
          {/* 1. Create Post Widget */}
          <CreatePostWidget currentUser={currentUser} />

          {/* 🟢 2. Story Bar (Placed after Create Post as requested) */}
          <StoryBar currentUser={currentUser} />
          
          {/* 3. Feed Stream */}
          <FeedStream filter="all" currentUser={currentUser} />
          
          {/* 4. Suggestions */}
          <SuggestedUsersWidget currentUserId={currentUser?.id} />
          
        </main>
    </div>
  );
}