'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface UsageRow { metric: string; day: string; total: string; }

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/usage/me?days=30').then((res) => setUsage(res.data.usage)).finally(() => setLoading(false));
  }, []);

  const chartData = usage.map((row) => ({ day: new Date(row.day).toLocaleDateString(), total: Number(row.total) }));

  return (
    <div>
      <h1>Usage Analytics</h1>
      {loading && <p>Loading usage data...</p>}
      {!loading && chartData.length === 0 && <p>No usage recorded yet.</p>}
      {!loading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
