'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, User, Clock, ArrowRight } from 'lucide-react';

const branches = [
  {
    name: 'Mumbai Central',
    location: 'Mahalaxmi Sports Complex, Mumbai',
    coach: 'Coach Rajesh Kumar',
    timings: 'Mon-Sat: 6AM - 8PM',
    color: '#E10600',
  },
  {
    name: 'Pune Branch',
    location: 'Shivaji Nagar Sports Arena, Pune',
    coach: 'Coach Priya Sharma',
    timings: 'Mon-Sat: 7AM - 9PM',
    color: '#FFD400',
  },
  {
    name: 'Delhi NCR',
    location: 'Connaught Place Sports Hub, Delhi',
    coach: 'Coach Amit Patel',
    timings: 'Mon-Sat: 6AM - 8PM',
    color: '#C0C0C0',
  }
];

export default function BranchesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="branches-section section-padding" ref={ref}>
      <div className="container">
        <motion.div
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2>
            Our <span className="gradient-text">Branches</span>
          </h2>
          <div className="divider" />
          <p>Training centers across India with world-class facilities</p>
        </motion.div>

        <div className="branches__grid">
          {branches.map((branch, i) => (
            <motion.div
              key={branch.name}
              className="branches__card"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="branches__card-image">
                <div className="branches__card-image-placeholder" style={{ background: `linear-gradient(135deg, ${branch.color}22, ${branch.color}08)` }}>
                  <MapPin size={40} color={branch.color} strokeWidth={1} />
                </div>
                <div className="branches__card-overlay" />
              </div>
              <div className="branches__card-content">
                <h4 className="branches__card-name">{branch.name}</h4>
                <div className="branches__card-detail">
                  <MapPin size={14} />
                  <span>{branch.location}</span>
                </div>
                <div className="branches__card-detail">
                  <User size={14} />
                  <span>{branch.coach}</span>
                </div>
                <div className="branches__card-detail">
                  <Clock size={14} />
                  <span>{branch.timings}</span>
                </div>
                <a href="/branches" className="branches__card-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  View Details <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>


    </section>
  );
}
