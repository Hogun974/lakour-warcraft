// Essais de la campagne « Les Braises de la Légion » et des jetons de personnage joueur de lakour-warcraft.
// Campagne : journal du MJ caché qui cite les cartes par leur nom exact et leurs repères, pages attendues, PNJ nommés
// présents au bestiaire avec un jeton, aides de jeu visibles, cartes avec pièces, éléments nommés, description et
// titre de campagne. Jetons de joueur : un par peuple jouable, fichiers plats et en relief, index.json et
// index-3d.json cohérents avec les clés des objets « race ». Essais de mutation : un journal, un index ou une carte
// faussés sont repérés.  Régénérer : npm run fabriquer-jetons-warcraft, puis npm run fabriquer-warcraft.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fabriquer } from "../outils/fabriquer-warcraft.mjs";
import { RACES, indexJoueurs, listeJetons, verifierJetons } from "../outils/fabriquer-jetons-warcraft.mjs";
import { couleurAnneau, erreursSvg } from "../modules/lakour-mj-ia/outils/jetons-commun.mjs";
import { DOCUMENTS } from "../modules/lakour-warcraft/contenu/index.mjs";
import { CAMPAGNE_DOCUMENTS, PNJ_CAMPAGNE } from "../modules/lakour-warcraft/contenu/campagne.mjs";
import { CARTES_CAMPAGNE, TITRE_CAMPAGNE } from "../modules/lakour-warcraft/contenu/campagne-cartes.mjs";
import { CARTES } from "../modules/lakour-warcraft/contenu/aventure-cartes.mjs";
import { scene } from "../modules/lakour-warcraft/contenu/cartes.mjs";
import {
  COULEURS_ANNEAU, INDEX_JOUEURS, JETONS_PEUPLES, JETONS_PNJ, cheminJetonJoueur, cheminJetonJoueur3d
} from "../modules/lakour-warcraft/contenu/jetons.mjs";

const M = "lakour-warcraft";
const fabriques = fabriquer();
const docs = fabriques.map(d => d.doc);
const pnjs = fabriques.filter(d => d.pack === "bestiaire").map(d => d.doc);
const scenes = fabriques.filter(d => d.pack === "scenes").map(d => d.doc);
const journaux = fabriques.filter(d => d.pack === "journaux").map(d => d.doc);
const races = fabriques.filter(d => d.pack === "peuples" && d.doc.type === "race").map(d => d.doc);
const racine = new URL("../", import.meta.url);
const lire = chemin => { try { return readFileSync(new URL(chemin, racine), "utf8"); } catch { return null; } };
const texteJournal = j => j.pages.map(p => p.text.content).join("\n");

// ---------------------------------------------------------------- Vérificateur de la campagne (aussi pour les mutations)

const PAGES = ["Synopsis", "Fil rouge et horloge", "Chapitre 1", "Chapitre 2", "Chapitre 3", "Chapitre 4", "Dénouements"];
const NOMMES = ["Vizzik", "Aelyra", "Sss'thera", "Corwen", "Garrok", "Iselle", "Drogha l'Embrasé"];

