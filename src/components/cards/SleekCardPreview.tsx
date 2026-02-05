"use client";

import React, { useEffect, useState } from "react";
import { DigitalCardProps } from "./DigitalCardPreview";
import StarBulletModal from "./StarBulletModal";
import styles from "./cardType.module.css";
import { capitalizeFirstLetter } from '@/lib/utils';

// Sleek Template
const SleekCardPreview: React.FC<DigitalCardProps> = ({
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
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
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        fontFamily: fontFamily,
        backgroundImage: `linear-gradient(135deg, ${themeColor1} 0%, ${themeColor2} 100%)`,
        border: `1px solid #e5e5e5`,
        position: "relative",
        cursor: "pointer",
      }}
    >
     {(cardName || cardType) && (
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
    {/* Card Name */}
    {cardName && (
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
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

    {/* Card Type */}
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

      {/* Header */}
      <div
        style={{
          height: "120px",
          backgroundImage: cover
            ? `url(${cover})`
            : `linear-gradient(135deg, ${themeColor1}, ${themeColor2})`,
          backgroundSize: cover ? "cover" : "auto",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          padding: "20px",
        }}
      >
        {cover && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
            }}
          />
        )}

        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "4px",
            overflow: "hidden",
            background: photo ? "transparent" : "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.3)",
            zIndex: 2,
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
              style={{ fontSize: "20px", fontWeight: 700, color: "white" }}
            >
              {firstLetter}
            </span>
          )}
        </div>

        <div style={{ marginLeft: "16px", color: "white", zIndex: 2 }}>
          <h3
            style={{
              margin: "0 0 4px",
              fontSize: "18px",
              fontWeight: 600,
              color: "#FFFFFF",
            }}
          >
            {fullName}
          </h3>

          {title && (
            <p
              style={{
                margin: "0",
                fontSize: "13px",
                opacity: 0.9,
                color: "#FFFFFF",
              }}
            >
              {title}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px" }}>
        {company && (
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "14px",
              color: "#FFFFFF",
              fontWeight: 500,
            }}
          >
            {company}
          </p>
        )}

        {location && (
          <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#FFFFFF" }}>
            {location}
          </p>
        )}

        <p
          style={{
            fontSize: "12px",
            lineHeight: 1.5,
            color: "#FFFFFF",
            margin: "0",
            opacity: 0.9,
          }}
        >
          {about}
        </p>

        {/* Contact Row */}
        {(email || phone || linkedin || website) && (
          <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
            <div style={{ display: "flex", gap: "1px" }}>
              {email && (
                <a
                  href={`mailto:${email}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: themeColor1,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  Email
                </a>
              )}

              {phone && (
                <a
                  href={`tel:${phone}`}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: themeColor1,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  Call
                </a>
              )}

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: themeColor1,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  LinkedIn
                </a>
              )}

              {website && (
                <a
                  href={website}
                  target="_blank"
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: themeColor1,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  Website
                </a>
              )}
            </div>
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

export default SleekCardPreview;
