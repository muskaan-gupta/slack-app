// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import axios from "axios";
import { Token } from "../models/Token";

// Configure axios with retry logic and better timeouts
const axiosConfig = {
  timeout: 15000, // 15 seconds
  retry: 3,
  retryDelay: 1000
};

const clientId = process.env.SLACK_CLIENT_ID!;
const clientSecret = process.env.SLACK_CLIENT_SECRET!;
const redirectUri = process.env.SLACK_REDIRECT_URI!;

// Debug endpoint to check OAuth configuration
export const debugOAuthConfig = async (req: Request, res: Response) => {
  res.json({
    clientId,
    redirectUri,
    hasClientSecret: !!clientSecret,
    clientSecretLength: clientSecret?.length || 0
  });
};

export const handleLogout = async (req: Request, res: Response) => {
  try {
    // Get the team ID from query params or request body
    const { teamId } = req.query as { teamId?: string };
    
    try {
      if (teamId) {
        // Delete specific team's tokens
        await Token.findOneAndDelete({ teamId });
        console.log(`🗑️ Deleted tokens for team: ${teamId}`);
      } else {
        // Delete all tokens (for simplicity in this app)
        await Token.deleteMany({});
        console.log('🗑️ Deleted all tokens');
      }
    } catch (dbError) {
      console.warn('Database operation failed during logout, but proceeding:', dbError);
      // Continue with logout even if database operations fail
    }

    res.json({ success: true, message: 'Logout successful' });
  } catch (err) {
    console.error('❌ Logout error:', err);
    // Always return success for logout to allow frontend to clear state
    res.json({ success: true, message: 'Logout completed (some operations may have failed)' });
  }
};

export const handleSlackOAuth = async (req: Request, res: Response) => {
  console.log('=== OAUTH CALLBACK RECEIVED ===');
  console.log('Query params:', req.query);
  
  const { code } = req.query;

  if (!code) {
    console.log('❌ No code parameter provided');
    return res.status(400).json({ error: "Missing code parameter" });
  }

  console.log('✅ Code received:', code);

  try {
    // Step 1: Exchange code for tokens
    console.log('🔄 Making request to Slack OAuth API...');
    console.log('Request details:', {
      url: 'https://slack.com/api/oauth.v2.access',
      client_id: clientId,
      redirect_uri: redirectUri,
      code: typeof code === 'string' ? code.substring(0, 10) + '...' : code // Log partial code for debugging
    });
    
    // Try using URLSearchParams for better compatibility
    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('code', code as string);
    formData.append('redirect_uri', redirectUri);
    
    let tokenResponse;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`🔄 Attempt ${attempts + 1}/${maxAttempts} to call Slack OAuth API...`);
        
        tokenResponse = await axios.post(
          "https://slack.com/api/oauth.v2.access",
          formData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 15000, // 15 second timeout
          }
        );
        
        console.log('✅ Successfully received response from Slack API');
        break; // Success, exit retry loop
        
      } catch (requestError) {
        attempts++;
        console.error(`❌ Attempt ${attempts} failed:`, requestError);
        
        if (attempts >= maxAttempts) {
          throw requestError; // Re-throw the last error
        }
        
        // Wait before retrying
        console.log(`⏳ Waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!tokenResponse) {
      throw new Error('Failed to get response from Slack API after all retries');
    }

    const data = tokenResponse.data;
    console.log('Slack OAuth Response:', data);
    if (!data.ok) {
      console.error('Slack OAuth Error:', data.error);
      return res.status(400).json({ error: data.error, details: data });
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      authed_user,
      team,
    } = data;

    console.log('✅ Token data extracted');
    console.log('Access token received:', !!access_token);
    console.log('Expires in:', expires_in);

    // Bot tokens from Slack don't expire, so we set a far future date
    const tokenExpiresAt = expires_in 
      ? new Date(Date.now() + expires_in * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    // Step 2: Save to DB
    console.log('💾 Saving token to database...');
    await Token.findOneAndUpdate(
      { teamId: team.id },
      {
        teamId: team.id,
        teamName: team.name,
        userId: authed_user.id,
        accessToken: access_token,
        refreshToken: refresh_token || '', // Bot tokens might not have refresh tokens
        tokenExpiresAt: tokenExpiresAt,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Token saved successfully');

    return res.redirect(`${process.env.CLIENT_URL}/success`); // Redirect to frontend
  } catch (err) {
    console.error("❌ OAuth error:", err);
    
    // Handle different types of errors
    if (axios.isAxiosError(err)) {
      if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
        console.error('Network timeout error - Slack API may be unreachable');
        return res.status(500).json({ 
          error: "Network timeout", 
          details: "Unable to connect to Slack API. Please check your internet connection and try again.",
          code: err.code
        });
      } else if (err.response) {
        console.error('Slack API error response:', err.response.data);
        return res.status(err.response.status).json({ 
          error: "Slack API Error", 
          details: err.response.data,
          status: err.response.status
        });
      } else if (err.request) {
        console.error('No response received from Slack API');
        return res.status(500).json({ 
          error: "No response from Slack", 
          details: "Request was made but no response received from Slack API"
        });
      }
    }
    
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorDetails = (err as any)?.response?.data || errorMessage;
    console.error("Error details:", errorDetails);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: errorDetails 
    });
  }
};
