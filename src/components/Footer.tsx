'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin } from "lucide-react";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function Footer() {
  return (
    <footer style={{
      background: '#01071E',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      padding: '3rem 2rem 1.5rem',
    }}>

      {/* Background Watermark */}
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '22vw',
        fontWeight: '900',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 0,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        lineHeight: '1',
        userSelect: 'none',
        opacity: 0.15,
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      }}>
        MyKard
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Desktop: 4-column grid using Tailwind */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-8 md:gap-10">

          {/* Column 1: Brand */}
          <div className="text-center md:text-left sm:col-span-2 md:col-span-1">
            <div className="flex justify-center md:justify-start">
              <Image src="/assets/mykard.png" alt="Logo" width={120} height={36} />
            </div>
            <p style={{
              marginTop: '1rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              maxWidth: '300px',
              lineHeight: '1.5',
              color: '#ffffffcc',
            }} className="mx-auto md:mx-0">
              &quot;MyKard enables users to turn static contact details into dynamic professional identites - making connections easier to share, save, and sustain.&quot;
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-5 items-center justify-center md:justify-start">
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="text-white hover:opacity-70 transition-opacity">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn" className="text-white hover:opacity-70 transition-opacity">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              {/* X (Twitter) */}
              <a href="#" aria-label="X" className="text-white hover:opacity-70 transition-opacity">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="text-white hover:opacity-70 transition-opacity">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center md:text-left">
            <h4 style={{ fontWeight: 800, marginBottom: '0.9rem', fontSize: '0.95rem', letterSpacing: '0.05em' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#ffffffcc' }}>
              <li><button onClick={() => scrollToSection('hero')} className="hover:text-white transition-colors" style={{ background: 'none', border: 'none', color: '#ffffffcc', font: 'inherit', cursor: 'pointer', padding: 0 }}>Home</button></li>
              <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors" style={{ background: 'none', border: 'none', color: '#ffffffcc', font: 'inherit', cursor: 'pointer', padding: 0 }}>About us</button></li>
              <li><button onClick={() => scrollToSection('build-credibility')} className="hover:text-white transition-colors" style={{ background: 'none', border: 'none', color: '#ffffffcc', font: 'inherit', cursor: 'pointer', padding: 0 }}>Features</button></li>
              <li><button onClick={() => scrollToSection('search')} className="hover:text-white transition-colors" style={{ background: 'none', border: 'none', color: '#ffffffcc', font: 'inherit', cursor: 'pointer', padding: 0 }}>Search</button></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="text-center md:text-left">
            <h4 style={{ fontWeight: 800, marginBottom: '0.9rem', fontSize: '0.95rem', letterSpacing: '0.05em' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#ffffffcc' }}>
              <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
              <li className="hover:text-white transition-colors cursor-pointer">Terms of Services</li>
              <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="text-center md:text-left">
            <h4 style={{ fontWeight: 800, marginBottom: '0.9rem', fontSize: '0.95rem', letterSpacing: '0.05em' }}>Contact Us</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#ffffffcc' }}>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <Mail size={14} /> support@mykard.in
              </li>
              <li className="flex items-center gap-2 justify-center md:justify-start">
                <MapPin size={14} /> India
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div style={{
          marginTop: '2.5rem',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: '1.2rem',
          textAlign: 'center',
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Powered by BoostNow</p>
          <p style={{ fontWeight: 500, fontSize: '0.7rem', color: '#ffffffaa' }}>© 2025 BoostNow Solution LLP. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}