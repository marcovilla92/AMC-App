
import React, { useState } from 'react';
import './AdminPanel.css';
import { Project } from '../../types';

interface AdminPanelProps {
  projects: Project[];
  onCreateProject: (name: string, description: string, memberIds: string[]) => void;
}

function AdminPanel({ projects, onCreateProject }: AdminPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && projectDescription.trim()) {
      onCreateProject(projectName.trim(), projectDescription.trim(), []);
      setProjectName('');
      setProjectDescription('');
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
