const express = require('express');
const router = express.Router();
const { getAuth } = require('@clerk/express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

router.get('/', async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await prisma.post.findMany({ where: { userId: user.id } });

    const total = posts.length;
    const byStatus = {
      IDEA: posts.filter(p => p.status === 'IDEA').length,
      SCRIPTED: posts.filter(p => p.status === 'SCRIPTED').length,
      FILMED: posts.filter(p => p.status === 'FILMED').length,
      POSTED: posts.filter(p => p.status === 'POSTED').length,
    };

    res.json({ total, byStatus });
  } catch (err) {
    console.error('ANALYTICS ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;