import { Router, Request, Response } from 'express';
import { prisma } from '@contractorpro/database';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Active projects count
    const activeProjects = await prisma.project.count({
      where: { userId, status: { in: ['active', 'draft'] } },
    });

    // Pending proposals count
    const pendingProposals = await prisma.proposal.count({
      where: {
        estimate: { project: { userId } },
        status: { in: ['sent', 'draft'] },
      },
    });

    // Total proposals for win rate
    const totalProposals = await prisma.proposal.count({
      where: { estimate: { project: { userId } } },
    });
    const acceptedProposals = await prisma.proposal.count({
      where: {
        estimate: { project: { userId } },
        status: 'accepted',
      },
    });
    const winRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;

    // Recent projects (last 5)
    const recentProjects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        estimates: { select: { id: true } },
      },
    });

    // Pending proposals with details
    const pendingProposalsList = await prisma.proposal.findMany({
      where: {
        estimate: { project: { userId } },
        status: { in: ['sent', 'draft'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        estimate: {
          include: {
            project: { select: { name: true, clientName: true } },
          },
        },
      },
    });

    res.json({
      stats: {
        activeProjects,
        pendingProposals,
        totalProposals,
        acceptedProposals,
        winRate,
      },
      recentProjects: recentProjects.map((p) => ({
        id: p.id,
        name: p.name,
        clientName: p.clientName,
        status: p.status,
        estimateCount: p.estimates.length,
        updatedAt: p.updatedAt,
      })),
      pendingProposalsList: pendingProposalsList.map((p) => ({
        id: p.id,
        status: p.status,
        projectName: p.estimate.project.name,
        clientName: p.estimate.project.clientName,
        estimateName: p.estimate.name,
        createdAt: p.createdAt,
        daysPending: Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
