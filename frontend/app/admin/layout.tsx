'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/dashboard');
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'admin') return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <>
      <Navbar />
      <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>{children}</main>
    </>
  );
}
