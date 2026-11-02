// Essais des paquets d'aventure de lakour-warcraft (compendium « aventures », documents Adventure de Foundry v14) :
// - chaque Adventure contient exactement les documents de son aventure : ses PNJ, journaux et cartes (pas les lieux
//   génériques « lieu-… »), plus les acteurs, objets et tables que ses journaux citent ; rien d'autre ;
// - chaque copie garde les identifiants des autres compendiums, à toute profondeur (pages, épingles, zones, objets d'acteur) ;
// - chaque épingle d'une scène embarquée vise un journal embarqué et une de ses pages ;
// - chaque @UUID d'un journal embarqué vise un document embarqué (lien « Type.id » vers la copie importée dans le monde)
//   ou un document du module qui n'est pas embarqué (lien « Compendium.lakour-warcraft… ») ;
// - champs conformes au schéma Adventure de Foundry 14.369 (common/documents/adventure.mjs) : ni champ inconnu, ni « _key »
//   embarquée, dossiers existants et du bon type, image présente ; journaux et scènes marqués à la version de l'installateur ;
// - module.json : compendium Adventure lié à dnd5e (sinon Foundry retire acteurs et objets à l'import), rangé dans le
//   dossier du module, quickstart v14 { adventures: { dnd5e: { uuid } } } vers une aventure du compendium.
// Validation stricte facultative par les schémas de Foundry : FOUNDRY_V14=<dossier contenant common/> npm run essais.
// Batterie par mutation : des copies faussées des aventures et du manifeste sont repérées. Aucun réseau.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { fabriquer, TYPE_PACK } from "../outils/fabriquer-warcraft.mjs";
import { paquetsAventures, VERSION_CONTENU } from "../modules/lakour-warcraft/contenu/aventures-paquets.mjs";
import { AVENTURE_DOCUMENTS } from "../modules/lakour-warcraft/contenu/aventure.mjs";
import { CAMPAGNE_DOCUMENTS } from "../modules/lakour-warcraft/contenu/campagne.mjs";
import { ONE_SHOT_DOCUMENTS } from "../modules/lakour-warcraft/contenu/one-shot.mjs";
import { CARTES_LIEUX } from "../modules/lakour-warcraft/contenu/lieux-cartes.mjs";
import { DONJON_DOCUMENTS } from "../modules/lakour-warcraft/contenu/donjon.mjs";
import { CONSOMMABLES } from "../modules/lakour-warcraft/contenu/consommables.mjs";
import { REPUTATION_DOCUMENTS } from "../modules/lakour-warcraft/contenu/reputations.mjs";
import { MONTURES_DOCUMENTS } from "../modules/lakour-warcraft/contenu/montures.mjs";
import { RARES_DOCUMENTS } from "../modules/lakour-warcraft/contenu/rares.mjs";
import { CONTRATS_DOCUMENTS } from "../modules/lakour-warcraft/contenu/contrats.mjs";

const M = "lakour-warcraft";
const RACINE = new URL(`../modules/${M}/`, import.meta.url);
const fabriques = fabriquer();
const aventures = paquetsAventures(fabriques);
const manifeste = JSON.parse(readFileSync(new URL("module.json", RACINE), "utf8"));

// Champs du schéma Adventure (Foundry 14.369) et documents embarqués qu'on y met.
const CHAMPS_ADVENTURE = ["_id", "name", "img", "caption", "description", "actors", "combats", "items", "journal", "scenes",
  "tables", "macros", "cards", "playlists", "folders", "folder", "sort", "flags", "_stats"];
const TYPE_CHAMP = { actors: "Actor", items: "Item", journal: "JournalEntry", scenes: "Scene", tables: "RollTable" };
const ID = /^[A-Za-z0-9]{16}$/;

// Index des documents des autres compendiums : uuid de compendium -> { pack, cle, doc }.
const uuidDe = d => `Compendium.${M}.${d.pack}.${TYPE_PACK[d.pack]}.${d.doc._id}`;
const PAR_UUID = new Map(fabriques.map(d => [uuidDe(d), d]));
const PAR_CLE = new Map(fabriques.map(d => [d.cle, d]));

