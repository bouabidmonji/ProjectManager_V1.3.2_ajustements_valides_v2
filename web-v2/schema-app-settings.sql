-- Project Manager V2 : référentiel central des paramètres applicatifs.
-- À exécuter une seule fois sur la base V2 existante.
CREATE TABLE IF NOT EXISTS app_settings (
 id BIGSERIAL PRIMARY KEY,
 group_key TEXT NOT NULL,
 code TEXT NOT NULL,
 label_fr TEXT NOT NULL CHECK (length(trim(label_fr)) BETWEEN 1 AND 160),
 label_ar TEXT,
 parent_id BIGINT REFERENCES app_settings(id) ON DELETE RESTRICT,
 metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
 sort_order INTEGER NOT NULL DEFAULT 0,
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 is_system BOOLEAN NOT NULL DEFAULT FALSE,
 created_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 updated_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT app_settings_group_code_unique UNIQUE(group_key,code),
 CONSTRAINT app_settings_no_self_parent CHECK(parent_id IS NULL OR parent_id<>id)
);
CREATE INDEX IF NOT EXISTS idx_app_settings_group_active ON app_settings(group_key,is_active,sort_order,label_fr);
CREATE INDEX IF NOT EXISTS idx_app_settings_parent ON app_settings(parent_id);
CREATE TABLE IF NOT EXISTS app_settings_history (
 id BIGSERIAL PRIMARY KEY,
 setting_id BIGINT,
 group_key TEXT NOT NULL,
 code TEXT NOT NULL,
 action TEXT NOT NULL CHECK(action IN ('created','updated','activated','deactivated')),
 before_data JSONB,
 after_data JSONB,
 user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_settings_history_created ON app_settings_history(created_at DESC);
-- Préserver les valeurs historiques des projets : les codes initiaux reprennent exactement les libellés existants.
INSERT INTO app_settings(group_key,code,label_fr,is_system)
SELECT DISTINCT 'project_category',trim(category),trim(category),true
FROM projects WHERE NULLIF(trim(category),'') IS NOT NULL
ON CONFLICT(group_key,code) DO NOTHING;
INSERT INTO app_settings(group_key,code,label_fr,parent_id,is_system)
SELECT DISTINCT 'project_subcategory',trim(p.subcategory),trim(p.subcategory),c.id,true
FROM projects p
LEFT JOIN app_settings c ON c.group_key='project_category' AND c.code=trim(p.category)
WHERE NULLIF(trim(p.subcategory),'') IS NOT NULL
ON CONFLICT(group_key,code) DO NOTHING;
INSERT INTO app_settings(group_key,code,label_fr,is_system,sort_order) VALUES
 ('operational_status','not_started','Non démarré',true,10),
 ('operational_status','in_progress','En cours',true,20),
 ('operational_status','blocked','Bloqué / suspendu',true,30),
 ('operational_status','completed','Achevé',true,40),
 ('operational_status','cancelled','Annulé',true,50),
 ('procedure_type','marche','Marché',true,10),
 ('procedure_type','consultation','Consultation',true,20),
 ('procedure_type','designation_directe','Désignation directe',true,30),
 ('document_type_technical','ordre_service','Ordre de service',true,10),
 ('document_type_technical','reception_provisoire','PV de réception provisoire',true,20),
 ('document_type_technical','reception_definitive','PV de réception définitive',true,30),
 ('document_type_technical','bc_commission_pv','PV de la commission BC',true,40),
 ('document_type_technical','designation_letter','Lettre de désignation',true,50),
 ('document_type_finance','market_commission_pv','PV de la commission des marchés',true,10),
 ('gis_symbol','monument','Monument',true,10),
 ('gis_symbol','building','Bâtiment administratif',true,20),
 ('gis_symbol','school','Établissement scolaire',true,30),
 ('gis_symbol','sport','Équipement sportif',true,40),
 ('gis_symbol','health','Centre de santé',true,50),
 ('gis_symbol','water','Ouvrage hydraulique',true,60),
 ('gis_symbol','road','Projet routier',true,70),
 ('gis_symbol','other','Autre équipement',true,80)
ON CONFLICT(group_key,code) DO NOTHING;
INSERT INTO app_settings(group_key,code,label_fr,is_system)
SELECT DISTINCT 'technical_stage',trim(current_stage),trim(current_stage),true
FROM projects WHERE NULLIF(trim(current_stage),'') IS NOT NULL
ON CONFLICT(group_key,code) DO NOTHING;
INSERT INTO app_settings(group_key,code,label_fr,is_system)
SELECT DISTINCT 'technical_stage',trim(current_stage),trim(current_stage),true
FROM project_followups WHERE NULLIF(trim(current_stage),'') IS NOT NULL
ON CONFLICT(group_key,code) DO NOTHING;

-- Les types documentaires sont gérés par le référentiel app_settings.\nALTER TABLE project_documents DROP CONSTRAINT IF EXISTS project_documents_document_type_check;\nALTER TABLE project_documents ADD CONSTRAINT project_documents_document_type_check CHECK (section IN ('technical','finance') AND length(trim(document_type)) BETWEEN 1 AND 120);\n