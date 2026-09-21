const { getAuth } = require('@clerk/express');
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// GET all posts
router.get('/', async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single post by id
router.get('/:id', async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const post = await prisma.post.findUnique({
      where: { id: req.params.id }
    });
    if (!post || post.userId !== user.id) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a post

router.post('/', async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return res.status(404).json({ error: 'User not found. Try refreshing to sync your account.' });

    const { title, contentBody, status } = req.body;
    const post = await prisma.post.create({
      data: { title, contentBody, status, userId: user.id }
    });
    res.status(201).json(post);
  } catch (err) {
    console.error('CREATE POST ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
      if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
});

// UPDATE a post
router.put('/:id', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const data = {};
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.contentBody !== undefined) data.contentBody = req.body.contentBody;
    if (req.body.status !== undefined) data.status = req.body.status;

    const post = await prisma.post.update({
      where: { id: req.params.id },
      data
    });
    res.json(post);
  } catch (err) {
    console.error('UPDATE POST ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a post
router.delete('/:id', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;