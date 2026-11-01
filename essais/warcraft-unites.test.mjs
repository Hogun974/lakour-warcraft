// Essais des unités de lakour-warcraft : tout est en mètres (5 pieds = 1,5 m, comme la grille des scènes).
// On parcourt chaque document fabriqué (objets copiés dans les acteurs, pages de journaux et scènes compris) et on
// refuse une clé `units` en pieds ou en miles, et un texte qui parle de pieds (« 30 pieds », « 5 pi », « 10 ft »).
// Une mutation vérifie qu'un document en `ft` est bien repéré.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { fabriquer } from "../outils/fabriquer-warcraft.mjs";
import { icone } from "../modules/lakour-warcraft/contenu/aides.mjs";
import { arme, consommable, peuple, trait } from "../modules/lakour-warcraft/contenu/objets.mjs";

const UNITES_IMPERIALES = ["ft", "mi"];
const NOMBRE = String.raw`(?:\d+(?:[.,]\d+)?|un|une|deux|trois|quatre|cinq|six|dix|quinze|vingt|trente|quarante|soixante|cent)`;
// Une distance en pieds ou en miles : un nombre (en chiffres ou en lettres) suivi de l'unité, ou « ft » seul.
// Les mots qui commencent pareil (« pièces », « minutes », « mi-chemin ») et « au pied de », « à pied » passent.
const DISTANCE_IMPERIALE = new RegExp(
  String.raw`(?<![\p{L}\d])${NOMBRE}\s*(?:pieds?|pi|ft|feet|foot|miles?|mi)(?![\p{L}\d-])|(?<![\p{L}\d/._-])ft(?![\p{L}\d/._-])`,
  "iu"
);
// Champs qui ne sont pas du texte lu par un joueur : chemins d'image, identifiants, clés.
const PAS_UN_TEXTE = new Set(["img", "src", "_id", "_key", "uuid", "documentUuid", "identifier", "cle", "folder"]);

// Renvoie la liste des fautes d'unité d'une liste de { cle, doc } (vide si tout est en mètres).
function fautesUnites(documents) {
  const fautes = [];
  const parcourir = (valeur, chemin, cle, nomChamp) => {
    if (Array.isArray(valeur)) return valeur.forEach((v, i) => parcourir(v, `${chemin}[${i}]`, cle, nomChamp));
    if (valeur && typeof valeur === "object") {
      for (const [k, v] of Object.entries(valeur)) parcourir(v, chemin ? `${chemin}.${k}` : k, cle, k);
      return;
    }
    if (typeof valeur !== "string") return;
    if (nomChamp === "units") {
      if (UNITES_IMPERIALES.includes(valeur)) fautes.push(`${cle} ${chemin} : unité « ${valeur} »`);
      return;
    }
    if (PAS_UN_TEXTE.has(nomChamp)) return;
    const m = DISTANCE_IMPERIALE.exec(valeur);
    if (m) fautes.push(`${cle} ${chemin} : distance en pieds « ${m[0]} »`);
  };
  for (const { cle, doc } of documents) parcourir(doc, "", cle, "");
  return fautes;
}

const documents = fabriquer();

test("tous les documents fabriqués sont en mètres : aucune unité ft ou mi, aucun texte en pieds", () => {
  assert.ok(documents.length > 100, `${documents.length} documents seulement`);
  assert.deepEqual(fautesUnites(documents), []);
});

test("les distances portent bien des unités en mètres (peuples, objets, activités, PNJ, scènes)", () => {
  const unites = new Map();
  const compter = (valeur, chemin) => {
    if (Array.isArray(valeur)) return valeur.forEach(v => compter(v, chemin));
    if (!valeur || typeof valeur !== "object") return;
    for (const [k, v] of Object.entries(valeur)) {
      if (k === "units" && typeof v === "string") unites.set(v, (unites.get(v) ?? 0) + 1);
      else compter(v, k);
    }
  };
  for (const { doc } of documents) compter(doc, "");
  assert.ok((unites.get("m") ?? 0) > 200, `seulement ${unites.get("m") ?? 0} unités « m »`);
  for (const u of UNITES_IMPERIALES) assert.equal(unites.get(u) ?? 0, 0, `${unites.get(u)} unités « ${u} »`);

  const races = documents.filter(d => d.doc.type === "race").map(d => d.doc.system);
  assert.equal(races.length, 13);
  for (const r of races) {
    assert.equal(r.movement.units, "m");
    assert.equal(r.senses.units, "m");
    assert.ok(Number(r.movement.walk) % 1.5 === 0, `vitesse ${r.movement.walk} m : pas un nombre entier de cases`);
  }
  const armes = documents.filter(d => d.pack === "objets" && d.doc.type === "weapon").map(d => d.doc);
  for (const a of armes) assert.equal(a.system.range.units, "m", a.name);
  const lance = armes.find(a => a.flags["lakour-warcraft"].cle === "lance-de-sombrelance");
  assert.deepEqual([lance.system.range.value, lance.system.range.long], [6, 18], "lance : 20/60 pieds = 6/18 m");
});

