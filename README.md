# Slack Connect

A full-stack Slack messaging and scheduling application built with React, TypeScript, Node.js, and Express.

## 🚀 Features

- **Slack Integration**: Send messages to Slack channels
- **Message Scheduling**: Schedule messages for future delivery
- **Channel Management**: Browse and select Slack channels
- **Real-time Clock**: Live clock display in the dashboard
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router DOM** for routing
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **Slack Web API** integration
- **Node-cron** for message scheduling
- **CORS** for cross-origin requests

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- MongoDB Atlas account (for production)
- Slack App with appropriate permissions

## 🔧 Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd slack-connect
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment
Create `backend/.env` from `backend/.env.example`:
```bash
PORT=3000
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
SLACK_REDIRECT_URI=http://localhost:3000/api/auth/slack/callback
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/slack-connect
TOKEN_REFRESH_BUFFER_MINUTES=5
NODE_ENV=development
```

#### Frontend Environment
Create `frontend/.env.local` from `frontend/.env.example`:
```bash
VITE_API_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Slack App Configuration

1. Go to [Slack API Dashboard](https://api.slack.com/apps)
2. Create a new Slack app or use existing one
3. Configure OAuth & Permissions:
   - Add redirect URL: `http://localhost:3000/api/auth/slack/callback`
   - Add scopes: `chat:write`, `channels:read`, `groups:read`
4. Get your credentials from "Basic Information" and "OAuth & Permissions"

### 5. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🚀 Production Deployment on Render

### Prerequisites
- Render account
- MongoDB Atlas database
- Slack app configured for production

### 1. Prepare Environment Variables

#### Backend Environment Variables (Render Service)
```bash
NODE_ENV=production
PORT=5000
SLACK_CLIENT_ID=your_production_slack_client_id
SLACK_CLIENT_SECRET=your_production_slack_client_secret
SLACK_SIGNING_SECRET=your_production_slack_signing_secret
SLACK_REDIRECT_URI=https://your-backend-url.onrender.com/api/auth/slack/callback
CLIENT_URL=https://your-frontend-url.onrender.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
TOKEN_REFRESH_BUFFER_MINUTES=5
```

#### Frontend Environment Variables (Render Static Site)
```bash
VITE_API_URL=https://your-backend-url.onrender.com
NODE_ENV=production
```

### 2. Deploy Backend to Render

1. **Create Web Service** on Render
2. **Connect Repository** and select your repo
3. **Configure Service**:
   - Name: `slack-connect-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Root Directory: Leave empty (monorepo setup)
4. **Add Environment Variables** from above list
5. **Deploy**

### 3. Deploy Frontend to Render

1. **Create Static Site** on Render
2. **Connect Repository** and select your repo
3. **Configure Site**:
   - Name: `slack-connect-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Root Directory: Leave empty (monorepo setup)
4. **Add Environment Variables** from above list
5. **Deploy**

### 4. Update Slack App Configuration

After deployment, update your Slack app:
- Redirect URI: `https://your-backend-url.onrender.com/api/auth/slack/callback`
- Request URL (if using events): `https://your-backend-url.onrender.com/api/slack/events`

## 🐳 Docker Deployment (Alternative)

### Development with Docker Compose
```bash
# Start all services
docker-compose up

# Build and start in detached mode
docker-compose up -d --build

# Stop services
docker-compose down
```

### Production Docker Build
```bash
# Build backend image
cd backend
docker build -t slack-connect-backend .

# Build frontend image
cd ../frontend
docker build -t slack-connect-frontend .
```

## 🔧 Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run type-check` - Check TypeScript types

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Check TypeScript types

### Root
- `./scripts/build.sh` (Linux/Mac) - Build both frontend and backend
- `./scripts/build.bat` (Windows) - Build both frontend and backend

## 🏗️ Project Structure

```
slack-connect/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Utility functions
│   │   ├── app.ts             # Express app configuration
│   │   └── server.ts          # Server entry point
│   ├── dist/                  # Compiled JavaScript (generated)
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── Context/           # React contexts
│   │   ├── types/             # TypeScript types
│   │   ├── api.ts             # API client
│   │   └── main.tsx           # Entry point
│   ├── dist/                  # Built assets (generated)
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── scripts/                    # Build scripts
├── docker-compose.yml          # Docker Compose configuration
├── render.yaml                 # Render deployment configuration
└── README.md
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/slack` - Initiate Slack OAuth
- `GET /api/auth/slack/callback` - Handle OAuth callback
- `POST /api/auth/logout` - Logout user

### Messages
- `GET /api/messages/channels` - Get Slack channels
- `POST /api/messages/send` - Send immediate message
- `POST /api/messages/schedule` - Schedule message
- `GET /api/messages/scheduled` - Get scheduled messages
- `DELETE /api/messages/scheduled/:id` - Cancel scheduled message

### Health
- `GET /api/health` - Health check endpoint
- `GET /` - API status

## 🚨 Environment Variables Reference

### Required Backend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `SLACK_CLIENT_ID` | Slack app client ID | `1234567890.1234567890` |
| `SLACK_CLIENT_SECRET` | Slack app client secret | `abc123def456...` |
| `SLACK_SIGNING_SECRET` | Slack app signing secret | `xyz789...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `CLIENT_URL` | Frontend URL | `https://app.onrender.com` |

### Optional Backend Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `TOKEN_REFRESH_BUFFER_MINUTES` | Token refresh buffer | `5` |
| `CORS_ORIGIN` | Allowed CORS origins | `CLIENT_URL` value |

### Required Frontend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.onrender.com` |

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CLIENT_URL` matches your frontend URL exactly
   - Check CORS configuration in `app.ts`

2. **Database Connection**
   - Verify MongoDB URI format
   - Check network access in MongoDB Atlas
   - Ensure IP address is whitelisted

3. **Slack API Issues**
   - Verify Slack app credentials
   - Check redirect URI configuration
   - Ensure proper scopes are granted

4. **Build Failures**
   - Clear node_modules and reinstall dependencies
   - Check Node.js and npm versions
   - Verify environment variables are set

### Debugging

1. **Enable Debug Logging**
   ```bash
   # Backend
   DEBUG=* npm run dev
   
   # Frontend (check browser console)
   VITE_DEBUG=true npm run dev
   ```

2. **Check Health Endpoints**
   - Backend: `GET /api/health`
   - Frontend: Check if site loads

3. **Monitor Logs**
   - Render: Check service logs in dashboard
   - Local: Check terminal output

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.