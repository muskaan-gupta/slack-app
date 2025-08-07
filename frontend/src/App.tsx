import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './Context/ThemeContext';
import { AppProvider, useApp } from './Context/AppContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import SuccessPage from './components/SuccessPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/" element={isAuthenticated ? <Dashboard /> : <AuthPage />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;