// L'installateur et les cartes vivantes : les épingles visent les journaux DU MONDE (identifiants raccordés), et une carte déjà
// importée d'une version précédente reçoit les sons, zones et épingles du module sans perdre ce que le MJ y a ajouté.
// Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";

const merge = (cible, ajout) => {
  const o = structuredClone(cible);
  for (const [chemin, v] of Object.entries(ajout)) {
    const parts = chemin.split("."); let x = o;
    for (const p of parts.slice(0, -1)) x = x[p] ??= {};
    x[parts.at(-1)] = v;
  }
  return o;
};
globalThis.foundry = { applications: { api: { ApplicationV2: class {}, HandlebarsApplicationMixin: c => c, DialogV2: {} } },
  utils: { mergeObject: (a, b) => merge(a, b) } };
globalThis.Hooks = { once() {}, on() {} };
const { carteVivante, rafraichirScene, visibiliteDuCompendium, rafraichirJournal } = await import("../modules/lakour-warcraft/scripts/main.js");
const ID = "lakour-warcraft";

const source = {
  sounds: [{ _id: "s1", path: "feu.wav" }],
  regions: [{ _id: "r1", name: "Crypte", behaviors: [{ _id: "b1", type: "pauseGame" }] }],
  notes: [{ _id: "n1", entryId: "JournalCompendi1", pageId: "PageScene200001", text: "Le relais" }, { _id: "n2", entryId: "Inconnu000000001" }]
};

test("cartes vivantes : épingles raccordées aux journaux du monde, sons/zones/épingles marqués du module", () => {
  const v = carteVivante(source, new Map([["JournalCompendi1", "JournalMonde0001"]]));
  assert.equal(v.notes[0].entryId, "JournalMonde0001");
  assert.equal(v.notes[0].pageId, "PageScene200001", "les pages gardent leur identifiant");
  assert.equal(v.notes[1].entryId, "Inconnu000000001", "sans correspondance, l'identifiant reste");
  for (const champ of ["sounds", "regions", "notes"]) assert.ok(v[champ].every(d => d.flags[ID].carte === true), champ);
  assert.equal(source.notes[0].entryId, "JournalCompendi1", "la source n'est pas modifiée");
});

test("cartes vivantes : une scène d'une version précédente est rafraîchie une fois ; les ajouts du MJ restent", async () => {
  const doc = (d, carte) => ({ ...d, id: d._id, getFlag: (m, k) => (m === ID && k === "carte" ? carte : undefined) });
  const journal = [];
  const scene = {
    flags: {}, sounds: [doc({ _id: "ancienSon" }, true), doc({ _id: "sonDuMJ" }, false)], regions: [], notes: [doc({ _id: "ancienneNote" }, true)],
    getFlag(m, k) { return this.flags[m]?.[k]; },
    async setFlag(m, k, v) { (this.flags[m] ??= {})[k] = v; },
    async deleteEmbeddedDocuments(type, ids) { journal.push(["suppr", type, ids]); },
    async createEmbeddedDocuments(type, docs, o) { journal.push(["cree", type, docs.length, o]); }
  };
  const compendium = { toObject: () => structuredClone(source) };
  assert.equal(await rafraichirScene(scene, compendium, new Map()), true);
  assert.deepEqual(journal.filter(e => e[0] === "suppr"), [["suppr", "AmbientSound", ["ancienSon"]], ["suppr", "Note", ["ancienneNote"]]], "seuls ceux du module partent");
  assert.deepEqual(journal.filter(e => e[0] === "cree").map(e => [e[1], e[2], e[3].keepId]), [["AmbientSound", 1, true], ["Region", 1, true], ["Note", 2, true]]);
  journal.length = 0;
  assert.equal(await rafraichirScene(scene, compendium, new Map()), false, "déjà à jour : rien");
  assert.equal(journal.length, 0);
});

test("journaux du module : un guide importé caché redevient visible comme au compendium, jamais l'inverse", async () => {
  const maj = [];
  const journal = defaut => ({ ownership: { default: defaut }, async update(d) { maj.push(d); } });
  assert.equal(await visibiliteDuCompendium(journal(0), { ownership: { default: 2 } }), true);
  assert.deepEqual(maj, [{ "ownership.default": 2 }]);
  assert.equal(await visibiliteDuCompendium(journal(2), { ownership: { default: 0 } }), false, "un journal visible n'est jamais recaché");
  assert.equal(await visibiliteDuCompendium(journal(2), { ownership: { default: 2 } }), false);
  assert.equal(maj.length, 1);
});

test("journaux du module : la mise à jour complète le journal sans écraser les retouches ni les pages du MJ IA", async () => {
  const neuve = { createdTime: 1, modifiedTime: 1 }, retouchee = { createdTime: 1, modifiedTime: 3_600_001 };
  const page = (id, texte, extra = {}) => ({ id, toObject: () => ({ _id: id, name: id, type: "text", sort: 0, text: { content: texte }, flags: {}, ...extra }) });
  const ops = [];
  const existant = {
    flags: {},
    pages: [
      page("p1", "<p>ancien</p>", { _stats: neuve }),                                                    // intacte : reprend le texte
      page("p2", "<p>retouchée</p>", { _stats: retouchee }),                                             // retouchée à la main : gardée
      page("p4", "<p>réécrite</p>", { _stats: neuve, flags: { "lakour-mj-ia": { historique: [{ contenu: "v1" }] } } }),
      page("ajout", "<p>de l'IA</p>", { _stats: neuve, flags: { "lakour-mj-ia": { ajoutee: { quand: 1 } } } })
    ],
    getFlag(m, k) { return this.flags[m]?.[k]; }, async setFlag(m, k, v) { (this.flags[m] ??= {})[k] = v; },
    async deleteEmbeddedDocuments(t, ids) { ops.push(["suppr", ids]); },
    async updateEmbeddedDocuments(t, docs) { ops.push(["maj", docs.map(d => d._id)]); },
    async createEmbeddedDocuments(t, docs, o) { ops.push(["cree", docs.map(d => d._id), o?.keepId]); }
  };
  const source = { pages: [page("p1", "<p>nouveau</p>"), page("p2", "<p>nouveau 2</p>"), page("p3", "<p>neuve</p>"), page("p4", "<p>nouveau 4</p>")] };
  const gardees = [];
  assert.equal(await rafraichirJournal(existant, source, gardees), true);
  assert.deepEqual(ops, [["cree", ["p3"], true], ["maj", ["p1"]]], "p3 ajoutée avec son identifiant, p1 remise à jour ; p2, p4 et la page ajoutée restent");
  assert.deepEqual(gardees, ["p2"]);
  assert.equal(await rafraichirJournal(existant, source, gardees), false, "une fois à jour, plus rien");
});
