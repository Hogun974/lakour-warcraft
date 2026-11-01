// Jetons des PNJ, des figurants et des peuples jouables de lakour-warcraft : quelle silhouette game-icons.net pour qui.
// Icônes de game-icons.net, licence CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/) : le dossier avant le
// « / » est l'auteur sur game-icons. Pour changer une icône : modifier la ligne ici, puis
// `npm run fabriquer-jetons-warcraft` (ajouter `-- --source <dossier icons-master de l'archive game-icons>` si l'icône
// n'a pas encore été copiée dans modules/lakour-mj-ia/outils/game-icons/), puis `npm run fabriquer-warcraft`.
// Les images, les crédits (CREDITS.md), figurants.json et les index des jetons de joueur sont écrits par
// outils/fabriquer-jetons-warcraft.mjs.

export const DOSSIER_JETONS = "modules/lakour-warcraft/assets/jetons";
export const cheminJeton = cle => `${DOSSIER_JETONS}/${cle}.svg`;
export const cheminJeton3d = cle => `${DOSSIER_JETONS}/3d/${cle}.svg`;
// Jetons de personnage joueur, un par peuple jouable ; index.json et index-3d.json (clé du peuple -> chemin) sont
// dans DOSSIER_JETONS, comme ceux de lakour-40k : le MJ IA y cherche le jeton du personnage qu'il crée.
export const cheminJetonJoueur = cle => `${DOSSIER_JETONS}/joueurs/${cle}.svg`;
export const cheminJetonJoueur3d = cle => `${DOSSIER_JETONS}/joueurs/3d/${cle}.svg`;
export const INDEX_JOUEURS = { "2d": `${DOSSIER_JETONS}/index.json`, "3d": `${DOSSIER_JETONS}/index-3d.json` };

// Clé du PNJ (compendium « bestiaire ») -> icône « auteur/nom ».
export const JETONS_PNJ = {
  // --- Bêtes et créatures d'Azeroth
  "murloc": "delapouite/fish-monster",
  "murloc-chasse-maree": "lorc/harpoon-trident",       // le trident du chasse-marée
  "kobold-mineur": "lorc/candle-light",                 // la bougie sur le casque
  "gnoll": "caro-asercion/hyena-head",
  "sanglier": "caro-asercion/boar",
  "loup": "lorc/wolf-head",
  "araignee-foret": "carl-olsen/spider-face",
  "harpie": "lorc/harpy",
  "centaure-kolkar": "delapouite/centaur",
  "huran-guerrier": "lorc/boar-tusks",                  // défenses de huran
  "ogre": "delapouite/ogre",
  "troll-fanecorce": "skoll/troll",
  "naga": "cathelineau/medusa-head",                    // chevelure de serpents des nagas
  "elementaire-terre": "delapouite/rock-golem",
  "dragonnet-noir": "lorc/wyvern",
  // --- Défias
  "bandit-defias": "delapouite/bandit",                 // le foulard rouge
  "chef-defias": "darkzaitzev/hooded-assassin",
  // --- Fléau
  "goule": "delapouite/shambling-zombie",
  "squelette": "skoll/skeleton",
  "abomination": "lorc/frankenstein-creature",          // chairs recousues
  "necromancien-culte": "delapouite/skull-staff",
  // --- Légion ardente
  "chien-corrompu": "lorc/hound",
  "satyre": "skoll/goat",
  "gangregarde": "lorc/horned-helm",
  // --- Gens d'Azeroth
  "garde-hurlevent": "lorc/visored-helm",
  "grunt-orgrimmar": "delapouite/orc-head",
  "paysan": "delapouite/farmer",
  "marchand": "lorc/swap-bag",
  "pretre-lumiere": "delapouite/sun-priest",
  "mage-dalaran": "delapouite/wizard-face",
  // --- Aventure « Les Puits de cendre »
  "grizzla-tordeboulon": "delapouite/goblin-head",
  "hanuk-pas-de-pluie": "lorc/minotaur",                // le tauren
  "grommel-defense-grise": "lorc/totem-mask",           // masque de géomancien
  "gorra-fiel-d-epine": "cathelineau/boar-ensign",      // l'emblème du kraal
  "drogha-cendrelame": "delapouite/warlock-hood",
  "ezzavel": "lorc/imp-laugh",                          // le rire du satyre
  // --- Campagne « Les Braises de la Légion »
  "vizzik-tirelire": "lorc/gear-hammer",                // le patron de la fonderie
  "dechiqueteur-fonderie": "lorc/circular-sawblade",
  "aelyra-ombrefeuille": "delapouite/falcon-moon",      // la sentinelle et sa chouette
  "sssthera": "lorc/sea-serpent",
  "corwen-haldis": "delapouite/griffin-shield",
  "garrok-brise-dent": "delapouite/tusks-flag",
  "iselle-marchebrume": "lorc/quill-ink",               // la scribe du sommet
  "drogha-embrase": "lorc/fire-silhouette",
  "infernal-brasegouffre": "lorc/burning-meteor",
  "cultiste-lame-ardente": "delapouite/executioner-hood",
  "fanatique-lame-ardente": "darkzaitzev/hooded-figure",
  "diablotin": "lorc/imp"
};

