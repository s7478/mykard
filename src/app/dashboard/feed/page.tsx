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
      } catch (e) { }
    };
    fetchMe();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 flex justify-center">
      <style>{`
        @media (max-width: 640px) {
          .feed-mobile-padding {
            padding-left: 12px;
            padding-right: 4px;
          }
        }
      `}</style>
      <main className="flex flex-col w-full lg:w-7/12 mx-auto feed-mobile-padding">

        {/* 1. Create Post Widget */}
        <CreatePostWidget currentUser={currentUser} />


        {/* StoryBar and FeedStream unified visually */}
        <div className="flex flex-col w-full">
          <StoryBar currentUser={currentUser} />
          <FeedStream filter="all" currentUser={currentUser} />
        </div>

        <div className="h-24 lg:h-0 w-full flex-shrink-0" />


      </main>
    </div>
  );
}