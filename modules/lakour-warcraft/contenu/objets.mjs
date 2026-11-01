// Constructeurs dnd5e 6.0.6 (règles 2024) du module lakour-warcraft : peuples, traits de peuple, historiques, dons,
// armes, armures, consommables et butin. Formes relevées dans les compendiums SRD de dnd5e 6.0.6 (origins24,
// feats24, equipment24) et dans les objets incorporés les plus récents (5.3 et 6.0 : advancement indexé par _id,
// senses.ranges, movement.walk en chaîne, activités avec `visibility`, config de sort `method`/`prepared`).
// Toutes les distances sont en mètres, comme les PNJ (acteurs.mjs) et les scènes (case de 1,5 m) : vitesses, sens,
// portées, allonges et zones s'écrivent en mètres (5 pieds = 1,5 m) et leurs unités valent « m ».
// Chaque constructeur vérifie ses clés et lève une erreur sur une valeur inconnue du système : un contenu faux
// ne se fabrique pas. Utilisés par peuples.mjs, historiques.mjs et objets-azeroth.mjs.
import { MODULE, STATS, identifiant, html } from "./aides.mjs";

// ---------- Clés de dnd5e (CONFIG.DND5E) vérifiées par les constructeurs et par les essais

export const CARACTERISTIQUES = ["str", "dex", "con", "int", "wis", "cha"];
export const COMPETENCES = ["acr", "ani", "arc", "ath", "dec", "his", "ins", "itm", "inv", "med", "nat", "prc", "prf", "per", "rel", "slt", "ste", "sur"];
export const TAILLES = ["tiny", "sm", "med", "lg", "huge", "grg"];
export const DOMMAGES = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
export const SOINS = ["healing", "temphp"];
export const ETATS = ["blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"];
export const OUTILS = {
  art: ["alchemist", "brewer", "calligrapher", "carpenter", "cartographer", "cobbler", "cook", "glassblower", "jeweler", "leatherworker", "mason", "painter", "potter", "smith", "tinker", "weaver", "woodcarver"],
  game: ["chess", "card", "dice"],
  music: ["bagpipes", "drum", "dulcimer", "flute", "horn", "lute", "lyre", "panflute", "shawm", "viol"],
  vehicle: ["air", "land", "space", "water"],
  seuls: ["disg", "forg", "herb", "navg", "pois", "thief"]
};
export const LANGUES = {
  standard: ["common", "sign", "draconic", "dwarvish", "elvish", "giant", "gnomish", "goblin", "halfling", "orc"],
  exotic: ["aarakocra", "abyssal", "celestial", "deep", "gith", "gnoll", "infernal", "primordial", "sylvan", "undercommon", "cant", "druidic"]
};
const ACTIVATIONS = ["", "action", "bonus", "reaction", "minute", "hour", "day", "longRest", "shortRest", "special"];
const PERIODES = ["lr", "sr", "day", "dawn", "dusk", "initiative", "turnStart", "turnEnd"];
const DUREES = ["inst", "turn", "round", "minute", "hour", "day", "perm", "spec"];
// Unités de portée : mètres seulement (« m », « km ») ; « ft » et « mi » sont refusés.
const PORTEES = ["self", "touch", "m", "km", "spec", "any"];
export const UNITES = "m";
const CIBLES = ["", "self", "creature", "ally", "enemy", "object", "space", "any"];
const GABARITS = ["", "circle", "cone", "cube", "cylinder", "line", "radius", "sphere", "square", "wall"];
const MODES_CHANGEMENT = ["add", "multiply", "override", "upgrade", "downgrade", "custom"];
const TYPES_ARME = ["simpleM", "simpleR", "martialM", "martialR", "natural", "improv"];
const TYPES_ARMURE = ["light", "medium", "heavy", "shield", "clothing", "trinket", "ring", "rod", "wand", "wondrous"];
const TYPES_CONSOMMABLE = ["ammo", "food", "poison", "potion", "rod", "scroll", "trinket", "wand"];
const TYPES_BUTIN = ["art", "gear", "gem", "junk", "material", "resource", "treasure"];
const MAITRISES = ["cleave", "graze", "nick", "push", "sap", "slow", "topple", "vex"];
const PROPRIETES_ARME = ["ada", "amm", "fin", "fir", "foc", "hvy", "lgt", "lod", "mgc", "rch", "rel", "ret", "sil", "spc", "thr", "two", "ver"];
const PROPRIETES_EQUIPEMENT = ["ada", "foc", "mgc", "stealthDisadvantage"];
const RARETES = ["", "common", "uncommon", "rare", "veryRare", "legendary", "artifact"];
const MONNAIES = ["pp", "gp", "ep", "sp", "cp"];

