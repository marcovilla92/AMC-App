
import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { Project, User } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AdminPanelProps {
  projects: Project[];
  onCreateProject: (name: string, description: string, memberIds: string[]) => void;
  onBack?: () => void;
}

function AdminPanel({ projects, onCreateProject, onBack }: AdminPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!isSupabaseConfigured()) return;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading users:', error);
      return;
    }

    const users: User[] = data.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as 'admin' | 'user',
      avatar: u.avatar_url || undefined,
    }));

    setAvailableUsers(users);
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && projectDescription.trim()) {
      onCreateProject(projectName.trim(), projectDescription.trim(), selectedMembers);
      setProjectName('');
      setProjectDescription('');
      setSelectedMembers([]);
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        {onBack && (
          <button className="back-button-admin" onClick={onBack} title="Indietro">
            ←
          </button>
        )}
        <h2>⚙️ Pannello Amministratore</h2>
        <button
          className="create-project-button"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? '✕ Annulla' : '+ Nuovo Progetto'}
        </button>
      </div>

      {isCreating && (
        <form className="create-project-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Progetto</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Es. Sviluppo App Mobile"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrizione</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Breve descrizione del progetto..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Membri del Team ({selectedMembers.length} selezionati)</label>
            <p className="helper-text">Seleziona gli utenti da aggiungere al progetto. L'admin viene aggiunto automaticamente.</p>
            <div className="members-selection">
              {availableUsers.length === 0 ? (
                <p className="no-users">Caricamento utenti...</p>
              ) : (
                availableUsers.map(user => (
                  <div
                    key={user.id}
                    className={`member-checkbox ${selectedMembers.includes(user.id) ? 'selected' : ''}`}
                    onClick={() => toggleMember(user.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.id)}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="member-info">
                      <div className="member-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-details">
                        <span className="member-name">{user.name}</span>
                        <span className="member-email">{user.email}</span>
                      </div>
                      <span className={`member-role-badge ${user.role}`}>
                        {user.role === 'admin' ? '👑' : '👤'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button type="submit" className="submit-button">
            Crea Progetto
          </button>
        </form>
      )}

      <div className="projects-overview">
        <h3>Tutti i Progetti ({projects.length})</h3>

        {projects.length === 0 ? (
          <div className="no-projects">
            <p>📋 Nessun progetto creato</p>
          </div>
        ) : (
          <div className="projects-table">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h4>{project.name}</h4>
                  <span className="member-count">
                    👥 {project.members.length} membri
                  </span>
                </div>

                <p className="project-description">{project.description}</p>

                <div className="project-meta">
                  <span className="project-date">
                    📅 Creato il {formatDate(project.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h4>Progetti Attivi</h4>
            <p className="stat-value">{projects.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h4>Membri Totali</h4>
            <p className="stat-value">
              {new Set(projects.flatMap(p => p.members)).size}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h4>Funzionalità</h4>
            <p className="stat-value">100%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
