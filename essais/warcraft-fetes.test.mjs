// Essais des fêtes de saison de lakour-warcraft (contenu/fetes.mjs, scripts/fetes.js) :
// - enregistrement : les déclinaisons passées au moteur (scripts/fetes.js) disent la même chose que le contenu (nom,
//   description, consigne, décor), le moteur les accepte toutes (normaliserDeclinaison de lakour-mj-ia, sans rien tronquer),
//   une par fête du calendrier, au moins Noël, Nouvel An, Halloween et le solstice (Fête de la musique) ;
// - liens de la carte publique : chaque uuid vise un document fabriqué, avec son nom ; chaque fête lie ses objets et ses
//   tables (8 liens au plus), rien d'autre, et JAMAIS le journal du MJ (un document de compendium prend les droits du
//   compendium : « journaux » est ouvert aux joueurs) ; le journal est lié depuis la page « Fêtes de saison (MJ) » du guide ;
// - journaux : un journal du MJ caché par fête, l'illustration (assets/fetes/<fête du calendrier>.jpg, qui existe) en tête,
//   l'ambiance au Carrefour, à Theramore et dans les kraals, 3 à 5 accroches liées, les gains de réputation ;
// - contrats : même format que les tableaux des villes (type, po, faction connue, 1 à 5 points, en clair et en drapeau) ;
// - objets : 2 à 4 par fête, activités dnd5e 6.0.6 qui citent des effets existants, clés d'effet canoniques, effets
//   appliqués limités dans le temps, distances en mètres, sphère (et non émanation « radius ») pour ce qui se lance au loin,
//   harmonisation pour un effet permanent ; économie : au moins 1 po par point de vie rendu, rien de peu commun dans une
//   table de paquets, et le paquet coûte au moins deux fois la revente moyenne de son contenu ;
// - crédits : CREDITS.md est la sortie du générateur (outils/fabriquer-jetons-warcraft.mjs) et cite les illustrations ;
// - script : enregistre dans chaque navigateur au crochet « lakour-mj-ia.pret », sans erreur sans moteur ni hors dnd5e.
// La batterie est rejouée sur des copies mutées : chaque règle cassée est détectée.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fabriquer, lireDictionnaires, TYPE_PACK } from "../outils/fabriquer-warcraft.mjs";
import { CARACTERISTIQUES, COMPETENCES } from "../modules/lakour-warcraft/contenu/objets.mjs";
import { FETES, TITRE_FETES, illustration } from "../modules/lakour-warcraft/contenu/fetes.mjs";
import { REPUTATIONS } from "../modules/lakour-warcraft/contenu/reputations.mjs";
import { TYPES_CONTRAT } from "../modules/lakour-warcraft/contenu/contrats.mjs";
import { IDS_FETES, MAX_CONTENU, normaliserDeclinaison } from "../modules/lakour-mj-ia/scripts/fetes-logique.js";

// Le script s'accroche au moteur à son chargement : on capte le crochet sur une instance neuve du module (le contenu l'a
// déjà importé, sans Hooks, avant ce code).
const crochets = [];
globalThis.Hooks = { once: (nom, f) => crochets.push({ nom, f }), on: () => {} };
await import("../modules/lakour-warcraft/scripts/fetes.js?crochet");
const { FETES_WARCRAFT, enregistrerFetes, textesDeFete } = await import("../modules/lakour-warcraft/scripts/fetes.js");

