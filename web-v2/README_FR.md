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
4. Exécuter `web-v2/schema-workspace.sql` pour activer les responsabilités et l'historique.

Le script d'import :
- reprend les 37 projets et les 3 paramètres présents dans le dump ;
- conserve l'identifiant SQLite dans `legacy_id` et comme identifiant interne initial ;
- attribue un code immuable `PM-AAAA-NNNN` par année de programmation ;
- convertit les statuts opérationnels en valeurs normalisées V2 ;
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
5. Exécuter `schema-workspace.sql` après `schema-auth.sql` pour créer l'historique et les responsabilités organisationnelles.
6. Exécuter `schema-profiles-finance.sql` pour installer les profils `admin`, `technical`, `finance` et `viewer`.
7. Exécuter `schema-responsibility-surveyor.sql` pour autoriser l'affectation d'un surveillant aux projets.
8. Exécuter `schema-documents.sql` pour créer la bibliothèque des pièces jointes.
9. Exécuter `schema-gis.sql` pour créer les objets géographiques GeoJSON.
10. Créer le premier administrateur :
   ```powershell
   $env:DATABASE_URL="postgresql://UTILISATEUR:MOT_DE_PASSE@localhost:5432/project_manager_v2"
   $env:JWT_SECRET="SECRET_ALEATOIRE_DE_32_CARACTERES_MINIMUM"
   $env:ADMIN_USERNAME="admin"
   $env:ADMIN_NAME="Administrateur"
   $env:ADMIN_PASSWORD="MOT_DE_PASSE_LONG_ET_UNIQUE"
   npm run admin:create
   ```
11. Reporter les mêmes paramètres dans le fichier `.env`.
12. Démarrer le serveur : `npm start`.
13. Depuis les postes du LAN, ouvrir `http://IP_DU_PC_SERVEUR:3001`.

## Fonctions actuellement présentes dans le socle V2
- Authentification avec cookie HTTP-only et expiration de session.
- Contrôle des profils côté API : administrateur, service technique, service financier et consultation.
- Tableau de bord avec deux rangées d'indicateurs (portefeuille puis finances), graphiques interactifs et évolution annuelle du nombre de projets et de l'avancement physique moyen.
- Clôture financière dédiée aux consultations : saisie de la date du dernier paiement et de la date de clôture, avec contrôle chronologique et historisation.
- Graphiques animés et interactifs ; répartition annuelle indépendante du filtre global.
- Filtres de projets par année enregistrée, état opérationnel et catégorie.
- Fiche projet avec données techniques, suivis, finances, paiements, pièces jointes et historique détaillé des changements avant/après.
- Bibliothèque documentaire centralisée avec filtres par année, catégorie, sous-catégorie et type de pièce.
- Module SIG Leaflet : points, polylignes et polygones GeoJSON, édition et traçabilité des objets.
- Permissions métier contrôlées côté serveur : technique pour le suivi physique ; finance pour ressources, crédits, paiements et clôture ; consultation en lecture seule.
- Basculement de langue français/arabe et prise en charge RTL de l'interface principale.
- Tableau de bord initial et liste/recherche des projets.
- Création de projet et code annuel automatique.
- API de consultation et modification des champs principaux.
- Fiche projet consultable, responsabilités par domaine et historique des affectations.
- Responsable principal obligatoire à la création d'un projet.
- Gestion des comptes depuis « Comptes utilisateurs » (création réservée à l'administrateur) ; le surveillant est un utilisateur existant affecté au projet dans les responsabilités.
- Journal d'audit minimal.
- Contrôle de santé de l'API et de la connexion PostgreSQL.

## Modules non encore terminés
La version présente est un socle de développement, pas une version de production. Restent notamment :
- gestion détaillée des marchés, engagements et pièces justificatives financières ;
- suivi financier complet (engagements, pièces justificatives, rapprochements et contrôles) ;
- module marchés et étapes de procédure ;
- diagrammes de Gantt et alertes ;
- fonds cartographiques hors ligne et outils SIG avancés (longueurs/surfaces en projection, analyses spatiales, photos géoréférencées) ;
- traduction intégrale des formulaires et rapports PDF français/arabe ;
- sauvegarde/restauration, gestion des sessions et durcissement de sécurité ;
- tests d'intégration, de charge et recette avec les agents.

Ne pas remplacer V1.3.2 avant validation fonctionnelle et financière de V2.
