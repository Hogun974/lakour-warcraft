// Bestiaire d'Azeroth pour dnd5e 6.0.6 (règles 2024) : créatures, serviteurs du Fléau et de la Légion, gens du
// commun. Profils chiffrés adaptés des monstres du SRD 5.2 (CC-BY-4.0, voir CREDITS.md), renommés ; tous les textes
// sont originaux. Chaque PNJ a un texte joueur (biographie publique) et une note MJ (tactique, comportement).
// Distances en mètres. Constructeur et vérifications : acteurs.mjs.
// Chaque capacité a sa propre icône peinte du cœur de Foundry 14 (morsure, griffe, arme, sort…), choisie pour la
// créature : deux « Morsure » ou deux « Tactique de meute » n'ont pas la même. Pas de glyphe blanc icons/svg/.
import { action, attaque, pnj, sauvegarde, trait } from "./acteurs.mjs";
import { icone } from "./aides.mjs";

// Icône d'une capacité : chemin exact (sans « icons/ » ni « .webp ») dans la liste du cœur de Foundry 14 ;
// icone() lève une erreur si elle n'y est pas.
const ic = nom => icone(`icons/${nom}.webp`);
const attaquesMultiples = (texte, img) => action("Attaques multiples", texte, { img: ic(img) });

// ---------------------------------------------------------------- Traits communs
const tactiqueDeMeute = (nom, img) => trait("Tactique de meute", `${nom} a l'avantage à ses jets d'attaque contre une créature si au moins un de ses alliés non neutralisé se trouve à 1,5 m ou moins de cette créature.`, { img: ic(img) });
const amphibie = (nom, img) => trait("Amphibie", `${nom} respire aussi bien à l'air libre que sous l'eau.`, { img: ic(img) });
const resistanceMagie = (nom, img) => trait("Résistance à la magie", `${nom} a l'avantage aux jets de sauvegarde contre les sorts et autres effets magiques.`, { img: ic(img) });
const tenaciteDesMorts = (nom, img) => trait("Ténacité des morts", `Si des dégâts font tomber ${nom} à 0 point de vie, il fait un jet de sauvegarde de Constitution (DD 5 + dégâts subis), sauf s'il s'agit de dégâts radiants ou d'un coup critique. En cas de réussite, il reste debout avec 1 point de vie.`, { img: ic(img) });

