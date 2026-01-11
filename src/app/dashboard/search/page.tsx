"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { Search, ChevronDown } from "lucide-react";
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
  const [activeCardId, setActiveCardId] = useState<string | null>(null);


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
  const [showFilter, setShowFilter] = useState(false);
  const [tempCategory, setTempCategory] = useState(activeCategory);
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

  // 🔹 CASE 1: NO SEARCH, BUT CATEGORY SELECTED
  if (!raw && activeCategory !== "All") {
    return profiles.filter(p => getMainCategory(p) === activeCategory);
  }

  // CASE 2: NO SEARCH + ALL → show all
if (!raw && activeCategory === "All") {
  return profiles.slice(0, 50);
}


  // 🔹 SEARCH LOGIC (UNCHANGED)
  let keywordsPart = raw;
  let locationPart = "";

  const inIdx = raw.lastIndexOf(" in ");
  if (inIdx > -1) {
    keywordsPart = raw.slice(0, inIdx).trim();
    locationPart = raw.slice(inIdx + 4).trim();
  }

  const keywords = keywordsPart.split(/\s+/).filter(Boolean);

  return profiles.filter((p) => {
    // Category filter
    if (activeCategory !== "All") {
      const mainCategory = getMainCategory(p);
      if (mainCategory !== activeCategory) return false;
    }

    const hay = `${p.name} ${p.designation ?? ""} ${p.company ?? ""} ${p.category ?? ""} ${p.city ?? ""}`.toLowerCase();
    const city = (p.city || "").toLowerCase();

    const keywordsMatch =
      keywords.length === 0 || keywords.every(k => hay.includes(k));
    const locationMatch =
      !locationPart || city.includes(locationPart);

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
          padding: 5px 10px; 
          border-radius: 4px; 
          font-weight: 500; 
          font-size: 0.9rem; 
           
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

/* ================= FIGMA-ACCURATE CONNECT & PLUS BUTTON ================= */

/* + button (23x23 exactly like Figma) */
.plusBtn {
  width: 15px;
  height: 15px;

  background: #225BE4 !important;
  color: #ffffff !important;
  border: none !important;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  font-weight: 700;
  line-height: 1;

  cursor: pointer;
  padding: 0;
}

/* Connect + button (compact pill) */
.connect.expand {
  height: 23px;
  padding: 0 8px;

  background: #225BE4 !important;
  color: #ffffff !important;
  border: none !important;

  border-radius: 6px;

  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;

  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Hover (desktop) */
.plusBtn:hover,
.connect.expand:hover {
  background: #1d4ed8 ;
}

/* Tap / active (mobile) */
.plusBtn:active,
.connect.expand:active {
  transform: scale(0.95);
}
/* ===== FILTER DROPDOWN (VERTICAL) ===== */

.filterDropdown {
  position: absolute;
  top: 56px;              /* filter button ke neeche */
  right: 0;
  width: 220px;

  background: #ffffff;
  border-radius: 12px;
  padding: 10px;

  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  border: 1px solid #E2E8F0;
  z-index: 1000;
}

/* vertical list */
.filterList {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
}

/* single item */
.filterItem {
  text-align: left;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;

  background: transparent;
  font-size: 14px;
  color: #1E293B;
  cursor: pointer;
}

.filterItem:hover {
  background: #F1F5F9;
}

.filterItem.active {
  background: #225BE4;
  color: #ffffff;
}

/* footer buttons */
.filterActions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  border-top: 1px solid #E2E8F0;
  padding-top: 8px;
}

.clearFilterBtn {
  background: none;
  border: none;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
}

.applyFilterBtn {
  background: #225BE4;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}




        /* utility spinner keyframes */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #ffffffff 0%, #7d9fdaff 40%, #2562a8ff 100%)", }}>






        <div className="figmaContainer">
          {/* Search Container */}
          <div className="search-container" style={{ background: "transparent", borderRadius: 0, padding: "0", margin: "6px 0 8px 0", boxShadow: "none", border: "none" }}>
            <div className="left relative">
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  position: "relative"   // ⭐ VERY IMPORTANT
                }}
              >
                {/* Search Input */}
                <div className="left relative" style={{ flex: 1 }}>
                  <div className="icon">
                    <Search style={{ width: 16, height: 16, color: "#94A3B8" }} />
                  </div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for Connections..."
                    aria-label="Search"
                  />
                </div>

                {/* Filter Button */}{/*
                <button
               
                onClick={() => setShowFilter(prev => !prev)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "44px",
                    minWidth: "72px",
                    padding: "0 14px",
                    gap: "6px",
                    background: "#ffffff",
                    border: "1.5px solid #CBD5E1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  Filter
                  <ChevronDown size={16} />
                </button>*/}

                {/* 🔽 FILTER DROPDOWN – PASTE HERE */}
                {showFilter && (
                  <div className="filterDropdown">
                    <div className="filterList">
                      {["All", "Developer", "Designer", "Data", "Management", "Healthcare", "Other"].map(cat => (
                        <button
                          key={cat}
                          className={`filterItem ${tempCategory === cat ? "active" : ""}`}
                          onClick={() => setTempCategory(cat as any)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="filterActions">
                      <button
                        className="clearFilterBtn"
                        onClick={() => {
                          setTempCategory("All");
                          setActiveCategory("All");
                          setShowFilter(false);
                        }}
                      >
                        Clear
                      </button>

                      <button
                        className="applyFilterBtn"
                        onClick={() => {
                          setActiveCategory(tempCategory);
                          setShowFilter(false);
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>


            {hasQuery && (
              <div className="meta">
                Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </div>
            )}

          </div>
          {/* RESULTS CONTAINER – FIGMA STYLE */}
          <div className="resultsContainer" style={{  margin: "", background: "#ffffff", borderRadius: "30px", padding: "12px", boxShadow: "0 8px 20px rgba(103,141,223,0.18)", border: "1px solid #E6EDFF", }}>

            <div className="grid" style={{ marginTop: 12 }}>


              {/* 🔹 Suggested Profiles */}
              {!hasQuery &&
                suggestedProfiles.map((p, i) => (
                  <div
                    key={`suggested-${p.username}-${i}`}
                    className={`card ${activeCardId === p.id ? "active" : ""}`}
                    onMouseEnter={() => setActiveCardId(p.id)}
                    onMouseLeave={() => setActiveCardId(null)}
                    onClick={() => setActiveCardId(p.id)}
                  >
                    <div className="card-info">
                      <div className="avatar">
                        {p.profileImage ? (
                          <img src={p.profileImage} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        ) : (getInitials(p.name || "User"))
                        }
                      </div>
                      <div className="text-block">
                        <div className="name truncate-1">{p.name}</div>
                        {p.designation && (<div className="designation truncate-1">{p.designation}</div>)}
                        {p.company && (<div className="company truncate-1">{p.company}</div>)}
                        <div className="city truncate-1">{p.city}</div>
                      </div>
                    </div>

                    <div className="card-action">
                      {/* DEFAULT: SHOW + */}
                      {!acceptedConnections.has(p.id) &&
                        !sentRequests.has(p.id) &&
                        activeCardId !== p.id && (
                          <button className="plusBtn">+</button>
                        )}

                      {/* HOVER / TAP: CONNECT + */}
                      {!acceptedConnections.has(p.id) &&
                        !sentRequests.has(p.id) &&
                        activeCardId === p.id && (
                          <button
                            className="connect expand"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnect(p.id, p.name);
                            }}
                            disabled={connectingUserId === p.id}
                          >
                            Connect +
                          </button>
                        )}

                      {/* SENT */}
                      {sentRequests.has(p.id) && (
                        <button className="connect sent" disabled>
                          Sent
                        </button>
                      )}

                      {/* CONNECTED */}
                      {acceptedConnections.has(p.id) && null}
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
                  <div
                    key={`${p.username}-${i}`}
                    className={`card ${activeCardId === p.id ? "active" : ""}`}
                    onMouseEnter={() => setActiveCardId(p.id)}
                    onMouseLeave={() => setActiveCardId(null)}
                    onClick={() => setActiveCardId(p.id)}
                  >
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
                      {/* DEFAULT: + */}
                      {!acceptedConnections.has(p.id) &&
                        !sentRequests.has(p.id) &&
                        activeCardId !== p.id && (
                          <button className="plusBtn">+</button>
                        )}

                      {/* HOVER / TAP: CONNECT + */}
                      {!acceptedConnections.has(p.id) &&
                        !sentRequests.has(p.id) &&
                        activeCardId === p.id && (
                          <button
                            className="connect expand"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnect(p.id, p.name);
                            }}
                          >
                            Connect +
                          </button>
                        )}

                      {/* SENT */}
                      {sentRequests.has(p.id) && (
                        <button className="connect sent" disabled>
                          Sent
                        </button>
                      )}

                      {/* CONNECTED */}
                     {acceptedConnections.has(p.id) && null}
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
    </div >

  )
}
