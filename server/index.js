require('dotenv').config();
console.log('===== INDEX.JS LOADED — VERSION CHECK 1 =====');
const { clerkMiddleware, requireAuth } = require('@clerk/express');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const usersRouter = require('./routes/users');

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

// Test route
app.get('/', (req, res) => {
  res.send('Content Planner API is running');
});
const analyticsRouter = require('./routes/analytics');
app.use('/api/analytics', analyticsRouter);
const PORT = process.env.PORT || 5000;
const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});