// Dons d'origine du SRD 2024 (compendium dnd5e.feats24) : référencés tels quels, jamais recopiés.
export const DONS_SRD = {
  vigilant: "Compendium.dnd5e.feats24.Item.phbftAlert000000",
  initieMagie: "Compendium.dnd5e.feats24.Item.phbftMagicInitia",
  attaquantSauvage: "Compendium.dnd5e.feats24.Item.phbftSavageAttac",
  doue: "Compendium.dnd5e.feats24.Item.phbftSkilled0000"
};
// Sorts du SRD 2024 (dnd5e.spells24) accordés par certains traits.
export const SORTS_SRD = {
  bricolage: "Compendium.dnd5e.spells24.Item.phbsplMending000",
  druidisme: "Compendium.dnd5e.spells24.Item.phbsplDruidcraft",
  thaumaturgie: "Compendium.dnd5e.spells24.Item.phbsplThaumaturg",
  prestidigitation: "Compendium.dnd5e.spells24.Item.phbsplPrestidigi",
  detectionMagie: "Compendium.dnd5e.spells24.Item.phbsplDetectMagi",
  lumiere: "Compendium.dnd5e.spells24.Item.phbsplLight00000",
  parlerAnimaux: "Compendium.dnd5e.spells24.Item.phbsplSpeakwithA",
  illusionMineure: "Compendium.dnd5e.spells24.Item.phbsplMinorIllus"
};
// Équipement du SRD 2024 (dnd5e.equipment24) cité dans l'équipement de départ des historiques.
const E = id => `Compendium.dnd5e.equipment24.Item.${id}`;
export const EQUIPEMENT_SRD = {
  arc: E("phbwepShortbow00"), arcLong: E("phbwepLongbow000"), carquois: E("phbagQuiver00000"), fleches: E("phbamoArrows0000"),
  lance: E("phbwepSpear00000"), dague: E("phbwepDagger0000"), hachette: E("phbwepHandaxe000"), baton: E("phbwepQuartersta"),
  javeline: E("phbwepJavelin000"), cimeterre: E("phbwepScimitar00"), masse: E("phbwepMace000000"),
  bouclier: E("phbarmShield0000"), cuir: E("phbarmLeatherArm"),
  trousseSoins: E("phbagHealersKit0"), potionSoins: E("phbagPotionofHea"), sacoche: E("phbagPouch000000"), sac: E("phbagBackpack000"),
  vetementsVoyage: E("phbagClothesTrav"), vetementsFins: E("phbagClothesFine"), robe: E("phbagRobe0000000"), couverture: E("phbagBlanket0000"),
  corde: E("phbagRope0000000"), rations: E("phbagRations0000"), outre: E("phbagWaterskin00"), torche: E("phbagTorch000000"),
  livre: E("phbagBook0000000"), parchemin: E("phbagParchment00"), encre: E("phbagInk00000000"), plume: E("phbagInkPen00000"),
  symboleSacre: E("phbagHolySymbolV"), focaliseurArcanique: E("phbagArcaneFocus"), focaliseurDruidique: E("phbagDruidicFocu"),
  piege: E("phbagHuntingTrap"), longueVue: E("phbagSpyglass100"), lampe: E("phbagLamp0000000"),
  outilsForgeron: E("phbtulSmithsTool"), outilsBricoleur: E("phbtulTinkersToo"), outilsNavigateur: E("phbtulNavigators"),
  outilsCalligraphe: E("phbtulCalligraph"), herboristerie: E("phbtulHerbalismK"), outilsCuisinier: E("phbtulCooksUtens"),
  outilsSculpteur: E("phbtulWoodcarver"), outilsMaroquinier: E("phbtulLeatherwor")
};

// ---------- Vérifications : une valeur inconnue de dnd5e lève une erreur à la construction.

export function exiger(condition, message) {
  if (!condition) throw new Error(message);
}
// Une distance en mètres tombe-t-elle sur un nombre entier de cases de 1,5 m ?
const casesEntieres = m => Math.abs(m / 1.5 - Math.round(m / 1.5)) < 1e-9;
const dans = (liste, valeur, quoi, ou) => exiger(liste.includes(valeur), `${ou} : ${quoi} « ${valeur} » inconnu de dnd5e`);

