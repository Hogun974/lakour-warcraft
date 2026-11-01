// Sorts maison d'Azeroth (dnd5e 6.0.6, règles 2024) : chamanisme, Lumière, druidisme, arcanes, gangrène et ombre.
// Forme relevée dans le modèle SpellData de dnd5e 6.0.6 (level, school, properties, materials, method/prepared,
// activation, range, target, duration) et dans les sorts du compendium spells24 migrés en 6.0 (activités attack,
// save, damage, heal, utility ; mise à l'échelle des dégâts `scaling.mode` "whole" ; concentration portée par la
// propriété « concentration » et recopiée dans la durée des activités).
// Classes : dnd5e 6 ne range pas les classes dans le sort ; il les déclare par des pages de journal de type « spells »
// (system.type "class", system.identifier "wizard"…) enregistrées par le module dans flags.dnd5e.spellLists. Ce
// fichier fournit donc, en plus des sorts, le journal « Listes de sorts d'Azeroth » (une page par classe) ; chaque sort
// rappelle aussi ses classes dans sa description et dans flags.lakour-warcraft.classes.
// Toutes les distances sont en mètres (5 pieds = 1,5 m). Textes originaux.
import { MODULE, STATS, identifiant, html, icone, ref } from "./aides.mjs";
import { CARACTERISTIQUES, DOMMAGES, SOINS, ETATS, COMPETENCES, exiger } from "./objets.mjs";

// ---------- Clés de dnd5e 6.0.6 (CONFIG.DND5E) vérifiées à la construction et par les essais

export const ECOLES = ["abj", "con", "div", "enc", "evo", "ill", "nec", "trs"];                     // spellSchools
export const PROPRIETES_SORT = ["vocal", "somatic", "material", "concentration", "ritual"];          // validProperties.spell
export const METHODES = ["", "atwill", "innate", "ritual", "pact", "spell"];                        // spellcasting
export const ETATS_PREPARATION = [0, 1, 2];                                                         // spellPreparationStates
// Classes lanceuses de sorts du SRD 2024 (identifiants des classes de dnd5e.classes24) et leur nom français.
export const CLASSES_SORTS = {
  bard: "Barde", cleric: "Clerc", druid: "Druide", paladin: "Paladin",
  ranger: "Rôdeur", sorcerer: "Ensorceleur", warlock: "Occultiste", wizard: "Magicien"
};
export const TRADITIONS = {
  chamanisme: "Chamanisme", lumiere: "La Lumière", druidisme: "Druidisme", arcanes: "Arcanes", gangrene: "Gangrène et ombre"
};
export const ACTIVATIONS = ["action", "bonus", "reaction", "minute", "hour", "day", "special"];      // activityActivationTypes (sorts)
export const DUREES = ["inst", "spec", "disp", "dstr", "perm", "turn", "round", "minute", "hour", "day", "month", "year"]; // timePeriods
export const PORTEES = ["self", "touch", "spec", "any", "m", "km"];                                  // rangeTypes + unités métriques
export const CIBLES = ["", "self", "ally", "enemy", "creature", "object", "space", "creatureOrObject", "any", "willing"]; // individualTargetTypes
export const GABARITS = ["", "circle", "cone", "cube", "cylinder", "line", "radius", "sphere", "square", "wall"];          // areaTargetTypes
export const TYPES_ACTIVITE = ["attack", "damage", "heal", "save", "utility"];
export const MODES_ECHELLE = ["", "whole", "half"];                                                 // damageScalingModes
export const TYPES_ATTAQUE = ["melee", "ranged"];                                                   // attackTypes
export const PERIODES = ["lr", "sr", "day", "dawn", "dusk", "initiative", "turnStart", "turnEnd"];   // limitedUsePeriods
const MODES_CHANGEMENT = ["add", "multiply", "override", "upgrade", "downgrade", "custom"];
export const UNITES = "m";

// Chemins d'effets actifs vérifiés dans les modèles d'acteur de dnd5e 6.0.6 (noms canoniques 6.0, pas les anciens
// chemins « bonuses.* » que le système redirige avec un avertissement).
export function cheminEffetValide(cle) {
  const [s, ...reste] = String(cle).split(".");
  if (s !== "system") return false;
  const k = reste.join(".");
  if (["attributes.ac.bonus", "attributes.movement.multiplier", "attributes.movement.bonus", "attributes.hp.tempmax",
    "traits.dr.value", "traits.di.value", "traits.dv.value", "traits.ci.value",
    "attributes.init.roll.bonus", "attributes.init.roll.mode",
    "attributes.concentration.roll.bonus", "attributes.concentration.roll.mode",
    "rolls.ability.check.bonus", "rolls.ability.save.bonus", "rolls.ability.skill.bonus"].includes(k)) return true;
  let m = /^rolls\.attack\.(msak|mwak|rsak|rwak)\.bonus$/.exec(k);
  if (m) return true;
  m = /^abilities\.([a-z]{3})\.(check|save)\.roll\.(bonus|mode)$/.exec(k);
  if (m) return CARACTERISTIQUES.includes(m[1]);
  m = /^skills\.([a-z]{3})\.roll\.(bonus|mode)$/.exec(k);
  if (m) return COMPETENCES.includes(m[1]);
  return false;
}

// ---------- Vérifications

const dans = (liste, valeur, quoi, ou) => exiger(liste.includes(valeur), `${ou} : ${quoi} « ${valeur} » inconnu de dnd5e`);
export const SOURCE = { custom: "La Kour Warcraft", rules: "2024", revision: 1, book: "", page: "", license: "" };

// « 2d6 » -> { number: 2, denomination: 6 } ; une formule (« @item.level ») passe en formule libre.
// echelle : nombre de dés ajoutés par niveau d'emplacement au-delà du niveau du sort (tour de magie : par palier 5/11/17).
function des(texte = "", bonus = "", echelle = 0) {
  const m = /^(\d+)d(\d+)$/.exec(String(texte).trim());
  const formule = m || !texte ? "" : String(texte);
  return {
    number: m ? Number(m[1]) : null, denomination: m ? Number(m[2]) : null, bonus: String(bonus ?? ""),
    custom: { enabled: Boolean(formule), formula: formule }, modifiers: [],
    scaling: echelle ? { mode: "whole", number: echelle, formula: "" } : { mode: "", number: null, formula: "" }
  };
}
const partie = (p, ou) => {
  exiger(p.types?.length, `${ou} : partie de dégâts sans type`);
  for (const t of p.types) dans(DOMMAGES, t, "type de dommages", ou);
  return { ...des(p.des, p.bonus, p.echelle ?? 0), types: p.types };
};

