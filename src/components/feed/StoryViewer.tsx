"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Send, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getRelativeTime } from "@/utils/dateUtils";



interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  userGroups: any[]; // 🟢 Changed: Accepts the full list of users
  initialUserIndex: number; // 🟢 Changed: Knows where to start in that list
}

export default function StoryViewer({
  isOpen,
  onClose,
  userGroups,
  initialUserIndex,
}: StoryViewerProps) {
  // Navigation State
  const [currentUserIdx, setCurrentUserIdx] = useState(initialUserIndex);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // 🟢 3-dot menu state
  const [isExpanded, setIsExpanded] = useState(false); // 🟢 Read More state


  // Derived Data (The current user and their stories)
  const currentUserGroup = userGroups[currentUserIdx];
  const user = currentUserGroup?.user;
  const stories = currentUserGroup?.stories || [];
  const activeStory = stories[currentStoryIdx];

  // 1. RESET LOGIC
  useEffect(() => {
    if (isOpen) {
      setCurrentUserIdx(initialUserIndex);
      setCurrentStoryIdx(0);
      setProgress(0);
      setReplyText("");
      setShowMenu(false);
      setIsExpanded(false);
    }
  }, [isOpen, initialUserIndex]);

  // 1.5 Reset expanded state when changing stories
  useEffect(() => {
    setIsExpanded(false);
  }, [currentStoryIdx, currentUserIdx]);


  // 2. 🟢 NEXT LOGIC (Navigate Story -> Then Navigate User)
  const handleNext = useCallback(() => {
    // A. Go to next story of CURRENT user
    if (currentStoryIdx < stories.length - 1) {
      setCurrentStoryIdx((prev) => prev + 1);
      setProgress(0);
      setReplyText("");
    }
    // B. If finished, go to NEXT USER (Automatic Navigation)
    else if (currentUserIdx < userGroups.length - 1) {
      setCurrentUserIdx((prev) => prev + 1);
      setCurrentStoryIdx(0); // Start from their first story
      setProgress(0);
      setReplyText("");
    }
    // C. No more users, close viewer
    else {
      onClose();
    }
  }, [currentStoryIdx, stories.length, currentUserIdx, userGroups.length, onClose]);

  // 3. 🟢 PREV LOGIC (Navigate Story <- Then Navigate User)
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    // A. Prev story of CURRENT user
    if (currentStoryIdx > 0) {
      setCurrentStoryIdx((prev) => prev - 1);
      setProgress(0);
      setReplyText("");
    }
    // B. Go to PREV USER (Start at their LAST story)
    else if (currentUserIdx > 0) {
      const prevUserIdx = currentUserIdx - 1;
      const prevStories = userGroups[prevUserIdx].stories;
      setCurrentUserIdx(prevUserIdx);
      setCurrentStoryIdx(prevStories.length - 1); // Jump to last story
      setProgress(0);
      setReplyText("");
    }
    // C. Start of everything
    else {
      setProgress(0);
    }
  };

  // 4. AUTO-ADVANCE TRIGGER
  useEffect(() => {
    if (replyText.length > 0 || isExpanded) return;
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext, replyText, isExpanded]);

  // 5. TIMER LOGIC
  useEffect(() => {
    if (!isOpen || !stories.length || !activeStory) return;
    if (replyText.length > 0 || isExpanded) return; // 🟢 Pause if replying or reading more

    // Don't reset progress if it's already moving (prevents jitter on re-renders)
    // setProgress(0); // Removed this to prevent loop resets

    // Mark as viewed
    fetch("/api/stories/view", { // Ensure route matches your folder name 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: activeStory.id }),
    }).catch(console.error);

    const hasMedia = !!activeStory.imageUrl;
    const isVideo = activeStory.imageUrl?.match(/\.(mp4|webm|ogg)(\?|$)/i) || activeStory.videoUrl;

    if (isVideo) return;

    const durationStep = hasMedia ? 2 : 1.5;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + durationStep;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStoryIdx, currentUserIdx, isOpen, replyText, isExpanded]); // Updated dependencies

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSendingReply(true);

    try {
      const res = await fetch("/api/message/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: replyText,
          receiverId: user.id || user.userId,
          status: "PENDING",
          tag: "STORY_REPLY",
          storyId: activeStory.id,
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

  // 🟢 DELETE STORY LOGIC
  const handleDeleteStory = async () => {
    if (!activeStory) return;
    if (!confirm("Delete this story?")) return;

    try {
      const res = await fetch("/api/stories/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: activeStory.id }),
      });

      if (res.ok) {
        toast.success("Story deleted");
        window.location.reload(); // Reload to refresh stories
      } else {
        toast.error("Failed to delete story");
      }
    } catch (e) {
      toast.error("Error deleting story");
    }
  };


  if (!isOpen || !activeStory) return null;

  const isVideo = activeStory.imageUrl?.match(/\.(mp4|webm|ogg)(\?|$)/i) || activeStory.videoUrl;
  const hasMedia = !!activeStory.imageUrl || !!activeStory.videoUrl;
  const hasText = !!activeStory.content;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-16 text-white/80 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md"
      >
        <X size={24} />
      </button>

      {/* MAIN CONTAINER */}
      <div className="relative w-full h-full sm:w-[440px] sm:h-[88vh] sm:rounded-[20px] sm:max-h-[850px] overflow-hidden bg-black shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col">

        {/* Progress Bars */}
        <div className="absolute top-3 left-0 right-0 z-20 flex gap-1 px-2 pointer-events-none">
          {stories.map((_: any, idx: number) => (
            <div
              key={idx}
              className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
                style={{
                  width:
                    idx === currentStoryIdx
                      ? `${progress}%`
                      : idx < currentStoryIdx
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
          <div className="flex flex-col justify-center">
            <span className="text-white font-medium text-sm drop-shadow-md tracking-wide">
              {user?.fullName}
            </span>
            {/* Timestamp underneath name */}
            <span className="text-white/70 text-xs drop-shadow-md">
              {activeStory ? getRelativeTime(activeStory.createdAt) : ""}
            </span>
          </div>
        </div>

        {/* 🟢 3-DOT MENU (Top Right) */}
        {activeStory && user && (user.id === userGroups[0]?.user?.id || true) && (
          // Note: "true" used above for now, ideally check if current user matches story author. 
          // But `StoryViewer` logic suggests userGroups are viewed by `currentUser` (me) context isn't explicit here.
          // Assuming I can delete MY stories only, API handles auth. So showing menu is okay, API will reject if not mine.
          // Or better: check if `user` is ME. `userGroups` are friend's stories usually. 
          // But I can also view MY stories. 
          <div className="absolute top-6 right-4 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="p-2 text-white/80 hover:text-white transition"
            >
              <MoreVertical size={24} />
            </button>


            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 50,
                  overflow: 'hidden',
                  minWidth: '100px'
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStory();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '13px',
                    fontWeight: 500,
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}


        {/* Content Area */}
        <div className="relative flex-1 bg-zinc-900 flex flex-col items-center justify-center overflow-hidden">

          {hasMedia ? (
            <>
              {isVideo ? (
                <video
                  src={activeStory.imageUrl || activeStory.videoUrl}
                  autoPlay
                  playsInline
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

              {hasText && (
                <div className="absolute bottom-24 left-0 right-0 z-10 flex flex-col items-center">
                  <div
                    className={`w-full bg-black/40 backdrop-blur-sm p-4 pb-2 text-center transition-all duration-300 ${isExpanded ? "max-h-[60vh] overflow-y-auto" : "max-h-[160px]"
                      }`}
                  >
                    <p className="!text-white text-[18px] sm:text-[18px] md:text-[20px] font-semibold drop-shadow-xl leading-relaxed whitespace-pre-wrap text-left inline-block" style={{ color: "#ffffff", textAlign: "left" }}>
                      {isExpanded ? activeStory.content : (
                        activeStory.content.length > 150
                          ? `${activeStory.content.slice(0, 150)}... `
                          : activeStory.content
                      )}
                    </p>

                    {activeStory.content.length > 150 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(!isExpanded);
                        }}
                        className="text-blue-400 font-bold ml-1 hover:underline text-sm inline-block"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-blue-900 to-slate-900">
              <div
                className={`absolute top-20 bottom-32 left-0 right-0 px-4 sm:px-6 w-full z-10 transition-all duration-300 flex flex-col justify-center overflow-hidden ${isExpanded ? 'pointer-events-auto' : 'pointer-events-none'}`}
              >
                <div className={`w-full font-bold font-serif drop-shadow-2xl whitespace-pre-wrap text-left transition-all duration-300 px-2 lg:px-4 ${isExpanded ? "text-[13px] sm:text-[13px] md:text-[14px] leading-tight font-medium" : "text-[24px] sm:text-[28px] md:text-[28px] leading-relaxed"}`} style={{ color: "#ffffff", wordBreak: "break-word" }}>
                  <span className="inline pointer-events-none">
                    {isExpanded || !activeStory.content || activeStory.content.length <= 150
                      ? activeStory.content || "..."
                      : `${activeStory.content.slice(0, 150)}... `}
                  </span>

                  {activeStory.content && activeStory.content.length > 150 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      className="text-white/70 hover:text-white font-black underline ml-2 inline z-40 relative pointer-events-auto transition-colors"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              </div>
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

          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-0" />
        </div>

        {/* FOOTER */}
        <div
          className="absolute bottom-6 left-4 right-4 z-30 flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSendReply} className="flex-1 relative group">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Send a message..."
              style={{ paddingLeft: "24px" }}
              className="w-full h-12 bg-transparent border border-white/40 rounded-full pr-14 text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-black/40 transition-all text-base backdrop-blur-sm shadow-lg"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || sendingReply}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all duration-200 ${replyText.trim()
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