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
  category?: string;
  profileImage?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  reviews?: number;
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

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
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
        const response = await fetch("/api/profile/getuser", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        const mappedProfiles: Profile[] = (data.users || []).map((user: any) => ({
          id: user.id,
          username: user.username || "user",
          name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User",
          city: user.location || "Unknown",
          company: user.company || undefined,
          designation: user.title || undefined,
          category: user.department || undefined,
          profileImage: user.profileImage || undefined,
          email: user.email || undefined,
          phone: user.phone || undefined,
          verified: user.status === "active",
          reviews: 0,
          views: user.views || 0,
        }));

        if (mappedProfiles.length === 0) setProfiles(dummyProfiles);
        else setProfiles(mappedProfiles);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
        setProfiles(dummyProfiles);
      } finally { setLoading(false); }
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

  const hasQuery = query.trim().length > 0;
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
    return profiles.filter((p) => {
      const hay = `${p.name} ${p.designation ?? ""} ${p.company ?? ""} ${p.category ?? ""} ${p.city ?? ""}`.toLowerCase();
      const city = (p.city || "").toLowerCase();
      const keywordsMatch = keywords.length === 0 || keywords.every(k => hay.includes(k));
      const locationMatch = !locationPart || city.includes(locationPart);
      return keywordsMatch && locationMatch;
    }).slice(0, 50);
  }, [query, profiles]);



  const suggestedProfiles = useMemo(() => {
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
    <div style={{ position: "relative", overflow: "visible", minHeight: "100vh" }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(1200px 600px at 10% 10%, rgba(99,102,241,0.04), transparent 10%), radial-gradient(800px 400px at 90% 90%, rgba(34,211,238,0.03), transparent 10%)"
      }} />

      <style>{`
        /* Core responsive & futuristic styles inline so you can paste this file directly */
        .wrap { position: relative; z-index: 10; max-width: 1200px;padding: 28px; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; }
        .header { display:flex; flex-direction: column; align-items:center; gap:8px; text-align:center; margin-bottom: 12px; }
        .title { font-size:28px; font-weight:700; color:#111827; line-height:1.05; margin-top:6px; text-align:center; }
        .subtitle { color:#9ca3af; font-size:14px; line-height:1.4; max-width: 600px; margin: 0 auto; letter-spacing: 0.3px; }
        .search-panel { margin-top:18px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border-radius:14px; padding:14px; border:1px solid rgba(0,0,0,0.04); box-shadow: 0 10px 30px rgba(2,6,23,0.08); overflow: visible; }

        .left { flex:1; position:relative; }
        .left input { width:100%; padding:12px 16px 12px 44px; border-radius:12px; border:1px solid #E2E8F0; background: #fff; color:#0F172A; font-size:14px; outline:none; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .left input::placeholder { color: rgba(15,23,42,0.4); }

        .icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); opacity:0.85; }

        .meta { margin-top:12px; color:#64748B; font-size:13px; }

        /* cards grid */
        .grid { margin-top:16px; display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
        .card { border-radius:12px; padding:12px; background:#fff; border:1px solid rgba(0,0,0,0.04); box-shadow:0 8px 28px rgba(2,6,23,0.06); display:flex; align-items:center; justify-content:space-between; gap:12px; gap:12px; min-height:92px; overflow: hidden; width: 100%;}
        .avatar { width:56px; height:56px; border-radius:50%; display:flex; 
        align-items:center; justify-content:center; font-weight:700; 
        font-size:22px; color:#fff; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
        box-shadow: 0 6px 18px rgba(99,102,241,0.08); overflow:hidden; }
        .name { font-weight:700; font-size:16px; color:#0F172A; margin:0; }
        .designation { font-size:13px; color:#64748B; margin:2px 0; }
        .company { font-size:13px; color:#94A3B8; margin:1px 0; }
        .city { font-size:13px; color:#94A3B8; margin-top:4px; }

        .connect { padding:10px 14px; border-radius:12px; font-weight:600; font-size:13px; 
        border:none; cursor:pointer; background: var(--gradient-primary); color:#071A52; 
        box-shadow:0 8px 26px rgba(99,102,241,0.08);  white-space: nowrap; min-width: 70px; }

        /* responsive: small screens (mobile phones) */
        @media (max-width: 720px) {
          .wrap { padding: 2px 1rem; padding-bottom: 80px; }
          .header { gap: 2px; margin-bottom: 8px; }
          .title { font-size:24px; }
          .subtitle { font-size: 0.8rem; }
          .left input { padding: 12px 16px 12px 44px; font-size:14px; margin-top: 2px; }
          .left input::placeholder { font-size:13px; }
          .meta { text-align:center; }
          .grid { grid-template-columns: 1fr; gap: 8px; }
          .card { display: flex, align-items:center; gap:8px; min-height: 80px; padding: 8px; overflow: hidden }
          .avatar { width:48px; height:48px; font-size:18px; }

          .connect { min-width: 70px; font-size: 12px; padding: 6px 8px;}
        }

        @media (max-width: 480px) {
          .wrap { padding: 2px 0.75rem; padding-bottom: 80px; }
          .subtitle { font-size: 0.75rem; }
          .card { min-height: 75px; padding: 6px; gap: 6px; }
          .avatar { width:44px; height:44px; font-size:16px; }
        }

        /* medium screens */
        @media (max-width: 980px) and (min-width: 721px) {
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

        /* utility spinner keyframes */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="wrap">
        <div className="header">
          <div>
            <div className="title">Search Professionals</div>
            <div className="subtitle">Discover and connect with top professionals — quick, safe, and effortless.</div>
          </div>
        </div>

        <div className="meta">
          {hasQuery
            ? `Showing ${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
            : "Search to see results"}
        </div>

        <div className="left" style={{ marginTop: 18 }}>
          <div className="icon"><Search style={{ width: 16, height: 16, color: "#94A3B8" }} /></div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, skills, company, or city..."
            aria-label="Search"
          />
        </div>

        

        {/*<div className="grid" style={{ marginTop: 12 }}>
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

                  <div style={{ minWidth: 0, flex: 1, width:"50%" }}>
                    <div className="name truncate-1" title={p.name}>{p.name}</div>
                    {p.designation && (<div className="designation truncate-2" title={p.designation}>{p.designation}</div>)}
                    {p.company && (<div className="company truncate-1" title={p.company}>{p.company}</div>)}
                    <div className="city" title={p.city}>{p.city}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", flexShrink: 0}}>
                  <button
                    className="connect"
                    onClick={(e) => { e.stopPropagation(); handleConnect(p.id, p.name); }}
                    disabled={connectingUserId === p.id || sentRequests.has(p.id) || acceptedConnections.has(p.id)}
                    style={
                      acceptedConnections.has(p.id)
                        ? { background: "#04c74cff", color: "#fff", cursor: "not-allowed", boxShadow: "none" }
                        : sentRequests.has(p.id)
                        ? { background: "#0f48e4ff", color: "#fff", cursor: "not-allowed", boxShadow: "none" }
                        : { color: "#fff" }
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
        </div> */}

      
         <div className="grid" style={{ marginTop: 12 }}>
          {loading ? (
            /* 🔄 Loader */
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", padding: 28 }} >
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: "4px solid rgba(99,102,241,0.12)", borderTopColor: "rgba(99,102,241,0.95)", animation: "spin 1s linear infinite"}}/>
            </div>
          ) : (
        <>
        
        {/* 🔹 SUGGESTED PROFILES */}
        {!hasQuery && suggestedProfiles.length > 0 && (
          <div style={{gridColumn: "1 / -1", fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 6}}> Suggestions based on profession</div>)}

        {!hasQuery && suggestedProfiles.map((p, i) => (
          <div
            key={`suggested-${p.username}-${i}`}
            className="card"
            role="button"
            aria-label={p.name}
            onClick={() => setSelectedProfile(p)}
          >
          <div className="card-info">
            <div className="avatar">
              {p.profileImage ? (
                <img src={p.profileImage} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}/>
              ) : (getInitials(p.name || "User"))
              }
            </div>

             <div style={{ minWidth: 0, flex: 1, width: "50%" }}>
              <div className="name truncate-1" title={p.name}> {p.name} </div>
                {p.designation && (<div className="designation truncate-2" title={p.designation}> {p.designation} </div>)}
                {p.company && (<div className="company truncate-1" title={p.company}> {p.company} </div>)}
                <div className="city" title={p.city}> {p.city} </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <button className="connect" onClick={(e) => { e.stopPropagation(); handleConnect(p.id, p.name); }}
                disabled={ connectingUserId === p.id || sentRequests.has(p.id) || acceptedConnections.has(p.id) }
                style={
                  acceptedConnections.has(p.id)
                    ? { background: "#04c74cff", color: "#fff", cursor: "not-allowed", boxShadow: "none" }
                    : sentRequests.has(p.id)
                    ? { background: "#0f48e4ff", color: "#fff", cursor: "not-allowed", boxShadow: "none" }
                    : { color: "#fff" }
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
        ))}



      {/* 🔹 SEARCH RESULTS */}

      {hasQuery &&
        filtered.map((p, i) => (
          <div key={`${p.username}-${i}`}
            className="card" role="button" aria-label={p.name} onClick={() => setSelectedProfile(p)} >
            <div className="card-info">
              <div className="avatar">
                {p.profileImage ? (
                  <img src={p.profileImage} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                ) : ( getInitials(p.name || "User"))
                }
              </div>

              <div style={{ minWidth: 0, flex: 1, width: "50%" }}>
                <div className="name truncate-1" title={p.name}> {p.name} </div>
                {p.designation && (<div className="designation truncate-2" title={p.designation}> {p.designation} </div> )}
                {p.company && (<div className="company truncate-1" title={p.company}> {p.company} </div> )}
                <div className="city" title={p.city}> {p.city} </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <button
                className="connect"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConnect(p.id, p.name);
                }}
                disabled={ connectingUserId === p.id || sentRequests.has(p.id) || acceptedConnections.has(p.id) }
                style={
                  acceptedConnections.has(p.id)
                    ? { background: "#04c74cff", color: "#fff", cursor: "not-allowed", boxShadow: "none" }
                    : sentRequests.has(p.id)
                    ? { background: "#0f48e4ff", color: "#fff", cursor: "not-allowed", boxShadow: "none" }
                    : { color: "#fff" }
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


      {/* NO RESULTS MESSAGE */}
      {hasQuery && filtered.length === 0 && (<div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 22, color: "#64748B" }} > No results found. Try different keywords. </div>)}
    </>
  )}</div>
      
