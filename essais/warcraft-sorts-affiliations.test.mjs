// Essais des sorts maison et des affiliations de lakour-warcraft (contenu/sorts.mjs, contenu/affiliations.mjs).
// Le vérificateur ci-dessous ne réutilise pas les listes des constructeurs : il porte ses propres références, relevées
// dans dnd5e 6.0.6 (schémas SpellData, FeatData, BaseActivityData et ses types ; CONFIG.DND5E.spellSchools,
// validProperties.spell, spellcasting, activityActivationTypes, timePeriods, individualTargetTypes, areaTargetTypes,
// damageScalingModes, healingTypes, attackTypes, attackClassifications, limitedUsePeriods, featureTypes ; noms
// canoniques 6.0 des chemins d'effets, ActiveEffect5e.SHIM_FIELDS). Chaque règle est rejouée sur des copies cassées
// des documents, puis sur des copies mutées des sources ; une mutation qui passe inaperçue fait échouer l'essai.
// Aucun réseau.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL, fileURLToPath } from "node:url";
import { FACTIONS } from "../modules/lakour-warcraft/contenu/peuples.mjs";

const M = "lakour-warcraft";
const RACINE = fileURLToPath(new URL("../", import.meta.url));
const CONTENU = join(RACINE, "modules/lakour-warcraft/contenu");

// ---------------------------------------------------------------- Références dnd5e 6.0.6
const CLES_SORT = ["activities", "uses", "description", "identifier", "source", "ability", "activation", "duration", "level",
  "materials", "method", "prepared", "properties", "range", "school", "sourceItem", "target"];
const CLES_DON = ["activities", "uses", "advancement", "description", "identifier", "source", "type", "cover", "crewed",
  "enchant", "prerequisites", "properties", "requirements"];
const CLES_ACTIVITE = ["_id", "type", "name", "img", "sort", "activation", "behaviors", "consumption", "description", "duration",
  "effects", "flags", "range", "target", "uses", "visibility"];
const CLES_PAR_TYPE = { attack: ["attack", "damage"], damage: ["damage"], heal: ["healing"], save: ["damage", "save"], utility: ["roll"] };
const ECOLES = ["abj", "con", "div", "enc", "evo", "ill", "nec", "trs"];
const PROPRIETES = ["vocal", "somatic", "material", "concentration", "ritual"];
const METHODES = ["", "atwill", "innate", "ritual", "pact", "spell"];
const ACTIVATIONS = ["action", "bonus", "reaction", "minute", "hour", "day", "special"];
const TEMPS = ["inst", "spec", "disp", "dstr", "perm", "turn", "round", "minute", "hour", "day", "week", "month", "year"];
const PORTEES = ["self", "touch", "spec", "any", "m", "km"];   // mètres seulement dans ce module
const CIBLES = ["", "self", "ally", "enemy", "creature", "object", "space", "creatureOrObject", "any", "willing"];
const ZONES = ["", "circle", "cone", "cube", "cylinder", "line", "radius", "sphere", "square", "wall"];
const DOMMAGES = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
const SOINS = ["healing", "temphp", "maximum"];
const ETATS = ["blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"];
const CARAC = ["str", "dex", "con", "int", "wis", "cha"];
const COMP = ["acr", "ani", "arc", "ath", "dec", "his", "ins", "itm", "inv", "med", "nat", "prc", "prf", "per", "rel", "slt", "ste", "sur"];
const PERIODES = ["lr", "sr", "day", "dawn", "dusk", "initiative", "turnStart", "turnEnd"];
const CLASSES = { bard: "Barde", cleric: "Clerc", druid: "Druide", paladin: "Paladin", ranger: "Rôdeur", sorcerer: "Ensorceleur", warlock: "Occultiste", wizard: "Magicien" };
const SOUS_TYPES_DON = ["", "general", "origin", "fightingStyle", "epicBoon"];
const TRADITIONS = ["chamanisme", "lumiere", "druidisme", "arcanes", "gangrene"];
const CHEMINS_EFFET = [
  /^system\.attributes\.(ac\.bonus|movement\.(multiplier|bonus)|hp\.tempmax)$/,
  /^system\.traits\.(dr|di|dv|ci)\.value$/,
  /^system\.attributes\.(init|concentration)\.roll\.(bonus|mode)$/,
  /^system\.rolls\.ability\.(check|save|skill)\.bonus$/,
  /^system\.rolls\.attack\.(msak|mwak|rsak|rwak)\.bonus$/,
  new RegExp(`^system\\.abilities\\.(${CARAC.join("|")})\\.(check|save)\\.roll\\.(bonus|mode)$`),
  new RegExp(`^system\\.skills\\.(${COMP.join("|")})\\.roll\\.(bonus|mode)$`)
];

