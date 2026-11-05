// Sûreté des automatismes (modules/lakour-warcraft/scripts/*.js), crochets rejoués sur des doublures de Foundry :
// - noms venus de documents qu'un joueur peut modifier (acteur, effet, utilisateur, jeton, objet) échappés avant d'entrer
//   dans le HTML d'un message créé par le MJ (Fureur retirée, familier refusé, phase 2) ou par le joueur (établi). Foundry 14
//   nettoie le contenu d'un message côté serveur (sanitize-html, liste blanche CONST.ALLOWED_HTML_TAGS / ATTRIBUTES), mais
//   game.i18n.format n'échappe rien : le module ne compte pas sur ce seul filet ;
// - cartes de chat exploitées par le MJ actif (Évasion d'agent, Fût roulant, retour de la Poigne de la mort) ignorées quand
//   leur auteur n'est ni MJ ni propriétaire de ce qu'elles touchent : un joueur ne peut pas forger un message pour mettre à
//   terre, déplacer ou dépouiller la créature d'un autre.
// Lancer : npm run essais
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const crochets = {};
globalThis.Hooks = { once() {}, on(nom, fn) { (crochets[nom] ??= []).push(fn); }, off() {} };
globalThis.Actor = class Actor {};
globalThis.foundry = { utils: { hasProperty: (o, k) => k.split(".").reduce((x, p) => (x && typeof x === "object" && p in x ? x[p] : undefined), o) !== undefined } };
const A = await import("../modules/lakour-warcraft/scripts/automatismes.js");
const C = await import("../modules/lakour-warcraft/scripts/capacites.js");
const S = await import("../modules/lakour-warcraft/scripts/capacites-suite.js");
const E = await import("../modules/lakour-warcraft/scripts/etabli.js");

const M = A.ID;
const PIEGE = `<img src=x onerror="alert(1)">`;
const PIEGE_ECHAPPE = "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;";
const tick = async () => { for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0)); };
const mj = { id: "mj", isGM: true, active: true, name: "MJ" };
const joueur = { id: "j1", isGM: false, active: true, name: PIEGE };
const autre = { id: "j2", isGM: false, active: true, name: "Autre" };
const possedePar = (...ids) => (u, n) => n === "OWNER" && Boolean(u?.isGM || ids.includes(u?.id));

let crees, effetsCrees, uuids;
beforeEach(() => {
  crees = []; effetsCrees = []; uuids = {};
  globalThis.game = {
    user: mj, users: Object.assign([mj, joueur, autre], { activeGM: mj }),
    i18n: { localize: k => k, format: (k, d) => `${k} ${Object.entries(d ?? {}).map(([a, b]) => `${a}=${b}`).join(" ")}` },
    combat: null, combats: [], scenes: [], packs: { get: () => undefined }
  };
  globalThis.ui = { notifications: { info() {}, warn() {}, error() {} } };
  globalThis.ChatMessage = { implementation: { create: async d => { crees.push(d); return d; }, getSpeaker: () => ({ alias: "?" }) } };
  globalThis.fromUuidSync = u => uuids[u] ?? null;
  globalThis.fromUuid = async u => uuids[u] ?? null;
  globalThis.ActiveEffect = { implementation: {
    fromStatusEffect: async id => ({ id, updateSource() {} }),
    create: async (etat, opts) => { effetsCrees.push({ etat, parent: opts?.parent }); return etat; }
  } };
});
const rejouer = async (nom, ...args) => { for (const fn of crochets[nom] ?? []) fn(...args); await tick(); };
const acteur = (props = {}) => Object.assign(new Actor(), { effects: [], items: [], statuses: new Set(), system: {}, testUserPermission: possedePar(), ...props });
const sansAvertir = async fn => { const w = console.warn; console.warn = () => {}; try { await fn(); } finally { console.warn = w; } };

// ---------------------------------------------------------------- Noms échappés

test("echapper et formatEchappe : utilitaire partagé, paramètres échappés, gabarit intact", () => {
  assert.equal(A.echapper(PIEGE), PIEGE_ECHAPPE);
  assert.equal(A.echapper(null), ""); assert.equal(A.echapper(3), "3");
  assert.equal(S.echapper, A.echapper, "capacites-suite.js reprend l'utilitaire partagé");
  assert.equal(A.formatEchappe("CLE", { nom: PIEGE, n: 2 }), `CLE nom=${PIEGE_ECHAPPE} n=2`);
});

