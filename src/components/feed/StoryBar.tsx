"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { CreateStoryModal } from "./FeedWidgets";

// Helper for initials
const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

export default function StoryBar({ currentUser }: { currentUser: any }) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch("/api/stories");
        if (res.ok) {
          const data = await res.json();
          setStories(data.stories || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  // Filter out current user to display separately as "My Story" (optional, but standard UX)
  const myStoryGroup = stories.find(s => s.user.id === currentUser?.id);
  const otherStories = stories.filter(s => s.user.id !== currentUser?.id);

  return (
    <>
    <div 
      className="bg-white border border-slate-100 rounded-md p-4 mb-4 w-full shadow-sm"
      style={{ overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', gap: '16px', alignItems: 'center' }}
    >
      {/* 1. Add Story / My Story */}
      <div 
        className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0" 
        style={{ width: '70px' }}
        onClick={() => setIsStoryModalOpen(true)}
      >
        <div className="relative w-[60px] h-[60px] rounded-full p-[2px] border-2 border-transparent"> 
          {/* Avatar */}
          <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-200">
            {currentUser?.profileImage ? (
              <Image src={currentUser.profileImage} alt="Me" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                {getInitials(currentUser?.fullName || "Me")}
              </div>
            )}
          </div>
          
          {/* Plus Icon Badge */}
          <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-[2px] border-2 border-white">
            <Plus size={14} strokeWidth={3} />
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-600 truncate w-full text-center">
          Your story
        </span>
      </div>

      {/* 2. Connection Stories */}
      {otherStories.map((group) => (
        <div 
          key={group.user.id} 
          className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
          style={{ width: '70px' }}
        >
          {/* Ring Container: Gradient Border if unseen, Gray if seen */}
          <div 
            className={`relative w-[64px] h-[64px] rounded-full p-[2px] flex items-center justify-center ${
              group.hasUnseen 
                ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" 
                : "bg-slate-300"
            }`}
          >
            {/* White separator */}
            <div className="w-full h-full bg-white rounded-full p-[2px]">
              {/* Avatar */}
              <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-200">
                {group.user.profileImage ? (
                  <Image src={group.user.profileImage} alt={group.user.fullName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                    {getInitials(group.user.fullName)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-700 truncate w-full text-center">
            {group.user.fullName.split(" ")[0]} {/* First Name Only */}
          </span>
        </div>
      ))}
      
      {/* Skeletons if loading */}
      {loading && Array.from({length: 4}).map((_, i) => (
         <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 w-[70px]">
            <div className="w-[64px] h-[64px] rounded-full bg-slate-100 animate-pulse" />
            <div className="w-12 h-2 bg-slate-100 rounded animate-pulse" />
         </div>
      ))}
    </div>

    <CreateStoryModal 
        isOpen={isStoryModalOpen} 
        onClose={() => setIsStoryModalOpen(false)} 
        currentUser={currentUser} 
      />
    
    </>
  );
}