// Clé de maîtrise d'un avancement Trait : "skills:ath", "tool:art:smith", "languages:standard:orc", "dr:fire"…
export function cleTrait(cle, ou = "trait") {
  const [famille, a, b] = String(cle).split(":");
  const etoile = v => v === "*";
  const ok = {
    skills: () => etoile(a) || COMPETENCES.includes(a),
    saves: () => etoile(a) || CARACTERISTIQUES.includes(a),
    dr: () => DOMMAGES.includes(a), di: () => DOMMAGES.includes(a), dv: () => DOMMAGES.includes(a),
    ci: () => ETATS.includes(a),
    armor: () => ["lgt", "med", "hvy", "shl"].includes(a),
    weapon: () => etoile(a) || ["sim", "mar"].includes(a),
    tool: () => etoile(a) || OUTILS.seuls.includes(a) || (OUTILS[a] && !b) || (OUTILS[a] && (etoile(b) || OUTILS[a].includes(b))),
    languages: () => etoile(a) || (LANGUES[a] && (etoile(b) || LANGUES[a].includes(b)))
  }[famille];
  exiger(ok && ok(), `${ou} : clé de maîtrise « ${cle} » inconnue de dnd5e`);
  return cle;
}

// ---------- Briques communes

const SOURCE = { custom: "La Kour Warcraft", rules: "2024", revision: 1, book: "", page: "", license: "" };
const VISIBILITE = () => ({ level: {}, requireAttunement: false, requireIdentification: false, requireMagic: false });

// « 2d6 » -> { number: 2, denomination: 6 } ; toute autre formule (« (@prof)d4 ») passe en formule libre.
function des(texte = "", bonus = "") {
  const m = /^(\d+)d(\d+)$/.exec(String(texte).trim());
  const formule = m || !texte ? "" : String(texte);
  return {
    number: m ? Number(m[1]) : null, denomination: m ? Number(m[2]) : null, bonus: String(bonus ?? ""),
    custom: { enabled: Boolean(formule), formula: formule }, scaling: { mode: "", number: null, formula: "" }
  };
}
const partie = (p, ou) => {
  for (const t of p.types) dans(DOMMAGES, t, "type de dommages", ou);
  return { ...des(p.des, p.bonus), types: p.types };
};

const utilisations = (u, ou) => {
  if (!u) return { max: "", spent: 0, recovery: [] };
  dans(PERIODES, u.periode, "période de récupération", ou);
  return { max: String(u.max), spent: 0, recovery: [{ period: u.periode, type: "recoverAll" }] };
};

// Effet actif (forme Foundry 14 relevée dans dnd5e 6.0 : type "base", system.changes avec type et phase).
// e = { nom, changements: [[cle, valeur, mode = "add"]], transfert = true, duree (secondes), etats, texte }
function effet(base, parent, i, e, img, ou) {
  const _id = identifiant(`${base}:effet:${i}`);
  for (const s of e.etats ?? []) dans(ETATS, s, "état", ou);
  return {
    _id, _key: `!items.effects!${parent}.${_id}`, name: e.nom, img: e.img ?? img, type: "base",
    system: {
      changes: (e.changements ?? []).map(([key, value, type = "add"], j) => {
        dans(MODES_CHANGEMENT, type, "mode de changement", ou);
        return { key, value, priority: null, type, phase: "initial", _id: identifiant(`${base}:effet:${i}:${j}`) };
      })
    },
    disabled: false, duration: { value: e.duree ?? null, units: "seconds", expiry: e.duree ? "turnStart" : null, expired: false },
    description: html(e.texte ?? ""), origin: null, tint: "#ffffff", transfer: e.transfert ?? true,
    statuses: e.etats ?? [], sort: 0, flags: {}, start: null, showIcon: 1, folder: null, _stats: STATS
  };
}

