# 🚀 Quick Deploy to Vercel - TeamSync AI

## Step 1: Install Vercel CLI
Open terminal and run:
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```
This will open a browser for authentication.

## Step 3: Deploy (One Command!)
From your project directory:
```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Select your Vercel account
- **Link to existing project?** → `N` (No)
- **Project name?** → `teamsync-ai` (or anything you like)
- **Directory?** → `.` (current directory)
- **Override settings?** → `N` (No)

## Step 4: Deploy to Production
```bash
vercel --prod
```

**Done!** Your app will be live at a URL like:
`https://teamsync-ai-xxxxx.vercel.app`

---

## Alternative: GitHub → Vercel (No CLI needed)

### 1. Create GitHub Repository
- Go to https://github.com/new
- Create a new repository (e.g., "teamsync-ai")
- Don't initialize with README (you already have files)

### 2. Push Your Code
```bash
git init
git add .
git commit -m "TeamSync AI - Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/teamsync-ai.git
git push -u origin main
```

### 3. Deploy on Vercel
- Go to https://vercel.com
- Click "Add New Project"
- Import your GitHub repo
- Click "Deploy" (Vercel auto-detects Vite)

**That's it!** Auto-deploys on every push to main.

---

## Need Help?
- Vercel Docs: https://vercel.com/docs
- Vite + Vercel: https://vercel.com/guides/deploying-vite
