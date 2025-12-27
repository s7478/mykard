"use client";

import Link from "next/link";
import React from 'react';
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import "../app/globals.css";
import { Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

type Profile = {
  id: string;
  name: string;
  city: string;
  company?: string;
  designation?: string;
};

export default function Homepage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [acceptedConnections, setAcceptedConnections] = useState<Set<string>>(new Set());
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const [showInfoCard, setShowInfoCard] = React.useState(false);
  const infoCardRef = React.useRef<HTMLDivElement | null>(null);

  const pageVariants = {
    hidden: {
      opacity: 0,
      rotateX: 55,
      scale: 0.98,
      y: 40,
      transformOrigin: "top center"
    },
    show: {
      opacity: 1,
      rotateX: 0,
      scale: 1,
      y: 0,
      transition: {
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0.3,
      rotateX: -35,
      y: -20,
      transition: { duration: 0.6 }
    }
  };


  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowInfoCard(true); // Reveal when card comes into view
          }
        });
      },
      { threshold: 0.2 } // triggers when 20% visible
    );

    if (infoCardRef.current) observer.observe(infoCardRef.current);

    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    const loadConnectionStatuses = async () => {
      try {
        const acceptedRes = await fetch(
          "/api/users/connections?type=accepted",
          { credentials: "include" }
        );
        if (acceptedRes.ok) {
          const { requests } = await acceptedRes.json();
          const ids = new Set<string>(
            (requests || []).map((r: any) => r.user?.id).filter(Boolean)
          );
          setAcceptedConnections(ids);
        }

        const sentRes = await fetch("/api/users/connections?type=sent", {
          credentials: "include",
        });
        if (sentRes.ok) {
          const { requests } = await sentRes.json();
          const ids = new Set<string>(
            (requests || []).map((r: any) => r.receiver?.id).filter(Boolean)
          );
          setSentRequests(ids);
        }
      } catch (e) {
        console.error("Failed to load connection statuses", e);
      }
    };

    loadConnectionStatuses();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const delay = setTimeout(() => {
      handleConnectSearch();
    }, 200);

    return () => clearTimeout(delay)
  }, [searchQuery]);

  const handleConnectSearch = async () => {
    const q = searchQuery.trim().toLowerCase();
    console.log("handleConnectSearch called", { query: q });

    if (!q) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setSearchLoading(true);
      setHasSearched(true);

      const response = await fetch("/api/profile/getuser", {
        credentials: "include",
      });

      console.log("handleConnectSearch fetch response", {
        ok: response.ok,
        status: response.status,
      });

      if (!response.ok) {
        console.error("Failed to fetch users");
        setIsLoggedIn(false);
        setSearchResults([]);
        return;
      }

      const data = await response.json();
      console.log("handleConnectSearch data", data);
      const mapped: Profile[] = (data.users || []).map((user: any) => ({
        id: user.id,
        name:
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "Unknown User",
        city: user.location || "Unknown",
        company: user.company || undefined,
        designation: user.title || undefined,
      }));

      if (typeof data.isAuthenticated === "boolean") {
        setIsLoggedIn(data.isAuthenticated);
      } else {
        setIsLoggedIn(true);
      }

      // Parse query into keywords and optional location, like dashboard search
      let keywordsPart = q;
      let locationPart = "";

      const inIdx = q.lastIndexOf(" in ");
      if (inIdx > -1) {
        keywordsPart = q.slice(0, inIdx).trim();
        locationPart = q.slice(inIdx + 4).trim();
      }

      if (!locationPart) {
        const parts = q
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (parts.length >= 2) {
          keywordsPart = parts[0];
          locationPart = parts.slice(1).join(", ");
        }
      }

      const keywords = keywordsPart.split(/\s+/).filter(Boolean);

      const filtered = mapped.filter((p) => {
        const hay = `${p.name} ${p.designation ?? ""} ${p.company ?? ""} ${p.city ?? ""
          }`.toLowerCase();
        const city = (p.city || "").toLowerCase();

        const keywordsMatch =
          keywords.length === 0 || keywords.every((k) => hay.includes(k));
        const locationMatch = !locationPart || city.includes(locationPart);
        return keywordsMatch && locationMatch;
      });

      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
      setIsLoggedIn(false);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleConnect = async (userId: string, name: string) => {
    if (isLoggedIn === false) {
      router.push("/auth/signup");
      return;
    }

    try {
      setConnectingUserId(userId);

      const response = await fetch("/api/users/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsLoggedIn(false);
          router.push("/auth/signup");
        }
        throw new Error(data.error || "Failed to connect");
      }

      setIsLoggedIn(true);
      setSentRequests((prev) => new Set([...prev, userId]));
      toast.success(`Connection request sent to ${name}!`);
    } catch (error: any) {
      console.error("Connection error:", error);
      toast.error(error.message || "Failed to send connection request");
    } finally {
      setConnectingUserId(null);
    }
  };



  return (
    <div
      className="overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--background-light-blue) 0%, var(--background-purple-light) 50%, var(--background) 100%)",
        maxWidth: "100vw",
        width: "100%",
      }}
    >
      {/* Search Bar Section */}
      {/* <section
        id="find-digital-card"
        className="section px-4 sm:px-6 lg:px-12 py-12 lg:py-20"
        style={{ background: "transparent" }}
      >
        <div className="container mx-auto max-w-4xl">
          <div
            className="card card-elevated"
            style={{
              background: "var(--gradient-light)",
              padding: "3rem 2rem",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-xl)",
            }}
          > */}
      {/* <div className="text-center" style={{ marginBottom: "2.5rem" }}>
               <h2
                className="heading-3"
                style={{
                  color: "var(--primary-blue)",
                  fontSize: "2rem",
                  fontWeight: "500",
                  marginBottom: "0.75rem",
                  lineHeight: "1.2",
                }}
              >
                Connect With People
              </h2> */}
      {/* <p className="body-text" style={{ 
                color: 'var(--text-secondary)',
                fontSize: '1.05rem',
                maxWidth: '600px',
                margin: '0 auto 1rem auto'
              }}>
                Discover and connect with professionals worldwide through our comprehensive digital card directory. Search by name, company, industry, location, or expertise to find the right connections for your business growth.
              </p> 
            </div> */}

      {/* <div className="relative" style={{ maxWidth: "700px", margin: "0 auto" }}>
              <div className="relative flex items-center">
                <svg
                  className="absolute w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    left: "1.5rem",
                    color: "#94A3B8",
                    pointerEvents: "none",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, skills, company, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={handleConnectSearch}                         // actual change
                  // onKeyDown={(e) => {
                  //   if (e.key === "Enter") {
                  //     handleConnectSearch();
                  //   }
                  // }}
                  className="w-full rounded-full border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all"
                  style={{
                    background: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    paddingLeft: "3rem",
                    paddingRight: "7.5rem",
                    paddingTop: "1rem",
                    paddingBottom: "1rem",
                    fontSize: "0.9rem",
                    color: "var(--primary-purple)",
                  }}
                />
                <button
                  className="absolute text-white rounded-full transition-all search-button-mobile"
                  onClick={handleConnectSearch}
                  style={{
                    right: "0.4rem",
                    paddingLeft: "2rem",
                    paddingRight: "2rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    fontSize: "15px",
                    fontWeight: "600",
                    background: "var(--gradient-primary)",
                    boxShadow: "var(--shadow-colored)",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  Search
                </button>
              </div>

              <p
                className="body-text"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  maxWidth: "580px",
                  margin: "0 auto",
                }}
              >
                Access verified professional profiles, view portfolios, and
                connect instantly with industry leaders, potential clients, and
                business partners in your network.
              </p>
              {hasSearched && (
                <div className="mt-10" style={{ marginTop: "3.5rem" }}>
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <>
                      {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {searchResults.map((profile) => (
                            <div
                              key={profile.id}
                              className="flex items-center justify-between rounded-sm bg-white p-4 shadow-md"
                            >
                              <div
                                className="flex items-center gap-3"
                                style={{ paddingLeft: "16px" }}
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                                  {profile.name.charAt(0)}
                                </div>
                                <div>
                                  <div
                                    className="font-semibold text-gray-900"
                                    style={{
                                      filter:
                                        isLoggedIn === false
                                          ? "blur(3px)"
                                          : "none",
                                    }}
                                  >
                                    {profile.name}
                                  </div>
                                  {profile.designation && (
                                    <div className="fontSize-[14px] text-gray-600">
                                      {profile.designation}
                                    </div>
                                  )}
                                  <div className="text-sm text-gray-500">
                                    📍 {profile.city}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isLoggedIn === false) {
                                    router.push("/auth/signup");
                                  } else {
                                    handleConnect(profile.id, profile.name);
                                  }
                                }}
                                disabled={
                                  connectingUserId === profile.id ||
                                  sentRequests.has(profile.id) ||
                                  acceptedConnections.has(profile.id)
                                }
                                className={`rounded-sm px-4 py-2 text-sm font-semibold text-white shadow transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                                  acceptedConnections.has(profile.id)
                                    ? "bg-green-600 hover:bg-green-800"
                                    : sentRequests.has(profile.id)
                                    ? "bg-amber-500 hover:bg-amber-600"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                                style={{
                                  minWidth: "90px",
                                  textAlign: "center",
                                  marginRight: "12px",
                                }}
                              >
                                {connectingUserId === profile.id
                                  ? "Connecting..."
                                  : acceptedConnections.has(profile.id)
                                  ? "Connected"
                                  : sentRequests.has(profile.id)
                                  ? "Sent"
                                  : "Connect"}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-gray-500">
                          No matching profiles found.
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div> */}

      {/* <section className="relative" 
            style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)", paddingTop: "5rem", paddingBottom: "7rem"}} >
              
              {/* Floating Search Card 
              <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 2rem", background: "linear-gradient(90deg, #5b8cff, #9bbcff)",
              borderRadius: "22px", boxShadow: "0 25px 50px rgba(0,0,0,0.25)"}}>
                
              {/* Search Input 
              <div className="relative flex items-center max-w-[700px] mx-auto">
                {/* Icon 
                <svg className="absolute w-5 h-5" style={{ left: "1.5rem", color: "#94a3b8" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

      <input
        type="text"
        placeholder="Search by name, skills, company or city..."
        className="w-full rounded-full border-0 focus:outline-none"
        style={{ paddingLeft: "3.2rem", paddingRight: "8rem", paddingTop: "1rem", paddingBottom: "1rem", fontSize: "0.95rem", background: "#ffffff", boxShadow: "0 6px 14px rgba(0,0,0,0.1)", }}
      />

      <button
        className="absolute rounded-full text-white font-semibold"
        style={{ right: "0.4rem", padding: "0.7rem 2rem", background: "linear-gradient(135deg, #2563eb, #3b82f6)", boxShadow: "0 10px 25px rgba(37,99,235,0.5)", border: "none"}}
      > Search</button>
    </div>

    {/* Description Text 
    <p
      style={{ marginTop: "1.8rem", maxWidth: "600px", marginInline: "auto", fontSize: "0.95rem", textAlign: "center", color: "#e2e8f0", lineHeight: "1.6" }}
    >
      Access verified professional profiles, view portfolios, and connect
      instantly with industry leaders, potential clients, and business partners
      in your network. </p>
    </div>
</section>

 */}



      {/* <div className="w-full bg-white">
      {/* SECTION 1: Top Hero & Search
      <section 
        className="relative px-6" 
        style={{ 
          background: "linear-gradient(180deg, #1e40af 0%, #60a5fa 40%, #ffffff 100%)", 
          paddingTop: "5rem", 
          paddingBottom: "4rem" 
        }}
      >
        <div className="container mx-auto flex flex-col items-center">
          {/* Floating Search Card 
          <div 
            style={{ 
              width: "100%",
              maxWidth: "800px", 
              padding: "2rem", 
              background: "linear-gradient(90deg, #6366f1, #a5b4fc)",
              borderRadius: "24px", 
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
            }}
          >
            {/* Search Input Container 
            <div className="relative flex items-center w-full">
              <svg 
                className="absolute w-5 h-5" 
                style={{ left: "1.2rem", color: "#94a3b8" }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, skills, company or city..."
                className="w-full rounded-full border-0 focus:outline-none"
                style={{ 
                  padding: "0.8rem 1.5rem 0.8rem 3.5rem", 
                  fontSize: "0.9rem", 
                  background: "#ffffff" 
                }}
              /> 
              <button
                className="absolute text-blue-600 font-bold text-xs uppercase tracking-wider"
                style={{ right: "1.5rem", border: "none", background: "none", cursor: "pointer" }}
              >
                Search
              </button>
            </div>
          </div> */}

      {/* Info Card (The one with the curved arrow in the image) 
          <div 
            className="mt-6 p-8 text-center relative"
            style={{ 
              maxWidth: "1305px", maxHeight: "333px",
              background: "rgba(219, 234, 254, 0.7)", 
              backgroundColor: "#C1DCFF",
              borderRadius: "10px", 
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.5)"
            }}
          > 
          
              <p style={{fontFamily:"Caveat Brush",color: "#000000", fontWeight: "500", lineHeight: "100%", letterSpacing: "10%"}}>
              Access verified professional profiles, view portfolios <br></br>and connect instantly with industry leaders <br></br>potential clients and business partners in your <br></br>network.
              </p>
          
            
            {/* Decorative Arrow (CSS implementation) 
            <div className="absolute -right-8 top-1/2 hidden md:block" style={{ transform: "rotate(-10deg)" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                    <path d="M3 12c6-10 12 10 18 0m-3-3l3 3-3 3" />
                </svg>
            </div>
          </div>
        </div>
      </section>
      
    </div>
          </div>
        </div>
      </section>
 */}








      {/* New Search Bar Section --> Vaijayanti */}



      <div className="w-full bg-[#030b25]">
        {/* SECTION 1: Search */}
        <section
          className="relative px-4 md:px-6 flex flex-col  w-full items-center justify-center min-h-fit md:min-h-[600px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #030b25 0%, #0a1941 45%, #bce1ff 100%)",
            paddingTop: "4rem",
            paddingBottom: "6rem"
          }}
        >
          <div className="container mx-auto flex flex-col items-center relative w-full">

            {/* 2. Floating Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.95,
                delay: 0.10,
                ease: [0.22, 1, 0.36, 1]
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="transition-all duration-300 ease-in-out cursor-default w-[800px] z-20"
              style={{
                padding: "clamp(1.2rem, 4vw, 2.6rem) clamp(1rem, 4vw, 3.8rem)",
                borderRadius: "26px",
                background: "linear-gradient(105deg, #6c8ef2 0%, #8ca6f8 50%, #ffffff 100%)",
                boxShadow: isHovered ? "0 25px 50px rgba(0,0,0,0.3)" : "0 20px 40px rgba(0,0,0,0.25)",
                marginBottom: "-45px",
                transform: isHovered ? "scale(1.02)" : "scale(1)"
              }}
            >

              {/* Search Input Container */}
              <div className="relative flex items-center w-[650px] mx-auto shadow-lg rounded-full bg-[#fff5f2]">
                <div className="absolute left-4 md:left-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, skills..."
                  className=" w-full rounded-full border-0 focus:outline-none text-sm md:text-lg"
                  style={{
                    padding: "1rem 5rem", background: "transparent", color: "#666", paddingLeft: "clamp(3rem, 10vw, 4rem)"
                  }}
                />
                <button
                  className="absolute right-2 md:right-4 bg-white px-3 md:px-6 py-2 md:py-3 rounded-full text-blue-600 font-bold text-xs md:text-base shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                  style={{ cursor: "pointer", padding: "10px 12px" }}
                >
                  Search
                </button>
              </div>
            </motion.div>




            {/* 4. Info Card - Always visible on mobile, hover effect on desktop */}
            <motion.div
              ref={infoCardRef}

              initial={{ opacity: 0, y: 36, scale: 0.985 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}

              transition={{
                duration: 1.05,
                delay: 0.32,
                ease: [0.22, 1, 0.36, 1]
              }}

              className={` relative text-center w-[1000px] 
              bg-[#c1dcff] shadow-xl mx-auto
              ${showInfoCard ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
            `}
              style={{
                zIndex: 10,
                borderRadius: "42px",
                paddingTop: "100px",
                paddingBottom: "75px",
                paddingLeft: "6px",
                paddingRight: "6px",
              }}
            >

              <p
                className="mx-auto px-4 sm:px-6 md:px-10"
                style={{
                  fontFamily: "Caveat Brush, cursive",
                  color: "#000",
                  fontSize: "clamp(1.10rem, 2.6vw, 1.6rem)",
                  fontWeight: 400,
                  lineHeight: 1.38,
                  maxWidth: "780px",
                  margin: "0 auto",
                  textAlign: "center"
                }} >
                Access verified professional profiles, view portfolios <br></br>and connect instantly with industry leaders <br></br>potential clients and business partners in your<br></br> network.
              </p>

              {/* The Arrow - Hidden on Mobile */}
              <div className="absolute right-[10%] bottom-[68%] hidden lg:block w-[70px] h-[70px] opacity-50">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" style={{ transform: "rotate(-5deg)" }}>
                  <path d="M75 20C78 35 65 45 55 45C45 45 42 35 50 30C60 25 68 38 62 55C55 75 35 85 15 92" stroke="#4b5563" strokeWidth="6" strokeLinecap="round" />
                  <path d="M28 82L15 92L25 98" stroke="#4b5563" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* What is Digital Business Card */}
      <section id="what-is-digital-card"
        style={{ background: "transparent", marginTop: "0px", paddingBottom: "5rem", position: "relative", overflow: "hidden", }}
      >
        {/* Subtle background decoration */}
        <div
          style={{
            position: "absolute", top: "20%", left: "-5%", width: "300px", height: "300px",
            background: "radial-gradient(circle, rgba(108, 93, 184, 0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)",
          }}
        ></div>

        <div
          style={{
            position: "absolute", bottom: "10%", width: "350px", height: "550px",
            background: "radial-gradient(circle, rgba(33, 150, 243, 0.08) 0%, transparent 70%)",
            borderRadius: "50%", filter: "blur(60px)",
          }}
        ></div>

        <div style={{ position: "relative", zIndex: 10 }}>
          <div>
            <div>
              {/* --- GRADIENT SECTION --- */}
              <section >
                <div
                  style={{
                    height: "600px", opacity: "1",
                    background: "radial-gradient(59.51% 59.98% at 50% 81.4%, #8EBFFF 8.45%, #A5E0FF 55.77%, #FFFFFF 100%)",
                    position: "relative",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", overflow: "hidden",
                  }}
                >
                  <h2 className="text-[#06214A] text-4xl md:text-7xl font-extrabold text-center" style={{ marginTop: "250px", letterSpacing: "0%", maxWidth: "90%", zIndex: 2, fontStyle: "Plus Jakarta Sans" }}>
                    MyKard isn’t just a Digital Card
                  </h2>
                  <div
                    style={{
                      position: "absolute", bottom: "-10%", width: "120%", height: "50%", filter: "blur(60px)", zIndex: 3,
                      background: "radial-gradient(50% 50% at 50% 50%, rgba(142, 191, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)",
                    }}
                  />
                </div>
              </section>

              {/* --- 1. THE GRADIENT CONTAINER  --- */}
              <motion.section
                variants={{
                  hidden: {
                    opacity: 0,
                    rotateX: 75,
                    transformOrigin: "top center"
                  },
                  show: {
                    opacity: 1,
                    rotateX: 0,
                    transition: {
                      duration: 1.1,
                      ease: [0.22, 1, 0.36, 1]
                    }
                  },
                  exit: {
                    opacity: 0.4,
                    rotateX: -45,
                    transition: { duration: 0.7 }
                  }
                }}
                initial="hidden"
                whileInView="show"
                exit="exit"
                viewport={{ amount: 0.35 }}
                transition={{ duration: 1, delay: 0.18, ease: [0.4, 0.0, 0.2, 1] }}

                style={{
                  perspective: "1400px",
                  width: "100vw",
                  position: "relative",
                  left: "50%",
                  marginLeft: "-50vw",
                  height: "416px",
                  background: "linear-gradient(180deg, #FFFFFF 0%, #B0D2F0 60%, #83A1FE 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0 30px 30px 30px",
                  zIndex: 10, padding: "20px", maxWidth: "100%",
                }}
              >
                <div
                  className="flex items-center justify-center p-6 md:p-12"
                  style={{
                    width: "95%", maxWidth: "750px", minHeight: "180px",
                    borderRadius: "16px", border: "1.5px solid #3b82f6", backgroundColor: "transparent",
                  }}
                >
                  <p className="text-center"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: "620px", color: "#000", fontWeight: 700, fontSize: "clamp(1rem, 2.8vw, 1.45rem)",
                      lineHeight: "1.35", margin: "0 auto", textShadow: "0px 4px 4px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    Made in India, for the world — MyKard is the <br />
                    modern way to network, connect, and build <br />
                    your personal brand.
                  </p>
                </div>
              </motion.section>

              {/* --- 2. THE DARK BLUE PROFILE CARD --- */}
              {/* <motion.section
        initial={{ opacity: 0, y: 28, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.05, delay: 0.36, ease: [0.4, 0.0, 0.2, 1]}}
        // </div>style={{ width: "100%",display: "flex", justifyContent: "center", marginTop: "-60px", zIndex: 6 }}

        className="flex justify-center"
  style={{ marginTop: "-40px", zIndex: 6 }}
        >
          <div
            // style={{
            //   width: "98%", maxWidth: "1600px",   
            //   background:"radial-gradient(circle at center, #8B54FF 0%, #173CAA 50%, #0C2160 100%)",
            //   padding: "100px 270px", borderRadius: "22px", boxShadow: "0 28px 60px rgba(0,0,0,0.28)"
            // }}
            className=" w-[95%] sm:w-[92%] md:max-w-[880px] text-center rounded-2xl"
    style={{
      background:
        "radial-gradient(circle at center, #8B54FF 0%, #173CAA 50%, #0C2160 100%)",
      padding: "120px 30px",
      boxShadow: "0 28px 60px rgba(0,0,0,0.28)",
    }}
          >
            <p 
              //className="text-3xl md:text-[20px] font-medium leading-[1.6]"
               className=" text-white text-base sm:text-lg md:text-4xl leading-relaxed font-medium "
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color:"white",fontWeight:"200", fontSize:"35px",
                letterSpacing: "0.02em", lineHeight: "1.2", textAlign: "center", textShadow: "0px 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              MyKard is your smart digital profile designed to help you get <br className="hidden md:block" /> 
              discovered and grow your network. <br className="hidden md:block" />
              Whether you're a freelancer or a CEO, replace scattered <br className="hidden md:block" />
              links and physical cards with one powerful QR code that tells <br className="hidden md:block" />
              your story.
            </p>
         </div>
      </motion.section>   */}


              {/* --- 2. THE DARK BLUE PROFILE CARD --- */}
              <motion.section
                initial={{ opacity: 0, y: 28, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.05, delay: 0.36, ease: [0.4, 0.0, 0.2, 1] }}
                className="flex justify-center"
                style={{ marginTop: "-40px", zIndex: 6 }}
              >

                <div
                  className="text-center rounded-2xl"
                  style={{
                    width: "95%", background: "radial-gradient(circle at center, #8B54FF 0%, #173CAA 50%, #0C2160 100%)",
                    padding: "clamp(48px, 6vw, 120px) clamp(36px, 5vw, 80px)", borderRadius: "22px", boxShadow: "0 28px 60px rgba(0,0,0,0.28)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif", color: "white", fontWeight: 300, fontSize: "clamp(1.3rem, 2.6vw, 1.5rem)", lineHeight: 1.35, letterSpacing: "0.02em",
                      textAlign: "center", textShadow: "0px 2px 4px rgba(0,0,0,0.1)", margin: "0 auto", maxWidth: "880px"
                    }}
                  >
                    MyKard is your smart digital profile designed to help you get <br className="hidden md:block" />
                    discovered and grow your network. <br className="hidden md:block" />
                    Whether you're a freelancer or a CEO, replace scattered <br className="hidden md:block" />
                    links and physical cards with one powerful QR code that tells <br className="hidden md:block" />
                    your story.
                  </p>
                </div>
              </motion.section>
            </div>



            {/* Right Side - Stats Cards */}
            {/*<div className="grid grid-cols-1 gap-5 stats-grid">
              {[
                { stat: "100%", label: "Growth Oriented", color: "#667eea" },
                {
                  stat: "42%",
                  label: "Increase in Professional Connections",
                  color: "#667eea",
                },
                { stat: "70%", label: "Better Follow-ups", color: "#667eea" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="stats-card"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)",
                    borderRadius: "1.5rem",
                    padding: "2rem 2.5rem",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  {/* Gradient accent line 
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: `linear-gradient(90deg, ${item.color} 0%, transparent 100%)`,
                    }}
                  ></div>

                  {/* Subtle glow effect 
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "-20%",
                      width: "200px",
                      height: "200px",
                      background: `radial-gradient(circle, ${item.color}20 0%, transparent 70%)`,
                      borderRadius: "50%",
                      filter: "blur(40px)",
                    }}
                  ></div>

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <h3
                      style={{
                        fontSize: "3rem",
                        fontWeight: "800",
                        background: `linear-gradient(135deg, ${item.color} 0%, #a78bfa 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        marginBottom: "0.5rem",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {item.stat}
                    </h3>
                    <p
                      style={{
                        color: "#000000",
                        fontSize: "0.95rem",
                        fontWeight: "500",
                        margin: 0,
                      }}
                    >
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>*/}
          </div>
        </div>
      </section>


      {/* FAQ (Enhanced) - placed at the end, above the footer */}
      {/*<section
        id="faq"
        className="section py-12 lg:py-20 px-4 sm:px-6 lg:px-12"
        style={{ background: "transparent" }}
      >
        <div className="container mx-auto max-w-4xl">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2
              className="heading-2"
              style={{ color: "#0f172a", fontWeight: 500 }}
            >
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="body-text" style={{ color: "#64748B", marginTop: 8 }}>
              Everything you need to know to get started with MyKard.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                q: "How does MyKard works",
                a: (
                  <div>
                    <div>
                      Create Your Profile – Add your professional details.
                    </div>
                    <div>
                      Customize Your Card – Personalize with themes and logos.
                    </div>
                    <div>
                      Share Anywhere – Use your link or QR code instantly.
                    </div>
                    <div>
                      Track Insights – Monitor views, leads, and engagement.
                    </div>
                  </div>
                ),
              },
              {
                q: "How can I search for a professional?",
                a: "In the Dashboard, use the Search feature at the top. You can search by name, category, or email to quickly find any professional profile.",
              },
              {
                q: "How can I see my connections?",
                a: "Go to your Dashboard and click on the Connections tab. You'll see all your active and pending connections in one place.",
              },
              {
                q: "How much does it cost to get started?",
                a: "You can get started for free with a basic MyKard. Just click “Create Your Free Card Now” on the homepage to begin designing your digital card.",
              },
              {
                q: "How does MyKard help grow my professional network?",
                a: "MyKard helps you connect instantly through shareable QR or link — whether at events, meetings, or online. You can discover professionals, entrepreneurs, and creators nearby or in your industry, and stay connected effortlessly.",
              },
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    borderRadius: 16,
                    border: "1px solid #e7f0ff",
                    boxShadow: isOpen
                      ? "0 18px 40px rgba(231,240,255,0.6)"
                      : "0 10px 24px rgba(2,6,23,0.06)",
                    transition: "all 0.25s ease",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "1rem 1.25rem",
                      background: "#e7f0ff",
                      color: "#0f172a",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.filter =
                        "brightness(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.filter =
                        "none";
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.q}
                    </span>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div
                    style={{
                      padding: isOpen ? "14px 18px 18px 18px" : "0 18px",
                      maxHeight: isOpen ? 500 : 0,
                      opacity: isOpen ? 1 : 0,
                      transition: "all 0.3s ease",
                      color: "#334155",
                      background:
                        "linear-gradient(180deg, rgba(231,240,255,0.8) 0%, rgba(231,240,255,0.6) 100%)",
                    }}
                  >
                    {typeof item.a === "string" ? (
                      <p style={{ margin: 0, lineHeight: 1.7, fontSize: 14 }}>
                        {item.a}
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          fontSize: 14,
                          lineHeight: 1.7,
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>*/}

      <section id="faq" className="section py-12 lg:py-20 px-4 sm:px-6 lg:px-12" style={{ background: "white" }}>
        <div className="container mx-auto max-w-4xl">
          {/* Header Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }} style={{ textAlign: "center", marginBottom: "1rem" }}
          >
            <h2 className="heading-2" style={{ color: "#000000", fontWeight: 700, fontSize: "2.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}> Frequently Asked Question </h2>
            <p style={{ color: "#000000", marginTop: 8, fontSize: "1.1rem" }}> Everything you need to know to get started with MyKard </p>
          </motion.div>

          {/* Accordion Container */}
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            {[
              {
                q: "How does MyKard works?",
                a: (
                  <ul style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "clamp(6px, 2vw, 10px)", }}>
                    {[
                      (<div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                        <p>• <strong>Create Your Profile</strong> – Add your professional details.</p>
                        <p>• <strong>Customize Your Card</strong> – Personalize with themes and logos.</p>
                        <p>• <strong>Share Anywhere</strong> – Use your link or QR code instantly.</p>
                        <p>• <strong>Track Insights</strong> – Monitor views, leads, and engagement.</p>
                      </div>)
                    ].map((text, i) => (<li key={i} style={{ fontSize: "clamp(0.9rem, 2.6vw, 1rem)", lineHeight: 1.5, color: "#0f172a" }}> {text} </li>))}</ul>),
              },

              { q: "How can I search for a professional?", a: "In the Dashboard, use the Search feature at the top. You can search by name, category, or email to quickly find any professional profile.", },
              { q: "How can I see my connections?", a: "Go to your Dashboard and click on the Connections tab. You'll see all your active and pending connections in one place.", },
              { q: "How much does it cost to get started?", a: "You can get started for free with a basic MyKard. Just click “Create Your Free Card Now” on the homepage to begin designing your digital card.", },
              { q: "How does MyKard help grow my professional network?", a: "MyKard helps you connect instantly through shareable QR or link — whether at events, meetings, or online.", },
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <motion.div
                  key={idx} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: idx * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }} style={{ position: "relative" }}
                >
                  {/* Question Button */}
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: "100%", textAlign: "left", padding: "18px 35px", background: "#1E2B58", color: "white",
                      border: "none", borderRadius: isOpen ? "20px 20px 0 0" : "20px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                      position: "relative", zIndex: 2, boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      transition: "border-radius 0.3s ease, background 0.3s ease"
                    }}
                  >
                    <span style={{ fontSize: "18px", fontWeight: "400" }}> {item.q} </span>
                    <svg
                      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease", strokeWidth: 2, }}
                    >
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Answer Box */}
                  <div
                    style={{
                      maxHeight: isOpen ? "500px" : "0px", opacity: isOpen ? 1 : 0, overflow: "hidden", transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)", background: "#F8FAFC",
                      border: isOpen ? "1.5px solid #1E2B58" : "1.5px solid transparent", borderRadius: "0 0 20px 20px",
                      marginTop: "-25px", padding: isOpen ? "35px 25px 15px 25px" : "0px 25px", zIndex: 1, color: "#334155",
                    }}
                  >
                    <div style={{ fontSize: "15px", lineHeight: "1" }}> {item.a} </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
