// Essais des sous-classes d'Azeroth de lakour-warcraft (contenu/sous-classes.mjs) : chaque sous-classe est un objet
// « subclass » valide pour dnd5e 6.0.6 (clés du modèle SubclassData, classIdentifier d'une classe du SRD 2024),
// chaque avancement a la forme 6.0.6 (name, pas title) et tombe aux niveaux de sous-classe de sa classe, chaque
// ItemGrant vise une capacité fabriquée, un sort maison de sorts.mjs ou un sort du SRD, aux bons niveaux de sort ;
// chaque capacité est un « feat » de classe dont les activités, effets, formules (@scale, @classes) et consommations
// sont conformes ; identifiants uniques, textes français non vides. Les tables de référence ci-dessous sont relevées
// indépendamment du constructeur, dans le source de dnd5e 6.0.6 (dnd5e.mjs) et dans les compendiums classes24 et
// spells24 du SRD 5.2. Le vérificateur est rejoué sur des copies cassées : chaque règle cassée doit être détectée.
// Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { CARACTERISTIQUES, COMPETENCES, DOMMAGES, cleTrait } from "../modules/lakour-warcraft/contenu/objets.mjs";
import { SORTS } from "../modules/lakour-warcraft/contenu/sorts.mjs";
import { SOUS_CLASSES, CAPACITES_SOUS_CLASSES, CAPACITES_EN_PARTIE, sousClasse } from "../modules/lakour-warcraft/contenu/sous-classes.mjs";

const MODULE = "lakour-warcraft";
const TOUS = [...SOUS_CLASSES, ...CAPACITES_SOUS_CLASSES];
const cleDe = d => d.flags?.[MODULE]?.cle;
const parCle = (liste, cle) => liste.find(d => cleDe(d) === cle);

// ---------------------------------------------------------------- Références (dnd5e 6.0.6, SRD 5.2)

// Classes de dnd5e.classes24 : niveaux des capacités de sous-classe (ItemGrant « Subclass Features » des sous-classes
// SRD : Life 3/6/17, Devotion 3/7/15/20, Land 3/6/10/14, Champion 3/7/10/15/18, Hunter 3/7/11/15, Thief 3/9/13/17,
// Fiend 3/6/10/14, Evoker 3/6/10/14…), progression d'incantation et paliers des sorts de sous-classe (Life 3/5/7/9,
// Devotion 3/5/9/13/17, Fiend 3/5/7/9).
const CLASSES = {
  barbarian: { niveaux: [3, 6, 10, 14] }, bard: { niveaux: [3, 6, 14], sorts: "plein" },
  cleric: { niveaux: [3, 6, 17], sorts: "plein", paliers: [3, 5, 7, 9] },
  druid: { niveaux: [3, 6, 10, 14], sorts: "plein", paliers: [3, 5, 7, 9] },
  fighter: { niveaux: [3, 7, 10, 15, 18] }, monk: { niveaux: [3, 6, 11, 17] },
  paladin: { niveaux: [3, 7, 15, 20], sorts: "demi", paliers: [3, 5, 9, 13, 17] },
  ranger: { niveaux: [3, 7, 11, 15], sorts: "demi", paliers: [3, 5, 9, 13, 17] },
  rogue: { niveaux: [3, 9, 13, 17] }, sorcerer: { niveaux: [3, 6, 14, 18], sorts: "plein" },
  warlock: { niveaux: [3, 6, 10, 14], sorts: "pacte", paliers: [3, 5, 7, 9] },
  wizard: { niveaux: [3, 6, 10, 14], sorts: "plein", paliers: [3, 5, 7, 9] }
};
const sortMax = (prog, n) => ({ plein: Math.min(9, Math.ceil(n / 2)), demi: Math.min(5, Math.ceil(n / 4)), pacte: Math.min(5, Math.ceil(n / 2)) })[prog] ?? 0;
// Sorts du SRD 2024 (dnd5e.spells24) admis dans les sous-classes, avec leur niveau.
const SORTS_SRD = Object.fromEntries(Object.entries({
  phbsplThunderwav: 1, phbsplGustofWind: 2, phbsplWindWall00: 3, phbsplStoneShape: 4, phbsplConjureMin: 4, phbsplConjureEle: 5,
  phbsplWallofSton: 5, phbEvilAndGoodPr: 1, phbsplLesserRest: 2, phbsplDaylight00: 3, phbsplDeathWard0: 4, phbsplBanishment: 4,
  phbsplDispelEvil: 5, phbsplHallow0000: 5, phbsplSleep00000: 1, phbsplPlantGrowt: 3, phbsplSpeakwithP: 3, phbsplConjureWoo: 4,
  phbsplFreedomofM: 4, phbsplDream00000: 5, phbsplTreeStride: 5, phbsplSeeInvisib: 2, phbsplMagicCircl: 3, phbsplHellishReb: 1,
  phbsplDarkness00: 2, phbsplRayofEnfee: 2, phbsplVampiricTo: 3, phbsplBestowCurs: 3, phbsplBlight0000: 4, phbsplContagion0: 5,
  phbsplCloudkill0: 5, phbsplCounterspe: 3
}).map(([id, n]) => [`Compendium.dnd5e.spells24.Item.${id}`, n]));
const SORTS_MAISON = Object.fromEntries(SORTS.map(s => [s.__cle, s]));
// Ressources de classe du SRD (system.identifier dans classes24) qu'une activité peut dépenser.
const CIBLES_CONSO = { cleric: ["feat:channel-divinity-cleric"], paladin: ["feat:channel-divinity-paladin"], druid: ["feat:wild-shape"] };

