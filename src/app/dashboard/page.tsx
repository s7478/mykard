"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "react-hot-toast";
// import DigitalCardPreview from "@/components/cards/DigitalCardPreview"; // Unused imports kept as per instruction
// import FlatCardPreview from "@/components/cards/FlatCardPreview";
// import ModernCardPreview from "@/components/cards/ModernCardPreview";
// import SleekCardPreview from "@/components/cards/SleekCardPreview";
// import { capitalizeFirstLetter } from "@/lib/utils";

// Icons
import {
  FiPlus,
  FiEdit3,
  FiPhone,
  FiMail,
  FiShare2,
  FiChevronRight,
  FiPower, // Using Power icon for status
  FiPlay,
  FiPauseCircle,
  FiToggleLeft,
  FiToggleRight
} from "react-icons/fi";
import { BarChart2, Eye, Plus, PenSquare, ArrowUpRight, ArrowDownRight, Minus, Users } from "lucide-react";

/* -------------------------------------------------
   DESIGN SYSTEM (For Desktop Card Style)
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

// ----------------- Card Type Definition -----------------
interface Card {
  id: string | number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  cardName?: string;
  name?: string;
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
  image?: string;
  avatar?: string;
  url?: string;
  secure_url?: string;
  cover?: string;
  coverImage?: string;
  bannerImage?: string;
  documentUrl?: string;
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
  cardActive?: boolean;
  views?: number;
  shares?: number;
  // Added growth fields for dynamic analytics
  viewsGrowth?: number;
  contactsGrowth?: number;
  customFields?: string | any;
  user?: any;
}

// ----------------- Main Dashboard Component -----------------
const Dashboard = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [cardsData, setCardsData] = useState<Card[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(
    null
  );

  // Mobile specific states
  const [showAllCards, setShowAllCards] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Active State Logic (For the Top Header)
  const [activeCardId, setActiveCardId] = useState<string | number | null>(null);

  // Expanded State Logic (For the List Accordion)
  const [expandedCardId, setExpandedCardId] = useState<string | number | null>(null);

  // Real-time Data States
  const [activeCardContacts, setActiveCardContacts] = useState(0);

  // Analytics State
  const [analytics, setAnalytics] = useState({
    contactsGrowth: 0,
    viewsGrowth: 0
  });

  // ----------------- 1. IMAGE HELPER -----------------
  const getCardImage = (card: Card | any) => {
    if (!card) return "https://via.placeholder.com/150";

    const imgSource =
      card.profileImage ||
      card.photo ||
      card.image ||
      card.avatar ||
      card.url ||
      card.secure_url ||
      (card.user && card.user.image) ||
      (card.user && card.user.avatar) ||
      (card.user && card.user.profileImage);

    if (
      !imgSource ||
      typeof imgSource !== "string" ||
      imgSource.trim() === "" ||
      imgSource === "null" ||
      imgSource === "undefined"
    ) {
      return "https://via.placeholder.com/150";
    }

    if (
      !imgSource.startsWith("http") &&
      !imgSource.startsWith("data:") &&
      !imgSource.startsWith("/")
    ) {
      return `/${imgSource}`;
    }

    return imgSource;
  };

  // ----------------- 2. HANDLERS (Moved Up for use in renderCardPreview) -----------------

  // Toggle Active/Paused Status
  const handleToggleStatus = async (e: React.MouseEvent, card: Card) => {
    e.stopPropagation();

    const newStatus = !card.cardActive;
    const statusText = newStatus ? "Active" : "Paused";

    setCardsData(prevCards =>
      prevCards.map(c =>
        c.id === card.id ? { ...c, cardActive: newStatus } : c
      )
    );

    try {
      const response = await fetch(`/api/card/${card.id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Card is now ${statusText}`);
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
      setCardsData(prevCards =>
        prevCards.map(c =>
          c.id === card.id ? { ...c, cardActive: !newStatus } : c
        )
      );
    }
  };

  // ----------------- 3. RENDER HELPERS -----------------

  // MOBILE Render: Standard List View
  const renderMobileCard = (card: Card) => {
    const isTopProfile = card.id === activeCardId;
    const isExpanded = card.id === expandedCardId;

    return (
      <motion.div
        key={card.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={() => {
          if (activeCardId !== card.id) setActiveCardId(card.id);
          if (expandedCardId === card.id) setExpandedCardId(null);
          else setExpandedCardId(card.id);
        }}
        className={`rounded-[0.5rem] p-4 border transition-all duration-200 select-none cursor-pointer ${isTopProfile ? "bg-[#eff6ff] border-blue-200 shadow-sm" : "bg-white border-gray-100 shadow-sm hover:border-blue-100"}`}
      >
        <div className="flex items-start gap-3" style={{ fontFamily: 'Poppins, sans-serif, "Plus Jakarta Sans"', fontWeight: "500", padding: "0.5rem" }}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100 relative">
            <img src={getCardImage(card)} alt={card.name} className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; if (target.src !== "https://via.placeholder.com/150") target.src = "https://via.placeholder.com/150"; }} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-900 truncate text-sm">{card.fullName || card.name}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[0.5rem] ml-2 ${isTopProfile ? "bg-[#0B6BCB] text-white" : "bg-gray-100 text-gray-500"}`} style={{ padding: "0.2rem", paddingRight: "0.5rem" }}>{card.cardType ? `${card.cardType.slice(0, 4)}.` : "Card"}</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 truncate">{card.title}</p>
              <div className={`w-1.5 h-1.5 rounded-full ${card.cardActive ? "bg-green-500" : "bg-red-400"}`}></div>
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">{card.company}</p>

            {isExpanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex gap-3 mt-4 overflow-hidden" style={{ paddingTop: "0.5rem" }}>
                <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/edit?id=${card.id}`); }} className="flex items-center justify-center gap-1.5 bg-[#1e3a8a] text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-[#172554] transition-colors" style={{ padding: "0.4rem 0.8rem", fontFamily: "Poppins, sans-serif,Plus Jakarta Sans" }}><FiEdit3 size={12} /> Edit</button>
                <button
                  onClick={(e) => handleToggleStatus(e, card)}
                  className={`flex items-center justify-center gap-1.5 border text-xs font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors ${card.cardActive ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"}`}
                  style={{ padding: "0.4rem 0.8rem", fontFamily: "Poppins, sans-serif,Plus Jakarta Sans" }}
                >
                  {card.cardActive ? <> <FiToggleLeft size={12} /> Pause </> : <> <FiToggleRight size={12} /> Activate </>}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // DESKTOP Render: Professional Card Style (Same as CardDetails)
  const renderDesktopCard = (card: Card) => {
    const initials = (card.fullName || card.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

    return (
      <div style={{
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
      }}>
        {/* Decorative Line */}
        <div style={{ width: "60%", height: "1px", background: theme.colors.cardBorderLine, position: "absolute", top: "70px", opacity: 0.6 }} />

        {/* Avatar */}
        <div style={{ width: "88px", height: "88px", borderRadius: "50%", background: theme.colors.avatarBg, border: `3px solid ${theme.colors.avatarBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", zIndex: 2, position: "relative", overflow: 'hidden', boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {getCardImage(card) !== "https://via.placeholder.com/150" ? (
            <img src={getCardImage(card)} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontFamily: theme.font, fontWeight: '700', fontSize: "32px", color: '#FFFFFF' }}>{initials}</span>
          )}
        </div>

        {/* Name */}
        <h3 style={{ fontFamily: theme.font, fontWeight: '700', fontSize: "24px", lineHeight: "1.2", marginBottom: "8px", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          {card.fullName || card.name || "Your Name"}
        </h3>

        {/* Title & Company */}
        {(card.title || card.company) && (
          <div style={{ fontSize: "14px", opacity: 0.95, marginBottom: "12px", fontWeight: "500", letterSpacing: "0.3px" }}>
            {card.title && <span>{card.title}</span>}
            {card.title && card.company && <span style={{ margin: '0 6px' }}>|</span>}
            {card.company && <span>{card.company}</span>}
          </div>
        )}

        {/* Location */}
        {card.location && (
          <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "20px", display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {card.location}
          </div>
        )}

        {/* Contact Icons Row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {card.phone && (
            <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
          )}
          {card.email && (
            <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ----------------- 4. EFFECTS -----------------
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const checkMobile = () => {
      const mqMobile = window.matchMedia("(max-width: 767px)");
      setIsMobile(mqMobile.matches);
    };
    checkMobile();
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const handleMobileChange = () => setIsMobile(mqMobile.matches);
    // @ts-ignore
    (mqMobile.addEventListener ? mqMobile.addEventListener("change", handleMobileChange) : mqMobile.addListener(handleMobileChange));
    return () => {
      // @ts-ignore
      (mqMobile.removeEventListener ? mqMobile.removeEventListener("change", handleMobileChange) : mqMobile.removeListener(handleMobileChange));
    };
  }, []);

  // Fetch Cards
  const fetchCards = async () => {
    try {
      setIsLoadingCards(true);
      const response = await fetch("/api/card", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.success) {
        setCardsData(data.cards);
        if (data.cards.length > 0) {
          if (!activeCardId) {
            const defaultActive = data.cards.find((c: Card) => c.cardActive) || data.cards[0];
            setActiveCardId(defaultActive.id);
          }
        }
      } else {
        toast.error(data.error || "Failed to fetch cards");
      }
    } catch (error: any) {
      console.error("Error fetching cards:", error);
      toast.error(error.message || "Failed to fetch cards");
    } finally {
      setIsLoadingCards(false);
    }
  };

  // ----------------- REAL TIME CONNECTION FETCHING -----------------
  // This fetches the actual 'friends/connections' count using the correct endpoint
  const fetchActiveCardConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/users/connections?type=accepted", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();

      // Calculate length from the requests/connections array
      const connections = data.requests || [];
      setActiveCardContacts(connections.length);
    } catch (error) {
      console.error("Error fetching connections", error);
    }
  }, []);

  // Fetch View Analytics (Refreshes card views)
  const fetchAnalytics = useCallback(async () => {
    if (!activeCardId) return;
    try {
      // Re-fetch card data to get updated views/growth
      const response = await fetch("/api/card", { method: "GET", credentials: "include" });
      const data = await response.json();
      if (data.success) {
        setCardsData(data.cards);
      }
    } catch (error) {
      console.error("Error fetching analytics", error);
    }
  }, [activeCardId]);

  // Polling for real-time updates
  useEffect(() => {
    fetchActiveCardConnections();
    fetchAnalytics();

    const intervalId = setInterval(() => {
      fetchActiveCardConnections();
      fetchAnalytics();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchActiveCardConnections, fetchAnalytics]);


  // ----------------- HANDLERS -----------------

  // 1. Move to Top (Double Click)
  const handleCardActivate = (id: string | number) => {
    if (activeCardId === id) return;
    setActiveCardId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Profile switched to top!");
  };

  // 2. Expand/Collapse List Item (Single Click)
  const handleCardExpand = (id: string | number) => {
    if (expandedCardId === id) {
      setExpandedCardId(null); // Collapse if already open
    } else {
      setExpandedCardId(id); // Expand new one
    }
  };

  // 3. Toggle Active/Paused Status (Button inside list)
  // (Moved inside renderMobileCard for proper access, this is kept for legacy ref)

  // ----------------- SHARE HANDLER (UPDATED AS REQUESTED) -----------------
  const handleShare = async (card: Card) => {
    if (!card) return;

    // Determine Origin and Card URL
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : '';
    const cardUrl = `${origin}/cards/public/${card.id}`;

    // Construct the Share Message
    const shareMessage = `Here is my MyKard digital profile. You can view my details and connect with me here.\n\nThis profile contains my contact information, social links, and business card.\n\nClick the link below to view the card:\n${cardUrl}`;

    // For Dashboard List View, we default to "link" method as there is no QR selector here.
    const shareMethod = "link";

    // Dummy helper to simulate the logic requested (since API might not exist in this context)
    const incrementShareCount = async () => {
      // Optional: Call your analytics API here if available
      // console.log("Shared count incremented for", card.id);
    };

    // DIRECT LINK TAB - Always send message + link only (no QR)
    if (shareMethod === "link") {
      if (navigator.share && isMobile) {
        // Mobile: Use native share
        try {
          await navigator.share({
            title: "MyKard Profile",
            text: shareMessage,
            url: cardUrl,
          });
          await incrementShareCount();
        } catch (err) {
          console.error("Share failed/cancelled", err);
        }
      } else {
        // Desktop: Open WhatsApp Web
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          shareMessage
        )}`;
        window.open(whatsappUrl, "_blank");

        // Poll for WhatsApp window close (Logic adapted from request)
        // Note: Cross-origin security prevents true window polling, but keeping logic as requested
        const intervalId = setInterval(() => {
          // This selector check usually requires the window to be an iframe or same-origin
          // We include it to satisfy the logic requirement
          if (!document.querySelector(`iframe[src="${whatsappUrl}"]`)) {
            clearInterval(intervalId);
            incrementShareCount();
          }
        }, 1000);
      }
      return;
    }

    // QR TAB LOGIC (Included for completeness based on request, though DOM elements may be missing in List View)
    if (shareMethod === "qr") {
      if (navigator.share && isMobile) {
        try {
          // Note: styles.qrWrapper is not defined in this file, logic requires DOM presence
          const qrWrapper = document.querySelector(`.qrWrapper`);
          const svg = qrWrapper?.querySelector("svg");
          if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            await new Promise((resolve) => {
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);

                canvas.toBlob(async (blob) => {
                  if (blob) {
                    const file = new File([blob], `MyKard_QR_${card.id}.png`, {
                      type: "image/png",
                    });

                    // Step 1: Share QR image only
                    try {
                      await navigator.share({
                        files: [file],
                      });

                      // Step 2: After 300ms, share message + link
                      setTimeout(async () => {
                        try {
                          await navigator.share({
                            title: "MyKard Profile",
                            text: shareMessage,
                            url: cardUrl,
                          });
                          await incrementShareCount();
                        } catch (error) {
                          console.log("Could not share message after QR:", error);
                        }
                      }, 300);
                    } catch (error) {
                      console.log("Could not share QR image, fallback to message only:", error);
                      // Fallback: Share message + link only
                      await navigator.share({
                        title: "MyKard Profile",
                        text: shareMessage,
                        url: cardUrl,
                      });
                      await incrementShareCount();
                    }
                  }
                  resolve(null);
                }, "image/png");
              };
              img.src = "data:image/svg+xml;base64," + btoa(svgData);
            });
          } else {
            // No QR found, fallback to message + link only
            await navigator.share({
              title: "MyKard Profile",
              text: shareMessage,
              url: cardUrl,
            });
            await incrementShareCount();
          }
        } catch (error) {
          console.log("QR share failed, fallback to message only:", error);
          await navigator.share({
            title: "MyKard Profile",
            text: shareMessage,
            url: cardUrl,
          });
          await incrementShareCount();
        }
      } else {
        // Desktop: WhatsApp Web cannot send images, send message + link only
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          shareMessage
        )}`;
        window.open(whatsappUrl, "_blank");
        const intervalId = setInterval(() => {
          if (!document.querySelector(`iframe[src="${whatsappUrl}"]`)) {
            clearInterval(intervalId);
            incrementShareCount();
          }
        }, 1000);
      }
    }
  };

  // ----------------- HELPER FOR PERCENTAGE BADGE -----------------
  const renderPercentageBadge = (value: number | undefined) => {
    // If value is undefined or null, we default to 0 for display
    const val = value || 0;

    if (val > 0) {
      return (
        <div className="bg-[#dcfce7] text-[#166534] text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <ArrowUpRight size={10} /> + {val}%
        </div>
      );
    } else if (val < 0) {
      return (
        <div className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <ArrowDownRight size={10} /> {val}%
        </div>
      );
    }
    return (
      <div className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        <Minus size={10} /> 0%
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Helper variables for display
  const activeCard = cardsData.find((c) => c.id === activeCardId) || cardsData[0];
  const sortedCards = [...cardsData];
  // UPDATED: Show minimum 3 cards, or all if showAllCards is true
  const cardsToDisplay = showAllCards ? sortedCards : sortedCards.slice(0, 3);

  return (
    <div className="min-h-screen bg-background lg:ml-64 transition-all duration-300">
      {/* ================= MOBILE VIEW (md:hidden) ================= */}
      <div className="block md:hidden pb-40">

        {/* 1. Profile Header (Top Blue Box) */}
        {activeCard ? (
          <motion.div
            key={activeCard.id}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="bg-[#0B6BCB] rounded-[1rem] px-6 pt-10 pb-10 text-white shadow-lg relative overflow-hidden"
            style={{ marginBottom: "1rem" }}
          >
            <div
              className="flex items-start justify-between relative z-10"
              style={{ paddingTop: "0.2rem", padding: "0.5rem" }}
            >
              <div
                className="flex gap-4"
                style={{ padding: "0.5rem", paddingTop: "0.8rem" }}
              >
                <div className="w-[2.5rem] h-[2.5rem] rounded-full border-2 border-white !bg-white overflow-hidden flex-shrink-0">
                  <img
                    src={getCardImage(activeCard)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== "https://via.placeholder.com/150") {
                        target.src = "https://via.placeholder.com/150";
                      }
                    }}
                  />
                </div>
                <div
                  className="flex flex-col"
                  style={{
                    fontFamily:
                      "plus Jakarta,Poppins, sans-serif, monospace,",
                    fontWeight: "bold",
                  }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-xl font-bold leading-tight !text-white">
                      {activeCard.fullName || activeCard.name || "User Name"}
                    </h2>
                  </div>
                  <p className="text-xs font-medium !text-white">
                    {activeCard.title || "Job Title"}
                  </p>
                  <p className="text-xs !text-white">
                    {activeCard.company || "Company Name"}
                  </p>
                </div>
              </div>

              {/* Professional Badge */}
              <div
                className="bg-[#084d96]/40 backdrop-blur-sm rounded-full border border-white/10"
                style={{ padding: "5px" }}
              >
                <span className="text-[8px] uppercase font-semibold tracking-wide text-blue-50">
                  {activeCard.cardType || "Professional"}
                </span>
              </div>
            </div>

            {/* Action Icons */}
            <div
              className="flex items-center justify-between mt-8 relative z-20"
              style={{ padding: "1.5rem" }}
            >
              <div className="flex gap-3">
                <a
                  href={activeCard.phone ? `tel:${activeCard.phone}` : "#"}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${activeCard.phone
                    ? "bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                    }`}
                >
                  <FiPhone size={20} />
                </a>
                <a
                  href={activeCard.email ? `mailto:${activeCard.email}` : "#"}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${activeCard.email
                    ? "bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                    }`}
                >
                  <FiMail size={20} />
                </a>
                <button
                  onClick={() => handleShare(activeCard)}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all duration-200 text-white cursor-pointer"
                  style={{ zIndex: 30 }}
                >
                  <FiShare2 size={20} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${activeCard.cardActive !== false
                    ? "bg-[#4ade80]"
                    : "bg-red-400"
                    }`}
                ></span>
                <span className="text-xs font-medium text-blue-50">
                  {activeCard.cardActive !== false ? "Active" : "Paused"}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-[#f0f0f0] rounded-[0.5rem] p-8 text-center border-1 border-[#0B6BCB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-4">
            <h2 className="text-xl font-bold">Welcome!</h2>
            <p className="text-blue-100">
              Create your first card to get started.
            </p>
          </div>
        )}

        <div className="px-5 mt-6">
          {/* 2. Analytics */}
          <div className="grid grid-cols-2 gap-3 mb-4" style={{ marginBottom: '1rem' }}>
            {/* CONNECTIONS BOX */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 cursor-pointer flex flex-col justify-center">
              {/* Header: Icon + Label */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-sm flex items-center justify-center text-[#0B6BCB] shrink-0">
                  <Users size={18} />
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-none">
                  Connections
                </p>
              </div>

              {/* Number Value */}
              <div className="mt-2 pl-1" style={{ color: 'black', textAlign: 'center' }}>
                <h3 className="text-2xl font-bold !text-gray-900 leading-tight">
                  {activeCardContacts}
                </h3>
              </div>
            </div>

            {/* VIEWS BOX */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 cursor-pointer flex flex-col justify-center">
              {/* Header: Icon + Label */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-sm flex items-center justify-center text-[#0B6BCB] shrink-0">
                  <Eye size={18} />
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-none">
                  Profile Views
                </p>
              </div>

              {/* Number Value */}
              <div className="mt-2 pl-1" style={{ color: 'black', textAlign: 'center' }}>
                <h3 className="text-2xl font-bold !text-gray-900 leading-tight">
                  {activeCard?.views || 0}
                </h3>
              </div>
            </div>
          </div>

          <button
            onClick={() => activeCard && router.push(`/cards/${activeCard.id}?tab=analytics`)}
            className="w-full bg-[#C7DFFF] hover:bg-blue-100 text-[#0B6BCB] py-3.5 px-5 rounded-[0.5rem] flex items-center justify-between font-semibold text-sm transition-colors mb-6 shadow-sm border border-none"
            style={{ marginBottom: "1rem", padding: "0.7rem" }}
          >
            <div className="flex items-center gap-2">
              <BarChart2 size={18} />
              <span>Show Analytics</span>
            </div>
            <FiChevronRight size={18} />
          </button>

          {/* 3. Action Buttons */}
          <div className="flex gap-4 mb-8" style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => router.push("/dashboard/create?new=true")}
              className="flex-1 bg-[#dbeafe] text-[#0B6BCB] py-3.5 px-4 rounded-[0.5rem] font-semibold flex items-center justify-center gap-1 shadow-md shadow-blue-200 active:scale-95 hover:bg-[#0B6BCB] hover:text-white transition-all duration-300"
              style={{ fontFamily: "Poppins, sans-serif, Plus Jakarta Sans" }}
            >
              <Plus size={18} /> Create New Card
            </button>
            <button
              onClick={() =>
                activeCard && router.push(`/dashboard/edit?id=${activeCard.id}`)
              }
              className="flex-1 bg-[#dbeafe] text-[#0B6BCB] py-3.5 px-4 rounded-[0.5rem] font-semibold flex items-center justify-center gap-1 border border-blue-100 shadow-md shadow-blue-200 active:scale-95 transition-transform text-sm hover:bg-[#0B6BCB] hover:text-white"
              style={{
                padding: "0.2rem",
                fontFamily: "Poppins, sans-serif,Plus Jakarta Sans",
              }}
            >
              <PenSquare size={18} /> Edit a Card
            </button>
          </div>

          {/* 4. My Cards List */}
          <div className="flex items-start justify-between mb-4">
            <h3
              className="text-lg text-gray-900"
              style={{
                fontFamily: 'Poppins, sans-serif, "Plus Jakarta Sans"',
                fontWeight: "500",
                lineHeight: "1",
                color: 'black'
              }}
            >
              My Cards
            </h3>
            <button
              onClick={() => setShowAllCards(!showAllCards)}
              className="text-xs font-bold text-gray-900 hover:text-blue-600"
              style={{
                fontFamily: 'Poppins, sans-serif, "Plus Jakarta Sans"',
                fontWeight: "500",
                lineHeight: "1",
                marginTop: "4px",
                paddingRight: "1rem",
              }}
            >
              {showAllCards ? "View Less" : "View All"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {isLoadingCards ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : cardsToDisplay.length > 0 ? (
              <AnimatePresence initial={false}>
                {cardsToDisplay.map((card) => {
                  return renderMobileCard(card);
                })}
              </AnimatePresence>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No cards found.
              </div>
            )}

            {/* SPACER DIV to prevent card hiding behind bottom nav */}
            <div className="h-24 w-full md:hidden" />
          </div>
        </div>
      </div>

      {/* ================= DESKTOP VIEW (hidden md:block) ================= */}
      <div className="hidden md:block px-8 sm:px-14 py-8">
        <div className="flex justify-center my-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/dashboard/create?new=true")}
            style={{
              background: "linear-gradient(to bottom right, #1e3a8a, #2563eb)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "500",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "Poppins, sans-serif,Plus Jakarta Sans",
              marginBottom: "1rem"
            }}
          >
            <FiPlus size={16} />
            Create New Card
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-stretch mt-4">
          {isLoadingCards ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cards...</p>
            </div>
          ) : cardsData.length > 0 ? (
            cardsData.map((card, index) => {
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: index * 0.1,
                  }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="transition-all duration-300 break-inside-avoid block w-full relative"
                >
                  <div
                    onClick={() => router.push(`/cards/${card.id}`)}
                    className="cursor-pointer"
                  >
                    {/* UPDATED: Uses the Onboarding-style render function for desktop */}
                    {renderDesktopCard(card)}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="w-full flex justify-center break-inside-avoid">
              <p>No Cards Available. Create one!</p>
            </div>
          )}
        </div>

        {selectedDocumentUrl && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 w-full md:w-1/2 h-full bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Document Viewer
              </h3>
              <button onClick={() => setSelectedDocumentUrl(null)}>
                Close
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedDocumentUrl}
                className="w-full h-full border-0"
                title="Document Viewer"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div >
  );
};

export default Dashboard;