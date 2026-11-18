# PROJECT MANAGER – COMMUNE DE TATAOUINE
## Cahier des charges fonctionnel – version 1.2 consolidée

### 1. Objet et principes
Application Windows monoposte de pilotage des projets communaux, fonctionnement local après installation, base SQLite, interface française/arabe, import/export Excel, sauvegardes locale quotidienne et manuelle. Le nombre de projets est illimité : les 37 lignes initiales sont uniquement le jeu de données de démarrage.

### 2. Données et états
Conservation des champs historiques : gouvernorat, commune, intitulé, catégorie, sous-catégorie, année, coûts initial et actualisé, sources de financement, ressources réalisées, crédits consommés, dates, durée contractuelle, taux physique, étape et observations.
État opérationnel : Non démarré, En cours, Bloqué/Suspendu, Achevé, Annulé.
Situation calendaire calculée indépendamment : Normal, En retard, Échéance proche, Démarrage à surveiller, Actualisation nécessaire. Un projet « En cours » qui dépasse son échéance reste « En cours » et reçoit une alerte distincte « En retard ».

### 3. Fiche projet et navigation
- Un clic sur la ligne ou l'intitulé ouvre la fiche détaillée.
- Les actions Modifier et Supprimer restent distinctes ; suppression avec confirmation.
- Fiche structurée : identification, programmation, coût/financement, avancement, calendrier, blocages et observations.
- Recherche multicritère et filtres année/catégorie.

### 4. Historique des suivis – nouvelle fonctionnalité V1.2
- Enregistrement daté de chaque suivi dans une table dédiée, sans écraser les suivis précédents.
- Un suivi peut enregistrer taux physique, crédits consommés, étape, état opérationnel et observations.
- Le suivi actualise les valeurs courantes du projet lorsqu'une valeur est renseignée.
- La fiche projet présente l'historique chronologique.
- La date du dernier suivi provient du dernier enregistrement de suivi, jamais de l'année de programmation ni de la date de création.
- Le tableau de bord « Projets récemment suivis » ne présente que les projets ayant au moins un suivi, classés par date décroissante du dernier suivi.
- Export Excel avec deux feuilles : projets et historique_suivi.

### 5. Blocages et seuils
Déclaration manuelle du blocage ; motif obligatoire dans la fiche projet, avec date, action corrective et date prévisionnelle de reprise. Seuils paramétrables : démarrage après programmation (90 jours par défaut), absence de suivi (30 jours par défaut), échéance proche (30 jours par défaut). Aucun changement automatique de l'état opérationnel.

### 6. Calculs et tableau de bord
KPI : nombre de projets, coût actualisé, crédits consommés, avancement physique moyen. Répartitions par année et état. Alertes : blocage, retard, démarrage à surveiller, échéance proche, absence de suivi récent. Impression tableau de bord et liste filtrée ; export Excel.

### 7. Données, migration et sauvegarde
- Migration additive de la base V1.1 : création de la table d'historique sans supprimer les projets existants.
- Les 37 projets déjà enregistrés restent présents ; aucune réinitialisation automatique si la base contient des projets.
- Sauvegarde automatique quotidienne au lancement, sauvegarde manuelle et restauration avec confirmation.
- Import Excel ajoute les lignes importées ; une procédure de détection des doublons et de mise à jour contrôlée reste à consolider avant usage de masse.

### 8. Évolutions prévues après V1.2 (à conserver dans la feuille de route)
1. Planning Gantt avec dates de programmation, démarrage et fin contractuelle.
2. Analyse financière détaillée : taux d'engagement, taux de consommation, reliquat, comparatif avancement physique/financier.
3. Rapports dédiés : situation annuelle, état financier, retards, blocages, par catégorie/secteur/source de financement ; modèles A4/A3 avec en-tête officiel.
4. Pièces jointes classées par projet (marchés, études, PV, correspondances) avec stockage local.
5. Gestion avancée des imports : prévisualisation, détection des doublons, choix ajouter/mettre à jour, rapport d'anomalies.
6. Amélioration complète de la traduction arabe/RTL et des exports bilingues.

### 9. Recette V1.2
- Les 37 projets existants sont conservés après migration.
- Un clic sur une ligne/intitulé ouvre la fiche projet.
- Modifier et supprimer restent accessibles séparément ; suppression confirmée.
- Un suivi daté est ajouté et consultable dans l'historique.
- Le tableau « récemment suivis » est trié par date réelle de suivi et exclut les projets sans suivi.
- Le dernier suivi actualise les valeurs courantes renseignées.
- Les exports Excel comportent les feuilles projets et historique_suivi.
- Les alertes de retard restent indépendantes de l'état opérationnel.
- Sauvegarde et restauration ne doivent pas supprimer l'historique.

**Important :** cette version est une version de validation fonctionnelle. La recette sur le PC Windows de la commune est obligatoire avant usage réel et avant génération de l'installateur définitif.
