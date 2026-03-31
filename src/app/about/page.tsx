'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, Zap, Target, Eye, Flame, Shield, TrendingUp, Heart, Globe, Star } from 'lucide-react';

const programs = [
  { title: 'Beginner', level: 1, desc: 'Perfect for first-time skaters. Learn balance, basic movement, and safety fundamentals.', color: '#4CAF50', features: ['Basic stance & balance', 'Forward movement', 'Stopping techniques', 'Safety training'] },
  { title: 'Intermediate', level: 2, desc: 'Build speed, agility, and confidence. Advanced techniques for competitive readiness.', color: '#FFD400', features: ['Speed training', 'Crossover turns', 'Slalom techniques', 'Endurance building'] },
  { title: 'Advanced', level: 3, desc: 'Elite training for competition-level skaters. Race preparation and championship coaching.', color: '#E10600', features: ['Race strategy', 'Advanced freestyle', 'Competition preparation', 'Performance analysis'] },
];

const missionPoints = [
  { icon: Flame, color: '#E10600', title: 'Ignite Passion', desc: 'Create a dynamic, safe, and motivating learning environment for skaters of all ages.' },
  { icon: TrendingUp, color: '#FFD400', title: 'International Standards', desc: 'Train athletes through expert coaching, structured skill development, and scientific methods.' },
  { icon: Shield, color: '#C0C0C0', title: 'Build Character', desc: 'Instill discipline, perseverance, leadership, teamwork, and respect beyond the rink.' },
  { icon: Star, color: '#FFD400', title: 'Nurture Talent', desc: 'Identify and mentor skaters for competitive excellence at district, state, national, and international levels.' },
  { icon: Heart, color: '#E10600', title: 'Promote Wellness', desc: 'Empower young minds to adopt a healthy, active, and purpose-driven lifestyle.' },
  { icon: Globe, color: '#C0C0C0', title: 'Champion Inclusivity', desc: 'Ensure every aspiring skater receives guidance, encouragement, and a platform to shine.' },
];

const reviews = [
  { name: 'Priya Menon', role: 'Parent of student', stars: 5, text: 'My daughter has transformed completely since joining Smart Wheels. The coaches are incredibly patient and professional. She won her first district medal within 6 months!' },
  { name: 'Arjun Nair', role: 'Advanced Student', stars: 5, text: 'Train here for 2 years now. The training is world-class and Coach Abhi pushes you to be the best version of yourself. Best academy in Kerala!' },
  { name: 'Reethu Krishnan', role: 'Parent of student', stars: 5, text: 'The discipline and confidence my son has gained here is priceless. Smart Wheels is not just about skating — it shapes character.' },
  { name: 'Sneha Das', role: 'Intermediate Student', stars: 5, text: 'I came in with zero experience and within a year I was competing at state level. The structured programs really work!' },
  { name: 'Anoop Varma', role: 'Parent of student', stars: 5, text: 'Incredible facilities, dedicated coaches, and a very nurturing environment. My kids absolutely love coming here every day.' },
  { name: 'Meghna Pillai', role: 'Beginner Student', stars: 5, text: 'The best decision I made was joining Smart Wheels. The community is so supportive and the coaches make learning fun and effective.' },
  { name: 'Rahul Shenoy', role: 'Parent of student', stars: 5, text: "Avanika's Guinness World Record is proof of what Smart Wheels can achieve. So proud to be part of this amazing academy family!" },
  { name: 'Divya Suresh', role: 'Advanced Student', stars: 5, text: 'Training with Coach Abhi has been life-changing. The attention to detail and personalized coaching here is unlike anything else.' },
];

