
import React, { useState, useEffect } from 'react';
import './ChatContainer.css';
import { User, Project, Message } from '../../types';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import MediaGallery from './MediaGallery';
import AdminPanel from './AdminPanel';
import { persistence } from '../../utils/persistence';

interface ChatContainerProps {
  user: User;
  onLogout: () => void;
}

function ChatContainer({ user, onLogout }: ChatContainerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'chat' | 'media' | 'admin'>('chat');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadMessages(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const projectsJson = await persistence.getItem('projects');
    if (projectsJson) {
      const allProjects: Project[] = JSON.parse(projectsJson);
      // Filter projects where user is a member
      const userProjects = allProjects.filter(p => 
        p.members.includes(user.id) || user.role === 'admin'
      );
      setProjects(userProjects);
      if (userProjects.length > 0 && !selectedProject) {
        setSelectedProject(userProjects[0]);
      }
    }
  };

  const loadMessages = async (projectId: string) => {
    const messagesJson = await persistence.getItem('messages');
    if (messagesJson) {
      const allMessages: Message[] = JSON.parse(messagesJson);
      const projectMessages = allMessages.filter(m => m.projectId === projectId);
      setMessages(projectMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
    }
  };

  const handleSendMessage = async (content: string, type: Message['type'] = 'text', mediaUrl?: string) => {
    if (!selectedProject) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      projectId: selectedProject.id,
      senderId: user.id,
      senderName: user.name,
      content,
      type,
      mediaUrl,
      createdAt: new Date().toISOString(),
      readBy: [user.id],
    };

    const messagesJson = await persistence.getItem('messages');
    const allMessages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
    allMessages.push(newMessage);
    await persistence.setItem('messages', JSON.stringify(allMessages));

    setMessages(prev => [...prev, newMessage]);
  };

  const handleCreateProject = async (name: string, description: string, memberIds: string[]) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      createdBy: user.id,
      members: [user.id, ...memberIds],
      createdAt: new Date().toISOString(),
    };

    const projectsJson = await persistence.getItem('projects');
    const allProjects: Project[] = projectsJson ? JSON.parse(projectsJson) : [];
    allProjects.push(newProject);
    await persistence.setItem('projects', JSON.stringify(allProjects));

    setProjects(prev => [...prev, newProject]);
  };

  return (
    <div className="chat-container">
      <Sidebar
        user={user}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onLogout={onLogout}
        view={view}
        onViewChange={setView}
      />

      <div className="main-content">
        {view === 'chat' && selectedProject && (
          <ChatWindow
            project={selectedProject}
            messages={messages}
            currentUser={user}
            onSendMessage={handleSendMessage}
          />
        )}

        {view === 'media' && selectedProject && (
          <MediaGallery
            project={selectedProject}
            messages={messages.filter(m => m.type !== 'text')}
          />
        )}

        {view === 'admin' && user.role === 'admin' && (
          <AdminPanel
            projects={projects}
            onCreateProject={handleCreateProject}
          />
        )}
      </div>
    </div>
  );
}

export default ChatContainer;
