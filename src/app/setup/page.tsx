'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { db } from '@/lib/firebase';
import { Check, AlertTriangle, Loader } from 'lucide-react';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface AccountSetup {
  label: string;
  email: string;
  password: string;
  role: 'admin' | 'instructor';
  branchId?: string;
}

const accounts: AccountSetup[] = [
  { label: 'Admin Account',      email: 'admin@smartwheels.com',      password: 'admin@123',      role: 'admin' },
  { label: 'Instructor Account', email: 'instructor@smartwheels.com', password: 'instructor@123', role: 'instructor', branchId: '' },
];

type Status = 'idle' | 'loading' | 'success' | 'error' | 'exists';

export default function SetupPage() {
  const [results, setResults] = useState<Record<string, { status: Status; message: string }>>({});
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const createAccount = async (account: AccountSetup): Promise<{ status: Status; message: string }> => {
    const appName = `setup-${Date.now()}-${Math.random()}`;
    const tempApp = initializeApp(firebaseConfig, appName);
    const tempAuth = getAuth(tempApp);

    try {
      const cred = await createUserWithEmailAndPassword(tempAuth, account.email, account.password);
      const uid = cred.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid,
        role: account.role,
        email: account.email,
        name: account.label.replace(' Account', ''),
        branchId: account.branchId || '',
        createdAt: new Date().toISOString(),
      });

      return { status: 'success', message: `Created ✓  UID: ${uid.slice(0, 12)}…` };
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        return { status: 'exists', message: 'Already exists in Firebase Auth — nothing changed.' };
      }
      return { status: 'error', message: err.message };
    } finally {
      await deleteApp(tempApp).catch(() => {});
    }
  };

  const handleSetup = async () => {
    setRunning(true);
    setResults({});

    for (const account of accounts) {
      setResults(prev => ({ ...prev, [account.email]: { status: 'loading', message: 'Creating…' } }));
      const result = await createAccount(account);
      setResults(prev => ({ ...prev, [account.email]: result }));
    }

    setRunning(false);
    setDone(true);
  };

  const statusColor: Record<Status, string> = {
    idle:    'var(--text-muted)',
    loading: 'var(--accent-yellow)',
    success: '#4CAF50',
    error:   '#E10600',
    exists:  'var(--accent-yellow)',
  };

  const statusIcon: Record<Status, string> = {
    idle: '○', loading: '⏳', success: '✅', error: '❌', exists: '⚠️',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 'var(--space-4)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 560, background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,212,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-3)' }}>
            <AlertTriangle size={28} color="var(--accent-yellow)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', margin: 0 }}>
            First-Time <span className="gradient-text">Setup</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6 }}>
            This creates the admin and instructor accounts in Firebase Auth.<br />
            Run this <strong style={{ color: 'var(--text-primary)' }}>once</strong> — then delete this page.
          </p>
        </div>

        {/* Accounts to create */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          {accounts.map(account => {
            const result = results[account.email] || { status: 'idle' as Status, message: '' };
            return (
              <div key={account.email} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md)', padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{account.label}</span>
                  <span style={{ fontSize: '1rem' }}>{statusIcon[result.status]}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: 4 }}>
                  📧 {account.email}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: result.message ? 8 : 0 }}>
                  🔑 {account.password}
                </div>
                {result.message && (
                  <div style={{ fontSize: '0.78rem', color: statusColor[result.status], marginTop: 4, fontWeight: 500 }}>
                    {result.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action button */}
        {!done ? (
          <button
            onClick={handleSetup}
            disabled={running}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: running ? 0.7 : 1, cursor: running ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {running ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating Accounts…</> : 'Create Firebase Accounts'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ textAlign: 'center', background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', color: '#4CAF50', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
              <Check size={18} /> Setup Complete!
            </div>
            <a href="/admin/login" style={{ display: 'block', textAlign: 'center', background: 'var(--accent-red)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
              → Go to Admin Login
            </a>
            <a href="/instructor/login" style={{ display: 'block', textAlign: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              → Go to Instructor Login
            </a>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 'var(--space-4)', lineHeight: 1.5 }}>
          ⚠️ Delete <code>/app/setup/page.tsx</code> after setup is complete.
        </p>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
