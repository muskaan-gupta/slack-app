import React, { useState } from 'react';
import { Slack, ArrowRight, Shield, Clock, MessageSquare } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleConnectSlack = async () => {
    setLoading(true);
    
    // Using configurable URL for OAuth
    const authUrl = import.meta.env.VITE_AUTH_URL || 'https://081027c3b538.ngrok-free.app/api/auth/slack';
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl mb-4">
              <Slack className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Slack Connect</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Schedule and send messages to your Slack workspace
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <button
              onClick={handleConnectSlack}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Slack className="w-5 h-5" />
                  <span>Connect with Slack</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              By connecting, you agree to our terms and privacy policy
            </div>
          </div>

          {/* Features */}
          <div className="grid gap-4 text-center">
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm">Send instant messages to any channel</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm">Schedule messages for later delivery</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm">Secure OAuth integration with Slack</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;