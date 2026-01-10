"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkAuth, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLgUp, setIsLgUp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check auth when dashboard layout mounts
    checkAuth();
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLgUp(mql.matches);
    onChange();
    // @ts-ignore
    (mql.addEventListener ? mql.addEventListener("change", onChange) : mql.addListener(onChange));
    return () => {
      // @ts-ignore
      (mql.removeEventListener ? mql.removeEventListener("change", onChange) : mql.removeListener(onChange));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const handleMobileChange = () => setIsMobile(mqMobile.matches);
    handleMobileChange();
    // @ts-ignore
    (mqMobile.addEventListener ? mqMobile.addEventListener("change", handleMobileChange) : mqMobile.addListener(handleMobileChange));
    return () => {
      // @ts-ignore
      (mqMobile.removeEventListener ? mqMobile.removeEventListener("change", handleMobileChange) : mqMobile.removeListener(handleMobileChange));
    };
  }, []);

  const isCreateOrEditPage = pathname === "/dashboard/create" || pathname === "/dashboard/edit";
  const isContactsPage = pathname === "/dashboard/contacts";
  const isSearchPage = pathname === "/dashboard/search";
  const isNotificationsPage = pathname === "/dashboard/notifications";
  const isMessagesPage = pathname === "/dashboard/messages";
  const isConnectionsPage = pathname === "/dashboard/connections";

  const shouldSkipPadding = isMobile && (isCreateOrEditPage || isContactsPage || isSearchPage || isNotificationsPage || isMessagesPage || isConnectionsPage);
  const mainStyle: React.CSSProperties = shouldSkipPadding
    ? { background: "transparent" }
    : {
      padding: "5px",
      background: "transparent",
    };

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      {/* Sidebar - default closed on small screens, open on lg+ */}
      <Sidebar
        isOpen={isLgUp ? isSidebarOpen : false}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div
        className="h-full flex flex-col"
        style={{
          marginLeft: isLgUp
            ? (isSidebarOpen ? '18rem' : '5rem')
            : '0',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          {/* Removed duplicate mobile hamburger - using Sidebar's blue hamburger instead */}
          <Header />
        </div>

        {/* Main Page Area */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            ...mainStyle,
            background: pathname === "/dashboard/search"
              ? "linear-gradient(180deg,#f6fafb,#eef5f7)"
              : mainStyle.background
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}