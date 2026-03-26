'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Profile {
  companyName: string;
  logo: string | null;
  phone: string | null;
  website: string | null;
  licenseNumber: string | null;
  address: string | null;
  overheadRate: number;
  marginRate: number;
  taxRate: number;
  paymentTerms: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    logo: '',
    phone: '',
    website: '',
    licenseNumber: '',
    address: '',
    overheadRate: 10,
    marginRate: 15,
    taxRate: 8,
    paymentTerms: '',
  });

  useEffect(() => {
    apiFetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        const u = data.user;
        setProfile(u);
        setForm({
          companyName: u.companyName || '',
          logo: u.logo || '',
          phone: u.phone || '',
          website: u.website || '',
          licenseNumber: u.licenseNumber || '',
          address: u.address || '',
          overheadRate: Math.round(u.overheadRate * 100),
          marginRate: Math.round(u.marginRate * 100),
          taxRate: Math.round(u.taxRate * 100),
          paymentTerms: u.paymentTerms || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          overheadRate: form.overheadRate / 100,
          marginRate: form.marginRate / 100,
          taxRate: form.taxRate / 100,
          logo: form.logo || null,
          phone: form.phone || null,
          website: form.website || null,
          licenseNumber: form.licenseNumber || null,
          address: form.address || null,
          paymentTerms: form.paymentTerms || null,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </main>
    );
  }

  const inputClass = 'mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm text-primary hover:underline">&larr; Back to Dashboard</Link>
        <h1 className="mt-4 text-2xl font-bold">Business Profile</h1>
        <p className="text-muted-foreground">Your info appears on proposals sent to clients.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Company info */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Company Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Company Name *</label>
                <input
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Logo URL</label>
                <input
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  className={inputClass}
                  placeholder="https://..."
                />
                {form.logo && (
                  <div className="mt-2">
                    <img src={form.logo} alt="Logo preview" className="h-12 rounded" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Website</label>
                <input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className={inputClass}
                  placeholder="https://acmeroofing.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">License Number</label>
                <input
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  className={inputClass}
                  placeholder="LIC-123456"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputClass}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            </div>
          </div>

          {/* Default rates */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Default Rates</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              These rates are applied to new estimates by default.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium">Overhead %</label>
                <input
                  type="number"
                  step="1"
                  value={form.overheadRate}
                  onChange={(e) => setForm({ ...form, overheadRate: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Margin %</label>
                <input
                  type="number"
                  step="1"
                  value={form.marginRate}
                  onChange={(e) => setForm({ ...form, marginRate: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Tax %</label>
                <input
                  type="number"
                  step="1"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Payment terms */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Payment Terms Template</h2>
            <textarea
              rows={4}
              value={form.paymentTerms}
              onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
              className={inputClass}
              placeholder="50% deposit required before work begins. Remaining 50% due upon completion. Net 30 terms available for established clients."
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            {saved && <span className="text-sm text-green-600">Profile saved!</span>}
          </div>
        </form>
      </div>
    </main>
  );
}
