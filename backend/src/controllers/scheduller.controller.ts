import { Request, Response } from 'express';
import { ScheduledMessage } from '../models/message';
import { scheduleJob } from 'node-schedule';
import { sendMessage } from './message.controller'; // Reuse sendMessage

// Get all scheduled messages
export const getScheduledMessages = async (req: Request, res: Response) => {
    try {
        const messages = await ScheduledMessage.find({ status: 'pending' });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scheduled messages' });
    }
};

// Cancel a scheduled message
export const cancelScheduledMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const message = await ScheduledMessage.findByIdAndUpdate(
            id,
            { status: 'cancelled' },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.json({ message: 'Scheduled message cancelled successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to cancel message' });
    }
};

// Worker to process pending messages (should run on server start)
export const initScheduledMessagesWorker = async () => {
    const pendingMessages = await ScheduledMessage.find({ 
        status: 'pending',
        scheduledTime: { $gte: new Date() } // Only future messages
    });

    pendingMessages.forEach(message => {
        scheduleJob(message.scheduledTime, async () => {
            try {
                await sendMessage(message.channel, message.message);
                await ScheduledMessage.findByIdAndUpdate(
                    message._id,
                    { status: 'sent' }
                );
            } catch (err) {
                console.error('Failed to send scheduled message:', err);
            }
        });
    });
};
