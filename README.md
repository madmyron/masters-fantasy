# ⛳ Masters Fantasy Golf 2025

A shared fantasy golf app for the Masters Tournament. Built with Next.js + Vercel KV.

## Deploy to Vercel (free, ~5 minutes)

### 1. Push to GitHub

```bash
cd masters-fantasy
git init
git add .
git commit -m "Masters Fantasy Golf 2025"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/masters-fantasy.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `masters-fantasy` repo
4. Click **Deploy** (no extra config needed for the first deploy)

### 3. Add Vercel KV (shared database)

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database → KV**
3. Name it `masters2025` and click **Create**
4. Go to the KV database → **Settings** → **Environments** → connect to your project
5. Click **Redeploy** on your project (this injects the KV env vars automatically)

That's it! Your app is live. Share the Vercel URL with your friends.

### 4. Share with friends

Send them your Vercel URL (e.g. `https://masters-fantasy-xxx.vercel.app`).  
Everyone drafts their team, entries are shared in real time.  
After the tournament, go to the **Scores** tab and enter finishing positions.

---

## Local development

```bash
npm install
npm run dev
```

Local dev uses in-memory storage (no KV needed). Entries reset on restart.

## Tech stack

- **Next.js 14** (App Router)
- **Vercel KV** (Redis, free tier — 30MB storage, plenty for this)
- **TypeScript**
- Zero external UI dependencies