// Activité dnd5e. a = { type, nom, activation, condition, duree: [valeur, unité], portee: [valeur en m, "m"],
// activationValeur (ex. 10 pour « 10 minutes »), cible: [nombre, type], gabarit: [type, taille en m], consomme, soin: { des, bonus, type }, degats: [{ des, bonus, types }],
// sauvegarde: { carac: [...], dd: "con" | nombre, reussite: "half" | "none" }, attaque: { type, carac, classement },
// jet: { nom, formule }, effets: [indices des effets du document] }
const TYPES_ACTIVITE = ["utility", "heal", "damage", "save", "attack"];
function activite(base, i, a, idsEffets, avecUtilisations, ou) {
  dans(TYPES_ACTIVITE, a.type, "type d'activité", ou);
  dans(ACTIVATIONS, a.activation ?? "action", "activation", ou);
  const [dureeValeur = "", dureeUnite = "inst"] = a.duree ?? [];
  dans(DUREES, dureeUnite, "unité de durée", ou);
  const [porteeValeur = "", porteeUnite = "self"] = a.portee ?? [];
  dans(PORTEES, porteeUnite, "portée", ou);
  const [cibleNombre = "", cibleType = porteeUnite === "self" ? "self" : "creature"] = a.cible ?? [];
  dans(CIBLES, cibleType, "type de cible", ou);
  const [gabarit = "", taille = ""] = a.gabarit ?? [];
  dans(GABARITS, gabarit, "gabarit", ou);
  const effets = (a.effets ?? []).map(n => {
    exiger(idsEffets[n], `${ou} : l'activité cite l'effet n° ${n}, absent du document`);
    return a.type === "save" ? { _id: idsEffets[n], onSave: false, level: {} } : { _id: idsEffets[n], level: {} };
  });
  const consomme = a.consomme ?? avecUtilisations;
  const sortie = {
    _id: identifiant(`${base}:activite:${i}`), type: a.type, name: a.nom ?? "", img: null, sort: i * 100000, flags: {},
    activation: { type: a.activation ?? "action", value: a.activationValeur ?? null, condition: a.condition ?? "", override: false },
    consumption: { scaling: { allowed: false, max: "" }, spellSlot: true, targets: consomme ? [{ type: "itemUses", value: "1", target: "", scaling: {} }] : [] },
    description: { chatFlavor: "" },
    duration: { value: String(dureeValeur), units: dureeUnite, concentration: false, special: "", override: false },
    effects: effets,
    range: { value: String(porteeValeur), units: porteeUnite, special: "", override: false },
    target: {
      template: { count: "", contiguous: false, type: gabarit, size: String(taille), width: "", height: "", units: UNITES, stationary: false },
      affects: { count: String(cibleNombre), type: cibleType, choice: false, special: "" }, prompt: Boolean(gabarit), override: false
    },
    uses: { spent: 0, recovery: [], max: "" },
    visibility: VISIBILITE()
  };
  if (a.type === "heal") {
    dans(SOINS, a.soin.type ?? "healing", "type de soin", ou);
    sortie.healing = { ...des(a.soin.des, a.soin.bonus), types: [a.soin.type ?? "healing"] };
  }
  if (a.type === "damage") sortie.damage = { critical: { allow: false, bonus: "" }, parts: a.degats.map(p => partie(p, ou)) };
  if (a.type === "save") {
    for (const c of a.sauvegarde.carac) dans(CARACTERISTIQUES, c, "caractéristique de sauvegarde", ou);
    const dd = a.sauvegarde.dd;
    if (typeof dd === "string") dans(CARACTERISTIQUES, dd, "caractéristique du DD", ou);
    sortie.save = { ability: a.sauvegarde.carac, dc: typeof dd === "number" ? { calculation: "", formula: String(dd) } : { calculation: dd, formula: "" } };
    sortie.damage = { onSave: a.sauvegarde.reussite ?? "half", parts: (a.degats ?? []).map(p => partie(p, ou)) };
  }
  if (a.type === "attack") {
    if (a.attaque?.carac) dans(CARACTERISTIQUES, a.attaque.carac, "caractéristique d'attaque", ou);
    sortie.attack = {
      ability: a.attaque?.carac ?? "", bonus: "", critical: { threshold: null }, flat: false,
      type: { value: a.attaque?.type ?? "melee", classification: a.attaque?.classement ?? "weapon" }
    };
    sortie.damage = { critical: { bonus: "" }, includeBase: a.attaque?.base ?? true, parts: (a.degats ?? []).map(p => partie(p, ou)) };
  }
  if (a.type === "utility") sortie.roll = { prompt: false, visible: Boolean(a.jet), name: a.jet?.nom ?? "", formula: a.jet?.formule ?? "" };
  return sortie;
}

