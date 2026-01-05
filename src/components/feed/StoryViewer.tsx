"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: any[]; // Array of story objects for THIS user
  user: any; // The user whose stories we are watching
}

export default function StoryViewer({ isOpen, onClose, stories, user }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Handle Auto-Advance & Progress Bar
  useEffect(() => {
    if (!isOpen || !stories || stories.length === 0) return;

    setProgress(0);
    // Reset index when opening a new user
    setCurrentIndex(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Time's up for this slide
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0; 
          } else {
            onClose(); // Close if no more stories
            return 100;
          }
        }
        return prev + 1.5; // Speed of progress (approx 6-7 seconds)
      });
    }, 100); 

    // API Call: Mark as Viewed
    const currentStory = stories[currentIndex];
    if (currentStory) {
      fetch("/api/stories/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: currentStory.id }),
      }).catch(console.error);
    }

    return () => clearInterval(interval);
  }, [currentIndex, isOpen, stories, onClose]); // Added dependencies for safety

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  if (!isOpen || !stories.length) return null;

  const activeStory = stories[currentIndex];
  // Determine if video based on URL extension
  const isVideo = activeStory.imageUrl?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-50 p-2 bg-black/20 rounded-full">
        <X size={24} />
      </button>

      <div className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-xl overflow-hidden bg-gray-900">
        
        {/* Progress Bars */}
        <div className="absolute top-4 left-0 right-0 z-20 flex gap-1 px-2">
          {stories.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded overflow-hidden">
              <div 
                className={`h-full bg-white transition-all duration-100 ease-linear`}
                style={{ 
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="absolute top-8 left-4 z-20 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/50">
            {user?.profileImage ? (
              <Image src={user.profileImage} alt={user.fullName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-500" />
            )}
          </div>
          <span className="text-white font-semibold text-sm drop-shadow-md">{user?.fullName}</span>
        </div>

        {/* Content */}
        <div className="w-full h-full flex items-center justify-center bg-black">
          {isVideo ? (
            <video 
              src={activeStory.imageUrl} 
              autoPlay 
              playsInline
              className="w-full h-full object-contain" 
            />
          ) : (
            <div className="relative w-full h-full">
              <Image 
                src={activeStory.imageUrl} 
                alt="Story" 
                fill 
                className="object-contain" 
                priority 
              />
            </div>
          )}
        </div>

        {/* Click Zones for Navigation */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={handleNext} />
      </div>
    </div>
  );
}