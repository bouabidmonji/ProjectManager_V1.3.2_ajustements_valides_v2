# Migration V1.3.2 vers V2 — Commune de Tataouine

## État
Cette branche contient le premier socle de migration PostgreSQL. Elle ne constitue pas encore une migration exécutée sur la base municipale et ne remplace pas V1.3.2.

## Fichiers
- `schema.sql` : schéma PostgreSQL cible.
- `migrate-v1-to-v2.js` : importateur ponctuel SQLite vers PostgreSQL.
- La base SQLite source est ouverte en lecture seule. Elle n'est ni modifiée ni supprimée.
- L'import s'exécute dans une transaction PostgreSQL : toute erreur provoque un rollback.
- L'import refuse une cible contenant déjà des projets.
- Les identifiants V1 sont conservés dans `legacy_id`, et les données sources complètes sont conservées dans `legacy_payload`.
- Les suivis et paiements sont rattachés aux nouveaux identifiants PostgreSQL via la correspondance des anciens IDs.
- Les dates de suivi ou de paiement manquantes provoquent l'arrêt : aucune date fictive n'est créée.

## Prérequis
- Node.js 22 ou supérieur.
- Une instance PostgreSQL V2 accessible.
- Les dépendances Node `better-sqlite3` et `pg`.
- Une copie de sauvegarde de la base SQLite V1.3.2.

## Installation des dépendances
Depuis le dossier de migration :

```powershell
npm init -y
npm install better-sqlite3 pg
```

## Exécution sous Windows PowerShell
Adapter le chemin de la base et l'adresse PostgreSQL à l'installation réelle :

```powershell
$env:SOURCE_SQLITE = "$env:APPDATA\project-manager-tataouine-v1.3\project-manager.sqlite"
$env:DATABASE_URL = "postgresql://UTILISATEUR:MOT_DE_PASSE@SERVEUR:5432/project_manager_v2"
node .\migrate-v1-to-v2.js
```

Ne pas placer le vrai mot de passe dans un fichier versionné ou partagé. Le serveur PostgreSQL doit être sauvegardé avant l'import.

## Contrôles après import
Le script contrôle :
1. l'intégrité SQLite avec `PRAGMA quick_check` ;
2. l'existence des tables attendues ;
3. les références des suivis et paiements vers un projet existant ;
4. les nombres de projets, suivis et paiements avant/après ;
5. l'import dans une transaction unique.

Le journal d'exécution est enregistré dans `migration_runs`.

## Limites à traiter avant mise en production
- Vérifier les volumes réels et les champs disponibles dans le fichier SQLite réel.
- Valider avec la commune les règles de génération des codes projet PM.
- Valider les correspondances comptables et les règles de calcul des soldes.
- Compléter les modules V2 (API, authentification, rôles, interface, marchés, Gantt, SIG, rapports PDF, sauvegardes).
- Effectuer une répétition sur une copie de la base, puis une recette fonctionnelle avec les agents.
- Ne jamais connecter les agents à V2 avant validation et sauvegarde vérifiée.

## Important
Ne pas lancer l'import sur une base de production sans avoir d'abord installé et configuré PostgreSQL, vérifié le chemin source et réalisé une sauvegarde distincte. La V1.3.2 reste la référence opérationnelle jusqu'à validation complète de V2.
