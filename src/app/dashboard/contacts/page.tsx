"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Users, Mail, Phone, Calendar, ExternalLink, MoreHorizontal, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import styles from "./contacts.module.css";

// Types
interface ContactConnection {
  id: string;
  name: string;
  email: string;
  phone: string;
  sourceUrl?: string;
  createdAt: string;
  card: {
    id: string;
    fullName: string;
    cardName?: string;
  };
}

// Helper function to format date and time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);


  // Force scroll to top on mount to fix refresh scroll offset and ensure header stays fixed
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/contacts", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }

        const data = await response.json();
        const list = data.contacts || [];
        setContacts(list);
        // mark as seen on visit
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('contacts-last-seen-count', String(list.length || 0));
            window.dispatchEvent(new Event('contacts-seen'));
          }
        } catch (_) {
          // ignore
        }
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem('dashboard-contacts-last-opened', new Date().toISOString());
          } catch {
            // ignore
          }
          window.dispatchEvent(new Event('contacts-updated'));
        }
      } catch (error: any) {
        console.error("Error fetching contacts:", error);
        toast.error("Failed to load contacts");
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.phone.toLowerCase().includes(query) ||
      contact.card.fullName.toLowerCase().includes(query) ||
      contact.card.cardName?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const handleSourceClick = (sourceUrl: string) => {
    window.open(sourceUrl, '_blank');
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to delete contact');
      }

      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact deleted successfully');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('contacts-updated'));
      }
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      toast.error(error?.message || 'Failed to delete contact');
    }
  };




  const exportToCSV = () => {
    if (contacts.length === 0) {
      toast.error("No contacts to export");
      return;
    }

    //headers
    const headers = ["Name", "Email", "Phone", "Date Connected", "Time", "Source Card", "Source URL"];
    
    //mapping
    const rows = contacts.map(contact => {
      const dateObj = new Date(contact.createdAt);
      const dateStr = dateObj.toLocaleDateString();
      const timeStr = dateObj.toLocaleTimeString();
      const cardName = contact.card.cardName || contact.card.fullName || "Unknown Card";
      const sourceUrl = contact.sourceUrl || "Direct Scan";

      //helper
      const safe = (str: string) => `"${str.replace(/"/g, '""')}"`;

      return [
        safe(contact.name),
        safe(contact.email),
        safe(contact.phone),
        safe(dateStr),
        safe(timeStr),
        safe(cardName),
        safe(sourceUrl)
      ].join(",");
    });

    //join headers and rows
    const csvContent = [headers.join(","), ...rows].join("\n");

    //download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mykard_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div
  className={styles.container}
  style={{
    minHeight: "100vh",
    background: `
      radial-gradient(600px 300px at 50% -50px, rgba(14, 61, 114, 0.25), transparent 70%),
      radial-gradient(500px 250px at 15% 120px, rgba(40, 107, 241, 0.2), transparent 70%),
      radial-gradient(500px 250px at 85% 140px, rgba(23, 69, 167, 0.18), transparent 70%),
      linear-gradient(180deg, #F5F9FF 0%, #FFFFFF 55%)
    `
  }}
>
      {/* Search Bar (Mobile) */}
<div className={styles.searchSection}>
  <div className={styles.searchRow}>

    {/* Search Input */}
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} />
      <input
        type="text"
        placeholder = "Search" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className={styles.clearButton}
        >
          ×
        </button>
      )}
    </div>

    {/* NEW: Mobile Export Button (beside search) */}
    <button
      onClick={exportToCSV}
      className={styles.mobileExportInline}
      title="Export CSV"
    >
      <Download size={16} />
    </button>

  </div>
