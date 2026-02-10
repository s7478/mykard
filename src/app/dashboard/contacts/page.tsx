"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Users, Mail, Phone, Calendar, MoreHorizontal, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import styles from "./contacts.module.css";
import { useRouter } from "next/navigation";

// Types
interface ContactConnection {
  id: string;
  name: string;
  email: string;
  phone: string;
  sourceUrl?: string;
  createdAt: string;
  card?: {
    id: string;
    fullName: string;
    cardName?: string;
  };
}

// Helper function to format date and time
const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return "";
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

  const router = useRouter();

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/contacts", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch contacts");
        const data = await response.json();
        setContacts(data.contacts || []);

        // Local storage logic
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('contacts-last-seen-count', String(data.contacts?.length || 0));
            window.dispatchEvent(new Event('contacts-seen'));
            window.localStorage.setItem('dashboard-contacts-last-opened', new Date().toISOString());
            window.dispatchEvent(new Event('contacts-updated'));
          }
        } catch (_) { }
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

  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact =>
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query) ||
      contact.card?.fullName?.toLowerCase().includes(query) ||
      contact.card?.cardName?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  // Handlers
  const handleEmailClick = (email: string) => window.open(`mailto:${email}`, '_blank');
  const handlePhoneClick = (phone: string) => window.open(`tel:${phone}`, '_blank');

  const handleDeleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete contact');
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact deleted successfully');
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('contacts-updated'));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete contact');
    }
  };

  const exportToCSV = () => {
    try {
      if (!contacts || contacts.length === 0) {
        toast.error("No contacts to export");
        return;
      }

      const headers = ["Name", "Email", "Phone", "Date Connected", "Time", "Source Card", "Source URL"];

      const rows = contacts.map(contact => {
        const dateObj = new Date(contact.createdAt);
        const safe = (str: string | undefined | null) => {
          if (!str) return '""';
          return `"${String(str).replace(/"/g, '""')}"`;
        };

        return [
          safe(contact.name),
          safe(contact.email),
          safe(contact.phone),
          safe(dateObj.toLocaleDateString()),
          safe(dateObj.toLocaleTimeString()),
          safe(contact.card?.cardName || contact.card?.fullName || "Unknown Card"),
          safe(contact.sourceUrl || "Direct Scan")
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mykard_leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Export started");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Failed to generate CSV");
    }
  };

  return (
    <main className={styles.minHScreen} style={{
      background: `radial-gradient(600px 300px at 50% -50px, rgba(14, 61, 114, 0.25), transparent 70%),
                   radial-gradient(500px 250px at 15% 120px, rgba(40, 107, 241, 0.2), transparent 70%),
                   radial-gradient(500px 250px at 85% 140px, rgba(23, 69, 167, 0.18), transparent 70%),
                   linear-gradient(180deg, #F5F9FF 0%, #FFFFFF 55%)`
    }}>

      <div className={styles.wFull}>

        <div className={styles.heroSection}>
          <div className={styles.searchBarSection}>
            <div className={styles.searchRow}>
              {/* Search Input Container */}
              <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}>
                  <Search size={20} />
                </span>
                <input
                  type="text"
                  placeholder="Search Leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* Export Button (Styled to match Filter button) */}
              <button
                onClick={exportToCSV}
                className={styles.exportButtonLink}
                title="Download Leads"
              >
                <Download size={18} />
                <span className={styles.desktopOnly}>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Content Section */}
        <div className={styles.tabsContainer}>
          <div className={styles.whitePanel}>
            <div className={styles.tabs}>
              <button onClick={() => router.push('/dashboard/messages')} className={styles.tab}>Messages</button>
              <button className={`${styles.tab} ${styles.activeTab}`}>Leads</button>
              <button onClick={() => router.push('/dashboard/connections')} className={styles.tab}>Connections</button>
              <button onClick={() => router.push('/dashboard/connections?view=requests')} className={styles.tab}>Requests</button>
            </div>

            <div className={styles.scrollArea}>
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
                        <p className={styles.resultsCount}>Showing <span className={styles.countNumber}>{filteredContacts.length}</span> {filteredContacts.length === 1 ? ' contact' : ' contacts'}</p>
                      </div>
                    )}

                    {filteredContacts.length === 0 ? (
                      <div className={styles.emptyState}>
                        <Users className={styles.emptyIcon} />
                        <h3 className={styles.emptyTitle}>{searchQuery ? 'No contacts found' : 'No contacts yet'}</h3>
                        <p className={styles.emptyMessage}>{searchQuery ? 'Try adjusting search.' : 'When people connect, they appear here.'}</p>
                        {searchQuery && <button onClick={() => setSearchQuery("")} className={styles.clearSearchButton}>Clear search</button>}
                      </div>
                    ) : (
                      <div className={styles.contactsList}>
                        {filteredContacts.map((contact) => (
                          <div key={contact.id} className={`${styles.contactCard} ${expandedContactId === contact.id ? styles.expanded : ""}`} onClick={() => setExpandedContactId(expandedContactId === contact.id ? null : contact.id)}>
                            <div className={styles.contactHeader}>
                              <div className={styles.contactInfo}>
                                <div className={styles.avatar}>{contact.name?.charAt(0).toUpperCase() || "?"}</div>
                                <div className={styles.contactDetails}>
                                  <div className={styles.nameRow}>
                                    <h3 className={styles.contactName}>{contact.name}</h3>
                                    <span className={styles.contactedViaInline} title={contact.card?.cardName || contact.card?.fullName}>(Contacted via {contact.card?.cardName || contact.card?.fullName || "Link"})</span>
                                  </div>
                                </div>
                              </div>
                              <div className={styles.contactMeta}>
                                <div className={styles.dropdownContainer}>
                                  <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === contact.id ? null : contact.id); }} className={styles.moreButton} title="More options">
                                    <MoreHorizontal size={9} />
                                  </button>
                                  {openDropdown === contact.id && (
                                    <div className={styles.dropdownMenu}>
                                      <button onClick={() => handleDeleteContact(contact.id)} className={styles.dropdownItemDelete}>Delete Contact</button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {expandedContactId !== contact.id && (
                              <div className={styles.quickActions}>
                                <button onClick={(e) => { e.stopPropagation(); handlePhoneClick(contact.phone); }} className={styles.quickIcon} title="Call"><Phone size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleEmailClick(contact.email); }} className={styles.quickIcon} title="Message"><Mail size={14} /></button>
                              </div>
                            )}

                            <div className={styles.contactActions}>
                              <button onClick={(e) => { e.stopPropagation(); handleEmailClick(contact.email); }} className={`${styles.actionButton} ${styles.messageButton}`} title="Send email">
                                <Mail size={16} />
                                {/* 👇 UPDATED: Wrapped text in span for safe layout */}
                                <span className={styles.actionText}>{contact.email}</span>
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handlePhoneClick(contact.phone); }} className={`${styles.actionButton} ${styles.phoneButton}`} title="Call phone">
                                <Phone size={16} />
                                {/* 👇 UPDATED: Wrapped text in span for safe layout */}
                                <span className={styles.actionText}>{contact.phone}</span>
                              </button>
                              <div className={styles.mobileTimeStamp}>
                                <Calendar size={14} /> {formatRelativeTime(contact.createdAt)}
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
        </div>
      </div>
    </main>
  );
}