// ---------- Effets actifs (forme Foundry 14 / dnd5e 6.0 : type "base", system.changes avec type et phase)
// e = { nom, changements: [[cle, valeur, mode = "add"]], transfert, duree (secondes), etats, texte, img }
export function effet(base, parent, i, e, img, ou, { transfert = false, magique = true } = {}) {
  const _id = identifiant(`${base}:effet:${i}`);
  for (const s of e.etats ?? []) dans(ETATS, s, "état", ou);
  return {
    _id, _key: `!items.effects!${parent}.${_id}`, name: e.nom, img: e.img ?? img, type: "base",
    system: {
      magical: magique,
      changes: (e.changements ?? []).map(([key, value, type = "add"], j) => {
        exiger(cheminEffetValide(key), `${ou} : chemin d'effet « ${key} » inconnu de dnd5e 6.0`);
        dans(MODES_CHANGEMENT, type, "mode de changement", ou);
        return { key, value, priority: null, type, phase: "initial", _id: identifiant(`${base}:effet:${i}:${j}`) };
      })
    },
    disabled: false, duration: { value: e.duree ?? null, units: "seconds", expiry: e.duree ? "turnStart" : null, expired: false },
    description: html(e.texte ?? ""), origin: null, tint: "#ffffff", transfer: e.transfert ?? transfert,
    statuses: e.etats ?? [], sort: 0, flags: {}, start: null, showIcon: 1, folder: null, _stats: STATS
  };
}

// ---------- Activités (BaseActivityData de dnd5e 6.0.6 et ses types attack, damage, heal, save, utility)
// a = { type, nom, activation: [type, valeur], condition, emplacement (false : ne consomme pas d'emplacement),
//       portee, cible, gabarit, duree (sinon ceux du document, override = false), utilisations (consomme 1 utilisation),
//       degats: [{ des, bonus, types, echelle }], soin: { des, bonus, type, echelle },
//       sauvegarde: { carac: [...], reussite: "half" | "none", dd: "spellcasting" | carac | nombre },
//       attaque: { type: "ranged" | "melee", classement: "spell" }, jet: { nom, formule }, effets: [indices] }
// doc = valeurs du document (activation, range, target, duration, concentration) reprises quand rien n'est surchargé ;
//       doc.sort : un emplacement est consommé par défaut ; doc.estSort === false : objet sans champs propres (don).
export function activite(base, i, a, idsEffets, doc, ou) {
  dans(TYPES_ACTIVITE, a.type, "type d'activité", ou);
  // Surcharge : seuls les sorts portent activation, portée, cible et durée au niveau du document.
  const surcharge = cle => doc.estSort !== false && a[cle] !== undefined;
  const [actType, actValeur = null] = a.activation ?? [doc.activation.type, doc.activation.value];
  dans(ACTIVATIONS, actType, "activation", ou);
  const duree = a.duree ? { value: String(a.duree[0] ?? ""), units: a.duree[1] ?? "inst" } : doc.duration;
  dans(DUREES, duree.units, "unité de durée", ou);
  const portee = a.portee ? { value: String(a.portee[0] ?? ""), units: a.portee[1] ?? "self" } : doc.range;
  dans(PORTEES, portee.units, "portée", ou);
  const cible = a.cible || a.gabarit ? cibleDe(a.cible, a.gabarit, portee.units, ou) : doc.target;
  const effets = (a.effets ?? []).map(n => {
    exiger(idsEffets[n], `${ou} : l'activité cite l'effet n° ${n}, absent du document`);
    return a.type === "save" ? { _id: idsEffets[n], onSave: false, level: { min: null, max: null } } : { _id: idsEffets[n], level: { min: null, max: null } };
  });
  const sortie = {
    _id: identifiant(`${base}:activite:${i}`), type: a.type, name: a.nom ?? "", img: "", sort: (i + 1) * 100000, flags: {},
    activation: { type: actType, value: actValeur, condition: a.condition ?? doc.activation.condition ?? "", override: surcharge("activation") || surcharge("condition") },
    behaviors: [],
    consumption: {
      scaling: { allowed: false, max: "" }, spellSlot: a.emplacement ?? doc.sort,
      targets: a.utilisations ? [{ type: "itemUses", value: "1", target: "", scaling: {} }] : []
    },
    description: { chatFlavor: "", value: "" },
    duration: { ...duree, expiry: null, special: "", concentration: Boolean(doc.concentration) && !surcharge("duree"), override: surcharge("duree") },
    effects: effets,
    range: { ...portee, special: "", override: surcharge("portee") },
    target: { ...structuredClone(cible), prompt: Boolean(cible.template.type), override: surcharge("cible") || surcharge("gabarit") },
    uses: { spent: 0, max: "", recovery: [] },
    visibility: { identifier: "", level: { min: null, max: null }, requireAttunement: false, requireIdentification: false, requireMagic: false }
  };
  if (a.type === "heal") {
    dans(SOINS, a.soin.type ?? "healing", "type de soin", ou);
    sortie.healing = { ...des(a.soin.des, a.soin.bonus, a.soin.echelle ?? 0), types: [a.soin.type ?? "healing"] };
  }
  if (a.type === "damage") sortie.damage = { critical: { allow: false, bonus: "" }, parts: a.degats.map(p => partie(p, ou)) };
  if (a.type === "save") {
    for (const c of a.sauvegarde.carac) dans(CARACTERISTIQUES, c, "caractéristique de sauvegarde", ou);
    const dd = a.sauvegarde.dd ?? (doc.sort ? "spellcasting" : "");
    if (typeof dd === "string" && dd !== "spellcasting" && dd !== "") dans(CARACTERISTIQUES, dd, "caractéristique du DD", ou);
    sortie.save = {
      ability: a.sauvegarde.carac, bonus: "", visible: true,
      dc: typeof dd === "number" ? { calculation: "", formula: String(dd) } : { calculation: dd, formula: "" }
    };
    dans(["half", "none"], a.sauvegarde.reussite ?? "half", "effet d'une sauvegarde réussie", ou);
    sortie.damage = { onSave: a.sauvegarde.reussite ?? "half", parts: (a.degats ?? []).map(p => partie(p, ou)) };
  }
  if (a.type === "attack") {
    dans(TYPES_ATTAQUE, a.attaque?.type ?? "ranged", "type d'attaque", ou);
    sortie.attack = {
      ability: "", bonus: "", critical: { threshold: null }, flat: false,
      type: { value: a.attaque?.type ?? "ranged", classification: a.attaque?.classement ?? "spell" }
    };
    sortie.damage = { critical: { bonus: "" }, includeBase: true, parts: (a.degats ?? []).map(p => partie(p, ou)) };
  }
  if (a.type === "utility") sortie.roll = { prompt: false, visible: Boolean(a.jet), name: a.jet?.nom ?? "", formula: a.jet?.formule ?? "" };
  return sortie;
}

