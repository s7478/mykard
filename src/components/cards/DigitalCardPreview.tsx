"use client";

import React, { useState } from "react";
import { capitalizeFirstLetter } from '@/lib/utils';
import StarBulletModal from "./StarBulletModal";
import { useRouter } from "next/navigation";

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
  // Added onClick prop for navigation
  onClick?: () => void;
  customFields?: ExtraField[];
}

const DigitalCardPreview: React.FC<DigitalCardProps> = ({
  firstName = "",
  onDocumentClick,
  onClick, // Destructure onClick
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
  // Default fallbacks 
  themeColor1 = "#3b82f6",
  themeColor2 = "#2563eb",
  textColor = "#ffffff",
  fontFamily = "'Plus Jakarta Sans', sans-serif",
  cardType = "",
  documentUrl,
  customFields = [],
}) => {

  // --- DATA PROCESSING LOGIC ---
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

  // --- SOCIAL ICONS LOGIC ---
  const knownPlatforms = ['whatsapp', 'github', 'twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'discord', 'telegram', 'x'];

  const socialFields = customFields.filter(field =>
    knownPlatforms.some(platform => field.name.toLowerCase().includes(platform))
  );

  const otherFields = customFields.filter(field =>
    !knownPlatforms.some(platform => field.name.toLowerCase().includes(platform))
  );

  const getIconForField = (name: string) => {
    const lowerName = name.toLowerCase().trim();
    const style = { fontSize: '18px', color: '#FFFFFF' };

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

  // --- DESIGN CONSTANTS ---
  const styles = {
    gradient: "linear-gradient(109.79deg, rgba(79, 117, 230, 0.98) 16.59%, #1237A1 76.33%)",
    avatarBg: "#1279E1",
    avatarBorder: "2px solid #A3D4FF",
    iconBg: "rgba(54, 183, 248, 0.45)",
    buttonBg: "rgba(255, 255, 255, 0.2)",
    buttonBorder: "0.5px solid #FFFFFF",
    font: "'Plus Jakarta Sans', sans-serif"
  };

  const iconButtonStyle = {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: styles.iconBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s",
    flexShrink: 0,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  };

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ fontFamily: styles.font }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&display=swap');
      `}</style>

      {/* --- MAIN CARD CONTAINER --- */}
      {/* ADDED onClick HERE + cursor: pointer */}
      <div
        onClick={onClick}
        style={{
          width: "100%",
          maxWidth: "340px",
          borderRadius: "20px",
          background: styles.gradient,
          position: "relative",
          color: "#FFFFFF",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 25px 50px -12px rgba(33, 82, 229, 0.35)",
          overflow: "hidden",
          cursor: "pointer" // Make it clickable
        }}
      >

        {/* --- HORIZONTAL LINE BEHIND PROFILE --- */}
        <div style={{
          position: "absolute",
          top: "94px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "1px",
          background: theme.colors.cardBorderLine,
          zIndex: 0
        }} />

        {/* --- CARD NAME & TYPE --- */}
        {(cardName || cardType) && (
          <div style={{ position: "absolute", top: "20px", right: "28px", display: "flex", gap: "6px", zIndex: 20 }}>
            {cardName && (
              <span style={{
                fontSize: "10px", fontWeight: 700,
                background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "8px",
                border: "0.5px solid rgba(255,255,255,0.4)"
              }}>
                {cardName}
              </span>
            )}
            {cardType && (
              <span style={{
                fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
                background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "8px",
                border: "0.5px solid rgba(255,255,255,0.4)"
              }}>
                {cardType}
              </span>
            )}
          </div>
        )}

        {/* --- CONTENT WRAPPER --- */}
        <div style={{ position: "relative", zIndex: 10, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>

          {/* 1. PROFILE IMAGE */}
          <div style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: styles.avatarBg,
            border: styles.avatarBorder,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            overflow: 'hidden',
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 10
          }}>
            {photo ? (
              <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontFamily: styles.font, fontWeight: '700', fontSize: "32px", color: '#FFFFFF' }}>{firstLetter}</span>
            )}
          </div>

          {/* 2. NAME */}
          <h3 style={{
            fontFamily: styles.font,
            fontWeight: '700',
            fontSize: "24px",
            lineHeight: "1.2",
            marginBottom: "8px",
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            {fullName}
          </h3>

          {/* 3. TITLE & COMPANY */}
          {(title || companyFinal) && (
            <div style={{
              fontSize: "14px",
              opacity: 0.95,
              marginBottom: "12px",
              fontWeight: "400",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              {title && <span>{title}</span>}
              {title && companyFinal && (
                <span style={{ width: "1.5px", height: "14px", background: "#FFFFFF", opacity: 0.8 }} />
              )}
              {companyFinal && <span>{companyFinal}</span>}
            </div>
          )}

          {/* 4. LOCATION */}
          {location && (
            <div style={{
              fontSize: "12px",
              fontWeight: "500",
              marginBottom: "24px",
              opacity: 0.9,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(255,255,255,0.15)",
              padding: "4px 12px",
              borderRadius: "20px"
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {location}
            </div>
          )}

          {/* 5. CONTACT ICONS */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "30px", flexWrap: "wrap", justifyContent: "center" }}>
            {email && (
              <a onClick={(e) => e.stopPropagation()} href={`mailto:${email}`} style={iconButtonStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
            )}
            {phone && (
              <a onClick={(e) => e.stopPropagation()} href={`tel:${phone}`} style={iconButtonStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </a>
            )}
            {linkedin && (
              <a onClick={(e) => e.stopPropagation()} href={linkedin} target="_blank" rel="noopener noreferrer" style={iconButtonStyle}>
                <FaLinkedin style={{ fontSize: '20px', color: '#FFFFFF' }} />
              </a>
            )}
            {website && (
              <a onClick={(e) => e.stopPropagation()} href={website} target="_blank" rel="noopener noreferrer" style={iconButtonStyle}>
                <FaGlobe style={{ fontSize: '20px', color: '#FFFFFF' }} />
              </a>
            )}
            {socialFields.map((field) => (
              <a
                key={field.id}
                onClick={(e) => e.stopPropagation()}
                href={field.link.startsWith('http') ? field.link : `https://${field.link}`}
                target="_blank"
                rel="noopener noreferrer"
                style={iconButtonStyle}
                title={field.name}
              >
                {getIconForField(field.name)}
              </a>
            ))}
          </div>

          {/* 6. ABOUT TEXT */}
          <div style={{ width: "100%", marginBottom: "24px", padding: "0 10px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: "500", lineHeight: "1.4", color: "#FFFFFF" }}>
              {about}
            </p>
          </div>

          {/* 7. ACTION BUTTONS */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
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
                    padding: "6px 16px",
                    background: styles.buttonBg,
                    border: styles.buttonBorder,
                    borderRadius: "6px",
                    color: "#FFFFFF",
                    fontFamily: styles.font,
                    fontWeight: "500",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)"
                  }}
                >
                  {b.text}
                </button>
              ))}

            {documentUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDocumentClick?.(documentUrl);
                }}
                style={{
                  padding: "6px 16px",
                  background: styles.buttonBg,
                  border: styles.buttonBorder,
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontFamily: styles.font,
                  fontWeight: "500",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Docs
              </button>
            )}

            {otherFields.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePanel('Links');
                }}
                style={{
                  padding: "6px 12px",
                  background: styles.buttonBg,
                  border: styles.buttonBorder,
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontFamily: styles.font,
                  fontWeight: "500",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: 'flex', alignItems: 'center'
                }}
              >
                More...
              </button>
            )}
          </div>

        </div>

      </div>

      <StarBulletModal
        activePanel={activePanel}
        isMobile={false}
        themeColor1="#3b82f6"
        panelText={sectionText}
        onClose={() => setActivePanel(null)}
        customFields={otherFields}
      />
    </div>
  );
};

export default DigitalCardPreview;