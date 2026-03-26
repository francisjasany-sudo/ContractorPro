'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Project {
  id: string;
  name: string;
  clientName: string;
  status: string;
  updatedAt: string;
  estimates: { id: string; name: string; status: string }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()),
  );

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    archived: 'bg-yellow-100 text-yellow-700',
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading projects...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Link
            href="/projects/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + New Project
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              {projects.length === 0 ? 'No projects yet. Create your first project!' : 'No matching projects found.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold">{project.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[project.status] || ''}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{project.clientName}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {project.estimates.length} estimate{project.estimates.length !== 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
