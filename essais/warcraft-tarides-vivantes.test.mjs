// Essais des suppléments « Tarides vivantes » (lot 1) de lakour-warcraft :
// - tableaux des contrats : une table par plaque tournante, les cinq types, une récompense en po et en réputation d'une
//   faction connue, en clair dans le texte et dans flags.lakour-warcraft.contrat ;
// - donjon de Mèche-Noire : trois boss avec actions légendaires (coût payé sur resources.legact) et de repaire, résistance
//   légendaire à l'identifiant que cherche dnd5e, une phase 2 annoncée à la moitié exacte des PV et qui s'applique un
//   effet valide, une table de butin par boss, plusieurs qualités (raretés), un ensemble de deux pièces ; journal de
//   rencontre visible, journal du MJ caché ;
// - montures : cinq acteurs, vitesse, capacité de charge annoncée = Force × 7,5 kg × facteur de taille ;
// - consommables : Furie sanguinaire et Héroïsme une fois par combat avec Épuisement de 10 minutes, repas jusqu'au repos
//   long, flacons de 8 heures, clés d'effet canoniques de dnd5e 6.0.6 ;
// - rares : une table par zone, trois créatures nommées chacune avec un butin garanti lié dans sa note du MJ ;
// - réputation : guide visible (paliers Haï → Exalté, une page par faction) et horloges créées par l'installateur, de
//   façon défensive (scripts/main.js, même liste que contenu/reputations.mjs).
// La batterie est rejouée sur des copies mutées : chaque règle cassée est détectée.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { fabriquer } from "../outils/fabriquer-warcraft.mjs";
import { CARACTERISTIQUES, COMPETENCES } from "../modules/lakour-warcraft/contenu/objets.mjs";
import { REPUTATIONS, PALIERS } from "../modules/lakour-warcraft/contenu/reputations.mjs";
import { TYPES_CONTRAT } from "../modules/lakour-warcraft/contenu/contrats.mjs";
import { chargeKg } from "../modules/lakour-warcraft/contenu/montures.mjs";

globalThis.foundry ??= { applications: { api: { ApplicationV2: class {}, HandlebarsApplicationMixin: c => c, DialogV2: {} } }, utils: {} };
globalThis.Hooks ??= { once() {}, on() {} };
const { REPUTATIONS_INSTALLEES, PALIERS_REPUTATION, assurerReputations, reputationsAuChargement } = await import("../modules/lakour-warcraft/scripts/main.js");

const M = "lakour-warcraft";
const fabriques = fabriquer();
const cleDe = d => d.flags?.[M]?.cle;
const texte = html => String(html ?? "").replace(/<[^>]+>/g, " ");

// Clés d'effet canoniques de dnd5e 6.0.6 (mêmes familles que essais/warcraft-arsenal.test.mjs).
const C = CARACTERISTIQUES.join("|"), S = COMPETENCES.join("|"), D20 = "(bonus|mode|min|max)";
const CLES_EFFET = [
  new RegExp(`^system\\.abilities\\.(${C})\\.(check|save)\\.roll\\.${D20}$`),
  new RegExp(`^system\\.skills\\.(${S})\\.(roll\\.${D20}|bonuses\\.passive)$`),
  new RegExp(`^system\\.rolls\\.attack\\.(mwak|rwak|msak|rsak)\\.${D20}$`),
  /^system\.rolls\.damage\.(mwak|rwak|msak|rsak)\.bonus$/,
  /^system\.attributes\.ac\.bonus$/,
  new RegExp(`^system\\.attributes\\.(init|concentration)\\.roll\\.${D20}$`),
  /^system\.attributes\.movement\.(bonus|speeds\.(walk|swim|fly|climb))$/,
  /^system\.attributes\.senses\.ranges\.darkvision$/,
  /^system\.attributes\.hp\.bonuses\.overall$/,
  /^system\.traits\.dr\.value$/
];
const effetsInvalides = docs => docs.flatMap(d => (d.effects ?? []).flatMap(e => e.system.changes
  .filter(c => !CLES_EFFET.some(r => r.test(c.key))).map(c => `${d.name} / ${e.name} : ${c.key}`)));
const activites = d => Object.values(d.system?.activities ?? {});

// ---------------------------------------------------------------- Vérificateur

