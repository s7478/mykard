"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import "../app/globals.css";

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
  const [acceptedConnections, setAcceptedConnections] = useState<Set<string>>(
    new Set()
  );
  const router = useRouter();

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
        const hay = `${p.name} ${p.designation ?? ""} ${p.company ?? ""} ${
          p.city ?? ""
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
      {/* Header removed: page.tsx renders the global header */}

      {/* Hero Section */}
      <section
        className="section flex items-center px-4 sm:px-6 lg:px-12 hero-section"
        style={{
          background: "transparent",
          minHeight: "100vh", // Use full viewport height
          paddingTop: "1rem", // Minimal top padding to use available space
          paddingBottom: "1rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Large Organic Blob Background - Left */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "60%",
            height: "120%",
            background:
              "linear-gradient(135deg, rgba(108, 93, 184, 0.12) 0%, rgba(103, 58, 183, 0.08) 100%)",
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            filter: "blur(80px)",
            animation: "float 15s ease-in-out infinite",
            transform: "rotate(-10deg)",
          }}
        ></div>

        {/* Large Organic Blob Background - Right */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-10%",
            width: "50%",
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(103, 58, 183, 0.08) 100%)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            filter: "blur(80px)",
            animation: "float 20s ease-in-out infinite reverse",
            transform: "rotate(15deg)",
          }}
        ></div>

        {/* Subtle gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "20%",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(108, 93, 184, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulse 8s ease-in-out infinite",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "25%",
            width: "250px",
            height: "250px",
            background:
              "radial-gradient(circle, rgba(33, 150, 243, 0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulse 10s ease-in-out infinite reverse",
          }}
        ></div>

        <div
          className="container mx-auto w-full"
          style={{ position: "relative", zIndex: 10 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center hero-grid-mobile">
            {/* Left Side - Content */}
            <div
              className="hero-content"
              style={{
                animation: "fadeInUp 1s ease-out",
                position: "relative",
              }}
            >
              <h1
                className="heading-1"
                style={{
                  color: "var(--foreground)",
                  fontWeight: "600",
                  lineHeight: "1.3",
                  paddingBottom: "1rem",
                  overflow: "visible",
                }}
              >
                More Than a Card —{" "}
                <span className="gradient-text">
                  It&apos;s How Connections Begin.
                </span>
              </h1>

              <p
                className="body-large"
                style={{
                  color: "var(--text-primary)",
                  maxWidth: "540px",
                  marginBottom: "1rem",
                }}
              >
                Turn every introduction into an opportunity with your personal
                MyKard — meet people, connect instantly, and stay remembered.
              </p>
              {/* <p className="body-text" style={{ 
                color: 'var(--text-secondary)',
                maxWidth: '520px',
                marginBottom: '2rem'
              }}>
                Join thousands of professionals who've revolutionized their networking approach. No more lost cards, outdated information, or missed opportunities – just seamless, modern connections that drive real business results.
              </p> */}

              <div className="flex flex-wrap gap-4 hero-button-container">
                <Link
                  href="/auth/signup"
                  className="text-white rounded-full transition-all"
                  style={{
                    paddingLeft: "2.5rem",
                    paddingRight: "2.5rem",
                    paddingTop: "1rem",
                    paddingBottom: "1rem",
                    fontSize: "16px",
                    fontWeight: "600",
                    background:
                      "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                    cursor: "pointer",
                    display: "inline-block",
                    textDecoration: "none",
                  }}
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Right Side - Front Image */}
            <div
              className="relative flex justify-center items-center order-1 lg:order-2 min-h-[200px] lg:min-h-[500px]"
              style={{ overflow: "visible" }}
            >
              <div
                className="relative"
                style={{ maxWidth: "500px", width: "100%" }}
              >
                {/* Front Image */}
                <div
                  className="lg:pt-4 pt-0 lg:px-4 px-2"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "70vh", // Reduced height to ensure full visibility
                    position: "relative",
                    animation: "fadeInUp 1.2s ease-out 0.3s both",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "500px",
                      maxHeight: "150vh", // Further increased height for much larger image
                      width: "100%",
                      height: "auto",
                      borderRadius: "20px",
                      filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15))",
                      background: "transparent",
                    }}
                  >
                    <img
                      src="/assets/final.png"
                      alt="MyKard Digital Business Card"
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "contain",
                        background: "transparent",
                        mixBlendMode: "multiply", // This will help remove white background
                        borderRadius: "20px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section
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
          >
            <div className="text-center" style={{ marginBottom: "2.5rem" }}>
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
              </h2>
              {/* <p className="body-text" style={{ 
                color: 'var(--text-secondary)',
                fontSize: '1.05rem',
                maxWidth: '600px',
                margin: '0 auto 1rem auto'
              }}>
                Discover and connect with professionals worldwide through our comprehensive digital card directory. Search by name, company, industry, location, or expertise to find the right connections for your business growth.
              </p> */}
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
            </div>
            <div
              className="relative"
              style={{ maxWidth: "700px", margin: "0 auto" }}
            >
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
            </div>
          </div>
        </div>
      </section>

      {/* What is Digital Business Card */}
      <section
        id="what-is-digital-card"
        className="section px-6 lg:px-12"
        style={{
          background: "transparent",
          paddingTop: "5rem",
          paddingBottom: "5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background decoration */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "-5%",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(108, 93, 184, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "-5%",
            width: "350px",
            height: "350px",
            background:
              "radial-gradient(circle, rgba(33, 150, 243, 0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        ></div>

        <div
          className="container mx-auto"
          style={{ position: "relative", zIndex: 10 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div style={{ textAlign: "center" }}>
              <h2
                className="heading-2"
                style={{
                  color: "#110032ff",
                  marginBottom: "1.5rem",
                  fontWeight: "500",
                }}
              >
                MyKard isn't just a
                <span
                  style={{
                    background: "var(--gradient-primary)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {" "}
                  digital card{" "}
                </span>
              </h2>
              <p
                className="body-large"
                style={{
                  color: "#64748B",
                  marginBottom: "1.5rem",
                }}
              >
                MyKard is your all-in-one digital identity and networking card —
                a smart, shareable profile that brings together everything about
                you in one link. Whether you're a student, freelancer,
                professional, or business owner, MyKard helps you connect, get
                discovered, and grow your network effortlessly. No more lost
                visiting cards or scattered links — just one personal link or QR
                that lets anyone know who you are, what you do, and how to reach
                you.
              </p>
              <p
                className="body-text"
                style={{
                  color: "#647488 ",
                  marginBottom: "1rem",
                }}
              >
                Made in India, for the world — MyKard is the modern way to
                network, connect, and build your personal brand.
              </p>
              {/* <p className="body-text" style={{ 
                color: '#647488 ',
                marginBottom: '2rem'
              }}>
                Perfect for professionals, entrepreneurs, and businesses looking to make lasting impressions while staying ahead in the digital age.
              </p> */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Link
                  href="/auth/signup"
                  className="text-white rounded-full transition-all"
                  style={{
                    paddingLeft: "2.5rem",
                    paddingRight: "2.5rem",
                    paddingTop: "1rem",
                    paddingBottom: "1rem",
                    fontWeight: "600",
                    background:
                      "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    textDecoration: "none",
                    border: "none",
                  }}
                >
                  <span>Get Started Free</span>
                </Link>
              </div>
            </div>

            {/* Right Side - Stats Cards */}
            <div className="grid grid-cols-1 gap-5 stats-grid">
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
                  {/* Gradient accent line */}
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

                  {/* Subtle glow effect */}
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
            </div>
          </div>
        </div>
      </section>

      {/* Build Credibility That Converts */}
      <section
        id="build-credibility"
        className="section px-6 lg:px-12"
        style={{
          background: "transparent",
          paddingTop: "5rem",
          paddingBottom: "5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background elements */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-5%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "float 12s ease-in-out infinite",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            width: "450px",
            height: "450px",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            animation: "float 15s ease-in-out infinite reverse",
          }}
        ></div>

        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            opacity: 0.5,
          }}
        ></div>

        <div
          className="container mx-auto text-center"
          style={{ position: "relative", zIndex: 10 }}
        >
          <h2
            className="heading-2"
            style={{
              color: "#0c0000ff",
              marginBottom: "1rem",
              fontWeight: "500",
            }}
          >
            Build Credibility That{" "}
            <span
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Converts
            </span>
          </h2>
          <p
            className="body-large"
            style={{
              color: "#1c2e44ff",
              maxWidth: "48rem",
              margin: "0 auto 1.5rem auto",
            }}
          >
            Make every introduction memorable with MyKard, you’re not just
            sharing contact info — you’re showcasing your identity, credibility,
            and personal brand.
          </p>
          {/* <p className="body-text" style={{ 
            color: '#64748B',
            maxWidth: '46rem',
            margin: '0 auto 3rem auto'
          }}>
            From verified professional badges and client testimonials to portfolio showcases and achievement highlights, our platform provides everything you need to demonstrate your expertise and build lasting trust with prospects and clients.
          </p> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 credibility-grid">
            {[
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
                title: "Verified badges",
                color: "#a78bfa",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                ),
                title:
                  "Add your reviews link (Google / LinkedIn / Certificates)",
                color: "#a78bfa",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                ),
                title: "Custom profile themes",
                color: "#a78bfa",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                ),
                title: "Smart analytics",
                color: "#a78bfa",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="credibility-card"
                style={{
                  background: "white",
                  borderRadius: "1.5rem",
                  padding: "2rem 1.5rem",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}40`;
                  e.currentTarget.style.borderColor = `${feature.color}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.2)";
                }}
              >
                {/* Top accent line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: `linear-gradient(90deg, ${feature.color} 0%, transparent 100%)`,
                  }}
                ></div>

                {/* Icon container */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    margin: "0 auto 1.5rem auto",
                    borderRadius: "1rem",
                    background:
                      "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid rgba(59, 130, 246, 0.3)",
                    position: "relative",
                  }}
                >
                  {/* Glow effect */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "-10px",
                      background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)`,
                      borderRadius: "1rem",
                      filter: "blur(15px)",
                      zIndex: -1,
                    }}
                  ></div>

                  <svg
                    style={{
                      width: "32px",
                      height: "32px",
                      color: "white",
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {feature.icon}
                  </svg>
                </div>

                {/* Title */}
                <h3
                  style={{
                    color: "#334155",
                    fontSize: "1rem",
                    fontWeight: "600",
                    lineHeight: "1.5",
                    minHeight: "3rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  {feature.title}
                </h3>

                {/* Checkmark */}
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <svg
                    style={{
                      width: "20px",
                      height: "20px",
                      color: feature.color,
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    Included
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Every Professional Needs */}
      <section
        id="features"
        className="section py-12 lg:py-20 px-4 sm:px-6 lg:px-12"
        style={{
          background: "transparent",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glowing orb background elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: "150px",
            height: "150px",
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(50px)",
            animation: "float 12s ease-in-out infinite",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "10%",
            width: "200px",
            height: "200px",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "float 15s ease-in-out infinite reverse",
          }}
        ></div>

        <div
          className="container mx-auto"
          style={{ position: "relative", zIndex: 2 }}
        >
          <h2
            className="heading-2 text-center mb-16"
            style={{
              color: "#000000",
              textShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
              fontWeight: "500",
            }}
          >
            Why Every Professional Needs{" "}
            <span className="gradient-text">MyKard</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 professional-cards-grid">
            {[
              {
                title: "Smart Digital Card",
                desc: "Create a beautiful, shareable profile that works like a mini LinkedIn — your photo, bio, skills, and social links, all in one place.",
              },
              {
                title: "Share Instantly — Anywhere",
                desc: "No app needed. Share your MyKard via QR, link, or message. Works across any device — no downloads, no hassle.",
              },
              {
                title: "Grow Your Network Effortlessly",
                desc: "Discover professionals, entrepreneurs, and creators nearby or in your industry. Connect instantly and keep your network updated.",
              },
              {
                title: "Always Up to Date",
                desc: "No more reprinting cards. Update your info anytime — and your contacts always have the latest version automatically.",
              },
              {
                title: "One Card, Many Uses",
                desc: "Use it at events, meetings, online bios, resumes, and even WhatsApp or email signatures. Your single link replaces everything.",
              },
              {
                title: "Smart Insights",
                desc: "Know who viewed or saved your card, track engagement, and see how your network grows over time.",
              },
              {
                title: "Built for Everyone",
                desc: "From students and freelancers to founders and CEOs — MyKard helps you share who you are and what you do, beautifully.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card p-6 flex flex-col items-center text-center transition-all duration-300 ease-in-out professional-card"
                style={{
                  background: "white", // Darker card background
                  borderRadius: "1.5rem",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                  transform: "translateY(0)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(99, 102, 241, 0.3)";
                  e.currentTarget.style.border =
                    "1px solid rgba(99, 102, 241, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0, 0, 0, 0.4)";
                  e.currentTarget.style.border =
                    "1px solid rgba(99, 102, 241, 0.2)";
                }}
              >
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: "#334155" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-gray-400 text-sm leading-relaxed"
                  style={{ color: "grey" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="how-it-works"
        className="section py-12 lg:py-20 px-4 sm:px-6 lg:px-12"
        style={{ background: "var(--background-purple-light)" }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2
            className="heading-2 text-center mb-16"
            style={{ color: "#1A1A2E", fontWeight: "500" }}
          >
            How It <span className="gradient-text">Works</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 how-it-works-grid">
            {[
              {
                icon: (
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.0 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
                title: "Create Your Profile",
                description: "Sign up and enter your professional details.",
              },
              {
                icon: (
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                ),
                title: "Customize Your Digital Card",
                description: "Design your card with themes, colors, and logos.",
              },
              {
                icon: (
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                ),
                title: "Share It Anywhere",
                description:
                  "Use a link or QR code to share your card instantly.",
              },
              {
                icon: (
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
                title: "Track Views & Leads",
                description: "Monitor who views your card and generates leads.",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="card p-6 text-center flex flex-col items-center how-it-works-card"
                style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
              >
                <div
                  className="mb-4 w-20 h-20 flex items-center justify-center rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
                    color: "#fff",
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#334155" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="section py-12 lg:py-20 px-4 sm:px-6 lg:px-12"
        style={{ background: "transparent" }}
      >
        <div className="container mx-auto text-center flex flex-col items-center">
          <h2
            className="heading-2 mb-6"
            style={{ color: "var(--foreground)", fontWeight: "500" }}
          >
            Ready to Go Digital?
          </h2>
          <p
            className="body-large mb-8 max-w-2xl mx-auto"
            style={{ color: "var(--text-primary)" }}
          >
            Join millions of professionals who have already made the switch to
            MyKard.
          </p>
          <Link
            href="/auth/signup"
            className="btn btn-large px-12 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all"
            style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)",
              color: "white",
              boxShadow: "0 15px 35px rgba(59, 130, 246, 0.4)",
            }}
          >
            Create Your Free Card Now
          </Link>
        </div>
      </section>

      {/* Contact Form Section */}

      {/* FAQ (Enhanced) - placed at the end, above the footer */}
      <section
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
      </section>
    </div>
  );
}
