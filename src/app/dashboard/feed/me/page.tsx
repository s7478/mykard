"use client";
import React, { useState, useEffect } from "react";
import FeedStream from "@/components/feed/FeedStream";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MyPostsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/user/me").then(res => res.json()).then(data => setCurrentUser(data.user));
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] px-4 py-8 flex justify-center">
      <div className="flex flex-col gap-6 w-full max-w-[500px]">
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <Link href="/dashboard/feed" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></Link>
          <h1 className="text-lg font-bold">My Posts</h1>
        </div>
        <FeedStream filter="mine" currentUser={currentUser} />
      </div>
    </div>
  );
}