test("le détecteur repère un document en ft, un texte en pieds, et laisse passer les faux amis (mutation)", () => {
  const casse = structuredClone(documents);
  const bombe = casse.find(d => d.cle === "objets:bombe-gobeline").doc;
  Object.values(bombe.system.activities)[0].range.units = "ft";
  const tauren = casse.find(d => d.cle === "peuples:tauren").doc;
  tauren.system.movement.units = "ft";
  const lance = casse.find(d => d.cle === "objets:lance-de-sombrelance").doc;
  lance.system.description.value = "<p>Portée 20/60 pieds.</p>";
  const nain = casse.find(d => d.cle === "peuples:nain").doc;
  nain.system.description.value += "<p>Vision dans le noir : trente pieds.</p>";
  const pnj = casse.find(d => d.doc.type === "npc").doc;
  pnj.items[0].system.description.value = "Allonge 5 ft.";
  pnj.system.attributes.senses.units = "mi";

  const fautes = fautesUnites(casse);
  for (const motif of [
    /objets:bombe-gobeline system\.activities\.\w+\.range\.units : unité « ft »/,
    /peuples:tauren system\.movement\.units : unité « ft »/,
    /objets:lance-de-sombrelance .* distance en pieds « 20\/60 pieds »|objets:lance-de-sombrelance .* distance en pieds « 60 pieds »/,
    /peuples:nain .* distance en pieds « trente pieds »/,
    /bestiaire:.* items\[0\]\.system\.description\.value : distance en pieds « 5 ft »/,
    /bestiaire:.* system\.attributes\.senses\.units : unité « mi »/
  ]) assert.ok(fautes.some(f => motif.test(f)), `non détecté : ${motif}\n${fautes.join("\n")}`);
  assert.equal(fautes.length, 6, fautes.join("\n"));

  // Faux amis : ni « pièces », ni « minutes », ni « au pied du Mont », ni « à pied », ni des mètres.
  const sains = [{ cle: "essai", doc: { texte: "50 pièces d'or, 10 minutes, au pied du Mont Hyjal, 3 jours à pied, 9 m, 1,5 m, Pied marin, à mi-chemin" } }];
  assert.deepEqual(fautesUnites(sains), []);
});

test("les constructeurs refusent une distance en pieds dès la construction (mutation)", () => {
  const img = icone("svg/mystery-man");
  assert.throws(() => consommable({ cle: "essai-bombe", nom: "Bombe", img, categorie: "trinket", activites: [{ type: "utility", portee: [30, "ft"] }] }), /portée « ft »/);
  assert.throws(() => consommable({ cle: "essai-bombe", nom: "Bombe", img, categorie: "trinket", activites: [{ type: "utility", portee: [1, "mi"] }] }), /portée « mi »/);
  const fabrique = arme({ cle: "essai-arc", nom: "Arc", img, categorie: "martialR", degats: { des: "1d8", types: ["piercing"] }, portee: [45, 180] });
  assert.equal(fabrique.system.range.units, "m");
  assert.deepEqual(Object.values(fabrique.system.activities)[0].range, { value: "45", units: "m", special: "", override: false });
  const corps = arme({ cle: "essai-epee", nom: "Épée", img, categorie: "martialM", degats: { des: "1d8", types: ["slashing"] } });
  assert.deepEqual(Object.values(corps.system.activities)[0].range, { value: "1.5", units: "m", special: "", override: false }, "allonge par défaut : 1,5 m");
  const traits = ["essai-u1", "essai-u2"].map(cle => trait({ cle, nom: cle, peuple: "Essai", img, texte: "" }));
  assert.throws(() => peuple({ cle: "essai-u", nom: "Essai", img, vitesse: 30, vision: 60, traits }), /vitesse 30 m/);
  assert.equal(peuple({ cle: "essai-u", nom: "Essai", img, vitesse: 9, vision: 18, traits }).system.movement.units, "m");
});
