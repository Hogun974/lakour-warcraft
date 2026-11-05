// Essais des visuels de lakour-warcraft (outils/fabriquer-visuels-warcraft.mjs, outils/jpeg.mjs) :
// - fichiers : le fond de l'écran d'accueil et les cinq visuels de fêtes sont des JPEG complets, aux dimensions prévues,
//   signés par l'outil, et leur commentaire porte l'empreinte du SVG que l'outil dessine AUJOURD'HUI (sinon : périmé) ;
// - aucune autre image matricielle (jpg, png, webp) dans assets/ : une image d'une autre origine (générée par une IA,
//   reprise d'ailleurs) ne peut pas s'y glisser sans passer par l'outil ;
// - références : manifeste (cover), monde vierge (background) et illustration de chaque fête mènent à un visuel ;
// - SVG : déterministes, autonomes (ni texte, ni image, ni lien externe, ni script) ;
// - encodeur JPEG : en-tête relu, et image décodée par resvg fidèle à l'originale ;
// - documentation : plus aucune mention d'images générées par une IA (README, licence, crédits, docs).
// La vérification est rejouée sur des fichiers mutés : chaque défaut est détecté.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { SIGNATURE, VISUELS, svgDuVisuel, verifierVisuels } from "../outils/fabriquer-visuels-warcraft.mjs";
import { encoderJpeg, lireEnteteJpeg } from "../outils/jpeg.mjs";

const RACINE = fileURLToPath(new URL("../", import.meta.url));
const M = "lakour-warcraft";
const lireOctets = chemin => { try { return readFileSync(join(RACINE, chemin)); } catch { return null; } };
const lireTexte = chemin => readFileSync(join(RACINE, chemin), "utf8");

test("visuels : chaque fichier est la sortie actuelle de l'outil (JPEG complet, dimensions, signature, empreinte du SVG)", () => {
  assert.equal(VISUELS.length, 6);
  assert.deepEqual(verifierVisuels(lireOctets), []);
});

test("visuels : aucune autre image matricielle dans assets/ (jpg, png, webp)", () => {
  const attendus = new Set(VISUELS.map(v => v.chemin));
  const trouves = [];
  const parcourir = dossier => {
    for (const e of readdirSync(join(RACINE, dossier), { withFileTypes: true })) {
      const chemin = `${dossier}/${e.name}`;
      if (e.isDirectory()) parcourir(chemin);
      else if (/\.(jpe?g|png|webp|gif|avif)$/i.test(e.name)) trouves.push(chemin);
    }
  };
  parcourir(`modules/${M}/assets`);
  assert.deepEqual(trouves.filter(c => !attendus.has(c)), [], "image matricielle qui ne sort pas de outils/fabriquer-visuels-warcraft.mjs");
  assert.equal(trouves.length, attendus.size);
});

test("visuels : le manifeste, le monde vierge et chaque fête mènent à un visuel de l'outil", async () => {
  const chemins = new Set(VISUELS.map(v => v.chemin));
  const fond = VISUELS.find(v => v.cle === "fond").chemin;
  const module = JSON.parse(lireTexte(`modules/${M}/module.json`));
  assert.ok(module.media.find(m => m.type === "cover").url.endsWith(`/${fond}`), "cover du manifeste");
  assert.equal(JSON.parse(lireTexte("monde/world.json")).background, fond);
  globalThis.Hooks ??= { once: () => {}, on: () => {} };
  const { FETES_WARCRAFT, illustrationDeFete } = await import("../modules/lakour-warcraft/scripts/fetes.js");
  assert.equal(FETES_WARCRAFT.length, 5);
  for (const f of FETES_WARCRAFT) {
    assert.ok(chemins.has(illustrationDeFete(f.fete)), `${f.id} : ${illustrationDeFete(f.fete)} n'est pas un visuel`);
    assert.equal(VISUELS.find(v => v.fete === f.fete)?.chemin, illustrationDeFete(f.fete));
  }
});

