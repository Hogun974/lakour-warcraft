// « Les Braises de la Légion » — campagne en quatre chapitres qui suit « Les Puits de cendre » : 3 à 5 personnages
// de niveau 3, qui atteignent le niveau 6 ; six à neuf séances. Chaque chapitre se joue sur un lieu différent des
// Tarides et de leur côte ; les commanditaires restent Grizzla Tordeboulon (Cartel Gentepression) et le Bureau de la
// Trêve de Cabestan. Groupe de l'Alliance, de la Horde ou mixte. Textes originaux.
// Les profils chiffrés des créatures sont adaptés et renommés du SRD 5.2 (CC-BY-4.0) ; voir CREDITS.md.
import { action, attaque, attaquesMultiples, pnj, sauvegarde, trait } from "./acteurs.mjs";
import { journal } from "./aides.mjs";
import { CARTES as CARTES_AVENTURE, TITRE_AVENTURE } from "./aventure-cartes.mjs";
import { CARTES_CAMPAGNE, TITRE_CAMPAGNE } from "./campagne-cartes.mjs";

const NOMS_CARTES = Object.fromEntries([...CARTES_AVENTURE, ...CARTES_CAMPAGNE].map(c => [c.flags["lakour-warcraft"].cle, c.name]));
const carte = cle => {
  if (!NOMS_CARTES[cle]) throw new Error(`Campagne : carte inconnue ${cle}`);
  return NOMS_CARTES[cle];
};

// ---------------------------------------------------------------- PNJ nommés et nouvelles créatures

