// Cartes de l'aventure « Les Puits de cendre » (Tarides, autour de Cabestan) : plans en cases de 1,5 m, convertis
// en scènes v14 jouables par scene() de cartes.mjs (même convertisseur que l'outil creer_scene du MJ IA).
// Les éléments nommés (puits, chariot, totem, autel…) servent de repères au MJ IA pour placer les jetons.
// Scènes vivantes : une épingle sur chaque lieu clé, vers sa page du journal de l'aventure (ou de l'aide de jeu), et
// des zones invisibles des joueurs (texte de lore à l'entrée, pause avant un combat majeur, obscurité d'une galerie).
import { scene } from "./cartes.mjs";
import { epingle } from "./cles-journaux.mjs";
import { rangee } from "./lieux-cartes.mjs";

export const TITRE_AVENTURE = "Les Puits de cendre";

// Pages visées par les épingles (« clé du journal#titre de la page »).
const SCENE_1 = "aventure-puits-de-cendre#Scène 1 — Le contrat du Cartel";
const SCENE_2 = "aventure-puits-de-cendre#Scène 2 — Le relais pillé";
const SCENE_3 = "aventure-puits-de-cendre#Scène 3 — Le kraal de Ronceroc";
const SCENE_4 = "aventure-puits-de-cendre#Scène 4 — La mine de Rouge-Veine";
const TREVE = "contrat-du-cartel#La Trêve de Cabestan";

