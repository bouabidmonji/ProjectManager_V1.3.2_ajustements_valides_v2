# Journal des modifications – V1.3.0 (premier lot fonctionnel)

## Ajouts
- Création additive de la table `project_payments` : paiements individuels par projet, date réelle, montant au millième de dinar, référence, type de document et observation.
- Ajout, modification et suppression d'une opération de paiement depuis la fiche projet.
- Calcul automatique du cumul des paiements détaillés par projet. Tant qu'aucun paiement détaillé n'est saisi pour un projet, l'ancien champ cumulatif `credits_consommes` reste utilisé et n'est pas écrasé.
- Export Excel d'une feuille supplémentaire `historique_paiements`.
- Sauvegarde/restauration prenant en charge la nouvelle table des paiements.
- Filtre annuel du tableau de bord et réorganisation des indicateurs : projets, taux de consommation, retards, projets achevés.
- Graphiques par source de financement et par catégorie (coût actualisé / payé).
- Exclusion des projets achevés et annulés des alertes de retard.

## Limites de ce premier lot
- Les paiements historiques des projets existants ne sont pas préremplis : ils doivent être saisis à partir des fiches imprimées de l'application financière.
- Le cumul historique existant est conservé comme valeur de référence jusqu'à l'enregistrement d'au moins une opération détaillée pour le projet. À partir de ce moment, le cumul affiché est la somme des opérations détaillées : il faut donc saisir l'historique complet de ce projet avant de basculer.
- Le filtre annuel du tableau de bord porte sur l'année de programmation du projet. L'analyse des paiements par année de paiement, distincte de l'année de programmation, reste à développer.
- Les modules cartographie, photothèque, rapports périodiques PDF, comparaison temporelle d'avancement et audit détaillé ne sont pas encore implémentés dans ce premier lot.
