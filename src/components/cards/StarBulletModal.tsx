"use client";

import React, { useState } from "react";
import { X, ExternalLink, ChevronRight, Globe } from "lucide-react";

type Section = "Services" | "Portfolio" | "Skills" | "Experience" | "Review" | "Links";

export interface ExtraField {
  id: number;
  name: string;
  link: string;
}

interface StarBulletModalProps {
  activePanel: Section | null;
  isMobile: boolean;
  themeColor1: string;
  panelText: Record<string, string>;
  onClose: () => void;
  customFields?: ExtraField[];
}

const StarBulletModal: React.FC<StarBulletModalProps> = ({
  activePanel,
  isMobile,
  themeColor1,
  panelText,
  onClose,
  customFields = [],
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const MAX_ITEM_LENGTH = 140;

  if (!activePanel) return null;

  // --- RENDER LOGIC FOR LINKS (Professional List Style) ---
  const renderCustomFieldItem = (field: ExtraField) => {
    const href = field.link.startsWith('http') ? field.link : `https://${field.link}`;
    return (
      <a
        key={field.id}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0",
          borderBottom: "1px solid #f3f4f6",
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
          {/* Subtle Icon Box */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `${themeColor1}15`, // Very light version of theme color (15% opacity)
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: themeColor1,
              flexShrink: 0
            }}
          >
            <Globe size={16} />
          </div>

          {/* Link Name */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              fontWeight: 600,
              color: "#1f2937",
              fontSize: '14px',
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {field.name || "External Link"}
            </span>
            <span style={{
              fontSize: '11px',
              color: "#9ca3af",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "200px"
            }}>
              {field.link}
            </span>
          </div>
        </div>

        <ExternalLink size={14} color="#9CA3AF" />
      </a>
    );
  };

  // Logic for standard text items
  const raw = panelText[activePanel] || "";
  const items = activePanel === "Links"
    ? []
    : raw.split(",").map((s) => s.trim()).filter(Boolean);

  const renderItem = (title: string) => {
    // Check if item is a URL
    const isUrl = /^https?:\/\//i.test(title) || /^[\w.-]+\.[a-z]{2,}/i.test(title);
    const href = isUrl ? (/^https?:\/\//i.test(title) ? title : `https://${title}`) : undefined;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
          paddingBottom: 12,
          borderBottom: "1px solid #f3f4f6", // Subtle separator
        }}
      >
        {/* Professional Bullet Dot instead of Star */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: themeColor1,
            marginTop: 6, // Align with text
            flexShrink: 0,
            boxShadow: `0 0 0 2px ${themeColor1}30` // Soft glow ring
          }}
        />

        <div style={{ flex: 1 }}>
          {isUrl && href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontWeight: 500,
                color: themeColor1,
                textDecoration: "none",
                fontSize: "14px",
                lineHeight: "1.5",
                wordBreak: "break-word"
              }}
            >
              {title}
            </a>
          ) : (
            <div style={{
              fontWeight: 500,
              color: "#374151",
              fontSize: "14px",
              lineHeight: "1.5",
              wordBreak: "break-word"
            }}>
              {title}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={(e) => {
        e.stopPropagation(); // Stop click from bubbling to parent
        onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16, // Smoother corners
          width: "100%",
          maxWidth: "380px", // Compact width
          maxHeight: "80%",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", // Deep shadow for pop effect
          display: "flex",
          flexDirection: "column",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
          }}
        >
          <h3 style={{
            margin: 0,
            color: "#111827",
            fontWeight: 700,
            fontSize: "16px",
            letterSpacing: "-0.01em"
          }}>
            {activePanel === "Links" ? "Quick Links" : activePanel}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              background: "#f3f4f6",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 6,
              borderRadius: "50%",
              transition: "background 0.2s"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "20px",
          }}
        >
          {activePanel === "Links" ? (
            customFields.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {customFields.map((field) => renderCustomFieldItem(field))}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px 0',
                opacity: 0.6
              }}>
                <div style={{ marginBottom: 10, color: "#d1d5db" }}><Globe size={40} /></div>
                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', margin: 0 }}>No links available.</p>
              </div>
            )
          ) : (
            <>
              {items.length > 0 ? items.map((it, idx) => {
                const key = `${activePanel}-${idx}`;
                const isExpanded = !!expandedItems[key];
                const needsShowMore = it.length > MAX_ITEM_LENGTH;
                const displayText = !needsShowMore || isExpanded ? it : `${it.slice(0, MAX_ITEM_LENGTH)}...`;

                return (
                  <div key={key} style={{ marginBottom: 0 }}>
                    {renderItem(displayText)}

                    {needsShowMore && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
                        }}
                        style={{
                          marginTop: -8,
                          marginBottom: 16,
                          marginLeft: 20,
                          fontSize: 12,
                          color: themeColor1,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {isExpanded ? "Show less" : "Read more"}
                        <ChevronRight size={12} style={{ transform: isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s', marginLeft: 2 }} />
                      </button>
                    )}
                  </div>
                );
              }) : (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "30px 0", fontSize: "14px" }}>
                  No items listed in {activePanel}.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default StarBulletModal;