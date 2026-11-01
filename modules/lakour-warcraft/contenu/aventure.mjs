// « Les Puits de cendre » — aventure de départ dans les Tarides, autour du port neutre de Cabestan : 3 à 5
// personnages de niveau 1, qui atteignent le niveau 3 ; deux ou trois séances. Groupe de l'Alliance, de la Horde ou
// mixte (la Trêve de Cabestan interdit les combats entre factions dans le port). Textes originaux.
// Exporte aussi les cartes de l'aventure et les cartes de lieux génériques (l'index n'importe que AVENTURE_DOCUMENTS).
import { action, attaque, attaquesMultiples, pnj, sauvegarde, trait } from "./acteurs.mjs";
import { journal } from "./aides.mjs";
import { CARTES, TITRE_AVENTURE } from "./aventure-cartes.mjs";
import { CARTES_LIEUX } from "./lieux-cartes.mjs";

const NOMS_CARTES = Object.fromEntries(CARTES.map(c => [c.flags["lakour-warcraft"].cle, c.name]));
const carte = cle => {
  if (!NOMS_CARTES[cle]) throw new Error(`Aventure : carte inconnue ${cle}`);
  return NOMS_CARTES[cle];
};

// ---------------------------------------------------------------- PNJ nommés

export const PNJ_AVENTURE = [
  pnj({ cle: "grizzla-tordeboulon", nom: "Grizzla Tordeboulon, intendante du Cartel", fp: 0.125, taille: "P", type: "humanoïde", sousType: "gobelin",
    alignement: "Neutre", ca: 12, pv: 9, dv: "2d6 + 2", carac: { for: 8, dex: 14, con: 12, int: 15, sag: 12, cha: 16 },
    competences: { tromperie: 1, intuition: 2, persuasion: 1 }, langues: "gobelin, commun, orc", disposition: 0, role: "chef",
    capacites: [
      trait("Protégée du Cartel", "Tant qu'elle est à Cabestan, quiconque lève la main sur Grizzla devient l'ennemi du Cartel Gentepression : les gardes du port (utiliser Grunt d'Orgrimmar ou Garde de Hurlevent) arrivent en 1d4 rounds."),
      attaque("Pistolet de poche", { toucher: 4, degats: "1d6+2", type: "perforant", distance: true, portee: [9, 27], arme: "guerre" }),
      action("Affaire conclue", "Grizzla tend un sac de pièces ou une promesse écrite : une créature qui l'attaque doit réussir un test de Sagesse DD 13 ou renoncer à son attaque ce tour-ci, le temps d'écouter l'offre.", { activation: "réaction", parJour: 1 })
    ],
    texte: "Une gobeline aux oreilles percées de dix anneaux d'or, lunettes de mécanicienne sur le front et livre de comptes sous le bras. Elle tient les quais de Cabestan pour le Cartel Gentepression et parle plus vite que son ombre.",
    mj: "Commanditaire de l'aventure. Elle se moque de la Horde et de l'Alliance : elle veut que l'eau soit bonne et que les caravanes circulent, parce qu'une guerre fermerait le port. Elle paie bien, toujours un peu moins que promis (Persuasion DD 13 pour obtenir le plein tarif), et tient parole. Elle sait que la mine de Rouge-Veine appartenait au Cartel et le cache par honte : le Cartel l'a abandonnée sans la sceller." }),

  pnj({ cle: "hanuk-pas-de-pluie", nom: "Hanuk Pas-de-Pluie, guide caravanier", fp: 1, type: "humanoïde", sousType: "tauren",
    alignement: "Neutre bon", ca: 13, pv: 34, dv: "4d8 + 16", carac: { for: 17, dex: 10, con: 18, int: 10, sag: 14, cha: 10 },
    competences: { dressage: 1, nature: 1, survie: 2, perception: 1 }, langues: "taurahe, orc, commun", disposition: 1, role: "elite",
    capacites: [
      attaque("Massue-totem", { toucher: 5, degats: "1d10+3", type: "contondant", arme: "guerre" }),
      sauvegarde("Piétinement de guerre", { carac: "con", dd: 13, zone: { forme: "rayon", taille: 3 }, degats: "1d6+3", type: "contondant", parJour: 1,
        echec: "La créature tombe à terre" }),
      trait("Guide des Tarides", "Avec Hanuk, le groupe ne se perd jamais dans les Tarides et a l'avantage aux tests de Survie pour pister ou trouver de l'eau.")
    ],
    texte: "Un tauren aux cornes ébréchées, la crinière tressée de perles de bois, qui conduit des caravanes de kodos à travers les Tarides depuis vingt ans. Il parle lentement et ne promet que ce qu'il peut tenir.",
    mj: "Survivant de la caravane attaquée (scène 2), blessé (12 PV au moment où on le trouve). Reconnaissant, il guide le groupe jusqu'au kraal et connaît le passage dans les ronces à l'ouest. Il refuse de tuer des hurans qui ne sont « que malades », et défend ce point de vue. S'il meurt, la Horde du Carrefour en tiendra le groupe pour responsable." }),

  pnj({ cle: "grommel-defense-grise", nom: "Grommel Défense-Grise, géomancien huran", fp: 1, type: "humanoïde", sousType: "huran",
    alignement: "Neutre", ca: 12, pv: 27, dv: "6d8", carac: { for: 10, dex: 12, con: 11, int: 12, sag: 15, cha: 10 },
    competences: { nature: 1, religion: 1, intuition: 1 }, langues: "huran, orc", disposition: 0, role: "elite",
    capacites: [
      attaque("Bâton d'épines", { toucher: 2, degats: "1d6", type: "contondant", arme: "simple" }),
      attaque("Éclat de terre", { toucher: 4, degats: "2d6", type: "contondant", distance: true, magique: true, portee: [18] }),
      sauvegarde("Ronces jaillissantes", { carac: "dex", dd: 12, portee: 18, degats: "2d8", type: "perforant", recharge: 5,
        echec: "La cible est entravée par les ronces jusqu'à la fin du prochain tour de Grommel" })
    ],
    texte: "Un vieux huran au groin gris, couvert d'amulettes en os et de petits cailloux peints, appuyé sur un bâton d'épines tressées. Il écoute la terre et dit qu'elle a mal.",
    mj: "Dissident du kraal : il a refusé de boire l'eau verte et soigne en cachette ceux qui en ont bu. Il hait les étrangers, mais hait plus encore « le rieur » (Ezzavel). Persuasion DD 13 (avantage si le groupe ramène Hanuk vivant ou a épargné des hurans) : il aide, révèle le marché passé entre la cheffe et le satyre, et la galerie basse de la mine. Il n'attaque jamais les siens." }),

  pnj({ cle: "gorra-fiel-d-epine", nom: "Gorra Fiel-d'Épine, cheffe de Ronceroc", fp: 2, type: "humanoïde", sousType: "huran",
    alignement: "Chaotique mauvais", ca: 14, pv: 52, dv: "7d8 + 21", carac: { for: 17, dex: 12, con: 16, int: 9, sag: 11, cha: 12 },
    competences: { athletisme: 1, intimidation: 1 }, sens: { noir: 18 }, resistances: ["feu"], langues: "huran, orc", role: "chef",
    capacites: [
      trait("Peau d'épines", "Une créature qui agrippe Gorra, ou la touche à mains nues, subit 2 (1d4) dégâts perforants."),
      trait("Gorgée de gangrène", "Les yeux de Gorra luisent de vert. Elle ne peut pas être effrayée et a la résistance aux dégâts de feu ; elle a le désavantage aux jets de sauvegarde contre les effets radiants."),
      attaquesMultiples("Gorra fait deux attaques de Hache à épines."),
      attaque("Hache à épines", { toucher: 5, degats: "1d10+3", type: "tranchant", plus: [["1d4", "feu"]], arme: "guerre" }),
      attaque("Javeline", { toucher: 5, degats: "1d6+3", type: "perforant", distance: true, portee: [9, 36], carac: "for", arme: "simple" }),
      action("Rugissement de la cheffe", "Chaque huran allié à 9 m ou moins qui entend Gorra gagne 5 points de vie temporaires et a l'avantage à sa prochaine attaque.", { activation: "bonus", parJour: 1 })
    ],
    texte: "Une huran énorme, la crinière hérissée de ronces, un collier de crânes de kodos au cou ; ses yeux brillent d'une lueur verte qui n'a rien de naturel.",
    mj: "Ce n'est pas une brute : c'est une cheffe qui a voulu sauver son kraal de la sécheresse et a accepté l'eau du satyre. La gangrène la rend furieuse et paranoïaque. Elle accepte un duel d'honneur (un champion du groupe contre elle) ; vaincue sans être tuée, elle libère les prisonniers et se retire. Si l'Éclat est détruit, la gangrène la quitte en une semaine et elle devient une alliée méfiante." }),

  pnj({ cle: "drogha-cendrelame", nom: "Drogha Cendrelame, prophète de la Lame ardente", fp: 2, type: "humanoïde", sousType: "orc",
    alignement: "Neutre mauvais", ca: 12, pv: 45, dv: "7d8 + 14", carac: { for: 12, dex: 12, con: 14, int: 13, sag: 10, cha: 16 }, sauvegardes: ["sag", "cha"],
    competences: { arcanes: 1, intimidation: 1, tromperie: 1 }, sens: { noir: 18 }, langues: "orc, commun, eredun", role: "chef",
    capacites: [
      trait("Incantation", "Drogha lance ses sorts avec le Charisme (DD 13). À volonté : *décharge occulte* (voir Trait de gangrefeu), *prestidigitation*. 1/jour chacun : *armure d'Agathys*, *injonction*, *ténèbres*."),
      attaque("Lame ardente", { toucher: 5, degats: "1d8+3", type: "tranchant", plus: [["1d6", "feu"]], carac: "cha", arme: "guerre" }),
      attaque("Trait de gangrefeu", { toucher: 5, degats: "2d10", type: "feu", distance: true, magique: true, portee: [36] }),
      sauvegarde("Immolation", { carac: "dex", dd: 13, zone: { forme: "sphere", taille: 3 }, degats: "3d6", type: "feu", recharge: 5,
        texte: "Drogha désigne un point à 18 m ou moins : des flammes vertes jaillissent du sol." }),
      action("Pacte de cendre", "Quand Drogha tombe à 0 point de vie pour la première fois, il revient à 10 points de vie dans une gerbe de flammes vertes ; chaque créature à 1,5 m de lui subit 5 (2d4) dégâts de feu.", { activation: "special", parJour: 1 })
    ],
    texte: "Un orc maigre à la peau grise, le crâne rasé couvert de tatouages en forme de lame enflammée, vêtu d'une robe noire brûlée aux ourlets. Sa voix est douce, presque amicale.",
    mj: "Grand méchant. Ancien chaman renié par son clan, il croit que la Horde a trahi sa nature en tournant le dos aux démons. Son plan : empoisonner les eaux des Tarides pour que la Horde et l'Alliance s'accusent mutuellement, et faire des hurans une armée pour la Légion. Il combat à distance derrière ses cultistes, garde Immolation pour un groupe serré, et préfère fuir par l'entrée de la mine plutôt que mourir s'il perd l'Éclat (il reviendra)." }),

  pnj({ cle: "ezzavel", nom: "Ezzavel le Rieur, satyre", fp: 2, type: "fiélon", sousType: "démon", alignement: "Chaotique mauvais",
    ca: 14, pv: 45, dv: "10d8", carac: { for: 12, dex: 16, con: 11, int: 13, sag: 10, cha: 14 },
    competences: { perception: 1, representation: 1, tromperie: 1, discretion: 1 }, sens: { noir: 18 }, langues: "commun, darnassien, eredun, huran", role: "elite",
    capacites: [
      trait("Résistance à la magie", "Ezzavel a l'avantage aux jets de sauvegarde contre les sorts et autres effets magiques."),
      attaquesMultiples("Ezzavel fait deux attaques : une de Dague gangrenée et une de Sabots."),
      attaque("Dague gangrenée", { toucher: 5, degats: "1d4+3", type: "perforant", plus: [["1d6", "feu"]], arme: "simple" }),
      attaque("Sabots", { toucher: 5, degats: "1d4+3", type: "contondant", effet: "Si la cible est de taille M ou inférieure, Ezzavel la repousse de 3 m." }),
      sauvegarde("Air de discorde", { carac: "sag", dd: 12, zone: { forme: "rayon", taille: 9 }, recharge: 5,
        texte: "Ezzavel joue quelques notes fausses sur une flûte d'os. Seules les créatures de son choix sont concernées.",
        echec: "La cible est charmée jusqu'à la fin de son prochain tour : elle ne peut pas attaquer Ezzavel et doit utiliser son action pour attaquer la créature la plus proche d'elle, ou se déplacer si personne n'est à portée" })
    ],
    texte: "Un satyre aux cornes noires polies, une flûte d'os pendue au cou, qui rit en permanence d'un rire de chèvre. Ses sabots laissent des traces brûlées dans l'herbe sèche.",
    mj: "Messager de la Légion auprès de Drogha. Il a livré l'Éclat et la recette de l'eau verte, et il s'amuse. Il sème la discorde (Air de discorde sur les groupes mixtes Horde-Alliance, en raillant leurs vieilles haines), puis fuit à 15 PV en jurant de revenir. Il peut servir d'ennemi récurrent dans une suite." })
];