// Clé du peuple jouable (objet « race » du compendium peuples, flags.lakour-warcraft.cle) -> icône. Anneau bleu acier.
export const JETONS_PEUPLES = {
  "humain": "lorc/lion",                                // le lion des bannières humaines
  "nain": "delapouite/dwarf-face",
  "gnome": "delapouite/steampunk-goggles",              // lunettes de bricoleur
  "elfe-de-la-nuit": "delapouite/woman-elf-face",
  "draenei": "lorc/crystal-cluster",                    // les cristaux des naaru
  "worgen": "lorc/werewolf",
  "orc": "delapouite/orc-head",
  "troll": "lorc/tribal-mask",                          // masque vaudou
  "tauren": "delapouite/buffalo-head",
  "reprouve": "delapouite/half-dead",
  "elfe-de-sang": "kier-heyl/elf-helmet",
  "gobelin": "delapouite/goblin-head",
  "pandaren": "delapouite/panda"
};

// Jetons à part, sans PNJ : la foule que le MJ IA pose et retire à volonté. Anneau neutre (ambre).
export const JETONS_FIGURANTS = {
  "figurant-pelerin": { titre: "Figurant — Pèlerin", icone: "delapouite/pilgrim-hat" },
  "figurant-mineur": { titre: "Figurant — Mineur", icone: "delapouite/miner" },
  "figurant-marin": { titre: "Figurant — Marin", icone: "lorc/anchor" },
  "figurant-enfant": { titre: "Figurant — Enfant", icone: "delapouite/baby-face" },
  "figurant-gobelin": { titre: "Figurant — Gobelin", icone: "caro-asercion/goblin" },
  "figurant-cultiste": { titre: "Figurant — Cultiste", icone: "lorc/cultist" }
};

// Types de figurants proposés au MJ IA (assets/jetons/figurants.json) : jeton d'un PNJ du bestiaire ou jeton à part.
export const TYPES_FIGURANTS = {
  paysan: { libelle: "Paysan", jeton: "paysan" },
  "garde-alliance": { libelle: "Garde de l'Alliance", jeton: "garde-hurlevent" },
  grunt: { libelle: "Grunt de la Horde", jeton: "grunt-orgrimmar" },
  marchand: { libelle: "Marchand", jeton: "marchand" },
  pelerin: { libelle: "Pèlerin", jeton: "figurant-pelerin" },
  mineur: { libelle: "Mineur", jeton: "figurant-mineur" },
  marin: { libelle: "Marin", jeton: "figurant-marin" },
  enfant: { libelle: "Enfant", jeton: "figurant-enfant" },
  pretre: { libelle: "Prêtre de la Lumière", jeton: "pretre-lumiere" },
  bandit: { libelle: "Bandit", jeton: "bandit-defias" },
  kobold: { libelle: "Kobold", jeton: "kobold-mineur" },
  murloc: { libelle: "Murloc", jeton: "murloc" },
  gobelin: { libelle: "Gobelin", jeton: "figurant-gobelin" },
  cultiste: { libelle: "Cultiste", jeton: "figurant-cultiste" },
  "mort-vivant": { libelle: "Mort-vivant", jeton: "squelette" }
};

// Dossier game-icons -> nom de l'auteur tel que l'écrit game-icons.net (license.txt de l'archive).
export const AUTEURS = {
  "lorc": "Lorc",
  "delapouite": "Delapouite",
  "skoll": "Skoll",
  "darkzaitzev": "DarkZaitzev",
  "cathelineau": "Cathelineau",
  "caro-asercion": "Caro Asercion",
  "carl-olsen": "Carl Olsen",
  "kier-heyl": "Kier Heyl"
};

// Couleur de l'anneau selon l'attitude (prototypeToken.disposition), bleu acier pour les joueurs ; mêmes teintes que lakour-40k.
export const COULEURS_ANNEAU = {
  "-1": { attitude: "hostile", couleur: "#8a1414" },  // rouge sang
  "0": { attitude: "neutre", couleur: "#c8871a" },    // ambre
  "1": { attitude: "allié", couleur: "#2e7d36" },     // vert
  joueur: { attitude: "joueur", couleur: "#4b6b8a" }  // bleu acier
};

// Liseré selon le rang du PNJ (flags.lakour-warcraft.role) : doré pour un chef, argent pour une élite.
export const LISERES = { chef: "#d9b23a", elite: "#c4c8d0" };