function verifier({ docs, reputations, installees }) {
  const erreurs = [];
  const parCle = new Map(docs.map(d => [d.cle, d.doc]));
  const parUuid = new Map(docs.map(d => [`Compendium.${M}.${d.pack}.${{ objets: "Item", bestiaire: "Actor", tables: "RollTable", journaux: "JournalEntry" }[d.pack]}.${d.doc._id}`, d]));
  const factions = new Set(reputations.map(r => r.cle));
  const doc = cle => parCle.get(cle) ?? (erreurs.push(`${cle} absent`), null);

  // Contrats
  for (const ville of ["cabestan", "le-carrefour", "theramore"]) {
    const t = doc(`tables:contrats-${ville}`);
    if (!t) continue;
    if (t.formula !== `1d${t.results.length}`) erreurs.push(`${t.name} : formule ${t.formula}`);
    const types = new Set();
    for (const r of t.results) {
      const c = r.flags?.[M]?.contrat;
      if (!c) { erreurs.push(`${t.name} / ${r.name} : données de contrat absentes`); continue; }
      types.add(c.type);
      if (!TYPES_CONTRAT[c.type]) erreurs.push(`${r.name} : type ${c.type}`);
      if (!factions.has(c.faction)) erreurs.push(`${r.name} : faction ${c.faction} inconnue`);
      if (!(c.po > 0) || !(c.reputation >= 1 && c.reputation <= 5)) erreurs.push(`${r.name} : récompense ${c.po} po / ${c.reputation}`);
      const nom = reputations.find(f => f.cle === c.faction)?.nom;
      const lu = texte(r.description);
      if (!lu.includes(`${c.po} po`) || !lu.includes(`+${c.reputation}`) || !lu.includes(nom)) erreurs.push(`${r.name} : récompense absente du texte`);
    }
    for (const type of Object.keys(TYPES_CONTRAT)) if (!types.has(type)) erreurs.push(`${t.name} : aucun contrat de type ${type}`);
  }
  const tableau = doc("journaux:tableau-des-contrats");
  if (tableau && (tableau.ownership.default !== 0 || !/trois/i.test(texte(tableau.pages[0]?.text.content)))) erreurs.push("Tableau des contrats : journal du MJ qui explique le tirage de trois contrats");

  // Boss du donjon
  for (const cle of ["grokka-deux-cles", "mere-brasier", "baron-nizzel-baille-fonds"]) {
    const b = doc(`bestiaire:${cle}`);
    if (!b) continue;
    const { legact, legres, lair } = b.system.resources ?? {};
    if (!(legact?.max >= 2) || !(legres?.max >= 1) || lair?.value !== true || !lair.initiative) erreurs.push(`${b.name} : ressources légendaires`);
    const acts = b.items.flatMap(i => activites(i).map(a => ({ i, a })));
    const legendaires = acts.filter(x => x.a.activation.type === "legendary");
    if (legendaires.length < 2) erreurs.push(`${b.name} : moins de deux actions légendaires`);
    if (legendaires.some(x => !(x.a.activation.value >= 1 && x.a.activation.value <= legact?.max))) erreurs.push(`${b.name} : coût d'action légendaire invalide`);
    if (!acts.some(x => x.a.activation.type === "lair")) erreurs.push(`${b.name} : aucune action de repaire`);
    if (b.items.find(i => i.name.startsWith("Résistance légendaire"))?.system.identifier !== "legendary-resistance") erreurs.push(`${b.name} : résistance légendaire mal identifiée`);
    const phase = b.items.find(i => i.name.startsWith("Phase 2"));
    const moitie = Math.floor(b.system.attributes.hp.max / 2);
    if (!phase) erreurs.push(`${b.name} : pas de phase 2`);
    else {
      if (!texte(phase.system.description.value).includes(`${moitie} points de vie`)) erreurs.push(`${b.name} : phase 2 pas annoncée à ${moitie} PV`);
      const effet = phase.effects?.[0];
      const act = activites(phase)[0];
      if (!effet || effet.transfer !== false || !act?.effects?.some(e => e._id === effet._id)) erreurs.push(`${b.name} : la phase 2 ne s'applique pas d'effet`);
      erreurs.push(...effetsInvalides([phase]));
    }
    if (!/zone/i.test(texte(b.system.details.biography.value) + b.items.map(i => texte(i.system.description.value)).join(" "))) erreurs.push(`${b.name} : aucune zone au sol décrite`);
    const butin = doc(`tables:butin-${cle === "baron-nizzel-baille-fonds" ? "baron-nizzel" : cle}`);
    if (butin && butin.results.some(r => r.type !== "document" || parUuid.get(r.documentUuid)?.pack !== "objets")) erreurs.push(`${butin.name} : résultat qui n'est pas un objet`);
  }
  const butins = ["butin-grokka-deux-cles", "butin-mere-brasier", "butin-baron-nizzel"].map(c => parCle.get(`tables:${c}`)).filter(Boolean);
  const raretes = new Set(butins.flatMap(t => t.results.map(r => parUuid.get(r.documentUuid)?.doc.system.rarity)).filter(Boolean));
  if (raretes.size < 3) erreurs.push(`butin du donjon : ${raretes.size} qualités seulement`);
  const gantelets = doc("objets:gantelets-ignifuges-du-contremaitre"), lunettes = doc("objets:lunettes-de-surete-du-contremaitre");
  const ensemble = lunettes?.effects.find(e => e.name.includes("(2 pièces)"));
  if (!ensemble || ensemble.disabled !== true || ensemble.transfer !== true || !ensemble.system.changes.length) erreurs.push("ensemble : effet de bonus des deux pièces absent ou allumé d'office");
  for (const piece of [gantelets, lunettes]) if (piece && !texte(piece.system.description.value).includes("2 pièces")) erreurs.push(`${piece.name} : bonus d'ensemble non décrit`);
  const tableauButin = new Set(butins.flatMap(t => t.results.map(r => r.documentUuid)));
  for (const piece of [gantelets, lunettes]) if (piece && ![...tableauButin].some(u => u.endsWith(piece._id))) erreurs.push(`${piece.name} : absent des tables de butin`);
  const rencontre = doc("journaux:journal-de-rencontre-meche-noire"), mj = doc("journaux:donjon-meche-noire");
  if (rencontre && (rencontre.ownership.default !== 2 || rencontre.pages.length < 4)) erreurs.push("journal de rencontre : visible, une page par boss");
  if (mj && mj.ownership.default !== 0) erreurs.push("journal du MJ du donjon visible");

  // Montures
  const FACTEUR = { lg: "G", huge: "TG", med: "M" };
  for (const cle of ["belier-de-forgefer", "loup-de-guerre", "kodo", "raptor", "hippogriffe"]) {
    const m = doc(`bestiaire:monture-${cle}`);
    if (!m) continue;
    if (!(Number(m.system.attributes.movement.walk) > 0)) erreurs.push(`${m.name} : vitesse`);
    const attendu = chargeKg(m.system.abilities.str.value, FACTEUR[m.system.traits.size]);
    const lu = m.items.map(i => texte(i.system.description.value)).join(" ");
    if (!lu.includes(`Capacité de charge : ${String(attendu).replace(".", ",")} kg`)) erreurs.push(`${m.name} : capacité de charge ${attendu} kg non annoncée`);
  }
  const routes = doc("journaux:routes-aeriennes-des-tarides");
  if (routes && (routes.ownership.default !== 2 || !/\d+ po, \d+ heures/.test(texte(routes.pages.map(p => p.text.content).join(" "))))) erreurs.push("routes aériennes : journal visible avec prix et durées");

  // Consommables
  for (const cle of ["tambours-de-furie-sanguinaire", "cristal-d-heroisme"]) {
    const o = doc(`objets:${cle}`);
    if (!o) continue;
    const [elan, epuisement] = o.effects;
    if (o.system.uses.recovery?.[0]?.period !== "initiative" || String(o.system.uses.max) !== "1") erreurs.push(`${o.name} : pas une fois par combat`);
    if (elan?.duration.value !== 60 || epuisement?.duration.value !== 600 || epuisement.name !== "Épuisement de la fureur") erreurs.push(`${o.name} : effet ou épuisement mal réglé`);
    if (!activites(o).some(a => a.effects.length === 2)) erreurs.push(`${o.name} : l'activité n'applique pas les deux effets`);
  }
  const repas = docs.filter(d => d.pack === "objets" && d.doc.system.type?.value === "food" && d.doc.flags[M].collection === "consommables").map(d => d.doc);
  if (repas.length < 2 || repas.some(r => r.effects[0]?.duration.expiry !== "longRest")) erreurs.push("repas : bien nourri jusqu'au repos long");
  const flacons = docs.filter(d => d.pack === "objets" && d.cle.startsWith("objets:flacon-")).map(d => d.doc);
  if (flacons.length < 3 || flacons.some(f => f.effects[0]?.duration.value !== 28800)) erreurs.push("flacons : au moins trois, de 8 heures");
  erreurs.push(...effetsInvalides(docs.filter(d => d.pack === "objets" && d.doc.flags[M].collection).map(d => d.doc)));

  // Rares
  for (const zone of ["nord-des-tarides", "cote-des-tarides", "frontiere-du-sud"]) {
    const t = doc(`tables:rares-${zone}`);
    if (!t) continue;
    const acteurs = t.results.filter(r => r.type === "document").map(r => parUuid.get(r.documentUuid)?.doc);
    if (acteurs.length < 3 || acteurs.some(a => a?.type !== "npc")) erreurs.push(`${t.name} : il faut au moins trois créatures nommées`);
    for (const a of acteurs.filter(Boolean)) {
      const lien = /Butin garanti :\*?\*? ?@UUID\[([^\]]+)\]/.exec(a.flags[M].mj)?.[1];
      if (a.flags[M].role !== "elite") erreurs.push(`${a.name} : pas une élite`);
      if (!lien || parUuid.get(lien)?.pack !== "objets") erreurs.push(`${a.name} : butin garanti absent ou introuvable`);
    }
  }

  // Réputation
  const guide = doc("journaux:guide-de-la-reputation");
  if (guide) {
    if (guide.ownership.default !== 2) erreurs.push("guide de la réputation caché");
    const premier = texte(guide.pages[0].text.content);
    for (const p of PALIERS) if (!premier.includes(p.nom)) erreurs.push(`guide : palier ${p.nom} absent`);
    for (const r of reputations) if (!guide.pages.some(p => p.name === r.nom)) erreurs.push(`guide : pas de page pour ${r.nom}`);
  }
  const installe = installees.map(([cle]) => cle).join();
  if (installe !== reputations.map(r => r.cle).join()) erreurs.push("scripts/main.js : réputations installées différentes de contenu/reputations.mjs");
  return erreurs;
}

