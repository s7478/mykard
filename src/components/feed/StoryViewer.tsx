"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Send, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: any[];
  user: any;
}

export default function StoryViewer({
  isOpen,
  onClose,
  stories,
  user,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // 1. RESET LOGIC
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setProgress(0);
      setReplyText("");
    }
  }, [isOpen, user]);

  // 2. NEXT STORY LOGIC
  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      setReplyText("");
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  // 3. PREV STORY LOGIC
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setReplyText("");
    }
  };

  // 4. AUTO-ADVANCE TRIGGER
  useEffect(() => {
    if (replyText.length > 0) return;
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext, replyText]);

  // 5. TIMER LOGIC
  useEffect(() => {
    if (!isOpen || !stories.length) return;
    if (replyText.length > 0) return;

    setProgress(0);

    const activeStory = stories[currentIndex];
    if (!activeStory) return;

    // Mark as viewed
    fetch("/api/stories/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: activeStory.id }),
    }).catch(console.error);

    const hasMedia = !!activeStory.imageUrl;
    const isVideo = activeStory.imageUrl?.match(/\.(mp4|webm|ogg)(\?|$)/i) || activeStory.videoUrl;

    if (isVideo) return;

    // Determine duration based on content type
    const durationStep = hasMedia ? 2 : 1.5; // Text stories read faster, adjust as needed

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + durationStep;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isOpen, stories, replyText]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const activeStory = stories[currentIndex];
    setSendingReply(true);

    try {
      const res = await fetch("/api/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        // 🟢 INSTAGRAM STYLE REPLY PAYLOAD
        body: JSON.stringify({
          message: replyText, // Clean text
          receiverId: user.id || user.userId,
          status: "PENDING",
          tag: "STORY_REPLY", // Special tag
          storyId: activeStory.id, // Link to story
        }),
      });

      if (res.ok) {
        toast.success("Reply sent!");
        setReplyText("");
      } else {
        toast.error("Failed to send reply");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending reply");
    } finally {
      setSendingReply(false);
    }
  };

  if (!isOpen || !stories.length) return null;
  const activeStory = stories[currentIndex];
  if (!activeStory) return null;

  const isVideo = activeStory.imageUrl?.match(/\.(mp4|webm|ogg)(\?|$)/i) || activeStory.videoUrl;
  const hasMedia = !!activeStory.imageUrl;
  const hasText = !!activeStory.content;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/80 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md"
      >
        <X size={24} />
      </button>

      {/* MAIN CONTAINER */}
      <div className="relative w-full h-full md:w-[400px] md:h-[85vh] md:max-h-[850px] overflow-hidden bg-black shadow-2xl border border-white/10 flex flex-col">
        
        {/* Progress Bars */}
        <div className="absolute top-3 left-0 right-0 z-20 flex gap-1 px-2 pointer-events-none">
          {stories.map((_, idx) => (
            <div
              key={idx}
              className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
                style={{
                  width:
                    idx === currentIndex
                      ? `${progress}%`
                      : idx < currentIndex
                      ? "100%"
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="absolute top-6 left-4 z-20 flex items-center gap-3 pointer-events-none">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/30 bg-gray-800">
            {user?.profileImage ? (
              <Image
                src={user.profileImage}
                alt={user.fullName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                {user?.fullName?.[0]}
              </div>
            )}
          </div>
          <span className="text-white font-medium text-sm drop-shadow-md tracking-wide">
            {user?.fullName}
          </span>
        </div>

        {/* 🟢 Content Area - Centered Flex Container */}
        <div className="relative flex-1 bg-zinc-900 flex flex-col items-center justify-center overflow-hidden">
          
          {hasMedia ? (
            // CASE 1: MEDIA EXISTS (Image or Video)
            <>
              {isVideo ? (
                <video
                  src={activeStory.imageUrl}
                  autoPlay
                  playsInline
                  muted={false} // Note: Browsers may block unmuted autoplay
                  onEnded={handleNext}
                  onTimeUpdate={(e) => {
                    if (replyText.length > 0) return;
                    const duration = e.currentTarget.duration;
                    const currentTime = e.currentTarget.currentTime;
                    if (duration > 0) {
                      setProgress((currentTime / duration) * 100);
                    }
                  }}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activeStory.imageUrl}
                  alt="Story"
                  className="w-full h-full object-contain"
                />
              )}
              
              {/* Overlay Text at Bottom if Media exists */}
              {hasText && (
                <div className="absolute bottom-32 left-4 right-4 z-10 text-center">
                   <p className="text-white text-lg font-medium drop-shadow-md bg-black/30 p-2 rounded-lg inline-block">
                     {activeStory.content}
                   </p>
                </div>
              )}
            </>
          ) : (
            // CASE 2: TEXT ONLY (Centered)
            <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-blue-900 to-slate-900 text-center">
               <p className=" text-2xl font-bold font-serif leading-relaxed drop-shadow-xl" style={{ color: "#ffffff" }}>
                 {activeStory.content || "..."}
               </p>
            </div>
          )}

          {/* Navigation Click Zones */}
          <div 
            className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" 
            onClick={handlePrev} 
          />
          <div 
            className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); handleNext(); }} 
          />

          {/* Gradient Overlay for Footer Visibility */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-0" />
        </div>

        {/* FOOTER */}
        <div
          className="absolute bottom-6 left-4 right-4 z-30 flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="flex-1 relative group">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Send a message..."
              // 🟢 Using inline style for guaranteed spacing (24px from left)
              style={{ paddingLeft: "24px" }}
              className="w-full h-12 bg-transparent border border-white/40 rounded-full pr-14 text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-black/40 transition-all text-base backdrop-blur-sm shadow-lg"
            />

            {/* Send Button inside Input */}
            <button
              type="submit"
              disabled={!replyText.trim() || sendingReply}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all duration-200 ${
                replyText.trim()
                  ? "text-white hover:bg-white/20 active:scale-95"
                  : "text-white/30 cursor-not-allowed"
              }`}
            >
              {sendingReply ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}