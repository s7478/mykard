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
  Plus,
  Share,
  Copy,
  X,
  // 🟢 ADDED: Icons for visibility selector
  Globe,
  Users,
  ChevronDown,
} from "lucide-react";

// --- Utilities ---

const truncateStyle: CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

// --- Styles ---

const styles: Record<string, CSSProperties> = {
  /* ---------------- Create Post Card ---------------- */
  createPostCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "20px",
    padding: "20px 24px 14px",
    width: "100%",
    textAlign: "left",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },

  inputArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "14px",
  },

  fakeInput: {
    flex: 1,
    minHeight: "44px",
    borderRadius: "9999px",
    border: "1px solid #d1d5db",
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
    backgroundColor: "#ffffff",
  },

  mediaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    paddingTop: "10px",
    paddingBottom: "6px",
  },

  mediaBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    background: "none",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    color: "#525252",
    cursor: "pointer",
    borderRadius: "10px",
    transition: "background-color 0.2s",
  },

  /* ---------------- Post Card ---------------- */
  postCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "22px",
    padding: "20px",
    width: "100%",
    textAlign: "left",
    position: "relative",
    boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
  },

  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    position: "relative",
    flexShrink: 0,
  },

  menuDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    padding: "6px",
    zIndex: 50,
    minWidth: "150px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#334155",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.15s",
  },

  menuBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 40,
    background: "transparent",
  },

  postMeta: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "14px",
    flex: 1,
    minWidth: 0,
    textAlign: "left",
  },

  actionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "10px",
    borderTop: "1px solid #f1f5f9",
    marginTop: "10px",
    gap: "12px",
  },

  /* ---------------- Comments ---------------- */
  commentSection: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  commentItem: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },

  commentBubble: {
    backgroundColor: "#f8fafc",
    padding: "10px 14px",
    borderRadius: "14px",
    borderTopLeftRadius: "4px",
    flex: 1,
  },

  commentUser: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "2px",
  },

  commentText: {
    fontSize: "12px",
    color: "#475569",
    lineHeight: "1.45",
  },

  /* ---------------- Widgets ---------------- */
  widgetCard: {
    backgroundColor: "#ffffff",
    borderRadius: "22px",
    border: "1px solid #f1f5f9",
    padding: "20px",
    textAlign: "left",
  },

  widgetHeader: {
    marginBottom: "16px",
    fontSize: "15px",
    fontWeight: "700",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
    marginBottom: "10px",
  },

  connectBtnSmall: {
    backgroundColor: "#f1f5f9",
    color: "#2563eb",
    border: "1px solid #e2e8f0",
    padding: "6px 12px",
    borderRadius: "9999px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  connectBtnSent: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    border: "1px solid #bfdbfe",
    cursor: "default",
  },

  /* ---------------- Modal ---------------- */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    zIndex: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
  },

  modalContainer: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "680px",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 30px 40px rgba(0,0,0,0.2)",
    overflow: "hidden",
    maxHeight: "90vh",
  },

  modalHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
  },

  modalCloseBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
  },

  modalBody: {
    padding: "24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  modalTextarea: {
    width: "100%",
    minHeight: "150px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    color: "#374151",
    resize: "none",
    fontFamily: "inherit",
  },
  modalFooter: {
    padding: "12px 16px",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  postButton: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "10px 28px",
    borderRadius: "9999px",
    fontWeight: "600",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  previewArea: {
    position: "relative",
    width: "100%",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    marginTop: "8px",
  },

  removeMediaBtn: {
    position: "absolute",
    top: "6px",
    right: "6px",
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    padding: "4px",
    cursor: "pointer",
  },

  /* ---------------- Visibility ---------------- */
  visibilityBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "9999px",
    border: "1px solid #6b7280",
    fontSize: "11px",
    fontWeight: "600",
    color: "#6b7280",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  visibilityDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: "6px",
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
    padding: "4px",
    zIndex: 70,
    width: "150px",
    display: "flex",
    flexDirection: "column",
  },

  visibilityItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "8px 10px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#374151",
    background: "transparent",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "left",
  },
};