const M = "lakour-warcraft";
const RACINE = new URL("../", import.meta.url);
const fabriques = fabriquer();
const texte = h => String(h ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const uuidDe = ({ pack, doc }) => `Compendium.${M}.${pack}.${TYPE_PACK[pack]}.${doc._id}`;
const activites = d => Object.values(d.system?.activities ?? {});
const OBLIGATOIRES = ["noel", "nouvel-an", "halloween", "musique"];
const PACKS_JOUEURS = new Set(JSON.parse(readFileSync(new URL(`modules/${M}/module.json`, RACINE), "utf8")).packs
  .filter(p => (p.ownership?.PLAYER ?? "NONE") !== "NONE").map(p => p.name));

// Clés d'effet canoniques de dnd5e 6.0.6 (mêmes familles que essais/warcraft-tarides-vivantes.test.mjs).
const C = CARACTERISTIQUES.join("|"), S = COMPETENCES.join("|"), D20 = "(bonus|mode|min|max)";
const CLES_EFFET = [
  new RegExp(`^system\\.abilities\\.(${C})\\.(check|save)\\.roll\\.${D20}$`),
  new RegExp(`^system\\.skills\\.(${S})\\.(roll\\.${D20}|bonuses\\.passive)$`),
  new RegExp(`^system\\.rolls\\.attack\\.(mwak|rwak|msak|rsak)\\.${D20}$`),
  /^system\.rolls\.damage\.(mwak|rwak|msak|rsak)\.bonus$/,
  /^system\.attributes\.ac\.bonus$/,
  new RegExp(`^system\\.attributes\\.(init|concentration)\\.roll\\.${D20}$`),
  /^system\.attributes\.movement\.(bonus|speeds\.(walk|swim|fly|climb))$/,
  /^system\.attributes\.hp\.bonuses\.overall$/,
  /^system\.traits\.dr\.value$/
];
const PORTEES = ["", "self", "touch", "m", "km", "spec", "any"];
const TAUX = { pp: 10, gp: 1, ep: 0.5, sp: 0.1, cp: 0.01 };
const prixPo = o => (o.system.price?.value ?? 0) * (TAUX[o.system.price?.denomination] ?? 1);
const PIEDS = /\d\s*(pieds?|pi|ft|feet)\b/i;

// ---------------------------------------------------------------- Vérificateur

function verifier({ docs, fetes, declinaisons, existe }) {
  const erreurs = [];
  const parUuid = new Map(docs.map(d => [uuidDe(d), d]));
  const factions = new Map(REPUTATIONS.map(r => [r.cle, r.nom]));
  const deFete = id => docs.filter(d => d.doc.flags?.[M]?.fete === id);
  const guideFetes = docs.find(d => d.cle === "journaux:guide-du-mj")?.doc.pages.find(p => p.name === "Fêtes de saison (MJ)")?.text.content ?? "";
  if (!guideFetes) erreurs.push("guide du MJ sans page « Fêtes de saison (MJ) »");

  // Enregistrement : le moteur accepte chaque déclinaison telle quelle, une par fête du calendrier.
  const registre = [];
  for (const def of declinaisons) {
    let n;
    try { n = normaliserDeclinaison(structuredClone(def), registre); } catch (e) { erreurs.push(`moteur : ${e.message}`); continue; }
    registre.push(n);
    for (const champ of ["nom", "description", "consigne"]) if (n[champ] !== def[champ]) erreurs.push(`${def.id} : ${champ} tronqué ou retouché par le moteur`);
    if (JSON.stringify(n.decor) !== JSON.stringify(def.decor)) erreurs.push(`${def.id} : décor retouché par le moteur`);
    if (JSON.stringify(n.contenu) !== JSON.stringify(def.contenu)) erreurs.push(`${def.id} : liens retouchés par le moteur`);
  }
  for (const id of OBLIGATOIRES) if (!declinaisons.some(d => d.fete === id)) erreurs.push(`fête du calendrier « ${id} » non déclinée`);
  if (declinaisons.map(d => d.id).join() !== fetes.map(f => f.id).join()) erreurs.push("scripts/fetes.js : fêtes différentes de contenu/fetes.mjs");

  for (const def of declinaisons) {
    const f = fetes.find(x => x.id === def.id);
    if (!f) continue;
    if (!IDS_FETES.includes(def.fete)) erreurs.push(`${def.id} : fête du calendrier inconnue`);

    // Liens de la carte publique : chaque objet et table de la fête, rien d'autre, avec son nom ; jamais un document réservé au
    // MJ (un document de compendium prend les droits du compendium : le journal du MJ serait lisible de tous).
    const propres = deFete(def.id);
    const lies = new Set();
    if (def.contenu.length > MAX_CONTENU) erreurs.push(`${def.id} : ${def.contenu.length} liens`);
    for (const l of def.contenu) {
      const cible = parUuid.get(l.uuid);
      if (!cible) { erreurs.push(`${def.id} : lien introuvable ${l.uuid}`); continue; }
      lies.add(cible.cle);
      if (l.nom !== cible.doc.name) erreurs.push(`${def.id} : libellé « ${l.nom} » au lieu de « ${cible.doc.name} »`);
      if (cible.doc.flags?.[M]?.fete !== def.id) erreurs.push(`${def.id} : lien vers ${cible.cle}, qui n'est pas de la fête`);
      if (!PACKS_JOUEURS.has(cible.pack)) erreurs.push(`${def.id} : ${cible.cle} dans un compendium fermé aux joueurs`);
      if (cible.pack === "journaux" && !(cible.doc.ownership?.default >= 2)) erreurs.push(`${def.id} : la carte publique lie le journal réservé au MJ ${cible.cle}`);
    }
    for (const d of propres.filter(d => d.pack !== "journaux")) if (!lies.has(d.cle)) erreurs.push(`${def.id} : ${d.cle} absent des liens de la fête`);

    // Journal du MJ
    const journaux = propres.filter(d => d.pack === "journaux").map(d => d.doc);
    if (journaux.length !== 1) erreurs.push(`${def.id} : ${journaux.length} journaux`);
    const j = journaux[0];
    if (j) {
      if (j.ownership.default !== 0) erreurs.push(`${def.id} : journal du MJ visible`);
      if (!guideFetes.includes(j._id)) erreurs.push(`${def.id} : journal du MJ non lié depuis la page « Fêtes de saison (MJ) » du guide du MJ`);
      const premiere = j.pages[0]?.text.content ?? "";
      const image = /^<figure[^>]*><img src="([^"]+)" alt="[^"]+"><\/figure>/.exec(premiere)?.[1];
      if (image !== illustration(def.fete)) erreurs.push(`${def.id} : illustration absente de la tête du journal (${image})`);
      else if (!existe(image)) erreurs.push(`${def.id} : illustration introuvable ${image}`);
      const page = nom => j.pages.find(p => p.name === nom)?.text.content ?? "";
      const ambiance = texte(page("Ambiance"));
      for (const lieu of ["Carrefour", "Theramore", "kraal"]) if (!ambiance.includes(lieu)) erreurs.push(`${def.id} : ambiance sans ${lieu}`);
      const accroches = [...page("Accroches").matchAll(/<li>(.*?)<\/li>/g)].map(m => m[1]);
      if (accroches.length < 3 || accroches.length > 5) erreurs.push(`${def.id} : ${accroches.length} accroches`);
      for (const a of accroches) if (!/@UUID\[Compendium\.lakour-warcraft\.[^\]]+\]\{[^}]+\}/.test(a)) erreurs.push(`${def.id} : accroche sans lien (${texte(a).slice(0, 40)})`);
      const tout = texte(j.pages.map(p => p.text.content).join(" "));
      for (const [faction, points] of f.reputation) {
        if (!factions.has(faction)) erreurs.push(`${def.id} : faction de réputation inconnue ${faction}`);
        else if (!tout.includes(`+${points} auprès de : ${factions.get(faction)}`)) erreurs.push(`${def.id} : gain de réputation (${faction}) absent du journal`);
      }
    }

    // Contrats de fête
    const contrats = propres.find(d => d.cle === `tables:fete-${def.id}-contrats`)?.doc;
    if (!contrats) erreurs.push(`${def.id} : pas de table de contrats`);
    else {
      if (contrats.results.length < 2 || contrats.results.length > 3 || contrats.formula !== `1d${contrats.results.length}`) erreurs.push(`${def.id} : table de contrats ${contrats.formula}, ${contrats.results.length} résultats`);
      if (contrats.flags[M].aventure !== TITRE_FETES) erreurs.push(`${contrats.name} : non rattachée aux fêtes`);
      for (const r of contrats.results) {
        const c = r.flags?.[M]?.contrat;
        if (!c || !TYPES_CONTRAT[c.type] || !factions.has(c.faction) || !(c.po > 0) || !(c.reputation >= 1 && c.reputation <= 5)) { erreurs.push(`${r.name} : données de contrat invalides`); continue; }
        const lu = texte(r.description);
        if (!lu.includes(`${c.po} po`) || !lu.includes(`+${c.reputation}`) || !lu.includes(factions.get(c.faction))) erreurs.push(`${r.name} : récompense absente du texte`);
      }
    }
    for (const t of propres.filter(d => d.pack === "tables")) {
      if (t.doc.flags[M].aventure !== TITRE_FETES) erreurs.push(`${t.doc.name} : non rattachée aux fêtes`);
      // Tables à objets (paquets-surprises) : rien de plus que courant ; l'objet qui y tire coûte au moins deux fois la revente
      // moyenne (moitié de la valeur, règle du module) de ce qu'il donne.
      const objets = t.doc.results.filter(r => r.type === "document").map(r => parUuid.get(r.documentUuid)?.doc).filter(o => o?.type);
      for (const o of objets) if (!["", "common"].includes(o.system.rarity)) erreurs.push(`${t.doc.name} : objet ${o.system.rarity} (${o.name})`);
      if (objets.length) {
        const revente = objets.reduce((n, o) => n + prixPo(o) / 2, 0) / t.doc.results.length;
        const tireur = propres.filter(d => d.pack === "objets").map(d => d.doc).find(o => activites(o).some(a => a.roll?.formula === t.doc.formula));
        if (!tireur) erreurs.push(`${t.doc.name} : aucun objet de la fête ne tire sur cette table`);
        else if (prixPo(tireur) < 2 * revente) erreurs.push(`${tireur.name} : ${prixPo(tireur)} po pour ${revente.toFixed(1)} po de revente moyenne`);
      }
    }

    // Objets de fête
    const objets = propres.filter(d => d.pack === "objets").map(d => d.doc);
    if (objets.length < 2 || objets.length > 4) erreurs.push(`${def.id} : ${objets.length} objets`);
    for (const o of objets) {
      const acts = activites(o);
      const effets = new Map((o.effects ?? []).map(e => [e._id, e]));
      if (!acts.length && !(o.effects ?? []).some(e => e.transfer)) erreurs.push(`${o.name} : ni activité ni effet porté`);
      for (const e of o.effects ?? []) {
        for (const c of e.system.changes) if (!CLES_EFFET.some(r => r.test(c.key))) erreurs.push(`${o.name} / ${e.name} : clé d'effet ${c.key}`);
        if (!e.transfer && !(e.duration.value > 0) && !["longRest", "shortRest"].includes(e.duration.expiry)) erreurs.push(`${o.name} / ${e.name} : effet appliqué sans fin`);
      }
      for (const a of acts) {
        for (const ref of a.effects) if (!effets.has(ref._id)) erreurs.push(`${o.name} / ${a.name} : effet cité absent`);
        if (!PORTEES.includes(a.range.units)) erreurs.push(`${o.name} / ${a.name} : portée en « ${a.range.units} »`);
        if (a.target.template.units !== "m") erreurs.push(`${o.name} / ${a.name} : gabarit en « ${a.target.template.units} »`);
        if (a.type === "save" && (!a.save?.ability?.length || !/^\d+$/.test(a.save.dc.formula))) erreurs.push(`${o.name} / ${a.name} : sauvegarde sans DD`);
        if (a.type === "heal" && !(a.healing?.number && a.healing?.denomination)) erreurs.push(`${o.name} / ${a.name} : soin sans dés`);
        if (["save", "utility"].includes(a.type) && !a.effects.length && !a.roll?.formula && !a.damage?.parts?.length) erreurs.push(`${o.name} / ${a.name} : activité sans effet`);
      }
      if (PIEDS.test(texte(o.system.description.value))) erreurs.push(`${o.name} : distance en pieds`);
      if (o.type === "equipment" && o.system.properties.includes("mgc") && (o.effects ?? []).some(e => e.transfer) && o.system.attunement !== "required") erreurs.push(`${o.name} : effet permanent sans harmonisation`);
      for (const a of acts) if (a.range.units === "m" && Number(a.range.value) > 0 && a.target.template.type === "radius") erreurs.push(`${o.name} / ${a.name} : lancé à distance mais gabarit « radius » (émanation autour du lanceur en dnd5e 6.0.6)`);
      for (const a of acts.filter(a => a.type === "heal")) {
        const moyenne = (a.healing.number ?? 0) * ((a.healing.denomination ?? 0) + 1) / 2 + (Number(a.healing.bonus) || 0);
        if (prixPo(o) < moyenne) erreurs.push(`${o.name} : ${prixPo(o)} po pour ${moyenne} PV en moyenne (au moins 1 po par point)`);
      }
      if (o.type === "consumable" && !(Number(o.system.uses.max) >= 1)) erreurs.push(`${o.name} : consommable sans utilisation`);
    }
  }
  return erreurs;
}

