// Montures et maîtres de vol des Tarides : cinq montures en acteurs dnd5e (bélier de Forgefer, loup de guerre, kodo,
// raptor, hippogriffe), avec leur vitesse et leur capacité de charge (règle 2024 : Force × 7,5 kg, doublée pour une
// créature de taille G, quadruplée pour TG ; pousser, tirer ou soulever : le double), et le journal visible
// « Routes aériennes des Tarides » (maîtres de vol, prix, durées, montures à vendre). Durées cohérentes avec l'horloge de
// la campagne (une journée de marche ≈ 4 heures de vol). Textes originaux.
import { attaque, attaquesMultiples, pnj, sauvegarde, trait } from "./acteurs.mjs";
import { collection, journal } from "./aides.mjs";
import { reference } from "./guides.mjs";

// Capacité de charge (kg) d'une créature selon sa Force et sa taille.
const FACTEUR_TAILLE = { M: 1, G: 2, TG: 4 };
export const chargeKg = (force, taille) => force * 7.5 * FACTEUR_TAILLE[taille];
const kg = n => `${String(n).replace(".", ",")} kg`;
const charge = (force, taille, suite) => `**Capacité de charge : ${kg(chargeKg(force, taille))}** (pousser, tirer ou soulever : ${kg(chargeKg(force, taille) * 2)}). ${suite}`;

