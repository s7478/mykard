"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import "../app/globals.css";
import GrowthMetricsSection from "./GrowthMetricsSection";
import Design from "./Design";


type Profile = {
  id: string;
  name: string;
  city: string;
  company?: string;
  designation?: string;
};

//kanchan added


const CardItem = ({ feature, isMobile }: { feature: any, isMobile: boolean }) => (
  <div
    style={{
      background: feature.cardColor,
      borderRadius: "1.25rem",
      padding: "1.2rem 1rem",
      border: "3px solid #5B8DEF",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    }}
  >
    <div style={{ marginBottom: "0.5rem", width: "100%", height: "70px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src={feature.image} alt={feature.title} style={{ maxWidth: "65px", maxHeight: "100%", objectFit: "contain" }} />
    </div>

    <h3 style={{ color: feature.textColor, fontSize: "1rem", fontWeight: "700", margin: "0.3rem 0 0.5rem 0", textAlign: "center", lineHeight: "1.3", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {feature.title}
    </h3>

    <div
      className={`overflow-hidden transition-all duration-500 w-full ${isMobile ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0 group-hover:max-h-[300px] group-hover:opacity-100"
        }`}
      style={{
        background: feature.boxColor,
        borderRadius: "0.75rem",
      }}
    >
      <div style={{ padding: "0.7rem" }}>
        <p style={{ color: feature.textColor, fontSize: "0.8rem", lineHeight: "1.45", textAlign: "center", fontWeight: "400", margin: 0 }}>
          {feature.description}
        </p>
      </div>
    </div>
  </div>
);

//kanchan added
export default function Homepage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [acceptedConnections, setAcceptedConnections] = useState<Set<string>>(new Set());
  const [isHovered, setIsHovered] = useState(false);
  // ✅ Desktop check for gradients
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check(); // run once on mount
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const router = useRouter();
  const [showInfoCard, setShowInfoCard] = React.useState(false);
  const infoCardRef = React.useRef<HTMLDivElement | null>(null);

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

      const response = await fetch("/api/profile/getuser", { credentials: "include", });

      console.log("handleConnectSearch fetch response", { ok: response.ok, status: response.status, });

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
        image: user.profileImage || undefined,
        skills: user.cards ? user.cards.map((c: any) => c.skills).filter(Boolean).join(" ") : undefined,
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
        const hay = `${p.name} ${p.designation ?? ""} ${p.company ?? ""} ${p.city ?? ""} ${(p as any).skills ?? ""}
          `.toLowerCase();
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

  //kanchan added
  interface Feature {
    title: string;
    desc: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  }

  const features: Feature[] = [
    {
      title: "Smart Card",
      desc: "Showcase your photo, bio, skills, and links in one beautiful & centralized hub.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M6 10h2" />
          <path d="M6 14h2" />
          <path d="M11 10h7" />
          <path d="M11 14h4" />
          <circle cx="18" cy="8" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: "Share Instantly",
      desc: "No app needed. Share via QR, link, or message. Works across any device instantly.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      ),
    },
    {
      title: "Grow Your Network",
      desc: "Connect instantly with professionals nearby or in your industry effortlessly.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
        </svg>
      ),
    },
    {
      title: "Always Up To Date",
      desc: "Update your info anytime — your contacts automatically get the latest version.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
        </svg>
      ),
    },
    {
      title: "One Card, Many Use",
      desc: "Use at events, bios, resumes, and email signatures. Your link replaces everything.",
      icon: (
        <svg width="61" height="61" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      title: "Smart Analysis",
      desc: "Track engagement, see who viewed your card, and monitor your network growth.",
      icon: (
        <svg width="61" height="61" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M12 20v-8m0 0V4m0 8h8m-8 0H4" />
        </svg>
      ),
    },
    {
      title: "Built For Everyone",
      desc: "From students to CEOs — MyKard helps you share who you are beautifully.",
      icon: (
        <svg width="61" height="61" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    }
  ];

  //kanchan added 
  const steps = [
    {
      title: "Create Your Profile",
      description: "Sign up and enter you professional details.",
      image: "/assets/profile-icon.png",
      number: "1",
    },
    {
      title: "Customize Your card",
      description: "Design your card with themes, colors and logos.",
      image: "/assets/customize-icon.png",
      number: "2",
    },
    {
      title: "Start Sharing",
      description: "Use a link or QR code to share your card instantly.",
      image: "/assets/sharing-icon.png",
      number: "3",
    },
    {
      title: "Track views & leads",
      description: "Track who views your card and generates leads.",
      image: "/assets/track-icon.png",
      number: "4",
    },
  ];




  //kanchan
  const credibilityData = [
    {
      title: "Verified Badges",
      description: "Add a verified badge to your profile, giving your contact confidence and showcasing your authenticity.",
      image: "/assets/VerifiedBadges.png",
      cardColor: "#FFFFFF",
      border: "4px solid #00E5FF",
      textColor: "#000000",
      boxColor: "#E2E8F0"
    },
    {
      title: "Smart Analytics",
      description: "Gain insights into who views your profile, what they click, and how to improve your professional presence.",
      image: "/assets/smart-analytics-icon.png.png",
      cardColor: "#FFFFFF",
      border: "4px solid #00E5FF",
      textColor: "#000000",
      boxColor: "#E2E8F0"
    },
    {
      title: "Custom Profile Themes",
      description: "Customize your digital identity with professional templates and colors, ensuring your profile makes a memorable first impression.",
      image: "/assets/Custom Profile Themes.png",
      cardColor: "#FFFFFF",
      border: "4px solid #00E5FF",
      textColor: "#000000",
      boxColor: "#E2E8F0"
    },
    {
      title: "Review Links",
      description: "Link your top reviews directly to your profile, showcasing your reputation and building instant trust with every new connection.",
      image: "/assets/ReviewLinks.png",
      cardColor: "#FFFFFF",
      border: "4px solid #00E5FF",
      textColor: "#000000",
      boxColor: "#E2E8F0"
    }
  ];


  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, var(--background-light-blue) 0%, var(--background-purple-light) 50%, var(--background) 100%)",
        maxWidth: "100vw",
        width: "100%",
      }}
    >
      {/* Header removed: page.tsx renders the global header */}

      {/* -------------------kanchan 1st page---------------------------------------
      ----------------------------------------------kanchan 1st page----------------------------------- */}

      <section
        // Yahan "items-start" add kiya gaya hai
        className="flex flex-col justify-end items-start lg:items-center lg:justify-center"
        style={{
          position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#071337',
          overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '2rem 0 4rem',
        }}
      >
        {/* 2. Main Content Container */}
        <div
          // items-start ensures left alignment on mobile
          className="container mx-auto px-6 lg:px-12 h-full flex flex-col justify-end items-start lg:justify-center mb-8 lg:mb-0"
          style={{ position: 'relative', zIndex: 10, width: '100%', minHeight: 'auto', }}
        >
          {/* Content Wrapper */}
          <div className="relative flex flex-col items-start text-left w-full">

            {/* Heading Group */}
            <div style={{ maxWidth: '800px', zIndex: 20, width: '100%' }}>
              <h1
                style={{
                  fontSize: 'clamp(30px, 7vw, 60px)',
                  fontWeight: 700,
                  lineHeight: '1.1',
                  color: '#FFFFFF',
                  marginBottom: '15px',
                  textAlign: 'left', // Extra safety for left align
                }}
                // Mobile par whitespace-normal kiya gaya hai
                className="whitespace-normal lg:whitespace-normal mb-4 lg:mb-0"
              >
                Connecting People Before the Conversation
              </h1>

              <p
                style={{
                  fontSize: 'clamp(16px, 4vw, 28px)', fontWeight: 500, lineHeight: '1.4',
                  color: '#FFFFFF', maxWidth: '650px', opacity: 0.9, marginBottom: '2rem', textAlign: 'left',
                }}
              >
                A universal digital identity that introduces you perfectly—instantly and professionally.
              </p>

              {/* Buttons Group */}
              <div className="flex flex-wrap gap-4 lg:gap-6 items-start justify-start">
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
                  style={{
                    // Responsive Width & Height using clamp or Tailwind classes
                    width: 'clamp(130px, 30vw, 160px)', // Mobile pe 130px se shuru hoga, desktop pe 160px tak jayega
                    height: 'clamp(44px, 10vw, 50px)',   // Mobile pe 44px, desktop pe 50px
                    background: 'linear-gradient(90deg,  #225af5ff 100%)',
                    borderRadius: '30px',
                    color: '#F0FCFF',
                    fontSize: 'clamp(12px, 4vw, 16px)', // Font size bhi responsive ho gaya
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Get Started
                  <span style={{ fontSize: '15px' }}>→</span>
                </Link>

                <Link
                  href="/login"
                  className="flex items-center justify-center transition-transform hover:scale-105"
                  style={{
                    width: 'clamp(90px, 25vw, 110px)',  // Mobile pe 90px, desktop pe 110px
                    height: 'clamp(44px, 10vw, 50px)',
                    background: 'linear-gradient(90deg,  #225af5ff 100%)',
                    borderRadius: '30px',
                    color: '#F0FCFF',
                    fontSize: 'clamp(12px, 4vw, 18px)',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Log In
                </Link>
              </div>
            </div>
          </div>

          {/* World Map remains as it is */}
          <div
            className="hidden lg:block lg:absolute lg:right-0"
            style={{
              zIndex: 10,
              opacity: 0.7,
              maxWidth: '600px',
              pointerEvents: 'none'
            }}
          >
            <Image
              src="/assets/worldmap.png"
              alt="World Map"
              width={600}
              height={503}
              style={{
                width: '100%', height: 'auto', maxHeight: '503px', objectFit: 'contain',
                filter: 'drop-shadow(0 0 20px rgba(130, 210, 239, 0.2))',
              }}
            />
          </div>
        </div>
      </section>

      {/* kanchan - 1st page 
      kanchan -1st page  */}



      {/* New Search Bar Section --> Vaijayanti */}


      <div className="w-full bg-[#030b25]">
        {/* SECTION 1: Search */}
        <section
          className="relative px-4 md:px-6 flex flex-col w-full items-center justify-center min-h-fit md:min-h-[600px] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #071337 0%, #1070FF 50%, #6ab2ff 100%)",
            paddingTop: "4rem",
            paddingBottom: "4rem"
          }}
        >
          <div className="container mx-auto flex flex-col items-center relative w-full">

            {/* 1. Floating Search Card (The Curtain) */}
            <motion.div
              initial={{ opacity: 1, y: 120, scale: 1 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.5
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="transition-all duration-300 ease-in-out cursor-default w-full max-w-[800px] z-20"
              style={{
                padding: "clamp(1.2rem, 4vw, 2.6rem) clamp(1rem, 4vw, 3.8rem)",
                borderRadius: "26px",
                background: "linear-gradient(105deg, #6c8ef2 0%, #8ca6f8 50%, #ffffff 100%)",
                boxShadow: isHovered ? "0 25px 50px rgba(0,0,0,0.6)" : "0 20px 40px rgba(0,0,0,0.35)",
                marginBottom: "-45px", transform: isHovered ? "scale(1.02)" : "scale(1)"
              }}
            >
              {/* Search Input Container */}
              <div className="relative flex items-center w-full max-w-[650px] mx-auto shadow-lg rounded-full bg-[#fff5f2]">
                <div className="absolute left-4 md:left-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skills..."
                  className="w-full rounded-full border-0 focus:outline-none text-sm md:text-lg bg-transparent"
                  style={{ padding: "1rem 5rem", color: "#666", paddingLeft: "clamp(3rem, 10vw, 4rem)" }}
                />
                <button
                  onClick={handleConnectSearch}
                  className="absolute right-2 md:right-4 bg-white px-3 md:px-6 py-2 md:py-3 rounded-full text-blue-600 font-bold text-xs md:text-base shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                  style={{ cursor: "pointer", padding: "10px 12px" }}
                >
                  Search
                </button>
                {/* Search Results Dropdown */}
                {searchQuery.trim() && hasSearched && (
                  <div className="absolute top-full left-0 mt-4 w-full bg-gray-50 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[500px] overflow-y-auto border border-gray-200">
                    {searchLoading ? (
                      <div className="p-8 flex flex-col items-center justify-center text-gray-500 w-full min-h-[150px]">
                        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-medium">Searching professionals...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col p-6 md:p-10 gap-4">
                        {searchResults.map((user) => (
                          <div key={user.id} className="p-6 md:p-8 hover:bg-gray-50/50 flex flex-row items-center justify-between gap-4 transition-all text-black border border-gray-200 rounded-3xl w-full overflow-hidden shadow-xl bg-white">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Profile Image Section */}
                              <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm">
                                {(user as any).image ? (
                                  <img src={(user as any).image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                )}
                              </div>

                              <div className="flex flex-col text-left flex-1 min-w-0 py-2">
                                <h3 className="font-bold text-gray-900 text-lg md:text-xl leading-tight break-words mb-1">{user.name}</h3>
                                {user.designation && <p className="text-sm md:text-base text-blue-600 font-semibold leading-tight mt-1 mb-2 truncate">{user.designation}</p>}
                                <div className="flex flex-col items-start gap-y-2 text-xs md:text-sm text-gray-500 mt-2 w-full">
                                  {user.company && (
                                    <span className="flex items-start gap-1 flex-1">
                                      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                      <span className="line-clamp-2 break-words text-left">{user.company}</span>
                                    </span>
                                  )}
                                  {user.city && (
                                    <span className="flex items-start gap-1 flex-1">
                                      <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                      <span className="line-clamp-2 break-words text-left">{user.city}</span>
                                    </span>
                                  )}
                                </div>
                                {(user as any).skills && (
                                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-1 italic whitespace-normal max-w-sm">Skills: {(user as any).skills}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex-shrink-0 flex items-center justify-end w-auto">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleConnect(user.id, user.name); }}
                                className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg border border-transparent whitespace-nowrap active:scale-95"
                                style={{ minWidth: "110px", textAlign: "center" }}
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (

                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <p className="text-gray-900 font-medium text-lg">No professionals found</p>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your keywords (role, name, or city).</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </motion.div>

            {/* 2. Info Card (Message Box) */}
            <motion.div
              initial={{ paddingBottom: "20px" }}
              whileInView={{ paddingBottom: "30px" }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100, damping: 20 }}
              viewport={{ once: true }}
              className="relative text-center w-[90%] max-w-[1000px] bg-[#c1dcff] shadow-xl mx-auto overflow-hidden flex items-start justify-center"
              style={{
                zIndex: 10,
                borderRadius: "32px",
                paddingTop: "60px",
                paddingLeft: "20px",
                paddingRight: "20px",
              }}
            >
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2.0 }}
                className="mx-auto px-4 sm:px-6 md:px-12"
                style={{
                  fontFamily: "Caveat Brush, cursive",
                  color: "#000",
                  fontSize: "clamp(1.15rem, 3vw, 1.8rem)",
                  fontWeight: 400,
                  lineHeight: 1.5,
                  maxWidth: "85%",
                  margin: "0 auto",
                  textAlign: "center",
                }}
              >
                Access verified professional profiles, view portfolios <br className="hidden md:block" />
                and connect instantly with industry leaders <br className="hidden md:block" />
                potential clients and business partners in your <br className="hidden md:block" />
                network.
              </motion.p>
            </motion.div>

            <div className="absolute bottom-0 w-[90%] max-w-[1000px] h-full pointer-events-none z-0 ">
              {/* 3. Animated Arrow pointing to message */}
              {/* <div className="absolute right-[12%] top-[31%]  w-[90px] h-[90px] md:w-[120px] md:h-[100px] ">   */}

              <div className="absolute 
            /* 1. SMALL MOBILE (Gradual scaling starts here) */
              right-[0%] top-[26%] w-[50px] h-[50px] 
              
              /* 2. LARGE MOBILE / TABLETS */
              sm:right-[2%] sm:top-[28%] sm:w-[75px] sm:h-[75px]
              
              /* 3. LAPTOPS / SMALL DESKTOPS */
              md:right-[6%] md:top-[30%] md:w-[100px] md:h-[90px]
              
              /* 4. LARGE DESKTOPS (Maintaining your 'Large' look) */
              lg:right-[10%] lg:top-[30%] lg:w-[130px] lg:h-[110px]
              
              /* 5. EXTRA LARGE SCREENS */
              xl:right-[12%] xl:top-[28%] xl:w-[100px] xl:h-[100px]"
              >

                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">

                  <motion.path
                    //d="M75 20C78 35 65 45 55 45C45 45 42 35 50 30C60 25 68 38 62 55C55 75 35 85 15 92"
                    d="M80 15C85 35 70 45 60 45C50 45 47 35 55 30C65 25 73 38 67 55C60 75 40 85 20 92"
                    stroke="#4b5563"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ delay: 1.5, duration: 0.8, ease: "easeInOut" }}
                  />
                  {/* Arrow Head */}
                  <motion.path
                    d="M28 82L15 92L25 98"
                    stroke="#4b5563"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ opacity: 0, x: 10, y: -10 }}
                    whileInView={{ opacity: 0.7, x: 0, y: 0 }}
                    transition={{ delay: 2.2, duration: 0.3 }}
                  />
                </svg>
              </div>

              {/* The Arrow - Hidden on Mobile */}
              {/* <div className="absolute right-[10%] bottom-[68%] hidden lg:block w-[70px] h-[70px] opacity-50">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" style={{ transform: "rotate(-5deg)" }}>
                  <path d="M75 20C78 35 65 45 55 45C45 45 42 35 50 30C60 25 68 38 62 55C55 75 35 85 15 92" stroke="#4b5563" strokeWidth="6" strokeLinecap="round" />
                  <path d="M28 82L15 92L25 98" stroke="#4b5563" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div> */}
            </div>
          </div>
        </section>
      </div>
      <Design />
      <GrowthMetricsSection />

      {/* --------------------------------------kanchan 3 page start --------------------- 
      -----------------kanchan 3 page---------------*/}

      {/* Build Credibility That Converts */}
      <section
        id="build-credibility"
        className="section px-6 lg:px-12"
        style={{
          background: isDesktop
            ? "linear-gradient(180.96deg, #FFFFFF 8.61%, #B1E4FF 38.39%, #B1E4FF 64.58%, #678DFF 90.1%)"
            : "#ffffff",
          paddingTop: isDesktop ? "8rem" : "3rem",
          paddingBottom: isDesktop ? "5rem" : "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >

        {/* --- BACKGROUND ORBS --- */}
        {/* Added 'hidden md:block' to BOTH to ensure mobile is pure white */}
        <div
          className="hidden md:block" // <--- Added this to hide the purple orb on mobile
          style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(80px)", animation: "float 15s ease-in-out infinite reverse" }}
        ></div>

        <div className="container mx-auto text-center" style={{ position: "relative", zIndex: 10 }}>

          {/* HEADING: Mobile pe 3xl (30px), Desktop pe 6xl (60px approx) */}
          <h2
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-black-900"
            style={{ color: "#000000", marginBottom: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Build Credibility That Converts
          </h2>

          {/* PARAGRAPH: Mobile pe sm (14px), Desktop pe 2xl (24px) */}
          <p
            className="text-sm md:text-lg lg:text-2xl font-medium text-gray-600"
            style={{
              color: "#334155",
              maxWidth: "42rem",
              margin: "0 auto 2.5rem auto",
              lineHeight: "1.6",
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            Make every introduction with MyKard, you're not just sharing contact info — you're showcasing your identity, credibility and personal brand.
          </p>

          {/* --- DESKTOP VIEW: Grid --- */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 group/container">
            {credibilityData.map((feature, idx) => (
              <div
                key={idx}
                className="group relative transition-all duration-300 hover:scale-105 group-hover/container:blur-sm hover:blur-none"
                style={{ borderRadius: "1.75rem", padding: "1rem", cursor: "pointer", height: "100%" }}
              >
                <CardItem feature={feature} isMobile={false} />
              </div>
            ))}
          </div>

          {/* --- MOBILE VIEW: Carousel with Swipe --- */}
          <div className="md:hidden flex flex-col items-center" style={{ overflow: "hidden" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -200 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragEnd={(_e: any, info: { offset: { x: number }; velocity: { x: number } }) => {
                  const swipeThreshold = 50;
                  const velocityThreshold = 300;
                  if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
                    if (currentIndex < credibilityData.length - 1) {
                      setCurrentIndex(prev => prev + 1);
                    }
                  } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
                    if (currentIndex > 0) {
                      setCurrentIndex(prev => prev - 1);
                    }
                  }
                }}
                style={{ width: "290px", cursor: "grab", touchAction: "pan-y" }}
              >
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "20px",
                    padding: "30px 24px 24px 24px",
                    border: "3px solid #5B8DEF",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Icon */}
                  <div style={{ marginBottom: "12px", width: "100%", height: "95px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={credibilityData[currentIndex].image} alt={credibilityData[currentIndex].title} style={{ maxWidth: "85px", maxHeight: "85px", objectFit: "contain" }} />
                  </div>

                  {/* Title */}
                  <h3 style={{ color: "#000000", fontSize: "18px", fontWeight: "700", margin: "4px 0 12px 0", textAlign: "center", lineHeight: "1.3", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {credibilityData[currentIndex].title}
                  </h3>

                  {/* Description Box */}
                  <div
                    style={{
                      background: "#E2E8F0",
                      borderRadius: "12px",
                      padding: "14px",
                      width: "100%",
                    }}
                  >
                    <p style={{ color: "#000000", fontSize: "14px", lineHeight: "1.5", textAlign: "center", fontWeight: "400", margin: 0 }}>
                      {credibilityData[currentIndex].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Bar + Counter */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "290px" }}>
              {/* Counter */}
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748B", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {currentIndex + 1} / {credibilityData.length}
              </span>
              {/* Progress Bar */}
              <div style={{ width: "100%", height: "4px", backgroundColor: "#E2E8F0", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${((currentIndex + 1) / credibilityData.length) * 100}%`,
                    height: "100%",
                    backgroundColor: "#5B8DEF",
                    borderRadius: "2px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------kanchan 3 page end --------------------- 
      -----------------kanchan 3 page---------------*/}

      {/*------------------ kanchan 4 start--------------------- */}

      {/* Why Every Professional Needs */}
      <section
        className="py-12 md:py-24 relative"
        style={{
          background: isDesktop
            ? "linear-gradient(356.74deg, #FFFFFF 14.68%, #B1E4FF 44.12%, #B1E4FF 66.95%, #678DFF 89.18%)"
            : "#ffffff",
          minHeight: isDesktop ? "100vh" : "auto",
          display: "flex",
          alignItems: "center",
          paddingTop: isDesktop ? undefined : "60px",
        }}
      >

        <style>{`
    /* Your existing desktop flip-card CSS */
    .flip-card { perspective: 1000px; width: 100%; max-width: 320px; height: 200px; margin: 0 auto; }
    .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; cursor: pointer; }
    .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
    
    /* Front Card Styling (Unchanged) */
    .flip-card-front { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 16px; overflow: hidden; box-sizing: border-box; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); background: linear-gradient(135deg, #ffffff 0%, rgba(125, 162, 255, 0.8) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px); }
    
    /* Back Card Styling - Updated to match "Smart Card" Image */
    .flip-card-back { 
      position: absolute; 
      width: 100%; 
      height: 100%; 
      -webkit-backface-visibility: hidden; 
      backface-visibility: hidden; 
      border-radius: 20px; /* Matching the rounded look */
      overflow: hidden; 
      box-sizing: border-box; 
      transform: rotateY(180deg); 
      display: flex; 
      flex-direction: column; 
      border: 1px solid #000; /* Black border from image */
      background: white;
    }

    .hover-text { position: absolute; bottom: 12px; font-size: 10px; color: #4b5563; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
  `}</style>

        <div className="container mx-auto px-4 sm:px-6 relative z-10" style={{ padding: '0' }}>
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl lg:text-5xl text-black-900 mb-4" style={{ color: "#000000", marginBottom: "0.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Why Every Professional Needs MyKard
            </h2>
          </div>

          {/* --- DESKTOP VIEW: Grid with Flip Cards --- */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="px-2">
                <div className="flip-card">
                  <div className="flip-card-inner">

                    {/* FRONT SIDE (Unchanged) */}
                    <div className="flip-card-front">
                      <div className="mb-4">
                        <div className="w-16 h-16 mx-auto flex items-center justify-center">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 text-center">{feature.title}</h3>
                      <span className="hover-text">Hover to learn more</span>
                    </div>

                    {/* BACK SIDE (Updated to match Smart Card Image) */}
                    <div className="flip-card-back" >

                      {/* 1. Header with Gradient Background */}
                      <div
                        className="px-5 py-4 flex items-center gap-3"
                        style={{
                          background: "linear-gradient(90deg, #60A5FA 0%, #A78BFA 100%)", // Blue-Purple Gradient
                          borderBottom: "1px solid rgba(0,0,0,0.05)"
                        }}
                      >
                        {/* Icon */}
                        <div className="w-8 h-8 flex items-center justify-center" style={{ paddingLeft: '10px' }}>
                          {React.cloneElement(feature.icon, {
                            ...feature.icon.props,
                            width: 28,
                            height: 28,
                            strokeWidth: 2,
                            stroke: "black", // Black icon color
                            className: 'w-8 h-8'
                          })}
                        </div>
                        {/* Title */}
                        <h3 className="text-xl font-extrabold text-black tracking-tight leading-none" style={{ paddingTop: '12px' }}>
                          {feature.title}
                        </h3>
                      </div>

                      {/* 2. Body with White Background */}
                      <div className="flex-1 bg-white p-5 flex items-center" style={{ padding: '12px' }}>
                        <p className="text-sm font-medium text-black leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- MOBILE VIEW: Vertical Accordion (KEPT EXACTLY AS IS) --- */}
          <div className="md:hidden flex flex-col gap-4 px-2" >
            {features.map((feature, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-lg border-2 transition-all duration-300 ${isOpen
                    ? 'border-blue-400 bg-blue-50/50 shadow-lg'
                    : 'border-blue-300 bg-blue-100/30'
                    }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow-sm">
                        {React.cloneElement(feature.icon, {
                          ...feature.icon.props,
                          width: 24,
                          height: 24,
                          className: 'w-6 h-6'
                        })}
                      </div>
                      <span className="text-lg font-bold text-gray-800">{feature.title}</span>
                    </div>
                    <svg
                      className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-5 pb-6 pt-0 ml-14" >
                          <p className="text-gray-700 text-sm leading-relaxed border-t border-blue-200 pt-3" style={{ paddingLeft: '6px' }}>
                            {feature.desc}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/*------------------ kanchan 4 end--------------------- */}

      {/*------------------ kanchan 5 start--------------------- */}

      {/* how it works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 px-4 bg-white overflow-hidden" >
        <div className="container mx-auto max-w-5xl">
          {/* Main Heading */}
          <h2 className="text-2xl md:text-4xl lg:text-5xl text-black-900 text-center tracking-tight" style={{ color: "#000000", marginBottom: "0.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            How it Works?
          </h2>

          {/* Steps Stack */}
          <div className="flex flex-col gap-4 md:gap-6 mb-24"> {/* Increased gap for larger numbers */}
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                className="relative group"
              >
                {/* Added overflow-visible so the number can spill out */}
                <div className="bg-[#2D3A6D] rounded-sm p-5 md:p-10 flex items-center justify-between shadow-lg border-l-4 border-[#558ee4] relative overflow-visible">

                  {/* Text content with Left Margin */}
                  <div className="max-w-md text-left ml-4 md:ml-8" style={{ padding: '10px' }}>
                    <h3 className="text-sm  font-bold  !text-white leading-tight uppercase tracking-wide" style={{ marginBottom: '0px' }}>
                      {step.title}
                    </h3>
                    <p className="!text-white text-[10px] md:text-base opacity-80 leading-tight font-light mt-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px' }}>
                      {step.description}
                    </p>
                  </div>

                  {/* Number: Size increased to spill out top/bottom without changing position */}
                  <div className="w-20 md:w-32 flex justify-center items-center relative">
                    <span
                      className="text-7xl md:text-[6rem] font-black !text-white select-none tracking-tighter absolute"
                      style={{
                        lineHeight: '1',
                        // translate enables spilling out without moving the center point
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <div className="text-center" style={{ marginTop: '25px' }}>
            <h2 className="text-2xl md:text-4xl mb-10 text-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', paddingBottom: '4px' }} >
              Join millions of Professionals now!
            </h2>

            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-14 py-5 text-xl font-bold rounded-full transition-all hover:scale-105 shadow-2xl active:scale-95 group"
              style={{
                background: "linear-gradient(90deg,  #225af5ff 100%)",
                color: "white",
                minWidth: "220px",
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              Create Your Card

              {/* SVG Arrow Replacement */}
              <svg
                width="20"
                height="17"
                viewBox="0 0 20 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-3 transition-transform group-hover:translate-x-2"
              >
                <path
                  d="M4.16663 8.50008H15.8333M15.8333 8.50008L9.99996 3.54175M15.8333 8.50008L9.99996 13.4584"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      {/*------------------ kanchan 5 end--------------------- */}



      {/* Contact Form Section */}

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

      <section id="faq" className="section py-12 lg:py-20 px-4 sm:px-6 lg:px-12" style={{ background: "linear-gradient(180deg, #FFFFFF 22.3%, #133785 63.22%, #162A6C 74.95%, #01071E 91.55%)" }} >
        <div className="container mx-auto max-w-4xl">
          {/* Header Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }} style={{ textAlign: "center", marginBottom: "1rem" }}
          >
            <h2 className="heading-2 text-2xl md:text-4xl lg:text-5xl font-bold text-black-900 text-center" style={{ color: "#000000", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}> Frequently Asked Question </h2>
            <p className="text-sm md:text-lg lg:text-2xl font-medium text-gray-600 mb-4"
              style={{
                color: "#334155",
                maxWidth: "42rem",
                margin: "0 auto 1rem auto",
                lineHeight: "1.6",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}> Everything you need to know to get started with MyKard </p>
          </motion.div>

          {/* Accordion Container */}
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            {[
              {
                q: "How does MyKard works?",
                a: (
                  <ul style={{ margin: 0, display: "flex", flexDirection: "column", gap: "clamp(6px, 2vw, 10px)" }}>
                    {[
                      (<div //style={{ display: "flex", flexDirection: "column", gap: "0px" }}
                      >
                        <p>• <strong>Create Your Profile</strong> – Add your professional details.</p>
                        <p>• <strong>Customize Your Card</strong> – Personalize with themes and logos.</p>
                        <p>• <strong>Share Anywhere</strong> – Use your link or QR code instantly.</p>
                        <p>• <strong>Track Insights</strong> – Monitor views, leads, and engagement.</p>
                      </div>)
                    ].map((text, i) => (<li key={i} style={{ fontSize: "clamp(0.9rem, 2.6vw, 0.05rem)", lineHeight: 0.5, color: "#0f172a" }}> {text} </li>))}</ul>),
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
                      width: "100%", textAlign: "left", padding: "18px 35px", background: "#D0E9FF", color: "black",
                      border: "none", borderRadius: isOpen ? "20px 20px 0 0" : "20px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
                      position: "relative", zIndex: 2, boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      transition: "border-radius 0.3s ease, background 0.3s ease"
                    }}
                  >
                    <span style={{ fontSize: "16px", fontWeight: "400" }}> {item.q} </span>
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
                      marginTop: "-25px", padding: isOpen ? "28px 4px 6px 4px" : "0px 25px", zIndex: 1, color: "#334155",
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