// SubclassData = AdvancementTemplate + ItemDescriptionTemplate + classIdentifier, spellcasting (SpellcastingField).
const CHAMPS_SUBCLASS = ["advancement", "classIdentifier", "description", "identifier", "source", "spellcasting"];
// FeatData + gabarits ItemDescription, Activities, Advancement, ItemType.
const CHAMPS_FEAT = ["description", "identifier", "source", "activities", "damage", "uses", "advancement", "type", "cover", "crewed", "enchant", "prerequisites", "properties", "requirements"];
// BaseAdvancement.defineSchema (6.0.6) : « title » est migré vers « name ».
const CHAMPS_AVANCEMENT = ["_id", "type", "configuration", "value", "level", "name", "hint", "img", "flags", "classRestriction"];
const CHAMPS_ITEMGRANT = ["items", "optional", "sorting", "spell"];
const CHAMPS_CONFIG_SORT = ["ability", "method", "prepared", "uses"];   // SpellConfigurationData
const CHAMPS_SCALE = ["identifier", "type", "distance", "scale"];         // ScaleValueConfigurationData
const FACES = [4, 6, 8, 10, 12, 20];
// CONFIG.DND5E.conditionTypes, activityActivationTypes, Foundry 14 : unités et fins de durée d'effet.
const ETATS = ["bleeding", "blinded", "burning", "charmed", "cursed", "dehydration", "deafened", "diseased", "exhaustion", "falling", "frightened",
  "grappled", "incapacitated", "invisible", "malnutrition", "paralyzed", "petrified", "poisoned", "prone", "restrained", "silenced", "stunned",
  "suffocation", "surprised", "transformed", "unconscious"];
