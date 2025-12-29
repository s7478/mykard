 "use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "react-hot-toast";
import DigitalCardPreview, { DigitalCardProps } from "@/components/cards/DigitalCardPreview";
import FlatCardPreview from '@/components/cards/FlatCardPreview';
import ModernCardPreview from "@/components/cards/ModernCardPreview";
import SleekCardPreview from "@/components/cards/SleekCardPreview";
import { capitalizeFirstLetter } from '@/lib/utils';

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

  customFields?: string;
  
}

// ----------------- Main Dashboard -----------------
const Dashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
 const [cardsData, setCardsData] = useState<Card[]>([]);
 const [isLoadingCards, setIsLoadingCards] = useState(false);
 const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);

 // Card Preview Renderer (Exact Copy from Edit Page)
 const renderCardPreview = (card: Card) => {
  // Split fullName with capitalization
  const capitalizedFullName = capitalizeFirstLetter(card.fullName || '');
  const nameParts = capitalizedFullName.split(' ');


  let parsedCustomFields = [];
  try {
    if (card.customFields) {
      parsedCustomFields = typeof card.customFields === 'string' 
        ? JSON.parse(card.customFields) 
        : card.customFields;
    }
  } catch (err) {
    console.error("Failed to parse custom fields for card:", card.id, err);
  }


  
  // Use EXACT same prop mapping as edit page
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
    photo: card.profileImage || card.photo || '',
    cover: card.coverImage || card.bannerImage || card.cover || '',
    email: card.email || '',
    phone: card.phone || '',
    linkedin: card.linkedinUrl || card.linkedin || '',
    website: card.websiteUrl || card.website || '',
    themeColor1: card.selectedColor || '#3b82f6',
    themeColor2: card.selectedColor2 || '#2563eb',
    textColor: card.textColor || '#ffffff',
    fontFamily: card.selectedFont || 'system-ui, sans-serif',
    cardType: card.cardType || '',
    documentUrl: card.documentUrl || '',

    customFields: parsedCustomFields,

    onDocumentClick: (url: string) => setSelectedDocumentUrl(url),
  };

  const selectedDesign = card.selectedDesign || 'Classic';
  
  // Use EXACT same switch logic as edit page
  switch (selectedDesign) {
    case 'Flat':
      return <FlatCardPreview {...commonProps} />;
    case 'Modern':
      return <ModernCardPreview {...commonProps} />;
    case 'Sleek':
      return <SleekCardPreview {...commonProps} />;
    case 'Classic':
    default:
      return <DigitalCardPreview {...commonProps} />;
  }
 };

 useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchCards();
    }
  }, [isAuthenticated, isLoading]);

  const [isMobile, setIsMobile] = useState(false);

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

  // Force scroll to top on mount to fix reload scroll offset
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

 const fetchCards = async () => {
   try {
    setIsLoadingCards(true);
    const response = await fetch('/api/card', {
      method: 'GET',
      credentials: 'include', // Important: include cookies
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
     // console.log('✅ Fetched cards:', data.cards);
      //console.log('🎨 Design values:', data.cards.map((c: any) => ({ id: c.id, design: c.selectedDesign })));
      setCardsData(data.cards);
      // Removed success toast notification for loaded cards
    } else {
      toast.error(data.error || 'Failed to fetch cards');
    }
   } catch (error: any) {
     console.error('Error fetching cards:', error);
     toast.error(error.message || 'Failed to fetch cards');
   } finally {
     setIsLoadingCards(false);
   }
  };
  const cards: Card[] = [
    {
      id: 'demo',
      name: "Demo Card",
      title: "Sample Title",
      company: "Sample Company",
      location: "Sample Location",
      about: "This is a demo card showing how your card will look",
      skills: "Sample Skills",
      portfolio: "Sample Portfolio",
      experience: "Sample Experience",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      email: "demo@example.com",
      phone: "+1-555-0000",
      linkedin: "https://linkedin.com",
      website: "https://example.com",
      cardType: "Demo",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );

    // Middleware protects this route; no client-side redirect needed
  }

  return (
    <div className="min-h-screen bg-background px-8 sm:px-14 py-8 lg:ml-64 transition-all duration-300" style={{ paddingBottom: isMobile ? '110px' : '0' }}>
      {/* Create New Card Button */}
      <div className="flex justify-center my-6">
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow:
              "0 20px 40px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.3)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/dashboard/create")}
          style={{
            background: 'linear-gradient(to bottom right, #1e3a8a, #2563eb)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '500',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FiPlus size={16} />
          Create New Card
        </motion.button>
      </div>

      {/* Invisible container for vertical spacing */}
      <div className="h-10"></div>

      {/* Cards Bento Layout */}
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
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  y: -4,
                }}
                className="transition-all duration-300 break-inside-avoid block w-full relative"

              >
                <div onClick={() => router.push(`/cards/${card.id}`)} className="cursor-pointer">
                  {renderCardPreview(card)}
                </div>
              </motion.div>
            );
          })
        ) : (
          <>
            <div className="w-full flex justify-center break-inside-avoid">
  <motion.div
    key={cards[0].id}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 100, damping: 20 }}
    whileHover={{
      scale: 1.02,
      y: -4,
    }}
    className="transition-all duration-300 cursor-pointer"
    style={{ marginBottom: '1.5rem' }}
  >
    {renderCardPreview(cards[0])}
  </motion.div>
</div>

          </>
        )}
      </div>

      {/* Split-Screen Document Viewer */}
      {selectedDocumentUrl && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-full md:w-1/2 h-full bg-white shadow-2xl z-50 flex flex-col"
        >
          {/* Document Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Document Viewer</h3>
            <div className="flex items-center gap-2">
              <a
                href={selectedDocumentUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </a>
              <button
                onClick={() => setSelectedDocumentUrl(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          
          {/* PDF Iframe */}
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
  );
};

export default Dashboard;
