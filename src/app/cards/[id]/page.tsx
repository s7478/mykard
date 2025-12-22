"use client";

import styles from "./carddetail.module.css";
import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FiDownload,
  FiCopy,
  FiEdit,
  FiUpload,
  FiToggleLeft,
  FiToggleRight,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiLinkedin,
  FiGlobe,
  
} from "react-icons/fi";

import DigitalCardPreview, { DigitalCardProps } from "@/components/cards/DigitalCardPreview";
import FlatCardPreview from "@/components/cards/FlatCardPreview";
import ModernCardPreview from "@/components/cards/ModernCardPreview";
import SleekCardPreview from "@/components/cards/SleekCardPreview";
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  Link as LinkIcon,
  BarChart3,
  Users,
  Eye,
  
} from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";

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
  views?: number;
  shares?: number;
  boost?: "Active" | "Inactive";
  user?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    location?: string;
  };


  customFields?: string;


}

// ----------------- Card Preview -----------------
const CardPreview: React.FC<{ card: Card }> = ({ card }) => {
  const renderCardPreview = () => {


    let parsedCustomFields = [];
    try {
      if (card.customFields) {
        parsedCustomFields = typeof card.customFields === 'string' 
          ? JSON.parse(card.customFields) 
          : card.customFields;
      }
    } catch (err) {
      console.error("Failed to parse custom fields:", err);
    }



  const commonProps = {
  firstName: card.fullName || card.name || '',
  middleName: '',
  lastName: '',
  cardName: card.cardName || '',
  title: card.title || '',
  company: card.company || '',
  location: card.location || card.user?.location || '',
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
  documentUrl: (card as any).documentUrl || '',
  themeColor1: card.selectedColor || '#3b82f6',
  themeColor2: card.selectedColor2 || '#2563eb',
  textColor: card.textColor || '#ffffff',
  fontFamily: card.selectedFont || 'system-ui, sans-serif',
  cardType: card.cardType || '',

  customFields: parsedCustomFields,

};

    const design = card.selectedDesign || 'Classic';
    
    switch (design) {
      case 'Flat':
        return <FlatCardPreview {...commonProps} />;
      case 'Modern':
        return <ModernCardPreview {...commonProps} />;
      case 'Sleek':
        return <SleekCardPreview {...commonProps} />;
      case 'Classic':
      default:
        return <DigitalCardPreview {...commonProps} design={design} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="flex items-center justify-center"
      style={{ maxWidth: '360px' }}
    >
      {renderCardPreview()}
    </motion.div>
  );
};

// ----------------- Main Page -----------------
const CardDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id as string;
  const [activeTab, setActiveTab] = useState<"share" | "settings" | "analytics">("share");
  const [searchIndexing, setSearchIndexing] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState<"qr" | "link">("link");
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);

  const qrRef = useRef<HTMLDivElement>(null);
