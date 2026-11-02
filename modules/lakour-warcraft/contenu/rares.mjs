// Rares et élites errants des Tarides : trois grandes zones de la campagne (le nord autour du Carrefour, la côte de
// Cabestan et d'Eldrassal, la frontière du sud entre Gué-de-Sel et Brasegouffre), une table par zone, trois créatures
// nommées par table (acteurs dnd5e, rôle « élite ») et un butin garanti pour chacune (objet du compendium, lié dans la
// note du MJ de la créature). Journal caché « Rares et élites des Tarides (MJ) ». Profils dans l'esprit du SRD 5.2
// (CC-BY-4.0) ; textes originaux.
import { action, attaque, attaquesMultiples, pnj, sauvegarde, trait } from "./acteurs.mjs";
import { MODULE, collection, icone, journal, ref, table } from "./aides.mjs";
import { arme, butin, equipement } from "./objets.mjs";
import { jet, liens } from "./guides.mjs";
import { BESTIAIRE } from "./bestiaire.mjs";

export const TITRE_TARIDES = "Les Tarides vivantes";

// ---------------------------------------------------------------- Butin garanti

export const BUTIN_RARES = collection("rares", [
  equipement({
    cle: "collier-de-crocs-de-cendre", nom: "Collier de Crocs-de-Cendre", img: icone("icons/commodities/bones/tooth-canine-tan.webp"),
    categorie: "wondrous", rarete: "uncommon", magique: true, prix: [300, "gp"], poids: 0.2,
    texte: "Un lacet de cuir où pendent les crocs noircis du loup gangrené, encore tièdes. Tant que vous le portez, vous avez l'avantage aux tests de Sagesse (Survie) pour suivre une piste, et vous sentez la gangrène à 9 m ou moins (sans en connaître la source exacte).",
    effets: [{ nom: "Collier de Crocs-de-Cendre", changements: [["system.skills.sur.roll.mode", 1]], texte: "Avantage aux tests de Sagesse (Survie)." }]
  }),
  equipement({
    cle: "mante-de-plumes-de-fiel", nom: "Mante de plumes de fiel", img: icone("icons/commodities/materials/feather-colored-green.webp"),
    categorie: "wondrous", rarete: "uncommon", magique: true, prix: [400, "gp"], poids: 1,
    texte: "Une cape cousue des longues plumes vert-de-gris de la vieille harpie, qui bruissent au moindre souffle. Une fois par jour, quand vous tombez, vous pouvez par une **réaction** ouvrir la mante : vous descendez de 18 m par round pendant 1 minute et ne subissez aucun dégât de chute. Elle se regonfle à l'aube.",
    utilisations: { max: 1, periode: "dawn" },
    activites: [{ type: "utility", nom: "Planer", activation: "reaction", condition: "Vous tombez", duree: [1, "minute"] }]
  }),
  butin({
    cle: "servomoteur-de-rouille-coeur", nom: "Servomoteur de Rouille-Cœur", img: icone("icons/commodities/tech/cog-gear-crank-steel.webp"), categorie: "material",
    prix: [300, "gp"], poids: 6,
    texte: "Le moteur d'épaule du déchiqueteur fou, un bloc de pignons et de ressorts qui tressaute encore. Vizzik Tirelire en paie 400 po (c'était son prototype) ; un ingénieur gnome en tire de quoi fabriquer un bras mécanique à moitié prix."
  }),
  equipement({
    cle: "couronne-du-roi-glouglou", nom: "Couronne de coquillages du roi Glouglou", img: icone("icons/commodities/biological/shell-ribbed-gold.webp"),
    categorie: "wondrous", rarete: "uncommon", magique: true, prix: [350, "gp"], poids: 1,
    texte: "Un cercle de coquillages dorés et de dents de requin, enfilés sur un fil de cuivre verdi. Tant que vous la portez, vous avez une vitesse de nage de 9 m, et les murlocs vous prennent pour un roi : ils ne vous attaquent pas les premiers, et se disputent pour vous apporter du poisson pourri.",
    effets: [{ nom: "Couronne du roi Glouglou", changements: [["system.attributes.movement.speeds.swim", "9", "upgrade"]], texte: "Vitesse de nage 9 m." }]
  }),
  equipement({
    cle: "bouclier-en-ecailles-de-gueule-de-fer", nom: "Bouclier en écailles de Gueule-de-Fer", img: icone("icons/equipment/shield/heater-emossed-spiral-green.webp"),
    categorie: "shield", base: "shield", ca: 2, bonus: 1, rarete: "uncommon", prix: [600, "gp"], poids: 6,
    texte: "Un écu taillé dans une seule écaille dorsale du vieux crocilisque, dure comme le fer et marbrée de vert. C'est un **bouclier +1** (+3 à la CA en tout). Il flotte : un naufragé qui s'y agrippe ne coule pas."
  }),
  arme({
    cle: "sabre-de-sel-rouge", nom: "Sabre d'abordage de Sel-Rouge", img: icone("icons/weapons/swords/scimitar-guard-red.webp"),
    categorie: "martialM", base: "scimitar", degats: { des: "1d6", types: ["slashing"] }, proprietes: ["fin", "lgt"], maitrise: "nick",
    bonus: 1, rarete: "uncommon", prix: [500, "gp"], poids: 3,
    texte: "Un sabre court à la garde de laiton en forme de bourse percée, l'emblème du Cartel Baille-Fonds. C'est une **arme +1** (cimeterre). La lame est gravée de vingt-trois encoches : une par navire pillé."
  }),
  arme({
    cle: "arc-composite-du-khan", nom: "Arc composite du khan Ventrouge", img: icone("icons/weapons/bows/longbow-recurve-leather-red.webp"),
    categorie: "martialR", base: "longbow", degats: { des: "1d8", types: ["piercing"] }, proprietes: ["amm", "hvy", "two"], maitrise: "slow", portee: [45, 180],
    bonus: 1, rarete: "uncommon", prix: [600, "gp"], poids: 2,
    texte: "Un arc de corne et de tendons peint en rouge, si puissant que seul un centaure le bandait sans peine. C'est une **arme +1** (arc long). Les Kolkar reconnaissent l'arc de leur khan : celui qui le porte est défié, ou craint."
  }),
  equipement({
    cle: "talisman-de-verre-noir", nom: "Talisman de verre noir", img: icone("icons/equipment/neck/amulet-carved-stone-purple.webp"),
    categorie: "wondrous", rarete: "uncommon", magique: true, prix: [400, "gp"], poids: 0.2,
    texte: "Un éclat du verre noir qui recouvrait le dos de Sabot-de-Verre, poli par le vent du cratère et monté sur une chaîne. Il est froid même au soleil. Tant que vous le portez, vous avez **+1** aux jets de sauvegarde de Constitution.",
    effets: [{ nom: "Talisman de verre noir", changements: [["system.abilities.con.save.roll.bonus", "1"]], texte: "+1 aux jets de sauvegarde de Constitution." }]
  }),
  arme({
    cle: "dague-de-gangrecorne", nom: "Dague de gangrecorne", img: icone("icons/magic/fire/dagger-rune-enchant-flame-green.webp"),
    categorie: "simpleM", base: "dagger", degats: { des: "1d4", types: ["piercing"] }, proprietes: ["fin", "lgt", "thr"], maitrise: "nick", portee: [6, 18],
    bonus: 1, rarete: "uncommon", prix: [700, "gp"], poids: 1,
    texte: "Une dague taillée dans la corne de Vexxa la Rieuse, nervurée de veines vertes qui luisent dans le noir. C'est une **arme +1** (dague) : chaque coup qui touche inflige **1d4 dégâts de feu** supplémentaires (flammes vertes). La nuit, on croit l'entendre rire ; un paladin ou un druide voudra la détruire.",
    activites: [{ type: "damage", nom: "Flamme verte", activation: "", condition: "La cible est touchée par la dague", portee: [1.5, "m"], cible: ["1", "creature"], degats: [{ des: "1d4", types: ["fire"] }], consomme: false }]
  })
]);

