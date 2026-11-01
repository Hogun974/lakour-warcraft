// Constructeur compact des PNJ de lakour-warcraft pour dnd5e 6.0.6 (acteur « npc », règles 2024).
// Les clés s'écrivent en français (for, dex, con, int, sag, cha ; tailles TP P M G TG Gig ; types de créature, de
// dégâts et d'états) ; toute clé inconnue lève une erreur au lieu de produire un acteur faux.
// Distances en mètres (case de 1,5 m) : vitesses, sens, allonges, portées et zones.
// Icône d'une capacité : son img, sinon celle de la table ICONES_PNJ (contenu/icones-pnj.mjs), sinon un glyphe par genre.
// Les attaques et capacités sont des objets propres à l'acteur (copiés dans items par outils/fabriquer-warcraft.mjs),
// avec des activités dnd5e « attack », « save » ou « utility » de la même forme que celles du SRD 5.2.
// Le bonus d'attaque annoncé est vérifié : il doit valoir modificateur de caractéristique + bonus de maîtrise du FP.
import { MODULE, STATS, html, icone, identifiant } from "./aides.mjs";
import { anneauJeton, cheminJeton } from "./jetons.mjs";
import { ICONES_PNJ } from "./icones-pnj.mjs";

// ---------------------------------------------------------------- Vocabulaire (français -> dnd5e)

const norme = t => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’']/g, " ").trim();
function traduire(table, valeur, quoi, ou) {
  const cle = table[norme(valeur)];
  if (!cle) throw new Error(`${ou} : ${quoi} « ${valeur} » inconnu(e) (attendu : ${Object.keys(table).join(", ")})`);
  return cle;
}

export const CARACS = { for: "str", dex: "dex", con: "con", int: "int", sag: "wis", cha: "cha" };
const NOM_CARAC = { str: "Force", dex: "Dextérité", con: "Constitution", int: "Intelligence", wis: "Sagesse", cha: "Charisme" };
export const TAILLES = { tp: "tiny", p: "sm", m: "med", g: "lg", tg: "huge", gig: "grg" };
const CASES = { tiny: 1, sm: 1, med: 1, lg: 2, huge: 3, grg: 4 };
export const TYPES_CREATURE = {
  aberration: "aberration", bete: "beast", celeste: "celestial", artificiel: "construct", dragon: "dragon",
  elementaire: "elemental", fee: "fey", fielon: "fiend", geant: "giant", humanoide: "humanoid",
  "creature monstrueuse": "monstrosity", vase: "ooze", plante: "plant", "mort-vivant": "undead"
};
export const DEGATS = {
  acide: "acid", contondant: "bludgeoning", froid: "cold", feu: "fire", force: "force", foudre: "lightning",
  necrotique: "necrotic", perforant: "piercing", poison: "poison", psychique: "psychic", radiant: "radiant",
  tranchant: "slashing", tonnerre: "thunder"
};
const LIBELLE_DEGATS = {
  acid: "d'acide", bludgeoning: "contondants", cold: "de froid", fire: "de feu", force: "de force", lightning: "de foudre",
  necrotic: "nécrotiques", piercing: "perforants", poison: "de poison", psychic: "psychiques", radiant: "radiants",
  slashing: "tranchants", thunder: "de tonnerre"
};
export const ETATS = {
  aveugle: "blinded", charme: "charmed", assourdi: "deafened", epuisement: "exhaustion", effraye: "frightened",
  agrippe: "grappled", neutralise: "incapacitated", invisible: "invisible", paralyse: "paralyzed", petrifie: "petrified",
  empoisonne: "poisoned", "a terre": "prone", entrave: "restrained", etourdi: "stunned", inconscient: "unconscious"
};
export const COMPETENCES = {
  acrobaties: ["acr", "dex"], dressage: ["ani", "wis"], arcanes: ["arc", "int"], athletisme: ["ath", "str"],
  tromperie: ["dec", "cha"], histoire: ["his", "int"], intuition: ["ins", "wis"], intimidation: ["itm", "cha"],
  investigation: ["inv", "int"], medecine: ["med", "wis"], nature: ["nat", "int"], perception: ["prc", "wis"],
  representation: ["prf", "cha"], persuasion: ["per", "cha"], religion: ["rel", "int"], escamotage: ["slt", "dex"],
  discretion: ["ste", "dex"], survie: ["sur", "wis"]
};
const VITESSES = { marche: "walk", nage: "swim", vol: "fly", escalade: "climb", creusement: "burrow" };
const SENS = { noir: "darkvision", aveugle: "blindsight", vibrations: "tremorsense", veritable: "truesight" };
const ACTIVATIONS = { action: "action", bonus: "bonus", reaction: "reaction", special: "special" };
const ZONES = { cone: "cone", ligne: "line", rayon: "radius", sphere: "sphere", cube: "cube" };
const ROLES = ["troupe", "elite", "chef"];
const FP_VALIDES = [0, 0.125, 0.25, 0.5, ...Array.from({ length: 30 }, (_, i) => i + 1)];

