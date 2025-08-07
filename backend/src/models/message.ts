   import mongoose, { Document, Schema } from 'mongoose';

   interface IScheduledMessage extends Document {
     channel: string;
     message: string;
     scheduledTime: Date;
     status: 'pending' | 'sent' | 'cancelled';
   }

   const ScheduledMessageSchema = new Schema<IScheduledMessage>({
     channel: { type: String, required: true },
     message: { type: String, required: true },
     scheduledTime: { type: Date, required: true },
     status: { type: String, default: 'pending', enum: ['pending', 'sent', 'cancelled'] }
   });

   export const ScheduledMessage = mongoose.model<IScheduledMessage>('ScheduledMessage', ScheduledMessageSchema);
   