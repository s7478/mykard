"use client";

import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import dynamic from 'next/dynamic';
import EmojiPicker from 'emoji-picker-react';
import {
  Search, Video, Calendar, MoreHorizontal, Smile, Play, CreditCard, Send, Edit, MoreVertical,
  Link2, Image as ImageIcon, MapPin, Trash2, ArrowLeft, ArrowUpRight, Copy, Check, ChevronDown, SmilePlus, X, Radius, AlignCenter, Underline, Filter, ChevronLeft
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./messages.module.css";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type MessageStatus = "New" | "Read" | "Replied" | "Pending" | "Archived" | "Deleted";
type MessageTag = "Lead" | "Support" | "Pricing" | "Feedback" | "STORY_REPLY" | null;

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
    reaction?: string | null;
    story?: {
      id: string;
      imageUrl?: string;
      videoUrl?: string;
      content?: string;
    } | null;
    post?: {
      id: string;
      content?: string;
      imageUrl?: string;
      author?: { fullName?: string };
    } | null;
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
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);
  const [showFullPicker, setShowFullPicker] = useState<boolean>(false);

  // New states for drag reply and reactions
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string, text: string } | null>(null);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [showReactFor, setShowReactFor] = useState<string | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (id: string) => {
    pressTimer.current = setTimeout(() => {
      setShowReactFor(id);
    }, 500);
  };

  const handlePointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const conversationRef = useRef<HTMLDivElement | null>(null);
  //const composerInputRef = useRef<HTMLInputElement | null>(null);
  const composerInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [activeFilter, setActiveFilter] = useState<"Connections" | "Requests" | "Messages" | "Leads">("Connections");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [chatUpdateTrigger, setChatUpdateTrigger] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [showReplyLabel, setShowReplyLabel] = useState(true);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const renderMessageText = (text: string) => {
    const lines = text.split(/\n|\d+\.\s/).filter(Boolean);

    if (lines.length > 1) {
      return (
        <ol style={{ paddingLeft: "18px", margin: 0 }}>
          {lines.map((line, i) => (
            <li key={i} style={{ marginBottom: "6px" }}>
              {line.trim()}
            </li>
          ))}
        </ol>
      );
    }

    return <span>{text}</span>;
  };
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

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    if (isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile]);


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
              tag: m.tag,
              reaction: m.reaction || null,
              story: m.story, // 🟢 Attach Story Data
              post: m.post,
            })),
            ...sentForParty.map((m: any) => ({
              id: m.id,
              text: m.text || m.message || '',
              date: m.createdAt || m.date || new Date().toISOString(),
              direction: 'out' as const,
              tag: m.tag,
              reaction: m.reaction || null,
              story: m.story, // 🟢 Attach Story Data
              post: m.post,
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
              tag: latest.tag || null,
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

  const deleteSingleMessage = async (messageId: string, indexToRemove: number) => {
    try {
      if (!activeMessage || !activeMessage.thread) return;

      const updatedThread = [...activeMessage.thread];
      updatedThread.splice(indexToRemove, 1);

      setMessages(prev => prev.map(m => m.senderId === activeMessage.senderId ? { ...m, thread: updatedThread } : m));

      const token = localStorage.getItem('token');
      const res = await fetch(`/api/message/delete?id=${messageId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) fetchMessages();
    } catch {
      fetchMessages();
    }
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    // Optimistic Update
    if (!activeMessage || !activeMessage.thread) return;

    // Find the message in the thread
    const updatedThread = activeMessage.thread.map(m =>
      m.id === messageId ? { ...m, reaction: emoji } : m
    );

    setMessages(prev => prev.map(m =>
      m.senderId === activeMessage.senderId ? { ...m, thread: updatedThread } : m
    ));

    // Close menus mapping
    setActiveReactionMenu(null);
    setShowFullPicker(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/message/react', {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messageId, emoji })
      });
      if (!res.ok) {
        fetchMessages();
      }
    } catch {
      fetchMessages();
    }
  };

  const sendReply = async () => {
    if (!replyId || !replyText.trim()) return;
    const originalMessage = messages.find(m => m.senderId === replyId);

    if (!originalMessage) return;

    // Wrap replied message inline if relying to a specific message
    let finalMessageText = replyText.trim();
    if (replyingTo) {
      const truncated = replyingTo.text.length > 50 ? replyingTo.text.substring(0, 50) + "..." : replyingTo.text;
      finalMessageText = `[Replying to ${replyingTo.name}]: "${truncated}"\n\n${finalMessageText}`;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/message/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          message: finalMessageText,
          receiverId: originalMessage.senderId,
          status: 'REPLIED',
          tag: originalMessage.tag === 'STORY_REPLY' ? 'SUPPORT' : (originalMessage.tag?.toUpperCase() || 'SUPPORT'),
          read: false,
        }),
      });

      if (response.ok) {
        setMessages(prev => prev.map(m => m.senderId === replyId ? {
          ...m, status: "Replied", read: true,
          thread: [...(m.thread || []), { text: finalMessageText, date: new Date().toISOString(), direction: 'out' }]
        } : m));
        setReplyText("");
        setReplyingTo(null);

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
  const activeMessage = detailId ? messages.find(m => m.senderId === detailId) : null;

  return (
    <>
      <div className={styles.minHScreen} style={{
        background: `radial-gradient(600px 300px at 50% -50px, rgba(14, 61, 114, 0.25), transparent 70%),
                   radial-gradient(500px 250px at 15% 120px, rgba(40, 107, 241, 0.2), transparent 70%),
                   radial-gradient(500px 250px at 85% 140px, rgba(23, 69, 167, 0.18), transparent 70%),
                   linear-gradient(180deg, #F5F9FF 0%, #FFFFFF 55%)`
      }}>

        <div className={styles.wFull}>
          {/* Hero Section (Search & Filter) */}
          <div className={styles.heroSection}>
            <div className={styles.searchBarSection}>
              <div className={styles.searchRow}>
                <div className={styles.searchWrapper}>
                  <span className={styles.searchIcon}> <Search size={20} /></span>
                  <input
                    type="text"
                    placeholder="Search Messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.filterContainer} ref={filterRef}>
                  <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={styles.filterButton} aria-expanded={isFilterOpen}>
                    Filter
                    <ChevronDown className={styles.chevronIcon} size={18} />
                  </button>
                  {isFilterOpen && (
                    <div className={styles.filterDropdown}>
                      <button onClick={() => { setSortOrder('newest'); setIsFilterOpen(false); }}>Newest</button>
                      <button onClick={() => { setSortOrder('oldest'); setIsFilterOpen(false); }}>Oldest</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              {(["Messages", "Leads", "Connections", "Requests"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tabButton} ${tab === "Messages" ? styles.tabButtonActive : ""}`}
                  onMouseEnter={() => setHoveredTab(tab)}
                  onMouseLeave={() => setHoveredTab(null)}
                  onClick={() => {
                    if (tab === "Messages") {
                      setActiveFilter("Messages");
                    } else if (tab === "Leads") {
                      router.push("/dashboard/contacts");
                    } else if (tab === "Connections") {
                      router.push("/dashboard/connections");
                    } else if (tab === "Requests") {
                      router.push("/dashboard/connections?view=requests");
                    }
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Message List */}
            <div className={`${styles.listContainer} no-scrollbar`}>
              {filteredMessages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5, paddingTop: "40px" }}>
                  <Search style={{ width: "40px", height: "40px", marginBottom: "16px", color: "#94A3B8" }} />
                  <p style={{ fontSize: "14px", color: "#64748B" }}>No messages found</p>
                </div>
              ) : (
                <div>
                  {filteredMessages.map(m => (
                    <div
                      key={m.id}
                      onClick={() => openDetail(m.senderId)}
                      onMouseEnter={() => setHoveredId(m.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`${styles.messageRow} ${m.read ? styles.messageRowRead : ''} ${hoveredId === m.id ? styles.messageRowHover : ''}`}
                    >
                      {/* Avatar */}
                      <div className={styles.avatar} style={{ backgroundImage: m.profileImage ? `url(${m.profileImage})` : undefined }}>
                        {!m.profileImage && getInitials(m.name, m.email)}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <h3 style={{ fontSize: "16px", margin: 0, fontWeight: m.read ? 600 : 700, color: m.read ? "#1E293B" : "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: isMobile ? "60%" : "70%" }}>
                            {m.name}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {formatDate(m.date)}
                            </span>
                            {!m.read && m.incomingCount > 0 && (
                              <div className={styles.incomingBadge}>{m.incomingCount}</div>
                            )}
                          </div>
                        </div>

                        {m.tag === "STORY_REPLY" && (
                          <p style={{ fontSize: "11px", color: "#2563EB", fontWeight: 600, marginBottom: "2px", marginTop: "0px" }}>
                            {m.thread && m.thread.length > 0 && m.thread[m.thread.length - 1].direction === 'out'
                              ? "You replied to their story"
                              : "Replied to your story"}
                          </p>
                        )}

                        <p className="message-text-left" style={{ margin: 0, fontSize: "12px", color: m.read ? "#64748B" : "#1E293B", fontWeight: m.read ? 400 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.message}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "20px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMessage(m.senderId);
                            }}
                            style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", padding: "4px", marginLeft: "auto", opacity: 1, transition: "opacity 0.2s" }}
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
        </div>


        {/* --- Detail View OverlayWrapper --- */}
        {activeMessage && (
          <div
            className={styles.detailOverlay}
            onClick={(e) => {
              if (isMobile) return;
              if (e.target === e.currentTarget) {
                closeDetail();
              }
            }}
          >
            <div className={styles.detailPanel}>

              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {isMobile && (
                    <button onClick={closeDetail} style={{ background: "transparent", border: "none", padding: "4px", cursor: "pointer" }}>
                      <ChevronLeft style={{ color: "#64748B" }} />
                    </button>
                  )}
                  <div className={styles.avatar} style={{ width: "40px", height: "40px", fontSize: "12px", backgroundImage: activeMessage.profileImage ? `url(${activeMessage.profileImage})` : undefined }}>
                    {!activeMessage.profileImage && getInitials(activeMessage.name, activeMessage.email)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#1E293B", marginBottom: '4px' }}>{activeMessage.name}</h2>
                    {(activeMessage.title || activeMessage.company) && (
                      <p style={{ fontSize: "12px", margin: 0, color: "#64748B" }}>
                        {[activeMessage.title, activeMessage.company].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversation */}
              <div ref={conversationRef} className={`${styles.chatBody} no-scrollbar`} onScroll={handleConversationScroll}>
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
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", backgroundColor: "#F1F5F9", padding: "4px 12px", borderRadius: "20px" }}>
                              {new Intl.DateTimeFormat(undefined, {
                                month: "short",
                                day: "numeric",
                              }).format(itemDate)}
                            </span>
                          </div>
                        )}

                        <div style={{ display: "flex", width: "100%", justifyContent: isIncoming ? "flex-start" : "flex-end", marginBottom: "8px" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: isIncoming ? "flex-start" : "flex-end", maxWidth: "80%" }}>

                            {/* Story Reply Label & Thumbnail */}
                            {item.story && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isIncoming ? 'flex-start' : 'flex-end', marginBottom: '6px' }}>
                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px 0', fontWeight: 500 }}>
                                  {isIncoming ? "Replied to your story" : `Replied to ${activeMessage.name.split(' ')[0]}'s story`}
                                </p>
                                <div
                                  onClick={() => router.push(`/story/${item.story!.id}`)}
                                  style={{ width: '48px', height: '72px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0, backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', cursor: 'pointer', transition: 'transform 0.2s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                  {(item.story.imageUrl?.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) || item.story.videoUrl) ? (
                                    <video src={item.story.videoUrl || item.story.imageUrl} autoPlay loop muted playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                                  ) : item.story.imageUrl ? (
                                    <img src={item.story.imageUrl} alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : item.story.content ? (
                                    <span style={{ fontSize: '8px', color: '#ffffff', textAlign: 'center', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2' }}>{item.story.content}</span>
                                  ) : (
                                    <span style={{ fontSize: '8px', color: '#ffffff' }}>Story</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Shared Post Rendering */}
                            {item.post && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isIncoming ? 'flex-start' : 'flex-end', marginBottom: '6px' }}>
                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px 0', fontWeight: 500 }}>
                                  {isIncoming ? "Shared a post" : `Shared a post with ${activeMessage.name.split(' ')[0]}`}
                                </p>
                                <div
                                  onClick={() => router.push(`/post/${item.post!.id}`)}
                                  style={{ width: '160px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0, backgroundColor: '#ffffff', cursor: 'pointer', display: 'flex', flexDirection: 'column', boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                  {item.post.imageUrl ? (
                                    item.post.imageUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
                                      <video src={item.post.imageUrl} autoPlay loop muted playsInline preload="metadata" style={{ width: '100%', height: '100px', objectFit: 'cover', pointerEvents: 'none' }} />
                                    ) : (
                                      <img src={item.post.imageUrl} alt="Post" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                                    )
                                  ) : null}
                                  <div style={{ padding: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: "2px" }}>{item.post.author?.fullName || "User"}</span>
                                    {item.post.content && (
                                      <span style={{ fontSize: '10px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.post.content}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div
                              className={`group ${isIncoming ? styles.bubbleIn : styles.bubbleOut}`}
                              style={{
                                position: 'relative',
                                paddingLeft: !isIncoming ? '32px' : undefined,
                                paddingRight: isIncoming ? '32px' : undefined
                              }}
                            >
                              {activeReactionMenu === (item.id || idx.toString()) && (
                                <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, zIndex: 60, minWidth: '350px', display: 'flex', flexDirection: 'column' }}>
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      gap: '8px',
                                      background: '#ffffff',
                                      padding: '6px 12px',
                                      borderRadius: '30px',
                                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                      whiteSpace: 'nowrap',
                                      width: 'fit-content',
                                      border: '1px solid rgba(0,0,0,0.05)'
                                    }}
                                  >
                                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (item.id) reactToMessage(item.id, emoji);
                                        }}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          fontSize: '20px',
                                          cursor: 'pointer',
                                          padding: '2px',
                                          transition: 'transform 0.1s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                    <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowFullPicker(!showFullPicker);
                                      }}
                                      style={{
                                        background: 'rgba(0,0,0,0.05)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        flexShrink: 0
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>

                                  {showFullPicker && (
                                    <div style={{ position: 'relative', marginTop: '8px', zIndex: 70, width: '350px', height: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px' }} onClick={(e) => e.stopPropagation()}>
                                      <EmojiPicker
                                        onEmojiClick={(emojiData) => {
                                          if (item.id) reactToMessage(item.id, emojiData.emoji);
                                        }}
                                        theme={"light" as any}
                                        width="100%"
                                        height="100%"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {isIncoming && (
                                <div style={{ position: 'absolute', top: '50%', right: '-34px', transform: 'translateY(-50%)' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveReactionMenu(activeReactionMenu === item.id ? null : (item.id || idx.toString()));
                                      setShowFullPicker(false);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "#64748b",
                                      cursor: "pointer",
                                      padding: "4px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center"
                                    }}
                                  >
                                    <SmilePlus size={20} />
                                  </button>
                                </div>
                              )}
                              <div style={{ textAlign: isIncoming ? 'left' : 'right' }}>
                                {renderMessageText(item.text)}
                              </div>
                              <div style={{ fontSize: "10px", marginTop: "4px", color: isIncoming ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)", textAlign: isIncoming ? "right" : "left", display: "flex", alignItems: "center", justifyContent: isIncoming ? "flex-end" : "flex-start", gap: "4px" }}>
                                <span>{formatDate(item.date).split(',')[1].trim()}</span>
                              </div>
                              <div style={{ position: 'absolute', top: '4px', left: !isIncoming ? '4px' : undefined, right: isIncoming ? '4px' : undefined }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMessageMenu(activeMessageMenu === item.id ? null : (item.id || idx.toString()));
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                >
                                  <ChevronDown size={22} />
                                </button>

                                {activeMessageMenu === (item.id || idx.toString()) && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      left: !isIncoming ? 'auto' : '100%',
                                      right: !isIncoming ? '100%' : 'auto',
                                      top: 'auto',
                                      bottom: '0',
                                      background: 'white',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      zIndex: 50,
                                      overflow: 'hidden',
                                      minWidth: '100px'
                                    }}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isIncoming) {
                                          deleteSingleMessage(item.id!, idx);
                                        } else {
                                          alert("Action pending for received messages");
                                          setActiveMessageMenu(null);
                                        }
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: !isIncoming ? '#ef4444' : '#1e293b',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        gap: '8px'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = !isIncoming ? '#fef2f2' : '#f1f5f9'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      {!isIncoming ? "Delete" : "More Actions"}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {item.reaction && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-12px',
                                  left: '8px', /* User requested bottom-left edge explicitly for both sender and receiver */
                                  background: '#ffffff',
                                  borderRadius: '50%',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                  border: '1px solid rgba(0,0,0,0.05)',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  zIndex: 10
                                }}>
                                  {item.reaction}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>

              {/* Composer */}
              <div className={styles.composer} style={{ flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                <AnimatePresence>
                  {replyingTo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #2563eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingRight: "16px" }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb' }}>Replying to {replyingTo.name}</span>
                        <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{replyingTo.text}</span>
                      </div>
                      <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}>
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={styles.composerInputContainer} style={{ width: '100%' }}>
                  <textarea
                    ref={composerInputRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={1}
                    className={styles.textarea}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        if (replyText.trim()) sendReply();
                      }
                    }}
                  />

                  <button
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                    className={`${styles.sendButton} ${!replyText.trim() ? styles.sendButtonDisabled : ''}`}
                  >
                    <Send style={{ width: "18px", height: "18px" }} />
                  </button>
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