import React, { useEffect, useState } from 'react';
import { MessageSquare, Calendar, Hash, Clock, X } from 'lucide-react';
import { useApp } from '../Context/AppContext';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  headerHeight: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, headerHeight }) => {
  const [isDesktop, setIsDesktop] = useState(false);

  // Handle responsive detection
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => {
      window.removeEventListener('resize', checkIsDesktop);
    };
  }, []);
  const { 
    currentView, 
    setCurrentView, 
    scheduledMessages, 
    cancelScheduledMessage, 
    refreshScheduledMessages,
    isAuthenticated 
  } = useApp();

  // Refresh scheduled messages when sidebar opens and user is authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      console.log('Refreshing scheduled messages...');
      refreshScheduledMessages();
    }
  }, [isAuthenticated, isOpen, refreshScheduledMessages]);

  // Debug log
  useEffect(() => {
    console.log('Sidebar state:', { isAuthenticated, scheduledMessages: scheduledMessages.length });
  }, [isAuthenticated, scheduledMessages]);

  const handleCancelMessage = async (id: string) => {
    try {
      await cancelScheduledMessage(id);
    } catch (error) {
      console.error('Failed to cancel message:', error);
    }
  };

  const pendingMessages = scheduledMessages.filter(msg => msg.status === 'pending');

  const formatScheduledTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const menuItems = [
    { id: 'compose', label: 'Compose Message', icon: MessageSquare },
    { id: 'channels', label: 'Channels', icon: Hash },
    { id: 'scheduled', label: 'All Scheduled', icon: Calendar },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0
          fixed left-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{
          '--header-height': `${Math.max(headerHeight, 100)}px`,
          top: isDesktop ? 'var(--header-height)' : '0',
          height: isDesktop ? 'calc(100vh - var(--header-height))' : '100vh'
        } as React.CSSProperties}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex justify-end p-2 lg:hidden">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex-shrink-0 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200
                    ${currentView === item.id
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
          {/* Scheduled Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Scheduled Messages ({pendingMessages.length})
                </h3>
              </div>
              <button
                onClick={() => refreshScheduledMessages()}
                className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                title="Refresh scheduled messages"
              >
                Refresh
              </button>
            </div>
            
            <div className="space-y-3">
              {pendingMessages.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No scheduled messages
                </p>
              ) : (
                pendingMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        #{message.channelName}
                      </span>
                      <button
                        onClick={() => handleCancelMessage(message.id)}
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        title="Cancel scheduled message"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {message.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatScheduledTime(message.scheduledFor)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;