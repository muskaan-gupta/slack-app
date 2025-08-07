import React, { useState } from 'react';
import { Send, Clock, Hash, Lock } from 'lucide-react';
import { useApp } from '../Context/AppContext';
import { api } from '../api';

const ComposeMessage: React.FC = () => {
  const { channels, addScheduledMessage } = useApp();
  const [selectedChannel, setSelectedChannel] = useState('');
  const [message, setMessage] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!selectedChannel || !message.trim()) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      if (isScheduled && scheduledDateTime) {
        // Schedule the message
        await api.scheduleMessage({
          channel: selectedChannel,
          message: message.trim(),
          scheduledTime: scheduledDateTime
        });

        // Add to local state for UI
        const selectedChannelData = channels.find(c => c.id === selectedChannel);
        addScheduledMessage({
          channelId: selectedChannel,
          channelName: selectedChannelData?.name || '',
          message: message.trim(),
          scheduledFor: new Date(scheduledDateTime),
          status: 'pending'
        });
        
        // Reset form
        setMessage('');
        setScheduledDateTime('');
        setIsScheduled(false);
        
        setSuccess('Message scheduled successfully!');
      } else {
        // Send immediate message
        await api.sendMessage({
          channel: selectedChannel,
          message: message.trim()
        });
        
        setMessage('');
        setSuccess('Message sent successfully!');
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
      // Clear success/error messages after 5 seconds
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Compose Message</h2>
          <p className="text-gray-600 dark:text-gray-400">Send a message to your Slack workspace</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Channel Selection */}
          <div>
            <label htmlFor="channel-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Channel
            </label>
            <select
              id="channel-select"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
            >
              <option value="">Choose a channel...</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.isPrivate ? (
                    <>🔒 {channel.name}</>
                  ) : (
                    <>#{channel.name}</>
                  )} {channel.memberCount && `(${channel.memberCount} members)`}
                </option>
              ))}
            </select>
          </div>

          {/* Message Input */}
          <div>
            <label htmlFor="message-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              id="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={6}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {message.length} characters
            </p>
          </div>

          {/* Schedule Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="schedule"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <label htmlFor="schedule" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              <Clock className="w-4 h-4" />
              <span>Schedule for later</span>
            </label>
          </div>

          {/* DateTime Input */}
          {isScheduled && (
            <div className="pl-7">
              <label htmlFor="datetime-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Schedule Date & Time
              </label>
              <input
                id="datetime-input"
                type="datetime-local"
                value={scheduledDateTime}
                min={getMinDateTime()}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="w-full max-w-xs px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                title="Select date and time for scheduling the message"
              />
            </div>
          )}

          {/* Selected Channel Preview */}
          {selectedChannel && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Sending to:</span>
                {channels.find(c => c.id === selectedChannel)?.isPrivate ? (
                  <div className="flex items-center space-x-1">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">{channels.find(c => c.id === selectedChannel)?.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Hash className="w-4 h-4" />
                    <span className="font-medium">{channels.find(c => c.id === selectedChannel)?.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendMessage}
              disabled={!selectedChannel || !message.trim() || sending || (isScheduled && !scheduledDateTime)}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{isScheduled ? 'Scheduling...' : 'Sending...'}</span>
                </>
              ) : (
                <>
                  {isScheduled ? <Clock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>{isScheduled ? 'Schedule Message' : 'Send Message'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposeMessage;