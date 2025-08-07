import axios from 'axios';
import { Token } from '../models/Token';

// Helper to refresh expired tokens
const refreshSlackToken = async (refreshToken: string, teamId: string) => {
    try {
        const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
            params: {
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;
        
        // Update tokens in database
        await Token.findOneAndUpdate(
            { teamId },
            { 
                accessToken: access_token, 
                refreshToken: refresh_token,
                tokenExpiresAt: new Date(Date.now() + expires_in * 1000)
            },
            { upsert: true }
        );

        return access_token;
    } catch (err) {
        console.error('Failed to refresh Slack token:', err);
        throw new Error('Token refresh failed');
    }
};

// Centralized Slack API caller with token management
export const callSlackAPI = async (method: 'POST' | 'GET', endpoint: string, payload: object) => {
    try {
        let tokenDoc = await Token.findOne();
        if (!tokenDoc) throw new Error('No Slack token available');

        let accessToken = tokenDoc.accessToken;

        // Initial attempt with current token
        let response = await axios({
            method,
            url: `https://slack.com/api/${endpoint}`,
            headers: { Authorization: `Bearer ${accessToken}` },
            data: payload
        });

        // Handle token expiration (Slack returns 200 even for auth errors!)
        if (response.data.error === 'token_expired') {
            accessToken = await refreshSlackToken(tokenDoc.refreshToken, tokenDoc.teamId);
            
            // Retry with new token
            response = await axios({
                method,
                url: `https://slack.com/api/${endpoint}`,
                headers: { Authorization: `Bearer ${accessToken}` },
                data: payload
            });
        }

        if (!response.data.ok) {
            throw new Error(response.data.error || 'Slack API error');
        }

        return response.data;
    } catch (err) {
        console.error('Slack API call failed:', err);
        throw err;
    }
};

 interface SlackApi {
         postMessage(channel: string, text: string): Promise<any>;
         listChannels(): Promise<any>;
     }
// Pre-configured API methods
export const slackApi: SlackApi = {
    postMessage: (channel: string, text: string) =>
        callSlackAPI('POST', 'chat.postMessage', { channel, text }),

    listChannels: () =>
        callSlackAPI('GET', 'conversations.list', { types: 'public_channel' })
};
