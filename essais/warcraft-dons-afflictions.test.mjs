// Essais des dons maison et des afflictions de lakour-warcraft (contenu/dons.mjs, contenu/afflictions.mjs) : chaque
// document est un objet « feat » valide pour dnd5e 6.0.6 / Foundry 14 (clés system du modèle FeatData, sous-types 2024,
// prérequis), chaque effet actif modifie une clé qui existe dans le modèle de personnage avec un type et une valeur
// que le champ sait appliquer, identifiants uniques, textes français non vides. Les tables de référence ci-dessous sont
// relevées indépendamment du constructeur, dans le source de dnd5e 6.0.6 (dnd5e.mjs) et du cœur de Foundry 14
// (common/) ; le constructeur vérifie aussi à la construction (seconde vérification). Le vérificateur est rejoué sur des
// copies cassées : chaque règle cassée doit être détectée.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { CARACTERISTIQUES, COMPETENCES, DOMMAGES, cleTrait } from "../modules/lakour-warcraft/contenu/objets.mjs";
import { DONS, DONS_EN_TEXTE, DONS_EN_PARTIE, capacite } from "../modules/lakour-warcraft/contenu/dons.mjs";
import { AFFLICTIONS } from "../modules/lakour-warcraft/contenu/afflictions.mjs";

const MODULE = "lakour-warcraft";
const TOUS = [...DONS, ...AFFLICTIONS];
const cleDe = d => d.flags?.[MODULE]?.cle;
const parCle = (liste, cle) => liste.find(d => cleDe(d) === cle);

// ---------------------------------------------------------------- Références (dnd5e 6.0.6, Foundry 14)

// FeatData.defineSchema + gabarits ItemDescription (description, identifier, source), Activities (activities, damage,
// uses), Advancement (advancement) ; ItemTypeField({ baseItem: false }) : value et subtype seulement.
const CHAMPS_FEAT = ["description", "identifier", "source", "activities", "damage", "uses", "advancement", "type", "cover", "crewed", "enchant", "prerequisites", "properties", "requirements"];
// CONFIG.DND5E.featureTypes.feat.subtypes.
const SOUS_TYPES_DON = ["general", "origin", "fightingStyle", "epicBoon"];
// BaseActiveEffect.defineSchema (common/documents/active-effect.mjs) ; BaseEffectData de dnd5e (changes, conditions, magical, rider).
const CHAMPS_EFFET = ["_id", "_key", "name", "img", "type", "system", "disabled", "start", "duration", "description", "origin", "tint", "transfer", "statuses", "showIcon", "folder", "sort", "flags", "_stats"];
const CHAMPS_SYSTEME_EFFET = ["changes", "conditions", "magical", "rider"];
const CHAMPS_CHANGEMENT = ["key", "type", "value", "phase", "priority"];
// CONST.ACTIVE_EFFECT_CHANGE_TYPES, ACTIVE_EFFECT_CHANGE_PHASES, ACTIVE_EFFECT_DURATION_UNITS, ACTIVE_EFFECT_EXPIRY_EVENTS,
// ACTIVE_EFFECT_SHOW_ICON ; dnd5e : PSEUDO_EXPIRIES (sourceStart…targetEnd).
const TYPES_CHANGEMENT = ["custom", "multiply", "add", "subtract", "downgrade", "upgrade", "override"];
const UNITES_DUREE = ["years", "months", "days", "hours", "minutes", "seconds", "rounds", "turns"];
const FINS = ["combatStart", "roundStart", "turnStart", "combatEnd", "roundEnd", "turnEnd", "sourceStart", "sourceEnd", "targetStart", "targetEnd"];
const FINS_PSEUDO = ["sourceStart", "sourceEnd", "targetStart", "targetEnd"];
// CONFIG.DND5E.conditionTypes, difficultTerrainTypes, activityActivationTypes.
const ETATS = ["bleeding", "blinded", "burning", "charmed", "cursed", "dehydration", "deafened", "diseased", "exhaustion", "falling", "frightened",
  "grappled", "incapacitated", "invisible", "malnutrition", "paralyzed", "petrified", "poisoned", "prone", "restrained", "silenced", "stunned",
  "suffocation", "surprised", "transformed", "unconscious"];
