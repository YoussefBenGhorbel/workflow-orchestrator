CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('EXPERT', 'SENIOR', 'JUNIOR', 'ALTERNANT')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_type TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('GREEN', 'ORANGE', 'RED')),
  status TEXT NOT NULL CHECK (
    status IN ('PENDING_VALIDATION', 'ACTIVE', 'DONE', 'CANCELLED')
  ),
  client_id UUID REFERENCES clients(id),
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE task_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_input TEXT NOT NULL,
  proposed_title TEXT,
  proposed_description TEXT,
  proposed_priority TEXT,
  proposed_assignee UUID REFERENCES users(id),
  confidence_score NUMERIC(3,2),
  ambiguous BOOLEAN DEFAULT FALSE,
  validated BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);
