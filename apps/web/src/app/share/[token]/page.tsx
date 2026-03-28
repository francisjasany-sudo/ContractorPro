'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { calcEstimate, calcLineItem } from '@contractorpro/shared';
import { ModernTemplate } from '@/components/templates';
import type { ProposalData } from '@/components/templates';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface SharedProposal {
  id: string;
  scopeOfWork: string;
  timeline: string;
  paymentTerms: string;
  status: string;
  estimate: {
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
      name: string;
      clientName: string;
      clientEmail: string | null;
      address: string | null;
      user: { companyName: string; email: string; phone: string | null; logo: string | null };
    };
  };
}

export default function SharedProposalPage() {
  const params = useParams();
  const [proposal, setProposal] = useState<SharedProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/share/${params.token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setProposal(data.proposal))
      .catch(() => setError('Proposal not found or link has expired.'))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading proposal...</p>
      </main>
    );
  }

  if (error || !proposal) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Proposal Not Found</h1>
          <p className="mt-2 text-gray-500">{error}</p>
        </div>
      </main>
    );
  }

  const { estimate } = proposal;
  const { project } = estimate;
  const calc = calcEstimate(estimate.items, {
    overheadRate: estimate.overheadRate,
    marginRate: estimate.marginRate,
    taxRate: estimate.taxRate,
  });

  const templateData: ProposalData = {
    companyName: project.user.companyName,
    companyEmail: project.user.email,
    companyPhone: project.user.phone,
    companyLogo: project.user.logo,
    clientName: project.clientName,
    clientEmail: project.clientEmail,
    clientAddress: project.address,
    projectName: project.name,
    scopeOfWork: proposal.scopeOfWork,
    timeline: proposal.timeline,
    paymentTerms: proposal.paymentTerms,
    items: estimate.items.map((item) => ({
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

  function handlePrint() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Action bar - hidden in print */}
      <div className="print:hidden sticky top-0 z-10 border-b bg-white px-6 py-3 shadow-sm">
        <div className="mx-auto flex max-w-[800px] items-center justify-between">
          <p className="text-sm text-gray-500">
            Proposal from <span className="font-medium text-gray-800">{project.user.companyName}</span>
          </p>
          <button
            onClick={handlePrint}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="py-8 print:py-0">
        <ModernTemplate data={templateData} />
      </div>
    </main>
  );
}
