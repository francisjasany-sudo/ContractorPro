'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface DashboardData {
  stats: {
    activeProjects: number;
    pendingProposals: number;
    totalProposals: number;
    acceptedProposals: number;
    winRate: number;
  };
  recentProjects: {
    id: string;
    name: string;
    clientName: string;
    status: string;
    estimateCount: number;
    updatedAt: string;
  }[];
  pendingProposalsList: {
    id: string;
    status: string;
    projectName: string;
    clientName: string;
    estimateName: string;
    createdAt: string;
    daysPending: number;
  }[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  sent: 'bg-blue-100 text-blue-700',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Failed to load dashboard</p>
      </main>
    );
  }

  const { stats, recentProjects, pendingProposalsList } = data;

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Link
              href="/projects/new"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              + New Project
            </Link>
            <Link
              href="/projects"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              All Projects
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Active Projects</p>
            <p className="mt-1 text-3xl font-bold">{stats.activeProjects}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Pending Proposals</p>
            <p className="mt-1 text-3xl font-bold">{stats.pendingProposals}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Proposals</p>
            <p className="mt-1 text-3xl font-bold">{stats.totalProposals}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="mt-1 text-3xl font-bold">{stats.winRate}%</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent projects */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Recent Projects</h2>
            {recentProjects.length === 0 ? (
              <div className="rounded-lg border bg-card p-6 text-center">
                <p className="text-muted-foreground">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.clientName} &middot; {project.estimateCount} estimate{project.estimateCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[project.status] || 'bg-gray-100'}`}>
                      {project.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pending proposals */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Pending Proposals</h2>
            {pendingProposalsList.length === 0 ? (
              <div className="rounded-lg border bg-card p-6 text-center">
                <p className="text-muted-foreground">No pending proposals</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingProposalsList.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={`/proposals/${proposal.id}`}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{proposal.projectName}</p>
                      <p className="text-sm text-muted-foreground">
                        {proposal.clientName} &middot; {proposal.estimateName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[proposal.status] || 'bg-gray-100'}`}>
                        {proposal.status}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {proposal.daysPending}d ago
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
