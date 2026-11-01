// Dons maison d'Azeroth (dnd5e 6.0.6, règles 2024), hors dons d'origine des historiques (historiques.mjs) :
// dons d'origine, dons généraux (niveau 4+, avec +1 à une caractéristique), styles de combat et faveurs épiques
// (niveau 19+, caractéristique jusqu'à 30). Type d'objet « feat », system.type = { value: "feat", subtype } avec un
// sous-type de CONFIG.DND5E.featureTypes.feat.subtypes (general, origin, fightingStyle, epicBoon).
// Ce qui s'automatise passe par des effets actifs (forme Foundry 14 : system.changes avec type et phase) sur des clés
// vérifiées dans le modèle CharacterData de dnd5e 6.0.6, par des activités et par des avancements (maîtrises, +1 de
// caractéristique). Le reste est écrit en clair et justifié dans DONS_EN_TEXTE (rien d'automatisé) ou DONS_EN_PARTIE
// (ce que le MJ applique encore). Le constructeur `capacite` sert aussi aux afflictions (afflictions.mjs).
// Textes originaux. Toutes les distances sont en mètres (5 pieds = 1,5 m).
import { MODULE, STATS, identifiant, icone, html } from "./aides.mjs";
import { don, exiger, CARACTERISTIQUES, COMPETENCES, DOMMAGES } from "./objets.mjs";

// ---------- Clés de dnd5e vérifiées par le constructeur (et, indépendamment, par les essais)

// CONFIG.DND5E.conditionTypes : états qu'un effet peut porter (statuses) ou dont il immunise (traits.ci).
export const ETATS_DND5E = ["bleeding", "blinded", "burning", "charmed", "cursed", "dehydration", "deafened", "diseased", "exhaustion",
  "falling", "frightened", "grappled", "incapacitated", "invisible", "malnutrition", "paralyzed", "petrified", "poisoned", "prone",
  "restrained", "silenced", "stunned", "suffocation", "surprised", "transformed", "unconscious"];
// CONFIG.DND5E.difficultTerrainTypes, CONFIG.DND5E.senses, CONFIG.DND5E.movementTypes (jump est calculé, pas modifiable).
const TERRAINS = ["ice", "liquid", "plants", "rocks", "mud", "sand", "slope", "snow", "web"];
const SENS = ["blindsight", "darkvision", "tremorsense", "truesight"];
const VITESSES = ["walk", "burrow", "climb", "fly", "swim"];
const ATTAQUES = ["mwak", "rwak", "msak", "rsak"];
// Foundry 14 : CONST.ACTIVE_EFFECT_CHANGE_TYPES, ACTIVE_EFFECT_DURATION_UNITS, ACTIVE_EFFECT_EXPIRY_EVENTS ;
// dnd5e ajoute les fins « pseudo » (début ou fin du tour de la source ou de la cible), sans durée chiffrée.
const TYPES_CHANGEMENT = ["add", "subtract", "multiply", "upgrade", "downgrade", "override"];
const UNITES_DUREE = ["years", "months", "days", "hours", "minutes", "seconds", "rounds", "turns"];
const FINS = ["combatStart", "roundStart", "turnStart", "combatEnd", "roundEnd", "turnEnd"];
const FINS_PSEUDO = ["sourceStart", "sourceEnd", "targetStart", "targetEnd"];
// CONST.ACTIVE_EFFECT_SHOW_ICON : 0 jamais, 1 si l'effet est temporaire, 2 toujours.
export const ICONE_TOUJOURS = 2;

