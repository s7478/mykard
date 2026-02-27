"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Mail, Phone, Linkedin, Globe, MapPin, Users, Pencil, Eye, TrendingUp, Search, ChevronRight, Building, Heart, MessageCircle, Send, Bookmark, Camera, Edit, Image as ImageIcon, Plus, FileText, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { CreatePostModal } from "@/components/feed/FeedWidgets";

interface UserPost {
  id: string;
  content: string | null;
  imageUrl: string | null;
  videoUrl: string | null; // Changed from optional
  createdAt: string;
  visibility: string;
  isLiked?: boolean; // New
  isSaved?: boolean; // New
  likesCount: number; // New
  commentsCount: number; // New
  sharesCount: number; // New
  savesCount: number; // New
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
  activeCatalogCardId?: string;
}

interface Card {
  id: string;
  cardName: string;
  documentUrl?: string;
  cardActive?: boolean;
  showCatalog?: boolean;
  catalogTitle?: string;
  catalogItems?: any;
}

export default function ProfilePage() {
  const { user: zustandUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePostTab, setActivePostTab] = useState<'posts' | 'comments' | 'catalog'>('posts');
  const [selectedCatalogCardId, setSelectedCatalogCardId] = useState<string | null>(null);
  const [showCatalogSelector, setShowCatalogSelector] = useState(false);
  const [savingCatalogSelection, setSavingCatalogSelection] = useState(false);
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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [likesModalPostId, setLikesModalPostId] = useState<string | null>(null);
  const [postLikesUsers, setPostLikesUsers] = useState<any[]>([]);
  const [isLoadingLikes, setIsLoadingLikes] = useState(false);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);

  const [selectedPostForComments, setSelectedPostForComments] = useState<UserPost | null>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postModalInitialType, setPostModalInitialType] = useState<"image" | "video" | null>(null);
  const [showPlusPopup, setShowPlusPopup] = useState(false);

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
      await fetchSuggestedUsers();
    };

    loadProfile();
  }, [authLoading, zustandUser]);

  useEffect(() => {
    const fetchPostLikes = async () => {
      if (!likesModalPostId) return;

      try {
        setIsLoadingLikes(true);
        const response = await fetch(`/api/posts/${likesModalPostId}/likes`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.users) {
            setPostLikesUsers(data.users);
          }
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
      } finally {
        setIsLoadingLikes(false);
      }
    };

    fetchPostLikes();
  }, [likesModalPostId]);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest("[data-plus-popup]")) {
        setShowPlusPopup(false);
      }
    }

    if (showPlusPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPlusPopup]);

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

  const fetchSuggestedUsers = async () => {
    try {
      setIsLoadingSuggestions(true);
      const response = await fetch('/api/user/suggestions?limit=5', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.suggestions) {
          setSuggestedUsers(data.suggestions);
        }
      }
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    } finally {
      setIsLoadingSuggestions(false);
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



  // --- Handlers for Post Actions ---

  const handleLikePost = async (postId: string) => {
    if (!userProfile) return;

    // Optimistic update
    setUserProfile(prev => {
      if (!prev || !prev.posts) return prev;
      return {
        ...prev,
        posts: prev.posts.map(p => {
          if (p.id === postId) {
            const currentLiked = p.isLiked || false;
            return {
              ...p,
              isLiked: !currentLiked,
              likesCount: (p.likesCount || 0) + (currentLiked ? -1 : 1)
            };
          }
          return p;
        })
      };
    });

    try {
      await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });
    } catch (e) {
      console.error("Like failed", e);
      // Revert if needed (omitted for brevity, typically we'd fetch fresh data or undo)
    }
  };

  const handleSavePost = async (postId: string) => {
    if (!userProfile) return;

    setUserProfile(prev => {
      if (!prev || !prev.posts) return prev;
      return {
        ...prev,
        posts: prev.posts.map(p => {
          if (p.id === postId) {
            const currentSaved = p.isSaved || false;
            return {
              ...p,
              isSaved: !currentSaved
            };
          }
          return p;
        })
      };
    });

    try {
      const res = await fetch("/api/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });
      const data = await res.json();
      toast.success(data.saved ? "Post saved!" : "Removed from saved");
    } catch (e) {
      toast.error("Action failed");
    }
  };

  const handleSharePost = async (post: UserPost) => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: 'Check out this post on CredLink',
      text: post.content || 'Check out this post',
      url: postUrl
    };

    try {
      // Create share record in DB
      await fetch("/api/posts/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id })
      });

      // Use Web Share API if supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard!");
      }

      // Update count locally
      setUserProfile(prev => {
        if (!prev || !prev.posts) return prev;
        return {
          ...prev,
          posts: prev.posts.map(p => p.id === post.id ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p)
        };
      });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        toast.error("Couldn't share post");
      }
    }
  };

  const openCommentModal = async (post: UserPost) => {
    setSelectedPostForComments(post);
    setPostComments([]);
    setIsLoadingComments(true);

    try {
      const res = await fetch(`/api/posts/comments?postId=${post.id}`);
      const data = await res.json();
      if (data.success) {
        setPostComments(data.comments);
      }
    } catch (e) {
      console.error("Failed to load comments");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPostForComments) return;
    setIsSubmittingComment(true);

    try {
      const res = await fetch("/api/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: selectedPostForComments.id, content: newComment })
      });

      if (res.ok) {
        const data = await res.json();
        setPostComments(prev => [data.comment, ...prev]);
        setNewComment("");
        toast.success("Comment added!");

        // Update count locally
        setUserProfile(prev => {
          if (!prev || !prev.posts) return prev;
          return {
            ...prev,
            posts: prev.posts.map(p => p.id === selectedPostForComments.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p)
          };
        });
      }
    } catch (e) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
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

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingPhoto(true);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(prev => prev ? { ...prev, profileImage: data.url } : null);
        await fetchUserProfile(); // Refresh to get updated data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleBannerImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingBanner(true);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/profile/upload-banner', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(prev => prev ? { ...prev, bannerImage: data.url } : null);
        await fetchUserProfile(); // Refresh to get updated data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload banner image');
      }
    } catch (error) {
      console.error('Error uploading banner image:', error);
      alert('Failed to upload banner image. Please try again.');
    } finally {
      setIsUploadingBanner(false);
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
      <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", /* display: "flex", */ alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "16px", color: "#666" }}>Loading your profile...</p>
      </div>
    );
  }

  // Show error only if we have no user data and there's an error
  if (error && !user) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", /* display: "flex", */ alignItems: "center", justifyContent: "center" }}>
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
        alert("Catalog selection saved");
        setSelectedCatalogCardId(cardId);
        setShowCatalogSelector(false);
        setUserProfile(prev => prev ? { ...prev, activeCatalogCardId: cardId } : null);
      } else {
        alert("Failed to save selection");
      }
    } catch (e) {
      alert("Error saving selection");
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

    const catalogCards = cards.filter(c => c.cardActive && c.showCatalog);

    return (
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#333" }}>
            {card.catalogTitle || "Catalog"}
          </h3>
          {catalogCards.length > 1 && (
            <button
              onClick={() => setShowCatalogSelector(true)}
              style={{ background: "none", border: "1px solid #e0e0e0", borderRadius: "16px", padding: "4px 12px", fontSize: "12px", cursor: "pointer", color: "#666" }}
            >
              Change
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {catalogItems.map((item: any, index: number) => (
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

  // Filter cards to find those with documents
  const cardsWithDocuments = cards.filter(card => card.documentUrl);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f2ef", paddingTop: "0px" }}>
      {/* Main Container */}
      {/* Main Container */}
      <div style={{ maxWidth: "1128px", margin: "0 auto", padding: "0px 0px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>

          {/* Main Content */}
          {/* Profile Card */}
          <div style={{ backgroundColor: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)", marginBottom: "0" }}>
            {/* Banner */}
            <div style={{ position: "relative", height: "150px", backgroundColor: "#a0aec0" }}>
              {displayUser.bannerImage ? (
                <img
                  src={displayUser.bannerImage}
                  alt="Banner"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}></div>
              )}

              {/* Banner Upload Button */}
              <input
                type="file"
                id="banner-upload"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => { setShowPhotoPopup(false); handleBannerImageChange(e); }}
              />
            </div>

            {/* Profile Info */}
            <div style={{ padding: "0px 24px 0px", position: "relative" }}>
              {/* Profile Picture */}
              <div style={{ position: "relative", marginTop: "-100px", marginBottom: "16px" }}>
                <div
                  onClick={() => setShowPhotoPopup(true)}
                  style={{
                    position: "relative",
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    border: "4px solid #fff",
                    overflow: "hidden",
                    backgroundColor: "#f0f0f0",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    cursor: "pointer"
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
                  <input
                    type="file"
                    id="profile-photo-input"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => { setShowPhotoPopup(false); handleProfilePhotoChange(e); }}
                    disabled={isUploadingPhoto}
                    style={{ display: "none" }}
                  />
                </div>

                {/* Edit / Save+Cancel buttons on the right */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingBottom: "4px" }}>
                  {isEditingIntro ? (
                    <>
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
                    </>
                  ) : (
                    <button
                      onClick={handleEditIntro}
                      style={{
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
                      <Pencil size={18} color="#666" />
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Photo Popup */}
              {showPhotoPopup && (
                <div
                  onClick={() => setShowPhotoPopup(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      padding: "24px",
                      width: "300px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      position: "relative"
                    }}
                  >
                    <button
                      onClick={() => setShowPhotoPopup(false)}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "none",
                        border: "none",
                        fontSize: "22px",
                        cursor: "pointer",
                        color: "#666",
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                    <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600", color: "#000" }}>
                      Profile photo
                    </h3>
                    <div style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      margin: "0 auto 20px auto",
                      border: "3px solid #e0e0e0",
                      backgroundColor: "#f0f0f0"
                    }}>
                      {displayUser.profileImage ? (
                        <img src={displayUser.profileImage} alt={displayUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{
                          width: "100%", height: "100%",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "36px", fontWeight: "600", color: "#fff"
                        }}>
                          {displayUser.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                      )}
                    </div>
                    {/* LinkedIn-style icon action buttons */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "16px", paddingBottom: "12px" }}>
                      {/* Update profile photo */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); document.getElementById('profile-photo-input')?.click(); }}
                          disabled={isUploadingPhoto}
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            border: "1.5px solid #d0d0d0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: isUploadingPhoto ? "not-allowed" : "pointer",
                            opacity: isUploadingPhoto ? 0.6 : 1,
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => { if (!isUploadingPhoto) e.currentTarget.style.backgroundColor = "#f0f4ff"; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
                        >
                          {isUploadingPhoto
                            ? <div style={{ width: "20px", height: "20px", border: "2px solid #0a66c2", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                            : <Camera size={24} color="#0a66c2" />
                          }
                        </button>
                        <span style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: "600" }}>
                          Update
                        </span>
                      </div>

                      {/* Update cover image (Frames) */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); document.getElementById('banner-upload')?.click(); }}
                          disabled={isUploadingBanner}
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            border: "1.5px solid #d0d0d0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: isUploadingBanner ? "not-allowed" : "pointer",
                            opacity: isUploadingBanner ? 0.6 : 1,
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => { if (!isUploadingBanner) e.currentTarget.style.backgroundColor = "#f0f4ff"; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
                        >
                          {isUploadingBanner
                            ? <div style={{ width: "20px", height: "20px", border: "2px solid #0a66c2", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                            : <ImageIcon size={24} color="#0a66c2" />
                          }
                        </button>
                        <span style={{ fontSize: "14px", color: "#1a1a1a", fontWeight: "600" }}>
                          Frames
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}


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
                      placeholder="Designation"
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

                <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>
                  <Link href="/dashboard/connections" style={{ color: "#0a66c2", textDecoration: "none" }}>
                    {userProfile?.connectionCount || 0} connections
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Document */}
          <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)" }}>
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
          <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "16px", boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)" }}>
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

            {/* Header: Activity and Create Post */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#000", margin: "0 0 4px 0" }}>Post Activity</h2>
                <div style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                  {userProfile?.connectionCount || 0} followers
                </div>
              </div>
              <Link
                href="/dashboard/feed"
                style={{
                  textDecoration: "none",
                  padding: "6px 16px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#0a66c2",
                  backgroundColor: "transparent",
                  border: "2px solid #0a66c2",
                  borderRadius: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Create a post
              </Link>
            </div>

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

              <div style={{ position: "relative", marginLeft: "auto", display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <button
                  onClick={() => setShowPlusPopup(!showPlusPopup)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f3f2ef",
                    border: "none",
                    cursor: "pointer",
                    color: "#666",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e0e0e0"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f3f2ef"}
                >
                  <Plus size={20} />
                </button>

                {showPlusPopup && (
                  <div
                    data-plus-popup
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "8px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      zIndex: 100,
                      padding: "8px",
                      minWidth: "120px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px"
                    }}>
                    <button
                      onClick={() => {
                        setPostModalInitialType(null);
                        setIsCreatePostModalOpen(true);
                        setShowPlusPopup(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px",
                        background: "none",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#333",
                        borderRadius: "4px"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f2ef"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <FileText size={16} /> Post
                    </button>
                    <button
                      onClick={() => {
                        setPostModalInitialType("image");
                        setIsCreatePostModalOpen(true);
                        setShowPlusPopup(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px",
                        background: "none",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#333",
                        borderRadius: "4px"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f2ef"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <ImageIcon size={16} /> Photo
                    </button>
                    <button
                      onClick={() => {
                        setPostModalInitialType("video");
                        setIsCreatePostModalOpen(true);
                        setShowPlusPopup(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px",
                        background: "none",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#333",
                        borderRadius: "4px"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f2ef"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <Video size={16} color="#059669" /> Video
                    </button>
                  </div>
                )}
              </div>
            </div>

            {(() => {
              if (activePostTab === 'catalog') {
                const catalogCards = cards.filter(c => c.cardActive && c.showCatalog);
                const hasCatalogs = catalogCards.length > 0;

                // Case 1: 0 Catalogs
                if (!hasCatalogs) {
                  return (
                    <div style={{ padding: "24px", textAlign: "center" }}>
                      <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>Create new or edit a card to add catalog</p>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        style={{
                          padding: "8px 16px", backgroundColor: "#01754f", color: "white", borderRadius: "16px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600"
                        }}
                      >
                        Add Catalog
                      </button>
                    </div>
                  );
                }

                // Case 2: Exactly 1 Catalog
                if (catalogCards.length === 1) {
                  return renderCatalog(catalogCards[0]);
                }

                // Case 3: Multiple Catalogs
                const activeId = selectedCatalogCardId || userProfile?.activeCatalogCardId;
                const activeCard = catalogCards.find(c => c.id === activeId);

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
                            <div key={card.id} style={{ border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px", backgroundColor: "#f9f9f9" }}>
                              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#333", fontWeight: "600" }}>{card.cardName}</h4>
                              <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#666" }}>
                                {card.catalogTitle || "Catalog"} (
                                {(() => {
                                  try {
                                    return (typeof card.catalogItems === 'string' ? JSON.parse(card.catalogItems) : card.catalogItems || []).length;
                                  } catch (e) {
                                    return 0;
                                  }
                                })()}
                                &nbsp;items)
                              </p>
                              <button
                                onClick={() => saveCatalogSelection(card.id)}
                                disabled={savingCatalogSelection}
                                style={{
                                  width: "100%", padding: "6px 0", fontSize: "12px", fontWeight: "600",
                                  backgroundColor: "transparent", color: "#01754f", border: "1px solid #01754f",
                                  borderRadius: "16px", cursor: savingCatalogSelection ? "not-allowed" : "pointer",
                                  opacity: savingCatalogSelection ? 0.7 : 1
                                }}
                              >
                                {savingCatalogSelection ? "Saving..." : "Select this catalog"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                if (activeCard) {
                  return renderCatalog(activeCard);
                }

                return null;
              }

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
                                  {post.imageUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) || post.videoUrl ? (
                                    <video
                                      src={post.videoUrl || post.imageUrl}
                                      controls
                                      playsInline
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
                              <button
                                onClick={() => handleLikePost(post.id)}
                                style={{ flex: 1, background: "none", border: "none", padding: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: post.isLiked ? "#ef4444" : "#666" }}
                              >
                                <Heart size={20} fill={post.isLiked ? "#ef4444" : "none"} />
                              </button>
                              <button
                                onClick={() => openCommentModal(post)}
                                style={{ flex: 1, background: "none", border: "none", padding: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "#666" }}
                              >
                                <MessageCircle size={20} />
                              </button>
                              <button
                                onClick={() => handleSharePost(post)}
                                style={{ flex: 1, background: "none", border: "none", padding: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: "#666" }}
                              >
                                <Send size={20} />
                              </button>
                              <button
                                onClick={() => handleSavePost(post.id)}
                                style={{ flex: 1, background: "none", border: "none", padding: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", color: post.isSaved ? "#0a66c2" : "#666" }}
                              >
                                <Bookmark size={20} fill={post.isSaved ? "#0a66c2" : "none"} />
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

          {/* Create Post Modal */}
          <CreatePostModal
            isOpen={isCreatePostModalOpen}
            onClose={() => setIsCreatePostModalOpen(false)}
            currentUser={userProfile}
            initialMediaType={postModalInitialType}
          />

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
                        <Pencil size={20} color="#666" style={{ cursor: "pointer" }} onClick={handleEditContact} />
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

            {isLoadingSuggestions ? (
              <div style={{ padding: "12px 0", textAlign: "center", fontSize: "14px", color: "#666" }}>
                Loading suggestions...
              </div>
            ) : suggestedUsers.length > 0 ? (
              suggestedUsers.map((suggestedUser, idx) => (
                <div key={suggestedUser.id || idx} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: idx === suggestedUsers.length - 1 ? "none" : "1px solid #e0e0e0", cursor: "pointer" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: suggestedUser.profileImage ? `url(${suggestedUser.profileImage}) center/cover no-repeat` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "16px",
                    flexShrink: 0
                  }}>
                    {!suggestedUser.profileImage && (suggestedUser.fullName ? suggestedUser.fullName.substring(0, 2).toUpperCase() : "U")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{suggestedUser.fullName || "User"}</div>
                    <div style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{suggestedUser.title || "No title"}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "12px 0", textAlign: "center", fontSize: "14px", color: "#666" }}>
                No similar profiles found.
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <Link href="/dashboard/search" style={{ fontSize: "14px", color: "#666", textDecoration: "none", fontWeight: "500" }}>
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
