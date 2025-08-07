import express from 'express';
import { handleSlackOAuth, handleLogout, debugOAuthConfig } from '../controllers/auth.controller';

const router = express.Router();

// Debug endpoint for OAuth configuration
router.get('/debug', debugOAuthConfig);

router.get('/slack', (req, res) => {
  const redirectUri = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=chat:write,chat:write.public,channels:read&redirect_uri=${process.env.SLACK_REDIRECT_URI}`;
  res.redirect(redirectUri);
});

// Use the controller function
router.get('/slack/callback', handleSlackOAuth);

// Logout endpoint
router.post('/logout', handleLogout);

export default router;   