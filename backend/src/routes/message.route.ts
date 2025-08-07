   import express from 'express';
   import { sendImmediateMessage, scheduleMessageAPI, getChannels, getScheduledMessages, cancelScheduledMessage } from '../controllers/message.controller';

   const router = express.Router();

   // Send immediate message
   router.post('/send', sendImmediateMessage);

   // Schedule a message
   router.post('/schedule', scheduleMessageAPI);

   // Get all channels
   router.get('/channels', getChannels);

   // Get scheduled messages
   router.get('/scheduled', getScheduledMessages);

   // Cancel a scheduled message
   router.delete('/scheduled/:id', cancelScheduledMessage);

   export default router;
   