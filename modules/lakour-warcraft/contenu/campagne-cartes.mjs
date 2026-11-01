// Cartes de la campagne « Les Braises de la Légion » (suite des « Puits de cendre », niveaux 3 à 6) : une par
// chapitre, chacune sur un lieu différent des Tarides et de leur côte. Même convertisseur, mêmes fonds dessinés et
// même plans.json que les autres cartes : tout passe par scene() de cartes.mjs (case de 1,5 m).
// Les éléments nommés (moteur à éclat, bassin lunaire, table des négociations, autel des Braises…) servent de
// repères au MJ IA pour placer les jetons.
// Scènes vivantes : une épingle sur chaque lieu clé, vers sa page du journal de la campagne (ou de l'aide de jeu), et
// des zones invisibles des joueurs (texte de lore à l'entrée, pause avant un combat majeur, obscurité d'une crypte).
import { scene } from "./cartes.mjs";
import { epingle } from "./cles-journaux.mjs";
import { rangee } from "./lieux-cartes.mjs";

export const TITRE_CAMPAGNE = "Les Braises de la Légion";
const aventure = TITRE_CAMPAGNE;

// Pages visées par les épingles (« clé du journal#titre de la page »).
const CHAPITRE_1 = "campagne-braises-legion#Chapitre 1 — La fonderie de Fort-Rivet";
const CHAPITRE_2 = "campagne-braises-legion#Chapitre 2 — Les ruines d'Eldrassal";
const CHAPITRE_3 = "campagne-braises-legion#Chapitre 3 — Le sommet de Gué-de-Sel";
const CHAPITRE_4 = "campagne-braises-legion#Chapitre 4 — La nuit des deux lunes";
const SAUF_CONDUIT = "sauf-conduit-gue-de-sel#Sauf-conduit";

