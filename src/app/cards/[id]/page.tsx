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
import { capitalizeFirstLetter } from '@/lib/utils';
import CatalogViewer from "@/components/cards/CatalogViewer";

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

// --- Import Dynamic Card Components ---
import DigitalCardPreview from "@/components/cards/DigitalCardPreview";
import FlatCardPreview from "@/components/cards/FlatCardPreview";
import ModernCardPreview from "@/components/cards/ModernCardPreview";
import SleekCardPreview from "@/components/cards/SleekCardPreview";

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
  cover?: string;
  coverImage?: string;
  bannerImage?: string;
  customFields?: string | any;
  showCatalog?: boolean;
  catalogTitle?: string;
  catalogItems?: string | any;
}

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
  const [catalogViewerData, setCatalogViewerData] = useState<{ isOpen: boolean; title: string; items: any[] }>({ isOpen: false, title: '', items: [] });

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

  // --- RENDER HELPER FOR DYNAMIC CARD PREVIEW ---
  const renderCard = (cardData: Card) => {
    const capitalizedFullName = capitalizeFirstLetter(cardData.fullName || cardData.name || '');
    const nameParts = capitalizedFullName.split(' ');

    const commonProps = {
      firstName: nameParts[0] || '',
      middleName: nameParts.length === 3 ? nameParts[1] : '',
      lastName: nameParts.length >= 2 ? nameParts.slice(-1).join('') : '',
      cardName: capitalizeFirstLetter(cardData.cardName || cardData.name || ''),
      title: cardData.title || '',
      company: cardData.company || '',
      location: cardData.location || '',
      about: cardData.bio || cardData.about || cardData.description || '',
      skills: cardData.skills || '',
      portfolio: cardData.portfolio || '',
      experience: cardData.experience || '',
      services: cardData.services || '',
      review: cardData.review || '',
      photo: cardData.profileImage || cardData.photo || '',
      cover: cardData.coverImage || cardData.bannerImage || cardData.cover || '',
      email: cardData.email || '',
      phone: cardData.phone || '',
      linkedin: cardData.linkedinUrl || cardData.linkedin || '',
      website: cardData.websiteUrl || cardData.website || '',
      themeColor1: cardData.selectedColor || '#3b82f6',
      themeColor2: cardData.selectedColor2 || '#2563eb',
      fontFamily: cardData.selectedFont || 'system-ui, sans-serif',
      cardType: cardData.cardType || '',
      documentUrl: cardData.documentUrl || '',
      customFields: cardData.customFields
        ? (typeof cardData.customFields === 'string' ? JSON.parse(cardData.customFields) : cardData.customFields)
        : [],
      showCatalog: cardData.showCatalog || false,
      catalogTitle: cardData.catalogTitle || 'Catalog',
      onCatalogClick: () => {
        let items: any[] = [];
        try {
          items = cardData.catalogItems ? (typeof cardData.catalogItems === 'string' ? JSON.parse(cardData.catalogItems) : cardData.catalogItems) : [];
        } catch (e) { console.error('Failed to parse catalog items', e); }
        setCatalogViewerData({ isOpen: true, title: cardData.catalogTitle || 'Catalog', items });
      },
      onClick: () => { }
    };

    const selectedDesign = cardData.selectedDesign || 'Classic';

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

  // --- ACTIONS ---

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

  // --- DATA FETCHING ---

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

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/users/connections?type=accepted", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const connections = data.requests || [];
      setContactsCount(connections.length);
    } catch (error) {
      console.error("Error fetching connections", error);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, 5000);
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
      // Fallback
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

  const shareProfile = async () => {
    const shareMessage = `Here is my MyKard digital profile. You can view my details and connect with me here.\n\nThis profile contains my contact information, social links, and business card.\n\nClick the link below to view the card:\n${mockUserData.cardUrl}`;
    const mobile = isMobile();

    if (shareMethod === "link") {
      if (navigator.share && mobile) {
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
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, "_blank");
        await incrementShareCount();
      }
      return;
    }

    if (shareMethod === "qr") {
      if (navigator.share && mobile) {
        try {
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
                if (ctx) {
                  ctx.fillStyle = "#FFFFFF";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
                }

                canvas.toBlob(async (blob) => {
                  if (blob) {
                    const file = new File([blob], `MyKard_QR_${cardId}.png`, { type: "image/png" });
                    try {
                      await navigator.share({ files: [file], title: "MyKard QR Code" });
                      setTimeout(async () => {
                        try {
                          await navigator.share({ title: "MyKard Profile", text: shareMessage, url: mockUserData.cardUrl });
                          await incrementShareCount();
                        } catch (error) { console.log("Could not share message after QR:", error); }
                      }, 500);
                    } catch (error) {
                      console.log("QR share failed, fallback to message only");
                      try {
                        await navigator.share({ title: "MyKard Profile", text: shareMessage, url: mockUserData.cardUrl });
                        await incrementShareCount();
                      } catch (e) { console.log(e); }
                    }
                  }
                  resolve(null);
                }, "image/png");
              };
              img.onerror = reject;
              img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
            });
          } else {
            await navigator.share({ title: "MyKard Profile", text: shareMessage, url: mockUserData.cardUrl });
            await incrementShareCount();
          }
        } catch (error) {
          console.log("QR share failed, fallback to message only:", error);
          try {
            await navigator.share({ title: "MyKard Profile", text: shareMessage, url: mockUserData.cardUrl });
            await incrementShareCount();
          } catch (e) { console.log(e); }
        }
      } else {
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
            {renderCard(card)}
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

          {/* Spacer to prevent Bottom Navbar from hiding content on Mobile */}
          <div className="h-32 w-full md:hidden" style={{ height: '40px', display: 'block', clear: 'both' }} />
        </div>
      </div>

      {/* Hidden QR for Downloading - Always rendered so download logic works even on Link tab */}
      <div style={{ display: 'none', position: 'fixed', pointerEvents: 'none' }}>
        <div ref={hiddenQrRef}>
          <QRCode value={mockUserData.cardUrl} size={500} />
        </div>
      </div>

      {showDelete && <Delete cardname={card.cardName ?? ""} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}

      <CatalogViewer
        isOpen={catalogViewerData.isOpen}
        onClose={() => setCatalogViewerData(prev => ({ ...prev, isOpen: false }))}
        title={catalogViewerData.title}
        items={catalogViewerData.items}
      />
    </>
  );
};

const CardDetailsPageWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <CardDetailsContent />
  </Suspense>
);

export default CardDetailsPageWrapper;