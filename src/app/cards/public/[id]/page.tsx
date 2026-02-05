"use client";

import styles from "./publiccard.module.css";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { X, Users, CheckCircle } from "lucide-react";
import DigitalCardPreview from "@/components/cards/DigitalCardPreview";
import FlatCardPreview from "@/components/cards/FlatCardPreview";
import ModernCardPreview from "@/components/cards/ModernCardPreview";
import SleekCardPreview from "@/components/cards/SleekCardPreview";
import { capitalizeFirstLetter } from '@/lib/utils';


// ----------------- Card Type Definition -----------------
interface Card {
  id: string;
  fullName?: string;
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

  email?: string;
  phone?: string;
  linkedin?: string;
  linkedinUrl?: string;
  website?: string;
  websiteUrl?: string;


  customFields?: string;


  documentUrl?: string;
  selectedDesign?: string;
  selectedColor?: string;
  selectedColor2?: string;
  textColor?: string;
  selectedFont?: string;
  cardType?: string;
  views?: number;
  boost?: "Active" | "Inactive";

  user?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    location?: string;
  };
}

// ----------------- Connection Form Data -----------------
interface ConnectionFormData {
  name: string;
  phone: string;
  email: string;
}

// ----------------- Card Preview Component -----------------
const CardPreview: React.FC<{ card: Card; onDocumentClick: (url: string) => void }> = ({ card, onDocumentClick }) => {
  const capitalizedFullName = capitalizeFirstLetter(card.fullName || "");
  const nameParts = capitalizedFullName.split(" ");


  let parsedCustomFields = [];
  try {
    if (card.customFields) {
      //if it's a string, parse it. If it's already an object, use it.
      parsedCustomFields = typeof card.customFields === 'string' 
        ? JSON.parse(card.customFields) 
        : card.customFields;
    }
  } catch (err) {
    console.error("Failed to parse custom fields:", err);
  }


  
  const commonProps = {
    firstName: nameParts[0] || "",
    middleName: nameParts.length === 3 ? nameParts[1] : "",
    lastName: nameParts.length >= 2 ? nameParts.slice(-1).join("") : "",
    cardName: capitalizeFirstLetter(card.name || ""),
    title: capitalizeFirstLetter(card.title || ""),
    company: card.company || "",
    location: card.location || "",
    about: card.bio || card.about || card.description || "",
    skills: card.skills || "",
    portfolio: card.portfolio || "",
    experience: card.experience || "",
    services: card.services || "",
    review: card.review || "",
    photo: card.profileImage || card.photo || "",
    cover: card.coverImage || card.bannerImage || card.cover || "",
    email: card.email || "",
    phone: card.phone || "",
    linkedin: card.linkedinUrl || card.linkedin || "",
    website: card.websiteUrl || card.website || "",
    themeColor1: card.selectedColor || "#3b82f6",
    themeColor2: card.selectedColor2 || "#2563eb",
    textColor: card.textColor || "#ffffff",
    documentUrl: card.documentUrl || "",


    customFields: parsedCustomFields,


    onDocumentClick,
  };

  const design = card.selectedDesign || "Classic";

  const renderCardPreview = () => {
    switch (design) {
      case "Flat":
        return <FlatCardPreview {...commonProps} />;
      case "Modern":
        return <ModernCardPreview {...commonProps} />;
      case "Sleek":
        return <SleekCardPreview {...commonProps} />;
      case "Classic":
      default:
        return <DigitalCardPreview {...commonProps} design={design} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={styles.cardPreviewArea}
      style={{ maxWidth: "360px" }}
    >
      {renderCardPreview()}
    </motion.div>
  );
};

// ----------------- Connection Modal Component -----------------
const ConnectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConnectionFormData) => void;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<ConnectionFormData>({
    name: "",
    phone: "",
    email: "",
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address (e.g. user@example.com)");
      return;
    }

    const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  const variants = isMobile
    ? {
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
      }
    : {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
      };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.modalOverlay}
        onClick={onClose}
      >
        <motion.div
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{
            type: isMobile ? "tween" : "spring",
            stiffness: 300,
            damping: 30,
            duration: isMobile ? 0.3 : undefined,
          }}
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className={styles.closeButton}
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>

          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Let's Connect!</h2>
            <p className={styles.modalSubtitle}>
              Share your contact details to connect with this professional
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.formInput}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.formInput}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.formInput}
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Connecting..." : "Connect"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ----------------- Main Public Card Page -----------------
const PublicCardPage = () => {
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;

  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);

  // DOCUMENT VIEWER STATE
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/card/${cardId}`);
        const data = await response.json();

        if (!response.ok || !data.success) throw new Error("Card not found");

        if (data.card.cardActive === false) {
          toast.error("This card has been deactivated by the owner");
          setCard(null);
        } else {
          setCard(data.card);
        }
      } catch (e) {
        setCard(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (cardId) fetchCard();
  }, [cardId]);

  // Increment view count when the public page is viewed
  useEffect(() => {
    if (!cardId) return;

    // Fire-and-forget; backend will ignore owner views
    fetch(`/api/card/${cardId}/view`, { method: "POST" }).catch((err) => {
      console.error("Error incrementing view count:", err);
    });
  }, [cardId]);

  const handleFormSubmit = async (formData: ConnectionFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sourceUrl: window.location.href,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success("Thank you for connecting!");
      setIsModalOpen(false);


      setIsSuccessPopupOpen(true); // Open Success Popup



    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading card...</p>
        </div>
      </div>
    );

  if (!card)
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>Card Unavailable</h1>
          <p className={styles.errorMessage}>
            This card has been deactivated or does not exist.
          </p>
          <a href="/" className={styles.errorButton}>
            Go to Homepage
          </a>
        </div>
      </div>
    );

  return (
    <>

      <Toaster 
        position="top-center" 
        containerStyle={{ zIndex: 99999 }} 
      />


      <div className={styles.pageContainer}>

        <div className={styles.contentWrapper}>
          <div className={styles.leftColumn}>
            <CardPreview
              card={card}
              onDocumentClick={(url) => setSelectedDocumentUrl(url)}
            />
          </div>

          <div className={styles.rightColumn}>
            
            {/* 1. Connect Button */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className={styles.connectButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users size={20} />
              Let's Connect
            </motion.button>

            {/* 2. Create / Powered By Section */}
            <div className={styles.createSection}>
              <p className={styles.poweredText}>
                Created by <strong>MyKard.in</strong>
              </p>
              <button onClick={() => router.push('/dashboard/create?new=true')} className={styles.createButton} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Create Your Own Card
              </button>
            </div>

          </div>
        </div>

        <ConnectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
        />



        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.contentWrapper}
        > */}
          {/* Card Preview */}
          {/* <CardPreview
            card={card}
            onDocumentClick={(url) => setSelectedDocumentUrl(url)}
          /> */}

          {/* Connect Button */}
          {/* <motion.button
            onClick={() => setIsModalOpen(true)}
            className={styles.connectButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          > */}
            {/* <Users size={20} />
            Let's Connect
          </motion.button>
        </motion.div> */}

        {/* Modal */}
        {/* <ConnectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
        />
        {/* ---- MyKard Create Section ---- */}
        {/* <div className={styles.createSection}>
          <p className={styles.poweredText}>Created by <strong>MyKard.in</strong></p>

          <a href="https://www.mykard.in/auth/signup" className={styles.createButton}>
            Create Your Digital Card
          </a>
      </div> */} 
      
    </div>

      {/* ---------------- DOCUMENT VIEWER ---------------- */}
      {selectedDocumentUrl && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-full md:w-1/2 h-full bg-white shadow-2xl z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Document Viewer
            </h3>
            <button
              onClick={() => setSelectedDocumentUrl(null)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              ✖
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <iframe
              src={selectedDocumentUrl || ""}
              className="w-full h-full border-0"
              title="Document Viewer"
            />
          </div>
        </motion.div>
      )}

      {isSuccessPopupOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setIsSuccessPopupOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
              maxWidth: '320px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={48} color="#1e67f4" />
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              Connection Successful!
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#666', lineHeight: 1.5 }}>
              Your details have been sent to the owner of this card.
            </p>
            <button
              onClick={() => setIsSuccessPopupOpen(false)}
              style={{
                backgroundColor: '#1e67f4', 
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                width: '100%',
                outline: 'none'
              }}
            >
              Great!
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default PublicCardPage;
