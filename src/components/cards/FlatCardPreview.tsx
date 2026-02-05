"use client";

import React, { useEffect, useState } from "react";
import { DigitalCardProps } from "./DigitalCardPreview";
import StarBulletModal from "./StarBulletModal";
import styles from "./cardType.module.css";
import { capitalizeFirstLetter } from '@/lib/utils';

const FlatCardPreview: React.FC<DigitalCardProps> = ({
  firstName = "",
  middleName = "",
  lastName = "",
  cardName = "",
  cardType = "",
  title = "",
  company = "",
  location = "",
  about = "",
  photo = "",
  cover = "",
  email = "",
  phone = "",
  linkedin = "",
  website = "",
  themeColor1 = "#3b82f6",
  themeColor2 = "#60a5fa",
  fontFamily = "system-ui, sans-serif",
  skills = "",
  portfolio = "",
  experience = "",
  services = "",
  review = "",
  documentUrl,
  onDocumentClick,
  onClick,
}) => {
  const capitalizedFirstName = capitalizeFirstLetter(firstName);
  const capitalizedMiddleName = capitalizeFirstLetter(middleName);
  const capitalizedLastName = capitalizeFirstLetter(lastName);
  const fullName =
    [capitalizedFirstName, capitalizedMiddleName, capitalizedLastName].filter(Boolean).join(" ") ||
    "Your Name";

  const firstLetter = fullName.charAt(0).toUpperCase();

  type Section = "Services" | "Portfolio" | "Skills" | "Experience" | "Review";
  const [activePanel, setActivePanel] = useState<Section | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsMobile(
        typeof window !== "undefined" && window.innerWidth < 768
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Prepare list values
  const skillsList = skills.split(",").map((s) => s.trim()).filter(Boolean);
  const portfolioList = portfolio.split(",").map((s) => s.trim()).filter(Boolean);
  const experienceList = experience.split(",").map((s) => s.trim()).filter(Boolean);
  const servicesList = services.split(",").map((s) => s.trim()).filter(Boolean);
  const reviewList = review.split(",").map((s) => s.trim()).filter(Boolean);

  const renderItem = (title: string, subtitle?: string) => {
    const isUrl = /^https?:\/\//i.test(title) || /^[\w.-]+\.[a-z]{2,}/i.test(title);
    const href = isUrl ? (/^https?:\/\//i.test(title) ? title : `https://${title}`) : undefined;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          borderRadius: 12,
          padding: "12px 14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: themeColor1,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            ★
          </div>
          <div>
            {isUrl && href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 700,
                  color: "#111827",
                  textDecoration: "none",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {title}
              </a>
            ) : (
              <div
                style={{
                  fontWeight: 700,
                  color: "#111827",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ fontSize: 12, color: "#6B7280" }}>{subtitle}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const sectionText = {
    Skills: skills,
    Services: services,
    Portfolio: portfolio,
    Experience: experience,
    Review: review,
  } as const;

  return (
    <div
      onClick={onClick}
      style={{
        width: "360px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        fontFamily,
        background: `linear-gradient(135deg, ${themeColor1} 0%, ${themeColor2} 100%)`,
        border: `3px solid ${themeColor1}`,
        position: "relative",
        cursor: "pointer",
      }}
    >
      {/* Card Name Badge */}
      {cardName && (
        <div
  style={{
    position: "absolute",
    top: "16px",
    right: "16px",
    display: "flex",
    gap: "8px",
    zIndex: 20,
  }}
>
  {/* Card Name Badge */}
  {cardName && (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        color: themeColor1,
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 700,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {cardName}
    </div>
  )}

  {/* Card Type Pill */}
  {cardType && (
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        color: themeColor1,
        padding: "6px 12px",
        borderRadius: "14px",
        fontSize: "11px",
        fontWeight: 700,
        border: `1px solid ${themeColor1}`,
      }}
    >
      {cardType}
    </div>
  )}
</div>
      )}

      {/* Cover */}
      <div
        style={{
          width: "100%",
          height: "120px",
          overflow: "hidden",
          backgroundImage: cover
            ? "none"
            : `linear-gradient(135deg, ${themeColor1}, ${themeColor2})`,
          backgroundSize: cover ? "cover" : "auto",
          backgroundPosition: "center",
        }}
      >
        {cover && (
          <img
            src={cover}
            alt="Cover"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "24px", textAlign: "center" }}>
        {/* Photo */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "12px",
            overflow: "hidden",
            margin: "0 auto 16px",
            background: photo ? "transparent" : themeColor1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "white",
              }}
            >
              {firstLetter}
            </span>
          )}
        </div>

        {/* Name */}
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "24px",
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          {fullName}
        </h3>

        {title && (
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "16px",
              color: "#FFFFFF",
              fontWeight: 600,
              opacity: 0.95,
            }}
          >
            {title}
          </p>
        )}

        {company && (
          <p
            style={{
              margin: "0 0 16px",
              fontSize: "14px",
              color: "#FFFFFF",
            }}
          >
            {company}
          </p>
        )}

        {location && (
          <p
            style={{
              margin: "0 0 16px",
              fontSize: "14px",
              color: "#FFFFFF",
            }}
          >
            {location}
          </p>
        )}

        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.5,
            color: "#FFFFFF",
            margin: "0 0 20px",
            opacity: 0.9,
          }}
        >
          {about}
        </p>

        {/* Social Row */}
        {(email || phone || linkedin || website) && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            {email && (
              <a
                href={`mailto:${email}`}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <rect x="4" y="6" width="16" height="12" rx="2" ry="2" />
                  <path d="M4 8l8 5 8-5" />
                </svg>
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone}`}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.63A2 2 0 013.08 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              </a>
            )}

            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4zM8.5 8.5h3.8v1.98h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V23h-4v-6.3c0-1.5-.03-3.44-2.1-3.44-2.1 0-2.42 1.64-2.42 3.34V23h-4z" />
                </svg>
              </a>
            )}

            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 010 20a15.3 15.3 0 010-20z" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Pills */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
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
                  setActivePanel(b.text as Section);
                }}
                style={{
                  padding: "8px 14px",
                  background: "rgba(255,255,255,0.2)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.3)",
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
                if (onDocumentClick) {
                  onDocumentClick(documentUrl);
                }
              }}
              style={{
                padding: "8px 14px",
                background: "rgba(255,255,255,0.2)",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.3)",
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
        isMobile={isMobile}
        themeColor1={themeColor1}
        panelText={sectionText}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
};

export default FlatCardPreview;
