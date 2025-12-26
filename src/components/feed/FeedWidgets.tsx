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

const truncateStyle: CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const styles: Record<string, CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  feedContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    maxWidth: "500px", // Tightened for a better mobile-first look
  },
  // --- Updated Promo Banner Styles ---
  promoWrapper: {
    position: "relative",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #2563eb, #4338ca)",
    padding: "24px",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.2)",
  },
  promoHeader: {
    textAlign: "left",
  },
  promoFooter: {
    display: "flex",
    alignItems: "flex-end", // Aligns QR code to the bottom-right
    justifyContent: "space-between",
    width: "100%",
  },
  promoBtnSmall: {
    padding: "8px 16px",
    backgroundColor: "#ffffff",
    color: "#1d4ed8",
    fontWeight: "700",
    borderRadius: "9999px",
    textTransform: "uppercase",
    fontSize: "7px",
    letterSpacing: "0.5px",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
  },
  // --- Post Card Styles ---
  postCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: "20px",
    padding: "16px",
    width: "100%",
  },
  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  postMeta: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "12px",
    flex: 1,
    minWidth: 0,
    textAlign: "left",
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "12px",
    borderTop: "1px solid #f8fafc",
    marginTop: "12px",
  }
};

export const PromoBanner = () => (
  <div style={styles.promoWrapper}>
    {/* Text Section at the Top */}
    <div style={styles.promoHeader}>
      <h2 style={{ fontSize: "20px", fontWeight: "900", margin: "0 0 8px 0", lineHeight: "1.2" }}>
        More Than a Card— It&apos;s How Connections Begin.
      </h2>
      <p style={{ color: "#dbeafe", opacity: 0.9, fontSize: "12px", margin: 0 }}>
        Stand out with a digital profile that works for you.
      </p>
    </div>

    {/* Controls Section at the Bottom */}
    <div style={styles.promoFooter}>
      <Link className="sm:text-[11px]" href="/dashboard/create" style={styles.promoBtnSmall}>
        Create Free Card
      </Link>
      
      <div style={{ position: "relative", opacity: 0.4 }}>
        <QrCode size={60} color="white" />
      </div>
    </div>
  </div>
);

export const PostCard = () => (
  <div style={styles.postCard}>
    <div style={styles.postHeader}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1 }}>
        <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya" alt="User" fill unoptimized style={{ objectFit: "cover" }} />
        </div>
        <div style={styles.postMeta}>
          <h3 style={{ fontWeight: "700", fontSize: "14px", margin: 0, display: "flex", alignItems: "center", gap: "4px", ...truncateStyle }}>
            Sanya Kapoor
            <Check size={12} style={{ backgroundColor: "#2563eb", color: "white", borderRadius: "50%", padding: "2px", flexShrink: 0 }} />
          </h3>
          <p style={{ color: "#64748b", fontSize: "11px", margin: 0, ...truncateStyle }}>UI/UX Designer • @sanya_ux</p>
        </div>
      </div>
      <MoreHorizontal size={18} color="#94a3b8" />
    </div>

    <div style={{ textAlign: "left" }}>
      <p style={{ fontSize: "13px", margin: "0 0 12px 0", lineHeight: "1.4" }}>
        Creative designer passionate about user-centric experiences. Connect for Nagpur! 🚀
      </p>
      <div style={styles.actionRow}>
        <div style={{ display: "flex", gap: "12px", color: "#64748b" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}><Heart size={16} /> 1.2k</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}><MessageCircle size={16} /> 24</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button style={{ backgroundColor: "#2563eb", color: "white", padding: "6px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700", border: "none" }}>Connect</button>
          <Bookmark size={18} color="#94a3b8" />
        </div>
      </div>
    </div>
  </div>
);

export const TopDesignersWidget = () => {
  const designers = [{ name: "Rahul Sharma", img: "Rahul" }, { name: "Neha T.", img: "Neha" }];
  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #f1f5f9", padding: "16px", textAlign: "left" }}>
      <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "700" }}>Trending</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {designers.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div style={{ position: "relative", width: "32px", height: "32px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${d.img}`} alt={d.name} fill unoptimized />
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: "13px", fontWeight: "700", ...truncateStyle }}>{d.name}</span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Nagpur, IN</span>
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