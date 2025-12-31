"use client";

import React, { CSSProperties, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  MoreHorizontal,
  Bookmark,
  Check,
  MessageCircle,
  Heart,
  Send,
  Loader2,
  Video,
  Image as ImageIcon,
  Plus, // Icon for Create Story
  Share,
  Copy,
  X,
  Globe,
  Users,
  ChevronDown,
  UploadCloud, // Used for the "Browse" area
} from "lucide-react";

// --- Utilities ---

const truncateStyle: CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

// --- Styles ---

const styles: Record<string, CSSProperties> = {
  /* ---------------- Create Post Card ---------------- */
  createPostCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "16px",
    padding: "16px 20px 10px 20px",
    width: "100%",
    textAlign: "left",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  inputArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  fakeInput: {
    flex: 1,
    height: "48px",
    borderRadius: "24px",
    border: "1px solid #d1d5db",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
    backgroundColor: "#ffffff",
  },
  mediaRow: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "10px",
    paddingBottom: "6px",
    gap: "32px",
  },
  mediaBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "none",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    color: "#525252",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap", // Ensure text doesn't break
  },

  /* ---------------- Post Card Styles ---------------- */
  postCard: { backgroundColor: "#ffffff", border: "1px solid #f1f5f9", borderRadius: "20px", padding: "16px", width: "100%", textAlign: "left", position: "relative" },
  postHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  headerActions: { display: "flex", alignItems: "center", gap: "8px", position: "relative" },
  menuDropdown: { position: "absolute", top: "100%", right: 0, marginTop: "8px", backgroundColor: "#ffffff", border: "1px solid #f1f5f9", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", padding: "8px", zIndex: 50, minWidth: "160px", display: "flex", flexDirection: "column", gap: "4px" },
  menuItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", fontSize: "13px", fontWeight: "500", color: "#334155", background: "transparent", border: "none", borderRadius: "8px", cursor: "pointer", textAlign: "left", transition: "background 0.2s" },
  menuBackdrop: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 40, background: "transparent", cursor: "default" },
  postMeta: { display: "flex", flexDirection: "column", marginLeft: "12px", flex: 1, minWidth: 0, textAlign: "left" },
  actionRow: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f8fafc", marginTop: "12px" },
  commentSection: { marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "12px" },
  commentItem: { display: "flex", gap: "10px", alignItems: "flex-start" },
  commentBubble: { backgroundColor: "#f8fafc", padding: "8px 12px", borderRadius: "12px", borderTopLeftRadius: "2px", flex: 1 },
  commentUser: { fontSize: "12px", fontWeight: "700", color: "#1e293b", marginBottom: "2px" },
  commentText: { fontSize: "12px", color: "#475569", lineHeight: "1.4" },
  
  /* ---------------- Widget Styles ---------------- */
  widgetCard: { backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #f1f5f9", padding: "16px", textAlign: "left" },
  widgetHeader: { margin: "0 0 12px 0", fontSize: "14px", fontWeight: "700", display: "flex", justifyContent: "space-between", alignItems: "center" },
  userRow: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0, marginBottom: "12px" },
  connectBtnSmall: { backgroundColor: "#f1f5f9", color: "#2563eb", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "9999px", fontSize: "10px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" },
  connectBtnSent: { backgroundColor: "#dbeafe", color: "#1e40af", border: "1px solid #bfdbfe", cursor: "default" },

  /* ---------------- Modal Styles ---------------- */
  modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
  modalContainer: { backgroundColor: "#fff", width: "100%", maxWidth: "600px", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", overflow: "hidden", maxHeight: "90vh" },
  modalHeader: { padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: "18px", fontWeight: "700", color: "#1f2937" },
  modalCloseBtn: { background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px" },
  modalBody: { padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", minHeight: '350px' },
  modalTextarea: { width: "100%", minHeight: "120px", border: "none", outline: "none", fontSize: "16px", color: "#374151", resize: "none", fontFamily: "inherit" },
  modalFooter: { padding: "16px 20px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  postButton: { backgroundColor: "#2563eb", color: "#fff", padding: "8px 24px", borderRadius: "9999px", fontWeight: "600", fontSize: "14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
  previewArea: { position: "relative", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb", marginTop: "10px" },
  removeMediaBtn: { position: "absolute", top: "8px", right: "8px", backgroundColor: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", padding: "4px", cursor: "pointer" },

  /* ---------------- Story Modal Specific ---------------- */
  // Styles for the "Browse" area in Story Modal
  storyUploadBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Dark background like the screenshot
    borderRadius: '12px',
    color: '#000000',
    gap: '16px',
    minHeight: '250px',
    cursor: 'pointer',
    border: '1px dashed #4b5563'
  },
  storyUploadIcon: {
    marginBottom: '8px',
    opacity: 0.8
  },
  browseButton: {
    backgroundColor: '#3b82f6', // Bright blue
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px'
  },

  /* ---------------- Visibility Selector Styles ---------------- */
  visibilityBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "9999px", border: "1px solid #6b7280", fontSize: "11px", fontWeight: "600", color: "#6b7280", background: "transparent", cursor: "pointer", transition: "all 0.2s", },
  visibilityDropdown: { position: "absolute", top: "100%", left: 0, marginTop: "6px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 6px 16px rgba(0,0,0,0.12)", padding: "4px", zIndex: 70, width: "150px", display: "flex", flexDirection: "column", },
  visibilityItem: { display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 10px", fontSize: "12px", fontWeight: "500", color: "#374151", background: "transparent", border: "none", borderRadius: "6px", cursor: "pointer", textAlign: "left", }, 
  visibilityItemContent: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "600", color: "#1f2937" },
  visibilityDesc: { fontSize: "11px", color: "#6b7280", marginLeft: "28px" }
};

// --- Reusable Component: Visibility Selector ---
const VisibilitySelector = ({ visibility, setVisibility }: { visibility: 'public' | 'connections', setVisibility: (v: 'public' | 'connections') => void }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{ position: 'relative', width: '130px' }}>
      <button 
        onClick={() => setShowMenu(!showMenu)} 
        style={styles.visibilityBtn}
        onMouseOver={(e) => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.backgroundColor = "#f9fafb"; }}
        onMouseOut={(e) => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        {visibility === 'public' ? <Globe size={16} /> : <Users size={16} />}
        <span>{visibility === 'public' ? 'Anyone' : 'Connections only'}</span>
        <ChevronDown size={12} />
      </button>

      {showMenu && (
        <div style={styles.visibilityDropdown}>
          <button
            onClick={() => {
            setVisibility("public");
            setShowMenu(false);
            }}
            style={styles.visibilityItem}
            onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
            }
            >
            <Globe size={14} /> Anyone
          </button>
          <button
            onClick={() => {
            setVisibility("connections");
            setShowMenu(false);
            }}
            style={styles.visibilityItem}
            onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
            }
            >
            <Users size={14} /> Connections only
          </button>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: Create Post Modal (Standard) ---
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  initialMediaType?: 'image' | 'video' | null;
}

const CreatePostModal = ({ isOpen, onClose, currentUser, initialMediaType }: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'connections'>('public');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialMediaType && fileInputRef.current) {
      setMediaType(initialMediaType);
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  }, [isOpen, initialMediaType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? 'video' : 'image');
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim() && !mediaFile) return;
    setLoading(true);
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl: mediaType === 'image' ? mediaPreview : undefined, visibility }),
      });
      if (res.ok) {
        toast.success("Posted successfully!");
        window.location.reload();
        onClose();
      } else { throw new Error("Failed"); }
    } catch (e) { toast.error("Failed to post."); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create a post</h2>
          <button onClick={onClose} style={styles.modalCloseBtn}><X size={24} /></button>
        </div>
        <div style={styles.modalBody}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#e2e8f0" }}>
              {currentUser?.profileImage ? <Image src={currentUser.profileImage} alt="Me" fill unoptimized style={{ objectFit: "cover" }} /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>{getInitials(currentUser?.fullName || "Me")}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontWeight: "700", fontSize: "14px" }}>{currentUser?.fullName || "User"}</span>
              <VisibilitySelector visibility={visibility} setVisibility={setVisibility} />
            </div>
          </div>
          <textarea style={styles.modalTextarea} placeholder="What do you want to talk about?" value={content} onChange={(e) => setContent(e.target.value)} />
          {mediaPreview && (
            <div style={styles.previewArea}>
              <button onClick={removeMedia} style={styles.removeMediaBtn}><X size={16} /></button>
              {mediaType === 'video' ? <video src={mediaPreview} controls style={{ width: "100%", maxHeight: "300px", display: "block" }} /> : <img src={mediaPreview} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "contain", display: "block" }} />}
            </div>
          )}
        </div>
        <div style={styles.modalFooter}>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => fileInputRef.current?.click()} style={{ ...styles.mediaBtn, padding: "8px" }} title="Add Media"><ImageIcon size={20} className="text-blue-500" /></button>
            <button onClick={() => fileInputRef.current?.click()} style={{ ...styles.mediaBtn, padding: "8px" }} title="Add Video"><Video size={20} className="text-green-600" /></button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept={mediaType === 'video' ? "video/*" : "image/*,video/*"} onChange={handleFileChange} />
          </div>
          <button onClick={handlePost} disabled={loading || (!content.trim() && !mediaFile)} style={{ ...styles.postButton, opacity: (!content.trim() && !mediaFile) ? 0.5 : 1, cursor: (!content.trim() && !mediaFile) ? "not-allowed" : "pointer" }}>
            {loading && <Loader2 size={16} className="animate-spin" />} Post
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 🟢 NEW COMPONENT: Create Story Modal ---
// Separate component with "Browse" layout
export const CreateStoryModal = ({ isOpen, onClose, currentUser }: { isOpen: boolean, onClose: () => void, currentUser: any }) => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'connections'>('public');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? 'video' : 'image');
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateStory = async () => {
    if (!mediaFile) return;
    setLoading(true);
    try {
      // NOTE: Using posts/create for now, you should ideally use a /stories/create endpoint
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: "New Story", // Default text
          imageUrl: mediaType === 'image' ? mediaPreview : undefined,
          visibility, 
          isStory: true // If your backend supports this flag
        }),
      });
      if (res.ok) {
        toast.success("Story created!");
        window.location.reload();
        onClose();
      } else { throw new Error("Failed"); }
    } catch (e) { toast.error("Failed to create story."); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        {/* Header - Story Specific */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create a story</h2>
          <button onClick={onClose} style={styles.modalCloseBtn}><X size={24} /></button>
        </div>

        <div style={styles.modalBody}>
          {/* User Info & Visibility */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#e2e8f0" }}>
              {currentUser?.profileImage ? <Image src={currentUser.profileImage} alt="Me" fill unoptimized style={{ objectFit: "cover" }} /> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>{getInitials(currentUser?.fullName || "Me")}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontWeight: "700", fontSize: "14px" }}>{currentUser?.fullName || "User"}</span>
              <VisibilitySelector visibility={visibility} setVisibility={setVisibility} />
            </div>
          </div>

          {/* Central Browse Area */}
          {!mediaPreview ? (
            <div style={styles.storyUploadBox} onClick={() => fileInputRef.current?.click()}>
              <div style={styles.storyUploadIcon}>
                 <UploadCloud size={64} color="#e5e7eb" strokeWidth={1} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 600 }}>Drag photos and videos here</span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>or</span>
              <button style={styles.browseButton}>Select From Computer</button>
              <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*,video/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div style={styles.previewArea}>
              <button onClick={removeMedia} style={styles.removeMediaBtn}><X size={16} /></button>
              {mediaType === 'video' ? (
                <video src={mediaPreview} controls style={{ width: "100%", maxHeight: "400px", display: "block" }} />
              ) : (
                <img src={mediaPreview} alt="Preview" style={{ width: "100%", maxHeight: "400px", objectFit: "contain", display: "block" }} />
              )}
            </div>
          )}
        </div>

        {/* Footer - Story Specific */}
        <div style={{ ...styles.modalFooter, justifyContent: 'flex-end' }}>
          <button 
            onClick={handleCreateStory} 
            disabled={loading || !mediaFile} 
            style={{ 
              ...styles.postButton, 
              opacity: !mediaFile ? 0.5 : 1, 
              cursor: !mediaFile ? "not-allowed" : "pointer" 
            }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />} Create story
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN WIDGETS ---

