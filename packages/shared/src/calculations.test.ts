import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calcLineItem, calcEstimate } from './calculations.js';

describe('calcLineItem', () => {
  it('calculates material cost with waste factor', () => {
    const result = calcLineItem({
      quantity: 100,
      materialCostPerUnit: 6.50,
      laborCostPerUnit: 4.00,
      wasteFactor: 0.10,
    });
    // 100 * 6.50 * 1.10 = 715
    assert.equal(result.materialCost, 715);
    // 100 * 4.00 = 400
    assert.equal(result.laborCost, 400);
    assert.equal(result.subtotal, 1115);
  });

  it('handles zero waste factor', () => {
    const result = calcLineItem({
      quantity: 5,
      materialCostPerUnit: 35,
      laborCostPerUnit: 45,
      wasteFactor: 0,
    });
    assert.equal(result.materialCost, 175);
    assert.equal(result.laborCost, 225);
    assert.equal(result.subtotal, 400);
  });

  it('handles labor-only items (no material)', () => {
    const result = calcLineItem({
      quantity: 10,
      materialCostPerUnit: 0,
      laborCostPerUnit: 65,
      wasteFactor: 0,
    });
    assert.equal(result.materialCost, 0);
    assert.equal(result.laborCost, 650);
    assert.equal(result.subtotal, 650);
  });

  it('rounds to 2 decimal places', () => {
    const result = calcLineItem({
      quantity: 3,
      materialCostPerUnit: 1.33,
      laborCostPerUnit: 2.67,
      wasteFactor: 0.07,
    });
    // 3 * 1.33 * 1.07 = 4.2693 -> 4.27
    assert.equal(result.materialCost, 4.27);
    // 3 * 2.67 = 8.01
    assert.equal(result.laborCost, 8.01);
    assert.equal(result.subtotal, 12.28);
  });
});

describe('calcEstimate', () => {
  const sampleItems = [
    { quantity: 500, materialCostPerUnit: 6.50, laborCostPerUnit: 4.00, wasteFactor: 0.10 },
    { quantity: 200, materialCostPerUnit: 1.75, laborCostPerUnit: 2.00, wasteFactor: 0.05 },
  ];
  const rates = { overheadRate: 0.10, marginRate: 0.15, taxRate: 0.08 };

  it('calculates full estimate breakdown', () => {
    const result = calcEstimate(sampleItems, rates);

    // Item 1: mat=500*6.50*1.10=3575, lab=500*4=2000
    // Item 2: mat=200*1.75*1.05=367.50, lab=200*2=400
    assert.equal(result.itemResults.length, 2);
    assert.equal(result.materialsTotal, 3942.50);
    assert.equal(result.laborTotal, 2400);
    assert.equal(result.subtotal, 6342.50);

    // overhead = 6342.50 * 0.10 = 634.25
    assert.equal(result.overhead, 634.25);

    // profit = (6342.50 + 634.25) * 0.15 = 1046.51 (rounded)
    assert.equal(result.profit, 1046.51);

    // tax = (6342.50 + 634.25 + 1046.51) * 0.08 = 641.86 (rounded)
    assert.equal(result.tax, 641.86);

    // grand total
    assert.equal(result.grandTotal, 8665.12);
  });

  it('handles empty items array', () => {
    const result = calcEstimate([], rates);
    assert.equal(result.subtotal, 0);
    assert.equal(result.overhead, 0);
    assert.equal(result.profit, 0);
    assert.equal(result.tax, 0);
    assert.equal(result.grandTotal, 0);
  });

  it('handles zero rates', () => {
    const result = calcEstimate(sampleItems, { overheadRate: 0, marginRate: 0, taxRate: 0 });
    assert.equal(result.subtotal, 6342.50);
    assert.equal(result.overhead, 0);
    assert.equal(result.profit, 0);
    assert.equal(result.tax, 0);
    assert.equal(result.grandTotal, 6342.50);
  });
});
