"use client";

import React, { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
  Bookmark,
  QrCode,
  Check,
  MessageCircle,
  Heart,
  Share2,
} from "lucide-react";

// Helper for Text Truncation (The "..." logic)
const truncateStyle: CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const styles: Record<string, CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
    padding: "20px 16px", // Reduced padding for mobile
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  feedContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },
  // Promo Banner
  promoWrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #2563eb, #4338ca)",
    padding: "30px",
    color: "#ffffff",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap", // Allows wrapping on mobile
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.2)",
  },
  promoContent: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flex: "1 1 300px", // Takes space but allows shrinking
    textAlign: "left",
  },
  promoTitle: {
    fontSize: "24px",
    fontWeight: "900",
    lineHeight: "1.2",
    margin: 0,
    textAlign: "left",
  },
  promoBtn: {
    padding: "10px 24px",
    backgroundColor: "#ffffff",
    color: "#1d4ed8",
    fontWeight: "700",
    borderRadius: "9999px",
    textTransform: "uppercase",
    fontSize: "13px",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    width: "fit-content",
  },
  // Post Card
  postCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "20px",
    padding: "20px",
    width: "100%",
    boxSizing: "border-box",
  },
  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    width: "100%",
  },
  avatarContainer: {
    position: "relative",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
  },
  postMeta: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "12px",
    flex: 1,
    minWidth: 0, // Critical for truncation to work in flex
    textAlign: "left",
  },
  postName: {
    fontWeight: "700",
    color: "#0f172a",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "15px",
    margin: 0,
    ...truncateStyle, // Apply "..."
  },
  postBody: {
    color: "#1e293b",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "16px",
    textAlign: "left",
    wordBreak: "break-word",
  },
  // Action Bar
  actionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "12px",
    borderTop: "1px solid #f8fafc",
    gap: "10px",
    flexWrap: "wrap",
  },
  interactionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    color: "#64748b",
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "inherit",
  },
  connectBtn: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "6px 16px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
  },
  // Widget
  widgetWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #f1f5f9",
    padding: "20px",
    textAlign: "left",
  },
  designerList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
};

// --- COMPONENTS ---

export const PromoBanner = () => (
  <div style={styles.promoWrapper}>
    <div style={styles.promoContent}>
      <h2 style={styles.promoTitle}>
        More Than a Card— It&apos;s How Connections Begin.
      </h2>
      <p style={{ color: "#dbeafe", opacity: 0.9, fontSize: "13px", margin: 0 }}>
        Stand out with a digital profile that works for you.
      </p>
      <Link href="/dashboard/create" style={styles.promoBtn}>
        Create Free Card
      </Link>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <QrCode size={80} style={{ opacity: 0.3, color: "white" }} />
    </div>
  </div>
);

export const PostCard = () => (
  <div style={styles.postCard}>
    <div style={styles.postHeader}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1 }}>
        <div style={styles.avatarContainer}>
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya"
            alt="User"
            fill
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </div>
        <div style={styles.postMeta}>
          <h3 style={styles.postName}>
            Sanya Kapoor Very Long Name Example
            <Check size={14} style={{ backgroundColor: "#2563eb", color: "white", borderRadius: "50%", padding: "2px", flexShrink: 0 }} />
          </h3>
          <p style={{ color: "#64748b", fontSize: "12px", margin: 0, ...truncateStyle }}>
            UI/UX Designer • @sanya_ux_designer_official
          </p>
        </div>
      </div>
      <button style={{ background: "none", border: "none", padding: "4px", color: "#94a3b8" }}>
        <MoreHorizontal size={20} />
      </button>
    </div>

    <div style={styles.postBody}>
      <p style={{ margin: "0 0 12px 0" }}>
        Creative designer passionate about user-centric experiences. Connect for Nagpur collaborations! 🚀
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        {["#Design", "#Figma", "#UX"].map((tag) => (
          <span key={tag} style={{ color: "#2563eb", fontSize: "13px", fontWeight: "700" }}>{tag}</span>
        ))}
      </div>
      <div style={styles.actionRow}>
        <div style={styles.interactionGroup}>
          <button style={styles.iconBtn}><Heart size={18} /> 1.2k</button>
          <button style={styles.iconBtn}><MessageCircle size={18} /> 24</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button style={styles.connectBtn}>Connect</button>
          <Bookmark size={18} color="#94a3b8" />
        </div>
      </div>
    </div>
  </div>
);

export const TopDesignersWidget = () => {
  const designers = [
    { name: "Rahul Sharma Professional Designer", img: "Rahul" },
    { name: "Neha T.", img: "Neha" },
  ];

  return (
    <div style={styles.widgetWrapper}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Trending</h3>
        <Link href="/search" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", fontWeight: "700" }}>
          VIEW ALL
        </Link>
      </div>
      <div style={styles.designerList}>
        {designers.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${d.img}`} alt={d.name} fill unoptimized />
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: "14px", fontWeight: "700", ...truncateStyle }}>{d.name}</span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>NAGPUR, IN</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function FeedPage() {
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.feedContainer}>
        <PromoBanner />
        <PostCard />
        <PostCard />
        <TopDesignersWidget />
      </div>
    </div>
  );
}