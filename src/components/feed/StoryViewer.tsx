"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Send, Loader2, MoreVertical, Trash2, Volume2, VolumeX, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { getRelativeTime } from "@/utils/dateUtils";

const formatViewerTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  let timeString = date.toLocaleTimeString('en-US', timeOptions).toLowerCase(); // Ensure "am/pm" instead of "AM/PM" if locale does it uppercase

  if (isToday) return `Today, ${timeString}`;
  if (isYesterday) return `Yesterday, ${timeString}`;
  return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${timeString}`;
};

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  userGroups: any[]; // 🟢 Changed: Accepts the full list of users
  initialUserIndex: number; // 🟢 Changed: Knows where to start in that list
  currentUser?: any; // To identify if looking at own story
}

export default function StoryViewer({
  isOpen,
  onClose,
  userGroups,
  initialUserIndex,
  currentUser,
}: StoryViewerProps) {
  // Navigation State
  const [currentUserIdx, setCurrentUserIdx] = useState(initialUserIndex);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // 🟢 3-dot menu state
  const [isExpanded, setIsExpanded] = useState(false); // 🟢 Read More state
  const [isMuted, setIsMuted] = useState(false); // 🟢 Explicit audio master switch
  const [showViewersList, setShowViewersList] = useState(false); // 🟢 Views modal state
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  // Derived Data (The current user and their stories)
  const currentUserGroup = userGroups[currentUserIdx];
  const user = currentUserGroup?.user;
  const stories = currentUserGroup?.stories || [];
  const activeStory = stories[currentStoryIdx];

  const isMyStory = currentUser && activeStory && currentUser.id === activeStory.authorId;

  // 1. RESET LOGIC
  useEffect(() => {
    if (isOpen) {
      setCurrentUserIdx(initialUserIndex);
      setCurrentStoryIdx(0);
      setProgress(0);
      setReplyText("");
      setShowMenu(false);
      setIsExpanded(false);
      setShowViewersList(false);
    }
  }, [isOpen, initialUserIndex]);

  // 1.5 Reset expanded state when changing stories
  useEffect(() => {
    setIsExpanded(false);
    setShowViewersList(false);
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
    if (replyText.length > 0 || isExpanded || showViewersList) return;
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext, replyText, isExpanded, showViewersList]);

  // 5. TIMER LOGIC
  useEffect(() => {
    if (!isOpen || !stories.length || !activeStory) return;
    if (replyText.length > 0 || isExpanded || showViewersList) return; // 🟢 Pause if replying, reading more, or viewing list

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
  }, [currentStoryIdx, currentUserIdx, isOpen, replyText, isExpanded, showViewersList, activeStory, stories.length]);

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
            {user?.profileImage && !brokenImages.has(user?.id || '') ? (
              <Image
                src={user.profileImage}
                alt={user.fullName}
                fill
                className="object-cover"
                onError={() => setBrokenImages(prev => new Set(prev).add(user?.id || ''))}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                {user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
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

        {/* Mute/Unmute Toggle for Videos */}
        {hasMedia && isVideo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="absolute top-4 right-16 z-50 w-10 h-10 flex items-center justify-center 
                     bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        )}


        {/* Content Area */}
        <div className="relative flex-1 bg-zinc-900 flex flex-col items-center justify-center overflow-hidden">

          <style dangerouslySetInnerHTML={{
            __html: `
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />

          {hasMedia ? (
            <>
              {isVideo ? (
                <video
                  src={activeStory.imageUrl || activeStory.videoUrl}
                  autoPlay
                  playsInline
                  muted={isMuted}
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
                <div className={`absolute left-0 right-0 z-30 flex flex-col pointer-events-none transition-all duration-300 ${isExpanded ? "top-20 bottom-24" : "bottom-[70px]"}`}>
                  <div
                    className={`w-full bg-black/60 backdrop-blur-md p-4 flex flex-col pointer-events-auto transition-all duration-300 ${isExpanded ? "h-full" : ""}`}
                  >
                    <div className={`w-full text-left hide-scrollbar ${isExpanded ? "flex-1 overflow-y-auto mb-2" : "max-h-[100px] overflow-hidden"}`}>
                      <p className={`!text-white whitespace-pre-wrap transition-all duration-300 ${isExpanded ? "text-[13px] sm:text-[14px] leading-relaxed font-medium pt-2" : "text-[15px] sm:text-[16px] leading-relaxed font-semibold drop-shadow-md"}`} style={{ color: "#ffffff", textAlign: "left" }}>
                        {!isExpanded && activeStory.content.length > 100 ? `${activeStory.content.slice(0, 100)}... ` : activeStory.content}
                      </p>
                    </div>

                    {!isExpanded && activeStory.content.length > 100 && (
                      <div className="w-full text-left mt-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(true);
                          }}
                          className="text-blue-400 font-bold hover:text-blue-300 text-[14px] cursor-pointer transition-colors"
                        >
                          Read more
                        </button>
                      </div>
                    )}

                    {isExpanded && activeStory.content.length > 100 && (
                      <div className="w-full text-center pt-3 pb-1 border-t border-white/20 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(false);
                          }}
                          className="text-white hover:text-gray-200 font-bold text-[14px] cursor-pointer transition-colors"
                        >
                          Show less
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-blue-900 to-slate-900">
              <div
                className={`absolute top-20 bottom-24 left-0 right-0 px-4 sm:px-6 w-full z-30 transition-all duration-300 flex flex-col ${isExpanded ? 'pointer-events-auto' : 'justify-center pointer-events-none'}`}
              >
                <div
                  className={`w-full flex flex-col transition-all duration-300 ${isExpanded ? "h-full" : ""}`}
                >
                  <div className={`w-full text-left hide-scrollbar ${isExpanded ? "flex-1 overflow-y-auto mb-4" : "max-h-[50vh] overflow-hidden"}`}>
                    <p className={`!text-white font-serif drop-shadow-2xl whitespace-pre-wrap transition-all duration-300 ${isExpanded ? "text-[13px] sm:text-[14px] leading-relaxed font-medium" : "text-[22px] sm:text-[26px] leading-relaxed font-bold"}`} style={{ color: "#ffffff", wordBreak: "break-word" }}>
                      {!isExpanded && activeStory.content.length > 150 ? `${activeStory.content.slice(0, 150)}... ` : activeStory.content}
                    </p>
                  </div>

                  {!isExpanded && activeStory.content && activeStory.content.length > 150 && (
                    <div className="text-left mt-2 shrink-0 relative z-40 pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(true);
                        }}
                        className="text-white/90 hover:text-white font-black underline transition-colors cursor-pointer text-[15px]"
                      >
                        Read more
                      </button>
                    </div>
                  )}

                  {isExpanded && activeStory.content && activeStory.content.length > 150 && (
                    <div className="text-center mt-2 mb-4 shrink-0 relative z-40 pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(false);
                        }}
                        className="text-white hover:text-gray-200 font-bold transition-colors cursor-pointer text-[14px] px-6 py-2 border border-white/40 rounded-full bg-black/40"
                      >
                        Show less
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Click Zones */}
          {!isExpanded && (
            <>
              <div
                className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
                onClick={handlePrev}
              />
              <div
                className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
              />
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-0" />
        </div>

        {/* FOOTER */}
        <div
          className="absolute bottom-6 left-4 right-4 z-30 flex items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {isMyStory ? (
            <div className="flex-1 flex justify-start pl-1">
              <button
                onClick={(e) => { e.stopPropagation(); setShowViewersList(true); }}
                className="flex items-center gap-2 bg-black/50 hover:bg-black/70 px-4 py-2 rounded-full backdrop-blur-md transition-colors text-white"
              >
                <Eye size={20} />
                <span className="font-semibold text-sm">{activeStory.views?.length || 0}</span>
              </button>
            </div>
          ) : (
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
          )}
        </div>

        {/* 🟢 VIEWERS MODAL */}
        {showViewersList && (
          <div
            onClick={() => setShowViewersList(false)}
            className="absolute inset-0 z-[100] bg-black/60 flex flex-col justify-end overflow-hidden"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl max-h-[60vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom flex-shrink-0"
              style={{ animationDuration: '300ms' }}
            >
              <div className="px-7 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Eye size={22} className="text-gray-700" />
                  <h3 className="font-bold text-gray-900 text-[17px]">
                    Viewed by {activeStory.views?.length || 0}
                  </h3>
                </div>
                <button
                  onClick={() => setShowViewersList(false)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pl-[30px] pr-6 py-4 space-y-[22px]">
                {activeStory.views && activeStory.views.length > 0 ? (
                  activeStory.views.map((view: any) => (
                    <div key={view.id} className="flex items-center gap-4">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm border border-gray-100">
                        {view.viewer?.profileImage && !brokenImages.has(view.viewer?.id || '') ? (
                          <Image
                            src={view.viewer.profileImage}
                            alt={view.viewer.fullName}
                            fill
                            className="object-cover"
                            onError={() => setBrokenImages(prev => new Set(prev).add(view.viewer?.id || ''))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                            {view.viewer?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="font-semibold text-gray-900 text-[16px] truncate">
                          {view.viewer?.fullName || "A User"}
                        </span>
                        {view.viewedAt && (
                          <span className="text-[14px] text-gray-500 truncate mt-[1px]">
                            {formatViewerTime(view.viewedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">
                    No views yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}