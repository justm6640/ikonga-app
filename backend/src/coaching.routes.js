import { Router } from 'express';

export function createCoachingRouter(prisma, authMiddleware) {
  const router = Router();

  router.use(authMiddleware);

  router.get('/subscribers', async (req, res) => {
    if (req.user?.role !== 'coach') {
      return res.status(403).json({ message: 'Coach role required' });
    }

    try {
      const subscribers = await prisma.user.findMany({
        where: { role: 'subscriber' },
        select: {
          id: true,
          email: true,
          phase_current: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ subscribers });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Unable to fetch subscribers list' });
    }
  });

  router.get('/messages/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
      const otherUser = await prisma.user.findUnique({ where: { id: userId } });

      if (!otherUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (req.user.role === 'coach') {
        if (otherUser.role !== 'subscriber') {
          return res
            .status(400)
            .json({ message: 'Coaches can only view subscriber conversations' });
        }
      } else if (req.user.role === 'subscriber') {
        if (otherUser.role !== 'coach') {
          return res
            .status(403)
            .json({ message: 'Subscribers can only view their coach conversation' });
        }
      } else {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const messages = await prisma.coachMessage.findMany({
        where: {
          OR: [
            { fromUserId: req.user.id, toUserId: userId },
            { fromUserId: userId, toUserId: req.user.id },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      return res.json({ messages });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Unable to fetch coaching messages' });
    }
  });

  router.post('/messages', async (req, res) => {
    const { toUserId, content } = req.body ?? {};

    if (!toUserId || !content) {
      return res
        .status(400)
        .json({ message: 'toUserId and content are required' });
    }

    try {
      const targetUser = await prisma.user.findUnique({ where: { id: toUserId } });

      if (!targetUser) {
        return res.status(404).json({ message: 'Recipient not found' });
      }

      if (req.user.role === 'coach') {
        if (targetUser.role !== 'subscriber') {
          return res
            .status(400)
            .json({ message: 'Coaches can only message subscribers' });
        }
      } else if (req.user.role === 'subscriber') {
        if (targetUser.role !== 'coach') {
          return res
            .status(403)
            .json({ message: 'Subscribers can only message their coach' });
        }
      } else {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const message = await prisma.coachMessage.create({
        data: {
          fromUserId: req.user.id,
          toUserId,
          content,
        },
      });

      return res.status(201).json({ message });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to send message' });
    }
  });

  router.get('/progress/:userId', async (req, res) => {
    const { userId } = req.params;

    if (req.user.role !== 'coach' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    try {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });

      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const progressEntries = await prisma.progress.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ progress: progressEntries });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to fetch progress entries' });
    }
  });

  router.post('/progress', async (req, res) => {
    const { userId, weight, notes, phase } = req.body ?? {};

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (req.user.role !== 'coach' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    try {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });

      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (req.user.role === 'coach' && targetUser.role !== 'subscriber') {
        return res
          .status(400)
          .json({ message: 'Coaches can only add subscriber progress' });
      }

      let parsedWeight;
      if (weight !== undefined) {
        const numericWeight = Number(weight);
        if (Number.isNaN(numericWeight)) {
          return res.status(400).json({ message: 'weight must be a number' });
        }
        parsedWeight = numericWeight;
      }

      const progressEntry = await prisma.progress.create({
        data: {
          userId,
          weight: parsedWeight,
          notes,
          phase,
        },
      });

      return res.status(201).json({ progress: progressEntry });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to create progress entry' });
    }
  });

  return router;
}
