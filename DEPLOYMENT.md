# Deploy TeamSync AI to Vercel

## Prerequisites
1. GitHub account
2. Vercel account (free) - sign up at https://vercel.com

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

Follow the prompts:
- Set up and deploy? → Yes
- Which scope? → Select your account
- Link to existing project? → No
- What's your project's name? → teamsync-ai (or your choice)
- In which directory is your code located? → ./
- Want to override settings? → No

4. **Deploy to Production**
```bash
vercel --prod
```

---

### Option 2: Deploy via Vercel Dashboard (Recommended for Beginners)

1. **Push your code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - TeamSync AI"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Connect to Vercel**
- Go to https://vercel.com
- Click "Add New Project"
- Import your GitHub repository
- Vercel will auto-detect Vite settings

3. **Configure Build Settings** (usually auto-detected)
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

4. **Deploy**
- Click "Deploy"
- Wait 1-2 minutes for build to complete
- Your app will be live at `https://teamsync-ai.vercel.app` (or similar)

---

## Environment Variables (If Needed Later)

If you add backend API integration:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables like:
   - `VITE_API_URL` → Your backend API URL
   - `VITE_GITHUB_TOKEN` → GitHub API token (if needed)

---

## Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch → Automatic production deployment
- Pull requests → Automatic preview deployments

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Troubleshooting

### Build Fails
- Check Node.js version in Vercel settings (should be 18.x or higher)
- Ensure all dependencies are in `package.json`

### Routes Not Working
- The `vercel.json` file handles SPA routing
- Make sure it's in your project root

### 404 Errors on Refresh
- Check that `vercel.json` rewrites are configured correctly

---

## Your Deployment is Ready! 🚀

After deployment, you'll get a URL like:
**https://teamsync-ai.vercel.app**

Share this URL at your ideathon presentation!
