// Cartes du one-shot « Une nuit aux Deux Lanternes » (niveau 3, une soirée) : le relais du Gué-Brumeux, les caves et le
// boyau des contrebandiers creusés dessous, et le cimetière des Rescapés sur son îlot du marécage d'Âprefange.
// Même convertisseur, mêmes fonds dessinés et même plans.json que les autres cartes : tout passe par scene() de
// cartes.mjs (case de 1,5 m). Les éléments nommés (trappe de la cave, table de dissection, cloche des Rescapés…)
// servent de repères au MJ IA pour placer les jetons.
// Scènes vivantes : une épingle sur chaque lieu clé, vers sa page du journal du one-shot (ou d'une aide de jeu), et
// des zones invisibles des joueurs (texte de lore, pause avant un combat majeur, obscurité d'une galerie noyée).
// Sons explicites : une rivière en crue et un marais ne sonnent pas la mer (son déduit d'un sol d'eau), il pleut.
import { scene } from "./cartes.mjs";
import { epingle } from "./cles-journaux.mjs";
import { rangee } from "./lieux-cartes.mjs";

export const TITRE_ONE_SHOT = "Une nuit aux Deux Lanternes";
const aventure = TITRE_ONE_SHOT;

// Pages visées par les épingles (« clé du journal#titre de la page »).
const ACTE_1 = "one-shot-deux-lanternes#Acte 1 — L'orage au relais";
const ACTE_2 = "one-shot-deux-lanternes#Acte 2 — Sous le relais";
const ACTE_3 = "one-shot-deux-lanternes#Acte 3 — Le cimetière des Rescapés";
const REGLEMENT = "relais-deux-lanternes#Le règlement des Deux Lanternes";
const REGISTRE = "relais-deux-lanternes#Le registre des voyageurs";
const LETTRE = "carnet-crayeval#Lettre du Cercle";
const CROQUIS = "carnet-crayeval#Croquis du cimetière";

