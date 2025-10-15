
import React, { useState } from 'react';
import './Login.css';
import { User, Project, Message } from '../../types';
import { persistence } from '../../utils/persistence';

interface LoginProps {
  onLogin: (user: User) => void;
}

async function initializeMockData() {
  const projectsJson = await persistence.getItem('projects');
  if (!projectsJson) {
    const mockProjects: Project[] = [
      {
        id: 'proj-1',
        name: 'Sviluppo App Mobile',
        description: 'Progetto per lo sviluppo della nuova app mobile aziendale',
        createdBy: 'admin-1',
        members: ['admin-1', 'user-1'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'proj-2',
        name: 'Marketing Campaign',
        description: 'Campagna marketing Q1 2024',
        createdBy: 'admin-1',
        members: ['admin-1', 'user-1'],
        createdAt: new Date().toISOString(),
      },
    ];
    await persistence.setItem('projects', JSON.stringify(mockProjects));
  }

  const messagesJson = await persistence.getItem('messages');
  if (!messagesJson) {
    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        projectId: 'proj-1',
        senderId: 'admin-1',
        senderName: 'Admin',
        content: 'Benvenuti nel progetto!',
        type: 'text',
        createdAt: new Date().toISOString(),
        readBy: ['admin-1'],
      },
      {
        id: 'msg-2',
        projectId: 'proj-1',
        senderId: 'user-1',
        senderName: 'Mario Rossi',
        content: 'Grazie! Pronto a iniziare.',
        type: 'text',
        createdAt: new Date().toISOString(),
        readBy: ['user-1'],
      },
    ];
    await persistence.setItem('messages', JSON.stringify(mockMessages));
  }
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }

    if (isSignUp && !name) {
      setError('Inserisci il tuo nome');
      return;
    }

    // Initialize mock data if needed
    await initializeMockData();

    if (isSignUp) {
      // Simulate signup
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
      };
      onLogin(newUser);
    } else {
      // Demo login - admin credentials
      if (email === 'admin@company.com' && password === 'admin123') {
        onLogin({
          id: 'admin-1',
          email: 'admin@company.com',
          name: 'Admin',
          role: 'admin',
        });
      } else if (email === 'user@company.com' && password === 'user123') {
        onLogin({
          id: 'user-1',
          email: 'user@company.com',
          name: 'Mario Rossi',
          role: 'user',
        });
      } else {
        setError('Credenziali non valide');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>💼 Company Chat</h1>
          <p>App di messaggistica aziendale</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Il tuo nome"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@company.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            {isSignUp ? 'Registrati' : 'Accedi'}
          </button>
        </form>

        <div className="login-footer">
          <button
            className="toggle-button"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? 'Hai già un account? Accedi'
              : 'Non hai un account? Registrati'}
          </button>
        </div>

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Admin: admin@company.com / admin123</p>
          <p>User: user@company.com / user123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
