
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import './Login.css';
import { User } from '../../types';
import { authenticateUser } from '../../services/supabaseService';
import { initializeDemoData } from '../../data/demoData';
import { persistence } from '../../utils/persistence';

interface LoginProps {
  onLogin: (user: User) => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError('Inserisci email e password');
        return;
      }

      // Initialize demo data if needed
      await initializeDemoData(persistence);

      // Authenticate with Supabase service (falls back to demo if not configured)
      const user = await authenticateUser(email, password);

      if (user) {
        onLogin(user);
      } else {
        setError('Credenziali non valide');
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante il login');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@amc.com');
      setPassword('admin123');
    } else {
      setEmail('user@amc.com');
      setPassword('user123');
    }
  };

  return (
    <div className="login-container">
      {/* Animated background */}
      <div className="login-background">
        <motion.div
          className="gradient-orb orb-1"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="gradient-orb orb-2"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo and Header */}
        <motion.div
          className="login-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="logo-container">
            <Building2 size={48} className="logo-icon" />
          </div>
          <h1>AMC Cantieri</h1>
          <p>Gestione Cantieri Edili in Tempo Reale</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="login-form">
          <motion.div
            className="input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={isLoading}
              required
            />
          </motion.div>

          <motion.div
            className="input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Lock className="input-icon" size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              required
            />
          </motion.div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="login-button"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Accesso in corso...
              </>
            ) : (
              'Accedi'
            )}
          </motion.button>
        </form>

        <motion.div
          className="demo-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="demo-divider">
            <span>Prova Demo</span>
          </div>
          <div className="demo-buttons">
            <motion.button
              onClick={() => fillDemoCredentials('admin')}
              className="demo-button admin"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <UserIcon size={16} />
              Admin Demo
            </motion.button>
            <motion.button
              onClick={() => fillDemoCredentials('user')}
              className="demo-button user"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <UserIcon size={16} />
              User Demo
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
