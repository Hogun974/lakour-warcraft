// Essais des cartes vivantes de lakour-warcraft (aventure « Les Puits de cendre », campagne « Les Braises de la Légion ») :
// - chaque épingle vise une page existante du journal qu'elle nomme, et la page précise de sa carte (la page du MJ qui
//   cite cette carte et aucune autre carte d'aventure) ou une aide de jeu visible ; elle est posée sur une pièce ;
// - chaque zone du plan devient une région dans les bornes de la scène, avec un comportement complet ; chaque
//   téléportation vise une région sœur ; au moins 3 épingles et 2 zones par carte, aucun texte vide ;
// - l'ordre des pages recopié dans cles-journaux.mjs est celui des journaux fabriqués.
// Batterie par mutation : des copies faussées des scènes et des journaux sont repérées ; les constructeurs refusent
// une page, une icône ou une zone d'arrivée inconnues. Aucun réseau.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { fabriquer } from "../outils/fabriquer-warcraft.mjs";
import { PAGES_JOURNAUX, epingle, pageJournal } from "../modules/lakour-warcraft/contenu/cles-journaux.mjs";
import { CARTES, TITRE_AVENTURE } from "../modules/lakour-warcraft/contenu/aventure-cartes.mjs";
import { CARTES_CAMPAGNE } from "../modules/lakour-warcraft/contenu/campagne-cartes.mjs";
import { scene } from "../modules/lakour-warcraft/contenu/cartes.mjs";

const M = "lakour-warcraft";
const fabriques = fabriquer();
const scenes = fabriques.filter(d => d.pack === "scenes").map(d => d.doc);
const journaux = fabriques.filter(d => d.pack === "journaux").map(d => d.doc);
const CLES_CARTES = [...CARTES, ...CARTES_CAMPAGNE].map(c => c.flags[M].cle);
const TYPES_REGION = ["displayScrollingText", "teleportToken", "pauseGame", "adjustDarknessLevel"];

// ---------------------------------------------------------------- Vérificateur (aussi pour les mutations)

function verifier({ scenes, journaux }) {
  const erreurs = [];
  const cartes = scenes.filter(s => CLES_CARTES.includes(s.flags?.[M]?.cle));
  if (cartes.length !== CLES_CARTES.length) erreurs.push(`${cartes.length} cartes d'aventure et de campagne au lieu de ${CLES_CARTES.length}`);
  const autres = cartes.map(s => s._id);

  for (const [cle, titres] of Object.entries(PAGES_JOURNAUX)) {
    const j = journaux.find(x => x.flags?.[M]?.cle === cle);
    if (!j) { erreurs.push(`journal « ${cle} » absent`); continue; }
    const noms = j.pages.map(p => p.name);
    if (JSON.stringify(noms) !== JSON.stringify(titres)) erreurs.push(`cles-journaux.mjs : pages de « ${cle} » dans un autre ordre (${noms.join(" | ")})`);
  }

  for (const s of cartes) {
    const ou = `« ${s.name} »`;
    const plan = s.flags[M].plan;
    const taille = s.grid.size;
    if ((s.notes ?? []).length < 3) erreurs.push(`${ou} : ${(s.notes ?? []).length} épingle(s), 3 au moins`);
    if ((s.regions ?? []).length < 2) erreurs.push(`${ou} : ${(s.regions ?? []).length} zone(s), 2 au moins`);

    for (const n of s.notes ?? []) {
      const o = `${ou}, épingle « ${n.text} »`;
      if (!String(n.text ?? "").trim()) erreurs.push(`${o} : texte vide`);
      if (!String(n.texture?.src ?? "").startsWith("icons/svg/")) erreurs.push(`${o} : icône hors du cœur de Foundry (${n.texture?.src})`);
      const cx = Math.floor(n.x / taille), cy = Math.floor(n.y / taille);
      if (!plan.pieces.some(p => cx >= p.x && cx < p.x + p.l && cy >= p.y && cy < p.y + p.h)) erreurs.push(`${o} : posée hors des pièces (${cx},${cy})`);
      const j = journaux.find(x => x._id === n.entryId);
      if (!j) { erreurs.push(`${o} : journal ${n.entryId} introuvable`); continue; }
      const page = j.pages.find(p => p._id === n.pageId);
      if (!page) { erreurs.push(`${o} : page ${n.pageId} introuvable dans « ${j.name} »`); continue; }
      // La page précise : une aide de jeu visible, ou la page du MJ qui cite cette carte et aucune autre.
      if ((j.ownership?.default ?? 0) > 0) continue;
      const contenu = page.text?.content ?? "";
      const citees = autres.filter(id => contenu.includes(`.Scene.${id}`));
      if (citees.length !== 1 || citees[0] !== s._id) erreurs.push(`${o} : la page « ${page.name} » n'est pas celle de cette carte`);
    }

    const zones = plan.zones ?? [];
    if (zones.length !== (s.regions ?? []).length) erreurs.push(`${ou} : ${zones.length} zones au plan, ${(s.regions ?? []).length} régions`);
    const ids = new Set((s.regions ?? []).map(r => r._id));
    for (const r of s.regions ?? []) {
      const o = `${ou}, zone « ${r.name} »`;
      if (!String(r.name ?? "").trim()) erreurs.push(`${ou} : zone sans nom`);
      if (!zones.some(z => z.nom === r.name)) erreurs.push(`${o} : absente du plan`);
      if (r.hidden) erreurs.push(`${o} : cachée (ses comportements seraient inactifs)`);
      if (!r.shapes?.length) erreurs.push(`${o} : sans forme`);
      for (const f of r.shapes ?? []) {
        if (!(f.x >= 0 && f.y >= 0 && f.width > 0 && f.height > 0 && f.x + f.width <= s.width && f.y + f.height <= s.height)) erreurs.push(`${o} : hors de la scène`);
      }
      if (r.behaviors?.length !== 1) { erreurs.push(`${o} : ${r.behaviors?.length ?? 0} comportement(s)`); continue; }
      const b = r.behaviors[0];
      if (!TYPES_REGION.includes(b.type)) erreurs.push(`${o} : comportement « ${b.type} » inconnu`);
      if (b.disabled) erreurs.push(`${o} : comportement désactivé`);
      if (b.type === "displayScrollingText" && !String(b.system?.text ?? "").trim()) erreurs.push(`${o} : texte vide`);
      if (b.type === "teleportToken") {
        const dest = b.system?.destinations ?? [];
        if (!dest.length) erreurs.push(`${o} : téléportation sans destination`);
        for (const d of dest) {
          const id = String(d).replace(/^\.\./, "");
          if (!String(d).startsWith("..") || !ids.has(id) || id === r._id) erreurs.push(`${o} : téléportation vers une zone absente (${d})`);
        }
      }
      if (b.type === "adjustDarknessLevel" && !(b.system?.modifier >= 0 && b.system?.modifier <= 1)) erreurs.push(`${o} : obscurité hors de 0 à 1`);
    }
  }
  return erreurs;
}

