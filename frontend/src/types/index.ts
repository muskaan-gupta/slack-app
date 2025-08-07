export interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  memberCount?: number;
}

export interface ScheduledMessage {
  id: string;
  channelId: string;
  channelName: string;
  message: string;
  scheduledFor: Date;
  createdAt: Date;
  status: 'pending' | 'sent' | 'cancelled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  workspace: string;
  avatar?: string;
}

export interface SlackWorkspace {
  id: string;
  name: string;
  domain: string;
  isConnected: boolean;
}