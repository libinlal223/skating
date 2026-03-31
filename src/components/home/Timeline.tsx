'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const events = [
  { year: '2024', title: 'State Championship Gold', desc: 'Our students won 5 gold medals at the Maharashtra State Championship', side: 'left' },
  { year: '2023', title: 'District Championship Silver', desc: 'Second place finish at the prestigious District Level Championship', side: 'right' },
  { year: '2022', title: 'National Participation', desc: 'First time representing at the National Skating Championship in Delhi', side: 'left' },
  { year: '2021', title: 'Academy Expansion', desc: 'Opened 3 new branches across major cities in India', side: 'right' },
  { year: '2020', title: 'Online Training Launch', desc: 'Pioneered virtual skating training during challenging times', side: 'left' },
  { year: '2019', title: 'International Recognition', desc: 'Featured in Asian Skating Federation as emerging academy', side: 'right' },
  { year: '2014', title: 'Academy Founded', desc: 'Smart Wheels Skating Academy established in Mumbai', side: 'left' },
];

export default function Timeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <section ref={ref} style={{ background: 'var(--bg-secondary)', padding: 'var(--space-12) var(--space-4)' }}>
      <div className="container">
        <motion.div className="section-title" initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2>Achievement <span className="gradient-text">Timeline</span></h2>
          <div className="divider" />
          <p>Our journey of excellence through the years</p>
        </motion.div>
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          {/* Central line */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: 'linear-gradient(180deg, var(--accent-red), var(--accent-yellow), var(--accent-red))', transform: 'translateX(-50%)', borderRadius: 3 }} />
          {events.map((ev, i) => (
            <motion.div key={ev.year + ev.title} initial={{ opacity: 0, x: ev.side === 'left' ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{ display: 'flex', justifyContent: ev.side === 'left' ? 'flex-end' : 'flex-start', paddingRight: ev.side === 'left' ? 'calc(50% + 30px)' : 0, paddingLeft: ev.side === 'right' ? 'calc(50% + 30px)' : 0, marginBottom: 'var(--space-5)', position: 'relative' }}>
              {/* Node dot */}
              <div style={{ position: 'absolute', left: '50%', top: 16, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-primary)', border: '3px solid var(--accent-red)', transform: 'translateX(-50%)', zIndex: 2, boxShadow: '0 0 20px rgba(225,6,0,0.4)' }} />
              <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', maxWidth: 340, transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(225,6,0,0.3)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(225,6,0,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--accent-red)', letterSpacing: '0.05em' }}>{ev.year}</span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '0.05em', margin: '4px 0', color: '#F5F5F5' }}>{ev.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>{ev.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
