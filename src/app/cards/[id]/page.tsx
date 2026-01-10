"use client";

import styles from "./carddetail.module.css";
import React, { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Delete from "../delete/Delete";
import { toast } from "react-hot-toast";
import {
  FiEdit,
  FiToggleLeft,
  FiToggleRight,
  FiMail,
  FiPhone,
  FiShare2 as FiShareIcon,
} from "react-icons/fi";
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  Link as LinkIcon,
  BarChart3,
  Eye,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";

/* -------------------------------------------------
   DESIGN SYSTEM 
   ------------------------------------------------- */
const theme = {
  colors: {
    bg: "#FFFFFF",
    primaryBlue: "#2152E5",
    cardGradient: "linear-gradient(109.79deg, rgba(79, 117, 230, 0.98) 16.59%, #1237A1 76.33%)",
    cardBorderLine: "#6AD2FF",
    avatarBg: "#1279E1",
    avatarBorder: "#A3D4FF",
    inputText: "#646464",
    inputBorder: "#767676",
  },
  font: "'Plus Jakarta Sans', sans-serif",
};

// ----------------- UTILS -----------------

// Helper to detect mobile devices
const isMobile = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, "image/jpeg", 0.7);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

// ----------------- Card Type Definition -----------------
interface Card {
  id: string;
  fullName?: string;
  name?: string;
  cardName?: string;
  cardActive?: boolean;
  title?: string;
  company?: string;
  location?: string;
  about?: string;
  bio?: string;
  description?: string;
  skills?: string;
  portfolio?: string;
  experience?: string;
  services?: string;
  review?: string;
  photo?: string;
  profileImage?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  linkedinUrl?: string;
  website?: string;
  websiteUrl?: string;
  selectedDesign?: string;
  selectedColor?: string;
  selectedColor2?: string;
  textColor?: string;
  selectedFont?: string;
  cardType?: string;
  views?: number;
  shares?: number;
  documentUrl?: string;
}