export const BESTIAIRE = [
  // ================================================================ Bêtes et créatures
  pnj({ cle: "murloc", nom: "Murloc", fp: 0.125, type: "humanoïde", sousType: "murloc", alignement: "Chaotique neutre",
    ca: 11, pv: 11, dv: "2d8 + 2", carac: { for: 10, dex: 13, con: 12, int: 8, sag: 11, cha: 7 },
    vitesse: { marche: 9, nage: 12 }, competences: { discretion: 1 }, langues: "murloc",
    capacites: [
      amphibie("Le murloc", "magic/water/bubbles-air-water-blue"),
      tactiqueDeMeute("Le murloc", "creatures/fish/fish-pirahna-tan"),
      attaque("Lance de pêche", { toucher: 3, degats: "1d6+1", type: "perforant", portee: [6, 18], arme: "simple", img: ic("weapons/polearms/spear-barbed-silver") }),
      action("Cri gargouillant", "Le murloc pousse un cri aigu qui porte loin sur l'eau. Tous les murlocs à 30 m ou moins l'entendent et accourent ; ceux qui le peuvent se déplacent aussitôt de la moitié de leur vitesse vers lui.", { activation: "bonus", parJour: 1, img: ic("magic/sonic/scream-wail-shout-teal") })
    ],
    texte: "Un humanoïde trapu à peau d'amphibien, grandes nageoires sur la tête et bouche pleine de petites dents. Les murlocs vivent en colonies sur toutes les côtes d'Azeroth et parlent une langue faite de gargouillis que personne d'autre ne comprend.",
    mj: "Jamais seul : un murloc vu en annonce cinq. Il attaque en groupe, crie dès le premier coup reçu et se replie vers l'eau quand la moitié des siens est tombée. Ils volent tout ce qui brille. Le cri attire 1d4 murlocs de plus à chaque fois qu'il est poussé près de leur village." }),

  pnj({ cle: "murloc-chasse-maree", nom: "Murloc chasse-marée", fp: 0.5, type: "humanoïde", sousType: "murloc", alignement: "Chaotique neutre",
    ca: 12, pv: 22, dv: "4d8 + 4", carac: { for: 13, dex: 11, con: 12, int: 10, sag: 13, cha: 9 },
    vitesse: { marche: 9, nage: 12 }, sens: { noir: 36 }, competences: { perception: 1 }, resistances: ["froid"], langues: "murloc",
    role: "elite",
    capacites: [
      amphibie("Le chasse-marée", "magic/water/wave-water-blue"),
      trait("Frénésie de la marée", "Le chasse-marée a l'avantage aux jets d'attaque contre une créature qui n'a pas tous ses points de vie.", { img: ic("skills/wounds/blood-drip-droplet-red") }),
      attaquesMultiples("Le chasse-marée fait deux attaques de Trident barbelé.", "skills/melee/spear-tips-three-green"),
      attaque("Trident barbelé", { toucher: 3, degats: "1d8+1", type: "perforant", portee: [6, 18], arme: "guerre", img: ic("weapons/polearms/trident-curved-steel") }),
      action("Ressac", "Le chasse-marée frappe l'eau de son trident. Chaque murloc allié à 9 m ou moins peut utiliser sa réaction pour se déplacer de la moitié de sa vitesse sans provoquer d'attaque d'opportunité.", { activation: "bonus", recharge: 5, img: ic("magic/water/water-jet-wave-blue") })
    ],
    texte: "Plus grand que ses congénères, le dos couvert d'écailles foncées et de coquillages incrustés, il porte un trident d'os et de corail. C'est le chasseur et le chef de guerre d'une colonie murloc.",
    mj: "Il reste un pas derrière la première ligne, puis fond sur le blessé le plus faible (Frénésie). Il utilise Ressac pour encercler. S'il tombe, les murlocs ordinaires fuient vers l'eau." }),

  pnj({ cle: "kobold-mineur", nom: "Kobold mineur", fp: 0.125, taille: "P", type: "humanoïde", sousType: "kobold", alignement: "Neutre",
    ca: 13, pv: 7, dv: "3d6 - 3", carac: { for: 7, dex: 15, con: 9, int: 8, sag: 7, cha: 8 },
    vitesse: { marche: 9 }, sens: { noir: 18 }, langues: "kobold, quelques mots de commun",
    capacites: [
      tactiqueDeMeute("Le kobold", "creatures/mammals/rodent-rat-green"),
      trait("Pas la bougie !", "Si quelqu'un arrache ou souffle la bougie fixée sur son casque, le kobold est effrayé par cette créature jusqu'à la fin de son prochain tour, puis l'attaque en priorité jusqu'à ce qu'il récupère sa lumière.", { img: ic("sundries/lights/candle-lit-yellow") }),
      trait("Sensibilité au soleil", "En plein soleil, le kobold a le désavantage à ses jets d'attaque et à ses tests de caractéristique.", { img: ic("magic/air/weather-sunlight-sky") }),
      attaque("Pioche de mineur", { toucher: 4, degats: "1d4+2", type: "perforant", carac: "dex", arme: "simple", img: ic("tools/hand/pickaxe-worn-steel-grey") }),
      attaque("Caillou", { toucher: 4, degats: "1d4+2", type: "contondant", distance: true, portee: [6, 18], img: ic("weapons/thrown/throwing-stone") })
    ],
    texte: "Une petite créature au museau de rat et au pelage terne, coiffée d'un casque cabossé où brûle une bougie. Les kobolds creusent les collines d'Elwynn et de partout ailleurs, et défendent leurs galeries avec une hargne étonnante.",
    mj: "Lâches seuls, téméraires en bande. Ils harcèlent à coups de cailloux depuis l'obscurité et se jettent à quatre sur un même ennemi. Éteindre les bougies les désorganise. Ils négocient volontiers contre des chandelles ou de la nourriture." }),

  pnj({ cle: "gnoll", nom: "Gnoll pillard", fp: 0.5, type: "humanoïde", sousType: "gnoll", alignement: "Chaotique mauvais",
    ca: 15, armure: "peaux cloutées et bouclier", pv: 27, dv: "6d8", carac: { for: 14, dex: 12, con: 11, int: 6, sag: 10, cha: 7 },
    vitesse: { marche: 9 }, sens: { noir: 18 }, langues: "gnoll",
    capacites: [
      attaque("Morsure", { toucher: 4, degats: "1d6+2", type: "perforant", img: ic("creatures/abilities/fangs-teeth-bite") }),
      attaque("Arc en os", { toucher: 3, degats: "1d10+1", type: "perforant", distance: true, portee: [45, 180], arme: "guerre", img: ic("weapons/bows/longbow-recurve-skull-brown") }),
      action("Curée", "Quand le gnoll fait tomber une créature à 0 point de vie avec une attaque au corps à corps, il peut se déplacer de la moitié de sa vitesse et faire une attaque de Morsure.", { activation: "bonus", img: ic("creatures/abilities/fang-tooth-blood-red") })
    ],
    texte: "Un humanoïde à tête de hyène, voûté, à la fourrure tachetée et au rire grinçant. Les gnolls des clans Rivepatte ou Pattes-de-Rivière pillent les fermes isolées et les routes mal gardées.",
    mj: "Ils commencent à l'arc depuis la lisière, puis chargent quand une cible tombe. Ils obéissent à la force : tuer le plus grand du groupe peut faire fuir les autres (sauvegarde de Sagesse DD 10 pour chacun)." }),

  pnj({ cle: "sanglier", nom: "Sanglier des plaines", fp: 0.25, type: "bête", alignement: "Non aligné",
    ca: 11, pv: 13, dv: "2d8 + 4", carac: { for: 13, dex: 11, con: 14, int: 2, sag: 9, cha: 5 },
    vitesse: { marche: 12 }, disposition: -1,
    capacites: [
      trait("Fureur du blessé", "Tant qu'il a perdu au moins la moitié de ses points de vie, le sanglier a l'avantage à ses jets d'attaque.", { img: ic("magic/control/buff-strength-muscle-damage-red") }),
      attaque("Défenses", { toucher: 3, degats: "1d6+1", type: "perforant", effet: "Si le sanglier s'est déplacé d'au moins 6 m en ligne droite vers la cible juste avant de la toucher, elle subit 3 (1d6) dégâts perforants de plus.", img: ic("commodities/bones/horn-curved-worn-brown") })
    ],
    texte: "Une bête massive au poil rêche et aux défenses jaunies. On en croise partout, des forêts d'Elwynn aux savanes des Tarides, et les hurans les dressent pour la guerre.",
    mj: "Il charge en ligne droite dès qu'on entre dans son territoire, puis s'acharne sur la même cible. Il fuit à 3 PV. Un sanglier corrompu par la gangrène (yeux verts) ne fuit jamais." }),

  pnj({ cle: "loup", nom: "Loup des bois", fp: 0.25, type: "bête", alignement: "Non aligné",
    ca: 12, pv: 11, dv: "2d8 + 2", carac: { for: 14, dex: 15, con: 12, int: 3, sag: 12, cha: 6 },
    vitesse: { marche: 12 }, sens: { noir: 18 }, competences: { perception: 1, discretion: 1 },
    capacites: [
      tactiqueDeMeute("Le loup", "creatures/abilities/wolf-heads-swirl-purple"),
      attaque("Morsure", { toucher: 4, degats: "1d6+2", type: "perforant", effet: "Si la cible est de taille M ou inférieure, elle tombe à terre.", img: ic("creatures/abilities/mouth-teeth-sharp") })
    ],
    texte: "Un loup gris efflanqué, au pelage hérissé, qui chasse en meute dans les forêts et les collines d'Azeroth. Les orcs en élèvent des plus grands encore, qui leur servent de montures.",
    mj: "La meute tourne autour de la proie, un loup attire l'attention pendant que deux autres mordent par l'arrière. Elle abandonne si la moitié de ses membres tombe ou si on agite du feu (Intimidation DD 12)." }),

  pnj({ cle: "araignee-foret", nom: "Araignée de la forêt", fp: 1, taille: "G", type: "bête", alignement: "Non aligné",
    ca: 14, pv: 26, dv: "4d10 + 4", carac: { for: 14, dex: 16, con: 12, int: 2, sag: 11, cha: 4 },
    vitesse: { marche: 9, escalade: 9 }, sens: { noir: 18 }, competences: { perception: 1, discretion: 2 },
    capacites: [
      trait("Pattes d'araignée", "L'araignée escalade les surfaces difficiles, plafonds compris, sans test de caractéristique.", { img: ic("creatures/invertebrates/spider-mandibles-brown") }),
      trait("Toilière", "L'araignée ignore les entraves dues aux toiles et sent la position de toute créature qui touche sa toile.", { img: ic("creatures/webs/web-spider-white-green") }),
      attaque("Morsure", { toucher: 5, degats: "1d8+3", type: "perforant", plus: [["2d6", "poison"]], img: ic("creatures/abilities/fang-tooth-poison-green") }),
      sauvegarde("Toile", { carac: "dex", dd: 13, portee: 18, recharge: 5, img: ic("magic/control/encase-creature-spider-hold"), echec: "La cible est entravée par la toile. Une créature à portée peut l'en libérer par une action et un test de Force (Athlétisme) DD 13 ; la toile a CA 10 et 5 PV" })
    ],
    texte: "Une araignée grosse comme un poney, au dos marbré de vert et de brun, qui tend ses toiles entre les arbres de la Forêt des Pins-Argentés ou du Bois de la Pénombre.",
    mj: "Elle attend dans les branches, lance sa Toile sur le premier qui passe et mord la proie entravée. Une araignée trouvée en signifie souvent un nid entier, avec des cocons (et parfois un voyageur encore vivant)." }),

  pnj({ cle: "harpie", nom: "Harpie", fp: 1, type: "créature monstrueuse", alignement: "Chaotique mauvais",
    ca: 11, pv: 38, dv: "7d8 + 7", carac: { for: 12, dex: 13, con: 12, int: 7, sag: 10, cha: 13 },
    vitesse: { marche: 6, vol: 12 }, langues: "commun approximatif",
    capacites: [
      attaque("Serres", { toucher: 3, degats: "2d4+1", type: "tranchant", img: ic("creatures/claws/claw-talons-yellow-red") }),
      sauvegarde("Chant ensorcelant", { carac: "sag", dd: 11, zone: { forme: "rayon", taille: 90 }, img: ic("skills/trades/music-singing-voice-blue"),
        texte: "La harpie entonne un chant qui dure tant qu'elle se concentre. Seuls les humanoïdes et les géants y sont sensibles.",
        echec: "La cible est charmée tant que dure le chant : elle est neutralisée et marche vers la harpie par le chemin le plus court. Elle refait le jet à la fin de chacun de ses tours, et chaque fois qu'elle subit des dégâts",
        reussite: "la cible est immunisée contre ce chant pendant 24 heures" })
    ],
    texte: "Une femme-oiseau aux ailes poussiéreuses et aux serres noires, à la voix belle de loin et horrible de près. Les harpies nichent sur les pitons rocheux des Serres-Rocheuses et des Tarides.",
    mj: "Une harpie chante pendant que les autres fondent sur les victimes charmées. Elles fuient en volant dès qu'on les blesse sérieusement, et reviennent la nuit suivante." }),

  pnj({ cle: "centaure-kolkar", nom: "Centaure kolkar", fp: 2, taille: "G", type: "créature monstrueuse", sousType: "centaure", alignement: "Chaotique mauvais",
    ca: 14, armure: "cuirasse de cuir bouilli", pv: 45, dv: "6d10 + 12", carac: { for: 18, dex: 14, con: 14, int: 9, sag: 13, cha: 11 },
    vitesse: { marche: 15 }, competences: { athletisme: 1, perception: 1 }, langues: "gaïen (centaure), un peu d'orc",
    capacites: [
      attaquesMultiples("Le centaure fait deux attaques, de Lance de guerre ou d'Arc long, dans n'importe quelle combinaison.", "skills/melee/strike-polearm-light-orange"),
      attaque("Lance de guerre", { toucher: 6, degats: "1d10+4", type: "perforant", allonge: 3, arme: "guerre", img: ic("weapons/polearms/spear-flared-bronze-teal") }),
      attaque("Arc long", { toucher: 4, degats: "1d8+2", type: "perforant", distance: true, portee: [45, 180], arme: "guerre", img: ic("weapons/bows/longbow-recurve-leather-brown") }),
      sauvegarde("Charge piétinante", { carac: "for", dd: 14, cible: "chaque créature dont le centaure traverse l'espace en se déplaçant de toute sa vitesse, sans provoquer d'attaque d'opportunité", degats: "1d6+4", type: "contondant", recharge: 5, echec: "La cible tombe à terre", img: ic("environment/people/charge") })
    ],
    texte: "Un torse d'homme farouche sur un corps de cheval robuste, couvert de peintures de guerre et de trophées. Les tribus kolkar sillonnent les Tarides et ne reconnaissent aucune frontière.",
    mj: "Les centaures harcèlent à l'arc en restant hors de portée, puis chargent quand l'ennemi se regroupe. Ils méprisent les orcs et les taurens et ne parlementent qu'avec qui les a battus. Ils emportent leurs morts." }),

  pnj({ cle: "huran-guerrier", nom: "Guerrier huran", fp: 0.5, type: "humanoïde", sousType: "huran", alignement: "Chaotique mauvais",
    ca: 13, armure: "peau épaisse et épines", pv: 32, dv: "5d8 + 10", carac: { for: 15, dex: 12, con: 14, int: 8, sag: 10, cha: 9 },
    vitesse: { marche: 9 }, langues: "huran, quelques mots d'orc",
    capacites: [
      tactiqueDeMeute("Le huran", "magic/control/control-influence-rally-purple"),
      trait("Peau d'épines", "Une créature qui agrippe le huran, ou le touche à mains nues, subit 2 (1d4) dégâts perforants.", { img: ic("magic/nature/vines-thorned-green") }),
      attaque("Massue à épines", { toucher: 4, degats: "1d6+2", type: "contondant", arme: "simple", img: ic("weapons/clubs/club-barbed-brown") }),
      attaque("Javeline", { toucher: 4, degats: "1d6+2", type: "perforant", distance: true, portee: [9, 36], carac: "for", arme: "simple", img: ic("weapons/polearms/javelin-hooked") })
    ],
    texte: "Un homme-sanglier massif au groin couturé, le dos hérissé d'épines et de ronces tressées. Les hurans vivent dans des kraals de ronces géantes et défendent farouchement leur territoire contre tous les étrangers.",
    mj: "Ils combattent en meute derrière leurs sangliers de guerre, lancent leurs javelines puis frappent ensemble la même cible. Un huran à moins de 10 PV recule vers le kraal pour chercher du renfort." }),

  pnj({ cle: "ogre", nom: "Ogre", fp: 2, taille: "G", type: "géant", alignement: "Chaotique mauvais",
    ca: 11, armure: "peaux et ferraille", pv: 68, dv: "8d10 + 24", carac: { for: 19, dex: 8, con: 16, int: 5, sag: 7, cha: 7 },
    vitesse: { marche: 12 }, sens: { noir: 18 }, langues: "ogre, un peu de commun",
    capacites: [
      attaque("Gourdin massif", { toucher: 6, degats: "2d8+4", type: "contondant", arme: "simple", img: ic("weapons/clubs/club-heavy-barbed-brown") }),
      attaque("Rocher", { toucher: 6, degats: "2d6+4", type: "contondant", distance: true, portee: [9, 36], carac: "for", img: ic("weapons/thrown/throwing-rock") })
    ],
    texte: "Une montagne de muscles de trois mètres, à la peau grise ou bleuâtre, avec parfois deux têtes qui se disputent. Les ogres des Carmines et de la Forêt des Pins-Argentés louent leurs bras à qui les nourrit.",
    mj: "Il frappe le plus proche et ne réfléchit pas plus loin. Un ogre à deux têtes peut être dressé contre lui-même (Tromperie DD 13 pour semer la discorde entre les têtes : il perd son tour). Il se laisse acheter par de la viande ou de l'or." }),

  pnj({ cle: "troll-fanecorce", nom: "Troll Fanécorce", fp: 1, type: "humanoïde", sousType: "troll", alignement: "Chaotique mauvais",
    ca: 13, armure: "cuir et os", pv: 22, dv: "4d8 + 4", carac: { for: 13, dex: 14, con: 12, int: 9, sag: 12, cha: 8 },
    vitesse: { marche: 9 }, sens: { noir: 18 }, competences: { nature: 1, perception: 1, discretion: 1, survie: 1 }, langues: "zandali, un peu de commun",
    capacites: [
      trait("Régénération trollesque", "Le troll récupère 3 points de vie au début de chacun de ses tours s'il lui reste au moins 1 point de vie et s'il n'a pas subi de dégâts de feu ou d'acide depuis son tour précédent.", { img: ic("magic/nature/root-vine-caduceus-healing") }),
      attaquesMultiples("Le troll fait deux attaques, de Hache de lancer ou de Javeline, dans n'importe quelle combinaison.", "skills/ranged/daggers-thrown-salvo-orange"),
      attaque("Hache de lancer", { toucher: 4, degats: "1d6+2", type: "tranchant", portee: [6, 18], carac: "dex", arme: "simple", img: ic("weapons/thrown/throwing-axe") }),
      attaque("Javeline", { toucher: 4, degats: "1d6+2", type: "perforant", distance: true, portee: [9, 36], arme: "simple", img: ic("weapons/polearms/javelin-flared") })
    ],
    texte: "Un troll des forêts maigre et voûté, à la peau verdâtre peinte de motifs blancs, aux longues défenses et aux cheveux noués de plumes. Les Fanécorce hantent les montagnes d'Arathi et des Hinterlands.",
    mj: "Il frappe de loin, recule dans les arbres pour régénérer, puis revient. Le feu le fait hésiter (il ne fuit pas, mais protège ses blessures). Les Fanécorce sacrifient leurs prisonniers à leurs loas : capturés, les personnages ont un jour pour s'évader." }),

  pnj({ cle: "naga", nom: "Naga des profondeurs", fp: 3, type: "créature monstrueuse", sousType: "naga", alignement: "Loyal mauvais",
    ca: 15, armure: "écailles et coquillages", pv: 58, dv: "9d8 + 18", carac: { for: 16, dex: 13, con: 14, int: 11, sag: 11, cha: 13 },
    vitesse: { marche: 6, nage: 12 }, sens: { noir: 36 }, competences: { athletisme: 1, perception: 1 }, langues: "nazja, commun, darnassien",
    capacites: [
      amphibie("La naga", "magic/water/orb-water-bubbles-teal"),
      attaquesMultiples("La naga fait deux attaques : une de Trident de corail et une de Queue fouettante, ou deux Éclairs de givre.", "creatures/reptiles/serpent-horned-green"),
      attaque("Trident de corail", { toucher: 5, degats: "1d8+3", type: "perforant", portee: [6, 18], arme: "guerre", img: ic("weapons/polearms/trident-ornate-red") }),
      attaque("Queue fouettante", { toucher: 5, degats: "1d6+3", type: "contondant", allonge: 3, effet: "Si la cible est de taille M ou inférieure, elle tombe à terre.", img: ic("creatures/abilities/tail-swipe-green") }),
      attaque("Éclair de givre", { toucher: 3, degats: "2d8", type: "froid", distance: true, magique: true, portee: [18], img: ic("magic/water/projectile-ice-shard") })
    ],
    texte: "Un buste d'elfe aux écailles turquoise sur une longue queue de serpent, plusieurs bras, une chevelure ondulante comme des algues. Les nagas descendent des anciens Bien-nés engloutis avec Zin-Azshari et rêvent de reprendre les côtes.",
    mj: "Elle combat près de l'eau et y entraîne ses victimes (Queue fouettante puis plongée). Arrogante, elle accepte de parler à qui la flatte ou évoque l'ancien Empire. Les nagas mènent souvent des murlocs comme esclaves." }),

  pnj({ cle: "elementaire-terre", nom: "Élémentaire de terre", fp: 5, taille: "G", type: "élémentaire", alignement: "Neutre",
    ca: 17, pv: 147, dv: "14d10 + 70", carac: { for: 20, dex: 8, con: 20, int: 5, sag: 10, cha: 5 },
    vitesse: { marche: 9, creusement: 9 }, sens: { noir: 18, vibrations: 18 },
    vulnerabilites: ["tonnerre"], immunites: ["poison"], immunitesEtats: ["épuisement", "paralysé", "pétrifié", "empoisonné", "inconscient"],
    langues: "terrien", role: "chef",
    capacites: [
      trait("Glisser dans la roche", "L'élémentaire traverse la terre et la pierre non travaillées sans les déranger ni laisser de tunnel.", { img: ic("environment/wilderness/terrain-rocky-ground") }),
      trait("Bélier vivant", "L'élémentaire inflige des dégâts doublés aux objets et aux constructions.", { img: ic("magic/earth/barrier-stone-explosion-debris") }),
      attaquesMultiples("L'élémentaire fait deux attaques, de Poing de roche ou de Jet de roche, dans n'importe quelle combinaison.", "magic/earth/projectiles-stone-salvo-gray"),
      attaque("Poing de roche", { toucher: 8, degats: "2d8+5", type: "contondant", allonge: 3, img: ic("magic/earth/strike-fist-stone-gray") }),
      attaque("Jet de roche", { toucher: 8, degats: "2d6+5", type: "contondant", distance: true, portee: [18], carac: "for", effet: "Si la cible est de taille G ou inférieure, elle tombe à terre.", img: ic("magic/earth/projectile-boulder-debris") })
    ],
    texte: "Un amas de rocs et de terre tassée qui se lève et prend vaguement forme humaine, des cristaux luisant au fond de ses orbites. Les chamans parlent aux esprits de la terre ; certains sorciers les enchaînent.",
    mj: "Lent mais terrible. Il émerge du sol sous la cible la plus proche du lieu qu'il protège. Un chaman (ou une Persuasion DD 18 en terrien) peut l'apaiser si on lui rend ce qu'on a pris à la terre. Rencontre trop dure pour des niveaux 1 à 3 : à réserver à une menace qu'on évite." }),

  pnj({ cle: "dragonnet-noir", nom: "Dragonnet noir", fp: 2, type: "dragon", alignement: "Chaotique mauvais",
    ca: 17, pv: 38, dv: "7d8 + 7", carac: { for: 15, dex: 12, con: 13, int: 14, sag: 11, cha: 13 }, sauvegardes: ["dex", "sag"],
    vitesse: { marche: 9, vol: 18 }, sens: { noir: 18, aveugle: 3 }, competences: { perception: 1, discretion: 1 },
    immunites: ["feu"], langues: "draconique", role: "elite",
    capacites: [
      attaquesMultiples("Le dragonnet fait deux attaques de Griffes.", "creatures/claws/claw-talons-glowing-orange"),
      attaque("Griffes", { toucher: 4, degats: "1d10+2", type: "tranchant", plus: [["1d6", "feu"]], img: ic("creatures/claws/claw-scaled-red") }),
      sauvegarde("Souffle de braise", { carac: "dex", dd: 11, zone: { forme: "cone", taille: 4.5 }, degats: "6d6", type: "feu", recharge: 5, img: ic("creatures/abilities/dragon-fire-breath-orange") })
    ],
    texte: "Un petit dragon aux écailles noires veinées de rouge, la gueule fumante, à peine plus grand qu'un chien. Le Vol noir d'Aile-de-Mort en élève des couvées entières dans les Steppes ardentes et le Mont Rochenoire.",
    mj: "Il crache son souffle dès le premier round sur le plus grand groupe, puis volette hors de portée en attendant que le souffle se recharge. Il n'est jamais seul longtemps : un dragonnet en fuite ramène sa couvée ou un maître draconide." }),

  // ================================================================ Défias
  pnj({ cle: "bandit-defias", nom: "Bandit défias", fp: 0.125, type: "humanoïde", sousType: "humain", alignement: "Neutre mauvais",
    ca: 12, armure: "cuir", pv: 11, dv: "2d8 + 2", carac: { for: 11, dex: 12, con: 12, int: 10, sag: 10, cha: 10 },
    vitesse: { marche: 9 }, langues: "commun, argot des voleurs",
    capacites: [
      attaque("Sabre court", { toucher: 3, degats: "1d6+1", type: "tranchant", arme: "guerre", img: ic("weapons/swords/scimitar-guard-red") }),
      attaque("Arbalète légère", { toucher: 3, degats: "1d8+1", type: "perforant", distance: true, portee: [24, 96], arme: "simple", img: ic("weapons/crossbows/crossbow-simple-red") })
    ],
    texte: "Un brigand au foulard rouge noué sur le visage, en cuir usé, armé d'un sabre et d'une arbalète. La Confrérie défias recrute parmi les tailleurs de pierre floués par la noblesse de Hurlevent et parmi les crève-la-faim de la Marche de l'Ouest.",
    mj: "Il attaque en embuscade, à trois contre un, et se rend dès que le combat tourne mal. Prisonnier, il crache sa haine des nobles de Hurlevent ; un personnage qui l'écoute (Intuition DD 10) découvre souvent un homme ruiné plus qu'un monstre." }),

  pnj({ cle: "chef-defias", nom: "Chef défias", fp: 2, type: "humanoïde", sousType: "humain", alignement: "Neutre mauvais",
    ca: 15, armure: "cuir clouté", pv: 52, dv: "8d8 + 16", carac: { for: 15, dex: 16, con: 14, int: 14, sag: 11, cha: 14 }, sauvegardes: ["for", "dex", "sag"],
    vitesse: { marche: 9 }, competences: { athletisme: 1, tromperie: 1 }, langues: "commun, argot des voleurs", role: "chef",
    capacites: [
      attaquesMultiples("Le chef fait deux attaques, de Rapière ou de Pistolet, dans n'importe quelle combinaison.", "skills/melee/weapons-crossed-swords-black-gray"),
      attaque("Rapière", { toucher: 5, degats: "1d8+3", type: "perforant", arme: "guerre", img: ic("weapons/swords/sword-guard-red") }),
      attaque("Pistolet à silex", { toucher: 5, degats: "1d10+3", type: "perforant", distance: true, portee: [9, 27], arme: "guerre", img: ic("weapons/guns/gun-pistol-flintlock") }),
      action("Parade", "Quand une attaque au corps à corps le touche alors qu'il tient sa rapière, le chef ajoute 2 à sa CA contre cette attaque, ce qui peut la faire échouer.", { activation: "réaction", img: ic("skills/melee/swords-parry-block-blue") }),
      action("Bombe fumigène", "Le chef brise une fiole au sol : une fumée épaisse rend la zone dans un rayon de 3 m autour de lui fortement obscurcie jusqu'à la fin de son prochain tour. Il peut ensuite se déplacer de la moitié de sa vitesse.", { activation: "bonus", parJour: 1, img: ic("commodities/tech/smoke-bomb-red-yellow") })
    ],
    texte: "Masque de tissu rouge, chapeau à larges bords, rapière à la hanche et pistolet à la ceinture. Les chefs défias commandent les bandes de la Marche de l'Ouest et rêvent de faire payer Hurlevent.",
    mj: "Il ne se bat jamais en première ligne : il tire, laisse ses bandits encaisser, puis s'occupe du lanceur de sorts. À mi-PV, Bombe fumigène et fuite. Capturé, il marchande sa liberté contre des noms de nobles corrompus, et ment à moitié (Intuition DD 14)." }),

  // ================================================================ Fléau
  pnj({ cle: "goule", nom: "Goule", fp: 1, type: "mort-vivant", sousType: "Fléau", alignement: "Chaotique mauvais",
    ca: 12, pv: 22, dv: "5d8", carac: { for: 13, dex: 15, con: 10, int: 7, sag: 10, cha: 6 },
    vitesse: { marche: 9 }, sens: { noir: 18 }, immunites: ["poison"], immunitesEtats: ["charmé", "épuisement", "empoisonné"],
    langues: "comprend le commun mais ne parle pas",
    capacites: [
      attaquesMultiples("La goule fait deux attaques, de Morsure ou de Griffes, dans n'importe quelle combinaison.", "magic/death/hand-dirt-undead-zombie"),
      attaque("Morsure", { toucher: 4, degats: "1d6+2", type: "perforant", plus: [["1d6", "nécrotique"]], img: ic("creatures/abilities/mouth-teeth-human") }),
      attaque("Griffes", { toucher: 4, degats: "1d4+2", type: "tranchant", img: ic("creatures/claws/claw-curved-poison-purple"),
        rider: { carac: "con", dd: 10, cible: "la cible, si ce n'est pas un mort-vivant", echec: "La cible est paralysée jusqu'à la fin de son prochain tour" } })
    ],
    texte: "Un cadavre décharné aux muscles à vif, la mâchoire disloquée, qui court à quatre pattes en grognant. Les goules forment le gros des armées du Fléau, de Lordaeron aux Maleterres.",
    mj: "Les goules se jettent en masse sur la cible la plus proche et ignorent la peur. Elles s'acharnent sur un personnage paralysé. Une goule n'a ni tactique ni volonté : si son maître (nécromancien) tombe, elle continue d'attaquer le vivant le plus proche." }),

  pnj({ cle: "squelette", nom: "Squelette du Fléau", fp: 0.25, type: "mort-vivant", sousType: "Fléau", alignement: "Loyal mauvais",
    ca: 14, armure: "restes d'armure", pv: 13, dv: "2d8 + 4", carac: { for: 10, dex: 16, con: 15, int: 6, sag: 8, cha: 5 },
    vitesse: { marche: 9 }, sens: { noir: 18 }, vulnerabilites: ["contondant"], immunites: ["poison"], immunitesEtats: ["épuisement", "empoisonné"],
    langues: "comprend les ordres de son créateur",
    capacites: [
      attaque("Épée rouillée", { toucher: 5, degats: "1d6+3", type: "perforant", arme: "guerre", img: ic("weapons/swords/shortsword-guard-steel-worn") }),
      attaque("Arc court", { toucher: 5, degats: "1d6+3", type: "perforant", distance: true, portee: [24, 96], arme: "simple", img: ic("weapons/bows/shortbow-arrows-black") })
    ],
    texte: "Des ossements jaunis tenus par une lueur bleue, encore vêtus de lambeaux d'uniforme. Le Fléau relève ainsi les soldats tombés en défendant leur royaume.",
    mj: "Il obéit à la lettre au dernier ordre reçu (« garde cette porte »). Il ne poursuit pas au-delà de ce qu'on lui a confié. Les masses et marteaux le brisent facilement." }),

  pnj({ cle: "abomination", nom: "Abomination", fp: 2, taille: "G", type: "mort-vivant", sousType: "Fléau", alignement: "Neutre mauvais",
    ca: 8, pv: 85, dv: "9d10 + 36", carac: { for: 19, dex: 6, con: 18, int: 3, sag: 6, cha: 5 }, sauvegardes: ["sag"],
    vitesse: { marche: 9 }, sens: { noir: 18 }, immunites: ["poison"], immunitesEtats: ["épuisement", "empoisonné"],
    langues: "comprend le commun, grogne quelques mots", role: "elite",
    capacites: [
      tenaciteDesMorts("l'abomination", "magic/death/undead-zombie-grave-green"),
      sauvegarde("Puanteur de charnier", { carac: "con", dd: 12, zone: { forme: "rayon", taille: 1.5 }, activation: "special", img: ic("creatures/magical/spirit-poison-smoke-green"),
        texte: "Toute créature qui commence son tour à 1,5 m ou moins de l'abomination fait ce jet.", echec: "La créature est empoisonnée jusqu'au début de son prochain tour" }),
      attaque("Couperet", { toucher: 6, degats: "2d8+4", type: "tranchant", arme: "guerre", img: ic("weapons/axes/cleaver-red") }),
      attaque("Croc à chaîne", { toucher: 6, degats: "1d8+4", type: "perforant", distance: true, portee: [9], carac: "for", img: ic("weapons/sickles/sickle-kusarigama-chain"),
        effet: "Si la cible est de taille G ou inférieure, l'abomination la tire de 6 m vers elle et l'agrippe (DD 14 pour s'échapper)." })
    ],
    texte: "Un colosse fait de plusieurs cadavres cousus ensemble, au ventre ouvert sur des entrailles grouillantes, armé d'un couperet de boucher et d'un croc au bout d'une chaîne.",
    mj: "Elle attire au croc le personnage qui se tient en retrait (souvent le lanceur de sorts), puis le hache. Lente, elle se contourne facilement. Elle garde les portes et les charniers du Fléau." }),

  pnj({ cle: "necromancien-culte", nom: "Nécromancien du Culte des Damnés", fp: 2, type: "humanoïde", sousType: "humain", alignement: "Neutre mauvais",
    ca: 13, armure: "cuir", pv: 44, dv: "8d8 + 8", carac: { for: 11, dex: 14, con: 12, int: 14, sag: 13, cha: 13 }, sauvegardes: ["int", "sag"],
    vitesse: { marche: 9 }, competences: { arcanes: 1, religion: 1, tromperie: 1 }, langues: "commun, dialecte du Fléau", role: "chef",
    capacites: [
      trait("Incantation", "Le nécromancien lance ses sorts avec l'Intelligence (DD 12 au jet de sauvegarde). À volonté : *contact glacial*, *main de mage*. 1/jour chacun : *simulacre de vie*, *immobilisation de personne*, *fléau*.", { img: ic("sundries/books/book-black-grey") }),
      attaque("Faucille rituelle", { toucher: 4, degats: "1d4+2", type: "tranchant", plus: [["1d6", "nécrotique"]], arme: "simple", img: ic("weapons/sickles/sickle-hooked-purple") }),
      attaque("Trait d'ombre", { toucher: 4, degats: "2d8", type: "nécrotique", distance: true, magique: true, portee: [36], img: ic("magic/death/projectile-skull-fire-purple") }),
      action("Relever les morts", "Le nécromancien désigne jusqu'à deux cadavres humanoïdes à 9 m ou moins : ils se relèvent au début de son prochain tour comme des squelettes du Fléau (ou des goules, s'ils sont frais) sous son contrôle.", { parJour: 1, img: ic("magic/death/hand-undead-skeleton-fire-green") })
    ],
    texte: "Un homme ou une femme aux yeux cernés, en robe sombre brodée de crânes, une faucille rituelle à la ceinture. Le Culte des Damnés promet la vie éternelle au service du roi-liche.",
    mj: "Il se tient derrière ses morts, use de Relever les morts dès qu'un cadavre est disponible (y compris ses propres alliés tombés) et vise les soigneurs avec Trait d'ombre. Il fuit à 15 PV en laissant ses morts couvrir sa retraite. Ses notes mènent toujours à un autre membre du Culte." }),

  // ================================================================ Légion ardente
  pnj({ cle: "chien-corrompu", nom: "Chien corrompu", fp: 3, type: "fiélon", sousType: "démon", alignement: "Chaotique mauvais",
    ca: 15, pv: 58, dv: "9d8 + 18", carac: { for: 17, dex: 12, con: 14, int: 6, sag: 13, cha: 6 },
    vitesse: { marche: 15 }, sens: { noir: 18 }, competences: { perception: 1 }, resistances: ["feu"], langues: "comprend l'eredun", role: "elite",
    capacites: [
      tactiqueDeMeute("Le chien", "magic/nature/wolf-paw-glow-green"),
      resistanceMagie("Le chien", "magic/defensive/shield-barrier-flaming-pentagon-green"),
      trait("Flair des arcanes", "Le chien sent la magie à 36 m : il connaît la position de toute créature qui a lancé un sort ou porte un objet magique actif dans cette zone.", { img: ic("magic/perception/eye-ringed-green") }),
      attaquesMultiples("Le chien fait deux attaques de Morsure.", "creatures/abilities/mouth-teeth-rows-red"),
      attaque("Morsure", { toucher: 5, degats: "1d8+3", type: "perforant", plus: [["1d6", "feu"]], img: ic("creatures/abilities/mouth-teeth-fire-orange") }),
      sauvegarde("Dévorer la magie", { carac: "con", dd: 12, portee: 9, degats: "3d6", type: "psychique", recharge: 5, img: ic("magic/unholy/orb-collecting-energy-green"),
        echec: "Si la cible peut lancer des sorts, elle perd aussi son emplacement de sort disponible du plus bas niveau" })
    ],
    texte: "Une bête démoniaque aux allures de chien squelettique, la peau rouge tendue sur les os, deux tentacules frémissants sur le dos. La Légion ardente lâche ces chiens sur les mages comme on lâche des limiers sur un gibier.",
    mj: "Il traque d'abord le lanceur de sorts le plus puissant (Flair des arcanes) et utilise Dévorer la magie dès qu'il le voit. Il ne fuit pas. Hors combat, il se laisse attirer par un objet magique jeté au loin." }),

  pnj({ cle: "satyre", nom: "Satyre", fp: 0.5, type: "fiélon", sousType: "démon", alignement: "Chaotique mauvais",
    ca: 13, pv: 31, dv: "7d8", carac: { for: 12, dex: 16, con: 11, int: 12, sag: 10, cha: 14 },
    vitesse: { marche: 12 }, sens: { noir: 18 }, competences: { perception: 1, representation: 1, discretion: 1 }, langues: "commun, darnassien, eredun",
    capacites: [
      resistanceMagie("Le satyre", "magic/defensive/shield-barrier-glowing-triangle-green"),
      attaque("Sabots", { toucher: 5, degats: "1d4+3", type: "contondant", effet: "Si la cible est de taille M ou inférieure, le satyre la repousse de 3 m.", img: ic("commodities/bones/hooves-cloven-brown") }),
      attaque("Dague gangrenée", { toucher: 5, degats: "1d4+3", type: "perforant", plus: [["1d4", "feu"]], arme: "simple", img: ic("magic/fire/dagger-rune-enchant-flame-green") }),
      sauvegarde("Raillerie", { carac: "sag", dd: 12, portee: 9, degats: "1d6+2", type: "psychique", moitie: false, img: ic("creatures/unholy/demon-horned-winged-laughing") })
    ],
    texte: "Un elfe déchu aux pattes de bouc, aux cornes recourbées et à la peau tachée de vert gangrené, qui ricane sans cesse. Les satyres furent jadis des elfes de la nuit ; ils servent la Légion ardente et corrompent les forêts.",
    mj: "Il harcèle, se moque, recule entre les arbres et revient frapper un isolé. Il préfère corrompre que tuer : il propose des marchés aux personnages désespérés. Il fuit dès qu'il est seul." }),

  pnj({ cle: "gangregarde", nom: "Gangregarde", fp: 4, taille: "G", type: "fiélon", sousType: "démon", alignement: "Loyal mauvais",
    ca: 18, armure: "harnois de gangracier", pv: 76, dv: "9d10 + 27", carac: { for: 18, dex: 14, con: 16, int: 10, sag: 12, cha: 11 },
    vitesse: { marche: 9 }, sens: { noir: 36 }, competences: { athletisme: 1, perception: 1 }, resistances: ["feu", "froid"],
    langues: "eredun, commun", role: "chef",
    capacites: [
      attaquesMultiples("Le gangregarde fait deux attaques de Hache gangrenée.", "skills/melee/strike-axe-blood-red"),
      attaque("Hache gangrenée", { toucher: 6, degats: "2d10+4", type: "tranchant", arme: "guerre", img: ic("weapons/axes/axe-battle-green") }),
      attaque("Hache lancée", { toucher: 6, degats: "1d10+4", type: "tranchant", distance: true, portee: [6, 18], carac: "for", arme: "guerre", img: ic("weapons/thrown/throwing-axe-steel") }),
      sauvegarde("Cri de la Légion", { carac: "sag", dd: 13, zone: { forme: "rayon", taille: 9 }, recharge: 5, activation: "bonus", img: ic("creatures/unholy/demon-fire-horned-winged-roar"),
        texte: "Le gangregarde rugit un ordre en eredun.", echec: "La cible est effrayée jusqu'à la fin du prochain tour du gangregarde" })
    ],
    texte: "Un démon colossal en armure hérissée de pointes, à la peau verte et aux cornes noires, maniant une hache plus grande qu'un homme. Les gangregardes sont les sergents de la Légion ardente.",
    mj: "Il avance droit sur le plus fort, en ignorant les autres. Il ne recule jamais sans ordre. Rencontre de fin d'aventure pour des niveaux 3 à 4 : on peut le combattre affaibli, ou empêcher son invocation." }),

  // ================================================================ Gens d'Azeroth
  pnj({ cle: "garde-hurlevent", nom: "Garde de Hurlevent", fp: 0.125, type: "humanoïde", sousType: "humain", alignement: "Loyal neutre",
    ca: 16, armure: "chemise de mailles et bouclier", pv: 11, dv: "2d8 + 2", carac: { for: 13, dex: 12, con: 12, int: 10, sag: 11, cha: 10 },
    vitesse: { marche: 9 }, competences: { perception: 1 }, langues: "commun", disposition: 0,
    capacites: [
      attaque("Lance", { toucher: 3, degats: "1d6+1", type: "perforant", portee: [6, 18], arme: "simple", img: ic("weapons/polearms/spear-flared-blue") }),
      action("Sonner l'alarme", "Le garde souffle dans son cor : tous les gardes à 150 m ou moins l'entendent et accourent.", { activation: "bonus", parJour: 1, img: ic("tools/instruments/horn-flared-wood") })
    ],
    texte: "Tabard bleu frappé du lion d'or, casque à visière, lance et bouclier. Les gardes de Hurlevent patrouillent la capitale de l'Alliance et les routes du Comté d'Elwynn.",
    mj: "Honnête dans l'ensemble, débordé, mal payé. Il préfère arrêter que tuer, sonne l'alarme dès qu'un combat éclate et se méfie des orcs, même pacifiques. Un pot-de-vin le fâche s'il est grossier (Persuasion DD 13 sinon)." }),

  pnj({ cle: "grunt-orgrimmar", nom: "Grunt d'Orgrimmar", fp: 0.5, type: "humanoïde", sousType: "orc", alignement: "Loyal neutre",
    ca: 13, armure: "mailles et cuir", pv: 32, dv: "5d8 + 10", carac: { for: 16, dex: 12, con: 14, int: 9, sag: 10, cha: 10 },
    vitesse: { marche: 9 }, sens: { noir: 18 }, competences: { athletisme: 1, intimidation: 1 }, langues: "orc, commun", disposition: 0,
    capacites: [
      trait("Pour la Horde !", "Tant qu'il a perdu au moins la moitié de ses points de vie, le grunt a l'avantage à ses jets d'attaque.", { img: ic("sundries/flags/banner-symbol-axe-red") }),
      attaque("Hache de guerre", { toucher: 5, degats: "1d8+3", type: "tranchant", arme: "guerre", img: ic("weapons/axes/axe-double-simple-red") }),
      attaque("Javeline", { toucher: 5, degats: "1d6+3", type: "perforant", distance: true, portee: [9, 36], carac: "for", arme: "simple", img: ic("weapons/polearms/javelin-simple") })
    ],
    texte: "Un orc à la peau verte, épaulières de fer et hache de guerre, fier de servir le chef de guerre. Les grunts gardent Orgrimmar, le Carrefour et tous les avant-postes de la Horde.",
    mj: "Direct, susceptible sur l'honneur, respectueux de qui se bat bien. Il n'attaque pas le premier dans une ville neutre comme Cabestan, mais ne recule devant aucune provocation. Un défi loyal (un contre un) l'apaise mieux qu'un discours." }),

  pnj({ cle: "paysan", nom: "Paysan", fp: 0, type: "humanoïde", alignement: "Neutre bon",
    ca: 10, pv: 4, dv: "1d8", carac: { for: 10, dex: 10, con: 10, int: 10, sag: 10, cha: 10 },
    vitesse: { marche: 9 }, langues: "commun ou orc", disposition: 0,
    capacites: [
      trait("Savoir-faire", "Le paysan maîtrise une compétence liée à son métier (Dressage, Nature, Survie…) et a l'avantage à ses tests de cette compétence.", { img: ic("skills/trades/farming-wheat-circle-yellow") }),
      attaque("Fourche", { toucher: 2, degats: "1d4", type: "perforant", arme: "simple", img: ic("weapons/polearms/trident-fork-white") })
    ],
    texte: "Un fermier, un berger, un péon ou une lavandière : les gens simples qui nourrissent Azeroth et se cachent quand les armées passent.",
    mj: "Il fuit le combat sauf pour défendre sa famille. Il sait tout ce qui se passe dans un rayon d'une journée de marche : un personnage aimable (Persuasion DD 10) obtient une rumeur." }),

  pnj({ cle: "marchand", nom: "Marchand", fp: 0.125, type: "humanoïde", alignement: "Neutre",
    ca: 11, pv: 9, dv: "2d8", carac: { for: 10, dex: 12, con: 11, int: 13, sag: 14, cha: 16 },
    vitesse: { marche: 9 }, competences: { tromperie: 1, intuition: 1, persuasion: 1 }, langues: "commun, orc, gobelin", disposition: 0,
    capacites: [
      trait("Œil du négociant", "Le marchand a l'avantage aux tests d'Intuition pour juger une offre et aux tests d'Investigation pour estimer la valeur d'un objet.", { img: ic("skills/social/trading-justice-scale-gold") }),
      attaque("Dague", { toucher: 3, degats: "1d4+1", type: "perforant", portee: [6, 18], arme: "simple", img: ic("weapons/daggers/dagger-jeweled-blue") }),
      action("Gardes !", "Le marchand appelle ses gardes du corps, qui arrivent au début du round suivant s'ils sont à portée de voix.", { activation: "réaction", parJour: 1, img: ic("environment/people/infantry-armored") })
    ],
    texte: "Un négociant aux doigts couverts de bagues, entouré de caisses et de livres de comptes. Gobelins du Cartel, humains de Hurlevent ou trolls des Échos, les marchands sont partout où l'or circule.",
    mj: "Il négocie tout, ment par habitude et respecte qui marchande bien. Il paie volontiers une escorte, moins volontiers la vérité. Il connaît les routes, les prix et les rumeurs des ports." }),

  pnj({ cle: "pretre-lumiere", nom: "Prêtre de la Lumière", fp: 0.25, type: "humanoïde", sousType: "humain", alignement: "Loyal bon",
    ca: 13, armure: "chemise de mailles", pv: 11, dv: "2d8 + 2", carac: { for: 14, dex: 10, con: 12, int: 10, sag: 14, cha: 11 },
    vitesse: { marche: 9 }, competences: { medecine: 1, religion: 1 }, langues: "commun", disposition: 1,
    capacites: [
      trait("Incantation", "Le prêtre lance ses sorts avec la Sagesse (DD 12). À volonté : *lumière*, *thaumaturgie*. 1/jour chacun : *bénédiction*, *mot de guérison*, *sanctuaire*.", { img: ic("magic/holy/prayer-hands-glowing-yellow") }),
      attaque("Masse", { toucher: 4, degats: "1d6+2", type: "contondant", plus: [["1d4", "radiant"]], arme: "simple", img: ic("weapons/maces/mace-flanged-steel") }),
      attaque("Châtiment de Lumière", { toucher: 4, degats: "2d6", type: "radiant", distance: true, magique: true, portee: [18], img: ic("magic/light/beam-rays-yellow") })
    ],
    texte: "Robe blanche et or, symbole du soleil levant au cou, une masse simple à la ceinture. L'Église de la Sainte Lumière soigne les blessés et réconforte les vivants de Hurlevent à Theramore, et parfois bien au-delà.",
    mj: "Il soigne d'abord, juge ensuite. Il hait les morts-vivants et le Culte des Damnés, et aide quiconque les combat, même un orc (avec une prière de méfiance). Il peut servir de guérisseur à un groupe en difficulté." }),

  pnj({ cle: "mage-dalaran", nom: "Mage de Dalaran", fp: 2, type: "humanoïde", sousType: "humain", alignement: "Neutre bon",
    ca: 12, armure: "robe enchantée (15 sous armure du mage)", pv: 40, dv: "9d8", carac: { for: 9, dex: 14, con: 11, int: 16, sag: 12, cha: 11 }, sauvegardes: ["int", "sag"],
    vitesse: { marche: 9 }, competences: { arcanes: 1, histoire: 1 }, langues: "commun, thalassien, draconique", disposition: 1, role: "elite",
    capacites: [
      trait("Incantation", "Le mage lance ses sorts avec l'Intelligence (DD 13). À volonté : *main de mage*, *prestidigitation*. 1/jour chacun : *armure du mage*, *bouclier*, *pas brumeux*, *détection de la magie*.", { img: ic("sundries/books/book-embossed-jewel-gold-purple") }),
      attaquesMultiples("Le mage fait deux attaques d'Éclair de givre.", "magic/water/projectile-icecicles-salvo"),
      attaque("Éclair de givre", { toucher: 5, degats: "2d8", type: "froid", distance: true, magique: true, portee: [36], img: ic("magic/water/projectile-ice-faceted-blue") }),
      attaque("Bâton", { toucher: 1, degats: "1d6-1", type: "contondant", arme: "simple", img: ic("weapons/staves/staff-blue-jewel") }),
      sauvegarde("Nova de givre", { carac: "dex", dd: 13, zone: { forme: "rayon", taille: 3 }, degats: "2d6", type: "froid", recharge: 5, img: ic("magic/water/snowflake-ice-blue"),
        echec: "La cible est entravée par le givre jusqu'à la fin de son prochain tour" })
    ],
    texte: "Robe violette brodée d'étoiles, livre de sorts à la ceinture, un air poli de supériorité. Les mages du Kirin Tor viennent de la cité volante de Dalaran et se mêlent de tout ce qui touche à la magie.",
    mj: "Il gèle d'abord les ennemis au contact (Nova de givre), recule, puis enchaîne les éclairs. Il ne combat pas jusqu'à la mort : à 15 PV, il disparaît (pas brumeux). Allié précieux, il paie bien les informations sur les artefacts de la Légion." })
];
