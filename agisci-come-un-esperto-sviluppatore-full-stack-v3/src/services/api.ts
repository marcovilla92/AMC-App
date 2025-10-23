import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Project, Message, TimeEntry, TimeSession } from '../types';
import { persistence } from '../utils/persistence';

// =====================================================
// HELPER: Determina se usare Supabase o localStorage
// =====================================================
const useSupabase = isSupabaseConfigured();

// =====================================================
// USERS API
// =====================================================

export const usersApi = {
  async getById(id: string): Promise<User | null> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as 'admin' | 'user',
        avatar: data.avatar_url || undefined,
      };
    }

    // Fallback localStorage
    return null;
  },

  async create(user: Omit<User, 'id'>): Promise<User | null> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: user.email,
          name: user.name,
          role: user.role,
          avatar_url: user.avatar || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as 'admin' | 'user',
        avatar: data.avatar_url || undefined,
      };
    }

    // Fallback localStorage
    return null;
  },
};

// =====================================================
// PROJECTS API
// =====================================================

export const projectsApi = {
  async getAll(userId: string): Promise<Project[]> {
    if (useSupabase) {
      // Query per ottenere progetti dove l'utente è membro
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', userId);

      if (memberError) {
        console.error('Error fetching project members:', memberError);
        return [];
      }

      const projectIds = memberData.map(m => m.project_id);

      if (projectIds.length === 0) return [];

      const { data, error } = await supabase
        .from('projects')
        .select('*, project_members(user_id)')
        .in('id', projectIds);

      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }

      return data.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        createdBy: p.created_by,
        members: p.project_members.map((m: any) => m.user_id),
        createdAt: p.created_at,
      }));
    }

    // Fallback localStorage
    const projectsJson = await persistence.getItem('projects');
    if (projectsJson) {
      return JSON.parse(projectsJson);
    }
    return [];
  },

  async create(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project | null> {
    if (useSupabase) {
      // Crea progetto
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          created_by: project.createdBy,
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        return null;
      }

      // Aggiungi membri
      const memberInserts = project.members.map(userId => ({
        project_id: projectData.id,
        user_id: userId,
      }));

      const { error: membersError } = await supabase
        .from('project_members')
        .insert(memberInserts);

      if (membersError) {
        console.error('Error adding project members:', membersError);
      }

      return {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description || '',
        createdBy: projectData.created_by,
        members: project.members,
        createdAt: projectData.created_at,
      };
    }

    // Fallback localStorage
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const projectsJson = await persistence.getItem('projects');
    const projects = projectsJson ? JSON.parse(projectsJson) : [];
    projects.push(newProject);
    await persistence.setItem('projects', JSON.stringify(projects));

    return newProject;
  },
};

// =====================================================
// MESSAGES API
// =====================================================

export const messagesApi = {
  async getByProject(projectId: string): Promise<Message[]> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('messages')
        .select('*, message_reads(user_id)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data.map(m => ({
        id: m.id,
        projectId: m.project_id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        content: m.content,
        type: m.type as Message['type'],
        mediaUrl: m.media_url || undefined,
        mediaSize: m.media_size || undefined,
        createdAt: m.created_at,
        readBy: m.message_reads.map((r: any) => r.user_id),
      }));
    }

    // Fallback localStorage
    const messagesJson = await persistence.getItem('messages');
    if (messagesJson) {
      const allMessages: Message[] = JSON.parse(messagesJson);
      return allMessages.filter(m => m.projectId === projectId);
    }
    return [];
  },

  async create(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message | null> {
    if (useSupabase) {
      // Inserisci messaggio
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          project_id: message.projectId,
          sender_id: message.senderId,
          sender_name: message.senderName,
          content: message.content,
          type: message.type,
          media_url: message.mediaUrl || null,
          media_size: message.mediaSize || null,
        })
        .select()
        .single();

      if (messageError) {
        console.error('Error creating message:', messageError);
        return null;
      }

      // Marca come letto dal sender
      const { error: readError } = await supabase
        .from('message_reads')
        .insert({
          message_id: messageData.id,
          user_id: message.senderId,
        });

      if (readError) {
        console.error('Error marking message as read:', readError);
      }

      return {
        id: messageData.id,
        projectId: messageData.project_id,
        senderId: messageData.sender_id,
        senderName: messageData.sender_name,
        content: messageData.content,
        type: messageData.type as Message['type'],
        mediaUrl: messageData.media_url || undefined,
        mediaSize: messageData.media_size || undefined,
        createdAt: messageData.created_at,
        readBy: [message.senderId],
      };
    }

    // Fallback localStorage
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const messagesJson = await persistence.getItem('messages');
    const messages = messagesJson ? JSON.parse(messagesJson) : [];
    messages.push(newMessage);
    await persistence.setItem('messages', JSON.stringify(messages));

    return newMessage;
  },

  async markAsRead(messageId: string, userId: string): Promise<void> {
    if (useSupabase) {
      const { error } = await supabase
        .from('message_reads')
        .insert({
          message_id: messageId,
          user_id: userId,
        });

      if (error && error.code !== '23505') { // Ignora duplicate key error
        console.error('Error marking message as read:', error);
      }
    }
  },
};

// =====================================================
// TIME ENTRIES API
// =====================================================

export const timeEntriesApi = {
  async getByProject(projectId: string): Promise<TimeEntry[]> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching time entries:', error);
        return [];
      }

      return data.map(t => ({
        id: t.id,
        projectId: t.project_id,
        userId: t.user_id,
        userName: t.user_name,
        type: t.type as 'check-in' | 'check-out',
        timestamp: t.timestamp,
        location: t.location || undefined,
        note: t.note || undefined,
      }));
    }

    // Fallback localStorage - ricava da timeSessions
    return [];
  },

  async create(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry | null> {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          project_id: entry.projectId,
          user_id: entry.userId,
          user_name: entry.userName,
          type: entry.type,
          location: entry.location || null,
          note: entry.note || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating time entry:', error);
        return null;
      }

      return {
        id: data.id,
        projectId: data.project_id,
        userId: data.user_id,
        userName: data.user_name,
        type: data.type as 'check-in' | 'check-out',
        timestamp: data.timestamp,
        location: data.location || undefined,
        note: data.note || undefined,
      };
    }

    // Fallback localStorage - già gestito da TimeTracker
    return {
      ...entry,
      id: Date.now().toString(),
    };
  },
};

// =====================================================
// REALTIME SUBSCRIPTIONS
// =====================================================

export const realtimeApi = {
  subscribeToMessages(projectId: string, callback: (message: Message) => void) {
    if (!useSupabase) return () => {};

    const channel = supabase
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
          const data = payload.new as any;
          const message: Message = {
            id: data.id,
            projectId: data.project_id,
            senderId: data.sender_id,
            senderName: data.sender_name,
            content: data.content,
            type: data.type,
            mediaUrl: data.media_url || undefined,
            mediaSize: data.media_size || undefined,
            createdAt: data.created_at,
            readBy: [data.sender_id],
          };
          callback(message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToTimeEntries(projectId: string, callback: (entry: TimeEntry) => void) {
    if (!useSupabase) return () => {};

    const channel = supabase
      .channel(`time_entries:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'time_entries',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const data = payload.new as any;
          const entry: TimeEntry = {
            id: data.id,
            projectId: data.project_id,
            userId: data.user_id,
            userName: data.user_name,
            type: data.type,
            timestamp: data.timestamp,
            location: data.location || undefined,
            note: data.note || undefined,
          };
          callback(entry);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

// Helper per verificare se Supabase è attivo
export const isUsingSupabase = () => useSupabase;