export const CARTES = [
  scene({ cle: "cabestan-quai", nom: "Cabestan — Quai des Comptoirs", aventure: TITRE_AVENTURE,
    description: "Scène 1 : le contrat du Cartel, la Trêve de Cabestan et l'embuscade des tonneaux empoisonnés.",
    plan: {
      largeur: 28, hauteur: 20, lumiere: "penombre",
      pieces: [
        { nom: "Rue des Comptoirs", x: 0, y: 0, l: 28, h: 14, sol: "terre" },
        { nom: "Comptoir du Cartel", x: 1, y: 1, l: 9, h: 6, sol: "bois" },
        { nom: "Taverne de la Clé tordue", x: 12, y: 1, l: 9, h: 7, sol: "bois" },
        { nom: "Entrepôt du Cartel", x: 22, y: 1, l: 6, h: 8, sol: "terre" },
        { nom: "Bureau de la Trêve", x: 1, y: 8, l: 6, h: 4, sol: "pierre" },
        { nom: "Quai", x: 0, y: 14, l: 28, h: 3, sol: "bois" },
        { nom: "Port", x: 0, y: 17, l: 28, h: 3, sol: "eau" }
      ],
      ouvertures: [
        { x: 5, y: 6, cote: "sud", type: "porte" }, { x: 1, y: 3, cote: "ouest", type: "fenetre" },
        { x: 16, y: 7, cote: "sud", type: "porte" }, { x: 20, y: 4, cote: "est", type: "porte" }, { x: 14, y: 1, cote: "nord", type: "fenetre" },
        { x: 22, y: 5, cote: "ouest", type: "porte" }, { x: 25, y: 8, cote: "sud", type: "verrouillee" },
        { x: 6, y: 10, cote: "est", type: "porte" },
        ...rangee("passage", "nord", 0, 14, 28), ...rangee("passage", "nord", 0, 17, 28)
      ],
      lumieres: [
        { x: 5, y: 3, rayon: 3, couleur: "#ffcc88" }, { x: 16, y: 4, rayon: 4, couleur: "#ff9a40" }, { x: 3, y: 9, rayon: 2, couleur: "#ffddaa" },
        { x: 11, y: 12, rayon: 3, couleur: "#ffb060" }, { x: 21, y: 15, rayon: 3, couleur: "#ffb060" }, { x: 24, y: 11, rayon: 1, couleur: "#88ff66" }
      ],
      elements: [
        { nom: "Comptoir", x: 3, y: 3, l: 4, h: 1 }, { nom: "Coffre-fort", x: 8, y: 2, l: 1, h: 1 },
        { nom: "Comptoir de la taverne", x: 13, y: 5, l: 5, h: 1 }, { nom: "Table", x: 14, y: 2, l: 2, h: 1 }, { nom: "Table", x: 18, y: 2, l: 2, h: 1 },
        { nom: "Caisses", x: 23, y: 2, l: 2, h: 2 }, { nom: "Tonneaux", x: 25, y: 6, l: 2, h: 1 },
        { nom: "Table des négociations", x: 2, y: 9, l: 3, h: 2 },
        { nom: "Puits du Cartel", x: 11, y: 10, l: 2, h: 2 }, { nom: "Chariot", x: 16, y: 10, l: 3, h: 2 }, { nom: "Tonneaux d'eau", x: 23, y: 11, l: 3, h: 1 },
        { nom: "Grue de chargement", x: 10, y: 14, l: 2, h: 2 }, { nom: "Caisses", x: 3, y: 15, l: 2, h: 1 }, { nom: "Caisses", x: 20, y: 14, l: 2, h: 2 },
        { nom: "Navire de la Compagnie", x: 6, y: 17, l: 9, h: 3 }, { nom: "Barque", x: 20, y: 18, l: 3, h: 1 }
      ],
      zones: [
        { nom: "Taverne de la Clé tordue", x: 12, y: 1, l: 9, h: 7, type: "texte",
          texte: "Chopes qui claquent, dés qui roulent. Gravé au couteau sur le comptoir : « Ici, les épées dorment. »" },
        { nom: "Bureau de la Trêve", x: 1, y: 8, l: 6, h: 4, type: "texte",
          texte: "Deux voix se coupent la parole, l'une en commun, l'autre en orc. Aucune ne cède." },
        { nom: "Quai", x: 0, y: 14, l: 28, h: 3, type: "texte",
          texte: "Sel, goudron et poisson grillé. À chaque poteau, la même affiche : PAR ORDRE DU CARTEL." },
        { nom: "Tonneaux du porteur d'eau", x: 22, y: 10, l: 5, h: 3, type: "pause" }
      ],
      notes: [
        epingle(SCENE_1, 5, 2, "Grizzla — le contrat", "coins"),
        epingle(SCENE_1, 5, 10, "Haldis et Garrok", "tower-flag"),
        epingle(SCENE_1, 13, 11, "Docker malade (indice)", "poison"),
        epingle(SCENE_1, 24, 12, "Tonneau qui luit — le cultiste", "barrel"),
        epingle(SCENE_1, 19, 12, "Nervis cachés, puis murlocs", "combat"),
        epingle(TREVE, 13, 15, "La Trêve de Cabestan", "hanging-sign")
      ]
    } }),

  scene({ cle: "relais-oasis", nom: "Tarides — Relais de l'Oasis", aventure: TITRE_AVENTURE,
    description: "Scène 2 : le relais pillé, le puits empoisonné et l'attaque nocturne des hurans.",
    plan: {
      largeur: 30, hauteur: 22, lumiere: "penombre",
      pieces: [
        { nom: "Savane", x: 0, y: 0, l: 30, h: 22, sol: "terre" },
        { nom: "Relais", x: 2, y: 2, l: 8, h: 6, sol: "bois" },
        { nom: "Écurie", x: 2, y: 10, l: 6, h: 5, sol: "terre" },
        { nom: "Oasis", x: 16, y: 10, l: 9, h: 7, sol: "eau" }
      ],
      ouvertures: [
        { x: 6, y: 7, cote: "sud", type: "porte" }, { x: 2, y: 4, cote: "ouest", type: "fenetre" }, { x: 9, y: 4, cote: "est", type: "fenetre" },
        ...rangee("passage", "est", 7, 10, 5),
        ...rangee("passage", "nord", 16, 10, 9), ...rangee("passage", "sud", 16, 16, 9),
        ...rangee("passage", "ouest", 16, 10, 7), ...rangee("passage", "est", 24, 10, 7)
      ],
      lumieres: [
        { x: 5, y: 4, rayon: 3, couleur: "#ffcc88" }, { x: 16, y: 5, rayon: 4, couleur: "#ff8a30" }, { x: 20, y: 13, rayon: 3, couleur: "#66ff66" },
        { x: 12, y: 4, rayon: 1, couleur: "#66ff66" }
      ],
      elements: [
        { nom: "Comptoir", x: 3, y: 3, l: 3, h: 1 }, { nom: "Couchettes", x: 7, y: 3, l: 2, h: 3 }, { nom: "Mangeoire", x: 3, y: 13, l: 3, h: 1 },
        { nom: "Puits", x: 12, y: 4, l: 2, h: 2 }, { nom: "Feu de camp", x: 16, y: 5, l: 1, h: 1 },
        { nom: "Chariot", x: 20, y: 3, l: 3, h: 2 }, { nom: "Caisses éventrées", x: 24, y: 5, l: 2, h: 1 },
        { nom: "Chariot renversé", x: 11, y: 15, l: 3, h: 2 }, { nom: "Kodo mort", x: 12, y: 18, l: 2, h: 2 }, { nom: "Abreuvoir", x: 9, y: 11, l: 2, h: 1 },
        { nom: "Palmier", x: 15, y: 9, l: 1, h: 1 }, { nom: "Palmier", x: 25, y: 12, l: 1, h: 1 }, { nom: "Palmier", x: 20, y: 17, l: 1, h: 1 },
        { nom: "Rocher", x: 26, y: 18, l: 2, h: 2 }, { nom: "Épineux", x: 27, y: 2, l: 2, h: 2 }
      ],
      // L'oasis gangrenée est une eau morte : pas de vagues (le son « mer » déduit du sol eau), la savane au crépuscule.
      sons: [
        { nom: "Feu de camp", x: 16, y: 5, rayon: 3, son: "feu", volume: 0.35 },
        { nom: "Savane", x: 15, y: 11, rayon: 12, son: "nuit", volume: 0.25 },
        { nom: "Épineux", x: 26, y: 3, rayon: 5, son: "vent", volume: 0.15 }
      ],
      zones: [
        { nom: "Relais", x: 2, y: 2, l: 8, h: 6, type: "texte",
          texte: "Gonds arrachés, couchettes renversées. Le vent rabat ici l'odeur du kodo mort." },
        { nom: "Écurie", x: 2, y: 10, l: 6, h: 5, type: "texte",
          texte: "Derrière la mangeoire, un souffle lourd, retenu." },
        { nom: "Cachette de Hanuk", x: 2, y: 12, l: 4, h: 3, type: "pause" },
        { nom: "Oasis", x: 16, y: 10, l: 9, h: 7, type: "texte",
          texte: "L'eau a la teinte d'une vieille bouteille. Aucune bête n'y boit, pas même les mouches." }
      ],
      notes: [
        epingle(SCENE_2, 6, 11, "Hanuk Pas-de-Pluie, blessé", "heal"),
        epingle(SCENE_2, 14, 6, "Puits du relais (indice)", "waterfall"),
        epingle(SCENE_2, 24, 6, "Registre de la caravane (indice)", "book"),
        epingle(SCENE_2, 15, 18, "Traces de l'attaque (indice)", "pawprint"),
        epingle(SCENE_2, 22, 13, "Minuit : hurans par l'oasis", "combat")
      ]
    } }),

  scene({ cle: "kraal-ronceroc", nom: "Tarides — Kraal de Ronceroc", aventure: TITRE_AVENTURE,
    description: "Scène 3 : le kraal huran, le géomancien dissident et la cheffe corrompue par l'eau gangrenée.",
    plan: {
      largeur: 30, hauteur: 24, lumiere: "penombre",
      pieces: [
        { nom: "Ronceraie", x: 0, y: 0, l: 30, h: 24, sol: "terre" },
        { nom: "Kraal", x: 5, y: 4, l: 20, h: 16, sol: "terre" },
        { nom: "Hutte de la cheffe", x: 16, y: 5, l: 8, h: 6, sol: "bois" },
        { nom: "Hutte du géomancien", x: 6, y: 5, l: 6, h: 5, sol: "terre" },
        { nom: "Enclos à sangliers", x: 6, y: 13, l: 7, h: 6, sol: "terre" }
      ],
      ouvertures: [
        ...rangee("passage", "sud", 14, 19, 2), { x: 5, y: 10, cote: "ouest", type: "secrete" },
        { x: 19, y: 10, cote: "sud", type: "porte" }, { x: 9, y: 9, cote: "sud", type: "porte" }, { x: 12, y: 15, cote: "est", type: "porte" }
      ],
      lumieres: [
        { x: 15, y: 13, rayon: 4, couleur: "#ff8a30" }, { x: 19, y: 14, rayon: 3, couleur: "#66ff44" }, { x: 20, y: 7, rayon: 2, couleur: "#ffaa55" },
        { x: 8, y: 7, rayon: 2, couleur: "#aaddff" }
      ],
      elements: [
        { nom: "Grand totem", x: 14, y: 8, l: 2, h: 2 }, { nom: "Feu de camp", x: 15, y: 13, l: 1, h: 1 }, { nom: "Mare gangrenée", x: 18, y: 14, l: 3, h: 2 },
        { nom: "Trône d'os", x: 22, y: 7, l: 1, h: 2 }, { nom: "Râtelier d'armes", x: 17, y: 6, l: 2, h: 1 }, { nom: "Autel de pierre", x: 7, y: 6, l: 2, h: 1 },
        { nom: "Mangeoire", x: 7, y: 17, l: 3, h: 1 }, { nom: "Cage des prisonniers", x: 21, y: 16, l: 2, h: 2 }, { nom: "Tas d'ossements", x: 10, y: 11, l: 1, h: 1 },
        { nom: "Rocher", x: 1, y: 2, l: 2, h: 2 }, { nom: "Ronces", x: 26, y: 10, l: 2, h: 4 }, { nom: "Ronces", x: 2, y: 20, l: 3, h: 2 }, { nom: "Ronces", x: 24, y: 21, l: 4, h: 2 }
      ],
      zones: [
        { nom: "Entrée du kraal", x: 13, y: 17, l: 4, h: 3, type: "texte",
          texte: "Un cor de corne beugle derrière le grand totem. Dans l'enclos, des groins se dressent." },
        { nom: "Hutte du géomancien", x: 6, y: 5, l: 6, h: 5, type: "texte",
          texte: "Des pierres plates gravées de spirales, posées en cercle. L'air y sent la pluie qui ne vient plus." },
        { nom: "Mare gangrenée", x: 18, y: 14, l: 3, h: 2, type: "texte",
          texte: "L'eau verte fume sans chaleur. Le soufre colle à la gorge." },
        { nom: "Hutte de la cheffe", x: 16, y: 5, l: 8, h: 6, type: "pause" }
      ],
      notes: [
        epingle(SCENE_3, 14, 20, "Entrée sud : l'assaut", "combat"),
        epingle(SCENE_3, 4, 10, "Passage secret dans les ronces", "door-secret-outline"),
        epingle(SCENE_3, 10, 6, "Grommel Défense-Grise", "cowled"),
        epingle(SCENE_3, 21, 9, "Gorra — duel d'honneur", "sword"),
        epingle(SCENE_3, 19, 13, "Mare gangrenée — la guérison", "poison"),
        epingle(SCENE_3, 20, 18, "Tobias Merle et Uzga, captifs", "padlock")
      ]
    } }),

  scene({ cle: "mine-rouge-veine", nom: "Tarides — Mine de Rouge-Veine", aventure: TITRE_AVENTURE,
    description: "Scène 4 : la mine abandonnée, les kobolds enchaînés et le rituel de la Lame ardente autour de l'Éclat gangrené.",
    plan: {
      largeur: 30, hauteur: 24, lumiere: "nuit",
      pieces: [
        { nom: "Entrée de la mine", x: 0, y: 9, l: 6, h: 5, sol: "terre" },
        { nom: "Galerie principale", x: 6, y: 10, l: 12, h: 3, sol: "terre" },
        { nom: "Baraquement des kobolds", x: 6, y: 2, l: 8, h: 8, sol: "terre" },
        { nom: "Puits d'extraction", x: 14, y: 2, l: 4, h: 8, sol: "pierre" },
        { nom: "Réserve de poudre", x: 6, y: 13, l: 6, h: 6, sol: "bois" },
        { nom: "Galerie basse", x: 12, y: 13, l: 6, h: 6, sol: "terre" },
        { nom: "Caverne de la Source", x: 18, y: 4, l: 12, h: 16, sol: "cendre" }
      ],
      ouvertures: [
        ...rangee("passage", "ouest", 0, 10, 3), ...rangee("passage", "est", 5, 10, 3),
        { x: 9, y: 9, cote: "sud", type: "porte" }, { x: 13, y: 5, cote: "est", type: "porte" }, { x: 16, y: 9, cote: "sud", type: "passage" },
        { x: 8, y: 13, cote: "nord", type: "verrouillee" }, { x: 14, y: 13, cote: "nord", type: "passage" },
        ...rangee("passage", "est", 17, 10, 3), { x: 17, y: 16, cote: "est", type: "secrete" }
      ],
      lumieres: [
        { x: 2, y: 11, rayon: 2, couleur: "#ffb060" }, { x: 9, y: 5, rayon: 2, couleur: "#ffcc66" }, { x: 15, y: 6, rayon: 1, couleur: "#ffaa44" },
        { x: 27, y: 12, rayon: 5, couleur: "#55ff55" }, { x: 24, y: 7, rayon: 2, couleur: "#77ff44" }, { x: 24, y: 16, rayon: 2, couleur: "#77ff44" }
      ],
      elements: [
        { nom: "Tas de minerai", x: 2, y: 10, l: 2, h: 1 }, { nom: "Wagonnet", x: 8, y: 11, l: 2, h: 1 },
        { nom: "Couchettes", x: 7, y: 3, l: 3, h: 1 }, { nom: "Couchettes", x: 7, y: 6, l: 3, h: 1 }, { nom: "Chaînes", x: 11, y: 3, l: 2, h: 1 }, { nom: "Marmite", x: 11, y: 7, l: 1, h: 1 },
        { nom: "Treuil", x: 15, y: 4, l: 2, h: 2 }, { nom: "Caisses", x: 7, y: 14, l: 2, h: 2 }, { nom: "Tonneaux de poudre", x: 9, y: 17, l: 2, h: 1 },
        { nom: "Étayage effondré", x: 13, y: 16, l: 2, h: 1 },
        { nom: "Puits de la source noire", x: 22, y: 10, l: 4, h: 4 }, { nom: "Éclat gangrené", x: 27, y: 11, l: 1, h: 2 }, { nom: "Autel de la Lame ardente", x: 26, y: 5, l: 2, h: 1 },
        { nom: "Pilier", x: 20, y: 6, l: 1, h: 1 }, { nom: "Pilier", x: 20, y: 17, l: 1, h: 1 }, { nom: "Pilier", x: 27, y: 17, l: 1, h: 1 },
        { nom: "Brasero", x: 24, y: 7, l: 1, h: 1 }, { nom: "Brasero", x: 24, y: 16, l: 1, h: 1 }
      ],
      zones: [
        { nom: "Entrée de la mine", x: 0, y: 9, l: 6, h: 5, type: "texte",
          texte: "Le vieux panneau du Cartel grince au vent. Plus bas, des pioches cognent sans jamais s'arrêter." },
        { nom: "Baraquement des kobolds", x: 6, y: 2, l: 8, h: 8, type: "texte",
          texte: "De petites voix reniflent dans le noir. Une chaîne tinte à chaque sanglot." },
        { nom: "Galerie basse", x: 12, y: 13, l: 6, h: 6, type: "obscurite", obscurite: 1 },
        { nom: "Caverne de la Source", x: 18, y: 4, l: 12, h: 16, type: "pause" }
      ],
      notes: [
        epingle(SCENE_4, 2, 12, "Cultistes aux dés — l'alerte", "d6-grey"),
        epingle(SCENE_4, 11, 4, "Kobolds enchaînés", "net"),
        epingle(SCENE_4, 10, 15, "Tonneaux de poudre", "explosion"),
        epingle(SCENE_4, 16, 16, "Passage dérobé vers la caverne", "door-secret-outline"),
        epingle(SCENE_4, 25, 5, "Drogha — le rituel", "fire"),
        epingle(SCENE_4, 28, 12, "Éclat gangrené — l'arrêter", "radiation")
      ]
    } })
];
