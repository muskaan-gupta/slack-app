# 🚀 Slack Connect - Production Deployment Guide

This guide will walk you through deploying Slack Connect to Render step by step.

## 📋 Prerequisites Checklist

- [ ] GitHub repository with your code
- [ ] Render account (free tier available)
- [ ] MongoDB Atlas account and database setup
- [ ] Slack App configured with proper permissions

## 🔧 Pre-Deployment Setup

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**: Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose free tier (M0)
3. **Setup Database User**: 
   - Go to Database Access
   - Add new user with read/write permissions
   - Note down username and password
4. **Configure Network Access**:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
5. **Get Connection String**:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

### 2. Slack App Configuration

1. **Go to Slack API Dashboard**: [api.slack.com/apps](https://api.slack.com/apps)
2. **Create New App** or select existing one
3. **Configure OAuth & Permissions**:
   - Scopes needed: `channels:read`, `chat:write`, `groups:read`
   - Redirect URLs: Will be updated after Render deployment
4. **Note down credentials**:
   - Client ID (from Basic Information)
   - Client Secret (from Basic Information)  
   - Signing Secret (from Basic Information)

## 🚀 Render Deployment Steps

### Step 1: Deploy Backend

1. **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Backend Service**:
   ```
   Name: slack-connect-backend
   Environment: Node
   Region: Oregon (recommended)
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   SLACK_CLIENT_ID=your_slack_client_id_here
   SLACK_CLIENT_SECRET=your_slack_client_secret_here
   SLACK_SIGNING_SECRET=your_slack_signing_secret_here
   SLACK_REDIRECT_URI=https://slack-connect-backend-xxxx.onrender.com/api/auth/slack/callback
   CLIENT_URL=https://slack-connect-frontend-xxxx.onrender.com
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   TOKEN_REFRESH_BUFFER_MINUTES=5
   ```

   > ⚠️ **Important**: Replace the URLs with your actual Render URLs (you'll get these after deployment)

5. **Deploy**: Click "Create Web Service"

6. **Note the Backend URL**: After deployment, copy the URL (e.g., `https://slack-connect-backend-xxxx.onrender.com`)

### Step 2: Deploy Frontend

1. **Create New Static Site**:
   - Click "New +" → "Static Site"
   - Connect same GitHub repository

2. **Configure Frontend Service**:
   ```
   Name: slack-connect-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Add Environment Variables**:
   ```
   VITE_API_URL=https://slack-connect-backend-xxxx.onrender.com
   NODE_ENV=production
   ```

   > ⚠️ **Important**: Use the actual backend URL from Step 1

4. **Deploy**: Click "Create Static Site"

5. **Note the Frontend URL**: After deployment, copy the URL (e.g., `https://slack-connect-frontend-xxxx.onrender.com`)

### Step 3: Update Environment Variables

1. **Update Backend Environment Variables**:
   - Go to your backend service settings
   - Update `CLIENT_URL` with the actual frontend URL
   - Update `SLACK_REDIRECT_URI` with the actual backend URL + `/api/auth/slack/callback`

2. **Trigger Redeploy**: Go to backend service → Manual Deploy → Deploy Latest Commit

### Step 4: Update Slack App Configuration

1. **Go to Slack API Dashboard**: [api.slack.com/apps](https://api.slack.com/apps)
2. **Select Your App**
3. **Update OAuth & Permissions**:
   - Add Redirect URL: `https://your-actual-backend-url.onrender.com/api/auth/slack/callback`
   - Remove localhost URLs if any
4. **Save Changes**

## 🔍 Verification Steps

### 1. Check Backend Health
- Visit: `https://your-backend-url.onrender.com/api/health`
- Should return: `{"status":"ok","time":"...","environment":"production","version":"1.0.0"}`

### 2. Check Frontend
- Visit: `https://your-frontend-url.onrender.com`
- Should load the application properly

### 3. Test Slack Integration
1. Try to authenticate with Slack
2. Test sending a message
3. Test scheduling a message

## 🐛 Troubleshooting

### Common Issues

#### ❌ Backend Build Fails
**Solution**:
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `cd backend && npm run build`

#### ❌ Frontend Build Fails  
**Solution**:
- Check build logs in Render dashboard
- Verify environment variables are set
- Test build locally: `cd frontend && npm run build`

#### ❌ Database Connection Error
**Solution**:
- Verify MongoDB Atlas connection string
- Check IP whitelist (should include `0.0.0.0/0`)
- Ensure database user has proper permissions

#### ❌ CORS Errors
**Solution**:
- Verify `CLIENT_URL` environment variable matches frontend URL exactly
- Check for trailing slashes or protocol mismatches
- Ensure both services are deployed and running

#### ❌ Slack Authentication Fails
**Solution**:
- Verify all Slack environment variables are set correctly
- Check Slack app redirect URI matches backend URL + `/api/auth/slack/callback`
- Ensure Slack app has proper scopes

#### ❌ 502 Bad Gateway
**Solution**:
- Backend might be starting up (wait 1-2 minutes)
- Check backend logs for startup errors
- Verify environment variables are set

### Debug Commands

#### Check Backend Logs
1. Go to Render Dashboard
2. Select backend service
3. Go to "Logs" tab
4. Look for errors or startup messages

#### Check Frontend Build
1. Go to Render Dashboard  
2. Select frontend static site
3. Go to "Deploys" tab
4. Click on latest deploy to see build logs

#### Test API Endpoints
```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/api/health

# Test channels endpoint (requires Slack auth)
curl https://your-backend-url.onrender.com/api/messages/channels
```

## 🔧 Environment Variables Reference

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `SLACK_CLIENT_ID` | Slack app client ID | `1234567890.1234567890` |
| `SLACK_CLIENT_SECRET` | Slack app client secret | `abc123def456...` |
| `SLACK_SIGNING_SECRET` | Slack app signing secret | `xyz789...` |
| `SLACK_REDIRECT_URI` | OAuth redirect URI | `https://backend.onrender.com/api/auth/slack/callback` |
| `CLIENT_URL` | Frontend URL | `https://frontend.onrender.com` |
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://user:pass@cluster.net/db` |

### Frontend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend.onrender.com` |
| `NODE_ENV` | Environment | `production` |

## 📈 Post-Deployment

### 1. Monitor Services
- Check Render dashboard regularly
- Monitor service logs for errors
- Set up alerts if needed

### 2. Database Monitoring
- Monitor MongoDB Atlas metrics
- Set up alerts for connection issues
- Regular database backups

### 3. Performance Optimization
- Monitor response times
- Optimize database queries if needed
- Consider upgrading Render plans for better performance

### 4. Security
- Regularly update dependencies
- Monitor for security vulnerabilities
- Review access logs

## 🎉 Success!

If you've followed all steps correctly, your Slack Connect application should now be running in production!

- **Frontend**: `https://your-frontend-url.onrender.com`
- **Backend**: `https://your-backend-url.onrender.com`
- **Health Check**: `https://your-backend-url.onrender.com/api/health`

## 📞 Need Help?

- Check the [Render documentation](https://render.com/docs)
- Review the [Slack API documentation](https://api.slack.com/)
- Open an issue in the GitHub repository
