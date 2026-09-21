# ⚡ Content Planner

A full-stack, AI-powered content management platform designed to help small business owners, freelancers, and independent creators plan, draft, and scale their social media presence effortlessly.

---

## 🌟 Reason for Creation & Purpose

Small business owners and independent creators often struggle with:
* **Inconsistent Posting:** Juggling multiple platforms without a unified workflow.
* **Writer's Block:** Spending hours trying to generate hooks, captions, and fresh content ideas.
* **Overly Complex Tools:** Existing marketing suites are frequently bloated, expensive, or hard to navigate.

**Content Planner** was created to democratize social media management. By providing an intuitive Kanban-style workflow integrated directly with Google Gemini AI, it helps small businesses gain online exposure and makes content creation easy, fun, and accessible to everyone.

---

## ✨ Features

- 🔐 **Secure Authentication:** User sign-in and session isolation powered by Clerk.
- 📋 **Kanban Workflow:** Track content across four distinct pipeline stages: `Idea`, `Scripted`, `Filmed`, and `Posted`.
- 🤖 **AI Content Assistance:** Integrated Google Gemini API to instantly generate tailored post hooks, captions, and creative ideas.
- 📊 **Analytics Overview:** Real-time visual tracking of post status and platform distribution.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL hosted on Railway via Prisma ORM
- **Authentication:** Clerk Auth
- **AI Integration:** `@google/genai` (Google Gemini API)
- **Deployment:** Netlify (Frontend) & Railway (Backend)

---

## 🚀 Environment Setup

### Backend (.env)
```env
PORT=5000
DATABASE_URL="your-postgresql-connection-string"
CLERK_SECRET_KEY="your-clerk-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
