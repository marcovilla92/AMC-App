import React, { useState, useEffect } from 'react';
import './TimeTracker.css';
import { User, Project, TimeEntry, TimeSession } from '../../types';
import { persistence } from '../../utils/persistence';
import { timeEntriesApi, isUsingSupabase } from '../../services/api';

interface TimeTrackerProps {
  user: User;
  project: Project;
  onCheckIn: (entry: TimeEntry) => void;
  onCheckOut: (entry: TimeEntry) => void;
}

function TimeTracker({ user, project, onCheckIn, onCheckOut }: TimeTrackerProps) {
  const [activeSession, setActiveSession] = useState<TimeSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    loadActiveSession();
  }, [user.id, project.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeSession) {
      interval = setInterval(() => {
        const start = new Date(activeSession.checkIn.timestamp).getTime();
        const now = Date.now();
        setElapsedTime(now - start);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const loadActiveSession = async () => {
    const sessionsJson = await persistence.getItem('timeSessions');
    if (sessionsJson) {
      const sessions: TimeSession[] = JSON.parse(sessionsJson);
      const active = sessions.find(
        s => s.userId === user.id && s.projectId === project.id && s.status === 'active'
      );
      setActiveSession(active || null);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizzazione non supportata'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Ottieni posizione GPS
      let location;
      try {
        const position = await getCurrentPosition();
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
      } catch (gpsError) {
        console.warn('GPS non disponibile:', gpsError);
        // Continua senza GPS
      }

      const checkInEntry: TimeEntry = {
        id: Date.now().toString(),
        projectId: project.id,
        userId: user.id,
        userName: user.name,
        type: 'check-in',
        timestamp: new Date().toISOString(),
        location,
      };

      // Salva entry su Supabase o localStorage
      if (isUsingSupabase()) {
        await timeEntriesApi.create(checkInEntry);
        console.log('✅ Check-in saved to Supabase');
      }

      const newSession: TimeSession = {
        id: Date.now().toString(),
        projectId: project.id,
        userId: user.id,
        userName: user.name,
        checkIn: checkInEntry,
        status: 'active',
      };

      // Salva sessione localmente (per gestire stato)
      const sessionsJson = await persistence.getItem('timeSessions');
      const sessions: TimeSession[] = sessionsJson ? JSON.parse(sessionsJson) : [];
      sessions.push(newSession);
      await persistence.setItem('timeSessions', JSON.stringify(sessions));

      setActiveSession(newSession);
      onCheckIn(checkInEntry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il check-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeSession) return;

    setIsLoading(true);
    setError(null);

    try {
      // Ottieni posizione GPS
      let location;
      try {
        const position = await getCurrentPosition();
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
      } catch (gpsError) {
        console.warn('GPS non disponibile:', gpsError);
      }

      const checkOutEntry: TimeEntry = {
        id: Date.now().toString(),
        projectId: project.id,
        userId: user.id,
        userName: user.name,
        type: 'check-out',
        timestamp: new Date().toISOString(),
        location,
      };

      // Salva entry su Supabase o localStorage
      if (isUsingSupabase()) {
        await timeEntriesApi.create(checkOutEntry);
        console.log('✅ Check-out saved to Supabase');
      }

      // Calcola durata
      const duration = new Date(checkOutEntry.timestamp).getTime() -
                      new Date(activeSession.checkIn.timestamp).getTime();

      // Aggiorna sessione localmente
      const sessionsJson = await persistence.getItem('timeSessions');
      const sessions: TimeSession[] = sessionsJson ? JSON.parse(sessionsJson) : [];
      const updatedSessions = sessions.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            checkOut: checkOutEntry,
            duration,
            status: 'completed' as const,
          };
        }
        return s;
      });
      await persistence.setItem('timeSessions', JSON.stringify(updatedSessions));

      setActiveSession(null);
      onCheckOut(checkOutEntry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il check-out');
    } finally {
      setIsLoading(false);
    }
  };

  const formatElapsedTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="time-tracker">
      {error && (
        <div className="time-tracker-error">
          ⚠️ {error}
        </div>
      )}

      {activeSession ? (
        <div className="time-tracker-active">
          <div className="timer-display">
            <div className="timer-icon">⏱️</div>
            <div className="timer-info">
              <div className="timer-time">{formatElapsedTime(elapsedTime)}</div>
              <div className="timer-label">Lavoro in corso</div>
              <div className="timer-start">
                Inizio: {new Date(activeSession.checkIn.timestamp).toLocaleTimeString('it-IT')}
              </div>
            </div>
          </div>
          <button
            className="time-tracker-btn checkout-btn"
            onClick={handleCheckOut}
            disabled={isLoading}
          >
            {isLoading ? '⏳' : '🛑'} Check-Out
          </button>
        </div>
      ) : (
        <button
          className="time-tracker-btn checkin-btn"
          onClick={handleCheckIn}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Attendere...' : '✅ Check-In'}
        </button>
      )}
    </div>
  );
}

export default TimeTracker;
