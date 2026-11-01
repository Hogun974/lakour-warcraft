// Essais du one-shot « Une nuit aux Deux Lanternes » (niveau 3, une soirée) de lakour-warcraft :
// - journal du MJ caché, avec ses pages attendues (synopsis, accroches, trois actes, dénouements, PNJ), aucune vide ni
//   sans lien ; chaque @UUID des journaux du one-shot vise un document (ou une page) fabriqué ; chaque jet cliquable
//   suit la syntaxe des enrichers de dnd5e 6.0.6 ; aucun « DD n » laissé en clair ;
// - deux aides de jeu visibles, découpées en pages, sans lien vers un compendium fermé, chaque page montrée depuis le
//   journal du MJ ;
// - trois cartes rattachées au one-shot, citées par leur nom exact, chacune par son acte : pièces, éléments nommés,
//   murs et portes, grille de 1,5 m, lumières, fonds plat et relief, plans.json ; 2 à 4 zones (un texte de lore, une
//   pause ou une obscurité), des épingles vers une page existante (la page de l'acte de CETTE carte, ou une aide de
//   jeu) posées sur une pièce, des sons explicites qui ne sonnent pas la mer ;
// - quatre PNJ nommés seulement (jeton, faction, icônes), les autres créatures prises au bestiaire par lien ; une table
//   propre au one-shot, rattachée à lui et couvrant sa formule ;
// - le paquet Adventure du one-shot : ses trois cartes, ses trois journaux, ses PNJ, ses créatures et sa table.
// Batterie par mutation : des copies faussées sont repérées. Aucun réseau, rien n'est écrit.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fabriquer, TYPE_PACK } from "../outils/fabriquer-warcraft.mjs";
import { paquetsAventures } from "../modules/lakour-warcraft/contenu/aventures-paquets.mjs";
import { DOCUMENTS } from "../modules/lakour-warcraft/contenu/index.mjs";
import { ONE_SHOT_DOCUMENTS, PNJ_ONE_SHOT, TABLES_ONE_SHOT } from "../modules/lakour-warcraft/contenu/one-shot.mjs";
import { CARTES_ONE_SHOT, TITRE_ONE_SHOT } from "../modules/lakour-warcraft/contenu/one-shot-cartes.mjs";
import { PAGES_JOURNAUX } from "../modules/lakour-warcraft/contenu/cles-journaux.mjs";
import { FACTION_PNJ, JETONS_PNJ } from "../modules/lakour-warcraft/contenu/jetons.mjs";
import { ICONES_PNJ } from "../modules/lakour-warcraft/contenu/icones-pnj.mjs";
import { CARACTERISTIQUES, COMPETENCES, DOMMAGES, OUTILS, SOINS } from "../modules/lakour-warcraft/contenu/objets.mjs";

const M = "lakour-warcraft";
const MJ = "one-shot-deux-lanternes";
const AIDES = ["relais-deux-lanternes", "carnet-crayeval"];
const PAGES_MJ = ["Synopsis", "Accroches", "Acte 1", "Acte 2", "Acte 3", "Dénouements", "PNJ et forces"];
const NOMMES = ["Hilde", "Durgan", "Vesper", "Aldwin"];
const racine = new URL("../", import.meta.url);
const lire = chemin => { try { return readFileSync(new URL(chemin, racine), "utf8"); } catch { return null; } };

const fabriques = fabriquer();
const aventures = paquetsAventures(fabriques);
const PLANS = JSON.parse(lire(`modules/${M}/assets/cartes/plans.json`));
const PACKS_JOUEURS = new Set(JSON.parse(lire(`modules/${M}/module.json`)).packs.filter(p => (p.ownership?.PLAYER ?? "NONE") !== "NONE").map(p => p.name));

