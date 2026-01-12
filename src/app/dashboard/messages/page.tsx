"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Search, X, Trash2, Send, ChevronLeft, Radius, AlignCenter, Underline } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { is } from "zod/v4/locales";
import { Margarine } from "next/font/google";
import BorderStyle from "pdf-lib/cjs/core/annotation/BorderStyle";
import { px } from "framer-motion";

// --- Types ---
type MessageStatus = "New" | "Read" | "Replied" | "Pending" | "Archived" | "Deleted";
type MessageTag = "Lead" | "Support" | "Pricing" | "Feedback" | null;

interface MessageItem {
  id: string;
  name: string;
  email: string;
  title?: string;
  company?: string;
  profileImage?: string;
  message: string;
  date: string;
  status: MessageStatus;
  read: boolean;
  starred: boolean;
  tag: MessageTag;
  senderId: string;
  thread?: Array<{
    id?: string;
    text: string;
    date: string;
    direction: 'in' | 'out';
  }>;
  replies?: {
    text: string;
    date: string;
  }[];
  incomingCount: number;
}

function MessagesPageContent() {
  // --- Logic & State ---
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const conversationRef = useRef<HTMLDivElement | null>(null);
  const composerInputRef = useRef<HTMLInputElement | null>(null);

  const [activeFilter, setActiveFilter] = useState<"Connections" | "Requests" | "Messages" | "Leads">("Connections");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [chatUpdateTrigger, setChatUpdateTrigger] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showReplyLabel, setShowReplyLabel] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const chatFromUrl = searchParams.get("chat");

  const buildMessagesUrl = (chatId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (chatId) {
      params.set("chat", chatId);
    } else {
      params.delete("chat");
    }
    const query = params.toString();
    return query ? `/dashboard/messages?${query}` : "/dashboard/messages";
  };

  useEffect(() => {
    if (chatFromUrl) {
      setDetailId(chatFromUrl);
      setReplyId(chatFromUrl);
    } else {
      setDetailId(null);
      setReplyId(null);
    }
  }, [chatFromUrl]);

  // Force scroll to top on mount to fix refresh scroll offset and ensure header stays fixed
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleConversationScroll = () => {
    const container = conversationRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    setIsNearBottom(distanceFromBottom < 80);
  };

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    // @ts-ignore
    (mql.addEventListener ? mql.addEventListener("change", onChange) : mql.addListener(onChange));
    return () => {
      // @ts-ignore
      (mql.removeEventListener ? mql.removeEventListener("change", onChange) : mql.removeListener(onChange));
    };
  }, []);

  useEffect(() => {
    fetchMessages();

    // Mark message-related notifications as cleared for this user
    const clearMessageNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data?.notifications) ? data.notifications : [];
        const messageIds = list
          .filter((n: any) => n && n.title === 'Message received')
          .map((n: any) => n.id as string);

        if (typeof window === 'undefined' || messageIds.length === 0) return;

        let existing: string[] = [];
        try {
          const stored = window.localStorage.getItem('dashboard-cleared-notifications');
          if (stored) existing = JSON.parse(stored);
        } catch {
          existing = [];
        }
        const setExisting = new Set(existing || []);
        messageIds.forEach((id: string) => setExisting.add(id));
        const next = Array.from(setExisting);
        window.localStorage.setItem('dashboard-cleared-notifications', JSON.stringify(next));
        window.dispatchEvent(new Event('notifications-updated'));
      } catch {
        // ignore
      }
    };

    clearMessageNotifications();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, []);

  // Listen for message updates from other parts of the app
  useEffect(() => {
    const handleMessageUpdate = () => {
      fetchMessages();
    };

    window.addEventListener('message-sent', handleMessageUpdate);
    window.addEventListener('messages-updated', handleMessageUpdate);

    return () => {
      window.removeEventListener('message-sent', handleMessageUpdate);
      window.removeEventListener('messages-updated', handleMessageUpdate);
    };
  }, []);

  // Real-time polling for new messages
  useEffect(() => {
    // Set up polling interval for real-time updates
    const pollingInterval = setInterval(() => {
      fetchMessages();
    }, 5000); // Poll every 5 seconds

    // Clear interval on component unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, []);

  // Enhanced real-time updates when chat is open
  useEffect(() => {
    if (!detailId) return;

    // Store the current conversation length to detect new messages
    let previousMessageCount = 0;
    const activeMessage = messages.find(m => m.senderId === detailId);
    if (activeMessage && activeMessage.thread) {
      previousMessageCount = activeMessage.thread.length;
    }

    // Poll more frequently when a chat is open for real-time conversation updates
    const chatInterval = setInterval(async () => {
      await fetchMessages();

      // Force chat update to refresh the conversation thread
      setChatUpdateTrigger(prev => prev + 1);

      // Check if the active conversation has new messages
      const updatedMessage = messages.find(m => m.senderId === detailId);
      if (updatedMessage && updatedMessage.thread) {
        const currentMessageCount = updatedMessage.thread.length;

        // If new messages were added, trigger UI updates
        if (currentMessageCount > previousMessageCount) {
          previousMessageCount = currentMessageCount;

          // Force re-render by updating the state
          setMessages(prev => prev.map(m =>
            m.senderId === detailId ? updatedMessage : m
          ));

          // Auto-scroll to bottom to show new messages only when user is near bottom
          if (isNearBottom) {
            setTimeout(() => {
              const container = conversationRef.current;
              if (container) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
              }
            }, 200);
          }
        }
      }
    }, 1500); // Poll every 1.5 seconds when chat is open

    return () => {
      clearInterval(chatInterval);
    };
  }, [detailId, chatUpdateTrigger, messages, isNearBottom]);

  // Also fetch when page becomes visible again (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMessages();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/message/receive', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const inboxMessages = data.messages || [];
        const sentMessages = data.sentMessages || [];

        const sendersMap: Record<string, { id: string; fullName?: string; email?: string; title?: string; company?: string; profileImage?: string }> = {};
        (data.senders || []).forEach((s: any) => {
          sendersMap[s.id] = s;
        });

        const inboxBySender = new Map<string, any[]>();
        (inboxMessages as any[]).forEach((m: any) => {
          const arr = inboxBySender.get(m.senderId) || [];
          arr.push(m);
          inboxBySender.set(m.senderId, arr);
        });

        const sentByReceiver = new Map<string, any[]>();
        (sentMessages as any[]).forEach((m: any) => {
          if (!m.receiverId) return;
          const arr = sentByReceiver.get(m.receiverId) || [];
          arr.push(m);
          sentByReceiver.set(m.receiverId, arr);
        });

        let readPointers: Record<string, string> = {};
        try {
          const stored = localStorage.getItem('dashboard-message-read-pointers');
          if (stored) readPointers = JSON.parse(stored);
        } catch {
          readPointers = {};
        }

        const allPartyIds = new Set<string>([
          ...Array.from(inboxBySender.keys()),
          ...Array.from(sentByReceiver.keys()),
        ]);

        const groupedBySender = new Map<string, MessageItem>();
        for (const partyId of allPartyIds) {
          const sender = sendersMap[partyId] || {};
          const inboxForParty = inboxBySender.get(partyId) || [];
          const sentForParty = sentByReceiver.get(partyId) || [];

          const combined = [
            ...inboxForParty.map((m: any) => ({
              id: m.id,
              text: m.text || m.message || '',
              date: m.createdAt || m.date || new Date().toISOString(),
              direction: 'in' as const,
            })),
            ...sentForParty.map((m: any) => ({
              id: m.id,
              text: m.text || m.message || '',
              date: m.createdAt || m.date || new Date().toISOString(),
              direction: 'out' as const,
            })),
          ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          const latest = combined[combined.length - 1] || null;

          if (latest) {
            const hasOutgoing = sentForParty.length > 0;

            const readPointer = readPointers[partyId];
            const lastReadAt = readPointer ? new Date(readPointer).getTime() : 0;

            const incomingCount = combined
              .filter(item => item.direction === 'in' && new Date(item.date).getTime() > lastReadAt)
              .length;

            let conversationStatus: MessageStatus = hasOutgoing ? 'Replied' : 'New';
            let conversationRead = incomingCount === 0;

            const replies = combined
              .filter(item => item.direction === 'out')
              .map(item => ({ text: item.text, date: item.date }));

            groupedBySender.set(partyId, {
              id: latest.id,
              name: sender.fullName || 'Unknown User',
              email: sender.email || '',
              title: sender.title,
              company: sender.company,
              profileImage: sender.profileImage,
              message: latest.text,
              date: latest.date,
              status: conversationStatus,
              read: conversationRead,
              starred: false,
              tag: null,
              senderId: partyId,
              thread: combined,
              replies,
              incomingCount,
            });
          }
        }
        setMessages(Array.from(groupedBySender.values()));
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat(undefined, {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
    }).format(d);
  };

  useEffect(() => {
    if (!detailId) return;
    const container = conversationRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
    setIsNearBottom(true);
  }, [detailId]);

  const filteredMessages = useMemo(() => {
    let filtered = messages;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.message.toLowerCase().includes(q)
      );
    }
    switch (activeFilter) {
      case "Connections": filtered = filtered.filter(m => m.status !== "Archived" && m.status !== "Deleted"); break;
      case "Requests": filtered = filtered.filter(m => m.status === "Pending" || m.status === "New"); break;
      case "Messages": filtered = filtered.filter(m => m.status !== "Archived" && m.status !== "Deleted"); break;
      case "Leads": filtered = filtered.filter(m => m.tag === "Lead"); break;
      default: filtered = filtered.filter(m => m.status !== "Archived" && m.status !== "Deleted");
    }

    return filtered.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
  }, [messages, activeFilter, searchQuery, sortOrder]);

  const openDetail = (senderId: string) => {
    const msg = messages.find(m => m.senderId === senderId);

    if (msg) {
      const latestDate = msg.thread && msg.thread.length > 0
        ? msg.thread[msg.thread.length - 1].date
        : msg.date;
      try {
        const stored = localStorage.getItem('dashboard-message-read-pointers');
        const map = stored ? (JSON.parse(stored) as Record<string, string>) : {};
        map[msg.senderId] = latestDate;
        localStorage.setItem('dashboard-message-read-pointers', JSON.stringify(map));
      } catch {
        // ignore storage errors
      }
    }

    setMessages(prev => prev.map(m =>
      m.senderId === senderId
        ? { ...m, read: true, incomingCount: 0, status: m.status === "New" ? "Read" : m.status }
        : m
    ));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('messages-updated'));
      window.dispatchEvent(new Event('message-read'));
    }
    const url = buildMessagesUrl(senderId);
    router.push(url, { scroll: false });
    setDetailId(senderId);
    setReplyId(senderId);
  };

  const closeDetail = () => {
    setDetailId(null);
    setReplyId(null);
    if (typeof window !== 'undefined' && chatFromUrl) {
      const url = buildMessagesUrl(null);
      router.replace(url, { scroll: false });
    }
  };

  const deleteMessage = (senderId: string) => {
    const messageToDelete = messages.find(m => m.senderId === senderId);

    if (!messageToDelete) return;

    // Remove from UI immediately
    setMessages(prev => prev.filter(m => m.senderId !== messageToDelete.senderId));

    // Close detail view if this conversation was open
    if (detailId === senderId) {
      closeDetail();
    }

    // Delete entire conversation from database
    const sendDeleteRequest = async () => {
      try {
        const response = await fetch('/api/message/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userId: messageToDelete.senderId
          })
        });

        if (!response.ok) {
          console.error('Failed to delete conversation');
          // If API fails, refresh messages to get current state
          fetchMessages();
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        // If API fails, refresh messages to get current state
        fetchMessages();
      }
    };

    sendDeleteRequest();
  };

  const sendReply = async () => {
    if (!replyId || !replyText.trim()) return;
    const originalMessage = messages.find(m => m.senderId === replyId);

    if (!originalMessage) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/message/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          message: replyText.trim(),
          receiverId: originalMessage.senderId,
          status: 'REPLIED',
          tag: originalMessage.tag?.toUpperCase() || 'SUPPORT',
          read: false,
        }),
      });

      if (response.ok) {
        setMessages(prev => prev.map(m => m.senderId === replyId ? {
          ...m, status: "Replied", read: true,
          thread: [...(m.thread || []), { text: replyText, date: new Date().toISOString(), direction: 'out' }]
        } : m));
        setReplyText("");

        // Ensure the newly sent message is visible above the composer
        setTimeout(() => {
          const container = conversationRef.current;
          if (container) {
            try {
              container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
              setIsNearBottom(true);
            } catch (e) {
              container.scrollTop = container.scrollHeight;
            }
          }
        }, 80);
      } else { alert('Failed to send reply.'); }
    } catch (err) { alert('Error sending reply.'); }
  };

  const getInitials = (name: string, email?: string) => {
    const value = name || email || "U";
    const base = value.includes("@") ? value.split("@")[0] : value;
    return (
      base
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  // ------------------ STYLES ------------------ //

  // Color Palette
  const colors = {
    bg: "#F8FAFC",
    cardBg: "#FFFFFF",
    textMain: "#1E293B",
    textSec: "#64748B",
    textLight: "#94A3B8",
    primary: "#4F46E5",
    primaryLight: "#EEF2FF",
    primaryGradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    border: "#E2E8F0",
    danger: "#EF4444",
    successBg: "#ECFDF5",
    successText: "#059669",
    hoverBg: "#F1F5F9",
  };
  const styles = {
    container: {
      height: "100vh",
      padding: "2px",
      backgroundColor: "#ffffff",
      BorderStyle: "1px solid #E2E8F0",
      marginTop: "5px",
      borderRadius: "30px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: colors.textMain,
    },

    pageWrapper: {
      display: "flex",
      flexDirection: "column" as const,
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      padding: " 10px",
      boxSizing: "border-box",
      gap: " 15px",
      paddingBottom: "110px",
      background: "linear-gradient(135deg, white 0%, #4A90E2 100%)",
      borderRadius: " 16px",
      position: "relative",
    },

    container1: {
      backgroundColor: "transparent",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: colors.textMain,
    },

    mainCard: {
      maxWidth: "1200px",
      height: "auto",
      margin: isMobile ? "0" : "20px auto",
      borderRadius: isMobile ? "0" : "16px",
      boxShadow: isMobile ? "none" : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
      border: isMobile ? "none" : `1px solid ${colors.border}`,
      position: "relative" as const,
    },
    header: {
      backdropFilter: "blur(8px)",
      zIndex: 10,
      display: "flex",
      flexDirection: "column",
    },

    tabsContainer: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      flexWrap: "nowrap" as const,
      marginTop: "12px",
      width: "100%",
    },

    tabsList: {
      // display: "flex",
      gap: "15px",
      overflowX: "hidden" as const,
      paddingBottom: "4px",
      marginLeft: "5px",
      flex: "1 1 0%",
      minWidth: 0,
      maxWidth: "calc(100% - 110px)", // reserve space for the select so it stays on one line
    },

    filter: {
      height: "45px",
      padding: "0 12px",
      borderRadius: "10px",
      border: "1px solid #4A90E2",
      backgroundColor: "#FFFFFF",
      fontWeight: 500,
      cursor: "pointer",
      marginLeft: "10px",
      whiteSpace: "nowrap" as const,
      width: "87px",
    },

    tabButton: (isActive: boolean) => ({
      padding: "6px 10px",
      //borderRadius: "8px",
      fontSize: "12px",
      fontWeight: 500,
      //border: isActive ? "none" : `1px solid ${colors.border}`,
      //backgroundColor: isActive ? "#1E293B" : "transparent",
      textDecoration: isActive ? "underline" : "none",
      underlineColor: isActive ? "#2563EB" : "transparent",
      color: "#646464",
      //textDecoration: "underline",
      cursor: "pointer",
      whiteSpace: "nowrap" as const,
      transition: "all 0.15s",
    }),

  searchContainer: {
  position: "relative" as const,
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
},

searchInput: {
  flex: 1,                 
  height: "44px",
  padding: "0 16px 0 30px",
  borderRadius: "16px",
  border: "2px solid #8ab4f8",
  backgroundColor: "#FFFFFF",
  fontSize: "14px",
  outline: "none",
  minWidth: 0,             
},


sortSelect: {
  height: "44px",
  padding: "0 14px",
  fontSize: "14px",
  fontWeight: 500,
  color: colors.textSec,
  border: "2px solid #8ab4f8",
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
},

sortSelectMobile: {
  height: "44px",
  padding: "0 12px",
  fontSize: "14px",
  fontWeight: 500,
  color: colors.textSec,
  border: "2px solid #8ab4f8",
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  cursor: "pointer",
  width: "90px",
},

    listContainer: {
      flex: 1,
      overflowY: "auto" as const,
      //backgroundColor: "#FAFAFA",
    },
    messageRow: (messageId: string, isRead: boolean) => ({
      padding: isMobile ? "8px" : "12px 18px", // tighter row padding
      //borderRadius: "15px 15px 0px 0px",
      margin: "10px",
      borderRadius: "10px",
      border: `2px solid #4A90E2`,
      cursor: "pointer",
      //backgroundColor: hoveredId === messageId ? "#F8FAFC" : (isRead ? "#FFFFFF" : "#E0E7FF"),
      backgroundColor: hoveredId === messageId ? "#E7F8FF" : (isRead ? "#FFFFFF" : "#E0E7FF"),
      boxShadow: "0px 3px 5px #4A90E0",
      transition: "background-color 0.2s",
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      position: "relative" as const,
      marginBottom: "15px"
    }),
    avatar: (name: string, profileImage?: string) => ({
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: profileImage ? `url(${profileImage})` : colors.primaryGradient,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: profileImage ? "#FFF" : "#FFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      fontWeight: 700,
      flexShrink: 0,
      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
      overflow: "hidden",
    }),
    unreadDot: {
      display: "none",
    },
    incomingBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: "9999px",
      backgroundColor: colors.primary,
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "11px",
      fontWeight: 700,
    },
    detailOverlay: {
      position: "fixed" as const,
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.2)",
      backdropFilter: "blur(4px)",
      zIndex: 50,
      display: "flex",
      justifyContent: isMobile ? "center" : "flex-end",
    },
    detailPanel: {
      width: isMobile ? "100%" : "650px",
      maxWidth: "100%",
      height: "100%",
      backgroundColor: "#FFFFFF",
      boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column" as const,
      animation: "slideIn 0.3s ease-out",
    },
    chatHeader: {
      height: "70px",
      padding: "0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${colors.border}`,
      backgroundColor: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(10px)",
    },
    chatBody: {
      flex: 1,
      overflowY: "auto" as const,
      padding: "16px", // reduced inner chat padding
      backgroundColor: "#F8FAFC",
      display: "flex",
      flexDirection: "column" as const,
      gap: "20px",
    },
    bubbleIn: {
      backgroundColor: "#FFFFFF",
      border: `1px solid ${colors.border}`,
      color: colors.textMain,
      padding: "14px 18px",
      borderRadius: "18px 18px 18px 4px",
      fontSize: "14px",
      lineHeight: "1.6",
      boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
      maxWidth: "80%",
      wordBreak: "break-word" as const,
      overflowWrap: "break-word" as const,
    },
    bubbleOut: {
      background: colors.primaryGradient,
      color: "#FFFFFF",
      padding: "14px 18px",
      borderRadius: "18px 18px 4px 18px",
      fontSize: "14px",
      lineHeight: "1.6",
      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
      maxWidth: "80%",
      wordBreak: "break-word" as const,
      overflowWrap: "break-word" as const,
    },
    composer: {
      padding: isMobile ? "8px 8px" : "12px 16px", // reduced composer padding
      borderTop: `1px solid ${colors.border}`,
      backgroundColor: "#FFFFFF",
      width: "100%",
      boxSizing: "border-box" as const,
    },
    composerInputContainer: {
      backgroundColor: "#F8FAFC",
      border: `1px solid ${colors.border}`,
      borderRadius: "16px",
      padding: isMobile ? "4px 8px 4px 10px" : "4px 10px 4px 12px",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box" as const,
      transition: "border 0.2s",
    },
    textarea: {
      width: "100%",
      backgroundColor: "transparent",
      border: "none",
      padding: "12px 16px",
      fontSize: "14px",
      outline: "none",
      resize: "none" as const,
      minHeight: "50px",
      maxHeight: "120px",
      fontFamily: "inherit",
    },
    sendButton: (disabled: boolean) => ({
      backgroundColor: disabled ? "#E2E8F0" : colors.primary,
      color: disabled ? "#94A3B8" : "#FFFFFF",
      border: "none",
      width: 40,
      height: 40,
      minWidth: 40,
      minHeight: 40,
      borderRadius: 9999,
      padding: 0,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "all 0.2s",
    }),
  };

  // Inject minimal global styles for animation/scrollbar
  const globalStyles = `
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  const activeMessage = detailId ? messages.find(m => m.senderId === detailId) : null;

  return (
    <>
      <div style={styles.pageWrapper}>

        <div style={styles.header}>
          <div style={styles.searchContainer}>
            {/* Search Icon */}
            <Search style={{
                position: "absolute",
                left: "14px", top: "50%",
                transform: "translateY(-50%)",
                color: colors.textLight,
                width: "18px",
                height: "18px",
                pointerEvents: "none",
              }}
            />

            {/* Search Input */}
            <input type="text"
              placeholder="Search Connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />

            {/* Desktop Filter */}
            {!isMobile && (
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} 
              style={styles.sortSelect} >
                <option value="newest">Filter</option>
                <option value="az">Sort by A–Z</option>
                <option value="za">Sort by Z–A</option>
                <option value="recent">Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            )}

            {/* Mobile Filter */}
            {isMobile && (
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}
                style={styles.sortSelectMobile}
              >
                <option value="newest">Filter</option>
                <option value="az">A–Z</option>
                <option value="za">Z–A</option>
                <option value="recent">Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            )}
          </div>
        </div>





        <div style={styles.container}>
          {/* --- Message List --- */}
          <div style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            marginTop: "4px",   // ⬅️ reduce space (was 12px)
            paddingLeft: "10px",
            flexWrap: "nowrap",
          }}>

            {(["Messages", "Leads", "Connections", "Requests"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  // 3. Navigation Logic
                  if (tab === "Messages") {
                    setActiveFilter("Messages");
                  } else if (tab === "Leads") {
                    router.push("/dashboard/contacts");
                  } else if (tab === "Connections") {
                    router.push("/dashboard/connections");
                  } else if (tab === "Requests") {
                    // Pass a query param to open the requests tab directly
                    router.push("/dashboard/connections?view=requests");
                  }
                }}
                style={{
                  padding: "6px 4px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: tab === "Messages" ? "#2563EB" : "#64748B",
                  borderBottom: tab === "Messages" ? "3px solid #2563EB" : "3px solid transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={styles.listContainer}>
            {filteredMessages.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5 }}>
                <Search style={{ width: "40px", height: "40px", marginBottom: "16px", color: colors.textLight }} />
                <p style={{ fontSize: "14px", color: colors.textSec }}>No messages found</p>
              </div>
            ) : (
              <div>
                {filteredMessages.map(m => (
                  <div
                    key={m.id}
                    onClick={() => openDetail(m.senderId)}
                    onMouseEnter={() => setHoveredId(m.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={styles.messageRow(m.id, m.read)}
                  >
                    {/* Avatar */}
                    <div style={styles.avatar(m.name, m.profileImage)}>
                      {m.profileImage ? (
                        <img
                          src={m.profileImage}
                          alt={m.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        getInitials(m.name, m.email)
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h3
                          style={{
                            fontSize: "16px",
                            margin: 0,
                            fontWeight: m.read ? 600 : 700,
                            color: m.read ? colors.textMain : "#000",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: isMobile ? "60%" : "70%",
                          }}
                        >
                          {m.name}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              fontSize: "6px",
                              color: colors.textLight,
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {formatDate(m.date)}
                          </span>
                          {!m.read && m.incomingCount > 0 && (
                            <div style={styles.incomingBadge}>{m.incomingCount}</div>
                          )}
                        </div>
                      </div>

                      {/* {(m.title || m.company) && (
                      <p
                        style={{
                          margin: 0,
                          marginBottom: 2,
                          fontSize: "12px",
                          color: colors.textSec,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {[m.title, m.company].filter(Boolean).join(" • ")}
                      </p>
                    )} */}

                      <p
                        className="message-text-left"
                        style={{
                          margin: 0,
                          fontSize: "10px",
                          color: m.read ? colors.textSec : colors.textMain,
                          fontWeight: m.read ? 400 : 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {m.message}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          height: "20px",
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(m.senderId);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: colors.textLight,
                            cursor: "pointer",
                            padding: "4px",
                            marginLeft: "auto",
                            opacity: 1,
                            transition: "opacity 0.2s",
                          }}
                        >
                          <Trash2 style={{ width: "16px", height: "16px" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* --- Detail View Overlay --- */}
        {activeMessage && (
          <div
            style={styles.detailOverlay}
            onClick={(e) => {
              // Desktop: click on dimmed background closes chat
              if (isMobile) return;
              if (e.target === e.currentTarget) {
                closeDetail();
              }
            }}
          >
            <div style={styles.detailPanel}>

              {/* Chat Header */}
              <div style={styles.chatHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {isMobile && (
                    <button onClick={closeDetail} style={{ background: "transparent", border: "none", padding: "4px", cursor: "pointer" }}>
                      <ChevronLeft style={{ color: colors.textSec }} />
                    </button>
                  )}
                  <div
                    style={{
                      ...styles.avatar(activeMessage.name, activeMessage.profileImage),
                      width: "40px",
                      height: "40px",
                      fontSize: "12px",
                    }}
                  >
                    {activeMessage.profileImage ? (
                      <img
                        src={activeMessage.profileImage}
                        alt={activeMessage.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      getInitials(activeMessage.name, activeMessage.email)
                    )}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: colors.textMain, marginBottom: '4px' }}>{activeMessage.name}</h2>
                    {(activeMessage.title || activeMessage.company) && (
                      <p style={{ fontSize: "12px", margin: 0, color: colors.textSec }}>
                        {[activeMessage.title, activeMessage.company].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversation */}
              <div ref={conversationRef} style={styles.chatBody} onScroll={handleConversationScroll}>
                {(() => {
                  const threadItems = (activeMessage.thread && activeMessage.thread.length > 0
                    ? activeMessage.thread
                    : [
                      { text: activeMessage.message, date: activeMessage.date, direction: 'in' as const },
                    ]);

                  let lastDateKey: string | null = null;

                  return threadItems.map((item, idx) => {
                    const isIncoming = item.direction === 'in';
                    const itemDate = new Date(item.date);
                    const dateKey = itemDate.toDateString();
                    const showDateHeader = dateKey !== lastDateKey;
                    lastDateKey = dateKey;

                    return (
                      <React.Fragment key={item.id || idx}>
                        {showDateHeader && (
                          <div style={{ textAlign: "center", margin: "10px 0" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#94A3B8",
                                backgroundColor: "#F1F5F9",
                                padding: "4px 12px",
                                borderRadius: "20px",
                              }}
                            >
                              {new Intl.DateTimeFormat(undefined, {
                                month: "short",
                                day: "numeric",
                              }).format(itemDate)}
                            </span>
                          </div>
                        )}

                        <div style={{ display: "flex", width: "100%", justifyContent: isIncoming ? "flex-start" : "flex-end" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: isIncoming ? "flex-start" : "flex-end", width: "100%" }}>
                            <div style={isIncoming ? styles.bubbleIn : styles.bubbleOut}>{item.text}</div>
                            <span style={{ fontSize: "10px", marginTop: "6px", color: "#94A3B8", fontWeight: 500 }}>
                              {isIncoming ? activeMessage.name.split(' ')[0] : 'You'} • {formatDate(item.date).split(',')[1].trim()}
                            </span>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>

              {/* Composer */}
              <div style={styles.composer}>
                <div style={styles.composerInputContainer}>
                  <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", gap: "8px", width: "100%", boxSizing: "border-box" }}>
                    {showReplyLabel && (
                      <span
                        style={{ fontSize: "14px", color: colors.textLight, flexShrink: 0, cursor: "pointer" }}
                        onClick={() => {
                          setShowReplyLabel(false);
                          if (composerInputRef.current) {
                            composerInputRef.current.focus();
                          }
                        }}
                      >
                        Type your reply
                      </span>
                    )}
                    <input
                      ref={composerInputRef}
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onFocus={() => setShowReplyLabel(false)}
                      onBlur={() => {
                        if (!replyText.trim()) {
                          setShowReplyLabel(true);
                        }
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (replyText.trim()) sendReply(); } }}
                      style={{
                        flex: 1,
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        fontSize: "14px",
                        color: colors.textMain,
                        fontFamily: "inherit"
                      }}
                    />
                    <button
                      onClick={sendReply}
                      disabled={!replyText.trim()}
                      style={styles.sendButton(!replyText.trim())}
                    >
                      <Send style={{ width: "18px", height: "18px" }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesPageContent />
    </Suspense>
  );
}