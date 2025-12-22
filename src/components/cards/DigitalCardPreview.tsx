"use client";

import React, { useState } from "react";
import { capitalizeFirstLetter } from '@/lib/utils';
import StarBulletModal from "./StarBulletModal";

// Import Brand Icons
import { 
  FaWhatsapp, 
  FaGithub, 
  FaTwitter, 
  FaXTwitter, 
  FaInstagram, 
  FaFacebook, 
  FaLinkedin, 
  FaYoutube, 
  FaDiscord,
  FaTelegram,
  FaGlobe 
} from "react-icons/fa6";
import { text } from "stream/consumers";

export interface ExtraField {
  id: number;
  name: string;
  link: string;
}

export interface DigitalCardProps {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  cardName?: string; 
  name?: string; 
  title: string;
  company?: string;
  location: string;
  about: string;
  skills: string;
  portfolio: string;
  experience: string;
  services?: string;
  review?: string;
  photo?: string;
  cover?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  design?: string;
  themeColor1?: string;
  themeColor2?: string;
  textColor?: string;
  fontFamily?: string;
  cardType?: string;
  documentUrl?: string;
  onDocumentClick?: (url: string) => void;
  customFields?: ExtraField[];
}

const DigitalCardPreview: React.FC<DigitalCardProps> = ({
  firstName = "",
  onDocumentClick,
  middleName = "",
  lastName = "",
  cardName = "",
  name = "",
  title = "",
  company = "",
  location = "",
  about = "",
  skills = "",
  portfolio = "",
  experience = "",
  services = "",
  review = "",
  photo = "",
  cover = "",
  email = "",
  phone = "",
  linkedin = "",
  website = "",
  themeColor1 = "#3b82f6",
  themeColor2 = "#2563eb",
  textColor = "#ffffff",
  fontFamily = "Arial, sans-serif",
  cardType = "",
  documentUrl,
  customFields = [],
}) => {

  const capitalizedFirstName = capitalizeFirstLetter(firstName);
  const capitalizedMiddleName = capitalizeFirstLetter(middleName);
  const capitalizedLastName = capitalizeFirstLetter(lastName);
  const fullName = [capitalizedFirstName, capitalizedMiddleName, capitalizedLastName].filter(Boolean).join(' ') || name || 'Your Name';
  const firstLetter = capitalizedFirstName ? capitalizedFirstName.charAt(0).toUpperCase() : (name ? name.charAt(0).toUpperCase() : "J");

  const parsedCompany = (() => {
    const atIndex = experience.indexOf('@');
    if (atIndex !== -1) {
      const afterAt = experience.slice(atIndex + 1).trim();
      const end = afterAt.indexOf('(');
      return (end !== -1 ? afterAt.slice(0, end) : afterAt).trim();
    }
    return '';
  })();

  const companyFinal = company && company.trim().length > 0 ? company : parsedCompany;

  // We need 'Links' back in the Section type for the popup
  type Section = 'Services' | 'Portfolio' | 'Skills' | 'Experience' | 'Review' | 'Links';
  const [activePanel, setActivePanel] = useState<Section | null>(null);

  const openPortfolio = () => {
    setActivePanel('Portfolio');
  };

  const sectionText: Record<string, string> = {
    Services: services || "",
    Portfolio: portfolio || "",
    Skills: skills || "",
    Experience: experience || "",
    Review: review || "",
  };

  // --- LOGIC: Split Fields into Socials vs Others ---
  const knownPlatforms = ['whatsapp', 'github', 'twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'discord', 'telegram', 'x'];
  
  const socialFields = customFields.filter(field => 
    knownPlatforms.some(platform => field.name.toLowerCase().includes(platform))
  );

  const otherFields = customFields.filter(field => 
    !knownPlatforms.some(platform => field.name.toLowerCase().includes(platform))
  );

  // Helper to get icon
  const getIconForField = (name: string) => {
    const lowerName = name.toLowerCase().trim();
    const style = { fontSize: '20px', color: textColor }; 

    if (lowerName.includes('whatsapp')) return <FaWhatsapp style={style} />;
    if (lowerName.includes('github')) return <FaGithub style={style} />;
    if (lowerName.includes('twitter')) return <FaTwitter style={style} />;
    if (lowerName.includes('instagram')) return <FaInstagram style={style} />;
    if (lowerName.includes('facebook')) return <FaFacebook style={style} />;
    if (lowerName.includes('linkedin')) return <FaLinkedin style={style} />;
    if (lowerName.includes('youtube')) return <FaYoutube style={style} />;
    if (lowerName.includes('discord')) return <FaDiscord style={style} />;
    if (lowerName.includes('telegram')) return <FaTelegram style={style} />;
    if (lowerName === 'x') return <FaXTwitter style={style} />;
    
    return <FaGlobe style={style} />; 
  };

  const iconButtonStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "9999px",
    background: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s",
    flexShrink: 0 
  };

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      
      <div style={{
        width: "360px",
        borderRadius: "28px",
        overflow: "hidden", 
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
        fontFamily: fontFamily,
        position: "relative",
        background: `linear-gradient(135deg, ${themeColor1} 0%, ${themeColor2} 100%)`,
        color: textColor
      }}>

      {/* Card Name + Type */}
      {(cardName || cardType) && (
        <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px", zIndex: 20 }}>
          {cardName && (
            <div style={{ background: "rgba(255, 255, 255, 0.85)", color: themeColor1, padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, border: `1px solid ${themeColor1}`, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              {cardName}
            </div>
          )}
          {cardType && (
            <div style={{ background: "rgba(255,255,255,0.85)", color: themeColor1, padding: "6px 12px", borderRadius: "14px", fontSize: "11px", fontWeight: 700, border: `1px solid ${themeColor1}`, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              {cardType}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "22px", color: "white", position: "relative" }}>
        <div style={{ width: "100%", height: "92px", borderRadius: "14px", background: cover ? "transparent" : "rgba(255,255,255,0.15)", border: `2px solid #ffffff`, overflow: "hidden" }}>
          {cover && (
            <img src={cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "-44px" }}>
          <div style={{ width: "104px", height: "104px", borderRadius: "50%", overflow: "hidden", border: `5px solid #ffffff`, boxShadow: "0 8px 20px rgba(0,0,0,0.25)", background: photo ? "transparent" : "#60A5FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {photo ? (
              <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "36px", fontWeight: 800, color: "#ffffff" }}>{firstLetter}</span>
            )}
          </div>

          <h3 style={{ margin: "14px 0 8px", fontSize: "26px", fontWeight: 800, color: textColor, textAlign: "center" }}>
            {fullName}
          </h3>

          {(title || companyFinal) && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center", color: textColor, opacity: 0.95, textAlign: "center", justifyContent: "center" }}>
              {title && <span style={{ fontSize: "14px", fontWeight: 700 }}>{title}</span>}
              {title && companyFinal && <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.8)" }} />}
              {companyFinal && <span style={{ fontSize: "14px", fontWeight: 700 }}>{companyFinal}</span>}
            </div>
          )}

          {location && <p style={{ margin: "10px 0 0", fontSize: "14px", color: textColor }}>{location}</p>}

          {/* ====================================================
             ICONS SECTION (Standard + Hybrid Custom Fields)
             ====================================================
          */}
          {(email || phone || linkedin || website || (customFields && customFields.length > 0)) && (
            <div style={{ 
              display: "flex", 
              gap: "10px", 
              marginTop: "20px", 
              flexWrap: "wrap", 
              justifyContent: "center" 
            }}>
              
              {/* Standard Icons */}
              {email && (
                <a href={`mailto:${email}`} style={iconButtonStyle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" opacity="0"/><path d="M4 8l8 5 8-5"/><rect x="4" y="6" width="16" height="12" rx="2" ry="2"/></svg>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} style={iconButtonStyle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" style={iconButtonStyle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={textColor}><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4zM8.5 8.5h3.8v1.98h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V23h-4v-6.3c0-1.5-.03-3.44-2.1-3.44-2.1 0-2.42 1.64-2.42 3.34V23h-4z"/></svg>
                </a>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" style={iconButtonStyle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20a15.3 15.3 0 010-20z"/></svg>
                </a>
              )}

              {/* 1. RENDER SOCIAL FIELDS AS DIRECT ICONS */}
              {socialFields.map((field) => (
                <a 
                  key={field.id}
                  href={field.link.startsWith('http') ? field.link : `https://${field.link}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={iconButtonStyle}
                  title={field.name}
                >
                  {getIconForField(field.name)}
                </a>
              ))}

              {/* 2. RENDER "OTHER" FIELDS AS A SINGLE POPUP TRIGGER */}
              {otherFields.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePanel('Links'); // Triggers Modal with Other fields
                  }}
                  style={iconButtonStyle}
                  title="More Links"
                >
                  {/* Standard Link Icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </button>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Body Buttons (Services, Skills etc) */}
      <div style={{ padding: "20px 20px 16px", color: textColor, textAlign: "center" }}>
        <p style={{ fontSize: "13px", lineHeight: 1.6, margin: 0, color: textColor, opacity: 1 }}>
          {about}
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginTop: "16px" }}>
          {[
            { text: "Services", value: services },
            { text: "Portfolio", value: portfolio },
            { text: "Skills", value: skills },
            { text: "Experience", value: experience },
            { text: "Review", value: review },
          ]
            .filter((b) => b.value && b.value.trim() !== "")
            .map((b) => (
              <button
                key={b.text}
                onClick={(e) => {
                  e.stopPropagation();
                  if (b.text === 'Portfolio') {
                    openPortfolio();
                  } else {
                    setActivePanel(b.text as Section);
                  }
                }}
                style={{
                  padding: "8px 14px",
                  background: "rgba(255, 255, 255, 0.2)",
                  color: textColor,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                }}
              >
                {b.text}
              </button>
            ))}
            
            {documentUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (documentUrl) onDocumentClick?.(documentUrl);
                }}
                style={{
                  padding: "8px 14px",
                  background: "rgba(255, 255, 255, 0.2)",
                  color: textColor,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                }}
              >
                Docs
              </button>
            )}
        </div>
      </div>

      {/* 3. Pass ONLY the "other" fields to the modal */}
      <StarBulletModal
        activePanel={activePanel}
        isMobile={false}
        themeColor1={themeColor1}
        panelText={sectionText}
        onClose={() => setActivePanel(null)}
        customFields={otherFields} 
      />

      </div>
    </div>
  );
};

export default DigitalCardPreview;