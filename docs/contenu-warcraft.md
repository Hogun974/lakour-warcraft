# Module `lakour-warcraft` — contenu original pour D&D 5e (Azeroth)

Relevé le 31/10/2026 dans les compendiums et le code de dnd5e 6.0.6 (règles 2024, Foundry v14, build 14.369).
Jumeau des autres modules de contenu La Kour : mêmes outils de cartes et de jetons, même MJ IA.

## Pourquoi ce module

Le système `dnd5e` gratuit fournit les règles et le SRD 5.2 (classes, sorts, dons, équipement, monstres), mais rien
sur Azeroth. On écrit **notre propre contenu**, original et en français : peuples, historiques, objets, bestiaire,
guides, une aventure de départ et sa campagne. **On ne recopie rien** de Blizzard ni de Wizards of the Coast : on
reprend les noms de l'univers pour un usage privé, et des **statistiques du SRD 5.2 (CC-BY-4.0)** renommées et
adaptées pour les créatures (crédit dans `CREDITS.md`). Les dons, sorts et équipements du SRD sont **référencés par
leur uuid dnd5e**, jamais recopiés.

## Ce que contient le module

| Compendium | Contenu | Fichier source |
|---|---|---|
| `peuples` (Item) | 13 peuples (`race`) et leurs traits (`feat`, type `race`) | `contenu/peuples.mjs` |
| `historiques` (Item) | 10 historiques 2024 (`background`) et des dons d'origine maison | `contenu/historiques.mjs` |
| `objets` (Item) | armes, armures, potions, objets peu communs, butin | `contenu/objets-azeroth.mjs` |
| `bestiaire` (Actor) | 30 créatures types, les PNJ de l'aventure et de la campagne (`npc`) | `bestiaire.mjs`, `aventure.mjs`, `campagne.mjs` |
| `journaux` (JournalEntry) | guide du joueur (visible), guide du MJ (caché), le livre des Tarides (livre d'univers des joueurs, visible), aventure et campagne (cachées), aides de jeu (visibles) | `guides.mjs`, `livre-univers.mjs`, `aventure.mjs`, `campagne.mjs` |
| `tables` (RollTable) | noms, rumeurs, rencontres, complications, trouvailles | `guides.mjs` |
| `scenes` (Scene) | 4 cartes de l'aventure, 4 de la campagne, 8 lieux génériques (`lieu-…`) | `aventure-cartes.mjs`, `campagne-cartes.mjs`, `lieux-cartes.mjs` |
| `aventures` (Adventure) | l'aventure et la campagne, chacune en un paquet importable en un clic | `aventures-paquets.mjs` |

Tout est rassemblé dans `contenu/index.mjs` (`DOCUMENTS`, dans l'ordre des compendiums).

### L'aventure et la campagne

- **Les Puits de cendre** (niveaux 1 à 3) : les Tarides autour de Cabestan, port neutre du Cartel où la **Trêve de
  Cabestan** interdit les combats entre Horde et Alliance. Groupe de l'Alliance, de la Horde ou mixte.
- **Les Braises de la Légion** (niveaux 3 à 6, suite de l'aventure) : quatre chapitres sur quatre lieux (fonderie de
  Fort-Rivet, ruines englouties d'Eldrassal, sommet de Gué-de-Sel, cratère de Brasegouffre). Le journal caché
  « Campagne — Les Braises de la Légion » a les pages *Synopsis*, *Fil rouge et horloge* (24 jours, les quatre
  Braises), une page par chapitre (« À lire », indices avec DD, rencontres et dangers), *Dénouements et récompenses* et
  *PNJ et forces en présence*. Deux aides de jeu visibles : la lettre de la Lame ardente et le sauf-conduit du sommet.

Chaque carte d'aventure porte `flags["lakour-warcraft"].aventure` (titre de l'aventure ou de la campagne) :
`scripts/main.js` range les scènes importées dans un dossier par titre. Les lieux `lieu-…` n'en ont pas et restent au
compendium.

### Installer une aventure : deux voies

- **Bouton « Installer »** (réglages du module, ou proposition au premier lancement) : `scripts/main.js` importe tous
  les guides, aventures et cartes dans un monde existant, et met à jour ce qu'une version précédente avait installé.
- **Import natif d'Adventure** : le compendium `aventures` (type `Adventure`, lié à `dnd5e`) contient un paquet par
  aventure, *Les Puits de cendre* et *Les Braises de la Légion* (`contenu/aventures-paquets.mjs`). Chacun embarque les
  journaux, les cartes (pas les lieux `lieu-…`), les PNJ, et les acteurs, objets et tables cités par ses journaux, rangés
  dans un dossier au nom de l'aventure. Les copies gardent les identifiants des autres compendiums (Foundry importe
  avec `keepId`) : les épingles des cartes visent les journaux importés. Dans les copies, un lien vers un document
  embarqué vise sa copie dans le monde (`@UUID[Actor.<id>]`) ; les autres restent vers le compendium. Journaux et
  scènes portent la version de l'installateur, qui ne les écrase donc pas ensuite. Réimporter une aventure, ou importer
  la campagne après l'aventure (PNJ communs), déclenche l'avertissement d'écrasement de Foundry.
- **Démarrage rapide** (Foundry 14) : `module.json` déclare
  `"quickstart": { "adventures": { "dnd5e": { "uuid": "Compendium.lakour-warcraft.aventures.Adventure.<id>" } } }`
  (forme du schéma `BaseModule` de 14.369 : un objet `{ uuid }`, pas une chaîne). À la création d'un monde dnd5e,
  Foundry propose *Les Puits de cendre* ; la campagne s'importe ensuite depuis le compendium.

Une Adventure est stockée en un seul enregistrement LevelDB (`!adventures!<id>`) avec ses documents embarqués en
entier : la CLI ne l'éclate pas en sous-clés, les `_key` des copies sont donc retirées. Essais :
`essais/warcraft-aventures.test.mjs` (validation stricte par les schémas de Foundry avec `FOUNDRY_V14=<dossier
contenant common/>`).

## Clés de dnd5e utilisées (CONFIG.DND5E)

- Caractéristiques : `str dex con int wis cha` (en français dans nos constructeurs : `for dex con int sag cha`)
- Compétences : `acr ani arc ath dec his ins itm inv med nat prc prf per rel slt ste sur`
  (acrobaties, dressage, arcanes, athlétisme, tromperie, histoire, intuition, intimidation, investigation, médecine,
  nature, perception, représentation, persuasion, religion, escamotage, discrétion, survie)
- Tailles : `tiny sm med lg huge grg` (TP P M G TG Gig) ; cases de jeton : 1, 1, 1, 2, 3, 4
- Types de créature : `aberration beast celestial construct dragon elemental fey fiend giant humanoid monstrosity ooze plant undead`
- Dégâts : `acid bludgeoning cold fire force lightning necrotic piercing poison psychic radiant slashing thunder` ; soins `healing temphp`
- États : `blinded charmed deafened exhaustion frightened grappled incapacitated invisible paralyzed petrified poisoned prone restrained stunned unconscious`
- Types d'arme : `simpleM simpleR martialM martialR natural improv` ; maîtrises 2024 : `cleave graze nick push sap slow topple vex`
- Propriétés d'arme : `ada amm fin fir foc hvy lgt lod mgc rch rel ret sil spc thr two ver`
- Équipement : `light medium heavy shield clothing trinket ring rod wand wondrous` ; consommables `ammo food poison potion rod scroll trinket wand` ;
  butin `art gear gem junk material resource treasure`
- Raretés : `"" common uncommon rare veryRare legendary artifact` ; monnaies `pp gp ep sp cp`
- Activation : `"" action bonus reaction minute hour day longRest shortRest special` ; récupération `lr sr day dawn dusk initiative turnStart turnEnd recharge`
- Clés de maîtrise (avancement `Trait`) : `skills:ath`, `saves:con`, `tool:art:smith`, `tool:thief`, `weapon:mar`,
  `armor:lgt`, `languages:standard:orc`, `dr:fire`, `ci:poisoned`, avec `*` pour « au choix » (`languages:standard:*`)
- Langues : standard `common sign draconic dwarvish elvish giant gnomish goblin halfling orc` ; exotiques
  `aarakocra abyssal celestial deep gith gnoll infernal primordial sylvan undercommon cant druidic`. Les langues
  d'Azeroth (darnassien, taur-ahe…) sont décrites en texte et rattachées à la langue dnd5e la plus proche.

Toutes ces listes sont dans `contenu/objets.mjs` et `contenu/acteurs.mjs` : une valeur inconnue lève une erreur à la
construction, et les essais revérifient les documents fabriqués.

## Formes des données (dnd5e 6.0.6)

### Avancements : `system.advancement` est une MappingField

Depuis dnd5e 5.3, `system.advancement` n'est **plus un tableau** : c'est un **objet indexé par `_id`**
(`{ "<id>": { _id, type, configuration, value, level, title, hint, flags } }`). Un tableau est accepté par
Foundry mais casse l'assistant d'avancement. Types utilisés :

- `Size` : `configuration.sizes: ["med"]` (peuples)
- `ItemGrant` : `configuration.items: [{ uuid, optional }]`, `spell: null | { ability, method, prepared, uses }`.
  L'`uuid` est **une chaîne** (`Compendium.lakour-warcraft.peuples.Item.<id>` ou `Compendium.dnd5e.feats24.Item.…`),
  pas un objet `{ uuid, id, name }` : d'où la référence `{ __ref, __uuid: true }` résolue en chaîne par le fabricant.
- `ItemChoice` : `choices: { 0: { count, replacement } }`, `pool: [{ uuid }]`, `restriction: { type: "feat", subtype: "origin" }`
- `Trait` : `mode`, `allowReplacements`, `grants: [clé]`, `choices: [{ count, pool: [clé] }]`
- `AbilityScoreImprovement` (historiques 2024) : `points: 3`, `cap: 2`, `fixed`, `locked` (les trois
  caractéristiques non proposées)

Un sort accordé par un trait : `method: ""`, `prepared: 0` pour un tour de magie ; `method: "spell"`, `prepared: 2`,
`uses: { max: "1", per: "lr", requireSlot: false }` pour un sort lancé une fois par repos long.

### Activités

`system.activities` est aussi un objet indexé par `_id`. Chaque activité a la forme complète du SRD 5.2 :
`_id, type, name, img, sort, activation { type, value, condition, override }, consumption { targets, scaling, spellSlot },
description, duration, effects, range, target { template, affects, prompt, override }, uses, visibility`. Types
utilisés : `attack` (`attack { ability, bonus, critical, flat, type { value: melee|ranged, classification: weapon|spell } }`
et `damage { includeBase, parts }`), `save` (`save { ability: [..], dc { calculation, formula } }`,
`damage { onSave: half|none, parts }`), `heal` (`healing`, comme une partie de dégâts), `damage`, `utility` (`roll { prompt, visible, name, formula }`).
Une partie de dégâts : `{ number, denomination, bonus, types: [..], custom { enabled, formula }, scaling { mode, number, formula } }`.
Le bloc `visibility` (ajouté en 5.x) est présent sur chaque activité, comme dans les compendiums de 6.0.6.

Pour les PNJ, le bonus d'attaque n'est **pas stocké** : dnd5e le recalcule (modificateur de la caractéristique +
maîtrise du FP). `pnj()` choisit la caractéristique dont le calcul donne le bonus annoncé, refuse sinon, et écrit le
bonus annoncé dans `flags["lakour-warcraft"].toucher` pour les essais. Les dégâts exacts du profil sont portés par
l'activité (`includeBase: false`), sans `@mod`.

### Effets actifs (Foundry 14)

`type: "base"`, `system.changes: [{ key, value, priority, type, phase: "initial", _id }]` (le mode s'appelle
désormais `type` : `add multiply override upgrade downgrade custom`), `duration.units: "seconds"`, `statuses`,
`transfer`. Clé : `!items.effects!<objet>.<effet>` ; copié dans un acteur : `!actors.items.effects!<acteur>.<objet>.<effet>`
(sinon deux acteurs qui copient le même objet se marchent dessus dans le LevelDB).

### Peuples, historiques, objets

- **race** : `advancement` (Size, ItemGrant des traits, Trait pour les maîtrises, ItemGrant des sorts, ItemChoice
  d'un don d'origine), `movement { walk: "9", …, units: "m" }`, `senses { ranges { darkvision: 18 }, units: "m" }`,
  `type { value: "humanoid", subtype }`. En mètres, comme tout le module (voir « Unités » plus bas).
- **feat** de trait de peuple : `type { value: "race" }` ; don d'origine : `type { value: "feat", subtype: "origin" }`.
- **background** : `advancement` (ASI, Trait compétences + outil, ItemGrant du don, Trait langues),
  `startingEquipment` (groupe `AND` + entrées `linked` vers un uuid + `currency`), `wealth` (option B, en po).
- **weapon / equipment / consumable / loot** : prix `{ value, denomination }`, poids `{ value, units: "lb" }`,
  `rarity`, `attunement`, `properties`, `mastery`. Arme : `range { value, long, reach, units: "m" }` (`reach: null`
  laisse dnd5e mettre 1,5 m, ou 3 m avec la propriété `rch`) ; équipement : `speed.units: "m"`.
- Tous : `system.source = { custom: "La Kour Warcraft", rules: "2024", revision: 1 }`, `identifier` = la clé.

### Unités : tout en mètres

Depuis le 31/10/2026, **tout le module est en mètres**, comme la grille des scènes : peuples, traits, historiques,
dons, objets, PNJ et textes. Conversion simplifiée de D&D (celle de dnd5e, `movementUnits.m.conversion = 10/3`) :
**5 pieds = 1,5 m**, donc `pieds / 5 × 1,5`.

| Pieds | 5 | 10 | 15 | 20 | 30 | 35 | 60 | 120 | 20/60 | 40/120 | 80/320 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Mètres | 1,5 | 3 | 4,5 | 6 | 9 | 10,5 | 18 | 36 | 6/18 | 12/36 | 24/96 |

- **Données** : `units: "m"` partout où dnd5e en attend une : `movement.units`, `senses.units` (peuples et PNJ),
  `range.units` et `target.template.units` des activités, `range.units` des armes, `speed.units` de l'équipement.
  Les valeurs sont des nombres de mètres (`walk: "10.5"`, `darkvision: 18`, `range { value: 6, long: 18 }`,
  `template.size: "3"`). Les constructeurs de `objets.mjs` ne connaissent que `m` et `km` (une portée en `ft` ou
  `mi` lève une erreur) ; `peuple()` veut une vitesse de 6 à 12 m par pas de 1,5 m et une vision de 18 ou 36 m.
- **Effets** : les valeurs ajoutées s'entendent dans les unités de l'acteur, donc en mètres (forme sauvage +3 m,
  élixir +1,5 m, nage 9 m, perception des vibrations 18 m).
- **Textes** : « 9 m », « 1,5 m », « 10,5 m » (virgule décimale, espace avant `m`), jamais « pieds », « pi » ni
  « ft ». Les tailles des peuples (« 1,70 à 1,90 m ») ne sont pas des distances de jeu et gardent leurs deux décimales.
- Un personnage joueur prend les unités de son peuple tant que les siennes sont vides (`prepareRace`, `??=`) : dans
  un monde dnd5e réglé en impérial, un acteur créé avec `units: "ft"` lirait 9 pieds. Activer les unités métriques de
  dnd5e (`metricLengthUnits`) dans le monde évite la question.
- `essais/warcraft-unites.test.mjs` parcourt tous les documents fabriqués et refuse une clé `units` à `ft` ou `mi`
  et un texte en pieds (« 30 pieds », « 5 pi », « 10 ft »), avec des mutations.

### PNJ (acteur `npc`) : unités en mètres

`system.attributes.movement` et `senses` ont `units: "m"` ; allonges, portées et zones des capacités sont en mètres
(`range.units: "m"`, `template.units: "m"`). `ac { flat, calc: "natural" }`, `hp { value, max, formula }` (la moyenne
des dés de vie est vérifiée), `details { cr, type { value, subtype }, biography { value, public } }` (le texte joueur
dans `public`, la note du MJ seulement dans `value`), `traits { size, di, dr, dv, ci, languages }`. Les capacités sont
des objets `weapon` (attaques) ou `feat` (traits, actions, sauvegardes) **copiés dans `items`** par le fabricant.
`prototypeToken` : image du jeton, disposition (-1 hostile, 0 neutre, 1 allié), largeur selon la taille.

### Scènes : grille de 1,5 m

Les cartes sont décrites par un **plan en cases** (`largeur`, `hauteur`, `lumiere: jour|penombre|nuit`, `pieces`,
`ouvertures`, `lumieres`, `elements`) et converties par `planVersScene` de `modules/lakour-mj-ia/scripts/cartes.js`,
le même convertisseur que l'outil `creer_scene` du MJ IA, avec `{ taille: 100, distance: 1.5 }` : **une case = 100 px =
1,5 m**, `grid.units: "m"`. Sols : `metal pierre terre ferraille sanctuaire herbe eau bois luxe cendre`. Ouvertures :
`porte secrete verrouillee fenetre passage`, posées sur le bord d'une case (`cote: nord|sud|est|ouest`). Une grande
pièce de fond peut couvrir toute la carte, les bâtiments posés par-dessus (la dernière pièce gagne la case).
Les **éléments nommés** (comptoir, puits, autel, moteur à éclat…) sont les repères du MJ IA pour placer les jetons ;
`assets/cartes/plans.json` les recopie pour l'installateur.

## Automatismes (scripts/)

Repérés par des drapeaux `flags["lakour-warcraft"]` posés par le contenu, jamais par les noms ; seul le MJ actif écrit
(sauf l'établi, qui n'écrit que sur la fiche de son propriétaire). Logique pure exportée, éprouvée par mutations
(`essais/warcraft-automatismes`, `warcraft-capacites`, `warcraft-capacites-suite`, `warcraft-etabli`). Les positions de
jetons sont lues dans leur source (`_source.x/y/elevation` : destination d'un déplacement ; en Foundry 14, `x/y` valent
la position animée pendant l'animation), et les auras sont recalculées aux hooks `updateToken` et `moveToken`.

| Fichier | Automatisme | Repères |
|---|---|---|
| `automatismes.js` | fureur, effets uniques, ensembles, phase 2 des boss, liens morts du chat | `fureur`, `unique`, `ensemble`, `boss` |
| `capacites.js` | Aura de pureté et Aura de froid (copie de l'effet sur les alliés du rayon, ralentissement des ennemis au début de leur tour) | `aura` (capacité et effet), `auraRecue`, `auraRalenti` |
| `capacites.js` | familier du chasseur (PV et « Lien du chasseur » suivent le rôdeur) | `familier` (fiche), `compagnon`, `lierFamilier` (activité), `rodeur`, `lienChasseur` |
| `capacites.js` | Évasion d'agent : l'invisibilité tombe à l'attaque ou au sort | `evasion` (effet) |
| `capacites.js` | Fût roulant : à terre sur sauvegarde ratée (message `save` relié à son activité par `system.activity`) | `aTerre`, `futRoulant` |
| `capacites-suite.js` | Châtiment du Fléau : sauvegarde refusée si toutes les cibles ont un type connu autre que mort-vivant ou fiélon, cibles de la carte filtrées, effet retiré d'une créature d'un autre type connu (type inconnu : le MJ décide) | `typesVises` (activité et effet) |
| `capacites-suite.js` | Champion de la Lumière : lumière vive de 9 m sur les jetons du porteur pendant l'effet, lumière d'avant rétablie à la fin | `lumiere` (effet), `lumiereAvant` (jeton) |
| `capacites-suite.js` | Avatar des éléments : activité « Regagner l'avatar », consommation native (utilisation −1, emplacement de niveau 5) ; refusée si l'utilisation n'est pas dépensée ou si l'emplacement est décoché (`dnd5e.preActivityConsumption`) | `recharge` (activité) |
| `capacites-suite.js` | Poigne de la mort : sauvegarde ratée → jeton déplacé (action « displace », coût nul) jusqu'à l'espace libre voisin du chevalier au bout de la ligne droite (murs testés si la scène est sur le canevas du MJ) ; remis en place sur résistance légendaire | `attire`, `poigne` (message) |
| `capacites-suite.js` | Armée des morts : goules du bestiaire importées (acteur marqué, propriétaires du chevalier), posées dans les espaces libres à 9 m, ajoutées au combat juste après le chevalier ; renvoyées au bout de 10 rounds (ou 60 s du monde), à la fin du combat ou de l'effet | `armee` (activité, effet, acteur importé) |
| `capacites-suite.js` | Aspect de la meute : effet recopié sur les familiers liés, même durée | `meute`, `meuteRecue` |
| `capacites-suite.js` | Frénésie bestiale : capacité (et sa Morsure enragée) recopiée sur la fiche du familier lié | `frenesie`, `frenesieRecue` |
| `capacites-suite.js` | Totems élémentaires : le gabarit fixe (`stationary`, émanation dnd5e dont la base est la case du totem) est le totem ; effet appliqué au barbare et à ses alliés à 3 m de sa case, hostiles du magma nommés au MJ, totem ôté à la fin de la Rage, au plus tard 10 minutes du monde après la pose, à la fin du combat ou quand son porteur n'existe plus ; planter hors de la Rage refusé | `totem` (activité, région), `totemRecu` |
| `capacites-suite.js` | Ivresse du sage : attaque au corps à corps (ni lancée ni à distance) ratée contre le moine en Ivresse insondable → réaction proposée ; « Renverser l'assaillant » met à terre en une écriture | `ivresse` (effet), `renverser` (activité) |
| `etabli.js` | établi d'artisanat (fenêtre ApplicationV2, contrôle « Établi » des fiches de personnage) | `recettes` (journal des recettes), `cle` (composants, produits) |

API (`game.modules.get("lakour-warcraft").api`) : `installer()`, `cheminSelonStyle()`, `lierFamilier(familier, rodeur)`,
`ouvrirEtabli(acteur)`. Ce qui reste au MJ est listé, avec sa raison, dans `CAPACITES_EN_PARTIE` (`contenu/sous-classes.mjs`) :
depuis la 0.10.0, seul **Maître du déguisement** (se grimer et passer pour un autre : jugement du MJ, aucune clé d'acteur).

Choix tranchés : un porteur d'aura **neutre** (ou secret) ne la donne à personne, un PJ (amical) la donne aux jetons
amicaux ; le rayon (en mètres) est converti dans l'unité de la scène (`grid.units`), unité inconnue = pas d'aura ;
seul un propriétaire du familier, ou un MJ, peut le lier ; l'établi prend un verrou par acteur, relit l'inventaire après
le jet et n'écrit rien s'il manque quoi que ce soit ; le contrôle « Établi » n'a qu'un `onClick` (pas d'`action`).
Capacités (0.10.0) : une carte (sauvegarde, utilisation, attaque) n'est exploitée que si son auteur est MJ ou propriétaire de ce qu'elle touche (chevalier, jeton déplacé, moine, assaillant) ; les noms sont échappés dans les messages ; la lumière du Champion garde une lumière déjà plus grande ; les goules et la Poigne ne se posent que
sur grille carrée ou sans grille (hexagonale : message au MJ) ; l'Armée des morts levée en combat dure 10 rounds jusqu'au
tour du chevalier (`CONFIG.time.roundTime` = 6 s), sinon 60 s du temps du monde ; la Rage est reconnue par un effet appliqué à l'acteur
venu de l'objet d'identifiant `rage` (SRD 2024), jamais par l'effet de l'objet lui-même (dnd5e le prépare actif dès
qu'une activité le cite) ; l'Armée des morts finit au tour du combattant du chevalier, repéré par son id ; la
mémoire des attaques ratées de l'Ivresse est celle du poste du MJ actif (deux minutes, perdue au rechargement).

## Jetons

`outils/fabriquer-jetons-warcraft.mjs` dessine des SVG autonomes de 400×400 (silhouettes de **game-icons.net**,
CC BY 3.0, copiées dans `modules/lakour-mj-ia/outils/game-icons/`) en deux styles, plat et relief :

- un jeton par **PNJ** (`assets/jetons/<cle>.svg` et `3d/<cle>.svg`), anneau rouge, ambre ou vert selon la
  disposition, liseré doré (chef) ou argent (élite) ;
- un jeton par **figurant** et `assets/jetons/figurants.json` (types de figurants proposés au MJ IA) ;
- un jeton de **personnage joueur par peuple jouable** (`assets/jetons/joueurs/<cle>.svg` et `joueurs/3d/<cle>.svg`),
  anneau bleu acier, et les index **`assets/jetons/index.json`** et **`index-3d.json`** :
  `{ "<flags.lakour-warcraft.cle de l'objet race>": "modules/lakour-warcraft/assets/jetons/joueurs/<cle>.svg" }`.
  Le MJ IA y cherche le jeton du personnage qu'il crée, comme pour les rôles de lakour-40k.

Les correspondances PNJ → icône et peuple → icône sont dans `contenu/jetons.mjs` ; `CREDITS.md` est réécrit à chaque
fabrication.

## Fabrication

```
npm run fabriquer-jetons-warcraft      # jetons, index, figurants.json, CREDITS.md
                                       # (-- --source <icons-master> pour une icône pas encore copiée)
node outils/fabriquer-warcraft.mjs     # src/<pack>/*.json puis packs/ (LevelDB, @foundryvtt/foundryvtt-cli)
npm run essais                         # essais/*.test.mjs de ce dépôt (Warcraft)
npm run valider -- <dossier contenant common/ de Foundry v14>   # modules/lakour-mj-ia/outils/valider-foundry.mjs
```

`fabriquer-warcraft` rassemble `DOCUMENTS`, refuse une clé en double ou un compendium inconnu, résout les références
`ref("pack:cle")` en `{ uuid, id, name }` (une référence orpheline fait échouer la fabrication), copie les objets dans
les acteurs avec des clés imbriquées, écrit les sources puis compile. Les identifiants sont **stables** (hachage de
la clé) : refabriquer ne change pas les uuid. Les cartes écrivent leurs fonds (`assets/cartes/<cle>.svg` et
`3d/<cle>.svg`) et `plans.json` seulement s'ils ont changé.

## Pièges rencontrés

- **`system.advancement` en tableau** : forme d'avant 5.3. Il faut un objet indexé par `_id`.
- **uuid d'ItemGrant** : une chaîne, pas un objet ; résolu par `{ __ref, __uuid: true }`.
- **Activités** : reprendre la forme complète du SRD 6.0.6 (avec `visibility`), même pour une activité sans jet.
- **Effets** : `system.changes` avec `type` (l'ancien `mode`) et `phase` (Foundry 14) ; et une clé imbriquée sous
  l'acteur pour chaque copie, sinon collision dans le LevelDB.
- **Bonus d'attaque des PNJ** : impossible à écrire en dur, dnd5e le recalcule. Un profil dont le bonus ne colle pas
  à une caractéristique est refusé par `pnj()` ; pour une attaque magique à la Dextérité, préciser `carac: "dex"`.
- **Points de vie** : `pv` doit être la moyenne exacte de `dv` (arrondie à l'inférieur, plus le bonus).
- **Unités** : tout en mètres (5 pieds = 1,5 m), données et textes ; une portée en `ft` est refusée à la construction.
- **Dessins de scène sans auteur** : le serveur rejette en silence les étiquettes de pièces au chargement du
  compendium (`DocumentAuthorField`) ; on met un auteur fictif stable, remplacé par le MJ à l'installation. Seule la
  validation stricte (`valider-foundry.mjs`) le voit hors de Foundry.
- **Ouverture sans mur** : une porte posée entre deux cases de la même pièce est refusée par le convertisseur
  (« il n'y a pas de mur à cet endroit ») ; les rives et les lisières ouvertes se font avec `rangee("passage", …)`.
- **Traits de peuple et peuples** : tous deux au compendium `peuples` ; seuls les objets `race` ont un jeton de joueur.
- **Langues** : en 2024 elles viennent de l'historique, pas du peuple.
- **Textes** : html() n'échappe que `& < >` ; écrire en texte simple avec `**gras**`, `*italique*` et des listes « - ».
