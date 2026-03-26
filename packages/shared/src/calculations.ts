export interface CalcLineItem {
  quantity: number;
  materialCostPerUnit: number;
  laborCostPerUnit: number;
  wasteFactor: number;
}

export interface CalcRates {
  overheadRate: number;
  marginRate: number;
  taxRate: number;
}

export interface LineItemResult {
  materialCost: number;
  laborCost: number;
  subtotal: number;
}

export interface EstimateResult {
  itemResults: LineItemResult[];
  materialsTotal: number;
  laborTotal: number;
  subtotal: number;
  overhead: number;
  profit: number;
  tax: number;
  grandTotal: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcLineItem(item: CalcLineItem): LineItemResult {
  const materialCost = round2(item.quantity * item.materialCostPerUnit * (1 + item.wasteFactor));
  const laborCost = round2(item.quantity * item.laborCostPerUnit);
  const subtotal = round2(materialCost + laborCost);
  return { materialCost, laborCost, subtotal };
}

export function calcEstimate(items: CalcLineItem[], rates: CalcRates): EstimateResult {
  const itemResults = items.map(calcLineItem);

  const materialsTotal = round2(itemResults.reduce((sum, r) => sum + r.materialCost, 0));
  const laborTotal = round2(itemResults.reduce((sum, r) => sum + r.laborCost, 0));
  const subtotal = round2(materialsTotal + laborTotal);
  const overhead = round2(subtotal * rates.overheadRate);
  const profit = round2((subtotal + overhead) * rates.marginRate);
  const tax = round2((subtotal + overhead + profit) * rates.taxRate);
  const grandTotal = round2(subtotal + overhead + profit + tax);

  return {
    itemResults,
    materialsTotal,
    laborTotal,
    subtotal,
    overhead,
    profit,
    tax,
    grandTotal,
  };
}
