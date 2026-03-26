export interface User {
  id: string;
  email: string;
  companyName: string;
  phone?: string;
  licenseNumber?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientEmail?: string;
  address?: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Estimate {
  id: string;
  projectId: string;
  name: string;
  items: EstimateItem[];
  overheadRate: number;
  marginRate: number;
  taxRate: number;
  status: EstimateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type EstimateStatus = 'draft' | 'final' | 'approved';

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  materialCostPerUnit: number;
  laborCostPerUnit: number;
  wasteFactor: number;
}

export interface Proposal {
  id: string;
  estimateId: string;
  status: ProposalStatus;
  scopeOfWork: string;
  timeline: string;
  paymentTerms: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
