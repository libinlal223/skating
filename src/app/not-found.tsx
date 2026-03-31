import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(225,6,0,0.08), transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '2rem' }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(6rem, 20vw, 14rem)',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #E10600, #FFD400)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem',
          letterSpacing: '0.05em',
        }}>
          404
        </div>
        <h1 style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 400, margin: '0 auto 2rem', lineHeight: 1.7 }}>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to Home
          </Link>
          <Link href="/contact" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
