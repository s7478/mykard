"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "react-hot-toast";
import DigitalCardPreview, { DigitalCardProps } from "@/components/cards/DigitalCardPreview";
import FlatCardPreview from '@/components/cards/FlatCardPreview';
import ModernCardPreview from "@/components/cards/ModernCardPreview";
import SleekCardPreview from "@/components/cards/SleekCardPreview";
import { capitalizeFirstLetter } from '@/lib/utils';

// Icons
import {
  FiPlus,
  FiEdit3,
  FiPhone,
  FiMail,
  FiShare2,
  FiChevronRight,
  FiToggleLeft,
  FiToggleRight
} from "react-icons/fi";
import { BarChart2, Eye, Plus, PenSquare, ArrowUpRight, ArrowDownRight, Minus, Users } from "lucide-react";

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
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);

  const [showAllCards, setShowAllCards] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | number | null>(null);
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

    if (!imgSource || typeof imgSource !== "string" || imgSource.trim() === "" || imgSource === "null" || imgSource === "undefined") {
      return "https://via.placeholder.com/150";
    }

    if (!imgSource.startsWith("http") && !imgSource.startsWith("data:") && !imgSource.startsWith("/")) {
      return `/${imgSource}`;
    }
    return imgSource;
  };

  // ----------------- 2. HANDLERS -----------------
  const handleToggleStatus = async (e: React.MouseEvent, card: Card) => {
    e.stopPropagation();
    const newStatus = !card.cardActive;
    const statusText = newStatus ? "Active" : "Paused";

    setCardsData(prevCards =>
      prevCards.map(c => c.id === card.id ? { ...c, cardActive: newStatus } : c)
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
        prevCards.map(c => c.id === card.id ? { ...c, cardActive: !newStatus } : c)
      );
    }
  };

  // ----------------- 3. RENDER HELPERS -----------------
  const renderCardPreview = (card: Card) => {
    const capitalizedFullName = capitalizeFirstLetter(card.fullName || card.name || '');
    const nameParts = capitalizedFullName.split(' ');

    const commonProps = {
      firstName: nameParts[0] || '',
      middleName: nameParts.length === 3 ? nameParts[1] : '',
      lastName: nameParts.length >= 2 ? nameParts.slice(-1).join('') : '',
      cardName: capitalizeFirstLetter(card.cardName || card.name || ''),
      title: card.title || '',
      company: card.company || '',
      location: card.location || (card as any).user?.location || '',
      about: card.bio || card.about || card.description || '',
      skills: card.skills || '',
      portfolio: card.portfolio || '',
      experience: card.experience || '',
      services: card.services || '',
      review: card.review || '',
      photo: getCardImage(card),
      cover: card.coverImage || card.bannerImage || card.cover || '',
      email: card.email || '',
      phone: card.phone || '',
      linkedin: card.linkedinUrl || card.linkedin || '',
      website: card.websiteUrl || card.website || '',
      themeColor1: card.selectedColor || '#3b82f6',
      themeColor2: card.selectedColor2 || '#2563eb',
      fontFamily: card.selectedFont || 'system-ui, sans-serif,Poppins,plus-jakarta-sans',
      cardType: card.cardType || '',
      documentUrl: card.documentUrl || '',
      onDocumentClick: (url: string) => setSelectedDocumentUrl(url),
      // Fix: Parse customFields so icons show, and pass click handler for card body
      customFields: card.customFields
        ? (typeof card.customFields === 'string' ? JSON.parse(card.customFields) : card.customFields)
        : [],
      // Fix: Pass navigation click here instead of wrapper
      onClick: () => router.push(`/cards/${card.id}`)
    };

    const selectedDesign = card.selectedDesign || 'Classic';

    switch (selectedDesign) {
      case 'Flat': return <FlatCardPreview {...commonProps} />;
      case 'Modern': return <ModernCardPreview {...commonProps} />;
      case 'Sleek': return <SleekCardPreview {...commonProps} />;
      case 'Classic':
      default: return <DigitalCardPreview {...commonProps} />;
    }
  };

  // --- MOBILE RENDERER ---
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

  // ----------------- 4. EFFECTS -----------------
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchCards();
    }
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

  const fetchCards = async () => {
    try {
      setIsLoadingCards(true);
      const response = await fetch("/api/card", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  const fetchActiveCardConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/users/connections?type=accepted", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const connections = data.requests || [];
      setActiveCardContacts(connections.length);
    } catch (error) {
      console.error("Error fetching connections", error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!activeCardId) return;
    try {
      const response = await fetch("/api/card", { method: "GET", credentials: "include" });
      const data = await response.json();
      if (data.success) {
        setCardsData(data.cards);
      }
    } catch (error) {
      console.error("Error fetching analytics", error);
    }
  }, [activeCardId]);

  useEffect(() => {
    fetchActiveCardConnections();
    fetchAnalytics();
    const intervalId = setInterval(() => {
      fetchActiveCardConnections();
      fetchAnalytics();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [fetchActiveCardConnections, fetchAnalytics]);

  const handleShare = async (card: Card) => {
    if (!card) return;
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const cardUrl = `${origin}/cards/public/${card.id}`;
    const shareMessage = `Here is my MyKard digital profile. You can view my details and connect with me here.\n\nThis profile contains my contact information, social links, and business card.\n\nClick the link below to view the card:\n${cardUrl}`;

    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: "MyKard Profile",
          text: shareMessage,
          url: cardUrl,
        });
      } catch (err) {
        console.error("Share failed/cancelled", err);
      }
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
      window.open(whatsappUrl, "_blank");
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

  const activeCard = cardsData.find((c) => c.id === activeCardId) || cardsData[0];
  const sortedCards = [...cardsData];
  const cardsToDisplay = showAllCards ? sortedCards : sortedCards.slice(0, 3);

  return (
    <div className="min-h-screen bg-background lg:ml-64 transition-all duration-300">
      <div className="block md:hidden pb-40">
        {/* Mobile View - Kept exactly as requested */}
        {activeCard ? (
          <motion.div
            key={activeCard.id}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="bg-[#0B6BCB] rounded-[1rem] px-6 pt-10 pb-10 text-white shadow-lg relative overflow-hidden"
            style={{ marginBottom: "1rem" }}
          >
            {/* ... (Mobile header content hidden for brevity, kept identical) ... */}
            <div className="flex items-start justify-between relative z-10" style={{ paddingTop: "0.2rem", padding: "0.5rem" }}>
              <div className="flex gap-4" style={{ padding: "0.5rem", paddingTop: "0.8rem" }}>
                <div className="w-[2.5rem] h-[2.5rem] rounded-full border-2 border-white !bg-white overflow-hidden flex-shrink-0">
                  <img src={getCardImage(activeCard)} alt="Profile" className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; if (target.src !== "https://via.placeholder.com/150") { target.src = "https://via.placeholder.com/150"; } }} />
                </div>
                <div className="flex flex-col" style={{ fontFamily: "plus Jakarta,Poppins, sans-serif, monospace,", fontWeight: "bold" }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-xl font-bold leading-tight !text-white">{activeCard.fullName || activeCard.name || "User Name"}</h2>
                  </div>
                  <p className="text-xs font-medium !text-white">{activeCard.title || "Job Title"}</p>
                  <p className="text-xs !text-white">{activeCard.company || "Company Name"}</p>
                </div>
              </div>
              <div className="bg-[#084d96]/40 backdrop-blur-sm rounded-full border border-white/10" style={{ padding: "5px" }}>
                <span className="text-[8px] uppercase font-semibold tracking-wide text-blue-50">{activeCard.cardType || "Professional"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-8 relative z-20" style={{ padding: "1.5rem" }}>
              <div className="flex gap-3">
                <a href={activeCard.phone ? `tel:${activeCard.phone}` : "#"} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${activeCard.phone ? "bg-white/20 hover:bg-white/30 text-white cursor-pointer" : "bg-white/10 text-white/50 cursor-not-allowed"}`}><FiPhone size={20} /></a>
                <a href={activeCard.email ? `mailto:${activeCard.email}` : "#"} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${activeCard.email ? "bg-white/20 hover:bg-white/30 text-white cursor-pointer" : "bg-white/10 text-white/50 cursor-not-allowed"}`}><FiMail size={20} /></a>
                <button onClick={() => handleShare(activeCard)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all duration-200 text-white cursor-pointer" style={{ zIndex: 30 }}><FiShare2 size={20} /></button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeCard.cardActive !== false ? "bg-[#4ade80]" : "bg-red-400"}`}></span>
                <span className="text-xs font-medium text-blue-50">{activeCard.cardActive !== false ? "Active" : "Paused"}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-[#f0f0f0] rounded-[0.5rem] p-8 text-center border-1 border-[#0B6BCB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-4">
            <h2 className="text-xl font-bold">Welcome!</h2>
            <p className="text-blue-100">Create your first card to get started.</p>
          </div>
        )}

        <div className="px-5 mt-6">
          <div className="grid grid-cols-2 gap-3 mb-4" style={{ marginBottom: '1rem' }}>
            {/* CONNECTIONS BOX */}
            <div
              onClick={() => router.push("/dashboard/connections")}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 cursor-pointer flex flex-col justify-center"
            >

              {/* Header: Icon + Label */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-sm flex items-center justify-center text-[#0B6BCB] shrink-0"><Users size={18} /></div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-none">Connections</p>
              </div>
              <div className="mt-2 pl-1" style={{ color: 'black', textAlign: 'center' }}><h3 className="text-2xl font-bold !text-gray-900 leading-tight">{activeCardContacts}</h3></div>
            </div>
            <div
              onClick={() => activeCard && router.push(`/cards/${activeCard.id}?tab=analytics`)}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 cursor-pointer flex flex-col justify-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-sm flex items-center justify-center text-[#0B6BCB] shrink-0"><Eye size={18} /></div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-none">Profile Views</p>
              </div>
              <div className="mt-2 pl-1" style={{ color: 'black', textAlign: 'center' }}><h3 className="text-2xl font-bold !text-gray-900 leading-tight">{activeCard?.views || 0}</h3></div>
            </div>
          </div>
          <button onClick={() => activeCard && router.push(`/cards/${activeCard.id}?tab=analytics`)} className="w-full bg-[#C7DFFF] hover:bg-blue-100 text-[#0B6BCB] py-3.5 px-5 rounded-[0.5rem] flex items-center justify-between font-semibold text-sm transition-colors mb-6 shadow-sm border border-none" style={{ marginBottom: "1rem", padding: "0.7rem" }}>
            <div className="flex items-center gap-2"><BarChart2 size={18} /><span>Show Analytics</span></div><FiChevronRight size={18} />
          </button>
          <div className="flex gap-4 mb-8" style={{ marginBottom: "1rem" }}>
            <button onClick={() => router.push("/dashboard/create?new=true")} className="flex-1 bg-[#dbeafe] text-[#0B6BCB] py-3.5 px-4 rounded-[0.5rem] font-semibold flex items-center justify-center gap-1 shadow-md shadow-blue-200 active:scale-95 hover:bg-[#0B6BCB] hover:text-white transition-all duration-300" style={{ fontFamily: "Poppins, sans-serif, Plus Jakarta Sans" }}><Plus size={18} /> Create New Card</button>
            <button onClick={() => activeCard && router.push(`/dashboard/edit?id=${activeCard.id}`)} className="flex-1 bg-[#dbeafe] text-[#0B6BCB] py-3.5 px-4 rounded-[0.5rem] font-semibold flex items-center justify-center gap-1 border border-blue-100 shadow-md shadow-blue-200 active:scale-95 transition-transform text-sm hover:bg-[#0B6BCB] hover:text-white" style={{ padding: "0.2rem", fontFamily: "Poppins, sans-serif,Plus Jakarta Sans" }}><PenSquare size={18} /> Edit a Card</button>
          </div>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg text-gray-900" style={{ fontFamily: 'Poppins, sans-serif, "Plus Jakarta Sans"', fontWeight: "500", lineHeight: "1", color: 'black' }}>My Cards</h3>
            <button onClick={() => setShowAllCards(!showAllCards)} className="text-xs font-bold text-gray-900 hover:text-blue-600" style={{ fontFamily: 'Poppins, sans-serif, "Plus Jakarta Sans"', fontWeight: "500", lineHeight: "1", marginTop: "4px", paddingRight: "1rem" }}>{showAllCards ? "View Less" : "View All"}</button>
          </div>
          <div className="flex flex-col gap-4">
            {isLoadingCards ? (
              <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
            ) : cardsToDisplay.length > 0 ? (
              <AnimatePresence initial={false}>{cardsToDisplay.map((card) => renderMobileCard(card))}</AnimatePresence>
            ) : (
              <div className="text-center text-gray-500 py-4">No cards found.</div>
            )}
            <div className="h-24 w-full md:hidden" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP VIEW (hidden md:block) - CLICK OUTSIDE FIX APPLIED
         ========================================================================= */}
      <div className="hidden md:block px-8 sm:px-14 py-8">
        <div className="flex justify-center my-6" style={{ marginBottom: "1rem" }}>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/dashboard/create")}
            style={{ background: 'linear-gradient(to bottom right, #1e3a8a, #2563eb)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiPlus size={16} /> Create New Card
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
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
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="transition-all duration-300 break-inside-avoid mb-6 block w-full relative"
                  style={{ marginBottom: '1.5rem' }}
                >
                  {/* FIX: Removed onClick from wrapper to prevent clicking outside. Logic moved inside renderCardPreview */}
                  <div className="">
                    {renderCardPreview(card)}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full w-full flex justify-center py-4 break-inside-avoid">
              <p className="text-gray-500">No Cards Available. Create one!</p>
            </div>
          )}
        </div>

        {selectedDocumentUrl && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full md:w-1/2 h-full bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Document Viewer</h3>
              <div className="flex items-center gap-2">
                <a href={selectedDocumentUrl} download target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download
                </a>
                <button onClick={() => setSelectedDocumentUrl(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe src={selectedDocumentUrl} className="w-full h-full border-0" title="Document Viewer" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;