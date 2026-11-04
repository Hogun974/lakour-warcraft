// « Le livre des Tarides » (contenu/livre-univers.mjs), le livre d'univers des joueurs :
// - un journal visible des joueurs, seize pages texte dans l'ordre de PAGES_LIVRE, 35 000 à 50 000 caractères de texte ;
// - chaque peuple jouable, chaque ordre des affiliations et les journaux visibles des joueurs y sont liés ; aucun lien
//   vers un compendium fermé ou un journal caché (vérifié avec les autres journaux par warcraft-journaux-lies.test.mjs) ;
// - rien des secrets du MJ : aucun nom des antagonistes des aventures ni des vérités des journaux cachés ;
// - les citations « > » de html() donnent des <blockquote>, et le livre en a ;
// - la version anglaise est complète (contenu/en/journaux.json) et garde les balises et les liens du français ;
// - le livre fait partie du contenu installé (index), et le module compte un journal de plus que la version 0.10.
// Aucun réseau, rien n'est écrit.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fabriquer, TYPE_PACK } from "../outils/fabriquer-warcraft.mjs";
import { html } from "../modules/lakour-warcraft/contenu/aides.mjs";
import { LIVRE_UNIVERS, PAGES_LIVRE, TITRE_LIVRE } from "../modules/lakour-warcraft/contenu/livre-univers.mjs";
import { AFFILIATIONS_ORDRES } from "../modules/lakour-warcraft/contenu/affiliations.mjs";
import { ecartsBalises } from "../modules/lakour-mj-ia/outils/traduction.mjs";

const M = "lakour-warcraft";
const fabriques = fabriquer();
const livre = fabriques.find(d => d.cle === "journaux:livre-des-tarides")?.doc;
const uuidDe = (pack, doc) => `Compendium.${M}.${pack}.${TYPE_PACK[pack]}.${doc._id}`;
const texte = j => j.pages.map(p => p.text.content).join("\n");
const nu = h => h.replace(/@UUID\[[^\]]+\]\{([^}]*)\}/g, "$1").replace(/<[^>]+>/g, "");
const liens = j => new Set([...texte(j).matchAll(/@UUID\[([^\]]+)\]/g)].map(m => m[1]));

test("livre des Tarides : journal visible, seize pages texte dans l'ordre, 35 000 à 50 000 caractères", () => {
  assert.ok(livre, "le livre est fabriqué");
  assert.equal(livre.name, TITRE_LIVRE);
  assert.equal(livre.ownership.default, 2, "visible des joueurs, comme le guide du joueur");
  assert.equal(PAGES_LIVRE.length, 16);
  assert.deepEqual(livre.pages.map(p => p.name), PAGES_LIVRE);
  for (const p of livre.pages) {
    assert.equal(p.type, "text", p.name);
    assert.equal(p.text.format, 1, p.name);
    assert.ok(nu(p.text.content).length >= 1500, `${p.name} : page trop courte`);
  }
  const total = nu(texte(livre)).length;
  assert.ok(total >= 35000 && total <= 50000, `${total} caractères de texte`);
  assert.ok(LIVRE_UNIVERS.pages.length === livre.pages.length);
});

test("livre des Tarides : lie chaque peuple, chaque ordre, les journaux des joueurs, et rien de fermé", () => {
  const lies = liens(livre);
  for (const f of fabriques.filter(f => f.pack === "peuples" && f.doc.type === "race")) assert.ok(lies.has(uuidDe("peuples", f.doc)), `peuple non lié : ${f.doc.name}`);
  for (const a of AFFILIATIONS_ORDRES) assert.ok(lies.has(uuidDe("dons", a)), `ordre non lié : ${a.name}`);
  for (const cle of ["guide-du-joueur", "guide-de-la-reputation", "routes-aeriennes-des-tarides", "recettes-d-artisanat", "garnison-de-faction"]) {
    const j = fabriques.find(f => f.cle === `journaux:${cle}`).doc;
    assert.ok(lies.has(uuidDe("journaux", j)), `journal non lié : ${j.name}`);
  }
  const parUuid = new Map(fabriques.map(f => [uuidDe(f.pack, f.doc), f]));
  for (const u of lies) {
    const cible = parUuid.get(u);
    assert.ok(cible, `lien introuvable : ${u}`);
    assert.ok(["peuples", "historiques", "dons", "objets", "journaux"].includes(cible.pack), `${u} : compendium ${cible.pack}`);
    if (cible.pack === "journaux") assert.equal(cible.doc.ownership.default, 2, `${cible.doc.name} : journal caché lié`);
  }
  assert.ok(lies.size >= 35, `${lies.size} liens`);
});

test("livre des Tarides : aucun secret du MJ (antagonistes, vérités des journaux cachés)", () => {
  const t = nu(texte(livre));
  for (const secret of ["Drogha", "Ezzavel", "Iselle", "Crayeval", "Varn", "Sss'thera", "Éclat gangrené", "Fournaise", "Braise", "nuit des deux lunes",
    "farine de peste", "Mère-Brasier", "Grokka", "Rouille-Cœur", "Vexxa", "Plume-Fiel", "Glouglou"]) {
    assert.ok(!t.includes(secret), `secret du MJ dans le livre : ${secret}`);
  }
});

test("livre des Tarides : citations (<blockquote>) rendues par html(), présentes dans le livre", () => {
  assert.equal(html("> **Avis**\n> Deux lignes.\n>\n> Second paragraphe."), "<blockquote><p><strong>Avis</strong><br>Deux lignes.</p><p>Second paragraphe.</p></blockquote>");
  assert.equal(html("Pas une citation > ici."), "<p>Pas une citation &gt; ici.</p>");
  assert.ok((texte(livre).match(/<blockquote>/g) ?? []).length >= 3, "au moins trois citations (affiche, règlement, chanson)");
});

test("livre des Tarides : traduit en anglais, balises et liens conservés, titre « The Book of the Barrens »", () => {
  const dico = JSON.parse(readFileSync(new URL(`../modules/${M}/contenu/en/journaux.json`, import.meta.url), "utf8"));
  const entree = dico[`journaux/${livre._id}`];
  assert.ok(entree, "entrée du livre dans contenu/en/journaux.json");
  assert.equal(entree.name.en, "La Kour Warcraft — The Book of the Barrens");
  for (const p of livre.pages) {
    const nom = entree[`pages.${p._id}.name`], contenu = entree[`pages.${p._id}.text.content`];
    assert.ok(nom?.en?.trim(), `${p.name} : titre non traduit`);
    assert.equal(contenu?.fr, p.text.content, `${p.name} : dictionnaire obsolète (relancer --extraire)`);
    assert.ok(contenu.en?.trim() && contenu.en !== contenu.fr, `${p.name} : page non traduite`);
    assert.deepEqual(ecartsBalises(contenu.fr, contenu.en), [], `${p.name} : balises ou liens en écart`);
    assert.ok(!/Cabestan|Carrefour|Gué-Brumeux|Âprefange|Mèche-Noire/.test(nu(contenu.en)), `${p.name} : nom de lieu français dans l'anglais`);
  }
});

test("livre des Tarides : installé avec les autres journaux (index), vingt-cinq journaux au module", () => {
  const journaux = fabriques.filter(d => d.pack === "journaux");
  assert.equal(journaux.length, 25);
  assert.equal(journaux.filter(j => j.doc.ownership.default === 2).length, 13,
    "journaux visibles des joueurs : guide du joueur, livre des Tarides, listes de sorts, cinq aides de jeu, réputation, routes, recettes, garnison, journal de rencontre");
});
