'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DigitalCardPreviewComponent from '@/components/cards/DigitalCardPreview';
import FlatCardPreviewComponent from '@/components/cards/FlatCardPreview';
import ModernCardPreviewComponent from '@/components/cards/ModernCardPreview';
import SleekCardPreviewComponent from '@/components/cards/SleekCardPreview';
import LocationSelect from "@/components/LocationSelect"; 

// Import Shared CSS
import styles from './edit.module.css'; 

interface ExtraField {
  id: number;
  name: string;
  link: string;
}

const FONT_OPTIONS = [
  { label: 'Standard (Arial)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Modern (Verdana)', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Clean (Open Sans/Segoe)', value: '"Segoe UI", "Open Sans", Helvetica, sans-serif' },
  { label: 'Minimal (Helvetica)', value: 'Helvetica, "Helvetica Neue", Arial, sans-serif' },
  { label: 'Humanist (Gill Sans)', value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
  { label: 'Rounded (Tahoma)', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Stylish (Trebuchet)', value: '"Trebuchet MS", "Lucida Sans Unicode", sans-serif' },
  { label: 'Elegant (Georgia)', value: 'Georgia, serif' },
  { label: 'Classic (Times New Roman)', value: '"Times New Roman", Times, serif' },
  { label: 'Formal (Palatino)', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
  { label: 'Old Style (Garamond)', value: 'Garamond, Baskerville, "Baskerville Old Face", serif' },
  { label: 'Bold (Impact)', value: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' },
  { label: 'Monospace (Courier)', value: '"Courier New", Courier, monospace' },
  { label: 'Terminal (Lucida)', value: '"Lucida Console", Monaco, monospace' },
  { label: 'Comic (Comic Sans)', value: '"Comic Sans MS", "Chalkboard SE", sans-serif' },
  { label: 'Fantasy (Copperplate)', value: 'Copperplate, Papyrus, fantasy' },
];

const EditPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cardId = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState('Display');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  const [company, setCompany] = useState('MyKard');
  const [headline, setHeadline] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [selectedFont, setSelectedFont] = useState('Arial, sans-serif');
  const [cardName, setCardName] = useState('');
  const [cardType, setCardType] = useState('Personal');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [cardLocation, setCardLocation] = useState('California, USA');
  
  const [about, setAbout] = useState('A modern digital visiting card for software designer showcasing professional details, social links, and portfolio');
  const [skills, setSkills] = useState('SEO, Content Creation, Analytics');
  const [portfolio, setPortfolio] = useState('Case Study 1, Project X');
  const [experience, setExperience] = useState('Lead Marketer @ MyKard (2023-Present)');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [services, setServices] = useState('SEO Audits, Slogan Content Campaigns');
  const [reviews, setReviews] = useState('John transformed our online presence!, Happy Client');

  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLink, setNewFieldLink] = useState('');
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [isCustomFieldName, setIsCustomFieldName] = useState(false);

  const socialPlatforms = [
    'WhatsApp', 'GitHub', 'Twitter', 'Instagram', 'Facebook', 
    'YouTube', 'Discord', 'Telegram', 'X', 'Other'
  ];

  const [professionalTitles, setProfessionalTitles] = useState<string[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<string[]>([]);
  const [titleSearchTerm, setTitleSearchTerm] = useState('');

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [existingCardId, setExistingCardId] = useState<string | null>(null);

  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  useEffect(() => {
    const fetchCardData = async () => {
      if (!cardId) return;
      try {
        setIsLoading(true);
        const response = await fetch(`/api/card/${cardId}`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch card');
        const data = await response.json();
        if (data.success && data.card) {
          const card = data.card;
          setFirstName(card.firstName || '');
          setMiddleName(card.middleName || '');
          setLastName(card.lastName || '');
          setPrefix(card.prefix || '');
          setSuffix(card.suffix || '');
          setPreferredName(card.preferredName || '');
          setMaidenName(card.maidenName || '');
          setPronouns(card.pronouns || '');
          setEmail(card.email || '');
          
          // Phone Data Load
          setPhone(card.phone || '');
          setIncludePhone(!!card.phone); // If phone exists, toggle is ON

          setEmailLink(card.emailLink || '');
          setPhoneLink(card.phoneLink || '');
          setTitle(card.title || '');
          setCompany(card.company || '');
          setDepartment(card.department || '');
          setAffiliation(card.affiliation || '');
          setHeadline(card.headline || '');
          setAccreditations(card.accreditations || '');
          setCardLocation(card.location || '');
          setAbout(card.bio || card.about || '');
          setSkills(card.skills || '');
          setPortfolio(card.portfolio || '');
          setExperience(card.experience || '');
          setServices(card.services || '');
          setReviews(card.reviews || '');
          setLinkedin(card.linkedinUrl || '');
          setWebsite(card.websiteUrl || '');
          setProfileImage(card.profileImage || null);
          setBannerImage(card.coverImage || null);
          setSelectedDesign(card.selectedDesign || 'Classic');
          setSelectedColor1(card.selectedColor || '#145dfd');
          setSelectedColor2(card.selectedColor2 || '#145dfd');
          setTextColor(card.textColor || '#ffffff');
          setSelectedFont(card.selectedFont || 'Arial, sans-serif');
          setCardName(card.cardName || '');
          setCardType(card.cardType || 'Personal');
          setDocumentUrl(card.documentUrl || '');
          setExistingCardId(card.id);

          if (card.customFields) {
            try {
              const fields = typeof card.customFields === 'string' ? JSON.parse(card.customFields) : card.customFields;
              if (Array.isArray(fields)) setExtraFields(fields);
            } catch (e) { console.error(e); setExtraFields([]); }
          }
          toast.success('Card loaded');
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCardData();
  }, [cardId]);

  useEffect(() => {
    const loadProfessions = async () => {
      try {
        const response = await fetch('/assets/all_professions.csv');
        const csvText = await response.text();
        const professions = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0).sort();
        setProfessionalTitles([...professions, 'CUSTOM']);
        setFilteredTitles([...professions, 'CUSTOM']);
      } catch (error) {
        const fallbackTitles = ['Software Engineer', 'Product Manager', 'Designer', 'Founder', 'CUSTOM'];
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

  const handleAddCustomType = () => { if (customTypeInput.trim()) { setCustomTypes([...customTypes, customTypeInput]); setCardType(customTypeInput.trim()); setCustomTypeInput(''); setShowCustomTypeInput(false); } };
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
      if (!cardName.trim()) { toast.error('Please enter a card name'); setIsSaving(false); return; }



      if (includePhone && !phone.trim()) {
         setPopupMessage('You enabled "Show on Card" but the phone number is empty. Please enter a number or disable the toggle.');
         setIsPopupOpen(true);
         setIsSaving(false);
         return;
      }

      // Final validation before sending to API
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
      
      // Logic: Only send phone if Toggle is TRUE
      if (includePhone && phone) {
        formData.append('phone', phone);
      } else {
        formData.append('phone', ''); // Send empty to clear it in DB
      }

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

      const isUpdating = existingCardId || cardId;
      const endpoint = isUpdating ? `/api/card/update/${existingCardId || cardId}` : '/api/card/create';
      const method = isUpdating ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, { method, body: formData, credentials: 'include' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      
      setExistingCardId(data.card.id);
      setIsPopupOpen(true);
      setPopupMessage(isUpdating ? 'Card updated successfully!' : 'Card created successfully!');
    } catch (error: any) {
      console.error('Error saving card:', error);
      
      setPopupMessage(error.message || 'Failed to save card. Please try again.');
      setIsPopupOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!existingCardId && !cardId) return;
    try {
      setIsDeleting(true);
      const response = await fetch('/api/card/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: existingCardId || cardId }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Card deleted');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDocumentClick = (url: string) => { if (url) window.open(url, '_blank'); };

  const renderTemplatePreview = () => {
    // Only show phone in preview if included
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
            
            <div className={styles.inputGroup}>
              <h3 className={styles.subTitle}>Cover Image</h3>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} id="banner-upload" onChange={(e) => { if(e.target.files?.[0]) setBannerImage(URL.createObjectURL(e.target.files[0])) }} />
                <button onClick={() => document.getElementById('banner-upload')?.click()} className={styles.btnIcon}>Add Cover Image</button>
              </div>
            </div>

            <div className={styles.inputGroup}>
               <h3 className={styles.subTitle}>Color</h3>
               {/* Color 1 */}
               <div className={styles.inputGroup}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                     <input type="color" value={hexValue1} onChange={handleColorInputChange1} style={{width:'50px', height:'30px', border:'none', padding:'0'}} />
                     <span>Color 1</span>
                  </div>
                  <div className={styles.rgbInputsWrapper}>
                     <div className={styles.rgbInputGroup}><label className={styles.label}>R</label><input type="number" value={rValue1} onChange={handleRChange1} className={styles.inputField} /></div>
                     <div className={styles.rgbInputGroup}><label className={styles.label}>G</label><input type="number" value={gValue1} onChange={handleGChange1} className={styles.inputField} /></div>
                     <div className={styles.rgbInputGroup}><label className={styles.label}>B</label><input type="number" value={bValue1} onChange={handleBChange1} className={styles.inputField} /></div>
                  </div>
               </div>
               {/* Color 2 */}
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

            <div className={styles.inputGroup}>
               <h3 className={styles.subTitle}>Typography</h3>
               <label className={styles.label}>Font Style</label>
               <select 
                 value={selectedFont} 
                 onChange={(e) => setSelectedFont(e.target.value)} 
                 className={styles.selectField}
               >
                 {FONT_OPTIONS.map((font) => (
                   <option key={font.value} value={font.value}>
                     {font.label}
                   </option>
                 ))}
               </select>
            </div>
          </>
        );

      case 'Information':
        return (
          <div>
            <h3 className={styles.sectionTitle}>Personal</h3>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Full Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`${styles.inputField} ${styles.inputGray}`} />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Title</label>
              <div className="dropdown-container" style={{ position: 'relative' }}>
                {!isCustomTitle ? (
                  <>
                    <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setTitleSearchTerm(e.target.value); }} onFocus={handleDropdownToggle} placeholder="Search or select..." className={styles.inputField} />
                    {isDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                         {filteredTitles.map((t, i) => (
                           <div key={i} onClick={() => handleTitleSelect(t)} style={{padding:'10px', cursor:'pointer', borderBottom:'1px solid #eee'}}>{t}</div>
                         ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{display:'flex', gap:'5px', flexDirection:'column'}}>
                     <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Custom Title" className={styles.inputField} />
                     <button onClick={() => {setIsCustomTitle(false); setIsDropdownOpen(true);}} style={{fontSize:'12px', background:'none', border:'none', color:'#666', cursor:'pointer', textAlign:'left'}}>Back to list</button>
                  </div>
                )}
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
               <h3 className={styles.subTitle}>Core Fields</h3>
               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                  <span className={styles.label}>Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${styles.inputField} ${styles.inputGray}`} />
               </div>
               
               {/* ----------------- FIXED PHONE INPUT ----------------- */}
               <div className={styles.inputGroup} style={{background:'white', padding:'20px', borderRadius:'12px', border:'1px solid #e5e7eb', boxShadow:'0 2px 4px rgba(0,0,0,0.02)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                     <span className={styles.label} style={{marginBottom:0}}>Phone Number</span>
                     
                     {/* Privacy Toggle */}
                     <label style={{
                        display:'flex', 
                        alignItems:'center', 
                        gap:'8px', 
                        fontSize:'13px', 
                        cursor:'pointer', 
                        color:'#4b5563', 
                        fontWeight: 500,
                        userSelect: 'none'
                     }}>
                        <div style={{position:'relative', width:'36px', height:'20px'}}>
                           <input 
                             type="checkbox" 
                             checked={includePhone} 
                             onChange={(e) => {
                                const isChecked = e.target.checked;
                                setIncludePhone(isChecked);
                                if (!isChecked) setIsEditingPhone(false);
                                else if (!phone) setIsEditingPhone(true);
                             }} 
                             style={{opacity:0, width:0, height:0}}
                           />
                           <span style={{
                              position:'absolute', cursor:'pointer', top:0, left:0, right:0, bottom:0, 
                              backgroundColor: includePhone ? selectedColor1 : '#ccc', 
                              transition:'.4s', borderRadius:'34px'
                           }}></span>
                           <span style={{
                              position:'absolute', content:'', height:'16px', width:'16px', 
                              left: includePhone ? '18px' : '2px', bottom:'2px', 
                              backgroundColor:'white', transition:'.4s', borderRadius:'50%'
                           }}></span>
                        </div>
                        {includePhone ? 'Visible' : 'Hidden'}
                     </label>
                  </div>

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
               {/* ---------------------------------------------------- */}
               
               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                  <span className={styles.label}>LinkedIn</span>
                  <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={styles.inputField} />
               </div>

               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                  <span className={styles.label}>Website</span>
                  <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className={styles.inputField} />
               </div>

               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Services</span>
                 <textarea value={services} onChange={(e)=>setServices(e.target.value)} className={styles.textareaField} rows={3} placeholder="e.g. SEO Audits, Content Campaigns" />
               </div>

               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Portfolio</span>
                 <input type="url" value={portfolio} onChange={(e)=>setPortfolio(e.target.value)} className={styles.inputField} placeholder="https://your-portfolio.com" />
               </div>

               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Skills</span>
                 <textarea value={skills} onChange={(e)=>setSkills(e.target.value)} className={styles.textareaField} rows={3} placeholder="e.g. React, Node.js" />
               </div>

               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Experience</span>
                 <textarea value={experience} onChange={(e)=>setExperience(e.target.value)} className={styles.textareaField} rows={3} placeholder="e.g. Senior Dev @ Google (2020-Present)" />
               </div>

               <div className={styles.inputGroup} style={{background:'white', padding:'15px', borderRadius:'8px', border:'1px solid #ddd'}}>
                 <span className={styles.label}>Reviews</span>
                 <textarea value={reviews} onChange={(e)=>setReviews(e.target.value)} className={styles.textareaField} rows={3} placeholder="Client testimonials..." />
               </div>

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
             <div className={styles.inputGroup}>
                <label className={styles.label}>Card Name *</label>
                <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} className={styles.inputField} style={{borderColor: '#145dfd'}} />
             </div>
             <div className={styles.inputGroup}>
                <label className={styles.label}>Card Type</label>
                <select value={cardType} onChange={(e) => setCardType(e.target.value)} className={styles.selectField}>
                   <option value="">Select...</option>
                   {getAllCardTypes().map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
             {!showCustomTypeInput ? (
                <button onClick={() => setShowCustomTypeInput(true)} style={{fontSize:'12px', color:selectedColor1, background:'transparent', border:'none', cursor:'pointer'}}>+ Add Custom Type</button>
             ) : (
                <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                   <input type="text" value={customTypeInput} onChange={(e)=>setCustomTypeInput(e.target.value)} className={styles.inputField} placeholder="Enter Type" />
                   <button onClick={handleAddCustomType} className={`${styles.baseButton} ${styles.btnPrimary}`} style={{backgroundColor:selectedColor1}}>Save</button>
                   <button onClick={()=>{setShowCustomTypeInput(false); setCustomTypeInput('')}} className={`${styles.baseButton} ${styles.btnSecondary}`}>Cancel</button>
                </div>
             )}
          </div>
        );
      default: return null;
    }
  };

  if (isLoading) return <div className={styles.pageWrapper} style={{justifyContent:'center', alignItems:'center'}}>Loading...</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.cardPreviewWrapper}>{renderTemplatePreview()}</div>
        
        <div className={styles.editPanel}>
          <div className={styles.tabContainer}>
            {['Display', 'Information', 'Fields', 'Card'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={styles.tabButton} style={{ borderBottom: activeTab === tab ? `2px solid ${selectedColor1}` : 'none', color: activeTab === tab ? selectedColor1 : '#777' }}>{tab}</button>
            ))}
          </div>
          
          {renderContent()}

          <div className={styles.buttonGroup}>
            <button onClick={() => router.push('/dashboard')} className={`${styles.baseButton} ${styles.btnSecondary}`}>Cancel</button>
            
            {(existingCardId || cardId) && (
               <button onClick={() => setIsDeleteConfirmOpen(true)} disabled={isDeleting} style={{backgroundColor:'#dc3545', color:'white', border:'none'}} className={styles.baseButton}>{isDeleting ? 'Deleting...' : 'Delete'}</button>
            )}

            <button onClick={handleSaveCard} disabled={isSaving} className={`${styles.baseButton} ${styles.btnPrimary}`} style={{ backgroundColor: isSaving ? '#999' : selectedColor1 }}>{isSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.subTitle}>Add New Field</h3>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Field Name</label>
              {!isCustomFieldName ? (
                <select
                  value={socialPlatforms.includes(newFieldName) ? newFieldName : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') { setIsCustomFieldName(true); setNewFieldName(''); } 
                    else { setNewFieldName(val); }
                  }}
                  className={styles.selectField}
                >
                  <option value="" disabled>Select Platform...</option>
                  {socialPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="Enter name" className={styles.inputField} autoFocus />
                  <button onClick={() => setIsCustomFieldName(false)} className={styles.btnSecondary} style={{padding:'0 15px', fontSize:'12px'}}>Back</button>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Link Box</label>
              <input type="text" value={newFieldLink} onChange={(e) => setNewFieldLink(e.target.value)} className={styles.inputField} placeholder="https://..." />
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={() => setIsModalOpen(false)} className={`${styles.baseButton} ${styles.btnSecondary}`}>Cancel</button>
              <button onClick={handleAddField} className={`${styles.baseButton} ${styles.btnPrimary}`} style={{ backgroundColor: selectedColor1 }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {isPopupOpen && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{textAlign:'center', maxWidth:'300px'}}>
               <p style={{marginBottom:'15px'}}>{popupMessage}</p>
               <button onClick={() => setIsPopupOpen(false)} className={`${styles.baseButton} ${styles.btnPrimary}`} style={{backgroundColor: selectedColor1}}>Got it!</button>
            </div>
         </div>
      )}
      
       {isDeleteConfirmOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDeleteConfirmOpen(false)}>
           <div className={styles.modalContent} style={{maxWidth:'350px', textAlign:'center'}} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.subTitle} style={{color:'#dc3545'}}>Delete Card</h3>
              <p>Are you sure? This cannot be undone.</p>
              <div className={styles.buttonGroup} style={{justifyContent:'center'}}>
                 <button onClick={() => setIsDeleteConfirmOpen(false)} className={`${styles.baseButton} ${styles.btnSecondary}`}>Cancel</button>
                 <button onClick={handleDeleteCard} className={styles.baseButton} style={{backgroundColor:'#dc3545', color:'white', border:'none'}}>Delete</button>
              </div>
           </div>
        </div>
       )}
    </div>
  );
};

const LoadingFallback = () => <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

const EditPageWrapper = () => ( <Suspense fallback={<LoadingFallback />}> <EditPage /> </Suspense> );

export default EditPageWrapper;