// ---------------------------------------------------------------- Vérificateur
const texteBrut = h => String(h ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const memes = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const casesEntieres = v => Number(v) > 0 && Math.abs(Number(v) / 1.5 - Math.round(Number(v) / 1.5)) < 1e-9;

function verifierActivites(d, err, { estSort }) {
  const ids = new Set(d.effects.map(e => e._id));
  for (const a of Object.values(d.system.activities)) {
    const n = `activité « ${a.name || a.type} »`;
    if (!CLES_PAR_TYPE[a.type]) { err(`${n} : type d'activité « ${a.type} » inconnu`); continue; }
    if (!memes(Object.keys(a), [...CLES_ACTIVITE, ...CLES_PAR_TYPE[a.type]])) err(`${n} : clés d'activité inattendues (${Object.keys(a).join(", ")})`);
    if (!/^[A-Za-z0-9]{16}$/.test(a._id) || !d.system.activities[a._id]) err(`${n} : _id d'activité mal formé`);
    if (!ACTIVATIONS.includes(a.activation.type)) err(`${n} : activation « ${a.activation.type} » inconnue`);
    if (!PORTEES.includes(a.range.units)) err(`${n} : portée « ${a.range.units} » inconnue`);
    if (!TEMPS.includes(a.duration.units)) err(`${n} : durée « ${a.duration.units} » inconnue`);
    if (!CIBLES.includes(a.target.affects.type) || !ZONES.includes(a.target.template.type) || a.target.template.units !== "m") err(`${n} : cible ou gabarit inconnu`);
    for (const t of a.consumption.targets) if (t.type !== "itemUses") err(`${n} : consommation « ${t.type} » inattendue`);
    if (a.consumption.targets.length && !d.system.uses.max) err(`${n} : consomme des utilisations, mais le document n'en a pas`);
    for (const e of a.effects) if (!ids.has(e._id)) err(`${n} : effet absent (${e._id})`);
    const parties = [...(a.damage?.parts ?? []), ...(a.healing ? [a.healing] : [])];
    for (const p of a.damage?.parts ?? []) {
      if (!p.types.length || p.types.some(t => !DOMMAGES.includes(t))) err(`${n} : type de dommages inconnu (${p.types})`);
    }
    for (const t of a.healing?.types ?? []) if (!SOINS.includes(t)) err(`${n} : type de soin « ${t} » inconnu`);
    for (const p of parties) {
      const desOk = (Number.isInteger(p.number) && Number.isInteger(p.denomination)) || (p.custom.enabled && p.custom.formula);
      if (!desOk) err(`${n} : dés ou formule manquants`);
      if (!["", "whole", "half"].includes(p.scaling.mode) || (p.scaling.mode && !(p.scaling.number >= 1))) err(`${n} : mise à l'échelle « ${p.scaling.mode} » invalide`);
    }
    if (a.type === "save") {
      if (!a.save.ability.length || a.save.ability.some(c => !CARAC.includes(c))) err(`${n} : sauvegarde de « ${a.save.ability} » inconnue`);
      if (estSort && a.save.dc.calculation !== "spellcasting") err(`${n} : DD de sort attendu (spellcasting), « ${a.save.dc.calculation} » trouvé`);
      if (!["half", "none", "full"].includes(a.damage.onSave)) err(`${n} : effet d'une sauvegarde réussie « ${a.damage.onSave} » inconnu`);
    }
    if (a.type === "attack") {
      if (!["melee", "ranged"].includes(a.attack.type.value)) err(`${n} : type d'attaque « ${a.attack.type.value} » inconnu`);
      if (estSort && a.attack.type.classification !== "spell") err(`${n} : classement « ${a.attack.type.classification} » au lieu de spell`);
    }
    if (!estSort && (a.activation.override || a.range.override || a.target.override || a.duration.override)) err(`${n} : surcharge sur un don`);
  }
}

function verifierEffets(d, err, { transfert }) {
  for (const e of d.effects) {
    if (e._key !== `!items.effects!${d._id}.${e._id}` || e.type !== "base") err(`effet « ${e.name} » : clé ou type incorrect`);
    if (e.transfer !== transfert) err(`effet « ${e.name} » : transfert ${e.transfer}, ${transfert} attendu`);
    for (const s of e.statuses) if (!ETATS.includes(s)) err(`effet « ${e.name} » : état « ${s} » inconnu`);
    for (const c of e.system.changes) {
      if (!CHEMINS_EFFET.some(r => r.test(c.key))) err(`effet « ${e.name} » : chemin d'effet « ${c.key} » inconnu de dnd5e 6.0`);
      if (!c.type || c.phase !== "initial") err(`effet « ${e.name} » : changement sans type ni phase`);
    }
  }
}

export function verifier({ sorts, dons, listes }) {
  const erreurs = [];
  const tous = [...sorts, ...dons, ...listes];
  const vus = new Map();
  for (const d of tous) {
    for (const k of [d._id, d._key, ...(d.effects ?? []).map(e => e._key), ...(d.pages ?? []).map(p => p._key)]) {
      if (vus.has(k)) erreurs.push(`${d.name} : _id ou _key en double (${k})`);
      vus.set(k, d.name);
    }
    if (!/^[A-Za-z0-9]{16}$/.test(d._id)) erreurs.push(`${d.name} : _id mal formé`);
  }

  // ----- Sorts
  const parCle = new Map(sorts.map(s => [s.__cle, s]));
  for (const s of sorts) {
    const err = m => erreurs.push(`${s.name} : ${m}`);
    const y = s.system;
    if (s.type !== "spell" || s.__pack !== "sorts" || s.__cle !== `sorts:${s.flags?.[M]?.cle}` || y.identifier !== s.flags[M].cle) err("type, compendium ou clé incorrects");
    if (s._key !== `!items!${s._id}` || !s.img) err("_key ou image incorrects");
    if (!memes(Object.keys(y), CLES_SORT)) err(`clés system inattendues (${Object.keys(y).join(", ")})`);
    if (!Number.isInteger(y.level) || y.level < 0 || y.level > 5) err(`niveau ${y.level} hors de 0 à 5`);
    if (!ECOLES.includes(y.school)) err(`école « ${y.school} » inconnue`);
    if (y.properties.some(p => !PROPRIETES.includes(p)) || new Set(y.properties).size !== y.properties.length) err(`propriété inconnue ou répétée (${y.properties})`);
    if (!y.properties.some(p => ["vocal", "somatic", "material"].includes(p))) err("aucune composante");
    if (!METHODES.includes(y.method) || ![0, 1, 2].includes(y.prepared)) err("méthode ou préparation inconnue");
    if (y.properties.includes("material") !== Boolean(y.materials.value)) err("composante matérielle et matériel incohérents");
    if (y.materials.consumed && !(y.materials.cost > 0)) err("matériel consumé sans coût");
    if (!ACTIVATIONS.includes(y.activation.type) || !TEMPS.includes(y.duration.units) || !PORTEES.includes(y.range.units)) err("activation, durée ou portée inconnue");
    if (y.range.units === "m" && !casesEntieres(y.range.value)) err(`portée ${y.range.value} m hors de la grille de 1,5 m`);
    if (!CIBLES.includes(y.target.affects.type) || !ZONES.includes(y.target.template.type) || y.target.template.units !== "m") err("cible ou gabarit inconnu");
    if (y.target.template.type && !casesEntieres(y.target.template.size)) err("taille de gabarit hors de la grille");
    const conc = y.properties.includes("concentration");
    if (conc && ["inst", "perm", "disp", "dstr"].includes(y.duration.units)) err("concentration sur une durée instantanée");
    const activites = Object.values(y.activities);
    if (!activites.length) err("aucune activité");
    for (const a of activites) if (!a.duration.override && a.duration.concentration !== conc) err(`concentration de l'activité « ${a.name || a.type} » différente de celle du sort`);
    verifierActivites(s, err, { estSort: true });
    verifierEffets(s, err, { transfert: false });
    if (y.level > 0 && !activites.some(a => a.consumption.spellSlot)) err("aucune activité ne consomme d'emplacement de sort");
    // Mise à l'échelle : un tour de magie monte par palier ; un sort de niveau 1+ annonce exactement ce qui monte.
    const description = texteBrut(y.description.value);
    const parties = activites.flatMap(a => [...(a.damage?.parts ?? []), ...(a.healing ? [a.healing] : [])]);
    if (y.level === 0) {
      if (!parties.length || parties.some(p => p.scaling.mode !== "whole")) err("tour de magie sans mise à l'échelle par palier");
    }
    const monte = parties.some(p => p.scaling.mode) || /@item\.level/.test(y.target.affects.count);
    if (monte !== description.includes("Aux niveaux supérieurs")) err("niveaux supérieurs : description et mise à l'échelle incohérentes");
    if (description.length < 200) err("texte trop court");
    const classes = s.flags[M].classes ?? [];
    if (!classes.length || classes.some(c => !CLASSES[c])) err(`classe inconnue (${classes})`);
    for (const c of classes) if (!description.includes(CLASSES[c])) err(`classe ${CLASSES[c]} absente de la description`);
    if (!TRADITIONS.includes(s.flags[M].tradition)) err("tradition inconnue");
  }
  if (sorts.length < 16) erreurs.push(`${sorts.length} sorts (16 attendus au moins)`);
  for (const t of TRADITIONS) if (sorts.filter(s => s.flags[M].tradition === t).length < 2) erreurs.push(`tradition ${t} : moins de deux sorts`);
  for (let n = 0; n <= 5; n++) if (!sorts.some(s => s.system.level === n)) erreurs.push(`aucun sort de niveau ${n}`);

  // ----- Listes de sorts (pages « spells »)
  const pages = listes.flatMap(j => j.pages);
  for (const j of listes) if (j.__pack !== "journaux" || j._key !== `!journal!${j._id}`) erreurs.push(`${j.name} : compendium ou clé incorrects`);
  for (const p of pages) {
    const err = m => erreurs.push(`liste ${p.name} : ${m}`);
    if (p.type !== "spells" || p.system.type !== "class" || !CLASSES[p.system.identifier]) err("page de liste de sorts mal formée");
    if (!memes(Object.keys(p.system), ["type", "identifier", "grouping", "description", "spells", "unlinkedSpells"])) err("clés system inattendues");
    if (texteBrut(p.text?.content).length < 200) err("texte de page trop court");
    for (const r of p.system.spells) if (!r.__uuid || !parCle.has(r.__ref)) err(`sort introuvable : ${r.__ref}`);
  }
  for (const s of sorts) for (const c of Object.keys(CLASSES)) {
    const page = pages.find(p => p.system.identifier === c);
    const dedans = Boolean(page?.system.spells.some(r => r.__ref === s.__cle));
    if (dedans !== (s.flags[M].classes ?? []).includes(c)) erreurs.push(`${s.name} : liste ${CLASSES[c]} incohérente avec ses classes`);
  }

  // ----- Affiliations, atouts et handicaps
  for (const d of dons) {
    const err = m => erreurs.push(`${d.name} : ${m}`);
    const y = d.system, f = d.flags?.[M] ?? {};
    if (d.type !== "feat" || d.__pack !== "dons") err("type ou compendium incorrect");
    if (!d.__cle?.startsWith("dons:affiliation-") || f.cle !== d.__cle.slice(5) || y.identifier !== f.cle) err("clé sans le préfixe dons:affiliation-");
    if (!memes(Object.keys(y), CLES_DON)) err(`clés system inattendues (${Object.keys(y).join(", ")})`);
    if (y.type.value !== "feat" || !SOUS_TYPES_DON.includes(y.type.subtype)) err(`type de don « ${y.type.value}/${y.type.subtype} » inattendu`);
    for (const r of y.uses.recovery) if (!PERIODES.includes(r.period)) err(`période « ${r.period} » inconnue`);
    if (!Object.keys(FACTIONS).includes(f.faction)) err(`faction « ${f.faction} » inconnue`);
    verifierActivites(d, err, { estSort: false });
    verifierEffets(d, err, { transfert: true });
    for (const a of Object.values(y.activities)) if (a.consumption.spellSlot) err("un don ne consomme pas d'emplacement");
    const texte = texteBrut(y.description.value);
    if (texte.length < 150) err("texte trop court");
    if (f.categorie === "affiliation") {
      for (const mot of ["Devoir", "Rang 1", "Rang 2", "Rang 3", "Avantage", "Réputation"]) if (!texte.includes(mot)) err(`section « ${mot} » absente`);
      if (![1, 2, 3].includes(f.rang)) err(`rang ${f.rang} hors de 1 à 3`);
      const effetActif = d.effects.some(e => e.system.changes.length);
      const parRepos = Object.values(y.activities).some(a => a.consumption.targets.length) && y.uses.max === "1" && y.uses.recovery.some(r => r.period === "lr");
      if (!effetActif && !parRepos) err("aucune mécanique (ni effet actif, ni activité une fois par repos long)");
    } else if (!["atout", "handicap"].includes(f.categorie)) err(`catégorie « ${f.categorie} » inconnue`);
  }
  const compte = c => dons.filter(d => d.flags?.[M]?.categorie === c).length;
  if (compte("affiliation") < 8) erreurs.push(`${compte("affiliation")} affiliations (8 attendues)`);
  if (compte("atout") < 2 || compte("handicap") < 2 || compte("atout") + compte("handicap") < 6) erreurs.push("atouts et handicaps trop peu nombreux");
  return erreurs;
}

// ---------------------------------------------------------------- Chargement (original ou copie mutée)
async function charger(dossierContenu) {
  const m = f => import(pathToFileURL(join(dossierContenu, f)).href);
  const [s, a] = await Promise.all([m("sorts.mjs"), m("affiliations.mjs")]);
  return { sorts: s.SORTS, dons: a.AFFILIATIONS, listes: s.LISTES_SORTS, uuids: s.UUID_LISTES_SORTS, modules: { s, a } };
}
const ORIGINAL = await charger(CONTENU);
const copie = () => structuredClone({ sorts: ORIGINAL.sorts, dons: ORIGINAL.dons, listes: ORIGINAL.listes });

test("sorts et affiliations : le contenu passe toute la batterie", () => {
  assert.deepEqual(verifier(copie()), []);
});

test("sorts : écoles, niveaux, activités et traditions attendus", () => {
  const { sorts } = ORIGINAL;
  const types = new Set(sorts.flatMap(s => Object.values(s.system.activities).map(a => a.type)));
  for (const t of ["attack", "save", "damage", "heal", "utility"]) assert.ok(types.has(t), `aucune activité ${t}`);
  assert.ok(sorts.some(s => s.system.properties.includes("concentration")) && sorts.some(s => !s.system.properties.includes("concentration")));
  assert.ok(sorts.some(s => Object.values(s.system.activities).some(a => a.healing?.types.includes("temphp"))), "des points de vie temporaires");
  assert.ok(sorts.some(s => /@item\.level/.test(s.system.target.affects.count)), "une cible qui monte avec l'emplacement");
  // Gangrène : chaque sort gangrené (ombre exceptée) fait payer son lanceur et le marque.
  for (const s of sorts.filter(x => x.flags[M].tradition === "gangrene" && x.system.level > 0)) {
    const prix = Object.values(s.system.activities).find(a => a.name === "Prix de la gangrène");
    assert.ok(prix && !prix.consumption.spellSlot && prix.damage.parts[0].custom.formula === "@item.level", `${s.name} : prix de la gangrène`);
    assert.ok(s.effects.some(e => e.name === "Marque de gangrène" && prix.effects.some(x => x._id === e._id)), `${s.name} : marque de gangrène`);
  }
  // Mise à l'échelle des dégâts d'un sort : un dé par niveau d'emplacement (forme de dnd5e : whole, number).
  const blizzard = sorts.find(s => s.flags[M].cle === "blizzard");
  assert.deepEqual(Object.values(blizzard.system.activities)[0].damage.parts[0].scaling, { mode: "whole", number: 1, formula: "" });
});

test("listes de sorts : une page « spells » par classe, uuid prêts pour flags.dnd5e.spellLists", () => {
  const [journal] = ORIGINAL.listes;
  assert.equal(ORIGINAL.uuids.length, journal.pages.length);
  journal.pages.forEach((p, i) => assert.equal(ORIGINAL.uuids[i], `Compendium.${M}.journaux.JournalEntry.${journal._id}.JournalEntryPage.${p._id}`));
});

test("affiliations : clés dons:affiliation-…, jamais en collision avec les dons ordinaires", () => {
  for (const d of ORIGINAL.dons) assert.match(d.__cle, /^dons:affiliation-[a-z0-9-]+$/);
  assert.equal(new Set(ORIGINAL.dons.map(d => d.system.identifier)).size, ORIGINAL.dons.length);
});

// ---------------------------------------------------------------- Mutations des documents
const S = (c, cle) => c.sorts.find(s => s.flags[M].cle === cle);
const D = (c, cle) => c.dons.find(d => d.flags[M].cle === `affiliation-${cle}`);
const A = (doc, n = 0) => Object.values(doc.system.activities)[n];
const MUTATIONS_DOCUMENTS = [
  ["école inconnue", c => { S(c, "horion-elementaire").system.school = "fire"; }, /école/],
  ["niveau négatif", c => { S(c, "blizzard").system.level = -1; }, /niveau/],
  ["propriété inconnue", c => { S(c, "blizzard").system.properties.push("verbal"); }, /propriété/],
  ["concentration retirée du sort", c => { const p = S(c, "torpeur-d-emeraude").system.properties; p.splice(p.indexOf("concentration"), 1); }, /concentration/],
  ["concentration oubliée dans une activité", c => { A(S(c, "blizzard")).duration.concentration = false; }, /concentration/],
  ["type d'activité inconnu", c => { A(S(c, "horion-elementaire")).type = "spell"; }, /type d'activité/],
  ["type de dommages inconnu", c => { A(S(c, "eclair-bondissant")).damage.parts[0].types = ["fel"]; }, /dommages/],
  ["type de soin inconnu", c => { A(S(c, "psaume-de-lumiere")).healing.types = ["vigor"]; }, /soin/],
  ["tour de magie sans palier", c => { A(S(c, "trait-de-l-ombre")).damage.parts[0].scaling.mode = ""; }, /tour de magie/],
  ["sort qui ne monte plus", c => { A(S(c, "chute-d-etoiles")).damage.parts[0].scaling = { mode: "", number: null, formula: "" }; }, /niveaux supérieurs/],
  ["mise à l'échelle inconnue", c => { A(S(c, "nova-de-givre")).damage.parts[0].scaling.mode = "double"; }, /mise à l'échelle/],
  ["DD qui n'est pas celui du lanceur", c => { A(S(c, "nova-de-givre")).save.dc.calculation = ""; }, /DD de sort/],
  ["sauvegarde inconnue", c => { A(S(c, "sarments-du-reve")).save.ability = ["luck"]; }, /sauvegarde/],
  ["attaque classée arme", c => { A(S(c, "etincelle-de-lumiere")).attack.type.classification = "weapon"; }, /classement/],
  ["portée en pieds", c => { S(c, "blizzard").system.range.units = "ft"; }, /portée/],
  ["portée hors grille", c => { S(c, "blizzard").system.range.value = "40"; }, /grille/],
  ["gabarit inconnu", c => { S(c, "chute-d-etoiles").system.target.template.type = "dome"; }, /gabarit/],
  ["clé system en trop", c => { S(c, "blizzard").system.preparation = { mode: "prepared" }; }, /clés system/],
  ["clé d'activité en trop", c => { A(S(c, "blizzard")).consumption2 = {}; }, /clés d'activité/],
  ["aucun emplacement consommé", c => { for (const a of Object.values(S(c, "sarments-du-reve").system.activities)) a.consumption.spellSlot = false; }, /emplacement/],
  ["matériel consumé gratuit", c => { S(c, "portail-de-dalaran").system.materials.cost = 0; }, /matériel/],
  ["matériel sans composante", c => { S(c, "blizzard").system.materials.value = "un flocon"; }, /matériel/],
  ["ancien chemin d'effet", c => { S(c, "nova-de-givre").effects[0].system.changes[0].key = "system.bonuses.abilities.save"; }, /chemin d'effet/],
  ["état inconnu", c => { S(c, "marteau-de-justice").effects[0].statuses = ["dazed"]; }, /état/],
  ["effet de sort transféré au lanceur", c => { S(c, "marteau-de-justice").effects[0].transfer = true; }, /transfert/],
  ["effet cité absent", c => { A(S(c, "marteau-de-justice")).effects[0]._id = "ZZZZZZZZZZZZZZZZ"; }, /effet absent/],
  ["classe inconnue", c => { S(c, "blizzard").flags[M].classes.push("artificer"); }, /classe/],
  ["sort retiré de sa liste", c => { const p = c.listes[0].pages.find(x => x.system.identifier === "wizard"); p.system.spells.shift(); }, /liste/],
  ["liste qui cite un sort absent", c => { c.listes[0].pages[0].system.spells.push({ __ref: "sorts:inexistant", __uuid: true }); }, /introuvable/],
  ["page de liste mal typée", c => { c.listes[0].pages[0].type = "text"; }, /mal formée/],
  ["texte vide", c => { S(c, "blizzard").system.description.value = ""; }, /texte/],
  ["identifiant en double", c => { S(c, "blizzard")._id = S(c, "nova-de-givre")._id; }, /double/],
  ["tradition sans sorts", c => { for (const s of c.sorts) if (s.flags[M].tradition === "druidisme") s.flags[M].tradition = "arcanes"; }, /tradition/],
  ["don sans préfixe", c => { D(c, "kirin-tor").__cle = "dons:kirin-tor"; }, /préfixe/],
  ["faction inconnue", c => { D(c, "kor-kron").flags[M].faction = "legion"; }, /faction/],
  ["devoir absent", c => { const d = D(c, "sentinelles"); d.system.description.value = d.system.description.value.replaceAll("Devoir", "Usage"); }, /Devoir/],
  ["rang hors bornes", c => { D(c, "kirin-tor").flags[M].rang = 4; }, /rang/],
  ["affiliation sans mécanique", c => { const d = D(c, "kor-kron"); d.effects = []; }, /mécanique/],
  ["utilisations absentes", c => { D(c, "cartel-gentepression").system.uses = { max: "", spent: 0, recovery: [] }; }, /utilisations/],
  ["période inconnue", c => { D(c, "cercle-cenarien").system.uses.recovery[0].period = "week"; }, /période/],
  ["type de don inconnu", c => { D(c, "aube-d-argent").system.type.value = "race"; }, /type de don/],
  ["effet passif non transféré", c => { D(c, "sentinelles").effects[0].transfer = false; }, /transfert/],
  ["don qui consomme un emplacement", c => { A(D(c, "ligue-des-explorateurs")).consumption.spellSlot = true; }, /emplacement/],
  ["surcharge sur un don", c => { A(D(c, "main-d-argent")).range.override = true; }, /surcharge/],
  ["trop peu d'affiliations", c => { c.dons = c.dons.filter(d => d.flags[M].cle !== "affiliation-kor-kron"); }, /affiliations/]
];

test("chaque règle cassée dans les documents est détectée", () => {
  const passees = [];
  for (const [nom, muter, attendu] of MUTATIONS_DOCUMENTS) {
    const c = copie();
    muter(c);
    const e = verifier(c);
    if (!e.some(x => attendu.test(x))) passees.push(`${nom} (erreurs : ${e.join(" ; ") || "aucune"})`);
  }
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

// ---------------------------------------------------------------- Mutations des sources
// [fichier, avant, après, règle] : la copie mutée doit échouer à la construction ou au vérificateur.
const MUTATIONS_SOURCES = [
  ["sorts.mjs", "spellSlot: a.emplacement ?? doc.sort,", "spellSlot: false,", "un sort consomme un emplacement"],
  ["sorts.mjs", "concentration: Boolean(doc.concentration) && !surcharge(\"duree\")", "concentration: false", "concentration recopiée dans les activités"],
  ["sorts.mjs", "scaling: echelle ? { mode: \"whole\"", "scaling: echelle ? { mode: \"\"", "mise à l'échelle des dés"],
  ["sorts.mjs", "classification: a.attaque?.classement ?? \"spell\"", "classification: a.attaque?.classement ?? \"weapon\"", "attaque de sort"],
  ["sorts.mjs", "{ calculation: dd, formula: \"\" }", "{ calculation: \"\", formula: \"\" }", "DD du lanceur"],
  ["sorts.mjs", "ecole: \"trs\"", "ecole: \"tra\"", "école valide"],
  ["sorts.mjs", "[\"system.skills.per.roll.mode\", -1]", "[\"system.bonuses.abilities.skill\", -1]", "chemins d'effets 6.0"],
  ["sorts.mjs", "transfer: e.transfert ?? transfert,", "transfer: true,", "effets de sort appliqués aux cibles"],
  ["sorts.mjs", "spells: sorts.map(s => ({ __ref: s.__cle, __uuid: true }))", "spells: sorts.slice(1).map(s => ({ __ref: s.__cle, __uuid: true }))", "listes complètes"],
  ["affiliations.mjs", "const ou = `dons:affiliation-${d.cle}`;", "const ou = `dons:${d.cle}`;", "préfixe des clés"],
  ["affiliations.mjs", "{ transfert: true, magique: false }", "{ transfert: false, magique: false }", "effets passifs transférés"],
  ["affiliations.mjs", "`**Devoir.** ${devoir}`,", "devoir,", "section Devoir"],
  ["affiliations.mjs", "\"neutre\", icone(\"containers/bags/coinpouch-gold-red.webp\")", "\"gobelin\", icone(\"containers/bags/coinpouch-gold-red.webp\")", "faction connue"]
];

async function chargerMutant(fichier, avant, apres) {
  const dossier = mkdtempSync(join(tmpdir(), "warcraft-sorts-mutant-"));
  const contenu = join(dossier, "modules/lakour-warcraft/contenu");
  cpSync(CONTENU, contenu, { recursive: true });
  mkdirSync(join(dossier, "modules/lakour-mj-ia/outils"), { recursive: true });
  cpSync(join(RACINE, "modules/lakour-mj-ia/outils/icones-foundry14.txt"), join(dossier, "modules/lakour-mj-ia/outils/icones-foundry14.txt"));
  const chemin = join(contenu, fichier);
  const texte = readFileSync(chemin, "utf8");
  assert.ok(texte.includes(avant), `mutation introuvable dans ${fichier} : ${avant}`);
  writeFileSync(chemin, texte.replace(avant, apres));
  try { return await charger(contenu); }
  finally { rmSync(dossier, { recursive: true, force: true }); }
}

test("chaque règle cassée dans les sources est détectée (construction ou vérificateur)", async () => {
  const passees = [];
  for (const [fichier, avant, apres, regle] of MUTATIONS_SOURCES) {
    let detectee = false;
    try {
      const m = await chargerMutant(fichier, avant, apres);
      detectee = verifier({ sorts: m.sorts, dons: m.dons, listes: m.listes }).length > 0;
    } catch (e) {
      if (e?.code === "ERR_ASSERTION") throw e;
      detectee = true;
    }
    if (!detectee) passees.push(`${regle} (${fichier})`);
  }
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

// ---------------------------------------------------------------- Constructeurs : une valeur inconnue lève une erreur
test("les constructeurs refusent les clés inconnues de dnd5e", () => {
  const { sort } = ORIGINAL.modules.s;
  const { donDeFaction } = ORIGINAL.modules.a;
  const base = { cle: "essai", nom: "Essai", niveau: 1, ecole: "evo", tradition: "arcanes", classes: ["wizard"], img: "icons/svg/d20.svg", texte: "Essai.",
    portee: [18, "m"], activites: [{ type: "save", sauvegarde: { carac: ["dex"] }, degats: [{ des: "1d6", types: ["fire"], echelle: 1 }] }] };
  assert.doesNotThrow(() => sort(base));
  const casse = [
    { ecole: "fel" }, { niveau: 10 }, { tradition: "vaudou" }, { classes: ["artificer"] }, { classes: [] },
    { portee: [60, "ft"] }, { incantation: ["round"] }, { duree: [1, "lune"] }, { concentration: true, duree: ["", "inst"] },
    { composantes: ["vocal", "material"] }, { gabarit: ["dome", 6] }, { cible: ["1", "allies"] },
    { activites: [{ type: "summon" }] }, { activites: [{ type: "save", sauvegarde: { carac: ["luck"] } }] },
    { activites: [{ type: "attack", degats: [{ des: "1d6", types: ["fel"] }] }] },
    { activites: [{ type: "heal", soin: { des: "1d6", type: "vigor" } }] },
    { activites: [{ type: "utility", effets: [0] }] },
    { effets: [{ nom: "x", changements: [["system.bonuses.abilities.save", 1]] }], activites: [{ type: "utility", effets: [0] }] },
    { effets: [{ nom: "x", etats: ["dazed"] }], activites: [{ type: "utility", effets: [0] }] }
  ];
  for (const c of casse) assert.throws(() => sort({ ...base, ...c }), undefined, JSON.stringify(c));
  const don = { cle: "essai", nom: "Essai", categorie: "atout", faction: "neutre", img: "icons/svg/d20.svg", texte: "Essai." };
  assert.doesNotThrow(() => donDeFaction(don));
  for (const c of [{ categorie: "pacte" }, { faction: "legion" }, { cle: "Essai" }, { utilisations: { max: 1, periode: "week" } }]) {
    assert.throws(() => donDeFaction({ ...don, ...c }), undefined, JSON.stringify(c));
  }
});