test("Fureur retirée : nom de l'acteur et de l'effet échappés dans le message du MJ", async () => {
  const epuisement = { id: "e1", name: "Épuisement", flags: { [M]: { fureur: "epuisement" } }, system: { origin: { message: "m1" } } };
  const furie = { id: "e2", name: `Furie ${PIEGE}`, flags: { [M]: { fureur: "elan" } }, system: { origin: { message: "m2" } }, async delete() { this.supprime = true; } };
  const a = acteur({ name: PIEGE, effects: [epuisement, furie] });
  furie.parent = a;
  await rejouer("createActiveEffect", furie, {}, "j1");
  assert.equal(furie.supprime, true, "la Furie est retirée");
  assert.equal(crees.length, 1);
  assert.ok(!crees[0].content.includes("<img"), crees[0].content);
  assert.ok(crees[0].content.includes(`nom=${PIEGE_ECHAPPE}`) && crees[0].content.includes(`effet=Furie ${PIEGE_ECHAPPE}`));
});

test("Lier le familier refusé : noms du familier et de l'utilisateur échappés dans le chuchotement", async () => {
  const familier = acteur({ name: PIEGE, flags: { [M]: { familier: { classe: "ranger" } } } });
  uuids["Scene.s.Token.t"] = { actor: familier };
  const rodeur = acteur({ name: "Rôdeur" });
  const message = {
    type: "usage", author: joueur, user: "j1", system: { targets: [{ token: "Scene.s.Token.t" }] },
    getAssociatedActivity: () => ({ flags: { [M]: { lierFamilier: true } }, item: { actor: rodeur } })
  };
  await sansAvertir(() => rejouer("createChatMessage", message));
  assert.equal(crees.length, 1, "un seul message : le refus");
  assert.ok(!crees[0].content.includes("<img"), crees[0].content);
  assert.ok(crees[0].content.includes(`nom=${PIEGE_ECHAPPE}`) && crees[0].content.includes(`utilisateur=${PIEGE_ECHAPPE}`));
});

test("Phase 2 : nom du boss et de sa capacité échappés", async () => {
  assert.ok(!A.contenuPhase2("phrase", { uuid: "Item.x", name: PIEGE }).includes("<img"));
  const boss = acteur({
    name: PIEGE, uuid: "Actor.b", flags: { [M]: { boss: { phase2: "Phase 2" } } }, system: { attributes: { hp: { value: 10, max: 40 } } },
    getFlag: () => undefined, async setFlag() {}
  });
  await rejouer("updateActor", boss, { system: { attributes: { hp: { value: 10 } } } });
  assert.equal(crees.length, 1);
  assert.ok(!crees[0].content.includes("<img"), crees[0].content);
  assert.ok(crees[0].content.includes(`nom=${PIEGE_ECHAPPE}`));
});

test("Établi : nom du fabricant échappé dans le message de l'issue", async () => {
  const produit = { type: "loot", toObject: () => ({ name: "Potion", system: {} }) };
  uuids["Compendium.x.Item.p"] = produit;
  const fabricant = acteur({
    name: PIEGE, uuid: "Actor.f", isOwner: true, system: { currency: { gp: 10 }, tools: { alch: { value: 1 } } },
    rollToolCheck: async () => ({ total: 15 }), async update() {}, async createEmbeddedDocuments() {}
  });
  const recette = { id: "r", outil: "alch", dd: 10, fournitures: 1, composants: [], consommable: false, produit: { uuid: "Compendium.x.Item.p", nom: "Potion", cle: "potion" } };
  const issue = await E.fabriquer(fabricant, recette);
  assert.equal(issue?.reussite, true);
  assert.equal(crees.length, 1);
  assert.ok(!crees[0].content.includes("<img"), crees[0].content);
  assert.ok(crees[0].content.includes(`nom=${PIEGE_ECHAPPE}`));
});

test("Lien du chasseur : nom du rôdeur échappé dans la description de l'effet", () => {
  assert.equal(typeof C.texteLienChasseur, "function");
  assert.ok(!C.texteLienChasseur(2, PIEGE).includes("<img"));
  assert.ok(C.texteLienChasseur(2, PIEGE).includes(`rodeur=${PIEGE_ECHAPPE}`));
});

