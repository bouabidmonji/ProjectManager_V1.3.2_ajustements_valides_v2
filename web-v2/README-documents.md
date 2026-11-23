# Project Manager V2 — Pièces jointes

## Installation de la dépendance

Dans le dossier `web-v2`, exécuter :

```bash
npm install
```

La dépendance `multer` est utilisée pour recevoir les fichiers téléversés.

## Migration PostgreSQL

Après la création des tables `projects` et `app_users`, et après les migrations V2 déjà utilisées par l'installation, exécuter une seule fois le script :

`schema-documents.sql`

Le script crée la table `project_documents` et ses index. Il ne modifie pas les données des projets existants.

## Stockage des fichiers

Par défaut, les fichiers sont enregistrés dans :

`web-v2/storage/documents`

Ce dossier est situé hors du répertoire public de l'application et est exclu de Git. Le chemin peut être remplacé par la variable `DOCUMENT_STORAGE_DIR` dans le fichier `.env`. Pour un serveur LAN, il est recommandé de choisir un dossier persistant sur le disque du serveur et de limiter ses permissions au compte qui exécute Node.js.

Formats acceptés : PDF, JPG et PNG. Taille maximale : 20 Mo par fichier. Le serveur vérifie l'extension, le type MIME et la signature du fichier. Les téléchargements passent par une route authentifiée et les droits suivent les profils technique et financier.

## Sauvegarde

La sauvegarde doit inclure **la base PostgreSQL et le dossier physique de documents**. Une sauvegarde de la seule base ne contient pas les fichiers. Il faut également restaurer les deux éléments ensemble pour conserver les pièces jointes.
