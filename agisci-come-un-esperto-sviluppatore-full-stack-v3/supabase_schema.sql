-- =====================================================
-- AMC APP - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Esegui questo script nel SQL Editor di Supabase
-- Dashboard > SQL Editor > New Query
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user' NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index per performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- =====================================================
-- PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index per performance
CREATE INDEX IF NOT EXISTS projects_created_by_idx ON projects(created_by);

-- =====================================================
-- PROJECT MEMBERS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (project_id, user_id)
);

-- Index per performance
CREATE INDEX IF NOT EXISTS project_members_user_idx ON project_members(user_id);
CREATE INDEX IF NOT EXISTS project_members_project_idx ON project_members(project_id);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('text', 'image', 'video', 'file')) DEFAULT 'text' NOT NULL,
  media_url TEXT,
  media_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index per performance
CREATE INDEX IF NOT EXISTS messages_project_idx ON messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages(sender_id);

-- =====================================================
-- MESSAGE READS (Track read status)
-- =====================================================
CREATE TABLE IF NOT EXISTS message_reads (
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (message_id, user_id)
);

-- Index per performance
CREATE INDEX IF NOT EXISTS message_reads_user_idx ON message_reads(user_id);

-- =====================================================
-- TIME ENTRIES (Check-In/Out tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT CHECK (type IN ('check-in', 'check-out')) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  location JSONB,
  note TEXT
);

-- Index per performance
CREATE INDEX IF NOT EXISTS time_entries_project_user_idx ON time_entries(project_id, user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS time_entries_user_idx ON time_entries(user_id, timestamp DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- USERS: Everyone can read, only own user can update
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- PROJECTS: Visible to members and admins
CREATE POLICY "Projects visible to members" ON projects
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM project_members WHERE project_id = projects.id
    )
    OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- PROJECT MEMBERS: Visible to project members
CREATE POLICY "Project members visible to members" ON project_members
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM project_members WHERE project_id = project_members.project_id
    )
  );

CREATE POLICY "Admins can add project members" ON project_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- MESSAGES: Visible and creatable by project members
CREATE POLICY "Messages visible to project members" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM project_members WHERE project_id = messages.project_id
    )
  );

CREATE POLICY "Project members can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM project_members WHERE project_id = messages.project_id
    )
  );

-- MESSAGE READS: Users can manage their own read status
CREATE POLICY "Users can view own read status" ON message_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark messages as read" ON message_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TIME ENTRIES: Users can view and create their own entries
CREATE POLICY "Users can view time entries in their projects" ON time_entries
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM project_members WHERE project_id = time_entries.project_id
    )
  );

CREATE POLICY "Users can create own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for messages (for live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;

-- =====================================================
-- DEMO DATA (Optional - per testing)
-- =====================================================

-- Inserisci utenti demo
INSERT INTO users (id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@amc.com', 'Admin AMC', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'user@amc.com', 'Mario Rossi', 'user')
ON CONFLICT (email) DO NOTHING;

-- Inserisci progetto demo
INSERT INTO projects (id, name, description, created_by) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Sviluppo App Mobile', 'Progetto per lo sviluppo della nuova app mobile aziendale', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Aggiungi membri al progetto
INSERT INTO project_members (project_id, user_id) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS & TRIGGERS (Optional - per features avanzate)
-- =====================================================

-- Function per aggiornare automaticamente il created_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Assicurati che le policies siano attive
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- COMPLETATO!
-- =====================================================
-- Il database è ora configurato e pronto per l'uso
-- Prossimi passi:
-- 1. Configura le variabili d'ambiente (.env file)
-- 2. Testa la connessione dall'app
-- 3. Abilita autenticazione Supabase nella dashboard
-- =====================================================