export const MONTURES = collection("montures", [
  pnj({ cle: "monture-belier-de-forgefer", nom: "Bélier de montagne de Forgefer", fp: 0.5, taille: "G", type: "bête", alignement: "Non aligné",
    ca: 12, armure: "toison épaisse", pv: 30, dv: "4d10 + 8", carac: { for: 16, dex: 12, con: 15, int: 2, sag: 11, cha: 6 },
    vitesse: { marche: 12, escalade: 9 }, competences: { athletisme: 1 }, disposition: 1,
    capacites: [
      trait("Bête de selle", charge(16, "G", "Porte un cavalier de taille M ou P et son paquetage sans ralentir. Vitesse 12 m, escalade 9 m. Prix : 150 po chez les éleveurs nains de Theramore (réputation Amical auprès de l'Alliance), 30 po la selle et le harnais.")),
      trait("Pied de montagne", "Le bélier a l'avantage aux tests et aux jets de sauvegarde faits pour ne pas tomber à terre, et ignore le terrain difficile des pentes rocheuses. Son cavalier en profite aussi pour rester en selle."),
      attaque("Coup de cornes", { toucher: 5, degats: "1d8+3", type: "contondant", effet: "Si le bélier s'est déplacé d'au moins 6 m en ligne droite vers la cible juste avant, elle subit 7 (2d6) dégâts contondants de plus et, si elle est de taille G ou inférieure, tombe à terre." })
    ],
    texte: "Un bélier gris des montagnes de Dun Morogh, large comme un poney, aux cornes enroulées cerclées de bronze. Les nains en élèvent depuis toujours et le mènent par la voix plus que par les rênes.",
    mj: "Une monture robuste et têtue, idéale en montagne et dans les collines rouges des Tarides. Il obéit à qui le nourrit et refuse d'avancer s'il sent un démon (gangrène, Lame ardente) : un indice gratuit pour le MJ." }),

  pnj({ cle: "monture-loup-de-guerre", nom: "Loup de guerre de Durotar", fp: 1, taille: "G", type: "bête", alignement: "Non aligné",
    ca: 13, armure: "cuir de selle clouté", pv: 37, dv: "5d10 + 10", carac: { for: 17, dex: 15, con: 15, int: 3, sag: 12, cha: 7 },
    vitesse: { marche: 15 }, sens: { noir: 18 }, competences: { perception: 1, discretion: 1 }, disposition: 1,
    capacites: [
      trait("Bête de selle", charge(17, "G", "Porte un cavalier de taille M et son paquetage. Vitesse 15 m. Prix : 120 po au Carrefour (réputation Amical auprès de la Horde), 25 po le harnais de guerre.")),
      trait("Flair du loup", "Le loup a l'avantage aux tests de Sagesse (Perception) fondés sur l'ouïe ou l'odorat, et il prévient son cavalier d'une embuscade : le cavalier ne peut pas être surpris tant que le loup ne l'est pas."),
      attaque("Crocs de guerre", { toucher: 5, degats: "2d6+3", type: "perforant", effet: "Si la cible est de taille M ou inférieure, elle doit réussir un jet de sauvegarde de Force DD 13 ou tomber à terre." })
    ],
    texte: "Un loup noir aussi haut qu'un cheval, au poitrail barré de cicatrices et aux oreilles fendues. Les orcs de Durotar les élèvent depuis leur arrivée en Kalimdor, et un loup de guerre ne reconnaît qu'un seul maître.",
    mj: "Fidèle et féroce : il se bat à côté de son cavalier, et le défend s'il tombe. Un loup maltraité finit par mordre la main qui le frappe. Les chevaux de l'Alliance paniquent à son odeur (désavantage aux tests pour les contrôler à 9 m ou moins)." }),

  pnj({ cle: "monture-kodo", nom: "Kodo des Tarides", fp: 3, taille: "TG", type: "bête", alignement: "Non aligné",
    ca: 13, armure: "cuir épais", pv: 94, dv: "9d12 + 36", carac: { for: 22, dex: 7, con: 19, int: 2, sag: 10, cha: 5 },
    vitesse: { marche: 9 }, disposition: 1,
    capacites: [
      trait("Bête de somme", charge(22, "TG", "Porte un palanquin pour quatre cavaliers de taille M, ou une caravane entière de marchandises. Vitesse 9 m, mais il marche douze heures sans se fatiguer. Prix : 300 po au Carrefour (500 po avec le palanquin).")),
      attaque("Coup de tête", { toucher: 8, degats: "2d10+6", type: "contondant", allonge: 3 }),
      sauvegarde("Piétinement", { carac: "dex", dd: 16, cible: "chaque créature de taille G ou inférieure dont le kodo traverse l'espace en se déplaçant de toute sa vitesse, sans provoquer d'attaque d'opportunité", degats: "3d10", type: "contondant", recharge: 5, echec: "La cible tombe à terre" })
    ],
    texte: "Un colosse gris à peau de cuir, gros comme une maison, avec deux cornes en croissant et une queue qui balaie les mouches. Les taurens et les orcs le chargent de tout ce qui doit traverser les Tarides.",
    mj: "Lent mais increvable. Un kodo effrayé (feu, démon, odeur de sang de kodo) fonce droit devant lui : test de Sagesse (Dressage) DD 13 par le conducteur pour le calmer. Les kodos vont mourir dans un cimetière connu d'eux seuls, quelque part au sud-ouest : une rumeur pour des aventuriers curieux." }),

  pnj({ cle: "monture-raptor", nom: "Raptor des îles de l'Écho", fp: 1, taille: "G", type: "bête", alignement: "Non aligné",
    ca: 14, armure: "écailles", pv: 32, dv: "5d10 + 5", carac: { for: 15, dex: 16, con: 13, int: 3, sag: 12, cha: 6 },
    vitesse: { marche: 15 }, competences: { perception: 1, discretion: 1 }, disposition: 1,
    capacites: [
      trait("Bête de selle", charge(15, "G", "Porte un cavalier de taille M et peu de bagages. Vitesse 15 m. Prix : 140 po chez les trolls Sombrelance du Carrefour (réputation Amical auprès de la Horde).")),
      trait("Bond du raptor", "Le raptor saute jusqu'à 6 m en longueur et 3 m en hauteur, avec ou sans élan, cavalier compris. Il ignore les fossés, les ruisseaux et les palissades basses."),
      attaque("Griffe en faucille", { toucher: 5, degats: "1d10+3", type: "tranchant", carac: "dex", effet: "Si le raptor a sauté pour atteindre la cible ce tour-ci, l'attaque a l'avantage." })
    ],
    texte: "Un lézard bipède aux écailles vertes rayées d'orange, à la crête de plumes et à la griffe en faucille. Les trolls Sombrelance les élèvent sur les îles de l'Écho et leur parlent en sifflant.",
    mj: "Vif et nerveux, il mord ce qu'il ne connaît pas. Un cavalier qui n'est pas troll fait un test de Sagesse (Dressage) DD 12 la première journée, sinon le raptor le désarçonne une fois. Ensuite, c'est le plus rapide des compagnons de route." }),

  pnj({ cle: "monture-hippogriffe", nom: "Hippogriffe de Theramore", fp: 1, taille: "G", type: "créature monstrueuse", alignement: "Non aligné",
    ca: 12, pv: 45, dv: "6d10 + 12", carac: { for: 17, dex: 14, con: 14, int: 4, sag: 12, cha: 8 },
    vitesse: { marche: 12, vol: 18 }, competences: { perception: 1 }, disposition: 1,
    capacites: [
      trait("Bête de selle ailée", charge(17, "G", "En vol, au-delà de la moitié (127,5 kg), sa vitesse de vol est réduite de moitié. Vitesse 12 m, vol 18 m. Il ne se vend pas : on le loue au maître de vol, ou on le reçoit en prêt (Alliance ou Sentinelles, Exalté).")),
      attaquesMultiples("L'hippogriffe fait deux attaques : une de Bec et une de Serres."),
      attaque("Bec", { toucher: 5, degats: "1d10+3", type: "perforant" }),
      attaque("Serres", { toucher: 5, degats: "2d6+3", type: "tranchant" })
    ],
    texte: "Une créature à tête, ailes et serres d'aigle sur un corps de cerf, aux plumes bleu nuit et aux bois délicats. Les elfes de la nuit les ont apprivoisés il y a des siècles ; Theramore en a reçu quelques-uns pour ses courriers.",
    mj: "Il connaît les routes de Theramore par cœur et y rentre seul si son cavalier tombe. Il refuse de se poser près d'un feu de gangrène ou d'un mort-vivant. Les orcs le regardent de travers, et il le leur rend bien." })
]);

