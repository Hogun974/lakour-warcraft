// Afflictions d'Azeroth (dnd5e 6.0.6, règles 2024) : blessures persistantes, maladies et corruption gangrenée.
// dnd5e n'a pas de type d'objet « maladie » ni « blessure » (CONFIG.DND5E.featureTypes) : chaque affliction est une
// capacité générique (feat, system.type = { value: "", subtype: "" }), marquée par flags.lakour-warcraft.affliction
// ({ categorie, palier, sauvegarde }) et par system.requirements (« Blessure persistante », « Maladie »…).
// Posée sur une fiche, elle transfère ses effets actifs (malus réels, icône toujours visible sur le jeton) ; la retirer
// guérit. Les maladies portent un effet par stade : le premier actif (avec l'état « malade » de dnd5e), les suivants
// désactivés, à activer par le MJ quand le mal progresse ; une activité de sauvegarde se lance après chaque repos long.
// Les paliers de corruption sont cumulatifs : chacun reprend les effets du précédent et le remplace sur la fiche.
// Textes originaux. Distances en mètres (5 pieds = 1,5 m).
import { icone } from "./aides.mjs";
import { exiger } from "./objets.mjs";
import { capacite, ICONE_TOUJOURS } from "./dons.mjs";

const CATEGORIES = { blessure: "Blessure persistante", maladie: "Maladie", corruption: "Corruption gangrenée" };

function affliction(categorie, d, extra = {}) {
  exiger(CATEGORIES[categorie], `affliction ${d.cle} : catégorie « ${categorie} » inconnue`);
  const exigences = extra.palier ? `${CATEGORIES[categorie]} — palier ${extra.palier}` : CATEGORIES[categorie];
  return capacite("afflictions", d, {
    type: "", sousType: "", exigences,
    drapeaux: { affliction: { categorie, ...extra } }
  });
}

// ======================================================================= Blessures persistantes
// Un effet transféré, permanent, toujours affiché. Guérison : l'objet est retiré de la fiche.

const RESTAURATION = "**Guérison.** Un sort de *Restauration supérieure* ou de *Régénération*, ou les soins d'un maître guérisseur (prêtre de haut rang, druide du Cercle cénarien, chaman de la Terre-Mère), fait disparaître cette blessure.";
const blessure = (cle, nom, img, texte, changements, guerison = RESTAURATION) => affliction("blessure", {
  cle, nom, img, texte: `${texte}\n\n${guerison}`,
  effets: [{ nom, icone: ICONE_TOUJOURS, changements }]
});

