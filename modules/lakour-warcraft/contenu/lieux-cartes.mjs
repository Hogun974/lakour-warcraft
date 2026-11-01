// Cartes de lieux courants d'Azeroth, sans aventure attachée : le MJ IA les active dans n'importe quelle partie
// quand le récit y mène (« une auberge au bord de la route », « une crypte sous la chapelle »…). Même convertisseur
// et même plans.json que les cartes d'aventure : tout passe par scene() de cartes.mjs (case de 1,5 m).
// Clés préfixées « lieu- » ; la description dit à quoi le lieu peut servir. Les éléments nommés (comptoir, puits,
// autel, forge…) servent de repères au MJ IA pour placer les jetons.
// Astuce de plan : une grande pièce de fond (place, sous-bois, camp) couvre toute la carte et les bâtiments sont des
// pièces posées par-dessus (la dernière pièce gagne la case) : seuls leurs bords deviennent des murs.
import { scene } from "./cartes.mjs";

// Rangée de n ouvertures du même type le long d'un bord : vers l'est pour un côté nord ou sud, vers le sud pour un
// côté est ou ouest. Pour les arcades, les grandes portes, les rives et les lisières ouvertes.
export function rangee(type, cote, x, y, n) {
  const horizontal = cote === "nord" || cote === "sud";
  return Array.from({ length: n }, (_, i) => ({ x: horizontal ? x + i : x, y: horizontal ? y : y + i, cote, type }));
}

