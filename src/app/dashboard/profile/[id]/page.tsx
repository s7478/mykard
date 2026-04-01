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
    cards?: any[]; // Full cards array including catalogItems
    activeCatalogCardId?: string; // The selected catalog ID for visitors to view
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
    const [activePostTab, setActivePostTab] = useState<'posts' | 'comments' | 'catalog'>('posts');
    const [selectedCatalogCardId, setSelectedCatalogCardId] = useState<string | null>(null);
    const [showCatalogSelector, setShowCatalogSelector] = useState(false);
    const [savingCatalogSelection, setSavingCatalogSelection] = useState(false);
    const [catalogHelpHovered, setCatalogHelpHovered] = useState(false);
    const [catalogHelpPinned, setCatalogHelpPinned] = useState(false);

    const [showContactPopup, setShowContactPopup] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [tempBio, setTempBio] = useState("");

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
        router.push(`/dashboard/messages?userId=${userProfile.id}`);
    };

    const handleSaveBio = async () => {
        try {
            const response = await fetch('/api/user/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bio: tempBio }),
            });

            if (response.ok) {
                const data = await response.json();
                setUserProfile(prev => prev ? { ...prev, bio: data.user.bio } : null);
                setIsEditingBio(false);
                toast.success("Bio updated!");
            } else {
                toast.error("Failed to update bio");
            }
        } catch (err) {
            toast.error("Error updating bio");
        }
    };


    const saveCatalogSelection = async (cardId: string) => {
        if (!userProfile) return;
        setSavingCatalogSelection(true);
        try {
            const res = await fetch("/api/user/active-catalog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activeCatalogCardId: cardId }),
            });
            if (res.ok) {
                toast.success("Catalog selection saved");
                setSelectedCatalogCardId(cardId);
                setShowCatalogSelector(false);
                setUserProfile(prev => prev ? { ...prev, activeCatalogCardId: cardId } : null);
            } else {
                toast.error("Failed to save selection");
            }
        } catch (e) {
            toast.error("Error saving selection");
        } finally {
            setSavingCatalogSelection(false);
        }
    };

    const renderCatalog = (card: any) => {
        let catalogItems: any[] = [];
        try {
            if (card.catalogItems) {
                catalogItems = typeof card.catalogItems === 'string'
                    ? JSON.parse(card.catalogItems)
                    : card.catalogItems;
            }
        } catch (e) {
            console.error("Failed to parse catalog items", e);
        }

        if (catalogItems.length === 0) {
            return (
                <div style={{ padding: "24px", textAlign: "center", color: "#666", fontSize: "14px" }}>
                    Catalog exists but has no items.
                </div>
            );
        }

        // Inherit design colors if needed, but here we just render the grid
        const catalogCards = userProfile?.cards?.filter(c => c.cardActive && c.showCatalog) || [];

        return (
            <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#333" }}>
                        {card.catalogTitle || "Catalog"}
                    </h3>
                    {isOwnProfile && catalogCards.length > 1 && (
                        <button
                            onClick={() => setShowCatalogSelector(true)}
                            style={{ background: "none", border: "1px solid #e0e0e0", borderRadius: "16px", padding: "4px 12px", fontSize: "12px", cursor: "pointer", color: "#666" }}
                        >
                            Change
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {catalogItems.map((item, index) => (
                        <div key={index} style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '12px',
                            padding: '16px',
                            backgroundColor: '#fff'
                        }}>
                            <h4 style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#333',
                                marginBottom: '16px',
                                marginTop: 0,
                            }}>
                                {item.title || "Untitled"}
                            </h4>

                            {item.images && item.images.length > 0 ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '12px',
                                    width: '100%'
                                }}>
                                    {item.images.map((imgObj: any, imgIndex: number) => {
                                        const imgSrc = typeof imgObj === 'string' ? imgObj : (imgObj.url || imgObj.preview);
                                        return (
                                            <div key={imgIndex} style={{
                                                position: 'relative',
                                                aspectRatio: '1 / 1',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                backgroundColor: '#f5f5f5',
                                                border: '1px solid #e8e8e8',
                                                width: '100%'
                                            }}>
                                                {imgSrc ? (
                                                    <img
                                                        src={imgSrc}
                                                        alt={`${item.title} image ${imgIndex + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            display: 'block'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px' }}>
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ padding: "24px", textAlign: "center", color: "#666", fontSize: "14px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                                    No images added
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
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
        description: userProfile.bio || "",
        connectionCount: userProfile.connectionCount || 0,
        documentUrl: userProfile.documentUrl
    };

    const getInitials = (name?: string | null) => {
        if (!name) return "U";
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "U";
        return parts.map((n) => n[0]).join("").slice(0, 2).toUpperCase();
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
                            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}></div>
                            {displayUser.bannerImage && (
                                <img
                                    src={displayUser.bannerImage}
                                    alt="Banner"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                                />
                            )}
                        </div>

                        {/* Profile Info */}
                        <div style={{ padding: "0 24px 24px 24px", position: "relative" }}>
                            {/* Profile Picture */}
                            <div style={{ position: "relative", marginTop: "-70px", marginBottom: "10px" }}>
                                <div
                                    style={{
                                        width: "152px",
                                        height: "152px",
                                        borderRadius: "50%",
                                        border: "4px solid #fff",
                                        overflow: "hidden",
                                        position: "relative",
                                        backgroundColor: "#f0f0f0",
                                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                                    }}
                                >
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
                                        {getInitials(displayUser.name)}
                                    </div>
                                    {displayUser.profileImage && (
                                        <img
                                            src={displayUser.profileImage}
                                            alt={displayUser.name}
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                                        />
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
                    {/* Documents - Only if connected and has documents or is owner */}
                    {(() => {
                        const hasDocuments = cardsWithDocuments.length > 0 || !!displayUser.documentUrl;
                        if (!isConnected || (!hasDocuments && !isOwnProfile)) return null;

                        return (
                            <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
                                <div style={{ marginBottom: "8px" }}>
                                    <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#000", margin: 0 }}>Documents</h3>
                                </div>

                                {hasDocuments ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {cardsWithDocuments.length > 0 ? (
                                            cardsWithDocuments.map(card => (
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
                                            ))
                                        ) : (
                                            displayUser.documentUrl && (
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
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                                        <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>No documents uploaded. Add documents to your cards to display them here.</p>
                                        <button
                                            onClick={() => router.push('/dashboard')}
                                            style={{
                                                padding: "6px 20px",
                                                borderRadius: "24px",
                                                border: "1px solid #0a66c2",
                                                color: "#0a66c2",
                                                background: "none",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* About Section - Conditionally Visible */}
                    {(displayUser.description || isOwnProfile) && (
                        <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#000", margin: 0 }}>About</h2>
                                {isOwnProfile && !isEditingBio && displayUser.description && (
                                    <button
                                        onClick={() => {
                                            setTempBio(displayUser.description);
                                            setIsEditingBio(true);
                                        }}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}
                                    >
                                        <Edit size={18} />
                                    </button>
                                )}
                            </div>

                            {isEditingBio ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <textarea
                                        value={tempBio}
                                        onChange={(e) => setTempBio(e.target.value)}
                                        placeholder="Add a summary about yourself..."
                                        style={{
                                            width: "100%",
                                            minHeight: "120px",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #e0e0e0",
                                            fontSize: "14px",
                                            outline: "none",
                                            resize: "vertical",
                                            fontFamily: "inherit"
                                        }}
                                    />
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                        <button
                                            onClick={() => setIsEditingBio(false)}
                                            style={{ padding: "6px 16px", borderRadius: "16px", border: "1px solid #666", background: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveBio}
                                            style={{ padding: "6px 16px", borderRadius: "16px", background: "#0a66c2", color: "#fff", border: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : displayUser.description ? (
                                <p style={{ fontSize: "14px", color: "#000", lineHeight: "1.6", margin: 0, whiteSpace: "pre-wrap" }}>
                                    {displayUser.description}
                                </p>
                            ) : (
                                <div style={{ textAlign: "center", padding: "12px 0" }}>
                                    <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>Add a description to tell others about yourself.</p>
                                    <button
                                        onClick={() => {
                                            setTempBio("");
                                            setIsEditingBio(true);
                                        }}
                                        style={{
                                            padding: "6px 20px",
                                            borderRadius: "24px",
                                            border: "1px solid #0a66c2",
                                            color: "#0a66c2",
                                            background: "none",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Posts Section */}
                    <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "8px" }}>

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
                            <button
                                onClick={() => setActivePostTab('catalog')}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: activePostTab === 'catalog' ? "#fff" : "#666",
                                    backgroundColor: activePostTab === 'catalog' ? "#01754f" : "transparent",
                                    border: activePostTab === 'catalog' ? "none" : "1px solid #666",
                                    borderRadius: "16px",
                                    cursor: "pointer",
                                    marginBottom: "12px",
                                    transition: "all 0.2s"
                                }}
                            >
                                Catalog
                            </button>
                        </div>

                        {(() => {
                            if (activePostTab === 'catalog') {
                                const catalogCards = userProfile?.cards || [];
                                const hasCatalogs = catalogCards.length > 0;

                                // Case 1: 0 Catalogs
                                if (!hasCatalogs) {
                                    const showCatalogHelp = catalogHelpHovered || catalogHelpPinned;

                                    return (
                                        <div style={{ padding: "24px", textAlign: "center" }}>
                                            {isOwnProfile ? (
                                                <>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                                                        <p style={{ color: "#666", fontSize: "14px", margin: 0, textAlign: "center" }}>
                                                            Activate your catalog from Edit Card to show it <span style={{ whiteSpace: "nowrap" }}>
                                                                here
                                                                <button
                                                                    type="button"
                                                                    aria-label="Catalog help"
                                                                    title="Hover or click to view steps"
                                                                    onMouseEnter={() => setCatalogHelpHovered(true)}
                                                                    onMouseLeave={() => setCatalogHelpHovered(false)}
                                                                    onClick={() => setCatalogHelpPinned((prev) => !prev)}
                                                                    style={{
                                                                        width: "22px",
                                                                        height: "22px",
                                                                        borderRadius: "50%",
                                                                        border: "1px solid #94a3b8",
                                                                        background: "#f8fafc",
                                                                        color: "#334155",
                                                                        fontSize: "12px",
                                                                        fontWeight: "700",
                                                                        cursor: "help",
                                                                        lineHeight: "20px",
                                                                        marginLeft: "6px",
                                                                        verticalAlign: "middle"
                                                                    }}
                                                                >
                                                                    i
                                                                </button>
                                                            </span>
                                                        </p>
                                                    </div>

                                                    {showCatalogHelp && (
                                                        <div
                                                            style={{
                                                                maxWidth: "640px",
                                                                margin: "0 auto 16px",
                                                                textAlign: "left",
                                                                backgroundColor: "#f8fafc",
                                                                border: "1px solid #cbd5e1",
                                                                borderRadius: "10px",
                                                                padding: "12px 14px",
                                                                color: "#334155",
                                                                fontSize: "13px",
                                                                lineHeight: 1.5
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: 700, marginBottom: "6px" }}>How to activate catalog</div>
                                                            <div>1. Click <b>Activate Catalog</b> below.</div>
                                                            <div>2. Open any card and go to <b>Edit Card</b>.</div>
                                                            <div>3. Open <b>Information</b> tab.</div>
                                                            <div>4. Enable the <b>Catalog</b> button.</div>
                                                            <div>5. Edit your catalog as needed and click <b>Save</b>.</div>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => router.push('/dashboard')}
                                                        style={{
                                                            padding: "8px 16px", backgroundColor: "#01754f", color: "white", borderRadius: "16px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600"
                                                        }}
                                                    >
                                                        Activate Catalog
                                                    </button>
                                                </>
                                            ) : (
                                                <p style={{ color: "#666", fontSize: "14px" }}>No catalog added</p>
                                            )}
                                        </div>
                                    );
                                }

                                // Case 2: Exactly 1 Catalog
                                if (catalogCards.length === 1) {
                                    return renderCatalog(catalogCards[0]);
                                }

                                // Case 3: Multiple Catalogs
                                const activeId = selectedCatalogCardId || userProfile.activeCatalogCardId;
                                const activeCard = catalogCards.find(c => c.id === activeId);

                                if (isOwnProfile) {
                                    if (!activeId || showCatalogSelector) {
                                        return (
                                            <div style={{ padding: "16px", textAlign: "center" }}>
                                                <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
                                                    {showCatalogSelector ? "Select a card to display its catalog:" : "You have multiple catalogs on different cards, select one card to display its catalog."}
                                                </p>
                                                {!showCatalogSelector && (
                                                    <button
                                                        onClick={() => setShowCatalogSelector(true)}
                                                        style={{
                                                            padding: "8px 16px", backgroundColor: "#01754f", color: "white", borderRadius: "16px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", marginBottom: "16px"
                                                        }}
                                                    >
                                                        Choose
                                                    </button>
                                                )}

                                                {showCatalogSelector && (
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                                                        {catalogCards.map(card => (
                                                            <div
                                                                key={card.id}
                                                                onClick={() => saveCatalogSelection(card.id)}
                                                                style={{
                                                                    border: activeId === card.id ? "2px solid #01754f" : "1px solid #e0e0e0",
                                                                    borderRadius: "8px",
                                                                    padding: "12px",
                                                                    cursor: "pointer",
                                                                    position: "relative",
                                                                    backgroundColor: activeId === card.id ? "#f0fdf4" : "white"
                                                                }}
                                                            >
                                                                {activeId === card.id && (
                                                                    <div style={{ position: "absolute", top: "8px", right: "8px", color: "#01754f" }}>
                                                                        <Check size={18} />
                                                                    </div>
                                                                )}
                                                                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#333" }}>{card.cardName || 'Untitled Card'}</h4>
                                                                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>{card.catalogTitle || 'Catalog'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    } else if (activeCard) {
                                        return renderCatalog(activeCard);
                                    }
                                } else {
                                    // Visitor View
                                    if (activeCard) {
                                        return renderCatalog(activeCard);
                                    } else {
                                        return (
                                            <div style={{ padding: "24px", textAlign: "center", color: "#666", fontSize: "14px" }}>
                                                No catalog added
                                            </div>
                                        );
                                    }
                                }
                            }

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
                                                    minWidth: "min(350px, 85%)",
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
                                                            position: "relative",
                                                            flexShrink: 0,
                                                            backgroundColor: "#f0f0f0"
                                                        }}>
                                                            <div style={{ width: "100%", height: "100%", background: "#667eea", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700 }}>
                                                                {getInitials(displayUser.name)}
                                                            </div>
                                                            {displayUser.profileImage && (
                                                                <img
                                                                    src={displayUser.profileImage}
                                                                    alt={displayUser.name}
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = "none";
                                                                    }}
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                                                                />
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
                                                            <p style={{ fontSize: "15px", color: "#000", lineHeight: "1.5", margin: "0 0 10px 0", maxHeight: "60px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                                {post.content}
                                                            </p>
                                                        )}

                                                        {post.imageUrl && (
                                                            <div style={{ borderRadius: "4px", overflow: "hidden", marginTop: "8px" }}>
                                                                {post.imageUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
                                                                    <video
                                                                        src={post.imageUrl}
                                                                        controls
                                                                        playsInline
                                                                        preload="metadata"
                                                                        style={{ width: "100%", height: "200px", objectFit: "cover", display: "block", position: "relative", zIndex: 10 }}
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
                                                    position: "relative",
                                                    flexShrink: 0,
                                                    backgroundColor: "#f0f0f0"
                                                }}>
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
                                                        {getInitials(suggestion.fullName)}
                                                    </div>
                                                    {suggestion.profileImage && (
                                                        <img
                                                            src={suggestion.profileImage}
                                                            alt={suggestion.fullName}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = "none";
                                                            }}
                                                            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                                                        />
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
