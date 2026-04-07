'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Lock, ArrowLeft } from 'lucide-react';
import { login } from '@/lib/authService';

export default function InstructorLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);

      if (user.role === 'instructor') {
        router.push('/instructor/attendance');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        setError('Access denied. This portal is for Instructors only.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 'var(--space-4)', position: 'relative' }}>
      <Link href="/" style={{
        position: 'absolute', top: 'var(--space-6)', left: 'var(--space-6)',
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
        color: 'var(--text-secondary)', padding: '10px 18px', borderRadius: 'var(--radius-full)',
        textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, zIndex: 10,
        backdropFilter: 'blur(12px)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--accent-red)';
        e.currentTarget.style.borderColor = 'var(--accent-red)';
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-red-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}>
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(255,212,0,0.06), transparent 50%)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 420, background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,212,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
            <BookOpen size={28} color="var(--accent-yellow)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', letterSpacing: '0.08em' }}>Instructor <span className="gradient-text">Portal</span></h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>Attendance management for coaches</p>
        </div>

        {error && (
          <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(225,6,0,0.15)', border: '1px solid rgba(225,6,0,0.3)', color: 'var(--accent-red)', fontSize: '0.8rem', textAlign: 'center', marginBottom: 'var(--space-3)' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="instructor@example.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 'var(--space-2)', fontSize: '0.9rem', marginTop: 'var(--space-2)' }} disabled={loading}>
            <Lock size={16} /> {loading ? 'Logging in…' : 'Login to Portal'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
          Use your registered email and password.
        </p>
      </motion.div>
    </div>
  );
}
