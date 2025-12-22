"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { set } from "zod";
import ClassicDigitalCardPreview from "@/components/cards/DigitalCardPreview";
//import indianCities from "@/data/indianCities";
import { City, State } from "country-state-city";
import LocationSelect from "@/components/LocationSelect";




/* -------------------------------------------------
   COLORS & STYLES
   ------------------------------------------------- */
const colors = {
  primary: "#3B82F6",
  darkBlue: "#1E40AF",
  lightBlue: "#60A5FA",
  orange: "#FB923C",
  purple: "#8B5CF6",
  white: "#FFFFFF",
  lightGray: "#F3F4F6",
  mint: "#D1FAE5",
  textGray: "#4B5563",
  textLight: "#6B7280",
};

/* -------------------------------------------------
   MAIN ONBOARDING PAGE
   ------------------------------------------------- */

interface PartyPopupProps {
  onClose: () => void;
}

const PartyPopup: React.FC<PartyPopupProps> = ({ onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(15,23,42,0.3)',
        }}
      >
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '8px',
            color: '#111827',
          }}
        >
          Your card is ready!
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: '20px',
          }}
        >
          {"We've created your digital card. Let's take you to your dashboard."}
        </p>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: '9999px',
            border: 'none',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.purple})`,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
};

const OnboardingPage: React.FC = () => {
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const [step, setStep] = useState(0);
  const router = useRouter();
  const [showPartyPopup, setShowPartyPopup] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);

  const [formData, setFormData] = useState({
    photo: "",
    photoFile: null as File | null,
    name: "",
    phone: "",
    email: "",
    title: "",
    company: "",
    location: "",
    about: "",
    skills: "",
    portfolio: "",
    experience: "",
  });
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [professionalTitles, setProfessionalTitles] = useState<string[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<string[]>([]);
  const [titleSearchTerm, setTitleSearchTerm] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (!response.ok) {
          // Not authenticated, redirect to login
          router.push('/auth/login');
          return;
        }

        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const check = () => setIsLargeScreen(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Simple validation for phone number (10-15 digits)
    const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const handleContinue = async () => {
    // Step 1: Full Name (Required)
    if (step === 1 && !formData.name.trim()) {
      alert('Please enter your full name to continue.');
      return;
    }

    // Step 2: Phone (Required)
    if (step === 2) {
      if (!formData.phone.trim()) {
        alert('Please enter your phone number to continue.');
        return;
      }
      if (!validatePhone(formData.phone)) {
        alert('Please enter a valid phone number.');
        return;
      }
    }

    // Step 3: Email (Required)
    if (step === 3) {
      if (!formData.email.trim()) {
        alert('Please enter your email address to continue.');
        return;
      }
      if (!validateEmail(formData.email)) {
        alert('Please enter a valid email address.');
        return;
      }
    }

    // All other steps are optional (4-10)
    if (step < 10) {
      setStep(step + 1);
    } else {
      // Final step - Create card
      try {
        // Create FormData for card creation

        const cardFormData = new FormData();

        // Required fields from signup
        cardFormData.append('cardName', formData.name || 'My Card');
        cardFormData.append('fullName', formData.name || '');
        cardFormData.append('phone', formData.phone || '');
        cardFormData.append('email', formData.email || '');
        cardFormData.append('firstName', formData.name || '');
        // Optional fields
        if (formData.title) cardFormData.append('title', formData.title);
        if (formData.company) cardFormData.append('company', formData.company);
        if (formData.location) cardFormData.append('location', formData.location);
        if (formData.about) cardFormData.append('bio', formData.about);

        // Add standalone skills and portfolio so they are stored in dedicated DB columns
        if (formData.skills) cardFormData.append('skills', formData.skills);
        if (formData.portfolio) cardFormData.append('portfolio', formData.portfolio);
        if (formData.experience) cardFormData.append('experience', formData.experience);

        // Also keep a consolidated description for backward compatibility / previews
        const descriptionParts = [];
        if (formData.skills) descriptionParts.push(`Skills: ${formData.skills}`);
        if (formData.portfolio) descriptionParts.push(`Portfolio: ${formData.portfolio}`);
        if (formData.experience) descriptionParts.push(`Experience: ${formData.experience}`);
        if (descriptionParts.length > 0) {
          cardFormData.append('description', descriptionParts.join('\n\n'));
        }

        // Set default card properties
        cardFormData.append('cardType', 'Personal');
        cardFormData.append('selectedDesign', 'Classic');
        cardFormData.append('selectedColor', '#145dfd');
        cardFormData.append('selectedFont', 'Arial, sans-serif');
        cardFormData.append('status', 'draft');

        // Handle profile image upload if provided
        if (formData.photoFile) {
          cardFormData.append('profileImage', formData.photoFile);
        } else if (formData.photo && formData.photo.startsWith('data:')) {
          try {
            const response = await fetch(formData.photo);
            const blob = await response.blob();
            const file = new File([blob], 'profile.jpg', { type: blob.type || 'image/jpeg' });
            cardFormData.append('profileImage', file);
          } catch (error) {
            console.error('Error processing profile image:', error);
          }
        }

        // Create card using card creation API
        if (!isEnabled) {
          return;
        }
        setIsEnabled(false);

        const response = await fetch('/api/card/create', {
          method: 'POST',
          credentials: 'include',
          body: cardFormData,
        });

        const data = await response.json();
        console.log('Card creation response:', data);

        if (!response.ok) {
          setIsEnabled(true); // Re-enable button on error
          throw new Error(data.error || 'Failed to create card');
        }

        setShowPartyPopup(true);
      } catch (error: any) {
        console.error('Error creating card:', error);
        setIsEnabled(true); // Re-enable button on error
        alert(error.message || 'Failed to create card. Please try again.');
      }
    }
  };

  const handlePopupClose = () => {
    setShowPartyPopup(false);
    router.push('/dashboard');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'CUSTOM') {
      setIsCustomTitle(true);
      setFormData({ ...formData, title: '' });
    } else {
      setIsCustomTitle(false);
      setFormData({ ...formData, title: value });
    }
    setIsDropdownOpen(false);
  };

  const handleDropdownToggle = () => {
    // When opening dropdown, show all titles by clearing search term
    if (!isDropdownOpen) {
      setTitleSearchTerm('');
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTitleSelect = (title: string) => {
    if (title === 'CUSTOM') {
      setIsCustomTitle(true);
      setFormData({ ...formData, title: '' });
    } else {
      setIsCustomTitle(false);
      setFormData({ ...formData, title: title });
    }
    setIsDropdownOpen(false);
  };

  // Load professions from CSV on component mount
  useEffect(() => {
    const loadProfessions = async () => {
      try {
        const response = await fetch('/assets/all_professions.csv');
        const csvText = await response.text();
        const professions = csvText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .sort();
        console.log('Loaded professions:', professions.length, 'items');
        setProfessionalTitles([...professions, 'CUSTOM']);
        setFilteredTitles([...professions, 'CUSTOM']);
      } catch (error) {
        console.error('Error loading professions:', error);
        // Fallback to basic titles if CSV fails to load
        const fallbackTitles = [
          "Software Engineer", "Product Manager", "UX Designer", "UI Designer",
          "Full Stack Developer", "Frontend Developer", "Backend Developer",
          "Mobile Developer", "Data Scientist", "Data Analyst", "Marketing Manager",
          "Digital Marketer", "Content Creator", "Social Media Manager",
          "Business Analyst", "Project Manager", "Consultant", "Entrepreneur",
          "Founder", "CEO", "CTO", "CFO", "COO", "Sales Manager",
          "Account Manager", "HR Manager", "Recruiter", "Teacher", "Professor",
          "Doctor", "Lawyer", "Architect", "Graphic Designer", "Photographer",
          "Videographer", "Writer", "Editor", "Journalist", "Researcher",
          "Engineer", "Manager", "Director", "Coordinator", "Specialist", "CUSTOM"
        ];
        setProfessionalTitles(fallbackTitles);
        setFilteredTitles(fallbackTitles);
      }
    };
    loadProfessions();
  }, []);

  // Filter titles based on search term
  useEffect(() => {
    if (titleSearchTerm.trim() === '') {
      // Show all titles when search is empty
      setFilteredTitles(professionalTitles);
    } else {
      const filtered = professionalTitles.filter(title =>
        title.toLowerCase().includes(titleSearchTerm.toLowerCase())
      );
      setFilteredTitles(filtered);
    }
  }, [titleSearchTerm, professionalTitles]);

  /* -------------------------------------------------
     RESPONSIVE STYLES
     ------------------------------------------------- */
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isLargeScreen ? 'row' : 'column',
    minHeight: '100vh',
    background: '#f8fafc',
  };

  const leftPanelStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: '0',
    background: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  };

  const rightPanelStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: isLargeScreen ? 'center' : 'flex-start',
    padding: '32px',
    background: '#ffffff',
    width: isLargeScreen ? 'auto' : '100%',
  };

  const fullImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    position: 'relative',
    zIndex: 10,
  };

  const heroTitleStyle: React.CSSProperties = {
    fontSize: isLargeScreen ? "32px" : "clamp(20px, 6vw, 32px)",
    fontWeight: "700",
    color: "#1F2937",
    display: "flex",
    flexDirection: "row",
    alignItems: isLargeScreen ? "flex-end" : "center",
    justifyContent: "center",
    gap: isLargeScreen ? "5px" : "6px",
    whiteSpace: "nowrap",
    lineHeight: "1",
    marginBottom: "20px",
    textAlign: "center",
    maxWidth: "100%",
    overflow: "hidden",
  };

  const heroLogoStyle: React.CSSProperties = {
    height: isLargeScreen ? undefined : "clamp(52px, 14vw, 96px)",
    maxHeight: isLargeScreen ? "100px" : undefined,
    objectFit: "contain",
    marginBottom: "0",
    maxWidth: isLargeScreen ? "180px" : "50vw",
  };

  const inputStyle = (id: string) => ({
    width: '100%',
    border: 'none',
    borderBottom: '2px solid #D1D5DB',
    outline: 'none',
    fontSize: '18px',
    padding: '8px 0',
    marginBottom: '24px',
    background: 'transparent',
    transition: 'border-color 200ms',
    color: '#1F2937',
    ...(focusedInput === id ? { borderBottom: `2px solid ${colors.primary}` } : {}),
  });



  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E5E7EB',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>Verifying access...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  /* -------------------------------------------------
     STEP 0: WELCOME SCREEN
     ------------------------------------------------- */
  if (step === 0) {
    return (
      <div style={{
        ...containerStyle,
        height: '100dvh',
        minHeight: 'auto',
        overflow: 'hidden'
      }}>
        {/* LEFT – FULL SCREEN IMAGE (desktop only) */}
        {isLargeScreen && (
          <div style={leftPanelStyle}>
            <img
              src="/assets/Welcome0.png"
              alt="Collection of Digital Cards"
              style={fullImageStyle}
            />
          </div>
        )}

        {/* RIGHT – GET STARTED (always visible; sole content on mobile) */}
        <div
          style={{
            ...rightPanelStyle,
            flex: 1,
            width: '100%',
            minHeight: isLargeScreen ? undefined : '100dvh',
            justifyContent: 'center',
            padding: isLargeScreen ? '32px' : '24px',
          }}
        >
          <div style={{ maxWidth: '448px', textAlign: 'center', marginBottom: 0 }}>
            <h1 style={heroTitleStyle}>
              <span>Welcome to</span>
              <img
                src="/assets/headerlogo.png"
                alt="MyKard Logo"
                style={heroLogoStyle}
              />
            </h1>
            <p
              style={{
                color: colors.textLight,
                margin: "0 0 32px",
              }}
            >
              Build connections in your own unique way.
            </p>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '14px 36px',
                background: `linear-gradient(135deg, ${colors.orange} 0%, #F97316 100%)`,
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------
     STEPS 1–9: FORM + LIVE PREVIEW
     ------------------------------------------------- */
  return (
    <>
      <div style={containerStyle}>
        {/* LEFT: Digital Card Preview + Floating Shapes (Hidden on Mobile) */}
        <div style={leftPanelStyle}>
          {/* Floating 3D Shapes */}
          <div
            style={{
              position: 'absolute',
              top: '5%',
              left: '5%',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
              borderRadius: '20px',
              transform: 'rotate(-15deg)',
              boxShadow:
                '0 20px 60px rgba(59, 130, 246, 0.4), inset -5px -5px 20px rgba(0, 0, 0, 0.1), inset 5px 5px 20px rgba(255, 255, 255, 0.3)',
            }}
          ></div>

          <div
            style={{
              position: 'absolute',
              top: '40%',
              right: '15%',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
              borderRadius: '18px',
              transform: 'rotate(25deg)',
              boxShadow:
                '0 20px 60px rgba(168, 85, 247, 0.4), inset -5px -5px 20px rgba(0, 0, 0, 0.1), inset 5px 5px 20px rgba(255, 255, 255, 0.3)',
            }}
          ></div>

          <div
            style={{
              position: 'absolute',
              bottom: '15%',
              left: '8%',
              width: '110px',
              height: '110px',
              background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
              borderRadius: '18px',
              transform: 'rotate(10deg)',
              boxShadow:
                '0 20px 60px rgba(34, 211, 238, 0.4), inset -5px -5px 20px rgba(0, 0, 0, 0.1), inset 5px 5px 20px rgba(255, 255, 255, 0.3)',
            }}
          ></div>

          <div
            style={{
              position: 'absolute',
              bottom: '8%',
              right: '5%',
              width: '130px',
              height: '130px',
              background: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
              borderRadius: '20px',
              transform: 'rotate(-20deg)',
              boxShadow:
                '0 20px 60px rgba(251, 146, 60, 0.4), inset -5px -5px 20px rgba(0, 0, 0, 0.1), inset 5px 5px 20px rgba(255, 255, 255, 0.3)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '15px',
                right: '15px',
                width: '20px',
                height: '20px',
                color: 'white',
                fontSize: '20px',
                opacity: 0.9,
              }}
            >
              Sparkle
            </div>
          </div>

          {/* Card Preview */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            boxSizing: 'border-box',
          }}>
            <ClassicDigitalCardPreview
              name={formData.name}
              phone={formData.phone}
              email={formData.email}
              title={formData.title}
              company={formData.company}
              location={formData.location}
              about={formData.about}
              skills={formData.skills}
              portfolio={formData.portfolio}
              experience={formData.experience}
              photo={formData.photo}
            />
          </div>
        </div>

        {/* RIGHT: Form (Always Visible) */}
        <div style={rightPanelStyle}>
          <div style={{ maxWidth: '448px', width: '100%' }}>
            <h1
              style={{
                fontSize: '30px',
                fontWeight: '700',
                marginBottom: '24px',
                color: colors.primary,
              }}
            >
              {step === 1 && 'Full Name '}
              {step === 2 && 'Phone Number '}
              {step === 3 && 'Email Address '}
              {step === 4 && 'Professional Title'}
              {step === 5 && 'Company Name'}
              {step === 6 && 'Location'}
              {step === 7 && 'Profile Photo'}
              {step === 8 && 'About You'}
              {step === 9 && 'Skills'}
              {step === 10 && 'Review & Create'}
            </h1>

            {/* Form Fields */}
            {step === 1 && (
              <input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                style={inputStyle('name')}
                autoFocus
              />
            )}
            {step === 2 && (
              <input
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => {
                  // allow only digits
                  const digitsOnly = e.target.value.replace(/\D/g, "");

                  // restrict to 10 digits
                  if (digitsOnly.length <= 11) {
                    setFormData({ ...formData, phone: digitsOnly });
                  }
                }}
                onFocus={() => setFocusedInput("phone")}
                onBlur={() => setFocusedInput(null)}
                style={inputStyle("phone")}
                type="tel"
                inputMode="numeric"
                autoFocus
              />
            )}
            {step === 3 && (
              <input
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                style={inputStyle('email')}
                type="email"
                autoFocus
              />
            )}
            {step === 4 && (
              <>
                {!isCustomTitle ? (
                  <div className="dropdown-container" style={{ position: 'relative', marginBottom: '24px' }}>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        setTitleSearchTerm(e.target.value);
                      }}
                      onFocus={(e) => {
                        setFocusedInput("title");
                        handleDropdownToggle();
                        e.currentTarget.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}

                      onBlur={() => setFocusedInput(null)}
                      placeholder="Search or select title..."
                      style={{
                        ...inputStyle('title'),
                        padding: '8px 32px 8px 0',
                        marginBottom: '0',
                        cursor: 'pointer',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '20px',
                        position: 'relative',
                      }}
                    />

                    {isDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '0',
                          right: '0',
                          backgroundColor: '#ffffff',
                          border: '2px solid #D1D5DB',
                          borderTop: 'none',
                          borderRadius: '0 0 8px 8px',
                          maxHeight: isLargeScreen ? '200px' : '150px',
                          overflowY: 'auto',
                          zIndex: 1000,
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        {filteredTitles.map((title, index) => (
                          <div
                            key={index}
                            onClick={() => handleTitleSelect(title)}
                            style={{
                              padding: isLargeScreen ? '12px 16px' : '14px 16px',
                              cursor: 'pointer',
                              fontSize: isLargeScreen ? '16px' : '14px',
                              color: '#1F2937',
                              borderBottom: index < filteredTitles.length - 1 ? '1px solid #E5E7EB' : 'none',
                              backgroundColor: title === 'CUSTOM' ? '#F9FAFB' : '#ffffff',
                              fontWeight: title === 'CUSTOM' ? '600' : 'normal',
                              // Mobile touch optimization
                              ...(isLargeScreen ? {} : {
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center',
                              }),
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = title === 'CUSTOM' ? '#F3F4F6' : '#F9FAFB';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = title === 'CUSTOM' ? '#F9FAFB' : '#ffffff';
                            }}
                          >
                            {title === 'CUSTOM' ? 'Enter custom title...' : title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input
                      placeholder="Enter your professional title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      onFocus={() => setFocusedInput('title')}
                      onBlur={() => setFocusedInput(null)}
                      style={inputStyle('title')}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setIsCustomTitle(false);
                        setFormData({ ...formData, title: '' });
                      }}
                      style={{
                        position: 'absolute',
                        right: '0',
                        top: '8px',
                        background: 'none',
                        border: 'none',
                        color: '#6B7280',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'background-color 200ms',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'none';
                      }}
                    >
                      ← Back to list
                    </button>
                  </div>
                )}
              </>
            )}
            {step === 5 && (
              <input
                placeholder="Company (e.g., xyz company)"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                onFocus={() => setFocusedInput('company')}
                onBlur={() => setFocusedInput(null)}
                style={inputStyle('company')}
              />
            )}


            {step === 6 && (
              <div style={{ marginBottom: "24px" }}>
                <LocationSelect
                  value={formData.location}
                  onChange={(loc) => setFormData({ ...formData, location: loc })}
                />
              </div>
            )}


            {step === 7 && (
              <div style={{
                textAlign: 'center',
                marginBottom: "32px",
                display: "flex",
                justifyContent: "center",
              }}>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, photo: reader.result as string, photoFile: file });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="photo-upload"
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '3px dashed #D1D5DB',
                    cursor: 'pointer',
                    background: formData.photo ? 'transparent' : '#F3F4F6',
                    transition: 'all 200ms',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <>
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span
                        style={{
                          marginTop: '8px',
                          fontSize: '14px',
                          color: '#9CA3AF',
                        }}
                      >
                        Upload Photo
                      </span>
                    </>
                  )}
                </label>
              </div>
            )}
            {step === 8 && (
              <textarea
                placeholder="Crafting engaging content & SEO strategies"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                onFocus={() => setFocusedInput('about')}
                onBlur={() => setFocusedInput(null)}
                style={{ ...inputStyle('about'), height: '120px', resize: 'none' }}
              />
            )}
            {step === 9 && (
              <input
                placeholder="SEO, Content Creation, Analytics, Social Media"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                onFocus={() => setFocusedInput('skills')}
                onBlur={() => setFocusedInput(null)}
                style={inputStyle('skills')}
              />
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>

              {/* PREVIOUS BUTTON */}
              {step > 1 && (
                <button
                  onClick={handlePrevious}
                  style={{
                    flex: 1,
                    padding: "14px 0",
                    background: "#E5E7EB",
                    color: "#374151",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "18px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Previous
                </button>
              )}

              {/* SKIP BUTTON (only optional steps) */}
              {step >= 4 && step <= 9 && (
                <button
                  onClick={() => setStep(step + 1)}
                  style={{
                    flex: 1,
                    padding: "14px 0",
                    background: "#E5E7EB",
                    color: "#6B7280",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "18px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Skip
                </button>
              )}

              {/* CONTINUE / CREATE BUTTON */}
              <button
                onClick={handleContinue}
                disabled={
                  (step === 1 && !formData.name.trim()) ||
                  (step === 2 && !formData.phone.trim()) ||
                  (step === 3 && !formData.email.trim()) ||
                  (step === 10 && !isEnabled)
                }
                style={{
                  flex: 1,
                  padding: "14px 0",
                  background:
                    (step === 1 && !formData.name.trim()) ||
                      (step === 2 && !formData.phone.trim()) ||
                      (step === 3 && !formData.email.trim()) ||
                      (step === 10 && !isEnabled)
                      ? "#D1D5DB"
                      : `linear-gradient(135deg, ${colors.primary}, ${colors.purple})`,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: "600",
                  cursor: "pointer",
                  opacity:
                    (step === 1 && !formData.name.trim()) ||
                      (step === 2 && !formData.phone.trim()) ||
                      (step === 3 && !formData.email.trim()) ||
                      (step === 10 && !isEnabled)
                      ? 0.6
                      : 1,
                }}
              >
                {step === 10 && !isEnabled ? "Creating..." : step < 10 ? "Continue" : "Create Card"}
              </button>

            </div>


            {/* Progress Dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "40px",
                    height: "4px",
                    borderRadius: "9999px",
                    backgroundColor: i <= step ? colors.primary : "#E5E7EB",
                    transition: "all 300ms",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Party Popup */}
      {showPartyPopup && <PartyPopup onClose={handlePopupClose} />}
    </>
  );
};

export default OnboardingPage;