</div>


      {/* Desktop Inline Search Bar */}
      <div className={styles.desktopSearchBar}>
        <div className={styles.desktopSearchRow}>
          <div className={styles.desktopSearchContainer}>
            <Search className={styles.desktopSearchIcon} />
            <input
              type="text"
              placeholder={`Search ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.desktopSearchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={styles.desktopClearButton}
              >
                ×
              </button>
            )}
          </div>

          <button onClick={exportToCSV} className={styles.exportButton} title="Download Leads">
              <Download size={18} />
              <span>Export CSV</span>
          </button>

        </div>
      </div>
      {/* Tabs + Results Container (FIGMA STYLE) */}
<div className={styles.tabsContainer}>

  {/* Tabs */}
  <div className={styles.tabs}>
    <button className={styles.tab}>Connections</button>
    <button className={styles.tab}>Requests</button>
    <button className={styles.tab}>Messages</button>
    <button className={`${styles.tab} ${styles.activeTab}`}>Leads</button>
  </div>
  

      {/* Results */}
      <div className={styles.resultsSection}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading contacts...</p>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className={styles.resultsHeader}>
                <p className={styles.resultsCount}>
                  Showing <span className={styles.countNumber}>{filteredContacts.length}</span> 
                  {filteredContacts.length === 1 ? ' contact' : ' contacts'}
                  {searchQuery && (
                    <span className={styles.searchTerm}> for "{searchQuery}"</span>
                  )}
                </p>
              </div>
            )}

            {filteredContacts.length === 0 ? (
              <div className={styles.emptyState}>
                <Users className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>
                  {searchQuery ? 'No contacts found' : 'No contacts yet'}
                </h3>
                <p className={styles.emptyMessage}>
                  {searchQuery 
                    ? 'Try adjusting your search terms or clear the search to see all contacts.'
                    : 'When people connect with your cards, they\'ll appear here.'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={styles.clearSearchButton}
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.contactsList}>
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className={`${styles.contactCard} ${ expandedContactId === contact.id ? styles.expanded : "" }`}style={{ background: "linear-gradient(180deg, #9CE1FF 0%, #F0FCFF 100%)",  border: "1px solid #4A90E2",  borderRadius: "16px",  }} onClick={() => setExpandedContactId( expandedContactId === contact.id ? null : contact.id ) } >
                    <div className={styles.contactHeader}>
                      <div className={styles.contactInfo}>
                        <div className={styles.avatar}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.contactDetails}>
                           <div className={styles.nameRow}>
                            <h3 className={styles.contactName}>{contact.name}</h3>
                              <span className={styles.contactedViaInline} title={contact.card.cardName || contact.card.fullName}> (Contacted via {contact.card.cardName || contact.card.fullName}) </span>
                           </div>
                          </div>
                         </div>
                      <div className={styles.contactMeta}>
                        
                        <div className={styles.dropdownContainer}>
                          <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === contact.id ? null : contact.id); }}
                            className={styles.moreButton}
                            title="More options"
                          >
                            <MoreHorizontal size={9} />
                          </button>
                          {openDropdown === contact.id && (
                            <div className={styles.dropdownMenu}>
                              <button 
                                onClick={() => handleDeleteContact(contact.id)}
                                className={styles.dropdownItemDelete}
                              >
                                Delete Contact
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Collapsed quick actions (ICON ONLY) */}
                     {expandedContactId !== contact.id && (
                     <div className={styles.quickActions}>
                      <button onClick={(e) => { e.stopPropagation(); handlePhoneClick(contact.phone); }}
                        className={styles.quickIcon} title="Call" >< Phone size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleEmailClick(contact.email); }}
                        className={styles.quickIcon} title="Message" > <Mail size={14} />
                      </button>
                    </div>
                    )}


                    <div className={styles.contactActions}>
                      <button onClick={(e) => { e.stopPropagation(); handleEmailClick(contact.email); }}

                        className={`${styles.actionButton} ${styles.messageButton}`}
                        title="Send email"
                      >
                        <Mail size={16} />
                        {contact.email}
                      </button>

                      <button onClick={(e) => { e.stopPropagation(); handlePhoneClick(contact.phone);  }}

                        className={`${styles.actionButton} ${styles.phoneButton}`}
                        title="Call phone"
                      >
                        <Phone size={16} />
                        {contact.phone}
                      </button>
                      <div className={styles.mobileTimeStamp}>
                        <Calendar size={14} />
                        {formatRelativeTime(contact.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
