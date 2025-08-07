# Slack Connect - Message Scheduling Application

A full-stack web application that integrates with Slack to allow users to schedule and send messages to Slack channels. Built with React (TypeScript) frontend and Node.js/Express backend.

## 🌟 Features

- **Slack OAuth Integration**: Secure authentication with Slack workspace
- **Real-time Channel List**: Fetch and display available Slack channels
- **Message Scheduling**: Schedule messages for future delivery
- **Immediate Message Sending**: Send messages instantly to selected channels
- **Scheduled Message Management**: View, manage, and cancel scheduled messages
- **Responsive Design**: Modern UI with Tailwind CSS
- **Live Clock**: Real-time clock display for scheduling reference

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router DOM for navigation
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React for modern iconography

### Backend (Node.js + Express + TypeScript)
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Slack OAuth 2.0
- **Job Scheduling**: Node-cron for message scheduling
- **Environment**: TypeScript for type safety

## 🚀 Live Deployment

- **Frontend**: [https://the-slack-app.onrender.com](https://the-slack-app.onrender.com)
- **Backend API**: [https://api-slack-app.onrender.com](https://api-slack-app.onrender.com)

## 📁 Project Structure

```
slack-connect/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── AuthPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MessageComposer.tsx
│   │   │   ├── ScheduledMessages.tsx
│   │   │   └── ...
│   │   ├── Context/         # React context providers
│   │   ├── types/           # TypeScript type definitions
│   │   └── api.ts           # API service layer
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   └── scheduller.controller.ts
│   │   ├── models/          # MongoDB models
│   │   │   ├── message.ts
│   │   │   └── Token.ts
│   │   ├── routes/          # API routes
│   │   │   ├── auth.route.ts
│   │   │   ├── message.route.ts
│   │   │   └── schedule.route.ts
│   │   ├── utils/           # Utility functions
│   │   └── app.ts           # Express app configuration
│   └── package.json
├── render.yaml              # Render deployment configuration
└── README.md
```

## 🛠️ Technology Stack

### Frontend Dependencies
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.7.1",
  "axios": "^1.11.0",
  "lucide-react": "^0.536.0",
  "tailwindcss": "^3.4.1",
  "typescript": "~5.8.3",
  "vite": "^7.0.4"
}
```

### Backend Dependencies
```json
{
  "express": "^4.21.2",
  "mongoose": "^8.17.0",
  "axios": "^1.11.0",
  "cors": "^2.8.5",
  "dotenv": "^17.2.1",
  "node-cron": "^4.2.1",
  "node-schedule": "^2.1.1",
  "typescript": "^5.9.2"
}
```

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB database
- Slack app credentials

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/chinmaypandey62/slack.git
   cd slack-connect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file with your credentials
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your API URLs
   ```

4. **Environment Variables**

   **Backend (.env)**
   ```env
   PORT=3000
   SLACK_CLIENT_ID=your_slack_client_id
   SLACK_CLIENT_SECRET=your_slack_client_secret
   SLACK_SIGNING_SECRET=your_slack_signing_secret
   SLACK_REDIRECT_URI=http://localhost:3000/api/auth/slack/callback
   CLIENT_URL=http://localhost:5173
   API_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/slack-connect
   ```

   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_AUTH_URL=http://localhost:3000/api/auth/slack
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 🔑 Slack App Configuration

1. **Create a Slack App**
   - Go to [Slack API](https://api.slack.com/apps)
   - Create new app "From scratch"
   - Choose your workspace

2. **Configure OAuth & Permissions**
   - Add redirect URL: `http://localhost:3000/api/auth/slack/callback`
   - Add Bot Token Scopes:
     - `chat:write`
     - `chat:write.public`
     - `channels:read`

3. **Get Credentials**
   - Copy Client ID, Client Secret, and Signing Secret
   - Add them to your `.env` file

## 🚀 Deployment

The application is configured for deployment on Render.com using the included `render.yaml` file.

### Deployment Configuration

**Backend Service:**
```yaml
- type: web
  name: slack-app-backend
  env: node
  rootDir: backend
  buildCommand: npm install && npm run build
  startCommand: npm start
```

**Frontend Service:**
```yaml
- type: web
  name: slack-app-frontend
  env: static
  rootDir: frontend
  buildCommand: npm install && npm run build
  staticPublishPath: dist
```

### Production Environment Variables

Set these in your Render dashboard:
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `SLACK_SIGNING_SECRET`
- `MONGODB_URI`
- `SLACK_REDIRECT_URI`
- `CLIENT_URL`
- `API_URL`

## 📋 API Endpoints

### Authentication
- `GET /api/auth/slack` - Initiate Slack OAuth
- `GET /api/auth/slack/callback` - OAuth callback handler
- `POST /api/auth/logout` - Logout user

### Messages
- `POST /api/messages/send` - Send immediate message
- `POST /api/messages/schedule` - Schedule a message
- `GET /api/messages/channels` - Get available channels
- `GET /api/messages/scheduled` - Get scheduled messages
- `DELETE /api/messages/scheduled/:id` - Cancel scheduled message

### Health Check
- `GET /api/health` - Server health status

## 🎯 Usage Flow

1. **Authentication**: User clicks "Connect with Slack" to authenticate
2. **Channel Selection**: View and select from available Slack channels
3. **Message Composition**: Write message content
4. **Scheduling**: Choose to send immediately or schedule for later
5. **Management**: View and manage scheduled messages

## 🔧 Troubleshooting

### Common Issues

1. **Express v5 Path-to-Regexp Error**
   - Solution: Use Express v4.21.2 instead of v5
   - Fix: `npm install express@^4.21.2`

2. **SPA Routing Issues (404 on refresh)**
   - Add redirect rules in Render dashboard
   - Source: `/*`, Destination: `/index.html`, Type: Rewrite

3. **MongoDB Connection Timeout**
   - Check connection string and IP whitelist
   - Verify network connectivity

4. **Slack OAuth Redirect Mismatch**
   - Ensure redirect URI matches in Slack app settings
   - Check environment variables

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Author

**Muskan Gupta** - [GitHub](https://github.com/muskaan-gupta)

## 🙏 Acknowledgments

- Slack API for webhook integration
- Render.com for hosting platform
- React and Node.js communities for excellent documentation