export const modificateur = valeur => Math.floor((valeur - 10) / 2);
export const maitrise = fp => Math.max(2, Math.floor((Math.max(fp, 1) - 1) / 4) + 2);

// ---------------------------------------------------------------- Petits outils

const nombre = n => String(n).replace(".", ",");
const signe = n => (n >= 0 ? `+${n}` : `${n}`);
const slug = t => norme(t).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// « 2d6+3 », « 1d4 - 1 », « 2d8 » -> { number, denomination, bonus }
function des(formule, ou) {
  const m = /^(\d+)d(\d+)\s*(?:([+-])\s*(\d+))?$/.exec(String(formule).trim());
  if (!m) throw new Error(`${ou} : formule de dés illisible « ${formule} » (attendu par ex. 2d6+3)`);
  const [, n, d, s, b] = m;
  if (![4, 6, 8, 10, 12, 20].includes(Number(d))) throw new Error(`${ou} : dé d${d} inconnu`);
  return { number: Number(n), denomination: Number(d), bonus: b ? (s === "-" ? -Number(b) : Number(b)) : 0 };
}
const moyenne = ({ number, denomination, bonus }) => Math.floor((number * (denomination + 1)) / 2) + bonus;
const ecrireDes = ({ number, denomination, bonus }) => `${number}d${denomination}${bonus ? ` ${bonus > 0 ? "+" : "−"} ${Math.abs(bonus)}` : ""}`;
const partie = (d, type, bonus = d.bonus) => ({
  number: d.number, denomination: d.denomination, bonus: bonus ? String(bonus) : "", types: [type],
  custom: { enabled: false, formula: "" }, scaling: { mode: "", number: 1, formula: "" }
});
const phraseDegats = (d, type) => `${moyenne(d)} (${ecrireDes(d)}) dégâts ${LIBELLE_DEGATS[type]}`;

const IMAGE_DEGATS = {
  fire: "svg/fire", cold: "svg/frozen", poison: "svg/poison", necrotic: "svg/skull", radiant: "svg/sun", psychic: "svg/terror",
  lightning: "svg/lightning", acid: "svg/acid", thunder: "svg/sound", force: "svg/aura"
};

// ---------------------------------------------------------------- Capacités (descripteurs, construits par pnj())

// Trait passif (sans activité) : amphibie, tactique de meute…
export const trait = (nom, texte, options = {}) => ({ genre: "trait", nom, texte, ...options });
// Attaque d'arme ou de sort : { toucher, degats, type, distance?, allonge?, portee?, carac?, plus?, effet?, rider? … }
export const attaque = (nom, options) => ({ genre: "attaque", nom, ...options });
// Effet à jet de sauvegarde : { carac, dd, zone?: { forme, taille }, cible?, degats?, type?, moitie?, echec?, reussite? … }
export const sauvegarde = (nom, options) => ({ genre: "sauvegarde", nom, ...options });
// Action sans jet (attaques multiples, cri, incantation…) : { activation?, recharge?, parJour? }
export const action = (nom, texte, options = {}) => ({ genre: "action", nom, texte, ...options });
export const attaquesMultiples = texte => action("Attaques multiples", texte);

