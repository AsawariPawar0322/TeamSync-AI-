# 🚀 Production Deployment Guide - TeamSync AI

This guide explains how to deploy the backend API to **Render** and the frontend application to **Vercel**, linking them together for production.

---

## 1. Deploy the Backend API to Render (Python FastAPI)

Render is a cloud hosting platform that makes it easy to run FastAPI servers.

### Step 1: Sign up & Create Web Service
1. Go to [Render](https://render.com) and sign up for a free account.
2. Click **New +** on the dashboard and select **Web Service**.
3. Connect your GitHub account and import your repository: `AsawariPawar0322/TeamSync-AI-`.

### Step 2: Configure Deployment Settings
In the configuration form, specify the following details:
- **Name**: `teamsync-ai-api`
- **Region**: Select the region closest to you (e.g., Oregon, Frankfurt).
- **Branch**: `main`
- **Root Directory**: `backend` (this is critical since our Python files are in the `/backend` folder).
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Select Plan & Deploy
1. Choose the **Free** instance type.
2. Click **Create Web Service**.
3. Render will pull your repository, build the dependencies, and deploy the FastAPI backend.
4. **Copy the backend URL** once it shows live (e.g., `https://teamsync-ai-api.onrender.com`).

---

## 2. Deploy the Frontend UI to Vercel (React Vite)

Vercel is the optimal platform for hosting static Vite projects.

### Step 1: Create Vercel Project
1. Go to [Vercel](https://vercel.com) and log in.
2. Click **Add New...** and select **Project**.
3. Import your repository: `AsawariPawar0322/TeamSync-AI-`.

### Step 2: Configure Environment Variables & Deploy
1. Under **Framework Preset**, Vercel will auto-detect **Vite**.
2. Under **Environment Variables**, add the connection link to the backend:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<YOUR_RENDER_BACKEND_URL>/api` (make sure it ends with `/api`, e.g., `https://teamsync-ai-api.onrender.com/api`).
3. Click **Deploy**.
4. Within 1-2 minutes, your website will be live at a public address like `https://teamsync-ai.vercel.app`.

---

## 3. Verify Deployment

1. Open your Vercel frontend URL.
2. Try registering a new user profile.
3. Test uploading a resume.
4. Inspect the browser Network tab to verify requests are successfully routing to your Render API server!
