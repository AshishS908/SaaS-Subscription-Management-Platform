import Link from 'next/link';
export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: '80px auto', textAlign: 'center' }}>
      <h1>SaaS Subscription Platform</h1>
      <p>Manage plans, billing, and usage in one place.</p>
      <div style={{ marginTop: 24 }}>
        <Link href="/login">Log in</Link> {' | '} <Link href="/register">Sign up</Link>
      </div>
    </main>
  );
}