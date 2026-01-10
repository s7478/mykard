"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LocationSelect from "@/components/LocationSelect";

/* -------------------------------------------------
   DESIGN SYSTEM
   ------------------------------------------------- */
const theme = {
  colors: {
    bg: "#FFFFFF",
    primaryBlue: "#2152E5",
    cardGradient: "linear-gradient(109.79deg, rgba(79, 117, 230, 0.98) 16.59%, #1237A1 76.33%)",
    cardBorderLine: "#6AD2FF",
    avatarBg: "#1279E1",
    avatarBorder: "#A3D4FF",
    inputText: "#646464",
    inputBorder: "#767676",
    progressActive: "#1070FF",
    progressInactive: "#D9D9D9",
    shapePurple: "#8B7FFF",
    shapeCyan: "#5EC4E8",
    shapeGrey: "#718096",
  },
  font: "'Plus Jakarta Sans', sans-serif",
};

const ALL_PROFESSIONS = [
  "Accountant", "Actor", "Architect", "Art Director", "Artist", "Business Analyst", "Business Owner",
  "CEO", "CFO", "CTO", "Chef", "Civil Engineer", "Coach", "Consultant", "Content Creator", "Copywriter",
  "Data Analyst", "Data Scientist", "Dentist", "Designer", "Developer", "Doctor", "Editor", "Electrician",
  "Engineer", "Entrepreneur", "Event Planner", "Fashion Designer", "Filmmaker", "Financial Advisor",
  "Fitness Trainer", "Founder", "Freelancer", "Graphic Designer", "HR Manager", "Hair Stylist",
  "Interior Designer", "Investment Banker", "Journalist", "Lawyer", "Lecturer", "Marketing Manager",
  "Mechanic", "Musician", "Nurse", "Nutritionist", "Pharmacist", "Photographer", "Pilot", "Plumber",
  "Product Manager", "Professor", "Project Manager", "Psychologist", "Real Estate Agent", "Recruiter",
  "Researcher", "Sales Executive", "Sales Manager", "Scientist", "Social Media Manager", "Software Engineer",
  "Student", "Surgeon", "Teacher", "Therapist", "Translator", "UI/UX Designer", "Videographer", "Writer", "CUSTOM"
];

/* -------------------------------------------------
   IMAGE COMPRESSION UTILITY (Fixes Upload Failure)
   ------------------------------------------------- */
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // Resize large images to 800px width
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original if blob fails
          }
        }, "image/jpeg", 0.7); // Compress to 70% quality
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

/* -------------------------------------------------
   BACKGROUND SHAPES
   ------------------------------------------------- */
const BackgroundShapes = ({ step }: { step: number }) => {
  const getPositions = (s: number) => {
    const sequence = [
      [],
      [{ top: '4.39%', right: '-15.68%', rotate: -8.45 }, { top: '53.66%', right: '-10.45%', rotate: 9.75 }, { top: '73.01%', left: '-13.18%', rotate: -17.51 }],
      [{ top: '15%', right: '-20%', rotate: 10 }, { top: '35%', right: '-5%', rotate: -5 }, { top: '80%', left: '-5%', rotate: 20 }],
      [{ top: '-5%', right: '10%', rotate: -15 }, { top: '65%', right: '-25%', rotate: 25 }, { top: '10%', left: '-10%', rotate: -10 }],
      [{ top: '10%', right: '-25%', rotate: 45 }, { top: '25%', right: '-5%', rotate: 0 }, { top: '85%', left: '10%', rotate: -30 }],
      [{ top: '20%', right: '-10%', rotate: -15 }, { top: '70%', right: '-15%', rotate: 20 }, { top: '5%', left: '-15%', rotate: 5 }],
      [{ top: '-2%', right: '-5%', rotate: 10 }, { top: '45%', right: '-30%', rotate: -45 }, { top: '65%', left: '-5%', rotate: 15 }],
      [{ top: '25%', right: '-20%', rotate: 30 }, { top: '10%', right: '-10%', rotate: -10 }, { top: '90%', left: '-10%', rotate: 0 }],
      [{ top: '5%', right: '-25%', rotate: -5 }, { top: '50%', right: '-5%', rotate: 35 }, { top: '30%', left: '-20%', rotate: -25 }],
      [{ top: '15%', right: '-10%', rotate: 20 }, { top: '75%', right: '-20%', rotate: -15 }, { top: '5%', left: '-5%', rotate: 10 }],
      [{ top: '0%', right: '-15%', rotate: -10 }, { top: '40%', right: '-25%', rotate: 50 }, { top: '80%', left: '-10%', rotate: -20 }],
    ];
    return sequence[s] || sequence[1];
  };

  const pos = getPositions(step);
  const shapeBaseStyle: React.CSSProperties = {
    position: "absolute", width: "140px", height: "140px", filter: "blur(7.5px)",
    borderRadius: "20px", transition: "all 1s cubic-bezier(0.25, 0.8, 0.25, 1)", zIndex: 0,
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{ ...shapeBaseStyle, background: theme.colors.shapePurple, top: pos[0].top, right: pos[0].right, transform: `rotate(${pos[0].rotate}deg)` }} />
      <div style={{ ...shapeBaseStyle, background: theme.colors.shapeCyan, top: pos[1].top, right: pos[1].right, transform: `rotate(${pos[1].rotate}deg)` }} />
      <div style={{ ...shapeBaseStyle, background: theme.colors.shapeGrey, top: pos[2].top, left: pos[2].left, transform: `rotate(${pos[2].rotate}deg)` }} />
    </div>
  );
};