// ---------------------------------------------------------------- Essais

test("cartes vivantes : les 8 cartes d'aventure et de campagne passent le vérificateur", () => {
  assert.deepEqual(verifier({ scenes, journaux }), []);
});

test("cartes vivantes : chaque carte a des épingles variées et des zones au service du récit", () => {
  for (const cle of CLES_CARTES) {
    const s = scenes.find(x => x.flags[M].cle === cle);
    const icones = new Set(s.notes.map(n => n.texture.src));
    assert.ok(icones.size >= 3, `${s.name} : des icônes variées (${[...icones]})`);
    assert.ok(new Set(s.notes.map(n => `${n.x},${n.y}`)).size === s.notes.length, `${s.name} : deux épingles sur la même case`);
    assert.ok(s.regions.some(r => r.behaviors[0].type === "displayScrollingText"), `${s.name} : au moins un texte de lore`);
    assert.ok(s.regions.some(r => r.behaviors[0].type !== "displayScrollingText"), `${s.name} : au moins une pause ou une obscurité`);
    const pauses = s.regions.filter(r => r.behaviors[0].type === "pauseGame");
    assert.ok(pauses.every(r => r.behaviors[0].system.once === true), `${s.name} : une pause ne sert qu'une fois`);
  }
  const aventure = scenes.filter(s => s.flags[M].aventure === TITRE_AVENTURE && CLES_CARTES.includes(s.flags[M].cle));
  assert.equal(aventure.length, 4);
});

test("cartes vivantes : une rivière ou une oasis ne sonne pas la mer, la forge en ruine pas les marteaux", () => {
  const sons = cle => scenes.find(x => x.flags[M].cle === cle).sounds.map(s => s.path.match(/sons\/(\w+)\.wav$/)[1]);
  for (const cle of ["relais-oasis", "gue-de-sel-sommet"]) assert.ok(!sons(cle).includes("mer"), `${cle} : ${sons(cle)}`);
  assert.ok(!sons("cratere-brasegouffre").includes("forge"));
  assert.ok(sons("cabestan-quai").includes("mer"), "le port, lui, sonne la mer");
});

