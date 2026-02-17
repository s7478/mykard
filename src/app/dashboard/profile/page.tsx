"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Mail, Phone, Linkedin, Globe, MapPin, Users, Edit, Eye, TrendingUp, Search, ChevronRight, Building, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UserPost {
  id: string;
  content: string | null;
  imageUrl: string | null;
  videoUrl?: string | null;
  createdAt: string;
  visibility: string;
  _count: {
    likes: number;
    comments: number;
  };
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  username?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  prefix?: string;
  suffix?: string;
  preferredName?: string;
  title?: string;
  company?: string;
  location?: string;
  cardName?: string;
  cardType?: string;
  selectedDesign?: string;
  selectedColor?: string;
  selectedFont?: string;
  profileImage?: string;
  bannerImage?: string;
  bio?: string;
  documentUrl?: string; // Kept for legacy support
  views?: number;
  shares?: number;
  connectionCount?: number;
  posts?: UserPost[];
}

interface Card {
  id: string;
  cardName: string;
  documentUrl?: string;
}

export default function ProfilePage() {
  const { user: zustandUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePostTab, setActivePostTab] = useState<'posts' | 'comments'>('posts');
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    title: "",
    company: "",
    location: "",
    bio: "",
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    phone: "",
    linkedin: "",
    website: ""
  });
  const [showContactPopup, setShowContactPopup] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      // Wait for auth to load first
      if (authLoading) return;

      // If we have a user from auth store, use it first
      if (zustandUser) {
        setUserProfile(zustandUser as UserProfile);
      }

      // Then try to fetch fresh data from API
      await fetchUserProfile();
      await fetchUserCards();
    };

    loadProfile();
  }, [authLoading, zustandUser]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user profile:', data);
        setUserProfile(data.user);
        setError(null);
      } else if (response.status === 401) {
        // Token is invalid or expired - use zustand user if available
        console.log('Token invalid, using cached user data');
        if (!zustandUser) {
          setError('Please log in again');
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch profile:', errorData);
        // Don't show error if we have zustand user
        if (!zustandUser) {
          setError(errorData.error || 'Failed to load profile');
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Only show error if we don't have any user data
      if (!zustandUser && !userProfile) {
        setError('Error loading profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserCards = async () => {
    try {
      const response = await fetch('/api/card', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.cards) {
          setCards(data.cards);
        }
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const handleEditIntro = () => {
    setEditForm({
      fullName: displayUser.name,
      title: displayUser.jobTitle,
      company: displayUser.company,
      location: displayUser.location,
      bio: displayUser.description
    });
    setIsEditingIntro(true);
  };

  const handleCancelIntro = () => {
    setIsEditingIntro(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveIntro = async () => {
    try {
      const response = await fetch('/api/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(prev => prev ? { ...prev, ...data.user } : data.user);
        setIsEditingIntro(false);
        // Reload to ensure fresh state
        fetchUserProfile();
      } else {
        console.error("Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleEditContact = () => {
    setContactForm({
      phone: displayUser.phone || "",
      linkedin: displayUser.linkedin || "",
      website: displayUser.website || ""
    });
    setIsEditingContact(true);
  };

  const handleCancelContact = () => {
    setIsEditingContact(false);
  };

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveContact = async () => {
    try {
      const response = await fetch('/api/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: contactForm.phone,
          username: contactForm.linkedin, // Mapping linkedin to username
          website: contactForm.website
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(prev => prev ? { ...prev, ...data.user } : data.user);
        setIsEditingContact(false);
        fetchUserProfile();
      } else {
        console.error("Failed to save contact info");
      }
    } catch (error) {
      console.error("Error saving contact info:", error);
    }
  };

  const user = userProfile || zustandUser;

  const displayUser = user
    ? {
      name: (user as any).fullName ||
        (user as any).cardName ||
        `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() ||
        (user as any).name ||
        "Josh Hazelwood",
      email: (user as any).email || "josh@boostnow.com",
      jobTitle: (user as any)?.title || (user as any)?.jobTitle || "Software Designer",
      company: (user as any)?.company || "BoostNow LLP",
      location: (user as any)?.location || "California, USA",
      phone: (user as any)?.phone || "+1-555-0123",
      linkedin: (user as any)?.linkedin || (user as any)?.username || "josh-hazelwood",
      website: (user as any)?.website || "https://boostnow.com",
      profileImage: (user as any)?.profileImage || null,
      bannerImage: (user as any)?.bannerImage || null,
      selectedColor: (user as any)?.selectedColor || "#3b82f6",
      selectedFont: (user as any)?.selectedFont || "Arial, sans-serif",
      description: (user as any)?.bio ||
        (user as any)?.description ||
        (user as any)?.headline ||
        "A modern digital visiting card for software designer showcasing professional details, social links, and portfolio",
    }
    : {
      name: "Josh Hazelwood",
      email: "josh@boostnow.com",
      jobTitle: "Software Designer",
      company: "BoostNow LLP",
      location: "California, USA",
      phone: "+1-555-0123",
      linkedin: "josh-hazelwood",
      website: "https://boostnow.com",
      profileImage: null,
      bannerImage: null,
      selectedColor: "#3b82f6",
      selectedFont: "Arial, sans-serif",
      description:
        "A modern digital visiting card for software designer showcasing professional details, social links, and portfolio",
    };

  // Show loading only if we have no user data at all
  if ((isLoading || authLoading) && !user) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "16px", color: "#666" }}>Loading your profile...</p>
      </div>
    );
  }

  // Show error only if we have no user data and there's an error
  if (error && !user) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#dc2626", marginBottom: "16px" }}>Error: {error}</p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            style={{
              backgroundColor: "#0a66c2",
              color: "#fff",
              border: "none",
              borderRadius: "24px",
              padding: "8px 24px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Filter cards to find those with documents
  const cardsWithDocuments = cards.filter(card => card.documentUrl);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", paddingTop: "0px" }}>
      {/* Main Container */}
      {/* Main Container */}
      <div style={{ maxWidth: "1128px", margin: "0 auto", padding: "0px 0px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Main Content */}
          {/* Profile Card */}
          <div style={{ backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
            {/* Banner */}
            <div style={{ position: "relative", height: "200px", backgroundColor: "#a0aec0" }}>
              {displayUser.bannerImage ? (
                <img
                  src={displayUser.bannerImage}
                  alt="Banner"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}></div>
              )}
              {isEditingIntro ? (
                <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleSaveIntro}
                    style={{
                      backgroundColor: "#0a66c2",
                      color: "#fff",
                      border: "none",
                      borderRadius: "16px",
                      padding: "6px 16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelIntro}
                    style={{
                      backgroundColor: "#fff",
                      color: "#666",
                      border: "1px solid #666",
                      borderRadius: "16px",
                      padding: "6px 16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditIntro}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <Edit size={18} color="#666" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div style={{ padding: "0 24px 24px 24px", position: "relative" }}>
              {/* Profile Picture */}
              <div style={{ position: "relative", marginTop: "-70px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "152px",
                    height: "152px",
                    borderRadius: "50%",
                    border: "4px solid #fff",
                    overflow: "hidden",
                    backgroundColor: "#f0f0f0",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }}
                >
                  {displayUser.profileImage ? (
                    <img
                      src={displayUser.profileImage}
                      alt={displayUser.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "48px",
                      fontWeight: "600",
                      color: "#fff"
                    }}>
                      {displayUser.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Title */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  {isEditingIntro ? (
                    <input
                      type="text"
                      name="fullName"
                      value={editForm.fullName || ""}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#000",
                        width: "100%",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "4px 8px"
                      }}
                    />
                  ) : (
                    <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#000", margin: 0 }}>
                      {displayUser.name}
                    </h1>
                  )}
                </div>

                {isEditingIntro ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title || ""}
                      onChange={handleInputChange}
                      placeholder="Headline"
                      style={{
                        fontSize: "16px",
                        color: "#000",
                        width: "100%",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px"
                      }}
                    />
                    <input
                      type="text"
                      name="company"
                      value={editForm.company || ""}
                      onChange={handleInputChange}
                      placeholder="Current Company"
                      style={{
                        fontSize: "14px",
                        color: "#000",
                        width: "100%",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px"
                      }}
                    />
                  </div>
                ) : (
                  <p style={{ fontSize: "16px", color: "#000", marginBottom: "4px", fontWeight: "400", lineHeight: "1.4" }}>
                    {displayUser.jobTitle}{displayUser.company ? ` | ${displayUser.company}` : ''}
                  </p>
                )}


                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#666", marginTop: "8px", marginBottom: "8px" }}>
                  {isEditingIntro ? (
                    <input
                      type="text"
                      name="location"
                      value={editForm.location || ""}
                      onChange={handleInputChange}
                      placeholder="Location"
                      style={{
                        fontSize: "14px",
                        color: "#000",
                        width: "50%",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px"
                      }}
                    />
                  ) : (
                    displayUser.location && (
                      <>
                        <span>{displayUser.location}</span>
                        <span>•</span>
                      </>
                    )
                  )}
                  <button
                    onClick={() => setShowContactPopup(true)}
                    style={{ color: "#0a66c2", textDecoration: "none", fontWeight: "500", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "14px" }}
                  >
                    Contact info
                  </button>
                </div>

                <div style={{ fontSize: "14px", color: "#0a66c2", fontWeight: "600", marginBottom: "16px" }}>
                  {userProfile?.connectionCount || 0} connections
                </div>
              </div>
            </div>
          </div>

          {/* Document */}
          <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
            <div style={{ marginBottom: "8px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#000", margin: 0 }}>Documents</h3>
            </div>

            {cardsWithDocuments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {cardsWithDocuments.map(card => (
                  <div key={card.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
                      From card: {card.cardName}
                    </div>
                    <a
                      href={card.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "14px",
                        color: "#0a66c2",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <span>📄</span>
                      <span style={{ textDecoration: "underline" }}>View Document</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              userProfile?.documentUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
                    Primary Document
                  </div>
                  <a
                    href={userProfile.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "14px",
                      color: "#0a66c2",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <span>📄</span>
                    <span style={{ textDecoration: "underline" }}>View Document</span>
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>No documents uploaded</p>
              )
            )}
          </div>

          {/* About Section */}
          <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#000", margin: 0 }}>About</h2>
              {/* <Edit size={20} color="#666" style={{ cursor: "pointer" }} /> */}
            </div>
            {isEditingIntro ? (
              <textarea
                name="bio"
                value={editForm.bio || ""}
                onChange={handleInputChange}
                rows={5}
                style={{
                  fontSize: "14px",
                  color: "#000",
                  lineHeight: "1.6",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px",
                  fontFamily: "inherit"
                }}
              />
            ) : (
              <p style={{ fontSize: "14px", color: "#000", lineHeight: "1.6", margin: 0, whiteSpace: "pre-wrap" }}>
                {displayUser.description}
              </p>
            )}
          </div>

          {/* Posts Section */}
          <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)" }}>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", borderBottom: "1px solid #e0e0e0" }}>
              <button
                onClick={() => setActivePostTab('posts')}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: activePostTab === 'posts' ? "#fff" : "#666",
                  backgroundColor: activePostTab === 'posts' ? "#01754f" : "transparent",
                  border: activePostTab === 'posts' ? "none" : "1px solid #666",
                  borderRadius: "16px",
                  cursor: "pointer",
                  marginBottom: "12px",
                  transition: "all 0.2s"
                }}
              >
                Posts
              </button>
              <button
                onClick={() => setActivePostTab('comments')}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: activePostTab === 'comments' ? "#000" : "#666",
                  backgroundColor: activePostTab === 'comments' ? "transparent" : "transparent",
                  border: activePostTab === 'comments' ? "1px solid #000" : "1px solid #666",
                  borderRadius: "16px",
                  cursor: "pointer",
                  marginBottom: "12px",
                  transition: "all 0.2s"
                }}
              >
                Textual Posts
              </button>
            </div>

            {(() => {
              // Filter posts based on tab
              const allPosts = userProfile?.posts || [];
              const mediaPosts = allPosts.filter(p => p.imageUrl || p.videoUrl); // "Posts" tab shows media posts (images or videos)
              const textPosts = allPosts.filter(p => !p.imageUrl && !p.videoUrl); // "Comments" tab shows text-only posts

              const displayedPosts = activePostTab === 'posts' ? mediaPosts : textPosts;

              if (displayedPosts.length > 0) {
                return (
                  <div>
                    {/* Horizontal Scroll Container */}
                    <div style={{
                      gap: "16px",
                      // For true horizontal scroll on mobile if desired, or 2 col on desktop:
                      // But user requested horizontal scroll showing 2 posts.
                      // Let's use flex for horizontal scroll
                      display: "flex",
                      overflowX: "auto",
                      scrollSnapType: "x mandatory",
                      paddingBottom: "16px", // Space for scrollbar
                      scrollbarWidth: "thin"
                    }}>
                      {displayedPosts.map((post) => {
                        const postDate = new Date(post.createdAt);
                        const formattedDate = postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                        // Calculate time ago roughly for "3mo • 🌎" style
                        const timeAgo = Math.floor((new Date().getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
                        let timeString = `${timeAgo}d`;
                        if (timeAgo > 30) timeString = `${Math.floor(timeAgo / 30)}mo`;
                        if (timeAgo > 365) timeString = `${Math.floor(timeAgo / 365)}yr`;
                        if (timeAgo === 0) timeString = "Today";


                        return (
                          <div key={post.id} style={{
                            minWidth: "350px", // Fixed width for scroll items
                            width: "calc(50% - 8px)", // Try to fit 2 roughly
                            flexShrink: 0,
                            scrollSnapAlign: "start",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: "#fff"
                          }}>
                            {/* Header */}
                            <div style={{ padding: "12px", display: "flex", gap: "12px" }}>
                              <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                flexShrink: 0,
                                backgroundColor: "#f0f0f0"
                              }}>
                                {displayUser.profileImage ? (
                                  <img
                                    src={displayUser.profileImage}
                                    alt={displayUser.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <div style={{ width: "100%", height: "100%", background: "#667eea" }}></div>
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#000" }}>{displayUser.name}</span>
                                  <span style={{ fontSize: "12px", color: "#666" }}>• You</span>
                                </div>
                                <div style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                                  {displayUser.jobTitle}
                                </div>
                                <div style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <span>{timeString} • </span>
                                  <Globe size={12} />
                                </div>
                              </div>
                              <div style={{ color: "#666", cursor: "pointer" }}>•••</div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: "0 12px 12px 12px", flex: 1 }}>
                              {post.content && (
                                <p style={{ fontSize: "14px", color: "#000", lineHeight: "1.5", margin: "0 0 8px 0", maxHeight: "60px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                                  {post.content}
                                </p>
                              )}

                              {post.imageUrl && (
                                <div style={{ borderRadius: "4px", overflow: "hidden", marginTop: "8px" }}>
                                  <img
                                    src={post.imageUrl}
                                    alt="Post"
                                    style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                                  />
                                </div>
                              )}

                              {post.videoUrl && (
                                <div style={{ borderRadius: "4px", overflow: "hidden", marginTop: "8px" }}>
                                  <video
                                    src={post.videoUrl}
                                    controls
                                    style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Engagement Footer */}
                            <div style={{ padding: "8px 12px", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#666" }}>
                                <span>👍 {post._count.likes}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "#666" }}>
                                <span>{post._count.comments} comments</span>
                              </div>
                            </div>
                            {/* Action Buttons */}
                            <div style={{ display: "flex", borderTop: "1px solid #e0e0e0", padding: "4px 0" }}>
                              <button style={{ flex: 1, background: "none", border: "none", padding: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "#666" }}>
                                <Heart size={20} />
                              </button>
                              <button style={{ flex: 1, background: "none", border: "none", padding: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "#666" }}>
                                <MessageCircle size={20} />
                              </button>
                              <button style={{ flex: 1, background: "none", border: "none", padding: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "#666" }}>
                                <Send size={20} />
                              </button>
                              <button style={{ flex: 1, background: "none", border: "none", padding: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "#666" }}>
                                <Bookmark size={20} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ textAlign: "center", marginTop: "16px" }}>
                      <Link href="/dashboard/feed/me" style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        Show all {activePostTab} <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div style={{ padding: "32px 0", textAlign: "center" }}>
                    <p style={{ fontSize: "16px", fontWeight: "600", color: "#000", margin: "0 0 8px 0" }}>
                      Nothing to see here yet
                    </p>
                    <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                      Posts you share will appear here.
                    </p>
                  </div>
                );
              }
            })()}
          </div>

          {/* Contact Information Popup */}
          {showContactPopup && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
            }} onClick={() => setShowContactPopup(false)}>
              <div style={{
                backgroundColor: "#fff", borderRadius: "8px", padding: "24px",
                width: "90%", maxWidth: "500px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                maxHeight: "90vh", overflowY: "auto"
              }} onClick={e => e.stopPropagation()}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#000", margin: 0 }}>Contact Information</h2>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {isEditingContact ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={handleSaveContact}
                          style={{
                            backgroundColor: "#0a66c2", color: "#fff", border: "none", borderRadius: "16px",
                            padding: "6px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelContact}
                          style={{
                            backgroundColor: "#fff", color: "#666", border: "1px solid #666", borderRadius: "16px",
                            padding: "6px 16px", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <Edit size={20} color="#666" style={{ cursor: "pointer" }} onClick={handleEditContact} />
                        <button onClick={() => setShowContactPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px", lineHeight: "1", color: "#666" }}>
                          &times;
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {displayUser.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #e0e0e0" }}>
                    <Mail size={20} color="#666" />
                    <div>
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Email</div>
                      <a href={`mailto:${displayUser.email}`} style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                        {displayUser.email}
                      </a>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #e0e0e0" }}>
                  <Phone size={20} color="#666" />
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Phone</div>
                    {isEditingContact ? (
                      <input
                        type="text"
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleContactInputChange}
                        placeholder="Phone Number"
                        style={{
                          fontSize: "14px", color: "#000", width: "100%", border: "1px solid #ccc",
                          borderRadius: "4px", padding: "4px 8px"
                        }}
                      />
                    ) : (
                      <a href={`tel:${displayUser.phone}`} style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                        {displayUser.phone || "Add phone number"}
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #e0e0e0" }}>
                  <Linkedin size={20} color="#666" />
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>LinkedIn</div>
                    {isEditingContact ? (
                      <input
                        type="text"
                        name="linkedin"
                        value={contactForm.linkedin}
                        onChange={handleContactInputChange}
                        placeholder="LinkedIn Username"
                        style={{
                          fontSize: "14px", color: "#000", width: "100%", border: "1px solid #ccc",
                          borderRadius: "4px", padding: "4px 8px"
                        }}
                      />
                    ) : (
                      <a href={`https://linkedin.com/in/${displayUser.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                        {displayUser.linkedin ? `linkedin.com/in/${displayUser.linkedin}` : "Add LinkedIn"}
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0" }}>
                  <Globe size={20} color="#666" />
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Website</div>
                    {isEditingContact ? (
                      <input
                        type="text"
                        name="website"
                        value={contactForm.website}
                        onChange={handleContactInputChange}
                        placeholder="Website URL"
                        style={{
                          fontSize: "14px", color: "#000", width: "100%", border: "1px solid #ccc",
                          borderRadius: "4px", padding: "4px 8px"
                        }}
                      />
                    ) : (
                      <a href={displayUser.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                        {displayUser.website || "Add website"}
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* Who's Viewed Your Profile */}
          <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#000", margin: 0 }}>
                Who your viewers also viewed
              </h3>
              <Eye size={16} color="#666" />
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Eye size={12} />
              <span>Private to you</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #e0e0e0", cursor: "pointer" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "600",
                fontSize: "16px",
                flexShrink: 0
              }}>
                SM
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Sahil Mulchandani</div>
                <div style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Information Technology Support</div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <Link href="#" style={{ fontSize: "14px", color: "#666", textDecoration: "none", fontWeight: "500" }}>
                View all →
              </Link>
            </div>
          </div>
          <div className="h-24 lg:h-0 w-full flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
