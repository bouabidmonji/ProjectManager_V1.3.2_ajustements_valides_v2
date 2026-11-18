-- V2 workspace: responsibilities and immutable project change history
CREATE TABLE IF NOT EXISTS project_responsibilities (
 id BIGSERIAL PRIMARY KEY,
 project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
 responsibility_role TEXT NOT NULL CHECK (responsibility_role IN ('principal','technical','finance','procurement','gis')),
 assigned_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 ended_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_active_principal
 ON project_responsibilities(project_id)
 WHERE responsibility_role='principal' AND active=TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_active_role_user
 ON project_responsibilities(project_id,responsibility_role,user_id)
 WHERE active=TRUE;
CREATE INDEX IF NOT EXISTS idx_responsibilities_user
 ON project_responsibilities(user_id,active);

CREATE TABLE IF NOT EXISTS project_history (
 id BIGSERIAL PRIMARY KEY,
 project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 event_type TEXT NOT NULL,
 summary TEXT NOT NULL,
 before_data JSONB NOT NULL DEFAULT '{}'::jsonb,
 after_data JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_history_project
 ON project_history(project_id,created_at DESC);

-- Preserve the principal responsible when a responsibility is ended or replaced.