// Document Item commun : identifiant stable, description HTML, source, effets puis activités (qui citent les effets).
function element(pack, type, d, systeme) {
  const ou = `${pack}:${d.cle}`;
  exiger(/^[a-z0-9-]+$/.test(d.cle ?? ""), `clé invalide : « ${d.cle} » (minuscules, chiffres et tirets)`);
  exiger(d.nom, `${ou} : nom manquant`);
  exiger(d.img, `${ou} : image manquante`);
  const _id = identifiant(ou);
  const effets = (d.effets ?? []).map((e, i) => effet(ou, _id, i, e, d.img, ou));
  const activites = Object.fromEntries((d.activites ?? []).map((a, i) => {
    const act = activite(ou, i, a, effets.map(e => e._id), Boolean(d.utilisations), ou);
    return [act._id, act];
  }));
  return {
    __pack: pack, __cle: ou,
    _id, _key: `!items!${_id}`, name: d.nom, type, img: d.img,
    system: {
      description: { value: html(d.texte), chat: "" }, source: SOURCE, identifier: d.cle,
      ...systeme({ ou, activites, uses: utilisations(d.utilisations, ou) })
    },
    effects: effets, folder: null, sort: d.ordre ?? 0, ownership: { default: 0 },
    flags: { [MODULE]: { cle: d.cle } }, _stats: STATS
  };
}

// ---------- Avancements (forme 5.3+ : objet indexé par _id)

const avancement = (base, n, type, configuration, extra = {}) => {
  const _id = identifiant(`${base}:avancement:${n}`);
  return [_id, { _id, type, configuration, value: extra.value ?? {}, level: extra.niveau ?? 0, title: extra.titre ?? "", hint: extra.indice ?? "", flags: {} }];
};
// Références vers d'autres objets : uuid dnd5e (chaîne) ou objet du module (ref "pack:cle" résolue en uuid).
const uuidDe = (r, ou) => {
  if (typeof r === "string") {
    exiger(/^Compendium\.dnd5e\.[a-z0-9]+\.Item\.[A-Za-z0-9]{16}$/.test(r), `${ou} : uuid dnd5e mal formé « ${r} »`);
    return r;
  }
  exiger(r?.__cle || r?.__ref, `${ou} : référence d'objet invalide`);
  return { __ref: r.__cle ?? r.__ref, __uuid: true };
};
const octroi = (base, n, objets, titre, extra = {}) => avancement(base, n, "ItemGrant",
  { items: objets.map(o => ({ uuid: uuidDe(o, base), optional: false })), optional: false, spell: extra.sort ?? null },
  { titre, ...extra });
const maitrises = (base, n, { accordees = [], choix = [] }, titre, indice = "") => avancement(base, n, "Trait", {
  mode: "default", allowReplacements: false,
  grants: accordees.map(k => cleTrait(k, base)),
  choices: choix.map(c => ({ count: c.nombre ?? 1, pool: c.parmi.map(k => cleTrait(k, base)) }))
}, { titre, indice, value: { chosen: [] } });
// Sort accordé : tour de magie (à volonté) ou sort de niveau 1+ lancé une fois par repos long sans emplacement.
const configSort = (s, ou) => {
  for (const c of s.carac ?? ["int", "wis", "cha"]) dans(CARACTERISTIQUES, c, "caractéristique d'incantation", ou);
  return s.parRepos
    ? { ability: s.carac ?? ["int", "wis", "cha"], method: "spell", prepared: 2, uses: { max: "1", per: "lr", requireSlot: false } }
    : { ability: s.carac ?? ["int", "wis", "cha"], method: "", prepared: 0, uses: { max: "", per: "", requireSlot: false } };
};

// ---------- Traits de peuple (feat, system.type.value = "race")
// d = { cle, nom, peuple, texte, img, utilisations: { max, periode }, activites, effets,
//       maitrises: { accordees, choix }, sorts: [{ uuid, niveau, carac, parRepos }] }
// Les maîtrises et les sorts sont portés par le peuple (avancements Trait et ItemGrant), comme dans le SRD.
export function trait(d) {
  const doc = element("peuples", "feat", d, ({ activites, uses }) => ({
    type: { value: "race", subtype: "" }, requirements: d.peuple, prerequisites: { level: d.niveau ?? null, repeatable: false, items: [] },
    properties: [], activities: activites, uses, advancement: {}, enchant: {}, cover: null, crewed: false
  }));
  if (d.maitrises) for (const k of [...(d.maitrises.accordees ?? []), ...(d.maitrises.choix ?? []).flatMap(c => c.parmi)]) cleTrait(k, doc.__cle);
  doc.__maitrises = d.maitrises ?? null;
  doc.__sorts = (d.sorts ?? []).map(s => ({ ...s, config: configSort(s, doc.__cle) }));
  return doc;
}