export const PNJ_CAMPAGNE = [
  // --- Chapitre 1 : la fonderie de Fort-Rivet
  pnj({ cle: "vizzik-tirelire", nom: "Vizzik Tirelire, patron de la fonderie", fp: 2, taille: "P", type: "humanoïde", sousType: "gobelin",
    alignement: "Neutre", ca: 15, armure: "cuir clouté et tablier renforcé", pv: 45, dv: "10d6 + 10",
    carac: { for: 8, dex: 16, con: 12, int: 16, sag: 10, cha: 14 }, competences: { tromperie: 1, investigation: 1, persuasion: 1 },
    langues: "gobelin, commun, orc", disposition: 0, role: "chef",
    capacites: [
      trait("Fusée de secours", "La première fois que Vizzik tombe à 0 point de vie, une fusée cousue dans son dos l'emporte à 9 m dans la direction de son choix ; il reste à 1 point de vie."),
      attaque("Clé à molette", { toucher: 5, degats: "1d6+3", type: "contondant", arme: "simple" }),
      attaque("Pistolet à éclat", { toucher: 5, degats: "1d10+3", type: "perforant", plus: [["1d6", "feu"]], distance: true, portee: [9, 27], arme: "guerre" }),
      sauvegarde("Grenade de chantier", { carac: "dex", dd: 13, zone: { forme: "sphere", taille: 3 }, degats: "3d6", type: "feu", parJour: 2,
        texte: "Vizzik lance une grenade sur un point qu'il voit à 18 m ou moins." }),
      action("Coup de sifflet", "Vizzik siffle : un déchiqueteur qui l'entend se déplace aussitôt de sa vitesse, sans provoquer d'attaque d'opportunité.", { activation: "bonus" })
    ],
    texte: "Un gobelin rondouillard en tablier de cuir roussi, une loupe vissée sur l'œil gauche et trois crayons derrière chaque oreille. Il compte tout, tout le temps, à voix haute.",
    mj: "Rival malheureux de Grizzla, il a monté sa propre fonderie loin du Cartel. Il achète depuis trois mois des « pierres vertes qui chauffent toutes seules » à un orc tatoué, et construit des déchiqueteurs pour un « client qui paie en or ancien ». Il ne sait pas ce qu'est la Lame ardente et s'en moque. Il cède à une meilleure affaire (Persuasion DD 15, avantage avec une offre écrite de Grizzla) ou à la preuve que ses ouvriers vont mourir (Médecine DD 13 sur un ouvrier malade). Il ne se bat que pour protéger sa caisse, et fuit dès qu'il est blessé." }),

  pnj({ cle: "dechiqueteur-fonderie", nom: "Déchiqueteur de la fonderie", fp: 3, taille: "G", type: "artificiel", alignement: "Non aligné",
    ca: 15, armure: "plaques rivetées", pv: 52, dv: "7d10 + 14", carac: { for: 16, dex: 13, con: 15, int: 3, sag: 9, cha: 3 },
    immunites: ["poison", "psychique"], immunitesEtats: ["charmé", "effrayé", "empoisonné", "épuisement"], langues: "comprend le gobelin, ne parle pas",
    role: "elite",
    capacites: [
      trait("Moteur à éclat", "Le déchiqueteur tourne grâce à un fragment d'éclat gangrené. S'il subit des dégâts de foudre, sa vitesse tombe à 0 jusqu'à la fin de son prochain tour. Quand il est détruit, son moteur explose : chaque créature à 3 m ou moins fait un jet de sauvegarde de Dextérité DD 12 et subit 7 (2d6) dégâts de feu en cas d'échec, la moitié en cas de réussite."),
      attaquesMultiples("Le déchiqueteur fait deux attaques de Scie."),
      attaque("Scie", { toucher: 5, degats: "1d10+3", type: "tranchant", allonge: 3 }),
      sauvegarde("Jet de vapeur", { carac: "con", dd: 12, zone: { forme: "cone", taille: 4.5 }, degats: "3d6", type: "feu", recharge: 5 })
    ],
    texte: "Une carcasse de métal à deux jambes, haute comme un ogre, avec deux bras-scies et un hublot vert sur la poitrine. Elle crache de la vapeur à chaque pas.",
    mj: "Machine de chantier transformée en arme. Elle obéit à Vizzik et à qui porte son sifflet. Une créature peut grimper dans le poste de pilotage (Athlétisme DD 14 au contact) puis couper le moteur (Arcanes ou outils de bricoleur DD 13) : la machine s'arrête net. Deux d'entre elles sont prêtes à la livraison dans l'atelier." }),

  // --- Chapitre 2 : les ruines d'Eldrassal
  pnj({ cle: "aelyra-ombrefeuille", nom: "Aelyra Ombrefeuille, sentinelle", fp: 2, type: "humanoïde", sousType: "elfe de la nuit",
    alignement: "Chaotique bon", ca: 15, armure: "cuir clouté", pv: 39, dv: "6d8 + 12", carac: { for: 12, dex: 17, con: 14, int: 11, sag: 15, cha: 10 },
    competences: { discretion: 2, perception: 1, survie: 1, nature: 1 }, sens: { noir: 18 }, langues: "darnassien, commun", disposition: 1, role: "elite",
    capacites: [
      trait("Fille de la nuit", "Dans la pénombre ou l'obscurité, Aelyra peut prendre l'action Se cacher par une action bonus."),
      attaquesMultiples("Aelyra fait deux attaques, avec son Arc long ou sa Lame de guerre."),
      attaque("Lame de guerre", { toucher: 5, degats: "1d8+3", type: "tranchant", arme: "guerre" }),
      attaque("Arc long", { toucher: 5, degats: "1d8+3", type: "perforant", distance: true, portee: [45, 180], arme: "guerre" })
    ],
    texte: "Une elfe de la nuit à la peau mauve et aux cheveux couleur d'ardoise, des marques de griffes tatouées sous les yeux. Même enchaînée, elle se tient droite.",
    mj: "Gardienne solitaire des ruines d'Eldrassal, capturée par les nagas il y a quatre jours (on la trouve dans la cage de corail, à 9 PV). Elle se méfie des orcs et des gobelins, mais reconnaît une dette. Elle sait que le bassin lunaire « dort » et comment le réveiller, et que l'eau d'un bassin réveillé éteint ce que la Légion allume. Elle peut accompagner le groupe jusqu'au chapitre 4." }),

  pnj({ cle: "sssthera", nom: "Sss'thera, sirène des abysses", fp: 4, type: "créature monstrueuse", sousType: "naga", alignement: "Loyal mauvais",
    ca: 15, armure: "écailles et bijoux de corail", pv: 75, dv: "10d8 + 30", carac: { for: 14, dex: 16, con: 16, int: 15, sag: 13, cha: 17 },
    sauvegardes: ["dex", "sag"], competences: { arcanes: 1, intimidation: 1, perception: 1 }, vitesse: { marche: 9, nage: 12 }, sens: { noir: 18 },
    langues: "nazja, darnassien, commun", role: "chef",
    capacites: [
      trait("Amphibie", "Sss'thera respire dans l'air comme dans l'eau."),
      trait("Incantation", "Sss'thera lance ses sorts avec le Charisme (DD 14). À volonté : *main de mage*, *rayon de givre*. 1/jour chacun : *image miroir*, *immobilisation de personne*, *ténèbres*."),
      attaquesMultiples("Sss'thera fait deux attaques : une de Trident et une de Queue, ou deux de Trait des abysses."),
      attaque("Trident", { toucher: 5, degats: "1d8+3", type: "perforant", arme: "guerre" }),
      attaque("Queue", { toucher: 5, degats: "1d6+3", type: "contondant", effet: "Si la cible est de taille M ou inférieure, elle est agrippée (évasion DD 13)." }),
      attaque("Trait des abysses", { toucher: 5, degats: "2d8", type: "froid", distance: true, magique: true, portee: [36] }),
      sauvegarde("Chant des marées", { carac: "sag", dd: 14, zone: { forme: "rayon", taille: 9 }, recharge: 5,
        texte: "Sss'thera chante dans une langue oubliée. Seules les créatures de son choix qui l'entendent sont concernées.",
        echec: "La cible est charmée jusqu'à la fin du prochain tour de Sss'thera ; elle doit utiliser tout son déplacement pour s'approcher d'elle, et ne peut pas l'attaquer" })
    ],
    texte: "Une naga au buste de femme et à la longue queue d'écailles turquoise, la chevelure piquée de peignes de corail. Sa voix est un murmure qui semble venir de l'eau elle-même.",
    mj: "Chef des nagas qui fouillent Eldrassal. Elle veut la Braise pour elle : un trésor des Bien-Nés lui revient de droit, pense-t-elle. Elle a laissé Ezzavel aider aux fouilles en échange d'or, et ne sait pas qu'il compte la trahir. Si on lui prouve la trahison (la lettre d'Ezzavel, ou Intuition DD 15 pendant qu'il parle), elle se retourne contre le satyre, puis contre le groupe. Elle peut accepter un marché : la Braise contre la libre exploitation des ruines (Persuasion DD 16). Elle fuit dans le lagon à 20 PV." }),

  // --- Chapitre 3 : le sommet de Gué-de-Sel
  pnj({ cle: "corwen-haldis", nom: "Capitaine Corwen Haldis, envoyé de Theramore", fp: 3, type: "humanoïde", sousType: "humain",
    alignement: "Loyal bon", ca: 18, armure: "harnois", pv: 52, dv: "8d8 + 16", carac: { for: 16, dex: 11, con: 14, int: 11, sag: 11, cha: 15 },
    sauvegardes: ["con", "sag"], competences: { athletisme: 1, histoire: 1, persuasion: 1 }, langues: "commun", disposition: 0, role: "elite",
    capacites: [
      trait("Vieux soldat", "Corwen a l'avantage aux jets de sauvegarde contre l'état effrayé."),
      attaquesMultiples("Corwen fait deux attaques d'Épée longue."),
      attaque("Épée longue", { toucher: 5, degats: "1d8+3", type: "tranchant", arme: "guerre" }),
      attaque("Arbalète lourde", { toucher: 2, degats: "1d10", type: "perforant", distance: true, portee: [30, 120], arme: "guerre" }),
      action("Parade", "Corwen ajoute 2 à sa CA contre une attaque au corps à corps qui devrait le toucher. Il doit voir l'attaquant et tenir une arme de corps à corps.", { activation: "réaction" })
    ],
    texte: "Un homme grisonnant au harnois bosselé, la moustache taillée au cordeau. Il parle peu, salue tout le monde, et ne s'assoit jamais dos à une porte.",
    mj: "L'ancien lieutenant du Bureau de la Trêve (aventure de départ), promu capitaine et envoyé de Theramore au sommet. Il veut sincèrement la paix dans les Tarides, mais ses soldats ont perdu des amis contre la Horde. Si les personnages l'ont aidé dans les Puits de cendre, il les fait entrer au sommet comme témoins (aide de jeu : sauf-conduit)." }),

  pnj({ cle: "garrok-brise-dent", nom: "Garrok Brise-Dent, porte-voix d'Orgrimmar", fp: 3, type: "humanoïde", sousType: "orc",
    alignement: "Loyal neutre", ca: 16, armure: "cotte de mailles", pv: 65, dv: "10d8 + 20", carac: { for: 17, dex: 12, con: 15, int: 9, sag: 11, cha: 12 },
    competences: { athletisme: 1, intimidation: 1 }, sens: { noir: 18 }, langues: "orc, commun", disposition: 0, role: "elite",
    capacites: [
      attaquesMultiples("Garrok fait deux attaques de Hache de guerre."),
      attaque("Hache de guerre", { toucher: 5, degats: "1d12+3", type: "tranchant", arme: "guerre" }),
      attaque("Javeline", { toucher: 5, degats: "1d6+3", type: "perforant", distance: true, portee: [9, 36], carac: "for", arme: "simple" }),
      action("Cri de ralliement", "Garrok et chaque allié à 9 m ou moins qui l'entend gagnent 5 points de vie temporaires.", { activation: "bonus", parJour: 1 })
    ],
    texte: "Un orc massif à la défense gauche cassée net, une cape de fourrure sur une cotte de mailles trop petite pour lui. Il rit fort et se fâche plus fort encore.",
    mj: "L'ancien grunt du Bureau de la Trêve, devenu porte-voix du chef de guerre pour le sommet. Il tient à l'honneur plus qu'à la paix : une insulte publique peut tout faire échouer. Il respecte qui lui parle franchement ; il méprise les flatteurs. Il a gardé un faible pour les personnages s'ils ont rapporté des preuves à Cabestan." }),

  pnj({ cle: "iselle-marchebrume", nom: "Iselle Marchebrume, scribe du sommet", fp: 3, type: "humanoïde", sousType: "humain",
    alignement: "Neutre mauvais", ca: 13, pv: 55, dv: "10d8 + 10", carac: { for: 10, dex: 14, con: 12, int: 14, sag: 12, cha: 16 },
    competences: { tromperie: 2, intuition: 1, discretion: 1, histoire: 1 }, langues: "commun, orc, gobelin, eredun", disposition: 0, role: "chef",
    capacites: [
      trait("Deux visages", "Tant qu'Iselle n'a attaqué personne, les tests de Sagesse (Intuition) faits pour percer son rôle ont le désavantage."),
      trait("Incantation", "Iselle lance ses sorts avec le Charisme (DD 13). À volonté : *illusion mineure*, *message*. 1/jour chacun : *charme-personne*, *invisibilité*, *suggestion*."),
      attaque("Dague empoisonnée", { toucher: 4, degats: "1d4+2", type: "perforant", plus: [["2d6", "poison"]], arme: "simple" }),
      attaque("Trait de gangrefeu", { toucher: 5, degats: "2d10", type: "feu", distance: true, magique: true, portee: [36] }),
      sauvegarde("Mot de discorde", { carac: "sag", dd: 13, portee: 18, recharge: 5,
        echec: "La cible est charmée par Iselle pendant 1 minute : elle tient ses propres alliés pour des traîtres à la Trêve et attaque le plus proche. Elle refait le jet à la fin de chacun de ses tours et met fin à l'effet en cas de réussite" })
    ],
    texte: "Une jeune femme pâle aux doigts tachés d'encre, toujours polie, toujours un peu en retrait. Elle écrit tout ce qui se dit, dans trois langues, sans jamais lever les yeux.",
    mj: "Scribe neutre choisie par le Cartel pour rédiger le traité, et agente de la Lame ardente depuis des années. Elle a caché la troisième Braise dans le double fond du coffre des traités : à la signature, elle doit l'embraser au milieu des deux délégations. Démasquée, elle se bat avec rage puis tente de fuir par la rivière. Capturée, elle ne parle que sous la menace de la Lumière ou d'un démoniste (Intimidation DD 16) : elle donne alors le lieu et la date du rituel." }),

  // --- Chapitre 4 : le cratère de Brasegouffre
  pnj({ cle: "drogha-embrase", nom: "Drogha l'Embrasé, Voix de la Fournaise", fp: 5, type: "humanoïde", sousType: "orc",
    alignement: "Neutre mauvais", ca: 15, armure: "robe de cendre et peau durcie", pv: 97, dv: "13d8 + 39",
    carac: { for: 14, dex: 14, con: 16, int: 13, sag: 12, cha: 18 }, sauvegardes: ["sag", "cha"], competences: { arcanes: 1, intimidation: 1, tromperie: 1 },
    sens: { noir: 18 }, resistances: ["feu"], langues: "orc, commun, eredun", role: "chef",
    capacites: [
      trait("Incantation", "Drogha lance ses sorts avec le Charisme (DD 15). À volonté : *prestidigitation*. 2/jour chacun : *injonction*, *ténèbres*. 1/jour chacun : *boule de feu* (flammes vertes), *porte dimensionnelle*."),
      trait("Corps embrasé", "Une créature qui touche Drogha avec une attaque au corps à corps alors qu'elle se trouve à 1,5 m ou moins de lui subit 5 (1d10) dégâts de feu."),
      attaquesMultiples("Drogha fait deux attaques, de Lame ardente ou de Trait de gangrefeu."),
      attaque("Lame ardente", { toucher: 7, degats: "1d8+4", type: "tranchant", plus: [["2d6", "feu"]], carac: "cha", arme: "guerre" }),
      attaque("Trait de gangrefeu", { toucher: 7, degats: "3d8", type: "feu", distance: true, magique: true, portee: [36] }),
      sauvegarde("Immolation", { carac: "dex", dd: 15, zone: { forme: "sphere", taille: 4.5 }, degats: "6d6", type: "feu", recharge: 5,
        texte: "Drogha désigne un point à 27 m ou moins : une colonne de flammes vertes en jaillit." }),
      action("Pacte de cendre", "Quand Drogha tombe à 0 point de vie pour la première fois, il revient à 20 points de vie dans une gerbe de flammes vertes ; chaque créature à 3 m de lui subit 7 (2d6) dégâts de feu.", { activation: "special", parJour: 1 })
    ],
    texte: "L'orc gris des Puits de cendre, ou ce qu'il en reste : sa peau s'est craquelée comme de la lave refroidie, et des flammes vertes coulent de ses yeux quand il parle.",
    mj: "Le grand méchant revient, transformé par les Braises qu'il porte depuis Rouge-Veine. Il veut rallumer le Cœur de la Fournaise à la nuit des deux lunes et ouvrir les Tarides à la Légion. Il ne fuit plus : il a tout misé sur cette nuit. Il garde Immolation pour les groupes serrés et frappe d'abord quiconque s'approche de l'autel des Braises. Si le groupe n'a pas joué l'aventure de départ, c'est un inconnu qui se présente comme « la Voix »." }),

  pnj({ cle: "infernal-brasegouffre", nom: "Infernal de Brasegouffre", fp: 6, taille: "G", type: "fiélon", sousType: "démon", alignement: "Chaotique mauvais",
    ca: 17, armure: "roche volcanique", pv: 110, dv: "13d10 + 39", carac: { for: 20, dex: 9, con: 17, int: 6, sag: 10, cha: 7 },
    immunites: ["feu", "poison"], immunitesEtats: ["charmé", "effrayé", "empoisonné"], sens: { noir: 36 }, langues: "comprend l'eredun, ne parle pas",
    role: "elite",
    capacites: [
      trait("Résistance à la magie", "L'infernal a l'avantage aux jets de sauvegarde contre les sorts et autres effets magiques."),
      trait("Aura de gangrefeu", "Au début de chacun des tours de l'infernal, chaque créature à 1,5 m ou moins de lui subit 5 (1d10) dégâts de feu."),
      sauvegarde("Chute de météore", { carac: "dex", dd: 15, zone: { forme: "rayon", taille: 3 }, degats: "4d6", type: "feu", activation: "special", parJour: 1,
        texte: "L'infernal arrive en tombant du ciel comme une pierre en flammes, sur un point qu'il voit.", echec: "La créature tombe à terre" }),
      attaquesMultiples("L'infernal fait deux attaques de Poing de pierre."),
      attaque("Poing de pierre", { toucher: 8, degats: "2d8+5", type: "contondant", plus: [["2d6", "feu"]] })
    ],
    texte: "Un géant de roche noire veinée de feu vert, qui s'extrait du cratère de sa propre chute. Il n'a pas de visage, seulement deux braises à la place des yeux.",
    mj: "Premier soldat de la Légion appelé par le rituel (palier 3, voir le chapitre 4). Il ne pense pas : il frappe la créature la plus proche du portail. Si moins de deux Braises reposent sur l'autel, il arrive affaibli (55 PV). Il retourne en poussière quand le Cœur de la Fournaise est détruit." }),

  // --- Créatures de la Lame ardente (toute la campagne)
  pnj({ cle: "cultiste-lame-ardente", nom: "Cultiste de la Lame ardente", fp: 0.5, type: "humanoïde", sousType: "orc ou humain", alignement: "Neutre mauvais",
    ca: 13, armure: "cuir clouté", pv: 22, dv: "4d8 + 4", carac: { for: 13, dex: 14, con: 12, int: 10, sag: 10, cha: 11 },
    competences: { discretion: 1, tromperie: 1 }, langues: "commun ou orc", role: "troupe",
    capacites: [
      trait("Fanatisme", "Le cultiste a l'avantage aux jets de sauvegarde contre l'état effrayé tant qu'il voit un chef de la Lame ardente."),
      attaque("Lame courbe", { toucher: 4, degats: "1d6+2", type: "tranchant", plus: [["1d4", "feu"]], arme: "guerre" }),
      attaque("Fléchette", { toucher: 4, degats: "1d4+2", type: "perforant", distance: true, portee: [6, 18], arme: "simple" })
    ],
    texte: "Un orc, un humain ou un elfe de sang en robe noire brûlée aux ourlets, une lame enflammée tatouée sur l'avant-bras.",
    mj: "Remplace le profil de Bandit défias utilisé dans l'aventure de départ. Les cultistes sont des déçus de toutes les factions, à qui la Lame ardente a promis le pouvoir. Ils se rendent si leur chef tombe (sauf à Brasegouffre)." }),

  pnj({ cle: "fanatique-lame-ardente", nom: "Fanatique de la Lame ardente", fp: 2, type: "humanoïde", sousType: "orc ou humain", alignement: "Neutre mauvais",
    ca: 13, armure: "cuir", pv: 44, dv: "8d8 + 8", carac: { for: 11, dex: 14, con: 12, int: 10, sag: 13, cha: 14 },
    competences: { religion: 1, tromperie: 1, intimidation: 1 }, langues: "commun, orc, eredun", role: "elite",
    capacites: [
      trait("Incantation", "Le fanatique lance ses sorts avec le Charisme (DD 12). À volonté : *thaumaturgie*. 1/jour chacun : *bouclier de la foi*, *immobilisation de personne*, *injonction*."),
      attaquesMultiples("Le fanatique fait deux attaques de Dague rituelle."),
      attaque("Dague rituelle", { toucher: 4, degats: "1d4+2", type: "perforant", plus: [["1d8", "feu"]], arme: "simple" }),
      attaque("Flamme corrompue", { toucher: 4, degats: "2d8", type: "feu", distance: true, magique: true, portee: [18] })
    ],
    texte: "Un prêcheur au crâne rasé, les bras couverts de cicatrices de brûlures volontaires, qui psalmodie en eredun.",
    mj: "Officier de la Lame ardente. Il commande quatre à six cultistes et peut invoquer un diablotin par jour (il apparaît à côté de lui au début du combat). Il se bat jusqu'à la mort." }),

  pnj({ cle: "diablotin", nom: "Diablotin de la Légion", fp: 1, taille: "TP", type: "fiélon", sousType: "démon", alignement: "Chaotique mauvais",
    ca: 13, pv: 21, dv: "6d4 + 6", carac: { for: 6, dex: 17, con: 13, int: 11, sag: 12, cha: 14 }, competences: { discretion: 1, tromperie: 1 },
    vitesse: { marche: 6, vol: 12 }, sens: { noir: 36 }, resistances: ["froid"], immunites: ["feu", "poison"], immunitesEtats: ["empoisonné"],
    langues: "eredun, commun",
    capacites: [
      trait("Résistance à la magie", "Le diablotin a l'avantage aux jets de sauvegarde contre les sorts et autres effets magiques."),
      attaque("Griffes", { toucher: 5, degats: "1d4+3", type: "perforant" }),
      attaque("Trait de feu", { toucher: 5, degats: "2d6", type: "feu", distance: true, magique: true, carac: "dex", portee: [18] }),
      action("Invisibilité", "Le diablotin devient invisible jusqu'à ce qu'il attaque, ou jusqu'à la fin de sa concentration (comme pour un sort).")
    ],
    texte: "Un petit démon cornu à la peau rouge et aux ailes de chauve-souris, qui ricane en jonglant avec une flamme verte.",
    mj: "Espion et messager des cultistes. Invisible, il écoute aux portes et rapporte tout à son maître. Il fuit dès qu'il est blessé, sauf s'il défend son invocateur." })
];

// ---------------------------------------------------------------- Journal du MJ (caché)

const JOURNAL_MJ = journal({ cle: "campagne-braises-legion", nom: `Campagne — ${TITRE_CAMPAGNE}`, visible: false, pages: [
  { titre: "Synopsis (MJ)", texte: `
**${TITRE_CAMPAGNE}** est une campagne d'enquête et d'action en quatre chapitres, pour 3 à 5 personnages qui ont joué **${TITRE_AVENTURE}** (ou qui commencent au **niveau 3**). Ils atteignent le **niveau 6** au chapitre 4. Comptez six à neuf séances. Chaque chapitre se joue dans un lieu différent des Tarides et de leur côte. Le groupe peut toujours être de l'Alliance, de la Horde ou mélangé.

**Ce qui s'est passé.** Il y a dix mille ans, quand la Légion ardente fut chassée d'Azeroth, l'une de ses forges volantes, la **Fournaise**, se brisa au-dessus de Kalimdor. Son cœur s'enfonça dans les collines des Tarides et y creusa le cratère de **Brasegouffre**. Quatre éclats, les **Braises**, furent projetés au loin. Ce sont les clés du Cœur : tant qu'elles en restent séparées, il dort.

L'Éclat gangrené de Rouge-Veine était la première Braise. **Drogha Cendrelame** l'a étudiée et a compris ce qu'elle était. Depuis, la **Lame ardente** cherche les trois autres. À la **nuit des deux lunes**, quand la Dame blanche et l'Enfant bleu se lèvent ensemble, Drogha veut poser les Braises sur l'autel du cratère et rallumer la Fournaise. Elle ouvrira alors un passage par où la Légion fera pleuvoir ses infernaux sur les Tarides.

**Les quatre Braises**
- **Rouge-Veine** : celle de l'aventure de départ (voir « Fil rouge »).
- **Fort-Rivet** : achetée sans le savoir par un fondeur gobelin, qui la brûle dans ses machines.
- **Eldrassal** : enfouie dans la crypte d'une cité des Bien-Nés noyée sous la côte, que fouillent des nagas.
- **Gué-de-Sel** : Drogha la garde pour la fin. Une Braise s'éveille quand elle boit le sang de deux peuples ennemis, et le sommet de paix de Gué-de-Sel lui offre les deux à la fois.

**Déroulement et cartes** (compendium *La Kour Warcraft — Scènes*)
- Chapitre 1 — La fonderie de Fort-Rivet : carte *${carte("fonderie-fort-rivet")}*
- Chapitre 2 — Les ruines d'Eldrassal : carte *${carte("ruines-eldrassal")}*
- Chapitre 3 — Le sommet de Gué-de-Sel : carte *${carte("gue-de-sel-sommet")}*
- Chapitre 4 — La nuit des deux lunes : carte *${carte("cratere-brasegouffre")}*

Les chapitres 1 et 2 se jouent dans l'ordre que choisissent les joueurs. Le chapitre 3 a une date fixe, le chapitre 4 aussi. **Ce que le groupe réussit compte pour la fin** : chaque Braise que Drogha n'a pas sur son autel affaiblit le rituel (voir « Fil rouge et horloge »).

Les PNJ nommés et les créatures sont dans le compendium *La Kour Warcraft — Bestiaire*. Pour les trajets, les auberges et les embuscades, utilisez les cartes de lieux du compendium (« Lieu — … »). Le premier retour à Cabestan peut se jouer sur la carte *${carte("cabestan-quai")}*.` },

  { titre: "Fil rouge et horloge", texte: `
**L'horloge.** La nuit des deux lunes tombe **vingt-quatre jours** après le début du chapitre 1. Le sommet de Gué-de-Sel (chapitre 3) se tient le **quinzième jour**. Compter :
- Cabestan → Fort-Rivet : 2 jours de piste (1 avec un kodo rapide du Cartel).
- Cabestan → Eldrassal : 1 jour de cabotage sur un bateau du Cartel, 3 jours à pied par la côte.
- Fort-Rivet ou Eldrassal → Gué-de-Sel : 3 jours.
- Gué-de-Sel → Brasegouffre : 2 jours (1 en volant sur les wyvernes de Garrok ou les hippogriffes de Corwen, s'ils sont reconnaissants).
- Chaque chapitre prend 1 à 3 jours sur place.

Si le groupe arrive en retard au sommet, Iselle a déjà fait sauter le pavillon : la guerre éclate et le chapitre 3 devient une fuite à travers un champ de bataille. S'il arrive en retard à Brasegouffre, le rituel est déjà au palier 2.

**Les Braises** (cochez au fil de la campagne). Une Braise est **hors jeu** si elle est détruite (plongée une heure dans un bassin lunaire réveillé, ou brisée par un rituel de la Lumière ou de la nature : **Religion ou Nature DD 16**, huit heures) ou gardée en sûreté loin du groupe. Une Braise que les personnages **portent sur eux** peut encore être volée (au chapitre 3, Iselle et son diablotin essaient).
- **Rouge-Veine** : hors jeu si l'Éclat a été détruit dans l'aventure. Si Drogha l'a emporté, ou si la mine s'est effondrée (le culte l'a déterrée), il l'a. Si le groupe n'a pas joué l'aventure, Drogha l'a.
- **Fort-Rivet** : hors jeu si le groupe arrache la Braise au moteur et la garde (chapitre 1).
- **Eldrassal** : hors jeu si le groupe la prend avant Ezzavel (chapitre 2).
- **Gué-de-Sel** : hors jeu si la bombe d'Iselle est désamorcée et la Braise reprise (chapitre 3). Si la bombe explose, la Braise est éveillée et retourne à Drogha.

**Le rituel final** dépend du nombre de Braises sur l'autel : voir le chapitre 4.

**Les commanditaires.** Grizzla Tordeboulon paie l'enquête (le Cartel perd de l'argent quand les Tarides brûlent). Le Bureau de la Trêve fournit les sauf-conduits. Au chapitre 3, Corwen Haldis et Garrok Brise-Dent deviennent des alliés si le sommet est sauvé : ils prêtent chacun des soldats ou des montures pour le chapitre 4.

**Ezzavel le Rieur** (fiche de l'aventure de départ) est l'ennemi récurrent : il intrigue au chapitre 2, il espionne au chapitre 3 sous forme de rumeur (« un rire de chèvre la nuit, près du moulin »), et il assiste au rituel du chapitre 4 en spectateur amusé. Il fuit toujours à 15 PV.` },

  { titre: "Chapitre 1 — La fonderie de Fort-Rivet", texte: `
**Carte :** *${carte("fonderie-fort-rivet")}*. Une fonderie gobeline isolée au nord des Tarides, au pied d'une falaise de minerai rouge. Niveau 3.

**À lire (Cabestan) :** *Grizzla Tordeboulon étale sur son comptoir une lettre roussie aux bords. « Trouvée sur l'orc, ou dans son trou. » L'écriture est fine, l'encre a l'odeur du soufre. « Quatre braises, quatre clés. Il y a un mot que je connais, là : Fort-Rivet. C'est la fonderie de ce rat de Vizzik. » Elle referme son livre de comptes d'un coup sec. « Je ne veux pas savoir ce qu'il fabrique. Je veux que ça s'arrête. Même tarif que la dernière fois. »*

Grizzla remet l'aide de jeu **Lettre de la Lame ardente**. La lettre parle des quatre Braises, de Fort-Rivet, d'une « cité sous la lune noyée » et de « la nuit où les deux lunes se lèvent ».

**À lire (arrivée) :** *La fonderie tousse une fumée verdâtre que le vent rabat sur la piste. Dans la cour, des ouvriers gobelins poussent des wagonnets de minerai en toussant aussi. Au-dessus de la grande halle, une enseigne clignote : « FORGES TIRELIRE — on vous fait du métal pas cher ». Derrière les vitres sales, une lueur verte palpite, au rythme d'un cœur.*

**Entrer.** Vizzik reçoit tout client qui a de l'or. Options : se présenter comme acheteurs (**Tromperie DD 13**, ou **Persuasion DD 12** avec une lettre du Cartel) ; entrer de nuit par la fenêtre du bureau ou par le quai du zeppelin (**Discrétion DD 13**, deux gardes gobelins, profil de *Bandit défias*) ; ou frapper à la porte avec des armes, ce qui lance le combat.

**Indices**
- **Les ouvriers malades** : fièvre, colères, insomnies, comme les hurans de Ronceroc. **Médecine DD 13** : la fièvre de gangrène, qui vient de la halle.
- **Le moteur à éclat** (halle des machines) : un cristal vert gros comme un poing, serti dans une cage de cuivre. **Arcanes DD 13** : de la magie de démon ; **Arcanes DD 16** : ce n'est pas un éclat ordinaire, il appelle quelque chose, loin au sud-est.
- **L'étagère de registres** (bureau de Vizzik) : **Investigation DD 13**. Trois livraisons de « pierres vertes » payées en pièces anciennes, et une commande de six déchiqueteurs « à livrer au cratère, avant la double lune ». Une facture de quatre scaphandres « livrés à la crique d'Eldrassal ».
- **Les caisses scellées** (entrepôt, porte verrouillée : **outils de voleur DD 14**) : des éclats ordinaires, plus petits, que Vizzik met dans ses déchiqueteurs. Chacun est une gêne, pas une Braise.
- **Le coffre-fort** (**outils de voleur DD 15**) : 220 po, et un reçu signé d'une lame enflammée.

**Vizzik Tirelire.** Il n'est pas cultiste, seulement avide. Le retourner : **Persuasion DD 15** (avantage avec une offre écrite de Grizzla, ou si un ouvrier malade est soigné devant lui). Retourné, il coupe lui-même le moteur et dit tout : un « courrier tatoué » vient chercher les déchiqueteurs par zeppelin cette nuit.

**Rencontre : le courrier.** À minuit, le zeppelin de livraison revient avec **deux cultistes de la Lame ardente** et un **fanatique de la Lame ardente**. Ils viennent chercher les deux déchiqueteurs prêts de l'atelier, et la Braise. Si Vizzik n'est pas retourné, il se bat avec eux (avec **un déchiqueteur de la fonderie**) ; s'il l'est, il donne son sifflet au groupe, et le déchiqueteur obéit pendant 1 minute à celui qui siffle.

**Danger : le moteur.** Un combat dans la halle peut le toucher (CA 12, 15 PV). À 0 PV, ou si quelqu'un pousse la chaudière (**Arcanes DD 14** pour éviter la surchauffe), il explose au bout d'un round : sphère de 6 m, **sauvegarde de Dextérité DD 14**, 4d6 dégâts de feu (moitié en cas de réussite). La Braise survit à l'explosion, mais le culte la ramasse si le groupe ne le fait pas.

**Prendre la Braise.** Couper le moteur (**Arcanes DD 14** ou **outils de bricoleur DD 13**, une minute), puis l'ouvrir sans peine. L'arracher en marche : action, **Athlétisme DD 15**, 3d6 dégâts de feu à qui la saisit. Un personnage qui porte une Braise plus d'une journée fait chaque matin un **jet de sauvegarde de Sagesse DD 12** ; en cas d'échec, il fait des cauchemars de feu et ne récupère pas de dé de vie au repos long.

**Fin du chapitre :** les personnages passent au **niveau 4**. Les registres mènent à Eldrassal (chapitre 2) et au cratère (chapitre 4).` },

  { titre: "Chapitre 2 — Les ruines d'Eldrassal", texte: `
**Carte :** *${carte("ruines-eldrassal")}*. Une crique de la côte des Tarides, où une cité des Bien-Nés s'est à moitié enfoncée dans la mer il y a dix mille ans. Nuit, marée basse au début. Niveau 4.

**À lire :** *La barque racle le sable. Devant vous, des colonnes de pierre blanche sortent de l'eau comme les doigts d'une main noyée. Une cité entière est là, à moitié dans la mer : des arches, des statues sans visage, un dôme fendu. Sur le parvis, des torches bleues brûlent sans fumée. Au loin, quelque chose chante, d'une voix si belle que vous mettez un moment à comprendre qu'elle n'a rien d'humain.*

**La marée.** Le groupe arrive à marée basse. Au bout de **deux heures**, la mer monte : le lagon, le camp des nagas et la bibliothèque engloutie deviennent des zones où il faut nager (terrain difficile, désavantage aux attaques avec une arme sans la propriété Lancer). Au bout de **quatre heures**, la crypte des Bien-Nés est noyée.

**Les forces en présence.** **Sss'thera** et **deux nagas des profondeurs** fouillent la crypte avec une dizaine de murlocs qui creusent le puits de fouille. **Ezzavel le Rieur** les « aide », et garde sur lui une lettre de Drogha qui lui promet la Braise. Dans le camp des nagas, **Aelyra Ombrefeuille** est enfermée dans la cage de corail.

**Indices**
- **Les scaphandres** de Fort-Rivet, abandonnés près de la barque échouée : **Perception DD 12**. Des traces de sabots fendus partent vers le parvis.
- **La galerie des statues** : **Histoire DD 14**, les Bien-Nés de cette cité adoraient la magie, et non les dieux. Une inscription sous la statue d'un mage : « Nous avons gardé ce qui est tombé du ciel. Que nul ne le rende au feu. »
- **Le pupitre de cristal** (bibliothèque engloutie, porte verrouillée : **Athlétisme DD 15** pour la forcer, ou la clé de corail de Sss'thera) : touché, il projette une image (**Arcanes DD 14** pour la comprendre). Une forge noire se brise dans le ciel ; quatre étincelles tombent ; un cratère ; deux lunes. C'est l'histoire de la Fournaise.
- **Aelyra**, libérée (**Athlétisme DD 13** ou la clé du gardien naga) : elle connaît les ruines, le passage secret derrière le bassin lunaire et la façon de réveiller le bassin.

**Le bassin lunaire.** Il « dort » : son eau est grise. Le réveiller demande une heure de chant ou de prière (**Religion ou Nature DD 15**, avantage avec Aelyra) et une offrande d'argent ou de lumière de lune. Réveillé, il soigne de 2d4 + 2 PV quiconque y boit (une fois par jour) et **détruit une Braise plongée une heure dans son eau**. Le groupe peut aussi en remplir des fioles : chaque fiole d'eau du bassin compte au chapitre 4.

**Rencontre : la crypte.** Sss'thera, un naga et Ezzavel près de l'autel de la Braise, avec quatre murlocs qui fuient au premier sang. Le passage secret du bassin (**Perception DD 16**, ou Aelyra) mène derrière les sarcophages. Pendant le combat, Ezzavel attend le bon moment : dès que Sss'thera est blessée, il saisit la Braise et file vers la plage en riant. Si le groupe montre à Sss'thera la lettre de Drogha (prise sur Ezzavel ou comprise par **Intuition DD 15** quand il parle), la naga se retourne d'abord contre le satyre.

**Négocier avec Sss'thera.** **Persuasion DD 16** : elle laisse la Braise au groupe contre la promesse que la Horde et l'Alliance laisseront les ruines aux nagas. Une promesse que personne n'a le droit de faire, et qui reviendra plus tard.

**Fin du chapitre :** les personnages passent au **niveau 5**. Aelyra peut les suivre jusqu'au bout.` },

  { titre: "Chapitre 3 — Le sommet de Gué-de-Sel", texte: `
**Carte :** *${carte("gue-de-sel-sommet")}*. Un gué de pierre sur une rivière salée, à la frontière des terres de la Horde et des avant-postes de l'Alliance. Le quinzième jour, de l'après-midi à la nuit. Niveau 5.

**À lire :** *Deux camps se font face de part et d'autre de la rivière. Au nord, la bannière au lion claque sur des tentes bleues bien alignées ; au sud, des peaux tendues sur des perches, un totem et des braseros. Au milieu, sur la rive nord, un grand pavillon de toile dorée porte la roue dentée du Cartel. Des gardes gobelins vous font signe de laisser vos armes à l'entrée. Sur le gué, une borne de pierre neuve attend qu'on y grave une date.*

Les personnages entrent grâce à l'aide de jeu **Sauf-conduit du sommet de Gué-de-Sel**, comme témoins de la Trêve de Cabestan. **Grizzla** préside au nom du Cartel. **Corwen Haldis** parle pour Theramore, **Garrok Brise-Dent** pour Orgrimmar. **Iselle Marchebrume** écrit le traité.

**La tension.** Tenez un compteur de **tension** de 0 à 6. Il monte de 1 à chaque incident ; à 6, le sommet se rompt et les deux camps prennent les armes. Il baisse de 1 quand un personnage apaise une dispute (**Persuasion ou Intimidation DD 14** ; avantage si le personnage est de la même faction que celui qu'il calme).

**Les incidents** (un toutes les heures, dans cet ordre)
1. Un grunt et un soldat de l'Alliance se battent à l'enclos des montures : chacun accuse l'autre d'avoir empoisonné son loup ou son cheval. Les bêtes ont bu au tonneau près de la rive sud (**Médecine DD 13** : la fièvre de gangrène).
2. Une rumeur : Corwen aurait dit que la Horde « n'a pas d'honneur ». C'est le diablotin d'Iselle, invisible, qui l'a soufflée à l'oreille d'un garde (**Perception DD 15** pour entendre ses ailes, *détection de la magie* le révèle).
3. Une flèche à l'empennage de l'Alliance est retrouvée plantée dans le totem de guerre. Elle a été tirée depuis le vieux moulin (**Survie DD 13** sur l'angle de tir).
4. Iselle propose de signer à la nuit tombée, « quand les deux lunes seront témoins ». C'est l'heure de la bombe.

**Indices**
- **Iselle** : son encre sent le soufre (**Nature ou Médecine DD 13**). **Intuition DD 16** (désavantage tant qu'elle n'a attaqué personne) : elle ment quand elle dit être née à Theramore.
- **Le coffre des traités** (tente des scribes) : trop lourd, tiède au toucher. **Perception DD 14** pour remarquer le double fond, **Arcanes DD 14** pour sentir la gangrène.
- **Le vieux moulin** : des traces fraîches vers la trappe (**Survie DD 13**). Dans les sacs de grain, des tabards de l'Alliance et de la Horde (**Investigation DD 12**). Sous la trappe, une cave où attendent **quatre cultistes de la Lame ardente** et **un fanatique de la Lame ardente**.

**Le plan d'Iselle.** À la signature, dans le pavillon du sommet, elle ouvre le coffre des traités : la Braise s'embrase au milieu des deux délégations. Au même moment, les cultistes du moulin, déguisés, attaquent la tente de l'Alliance en tabards de la Horde, et la tente de la Horde en tabards de l'Alliance.

**La bombe.** Explosion : rayon de 6 m autour de la table des négociations, **sauvegarde de Dextérité DD 15**, 6d6 dégâts de feu (moitié en cas de réussite). Corwen et Garrok y survivent tout juste ; leurs gardes, non. La désamorcer : retirer la Braise du coffre (**outils de voleur ou Arcanes DD 15**, une action ; un échec de 5 ou plus la déclenche), ou emporter le coffre à plus de 18 m de tout le monde avant la fin du round.

**Rencontre : la nuit du gué.** Démasquée, Iselle se bat avec **deux diablotins de la Légion** et appelle un **chien corrompu** par le feu de la Braise (un seul, au round 2). Les cultistes du moulin passent à l'attaque. Si la tension est à 4 ou plus, chaque camp croit d'abord que l'autre l'attaque : il faut un round entier et une action (**Persuasion DD 15**) pour le détromper. À 3 ou moins, Corwen et Garrok se battent côte à côte contre le culte.

**Fin du chapitre :** les personnages passent au **niveau 6**. Sur Iselle (ou dans la cave du moulin) : ses ordres, « à Brasegouffre, quand les deux lunes se lèvent ».` },

  { titre: "Chapitre 4 — La nuit des deux lunes", texte: `
**Carte :** *${carte("cratere-brasegouffre")}*. Un cratère noir au cœur des collines rouges, deux jours au sud-est de Gué-de-Sel. Le vingt-quatrième jour, la nuit. Niveau 6.

**À lire :** *Le sol devient du verre noir qui craque sous les bottes. Au fond du cratère, un cercle d'obélisques brûle d'un feu vert, et, au-dessus, l'air tremble comme au-dessus d'une forge. Les deux lunes se lèvent : la blanche à l'ouest, la bleue à l'est. Entre elles, une voix d'orc que vous connaissez chante en eredun, et chaque mot fait trembler la terre.*

**L'approche.** Le camp de la Lame ardente (quatre cultistes, un fanatique) garde la pente nord. La fosse aux captifs retient une douzaine de prisonniers à sacrifier : caravaniers, hurans de Ronceroc, kobolds de Rouge-Veine (la grille se crochète avec les **outils de voleur DD 14**). Des alliés gagnés au chapitre 3 (soldats de Corwen, grunts de Garrok, Aelyra) peuvent occuper le camp pendant que le groupe descend dans le cercle.

**Le passage secret.** Une fissure des ruines de la forge mène au puits de la Fournaise (**Perception DD 15**, ou Aelyra). Au fond bat le **Cœur de la Fournaise**, gros comme un tonneau, retenu par des chaînes de fer gangrené.

**Le rituel** (un palier tous les 3 rounds, compté dès que le groupe entre dans le cercle du rituel) :
1. Les obélisques s'allument : le cercle devient un terrain difficile pour qui n'est pas de la Lame ardente.
2. Les Braises s'embrasent : chaque créature qui commence son tour dans le cercle fait un **jet de sauvegarde de Constitution DD 14** et subit 2d6 dégâts de feu en cas d'échec.
3. Le portail de la Fournaise s'ouvre une première fois : l'**Infernal de Brasegouffre** tombe du ciel (Chute de météore) au milieu du cercle.
4. **La Fournaise s'ouvre.** Si ce palier est atteint, d'autres infernaux tombent dans toutes les Tarides (voir les dénouements). Le groupe a encore 3 rounds pour détruire le Cœur avant que ce soit irréversible.

**Les Braises sur l'autel** changent le rituel :
- **0 ou 1 Braise** : le palier 4 n'arrive jamais, et l'infernal arrive affaibli (55 PV).
- **2 Braises** : le palier 4 arrive 2 rounds plus tard.
- **3 ou 4 Braises** : rituel normal ; avec 4, Drogha a l'avantage à ses jets de sauvegarde tant qu'il est dans le cercle.

**Forces en présence :** **Drogha l'Embrasé** devant l'autel des Braises, **deux fanatiques de la Lame ardente** près des obélisques, l'Infernal au palier 3. **Ezzavel le Rieur** regarde depuis les ruines de la forge et n'intervient que pour sauver sa peau, ou pour ramasser une Braise qui traîne.

**Arrêter le rituel :**
- tuer Drogha (il revient une fois grâce au Pacte de cendre) : le rituel s'arrête au palier atteint, et l'infernal reste ;
- ôter les Braises de l'autel (action par Braise, 2d6 dégâts de feu à qui la touche) : chaque Braise ôtée recule le rituel d'un palier ;
- **détruire le Cœur de la Fournaise** (CA 17, 60 PV, immunisé contre le feu, le poison et les dégâts psychiques ; les dégâts radiants sont doublés) : chaque fiole d'eau du bassin lunaire versée dessus lui inflige 20 dégâts. Le Cœur détruit, tout s'arrête : l'infernal retombe en poussière, les obélisques s'éteignent, et Drogha perd sa résistance au feu.

**Équilibre :** Drogha, deux fanatiques et l'infernal forment un combat difficile pour quatre personnages de niveau 6. Avec trois personnages, retirez un fanatique et faites arriver l'infernal affaibli ; avec cinq, ajoutez quatre cultistes et un diablotin.` },

  { titre: "Dénouements et récompenses", texte: `
**Par chapitre**
- **Chapitre 1** : 75 po par personnage de la part de Grizzla, plus ce que contient le coffre-fort de Vizzik. Vizzik retourné offre un **déchiqueteur** réparé (il obéit au sifflet, 1 heure par jour) ou 150 po, au choix du groupe.
- **Chapitre 2** : dans les sarcophages, un **anneau de protection** et deux **potions de soins supérieurs**. Aelyra donne au groupe une **cape elfique** si elle est libérée. Le bassin lunaire réveillé reste un refuge sûr.
- **Chapitre 3** : chaque délégation offre une récompense : Corwen une **épée longue +1** gravée au lion, Garrok une **hache d'armes +1** à la défense brisée. Le Cartel verse 100 po par personnage si la bombe est désamorcée.
- **Chapitre 4** : sur Drogha, une **baguette de projectiles magiques**, 300 po en pièces anciennes et le grimoire de la Lame ardente (accroche de suite).

**Dénouements du chapitre 4**
- **La Fournaise éteinte** (Cœur détruit avant le palier 4) : les Tarides sont sauvées. Les Braises restantes ne sont plus que des cailloux. Le groupe reçoit le titre de **Gardien de la Trêve** ; chaque personnage gagne une **faveur** de sa faction et un don de son choix au niveau suivant.
- **Le portail refermé de justesse** (Cœur détruit pendant les 3 rounds du palier 4) : une demi-douzaine d'infernaux sont tombés dans les Tarides. Le pays brûle par endroits, mais la Légion n'est pas passée. Corwen et Garrok proposent au groupe de chasser les infernaux ensemble : une suite toute trouvée.
- **La Fournaise rallumée** : les infernaux pleuvent pendant trois nuits. Le Carrefour, Cabestan et les avant-postes de l'Alliance doivent s'unir pour survivre. Si les personnages s'en sortent, ils deviennent les témoins et les rescapés d'une guerre qui commence.

**Bonus**
- **Vizzik retourné** : le Cartel lui rachète la fonderie ; il doit un service au groupe.
- **Sss'thera épargnée** (et la promesse tenue ou trahie) : les nagas reviendront.
- **Iselle capturée vivante** : le Bureau de la Trêve l'interroge et démantèle le réseau de la Lame ardente à Cabestan.
- **Aelyra vivante à la fin** : les Sentinelles laissent le groupe traverser leurs forêts sans escorte.
- **Les captifs de la fosse sauvés** : les hurans de Ronceroc deviennent des alliés pour toujours.

**Suites possibles :** Ezzavel est toujours en fuite. Le grimoire de Drogha parle d'autres forges brisées, ailleurs sur Kalimdor. Le MJ IA peut prendre le relais avec les cartes de lieux du compendium.` },

  { titre: "PNJ et forces en présence", texte: `
**PNJ nommés** (fiches dans le bestiaire)
- **Grizzla Tordeboulon** — commanditaire, intendante du Cartel (aventure de départ).
- **Vizzik Tirelire** — patron de la fonderie de Fort-Rivet. Avide, retournable.
- **Aelyra Ombrefeuille** — sentinelle elfe de la nuit, prisonnière des nagas. Alliée.
- **Sss'thera** — sirène naga d'Eldrassal. Hostile, négociable.
- **Ezzavel le Rieur** — satyre de la Légion, ennemi récurrent (aventure de départ).
- **Corwen Haldis** — capitaine, envoyé de Theramore au sommet. Neutre, puis allié.
- **Garrok Brise-Dent** — porte-voix d'Orgrimmar au sommet. Neutre, puis allié.
- **Iselle Marchebrume** — scribe du sommet, agente de la Lame ardente. Traîtresse.
- **Drogha l'Embrasé** — la Voix de la Fournaise. Le grand méchant, revenu des Puits de cendre.

**Nouvelles créatures du bestiaire :** Déchiqueteur de la fonderie, Infernal de Brasegouffre, Cultiste de la Lame ardente, Fanatique de la Lame ardente, Diablotin de la Légion.

**Créatures du bestiaire déjà existantes :** Bandit défias (gardes gobelins de Fort-Rivet), Murloc, Naga des profondeurs, Chien corrompu, Satyre, Grunt d'Orgrimmar et Garde de Hurlevent (soldats du sommet), Paysan (captifs).` }
] });

