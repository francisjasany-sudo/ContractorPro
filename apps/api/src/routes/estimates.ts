import { Router, Request, Response } from 'express';
import { prisma } from '@contractorpro/database';
import { authMiddleware } from '../middleware/auth.js';

type Params = { projectId: string; estimateId: string };

const router = Router({ mergeParams: true });
router.use(authMiddleware);

async function verifyProject(projectId: string, userId: string) {
  return prisma.project.findFirst({ where: { id: projectId, userId } });
}

// List estimates for a project
router.get('/', async (req: Request<Params>, res: Response) => {
  try {
    const project = await verifyProject(req.params.projectId, req.user!.userId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const estimates = await prisma.estimate.findMany({
      where: { projectId: req.params.projectId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ estimates });
  } catch (error) {
    console.error('List estimates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single estimate
router.get('/:estimateId', async (req: Request<Params>, res: Response) => {
  try {
    const project = await verifyProject(req.params.projectId, req.user!.userId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const estimate = await prisma.estimate.findFirst({
      where: { id: req.params.estimateId, projectId: req.params.projectId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!estimate) {
      res.status(404).json({ error: 'Estimate not found' });
      return;
    }

    res.json({ estimate });
  } catch (error) {
    console.error('Get estimate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create an estimate
router.post('/', async (req: Request<Params>, res: Response) => {
  try {
    const project = await verifyProject(req.params.projectId, req.user!.userId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const { name, overheadRate, marginRate, taxRate, items } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Estimate name is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

    const estimate = await prisma.estimate.create({
      data: {
        name,
        projectId: req.params.projectId,
        overheadRate: overheadRate ?? user?.overheadRate ?? 0.10,
        marginRate: marginRate ?? user?.marginRate ?? 0.15,
        taxRate: taxRate ?? user?.taxRate ?? 0.08,
        items: items
          ? {
              create: items.map((item: Record<string, unknown>, index: number) => ({
                description: item.description as string,
                category: (item.category as string) || undefined,
                quantity: item.quantity as number,
                unit: item.unit as string,
                materialCostPerUnit: item.materialCostPerUnit as number,
                laborCostPerUnit: item.laborCostPerUnit as number,
                wasteFactor: (item.wasteFactor as number) ?? 0.05,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    res.status(201).json({ estimate });
  } catch (error) {
    console.error('Create estimate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an estimate
router.put('/:estimateId', async (req: Request<Params>, res: Response) => {
  try {
    const project = await verifyProject(req.params.projectId, req.user!.userId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const existing = await prisma.estimate.findFirst({
      where: { id: req.params.estimateId, projectId: req.params.projectId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Estimate not found' });
      return;
    }

    const { name, overheadRate, marginRate, taxRate, status, items } = req.body;

    if (items) {
      await prisma.estimateItem.deleteMany({ where: { estimateId: req.params.estimateId } });
      await prisma.estimateItem.createMany({
        data: items.map((item: Record<string, unknown>, index: number) => ({
          estimateId: req.params.estimateId,
          description: item.description as string,
          category: (item.category as string) || undefined,
          quantity: item.quantity as number,
          unit: item.unit as string,
          materialCostPerUnit: item.materialCostPerUnit as number,
          laborCostPerUnit: item.laborCostPerUnit as number,
          wasteFactor: (item.wasteFactor as number) ?? 0.05,
          sortOrder: index,
        })),
      });
    }

    const estimate = await prisma.estimate.update({
      where: { id: req.params.estimateId },
      data: {
        ...(name && { name }),
        ...(overheadRate !== undefined && { overheadRate }),
        ...(marginRate !== undefined && { marginRate }),
        ...(taxRate !== undefined && { taxRate }),
        ...(status && { status }),
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    res.json({ estimate });
  } catch (error) {
    console.error('Update estimate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an estimate
router.delete('/:estimateId', async (req: Request<Params>, res: Response) => {
  try {
    const project = await verifyProject(req.params.projectId, req.user!.userId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const existing = await prisma.estimate.findFirst({
      where: { id: req.params.estimateId, projectId: req.params.projectId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Estimate not found' });
      return;
    }

    await prisma.estimate.delete({ where: { id: req.params.estimateId } });
    res.json({ message: 'Estimate deleted' });
  } catch (error) {
    console.error('Delete estimate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
