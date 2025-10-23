import { createClient } from '@supabase/supabase-js';

// Chiavi Supabase da variabili d'ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica che le chiavi siano configurate
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase non configurato. Crea un file .env con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
  );
}

// Crea client Supabase
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', // fallback per sviluppo
  supabaseAnonKey || 'dummy-key'
);

// Helper per verificare se Supabase è configurato
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Database Types (generati automaticamente da Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'user';
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'admin' | 'user';
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'user';
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      project_members: {
        Row: {
          project_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          project_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          project_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          sender_name: string;
          content: string;
          type: 'text' | 'image' | 'video' | 'file';
          media_url: string | null;
          media_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sender_id: string;
          sender_name: string;
          content: string;
          type?: 'text' | 'image' | 'video' | 'file';
          media_url?: string | null;
          media_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sender_id?: string;
          sender_name?: string;
          content?: string;
          type?: 'text' | 'image' | 'video' | 'file';
          media_url?: string | null;
          media_size?: number | null;
          created_at?: string;
        };
      };
      message_reads: {
        Row: {
          message_id: string;
          user_id: string;
          read_at: string;
        };
        Insert: {
          message_id: string;
          user_id: string;
          read_at?: string;
        };
        Update: {
          message_id?: string;
          user_id?: string;
          read_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          user_name: string;
          type: 'check-in' | 'check-out';
          timestamp: string;
          location: any | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          user_name: string;
          type: 'check-in' | 'check-out';
          timestamp?: string;
          location?: any | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          user_name?: string;
          type?: 'check-in' | 'check-out';
          timestamp?: string;
          location?: any | null;
          note?: string | null;
        };
      };
    };
  };
}
