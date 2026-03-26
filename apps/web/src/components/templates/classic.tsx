import { ProposalData } from './types';

export function ClassicTemplate({ data }: { data: ProposalData }) {
  return (
    <div className="mx-auto max-w-[800px] bg-white p-8 text-gray-900 shadow-lg" id="proposal-content">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4">
        {data.companyLogo ? (
          <img src={data.companyLogo} alt="Logo" className="mx-auto mb-2 h-14" />
        ) : (
          <h1 className="text-3xl font-serif font-bold text-gray-800">{data.companyName}</h1>
        )}
        <p className="text-sm text-gray-500">
          {data.companyEmail}
          {data.companyPhone && ` | ${data.companyPhone}`}
        </p>
      </div>

      <h2 className="mt-6 text-center text-xl font-serif font-semibold text-gray-800">
        PROJECT PROPOSAL
      </h2>
      <p className="text-center text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>

      {/* Client & Project */}
      <div className="mt-6 border border-gray-300 p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-600">Client:</p>
            <p>{data.clientName}</p>
            {data.clientEmail && <p className="text-gray-500">{data.clientEmail}</p>}
            {data.clientAddress && <p className="text-gray-500">{data.clientAddress}</p>}
          </div>
          <div>
            <p className="font-semibold text-gray-600">Project:</p>
            <p>{data.projectName}</p>
          </div>
        </div>
      </div>

      {/* Scope */}
      <div className="mt-6">
        <h3 className="font-serif text-lg font-semibold text-gray-800 border-b border-gray-300 pb-1">
          Scope of Work
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{data.scopeOfWork}</p>
      </div>

      {/* Items */}
      <div className="mt-6">
        <h3 className="font-serif text-lg font-semibold text-gray-800 border-b border-gray-300 pb-1">
          Cost Breakdown
        </h3>
        <table className="mt-3 w-full text-sm border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border-b border-gray-300 px-3 py-2 text-left">Description</th>
              <th className="border-b border-gray-300 px-3 py-2 text-right">Qty</th>
              <th className="border-b border-gray-300 px-3 py-2 text-left">Unit</th>
              <th className="border-b border-gray-300 px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-200">
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
        <div className="w-64 text-sm border border-gray-300">
          <div className="flex justify-between border-b border-gray-200 px-3 py-1.5"><span>Subtotal</span><span>${data.calc.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between border-b border-gray-200 px-3 py-1.5 text-gray-500"><span>Overhead</span><span>${data.calc.overhead.toFixed(2)}</span></div>
          <div className="flex justify-between border-b border-gray-200 px-3 py-1.5 text-gray-500"><span>Profit</span><span>${data.calc.profit.toFixed(2)}</span></div>
          <div className="flex justify-between border-b border-gray-200 px-3 py-1.5 text-gray-500"><span>Tax</span><span>${data.calc.tax.toFixed(2)}</span></div>
          <div className="flex justify-between bg-gray-800 px-3 py-2 font-bold text-white">
            <span>TOTAL</span><span>${data.calc.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Timeline & Terms */}
      <div className="mt-8">
        <h3 className="font-serif text-lg font-semibold text-gray-800 border-b border-gray-300 pb-1">
          Timeline
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{data.timeline}</p>
      </div>

      <div className="mt-6">
        <h3 className="font-serif text-lg font-semibold text-gray-800 border-b border-gray-300 pb-1">
          Terms & Conditions
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{data.paymentTerms}</p>
      </div>

      {/* Signature */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div>
          <p className="mb-8 text-sm font-semibold text-gray-600">Authorized By:</p>
          <div className="border-b border-gray-400"></div>
          <p className="mt-1 text-sm text-gray-500">{data.companyName}</p>
          <p className="text-xs text-gray-400">Date: _______________</p>
        </div>
        <div>
          <p className="mb-8 text-sm font-semibold text-gray-600">Accepted By:</p>
          <div className="border-b border-gray-400"></div>
          <p className="mt-1 text-sm text-gray-500">{data.clientName}</p>
          <p className="text-xs text-gray-400">Date: _______________</p>
        </div>
      </div>
    </div>
  );
}