// ---------------------------------------------------------------- Routes aériennes (journal visible)

// [départ, arrivée, prix en po, durée en heures, service] ; « neutre » = maîtres de vol du Cartel ou de la Trêve.
export const ROUTES = [
  ["Cabestan", "Le Carrefour", 3, 6, "neutre et Horde"],
  ["Cabestan", "Fort-Rivet", 4, 8, "neutre, gyroptère du Cartel"],
  ["Cabestan", "Theramore", 5, 6, "neutre et Alliance"],
  ["Cabestan", "Gué-de-Sel", 6, 12, "neutre, après le sommet"],
  ["Le Carrefour", "Fort-Rivet", 2, 4, "Horde"],
  ["Le Carrefour", "Gué-de-Sel", 4, 8, "Horde"],
  ["Le Carrefour", "Orgrimmar", 8, 12, "Horde"],
  ["Theramore", "Gué-de-Sel", 5, 8, "Alliance"]
];

const ligneRoute = ([a, b, prix, heures, service]) => `- **${a} ↔ ${b}** : ${prix} po, ${heures} heures de vol (${service}).`;

export const JOURNAL_ROUTES = journal({
  cle: "routes-aeriennes-des-tarides", nom: "Routes aériennes des Tarides", visible: true, pages: [
    { titre: "Maîtres de vol", texte: `
Dans les Tarides, on vole d'un perchoir à l'autre sur le dos d'une wyverne (Horde), d'un hippogriffe (Alliance) ou dans la nacelle grinçante d'un gyroptère gobelin (Cartel). On paie le maître de vol, la bête connaît la route : le voyageur n'a qu'à se tenir.

- **Cabestan** — *Zippa Haute-Voltige*, gobeline. Wyvernes et hippogriffes de location, gyroptère du Cartel. Elle vole pour tout le monde, du moment qu'on paie d'avance : c'est un port neutre.
- **Le Carrefour** — *Tal'zun Plume-Rouge*, troll. Wyvernes. Il ne prend que les membres de la Horde et ceux pour qui un membre de la Horde se porte garant.
- **Theramore** — *Alwen Brise-Nuage*, naine. Hippogriffes. Réservé à l'Alliance et à ses alliés.
- **Fort-Rivet** — un ouvrier de la fonderie et son gyroptère de livraison. Seulement depuis Cabestan, quand la fonderie tourne.
- **Gué-de-Sel** — après le sommet (chapitre 3 de la campagne), le Bureau de la Trêve y installe un perchoir neutre, avec une wyverne et un hippogriffe qui ne se supportent pas.

**Réputation.** Un maître de vol de faction refuse un voyageur *Inamical* ou pire auprès de sa faction. La remise du palier de réputation s'applique au prix du vol (voir le Guide de la réputation).

**Pas de perchoir** à Eldrassal (on y va en barque ou à pied par la côte), ni à Brasegouffre : un vol vers le cratère ne se fait que par faveur d'un chef qui prête ses propres bêtes.` },
    { titre: "Routes et tarifs", texte: `
Prix par voyageur (sa monture comprise si elle est de taille M ou P ; une monture de taille G voyage en bateau ou à pied). Une journée de marche vaut environ **4 heures de vol** ; on vole de jour, et un vol de plus de 8 heures fait escale pour la nuit.

${ROUTES.map(ligneRoute).join("\n")}

**En vol.** Le voyageur ne peut rien faire d'autre que regarder : pas de repos court, pas d'étude. Un vol peut être interrompu par une tempête de sable, une harpie ou un tir venu d'en bas : si le MJ tire sur la table des rencontres, c'est une rencontre par vol de 6 heures ou plus.` },
    { titre: "Montures", texte: `
Les montures se vendent chez les éleveurs, aux prix ci-dessous (remise de réputation comprise). La capacité de charge d'une monture vaut sa **Force × 7,5 kg**, ×2 pour une créature de taille G et ×4 pour une très grande (TG) ; pousser, tirer ou soulever : le double. Voir aussi ${reference("monter en selle")}, ${reference("controler une monture")} et ${reference("rythme de voyage")}.

- **Bélier de montagne de Forgefer** — vitesse 12 m, escalade 9 m ; charge ${kg(chargeKg(16, "G"))}. 150 po, à Theramore (Alliance, Amical).
- **Loup de guerre de Durotar** — vitesse 15 m ; charge ${kg(chargeKg(17, "G"))}. 120 po, au Carrefour (Horde, Amical).
- **Kodo des Tarides** — vitesse 9 m, infatigable ; charge ${kg(chargeKg(22, "TG"))}, palanquin pour quatre. 300 po (500 avec palanquin), au Carrefour.
- **Raptor des îles de l'Écho** — vitesse 15 m, bonds de 6 m ; charge ${kg(chargeKg(15, "G"))}. 140 po, au Carrefour (Horde, Amical).
- **Hippogriffe de Theramore** — vitesse 12 m, vol 18 m ; charge ${kg(chargeKg(17, "G"))} (moitié en vol). Ne se vend pas : location au maître de vol, ou prêt d'une faction à Exalté.

**Écurie.** 5 pa par nuit et par monture dans une ville, le double pour un kodo. Une monture qu'on ne nourrit pas perd 1 point de vie maximal par jour.` }
  ]
});

export const MONTURES_DOCUMENTS = [...MONTURES, ...collection("montures", [JOURNAL_ROUTES])];
