require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Content Planner API is running');
});

const PORT = process.env.PORT || 5000;
const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});