function verifierCampagne({ journaux, scenes, pnjs }) {
  const erreurs = [];
  const mj = journaux.find(j => j.flags?.[M]?.cle === "campagne-braises-legion");
  if (!mj) return ["journal de la campagne absent"];
  if (mj.ownership?.default !== 0) erreurs.push("journal de la campagne visible des joueurs");
  for (const titre of PAGES) if (!mj.pages.some(p => p.name.startsWith(titre))) erreurs.push(`page « ${titre} » absente`);
  const texte = texteJournal(mj).replace(/&#39;|&apos;/g, "'");
  const cartes = scenes.filter(s => s.flags?.[M]?.aventure === TITRE_CAMPAGNE);
  if (cartes.length !== 4) erreurs.push(`${cartes.length} cartes de campagne au lieu de 4`);
  for (const s of cartes) {
    const { plan, description, cle } = s.flags[M];
    if (!texte.includes(s.name)) erreurs.push(`carte « ${s.name} » non citée par son nom exact`);
    if (!(plan?.pieces?.length >= 3)) erreurs.push(`${cle} : moins de 3 pièces`);
    const nommes = (plan?.elements ?? []).filter(e => e.nom?.trim());
    if (nommes.length < 8) erreurs.push(`${cle} : ${nommes.length} éléments nommés seulement`);
    if (!(description?.length > 40)) erreurs.push(`${cle} : description trop courte`);
    // Le journal guide le MJ IA avec les repères de la carte : au moins trois éléments nommés y sont cités.
    const cites = new Set(nommes.map(e => e.nom.toLowerCase()).filter(n => texte.toLowerCase().includes(n)));
    if (cites.size < 3) erreurs.push(`${cle} : ${cites.size} repère(s) de la carte cité(s) dans le journal`);
  }
  for (const nom of NOMMES) {
    if (!texte.includes(nom)) erreurs.push(`${nom} absent du journal`);
    if (!pnjs.some(a => a.name.includes(nom))) erreurs.push(`${nom} absent du bestiaire`);
  }
  return erreurs;
}

// ---------------------------------------------------------------- Campagne

test("la campagne est branchée dans l'index du module et fabriquée dans les compendiums", () => {
  for (const d of CAMPAGNE_DOCUMENTS) assert.ok(DOCUMENTS.includes(d), `${d.__cle} absent de DOCUMENTS`);
  const cles = new Set(fabriques.map(d => d.cle));
  for (const d of CAMPAGNE_DOCUMENTS) assert.ok(cles.has(d.__cle), `${d.__cle} non fabriqué`);
});

test("la campagne vérifiée : journal caché, pages, cartes citées par leur nom exact et leurs repères, PNJ présents", () => {
  assert.deepEqual(verifierCampagne({ journaux, scenes, pnjs }), []);
});

test("le journal de la campagne : encadrés « À lire », indices chiffrés, niveaux 3 à 6, horloge et Braises", () => {
  const mj = journaux.find(j => j.flags[M].cle === "campagne-braises-legion");
  assert.equal(mj.name, `Campagne — ${TITRE_CAMPAGNE}`);
  const texte = texteJournal(mj);
  assert.ok((texte.match(/À lire/g) ?? []).length >= 5, "encadrés « À lire »");
  assert.ok((texte.match(/DD \d+/g) ?? []).length >= 30, "indices et tests avec DD");
  for (const niveau of ["niveau 3", "niveau 4", "niveau 5", "niveau 6"]) assert.ok(texte.includes(niveau), niveau);
  // Chaque chapitre cite sa propre carte.
  CARTES_CAMPAGNE.forEach((c, i) => {
    const page = mj.pages.find(p => p.name.startsWith(`Chapitre ${i + 1}`));
    assert.ok(page.text.content.includes(c.name), `chapitre ${i + 1} : carte « ${c.name} »`);
  });
  const fil = mj.pages.find(p => p.name === "Fil rouge et horloge").text.content;
  for (const braise of ["Rouge-Veine", "Fort-Rivet", "Eldrassal", "Gué-de-Sel"]) assert.ok(fil.includes(braise), `Braise ${braise}`);
});

test("les aides de jeu de la campagne sont visibles des joueurs", () => {
  for (const cle of ["lettre-lame-ardente", "sauf-conduit-gue-de-sel"]) {
    const aide = journaux.find(j => j.flags[M].cle === cle);
    assert.ok(aide, `${cle} absente`);
    assert.equal(aide.ownership.default, 2, `${cle} doit être visible`);
    assert.ok(aide.name.startsWith("Aide de jeu — "));
  }
});

test("les cartes de la campagne : rattachées au titre, distinctes de l'aventure, murs, grille de 1,5 m, fonds et plans.json", () => {
  assert.equal(CARTES_CAMPAGNE.length, 4);
  const plans = JSON.parse(lire("modules/lakour-warcraft/assets/cartes/plans.json"));
  const clesAventure = new Set(CARTES.map(c => c.flags[M].cle));
  for (const c of CARTES_CAMPAGNE) {
    const cle = c.flags[M].cle;
    assert.equal(c.flags[M].aventure, TITRE_CAMPAGNE, c.name);
    assert.ok(!clesAventure.has(cle) && !cle.startsWith("lieu-"), `${cle} : clé réservée`);
    const s = scenes.find(x => x.flags[M].cle === cle);
    assert.ok(s, `${cle} absente des compendiums`);
    assert.ok(s.walls.length > 0 && s.grid.distance === 1.5 && s.grid.units === "m", `${cle} : murs ou grille`);
    assert.ok(s.walls.some(w => w.door > 0), `${cle} : aucune porte`);
    assert.ok(s.lights.length >= 4, `${cle} : lumières`);
    for (const chemin of [s.levels[0].background.src, s.levels[0].background.src.replace("/cartes/", "/cartes/3d/")]) {
      assert.ok(lire(chemin)?.startsWith("<svg"), `${cle} : fond ${chemin}`);
    }
    assert.deepEqual(plans[cle], s.flags[M].plan, `${cle} : plans.json`);
  }
  // Quatre lieux différents : aucun nom de carte ni de pièce principale en double.
  assert.equal(new Set(CARTES_CAMPAGNE.map(c => c.name)).size, 4);
});

test("les PNJ de la campagne : au bestiaire, avec un jeton, FP adaptés aux niveaux 3 à 6, un chef par chapitre", () => {
  assert.ok(PNJ_CAMPAGNE.length >= 10);
  for (const p of PNJ_CAMPAGNE) {
    const cle = p.flags[M].cle;
    assert.ok(JETONS_PNJ[cle], `${cle} : pas d'icône de jeton`);
    assert.ok(pnjs.some(a => a.flags[M].cle === cle), `${cle} absent du bestiaire fabriqué`);
    assert.ok(p.system.details.cr >= 0.5 && p.system.details.cr <= 6, `${cle} : FP ${p.system.details.cr}`);
  }
  const chefs = PNJ_CAMPAGNE.filter(p => p.flags[M].role === "chef").map(p => p.flags[M].cle);
  for (const cle of ["vizzik-tirelire", "sssthera", "iselle-marchebrume", "drogha-embrase"]) assert.ok(chefs.includes(cle), `${cle} n'est pas chef`);
  // Un allié pour la campagne (anneau vert) et l'infernal en grande taille.
  assert.equal(pnjs.find(a => a.flags[M].cle === "aelyra-ombrefeuille").prototypeToken.disposition, 1);
  assert.equal(pnjs.find(a => a.flags[M].cle === "infernal-brasegouffre").prototypeToken.width, 2);
});

// ---------------------------------------------------------------- Jetons de personnage joueur

test("un jeton de joueur par peuple jouable : 13 peuples, clés des objets race, une icône chacun", () => {
  assert.equal(races.length, 13);
  assert.equal(RACES.length, 13);
  const cles = races.map(r => r.flags[M].cle).sort();
  assert.deepEqual(Object.keys(JETONS_PEUPLES).sort(), cles);
  const { peuples } = listeJetons();
  assert.deepEqual(peuples.map(p => p.cle).sort(), cles);
  for (const p of peuples) assert.ok(p.titre.startsWith("Peuple — "), p.titre);
});

test("jetons de joueur : fichiers plats et en relief présents, SVG autonomes, anneau bleu acier", () => {
  const bleu = COULEURS_ANNEAU.joueur.couleur;
  for (const r of races) {
    const cle = r.flags[M].cle;
    for (const chemin of [cheminJetonJoueur(cle), cheminJetonJoueur3d(cle)]) {
      assert.match(chemin, /^modules\/lakour-warcraft\/assets\/jetons\/joueurs\/(3d\/)?[a-z-]+\.svg$/);
      const texte = lire(chemin);
      assert.ok(texte, `${chemin} absent`);
      assert.deepEqual(erreursSvg(texte, chemin), []);
      assert.equal(couleurAnneau(texte), bleu, `${chemin} : anneau`);
    }
  }
});

test("index.json et index-3d.json : dans assets/jetons/, clé du peuple -> chemin du jeton, rien de plus", () => {
  assert.equal(INDEX_JOUEURS["2d"], "modules/lakour-warcraft/assets/jetons/index.json");
  assert.equal(INDEX_JOUEURS["3d"], "modules/lakour-warcraft/assets/jetons/index-3d.json");
  const plat = JSON.parse(lire(INDEX_JOUEURS["2d"]));
  const relief = JSON.parse(lire(INDEX_JOUEURS["3d"]));
  assert.deepEqual(Object.keys(plat).sort(), Object.keys(relief).sort());
  for (const r of races) {
    const cle = r.flags[M].cle;
    assert.equal(plat[cle], cheminJetonJoueur(cle));
    assert.equal(relief[cle], cheminJetonJoueur3d(cle));
    assert.ok(lire(plat[cle]) && lire(relief[cle]), `${cle} : jeton indexé absent`);
  }
  assert.equal(Object.keys(plat).length, 13);
  assert.deepEqual(verifierJetons(pnjs, lire), []);
});

test("les crédits citent les icônes des peuples et leur auteur", () => {
  const texte = lire("modules/lakour-warcraft/CREDITS.md");
  assert.match(texte, /Peuple — Humain/);
  assert.match(texte, /Peuple — Pandaren/);
  assert.match(texte, /Icons made by .*Kier Heyl/);
  assert.match(texte, /bleu acier/);
});

// ---------------------------------------------------------------- Mutations

test("mutation : un journal de campagne faussé est repéré", () => {
  const casser = f => {
    const copie = structuredClone({ journaux, scenes, pnjs });
    f(copie);
    return verifierCampagne(copie);
  };
  const mj = c => c.journaux.find(j => j.flags[M].cle === "campagne-braises-legion");
  // [altération, message attendu]
  const cas = [
    [c => { mj(c).ownership.default = 2; }, /visible des joueurs/],
    [c => { mj(c).pages = mj(c).pages.filter(p => !p.name.startsWith("Fil rouge")); }, /page « Fil rouge et horloge » absente/],
    [c => { for (const p of mj(c).pages) p.text.content = p.text.content.replaceAll(CARTES_CAMPAGNE[2].name, "Gué-de-Sel"); }, /non citée par son nom exact/],
    [c => { c.scenes.find(s => s.flags[M].cle === "ruines-eldrassal").flags[M].plan.elements.forEach(e => { e.nom = ""; }); }, /ruines-eldrassal : 0 éléments nommés/],
    [c => { c.scenes.find(s => s.flags[M].cle === "fonderie-fort-rivet").flags[M].description = ""; }, /description trop courte/],
    [c => { c.scenes.find(s => s.flags[M].cle === "cratere-brasegouffre").flags[M].aventure = "Autre chose"; }, /3 cartes de campagne au lieu de 4/],
    [c => { c.pnjs = c.pnjs.filter(a => a.flags[M].cle !== "iselle-marchebrume"); }, /Iselle absent du bestiaire/],
    [c => { c.journaux = c.journaux.filter(j => j.flags[M].cle !== "campagne-braises-legion"); }, /journal de la campagne absent/]
  ];
  for (const [alterer, message] of cas) {
    const erreurs = casser(alterer);
    assert.ok(erreurs.some(e => message.test(e)), `${message} attendu, obtenu : ${erreurs.join(" ; ") || "aucune erreur"}`);
  }
});

test("mutation : un jeton de joueur absent, un index faux ou un anneau repeint sont repérés", () => {
  const vrai = lire;
  const humain = cheminJetonJoueur("humain");
  const index = JSON.parse(vrai(INDEX_JOUEURS["2d"]));
  const cas = [
    [c => (c === cheminJetonJoueur3d("troll") ? null : vrai(c)), /troll.*jeton absent/],
    [c => (c === INDEX_JOUEURS["3d"] ? null : vrai(c)), /index-3d\.json absent/],
    [c => (c === INDEX_JOUEURS["2d"] ? JSON.stringify({ ...index, nain: humain }) : vrai(c)), /index\.json : nain -> .*humain\.svg au lieu de/],
    [c => (c === INDEX_JOUEURS["2d"] ? JSON.stringify({ ...index, murloc: humain }) : vrai(c)), /clé murloc qui n'est pas un peuple/],
    [c => (c === INDEX_JOUEURS["2d"] ? "{ pas du json" : vrai(c)), /JSON illisible/],
    [c => (c === humain ? vrai(c).replaceAll(COULEURS_ANNEAU.joueur.couleur, COULEURS_ANNEAU["-1"].couleur) : vrai(c)), /humain\.svg : anneau #8a1414 au lieu de #4b6b8a/]
  ];
  for (const [lireFaux, message] of cas) {
    const erreurs = verifierJetons(pnjs, lireFaux);
    assert.ok(erreurs.some(e => message.test(e)), `${message} attendu, obtenu : ${erreurs.join(" ; ") || "aucune erreur"}`);
  }
  // Un peuple sans icône fait échouer la liste des jetons ; un index calculé suit les clés des peuples.
  const sansIcone = [{ ...RACES[0], flags: { [M]: { cle: "peuple-inconnu" } } }];
  assert.throws(() => listeJetons(undefined, sansIcone), /Aucune icône pour peuple-inconnu/);
  assert.deepEqual(indexJoueurs([{ cle: "orc" }], "3d"), { orc: cheminJetonJoueur3d("orc") });
});

test("mutation : une carte dont une porte ne touche aucun mur est refusée", () => {
  const plan = structuredClone(CARTES_CAMPAGNE[0].flags[M].plan);
  plan.ouvertures.push({ x: 14, y: 3, cote: "nord", type: "porte" }); // au milieu de la halle des machines
  assert.throws(() => scene({ cle: "essai-mutation-carte", nom: "Essai", plan, description: "Essai de mutation", aventure: TITRE_CAMPAGNE }),
    /pas de mur à cet endroit/);
});
