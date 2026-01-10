"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/header";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/use-auth";

export default function CardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkAuth, isLoading } = useAuth();
  const [isLgUp, setIsLgUp] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check if this is a public card page
  const isPublicCardPage = pathname?.startsWith('/cards/public');

  useEffect(() => {
    // Skip auth check for public pages
    if (!isPublicCardPage) {
      // ✅ Check auth when cards layout mounts
      checkAuth();
    }

    // ✅ Detect screen size for sidebar handling (only for non-public pages)
    if (!isPublicCardPage) {
      const mql = window.matchMedia("(min-width: 1024px)");
      const onChange = () => setIsLgUp(mql.matches);
      onChange();

      // Add/remove listener (for compatibility)
      // @ts-ignore
      (mql.addEventListener ? mql.addEventListener("change", onChange) : mql.addListener(onChange));
      return () => {
        // @ts-ignore
        (mql.removeEventListener ? mql.removeEventListener("change", onChange) : mql.removeListener(onChange));
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPublicCardPage]);

  // For public card pages, render only children without sidebar/header
  if (isPublicCardPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: "#f8fafc" }}>
      {/* Sidebar (controlled so mobile stays closed) */}
      <Sidebar isOpen={isLgUp ? isSidebarOpen : false} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div
        className="h-full flex flex-col"
        style={{
          marginLeft: isLgUp ? (isSidebarOpen ? "18rem" : "5rem") : "0", // matches sidebar width
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        {/* Header (same behavior for all screens) */}
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <Header />
        </div>

        {/* Main Page Area */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            background: "transparent",
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