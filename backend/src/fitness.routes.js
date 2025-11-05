import express from 'express';

export function createFitnessRouter({ prisma, authMiddleware }) {
  if (!prisma) {
    throw new Error('Prisma client is required to create fitness router.');
  }

  if (!authMiddleware) {
    throw new Error('Auth middleware is required to protect fitness routes.');
  }

  const router = express.Router();

  const requireCoachRole = (req, res, next) => {
    if (!req.user || req.user.role !== 'coach') {
      return res.status(403).json({ error: 'Access restricted to coaches.' });
    }

    return next();
  };

  router.get('/fitness/workouts', async (req, res) => {
    try {
      const { phase } = req.query;

      const workouts = await prisma.workout.findMany({
        where: phase ? { phase: String(phase) } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ workouts });
    } catch (error) {
      console.error('Error fetching workouts:', error);
      return res.status(500).json({ error: 'Unable to fetch workouts.' });
    }
  });

  router.post('/fitness/workouts', authMiddleware, requireCoachRole, async (req, res) => {
    const { title, description, phase, videoUrl, durationMinutes } = req.body ?? {};

    if (!title || !phase) {
      return res.status(400).json({ error: 'Title and phase are required.' });
    }

    const duration =
      typeof durationMinutes === 'number' && Number.isFinite(durationMinutes)
        ? Math.max(0, Math.trunc(durationMinutes))
        : null;

    try {
      const workout = await prisma.workout.create({
        data: {
          title,
          description: description ?? null,
          phase,
          videoUrl: videoUrl ?? null,
          durationMinutes: duration,
        },
      });

      return res.status(201).json({ workout });
    } catch (error) {
      console.error('Error creating workout:', error);
      return res.status(500).json({ error: 'Unable to create workout.' });
    }
  });

  router.post('/fitness/log', authMiddleware, async (req, res) => {
    const { workoutId, doneAt } = req.body ?? {};

    if (!workoutId) {
      return res.status(400).json({ error: 'workoutId is required.' });
    }

    try {
      const workout = await prisma.workout.findUnique({ where: { id: workoutId } });

      if (!workout) {
        return res.status(404).json({ error: 'Workout not found.' });
      }

      const logData = {
        userId: req.user.id,
        workoutId,
      };

      if (doneAt) {
        const parsedDate = new Date(doneAt);
        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({ error: 'Invalid doneAt date.' });
        }
        logData.doneAt = parsedDate;
      }

      const log = await prisma.fitnessLog.create({
        data: logData,
        include: {
          workout: true,
        },
      });

      return res.status(201).json({ log });
    } catch (error) {
      console.error('Error logging workout:', error);
      return res.status(500).json({ error: 'Unable to log workout.' });
    }
  });

  return router;
}
