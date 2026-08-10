const express = require('express');
const router = express.Router();
const { getAuth } = require('@clerk/express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Sync the logged-in Clerk user with our database
router.post('/sync', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { clerkUserId: userId }
      });
    }

    res.json(user);
  } catch (err) {
    console.error('SYNC USER ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;