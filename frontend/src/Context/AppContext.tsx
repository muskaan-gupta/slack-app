import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User, type Channel, type ScheduledMessage } from '../types';
import { api } from '../api';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => Promise<void>;
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  scheduledMessages: ScheduledMessage[];
  addScheduledMessage: (message: Omit<ScheduledMessage, 'id' | 'createdAt'>) => void;
  cancelScheduledMessage: (id: string) => Promise<void>;
  isAuthenticated: boolean;
  currentView: string;
  setCurrentView: (view: string) => void;
  loading: boolean;
  error: string | null;
  refreshChannels: () => Promise<void>;
  refreshScheduledMessages: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  
  const [currentView, setCurrentView] = useState('compose');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to fetch channels from API
  const refreshChannels = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const channelsData = await api.getChannels();
      setChannels(channelsData);
    } catch (err: any) {
      console.error('Failed to fetch channels:', err);
      setError(err.message || 'Failed to fetch channels');
      // Fallback to mock data on error
      setChannels([
        { id: 'general', name: 'general', isPrivate: false, memberCount: 42 },
        { id: 'random', name: 'random', isPrivate: false, memberCount: 38 },
        { id: 'dev-team', name: 'dev-team', isPrivate: true, memberCount: 8 },
        { id: 'marketing', name: 'marketing', isPrivate: false, memberCount: 12 },
        { id: 'announcements', name: 'announcements', isPrivate: false, memberCount: 45 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch scheduled messages from API
  const refreshScheduledMessages = async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      const scheduledData = await api.getScheduledMessages();
      
      // Transform API data to match our frontend format
      const transformedMessages = scheduledData.map((msg: any) => ({
        id: msg._id,
        channelId: msg.channel,
        channelName: msg.channel, // Use channel ID as fallback, will be updated when channels load
        message: msg.message,
        scheduledFor: new Date(msg.scheduledTime),
        createdAt: new Date(msg.createdAt || Date.now()),
        status: msg.status
      }));
      
      setScheduledMessages(transformedMessages);
    } catch (err: any) {
      console.error('Failed to fetch scheduled messages:', err);
      // Don't show error for scheduled messages as it's not critical
    }
  };

  useEffect(() => {
    // Check if user is authenticated from localStorage only
    const savedUser = localStorage.getItem('slackUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('slackUser');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Fetch channels when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshChannels();
      refreshScheduledMessages();
    }
  }, [isAuthenticated]);

  // Update channel names in scheduled messages when channels are loaded
  useEffect(() => {
    if (channels.length > 0 && scheduledMessages.length > 0) {
      setScheduledMessages(prev => 
        prev.map(msg => ({
          ...msg,
          channelName: channels.find(c => c.id === msg.channelId)?.name || msg.channelId
        }))
      );
    }
  }, [channels]);

  const addScheduledMessage = (message: Omit<ScheduledMessage, 'id' | 'createdAt'>) => {
    const newMessage: ScheduledMessage = {
      ...message,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
    };
    setScheduledMessages(prev => [...prev, newMessage]);
    // Also refresh from API to sync with backend
    setTimeout(() => refreshScheduledMessages(), 1000);
  };

  const cancelScheduledMessage = async (id: string) => {
    try {
      await api.cancelScheduledMessage(id);
      // Refresh the scheduled messages after cancellation
      await refreshScheduledMessages();
    } catch (err: any) {
      console.error('Failed to cancel scheduled message:', err);
      // Fallback to local state update
      setScheduledMessages(prev => 
        prev.map(msg => 
          msg.id === id ? { ...msg, status: 'cancelled' } : msg
        )
      );
    }
  };

  const handleSetUser = async (newUser: User | null) => {
    setUser(newUser);
    setIsAuthenticated(!!newUser);
    if (newUser) {
      localStorage.setItem('slackUser', JSON.stringify(newUser));
    } else {
      // Clear local storage
      localStorage.removeItem('slackUser');
      // Clear channels and scheduled messages on logout
      setChannels([]);
      setScheduledMessages([]);
      // Call backend logout API
      try {
        await api.logout();
      } catch (error) {
        console.error('Backend logout failed:', error);
        // Continue with frontend logout even if backend fails
      }
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser: handleSetUser,
      channels,
      setChannels,
      scheduledMessages,
      addScheduledMessage,
      cancelScheduledMessage,
      isAuthenticated,
      currentView,
      setCurrentView,
      loading,
      error,
      refreshChannels,
      refreshScheduledMessages
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};