// Index de tout ce qui est fabriqué : uuid de compendium (et de page) -> { pack, doc, page? }.
const INDEX = new Map();
for (const { pack, doc } of fabriques) {
  const uuid = `Compendium.${M}.${pack}.${TYPE_PACK[pack]}.${doc._id}`;
  INDEX.set(uuid, { pack, doc });
  for (const p of doc.pages ?? []) INDEX.set(`${uuid}.JournalEntryPage.${p._id}`, { pack, doc, page: p });
}

// Syntaxe des enrichers de dnd5e 6.0.6 (la même que essais/warcraft-journaux-lies.test.mjs, réduite à ce qu'écrit le module).
const decode = t => t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;|&apos;/g, "'");
const LIEN = /@UUID\[(?<uuid>[^\]]+)](?:{(?<label>[^}]+)})?/g;
const ENRICHER = /\[\[\/(?<type>check|save|damage|heal)(?<config> .*?)?]](?!])(?:{(?<label>[^}]+)})?/g;
const REFERENCE = /&Reference\[(?<config>[^\]]+)](?:{(?<label>[^}]+)})?/g;
const OUTILS_DND5E = new Set(Object.values(OUTILS).flat());
const lireConfig = (config = "") => Object.fromEntries((config.match(/\S+/g) ?? []).map(m => m.split("=")));
function erreursJet({ type, config, label }) {
  const c = lireConfig(config);
  const e = [];
  if (!label?.trim()) e.push("jet sans libellé");
  if (type === "check") {
    if (c.skill && !COMPETENCES.includes(c.skill)) e.push(`compétence « ${c.skill} » inconnue`);
    if (c.tool && !OUTILS_DND5E.has(c.tool)) e.push(`outil « ${c.tool} » inconnu`);
    if (c.ability && !CARACTERISTIQUES.includes(c.ability)) e.push(`caractéristique « ${c.ability} » inconnue`);
    if (!c.skill && !c.tool && !c.ability) e.push("jet sans compétence, outil ni caractéristique");
  }
  if (type === "save" && !CARACTERISTIQUES.includes(c.ability)) e.push(`sauvegarde : caractéristique « ${c.ability} » inconnue`);
  if (type === "check" || type === "save") {
    if (!/^\d+$/.test(c.dc ?? "") || Number(c.dc) < 5 || Number(c.dc) > 30) e.push(`DD « ${c.dc} » invalide`);
  }
  if (type === "damage" || type === "heal") {
    if (!/^\d+d\d+(?:[+-]\d+)?$/.test(c.formula ?? "")) e.push(`formule « ${c.formula} » invalide`);
    if (!(type === "damage" ? DOMMAGES : SOINS).includes(c.type)) e.push(`type « ${c.type} » inconnu`);
  }
  return e;
}

// ---------------------------------------------------------------- Vérificateur (aussi pour les mutations)

const cleDe = d => d.flags?.[M]?.cle;
const texte = j => j.pages.map(p => p.text?.content ?? "").join("\n");
const typesZones = s => (s.regions ?? []).map(r => r.behaviors?.[0]?.type);

