"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import styles from "./connections.module.css"; // Import CSS Module
import { Check, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import DigitalCardPreview from "@/components/cards/DigitalCardPreview";
import { useRouter, useSearchParams } from "next/navigation";

// Remove the inline style injection logic
/*
const flipCardStyles = `...`;
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = flipCardStyles;
  document.head.appendChild(styleSheet);
}
*/

import {
    Search, Filter, Download, Plus,
    ChevronDown, MoreHorizontal,
    Phone, Mail, MessageCircle,
    Calendar, TrendingUp, Users, Activity,
    Zap, Star, Clock, MapPin, Send, X, User,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Contact {
    id: string; // connection id from backend API
    userId?: string; // actual user id of the other party (for messaging)
    name: string;
    title: string;
    company: string;
    avatar?: string;

    tags: string[];
    associatedCard: string;
    dateAdded: string;
    email?: string;
    phone?: string;
    location?: string;
    lastInteraction?: string;
    relationshipScore?: number;
    activityStatus?: "active" | "inactive" | "new";
    meetingCount?: number;
    responseRate?: number;
    connectionStatus?: "connected" | "pending" | "rejected";
    isIncomingRequest?: boolean;
}

// Enhanced sample contact data (Keeping this data structure)
const contactsData: Contact[] = [
    {
        id: "1",
        name: "Leo Garcia",
        title: "Full Stack Developer",
        company: "MyKard",
        tags: ["Personal"],
        associatedCard: "Personal",
        dateAdded: "2024-10-30",
        email: "leo@MyKard.com",
        phone: "+1 (555) 123-4567",
        location: "Mumbai, India",
        lastInteraction: "2024-10-29",
        activityStatus: "active",
    },
    {
        id: "2",
        name: "John Smith",
        title: "Software Engineer",
        company: "Tech Corp",
        tags: ["Tech"],
        associatedCard: "Work",
        dateAdded: "2024-10-25",
        email: "john@techcorp.com",
        phone: "+1 (555) 234-5678",
        location: "San Francisco, CA",
        lastInteraction: "2024-10-28",
        activityStatus: "active",
    },
    {
        id: "3",
        name: "Sarah Johnson",
        title: "Marketing Manager",
        company: "Creative Agency",
        tags: ["Marketing"],
        associatedCard: "Business",
        dateAdded: "2024-10-20",
        email: "sarah@creative.com",
        phone: "+1 (555) 345-6789",
        location: "New York, NY",
        lastInteraction: "2024-10-15",
        activityStatus: "inactive",
    },
    {
        id: "4",
        name: "Mike Davis",
        title: "Product Designer",
        company: "Design Studio",
        tags: ["Design"],
        associatedCard: "Creative",
        dateAdded: "2024-10-15",
        email: "mike@designstudio.com",
        phone: "+1 (555) 456-7890",
        location: "Austin, TX",
        lastInteraction: "2024-10-30",
        activityStatus: "active",
    },
    {
        id: "5",
        name: "Emily Chen",
        title: "Data Scientist",
        company: "Analytics Inc",
        tags: ["Professional"],
        associatedCard: "Professional",
        dateAdded: "2024-10-10",
        email: "emily@analytics.com",
        phone: "+1 (555) 567-8901",
        location: "Seattle, WA",
        lastInteraction: "2024-10-25",
        activityStatus: "active",
    },
    {
        id: "6",
        name: "Alex Rodriguez",
        title: "Sales Director",
        company: "Sales Solutions",
        tags: ["Business"],
        associatedCard: "Business",
        dateAdded: "2024-10-05",
        email: "alex@sales.com",
        phone: "+1 (555) 678-9012",
        location: "Miami, FL",
        lastInteraction: "2024-09-20",
        activityStatus: "inactive",
    },
    {
        id: "7",
        name: "Lisa Wang",
        title: "UX Researcher",
        company: "User Labs",
        tags: ["Creative"],
        associatedCard: "Creative",
        dateAdded: "2024-09-30",
        email: "lisa@userlabs.com",
        phone: "+1 (555) 789-0123",
        location: "Portland, OR",
        lastInteraction: "2024-10-28",
        activityStatus: "active",
    },
    {
        id: "8",
        name: "David Brown",
        title: "DevOps Engineer",
        company: "Cloud Systems",
        tags: ["Technical"],
        associatedCard: "Technical",
        dateAdded: "2024-10-12",
        email: "david@cloudsys.com",
        phone: "+1 (555) 890-1234",
        location: "Denver, CO",
        lastInteraction: "2024-10-26",
        activityStatus: "new",
    },
];

const connectionRequestsData: Contact[] = [
    {
        id: "9",
        name: "New User 1",
        title: "Developer",
        company: "Tech Inc",
        tags: ["Tech"],
        associatedCard: "Work",
        dateAdded: "2024-11-01",
        connectionStatus: "pending",
        isIncomingRequest: true,
    },
    {
        id: "10",
        name: "New User 2",
        title: "Designer",
        company: "Design Co",
        tags: ["Design"],
        associatedCard: "Creative",
        dateAdded: "2024-11-02",
        connectionStatus: "pending",
        isIncomingRequest: true,
    },
];

function DashboardContactPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("a-z");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedSortOption, setSelectedSortOption] = useState("a-z");
    const [viewMode, setViewMode] = useState<"table" | "cards">("table");
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [showContactInfo, setShowContactInfo] = useState<{
        [key: string]: { type: "phone" | "email" | null };
    }>({});
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [contactsList, setContactsList] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messageModal, setMessageModal] = useState<{
        isOpen: boolean; contact: Contact | null;
    }>({ isOpen: false, contact: null });
    const [messageText, setMessageText] = useState("");
    const [connectionRequests, setConnectionRequests] = useState<Contact[]>([]);
    const [activeTab, setActiveTab] = useState<"connections" | "requests">("connections");
    const [previewContact, setPreviewContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(false);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [approveModal, setApproveModal] = useState<{ isOpen: boolean; request: Contact | null; }>({ isOpen: false, request: null });
    const filterRef = useRef<HTMLDivElement>(null);
    const [hasUnreadRequests, setHasUnreadRequests] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const view = searchParams.get('view');
        if (view === 'requests') {
            setActiveTab('requests');
        }
    }, [searchParams]);

    // Force scroll to top on mount to fix refresh scroll offset and ensure header stays fixed
    useEffect(() => { window.scrollTo(0, 0); }, []);

    useEffect(() => {
        setHasUnreadRequests(connectionRequests.length > 0 && activeTab !== "requests");
    }, [connectionRequests, activeTab]);

    useEffect(() => {
        const mql = window.matchMedia("(max-width: 420px)");
        const onChange = () => setIsSmallScreen(mql.matches);
        onChange();
        // @ts-ignore
        mql.addEventListener ? mql.addEventListener("change", onChange) : mql.addListener(onChange);
        return () => {
            // @ts-ignore
            mql.removeEventListener
                ? mql.removeEventListener("change", onChange)
                : mql.removeListener(onChange);
        };
    }, []);

    const handleTabClick = (tab: "connections" | "requests") => {
        setActiveTab(tab);
        // Optional: Update URL shallowly so refresh stays on tab
        router.push(`/dashboard/connections${tab === 'requests' ? '?view=requests' : ''}`);
        if (tab === "requests") {
            setHasUnreadRequests(false);
        }
    };

    // Handle direct message - open message modal
    const handleDirectMessage = (contact: Contact) => {
        setMessageModal({ isOpen: true, contact });
        setMessageText("");
    };

    // Close message modal
    const handleCloseMessageModal = () => {
        setMessageModal({ isOpen: false, contact: null });
        setMessageText("");
    };

    // Send message to backend so it appears in recipient's inbox
    const handleSendMessage = async () => {
        if (!messageText.trim() || !messageModal.contact) return;

        const receiverId = messageModal.contact.userId;
        if (!receiverId) {
            toast.error("Cannot send message: missing receiver id");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/message/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    message: messageText.trim(),
                    receiverId,
                    status: "PENDING",
                    tag: "SUPPORT",
                    read: false,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to send message");
            }

            toast.success("Message sent");
            handleCloseMessageModal();

            // Trigger message refresh across the app
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("message-sent"));
                window.dispatchEvent(new Event("messages-updated"));
            }
        } catch (e: any) {
            console.error("Send message error:", e);
            toast.error(e?.message || "Failed to send message");
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;

            // Check if click is inside filter button or dropdown
            const isFilterButton =
                filterRef.current && filterRef.current.contains(target);
            const isFilterDropdown = target.closest("[data-filter-dropdown]");

            if (!isFilterButton && !isFilterDropdown && isFilterOpen) {
                setIsFilterOpen(false);
            }

            // Close action dropdown when clicking outside
            if (!target.closest(`.${styles.relativeContainer}`)) {
                // Check against a specific class for the dropdown container
                setOpenDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isFilterOpen]);

    // Fetch accepted connections from backend
    useEffect(() => {
        const fetchAcceptedConnections = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/users/connections?type=accepted", {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch connections");
                }

                const data = await response.json();

                // Map backend data to frontend Contact structure
                const mappedConnections: Contact[] = (data.requests || []).map(
                    (connection: any) => ({
                        id: connection.id,
                        userId: connection.user?.id,
                        name: connection.user?.fullName || "Unknown User",
                        title: connection.user?.title || "No Title",
                        company: connection.user?.company || "No Company",
                        avatar: connection.user?.profileImage || undefined,

                        tags: ["Professional"],
                        associatedCard: "Professional",
                        dateAdded: new Date(connection.updatedAt)
                            .toISOString()
                            .split("T")[0],
                        email: connection.user?.email,
                        phone: connection.user?.phone,
                        location: connection.user?.location,
                        connectionStatus: "connected",
                        activityStatus: "active" as const,
                    })
                );

                setContactsList(mappedConnections);
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("connections-updated"));
                }
            } catch (error) {
                console.error("Error fetching connections:", error);
                toast.error("Failed to load connections");
            } finally { setLoading(false); }
        };

        fetchAcceptedConnections();
    }, []);

    // Fetch connection requests from backend
    useEffect(() => {
        const fetchConnectionRequests = async () => {
            try {
                setRequestsLoading(true);
                const response = await fetch("/api/users/connections?type=received", { credentials: "include", });

                if (!response.ok) { throw new Error("Failed to fetch connection requests"); }

                const data = await response.json();

                // Map backend data to frontend Contact structure
                const mappedRequests: Contact[] = (data.requests || []).map(
                    (request: any) => ({
                        id: request.id,
                        name: request.sender?.fullName || "Unknown User",
                        title: request.sender?.title || "No Title",
                        company: request.sender?.company || "No Company",
                        avatar: request.sender?.profileImage || undefined,

                        tags: ["Professional"],
                        associatedCard: "Professional",
                        dateAdded: new Date(request.createdAt).toISOString().split("T")[0],
                        email: request.sender?.email,
                        connectionStatus: "pending",
                        isIncomingRequest: true,
                        activityStatus: "new" as const,
                    })
                );

                setConnectionRequests(mappedRequests);
                if (typeof window !== "undefined") { window.dispatchEvent(new Event("connections-updated")); }
            } catch (error) {
                console.error("Error fetching connection requests:", error);
                toast.error("Failed to load connection requests");
            } finally {
                setRequestsLoading(false);
            }
        };

        fetchConnectionRequests();
    }, []);

    // Handle showing contact info
    const handleContactInfo = (contactId: string, type: "phone" | "email") => {
        setShowContactInfo((prev) => {
            const current = prev[contactId]?.type;
            const next = current === type ? null : type;
            return { ...prev, [contactId]: { type: next } };
        });
    };

    // Handle delete connection
    const handleDeleteConnection = async (contactId: string) => {
        try {
            const res = await fetch(`/api/users/connections/${contactId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to remove connection");
            }

            setContactsList((prev) =>
                prev.filter((contact) => contact.id !== contactId)
            );
            setOpenDropdown(null);
            toast.success("Connection removed successfully");
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("connections-updated"));
            }
        } catch (e: any) {
            console.error("Delete connection error:", e);
            toast.error(e?.message || "Failed to remove connection");
        }
    };

    // Handle contact click to open sidebar
    const handleContactClick = (contact: Contact) => {
        setSelectedContact(contact);
        setIsSidebarOpen(true);
    };

    // Handle sidebar close
    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedContact(null);
    };

    // Filter contacts based on search term
    const filteredContacts = contactsList.filter(
        (contact: Contact) =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort contacts
    const sortedContacts = [...filteredContacts].sort((a, b) => {
        switch (sortBy) {
            case "a-z":
                return a.name.localeCompare(b.name);
            case "z-a":
                return b.name.localeCompare(a.name);
            case "recent":
                return (new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
            case "oldest":
                return (new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
            default:
                return a.name.localeCompare(b.name);
        }
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getInitials = (name: string) => {
        return (
            name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U"
        );
    };

    // Helper to map tags to specific module classes for color (defined in CSS module)
    const getTagClass = (tag: string) => {
        switch (tag.toLowerCase()) {
            case "personal":
                return styles.tagPersonal;
            case "tech":
                return styles.tagTech;
            case "marketing":
                return styles.tagMarketing;
            case "design":
                return styles.tagDesign;
            case "professional":
                return styles.tagProfessional;
            case "business":
                return styles.tagBusiness;
            case "creative":
                return styles.tagCreative;
            case "technical":
                return styles.tagTechnical;
            default:
                return styles.tagDefault;
        }
    };

    const handleApproveRequest = async (contactId: string) => {
        try {
            const response = await fetch(`/api/users/connections/${contactId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: "accept" }),
            });

            if (!response.ok) {
                throw new Error("Failed to approve connection request");
            }

            const data = await response.json();

            // Find the request and move it to connections
            const request = connectionRequests.find((c) => c.id === contactId);
            if (request) {
                setContactsList((prev) => [
                    ...prev,
                    { ...request, connectionStatus: "connected" },
                ]);
                setConnectionRequests((prev) => prev.filter((c) => c.id !== contactId));
                toast.success(`Connection with ${request.name} approved!`);
                try {
                    if (typeof window !== "undefined") {
                        let existing: string[] = [];
                        const stored = window.localStorage.getItem(
                            "dashboard-cleared-notifications"
                        );
                        if (stored) existing = JSON.parse(stored);
                        const setExisting = new Set(existing || []);
                        setExisting.add(`conn-${contactId}`);
                        window.localStorage.setItem(
                            "dashboard-cleared-notifications",
                            JSON.stringify(Array.from(setExisting))
                        );
                        window.dispatchEvent(new Event("notifications-updated"));
                    }
                } catch {
                    // ignore
                }
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("connections-updated"));
                }
            }
        } catch (error: any) {
            console.error("Error approving connection request:", error);
            toast.error(error.message || "Failed to approve connection request");
        }
    };

    const openApproveModal = (request: Contact) => { setApproveModal({ isOpen: true, request }); };

    const closeApproveModal = () => { setApproveModal({ isOpen: false, request: null }); };

    const handleRejectRequest = async (contactId: string) => {
        try {
            const response = await fetch(`/api/users/connections/${contactId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ action: "reject" }),
            });

            if (!response.ok) {
                throw new Error("Failed to reject connection request");
            }

            const data = await response.json();

            // Remove the request from the list
            const request = connectionRequests.find((c) => c.id === contactId);
            setConnectionRequests((prev) => prev.filter((c) => c.id !== contactId));

            if (request) {
                toast.success(`Connection request from ${request.name} rejected`);
                try {
                    if (typeof window !== "undefined") {
                        let existing: string[] = [];
                        const stored = window.localStorage.getItem(
                            "dashboard-cleared-notifications"
                        );
                        if (stored) existing = JSON.parse(stored);
                        const setExisting = new Set(existing || []);
                        setExisting.add(`conn-${contactId}`);
                        window.localStorage.setItem(
                            "dashboard-cleared-notifications",
                            JSON.stringify(Array.from(setExisting))
                        );
                        window.dispatchEvent(new Event("notifications-updated"));
                    }
                } catch {
                    // ignore
                }
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("connections-updated"));
                }
            }
        } catch (error: any) {
            console.error("Error rejecting connection request:", error);
            toast.error(error.message || "Failed to reject connection request");
        }
    };

    return (
        <main className={styles.minHScreen} style={{
            background: `radial-gradient(600px 300px at 50% -50px, rgba(14, 61, 114, 0.25), transparent 70%),
                   radial-gradient(500px 250px at 15% 120px, rgba(40, 107, 241, 0.2), transparent 70%),
                   radial-gradient(500px 250px at 85% 140px, rgba(23, 69, 167, 0.18), transparent 70%),
                   linear-gradient(180deg, #F5F9FF 0%, #FFFFFF 55%)`
        }}>
            <div className={styles.wFull}>
                {previewContact && (
                    <Modal isOpen={!!previewContact} onClose={() => setPreviewContact(null)} title="" message={null} showActions={false}>
                        <div style={{ padding: 20 }}>
                            <DigitalCardPreview
                                name={previewContact.name}
                                title={previewContact.title}
                                company={previewContact.company}
                                location={previewContact.location || ""}
                                about={`${previewContact.title || ""}${previewContact.company ? " at " + previewContact.company : ""
                                    }`}
                                skills=""
                                portfolio=""
                                experience=""
                                photo={previewContact.avatar}
                            />
                        </div>
                    </Modal>
                )}

                {/* Hero Section */}
                <div className={styles.heroSection}>
                    {/* Search Bar & Filter Section */}
                    <div className={styles.searchBarSection}>
                        <div className={styles.searchRow}>
                            {/* Search Input Container */}
                            <div className={styles.searchWrapper}>
                                <span className={styles.searchIcon}> <Search size={20} /></span>
                                <input type="text" placeholder="Search Connections..." value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
                            </div>

                            {/* Filter Button Container */}
                            <div className={styles.filterContainer} ref={filterRef}>
                                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={styles.filterButton} aria-expanded={isFilterOpen}>
                                    Filter
                                    <ChevronDown className={styles.chevronIcon} size={18} />
                                </button>
                                {/* Dropdown Menu */}
                                {isFilterOpen && (
                                    <div className={styles.filterDropdown} data-filter-dropdown>
                                        <button onClick={() => { setSortBy('a-z'); setIsFilterOpen(false); }}>Sort A–Z</button>
                                        <button onClick={() => { setSortBy('z-a'); setIsFilterOpen(false); }}>Sort Z–A</button>
                                        <button onClick={() => { setSortBy('recent'); setIsFilterOpen(false); }}>Recent</button>
                                        <button onClick={() => { setSortBy('oldest'); setIsFilterOpen(false); }}>Oldest</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Smart Insights Panel (desktop only) */}
                <div className={`${styles.insightsPanel} ${styles.desktopOnly}`}> <div className={styles.insightsContent}></div> </div>

                {/* Content Area */}
                <div className={styles.tabsContainer}>
                    {/* Navigation Tabs */}
                    <div className={styles.tabs}>
                        {/* Messages Link */}
                        <button onClick={() => router.push('/dashboard/messages')} className={styles.tabButton}>Messages</button>

                        {/* Leads Link */}
                        <button onClick={() => router.push('/dashboard/contacts')} className={styles.tabButton}>Leads</button>

                        {/* Active Page Tabs */}
                        <button onClick={() => handleTabClick('connections')} className={`${styles.tabButton} ${activeTab === 'connections' ? styles.tabButtonActive : ''}`}>
                            Connections
                        </button>

                        <button onClick={() => handleTabClick('requests')} className={`${styles.tabButton} ${activeTab === 'requests' ? styles.tabButtonActive : ''}`} >
                            Requests
                            {hasUnreadRequests && <span className={styles.notificationDot}></span>}
                        </button>
                    </div>

                    {/* View Toggle Row - Positioned Below Tabs */}
                    {activeTab === "connections" && (
                        <div className={styles.viewToggleRow}>
                            <div className={styles.viewTogglePill}>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`${styles.viewIconBtn} ${viewMode === "table" ? styles.viewIconActive : ""
                                        }`}
                                >
                                    {/* table icon */}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="8" y1="6" x2="21" y2="6" />
                                        <line x1="8" y1="12" x2="21" y2="12" />
                                        <line x1="8" y1="18" x2="21" y2="18" />
                                        <line x1="3" y1="6" x2="3.01" y2="6" />
                                        <line x1="3" y1="12" x2="3.01" y2="12" />
                                        <line x1="3" y1="18" x2="3.01" y2="18" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setViewMode("cards")}
                                    className={`${styles.viewIconBtn} ${viewMode === "cards" ? styles.viewIconActive : ""
                                        }`}
                                >
                                    {/* grid icon */}
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}


                    {activeTab === "connections" ? (viewMode === "table" ? (
                        /* Table View */
                        <div className={styles.tableViewContainer}>
                            <div className={styles.tableViewContainer}>
                                <div className={styles.cardListWrapper}>
                                    {sortedContacts.map((contact) => (
                                        <div key={contact.id} className={styles.connectionCard}>
                                            {/* Left: Avatar with Glow Effect */}
                                            <div className={styles.avatarContainer}>
                                                <div className={styles.avatarGlow} style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span className={styles.avatarText}>{getInitials(contact.name)}</span>
                                                    {contact.avatar && (
                                                        <img
                                                            src={contact.avatar}
                                                            alt={contact.name}
                                                            className={styles.cardAvatarImage}
                                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Middle: Name, Title, and Company */}
                                            <div className={styles.cardInfo}>
                                                <button onClick={() => setPreviewContact(contact)} className={styles.contactNameLink}>
                                                    {contact.name}
                                                </button>
                                                <p className={styles.contactTitle}> {contact.title || "Full Stack Developer"} </p>
                                                <p className={styles.contactCompany}> {contact.company || "Boostnow solutions"} </p>
                                            </div>

                                            {/* Right: Actions (More and Message) */}
                                            <div className={styles.cardActions}>
                                                <div className={styles.relativeContainer}>
                                                    <button onClick={() => setOpenDropdown(openDropdown === contact.id ? null : contact.id)}
                                                        className={styles.moreButton} >
                                                        <MoreHorizontal size={20} />
                                                    </button>

                                                    {openDropdown === contact.id && (
                                                        <div className={styles.dropdownMenu}>
                                                            <button onClick={() => handleDeleteConnection(contact.id)} className={styles.dropdownItemDelete} >
                                                                Delete Connection
                                                            </button>
                                                        </div>)}
                                                </div>

                                                <button onClick={() => handleDirectMessage(contact)} className={styles.messageIconButton}
                                                    aria-label="Message">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>))}
                                </div>
                            </div>
                        </div>
                    ) : (

                        /* Cards View */
                        <div className={styles.cardsViewContainer}>
                            <div className={styles.cardsWrapper}>
                                <div className={styles.cardsGrid}>
                                    {sortedContacts.map((contact, index) => (
                                        <div key={contact.id} className={styles.modernCard}>
                                            {/* 1. Top Banner - Color rotates based on index */}
                                            <div className={`${styles.cardBanner} ${styles[`bannerColor${(index % 4) + 1}`]}`}>
                                                {/* Avatar with Glow - Positioned to overlap the banner and body */}
                                                <div className={styles.avatarGlowContainer}>
                                                    <div className={styles.avatarGlow} style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span className={styles.avatarText}>{getInitials(contact.name)}</span>
                                                        {contact.avatar && (
                                                            <img
                                                                src={contact.avatar}
                                                                alt={contact.name}
                                                                className={styles.cardAvatarImage}
                                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Professional Badge - Matches the green label in image_0bf90a.jpg */}
                                            <div className={styles.badgeWrapper}> <span className={styles.professionalBadge}>Professional</span> </div>

                                            {/* 3. Action Icons - Phone, Email, Message */}
                                            <div className={styles.quickActionsRow}>
                                                <button className={styles.actionCircleBtn} title="Call" aria-label="Call"> <Phone size={16} /> </button>
                                                <button className={styles.actionCircleBtn} title="Email" aria-label="Email" onClick={() => window.location.href = `mailto:${contact.email}`}>
                                                    <Mail size={16} />
                                                </button>
                                                <button className={styles.actionCircleBtn} title="Message" aria-label="Message" onClick={() => handleDirectMessage(contact)} >
                                                    <Send size={16} />
                                                </button>
                                            </div>

                                            {/* 4. Card Info Box - Centered text as per image_1c46c2.png */}
                                            <div className={styles.cardInfoBox}>
                                                <h3 className={styles.contactNameLink}>{contact.name}</h3>
                                                <p className={styles.contactTitle}>{contact.title}</p>
                                                <p className={styles.contactCompany}>{contact.company}</p>

                                                {/* Optional Tags for context */}
                                                {/* <div className={styles.tagRow}>
                                        {contact.tags?.slice(0, 2).map((tag, i) => (
                                            <span key={i} className={`${styles.cardTag} ${getTagClass(tag)}`}>{tag}</span>
                                        ))}
                                        </div> */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                    ) : (

                        /* Requests View */
                        <div className={styles.requestsViewContainer}>
                            {/* Requests list */}
                            {connectionRequests.length > 0 ? (
                                <div className={`${styles.requestsList}  flex flex-col gap-1 sm:gap-4 lg:max-w-4xl lg:mx-auto`}>
                                    {connectionRequests.map((request) => (
                                        <div key={request.id} className={`${styles.requestCard} flex items-center justify-between  sm:p-4 lg:p-5  bg-white`}>
                                            {/* Left user info */}
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className={styles.requestAvatar} style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span className={styles.avatarText}>{getInitials(request.name)}</span>
                                                    {request.avatar && (
                                                        <img
                                                            src={request.avatar}
                                                            alt={request.name}
                                                            className={styles.avatarImage}
                                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    )}
                                                </div>

                                                <div className="flex flex-col">
                                                    <h4 className={styles.requestName}>{request.name}</h4>
                                                    <p className={styles.requestDetails}> {request.title} at {request.company} </p>
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className={`${styles.requestActions} flex flex-row gap-2 sm:gap-3`}>
                                                {/* Accept */}
                                                <button onClick={() => openApproveModal(request)} className={`${styles.requestApproveButton} flex items-center justify-center`}>
                                                    {/* Mobile icon */}
                                                    <span className="sm:hidden">  <Check size={18} /> </span>
                                                    {/* Desktop text */}
                                                    <span className="hidden sm:inline">Accept</span>
                                                </button>
                                                {/* Delete */}
                                                <button onClick={() => handleRejectRequest(request.id)} className={`${styles.requestRejectButton} flex items-center justify-center`}>
                                                    {/* Mobile icon */}
                                                    <span className="sm:hidden"> <Trash2 size={18} /> </span>
                                                    {/* Desktop text */}
                                                    <span className="hidden sm:inline">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noRequestsText}>  No pending connection requests </p>)}
                        </div>
                    )}
                </div>

                {/* Message Modal */}
                {messageModal.isOpen && messageModal.contact && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}> New Message to {messageModal.contact.name} </h3>
                                <button onClick={handleCloseMessageModal} className={styles.modalCloseButton}>
                                    <X className={styles.modalCloseIcon} />
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)}
                                    placeholder={`Type your message to ${messageModal.contact.name}...`} className={styles.modalTextarea} />
                            </div>
                            <div className={styles.modalFooter}>
                                <button onClick={handleCloseMessageModal} className={styles.modalCancelButton}>
                                    Cancel
                                </button>

                                <button onClick={handleSendMessage} disabled={!messageText.trim()} className={styles.modalSendButton}>
                                    <Send className={styles.modalSendIcon} /> Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approve Confirmation Modal */}
                {approveModal.isOpen && approveModal.request && (
                    <Modal isOpen={approveModal.isOpen} onClose={closeApproveModal} title={`Approve connection with ${approveModal.request.name}?`}
                        showActions={false} >
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <p className={styles.modalBody}>
                                Approving will allow this person to connect with you and see
                                your card information, including your phone number, email, job
                                title, and other shared details.
                            </p>
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button onClick={closeApproveModal} className={styles.modalCancelButton} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button onClick={() => { const id = approveModal.request!.id; closeApproveModal(); handleApproveRequest(id); }}
                                    className={styles.modalSendButton} style={{ flex: 1 }}>
                                    Approve
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </main>
    );
}

export default function DashboardContactPageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContactPage />
        </Suspense>
    );
}