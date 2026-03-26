'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { calcEstimate } from '@contractorpro/shared';

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  materialCostPerUnit: number;
  laborCostPerUnit: number;
  wasteFactor: number;
}

interface Estimate {
  id: string;
  name: string;
  status: string;
  overheadRate: number;
  marginRate: number;
  taxRate: number;
  items: EstimateItem[];
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  address: string | null;
  status: string;
  estimates: Estimate[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [newEstimateName, setNewEstimateName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiFetch(`/api/projects/${params.id}`)
      .then((res) => res.json())
      .then((data) => setProject(data.project))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  async function createEstimate(e: React.FormEvent) {
    e.preventDefault();
    if (!newEstimateName.trim()) return;
    setCreating(true);

    try {
      const res = await apiFetch(`/api/projects/${params.id}/estimates`, {
        method: 'POST',
        body: JSON.stringify({ name: newEstimateName }),
      });
      const data = await res.json();
      if (res.ok) {
        setProject((p) =>
          p ? { ...p, estimates: [data.estimate, ...p.estimates] } : p,
        );
        setNewEstimateName('');
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  async function deleteProject() {
    if (!confirm('Delete this project and all its estimates?')) return;
    await apiFetch(`/api/projects/${params.id}`, { method: 'DELETE' });
    router.push('/projects');
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </main>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    archived: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/projects" className="text-sm text-primary hover:underline">&larr; Back to Projects</Link>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.clientName}</p>
            {project.address && <p className="text-sm text-muted-foreground">{project.address}</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[project.status] || ''}`}>
              {project.status}
            </span>
            <button
              onClick={deleteProject}
              className="rounded-md border border-destructive px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
            >
              Delete
            </button>
          </div>
        </div>

        {(project.clientEmail || project.clientPhone) && (
          <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            {project.clientEmail && <span>{project.clientEmail}</span>}
            {project.clientPhone && <span>{project.clientPhone}</span>}
          </div>
        )}

        <hr className="my-6" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Estimates</h2>
        </div>

        <form onSubmit={createEstimate} className="mb-6 flex gap-2">
          <input
            value={newEstimateName}
            onChange={(e) => setNewEstimateName(e.target.value)}
            placeholder="New estimate name..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {creating ? 'Creating...' : '+ Add Estimate'}
          </button>
        </form>

        {project.estimates.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">No estimates yet. Create one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.estimates.map((estimate) => {
              const calc = calcEstimate(estimate.items, {
                overheadRate: estimate.overheadRate,
                marginRate: estimate.marginRate,
                taxRate: estimate.taxRate,
              });
              return (
                <div key={estimate.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Link href={`/projects/${project.id}/estimates/${estimate.id}`} className="flex-1 hover:underline">
                      <h3 className="font-medium">{estimate.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {estimate.items.length} item{estimate.items.length !== 1 ? 's' : ''} &middot; ${calc.grandTotal.toFixed(2)}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[estimate.status] || ''}`}>
                        {estimate.status}
                      </span>
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          const res = await apiFetch(`/api/estimates/${estimate.id}/proposal`, { method: 'POST' });
                          const data = await res.json();
                          if (data.proposal) router.push(`/proposals/${data.proposal.id}`);
                        }}
                        className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
                      >
                        Proposal
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
