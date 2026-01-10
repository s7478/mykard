"use client";
import React, { useState, useEffect } from "react";
import FeedStream from "@/components/feed/FeedStream";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
    display: "flex",
    justifyContent: "center",
    padding: "22px 16px",
  },

  container: {
    width: "100%",
    maxWidth: "720px", // 👈 matches feed width from image
    display: "flex",
    flexDirection: "column",
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
  },

  title: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },
};

export default function MyLikedPostsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/user/me")
      .then(res => res.json())
      .then(data => setCurrentUser(data.user));
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link href="/dashboard/feed" style={styles.backBtn}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={styles.title}>Liked Post</h1>
        </div>

        <FeedStream filter="like" currentUser={currentUser} />
      </div>
    </div>
  );
}
