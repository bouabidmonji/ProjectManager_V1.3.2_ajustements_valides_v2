-- Limiter à une seule pièce jointe par type et par projet.
-- Le script s'arrête sans supprimer de fichiers si des doublons existent déjà.
DO $$
BEGIN
 IF EXISTS (
  SELECT 1 FROM project_documents
  GROUP BY project_id, document_type
  HAVING COUNT(*) > 1
 ) THEN
  RAISE EXCEPTION 'Doublons de pièces jointes détectés : supprimez manuellement les doublons dans un même projet/type avant de relancer ce script.';
 END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS uq_project_documents_one_per_type
 ON project_documents(project_id, document_type);