/* -------------------------------------------------
   CARD PREVIEW COMPONENT
   ------------------------------------------------- */
const DigitalCard = ({ data, step }: { data: any; step: number }) => {
  const [showSkillsOverlay, setShowSkillsOverlay] = useState(false);
  const initials = data.name ? data.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "J";

  const skillsArray = data.skills
    ? data.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
    : [];

  return (
    <div style={{
      width: "100%", maxWidth: "340px", background: theme.colors.cardGradient, borderRadius: "20px", padding: "24px",
      color: "white", boxShadow: "0 25px 50px -12px rgba(33, 82, 229, 0.35)", display: "flex", flexDirection: "column",
      alignItems: "center", textAlign: "center", position: "relative", margin: "0 auto", zIndex: 1, transition: "all 0.3s ease",
      minHeight: "auto", height: "auto", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden"
    }}>
      <div style={{ width: "60%", height: "1px", background: theme.colors.cardBorderLine, position: "absolute", top: "70px", opacity: 0.6 }} />

      <div style={{ width: "88px", height: "88px", borderRadius: "50%", background: theme.colors.avatarBg, border: `3px solid ${theme.colors.avatarBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", zIndex: 2, position: "relative", overflow: 'hidden', boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        {data.photo ? (
          <img src={data.photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: theme.font, fontWeight: '700', fontSize: "32px", color: '#FFFFFF' }}>{initials}</span>
        )}
      </div>

      <h3 style={{ fontFamily: theme.font, fontWeight: '700', fontSize: "24px", lineHeight: "1.2", marginBottom: "8px", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        {data.name || "Your Name"}
      </h3>

      {(data.title || data.company) && (
        <div style={{ fontSize: "14px", opacity: 0.95, marginBottom: "12px", fontWeight: "500", letterSpacing: "0.3px" }}>
          {data.title} {data.title && data.company && <span>|</span>} {data.company}
        </div>
      )}

      {data.location && (
        <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "20px", display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {data.location}
        </div>
      )}

      {(data.phone || data.email) && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {data.phone && (
            <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
          )}
          {data.email && (
            <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
          )}
        </div>
      )}

      {data.about && (
        <div style={{ width: '100%', marginBottom: '20px', textAlign: 'left' }}>
          <p style={{ fontSize: "13px", opacity: 0.9, lineHeight: '1.5', color: '#FFFFFF', fontFamily: theme.font, background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '12px' }}>
            {data.about}
          </p>
        </div>
      )}

      {skillsArray.length > 0 && (
        <button onClick={() => setShowSkillsOverlay(true)} style={{ marginTop: 'auto', marginBottom: '20px', background: '#FFFFFF', color: theme.colors.primaryBlue, border: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '100%', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>View Skills & Expertise</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      )}

      {showSkillsOverlay && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', zIndex: 50, display: 'flex', flexDirection: 'column', padding: '24px', animation: 'fadeIn 0.3s ease-out' }}>
          <button onClick={(e) => { e.stopPropagation(); setShowSkillsOverlay(false); }} style={{ alignSelf: 'flex-end', background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <h4 style={{ color: '#111827', fontSize: '20px', fontWeight: '800', marginBottom: '20px', marginTop: '10px', textAlign: 'left' }}>Skills & Expertise</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignContent: 'flex-start', overflowY: 'auto' }}>
            {skillsArray.map((skill: string, i: number) => (
              <span key={i} style={{ background: theme.colors.primaryBlue, color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}>{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------
   PARTY POPUP
   ------------------------------------------------- */
const PartyPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: 'blur(5px)' }}>
      <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", padding: "32px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px", color: "#111827" }}>Your card is ready!</h2>
        <p style={{ fontSize: "15px", color: "#6B7280", marginBottom: "24px", lineHeight: '1.5' }}>We've created your digital card. Let's take you to your dashboard.</p>
        <button onClick={onClose} style={{ width: "100%", padding: "14px 0", borderRadius: "9999px", border: "none", background: theme.colors.cardGradient, color: "#ffffff", fontSize: "16px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}>Go to dashboard</button>
      </div>
    </div>
  );
};

/* -------------------------------------------------
   MAIN COMPONENT CONTENT
   ------------------------------------------------- */
const OnboardingContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setStep(1);
    }
  }, [searchParams]);

  const [showPartyPopup, setShowPartyPopup] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mobileSlide, setMobileSlide] = useState(0);

  const [formData, setFormData] = useState({
    photo: "", photoFile: null as File | null, name: "", phone: "", email: "",
    title: "", company: "", location: "", about: "", skills: "", portfolio: "", experience: "",
  });

  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [professionalTitles, setProfessionalTitles] = useState<string[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<string[]>([]);
  const [titleSearchTerm, setTitleSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomTitle, setIsCustomTitle] = useState(false);

  useEffect(() => {
    const sorted = [...ALL_PROFESSIONS].sort();
    setProfessionalTitles(sorted);
    setFilteredTitles(sorted);
  }, []);

  useEffect(() => {
    if (titleSearchTerm.trim() === '') {
      setFilteredTitles(professionalTitles);
    } else {
      const filtered = professionalTitles.filter(opt => opt.toLowerCase().includes(titleSearchTerm.toLowerCase()));
      setFilteredTitles(filtered);
    }
  }, [titleSearchTerm, professionalTitles]);

  const handleDropdownToggle = () => { if (!isDropdownOpen) setTitleSearchTerm(''); setIsDropdownOpen(!isDropdownOpen); };

  const handleTitleSelect = (selected: string) => {
    if (selected === 'CUSTOM') { setIsCustomTitle(true); setFormData({ ...formData, title: '' }); }
    else { setIsCustomTitle(false); setFormData({ ...formData, title: selected }); }
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (!response.ok) { router.push("/auth/login"); return; }
        setIsCheckingAuth(false);
      } catch (error) { console.error(error); router.push("/auth/login"); }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const check = () => setIsLargeScreen(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[+]?[\d\s-]{10,15}$/.test(phone);
  const handlePrevious = () => { if (step > 1) setStep(step - 1); };

  const handleContinue = async () => {
    if (step === 1 && !formData.name.trim()) return alert("Enter name");
    if (step === 2 && (!formData.phone.trim() || !validatePhone(formData.phone))) return alert("Valid phone required");
    if (step === 3 && (!formData.email.trim() || !validateEmail(formData.email))) return alert("Valid email required");

    if (step < 10) {
      setStep(step + 1);
    } else {
      try {
        const cardFormData = new FormData();

        const fullName = formData.name || "User";
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        cardFormData.append("cardName", fullName);
        cardFormData.append("fullName", fullName);
        cardFormData.append("firstName", firstName);
        cardFormData.append("lastName", lastName);

        cardFormData.append("phone", formData.phone || "");
        cardFormData.append("email", formData.email || "");
        if (formData.title) cardFormData.append("title", formData.title);
        if (formData.company) cardFormData.append("company", formData.company);
        if (formData.location) cardFormData.append("location", formData.location);
        if (formData.about) cardFormData.append("bio", formData.about);
        if (formData.skills) cardFormData.append("skills", formData.skills);
        cardFormData.append("cardType", "Personal");
        cardFormData.append("selectedDesign", "Classic");
        cardFormData.append("status", "draft");

        if (formData.photoFile) {
          cardFormData.append("profileImage", formData.photoFile);
        } else if (formData.photo && formData.photo.startsWith("data:")) {
          const response = await fetch(formData.photo);
          const blob = await response.blob();
          cardFormData.append('profileImage', new File([blob], 'profile.jpg', { type: blob.type }));
        }

        const response = await fetch("/api/card/create", { method: "POST", credentials: "include", body: cardFormData });
        if (!response.ok) throw new Error("Failed to create card");
        setShowPartyPopup(true);
      } catch (error: any) { console.error(error); alert("Failed to create card."); }
    }
  };

  const handlePopupClose = () => { setShowPartyPopup(false); router.push("/dashboard"); };

  const labelStyle: React.CSSProperties = { fontFamily: 'Plus Jakarta Sans', fontWeight: '700', fontSize: isLargeScreen ? "28px" : "36px", lineHeight: isLargeScreen ? "1.2" : "45px", textAlign: "left", color: theme.colors.primaryBlue, marginBottom: "30px", marginTop: "0px" };
  const inputStyle: React.CSSProperties = { width: "100%", border: "none", padding: "12px 0", fontFamily: 'Plus Jakarta Sans', fontWeight: '700', fontSize: "18px", lineHeight: "23px", color: theme.colors.inputText, background: "transparent", outline: "none", textAlign: 'left' };
  const inputContainerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.colors.inputBorder}`, marginBottom: "32px", position: 'relative' };
  const navButtonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => ({ flex: 1, padding: "16px", borderRadius: "5px", border: "none", fontFamily: 'Plus Jakarta Sans', fontSize: "20px", fontWeight: "700", lineHeight: "25px", cursor: "pointer", backgroundColor: variant === 'primary' ? theme.colors.primaryBlue : '#E5E7EB', color: variant === 'primary' ? 'white' : '#4B5563', textAlign: "center", transition: 'background 0.2s' });

  const getHeader = () => {
    switch (step) {
      case 1: return "Full Name";
      case 2: return "Phone Number";
      case 3: return "Email Address";
      case 4: return "Professional Title";
      case 5: return "Company Name";
      case 6: return "Location";
      case 7: return "Profile Photo";
      case 8: return "About You";
      case 9: return "Skills";
      case 10: return "Review & Launch";
      default: return "";
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus />
            <div style={{ padding: '8px', color: theme.colors.inputText }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
          </div>
        );
      case 2:
        return (<div style={inputContainerStyle}><input style={inputStyle} placeholder="+91 1234567890" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} autoFocus /></div>);
      case 3:
        return (<div style={inputContainerStyle}><input style={inputStyle} placeholder="abc@gmail.com" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} autoFocus /></div>);
      case 4:
        return (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              {!isCustomTitle ? (
                <>
                  <div style={inputContainerStyle}>
                    <input type="text" value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setTitleSearchTerm(e.target.value); }} onFocus={handleDropdownToggle} placeholder="e.g. Product Manager" style={inputStyle} />
                    <div style={{ padding: '8px', color: theme.colors.inputText, cursor: 'pointer' }} onClick={handleDropdownToggle}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg></div>
                  </div>
                  {isDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', borderRadius: '8px', zIndex: 1000, maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {filteredTitles.map((t, i) => (
                        <div key={i} onClick={() => handleTitleSelect(t)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', fontSize: '15px', color: '#374151', transition: 'background 0.2s', backgroundColor: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                          {t === 'CUSTOM' ? '+ Custom Title' : t}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                  <div style={inputContainerStyle}>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Type your custom title" style={inputStyle} autoFocus />
                  </div>
                  <button onClick={() => { setIsCustomTitle(false); setIsDropdownOpen(true); }} style={{ fontSize: '13px', background: 'none', border: 'none', color: theme.colors.primaryBlue, cursor: 'pointer', textAlign: 'left', marginTop: '-20px', padding: 0 }}>&larr; Back to list</button>
                </div>
              )}
            </div>
          </div>
        );
      case 5:
        return (<div style={inputContainerStyle}><input style={inputStyle} placeholder="Company Name" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></div>);
      case 6:
        return (<div style={{ marginBottom: '32px' }}><LocationSelect value={formData.location} onChange={(loc) => setFormData({ ...formData, location: loc })} /></div>);
      case 7:
        return (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <label style={{ width: '100%', padding: '20px', border: `2px dashed ${theme.colors.primaryBlue}`, borderRadius: '16px', textAlign: 'center', color: theme.colors.primaryBlue, cursor: 'pointer', background: 'rgba(37, 99, 235, 0.05)', transition: 'all 0.2s' }}>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px', fontWeight: '600' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>Click to Upload Picture</span>
              {/* COMPRESS IMAGE ON UPLOAD TO FIX FAILURE */}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Compress image before setting state
                  try {
                    const compressedFile = await compressImage(file);
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData({ ...formData, photo: reader.result as string, photoFile: compressedFile });
                    reader.readAsDataURL(compressedFile);
                  } catch (err) {
                    console.error("Compression failed, using original", err);
                    // Fallback to original
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData({ ...formData, photo: reader.result as string, photoFile: file });
                    reader.readAsDataURL(file);
                  }
                }
              }} />
            </label>
          </div>
        );
      case 8:
        return (<textarea style={{ ...inputStyle, border: `1px solid ${theme.colors.inputBorder}`, borderRadius: '12px', padding: '16px', textAlign: 'left', minHeight: '120px' }} placeholder="Briefly describe your professional journey..." rows={4} value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} />);
      case 9:
        return (<div style={{ marginBottom: '32px' }}><div style={inputContainerStyle}><input style={inputStyle} placeholder="React, Python, Design, Marketing..." value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} /></div><p style={{ fontSize: '13px', color: '#666', marginTop: '-20px' }}>Separate skills with commas (e.g. Design, Coding)</p></div>);
      // case 10:
      //   return (<div style={{ textAlign: 'center', padding: '20px' }}><p style={{ fontSize: '18px', color: '#666' }}>Your card is ready to be created!</p></div>);
      default: return null;
    }
  }

  if (isCheckingAuth) return <div>Loading...</div>;

  if (step === 0) {
    const brandBlue = '#1976D2'; const bgLight = '#F0F4FA';
    const mobileSlidesData = [{ id: 0, image: "/assets/slide1.png", titleStart: "One Link. Endless", titleHighlight: "Connections", description: "MyKard brings your professional achievements and personal passions together in one stunning hub. It’s not just a business card—it’s your digital handshake.", btnText: "Next" }, { id: 1, image: "/assets/slide2.png", titleStart: "Discover Connections", titleHighlight: "Effortlessly", description: "Search by industry, name or skill. Get to know professionals through their digital MyKard before you send a request.", btnText: "Next" }, { id: 2, image: "/assets/slide3.png", titleStart: "Stay Updated,", titleHighlight: "Stay Ahead", description: "Discover opportunities in real-time. Our professional feed combines the best of social networking with career-focused updates.", btnText: "Get started" }];
    const currentSlide = mobileSlidesData[mobileSlide];

    if (isLargeScreen) {
      return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'row', background: '#f8fafc' }}>
          <div style={{ flex: 1, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src="/assets/Welcome0.png" alt="Welcome" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}><div style={{ textAlign: 'center', maxWidth: '400px' }}><h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Welcome to MyKard</h1><p style={{ marginBottom: '32px', lineHeight: '1.6', color: '#666' }}>Create your professional digital identity in minutes.</p><button onClick={() => setStep(1)} style={{ padding: '16px 48px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>Get Started</button></div></div>
        </div>
      )
    }

    return (
      <div style={{
        minHeight: "100vh",
        background: "#E7F0FF", // Blue background
        borderLeft: "15px solid white", // Left white line
        borderRight: "15px solid white", // Right white line
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: theme.font
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><img src={currentSlide.image} alt="Feature Preview" style={{ maxWidth: '100%', maxHeight: '45vh', objectFit: 'contain', filter: mobileSlide === 0 ? 'drop-shadow(0px 8px 4px rgba(0, 0, 0, 0.3))' : 'drop-shadow(0px 10px 20px rgba(0,0,0,0.1))' }} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}><h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 12px 0', color: '#000', lineHeight: '1.2' }}>{currentSlide.titleStart} <br /> <span style={{ color: '#4285F4' }}>{currentSlide.titleHighlight}</span></h2><p style={{ fontSize: '15px', color: 'black', lineHeight: '1.5', marginBottom: '30px' }}>{currentSlide.description}</p><div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>{[0, 1, 2].map((idx) => (<div key={idx} style={{ width: idx === mobileSlide ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: idx === mobileSlide ? brandBlue : '#D1D5DB', transition: 'all 0.3s ease' }} />))}</div><button onClick={() => mobileSlide < 2 ? setMobileSlide(mobileSlide + 1) : setStep(1)} style={{ width: '100%', padding: '16px', backgroundColor: brandBlue, color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px rgba(25, 118, 210, 0.2)' }}>{currentSlide.btnText} &rarr;</button></div>
        </div>
      </div>
    );
  }

  const showSkip = step >= 4 && step <= 9;
  const showPrev = step > 1;

  if (isLargeScreen) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <div style={{ flex: 1, background: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid #E5E7EB', position: 'relative' }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.5, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, #E0E7FF 0%, transparent 70%)' }}></div>
          <div style={{ transform: 'scale(1)', zIndex: 2 }}>
            <DigitalCard data={formData} step={step} />
          </div>
        </div>
        <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
          <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}><span style={{ color: theme.colors.primaryBlue, fontWeight: '700' }}>Step {step}</span><span style={{ color: '#9CA3AF' }}>/ 10</span></div>
            <h1 style={labelStyle}>{getHeader()}</h1>
            <div style={{ marginBottom: '40px' }}>{renderStepContent()}</div>
            <div style={{ display: "flex", gap: "16px" }}>{showPrev && <button onClick={handlePrevious} style={{ ...navButtonStyle('secondary'), flex: '0 0 140px' }}>Back</button>}<button onClick={handleContinue} style={{ ...navButtonStyle('primary'), flex: 1 }}>{step === 10 ? "Create Card" : "Continue"}</button>{showSkip && <button onClick={() => setStep(step + 1)} style={{ ...navButtonStyle('secondary'), background: 'transparent', color: '#9CA3AF', flex: '0 0 auto' }}>Skip</button>}</div>
          </div>
        </div>
        {showPartyPopup && <PartyPopup onClose={handlePopupClose} />}
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.colors.bg, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: theme.font }}>
      <BackgroundShapes step={step} />
      <div style={{ position: "relative", zIndex: 10, padding: "24px", maxWidth: "440px", margin: "0 auto", width: "100%", paddingBottom: "40px" }}>
        <div style={{ marginTop: '50px', marginBottom: '30px' }}><DigitalCard data={formData} step={step} /></div>
        <div style={{ marginBottom: "20px" }}><h2 style={{ ...labelStyle, fontSize: '36px' }}>{getHeader()}</h2>{renderStepContent()}</div>
        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>{showPrev && <button onClick={handlePrevious} style={navButtonStyle('secondary')}>Previous</button>}{showSkip && <button onClick={() => setStep(step + 1)} style={{ ...navButtonStyle('primary'), backgroundColor: '#60A5FA' }}>Skip</button>}<button onClick={handleContinue} style={{ ...navButtonStyle('primary'), boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>{step === 10 ? "Create" : "Continue"}</button></div>
        <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginTop: "32px", marginBottom: "20px" }}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (<div key={i} style={{ flex: 1, height: "5px", borderRadius: "5px", backgroundColor: i <= step ? theme.colors.progressActive : theme.colors.progressInactive, transition: "all 0.3s" }} />))}</div>
      </div>
      {showPartyPopup && <PartyPopup onClose={handlePopupClose} />}
    </div>
  );
};

const OnboardingPageWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <OnboardingContent />
  </Suspense>
);

export default OnboardingPageWrapper;