</div>

        {/* Decorative svg filter (kept for effect) */}
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

      {/* Modal unchanged (logic intact) */}
      {/* <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Connection Request Sent"
        message={<>Your connection request has been sent to <strong style={{ color: "#111827" }}>{connectionName}</strong>. They will be notified and can accept or reject your request.</>}
        primaryText="Close"
      /> */}

      {/* {selectedProfile && (
        <Modal 
        isOpen={true}
        onClose={() => setSelectedProfile(null)}
        title={selectedProfile.name}
        message={
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            
            <div><strong>Location:</strong> {selectedProfile.city}</div>

            {selectedProfile.company && (
              <div><strong>Company:</strong> {selectedProfile.company}</div>
            )}

            {selectedProfile.designation && (
              <div><strong>Designation:</strong> {selectedProfile.designation}</div>
            )}

            {selectedProfile.category && (
              <div><strong>Category:</strong> {selectedProfile.category}</div>
            )}

            {/* Placeholder — will connect dashboard section later */}
            {/* <div style={{ marginTop: 8, color: "#64748B" }}>
              Description & Services will appear here.
        </div>

      </div>
    }
    primaryText="Close"
  /> 
)}  */}


        {/* {selectedProfile && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    {/* Backdrop  
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setSelectedProfile(null)}
    />

    {/* Popup *
    <div className="relative z-50 animate-scaleIn">
      <Modal
        isOpen={true}
        onClose={() => setSelectedProfile(null)}
      >
        {/* popup content 
      </Modal>
    </div>
  </div>
)} */}
      
      
      {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 🔹 Backdrop (blur + dim background) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}/>

            {/* 🔹 Popup */}
            <div className="relative z-50 animate-popup">
              <Modal
              isOpen={true}
              onClose={() => setSelectedProfile(null)}
              title={selectedProfile.name}
              message={<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            
              {/* Location */}
              {selectedProfile.city && (<div> <strong>Location:</strong> {selectedProfile.city} </div>)}

              {/* Company */}
              {selectedProfile.company && (<div> <strong>Company:</strong> {selectedProfile.company}</div>)}

              {/* Designation */}
              {selectedProfile.designation && (<div> <strong>Designation:</strong> {selectedProfile.designation}</div>)}

              {/* Category */}
              {selectedProfile.category && (<div> <strong>Category:</strong> {selectedProfile.category} </div>)}

              {/* Placeholder for future */}
              <div style={{ marginTop: 8, color: "#64748B", fontSize: 13 }}> Description & Services will appear here </div>
            </div>
          }
        primaryText="Close"
      />
    </div>
  </div>
)}    
    </div>
  );
}