const CHAMPS_CAPACITE = {
  trait: ["genre", "nom", "texte", "img"],
  attaque: ["genre", "nom", "toucher", "degats", "type", "distance", "allonge", "portee", "carac", "plus", "effet", "rider", "arme", "magique", "img", "recharge", "parJour", "activation"],
  sauvegarde: ["genre", "nom", "carac", "dd", "zone", "cible", "portee", "degats", "type", "moitie", "echec", "reussite", "texte", "img", "recharge", "parJour", "activation"],
  action: ["genre", "nom", "texte", "img", "recharge", "parJour", "activation"]
};

// Squelette commun d'une activité dnd5e (forme du SRD 5.2).
function activite(_id, type, { activation = "action", consommer = false } = {}) {
  return {
    _id, type, name: "", img: null, sort: 0, flags: {},
    activation: { type: activation, value: null, condition: "", override: false },
    consumption: { targets: consommer ? [{ type: "itemUses", value: "1", target: "", scaling: { mode: "", formula: "" } }] : [], scaling: { allowed: false, max: "" }, spellSlot: true },
    description: { chatFlavor: "" },
    duration: { units: "inst", value: "", special: "", concentration: false, override: false },
    effects: [],
    range: { override: false, units: "self", special: "" },
    target: {
      template: { count: "", contiguous: false, type: "", size: "", width: "", height: "", units: "m" },
      affects: { count: "", type: "", choice: false, special: "" }, prompt: true, override: false
    },
    uses: { spent: 0, recovery: [], max: "" },
    visibility: { level: {}, requireAttunement: false, requireIdentification: false, requireMagic: false }
  };
}

// Activité de sauvegarde (capacité à part entière ou effet secondaire d'une attaque).
function activiteSauvegarde(_id, s, ou, options) {
  const act = activite(_id, "save", options);
  const carac = traduire(CARACS, s.carac, "caractéristique de sauvegarde", ou);
  if (!Number.isInteger(s.dd) || s.dd < 8 || s.dd > 30) throw new Error(`${ou} : DD ${s.dd} invalide`);
  const parts = [];
  if (s.degats) parts.push(partie(des(s.degats, ou), traduire(DEGATS, s.type, "type de dégâts", ou)));
  else if (s.type) throw new Error(`${ou} : type de dégâts sans dégâts`);
  act.damage = { onSave: s.degats && s.moitie !== false ? "half" : "none", parts };
  act.save = { ability: [carac], dc: { calculation: "", formula: String(s.dd) } };
  act.target.affects.type = "creature";
  if (s.zone) {
    const forme = traduire(ZONES, s.zone.forme, "forme de zone", ou);
    if (!(s.zone.taille > 0)) throw new Error(`${ou} : taille de zone invalide`);
    act.target.template = { ...act.target.template, type: forme, size: String(s.zone.taille) };
  } else {
    act.target.affects.count = "1";
    if (s.portee) act.range = { override: true, value: String(s.portee), units: "m", special: "" };
  }
  return { act, carac };
}

function texteSauvegarde(s, carac) {
  const ou = s.zone
    ? `chaque créature dans ${{ cone: "un cône", line: "une ligne", radius: "un rayon", sphere: "une sphère", cube: "un cube" }[ZONES[norme(s.zone.forme)]]} de ${nombre(s.zone.taille)} m`
    : (s.cible ?? (s.portee ? `une créature visible à ${nombre(s.portee)} m ou moins` : "la cible"));
  const degats = s.degats ? phraseDegats(des(s.degats, s.nom), DEGATS[norme(s.type)]) : null;
  const echec = [degats, s.echec].filter(Boolean).join(". ");
  const reussite = s.reussite ?? (s.degats && s.moitie !== false ? "moitié des dégâts" : null);
  return `*Jet de sauvegarde de ${NOM_CARAC[carac]} :* DD ${s.dd}, ${ou}. *Échec :* ${echec}.${reussite ? ` *Réussite :* ${reussite}.` : ""}`;
}