const contexte = () => ({
  docs: structuredClone(fabriques), fetes: structuredClone(FETES), declinaisons: structuredClone(FETES_WARCRAFT),
  existe: chemin => chemin.startsWith(`modules/${M}/`) && existsSync(new URL(chemin, RACINE))
});
const trouver = (C, cle) => C.docs.find(d => d.cle === cle).doc;
const activite = (C, cle) => Object.values(trouver(C, cle).system.activities)[0];
const journal = (C, id) => trouver(C, `journaux:fete-${id}`);

const MUTATIONS = {
  "uuid du script altéré"(C) { const l = C.declinaisons[0].contenu[0]; l.uuid = l.uuid.slice(0, -1) + (l.uuid.endsWith("A") ? "B" : "A"); },
  "libellé de lien différent du document"(C) { C.declinaisons[1].contenu[0].nom = "Une lampe"; },
  "objet de fête oublié dans les liens"(C) { C.declinaisons[3].contenu.splice(1, 1); },
  "plus de huit liens"(C) { const c = C.declinaisons[0].contenu; c.push(c[0], c[1], c[2], c[3]); },
  "consigne trop longue"(C) { const d = C.declinaisons[2]; d.consigne = `${d.consigne} ; ${d.consigne}`; C.fetes[2].consigne = d.consigne; },
  "ornement inconnu du moteur"(C) { C.declinaisons[0].decor.ornements = ["sapins"]; C.fetes[0].decor.ornements = ["sapins"]; },
  "deux déclinaisons de la même fête"(C) { C.declinaisons[1].fete = "noel"; C.fetes[1].fete = "noel"; },
  "Halloween non déclinée"(C) { C.declinaisons = C.declinaisons.filter(d => d.fete !== "halloween"); C.fetes = C.fetes.filter(f => f.fete !== "halloween"); },
  "journal du MJ visible"(C) { journal(C, "veille-des-aieux").ownership.default = 2; },
  "illustration retirée"(C) { const p = journal(C, "treve-des-presents").pages[0]; p.text.content = p.text.content.replace(/^<figure.*?<\/figure>/, ""); },
  "illustration vers un fichier absent"(C) { C.existe = () => false; },
  "illustration d'une autre fête"(C) { const p = journal(C, "nuit-des-calebasses").pages[0]; p.text.content = p.text.content.replace("fetes/halloween.jpg", "fetes/noel.jpg"); },
  "ambiance sans les kraals"(C) { const p = journal(C, "tambours-du-long-jour").pages[1]; p.text.content = p.text.content.replaceAll("kraal", "camp"); },
  "deux accroches seulement"(C) { const p = journal(C, "mascarade-de-cabestan").pages[2]; p.text.content = `<ul>${[...p.text.content.matchAll(/<li>.*?<\/li>/g)].slice(0, 2).map(m => m[0]).join("")}</ul>`; },
  "accroche sans lien"(C) { const p = journal(C, "veille-des-aieux").pages[2]; p.text.content = p.text.content.replace(/<li>.*?<\/li>/, "<li>Une rumeur sans suite.</li>"); },
  "gain de réputation effacé du journal"(C) { const p = journal(C, "treve-des-presents").pages[0]; p.text.content = p.text.content.replace("auprès de : Alliance (Theramore)", "auprès de : quelqu'un"); },
  "contrat de fête à faction inconnue"(C) { trouver(C, "tables:fete-nuit-des-calebasses-contrats").results[0].flags[M].contrat.faction = "lame-ardente"; },
  "récompense de contrat effacée du texte"(C) { trouver(C, "tables:fete-veille-des-aieux-contrats").results[1].description = "<p>Rien.</p>"; },
  "table de fête non rattachée"(C) { delete trouver(C, "tables:fete-treve-des-presents-paquets").flags[M].aventure; },
  "objet sans activité"(C) { trouver(C, "objets:fusee-gobeline-du-long-jour").system.activities = {}; },
  "activité qui cite un effet absent"(C) { activite(C, "objets:calebasse-lanterne").effects[0]._id = "absentabsentabse"; },
  "clé d'effet non canonique"(C) { trouver(C, "objets:tambourin-du-long-jour").effects[0].system.changes[0].key = "system.attributes.movement.walk"; },
  "effet appliqué sans fin"(C) { const e = trouver(C, "objets:infusion-de-fleur-de-braise").effects[0]; e.duration.value = null; },
  "portée en pieds"(C) { activite(C, "objets:sachet-de-confettis-gobelins").range.units = "ft"; },
  "gabarit en pieds"(C) { activite(C, "objets:fusee-gobeline-du-long-jour").target.template.units = "ft"; },
  "texte en pieds"(C) { const o = trouver(C, "objets:grelot-de-l-epineux"); o.system.description.value += "<p>Portée 30 pieds.</p>"; },
  "journal du MJ lié par la carte publique"(C) { const j = journal(C, "nuit-des-calebasses"); C.declinaisons[2].contenu.push({ uuid: `Compendium.${M}.journaux.JournalEntry.${j._id}`, nom: j.name }); },
  "journal de fête absent du guide du MJ"(C) { const p = trouver(C, "journaux:guide-du-mj").pages.find(x => x.name === "Fêtes de saison (MJ)"); p.text.content = p.text.content.replace(journal(C, "veille-des-aieux")._id, "absentabsentabse"); },
  "masque sans harmonisation"(C) { trouver(C, "objets:masque-de-la-mascarade").system.attunement = ""; },
  "confettis en émanation autour du lanceur"(C) { activite(C, "objets:sachet-de-confettis-gobelins").target.template.type = "radius"; },
  "grelot peu commun dans les paquets"(C) { trouver(C, "tables:fete-treve-des-presents-paquets").results[7].documentUuid = `Compendium.${M}.objets.Item.${trouver(C, "objets:grelot-de-l-epineux")._id}`; },
  "paquet-surprise bradé"(C) { trouver(C, "objets:paquet-surprise-du-cartel").system.price = { value: 1, denomination: "gp" }; },
  "sucre de cactus à 5 pc"(C) { trouver(C, "objets:sucre-de-cactus").system.price = { value: 5, denomination: "cp" }; },
  "sauvegarde sans DD"(C) { activite(C, "objets:calebasse-lanterne").save.dc.formula = ""; }
};

