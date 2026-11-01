// Historiques d'Azeroth au format 2024 (dnd5e 6.0.6) et dons d'origine propres au module.
// Chaque historique : trois caractéristiques (ASI +2/+1 ou +1/+1/+1), deux compétences, un outil, un don d'origine
// (du SRD, référencé par son uuid dnd5e, ou maison), des langues, et l'équipement de départ (option A) ou 50 po (B).
// Textes originaux.
import { icone, ref } from "./aides.mjs";
import { historique, don, DONS_SRD, SORTS_SRD, EQUIPEMENT_SRD as S } from "./objets.mjs";

// ---------- Dons d'origine maison (system.type = feat/origin)

const BM_PAR_REPOS_LONG = { max: "@prof", periode: "lr" };

export const DONS_MAISON = {
  rempart: don({
    cle: "don-rempart-du-rang", nom: "Rempart du rang", img: icone("skills/melee/shield-block-gray-yellow"),
    texte: "On vous a appris à tenir la ligne, coude contre coude. Quand une créature que vous voyez touche un allié situé à 1,5 m de vous, vous pouvez utiliser votre **réaction** pour vous interposer : les dégâts qu'il subit sont réduits de **1d8 + votre bonus de maîtrise**. Vous devez porter un bouclier ou une arme de corps à corps.\n\nNombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    utilisations: BM_PAR_REPOS_LONG,
    activites: [{ type: "utility", nom: "S'interposer", activation: "reaction", condition: "Un allié à 1,5 m est touché", portee: [1.5, "m"], cible: ["1", "ally"], jet: { nom: "Dégâts évités", formule: "1d8 + @prof" } }]
  }),
  piedMarin: don({
    cle: "don-pied-marin", nom: "Pied marin", img: icone("svg/anchor"),
    texte: "Vous avez grandi sur un pont qui roule. Vous gagnez une **vitesse de nage de 9 m**, la maîtrise des **véhicules marins**, et l'avantage aux tests de Force (Athlétisme) et de Dextérité (Acrobaties) pour garder l'équilibre sur un sol mouvant (pont, gréement, glace, radeau).",
    maitrises: { accordees: ["tool:vehicle:water"] },
    effets: [{ nom: "Pied marin", changements: [["system.attributes.movement.swim", 9, "upgrade"]] }]
  }),
  graceLumiere: don({
    cle: "don-grace-de-la-lumiere", nom: "Grâce de la Lumière", img: icone("magic/holy/prayer-hands-glowing-yellow-green"),
    texte: "La Lumière n'appartient à personne, mais elle vous écoute. Vous connaissez le tour de magie **Lumière** (Sagesse). Par une **action**, vous pouvez toucher une créature : elle récupère **1d6 + votre bonus de maîtrise** points de vie.\n\nNombre d'utilisations de l'imposition des mains : votre **bonus de maîtrise** par repos long.",
    utilisations: BM_PAR_REPOS_LONG,
    sorts: [{ uuid: SORTS_SRD.lumiere, carac: ["wis"] }],
    activites: [{ type: "heal", nom: "Imposer les mains", portee: ["", "touch"], cible: ["1", "creature"], soin: { des: "1d6", bonus: "@prof" } }]
  }),
  lienSylvestre: don({
    cle: "don-lien-sylvestre", nom: "Lien sylvestre", img: icone("magic/nature/leaf-hand-green"),
    texte: "Les Anciens de la forêt vous ont appris à écouter avant de parler. Vous connaissez le tour de magie **Druidisme**, et vous pouvez lancer **Communication avec les animaux** une fois sans emplacement de sort par repos long. Sagesse est votre caractéristique d'incantation pour ces sorts.",
    sorts: [{ uuid: SORTS_SRD.druidisme, carac: ["wis"] }, { uuid: SORTS_SRD.parlerAnimaux, carac: ["wis"], parRepos: true }]
  }),
  coriace: don({
    cle: "don-coriace", nom: "Coriace", img: icone("magic/life/heart-cross-strong-blue"),
    texte: "Vous avez survécu au Fléau, à la faim et à l'hiver sur les routes. Vos points de vie maximum augmentent de **2 par niveau** de personnage (2 maintenant, puis 2 à chaque niveau gagné).",
    effets: [{ nom: "Coriace", changements: [["system.attributes.hp.bonuses.level", 2]] }]
  }),
  pisteur: don({
    cle: "don-pisteur-des-plaines", nom: "Pisteur des plaines", img: icone("svg/pawprint"),
    texte: "Une herbe couchée, une odeur de musc, un caillou retourné : vous lisez la terre. Vous gagnez la maîtrise de **Nature**, **Perception** ou **Survie** (au choix). Vous avez l'avantage aux tests faits pour suivre une piste, et votre groupe peut voyager à allure rapide sans subir de malus de Perception passive quand vous menez la marche.",
    maitrises: { choix: [{ parmi: ["skills:nat", "skills:prc", "skills:sur"] }] }
  })
};

