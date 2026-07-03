'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/plans">Plans</Link>
        <Link href="/dashboard/billing">Billing</Link>
        {user?.role === 'admin' && <Link href="/admin">Admin</Link>}
      </div>
      <div>
        {user && (<><span style={{ marginRight: 12 }}>{user.email}</span><button onClick={logout}>Log out</button></>)}
      </div>
    </nav>
  );
}
