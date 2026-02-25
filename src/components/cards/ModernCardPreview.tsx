"use client";

import React, { useState, useEffect } from "react";
import { DigitalCardProps } from "./DigitalCardPreview";
import StarBulletModal from "./StarBulletModal";
import { capitalizeFirstLetter } from '@/lib/utils';

// Modern Template
const ModernCardPreview: React.FC<DigitalCardProps> = ({
  firstName = "", middleName = "", lastName = "", cardName = "", cardType = "",
  title = "", company = "", location = "", about = "", photo = "", cover = "",
  email = "", phone = "", linkedin = "", website = "",
  themeColor1 = "#3b82f6", themeColor2 = "#2563eb", fontFamily = "system-ui, sans-serif",
  skills = "", portfolio = "", experience = "", services = "", review = "", documentUrl, onDocumentClick, onClick,
  showCatalog = false, // Destructure showCatalog
  catalogTitle = 'Catalog',
  onCatalogClick,
  showHelper = false,
}) => {

  const capitalizedFirstName = capitalizeFirstLetter(firstName);
  const capitalizedMiddleName = capitalizeFirstLetter(middleName);
  const capitalizedLastName = capitalizeFirstLetter(lastName);
  const fullName = [capitalizedFirstName, capitalizedMiddleName, capitalizedLastName].filter(Boolean).join(' ') || 'Your Name';
  const firstLetter = capitalizedFirstName ? capitalizedFirstName.charAt(0).toUpperCase() : "J";

  type Section = 'Services' | 'Portfolio' | 'Skills' | 'Experience' | 'Review';
  const [activePanel, setActivePanel] = useState<Section | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const update = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const skillsList = skills.split(',').map((s) => s.trim()).filter(Boolean);
  const portfolioList = portfolio.split(',').map((s) => s.trim()).filter(Boolean);
  const experienceList = experience.split(',').map((s) => s.trim()).filter(Boolean);
  const servicesList = services.split(',').map((s) => s.trim()).filter(Boolean);
  const reviewList = review.split(',').map((s) => s.trim()).filter(Boolean);

  const renderItem = (title: string, subtitle?: string) => {
    const isUrl = /^https?:\/\//i.test(title) || /^[\w.-]+\.[a-z]{2,}/i.test(title);
    const href = isUrl ? (/^https?:\/\//i.test(title) ? title : `https://${title}`) : undefined;

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: themeColor1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>★</div>
          <div>
            {isUrl && href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 700, color: '#111827', textDecoration: 'none', display: 'block', wordBreak: 'break-word' }}
              >
                {title}
              </a>
            ) : (
              <div style={{ fontWeight: 700, color: '#111827', wordBreak: 'break-word' }}>{title}</div>
            )}
            {subtitle && <div style={{ fontSize: 12, color: '#6B7280' }}>{subtitle}</div>}
          </div>
        </div>
      </div>
    );
  };

  const MAX_ITEM_LENGTH = 140;

  const renderPanelContent = (section: Section) => {
    if (section === 'Skills') {
      const items = skillsList;
      return (
        <div style={{ padding: isMobile ? 12 : 16 }}>
          {items.map((it, idx) => {
            const key = `${section}-${idx}`;
            const isExpanded = !!expandedItems[key];
            const needsShowMore = it.length > MAX_ITEM_LENGTH;
            const displayText = !needsShowMore || isExpanded ? it : `${it.slice(0, MAX_ITEM_LENGTH)}...`;

            return (
              <div key={key}>
                {renderItem(displayText)}
                {needsShowMore && (
                  <button
                    onClick={() =>
                      setExpandedItems((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                    style={{
                      marginTop: 4,
                      marginLeft: 40,
                      fontSize: 12,
                      color: themeColor1,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    if (section === 'Services') {
      const items = servicesList;
      return (
        <div style={{ padding: isMobile ? 12 : 16 }}>
          {items.map((it, idx) => {
            const key = `${section}-${idx}`;
            const isExpanded = !!expandedItems[key];
            const needsShowMore = it.length > MAX_ITEM_LENGTH;
            const displayText = !needsShowMore || isExpanded ? it : `${it.slice(0, MAX_ITEM_LENGTH)}...`;

            return (
              <div key={key}>
                {renderItem(displayText)}
                {needsShowMore && (
                  <button
                    onClick={() =>
                      setExpandedItems((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                    style={{
                      marginTop: 4,
                      marginLeft: 40,
                      fontSize: 12,
                      color: themeColor1,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    if (section === 'Portfolio') {
      const items = portfolioList;
      return (
        <div style={{ padding: isMobile ? 12 : 16 }}>
          {items.map((it, idx) => {
            const key = `${section}-${idx}`;
            const isExpanded = !!expandedItems[key];
            const needsShowMore = it.length > MAX_ITEM_LENGTH;
            const displayText = !needsShowMore || isExpanded ? it : `${it.slice(0, MAX_ITEM_LENGTH)}...`;

            return (
              <div key={key}>
                {renderItem(displayText)}
                {needsShowMore && (
                  <button
                    onClick={() =>
                      setExpandedItems((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                    style={{
                      marginTop: 4,
                      marginLeft: 40,
                      fontSize: 12,
                      color: themeColor1,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    if (section === 'Experience') {
      const items = experienceList;
      return (
        <div style={{ padding: isMobile ? 12 : 16 }}>
          {items.map((it, idx) => {
            const key = `${section}-${idx}`;
            const isExpanded = !!expandedItems[key];
            const needsShowMore = it.length > MAX_ITEM_LENGTH;
            const displayText = !needsShowMore || isExpanded ? it : `${it.slice(0, MAX_ITEM_LENGTH)}...`;

            return (
              <div key={key}>
                {renderItem(displayText)}
                {needsShowMore && (
                  <button
                    onClick={() =>
                      setExpandedItems((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                    style={{
                      marginTop: 4,
                      marginLeft: 40,
                      fontSize: 12,
                      color: themeColor1,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    if (section === 'Review') {
      const items = reviewList;
      return (
        <div style={{ padding: isMobile ? 12 : 16 }}>
          {items.map((it, idx) => {
            const key = `${section}-${idx}`;
            const isExpanded = !!expandedItems[key];
            const needsShowMore = it.length > MAX_ITEM_LENGTH;
            const displayText = !needsShowMore || isExpanded ? it : `${it.slice(0, MAX_ITEM_LENGTH)}...`;

            return (
              <div key={key}>
                {renderItem(displayText)}
                {needsShowMore && (
                  <button
                    onClick={() =>
                      setExpandedItems((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                    style={{
                      marginTop: 4,
                      marginLeft: 40,
                      fontSize: 12,
                      color: themeColor1,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const sectionText: Record<Section, string> = {
    Services: services,
    Portfolio: portfolio,
    Skills: skills,
    Experience: experience,
    Review: review,
  };

  return (
    <div onClick={onClick} style={{
      width: "360px", borderRadius: "20px", overflow: "hidden",
      boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)", fontFamily: fontFamily,
      background: `linear-gradient(135deg, ${themeColor1} 0%, ${themeColor2} 100%)`,
      border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", position: 'relative', cursor: "pointer"
    }}>

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
      <div style={{
        width: "100%", height: "140px", overflow: "hidden",
        background: cover ? "transparent" : `linear-gradient(135deg, ${themeColor1}, ${themeColor2})`,
        backgroundSize: cover ? "cover" : "auto",
        backgroundPosition: cover ? "center" : "initial",
        borderRadius: "20px 20px 0 0"
      }}>
        {cover && (
          <img src={cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>

      <div style={{ padding: "28px", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden",
            background: photo ? "transparent" : `linear-gradient(135deg, ${themeColor1}, ${themeColor2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${themeColor1}40`
          }}>
            {photo ? (
              <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "24px", fontWeight: 700, color: "white" }}>{firstLetter}</span>
            )}
          </div>

          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#FFFFFF" }}>{fullName}</h3>
            {title && <p style={{ margin: "0 0 2px", fontSize: "14px", color: "#FFFFFF", fontWeight: 600, opacity: 0.95 }}>{title}</p>}
            {company && <p style={{ margin: "0", fontSize: "13px", color: "#FFFFFF" }}>{company}</p>}
          </div>
        </div>

        {location && <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={themeColor1} strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </p>}

        <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#FFFFFF", margin: "0 0 24px", opacity: 0.9 }}>{about}</p>

        {(email || phone || linkedin || website) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {email && (
              <a href={`mailto:${email}`} style={{
                padding: "12px", borderRadius: "12px", background: `${themeColor1}10`,
                border: `1px solid ${themeColor1}30`, textDecoration: "none",
                display: "flex", alignItems: "center", gap: "8px", color: "#FFFFFF", fontSize: "12px", fontWeight: 600
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="6" width="16" height="12" rx="2" ry="2" />
                  <path d="M4 8l8 5 8-5" />
                </svg>
                Email
              </a>
            )}

            {phone && (
              <a href={`tel:${phone}`} style={{
                padding: "12px", borderRadius: "12px", background: `${themeColor1}10`,
                border: `1px solid ${themeColor1}30`, textDecoration: "none",
                display: "flex", alignItems: "center", gap: "8px", color: "#FFFFFF", fontSize: "12px", fontWeight: 600
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style={{ marginRight: 2 }}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                Call
              </a>
            )}

            {linkedin && (
              <a href={linkedin} style={{
                padding: "12px", borderRadius: "12px", background: `${themeColor1}10`,
                border: `1px solid ${themeColor1}30`, textDecoration: "none",
                display: "flex", alignItems: "center", gap: "8px", color: "#FFFFFF", fontSize: "12px", fontWeight: 600
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style={{ marginRight: 2 }}>
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4zM8.5 8.5h3.8v1.98h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V23h-4v-6.3c0-1.5-.03-3.44-2.1-3.44-2.1 0-2.42 1.64-2.42 3.34V23h-4z" />
                </svg>
                LinkedIn
              </a>
            )}

            {website && (
              <a href={website} style={{
                padding: "12px", borderRadius: "12px", background: `${themeColor1}10`,
                border: `1px solid ${themeColor1}30`, textDecoration: "none",
                display: "flex", alignItems: "center", gap: "8px", color: "#FFFFFF", fontSize: "12px", fontWeight: 600
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 010 20a15.3 15.3 0 010-20z" />
                </svg>
                Website
              </a>
            )}
          </div>
        )}

        {/* Pills Section */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginTop: "16px" }}>
          {[
            { text: "Services", value: services },
            { text: "Portfolio", value: portfolio },
            { text: "Skills", value: skills },
            { text: "Experience", value: experience },
            { text: "Review", value: review },
          ]
            .filter(b => b.value && b.value.trim() !== '')
            .map((b) => (
              <button
                key={b.text}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePanel(b.text as Section);
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

          {showCatalog && (
            <div style={{ position: 'relative' }}>
              {/* Helper Cloud */}
              {showHelper && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '10px',
                  background: '#4F46E5',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  animation: 'pulse 2s infinite',
                  pointerEvents: 'none',
                  zIndex: 20,
                  minWidth: '130px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}>
                  Click to add contents
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: '6px',
                    borderStyle: 'solid',
                    borderColor: '#4F46E5 transparent transparent transparent'
                  }} />
                  <style>{`
                  @keyframes pulse {
                    0% { transform: translateX(-50%) scale(1); }
                    50% { transform: translateX(-50%) scale(1.05); }
                    100% { transform: translateX(-50%) scale(1); }
                  }
                `}</style>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCatalogClick?.();
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
                {catalogTitle || 'Catalog'}
              </button>
            </div>
          )}

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
        isMobile={isMobile}
        themeColor1={themeColor1}
        panelText={sectionText}
        onClose={() => setActivePanel(null)}
      />

    </div>
  );
};

export default ModernCardPreview;
