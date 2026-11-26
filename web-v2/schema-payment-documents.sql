-- V2 : justificatifs directement rattachés à chaque paiement.
-- Exécuter une seule fois après schema-documents.sql.
CREATE TABLE IF NOT EXISTS project_payment_documents (
 id BIGSERIAL PRIMARY KEY,
 payment_id BIGINT NOT NULL REFERENCES project_payments(id) ON DELETE CASCADE,
 original_filename TEXT NOT NULL,
 stored_filename TEXT NOT NULL UNIQUE,
 mime_type TEXT NOT NULL CHECK (mime_type IN ('application/pdf','image/jpeg','image/png')),
 file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 20971520),
 uploaded_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_payment_documents_payment ON project_payment_documents(payment_id,created_at DESC);
