import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Hash, Lock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../Context/AppContext';
import { api } from '../api';

interface ScheduledMessage {
  _id: string;
  channel: string;
  message: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'cancelled';
}

const ScheduledMessagesList: React.FC = () => {
  const { channels } = useApp();
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScheduledMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const messages = await api.getScheduledMessages();
      setScheduledMessages(messages);
    } catch (err: any) {
      console.error('Failed to fetch scheduled messages:', err);
      setError(err.message || 'Failed to fetch scheduled messages');
    } finally {
      setLoading(false);
    }
  };

  const cancelMessage = async (messageId: string) => {
    try {
      await api.cancelScheduledMessage(messageId);
      // Refresh the list after cancellation
      await fetchScheduledMessages();
    } catch (err: any) {
      console.error('Failed to cancel message:', err);
      setError(err.message || 'Failed to cancel message');
    }
  };

  useEffect(() => {
    fetchScheduledMessages();
  }, []);

  const getChannelIcon = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.isPrivate ? Lock : Hash;
  };

  const getChannelName = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.name || channelId;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-blue-600 dark:text-blue-400';
      case 'sent':
        return 'text-green-600 dark:text-green-400';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'sent':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  const pendingMessages = scheduledMessages.filter(msg => msg.status === 'pending');
  const sentMessages = scheduledMessages.filter(msg => msg.status === 'sent');
  const cancelledMessages = scheduledMessages.filter(msg => msg.status === 'cancelled');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Scheduled Messages</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage all your scheduled messages</p>
            </div>
            <button
              onClick={fetchScheduledMessages}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading scheduled messages...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              <p className="font-medium">Failed to load scheduled messages</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={fetchScheduledMessages}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && scheduledMessages.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No scheduled messages</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Create your first scheduled message from the compose page
              </p>
            </div>
          )}

          {/* Messages Content */}
          {!loading && !error && scheduledMessages.length > 0 && (
            <>
              {/* Pending Messages */}
              {pendingMessages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Pending ({pendingMessages.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {pendingMessages.map((message) => {
                      const ChannelIcon = getChannelIcon(message.channel);
                      const StatusIcon = getStatusIcon(message.status);
                      
                      return (
                        <div
                          key={message._id}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <ChannelIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  #{getChannelName(message.channel)}
                                </span>
                                <StatusIcon className={`w-4 h-4 ${getStatusColor(message.status)}`} />
                                <span className={`text-sm font-medium ${getStatusColor(message.status)}`}>
                                  {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-3">{message.message}</p>
                              <div className="flex flex-col space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <span>Scheduled for: {formatDateTime(message.scheduledTime)}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <button
                                onClick={() => cancelMessage(message._id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200"
                                title="Cancel scheduled message"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sent Messages */}
              {sentMessages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Sent ({sentMessages.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {sentMessages.map((message) => {
                      const ChannelIcon = getChannelIcon(message.channel);
                      const StatusIcon = getStatusIcon(message.status);
                      
                      return (
                        <div
                          key={message._id}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <ChannelIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  #{getChannelName(message.channel)}
                                </span>
                                <StatusIcon className={`w-4 h-4 ${getStatusColor(message.status)}`} />
                                <span className={`text-sm font-medium ${getStatusColor(message.status)}`}>
                                  {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-3">{message.message}</p>
                              <div className="flex flex-col space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <span>Sent at: {formatDateTime(message.scheduledTime)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancelled Messages */}
              {cancelledMessages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>Cancelled ({cancelledMessages.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {cancelledMessages.map((message) => {
                      const ChannelIcon = getChannelIcon(message.channel);
                      const StatusIcon = getStatusIcon(message.status);
                      
                      return (
                        <div
                          key={message._id}
                          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <ChannelIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  #{getChannelName(message.channel)}
                                </span>
                                <StatusIcon className={`w-4 h-4 ${getStatusColor(message.status)}`} />
                                <span className={`text-sm font-medium ${getStatusColor(message.status)}`}>
                                  {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-3">{message.message}</p>
                              <div className="flex flex-col space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <span>Was scheduled for: {formatDateTime(message.scheduledTime)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduledMessagesList;