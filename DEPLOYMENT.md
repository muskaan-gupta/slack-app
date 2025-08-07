# Slack Connect - Deployment Guide

## Render Deployment Configuration

This project is configured for deployment on Render with the following URLs:
- **Frontend**: https://slack-app.onrender.com
- **Backend**: https://api-slack-app.onrender.com

## Environment Variables Setup

### Backend Environment Variables (Set in Render Dashboard)
```
NODE_ENV=production
PORT=3000
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
SLACK_REDIRECT_URI=https://api-slack-app.onrender.com/api/auth/slack/callback
CLIENT_URL=https://slack-app.onrender.com
API_URL=https://api-slack-app.onrender.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
TOKEN_REFRESH_BUFFER_MINUTES=5
```

### Frontend Environment Variables (Set in Render Dashboard)
```
NODE_ENV=production
VITE_API_URL=https://api-slack-app.onrender.com
```

## Deployment Steps

### Option 1: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.yaml` file and create both services
4. Set the required environment variables in the Render dashboard

### Option 2: Manual Setup
1. Create a **Web Service** for the backend:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
   - Set all backend environment variables

2. Create a **Static Site** for the frontend:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - Set frontend environment variables

## Important Notes

1. **Slack App Configuration**: Update your Slack app settings with the production redirect URI:
   - Redirect URI: `https://api-slack-app.onrender.com/api/auth/slack/callback`

2. **MongoDB**: Make sure your MongoDB Atlas cluster allows connections from all IPs (0.0.0.0/0) or specifically from Render's IP ranges.

3. **CORS**: The application is configured to handle CORS properly for the production domains.

## Local Development

For local development, use the following environment files:

### Backend (.env)
```
PORT=3000
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
SLACK_REDIRECT_URI=your_ngrok_url/api/auth/slack/callback
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
TOKEN_REFRESH_BUFFER_MINUTES=5
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```