export const CreatePostWidget = ({ currentUser }: { currentUser?: any }) => {
  // State for Regular Post Modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postInitialType, setPostInitialType] = useState<'image' | 'video' | null>(null);

  const myAvatar = currentUser?.profileImage;
  const myInitials = getInitials(currentUser?.fullName || "Me");

  const openPostModal = (type: 'image' | 'video' | null = null) => {
    setPostInitialType(type);
    setIsPostModalOpen(true);
  };

  return (
    <>
      <div style={styles.createPostCard}>
        <div style={styles.inputArea}>
          <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {myAvatar ? <Image src={myAvatar} alt="Me" fill unoptimized style={{ objectFit: "cover" }} /> : <span style={{ fontSize: "14px", fontWeight: "700", color: "#64748b" }}>{myInitials}</span>}
          </div>
          <div style={styles.fakeInput} onClick={() => openPostModal(null)} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}>
            Start a post
          </div>
        </div>
        
        {/* 🟢 FIX: Buttons wrapping for mobile */}
        <div style={styles.mediaRow}>
          <button onClick={() => openPostModal('video')} style={styles.mediaBtn} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
            {/* 🟢 FIX: flex-shrink-0 ensures icons don't squash */}
            <Video size={20} className="text-green-600 flex-shrink-0" /> <span style={{ color: "#525252" }}>Video</span>
          </button>
          
          <button onClick={() => openPostModal('image')} style={styles.mediaBtn} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
            <ImageIcon size={20} className="text-blue-500 flex-shrink-0" /> <span style={{ color: "#525252" }}>Photo</span>
          </button>
        </div>
      </div>

      {/* Render both modals conditionally */}
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        currentUser={currentUser} 
        initialMediaType={postInitialType} 
      />
    </>
  );
};

