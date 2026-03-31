'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Trophy } from 'lucide-react';

export default function GuinnessRecord() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section className="section-padding" ref={ref} style={{ background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative BG */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '80%', background: 'radial-gradient(ellipse at top, rgba(225,6,0,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div className="container">
        {/* Header */}
        <motion.div
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: 'rgba(255,212,0,0.12)', border: '1px solid rgba(255,212,0,0.4)', borderRadius: '99px', color: 'var(--accent-yellow)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-3)' }}>
            <Trophy size={14} /> Historic Achievement
          </div>
          <h2>
            Guinness <span className="gradient-text">World Record</span>
          </h2>
          <div className="divider" />
          <p style={{ maxWidth: '780px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text-secondary)' }}>
            We are incredibly proud of our student{' '}
            <span style={{ color: '#FFD400', fontWeight: 700 }}>Avanika</span>{' '}
            and her dedicated coach{' '}
            <span style={{ color: '#FFD400', fontWeight: 700 }}>Coach Abhi</span>{' '}
            for securing a Guinness World Record — honored personally by the{' '}
            <span style={{ color: '#FFD400', fontWeight: 700 }}>Hon&apos;ble Chief Minister of Kerala, Shri Pinarayi Vijayan</span>,
            {' '}and respected state ministers of Kerala.
          </p>
        </motion.div>

        {/* Layout: Main wide portrait + 4 smaller portraits in a row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>

          {/* Main CM Photo — portrait tall */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '2px solid rgba(255,212,0,0.25)', boxShadow: '0 16px 60px rgba(255,212,0,0.12)', gridRow: 'span 2' }}
          >
            <div style={{ position: 'relative', aspectRatio: '3/4', width: '100%' }}>
              <Image
                src="/guinness/guinness_main_cm_1773495636214.png"
                alt="Avanika and Coach Abhi with Chief Minister Pinarayi Vijayan"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              {/* Overlay gradient */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
              {/* Text */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-4)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(255,212,0,0.2)', border: '1px solid rgba(255,212,0,0.5)', borderRadius: '99px', color: '#FFD400', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  <Trophy size={10} /> Guinness World Record
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem, 3.5vw, 2rem)', color: '#ffffff', marginBottom: '8px', letterSpacing: '0.04em', textShadow: '0 2px 12px rgba(0,0,0,0.9)', lineHeight: 1.2 }}>
                  Honored by the Chief Minister
                </h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, textShadow: '0 1px 4px rgba(0,0,0,0.9)', marginBottom: '10px' }}>
                  Receiving the Guinness World Record from the Hon'ble Chief Minister of Kerala,{' '}
                  <span style={{ color: '#FFD400', fontWeight: 700 }}>Shri Pinarayi Vijayan</span>.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', background: 'rgba(255,212,0,0.2)', border: '1px solid rgba(255,212,0,0.4)', borderRadius: '99px', fontSize: '0.75rem', color: '#FFD400', fontWeight: 600 }}>Avanika</span>
                  <span style={{ padding: '3px 10px', background: 'rgba(225,6,0,0.2)', border: '1px solid rgba(225,6,0,0.4)', borderRadius: '99px', fontSize: '0.75rem', color: '#ff6b6b', fontWeight: 600 }}>Coach Abhi</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4 smaller portrait images in 2x2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[
              { src: 'guinness_minister_1_1773495658203.png', title: 'State Felicitation', person: 'Avanika', role: 'state ministers' },
              { src: 'guinness_minister_2_1773495675576.png', title: 'Ministerial Honor', person: 'Avanika', role: 'Kerala ministers' },
              { src: 'guinness_minister_3_1773495692932.png', title: 'Award Ceremony', person: 'Coach Abhi & Avanika', role: 'official event' },
              { src: 'guinness_minister_4_1773495714273.png', title: 'Record Moment', person: 'Avanika', role: 'Guinness record' },
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              >
                <div style={{ position: 'relative', aspectRatio: '3/4' }}>
                  <Image
                    src={`/guinness/${img.src}`}
                    alt={img.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  {/* Name badge overlay on image */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', padding: '12px 10px 8px' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: '#FFD400', letterSpacing: '0.05em', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
                      {img.person}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '2px' }}>{img.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Honored by {img.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom name highlight strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}
        >
          {[
            { label: 'Student', name: 'Avanika', color: '#FFD400' },
            { label: 'Coach', name: 'Coach Abhi', color: '#E10600' },
            { label: 'Honored By', name: 'CM Pinarayi Vijayan', color: '#C0C0C0' },
          ].map((item) => (
            <div key={item.name} style={{ textAlign: 'center', padding: 'var(--space-2) var(--space-4)', background: 'var(--bg-card)', border: `1px solid ${item.color}33`, borderRadius: 'var(--radius-lg)', minWidth: '180px' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: item.color, letterSpacing: '0.06em', textShadow: `0 0 20px ${item.color}55` }}>{item.name}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
