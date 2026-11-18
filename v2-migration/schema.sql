-- Project Manager V2 - PostgreSQL initial schema
-- Migration source: Project Manager V1.3.2 SQLite
CREATE TABLE IF NOT EXISTS migration_runs (
  id BIGSERIAL PRIMARY KEY,
  source_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  source_projects INTEGER NOT NULL DEFAULT 0,
  source_followups INTEGER NOT NULL DEFAULT 0,
  source_payments INTEGER NOT NULL DEFAULT 0,
  imported_projects INTEGER NOT NULL DEFAULT 0,
  imported_followups INTEGER NOT NULL DEFAULT 0,
  imported_payments INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'started',
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  project_code TEXT NOT NULL UNIQUE,
  legacy_id BIGINT UNIQUE,
  legacy_version TEXT NOT NULL DEFAULT '1.3.2',
  title TEXT NOT NULL,
  governorate TEXT,
  municipality TEXT,
  category TEXT,
  subcategory TEXT,
  initial_programming_year INTEGER,
  current_programming_year INTEGER,
  initial_cost NUMERIC(18,3) NOT NULL DEFAULT 0,
  updated_cost NUMERIC(18,3) NOT NULL DEFAULT 0,
  self_funding NUMERIC(18,3) NOT NULL DEFAULT 0,
  loan NUMERIC(18,3) NOT NULL DEFAULT 0,
  exceptional_aid NUMERIC(18,3) NOT NULL DEFAULT 0,
  unassigned_aid NUMERIC(18,3) NOT NULL DEFAULT 0,
  assigned_aid NUMERIC(18,3) NOT NULL DEFAULT 0,
  other_funding NUMERIC(18,3) NOT NULL DEFAULT 0,
  realized_resources NUMERIC(18,3) NOT NULL DEFAULT 0,
  legacy_consumed_credits NUMERIC(18,3) NOT NULL DEFAULT 0,
  physical_progress NUMERIC(7,3) NOT NULL DEFAULT 0,
  operational_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (operational_status IN ('not_started','in_progress','blocked','completed','cancelled')),
  current_stage TEXT,
  programming_date DATE,
  start_date DATE,
  duration_months INTEGER,
  blocked_date DATE,
  blockage_reason TEXT,
  corrective_action TEXT,
  planned_resumption_date DATE,
  last_update_date DATE,
  procedure_type TEXT,
  provisional_reception_date DATE,
  warranty_months INTEGER,
  definitive_reception_date DATE,
  final_payment_date DATE,
  closure_date DATE,
  observations TEXT,
  legacy_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_year ON projects(initial_programming_year);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(operational_status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);

CREATE TABLE IF NOT EXISTS project_followups (
  id BIGSERIAL PRIMARY KEY,
  legacy_id BIGINT UNIQUE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  legacy_project_id BIGINT,
  followup_date DATE NOT NULL,
  physical_progress NUMERIC(7,3),
  consumed_credits NUMERIC(18,3),
  current_stage TEXT,
  operational_status TEXT,
  blocked_date DATE,
  blockage_reason TEXT,
  corrective_action TEXT,
  planned_resumption_date DATE,
  observations TEXT,
  legacy_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_followups_project_date ON project_followups(project_id, followup_date DESC);

CREATE TABLE IF NOT EXISTS project_payments (
  id BIGSERIAL PRIMARY KEY,
  legacy_id BIGINT UNIQUE,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  legacy_project_id BIGINT,
  payment_date DATE NOT NULL,
  amount NUMERIC(18,3) NOT NULL CHECK (amount >= 0),
  payment_reference TEXT,
  document_type TEXT,
  observation TEXT,
  legacy_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_project_date ON project_payments(project_id, payment_date);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  legacy_payload JSONB NOT NULL DEFAULT '{}'::jsonb
);
