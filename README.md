# NexDocIQ

> AI-powered document intelligence platform — upload, analyze, and chat with your documents.

## 🏗️ Project Structure

```
NexDocIQ/
├── frontend/          # React + Vite (deploys to Vercel as static site)
│   ├── src/
│   ├── public/
│   ├── vercel.json    # SPA routing config
│   └── .env.example   # Frontend env variable template
│
└── backend/           # Express + Mongoose (deploys to Vercel as serverless)
    ├── api/
    │   └── index.js   # Vercel serverless adapter
    ├── config/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── utils/
    ├── server.js
    ├── vercel.json     # Backend serverless config
    └── .env.example    # Backend env variable template
```

## 🚀 Local Development

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API Key

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/nexdociq.git
cd nexdociq
```

### 2. Set up Backend
```bash
cd backend
cp .env.example .env        # Fill in your real values
npm install
npm run dev                 # Starts on http://localhost:5000
```

### 3. Set up Frontend
```bash
cd frontend
cp .env.example .env        # Optional: only needed for production URL
npm install
npm run dev                 # Starts on http://localhost:5173
```

The Vite dev server automatically proxies `/api/*` requests to `localhost:5000`, so no CORS issues locally.

---

## ☁️ Deploying to Vercel

### Backend

1. Go to [vercel.com](https://vercel.com) → **New Project** → import the `backend/` folder
2. Set **Root Directory** to `backend`
3. Add environment variables in Vercel dashboard:
   | Variable | Value |
   |---|---|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `GEMINI_API_KEY` | Your Gemini API key |
   | `FRONTEND_URL` | Your frontend Vercel URL (add after deploying frontend) |
4. Deploy → note your backend URL (e.g. `https://nexdociq-backend.vercel.app`)

### Frontend

1. Go to [vercel.com](https://vercel.com) → **New Project** → import the `frontend/` folder
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | Your backend Vercel URL from above |
4. Deploy

---

## 🔑 Environment Variables

| Variable | Where | Description |
|---|---|---|
| `MONGODB_URI` | backend | MongoDB Atlas connection string |
| `GEMINI_API_KEY` | backend | Google Gemini API key |
| `FRONTEND_URL` | backend | Deployed frontend URL (for CORS) |
| `PORT` | backend | Local dev port (default: 5000) |
| `VITE_API_URL` | frontend | Backend API base URL (production only) |

> **Never commit `.env` files.** Use `.env.example` as the template.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Lucide React |
| Backend | Node.js 18+, Express 5, Mongoose |
| Database | MongoDB Atlas |
| AI | Google Gemini API |
| Deployment | Vercel |
