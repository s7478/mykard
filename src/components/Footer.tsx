'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, X, Mail, MapPin } from "lucide-react";
import { useState, useEffect } from 'react';

const scrollToSection = (sectionId: string) => {
  if (typeof document === 'undefined') return;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleNavigateToSection = (sectionId: string) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === '/') {
      scrollToSection(sectionId);
    } else {
      sessionStorage.setItem('scrollTarget', sectionId);
      window.location.href = '/';
    }
  };

  return (
    <footer style={{
      background: '#01071E',
      color: '#000000',
      position: 'relative',
      overflow: 'hidden',
      padding: '4rem 2rem 2rem'
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
        position: 'relative',
        zIndex: 1
      }}>

        {/* -------- MAIN GRID -------- */}
        <div role="footer-grid">

          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Image
              src="/assets/mklogo.png"
              alt="MyKard Logo"
              width={140}
              height={50}
              className="object-contain"
            />

            <p className="footer-desc" style={{
              fontSize: '0.95rem',
              lineHeight: '1.65',
              maxWidth: '420px',
              fontWeight: 500,
              color: '#fff',
            }}>
              "MyKard enables users to turn static contact details into dynamic professionals identites - making connections easier to share, save, and sustain."
            </p>

            {/* Social */}
            <div className="footer-social" style={{ display: 'flex', gap: '1.2rem', marginTop: '1rem' }}>
              {[Instagram, Linkedin, X, Facebook].map((Icon, i) => (
                <Icon key={i}
                  size={28}
                  style={{ color: '#fff', opacity: 0.8, transition: '0.3s' }}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.color = '#fff';
                  }}
                />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontWeight: 500 }}>
              <li className="footer-link" onClick={() => handleNavigateToSection('home')}>Home</li>
              <li className="footer-link" onClick={() => handleNavigateToSection('about')}>About us</li>
              <li className="footer-link" onClick={() => handleNavigateToSection('features')}>Features</li>
              <li><Link className="footer-link" href="#find-digital-card">Search</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-column">
            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontWeight: 500 }}>
              <li><Link className="footer-link" href="/#faq">FAQ</Link></li>
              <li><Link className="footer-link" href="/terms">Terms of Services</Link></li>
              <li><Link className="footer-link" href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Contact Us
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontWeight: 500 }}>

              <a
                href="mailto:support@mykard.in"
                className="contact-row  footer-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
                }}
              >
                <Mail size={20}/> support@mykard.in
              </a>

              <div
                className="contact-row footer-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
                }}
              >
                <MapPin size={20}/> India
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '2px solid #fff',
          paddingTop: '2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Powered by BoostNow</p>
          <p style={{ fontWeight: 600 }}>© {currentYear} BoostNow Solution LLP. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