const BLESSURES = [
  blessure("oeil-creve", "Œil crevé", icone("skills/wounds/injury-eyes-blood-red.webp"),
    "Une lame, une griffe ou un éclat d'os vous a pris un œil. Vous subissez un malus de **−1** aux jets d'attaque à distance (armes et sorts) et de **−5** à votre Sagesse (Perception) passive. Vous avez le **désavantage** aux tests de Sagesse (Perception) fondés sur la vue (le MJ l'applique).",
    [["system.rolls.attack.rwak.bonus", "-1"], ["system.rolls.attack.rsak.bonus", "-1"], ["system.skills.prc.bonuses.passive", "-5"]]),
  blessure("jambe-boiteuse", "Jambe boiteuse", icone("skills/wounds/bone-broken-knee-beam"),
    "Votre genou s'est mal ressoudé. Toutes vos vitesses diminuent de **3 m**, et vous avez le **désavantage** aux tests de Dextérité (**Acrobaties**).",
    [["system.attributes.movement.bonus", "-3"], ["system.skills.acr.roll.mode", -1]]),
  blessure("cotes-brisees", "Côtes brisées", icone("skills/wounds/injury-body-pain-gray"),
    "Chaque inspiration vous rappelle le coup de masse. Vous avez le **désavantage** aux tests de Force (**Athlétisme**) et aux jets de sauvegarde pour maintenir votre **concentration**.",
    [["system.skills.ath.roll.mode", -1], ["system.attributes.concentration.roll.mode", -1]],
    "**Guérison.** Les côtes se ressoudent après **dix jours** de repos complet (aucun combat, aucun voyage à pied) ; un sort de soins d'au moins le niveau 3 lancé chaque jour réduit ce délai à trois jours."),
  blessure("main-mutilee", "Main mutilée", icone("skills/wounds/injury-hand-blood-red"),
    "Il vous manque deux doigts. Vous avez le **désavantage** aux tests de Dextérité (**Escamotage**) et à tous les tests faits avec des **outils**.",
    [["system.skills.slt.roll.mode", -1], ["system.rolls.ability.tool.mode", -1]]),
  blessure("tympan-creve", "Tympan crevé", icone("commodities/biological/ear-grey-brown"),
    "Une explosion gobeline ou un cri de banshee vous a laissé à moitié sourd. Vous subissez un malus de **−3** à votre Sagesse (Perception) passive et de **−1** à l'**initiative**. Vous avez le **désavantage** aux tests de Sagesse (Perception) fondés sur l'ouïe (le MJ l'applique).",
    [["system.skills.prc.bonuses.passive", "-3"], ["system.attributes.init.roll.bonus", "-1"]]),
  blessure("cicatrice-defigurante", "Cicatrice défigurante", icone("skills/wounds/injury-face-impact-orange"),
    "Une balafre vous traverse le visage. Vous avez le **désavantage** aux tests de Charisme (**Persuasion**), mais l'**avantage** aux tests de Charisme (**Intimidation**).",
    [["system.skills.per.roll.mode", -1], ["system.skills.itm.roll.mode", 1]]),
  blessure("crane-fele", "Crâne fêlé", icone("skills/wounds/anatomy-organ-brain-pink-red"),
    "Depuis ce coup à la tête, les maux de crâne ne vous quittent plus. Vous avez le **désavantage** aux tests d'**Intelligence**, et un malus de **−2** aux jets de sauvegarde pour maintenir votre **concentration**.",
    [["system.abilities.int.check.roll.mode", -1], ["system.attributes.concentration.roll.bonus", "-2"]]),
  blessure("bras-mal-ressoude", "Bras mal ressoudé", icone("skills/wounds/bone-broken-marrow-red"),
    "L'os a repris de travers. Vous subissez un malus de **−1** aux jets d'attaque au corps à corps avec une arme, et vous avez le **désavantage** aux tests de **Force**.",
    [["system.rolls.attack.mwak.bonus", "-1"], ["system.abilities.str.check.roll.mode", -1]])
];

// ======================================================================= Maladies
// m = { cle, nom, img, carac, dd, texte (contagion, incubation), stades: [{ nom, texte, changements }], guerison }

function maladie(m) {
  exiger(m.stades?.length >= 2, `maladie ${m.cle} : au moins deux stades`);
  const stades = m.stades.map((s, i) => `- **Stade ${i + 1} — ${s.nom}.** ${s.texte}`).join("\n");
  const carac = { con: "Constitution", wis: "Sagesse" }[m.carac];
  exiger(carac, `maladie ${m.cle} : caractéristique de sauvegarde « ${m.carac} » inattendue`);
  const texte = [
    m.texte,
    `**Évolution.** À la fin de chaque **repos long**, la créature malade fait un jet de sauvegarde de **${carac} DD ${m.dd}**. Après **trois échecs** (cumulés), la maladie passe au stade suivant : le MJ active l'effet de ce stade sur la fiche (les effets des stades précédents restent actifs). Après **trois réussites** (cumulées), la créature guérit et l'objet est retiré.`,
    stades,
    m.guerison
  ].join("\n\n");
  return affliction("maladie", {
    cle: m.cle, nom: m.nom, img: m.img, texte,
    effets: m.stades.map((s, i) => ({
      nom: `${m.nom} — stade ${i + 1} : ${s.nom}`, icone: ICONE_TOUJOURS, desactive: i > 0,
      etats: i === 0 ? ["diseased"] : [], texte: s.texte, changements: s.changements
    })),
    activites: [{ type: "save", nom: "Lutter contre la maladie", activation: "longRest", portee: ["", "self"], cible: ["", "self"], sauvegarde: { carac: [m.carac], dd: m.dd, reussite: "none" } }]
  }, { sauvegarde: { carac: m.carac, dd: m.dd }, stades: m.stades.length });
}