// --- Components ---

// --- 🟢 NEW COMPONENT: Create Post Modal ---

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  initialMediaType?: "image" | "video" | null;
}

const CreatePostModal = ({
  isOpen,
  onClose,
  currentUser,
  initialMediaType,
}: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [loading, setLoading] = useState(false);

  // 🟢 ADDED: Visibility State
  const [visibility, setVisibility] = useState<"public" | "connections">(
    "public"
  );
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initial trigger (e.g. clicking "Photo" opens picker immediately)
  useEffect(() => {
    if (isOpen && initialMediaType && fileInputRef.current) {
      setMediaType(initialMediaType);
      // Small timeout to allow modal to render
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  }, [isOpen, initialMediaType]);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");

    // Create Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
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
        body: JSON.stringify({
          content,
          imageUrl: mediaType === "image" ? mediaPreview : undefined,
          // videoUrl: mediaType === 'video' ? mediaPreview : undefined,
          visibility, // 🟢 ADDED: Send visibility to backend
        }),
      });

      if (res.ok) {
        toast.success("Posted successfully!");
        window.location.reload();
        onClose();
      } else {
        throw new Error("Failed");
      }
    } catch (e) {
      toast.error("Failed to post. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create a post</h2>
          <button onClick={onClose} style={styles.modalCloseBtn}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={styles.modalBody}>
          {/* User Info & Visibility */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                position: "relative",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#e2e8f0",
              }}
            >
              {currentUser?.profileImage ? (
                <Image
                  src={currentUser.profileImage}
                  alt="Me"
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getInitials(currentUser?.fullName || "Me")}
                </div>
              )}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <span style={{ fontWeight: "700", fontSize: "14px" }}>
                {currentUser?.fullName || "User"}
              </span>

              {/* 🟢 ADDED: Visibility Selector */}
              <div style={{ position: 'relative', width: '130px' }}>
                <button 
                  onClick={() => setShowVisibilityMenu(!showVisibilityMenu)} 
                  style={styles.visibilityBtn}
                  onMouseOver={(e) => (
                    (e.currentTarget.style.borderColor = "#374151"),
                    (e.currentTarget.style.color = "#374151")
                  )}
                  onMouseOut={(e) => (
                    (e.currentTarget.style.borderColor = "#6b7280"),
                    (e.currentTarget.style.color = "#6b7280")
                  )}
                >
                  {visibility === 'public' ? <Globe size={16} /> : <Users size={16} />}
                  <span>{visibility === 'public' ? 'Anyone' : 'Connections'}</span>
                  <ChevronDown size={12} />
                </button>

                {showVisibilityMenu && (
                  <div style={styles.visibilityDropdown}>
                    <button
                      onClick={() => {
                        setVisibility("public");
                        setShowVisibilityMenu(false);
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
                        setShowVisibilityMenu(false);
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
            </div>
          </div>

          {/* Text Area */}
          <textarea
            style={styles.modalTextarea}
            placeholder="What do you want to talk about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Media Preview */}
          {mediaPreview && (
            <div style={styles.previewArea}>
              <button onClick={removeMedia} style={styles.removeMediaBtn}>
                <X size={16} />
              </button>
              {mediaType === "video" ? (
                <video
                  src={mediaPreview}
                  controls
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    display: "block",
                  }}
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.modalFooter}>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ ...styles.mediaBtn, padding: "8px" }}
              title="Add Media"
            >
              <ImageIcon size={20} className="text-blue-500" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ ...styles.mediaBtn, padding: "8px" }}
              title="Add Video"
            >
              <Video size={20} className="text-green-600" />
            </button>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept={mediaType === "video" ? "video/*" : "image/*,video/*"}
              onChange={handleFileChange}
            />
          </div>

          <button
            onClick={handlePost}
            disabled={loading || (!content.trim() && !mediaFile)}
            style={{
              ...styles.postButton,
              opacity: !content.trim() && !mediaFile ? 0.5 : 1,
              cursor: !content.trim() && !mediaFile ? "not-allowed" : "pointer",
            }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN WIDGETS ---

export const CreatePostWidget = ({ currentUser }: { currentUser?: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMediaType, setInitialMediaType] = useState<
    "image" | "video" | null
  >(null);

  const myAvatar = currentUser?.profileImage;
  const myInitials = getInitials(currentUser?.fullName || "Me");

  const openModal = (type: "image" | "video" | null = null) => {
    setInitialMediaType(type);
    setIsModalOpen(true);
  };

  return (
    <>
      <div style={styles.createPostCard}>
        <div style={styles.inputArea}>
          <div
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {myAvatar ? (
              <Image
                src={myAvatar}
                alt="Me"
                fill
                unoptimized
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#64748b",
                }}
              >
                {myInitials}
              </span>
            )}
          </div>
          <div
            style={styles.fakeInput}
            onClick={() => openModal(null)}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#ffffff")
            }
          >
            Start a post
          </div>
        </div>
        <div style={styles.mediaRow}>
          <button
            onClick={() => openModal("video")}
            style={styles.mediaBtn}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <Video size={20} className="text-green-600" />{" "}
            <span style={{ color: "#525252" }}>Video</span>
          </button>
          <button
            onClick={() => openModal("image")}
            style={styles.mediaBtn}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <ImageIcon size={20} className="text-blue-500" />{" "}
            <span style={{ color: "#525252" }}>Photo</span>
          </button>
          <button onClick={() => openModal(null)} style={styles.mediaBtn} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
            <Plus size={20} className="text-orange-400" /> <span style={{ color: "#525252" }}>Create story</span>
          </button>
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        initialMediaType={initialMediaType}
      />
    </>
  );
};

