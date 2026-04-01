"use client";

import React, { useEffect, useState, CSSProperties } from "react";
import Image from "next/image";
import { X, Check, Search, Copy, Loader2, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { FaWhatsapp, FaInstagram, FaTelegramPlane, FaFacebookF, FaTwitter } from "react-icons/fa";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  cardId?: string;
  type?: "post" | "card";
  currentUserId: string;
  onShareSuccess?: () => void;
}

// --- Styles Object (Matching FeedWidgets) ---
const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)", 
    backdropFilter: "blur(4px)",
    zIndex: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  container: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: "500px", 
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    overflow: "hidden",
    maxHeight: "85vh",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "center", 
    alignItems: "center",
    position: "relative",
  },
  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
  },
  closeBtn: {
    position: "absolute",
    right: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  // Search Area
  searchSection: {
    padding: "12px 20px",
    borderBottom: "1px solid #f3f4f6",
    backgroundColor: "#ffffff",
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  searchWrapper: {
    position: "relative",
    flex: 1, 
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  input: {
    width: "100%",
    padding: "10px 12px 10px 36px", 
    borderRadius: "9999px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#f9fafb",
    color: "#374151",
  },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#eff6ff",
    color: "#2563eb", 
    border: "1px solid #bfdbfe",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.2s",
  },
  // Grid
  body: {
    padding: "20px",
    overflowY: "auto",
    minHeight: "300px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px", 
  },
  userItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    position: "relative",
  },
  avatarWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    padding: "2px",
    position: "relative",
    border: "2px solid transparent", 
    transition: "all 0.2s",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    bottom: "0",
    right: "0",
    backgroundColor: "#2563eb",
    color: "white",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid white",
    zIndex: 10,
  },
  userName: {
    fontSize: "11px",
    marginTop: "6px",
    textAlign: "center",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: "500",
    color: "#4b5563",
  },
  // Footer
  footer: {
    padding: "16px 20px",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fff",
  },
  footerLeftActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "2px",
    flex: 1,
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "10px 24px",
    borderRadius: "9999px",
    fontWeight: "600",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    opacity: 1,
    transition: "opacity 0.2s",
  },
  // Social Icons
  socialRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flex: 1,
  },
  socialIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s, opacity 0.2s",
    border: "none",
  }
};

import { FaWhatsapp, FaInstagram, FaTelegramPlane, FaTwitter, FaFacebookF } from "react-icons/fa";

