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
    <div className="min-h-screen px-4 py-8 flex justify-center">
        <main className="flex flex-col w-full lg:w-7/12 mx-auto">
          
          {/* 1. Create Post Widget */}
          <CreatePostWidget currentUser={currentUser} />

          {/* 🟢 2. Story Bar (Placed after Create Post as requested) */}
          <StoryBar currentUser={currentUser} />
          
          {/* 3. Feed Stream */}
          <FeedStream filter="all" currentUser={currentUser} />

          <div className="h-15 lg:h-0 w-full flex-shrink-0" />
          
        </main>
    </div>
  );
}