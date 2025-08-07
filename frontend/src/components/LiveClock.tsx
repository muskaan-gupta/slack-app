import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 w-full">
      <div className="flex items-center space-x-3">
        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatTime(time)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {formatDate(time)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClock;