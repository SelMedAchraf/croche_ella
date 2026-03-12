# 🚀 Production Deployment Guide & Audit Report

## 🛠 Step 1: Database & Storage Setup (Supabase)

Before deploying the code, you must prepare the database.

1. **Run SQL Schema**:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard).
   - Navigate to **SQL Editor**.
   - Create a **New Query**.
   - Paste the contents of `database/schema.sql` and click **Run**.
2. **Configure Auth**:
   - Go to **Authentication > URL Configuration**.
   - Set **Site URL** to your future Vercel domain (e.g., `https://croche-gamma.vercel.app`).
   - Add `https://croche-gamma.vercel.app/auth/callback` to **Redirect URLs**.

---

## ⚙️ Step 2: Deploy Backend (Render)

1. Go to [render.com](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. **Configuration**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://croche-gamma.vercel.app` (Your Vercel URL)
   - `SUPABASE_URL`: (From Supabase Settings > API)
   - `SUPABASE_SERVICE_ROLE_KEY`: (From Supabase Settings > API - **Use Service Role, not Anon**)
   - `EMAIL_USER`: `crocheella19@gmail.com`
   - `EMAIL_PASS`: (16-character Google App Password)
5. **Deploy** and copy your backend URL (e.g., `https://croche-backend.onrender.com`).

---

## 💻 Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and import your repository.
2. **Configuration**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
3. **Environment Variables**:
   - `VITE_API_URL`: `https://croche-backend.onrender.com/api` (**CRITICAL: Must include /api at the end**)
   - `VITE_SUPABASE_URL`: (From Supabase Settings > API)
   - `VITE_SUPABASE_ANON_KEY`: (From Supabase Settings > API - Use Anon Key)
4. **Deploy**.

---

## 🧪 Step 4: Verification Checklist

### 1. API Health Check
Run this in your terminal (replace with your URL):
```bash
curl https://croche-xhxn.onrender.com/api/health
```
**Expected**: `{"status":"ok", "message":"Croche Ella API is running"}`

### 2. Database Connection
Visit: `https://croche-xhxn.onrender.com/api/products`
**Expected**: A JSON list of products (or `[]` if empty). If you get a 500 error, your Supabase keys are likely incorrect.

### 3. Frontend Check
- Open your Vercel URL.
- Open Developer Tools (F12) -> Console.
- There should be no red errors regarding `Failed to fetch`.