// Contenu attendu, recalculé ici : documents propres (sans les lieux) + acteurs, objets et tables cités par les journaux propres.
const LIEUX = new Set(CARTES_LIEUX.map(c => c.__cle));
function attendu(definitions) {
  const cles = new Set(definitions.map(d => d.__cle).filter(c => !LIEUX.has(c)));
  for (const cle of [...cles].filter(c => c.startsWith("journaux:"))) {
    for (const [, uuid] of JSON.stringify(PAR_CLE.get(cle).doc).matchAll(/@UUID\[([^\]]+)\]/g)) {
      const cible = PAR_UUID.get(uuid.split(".").slice(0, 5).join("."));
      if (cible && ["Actor", "Item", "RollTable"].includes(TYPE_PACK[cible.pack])) cles.add(cible.cle);
    }
  }
  return cles;
}
const ATTENDU = { "aventures:puits-de-cendre": attendu(AVENTURE_DOCUMENTS), "aventures:braises-de-la-legion": attendu(CAMPAGNE_DOCUMENTS),
  "aventures:nuit-aux-deux-lanternes": attendu(ONE_SHOT_DOCUMENTS), "aventures:raffinerie-de-meche-noire": attendu(DONJON_DOCUMENTS),
  "aventures:tarides-vivantes": attendu([...CONSOMMABLES, ...REPUTATION_DOCUMENTS, ...MONTURES_DOCUMENTS, ...RARES_DOCUMENTS, ...CONTRATS_DOCUMENTS]) };

// Tous les « _id » d'un document, à toute profondeur (pages, épingles, zones, comportements, objets d'acteur…).
function identifiants(v, acc = new Set()) {
  if (Array.isArray(v)) v.forEach(x => identifiants(x, acc));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { if (k === "_id") acc.add(x); else identifiants(x, acc); }
  return acc;
}
const contientCle = v => (Array.isArray(v) ? v.some(contientCle) : v && typeof v === "object" ? Object.entries(v).some(([k, x]) => k === "_key" || contientCle(x)) : false);

// ---------------------------------------------------------------- Vérificateur (aussi pour les mutations)