const RESTAURATION_PARTIELLE = "**Remèdes.** Un sort de *Restauration partielle* (ou toute magie qui met fin à une maladie) guérit la créature.";

const MALADIES = [
  maladie({
    cle: "peste-du-fleau", nom: "Peste du Fléau", img: icone("skills/wounds/illness-disease-glowing-green"), carac: "con", dd: 15,
    texte: "La peste que le Culte des Damnés a semée dans le grain de Lordaeron. On l'attrape en mangeant du grain contaminé, ou par la morsure d'une goule ou d'un zombie du Fléau (jet de sauvegarde de Constitution DD 15 pour l'éviter). Incubation : **1d4 jours**.",
    stades: [
      { nom: "Fièvre grise", texte: "Fièvre, peau cendreuse. Désavantage aux tests de **Force** et de **Constitution**.", changements: [["system.abilities.str.check.roll.mode", -1], ["system.abilities.con.check.roll.mode", -1]] },
      { nom: "Chair qui se nécrose", texte: "La peau se marbre de noir. Désavantage aux jets de sauvegarde de **Constitution**, et les points de vie maximum diminuent de **1 par niveau**.", changements: [["system.abilities.con.save.roll.mode", -1], ["system.attributes.hp.bonuses.level", "-1"]] },
      { nom: "Dernier souffle", texte: "Le malade ne tient plus debout. Toutes ses vitesses diminuent de **3 m** et il a le désavantage aux **jets de sauvegarde contre la mort**. S'il meurt, il se relève en zombie du Fléau **1d4 heures** plus tard, à moins que son corps ne soit brûlé ou béni.", changements: [["system.attributes.movement.bonus", "-3"], ["system.attributes.death.roll.mode", -1]] }
    ],
    guerison: `${RESTAURATION_PARTIELLE} Au stade 3, seule une *Restauration supérieure* suffit.`
  }),
  maladie({
    cle: "fievre-des-marais", nom: "Fièvre des marais", img: icone("skills/wounds/blood-cells-disease-green"), carac: "con", dd: 12,
    texte: "Les moustiques du marécage d'Âprefange et des Paluns transmettent cette fièvre à quiconque y dort sans moustiquaire (jet de sauvegarde de Constitution DD 12 par nuit passée dans le marais). Incubation : **2 jours**.",
    stades: [
      { nom: "Frissons", texte: "Sueurs froides et tremblements. Malus de **−2** à l'**initiative**.", changements: [["system.attributes.init.roll.bonus", "-2"]] },
      { nom: "Délire", texte: "Le malade voit des choses qui ne sont pas là. Désavantage aux tests de Sagesse (**Perception**) et aux jets de sauvegarde pour maintenir sa **concentration**.", changements: [["system.skills.prc.roll.mode", -1], ["system.attributes.concentration.roll.mode", -1]] }
    ],
    guerison: `${RESTAURATION_PARTIELLE} Une tisane d'écorce de saule des marais (test d'Intelligence (Médecine) DD 12 avec le matériel d'herboriste) donne l'avantage au prochain jet contre la fièvre.`
  }),
  maladie({
    cle: "toux-noire", nom: "Toux noire", img: icone("svg/biohazard"), carac: "con", dd: 13,
    texte: "La poussière des mines de Rochenoire et des galeries de Forgefer se dépose dans les poumons de ceux qui y travaillent sans masque (jet de sauvegarde de Constitution DD 13 par semaine passée sous terre). Incubation : **une semaine**.",
    stades: [
      { nom: "Souffle court", texte: "Une toux sèche ponctue chaque effort. Désavantage aux tests de Force (**Athlétisme**).", changements: [["system.skills.ath.roll.mode", -1]] },
      { nom: "Poumons de cendre", texte: "Le malade crache noir. Toutes ses vitesses diminuent de **1,5 m**, et il a le désavantage aux jets de sauvegarde de **Constitution**.", changements: [["system.attributes.movement.bonus", "-1.5"], ["system.abilities.con.save.roll.mode", -1]] }
    ],
    guerison: `${RESTAURATION_PARTIELLE} Un mois au grand air sans descendre sous terre compte comme trois réussites.`
  }),
  maladie({
    cle: "fievre-du-cauchemar", nom: "Fièvre du Cauchemar", img: icone("magic/perception/eye-tendrils-web-purple"), carac: "wis", dd: 14,
    texte: "Une ombre du Cauchemar d'émeraude s'insinue dans les rêves de ceux qui dorment près d'un portail corrompu ou d'un arbre malade (jet de sauvegarde de Sagesse DD 14 par nuit). Les elfes de la nuit et les druides y sont aussi sensibles que les autres. Incubation : **une nuit**.",
    stades: [
      { nom: "Sommeil agité", texte: "Le malade se réveille épuisé de rêves qu'il ne raconte pas. Désavantage aux jets de sauvegarde de **Sagesse**.", changements: [["system.abilities.wis.save.roll.mode", -1]] },
      { nom: "Veille hantée", texte: "Le Cauchemar le suit jusque dans l'éveil. Désavantage aux tests de Sagesse (**Intuition**), malus de **−5** à la Perception passive et désavantage aux jets de sauvegarde d'**Intelligence**.", changements: [["system.skills.ins.roll.mode", -1], ["system.skills.prc.bonuses.passive", "-5"], ["system.abilities.int.save.roll.mode", -1]] }
    ],
    guerison: "**Remèdes.** La maladie est magique : *Restauration partielle* ne fait que repousser l'évolution d'une semaine. Un sort de *Dissipation du mal et du bien*, ou une nuit de veille dans un bosquet consacré par un druide, la guérit."
  }),
  maladie({
    cle: "mal-de-gnomeregan", nom: "Mal de Gnomeregan", img: icone("svg/hazard"), carac: "con", dd: 13,
    texte: "Les radiations libérées dans Gnomeregan rongent quiconque s'attarde dans ses salles inondées de vase toxique (jet de sauvegarde de Constitution DD 13 par heure passée dans une zone irradiée). Incubation : **1d6 heures**.",
    stades: [
      { nom: "Nausées", texte: "Vomissements et vertiges. Les points de vie maximum diminuent de **1 par niveau**.", changements: [["system.attributes.hp.bonuses.level", "-1"]] },
      { nom: "Cheveux qui tombent", texte: "Les mains tremblent, la peau pèle. Désavantage aux tests et aux jets de sauvegarde de **Dextérité**.", changements: [["system.abilities.dex.check.roll.mode", -1], ["system.abilities.dex.save.roll.mode", -1]] }
    ],
    guerison: `${RESTAURATION_PARTIELLE} Les ingénieurs gnomes d'Ironforge vendent un sirop « décontaminant » (25 po) qui donne l'avantage au prochain jet.`
  })
];

