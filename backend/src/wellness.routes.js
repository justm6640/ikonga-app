import { Router } from 'express';

function getTodayUtcDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function createWellnessRouter(prisma, authMiddleware) {
  const router = Router();

  router.use(authMiddleware);

  router.get('/habits', async (req, res) => {
    try {
      const habits = await prisma.habit.findMany({
        orderBy: { name: 'asc' },
      });

      return res.json({ habits });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to fetch habits' });
    }
  });

  router.post('/habits/check', async (req, res) => {
    const { habitId, done = true } = req.body ?? {};

    if (!habitId) {
      return res.status(400).json({ message: 'habitId is required' });
    }

    try {
      const habit = await prisma.habit.findUnique({ where: { id: habitId } });

      if (!habit) {
        return res.status(404).json({ message: 'Habit not found' });
      }

      const today = getTodayUtcDate();

      const userHabit = await prisma.userHabit.upsert({
        where: {
          userId_habitId_date: {
            userId: req.user.id,
            habitId,
            date: today,
          },
        },
        update: { done },
        create: {
          userId: req.user.id,
          habitId,
          date: today,
          done,
        },
      });

      return res.status(201).json({ userHabit });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to check habit' });
    }
  });

  router.post('/mood', async (req, res) => {
    const { mood, note } = req.body ?? {};

    if (!mood) {
      return res.status(400).json({ message: 'mood is required' });
    }

    try {
      const moodLog = await prisma.moodLog.create({
        data: {
          userId: req.user.id,
          mood,
          note,
        },
      });

      return res.status(201).json({ moodLog });
    } catch (error) {
      return res.status(500).json({ message: 'Unable to log mood' });
    }
  });

  return router;
}
