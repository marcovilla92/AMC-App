
import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './features/auth/Login';
import ChatContainer from './features/chat/ChatContainer';
import { User, Project } from './types';
import { persistence } from './utils/persistence';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userJson = await persistence.getItem('currentUser');
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }
    setIsLoading(false);
  };

  const handleLogin = async (user: User) => {
    await persistence.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await persistence.removeItem('currentUser');
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ChatContainer user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