function verifier({ aventures, manifeste }) {
  const erreurs = [];
  if (aventures.length !== 5) erreurs.push(`${aventures.length} aventures au lieu de 5`);

  for (const { pack, cle, doc: a } of aventures) {
    const ou = `« ${a.name} »`;
    if (pack !== "aventures") erreurs.push(`${ou} : compendium « ${pack} »`);
    if (!ID.test(a._id ?? "") || a._key !== `!adventures!${a._id}`) erreurs.push(`${ou} : identifiant ou clé LevelDB invalide`);
    for (const k of Object.keys(a)) if (k !== "_key" && !CHAMPS_ADVENTURE.includes(k)) erreurs.push(`${ou} : champ inconnu du schéma « ${k} »`);
    for (const k of ["actors", "combats", "items", "journal", "scenes", "tables", "macros", "cards", "playlists", "folders"]) {
      if (!Array.isArray(a[k])) erreurs.push(`${ou} : « ${k} » n'est pas une liste`);
    }
    if (!String(a.name ?? "").trim() || !String(a.caption ?? "").trim() || !String(a.description ?? "").trim()) erreurs.push(`${ou} : nom, légende ou description vide`);
    if (!a.img?.startsWith(`modules/${M}/`) || !existsSync(new URL(a.img.slice(`modules/${M}/`.length), RACINE))) erreurs.push(`${ou} : image absente (${a.img})`);
    if (contientCle(Object.fromEntries(Object.entries(a).filter(([k]) => k !== "_key")))) erreurs.push(`${ou} : « _key » restée dans un document embarqué`);

    // Contenu exact.
    const embarques = Object.entries(TYPE_CHAMP).flatMap(([champ, type]) => (a[champ] ?? []).map(doc => ({ champ, type, doc })));
    const trouves = new Set();
    for (const { champ, type, doc } of embarques) {
      const source = fabriques.find(d => d.doc._id === doc._id && TYPE_PACK[d.pack] === type);
      if (!source) { erreurs.push(`${ou} : ${champ} « ${doc.name} » (${doc._id}) absent des autres compendiums`); continue; }
      trouves.add(source.cle);
      if (source.doc.name !== doc.name) erreurs.push(`${ou} : « ${doc.name} » ne porte pas le nom de son original « ${source.doc.name} »`);
      const ids = identifiants(doc), idsSource = identifiants(source.doc);
      for (const id of idsSource) if (!ids.has(id)) erreurs.push(`${ou} : « ${doc.name} » a perdu l'identifiant ${id}`);
      for (const id of ids) if (!idsSource.has(id)) erreurs.push(`${ou} : « ${doc.name} » a un identifiant étranger ${id}`);
    }
    if (trouves.size !== embarques.length) erreurs.push(`${ou} : document embarqué en double`);
    const voulu = ATTENDU[cle] ?? new Set();
    for (const c of voulu) if (!trouves.has(c)) erreurs.push(`${ou} : il manque ${c}`);
    for (const c of trouves) if (!voulu.has(c)) erreurs.push(`${ou} : ${c} n'appartient pas à l'aventure`);

    // Dossiers : chaque document est rangé dans un dossier embarqué du bon type.
    const dossiers = new Map((a.folders ?? []).map(f => [f._id, f]));
    for (const f of a.folders ?? []) if (!ID.test(f._id ?? "") || !f.name || !Object.values(TYPE_CHAMP).includes(f.type)) erreurs.push(`${ou} : dossier invalide ${JSON.stringify(f).slice(0, 80)}`);
    for (const { type, doc } of embarques) {
      if (dossiers.get(doc.folder)?.type !== type) erreurs.push(`${ou} : « ${doc.name} » hors d'un dossier ${type} de l'aventure`);
    }
    // Journaux et scènes à la version de l'installateur (il ne remplace pas leurs pages et épingles).
    for (const doc of [...(a.journal ?? []), ...(a.scenes ?? [])]) {
      if (doc.flags?.[M]?.version !== VERSION_CONTENU) erreurs.push(`${ou} : « ${doc.name} » sans la version ${VERSION_CONTENU}`);
    }

    // Épingles : vers un journal embarqué et une de ses pages.
    const journaux = new Map((a.journal ?? []).map(j => [j._id, j]));
    for (const s of a.scenes ?? []) {
      for (const n of s.notes ?? []) {
        const j = journaux.get(n.entryId);
        if (!j) erreurs.push(`${ou}, « ${s.name} » : épingle « ${n.text} » vers un journal non embarqué (${n.entryId})`);
        else if (!j.pages.some(p => p._id === n.pageId)) erreurs.push(`${ou}, « ${s.name} » : épingle « ${n.text} » vers une page absente de « ${j.name} »`);
      }
    }

    // Liens des journaux embarqués.
    const parId = new Map(embarques.map(e => [`${e.type}.${e.doc._id}`, e.doc]));
    for (const j of a.journal ?? []) {
      for (const [, uuid] of JSON.stringify(j).matchAll(/@UUID\[([^\]]+)\]/g)) {
        const o = `${ou}, « ${j.name} » : lien ${uuid}`;
        const morceaux = uuid.split(".");
        if (morceaux[0] === "Compendium") {
          const cible = PAR_UUID.get(morceaux.slice(0, 5).join("."));
          if (morceaux[1] !== M || !cible) { erreurs.push(`${o} vers un document inexistant`); continue; }
          if (parId.has(`${morceaux[3]}.${morceaux[4]}`)) erreurs.push(`${o} vers le compendium alors que le document est embarqué`);
          if (morceaux[5] === "JournalEntryPage" && !cible.doc.pages.some(p => p._id === morceaux[6])) erreurs.push(`${o} vers une page inexistante`);
        } else {
          const cible = parId.get(morceaux.slice(0, 2).join("."));
          if (!cible) { erreurs.push(`${o} vers un document ni embarqué ni du module`); continue; }
          if (morceaux[2] === "JournalEntryPage" && !cible.pages.some(p => p._id === morceaux[3])) erreurs.push(`${o} vers une page inexistante`);
        }
      }
    }
  }

  // Manifeste.
  const p = (manifeste.packs ?? []).find(x => x.name === "aventures");
  if (!p) erreurs.push("module.json : compendium « aventures » non déclaré");
  else {
    if (p.type !== "Adventure") erreurs.push(`module.json : compendium « aventures » de type ${p.type}`);
    if (p.system !== "dnd5e") erreurs.push("module.json : compendium « aventures » sans system dnd5e (acteurs et objets retirés à l'import)");
    if (p.path !== "packs/aventures") erreurs.push(`module.json : chemin ${p.path}`);
  }
  if (!(manifeste.packFolders ?? []).some(f => f.packs?.includes("aventures"))) erreurs.push("module.json : « aventures » hors des dossiers de compendiums");
  const qs = manifeste.quickstart?.adventures;
  if (!qs || typeof qs !== "object") erreurs.push("module.json : quickstart.adventures absent");
  else for (const [systeme, v] of Object.entries(qs)) {
    if (systeme !== "dnd5e") erreurs.push(`module.json : quickstart pour un autre système (${systeme})`);
    const uuid = v?.uuid;
    if (typeof uuid !== "string") { erreurs.push("module.json : quickstart sans { uuid } (forme du schéma 14.369)"); continue; }
    const [c, mod, pk, type, id] = uuid.split(".");
    if (c !== "Compendium" || mod !== M || pk !== "aventures" || type !== "Adventure" || !aventures.some(x => x.doc._id === id)) erreurs.push(`module.json : quickstart vers ${uuid}, aventure inconnue`);
  }
  return erreurs;
}