export const PostCard = ({ currentUser, postData }: { currentUser?: any; postData: any }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLiked, setIsLiked] = useState(postData?.isLiked || false);
  const [likesCount, setLikesCount] = useState(postData?.likesCount || 0);
  const [isSaved, setIsSaved] = useState(postData?.isSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!postData) return null;

  const handleConnect = () => {
    setIsConnected(true);
    toast.success("Connection request sent!");
  };

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev: number) => (newLiked ? prev + 1 : prev - 1));
    try {
      await fetch("/api/posts/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: postData.id }) });
    } catch (e) { setIsLiked(!newLiked); setLikesCount((prev: number) => (newLiked ? prev - 1 : prev + 1)); }
  };

  const handleSave = async () => {
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    setShowMenu(false);
    try {
      await fetch("/api/posts/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: postData.id }) });
      toast.success(newSaved ? "Post saved!" : "Removed from saved");
    } catch (e) { setIsSaved(!newSaved); toast.error("Action failed"); }
  };

  const handleShare = () => { setShowMenu(false); toast.success("Shared!"); };
  const handleCopyLink = () => { setShowMenu(false); navigator.clipboard.writeText(`${window.location.origin}/post/${postData.id}`); toast.success("Copied!"); };

  const myAvatar = currentUser?.profileImage;
  const myInitials = getInitials(currentUser?.fullName || "Me");
  const authorName = postData.author?.fullName || "User";
  const authorTitle = postData.author?.title || "Member";
  const authorImage = postData.author?.profileImage;
  const authorInitials = getInitials(authorName);

  return (
    <div style={styles.postCard}>
      {showMenu && <div style={styles.menuBackdrop} onClick={() => setShowMenu(false)} />}
      
      <div style={styles.postHeader}>
        <div style={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1 }}>
          <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: "#f3f4f6" }}>
            {authorImage ? <Image src={authorImage} alt={authorName} fill unoptimized style={{ objectFit: "cover" }} /> : <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "#64748b" }}>{authorInitials}</div>}
          </div>
          <div style={styles.postMeta}>
            <h3 style={{ fontWeight: "700", fontSize: "14px", margin: 0, display: "flex", alignItems: "center", gap: "4px", ...truncateStyle }}>
              {authorName} <Check size={12} style={{ backgroundColor: "#2563eb", color: "white", borderRadius: "50%", padding: "2px", flexShrink: 0 }} />
            </h3>
            <p style={{ color: "#64748b", fontSize: "11px", margin: 0, ...truncateStyle }}>{authorTitle}</p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button onClick={handleConnect} disabled={isConnected} style={{ backgroundColor: isConnected ? "#e2e8f0" : "#2563eb", color: isConnected ? "#64748b" : "white", padding: "6px 14px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700", border: "none", cursor: isConnected ? "default" : "pointer", transition: "background 0.2s" }}>
            {isConnected ? "Sent" : "Connect"}
          </button>
          
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "50%", display: "flex" }}>
            <MoreHorizontal size={20} color="#94a3b8" />
          </button>

          {showMenu && (
            <div style={styles.menuDropdown}>
              <button style={styles.menuItem} onClick={handleShare}><Share size={16} /> Share</button>
              <button style={styles.menuItem} onClick={handleCopyLink}><Copy size={16} /> Copy Link</button>
              <button style={styles.menuItem} onClick={handleSave}><Bookmark size={16} fill={isSaved ? "currentColor" : "none"} /> {isSaved ? "Unsave" : "Save"}</button>
            </div>
          )}
        </div>
      </div>

      <div>
        <p style={{ fontSize: "13px", margin: "0 0 12px 0", lineHeight: "1.4", color: "#334155" }}>{postData.content}</p>
        
        {postData.imageUrl && (
          <div style={{ marginTop: "12px", borderRadius: "12px", overflow: "hidden", position: "relative", width: "100%", maxHeight: "400px" }}>
             <img src={postData.imageUrl} alt="Post content" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        <div style={styles.actionRow}>
          <div style={{ display: "flex", gap: "16px", color: "#64748b" }}>
            <button onClick={handleLike} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", background: "none", border: "none", cursor: "pointer", padding: 0, color: isLiked ? "#ef4444" : "#64748b" }}>
              <Heart size={18} fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "currentColor"} /> {likesCount.toLocaleString()}
            </button>
            <button onClick={() => setShowComments(!showComments)} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", background: "none", border: "none", cursor: "pointer", padding: 0, color: showComments ? "#2563eb" : "#64748b" }}>
              <MessageCircle size={18} fill={showComments ? "#dbeafe" : "none"} /> {postData.commentsCount || 0}
            </button>
          </div>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><Send size={20} color="#94a3b8" /></button>
        </div>
      </div>

      {showComments && (
        <div style={styles.commentSection}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <div style={{ position: "relative", width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {myAvatar ? <Image src={myAvatar} alt="Me" fill unoptimized style={{ objectFit: "cover" }} /> : <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b" }}>{myInitials}</span>}
            </div>
            <input type="text" placeholder="Add a comment..." style={{ flex: 1, fontSize: "12px", padding: "8px 12px", borderRadius: "20px", border: "1px solid #e2e8f0", outline: "none", backgroundColor: "#f8fafc" }} />
            <Send size={16} color="#2563eb" style={{ cursor: "pointer" }} />
          </div>
        </div>
      )}
    </div>
  );
};

// ... (SuggestedUsersWidget code remains the same as previously provided, no changes needed) ...
export const SuggestedUsersWidget = ({ currentUserId }: { currentUserId: string }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const [usersRes, acceptedRes, sentRes] = await Promise.all([
          fetch("/api/profile/getuser"),
          fetch("/api/users/connections?type=accepted", { credentials: "include" }),
          fetch("/api/users/connections?type=sent", { credentials: "include" }),
        ]);

        if (!usersRes.ok) return;
        const usersData = await usersRes.json();

        const existingIds = new Set<string>();
        if (currentUserId) existingIds.add(currentUserId);

        if (acceptedRes.ok) {
          const data = await acceptedRes.json();
          (data.requests || []).forEach((r: any) => existingIds.add(r.user?.id));
        }
        if (sentRes.ok) {
          const data = await sentRes.json();
          (data.requests || []).forEach((r: any) => {
            existingIds.add(r.receiver?.id);
            setSentRequests((prev) => new Set(prev).add(r.receiver?.id));
          });
        }

        const filtered = (usersData.users || [])
          .filter((u: any) => !existingIds.has(u.id))
          .map((u: any) => ({
            id: u.id,
            name: u.fullName,
            title: u.title || "Professional",
            profileImage: u.profileImage,
            city: u.location || "Online",
          }))
          .slice(0, 3);

        setProfiles(filtered);
      } catch (e) {
        console.error("Suggestions error", e);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) fetchSuggestions();
  }, [currentUserId]);

  const handleConnect = async (userId: string, name: string) => {
    try {
      setConnectingId(userId);
      const response = await fetch("/api/users/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to connect");

      setSentRequests((prev) => new Set([...prev, userId]));
      toast.success(`Connection request sent to ${name}!`);
    } catch (error: any) {
      console.error("Connection error:", error);
      toast.error(error.message || "Failed to send connection request");
    } finally {
      setConnectingId(null);
    }
  };

  if (loading) return null;
  if (profiles.length === 0) return null;

  return (
    <div style={styles.widgetCard}>
      <div style={styles.widgetHeader}>
        <span>Suggested for you</span>
        <Link href="/dashboard/search" style={{ fontSize: "11px", color: "#2563eb", textDecoration: "none" }}>
          View all
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {profiles.map((p) => {
          const isSent = sentRequests.has(p.id);
          return (
            <div key={p.id} style={styles.userRow}>
              <div style={{ position: "relative", width: "36px", height: "36px", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                {p.profileImage ? (
                  <Image src={p.profileImage} alt={p.name} fill unoptimized style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>
                    {getInitials(p.name)}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: "13px", fontWeight: "700", ...truncateStyle }}>{p.name}</span>
                <span style={{ fontSize: "10px", color: "#64748b", ...truncateStyle }}>{p.title}</span>
              </div>
              <button
                onClick={() => !isSent && handleConnect(p.id, p.name)}
                disabled={isSent || connectingId === p.id}
                style={isSent ? { ...styles.connectBtnSmall, ...styles.connectBtnSent } : styles.connectBtnSmall}
              >
                {connectingId === p.id ? <Loader2 size={12} className="animate-spin" /> : isSent ? "Sent" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};