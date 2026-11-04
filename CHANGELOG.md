# Journal des versions — La Kour Warcraft

Les versions sont celles du module `lakour-warcraft` (`modules/lakour-warcraft/module.json`). Le moteur commun
`lakour-mj-ia` (sous-module) a son propre journal ; la version du moteur embarquée est rappelée quand elle change.
Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), dates au format AAAA-MM-JJ.

## Non publié

- Dépôt préparé pour la publication : README en français et en anglais, manifeste complet (manifeste, téléchargement,
  signalement de bogues, journal, licence, médias), script d'empaquetage `outils/empaqueter-module.mjs`, workflow de
  release GitHub sur tag `v*`, liste de contrôle `docs/publication.md`.
- Moteur MJ IA embarqué : 0.39.0 (0.37.1 puis 0.39.0, 2026-11-03).

## 0.10.1 — 2026-11-03

### Corrigé
- Totems élémentaires : un totem qui tombe (fin de la Rage, fin du combat, porteur disparu) emporte les effets qu'il
  avait donnés aux alliés.

## 0.10.0 — 2026-11-03

### Ajouté
- Neuf capacités de sous-classe de plus automatisées (`scripts/capacites-suite.js`) : Châtiment du Fléau (cibles
  limitées aux morts-vivants et fiélons), Champion de la Lumière (lumière vive du jeton), Avatar des éléments (activité
  « Regagner l'avatar »), Poigne de la mort (jeton attiré sur sauvegarde ratée), Armée des morts (goules levées et
  renvoyées), Aspect de la meute et Frénésie bestiale (recopiés sur le familier lié), Totems élémentaires (gabarit,
  effets aux alliés à 3 m), Ivresse du sage (réaction « Renverser l'assaillant »).
- Les auras suivent les déplacements des jetons (recalcul aux crochets `updateToken` et `moveToken`, positions lues
  dans la source du jeton).
- Seule « Maître du déguisement » reste à l'appréciation du MJ (`CAPACITES_EN_PARTIE`).

### Sécurité
- Une carte de chat (sauvegarde, utilisation, attaque) n'est exploitée que si son auteur est MJ ou propriétaire de ce
  qu'elle touche ; noms échappés dans les messages.

## 0.9.0 — 2026-11-03

### Ajouté
- Cinq fêtes de saison des Tarides, déclinées du calendrier du MJ IA : la Trêve des Présents, la Veille des Aïeux, la
  Nuit des Calebasses, les Tambours du Long Jour, la Mascarade de Cabestan. Pour chacune : journal du MJ illustré,
  table de trois contrats de fête, objets de fête ; table de paquets-surprises ; page « Fêtes de saison (MJ) » du guide
  du MJ. Enregistrement auprès du moteur par `scripts/fetes.js`.
- Illustrations des fêtes (`assets/fetes/*.jpg`) générées localement.
- Moteur MJ IA 0.37.0 (0.35.0 au passage).

## 0.8.0 — 2026-11-03

### Ajouté
- Auras (Aura de pureté, Aura de froid) : l'effet est copié sur les alliés dans le rayon, ralentissement des ennemis.
- Familier du chasseur lié à son rôdeur (activité « Lier le familier », API `lierFamilier`) : points de vie et « Lien
  du chasseur » suivent le niveau du rôdeur.
- Évasion d'agent (l'invisibilité tombe à l'attaque ou au sort) et Fût roulant (à terre sur sauvegarde ratée).
- Établi d'artisanat : fenêtre ouverte depuis la fiche de personnage, recettes lues au compendium, test d'outil dnd5e,
  composants et fournitures consommés selon la règle d'artisanat.
- Illustration de l'écran d'accueil du monde (`assets/monde/fond.jpg`).
- Moteur MJ IA 0.34.0.

## 0.7.0 — 2026-11-02

### Ajouté
- Métiers d'Azeroth : trois métiers de récolte (herboristerie, minage, dépeçage) et quatre d'artisanat (alchimie,
  forge, ingénierie, cuisine) ; composants, recettes, tables de récolte par biome, pages des guides.
- Cinq sous-classes de plus (treize en tout) : Voie du chaman des totems (barbare), Voie du maître brasseur (moine),
  Serment du chevalier de la mort (paladin), Chasseur et son familier (rôdeur), Aspect des Vols draconiques
  (ensorceleur) ; familier du chasseur au bestiaire.
- Garnison de faction : six installations de bastion (dnd5e, règles 2024), table « Missions des suivants », journal.
- Moteur MJ IA 0.30.0 (puis 0.31.0 et 0.32.0).

## 0.6.0 — 2026-11-02

### Ajouté
- « Les Tarides vivantes » : tableaux de contrats (Cabestan, le Carrefour, Theramore), donjon « La Raffinerie de
  Mèche-Noire » (trois boss à phases, butin, journal de rencontre), montures et routes aériennes, rares et élites
  errants (trois zones, butin garanti), consommables et buffs de groupe, réputations à paliers auprès de dix factions
  (horloges du MJ IA créées à l'installation).
- Premiers automatismes (`scripts/automatismes.js`) : fureur (Furie sanguinaire, Héroïsme, Épuisement), effets non
  cumulables, ensemble « Tenue réglementaire de Mèche-Noire », phase 2 des boss, liens morts du chat des joueurs.
- Moteur MJ IA 0.29.0.

## 0.4.2 — 2026-11-02

### Ajouté
- One-shot « Une nuit aux Deux Lanternes » (niveau 3, une soirée) : journal, trois cartes, aides de jeu, PNJ ;
  proposé aux mondes déjà installés.

### Corrigé
- Installateur : style plat si le réglage du MJ IA manque, au lieu de bloquer.

## 0.4.1 — 2026-11-02

### Corrigé
- Installateur : les guides et les aides de jeu restent visibles des joueurs ; installation plus sûre (une seule à la
  fois, erreur montrée au MJ).

## 0.4.0 — 2026-11-01

### Ajouté
- Couche joueur complète : dons (origine, généraux, styles de combat, faveurs épiques), affiliations et atouts ou
  handicaps de faction, sorts maison et listes de sorts par classe, arsenal (armes de faction, armures, munitions,
  prothèses, objets magiques), afflictions (blessures, maladies, corruption gangrenée), huit sous-classes.
- Journaux liés (références `@UUID`, jets cliquables) ; scènes vivantes (sons, zones, épingles vers les journaux).
- Aventures en un clic : compendium « Aventures prêtes à jouer » (documents Adventure) et démarrage rapide à la
  création d'un monde ; bestiaire aux couleurs des factions ; icônes peintes pour les capacités des PNJ.
- Tables : un PNJ au pied levé, temps et chemins du voyage.

## 0.3.0 — 2026-11-01

- Création du dépôt : module `lakour-warcraft` (peuples, historiques, objets, bestiaire, guides, aventure « Les Puits
  de cendre », campagne « Les Braises de la Légion », cartes jouables) et moteur commun `lakour-mj-ia` en sous-module.
