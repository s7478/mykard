"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Bookmark, UserPlus, QrCode, Heart, MessageCircle } from "lucide-react";

export const PromoBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg shadow-blue-200">
      <div className="relative z-10 max-w-lg">
        <h2 className="text-2xl font-bold leading-tight mb-3">
          More Than a Card—<br/>It's How Connections Begin.
        </h2>
        <p className="text-blue-100 mb-6 text-sm font-medium opacity-90">
          Turn every introduction into an opportunity. Stand out with a digital profile that works for you.
        </p>
        
        <Link 
          href="/dashboard/create"
          className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow-sm text-sm"
        >
          Create Your Free Card
        </Link>
      </div>
      
      {/* Abstract Shapes */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-10 -bottom-20px w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
};

export const PostCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="relative w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
             <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya" alt="User" fill className="object-cover" unoptimized />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
              Sanya Kapoor 
              <span className="bg-blue-100 text-blue-600 p-0.5 rounded-full text-[10px]"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg></span>
            </h3>
            <p className="text-slate-500 text-xs font-medium">UI/UX Designer • Startup Inc.</p>
            <p className="text-slate-400 text-[10px] mt-0.5">2 hours ago</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4 pl-60px"> {/* Indent content to align with text */}
        <p className="text-slate-700 leading-relaxed mb-3 text-sm">
          Creative designer passionate about user-centric experiences. Connect for collaborations in Nagpur! 🚀
        </p>
        <div className="flex gap-2 flex-wrap">
          {['#Design', '#Figma', '#UX'].map(tag => (
            <span key={tag} className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm group">
          <QrCode size={16} className="text-slate-500 group-hover:text-slate-700" />
          View Card
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-all text-sm">
          <UserPlus size={16} />
          Connect
        </button>
        <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
          <Bookmark size={20} />
        </button>
      </div>
    </div>
  );
};

export const TopDesignersWidget = () => {
  const designers = [
    { name: "Rahul S.", img: "Rahul" },
    { name: "Neha T.", img: "Neha" },
    { name: "Priya T.", img: "Priya" },
    { name: "Design", img: "Design" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-slate-900">Top Designers in Nagpur</h3>
        <Link href="/search" className="text-xs text-blue-600 font-semibold hover:underline">View All</Link>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {designers.map((d, i) => (
          <div key={i} className="flex flex-col items-center group cursor-pointer">
            <div className="w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-2 relative group-hover:border-blue-200 transition-colors">
               <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${d.img}`} alt={d.name} fill className="object-cover" unoptimized />
            </div>
            <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600 text-center truncate w-full">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};