// ----------------- Card Preview -----------------
const CardPreview: React.FC<{ card: Card }> = ({ card }) => {
  const [showSkillsOverlay, setShowSkillsOverlay] = useState(false);

  const displayData = {
    name: card.fullName || card.name || "Your Name",
    title: card.title,
    company: card.company,
    location: card.location,
    about: card.bio || card.about || card.description,
    photo: card.profileImage || card.photo,
    phone: card.phone,
    email: card.email,
    skills: card.skills
  };

  const initials = displayData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

  const skillsArray = displayData.skills
    ? displayData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      style={{
        width: "100%",
        maxWidth: "340px",
        background: theme.colors.cardGradient,
        borderRadius: "20px",
        padding: "24px",
        color: "white",
        boxShadow: "0 25px 50px -12px rgba(33, 82, 229, 0.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        margin: "0 auto",
        zIndex: 1,
        transition: "all 0.3s ease",
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        fontFamily: theme.font
      }}
    >
      <div style={{ width: "60%", height: "1px", background: theme.colors.cardBorderLine, position: "absolute", top: "70px", opacity: 0.6 }} />

      <div style={{ width: "88px", height: "88px", borderRadius: "50%", background: theme.colors.avatarBg, border: `3px solid ${theme.colors.avatarBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", zIndex: 2, position: "relative", overflow: 'hidden', boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        {displayData.photo ? (
          <img src={displayData.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: theme.font, fontWeight: '700', fontSize: "32px", color: '#FFFFFF' }}>{initials}</span>
        )}
      </div>

      <h3 style={{ fontFamily: theme.font, fontWeight: '700', fontSize: "24px", lineHeight: "1.2", marginBottom: "8px", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        {displayData.name}
      </h3>

      {(displayData.title || displayData.company) && (
        <div style={{ fontSize: "14px", opacity: 0.95, marginBottom: "12px", fontWeight: "500", letterSpacing: "0.3px" }}>
          {displayData.title && <span>{displayData.title}</span>}
          {displayData.title && displayData.company && <span style={{ margin: '0 6px' }}>|</span>}
          {displayData.company && <span>{displayData.company}</span>}
        </div>
      )}

      {displayData.location && (
        <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "20px", display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {displayData.location}
        </div>
      )}

      {(displayData.phone || displayData.email) && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {displayData.phone && (
            <a href={`tel:${displayData.phone}`} style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </a>
          )}
          {displayData.email && (
            <a href={`mailto:${displayData.email}`} style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </a>
          )}
        </div>
      )}

      {displayData.about && (
        <div style={{ width: '100%', marginBottom: 'auto', textAlign: 'left' }}>
          <p style={{ fontSize: "13px", opacity: 0.9, lineHeight: '1.5', color: '#FFFFFF', fontFamily: theme.font, background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '12px' }}>
            {displayData.about.length > 90 ? displayData.about.substring(0, 90) + "..." : displayData.about}
          </p>
        </div>
      )}

      {skillsArray.length > 0 && (
        <button
          onClick={() => setShowSkillsOverlay(true)}
          style={{
            marginTop: '20px',
            background: '#FFFFFF',
            color: theme.colors.primaryBlue,
            border: 'none',
            padding: '10px 10px',
            borderRadius: '30px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            width: '100%',
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>View Skills & Expertise</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      )}

      {showSkillsOverlay && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', zIndex: 50,
          display: 'flex', flexDirection: 'column', padding: '24px', animation: 'fadeIn 0.3s ease-out'
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSkillsOverlay(false); }}
            style={{
              alignSelf: 'flex-end', background: '#F3F4F6', border: 'none', width: '32px', height: '32px',
              borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <h4 style={{ color: '#111827', fontSize: '20px', fontWeight: '800', marginBottom: '20px', marginTop: '10px', textAlign: 'left' }}>Skills & Expertise</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start', overflowY: 'auto' }}>
            {skillsArray.map((skill: string, i: number) => (
              <span key={i} style={{ background: theme.colors.primaryBlue, color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}>{skill}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ----------------- Main Page Content -----------------
const CardDetailsContent = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = params.id as string;

  // Ref for hidden QR code (for downloading)
  const hiddenQrRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"share" | "settings" | "analytics">("share");
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState<"qr" | "link">("link");
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contactsCount, setContactsCount] = useState(0);
  const [showDelete, setShowDelete] = useState(false);

  // Growth Analytics State
  const [analytics, setAnalytics] = useState({
    contactsGrowth: 12,
    viewsGrowth: 8
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'analytics') setActiveTab('analytics');
    else if (tabParam === 'settings') setActiveTab('settings');
    else if (tabParam === 'share') setActiveTab('share');
  }, [searchParams]);

  const handleToggleActive = async () => {
    if (!card) return;
    const newStatus = !card.cardActive;
    const statusText = newStatus ? "Active" : "Paused";
    setCard((prev) => (prev ? { ...prev, cardActive: newStatus } : null));

    try {
      const response = await fetch(`/api/card/${cardId}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error("Failed to update status");
      const data = await response.json();
      if (data.card) {
        setCard((prev) => (prev ? { ...prev, cardActive: data.card.cardActive } : null));
      }
      toast.success(`Card is now ${statusText}`);
    } catch (error: any) {
      console.error("Error toggling card status:", error);
      toast.error("Failed to update status");
      setCard((prev) => (prev ? { ...prev, cardActive: !newStatus } : null));
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/card/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      if (!response.ok) throw new Error("Failed to delete card");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error deleting card:", error);
      toast.error(error.message || "Failed to delete card");
    }
  };

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/card/${cardId}`);
        if (!response.ok) throw new Error("Failed to fetch card");
        const data = await response.json();
        if (data.success && data.card) {
          setCard(data.card);
        } else {
          toast.error("Card not found");
          router.push("/dashboard");
        }
      } catch (error: any) {
        console.error("❌ Error fetching card:", error);
        toast.error(error.message || "Failed to load card");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    if (cardId) fetchCard();
  }, [cardId, router]);

  // ----------------- REAL-TIME CONNECTIONS LOGIC -----------------
  // Matches Dashboard logic exactly
  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/users/connections?type=accepted", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();

      // Calculate length from the requests/connections array just like Dashboard
      const connections = data.requests || [];
      setContactsCount(connections.length);
    } catch (error) {
      console.error("Error fetching connections", error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchConnections();

    // Poll every 5 seconds for real-time updates (Dashboard used 30s, but here we keep 5s for better responsiveness)
    const interval = setInterval(fetchConnections, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchConnections]);

  const mockUserData = {
    cardUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/cards/public/${cardId}`,
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        toast.error("Unable to copy. Try manually.");
      }
      document.body.removeChild(textArea);
    }
  };

  // ----------------- IMPROVED DOWNLOAD FUNCTION -----------------
  const downloadQR = () => {
    const qrContainer = hiddenQrRef.current;
    const svg = qrContainer?.querySelector("svg");

    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width + 40; // Add padding
        canvas.height = img.height + 40;

        // Fill white background for the QR Code
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 20, 20); // Draw image with padding
        }

        const a = document.createElement("a");
        a.download = `MyKard_QR_${cardId || 'code'}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
        toast.success("QR Code Downloaded!");
      };

      // Base64 encode the SVG data
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } else {
      toast.error("Generating QR code...");
    }
  };

  const incrementShareCount = async () => {
    try {
      await fetch(`/api/card/${cardId}/share`, { method: "POST" });
      setCard(prev => prev ? { ...prev, shares: (prev.shares || 0) + 1 } : prev);
    } catch (e) { console.error(e); }
  };

  // ----------------- UPDATED SHARE FUNCTION -----------------
  const shareProfile = async () => {
    const shareMessage = `Here is my MyKard digital profile. You can view my details and connect with me here.\n\nThis profile contains my contact information, social links, and business card.\n\nClick the link below to view the card:\n${mockUserData.cardUrl}`;

    const mobile = isMobile();

    // DIRECT LINK TAB - Always send message + link only (no QR)
    if (shareMethod === "link") {
      if (navigator.share && mobile) {
        // Mobile: Use native share
        try {
          await navigator.share({
            title: "MyKard Profile",
            text: shareMessage,
            url: mockUserData.cardUrl,
          });
          await incrementShareCount();
          toast.success("Shared successfully!");
        } catch (error) {
          console.log("Share cancelled or failed", error);
        }
      } else {
        // Desktop: Open WhatsApp Web
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, "_blank");
        await incrementShareCount();
      }
      return;
    }

    // QR TAB - Different behavior for mobile vs desktop
    if (shareMethod === "qr") {
      if (navigator.share && mobile) {
        // Mobile: 2-step share (QR first, then message + link)
        try {
          // Attempt to find the QR code in the active view, fallback to hidden ref if needed
          const qrWrapper = document.querySelector(`.${styles.qrWrapper}`) || hiddenQrRef.current;
          const svg = qrWrapper?.querySelector("svg");

          if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            await new Promise((resolve, reject) => {
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                // Add white background for better visibility
                if (ctx) {
                  ctx.fillStyle = "#FFFFFF";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
                }

                canvas.toBlob(async (blob) => {
                  if (blob) {
                    const file = new File([blob], `MyKard_QR_${cardId}.png`, {
                      type: "image/png",
                    });

                    // Step 1: Share QR image only
                    try {
                      await navigator.share({
                        files: [file],
                        title: "MyKard QR Code"
                      });

                      // Step 2: After a short delay, share message + link
                      setTimeout(async () => {
                        try {
                          await navigator.share({
                            title: "MyKard Profile",
                            text: shareMessage,
                            url: mockUserData.cardUrl,
                          });
                          await incrementShareCount();
                        } catch (error) {
                          console.log("Could not share message after QR:", error);
                        }
                      }, 500);

                    } catch (error) {
                      console.log("Could not share QR image, fallback to message only:", error);
                      // Fallback: Share message + link only
                      try {
                        await navigator.share({
                          title: "MyKard Profile",
                          text: shareMessage,
                          url: mockUserData.cardUrl,
                        });
                        await incrementShareCount();
                      } catch (e) {
                        console.error("Fallback share failed", e);
                      }
                    }
                  }
                  resolve(null);
                }, "image/png");
              };
              img.onerror = reject;
              img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
            });
          } else {
            // No QR found, fallback to message + link only
            await navigator.share({
              title: "MyKard Profile",
              text: shareMessage,
              url: mockUserData.cardUrl,
            });
            await incrementShareCount();
          }
        } catch (error) {
          console.log("QR share failed, fallback to message only:", error);
          // Fallback: Share message + link only
          try {
            await navigator.share({
              title: "MyKard Profile",
              text: shareMessage,
              url: mockUserData.cardUrl,
            });
            await incrementShareCount();
          } catch (e) { console.log(e); }
        }
      } else {
        // Desktop: WhatsApp Web cannot send images via URL, send message + link only
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, "_blank");
        await incrementShareCount();
      }
    }
  };

  const renderPercentageBadge = (value: number) => {
    if (value > 0) return (<div className="bg-[#dcfce7] text-[#166534] text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><ArrowUpRight size={10} /> + {value}%</div>);
    else if (value < 0) return (<div className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><ArrowDownRight size={10} /> {value}%</div>);
    return (<div className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><Minus size={10} /> 0%</div>);
  };

  if (isLoading) {
    return (
      <div className={`${styles.pageContainer} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  if (!card) return <div className={`${styles.pageContainer}`}>Card Not Found</div>;

  return (
    <>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.cardPreviewArea}>
            <CardPreview card={card} />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={styles.settingsPanel}
          >
            <div className={styles.tabsContainer}>
              <div className={styles.tabsList}>
                {["share", "settings", "analytics"].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)} className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ""}`}>{tab}</button>
                ))}
              </div>
              <div className={styles.editCardWrapper}>
                <Link href={`/dashboard/edit?id=${cardId}`}>
                  <button className={styles.editCardBtn}><FiEdit size={16} /> <span className={styles.editBtnText}>Edit Card</span></button>
                </Link>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "share" && (
                <motion.div key="share" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                  <div className={styles.shareToggleWrapper}>
                    <div className={styles.shareToggle}>
                      <button onClick={() => setShareMethod("qr")} className={`${styles.shareToggleButton} ${shareMethod === "qr" ? styles.shareToggleButtonActive : ""}`}><QrCode className="w-4 h-4" /> QR Code</button>
                      <button onClick={() => setShareMethod("link")} className={`${styles.shareToggleButton} ${shareMethod === "link" ? styles.shareToggleButtonActive : ""}`}><LinkIcon className="w-4 h-4" /> Direct Link</button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    {shareMethod === "link" ? (
                      <div className={styles.directLinkBox} onClick={() => copyToClipboard(mockUserData.cardUrl)}><div className={styles.linkDisplay}><p className={styles.linkText}>{mockUserData.cardUrl}</p> <Copy size={16} className={styles.copyIconOverlay} /></div></div>
                    ) : (
                      <div className={styles.qrWrapper}><div className={styles.qrBox}><QRCode value={mockUserData.cardUrl} size={180} /></div></div>
                    )}
                  </div>

                  <div style={{ height: "16px" }}></div>
                  {!card?.cardActive && <div style={{ padding: "12px", backgroundColor: "#fef3c7", borderRadius: "8px", textAlign: "center", marginBottom: "16px" }}><p style={{ color: "#92400e", fontSize: "14px", fontWeight: "500", margin: 0 }}>⚠️ This card is paused. Activate it in Settings.</p></div>}

                  <div className={styles.actionButtons}>
                    <motion.button onClick={() => copyToClipboard(mockUserData.cardUrl)} className={styles.actionBtn} disabled={!card?.cardActive} style={{ opacity: card?.cardActive ? 1 : 0.5 }}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Copied!" : "Copy Link"}</motion.button>
                    <motion.button onClick={downloadQR} className={styles.actionBtn} disabled={!card?.cardActive} style={{ opacity: card?.cardActive ? 1 : 0.5 }}><Download className="w-4 h-4" /> Download QR</motion.button>
                    <motion.button onClick={shareProfile} className={styles.actionBtn} disabled={!card?.cardActive} style={{ opacity: card?.cardActive ? 1 : 0.5 }}><Share2 className="w-4 h-4" /> Share Profile</motion.button>
                  </div>
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${styles.tabContent} ${styles.analyticsWrapper}`}>
                  <h3 className={styles.analyticsTitle}><BarChart3 className="w-5 h-5" /> Analytics Overview</h3>
                  <div className={styles.statsGrid}>
                    {[{ label: "Profile Views", value: card.views?.toString() || "0", icon: Eye }, { label: "Shares", value: card.shares?.toString() || "0", icon: Share2 }, { label: "Connections", value: contactsCount.toString(), icon: Users }].map((s, i) => (
                      <div key={i} className={styles.statCard}><div className={styles.statIcon}><s.icon className="w-6 h-6" /></div><p className={styles.statValue}>{s.value}</p><p className={styles.statLabel}>{s.label}</p></div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${styles.tabContent} ${styles.settingsContent}`}>
                  <div className={`${styles.settingsCard} ${styles.privacyCard}`}>
                    <h3 className={styles.settingsCardTitle} style={{ marginBottom: "1rem" }}><div className={`${styles.dot}`} style={{ backgroundColor: "var(--color-success)" }}></div> Privacy & Visibility</h3>
                    <div className={styles.settingsItem}>
                      <div className={styles.settingsInfo}><h4 className={styles.settingsLabel}>Pause Card</h4><p className={styles.settingsDescription}>{card?.cardActive ? "Card is active. Click to pause." : "Card is paused. Click to activate."}</p></div>
                      <div className={styles.settingsControl}><button onClick={handleToggleActive} className={styles.toggleBtn}>{card?.cardActive ? <FiToggleRight className={`${styles.toggleIcon} ${styles.active}`} /> : <FiToggleLeft className={`${styles.toggleIcon} ${styles.inactive}`} />}</button></div>
                    </div>
                  </div>
                  <div className={`${styles.settingsCard} ${styles.dangerCard}`}>
                    <h3 className={`${styles.settingsCardTitle} ${styles.dangerCardTitle}`}><div className={`${styles.dot}`}></div> Danger Zone</h3>
                    <div className={`${styles.settingsItem} ${styles.dangerItem}`}>
                      <div className={styles.settingsInfo}><h4 className={styles.settingsLabel}>Delete Card</h4><p className={styles.settingsDescription}>Delete this card permanently.</p></div>
                      <div className={styles.settingsControl}><button onClick={() => setShowDelete(true)} className={`${styles.settingsButton} ${styles.deleteButton}`}>Delete Card</button></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Hidden QR for Downloading - Always rendered so download logic works even on Link tab */}
      <div style={{ display: 'none', position: 'fixed', pointerEvents: 'none' }}>
        <div ref={hiddenQrRef}>
          <QRCode value={mockUserData.cardUrl} size={500} />
        </div>
      </div>

      {showDelete && <Delete cardname={card.cardName ?? ""} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
    </>
  );
};

const CardDetailsPageWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <CardDetailsContent />
  </Suspense>
);

export default CardDetailsPageWrapper;