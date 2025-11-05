import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createAuthMiddleware } from './src/middleware/auth.js';
import { createBeautyRouter } from './src/beauty.routes.js';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const authMiddleware = createAuthMiddleware(prisma);
const beautyRouter = createBeautyRouter(prisma, authMiddleware);

app.use('/beauty', beautyRouter);

app.post('/auth/register', async (req, res) => {
  const { email, password, role = 'subscriber', phase_current = '' } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        phase_current,
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      phase_current: user.phase_current,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already registered' });
    }

    return res.status(500).json({ message: 'Unable to create user' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.json({ token });
});

app.get('/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
