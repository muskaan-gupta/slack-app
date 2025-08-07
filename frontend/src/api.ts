import axios from "axios";

// Environment-based API URL
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const API = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging in development
API.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Response Error:', error.response?.data || error.message);
    }
    
    // Handle network errors
    if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    // Handle API errors
    const message = error.response?.data?.error || error.response?.data?.message || 'An error occurred';
    throw new Error(message);
  }
);

// Type definitions
interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  memberCount: number;
}

interface SendMessageRequest {
  channel: string;
  message: string;
}

interface ScheduleMessageRequest {
  channel: string;
  message: string;
  scheduledTime: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// API client functions
export const api = {
  // Fetch all channels from Slack
  async getChannels(): Promise<Channel[]> {
    try {
      const response = await API.get<ApiResponse<Channel[]>>('/api/messages/channels');
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch channels:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch channels');
    }
  },

  // Send immediate message
  async sendMessage(data: SendMessageRequest): Promise<any> {
    try {
      const response = await API.post<ApiResponse<any>>('/api/messages/send', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  },

  // Schedule a message
  async scheduleMessage(data: ScheduleMessageRequest): Promise<any> {
    try {
      const response = await API.post<ApiResponse<any>>('/api/messages/schedule', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to schedule message:', error);
      throw new Error(error.response?.data?.error || 'Failed to schedule message');
    }
  },

  // Get scheduled messages (placeholder for future implementation)
  async getScheduledMessages(): Promise<any[]> {
    try {
      const response = await API.get<ApiResponse<any[]>>('/api/messages/scheduled');
      return response.data.data;
    } catch (error: any) {
      // Return empty array if endpoint doesn't exist yet
      console.warn('Scheduled messages endpoint error:', error.message);
      return [];
    }
  },

  // Cancel a scheduled message
  async cancelScheduledMessage(messageId: string): Promise<any> {
    try {
      const response = await API.delete<ApiResponse<any>>(`/api/messages/scheduled/${messageId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to cancel scheduled message:', error);
      throw new Error(error.response?.data?.error || 'Failed to cancel scheduled message');
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await API.post('/api/auth/logout');
    } catch (error: any) {
      console.error('Failed to logout:', error);
      // Don't throw error for logout - we want to clear frontend state regardless
    }
  }
};

export default API;
export type { Channel, SendMessageRequest, ScheduleMessageRequest };