// ---------------------------------------------------------------- Aides de jeu (visibles)

const AIDE_LETTRE = journal({ cle: "lettre-lame-ardente", nom: "Aide de jeu — Lettre de la Lame ardente", visible: true, pages: [
  { titre: "Lettre de la Lame ardente", texte: `
*Un feuillet de vélin roussi aux bords, plié en quatre. L'écriture est fine et penchée, l'encre sent le soufre. Une lame enflammée est dessinée en guise de signature.*

Frère de cendre,

La première braise chante enfin sous Rouge-Veine. Les trois autres attendent qu'on les réveille.

L'une brûle déjà à **Fort-Rivet**, dans le ventre des machines d'un petit marchand qui ne sait pas ce qu'il achète. Laisse-le faire : il la chauffe pour nous.

L'autre dort sous la **cité noyée**, là où la lune ne se lève plus. Les gens de l'eau creusent pour nous sans le savoir. Le rieur s'en occupe.

La troisième, je la garde. Elle ne s'éveillera qu'en buvant le sang des deux bannières, versé au même instant, au même endroit. Les imbéciles nous offriront bientôt cet endroit.

Quand les deux lunes se lèveront ensemble, nous poserons les quatre clés sur l'autel, et la Fournaise se souviendra de son nom.

*— D.*` }
] });