// C : { journaux, scenes, pnjs, tables, aventure } (documents fabriqués, copiables). Rend la liste des erreurs.
function verifier(C) {
  const erreurs = [];
  const mj = C.journaux.find(j => cleDe(j) === MJ);
  if (!mj) return ["journal du MJ du one-shot absent"];
  const aides = AIDES.map(cle => C.journaux.find(j => cleDe(j) === cle));
  const journaux = [mj, ...aides.filter(Boolean)];

  // Journal du MJ.
  if (mj.ownership?.default !== 0) erreurs.push("journal du MJ visible des joueurs");
  for (const titre of PAGES_MJ) if (!mj.pages.some(p => p.name.startsWith(titre))) erreurs.push(`page « ${titre}… » absente du journal du MJ`);
  for (const p of mj.pages) {
    if ((p.text?.content ?? "").length < 1000) erreurs.push(`page « ${p.name} » vide ou trop courte`);
    if (!/@UUID\[/.test(p.text?.content ?? "")) erreurs.push(`page « ${p.name} » sans aucun lien`);
  }
  const contenuMj = decode(texte(mj));
  if ((contenuMj.match(/À lire/g) ?? []).length < 4) erreurs.push("moins de 4 encadrés « À lire »");
  if ((contenuMj.match(ENRICHER) ?? []).length < 30) erreurs.push("moins de 30 jets cliquables");
  const enClair = contenuMj.replace(ENRICHER, "").match(/.{0,20}\bDD \d+/g) ?? [];
  for (const d of enClair) erreurs.push(`DD en clair : « ${d} »`);

  // Liens et jets de tous les journaux du one-shot.
  for (const j of journaux) {
    const visible = (j.ownership?.default ?? 0) >= 2;
    for (const p of j.pages) {
      const ou = `${j.name} / ${p.name}`;
      if (p.type !== "text" || p.text?.format !== 1) erreurs.push(`${ou} : page qui n'est pas une page texte`);
      const t = decode(p.text?.content ?? "");
      for (const m of t.matchAll(LIEN)) {
        const cible = INDEX.get(m.groups.uuid);
        if (!cible) erreurs.push(`${ou} : lien introuvable ${m.groups.uuid}`);
        if (!m.groups.label?.trim()) erreurs.push(`${ou} : lien sans libellé`);
        if (visible && cible && (!PACKS_JOUEURS.has(cible.pack) || (cible.pack === "journaux" && !(cible.doc.ownership?.default >= 2)))) {
          erreurs.push(`${ou} : aide de jeu avec un lien vers ce que les joueurs ne peuvent pas ouvrir`);
        }
      }
      for (const m of t.matchAll(ENRICHER)) for (const e of erreursJet(m.groups)) erreurs.push(`${ou} : ${m[0]} : ${e}`);
      for (const m of t.matchAll(REFERENCE)) if (!/^(condition|rule)=\w+$/.test(m.groups.config)) erreurs.push(`${ou} : ${m[0]} mal formé`);
      const reste = t.replace(LIEN, "").replace(ENRICHER, "").replace(REFERENCE, "");
      for (const debris of reste.match(/\[\[|@UUID|&Reference/g) ?? []) erreurs.push(`${ou} : « ${debris} » mal formé`);
    }
  }

  // Aides de jeu : visibles, en pages, chaque page montrée depuis le journal du MJ.
  const liensMj = new Set([...contenuMj.matchAll(LIEN)].map(m => m.groups.uuid));
  AIDES.forEach((cle, i) => {
    const a = aides[i];
    if (!a) { erreurs.push(`aide de jeu ${cle} absente`); return; }
    if (a.ownership?.default !== 2) erreurs.push(`aide de jeu ${cle} cachée aux joueurs`);
    if (!a.name.startsWith("Aide de jeu — ")) erreurs.push(`aide de jeu ${cle} mal nommée`);
    if (a.pages.length < 2) erreurs.push(`aide de jeu ${cle} en une seule page`);
    for (const p of a.pages) {
      if ((p.text?.content ?? "").length < 300) erreurs.push(`aide de jeu ${cle} / ${p.name} : page vide ou trop courte`);
      const uuid = `Compendium.${M}.journaux.JournalEntry.${a._id}.JournalEntryPage.${p._id}`;
      if (!liensMj.has(uuid)) erreurs.push(`aide de jeu ${cle} / ${p.name} : page non liée depuis le journal du MJ`);
    }
  });

  // Cartes.
  const cartes = C.scenes.filter(s => s.flags?.[M]?.aventure === TITRE_ONE_SHOT);
  if (cartes.length !== 3) erreurs.push(`${cartes.length} cartes du one-shot au lieu de 3`);
  const cartesAventure = C.scenes.filter(s => s.flags?.[M]?.aventure).map(s => s._id);
  cartes.forEach(s => {
    const ou = `carte « ${s.name} »`;
    const { plan, description, cle } = s.flags[M];
    if (!contenuMj.includes(s.name)) erreurs.push(`${ou} non citée par son nom exact dans le journal du MJ`);
    const acte = mj.pages.find(p => p.name.startsWith("Acte") && p.text.content.includes(`.Scene.${s._id}`));
    if (!acte) erreurs.push(`${ou} : aucun acte ne la cite`);
    if (!(plan?.pieces?.length >= 3)) erreurs.push(`${ou} : moins de 3 pièces`);
    const nommes = (plan?.elements ?? []).filter(e => e.nom?.trim());
    if (nommes.length < 8) erreurs.push(`${ou} : ${nommes.length} éléments nommés seulement`);
    if (!(description?.length > 40)) erreurs.push(`${ou} : description trop courte`);
    if (!(s.walls?.length > 0) || !s.walls.some(w => w.door > 0)) erreurs.push(`${ou} : sans murs ou sans porte`);
    if (s.grid?.distance !== 1.5 || s.grid?.units !== "m") erreurs.push(`${ou} : grille qui n'est pas de 1,5 m`);
    if (!(s.lights?.length >= 4)) erreurs.push(`${ou} : moins de 4 lumières`);
    const fond = s.levels?.[0]?.background?.src ?? "";
    for (const chemin of [fond, fond.replace("/cartes/", "/cartes/3d/")]) if (!lire(chemin)?.startsWith("<svg")) erreurs.push(`${ou} : fond ${chemin} absent`);
    if (JSON.stringify(PLANS[cle]) !== JSON.stringify(plan)) erreurs.push(`${ou} : plans.json désaccordé`);

    // Zones : 2 à 4, au moins un texte de lore et une pause ou une obscurité, aucun texte vide.
    const types = typesZones(s);
    if (types.length < 2 || types.length > 4) erreurs.push(`${ou} : ${types.length} zone(s) au lieu de 2 à 4`);
    if (!types.includes("displayScrollingText")) erreurs.push(`${ou} : aucun texte de lore`);
    if (!types.some(t => t === "pauseGame" || t === "adjustDarknessLevel")) erreurs.push(`${ou} : aucune pause ou obscurité`);
    for (const r of s.regions ?? []) {
      const b = r.behaviors?.[0];
      if (b?.type === "displayScrollingText" && !String(b.system?.text ?? "").trim()) erreurs.push(`${ou}, zone « ${r.name} » : texte vide`);
      if (b?.type === "pauseGame" && b.system?.once !== true) erreurs.push(`${ou}, zone « ${r.name} » : pause qui sert plusieurs fois`);
    }

    // Sons explicites : de l'eau douce ou un marais, pas la mer.
    if (!plan?.sons?.length) erreurs.push(`${ou} : sons déduits au lieu de sons explicites`);
    for (const son of s.sounds ?? []) if (/\/mer\.wav$/.test(son.path)) erreurs.push(`${ou} : un son de mer sur une rivière ou un marais`);

    // Épingles : 3 au moins, sur une pièce, vers une page de l'acte de cette carte ou d'une aide de jeu.
    if (!(s.notes?.length >= 3)) erreurs.push(`${ou} : moins de 3 épingles`);
    if (new Set((s.notes ?? []).map(n => n.texture?.src)).size < 3) erreurs.push(`${ou} : épingles aux icônes trop semblables`);
    for (const n of s.notes ?? []) {
      const o = `${ou}, épingle « ${n.text} »`;
      if (!String(n.text ?? "").trim()) erreurs.push(`${o} : texte vide`);
      const cx = Math.floor(n.x / s.grid.size), cy = Math.floor(n.y / s.grid.size);
      if (!plan.pieces.some(p => cx >= p.x && cx < p.x + p.l && cy >= p.y && cy < p.y + p.h)) erreurs.push(`${o} : hors des pièces`);
      const j = journaux.find(x => x._id === n.entryId);
      const page = j?.pages.find(p => p._id === n.pageId);
      if (!page) { erreurs.push(`${o} : vers une page absente des journaux du one-shot`); continue; }
      if (j === mj) {
        const citees = cartesAventure.filter(id => page.text.content.includes(`.Scene.${id}`));
        if (citees.length !== 1 || citees[0] !== s._id) erreurs.push(`${o} : la page « ${page.name} » n'est pas celle de cette carte`);
      }
    }
  });

  // PNJ nommés : au bestiaire, avec jeton, faction et icônes ; cités par le journal.
  for (const nom of NOMMES) {
    const a = C.pnjs.find(x => x.name.startsWith(nom));
    if (!a) { erreurs.push(`${nom} absent du bestiaire`); continue; }
    if (!contenuMj.includes(nom)) erreurs.push(`${nom} absent du journal du MJ`);
    const cle = cleDe(a);
    if (!JETONS_PNJ[cle] || !FACTION_PNJ[cle] || !ICONES_PNJ[cle]) erreurs.push(`${nom} : jeton, faction ou icônes manquants`);
    if (!String(a.system?.details?.biography?.value ?? "").includes("Note du MJ")) erreurs.push(`${nom} : sans note du MJ`);
  }

  // Table propre au one-shot.
  const table = C.tables.find(x => cleDe(x) === "bruits-de-la-nuit");
  if (!table) erreurs.push("table du one-shot absente");
  else {
    if (table.flags[M].aventure !== TITRE_ONE_SHOT) erreurs.push("table du one-shot non rattachée au one-shot");
    const faces = Number(/^1d(\d+)$/.exec(table.formula)?.[1]);
    const couvertes = table.results.reduce((n, r) => n + r.range[1] - r.range[0] + 1, 0);
    if (couvertes !== faces) erreurs.push(`table du one-shot : ${couvertes} faces couvertes sur ${faces}`);
    if (table.results.some(r => !String(r.description ?? "").trim())) erreurs.push("table du one-shot : résultat vide");
    if (!liensMj.has(`Compendium.${M}.tables.RollTable.${table._id}`)) erreurs.push("table du one-shot non liée depuis le journal du MJ");
  }

  // Paquet Adventure.
  const a = C.aventure;
  if (!a) erreurs.push("paquet Adventure du one-shot absent");
  else {
    if (a.name !== TITRE_ONE_SHOT) erreurs.push(`paquet Adventure : nom « ${a.name} »`);
    if (!String(a.caption ?? "").trim() || !String(a.description ?? "").trim()) erreurs.push("paquet Adventure : légende ou description vide");
    if (!a.img || !lire(a.img)) erreurs.push("paquet Adventure : image absente");
    const ids = champ => new Set((a[champ] ?? []).map(d => d._id));
    for (const s of cartes) if (!ids("scenes").has(s._id)) erreurs.push(`paquet Adventure : il manque la carte « ${s.name} »`);
    if ((a.scenes ?? []).length !== 3) erreurs.push(`paquet Adventure : ${(a.scenes ?? []).length} cartes`);
    for (const j of journaux) if (!ids("journal").has(j._id)) erreurs.push(`paquet Adventure : il manque le journal « ${j.name} »`);
    for (const p of C.pnjs.filter(x => NOMMES.some(n => x.name.startsWith(n)))) if (!ids("actors").has(p._id)) erreurs.push(`paquet Adventure : il manque ${p.name}`);
    for (const uuid of liensMj) {
      const cible = INDEX.get(uuid);
      if (cible?.pack === "bestiaire" && !ids("actors").has(cible.doc._id)) erreurs.push(`paquet Adventure : il manque la créature citée ${cible.doc.name}`);
    }
    if (table && !ids("tables").has(table._id)) erreurs.push("paquet Adventure : il manque la table du one-shot");
    for (const s of a.scenes ?? []) for (const n of s.notes ?? []) {
      const j = (a.journal ?? []).find(x => x._id === n.entryId);
      if (!j?.pages.some(p => p._id === n.pageId)) erreurs.push(`paquet Adventure, « ${s.name} » : épingle « ${n.text} » vers une page non embarquée`);
    }
  }
  return erreurs;
}

const docsDe = pack => fabriques.filter(d => d.pack === pack).map(d => d.doc);
const CONTEXTE = {
  journaux: docsDe("journaux"), scenes: docsDe("scenes"), pnjs: docsDe("bestiaire"), tables: docsDe("tables"),
  aventure: aventures.find(a => a.cle === "aventures:nuit-aux-deux-lanternes")?.doc
};

// ---------------------------------------------------------------- Le vrai contenu

test("one-shot : branché dans l'index du module, fabriqué, pages dans l'ordre des épingles", () => {
  for (const d of ONE_SHOT_DOCUMENTS) assert.ok(DOCUMENTS.includes(d), `${d.__cle} absent de DOCUMENTS`);
  const cles = new Set(fabriques.map(d => d.cle));
  for (const d of ONE_SHOT_DOCUMENTS) assert.ok(cles.has(d.__cle), `${d.__cle} non fabriqué`);
  for (const cle of [MJ, ...AIDES]) {
    const j = CONTEXTE.journaux.find(x => cleDe(x) === cle);
    assert.deepEqual(j.pages.map(p => p.name), PAGES_JOURNAUX[cle], `${cle} : pages dans un autre ordre que cles-journaux.mjs`);
  }
  assert.equal(CARTES_ONE_SHOT.length, 3);
  assert.equal(TABLES_ONE_SHOT.length, 1);
});

test("one-shot : le contenu passe tout le vérificateur (liens, jets, aides, cartes, PNJ, table, paquet)", () => {
  assert.deepEqual(verifier(CONTEXTE), []);
});

test("one-shot : niveau 3, 3 à 5 joueurs, une soirée, trois actes, quatre PNJ nommés et le bestiaire pour le reste", () => {
  const mj = CONTEXTE.journaux.find(j => cleDe(j) === MJ);
  const t = decode(texte(mj));
  for (const mot of ["niveau 3", "3 à 5 personnages", "3 à 4 heures", "An 21", "Alliance", "Horde"]) assert.ok(t.includes(mot), `« ${mot} » absent`);
  assert.equal(PNJ_ONE_SHOT.length, 4, "seuls les PNJ nommés nécessaires ont leur fiche");
  for (const p of PNJ_ONE_SHOT) {
    assert.ok(p.system.details.cr >= 1 && p.system.details.cr <= 3, `${p.name} : FP ${p.system.details.cr}`);
    for (const champ of [p.system.details.biography.value, p.system.details.biography.public]) assert.ok(champ.length > 100, `${p.name} : texte court`);
  }
  // Les autres créatures citées viennent du bestiaire existant (aucune fiche créée pour elles).
  const fiches = new Set([...t.matchAll(LIEN)].map(m => INDEX.get(m.groups.uuid)).filter(c => c?.pack === "bestiaire").map(c => cleDe(c.doc)));
  const reprises = [...fiches].filter(cle => !PNJ_ONE_SHOT.some(p => cleDe(p) === cle));
  assert.ok(reprises.length >= 5, `créatures reprises du bestiaire : ${reprises}`);
  for (const cle of ["goule", "squelette", "abomination", "bandit-defias"]) assert.ok(reprises.includes(cle), `${cle} non reprise`);
  // Le méchant porte le masque de l'Alliance, la réprouvée celui de la Horde, les hôtes un de chaque.
  assert.deepEqual(["hilde-brunval", "durgan-brise-fers", "vesper-lacombe", "aldwin-crayeval"].map(c => FACTION_PNJ[c]), ["alliance", "horde", "horde", "alliance"]);
});

test("one-shot : le paquet Adventure est le troisième, avec cartes, journaux, PNJ et table", () => {
  assert.equal(aventures.length, 3);
  assert.equal(aventures[2].cle, "aventures:nuit-aux-deux-lanternes");
  const a = CONTEXTE.aventure;
  assert.deepEqual([a.scenes.length, a.journal.length], [3, 3]);
  assert.ok(a.actors.length >= 10, `${a.actors.length} acteurs`);
  assert.ok(a.journal.filter(j => j.ownership.default === 2).length === 2 && a.journal.filter(j => j.ownership.default === 0).length === 1);
  assert.ok(a.sort > Math.max(...aventures.slice(0, 2).map(x => x.doc.sort)), "rangé après l'aventure et la campagne");
});

// ---------------------------------------------------------------- Mutations

const journal = (C, cle) => C.journaux.find(j => cleDe(j) === cle);
const carte = (C, cle) => C.scenes.find(s => cleDe(s) === cle);
const page = (C, cle, debut) => journal(C, cle).pages.find(p => p.name.startsWith(debut));
const MUTATIONS = [
  ["journal du MJ visible", C => { journal(C, MJ).ownership.default = 2; }, /journal du MJ visible/],
  ["page d'acte retirée", C => { const j = journal(C, MJ); j.pages = j.pages.filter(p => !p.name.startsWith("Acte 2")); }, /page « Acte 2… » absente/],
  ["page vidée", C => { page(C, MJ, "Dénouements").text.content = "<p>À venir.</p>"; }, /« Dénouements et récompenses » vide/],
  ["lien cassé d'un caractère", C => { const p = page(C, MJ, "Acte 1"); p.text.content = p.text.content.replace(/(@UUID\[[^\]]*)[A-Za-z0-9]]/, "$1#]"); }, /lien introuvable/],
  ["lien sans libellé", C => { const p = page(C, MJ, "Acte 3"); p.text.content = p.text.content.replace(/(@UUID\[[^\]]+])\{[^}]+}/, "$1"); }, /lien sans libellé/],
  ["compétence inconnue", C => { const p = page(C, MJ, "Acte 1"); p.text.content = p.text.content.replace("skill=ins", "skill=intuition"); }, /compétence « intuition » inconnue/],
  ["DD hors bornes", C => { const p = page(C, MJ, "Acte 2"); p.text.content = p.text.content.replace("dc=13", "dc=35"); }, /DD « 35 » invalide/],
  ["type de dégâts inconnu", C => { const p = page(C, MJ, "Acte 2"); p.text.content = p.text.content.replace("type=bludgeoning", "type=contondant"); }, /type « contondant » inconnu/],
  ["DD laissé en clair", C => { page(C, MJ, "Acte 3").text.content += "<p>Un test de Perception DD 12 révèle tout.</p>"; }, /DD en clair/],
  ["enricher tronqué", C => { const p = page(C, MJ, "Acte 1"); p.text.content = p.text.content.replace("[[/check", "[[/chek"); }, /« \[\[ » mal formé/],
  ["aide de jeu cachée", C => { journal(C, "carnet-crayeval").ownership.default = 0; }, /carnet-crayeval cachée/],
  ["aide de jeu qui lie le bestiaire", C => {
    const fiche = C.pnjs.find(a => cleDe(a) === "aldwin-crayeval");
    journal(C, "relais-deux-lanternes").pages[0].text.content += `<p>@UUID[Compendium.${M}.bestiaire.Actor.${fiche._id}]{Aldwin}</p>`;
  }, /aide de jeu avec un lien/],
  ["page d'aide non montrée par le MJ", C => {
    const croquis = journal(C, "carnet-crayeval").pages[1]._id;
    for (const p of journal(C, MJ).pages) p.text.content = p.text.content.replaceAll(`.JournalEntryPage.${croquis}]`, "]");
  }, /Croquis du cimetière : page non liée/],
  ["carte retirée", C => { C.scenes = C.scenes.filter(s => cleDe(s) !== "gue-brumeux-caves"); }, /2 cartes du one-shot au lieu de 3/],
  ["carte non citée par son nom", C => {
    for (const p of journal(C, MJ).pages) p.text.content = p.text.content.replaceAll(carte(C, "cimetiere-des-rescapes").name, "le cimetière");
  }, /Cimetière des Rescapés » non citée/],
  ["éléments nommés effacés", C => { carte(C, "gue-brumeux-relais").flags[M].plan.elements.forEach(e => { e.nom = " "; }); }, /0 éléments nommés/],
  ["fond absent", C => { carte(C, "gue-brumeux-caves").levels[0].background.src = `modules/${M}/assets/cartes/inexistante.svg`; }, /fond .* absent/],
  ["carte sans pause ni obscurité", C => {
    const s = carte(C, "cimetiere-des-rescapes");
    s.regions = s.regions.filter(r => r.behaviors[0].type === "displayScrollingText");
  }, /aucune pause ou obscurité/],
  ["zone de lore vide", C => {
    carte(C, "gue-brumeux-relais").regions.find(r => r.behaviors[0].type === "displayScrollingText").behaviors[0].system.text = "";
  }, /texte vide/],
  ["la rivière sonne la mer", C => { const s = carte(C, "gue-brumeux-relais"); s.sounds[0].path = s.sounds[0].path.replace(/\w+\.wav$/, "mer.wav"); }, /son de mer/],
  ["sons déduits", C => { delete carte(C, "gue-brumeux-caves").flags[M].plan.sons; }, /sons déduits/],
  ["épingle vers une page absente", C => { carte(C, "gue-brumeux-caves").notes[0].pageId = "XXXXXXXXXXXXXXXX"; }, /page absente/],
  ["épingle vers l'acte d'une autre carte", C => { carte(C, "gue-brumeux-relais").notes[0].pageId = page(C, MJ, "Acte 3")._id; }, /n'est pas celle de cette carte/],
  ["épingle hors des pièces", C => { const n = carte(C, "cimetiere-des-rescapes").notes[0]; n.x = -500; n.y = -500; }, /hors des pièces/],
  ["épingle sans texte", C => { carte(C, "cimetiere-des-rescapes").notes[1].text = " "; }, /épingle «\s+» : texte vide/],
  ["PNJ nommé absent", C => { C.pnjs = C.pnjs.filter(a => cleDe(a) !== "vesper-lacombe"); }, /Vesper absent du bestiaire/],
  ["table détachée du one-shot", C => { delete C.tables.find(t => cleDe(t) === "bruits-de-la-nuit").flags[M].aventure; }, /table du one-shot non rattachée/],
  ["table trouée", C => { C.tables.find(t => cleDe(t) === "bruits-de-la-nuit").results.pop(); }, /7 faces couvertes sur 8/],
  ["paquet sans une carte", C => { C.aventure.scenes.pop(); }, /paquet Adventure : il manque la carte/],
  ["paquet sans une créature citée", C => { C.aventure.actors = C.aventure.actors.filter(a => a.name !== "Goule"); }, /il manque la créature citée Goule/],
  ["paquet sans la table", C => { C.aventure.tables = []; }, /il manque la table du one-shot/],
  ["paquet sans un journal", C => { C.aventure.journal = C.aventure.journal.filter(j => j.name !== journal(C, "relais-deux-lanternes").name); }, /il manque le journal/],
  ["paquet sans légende", C => { C.aventure.caption = " "; }, /légende ou description vide/]
];

test("mutation : chaque one-shot faussé est repéré par le vérificateur", () => {
  const passees = [];
  for (const [nom, muter, attendu] of MUTATIONS) {
    const copie = structuredClone(CONTEXTE);
    muter(copie);
    const erreurs = verifier(copie);
    if (!erreurs.some(e => attendu.test(e))) passees.push(`${nom} (obtenu : ${erreurs.join(" | ") || "aucune erreur"})`);
  }
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});
