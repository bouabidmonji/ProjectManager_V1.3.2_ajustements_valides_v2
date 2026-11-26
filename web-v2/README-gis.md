# Module SIG — Project Manager V2

## Dépendances et installation

Dans `web-v2`, exécuter :

```bash
npm install
```

Le module utilise Leaflet et Leaflet Draw, servis localement par Express depuis `node_modules`. L'installation des bibliothèques se fait une seule fois sur le PC serveur. Les fonds cartographiques OpenStreetMap nécessitent toutefois une connexion Internet depuis les postes clients.

## Migration PostgreSQL

Exécuter une seule fois `schema-gis.sql` dans la base V2, après les migrations de base et d'authentification.

## Données géographiques

Les objets sont enregistrés au format GeoJSON dans une colonne PostgreSQL JSONB, en coordonnées WGS84 (longitude, latitude). Les types admis sont :
- Point
- LineString (polyligne)
- Polygon (polygone fermé)

Cette solution n'exige pas l'extension PostGIS et facilite le déploiement sur le serveur LAN existant. Elle permet l'affichage, la modification et la suppression des objets. Les analyses spatiales avancées (intersection, longueur/surface calculées en projection, requêtes spatiales) pourront être ajoutées ultérieurement avec PostGIS.

## Utilisation

- Le profil administrateur et le profil technique peuvent créer, modifier et supprimer les objets.
- Les autres profils peuvent consulter la carte et ouvrir la fiche complète du projet en cliquant sur un objet.
- Sélectionner le projet avant de dessiner.
- Utiliser les outils Leaflet Draw pour placer un point, tracer une polyligne ou dessiner un polygone.
- Renseigner le nom et la description de l'objet puis enregistrer.
- Pour modifier la géométrie, utiliser les outils d'édition de la carte.
- Les modifications et suppressions sont consignées dans l'historique du projet.

Les fonds OpenStreetMap sont soumis à leurs conditions d'utilisation et à leur politique d'utilisation des tuiles.