// ---------- Peuples (race)
// d = { cle, nom, sousType, taille: ["med"], indiceTaille, vitesse, vision, nage, escalade (en mètres), traits: [docs de trait],
//       donAuChoix: [refs de dons d'origine], texte, img }
export function peuple(d) {
  const ou = `peuples:${d.cle}`;
  const tailles = [].concat(d.taille ?? "med");
  for (const t of tailles) dans(TAILLES, t, "taille", ou);
  // Bornes d'un peuple 2024 (20 à 40 pieds), en mètres et par pas de 1,5 m.
  exiger(Number.isFinite(d.vitesse) && d.vitesse >= 6 && d.vitesse <= 12 && casesEntieres(d.vitesse), `${ou} : vitesse ${d.vitesse} m hors des bornes d'un peuple 2024 (6 à 12 m, par pas de 1,5 m)`);
  exiger([null, undefined, 18, 36].includes(d.vision), `${ou} : vision dans le noir ${d.vision} m (18 ou 36 m attendus)`);
  exiger(d.traits?.length >= 2 && d.traits.length <= 4, `${ou} : ${d.traits?.length ?? 0} traits (2 à 4 attendus)`);
  for (const t of d.traits) exiger(t.__cle?.startsWith("peuples:") && t.system?.type?.value === "race", `${ou} : ${t.__cle ?? t} n'est pas un trait de peuple`);

  let n = 0;
  const avancements = [
    avancement(ou, n++, "Size", { sizes: tailles }, { indice: d.indiceTaille ?? "" }),
    octroi(ou, n++, d.traits, `Traits : ${d.nom}`)
  ];
  for (const t of d.traits) {
    if (t.__maitrises) avancements.push(maitrises(ou, n++, t.__maitrises, t.name, t.__maitrises.indice ?? ""));
    for (const s of t.__sorts) avancements.push(octroi(ou, n++, [s.uuid], t.name, { niveau: s.niveau ?? 0, sort: s.config }));
  }
  if (d.donAuChoix) {
    avancements.push(avancement(ou, n++, "ItemChoice", {
      choices: { 0: { count: 1, replacement: false } }, allowDrops: true, type: "feat",
      pool: d.donAuChoix.map(r => ({ uuid: uuidDe(r, ou) })), spell: null, restriction: { type: "feat", subtype: "origin", list: [] }
    }, { titre: "Don d'origine au choix", value: { added: {}, replaced: {} } }));
  }
  return element("peuples", "race", d, () => ({
    advancement: Object.fromEntries(avancements),
    movement: {
      walk: String(d.vitesse), burrow: null, climb: d.escalade ? String(d.escalade) : null, fly: null,
      swim: d.nage ? String(d.nage) : null, units: UNITES, hover: false, ignoredDifficultTerrain: []
    },
    senses: { units: UNITES, special: "", ranges: { darkvision: d.vision ?? null, blindsight: null, tremorsense: null, truesight: null } },
    type: { value: "humanoid", custom: "", subtype: d.sousType ?? d.nom }
  }));
}

// ---------- Dons (feat). Don d'origine du module : system.type = { value: "feat", subtype: "origin" }.
// d = { cle, nom, texte, img, categorie = "origin", utilisations, activites, effets, maitrises, sorts }
export function don(d) {
  const ou = `historiques:${d.cle}`;
  let n = 0;
  const avancements = [];
  if (d.maitrises) avancements.push(maitrises(ou, n++, d.maitrises, d.nom));
  for (const s of d.sorts ?? []) avancements.push(octroi(ou, n++, [s.uuid], d.nom, { niveau: s.niveau ?? 0, sort: configSort(s, ou) }));
  return element("historiques", "feat", d, ({ activites, uses }) => ({
    type: { value: "feat", subtype: d.categorie ?? "origin" }, requirements: "", prerequisites: { level: null, repeatable: false, items: [] },
    properties: [], activities: activites, uses, advancement: Object.fromEntries(avancements), enchant: {}, cover: null, crewed: false
  }));
}

