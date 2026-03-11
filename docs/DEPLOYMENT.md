## 📦 Deployment

### Step 1: Deploy Backend (Render)

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`
5. Set environment variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://croche-gamma.vercel.app` (your Vercel domain)
   - `SUPABASE_URL` = (your Supabase project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` = (your Supabase service role key - from Settings > API)
   - `PORT` = (leave empty - Render auto-provides)
6. Click **Deploy**
7. **Copy your backend URL**: `https://your-service-name.onrender.com`

### Step 2: Deploy Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
5. Set environment variables:
   - `VITE_API_URL` = `https://your-service-name.onrender.com` (your Render backend URL from Step 1)
   - `VITE_SUPABASE_URL` = (your Supabase project URL)
   - `VITE_SUPABASE_ANON_KEY` = (your Supabase anon key)
6. Click **Deploy**
7. Your site will be live at: `https://croche-gamma.vercel.app`

### Step 3: Connect Frontend & Backend

**After both deployments are complete:**

1. **Update Vercel Environment Variable** (if backend URL changed):
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Update `VITE_API_URL` with your Render backend URL
   - Redeploy from Deployments tab

2. **Verify Connection**:
   - Visit your Vercel frontend: `https://croche-gamma.vercel.app`
   - Check browser console (F12) for any API errors
   - Test adding products to cart, etc.

3. **Test Backend is Running**:
   - Visit: `https://your-service-name.onrender.com/api/products`
   - Should return JSON data (may take 30-60s if it's spinning up from free tier)

### 🔗 Important URLs

| Service | URL | Used By |
|---------|-----|---------|
| **Frontend (Vercel)** | `https://croche-gamma.vercel.app` | 👥 Your customers visit this |
| **Backend (Render)** | `https://your-service-name.onrender.com` | ⚙️ Frontend calls this API |
| **Database (Supabase)** | (your Supabase URL) | 💾 Backend stores data here |

### ⚠️ Important Notes

- **Deploy Backend FIRST** so you have the URL to use in frontend environment variables
- **Render Free Tier** spins down after 15 minutes of inactivity (first request will be slow)
- After changing environment variables on Vercel, you must **redeploy** for changes to take effect
- Share the **Vercel URL** with customers, not the Render URL