const contexte = () => ({ docs: structuredClone(fabriques), reputations: structuredClone(REPUTATIONS), installees: structuredClone(REPUTATIONS_INSTALLEES) });
const trouver = (C, cle) => C.docs.find(d => d.cle === cle).doc;

const MUTATIONS = {
  "contrat sans faction connue"(C) { trouver(C, "tables:contrats-cabestan").results[0].flags[M].contrat.faction = "lame-ardente"; },
  "récompense effacée du texte"(C) { trouver(C, "tables:contrats-theramore").results[2].description = "<p>Rien.</p>"; },
  "tableau sans livraison"(C) { const t = trouver(C, "tables:contrats-le-carrefour"); for (const r of t.results) if (r.flags[M].contrat.type === "livraison") r.flags[M].contrat.type = "traque"; },
  "boss sans action légendaire"(C) { trouver(C, "bestiaire:grokka-deux-cles").system.resources.legact.max = 0; },
  "coût d'action légendaire trop élevé"(C) { for (const i of trouver(C, "bestiaire:mere-brasier").items) for (const a of Object.values(i.system.activities ?? {})) if (a.activation.type === "legendary") a.activation.value = 5; },
  "phase 2 annoncée au mauvais seuil"(C) { const b = trouver(C, "bestiaire:baron-nizzel-baille-fonds"); b.system.attributes.hp.max = 140; },
  "phase 2 sans effet"(C) { trouver(C, "bestiaire:mere-brasier").items.find(i => i.name.startsWith("Phase 2")).effects = []; },
  "bonus d'ensemble allumé d'office"(C) { trouver(C, "objets:lunettes-de-surete-du-contremaitre").effects[1].disabled = false; },
  "monture à la charge fausse"(C) { trouver(C, "bestiaire:monture-kodo").system.abilities.str.value = 20; },
  "Furie relançable sans épuisement"(C) { trouver(C, "objets:tambours-de-furie-sanguinaire").effects[1].duration.value = 6; },
  "repas qui ne finit pas au repos long"(C) { trouver(C, "objets:ragout-de-kodo-epice").effects[0].duration.expiry = null; },
  "ancienne clé d'effet redirigée"(C) { trouver(C, "objets:flacon-de-peau-de-pierre").effects[0].system.changes[0].key = "system.attributes.ac.value"; },
  "rare sans butin garanti"(C) { const a = trouver(C, "bestiaire:rare-gueule-de-fer"); a.flags[M].mj = a.flags[M].mj.replace(/@UUID\[[^\]]+\]/g, ""); },
  "guide de la réputation sans palier Exalté"(C) { const p = trouver(C, "journaux:guide-de-la-reputation").pages[0]; p.text.content = p.text.content.replaceAll("Exalté", "Glorieux"); },
  "installateur qui oublie une faction"(C) { C.installees.pop(); }
};

