"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Mail, Phone, Linkedin, Globe, Edit, Eye, UserPlus, MessageCircle, Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
    website?: string;
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
    isConnected?: boolean;
    connectionStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NONE' | 'SELF';
    viewerId?: string;
    suggestions?: Suggestion[];
}

interface Card {
    id: string;
    cardName: string;
    documentUrl?: string;
}

interface Suggestion {
    id: string;
    fullName: string;
    profileImage?: string;
    title?: string;
    company?: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    const { user: zustandUser, isAuthenticated, isLoading: authLoading } = useAuth();

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [cards, setCards] = useState<Card[]>([]); // Likely empty for public view if not implemented in API
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePostTab, setActivePostTab] = useState<'posts' | 'comments'>('posts');

    const [showContactPopup, setShowContactPopup] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUserProfile(userId);
        }
    }, [userId]);

    const fetchUserProfile = async (id: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/user/${id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched public profile:', data);
                setUserProfile(data.user);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to load profile');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Error loading profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!userProfile) return;
        setIsConnecting(true);
        try {
            const res = await fetch("/api/users/connections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: userProfile.id }),
            });

            if (res.ok) {
                toast.success("Connection request sent!");
                // Optimistically update UI
                setUserProfile(prev => prev ? { ...prev, connectionStatus: 'PENDING' } : null);
            } else {
                const data = await res.json();
                if (data.error?.includes("already")) {
                    toast.error("Request already pending");
                    setUserProfile(prev => prev ? { ...prev, connectionStatus: 'PENDING' } : null);
                } else {
                    toast.error("Failed to connect");
                }
            }
        } catch (e) {
            toast.error("Error connecting");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleMessage = () => {
        if (!userProfile) return;
        // Redirect to messages page with this user selected
        // Standard pattern: /dashboard/messages?chatId=... or ?userId=...
        // Assuming creates a new chat or opens existing one. 
        // We'll pass userId as query param for the messages page to handle.
        // Or if we need a chatId, we might need to create it first.
        // simpler to pass userId and let messages page find the chat.
        router.push(`/dashboard/messages?userId=${userProfile.id}`);
    };


    if (isLoading) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: "16px", color: "#666" }}>Loading profile...</p>
            </div>
        );
    }

    if (error || !userProfile) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "16px", color: "#dc2626", marginBottom: "16px" }}>{error || "User not found"}</p>
                    <button
                        onClick={() => router.back()}
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
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const isOwnProfile = userProfile.connectionStatus === 'SELF';
    const isConnected = userProfile.isConnected || isOwnProfile;
    const isPending = userProfile.connectionStatus === 'PENDING';

    // Logic for display user object (similar to main profile page)
    const displayUser = {
        name: userProfile.fullName || "User",
        email: userProfile.email,
        jobTitle: userProfile.title || "Member",
        company: userProfile.company || "",
        location: userProfile.location || "",
        phone: userProfile.phone || "",
        linkedin: userProfile.username || "", // Mapping username to linkedin/public handle
        website: userProfile.website || "",
        profileImage: userProfile.profileImage || null,
        bannerImage: userProfile.bannerImage || null,
        description: userProfile.bio || "No description provided.",
        connectionCount: userProfile.connectionCount || 0,
        documentUrl: userProfile.documentUrl
    };

    const cardsWithDocuments = cards.filter(card => card.documentUrl);

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", paddingTop: "0px" }}>
            {/* Main Container */}
            <div style={{ maxWidth: "1128px", margin: "0 auto", padding: "0px 0px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>

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

                                    {/* Contact Info link - ONLY if connected or self */}
                                    {/* If not connected: Hide Contact Info link, show Connect Button below */}
                                    {isConnected ? (
                                        <button
                                            onClick={() => setShowContactPopup(true)}
                                            style={{ color: "#0a66c2", textDecoration: "none", fontWeight: "500", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "14px" }}
                                        >
                                            Contact info
                                        </button>
                                    ) : null}
                                </div>

                                <div style={{ fontSize: "14px", color: "#0a66c2", fontWeight: "600", marginBottom: "16px" }}>
                                    {displayUser.connectionCount} connections
                                </div>

                                {/* ACTION BUTTONS */}
                                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                    {!isConnected && !isOwnProfile && (
                                        <button
                                            onClick={handleConnect}
                                            disabled={isConnecting || isPending}
                                            style={{
                                                backgroundColor: isPending ? "#e0e0e0" : "#0a66c2",
                                                color: isPending ? "#666" : "#fff",
                                                border: "none",
                                                borderRadius: "24px",
                                                padding: "6px 24px",
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                cursor: isPending ? "default" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            {isPending ? (
                                                <>
                                                    <Check size={18} /> Pending
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={18} /> Connect
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {isConnected && !isOwnProfile && (
                                        <button
                                            onClick={handleMessage}
                                            style={{
                                                backgroundColor: "#fff",
                                                color: "#0a66c2",
                                                border: "1px solid #0a66c2",
                                                borderRadius: "24px",
                                                padding: "6px 24px",
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            <MessageCircle size={18} /> Message
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Conditional Sections */}
                    {/* Documents - Only if connected */}
                    {isConnected && (
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
                            <div style={{ marginBottom: "8px" }}>
                                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#000", margin: 0 }}>Documents</h3>
                            </div>

                            {cardsWithDocuments.length > 0 ? (
                                /* ... (Card logic similar to main profile) ... */
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
                                displayUser.documentUrl ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
                                            Primary Document
                                        </div>
                                        <a
                                            href={displayUser.documentUrl}
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
                    )}

                    {/* About Section - Always Visible */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#000", margin: 0 }}>About</h2>
                        </div>
                        <p style={{ fontSize: "14px", color: "#000", lineHeight: "1.6", margin: 0, whiteSpace: "pre-wrap" }}>
                            {displayUser.description}
                        </p>
                    </div>

                    {/* Posts Section - Only if Connected */}
                    {isConnected && (
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
                                        color: activePostTab === 'comments' ? "#fff" : "#666",
                                        backgroundColor: activePostTab === 'comments' ? "#01754f" : "transparent",
                                        border: activePostTab === 'comments' ? "none" : "1px solid #666",
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
                                const allPosts = userProfile?.posts || [];
                                const mediaPosts = allPosts.filter(p => p.imageUrl);
                                const textPosts = allPosts.filter(p => !p.imageUrl);

                                const displayedPosts = activePostTab === 'posts' ? mediaPosts : textPosts;

                                if (displayedPosts.length > 0) {
                                    return (
                                        <div style={{
                                            gap: "16px",
                                            display: "flex",
                                            overflowX: "auto",
                                            scrollSnapType: "x mandatory",
                                            paddingBottom: "16px",
                                            scrollbarWidth: "thin"
                                        }}>
                                            {displayedPosts.map((post) => {
                                                const postDate = new Date(post.createdAt);
                                                const timeAgo = Math.floor((new Date().getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
                                                let timeString = `${timeAgo}d`;
                                                if (timeAgo > 30) timeString = `${Math.floor(timeAgo / 30)}mo`;
                                                if (timeAgo > 365) timeString = `${Math.floor(timeAgo / 365)}yr`;
                                                if (timeAgo === 0) timeString = "Today";

                                                return (
                                                    <div key={post.id} style={{
                                                        minWidth: "350px",
                                                        width: "calc(50% - 8px)",
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
                                                                </div>
                                                                <div style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                                                                    {displayUser.jobTitle}
                                                                </div>
                                                                <div style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "4px" }}>
                                                                    <span>{timeString} • </span>
                                                                    <Globe size={12} />
                                                                </div>
                                                            </div>
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
                                                                    {post.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                                                        <video
                                                                            src={post.imageUrl}
                                                                            controls
                                                                            style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                                                                        />
                                                                    ) : (
                                                                        <img
                                                                            src={post.imageUrl}
                                                                            alt="Post"
                                                                            style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div style={{ padding: "24px", textAlign: "center", color: "#666", fontSize: "14px" }}>
                                            No {activePostTab === 'posts' ? 'media posts' : 'textual posts'} to show.
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    )}


                    {/* Suggestions - Only if NOT connected */}
                    {!isConnected && !isOwnProfile && (
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#000", margin: "0 0 16px 0" }}>Suggested for you</h3>
                            {userProfile.suggestions && userProfile.suggestions.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {userProfile.suggestions.map((suggestion) => (
                                        <Link href={`/dashboard/profile/${suggestion.id}`} key={suggestion.id} style={{ textDecoration: "none", color: "inherit" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{
                                                    width: "48px",
                                                    height: "48px",
                                                    borderRadius: "50%",
                                                    overflow: "hidden",
                                                    flexShrink: 0,
                                                    backgroundColor: "#f0f0f0"
                                                }}>
                                                    {suggestion.profileImage ? (
                                                        <img
                                                            src={suggestion.profileImage}
                                                            alt={suggestion.fullName}
                                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            background: "#667eea",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "16px",
                                                            fontWeight: "600",
                                                            color: "#fff"
                                                        }}>
                                                            {suggestion.fullName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {suggestion.fullName}
                                                    </div>
                                                    <div style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {suggestion.title}{suggestion.company ? ` at ${suggestion.company}` : ""}
                                                    </div>
                                                </div>
                                                <button style={{
                                                    border: "1px solid #666",
                                                    borderRadius: "16px",
                                                    padding: "4px 12px",
                                                    backgroundColor: "transparent",
                                                    color: "#666",
                                                    fontWeight: "600",
                                                    fontSize: "13px",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px"
                                                }}>
                                                    <UserPlus size={14} /> Connect
                                                </button>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: "14px", color: "#666" }}>No suggestions available.</p>
                            )}
                        </div>
                    )}


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
                                        <button onClick={() => setShowContactPopup(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px", lineHeight: "1", color: "#666" }}>
                                            &times;
                                        </button>
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
                                        <a href={`tel:${displayUser.phone}`} style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                                            {displayUser.phone || "Not scheduled"}
                                        </a>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #e0e0e0" }}>
                                    <Linkedin size={20} color="#666" />
                                    <div style={{ width: "100%" }}>
                                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>LinkedIn</div>
                                        <a href={`https://linkedin.com/in/${displayUser.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                                            {displayUser.linkedin ? `linkedin.com/in/${displayUser.linkedin}` : "Not listed"}
                                        </a>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0" }}>
                                    <Globe size={20} color="#666" />
                                    <div style={{ width: "100%" }}>
                                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Website</div>
                                        <a href={displayUser.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#0a66c2", textDecoration: "none" }}>
                                            {displayUser.website || "Not listed"}
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    <div className="h-24 lg:h-0 w-full flex-shrink-0" />
                </div>
            </div>
        </div>
    );
}
