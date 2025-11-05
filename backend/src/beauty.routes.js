import { Router } from 'express';

export function createBeautyRouter(prisma, authMiddleware) {
  const router = Router();

  router.get('/routines', async (req, res) => {
    const phase = typeof req.query.phase === 'string' ? req.query.phase.trim() : undefined;
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
    const trimmedPhase = typeof phase === 'string' ? phase.trim() : '';
    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    const trimmedDescription =
      typeof description === 'string' ? description.trim() : '';

    if (!trimmedTitle || !trimmedDescription || !trimmedPhase) {

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
        data: { title: trimmedTitle, description: trimmedDescription, phase: trimmedPhase },
        data: { title, description, phase },
      });

      return res.status(201).json({ routine });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to create beauty routine' });
    }
  });

  router.post('/photos', authMiddleware, async (req, res) => {
    const { imageUrl, takenAt } = req.body ?? {};
    const trimmedImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';

    if (!trimmedImageUrl) {

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
          imageUrl: trimmedImageUrl,
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