// Cible : [nombre (ou formule « @item.level »), type] et gabarit : [type, taille en m, { hauteur, largeur }].
export function cibleDe(c, g, unitePortee, ou) {
  const [nombre = "", type = unitePortee === "self" && !g ? "self" : "creature"] = c ?? [];
  dans(CIBLES, type, "type de cible", ou);
  const [gabarit = "", taille = "", dims = {}] = g ?? [];
  dans(GABARITS, gabarit, "gabarit", ou);
  return {
    template: {
      count: "", contiguous: false, stationary: false, type: gabarit, size: String(taille),
      width: String(dims.largeur ?? ""), height: String(dims.hauteur ?? ""), units: UNITES
    },
    affects: { count: String(nombre), type, choice: false, special: "" }
  };
}

// ---------- Sort (type « spell »)
// d = { cle, nom, niveau, ecole, tradition, classes, composantes: ["vocal", "somatic", "material"], materiel: { texte, cout, consomme },
//       rituel, concentration, incantation: [type, valeur], condition, portee: [m | "", unité], cible, gabarit, duree: [valeur, unité],
//       texte, niveauxSuperieurs, img, effets, activites }
export function sort(d) {
  const ou = `sorts:${d.cle}`;
  exiger(/^[a-z0-9-]+$/.test(d.cle ?? ""), `clé invalide : « ${d.cle} »`);
  exiger(d.nom && d.img && d.texte, `${ou} : nom, image ou texte manquant`);
  exiger(Number.isInteger(d.niveau) && d.niveau >= 0 && d.niveau <= 9, `${ou} : niveau ${d.niveau} hors de 0 à 9`);
  dans(ECOLES, d.ecole, "école", ou);
  dans(Object.keys(TRADITIONS), d.tradition, "tradition", ou);
  exiger(d.classes?.length, `${ou} : aucune classe`);
  for (const c of d.classes) dans(Object.keys(CLASSES_SORTS), c, "classe", ou);
  const composantes = d.composantes ?? ["vocal", "somatic"];
  const proprietes = [...composantes, ...(d.concentration ? ["concentration"] : []), ...(d.rituel ? ["ritual"] : [])];
  for (const p of proprietes) dans(PROPRIETES_SORT, p, "propriété de sort", ou);
  exiger(composantes.includes("material") === Boolean(d.materiel?.texte), `${ou} : composante matérielle et matériel incohérents`);
  const [actType, actValeur = null] = d.incantation ?? ["action"];
  dans(ACTIVATIONS, actType, "temps d'incantation", ou);
  const [dureeValeur = "", dureeUnite = "inst"] = d.duree ?? [];
  dans(DUREES, dureeUnite, "durée", ou);
  exiger(!d.concentration || !["inst", "perm", "disp", "dstr"].includes(dureeUnite), `${ou} : concentration sur une durée instantanée ou permanente`);
  const [porteeValeur = "", porteeUnite = "self"] = d.portee ?? [];
  dans(PORTEES, porteeUnite, "portée", ou);
  exiger(d.activites?.length, `${ou} : aucune activité`);

  const _id = identifiant(ou);
  const doc = {
    sort: d.niveau > 0, concentration: d.concentration,
    activation: { type: actType, value: actValeur, condition: d.condition ?? "" },
    duration: { value: String(dureeValeur), units: dureeUnite },
    range: { value: String(porteeValeur), units: porteeUnite },
    target: cibleDe(d.cible, d.gabarit, porteeUnite, ou)
  };
  const effets = (d.effets ?? []).map((e, i) => effet(ou, _id, i, e, d.img, ou));
  const activites = Object.fromEntries(d.activites.map((a, i) => {
    const act = activite(ou, i, a, effets.map(e => e._id), doc, ou);
    return [act._id, act];
  }));
  const classes = d.classes.map(c => CLASSES_SORTS[c]).join(", ");
  const texte = [
    d.texte,
    d.niveauxSuperieurs ? `**Aux niveaux supérieurs.** ${d.niveauxSuperieurs}` : "",
    `**Tradition** : ${TRADITIONS[d.tradition]}. **Listes de sorts** : ${classes}.`
  ].filter(Boolean).join("\n\n");
  return {
    __pack: "sorts", __cle: ou,
    _id, _key: `!items!${_id}`, name: d.nom, type: "spell", img: d.img,
    system: {
      description: { value: html(texte), chat: "" }, source: SOURCE, identifier: d.cle,
      activities: activites, uses: { max: "", spent: 0, recovery: [] },
      ability: "", activation: doc.activation,
      duration: { ...doc.duration, expiry: null, special: "" },
      level: d.niveau,
      materials: { value: d.materiel?.texte ?? "", consumed: Boolean(d.materiel?.consomme), cost: d.materiel?.cout ?? 0, supply: 0 },
      method: "spell", prepared: 0, properties: proprietes,
      range: { ...doc.range, special: "" }, school: d.ecole, sourceItem: "", target: doc.target
    },
    effects: effets, folder: null, sort: d.niveau * 100000 + (d.ordre ?? 0), ownership: { default: 0 },
    flags: { [MODULE]: { cle: d.cle, tradition: d.tradition, classes: d.classes } }, _stats: STATS
  };
}

