-- Mise à jour d'une base existante : procédure de désignation directe.
ALTER TABLE project_documents DROP CONSTRAINT IF EXISTS project_documents_document_type_check;
ALTER TABLE project_documents ADD CONSTRAINT project_documents_document_type_check CHECK (
 (section='technical' AND document_type IN ('ordre_service','reception_provisoire','reception_definitive','bc_commission_pv','designation_letter'))
 OR (section='finance' AND document_type IN ('market_commission_pv'))
);