// ---------------------------------------------------------------- Journal du MJ (caché)

const JOURNAL_MJ = journal({ cle: "aventure-puits-de-cendre", nom: `Aventure — ${TITRE_AVENTURE}`, visible: false, pages: [
  { titre: "Synopsis (MJ)", texte: `
**${TITRE_AVENTURE}** est une aventure d'enquête et d'action pour 3 à 5 personnages de **niveau 1**, qui atteignent le **niveau 3** à la fin (passage au niveau 2 après la scène 2, au niveau 3 après la scène 3). Comptez deux ou trois séances.

**Cadre.** Les Tarides du Nord, savane brûlée entre Durotar et la côte. Au bord de la mer, **Cabestan**, port gobelin du **Cartel Gentepression**, est neutre : la **Trêve de Cabestan** y interdit tout combat entre la Horde et l'Alliance. Le groupe peut donc être de l'Alliance, de la Horde ou mélangé.

**Ce qui se passe.** Depuis un mois, les puits et les oasis des Tarides se gâtent : l'eau a un goût de cendre et luit faiblement en vert la nuit. Ceux qui en boivent ont de la fièvre et des colères soudaines. Les hurans du kraal de **Ronceroc** attaquent les caravanes avec une rage inhabituelle. Au Carrefour, on accuse l'Alliance d'empoisonner l'eau ; dans les avant-postes de l'Alliance, on accuse la Horde. La guerre menace.

**La vérité.** **Drogha Cendrelame**, orc renégat de la **Lame ardente** (un culte qui vénère la Légion ardente), et le satyre **Ezzavel le Rieur** ont trouvé dans la mine abandonnée de **Rouge-Veine** un **Éclat gangrené**, fragment de cristal démoniaque oublié depuis des millénaires. Plongé dans la source souterraine qui alimente la nappe des Tarides, il répand la gangrène dans tous les puits de la région. Drogha veut une guerre entre factions, et une armée de hurans corrompus au service de la Légion. Ezzavel a acheté la cheffe huran **Gorra Fiel-d'Épine** avec de l'eau « bénie » contre des prisonniers, qui creusent la mine aux côtés de kobolds enchaînés.

**Déroulement et cartes** (compendium *La Kour Warcraft — Scènes*)
- Scène 1 — Le contrat du Cartel : carte *${carte("cabestan-quai")}*
- Scène 2 — Le relais pillé : carte *${carte("relais-oasis")}*
- Scène 3 — Le kraal de Ronceroc : carte *${carte("kraal-ronceroc")}*
- Scène 4 — La mine de Rouge-Veine : carte *${carte("mine-rouge-veine")}*

Les PNJ nommés et les créatures sont dans le compendium *La Kour Warcraft — Bestiaire*.` },

  { titre: "Scène 1 — Le contrat du Cartel", texte: `
**Carte :** *${carte("cabestan-quai")}*. Fin d'après-midi, les lanternes s'allument.

**À lire :** *Cabestan sent l'huile chaude, le sel et le poisson grillé. Sur le quai, des gobelins hurlent des prix dans trois langues pendant qu'une grue grince au-dessus d'un navire marchand. Un orc et un humain en armes se croisent sans se regarder : ici, la Trêve tient, parce que le Cartel le veut. Devant le Comptoir, une gobeline aux lunettes de cuivre vous fait signe d'entrer, sans lever les yeux de son livre de comptes.*

**Le contrat.** **Grizzla Tordeboulon** remet au groupe le **contrat du Cartel** (aide de jeu) : trouver ce qui empoisonne l'eau des Tarides et l'arrêter. 50 pièces d'or chacun, 100 de plus pour le groupe si la cause est détruite. Elle fournit une gourde d'eau gâtée, un kodo de bât et la route de la dernière caravane, disparue près du **Relais de l'Oasis** avec son guide, **Hanuk Pas-de-Pluie**.

**Le Bureau de la Trêve.** Le lieutenant **Corwen Haldis** (Alliance, profil de Garde de Hurlevent) et le grunt **Garrok Brise-Dent** (Horde, profil de Grunt d'Orgrimmar) s'y disputent autour de la Table des négociations. Chacun accuse l'autre camp, chacun est sincère (Intuition DD 12). Chacun demande discrètement aux personnages de sa faction de lui rapporter la preuve que *son* camp est innocent : bonne accroche pour les groupes mixtes.

**Indices**
- Gourde d'eau gâtée : **Investigation DD 12**, une fine cendre noire au fond ; **Arcanes DD 13**, l'odeur et la lueur de la gangrène, la magie des démons.
- Un docker malade près du Puits du Cartel : **Médecine DD 12**, fièvre de gangrène (insomnie, colère) ; il a bu à l'oasis du relais il y a dix jours.
- Les **Tonneaux d'eau** livrés devant l'Entrepôt du Cartel : **Perception DD 13**, l'un d'eux luit faiblement ; un porteur d'eau en verse le contenu dans les autres.

**Rencontre : les tonneaux.** Le porteur est un **cultiste de la Lame ardente** (profil de Bandit défias), accompagné de trois **nervis** (Bandits défias) cachés derrière le Chariot et les Caisses du quai. Démasqué, il attaque ; les nervis fuient s'il tombe. Si le combat dure plus de 3 rounds, **deux murlocs** attirés par l'eau souillée répandue dans le port grimpent sur le Quai. Les gardes du port arrivent au bout de 5 rounds : la Trêve est respectée tant que personne n'a tiré sur un membre de l'autre faction.

**Interrogatoire.** Le cultiste porte une lame enflammée tatouée sur l'avant-bras (**Histoire ou Religion DD 12** : la Lame ardente). Intimidé ou soigné (**Persuasion DD 13**), il lâche : « La source boit le feu. Rouge-Veine chante, et bientôt tout le monde boira. » Sur lui : une carte avec le Relais de l'Oasis entouré, et 8 pièces d'or.` },

  { titre: "Scène 2 — Le relais pillé", texte: `
**Carte :** *${carte("relais-oasis")}*. Une journée de piste vers l'est. Arrivée au crépuscule.

**À lire :** *Le relais n'a plus de porte. Un chariot renversé barre la piste, à côté d'un kodo mort que les vautours ont déjà trouvé. Les caisses de la caravane sont éventrées, et les tonneaux d'eau propre ont disparu. Au-delà, l'oasis devrait être un miroir bleu sous les palmiers ; ce soir, son eau a la couleur d'une vieille bouteille, et quelque chose y brille faiblement.*

**Hanuk.** Le guide tauren est caché dans l'Écurie, blessé (12 PV sur 34). **Perception DD 10** pour l'entendre respirer. Il raconte : des hurans aux yeux verts ont attaqué à l'aube, emporté l'eau propre et deux conducteurs ; derrière eux, quelqu'un « riait comme une chèvre ». Soigné ou remercié, il rejoint le groupe (allié).

**Indices**
- Le **Puits** du relais : **Nature ou Survie DD 12**, le niveau de l'eau est normal, mais la cendre remonte du fond ; **Arcanes DD 13**, la corruption vient de la nappe, qui descend des collines rouges à l'est.
- Les traces : **Survie DD 11**, les hurans sont repartis vers le sud-est (le kraal de Ronceroc, une demi-journée) ; **Survie DD 15**, des empreintes de sabots fendus, bipèdes, brûlées dans l'herbe, partent vers l'est (la mine).
- Dans les Caisses éventrées : un registre de la caravane (marchandises de la Horde *et* de l'Alliance, preuve que personne n'a attaqué « l'autre camp »).

**Rencontre : l'attaque de nuit.** Vers minuit, **trois guerriers hurans** et **un sanglier corrompu** (Sanglier des plaines qui ne fuit jamais, yeux verts) arrivent par l'Oasis pour prendre le reste de l'eau. Ils visent les tonneaux, puis quiconque les défend. Un huran capturé ne parle qu'huran (ou orc, mal) : « La cheffe donne l'eau qui rend fort. »

**Purifier le puits (facultatif).** Un rite de la Lumière ou de la nature (**Religion ou Nature DD 14**, une heure, de l'eau bénite ou une offrande) rend le puits buvable pour une semaine : la caravane suivante passera.

**Fin de scène :** les personnages passent au **niveau 2**.` },

  { titre: "Scène 3 — Le kraal de Ronceroc", texte: `
**Carte :** *${carte("kraal-ronceroc")}*. Une demi-journée au sud-est, dans un vallon couvert de ronces géantes.

**À lire :** *Les ronces montent plus haut qu'un kodo, tressées en murailles vivantes, hérissées d'épines longues comme des dagues. Par l'unique entrée, on aperçoit un grand totem, des huttes de terre et, près du feu, une mare dont l'eau verte fume doucement. Un cor sonne ; des groins se lèvent.*

**Approches**
- **Assaut** par l'entrée sud : dangereux (Gorra, quatre guerriers hurans, deux sangliers).
- **Discrétion** : un passage secret dans les ronces, à l'ouest (**Perception DD 14** pour le trouver, ou Hanuk le connaît), mène derrière la Hutte du géomancien. Tests de **Discrétion DD 12** pour traverser le kraal la nuit.
- **Parlementer** avec **Grommel Défense-Grise** dans sa hutte, près de l'Autel de pierre (**Persuasion DD 13**, avantage si Hanuk est là ou si des hurans ont été épargnés).

**Ce que sait Grommel.** La cheffe Gorra a accepté l'eau du « rieur » quand la sécheresse tuait les sangliers. En échange, le kraal livre des prisonniers à la mine de Rouge-Veine. L'eau donne de la force et prend la raison. Il connaît la **galerie basse** de la mine, qui contourne la galerie principale et débouche dans la caverne par un passage dérobé.

**Gorra Fiel-d'Épine.** Sur son Trône d'os, dans la Hutte de la cheffe. Elle accepte un **duel d'honneur** si on le lui propose devant les siens (Grommel peut l'arranger) : un champion contre elle, jusqu'à ce que l'un tombe. Vaincue mais vivante, elle libère les prisonniers et laisse partir le groupe. Tuée, le kraal se disperse, et la piste de la mine reste ouverte, mais les hurans haïront le groupe.

**La Cage des prisonniers.** Deux conducteurs de la caravane : **Tobias Merle**, un humain de Theramore, et **Uzga**, une orque du Carrefour. Ils ont vu les mêmes cultistes emporter des hurans enchaînés vers l'est, et chacun témoigne que l'autre camp n'y est pour rien. Les ramener vivants à Cabestan vaut une preuve pour le Bureau de la Trêve.

**Soigner la gangrène.** **Médecine DD 13** et trois jours de repos sans boire l'eau verte guérissent un huran ; détruire l'Éclat les guérit tous en une semaine.

**Fin de scène :** les personnages passent au **niveau 3**.` },

  { titre: "Scène 4 — La mine de Rouge-Veine", texte: `
**Carte :** *${carte("mine-rouge-veine")}*. Les collines rouges à l'est, une journée du kraal. Obscurité totale hors des lumières de la carte.

**À lire :** *Le vieux panneau du Cartel pend encore au-dessus de l'entrée, rongé par le vent : « Rouge-Veine — défense d'entrer sans casque ». De la galerie monte une odeur de soufre et de pierre chaude, et une lueur verte palpite au fond, au rythme d'un cœur. Quelque part, des pioches frappent la roche, et des petites voix pleurnichent.*

**Entrée de la mine.** Deux **cultistes** (Bandits défias) jouent aux dés près du Tas de minerai ; s'ils sonnent l'alerte, Drogha est prêt dans la caverne (pas de surprise possible).

**Baraquement des kobolds.** Huit **kobolds mineurs** enchaînés (les Chaînes près des Couchettes), épuisés, gardés par un cultiste. Libérés (**Persuasion DD 12**, ou en leur offrant des bougies !), ils ne se battent pas mais montrent la porte dérobée de la galerie basse et volent la clé de la Réserve de poudre.

**Réserve de poudre** (porte verrouillée : clé du garde, ou **outils de voleur DD 13**). Les **Tonneaux de poudre** : un tonneau allumé explose au bout d'un round (sphère de 3 m, **sauvegarde de Dextérité DD 12**, 3d6 dégâts de feu, moitié en cas de réussite). Deux tonneaux au pied du Puits de la source noire font s'effondrer la caverne : à n'utiliser qu'en sortant !

**Galerie basse.** L'Étayage effondré cache le passage secret vers la caverne (**Perception DD 15** sans l'aide des kobolds ou de Grommel). Elle permet d'arriver derrière Drogha.

**La Caverne de la Source.** **Drogha Cendrelame** devant l'Autel de la Lame ardente, **Ezzavel le Rieur** près de l'**Éclat gangrené**, planté dans le Puits de la source noire, et **deux cultistes** près des Braseros.

**À lire :** *L'eau noire du puits bouillonne sans chaleur. Planté en son centre, un cristal vert gros comme un poing de troll pulse lentement, et chaque battement fait trembler les flammes des braseros. Un orc au crâne tatoué lève les bras et chante en eredun ; à côté de lui, une silhouette à pattes de bouc éclate de rire en vous voyant.*

**Le rituel** (un palier tous les 3 rounds, compté dès que le groupe entre dans la caverne) :
1. L'eau monte : le sol à 3 m du puits devient un terrain difficile.
2. L'eau crache des vapeurs vertes : chaque créature qui finit son tour à 3 m du puits fait une **sauvegarde de Constitution DD 12** ou subit 2d6 dégâts de poison.
3. Un **chien corrompu** jaillit du puits et attaque. Si on laisse le rituel continuer encore 10 rounds, un **gangregarde** suit : il faut fuir.

**Arrêter le rituel :** détruire l'Éclat (CA 15, 20 PV, immunisé contre le poison et les dégâts psychiques, dégâts radiants doublés) ; ou l'arracher du puits (action, **Athlétisme DD 15**, 3d6 dégâts de feu à qui le saisit, réussite ou non) ; ou faire taire Drogha (inconscient, bâillonné ou mort : le rituel s'arrête au palier atteint).

**Drogha et Ezzavel** fuient s'ils perdent l'Éclat ou tombent sous 15 PV : Ezzavel en riant, Drogha en maudissant le groupe. Les poursuivre est possible jusqu'à l'Entrée de la mine.

**Équilibre :** Drogha, Ezzavel et deux cultistes forment un combat difficile pour quatre personnages de niveau 3. Avec trois personnages, retirez un cultiste et commencez le rituel au palier 1 ; avec cinq, ajoutez deux guerriers hurans si Gorra est toujours l'alliée du culte.` },

  { titre: "Dénouements et récompenses", texte: `
**L'Éclat est détruit.** En une semaine, l'eau redevient claire, les hurans guérissent et les caravanes reprennent. Grizzla paie la prime complète. Au Bureau de la Trêve, Corwen Haldis et Garrok Brise-Dent rédigent ensemble un rapport qui blanchit leurs deux camps : chaque personnage gagne une **faveur** de sa faction (une lettre de recommandation, un équipement, un passage gratuit).

**L'Éclat est emporté par Drogha.** L'eau se purifie lentement (un mois), mais la Lame ardente prépare quelque chose de pire ailleurs dans les Tarides. Grizzla ne paie que la moitié de la prime.

**La caverne s'effondre.** L'Éclat est enfoui sous des tonnes de roche : la corruption cesse en un mois. Le Cartel retient 50 pièces d'or « pour le tunnel ».

**Récompenses**
- Contrat de Grizzla : 50 po par personnage, plus 100 po pour le groupe.
- Sur Drogha : une **lettre de la Lame ardente** (accroche de suite : « le feu remonte jusqu'à Orgrimmar »), deux **potions de soins**, 35 po et sa lame cérémonielle.
- Kobolds libérés : ils indiquent un filon de cuivre intact ; le Cartel accorde au groupe un dixième de son exploitation (10 po par mois tant que la mine tourne).
- Gorra épargnée, puis guérie : le kraal de Ronceroc laisse passer le groupe sans péage ; Grommel peut enseigner un rituel de purification de l'eau.
- Prisonniers ramenés vivants : 25 po chacun, et la gratitude de Theramore ou du Carrefour.

**La suite :** la lettre de Drogha, Ezzavel en fuite et les autres éclats tombés du ciel il y a dix mille ans mènent à la campagne *Les Braises de la Légion* (niveaux 3 à 6, journal « Campagne — Les Braises de la Légion »). Le MJ IA peut aussi prendre le relais en s'appuyant sur les cartes de lieux du compendium.` },

  { titre: "PNJ et forces en présence", texte: `
**PNJ nommés** (fiches dans le bestiaire)
- **Grizzla Tordeboulon** — intendante du Cartel, commanditaire. Neutre, pressée, honnête à sa manière.
- **Hanuk Pas-de-Pluie** — guide tauren, survivant du relais. Allié loyal.
- **Grommel Défense-Grise** — géomancien huran dissident. Neutre, se méfie de tous.
- **Gorra Fiel-d'Épine** — cheffe huran corrompue. Hostile, mais peut être sauvée.
- **Drogha Cendrelame** — prophète orc de la Lame ardente. Le grand méchant.
- **Ezzavel le Rieur** — satyre de la Légion. Ennemi récurrent.

**PNJ sans fiche**
- **Lieutenant Corwen Haldis** (Alliance) : profil de *Garde de Hurlevent*, avec 20 PV. Raide, fatigué, loyal à Theramore.
- **Garrok Brise-Dent** (Horde) : profil de *Grunt d'Orgrimmar*. Bourru, colérique, attaché à l'honneur.
- **Tobias Merle** et **Uzga**, conducteurs de caravane : profil de *Paysan*.
- Les **cultistes de la Lame ardente** : profil de *Bandit défias* (remplacer le foulard par un tatouage de lame enflammée).

**Créatures du bestiaire utilisées :** Bandit défias, Murloc, Guerrier huran, Sanglier des plaines, Kobold mineur, Chien corrompu, Gangregarde.` }
] });