test("cartes vivantes : les constructeurs refusent une page, une icône ou une zone d'arrivée inconnues", () => {
  assert.throws(() => pageJournal("aventure-puits-de-cendre#Scène 9 — Inexistante"), /page inconnue/);
  assert.throws(() => pageJournal("journal-inexistant#Synopsis (MJ)"), /journal inconnu/);
  assert.throws(() => epingle("aventure-puits-de-cendre#Synopsis (MJ)", 1, 1, "Essai", "icone-inexistante"), /Aucune icône/);
  const plan = structuredClone(CARTES[0].flags[M].plan);
  plan.zones = [...plan.zones, { nom: "Trappe d'essai", x: 1, y: 1, l: 1, h: 1, type: "teleport", vers: "Cave absente" }];
  assert.throws(() => scene({ cle: "essai-mutation-zone", nom: "Essai", plan, description: "Essai de mutation", aventure: TITRE_AVENTURE }),
    /zone d'arrivée « Cave absente » introuvable/);
});

test("cartes vivantes : une téléportation vers une région sœur est acceptée", () => {
  const copie = structuredClone({ scenes, journaux });
  const s = copie.scenes.find(x => x.flags[M].cle === "mine-rouge-veine");
  const [a, b] = s.regions;
  a.behaviors[0] = { ...a.behaviors[0], type: "teleportToken", system: { destinations: [`..${b._id}`] } };
  assert.deepEqual(verifier(copie), []);
});

// ---------------------------------------------------------------- Mutations

const carte = (copie, cle) => copie.scenes.find(x => x.flags[M].cle === cle);
const MUTATIONS = {
  "épingle vers une page inconnue": c => { carte(c, "cabestan-quai").notes[0].pageId = "XXXXXXXXXXXXXXXX"; },
  "épingle vers le synopsis au lieu de la page de la scène": c => {
    const j = c.journaux.find(x => x.flags[M].cle === "aventure-puits-de-cendre");
    carte(c, "relais-oasis").notes[0].pageId = j.pages[0]._id;
  },
  "épingle vers le chapitre d'une autre carte": c => {
    const j = c.journaux.find(x => x.flags[M].cle === "campagne-braises-legion");
    carte(c, "fonderie-fort-rivet").notes[0].pageId = j.pages.find(p => p.name.startsWith("Chapitre 2"))._id;
  },
  "épingle vers un autre journal": c => {
    carte(c, "kraal-ronceroc").notes[0].entryId = c.journaux.find(x => x.flags[M].cle === "guide-du-mj")._id;
  },
  "épingle sans texte": c => { carte(c, "ruines-eldrassal").notes[1].text = "  "; },
  "épingle hors des pièces": c => { const n = carte(c, "mine-rouge-veine").notes[0]; n.x = 50; n.y = 50; },
  "épingle à l'icône étrangère": c => { carte(c, "gue-de-sel-sommet").notes[0].texture.src = "modules/x/icone.webp"; },
  "trop peu d'épingles": c => { carte(c, "cratere-brasegouffre").notes.splice(2); },
  "trop peu de zones": c => { const s = carte(c, "relais-oasis"); s.regions.splice(1); s.flags[M].plan.zones.splice(1); },
  "zone du plan perdue en route": c => { carte(c, "fonderie-fort-rivet").regions.pop(); },
  "région absente du plan": c => { carte(c, "kraal-ronceroc").regions[0].name = "Zone fantôme"; },
  "texte de lore vide": c => {
    const r = carte(c, "cabestan-quai").regions.find(x => x.behaviors[0].type === "displayScrollingText");
    r.behaviors[0].system.text = "";
  },
  "zone hors de la scène": c => { carte(c, "ruines-eldrassal").regions[0].shapes[0].x = 99999; },
  "zone cachée": c => { carte(c, "mine-rouge-veine").regions[0].hidden = true; },
  "téléportation vers une zone absente": c => {
    const r = carte(c, "gue-de-sel-sommet").regions[0];
    r.behaviors[0] = { ...r.behaviors[0], type: "teleportToken", system: { destinations: ["..XXXXXXXXXXXXXXXX"] } };
  },
  "téléportation vers elle-même": c => {
    const r = carte(c, "cratere-brasegouffre").regions[0];
    r.behaviors[0] = { ...r.behaviors[0], type: "teleportToken", system: { destinations: [`..${r._id}`] } };
  },
  "pages du journal réordonnées": c => {
    const j = c.journaux.find(x => x.flags[M].cle === "campagne-braises-legion");
    [j.pages[2], j.pages[3]] = [j.pages[3], j.pages[2]];
  },
  "carte d'aventure disparue": c => { c.scenes = c.scenes.filter(s => s.flags[M].cle !== "mine-rouge-veine"); }
};

test("mutation : chaque carte vivante faussée est repérée", () => {
  const passees = [];
  for (const [nom, muter] of Object.entries(MUTATIONS)) {
    const copie = structuredClone({ scenes, journaux });
    muter(copie);
    if (!verifier(copie).length) passees.push(nom);
  }
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});
