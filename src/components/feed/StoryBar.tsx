"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Plus, Eye, PlusCircle } from "lucide-react";
import { CreateStoryModal } from "./FeedWidgets";
import StoryViewer from "./StoryViewer";

// Helper for initials
const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

const styles = {
  // 🟢 MERGED CONTAINER
  scrollContainer: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    width: "100%",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    overflowX: "auto" as const,
    overflowY: "visible" as const,
    scrollbarWidth: "none" as const,
    gap: "12px",
    marginBottom: "16px",
  },

  storyItem: { width: "72px", flexShrink: 0, position: "relative" as const },

  avatarWrapper: {
    width: "64px", height: "64px", borderRadius: "9999px", padding: "2px",
    position: "relative" as const, display: "flex", alignItems: "center", justifyContent: "center"
  },

  avatarWhiteRing: { width: "100%", height: "100%", backgroundColor: "#ffffff", borderRadius: "9999px", padding: "2px" },

  avatar: { width: "100%", height: "100%", borderRadius: "9999px", overflow: "hidden", position: "relative" as const, backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#64748b" },

  plusBadge: {
    position: "absolute" as const, bottom: 0, right: 0, backgroundColor: "#2563eb",
    color: "#ffffff", borderRadius: "9999px", padding: "2px", border: "2px solid #ffffff",
    zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center"
  },

  nameText: { fontSize: "11px", marginTop: "4px", fontWeight: 500, textAlign: "center" as const, width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, color: "#334155" },

  dropdownMenu: {
    position: "fixed" as const, // Fixed to viewport
    // Top/Left set dynamically
    backgroundColor: "#ffffff", borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    border: "1px solid #e2e8f0", padding: "6px",
    zIndex: 9999,
    minWidth: "140px",
    display: "flex", flexDirection: "column" as const, gap: "2px",
    // 🟢 REMOVED: transform: "translateX(-50%)" so it aligns left-to-right
  },
  menuItem: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
    fontSize: "12px", fontWeight: 500, color: "#334155", background: "transparent",
    border: "none", borderRadius: "8px", cursor: "pointer", textAlign: "left" as const,
  },
  menuBackdrop: {
    position: "fixed" as const, top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 900, background: "transparent"
  },
};

export default function StoryBar({ currentUser }: { currentUser: any }) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Viewer State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroups, setViewerGroups] = useState<any[]>([]);
  const [initialViewerIndex, setInitialViewerIndex] = useState(0);
  const [showMyStoryMenu, setShowMyStoryMenu] = useState(false);

  // 🟢 Ref and Pos state for menu
  const myStoryRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

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

  // 🟢 2. Call it on mount
  useEffect(() => {
    fetchStories();
  }, []);

  const myStoryGroup = stories.find((s) => s.user.id === currentUser?.id);
  const otherStories = stories.filter((s) => s.user.id !== currentUser?.id);

  const fullStoryList = myStoryGroup ? [myStoryGroup, ...otherStories] : otherStories;

  const handleOpenViewer = (index: number) => {
    setViewerGroups(fullStoryList);
    setInitialViewerIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <style jsx>{` .hide-scrollbar::-webkit-scrollbar { display: none; } `}</style>

      {/* 🟢 SINGLE CONTAINER */}
      <div className="hide-scrollbar" style={styles.scrollContainer}>

        {/* === 1. MY STORY ITEM === */}
        <div
          ref={myStoryRef}
          className="flex flex-col items-center cursor-pointer"
          style={styles.storyItem}
          onClick={(e) => {
            e.stopPropagation();
            if (myStoryGroup) {
              // 🟢 Calculate Coordinates (Left Aligned)
              if (myStoryRef.current) {
                const rect = myStoryRef.current.getBoundingClientRect();
                setMenuPos({
                  top: rect.bottom + 5,
                  left: rect.left // 🟢 Aligns with the left edge of the avatar
                });
              }
              setShowMyStoryMenu(!showMyStoryMenu);
            } else {
              setIsStoryModalOpen(true);
            }
          }}
        >
          <div style={{
            ...styles.avatarWrapper,
            background: myStoryGroup ? "linear-gradient(45deg, #181FFF, #1279E1)" : "transparent"
          }}>
            <div style={styles.avatarWhiteRing}>
              <div style={styles.avatar}>
                {currentUser?.profileImage ? (<Image src={currentUser.profileImage} alt="Me" fill className="object-cover" />) : (getInitials(currentUser?.fullName || "Me"))}
              </div>
            </div>
            {!myStoryGroup && <div style={styles.plusBadge}><Plus size={14} strokeWidth={3} /></div>}
          </div>
          <span style={styles.nameText}>Your story</span>

          {/* Menu */}
          {showMyStoryMenu && (
            <>
              <div style={styles.menuBackdrop} onClick={(e) => { e.stopPropagation(); setShowMyStoryMenu(false); }} />
              <div
                style={{
                  ...styles.dropdownMenu,
                  top: menuPos.top,
                  left: menuPos.left
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button style={styles.menuItem} onClick={() => {
                  handleOpenViewer(0);
                  setShowMyStoryMenu(false);
                }}>
                  <Eye size={16} /> View Story
                </button>
                <button style={styles.menuItem} onClick={() => { setIsStoryModalOpen(true); setShowMyStoryMenu(false); }}>
                  <PlusCircle size={16} /> Add Story
                </button>
              </div>
            </>
          )}
        </div>

        {/* === 2. OTHER STORIES === */}
        {otherStories.map((group, i) => (
          <div
            key={group.user.id}
            className="flex flex-col items-center cursor-pointer"
            style={styles.storyItem}
            onClick={() => {
              const actualIndex = myStoryGroup ? i + 1 : i;
              handleOpenViewer(actualIndex);
            }}
          >
            <div style={{ ...styles.avatarWrapper, background: group.hasUnseen ? "linear-gradient(45deg, #181FFF, #1279E1)" : "#cbd5f5" }}>
              <div style={styles.avatarWhiteRing}>
                <div style={styles.avatar}>
                  {group.user.profileImage ? (<Image src={group.user.profileImage} alt={group.user.fullName} fill className="object-cover" />) : (getInitials(group.user.fullName))}
                </div>
              </div>
            </div>
            <span style={styles.nameText}>{group.user.fullName.split(" ")[0]}</span>
          </div>
        ))}

        {/* Skeletons */}
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center shrink-0" style={styles.storyItem}>
            <div className="bg-slate-100 animate-pulse" style={{ width: 64, height: 64, borderRadius: 999 }} />
            <div className="bg-slate-100 animate-pulse mt-1" style={{ width: 48, height: 8, borderRadius: 4 }} />
          </div>
        ))}
      </div>

      <StoryViewer
        isOpen={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          // 🟢 3. IMPORTANT: Refresh data when viewer closes!
          fetchStories();
        }}
        userGroups={viewerGroups}
        initialUserIndex={initialViewerIndex}
        currentUser={currentUser}
      />

      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} currentUser={currentUser} />
    </>
  );
}