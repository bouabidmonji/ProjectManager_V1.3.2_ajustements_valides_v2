# Project Manager – Commune de Tataouine (V1.3.2)

## Pré-requis
- Windows 10/11
- Node.js 22 LTS
- Dépendances npm du projet

## Lancement depuis les sources
Dans CMD, ouvrir le dossier du projet puis exécuter :

```cmd
npm install
npx electron-rebuild -f -w better-sqlite3
npm start
```

Si les dépendances sont déjà installées et que `better-sqlite3` fonctionne avec Node.js 22, ne relancez pas inutilement la reconstruction.

## Nouveautés V1.3.2
- Tableau de bord enrichi : icônes KPI, jauge circulaire de consommation, barre de progression du taux de réalisation et thermomètre de l'avancement physique moyen.
- Anneaux animés, courbe annuelle avec remplissage et barres comparatives par catégorie.
- Affichage immédiat des détails sous le graphique sélectionné, avec ouverture directe des fiches projet.
- Suivi de la réception provisoire, de la garantie, de la réception définitive, du règlement définitif et de la clôture effective.
- Garantie de 12 mois par défaut pour les marchés, modifiable selon le marché.
- Garantie facultative pour les consultations : 0 mois par défaut lors de la sélection d'une consultation ; durée modifiable si une garantie est prévue.
- Alerte de dépassement du délai de trois mois après réception définitive.
- Distinction entre solde financier provisoire et reliquat définitif. Le reliquat définitif n'est calculé que lorsque réception définitive, règlement définitif et clôture effective sont renseignés.

## Conservation des données
Le chemin de la base locale reste `appData/project-manager-tataouine-v1.3` afin de conserver la base déjà utilisée par les versions V1.3.x. Les migrations ajoutent les champs nécessaires sans supprimer les projets, les historiques de suivi ou les paiements.

**Précaution :** avant le premier lancement de cette version, créer une sauvegarde SQLite depuis l'application et conserver une copie indépendante du dossier de données. La V1.2 reste séparée et ne doit pas être modifiée.

## Création de l'installateur Windows
Après installation des dépendances et validation de l'application :

```cmd
npm run dist
```

L'installateur est produit dans `dist` si la compilation Windows aboutit.
