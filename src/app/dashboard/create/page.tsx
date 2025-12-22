'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DigitalCardPreviewComponent from '@/components/cards/DigitalCardPreview';
import FlatCardPreviewComponent from '@/components/cards/FlatCardPreview';
import ModernCardPreviewComponent from '@/components/cards/ModernCardPreview';
import SleekCardPreviewComponent from '@/components/cards/SleekCardPreview';
import LocationSelect from "@/components/LocationSelect"; 

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

  const socialPlatforms = [
    'WhatsApp', 'GitHub', 'Twitter', 'Instagram', 'Facebook', 
    'YouTube', 'Discord', 'Telegram', 'X', 'Other'
  ];

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

      // Validate required fields - cardName is required
      if (!cardName || cardName.trim() === '') {
        setIsPopupOpen(true);
        setPopupMessage('Please enter all the required details.');
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
      if (bannerImageFile) formData.append('bannerImage', bannerImageFile);
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
            <div>
              <h3 className={styles.sectionTitle}>Design</h3>
              <div className={styles.designGrid}>
                {['Classic', 'Flat', 'Modern', 'Sleek'].map((design) => (
                  <div key={design} onClick={() => setSelectedDesign(design)} className={styles.designOption} style={{ border: design === selectedDesign ? `2px solid ${selectedColor1}` : '1px solid #ddd' }}>
                    <div className={styles.designVisual} style={{
                        background: design === 'Classic' ? `linear-gradient(135deg, ${selectedColor1} 0%, ${selectedColor2} 100%)` : design === 'Flat' ? 'white' : design === 'Modern' ? `linear-gradient(145deg, ${selectedColor1}15, ${selectedColor2}15)` : design === 'Sleek' ? `linear-gradient(135deg, ${selectedColor1}, ${selectedColor2})` : '#dcdcdc',
                        border: design === 'Flat' ? `2px solid ${selectedColor1}` : '1px solid #eee'
                      }}>
                       <div style={{width:'100%', height:'100%', position:'relative'}}></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#555' }}>{design}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* banner image */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>Cover Image</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="banner-image-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setBannerImage(URL.createObjectURL(file));
                      setBannerImageFile(file);
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById('banner-image-upload')?.click()}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px 15px',
                    fontSize: '14px',
                    color: '#555',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    outline: 'none',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  Add Cover Image
                </button>
              </div>
            </div>
            {/* profile pic */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                Profile Photo
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                 <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    {profileImage ? <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>📷</span>}
                 </div>
                 <input type="file" accept="image/*" style={{ display: 'none' }} id="profile-media-upload" onChange={(e) => { if (e.target.files?.[0]) { setProfileImage(URL.createObjectURL(e.target.files[0])); setProfileImageFile(e.target.files[0]); } }} />
                 <button onClick={() => document.getElementById('profile-media-upload')?.click()} className={styles.btnIcon}>Add Photo</button>
              </div>
            </div>
            {/* color scheme */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
                Color
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Color 1 */}
                <div style={{ marginBottom: '15px'}}>
                  <h4 style={{fontSize: '16px', marginBottom: '10px', color: '#333'}}>Color 1</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="color"
                      value={hexValue1}
                      onChange={handleColorInputChange1}
                      style={{ width: '50px', height: '30px', border: 'none', padding: '0' }}
                    />
                    <span style={{ fontSize: '14px', color: '#555' }}>Select Color 1</span>
                  </div>
                  <div className={styles.rgbInputsWrapper}>
                     <div className={styles.rgbInputGroup}><label className={styles.label}>R:</label><input type="number" value={rValue1} onChange={handleRChange1} className={styles.inputField} /></div>
                     <div className={styles.rgbInputGroup}><label className={styles.label}>G:</label><input type="number" value={gValue1} onChange={handleGChange1} className={styles.inputField} /></div>
                     <div className={styles.rgbInputGroup}><label className={styles.label}>B:</label><input type="number" value={bValue1} onChange={handleBChange1} className={styles.inputField} /></div>
                  </div>
               </div>
               <div className={styles.inputGroup}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                     <input type="color" value={hexValue2} onChange={handleColorInputChange2} style={{width:'50px', height:'30px', border:'none', padding:'0'}} />
                     <span>Color 2</span>
                  </div>
                  <div className={styles.rgbInputsWrapper}>
                     <div className={styles.rgbInputGroup}><label className={styles.label}>R:</label><input type="number" value={rValue2} onChange={handleRChange2} className={styles.inputField} /></div>
                     <div className={styles.rgbInputGroup}><label className={styles.label}>G:</label><input type="number" value={gValue2} onChange={handleGChange2} className={styles.inputField} /></div>
                     <div className={styles.rgbInputGroup}><label className={styles.label}>B:</label><input type="number" value={bValue2} onChange={handleBChange2} className={styles.inputField} /></div>
                  </div>
               </div>
            </div>


            
            <div className={styles.inputGroup}>
                  <label className={styles.label}>Text Color</label>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                     <input 
                       type="color" 
                       value={textColor} 
                       onChange={(e) => setTextColor(e.target.value)} 
                       style={{width:'40px', height:'40px', border:'none', padding:'0', cursor:'pointer', borderRadius:'4px'}} 
                     />
                     <input 
                       type="text" 
                       value={textColor} 
                       onChange={(e) => setTextColor(e.target.value)} 
                       className={styles.inputField} 
                       style={{maxWidth:'100px'}} 
                     />
                  </div>
                </div>
              </div>
            </div>
            {/* font selection */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>Font</h3>
              <div style={{ position: 'relative', width: '100%' }}>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 15px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    appearance: 'none',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {['Arial, sans-serif', 'Verdana, sans-serif', 'Tahoma, sans-serif', 'Georgia, serif', 'Times New Roman, serif', 'Courier New, monospace', 'Lucida Console, monospace', 'Garamond, serif', 'Palatino, serif', 'Impact, sans-serif'].map(font => (
                    <option key={font} value={font}>{font.split(',')[0]}</option>
                  ))}
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: selectedColor1
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </>
        );

      case 'Information':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>Personal</h3>
            <div>
              {/* Full Name Field - required */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>
                  Full Name
                  <span style={{ color: '#e53e3e', fontSize: '14px', fontWeight: '600' }}>*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8f8f8',
                    color: '#555',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Title Field with Custom Dropdown (same behavior as edit card page) - required */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>
                  Title 
                  <span style={{ color: '#e53e3e', fontSize: '14px', fontWeight: '600' }}>*</span>
                </label>
                <div className="dropdown-container" style={{ position: 'relative' }}>
                  {!isCustomTitle ? (
                    <>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            setTitleSearchTerm(e.target.value);
                          }}
                          onFocus={handleDropdownToggle}
                          required
                          placeholder="Search or select title..."
                          style={{
                            width: '100%',
                            padding: '10px 30px 10px 10px',
                            fontSize: '14px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxSizing: 'border-box',
                            backgroundColor: 'white',
                            color: '#555',
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: '#6B7280',
                          }}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
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
                          {filteredTitles.map((titleOption, index) => (
                            <div
                              key={index}
                              onClick={() => handleTitleSelect(titleOption)}
                              style={{
                                padding: isLargeScreen ? '12px 16px' : '14px 16px',
                                cursor: 'pointer',
                                fontSize: isLargeScreen ? '16px' : '14px',
                                color: '#1F2937',
                                borderBottom:
                                  index < filteredTitles.length - 1 ? '1px solid #E5E7EB' : 'none',
                                backgroundColor: titleOption === 'CUSTOM' ? '#F9FAFB' : '#ffffff',
                                fontWeight: titleOption === 'CUSTOM' ? '600' : 'normal',
                                ...(isLargeScreen
                                  ? {}
                                  : {
                                      minHeight: '44px',
                                      display: 'flex',
                                      alignItems: 'center',
                                    }),
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  titleOption === 'CUSTOM' ? '#F3F4F6' : '#F9FAFB';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  titleOption === 'CUSTOM' ? '#F9FAFB' : '#ffffff';
                              }}
                            >
                              {titleOption}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter custom title..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          boxSizing: 'border-box',
                          backgroundColor: 'white',
                          color: '#555',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => {
                          setIsCustomTitle(false);
                          setIsDropdownOpen(true);
                        }}
                        style={{
                          marginTop: '5px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          backgroundColor: '#6B7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Back to list
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Field */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    color: '#555',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Location Dropdown with Search   - required */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>
                  Location
                 <span style={{ color: '#e53e3e', fontSize: '14px', fontWeight: '600' }}>*</span>
                </label>
                <LocationSelect
                  value={cardLocation}
                  onChange={(val: string) => setCardLocation(val)}
                  placeholder="Search city…"
                />
              </div>

              {/* About / description */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>About / Description</label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div className={styles.inputGroup}><label className={styles.label}>Company</label><input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={styles.inputField} /></div>
            <div className={styles.inputGroup}><label className={styles.label}>Location</label><LocationSelect value={cardLocation} onChange={setCardLocation} /></div>
            <div className={styles.inputGroup}><label className={styles.label}>Description</label><textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} className={styles.textareaField} /></div>
          </div>
        );

      case 'Fields':
        return (
          <div>
            <div style={{ marginBottom: '30px', border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#f9f9f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#333' }}>Core Fields <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>(?)</span></h3>
              </div>

              {/* Email - required */}
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  {/* <span style={{ cursor: 'grab', color: '#aaa' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </span> */}
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Email
                    <span style={{ color: '#e53e3e', fontSize: '14px', fontWeight: '600' }}>*</span>
                  </span>
                  {/* blank space */}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8f8f8',
                    color: '#555',
                    outline: 'none',
                    marginBottom: '10px'
                  }}
                />
                {/* <input
                  type="text"
                  placeholder="Link Box"
                  value={emailLink}
                  onChange={(e) => setEmailLink(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                /> */}
              </div>

              {/* Phone */}
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  {/* <span style={{ cursor: 'grab', color: '#aaa' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </span> */}
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Phone
                  </span>
                  {/* blank space */}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: '#f8f8f8', flex: '1', minWidth: '150px' }}>
                    <span style={{ marginRight: '8px' }}>🇮🇳</span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        fontSize: '14px',
                        color: '#555',
                        flex: '1',
                        width: '100%'
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="# Extension"
                    value={phoneLink}
                    onChange={(e) => setPhoneLink(e.target.value)}
                    style={{
                      width: '100px',
                      minWidth: '80px',
                      padding: '10px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
                {/* <input
                  type="text"
                  placeholder="Link Box"
                  value={phoneLink}
                  onChange={(e) => setPhoneLink(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                /> */}
              </div>

              {/* ====================================================== */}
              {/* START: Added Fields (Services, Skills, etc.)          */}
              {/* ====================================================== */}

              {/* Services */}
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  {/* <span style={{ cursor: 'grab', color: '#aaa' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </span> */}
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Services
                  </span>
                  <button 
                    onClick={() => { setIsPopupOpen(true); setPopupMessage('By adding a comma, you can add another thing in the field'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'inherit' }}>(i)</span>
                  </button>
                </div>
                <textarea
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="e.g. SEO Audits, Content Campaigns"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Portfolio */}
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  {/* <span style={{ cursor: 'grab', color: '#aaa' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </span> */}
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Portfolio
                  </span>
                  {/* blank */}
                </div>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://your-portfolio.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Skills - required*/}
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  {/* <span style={{ cursor: 'grab', color: '#aaa' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </span> */}
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Skills
                    <span style={{ color: '#e53e3e', fontSize: '14px' }}>*</span>
                  </span>
                  <button 
                    onClick={() => { setIsPopupOpen(true); setPopupMessage('By adding a comma, you can add another thing in the field'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'inherit' }}>(i)</span>
                  </button>
                </div>
                <textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. SEO, Content Creation, Analytics"
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Experience - required */}
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  {/* <span style={{ cursor: 'grab', color: '#aaa' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </span> */}
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Experience
                    <span style={{ color: '#e53e3e', fontSize: '14px' }}>*</span>
                  </span>
                  <button 
                    onClick={() => { setIsPopupOpen(true); setPopupMessage('By adding a comma, you can add another thing in the field'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'inherit' }}>(i)</span>
                  </button>
                </div>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. Lead Marketer @ MyKard (2023-Present)"
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Review */}
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  {/* <span style={{ cursor: 'grab', color: '#aaa' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </span> */}
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Review
                  </span>
                  <button 
                    onClick={() => { setIsPopupOpen(true); setPopupMessage('By adding a comma, you can add another thing in the field'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'inherit' }}>(i)</span>
                  </button>
                </div>
                <textarea
                  value={reviews}
                  onChange={(e) => setReviews(e.target.value)}
                  placeholder="e.g. Great work!, Happy Client"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* LinkedIn */}
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  {/* <span style={{ cursor: 'grab', color: '#aaa' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </span> */}
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    LinkedIn
                  </span>
                  {/* blank space */}
                </div>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="e.g. https://linkedin.com/in/..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Website */}
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  {/* <span style={{ cursor: 'grab', color: '#aaa' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  </span> */}
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Website
                  </span>
                  {/* blank space */}
                </div>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://my-portfolio.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* ====================================================== */}
              {/* END: Added Fields                                    */}
              {/* ====================================================== */}


                  {includePhone && (
                    <div style={{display:'flex', gap:'12px', alignItems: 'stretch'}}>
                       
                       {/* Input Container: Grows to fill space */}
                       <div style={{
                          display:'flex', 
                          alignItems:'center', 
                          background: isEditingPhone ? '#ffffff' : '#f3f4f6', 
                          border: isEditingPhone ? `2px solid ${selectedColor1}` : '1px solid #e5e7eb', 
                          borderRadius:'10px', 
                          padding:'0 16px', 
                          flex: 1, // <--- This makes it take maximum width
                          height: '50px', // <--- Taller Height
                          transition: 'all 0.2s ease',
                          boxShadow: isEditingPhone ? `0 0 0 4px ${selectedColor1}15` : 'none'
                       }}>
                          <span style={{marginRight:'12px', fontSize:'20px'}}>🇮🇳</span>
                          <input 
                            type="text" 
                            value={phone} 
                            onChange={(e)=>setPhone(e.target.value)} 
                            disabled={!isEditingPhone}
                            style={{
                              border:'none', 
                              background:'transparent', 
                              outline:'none', 
                              width:'100%', 
                              fontSize: '16px', // Larger font
                              color: isEditingPhone ? '#111827' : '#6b7280',
                              fontWeight: 500,
                              cursor: isEditingPhone ? 'text' : 'not-allowed'
                            }} 
                            placeholder="9876543210"
                          />
                       </div>
                       
                       {/* Action Button: Compact width */}
                       <button 
                         onClick={handlePhoneAction}
                         style={{
                           padding:'0 24px', 
                           height: '50px', // Matches input height
                           fontSize:'14px',
                           fontWeight: 600,
                           backgroundColor: isEditingPhone ? '#10b981' : 'white', // Green when saving
                           color: isEditingPhone ? 'white' : selectedColor1,
                           border: isEditingPhone ? 'none' : `2px solid ${selectedColor1}30`,
                           borderRadius:'10px',
                           cursor:'pointer',
                           minWidth: '80px', // Fixed minimum width
                           whiteSpace: 'nowrap',
                           transition: 'all 0.2s',
                           boxShadow: isEditingPhone ? '0 4px 6px -1px rgba(16, 185, 129, 0.3)' : 'none'
                         }}
                       >
                         {isEditingPhone ? 'Save' : 'Edit'}
                       </button>
                    </div>
                  )}
               </div>
               
               {/* LinkedIn */}
               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                  <span className={styles.label}>LinkedIn</span>
                  <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={styles.inputField} />
               </div>

               {/* Website */}
               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                  <span className={styles.label}>Website</span>
                  <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className={styles.inputField} />
               </div>

               {/* Services */}
               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Services</span>
                 <textarea value={services} onChange={(e)=>setServices(e.target.value)} className={styles.textareaField} rows={3} placeholder="e.g. SEO Audits, Content Campaigns" />
               </div>

               {/* Portfolio */}
               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Portfolio</span>
                 <input type="url" value={portfolio} onChange={(e)=>setPortfolio(e.target.value)} className={styles.inputField} placeholder="https://your-portfolio.com" />
               </div>

               {/* Skills */}
               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Skills</span>
                 <textarea value={skills} onChange={(e)=>setSkills(e.target.value)} className={styles.textareaField} rows={3} placeholder="e.g. React, Node.js" />
               </div>

               {/* Experience */}
               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Experience</span>
                 <textarea value={experience} onChange={(e)=>setExperience(e.target.value)} className={styles.textareaField} rows={3} placeholder="e.g. Senior Dev @ Google (2020-Present)" />
               </div>

               {/* Reviews */}
               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Reviews</span>
                 <textarea value={reviews} onChange={(e)=>setReviews(e.target.value)} className={styles.textareaField} rows={3} placeholder="Client testimonials..." />
               </div>

               {/* Document Upload */}
               <div className={styles.fieldCard}>
                 <div className={styles.fieldHeader}>
                    <span className={styles.label}>Document (Resume/Portfolio)</span>
                 </div>
                 
                 <input 
                   type="file" 
                   accept=".pdf,.doc,.docx" 
                   style={{display:'none'}} 
                   id="doc-upload" 
                   onChange={(e) => { if(e.target.files?.[0]) setResumeFile(e.target.files[0]) }} 
                 />
                 
                 {/* Upload Button */}
                 <button 
                   onClick={() => document.getElementById('doc-upload')?.click()} 
                   className={styles.documentUploadBtn}
                   style={{ 
                     color: selectedColor1, 
                     borderColor: selectedColor1 
                   }}
                 >
                   <svg 
                     xmlns="http://www.w3.org/2000/svg" 
                     width="20" 
                     height="20" 
                     viewBox="0 0 24 24" 
                     fill="none" 
                     stroke="currentColor" 
                     strokeWidth="2" 
                     strokeLinecap="round" 
                     strokeLinejoin="round"
                     style={{ flexShrink: 0 }}
                   >
                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                     <polyline points="17 8 12 3 7 8"></polyline>
                     <line x1="12" y1="3" x2="12" y2="15"></line>
                   </svg>
                   <span>
                     {resumeFile ? `Change (${resumeFile.name})` : 'Upload Document'}
                   </span>
                 </button>

                 {/* Remove Button (Only shows if file exists) */}
                 {resumeFile && (
                   <button 
                     onClick={() => setResumeFile(null)} 
                     className={styles.documentUploadBtn}
                     style={{
                       marginTop:'10px', 
                       color:'#dc2626', 
                       borderColor:'#dc2626', 
                       backgroundColor: '#fff5f5'
                     }}
                   >
                     <svg 
                       xmlns="http://www.w3.org/2000/svg" 
                       width="18" 
                       height="18" 
                       viewBox="0 0 24 24" 
                       fill="none" 
                       stroke="currentColor" 
                       strokeWidth="2" 
                       strokeLinecap="round" 
                       strokeLinejoin="round"
                       style={{ flexShrink: 0 }}
                     >
                       <polyline points="3 6 5 6 21 6"></polyline>
                       <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                     </svg>
                     <span>Remove Document</span>
                   </button>
                 )}
               </div>

             </div>

             <div style={{ marginTop: '30px' }}>
                <h3 className={styles.subTitle}>Additional Fields</h3>
                {extraFields.map((field) => (
                  <div key={field.id} className={styles.inputGroup} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                      <span className={styles.label} style={{color: selectedColor1}}>{field.name}</span>
                      <span onClick={() => handleDeleteField(field.id)} style={{cursor:'pointer', color:'#888'}}>Delete</span>
                    </div>
                    <input type="text" value={field.link} onChange={(e) => handleExtraFieldChange(field.id, e.target.value)} className={styles.inputField} placeholder="Link" />
                  </div>
                ))}
                
                <button onClick={() => setIsModalOpen(true)} className={styles.btnOutline} style={{borderColor: selectedColor1, color: selectedColor1}}>+ Add Field</button>
             </div>
          </div>
        );

      case 'Card':
        return (
          <div>
            
            <div style={{
              backgroundColor: '#e0f7fa',
              border: '1px solid #b2ebf2',
              borderRadius: '8px',
              padding: '10px 15px',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#00796b',
              fontSize: '13px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              This field does not appear on the card.
            </div>
            {/* card name - required */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 600 }}>
                Card Name <span style={{ color: '#e53e3e', fontSize: '14px' }}>*</span>
                <span style={{ color: '#999', fontSize: '11px', fontWeight: 400 }}> (main name displayed on card)</span>
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="e.g., John Smith, ABC Company, Professional"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #145dfd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
            {/* card type - required */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 600 }}>Card Type 
                <span style={{ color: '#e53e3e', fontSize: '14px' }}>*</span>
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              >
                <option value="">Select card type...</option>
                {getAllCardTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              
              {/* Custom Type Input */}
              {!showCustomTypeInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomTypeInput(true)}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    color: selectedColor1 || '#2563eb',
                    background: 'transparent',
                    border: `1px solid ${selectedColor1 || '#2563eb'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  + Add custom type
                </button>
              ) : (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={customTypeInput}
                    onChange={(e) => setCustomTypeInput(e.target.value)}
                    placeholder="Enter custom type..."
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      fontSize: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomType}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: 'white',
                      background: selectedColor1 || '#2563eb',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomTypeInput(false);
                      setCustomTypeInput('');
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#666',
                      background: 'transparent',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    Cancel
                  </button>
                </div>
             )}
          </div>
        );
      default: return null;
    }
  };

  if (isLoadingUser) return <div className={styles.pageWrapper} style={{justifyContent:'center', alignItems:'center'}}>Loading...</div>;

  return (
    <div className={styles.pageWrapper}>
       <div className={styles.container}>
          <div className={styles.cardPreviewWrapper}>
             {renderTemplatePreview()}
          </div>

          <div className={styles.editPanel}>
             <div className={styles.tabContainer}>
                {['Display', 'Information', 'Fields', 'Card'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={styles.tabButton} style={{ borderBottom: activeTab === tab ? `2px solid ${selectedColor1}` : 'none', color: activeTab === tab ? selectedColor1 : '#777' }}>{tab}</button>
                ))}
             </div>

             {renderContent()}

             <div className={styles.buttonGroup}>
                <button onClick={() => router.push('/dashboard')} className={`${styles.baseButton} ${styles.btnSecondary}`}>Cancel</button>
                <button onClick={handleSaveCard} disabled={isSaving} className={`${styles.baseButton} ${styles.btnPrimary}`} style={{backgroundColor: isSaving ? '#999' : selectedColor1}}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
             </div>
          </div>
        </div>
      )}
      {/* --- END Modal --- */}

      {isPopupOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            textAlign: 'center',
            maxWidth: '350px',
          }}
          onClick={() => setIsPopupOpen(false)}
        >
          <p style={{ margin: '0 0 15px', fontSize: '15px', color: '#333', fontWeight: '500' }}>{popupMessage}</p>
          <button
            onClick={() => setIsPopupOpen(false)}
            style={{
              backgroundColor: selectedColor1,
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatePage;