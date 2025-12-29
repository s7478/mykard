"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/modal";

type Profile = {
  id: string;
  username: string;
  name: string;
  city: string;
  company?: string;
  designation?: string;
  profileImage?: string;
  email?: string;
  phone?: string;
  about?: string;
  services?: string;
  skills?: string;
  category?: string;
  description?: string;
  verified?: boolean;
  views?: number;
};


export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );

}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

function SearchPageContent() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const dummyProfiles: Profile[] = [
    { id: "1", username: "arnav_wasnik", name: "Arnav Wasnik", designation: "Frontend Developer", company: "BoostNow Solutions", city: "Nagpur", category: "Technology", verified: true, views: 245, email: "arnav@example.com", phone: "+91 1234567890" },
    { id: "2", username: "sarthak_patil", name: "Sarthak Patil", designation: "Backend Engineer", company: "CredLink", city: "Pune", category: "Engineering", verified: true, views: 189, email: "sarthak@example.com", phone: "+91 9876543210" },
    { id: "3", username: "rohan_sharma", name: "Rohan Sharma", designation: "UI/UX Designer", company: "FigmaWorks", city: "Mumbai", category: "Design", verified: true, views: 312, email: "rohan@example.com", phone: "+91 5555555555" }
  ];

  //new category state
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [activeCategory, setActiveCategory] = useState<
    "All" | "Developer" | "Designer" | "Data" | "Management" | "Healthcare" | "Other"
  >("All");

  const CATEGORY_MAP: Record<string, string[]> = {
    // Technology & IT
    Developer: ["developer", "engineer", "frontend", "backend", "full stack", "fullstack", "software", "programmer", "dev", "web dev", "webdev"],
    "AI/ML Engineer": ["ai engineer", "machine learning", "ml engineer", "ai developer", "deep learning"],
    "Cloud/DevOps": ["cloud engineer", "devops", "cloud architect", "site reliability"],
    "Cybersecurity": ["cybersecurity", "security engineer", "infosec", "penetration tester", "ethical hacker"],
    "Game Development": ["game developer", "game design", "game programmer", "game artist"],
    "Mobile Development": ["mobile developer", "ios", "android", "react native", "flutter"],

    // Design & Creative
    Designer: ["designer", "graphic designer", "visual designer", "brand designer"],
    "UI/UX Design": ["ui/ux", "ui-ux", "ux/ui", "ux-ui", "user experience", "user interface", "interaction design"],
    "Creative Arts": ["artist", "illustrator", "animator", "3d artist", "digital artist", "motion graphics"],
    "Content Creation": ["content writer", "copywriter", "blogger", "content creator", "technical writer"],
    "Audio/Video": ["sound engineer", "audio engineer", "videographer", "video editor", "producer"],

    // Business & Management
    Management: ["manager", "director", "vp", "head of", "team lead", "cto", "ceo", "founder"],
    "Product Management": ["product manager", "product owner", "product lead"],
    "Project Management": ["project manager", "program manager", "delivery manager"],
    "Business Development": ["business development", "bizdev", "partnerships", "strategy"],
    "Sales & Marketing": ["sales", "marketing", "digital marketing", "growth hacker", "demand generation"],
    "HR & Recruiting": ["hr", "human resources", "recruiter", "talent acquisition", "hrbp"],

    // Data & Analytics
    Data: ["data"],  // Base category for all data-related roles
    "Data Science": ["data scientist", "data analyst", "data engineer", "data visualization", "bi analyst", "data science", "data analytics", "big data"],
    "AI/ML Research": ["ai researcher", "ml researcher", "research scientist", "applied scientist", "machine learning engineer", "deep learning"],
    "Business Intelligence": ["bi developer", "business analyst", "data analytics", "reporting analyst", "bi analyst", "business intelligence", "data warehousing"],
    "Data Engineering": ["data engineer", "etl developer", "data pipeline", "data integration", "data architecture"],
    "Data Analysis": ["data analyst", "business analyst", "financial analyst", "market research analyst", "data specialist"],
    "Statistics & Analytics": ["statistician", "data modeler", "quantitative analyst", "risk analyst", "statistical analyst", "research analyst"],
    "Database Administration": ["dba", "database administrator", "database developer", "sql developer", "data architect"],

    // Engineering
    "Software Engineering": ["software engineer", "full stack", "backend", "frontend", "systems"],
    "Hardware Engineering": ["hardware engineer", "embedded systems", "fpga", "asic"],
    "Mechanical Engineering": ["mechanical engineer", "mechatronics", "robotics"],
    "Civil Engineering": ["civil engineer", "structural engineer", "construction"],
    "Electrical Engineering": ["electrical engineer", "electronics engineer", "power systems"],
    "Chemical Engineering": ["chemical engineer", "process engineer", "biochemical"],

    // Healthcare
    Healthcare: ["healthcare"],
    "Medical": ["doctor", "physician", "surgeon", "dentist", "veterinarian"],
    "Nursing": ["nurse", "rn", "nurse practitioner", "nursing assistant"],
    "Therapy": ["therapist", "psychologist", "counselor", "occupational therapist", "physiotherapist"],
    "Healthcare Support": ["pharmacist", "pharmacy technician", "paramedic", "emt"],

    // Finance & Legal
    "Finance": ["financial analyst", "accountant", "auditor", "cfo", "financial advisor"],
    "Banking": ["banker", "investment banker", "loan officer", "financial consultant"],
    "Legal": ["lawyer", "attorney", "paralegal", "legal counsel", "compliance officer"],
    "Insurance": ["actuary", "underwriter", "claims adjuster", "insurance agent"],

    // Education & Research
    "Education": ["teacher", "professor", "lecturer", "instructor", "tutor"],
    "Research": ["researcher", "scientist", "postdoc", "research assistant", "lab technician"],
    "Library Science": ["librarian", "archivist", "curator", "information specialist"],

    // Other Professions
    "Customer Service": ["customer support", "call center", "help desk", "service representative"],
    "Hospitality": ["hotel manager", "chef", "baker", "restaurant manager", "barista"],
    "Retail": ["retail manager", "store manager", "sales associate", "cashier"],
    "Trades": ["electrician", "plumber", "carpenter", "welder", "mechanic"],
    "Transportation": ["pilot", "truck driver", "delivery driver", "logistics manager"],
    "Public Service": ["police officer", "firefighter", "paramedic", "social worker"],

    // Specialized
    "Architecture": ["architect", "interior designer", "landscape architect", "urban planner"],
    "Agriculture": ["agricultural scientist", "farmer", "agronomist", "horticulturist"],
    "Environmental": ["environmental scientist", "sustainability", "conservation", "forest ranger"],
    "Media & Communication": ["journalist", "reporter", "editor", "pr executive", "social media manager"],
    "Entertainment": ["musician", "composer", "actor", "producer", "director"],
    "Aviation": ["pilot", "air traffic controller", "flight attendant", "aviation mechanic"]
  };

  function getMainCategory(p: Profile) {
    // First check the category field if it exists
    if (p.category) {
      const categoryLower = p.category.toLowerCase();
      for (const [group, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => categoryLower.includes(k.toLowerCase()))) {
          return group as keyof typeof CATEGORY_MAP;
        }
      }
    }

    // If no category or no match, check the designation
    if (p.designation) {
      const designationLower = p.designation.toLowerCase();
      for (const [group, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => designationLower.includes(k.toLowerCase()))) {
          return group as keyof typeof CATEGORY_MAP;
        }
      }
    }

    // If still no match, check the company name for common patterns
    if (p.company) {
      const companyLower = p.company.toLowerCase();
      for (const [group, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => companyLower.includes(k.toLowerCase()))) {
          return group as keyof typeof CATEGORY_MAP;
        }
      }
    }

    return "Other";
  }

  const [showModal, setShowModal] = useState(false);
  const [connectionName, setConnectionName] = useState("");
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [acceptedConnections, setAcceptedConnections] = useState<Set<string>>(new Set());
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);


  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const q = new URL(window.location.href).searchParams.get("q") || "";
      setQuery(q);
    } catch { setQuery(""); }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/profile/getuser", {
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch users");
        }

        const data = await response.json();

        // If the response is an array, use it directly, otherwise look for a 'users' property
        const users = Array.isArray(data) ? data : (data.users || []);

        const mappedProfiles: Profile[] = users.map((user: any) => ({
          id: user.id,
          username: user.username || user.email?.split('@')[0] || `user-${Math.random().toString(36).substr(2, 5)}`,
          name: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'User',
          city: user.location || user.city || 'Unknown',
          company: user.company || user.organization || '',
          designation: user.designation || user.title || user.role || '',
          category: user.category || user.industry || '',
          profileImage: user.profileImage || user.avatar || user.image || '',
          email: user.email || '',
          phone: user.phone || user.phoneNumber || '',
          verified: user.verified || user.emailVerified || false,
          reviews: user.reviews || user.ratingCount || 0,
          views: user.views || user.impressions || 0,
        }));

        // Only update profiles if we got actual data, otherwise keep the dummy data
        if (mappedProfiles.length > 0) {
          setProfiles(mappedProfiles);
        } else {
          console.warn('No user profiles found, using dummy data');
          setProfiles(dummyProfiles);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback to dummy data in case of error
        setProfiles(dummyProfiles);

        // Show error toast to the user
        toast.error(error instanceof Error ? error.message : 'Failed to load user profiles');
      } finally {
        setLoading(false);
      };
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const loadConnectionStatuses = async () => {
      try {
        const acceptedRes = await fetch('/api/users/connections?type=accepted', { credentials: 'include' });
        if (acceptedRes.ok) {
          const { requests } = await acceptedRes.json();
          const ids = new Set<string>((requests || []).map((r: any) => r.user?.id).filter(Boolean));
          setAcceptedConnections(ids);
        }
        const sentRes = await fetch('/api/users/connections?type=sent', { credentials: 'include' });
        if (sentRes.ok) {
          const { requests } = await sentRes.json();
          const ids = new Set<string>((requests || []).map((r: any) => r.receiver?.id).filter(Boolean));
          setSentRequests(ids);
        }
      } catch (e) { console.error('Failed to load connection statuses', e); }
    };
    loadConnectionStatuses();
    const handler = () => loadConnectionStatuses();
    if (typeof window !== 'undefined') {
      window.addEventListener('connections-updated', handler);
      return () => window.removeEventListener('connections-updated', handler);
    }
  }, []);

  const handleConnect = async (userId: string, name: string) => {
    try {
      setConnectingUserId(userId);
      const response = await fetch("/api/users/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId: userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to connect");
      setConnectionName(name);
      setShowModal(true);
      setSentRequests(prev => new Set([...prev, userId]));
      toast.success(`Connection request sent to ${name}!`);
    } catch (error: any) {
      console.error("Connection error:", error);
      toast.error(error.message || "Failed to send connection request");
    } finally { setConnectingUserId(null); }
  };

  const hasQuery = query.trim().length > 0 || activeCategory !== "All";
  const filtered = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return [];
    let keywordsPart = raw;
    let locationPart = "";
    const inIdx = raw.lastIndexOf(" in ");
    if (inIdx > -1) {
      keywordsPart = raw.slice(0, inIdx).trim();
      locationPart = raw.slice(inIdx + 4).trim();
    }
    if (!locationPart) {
      const parts = raw.split(",").map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        keywordsPart = parts[0];
        locationPart = parts.slice(1).join(", ");
      }
    }
    const keywords = keywordsPart.split(/\s+/).filter(Boolean);

    // If no search query and no category filter, return empty array or all profiles based on your preference
    if (keywords.length === 0 && !locationPart && activeCategory === "All") {
      return []; // or return [...profiles] if you want to show all profiles by default
    }

    return profiles.filter((p) => {
      // Category filter
      if (activeCategory !== "All") {
        const mainCategory = getMainCategory(p);
        if (mainCategory !== activeCategory) return false;
      }

      const hay = `${p.name} ${p.designation ?? ""} ${p.company ?? ""} ${p.category ?? ""} ${p.city ?? ""}`.toLowerCase();
      const city = (p.city || "").toLowerCase();
      const keywordsMatch = keywords.length === 0 || keywords.every(k => hay.includes(k));
      const locationMatch = !locationPart || city.includes(locationPart);
      return keywordsMatch && locationMatch;
    }).slice(0, 50);
  }, [query, profiles, activeCategory]);


  const suggestedProfiles = useMemo(() => {
    if (!profiles || profiles.length === 0) return [];
    if (!profiles || profiles.length === 0) return [];

    return profiles
      .filter(
        (p) =>
          p.designation?.toLowerCase().includes("developer") ||
          p.category?.toLowerCase().includes("software")
      )
      .slice(0, 6);
  }, [profiles]);



  return (
    <div style={{ position: "relative", overflowX: "hidden", minHeight: "100vh" }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(1200px 600px at 10% 10%, rgba(99,102,241,0.04), transparent 10%), radial-gradient(800px 400px at 90% 90%, rgba(34,211,238,0.03), transparent 10%)"
      }}></div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }`}
      </style>
      <style jsx global>{`
        /* Ensure mobile viewport scaling */
        @media (max-width: 640px) {
          html {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          
          /* Improve touch targets */
          button, [role="button"], input[type="submit"], input[type="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
      <style>{`
        /* Core responsive & futuristic styles inline so you can paste this file directly */
        .wrap { position: relative; z-index: 10; max-width: 1200px; padding: 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        .header { display:flex; flex-direction: column; align-items:center; text-align:center; margin-bottom: 8px; }
        .title { font-size: 1.5rem; font-weight: 600; color: #111827; line-height: 1.2; margin: 0 0 0.25rem; }
        .subtitle { color: #64748b; font-size: 0.9rem; line-height: 1.4; max-width: 600px; margin: 0 auto; }
        .search-panel { margin-top:18px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border-radius:14px; padding:14px; border:1px solid rgba(0,0,0,0.04); box-shadow: 0 10px 30px rgba(2,6,23,0.08); overflow: visible; }

        .left { flex:1; position:relative; }
        .left input { width:100%; padding:12px 16px 12px 44px; border-radius:8px; border:1px solid #E2E8F0; background: #f8fafc; color:#0F172A; font-size:14px; outline:none; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease; }
        .left input:focus { outline: none; border-color: #E2E8F0; box-shadow: none; }
        .left input::placeholder { color: rgba(15,23,42,0.4); }

        .icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); opacity:0.85; }

        .meta { margin-top: 12px; color: #64748b; font-size: 0.9rem; }

        /* cards grid */
        .grid { margin-top:20px; display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
        .card { 
          border-radius: 12px; 
          padding: 1rem; 
          background: #fff; 
          border: 1px solid rgba(0,0,0,0.04); 
          box-shadow: 0 4px 12px rgba(2,6,23,0.04); 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          gap: 1rem; 
          min-height: auto;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .card:active {
          transform: translateY(1px);
          box-shadow: 0 2px 6px rgba(2,6,23,0.04);
        }
        .avatar { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:22px; color:#fff; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); box-shadow: 0 6px 18px rgba(99,102,241,0.08); overflow:hidden; }
        .name { font-weight: 600; font-size: 0.95rem; color: #1e293b; margin: 0; }
        .designation { font-size: 0.9rem; color: #64748b; margin-top: 1px; }
        .company { font-size: 0.9rem; color: #94a3b8; margin-top: 1px; }
        .city { font-size: 0.9rem; color: #94a3b8; margin-top: 1px; }

        .connect { 
          padding: 8px 16px; 
          border-radius: 8px; 
          font-weight: 500; 
          font-size: 0.9rem; 
          border: 1px solid #e2e8f0; 
          background: #f8fafc; 
          color: #334155; 
          cursor: pointer; 
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .connect:hover { background: #f1f5f9; }
        .connect:active { background: #e2e8f0; }

        /* responsive: small screens (mobile phones) */
        /* Mobile-first responsive styles */
        @media (max-width: 640px) {
          .search-container {
            padding: 10px;
            margin: 0 -0.5rem 2px;
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
          
          .left input {
            padding: 12px 16px 12px 42px;
            font-size: 16px;
            -webkit-appearance: none;
          }
          
          .icon { left: 14px;}
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .search-container { padding: 14px;}
        }
        
        @media (max-width: 720px) {
          .wrap { padding: 0 0.5rem 20px; }
          .header { margin-bottom: 0.25rem; }
          .title { 
            font-size: 1.2rem; 
            margin-bottom: 0.25rem; 
            line-height: 1.1;
          }
          .left { margin-top: 0.25rem; }
          .left input { 
            padding: 10px 14px 10px 40px; 
            font-size: 0.95rem;
            border-radius: 8px;
          }
          .left input::placeholder { font-size: 0.9rem; }
          .meta { 
            font-size: 0.85rem; 
            margin: 0.5rem 0 0.5rem;
            padding: 0;
          }
          .grid { 
            margin-top: 0.75rem;
            gap: 0.6rem;
            padding-bottom: 0.5rem;
            display: flex;
            flex-direction: column;
          }
          .card { 
            padding: 0.7rem;
            border-radius: 10px;
            min-height: auto;
            gap: 0.6rem;
          }
          .avatar { 
            width: 42px; 
            height: 42px; 
            font-size: 0.9rem;
            flex-shrink: 0;
          }
          .name {
            font-size: 0.95rem;
            font-weight: 600;
            line-height: 1.2;
          }
          .designation, .company, .city {
            font-size: 0.75rem;
            line-height: 1.2;
            margin-top: 1px;
          }
          .connect {
            padding: 6px 12px;
            font-size: 0.85rem;
            min-width: 80px;
            text-align: center;
            margin-left: auto;
          }
        }

        @media (max-width: 480px) {
          .wrap { padding: 0 0.5rem 20px; }
          .title { font-size: 1.25rem; }
          .subtitle { font-size: 0.78rem; margin-bottom: 0.4rem; }
          .card { padding: 0.6rem; gap: 0.6rem; }
          .avatar { width: 40px; height: 40px; font-size: 0.85rem; }
        }

        /* medium screens */
        @media (max-width: 1023px) and (min-width: 721px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
        }

       /* ---------- Text Truncation Utilities ---------- */
       
        .truncate-1 {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .truncate-2 {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          overflow: hidden;
        }

        .card-info {
          display: flex;
          gap: 12px;
          align-items: center;
          flex: 1;
          min-width: 0;   /* MOST IMPORTANT LINE */
        }



        /* ---------- Card Layout Fix ---------- */

.card {
  display: flex; align-items: center; justify-content: space-between;
}

.card-info {
  display: flex; align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0; /* MOST IMPORTANT */
}

.text-block {
  min-width: 0;
  flex: 1;
}

.card-action {
  flex-shrink: 0; /* button never shrinks */
  display: flex;
  align-items: center;
}

        /* utility spinner keyframes */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6">
        {/* Header Section */}
       <header className="relative text-center pt-6 sm:pt-8 md:pt-10 pb-1">
  <div className="hover-title inline-block cursor-pointer">
    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight whitespace-nowrap">
      Build Real <span className="text-[#225BE4]">Connections</span>
    </h1>

    <p className="subtitle-hover mt-1 text-sm text-gray-500 max-w-xs mx-auto leading-snug">
      Discover professionals and connect instantly
    </p>
  </div>
</header>






        {/* Search Container */}
        <div className="search-container" style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '12px',
          margin: '6px 0 2px 0',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}>

          {/* <div className="header">
            <div>
              <div className="title">Search Professionals</div>
              <div className="subtitle">Discover and connect with top professionals — quick, safe, and effortless.</div>
            </div>
          </div> */}


          <div className="left relative">
            <div className="icon"><Search style={{ width: 16, height: 16, color: "#94A3B8" }} /></div>
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, skills, company, or city..." aria-label="Search"
            />
          </div>


          <div
            style={{
              display: "flex", gap: 8, flexWrap: "nowrap", margin: "14px 0 0", alignItems: "center",
              overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "6px", scrollbarWidth: "none", msOverflowStyle: "none",
            }}
            className="hide-scrollbar"
          >
            {["All", "Developer", "Designer", "Data", "Management", "Healthcare", "Other"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  border: `1px solid ${activeCategory === cat ? '#225BE4' : '#E5E7EB'}`,
                  background: activeCategory === cat ? '#225BE4' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#4B5563',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {hasQuery && (
            <div className="meta">
              Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          )}

          <div className="grid" style={{ marginTop: 12 }}>

            {/* 🔹 Suggestions Heading */}
            {!hasQuery && suggestedProfiles.length > 0 && (
              <div style={{ gridColumn: "1 / -1", fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 6 }} >
                Suggestions based on profession
              </div>
            )}

            {/* 🔹 Suggested Profiles */}
            {!hasQuery &&
              suggestedProfiles.map((p, i) => (
                <div key={`suggested-${p.username}-${i}`} className="card" role="button" tabIndex={0} onClick={() => setSelectedProfile(p)}>
                  <div className="card-info">
                    <div className="avatar">
                      {p.profileImage ? (
                        <img src={p.profileImage} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                      ) : (getInitials(p.name || "User"))
                      }
                    </div>
                    <div className="text-block">
                      <div className="name truncate-1">{p.name}</div>
                      {p.designation && (<div className="designation truncate-2">{p.designation}</div>)}
                      {p.company && (<div className="company truncate-1">{p.company}</div>)}
                      <div className="city truncate-1">{p.city}</div>
                    </div>
                  </div>

                  <div className="card-action">
                    <button className="connect" onClick={(e) => { e.stopPropagation(); handleConnect(p.id, p.name); }}
                      disabled={connectingUserId === p.id || sentRequests.has(p.id) || acceptedConnections.has(p.id)}
                      style={
                        acceptedConnections.has(p.id)
                          ? { background: "#04c74cff", color: "#fff", cursor: "not-allowed" }
                          : sentRequests.has(p.id)
                            ? { background: "#0f48e4ff", color: "#fff", cursor: "not-allowed" }
                            : { background: "#225BE4", color: "#fff" }
                      }
                    >
                      {acceptedConnections.has(p.id)
                        ? "Connected"
                        : connectingUserId === p.id
                          ? "Connecting..."
                          : sentRequests.has(p.id)
                            ? "Sent"
                            : "Connect"}
                    </button>
                  </div>
                </div>
              )
              )
            }

            
      
      {loading ? (
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", padding: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", border: "4px solid rgba(99,102,241,0.12)", borderTopColor: "rgba(99,102,241,0.95)", animation: "spin 1s linear infinite" }} />
        </div>
        ) : (
              filtered.map((p, i) => (
                <div key={`${p.username}-${i}`} className="card" role="button" aria-label={p.name} onClick={() => setSelectedProfile(p)}>
                  <div className="card-info">
                    <div className="avatar">
                      {p.profileImage ? (
                        <img
                          src={p.profileImage}
                          alt={p.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                        />
                      ) : (
                        getInitials(p.name || "User")
                      )}
                    </div>

                    {/* <div className="text-block">
                      <div className="name">{p.name}</div>
                      {p.designation && <div className="designation">{p.designation}</div>}
                      {p.company && <div className="company">{p.company}</div>}
                      <div className="city">{p.city}</div>
                    </div> */}

                    <div className="text-block">
                      <div className="name truncate-1">{p.name}</div>
                      {p.designation && (
                        <div className="designation truncate-1">{p.designation}</div>
                      )}
                      {p.company && (
                        <div className="company truncate-1">{p.company}</div>
                      )}
                      <div className="city truncate-1">{p.city}</div>
                    </div>

                  </div>

                  <div className="card-action">
                    <button
                      className="connect"
                      onClick={(e) => { e.stopPropagation(); handleConnect(p.id, p.name); }}
                      disabled={connectingUserId === p.id || sentRequests.has(p.id) || acceptedConnections.has(p.id)}
                      style={
                        acceptedConnections.has(p.id)
                          ? { background: "#04c74cff", color: "#fff", cursor: "not-allowed", boxShadow: "none" }
                          : sentRequests.has(p.id)
                            ? { background: "#0f48e4ff", color: "#fff", cursor: "not-allowed", boxShadow: "none" }
                            : { background: "#225BE4", color: "#fff" }
                      }
                    >
                      {acceptedConnections.has(p.id)
                        ? "Connected"
                        : connectingUserId === p.id
                          ? "Connecting..."
                          : sentRequests.has(p.id)
                            ? "Sent"
                            : "Connect"}
                    </button>
                  </div>
                </div>
              ))
            )}

            {!loading && hasQuery && filtered.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 22, color: "#64748B" }}>
                No results found. Try different keywords.
              </div>
            )}
          </div>
        </div> {/* End of Search Container */}

        {/* Decorative svg filter */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
          <svg width="0" height="0" style={{ position: "absolute" }}>
            <defs>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="12" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
          </svg>
        </div>


        {/* {selectedProfile && (
          <Modal
    isOpen={true}
    onClose={() => setSelectedProfile(null)}
    title={selectedProfile.name}
    primaryText="Close"
    message={
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        <div><strong>Location:</strong> {selectedProfile.city}</div>

        {selectedProfile.company && (
          <div><strong>Company:</strong> {selectedProfile.company}</div>
        )}

        {selectedProfile.designation && (
          <div><strong>Designation:</strong> {selectedProfile.designation}</div>
        )}

        {/* Description (from DigitalCardPreview → about) 
        {selectedProfile.about && (
          <div>
            <strong>About</strong>
            <p style={{ marginTop: 4, color: "#475569" }}>
              {selectedProfile.about}
            </p>
          </div>
        )} */}

        {/* Services (from DigitalCardPreview → services)
        {selectedProfile.services && (
          <div>
            <strong>Services</strong>
            <ul style={{ marginTop: 6, paddingLeft: 18 }}>
              {selectedProfile.services
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
            </ul>
          </div>
        )}

      </div>
    }
  /> 
)} */}

        {selectedProfile && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* 🔹 Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedProfile(null)}
            />

            {/* 🔹 Popup */}
            <div className="relative z-50">
              <Modal
                isOpen={true}
                onClose={() => setSelectedProfile(null)}
              >
                {/* popup content */}
              </Modal>
            </div>
          </div>
        )}




        {/* /* Modal unchanged (logic intact) */}
        {/* <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Connection Request Sent"
          message={<>Your connection request has been sent to <strong style={{ color: "#111827" }}>{connectionName}</strong>. They will be notified and can accept or reject your request.</>}
          primaryText="Close"
        /> */}



        {selectedProfile && (
          <Modal 
          isOpen={!!selectedProfile} onClose={() => setSelectedProfile(null)}>

            <div className="p-6 space-y-3">
              {/* Full Name */}
              <h2 className="text-xl font-semibold"> {selectedProfile.name} </h2>

              {/* Location */}
              {selectedProfile.city && (
                <p className="text-sm text-gray-600"> {selectedProfile.city} </p>
              )}

              {/* Company & Designation */}
              {(selectedProfile.company || selectedProfile.designation) && (
                <p className="text-sm">
                  {selectedProfile.designation}
                  {selectedProfile.company && ` ${selectedProfile.company}`}
                </p>
              )}

              {/* Description */}
              {selectedProfile.description && (
                <div>
                  <h4 className="font-medium mt-3">Description</h4>
                  <p className="text-sm text-gray-700"> {selectedProfile.description} </p>
                </div>
              )}

              {/* Services */}
              {selectedProfile.services && (
                <div>
                  <h4 className="font-medium mt-3">Services</h4>
                  <p className="text-sm text-gray-700"> {selectedProfile.services} </p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}
