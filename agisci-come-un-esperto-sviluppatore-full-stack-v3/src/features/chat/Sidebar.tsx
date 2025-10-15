
import React from 'react';
import './Sidebar.css';
import { User, Project } from '../../types';

interface SidebarProps {
  user: User;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onLogout: () => void;
  view: 'chat' | 'media' | 'admin';
  onViewChange: (view: 'chat' | 'media' | 'admin') => void;
}

function Sidebar({
  user,
  projects,
  selectedProject,
  onSelectProject,
  onLogout,
  view,
  onViewChange,
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>{user.name}</h3>
            <span className={`role-badge ${user.role}`}>
              {user.role === 'admin' ? '👑 Admin' : '👤 User'}
            </span>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout} title="Logout">
          🚪
        </button>
      </div>

      <div className="view-tabs">
        <button
          className={`view-tab ${view === 'chat' ? 'active' : ''}`}
          onClick={() => onViewChange('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`view-tab ${view === 'media' ? 'active' : ''}`}
          onClick={() => onViewChange('media')}
        >
          📁 Media
        </button>
        {user.role === 'admin' && (
          <button
            className={`view-tab ${view === 'admin' ? 'active' : ''}`}
            onClick={() => onViewChange('admin')}
          >
            ⚙️ Admin
          </button>
        )}
      </div>

      <div className="projects-list">
        <h4>Progetti</h4>
        {projects.length === 0 ? (
          <div className="no-projects">
            <p>Nessun progetto disponibile</p>
          </div>
        ) : (
          projects.map(project => (
            <div
              key={project.id}
              className={`project-item ${
                selectedProject?.id === project.id ? 'active' : ''
              }`}
              onClick={() => onSelectProject(project)}
            >
              <div className="project-icon">📊</div>
              <div className="project-info">
                <h5>{project.name}</h5>
                <p>{project.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