test("Tarides vivantes : le contenu passe toute la batterie", () => {
  assert.deepEqual(verifier(contexte()), []);
});

test("Tarides vivantes : chaque règle cassée est détectée", () => {
  const passees = Object.entries(MUTATIONS).filter(([, muter]) => { const C = contexte(); muter(C); return !verifier(C).length; }).map(([nom]) => nom);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

test("Tarides vivantes : dix factions suivies, trente contrats, trois boss, cinq montures, neuf rares", () => {
  assert.equal(REPUTATIONS.length, 10);
  const docs = fabriques.map(d => d.doc);
  const contrats = docs.filter(d => cleDe(d)?.startsWith("contrats-")).flatMap(t => t.results);
  assert.equal(contrats.length, 30);
  assert.equal(docs.filter(d => d.type === "npc" && d.flags[M].collection === "donjon-meche-noire").length, 3);
  assert.equal(docs.filter(d => d.type === "npc" && d.flags[M].collection === "montures").length, 5);
  assert.equal(docs.filter(d => d.type === "npc" && d.flags[M].collection === "rares").length, 9);
});

test("installateur : une horloge de réputation par faction, sans erreur si le moteur ne sait pas encore le faire", async () => {
  const appels = [];
  const jeu = api => ({ modules: { get: id => (id === "lakour-mj-ia" ? { api } : undefined) } });
  assert.equal(await assurerReputations(jeu({ horloges: { assurer: async o => { appels.push(o); } } })), REPUTATIONS.length);
  assert.deepEqual(appels[0], { id: "rep-alliance", nom: "Alliance (Theramore)", type: "reputation", valeur: 0, visible: true, faction: "alliance",
    paliers: PALIERS_REPUTATION });
  assert.deepEqual(appels.map(a => a.faction), REPUTATIONS.map(r => r.cle));
  assert.equal(await assurerReputations(jeu(undefined)), 0, "moteur sans API");
  assert.equal(await assurerReputations({ modules: { get: () => undefined } }), 0, "moteur absent");
  assert.equal(await assurerReputations(undefined), 0, "hors de Foundry");
  const avertir = console.warn;
  console.warn = () => {};
  try {
    assert.equal(await assurerReputations(jeu({ horloges: { assurer: async () => { throw new Error("pas encore"); } } })), 0, "API qui échoue");
  } finally { console.warn = avertir; }
});

test("chargement : le MJ actif assure les réputations dès que le moteur annonce son API, une seule fois à la fois", async () => {
  const mj = { id: "mj" };
  const appels = [];
  const api = { horloges: { assurer: async o => { appels.push(o.id); } } };
  const jeu = (user, systeme = "dnd5e") => ({ user, users: { activeGM: mj }, system: { id: systeme }, modules: { get: () => undefined } });
  const [a, b] = await Promise.all([reputationsAuChargement(jeu(mj), api), reputationsAuChargement(jeu(mj), api)]);
  assert.deepEqual([a, b], [REPUTATIONS.length, REPUTATIONS.length]);
  assert.equal(appels.length, REPUTATIONS.length, "deux appels simultanés ne font qu'un passage");
  assert.equal(await reputationsAuChargement(jeu({ id: "joueur" }), api), 0, "pas chez un joueur");
  assert.equal(await reputationsAuChargement(jeu(mj, "pf2e"), api), 0, "pas hors dnd5e");
  assert.equal(await reputationsAuChargement(jeu(mj)), 0, "moteur sans API : rien, sans erreur");
  assert.equal(await reputationsAuChargement(undefined), 0, "hors de Foundry");
});

test("installateur : les paliers passés au moteur sont ceux du Guide de la réputation", () => {
  assert.deepEqual(PALIERS_REPUTATION.map(p => p.nom), PALIERS.map(p => p.nom));
  assert.deepEqual(PALIERS_REPUTATION.slice(1).map(p => p.min), PALIERS.slice(1).map(p => p.min));
  assert.ok(PALIERS_REPUTATION[0].min < PALIERS[0].max, "Haï commence sous son plafond");
});
