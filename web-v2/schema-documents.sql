-- V2 - Gestion sécurisée des pièces jointes des projets
-- À exécuter une seule fois dans la base Project Manager V2.
-- Les fichiers physiques sont stockés dans web-v2/storage/documents (hors dossier public).
CREATE TABLE IF NOT EXISTS project_documents (
 id BIGSERIAL PRIMARY KEY,
 project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 section TEXT NOT NULL CHECK (section IN ('technical','finance')),
 document_type TEXT NOT NULL CHECK (
  (section='technical' AND document_type IN ('ordre_service','reception_provisoire','reception_definitive','bc_commission_pv','designation_letter'))
  OR (section='finance' AND document_type IN ('market_commission_pv'))
 ),
 title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 250),
 reference_number TEXT,
 document_date DATE,
 original_filename TEXT NOT NULL,
 stored_filename TEXT NOT NULL UNIQUE,
 mime_type TEXT NOT NULL CHECK (mime_type IN ('application/pdf','image/jpeg','image/png')),
 file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 20971520),
 uploaded_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_documents_project
 ON project_documents(project_id,section,document_date DESC);
CREATE INDEX IF NOT EXISTS idx_project_documents_type
 ON project_documents(document_type,document_date DESC);
