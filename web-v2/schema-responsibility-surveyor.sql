-- V2: ajouter le rôle de surveillant de projet aux affectations
ALTER TABLE project_responsibilities
 DROP CONSTRAINT IF EXISTS project_responsibilities_responsibility_role_check;
ALTER TABLE project_responsibilities
 ADD CONSTRAINT project_responsibilities_responsibility_role_check
 CHECK (responsibility_role IN ('principal','surveyor','technical','finance','procurement','gis'));
