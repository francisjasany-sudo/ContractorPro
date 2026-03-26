import { ProposalData } from './types';

export function ModernTemplate({ data }: { data: ProposalData }) {
  const primary = data.primaryColor || '#2563eb';
  const accent = data.accentColor || '#f0f9ff';

  return (
    <div className="mx-auto max-w-[800px] bg-white p-8 text-gray-900 shadow-lg" id="proposal-content">
      {/* Header */}
      <div className="flex items-start justify-between border-b-4 pb-6" style={{ borderColor: primary }}>
        <div>
          {data.companyLogo ? (
            <img src={data.companyLogo} alt="Logo" className="mb-2 h-12" />
          ) : (
            <h1 className="text-2xl font-bold" style={{ color: primary }}>{data.companyName}</h1>
          )}
          <p className="text-sm text-gray-500">{data.companyEmail}</p>
          {data.companyPhone && <p className="text-sm text-gray-500">{data.companyPhone}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-light tracking-wide" style={{ color: primary }}>PROPOSAL</h2>
          <p className="mt-1 text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Client info */}
      <div className="mt-6 rounded-lg p-4" style={{ backgroundColor: accent }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prepared For</p>
        <p className="mt-1 text-lg font-semibold">{data.clientName}</p>
        {data.clientEmail && <p className="text-sm text-gray-600">{data.clientEmail}</p>}
        {data.clientAddress && <p className="text-sm text-gray-600">{data.clientAddress}</p>}
      </div>

      {/* Project */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold" style={{ color: primary }}>{data.projectName}</h3>
      </div>

      {/* Scope */}
      <div className="mt-6">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: primary }}>
          Scope of Work
        </h4>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{data.scopeOfWork}</p>
      </div>

      {/* Items table */}
      <div className="mt-6">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: primary }}>
          Cost Breakdown
        </h4>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: primary, color: 'white' }}>
              <th className="rounded-tl-md px-3 py-2 text-left">Item</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-left">Unit</th>
              <th className="rounded-tr-md px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-3 py-2">{item.description}</td>
                <td className="px-3 py-2 text-right">{item.quantity}</td>
                <td className="px-3 py-2">{item.unit}</td>
                <td className="px-3 py-2 text-right">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-64 text-sm">
          <div className="flex justify-between py-1"><span>Subtotal</span><span>${data.calc.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between py-1 text-gray-500"><span>Overhead</span><span>${data.calc.overhead.toFixed(2)}</span></div>
          <div className="flex justify-between py-1 text-gray-500"><span>Profit</span><span>${data.calc.profit.toFixed(2)}</span></div>
          <div className="flex justify-between py-1 text-gray-500"><span>Tax</span><span>${data.calc.tax.toFixed(2)}</span></div>
          <div className="mt-1 flex justify-between border-t-2 pt-2 text-lg font-bold" style={{ borderColor: primary }}>
            <span>Total</span><span style={{ color: primary }}>${data.calc.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Timeline & Terms */}
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: primary }}>Timeline</h4>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{data.timeline}</p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide" style={{ color: primary }}>Payment Terms</h4>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{data.paymentTerms}</p>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div>
          <div className="border-b border-gray-300 pb-8"></div>
          <p className="mt-2 text-sm text-gray-500">{data.companyName} - Authorized Signature</p>
        </div>
        <div>
          <div className="border-b border-gray-300 pb-8"></div>
          <p className="mt-2 text-sm text-gray-500">{data.clientName} - Client Signature</p>
        </div>
      </div>
    </div>
  );
}
