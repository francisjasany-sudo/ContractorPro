import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '@contractorpro/database';
import { authMiddleware } from '../middleware/auth.js';

type EstimateParams = { estimateId: string };
type ProposalParams = { proposalId: string };

const router = Router();

// Generate proposal from estimate
router.post(
  '/estimates/:estimateId/proposal',
  authMiddleware,
  async (req: Request<EstimateParams>, res: Response) => {
    try {
      const estimate = await prisma.estimate.findFirst({
        where: { id: req.params.estimateId },
        include: { project: true, items: true, proposal: true },
      });

      if (!estimate) {
        res.status(404).json({ error: 'Estimate not found' });
        return;
      }

      if (estimate.project.userId !== req.user!.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      if (estimate.proposal) {
        res.json({ proposal: estimate.proposal });
        return;
      }

      const proposal = await prisma.proposal.create({
        data: {
          estimateId: estimate.id,
          scopeOfWork: `Proposal for ${estimate.project.name}`,
          timeline: 'To be determined',
          paymentTerms: '50% deposit, 50% on completion',
          shareToken: crypto.randomBytes(24).toString('hex'),
        },
      });

      res.status(201).json({ proposal });
    } catch (error) {
      console.error('Create proposal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Get proposal
router.get(
  '/proposals/:proposalId',
  authMiddleware,
  async (req: Request<ProposalParams>, res: Response) => {
    try {
      const proposal = await prisma.proposal.findUnique({
        where: { id: req.params.proposalId },
        include: {
          estimate: {
            include: {
              items: { orderBy: { sortOrder: 'asc' } },
              project: { include: { user: { select: { companyName: true, email: true, phone: true } } } },
            },
          },
        },
      });

      if (!proposal) {
        res.status(404).json({ error: 'Proposal not found' });
        return;
      }

      if (proposal.estimate.project.userId !== req.user!.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      res.json({ proposal });
    } catch (error) {
      console.error('Get proposal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Update proposal (scope, timeline, terms, status)
router.put(
  '/proposals/:proposalId',
  authMiddleware,
  async (req: Request<ProposalParams>, res: Response) => {
    try {
      const existing = await prisma.proposal.findUnique({
        where: { id: req.params.proposalId },
        include: { estimate: { include: { project: true } } },
      });

      if (!existing) {
        res.status(404).json({ error: 'Proposal not found' });
        return;
      }

      if (existing.estimate.project.userId !== req.user!.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const { scopeOfWork, timeline, paymentTerms, status } = req.body;

      const proposal = await prisma.proposal.update({
        where: { id: req.params.proposalId },
        data: {
          ...(scopeOfWork !== undefined && { scopeOfWork }),
          ...(timeline !== undefined && { timeline }),
          ...(paymentTerms !== undefined && { paymentTerms }),
          ...(status && { status }),
        },
      });

      res.json({ proposal });
    } catch (error) {
      console.error('Update proposal error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Update proposal status
router.put(
  '/proposals/:proposalId/status',
  authMiddleware,
  async (req: Request<ProposalParams>, res: Response) => {
    try {
      const { status } = req.body;
      const validStatuses = ['draft', 'sent', 'viewed', 'accepted', 'rejected'];

      if (!status || !validStatuses.includes(status)) {
        res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
        return;
      }

      const existing = await prisma.proposal.findUnique({
        where: { id: req.params.proposalId },
        include: { estimate: { include: { project: true } } },
      });

      if (!existing) {
        res.status(404).json({ error: 'Proposal not found' });
        return;
      }

      if (existing.estimate.project.userId !== req.user!.userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const proposal = await prisma.proposal.update({
        where: { id: req.params.proposalId },
        data: { status },
      });

      res.json({ proposal });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;
