"use client";

import React from "react";
import { useState, useEffect } from "react";
import {PostCard, SuggestedUsersWidget, CreatePost } from "@/components/feed/FeedWidgets";

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
    <div className="min-h-screen bg-[#F3F4F6] px-6 py-8">
      <div 
        className="flex w-auto m-auto justify-center gap-8"
      >
        <main className="flex flex-col gap-6 overflow-hidden">
          <CreatePost currentUser={currentUser} />
          <PostCard currentUser={currentUser} />
          <PostCard currentUser={currentUser} />
          <SuggestedUsersWidget currentUserId={currentUser?.id} />
        </main>
      </div>
    </div>
  );
}