// Module anglais lakour-warcraft-en (outils/fabriquer-warcraft.mjs --langue en, dictionnaires modules/lakour-warcraft/contenu/en/*.json,
// outil commun modules/lakour-mj-ia/outils/traduction.mjs) :
// - mêmes documents et mêmes _id (et _key) que le module français, pack par pack, aventures comprises ;
// - aucun uuid, chemin d'image ni portée de drapeaux vers « lakour-warcraft » sans « -en » ; chaque uuid récrit vise un document
//   du module anglais ; les uuid du système (Compendium.dnd5e.*) sont laissés tels quels ;
// - les dictionnaires sont à jour (aucune entrée obsolète) et chaque traduction garde les balises, liens et jets du français ;
// - l'identité des scripts (scripts/identite.js) : « lakour-warcraft » dans le dépôt, « lakour-warcraft-en » sous le dossier
//   du module anglais ; plus aucun script ne porte l'identifiant en dur ;
// - le manifeste anglais : identifiant, conflit avec le module français, étiquettes traduites, quickstart et listes de sorts récrits ;
// - les aventures emballées en anglais : titre des cartes traduites, mêmes copies, liens vers le monde ou le module anglais ;
// - sur le disque, si `npm run fabriquer-warcraft-en` a tourné : le contrat des modules de contenu est respecté, plans.json et
//   figurants.json traduits.
// Aucun réseau.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fabriquer, fabriquerAnglais, lireDictionnaires, manifesteAnglais, MODULE_EN, OPTIONS_TRADUCTION, TYPE_PACK } from "../outils/fabriquer-warcraft.mjs";
import { AVENTURES, paquetsAventures, TEXTES } from "../modules/lakour-warcraft/contenu/aventures-paquets.mjs";
import { ecartsBalises, extraire } from "../modules/lakour-mj-ia/outils/traduction.mjs";
import { verifierModuleDeContenu } from "../modules/lakour-mj-ia/outils/contrat-contenu.mjs";
import { ANGLAIS, ID, ID_FRANCAIS } from "../modules/lakour-warcraft/scripts/identite.js";

const M = "lakour-warcraft";
const RACINE = new URL("../", import.meta.url);
const francais = fabriquer();
const { dictionnaire, packs } = lireDictionnaires();
const { documents: anglais, rapport } = fabriquerAnglais(francais, dictionnaire);
const francaisComplet = [...francais, ...paquetsAventures(francais)];
const texteAnglais = JSON.stringify(anglais.map(d => d.doc));

// Tous les _id d'un document, à toute profondeur.
const ids = v => (Array.isArray(v) ? v.flatMap(ids) : v && typeof v === "object" ? [...(typeof v._id === "string" ? [v._id] : []), ...Object.values(v).flatMap(ids)] : []);

test("lakour-warcraft-en : mêmes documents, mêmes _id et _key que lakour-warcraft, pack par pack", () => {
  assert.equal(anglais.length, francaisComplet.length);
  const parCle = new Map(anglais.map(d => [d.cle, d]));
  for (const fr of francaisComplet) {
    const en = parCle.get(fr.cle);
    assert.ok(en, `document absent du module anglais : ${fr.cle}`);
    assert.equal(en.pack, fr.pack);
    assert.equal(en.doc._id, fr.doc._id, `${fr.cle} : _id différent`);
    assert.equal(en.doc._key, fr.doc._key, `${fr.cle} : _key différente`);
    assert.deepEqual(ids(en.doc).sort(), ids(fr.doc).sort(), `${fr.cle} : identifiants embarqués différents`);
  }
});

