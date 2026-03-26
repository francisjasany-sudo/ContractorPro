'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { calcEstimate, calcLineItem } from '@contractorpro/shared';
import { ModernTemplate, ClassicTemplate } from '@/components/templates';
import type { ProposalData } from '@/components/templates';

interface Proposal {
  id: string;
  scopeOfWork: string;
  timeline: string;
  paymentTerms: string;
  status: string;
  shareToken: string | null;
  estimate: {
    id: string;
    name: string;
    overheadRate: number;
    marginRate: number;
    taxRate: number;
    items: {
      id: string;
      description: string;
      quantity: number;
      unit: string;
      materialCostPerUnit: number;
      laborCostPerUnit: number;
      wasteFactor: number;
    }[];
    project: {
      id: string;
      name: string;
      clientName: string;
      clientEmail: string | null;
      address: string | null;
      user: { companyName: string; email: string; phone: string | null };
    };
  };
}

const statusOptions = ['draft', 'sent', 'viewed', 'accepted', 'rejected'];
const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ProposalPage() {
  const params = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState({ scopeOfWork: '', timeline: '', paymentTerms: '' });
  const [preview, setPreview] = useState(false);
  const [template, setTemplate] = useState<'modern' | 'classic'>('modern');

  useEffect(() => {
    apiFetch(`/api/proposals/${params.proposalId}`)
      .then((res) => res.json())
      .then((data) => {
        setProposal(data.proposal);
        setEditing({
          scopeOfWork: data.proposal.scopeOfWork,
          timeline: data.proposal.timeline,
          paymentTerms: data.proposal.paymentTerms,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.proposalId]);

  async function saveProposal() {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/proposals/${params.proposalId}`, {
        method: 'PUT',
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (res.ok) setProposal((p) => (p ? { ...p, ...data.proposal } : p));
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status: string) {
    const res = await apiFetch(`/api/proposals/${params.proposalId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok) setProposal((p) => (p ? { ...p, status: data.proposal.status } : p));
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></main>;
  }

  if (!proposal) {
    return <main className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Proposal not found</p></main>;
  }

  const { estimate } = proposal;
  const { project } = estimate;
  const calc = calcEstimate(estimate.items, {
    overheadRate: estimate.overheadRate,
    marginRate: estimate.marginRate,
    taxRate: estimate.taxRate,
  });

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <Link href={`/projects/${project.id}`} className="text-sm text-primary hover:underline">
          &larr; Back to Project
        </Link>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Proposal: {project.name}</h1>
            <p className="text-muted-foreground">Based on estimate: {estimate.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {proposal.shareToken && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/share/${proposal.shareToken}`;
                  navigator.clipboard.writeText(url);
                  alert('Share link copied to clipboard!');
                }}
                className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
              >
                Copy Share Link
              </button>
            )}
            <select
              value={proposal.status}
              onChange={(e) => updateStatus(e.target.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[proposal.status] || ''}`}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Header info */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border bg-card p-4">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-medium">{project.user.companyName}</p>
            <p className="text-sm text-muted-foreground">{project.user.email}</p>
            {project.user.phone && <p className="text-sm text-muted-foreground">{project.user.phone}</p>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">To</p>
            <p className="font-medium">{project.clientName}</p>
            {project.clientEmail && <p className="text-sm text-muted-foreground">{project.clientEmail}</p>}
            {project.address && <p className="text-sm text-muted-foreground">{project.address}</p>}
          </div>
        </div>

        {/* Editable sections */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold">Scope of Work</label>
            <textarea
              rows={4}
              value={editing.scopeOfWork}
              onChange={(e) => setEditing({ ...editing, scopeOfWork: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Timeline</label>
            <textarea
              rows={2}
              value={editing.timeline}
              onChange={(e) => setEditing({ ...editing, timeline: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Payment Terms</label>
            <textarea
              rows={2}
              value={editing.paymentTerms}
              onChange={(e) => setEditing({ ...editing, paymentTerms: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Line items */}
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="p-2">Item</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2">Unit</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {estimate.items.map((item, idx) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2">{item.unit}</td>
                  <td className="p-2 text-right">${calc.itemResults[idx].subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 ml-auto w-64 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${calc.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Overhead</span><span>${calc.overhead.toFixed(2)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Profit</span><span>${calc.profit.toFixed(2)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>${calc.tax.toFixed(2)}</span></div>
          <hr />
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>${calc.grandTotal.toFixed(2)}</span></div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as 'modern' | 'classic')}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="modern">Modern Template</option>
              <option value="classic">Classic Template</option>
            </select>
            <button
              onClick={() => setPreview(!preview)}
              className={`rounded-md border px-4 py-2 text-sm font-medium ${preview ? 'bg-accent' : 'hover:bg-accent'}`}
            >
              {preview ? 'Edit Mode' : 'Preview'}
            </button>
          </div>
          <button
            onClick={saveProposal}
            disabled={saving}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Proposal'}
          </button>
        </div>

        {/* Template Preview */}
        {preview && (() => {
          const templateData: ProposalData = {
            companyName: project.user.companyName,
            companyEmail: project.user.email,
            companyPhone: project.user.phone,
            clientName: project.clientName,
            clientEmail: project.clientEmail,
            clientAddress: project.address,
            projectName: project.name,
            scopeOfWork: editing.scopeOfWork,
            timeline: editing.timeline,
            paymentTerms: editing.paymentTerms,
            items: estimate.items.map((item, idx) => ({
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              amount: calcLineItem(item).subtotal,
            })),
            calc,
            rates: {
              overheadRate: estimate.overheadRate,
              marginRate: estimate.marginRate,
              taxRate: estimate.taxRate,
            },
          };
          return (
            <div className="mt-6 rounded-lg border bg-gray-100 p-6">
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Preview - {template === 'modern' ? 'Modern' : 'Classic'} Template
              </p>
              {template === 'modern' ? (
                <ModernTemplate data={templateData} />
              ) : (
                <ClassicTemplate data={templateData} />
              )}
            </div>
          );
        })()}
      </div>
    </main>
  );
}
