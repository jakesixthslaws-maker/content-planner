const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Sync the logged-in Clerk user with our database
// Call this once after login (e.g. when the frontend dashboard loads)
router.post('/sync', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth();

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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;