"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "react-hot-toast";
import DigitalCardPreview from "@/components/cards/DigitalCardPreview";
import FlatCardPreview from "@/components/cards/FlatCardPreview";
import ModernCardPreview from "@/components/cards/ModernCardPreview";
import SleekCardPreview from "@/components/cards/SleekCardPreview";
import { capitalizeFirstLetter } from "@/lib/utils";

// Icons
import {
  FiPlus,
  FiEdit3,
  FiPhone,
  FiMail,
  FiShare2,
  FiChevronRight,
  FiPlay,
  FiPauseCircle
} from "react-icons/fi";
import { BarChart2, Eye, Plus, PenSquare } from "lucide-react";

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

  const [activeCardContacts, setActiveCardContacts] = useState(0);

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

  // ----------------- 2. PREVIEW HELPER -----------------
  const renderCardPreview = (card: Card) => {
    const capitalizedFullName = capitalizeFirstLetter(card.fullName || "");
    const nameParts = capitalizedFullName.split(" ");

    let parsedCustomFields = [];
    try {
      if (card.customFields) {
        parsedCustomFields =
          typeof card.customFields === "string"
            ? JSON.parse(card.customFields)
            : card.customFields;
      }
    } catch (err) {
      console.error("Failed to parse custom fields", err);
    }

    const commonProps = {
      firstName: nameParts[0] || "",
      middleName: nameParts.length === 3 ? nameParts[1] : "",
      lastName: nameParts.length >= 2 ? nameParts.slice(-1).join("") : "",
      cardName: capitalizeFirstLetter(card.cardName || card.name || ""),
      title: card.title || "",
      company: card.company || "",
      location: card.location || (card as any).user?.location || "",
      about: card.bio || card.about || card.description || "",
      skills: card.skills || "",
      portfolio: card.portfolio || "",
      experience: card.experience || "",
      services: card.services || "",
      review: card.review || "",
      photo: getCardImage(card),
      cover: card.coverImage || card.bannerImage || card.cover || "",
      email: card.email || "",
      phone: card.phone || "",
      linkedin: card.linkedinUrl || card.linkedin || "",
      website: card.websiteUrl || card.website || "",
      themeColor1: card.selectedColor || "#3b82f6",
      themeColor2: card.selectedColor2 || "#2563eb",
      textColor: card.textColor || "#ffffff",
      fontFamily: card.selectedFont || "system-ui, sans-serif",
      cardType: card.cardType || "",
      documentUrl: card.documentUrl || "",
      customFields: parsedCustomFields,
      onDocumentClick: (url: string) => setSelectedDocumentUrl(url),
    };

    const selectedDesign = card.selectedDesign || "Classic";

    switch (selectedDesign) {
      case "Flat":
        return <FlatCardPreview {...commonProps} />;
      case "Modern":
        return <ModernCardPreview {...commonProps} />;
      case "Sleek":
        return <SleekCardPreview {...commonProps} />;
      case "Classic":
      default:
        return <DigitalCardPreview {...commonProps} />;
    }
  };

  // ----------------- 3. EFFECTS -----------------
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
          const defaultActive =
            data.cards.find((c: Card) => c.cardActive) || data.cards[0];
          setActiveCardId(defaultActive.id);
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

  // Fetch Contacts for the Active Card
  const fetchActiveCardContacts = useCallback(async () => {
    if (!activeCardId) return;
    try {
      const res = await fetch("/api/contacts", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const allContacts = (data.contacts || []) as any[];

      const filtered = allContacts.filter(
        (c: any) => c.card && c.card.id === activeCardId
      );
      setActiveCardContacts(filtered.length);
    } catch (error) {
      console.error("Error fetching contacts", error);
    }
  }, [activeCardId]);

  useEffect(() => {
    fetchActiveCardContacts();
  }, [fetchActiveCardContacts]);

  // ----------------- HANDLERS -----------------

  // 1. COMBINED HANDLER: Expands the list item AND Updates Top View
  const handleCardInteraction = (id: string | number) => {
    // A. Update the Top Active Profile immediately
    if (activeCardId !== id) {
      setActiveCardId(id);
    }

    // B. Handle the Accordion Expansion
    if (expandedCardId === id) {
      setExpandedCardId(null); // Collapse if already open
    } else {
      setExpandedCardId(id); // Expand new one
    }
  };

  // 2. Toggle Active/Paused Status
  const handleToggleStatus = async (e: React.MouseEvent, card: Card) => {
    e.stopPropagation();

    const newStatus = !card.cardActive;
    const statusText = newStatus ? "Active" : "Paused";

    // Optimistic UI Update
    setCardsData(prevCards =>
      prevCards.map(c =>
        c.id === card.id ? { ...c, cardActive: newStatus } : c
      )
    );

    try {
      // Correct API Endpoint
      const response = await fetch(`/api/card/${card.id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
      // Revert UI on error
      setCardsData(prevCards =>
        prevCards.map(c =>
          c.id === card.id ? { ...c, cardActive: !newStatus } : c
        )
      );
    }
  };

  // ----------------- SHARE HANDLER -----------------
  const handleShare = async (card: Card) => {
    if (!card) return;

    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : '';

    if (!origin) {
      toast.error("Unable to determine URL");
      return;
    }

    const publicUrl = `${origin}/cards/public/${card.id}`;

    const shareData = {
      title: card.fullName || "Digital Business Card",
      text: `Check out my digital card`,
      url: publicUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.warn("Share API cancelled or failed, trying clipboard...", err);
      }
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Clipboard failed", err);
      toast.error("Failed to share. Please copy the URL manually.");
    }
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
  const cardsToDisplay = showAllCards ? sortedCards : sortedCards.slice(0, 4);

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
          <div
            className="grid grid-cols-2 gap-4 mb-4"
            style={{ marginBottom: "1rem" }}
          >
            <div className="bg-white p-5 rounded-[0.5rem] border-1 border-blue-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative flex flex-col justify-between h-24 transition-all duration-200 hover:border-[#4A90E2] hover:bg-[#4A90E2]/10 cursor-pointer">
              <div
                className="flex justify-between items-start"
                style={{ padding: "0.5rem", paddingBottom: "0" }}
              >
                <div className="w-9 h-9 bg-blue-50 rounded-sm flex items-center justify-center text-[#0B6BCB]">
                  {/* Restored Connection Icon */}
                  <svg
                    width="20"
                    height="18"
                    viewBox="0 0 24 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19.6966 18.9C19.0581 18.9 18.5379 18.4285 18.5379 17.85C18.5379 17.2715 19.0581 16.8 19.6966 16.8C20.3349 16.8 20.8552 17.2715 20.8552 17.85C20.8552 18.4285 20.3349 18.9 19.6966 18.9ZM8.3942 11.9081C6.57053 9.14242 10.0476 5.93262 13.1399 7.60737C14.2476 8.20797 14.8454 9.28201 14.8454 10.3026C14.8454 13.4211 10.2271 14.6864 8.3942 11.9081ZM3.47586 18.9C2.83746 18.9 2.31724 18.4285 2.31724 17.85C2.31724 17.2715 2.83746 16.8 3.47586 16.8C4.11426 16.8 4.63448 17.2715 4.63448 17.85C4.63448 18.4285 4.11426 18.9 3.47586 18.9ZM3.47586 4.2C2.83746 4.2 2.31724 3.72855 2.31724 3.15C2.31724 2.57145 2.83746 2.1 3.47586 2.1C4.11426 2.1 4.63448 2.57145 4.63448 3.15C4.63448 3.72855 4.11426 4.2 3.47586 4.2ZM19.6966 2.1C20.3349 2.1 20.8552 2.57145 20.8552 3.15C20.8552 3.72855 20.3349 4.2 19.6966 4.2C19.0581 4.2 18.5379 3.72855 18.5379 3.15C18.5379 2.57145 19.0581 2.1 19.6966 2.1ZM19.6966 14.7C19.1613 14.7 18.6596 14.8187 18.2066 15.0151L16.1987 13.1952C17.3457 11.6244 17.5554 9.52983 16.3516 7.66608L18.2066 5.98495C18.6596 6.1813 19.1613 6.3 19.6966 6.3C21.6164 6.3 23.1724 4.88985 23.1724 3.15C23.1724 1.41015 21.6164 0 19.6966 0C17.7767 0 16.2207 1.41015 16.2207 3.15C16.2207 3.6351 16.3516 4.08963 16.5683 4.50018L14.806 6.09723C12.7564 4.71963 10.1414 4.74815 8.17754 5.92624L6.60413 4.50018C6.8208 4.08963 6.95172 3.6351 6.95172 3.15C6.95172 1.41015 5.3957 0 3.47586 0C1.55603 0 0 1.41015 0 3.15C0 4.88985 1.55603 6.3 3.47586 6.3C4.01114 6.3 4.51282 6.1813 4.96584 5.98495L6.53925 7.41101C5.23928 9.18971 5.20685 11.5606 6.72812 13.418L4.96584 15.0151C4.51282 14.8187 4.01114 14.7 3.47586 14.7C1.55603 14.7 0 16.1101 0 17.85C0 19.5898 1.55603 21 3.47586 21C5.3957 21 6.95172 19.5898 6.95172 17.85C6.95172 17.3649 6.8208 16.9104 6.60413 16.4998L8.45908 14.8187C10.5075 15.9054 12.8201 15.7237 14.5604 14.68L16.5683 16.4998C16.3516 16.9104 16.2207 17.3649 16.2207 17.85C16.2207 19.5898 17.7767 21 19.6966 21C21.6164 21 23.1724 19.5898 23.1724 17.85C23.1724 16.1101 21.6164 14.7 19.6966 14.7Z"
                      fill="#1279E2"
                    />
                  </svg>
                </div>
                <div className="bg-[#dcfce7] text-[#166534] text-[10px] font-bold px-2 py-1 rounded-full">
                  + 12%
                </div>
              </div>
              <div>
                <h3
                  className="text-md font-bold text-gray-900"
                  style={{ paddingLeft: "1rem", marginBottom: "0", color: 'black' }}
                >
                  {activeCardContacts}
                </h3>
                <p
                  className="text-gray-500 text-xs font-medium "
                  style={{ paddingLeft: "0.6rem", marginBottom: "0.2rem", color: 'black' }}
                >
                  Connections
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-[0.5rem] border-1 border-blue-500 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative flex flex-col justify-between h-24 transition-all duration-200 hover:border-[#4A90E2] hover:bg-[#4A90E2]/10 cursor-pointer">
              <div
                className="flex justify-between items-start"
                style={{ padding: "0.5rem", paddingBottom: "0" }}
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-[#0B6BCB]">
                  <Eye size={20} />
                </div>
                <div className="bg-[#dcfce7] text-[#166534] text-[10px] font-bold px-2 py-1 rounded-full">
                  + 12%
                </div>
              </div>
              <div>
                <h3
                  className="text-md font-bold text-gray-900"
                  style={{ paddingLeft: "1rem", marginBottom: "0", color: 'black' }}
                >
                  {activeCard?.views || 0}
                </h3>
                <p
                  className="text-gray-500 text-xs font-medium"
                  style={{ paddingLeft: "0.6rem", marginBottom: "0.2rem" }}
                >
                  Profile Views
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => activeCard && router.push(`/cards/${activeCard.id}`)}
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
                  // Determine status for this specific card in the list
                  const isTopProfile = card.id === activeCardId; // Is it the one in the blue box?
                  const isExpanded = card.id === expandedCardId; // Is the accordion open?

                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      // CLICK: Expand AND Activate (Replaced Double Click)
                      onClick={() => handleCardInteraction(card.id)}
                      className={`
                          rounded-[0.5rem] p-4 border transition-all duration-200 select-none cursor-pointer
                          ${isTopProfile
                          ? "bg-[#eff6ff] border-blue-200 shadow-sm"
                          : "bg-white border-gray-100 shadow-sm hover:border-blue-100"
                        }
                        `}
                    >
                      <div
                        className="flex items-start gap-3"
                        style={{
                          fontFamily:
                            'Poppins, sans-serif, "Plus Jakarta Sans"',
                          fontWeight: "500",
                          padding: "0.5rem",
                        }}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100 relative">
                          <img
                            src={getCardImage(card)}
                            alt={card.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== "https://via.placeholder.com/150") {
                                target.src = "https://via.placeholder.com/150";
                              }
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-gray-900 truncate text-sm">
                              {card.fullName || card.name}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-[0.5rem] ml-2 ${isTopProfile
                                ? "bg-[#0B6BCB] text-white"
                                : "bg-gray-100 text-gray-500"
                                }`}
                              style={{
                                padding: "0.2rem",
                                paddingRight: "0.5rem",
                              }}
                            >
                              {card.cardType
                                ? `${card.cardType.slice(0, 4)}.`
                                : "Card"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 truncate">
                              {card.title}
                            </p>
                            {/* Visual indicator of status in list */}
                            <div className={`w-1.5 h-1.5 rounded-full ${card.cardActive ? "bg-green-500" : "bg-red-400"}`}></div>
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {card.company}
                          </p>

                          {/* ACCORDION CONTENT: Edit and Status Buttons */}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex gap-3 mt-4 overflow-hidden"
                              style={{ paddingTop: "0.5rem" }}
                            >
                              {/* EDIT BUTTON */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/edit?id=${card.id}`);
                                }}
                                className="flex items-center justify-center gap-1.5 bg-[#1e3a8a] text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-[#172554] transition-colors"
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  fontFamily: "Poppins, sans-serif,Plus Jakarta Sans",
                                }}
                              >
                                <FiEdit3 size={12} /> Edit
                              </button>

                              {/* TOGGLE STATUS BUTTON */}
                              <button
                                onClick={(e) => handleToggleStatus(e, card)}
                                className={`flex items-center justify-center gap-1.5 border text-xs font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors ${card.cardActive
                                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                  : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                                  }`}
                                style={{
                                  padding: "0.4rem 0.8rem",
                                  fontFamily: "Poppins, sans-serif,Plus Jakarta Sans",
                                }}
                              >
                                {card.cardActive ? (
                                  <>
                                    <FiPauseCircle size={12} /> Pause
                                  </>
                                ) : (
                                  <>
                                    <FiPlay size={12} /> Activate
                                  </>
                                )}
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
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
            }}
          >
            <FiPlus size={16} />
            Create New Card
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-stretch mt-4">
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
                    {renderCardPreview(card)}
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
    </div>
  );
};

export default Dashboard;