const handleToggleActive = async () => {
    if (isTogglingActive || !card) return;
    
    setIsTogglingActive(true);
    try {
      const response = await fetch(`/api/card/${cardId}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle card status");
      }

      const data = await response.json();
      setCard(prev => prev ? { ...prev, cardActive: data.card.cardActive } : null);
      toast.success(data.message);
    } catch (error: any) {
      console.error("Error toggling card status:", error);
      toast.error(error.message || "Failed to toggle card status");
    } finally {
      setIsTogglingActive(false);
    }
  };

const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(`/api/card/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete card");
      }
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
      //  console.log('🔍 Fetching card with ID:', cardId);
        
        const response = await fetch(`/api/card/${cardId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch card');
        }

        const data = await response.json();
        
        if (data.success && data.card) {
        //  console.log('✅ Fetched card:', data.card);
          setCard(data.card);
        } else {
          toast.error('Card not found');
          router.push('/dashboard');
        }
      } catch (error: any) {
        console.error('❌ Error fetching card:', error);
        toast.error(error.message || 'Failed to load card');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (cardId) {
      fetchCard();
    }
  }, [cardId, router]);

  useEffect(() => {
    let intervalId: any;

    const fetchContacts = async () => {
      try {
        const res = await fetch('/api/contacts', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const allContacts = (data.contacts || []) as any[];
        if (cardId) {
          const filtered = allContacts.filter((c: any) => c.card && c.card.id === cardId);
          setContactsCount(filtered.length);
        } else {
          setContactsCount(allContacts.length);
        }
      } catch (_) {
        // ignore errors for analytics badge
      }
    };

    fetchContacts();
    intervalId = setInterval(fetchContacts, 20000);

    const onUpdated = () => fetchContacts();
    if (typeof window !== 'undefined') {
      window.addEventListener('contacts-updated', onUpdated as any);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('contacts-updated', onUpdated as any);
      }
    };
  }, [cardId]);

  const mockUserData = {
    cardUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/cards/public/${cardId}`,
  };

 const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Mobile fallback
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      input.setSelectionRange(0, 99999);
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 1500);

  } catch (err) {
    console.error("Copy failed:", err);
    toast.error("Unable to copy. Try manually.");
  }
};


  const downloadQR = () => {
    // Generate QR code for download regardless of current tab
    // First, try to find existing QR in QR wrapper
    let qrWrapper = document.querySelector(`.${styles.qrWrapper}`);
    let svg = qrWrapper?.querySelector("svg");
    
    // If we're in Direct Link tab and no QR is visible, temporarily create one
    if (!svg && shareMethod === "link") {
      // Create a temporary hidden QR code
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Import QRCode component dynamically and render
      import('react-qr-code').then((QRCodeModule) => {
        const QRCode = QRCodeModule.default;
        const React = require('react');
        const ReactDOM = require('react-dom/client');
        
        const root = ReactDOM.createRoot(tempDiv);
        root.render(React.createElement(QRCode, { value: mockUserData.cardUrl, size: 180 }));
        
        // Wait a moment for render, then proceed with download
        setTimeout(() => {
          const tempSvg = tempDiv.querySelector('svg');
          if (tempSvg) {
            processQRDownload(tempSvg, () => {
              document.body.removeChild(tempDiv);
            });
          }
        }, 100);
      });
      return;
    }
    
    if (!svg) return;
    processQRDownload(svg);
  };
  
  const processQRDownload = (svg: Element, cleanup?: () => void) => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Convert to blob for better file handling
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement("a");
          downloadLink.href = url;
          downloadLink.download = `MyKard_QR_${cardId}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        }
        if (cleanup) cleanup();
      }, "image/png");
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Mobile detection utility
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const incrementShareCount = async () => {
    try {
      await fetch(`/api/card/${cardId}/share`, { method: 'POST' });
      setCard(prev => prev ? { ...prev, shares: (prev.shares || 0) + 1 } : prev);
    } catch (error) {
      console.error('Error incrementing share count:', error);
    }
  };

  const shareProfile = async () => {
    const shareMessage = `Here is my MyKard digital profile. You can view my details and connect with me here.\n\nThis profile contains my contact information, social links, and business card.\n\nClick the link below to view the card:\n${mockUserData.cardUrl}`;
    
   // console.log('Navigator share available:', !!navigator.share);
   // console.log('Current share method:', shareMethod);
   // console.log('Is mobile device:', isMobile());
    
    const mobile = isMobile();
    
    // DIRECT LINK TAB - Always send message + link only (no QR)
    if (shareMethod === "link") {
      if (navigator.share && mobile) {
        // Mobile: Use native share
        await navigator.share({
          title: "MyKard Profile",
          text: shareMessage,
          url: mockUserData.cardUrl,
        });
        await incrementShareCount();
      } else {
        // Desktop: Open WhatsApp Web
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, '_blank');
        // Poll for WhatsApp window close
        const intervalId = setInterval(() => {
          if (!document.querySelector(`iframe[src="${whatsappUrl}"]`)) {
            clearInterval(intervalId);
            incrementShareCount();
          }
        }, 1000);
      }
      return;
    }
    
    // QR TAB - Different behavior for mobile vs desktop
    if (shareMethod === "qr") {
      if (navigator.share && mobile) {
        // Mobile: 2-step share (QR first, then message + link)
        try {
          const qrWrapper = document.querySelector(`.${styles.qrWrapper}`);
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
                    const file = new File([blob], `MyKard_QR_${cardId}.png`, { type: 'image/png' });
                    
                    // Step 1: Share QR image only
                    try {
                      await navigator.share({
                        files: [file]
                      });
                      
                      // Step 2: After 300ms, share message + link
                      setTimeout(async () => {
                        try {
                          await navigator.share({
                            title: "MyKard Profile",
                            text: shareMessage,
                            url: mockUserData.cardUrl,
                          });
                          await incrementShareCount();
                        } catch (error) {
                          console.log('Could not share message after QR:', error);
                        }
                      }, 300);
                      
                    } catch (error) {
                      console.log('Could not share QR image, fallback to message only:', error);
                      // Fallback: Share message + link only
                      await navigator.share({
                        title: "MyKard Profile",
                        text: shareMessage,
                        url: mockUserData.cardUrl,
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
              url: mockUserData.cardUrl,
            });
            await incrementShareCount();
          }
        } catch (error) {
          console.log('QR share failed, fallback to message only:', error);
          // Fallback: Share message + link only
          await navigator.share({
            title: "MyKard Profile",
            text: shareMessage,
            url: mockUserData.cardUrl,
          });
          await incrementShareCount();
        }
      } else {
        // Desktop: WhatsApp Web cannot send images, send message + link only
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, '_blank');
        // Poll for WhatsApp window close
        const intervalId = setInterval(() => {
          if (!document.querySelector(`iframe[src="${whatsappUrl}"]`)) {
            clearInterval(intervalId);
            incrementShareCount();
          }
        }, 1000);
      }
    }
  };
  

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Views",
        data: [40, 70, 60, 90, 50, 80, 65],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const [file, setFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('qrLogoUpload')?.click();
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

  if (!card)
    return (
      <div className={`${styles.pageContainer} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Card Not Found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );

  return (
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
          {/* Tabs Container with Edit Button */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabsList}>
              {["share", "settings", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`${styles.tabButton} ${
                    activeTab === tab ? styles.tabButtonActive : ""
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className={styles.editCardWrapper}>
              <Link href={`/dashboard/edit?id=${cardId}`}>
                <button className={styles.editCardBtn}>
                  <FiEdit size={16} />
                  Edit Card
                </button>
              </Link>
            </div>
          </div>

          {/* Tab Contents */}
          <AnimatePresence mode="wait">
            {/* Share Section */}
            {activeTab === "share" && (
              <motion.div
                key="share"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.tabContent}
              >
                <div className={styles.shareToggleWrapper}>
                  <div className={styles.shareToggle}>
                    <button
                      onClick={() => setShareMethod("qr")}
                      className={`${styles.shareToggleButton} ${
                        shareMethod === "qr" ? styles.shareToggleButtonActive : ""
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      QR Code
                    </button>
                    <button
                      onClick={() => setShareMethod("link")}
                      className={`${styles.shareToggleButton} ${
                        shareMethod === "link" ? styles.shareToggleButtonActive : ""
                      }`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Direct Link
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  {shareMethod === "link" ? (
                    <div className={styles.directLinkBox}>
                      <div className={styles.linkDisplay}>
                        <p className={styles.linkText}>
                          {mockUserData.cardUrl}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.qrWrapper}>
                      <div className={styles.qrBox}>
                        <QRCode value={mockUserData.cardUrl} size={180} />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ height: "16px" }}></div>

                {/* Warning message when card is paused */}
                {!card?.cardActive && (
                  <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: '#fef3c7', 
                    border: '1px solid #fbbf24',
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    <p style={{ 
                      color: '#92400e', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      margin: 0
                    }}>
                      ⚠️ This card is paused. Activate it in Settings to enable sharing.
                    </p>
                  </div>
                )}

                <div className={styles.actionButtons}>
                  <motion.button 
                    onClick={() => copyToClipboard(mockUserData.cardUrl)} 
                    className={styles.actionBtn}
                    whileTap={{ scale: card?.cardActive ? 0.95 : 1 }}
                    whileHover={{ scale: card?.cardActive ? 1.03 : 1 }}
                    disabled={!card?.cardActive}
                    style={{
                      opacity: card?.cardActive ? 1 : 0.5,
                      cursor: card?.cardActive ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </motion.button>
                  <motion.button 
                    onClick={downloadQR} 
                    className={styles.actionBtn}
                    whileTap={{ scale: card?.cardActive ? 0.95 : 1 }}
                    whileHover={{ scale: card?.cardActive ? 1.03 : 1 }}
                    disabled={!card?.cardActive}
                    style={{
                      opacity: card?.cardActive ? 1 : 0.5,
                      cursor: card?.cardActive ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <Download className="w-4 h-4" /> Download QR
                  </motion.button>
                  <motion.button 
                    onClick={shareProfile} 
                    className={styles.actionBtn}
                    whileTap={{ scale: card?.cardActive ? 0.95 : 1 }}
                    whileHover={{ scale: card?.cardActive ? 1.03 : 1 }}
                    disabled={!card?.cardActive}
                    style={{
                      opacity: card?.cardActive ? 1 : 0.5,
                      cursor: card?.cardActive ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <Share2 className="w-4 h-4" /> Share Profile
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Analytics Section */}
            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`${styles.tabContent} ${styles.analyticsWrapper}`}
              >
                <h3 className={styles.analyticsTitle}>
                  <BarChart3 className="w-5 h-5" /> Analytics Overview
                </h3>

                <div className={styles.statsGrid}>
                  {[{ label: "Total Views", value: card.views?.toString() || "0", icon: Eye },
                  { label: "Shares", value: card.shares?.toString() || "0", icon: Share2 },
                  { label: "Contacts", value: contactsCount.toString(), icon: Users }].map((s, i) => (
                    <div key={i} className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <s.icon className="w-6 h-6" />
                      </div>
                      <p className={styles.statValue}>{s.value}</p>
                      <p className={styles.statLabel}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Full Settings Section */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`${styles.tabContent} ${styles.settingsContent}`}
              >
                {/* Card Configuration */}
                {/* <div className={styles.settingsCard}>
                  <h3 className={styles.settingsCardTitle}>
                    <div className={`${styles.dot}`} style={{ backgroundColor: 'var(--color-primary-light)' }}></div> Card Configuration
                  </h3> */}
                  
                  {/* Card Name */}
                  {/* <div className={styles.settingsItem}>
                    <div className={styles.settingsInfo}>
                      <h4 className={styles.settingsLabel}>Card Name</h4>
                      <p className={styles.settingsDescription}>Change the name of this card.</p>
                    </div>
                    <div className={styles.settingsControl}>
                      <input
                        type="text"
                        defaultValue={card.fullName || card.name || 'Personal'}
                        className={styles.settingsInput}
                      />
                    </div>
                  </div> */}
                  
                  {/* QR Code Logo */}
                  {/* <div className={styles.settingsItem}>
                    <div className={styles.settingsInfo}>
                      <h4 className={styles.settingsLabel}>QR Code Logo</h4>
                      <p className={styles.settingsDescription}>Change the logo inside the QR code.</p>
                    </div>
                    <div className={styles.settingsControl}>
                      <input
                        type="file"
                        id="qrLogoUpload"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <button 
                        className={styles.settingsButton}
                        onClick={triggerFileInput}
                      >
                        <FiUpload size={16} /> Upload Logo
                      </button>
                      {logoPreview && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            style={{ width: '50px', height: '50px', borderRadius: '4px' }}
                          />
                        </div>
                      )}
                    </div>
                  </div> */}
                  
                  {/* Personalized Link */}
                  {/* <div className={styles.settingsItem}>
                    <div className={styles.settingsInfo}>
                      <h4 className={styles.settingsLabel}>Personalized Link</h4>
                      <p className={styles.settingsDescription}>Create your own link to further your brand.</p>
                    </div>
                    <div className={styles.settingsControl}>
                      <input
                        type="text"
                        defaultValue="https://mykard.in/hi/XXXX"
                        className={styles.settingsInput}
                        readOnly
                      />
                    </div>
                  </div>
                </div> */}

                {/* Privacy & Visibility */}
                <div className={`${styles.settingsCard} ${styles.privacyCard}`}>
                  <h3 className={styles.settingsCardTitle} style={{ marginBottom: '1rem' }}>
                    <div className={`${styles.dot}`} style={{ backgroundColor: 'var(--color-success)' }}></div> Privacy & Visibility
                  </h3>
                  
                  {/* Pause Card */}
                  <div className={styles.settingsItem}>
                    <div className={styles.settingsInfo}>
                      <h4 className={styles.settingsLabel}>Pause Card</h4>
                      <p className={styles.settingsDescription}>
                        {card?.cardActive ? 'Card is active and shareable. Click to pause.' : 'Card is paused and cannot be shared. Click to activate.'}
                      </p>
                    </div>
                    <div className={styles.settingsControl}>
                      <button
                        onClick={handleToggleActive}
                        className={styles.toggleBtn}
                        disabled={isTogglingActive}
                      >
                        {card?.cardActive ? (
                          <FiToggleRight className={`${styles.toggleIcon} ${styles.active}`} />
                        ) : (
                          <FiToggleLeft className={`${styles.toggleIcon} ${styles.inactive}`} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                {/* <div className={styles.settingsCard}> */}
                  {/* <h3 className={styles.settingsCardTitle}> */}
                    {/* <div className={`${styles.dot}`} style={{ backgroundColor: 'var(--color-purple-600)' }}></div> Advanced Settings */}
                  {/* </h3> */}

                  {/* Renew Link only */}
                  {/* <div className={styles.settingsItem}>
                    <div className={styles.settingsInfo}>
                      <h4 className={styles.settingsLabel}>Renew Link</h4>
                      <p className={styles.settingsDescription}>Renew the link to your card.</p>
                    </div>
                    <div className={styles.settingsControl}>
                      <button className={`${styles.settingsButton} ${styles.renewButton}`}>
                        <FiRefreshCw size={16} /> Renew
                      </button>
                    </div>
                  </div>
                </div> */}


                {/* Danger Zone */}
                <div className={`${styles.settingsCard} ${styles.dangerCard}`}>
                  <h3 className={`${styles.settingsCardTitle} ${styles.dangerCardTitle}`}>
                    <div className={`${styles.dot}`}></div> Danger Zone
                  </h3>
                  <div className={`${styles.settingsItem} ${styles.dangerItem}`}>
                    <div className={styles.settingsInfo}>
                      <h4 className={styles.settingsLabel}>Delete Card</h4>
                      <p className={styles.settingsDescription}>
                        Delete this card permanently. This action cannot be undone.
                      </p>
                    </div>
                    <div className={styles.settingsControl}>
                      <button onClick={handleDelete} className={`${styles.settingsButton} ${styles.deleteButton}`}>
                        Delete Card
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CardDetailsPage;