

//kanchan-------------------------

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
      background: '#3B82F6', // Solid professional blue from image
      color: '#000000',      // Black text as per design
      position: 'relative',
      overflow: 'hidden',
      padding: '4rem 2rem 2rem'
    }}>
      {/* Background Watermark */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '15vw',
        fontWeight: '900',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 0,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        lineHeight: '1',
        marginBottom: '1rem',
        userSelect: 'none',

        /* --- LIGHT WHITE TO FAINTER WHITE GRADIENT --- */
        // 180deg flows from Top to Bottom
        // rgba(255, 255, 255, 0.2) is a soft light white
        // rgba(255, 255, 255, 0.05) is a much lighter, barely-there white
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)',

        // Clips the background to the text
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',

        // Ensures the gradient shows through by making the fill transparent
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
        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          {/* Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Image
              src="/assets/mklogo.png"
              alt="MyKard Logo"
              width={140}
              height={50}
              className="object-contain"
            />
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.6',
              maxWidth: '350px',
              fontWeight: '500',
              color: '#000000'
            }}>
              "MyKard enables users to turn static contact details into dynamic professionals identites - making connections easier to share, save, and sustain."
            </p>
            {/* Social Icons Aligned with Brand */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
              <Instagram
                size={28}
                className="cursor-pointer transition-all duration-300"
                style={{
                  color: '#000',
                  transition: 'all 0.3s ease',
                  opacity: 0.8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.color = '#000';
                }}
              />
              <Linkedin
                size={28}
                className="cursor-pointer transition-all duration-300"
                style={{
                  color: '#000',
                  transition: 'all 0.3s ease',
                  opacity: 0.8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.color = '#000';
                }}
              />
              <X
                size={28}
                className="cursor-pointer transition-all duration-300"
                style={{
                  color: '#000',
                  transition: 'all 0.3s ease',
                  opacity: 0.8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.color = '#000';
                }}
              />
              <Facebook
                size={28}
                className="cursor-pointer transition-all duration-300"
                style={{
                  color: '#000',
                  transition: 'all 0.3s ease',
                  opacity: 0.8
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.color = '#000';
                }}
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '1.5rem', color: '#000000' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontWeight: '500' }}>
              <li
                onClick={() => handleNavigateToSection('home')}
                style={{
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  color: '#000000'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}
              >
                Home
              </li>
              <li
                onClick={() => handleNavigateToSection('about')}
                style={{
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  color: '#000000'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}
              >
                About us
              </li>
              <li
                onClick={() => handleNavigateToSection('features')}
                style={{
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  color: '#000000'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#000000'}
              >
                Features
              </li>
              <li className="cursor-pointer">
                <Link
                  href="#find-digital-card"
                  style={{
                    color: '#000000',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'block',
                    width: 'fit-content',
                    padding: '0.5rem',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                  onClick={(e) => {
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      const searchSection = document.getElementById('find-digital-card');
                      if (searchSection) {
                        searchSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '1.5rem', color: '#000000' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontWeight: '500' }}>
              <li className="cursor-pointer">
                <Link
                  href="/#faq"
                  style={{
                    color: '#000000',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'block',
                    width: 'fit-content',
                    padding: '0.5rem',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                  onClick={(e) => {
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      const faqSection = document.getElementById('faq');
                      if (faqSection) {
                        faqSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  FAQ
                </Link>
              </li>
              <li className="cursor-pointer">
                <Link
                  href="/terms"
                  style={{
                    color: '#000000',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'block',
                    width: 'fit-content',
                    padding: '0.5rem',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  Terms of Services
                </Link>
              </li>
              <li className="cursor-pointer">
                <Link
                  href="/privacy"
                  style={{
                    color: '#000000',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'block',
                    width: 'fit-content',
                    padding: '0.5rem',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'inherit';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '1.5rem', color: '#000000' }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontWeight: '500' }}>
              <a
                href="mailto:support@mykard.in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#000000',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  width: 'fit-content'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'inherit';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <Mail size={20} /> support@mykard.in
              </a>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  width: 'fit-content',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'inherit';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <MapPin size={20} /> India
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{
          borderTop: '2px solid #000',
          paddingTop: '2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <p style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0 }}>Powered by BoostNow</p>
          <p style={{ fontWeight: '600', opacity: 10, margin: 0 }}>
            © {currentYear} BoostNow Solution LLP. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
