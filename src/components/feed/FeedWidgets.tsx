"use client";

import React, { CSSProperties, useState, useEffect } from "react";
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
  Type,
  Share,
  Copy, // Added Copy icon
} from "lucide-react";

// --- Utilities & Styles ---

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

const styles: Record<string, CSSProperties> = {
  createPostCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "12px",
    padding: "12px 16px",
    width: "100%",
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
  },
  actionGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "4px",
  },
  actionItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background 0.2s",
    border: "none",
    background: "none",
  },
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  feedContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    maxWidth: "500px",
  },
  // --- Post Card Styles ---
  postCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "20px",
    padding: "16px",
    width: "100%",
    textAlign: "left",
    position: "relative", // Needed for popup context if not using fixed backdrop
  },
  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    position: "relative",
  },
  menuDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    padding: "8px",
    zIndex: 50,
    minWidth: "160px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#334155",
    background: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.2s",
  },
  menuBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 40,
    background: "transparent",
    cursor: "default",
  },
  postMeta: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "12px",
    flex: 1,
    minWidth: 0,
    textAlign: "left",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "12px",
    borderTop: "1px solid #f8fafc",
    marginTop: "12px",
  },
  // --- Comment Section Styles ---
  commentSection: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  commentItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  commentBubble: {
    backgroundColor: "#f8fafc",
    padding: "8px 12px",
    borderRadius: "12px",
    borderTopLeftRadius: "2px",
    flex: 1,
  },
  commentUser: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "2px",
  },
  commentText: {
    fontSize: "12px",
    color: "#475569",
    lineHeight: "1.4",
  },
  // --- Suggested Widget Styles ---
  widgetCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
    padding: "16px",
    textAlign: "left",
  },
  widgetHeader: {
    margin: "0 0 12px 0",
    fontSize: "14px",
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
    marginBottom: "12px",
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
  }
};

// --- Components ---

export const CreatePost = ({ currentUser }: { currentUser: any }) => {
  const myAvatar = currentUser?.profileImage;
  const myInitials = getInitials(currentUser?.fullName || "Me");

  return (
    <div style={styles.createPostCard}>
      <div style={styles.inputArea}>
        <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor:"#e2e8f0", display:'flex', alignItems:'center', justifyContent:'center' }}>
          {myAvatar ? (
            <Image src={myAvatar} alt="Me" fill unoptimized style={{ objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "20px", fontWeight: "600", color: "#64748b" }}>{myInitials}</span>
          )}
        </div>
        <div 
          style={styles.fakeInput} 
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          Start a post
        </div>
      </div>
      
      <div style={styles.actionGroup}>
        <button style={styles.actionItem} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
          <Video size={20} color="#70b5f9" />
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#666" }}>Video</span>
        </button>
        
        <button style={styles.actionItem} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
          <ImageIcon size={20} color="#7fc15e" />
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#666" }}>Photo</span>
        </button>
        
        <button style={styles.actionItem} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
          <Type size={20} color="#e7a33e" />
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#666" }}>Write article</span>
        </button>
      </div>
    </div>
  );
};