// ---------------------------------------------------------------- Créatures nommées

const lienButin = liens(BUTIN_RARES);
const garanti = (cle, suite = "") => `**Butin garanti :** ${lienButin(`objets:${cle}`)}${suite ? `, ${suite}` : ""}.`;

export const RARES = collection("rares", [
  // --- Nord des Tarides
  pnj({ cle: "rare-crocs-de-cendre", nom: "Crocs-de-Cendre, le loup gangrené", fp: 3, taille: "G", type: "bête", alignement: "Non aligné",
    ca: 14, armure: "fourrure brûlée", pv: 68, dv: "8d10 + 24", carac: { for: 18, dex: 15, con: 16, int: 4, sag: 13, cha: 7 },
    vitesse: { marche: 15 }, sens: { noir: 18 }, competences: { perception: 1, discretion: 1 }, resistances: ["feu"], role: "elite",
    capacites: [
      trait("Sang gangrené", "Quand Crocs-de-Cendre est touché par une attaque au corps à corps, un sang vert et brûlant gicle : l'attaquant, s'il est à 1,5 m ou moins, subit 3 (1d6) dégâts de feu."),
      attaquesMultiples("Crocs-de-Cendre fait deux attaques de Morsure de cendre."),
      attaque("Morsure de cendre", { toucher: 6, degats: "1d10+4", type: "perforant", plus: [["1d6", "feu"]], effet: "Si la cible est de taille M ou inférieure, elle doit réussir un jet de sauvegarde de Force DD 14 ou tomber à terre." }),
      sauvegarde("Hurlement de la meute", { carac: "sag", dd: 11, zone: { forme: "rayon", taille: 9 }, recharge: 5,
        texte: "Crocs-de-Cendre hurle à glacer le sang. La première fois dans un combat, trois loups des bois accourent et arrivent au round suivant.",
        echec: "La cible est effrayée jusqu'à la fin de son prochain tour" })
    ],
    texte: "Un loup énorme au pelage roussi par plaques, aux yeux qui luisent d'un vert malade. Là où il a dormi, l'herbe est brûlée en cercle.",
    mj: `Un loup du nord des Tarides qui a bu à une oasis souillée par la gangrène de Rouge-Veine. Il rôde entre le Carrefour et la mine, et attaque les caravanes de nuit, avec la meute qu'il a pervertie. Il fuit à 15 PV et revient le lendemain, sauf si on le traque jusqu'à sa tanière (${jet("Survie", 14)}, une demi-journée). ${garanti("collier-de-crocs-de-cendre", "et une prime de 60 po au Carrefour (contrat « La bête aux yeux verts »)")}` }),

  pnj({ cle: "rare-plume-fiel", nom: "Vieille Plume-Fiel, matriarche des harpies", fp: 3, type: "créature monstrueuse", alignement: "Chaotique mauvais",
    ca: 13, pv: 65, dv: "10d8 + 20", carac: { for: 12, dex: 16, con: 14, int: 9, sag: 12, cha: 16 },
    vitesse: { marche: 6, vol: 15 }, competences: { perception: 1, representation: 1 }, langues: "commun approximatif", role: "elite",
    capacites: [
      attaquesMultiples("Plume-Fiel fait deux attaques de Serres empoisonnées."),
      attaque("Serres empoisonnées", { toucher: 5, degats: "2d4+3", type: "tranchant", plus: [["1d6", "poison"]], carac: "dex" }),
      sauvegarde("Chant de fiel", { carac: "sag", dd: 13, zone: { forme: "rayon", taille: 18 }, recharge: 5,
        texte: "La vieille harpie chante d'une voix d'abord douce, puis grinçante. Seuls les humanoïdes et les géants y sont sensibles.",
        echec: "La cible est charmée jusqu'à la fin de son prochain tour : elle doit utiliser tout son déplacement pour s'approcher de Plume-Fiel par le chemin le plus court, falaise comprise" }),
      action("Nuée de plumes", "Plume-Fiel s'enveloppe d'un tourbillon de plumes : jusqu'au début de son prochain tour, les attaques contre elle ont le désavantage.", { activation: "bonus", parJour: 2 })
    ],
    texte: "Une harpie décharnée aux plumes vert-de-gris, à la crinière blanche et aux serres jaunies. Sa voix a été belle, il y a longtemps.",
    mj: `Elle tient les pitons rocheux au-dessus de la piste de Fort-Rivet avec une demi-douzaine de harpies (fiche du bestiaire). Elle charme un voyageur, le fait marcher jusqu'au bord, et ses filles le poussent. Elle négocie si on lui apporte des bijoux (${jet("Persuasion", 15)}) et fuit à 20 PV. ${garanti("mante-de-plumes-de-fiel", "et 2d10 × 10 po en bijoux volés dans son nid")}` }),

  pnj({ cle: "rare-rouille-coeur", nom: "Rouille-Cœur, le déchiqueteur fou", fp: 4, taille: "G", type: "artificiel", alignement: "Non aligné",
    ca: 16, armure: "plaques rouillées", pv: 85, dv: "10d10 + 30", carac: { for: 18, dex: 12, con: 16, int: 3, sag: 8, cha: 3 },
    vitesse: { marche: 9 }, immunites: ["poison", "psychique"], immunitesEtats: ["charmé", "effrayé", "empoisonné", "épuisement"],
    langues: "aucune", role: "elite",
    capacites: [
      trait("Moteur emballé", "Au début de chaque tour de Rouille-Cœur, lancez 1d6. Sur 1, le moteur cale : il ne fait rien ce tour-ci. Sur 6, il s'emballe : il joue deux tours complets à la suite, puis subit 5 dégâts de feu de son propre moteur."),
      attaquesMultiples("Rouille-Cœur fait deux attaques de Scie rouillée."),
      attaque("Scie rouillée", { toucher: 6, degats: "2d8+4", type: "tranchant", allonge: 3, effet: "Sur un coup critique, la scie se coince : Rouille-Cœur ne peut plus scier avant la fin de son prochain tour." }),
      sauvegarde("Fuite de vapeur", { carac: "con", dd: 13, zone: { forme: "cone", taille: 4.5 }, degats: "3d6", type: "feu", recharge: 5 })
    ],
    texte: "Un déchiqueteur de chantier couvert de rouille, une scie tordue, l'autre bras arraché, qui titube dans les collines en sifflant de la vapeur. Il n'y a personne dans le poste de pilotage.",
    mj: `Le premier prototype de Vizzik Tirelire (chapitre 1 de la campagne), dont le moteur à éclat s'est emballé un soir : il erre depuis entre Fort-Rivet et le Carrefour et découpe tout ce qui bouge. Une créature qui grimpe dans le poste (${jet("Athlétisme", 15)}) peut couper le moteur (${jet("outils de bricoleur", 15)}). ${garanti("servomoteur-de-rouille-coeur", "et un petit éclat de gangrène dans le moteur, à détruire ou à rapporter")}` }),

  // --- Côte des Tarides
  pnj({ cle: "rare-glouglou-premier", nom: "Glouglou Premier, roi des murlocs", fp: 2, type: "humanoïde", sousType: "murloc", alignement: "Chaotique neutre",
    ca: 14, armure: "coquillages et couronne", pv: 52, dv: "8d8 + 16", carac: { for: 14, dex: 14, con: 14, int: 10, sag: 12, cha: 14 },
    vitesse: { marche: 9, nage: 12 }, competences: { intimidation: 1 }, langues: "murloc", role: "elite",
    capacites: [
      trait("Amphibie", "Glouglou respire aussi bien dans l'air que sous l'eau."),
      trait("Cour du roi", "Glouglou n'est jamais seul : 1d4 + 2 murlocs l'entourent. Tant qu'un murloc allié se trouve à 1,5 m de lui, les attaques contre Glouglou ont le désavantage : ses sujets se jettent devant les coups."),
      attaque("Sceptre de corail", { toucher: 4, degats: "1d8+2", type: "contondant", arme: "simple" }),
      action("Mrglglgl royal", "Glouglou pousse un cri de guerre : chaque murloc allié à 18 m ou moins qui l'entend a l'avantage à sa prochaine attaque avant la fin de son prochain tour.", { activation: "bonus", recharge: 5 })
    ],
    texte: "Un murloc ventru à la peau orangée, coiffé d'une couronne de coquillages dorés, qui brandit un sceptre de corail. Les autres murlocs s'inclinent sur son passage, et gargouillent quand il gargouille.",
    mj: `La rumeur de taverne était vraie : un murloc porte une couronne. Il règne sur trois villages de la côte entre Cabestan et Eldrassal et fait piller les filets des pêcheurs « pour l'impôt ». Tuer ses sujets d'abord le rend vulnérable. Un personnage qui lui offre un poisson rare et lui parle en murloc (ou réussit ${jet("Représentation", 15)}) peut obtenir une trêve. ${garanti("couronne-du-roi-glouglou")}` }),

  pnj({ cle: "rare-gueule-de-fer", nom: "Gueule-de-Fer, le crocilisque ancien", fp: 4, taille: "TG", type: "bête", alignement: "Non aligné",
    ca: 15, armure: "écailles de fer", pv: 95, dv: "10d12 + 30", carac: { for: 20, dex: 10, con: 17, int: 2, sag: 12, cha: 5 },
    vitesse: { marche: 9, nage: 12 }, competences: { discretion: 1 }, role: "elite",
    capacites: [
      trait("Écailles de fer", "Les dégâts contondants, perforants et tranchants que Gueule-de-Fer subit d'armes non magiques sont réduits de 3. Il retient son souffle une heure sous l'eau."),
      attaque("Mâchoire de fer", { toucher: 7, degats: "2d10+5", type: "perforant", effet: "La cible est agrippée (évasion DD 15). Tant qu'elle l'est, elle est entravée et Gueule-de-Fer ne peut pas mordre une autre cible." }),
      sauvegarde("Roulade de la mort", { carac: "for", dd: 15, cible: "la créature que Gueule-de-Fer agrippe", degats: "3d10", type: "tranchant", recharge: 5, moitie: false,
        echec: "Gueule-de-Fer l'entraîne sous l'eau avec lui, où elle doit retenir son souffle", reussite: "la cible se dégage et n'est plus agrippée" })
    ],
    texte: "Un crocilisque long comme une barque de pêche, aux écailles grises et dures comme du fer, couvertes de coquillages. On dit qu'il a mangé trois pêcheurs et un contremaître du Cartel.",
    mj: `Il chasse dans les marais salés au sud de Cabestan, là où le Cartel fait passer ses barques de contrebande. Il attend sous l'eau, saisit une proie, roule et l'emporte. Un appât (un kodo mort, un tonneau de poisson) le fait sortir. Il fuit à 25 PV, et revient. ${garanti("bouclier-en-ecailles-de-gueule-de-fer", "et dans son estomac une bague de contremaître (25 po) que Grizzla reconnaît")}` }),

  pnj({ cle: "rare-capitaine-sel-rouge", nom: "Capitaine Sel-Rouge, pirate du Cartel Baille-Fonds", fp: 3, taille: "P", type: "humanoïde", sousType: "gobelin", alignement: "Neutre mauvais",
    ca: 15, armure: "cuir clouté", pv: 66, dv: "12d6 + 24", carac: { for: 10, dex: 17, con: 14, int: 13, sag: 11, cha: 15 },
    vitesse: { marche: 9 }, competences: { acrobaties: 1, tromperie: 1, athletisme: 1 }, langues: "gobelin, commun, argot des pirates", role: "elite",
    capacites: [
      attaquesMultiples("Sel-Rouge fait deux attaques de Sabre d'abordage, ou une de Sabre et une de Pistolet à rouet."),
      attaque("Sabre d'abordage", { toucher: 5, degats: "1d6+3", type: "tranchant", carac: "dex", arme: "guerre" }),
      attaque("Pistolet à rouet", { toucher: 5, degats: "1d10+3", type: "perforant", distance: true, portee: [9, 27], arme: "guerre" }),
      sauvegarde("Baril de poudre", { carac: "dex", dd: 13, zone: { forme: "rayon", taille: 3 }, degats: "3d6", type: "feu", parJour: 1,
        texte: "Sel-Rouge fait rouler un baril à la mèche allumée jusqu'à un point qu'il voit à 9 m ou moins ; il explose au début de son prochain tour (zone annoncée)." }),
      action("Esquive du pirate", "Sel-Rouge ajoute 2 à sa CA contre une attaque qui devrait le toucher. Il doit voir l'attaquant.", { activation: "réaction" })
    ],
    texte: "Un gobelin sec et nerveux au chapeau à plume rouge, un bandeau sur l'œil gauche, une dent en or et deux pistolets à la ceinture. Il rit de tout, surtout de ce qu'il vient de voler.",
    mj: `Le corsaire du Cartel Baille-Fonds sur la côte des Tarides : il attaque les navires de Gentepression et rançonne les pêcheurs. On le trouve dans une crique avec sa chaloupe et quatre gardes gobelins (profil de bandit défias), ou en ville, déguisé, à négocier des barils d'huile de feu (voir le donjon de Mèche-Noire). Il trahit son propre baron pour 200 po (${jet("Persuasion", 14)}). ${garanti("sabre-de-sel-rouge", "et une carte de la crique où dort sa cargaison (300 po de marchandises)")}` }),

  // --- Frontière du sud
  pnj({ cle: "rare-khan-ventrouge", nom: "Khan Ventrouge, seigneur kolkar", fp: 4, taille: "G", type: "créature monstrueuse", sousType: "centaure", alignement: "Chaotique mauvais",
    ca: 16, armure: "cuirasse de bronze", pv: 85, dv: "10d10 + 30", carac: { for: 18, dex: 16, con: 16, int: 10, sag: 13, cha: 14 },
    vitesse: { marche: 15 }, competences: { athletisme: 1, perception: 1, intimidation: 1 }, langues: "gaïen (centaure), orc", role: "elite",
    capacites: [
      attaquesMultiples("Le khan fait deux attaques, de Lance du khan ou d'Arc composite, dans n'importe quelle combinaison."),
      attaque("Lance du khan", { toucher: 6, degats: "1d10+4", type: "perforant", allonge: 3, arme: "guerre" }),
      attaque("Arc composite", { toucher: 5, degats: "1d8+3", type: "perforant", distance: true, portee: [45, 180], arme: "guerre" }),
      sauvegarde("Charge du khan", { carac: "for", dd: 14, cible: "chaque créature dont le khan traverse l'espace en se déplaçant de toute sa vitesse, sans provoquer d'attaque d'opportunité", degats: "2d8+4", type: "contondant", recharge: 5, echec: "La cible tombe à terre" }),
      action("Appel de la horde", "Le khan souffle dans une corne de bélier : deux centaures kolkar (fiche du bestiaire) arrivent au galop au début du round suivant, à la lisière du champ de bataille.", { activation: "bonus", parJour: 1 })
    ],
    texte: "Un centaure massif à la robe rouge sombre, la crinière tressée de dents humaines et de perles d'or, une cuirasse de bronze sur le torse. Il rit quand on le défie.",
    mj: `Il mène une bande d'une vingtaine de Kolkar dans les collines rouges entre Gué-de-Sel et Brasegouffre. Il méprise la Horde et l'Alliance autant l'une que l'autre et voit dans la Trêve une faiblesse. Il accepte un duel singulier (${jet("Intimidation", 15)} pour qu'il relève le défi) : vaincu en duel, sa bande se disperse. ${garanti("arc-composite-du-khan", "et une prime de 80 po au Carrefour comme à Theramore")}` }),

  pnj({ cle: "rare-sabot-de-verre", nom: "Sabot-de-Verre, le kodo des cendres", fp: 5, taille: "TG", type: "bête", alignement: "Non aligné",
    ca: 16, armure: "peau vitrifiée", pv: 115, dv: "10d12 + 50", carac: { for: 22, dex: 8, con: 20, int: 2, sag: 11, cha: 5 },
    vitesse: { marche: 12 }, resistances: ["feu"], role: "elite",
    capacites: [
      trait("Peau de verre noir", "Le dos de Sabot-de-Verre est couvert d'une croûte de verre noir. Quand une attaque le touche avec un coup critique, des éclats volent : chaque créature à 1,5 m de lui subit 3 (1d6) dégâts tranchants."),
      attaque("Cornes de verre", { toucher: 9, degats: "2d10+6", type: "perforant", allonge: 3 }),
      sauvegarde("Ruée de verre", { carac: "dex", dd: 17, cible: "chaque créature dont Sabot-de-Verre traverse l'espace en se déplaçant de toute sa vitesse", degats: "4d10", type: "contondant", recharge: 5, echec: "La cible tombe à terre" }),
      sauvegarde("Barrissement fêlé", { carac: "con", dd: 16, zone: { forme: "cone", taille: 9 }, degats: "3d8", type: "tonnerre", recharge: 6 })
    ],
    texte: "Un kodo gigantesque dont le dos a fondu en une carapace de verre noir et luisant, comme si on l'avait roulé dans le cratère. Il barrit d'une voix brisée, et la terre tremble.",
    mj: `Un vieux mâle qui a dormi trop près du cratère de Brasegouffre la nuit où le Cœur de la Fournaise a remué. La douleur l'a rendu fou : il charge tout ce qui bouge sur la route de Gué-de-Sel. Les taurens voudraient qu'on l'abatte proprement, sans le faire souffrir (${jet("Dressage", 17)} pour le calmer assez longtemps). ${garanti("talisman-de-verre-noir", "et sa viande, dont un tauren tire de quoi faire trois marmites de ragoût de kodo")}` }),

  pnj({ cle: "rare-vexxa-la-rieuse", nom: "Vexxa la Rieuse, chasseresse de la Lame ardente", fp: 4, type: "fiélon", sousType: "démon", alignement: "Chaotique mauvais",
    ca: 15, armure: "cuir de chasse", pv: 78, dv: "12d8 + 24", carac: { for: 12, dex: 18, con: 14, int: 12, sag: 13, cha: 16 },
    vitesse: { marche: 12 }, sens: { noir: 36 }, competences: { discretion: 2, perception: 1, survie: 1 }, resistances: ["feu", "froid", "foudre"], immunites: ["poison"],
    immunitesEtats: ["empoisonné"], langues: "eredun, commun, darnassien", role: "elite",
    capacites: [
      trait("Résistance à la magie", "Vexxa a l'avantage aux jets de sauvegarde contre les sorts et autres effets magiques."),
      attaquesMultiples("Vexxa fait deux attaques de Dague de gangrecorne, ou deux de Flèche gangrenée."),
      attaque("Dague de gangrecorne", { toucher: 6, degats: "1d4+4", type: "perforant", plus: [["2d6", "feu"]], carac: "dex", arme: "simple" }),
      attaque("Flèche gangrenée", { toucher: 6, degats: "1d8+4", type: "perforant", distance: true, portee: [45, 180], arme: "guerre", plus: [["1d6", "feu"]] }),
      action("Rire moqueur", "Vexxa éclate de rire et devient invisible jusqu'au début de son prochain tour, ou jusqu'à ce qu'elle attaque.", { activation: "bonus", parJour: 2 })
    ],
    texte: "Une satyre aux cornes noires et aux sabots fendus, la peau violacée couverte de tatouages verts, un arc dans le dos. Son rire précède toujours ses flèches.",
    mj: `Une sœur d'Ezzavel, chasseresse au service de la Lame ardente : elle traque ceux qui gênent le culte entre Gué-de-Sel et Brasegouffre. Elle tire de loin, disparaît en riant et frappe les blessés. Après le chapitre 3, elle traque le groupe en personne. Elle fuit à 20 PV en promettant de revenir. ${garanti("dague-de-gangrecorne", "et une liste de noms à abattre, dont ceux des personnages")}` })
]);

