import { supabase, isSupabaseConfigured, isDemoMode } from '../lib/supabase';
import { User, Project, Message } from '../types';
import { persistence } from '../utils/persistence';
import { demoProjects, demoMessages } from '../data/demoData';

/**
 * Supabase Service
 * Gestisce tutte le operazioni con Supabase.
 * Se Supabase non è configurato, usa il fallback locale.
 */

// ==================== USERS ====================

export const getUsers = async (): Promise<User[]> => {
  if (!isSupabaseConfigured) {
    // Fallback locale
    const usersJson = await persistence.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  }

  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const getUserById = async (userId: string): Promise<User | null> => {
  if (!isSupabaseConfigured) {
    const users = await getUsers();
    return users.find(u => u.id === userId) || null;
  }

  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  if (!isSupabaseConfigured) {
    // Demo auth (hardcoded per demo)
    const demoUsers = [
      { id: '1', email: 'admin@amc.com', password: 'admin123', name: 'Marco Rossi', role: 'admin' as const },
      { id: '2', email: 'user@amc.com', password: 'user123', name: 'Giuseppe Verdi', role: 'user' as const },
    ];

    const user = demoUsers.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  // Supabase auth
  const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) throw authError;

  // Get user profile from users table
  const { data: userData, error: userError } = await supabase!
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userError) throw userError;
  return userData;
};

// ==================== PROJECTS ====================

export const getProjects = async (userId?: string): Promise<Project[]> => {
  if (!isSupabaseConfigured) {
    // Fallback locale
    const projectsJson = await persistence.getItem('projects');
    const projects: Project[] = projectsJson ? JSON.parse(projectsJson) : demoProjects;

    if (userId) {
      // Filter by user membership
      return projects.filter(p => p.members.includes(userId));
    }
    return projects;
  }

  let query = supabase!
    .from('projects')
    .select(`
      *,
      project_members!inner(user_id)
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('project_members.user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform data to match our Project type
  return (data || []).map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    address: p.address,
    status: p.status,
    startDate: p.start_date,
    endDate: p.end_date,
    location: p.latitude && p.longitude ? {
      lat: parseFloat(p.latitude),
      lng: parseFloat(p.longitude),
    } : undefined,
    createdBy: p.created_by,
    createdAt: p.created_at,
    members: [], // Will be populated separately if needed
  }));
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  if (!isSupabaseConfigured) {
    const projects = await getProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  const { data, error } = await supabase!
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
};

export const createProject = async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
  if (!isSupabaseConfigured) {
    // Fallback locale
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const projectsJson = await persistence.getItem('projects');
    const projects: Project[] = projectsJson ? JSON.parse(projectsJson) : [];
    projects.push(newProject);
    await persistence.setItem('projects', JSON.stringify(projects));

    return newProject;
  }

  const { data, error } = await supabase!
    .from('projects')
    .insert({
      name: project.name,
      description: project.description,
      address: project.address,
      status: project.status,
      start_date: project.startDate,
      end_date: project.endDate,
      latitude: project.location?.lat,
      longitude: project.location?.lng,
      created_by: project.createdBy,
    })
    .select()
    .single();

  if (error) throw error;

  // Add creator as member
  if (data) {
    await supabase!.from('project_members').insert({
      project_id: data.id,
      user_id: project.createdBy,
      role: 'admin',
    });
  }

  return data;
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project> => {
  if (!isSupabaseConfigured) {
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) throw new Error('Project not found');

    projects[index] = { ...projects[index], ...updates };
    await persistence.setItem('projects', JSON.stringify(projects));
    return projects[index];
  }

  const { data, error } = await supabase!
    .from('projects')
    .update({
      name: updates.name,
      description: updates.description,
      address: updates.address,
      status: updates.status,
      start_date: updates.startDate,
      end_date: updates.endDate,
      latitude: updates.location?.lat,
      longitude: updates.location?.lng,
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== MESSAGES ====================

export const getMessages = async (projectId: string): Promise<Message[]> => {
  if (!isSupabaseConfigured) {
    const messagesJson = await persistence.getItem('messages');
    const allMessages: Message[] = messagesJson ? JSON.parse(messagesJson) : demoMessages;
    return allMessages
      .filter(m => m.projectId === projectId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  const { data, error } = await supabase!
    .from('messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map(m => ({
    id: m.id,
    projectId: m.project_id,
    senderId: m.sender_id,
    senderName: m.sender_name,
    content: m.content,
    type: m.type,
    mediaUrl: m.media_url,
    mediaSize: m.media_size,
    createdAt: m.created_at,
    readBy: [], // Will be populated from message_reads if needed
  }));
};

export const createMessage = async (message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> => {
  if (!isSupabaseConfigured) {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const messagesJson = await persistence.getItem('messages');
    const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
    messages.push(newMessage);
    await persistence.setItem('messages', JSON.stringify(messages));

    return newMessage;
  }

  const { data, error } = await supabase!
    .from('messages')
    .insert({
      project_id: message.projectId,
      sender_id: message.senderId,
      sender_name: message.senderName,
      content: message.content,
      type: message.type,
      media_url: message.mediaUrl,
      media_size: message.mediaSize,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    projectId: data.project_id,
    senderId: data.sender_id,
    senderName: data.sender_name,
    content: data.content,
    type: data.type,
    mediaUrl: data.media_url,
    mediaSize: data.media_size,
    createdAt: data.created_at,
    readBy: [message.senderId],
  };
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const subscribeToMessages = (
  projectId: string,
  callback: (message: Message) => void
) => {
  if (!isSupabaseConfigured) {
    return () => {}; // No-op unsubscribe for demo mode
  }

  const channel = supabase!
    .channel(`messages:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        const newMessage = payload.new as any;
        callback({
          id: newMessage.id,
          projectId: newMessage.project_id,
          senderId: newMessage.sender_id,
          senderName: newMessage.sender_name,
          content: newMessage.content,
          type: newMessage.type,
          mediaUrl: newMessage.media_url,
          mediaSize: newMessage.media_size,
          createdAt: newMessage.created_at,
          readBy: [newMessage.sender_id],
        });
      }
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
};

export const subscribeToProjects = (callback: (project: Project) => void) => {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const channel = supabase!
    .channel('projects')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const p = payload.new as any;
          callback({
            id: p.id,
            name: p.name,
            description: p.description,
            address: p.address,
            status: p.status,
            startDate: p.start_date,
            endDate: p.end_date,
            location: p.latitude && p.longitude ? {
              lat: parseFloat(p.latitude),
              lng: parseFloat(p.longitude),
            } : undefined,
            createdBy: p.created_by,
            createdAt: p.created_at,
            members: [],
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
};

// ==================== GESTIONALE SYNC ====================

export const getSyncLog = async (syncedOnly: boolean = false) => {
  if (!isSupabaseConfigured) {
    return [];
  }

  let query = supabase!
    .from('sync_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (syncedOnly) {
    query = query.eq('synced_to_gestionale', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const markAsSynced = async (syncLogId: string) => {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase!
    .from('sync_log')
    .update({
      synced_to_gestionale: true,
      synced_at: new Date().toISOString(),
    })
    .eq('id', syncLogId);

  if (error) throw error;
};
