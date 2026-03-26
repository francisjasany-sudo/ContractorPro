'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', clientName: '', clientEmail: '', clientPhone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create project');
        return;
      }

      router.push(`/projects/${data.project.id}`);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg">
        <Link href="/projects" className="text-sm text-primary hover:underline">&larr; Back to Projects</Link>
        <h1 className="mt-4 text-2xl font-bold">New Project</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium">Project Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Kitchen Remodel - Smith Residence"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Client Name *</label>
            <input
              required
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Client Email</label>
            <input
              type="email"
              value={form.clientEmail}
              onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Client Phone</label>
            <input
              value={form.clientPhone}
              onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="123 Main St, Anytown, USA"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </main>
  );
}