function usages(c) {
  if (c.recharge) {
    if (![4, 5, 6].includes(c.recharge)) throw new Error(`« ${c.nom} » : recharge ${c.recharge} invalide (4, 5 ou 6)`);
    return { uses: { max: "1", spent: 0, recovery: [{ period: "recharge", formula: String(c.recharge), type: "recoverAll" }] }, suffixe: ` (recharge ${c.recharge === 6 ? "6" : `${c.recharge}–6`})`, consommer: true };
  }
  if (c.parJour) {
    if (!Number.isInteger(c.parJour) || c.parJour < 1) throw new Error(`« ${c.nom} » : parJour ${c.parJour} invalide`);
    return { uses: { max: String(c.parJour), spent: 0, recovery: [{ period: "day", type: "recoverAll", formula: "" }] }, suffixe: ` (${c.parJour}/jour)`, consommer: true };
  }
  return { uses: { max: "", spent: 0, recovery: [] }, suffixe: "", consommer: false };
}

const SOURCE = { book: "La Kour Warcraft", page: "", custom: "", license: "CC-BY-4.0", rules: "2024", revision: 1 };

// Construit l'objet dnd5e (weapon ou feat) d'une capacité ; ctx : { cle, i, abilities, prof }.
function construireCapacite(c, ctx) {
  const ou = `PNJ « ${ctx.cle} », capacité « ${c.nom ?? "?"} »`;
  const champs = CHAMPS_CAPACITE[c.genre];
  if (!champs) throw new Error(`${ou} : genre inconnu « ${c.genre} »`);
  if (!c.nom) throw new Error(`${ou} : nom manquant`);
  for (const k of Object.keys(c)) if (!champs.includes(k)) throw new Error(`${ou} : champ inconnu « ${k} »`);
  const id = j => identifiant(`bestiaire:${ctx.cle}:capacite:${ctx.i}:${j}`);
  const activation = traduire(ACTIVATIONS, c.activation ?? "action", "activation", ou);
  const { uses, suffixe, consommer } = usages(c);
  const base = (type, img, systeme, texte) => ({
    name: `${c.nom}${suffixe}`, type, img: img ?? icone("svg/book"),
    system: { description: { value: html(texte), chat: "" }, identifier: slug(c.nom), source: SOURCE, uses, ...systeme },
    effects: [], flags: {}, sort: (ctx.i + 1) * 100, _stats: STATS
  });

  if (c.genre === "trait") return base("feat", c.img, { type: { value: "monster", subtype: "" }, properties: ["trait"], requirements: "", activities: {} }, c.texte);

  if (c.genre === "action") {
    const act = { ...activite(id(0), "utility", { activation, consommer }), roll: { prompt: false, visible: false, name: "", formula: "" } };
    const quand = { bonus: "*Action bonus.* ", reaction: "*Réaction.* " }[activation] ?? "";
    return base("feat", c.img ?? icone("svg/upgrade"), { type: { value: "monster", subtype: "" }, properties: [], requirements: "", activities: { [act._id]: act } }, `${quand}${c.texte}`);
  }

  if (c.genre === "sauvegarde") {
    const { act, carac } = activiteSauvegarde(id(0), c, ou, { activation, consommer });
    const img = c.img ?? (c.type ? IMAGE_DEGATS[DEGATS[norme(c.type)]] && icone(IMAGE_DEGATS[DEGATS[norme(c.type)]]) : null) ?? icone("svg/explosion");
    const quand = { bonus: "*Action bonus.* ", reaction: "*Réaction.* " }[activation] ?? "";
    return base("feat", img, { type: { value: "monster", subtype: "" }, properties: [], requirements: "", activities: { [act._id]: act } },
      `${quand}${c.texte ? `${c.texte}\n\n` : ""}${texteSauvegarde(c, carac)}`);
  }

  // Attaque : la caractéristique est celle dont le modificateur + la maîtrise donne le bonus annoncé.
  if (!Number.isInteger(c.toucher)) throw new Error(`${ou} : bonus d'attaque (toucher) manquant`);
  const type = traduire(DEGATS, c.type, "type de dégâts", ou);
  const d = des(c.degats, ou);
  const candidates = c.carac ? [traduire(CARACS, c.carac, "caractéristique d'attaque", ou)]
    : c.magique ? ["int", "wis", "cha"] : c.distance ? ["dex", "str"] : ["str", "dex"];
  const carac = candidates.find(k => modificateur(ctx.abilities[k]) + ctx.prof === c.toucher);
  if (!carac) {
    throw new Error(`${ou} : +${c.toucher} au toucher ne correspond à aucune caractéristique (${candidates.map(k => `${k} ${signe(modificateur(ctx.abilities[k]) + ctx.prof)}`).join(", ")})`);
  }
  const plus = (c.plus ?? []).map(([formule, t]) => ({ d: des(formule, ou), type: traduire(DEGATS, t, "type de dégâts", ou) }));
  const act = activite(id(0), "attack", { activation, consommer });
  act.attack = {
    ability: carac, bonus: "", critical: { threshold: null }, flat: false,
    type: { value: c.distance ? "ranged" : "melee", classification: c.magique ? "spell" : "weapon" }
  };
  // Dégâts exacts du profil : la partie principale porte son bonus (sans @mod), d'où includeBase: false.
  act.damage = { critical: { bonus: "" }, includeBase: false, parts: [partie(d, type), ...plus.map(p => partie(p.d, p.type))] };
  const activites = { [act._id]: act };
  let texteRider = "";
  if (c.rider) {
    const r = activiteSauvegarde(id(1), c.rider, ou, { activation: "" });
    r.act.activation.type = "";
    activites[r.act._id] = r.act;
    texteRider = `\n\n${texteSauvegarde({ ...c.rider, nom: c.nom }, r.carac)}`;
  }
  const allonge = c.allonge ?? 1.5;
  const portee = c.portee ?? null;
  if (c.distance && !portee) throw new Error(`${ou} : attaque à distance sans portée`);
  const ouAttaque = c.distance ? `portée ${portee.map(nombre).join("/")} m`
    : `allonge ${nombre(allonge)} m${portee ? ` ou portée ${portee.map(nombre).join("/")} m` : ""}`;
  const degatsTexte = [phraseDegats(d, type), ...plus.map(p => phraseDegats(p.d, p.type))].join(", plus ");
  const genreAttaque = `Attaque ${c.magique ? "magique " : ""}${c.distance ? "à distance" : "au corps à corps"}`;
  const texte = `*${genreAttaque} :* ${signe(c.toucher)}, ${ouAttaque}. *Touché :* ${degatsTexte}.${c.effet ? ` ${c.effet}` : ""}${texteRider}`;
  const arme = { naturelle: "natural", simple: c.distance ? "simpleR" : "simpleM", guerre: c.distance ? "martialR" : "martialM" }[c.arme ?? "naturelle"];
  if (!arme) throw new Error(`${ou} : arme « ${c.arme} » inconnue (naturelle, simple, guerre)`);
  const img = c.img ?? (c.magique ? icone(IMAGE_DEGATS[type] ?? "svg/lightning") : icone(c.distance ? "svg/target" : "svg/sword"));
  const objet = base("weapon", img, {
    type: { value: arme, baseItem: "" }, quantity: 1, equipped: true, proficient: 1, identified: true, properties: [],
    damage: {
      base: partie(d, type, d.bonus - modificateur(ctx.abilities[carac])),
      versatile: { number: null, denomination: null, bonus: "", types: [], custom: { enabled: false, formula: "" }, scaling: { mode: "", number: null, formula: "" } }
    },
    range: c.distance || portee ? { value: portee[0], long: portee[1] ?? null, reach: c.distance ? null : allonge, units: "m" } : { value: null, long: null, reach: allonge, units: "m" },
    activities: activites
  }, texte);
  objet.flags = { [MODULE]: { toucher: c.toucher } };
  return objet;
}

