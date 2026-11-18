# PROJECT MANAGER – COMMUNE DE TATAOUINE
## Cahier des charges fonctionnel – version 1.1

### 1. Objet
Application Windows monoposte de gestion et de pilotage des projets communaux, issue du classeur `Suivi_projet_2022-2026(1).xlsx`.

### 2. Environnement et principes
- Windows 10/11, fonctionnement local sans connexion Internet après installation.
- Interface française/arabe avec bascule de langue et prise en charge RTL.
- Apparence claire, dominante bleu foncé.
- Electron pour l'application de bureau ; SQLite pour les données locales.
- Sauvegarde automatique quotidienne au démarrage (une sauvegarde par date) et sauvegarde/restauration manuelles.
- Import et export Excel.

### 3. Données projet
Conserver les champs historiques : gouvernorat, commune, intitulé, catégorie, sous-catégorie, année, coûts initial et actualisé, sources de financement, ressources réalisées, crédits consommés, date de début des travaux, durée contractuelle, taux physique, étape et observations.

Ajouter :
- Date exacte de programmation ;
- État opérationnel ;
- Date de blocage ;
- Motif du blocage ;
- Action corrective envisagée ;
- Date prévisionnelle de reprise ;
- Date de dernière actualisation.

### 4. Deux dimensions indépendantes : état et situation
**État opérationnel** (saisi/confirmé par le gestionnaire) :
- Non démarré / en préparation ;
- En cours ;
- Bloqué / suspendu ;
- Achevé ;
- Annulé.

**Situation calendaire** (calculée automatiquement) :
- Normal ;
- En retard ;
- Échéance contractuelle proche ;
- Démarrage à surveiller ;
- Actualisation nécessaire.

Règle essentielle : un projet dont l'état est « En cours » reste compté parmi les projets en cours même si sa date contractuelle est dépassée. Le retard est une alerte séparée et ne remplace pas l'état opérationnel.

### 5. Gestion des blocages
- Déclaration manuelle uniquement : aucune durée d'inactivité ne transforme automatiquement un projet en projet bloqué.
- Lorsque l'état « Bloqué / suspendu » est sélectionné, le motif est obligatoire.
- Motifs proposés : problème foncier, études techniques, procédure de marché, crédits indisponibles, difficultés avec l'entreprise, réseaux concessionnaires, difficultés administratives, opposition/riverains, autre.
- Saisir date du blocage, action corrective et date prévisionnelle de reprise.

### 6. Seuils paramétrables
Valeurs initiales proposées, modifiables dans Paramètres :
- Projet non démarré après programmation : 90 jours ;
- Projet en cours sans actualisation : 30 jours ;
- Échéance contractuelle proche : 30 jours avant la fin contractuelle.

Le seuil de démarrage se calcule depuis la date exacte de programmation. L'année de programmation seule ne suffit pas. Les anciens projets sans date exacte ne déclenchent donc pas cette alerte avant saisie de la date.

### 7. Calculs
- Total des financements : somme des sources déclarées.
- Reliquat : ressources réalisées moins crédits consommés.
- Taux financier : crédits consommés / ressources réalisées × 100, si ressources réalisées > 0.
- Fin contractuelle : date de début des travaux + durée contractuelle en mois.
- Retard : nombre de jours après la date contractuelle, sauf projet achevé ou annulé.
- Taux physique : saisi et actualisé par le gestionnaire.

### 8. Tableau de bord et rapports
- KPI : nombre de projets, coût actualisé global, crédits consommés, avancement physique moyen.
- Répartition annuelle et répartition par état.
- Alertes : projets bloqués, en retard, démarrage à surveiller, échéance proche et actualisation nécessaire.
- Impression du tableau de bord et de la liste filtrée des projets ; choix de l'imprimante ou « Enregistrer au format PDF » dans la boîte d'impression Windows.
- Export Excel des projets et de leurs champs calculés.

### 9. Gestion et sécurité des données
- Ajout, modification, suppression avec confirmation.
- Enregistrement transactionnel dans SQLite.
- Sauvegarde automatique quotidienne et sauvegarde manuelle.
- Restauration avec avertissement de remplacement de la base courante.
- Le classeur Excel initial doit être conservé séparément comme archive source.

### 10. Évolutions ultérieures
À développer après validation de la version 1.1 : graphiques financiers détaillés, comparaison physique/financier, planning Gantt, historique détaillé des changements, pièces jointes par projet et modèles de rapports A4/A3 avec en-tête officiel.

### 11. Conditions de recette
1. Les 37 projets du fichier source sont présents à la première ouverture.
2. Un ajout, une modification et une suppression restent cohérents après fermeture/réouverture.
3. Un projet en cours avec échéance dépassée apparaît simultanément comme « En cours » et « En retard ».
4. Un projet bloqué nécessite un motif.
5. Les seuils modifiés sont conservés et changent les alertes calculées.
6. L'impression du tableau de bord et de la liste filtrée fonctionne.
7. L'export Excel contient les dernières modifications.
8. Une sauvegarde puis une restauration permettent de retrouver les données.
9. Le changement français/arabe bascule l'interface et le sens d'écriture.

**Statut :** spécification fonctionnelle validée pour prototypage ; la recette sur le PC Windows de l'utilisateur reste obligatoire avant utilisation réelle.
