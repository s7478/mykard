"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, Compass, Users, Bookmark, BarChart2, CheckCircle2 } from "lucide-react";

interface UserData {
  fullName: string;
  title: string;
  profileImage: string | null;
}

export const ProfileWidget = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Keep your fetch logic here
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {}
    };
    fetchUser();
  }, []);

  const displayName = user?.fullName || "Welcome User";
  const displayTitle = user?.title || "Digital Professional";
  const displayImage = user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  return (
    <div className="bg-white h-70 rounded-sm shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center">
      {/* Avatar */}
      <div className="relative w-20 h-20 mb-3">
        <div className=" mt-3 mb-3 not-only:w-full h-full rounded-full border-[3px] border-white shadow-md overflow-hidden relative">
           <Image src={displayImage} alt={displayName} fill className="object-cover" unoptimized />
        </div>
      </div>
      
      {/* Name & Title */}
      <h3 className="text-base font-bold text-gray-900 flex items-center justify-center gap-1">
        {displayName}
        <CheckCircle2 size={14} className="text-blue-500 fill-white" />
      </h3>
      <p className="text-xs text-gray-500 mb-4">{displayTitle}</p>
      
      {/* Button */}
      <Link 
        href="/dashboard" 
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-colors"
      >
        View My Card
      </Link>
    </div>
  );
};

export const MenuWidget = () => {
  const menuItems = [
    { icon: Home, label: "Home", active: true, href: "/dashboard/feed" },
    { icon: Compass, label: "Discover People", active: false, href: "/dashboard/search" },
    { icon: Users, label: "My Connections", active: false, href: "/dashboard/connections" },
    { icon: Bookmark, label: "Saved Profiles", active: false, href: "/dashboard/saved" },
    { icon: BarChart2, label: "Analytics", active: false, href: "/dashboard/analytics" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden py-1">
      {menuItems.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
            item.active 
              ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600" 
              : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent"
          }`}
        >
          <item.icon size={18} />
          {item.label}
        </Link>
      ))}
    </div>
  );
};