// ---------- Historiques (background, format 2024)
// d = { cle, nom, carac: [3 caractéristiques], competences: [2], outil: "tool:…" | { choix: [...] }, don: uuid SRD | doc,
//       langues: { accordees, choix }, equipement: [[uuid | doc, quantité]], or: pièces d'or de l'option A, richesse: option B }
export function historique(d) {
  const ou = `historiques:${d.cle}`;
  exiger(d.carac?.length === 3 && new Set(d.carac).size === 3, `${ou} : il faut trois caractéristiques distinctes`);
  for (const c of d.carac) dans(CARACTERISTIQUES, c, "caractéristique", ou);
  exiger(d.competences?.length === 2, `${ou} : il faut deux compétences`);
  for (const c of d.competences) dans(COMPETENCES, c, "compétence", ou);
  exiger(d.don, `${ou} : don d'origine manquant`);
  if (typeof d.don !== "string") exiger(d.don.system?.type?.subtype === "origin", `${ou} : ${d.don.__cle} n'est pas un don d'origine`);
  const outil = typeof d.outil === "string" ? { accordees: [d.outil] } : { choix: [{ parmi: d.outil.choix }] };
  for (const k of [...(outil.accordees ?? []), ...(outil.choix?.[0].parmi ?? [])]) exiger(k.startsWith("tool:"), `${ou} : « ${k} » n'est pas un outil`);
  const langues = d.langues ?? { accordees: ["languages:standard:common"], choix: [{ nombre: 2, parmi: ["languages:standard:*"] }] };

  let n = 0;
  const avancements = [
    avancement(ou, n++, "AbilityScoreImprovement", {
      cap: 2, fixed: Object.fromEntries(CARACTERISTIQUES.map(c => [c, 0])),
      locked: CARACTERISTIQUES.filter(c => !d.carac.includes(c)), points: 3, recommendation: null, max: null
    }, { titre: "Amélioration de caractéristiques de l'historique", indice: "Augmentez l'une des trois caractéristiques de 2 et une autre de 1, ou les trois de 1, sans dépasser 20." }),
    maitrises(ou, n++, { accordees: [...d.competences.map(c => `skills:${c}`), ...(outil.accordees ?? [])], choix: outil.choix ?? [] }, "Maîtrises de l'historique"),
    octroi(ou, n++, [d.don], "Don d'origine"),
    maitrises(ou, n++, langues, "Langues", "Le commun de votre faction, plus deux langues au choix (voir le guide du joueur).")
  ];
  // Équipement de départ (option A) : un groupe ET d'objets liés, plus des pièces d'or ; l'option B est `wealth`.
  const groupe = identifiant(`${ou}:equipement`);
  const depart = [{ _id: groupe, type: "AND", group: "", sort: 100000, requiresProficiency: false }];
  (d.equipement ?? []).forEach(([o, quantite], i) => depart.push({
    _id: identifiant(`${ou}:equipement:${i}`), type: "linked", key: uuidDe(o, ou), count: quantite ?? null,
    group: groupe, sort: (i + 2) * 100000, requiresProficiency: false
  }));
  if (d.or) depart.push({ _id: identifiant(`${ou}:equipement:or`), type: "currency", key: "gp", count: d.or, group: groupe, sort: 9900000, requiresProficiency: false });

  return element("historiques", "background", d, () => ({
    advancement: Object.fromEntries(avancements), startingEquipment: depart, wealth: String(d.richesse ?? 50)
  }));
}

// ---------- Objets physiques : prix, poids, rareté, harmonisation

const physique = (d, ou) => {
  dans(RARETES, d.rarete ?? "", "rareté", ou);
  const [valeur, monnaie = "gp"] = d.prix ?? [0, "gp"];
  dans(MONNAIES, monnaie, "monnaie", ou);
  return {
    price: { value: valeur, denomination: monnaie }, weight: { value: d.poids ?? 0, units: "lb" }, quantity: d.quantite ?? 1,
    rarity: d.rarete ?? "", identified: true, unidentified: { description: "" }, container: null
  };
};
const proprietes = (liste, permises, ou) => {
  for (const p of liste) dans(permises, p, "propriété", ou);
  return liste;
};

