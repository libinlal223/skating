'use client';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

const categories = ['All', 'Training', 'Competitions', 'Events', 'Awards'];
const galleryItems = [
  { id: 1, category: 'Training', title: 'Speed Training', color: '#E10600' },
  { id: 2, category: 'Competitions', title: 'State Championship', color: '#FFD400' },
  { id: 3, category: 'Events', title: 'Annual Day 2024', color: '#C0C0C0' },
  { id: 4, category: 'Training', title: 'Balance Drills', color: '#E10600' },
  { id: 5, category: 'Awards', title: 'National Recognition', color: '#FFD400' },
  { id: 6, category: 'Competitions', title: 'District Finals', color: '#C0C0C0' },
  { id: 7, category: 'Events', title: 'Summer Camp', color: '#E10600' },
  { id: 8, category: 'Training', title: 'Technique Session', color: '#FFD400' },
];

export default function GalleryPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const filtered = filter === 'All' ? galleryItems : galleryItems.filter(i => i.category === filter);

  return (
    <section ref={ref} style={{ background: 'var(--bg-primary)', padding: 'var(--space-12) var(--space-4)' }}>
      <div className="container">
        <motion.div className="section-title" initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <h2>Our <span className="gradient-text">Gallery</span></h2>
          <div className="divider" />
          <p>Capturing moments of excellence, training, and competitive spirit</p>
        </motion.div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '8px 20px', background: filter === cat ? 'var(--accent-red)' : 'transparent',
              border: `1px solid ${filter === cat ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '9999px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.06em',
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: filter === cat ? '0 0 20px rgba(225,6,0,0.3)' : 'none'
            }}>{cat}</button>
          ))}
        </div>
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-2)' }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }} onClick={() => setLightbox(item.id)}
                style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', height: i % 3 === 0 ? 300 : 200, background: `linear-gradient(135deg, ${item.color}20, ${item.color}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={48} color={item.color} style={{ opacity: 0.3 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(225,6,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                  <ZoomIn size={24} />
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginTop: 8 }}>{item.title}</span>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{item.category}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          <a href="/gallery" className="btn btn-secondary">View Full Gallery</a>
        </div>
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#F5F5F5', cursor: 'pointer' }}><X size={24} /></button>
            <button onClick={e => { e.stopPropagation(); const idx = filtered.findIndex(f => f.id === lightbox); setLightbox(filtered[(idx - 1 + filtered.length) % filtered.length].id); }}
              style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#F5F5F5', cursor: 'pointer', padding: 12, borderRadius: '50%' }}><ChevronLeft size={32} /></button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              style={{ width: '80%', maxWidth: 800, aspectRatio: '16/10', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {(() => { const item = galleryItems.find(g => g.id === lightbox); return item ? (
                <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={96} color={item.color} style={{ opacity: 0.8 }} />
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '0.05em', marginTop: 16, color: '#F5F5F5' }}>{item.title}</h3>
                  <p style={{ color: '#666', marginTop: 8 }}>{item.category}</p>
                </div>) : null; })()}
            </motion.div>
            <button onClick={e => { e.stopPropagation(); const idx = filtered.findIndex(f => f.id === lightbox); setLightbox(filtered[(idx + 1) % filtered.length].id); }}
              style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#F5F5F5', cursor: 'pointer', padding: 12, borderRadius: '50%' }}><ChevronRight size={32} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
