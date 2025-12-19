"use client";

import React, { useEffect, useState } from "react";
import styles from './cardType.module.css';
import { capitalizeFirstLetter } from '@/lib/utils';
import StarBulletModal from "./StarBulletModal";
import { useRouter } from "next/navigation";


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
  fontFamily?: string;
  cardType?: string;
  documentUrl?: string;
  onDocumentClick?: (url: string) => void;
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
  cardType = "",
  documentUrl,
}) => {

  const router = useRouter();
  const [glassMode, setGlassMode] = useState<"light" | "dark">("light");
  const [availability, setAvailability] = useState<
    "available" | "busy" | "unavailable"
  >("available");

  const capitalizedFirstName = capitalizeFirstLetter(firstName);
  const capitalizedMiddleName = capitalizeFirstLetter(middleName);
  const capitalizedLastName = capitalizeFirstLetter(lastName);
  const fullName = [capitalizedFirstName, capitalizedMiddleName, capitalizedLastName].filter(Boolean).join(' ') || name || 'Your Name';
  const firstLetter = capitalizedFirstName ? capitalizedFirstName.charAt(0).toUpperCase() : (name ? name.charAt(0).toUpperCase() : "J");

  const availabilityConfig = {
    available: {
      text: "Available",
      color: "#22c55e",
    },
    busy: {
      text: "Busy",
      color: "#facc15",
    },
    unavailable: {
      text: "Unavailable",
      color: "#ef4444",
    },
  };


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

  type Section = 'Services' | 'Portfolio' | 'Skills' | 'Experience' | 'Review';
  const [activePanel, setActivePanel] = useState<Section | null>(null);

  const openPortfolio = () => {
    setActivePanel('Portfolio');
  };

  const sectionText: Record<Section, string> = {
    Services: services || "",
    Portfolio: portfolio || "",
    Skills: skills || "",
    Experience: experience || "",
    Review: review || "",
  };

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>

      <div
        className={glassMode === "light" ? styles.glassLight : styles.glassDark}
        style={{
          width: "360px",
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",

          /* IMPORTANT: let glass be visible */
          background:
            glassMode === "light"
              ? `linear-gradient(135deg, ${themeColor1} 0%, ${themeColor2} 100%)`
              : `linear-gradient(135deg, #020617 0%, #020617 100%)`,
        }}
      >
        {/* 🔝 Top Action Bar */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            right: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 40,
          }}
        >
          {/* Edit Button */}
          <button
            onClick={() => router.push("/dashboard/edit")}
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
              background: "rgba(255,255,255,0.9)",
              color: themeColor1,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Edit
          </button>

          {/* Name (max 7 chars) */}
          <div
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
              background: "rgba(255,255,255,0.95)",
              color: themeColor1,
              maxWidth: "140px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={fullName}
          >
            {fullName.length > 7 ? `${fullName.slice(0, 7)}...` : fullName}
          </div>

          {/* Card Type */}
          {cardType && (
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                background: "rgba(255,255,255,0.85)",
                color: themeColor1,
                whiteSpace: "nowrap",
              }}
            >
              {cardType}
            </div>
          )}
        </div>


        {/* 🔘 TOGGLE GLASS BUTTON */}
        <button
          onClick={() =>
            setGlassMode((prev) => (prev === "light" ? "dark" : "light"))
          }
          style={{
            position: "absolute",
            bottom: "14px",
            right: "14px",
            padding: "6px 12px",
            fontSize: "11px",
            borderRadius: "12px",
            cursor: "pointer",
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            zIndex: 60,
          }}
        >
          Toggle Glass
        </button>


        {/* Header */}
        <div style={{
          padding: "22px",
          color: "white",
          position: "relative",
        }}>
          <div style={{
            width: "100%",
            height: "92px",
            borderRadius: "14px",
            background: cover ? "transparent" : "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.7)",
            overflow: "hidden",
          }}>
            {cover && (
              <img src={cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "-44px" }}>
            <div style={{
              width: "104px",
              height: "104px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "5px solid #ffffff",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              background: photo ? "transparent" : "#60A5FA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {photo ? (
                <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "36px", fontWeight: 800, color: "white" }}>{firstLetter}</span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "14px 0 8px",
              }}
            >
              <h3
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  margin: 0,
                }}
              >
                {fullName}
              </h3>

              {/* Availability Indicator */}
              <div

                title={availabilityConfig[availability].text}
                style={{

                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255,255,255,0.15)",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >

                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: availabilityConfig[availability].color,
                    boxShadow: `0 0 6px ${availabilityConfig[availability].color}`,
                  }}
                />
                {availabilityConfig[availability].text}
              </div>
            </div>

            {(title || companyFinal) && (
              <div style={{ display: "flex", gap: "12px", alignItems: "center", color: "#ffffff", opacity: 0.95 }}>
                {title && <span style={{ fontSize: "14px", fontWeight: 700 }}>{title}</span>}
                {title && companyFinal && <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.8)" }} />}
                {companyFinal && <span style={{ fontSize: "14px", fontWeight: 700 }}>{companyFinal}</span>}
              </div>
            )}

            {location && <p style={{ margin: "10px 0 0", fontSize: "14px", color: "#FFFFFF" }}>{location}</p>}

            {(email || phone || linkedin || website) && (
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                {email && (
                  <a href={`mailto:${email}`} style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "9999px",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16v16H4z" opacity="0" />
                      <path d="M4 8l8 5 8-5" />
                      <rect x="4" y="6" width="16" height="12" rx="2" ry="2" />
                    </svg>
                  </a>
                )}

                {phone && (
                  <a href={`tel:${phone}`} style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "9999px",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </a>
                )}

                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "9999px",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4zM8.5 8.5h3.8v1.98h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V23h-4v-6.3c0-1.5-.03-3.44-2.1-3.44-2.1 0-2.42 1.64-2.42 3.34V23h-4z" />
                    </svg>
                  </a>
                )}

                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "9999px",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 010 20a15.3 15.3 0 010-20z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 20px 16px",
            color: "#FFFFFF",
            textAlign: "center",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "20px",
            margin: "0 16px 16px",
          }}
        >

          <p style={{ fontSize: "13px", lineHeight: 1.6, margin: 0, color: "#FFFFFF", opacity: 1 }}>
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
                    color: "#FFFFFF",
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
                  if (documentUrl) {
                    onDocumentClick?.(documentUrl);
                  }
                }}
                style={{
                  padding: "8px 14px",
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
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

        <StarBulletModal
          activePanel={activePanel}
          isMobile={false}
          themeColor1={themeColor1}
          panelText={sectionText}
          onClose={() => setActivePanel(null)}
        />

      </div>
    </div>
  );
};

export default DigitalCardPreview;