export default function ShareModal({ isOpen, onClose, postId, cardId, type = "post", currentUserId, onShareSuccess }: ShareModalProps) {
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [brokenAvatarIds, setBrokenAvatarIds] = useState<Set<string>>(new Set());

  // Determine active ID and type
  const activeType = cardId ? "card" : type;
  const activeId = cardId || postId || "";

  // 🟢 1. Construct the URL based on type
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = activeType === "card" 
    ? `${baseUrl}/cards/public/${activeId}`
    : `${baseUrl}/post/${activeId}`;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setBrokenAvatarIds(new Set());
      fetch("/api/users/connections?type=accepted")
        .then((res) => res.json())
        .then((data) => {
          const formatted = (data.requests || []).map((req: any) => {
            return req.senderId === currentUserId ? req.receiver : req.sender;
          });
          setConnections(formatted);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, currentUserId]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const openShareUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    if (onShareSuccess) onShareSuccess();
  };

  const handleExternalShare = async (channel: "whatsapp" | "instagram" | "telegram" | "twitter" | "facebook" | "more") => {
    const text = "Check out this post";
    const encodedUrl = encodeURIComponent(postUrl);

    if (channel === "whatsapp") {
      // URL-only format improves WhatsApp preview rendering.
      openShareUrl(`https://wa.me/?text=${encodedUrl}`);
      return;
    }

    if (channel === "telegram") {
      openShareUrl(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`);
      return;
    }

    if (channel === "twitter") {
      openShareUrl(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`);
      return;
    }

    if (channel === "facebook") {
      openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
      return;
    }

    if (channel === "instagram") {
      await copyToClipboard();
      // Instagram web does not support prefilled link share; we copy then open app/site.
      openShareUrl("https://www.instagram.com/");
      toast("Link copied. Paste it in Instagram.");
      return;
    }

    if (channel === "more") {
      try {
        if (navigator.share) {
          await navigator.share({ title: "Post", text, url: postUrl });
          if (onShareSuccess) onShareSuccess();
        } else {
          await copyToClipboard();
          toast("System share not available. Link copied.");
        }
      } catch {
        // user cancel or share error; avoid noisy toast
      }
    }
  };

  // 🟢 2. Send Message via API
  const handleSend = async () => {
    if (selectedIds.size === 0) return;
    setSending(true);

    try {
      const res = await fetch("/api/message/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          receiverIds: Array.from(selectedIds), 
          postId: activeType === "post" ? activeId : undefined,
          cardId: activeType === "card" ? activeId : undefined,
          type: activeType
        }),
      });

      if (res.ok) {
        toast.success(`Sent to ${selectedIds.size} connections!`);
        if (onShareSuccess) onShareSuccess();
        onClose();
        setSelectedIds(new Set());
      } else {
        toast.error("Failed to send.");
      }
    } catch (e) {
      toast.error("Error sending message.");
    } finally {
      setSending(false);
    }
  };

  // 🟢 3. Robust Copy Logic
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Mobile fallback for older browsers
        const input = document.createElement("input");
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        input.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.body.removeChild(input);
      }

      setCopied(true);
      toast.success("Link copied!");
      if (onShareSuccess) onShareSuccess();
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Unable to copy. Try manually.");
    }
  };

  if (!isOpen) return null;

  const filtered = connections.filter(c => c.fullName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>{activeType === "card" ? "Share Profile" : "Share Post"}</h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        {/* Search & Copy */}
        <div style={styles.searchSection}>
           <div style={styles.searchWrapper}>
             <Search size={16} style={styles.searchIcon} />
             <input 
               style={styles.input}
               placeholder="Search connections..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           {/* 🟢 Updated Copy Button Logic */}
           <button 
             onClick={copyToClipboard} 
             style={styles.copyBtn}
             onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#dbeafe"}
             onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#eff6ff"}
           >
             {copied ? <Check size={14} /> : <Copy size={14} />}
             {copied ? "Copied" : "Copy Link"}
           </button>
        </div>

        {/* Grid Area */}
        <div style={styles.body}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px', fontSize: '14px' }}>
              No connections found.
            </div>
          ) : (
            <div style={styles.grid}>
              {filtered.map((user) => {
                const isSelected = selectedIds.has(user.id);
                return (
                  <div key={user.id} style={styles.userItem} onClick={() => toggleSelection(user.id)}>
                    <div style={{ ...styles.avatarWrapper, borderColor: isSelected ? "#2563eb" : "transparent" }}>
                      <div style={styles.avatar}>
                        {user.profileImage && !brokenAvatarIds.has(user.id) ? (
                          <Image
                            src={user.profileImage}
                            alt={user.fullName}
                            fill
                            className="object-cover"
                            onError={() => setBrokenAvatarIds((prev) => new Set(prev).add(user.id))}
                          />
                        ) : (
                          user.fullName?.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      {isSelected && (
                        <div style={styles.checkBadge}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span style={{
                      ...styles.userName,
                      color: isSelected ? "#2563eb" : "#4b5563",
                      fontWeight: isSelected ? 700 : 500
                    }}>
                      {user.fullName.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.socialRow}>
            {[
              { icon: <FaWhatsapp size={20} />, color: "#25D366", name: "WhatsApp", url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}` },
              { icon: <FaInstagram size={20} />, color: "#E4405F", name: "Instagram", url: `https://www.instagram.com/` },
              { icon: <FaTelegramPlane size={20} />, color: "#0088cc", name: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}` },
              { icon: <FaTwitter size={20} />, color: "#000000", name: "Twitter", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}` },
              { icon: <FaFacebookF size={20} />, color: "#1877F2", name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
            ].map((social, idx) => (
              <button 
                key={idx} 
                style={{ ...styles.socialIcon, backgroundColor: social.color }}
                onClick={() => window.open(social.url, "_blank")}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                title={`Share on ${social.name}`}
              >
                {social.icon}
              </button>
            ))}
          </div>

          <button 
            onClick={handleSend} 
            disabled={selectedIds.size === 0 || sending}
            style={{
              ...styles.sendBtn,
              opacity: selectedIds.size === 0 ? 0.5 : 1,
              cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
              backgroundColor: selectedIds.size > 0 ? "#2563eb" : "#e5e7eb",
              color: selectedIds.size > 0 ? "#fff" : "#9ca3af"
            }}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}