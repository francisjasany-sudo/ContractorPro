import { Router, Request, Response } from 'express';
import { prisma } from '@contractorpro/database';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Get profile
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        companyName: true,
        logo: true,
        phone: true,
        website: true,
        licenseNumber: true,
        address: true,
        overheadRate: true,
        marginRate: true,
        taxRate: true,
        paymentTerms: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/', async (req: Request, res: Response) => {
  try {
    const {
      companyName,
      logo,
      phone,
      website,
      licenseNumber,
      address,
      overheadRate,
      marginRate,
      taxRate,
      paymentTerms,
    } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(logo !== undefined && { logo }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(licenseNumber !== undefined && { licenseNumber }),
        ...(address !== undefined && { address }),
        ...(overheadRate !== undefined && { overheadRate }),
        ...(marginRate !== undefined && { marginRate }),
        ...(taxRate !== undefined && { taxRate }),
        ...(paymentTerms !== undefined && { paymentTerms }),
      },
      select: {
        id: true,
        email: true,
        companyName: true,
        logo: true,
        phone: true,
        website: true,
        licenseNumber: true,
        address: true,
        overheadRate: true,
        marginRate: true,
        taxRate: true,
        paymentTerms: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
