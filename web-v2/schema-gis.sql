-- V2 - Objets géographiques des projets
-- Stockage GeoJSON WGS84 (longitude, latitude) dans PostgreSQL JSONB.
-- Cette première version ne nécessite pas l'extension PostGIS.
CREATE TABLE IF NOT EXISTS project_geometries (
 id BIGSERIAL PRIMARY KEY,
 project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 geometry_type TEXT NOT NULL CHECK (geometry_type IN ('Point','LineString','Polygon')),
 geometry JSONB NOT NULL,
 label TEXT NOT NULL CHECK (length(trim(label)) BETWEEN 1 AND 200),
 description TEXT,
 properties JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 updated_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT project_geometries_type_matches CHECK (geometry->>'type'=geometry_type)
);
CREATE INDEX IF NOT EXISTS idx_project_geometries_project ON project_geometries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_geometries_properties ON project_geometries USING GIN(properties);