test("visuels : SVG déterministes et autonomes (ni texte, ni image, ni lien externe, ni script)", () => {
  for (const v of VISUELS) {
    const svg = svgDuVisuel(v);
    assert.equal(svg, svgDuVisuel(v), `${v.cle} : dessin non déterministe`);
    assert.match(svg, new RegExp(`^<svg xmlns="http://www\\.w3\\.org/2000/svg" width="${v.largeur}" height="${v.hauteur}"`));
    assert.doesNotMatch(svg, /<image|<text|href|<script|@import|url\((?!#)/i, `${v.cle} : élément ou référence externe`);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/, `${v.cle} : nombre invalide dans le SVG`);
  }
});

test("encodeur JPEG : en-tête relu et image décodée par resvg fidèle à l'originale", () => {
  const largeur = 37, hauteur = 21, rgba = new Uint8Array(largeur * hauteur * 4);
  for (let y = 0; y < hauteur; y++) for (let x = 0; x < largeur; x++) {
    const i = (y * largeur + x) * 4;
    rgba.set([Math.round((x / largeur) * 255), Math.round((y / hauteur) * 255), x > 18 ? 200 : 40, 255], i);
  }
  const jpeg = encoderJpeg(rgba, largeur, hauteur, { qualite: 92, commentaire: "essai — é" });
  assert.deepEqual(lireEnteteJpeg(jpeg), { largeur, hauteur, composantes: 3, commentaires: ["essai — é"], fin: true });
  const { Resvg } = createRequire(import.meta.url)("@resvg/resvg-js");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${largeur}" height="${hauteur}">` +
    `<image width="${largeur}" height="${hauteur}" xlink:href="data:image/jpeg;base64,${jpeg.toString("base64")}"/></svg>`;
  const lu = new Resvg(svg, { font: { loadSystemFonts: false } }).render().pixels;
  let ecart = 0;
  for (let i = 0; i < rgba.length; i++) if (i % 4 !== 3) ecart += Math.abs(rgba[i] - lu[i]);
  assert.ok(ecart / (largeur * hauteur * 3) < 3, `écart moyen ${ecart / (largeur * hauteur * 3)}`);
  assert.equal(lireEnteteJpeg(Buffer.from("\x89PNG\r\n")), null);
});

test("documentation : plus aucune image générée par une IA annoncée (README, licence, crédits, docs)", () => {
  for (const f of ["README.md", "README.en.md", "LICENCE-CONTENU.md", "TUTORIEL.md", "TUTORIAL.md", `modules/${M}/CREDITS.md`, "docs/publication.md", "docs/captures/LISEZ-MOI.md"]) {
    assert.doesNotMatch(lireTexte(f), /FLUX|ComfyStudio|générées? localement|generated locally|image model|modèle d'image/i, f);
  }
  for (const f of ["README.md", "README.en.md"]) assert.match(lireTexte(f), /fabriquer-visuels-warcraft/, `${f} : visuels dessinés par programme`);
});

// ---------------------------------------------------------------- Mutations

const original = Object.fromEntries(VISUELS.map(v => [v.chemin, lireOctets(v.chemin)]));
const remplacer = (octets, avant, apres) => {
  const i = octets.indexOf(Buffer.from(avant));
  assert.ok(i >= 0, `« ${avant} » introuvable`);
  const copie = Buffer.from(octets);
  copie.write(apres, i);
  return copie;
};
const MUTATIONS = {
  "visuel absent": { cible: "noel", fichier: () => null },
  "autre format (PNG)": { cible: "carnaval", fichier: () => Buffer.from("\x89PNG\r\n\x1a\n0000", "binary") },
  "JPEG tronqué": { cible: "halloween", fichier: o => o.subarray(0, o.length - 2) },
  "signature retirée (image d'une autre origine)": { cible: "fond", fichier: o => remplacer(o, "dessine par programme", "dessine par machine!!") },
  "empreinte périmée (dessin changé sans refabriquer)": { cible: "musique", fichier: o => { const t = o.toString("latin1"); const i = t.indexOf("svg-sha256=") + 11; return remplacer(o, t.slice(i, i + 8), t[i] === "0" ? "1" + t.slice(i + 1, i + 8) : "0" + t.slice(i + 1, i + 8)); } },
  "dimensions changées": { cible: "nouvel-an", visuels: vs => vs.map(v => (v.cle === "nouvel-an" ? { ...v, largeur: 1920 } : v)) }
};

for (const [nom, m] of Object.entries(MUTATIONS)) {
  test(`mutation : ${nom} — repéré`, () => {
    const cible = VISUELS.find(v => v.cle === m.cible);
    const lire = chemin => (m.fichier && chemin === cible.chemin ? m.fichier(original[chemin]) : original[chemin]);
    const erreurs = verifierVisuels(lire, m.visuels ? m.visuels(VISUELS) : VISUELS);
    assert.ok(erreurs.length > 0, "défaut non repéré");
    assert.ok(erreurs.every(e => e.includes(cible.chemin)), erreurs.join(" | "));
  });
}

test("la signature des visuels ne nomme aucun outil d'IA", () => {
  assert.match(SIGNATURE, /sans IA/);
  assert.doesNotMatch(SIGNATURE, /FLUX|Comfy|diffusion/i);
});