// ======================================================================= Corruption gangrenée (quatre paliers)
// Chaque palier reprend les changements du précédent (cumulatif) : on le pose à la place du précédent.

const MURMURES = [["system.skills.itm.roll.mode", 1], ["system.skills.ins.roll.mode", -1]];
const MARQUE = [...MURMURES, ["system.traits.dr.value", "fire"], ["system.abilities.wis.save.roll.mode", -1]];
const CHAIR = [...MARQUE, ["system.traits.dv.value", "radiant"], ["system.attributes.senses.ranges.darkvision", 18, "upgrade"], ["system.attributes.hp.bonuses.level", "-1"]];
const SEUIL = [...CHAIR, ["system.traits.ci.value", "frightened"], ["system.abilities.cha.save.roll.mode", -1]];

const APPEL = "**Résister à l'appel.** Chaque fois que vous puisez dans la gangrène, ou que le MJ vous expose au gangrefeu (rituel démoniaque, cristal gangrené, sang de démon bu), faites un jet de sauvegarde de **Sagesse** contre le DD du palier. En cas d'échec, le MJ note un pas de corruption ; au troisième pas, vous passez au palier suivant.";
const ENLEVER = "**Purification.** Un rituel des naaru, l'eau d'un puits sacré ou une *Restauration supérieure* lancée par un prêtre ou un paladin d'au moins le niveau 9 vous fait redescendre d'un palier (une fois par mois).";

