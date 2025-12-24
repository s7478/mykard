"use client";

import React from "react";
import { ProfileWidget, MenuWidget } from "@/components/feed/LeftWidgets";
import { PromoBanner, PostCard, TopDesignersWidget } from "@/components/feed/FeedWidgets";
import { StatsWidget, PeopleSuggestions } from "@/components/feed/RightWidgets";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] px-6 py-8">
      <div className="max-w-1200px mx-auto">
        <div className="grid grid-cols-12 gap-6">

          {/* LEFT */}
          <aside className="hidden lg:block col-span-3 space-y-6">
            <ProfileWidget />
            <MenuWidget />
          </aside>

          {/* CENTER */}
          <main className="col-span-12 lg:col-span-6 space-y-6">
            <PromoBanner />
            <PostCard />
            <PostCard />
            <TopDesignersWidget />
          </main>

          {/* RIGHT */}
          <aside className="hidden xl:block col-span-3 space-y-6">
            <StatsWidget />
            <PeopleSuggestions />
          </aside>

        </div>
      </div>
    </div>
  );
}
