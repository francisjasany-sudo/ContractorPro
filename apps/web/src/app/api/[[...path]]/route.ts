/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const db = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'contractor-pro-secret-key-change-in-production';

function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch { return null; }
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  
  if (pathname === '/api/health') {
    return json({ status: 'ok', app: 'ContractorPro' });
  }

  const userId = getUserId(req);
  if (!userId && pathname !== '/api/health') {
    return json({ error: 'Unauthorized' }, 401);
  }

  // GET /api/projects
  if (pathname === '/api/projects') {
    const projects = await db.project.findMany({
      where: { userId: userId! },
      include: { estimates: { select: { id: true, name: true, status: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return json(projects);
  }

  // GET /api/projects/:id
  const projectMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projectMatch) {
    const project = await db.project.findFirst({
      where: { id: projectMatch[1], userId: userId! },
      include: { estimates: { include: { items: { orderBy: { sortOrder: 'asc' } }, proposal: true } } },
    });
    if (!project) return json({ error: 'Not found' }, 404);
    return json(project);
  }

  // GET /api/projects/:id/estimates/:eid
  const estMatch = pathname.match(/^\/api\/projects\/([^/]+)\/estimates\/([^/]+)$/);
  if (estMatch) {
    const estimate = await db.estimate.findFirst({
      where: { id: estMatch[2], project: { id: estMatch[1], userId: userId! } },
      include: { items: { orderBy: { sortOrder: 'asc' } }, proposal: true, project: true },
    });
    if (!estimate) return json({ error: 'Not found' }, 404);
    return json(estimate);
  }

  // GET /api/templates
  if (pathname === '/api/templates') {
    const templates = await db.costTemplate.findMany({ orderBy: { trade: 'asc' } });
    const trades = [...new Set(templates.map((t: any) => t.trade))];
    return json({ templates, trades });
  }

  // GET /api/dashboard
  if (pathname === '/api/dashboard') {
    const [activeProjects, totalEstimates, recentProjects, proposals] = await Promise.all([
      db.project.count({ where: { userId: userId! } }),
      db.estimate.count({ where: { project: { userId: userId! } } }),
      db.project.findMany({ where: { userId: userId! }, include: { estimates: { include: { proposal: true } } }, orderBy: { updatedAt: 'desc' }, take: 5 }),
      db.proposal.findMany({ where: { estimate: { project: { userId: userId! } } } }),
    ]);
    const totalProposals = proposals.length;
    const acceptedProposals = proposals.filter((p: any) => p.status === 'accepted').length;
    const pendingProposals = proposals.filter((p: any) => p.status === 'draft' || p.status === 'sent').length;
    return json({
      stats: {
        activeProjects,
        pendingProposals,
        totalProposals,
        acceptedProposals,
        winRate: totalProposals > 0 ? acceptedProposals / totalProposals : 0,
      },
      recentProjects: recentProjects.map((p: any) => ({
        id: p.id, name: p.name, clientName: p.clientName, status: p.status, estimateCount: p.estimates.length, updatedAt: p.updatedAt,
      })),
      pendingProposalsList: [],
    });
  }

  // GET /api/profile
  if (pathname === '/api/profile') {
    const user = await db.user.findUnique({ where: { id: userId! } });
    if (!user) return json({ error: 'Not found' }, 404);
    const { passwordHash: _, ...safe } = user;
    return json(safe);
  }

  // GET /api/proposals/:id (public)
  const proposalMatch = pathname.match(/^\/api\/proposals\/([^/]+)$/);
  if (proposalMatch) {
    const proposal = await db.proposal.findFirst({
      where: { OR: [{ id: proposalMatch[1] }, { shareToken: proposalMatch[1] }] },
      include: { estimate: { include: { items: { orderBy: { sortOrder: 'asc' } }, project: { include: { user: { select: { companyName: true, email: true, phone: true, logo: true, address: true } } } } } } },
    });
    if (!proposal) return json({ error: 'Not found' }, 404);
    return json(proposal);
  }

  return json({ error: 'Not found' }, 404);
}

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const body = await req.json().catch(() => ({}));

  // POST /api/auth/register
  if (pathname === '/api/auth/register') {
    const { email, password, companyName } = body;
    if (!email || !password || !companyName) return json({ error: 'Missing fields' }, 400);
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) return json({ error: 'Email already registered' }, 400);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({ data: { email, passwordHash, companyName } });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return json({ token, user: { id: user.id, email: user.email, companyName: user.companyName } });
  }

  // POST /api/auth/login
  if (pathname === '/api/auth/login') {
    const { email, password } = body;
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return json({ error: 'Invalid credentials' }, 401);
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash: _, ...safe } = user;
    return json({ token, user: safe });
  }

  const userId = getUserId(req);
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  // POST /api/projects
  if (pathname === '/api/projects') {
    const project = await db.project.create({
      data: { ...body, userId },
    });
    return json(project, 201);
  }

  // POST /api/projects/:id/estimates
  const estCreate = pathname.match(/^\/api\/projects\/([^/]+)\/estimates$/);
  if (estCreate) {
    const estimate = await db.estimate.create({
      data: { name: body.name || 'New Estimate', projectId: estCreate[1] },
      include: { items: true },
    });
    return json(estimate, 201);
  }

  // POST /api/projects/:id/estimates/:eid/items
  const itemCreate = pathname.match(/^\/api\/projects\/([^/]+)\/estimates\/([^/]+)\/items$/);
  if (itemCreate) {
    const item = await db.estimateItem.create({
      data: { ...body, estimateId: itemCreate[2] },
    });
    return json(item, 201);
  }

  // POST /api/proposals (create from estimate)
  if (pathname === '/api/proposals') {
    const { estimateId, scopeOfWork, timeline, paymentTerms } = body;
    const shareToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const proposal = await db.proposal.create({
      data: { estimateId, scopeOfWork: scopeOfWork || '', timeline: timeline || '', paymentTerms: paymentTerms || '', shareToken },
    });
    return json(proposal, 201);
  }

  return json({ error: 'Not found' }, 404);
}

