# Project Manager — V1.3.2

## Tableau de bord
- KPI enrichis avec pictogrammes, jauge circulaire de consommation, barre de progression des projets achevés et thermomètre de l'avancement physique moyen.
- Anneaux de répartition animés et graphiques annuels avec zone remplie.
- Détails des catégories affichés directement sous le graphique sélectionné, avec accès aux fiches projet en un clic.
- Barres comparatives par catégorie avec remplissage proportionnel.

## Clôture administrative et financière
- Suivi des marchés et consultations, avec durée de garantie paramétrable.
- Marché : garantie de 12 mois par défaut ; durée modifiable.
- Consultation : aucune garantie par défaut ; durée modifiable si une garantie est prévue.
- Calcul de la date théorique de fin de garantie et du délai de clôture de trois mois après réception définitive.
- Statuts calculés de clôture : période de garantie, réception définitive à enregistrer, à clôturer, délai dépassé, clôture incomplète, clôturé définitivement.
- Distinction entre solde financier provisoire et reliquat définitif ; ce dernier n'est affiché que lorsque réception définitive, règlement définitif et clôture effective sont renseignés.

## Conservation des données
- Les colonnes de clôture sont conservées dans la base SQLite existante.
- Le chemin de données `project-manager-tataouine-v1.3` est maintenu afin de préserver la base locale existante.

### Ajustements du tableau de bord — révision interactive
- Harmonisation des interactions des graphiques : clic sur les segments, légendes, catégories et points annuels pour afficher les projets correspondants directement sous le graphique.
- Info-bulles au survol indiquant uniquement le nombre de projets et le montant global associé.
- Pour les graphiques annuels, le clic affiche les projets de l'année sélectionnée dans le panneau intégré, sans modifier le filtre général du tableau de bord.
- Conservation du style visuel existant : anneaux animés, barres, remplissages et courbe annuelle.
- Le centre de l'anneau d'état affiche désormais le nombre total de projets.

## Révision tableau de bord financier — 16/11/2026

- Suppression du KPI « Avancement physique moyen » du tableau de bord. Le taux physique reste conservé dans les fiches et le suivi individuel des projets.
- Refonte du graphique « Crédits par type de projet » : comparaison sur une même échelle des crédits alloués (coût actualisé) et des crédits consommés (paiements enregistrés), avec zoom horizontal réglable.
- Ajout du graphique d'évolution annuelle des crédits alloués par catégorie, selon l'année de programmation (`annee`). La série Infrastructure est mise en évidence.
- Ajout d'info-bulles graphiques personnalisées au survol : nombre de projets et montants correspondants.
- Conservation de l'ouverture des listes de projets au clic sur les segments, points et catégories.
- Réorganisation du suivi de clôture : alertes de clôture définitive dépassées, solde financier provisoire des projets achevés non clôturés, et reliquat définitif des projets clôturés.
- Aucun changement de schéma SQLite ni de logique d'enregistrement des projets/paiements dans cette révision.

### Contrôles effectués
- Vérification syntaxique JavaScript (`node --check`) sur `renderer.js` et `main.js`.
- Vérification de l'unicité des identifiants HTML.
- Vérification statique des nouvelles zones de graphique et de leurs gestionnaires d'interaction.
- Lancement visuel Electron et compilation Windows non exécutés dans cet environnement ; à valider sur le poste Windows.

## Correctif graphiques — 17/11/2026

- Ajout d'une animation de tracé progressif à la courbe annuelle des crédits alloués ; la surface sous la courbe apparaît progressivement.
- Remplacement de l'affichage simultané de toutes les catégories par un filtre « Type de projet » ; Infrastructure est sélectionnée par défaut lorsqu'elle est présente.
- Conservation des info-bulles (année, nombre de projets, montant alloué) et du clic ouvrant les projets de la catégorie et de l'année sélectionnées.
- Animation progressive de la courbe de répartition par année, des barres comparatives alloué/consommé et de la jauge de consommation.
- Respect du réglage système de réduction des animations.
- Aucun changement apporté au schéma SQLite, aux paiements, aux règles de clôture ou aux calculs financiers.
- Le KPI « Taux d'avancement physique moyen » n'est pas présent dans le HTML de cette archive.

### Vérifications de cette correction
- `node --check` réussi sur `src/renderer.js` et `src/main.js`.
- Aucun identifiant HTML dupliqué ; présence vérifiée des éléments de filtre, de courbe et de détail.
- Vérification statique des événements de filtre, survol et clic.
- Le lancement visuel d'Electron et la compilation Windows restent à effectuer sur le PC cible.


## Ajustements validés — 17/11/2026

- Suppression du panneau de détails déclenché par le clic sur une année dans le graphique « Répartition par année » ; les info-bulles au survol sont conservées.
- Le graphique « Évolution annuelle des crédits alloués par type de projet » utilise désormais l'ensemble des projets, indépendamment du filtre annuel global.
- Remplacement du filtre de catégorie à choix unique par une sélection multiple ; toutes les catégories sont cochées par défaut et peuvent être masquées individuellement.
- Affichage simultané des courbes sélectionnées sur une échelle commune ; la courbe Infrastructure reste visuellement mise en évidence.
- Clic sur un point de la courbe : affichage des projets correspondant à la catégorie et à l'année du point.
- Remplacement des boutons textuels d'action dans la liste des projets par les icônes Consulter, Modifier et Supprimer, avec libellés accessibles et info-bulles.
- Suppression d'un projet : avertissement indiquant le nombre de suivis et de paiements associés, double confirmation en présence d'historique, sauvegarde SQLite préalable et suppression transactionnelle avec prise en compte des clés étrangères en cascade.