export const CARTES_LIEUX = [
  scene({ cle: "lieu-auberge", nom: "Lieu — Auberge de bord de route",
    description: "Une auberge de village ou de carrefour : grande salle avec cheminée et comptoir, cuisine, cellier (trappe secrète), couloir de trois chambres et écurie. Pour une rencontre avec un PNJ, une rumeur, une bagarre de comptoir, un vol dans les chambres, un rendez-vous discret ou une nuit interrompue par des intrus.",
    plan: {
      largeur: 22, hauteur: 16, lumiere: "penombre",
      pieces: [
        { nom: "Salle commune", x: 0, y: 0, l: 14, h: 10, sol: "bois" },
        { nom: "Cuisine", x: 14, y: 0, l: 8, h: 6, sol: "pierre" },
        { nom: "Cellier", x: 14, y: 6, l: 8, h: 4, sol: "terre" },
        { nom: "Couloir des chambres", x: 0, y: 10, l: 22, h: 2, sol: "bois" },
        { nom: "Chambre du levant", x: 0, y: 12, l: 5, h: 4, sol: "bois" },
        { nom: "Chambre du milieu", x: 5, y: 12, l: 5, h: 4, sol: "bois" },
        { nom: "Chambre du couchant", x: 10, y: 12, l: 5, h: 4, sol: "bois" },
        { nom: "Écurie", x: 15, y: 12, l: 7, h: 4, sol: "terre" }
      ],
      ouvertures: [
        { x: 0, y: 6, cote: "ouest", type: "porte" }, { x: 13, y: 3, cote: "est", type: "porte" },
        { x: 17, y: 5, cote: "sud", type: "porte" }, { x: 13, y: 8, cote: "est", type: "secrete" },
        ...rangee("passage", "sud", 2, 9, 2),
        { x: 2, y: 12, cote: "nord", type: "porte" }, { x: 7, y: 12, cote: "nord", type: "porte" }, { x: 12, y: 12, cote: "nord", type: "porte" },
        { x: 18, y: 12, cote: "nord", type: "porte" }, ...rangee("passage", "est", 21, 13, 2),
        { x: 0, y: 2, cote: "ouest", type: "fenetre" }, { x: 10, y: 0, cote: "nord", type: "fenetre" }, { x: 2, y: 15, cote: "sud", type: "fenetre" }
      ],
      lumieres: [
        { x: 6, y: 1, rayon: 4, couleur: "#ff9a40" }, { x: 10, y: 4, rayon: 3, couleur: "#ffcc88" }, { x: 3, y: 6, rayon: 3, couleur: "#ffcc88" },
        { x: 18, y: 2, rayon: 3, couleur: "#ff9944" }, { x: 10, y: 10, rayon: 2, couleur: "#ffcc66" }, { x: 18, y: 14, rayon: 1, couleur: "#ffaa55" }
      ],
      elements: [
        { nom: "Cheminée", x: 5, y: 0, l: 3, h: 1 }, { nom: "Comptoir", x: 9, y: 3, l: 4, h: 1 },
        { nom: "Table", x: 2, y: 3, l: 2, h: 1 }, { nom: "Table", x: 2, y: 6, l: 2, h: 1 }, { nom: "Table", x: 6, y: 5, l: 2, h: 2 }, { nom: "Table", x: 10, y: 7, l: 2, h: 1 },
        { nom: "Fourneau", x: 18, y: 0, l: 2, h: 1 }, { nom: "Table de cuisine", x: 16, y: 2, l: 3, h: 1 },
        { nom: "Tonneaux", x: 15, y: 7, l: 3, h: 1 }, { nom: "Caisses", x: 19, y: 8, l: 2, h: 1 },
        { nom: "Lit", x: 1, y: 13, l: 2, h: 2 }, { nom: "Lit", x: 6, y: 13, l: 2, h: 2 }, { nom: "Lit", x: 11, y: 13, l: 2, h: 2 },
        { nom: "Mangeoire", x: 16, y: 15, l: 3, h: 1 }
      ]
    } }),

  scene({ cle: "lieu-village", nom: "Lieu — Village humain",
    description: "Un village de l'Alliance (Comté d'Elwynn, Marche de l'Ouest, Carmines) : place herbeuse et puits, forge, maison du bourgmestre, chapelle de la Lumière, échoppe, maison et grange. Pour une fête, un marché, un appel à l'aide, une attaque de bandits ou de gnolls, une enquête de voisinage ou un départ d'aventure.",
    plan: {
      largeur: 32, hauteur: 24, lumiere: "jour",
      pieces: [
        { nom: "Place du village", x: 0, y: 0, l: 32, h: 24, sol: "herbe" },
        { nom: "Forge", x: 2, y: 2, l: 6, h: 5, sol: "pierre" },
        { nom: "Maison du bourgmestre", x: 10, y: 2, l: 7, h: 5, sol: "bois" },
        { nom: "Chapelle de la Lumière", x: 22, y: 2, l: 8, h: 7, sol: "sanctuaire" },
        { nom: "Maison du meunier", x: 2, y: 16, l: 6, h: 5, sol: "bois" },
        { nom: "Échoppe", x: 11, y: 17, l: 6, h: 4, sol: "bois" },
        { nom: "Grange", x: 22, y: 15, l: 8, h: 6, sol: "bois" }
      ],
      ouvertures: [
        ...rangee("passage", "sud", 4, 6, 2), { x: 13, y: 6, cote: "sud", type: "porte" },
        ...rangee("porte", "sud", 25, 8, 2), { x: 5, y: 16, cote: "nord", type: "porte" }, { x: 13, y: 17, cote: "nord", type: "porte" },
        ...rangee("passage", "ouest", 22, 17, 2), { x: 29, y: 18, cote: "est", type: "porte" },
        { x: 10, y: 4, cote: "ouest", type: "fenetre" }, { x: 16, y: 4, cote: "est", type: "fenetre" },
        { x: 22, y: 5, cote: "ouest", type: "fenetre" }, { x: 29, y: 5, cote: "est", type: "fenetre" }, { x: 7, y: 18, cote: "est", type: "fenetre" }
      ],
      lumieres: [{ x: 5, y: 3, rayon: 2, couleur: "#ff7a30" }, { x: 26, y: 4, rayon: 3, couleur: "#ffe8a0" }],
      elements: [
        { nom: "Puits", x: 15, y: 11, l: 2, h: 2 }, { nom: "Foyer de forge", x: 6, y: 3, l: 1, h: 2 }, { nom: "Enclume", x: 4, y: 4, l: 1, h: 1 },
        { nom: "Table", x: 12, y: 3, l: 3, h: 1 }, { nom: "Autel de la Lumière", x: 25, y: 3, l: 2, h: 1 },
        { nom: "Bancs", x: 23, y: 5, l: 2, h: 2 }, { nom: "Bancs", x: 27, y: 5, l: 2, h: 2 },
        { nom: "Comptoir", x: 12, y: 19, l: 4, h: 1 }, { nom: "Lit", x: 3, y: 18, l: 2, h: 2 },
        { nom: "Bottes de foin", x: 24, y: 18, l: 3, h: 2 }, { nom: "Chariot", x: 19, y: 11, l: 3, h: 2 },
        { nom: "Étal", x: 9, y: 11, l: 2, h: 1 }, { nom: "Étal", x: 9, y: 13, l: 2, h: 1 },
        { nom: "Arbre", x: 1, y: 10, l: 2, h: 2 }, { nom: "Arbre", x: 28, y: 11, l: 2, h: 2 }, { nom: "Clôture", x: 9, y: 22, l: 10, h: 1 }
      ]
    } }),

  scene({ cle: "lieu-campement-orc", nom: "Lieu — Campement orc",
    description: "Un avant-poste de la Horde en pleine nature (Tarides, Durotar, Orneval) : tente du chef, tente des grunts, tente du chaman, enclos des loups, forge de campagne et grand feu central. Pour une audience auprès d'un chef orc, un défi d'honneur, une mission confiée par la Horde, une attaque de centaures ou une infiltration côté Alliance.",
    plan: {
      largeur: 28, hauteur: 22, lumiere: "penombre",
      pieces: [
        { nom: "Camp", x: 0, y: 0, l: 28, h: 22, sol: "terre" },
        { nom: "Tente du chef", x: 10, y: 2, l: 8, h: 6, sol: "bois" },
        { nom: "Tente des grunts", x: 2, y: 4, l: 6, h: 5, sol: "terre" },
        { nom: "Tente du chaman", x: 20, y: 4, l: 6, h: 5, sol: "cendre" },
        { nom: "Enclos des loups", x: 2, y: 14, l: 7, h: 6, sol: "terre" },
        { nom: "Forge de campagne", x: 20, y: 14, l: 6, h: 5, sol: "pierre" }
      ],
      ouvertures: [
        ...rangee("passage", "sud", 13, 7, 2), { x: 7, y: 6, cote: "est", type: "passage" }, { x: 20, y: 6, cote: "ouest", type: "passage" },
        { x: 8, y: 16, cote: "est", type: "porte" }, ...rangee("passage", "ouest", 20, 15, 3)
      ],
      lumieres: [
        { x: 13, y: 12, rayon: 5, couleur: "#ff8a30" }, { x: 13, y: 4, rayon: 2, couleur: "#ffaa55" },
        { x: 22, y: 6, rayon: 2, couleur: "#66ccff" }, { x: 23, y: 16, rayon: 2, couleur: "#ff6a20" }
      ],
      elements: [
        { nom: "Feu de camp", x: 13, y: 12, l: 2, h: 2 }, { nom: "Trône du chef", x: 13, y: 3, l: 2, h: 1 }, { nom: "Table de guerre", x: 11, y: 5, l: 2, h: 1 },
        { nom: "Paillasses", x: 3, y: 5, l: 2, h: 3 }, { nom: "Totem", x: 23, y: 5, l: 1, h: 1 }, { nom: "Chaudron", x: 21, y: 7, l: 1, h: 1 },
        { nom: "Mangeoire", x: 3, y: 18, l: 3, h: 1 }, { nom: "Enclume", x: 23, y: 16, l: 1, h: 1 }, { nom: "Râtelier d'armes", x: 10, y: 15, l: 3, h: 1 },
        { nom: "Tambour de guerre", x: 17, y: 11, l: 1, h: 1 }, { nom: "Bannière de la Horde", x: 9, y: 9, l: 1, h: 1 },
        { nom: "Palissade", x: 0, y: 0, l: 9, h: 1 }, { nom: "Palissade", x: 19, y: 0, l: 9, h: 1 }, { nom: "Caisses", x: 16, y: 19, l: 2, h: 2 }
      ]
    } }),

  scene({ cle: "lieu-mine", nom: "Lieu — Mine",
    description: "Une mine de cuivre ou de fer, active ou abandonnée : carreau à l'entrée, galerie principale, front de taille, réserve d'outils, puits de descente et galerie effondrée. Pour des kobolds à déloger, des mineurs disparus, une contrebande, un trésor enfoui, un éboulement ou un repaire de bandits défias.",
    plan: {
      largeur: 28, hauteur: 20, lumiere: "nuit",
      pieces: [
        { nom: "Carreau de la mine", x: 0, y: 6, l: 6, h: 8, sol: "terre" },
        { nom: "Galerie principale", x: 6, y: 8, l: 16, h: 3, sol: "terre" },
        { nom: "Front de taille", x: 8, y: 0, l: 8, h: 8, sol: "pierre" },
        { nom: "Réserve d'outils", x: 16, y: 1, l: 6, h: 7, sol: "bois" },
        { nom: "Puits de descente", x: 22, y: 5, l: 6, h: 9, sol: "pierre" },
        { nom: "Galerie effondrée", x: 8, y: 11, l: 10, h: 8, sol: "terre" }
      ],
      ouvertures: [
        { x: 0, y: 9, cote: "ouest", type: "passage" }, { x: 0, y: 10, cote: "ouest", type: "passage" },
        ...rangee("passage", "est", 5, 8, 3), ...rangee("passage", "sud", 11, 7, 2), { x: 18, y: 8, cote: "nord", type: "porte" },
        ...rangee("passage", "est", 21, 8, 3), { x: 12, y: 11, cote: "nord", type: "passage" }
      ],
      lumieres: [{ x: 2, y: 9, rayon: 3, couleur: "#ffb060" }, { x: 13, y: 9, rayon: 2, couleur: "#ffaa44" }, { x: 11, y: 3, rayon: 2, couleur: "#ffaa44" }, { x: 24, y: 9, rayon: 1, couleur: "#ffaa44" }],
      elements: [
        { nom: "Établi", x: 1, y: 7, l: 2, h: 1 }, { nom: "Tas de minerai", x: 2, y: 12, l: 2, h: 1 }, { nom: "Wagonnet", x: 8, y: 9, l: 2, h: 1 },
        { nom: "Étai", x: 15, y: 8, l: 1, h: 1 }, { nom: "Filon de cuivre", x: 9, y: 1, l: 4, h: 1 }, { nom: "Pilier de roche", x: 13, y: 4, l: 1, h: 1 },
        { nom: "Caisses", x: 17, y: 2, l: 2, h: 2 }, { nom: "Tonneaux de poudre", x: 20, y: 6, l: 1, h: 1 },
        { nom: "Treuil", x: 24, y: 7, l: 2, h: 2 }, { nom: "Puits", x: 24, y: 11, l: 2, h: 2 },
        { nom: "Éboulis", x: 10, y: 14, l: 3, h: 2 }, { nom: "Éboulis", x: 14, y: 16, l: 2, h: 2 }, { nom: "Squelette de mineur", x: 9, y: 17, l: 1, h: 1 }
      ]
    } }),

  scene({ cle: "lieu-crypte", nom: "Lieu — Crypte",
    description: "La crypte sous une chapelle ou un cimetière : escalier d'accès, vestibule, nef des tombeaux à piliers, ossuaire, chapelle funéraire et caveau scellé (porte secrète). Pour des morts qui se relèvent, un nécromancien du Culte des Damnés, une relique à récupérer, un tombeau profané ou une veillée qui tourne mal.",
    plan: {
      largeur: 24, hauteur: 20, lumiere: "nuit",
      pieces: [
        { nom: "Escalier", x: 10, y: 0, l: 4, h: 3, sol: "pierre" },
        { nom: "Vestibule", x: 8, y: 3, l: 8, h: 4, sol: "pierre" },
        { nom: "Nef des tombeaux", x: 4, y: 7, l: 16, h: 8, sol: "cendre" },
        { nom: "Ossuaire", x: 0, y: 7, l: 4, h: 8, sol: "pierre" },
        { nom: "Caveau scellé", x: 20, y: 7, l: 4, h: 8, sol: "cendre" },
        { nom: "Chapelle funéraire", x: 8, y: 15, l: 8, h: 5, sol: "sanctuaire" }
      ],
      ouvertures: [
        { x: 11, y: 0, cote: "nord", type: "porte" }, ...rangee("passage", "sud", 11, 2, 2), ...rangee("porte", "sud", 11, 6, 2),
        { x: 4, y: 10, cote: "ouest", type: "passage" }, { x: 19, y: 11, cote: "est", type: "secrete" },
        ...rangee("passage", "sud", 11, 14, 2)
      ],
      lumieres: [{ x: 11, y: 4, rayon: 2, couleur: "#ffaa55" }, { x: 11, y: 17, rayon: 3, couleur: "#88aaff" }, { x: 22, y: 11, rayon: 2, couleur: "#55ff99" }],
      elements: [
        { nom: "Pilier", x: 7, y: 9, l: 1, h: 1 }, { nom: "Pilier", x: 16, y: 9, l: 1, h: 1 }, { nom: "Pilier", x: 7, y: 12, l: 1, h: 1 }, { nom: "Pilier", x: 16, y: 12, l: 1, h: 1 },
        { nom: "Sarcophage", x: 9, y: 8, l: 2, h: 1 }, { nom: "Sarcophage", x: 13, y: 8, l: 2, h: 1 },
        { nom: "Sarcophage", x: 9, y: 13, l: 2, h: 1 }, { nom: "Sarcophage", x: 13, y: 13, l: 2, h: 1 },
        { nom: "Niches à ossements", x: 0, y: 8, l: 1, h: 6 }, { nom: "Autel funéraire", x: 11, y: 18, l: 2, h: 1 },
        { nom: "Tombeau du seigneur", x: 21, y: 10, l: 2, h: 3 }, { nom: "Statue de gardien", x: 8, y: 4, l: 1, h: 1 }, { nom: "Statue de gardien", x: 15, y: 4, l: 1, h: 1 }
      ]
    } }),

  scene({ cle: "lieu-foret", nom: "Lieu — Clairière en forêt",
    description: "Une clairière au cœur d'une forêt (Elwynn, Orneval, Bois de la Pénombre) : grand chêne, cercle de pierres, cabane de trappeur et ruisseau franchi par un pont de rondins. Pour un bivouac, une embuscade de loups ou de bandits, un rendez-vous secret, un rituel druidique ou un satyre qui corrompt les bois.",
    plan: {
      largeur: 28, hauteur: 22, lumiere: "jour",
      pieces: [
        { nom: "Sous-bois", x: 0, y: 0, l: 28, h: 22, sol: "herbe" },
        { nom: "Cabane du trappeur", x: 2, y: 2, l: 5, h: 4, sol: "bois" },
        { nom: "Ruisseau", x: 0, y: 16, l: 28, h: 2, sol: "eau" }
      ],
      ouvertures: [
        { x: 4, y: 5, cote: "sud", type: "porte" }, { x: 6, y: 3, cote: "est", type: "fenetre" },
        ...rangee("passage", "nord", 0, 16, 28), ...rangee("passage", "sud", 0, 17, 28)
      ],
      lumieres: [{ x: 15, y: 11, rayon: 3, couleur: "#ffaa55" }],
      elements: [
        { nom: "Grand chêne", x: 12, y: 6, l: 3, h: 3 }, { nom: "Feu de camp", x: 15, y: 11, l: 1, h: 1 }, { nom: "Cercle de pierres", x: 20, y: 3, l: 3, h: 3 },
        { nom: "Pont de rondins", x: 19, y: 16, l: 2, h: 2 }, { nom: "Lit de camp", x: 3, y: 3, l: 2, h: 1 },
        { nom: "Arbre", x: 0, y: 9, l: 2, h: 2 }, { nom: "Arbre", x: 8, y: 1, l: 2, h: 2 }, { nom: "Arbre", x: 25, y: 8, l: 2, h: 2 },
        { nom: "Arbre", x: 4, y: 12, l: 2, h: 2 }, { nom: "Arbre", x: 23, y: 19, l: 2, h: 2 }, { nom: "Arbre", x: 5, y: 19, l: 2, h: 2 },
        { nom: "Souche", x: 18, y: 12, l: 1, h: 1 }, { nom: "Rocher", x: 9, y: 13, l: 2, h: 1 }, { nom: "Buissons", x: 24, y: 13, l: 3, h: 1 }
      ]
    } }),

  scene({ cle: "lieu-port", nom: "Lieu — Port",
    description: "Le port d'une ville côtière (Hurlevent, Theramore, Cabestan, Baie-du-Butin) : rue du port avec capitainerie, entrepôt et taverne, quai pavé, jetée de bois et bassin où mouillent un navire et des barques. Pour un embarquement, une contrebande, un marché aux poissons, une rixe de marins, une attaque de murlocs ou de nagas, ou une filature entre les caisses.",
    plan: {
      largeur: 30, hauteur: 22, lumiere: "jour",
      pieces: [
        { nom: "Rue du port", x: 0, y: 0, l: 30, h: 8, sol: "pierre" },
        { nom: "Capitainerie", x: 2, y: 1, l: 7, h: 5, sol: "bois" },
        { nom: "Entrepôt", x: 11, y: 1, l: 8, h: 6, sol: "bois" },
        { nom: "Taverne du port", x: 21, y: 1, l: 8, h: 6, sol: "bois" },
        { nom: "Quai", x: 0, y: 8, l: 30, h: 4, sol: "pierre" },
        { nom: "Bassin", x: 0, y: 12, l: 30, h: 10, sol: "eau" },
        { nom: "Jetée", x: 12, y: 12, l: 3, h: 8, sol: "bois" }
      ],
      ouvertures: [
        { x: 5, y: 5, cote: "sud", type: "porte" }, ...rangee("porte", "sud", 14, 6, 2), { x: 18, y: 3, cote: "est", type: "verrouillee" },
        { x: 24, y: 6, cote: "sud", type: "porte" }, { x: 2, y: 3, cote: "ouest", type: "fenetre" }, { x: 28, y: 3, cote: "est", type: "fenetre" },
        ...rangee("passage", "nord", 0, 8, 30), ...rangee("passage", "nord", 0, 12, 30),
        ...rangee("passage", "ouest", 12, 12, 8), ...rangee("passage", "est", 14, 12, 8), ...rangee("passage", "sud", 12, 19, 3)
      ],
      lumieres: [{ x: 24, y: 3, rayon: 3, couleur: "#ffcc88" }, { x: 13, y: 19, rayon: 2, couleur: "#ffaa44" }],
      elements: [
        { nom: "Bureau du capitaine", x: 4, y: 2, l: 3, h: 1 }, { nom: "Caisses", x: 12, y: 2, l: 3, h: 2 }, { nom: "Caisses", x: 16, y: 4, l: 2, h: 1 },
        { nom: "Comptoir", x: 22, y: 3, l: 5, h: 1 }, { nom: "Table", x: 23, y: 5, l: 2, h: 1 },
        { nom: "Grue de chargement", x: 6, y: 9, l: 2, h: 2 }, { nom: "Tonneaux", x: 17, y: 9, l: 2, h: 1 }, { nom: "Caisses", x: 22, y: 9, l: 2, h: 2 },
        { nom: "Filets de pêche", x: 1, y: 10, l: 3, h: 1 }, { nom: "Navire marchand", x: 18, y: 14, l: 10, h: 4 },
        { nom: "Barque", x: 4, y: 15, l: 3, h: 1 }, { nom: "Bitte d'amarrage", x: 14, y: 18, l: 1, h: 1 }
      ]
    } }),

  scene({ cle: "lieu-ruines-elfiques", nom: "Lieu — Ruines elfiques",
    description: "Les vestiges d'un temple elfe de la nuit envahi par la végétation (Orneval, Sombrivage, Féralas) : bosquet, parvis aux colonnes brisées, sanctuaire de la Lune avec sa fontaine et une cache derrière une porte secrète. Pour une relique ancienne, des satyres ou des nagas, un esprit à apaiser, une rencontre avec des druides ou une exploration d'avant l'Exil.",
    plan: {
      largeur: 28, hauteur: 22, lumiere: "penombre",
      pieces: [
        { nom: "Bosquet", x: 0, y: 0, l: 28, h: 22, sol: "herbe" },
        { nom: "Parvis", x: 6, y: 4, l: 16, h: 14, sol: "pierre" },
        { nom: "Sanctuaire de la Lune", x: 10, y: 7, l: 8, h: 7, sol: "sanctuaire" },
        { nom: "Cache des prêtresses", x: 18, y: 8, l: 3, h: 4, sol: "pierre" }
      ],
      ouvertures: [
        ...rangee("passage", "nord", 9, 4, 4), ...rangee("passage", "sud", 12, 17, 4), ...rangee("passage", "ouest", 6, 9, 3), ...rangee("passage", "est", 21, 13, 2),
        ...rangee("passage", "sud", 13, 13, 2), { x: 17, y: 10, cote: "est", type: "secrete" }, { x: 14, y: 7, cote: "nord", type: "fenetre" }
      ],
      lumieres: [{ x: 13, y: 10, rayon: 3, couleur: "#a0c8ff" }, { x: 19, y: 9, rayon: 1, couleur: "#c0a0ff" }],
      elements: [
        { nom: "Fontaine de lune", x: 13, y: 9, l: 2, h: 2 }, { nom: "Statue de prêtresse", x: 11, y: 8, l: 1, h: 1 }, { nom: "Statue de prêtresse", x: 16, y: 8, l: 1, h: 1 },
        { nom: "Autel lunaire", x: 13, y: 12, l: 2, h: 1 }, { nom: "Coffre ancien", x: 19, y: 10, l: 1, h: 1 },
        { nom: "Colonne brisée", x: 8, y: 6, l: 1, h: 1 }, { nom: "Colonne brisée", x: 19, y: 5, l: 1, h: 1 }, { nom: "Colonne brisée", x: 8, y: 15, l: 1, h: 1 }, { nom: "Colonne brisée", x: 19, y: 15, l: 1, h: 1 },
        { nom: "Arbre", x: 1, y: 2, l: 2, h: 2 }, { nom: "Arbre", x: 24, y: 1, l: 2, h: 2 }, { nom: "Arbre", x: 2, y: 18, l: 2, h: 2 }, { nom: "Arbre", x: 24, y: 18, l: 2, h: 2 },
        { nom: "Racines", x: 7, y: 11, l: 2, h: 1 }, { nom: "Bloc effondré", x: 16, y: 15, l: 2, h: 1 }
      ]
    } })
];