const ACTIVATIONS = ["", "action", "bonus", "reaction", "minute", "hour", "day", "longRest", "shortRest", "encounter", "turnStart", "turnEnd", "legendary", "mythic", "lair", "crew", "special"];
const TYPES_ACTIVITE = ["attack", "damage", "heal", "save", "utility"];
const UNITES_DUREE = ["years", "months", "days", "hours", "minutes", "seconds", "rounds", "turns"];
const FINS = ["combatStart", "roundStart", "turnStart", "combatEnd", "roundEnd", "turnEnd", "sourceStart", "sourceEnd", "targetStart", "targetEnd"];
const FINS_PSEUDO = ["sourceStart", "sourceEnd", "targetStart", "targetEnd"];
const TYPES_CHANGEMENT = ["custom", "multiply", "add", "subtract", "downgrade", "upgrade", "override"];
// Clés d'effet du modèle de personnage (dnd5e.mjs 6.0.6) et nature du champ visé.
const Cc = CARACTERISTIQUES.join("|"), S = COMPETENCES.join("|"), A = "mwak|rwak|msak|rsak";
const REFERENCE = [
  [`system\\.abilities\\.(${Cc})\\.(check|save)\\.roll\\.mode`, "avantage"],
  [`system\\.skills\\.(${S})\\.roll\\.mode`, "avantage"],
  [`system\\.skills\\.(${S})\\.value`, "maitrise"],
  ["system\\.attributes\\.(init|concentration|death)\\.roll\\.mode", "avantage"],
  ["system\\.attributes\\.ac\\.bonus", "formule"],
  ["system\\.attributes\\.hp\\.bonuses\\.(level|overall)", "formule"],
  ["system\\.attributes\\.movement\\.speeds\\.(walk|burrow|climb|fly|swim)", "distance"],
  ["system\\.attributes\\.senses\\.ranges\\.(darkvision|blindsight|tremorsense|truesight)", "portee"],
  ["system\\.traits\\.(dr|di|dv)\\.value", "dommage"],
  ["system\\.traits\\.ci\\.value", "etat"],
  [`system\\.rolls\\.attack(\\.(${A}))?\\.mode`, "avantage"],
  [`system\\.rolls\\.damage\\.(${A})\\.bonus`, "formule"]
].map(([m, n]) => [new RegExp(`^${m}$`), n]);
const nature = cle => REFERENCE.find(([m]) => m.test(cle))?.[1] ?? null;
const enCases = v => Number.isFinite(Number(v)) && Math.abs(Number(v) / 1.5 - Math.round(Number(v) / 1.5)) < 1e-9;
const VALIDE = {
  avantage: (v, t) => (t === "add" && [1, -1].includes(v)) || (t === "override" && [1, 0, -1].includes(v)),
  formule: (v, t) => t !== "multiply" && (Number.isFinite(v) || (typeof v === "string" && /^[-+]?\s*[\d@(][\w@.()+\-*/\s]*$/.test(v))),
  distance: (v, t) => ["add", "subtract", "upgrade", "override"].includes(t) && v !== "" && enCases(v),
  portee: (v, t) => ["upgrade", "override"].includes(t) && typeof v === "number" && v > 0 && enCases(v),
  maitrise: (v, t) => ["upgrade", "override"].includes(t) && [0.5, 1, 2].includes(v),
  dommage: (v, t) => t === "add" && DOMMAGES.includes(v),
  etat: (v, t) => t === "add" && ETATS.includes(v)
};

const ANGLAIS = /\b(the|and|you|your|with|damage|saving throw|advantage|disadvantage|creature|feat|hit points|proficiency|level|wound|disease|rest|subclass|features?|spells?)\b/i;
const texteDe = h => String(h ?? "").replace(/<[^>]+>/g, " ");
const refDe = u => (u && typeof u === "object" ? u.__ref : null);

// ---------------------------------------------------------------- Vérificateur (renvoie la liste des erreurs)

function verifier(liste) {
  const erreurs = [];
  const vus = { _id: new Set(), name: new Set(), cle: new Set(), identifiant: new Set() };
  const sousClasses = liste.filter(d => d.type === "subclass");
  const capacites = liste.filter(d => d.type !== "subclass");
  const accordees = new Map();   // __cle de capacité -> nombre d'octrois

  for (const d of liste) {
    const err = m => erreurs.push(`${d.name ?? d._id} : ${m}`);
    try {
      // --- Identité
      for (const [champ, valeur] of [["_id", d._id], ["name", d.name], ["cle", d.__cle], ["identifiant", `${d.type}:${d.system?.identifier}`]]) {
        if (vus[champ].has(valeur)) err(`${champ} en double (${valeur})`);
        vus[champ].add(valeur);
      }
      if (!/^[A-Za-z0-9]{16}$/.test(d._id)) err("_id invalide");
      if (d._key !== `!items!${d._id}`) err("_key incorrecte");
      if (d.__pack !== "classes") err(`compendium « ${d.__pack} » inattendu`);
      if (d.__cle !== `classes:${cleDe(d)}`) err("__cle et flags.lakour-warcraft.cle ne correspondent pas");
      if (d.system?.identifier !== cleDe(d) || !/^[a-z0-9-]+$/.test(d.system.identifier)) err("identifiant dnd5e invalide");
      if (!d.name?.trim() || ANGLAIS.test(d.name)) err("nom vide ou anglais");
      const longueur = texteDe(d.system?.description?.value).trim().length;
      if (longueur < (d.type === "subclass" ? 300 : 80)) err("description vide ou trop courte");
      if (ANGLAIS.test(texteDe(d.system.description.value))) err(`reste anglais : « ${texteDe(d.system.description.value).match(ANGLAIS)[0]} »`);
      const avancements = Object.entries(d.system.advancement ?? {});
      for (const [id, a] of avancements) {
        if (id !== a._id) err("avancement mal indexé");
        for (const k of Object.keys(a)) if (!CHAMPS_AVANCEMENT.includes(k)) err(`champ d'avancement « ${k} » hors du schéma 6.0.6`);
        for (const t of [a.name, a.hint]) if (ANGLAIS.test(texteDe(t))) err(`avancement anglais : « ${t} »`);
      }

      // --- Sous-classe
      if (d.type === "subclass") {
        for (const k of Object.keys(d.system)) if (!CHAMPS_SUBCLASS.includes(k)) err(`clé system « ${k} » absente du modèle SubclassData`);
        for (const k of CHAMPS_SUBCLASS) if (!(k in d.system)) err(`clé system « ${k} » manquante`);
        const classe = CLASSES[d.system.classIdentifier];
        if (!classe) { err(`classIdentifier « ${d.system.classIdentifier} » absent des classes du SRD`); continue; }
        if (d.system.spellcasting.progression !== "none") err("une sous-classe de lanceur ne change pas la progression de sorts");
        if (!d.name?.trim() || !avancements.length) err("sous-classe vide");
        const niveauxCapacites = new Set();
        const echelles = new Map();
        for (const [, a] of avancements) {
          if (!["ItemGrant", "Trait", "ScaleValue"].includes(a.type)) err(`type d'avancement « ${a.type} »`);
          if (a.type !== "ScaleValue" && !classe.niveaux.concat(classe.paliers ?? []).includes(a.level)) err(`avancement ${a.type} au niveau ${a.level}, hors des paliers de la classe`);
          if (a.type === "ItemGrant") {
            for (const k of Object.keys(a.configuration)) if (!CHAMPS_ITEMGRANT.includes(k)) err(`clé ItemGrant « ${k} »`);
            if (!a.configuration.items.length) err("ItemGrant vide");
            for (const it of a.configuration.items) if (Object.keys(it).some(k => !["uuid", "optional", "sort"].includes(k))) err("entrée d'ItemGrant hors schéma");
            const sort = a.configuration.spell;
            if (sort === null) {
              if (!classe.niveaux.includes(a.level)) err(`capacités accordées au niveau ${a.level}, qui n'est pas un niveau de sous-classe`);
              niveauxCapacites.add(a.level);
              for (const { uuid } of a.configuration.items) {
                const cible = liste.find(x => x.__cle === refDe(uuid));
                if (!cible || cible.type !== "feat") { err(`ItemGrant vers un document non fabriqué (${JSON.stringify(uuid)})`); continue; }
                accordees.set(cible.__cle, (accordees.get(cible.__cle) ?? 0) + 1);
                if (cible.system.prerequisites.level !== a.level) err(`${cible.name} : accordée au niveau ${a.level}, prérequis ${cible.system.prerequisites.level}`);
                if (cible.flags[MODULE].sousClasse !== cleDe(d)) err(`${cible.name} appartient à une autre sous-classe`);
                if (cible.system.requirements !== d.name) err(`${cible.name} : exigence « ${cible.system.requirements} » au lieu de « ${d.name} »`);
              }
            } else {
              for (const k of Object.keys(sort)) if (!CHAMPS_CONFIG_SORT.includes(k)) err(`clé de configuration de sort « ${k} »`);
              if (!classe.sorts) err("sorts accordés à une classe sans incantation");
              if (sort.method !== (d.system.classIdentifier === "warlock" ? "pact" : "spell")) err(`méthode d'incantation « ${sort.method} »`);
              if (![0, 1, 2].includes(sort.prepared)) err(`état de préparation ${sort.prepared}`);
              if (!Array.isArray(sort.ability) || Object.keys(sort.uses).sort().join() !== "max,per,requireSlot") err("configuration de sort hors schéma");
              if (sort.uses.max && !["lr", "sr"].includes(sort.uses.per)) err("sort gratuit sans récupération");
              for (const { uuid } of a.configuration.items) {
                const r = refDe(uuid);
                const niveau = r ? SORTS_MAISON[r]?.system.level : SORTS_SRD[uuid];
                if (niveau === undefined) { err(`sort inconnu (${JSON.stringify(uuid)})`); continue; }
                if (niveau < 1 || niveau > sortMax(classe.sorts, a.level)) err(`sort de niveau ${niveau} accordé au niveau ${a.level} de classe`);
                if (r && !texteDe(d.system.description.value).includes(SORTS_MAISON[r].name)) err(`la description ne cite pas ${SORTS_MAISON[r].name}`);
              }
            }
          }
          if (a.type === "Trait") {
            for (const k of [...a.configuration.grants, ...a.configuration.choices.flatMap(c => c.pool)]) {
              try { cleTrait(k); } catch { err(`maîtrise « ${k} » inconnue`); }
            }
            if (!capacites.some(c => c.flags[MODULE].sousClasse === cleDe(d) && c.name === a.name && c.system.prerequisites.level === a.level)) err(`maîtrises « ${a.name} » sans capacité de ce nom et de ce niveau`);
          }
          if (a.type === "ScaleValue") {
            const c = a.configuration;
            if (Object.keys(c).some(k => !CHAMPS_SCALE.includes(k)) || c.type !== "dice" || !/^[a-z0-9-]+$/.test(c.identifier)) err(`échelle « ${c.identifier} » hors schéma`);
            if (echelles.has(c.identifier)) err(`échelle « ${c.identifier} » en double`);
            const niveaux = Object.keys(c.scale).map(Number);
            echelles.set(c.identifier, Math.min(...niveaux));
            for (const [niv, v] of Object.entries(c.scale)) {
              if (!(Number(niv) >= 3 && Number(niv) <= 20) || !Number.isInteger(v.number) || v.number < 1 || !FACES.includes(v.faces) || !Array.isArray(v.modifiers)) err(`échelle ${c.identifier} : valeur invalide au niveau ${niv}`);
            }
          }
        }
        if ([...niveauxCapacites].sort((x, y) => x - y).join() !== classe.niveaux.join()) err(`capacités aux niveaux ${[...niveauxCapacites]} au lieu de ${classe.niveaux}`);
        // Échelles : lues par une capacité de la sous-classe, acquise au plus tard au premier niveau de l'échelle.
        const miennes = capacites.filter(c => c.flags[MODULE].sousClasse === cleDe(d));
        for (const [id, premier] of echelles) {
          const lecteurs = miennes.filter(c => JSON.stringify(c.system.activities).includes(`@scale.${d.system.identifier}.${id}`));
          if (!lecteurs.length) err(`échelle ${id} lue par aucune capacité`);
          if (lecteurs.some(c => c.system.prerequisites.level < premier)) err(`échelle ${id} indéfinie au niveau de sa capacité`);
        }
        for (const c of miennes) {
          for (const [, sc, ech] of JSON.stringify([c.system.activities, c.effects]).matchAll(/@scale\.([\w-]+)\.([\w-]+)/g)) {
            if (sc !== d.system.identifier || !echelles.has(ech)) err(`${c.name} : @scale.${sc}.${ech} sans échelle`);
          }
          if (c.flags[MODULE].classe !== d.system.classIdentifier) err(`${c.name} : classe « ${c.flags[MODULE].classe} »`);
          if (c.flags[MODULE].liste && !avancements.some(([, a]) => a.type === "ItemGrant" && a.configuration.spell)) err(`${c.name} : liste de sorts sans sorts accordés`);
        }
        continue;
      }

      // --- Capacité de sous-classe
      if (d.type !== "feat") err(`type d'objet « ${d.type} »`);
      for (const k of Object.keys(d.system)) if (!CHAMPS_FEAT.includes(k)) err(`clé system « ${k} » absente du modèle FeatData`);
      if (d.system.type.value !== "class" || d.system.type.subtype !== "") err(`type de capacité « ${d.system.type.value}/${d.system.type.subtype} »`);
      if (Object.keys(d.system.prerequisites).sort().join() !== "items,level,repeatable") err("prérequis hors schéma");
      const sc = sousClasses.find(s => cleDe(s) === d.flags[MODULE].sousClasse);
      if (!sc) { err("sous-classe introuvable"); continue; }
      const classe = sc.system.classIdentifier;
      if (!CLASSES[classe]?.niveaux.includes(d.system.prerequisites.level)) err(`niveau ${d.system.prerequisites.level} hors des niveaux de sous-classe`);
      if (d.flags[MODULE].niveau !== d.system.prerequisites.level) err("drapeau de niveau incohérent");
      if (avancements.length) err("une capacité de sous-classe ne porte pas d'avancement (la sous-classe les porte)");
      const textes = [...d.effects.flatMap(e => [e.name, e.description]), ...Object.values(d.system.activities).flatMap(a => [a.name, a.activation.condition, a.roll?.name])];
      for (const t of textes) if (ANGLAIS.test(texteDe(t))) err(`reste anglais : « ${texteDe(t).match(ANGLAIS)[0]} »`);

      // Effets
      for (const e of d.effects) {
        if (e._key !== `!items.effects!${d._id}.${e._id}`) err(`clé d'effet « ${e._key} » incorrecte`);
        if (e.type !== "base" || !e.name?.trim()) err("effet mal formé");
        for (const s of e.statuses) if (!ETATS.includes(s)) err(`état « ${s} » inconnu`);
        if (!e.system.changes.length && !e.statuses.length) err(`effet « ${e.name} » vide`);
        for (const c of e.system.changes) {
          if (!TYPES_CHANGEMENT.includes(c.type)) err(`type de changement « ${c.type} »`);
          if (c.phase !== "initial") err(`phase « ${c.phase} »`);
          const n = nature(c.key);
          if (!n) err(`clé d'effet « ${c.key} » absente du modèle de personnage`);
          else if (!VALIDE[n](c.value, c.type)) err(`« ${c.type} ${c.value} » inapplicable à ${c.key} (${n})`);
        }
        const { value, units, expiry } = e.duration ?? {};
        if (!UNITES_DUREE.includes(units)) err(`unité de durée « ${units} »`);
        if (expiry !== null && !FINS.includes(expiry)) err(`fin d'effet « ${expiry} »`);
        if (e.transfer && (value !== null || expiry !== null)) err(`effet transféré « ${e.name} » avec une durée`);
        if (!e.transfer) {
          if (!(FINS_PSEUDO.includes(expiry) || (Number.isInteger(value) && value > 0))) err(`effet appliqué « ${e.name} » sans durée`);
          if (!Object.values(d.system.activities).some(a => a.effects.some(x => x._id === e._id))) err(`effet appliqué « ${e.name} » qu'aucune activité n'applique`);
        }
      }

      // Activités, formules, consommation
      for (const a of Object.values(d.system.activities)) {
        if (!TYPES_ACTIVITE.includes(a.type)) err(`type d'activité « ${a.type} »`);
        if (!ACTIVATIONS.includes(a.activation.type)) err(`activation « ${a.activation.type} »`);
        if (a.activation.type === "" && !a.activation.condition) err(`activité « ${a.name} » sans activation ni condition`);
        for (const x of a.effects) if (!d.effects.some(e => e._id === x._id)) err(`activité « ${a.name} » : effet absent`);
        for (const c of a.save?.ability ?? []) if (!CARACTERISTIQUES.includes(c)) err(`sauvegarde de « ${c} »`);
        if (a.save && !(CARACTERISTIQUES.includes(a.save.dc.calculation) || /^\d+$/.test(a.save.dc.formula))) err("DD de sauvegarde invalide");
        for (const p of [...(a.damage?.parts ?? []), ...(a.healing ? [a.healing] : [])]) {
          if (p.custom.enabled && p.bonus) err(`bonus « ${p.bonus} » ignoré par la formule libre « ${p.custom.formula} »`);
          if (!p.custom.enabled && !(p.number > 0 && p.denomination > 0)) err("partie de dégâts ou de soins vide");
        }
        for (const p of a.damage?.parts ?? []) for (const t of p.types) if (!DOMMAGES.includes(t)) err(`dégâts « ${t} »`);
        for (const t of a.healing?.types ?? []) if (!["healing", "temphp"].includes(t)) err(`soin « ${t} »`);
        for (const [, x] of JSON.stringify(a).matchAll(/@classes\.([\w-]+)\./g)) if (x !== classe) err(`@classes.${x} dans une capacité de ${classe}`);
        for (const t of a.consumption.targets) {
          if (t.type !== "itemUses") err(`consommation « ${t.type} »`);
          else if (t.target === "" && !d.system.uses.max) err(`activité « ${a.name} » consomme des usages absents`);
          else if (t.target !== "" && !(CIBLES_CONSO[classe] ?? []).includes(t.target)) err(`activité « ${a.name} » dépense « ${t.target} », étranger au ${classe}`);
        }
      }
      if (d.system.uses.max) {
        if (!["lr", "sr"].includes(d.system.uses.recovery[0]?.period)) err("usages sans récupération au repos court ou long");
        if (!Object.values(d.system.activities).some(a => a.consumption.targets.some(c => c.type === "itemUses" && c.target === ""))) err("usages qu'aucune activité ne consomme");
      }

      // Automatisation
      const auto = d.flags[MODULE].automatisation;
      const mecanique = d.effects.length + Object.keys(d.system.activities).length;
      if (auto !== (CAPACITES_EN_PARTIE[cleDe(d)] ? "partielle" : "complete")) err(`automatisation « ${auto} » non justifiée`);
      if (!mecanique && d.flags[MODULE].portePar !== "sous-classe") err("ni effet, ni activité, ni avancement de sous-classe");
    } catch (e) {
      err(`document illisible (${e.message})`);
    }
  }
  for (const c of capacites) {
    const n = accordees.get(c.__cle) ?? 0;
    if (n !== 1) erreurs.push(`${c.name} : accordée ${n} fois`);
  }
  return erreurs;
}

// ---------------------------------------------------------------- Contenu réel

test("sous-classes : tous les documents passent le vérificateur", () => {
  assert.deepEqual(verifier(TOUS), []);
});

test("treize sous-classes de onze classes différentes, au moins quatre capacités chacune", () => {
  assert.equal(SOUS_CLASSES.length, 13);
  assert.equal(new Set(SOUS_CLASSES.map(s => s.system.classIdentifier)).size, 11);
  for (const s of SOUS_CLASSES) {
    const n = CAPACITES_SOUS_CLASSES.filter(c => c.flags[MODULE].sousClasse === cleDe(s)).length;
    assert.ok(n >= 4, `${s.name} : ${n} capacités`);
  }
});

test("avancements variés : sorts du SRD et maison, maîtrises, échelles de dés, ressources de classe dépensées", () => {
  const avancements = SOUS_CLASSES.flatMap(s => Object.values(s.system.advancement));
  const sorts = avancements.filter(a => a.type === "ItemGrant" && a.configuration.spell).flatMap(a => a.configuration.items.map(i => i.uuid));
  assert.ok(sorts.filter(refDe).length >= 10, "au moins dix sorts maison accordés");
  assert.ok(sorts.filter(u => typeof u === "string").length >= 20, "au moins vingt sorts du SRD accordés");
  assert.ok(avancements.filter(a => a.type === "ScaleValue").length >= 5, "au moins cinq échelles de dés");
  assert.ok(avancements.some(a => a.type === "Trait"), "aucune maîtrise");
  assert.ok(avancements.some(a => a.configuration.spell?.method === "pact"), "aucun sort de pacte");
  assert.ok(avancements.some(a => a.configuration.spell?.uses?.max === "1"), "aucun sort gratuit par repos");
  const cibles = new Set(CAPACITES_SOUS_CLASSES.flatMap(c => Object.values(c.system.activities).flatMap(a => a.consumption.targets.map(t => t.target))));
  for (const t of Object.values(CIBLES_CONSO).flat()) assert.ok(cibles.has(t), `aucune activité ne dépense ${t}`);
  // Effets et activités : au moins une sauvegarde, des soins, des dégâts, des PV temporaires, un état appliqué.
  const acts = CAPACITES_SOUS_CLASSES.flatMap(c => Object.values(c.system.activities));
  for (const t of TYPES_ACTIVITE.filter(t => t !== "attack")) assert.ok(acts.some(a => a.type === t), `aucune activité « ${t} »`);
  assert.ok(acts.some(a => a.healing?.types.includes("temphp")), "aucun point de vie temporaire");
  assert.ok(CAPACITES_SOUS_CLASSES.some(c => c.effects.some(e => !e.transfer && e.statuses.length)), "aucun état appliqué");
});

test("CAPACITES_EN_PARTIE ne cite que des capacités existantes, avec une raison", () => {
  const cles = CAPACITES_SOUS_CLASSES.map(cleDe);
  for (const [cle, raison] of Object.entries(CAPACITES_EN_PARTIE)) {
    assert.ok(cles.includes(cle), `capacité inconnue : ${cle}`);
    assert.ok(raison.length >= 40, `${cle} : raison trop courte`);
  }
});

test("le constructeur refuse une classe, un niveau, un sort, une échelle, une formule ou une ressource incohérents", () => {
  const img = "icons/svg/d20.svg";
  const cap = (extra = {}) => ({ cle: "essai-cap", nom: "Essai", niveau: 3, img, texte: "Texte d'essai assez long pour passer.", effets: [{ nom: "e", changements: [["system.attributes.ac.bonus", "1"]] }], ...extra });
  const base = (extra = {}) => ({
    cle: "essai-sc", nom: "Essai", classe: "fighter", img, texte: "Texte d'essai.",
    capacites: [cap(), cap({ cle: "essai-7", niveau: 7 }), cap({ cle: "essai-10", niveau: 10 }), cap({ cle: "essai-15", niveau: 15 }), cap({ cle: "essai-18", niveau: 18 })], ...extra
  });
  assert.doesNotThrow(() => sousClasse(base()));
  assert.throws(() => sousClasse(base({ classe: "shaman" })), /absente du SRD/);
  assert.throws(() => sousClasse(base({ capacites: base().capacites.slice(0, 4) })), /aucune capacité au niveau 18/);
  assert.throws(() => sousClasse(base({ capacites: [...base().capacites, cap({ cle: "essai-5", niveau: 5 })] })), /hors des niveaux de sous-classe/);
  assert.throws(() => sousClasse(base({ sorts: [{ niveau: 3, liste: ["vagueTonnante"] }] })), /ne lance pas de sorts/);
  assert.throws(() => sousClasse(base({ classe: "paladin", titreSorts: "x", capacites: [3, 7, 15, 20].map(n => cap({ cle: `essai-${n}`, niveau: n })), sorts: [{ niveau: 3, liste: ["invocationElementaire"] }] })), /trop haut/);
  assert.throws(() => sousClasse(base({ classe: "paladin", capacites: [3, 7, 15, 20].map(n => cap({ cle: `essai-${n}`, niveau: n })), sorts: [{ niveau: 3, liste: ["sorts:inexistant"] }] })), /absent de sorts.mjs/);
  assert.throws(() => sousClasse(base({ echelles: [{ id: "des", nom: "x", des: { 3: [1, 6] } }] })), /lue par aucune capacité/);
  const avec = activite => base({ capacites: [cap({ activites: [activite] }), ...base().capacites.slice(1)] });
  assert.throws(() => sousClasse(avec({ type: "damage", activation: "", condition: "x", degats: [{ des: "@scale.essai-sc.inconnue", types: ["fire"] }] })), /ne désigne aucune échelle/);
  assert.throws(() => sousClasse(avec({ type: "heal", soin: { des: "@classes.wizard.levels" } })), /n'est pas la classe/);
  assert.throws(() => sousClasse(avec({ type: "heal", soin: { des: "@prof", bonus: "2" } })), /formule libre/);
  assert.throws(() => sousClasse(avec({ type: "utility", depense: "feat:channel-divinity-cleric" })), /n'est pas une ressource/);
});

// ---------------------------------------------------------------- Batterie par mutation
// Chaque mutation casse une règle sur une copie du contenu ; le vérificateur doit le signaler.

const avancementDe = (d, filtre) => Object.values(d.system.advancement).find(filtre);
const grantCapacites = (d, niveau) => avancementDe(d, a => a.type === "ItemGrant" && !a.configuration.spell && a.level === niveau);
const grantSorts = (d, niveau) => avancementDe(d, a => a.type === "ItemGrant" && a.configuration.spell && a.level === niveau);
const echelle = d => avancementDe(d, a => a.type === "ScaleValue");
const activite = (d, i = 0) => Object.values(d.system.activities)[i];
const MUTATIONS = [
  ["classIdentifier inconnu", L => { parCle(L, "domaine-des-elements").system.classIdentifier = "shaman"; }],
  ["sous-classe rattachée à une classe aux autres niveaux", L => { parCle(L, "gladiateur-d-orgrimmar").system.classIdentifier = "barbarian"; }],
  ["capacités accordées hors niveau de sous-classe", L => { grantCapacites(parCle(L, "cercle-du-reve-d-emeraude"), 6).level = 5; }],
  ["prérequis de capacité incohérent", L => { parCle(L, "gladiateur-coup-de-grace").system.prerequisites.level = 7; }],
  ["capacité jamais accordée", L => { grantCapacites(parCle(L, "espion-du-si-7"), 3).configuration.items.pop(); }],
  ["capacité accordée deux fois", L => { const g = grantCapacites(parCle(L, "pacte-de-la-gangrene"), 3); g.configuration.items.push(structuredClone(g.configuration.items[1])); }],
  ["ItemGrant vers un document non fabriqué", L => { grantCapacites(parCle(L, "tradition-du-kirin-tor"), 10).configuration.items[0].uuid = { __ref: "classes:inexistante", __uuid: true }; }],
  ["sort maison absent", L => { grantSorts(parCle(L, "domaine-des-elements"), 3).configuration.items[0].uuid = { __ref: "sorts:inexistant", __uuid: true }; }],
  ["sort du SRD inconnu", L => { grantSorts(parCle(L, "serment-de-la-main-d-argent"), 13).configuration.items[0].uuid = "Compendium.dnd5e.spells24.Item.phbsplWish000000"; }],
  ["sort trop haut pour le niveau", L => { grantSorts(parCle(L, "cercle-du-reve-d-emeraude"), 3).configuration.items.push({ uuid: "Compendium.dnd5e.spells24.Item.phbsplDream00000", optional: false }); }],
  ["méthode d'incantation de l'occultiste", L => { grantSorts(parCle(L, "pacte-de-la-gangrene"), 5).configuration.spell.method = "spell"; }],
  ["palier de sorts hors classe", L => { grantSorts(parCle(L, "chasseur-de-demons-illidari"), 5).level = 4; }],
  ["avancement au format périmé (title)", L => { const a = grantCapacites(parCle(L, "serment-de-la-main-d-argent"), 7); a.title = a.name; delete a.name; }],
  ["avancement mal indexé", L => { const d = parCle(L, "espion-du-si-7"); const [id, a] = Object.entries(d.system.advancement)[0]; delete d.system.advancement[id]; d.system.advancement.AAAAAAAAAAAAAAAA = a; }],
  ["échelle aux faces impossibles", L => { Object.values(echelle(parCle(L, "gladiateur-d-orgrimmar")).configuration.scale)[0].faces = 7; }],
  ["échelle lue avant d'exister", L => { const s = echelle(parCle(L, "tradition-du-kirin-tor")).configuration.scale; s["5"] = s["3"]; delete s["3"]; }],
  ["@scale vers une échelle absente", L => { activite(parCle(L, "illidari-lames-gangrenees")).damage.parts[0].custom.formula = "@scale.chasseur-de-demons-illidari.inconnue"; }],
  ["@classes d'une autre classe", L => { activite(parCle(L, "reve-pas-dans-le-reve")).healing.custom.formula = "@classes.wizard.levels"; }],
  ["ressource d'une autre classe dépensée", L => { activite(parCle(L, "elements-colere")).consumption.targets[0].target = "feat:channel-divinity-paladin"; }],
  ["formule libre avec bonus ignoré", L => { activite(parCle(L, "reve-rosee")).healing.bonus = "@abilities.wis.mod"; }],
  ["maîtrise inconnue", L => { avancementDe(parCle(L, "espion-du-si-7"), a => a.type === "Trait").configuration.grants.push("tool:crochets"); }],
  ["maîtrises sans capacité correspondante", L => { avancementDe(parCle(L, "domaine-des-elements"), a => a.type === "Trait").level = 6; }],
  ["exigence de capacité erronée", L => { parCle(L, "main-d-argent-aura-de-purete").system.requirements = "Serment de dévotion"; }],
  ["type de capacité incorrect", L => { parCle(L, "kirin-tor-erudit").system.type.value = "feat"; }],
  ["avancement laissé sur une capacité", L => { const d = parCle(L, "si-7-formation"); d.system.advancement.AAAAAAAAAAAAAAAA = { _id: "AAAAAAAAAAAAAAAA", type: "Trait", configuration: { grants: [], choices: [] }, value: {}, level: 0, name: "x", hint: "", flags: {} }; }],
  ["clé system inconnue sur une sous-classe", L => { parCle(L, "tradition-du-kirin-tor").system.spellList = []; }],
  ["progression de sorts modifiée", L => { parCle(L, "serment-de-la-main-d-argent").system.spellcasting.progression = "full"; }],
  ["clé d'effet hors du modèle", L => { parCle(L, "reve-gardien").effects[0].system.changes[0].key = "system.attributes.movement.walk"; }],
  ["résistance inconnue", L => { parCle(L, "gangrene-peau").effects[0].system.changes[0].value = "fel"; }],
  ["état appliqué inconnu", L => { parCle(L, "si-7-dossier-complet").effects[0].statuses = ["dazed"]; }],
  ["effet appliqué sans durée", L => { parCle(L, "elements-avatar").effects[0].duration.value = null; }],
  ["sauvegarde de caractéristique inconnue", L => { activite(parCle(L, "gangrene-pluie")).save.ability = ["agi"]; }],
  ["type de dégâts inconnu", L => { activite(parCle(L, "main-d-argent-chatiment-du-fleau")).damage.parts[0].types = ["holy"]; }],
  ["usages qu'aucune activité ne consomme", L => { for (const a of Object.values(parCle(L, "kirin-tor-egide").system.activities)) a.consumption.targets = []; }],
  ["automatisation partielle non justifiée", L => { parCle(L, "gladiateur-legende").flags[MODULE].automatisation = "partielle"; }],
  ["identifiant en double", L => { parCle(L, "reve-sorts")._id = parCle(L, "reve-rosee")._id; }],
  ["_key incorrecte", L => { parCle(L, "illidari-metamorphose")._key = "!items!xxxxxxxxxxxxxxxx"; }],
  ["reste anglais", L => { parCle(L, "gladiateur-salut-a-la-foule").system.description.value += "<p>You gain advantage on the roll.</p>"; }],
  ["description vide", L => { parCle(L, "pacte-de-la-gangrene").system.description.value = ""; }]
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