export const PostCard = ({
  currentUser,
  postData,
}: {
  currentUser?: any;
  postData: any;
}) => {
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
      await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postData.id }),
      });
    } catch (e) {
      setIsLiked(!newLiked);
      setLikesCount((prev: number) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const handleSave = async () => {
    const newSaved = !isSaved;
    setIsSaved(newSaved);
    setShowMenu(false);
    try {
      await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postData.id }),
      });
      toast.success(newSaved ? "Post saved!" : "Removed from saved");
    } catch (e) {
      setIsSaved(!newSaved);
      toast.error("Action failed");
    }
  };

  const handleShare = () => {
    setShowMenu(false);
    toast.success("Shared!");
  };
  const handleCopyLink = () => {
    setShowMenu(false);
    navigator.clipboard.writeText(
      `${window.location.origin}/post/${postData.id}`
    );
    toast.success("Copied!");
  };

  const myAvatar = currentUser?.profileImage;
  const myInitials = getInitials(currentUser?.fullName || "Me");
  const authorName = postData.author?.fullName || "User";
  const authorTitle = postData.author?.title || "Member";
  const authorImage = postData.author?.profileImage;
  const authorInitials = getInitials(authorName);

  return (
    <div style={styles.postCard}>
      {showMenu && (
        <div style={styles.menuBackdrop} onClick={() => setShowMenu(false)} />
      )}

      <div style={styles.postHeader}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor: "#f3f4f6",
            }}
          >
            {authorImage ? (
              <Image
                src={authorImage}
                alt={authorName}
                fill
                unoptimized
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#64748b",
                }}
              >
                {authorInitials}
              </div>
            )}
          </div>
          <div style={styles.postMeta}>
            <h3
              style={{
                fontWeight: "700",
                fontSize: "14px",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                ...truncateStyle,
              }}
            >
              {authorName}{" "}
              <Check
                size={12}
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px",
                  flexShrink: 0,
                }}
              />
            </h3>
            <p
              style={{
                color: "#64748b",
                fontSize: "11px",
                margin: 0,
                ...truncateStyle,
              }}
            >
              {authorTitle}
            </p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            onClick={handleConnect}
            disabled={isConnected}
            style={{
              backgroundColor: isConnected ? "#e2e8f0" : "#2563eb",
              color: isConnected ? "#64748b" : "white",
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: "700",
              border: "none",
              cursor: isConnected ? "default" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {isConnected ? "Sent" : "Connect"}
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <MoreHorizontal size={20} color="#94a3b8" />
          </button>

          {showMenu && (
            <div style={styles.menuDropdown}>
              <button style={styles.menuItem} onClick={handleShare}>
                <Share size={16} /> Share
              </button>
              <button style={styles.menuItem} onClick={handleCopyLink}>
                <Copy size={16} /> Copy Link
              </button>
              <button style={styles.menuItem} onClick={handleSave}>
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />{" "}
                {isSaved ? "Unsave" : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <p
          style={{
            fontSize: "13px",
            margin: "0 0 12px 0",
            lineHeight: "1.4",
            color: "#334155",
          }}
        >
          {postData.content}
        </p>

        {postData.imageUrl && (
          <div
            style={{
              marginTop: "12px",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              width: "100%",
              maxHeight: "400px",
            }}
          >
            <img
              src={postData.imageUrl}
              alt="Post content"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div style={styles.actionRow}>
          <div style={{ display: "flex", gap: "16px", color: "#64748b" }}>
            <button
              onClick={handleLike}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: isLiked ? "#ef4444" : "#64748b",
              }}
            >
              <Heart
                size={18}
                fill={isLiked ? "#ef4444" : "none"}
                color={isLiked ? "#ef4444" : "currentColor"}
              />{" "}
              {likesCount.toLocaleString()}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: showComments ? "#2563eb" : "#64748b",
              }}
            >
              <MessageCircle
                size={18}
                fill={showComments ? "#dbeafe" : "none"}
              />{" "}
              {postData.commentsCount || 0}
            </button>
          </div>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Send size={20} color="#94a3b8" />
          </button>
        </div>
      </div>

      {showComments && (
        <div style={styles.commentSection}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                backgroundColor: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {myAvatar ? (
                <Image
                  src={myAvatar}
                  alt="Me"
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#64748b",
                  }}
                >
                  {myInitials}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Add a comment..."
              style={{
                flex: 1,
                fontSize: "12px",
                padding: "8px 12px",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                outline: "none",
                backgroundColor: "#f8fafc",
              }}
            />
            <Send size={16} color="#2563eb" style={{ cursor: "pointer" }} />
          </div>
        </div>
      )}
    </div>
  );
};

// ... (SuggestedUsersWidget code remains the same as previously provided, no changes needed) ...
export const SuggestedUsersWidget = ({
  currentUserId,
}: {
  currentUserId: string;
}) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const [usersRes, acceptedRes, sentRes] = await Promise.all([
          fetch("/api/profile/getuser"),
          fetch("/api/users/connections?type=accepted", {
            credentials: "include",
          }),
          fetch("/api/users/connections?type=sent", { credentials: "include" }),
        ]);

        if (!usersRes.ok) return;
        const usersData = await usersRes.json();

        const existingIds = new Set<string>();
        if (currentUserId) existingIds.add(currentUserId);

        if (acceptedRes.ok) {
          const data = await acceptedRes.json();
          (data.requests || []).forEach((r: any) =>
            existingIds.add(r.user?.id)
          );
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
        <Link
          href="/dashboard/search"
          style={{ fontSize: "11px", color: "#2563eb", textDecoration: "none" }}
        >
          View all
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {profiles.map((p) => {
          const isSent = sentRequests.has(p.id);
          return (
            <div key={p.id} style={styles.userRow}>
              <div
                style={{
                  position: "relative",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {p.profileImage ? (
                  <Image
                    src={p.profileImage}
                    alt={p.name}
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {getInitials(p.name)}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    ...truncateStyle,
                  }}
                >
                  {p.name}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#64748b",
                    ...truncateStyle,
                  }}
                >
                  {p.title}
                </span>
              </div>
              <button
                onClick={() => !isSent && handleConnect(p.id, p.name)}
                disabled={isSent || connectingId === p.id}
                style={
                  isSent
                    ? { ...styles.connectBtnSmall, ...styles.connectBtnSent }
                    : styles.connectBtnSmall
                }
              >
                {connectingId === p.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : isSent ? (
                  "Sent"
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