// ---------------------------------------------------------------- Essais

test("aventures : les cinq paquets et le manifeste passent le vérificateur", () => {
  assert.deepEqual(verifier({ aventures, manifeste }), []);
});

test("aventures : contenu attendu de chaque paquet", () => {
  const [puits, braises, nuit, donjon, tarides] = aventures.map(a => a.doc);
  assert.equal(donjon.name, "La Raffinerie de Mèche-Noire");
  assert.equal(tarides.name, "Les Tarides vivantes");
  assert.deepEqual([donjon.scenes.length, donjon.journal.length, donjon.tables.length], [0, 2, 3], "donjon : journal de rencontre, journal du MJ, trois tables de butin");
  assert.ok(donjon.actors.length >= 3 && donjon.items.length >= 11, "donjon : boss, renforts et butin");
  assert.ok(tarides.tables.length >= 6 && tarides.actors.length >= 14 && tarides.journal.length >= 4, "Tarides vivantes : tables, montures et rares, journaux");
  assert.equal(puits.name, "Les Puits de cendre");
  assert.equal(braises.name, "Les Braises de la Légion");
  assert.equal(nuit.name, "Une nuit aux Deux Lanternes");
  assert.deepEqual([nuit.scenes.length, nuit.journal.length], [3, 3], "one-shot : 3 cartes, journal du MJ et deux aides de jeu");
  assert.ok(nuit.tables.some(t => t.flags[M].cle === "bruits-de-la-nuit"), "one-shot : sa table propre");
  assert.deepEqual([puits.scenes.length, puits.journal.length], [4, 2], "4 cartes, journal du MJ et aide de jeu");
  assert.deepEqual([braises.scenes.length, braises.journal.length], [4, 3], "4 cartes, journal du MJ et deux aides de jeu");
  for (const a of [puits, braises, nuit]) {
    assert.ok(a.actors.length >= 10, `${a.name} : PNJ et créatures`);
    assert.ok(a.tables.length >= 1, `${a.name} : tables citées`);
    assert.ok(!a.scenes.some(s => s.flags[M].cle.startsWith("lieu-")), `${a.name} : pas de lieu générique`);
    assert.ok(a.journal.some(j => j.ownership.default === 0) && a.journal.some(j => j.ownership.default > 0), `${a.name} : journal du MJ caché, aides visibles`);
  }
  assert.equal(manifeste.quickstart.adventures.dnd5e.uuid, `Compendium.${M}.aventures.Adventure.${puits._id}`, "le démarrage rapide propose l'aventure de départ");
});

test("aventures : validation stricte par les schémas de Foundry 14 (FOUNDRY_V14)", { skip: !process.env.FOUNDRY_V14 && "FOUNDRY_V14 non défini" }, async () => {
  const foundry = await import(pathToFileURL(join(process.env.FOUNDRY_V14, "common", "server.mjs")).href);
  globalThis.foundry = foundry; globalThis.CONST = foundry.CONST;
  globalThis.CONFIG = { Token: { movement: { actions: Object.fromEntries(["walk", "fly", "swim", "burrow", "climb", "crawl", "jump", "blink", "displace"].map(k => [k, {}])) } } };
  const types = new Set(["base", "text", "npc"]);
  const parcourir = v => { if (Array.isArray(v)) v.forEach(parcourir); else if (v && typeof v === "object") { if (typeof v.type === "string") types.add(v.type); Object.values(v).forEach(parcourir); } };
  parcourir(aventures);
  const parType = Object.fromEntries([...types].map(t => [t, {}]));
  globalThis.game = { packs: { get: id => (id?.startsWith(`${M}.`) ? { documentName: "Item" } : undefined) }, release: { version: "14.369", generation: 14 },
    system: { id: "dnd5e", version: "1", grid: { type: 1, distance: 2, units: "m" }, documentTypes: new Proxy({}, { get: () => parType }) },
    model: new Proxy({}, { get: () => parType }), documentTypes: new Proxy({}, { get: () => [...types] }), data: {} };
  for (const { doc } of aventures) {
    const { _key, ...source } = structuredClone(doc);
    assert.doesNotThrow(() => new foundry.documents.BaseAdventure(source, { strict: true }), doc.name);
  }
  assert.doesNotThrow(() => new foundry.packages.BaseModule(structuredClone(manifeste), { strict: true }), "module.json");
});

