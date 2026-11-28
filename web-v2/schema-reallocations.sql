-- MUNIPILOT — Registre des reliquats et réaffectations par lots
-- À exécuter une seule fois sur la base PostgreSQL de l'application.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS awarded_amount numeric(15,3),
  ADD COLUMN IF NOT EXISTS adjudication_residual_used numeric(15,3) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS project_residual_sources (
  id bigserial PRIMARY KEY,
  project_id bigint NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  source_type text NOT NULL CHECK (source_type IN ('adjudication','final')),
  source_amount numeric(15,3) NOT NULL CHECK (source_amount >= 0),
  available_amount numeric(15,3) NOT NULL DEFAULT 0 CHECK (available_amount >= 0),
  status text NOT NULL CHECK (status IN ('reserved','available','partially_reallocated','reallocated','exhausted')),
  decision text,
  pv_reference varchar(160),
  pv_date date,
  release_reason text,
  released_at timestamptz,
  created_by bigint REFERENCES app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, source_type),
  CHECK (available_amount <= source_amount)
);

CREATE TABLE IF NOT EXISTS reallocation_batches (
  id bigserial PRIMARY KEY,
  reference varchar(40) NOT NULL UNIQUE,
  pv_reference varchar(160) NOT NULL,
  pv_date date NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'validated' CHECK (status IN ('validated','cancelled')),
  total_amount numeric(15,3) NOT NULL CHECK (total_amount > 0),
  created_by bigint REFERENCES app_users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reallocation_allocations (
  id bigserial PRIMARY KEY,
  batch_id bigint NOT NULL REFERENCES reallocation_batches(id) ON DELETE RESTRICT,
  source_id bigint NOT NULL REFERENCES project_residual_sources(id) ON DELETE RESTRICT,
  beneficiary_project_id bigint NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  amount numeric(15,3) NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_residual_sources_status_type ON project_residual_sources(source_type,status);
CREATE INDEX IF NOT EXISTS idx_reallocation_allocations_source ON reallocation_allocations(source_id);
CREATE INDEX IF NOT EXISTS idx_reallocation_allocations_beneficiary ON reallocation_allocations(beneficiary_project_id);

COMMENT ON TABLE project_residual_sources IS 'Origine et disponibilité des reliquats après adjudication ou après clôture définitive.';
COMMENT ON TABLE reallocation_batches IS 'Décisions de réaffectation budgétaire validées par PV du conseil.';
COMMENT ON TABLE reallocation_allocations IS 'Traçabilité des montants transférés de chaque source vers chaque projet bénéficiaire.';