// Arme. d = { cle, nom, texte, img, categorie: "martialM", base, degats: { des, types: [...] }, polyvalente, proprietes,
//             maitrise, portee: [normale, longue] (m), allonge (m, 1,5 par défaut), bonus (magique), rarete, harmonisation,
//             prix: [valeur, monnaie], poids }
export function arme(d) {
  const ou = `objets:${d.cle}`;
  dans(TYPES_ARME, d.categorie, "catégorie d'arme", ou);
  if (d.maitrise) dans(MAITRISES, d.maitrise, "botte d'arme", ou);
  const distance = d.categorie.endsWith("R");
  const props = proprietes([...(d.proprietes ?? []), ...(d.bonus || d.magique ? ["mgc"] : [])], PROPRIETES_ARME, ou);
  return element("objets", "weapon", {
    ...d,
    activites: [{ type: "attack", activation: "action", portee: distance ? [d.portee?.[0] ?? "", UNITES] : [String(d.allonge ?? 1.5), UNITES], cible: ["1", "creature"], attaque: { type: distance ? "ranged" : "melee" }, consomme: false }, ...(d.activites ?? [])]
  }, ({ activites, uses }) => ({
    ...physique(d, ou), attunement: d.harmonisation ? "required" : "", attuned: false, equipped: false, cover: null, crewed: false,
    range: { value: d.portee?.[0] ?? null, long: d.portee?.[1] ?? null, reach: d.allonge ?? null, units: UNITES },
    uses, damage: {
      base: partie(d.degats, ou),
      versatile: d.polyvalente ? partie({ des: d.polyvalente, types: [] }, ou) : { ...des(), types: [] }
    },
    armor: { value: null }, hp: { value: null, max: null, dt: null, conditions: "" },
    type: { value: d.categorie, baseItem: d.base ?? "" }, magicalBonus: d.bonus ?? null, properties: props,
    proficient: null, activities: activites, ammunition: {}, mastery: d.maitrise ?? ""
  }));
}

// Équipement : armure, bouclier, vêtement, anneau, objet merveilleux…
// d = { cle, nom, texte, img, categorie: "heavy", base, ca, dexMax, force, discretion (désavantage), bonus,
//       proprietes, rarete, harmonisation, utilisations, activites, effets, prix, poids }
export function equipement(d) {
  const ou = `objets:${d.cle}`;
  dans(TYPES_ARMURE, d.categorie, "type d'équipement", ou);
  const props = proprietes([...(d.proprietes ?? []), ...(d.discretion ? ["stealthDisadvantage"] : []), ...(d.bonus || d.magique ? ["mgc"] : [])], PROPRIETES_EQUIPEMENT, ou);
  return element("objets", "equipment", d, ({ activites, uses }) => ({
    ...physique(d, ou), attunement: d.harmonisation ? "required" : "", attuned: false, equipped: false, cover: null, crewed: false,
    uses, armor: { value: d.ca ?? null, magicalBonus: d.bonus ?? null, dex: d.dexMax ?? null },
    hp: { value: null, max: null, dt: null, conditions: "" },
    type: { value: d.categorie, baseItem: d.base ?? "" }, properties: props,
    speed: { value: null, conditions: "", units: UNITES }, strength: d.force ?? null, proficient: null, activities: activites
  }));
}

// Consommable : potion, nourriture, poison, objet à usage unique. Une seule utilisation détruite par défaut.
// d = { cle, nom, texte, img, categorie: "potion", rarete, activites, effets, utilisations, prix, poids }
export function consommable(d) {
  const ou = `objets:${d.cle}`;
  dans(TYPES_CONSOMMABLE, d.categorie, "type de consommable", ou);
  const props = proprietes([...(d.proprietes ?? []), ...(d.magique ? ["mgc"] : [])], ["mgc"], ou);
  return element("objets", "consumable", { utilisations: { max: 1, periode: "lr" }, ...d }, ({ activites }) => ({
    ...physique(d, ou), attunement: "", attuned: false, equipped: false,
    uses: { max: String(d.utilisations?.max ?? 1), spent: 0, recovery: [], autoDestroy: d.detruit ?? true },
    damage: { base: { ...des(), types: [] }, replace: false },
    type: { value: d.categorie, subtype: d.sousType ?? "" }, magicalBonus: null, properties: props, activities: activites
  }));
}

// Butin : marchandise, gemme, trésor. d = { cle, nom, texte, img, categorie: "gem", prix, poids, quantite }
export function butin(d) {
  const ou = `objets:${d.cle}`;
  dans(TYPES_BUTIN, d.categorie, "type de butin", ou);
  return element("objets", "loot", d, () => ({ ...physique(d, ou), properties: [], type: { value: d.categorie, subtype: "" } }));
}
