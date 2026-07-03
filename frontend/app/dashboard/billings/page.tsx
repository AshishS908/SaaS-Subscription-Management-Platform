'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Invoice { id: number; amount_paid_cents: number; currency: string; status: string; invoice_pdf: string; created_at: string; }

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => { api.get('/billing/invoices').then((res) => setInvoices(res.data.invoices)); }, []);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await api.post('/billing/portal');
      window.location.href = res.data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div>
      <h1>Billing</h1>
      <button onClick={openPortal} disabled={portalLoading} style={{ marginBottom: 24 }}>
        {portalLoading ? 'Opening...' : 'Manage billing / payment method'}
      </button>
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}><th>Date</th><th>Amount</th><th>Status</th><th>PDF</th></tr></thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{new Date(inv.created_at).toLocaleDateString()}</td>
              <td>{(inv.amount_paid_cents / 100).toFixed(2)} {inv.currency.toUpperCase()}</td>
              <td>{inv.status}</td>
              <td>{inv.invoice_pdf ? <a href={inv.invoice_pdf} target="_blank" rel="noreferrer">View</a> : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
