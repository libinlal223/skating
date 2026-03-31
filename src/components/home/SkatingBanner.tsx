'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

export default function SkatingBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Subtle parallax: image moves slower than scroll
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
          src="/skating_action.png"
          alt="Professional roller skating in action"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          priority={false}
        />
      </motion.div>

      {/* Dark overlay for readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.65) 100%)',
      }} />

      {/* Red accent line at top */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #E10600, #FFD400, #E10600)',
      }} />

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--accent-red)',
            marginBottom: '12px',
          }}>
            Speed · Skill · Spirit
          </p>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            lineHeight: 1.05,
            letterSpacing: '0.04em',
            color: '#ffffff',
            textShadow: '0 4px 30px rgba(0,0,0,0.8)',
            marginBottom: '20px',
            maxWidth: '600px',
          }}>
            Skate Fast. <br />
            <span style={{ background: 'linear-gradient(135deg, #E10600, #FFD400)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Dream Bigger.
            </span>
          </h2>
          <a href="/contact" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '12px 32px' }}>
            Start Training Today
          </a>
        </motion.div>
      </div>

      {/* Red accent line at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #FFD400, #E10600, #FFD400)',
      }} />
    </section>
  );
}