export const CARTES_CAMPAGNE = [
  scene({ cle: "fonderie-fort-rivet", nom: "Tarides — Fonderie de Fort-Rivet", aventure,
    description: "Chapitre 1 : la fonderie gobeline qui brûle des éclats gangrenés dans ses machines, le bureau du patron, l'atelier des déchiqueteurs et le quai du zeppelin.",
    plan: {
      largeur: 28, hauteur: 20, lumiere: "penombre",
      pieces: [
        { nom: "Cour de la fonderie", x: 0, y: 0, l: 28, h: 20, sol: "terre" },
        { nom: "Bureau de Vizzik", x: 1, y: 1, l: 7, h: 5, sol: "bois" },
        { nom: "Halle des machines", x: 9, y: 1, l: 12, h: 8, sol: "metal" },
        { nom: "Haut-fourneau", x: 22, y: 1, l: 6, h: 8, sol: "cendre" },
        { nom: "Entrepôt des minerais", x: 1, y: 12, l: 8, h: 7, sol: "terre" },
        { nom: "Atelier des déchiqueteurs", x: 11, y: 12, l: 9, h: 7, sol: "ferraille" },
        { nom: "Quai du zeppelin", x: 22, y: 12, l: 6, h: 8, sol: "bois" }
      ],
      ouvertures: [
        { x: 4, y: 5, cote: "sud", type: "porte" }, { x: 1, y: 3, cote: "ouest", type: "fenetre" },
        { x: 9, y: 4, cote: "ouest", type: "porte" }, ...rangee("passage", "sud", 14, 8, 3), { x: 20, y: 4, cote: "est", type: "porte" },
        { x: 22, y: 6, cote: "ouest", type: "porte" },
        { x: 4, y: 12, cote: "nord", type: "porte" }, { x: 8, y: 16, cote: "est", type: "verrouillee" },
        ...rangee("passage", "nord", 14, 12, 3), { x: 19, y: 17, cote: "est", type: "secrete" },
        ...rangee("passage", "ouest", 22, 13, 3)
      ],
      lumieres: [
        { x: 4, y: 3, rayon: 2, couleur: "#ffcc88" }, { x: 15, y: 4, rayon: 3, couleur: "#66ff44" }, { x: 25, y: 4, rayon: 4, couleur: "#ff7a20" },
        { x: 10, y: 10, rayon: 3, couleur: "#ffb060" }, { x: 15, y: 15, rayon: 3, couleur: "#ffaa55" }, { x: 25, y: 15, rayon: 2, couleur: "#ffddaa" },
        { x: 6, y: 17, rayon: 1, couleur: "#66ff44" }
      ],
      elements: [
        { nom: "Bureau", x: 3, y: 2, l: 3, h: 1 }, { nom: "Coffre-fort", x: 7, y: 1, l: 1, h: 1 }, { nom: "Étagère de registres", x: 1, y: 5, l: 2, h: 1 },
        { nom: "Moteur à éclat", x: 14, y: 3, l: 3, h: 3 }, { nom: "Chaudière", x: 18, y: 2, l: 2, h: 2 }, { nom: "Établi", x: 10, y: 7, l: 3, h: 1 },
        { nom: "Tapis roulant", x: 10, y: 2, l: 1, h: 4 },
        { nom: "Creuset", x: 24, y: 3, l: 3, h: 3 }, { nom: "Coulée de fonte", x: 23, y: 7, l: 4, h: 1 },
        { nom: "Tas de scories", x: 2, y: 8, l: 3, h: 2 }, { nom: "Wagonnets", x: 10, y: 10, l: 3, h: 1 }, { nom: "Tour de guet", x: 26, y: 10, l: 2, h: 1 },
        { nom: "Caisses de minerai", x: 2, y: 13, l: 3, h: 2 }, { nom: "Caisses scellées", x: 6, y: 16, l: 2, h: 2 }, { nom: "Balance", x: 2, y: 17, l: 1, h: 1 },
        { nom: "Déchiqueteur en réparation", x: 13, y: 14, l: 2, h: 2 }, { nom: "Pièces détachées", x: 17, y: 16, l: 2, h: 2 }, { nom: "Palan", x: 11, y: 17, l: 1, h: 1 },
        { nom: "Zeppelin de livraison", x: 24, y: 14, l: 4, h: 5 }, { nom: "Treuil", x: 22, y: 18, l: 1, h: 1 }
      ],
      zones: [
        { nom: "Bureau de Vizzik", x: 1, y: 1, l: 7, h: 5, type: "texte",
          texte: "Sur la porte, une plaque de cuivre bien astiquée : « Tout se négocie. Sauf mon temps. »" },
        { nom: "Halle des machines", x: 9, y: 1, l: 12, h: 8, type: "texte",
          texte: "Le sol tremble sous les bottes. Ça sent le cuivre chaud et l'orage." },
        { nom: "Près du moteur", x: 13, y: 2, l: 5, h: 5, type: "pause" },
        { nom: "Haut-fourneau", x: 22, y: 1, l: 6, h: 8, type: "texte",
          texte: "Une chaleur à cuire le pain. La fonte file dans sa rigole comme un ruisseau orange." }
      ],
      notes: [
        epingle(CHAPITRE_1, 4, 3, "Vizzik Tirelire — le retourner", "coins"),
        epingle(CHAPITRE_1, 2, 4, "Étagère de registres (indice)", "book"),
        epingle(CHAPITRE_1, 6, 1, "Coffre-fort (indice)", "chest"),
        epingle(CHAPITRE_1, 17, 5, "Moteur à éclat — la Braise", "fire"),
        epingle(CHAPITRE_1, 13, 10, "Ouvriers malades (indice)", "poison"),
        epingle(CHAPITRE_1, 5, 17, "Caisses scellées (indice)", "padlock"),
        epingle(CHAPITRE_1, 15, 14, "Déchiqueteur et sifflet", "clockwork"),
        epingle(CHAPITRE_1, 23, 13, "Minuit : le courrier du zeppelin", "combat")
      ]
    } }),

  scene({ cle: "ruines-eldrassal", nom: "Côte des Tarides — Ruines englouties d'Eldrassal", aventure,
    description: "Chapitre 2 : les ruines à demi noyées d'une cité des Bien-Nés, le bassin lunaire, la bibliothèque engloutie, le camp des nagas et la crypte où dort la deuxième Braise.",
    plan: {
      largeur: 28, hauteur: 22, lumiere: "nuit",
      pieces: [
        { nom: "Plage", x: 0, y: 0, l: 6, h: 22, sol: "terre" },
        { nom: "Lagon", x: 6, y: 0, l: 22, h: 4, sol: "eau" },
        { nom: "Parvis effondré", x: 6, y: 4, l: 8, h: 8, sol: "pierre" },
        { nom: "Galerie des statues", x: 14, y: 4, l: 8, h: 5, sol: "pierre" },
        { nom: "Salle du bassin lunaire", x: 14, y: 9, l: 8, h: 7, sol: "sanctuaire" },
        { nom: "Bibliothèque engloutie", x: 22, y: 4, l: 6, h: 12, sol: "eau" },
        { nom: "Camp des nagas", x: 6, y: 12, l: 8, h: 10, sol: "eau" },
        { nom: "Crypte des Bien-Nés", x: 14, y: 16, l: 14, h: 6, sol: "cendre" }
      ],
      ouvertures: [
        ...rangee("passage", "ouest", 6, 0, 4), ...rangee("passage", "ouest", 6, 6, 3), ...rangee("passage", "ouest", 6, 15, 3),
        ...rangee("passage", "nord", 8, 4, 3), ...rangee("passage", "est", 13, 5, 2), ...rangee("passage", "sud", 9, 11, 2),
        ...rangee("porte", "sud", 17, 8, 2), { x: 21, y: 6, cote: "est", type: "verrouillee" },
        { x: 17, y: 15, cote: "sud", type: "secrete" }, { x: 13, y: 18, cote: "est", type: "porte" }, { x: 24, y: 15, cote: "sud", type: "passage" }
      ],
      lumieres: [
        { x: 3, y: 10, rayon: 2, couleur: "#ffcc88" }, { x: 17, y: 6, rayon: 1, couleur: "#aaccff" }, { x: 17, y: 12, rayon: 3, couleur: "#88bbff" },
        { x: 9, y: 16, rayon: 2, couleur: "#55ddcc" }, { x: 24, y: 18, rayon: 3, couleur: "#66ff44" }, { x: 24, y: 9, rayon: 1, couleur: "#bb99ff" }
      ],
      elements: [
        { nom: "Barque échouée", x: 1, y: 3, l: 2, h: 1 }, { nom: "Feu de camp", x: 3, y: 10, l: 1, h: 1 }, { nom: "Rochers", x: 2, y: 18, l: 2, h: 2 },
        { nom: "Colonne immergée", x: 12, y: 1, l: 1, h: 1 }, { nom: "Colonne immergée", x: 20, y: 2, l: 1, h: 1 },
        { nom: "Statue renversée", x: 8, y: 8, l: 3, h: 1 }, { nom: "Éboulis", x: 7, y: 10, l: 2, h: 1 },
        { nom: "Statue d'une prêtresse", x: 15, y: 5, l: 1, h: 1 }, { nom: "Statue d'un mage", x: 20, y: 5, l: 1, h: 1 },
        { nom: "Bassin lunaire", x: 16, y: 11, l: 4, h: 3 },
        { nom: "Rayonnages effondrés", x: 23, y: 5, l: 4, h: 1 }, { nom: "Pupitre de cristal", x: 24, y: 9, l: 2, h: 1 }, { nom: "Rayonnages effondrés", x: 23, y: 13, l: 4, h: 1 },
        { nom: "Hutte de corail", x: 7, y: 13, l: 3, h: 2 }, { nom: "Cage de corail", x: 7, y: 19, l: 2, h: 2 }, { nom: "Trône de corail", x: 11, y: 19, l: 2, h: 1 },
        { nom: "Sarcophage", x: 16, y: 18, l: 2, h: 1 }, { nom: "Sarcophage", x: 19, y: 18, l: 2, h: 1 },
        { nom: "Autel de la Braise", x: 24, y: 17, l: 2, h: 2 }, { nom: "Puits de fouille", x: 21, y: 20, l: 2, h: 1 }
      ],
      zones: [
        { nom: "Galerie des statues", x: 14, y: 4, l: 8, h: 5, type: "texte",
          texte: "Des statues sans visage. Sous chacune, une ligne d'écriture elfique que le sel a presque effacée." },
        { nom: "Salle du bassin lunaire", x: 14, y: 9, l: 8, h: 7, type: "texte",
          texte: "Une eau grise et immobile, qui ne renvoie ni vos visages ni vos torches." },
        { nom: "Camp des nagas", x: 6, y: 12, l: 8, h: 10, type: "texte",
          texte: "Un chant glisse sur l'eau, trop pur pour une gorge humaine. Les murlocs, eux, se taisent." },
        { nom: "Ombre de la crypte", x: 14, y: 16, l: 14, h: 6, type: "obscurite", obscurite: 1 },
        { nom: "Crypte des Bien-Nés", x: 14, y: 16, l: 14, h: 6, type: "pause" }
      ],
      notes: [
        epingle(CHAPITRE_2, 3, 4, "Scaphandres de Fort-Rivet (indice)", "anchor"),
        epingle(CHAPITRE_2, 20, 6, "Inscription sous la statue (indice)", "statue"),
        epingle(CHAPITRE_2, 24, 10, "Pupitre de cristal (indice)", "eye"),
        epingle(CHAPITRE_2, 18, 14, "Bassin lunaire — le réveiller", "aura"),
        epingle(CHAPITRE_2, 17, 15, "Passage secret du bassin", "door-secret-outline"),
        epingle(CHAPITRE_2, 9, 20, "Aelyra Ombrefeuille, captive", "padlock"),
        epingle(CHAPITRE_2, 23, 18, "Autel de la Braise — Sss'thera et Ezzavel", "fire")
      ]
    } }),

  scene({ cle: "gue-de-sel-sommet", nom: "Gué-de-Sel — Camp du sommet de la Trêve", aventure,
    description: "Chapitre 3 : le gué où l'Alliance et la Horde négocient sous l'arbitrage du Cartel, le pavillon du sommet, les tentes des deux délégations et le vieux moulin où la Lame ardente cache sa bombe.",
    plan: {
      largeur: 30, hauteur: 22, lumiere: "penombre",
      pieces: [
        { nom: "Rive nord", x: 0, y: 0, l: 30, h: 9, sol: "herbe" },
        { nom: "Rivière", x: 0, y: 9, l: 30, h: 4, sol: "eau" },
        { nom: "Rive sud", x: 0, y: 13, l: 30, h: 9, sol: "terre" },
        { nom: "Gué", x: 13, y: 9, l: 4, h: 4, sol: "pierre" },
        { nom: "Tente de l'Alliance", x: 3, y: 2, l: 6, h: 4, sol: "bois" },
        { nom: "Pavillon du sommet", x: 11, y: 1, l: 8, h: 6, sol: "luxe" },
        { nom: "Tour de guet", x: 24, y: 2, l: 4, h: 4, sol: "pierre" },
        { nom: "Vieux moulin", x: 2, y: 15, l: 7, h: 5, sol: "bois" },
        { nom: "Tente des scribes", x: 12, y: 15, l: 6, h: 4, sol: "bois" },
        { nom: "Tente de la Horde", x: 21, y: 15, l: 6, h: 4, sol: "bois" }
      ],
      ouvertures: [
        ...rangee("passage", "nord", 0, 9, 30), ...rangee("passage", "sud", 0, 12, 30),
        ...rangee("passage", "ouest", 13, 9, 4), ...rangee("passage", "est", 16, 9, 4),
        { x: 5, y: 5, cote: "sud", type: "porte" },
        ...rangee("porte", "sud", 14, 6, 2), { x: 11, y: 3, cote: "ouest", type: "porte" }, { x: 18, y: 3, cote: "est", type: "fenetre" },
        { x: 25, y: 5, cote: "sud", type: "porte" },
        { x: 8, y: 17, cote: "est", type: "porte" }, { x: 4, y: 15, cote: "nord", type: "fenetre" },
        { x: 14, y: 15, cote: "nord", type: "porte" }, { x: 23, y: 15, cote: "nord", type: "porte" }
      ],
      lumieres: [
        { x: 14, y: 3, rayon: 3, couleur: "#ffe0a0" }, { x: 5, y: 3, rayon: 2, couleur: "#aaccff" }, { x: 25, y: 3, rayon: 2, couleur: "#ffb060" },
        { x: 15, y: 10, rayon: 2, couleur: "#ffb060" }, { x: 14, y: 16, rayon: 2, couleur: "#ffcc88" }, { x: 23, y: 16, rayon: 2, couleur: "#ff9a40" },
        { x: 4, y: 17, rayon: 1, couleur: "#66ff44" }, { x: 19, y: 20, rayon: 2, couleur: "#ff8a30" }
      ],
      elements: [
        { nom: "Bannière au lion", x: 4, y: 2, l: 1, h: 1 }, { nom: "Lits de camp", x: 6, y: 3, l: 2, h: 2 },
        { nom: "Table des négociations", x: 13, y: 3, l: 4, h: 2 }, { nom: "Bannière de l'Alliance", x: 11, y: 1, l: 1, h: 1 },
        { nom: "Bannière de la Horde", x: 18, y: 1, l: 1, h: 1 }, { nom: "Buffet", x: 12, y: 6, l: 2, h: 1 },
        { nom: "Échelle", x: 25, y: 3, l: 1, h: 1 }, { nom: "Brasero d'alarme", x: 26, y: 2, l: 1, h: 1 },
        { nom: "Enclos des montures", x: 1, y: 7, l: 5, h: 1 }, { nom: "Chariots", x: 21, y: 7, l: 3, h: 1 },
        { nom: "Borne de la Trêve", x: 16, y: 12, l: 1, h: 1 },
        { nom: "Meule", x: 3, y: 16, l: 2, h: 2 }, { nom: "Sacs de grain", x: 6, y: 18, l: 2, h: 1 }, { nom: "Trappe", x: 7, y: 16, l: 1, h: 1 },
        { nom: "Écritoire", x: 13, y: 16, l: 2, h: 1 }, { nom: "Coffre des traités", x: 16, y: 17, l: 1, h: 1 },
        { nom: "Râtelier d'armes", x: 22, y: 16, l: 2, h: 1 }, { nom: "Totem de guerre", x: 25, y: 17, l: 1, h: 1 },
        { nom: "Tonneaux", x: 10, y: 20, l: 2, h: 1 }, { nom: "Feu de camp", x: 19, y: 20, l: 1, h: 1 }
      ],
      // Une rivière n'a pas de vagues (le son « mer » déduit du sol eau) : les feux, les délégations, le soir qui tombe.
      sons: [
        { nom: "Brasero d'alarme", x: 26, y: 2, rayon: 3, son: "feu", volume: 0.35 },
        { nom: "Feu de camp", x: 19, y: 20, rayon: 3, son: "feu", volume: 0.35 },
        { nom: "Pavillon du sommet", x: 15, y: 4, rayon: 5, son: "foule", volume: 0.15 },
        { nom: "Gué", x: 15, y: 11, rayon: 12, son: "nuit", volume: 0.2 }
      ],
      zones: [
        { nom: "Pavillon du sommet", x: 11, y: 1, l: 8, h: 6, type: "texte",
          texte: "Toile dorée, tapis épais. La roue dentée du Cartel est brodée partout où se pose le regard." },
        { nom: "Gué", x: 13, y: 9, l: 4, h: 4, type: "texte",
          texte: "Des pierres plates sous une eau qui pique les chevilles. Sur la borne neuve, la place d'une date." },
        { nom: "Vieux moulin", x: 2, y: 15, l: 7, h: 5, type: "texte",
          texte: "La meule dort depuis des années. Pourtant, quelqu'un a balayé la poussière du plancher." },
        { nom: "Trappe du moulin", x: 7, y: 16, l: 1, h: 1, type: "pause" }
      ],
      notes: [
        epingle(SAUF_CONDUIT, 13, 7, "Sauf-conduit : armes à l'entrée", "hanging-sign"),
        epingle(CHAPITRE_3, 15, 5, "Table des négociations — la bombe", "explosion"),
        epingle(CHAPITRE_3, 12, 17, "Iselle Marchebrume", "cowled"),
        epingle(CHAPITRE_3, 17, 17, "Coffre des traités (indice)", "chest"),
        epingle(CHAPITRE_3, 6, 17, "Trappe : la cave des cultistes", "ladder"),
        epingle(CHAPITRE_3, 3, 6, "Incident : les montures", "pawprint"),
        epingle(CHAPITRE_3, 26, 18, "Incident : la flèche dans le totem", "target")
      ]
    } }),

  scene({ cle: "cratere-brasegouffre", nom: "Tarides — Cratère de Brasegouffre", aventure,
    description: "Chapitre 4 : le cratère où sont tombées les Braises il y a dix mille ans, le camp de la Lame ardente, le cercle du rituel, les ruines de la forge démoniaque et le puits où bat le Cœur de la Fournaise.",
    plan: {
      largeur: 30, hauteur: 24, lumiere: "nuit",
      pieces: [
        { nom: "Pentes du cratère", x: 0, y: 0, l: 30, h: 24, sol: "cendre" },
        { nom: "Camp de la Lame ardente", x: 1, y: 1, l: 9, h: 7, sol: "terre" },
        { nom: "Fosse aux captifs", x: 1, y: 15, l: 7, h: 7, sol: "terre" },
        { nom: "Cercle du rituel", x: 10, y: 6, l: 12, h: 12, sol: "sanctuaire" },
        { nom: "Ruines de la forge", x: 22, y: 1, l: 7, h: 9, sol: "pierre" },
        { nom: "Puits de la Fournaise", x: 23, y: 14, l: 6, h: 8, sol: "cendre" }
      ],
      ouvertures: [
        ...rangee("passage", "sud", 4, 7, 3), ...rangee("passage", "est", 9, 2, 3),
        { x: 7, y: 18, cote: "est", type: "verrouillee" },
        ...rangee("passage", "ouest", 10, 10, 4), ...rangee("passage", "nord", 14, 6, 4), ...rangee("passage", "est", 21, 8, 2),
        ...rangee("passage", "sud", 15, 17, 2),
        { x: 22, y: 3, cote: "ouest", type: "porte" },
        { x: 25, y: 14, cote: "nord", type: "secrete" }, ...rangee("passage", "ouest", 23, 16, 2)
      ],
      lumieres: [
        { x: 5, y: 4, rayon: 3, couleur: "#ff8a30" }, { x: 16, y: 12, rayon: 5, couleur: "#55ff55" }, { x: 25, y: 5, rayon: 2, couleur: "#ff6633" },
        { x: 26, y: 18, rayon: 3, couleur: "#77ff44" }, { x: 4, y: 18, rayon: 1, couleur: "#ffaa55" }, { x: 16, y: 21, rayon: 3, couleur: "#ff5a1a" }
      ],
      elements: [
        { nom: "Tentes", x: 2, y: 2, l: 2, h: 2 }, { nom: "Tentes", x: 6, y: 2, l: 2, h: 2 }, { nom: "Feu de camp", x: 5, y: 5, l: 1, h: 1 },
        { nom: "Caisses d'armes", x: 8, y: 6, l: 1, h: 1 },
        { nom: "Cages", x: 5, y: 16, l: 2, h: 2 }, { nom: "Chaînes", x: 2, y: 20, l: 3, h: 1 },
        { nom: "Autel des Braises", x: 15, y: 11, l: 2, h: 2 }, { nom: "Portail de la Fournaise", x: 14, y: 8, l: 4, h: 1 },
        { nom: "Obélisque", x: 12, y: 8, l: 1, h: 1 }, { nom: "Obélisque", x: 19, y: 8, l: 1, h: 1 },
        { nom: "Obélisque", x: 12, y: 15, l: 1, h: 1 }, { nom: "Obélisque", x: 19, y: 15, l: 1, h: 1 },
        { nom: "Enclume démoniaque", x: 24, y: 3, l: 2, h: 1 }, { nom: "Forge éteinte", x: 26, y: 6, l: 2, h: 2 }, { nom: "Colonne brisée", x: 23, y: 8, l: 1, h: 1 },
        { nom: "Cœur de la Fournaise", x: 25, y: 17, l: 2, h: 2 }, { nom: "Chaînes de fer gangrené", x: 24, y: 20, l: 4, h: 1 },
        { nom: "Météorite", x: 2, y: 10, l: 3, h: 3 }, { nom: "Rocher", x: 27, y: 11, l: 2, h: 2 }, { nom: "Rocher", x: 10, y: 20, l: 2, h: 2 },
        { nom: "Gouffre de lave", x: 14, y: 20, l: 5, h: 2 }
      ],
      // La forge démoniaque est en ruine (pas de marteaux, contrairement au son déduit de l'enclume) : le camp, la
      // lave, le vent du cratère, et la menace sourde du cercle.
      sons: [
        { nom: "Feu de camp", x: 5, y: 5, rayon: 3, son: "feu", volume: 0.35 },
        { nom: "Gouffre de lave", x: 16, y: 21, rayon: 3, son: "feu", volume: 0.3 },
        { nom: "Cercle du rituel", x: 16, y: 12, rayon: 7, son: "tension", volume: 0.3 },
        { nom: "Bord du cratère", x: 15, y: 2, rayon: 8, son: "vent", volume: 0.15 }
      ],
      zones: [
        { nom: "Ruines de la forge", x: 22, y: 1, l: 7, h: 9, type: "texte",
          texte: "Une enclume grande comme un autel, froide depuis dix mille ans. Ou presque." },
        { nom: "Fosse aux captifs", x: 1, y: 15, l: 7, h: 7, type: "texte",
          texte: "Des voix en trois langues demandent la même chose : de l'eau." },
        { nom: "Cercle du rituel", x: 10, y: 6, l: 12, h: 12, type: "pause" },
        { nom: "Puits de la Fournaise", x: 23, y: 14, l: 6, h: 8, type: "texte",
          texte: "Un battement sourd monte du fond, si lent qu'on le sent dans les dents avant de l'entendre." }
      ],
      notes: [
        epingle(CHAPITRE_4, 4, 6, "Camp de la Lame ardente", "combat"),
        epingle(CHAPITRE_4, 3, 17, "Captifs à libérer", "padlock"),
        epingle(CHAPITRE_4, 17, 13, "Autel des Braises — Drogha l'Embrasé", "fire"),
        epingle(CHAPITRE_4, 16, 9, "Portail de la Fournaise", "portal"),
        epingle(CHAPITRE_4, 27, 3, "Ezzavel, spectateur", "eye"),
        epingle(CHAPITRE_4, 25, 13, "Fissure secrète vers le puits", "door-secret-outline"),
        epingle(CHAPITRE_4, 24, 17, "Cœur de la Fournaise", "hazard")
      ]
    } })
];
