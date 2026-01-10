"use client";

import React, { useState, useEffect } from "react";
import FeedStream from "@/components/feed/FeedStream";
import { ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
    display: "flex",
    justifyContent: "center",
    padding: "22px 16px",
  },

  container: {
    width: "100%",
    maxWidth: "720px", // 👈 matches feed width
    display: "flex",
    flexDirection: "column" as const,
    margin: "0 auto",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "#FFFFFF",
    padding: "8px",
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },

  backBtn: {
    padding: "8px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  titleWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },
};

export default function SavedPostsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.user));
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <Link href="/dashboard/feed" style={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>

          <div style={styles.titleWrap}>
            <Bookmark size={20} className="text-blue-600 fill-blue-600" />
            <h1 style={styles.title}>Saved Posts</h1>
          </div>
        </div>

        {/* Feed */}
        <FeedStream filter="saved" currentUser={currentUser} />
      </div>
    </div>
  );
}