test("lakour-warcraft-en : aucun uuid, chemin ni drapeau vers le module français ; chaque uuid vise un document anglais ; dnd5e intact", () => {
  assert.ok(!texteAnglais.includes(`Compendium.${M}.`), "uuid vers lakour-warcraft");
  assert.ok(!texteAnglais.includes(`modules/${M}/`), "chemin vers modules/lakour-warcraft/");
  assert.ok(!texteAnglais.includes(`"${M}":`), "portée de drapeaux lakour-warcraft");
  const uuids = new Set(anglais.filter(d => TYPE_PACK[d.pack] !== "Adventure").map(d => `Compendium.${MODULE_EN}.${d.pack}.${TYPE_PACK[d.pack]}.${d.doc._id}`));
  const cites = texteAnglais.match(new RegExp(`Compendium\\.${MODULE_EN}\\.[a-z]+\\.[A-Za-z]+\\.[A-Za-z0-9]{16}`, "g"));
  assert.ok(cites.length > 100);
  for (const u of cites) assert.ok(uuids.has(u), `uuid inconnu : ${u}`);
  assert.ok(texteAnglais.includes(`modules/${MODULE_EN}/assets/`), "les images du module anglais sont les siennes");
  // Les uuid du système (sorts et objets de dnd5e cités par les avancements et les descriptions) ne sont jamais récrits.
  const dnd5eFr = JSON.stringify(francaisComplet.map(d => d.doc)).match(/Compendium\.dnd5e\.[^"\]{} ]+/g) ?? [];
  const dnd5eEn = texteAnglais.match(/Compendium\.dnd5e\.[^"\]{} ]+/g) ?? [];
  assert.ok(dnd5eFr.length > 0);
  assert.deepEqual(dnd5eEn.sort(), dnd5eFr.sort());
});

test("dictionnaires contenu/en : un par pack (sauf aventures), à jour, sans écart de balises ni de liens", () => {
  const attendus = Object.keys(TYPE_PACK).filter(p => !OPTIONS_TRADUCTION.ignorerPacks.includes(p)).sort();
  assert.deepEqual(packs.sort(), attendus);
  assert.deepEqual(rapport.obsoletes, [], "le français a changé : relancer node outils/fabriquer-warcraft.mjs --extraire");
  assert.deepEqual(rapport.erreurs, []);
  // Chaque entrée du dictionnaire correspond encore à un chemin du document (sinon l'extraction l'aurait retirée).
  const { tout } = extraire(francais, OPTIONS_TRADUCTION);
  for (const [cle, entree] of Object.entries(dictionnaire)) {
    const pack = cle.split("/")[0];
    for (const [chemin, t] of Object.entries(entree)) {
      if (chemin.startsWith("_")) continue;
      assert.equal(tout[pack]?.[cle]?.[chemin]?.fr, t.fr, `${cle}:${chemin} : entrée sans source (relancer --extraire)`);
      if (t.en) assert.deepEqual(ecartsBalises(t.fr, t.en), [], `${cle}:${chemin}`);
    }
  }
  // Les formules et la licence ne sont jamais proposées à la traduction.
  for (const entree of Object.values(tout).flatMap(p => Object.values(p))) {
    for (const chemin of Object.keys(entree)) assert.ok(!/\.(max|count|license)$/.test(chemin), `${chemin} extrait`);
  }
  // Les packs courts sont entièrement traduits.
  for (const pack of ["peuples", "historiques", "dons", "sorts", "objets", "afflictions", "classes", "bestiaire", "scenes"]) {
    assert.equal(rapport.parPack[pack].manquants, 0, `${pack} : textes encore en français`);
  }
});

test("lakour-warcraft-en : noms des références réalignés (résultats de table, recettes de l'établi), drapeaux textuels traduits", () => {
  const parId = new Map(anglais.filter(d => d.pack !== "aventures").map(d => [d.doc._id, d.doc]));
  // Un résultat de table de type document porte le nom anglais du document visé.
  let documentsCites = 0;
  for (const t of anglais.filter(d => d.pack === "tables")) {
    for (const r of t.doc.results.filter(r => r.type === "document")) {
      const id = /([A-Za-z0-9]{16})$/.exec(r.documentUuid)?.[1];
      if (!parId.has(id)) continue;
      assert.equal(r.name, parId.get(id).name, `${t.doc.name} : ${r.name}`);
      documentsCites++;
    }
  }
  assert.ok(documentsCites > 10);
  // Les recettes de l'établi (flags.<module>.recettes des journaux) : produit au nom anglais, composants et métiers traduits.
  const recettes = anglais.filter(d => d.pack === "journaux").flatMap(d => d.doc.flags[MODULE_EN]?.recettes ?? []);
  assert.ok(recettes.length > 10);
  for (const r of recettes) {
    const id = /([A-Za-z0-9]{16})$/.exec(r.produit.uuid)?.[1];
    assert.equal(r.produit.nom, parId.get(id)?.name, `recette ${r.id}`);
    assert.match(r.produit.uuid, new RegExp(`^Compendium\\.${MODULE_EN}\\.`));
    for (const c of r.composants) assert.ok(c.nom && !/[éèàç]/.test(c.nom), `recette ${r.id} : composant ${c.nom}`);
  }
  assert.ok(rapport.nomsRealignes > 10);
  // La phase 2 d'un boss (drapeau boss.phase2) vise toujours une capacité de la fiche, par son nom traduit.
  const boss = anglais.filter(d => d.pack === "bestiaire" && d.doc.flags[MODULE_EN]?.boss?.phase2);
  assert.ok(boss.length >= 3);
  for (const b of boss) assert.ok(b.doc.items.some(i => i.name === b.doc.flags[MODULE_EN].boss.phase2), `${b.doc.name} : phase 2 introuvable`);
  // Les contrats (drapeaux des résultats de table lus par le moteur) gardent leurs clés.
  const contrats = anglais.filter(d => d.pack === "tables").flatMap(d => d.doc.results.map(r => r.flags?.[MODULE_EN]?.contrat).filter(Boolean));
  assert.ok(contrats.length > 20);
  for (const c of contrats) assert.match(c.faction, /^[a-z0-9-]+$/);
});

test("scripts : l'identifiant du module vient de scripts/identite.js, plus jamais en dur", () => {
  assert.equal(ID, ID_FRANCAIS);
  assert.equal(ANGLAIS, false);
  const dossier = new URL(`modules/${M}/scripts/`, RACINE);
  for (const f of readdirSync(dossier).filter(f => f.endsWith(".js") && f !== "identite.js")) {
    const texte = readFileSync(new URL(f, dossier), "utf8").split("\n").filter(l => !l.trim().startsWith("//")).join("\n");
    assert.ok(!/["'`]lakour-warcraft["'`.]/.test(texte), `${f} porte « lakour-warcraft » en dur`);
    assert.ok(!texte.includes("Compendium.lakour-warcraft."), `${f} porte un uuid en dur`);
    assert.match(texte, /\bID\b/, `${f} n'utilise pas ID`);
  }
});

test("lakour-warcraft-en : aventures emballées en anglais, mêmes copies, liens vers le monde ou le module anglais", () => {
  const aventures = anglais.filter(d => d.pack === "aventures");
  assert.equal(aventures.length, AVENTURES.length);
  const puits = aventures.find(a => a.cle === "aventures:puits-de-cendre").doc;
  assert.equal(puits.name, "The Ash Wells");
  assert.ok(puits.description.includes(TEXTES.en.import));
  assert.ok(puits.folders.every(f => f.name === "The Ash Wells" && f.flags[MODULE_EN].dossier === "The Ash Wells"));
  assert.ok(puits.scenes.every(s => s.flags[MODULE_EN].aventure === "The Ash Wells"), "le dossier et les cartes portent le même titre (installateur)");
  assert.match(puits.img, new RegExp(`^modules/${MODULE_EN}/`));
  const puitsFr = francaisComplet.find(a => a.cle === "aventures:puits-de-cendre").doc;
  for (const champ of ["actors", "items", "journal", "scenes", "tables"]) {
    assert.deepEqual(puits[champ].map(d => d._id), puitsFr[champ].map(d => d._id), champ);
  }
  const liens = JSON.stringify(puits.journal).match(/@UUID\[([^\]]+)\]/g) ?? [];
  assert.ok(liens.length > 0);
  for (const l of liens) assert.match(l, new RegExp(`^@UUID\\[(Actor|Item|JournalEntry|Scene|RollTable)\\.|^@UUID\\[Compendium\\.(${MODULE_EN}|dnd5e)\\.`));
  // Chaque aventure a son titre anglais (celui des cartes quand elle en a, sinon « en.nom »), et aucun titre français.
  for (const a of AVENTURES) {
    const doc = aventures.find(x => x.cle === `aventures:${a.cle}`).doc;
    assert.equal(doc.name, doc.scenes[0]?.flags[MODULE_EN].aventure ?? a.en.nom, a.cle);
    assert.notEqual(doc.name, a.nom, `${a.cle} : titre encore en français`);
  }
});

test("manifeste anglais : identifiant, conflit avec le module français, étiquettes, quickstart et listes de sorts", () => {
  const manifeste = JSON.parse(readFileSync(new URL(`modules/${M}/module.json`, RACINE), "utf8"));
  const traductions = JSON.parse(readFileSync(new URL(`modules/${M}/contenu/en/module.json`, RACINE), "utf8"));
  const en = manifesteAnglais(manifeste, traductions);
  assert.equal(en.id, MODULE_EN);
  assert.equal(en.version, manifeste.version);
  assert.equal(en.title, "La Kour Warcraft — Azeroth for 5th edition");
  assert.ok(en.relationships.conflicts.some(c => c.id === M && c.type === "module"));
  assert.deepEqual(en.relationships.systems, manifeste.relationships.systems);
  assert.equal(en.packs.length, manifeste.packs.length);
  for (const p of en.packs) assert.equal(p.label, traductions.packs[p.name], p.name);
  assert.ok(en.packFolders[0].name !== manifeste.packFolders[0].name);
  assert.deepEqual(en.packFolders[0].packs, manifeste.packFolders[0].packs);
  assert.match(en.quickstart.adventures.dnd5e.uuid, new RegExp(`^Compendium\\.${MODULE_EN}\\.aventures\\.Adventure\\.`));
  assert.equal(en.flags.dnd5e.spellLists.length, manifeste.flags.dnd5e.spellLists.length);
  for (const l of en.flags.dnd5e.spellLists) assert.match(l, new RegExp(`^Compendium\\.${MODULE_EN}\\.journaux\\.`));
  for (const m of en.media) if (m.caption) assert.ok(!/[éèàç]/.test(m.caption), m.caption);
  assert.match(en.manifest, /lakour-warcraft-en\.json$/);
  assert.match(en.download, /lakour-warcraft-en\.zip$/);
  assert.ok(!JSON.stringify(en).includes(`Compendium.${M}.`));
});

test("lakour-warcraft-en sur le disque (si fabriqué) : contrat des modules de contenu, plans et figurants traduits, identité", { skip: !existsSync(new URL(`modules/${MODULE_EN}/src`, RACINE)) && "npm run fabriquer-warcraft-en n'a pas tourné" }, async () => {
  assert.deepEqual(verifierModuleDeContenu(`modules/${MODULE_EN}`, { minFigurants: 10, minJoueurs: 8 }), []);
  const plans = JSON.parse(readFileSync(new URL(`modules/${MODULE_EN}/assets/cartes/plans.json`, RACINE), "utf8"));
  assert.ok(Object.values(plans).some(p => p.pieces.some(piece => piece.nom === "Crooked Key Tavern")), "plans.json du module anglais : noms traduits");
  const figurants = JSON.parse(readFileSync(new URL(`modules/${MODULE_EN}/assets/jetons/figurants.json`, RACINE), "utf8"));
  assert.equal(figurants.paysan.libelle, "Peasant");
  assert.ok(Object.values(figurants).every(f => f.jeton));
  const index = JSON.parse(readFileSync(new URL(`modules/${MODULE_EN}/assets/jetons/index.json`, RACINE), "utf8"));
  assert.ok(Object.values(index).every(c => c.startsWith(`modules/${MODULE_EN}/`)));
  // Chargé depuis le dossier du module anglais, identite.js rend « lakour-warcraft-en ».
  const identite = await import(new URL(`modules/${MODULE_EN}/scripts/identite.js`, RACINE));
  assert.equal(identite.ID, MODULE_EN);
  assert.equal(identite.ANGLAIS, true);
});
