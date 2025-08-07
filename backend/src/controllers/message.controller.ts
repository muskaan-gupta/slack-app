
import { Request, Response } from 'express';
import schedule from 'node-schedule';
import { ScheduledMessage } from '../models/message';
import { Token } from '../models/Token';
import { slackApi } from '../utils/slack.api';

export const sendMessage = async (channel: string, message: string) => {
  const token = await Token.findOne();
  if (!token) throw new Error("Authentication failed");
 
  return await slackApi.postMessage(channel, message);
};

export const scheduleMessage = async (channel: string, message: string, scheduledTime: Date) => {
  const scheduledMessage = await ScheduledMessage.create({ channel, message, scheduledTime });
  
  schedule.scheduleJob(scheduledTime, async () => {
    await sendMessage(channel, message);
    await scheduledMessage.updateOne({ status: 'sent' });
  });

  return scheduledMessage;
};

// New controller for sending immediate messages via API
export const sendImmediateMessage = async (req: Request, res: Response) => {
  try {
    const { channel, message } = req.body;
    
    if (!channel || !message) {
      return res.status(400).json({ error: 'Channel and message are required' });
    }

    const result = await sendMessage(channel, message);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
};

// New controller for scheduling messages via API
export const scheduleMessageAPI = async (req: Request, res: Response) => {
  try {
    const { channel, message, scheduledTime } = req.body;
    
    if (!channel || !message || !scheduledTime) {
      return res.status(400).json({ error: 'Channel, message, and scheduledTime are required' });
    }

    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const result = await scheduleMessage(channel, message, scheduledDate);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Schedule message error:', error);
    res.status(500).json({ error: error.message || 'Failed to schedule message' });
  }
};

// New controller for fetching Slack channels
export const getChannels = async (req: Request, res: Response) => {
  try {
    const channels = await slackApi.listChannels();
    
    // Transform Slack channel data to match our frontend format
    const formattedChannels = channels.channels.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
      isPrivate: channel.is_private || false,
      memberCount: channel.num_members || 0
    }));

    res.json({ success: true, data: formattedChannels });
  } catch (error: any) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch channels' });
  }
};

// New controller for fetching scheduled messages
export const getScheduledMessages = async (req: Request, res: Response) => {
  try {
    const scheduledMessages = await ScheduledMessage.find({ status: 'pending' })
      .sort({ scheduledTime: 1 });
    
    res.json({ success: true, data: scheduledMessages });
  } catch (error: any) {
    console.error('Get scheduled messages error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch scheduled messages' });
  }
};

// New controller for cancelling scheduled messages
export const cancelScheduledMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const scheduledMessage = await ScheduledMessage.findById(id);
    if (!scheduledMessage) {
      return res.status(404).json({ error: 'Scheduled message not found' });
    }

    if (scheduledMessage.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel a message that is not pending' });
    }

    // Update status to cancelled
    scheduledMessage.status = 'cancelled';
    await scheduledMessage.save();

    res.json({ success: true, data: scheduledMessage });
  } catch (error: any) {
    console.error('Cancel scheduled message error:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel scheduled message' });
  }
};
   