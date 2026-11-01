// Icônes des objets de lakour-warcraft (peuples, historiques, objets, arsenal, dons, affiliations, afflictions, sorts) :
// chaque objet (Item) a une icône non vide qui existe (liste des icônes du cœur de Foundry 14,
// modules/lakour-mj-ia/outils/icones-foundry14.txt, ou fichier du module), jamais un glyphe blanc icons/svg/ (illisible
// dans l'inventaire), et aucune icône ne sert à plus de 3 objets d'une même catégorie (compendium + type). Les
// activités embarquées (img "") héritent de l'icône de leur objet : seules les icônes d'objets comptent. La batterie
// est rejouée sur des copies mutées : chaque règle cassée est détectée.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { DOCUMENTS } from "../modules/lakour-warcraft/contenu/index.mjs";
import { icone } from "../modules/lakour-warcraft/contenu/aides.mjs";

const MODULE = "lakour-warcraft";
const RACINE = new URL("../", import.meta.url);
const COEUR = new Set(readFileSync(new URL("modules/lakour-mj-ia/outils/icones-foundry14.txt", RACINE), "utf8").split(/\r?\n/).filter(Boolean));
const MAX_PAR_CATEGORIE = 3;

const objetsDe = documents => documents.filter(d => d._key?.startsWith("!items!"));
const categorie = d => `${d.__pack}/${d.type}`;
const existe = img => COEUR.has(img) || (img.startsWith(`modules/${MODULE}/`) && existsSync(new URL(img, RACINE)));

// Chaque vérification lève une erreur si la règle est cassée.
const VERIFICATIONS = {
  "chaque objet a une icône non vide"(objets) {
    const vides = objets.filter(d => typeof d.img !== "string" || !d.img.trim()).map(d => d.__cle);
    assert.deepEqual(vides, [], "objets sans icône");
  },
  "chaque icône existe (cœur de Foundry 14 ou fichier du module)"(objets) {
    const absentes = objets.filter(d => d.img && !existe(d.img)).map(d => `${d.__cle} : ${d.img}`);
    assert.deepEqual(absentes, [], "icônes introuvables");
  },
  "aucun glyphe blanc icons/svg/ pour un objet"(objets) {
    const glyphes = objets.filter(d => d.img?.startsWith("icons/svg/")).map(d => `${d.__cle} : ${d.img}`);
    assert.deepEqual(glyphes, [], "glyphes svg");
  },
  [`aucune icône partagée par plus de ${MAX_PAR_CATEGORIE} objets d'une même catégorie`](objets) {
    const compte = new Map();
    for (const d of objets) {
      const cle = `${categorie(d)} | ${d.img}`;
      compte.set(cle, [...(compte.get(cle) ?? []), d.__cle]);
    }
    const trop = [...compte].filter(([, cles]) => cles.length > MAX_PAR_CATEGORIE).map(([cle, cles]) => `${cle} : ${cles.length} objets`);
    assert.deepEqual(trop, [], "icônes trop partagées");
  }
};

function echecs(objets) {
  const liste = [];
  for (const [nom, verifier] of Object.entries(VERIFICATIONS)) {
    try { verifier(objets); } catch (e) { liste.push(`${nom} : ${e.message.split("\n")[0]}`); }
  }
  return liste;
}

const OBJETS = objetsDe(DOCUMENTS);
const premier = (objets, cle) => objets.find(d => d.__cle === cle);

const MUTATIONS = {
  "icône vidée"(o) { premier(o, "sorts:blizzard").img = ""; },
  "icône absente du cœur (faute de frappe)"(o) { premier(o, "objets:hache-d-orgrimmar").img = "icons/weapons/axes/axe-battle-heavy-jaged.webp"; },
  "fichier du module inexistant"(o) { premier(o, "peuples:orc").img = `modules/${MODULE}/assets/icones/orc.webp`; },
  "glyphe svg"(o) { premier(o, "historiques:don-pied-marin").img = "icons/svg/anchor.svg"; },
  "quatre dons sous la même bourse"(o) {
    for (const d of o.filter(x => x.__pack === "dons").slice(0, 4)) d.img = "icons/commodities/currency/coins-plain-pouch-gold.webp";
  }
};

test("icônes Warcraft : le contenu passe toute la batterie", () => {
  assert.deepEqual(echecs(OBJETS), []);
});

test("icônes Warcraft : chaque règle cassée est détectée par la batterie", () => {
  const passees = Object.entries(MUTATIONS).filter(([, muter]) => { const o = structuredClone(OBJETS); muter(o); return !echecs(o).length; }).map(([nom]) => nom);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

test("icônes Warcraft : une icône inconnue fait échouer la construction", () => {
  assert.throws(() => icone("weapons/axes/hache-qui-n-existe-pas"), /Aucune icône Foundry/);
});

test("icônes Warcraft : les objets sont reconnaissables (presque une icône par objet)", () => {
  assert.ok(OBJETS.length > 180, `${OBJETS.length} objets seulement`);
  assert.ok(new Set(OBJETS.map(d => d.img)).size >= OBJETS.length * 0.95, "trop d'icônes répétées");
});
