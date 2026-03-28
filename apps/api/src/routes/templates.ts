import { Router, Request, Response } from 'express';
import { prisma } from '@contractorpro/database';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// List all templates, optionally filtered by trade
router.get('/', async (req: Request, res: Response) => {
  try {
    const { trade } = req.query;
    const templates = await prisma.costTemplate.findMany({
      where: trade ? { trade: trade as string } : undefined,
      orderBy: [{ trade: 'asc' }, { name: 'asc' }],
    });

    // Also return list of distinct trades
    const trades = [...new Set(templates.map((t: any) => t.trade))];

    res.json({ templates, trades });
  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get templates grouped by trade
router.get('/by-trade', async (req: Request, res: Response) => {
  try {
    const templates = await prisma.costTemplate.findMany({
      orderBy: [{ trade: 'asc' }, { name: 'asc' }],
    });

    const grouped: Record<string, typeof templates> = {};
    for (const t of templates) {
      if (!grouped[t.trade]) grouped[t.trade] = [];
      grouped[t.trade].push(t);
    }

    res.json({ grouped });
  } catch (error) {
    console.error('Templates by trade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
