"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Mail, HelpCircle } from "lucide-react";

// Add type definition for Lucide icons
interface LucideIconProps extends React.SVGAttributes<SVGElement> {
  size?: number;
  color?: string;
}


// zeeshan comment
type ContactAction = {
  type: "link" | "button";
  label: string;
  href?: string;
};

type ContactOption = {
  title: string;
  description: string;
  icon: React.ComponentType<LucideIconProps>;
  accentColor: string;
  action: ContactAction;
};

type Faq = { q: string; a: string };

export default function SupportPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", topic: "", message: "" });

  // Force scroll to top on mount to fix refresh scroll offset and ensure header stays fixed
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Format steps like "1) Do this 2) Do that" into separate lines
  const formatAnswer = (text: string) => {
    return text.replace(/(\d\))/g, "\n$1").trim();
  };

  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const contactOptions = useMemo<ContactOption[]>(() => [
    {
      title: "Email Support",
      description:
        "Drop us a note and our customer success team will respond within one business day.",
      icon: Mail,
      accentColor: "#2563eb",
      action: { type: "link", label: "support@mykard.in", href: "mailto:support@mykard.in" },
    },
  ], []);

  const faqs = useMemo<Faq[]>(() => [
    {
      q: "What is MyKard?",
      a: "MyKard is a digital business card platform that allows users to create and share their professional profiles online. It provides a modern, customizable, and shareable way to represent oneself in the digital age.",
    },  
   {
      q: "How to create MyKard?",
      a: "To create MyKard, you can follow these steps: 1) Go to dashboard and click on create card button. 2) Fill the form with your details. 3) Click on create card button .And you will get your MyKard.",
    }, 
    {
      q: "How does MyKard works",
      a: "1)Create Your Profile – Add your professional details.2) Customize Your Card – Personalize with themes and logos.3)Share Anywhere – Use your link or QR code instantly.4)Track Insights – Monitor views, leads, and engagement.",
    },
   
    {
      q: "How can I search for a professional?",
      a: "In the Dashboard, use the Search feature at the top. You can search by name, category, or email to quickly find any professional profile.",
    },
    {
      q: "How can I see my connections?",
      a: "Go to your Dashboard and click on the Connections tab. You'll see all your active and pending connections in one place.",
    },

    {
      q: "How much does it cost to get started?",
      a: "You can get started for free with MyKard.Just click “Create Your Free Card Now” on the homepage to begin designing your digital card.",
    },
    {
      q: "How does MyKard help grow my professional\u00A0network?",
      a: "MyKard helps you connect instantly through shareable QR or link — whether at events, meetings, or online.You can discover professionals, entrepreneurs, and creators nearby or in your industry, and stay connected effortlessly.",
    },
   

  ], []);

  const handleFaqToggle = useCallback((i: number) => {
    setActiveFaq((p) => (p === i ? null : i));
  }, []);

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((p) => ({ ...p, [name]: value }));
    },
    []
  );

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    console.log("token", token);
    // Ensure backend receives x-user-id header expected by the API
    let userIdHeader: string | undefined = undefined;
    try {
      const meRes = await fetch('/api/user/me', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        if (me?.user?.id) userIdHeader = me.user.id;
      }
    } catch {}
    const res = await fetch("/api/message/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : '',
        ...(userIdHeader ? { 'x-user-id': userIdHeader } : {}),
      },
      body: JSON.stringify({
        message: formData.message,
        topic: formData.topic || "Other",
        status: "PENDING",
        read: false,
        tag: "SUPPORT"
      }),
    });
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      await new Promise((res) => setTimeout(res, 1500));
      const { name, email, topic, message } = formData;
      const subject = encodeURIComponent(`Support request${topic ? `: ${topic}` : ""}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`);
      window.location.href = `mailto:support@mykard.in?subject=${subject}&body=${body}`;
      setSubmitStatus("success");
      setTimeout(() => {
        setFormData({ name: "", email: "", topic: "", message: "" });
        setSubmitStatus("idle");
      }, 3000);
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const handleKnowledgeBase = useCallback(() => {
    alert("Knowledge base coming soon! For now, check our FAQ section above.");
  }, []);

  return (
    <section style={S.container} className="support-container">
      {/* Decorative animated blobs & grid */}
      <div style={S.blobWrap} aria-hidden>
        <div style={S.blob1}></div>
        <div style={S.blob2}></div>
        <div style={S.blob3}></div>
      </div>

      {/* internal style tag for animations and media queries (still keeping main design inline) */}
      <style>{`
        @keyframes floaty1 { 0%{transform: translateY(0) translateX(0)} 50%{transform: translateY(-12px) translateX(6px)} 100%{transform: translateY(0) translateX(0)} }
        @keyframes floaty2 { 0%{transform: translateY(0) translateX(0)} 50%{transform: translateY(-18px) translateX(-8px)} 100%{transform: translateY(0) translateX(0)} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulseGlow { 0%{box-shadow:0 0 0 0 rgba(29,78,216,0.4)} 70%{box-shadow:0 0 0 12px rgba(29,78,216,0)} 100%{box-shadow:0 0 0 0 rgba(29,78,216,0)} }
        @media (max-width: 640px){
          .support-container{ padding: 2.4rem 0 !important }
          .support-wrapper{ padding: 1.2rem 0 !important }
          .support-title{ font-size: 1.4rem !important }
          .cards-grid{ grid-template-columns: 1fr !important }
          .support-form-footer{
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .support-form-footer p{
            text-align: center !important;
          }
        }
      `}</style>

      <div style={S.wrapper} className="support-wrapper">
        {/* ===== HERO ===== */}
        <header style={S.header}>
          <div style={S.heroBadge}>We're here to help</div>
          <h1 style={S.title} className="support-title">MyKard Support & Help Centre</h1>
          <p style={S.subtitle}>
            Whether you’re building a digital identity, managing team memberships, or monitoring
            engagement analytics, the MyKard support team is ready around the clock to keep you moving forward.
          </p>
        </header>

        {/* ===== CONTACT CARDS ===== */}
        <div style={S.contactGrid} className="cards-grid">
          {contactOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div key={opt.title} style={S.card}>
                <div style={{ ...S.iconCircle, boxShadow: '0 6px 20px rgba(37,99,235,0.14)', background: 'linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))' }}>
                  <Icon size={32} color={opt.accentColor} />
                </div>
                <h3 style={S.cardTitle}>{opt.title}</h3>
                <p style={S.cardDesc}>{opt.description}</p>
                <a href={opt.action.href} style={{ ...S.cta, border: '1px solid rgba(29,78,216,0.12)' }}>
                  {opt.action.label}
                </a>
              </div>
            );
          })}
        </div>

        {/* ===== FAQ ===== */}
        <div style={S.faqSection}>
          <h2 style={S.sectionTitle}>Frequently Asked Questions</h2>
          <p style={S.sectionSubtitle}>
            Quick answers to the most common questions about your MyKard workspace and profile.
          </p>

          <div style={S.faqList}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ ...S.faqCard, transition: 'transform 0.28s ease, box-shadow 0.28s ease' }}>
                <button style={S.faqButton} onClick={() => handleFaqToggle(i)}>
                  <span style={S.faqQ}>
                    <HelpCircle size={isMobile ? 18 : 20} style={{ color: '#2563eb', marginRight: 8, flexShrink: 0 }} />
                    {faq.q}
                  </span>
                  <span style={{ fontSize: 24, color: '#2563eb', transform: activeFaq === i ? 'rotate(45deg)' : 'none', transition: '0.2s' }}>+</span>
                </button>
                {activeFaq === i && (
                  <div style={S.faqA}>
                    {formatAnswer(faq.a).split("\n").map((line, idx) => (
                      <p key={idx} style={{ marginBottom: 8 }}>
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== SUPPORT FORM ===== */}
        <div style={S.formSection}>
          <h2 style={S.sectionTitle}>Submit a Support Request</h2>
          <p style={S.sectionSubtitle}>
            Share a few details and we’ll reach back by email with the next steps.
          </p>
          <form onSubmit={handleFormSubmit} style={S.form}>
            <div style={S.formRow}>
              <div style={S.formGroup}>
                <label style={S.label}>Full name</label>
                <input name="name" required value={formData.name} onChange={handleFormChange} style={S.input} placeholder="Jane Matthews" />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Work email</label>
                <input name="email" required type="email" value={formData.email} onChange={handleFormChange} style={S.input} placeholder="jane@company.com" />
              </div>
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>Topic</label>
              <select name="topic" required value={formData.topic} onChange={handleFormChange} style={S.input}>
                <option value="">Select a topic</option>
                <option>Account access</option>
                <option>Unable to share card</option>
                <option>Billing & invoicing</option>
                <option>Connections</option>
                <option>Analytics & reporting</option>
                <option>Other</option>
              </select>
            </div>

            <div style={S.formGroup}>
              <label style={S.label}>How can we help?</label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleFormChange}
                style={{ ...S.input, minHeight: 140, resize: "vertical", background: 'rgba(255,255,255,0.6)' }}
                placeholder="Describe the issue, include relevant account links, and any deadlines."
              />
            </div>

            <div style={S.formFooter} className="support-form-footer">
              <p style={S.consentText}>By submitting, you consent to MyKard contacting you at the email provided.</p>
              <button type="submit" disabled={isSubmitting} style={{ ...S.submitBtn, ...(isSubmitting ? S.submitBtnDisabled : {} ) }}>
                <span style={{ marginRight: 10 }}>{isSubmitting ? "Sending..." : "Send Request"}</span>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 999, background: '#fff', opacity: 0.08, boxShadow: '0 0 10px rgba(255,255,255,0.6)', animation: 'pulseGlow 1.8s infinite' }} />
              </button>
            </div>
          </form>
        </div>

        {/* ===== STATUS ===== */}
        {submitStatus === "success" && <div style={{ ...S.toast, background: "#10B981" }}>✅ Support request sent successfully!</div>}
        {submitStatus === "error" && <div style={{ ...S.toast, background: "#EF4444" }}>❌ Failed to send request. Please try again.</div>}

        {/* ===== CHAT MODAL ===== */}
        {showChatModal && (
          <div style={S.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowChatModal(false)}>
            <div style={S.modalCard}>
              <h3 style={S.modalTitle}>💬 Start Live Chat</h3>
              <p style={S.modalText}>
                Our live chat system is being upgraded. Please use the contact form or email us at support@mykard.in.
              </p>
              <div style={S.modalActions}>
                <button style={S.submitBtn} onClick={() => setShowChatModal(false)}>Okay</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- INLINE STYLES ---------- */
const S: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)",
    fontFamily: "Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    padding: "3rem 1rem",
    color: "#0f172a",
    position: 'relative',
    overflow: 'hidden'
  },
  blobWrap: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
  },
  blob1: {
    position: 'absolute',
    width: 420,
    height: 420,
    background: 'radial-gradient(circle at 30% 30%, rgba(37,99,235,0.18), rgba(37,99,235,0.06) 40%, transparent 60%)',
    top: -80,
    right: -120,
    borderRadius: '50%',
    filter: 'blur(40px)',
    transform: 'translateZ(0)',
    animation: 'floaty1 7s ease-in-out infinite',
  },
  blob2: {
    position: 'absolute',
    width: 320,
    height: 320,
    background: 'radial-gradient(circle at 70% 70%, rgba(34,197,94,0.12), rgba(99,102,241,0.04) 40%, transparent 60%)',
    bottom: -80,
    left: -80,
    borderRadius: '50%',
    filter: 'blur(36px)',
    transform: 'translateZ(0) rotate(0deg)',
    animation: 'floaty2 9s ease-in-out infinite',
  },
  blob3: {
    position: 'absolute',
    width: 220,
    height: 220,
    background: 'conic-gradient(from 120deg, rgba(255,255,255,0.06), rgba(29,78,216,0.06))',
    top: '30%',
    left: '40%',
    borderRadius: '48%',
    filter: 'blur(28px)',
    transform: 'translateZ(0)',
    animation: 'rotateSlow 40s linear infinite',
  },
  wrapper: { maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem", position: 'relative', zIndex: 2 },
  header: { textAlign: "center" },
  heroBadge: { background: "rgba(255,255,255,0.6)", display: "inline-block", padding: "0.4rem 1rem", borderRadius: 20, color: "#2563eb", fontWeight: 700, fontSize: 13, boxShadow: "0 6px 18px rgba(37,99,235,0.08)", backdropFilter: 'blur(6px)' },
  title: { fontSize: "2rem", fontWeight: 800, marginTop: 12, letterSpacing: '-0.02em', background: 'linear-gradient(90deg,#0f172a,#1d4ed8)', WebkitBackgroundClip: 'text' as any, color: 'transparent' },
  subtitle: { color: "#475569", marginTop: 12, maxWidth: 760, marginInline: "auto", lineHeight: 1.6 },
  contactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.2rem", justifyContent: "center" },
  card: { background: "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(250,250,255,0.55))", borderRadius: 16, padding: "1.6rem", boxShadow: "0 12px 40px rgba(2,6,23,0.06)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, transition: 'transform 0.28s cubic-bezier(.2,.9,.3,1), box-shadow 0.28s ease', cursor: 'default' },
  iconCircle: { background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.35))', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, border: '1px solid rgba(29,78,216,0.06)' },
  cardTitle: { fontSize: "1.05rem", fontWeight: 700 },
  cardDesc: { color: "#6b7280", margin: "0.2rem 0 1rem", textAlign: "center", lineHeight: 1.5 },
  cta: { 
    background: 'linear-gradient(90deg,#1d4ed8,#2563eb)',
    color: '#fff',
    padding: '0.6rem 1rem',
    borderRadius: 10,
    fontWeight: 700,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transform: 'translateZ(0)',
    boxShadow: '0 8px 30px rgba(37,99,235,0.18)',
    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
  },
  faqSection: { textAlign: "center" },
  sectionTitle: { fontSize: "1.3rem", fontWeight: 700 },
  sectionSubtitle: { color: "#6b7280", marginTop: 8, lineHeight: 1.5 },
  faqList: { marginTop: 18, display: "flex", flexDirection: "column", gap: 12 },
  faqCard: { background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.8))", borderRadius: 12, padding: "1rem 1.2rem", boxShadow: "0 6px 22px rgba(2,6,23,0.04)" },
  faqButton: { background: "none", border: "none", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 56, textAlign: "left" },
  faqQ: { display: "flex", alignItems: "center", color: "#0f172a", gap: 10, flex: 1, textAlign: "left" },
  faqA: { color: "#475569", marginTop: 10, fontSize: 14, lineHeight: 1.6 },
  formSection: { background: "linear-gradient(180deg, rgba(255,255,255,0.76), rgba(245,247,255,0.6))", borderRadius: 16, padding: "1.6rem", boxShadow: "0 18px 50px rgba(2,6,23,0.06)" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  formRow: { display: "flex", gap: 16, flexWrap: "wrap" },
  formGroup: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  input: { padding: "0.8rem 1rem", borderRadius: 12, border: "1px solid rgba(2,6,23,0.06)", fontSize: 14, outline: "none", background: 'rgba(255,255,255,0.9)' },
  formFooter: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid rgba(2,6,23,0.04)", paddingTop: 14 },
  consentText: { fontSize: 13, color: "#6b7280" },
  submitBtn: { 
    background: "linear-gradient(90deg,#1d4ed8,#2563eb)",
    color: "white",
    padding: "0.7rem 1.4rem",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 12px 30px rgba(37,99,235,0.18)',
    transform: 'translateZ(0)'
  },
  submitBtnDisabled: { opacity: 0.7, cursor: 'not-allowed', transform: 'scale(0.995)' },
  ctaCard: { background: "white", borderRadius: 20, padding: "2rem", textAlign: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" },
  toast: { position: "fixed", top: 20, right: 20, color: "white", padding: "0.8rem 1.4rem", borderRadius: 8, fontWeight: 600, boxShadow: "0 6px 20px rgba(2,6,23,0.2)", zIndex: 9999 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(2,6,23,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  modalCard: { background: "linear-gradient(180deg, #ffffff, #f8fbff)", padding: "1.6rem", borderRadius: 12, maxWidth: 420, width: "92%", boxShadow: "0 20px 60px rgba(2,6,23,0.18)" },
  modalTitle: { fontSize: "1.1rem", fontWeight: 800, marginBottom: 8 },
  modalText: { color: "#475569", lineHeight: 1.6 },
  modalActions: { marginTop: 12, textAlign: "right" },
};
