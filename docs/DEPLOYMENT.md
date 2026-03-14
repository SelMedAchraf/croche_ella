## 📦 Full Project Deployment (Vercel)

Both the **Frontend** and the **Backend** of this project are designed to be deployed on **Vercel** for maximum speed, free hosting, and working email support.

---

### Step 1: Prepare Database (Supabase)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** and run the contents of `database/schema.sql`.
3. Go to **Settings > API** and copy:
   - **Project URL** (as `VITE_SUPABASE_URL`)
   - **anon public** (as `VITE_SUPABASE_ANON_KEY`)
   - **service_role secret** (as `SUPABASE_SERVICE_ROLE_KEY`)

---

### Step 2: Deploy Backend (Vercel)

1. Go to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New > Project** and import your GitHub repository.
3. **Configure Settings**:
   - **Project Name**: `croche-backend`
   - **Root Directory**: `backend`
   - **Framework Preset**: `Other` (Vercel will auto-detect the configuration)
4. **Environment Variables**:
   Add exactly these variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://croche-gamma.vercel.app` (Your actual frontend URL)
   - `SUPABASE_URL` = (Your Supabase URL)
   - `SUPABASE_SERVICE_ROLE_KEY` = (Your secret service role key)
   - `EMAIL_USER` = `admincroche19@gmail.com`
   - `EMAIL_PASS` = (Your 16-character Google App Password)
5. Click **Deploy**. Note your new backend URL (e.g., `https://croche-backend.vercel.app`).

---

### Step 3: Deploy Frontend (Vercel)

1. Repeat the steps above for the **Frontend**.
2. **Configure Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
3. **Environment Variables**:
   Add exactly these variables:
   - `VITE_API_URL` = `https://croche-backend.vercel.app/api` (**CRITICAL: must end in /api**)
   - `VITE_SUPABASE_URL` = (Your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY` = (Your public anon key)
4. Click **Deploy**.

---

### 🧪 Post-Deployment Test

1. Visit: `https://croche-backend-five.vercel.app/api/health`
   - Should return: `{"status":"ok", "message":"Croche Ella API is running"}`