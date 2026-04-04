"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";

export function HomeHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            MyKard
          </Link>
          <div>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
