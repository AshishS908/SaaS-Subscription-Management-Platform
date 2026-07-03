import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
export const metadata: Metadata = {
  title: 'SaaS Subscription Platform',
  description: 'Manage subscriptions, billing, and usage analytics',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}