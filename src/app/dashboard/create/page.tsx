'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DigitalCardPreviewComponent from '@/components/cards/DigitalCardPreview';
import FlatCardPreviewComponent from '@/components/cards/FlatCardPreview';
import ModernCardPreviewComponent from '@/components/cards/ModernCardPreview';
import SleekCardPreviewComponent from '@/components/cards/SleekCardPreview';
import LocationSelect from "@/components/LocationSelect";
import { usePathname, useSearchParams } from "next/navigation";

// Import Shared CSS
import styles from './create.module.css';

interface ExtraField {
  id: number;
  name: string;
  link: string;
}

const FONT_OPTIONS = [
  // --- Sans Serif (Clean & Modern) ---
  { label: 'Standard (Arial)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Modern (Verdana)', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Clean (Open Sans/Segoe)', value: '"Segoe UI", "Open Sans", Helvetica, sans-serif' },
  { label: 'Minimal (Helvetica)', value: 'Helvetica, "Helvetica Neue", Arial, sans-serif' },
  { label: 'Humanist (Gill Sans)', value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
  { label: 'Rounded (Tahoma)', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Stylish (Trebuchet)', value: '"Trebuchet MS", "Lucida Sans Unicode", sans-serif' },

  // --- Serif (Traditional & Elegant) ---
  { label: 'Elegant (Georgia)', value: 'Georgia, serif' },
  { label: 'Classic (Times New Roman)', value: '"Times New Roman", Times, serif' },
  { label: 'Formal (Palatino)', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
  { label: 'Old Style (Garamond)', value: 'Garamond, Baskerville, "Baskerville Old Face", serif' },

  // --- Display & Unique ---
  { label: 'Bold (Impact)', value: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' },
  { label: 'Monospace (Courier)', value: '"Courier New", Courier, monospace' },
  { label: 'Terminal (Lucida)', value: '"Lucida Console", Monaco, monospace' },
  { label: 'Comic (Comic Sans)', value: '"Comic Sans MS", "Chalkboard SE", sans-serif' }, // Optional
  { label: 'Fantasy (Copperplate)', value: 'Copperplate, Papyrus, fantasy' },
];

const CreatePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Display');
  const [selectedColor1, setSelectedColor1] = useState('#145dfd');
  const [selectedColor2, setSelectedColor2] = useState('#00c0fd');
  const [textColor, setTextColor] = useState('#ffffff');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [openSection, setOpenSection] = useState<string | null>(null);


  const toggleSection = (key: string) => {
    setOpenSection(prev => (prev === key ? null : key));
  };

  // Phone State Logic
  const [phone, setPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false); // Controls read-only state
  const [includePhone, setIncludePhone] = useState(true); // Privacy Toggle

  const [emailLink, setEmailLink] = useState('');
  const [phoneLink, setPhoneLink] = useState('');
  const [selectedDesign, setSelectedDesign] = useState('Classic');
  const [prefix, setPrefix] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [accreditations, setAccreditations] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [maidenName, setMaidenName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [company, setCompany] = useState('');
  const [headline, setHeadline] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [originalUserProfileImage, setOriginalUserProfileImage] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedFont, setSelectedFont] = useState('Arial, sans-serif');
  const [cardName, setCardName] = useState('');
  const [cardType, setCardType] = useState('Personal');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [cardLocation, setCardLocation] = useState('');

  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [experience, setExperience] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [services, setServices] = useState('');
  const [reviews, setReviews] = useState('');

  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState('');

  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLink, setNewFieldLink] = useState('');
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [isCustomFieldName, setIsCustomFieldName] = useState(false);

  const [professionalTitles, setProfessionalTitles] = useState<string[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<string[]>([]);
  const [titleSearchTerm, setTitleSearchTerm] = useState('');

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [existingCardId, setExistingCardId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");

  const platforms = [
    { name: "WhatsApp", img: "/assets/whatsapp.png" },
    { name: "GitHub", img: "/assets/github.png" },
    { name: "Twitter", img: "/assets/twitter.png" },
    { name: "Instagram", img: "/assets/instagram.png" },
    { name: "Facebook", img: "/assets/facebook.png" },
    { name: "YouTube", img: "/assets/youtube.png" },
    { name: "Discord", img: "/assets/discord.png" },
    { name: "Telegram", img: "/assets/telegram.png" },
    { name: "Other", icon: "/assets/other.png" },
  ];

  const socialPlatforms = [
    'WhatsApp', 'GitHub', 'Twitter', 'Instagram', 'Facebook',
    'YouTube', 'Discord', 'Telegram'
  ];

  <div className={styles.dropdownWrapper}>
    <label className={styles.label}>Field Name</label>

    {/* Selected Box */}
    <div
      className={styles.dropdownBox}
      onClick={() => setIsOpen(!isOpen)}
    >
      {selectedPlatform ? (
        <img
          src={platforms.find(p => p.name === selectedPlatform)?.icon}
          alt={selectedPlatform}
          className={styles.selectedIcon}
        />
      ) : (
        <span>Select Platform...</span>
      )}
    </div>

    {/* Dropdown Grid */}
    {isOpen && (
      <div className={styles.dropdownGrid}>
        {platforms.map((item) => (
          <div
            key={item.name}
            className={styles.gridItem}
            onClick={() => {
              setSelectedPlatform(item.name);
              setIsOpen(false);
            }}
          >
            <img src={item.icon} alt={item.name} />
          </div>
        ))}
      </div>
    )}
  </div>


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          setFirstName(user.fullName?.split(' ')[0] || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
          setProfileImage(user.profileImage || null);
          setOriginalUserProfileImage(user.profileImage || null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const loadProfessions = async () => {
      try {
        const response = await fetch('/assets/all_professions.csv');
        const csvText = await response.text();
        const professions = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0).sort();
        setProfessionalTitles([...professions, 'CUSTOM']);
        setFilteredTitles([...professions, 'CUSTOM']);
      } catch (error) {
        const fallbackTitles = ['Software Engineer', 'Product Manager', 'Founder', 'CUSTOM'];
        setProfessionalTitles(fallbackTitles);
        setFilteredTitles(fallbackTitles);
      }
    };
    loadProfessions();
  }, []);

  useEffect(() => {
    if (titleSearchTerm.trim() === '') {
      setFilteredTitles(professionalTitles);
    } else {
      const filtered = professionalTitles.filter(opt => opt.toLowerCase().includes(titleSearchTerm.toLowerCase()));
      setFilteredTitles(filtered);
    }
  }, [titleSearchTerm, professionalTitles]);

  const hexToRgb = (hex: string) => {
    if (!hex || hex.length < 4) hex = '#145DFD';
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const initialRgb1 = hexToRgb(selectedColor1);
  const [rValue1, setRValue1] = useState(initialRgb1.r);
  const [gValue1, setGValue1] = useState(initialRgb1.g);
  const [bValue1, setBValue1] = useState(initialRgb1.b);
  const [hexValue1, setHexValue1] = useState(selectedColor1);

  const initialRgb2 = hexToRgb(selectedColor2);
  const [rValue2, setRValue2] = useState(initialRgb2.r);
  const [gValue2, setGValue2] = useState(initialRgb2.g);
  const [bValue2, setBValue2] = useState(initialRgb2.b);
  const [hexValue2, setHexValue2] = useState(selectedColor2);

  React.useEffect(() => {
    const newRgb1 = hexToRgb(selectedColor1);
    if (newRgb1) { setRValue1(newRgb1.r); setGValue1(newRgb1.g); setBValue1(newRgb1.b); setHexValue1(selectedColor1); }
  }, [selectedColor1]);

  React.useEffect(() => {
    const newRgb2 = hexToRgb(selectedColor2);
    if (newRgb2) { setRValue2(newRgb2.r); setGValue2(newRgb2.g); setBValue2(newRgb2.b); setHexValue2(selectedColor2); }
  }, [selectedColor2]);


  // Handle Phone Validation and Editing Toggle
  const handlePhoneAction = () => {
    if (isEditingPhone) {
      // User is trying to SAVE the local edit
      const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/

      // If field is not empty, check regex
      if (phone && !phoneRegex.test(phone)) {
        setPopupMessage('Invalid Phone Number. Please enter a valid Indian number.');
        setIsPopupOpen(true);
        return; // Stop here, do not disable edit mode
      }

      // If valid or empty
      setIsEditingPhone(false);
      if (phone) toast.success('Phone number format valid');
    } else {
      // User wants to EDIT
      setIsEditingPhone(true);
    }
  };

  const handleDropdownToggle = () => { if (!isDropdownOpen) setTitleSearchTerm(''); setIsDropdownOpen(!isDropdownOpen); };
  const handleTitleSelect = (selected: string) => { if (selected === 'CUSTOM') { setIsCustomTitle(true); setTitle(''); } else { setIsCustomTitle(false); setTitle(selected); } setIsDropdownOpen(false); };

  const handleAddField = () => {
    if (newFieldName.trim()) {
      const newField: ExtraField = { id: Date.now(), name: newFieldName, link: newFieldLink };
      setExtraFields([...extraFields, newField]);
      setNewFieldName('');
      setNewFieldLink('');
      setIsModalOpen(false);
      setIsCustomFieldName(false);
    }
  };

  const handleDeleteField = (id: number) => { setExtraFields(extraFields.filter(f => f.id !== id)); };
  const handleExtraFieldChange = (id: number, value: string) => { setExtraFields(extraFields.map(f => f.id === id ? { ...f, link: value } : f)); };

  const handleAddCustomType = () => { if (customTypeInput.trim()) { setCustomTypes([...customTypes, customTypeInput]); setCardType(customTypeInput); setShowCustomTypeInput(false); } };
  const getAllCardTypes = () => ['Personal', 'Professional', 'Business', 'Company', 'Creator', 'Influencer', ...customTypes];

  // Color Change Handlers
  const handleRChange1 = (e: React.ChangeEvent<HTMLInputElement>) => { const r = Number(e.target.value); setRValue1(r); const h = rgbToHex(r, gValue1, bValue1); setHexValue1(h); setSelectedColor1(h); };
  const handleGChange1 = (e: React.ChangeEvent<HTMLInputElement>) => { const g = Number(e.target.value); setGValue1(g); const h = rgbToHex(rValue1, g, bValue1); setHexValue1(h); setSelectedColor1(h); };
  const handleBChange1 = (e: React.ChangeEvent<HTMLInputElement>) => { const b = Number(e.target.value); setBValue1(b); const h = rgbToHex(rValue1, gValue1, b); setHexValue1(h); setSelectedColor1(h); };
  const handleHexChange1 = (e: React.ChangeEvent<HTMLInputElement>) => { setHexValue1(e.target.value); setSelectedColor1(e.target.value); };
  const handleColorInputChange1 = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedColor1(e.target.value); setHexValue1(e.target.value); };

  const handleRChange2 = (e: React.ChangeEvent<HTMLInputElement>) => { const r = Number(e.target.value); setRValue2(r); const h = rgbToHex(r, gValue2, bValue2); setHexValue2(h); setSelectedColor2(h); };
  const handleGChange2 = (e: React.ChangeEvent<HTMLInputElement>) => { const g = Number(e.target.value); setGValue2(g); const h = rgbToHex(rValue2, g, bValue2); setHexValue2(h); setSelectedColor2(h); };
  const handleBChange2 = (e: React.ChangeEvent<HTMLInputElement>) => { const b = Number(e.target.value); setBValue2(b); const h = rgbToHex(rValue2, gValue2, b); setHexValue2(h); setSelectedColor2(h); };
  const handleHexChange2 = (e: React.ChangeEvent<HTMLInputElement>) => { setHexValue2(e.target.value); setSelectedColor2(e.target.value); };
  const handleColorInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => { setSelectedColor2(e.target.value); setHexValue2(e.target.value); };

  const handleSaveCard = async () => {
    try {
      setIsSaving(true);
      if (!cardName || cardName.trim() === '') {
        setPopupMessage('Please enter a card name.');
        setIsPopupOpen(true);
        setIsSaving(false);
        return;
      }
      if (!title || title.trim() === '') {
        setPopupMessage('Title is mandatory to save the card.');
        setIsPopupOpen(true);
        setIsSaving(false);
        return;
      }

      if (includePhone && !phone.trim()) {
        setPopupMessage('You enabled "Show on Card" but the phone number is empty. Please enter a number or disable the toggle.');
        setIsPopupOpen(true);
        setIsSaving(false);
        return;
      }

      const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
      if (includePhone && phone && !phoneRegex.test(phone)) {
        setPopupMessage('Invalid Phone Number. Please enter a valid Indian number.');
        setIsPopupOpen(true);
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append('cardName', cardName);
      formData.append('firstName', firstName);
      if (middleName) formData.append('middleName', middleName);
      if (lastName) formData.append('lastName', lastName);
      if (prefix) formData.append('prefix', prefix);
      if (suffix) formData.append('suffix', suffix);
      if (preferredName) formData.append('preferredName', preferredName);
      if (maidenName) formData.append('maidenName', maidenName);
      if (pronouns) formData.append('pronouns', pronouns);
      if (title) formData.append('title', title);
      if (company) formData.append('company', company);
      if (department) formData.append('department', department);
      if (affiliation) formData.append('affiliation', affiliation);
      if (headline) formData.append('headline', headline);
      if (accreditations) formData.append('accreditations', accreditations);
      if (email) formData.append('email', email);
      if (includePhone && phone) formData.append('phone', phone);
      if (emailLink) formData.append('emailLink', emailLink);
      if (phoneLink) formData.append('phoneLink', phoneLink);
      if (cardLocation) formData.append('location', cardLocation);
      if (linkedin) formData.append('linkedinUrl', linkedin);
      if (website) formData.append('websiteUrl', website);
      if (cardType) formData.append('cardType', cardType);
      if (selectedDesign) formData.append('selectedDesign', selectedDesign);
      if (selectedColor1) formData.append('selectedColor', selectedColor1);
      if (selectedColor2) formData.append('selectedColor2', selectedColor2);
      if (textColor) formData.append('textColor', textColor);
      if (selectedFont) formData.append('selectedFont', selectedFont);
      if (about) formData.append('bio', about);
      if (skills) formData.append('skills', skills);
      if (portfolio) formData.append('portfolio', portfolio);
      if (experience) formData.append('experience', experience);
      if (services) formData.append('services', services);
      if (reviews) formData.append('review', reviews);

      if (extraFields.length > 0) formData.append('customFields', JSON.stringify(extraFields));
      else formData.append('customFields', JSON.stringify([]));

      formData.append('status', 'draft');
      if (profileImageFile) formData.append('profileImage', profileImageFile);
      if (!profileImageFile && profileImage) formData.append('profileImageUrl', profileImage);
      if (bannerImageFile) formData.append('coverImage', bannerImageFile); // Send as coverImage to match dashboard
      if (resumeFile) formData.append('document', resumeFile);

      const response = await fetch('/api/card/create', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create card');

      setExistingCardId(data.card.id);
      setIsPopupOpen(true);
      setPopupMessage('Card created successfully!');
    } catch (error: any) {
      console.error('Error saving card:', error);
      setIsPopupOpen(true);
      setPopupMessage(error.message || 'Failed to save card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentClick = (url: string) => { if (url) window.open(url, '_blank'); };

  const renderTemplatePreview = () => {

    const previewPhone = includePhone ? phone : '';

    const props = {
      firstName, middleName, lastName, cardName, title, company, location: cardLocation,
      about, skills, portfolio, experience, services, review: reviews, photo: profileImage || '', cover: bannerImage || '',
      email, phone: previewPhone, linkedin, website, themeColor1: selectedColor1, themeColor2: selectedColor2, textColor: textColor,
      fontFamily: selectedFont, cardType, customFields: extraFields,
      onDocumentClick: handleDocumentClick
    };
    switch (selectedDesign) {
      case 'Flat': return <FlatCardPreviewComponent {...props} />;
      case 'Modern': return <ModernCardPreviewComponent {...props} />;
      case 'Sleek': return <SleekCardPreviewComponent {...props} />;
      default: return <DigitalCardPreviewComponent {...props} />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Display':
        return (
          <>
            <div className={styles.inputGroup}>
              <h3 className={styles.sectionTitle}>Design</h3>
              <div className={styles.designGrid}>
                {['Classic', 'Flat', 'Modern', 'Sleek'].map((design) => (
                  <div key={design} onClick={() => setSelectedDesign(design)} className={styles.designOption} style={{ border: design === selectedDesign ? `2px solid ${selectedColor1}` : '1px solid #888888' }}>
                    <div className={styles.designVisual} style={{
                      background: design === 'Classic' ? `linear-gradient(135deg, ${selectedColor1} 0%, ${selectedColor2} 100%)` : design === 'Flat' ? 'white' : design === 'Modern' ? `linear-gradient(145deg, ${selectedColor1}15, ${selectedColor2}15)` : design === 'Sleek' ? `linear-gradient(135deg, ${selectedColor1}, ${selectedColor2})` : '#dcdcdc',
                      border: design === 'Flat' ? `2px solid ${selectedColor1}` : '1px solid #eee'
                    }}>
                      <div style={{ width: '43px', height: '47px', position: 'relative' }}></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#555' }}>{design}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className={styles.subTitle}>Cover Image</h3>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} id="banner-upload" onChange={(e) => { if (e.target.files?.[0]) { setBannerImage(URL.createObjectURL(e.target.files[0])); setBannerImageFile(e.target.files[0]); } }} />
                <button onClick={() => document.getElementById('banner-upload')?.click()} className={styles.btnIcon}>Add Cover Image</button>
              </div>
            </div>

            <div className={styles.inputGroup1} style={{ marginTop: '20px' }}>
              <h3 className={styles.subTitle}>Profile Photo</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                {/* <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  {profileImage ? <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>📷</span>}
                </div> */}
                <input type="file" accept="image/*" style={{ display: 'none' }} id="profile-media-upload" onChange={(e) => { if (e.target.files?.[0]) { setProfileImage(URL.createObjectURL(e.target.files[0])); setProfileImageFile(e.target.files[0]); } }} />
                <button onClick={() => document.getElementById('profile-media-upload')?.click()} className={styles.btnIcon}>Add Photo</button>
              </div>
            </div>

            <div >
              <h3 className={styles.subTitle}>Choose Theme</h3>

              <div className={styles.colorGrid}>
                {[
                  "#FF0000", "#FF6A00", "#FFC800", "#2FFF00", "#00F0FF",
                  "#0026FF", "#8B00FF", "#FF00F7", "#D4AF37", "#000000", "#E5E5E5"
                ].map((color) => (
                  <div
                    key={color}
                    className={styles.colorBox}
                    style={{
                      backgroundColor: color,
                      border: selectedColor1 === color ? "3px solid #2563EB" : "2px solid transparent"
                    }}
                    onClick={() => setSelectedColor1(color)}
                  />
                ))}
              </div>


            </div>
          </>
        );

      case "Information":
        return (
          <div className={styles.infoPageWrapper}>

            {/* ================== ICON SECTIONS ================== */}

            <h3 className={`${styles.sectionTitle} ${styles.mobileSectionTitle}`}>
              Personal
            </h3>

            <div className={styles.iconGrid} style={{}}>
              {[
                { key: "name", label: "Name", img: "/assets/name.png" },
                { key: "title", label: "Title", img: "/assets/title.png" },
                { key: "company", label: "Company", img: "/assets/company.png" },
                { key: "location", label: "Location", img: "/assets/location.png" },
                { key: "description", label: "Description", img: "/assets/description.png" },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`${styles.iconCard} ${openSection === item.key ? styles.iconCardActive : ""}`}
                  onClick={() => {
                    toggleSection(item.key);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <img src={item.img} className={styles.iconImage} />
                  <span className={styles.iconLabel}>{item.label}</span>
                </div>
              ))}
            </div>

            <h3 className={`${styles.subTitle} ${styles.mobileCenterTitle}`}>
              Core Fields
            </h3>


            <div className={styles.iconGrid}>
              {[
                { key: "email", label: "Email", img: "/assets/email.png" },
                { key: "phone", label: "Phone No.", img: "/assets/phone no..png" },
                { key: "linkedin", label: "LinkedIn", img: "/assets/linkedin.png" },
                { key: "website", label: "Website", img: "/assets/website.png" },
                { key: "services", label: "Services", img: "/assets/services.png" },
                { key: "portfolio", label: "Portfolio", img: "/assets/portfolio.png" },
                { key: "skills", label: "Skills", img: "/assets/skills.png" },
                { key: "experience", label: "Experience", img: "/assets/experience.png" },
                { key: "reviews", label: "Reviews", img: "/assets/reviews.png" },
                { key: "document", label: "Document", img: "/assets/document.png" },
                { key: "additional", label: "Additional", img: "/assets/additional.png" },
              ].map((item) => (
                <div
                  key={item.key}
                  className={styles.iconCard}
                  onClick={() => toggleSection(item.key)}
                  style={{
                    border:
                      openSection === item.key
                        ? `2px solid ${selectedColor1}`
                        : "2px solid #4A90E2",
                  }}
                >
                  <div className={styles.designVisual}>
                    <img
                      src={item.img}
                      alt={item.label}
                      className={styles.iconImg}
                    />
                  </div>

                  <span style={{ fontSize: "12px", color: "#555" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>


            <h3 className={`${styles.sectionTitle} ${styles.mobileCenterTitle}`}>
              Card
            </h3>


            <div className={styles.iconGrid}>
              {[
                { key: "cardName", label: "Card Name", img: "/assets/card name.png" },
                { key: "cardType", label: "Card Type", img: "/assets/card type.png" },
                { key: "customize", label: "Customize", img: "/assets/custom.png" },
              ].map((item) => (
                <div
                  key={item.key}
                  className={styles.iconCard}
                  onClick={() => {
                    toggleSection(item.key);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    border:
                      openSection === item.key
                        ? `2px solid ${selectedColor1}`
                        : "2px solid #4A90E2",
                  }}
                >
                  <div className={styles.designVisual}>
                    <img
                      src={item.img}
                      alt={item.label}
                      className={styles.iconImg}
                    />
                  </div>

                  <span style={{ fontSize: "12px", color: "#555" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  if (isLoadingUser) return <div className={styles.pageWrapper} style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

  return (
    <div className={styles.pageWrapper} style={{ overflowY: 'auto' }}>


      <div className={styles.container}>
        {/* ===== LEFT: CARD PREVIEW ===== */}
        <div className={styles.cardPreviewWrapper}>
          {renderTemplatePreview()}
        </div>

        {/* ===== RIGHT SIDE ===== */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "90vh" }}>


          {activeTab === "Information" && openSection && (
            <div className={styles.topInlineForm}>

              {activeTab === "Information" && openSection === "name" && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              )}

              {activeTab === "Information" && openSection === "title" && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              )}

              {activeTab === "Information" && openSection === "company" && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              )}

              {activeTab === "Information" && openSection === "location" && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Location</label>
                  <LocationSelect value={cardLocation} onChange={setCardLocation} />
                </div>
              )}

              {activeTab === "Information" && openSection === "description" && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    rows={4}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className={styles.textareaField}
                  />
                </div>
              )}

            </div>
          )}
          {activeTab === "Information" && openSection === "email" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
              />
            </div>
          )}
          {activeTab === "Information" && openSection === "phone" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.inputField}
              />
            </div>
          )}

          {activeTab === "Information" && openSection === "linkedin" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>LinkedIn</label>
              <input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className={styles.inputField}
              />
            </div>
          )}

          {activeTab === "Information" && openSection === "website" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Website</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={styles.inputField}
              />
            </div>
          )}

          {activeTab === "Information" && openSection === "services" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Services</label>
              <textarea
                value={services}
                onChange={(e) => setServices(e.target.value)}
                className={styles.textareaField}
              />
            </div>
          )}

          {activeTab === "Information" && openSection === "skills" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Skills</label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className={styles.textareaField}
              />
            </div>
          )}

          {activeTab === "Information" && openSection === "experience" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Experience</label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={styles.textareaField}
              />
            </div>
          )}
          {activeTab === "Information" && openSection === "portfolio" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Portfolio</label>
              <input
                type="text"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className={styles.inputField}
              />
            </div>
          )}

          {activeTab === "Information" && openSection === "reviews" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Reviews</label>
              <textarea
                rows={3}
                value={reviews}
                onChange={(e) => setReviews(e.target.value)}
                className={styles.textareaField}
              />
            </div>
          )}

          {activeTab === "Information" && openSection === "document" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Upload Document</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setResumeFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}

          {activeTab === "Information" && openSection === "additional" && (
            <div style={{ marginTop: "20px" }}>
              <h3 className={styles.subTitle}></h3>

              {/* ===== ADD NEW FIELD FORM (INLINE) ===== */}
              <div
                className={styles.inputGroup}
                style={{
                  background: "#fff",
                  padding: "15px",
                  borderRadius: "15px",
                  border: "1px solid #080303ff",
                  marginBottom: "15px",
                  marginTop: "-45px",
                }}
              >
                {/* Field Name */}
                <label className={styles.label}>Field Name</label>

                {!isCustomFieldName ? (
                  <div className={styles.dropdownWrapper}>

                    {/* Selected Box */}
                    <div
                      className={styles.dropdownBox}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      {newFieldName ? (
                        <img
                          src={`/assets/${newFieldName.toLowerCase()}.png`}
                          alt={newFieldName}
                          className={styles.selectedIcon}
                        />
                      ) : (
                        <span>Select Platform...</span>
                      )}
                    </div>

                    {/* ICON GRID DROPDOWN */}
                    {isDropdownOpen && (
                      <div className={styles.dropdownGrid}>
                        {socialPlatforms.map((platform) => (
                          <div
                            key={platform}
                            className={styles.gridItem}
                            onClick={() => {
                              if (platform === "Other") {
                                setIsCustomFieldName(true);
                                setNewFieldName("");
                              } else {
                                setNewFieldName(platform);
                              }
                              setIsDropdownOpen(false);
                            }}
                          >
                            <img
                              src={`/assets/${platform.toLowerCase()}.png`}
                              alt={platform}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className={styles.inputField}
                    placeholder="Enter custom field name"
                  />
                )}

                {/* Link */}
                <label className={styles.label} style={{ marginTop: "10px" }}>
                  Link
                </label>
                <input
                  type="text"
                  value={newFieldLink}
                  onChange={(e) => setNewFieldLink(e.target.value)}
                  className={styles.inputField}
                  placeholder="https://..."
                />

                {/* ADD + CANCEL BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    gap: "10px",
                    marginTop: "12px",
                  }}
                >
                  <button
                    onClick={() => {
                      setNewFieldName("");
                      setNewFieldLink("");
                      setIsCustomFieldName(false);
                    }}
                    className={`${styles.baseButton} ${styles.btnSecondary}`}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAddField}
                    className={`${styles.baseButton} ${styles.btnPrimary}`}
                    style={{ backgroundColor: selectedColor1 }}
                    disabled={!newFieldName.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>


              {/* ===== LIST OF ADDED FIELDS ===== */}
              {/* {extraFields.map((field) => (
                <div
                  key={field.id}
                  className={styles.inputGroup}
                  style={{
                    background: "white",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <span className={styles.label} style={{ color: selectedColor1 }}>
                      {field.name}
                    </span>

                    <span
                      onClick={() => handleDeleteField(field.id)}
                      style={{
                        cursor: "pointer",
                        color: "#888",
                        fontSize: "12px",
                      }}
                    >
                      Delete
                    </span>
                  </div>

                  <input
                    type="text"
                    value={field.link}
                    onChange={(e) =>
                      handleExtraFieldChange(field.id, e.target.value)
                    }
                    className={styles.inputField}
                    placeholder="Enter link"
                  />
                </div>
              ))} */}
            </div>
          )}
          {activeTab === "Information" && openSection === "cardType" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Card Type</label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className={styles.selectField}
              >
                <option value="">Select...</option>
                {getAllCardTypes().map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === "Information" && openSection === "customize" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Customize</label>
              {/* Custom Type logic */}
              {!showCustomTypeInput ? (
                <button
                  onClick={() => setShowCustomTypeInput(true)}
                  style={{
                    fontSize: "12px",
                    color: selectedColor1,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginTop: "8px",
                  }}
                >
                  + Add Custom Type
                </button>
              ) : (
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <input
                    type="text"
                    value={customTypeInput}
                    onChange={(e) => setCustomTypeInput(e.target.value)}
                    className={styles.inputField}
                    placeholder="Enter Type"
                  />
                  <button
                    onClick={handleAddCustomType}
                    className={`${styles.baseButton}`}
                    style={{ backgroundColor: selectedColor1, color: '#fff' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomTypeInput(false);
                      setCustomTypeInput("");
                    }}
                    className={`${styles.baseButton}`}
                    style={{ backgroundColor: '#fff', border: '1px solid #646464' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "Information" && openSection === "cardName" && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Card Name</label>
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className={styles.inputField}
              />
            </div>
          )}


          {/* ===== WHITE PANEL (TABS + ICONS) ===== */}
          <div className={styles.editPanel} style={{ height: activeTab === 'Information' ? '55dvh' : 'auto' }}>
            <div className={styles.tabContainer}>
              {['Display', 'Information'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={styles.tabButton}
                  style={{
                    borderBottom: activeTab === tab ? `2px solid ${selectedColor1}` : 'none',
                    color: activeTab === tab ? selectedColor1 : '#777'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className={styles.scrollContent}
              style={{
                flex: activeTab === 'Information' ? 1 : 'unset',
                overflowY: activeTab === 'Information' ? 'auto' : 'visible'
              }}
            >
              {renderContent()}
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={() => router.push('/dashboard')} className={`${styles.baseButton} ${styles.btnSecondary}`}>
                Cancel
              </button>
              <button onClick={handleSaveCard} disabled={isSaving} className={`${styles.baseButton} ${styles.btnPrimary}`}
                style={{ backgroundColor: isSaving ? '#999' : selectedColor1 }}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          {isPopupOpen && (
            <div className={styles.popupOverlay}>
              <div className={styles.popupBox}>
                <p>{popupMessage}</p>
                <button
                  onClick={() => {
                    setIsPopupOpen(false);
                    if (popupMessage === "Card created successfully!") {
                      router.push("/dashboard");
                    }
                  }}
                  className={styles.popupBtn}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );

};

export default CreatePage;