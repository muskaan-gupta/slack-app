
import { Request, Response } from 'express';
import schedule from 'node-schedule';
import { ScheduledMessage } from '../models/message';
import { Token } from '../models/Token';
import { slackApi } from '../utils/slack.api';

// Validation helpers
const validateMessageInput = (channel: string, message: string) => {
  if (!channel || typeof channel !== 'string' || channel.trim().length === 0) {
    throw new Error('Valid channel is required');
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Valid message is required');
  }
  if (message.length > 4000) { // Slack message limit
    throw new Error('Message is too long (max 4000 characters)');
  }
};

export const sendMessage = async (channel: string, message: string) => {
  validateMessageInput(channel, message);
  
  const token = await Token.findOne();
  if (!token) {
    throw new Error("Authentication failed - no Slack token found");
  }
 
  return await slackApi.postMessage(channel.trim(), message.trim());
};

export const scheduleMessage = async (channel: string, message: string, scheduledTime: Date) => {
  validateMessageInput(channel, message);
  
  // Validate scheduled time
  const now = new Date();
  if (scheduledTime <= now) {
    throw new Error('Scheduled time must be in the future');
  }
  
  // Don't allow scheduling more than 1 year in advance
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (scheduledTime > oneYearFromNow) {
    throw new Error('Cannot schedule messages more than 1 year in advance');
  }

  const scheduledMessage = await ScheduledMessage.create({ 
    channel: channel.trim(), 
    message: message.trim(), 
    scheduledTime,
    status: 'pending'
  });
  
  // Schedule the job
  const job = schedule.scheduleJob(scheduledTime, async () => {
    try {
      console.log(`Executing scheduled message: ${scheduledMessage._id}`);
      await sendMessage(channel, message);
      await ScheduledMessage.findByIdAndUpdate(scheduledMessage._id, { 
        status: 'sent',
        sentAt: new Date()
      });
      console.log(`Scheduled message sent successfully: ${scheduledMessage._id}`);
    } catch (error) {
      console.error(`Failed to send scheduled message ${scheduledMessage._id}:`, error);
      await ScheduledMessage.findByIdAndUpdate(scheduledMessage._id, { 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Store job reference for potential cancellation
  if (job) {
    console.log(`Scheduled message created: ${scheduledMessage._id} for ${scheduledTime}`);
  }

  return scheduledMessage;
};

// Controller for sending immediate messages via API
export const sendImmediateMessage = async (req: Request, res: Response) => {
  try {
    const { channel, message } = req.body;
    
    validateMessageInput(channel, message);

    const result = await sendMessage(channel, message);
    
    console.log(`Immediate message sent to channel ${channel}`);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Send message error:', error);
    const statusCode = error.message.includes('Valid') || error.message.includes('required') || error.message.includes('too long') ? 400 : 500;
    res.status(statusCode).json({ 
      success: false, 
      error: error.message || 'Failed to send message' 
    });
  }
};

// Controller for scheduling messages via API
export const scheduleMessageAPI = async (req: Request, res: Response) => {
  try {
    const { channel, message, scheduledTime } = req.body;
    
    if (!scheduledTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'Scheduled time is required' 
      });
    }

    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid scheduled time format' 
      });
    }

    const result = await scheduleMessage(channel, message, scheduledDate);
    
    console.log(`Message scheduled for ${scheduledDate} in channel ${channel}`);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Schedule message error:', error);
    const statusCode = error.message.includes('Valid') || 
                      error.message.includes('required') || 
                      error.message.includes('future') || 
                      error.message.includes('advance') || 
                      error.message.includes('too long') ? 400 : 500;
    res.status(statusCode).json({ 
      success: false, 
      error: error.message || 'Failed to schedule message' 
    });
  }
};

// Controller for fetching Slack channels
export const getChannels = async (req: Request, res: Response) => {
  try {
    const channels = await slackApi.listChannels();
    
    if (!channels || !channels.channels) {
      return res.status(500).json({ 
        success: false, 
        error: 'Invalid response from Slack API' 
      });
    }
    
    // Transform Slack channel data to match our frontend format
    const formattedChannels = channels.channels
      .filter((channel: any) => !channel.is_archived) // Filter out archived channels
      .map((channel: any) => ({
        id: channel.id,
        name: channel.name,
        isPrivate: channel.is_private || false,
        memberCount: channel.num_members || 0
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name)); // Sort alphabetically

    console.log(`Retrieved ${formattedChannels.length} channels`);
    res.json({ success: true, data: formattedChannels });
  } catch (error: any) {
    console.error('Get channels error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch channels' 
    });
  }
};

// Controller for fetching scheduled messages
export const getScheduledMessages = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const scheduledMessages = await ScheduledMessage.find({ 
      status: { $in: ['pending', 'failed'] }
    })
      .sort({ scheduledTime: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ScheduledMessage.countDocuments({ 
      status: { $in: ['pending', 'failed'] }
    });

    console.log(`Retrieved ${scheduledMessages.length} scheduled messages`);
    res.json({ 
      success: true, 
      data: scheduledMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Get scheduled messages error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch scheduled messages' 
    });
  }
};

// Controller for cancelling scheduled messages
export const cancelScheduledMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid message ID format' 
      });
    }
    
    const scheduledMessage = await ScheduledMessage.findById(id);
    if (!scheduledMessage) {
      return res.status(404).json({ 
        success: false, 
        error: 'Scheduled message not found' 
      });
    }

    if (scheduledMessage.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot cancel a message that is not pending' 
      });
    }

    // Update status to cancelled
    scheduledMessage.status = 'cancelled';
    scheduledMessage.cancelledAt = new Date();
    await scheduledMessage.save();

    // Cancel the scheduled job if it exists
    const jobs = schedule.scheduledJobs;
    Object.keys(jobs).forEach(jobName => {
      if (jobName.includes(id)) {
        jobs[jobName].cancel();
        console.log(`Cancelled scheduled job for message: ${id}`);
      }
    });

    console.log(`Scheduled message cancelled: ${id}`);
    res.json({ success: true, data: scheduledMessage });
  } catch (error: any) {
    console.error('Cancel scheduled message error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to cancel scheduled message' 
    });
  }
};
   