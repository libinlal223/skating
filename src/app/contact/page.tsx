'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <section style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', paddingTop: 'var(--space-12)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 60%, rgba(225,6,0,0.06), transparent 50%)' }} />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', zIndex: 1 }}>
          <h1>Get in <span className="gradient-text">Touch</span></h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: 'var(--space-2) auto 0' }}>Ready to start your skating journey? We&#39;d love to hear from you.</p>
        </motion.div>
      </section>

      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-12) var(--space-4)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-8)' }}>
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h2 style={{ marginBottom: 'var(--space-4)', fontSize: '2rem' }}>Send us a <span className="gradient-text">Message</span></h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" placeholder="Tell us about your skating goals..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 'var(--space-2) var(--space-4)', fontSize: '0.9rem', gap: 8 }}>
                {submitted ? <><CheckCircle size={16} /> Sent Successfully!</> : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <h2 style={{ marginBottom: 'var(--space-4)', fontSize: '2rem' }}>Academy <span className="gradient-text">Info</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { icon: Phone, label: 'Phone', value: '+91 123 456 7890', href: 'tel:+911234567890' },
                { icon: Mail, label: 'Email', value: 'info@smartwheels.com', href: 'mailto:info@smartwheels.com' },
                { icon: MapPin, label: 'Address', value: 'Mahalaxmi Sports Complex, Mumbai, India', href: '#' },
              ].map((info, i) => (
                <a key={i} href={info.href} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 'var(--space-3)', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', transition: 'all 0.3s', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(225,6,0,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(225,6,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <info.icon size={20} color="var(--accent-red)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 2 }}>{info.label}</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{info.value}</div>
                  </div>
                </a>
              ))}

              {/* WhatsApp */}
              <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#25D366', color: '#fff', width: '100%', padding: 'var(--space-2) var(--space-4)', fontSize: '0.9rem', gap: 8, marginTop: 'var(--space-2)' }}>
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
            </div>

            {/* Map */}
            <div style={{ marginTop: 'var(--space-4)', width: '100%', height: 250, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(225,6,0,0.08), rgba(255,212,0,0.04))', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <MapPin size={40} strokeWidth={1} color="var(--accent-red)" />
                <p style={{ fontSize: '0.8rem', marginTop: 8 }}>Google Maps embed area</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
