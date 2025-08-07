import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api-slack-app.onrender.com", // Backend URL
  withCredentials: true, // Include credentials in cross-origin requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add response interceptor to handle CORS and other errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error - possible CORS issue:', error);
      throw new Error('Network connection failed. Please check if the backend server is running.');
    }
    return Promise.reject(error);
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
