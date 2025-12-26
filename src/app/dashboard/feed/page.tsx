"use client";

import React from "react";
import { PromoBanner, PostCard, TopDesignersWidget } from "@/components/feed/FeedWidgets";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] px-6 py-8">
      <div 
        className="flex w-auto m-auto justify-center gap-8"
      >
        <main className="flex flex-col gap-6 overflow-hidden">
          <PromoBanner />
          <PostCard />
          <PostCard />
          <TopDesignersWidget />
        </main>
      </div>
    </div>
  );
}