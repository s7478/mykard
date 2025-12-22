"use client";

import React, { useEffect, useState, useMemo } from "react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<"latest" | "oldest">("latest");

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

  return (
    <div style={{ padding: '6px 16px 120px' }}>
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
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        Stay up to date with your account activity
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          type="button"
          onClick={handleClearAll}
          style={{
            padding: "8px 12px",
            fontSize: 13,
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
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          You have no notifications yet.
        </div>
      ) : (
        <ul style={{ display: "grid", gap: 12 }}>
          {displayed.map((n) => (
            <li
              key={n.id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "#111827" }}>{n.title || "Notification"}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: 14, color: "#374151" }}>{n.message}</div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => handleClearOne(n.id)}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 9999,
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    color: "#6b7280",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
