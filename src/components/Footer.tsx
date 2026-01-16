'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{
      background: '#01071E',
      color: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* ---------- RESPONSIVE CSS ----------- */}
      <style>
        {`
          /* Grid responsive */
          div[role="footer-grid"] {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2.2rem;
            margin-bottom: 4rem;
          }

          @media (min-width: 640px) {
            div[role="footer-grid"] {
              grid-template-columns: 1.4fr 1fr;
            }
          }

          @media (min-width: 1024px) {
            div[role="footer-grid"] {
              grid-template-columns: 1.5fr 1fr 1fr 1fr;
            }
          }

          .footer-desc {
            text-align: left;
          }

          @media (max-width: 640px) {
            .footer-desc {
              text-align: center;
              margin-inline: auto;
              font-size: 1rem;
            }
          }

          @media (max-width: 640px) {
            .footer-social {
              justify-content: center;
            }
          }

          @media (max-width: 640px) {
            .footer-column {
              text-align: center;
            }
            .footer-column ul {
              align-items: center;
            }
          }

          @media (max-width: 1024px) {
            .contact-row {
              margin-left: 30px;
            }
          }

          @media (max-width: 640px) {
            .contact-row {
              margin-left: 0px;
              justify-content: center;
              text-align: center;
            }
          }

          /* Hover Effect */
          .footer-link {
            transition: color .25s ease;
            color: #fff;
          }

          .footer-link:hover {
            color: #fff;
          }

        `}
      </style>

      {/* ------------------------------------ */}

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
        opacity: 0.35,
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      }}>
        MyKard
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        /* MOBILE VIEW: 2 Columns */
        gridTemplateColumns: '1fr 1fr', 
        /* Reduced gap significantly to bring columns closer on mobile */
        gap: '2rem 0.5rem', 
        position: 'relative',
        zIndex: 1
      }} className="footer-grid">
        
        {/* Column 1: Brand */}
        <div style={{ 
          gridColumn: '1 / -1', 
          textAlign: 'center' ,
        }} className="desktop-col-1">
          <div style={{ display: 'flex', justifyContent: 'center' }} className="desktop-justify-start">
            <Image src="/assets/mykard.png" alt="Logo" width={140} height={40} />
          </div>
          <p style={{ 
            marginTop: '1rem', 
            fontSize: '0.75rem', 
            fontWeight: 500,
            maxWidth: '350px',
            marginInline: 'auto',
            lineHeight: '1.2',
            color: '#ffffff',
          }} className="desktop-mx-0">
            "MyKard enables users to turn static contact details into dynamic professional identities - making connections easier to share, save, and sustain."
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.2rem' }} className="desktop-justify-start">
            <Linkedin size={22} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div style={{ textAlign: 'center' }} className="desktop-text-left">
          <h4 className="footer-header">Quick Links</h4>
          <ul className="footer-links">
            <li>Home</li>
            <li>About us</li>
            <li>Features</li>
            <li>Search</li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div style={{ textAlign: 'center' }} className="desktop-text-left">
          <h4 className="footer-header">Support</h4>
          <ul className="footer-links">
            <li>FAQ</li>
            <li>Terms of Services</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div style={{ 
          gridColumn: '1 / -1', 
          textAlign: 'center' 
        }} className="desktop-col-4">
          <h4 className="footer-header">Contact Us</h4>
          {/* Added 'contact-item' class to handle responsive centering */}
          <ul className="footer-links desktop-items-start" style={{ alignItems: 'center' }}>
            <li className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={12} /> support@mykard.in
            </li>
            <li className="contact-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={12} /> India
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div style={{ 
        marginTop: '1rem', 
        paddingTop: '1rem', 
        borderTop: '2px solid #000', 
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.1rem' }}>Powered by BoostNow</p>
        <p style={{ fontWeight: 600, fontSize: '0.65rem' }}>© 2025 BoostNow Solution LLP. All Rights Reserved.</p>
      </div>

      <style jsx>{`
        .footer-header { font-weight: 800; margin-bottom: 0.9rem; font-size: 1rem; color: #ffffff; }
        .footer-links { list-style: none; padding: 0; display: grid; gap: 0.4rem; font-size: 0.75rem; font-weight: 500; color: #ffffff;}
        
        /* HOVER EFFECT ADDED HERE */
        .footer-links li {
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .footer-links li:hover {
          color: #ffffff;
        }

        /* Mobile: Center the contact items */
        .contact-item { justify-content: center; }

        .desktop-watermark { display: none; }

        /* DESKTOP VIEW OVERRIDES */
        @media (min-width: 768px) {
          .footer-grid { 
            grid-template-columns: 1fr 0.8fr 1fr 1.2fr !important;
            gap: 2.5rem !important; /* Restore larger gap for desktop */
            align-items: start;
          }
          .desktop-col-1, .desktop-col-4 { 
            grid-column: auto !important; 
            text-align: left !important; 
          }
          .desktop-text-left { text-align: left !important; }
          .desktop-justify-start { justify-content: flex-start !important; }
          .desktop-items-start { align-items: flex-start !important; }
          .desktop-mx-0 { margin-left: 0 !important; margin-right: 0 !important; }
          
          /* Restore left alignment for contact items on desktop */
          .contact-item { justify-content: flex-start !important; }

          .desktop-watermark {
            display: block;
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10rem;
            font-weight: 900;
            color: rgba(0, 0, 0, 0.04);
            white-space: nowrap;
            z-index: 0;
            pointer-events: none;
          }
        }
      `}</style>
    </footer>
  );
}