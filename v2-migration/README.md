# Project Manager V2 — Commune de Tataouine

## Architecture retenue
Application web client-serveur destinée à 3 à 5 agents sur le réseau local :
- navigateur web sur les postes agents ;
- serveur Node.js / Express sur le PC serveur ;
- base PostgreSQL centralisée ;
- accès distant ultérieur uniquement par VPN, sans exposition directe sur Internet.

## Migration depuis V1.3.2 à partir du dump SQL
Le dump source est `db/sqlite_dump.sql` sur la branche `main`.
Le script PostgreSQL prêt à exécuter est `v2-migration/migration_from_dump.sql`.

Ordre impératif dans une base PostgreSQL V2 neuve :
1. Exécuter `v2-migration/schema.sql`.
2. Exécuter `v2-migration/migration_from_dump.sql`.
3. Exécuter `web-v2/schema-auth.sql`.

Le script d'import :
- reprend les 37 projets et les 3 paramètres présents dans le dump ;
- conserve l'identifiant SQLite dans `legacy_id` et comme identifiant interne initial ;
- attribue un code immuable `PM-AAAA-NNNN` par année de programmation ;
- convertit les statuts opérationnels en valeurs normalisées V2 ;
- renseigne `current_programming_year` avec `annee`, car V1.3.2 ne contient qu'un seul champ d'année ;
- conserve la ligne source complète dans `legacy_payload` ;
- s'arrête si la table cible `projects` contient déjà des lignes ;
- vérifie que 37 projets ont été importés et annule la transaction si le contrôle échoue.

### Limite constatée dans le dump
Le dump contient les définitions des tables `project_followups` et `project_payments`, mais aucune instruction `INSERT` pour ces tables. Le script ne peut donc importer aucun suivi ni paiement. Il ne crée aucune date ou somme fictive. Le compteur SQLite `sqlite_sequence` mentionne `project_payments` à 4 alors qu'aucune ligne de paiement n'est présente dans le dump : cela peut signaler des identifiants de paiement antérieurement utilisés puis supprimés. Ces anciennes lignes ne sont pas récupérables depuis ce dump.
**Avant import définitif, vérifier si vous possédez un export plus complet des paiements et suivis.**

## Installation de l'application web
Prérequis : Node.js 22+, PostgreSQL 15+.

1. Copier le dossier `web-v2` sur le PC serveur.
2. Dans PowerShell, ouvrir ce dossier et lancer `npm install`.
3. Copier `.env.example` vers `.env` et renseigner les variables PostgreSQL et `JWT_SECRET`.
4. Exécuter `schema-auth.sql` sur la base V2 après les scripts de migration ci-dessus.
5. Créer le premier administrateur :
   ```powershell
   $env:DATABASE_URL="postgresql://UTILISATEUR:MOT_DE_PASSE@localhost:5432/project_manager_v2"
   $env:JWT_SECRET="SECRET_ALEATOIRE_DE_32_CARACTERES_MINIMUM"
   $env:ADMIN_USERNAME="admin"
   $env:ADMIN_NAME="Administrateur"
   $env:ADMIN_PASSWORD="MOT_DE_PASSE_LONG_ET_UNIQUE"
   npm run admin:create
   ```
6. Reporter les mêmes paramètres dans le fichier `.env`.
7. Démarrer le serveur : `npm start`.
8. Depuis les postes du LAN, ouvrir `http://IP_DU_PC_SERVEUR:3001`.

## Fonctions actuellement présentes dans le socle V2
- Authentification avec cookie HTTP-only et expiration de session.
- Contrôle des rôles côté API : administrateur, agent, membre, supervision.
- Tableau de bord initial et liste/recherche des projets.
- Création de projet et code annuel automatique.
- API de consultation et modification des champs principaux.
- Gestion initiale des utilisateurs par API (création réservée à l'administrateur).
- Journal d'audit minimal.
- Contrôle de santé de l'API et de la connexion PostgreSQL.

## Modules non encore terminés
La version présente est un socle de développement, pas une version de production. Restent notamment :
- fiche projet complète et historique des modifications ;
- responsabilités principales et secondaires, droits fins par domaine ;
- suivi financier complet (paiements, engagements, reliquats, contrôles) ;
- module marchés et étapes de procédure ;
- diagrammes de Gantt et alertes ;
- SIG Leaflet : points, polylignes, polygones, photos ;
- rapports PDF français/arabe et interface arabe RTL complète ;
- sauvegarde/restauration, gestion des sessions et durcissement de sécurité ;
- tests d'intégration, de charge et recette avec les agents.

Ne pas remplacer V1.3.2 avant validation fonctionnelle et financière de V2.