export async function PUT(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const userId = getUserId(req);
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  // PUT /api/projects/:id
  const projUpdate = pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projUpdate) {
    const project = await db.project.update({
      where: { id: projUpdate[1] },
      data: body,
    });
    return json(project);
  }

  // PUT /api/projects/:id/estimates/:eid
  const estUpdate = pathname.match(/^\/api\/projects\/([^/]+)\/estimates\/([^/]+)$/);
  if (estUpdate) {
    const estimate = await db.estimate.update({
      where: { id: estUpdate[2] },
      data: body,
    });
    return json(estimate);
  }

  // PUT /api/projects/:id/estimates/:eid/items/:iid
  const itemUpdate = pathname.match(/^\/api\/projects\/([^/]+)\/estimates\/([^/]+)\/items\/([^/]+)$/);
  if (itemUpdate) {
    const item = await db.estimateItem.update({
      where: { id: itemUpdate[3] },
      data: body,
    });
    return json(item);
  }

  // PUT /api/profile
  if (pathname === '/api/profile') {
    const { passwordHash: _, ...data } = body;
    const user = await db.user.update({ where: { id: userId }, data });
    const { passwordHash: __, ...safe } = user;
    return json(safe);
  }

  // PUT /api/proposals/:id
  const propUpdate = pathname.match(/^\/api\/proposals\/([^/]+)$/);
  if (propUpdate) {
    const proposal = await db.proposal.update({
      where: { id: propUpdate[1] },
      data: body,
    });
    return json(proposal);
  }

  return json({ error: 'Not found' }, 404);
}

export async function DELETE(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const userId = getUserId(req);
  if (!userId) return json({ error: 'Unauthorized' }, 401);

  // DELETE /api/projects/:id
  const projDel = pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projDel) {
    await db.project.delete({ where: { id: projDel[1] } });
    return json({ ok: true });
  }

  // DELETE /api/projects/:id/estimates/:eid/items/:iid
  const itemDel = pathname.match(/^\/api\/projects\/([^/]+)\/estimates\/([^/]+)\/items\/([^/]+)$/);
  if (itemDel) {
    await db.estimateItem.delete({ where: { id: itemDel[3] } });
    return json({ ok: true });
  }

  return json({ error: 'Not found' }, 404);
}
