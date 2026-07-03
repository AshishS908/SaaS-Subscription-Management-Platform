'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Plan { id: number; name: string; description: string; price_cents: number; currency: string; interval: string; features: string[]; }

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busyPlanId, setBusyPlanId] = useState<number | null>(null);

  useEffect(() => { api.get('/plans').then((res) => setPlans(res.data.plans)); }, []);

  async function handleSubscribe(planId: number) {
    setBusyPlanId(planId);
    try {
      const res = await api.post('/subscriptions/checkout', { planId });
      window.location.href = res.data.url;
    } finally {
      setBusyPlanId(null);
    }
  }

  return (
    <div>
      <h1>Plans</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {plans.map((plan) => (
          <div key={plan.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <p style={{ fontSize: 24, fontWeight: 600 }}>{(plan.price_cents / 100).toFixed(2)} {plan.currency.toUpperCase()} / {plan.interval}</p>
            <ul>{(plan.features || []).map((f, i) => <li key={i}>{f}</li>)}</ul>
            <button onClick={() => handleSubscribe(plan.id)} disabled={busyPlanId === plan.id}>
              {busyPlanId === plan.id ? 'Redirecting...' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