// ---------------------------------------------------------------- PNJ

const CHAMPS_PNJ = ["cle", "nom", "fp", "taille", "type", "sousType", "alignement", "ca", "armure", "pv", "dv", "carac", "sauvegardes",
  "competences", "vitesse", "sens", "resistances", "immunites", "vulnerabilites", "immunitesEtats", "langues", "disposition", "role",
  "texte", "mj", "capacites"];

export function pnj(d) {
  const ou = `PNJ « ${d.cle ?? d.nom ?? "?"} »`;
  for (const k of Object.keys(d)) if (!CHAMPS_PNJ.includes(k)) throw new Error(`${ou} : champ inconnu « ${k} »`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.cle ?? "")) throw new Error(`${ou} : clé invalide`);
  if (!d.nom) throw new Error(`${ou} : nom manquant`);
  if (!FP_VALIDES.includes(d.fp)) throw new Error(`${ou} : FP ${d.fp} invalide`);
  if (!Number.isInteger(d.ca) || d.ca < 5 || d.ca > 25) throw new Error(`${ou} : CA ${d.ca} invalide`);
  if (!Number.isInteger(d.pv) || d.pv < 1) throw new Error(`${ou} : PV ${d.pv} invalides`);
  if (d.dv) {
    const attendu = moyenne(des(d.dv.replace(/\s+/g, ""), ou));
    if (attendu !== d.pv) throw new Error(`${ou} : ${d.pv} PV, mais ${d.dv} donne ${attendu} en moyenne`);
  }
  if (!d.texte || !d.mj) throw new Error(`${ou} : texte joueur et note MJ obligatoires`);
  const role = d.role ?? "troupe";
  if (!ROLES.includes(role)) throw new Error(`${ou} : rôle « ${role} » inconnu (${ROLES.join(", ")})`);
  const disposition = d.disposition ?? -1;
  if (![-1, 0, 1].includes(disposition)) throw new Error(`${ou} : disposition ${disposition} invalide (-1, 0, 1)`);

  // Caractéristiques : les six, pas une de plus.
  const abilities = {};
  for (const [k, v] of Object.entries(d.carac ?? {})) {
    const cle = traduire(CARACS, k, "caractéristique", ou);
    if (!Number.isInteger(v) || v < 1 || v > 30) throw new Error(`${ou} : valeur de ${k} invalide (${v})`);
    abilities[cle] = v;
  }
  if (Object.keys(abilities).length !== 6) throw new Error(`${ou} : il faut les six caractéristiques (for, dex, con, int, sag, cha)`);
  const sauvegardes = new Set((d.sauvegardes ?? []).map(k => traduire(CARACS, k, "caractéristique de sauvegarde", ou)));

  const taille = traduire(TAILLES, d.taille ?? "M", "taille", ou);
  const type = traduire(TYPES_CREATURE, d.type ?? "humanoïde", "type de créature", ou);
  const liste = (valeurs, table, quoi) => [...new Set((valeurs ?? []).map(v => traduire(table, v, quoi, ou)))];
  const competences = Object.fromEntries(Object.entries(d.competences ?? {}).map(([k, v]) => {
    const [cle, carac] = COMPETENCES[norme(k)] ?? [];
    if (!cle) throw new Error(`${ou} : compétence inconnue « ${k} »`);
    if (![1, 2].includes(v)) throw new Error(`${ou} : maîtrise de ${k} invalide (1 ou 2)`);
    return [cle, { value: v, ability: carac, bonuses: { check: "", passive: "" } }];
  }));
  const movement = { units: "m", hover: false, ignoredDifficultTerrain: [] };
  for (const [k, v] of Object.entries(d.vitesse ?? { marche: 9 })) {
    if (!(v > 0)) throw new Error(`${ou} : vitesse ${k} invalide`);
    movement[traduire(VITESSES, k, "vitesse", ou)] = String(v);
  }
  const ranges = { darkvision: null, blindsight: null, tremorsense: null, truesight: null };
  for (const [k, v] of Object.entries(d.sens ?? {})) ranges[traduire(SENS, k, "sens", ou)] = v;

  const prof = maitrise(d.fp);
  const ctx = { cle: d.cle, abilities, prof };
  const icones = ICONES_PNJ[d.cle] ?? {};
  const inconnues = Object.keys(icones).filter(nom => !(d.capacites ?? []).some(c => c.nom === nom));
  if (inconnues.length) throw new Error(`${ou} : ICONES_PNJ nomme des capacités absentes (${inconnues.join(", ")})`);
  const objets = (d.capacites ?? []).map((c, i) => construireCapacite(c.img || !icones[c.nom] ? c : { ...c, img: icones[c.nom] }, { ...ctx, i }));
  if (!objets.length) throw new Error(`${ou} : aucune capacité`);

  const _id = identifiant(`bestiaire:${d.cle}`);
  const image = cheminJeton(d.cle);
  const cases = CASES[taille];
  const bioJoueur = html(d.texte);
  return {
    __pack: "bestiaire", __cle: `bestiaire:${d.cle}`,
    _id, _key: `!actors!${_id}`, name: d.nom, type: "npc", img: image,
    system: {
      abilities: Object.fromEntries(Object.entries(abilities).map(([k, v]) => [k, { value: v, proficient: sauvegardes.has(k) ? 1 : 0 }])),
      skills: competences,
      attributes: {
        ac: { flat: d.ca, calc: "natural" },
        hp: { value: d.pv, max: d.pv, temp: null, tempmax: null, formula: d.dv ?? "" },
        movement,
        senses: { ranges, units: "m", special: "" }
      },
      details: {
        biography: { value: `${bioJoueur}<h3>Note du MJ</h3>${html(d.mj)}`, public: bioJoueur },
        alignment: d.alignement ?? "Non aligné",
        type: { value: type, subtype: d.sousType ?? "", swarm: "", custom: "" },
        cr: d.fp
      },
      traits: {
        size: taille,
        di: { value: liste(d.immunites, DEGATS, "type de dégâts"), bypasses: [], custom: "" },
        dr: { value: liste(d.resistances, DEGATS, "type de dégâts"), bypasses: [], custom: "" },
        dv: { value: liste(d.vulnerabilites, DEGATS, "type de dégâts"), bypasses: [], custom: "" },
        ci: { value: liste(d.immunitesEtats, ETATS, "état"), custom: "" },
        languages: { value: [], custom: d.langues ?? "", communication: {} }
      },
      source: SOURCE
    },
    __objets: objets,
    items: [], effects: [],
    prototypeToken: {
      name: d.nom, actorLink: false, disposition, displayName: 20, displayBars: 20, width: cases, height: cases,
      texture: { src: image, fit: "contain", scaleX: 1, scaleY: 1 }, bar1: { attribute: "attributes.hp" }, bar2: { attribute: null },
      ring: anneauJeton(d.cle)   // anneau dynamique, couleur de la faction (contenu/jetons.mjs)
    },
    folder: null, sort: 0, ownership: { default: 0 },
    flags: { [MODULE]: { cle: d.cle, role, mj: d.mj, ...(d.armure ? { armure: d.armure } : {}) } },
    _stats: STATS
  };
}
