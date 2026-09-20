require('dotenv').config();
console.log('===== INDEX.JS LOADED — VERSION CHECK 1 =====');
const { clerkMiddleware, requireAuth } = require('@clerk/express');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const usersRouter = require('./routes/users');
const aiRouter = require('./routes/ai');
const analyticsRouter = require('./routes/analytics');
const postsRouter = require('./routes/posts');

const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware({ debug: false }));
app.use((req, res, next) => {
  console.log('INCOMING REQUEST:', req.method, req.url);
  next();
});

app.use('/api/users', usersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/ai', aiRouter);

// Test route
app.get('/', (req, res) => {
  res.send('Content Planner API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});