// ---------------------------------------------------------------- Essais

test("fêtes : le contenu et les déclinaisons passent toute la batterie", () => {
  assert.deepEqual(verifier(contexte()), []);
});

test("fêtes : chaque règle cassée est détectée", () => {
  const passees = Object.entries(MUTATIONS).filter(([, muter]) => { const c = contexte(); muter(c); return !verifier(c).length; }).map(([nom]) => nom);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

test("fêtes : cinq fêtes (Noël, Nouvel An, Halloween, solstice, Carnaval), chacune avec journal, contrats et objets", () => {
  assert.deepEqual(FETES_WARCRAFT.map(d => d.fete), ["noel", "nouvel-an", "halloween", "musique", "carnaval"]);
  const docs = fabriques.filter(d => d.doc.flags?.[M]?.fete);
  assert.equal(docs.filter(d => d.pack === "journaux").length, 5);
  assert.equal(docs.filter(d => d.pack === "tables").length, 6, "cinq tables de contrats et les paquets-surprises");
  assert.equal(docs.filter(d => d.pack === "objets").length, 12);
  assert.equal(docs.filter(d => d.cle.startsWith("tables:fete-") && d.cle.endsWith("-contrats")).flatMap(d => d.doc.results).length, 15);
  // Le guide du MJ présente les fêtes et lie leurs journaux.
  const guide = fabriques.find(d => d.cle === "journaux:guide-du-mj").doc;
  const page = guide.pages.find(p => p.name === "Fêtes de saison (MJ)");
  assert.ok(page, "page des fêtes absente du guide du MJ");
  for (const j of docs.filter(d => d.pack === "journaux")) assert.ok(page.text.content.includes(j.doc._id), `${j.doc.name} non lié du guide`);
});

test("fêtes : les illustrations existent, une par fête du calendrier déclinée", () => {
  for (const d of FETES_WARCRAFT) assert.ok(existsSync(new URL(illustration(d.fete), RACINE)), illustration(d.fete));
});

test("fêtes : le script s'accroche à « lakour-mj-ia.pret » et main.js le charge", () => {
  assert.deepEqual(crochets.map(c => c.nom), ["lakour-mj-ia.pret"]);
  const main = readFileSync(new URL(`modules/${M}/scripts/main.js`, RACINE), "utf8");
  assert.match(main, /^import \{ enregistrerFetes \} from "\.\/fetes\.js";/m);
  const enregistrees = [];
  crochets[0].f({ fetes: { enregistrer: d => enregistrees.push(d.id), lister: () => [] } });
  // Hors de Foundry, game n'existe pas : le crochet ne fait rien (le système n'est pas dnd5e).
  assert.deepEqual(enregistrees, []);
});

test("fêtes : enregistrement dans chaque navigateur, défensif sans moteur, hors dnd5e ou en cas de refus", () => {
  const jeu = { system: { id: "dnd5e" } };
  // Un registre qui suit les règles du moteur (doublons refusés).
  const moteur = () => {
    const registre = [];
    return { registre, fetes: { enregistrer: d => { registre.push(normaliserDeclinaison(d, registre)); return registre.at(-1); }, lister: () => registre.map(d => ({ ...d })) } };
  };
  const api = moteur();
  assert.equal(enregistrerFetes(api, jeu), FETES_WARCRAFT.length);
  assert.deepEqual(api.registre.map(d => d.id), FETES_WARCRAFT.map(d => d.id));
  assert.equal(enregistrerFetes(api, jeu), FETES_WARCRAFT.length, "second appel : rien de plus, sans erreur");
  assert.equal(api.registre.length, FETES_WARCRAFT.length);
  // Le moteur reçoit des copies : il ne peut pas abîmer les définitions du module.
  api.registre[0].contenu.length = 0;
  assert.ok(FETES_WARCRAFT[0].contenu.length > 0);

  assert.equal(enregistrerFetes(moteur(), { system: { id: "pf2e" } }), 0, "hors dnd5e");
  assert.equal(enregistrerFetes(undefined, jeu), 0, "moteur absent");
  assert.equal(enregistrerFetes({}, jeu), 0, "moteur sans fêtes (avant 0.36)");
  assert.equal(enregistrerFetes(moteur(), undefined), 0, "hors de Foundry");

  // Une fête déjà déclinée par un autre module : refusée par le moteur, écrite en console, les autres passent.
  const occupe = moteur();
  occupe.fetes.enregistrer({ id: "autre-noel", fete: "noel" });
  const avertir = console.warn;
  const avis = [];
  console.warn = (...a) => avis.push(a);
  try {
    assert.equal(enregistrerFetes(occupe, jeu), FETES_WARCRAFT.length - 1);
  } finally { console.warn = avertir; }
  assert.equal(avis.length, 1);
  assert.match(String(avis[0][1]?.message), /déjà déclinée/);
});

test("version : module 0.11.0, contenu 0.11.0", () => {
  const module = JSON.parse(readFileSync(new URL(`modules/${M}/module.json`, RACINE), "utf8"));
  const main = readFileSync(new URL(`modules/${M}/scripts/main.js`, RACINE), "utf8");
  assert.equal(module.version, "0.11.0");
  assert.equal(/const VERSION_CONTENU = "([^"]+)"/.exec(main)?.[1], "0.11.0");
});

test("fêtes : scripts/fetes.js est la source unique, contenu/fetes.mjs l'importe", () => {
  const contenu = readFileSync(new URL(`modules/${M}/contenu/fetes.mjs`, RACINE), "utf8");
  assert.match(contenu, /^import \{ FETES_WARCRAFT, illustrationDeFete \} from "\.\.\/scripts\/fetes\.js";/m);
  for (const d of FETES_WARCRAFT) for (const champ of ["description", "consigne"]) assert.ok(!contenu.includes(d[champ]), `${d.id} : ${champ} recopiée dans le contenu`);
  for (const [i, d] of FETES_WARCRAFT.entries()) {
    for (const champ of ["id", "fete", "nom", "description", "consigne"]) assert.equal(FETES[i][champ], d[champ]);
    assert.deepEqual(FETES[i].decor, d.decor);
  }
});

test("crédits : CREDITS.md est la sortie du générateur et cite les illustrations générées localement", async () => {
  const { credits, listeJetons } = await import("../outils/fabriquer-jetons-warcraft.mjs");
  const fichier = readFileSync(new URL(`modules/${M}/CREDITS.md`, RACINE), "utf8");
  assert.equal(fichier, credits(listeJetons()), "CREDITS.md différent de la sortie de outils/fabriquer-jetons-warcraft.mjs");
  assert.match(fichier, /`assets\/monde\/fond\.jpg`/);
  assert.match(fichier, /`assets\/fetes\/\*\.jpg`/);
  assert.match(fichier, /ComfyStudio \(FLUX\.2 klein 9B\), sans service distant, pour un usage non commercial/);
});

// ---------------------------------------------------------------- Version anglaise (module lakour-warcraft-en)
test("fêtes : bloc « en » de chaque fête — textes anglais, mêmes liens sous leur nom du dictionnaire, acceptés par le moteur ; français dans node", async () => {
  const { MAX_DESCRIPTION, MAX_CONSIGNE } = await import("../modules/lakour-mj-ia/scripts/fetes-logique.js");
  const { dictionnaire } = lireDictionnaires();
  const src = readFileSync(new URL(`modules/${M}/scripts/fetes.js`, RACINE), "utf8");
  assert.match(src, /enregistrer\(structuredClone\(textesDeFete\(def\)\)\)/, "enregistrerFetes passe la fête dans la langue du module");
  for (const f of FETES_WARCRAFT) {
    assert.equal(textesDeFete(f), f, "dans node (module français), la fête reste française");
    const t = textesDeFete(f, true);
    assert.ok(!("en" in t));
    assert.deepEqual([t.id, t.fete, t.decor, t.contenu.map(l => l.uuid)], [f.id, f.fete, f.decor, f.contenu.map(l => l.uuid)], `${f.id} : clé, fête, décor et uuid inchangés`);
    assert.ok(t.nom !== f.nom && t.description !== f.description && t.consigne !== f.consigne, `${f.id} : textes traduits`);
    assert.ok(t.description.length <= MAX_DESCRIPTION, `${f.id} : description de ${t.description.length} caractères`);
    assert.ok(t.consigne.length >= 60 && t.consigne.length <= MAX_CONSIGNE, `${f.id} : consigne de ${t.consigne.length} caractères`);
    assert.match(t.consigne, /Barrens|Ratchet|Crossroads|Theramore/, `${f.id} : la consigne ne situe pas la fête`);
    assert.ok(!/[àâçéèêëîïôûùüÿœ]/i.test(`${t.nom} ${t.consigne} ${t.contenu.map(l => l.nom).join(" ")}`), `${f.id} : du français dans l'anglais`);
    for (const l of t.contenu) {
      const [, pack, , id] = /^Compendium\.[\w-]+\.(\w+)\.(\w+)\.(\w{16})$/.exec(l.uuid);
      assert.equal(l.nom, dictionnaire[`${pack}/${id}`]?.name?.en, `${f.id} : ${l.uuid} sous son nom anglais`);
    }
    // Le journal du MJ de la fête porte le même nom anglais (dictionnaire des journaux : « Festival — <nom> (GM) »).
    assert.ok(Object.values(dictionnaire).some(e => e.name?.en === `Festival — ${t.nom} (GM)`), `${f.id} : journal « Festival — ${t.nom} (GM) » absent du dictionnaire`);
    const d = normaliserDeclinaison(structuredClone(t), []);
    assert.equal(d.description, t.description, `${f.id} : description tronquée`);
    assert.equal(d.consigne, t.consigne, `${f.id} : consigne tronquée`);
    assert.deepEqual(d.contenu.map(l => l.nom), t.contenu.map(l => l.nom));
  }
});