const AIDE_SAUF_CONDUIT = journal({ cle: "sauf-conduit-gue-de-sel", nom: "Aide de jeu — Sauf-conduit du sommet de Gué-de-Sel", visible: true, pages: [
  { titre: "Sauf-conduit", texte: `
**BUREAU DE LA TRÊVE DE CABESTAN**
*sous l'arbitrage du Cartel Gentepression*

Les porteurs du présent sauf-conduit sont admis au **sommet de Gué-de-Sel** en qualité de **témoins de la Trêve**.

- Ils déposent leurs armes à l'entrée du pavillon, comme chacun.
- Ils ne parlent pas pendant les débats, sauf si on les y invite.
- Toute violence entre Horde et Alliance dans l'enceinte du camp rompt le sommet. Le Cartel désigne alors le coupable, et le Cartel ne se trompe jamais.
- Ils assisteront à la signature, à la tombée de la nuit, et pourront en témoigner.

*Pour Theramore : C. Haldis, capitaine.*
*Pour Orgrimmar : Garrok Brise-Dent* *(une empreinte de pouce à la place de la signature)*.
*Pour le Cartel : G. Tordeboulon.* *(Tampon de cire dorée en forme de roue dentée.)*` }
] });

export const CAMPAGNE_DOCUMENTS = [...PNJ_CAMPAGNE, JOURNAL_MJ, AIDE_LETTRE, AIDE_SAUF_CONDUIT, ...CARTES_CAMPAGNE];
