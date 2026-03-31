'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Trophy, Zap, Target } from 'lucide-react';

const features = [
  {
    icon: Trophy,
    title: 'Expert Coaches',
    description: 'Learn from NSNIS certified instructors who guide students from beginner to advanced levels.',
    color: '#FFD400',
  },
  {
    icon: Zap,
    title: 'Professional Training',
    description: 'Structured training programs designed for speed, technique, and competitive edge.',
    color: '#E10600',
  },
  {
    icon: Target,
    title: 'Competition Coaching',
    description: 'Focused preparation for state, national, and international skating championships.',
    color: '#C0C0C0',
  },
];

export default function WhySmartWheels() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="why section-padding" ref={ref}>
      <div className="container">
        <motion.div
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2>
            Why <span className="gradient-text">Smart Wheels</span>
          </h2>
          <div className="divider" />
          <p>What makes us the leading skating academy in the region</p>
        </motion.div>

        <div className="why__grid">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              className="why__card card"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="why__icon" style={{ color: feat.color }}>
                <feat.icon size={32} strokeWidth={1.5} />
              </div>
              <h3 className="why__card-title">{feat.title}</h3>
              <p className="why__card-desc">{feat.description}</p>
              <div className="why__card-accent" style={{ background: feat.color }} />
            </motion.div>
          ))}
        </div>
      </div>


    </section>
  );
}