// ---------- Prix de la gangrène : chaque sort gangrené blesse son lanceur et le marque (règle commune aux sorts fel).
const MARQUE = "Marque de gangrène";
const marqueGangrene = () => ({
  nom: MARQUE, img: icone("magic/unholy/hand-claw-fog-green"), duree: 3600, transfert: false,
  changements: [["system.skills.per.roll.mode", -1], ["system.skills.dec.roll.mode", -1]],
  texte: "Vos yeux brûlent d'un éclat vert et votre peau sent le soufre. Pendant 1 heure, vous avez le désavantage aux tests de Charisme (Persuasion et Tromperie), et toute créature qui connaît la gangrène sait ce que vous venez de faire."
});
const PRIX_TEXTE = "**Prix de la gangrène.** Juste après l'incantation, vous subissez des dégâts nécrotiques égaux au niveau de l'emplacement dépensé ; ces dégâts ne peuvent être réduits d'aucune façon. Vous portez ensuite la **marque de gangrène** pendant 1 heure (désavantage aux tests de Persuasion et de Tromperie). Un lanceur qui accumule les marques attire l'attention des démons : le MJ en tient le compte.";
const prixGangrene = indiceEffet => ({
  type: "damage", nom: "Prix de la gangrène", activation: ["special"], condition: "Juste après l'incantation",
  emplacement: false, portee: ["", "self"], cible: ["", "self"], duree: [1, "hour"],
  degats: [{ des: "@item.level", types: ["necrotic"] }], effets: [indiceEffet]
});

// ---------- Les sorts

const I = (...m) => icone(...m);

