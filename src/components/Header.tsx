'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import '../styles/gradients.css';
import { useAuth } from '@/lib/hooks/use-auth';
import { ChevronDown, User, LogOut, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../app/globals.css';

// Smooth scroll function without changing URL
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

export default function Header() {
  const { user, isAuthenticated, checkAuth, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLgUp, setIsLgUp] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Detect large screen
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLgUp(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Auto-close mobile menu on scroll
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleScroll = () => { if (window.innerWidth < 1024) { setIsMenuOpen(false); } };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
      setIsDropdownOpen(false);
    } catch (error) { console.error('Logout failed', error); }
  };

  return (
    <>
      <style jsx global>{`
        .profile-dropdown-desktop {
          z-index: 999999 !important;
          position: absolute !important;
        }
        .profile-dropdown-mobile {
          z-index: 999999 !important;
          position: fixed !important;
        }
      `}</style>
      <header
        className="bg-white/95 backdrop-blur-xl border-b border-blue-100/50 shadow-sm mobile-fixed-header"
        style={{
          position: 'fixed', top: '0px', left: '0px', right: '0px', width: '100%', maxWidth: '100vw', minHeight: '90px',
          height: 'auto', zIndex: 99999, transform: 'translate3d(0px, 0px, 0px)',
          WebkitTransform: 'translate3d(0px, 0px, 0px)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'visible'
        }}
      >
        <nav className="max-w-7xl mx-auto px-6 pt-3 pb-1" style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.25rem' }}>
          <div className="flex items-center justify-between h-12">
            {/* Logo - Left Side */}
            <Link href="/" className="flex items-center group">
              <Link href="/" className="flex items-center group">
                <Image
                  src="/assets/headerlogo.png"
                  alt="Logo"
                  width={144}
                  height={144}
                  className="w-40 h-10 object-cover transition-all duration-300 group-hover:scale-105"
                />
              </Link>

              <svg className="w-6 h-6 text-blue-600 absolute" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ display: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </Link>

            {/* Desktop Menu and Actions - Right Side */}
            <div className="hidden lg:flex items-center gap-80">
              {/* Navigation Links */}
              <div className="flex items-center gap-20">
                <Link href="/" className="px-2 py-1.5 text-[14px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Home
                </Link>
                <button
                  onClick={() => scrollToSection('find-digital-card')}
                  className="px-2 py-1.5 text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50/50 bg-transparent border-none cursor-pointer"
                >
                  Search
                </button>
                <button
                  onClick={() => scrollToSection('what-is-digital-card')}
                  className="px-2 py-1.5 text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50/50 bg-transparent border-none cursor-pointer"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('build-credibility')}
                  className="px-2 py-1.5 text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50/50 bg-transparent border-none cursor-pointer"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="px-2 py-1.5 text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50/50 bg-transparent border-none cursor-pointer"
                >
                  How It Works
                </button>

              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <div className="relative">
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
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <User style={{ width: "16px", height: "16px", color: "white" }} />
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
                          background:
                            "radial-gradient(120% 120% at 30% 20%, #60a5fa 0%, #2563eb 40%, #1e40af 100%)",
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
                        <User style={{ width: "18px", height: "18px", color: "#ffffff" }} />
                      </motion.button>
                    )}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        isLgUp ? (
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
                              background: "rgba(255, 255, 255, 0.95)",
                              backdropFilter: "blur(8px)",
                              border: "1px solid rgba(229, 231, 235, 0.5)",
                              borderRadius: "12px",
                              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(147, 197, 253, 0.25) inset",
                              paddingTop: "10px",
                              paddingBottom: "10px",
                              zIndex: "999999 !important",
                              transform: "translateX(-16px)",
                            }}
                            className="profile-dropdown-desktop"
                          >
                            <Link
                              href="/dashboard"
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
                              <span>Dashboard</span>
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
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: "fixed",
                              inset: 0,
                              zIndex: 999999,
                              background: "rgba(2, 6, 23, 0.45)",
                              backdropFilter: "blur(4px)",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "flex-start",
                              padding: "12px",
                            }}
                            onClick={() => setIsDropdownOpen(false)}
                            className="profile-dropdown-mobile"
                          >
                            <motion.div
                              initial={{ x: 24, y: -8, opacity: 0, scale: 0.98 }}
                              animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                              exit={{ x: 24, y: -8, opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              style={{
                                width: "min(88vw, 300px)",
                                background: "rgba(255, 255, 255, 0.96)",
                                border: "1px solid rgba(229, 231, 235, 0.6)",
                                borderRadius: "16px",
                                boxShadow:
                                  "0 20px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(147,197,253,0.35) inset",
                                overflow: "hidden",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "12px",
                                  background:
                                    "linear-gradient(135deg, rgba(219,234,254,0.9), rgba(191,219,254,0.9))",
                                  borderBottom: "1px solid rgba(229, 231, 235, 0.6)",
                                }}
                              >
                                <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "9999px",
                                    background:
                                      "radial-gradient(120% 120% at 30% 20%, #60a5fa 0%, #2563eb 40%, #1e40af 100%)",
                                    border: "2px solid white",
                                    boxShadow:
                                      "0 6px 18px rgba(37, 99, 235, 0.35), inset 0 0 12px rgba(147, 197, 253, 0.35)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <User style={{ width: "18px", height: "18px", color: "#ffffff" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                                    {user?.fullName || "User"}
                                  </span>
                                  <span style={{ fontSize: 12, color: "#475569" }}>
                                    {user?.email || "No email"}
                                  </span>
                                </div>
                              </div>
                              <div style={{ padding: "6px" }}>
                                <Link
                                  href="/dashboard"
                                  onClick={() => setIsDropdownOpen(false)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    color: "#0f172a",
                                    textDecoration: "none",
                                  }}
                                >
                                  <User style={{ width: "18px", height: "18px" }} />
                                  <span>Dashboard</span>
                                </Link>
                                <button
                                  onClick={handleLogout}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    color: "#dc2626",
                                    background: "transparent",
                                    border: "none",
                                    textAlign: "left",
                                    cursor: "pointer",
                                  }}
                                >
                                  <LogOut style={{ width: "18px", height: "18px" }} />
                                  <span>Logout</span>
                                </button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    {/* <a href="/auth/login" className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50/50" style={{ textDecoration: 'none' }}>
                      Login
                    </a> */}
                    <a href="/auth/signup" className="relative px-8 py-2 text-[14px] font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 overflow-hidden group border-none cursor-pointer"
                      style={{marginRight: '20px', padding:"8px",minWidth: '100px', minHeight: '36px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Create Card
                      </span>
                      <div className="absolute inset-0 bg-linear-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-blue-50/50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <div className="lg:hidden pt-12 border-t border-blue-100/50 animate-in fade-in slide-in-from-top-2 duration-300" style={{ paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setActiveSection('home');
                      window.location.href = '/';
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-[18px] font-semibold rounded-xl w-full text-left border-none cursor-pointer transition-colors ${activeSection === 'home'
                      ? 'text-blue-600 bg-blue-50/50'
                      : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeSection === 'home' ? 'bg-blue-600' : 'bg-transparent'
                      }`}></span>
                    Home
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('find-digital-card');
                      scrollToSection('find-digital-card');
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-[18px] font-medium rounded-xl w-full text-left border-none cursor-pointer transition-colors ${activeSection === 'find-digital-card'
                      ? 'text-blue-600 bg-blue-50/50 font-semibold'
                      : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeSection === 'find-digital-card' ? 'bg-blue-600' : 'bg-transparent'
                      }`}></span>
                    Search
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('what-is-digital-card');
                      scrollToSection('what-is-digital-card');
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-xl w-full text-left border-none cursor-pointer transition-colors ${activeSection === 'what-is-digital-card'
                      ? 'text-blue-600 bg-blue-50/50 font-semibold'
                      : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeSection === 'what-is-digital-card' ? 'bg-blue-600' : 'bg-transparent'
                      }`}></span>
                    About
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('build-credibility');
                      scrollToSection('build-credibility');
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-xl w-full text-left border-none cursor-pointer transition-colors ${activeSection === 'build-credibility'
                      ? 'text-blue-600 bg-blue-50/50 font-semibold'
                      : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeSection === 'build-credibility' ? 'bg-blue-600' : 'bg-transparent'
                      }`}></span>
                    Features
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('how-it-works');
                      scrollToSection('how-it-works');
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-xl w-full text-left border-none cursor-pointer transition-colors ${activeSection === 'how-it-works'
                      ? 'text-blue-600 bg-blue-50/50 font-semibold'
                      : 'text-gray-700 hover:bg-blue-50/50 hover:text-blue-600'
                      }`}
                    style={{ marginBottom: '24px' }}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeSection === 'how-it-works' ? 'bg-blue-600' : 'bg-transparent'
                      }`}></span>
                    How It Works
                  </button>

                </div>
                <div className="pt-10 pb-8 px-2 mt-6 border-t border-blue-100/50">

                  {!isAuthenticated ? (
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => {
                          console.log('Mobile Login clicked');
                          window.location.href = '/auth/login';
                        }}
                        className="flex-1 flex items-center justify-center text-center px-4 text-[15px] font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/30 overflow-hidden group border-none cursor-pointer"
                        style={{ height: '40px', minWidth: '100px' }}
                      >
                        <span className="relative z-10">Login</span>
                        <div className="absolute inset-0 bg-linear-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </button>
                      <button
                        onClick={() => {
                          console.log('Mobile Create Card clicked');
                          window.location.href = '/auth/signup';
                        }}
                        className="flex-1 relative flex items-center justify-center text-center px-4 text-[15px] font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 overflow-hidden group border-none cursor-pointer"
                        style={{ height: '40px', minWidth: '100px' }}
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          Create Card
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 w-full pb-2">
                      <Link
                        href="/dashboard"
                        className="flex-1 relative flex items-center justify-center px-4 text-[16px] font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/30 overflow-hidden group"
                        onClick={() => setIsMenuOpen(false)}
                        style={{ minWidth: '100px', height: '45px' }}
                      >
                        <span className="relative z-10">Dashboard</span>
                        <div className="absolute inset-0 bg-linear-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 relative block text-center px-4 py-5 text-[16px] font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/30 overflow-hidden group"
                        style={{ minWidth: '100px', height: '45px' }}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <LogOut size={16} className="text-white" />
                          <span>Logout</span>
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Outside Click Handler for Desktop Dropdown */}
      {isDropdownOpen && isLgUp && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
          style={{ zIndex: 999998 }}
        />
      )}
    </>
  );
}