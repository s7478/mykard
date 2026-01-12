"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoryViewer from "@/components/feed/StoryViewer"; // Adjust path
import { Loader2 } from "lucide-react";

export default function SingleStoryPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params?.id as string;

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!storyId) return;

    // Fetch the specific story
    const fetchStory = async () => {
      try {
        const res = await fetch(`/api/stories/single?id=${storyId}`);
        if (!res.ok) throw new Error("Story not found");
        const data = await res.json();
        setStory(data.story);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <p>Story unavailable or expired.</p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="mt-4 rounded-full bg-white px-6 py-2 text-sm font-bold text-black"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black h-screen w-full">
      <StoryViewer 
        isOpen={true} 
        onClose={() => router.push("/dashboard")} 
        stories={[story]} // Pass as array of 1
        user={story.author} 
      />
    </div>
  );
}