// ---------------------------------------------------------------- Mutations

const puits = c => c.aventures[0].doc;
const braises = c => c.aventures[1].doc;
const premierLien = (j, motif) => j.pages.find(p => motif.test(p.text.content));
const MUTATIONS = {
  "un journal retiré"(c) { puits(c).journal.pop(); },
  "un lieu générique ajouté"(c) { puits(c).scenes.push(structuredClone(PAR_CLE.get(CARTES_LIEUX[0].__cle).doc)); },
  "un acteur de l'autre aventure ajouté"(c) { puits(c).actors.push(structuredClone(braises(c).actors[0])); },
  "un acteur cité retiré"(c) { puits(c).actors = puits(c).actors.filter(x => x.name !== "Murloc"); },
  "un identifiant d'acteur changé"(c) { puits(c).actors[0]._id = "AAAAAAAAAAAAAAAA"; },
  "un identifiant de page changé"(c) { braises(c).journal[0].pages[1]._id = "BBBBBBBBBBBBBBBB"; },
  "un objet d'acteur réidentifié"(c) { puits(c).actors.find(a => a.items.length).items[0]._id = "CCCCCCCCCCCCCCCC"; },
  "une épingle vers un journal non embarqué"(c) { puits(c).scenes[0].notes[0].entryId = PAR_CLE.get("journaux:guide-du-mj").doc._id; },
  "une épingle vers une page absente"(c) { braises(c).scenes[1].notes[0].pageId = "DDDDDDDDDDDDDDDD"; },
  "un lien resté vers le compendium pour un document embarqué"(c) {
    const j = puits(c).journal[0];
    const p = premierLien(j, /@UUID\[Actor\./);
    p.text.content = p.text.content.replace(/@UUID\[Actor\.([A-Za-z0-9]{16})\]/, `@UUID[Compendium.${M}.bestiaire.Actor.$1]`);
  },
  "un lien du monde vers un document non embarqué"(c) {
    const p = premierLien(puits(c).journal[0], /@UUID\[Actor\./);
    p.text.content = p.text.content.replace(/@UUID\[Actor\.[A-Za-z0-9]{16}\]/, `@UUID[Actor.${braises(c).actors[0]._id}]`);
  },
  "un lien vers un document inexistant du module"(c) {
    const p = premierLien(braises(c).journal[0], /@UUID\[Compendium\./);
    p.text.content = p.text.content.replace(/(@UUID\[Compendium\.[^\]]*\.)[A-Za-z0-9]{16}\]/, "$1EEEEEEEEEEEEEEEE]");
  },
  "une clé LevelDB restée dans une page"(c) { puits(c).journal[0].pages[0]._key = "!journal.pages!x.y"; },
  "un champ hors schéma"(c) { puits(c).chapitres = []; },
  "une scène hors des dossiers"(c) { braises(c).scenes[0].folder = null; },
  "un acteur rangé dans le dossier des scènes"(c) { puits(c).actors[0].folder = puits(c).folders.find(f => f.type === "Scene")._id; },
  "une scène sans la version de l'installateur"(c) { delete puits(c).scenes[2].flags[M].version; },
  "une image de couverture absente"(c) { braises(c).img = `modules/${M}/assets/cartes/inexistante.svg`; },
  "un compendium sans système"(c) { delete c.manifeste.packs.find(p => p.name === "aventures").system; },
  "un compendium non rangé"(c) { for (const f of c.manifeste.packFolders) f.packs = f.packs.filter(x => x !== "aventures"); },
  "un quickstart en chaîne"(c) { c.manifeste.quickstart.adventures.dnd5e = c.manifeste.quickstart.adventures.dnd5e.uuid; },
  "un quickstart vers une aventure inconnue"(c) { c.manifeste.quickstart.adventures.dnd5e.uuid = `Compendium.${M}.aventures.Adventure.FFFFFFFFFFFFFFFF`; }
};

test("mutation : chaque paquet ou manifeste faussé est repéré", () => {
  const passees = [];
  for (const [nom, muter] of Object.entries(MUTATIONS)) {
    const copie = structuredClone({ aventures, manifeste });
    muter(copie);
    if (!verifier(copie).length) passees.push(nom);
  }
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});
