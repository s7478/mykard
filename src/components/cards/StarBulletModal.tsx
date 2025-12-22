"use client";

import React, { useState } from "react";
import { X, ExternalLink } from "lucide-react"; 


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

  // --- RENDER LOGIC FOR OTHER LINKS ---
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
          background: "#fff",
          borderRadius: 12,
          padding: "12px 14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: 10,
          textDecoration: 'none', 
          cursor: 'pointer'
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: '100%' }}>
          {/* Star Icon */}
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
              flexShrink: 0
            }}
          >
            ★
          </div>
          {/* Link Name */}
          <div
            style={{
              fontWeight: 700,
              color: "#111827",
              wordBreak: "break-word",
              fontSize: '15px'
            }}
          >
            {field.name || "Link"}
          </div>
        </div>
        <ExternalLink size={16} color="#9CA3AF" />
      </a>
    );
  };

  // Logic for standard text items
  const raw = panelText[activePanel] || "";
  const items = activePanel === "Links" 
    ? [] 
    : raw.split(",").map((s) => s.trim()).filter(Boolean);

  const renderItem = (title: string) => {
    const isUrl = /^https?:\/\//i.test(title) || /^[\w.-]+\.[a-z]{2,}/i.test(title);
    const href = isUrl ? (/^https?:\/\//i.test(title) ? title : `https://${title}`) : undefined;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: "#111827", textDecoration: "none" }}>{title}</a>
            ) : (
              <div style={{ fontWeight: 700, color: "#111827" }}>{title}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
        padding: isMobile ? 0 : 8,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "86%",
          maxWidth: "86%",
          maxHeight: "72%",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: isMobile ? 12 : 16,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ margin: 0, color: "#111827", fontWeight: 700 }}>
            {activePanel === "Links" ? "Additional Links" : activePanel}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
            padding: isMobile ? 12 : 16,
          }}
        >
          {activePanel === "Links" ? (
            customFields.length > 0 ? (
              customFields.map((field) => renderCustomFieldItem(field))
            ) : (
              <p style={{textAlign: 'center', color: '#666', fontSize: '14px'}}>No additional links found.</p>
            )
          ) : (
            items.map((it, idx) => {
              const key = `${activePanel}-${idx}`;
              const isExpanded = !!expandedItems[key];
              const needsShowMore = it.length > MAX_ITEM_LENGTH;
              const displayText = !needsShowMore || isExpanded ? it : `${it.slice(0, MAX_ITEM_LENGTH)}...`;
              return (
                <div key={key}>
                  {renderItem(displayText)}
                  {needsShowMore && (
                    <button
                      onClick={() => setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }))}
                      style={{ marginTop: 4, marginLeft: 40, fontSize: 12, color: themeColor1, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {isExpanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              );
            })
          )}
          
          {/* Empty State for Text Items */}
          {activePanel !== "Links" && items.length === 0 && (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>
              No items found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StarBulletModal;