// ---------------------------------------------------------------- Tables (une par grande zone)

const tableRares = (cle, nom, description, cles, vide) => {
  const t = table({ cle, nom, formule: "1d4", description, resultats: [
    ...cles.map((c, i) => [i + 1, i + 1, ref(`bestiaire:${c}`)]),
    [4, 4, vide]
  ] });
  t.flags[MODULE].aventure = TITRE_TARIDES;
  return t;
};
const USAGE = "Une fois par jour de voyage dans la zone, sur 1 sur 1d6, tirez sur cette table. Chaque créature nommée porte un butin garanti (voir sa note du MJ) ; une créature vaincue ne revient pas : relancez si elle sort de nouveau.";

export const TABLES_RARES = [
  tableRares("rares-nord-des-tarides", "Rares et élites — Nord des Tarides", `Entre le Carrefour, Fort-Rivet, le kraal de Ronceroc et la mine de Rouge-Veine. ${USAGE}`,
    ["rare-crocs-de-cendre", "rare-plume-fiel", "rare-rouille-coeur"],
    { titre: "Une piste fraîche", texte: "Pas de rare aujourd'hui, mais une trace : des herbes brûlées en cercle, des plumes vert-de-gris ou des traînées de rouille. Le lendemain, la rencontre est assurée (tirez de nouveau 1d3)." }),
  tableRares("rares-cote-des-tarides", "Rares et élites — Côte des Tarides", `Entre Cabestan, les marais salés et la crique d'Eldrassal. ${USAGE}`,
    ["rare-glouglou-premier", "rare-gueule-de-fer", "rare-capitaine-sel-rouge"],
    { titre: "Des nouvelles du port", texte: "Pas de rare aujourd'hui, mais un pêcheur, un docker ou un marin raconte ce qu'il a vu, et où. Le lendemain, la rencontre est assurée (tirez de nouveau 1d3)." }),
  tableRares("rares-frontiere-du-sud", "Rares et élites — Frontière du sud", `Entre Gué-de-Sel, les collines rouges et le cratère de Brasegouffre. ${USAGE}`,
    ["rare-khan-ventrouge", "rare-sabot-de-verre", "rare-vexxa-la-rieuse"],
    { titre: "Le rire dans les collines", texte: "Pas de rare aujourd'hui, mais un rire de chèvre la nuit, des sabots dans le lointain, ou un éclat de verre noir sur la piste. Le lendemain, la rencontre est assurée (tirez de nouveau 1d3)." })
];

