## 📦 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variables:
   - `VITE_API_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

### Backend (Render)

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`
5. Set environment variables:
   - `PORT`
   - `NODE_ENV`
   - `FRONTEND_URL` (your Vercel URL)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
6. Deploy