function palier(n, cle, nom, img, dd, texte, changements, puiser) {
  return affliction("corruption", {
    cle, nom, img, texte: [texte, puiser ? `**Puiser dans la gangrène.** Par une **action bonus**, vous gagnez **${puiser.texte}** points de vie temporaires. Nombre d'utilisations : ${puiser.usages} par repos long.` : "", APPEL, ENLEVER].filter(Boolean).join("\n\n"),
    utilisations: puiser ? { max: puiser.max, periode: "lr" } : undefined,
    effets: [{ nom, icone: ICONE_TOUJOURS, etats: n === 4 ? ["cursed"] : [], changements }],
    activites: [
      { type: "save", nom: "Résister à l'appel", activation: "special", consomme: false, portee: ["", "self"], cible: ["", "self"], sauvegarde: { carac: ["wis"], dd, reussite: "none" } },
      ...(puiser ? [{ type: "heal", nom: "Puiser dans la gangrène", activation: "bonus", soin: { des: puiser.des, bonus: "@prof", type: "temphp" } }] : [])
    ]
  }, { palier: n, sauvegarde: { carac: "wis", dd } });
}

const CORRUPTION = [
  palier(1, "corruption-palier-1", "Murmures gangrenés", icone("magic/unholy/orb-smoking-green"), 12,
    "Une voix douce vous promet la force. Vos yeux s'allument parfois d'un éclat vert. Vous avez l'**avantage** aux tests de Charisme (**Intimidation**), mais le **désavantage** aux tests de Sagesse (**Intuition**) : vous soupçonnez tout le monde.",
    MURMURES, null),
  palier(2, "corruption-palier-2", "Marque gangrenée", icone("magic/unholy/hand-claw-fog-green"), 14,
    "Une rune verte brûle sous votre peau. En plus des effets des Murmures, vous avez la **résistance aux dégâts de feu** et le **désavantage** aux jets de sauvegarde de **Sagesse**.",
    MARQUE, { texte: "1d6 + votre bonus de maîtrise", des: "1d6", max: 1, usages: "une" }),
  palier(3, "corruption-palier-3", "Chair corrompue", icone("magic/unholy/beam-impact-green"), 16,
    "Des cornes naissantes, des ongles noircis, une chaleur qui ne vous quitte plus. En plus des effets précédents, vous gagnez la **vision dans le noir** sur **18 m**, vous êtes **vulnérable aux dégâts radiants**, et vos points de vie maximum diminuent de **1 par niveau**.",
    CHAIR, { texte: "2d6 + votre bonus de maîtrise", des: "2d6", max: 2, usages: "deux" }),
  palier(4, "corruption-palier-4", "Au seuil de la Légion", icone("magic/unholy/silhouette-robe-evil-glow"), 18,
    "Les démons vous reconnaissent comme l'un des leurs. En plus des effets précédents, vous ne pouvez plus être **effrayé**, mais vous avez le **désavantage** aux jets de sauvegarde de **Charisme**. Sur un 1 naturel à un jet d'attaque, le MJ peut décider de votre prochaine action.",
    SEUIL, { texte: "3d6 + votre bonus de maîtrise", des: "3d6", max: 3, usages: "trois" })
];

// Toutes les afflictions du module (compendium « afflictions »).
export const AFFLICTIONS = [...BLESSURES, ...MALADIES, ...CORRUPTION];