export const CARTES_ONE_SHOT = [
  scene({ cle: "gue-brumeux-relais", nom: "Gué-Brumeux — Relais des Deux Lanternes", aventure,
    description: "Acte 1 : le relais du bac au bord du marécage d'Âprefange, une nuit d'orage. Salle commune, cuisine et trappe de la cave, chambres, écurie, remise du passeur et rivière en crue.",
    plan: {
      largeur: 30, hauteur: 22, lumiere: "nuit",
      pieces: [
        { nom: "Cour du relais", x: 0, y: 0, l: 30, h: 17, sol: "terre" },
        { nom: "Rivière en crue", x: 0, y: 17, l: 30, h: 5, sol: "eau" },
        { nom: "Salle commune", x: 2, y: 2, l: 12, h: 8, sol: "bois" },
        { nom: "Cuisine", x: 14, y: 2, l: 6, h: 5, sol: "pierre" },
        { nom: "Chambre du docteur", x: 20, y: 2, l: 4, h: 4, sol: "bois" },
        { nom: "Chambre des voyageurs", x: 24, y: 2, l: 4, h: 4, sol: "bois" },
        { nom: "Couloir des chambres", x: 20, y: 6, l: 8, h: 2, sol: "bois" },
        { nom: "Écurie", x: 22, y: 10, l: 6, h: 5, sol: "terre" },
        { nom: "Remise du passeur", x: 2, y: 12, l: 5, h: 3, sol: "bois" }
      ],
      ouvertures: [
        { x: 7, y: 9, cote: "sud", type: "porte" }, { x: 2, y: 5, cote: "ouest", type: "fenetre" }, { x: 11, y: 9, cote: "sud", type: "fenetre" },
        { x: 5, y: 2, cote: "nord", type: "fenetre" }, { x: 13, y: 4, cote: "est", type: "porte" },
        { x: 16, y: 2, cote: "nord", type: "porte" }, { x: 19, y: 6, cote: "est", type: "porte" },
        { x: 21, y: 5, cote: "sud", type: "porte" }, { x: 25, y: 5, cote: "sud", type: "porte" },
        { x: 22, y: 2, cote: "nord", type: "fenetre" }, { x: 27, y: 3, cote: "est", type: "fenetre" },
        { x: 27, y: 7, cote: "est", type: "porte" },
        ...rangee("passage", "ouest", 22, 11, 3),
        { x: 4, y: 12, cote: "nord", type: "porte" },
        ...rangee("passage", "nord", 0, 17, 30)
      ],
      lumieres: [
        { x: 3, y: 3, rayon: 3, couleur: "#ff9a40" }, { x: 8, y: 6, rayon: 4, couleur: "#ffcc88" }, { x: 18, y: 3, rayon: 2, couleur: "#ff8a30" },
        { x: 22, y: 4, rayon: 1, couleur: "#ffddaa" }, { x: 8, y: 10, rayon: 2, couleur: "#5577ff" }, { x: 10, y: 10, rayon: 2, couleur: "#ff3a2a" },
        { x: 24, y: 12, rayon: 2, couleur: "#ffcc88" }
      ],
      elements: [
        { nom: "Cheminée", x: 2, y: 2, l: 2, h: 1 }, { nom: "Comptoir", x: 9, y: 3, l: 4, h: 1 }, { nom: "Grande table", x: 4, y: 5, l: 4, h: 2 },
        { nom: "Table du coin", x: 10, y: 7, l: 2, h: 1 }, { nom: "Râtelier d'armes", x: 13, y: 8, l: 1, h: 2 },
        { nom: "Fourneau", x: 18, y: 2, l: 2, h: 1 }, { nom: "Billot", x: 17, y: 3, l: 1, h: 1 }, { nom: "Sacs de farine", x: 17, y: 5, l: 2, h: 1 },
        { nom: "Trappe de la cave", x: 15, y: 5, l: 1, h: 1 },
        { nom: "Lit du docteur", x: 20, y: 2, l: 1, h: 2 }, { nom: "Malle du docteur", x: 23, y: 4, l: 1, h: 1 },
        { nom: "Lits superposés", x: 24, y: 2, l: 1, h: 3 }, { nom: "Coffre", x: 27, y: 4, l: 1, h: 1 },
        { nom: "Stalles", x: 26, y: 10, l: 2, h: 4 }, { nom: "Mangeoire", x: 23, y: 14, l: 2, h: 1 },
        { nom: "Filets et cordages", x: 2, y: 12, l: 2, h: 1 }, { nom: "Barque retournée", x: 4, y: 13, l: 2, h: 1 },
        { nom: "Poteau des deux lanternes", x: 9, y: 10, l: 1, h: 1 }, { nom: "Chariot de Pip", x: 10, y: 12, l: 3, h: 2 },
        { nom: "Puits", x: 17, y: 10, l: 2, h: 2 }, { nom: "Tas de bois", x: 0, y: 8, l: 1, h: 3 },
        { nom: "Ponton du bac", x: 13, y: 15, l: 2, h: 2 }, { nom: "Saule", x: 28, y: 13, l: 2, h: 2 },
        { nom: "Bac de Bram", x: 13, y: 18, l: 4, h: 2 }, { nom: "Roseaux", x: 24, y: 17, l: 4, h: 2 }, { nom: "Roseaux", x: 2, y: 19, l: 3, h: 2 }
      ],
      sons: [
        { nom: "Cheminée", x: 3, y: 3, rayon: 3, son: "feu", volume: 0.35 },
        { nom: "Salle commune", x: 8, y: 6, rayon: 5, son: "foule", volume: 0.15 },
        { nom: "Cour sous la pluie", x: 15, y: 12, rayon: 14, son: "pluie", volume: 0.35 },
        { nom: "Orage sur la rivière", x: 15, y: 19, rayon: 12, son: "orage", volume: 0.25 }
      ],
      zones: [
        { nom: "Accueil de la salle commune", x: 2, y: 2, l: 12, h: 8, type: "texte",
          texte: "Laine mouillée, soupe de poisson, fumée de tourbe. Les conversations baissent d'un ton à chaque nouvel arrivant." },
        { nom: "Ponton du bac", x: 13, y: 15, l: 2, h: 2, type: "texte",
          texte: "La rivière gronde, grosse de pluie. Le bac tire sur sa corde comme un chien sur sa laisse." },
        { nom: "Chambre du docteur", x: 20, y: 2, l: 4, h: 4, type: "texte",
          texte: "Le lit n'est pas défait. Ça sent le vinaigre, et dessous, quelque chose de sucré qui a tourné." },
        { nom: "Trappe de la cave", x: 14, y: 4, l: 3, h: 3, type: "pause" }
      ],
      notes: [
        epingle(ACTE_1, 11, 4, "Hilde et Durgan, les hôtes", "tankard"),
        epingle(REGLEMENT, 7, 8, "Le règlement des Deux Lanternes", "hanging-sign"),
        epingle(REGISTRE, 12, 3, "Le registre des voyageurs", "book"),
        epingle(ACTE_1, 5, 7, "Les voyageurs bloqués par l'orage", "mystery-man"),
        epingle(ACTE_1, 22, 3, "Chambre vide du docteur (indice)", "door-open-outline"),
        epingle(ACTE_1, 15, 6, "Minuit : la trappe de la cave", "skull"),
        epingle(ACTE_1, 14, 16, "Le bac, et Bram qui manque", "anchor")
      ]
    } }),

  scene({ cle: "gue-brumeux-caves", nom: "Gué-Brumeux — Caves et boyau des contrebandiers", aventure,
    description: "Acte 2 : sous le relais, la cave, le vieux boyau de contrebandiers rouvert, le laboratoire du nécromancien, le cachot du passeur, l'ossuaire, la galerie noyée et l'embarcadère caché sur le marais.",
    plan: {
      largeur: 28, hauteur: 20, lumiere: "nuit",
      pieces: [
        { nom: "Cave du relais", x: 1, y: 1, l: 8, h: 6, sol: "terre" },
        { nom: "Réserve", x: 1, y: 7, l: 5, h: 4, sol: "terre" },
        { nom: "Boyau des contrebandiers", x: 9, y: 3, l: 12, h: 2, sol: "terre" },
        { nom: "Laboratoire", x: 13, y: 5, l: 7, h: 6, sol: "pierre" },
        { nom: "Cachot", x: 9, y: 7, l: 4, h: 4, sol: "pierre" },
        { nom: "Ossuaire", x: 21, y: 1, l: 6, h: 6, sol: "terre" },
        { nom: "Galerie noyée", x: 21, y: 7, l: 4, h: 8, sol: "eau" },
        { nom: "Embarcadère caché", x: 15, y: 15, l: 10, h: 4, sol: "bois" },
        { nom: "Bras du marais", x: 0, y: 15, l: 15, h: 5, sol: "eau" }
      ],
      ouvertures: [
        { x: 3, y: 6, cote: "sud", type: "porte" }, ...rangee("passage", "est", 8, 3, 2),
        { x: 16, y: 5, cote: "nord", type: "porte" }, { x: 13, y: 8, cote: "ouest", type: "verrouillee" },
        ...rangee("passage", "est", 20, 3, 2), ...rangee("passage", "sud", 22, 6, 2),
        ...rangee("passage", "sud", 21, 14, 4), ...rangee("passage", "ouest", 15, 15, 4)
      ],
      lumieres: [
        { x: 4, y: 3, rayon: 2, couleur: "#ffcc66" }, { x: 16, y: 7, rayon: 3, couleur: "#b8e05a" }, { x: 18, y: 9, rayon: 1, couleur: "#ffddaa" },
        { x: 23, y: 3, rayon: 2, couleur: "#8fb0ff" }, { x: 5, y: 17, rayon: 1, couleur: "#aaffcc" }
      ],
      elements: [
        { nom: "Escalier de la trappe", x: 1, y: 1, l: 2, h: 1 }, { nom: "Tonneaux de bière", x: 5, y: 1, l: 3, h: 1 },
        { nom: "Sacs de farine marqués", x: 2, y: 4, l: 2, h: 1 }, { nom: "Gravats du mur", x: 7, y: 5, l: 2, h: 1 },
        { nom: "Jambons fumés", x: 1, y: 8, l: 2, h: 1 }, { nom: "Caisses de contrebande", x: 3, y: 9, l: 2, h: 2 },
        { nom: "Étai pourri", x: 12, y: 3, l: 1, h: 1 }, { nom: "Flaque", x: 18, y: 4, l: 2, h: 1 },
        { nom: "Étagère de bocaux", x: 13, y: 5, l: 1, h: 3 }, { nom: "Alambics", x: 18, y: 5, l: 2, h: 1 },
        { nom: "Table de dissection", x: 15, y: 7, l: 3, h: 2 }, { nom: "Pupitre du docteur", x: 18, y: 9, l: 2, h: 1 },
        { nom: "Chaudron de peste", x: 14, y: 10, l: 1, h: 1 }, { nom: "Sacs prêts à partir", x: 16, y: 10, l: 2, h: 1 },
        { nom: "Chaînes", x: 9, y: 8, l: 1, h: 2 }, { nom: "Paille", x: 11, y: 10, l: 2, h: 1 },
        { nom: "Niches d'ossements", x: 21, y: 1, l: 6, h: 1 }, { nom: "Tas de crânes", x: 25, y: 4, l: 2, h: 2 }, { nom: "Vieux coffre", x: 21, y: 5, l: 1, h: 1 },
        { nom: "Éboulis", x: 23, y: 10, l: 2, h: 1 },
        { nom: "Pieux d'amarrage", x: 16, y: 15, l: 1, h: 1 }, { nom: "Barque du passeur", x: 18, y: 17, l: 3, h: 1 }, { nom: "Lanterne éteinte", x: 24, y: 15, l: 1, h: 1 },
        { nom: "Roseaux", x: 2, y: 16, l: 3, h: 2 }, { nom: "Souche noyée", x: 9, y: 18, l: 2, h: 1 }
      ],
      sons: [
        { nom: "Boyau des contrebandiers", x: 14, y: 3, rayon: 6, son: "grotte", volume: 0.25 },
        { nom: "Laboratoire", x: 16, y: 8, rayon: 4, son: "tension", volume: 0.2 },
        { nom: "Chaudron de peste", x: 14, y: 10, rayon: 2, son: "feu", volume: 0.2 },
        { nom: "Pluie sur le marais", x: 6, y: 17, rayon: 7, son: "pluie", volume: 0.25 }
      ],
      zones: [
        { nom: "Cave du relais", x: 1, y: 1, l: 8, h: 6, type: "texte",
          texte: "Sous l'odeur de bière renversée, une autre, sucrée, qui colle au fond de la gorge." },
        { nom: "Laboratoire", x: 13, y: 5, l: 7, h: 6, type: "texte",
          texte: "Des bocaux alignés comme à la parade. Dans certains, quelque chose bouge encore." },
        { nom: "Ossuaire", x: 21, y: 1, l: 6, h: 6, type: "pause" },
        { nom: "Galerie noyée", x: 21, y: 7, l: 4, h: 8, type: "obscurite", obscurite: 1 }
      ],
      notes: [
        epingle(ACTE_2, 3, 5, "Farine marquée (indice)", "biohazard"),
        epingle(ACTE_2, 12, 4, "L'étai piégé", "trap"),
        epingle(ACTE_2, 16, 9, "Laboratoire : acolytes et table vide", "combat"),
        epingle(LETTRE, 19, 10, "Le carnet du docteur", "book"),
        epingle(ACTE_2, 10, 8, "Bram, enchaîné", "padlock"),
        epingle(ACTE_2, 24, 2, "Ossuaire : les squelettes", "bones"),
        epingle(ACTE_2, 19, 16, "La barque du passeur", "anchor")
      ]
    } }),

  scene({ cle: "cimetiere-des-rescapes", nom: "Marécage d'Âprefange — Cimetière des Rescapés", aventure,
    description: "Acte 3 : l'îlot où dorment les réfugiés de Lordaeron morts le premier hiver, sa chapelle en ruine, le mausolée et la cloche des Rescapés, où le nécromancien mène son rituel à l'heure morte.",
    plan: {
      largeur: 30, hauteur: 24, lumiere: "nuit",
      pieces: [
        { nom: "Marais", x: 0, y: 0, l: 30, h: 24, sol: "eau" },
        { nom: "Îlot des Rescapés", x: 6, y: 4, l: 18, h: 15, sol: "herbe" },
        { nom: "Chapelle en ruine", x: 15, y: 5, l: 7, h: 6, sol: "pierre" },
        { nom: "Mausolée", x: 7, y: 5, l: 5, h: 4, sol: "pierre" },
        { nom: "Ponton", x: 13, y: 19, l: 3, h: 3, sol: "bois" }
      ],
      ouvertures: [
        ...rangee("passage", "nord", 6, 4, 18), ...rangee("passage", "sud", 6, 18, 18),
        ...rangee("passage", "ouest", 6, 4, 15), ...rangee("passage", "est", 23, 4, 15),
        ...rangee("passage", "ouest", 13, 19, 3), ...rangee("passage", "est", 15, 19, 3), ...rangee("passage", "sud", 13, 21, 3),
        ...rangee("passage", "sud", 17, 10, 3), { x: 15, y: 7, cote: "ouest", type: "passage" }, { x: 19, y: 5, cote: "nord", type: "passage" },
        { x: 9, y: 8, cote: "sud", type: "porte" }
      ],
      lumieres: [
        { x: 13, y: 13, rayon: 3, couleur: "#c8ff9a" }, { x: 15, y: 13, rayon: 2, couleur: "#9aff60" }, { x: 18, y: 7, rayon: 2, couleur: "#aabbff" },
        { x: 14, y: 20, rayon: 2, couleur: "#ffcc66" }, { x: 9, y: 6, rayon: 1, couleur: "#88ffaa" }
      ],
      elements: [
        { nom: "Cloche des Rescapés", x: 12, y: 12, l: 2, h: 2 }, { nom: "Brasero de peste", x: 15, y: 13, l: 1, h: 1 },
        { nom: "Tombe de Joren Brunval", x: 8, y: 15, l: 2, h: 1 }, { nom: "Tombes fraîchement ouvertes", x: 17, y: 13, l: 3, h: 1 },
        { nom: "Rangée de tombes", x: 17, y: 16, l: 4, h: 1 }, { nom: "Croix de bois penchées", x: 7, y: 11, l: 2, h: 1 },
        { nom: "Panneau des Rescapés", x: 14, y: 18, l: 1, h: 1 }, { nom: "Saule mort", x: 22, y: 6, l: 1, h: 1 },
        { nom: "Autel brisé", x: 17, y: 6, l: 3, h: 1 }, { nom: "Bancs renversés", x: 16, y: 8, l: 4, h: 1 },
        { nom: "Sarcophage vide", x: 8, y: 6, l: 3, h: 1 },
        { nom: "Barque d'Aldwin", x: 17, y: 21, l: 2, h: 1 }, { nom: "Roseaux", x: 1, y: 2, l: 3, h: 2 }, { nom: "Roseaux", x: 25, y: 20, l: 3, h: 2 },
        { nom: "Souche", x: 26, y: 2, l: 2, h: 1 }
      ],
      sons: [
        { nom: "Pluie sur l'îlot", x: 15, y: 12, rayon: 15, son: "pluie", volume: 0.3 },
        { nom: "Cloche des Rescapés", x: 13, y: 13, rayon: 5, son: "tension", volume: 0.3 },
        { nom: "Vent du marais", x: 3, y: 20, rayon: 8, son: "vent", volume: 0.2 }
      ],
      zones: [
        { nom: "Débarquement", x: 13, y: 19, l: 3, h: 3, type: "texte",
          texte: "Planté dans la vase, un panneau de bois : « Ils ont fui la peste. Qu'elle ne les trouve pas ici. »" },
        { nom: "Cercle de la cloche", x: 10, y: 10, l: 6, h: 6, type: "pause" },
        { nom: "Mausolée", x: 7, y: 5, l: 5, h: 4, type: "obscurite", obscurite: 1 },
        { nom: "Chapelle en ruine", x: 15, y: 5, l: 7, h: 6, type: "texte",
          texte: "Le toit s'est effondré. La pluie tombe sur l'autel comme on jette de la terre sur un cercueil." }
      ],
      notes: [
        epingle(ACTE_3, 14, 20, "Le ponton des Rescapés", "anchor"),
        epingle(ACTE_3, 12, 14, "Aldwin et la cloche — le rituel", "sound"),
        epingle(ACTE_3, 9, 16, "Tombe de Joren Brunval", "skull"),
        epingle(ACTE_3, 9, 7, "Le Recousu, dans le mausolée", "terror"),
        epingle(ACTE_3, 18, 9, "Chapelle : Vesper attend", "cowled"),
        epingle(CROQUIS, 20, 14, "Croquis du cimetière", "direction")
      ]
    } })
];
