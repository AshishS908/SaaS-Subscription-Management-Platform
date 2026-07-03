'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading || !user) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <>
      <Navbar />
      <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>{children}</main>
    </>
  );
}
