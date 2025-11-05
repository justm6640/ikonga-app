import express from 'express';

export function createWellnessRouter({ prisma, authMiddleware }) {
  if (!prisma) {
    throw new Error('Prisma client is required to create wellness router.');
  }

  if (!authMiddleware) {
    throw new Error('Auth middleware is required to protect wellness routes.');
  }

  const router = express.Router();

  router.use(authMiddleware);

  router.get('/wellness/habits', async (_req, res) => {
    try {
      const habits = await prisma.habit.findMany({
        orderBy: { name: 'asc' },
      });

      return res.json({ habits });
    } catch (error) {
      console.error('Error fetching habits:', error);
      return res.status(500).json({ error: 'Unable to fetch habits.' });
    }
  });

  router.post('/wellness/habits/check', async (req, res) => {
    const { habitId, date, done } = req.body ?? {};

    if (!habitId) {
      return res.status(400).json({ error: 'habitId is required.' });
    }

    try {
      const habit = await prisma.habit.findUnique({ where: { id: habitId } });

      if (!habit) {
        return res.status(404).json({ error: 'Habit not found.' });
      }

      const baseDate = date ? new Date(date) : new Date();

      if (Number.isNaN(baseDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date provided.' });
      }

      const targetDate = new Date(
        Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate())
      );

      const doneValue = typeof done === 'boolean' ? done : true;

      const userHabit = await prisma.userHabit.upsert({
        where: {
          userId_habitId_date: {
            userId: req.user.id,
            habitId,
            date: targetDate,
          },
        },
        update: {
          done: doneValue,
        },
        create: {
          userId: req.user.id,
          habitId,
          date: targetDate,
          done: doneValue,
        },
        include: {
          habit: true,
        },
      });

      return res.status(201).json({ userHabit });
    } catch (error) {
      console.error('Error checking habit:', error);
      return res.status(500).json({ error: 'Unable to record habit.' });
    }
  });

  router.post('/wellness/mood', async (req, res) => {
    const { mood, note } = req.body ?? {};

    if (!mood) {
      return res.status(400).json({ error: 'mood is required.' });
    }

    try {
      const moodLog = await prisma.moodLog.create({
        data: {
          userId: req.user.id,
          mood,
          note: note ?? null,
        },
      });

      return res.status(201).json({ moodLog });
    } catch (error) {
      console.error('Error logging mood:', error);
      return res.status(500).json({ error: 'Unable to log mood.' });
    }
  });

  return router;
}