// ---------------------------------------------------------------- Cartes forgées par un joueur

test("Fût roulant : une sauvegarde ratée forgée par un autre joueur ne met personne à terre ; celle du propriétaire ou du MJ, oui", async () => {
  const victime = acteur({ name: "Victime", testUserPermission: possedePar("j1") });
  const fut = { flags: { [M]: { aTerre: "echec" } } };
  const sauvegarde = auteur => ({
    id: `m-${auteur.id}`, type: "save", author: auteur, rolls: [{ total: 5, options: { target: 15 } }], system: {},
    getAssociatedActivity: () => ({ item: fut }), getAssociatedActor: () => victime, getAssociatedItem: () => fut
  });
  await sansAvertir(() => rejouer("createChatMessage", sauvegarde(autre)));
  assert.equal(effetsCrees.length, 0, "message forgé : rien");
  await sansAvertir(() => rejouer("createChatMessage", sauvegarde(joueur)));
  assert.equal(effetsCrees.length, 1, "propriétaire : à terre");
  await sansAvertir(() => rejouer("createChatMessage", sauvegarde(mj)));
  assert.equal(effetsCrees.length, 2, "MJ : à terre");
  // Résistance légendaire sur un message d'un tiers : l'état posé pour ce message n'est pas ôté.
  const supprimes = [];
  const cible = acteur({ effects: [{ id: "x", flags: { [M]: { futRoulant: "m-j2" } } }], testUserPermission: possedePar("j1"), async deleteEmbeddedDocuments(_t, ids) { supprimes.push(...ids); } });
  const resiste = { id: "m-j2", type: "save", author: autre, system: { resisted: true }, getAssociatedActor: () => cible };
  await sansAvertir(() => rejouer("updateChatMessage", resiste, { system: { resisted: true } }));
  assert.deepEqual(supprimes, [], "message d'un tiers : rien n'est ôté");
  await sansAvertir(() => rejouer("updateChatMessage", { ...resiste, author: mj }, { system: { resisted: true } }));
  assert.deepEqual(supprimes, ["x"], "message du MJ : l'état est ôté");
});

test("Évasion d'agent : un sort forgé au nom d'un autre ne lui ôte pas son évasion ; le sien, oui", async () => {
  const supprimes = [];
  const agent = acteur({ name: "Agent", effects: [{ id: "ev", flags: { [M]: { evasion: true } } }], testUserPermission: possedePar("j1"),
    async deleteEmbeddedDocuments(_t, ids) { supprimes.push(...ids); } });
  const sort = { type: "spell", actor: agent, system: {} };
  const usage = auteur => ({ type: "usage", author: auteur, system: {}, getAssociatedActivity: () => ({ type: "cast", item: sort }), getAssociatedActor: () => agent });
  await sansAvertir(() => rejouer("createChatMessage", usage(autre)));
  assert.deepEqual(supprimes, [], "message forgé : évasion gardée");
  await sansAvertir(() => rejouer("createChatMessage", usage(joueur)));
  assert.deepEqual(supprimes, ["ev"], "son propre sort : évasion rompue");
});

test("Poigne de la mort : un drapeau « poigne » forgé ne fait pas revenir le jeton d'un autre", async () => {
  const deplacements = [];
  const jeton = { id: "t", name: "Cible", x: 200, y: 0, elevation: 0, testUserPermission: possedePar("j1"), async update(v) { deplacements.push(v); } };
  uuids["Scene.s.Token.t"] = jeton;
  const forge = auteur => ({
    type: "save", author: auteur, system: { resisted: true },
    flags: { [M]: { poigne: { jeton: "Scene.s.Token.t", de: { x: 900, y: 900, elevation: 0 }, vers: { x: 200, y: 0, elevation: 0 } } } },
    async unsetFlag() {}
  });
  await sansAvertir(() => rejouer("updateChatMessage", forge(autre), { system: { resisted: true } }));
  assert.deepEqual(deplacements, [], "message d'un tiers : le jeton ne bouge pas");
  await sansAvertir(() => rejouer("updateChatMessage", forge(mj), { system: { resisted: true } }));
  assert.equal(deplacements.length, 1, "message du MJ : le jeton revient");
});
