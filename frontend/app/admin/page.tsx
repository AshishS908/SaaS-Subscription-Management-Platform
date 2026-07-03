'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<{ metric: string; day: string; total: string; active_users: string }[]>([]);

  useEffect(() => { api.get('/usage/platform?days=30').then((res) => setStats(res.data.usage)); }, []);

  return (
    <div>
      <h1>Admin Overview</h1>
      <p>Platform usage over the last 30 days.</p>
      <table width="100%" cellPadding={8}>
        <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}><th>Date</th><th>Metric</th><th>Total</th><th>Active users</th></tr></thead>
        <tbody>
          {stats.map((row, i) => (
            <tr key={i}><td>{new Date(row.day).toLocaleDateString()}</td><td>{row.metric}</td><td>{row.total}</td><td>{row.active_users}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
