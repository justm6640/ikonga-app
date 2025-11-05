import express from 'express';

export function createNutritionRouter({ prisma, authMiddleware }) {
  if (!prisma) {
    throw new Error('Prisma client is required to create nutrition router.');
  }

  if (!authMiddleware) {
    throw new Error('Auth middleware is required to protect nutrition routes.');
  }

  const router = express.Router();

  const requireCoachRole = (req, res, next) => {
    if (!req.user || req.user.role !== 'coach') {
      return res.status(403).json({ error: 'Access restricted to coaches.' });
    }

    return next();
  };

  router.get('/nutrition/menus', async (req, res) => {
    try {
      const { phase } = req.query;

      const menus = await prisma.menu.findMany({
        where: phase ? { phase: String(phase) } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ menus });
    } catch (error) {
      console.error('Error fetching menus:', error);
      return res.status(500).json({ error: 'Unable to fetch menus.' });
    }
  });

  router.get('/nutrition/recipes', async (_req, res) => {
    try {
      const recipes = await prisma.recipe.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ recipes });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return res.status(500).json({ error: 'Unable to fetch recipes.' });
    }
  });

  router.post('/nutrition/menus', authMiddleware, requireCoachRole, async (req, res) => {
    const { title, description, phase, day } = req.body ?? {};

    if (!title || !phase) {
      return res.status(400).json({ error: 'Title and phase are required.' });
    }

    try {
      const menu = await prisma.menu.create({
        data: {
          title,
          description: description ?? null,
          phase,
          day: typeof day === 'number' ? day : null,
        },
      });

      return res.status(201).json({ menu });
    } catch (error) {
      console.error('Error creating menu:', error);
      return res.status(500).json({ error: 'Unable to create menu.' });
    }
  });

  router.post('/nutrition/recipes', authMiddleware, requireCoachRole, async (req, res) => {
    const { title, ingredients, steps, phase } = req.body ?? {};

    if (!title || !ingredients || !steps) {
      return res.status(400).json({ error: 'Title, ingredients, and steps are required.' });
    }

    try {
      const recipe = await prisma.recipe.create({
        data: {
          title,
          ingredients,
          steps,
          phase: phase ?? null,
        },
      });

      return res.status(201).json({ recipe });
    } catch (error) {
      console.error('Error creating recipe:', error);
      return res.status(500).json({ error: 'Unable to create recipe.' });
    }
  });

  return router;
}
