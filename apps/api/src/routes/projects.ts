import { Router, Request, Response } from 'express';
import { prisma } from '@contractorpro/database';
import { authMiddleware } from '../middleware/auth.js';

type Params = { id: string };

const router = Router();
router.use(authMiddleware);

// List all projects for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.userId },
      include: { estimates: { select: { id: true, name: true, status: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single project
router.get('/:id', async (req: Request<Params>, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: {
        estimates: {
          include: { items: true },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, clientName, clientEmail, clientPhone, address } = req.body;

    if (!name || !clientName) {
      res.status(400).json({ error: 'Name and client name are required' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        name,
        clientName,
        clientEmail,
        clientPhone,
        address,
        userId: req.user!.userId,
      },
    });

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a project
router.put('/:id', async (req: Request<Params>, res: Response) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const { name, clientName, clientEmail, clientPhone, address, status } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(clientName && { clientName }),
        ...(clientEmail !== undefined && { clientEmail }),
        ...(clientPhone !== undefined && { clientPhone }),
        ...(address !== undefined && { address }),
        ...(status && { status }),
      },
    });

    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a project
router.delete('/:id', async (req: Request<Params>, res: Response) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
