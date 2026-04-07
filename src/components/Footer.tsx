'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/instructor') || pathname?.startsWith('/student')) return null;

  return (
    <footer className="footer">
      {/* Red accent line */}
      <div className="footer__accent-line" />

      <div className="container">
        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__brand">
            <div className="footer__logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="20" cy="20" r="18" stroke="url(#fLogoGrad)" strokeWidth="3"/>
                <circle cx="20" cy="20" r="7" stroke="url(#fLogoGrad)" strokeWidth="2"/>
                <line x1="20" y1="2" x2="20" y2="13" stroke="#E10600" strokeWidth="2"/>
                <line x1="20" y1="27" x2="20" y2="38" stroke="#FFD400" strokeWidth="2"/>
                <line x1="2" y1="20" x2="13" y2="20" stroke="#E10600" strokeWidth="2"/>
                <line x1="27" y1="20" x2="38" y2="20" stroke="#FFD400" strokeWidth="2"/>
                <defs>
                  <linearGradient id="fLogoGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop stopColor="#E10600"/>
                    <stop offset="1" stopColor="#FFD400"/>
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', fontSize: '1.25rem' }}>
                  Smart Wheels
                </h4>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  Skating Academy
                </span>
              </div>
            </div>
            <p className="footer__tagline">
              Professional skating training for all ages. Building champions since 2014.
            </p>
            <div className="footer__socials">
              <a href="#" className="footer__social-link" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" className="footer__social-link" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" className="footer__social-link" aria-label="YouTube"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h5 className="footer__col-title">Quick Links</h5>
            <Link href="/about" className="footer__link">About Us</Link>
            <Link href="/branches" className="footer__link">Our Branches</Link>
            <Link href="/gallery" className="footer__link">Gallery</Link>
            <Link href="/contact" className="footer__link">Contact</Link>
          </div>

          {/* Programs */}
          <div className="footer__col">
            <h5 className="footer__col-title">Programs</h5>
            <Link href="/about#programs" className="footer__link">Beginner</Link>
            <Link href="/about#programs" className="footer__link">Intermediate</Link>
            <Link href="/about#programs" className="footer__link">Advanced</Link>
            <Link href="/about#programs" className="footer__link">Competition</Link>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h5 className="footer__col-title">Contact Us</h5>
            <a href="tel:+911234567890" className="footer__link footer__contact-link">
              <Phone size={14} />
              +91 123 456 7890
            </a>
            <a href="mailto:info@smartwheels.com" className="footer__link footer__contact-link">
              <Mail size={14} />
              info@smartwheels.com
            </a>
            <span className="footer__link footer__contact-link">
              <MapPin size={14} />
              Mumbai, India
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p>© {currentYear} Smart Wheels Skating Academy. All rights reserved.</p>
          <div className="footer__bottom-links">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>

      
    </footer>
  );
}