const TERRAINS = ["ice", "liquid", "plants", "rocks", "mud", "sand", "slope", "snow", "web"];
const ACTIVATIONS = ["", "action", "bonus", "reaction", "minute", "hour", "day", "longRest", "shortRest", "encounter", "turnStart", "turnEnd", "legendary", "mythic", "lair", "crew", "special"];
const TYPES_ACTIVITE = ["attack", "damage", "heal", "save", "utility"];
// ActiveEffect5e.SHIM_FIELDS : anciennes clés redirigées (avertissement de compatibilité) — interdites ici.
const CLES_PERIMEES = ["flags.dnd5e.initiativeAdv", "system.attributes.init.bonus", "system.attributes.movement.walk", "system.attributes.movement.swim",
  "system.attributes.movement.fly", "system.attributes.movement.climb", "system.attributes.senses.darkvision", "system.attributes.senses.blindsight",
  "system.bonuses.mwak.attack", "system.bonuses.rwak.attack", "system.bonuses.mwak.damage", "system.bonuses.rwak.damage", "system.bonuses.abilities.save",
  "system.attributes.concentration.bonuses.save", "system.attributes.death.bonuses.save"];

// Clés d'effet admises et leur nature (dnd5e.mjs 6.0.6) : CommonTemplate.abilities.*.check|save = RollConfigField
// (roll = D20RollModificationField : bonus FormulaField, mode AdvantageModeField) ; CreatureTemplate : skills.*
// (roll, bonuses.passive, value), rolls.attack|damage|ability ; AttributesFields : ac.bonus, init, concentration,
// movement.bonus, movement.speeds (MappingField), movement.ignoredDifficultTerrain, senses.ranges ; CharacterData :
// hp.bonuses.level|overall, death ; TraitsField : dr|di|dv|ci.value (SetField).
const C = CARACTERISTIQUES.join("|"), S = COMPETENCES.join("|"), A = "mwak|rwak|msak|rsak";
const REFERENCE = [
  [`system\\.abilities\\.(${C})\\.(check|save)\\.roll\\.mode`, "avantage"],
  [`system\\.abilities\\.(${C})\\.(check|save)\\.roll\\.bonus`, "formule"],
  [`system\\.skills\\.(${S})\\.roll\\.mode`, "avantage"],
  [`system\\.skills\\.(${S})\\.roll\\.bonus`, "formule"],
  [`system\\.skills\\.(${S})\\.bonuses\\.passive`, "formule"],
  [`system\\.skills\\.(${S})\\.value`, "maitrise"],
  ["system\\.attributes\\.(init|concentration|death)\\.roll\\.mode", "avantage"],
  ["system\\.attributes\\.(init|concentration|death)\\.roll\\.bonus", "formule"],
  ["system\\.attributes\\.ac\\.bonus", "formule"],
  ["system\\.attributes\\.hp\\.bonuses\\.(level|overall)", "formule"],
  ["system\\.attributes\\.movement\\.bonus", "distance"],
  ["system\\.attributes\\.movement\\.speeds\\.(walk|burrow|climb|fly|swim)", "distance"],
  ["system\\.attributes\\.movement\\.ignoredDifficultTerrain", "terrain"],
  ["system\\.attributes\\.senses\\.ranges\\.(darkvision|blindsight|tremorsense|truesight)", "portee"],
  ["system\\.traits\\.(dr|di|dv)\\.value", "dommage"],
  ["system\\.traits\\.ci\\.value", "etat"],
  [`system\\.rolls\\.attack(\\.(${A}))?\\.mode`, "avantage"],
  [`system\\.rolls\\.attack(\\.(${A}))?\\.bonus`, "formule"],
  [`system\\.rolls\\.damage\\.(${A})\\.bonus`, "formule"],
  ["system\\.rolls\\.ability\\.(check|save|skill|tool)\\.mode", "avantage"],
  ["system\\.rolls\\.ability\\.(check|save|skill|tool)\\.bonus", "formule"]
].map(([m, n]) => [new RegExp(`^${m}$`), n]);
const nature = cle => REFERENCE.find(([m]) => m.test(cle))?.[1] ?? null;
const enCases = v => Number.isFinite(Number(v)) && Math.abs(Number(v) / 1.5 - Math.round(Number(v) / 1.5)) < 1e-9;
// Valeur et type acceptés par le champ visé (AdvantageModeField n'agit qu'avec ±1 en « add »).
const VALIDE = {
  avantage: (v, t) => (t === "add" && [1, -1].includes(v)) || (t === "override" && [1, 0, -1].includes(v)),
  formule: (v, t) => t !== "multiply" && (Number.isFinite(v) || (typeof v === "string" && /^[-+]?\s*[\d@(][\w@.()+\-*/\s]*$/.test(v))),
  distance: (v, t) => ["add", "subtract", "upgrade", "override"].includes(t) && v !== "" && enCases(v),
  portee: (v, t) => ["upgrade", "override"].includes(t) && typeof v === "number" && v > 0 && enCases(v),
  maitrise: (v, t) => ["upgrade", "override"].includes(t) && [0.5, 1, 2].includes(v),
  terrain: (v, t) => t === "add" && TERRAINS.includes(v),
  dommage: (v, t) => t === "add" && DOMMAGES.includes(v),
  etat: (v, t) => t === "add" && ETATS.includes(v)
};
// Un malus : désavantage, formule négative, vulnérabilité.
const estMalus = c => (nature(c.key) === "avantage" && c.value === -1) || (/^-/.test(String(c.value)) && nature(c.key) !== "etat") || c.key === "system.traits.dv.value";

// Reste anglais évident dans un texte joueur (après retrait des balises).
const ANGLAIS = /\b(the|and|you|your|with|damage|saving throw|advantage|disadvantage|creature|feat|hit points|proficiency|level|wound|disease|rest)\b/i;
const texteDe = h => String(h ?? "").replace(/<[^>]+>/g, " ");

// ---------------------------------------------------------------- Vérificateur (renvoie la liste des erreurs)

function verifier(liste) {
  const erreurs = [];
  const vus = { _id: new Set(), name: new Set(), cle: new Set(), identifiant: new Set() };
  for (const d of liste) {
    const err = m => erreurs.push(`${d.name ?? d._id} : ${m}`);
    try {
      // --- Identité
      for (const [champ, valeur] of [["_id", d._id], ["name", d.name], ["cle", d.__cle], ["identifiant", d.system?.identifier]]) {
        if (vus[champ].has(valeur)) err(`${champ} en double (${valeur})`);
        vus[champ].add(valeur);
      }
      if (!/^[A-Za-z0-9]{16}$/.test(d._id)) err("_id invalide");
      if (d._key !== `!items!${d._id}`) err("_key incorrecte");
      if (!["dons", "afflictions"].includes(d.__pack)) err(`compendium « ${d.__pack} » inattendu`);
      if (d.__cle !== `${d.__pack}:${cleDe(d)}`) err("__cle et flags.lakour-warcraft.cle ne correspondent pas");
      if (d.system?.identifier !== cleDe(d) || !/^[a-zA-Z0-9_-]+$/.test(d.system.identifier)) err("identifiant dnd5e invalide");
      if (d.type !== "feat") err(`type d'objet « ${d.type} »`);
      for (const k of Object.keys(d.system ?? {})) if (!CHAMPS_FEAT.includes(k)) err(`clé system « ${k} » absente du modèle FeatData`);
      if (Object.keys(d.system.type).some(k => !["value", "subtype"].includes(k))) err("system.type hors schéma");
      if (Object.keys(d.system.prerequisites).sort().join() !== "items,level,repeatable") err("prérequis hors schéma");
      if (d.system.prerequisites.level !== null && !Number.isInteger(d.system.prerequisites.level)) err("niveau prérequis non entier");
      if (d.system.properties.some(p => !["mgc", "trait"].includes(p))) err("propriété de don inconnue");

      // --- Textes
      if (!d.name?.trim()) err("nom vide");
      if (texteDe(d.system.description?.value).trim().length < 120) err("description vide ou trop courte");
      const textes = [d.name, d.system.requirements, d.system.description?.value, ...d.effects.flatMap(e => [e.name, e.description]),
        ...Object.values(d.system.activities).flatMap(a => [a.name, a.activation.condition, a.roll?.name]),
        ...Object.values(d.system.advancement).flatMap(a => [a.title, a.hint])];
      for (const t of textes) if (ANGLAIS.test(texteDe(t))) err(`reste anglais : « ${texteDe(t).match(ANGLAIS)[0]} »`);

      // --- Effets
      const clesEffets = new Set();
      for (const e of d.effects) {
        if (clesEffets.has(e._key)) err(`effet en double (${e._key})`);
        clesEffets.add(e._key);
        if (e._key !== `!items.effects!${d._id}.${e._id}`) err(`clé d'effet « ${e._key} » incorrecte`);
        for (const k of Object.keys(e)) if (!CHAMPS_EFFET.includes(k)) err(`champ d'effet « ${k} » inconnu`);
        for (const k of Object.keys(e.system)) if (!CHAMPS_SYSTEME_EFFET.includes(k)) err(`champ system d'effet « ${k} » inconnu`);
        if (e.type !== "base") err(`type d'effet « ${e.type} »`);
        if (!e.name?.trim()) err("effet sans nom");
        if (![0, 1, 2].includes(e.showIcon)) err(`showIcon ${e.showIcon}`);
        for (const s of e.statuses) if (!ETATS.includes(s)) err(`état « ${s} » inconnu`);
        if (!e.system.changes.length && !e.statuses.length) err(`effet « ${e.name} » vide`);
        for (const c of e.system.changes) {
          for (const k of Object.keys(c)) if (!CHAMPS_CHANGEMENT.includes(k)) err(`champ de changement « ${k} »`);
          if (!TYPES_CHANGEMENT.includes(c.type)) err(`type de changement « ${c.type} »`);
          if (c.phase !== "initial") err(`phase « ${c.phase} » (${c.key})`);
          if (CLES_PERIMEES.includes(c.key)) err(`clé périmée (shim) « ${c.key} »`);
          const n = nature(c.key);
          if (!n) err(`clé d'effet « ${c.key} » absente du modèle de personnage`);
          else if (!VALIDE[n](c.value, c.type)) err(`« ${c.type} ${c.value} » inapplicable à ${c.key} (${n})`);
        }
        const { value, units, expiry } = e.duration ?? {};
        if (!UNITES_DUREE.includes(units)) err(`unité de durée « ${units} »`);
        if (expiry !== null && !FINS.includes(expiry)) err(`fin d'effet « ${expiry} »`);
        // Effet transféré (passif, blessure, maladie) : permanent ; effet appliqué par une activité : durée ou fin pseudo.
        if (e.transfer && (value !== null || expiry !== null)) err(`effet transféré « ${e.name} » avec une durée`);
        if (!e.transfer) {
          if (!(FINS_PSEUDO.includes(expiry) || (Number.isInteger(value) && value > 0))) err(`effet appliqué « ${e.name} » sans durée`);
          if (!Object.values(d.system.activities).some(a => a.effects.some(x => x._id === e._id))) err(`effet appliqué « ${e.name} » qu'aucune activité n'applique`);
        }
      }

      // --- Activités et usages
      for (const a of Object.values(d.system.activities)) {
        if (!TYPES_ACTIVITE.includes(a.type)) err(`type d'activité « ${a.type} »`);
        if (!ACTIVATIONS.includes(a.activation.type)) err(`activation « ${a.activation.type} »`);
        for (const x of a.effects) if (!d.effects.some(e => e._id === x._id)) err(`activité « ${a.name} » : effet absent`);
        for (const c of a.save?.ability ?? []) if (!CARACTERISTIQUES.includes(c)) err(`sauvegarde de « ${c} »`);
        if (a.save && !(CARACTERISTIQUES.includes(a.save.dc.calculation) || /^\d+$/.test(a.save.dc.formula))) err("DD de sauvegarde invalide");
        for (const p of a.damage?.parts ?? []) for (const t of p.types) if (!DOMMAGES.includes(t)) err(`dégâts « ${t} »`);
        for (const t of a.healing?.types ?? []) if (!["healing", "temphp"].includes(t)) err(`soin « ${t} »`);
        if (a.consumption.targets.some(c => c.type === "itemUses") && !d.system.uses.max) err(`activité « ${a.name} » consomme des usages absents`);
      }
      if (d.system.uses.max) {
        if (!["lr", "sr"].includes(d.system.uses.recovery[0]?.period)) err("usages sans récupération au repos court ou long");
        if (!Object.values(d.system.activities).some(a => a.consumption.targets.some(c => c.type === "itemUses"))) err("usages qu'aucune activité ne consomme");
      }

      // --- Avancements
      const avancements = Object.entries(d.system.advancement);
      for (const [id, a] of avancements) {
        if (id !== a._id) err("avancement mal indexé");
        if (a.type === "Trait") for (const k of [...a.configuration.grants, ...a.configuration.choices.flatMap(c => c.pool)]) {
          try { cleTrait(k); } catch { err(`maîtrise « ${k} » inconnue`); }
        }
        if (a.type === "AbilityScoreImprovement") {
          const c = a.configuration;
          if (c.points !== 1 || c.cap !== 1 || c.locked.some(k => !CARACTERISTIQUES.includes(k)) || c.locked.length >= 6) err("+1 de caractéristique mal formé");
        }
      }
      const asi = avancements.filter(([, a]) => a.type === "AbilityScoreImprovement").map(([, a]) => a);

      // --- Dons : sous-type 2024, prérequis, +1 de caractéristique
      if (d.__pack === "dons") {
        const st = d.system.type.subtype;
        if (d.system.type.value !== "feat" || !SOUS_TYPES_DON.includes(st)) err(`catégorie de don « ${d.system.type.value}/${st} »`);
        const niveau = { general: 4, epicBoon: 19 }[st] ?? null;
        if (d.system.prerequisites.level !== niveau) err(`niveau prérequis ${d.system.prerequisites.level} (attendu ${niveau})`);
        const avecAsi = ["general", "epicBoon"].includes(st);
        if (asi.length !== (avecAsi ? 1 : 0)) err(`${asi.length} avancement(s) +1 pour un don ${st}`);
        if (st === "epicBoon" && asi[0]?.configuration.max !== 30) err("faveur épique : +1 jusqu'à 30");
        if (!["complete", "partielle", "texte"].includes(d.flags[MODULE].automatisation)) err("drapeau d'automatisation absent");
      }

      // --- Afflictions
      if (d.__pack === "afflictions") {
        const aff = d.flags[MODULE].affliction;
        if (d.system.type.value !== "" || d.system.type.subtype !== "") err("une affliction est une capacité générique");
        if (!["blessure", "maladie", "corruption"].includes(aff?.categorie)) err("catégorie d'affliction absente");
        if (!d.system.requirements) err("requirements vide");
        if (asi.length) err("une affliction n'améliore pas de caractéristique");
        for (const e of d.effects.filter(e => e.transfer)) if (e.showIcon !== 2) err(`effet « ${e.name} » pas toujours affiché`);
        if (aff?.categorie === "blessure") {
          const [e] = d.effects;
          if (d.effects.length !== 1 || !e.transfer || e.disabled) err("une blessure porte un seul effet transféré et actif");
          if (!e?.system.changes.some(estMalus)) err("blessure sans malus");
        }
        if (aff?.categorie === "maladie") {
          const [premier, ...suivants] = d.effects;
          if (d.effects.length !== aff.stades || d.effects.length < 2) err("un effet par stade, au moins deux");
          if (premier?.disabled || !premier?.statuses.includes("diseased")) err("stade 1 : actif, avec l'état « malade »");
          if (suivants.some(e => !e.disabled)) err("les stades suivants commencent désactivés");
          if (d.effects.some(e => !e.system.changes.some(estMalus))) err("un stade sans malus");
          const jets = Object.values(d.system.activities).filter(a => a.type === "save");
          const jet = jets[0];
          if (jets.length !== 1 || jet.activation.type !== "longRest" || jet.save.ability.join() !== aff.sauvegarde?.carac || jet.save.dc.formula !== String(aff.sauvegarde?.dd)) err("jet de sauvegarde après repos long incohérent avec la maladie");
          if (!texteDe(d.system.description.value).includes(`DD ${aff.sauvegarde?.dd}`)) err("le texte ne cite pas le DD");
        }
      }
    } catch (e) {
      err(`document illisible (${e.message})`);
    }
  }

  // --- Corruption : paliers 1 à 4, cumulatifs, DD croissants.
  const paliers = liste.filter(d => d.flags?.[MODULE]?.affliction?.categorie === "corruption")
    .toSorted((a, b) => a.flags[MODULE].affliction.palier - b.flags[MODULE].affliction.palier);
  const signature = d => new Set((d.effects ?? []).flatMap(e => e.system.changes.map(c => `${c.key}=${c.value}/${c.type}`)));
  if (paliers.map(d => d.flags[MODULE].affliction.palier).join() !== "1,2,3,4") erreurs.push("corruption : il faut les paliers 1 à 4");
  for (let i = 1; i < paliers.length; i++) {
    const avant = signature(paliers[i - 1]), apres = signature(paliers[i]);
    if (![...avant].every(c => apres.has(c)) || apres.size <= avant.size) erreurs.push(`corruption : le palier ${i + 1} ne reprend pas et n'aggrave pas le palier ${i}`);
    if (paliers[i].flags[MODULE].affliction.sauvegarde.dd <= paliers[i - 1].flags[MODULE].affliction.sauvegarde.dd) erreurs.push(`corruption : DD du palier ${i + 1} non croissant`);
  }
  return erreurs;
}

// ---------------------------------------------------------------- Contenu réel

test("dons et afflictions : tous les documents passent le vérificateur", () => {
  assert.deepEqual(verifier(TOUS), []);
});

test("une vingtaine de dons, chaque catégorie 2024 représentée, avec des prérequis de niveau", () => {
  assert.ok(DONS.length >= 20, `${DONS.length} dons`);
  const parType = Object.groupBy(DONS, d => d.system.type.subtype);
  for (const st of SOUS_TYPES_DON) assert.ok(parType[st]?.length >= 2, `pas assez de dons « ${st} »`);
  assert.ok(parType.general.length >= 8, "au moins huit dons généraux");
  for (const d of [...parType.general, ...parType.epicBoon]) assert.match(d.system.requirements, /^Niveau \d+ ou plus/, d.name);
  for (const d of parType.fightingStyle) assert.match(d.system.requirements, /Style de combat/, d.name);
  assert.ok(DONS.some(d => /Incantation/.test(d.system.requirements)), "aucun prérequis d'incantation");
});

test("automatisation : DONS_EN_TEXTE et DONS_EN_PARTIE justifient tout ce que le MJ applique", () => {
  const cles = DONS.map(cleDe);
  for (const [cle, raison] of [...Object.entries(DONS_EN_TEXTE), ...Object.entries(DONS_EN_PARTIE)]) {
    assert.ok(cles.includes(cle), `don inconnu : ${cle}`);
    assert.ok(raison.length >= 30, `${cle} : raison trop courte`);
  }
  assert.ok(Object.keys(DONS_EN_TEXTE).length >= 2 && Object.keys(DONS_EN_TEXTE).length <= DONS.length / 4, "dons en texte : quelques-uns, pas la majorité");
  for (const d of DONS) {
    const cle = cleDe(d);
    const mecanique = d.effects.length + Object.keys(d.system.activities).length
      + Object.values(d.system.advancement).filter(a => a.type !== "AbilityScoreImprovement").length;
    const attendu = DONS_EN_TEXTE[cle] ? "texte" : DONS_EN_PARTIE[cle] ? "partielle" : "complete";
    assert.equal(d.flags[MODULE].automatisation, attendu, cle);
    assert.ok(!(DONS_EN_TEXTE[cle] && DONS_EN_PARTIE[cle]), `${cle} : texte et partiel à la fois`);
    if (DONS_EN_TEXTE[cle]) assert.equal(mecanique, 0, `${cle} : en texte mais automatisé`);
    else assert.ok(mecanique > 0, `${cle} : ni effet, ni activité, ni avancement, ni justification`);
  }
});

test("les effets des dons couvrent bonus, avantages, maîtrises, résistances, immunités, vitesse, terrain et sens", () => {
  const natures = new Set(DONS.flatMap(d => d.effects.flatMap(e => e.system.changes.map(c => nature(c.key)))));
  for (const n of ["avantage", "formule", "maitrise", "dommage", "etat", "distance", "terrain", "portee"]) assert.ok(natures.has(n), `aucun effet de nature « ${n} »`);
  // Un effet temporaire au moins utilise une fin propre à dnd5e (fin du prochain tour de la source).
  assert.ok(DONS.some(d => d.effects.some(e => e.duration.expiry === "sourceEnd")), "aucune fin d'effet « sourceEnd »");
  assert.ok(DONS.some(d => d.effects.some(e => !e.transfer && e.duration.units === "minutes")), "aucun effet temporaire en minutes");
});

test("au moins huit blessures, cinq maladies et quatre paliers de corruption", () => {
  const parCategorie = Object.groupBy(AFFLICTIONS, d => d.flags[MODULE].affliction.categorie);
  assert.ok(parCategorie.blessure.length >= 8, `${parCategorie.blessure.length} blessures`);
  assert.ok(parCategorie.maladie.length >= 5, `${parCategorie.maladie.length} maladies`);
  assert.equal(parCategorie.corruption.length, 4);
  // La peste du Fléau a trois stades, et les paliers de corruption avancés permettent de puiser dans la gangrène.
  assert.equal(parCle(AFFLICTIONS, "peste-du-fleau").effects.length, 3);
  for (const n of [2, 3, 4]) {
    const p = parCorruption(n);
    assert.ok(Object.values(p.system.activities).some(a => a.healing?.types.includes("temphp")), `palier ${n} : pas de points de vie temporaires`);
    assert.equal(Number(p.system.uses.max), n - 1, `palier ${n} : usages`);
  }
  assert.ok(parCorruption(4).effects[0].statuses.includes("cursed"), "palier 4 : état « maudit »");
});
const parCorruption = n => AFFLICTIONS.find(d => d.flags[MODULE].affliction.palier === n);

test("le constructeur refuse une clé, un type, une valeur, un état ou une durée inconnus de dnd5e", () => {
  const base = { cle: "essai", nom: "Essai", img: "icons/svg/d20.svg", texte: "Texte d'essai." };
  const avec = effet => () => capacite("dons", { ...base, effets: [effet] });
  assert.doesNotThrow(avec({ nom: "ok", changements: [["system.attributes.ac.bonus", "1"]] }));
  assert.throws(avec({ nom: "x", changements: [["system.attributes.movement.walk", 3]] }), /absente du modèle/);
  assert.throws(avec({ nom: "x", changements: [["system.skills.xyz.roll.mode", 1]] }), /absente du modèle/);
  assert.throws(avec({ nom: "x", changements: [["system.attributes.ac.bonus", "1", "plus"]] }), /type de changement/);
  assert.throws(avec({ nom: "x", changements: [["system.skills.prc.roll.mode", 2]] }), /valeur/);
  assert.throws(avec({ nom: "x", changements: [["system.traits.dr.value", "fel"]] }), /valeur/);
  assert.throws(avec({ nom: "x", changements: [["system.attributes.movement.bonus", "2"]] }), /valeur/);
  assert.throws(avec({ nom: "x", etats: ["sick"] }), /état/);
  assert.throws(avec({ nom: "x", changements: [["system.attributes.ac.bonus", "1"]], duree: [1, "weeks"] }), /unité de durée/);
  assert.throws(avec({ nom: "x" }), /sans changement/);
});

// ---------------------------------------------------------------- Batterie par mutation
// Chaque mutation casse une règle sur une copie du contenu ; le vérificateur doit le signaler.

const premierEffet = d => d.effects.find(e => e.system.changes.length);
const premiereActivite = (d, type) => Object.values(d.system.activities).find(a => !type || a.type === type);
const MUTATIONS = [
  ["clé d'effet périmée (shim)", L => { premierEffet(parCle(L, "coureur-des-hautes-terres")).system.changes[0].key = "system.attributes.movement.walk"; }],
  ["clé d'effet hors du modèle", L => { premierEffet(parCle(L, "cavalier-des-steppes")).system.changes[0].key = "system.skills.dressage.roll.mode"; }],
  ["type de changement inconnu", L => { premierEffet(parCle(L, "brise-rangs")).system.changes[0].type = "plus"; }],
  ["avantage hors de ±1", L => { premierEffet(parCle(L, "jambe-boiteuse")).system.changes[1].value = -2; }],
  ["phase de changement absente", L => { delete premierEffet(parCle(L, "sentinelle-de-la-muraille")).system.changes[0].phase; }],
  ["type de dommages inconnu", L => { premierEffet(parCle(L, "garde-de-la-lumiere")).system.changes[0].value = "holy"; }],
  ["état inconnu", L => { parCle(L, "peste-du-fleau").effects[0].statuses = ["sick"]; }],
  ["unité de durée inconnue", L => { parCle(L, "lien-avec-un-loa").effects[0].duration.units = "weeks"; }],
  ["fin d'effet inconnue", L => { parCle(L, "lien-avec-un-loa").effects[0].duration.expiry = "dawn"; }],
  ["effet transféré avec une durée", L => { premierEffet(parCle(L, "esprit-d-acier")).duration.value = 60; }],
  ["effet appliqué sans durée", L => { parCle(L, "hurlement-de-guerre-orc").effects[0].duration.expiry = null; }],
  ["affichage d'icône invalide", L => { parCle(L, "oeil-creve").effects[0].showIcon = 3; }],
  ["sous-type de don inconnu", L => { parCle(L, "brise-rangs").system.type.subtype = "heroic"; }],
  ["niveau de don général absent", L => { parCle(L, "echo-des-aspects").system.prerequisites.level = null; }],
  ["+1 de caractéristique retiré", L => { const d = parCle(L, "esprit-d-acier"); for (const [id, a] of Object.entries(d.system.advancement)) if (a.type === "AbilityScoreImprovement") delete d.system.advancement[id]; }],
  ["maîtrise inconnue", L => { Object.values(parCle(L, "lien-avec-un-loa").system.advancement)[0].configuration.choices[0].pool.push("skills:vaudou"); }],
  ["identifiant en double", L => { parCle(L, "brise-rangs")._id = parCle(L, "tireur-des-peregrins")._id; }],
  ["_key incorrecte", L => { parCle(L, "toux-noire")._key = "!items!xxxxxxxxxxxxxxxx"; }],
  ["clé system inconnue", L => { parCle(L, "crane-fele").system.prerequisite = {}; }],
  ["description vide", L => { parCle(L, "main-mutilee").system.description.value = ""; }],
  ["reste anglais", L => { parCle(L, "bricoleur-gobelin").system.description.value += "<p>You gain advantage on the roll.</p>"; }],
  ["activité citant un effet absent", L => { premiereActivite(parCle(L, "hurlement-de-guerre-orc")).effects[0]._id = "AAAAAAAAAAAAAAAA"; }],
  ["type d'activité inconnu", L => { premiereActivite(parCle(L, "cuisinier-de-campagne")).type = "cook"; }],
  ["sauvegarde de caractéristique inconnue", L => { premiereActivite(parCle(L, "bricoleur-gobelin"), "save").save.ability = ["agi"]; }],
  ["type de dégâts d'activité inconnu", L => { premiereActivite(parCle(L, "echo-des-aspects"), "save").damage.parts[0].types.push("fel"); }],
  ["usages qu'aucune activité ne consomme", L => { for (const a of Object.values(parCle(L, "garde-de-la-lumiere").system.activities)) a.consumption.targets = []; }],
  ["blessure sans malus", L => { parCle(L, "cicatrice-defigurante").effects[0].system.changes = [{ key: "system.skills.itm.roll.mode", type: "add", value: 1, phase: "initial", priority: null }]; }],
  ["maladie : stade 2 déjà actif", L => { parCle(L, "fievre-des-marais").effects[1].disabled = false; }],
  ["maladie : stade 1 sans l'état malade", L => { parCle(L, "mal-de-gnomeregan").effects[0].statuses = []; }],
  ["maladie : DD du jet différent", L => { premiereActivite(parCle(L, "fievre-du-cauchemar"), "save").save.dc.formula = "10"; }],
  ["corruption non cumulative", L => { parCle(L, "corruption-palier-3").effects[0].system.changes.shift(); }],
  ["corruption : palier manquant", L => { L.splice(L.indexOf(parCle(L, "corruption-palier-2")), 1); }]
];

test("le vérificateur détecte chaque règle cassée", () => {
  const passees = [];
  for (const [regle, muter] of MUTATIONS) {
    const copie = structuredClone(TOUS);
    muter(copie);
    if (!verifier(copie).length) passees.push(regle);
  }
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});
