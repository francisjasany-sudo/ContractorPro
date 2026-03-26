'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface EstimateItem {
  id: string;
  description: string;
  category: string | null;
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
}

function calcItem(item: EstimateItem) {
  const material = item.quantity * item.materialCostPerUnit * (1 + item.wasteFactor);
  const labor = item.quantity * item.laborCostPerUnit;
  return { material, labor, total: material + labor };
}

export default function EstimateDetailPage() {
  const params = useParams();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/projects/${params.id}/estimates/${params.estimateId}`)
      .then((res) => res.json())
      .then((data) => setEstimate(data.estimate))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id, params.estimateId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!estimate) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Estimate not found</p>
      </main>
    );
  }

  const subtotal = estimate.items.reduce((sum, item) => sum + calcItem(item).total, 0);
  const overhead = subtotal * estimate.overheadRate;
  const profit = (subtotal + overhead) * estimate.marginRate;
  const tax = (subtotal + overhead + profit) * estimate.taxRate;
  const grandTotal = subtotal + overhead + profit + tax;

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <Link href={`/projects/${params.id}`} className="text-sm text-primary hover:underline">
          &larr; Back to Project
        </Link>

        <h1 className="mt-4 text-2xl font-bold">{estimate.name}</h1>
        <p className="text-sm text-muted-foreground">Status: {estimate.status}</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 pr-4 text-right">Qty</th>
                <th className="pb-2 pr-4">Unit</th>
                <th className="pb-2 pr-4 text-right">Material</th>
                <th className="pb-2 pr-4 text-right">Labor</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {estimate.items.map((item) => {
                const calc = calcItem(item);
                return (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 pr-4">{item.description}</td>
                    <td className="py-2 pr-4 text-right">{item.quantity}</td>
                    <td className="py-2 pr-4">{item.unit}</td>
                    <td className="py-2 pr-4 text-right">${calc.material.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-right">${calc.labor.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">${calc.total.toFixed(2)}</td>
                  </tr>
                );
              })}
              {estimate.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No line items yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 ml-auto w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Overhead ({(estimate.overheadRate * 100).toFixed(0)}%)</span>
            <span>${overhead.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Profit ({(estimate.marginRate * 100).toFixed(0)}%)</span>
            <span>${profit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax ({(estimate.taxRate * 100).toFixed(0)}%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
