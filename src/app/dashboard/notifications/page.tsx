"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Color and style definitions matching messages page
  const colors = {
    bg: "#F8FAFC",
    cardBg: "#FFFFFF",
    textMain: "#1E293B",
    textSec: "#64748B",
    textLight: "#94A3B8",
    primary: "#4F46E5",
    primaryLight: "#EEF2FF",
    primaryGradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    border: "#E2E8F0",
    danger: "#EF4444",
    hoverBg: "#E7F8FF",
  };

  // Force scroll to top on mount to fix refresh scroll offset and ensure header stays fixed
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const displayed = useMemo(() => {
    const clearedSet = new Set(clearedIds || []);
    const arr = items.filter((n) => !clearedSet.has(n.id));

    arr.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "latest" ? db - da : da - db;
    });
    return arr;
  }, [items, sort, clearedIds]);

  useEffect(() => {
    let initialCleared: string[] = [];
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("dashboard-cleared-notifications");
        if (stored) initialCleared = JSON.parse(stored);
      }
    } catch {
      initialCleared = [];
    }
    setClearedIds(initialCleared);

    const load = async () => {
      try {
        const res = await fetch("/api/notifications", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.notifications) ? data.notifications : [];
          setItems(list);
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const persistCleared = (next: string[]) => {
    setClearedIds(next);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("dashboard-cleared-notifications", JSON.stringify(next));
        window.dispatchEvent(new Event("notifications-updated"));
      }
    } catch {
      // ignore
    }
  };

  const handleClearOne = (id: string) => {
    if (clearedIds.includes(id)) return;
    const next = [...clearedIds, id];
    persistCleared(next);
  };

  const handleClearAll = () => {
    const allIds = items.map((n) => n.id);
    const setExisting = new Set(clearedIds || []);
    allIds.forEach((id) => setExisting.add(id));
    const next = Array.from(setExisting);
    persistCleared(next);
  };

  const handleNotificationClick = (id: string) => {
    if (id.startsWith('msg:') || id.startsWith('msg-')) {
      if (id.startsWith('msg:')) {
        const parts = id.split(':');
        if (parts.length >= 3) {
          router.push(`/dashboard/messages?chat=${parts[1]}`);
          return;
        }
      }
      router.push('/dashboard/messages');
    } else if (id.startsWith('conn:') || id.startsWith('conn-')) {
      router.push('/dashboard/connections?view=requests');
    }
  };

  return (
    <div style={{ padding: '6px 16px 40px' }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#111827',
        marginBottom: 8,
        lineHeight: '1.05',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial'
      }}>
        Notifications
      </h1>
      <p style={{
        fontSize: '12px',
        color: "#6b7280",
        marginBottom: 6,
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        Stay up to date with your account activity
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: 2 }}>
        <button
          type="button"
          onClick={handleClearAll}
          style={{
            padding: "6px 10px",
            fontSize: 12,
            borderRadius: 9999,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            color: "#6b7280",
            cursor: "pointer",
          }}
        >
          Clear all
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "latest" | "oldest")}
          style={{
            padding: "8px 12px",
            fontSize: 14,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#fff",
            color: "#374151",
          }}
        >
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            background: colors.cardBg,
            border: `2px solid #4A90E2`,
            borderRadius: 10,
            padding: 24,
            textAlign: "center",
            color: colors.textLight,
            boxShadow: "0px 3px 5px #4A90E0",
          }}
        >
          You have no notifications yet.
        </div>
      ) : (
        <ul style={{ display: "grid", gap: 8 }}>
          {displayed.map((n) => (
            <li
              key={n.id}
              onClick={() => handleNotificationClick(n.id)}
              onMouseEnter={() => setHoveredId(n.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: hoveredId === n.id ? colors.hoverBg : colors.cardBg,
                border: `2px solid #4A90E2`,
                borderRadius: 10,
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                cursor: "pointer",
                boxShadow: "0px 1px 3px rgba(74, 144, 224, 0.4)",
                transition: "background-color 0.2s ease",
                marginBottom: "4px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{n.title || "Notification"}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearOne(n.id);
                  }}
                  style={{
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "none",
                    background: "#f3f4f6",
                    color: "#6b7280",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#e5e7eb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
                  }}
                >
                  Clear
                </button>
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>{n.message}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
