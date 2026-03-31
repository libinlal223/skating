'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Branches', href: '/branches' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/instructor') || pathname?.startsWith('/student')) return null;

  return (
    <motion.header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <div className="navbar__inner">
        {/* Logo */}
        <Link href="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="url(#logoGrad)" strokeWidth="3" />
              <circle cx="20" cy="20" r="7" stroke="url(#logoGrad)" strokeWidth="2" />
              <line x1="20" y1="2" x2="20" y2="13" stroke="#E10600" strokeWidth="2" />
              <line x1="20" y1="27" x2="20" y2="38" stroke="#FFD400" strokeWidth="2" />
              <line x1="2" y1="20" x2="13" y2="20" stroke="#E10600" strokeWidth="2" />
              <line x1="27" y1="20" x2="38" y2="20" stroke="#FFD400" strokeWidth="2" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#E10600" />
                  <stop offset="1" stopColor="#FFD400" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-title">Smart Wheels</span>
            <span className="navbar__logo-sub">Skating Academy</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar__links">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="navbar__link">
              {link.name}
              <span className="navbar__link-underline" />
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="navbar__actions">
          <Link href="/student/login" className="navbar__portal-btn">
            Student Portal
          </Link>
          <Link href="/admin/login" className="btn btn-primary navbar__cta">
            Admin Login
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar__mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={link.href}
                  className="navbar__mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            <div className="navbar__mobile-actions">
              <Link href="/student/login" className="btn btn-secondary" style={{ width: '100%' }}>
                Student Portal
              </Link>
              <Link href="/admin/login" className="btn btn-primary" style={{ width: '100%' }}>
                Admin Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </motion.header>
  );
}
