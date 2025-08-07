import mongoose, { Document, Schema } from 'mongoose';

interface IScheduledMessage extends Document {
  channel: string;
  message: string;
  scheduledTime: Date;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  sentAt?: Date;
  cancelledAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledMessageSchema = new Schema<IScheduledMessage>({
  channel: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 255
  },
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 4000 // Slack message limit
  },
  scheduledTime: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v: Date) {
        return v > new Date();
      },
      message: 'Scheduled time must be in the future'
    }
  },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'sent', 'cancelled', 'failed'],
    index: true // Index for faster queries
  },
  sentAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  error: {
    type: String,
    default: null,
    maxlength: 1000
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ScheduledMessageSchema.index({ scheduledTime: 1, status: 1 });
ScheduledMessageSchema.index({ createdAt: -1 });

// Virtual for checking if message is overdue
ScheduledMessageSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.scheduledTime < new Date();
});

// Pre-save middleware
ScheduledMessageSchema.pre('save', function(next) {
  // Set sentAt when status changes to sent
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  
  // Set cancelledAt when status changes to cancelled
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  next();
});

// Static methods
ScheduledMessageSchema.statics.findPendingMessages = function() {
  return this.find({ status: 'pending' }).sort({ scheduledTime: 1 });
};

ScheduledMessageSchema.statics.findOverdueMessages = function() {
  return this.find({ 
    status: 'pending',
    scheduledTime: { $lt: new Date() }
  });
};

export const ScheduledMessage = mongoose.model<IScheduledMessage>('ScheduledMessage', ScheduledMessageSchema);
export type { IScheduledMessage };   