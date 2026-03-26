'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { calcLineItem, calcEstimate } from '@contractorpro/shared';

interface ItemRow {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  materialCostPerUnit: number;
  laborCostPerUnit: number;
  wasteFactor: number;
}

interface Template {
  id: string;
  trade: string;
  name: string;
  unit: string;
  materialCost: number;
  laborRate: number;
  defaultWaste: number;
}

interface Estimate {
  id: string;
  name: string;
  status: string;
  overheadRate: number;
  marginRate: number;
  taxRate: number;
  items: ItemRow[];
}

let nextTempId = 0;
function tempId() {
  return `temp-${++nextTempId}`;
}

export default function EstimatorPage() {
  const params = useParams();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [rates, setRates] = useState({ overheadRate: 0.10, marginRate: 0.15, taxRate: 0.08 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Record<string, Template[]>>({});
  const [selectedTrade, setSelectedTrade] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();

  // Load estimate
  useEffect(() => {
    apiFetch(`/api/projects/${params.id}/estimates/${params.estimateId}`)
      .then((res) => res.json())
      .then((data) => {
        setEstimate(data.estimate);
        setItems(data.estimate.items.map((i: ItemRow) => ({ ...i, category: i.category || '' })));
        setRates({
          overheadRate: data.estimate.overheadRate,
          marginRate: data.estimate.marginRate,
          taxRate: data.estimate.taxRate,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id, params.estimateId]);

  // Load templates
  useEffect(() => {
    apiFetch('/api/templates/by-trade')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.grouped);
        const trades = Object.keys(data.grouped);
        if (trades.length > 0) setSelectedTrade(trades[0]);
      })
      .catch(() => {});
  }, []);

  // Save function
  const save = useCallback(async () => {
    if (!estimate) return;
    setSaving(true);
    try {
      await apiFetch(`/api/projects/${params.id}/estimates/${params.estimateId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...rates,
          items: items.map((item, i) => ({
            description: item.description,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            materialCostPerUnit: item.materialCostPerUnit,
            laborCostPerUnit: item.laborCostPerUnit,
            wasteFactor: item.wasteFactor,
            sortOrder: i,
          })),
        }),
      });
      setLastSaved(new Date());
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }, [estimate, items, rates, params.id, params.estimateId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!estimate) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(save, 30000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [items, rates, estimate, save]);

  function updateItem(index: number, field: keyof ItemRow, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addRow() {
    setItems((prev) => [
      ...prev,
      {
        id: tempId(),
        description: '',
        category: '',
        quantity: 1,
        unit: 'ea',
        materialCostPerUnit: 0,
        laborCostPerUnit: 0,
        wasteFactor: 0.05,
      },
    ]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addFromTemplate(template: Template) {
    setItems((prev) => [
      ...prev,
      {
        id: tempId(),
        description: template.name,
        category: template.trade,
        quantity: 1,
        unit: template.unit,
        materialCostPerUnit: template.materialCost,
        laborCostPerUnit: template.laborRate,
        wasteFactor: template.defaultWaste,
      },
    ]);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading estimator...</p>
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

  const calcResult = calcEstimate(items, rates);

  return (
    <main className="min-h-screen bg-background">
      <div className="flex">
        {/* Main content */}
        <div className={`flex-1 p-6 ${showTemplates ? 'pr-0' : ''}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Link href={`/projects/${params.id}`} className="text-sm text-primary hover:underline">
                &larr; Back to Project
              </Link>
              <h1 className="mt-1 text-xl font-bold">{estimate.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                title="Settings"
              >
                Settings
              </button>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`rounded-md border px-3 py-1.5 text-sm hover:bg-accent ${showTemplates ? 'bg-accent' : ''}`}
              >
                Templates
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="mb-4 rounded-lg border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">Rate Settings</h3>
              <div className="flex gap-4">
                {[
                  { label: 'Overhead %', key: 'overheadRate' as const },
                  { label: 'Margin %', key: 'marginRate' as const },
                  { label: 'Tax %', key: 'taxRate' as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs text-muted-foreground">{label}</label>
                    <input
                      type="number"
                      step="1"
                      value={Math.round(rates[key] * 100)}
                      onChange={(e) =>
                        setRates((r) => ({ ...r, [key]: parseFloat(e.target.value) / 100 || 0 }))
                      }
                      className="mt-1 w-20 rounded border border-input bg-background px-2 py-1 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line items table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                  <th className="w-8 p-2">#</th>
                  <th className="p-2">Description</th>
                  <th className="w-20 p-2 text-right">Qty</th>
                  <th className="w-16 p-2">Unit</th>
                  <th className="w-24 p-2 text-right">Mat $/unit</th>
                  <th className="w-24 p-2 text-right">Lab $/unit</th>
                  <th className="w-16 p-2 text-right">Waste%</th>
                  <th className="w-24 p-2 text-right">Material</th>
                  <th className="w-24 p-2 text-right">Labor</th>
                  <th className="w-24 p-2 text-right">Total</th>
                  <th className="w-8 p-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const calc = calcLineItem(item);
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 text-xs text-muted-foreground">{idx + 1}</td>
                      <td className="p-1">
                        <input
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="w-full rounded border-transparent bg-transparent px-1 py-1 text-sm hover:border-input focus:border-input focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Item description"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border-transparent bg-transparent px-1 py-1 text-right text-sm hover:border-input focus:border-input focus:outline-none focus:ring-1 focus:ring-primary"
                          onKeyDown={(e) => e.key === 'Enter' && addRow()}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          value={item.unit}
                          onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                          className="w-full rounded border-transparent bg-transparent px-1 py-1 text-sm hover:border-input focus:border-input focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          step="0.01"
                          value={item.materialCostPerUnit}
                          onChange={(e) => updateItem(idx, 'materialCostPerUnit', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border-transparent bg-transparent px-1 py-1 text-right text-sm hover:border-input focus:border-input focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          step="0.01"
                          value={item.laborCostPerUnit}
                          onChange={(e) => updateItem(idx, 'laborCostPerUnit', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border-transparent bg-transparent px-1 py-1 text-right text-sm hover:border-input focus:border-input focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          step="1"
                          value={Math.round(item.wasteFactor * 100)}
                          onChange={(e) => updateItem(idx, 'wasteFactor', (parseFloat(e.target.value) || 0) / 100)}
                          className="w-full rounded border-transparent bg-transparent px-1 py-1 text-right text-sm hover:border-input focus:border-input focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="p-2 text-right text-muted-foreground">${calc.materialCost.toFixed(2)}</td>
                      <td className="p-2 text-right text-muted-foreground">${calc.laborCost.toFixed(2)}</td>
                      <td className="p-2 text-right font-medium">${calc.subtotal.toFixed(2)}</td>
                      <td className="p-1">
                        <button
                          onClick={() => removeRow(idx)}
                          className="rounded p-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Remove"
                        >
                          x
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="border-t p-2">
              <button
                onClick={addRow}
                className="text-sm text-primary hover:underline"
              >
                + Add Row
              </button>
              <span className="ml-2 text-xs text-muted-foreground">(Enter in any field to add row)</span>
            </div>
          </div>

          {/* Summary panel */}
          <div className="mt-6 ml-auto w-72 rounded-lg border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Estimate Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Materials</span>
                <span>${calcResult.materialsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labor</span>
                <span>${calcResult.laborTotal.toFixed(2)}</span>
              </div>
              <hr className="my-1" />
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${calcResult.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Overhead ({Math.round(rates.overheadRate * 100)}%)</span>
                <span>${calcResult.overhead.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Profit ({Math.round(rates.marginRate * 100)}%)</span>
                <span>${calcResult.profit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax ({Math.round(rates.taxRate * 100)}%)</span>
                <span>${calcResult.tax.toFixed(2)}</span>
              </div>
              <hr className="my-1" />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Total</span>
                <span>${calcResult.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Template sidebar */}
        {showTemplates && (
          <div className="w-72 shrink-0 border-l bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Quick Add from Templates</h3>
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="mb-3 w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
            >
              {Object.keys(templates).map((trade) => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
            <div className="space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {(templates[selectedTrade] || []).map((t) => (
                <button
                  key={t.id}
                  onClick={() => addFromTemplate(t)}
                  className="w-full rounded border px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Mat: ${t.materialCost}/{t.unit} | Lab: ${t.laborRate}/{t.unit}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
