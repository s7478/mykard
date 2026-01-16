'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { AnimatePresence, motion } from 'framer-motion';

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const styles = {
    header: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      minHeight: '70px', 
      zIndex: 99999,
      background: 'rgba(255,255,255,1)', 
      borderBottom: '1px solid #e5e7eb',
      
    },
    logo: {
      width: '120px',
      height: 'auto',
      objectFit: 'contain' as const,
      marginLeft:'1rem'
    },
    link: {
      fontSize: '0.8rem',
      fontWeight: 600,
      color: '#1f2937',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
      marginLeft: '10px'
    },
    ctaBtn: {
      background: '#0070FF', 
      color: '#fff',
      fontWeight: 600,
      borderRadius: '30px', 
      padding: 'clamp(0.10rem, 0.7vw, 0.5rem) clamp(0.2rem, 1.4vw, 1.5rem)',
      fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      marginRight: 'clamp(0.5rem, 2vw, 1rem)',
      whiteSpace: 'nowrap', 
  },
  };

  return (
    <header style={styles.header}>
      <nav className="max-w-[1440px] mx-auto px-4 md:px-8 h-[70px] flex items-center justify-between">
        
        {/* LEFT: LOGO */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/assets/finalogo.png"
            alt="MyKard Logo"
            width={120}
            height={36}
            style={styles.logo}
          />
        </Link>

        {/* CENTER: NAVIGATION LINKS (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-6 lg:gap-12 absolute left-1/2 -translate-x-1/2">
          <Link href="/" style={styles.link} className="hover:text-blue-600">Home</Link>
          <button onClick={() => scrollToSection('features')} style={styles.link} className="hover:text-blue-600">Features</button>
          <button onClick={() => scrollToSection('about')} style={styles.link} className="hover:text-blue-600">About Us</button>
          <button onClick={() => scrollToSection('search')} style={styles.link} className="hover:text-blue-600">Search</button>
          <button onClick={() => scrollToSection('how-it-works')} style={styles.link} className="hover:text-blue-600">How It Works</button>
        </div>

        {/* RIGHT: CTA BUTTON (Desktop & Tablet) */}
        <div className="hidden md:block">
          {!isAuthenticated ? ( 
            <Link href="/auth/signup" style={styles.ctaBtn} className="hover:bg-blue-700"> Create Card </Link>
          ) : (
            <button onClick={handleLogout} style={styles.link} className="hover:text-red-600"> Logout </button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-700" >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? ( <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : ( <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[70px] left-0 right-0 bg-white border-b border-gray-200 p-6 flex flex-col gap-6 md:hidden shadow-xl"
            >
              <Link href="/" onClick={() => setIsMenuOpen(false)} style={styles.link}>Home</Link>
              <button onClick={() => { scrollToSection('features'); setIsMenuOpen(false); }} style={styles.link} className="text-left">Features</button>
              <button onClick={() => { scrollToSection('about'); setIsMenuOpen(false); }} style={styles.link} className="text-left">About Us</button>
              <button onClick={() => { scrollToSection('search'); setIsMenuOpen(false); }} style={styles.link} className="text-left">Search</button>
              <button onClick={() => { scrollToSection('how-it-works'); setIsMenuOpen(false); }} style={styles.link} className="text-left">How It Works</button>
              
              <div className="pt-4 flex items-center justify-center">
  {!isAuthenticated ? (
    <Link href="/auth/signup" 
      style={{
        ...styles.ctaBtn, 
        width: '40%', 
        //padding: '1rem 1.5rem' // Slightly larger tap target for mobile users
      }}
    >
      Create Card
    </Link>
  ) : (
    <button 
      onClick={handleLogout} 
      style={{
        ...styles.link, 
        color: '#dc2626', 
        width: '100%', 
        textAlign: 'center', padding: '1rem'
      }}
    >
      Logout
    </button>
  )}
</div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}