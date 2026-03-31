'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <section ref={ref} style={{ position: 'relative', padding: 'var(--space-16) var(--space-4)', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #E10600, #FF4500, #FFD400)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(0,0,0,0.3), transparent 60%)' }} />
      {/* Animated stripes */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: `${i * 25}%`, left: '-100%', width: '300%', height: 1, background: 'rgba(255,255,255,0.08)', transform: `rotate(-5deg)`, animation: `speedStreak ${3 + i * 0.5}s linear infinite` }} />
      ))}
      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#0A0A0A', marginBottom: 'var(--space-3)' }}>
            Ready to Start Your Skating Journey?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(10,10,10,0.7)', maxWidth: 500, margin: '0 auto var(--space-5)', lineHeight: 1.7 }}>
            Join hundreds of students who have transformed their skills with Smart Wheels Skating Academy.
          </p>
          <a href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: 'var(--space-2) var(--space-5)',
            background: 'var(--bg-primary)', color: '#F5F5F5', fontFamily: 'var(--font-body)', fontWeight: 600,
            fontSize: '0.95rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em', border: 'none',
            borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'all 0.3s',
            boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3)'; }}>
            Enroll Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
