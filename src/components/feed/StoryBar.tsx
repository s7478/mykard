"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { CreateStoryModal } from "./FeedWidgets";
import StoryViewer from "./StoryViewer";

// Helper for initials
const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

/* =========================
   STYLES OBJECT
========================= */
const styles = {
  container: {
    overflowX: "auto" as const,
    whiteSpace: "nowrap" as const,
    display: "flex",
    padding: '5px',
    gap: "3px",
    alignItems: "center",
  },
  storyItem: { width: "85px" },
  myStoryAvatarWrapper: { width: "60px", height: "60px", borderRadius: "9999px", padding: "2px", position: "relative" as const },
  avatarOuterRing: { width: "64px", height: "64px", borderRadius: "9999px", padding: "2px", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarWhiteRing: { width: "100%", height: "100%", backgroundColor: "#ffffff", borderRadius: "9999px", padding: "2px" },
  avatar: { width: "100%", height: "100%", borderRadius: "9999px", overflow: "hidden", position: "relative" as const, backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#64748b" },
  plusBadge: { position: "absolute" as const, bottom: 0, right: 0, backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "9999px", padding: "2px", border: "2px solid #ffffff" },
  nameText: { fontSize: "8px", fontWeight: 500, textAlign: "center" as const, width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const },
  skeletonAvatar: { width: "64px", height: "64px", borderRadius: "9999px" },
  skeletonText: { width: "48px", height: "8px", borderRadius: "4px" },
};

export default function StoryBar({ currentUser }: { currentUser: any }) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  
  // 🟢 Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeStoryGroup, setActiveStoryGroup] = useState<any>(null);

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

  const otherStories = stories.filter((s) => s.user.id !== currentUser?.id);

  return (
    <>
      <div className="bg-white border border-slate-100 rounded-md p-4 mb-4 w-full shadow-sm" style={styles.container}>
        {/* My Story (Create) */}
        <div className="flex flex-col items-center cursor-pointer shrink-0" style={styles.storyItem} onClick={() => setIsStoryModalOpen(true)}>
          <div style={styles.myStoryAvatarWrapper}>
            <div style={styles.avatar}>
              {currentUser?.profileImage ? ( <Image src={currentUser.profileImage} alt="Me" fill className="object-cover" /> ) : ( getInitials(currentUser?.fullName || "Me") )}
            </div>
            <div style={styles.plusBadge}><Plus size={14} strokeWidth={3} /></div>
          </div>
          <span style={{ ...styles.nameText, color: "#64748b" }}>Your story</span>
        </div>

        {/* Other Stories (View) */}
        {otherStories.map((group) => (
          <div 
            key={group.user.id} 
            className="flex flex-col items-center cursor-pointer shrink-0" 
            style={styles.storyItem}
            // 🟢 Add Click Handler to Open Viewer
            onClick={() => { setActiveStoryGroup(group); setViewerOpen(true); }}
          >
            <div style={{ ...styles.avatarOuterRing, background: group.hasUnseen ? "linear-gradient(45deg, #facc15, #ec4899, #9333ea)" : "#cbd5f5" }}>
              <div style={styles.avatarWhiteRing}>
                <div style={styles.avatar}>
                  {group.user.profileImage ? ( <Image src={group.user.profileImage} alt={group.user.fullName} fill className="object-cover" /> ) : ( getInitials(group.user.fullName) )}
                </div>
              </div>
            </div>
            <span style={{ ...styles.nameText, color: "#334155" }}>{group.user.fullName.split(" ")[0]}</span>
          </div>
        ))}

        {/* Skeletons */}
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={styles.storyItem}>
            <div className="bg-slate-100 animate-pulse" style={styles.skeletonAvatar} />
            <div className="bg-slate-100 animate-pulse" style={styles.skeletonText} />
          </div>
        ))}
      </div>

      {/* 🟢 Render Viewer */}
      <StoryViewer isOpen={viewerOpen} onClose={() => setViewerOpen(false)} stories={activeStoryGroup?.stories || []} user={activeStoryGroup?.user} />

      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} currentUser={currentUser} />
    </>
  );
}