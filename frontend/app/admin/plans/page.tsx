'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Plan { id: number; name: string; price_cents: number; interval: string; is_active: boolean; }

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ name: '', description: '', priceCents: '', interval: 'month' });
  const [submitting, setSubmitting] = useState(false);

  function loadPlans() { api.get('/plans/admin').then((res) => setPlans(res.data.plans)); }
  useEffect(() => { loadPlans(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/plans', { name: form.name, description: form.description, priceCents: Number(form.priceCents), interval: form.interval });
      setForm({ name: '', description: '', priceCents: '', interval: 'month' });
      loadPlans();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(plan: Plan) {
    await api.patch(`/plans/${plan.id}`, { isActive: !plan.is_active });
    loadPlans();
  }

  return (
    <div>
      <h1>Manage Plans</h1>
      <form onSubmit={handleCreate} style={{ marginBottom: 32, maxWidth: 400 }}>
        <input placeholder="Plan name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input type="number" placeholder="Price in cents (e.g. 1900 = $19.00)" value={form.priceCents} onChange={(e) => setForm({ ...form, priceCents: e.target.value })} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <select value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })} style={{ display: 'block', width: '100%', marginBottom: 8 }}>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
        <button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create plan'}</button>
      </form>
      <table width="100%" cellPadding={8}>
        <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}><th>Name</th><th>Price</th><th>Interval</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td><td>{(p.price_cents / 100).toFixed(2)}</td><td>{p.interval}</td><td>{p.is_active ? 'Yes' : 'No'}</td>
              <td><button onClick={() => toggleActive(p)}>{p.is_active ? 'Deactivate' : 'Activate'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
