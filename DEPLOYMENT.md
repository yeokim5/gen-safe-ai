# Gen-SAFE Deployment Guide

This guide walks you through deploying Gen-SAFE with the frontend on Vercel and the backend on Railway.

## Overview

- **Frontend**: React app deployed on Vercel
- **Backend**: Node.js API server deployed on Railway
- **Database**: None required (stateless API)

## Prerequisites

1. [Vercel Account](https://vercel.com)
2. [Railway Account](https://railway.app)
3. OpenAI API Key
4. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Project

1. Go to [Railway](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Gen-SAFE repository
5. Railway will automatically detect it's a Node.js project

### 1.2 Configure Environment Variables

In your Railway project dashboard, go to the **Variables** tab and add these environment variables:

```env
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ANALYSIS_RATE_LIMIT_WINDOW_MS=60000
ANALYSIS_RATE_LIMIT_MAX_REQUESTS=10
```

**Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 1.3 Deploy Backend

1. Railway will automatically deploy your backend
2. Note the generated Railway URL (e.g., `https://your-app-name.railway.app`)
3. Test the deployment by visiting: `https://your-app-name.railway.app/api/health`

## Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Frontend Environment

1. In your local project, navigate to the `frontend` folder
2. Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=https://your-railway-app.railway.app
```

Replace `your-railway-app.railway.app` with your actual Railway URL from Step 1.3.

### 2.2 Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. From your project root directory, run:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Link to existing project: No
   - Project name: gen-safe-frontend (or your preferred name)
   - Directory: `./` (project root)
   - Override settings: Yes
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Development Command: `cd frontend && npm run dev`

#### Option B: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure build settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`

### 2.3 Configure Vercel Environment Variables

In your Vercel project settings, add the environment variable:

- **Name**: `VITE_API_URL`
- **Value**: `https://your-railway-app.railway.app` (your Railway URL)

## Step 3: Update CORS Configuration

### 3.1 Update Railway Environment Variables

Go back to your Railway project and add/update the CORS configuration:

```env
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

Replace `your-vercel-app.vercel.app` with your actual Vercel domain.

### 3.2 Redeploy Railway

Railway should automatically redeploy when you update environment variables. If not, trigger a manual deployment.

## Step 4: Test the Deployment

1. Visit your Vercel URL: `https://your-vercel-app.vercel.app`
2. Try creating a system analysis to test the frontend-backend connection
3. Check both Vercel and Railway logs if you encounter issues

## Troubleshooting

### Common Issues

#### CORS Errors
- Ensure `ALLOWED_ORIGINS` in Railway matches your Vercel domain exactly
- Check that both deployments are using HTTPS

#### API Connection Issues
- Verify `VITE_API_URL` in Vercel matches your Railway URL
- Test Railway API directly: `https://your-railway-app.railway.app/api/health`

#### OpenAI API Errors
- Verify your OpenAI API key is correct and has sufficient credits
- Check Railway logs for detailed error messages

### Viewing Logs

**Railway Logs:**
1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Deployments" tab
4. Click on the latest deployment to view logs

**Vercel Logs:**
1. Go to your Vercel project dashboard
2. Click on the "Functions" tab
3. View real-time logs or browse previous executions

## Custom Domains (Optional)

### Vercel Custom Domain
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

### Railway Custom Domain
1. Go to your Railway project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

Remember to update the CORS and API URL configurations when using custom domains.

## Security Considerations

1. **Environment Variables**: Never commit API keys to your repository
2. **CORS**: Keep ALLOWED_ORIGINS restrictive to your actual domains
3. **Rate Limiting**: The current configuration allows 10 analysis requests per minute per IP
4. **HTTPS**: Both Vercel and Railway provide HTTPS by default

## Monitoring

- **Railway**: Built-in metrics and logging
- **Vercel**: Analytics and performance monitoring
- **OpenAI**: Monitor API usage in your OpenAI dashboard

## Support

If you encounter issues:
1. Check the logs on both platforms
2. Verify environment variables are set correctly
3. Test API endpoints directly
4. Ensure your OpenAI API key has sufficient credits

---

**Note**: This deployment separates the frontend and backend, which provides better scalability and allows independent updates to each service.
