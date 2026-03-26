import { EstimateResult } from '@contractorpro/shared';

export interface ProposalData {
  companyName: string;
  companyEmail: string;
  companyPhone: string | null;
  companyLogo?: string | null;
  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;
  projectName: string;
  scopeOfWork: string;
  timeline: string;
  paymentTerms: string;
  items: {
    description: string;
    quantity: number;
    unit: string;
    amount: number;
  }[];
  calc: EstimateResult;
  rates: { overheadRate: number; marginRate: number; taxRate: number };
  primaryColor?: string;
  accentColor?: string;
}
