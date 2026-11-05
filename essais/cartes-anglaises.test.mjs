// Cartes du module anglais lakour-warcraft-en : aucune image de carte ne porte de texte français connu.
// Le fabricant anglais (outils/fabriquer-warcraft.mjs --langue en) copie assets/ tel quel : les fonds de carte (SVG plat et
// relief, contenu/cartes) doivent donc rester SANS texte gravé (les noms des pièces et des repères sont des dessins de texte
// et des épingles de la scène, traduits par le dictionnaire contenu/en/scenes.json). Si un fond reçoit un jour du texte,
// il faudra le traduire à la fabrication, comme lakour-veillees (contenu/en/cartes.json). Les visuels dessinés par
// programme (outils/fabriquer-visuels-warcraft.mjs : accueil, fêtes) sont sans texte, eux aussi.
// Aucun réseau.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fabriquer, fabriquerAnglais, lireDictionnaires, MODULE_EN } from "../outils/fabriquer-warcraft.mjs";
import { VISUELS, svgDuVisuel } from "../outils/fabriquer-visuels-warcraft.mjs";

const M = "lakour-warcraft";
const francais = fabriquer();
const { documents: anglais, rapport } = fabriquerAnglais(francais, lireDictionnaires().dictionnaire);
const scenesFr = francais.filter(d => d.pack === "scenes").map(d => d.doc);
const scenesEn = anglais.filter(d => d.pack === "scenes").map(d => d.doc);

// Textes gravés d'un SVG : contenu des <text> et <tspan>.
const textesGraves = svg => [...svg.matchAll(/<(?:text|tspan)\b[^>]*>([^<]*)/g)].map(m => m[1].trim()).filter(Boolean);
const svgsDe = dossier => readdirSync(dossier, { recursive: true }).map(f => String(f).replaceAll("\\", "/")).filter(f => f.endsWith(".svg"));
// Textes français connus des scènes : dessins de texte et épingles du module français que le module anglais traduit autrement.
const textesDeScene = s => [...(s.drawings ?? []).map(d => d.text), ...(s.notes ?? []).map(n => n.text)].filter(t => t && /\p{L}{2,}/u.test(t));
const textesEn = new Set(scenesEn.flatMap(textesDeScene));
const francaisConnus = new Set(scenesFr.flatMap(textesDeScene).filter(t => !textesEn.has(t)));

test("fonds de carte (plat et relief) : aucun texte gravé, le module anglais les copie tels quels", () => {
  const dossier = new URL(`../modules/${M}/assets/cartes/`, import.meta.url);
  const svgs = svgsDe(dossier);
  assert.ok(svgs.length >= 2 * scenesFr.length, "un fond plat et un fond relief par scène");
  for (const f of svgs) {
    assert.deepEqual(textesGraves(readFileSync(new URL(f, dossier), "utf8")), [], `${f} : texte gravé (à traduire à la fabrication du module anglais)`);
  }
});

test("visuels dessinés par programme (accueil, fêtes) : sans texte gravé", () => {
  for (const v of VISUELS) assert.deepEqual(textesGraves(svgDuVisuel(v)), [], v.titre);
});

test("scènes anglaises : fonds du module anglais, dessins de texte et épingles traduits", () => {
  assert.ok(francaisConnus.size > 50, "textes français des scènes");
  assert.deepEqual(rapport.manquants.filter(m => m.startsWith("scenes/")), [], "textes de scène sans traduction");
  for (const s of scenesEn) {
    assert.match(s.levels[0].background.src, new RegExp(`^modules/${MODULE_EN}/assets/cartes/`), s.name);
    for (const t of textesDeScene(s)) assert.ok(!francaisConnus.has(t), `${s.name} : « ${t} » resté en français`);
  }
});

const RACINE_EN = new URL(`../modules/${MODULE_EN}/`, import.meta.url);
const surLeDisque = existsSync(new URL("src", RACINE_EN));
test("lakour-warcraft-en sur le disque (si fabriqué) : aucune image de carte ne contient de texte français connu", { skip: !surLeDisque && "npm run fabriquer-warcraft-en n'a pas tourné" }, () => {
  const dossier = new URL("assets/", RACINE_EN);
  const svgs = svgsDe(dossier).filter(f => f.startsWith("cartes/"));
  assert.ok(svgs.length > 0);
  for (const f of svgs) assert.deepEqual(textesGraves(readFileSync(new URL(f, dossier), "utf8")), [], f);
  for (const s of scenesEn) assert.ok(existsSync(new URL(s.levels[0].background.src.replace(`modules/${MODULE_EN}/`, ""), RACINE_EN)), `${s.name} : fond absent`);
});
