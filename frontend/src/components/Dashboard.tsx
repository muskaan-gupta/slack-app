import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import LiveClock from './LiveClock';
import Sidebar from './Sidebar';
import ComposeMessage from './MessageComposer';
import ChannelsList from './ChannelsList';
import ScheduledMessagesList from './ScheduledMessages';
import { useApp } from '../Context/AppContext';
import { useTheme } from '../Context/ThemeContext';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(120); // Set a reasonable initial height
  const headerRef = useRef<HTMLDivElement>(null);
  const { currentView } = useApp();
  const { isDark } = useTheme();

  // Apply theme to body element
  useEffect(() => {
    const body = document.body;
    if (isDark) {
      body.style.backgroundColor = '#111827'; // dark:bg-gray-900
      body.style.color = '#f9fafb'; // dark:text-gray-50
    } else {
      body.style.backgroundColor = '#f9fafb'; // bg-gray-50
      body.style.color = '#111827'; // text-gray-900
    }

    // Cleanup function to reset when component unmounts
    return () => {
      body.style.backgroundColor = '';
      body.style.color = '';
    };
  }, [isDark]);

  // Calculate header height dynamically
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        if (height > 0) {
          setHeaderHeight(height);
        }
      }
    };

    // Use setTimeout to ensure the DOM is fully rendered
    const timer = setTimeout(updateHeaderHeight, 100);
    
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'compose':
        return <ComposeMessage />;
      case 'channels':
        return <ChannelsList />;
      case 'scheduled':
        return <ScheduledMessagesList />;
      default:
        return <ComposeMessage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header spanning full width */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-40">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        <LiveClock />
      </div>
      
      {/* Sidebar positioned below header */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        headerHeight={headerHeight}
      />
      
      {/* Main content with dynamic top margin */}
      <main 
        className="lg:ml-72 p-6"
        style={{ 
          '--header-height': `${Math.max(headerHeight, 100)}px`,
          paddingTop: `calc(var(--header-height) + 1rem)` 
        } as React.CSSProperties}
      >
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Dashboard;