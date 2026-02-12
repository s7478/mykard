"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Mail, Phone, Linkedin, Globe, MapPin, Users, Edit, Eye, TrendingUp, Search, ChevronRight, Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface UserPost {
  id: string;
  content: string | null;
  imageUrl: string | null;
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
  documentUrl?: string;
  views?: number;
  shares?: number;
  connectionCount?: number;
  posts?: UserPost[];
}

export default function ProfilePage() {
  const { user: zustandUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", paddingTop: "60px" }}>
      {/* Main Container */}
      <div style={{ maxWidth: "1128px", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
          
          {/* Left Column - Main Content */}
          <div>
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
                <button 
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
                    <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#000", margin: 0 }}>
                      {displayUser.name}
                    </h1>
                    <span style={{ fontSize: "14px", color: "#666" }}>He/Him</span>
                  </div>
                  
                  <div style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "6px", 
                    padding: "4px 12px", 
                    border: "1px dashed #0a66c2", 
                    borderRadius: "16px", 
                    marginBottom: "12px",
                    marginTop: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#0a66c2",
                    fontWeight: "500",
                    backgroundColor: "transparent",
                    transition: "background-color 0.2s"
                  }}>
                    <Users size={16} />
                    Add verification badge
                  </div>

                  <p style={{ fontSize: "16px", color: "#000", marginBottom: "4px", fontWeight: "400", lineHeight: "1.4" }}>
                    {displayUser.jobTitle}{displayUser.company ? ` | ${displayUser.company}` : ''}
                  </p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#666", marginTop: "8px", marginBottom: "8px" }}>
                    {displayUser.location && (
                      <>
                        <span>{displayUser.location}</span>
                        <span>•</span>
                      </>
                    )}
                    <Link href="#" style={{ color: "#0a66c2", textDecoration: "none", fontWeight: "500" }}>
                      Contact info
                    </Link>
                  </div>

                  <div style={{ fontSize: "14px", color: "#0a66c2", fontWeight: "600", marginBottom: "16px" }}>
                    {(userProfile?.connectionCount || 0)} connections
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Card */}
            <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#000", margin: 0 }}>Analytics</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", color: "#666" }}>
                  <Eye size={16} />
                  <span>Private to you</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {/* Profile Views */}
                <div style={{ padding: "12px 0", borderRight: "1px solid #e0e0e0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <Eye size={24} color="#666" />
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: "600", color: "#000" }}>{userProfile?.views || 0}</div>
                      <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Profile Views</div>
                    </div>
                  </div>
                </div>

                {/* Shares */}
                <div style={{ padding: "12px 16px", borderRight: "1px solid #e0e0e0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <TrendingUp size={24} color="#666" />
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: "600", color: "#000" }}>{userProfile?.shares || 0}</div>
                      <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Shares</div>
                    </div>
                  </div>
                </div>

                {/* Connections */}
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <Users size={24} color="#666" />
                    <div>
                      <div style={{ fontSize: "20px", fontWeight: "600", color: "#000" }}>{userProfile?.connectionCount || 0}</div>
                      <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>Connections</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            {displayUser.description && (
              <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#000", margin: 0 }}>About</h2>
                  <Edit size={20} color="#666" style={{ cursor: "pointer" }} />
                </div>
                <p style={{ fontSize: "14px", color: "#000", lineHeight: "1.6", margin: 0, whiteSpace: "pre-wrap" }}>
                  {displayUser.description}
                </p>
              </div>
            )}

            {/* Posts Section */}
            <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#000", marginBottom: "16px" }}>Posts</h2>
              
              {userProfile?.posts && userProfile.posts.length > 0 ? (
                <div>
                  {userProfile.posts.map((post) => {
                    const postDate = new Date(post.createdAt);
                    const formattedDate = postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    
                    return (
                      <div key={post.id} style={{ padding: "16px 0", borderTop: "1px solid #e0e0e0" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
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
                              <div style={{ 
                                width: "100%", 
                                height: "100%", 
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                fontWeight: "600",
                                color: "#fff"
                              }}>
                                {displayUser.name.split(" ").map((n: string) => n[0]).join("")}
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#000" }}>{displayUser.name}</div>
                            <div style={{ fontSize: "12px", color: "#666" }}>{displayUser.jobTitle}</div>
                            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{formattedDate}</div>
                          </div>
                        </div>
                        
                        {post.content && (
                          <p style={{ fontSize: "14px", color: "#000", lineHeight: "1.6", marginBottom: "12px", whiteSpace: "pre-wrap" }}>
                            {post.content}
                          </p>
                        )}
                        
                        {post.imageUrl && (
                          <div style={{ marginBottom: "12px", borderRadius: "8px", overflow: "hidden" }}>
                            <img 
                              src={post.imageUrl} 
                              alt="Post" 
                              style={{ width: "100%", height: "auto", display: "block" }}
                            />
                          </div>
                        )}
                        
                        <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#666" }}>
                          <span>👍 {post._count.likes} likes</span>
                          <span>💬 {post._count.comments} comments</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <Link href="/dashboard/feed/me" style={{ fontSize: "14px", color: "#666", textDecoration: "none", fontWeight: "500" }}>
                      Show all posts →
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "16px 0", borderTop: "1px solid #e0e0e0" }}>
                  <p style={{ fontSize: "14px", color: "#666", textAlign: "center", margin: 0 }}>
                    You haven't posted yet
                  </p>
                  <p style={{ fontSize: "12px", color: "#666", textAlign: "center", marginTop: "8px", margin: 0 }}>
                    Posts you share will be displayed here.
                  </p>
                </div>
              )}
            </div>

            {/* Contact Information Section */}
            <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "24px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginTop: "8px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#000", marginBottom: "16px" }}>Contact Information</h2>
              
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

              {displayUser.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #e0e0e0" }}>
                  <Phone size={20} color="#666" />
                  <div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Phone</div>
                    <a href={`tel:${displayUser.phone}`} style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                      {displayUser.phone}
                    </a>
                  </div>
                </div>
              )}

              {displayUser.linkedin && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #e0e0e0" }}>
                  <Linkedin size={20} color="#666" />
                  <div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>LinkedIn</div>
                    <a href={`https://linkedin.com/in/${displayUser.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                      linkedin.com/in/{displayUser.linkedin}
                    </a>
                  </div>
                </div>
              )}

              {displayUser.website && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0" }}>
                  <Globe size={20} color="#666" />
                  <div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Website</div>
                    <a href={displayUser.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                      {displayUser.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Profile Language */}
            <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
              <div style={{ marginBottom: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#000", margin: 0 }}>Profile language</h3>
              </div>
              <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>English</p>
            </div>

            {/* Public Profile & URL */}
            <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
              <div style={{ marginBottom: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#000", margin: 0 }}>Public profile & URL</h3>
              </div>
              <p style={{ fontSize: "12px", color: "#666", margin: 0, wordBreak: "break-all" }}>
                {typeof window !== 'undefined' && `${window.location.origin}/cards/public/${userProfile?.id || displayUser.id}`}
              </p>
            </div>

            {/* Document */}
            <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
              <div style={{ marginBottom: "8px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#000", margin: 0 }}>Document</h3>
              </div>
              {userProfile?.documentUrl ? (
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
              ) : (
                <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>No documents uploaded</p>
              )}
            </div>

            {/* Premium Ad */}
            <div style={{ 
              backgroundColor: "#fff", 
              borderRadius: "8px", 
              padding: "16px", 
              boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", 
              marginBottom: "8px",
              textAlign: "center"
            }}>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  backgroundColor: "#f3f2ef", 
                  margin: "0 auto 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {displayUser.profileImage ? (
                    <img
                      src={displayUser.profileImage}
                      alt={displayUser.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: "20px", fontWeight: "600", color: "#666" }}>
                      {displayUser.name.split(" ").map((n: string) => n[0]).join("")}
                    </span>
                  )}
                </div>
                <span style={{ 
                  backgroundColor: "#f8c77e", 
                  color: "#000", 
                  padding: "2px 8px", 
                  borderRadius: "4px", 
                  fontSize: "12px",
                  fontWeight: "600"
                }}>
                  Premium
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
                {displayUser.name.split(" ")[0]}, boost your visibility with Premium
              </p>
              <button style={{
                backgroundColor: "#0a66c2",
                color: "#fff",
                border: "none",
                borderRadius: "24px",
                padding: "8px 24px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%"
              }}>
                Try for free
              </button>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
