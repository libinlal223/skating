'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, User, Clock, Phone } from 'lucide-react';

const branchData = [
  { name: 'Mumbai Central', location: 'Mahalaxmi Sports Complex, Mumbai', coach: 'Coach Rajesh Kumar', timings: 'Mon-Sat: 6AM-8PM', phone: '+91 98765 43210', lat: 19.0176, lng: 72.8562 },
  { name: 'Pune Branch', location: 'Shivaji Nagar Sports Arena, Pune', coach: 'Coach Priya Sharma', timings: 'Mon-Sat: 7AM-9PM', phone: '+91 98765 43211', lat: 18.5314, lng: 73.8446 },
  { name: 'Delhi NCR', location: 'Connaught Place Sports Hub, Delhi', coach: 'Coach Amit Patel', timings: 'Mon-Sat: 6AM-8PM', phone: '+91 98765 43212', lat: 28.6315, lng: 77.2167 },
];

export default function BranchesPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <>
      {/* Hero */}
      <section style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', paddingTop: 'var(--space-12)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 80%, rgba(255,212,0,0.06), transparent 60%)' }} />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', zIndex: 1 }}>
          <h1>Our <span className="gradient-text">Branches</span></h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: 'var(--space-2) auto 0' }}>Find a Smart Wheels training center near you</p>
        </motion.div>
      </section>

      {/* Map placeholder */}
      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-6) var(--space-4)' }}>
        <div className="container">
          <div style={{ width: '100%', height: 400, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(225,6,0,0.08), rgba(255,212,0,0.04))', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
              <svg viewBox="0 0 800 400" fill="none" style={{ width: '100%', height: '100%' }}>
                <path d="M100 350 C200 200 300 300 400 200 C500 100 600 250 700 150" stroke="#E10600" strokeWidth="2" fill="none"/>
                <path d="M50 300 C150 150 250 250 350 150 C450 50 550 200 750 100" stroke="#FFD400" strokeWidth="1.5" fill="none" strokeDasharray="5,5"/>
              </svg>
            </div>
            {branchData.map((b, i) => (
              <motion.div key={b.name} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                style={{ position: 'absolute', left: `${15 + i * 17}%`, top: `${30 + (i % 2 === 0 ? 0 : 20)}%` }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--accent-red)', boxShadow: '0 0 20px rgba(225,6,0,0.5)', cursor: 'pointer', transition: 'all 0.3s' }}
                  title={b.name} />
                <span style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 500 }}>{b.name}</span>
              </motion.div>
            ))}
            <MapPin size={48} strokeWidth={1} color="var(--accent-silver)" style={{ opacity: 0.2 }} />
          </div>
        </div>
      </section>

      {/* Branch Cards */}
      <section ref={ref} style={{ background: 'var(--bg-primary)', padding: 'var(--space-12) var(--space-4)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-4)' }}>
            {branchData.map((b, i) => (
              <motion.div key={b.name} className="card" initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ padding: 'var(--space-4)', flex: '1 1 300px', maxWidth: '380px', width: '100%' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', letterSpacing: '0.06em', marginBottom: 'var(--space-3)', color: 'var(--text-primary)' }}>{b.name}</h3>
                {[
                  { icon: MapPin, text: b.location },
                  { icon: User, text: b.coach },
                  { icon: Clock, text: b.timings },
                  { icon: Phone, text: b.phone },
                ].map((detail, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <detail.icon size={16} color="var(--accent-red)" /> {detail.text}
                  </div>
                ))}
                <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="btn btn-primary" style={{ marginTop: 'var(--space-2)', width: '100%', fontSize: '0.8rem' }}>Contact Branch</a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