// ---------------------------------------------------------------- Journal du MJ

const lien = liens(RARES, BUTIN_RARES, TABLES_RARES, BESTIAIRE);
const ligne = (cle, ou) => {
  const r = RARES.find(d => d.__cle === `bestiaire:${cle}`);
  return `- ${lien(`bestiaire:${cle}`)} (FP ${String(r.system.details.cr).replace(".", ",")}) — ${ou}`;
};

const JOURNAL_RARES = journal({
  cle: "rares-et-elites-des-tarides", nom: "Rares et élites des Tarides (MJ)", visible: false, pages: [
    { titre: "Usage (MJ)", texte: `
Les **rares** sont des créatures nommées qui errent dans une zone : plus fortes qu'une rencontre ordinaire, chacune avec son caractère, ses tactiques et un **butin garanti**. Elles donnent vie aux voyages entre deux chapitres de la campagne.

**Quand tirer.** Une fois par jour de voyage dans une zone, lancez 1d6 : sur 1, tirez sur la table de la zone. Un rare peut aussi être la cible d'un contrat de traque (tableaux des contrats) : dans ce cas, pas de tirage, il est là où le contrat le dit.

**Tables**

- ${lien("tables:rares-nord-des-tarides")}
- ${lien("tables:rares-cote-des-tarides")}
- ${lien("tables:rares-frontiere-du-sud")}

**Équilibre.** Chaque rare est un combat difficile pour quatre personnages de niveau 3 à 4 (pour le nord et la côte) ou 5 à 6 (pour la frontière du sud). Un rare vaincu ne revient pas ; un rare qui a fui revient une fois, plus prudent.

**Récompense.** Le butin garanti est lié dans la note du MJ de chaque fiche. Le trophée d'un rare rapporté à un commanditaire vaut **+2 à +5** de réputation, selon la faction (voir le Guide de la réputation).` },
    { titre: "Nord des Tarides", texte: `
Les plaines sèches entre le Carrefour, Fort-Rivet, le kraal de Ronceroc et la mine de Rouge-Veine. Niveaux 3 à 4. Table : ${lien("tables:rares-nord-des-tarides")}.

${ligne("rare-crocs-de-cendre", "un loup gangrené qui attaque les caravanes la nuit, avec une meute de loups des bois.")}
${ligne("rare-plume-fiel", "une vieille harpie qui charme les voyageurs sur les pitons de la piste de Fort-Rivet.")}
${ligne("rare-rouille-coeur", "le prototype fou de Vizzik, qui erre en sifflant entre la fonderie et le Carrefour.")}` },
    { titre: "Côte des Tarides", texte: `
Le littoral entre Cabestan, les marais salés et la crique d'Eldrassal. Niveaux 3 à 4. Table : ${lien("tables:rares-cote-des-tarides")}.

${ligne("rare-glouglou-premier", "le roi des murlocs de la rumeur, avec sa cour.")}
${ligne("rare-gueule-de-fer", "un crocilisque ancien dans les marais salés des contrebandiers.")}
${ligne("rare-capitaine-sel-rouge", "le corsaire du Cartel Baille-Fonds, dans sa crique ou déguisé en ville.")}` },
    { titre: "Frontière du sud", texte: `
Les collines rouges entre Gué-de-Sel et le cratère de Brasegouffre. Niveaux 5 à 6. Table : ${lien("tables:rares-frontiere-du-sud")}.

${ligne("rare-khan-ventrouge", "le chef d'une bande kolkar, qui accepte un duel.")}
${ligne("rare-sabot-de-verre", "un kodo rendu fou par le cratère, sur la route de Gué-de-Sel.")}
${ligne("rare-vexxa-la-rieuse", "une chasseresse satyre de la Lame ardente, qui traque ceux qui gênent le culte.")}

Créatures d'appoint : ${lien("bestiaire:loup", "loups des bois")}, ${lien("bestiaire:harpie", "harpies")}, ${lien("bestiaire:murloc", "murlocs")}, ${lien("bestiaire:bandit-defias", "gardes gobelins")} (profil de bandit défias), ${lien("bestiaire:centaure-kolkar", "centaures kolkar")}.` }
  ]
});

export const RARES_DOCUMENTS = [...RARES, ...BUTIN_RARES, ...TABLES_RARES, ...collection("rares", [JOURNAL_RARES])];
collection("rares", TABLES_RARES);