// ---------- Historiques

const LANGUES_ALLIANCE = { accordees: ["languages:standard:common"], choix: [{ nombre: 2, parmi: ["languages:standard:*"] }] };
const LANGUES_HORDE = { accordees: ["languages:standard:orc"], choix: [{ nombre: 2, parmi: ["languages:standard:*"] }] };
const langues = cle => ({ accordees: [`languages:standard:${cle}`], choix: [{ nombre: 2, parmi: ["languages:standard:*"] }] });
const O = cle => ref(`objets:${cle}`);

// Description : l'accroche, puis le résumé mécanique lisible par le joueur et par le MJ IA.
const fiche = (accroche, { carac, competences, outil, don: nomDon, equipement, langues: l }) => [
  accroche,
  `- **Caractéristiques :** ${carac}\n- **Compétences :** ${competences}\n- **Outil :** ${outil}\n- **Don d'origine :** ${nomDon}\n- **Langues :** ${l}\n- **Équipement :** ${equipement}, *ou* 50 po`
].join("\n\n");

export const HISTORIQUES = [
  ...Object.values(DONS_MAISON),

  historique({
    cle: "soldat-de-hurlevent", nom: "Soldat de Hurlevent", img: icone("environment/people/infantry-armored"),
    carac: ["str", "dex", "con"], competences: ["ath", "itm"], outil: "tool:game:dice", don: DONS_MAISON.rempart,
    langues: LANGUES_ALLIANCE,
    equipement: [[O("epee-de-la-garde")], [S.bouclier], [S.trousseSoins], [S.vetementsVoyage], [S.rations, 5]], or: 9,
    texte: fiche("Vous avez porté le lion d'or de Hurlevent sur votre tabard : garde de la cité reconstruite, milicien de Comté-de-l'Or ou vétéran des Marches de l'Ouest. Vous connaissez les rangs, les corvées et les ordres criés sous la pluie.", {
      carac: "Force, Dextérité, Constitution", competences: "Athlétisme, Intimidation", outil: "un jeu de dés", don: "Rempart du rang",
      langues: "commun, plus deux au choix", equipement: "épée de la Garde de Hurlevent, bouclier, trousse de soins, vêtements de voyage, 5 rations, 9 po"
    })
  }),
  historique({
    cle: "grunt-d-orgrimmar", nom: "Grunt d'Orgrimmar", img: icone("weapons/axes/axe-battle-heavy-jagged"),
    carac: ["str", "con", "wis"], competences: ["ath", "sur"], outil: "tool:art:smith", don: DONS_SRD.attaquantSauvage,
    langues: LANGUES_HORDE,
    equipement: [[O("hache-d-orgrimmar")], [S.javeline, 4], [S.outilsForgeron], [S.rations, 5], [S.outre]], or: 6,
    texte: fiche("Vous avez creusé les remparts d'Orgrimmar, chassé les centaures de Durotar et monté la garde aux Tarides. Grunt de la nouvelle Horde, vous vous battez pour prouver que les orcs ont retrouvé leur honneur.", {
      carac: "Force, Constitution, Sagesse", competences: "Athlétisme, Survie", outil: "outils de forgeron", don: "Attaquant sauvage (SRD)",
      langues: "orc, plus deux au choix", equipement: "hache d'Orgrimmar, 4 javelines, outils de forgeron, 5 rations, outre, 6 po"
    })
  }),
  historique({
    cle: "apprenti-de-dalaran", nom: "Apprenti de Dalaran", img: icone("sundries/books/", "book"),
    carac: ["int", "wis", "cha"], competences: ["arc", "his"], outil: "tool:art:calligrapher", don: DONS_SRD.initieMagie,
    langues: LANGUES_ALLIANCE,
    equipement: [[S.baton], [S.livre], [S.parchemin, 10], [S.encre], [S.plume], [S.robe], [O("potion-de-mana-mineure")]], or: 8,
    texte: fiche("Dalaran a été rasée par Archimonde, et le Kirin Tor rebâtit sa cité dans le secret. Vous étiez apprenti quand les tours sont tombées : vous avez sauvé un grimoire, quelques sorts et une dette envers vos maîtres dispersés.", {
      carac: "Intelligence, Sagesse, Charisme", competences: "Arcanes, Histoire", outil: "matériel de calligraphe", don: "Initié à la magie (SRD, magicien conseillé)",
      langues: "commun, plus deux au choix", equipement: "bâton, livre, 10 feuilles de parchemin, encre, plume, robe, potion de mana mineure, 8 po"
    })
  }),
  historique({
    cle: "initie-de-la-lumiere", nom: "Initié de la Lumière", img: icone("magic/holy/chalice-glowing-gold"),
    carac: ["int", "wis", "cha"], competences: ["ins", "rel"], outil: "tool:herb", don: DONS_MAISON.graceLumiere,
    langues: LANGUES_ALLIANCE,
    equipement: [[S.masse], [S.symboleSacre], [S.trousseSoins], [S.robe], [O("potion-de-soins")]], or: 7,
    texte: fiche("Novice d'une abbaye, acolyte de la cathédrale de Hurlevent ou survivant de la Main d'argent, vous croyez que la Lumière vit en chaque cœur. Vous avez soigné des pestiférés et enterré des amis.", {
      carac: "Intelligence, Sagesse, Charisme", competences: "Intuition, Religion", outil: "matériel d'herboriste", don: "Grâce de la Lumière",
      langues: "commun, plus deux au choix", equipement: "masse, symbole sacré, trousse de soins, robe, potion de soins, 7 po"
    })
  }),
  historique({
    cle: "marin-de-kul-tiras", nom: "Marin de Kul Tiras", img: icone("svg/anchor"),
    carac: ["str", "dex", "wis"], competences: ["ath", "prc"], outil: "tool:navg", don: DONS_MAISON.piedMarin,
    langues: LANGUES_ALLIANCE,
    equipement: [[S.cimeterre], [S.dague], [S.outilsNavigateur], [S.corde], [S.vetementsVoyage]], or: 10,
    texte: fiche("La flotte de l'amiral Portvaillant a suivi Jaina jusqu'à Theramore, et elle y a sombré en partie. Matelot, gabier ou contrebandier de Boralus, vous avez survécu aux tempêtes de la Grande Mer et aux rumeurs de la Horde.", {
      carac: "Force, Dextérité, Sagesse", competences: "Athlétisme, Perception", outil: "instruments de navigateur", don: "Pied marin",
      langues: "commun, plus deux au choix", equipement: "cimeterre, dague, instruments de navigateur, corde, vêtements de voyage, 10 po"
    })
  }),
  historique({
    cle: "cartel-gobelin", nom: "Cartel gobelin", img: icone("commodities/currency/coin-embossed-crown-gold"),
    carac: ["dex", "int", "cha"], competences: ["dec", "per"], outil: "tool:art:tinker", don: DONS_SRD.doue,
    langues: langues("goblin"),
    equipement: [[S.dague], [S.outilsBricoleur], [S.vetementsFins], [O("lettre-de-change")], [O("bombe-gobeline"), 2]], or: 5,
    texte: fiche("Vous avez travaillé pour le cartel Gentepression à Baie-du-Butin ou à Cabestan : comptable, démarcheur, ingénieur ou collecteur de dettes. Un contrat vous lie encore, et quelqu'un, quelque part, attend sa commission.", {
      carac: "Dextérité, Intelligence, Charisme", competences: "Tromperie, Persuasion", outil: "outils de bricoleur", don: "Doué (SRD)",
      langues: "gobelin, plus deux au choix", equipement: "dague, outils de bricoleur, vêtements fins, lettre de change, 2 bombes gobelines, 5 po"
    })
  }),
  historique({
    cle: "gardien-cenarien", nom: "Gardien cénarien", img: icone("magic/nature/leaf-oak-wreath-glow-green"),
    carac: ["con", "int", "wis"], competences: ["ani", "nat"], outil: "tool:herb", don: DONS_MAISON.lienSylvestre,
    langues: { choix: [{ nombre: 3, parmi: ["languages:standard:*"] }] },
    equipement: [[S.baton], [S.focaliseurDruidique], [S.herboristerie], [S.couverture], [S.rations, 5]], or: 9,
    texte: fiche("Le Cercle cénarien accueille elfes de la nuit, taurens et quiconque protège l'équilibre de la nature, au-dessus des querelles de faction. Vous avez veillé sur un bosquet de Reflet-de-Lune, du Frêneval ou des Mulgore.", {
      carac: "Constitution, Intelligence, Sagesse", competences: "Dressage, Nature", outil: "matériel d'herboriste", don: "Lien sylvestre",
      langues: "trois au choix (le darnassien ou l'orc selon votre peuple)", equipement: "bâton, focaliseur druidique, matériel d'herboriste, couverture, 5 rations, 9 po"
    })
  }),
  historique({
    cle: "refugie-de-lordaeron", nom: "Réfugié de Lordaeron", img: icone("environment/people/commoner"),
    carac: ["con", "wis", "cha"], competences: ["ins", "sur"], outil: "tool:art:cook", don: DONS_MAISON.coriace,
    langues: LANGUES_ALLIANCE,
    equipement: [[S.dague], [S.couverture], [S.rations, 5], [S.outre], [S.outilsCuisinier]], or: 12,
    texte: fiche("Le royaume de Lordaeron est tombé en un an : grain empoisonné, morts qui se relèvent, prince devenu bourreau. Vous avez fui vers le sud avec ce que vous portiez. Vous ne faites plus confiance aux bannières, seulement aux gens.", {
      carac: "Constitution, Sagesse, Charisme", competences: "Intuition, Survie", outil: "ustensiles de cuisinier", don: "Coriace",
      langues: "commun, plus deux au choix", equipement: "dague, couverture, 5 rations, outre, ustensiles de cuisinier, 12 po"
    })
  }),
  historique({
    cle: "rodeur-de-lune-d-argent", nom: "Rôdeur de Lune-d'argent", img: icone("weapons/bows/", "longbow"),
    carac: ["dex", "con", "wis"], competences: ["ste", "sur"], outil: "tool:art:woodcarver", don: DONS_SRD.vigilant,
    langues: langues("elvish"),
    equipement: [[S.arcLong], [S.carquois], [S.fleches, 20], [S.cuir], [S.outilsSculpteur]], or: 3,
    texte: fiche("Les Pérégrins de Quel'Thalas gardaient les bois des Chants éternels. Le Fléau est passé, et vos frères d'armes sont morts ou partis. Vous traquez désormais les goules dans les bois brûlés autour de Lune-d'argent.", {
      carac: "Dextérité, Constitution, Sagesse", competences: "Discrétion, Survie", outil: "outils de sculpteur sur bois", don: "Vigilant (SRD)",
      langues: "thalassien (elfique), plus deux au choix", equipement: "arc long, carquois, 20 flèches, armure de cuir, outils de sculpteur, 3 po"
    })
  }),
  historique({
    cle: "chasseur-des-mulgore", nom: "Chasseur des Mulgore", img: icone("creatures/mammals/bull-horned-blue"),
    carac: ["str", "dex", "wis"], competences: ["ani", "nat"], outil: "tool:art:leatherworker", don: DONS_MAISON.pisteur,
    langues: LANGUES_HORDE,
    equipement: [[O("lance-de-sombrelance")], [S.javeline, 4], [S.piege], [S.outilsMaroquinier], [S.couverture]], or: 4,
    texte: fiche("Dans les plaines dorées des Mulgore, on ne prend à la terre que ce dont on a besoin, et on remercie l'animal. Vous avez chassé le kodo et le trotteur des plaines, et repoussé les gnolls et les centaures qui menacent les campements.", {
      carac: "Force, Dextérité, Sagesse", competences: "Dressage, Nature", outil: "outils de maroquinier", don: "Pisteur des plaines",
      langues: "orc, plus deux au choix (le taur-ahe s'écrit avec la langue « géant »)", equipement: "lance des Sombrelance, 4 javelines, piège à mâchoires, outils de maroquinier, couverture, 4 po"
    })
  })
];
