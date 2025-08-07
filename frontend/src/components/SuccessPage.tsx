import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../Context/AppContext';

const SuccessPage: React.FC = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user information from backend or use mock data
    const fetchUserInfo = async () => {
      try {
        // In a real app, you'd fetch user info from your backend
        // const response = await fetch('/api/auth/me');
        // const userData = await response.json();
        
        // For now, using mock data but you can replace this
        const mockUser = {
          id: 'user-123',
          name: 'Connected User',
          email: 'user@workspace.com',
          workspace: 'Chord' // This should match your actual Slack workspace
        };
        
        setUser(mockUser);
        // Redirect to dashboard after setting user
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Failed to get user info:', error);
        // Still redirect even if there's an error
        navigate('/', { replace: true });
      }
    };

    const timer = setTimeout(fetchUserInfo, 2000); // Give user time to see the success message
    
    return () => clearTimeout(timer);
  }, [setUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Successfully Connected!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Your Slack workspace has been connected. Redirecting to dashboard...
          </p>
          
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
