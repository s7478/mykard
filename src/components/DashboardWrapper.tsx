"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar"; // Adjust path to your Sidebar


export default function DashboardWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Function to toggle sidebar (passed to Sidebar component)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. Pass the state and toggle function to the Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* 2. Dynamic Main Content Area */}
      {/* If open, add margin. If closed, remove margin (or reduce it) */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-20" // Adjust 'ml-20' to 'ml-0' if you hide sidebar completely
        }`}
      >
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}