// Nature de chaque clé d'effet admise, relevée dans le schéma de dnd5e 6.0.6 : abilities.*.check|save sont des
// RollConfigField (roll = D20RollModificationField : bonus, mode), skills.* aussi (+ bonuses.passive, value),
// attributes.init|concentration|death des RollConfigField, rolls.* les champs de CreatureTemplate (les anciennes clés
// bonuses.mwak.attack… sont des « shims » redirigés vers rolls.*), movement.speeds et senses.ranges des MappingField
// (movement.walk et senses.darkvision sont aussi des shims), traits.dr|di|dv|ci des SetField.
const alt = liste => liste.join("|");
export const NATURES_DE_CLE = [
  [`system\\.abilities\\.(${alt(CARACTERISTIQUES)})\\.(check|save)\\.roll\\.mode`, "avantage"],
  [`system\\.abilities\\.(${alt(CARACTERISTIQUES)})\\.(check|save)\\.roll\\.bonus`, "formule"],
  [`system\\.skills\\.(${alt(COMPETENCES)})\\.roll\\.mode`, "avantage"],
  [`system\\.skills\\.(${alt(COMPETENCES)})\\.roll\\.bonus`, "formule"],
  [`system\\.skills\\.(${alt(COMPETENCES)})\\.bonuses\\.passive`, "formule"],
  [`system\\.skills\\.(${alt(COMPETENCES)})\\.value`, "maitrise"],
  ["system\\.attributes\\.(init|concentration|death)\\.roll\\.mode", "avantage"],
  ["system\\.attributes\\.(init|concentration|death)\\.roll\\.bonus", "formule"],
  ["system\\.attributes\\.ac\\.bonus", "formule"],
  ["system\\.attributes\\.hp\\.bonuses\\.(level|overall)", "formule"],
  ["system\\.attributes\\.movement\\.bonus", "distance"],
  [`system\\.attributes\\.movement\\.speeds\\.(${alt(VITESSES)})`, "distance"],
  ["system\\.attributes\\.movement\\.ignoredDifficultTerrain", "terrain"],
  [`system\\.attributes\\.senses\\.ranges\\.(${alt(SENS)})`, "portee"],
  ["system\\.traits\\.(dr|di|dv)\\.value", "dommage"],
  ["system\\.traits\\.ci\\.value", "etat"],
  [`system\\.rolls\\.attack(\\.(${alt(ATTAQUES)}))?\\.mode`, "avantage"],
  [`system\\.rolls\\.attack(\\.(${alt(ATTAQUES)}))?\\.bonus`, "formule"],
  [`system\\.rolls\\.damage\\.(${alt(ATTAQUES)})\\.bonus`, "formule"],
  ["system\\.rolls\\.ability\\.(check|save|skill|tool)\\.mode", "avantage"],
  ["system\\.rolls\\.ability\\.(check|save|skill|tool)\\.bonus", "formule"]
].map(([motif, nature]) => [new RegExp(`^${motif}$`), nature]);

