import { Router } from 'express';

export function createBeautyRouter(prisma, authMiddleware) {
  const router = Router();

  router.get('/routines', async (req, res) => {
    const { phase } = req.query;

    try {
      const routines = await prisma.beautyRoutine.findMany({
        where: phase ? { phase } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ routines });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to fetch beauty routines' });
    }
  });

  router.post('/routines', authMiddleware, async (req, res) => {
    const { title, description, phase } = req.body ?? {};

    if (!title || !description || !phase) {
      return res
        .status(400)
        .json({ message: 'Title, description, and phase are required' });
    }

    if (req.user?.role !== 'coach') {
      return res.status(403).json({ message: 'Coach role required' });
    }

    try {
      const routine = await prisma.beautyRoutine.create({
        data: { title, description, phase },
      });

      return res.status(201).json({ routine });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to create beauty routine' });
    }
  });

  router.post('/photos', authMiddleware, async (req, res) => {
    const { imageUrl, takenAt } = req.body ?? {};

    if (!imageUrl) {
      return res.status(400).json({ message: 'imageUrl is required' });
    }

    let parsedTakenAt;

    if (takenAt) {
      parsedTakenAt = new Date(takenAt);

      if (Number.isNaN(parsedTakenAt.getTime())) {
        return res.status(400).json({ message: 'Invalid takenAt date' });
      }
    }

    try {
      const photo = await prisma.beautyPhoto.create({
        data: {
          imageUrl,
          userId: req.user.id,
          ...(parsedTakenAt ? { takenAt: parsedTakenAt } : {}),
        },
      });

      return res.status(201).json({ photo });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to save beauty photo' });
    }
  });

  return router;
}