// ---------------------------------------------------------------- Aide de jeu (visible)

const AIDE_DE_JEU = journal({ cle: "contrat-du-cartel", nom: "Aide de jeu — Contrat du Cartel Gentepression", visible: true, pages: [
  { titre: "Contrat du Cartel", texte: `
**CARTEL GENTEPRESSION — Comptoir de Cabestan**

*Contrat de service, à durée limitée, payable à la livraison.*

Les porteurs du présent contrat sont chargés par le Cartel de trouver la cause de la corruption des eaux des Tarides et d'y mettre fin, par tout moyen qui ne coûte rien au Cartel.

- Rémunération : 50 pièces d'or par contractant, versées au retour.
- Prime : 100 pièces d'or pour le groupe si la cause est détruite (preuve exigée).
- Frais : un kodo de bât, prêté (tout kodo perdu sera facturé).
- Le contractant reconnaît que la Trêve de Cabestan s'applique à lui dans l'enceinte du port.

*Le Cartel décline toute responsabilité en cas de décès, de démembrement, de malédiction ou de goût de cendre persistant.*

*Pour le Cartel : G. Tordeboulon, intendante.*  *(Tampon de cire dorée en forme de roue dentée.)*` },
  { titre: "La Trêve de Cabestan", texte: `
*Affiché sur chaque quai, en commun, en orc et en gobelin :*

**PAR ORDRE DU CARTEL**

- Dans Cabestan, on ne se bat pas entre Horde et Alliance. Jamais.
- Qui tire le premier paie les dégâts, les soins, et l'amende.
- Les gardes du port ont toujours raison.
- Les affaires sont les affaires.` }
] });

export const AVENTURE_DOCUMENTS = [...PNJ_AVENTURE, JOURNAL_MJ, AIDE_DE_JEU, ...CARTES, ...CARTES_LIEUX];
