# Gen-SAFE Deployment Checklist

## Before You Start
- [ ] Have your OpenAI API key ready
- [ ] Have accounts on Vercel and Railway
- [ ] Repository is pushed to GitHub/GitLab/Bitbucket

## Step 1: Deploy Backend to Railway

### Railway Setup:
1. [ ] Create new Railway project from GitHub repo
2. [ ] Add environment variables:
   - [ ] `NODE_ENV=production`
   - [ ] `OPENAI_API_KEY=your_key_here`
   - [ ] `OPENAI_MODEL=gpt-4`
   - [ ] `LOG_LEVEL=info`
3. [ ] Wait for deployment to complete
4. [ ] Note your Railway URL: `https://________.railway.app`
5. [ ] Test health endpoint: `https://________.railway.app/api/health`

## Step 2: Deploy Frontend to Vercel

### Vercel Setup:
1. [ ] Create new Vercel project from GitHub repo
2. [ ] Configure build settings:
   - [ ] Build Command: `cd frontend && npm run build`
   - [ ] Output Directory: `frontend/dist`
   - [ ] Install Command: `cd frontend && npm install`
3. [ ] Add environment variable:
   - [ ] `VITE_API_URL=https://________.railway.app` (your Railway URL)
4. [ ] Deploy and note your Vercel URL: `https://________.vercel.app`

## Step 3: Update CORS Settings

### Railway CORS Configuration:
1. [ ] Go back to Railway project
2. [ ] Add environment variable:
   - [ ] `ALLOWED_ORIGINS=https://________.vercel.app` (your Vercel URL)
3. [ ] Wait for automatic redeployment

## Step 4: Test Everything

1. [ ] Visit your Vercel URL: `https://________.vercel.app`
2. [ ] Try generating an analysis
3. [ ] Check that API calls work properly
4. [ ] Verify no CORS errors in browser console

## URLs to Remember

**Fill these in as you deploy:**

- Railway Backend URL: `https://________.railway.app`
- Vercel Frontend URL: `https://________.vercel.app`
- API Health Check: `https://________.railway.app/api/health`
- Analysis Endpoint: `https://________.railway.app/api/analysis/generate`

## Troubleshooting

### If you get CORS errors:
- [ ] Double-check `ALLOWED_ORIGINS` in Railway matches your Vercel domain exactly
- [ ] Ensure both URLs use `https://`

### If API calls fail:
- [ ] Verify `VITE_API_URL` in Vercel matches your Railway URL
- [ ] Test Railway API directly in browser

### If OpenAI errors occur:
- [ ] Check your OpenAI API key is correct
- [ ] Verify you have sufficient OpenAI credits
- [ ] Check Railway logs for detailed errors

## Custom Domains (Optional)

If you want to use custom domains:

### Vercel Custom Domain:
- [ ] Add domain in Vercel project settings
- [ ] Update DNS records as instructed
- [ ] Update `ALLOWED_ORIGINS` in Railway with new domain

### Railway Custom Domain:
- [ ] Add domain in Railway project settings  
- [ ] Update DNS records as instructed
- [ ] Update `VITE_API_URL` in Vercel with new domain

---

**Tip**: Keep this checklist handy and fill in your actual URLs as you deploy!
