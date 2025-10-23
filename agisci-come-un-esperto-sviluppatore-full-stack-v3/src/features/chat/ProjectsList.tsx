import React from 'react';
import './ProjectsList.css';
import { User, Project, Message } from '../../types';

interface ProjectsListProps {
  user: User;
  projects: Project[];
  messages: Message[];
  onSelectProject: (project: Project) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}

function ProjectsList({
  user,
  projects,
  messages,
  onSelectProject,
  onLogout,
  onOpenSettings,
}: ProjectsListProps) {

  // Calcola ultimo messaggio e messaggi non letti per ogni progetto
  const getProjectStats = (projectId: string) => {
    const projectMessages = messages.filter(m => m.projectId === projectId);
    const lastMessage = projectMessages.length > 0
      ? projectMessages[projectMessages.length - 1]
      : null;

    const unreadCount = projectMessages.filter(
      m => !m.readBy.includes(user.id)
    ).length;

    return { lastMessage, unreadCount };
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays}g`;

    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  };

  const truncateMessage = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="projects-list-container">
      {/* Header stile WhatsApp */}
      <div className="projects-header">
        <h1>AMC Projects</h1>
        <div className="header-actions">
          <button className="icon-button" onClick={onOpenSettings} title="Impostazioni">
            ⚙️
          </button>
          <button className="icon-button" onClick={onLogout} title="Logout">
            🚪
          </button>
        </div>
      </div>

      {/* User info card */}
      <div className="user-card">
        <div className="user-avatar-large">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="user-info-details">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span className={`role-badge ${user.role}`}>
            {user.role === 'admin' ? '👑 Admin' : '👤 User'}
          </span>
        </div>
      </div>

      {/* Search bar (placeholder per ora) */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Cerca progetti..."
          className="search-input"
        />
      </div>

      {/* Lista progetti stile WhatsApp */}
      <div className="projects-list">
        {projects.length === 0 ? (
          <div className="no-projects-message">
            <div className="empty-state">
              <span className="empty-icon">💼</span>
              <h3>Nessun progetto</h3>
              <p>I tuoi progetti appariranno qui</p>
            </div>
          </div>
        ) : (
          projects.map(project => {
            const { lastMessage, unreadCount } = getProjectStats(project.id);

            return (
              <div
                key={project.id}
                className="project-list-item"
                onClick={() => onSelectProject(project)}
              >
                <div className="project-avatar">
                  <span className="project-icon">📊</span>
                </div>

                <div className="project-content">
                  <div className="project-top-row">
                    <h3 className="project-name">{project.name}</h3>
                    {lastMessage && (
                      <span className="last-message-time">
                        {formatLastMessageTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="project-bottom-row">
                    <p className="last-message-preview">
                      {lastMessage ? (
                        <>
                          {lastMessage.senderId === user.id && (
                            <span className="message-status">✓✓ </span>
                          )}
                          {lastMessage.type === 'text'
                            ? truncateMessage(lastMessage.content)
                            : lastMessage.type === 'image'
                            ? '📷 Foto'
                            : lastMessage.type === 'video'
                            ? '🎥 Video'
                            : '📎 File'
                          }
                        </>
                      ) : (
                        <span className="no-messages-yet">Nessun messaggio</span>
                      )}
                    </p>

                    {unreadCount > 0 && (
                      <div className="unread-badge">{unreadCount}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ProjectsList;
