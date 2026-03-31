'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

const cats = ['All', 'Training', 'Competitions', 'Events', 'Awards'];
const items = [
  { id: 1, cat: 'Training', title: 'Speed Training', color: '#E10600' },
  { id: 2, cat: 'Competitions', title: 'State Championship 2024', color: '#FFD400' },
  { id: 3, cat: 'Events', title: 'Annual Day', color: '#C0C0C0' },
  { id: 4, cat: 'Training', title: 'Balance Drills', color: '#E10600' },
  { id: 5, cat: 'Awards', title: 'Best Academy Award', color: '#FFD400' },
  { id: 6, cat: 'Competitions', title: 'District Finals', color: '#C0C0C0' },
  { id: 7, cat: 'Events', title: 'Summer Camp 2024', color: '#E10600' },
  { id: 8, cat: 'Training', title: 'Freestyle Practice', color: '#FFD400' },
  { id: 9, cat: 'Awards', title: 'National Recognition', color: '#C0C0C0' },
  { id: 10, cat: 'Competitions', title: 'Inter-State Competition', color: '#E10600' },
  { id: 11, cat: 'Events', title: 'Workshop 2024', color: '#FFD400' },
  { id: 12, cat: 'Training', title: 'Endurance Session', color: '#C0C0C0' },
];

export default function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const [lb, setLb] = useState<number | null>(null);
  const filtered = filter === 'All' ? items : items.filter(i => i.cat === filter);

  return (
    <>
      <section style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', paddingTop: 'var(--space-12)' }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center' }}>
          <h1>Our <span className="gradient-text">Gallery</span></h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: 'var(--space-2) auto 0' }}>Moments of triumph, training, and teamwork</p>
        </motion.div>
      </section>

      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-8) var(--space-4)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                padding: '10px 24px', background: filter === c ? 'var(--accent-red)' : 'transparent',
                border: `1px solid ${filter === c ? 'var(--accent-red)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '9999px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: filter === c ? '0 0 20px rgba(225,6,0,0.3)' : 'none'
              }}>{c}</button>
            ))}
          </div>

          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.35 }} onClick={() => setLb(item.id)}
                  style={{ position: 'relative', height: i % 3 === 0 ? 320 : 220, borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', background: `linear-gradient(135deg, ${item.color}18, ${item.color}06)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={48} color={item.color} style={{ opacity: 0.2 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(225,6,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                    <ZoomIn size={28} /><span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginTop: 8 }}>{item.title}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {lb !== null && (() => {
          const item = items.find(i => i.id === lb);
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLb(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}>
              <button onClick={() => setLb(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#F5F5F5', cursor: 'pointer' }}><X size={28} /></button>
              <button onClick={e => { e.stopPropagation(); const idx = filtered.findIndex(f => f.id === lb); setLb(filtered[(idx - 1 + filtered.length) % filtered.length].id); }}
                style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#F5F5F5', cursor: 'pointer', padding: 14, borderRadius: '50%' }}><ChevronLeft size={28} /></button>
              <div onClick={e => e.stopPropagation()} style={{ width: '75%', maxWidth: 850, aspectRatio: '16/10', borderRadius: 'var(--radius-lg)', background: `linear-gradient(135deg, ${item?.color}25, ${item?.color}08)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={80} color={item?.color} style={{ opacity: 0.8 }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginTop: 16, color: '#F5F5F5' }}>{item?.title}</h3>
                <p style={{ color: '#666', marginTop: 8 }}>{item?.cat}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); const idx = filtered.findIndex(f => f.id === lb); setLb(filtered[(idx + 1) % filtered.length].id); }}
                style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#F5F5F5', cursor: 'pointer', padding: 14, borderRadius: '50%' }}><ChevronRight size={28} /></button>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