export default function AboutPage() {
  const ref1 = useRef(null), ref2 = useRef(null), ref3 = useRef(null), ref4 = useRef(null), ref5 = useRef(null);
  const inView1 = useInView(ref1, { once: true, margin: '-80px' });
  const inView2 = useInView(ref2, { once: true, margin: '-80px' });
  const inView3 = useInView(ref3, { once: true, margin: '-80px' });
  const inView4 = useInView(ref4, { once: true, margin: '-80px' });
  const inView5 = useInView(ref5, { once: true, margin: '-60px' });

  return (
    <>
      {/* Hero */}
      <section style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'var(--bg-primary)', paddingTop: 'var(--space-12)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(225,6,0,0.08), transparent 60%)' }} />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: 'var(--space-4)' }}>
          <h1 style={{ marginBottom: 'var(--space-3)' }}>Building <span className="gradient-text">Champions</span> on Wheels</h1>
          <p style={{ maxWidth: 600, margin: '0 auto', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Since 2014, Smart Wheels has been transforming aspiring skaters into competitive athletes through world-class coaching and state-of-the-art facilities.
          </p>
        </motion.div>
      </section>

      {/* Founder Story */}
      <section ref={ref1} style={{ background: 'var(--bg-secondary)', padding: 'var(--space-12) var(--space-4)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={inView1 ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(225,6,0,0.15), rgba(255,212,0,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={80} strokeWidth={0.8} color="var(--accent-red)" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView1 ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--accent-red)', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>Our Story</span>
            <h2 style={{ margin: 'var(--space-2) 0 var(--space-3)' }}>Founded on <span className="gradient-text">Passion</span></h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 'var(--space-3)' }}>
              Smart Wheels Skating Academy was born from a vision to bring professional-level skating training to aspiring athletes across India. What started as a single training center in Mumbai has grown into a multi-city academy producing state and national champions.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Our founder, driven by decades of competitive skating experience, established a training methodology that combines international techniques with personalized coaching, creating a path to excellence for every student.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section ref={ref2} style={{ background: 'var(--bg-primary)', padding: 'var(--space-16) var(--space-4)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,212,0,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="container">
          <motion.div className="section-title" initial={{ opacity: 0, y: 40 }} animate={inView2 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>

            <h2>The <span className="gradient-text">Vision</span></h2>
            <div className="divider" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              maxWidth: '1060px',
              margin: '0 auto',
              padding: 'var(--space-10) var(--space-12)',
              background: 'linear-gradient(135deg, rgba(255,212,0,0.07), rgba(225,6,0,0.05))',
              border: '1px solid rgba(255,212,0,0.2)',
              borderRadius: 'var(--radius-xl)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: '-20px', left: '40px', fontFamily: 'Georgia, serif', fontSize: '14rem', color: 'rgba(255,212,0,0.07)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>&ldquo;</div>
            <p style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.55rem)', color: 'var(--text-secondary)', lineHeight: 2.1, textAlign: 'center', position: 'relative', zIndex: 1, fontStyle: 'italic', letterSpacing: '0.01em' }}>
              To emerge as a beacon of excellence in skating that shapes{' '}
              <span style={{ color: '#FFD400', fontWeight: 700, fontStyle: 'normal' }}>confident champions</span> and{' '}
              <span style={{ color: '#FFD400', fontWeight: 700, fontStyle: 'normal' }}>responsible individuals</span> — nurturing excellence, resilience, and sportsmanship through world-class training, innovation, and unwavering commitment to holistic development.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={ref3} style={{ background: 'var(--bg-secondary)', padding: 'var(--space-12) var(--space-4)' }}>
        <div className="container">
          <motion.div className="section-title" initial={{ opacity: 0, y: 40 }} animate={inView3 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 16px', background: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.3)', borderRadius: '99px', color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: 'var(--space-3)' }}>
              <Target size={13} /> Our Mission
            </div>
            <h2>Our <span className="gradient-text">Mission</span></h2>
            <div className="divider" />
            <p>At Smart Wheels Skating Academy, our mission is to:</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', maxWidth: '1100px', margin: '0 auto' }}>
            {missionPoints.map((item, i) => (
              <motion.div
                key={item.title}
                className="card"
                initial={{ opacity: 0, y: 40 }}
                animate={inView3 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${item.color}18`, border: `1px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={24} color={item.color} strokeWidth={1.5} />
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', letterSpacing: '0.06em', color: item.color, marginBottom: '4px' }}>{item.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section ref={ref4} id="programs" style={{ background: 'var(--bg-primary)', padding: 'var(--space-12) var(--space-4)' }}>
        <div className="container">
          <motion.div className="section-title" initial={{ opacity: 0, y: 40 }} animate={inView4 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <h2>Training <span className="gradient-text">Programs</span></h2>
            <div className="divider" />
            <p>Structured progression from beginner to competition level</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', maxWidth: 1000, margin: '0 auto' }}>
            {programs.map((prog, i) => (
              <motion.div key={prog.title} className="card" initial={{ opacity: 0, y: 50 }} animate={inView4 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }} style={{ padding: 'var(--space-5) var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-2)' }}>
                  {[1, 2, 3].map(l => (
                    <div key={l} style={{ width: 32, height: 4, borderRadius: 2, background: l <= prog.level ? prog.color : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', letterSpacing: '0.06em', color: prog.color, marginBottom: 'var(--space-1)' }}>{prog.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>{prog.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {prog.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '4px 0' }}>
                      <Zap size={12} color={prog.color} /> {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section ref={ref5} style={{ background: 'var(--bg-secondary)', padding: 'var(--space-12) var(--space-4)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(225,6,0,0.06), transparent 60%)', pointerEvents: 'none' }} />
        <div className="container">
          <motion.div className="section-title" initial={{ opacity: 0, y: 40 }} animate={inView5 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 16px', background: 'rgba(255,212,0,0.1)', border: '1px solid rgba(255,212,0,0.3)', borderRadius: '99px', color: '#FFD400', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: 'var(--space-3)' }}>
              ★ Student Reviews
            </div>
            <h2>What Our <span className="gradient-text">Community</span> Says</h2>
            <div className="divider" />
            <p>Real words from students and parents of Smart Wheels Skating Academy</p>
          </motion.div>
        </div>

        {/* Marquee Row 1 — left scroll */}
        <div style={{ overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
            style={{ display: 'flex', gap: 'var(--space-4)', width: 'max-content' }}
          >
            {[...reviews, ...reviews].map((r, i) => (
              <div key={i} style={{
                minWidth: '340px', maxWidth: '340px',
                background: 'var(--bg-card)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                flexShrink: 0,
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                  {Array.from({ length: r.stars }).map((_, s) => (
                    <span key={s} style={{ color: '#FFD400', fontSize: '1rem' }}>★</span>
                  ))}
                </div>
                {/* Quote */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 'var(--space-3)', fontStyle: 'italic' }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #E10600, #FFD400)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#fff', flexShrink: 0 }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>{r.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--accent-red)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600 }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Marquee Row 2 — right scroll */}
        <div style={{ overflow: 'hidden' }}>
          <motion.div
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
            style={{ display: 'flex', gap: 'var(--space-4)', width: 'max-content' }}
          >
            {[...reviews.slice(4), ...reviews.slice(4)].map((r, i) => (
              <div key={i} style={{
                minWidth: '340px', maxWidth: '340px',
                background: 'var(--bg-card)',
                border: '1px solid rgba(255,212,0,0.08)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                flexShrink: 0,
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                  {Array.from({ length: r.stars }).map((_, s) => (
                    <span key={s} style={{ color: '#FFD400', fontSize: '1rem' }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 'var(--space-3)', fontStyle: 'italic' }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD400, #E10600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#fff', flexShrink: 0 }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>{r.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#FFD400', textTransform: 'uppercase' as const, letterSpacing: '0.08em', fontWeight: 600 }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
