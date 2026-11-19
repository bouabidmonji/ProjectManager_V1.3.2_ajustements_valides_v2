-- V2 profiles métier et clôture financière
-- À exécuter une seule fois après schema.sql, schema-auth.sql et schema-workspace.sql.
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check;
UPDATE app_users SET role='technical' WHERE role='agent';
UPDATE app_users SET role='viewer' WHERE role IN ('member','supervisor');
ALTER TABLE app_users ADD CONSTRAINT app_users_role_check CHECK(role IN ('admin','technical','finance','viewer'));

ALTER TABLE projects ADD COLUMN IF NOT EXISTS final_payment_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS closure_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS provisional_reception_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS warranty_months INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS definitive_reception_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS procedure_type TEXT;

CREATE TABLE IF NOT EXISTS project_financial_closures (
 id BIGSERIAL PRIMARY KEY,
 project_id BIGINT NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
 final_payment_date DATE,
 closure_date DATE,
 final_residual NUMERIC(18,3) NOT NULL DEFAULT 0,
 validated_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 validated_at TIMESTAMPTZ,
 notes TEXT
);
