# CRM Foundation — Deployment Guide

## Architecture

```
Vercel (Frontend)  ←→  Railway (Backend API + WebSocket)  ←→  Firebase (Auth + Firestore)
```

- **Frontend** (Vercel): React + Vite SPA
- **Backend** (Railway): Express + Socket.io
- **Database**: Firestore (Firebase)
- **Auth**: Firebase Auth (client-side) + Firebase Admin (server-side token verification)

---

## Step 1: Firebase Setup

### Get your Service Account Key (for Railway backend)
1. Go to [Firebase Console](https://console.firebase.google.com) → your project
2. **Project Settings** → **Service Accounts**
3. Click **Generate new private key** → download the JSON file
4. Open the file — you'll paste its contents as `FIREBASE_SERVICE_ACCOUNT` on Railway

### Enable Firebase Auth
1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Email/Password**

### Firestore Rules (recommended)
Deploy these rules to lock down Firestore so only authenticated users can read their own data:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{collection}/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Step 2: Deploy Backend to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select your repo
4. Railway auto-detects `railway.json` — no extra config needed for the build

### Set these Environment Variables in Railway:

| Variable | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Paste the **entire JSON** from the service account key file as a single line |
| `FIRESTORE_DATABASE_ID` | `ai-studio-8bfbcbfe-f272-4a01-b877-aefa5ec2c4d9` (or your DB ID) |
| `FRONTEND_URL` | Your Vercel URL e.g. `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | Your Gemini API key |
| `NODE_ENV` | `production` |

5. After deploy, copy your Railway URL (e.g. `https://your-app.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
2. **Framework Preset**: Vite
3. **Root Directory**: `frontend`
4. **Build Command**: `cd .. && npm run build` (or just `npm run build` if root is set correctly)
5. **Output Directory**: `../dist` (or `dist` relative to project root)

### Set these Environment Variables in Vercel:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Railway backend URL e.g. `https://your-app.up.railway.app` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyBigmk5Tib6C2Kh0yCeYgHaOmM_zQFGJag` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `gen-lang-client-0671380675.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `gen-lang-client-0671380675` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `gen-lang-client-0671380675.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `263239506516` |
| `VITE_FIREBASE_APP_ID` | `1:263239506516:web:230abc94eac3509306ebc1` |
| `VITE_FIRESTORE_DATABASE_ID` | `ai-studio-8bfbcbfe-f272-4a01-b877-aefa5ec2c4d9` |

6. Deploy — Vercel will give you your live URL

---

## Step 4: Wire them together

1. **Back in Railway**: Update `FRONTEND_URL` to your final Vercel URL
2. **In Firebase Console**: Add your Vercel URL to **Authorized domains**
   - Authentication → Settings → Authorized domains → Add domain

---

## Local Development

```bash
# 1. Copy env file
cp .env.example .env.local

# 2. Fill in .env.local with your values
#    For FIREBASE_SERVICE_ACCOUNT, paste the JSON (keeping it on one line)
#    Or set GOOGLE_APPLICATION_CREDENTIALS to the path of the JSON file

# 3. Install deps
npm install

# 4. Run (starts backend + Vite dev server together)
npm run dev
```

The Vite dev server proxies `/api` calls to `localhost:3000` automatically — no CORS issues locally.

---

## Common Issues

**`FIREBASE_SERVICE_ACCOUNT` parse error**: Make sure the JSON is on a single line with no newlines. In the private key value, `\n` should remain as the literal `\n` escape — don't expand it.

**Auth redirect loop on page load**: Fixed — `App.tsx` now waits for `authService.waitForAuthReady()` before rendering routes.

**`User profile not found` on first login**: Fixed — the backend `protect` middleware now auto-creates Firestore profiles for users who authenticated directly via Firebase Auth.

**Socket.io connection fails**: Make sure `FRONTEND_URL` on Railway includes your exact Vercel URL. Socket.io CORS checks the `Origin` header.

**Firestore `$in` operator error**: Fixed — replaced with separate queries per status value.
