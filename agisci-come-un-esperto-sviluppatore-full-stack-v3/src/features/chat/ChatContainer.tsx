
import React, { useState, useEffect } from 'react';
import './ChatContainer.css';
import { User, Project, Message } from '../../types';
import Sidebar from './Sidebar';
import ProjectsList from './ProjectsList';
import ChatWindow from './ChatWindow';
import MediaGallery from './MediaGallery';
import AdminPanel from './AdminPanel';
import { projectsApi, messagesApi, realtimeApi, isUsingSupabase } from '../../services/api';
import { notificationService } from '../../services/notifications';

interface ChatContainerProps {
  user: User;
  onLogout: () => void;
}

function ChatContainer({ user, onLogout }: ChatContainerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'projects' | 'chat' | 'media' | 'admin'>('projects');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, [user.id]);

  useEffect(() => {
    if (selectedProject) {
      loadProjectMessages(selectedProject.id);
    }
  }, [selectedProject]);

  useEffect(() => {
    // Setup realtime per il progetto selezionato
    if (selectedProject && isUsingSupabase()) {
      console.log('🔴 Subscribing to realtime messages for project:', selectedProject.name);

      const unsubscribe = realtimeApi.subscribeToMessages(
        selectedProject.id,
        (newMessage) => {
          console.log('📨 New realtime message received:', newMessage);

          // Aggiungi a allMessages
          setAllMessages(prev => [...prev, newMessage]);

          // Aggiungi anche a messages se è del progetto corrente
          if (newMessage.projectId === selectedProject.id) {
            setMessages(prev => [...prev, newMessage]);
            console.log('✅ Message added to current chat');
          }

          // Invia notifica se il messaggio non è dell'utente corrente
          if (newMessage.senderId !== user.id && notificationService.isSupported()) {
            const preview = newMessage.type === 'text'
              ? newMessage.content
              : newMessage.type === 'image'
              ? '📷 Foto'
              : newMessage.type === 'video'
              ? '🎥 Video'
              : '📎 File';

            notificationService.notifyNewMessage(
              newMessage.senderName,
              selectedProject.name,
              preview
            );
          }
        }
      );

      return () => {
        console.log('🔴 Unsubscribing from realtime');
        unsubscribe();
      };
    }
  }, [selectedProject, user.id]);

  const loadData = async () => {
    console.log('📦 Loading projects from', isUsingSupabase() ? 'Supabase' : 'localStorage');

    // Load projects
    const userProjects = await projectsApi.getAll(user.id);
    setProjects(userProjects);

    if (isUsingSupabase()) {
      console.log('✅ Loaded', userProjects.length, 'projects from Supabase');
    }
  };

  const loadProjectMessages = async (projectId: string) => {
    console.log('💬 Loading messages for project:', projectId);

    const projectMessages = await messagesApi.getByProject(projectId);
    setMessages(projectMessages);
    setAllMessages(prev => {
      // Merge con messaggi esistenti
      const existing = prev.filter(m => m.projectId !== projectId);
      return [...existing, ...projectMessages];
    });

    if (isUsingSupabase()) {
      console.log('✅ Loaded', projectMessages.length, 'messages from Supabase');
    }
  };

  const handleSendMessage = async (content: string, type: Message['type'] = 'text', mediaUrl?: string) => {
    if (!selectedProject) return;

    console.log('📤 Sending message to', isUsingSupabase() ? 'Supabase' : 'localStorage');

    const newMessage = await messagesApi.create({
      projectId: selectedProject.id,
      senderId: user.id,
      senderName: user.name,
      content,
      type,
      mediaUrl,
      readBy: [user.id],
    });

    if (newMessage) {
      console.log('✅ Message sent to Supabase');
      // Aggiungi subito il messaggio localmente (aggiornamento ottimistico)
      // Il realtime lo aggiungerà di nuovo ma React lo filtrerà per duplicati
      setMessages(prev => [...prev, newMessage]);
      setAllMessages(prev => [...prev, newMessage]);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setView('chat');
  };

  const handleBackToProjects = () => {
    setView('projects');
    setSelectedProject(null);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
    setView('admin');
  };

  const handleCreateProject = async (name: string, description: string, memberIds: string[]) => {
    console.log('🆕 Creating new project in', isUsingSupabase() ? 'Supabase' : 'localStorage');

    const newProject = await projectsApi.create({
      name,
      description,
      createdBy: user.id,
      members: [user.id, ...memberIds],
    });

    if (newProject) {
      setProjects(prev => [...prev, newProject]);

      if (isUsingSupabase()) {
        console.log('✅ Project created in Supabase');
      }
    }
  };

  return (
    <div className="chat-container">
      {/* Mobile-first: mostra solo una view alla volta */}
      {view === 'projects' && (
        <ProjectsList
          user={user}
          projects={projects}
          messages={allMessages}
          onSelectProject={handleSelectProject}
          onLogout={onLogout}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {view === 'chat' && selectedProject && (
        <ChatWindow
          project={selectedProject}
          messages={messages}
          currentUser={user}
          onSendMessage={handleSendMessage}
          onBack={handleBackToProjects}
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
          onBack={handleBackToProjects}
        />
      )}
    </div>
  );
}

export default ChatContainer;