export const SORTS = [
  // ===== Chamanisme : esprits des éléments, totems
  sort({
    cle: "horion-elementaire", nom: "Horion élémentaire", niveau: 0, ecole: "evo", tradition: "chamanisme",
    classes: ["druid", "cleric", "sorcerer"], portee: [18, "m"], cible: ["1", "creatureOrObject"],
    img: I("magic/lightning/bolt-strike-blue"),
    texte: "Vous demandez à un esprit élémentaire de frapper pour vous : un éclat de givre, une gerbe de flammes ou une décharge de foudre jaillit de votre paume vers une cible à portée. Faites une attaque de sort à distance ; en cas de réussite, la cible subit **1d8** dégâts de froid, de feu ou de foudre (choisissez à l'incantation, selon l'esprit qui répond).\n\nUn esprit qu'on appelle pour rien finit par ne plus répondre : le MJ peut faire bouder l'élément d'un chaman qui lance ce tour par pur caprice.",
    niveauxSuperieurs: "Les dégâts augmentent de 1d8 aux niveaux 5 (2d8), 11 (3d8) et 17 (4d8).",
    activites: [{ type: "attack", attaque: { type: "ranged" }, degats: [{ des: "1d8", types: ["cold", "fire", "lightning"], echelle: 1 }] }]
  }),
  sort({
    cle: "egide-d-orage", nom: "Égide d'orage", niveau: 1, ecole: "abj", tradition: "chamanisme",
    classes: ["druid", "cleric", "sorcerer"], incantation: ["bonus"], duree: [10, "minute"], portee: ["", "self"],
    img: I("magic/lightning/barrier-wall-shield-gray"),
    effets: [{ nom: "Égide d'orage", duree: 600, texte: "Trois sphères d'électricité tournent autour de vous. Quand une créature vous touche avec une attaque au corps à corps, une sphère se décharge sur elle (activité « Décharge »). Le sort prend fin quand la dernière sphère est dépensée." }],
    texte: "Trois petites sphères crépitantes, prêtées par les esprits de l'air, tournent autour de vous pour la durée du sort.\n\nQuand une créature située à 1,5 m de vous vous touche avec une attaque au corps à corps, une sphère se décharge sur elle : elle subit **2d6** dégâts de foudre, sans jet de sauvegarde. Le sort prend fin quand la troisième sphère est dépensée.",
    niveauxSuperieurs: "Les dégâts de chaque décharge augmentent de 1d6 par niveau d'emplacement au-delà du 1er.",
    activites: [
      { type: "utility", nom: "Invoquer l'égide", effets: [0] },
      { type: "damage", nom: "Décharge", activation: ["special"], condition: "Une créature à 1,5 m vous touche au corps à corps",
        emplacement: false, portee: [1.5, "m"], cible: ["1", "creature"], degats: [{ des: "2d6", types: ["lightning"], echelle: 1 }] }
    ]
  }),
  sort({
    cle: "totem-du-flot-guerisseur", nom: "Totem du flot guérisseur", niveau: 2, ecole: "abj", tradition: "chamanisme",
    classes: ["druid", "cleric"], concentration: true, duree: [1, "minute"], portee: [9, "m"], cible: ["", "space"],
    composantes: ["vocal", "somatic", "material"], materiel: { texte: "un galet poli par une rivière" },
    img: I("commodities/treasure/totem-wooden-glowing-green"),
    texte: "Vous plantez dans un espace inoccupé à portée un totem sculpté où vient loger un esprit de l'eau. Le totem est un objet de taille Petite (CA 13, 10 points de vie) ; s'il est détruit, le sort prend fin.\n\nQuand vous lancez le sort, puis par une **action bonus** à chacun de vos tours suivants, une créature de votre choix située à 3 m ou moins du totem récupère **1d6 + votre modificateur de caractéristique d'incantation** points de vie. Les morts-vivants et les créatures artificielles n'en tirent aucun bénéfice.",
    niveauxSuperieurs: "Les soins augmentent de 1d6 par niveau d'emplacement au-delà du 2e.",
    activites: [
      { type: "utility", nom: "Planter le totem", gabarit: ["radius", 3] },
      { type: "heal", nom: "Flot guérisseur", activation: ["bonus"], emplacement: false, portee: [3, "m"], cible: ["1", "creature"],
        soin: { des: "1d6", bonus: "@mod", echelle: 1 } }
    ]
  }),
  sort({
    cle: "eclair-bondissant", nom: "Éclair bondissant", niveau: 3, ecole: "evo", tradition: "chamanisme",
    classes: ["druid", "cleric", "sorcerer", "wizard"], portee: [27, "m"], cible: ["1", "creature"],
    img: I("magic/lightning/bolt-forked-large-blue"),
    texte: "Les esprits de l'orage tracent un éclair qui rebondit de cible en cible.\n\nFaites une attaque de sort à distance contre une créature à portée. En cas de réussite, elle subit **4d10** dégâts de foudre. Que l'attaque touche ou non, l'éclair bondit ensuite vers **deux autres créatures** de votre choix situées à 9 m ou moins de la première : chacune fait un jet de sauvegarde de Dextérité et subit **2d10** dégâts de foudre en cas d'échec, la moitié en cas de réussite.",
    niveauxSuperieurs: "Les dégâts contre la première cible augmentent de 1d10, et ceux du rebond de 1d10, par niveau d'emplacement au-delà du 3e.",
    activites: [
      { type: "attack", nom: "Éclair", attaque: { type: "ranged" }, degats: [{ des: "4d10", types: ["lightning"], echelle: 1 }] },
      { type: "save", nom: "Rebond", emplacement: false, portee: [9, "m"], cible: ["2", "creature"],
        sauvegarde: { carac: ["dex"], reussite: "half" }, degats: [{ des: "2d10", types: ["lightning"], echelle: 1 }] }
    ]
  }),

  // ===== La Lumière : prêtres et paladins
  sort({
    cle: "etincelle-de-lumiere", nom: "Étincelle de la Lumière", niveau: 0, ecole: "evo", tradition: "lumiere",
    classes: ["cleric"], portee: [18, "m"], cible: ["1", "creature"],
    img: I("magic/light/beam-rays-yellow"),
    effets: [{ nom: "Révélé par la Lumière", duree: 6, texte: "La cible émet une lumière faible dans un rayon de 1,5 m et ne tire aucun bénéfice de l'état Invisible jusqu'à la fin de votre prochain tour." }],
    texte: "Une parcelle de Lumière se détache de votre symbole sacré et file vers une créature à portée. Faites une attaque de sort à distance ; en cas de réussite, la cible subit **1d8** dégâts radiants et, jusqu'à la fin de votre prochain tour, elle luit faiblement (1,5 m) et ne peut pas bénéficier de l'état Invisible.\n\nLes paladins qui ont choisi le style de combat *Guerrier béni* peuvent prendre ce tour de magie dans la liste du clerc.",
    niveauxSuperieurs: "Les dégâts augmentent de 1d8 aux niveaux 5 (2d8), 11 (3d8) et 17 (4d8).",
    activites: [{ type: "attack", attaque: { type: "ranged" }, degats: [{ des: "1d8", types: ["radiant"], echelle: 1 }], effets: [0] }]
  }),
  sort({
    cle: "egide-de-lumiere", nom: "Égide de la Lumière", niveau: 1, ecole: "abj", tradition: "lumiere",
    classes: ["cleric", "paladin"], incantation: ["bonus"], duree: [1, "hour"], portee: [9, "m"], cible: ["1", "creature"],
    img: I("magic/defensive/shield-barrier-deflect-gold.webp"),
    texte: "Vous dessinez dans l'air un signe de protection qui se pose sur une créature à portée comme un voile doré. Elle gagne **2d4 + votre modificateur de caractéristique d'incantation** points de vie temporaires pour 1 heure.\n\nLes prêtres de Hurlevent l'appellent « le manteau de l'Aube » ; on le pose sur les épaules des soldats avant la charge.",
    niveauxSuperieurs: "Les points de vie temporaires augmentent de 2d4 par niveau d'emplacement au-delà du 1er.",
    activites: [{ type: "heal", nom: "Égide", soin: { des: "2d4", bonus: "@mod", type: "temphp", echelle: 2 } }]
  }),
  sort({
    cle: "marteau-de-justice", nom: "Marteau de justice", niveau: 2, ecole: "evo", tradition: "lumiere",
    classes: ["paladin"], incantation: ["bonus"], condition: "Juste après avoir touché une créature avec une arme de corps à corps ou une attaque à mains nues",
    duree: [1, "round"], portee: ["", "self"], cible: ["1", "creature"],
    img: I("skills/melee/strike-hammer-destructive-blue"),
    effets: [{ nom: "Sonné", etats: ["incapacitated"], duree: 6, texte: "La cible est neutralisée jusqu'au début de votre prochain tour." }],
    texte: "Votre coup s'accompagne d'un marteau de Lumière qui s'abat sur la cible. Elle subit **3d6** dégâts radiants supplémentaires et fait un jet de sauvegarde de Constitution : en cas d'échec, elle a l'état **Neutralisé** jusqu'au début de votre prochain tour ; en cas de réussite, elle ne subit que la moitié des dégâts radiants.",
    niveauxSuperieurs: "Les dégâts radiants augmentent de 1d6 par niveau d'emplacement au-delà du 2e.",
    activites: [{ type: "save", nom: "Marteau", sauvegarde: { carac: ["con"], reussite: "half" }, degats: [{ des: "3d6", types: ["radiant"], echelle: 1 }], effets: [0] }]
  }),
  sort({
    cle: "psaume-de-lumiere", nom: "Psaume de la Lumière", niveau: 3, ecole: "abj", tradition: "lumiere",
    classes: ["cleric", "paladin"], portee: [9, "m"], cible: ["6", "creature"],
    img: I("magic/holy/angel-winged-humanoid-blue.webp"),
    texte: "Vous entonnez un psaume que reprennent ceux qui vous entourent. Jusqu'à six créatures de votre choix situées à portée, qui peuvent vous entendre, récupèrent chacune **2d6 + votre modificateur de caractéristique d'incantation** points de vie.\n\nLe psaume ne fait rien aux morts-vivants et aux créatures artificielles. Un Réprouvé qui le reçoit en éprouve une douleur sourde, mais il guérit.",
    niveauxSuperieurs: "Les soins augmentent de 1d6 par niveau d'emplacement au-delà du 3e.",
    activites: [{ type: "heal", nom: "Psaume", soin: { des: "2d6", bonus: "@mod", echelle: 1 } }]
  }),
  sort({
    cle: "chute-d-etoiles", nom: "Chute d'étoiles d'Élune", niveau: 5, ecole: "evo", tradition: "lumiere",
    classes: ["cleric", "druid"], portee: [45, "m"], gabarit: ["sphere", 6],
    img: I("magic/light/explosion-star-blue"),
    texte: "Les prêtresses de la Lune le disent : Élune ne frappe qu'une fois, mais elle frappe juste. Une pluie d'étoiles s'abat sur une sphère de 6 m de rayon centrée sur un point à portée. Chaque créature dans la zone fait un jet de sauvegarde de Dextérité ; elle subit **8d8** dégâts radiants en cas d'échec, la moitié en cas de réussite.\n\nLa zone reste baignée d'une lumière argentée jusqu'à la fin de votre prochain tour.",
    niveauxSuperieurs: "Les dégâts augmentent de 1d8 par niveau d'emplacement au-delà du 5e.",
    activites: [{ type: "save", nom: "Chute d'étoiles", sauvegarde: { carac: ["dex"], reussite: "half" }, degats: [{ des: "8d8", types: ["radiant"], echelle: 1 }] }]
  }),

  // ===== Druidisme : le Rêve d'émeraude
  sort({
    cle: "sarments-du-reve", nom: "Sarments du Rêve", niveau: 1, ecole: "con", tradition: "druidisme",
    classes: ["druid", "ranger"], concentration: true, duree: [1, "minute"], portee: [18, "m"], cible: ["1", "creature"],
    img: I("magic/nature/plant-sprout-hands-vines"),
    effets: [{ nom: "Entravé par les sarments", etats: ["restrained"], duree: 60, texte: "À la fin de chacun de ses tours, la créature refait le jet de sauvegarde de Force ; en cas de réussite, les sarments se rompent." }],
    texte: "Des sarments d'un vert irréel, venus du Rêve d'émeraude, jaillissent du sol sous une créature à portée. Elle fait un jet de sauvegarde de Force. En cas d'échec, elle subit **2d8** dégâts perforants et a l'état **Entravé** pour la durée du sort ; en cas de réussite, elle subit la moitié des dégâts et n'est pas entravée.\n\nÀ la fin de chacun de ses tours, une créature entravée refait le jet de sauvegarde et se libère en cas de réussite.",
    niveauxSuperieurs: "Les dégâts augmentent de 1d8 par niveau d'emplacement au-delà du 1er.",
    activites: [{ type: "save", nom: "Sarments", sauvegarde: { carac: ["str"], reussite: "half" }, degats: [{ des: "2d8", types: ["piercing"], echelle: 1 }], effets: [0] }]
  }),
  sort({
    cle: "seve-de-jouvence", nom: "Sève de jouvence", niveau: 1, ecole: "abj", tradition: "druidisme",
    classes: ["druid", "ranger"], incantation: ["bonus"], duree: [3, "round"], portee: ["", "touch"], cible: ["1", "creature"],
    img: I("magic/nature/leaf-drip-light-green"),
    texte: "Vous posez la main sur une créature et une sève lumineuse court sous sa peau. Elle récupère aussitôt **1d4 + votre modificateur de caractéristique d'incantation** points de vie, puis **1d4** points de vie au début de chacun de ses trois tours suivants (activité « Repousse », sans dépenser d'emplacement).\n\nLe sort n'a aucun effet sur les morts-vivants et les créatures artificielles.",
    niveauxSuperieurs: "Les soins immédiats et ceux de chaque repousse augmentent de 1d4 par niveau d'emplacement au-delà du 1er.",
    activites: [
      { type: "heal", nom: "Floraison", soin: { des: "1d4", bonus: "@mod", echelle: 1 } },
      { type: "heal", nom: "Repousse", activation: ["special"], condition: "Début de chacun des trois tours suivants de la cible", emplacement: false,
        soin: { des: "1d4", echelle: 1 } }
    ]
  }),
  sort({
    cle: "torpeur-d-emeraude", nom: "Torpeur d'émeraude", niveau: 2, ecole: "enc", tradition: "druidisme",
    classes: ["druid", "bard"], concentration: true, duree: [1, "minute"], portee: [18, "m"], cible: ["@item.level - 1", "creature"],
    composantes: ["vocal", "somatic", "material"], materiel: { texte: "un pétale de fleur cueilli dans un bois sacré" },
    img: I("magic/nature/dreamcatcher-green"),
    effets: [{ nom: "Endormi dans le Rêve", etats: ["unconscious"], duree: 60, texte: "La créature dort jusqu'à la fin du sort. Elle se réveille si elle subit des dégâts ou si une autre créature utilise une action pour la secouer. Elle refait le jet de sauvegarde de Sagesse à la fin de chacun de ses tours et se réveille en cas de réussite." }],
    texte: "Vous ouvrez pour un instant la porte du Rêve d'émeraude dans l'esprit d'une créature à portée. Elle fait un jet de sauvegarde de Sagesse ; en cas d'échec, elle sombre dans un sommeil paisible (état **Inconscient**) pour la durée du sort.\n\nElle se réveille si elle subit des dégâts ou si quelqu'un utilise une action pour la secouer, et elle refait le jet de sauvegarde à la fin de chacun de ses tours. Les morts-vivants, les créatures artificielles et les elfes que le Rêve a déjà tourmentés (au jugement du MJ) réussissent automatiquement.",
    niveauxSuperieurs: "Vous pouvez viser une créature supplémentaire par niveau d'emplacement au-delà du 2e.",
    activites: [{ type: "save", nom: "Torpeur", sauvegarde: { carac: ["wis"], reussite: "none" }, effets: [0] }]
  }),

  // ===== Arcanes : le Kirin Tor
  sort({
    cle: "nova-de-givre", nom: "Nova de givre", niveau: 2, ecole: "evo", tradition: "arcanes",
    classes: ["wizard", "sorcerer"], portee: ["", "self"], gabarit: ["radius", 3], cible: ["", "creature"],
    img: I("magic/water/barrier-ice-wall-explosion"),
    effets: [{ nom: "Pris dans la glace", duree: 6, changements: [["system.attributes.movement.multiplier", 0, "override"]], texte: "La vitesse de la créature est de 0 jusqu'à la fin de son prochain tour." }],
    texte: "Une onde de froid jaillit de vous et fige le sol. Chaque créature de votre choix située à 3 m ou moins de vous fait un jet de sauvegarde de Constitution. En cas d'échec, elle subit **2d8** dégâts de froid et sa vitesse tombe à 0 jusqu'à la fin de son prochain tour ; en cas de réussite, elle subit la moitié des dégâts et peut bouger.\n\nC'est le premier sort de combat qu'apprennent les apprentis de Dalaran : il sert surtout à fuir.",
    niveauxSuperieurs: "Les dégâts augmentent de 1d8 par niveau d'emplacement au-delà du 2e.",
    activites: [{ type: "save", nom: "Nova", sauvegarde: { carac: ["con"], reussite: "half" }, degats: [{ des: "2d8", types: ["cold"], echelle: 1 }], effets: [0] }]
  }),
  sort({
    cle: "metamorphose-ovine", nom: "Métamorphose ovine", niveau: 3, ecole: "trs", tradition: "arcanes",
    classes: ["wizard", "sorcerer"], concentration: true, duree: [1, "minute"], portee: [18, "m"], cible: ["1", "creature"],
    composantes: ["vocal", "somatic", "material"], materiel: { texte: "une touffe de laine" },
    img: I("creatures/mammals/livestock-sheep-green"),
    effets: [{ nom: "Changé en mouton", duree: 60, texte: "La créature est un mouton : Petite, CA 10, vitesse 9 m, 1d6 contondant en coup de tête, aucune action de sort ni de parole. Elle garde ses propres points de vie. Le sort prend fin si elle subit des dégâts." }],
    texte: "La spécialité honteuse et indispensable des mages du Kirin Tor. Une créature que vous voyez à portée fait un jet de sauvegarde de Sagesse ; en cas d'échec, elle devient un mouton pour la durée du sort.\n\nSous cette forme, elle est de taille Petite, a une CA de 10 et une vitesse de 9 m ; elle ne peut ni parler, ni lancer de sorts, ni utiliser d'objets, et ses seules attaques sont des coups de tête (1d6 dégâts contondants). Elle conserve ses points de vie, son Intelligence et ses souvenirs. **Le sort prend fin dès qu'elle subit des dégâts.** Les métamorphes et les créatures de plus de 9 dés de vie (ou de FP supérieur à 6) réussissent automatiquement.",
    activites: [{ type: "save", nom: "Métamorphose", sauvegarde: { carac: ["wis"], reussite: "none" }, effets: [0] }]
  }),
  sort({
    cle: "blizzard", nom: "Blizzard", niveau: 4, ecole: "con", tradition: "arcanes",
    classes: ["wizard", "sorcerer", "druid"], concentration: true, duree: [1, "minute"], portee: [45, "m"],
    gabarit: ["cylinder", 6, { hauteur: 9 }], cible: ["", "creature"],
    img: I("magic/air/wind-weather-snow-gusts"),
    texte: "Une tempête de neige et de grêle s'abat dans un cylindre de 6 m de rayon et 9 m de haut centré sur un point à portée. La zone est **fortement obscurcie** et constitue un **terrain difficile**.\n\nQuand une créature entre dans la zone pour la première fois lors d'un tour ou y commence son tour, elle fait un jet de sauvegarde de Constitution ; elle subit **4d6** dégâts de froid en cas d'échec, la moitié en cas de réussite. Une créature ne subit ces dégâts qu'une fois par tour. Les flammes nues s'éteignent dans la zone.",
    niveauxSuperieurs: "Les dégâts augmentent de 1d6 par niveau d'emplacement au-delà du 4e.",
    activites: [{ type: "save", nom: "Morsure du blizzard", sauvegarde: { carac: ["con"], reussite: "half" }, degats: [{ des: "4d6", types: ["cold"], echelle: 1 }] }]
  }),
  sort({
    cle: "portail-de-dalaran", nom: "Portail du Kirin Tor", niveau: 5, ecole: "con", tradition: "arcanes",
    classes: ["wizard", "sorcerer"], incantation: ["minute", 1], duree: [1, "minute"], portee: [3, "m"], cible: ["", "space"],
    composantes: ["vocal", "somatic", "material"], materiel: { texte: "de la poudre d'arcanite valant au moins 100 po, que le sort consume", cout: 100, consomme: true },
    img: I("environment/wilderness/portal"),
    texte: "Vous tracez un cercle de runes violettes sur le sol et l'accordez à une **pierre de portail** que vous avez déjà touchée : les mages du Kirin Tor en ont laissé dans les ruines de Dalaran, à Theramore, à Hurlevent et dans quelques tours oubliées. Un portail de 3 m de diamètre s'ouvre à portée et reste ouvert pour la durée du sort.\n\nToute créature qui entre dans le portail arrive instantanément à 1,5 m de la pierre choisie, ou dans l'espace libre le plus proche. Le portail fonctionne dans les deux sens. Un mage qui l'ouvre sans l'accord du Kirin Tor vers une de ses pierres sera retrouvé, tôt ou tard.",
    activites: [{ type: "utility", nom: "Ouvrir le portail" }]
  }),

  // ===== Gangrène et ombre : démonistes
  sort({
    cle: "trait-de-l-ombre", nom: "Trait de l'ombre", niveau: 0, ecole: "nec", tradition: "gangrene",
    classes: ["warlock", "sorcerer", "wizard"], portee: [27, "m"], cible: ["1", "creature"],
    img: I("magic/unholy/projectile-fireball-agile-purple"),
    texte: "Vous rassemblez l'ombre entre vos doigts et la projetez comme une flèche noire. Faites une attaque de sort à distance contre une créature à portée ; en cas de réussite, elle subit **1d8** dégâts nécrotiques.\n\nL'ombre n'est pas la gangrène : ce tour ne laisse pas de marque. Mais il a le goût de cendre froide, et les paladins le reconnaissent.",
    niveauxSuperieurs: "Les dégâts augmentent de 1d8 aux niveaux 5 (2d8), 11 (3d8) et 17 (4d8).",
    activites: [{ type: "attack", attaque: { type: "ranged" }, degats: [{ des: "1d8", types: ["necrotic"], echelle: 1 }] }]
  }),
  sort({
    cle: "fletrissure-gangrenee", nom: "Flétrissure gangrenée", niveau: 1, ecole: "nec", tradition: "gangrene",
    classes: ["warlock", "sorcerer"], concentration: true, duree: [1, "minute"], portee: [27, "m"], cible: ["1", "creature"],
    img: I("magic/unholy/projectile-smoke-tendril-green.webp"),
    effets: [
      { nom: "Flétrissure", duree: 60, texte: "À la fin de chacun de ses tours, la créature subit 1d8 dégâts nécrotiques (activité « Ronger »), puis refait le jet de sauvegarde de Constitution ; le sort prend fin pour elle en cas de réussite." },
      marqueGangrene()
    ],
    texte: "Une brume verte s'enroule autour d'une créature à portée et s'insinue dans ses plaies. Elle fait un jet de sauvegarde de Constitution. En cas d'échec, elle subit **2d8** dégâts nécrotiques et la flétrissure s'installe : à la fin de chacun de ses tours, elle subit **1d8** dégâts nécrotiques puis refait le jet de sauvegarde, le sort prenant fin pour elle en cas de réussite. En cas de réussite au premier jet, elle ne subit que la moitié des dégâts initiaux et la flétrissure ne prend pas.\n\n" + PRIX_TEXTE,
    niveauxSuperieurs: "Les dégâts initiaux augmentent de 1d8 par niveau d'emplacement au-delà du 1er (le prix de la gangrène aussi, puisqu'il suit le niveau de l'emplacement).",
    activites: [
      { type: "save", nom: "Flétrissure", sauvegarde: { carac: ["con"], reussite: "half" }, degats: [{ des: "2d8", types: ["necrotic"], echelle: 1 }], effets: [0] },
      { type: "damage", nom: "Ronger", activation: ["special"], condition: "Fin de chacun des tours de la cible", emplacement: false, degats: [{ des: "1d8", types: ["necrotic"] }] },
      prixGangrene(1)
    ]
  }),
  sort({
    cle: "hurlement-de-terreur", nom: "Hurlement de terreur", niveau: 4, ecole: "enc", tradition: "gangrene",
    classes: ["warlock", "sorcerer", "bard"], concentration: true, duree: [1, "minute"], portee: ["", "self"],
    gabarit: ["radius", 9], cible: ["", "enemy"],
    img: I("magic/control/fear-fright-shadow-monster-green"),
    effets: [
      { nom: "Terrorisé", etats: ["frightened"], duree: 60, texte: "La créature est effrayée par vous. À son tour, elle doit utiliser son mouvement pour s'éloigner de vous par le chemin le plus sûr. À la fin de chacun de ses tours où elle ne vous voit pas, elle refait le jet de sauvegarde de Sagesse et se reprend en cas de réussite." },
      marqueGangrene()
    ],
    texte: "Vous poussez un cri qui n'est pas le vôtre : la voix du démon qui vous a donné ce pouvoir. Chaque ennemi situé à 9 m ou moins de vous et qui peut vous entendre fait un jet de sauvegarde de Sagesse ; en cas d'échec, il a l'état **Effrayé** pour la durée du sort et doit, à son tour, utiliser son mouvement pour s'éloigner de vous.\n\nÀ la fin de chacun de ses tours où il ne peut pas vous voir, un ennemi effrayé refait le jet de sauvegarde et se reprend en cas de réussite.\n\n" + PRIX_TEXTE,
    activites: [
      { type: "save", nom: "Hurlement", sauvegarde: { carac: ["wis"], reussite: "none" }, effets: [0] },
      prixGangrene(1)
    ]
  })
];

