"use client";
import React from "react";
import Image from "next/image";
import { Eye, Link as LinkIcon, TrendingUp } from "lucide-react";

export const StatsWidget = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-bold text-gray-900 mb-4 text-sm">Your Stats</h3>
      <div className="space-y-3">
        {/* Row 1 */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 flex items-center gap-2">
             <Eye size={16} className="text-gray-400"/> Profile Views
          </span>
          <span className="font-bold text-blue-600">1,200</span>
        </div>
        {/* Row 2 */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 flex items-center gap-2">
             <LinkIcon size={16} className="text-gray-400"/> Connections
          </span>
          <span className="font-bold text-blue-600">150</span>
        </div>
        {/* Row 3 */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 flex items-center gap-2">
             <TrendingUp size={16} className="text-gray-400"/> Growth
          </span>
          <span className="font-bold text-green-500">86%</span>
        </div>
      </div>
    </div>
  );
};

export const PeopleSuggestions = () => {
  const people = [
    { name: "Ankit Verma", role: "Software Eng", img: "Ankit" },
    { name: "Priya Sinha", role: "Product Mgr", img: "Priya2" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-bold text-gray-900 mb-4 text-sm">People You May Know</h3>
      <div className="space-y-4">
        {people.map((p, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 relative overflow-hidden">
                <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.img}`} alt={p.name} fill className="object-cover" unoptimized />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                {/* <span className="text-[10px] text-gray-400">{p.role}</span> */}
              </div>
            </div>
            <button className="px-3 py-1 border border-blue-500 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-50 transition-colors">
              Connect
            </button>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 text-xs font-medium text-gray-500 hover:text-blue-600">
        View All Suggestions
      </button>
    </div>
  );
};