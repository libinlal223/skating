'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Users } from 'lucide-react';

export default function SkatingBanner2() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        height: '480px',
        overflow: 'hidden',
        display: 'block',
      }}
    >
      {/* Parallax image */}
      <motion.div style={{ position: 'absolute', inset: '-10%', y }}>
        <Image
          src="/skating_banner2.png"
          alt="Smart Wheels students training together"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
        />
      </motion.div>

      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to left, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.65) 100%)',
      }} />

      {/* Red accent line top */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #FFD400, #E10600, #FFD400)',
      }} />

      {/* Content — right aligned this time for visual variety */}
      <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'right', maxWidth: '540px' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            background: 'rgba(255,212,0,0.12)',
            border: '1px solid rgba(255,212,0,0.35)',
            borderRadius: '99px',
            color: '#FFD400',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '14px',
          }}>
            <Users size={12} /> 500+ Students & Growing
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            lineHeight: 1.05,
            letterSpacing: '0.04em',
            color: '#ffffff',
            textShadow: '0 4px 30px rgba(0,0,0,0.8)',
            marginBottom: '16px',
          }}>
            Train Together. <br />
            <span style={{ background: 'linear-gradient(135deg, #FFD400, #E10600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Win Together.
            </span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7,
            marginBottom: '24px',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}>
            Join a community of passionate skaters and world-class coaches pushing the limits every single day.
          </p>
          <a href="/gallery" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '12px 32px' }}>
            View Our Gallery
          </a>
        </motion.div>
      </div>

      {/* Red accent line bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #E10600, #FFD400, #E10600)',
      }} />
    </section>
  );
}