// ---------- Listes de sorts : un journal, une page « spells » par classe (convention de dnd5e 6.0.6)
// À déclarer dans module.json : flags.dnd5e.spellLists = UUID_LISTES_SORTS.
const CLE_LISTES = "listes-de-sorts-azeroth";
const ID_JOURNAL_LISTES = identifiant(`journaux:${CLE_LISTES}`);
const CLASSES_LISTEES = Object.keys(CLASSES_SORTS).filter(c => SORTS.some(s => s.flags[MODULE].classes.includes(c)));
const idPage = c => identifiant(`journaux:${CLE_LISTES}:${c}`);

export const UUID_LISTES_SORTS = CLASSES_LISTEES.map(c =>
  `Compendium.${MODULE}.journaux.JournalEntry.${ID_JOURNAL_LISTES}.JournalEntryPage.${idPage(c)}`);

export const LISTES_SORTS = [{
  __pack: "journaux", __cle: `journaux:${CLE_LISTES}`,
  _id: ID_JOURNAL_LISTES, _key: `!journal!${ID_JOURNAL_LISTES}`, name: "Listes de sorts d'Azeroth", folder: null, sort: 0, categories: [],
  ownership: { default: 2 }, flags: { [MODULE]: { cle: CLE_LISTES } }, _stats: STATS,
  pages: CLASSES_LISTEES.map((c, i) => {
    const sorts = SORTS.filter(s => s.flags[MODULE].classes.includes(c)).sort((a, b) => a.system.level - b.system.level);
    const texte = `Sorts d'Azeroth ajoutés à la liste du ${CLASSES_SORTS[c].toLowerCase()} par le module La Kour Warcraft. Une fois cette liste déclarée par le module, dnd5e les range avec les sorts du SRD dans le navigateur de compendium (filtre « Liste de sorts ») et sur la fiche de la classe.\n\n${sorts.map(s => `- **${s.name}** (${s.system.level === 0 ? "tour de magie" : `niveau ${s.system.level}`}) : ${TRADITIONS[s.flags[MODULE].tradition]}`).join("\n")}`;
    const pid = idPage(c);
    return {
      _id: pid, _key: `!journal.pages!${ID_JOURNAL_LISTES}.${pid}`, name: `${CLASSES_SORTS[c]} — sorts d'Azeroth`, type: "spells",
      sort: (i + 1) * 100, title: { show: true, level: 1 }, text: { content: html(texte), format: 1 },
      system: {
        type: "class", identifier: c, grouping: "level", description: { value: html(texte) },
        spells: sorts.map(s => ({ __ref: s.__cle, __uuid: true })), unlinkedSpells: []
      },
      ownership: { default: -1 }, flags: {}
    };
  })
}];

// Référence vers un sort du module (pour les dons et les objets d'autres fichiers).
export const refSort = cle => ref(`sorts:${cle}`);
