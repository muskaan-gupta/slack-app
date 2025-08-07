import React from 'react';
import { Hash, Lock, Users, RefreshCw } from 'lucide-react';
import { useApp } from '../Context/AppContext';

const ChannelsList: React.FC = () => {
  const { channels, loading, error, refreshChannels } = useApp();

  const publicChannels = channels.filter(channel => !channel.isPrivate);
  const privateChannels = channels.filter(channel => channel.isPrivate);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Channels</h2>
              <p className="text-gray-600 dark:text-gray-400">Available channels in your workspace</p>
            </div>
            <button
              onClick={refreshChannels}
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
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading channels...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              <p className="font-medium">Failed to load channels</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={refreshChannels}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Channels Content */}
          {!loading && !error && (
            <>
              {/* Public Channels */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-green-600" />
                  <span>Public Channels ({publicChannels.length})</span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {publicChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{channel.name}</span>
                      </div>
                      {channel.memberCount && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{channel.memberCount} members</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {publicChannels.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No public channels found
                  </p>
                )}
              </div>

              {/* Private Channels */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <span>Private Channels ({privateChannels.length})</span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {privateChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{channel.name}</span>
                      </div>
                      {channel.memberCount && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{channel.memberCount} members</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {privateChannels.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No private channels found
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelsList;