"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, User, LogOut, Menu, Bell, HelpCircle, Activity, FileText, Bookmark, ChevronRight } from "lucide-react";

import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, checkAuth, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLgUp, setIsLgUp] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const [activeCardName, setActiveCardName] = useState<string>("");


  const [isActivityOpen, setIsActivityOpen] = useState(false);


  const getInitials = (value?: string | null) => {
    if (!value) return "U";
    const base = value.includes("@") ? value.split("@")[0] : value;
    const letters = base
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    return letters || "U";
  };


  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLgUp(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let intervalId: any;

    const computeCount = (list: any[]) => {
      let cleared: string[] = [];
      try {
        const stored = localStorage.getItem("dashboard-cleared-notifications");
        if (stored) cleared = JSON.parse(stored);
      } catch {
        cleared = [];
      }

      const clearedSet = new Set(cleared || []);
      return list.filter((n: any) => !clearedSet.has(n.id)).length;
    };

    const fetchNotifications = async () => {
      if (document.visibilityState !== "visible") return;

      try {
        const res = await fetch("/api/notifications", { credentials: "include" });
        if (!res.ok) return;

        const data = await res.json();
        const list = Array.isArray(data.notifications) ? data.notifications : [];
        const unreadTotal = computeCount(list);
        setNotificationsCount(unreadTotal);
      } catch (_) { }
    };

    fetchNotifications(); // immediate load
    intervalId = setInterval(fetchNotifications, 60000);

    // listen for update events
    const onUpdated = () => fetchNotifications();
    window.addEventListener("notifications-updated", onUpdated);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("notifications-updated", onUpdated);
    };
  }, []);


  useEffect(() => {
    const fetchActiveCard = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch("/api/card");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cards && data.cards.length > 0) {

            const activeCard = data.cards.find((card: any) => card.cardActive !== false);
            if (activeCard) {
              setActiveCardName(activeCard.cardName || "My Card");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching active card:", error);
      }
    };

    fetchActiveCard();
  }, [isAuthenticated]);


  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest("[data-profile-menu]")) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);


  const getPageTitle = () => {
    const path = pathname.split("/").filter(Boolean);
    if (path.length === 0) return "Home";
    const pageName = path[path.length - 1];
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/auth/login");
      setIsDropdownOpen(false);
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* HEADER WRAPPER */}
      <header
        className="
          bg-white/95 backdrop-blur-sm shadow-sm 
          border-b border-gray-200/50 
          sticky top-0 z-50
        "
      >
        <div className="max-w-7xl mx-auto">
          <div
            className="
              flex justify-between items-center 
              h-13 sm:h-12 lg:h-14 
              px-3 sm:px-4 
              relative
            "
          >
            {/* LEFT AREA */}
            <div className="flex items-center">

              {/* Invisible spacer for mobile left padding */}
              {!isLgUp && <div className="w-4" />}
              {/* w-4 = 16px; increase to w-6 (24px) if you want more */}

              {!isLgUp && (
                <Link href="/dashboard">
                  <Image
                    src="/assets/headerlogo.png"
                    alt="Logo"
                    width={120}
                    height={32}
                    className="h-auto w-auto object-contain"
                  />
                </Link>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "16px",
                paddingRight: "32px",
              }}
            >
              <Link
                href="/dashboard/notifications"
                className="relative flex items-center justify-center"
              >
                <Bell className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" />

                {notificationsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"
                  ></span>
                )}
              </Link>


              <div className="relative" data-profile-menu>
                {isLgUp ? (
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: user?.profileImage
                        ? "transparent"
                        : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      border: "2px solid white",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<span style="font-size: 14px; font-weight: 600; color: #ffffff;">${getInitials(user?.fullName || user?.email || "")}</span>`;
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#ffffff",
                        }}
                      >
                        {getInitials(user?.fullName || user?.email || "")}
                      </span>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "9999px",
                      background: user?.profileImage
                        ? "transparent"
                        : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      border: "1px solid rgba(147, 197, 253, 0.5)",
                      boxShadow:
                        "0 6px 18px rgba(37, 99, 235, 0.35), inset 0 0 12px rgba(147, 197, 253, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      cursor: "pointer",
                    }}
                    aria-label="Open profile menu"
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<span style="font-size: 16px; font-weight: 600; color: #ffffff;">${getInitials(user?.fullName || user?.email || "")}</span>`;
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "9999px",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#ffffff",
                        }}
                      >
                        {getInitials(user?.fullName || user?.email || "")}
                      </span>
                    )}
                  </motion.button>
                )}

                {/* DROPDOWN */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        right: "0",
                        marginTop: "8px",
                        width: "220px",
                        maxWidth: "calc(100vw - 32px)",
                        background: "rgba(255, 255, 255, 0.98)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(229, 231, 235, 0.5)",
                        borderRadius: "12px",
                        boxShadow:
                          "0 10px 30px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(147, 197, 253, 0.25) inset",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        zIndex: 9999,
                        transform: "translateX(-16px)",
                      }}
                    >


                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          margin: "6px 0",
                          fontSize: "14px",
                          color: "#374151",
                          textDecoration: "none",
                          transition: "all 0.2s ease",
                          borderRadius: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#eff6ff";
                          e.currentTarget.style.color = "#1d4ed8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#374151";
                        }}
                      >
                        <User style={{ width: "16px", height: "16px" }} />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          margin: "6px 0",
                          fontSize: "14px",
                          color: "#374151",
                          textDecoration: "none",
                          transition: "all 0.2s ease",
                          borderRadius: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#eff6ff";
                          e.currentTarget.style.color = "#1d4ed8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#374151";
                        }}
                      >
                        <User style={{ width: "16px", height: "16px" }} />
                        <span>Account</span>
                      </Link>

                      <div>
                        <button
                          onClick={() => setIsActivityOpen(!isActivityOpen)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: "12px", padding: "12px 16px", margin: "4px 0", fontSize: "14px", color: "#374151",
                            backgroundColor: "transparent", border: "none", cursor: "pointer", transition: "all 0.2s ease", borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff"; e.currentTarget.style.color = "#1d4ed8"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#374151"; }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Activity style={{ width: "16px", height: "16px" }} />
                            <span>My Activity</span>
                          </div>
                          <ChevronRight
                            style={{ width: "14px", height: "14px", transition: "transform 0.2s", transform: isActivityOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                          />
                        </button>

                        <AnimatePresence>
                          {isActivityOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: "hidden", marginLeft: "12px", borderLeft: "2px solid #f3f4f6" }}
                            >
                              <Link
                                href="/dashboard/feed/me"
                                onClick={() => setIsDropdownOpen(false)}
                                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", fontSize: "13px", color: "#6b7280", textDecoration: "none", transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#1d4ed8"; e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.backgroundColor = "transparent"; }}
                              >
                                <FileText style={{ width: "14px", height: "14px" }} />
                                <span>My Posts</span>
                              </Link>
                              <Link
                                href="/dashboard/feed/like"
                                onClick={() => setIsDropdownOpen(false)}
                                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", fontSize: "13px", color: "#6b7280", textDecoration: "none", transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#1d4ed8"; e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.backgroundColor = "transparent"; }}
                              >
                                <FileText style={{ width: "14px", height: "14px" }} />
                                <span>Liked</span>
                              </Link>

                              <Link
                                href="/dashboard/feed/saved"
                                onClick={() => setIsDropdownOpen(false)}
                                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", fontSize: "13px", color: "#6b7280", textDecoration: "none", transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#1d4ed8"; e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.backgroundColor = "transparent"; }}
                              >
                                <Bookmark style={{ width: "14px", height: "14px" }} />
                                <span>Saved</span>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Link
                        href="/dashboard/support"
                        onClick={() => setIsDropdownOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          margin: "6px 0",
                          fontSize: "14px",
                          color: "#374151",
                          textDecoration: "none",
                          transition: "all 0.2s ease",
                          borderRadius: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#eff6ff";
                          e.currentTarget.style.color = "#1d4ed8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#374151";
                        }}
                      >
                        <HelpCircle style={{ width: "16px", height: "16px" }} />
                        <span>Help & Support</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          margin: "6px 0",
                          fontSize: "14px",
                          color: "#dc2626",
                          backgroundColor: "transparent",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          borderRadius: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#fef2f2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <LogOut style={{ width: "16px", height: "16px" }} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