const casesEntieres = m => Math.abs(m / 1.5 - Math.round(m / 1.5)) < 1e-9;
const FORMULE = /^[-+]?\s*(\d|@|\()[\w@.()+\-*/\s]*$/;
// Règles par nature : modes admis et valeur attendue. AdvantageModeField compte +1 (avantage) et -1 (désavantage)
// en « add » ; FormulaField concatène en « add » (« -2 » devient « … - 2 ») ; les SetField ajoutent l'élément.
const NATURES = {
  avantage: { types: ["add", "override"], valeur: (v, t) => (t === "add" ? [1, -1] : [1, 0, -1]).includes(v) },
  formule: { types: ["add", "subtract", "upgrade", "downgrade", "override"], valeur: v => Number.isFinite(v) || (typeof v === "string" && FORMULE.test(v)) },
  distance: { types: ["add", "subtract", "upgrade", "override"], valeur: v => Number.isFinite(Number(v)) && v !== "" && casesEntieres(Number(v)) },
  portee: { types: ["upgrade", "override"], valeur: v => Number.isFinite(v) && v > 0 && casesEntieres(v) },
  maitrise: { types: ["upgrade", "override"], valeur: v => [0.5, 1, 2].includes(v) },
  terrain: { types: ["add"], valeur: v => TERRAINS.includes(v) },
  dommage: { types: ["add"], valeur: v => DOMMAGES.includes(v) },
  etat: { types: ["add"], valeur: v => ETATS_DND5E.includes(v) }
};
export const natureDe = cle => NATURES_DE_CLE.find(([motif]) => motif.test(cle))?.[1] ?? null;

function changement([key, value, type = "add"], ou) {
  exiger(TYPES_CHANGEMENT.includes(type), `${ou} : type de changement « ${type} » inconnu de Foundry 14`);
  const nature = natureDe(key);
  exiger(nature, `${ou} : clé d'effet « ${key} » absente du modèle de personnage de dnd5e 6.0.6`);
  exiger(NATURES[nature].types.includes(type), `${ou} : « ${type} » ne convient pas à ${key} (${nature})`);
  exiger(NATURES[nature].valeur(value, type), `${ou} : valeur « ${value} » invalide pour ${key} (${nature})`);
  return { key, type, value, phase: "initial", priority: null };
}

// ---------- Effet actif V2 (Foundry 14) : durée { value, units, expiry }, états, icône, activation différée.
// e = { nom, changements: [[cle, valeur, type]], etats, transfert = true, desactive = false, texte, img,
//       duree: [valeur, unités, fin = "turnStart"] ou [null, null, fin pseudo de dnd5e], icone (0, 1 ou 2) }
function effetV2(e, { _id, _key }, img, ou) {
  exiger(e?.nom, `${ou} : effet sans nom`);
  const lieu = `${ou} / ${e.nom}`;
  for (const s of e.etats ?? []) exiger(ETATS_DND5E.includes(s), `${lieu} : état « ${s} » inconnu de dnd5e`);
  const changes = (e.changements ?? []).map(c => changement(c, lieu));
  exiger(changes.length || e.etats?.length, `${lieu} : effet sans changement ni état`);
  let duration = { value: null, units: "seconds", expiry: null, expired: false };
  if (e.duree) {
    const [valeur, unites, fin = "turnStart"] = e.duree;
    if (FINS_PSEUDO.includes(fin)) duration = { value: null, units: "seconds", expiry: fin, expired: false };
    else {
      exiger(Number.isInteger(valeur) && valeur > 0, `${lieu} : durée « ${valeur} » invalide`);
      exiger(UNITES_DUREE.includes(unites), `${lieu} : unité de durée « ${unites} » inconnue de Foundry 14`);
      exiger(FINS.includes(fin), `${lieu} : fin d'effet « ${fin} » inconnue`);
      duration = { value: valeur, units: unites, expiry: fin, expired: false };
    }
  }
  exiger([0, 1, 2].includes(e.icone ?? 1), `${lieu} : affichage d'icône « ${e.icone} » invalide`);
  return {
    _id, _key, name: e.nom, img: e.img ?? img, type: "base", system: { changes },
    disabled: e.desactive ?? false, start: null, duration, description: html(e.texte ?? ""), origin: null, tint: "#ffffff",
    transfer: e.transfert ?? true, statuses: e.etats ?? [], showIcon: e.icone ?? 1, folder: null, sort: 0, flags: {}, _stats: STATS
  };
}

// ---------- Avancement « +1 à une caractéristique » des dons généraux et des faveurs épiques (forme du SRD 2024).
function plusUn(ou, carac, max) {
  for (const c of carac) exiger(CARACTERISTIQUES.includes(c), `${ou} : caractéristique « ${c} » inconnue`);
  const _id = identifiant(`${ou}:asi`);
  return [_id, {
    _id, type: "AbilityScoreImprovement", level: 0, flags: {}, value: {},
    configuration: {
      cap: 1, points: 1, max: max ?? null, recommendation: null,
      fixed: Object.fromEntries(CARACTERISTIQUES.map(c => [c, 0])), locked: CARACTERISTIQUES.filter(c => !carac.includes(c))
    },
    title: "Amélioration de caractéristique", hint: `+1 à une caractéristique parmi celles proposées (${max ?? 20} au plus).`
  }];
}

// ---------- Constructeur commun aux dons et aux afflictions (objet « feat »).
// Le constructeur `don` d'objets.mjs fournit la description, la source, les usages, les activités et les avancements
// (maîtrises, sorts) ; il nomme tout « historiques:… » : on renomme ici chacun de ses identifiants dérivés vers
// « pack:… », puis on pose le type, les prérequis et les effets V2 (clés vérifiées).
// d = { cle, nom, texte, img, utilisations, activites, maitrises, sorts, effets: [voir effetV2] }
// o = { type, sousType, niveau, exigences, carac (+1 parmi), max (plafond du +1), drapeaux }
export function capacite(pack, d, o = {}) {
  exiger(/^[a-z][a-z0-9-]*$/.test(pack), `pack invalide : « ${pack} »`);
  const ou = `${pack}:${d.cle}`;
  const ancien = `historiques:${d.cle}`;
  const brut = don({ ...d, effets: (d.effets ?? []).map(e => ({ nom: e?.nom ?? "?", transfert: e?.transfert ?? true })), categorie: o.sousType ?? "" });
  const derives = ["",
    ...(d.effets ?? []).map((_, i) => `:effet:${i}`),
    ...(d.activites ?? []).map((_, i) => `:activite:${i}`),
    ...Object.keys(brut.system.advancement).map((_, n) => `:avancement:${n}`)];
  let json = JSON.stringify(brut);
  for (const s of derives) json = json.replaceAll(identifiant(`${ancien}${s}`), identifiant(`${ou}${s}`));
  for (const s of derives) exiger(!json.includes(identifiant(`${ancien}${s}`)), `${ou} : identifiant « historiques » resté`);
  const doc = JSON.parse(json);
  doc.__pack = pack;
  doc.__cle = ou;
  doc.system.type = { value: o.type ?? "feat", subtype: o.sousType ?? "" };
  doc.system.requirements = o.exigences ?? "";
  doc.system.prerequisites = { level: o.niveau ?? null, repeatable: false, items: [] };
  if (o.carac) {
    const [id, asi] = plusUn(ou, o.carac, o.max);
    doc.system.advancement[id] = asi;
  }
  doc.effects = doc.effects.map((e, i) => effetV2(d.effets[i], e, d.img, ou));
  doc.flags[MODULE] = { cle: d.cle, ...(o.drapeaux ?? {}) };
  return doc;
}

// ---------- Dons : catégories 2024 et rédaction commune (prérequis et +1 en tête, comme les dons du SRD).

const NOMS_CARAC = { str: "Force", dex: "Dextérité", con: "Constitution", int: "Intelligence", wis: "Sagesse", cha: "Charisme" };
const ou_ = liste => (liste.length === 1 ? liste[0] : `${liste.slice(0, -1).join(", ")} ou ${liste.at(-1)}`);
export const CATEGORIES = {
  origin: { niveau: null, exigences: [] },
  general: { niveau: 4, exigences: ["Niveau 4 ou plus"] },
  fightingStyle: { niveau: null, exigences: ["Capacité Style de combat"] },
  epicBoon: { niveau: 19, exigences: ["Niveau 19 ou plus"] }
};

// Dons automatisés en partie : ce que le MJ applique encore (le reste est porté par les effets et activités).
export const DONS_EN_PARTIE = {
  "rescape-du-fleau": "L'avantage contre les maladies : le système ne distingue pas un jet de sauvegarde contre une maladie d'un autre.",
  "veteran-des-terres-ingrates": "L'avantage contre l'épuisement dû à la chaleur, à la soif ou à la marche forcée : origine du jet arbitrée par le MJ.",
  "chasseur-de-demons-de-fortune": "L'avantage pour démasquer un démon : nature de la cible connue du seul MJ.",
  "mage-de-bataille-du-kirin-tor": "Les composantes somatiques mains pleines : permission, aucun champ du système.",
  "cavalier-des-steppes": "L'avantage monté contre plus petit que la monture et la protection de la monture : position arbitrée par le MJ.",
  "artilleur-de-forgefer": "Ignorer le Chargement des armes à feu : économie d'actions, aucun champ d'acteur."
};
// Dons laissés en texte : pourquoi aucune automatisation fidèle n'est possible dans dnd5e 6.0.6.
export const DONS_EN_TEXTE = {
  "marchandeur-du-cartel": "Prix et rumeurs de marché : économie de jeu arbitrée par le MJ, aucune clé d'acteur ne porte un rabais.",
  "agent-du-si-7": "Se cacher par une action bonus dans la pénombre et savoir qu'on est observé : économie d'actions et lumière, hors du modèle d'acteur.",
  "gardien-du-totem": "Imposer le désavantage à l'attaque d'un autre contre un allié : modification du jet de l'attaquant, qu'aucun effet du défenseur ne porte."
};

function donMaison(categorie, d) {
  const cat = CATEGORIES[categorie];
  exiger(cat, `don ${d.cle} : catégorie « ${categorie} » inconnue de dnd5e (featureTypes.feat.subtypes)`);
  const exigences = [...cat.exigences, ...(d.exigences ? [d.exigences] : [])].join(", ");
  const entete = [
    exigences ? `*Prérequis : ${exigences}.*` : "",
    d.carac ? `**Amélioration de caractéristique.** Augmentez votre ${ou_(d.carac.map(c => NOMS_CARAC[c]))} de 1, jusqu'à un maximum de ${categorie === "epicBoon" ? 30 : 20}.` : ""
  ].filter(Boolean);
  const automatisation = DONS_EN_TEXTE[d.cle] ? "texte" : DONS_EN_PARTIE[d.cle] ? "partielle" : "complete";
  return capacite("dons", { ...d, texte: [...entete, d.texte].join("\n\n") }, {
    type: "feat", sousType: categorie, niveau: cat.niveau, exigences, carac: d.carac, max: categorie === "epicBoon" ? 30 : null,
    drapeaux: { automatisation }
  });
}
const origine = d => donMaison("origin", d);
const general = d => donMaison("general", d);
const style = d => donMaison("fightingStyle", d);
const epique = d => donMaison("epicBoon", { carac: [...CARACTERISTIQUES], ...d });

const BM_PAR_REPOS_LONG = { max: "@prof", periode: "lr" };

// ======================================================================= Dons d'origine

const DONS_ORIGINE = [
  origine({
    cle: "bricoleur-gobelin", nom: "Bricoleur gobelin", img: icone("skills/ranged/bomb-grenade-thrown-orange"),
    texte: "Ça marche une fois sur deux, et l'autre fois, ça fait encore plus de bruit. Vous maîtrisez les **outils de bricoleur**.\n\n**Gadget instable.** Par une **action**, vous lancez un engin bricolé en un point situé à 9 m au plus. Chaque créature dans un rayon de 1,5 m autour de ce point fait un jet de sauvegarde de **Dextérité** (DD 8 + votre modificateur d'Intelligence + votre bonus de maîtrise) : elle subit **2d6 dégâts de feu** en cas d'échec, la moitié en cas de réussite. Une utilisation par **repos court** ; assembler l'engin suppose d'avoir vos outils.",
    maitrises: { accordees: ["tool:art:tinker"] },
    utilisations: { max: 1, periode: "sr" },
    activites: [{ type: "save", nom: "Lancer le gadget", portee: [9, "m"], gabarit: ["radius", 1.5], cible: ["", "creature"], sauvegarde: { carac: ["dex"], dd: "int", reussite: "half" }, degats: [{ des: "2d6", types: ["fire"] }] }]
  }),
  origine({
    cle: "lien-avec-un-loa", nom: "Lien avec un loa", img: icone("magic/perception/mask-stone-eyes-orange"),
    texte: "Un esprit ancien de la jungle a posé les yeux sur vous : Bwonsamdi, Hir'eek, Shirvallah ou un loa plus obscur. Vous maîtrisez **Médecine**, **Nature** ou **Religion** (au choix).\n\n**Invoquer le loa.** Par une **action bonus**, vous appelez votre loa pendant **1 minute** : vous avez l'avantage aux jets de sauvegarde de **Sagesse** et de **Charisme**. Une utilisation par **repos long**. Le loa attend une offrande en retour, et le MJ sait s'en souvenir.",
    maitrises: { choix: [{ parmi: ["skills:med", "skills:nat", "skills:rel"] }] },
    utilisations: { max: 1, periode: "lr" },
    effets: [{
      nom: "Regard du loa", transfert: false, duree: [1, "minutes"], texte: "Avantage aux jets de sauvegarde de Sagesse et de Charisme.",
      changements: [["system.abilities.wis.save.roll.mode", 1], ["system.abilities.cha.save.roll.mode", 1]]
    }],
    activites: [{ type: "utility", nom: "Invoquer le loa", activation: "bonus", duree: [1, "minute"], effets: [0] }]
  }),
  origine({
    cle: "cuisinier-de-campagne", nom: "Cuisinier de campagne", img: icone("consumables/food/bowl-stew-brown"),
    texte: "Un ragoût de sanglier des Carmines vaut mieux qu'un sermon. Vous maîtrisez les **ustensiles de cuisinier**.\n\n**Ragoût réconfortant.** À la fin d'un **repos court** où vous avez cuisiné, chaque créature de votre choix qui a partagé le repas récupère **1d8 + votre bonus de maîtrise** points de vie. Une utilisation par **repos long**.",
    maitrises: { accordees: ["tool:art:cook"] },
    utilisations: { max: 1, periode: "lr" },
    activites: [{ type: "heal", nom: "Servir le ragoût", activation: "shortRest", portee: [9, "m"], cible: ["", "ally"], soin: { des: "1d8", bonus: "@prof" } }]
  }),
  origine({
    cle: "rescape-du-fleau", nom: "Rescapé du Fléau", img: icone("magic/death/grave-tombstone-glow-teal"),
    texte: "Vous avez mangé du grain de Stratholme, ou vu tomber les vôtres, et vous êtes encore là. Vous ajoutez **1d4** à vos **jets de sauvegarde contre la mort**, et vous avez l'avantage aux jets de sauvegarde contre les **maladies**.",
    effets: [{ nom: "Rescapé du Fléau", changements: [["system.attributes.death.roll.bonus", "1d4"]] }]
  }),
  origine({
    cle: "marchandeur-du-cartel", nom: "Marchandeur du Cartel", img: icone("commodities/currency/coins-plain-pouch-gold"),
    texte: "Baie-du-Butin vous a appris que tout se négocie, surtout ce qui ne se vend pas. Quand vous achetez ou vendez dans une ville où un cartel gobelin a un comptoir, vous obtenez **10 %** de mieux que le prix courant. Une fois par jour, en une heure passée au marché, vous apprenez une rumeur commerciale vraie (une cargaison attendue, une pénurie, un acheteur discret) : le MJ vous la donne."
  })
];

// ======================================================================= Dons généraux (niveau 4+)

const DONS_GENERAUX = [
  general({
    cle: "veteran-des-terres-ingrates", nom: "Vétéran des Terres ingrates", img: icone("magic/fire/flame-burning-earth-orange"), carac: ["con", "wis"],
    texte: "Vous avez traversé les Terres ingrates, Tanaris ou les Désolations sans y laisser votre peau. Vous maîtrisez **Survie**, votre **vitesse augmente de 1,5 m**, et vous avez l'avantage aux jets de sauvegarde contre l'**épuisement** causé par la chaleur, la soif ou une marche forcée.",
    effets: [{ nom: "Vétéran des Terres ingrates", changements: [["system.skills.sur.value", 1, "upgrade"], ["system.attributes.movement.bonus", "1.5"]] }]
  }),
  general({
    cle: "chasseur-de-demons-de-fortune", nom: "Chasseur de démons de fortune", img: icone("magic/unholy/hand-claw-fire-green"), carac: ["dex", "wis"],
    texte: "Pas d'yeux sacrifiés ni de tatouages gangrenés : juste des années à traquer les rejetons de la Légion avec ce qu'on avait sous la main. Vous avez la **résistance aux dégâts de feu**, et l'avantage aux tests de Sagesse (Intuition ou Perception) pour démasquer un démon déguisé ou possédant quelqu'un.\n\n**Marque du traqueur.** Par une **action bonus**, vous désignez une créature que vous voyez à 18 m au plus : pendant 1 minute, vos attaques avec une arme contre elle infligent **1d6** dégâts de force supplémentaires (une fois par tour). Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    effets: [{ nom: "Chasseur de démons", changements: [["system.traits.dr.value", "fire"]] }],
    utilisations: BM_PAR_REPOS_LONG,
    activites: [
      { type: "utility", nom: "Marquer la proie", activation: "bonus", duree: [1, "minute"], portee: [18, "m"], cible: ["1", "creature"] },
      { type: "damage", nom: "Frapper la proie", activation: "", condition: "Une fois par tour, après une attaque avec une arme réussie contre la créature marquée", consomme: false, degats: [{ des: "1d6", types: ["force"] }] }
    ]
  }),
  general({
    cle: "hurlement-de-guerre-orc", nom: "Hurlement de guerre orc", img: icone("creatures/abilities/mouth-teeth-human"), carac: ["str", "cha"],
    texte: "Le cri qui a fait trembler les murailles de Lordaeron vit encore dans votre gorge. Par une **action bonus**, vous hurlez : chaque ennemi dans un rayon de 9 m qui peut vous entendre fait un jet de sauvegarde de **Sagesse** (DD 8 + votre modificateur de Charisme + votre bonus de maîtrise). En cas d'échec, il est **effrayé** jusqu'à la fin de votre prochain tour. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    utilisations: BM_PAR_REPOS_LONG,
    effets: [{ nom: "Terrifié par le hurlement", transfert: false, etats: ["frightened"], duree: [null, null, "sourceEnd"] }],
    activites: [{ type: "save", nom: "Hurler", activation: "bonus", portee: ["", "self"], gabarit: ["radius", 9], cible: ["", "enemy"], sauvegarde: { carac: ["wis"], dd: "cha", reussite: "none" }, effets: [0] }]
  }),
  general({
    cle: "garde-de-la-lumiere", nom: "Garde de la Lumière", img: icone("magic/holy/barrier-shield-winged-cross"), carac: ["wis", "cha"], exigences: "capacité Incantation ou Magie de pacte",
    texte: "Vous avez prêté serment devant la Main d'argent, la cathédrale de Hurlevent ou les Aldor : la Lumière vous traverse et protège ceux qui se tiennent près de vous. Vous avez la **résistance aux dégâts nécrotiques**.\n\n**Rempart de Lumière.** Quand une créature que vous voyez à 9 m au plus subit des dégâts, vous pouvez utiliser votre **réaction** pour réduire ces dégâts de **1d10 + votre bonus de maîtrise**. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    effets: [{ nom: "Garde de la Lumière", changements: [["system.traits.dr.value", "necrotic"]] }],
    utilisations: BM_PAR_REPOS_LONG,
    activites: [{ type: "utility", nom: "Rempart de Lumière", activation: "reaction", condition: "Une créature à 9 m subit des dégâts", portee: [9, "m"], cible: ["1", "creature"], jet: { nom: "Dégâts évités", formule: "1d10 + @prof" } }]
  }),
  general({
    cle: "coureur-des-hautes-terres", nom: "Coureur des Hautes-terres", img: icone("skills/movement/figure-running-gray"), carac: ["dex", "con"],
    texte: "Messager d'Arathi ou éclaireur des Hinterlands, vous avez couru sur les crêtes plus souvent que sur les routes. Votre **vitesse augmente de 3 m**, et les **broussailles**, les **éboulis** et les **pentes** ne sont pas un terrain difficile pour vous.",
    effets: [{
      nom: "Coureur des Hautes-terres", changements: [
        ["system.attributes.movement.bonus", "3"],
        ["system.attributes.movement.ignoredDifficultTerrain", "plants"], ["system.attributes.movement.ignoredDifficultTerrain", "rocks"], ["system.attributes.movement.ignoredDifficultTerrain", "slope"]
      ]
    }]
  }),
  general({
    cle: "mage-de-bataille-du-kirin-tor", nom: "Mage de bataille du Kirin Tor", img: icone("magic/defensive/shield-barrier-glowing-blue"), carac: ["int", "wis", "cha"], exigences: "capacité Incantation ou Magie de pacte",
    texte: "Les mages de Dalaran ont appris à lancer leurs sorts sous les flèches des trolls. Vous ajoutez **+2** à vos jets de sauvegarde de **Constitution** pour maintenir votre **concentration**, et vous pouvez accomplir les composantes somatiques de vos sorts même quand vous tenez une arme ou un bouclier dans chaque main.",
    effets: [{ nom: "Mage de bataille", changements: [["system.attributes.concentration.roll.bonus", "2"]] }]
  }),
  general({
    cle: "cavalier-des-steppes", nom: "Cavalier des steppes", img: icone("environment/people/cavalry"), carac: ["str", "dex", "wis"],
    texte: "Loup de guerre, bélier, kodo ou destrier : vous et votre monture ne faites qu'un. Vous avez l'avantage aux tests de Sagesse (**Dressage**). Tant que vous êtes monté, vous avez l'avantage aux jets d'attaque au corps à corps contre une créature non montée plus petite que votre monture, et quand votre monture subit une attaque, vous pouvez décider que c'est vous qui êtes visé.",
    effets: [{ nom: "Cavalier des steppes", changements: [["system.skills.ani.roll.mode", 1]] }]
  }),
  general({
    cle: "artilleur-de-forgefer", nom: "Artilleur de Forgefer", img: icone("skills/ranged/cannon-barrel-firing-orange"), carac: ["dex", "int"],
    texte: "Les tromblons nains ne pardonnent rien, sauf à ceux qui les connaissent. Vous gagnez **+1** à vos jets d'attaque avec une **arme à distance**, et vous ignorez la propriété **Chargement** des armes à feu que vous maîtrisez.",
    effets: [{ nom: "Artilleur de Forgefer", changements: [["system.rolls.attack.rwak.bonus", "1"]] }]
  }),
  general({
    cle: "echo-des-aspects", nom: "Écho des Aspects", img: icone("creatures/abilities/dragon-fire-breath-orange"), carac: ["con", "cha"],
    texte: "Un vol draconique a déposé une étincelle en vous : la flamme d'Alexstrasza, la glace d'un dragon bleu, l'orage des protodragons. Vous avez la **résistance** à un type de dégâts au choix : **acide**, **feu**, **foudre**, **froid** ou **poison**.\n\n**Souffle de l'Aspect.** Par une **action**, vous soufflez un cône de 4,5 m : chaque créature dedans fait un jet de sauvegarde de **Dextérité** (DD 8 + votre modificateur de Constitution + votre bonus de maîtrise) et subit **3d8** dégâts du type choisi en cas d'échec, la moitié en cas de réussite. Une utilisation par **repos court**.",
    maitrises: { choix: [{ parmi: ["dr:acid", "dr:fire", "dr:lightning", "dr:cold", "dr:poison"] }] },
    utilisations: { max: 1, periode: "sr" },
    activites: [{ type: "save", nom: "Souffler", portee: ["", "self"], gabarit: ["cone", 4.5], cible: ["", "creature"], sauvegarde: { carac: ["dex"], dd: "con", reussite: "half" }, degats: [{ des: "3d8", types: ["acid", "fire", "lightning", "cold", "poison"] }] }]
  }),
  general({
    cle: "agent-du-si-7", nom: "Agent du SI:7", img: icone("magic/perception/shadow-stealth-eyes-purple"), carac: ["dex", "int"],
    texte: "Le service de renseignement de Hurlevent forme ses agents à disparaître dans une ruelle éclairée. Dans une zone de **lumière faible** ou d'**obscurité**, vous pouvez effectuer l'action **Se cacher** par une **action bonus**. De plus, vous sentez quand on vous file : une créature qui vous suit discrètement depuis au moins une minute ne gagne pas l'avantage d'une attaque surprise contre vous, sauf si elle est invisible."
  })
];

// ======================================================================= Styles de combat

const STYLES = [
  style({
    cle: "tireur-des-peregrins", nom: "Tireur des Pérégrins", img: icone("skills/ranged/archery-bow-attack-yellow"),
    texte: "Les archers de Quel'Thalas tirent vite et juste. Vous gagnez **+1** aux jets d'attaque et **+1** aux jets de dégâts de vos attaques avec une **arme à distance**.",
    effets: [{ nom: "Tireur des Pérégrins", changements: [["system.rolls.attack.rwak.bonus", "1"], ["system.rolls.damage.rwak.bonus", "1"]] }]
  }),
  style({
    cle: "brise-rangs", nom: "Brise-rangs", img: icone("skills/melee/hand-grip-axe-strike-orange"),
    texte: "Vous frappez pour enfoncer une ligne, pas pour faire un duel. Vos attaques au **corps à corps avec une arme** infligent **1** dégât supplémentaire.",
    effets: [{ nom: "Brise-rangs", changements: [["system.rolls.damage.mwak.bonus", "1"]] }]
  }),
  style({
    cle: "sentinelle-de-la-muraille", nom: "Sentinelle de la Muraille", img: icone("magic/perception/eye-ringed-green"),
    texte: "Des nuits de garde sur la Muraille de Thandol ont aiguisé vos réflexes. Vous gagnez **+2** à l'**initiative** et **+2** à votre **Sagesse (Perception) passive**.",
    effets: [{ nom: "Sentinelle de la Muraille", changements: [["system.attributes.init.roll.bonus", "2"], ["system.skills.prc.bonuses.passive", "2"]] }]
  }),
  style({
    cle: "gardien-du-totem", nom: "Gardien du totem", img: icone("skills/melee/shield-block-bash-yellow"),
    texte: "Les braves taurens protègent les anciens et les enfants autour du totem. Quand une créature que vous voyez attaque une cible autre que vous située à 1,5 m de vous, vous pouvez utiliser votre **réaction** pour imposer le **désavantage** à ce jet d'attaque. Vous devez tenir un bouclier ou une arme de corps à corps."
  })
];

// ======================================================================= Faveurs épiques (niveau 19+)

const FAVEURS = [
  epique({
    cle: "benediction-de-la-lieuse-de-vie", nom: "Bénédiction de la Lieuse-de-vie", img: icone("magic/life/heart-hand-gold-green-light"),
    texte: "Alexstrasza vous a jugé digne de son feu de vie. Vos points de vie maximum augmentent de **30**, et vous avez l'avantage aux **jets de sauvegarde contre la mort**.",
    effets: [{ nom: "Bénédiction de la Lieuse-de-vie", changements: [["system.attributes.hp.bonuses.overall", "30"], ["system.attributes.death.roll.mode", 1]] }]
  }),
  epique({
    cle: "oeil-de-la-legion-vaincue", nom: "Œil de la Légion vaincue", img: icone("magic/perception/eye-ringed-glow-angry-large-teal"),
    texte: "Vous avez regardé un seigneur de l'effroi dans les yeux, et il a cligné le premier. Vous gagnez la **vision aveugle** sur **9 m**, et vous ne pouvez pas être **aveuglé**.",
    effets: [{ nom: "Œil de la Légion vaincue", changements: [["system.attributes.senses.ranges.blindsight", 9, "upgrade"], ["system.traits.ci.value", "blinded"]] }]
  }),
  epique({
    cle: "esprit-d-acier", nom: "Esprit d'acier", img: icone("magic/defensive/armor-shield-barrier-steel"),
    texte: "Le Roi-liche a tenté de vous briser, et il a échoué. Vous ne pouvez pas être **charmé** ni **effrayé**.",
    effets: [{ nom: "Esprit d'acier", changements: [["system.traits.ci.value", "charmed"], ["system.traits.ci.value", "frightened"]] }]
  })
];

// Tous les dons du module (compendium « dons »).
export const DONS = [...DONS_ORIGINE, ...DONS_GENERAUX, ...STYLES, ...FAVEURS];