export const PostCard = ({ currentUser }: { currentUser: any }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(1200);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // State for popup menu

  const handleConnect = () => {
    setIsConnected(true);
    toast.success("Connection request sent!");
  };
  
  const handleLike = () => {
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setShowMenu(false);
    toast.success(isBookmarked ? "Removed from saved" : "Post saved!");
  };

  const handleShare = () => {
    setShowMenu(false);
    toast.success("Shared to your feed!");
  };

  const handleCopyLink = () => {
    setShowMenu(false);
    toast.success("Link copied to clipboard!");
  };

  const demoComments = [
    { id: 1, user: "Amit Verma", avatar: "Amit", text: "This looks amazing! 🔥" },
    { id: 2, user: "Sarah J.", avatar: "Sarah", text: "Nagpur tech scene is growing fast." },
  ];

  const myAvatar = currentUser?.profileImage;
  const myInitials = getInitials(currentUser?.fullName || "Me");

  return (
    <div style={styles.postCard}>
      {/* --- Popup Menu Backdrop --- */}
      {showMenu && (
        <div style={styles.menuBackdrop} onClick={() => setShowMenu(false)} />
      )}

      {/* --- Header --- */}
      <div style={styles.postHeader}>
        {/* Left: Avatar + Info */}
        <div style={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1 }}>
          <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
            <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya" alt="User" fill unoptimized style={{ objectFit: "cover" }} />
          </div>
          <div style={styles.postMeta}>
            <h3 style={{ fontWeight: "700", fontSize: "14px", margin: 0, display: "flex", alignItems: "center", gap: "4px", ...truncateStyle }}>
              Sanya Kapoor
              <Check size={12} style={{ backgroundColor: "#2563eb", color: "white", borderRadius: "50%", padding: "2px", flexShrink: 0 }} />
            </h3>
            <p style={{ color: "#64748b", fontSize: "11px", margin: 0, ...truncateStyle }}>UI/UX Designer • @sanya_ux</p>
          </div>
        </div>

        {/* Right: Connect Btn + Menu */}
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
              transition: "background 0.2s"
            }}
          >
            {isConnected ? "Sent" : "Connect"}
          </button>

          <button 
            onClick={() => setShowMenu(!showMenu)} 
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "50%", display: "flex" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <MoreHorizontal size={20} color="#94a3b8" />
          </button>

          {/* Popup Menu */}
          {showMenu && (
            <div style={styles.menuDropdown}>
              <button style={styles.menuItem} onClick={handleShare} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                <Share size={16} /> Share
              </button>
              <button style={styles.menuItem} onClick={handleCopyLink} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                <Copy size={16} /> Copy Link
              </button>
              <button style={styles.menuItem} onClick={handleBookmark} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} /> {isBookmarked ? "Unsave" : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Content --- */}
      <div>
        <p style={{ fontSize: "13px", margin: "0 0 12px 0", lineHeight: "1.4", color: "#334155" }}>
          Creative designer passionate about user-centric experiences. Connect for collaborations in Nagpur! 🚀
        </p>
        
        {/* --- Footer Action Row --- */}
        <div style={styles.actionRow}>
          <div style={{ display: "flex", gap: "16px", color: "#64748b" }}>
            <button 
              onClick={handleLike}
              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", background: "none", border: "none", cursor: "pointer", padding: 0, color: isLiked ? "#ef4444" : "#64748b" }}
            >
              <Heart size={18} fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "currentColor"} /> 
              {likesCount.toLocaleString()}
            </button>

            <button 
              onClick={() => setShowComments(!showComments)}
              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", background: "none", border: "none", cursor: "pointer", padding: 0, color: showComments ? "#2563eb" : "#64748b" }}
            >
              <MessageCircle size={18} fill={showComments ? "#dbeafe" : "none"} /> 24
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <Send size={18} color="#94a3b8" />
            </button>
          </div>
          <button onClick={() => setIsBookmarked(!isBookmarked)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Bookmark size={20} color={isBookmarked ? "#2563eb" : "#94a3b8"} fill={isBookmarked ? "#2563eb" : "none"} />
          </button>
        </div>
      </div>

      {/* --- Comment Section --- */}
      {showComments && (
        <div style={styles.commentSection}>
          {demoComments.map((comment) => (
            <div key={comment.id} style={styles.commentItem}>
              <div style={{ position: "relative", width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.avatar}`} alt={comment.user} fill unoptimized style={{ objectFit: "cover" }} />
              </div>
              <div style={styles.commentBubble}>
                <div style={styles.commentUser}>{comment.user}</div>
                <div style={styles.commentText}>{comment.text}</div>
              </div>
            </div>
          ))}
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
             <div style={{ position: "relative", width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor:"#e2e8f0", display:'flex', alignItems:'center', justifyContent:'center' }}>
                {myAvatar ? (
                  <Image src={myAvatar} alt="Me" fill unoptimized style={{ objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#64748b" }}>{myInitials}</span>
                )}
             </div>
             <input 
                type="text" 
                placeholder="Add a comment..." 
                style={{ flex: 1, fontSize: "12px", padding: "8px 12px", borderRadius: "20px", border: "1px solid #e2e8f0", outline: "none", backgroundColor: "#f8fafc" }}
             />
             <Send size={16} color="#2563eb" style={{ cursor: "pointer" }} />
          </div>
        </div>
      )}
    </div>
  );
};

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
          fetch("/api/users/connections?type=accepted", { credentials: 'include' }),
          fetch("/api/users/connections?type=sent", { credentials: 'include' })
        ]);

        if (!usersRes.ok) return;
        const usersData = await usersRes.json();
        
        const existingIds = new Set<string>();
        existingIds.add(currentUserId); 

        if (acceptedRes.ok) {
           const data = await acceptedRes.json();
           (data.requests || []).forEach((r: any) => existingIds.add(r.user?.id));
        }
        if (sentRes.ok) {
           const data = await sentRes.json();
           (data.requests || []).forEach((r: any) => {
             existingIds.add(r.receiver?.id);
             setSentRequests(prev => new Set(prev).add(r.receiver?.id));
           });
        }

        const filtered = (usersData.users || [])
          .filter((u: any) => !existingIds.has(u.id))
          .map((u: any) => ({
            id: u.id,
            name: u.fullName,
            title: u.title || "Professional",
            profileImage: u.profileImage,
            city: u.location || "Online"
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

      setSentRequests(prev => new Set([...prev, userId]));
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
        <Link href="/dashboard/search" style={{ fontSize: "11px", color: "#2563eb", textDecoration: "none" }}>View all</Link>
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
                {connectingId === p.id ? <Loader2 size={12} className="animate-spin" /> : (isSent ? "Sent" : "Connect")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function FeedPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (e) {}
    };
    fetchMe();
  }, []);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.feedContainer}>
        <CreatePost currentUser={currentUser} />
        <PostCard currentUser={currentUser} />
        <PostCard currentUser={currentUser} />
        <SuggestedUsersWidget currentUserId={currentUser?.id} />
      </div>
    </div>
  );
}