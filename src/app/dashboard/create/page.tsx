'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DigitalCardPreviewComponent from '@/components/cards/DigitalCardPreview';
import FlatCardPreviewComponent from '@/components/cards/FlatCardPreview';
import ModernCardPreviewComponent from '@/components/cards/ModernCardPreview';
import SleekCardPreviewComponent from '@/components/cards/SleekCardPreview';
import LocationSelect from "@/components/LocationSelect"; 


// ====================================================================
// START: EditPage Component
// ====================================================================

// Define interface for the new fields
interface ExtraField {
  id: number;
  name: string;
  link: string;
}

const EditPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Display');
  const [selectedColor1, setSelectedColor1] = useState('');
  const [selectedColor2, setSelectedColor2] = useState(''); 
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailLink, setEmailLink] = useState('');
  const [phoneLink, setPhoneLink] = useState('');
  const [selectedDesign, setSelectedDesign] = useState('');
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
  const [selectedFont, setSelectedFont] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardType, setCardType] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [cardLocation, setCardLocation] = useState('');
  
  // Renamed cardDescription to about
  const [about, setAbout] = useState('');

  // --- NEW STATE for DigitalCardPreview ---
  const [skills, setSkills] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [experience, setExperience] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  // --- ADDED NEW STATE ---
  const [services, setServices] = useState('');
  const [reviews, setReviews] = useState('');
  // --- END NEW STATE ---
  
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  // Card Type functionality
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [customTypeInput, setCustomTypeInput] = useState('');
  
  // Loading state for user data
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          // Set user data with fallbacks
          setFirstName(user.fullName?.split(' ')[0] || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
          setProfileImage(user.profileImage || null);
          setOriginalUserProfileImage(user.profileImage || null);
          
          // Set some defaults
          setSelectedColor1('#145dfd');
          setSelectedColor2('#00c0fd');
          setSelectedDesign('Classic');
          setSelectedFont('Arial, sans-serif');
          setCardType('Personal');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set defaults even if fetch fails
        setSelectedColor1('#145dfd');
        setSelectedColor2('#00c0fd');
        setSelectedDesign('Classic');
        setSelectedFont('Arial, sans-serif');
        setCardType('Personal');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // --- NEW STATE for "Add Field" Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLink, setNewFieldLink] = useState('');
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  // --- END NEW STATE ---

  const [professionalTitles, setProfessionalTitles] = useState<string[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<string[]>([]);
  const [titleSearchTerm, setTitleSearchTerm] = useState('');

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [existingCardId, setExistingCardId] = useState<string | null>(null);

  const hexToRgb = (hex: string) => {
    // Ensure hex is valid
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

  const initialRgb2 = hexToRgb(selectedColor2); // New state for second color
  const [rValue2, setRValue2] = useState(initialRgb2.r);
  const [gValue2, setGValue2] = useState(initialRgb2.g);
  const [bValue2, setBValue2] = useState(initialRgb2.b);
  const [hexValue2, setHexValue2] = useState(selectedColor2);

  React.useEffect(() => {
    const newRgb1 = hexToRgb(selectedColor1);
    if (newRgb1) {
      setRValue1(newRgb1.r);
      setGValue1(newRgb1.g);
      setBValue1(newRgb1.b);
      setHexValue1(selectedColor1);
    }
  }, [selectedColor1]);

  React.useEffect(() => { // New useEffect for second color
    const newRgb2 = hexToRgb(selectedColor2);
    if (newRgb2) {
      setRValue2(newRgb2.r);
      setGValue2(newRgb2.g);
      setBValue2(newRgb2.b);
      setHexValue2(selectedColor2);
    }
  }, [selectedColor2]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDropdownToggle = () => {
    if (!isDropdownOpen) {
      setTitleSearchTerm('');
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTitleSelect = (selectedTitle: string) => {
    if (selectedTitle === 'CUSTOM') {
      setIsCustomTitle(true);
      setTitle('');
    } else {
      setIsCustomTitle(false);
      setTitle(selectedTitle);
    }
    setIsDropdownOpen(false);
  };

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
        setProfessionalTitles([...professions, 'CUSTOM']);
        setFilteredTitles([...professions, 'CUSTOM']);
      } catch (error) {
        console.error('Error loading professions:', error);
        const fallbackTitles = [
          'Software Engineer', 'Product Manager', 'UX Designer', 'UI Designer',
          'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
          'Mobile Developer', 'Data Scientist', 'Data Analyst', 'Marketing Manager',
          'Digital Marketer', 'Content Creator', 'Social Media Manager',
          'Business Analyst', 'Project Manager', 'Consultant', 'Entrepreneur',
          'Founder', 'CEO', 'CTO', 'CFO', 'COO', 'Sales Manager',
          'Account Manager', 'HR Manager', 'Recruiter', 'Teacher', 'Professor',
          'Doctor', 'Lawyer', 'Architect', 'Graphic Designer', 'Photographer',
          'Videographer', 'Writer', 'Editor', 'Journalist', 'Researcher',
          'Engineer', 'Manager', 'Director', 'Coordinator', 'Specialist', 'CUSTOM',
        ];
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
      const filtered = professionalTitles.filter(option =>
        option.toLowerCase().includes(titleSearchTerm.toLowerCase())
      );
      setFilteredTitles(filtered);
    }
  }, [titleSearchTerm, professionalTitles]);

  const handleRChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const r = Number(e.target.value);
    if (!isNaN(r) && r >= 0 && r <= 255) {
      setRValue1(r);
      const newHex = rgbToHex(r, gValue1, bValue1);
      setHexValue1(newHex);
      setSelectedColor1(newHex);
    }
  };

  const handleGChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const g = Number(e.target.value);
    if (!isNaN(g) && g >= 0 && g <= 255) {
      setGValue1(g);
      const newHex = rgbToHex(rValue1, g, bValue1);
      setHexValue1(newHex);
      setSelectedColor1(newHex);
    }
  };

  const handleBChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const b = Number(e.target.value);
    if (!isNaN(b) && b >= 0 && b <= 255) {
      setBValue1(b);
      const newHex = rgbToHex(rValue1, gValue1, b);
      setHexValue1(newHex);
      setSelectedColor1(newHex);
    }
  };

  const handleHexChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value.toUpperCase();
    if (!hex.startsWith('#')) {
        hex = '#' + hex;
    }
    
    if (/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
        setHexValue1(hex);
        const newRgb = hexToRgb(hex);
        if(newRgb) {
            setRValue1(newRgb.r);
            setGValue1(newRgb.g);
            setBValue1(newRgb.b);
            setSelectedColor1(hex);
        }
    } else {
         setHexValue1(hex); // Allow user to type
    }
  };

  const handleColorInputChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setHexValue1(hex);
    const newRgb = hexToRgb(hex);
    setRValue1(newRgb.r);
    setGValue1(newRgb.g);
    setBValue1(newRgb.b);
    setSelectedColor1(hex);
  };

  // New handlers for second color
  const handleRChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const r = Number(e.target.value);
    if (!isNaN(r) && r >= 0 && r <= 255) {
      setRValue2(r);
      const newHex = rgbToHex(r, gValue2, bValue2);
      setHexValue2(newHex);
      setSelectedColor2(newHex);
    }
  };

  const handleGChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const g = Number(e.target.value);
    if (!isNaN(g) && g >= 0 && g <= 255) {
      setGValue2(g);
      const newHex = rgbToHex(rValue2, g, bValue2);
      setHexValue2(newHex);
      setSelectedColor2(newHex);
    }
  };

  const handleBChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const b = Number(e.target.value);
    if (!isNaN(b) && b >= 0 && b <= 255) {
      setBValue2(b);
      const newHex = rgbToHex(rValue2, gValue2, b);
      setHexValue2(newHex);
      setSelectedColor2(newHex);
    }
  };

  const handleHexChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value.toUpperCase();
    if (!hex.startsWith('#')) {
        hex = '#' + hex;
    }
    
    if (/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
        setHexValue2(hex);
        const newRgb = hexToRgb(hex);
        if(newRgb) {
            setRValue2(newRgb.r);
            setGValue2(newRgb.g);
            setBValue2(newRgb.b);
            setSelectedColor2(hex);
        }
    } else {
         setHexValue2(hex); // Allow user to type
    }
  };

  const handleColorInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setHexValue2(hex);
    const newRgb = hexToRgb(hex);
    setRValue2(newRgb.r);
    setGValue2(newRgb.g);
    setBValue2(newRgb.b);
    setSelectedColor2(hex);
  };

  // --- NEW HANDLER FUNCTIONS for "Add Field" ---
  const handleAddField = () => {
    if (newFieldName.trim()) {
      const newField: ExtraField = {
        id: Date.now(),
        name: newFieldName,
        link: newFieldLink,
      };
      setExtraFields([...extraFields, newField]);
      setNewFieldName('');
      setNewFieldLink('');
      setIsModalOpen(false);
    }
  };

  const handleDeleteField = (id: number) => {
    setExtraFields(extraFields.filter(field => field.id !== id));
  };

  const handleExtraFieldChange = (id: number, value: string) => {
    setExtraFields(extraFields.map(field =>
      field.id === id ? { ...field, link: value } : field
    ));
  };

  // Card Type helper functions
  const builtInTypes = ['Personal', 'Professional', 'Business', 'Company', 'Creator', 'Influencer'];
  
  const handleAddCustomType = () => {
    if (customTypeInput.trim() && !builtInTypes.includes(customTypeInput.trim()) && !customTypes.includes(customTypeInput.trim())) {
      setCustomTypes([...customTypes, customTypeInput.trim()]);
      setCardType(customTypeInput.trim());
      setCustomTypeInput('');
      setShowCustomTypeInput(false);
    }
  };

  const getAllCardTypes = () => {
    return [...builtInTypes, ...customTypes];
  };

  // --- END NEW HANDLER FUNCTIONS ---

  // Save card function
  const handleSaveCard = async () => {
    try {
      setIsSaving(true);

      // Validate required fields - cardName is required
      if (!cardName || cardName.trim() === '') {
        setIsPopupOpen(true);
        setPopupMessage('Please enter all the required details.');
        setIsSaving(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      
      // Add card name as the main identifier
      formData.append('cardName', cardName);
      if (firstName) formData.append('firstName', firstName);
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
      if (phone) formData.append('phone', phone);
      if (emailLink) formData.append('emailLink', emailLink);
      if (phoneLink) formData.append('phoneLink', phoneLink);
      if (cardLocation) formData.append('location', cardLocation);
      if (linkedin) formData.append('linkedinUrl', linkedin);
      if (website) formData.append('websiteUrl', website);
      if (cardType) formData.append('cardType', cardType);
      if (selectedDesign) {
        console.log('🎨 Sending selectedDesign:', selectedDesign);
        formData.append('selectedDesign', selectedDesign);
      }
      if (selectedColor1) formData.append('selectedColor', selectedColor1);
      if (selectedColor2) formData.append('selectedColor2', selectedColor2);
      if (selectedFont) formData.append('selectedFont', selectedFont);
      if (about) formData.append('bio', about);
      if (skills) formData.append('skills', skills);
      if (portfolio) formData.append('portfolio', portfolio);
      if (experience) formData.append('experience', experience);
      if (services) formData.append('services', services);
      if (reviews) formData.append('review', reviews);
      
      formData.append('status', 'draft');

      // Add image files if they exist, otherwise fall back to existing user profile image
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      } else if (originalUserProfileImage) {
        formData.append('profileImageUrl', originalUserProfileImage);
      }

      if (bannerImageFile) {
        formData.append('bannerImage', bannerImageFile);
      }

      // Make API call
      const response = await fetch('/api/card/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create card');
      }

      // Success!
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

  // Function to render the appropriate template based on selectedDesign
  const renderTemplatePreview = () => {
    const commonProps = {
      firstName,
      middleName,
      lastName,
      cardName,
      title,
      company,
      location: cardLocation,
      about,
      skills,
      portfolio,
      experience,
      services,
      review: reviews,
      photo: profileImage || '',
      cover: bannerImage || '',
      email,
      phone,
      linkedin,
      website,
      themeColor1: selectedColor1,
      themeColor2: selectedColor2,
      fontFamily: selectedFont,
      cardType,
    };

    switch (selectedDesign) {
      case 'Flat':
        return <FlatCardPreviewComponent {...commonProps} />;
      case 'Modern':
        return <ModernCardPreviewComponent {...commonProps} />;
      case 'Sleek':
        return <SleekCardPreviewComponent {...commonProps} />;
      case 'Classic':
      default:
        return <DigitalCardPreviewComponent {...commonProps} />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Display':
        return (
          <>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>Design</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                {[ 'Classic', 'Flat', 'Modern', 'Sleek'].map((design, index) => (
                  <div
                    key={design}
                    onClick={() => setSelectedDesign(design)}
                    style={{
                      border: design === selectedDesign ? `2px solid ${selectedColor1}` : '1px solid #ddd',
                      borderRadius: '10px',
                      padding: '10px',
                      width: 'calc(50% - 5px)',
                      minWidth: '80px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: 'white'
                    }}
                  >
                    
                    <div style={{
                      width: '100%',
                      maxWidth: '80px',
                      height: '50px',
                      borderRadius: '5px',
                      marginBottom: '10px',
                      margin: '0 auto 10px auto',
                      position: 'relative',
                      overflow: 'hidden',
                      background: design === 'Classic' ? `linear-gradient(135deg, ${selectedColor1} 0%, ${selectedColor2} 100%)` : 
                                 design === 'Flat' ? 'white' :
                                 design === 'Modern' ? `linear-gradient(145deg, ${selectedColor1}15, ${selectedColor2}15)` :
                                 design === 'Sleek' ? `linear-gradient(135deg, ${selectedColor1}, ${selectedColor2})` :
                                 design === 'Blend' ? 'white' : '#dcdcdc',
                      border: design === 'Flat' ? `2px solid ${selectedColor1}` : 
                             design === 'Sleek' ? 'none' : '1px solid #eee'
                    }}>
                      {design === 'Classic' && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          position: 'relative',
                        }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            position: 'absolute',
                            bottom: '8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            border: '1px solid rgba(255,255,255,0.8)',
                          }}></div>
                        </div>
                      )}
                      {design === 'Flat' && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '2px',
                            backgroundColor: selectedColor1,
                          }}></div>
                          <div style={{
                            width: '20px',
                            height: '2px',
                            backgroundColor: '#ddd',
                            borderRadius: '1px'
                          }}></div>
                          <div style={{
                            width: '16px',
                            height: '1px',
                            backgroundColor: '#eee',
                          }}></div>
                        </div>
                      )}
                      {design === 'Modern' && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '8px'
                        }}>
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${selectedColor1}, ${selectedColor2})`,
                          }}></div>
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                          }}>
                            <div style={{
                              width: '100%',
                              height: '2px',
                              backgroundColor: '#333',
                              borderRadius: '1px'
                            }}></div>
                            <div style={{
                              width: '80%',
                              height: '1px',
                              backgroundColor: '#999',
                            }}></div>
                          </div>
                        </div>
                      )}
                      {design === 'Sleek' && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{
                            height: '60%',
                            background: `linear-gradient(135deg, ${selectedColor1}, ${selectedColor2})`,
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: '4px'
                          }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: 'rgba(255,255,255,0.3)',
                              borderRadius: '1px',
                              marginRight: '2px'
                            }}></div>
                          </div>
                          <div style={{
                            height: '40%',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1px'
                          }}>
                            <div style={{ width: '8px', height: '4px', backgroundColor: selectedColor1, fontSize: '4px' }}></div>
                            <div style={{ width: '8px', height: '4px', backgroundColor: selectedColor1, fontSize: '4px' }}></div>
                          </div>
                        </div>
                      )}
                      {design === 'Blend' && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          position: 'relative',
                          background: `linear-gradient(135deg, ${selectedColor1}20, ${selectedColor2}20)`,
                          borderRadius: '8px'
                        }}>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${selectedColor1}, ${selectedColor2})`,
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            border: '1px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}></div>
                        </div>
                      )}
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
                    {profileImage ? (
                       <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    )}
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  id="profile-media-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setProfileImage(URL.createObjectURL(file));
                      setProfileImageFile(file);
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById('profile-media-upload')?.click()}
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
                    flex: '1',
                    minWidth: '150px',
                    justifyContent: 'center'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  Add Photo or Video
                </button>
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

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: '1', minWidth: '60px' }}>
                      <label style={{ fontSize: '14px', color: '#555' }}>R:</label>
                      <input
                        type="number"
                        value={rValue1}
                        onChange={handleRChange1}
                        min="0"
                        max="255"
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: '1', minWidth: '60px' }}>
                      <label style={{ fontSize: '14px', color: '#555' }}>G:</label>
                      <input
                        type="number"
                        value={gValue1}
                        onChange={handleGChange1}
                        min="0"
                        max="255"
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: '1', minWidth: '60px' }}>
                      <label style={{ fontSize: '14px', color: '#555' }}>B:</label>
                      <input
                        type="number"
                        value={bValue1}
                        onChange={handleBChange1}
                        min="0"
                        max="255"
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '14px', color: '#555' }}>Hex:</label>
                    <input
                      type="text"
                      value={hexValue1}
                      onChange={handleHexChange1}
                      maxLength={7}
                      style={{
                        flex: '1',
                        padding: '8px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Color 2 */}
                <div style={{ marginBottom: '15px'}}>
                  <h4 style={{fontSize: '16px', marginBottom: '10px', color: '#333'}}>Color 2</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="color"
                      value={hexValue2}
                      onChange={handleColorInputChange2}
                      style={{ width: '50px', height: '30px', border: 'none', padding: '0' }}
                    />
                    <span style={{ fontSize: '14px', color: '#555' }}>Select Color 2</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: '1', minWidth: '60px' }}>
                      <label style={{ fontSize: '14px', color: '#555' }}>R:</label>
                      <input
                        type="number"
                        value={rValue2}
                        onChange={handleRChange2}
                        min="0"
                        max="255"
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: '1', minWidth: '60px' }}>
                      <label style={{ fontSize: '14px', color: '#555' }}>G:</label>
                      <input
                        type="number"
                        value={gValue2}
                        onChange={handleGChange2}
                        min="0"
                        max="255"
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: '1', minWidth: '60px' }}>
                      <label style={{ fontSize: '14px', color: '#555' }}>B:</label>
                      <input
                        type="number"
                        value={bValue2}
                        onChange={handleBChange2}
                        min="0"
                        max="255"
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '14px', color: '#555' }}>Hex:</label>
                    <input
                      type="text"
                      value={hexValue2}
                      onChange={handleHexChange2}
                      maxLength={7}
                      style={{
                        flex: '1',
                        padding: '8px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
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

              {/* --- FIELDS MOVED TO "Fields" TAB --- */}
            </div>
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


              {/* --- NEWLY ADDED: Render Extra Fields --- */}
              {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', marginTop: '30px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#333' }}>Additional Fields <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>(?)</span></h3>
              </div>
              {extraFields.map((field) => (
                <div key={field.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ cursor: 'grab', color: '#aaa' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={selectedColor1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.72"></path></svg>
                      {field.name}
                    </span>
                    <span onClick={() => handleDeleteField(field.id)} style={{ cursor: 'pointer', color: '#888' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Link Box"
                    value={field.link}
                    onChange={(e) => handleExtraFieldChange(field.id, e.target.value)}
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
              ))} */}
              {/* --- END Render Extra Fields --- */}


              {/* --- NEWLY ADDED: Add Field Button --- */}
              {/* <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: `1px dashed ${selectedColor1}`,
                  color: selectedColor1,
                  borderRadius: '8px',
                  padding: '10px 15px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  outline: 'none',
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: '10px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Field
              </button> */}
              {/* --- END Add Field Button --- */}

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

            
            {/* <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px' }}>Card Type</label>
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
                  outline: 'none',
                  backgroundColor: 'white',
                  appearance: 'none',
                }}
              >
                <option value="Personal">Personal</option>
                <option value="Professional">Professional</option>
                <option value="Business">Business</option>
              </select>
            </div> */}
          </div>
        );
      default:
        return null;
    }
  };

  // Show loading while fetching user data
  if (isLoadingUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading user information...
      </div>
    );
  }

  return (
    <div className="create-wrap" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5', 
      padding: '10px', 
      boxSizing: 'border-box',
      gap: '15px',
      paddingBottom: '110px'
    }}>
      <style>{`
        @media (min-width: 768px) {
          .container {
            flex-direction: row !important;
            align-items: flex-start !important;
          }
          .card-preview {
            position: sticky !important;
            top: 20px !important;
            width: 400px !important; /* Fixed width for preview */
            max-width: 400px !important;
            flex-shrink: 0 !important;
          }
          .edit-panel {
            flex: 1 !important;
            min-width: 0 !important;
          }
        }
      `}</style>

      <style>{`
        .create-wrap { padding: 10px; }
        @media (max-width: 720px) {
          .create-wrap { padding: 6px 8px 120px !important; }
        }
      `}</style>

      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>

        {/* ==================================================================== */}
        {/* START: Card Preview Section (NOW REPLACED)                       */}
        {/* ==================================================================== */}
        <div className="card-preview" style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}>
            {renderTemplatePreview()}
        </div>
        {/* ==================================================================== */}
        {/* END: Card Preview Section                                          */}
        {/* ==================================================================== */


        <div className="edit-panel" style={{
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px', overflowX: 'auto' }}>
            {['Display', 'Information', 'Fields', 'Card'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 15px',
                  fontSize: 'clamp(13px, 3.5vw, 16px)',
                  fontWeight: 'bold',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? `2px solid ${selectedColor1}` : 'none',
                  color: activeTab === tab ? selectedColor1 : '#777',
                  outline: 'none',
                  marginRight: '10px',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {renderContent()}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={() => router.push('/dashboard')}
              style={{
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: 'clamp(13px, 3.5vw, 16px)',
              fontWeight: 'bold',
              color: '#555',
              cursor: 'pointer',
              outline: 'none',
              flex: '1',
              minWidth: '100px'
            }}>
              Cancel
            </button>
            <button 
              onClick={handleSaveCard}
              disabled={isSaving}
              style={{
              backgroundColor: isSaving ? '#999' : selectedColor1,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: 'clamp(13px, 3.5vw, 16px)',
              fontWeight: 'bold',
              color: 'white',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              outline: 'none',
              flex: '1',
              minWidth: '100px'
            }}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
}</div>

      {/* --- NEWLY ADDED: "Add Field" Modal --- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '15px'
        }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Add New Field</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px' }}>Field Name</label>
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g. Website, Twitter"
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px' }}>Link Box</label>
              <input
                type="text"
                value={newFieldLink}
                onChange={(e) => setNewFieldLink(e.target.value)}
                placeholder="e.g. https://..."
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '8px 15px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#555',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddField}
                style={{
                  backgroundColor: selectedColor1,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 15px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'white',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Add Field
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

export default EditPage;