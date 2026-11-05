// Fabrique les visuels du module lakour-warcraft, DESSINÉS PAR PROGRAMME (aucune image générée par une IA) : le fond de
// l'écran d'accueil du monde (assets/monde/fond.jpg, 1920×1080, aussi « cover » du manifeste) et l'illustration de chacune
// des cinq fêtes de saison (assets/fetes/<fête du calendrier>.jpg, 1280×720, en tête du journal du MJ de la fête).
// Chaque visuel est d'abord un SVG calculé ici (dégradés, silhouettes de collines tirées d'une somme de sinus, motifs,
// étoiles et formes posées par un générateur pseudo-aléatoire à graine fixe, quelques icônes game-icons.net CC BY 3.0 lues
// dans modules/lakour-mj-ia/outils/game-icons/ comme pour les jetons), sans texte ni image externe ; il est rasterisé par
// resvg (@resvg/resvg-js, dépendance de développement épinglée) puis encodé en JPEG par outils/jpeg.mjs. Le commentaire du
// JPEG porte la signature de cet outil et l'empreinte SHA-256 du SVG dont il sort : les essais (essais/warcraft-visuels)
// vérifient que chaque fichier est bien la sortie actuelle de ce fichier, sans avoir besoin de resvg.
// Les scènes suivent le texte alternatif (alt) de chaque fête (contenu/fetes.mjs), qui les décrit.
// Usage : npm run fabriquer-visuels-warcraft     (puis npm run fabriquer-jetons-warcraft si les icônes ont changé : crédits)
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lanceDirectement, lireIcone } from "../modules/lakour-mj-ia/outils/jetons-commun.mjs";
import { AUTEURS } from "../modules/lakour-warcraft/contenu/jetons.mjs";
import { encoderJpeg, lireEnteteJpeg } from "./jpeg.mjs";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = "modules/lakour-warcraft/assets";
export const SIGNATURE = "lakour-warcraft : visuel dessine par programme (outils/fabriquer-visuels-warcraft.mjs), sans IA";
export const QUALITE = 90;

// ---------------------------------------------------------------- Outils de dessin

const n = v => Math.round(v * 10) / 10;
// Générateur pseudo-aléatoire à graine (mulberry32) : même graine, même dessin.
const alea = graine => () => {
  graine = (graine + 0x6d2b79f5) | 0;
  let t = Math.imul(graine ^ (graine >>> 15), 1 | graine);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const entre = (r, a, b) => a + (b - a) * r();

class Toile {
  constructor(largeur, hauteur, titre) { Object.assign(this, { largeur, hauteur, titre, defs: [], corps: [], ids: new Set() }); }
  ajouter(...elements) { this.corps.push(...elements); return this; }
  // Dégradé linéaire (vertical par défaut) : arrets [[décalage, couleur, opacité ?]].
  lineaire(id, arrets, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
    if (!this.ids.has(id)) {
      this.ids.add(id);
      this.defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${arrets.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("")}</linearGradient>`);
    }
    return `url(#${id})`;
  }
  radial(id, arrets, { cx = 0.5, cy = 0.5, r = 0.5 } = {}) {
    if (!this.ids.has(id)) {
      this.ids.add(id);
      this.defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${arrets.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("")}</radialGradient>`);
    }
    return `url(#${id})`;
  }
  // Halo lumineux : disque en dégradé radial de la couleur vers la transparence.
  halo(cx, cy, r, couleur, opacite = 0.5) {
    const id = `halo-${couleur.slice(1)}-${String(opacite).replace(".", "")}`;
    const fond = this.radial(id, [[0, couleur, opacite], [0.45, couleur, opacite * 0.45], [1, couleur, 0]]);
    return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fond}"/>`;
  }
  svg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.largeur}" height="${this.hauteur}" viewBox="0 0 ${this.largeur} ${this.hauteur}">` +
      `<title>${this.titre}</title><defs>${this.defs.join("")}</defs>${this.corps.join("")}</svg>\n`;
  }
}

// Ligne de crête : y(x) = base − amplitude × somme pondérée de sinus (phases tirées au sort).
function crete(r, largeur, base, amplitude, frequences = [1, 2.3, 5.1]) {
  const phases = frequences.map(() => r() * Math.PI * 2), poids = frequences.map((_, i) => 1 / (i + 1));
  const total = poids.reduce((a, b) => a + b, 0);
  return x => base - amplitude * frequences.reduce((s, f, i) => s + poids[i] * Math.sin((x / largeur) * Math.PI * 2 * f + phases[i]), 0) / total;
}
const sousCrete = (y, largeur, hauteur, pas = 8) => {
  let d = `M0 ${hauteur} L0 ${n(y(0))}`;
  for (let x = pas; x < largeur; x += pas) d += ` L${x} ${n(y(x))}`;
  return `${d} L${largeur} ${n(y(largeur))} L${largeur} ${hauteur} Z`;
};
const etoiles = (r, nombre, largeur, hautMax, couleur = "#f4f1ff") => Array.from({ length: nombre }, () => {
  const x = entre(r, 0, largeur), y = Math.pow(r(), 1.4) * hautMax;
  return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(entre(r, 0.5, 1.7))}" fill="${couleur}" fill-opacity="${n((0.25 + 0.75 * r()) * (1 - y / hautMax) * 100) / 100}"/>`;
}).join("");
// Icône game-icons (512×512) centrée sur (cx, cy), de côté `taille`.
const icone = (traces, cx, cy, taille, attributs) =>
  `<g transform="translate(${n(cx - taille / 2)} ${n(cy - taille / 2)}) scale(${n((taille / 512) * 10000) / 10000})">${traces.map(d => `<path ${attributs} d="${d}"/>`).join("")}</g>`;
// Vignettage : bords assombris.
const vignette = t => `<rect width="${t.largeur}" height="${t.hauteur}" fill="${t.radial("vignette", [[0.55, "#000", 0], [1, "#000", 0.6]], { r: 0.75 })}"/>`;
// Frise en zigzag (motif des kraals) en bas de l'image, entre deux filets dorés.
function frise(t, hauteurFrise, couleur = "#d6a64f") {
  const y0 = t.hauteur - hauteurFrise, pas = hauteurFrise * 1.1, haut = y0 + hauteurFrise * 0.28, bas = y0 + hauteurFrise * 0.72;
  let zig = `M0 ${n(bas)}`, losanges = "";
  for (let x = 0, i = 0; x <= t.largeur + pas; x += pas / 2, i++) {
    zig += ` L${n(x)} ${n(i % 2 ? haut : bas)}`;
    if (i % 2 === 0) losanges += `<path d="M${n(x)} ${n(haut - 1)} l${n(hauteurFrise * 0.12)} ${n(hauteurFrise * 0.12)} l-${n(hauteurFrise * 0.12)} ${n(hauteurFrise * 0.12)} l-${n(hauteurFrise * 0.12)} -${n(hauteurFrise * 0.12)} Z" fill="${couleur}" fill-opacity="0.55"/>`;
  }
  return `<rect x="0" y="${y0}" width="${t.largeur}" height="${hauteurFrise}" fill="#0b0608" fill-opacity="0.72"/>` +
    `<path d="M0 ${y0 + 2} H${t.largeur} M0 ${t.hauteur - 3} H${t.largeur}" stroke="${couleur}" stroke-opacity="0.7" stroke-width="2"/>` +
    `<path d="${zig}" fill="none" stroke="${couleur}" stroke-opacity="0.65" stroke-width="2.5" stroke-linejoin="miter"/>${losanges}`;
}
// Cadre doré fin (illustrations des fêtes).
const cadre = t => `<rect x="12" y="12" width="${t.largeur - 24}" height="${t.hauteur - 24}" fill="none" stroke="#e2bf72" stroke-opacity="0.55" stroke-width="2"/>` +
  `<rect x="19" y="19" width="${t.largeur - 38}" height="${t.hauteur - 38}" fill="none" stroke="#e2bf72" stroke-opacity="0.25" stroke-width="1"/>` +
  [[12, 12], [t.largeur - 12, 12], [12, t.hauteur - 12], [t.largeur - 12, t.hauteur - 12]]
    .map(([x, y]) => `<path d="M${x} ${y - 7} L${x + 7} ${y} L${x} ${y + 7} L${x - 7} ${y} Z" fill="#e2bf72" fill-opacity="0.8"/>`).join("");
// Cases et toits d'un village, fenêtres éclairées.
function village(r, x0, x1, sol, couleur, nombre) {
  let s = "";
  for (let i = 0; i < nombre; i++) {
    const x = x0 + (x1 - x0) * (i + r() * 0.6) / nombre, l = entre(r, 26, 52), h = entre(r, 18, 34), y = sol(x + l / 2);
    s += `<path d="M${n(x)} ${n(y + 4)} V${n(y - h)} L${n(x + l / 2)} ${n(y - h - l * 0.45)} L${n(x + l)} ${n(y - h)} V${n(y + 4)} Z" fill="${couleur}"/>`;
    if (r() < 0.8) s += `<rect x="${n(x + l * 0.35)}" y="${n(y - h * 0.65)}" width="${n(l * 0.22)}" height="${n(h * 0.32)}" fill="#ffcf7a" fill-opacity="0.9"/>`;
  }
  return s;
}
// Acacia des savanes : tronc fourchu, houppier plat en ellipses.
function acacia(x, sol, hauteur, couleur) {
  const h = hauteur, y = sol;
  return `<path d="M${n(x - h * 0.03)} ${n(y)} C${n(x - h * 0.02)} ${n(y - h * 0.4)} ${n(x - h * 0.12)} ${n(y - h * 0.65)} ${n(x - h * 0.35)} ${n(y - h * 0.85)}` +
    ` M${n(x + h * 0.03)} ${n(y)} C${n(x + h * 0.04)} ${n(y - h * 0.45)} ${n(x + h * 0.1)} ${n(y - h * 0.7)} ${n(x + h * 0.32)} ${n(y - h * 0.9)}" stroke="${couleur}" stroke-width="${n(h * 0.06)}" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="${n(x - h * 0.3)}" cy="${n(y - h * 0.9)}" rx="${n(h * 0.42)}" ry="${n(h * 0.09)}" fill="${couleur}"/>` +
    `<ellipse cx="${n(x + h * 0.25)}" cy="${n(y - h * 0.95)}" rx="${n(h * 0.5)}" ry="${n(h * 0.1)}" fill="${couleur}"/>` +
    `<ellipse cx="${n(x)}" cy="${n(y - h * 1.02)}" rx="${n(h * 0.34)}" ry="${n(h * 0.08)}" fill="${couleur}"/>`;
}

// ---------------------------------------------------------------- Les scènes

// Écran d'accueil : les Tarides au crépuscule, mesas, kraal, acacias, soleil couchant et les deux lunes.
function dessinerFond(t, r) {
  const { largeur: L, hauteur: H } = t, horizon = 800;
  t.ajouter(`<rect width="${L}" height="${H}" fill="${t.lineaire("ciel", [[0, "#0e0b25"], [0.38, "#2b1a3e"], [0.58, "#6a2a3d"], [0.7, "#b4492d"], [0.76, "#e48d3f"], [1, "#e48d3f"]])}"/>`);
  t.ajouter(etoiles(r, 280, L, 620));
  // Les deux lunes.
  t.ajouter(t.halo(1460, 210, 230, "#c9d6f0", 0.35), `<circle cx="1460" cy="210" r="64" fill="${t.radial("lune", [[0, "#f6f8fc"], [1, "#cfd8ea"]], { cx: 0.4, cy: 0.35, r: 0.7 })}"/>`,
    `<circle cx="1440" cy="196" r="13" fill="#9aa6c0" fill-opacity="0.18"/><circle cx="1484" cy="232" r="9" fill="#9aa6c0" fill-opacity="0.15"/><circle cx="1478" cy="186" r="6" fill="#9aa6c0" fill-opacity="0.15"/>`,
    t.halo(1610, 330, 90, "#9fe0d4", 0.35), `<circle cx="1610" cy="330" r="24" fill="#a9d8cf"/>`);
  // Soleil couchant et brume de chaleur.
  t.ajouter(t.halo(600, horizon, 520, "#ffb35c", 0.5), `<circle cx="600" cy="${horizon}" r="118" fill="${t.radial("soleil", [[0, "#fff1c4"], [0.7, "#ffcf7a"], [1, "#f4a24a"]])}"/>`);
  t.ajouter(`<rect y="${horizon - 120}" width="${L}" height="200" fill="${t.lineaire("brume", [[0, "#e48d3f", 0], [0.6, "#f0a456", 0.3], [1, "#e48d3f", 0]])}"/>`);
  // Mesas lointaines (sommets aplatis), collines, kraal, sol proche.
  const mesas = crete(r, L, 800, 80, [1.3, 3.7, 9.2]);
  t.ajouter(`<path d="${sousCrete(x => Math.max(738, mesas(x)), L, H)}" fill="#6b3039"/>`);
  const collines = crete(r, L, 868, 34, [0.8, 2.9, 7]);
  t.ajouter(`<path d="${sousCrete(collines, L, H)}" fill="#3e1b26"/>`);
  for (let i = 0; i < 6; i++) {
    const x = 1180 + i * 46 + entre(r, -8, 8), l = entre(r, 34, 50), h = entre(r, 42, 62), y = collines(x) + 6;
    t.ajouter(`<path d="M${n(x - l / 2)} ${n(y)} L${n(x)} ${n(y - h)} L${n(x + l / 2)} ${n(y)} Z" fill="#2a1219"/>`,
      `<path d="M${n(x - 6)} ${n(y - h - 9)} L${n(x + 5)} ${n(y - h + 8)} M${n(x + 6)} ${n(y - h - 9)} L${n(x - 5)} ${n(y - h + 8)}" stroke="#2a1219" stroke-width="3"/>`);
    if (i % 2 === 0) t.ajouter(`<path d="M${n(x + l / 2 + 6)} ${n(y)} V${n(y - h - 22)}" stroke="#2a1219" stroke-width="3"/><path d="M${n(x + l / 2 + 7)} ${n(y - h - 22)} l26 6 l-26 7 Z" fill="#8f2f1d"/>`);
  }
  t.ajouter(t.halo(1290, collines(1290) - 10, 70, "#ff9a3a", 0.45));
  const sol = crete(r, L, 965, 22, [0.6, 2.1, 6.4]);
  t.ajouter(`<path d="${sousCrete(sol, L, H)}" fill="#1d0d13"/>`);
  for (const [x, h] of [[300, 190], [1650, 230], [1820, 150]]) t.ajouter(acacia(x, sol(x) + 4, h, "#1d0d13"));
  let herbes = "";
  for (let i = 0; i < 260; i++) { const x = entre(r, 0, L), y = sol(x) + 2, h = entre(r, 6, 18); herbes += `M${n(x)} ${n(y)} l${n(entre(r, -5, 5))} -${n(h)}`; }
  t.ajouter(`<path d="${herbes}" stroke="#1d0d13" stroke-width="2" stroke-linecap="round"/>`);
  t.ajouter(vignette(t), frise(t, 54));
}

// La Trêve des Présents : l'Épineux du Carrefour couvert de grelots, la nuit, présents à son pied.
function dessinerNoel(t, r) {
  const { largeur: L, hauteur: H } = t;
  t.ajouter(`<rect width="${L}" height="${H}" fill="${t.lineaire("ciel", [[0, "#070b22"], [0.55, "#142050"], [0.82, "#2b2c58"], [1, "#3b2f4f"]])}"/>`);
  t.ajouter(etoiles(r, 170, L, 520));
  const sol = crete(r, L, 604, 14, [0.7, 2.2, 5]);
  t.ajouter(t.halo(640, 390, 360, "#ffcf7a", 0.22));
  t.ajouter(village(r, 40, 330, x => sol(x) - 6, "#0e0a14", 6), village(r, 950, 1240, x => sol(x) - 6, "#0e0a14", 5));
  t.ajouter(`<path d="${sousCrete(sol, L, H)}" fill="#120c16"/>`);
  // L'arbre épineux : branches récursives, épines, grelots aux extrémités.
  const branches = [], bouts = [];
  const pousser = (x, y, angle, longueur, epaisseur, profondeur) => {
    const x2 = x + Math.sin(angle) * longueur, y2 = y - Math.cos(angle) * longueur;
    branches.push(`<path d="M${n(x)} ${n(y)} L${n(x2)} ${n(y2)}" stroke-width="${n(epaisseur)}"/>`);
    if (profondeur < 6) for (let k = 0; k < 2; k++) {
      const p = entre(r, 0.3, 0.8), px = x + (x2 - x) * p, py = y + (y2 - y) * p, a = angle + (k ? 1.4 : -1.4);
      branches.push(`<path d="M${n(px)} ${n(py)} l${n(Math.sin(a) * epaisseur * 1.6)} ${n(-Math.cos(a) * epaisseur * 1.6)}" stroke-width="${n(Math.max(1, epaisseur * 0.4))}"/>`);
    }
    if (profondeur === 0) { bouts.push([x2, y2]); return; }
    const nombre = profondeur > 4 ? 2 : r() < 0.35 ? 3 : 2;
    for (let i = 0; i < nombre; i++) {
      const ecart = (i - (nombre - 1) / 2) * entre(r, 0.75, 1.0) + entre(r, -0.12, 0.12);
      pousser(x2, y2, angle * 0.9 + ecart, longueur * entre(r, 0.7, 0.8), epaisseur * 0.66, profondeur - 1);
    }
  };
  pousser(640, sol(640) + 2, 0, 150, 26, 7);
  t.ajouter(`<g stroke="#1b110d" stroke-linecap="round" fill="none">${branches.join("")}</g>`);
  const or = t.lineaire("or", [[0, "#fbe6a2"], [1, "#c8902e"]]);
  // Grelots : cloche évasée et battant, suspendus à un bout de branche sur cinq.
  const grelot = (x, y, s) => `<path d="M${n(x - s * 0.12)} ${n(y)} C${n(x - s * 0.45)} ${n(y + s * 0.1)} ${n(x - s * 0.36)} ${n(y + s * 0.62)} ${n(x - s * 0.52)} ${n(y + s * 0.86)}` +
    ` H${n(x + s * 0.52)} C${n(x + s * 0.36)} ${n(y + s * 0.62)} ${n(x + s * 0.45)} ${n(y + s * 0.1)} ${n(x + s * 0.12)} ${n(y)} Z" fill="${or}" stroke="#7a5418" stroke-width="1"/>` +
    `<circle cx="${n(x)}" cy="${n(y + s * 0.94)}" r="${n(s * 0.11)}" fill="#7a5418"/><path d="M${n(x - s * 0.5)} ${n(y + s * 0.8)} H${n(x + s * 0.5)}" stroke="#fff3c4" stroke-opacity="0.7" stroke-width="1.5"/>`;
  bouts.filter((_, i) => i % 5 === 2).forEach(([x, y], i) => {
    const s = 24 + (i % 3) * 4;
    t.ajouter(`<path d="M${n(x)} ${n(y)} v7" stroke="#3a2a1c" stroke-width="1.5"/>`, t.halo(x, y + 7 + s / 2, s * 1.3, "#ffd98a", 0.35), grelot(x, y + 7, s));
  });
  // Présents au pied de l'arbre.
  const y0 = sol(640) + 6;
  for (const [x, l, h, couleur] of [[548, 58, 40, "#8e2b2b"], [600, 40, 30, "#2d6b6b"], [682, 50, 46, "#5a3a7a"], [732, 42, 28, "#b08a3a"], [518, 34, 24, "#2d6b6b"]]) {
    t.ajouter(`<rect x="${x}" y="${n(y0 - h)}" width="${l}" height="${h}" fill="${couleur}" stroke="#0c070a" stroke-opacity="0.5"/>`,
      `<path d="M${x + l / 2} ${n(y0 - h)} V${n(y0)} M${x} ${n(y0 - h / 2)} H${x + l}" stroke="#f0dca0" stroke-width="3"/>`,
      `<path d="M${x + l / 2} ${n(y0 - h)} l-9 -7 l2 7 Z M${x + l / 2} ${n(y0 - h)} l9 -7 l-2 7 Z" fill="#f0dca0"/>`);
  }
  t.ajouter(vignette(t), frise(t, 36), cadre(t));
}

// La Veille des Aïeux : lampes-étoiles sur la colline des cairns, au-dessus des lumières du Carrefour.
function dessinerNouvelAn(t, r, { lanterne }) {
  const { largeur: L, hauteur: H } = t;
  t.ajouter(`<rect width="${L}" height="${H}" fill="${t.lineaire("ciel", [[0, "#050818"], [0.6, "#121c44"], [1, "#272b56"]])}"/>`);
  t.ajouter(etoiles(r, 230, L, 560));
  const filante = t.lineaire("filante", [[0, "#ffffff", 0.9], [1, "#ffffff", 0]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  for (const [x, y, l, a] of [[180, 90, 160, 0.35], [940, 60, 120, 0.4], [1120, 170, 90, 0.3]]) {
    t.ajouter(`<g transform="translate(${x} ${y}) rotate(${n(a * 57.3)})"><rect width="${l}" height="2" fill="${filante}"/></g>`);
  }
  const colline = x => 700 - 330 * Math.exp(-(((x - 760) / 340) ** 2)) + 8 * Math.sin(x / 37);
  t.ajouter(`<path d="${sousCrete(colline, L, H)}" fill="#16121f"/>`);
  // Cairns : piles de pierres plates sur le haut de la colline.
  for (const x of [560, 640, 705, 780, 850, 925, 990]) {
    const y = colline(x) + 4, etages = 3 + Math.floor(r() * 3);
    let s = "", h = 0;
    for (let e = 0; e < etages; e++) {
      const rx = 24 - e * 4 + entre(r, -2, 2), ry = 7 - e * 0.6;
      s += `<ellipse cx="${n(x + entre(r, -3, 3))}" cy="${n(y - h - ry)}" rx="${n(rx)}" ry="${n(ry)}" fill="${e % 2 ? "#3d3947" : "#4b4656"}" stroke="#6c6680" stroke-opacity="0.6"/>`;
      h += ry * 1.7;
    }
    t.ajouter(s);
  }
  const flamme = t.lineaire("flamme", [[0, "#fff0b8"], [1, "#f2a640"]]);
  // Lampes posées près des cairns, puis lampes qui s'élèvent.
  for (const x of [600, 672, 742, 815, 888, 958]) {
    const y = colline(x) - 22;
    t.ajouter(t.halo(x, y, 46, "#ffc35a", 0.5), icone(lanterne, x, y, 34, `fill="${flamme}"`));
  }
  for (let i = 0; i < 11; i++) {
    const x = entre(r, 470, 1100), y = entre(r, 70, 330), taille = 12 + (y / 330) * 16;
    t.ajouter(t.halo(x, y, taille * 1.5, "#ffc35a", 0.45), icone(lanterne, x, y, taille, `fill="${flamme}" fill-opacity="${n(0.55 + 0.45 * (y / 330))}"`));
  }
  // Le Carrefour en contrebas : toits et fenêtres éclairées.
  const bas = crete(r, L, 676, 10, [0.9, 2.5, 6]);
  t.ajouter(`<path d="${sousCrete(bas, L, H)}" fill="#0c0a12"/>`, village(r, 40, 470, x => bas(x) - 4, "#0c0a12", 9), t.halo(250, bas(250) - 20, 160, "#ffb35c", 0.18));
  t.ajouter(vignette(t), frise(t, 36), cadre(t));
}

// La Nuit des Calebasses : calebasses creusées et éclairées le long d'une piste des Tarides, au crépuscule.
function dessinerHalloween(t, r) {
  const { largeur: L, hauteur: H } = t, horizon = 440;
  t.ajouter(`<rect width="${L}" height="${H}" fill="${t.lineaire("ciel", [[0, "#170e2c"], [0.35, "#3f1d3e"], [0.53, "#94402f"], [0.62, "#e08a3c"], [1, "#e08a3c"]])}"/>`);
  t.ajouter(etoiles(r, 70, L, 220));
  t.ajouter(t.halo(900, horizon, 300, "#ffb35c", 0.5), `<circle cx="900" cy="${horizon}" r="46" fill="#ffd98f"/>`);
  const loin = crete(r, L, horizon + 2, 12, [1.2, 3.1, 7]);
  t.ajouter(`<path d="${sousCrete(loin, L, H)}" fill="#4a2230"/>`);
  for (const [x, h] of [[230, 70], [1080, 56]]) t.ajouter(acacia(x, loin(x) + 2, h, "#3a1a26"));
  const sol = crete(r, L, horizon + 10, 4, [1, 3]);
  t.ajouter(`<path d="${sousCrete(sol, L, H)}" fill="${t.lineaire("sol", [[0, "#3a1d1e"], [1, "#100809"]])}"/>`);
  // La piste, en perspective.
  const centre = u => 640 + 150 * Math.sin(u * 2.7 + 0.5) * (1 - u) * 0.9, yDe = u => horizon + 12 + (H - horizon - 12) * (1 - u) ** 2, demi = u => (380 * (1 - u) ** 2 + 4) / 2;
  const gauche = [], droite = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; gauche.push(`${n(centre(u) - demi(u))} ${n(yDe(u))}`); droite.unshift(`${n(centre(u) + demi(u))} ${n(yDe(u))}`); }
  t.ajouter(`<path d="M${gauche.join(" L")} L${droite.join(" L")} Z" fill="#5a3522" fill-opacity="0.85"/>`);
  // Calebasses, des plus lointaines aux plus proches.
  const visage = "#ffe9a0";
  [0.86, 0.79, 0.71, 0.62, 0.52, 0.41, 0.29, 0.16].forEach((u, i) => {
    const cote = i % 2 ? 1 : -1, s = 0.1 + 0.95 * (1 - u) ** 2, h = 120 * s;
    const x = centre(u) + cote * (demi(u) + h * 0.55), y = yDe(u);
    const r1 = h * 0.38, r2 = h * 0.22, y1 = y - r1, y2 = y1 - r1 - r2 * 0.6;
    t.ajouter(t.halo(x, y1, h * 1.4, "#ffb347", 0.5),
      `<circle cx="${n(x)}" cy="${n(y2)}" r="${n(r2)}" fill="#c8661f"/>`,
      `<path d="M${n(x)} ${n(y2 - r2)} q${n(r2 * 0.2)} -${n(r2 * 0.7)} ${n(r2 * 0.6)} -${n(r2 * 0.8)}" stroke="#4a3a1a" stroke-width="${n(Math.max(1.5, h * 0.05))}" fill="none" stroke-linecap="round"/>`,
      `<circle cx="${n(x)}" cy="${n(y1)}" r="${n(r1)}" fill="${t.radial("calebasse", [[0, "#f39a35"], [1, "#a4451a"]], { cx: 0.42, cy: 0.38, r: 0.65 })}"/>`,
      `<ellipse cx="${n(x)}" cy="${n(y1)}" rx="${n(r1 * 0.45)}" ry="${n(r1)}" fill="none" stroke="#7a3014" stroke-opacity="0.45" stroke-width="${n(Math.max(1, h * 0.02))}"/>`,
      `<path d="M${n(x - r1 * 0.5)} ${n(y1 - r1 * 0.1)} l${n(r1 * 0.18)} -${n(r1 * 0.3)} l${n(r1 * 0.18)} ${n(r1 * 0.3)} Z M${n(x + r1 * 0.14)} ${n(y1 - r1 * 0.1)} l${n(r1 * 0.18)} -${n(r1 * 0.3)} l${n(r1 * 0.18)} ${n(r1 * 0.3)} Z` +
      ` M${n(x - r1 * 0.5)} ${n(y1 + r1 * 0.2)} l${n(r1 * 0.17)} ${n(r1 * 0.2)} l${n(r1 * 0.16)} -${n(r1 * 0.12)} l${n(r1 * 0.17)} ${n(r1 * 0.12)} l${n(r1 * 0.17)} -${n(r1 * 0.12)} l${n(r1 * 0.16)} ${n(r1 * 0.12)} l${n(r1 * 0.17)} -${n(r1 * 0.2)} q-${n(r1 * 0.5)} ${n(r1 * 0.55)} -${n(r1)} 0 Z" fill="${visage}"/>`);
  });
  // Chauves-souris : ailes festonnées en courbes, dessinées dans un carré unité puis mises à l'échelle.
  const aile = "M0 0 Q-0.15 -0.26 -0.5 -0.14 Q-0.43 -0.02 -0.37 0.05 Q-0.3 -0.02 -0.23 0.07 Q-0.15 0 -0.07 0.09 Z";
  for (const [x, y, taille, a] of [[300, 120, 70, -8], [385, 178, 44, 10], [1010, 150, 56, 4]]) {
    t.ajouter(`<g transform="translate(${x} ${y}) rotate(${a}) scale(${taille})" fill="#140a16"><path d="${aile}"/><path d="${aile}" transform="scale(-1 1)"/>` +
      `<ellipse cx="0" cy="0.02" rx="0.06" ry="0.1"/><path d="M-0.05 -0.06 L-0.04 -0.14 L-0.01 -0.08 Z M0.05 -0.06 L0.04 -0.14 L0.01 -0.08 Z"/></g>`);
  }
  t.ajouter(vignette(t), frise(t, 36), cadre(t));
}

// Les Tambours du Long Jour : feux du solstice sur les collines au coucher du soleil, tambours taurens au premier plan.
function dessinerMusique(t, r, { feu }) {
  const { largeur: L, hauteur: H } = t, horizon = 470;
  t.ajouter(`<rect width="${L}" height="${H}" fill="${t.lineaire("ciel", [[0, "#2b1640"], [0.4, "#7b2c45"], [0.6, "#dc5f36"], [0.66, "#f4ad4c"], [1, "#f4ad4c"]])}"/>`);
  t.ajouter(etoiles(r, 40, L, 160));
  t.ajouter(t.halo(470, horizon, 420, "#ffb04a", 0.55), `<circle cx="470" cy="${horizon}" r="88" fill="${t.radial("soleil", [[0, "#fff0c0"], [1, "#ffb04a"]])}"/>`);
  const couches = [[crete(r, L, horizon + 6, 34, [1.1, 2.7, 6]), "#8a3b33", 32], [crete(r, L, 535, 42, [0.9, 2.2, 5.3]), "#5a2229", 50], [crete(r, L, 620, 26, [0.7, 1.9, 4.4]), "#2c1016", 0]];
  const flamme = t.lineaire("flamme", [[0, "#ffe07a"], [1, "#ff5a1f"]]);
  for (const [y, couleur, tailleFeu] of couches) {
    t.ajouter(`<path d="${sousCrete(y, L, H)}" fill="${couleur}"/>`);
    if (!tailleFeu) continue;
    // Un feu sur chaque sommet de la crête (minimum local de y), sauf derrière le soleil.
    for (let x = 30; x < L - 30; x += 6) {
      if (y(x) < y(x - 6) && y(x) <= y(x + 6) && Math.abs(x - 470) > 70) {
        t.ajouter(t.halo(x, y(x) - tailleFeu * 0.4, tailleFeu * 2, "#ff9a3a", 0.55), icone(feu, x, y(x) - tailleFeu * 0.42, tailleFeu, `fill="${flamme}"`));
      }
    }
  }
  // Tambours taurens au premier plan.
  const peau = t.radial("peau", [[0, "#f3e2bb"], [1, "#cdb07a"]]), fut = t.lineaire("fut", [[0, "#3a1a0e"], [0.45, "#8a4a26"], [1, "#2e140a"]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const tambour = (cx, haut, echelle) => {
    const lh = 100 * echelle, lb = 78 * echelle, h = 150 * echelle, ry = 22 * echelle, bas = haut + h;
    let lacage = `M${n(cx - lh)} ${n(haut + ry * 0.4)}`;
    for (let i = 1; i <= 12; i++) {
      const u = i / 12, xh = cx - lh + 2 * lh * u, xb = cx - lb + 2 * lb * u;
      lacage += i % 2 ? ` L${n(xb)} ${n(bas - ry * 0.3)}` : ` L${n(xh)} ${n(haut + ry * 0.4)}`;
    }
    let bande = "";
    for (let i = 0; i < 9; i++) { const x = cx - lh * 0.9 + (i * lh * 1.8) / 9; bande += `M${n(x)} ${n(haut + h * 0.18)} l${n(lh * 0.1)} ${n(h * 0.12)} l${n(lh * 0.1)} -${n(h * 0.12)} Z`; }
    return `<path d="M${n(cx - lh)} ${n(haut)} L${n(cx - lb)} ${n(bas)} A${n(lb)} ${n(ry * 0.8)} 0 0 0 ${n(cx + lb)} ${n(bas)} L${n(cx + lh)} ${n(haut)} Z" fill="${fut}"/>` +
      `<path d="${bande}" fill="#b8372a" fill-opacity="0.85"/>` +
      `<path d="${lacage}" fill="none" stroke="#e2c08a" stroke-width="${n(3 * echelle)}" stroke-linejoin="round"/>` +
      `<ellipse cx="${cx}" cy="${n(haut)}" rx="${n(lh)}" ry="${n(ry)}" fill="${peau}" stroke="#5a2e16" stroke-width="${n(5 * echelle)}"/>` +
      `<path d="M${n(cx + lh * 0.2)} ${n(haut - ry * 0.2)} L${n(cx + lh * 1.05)} ${n(haut - h * 0.75)}" stroke="#6b4022" stroke-width="${n(9 * echelle)}" stroke-linecap="round"/>` +
      `<circle cx="${n(cx + lh * 1.05)}" cy="${n(haut - h * 0.75)}" r="${n(11 * echelle)}" fill="#e2c08a"/>`;
  };
  t.ajouter(t.halo(640, 700, 520, "#ff8a3a", 0.18), tambour(230, 548, 1), tambour(1040, 572, 0.82));
  t.ajouter(vignette(t), frise(t, 36), cadre(t));
}

// La Mascarade de Cabestan : le port la nuit, danseurs masqués sur les barges, pantin de paille géant, guirlandes, feux d'artifice.
function dessinerCarnaval(t, r, { masque }) {
  const { largeur: L, hauteur: H } = t, mer = 430;
  t.ajouter(`<rect width="${L}" height="${H}" fill="${t.lineaire("ciel", [[0, "#0b0a22"], [0.5, "#26173f"], [0.6, "#3d2050"], [1, "#3d2050"]])}"/>`);
  t.ajouter(etoiles(r, 90, L, 380));
  const couleurs = ["#ffd36b", "#ff6fa8", "#6fe0d0", "#ff8a3a"];
  for (const [cx, cy, rayon, c] of [[250, 140, 78, couleurs[0]], [990, 110, 66, couleurs[1]], [1140, 250, 52, couleurs[2]], [420, 260, 44, couleurs[2]]]) {
    let rayons = "";
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + r() * 0.1, l = rayon * entre(r, 0.75, 1);
      rayons += `<path d="M${n(cx + Math.cos(a) * rayon * 0.18)} ${n(cy + Math.sin(a) * rayon * 0.18)} L${n(cx + Math.cos(a) * l)} ${n(cy + Math.sin(a) * l)}"/><circle cx="${n(cx + Math.cos(a) * l * 1.08)}" cy="${n(cy + Math.sin(a) * l * 1.08)}" r="2.2" fill="${c}" stroke="none"/>`;
    }
    t.ajouter(t.halo(cx, cy, rayon * 1.3, c, 0.25), `<g stroke="${c}" stroke-width="2" stroke-opacity="0.85" stroke-linecap="round">${rayons}</g>`);
  }
  // Le port : entrepôts, grue de quai, fenêtres.
  let ville = "";
  for (let x = 20; x < L; ) {
    const l = entre(r, 40, 110), h = entre(r, 20, 70);
    ville += `<rect x="${n(x)}" y="${n(mer - h)}" width="${n(l)}" height="${n(h + 2)}" fill="#150f24"/>`;
    for (let k = 0; k < 3; k++) if (r() < 0.55) ville += `<rect x="${n(x + entre(r, 6, l - 10))}" y="${n(mer - h + entre(r, 6, h - 10))}" width="4" height="5" fill="#ffcf7a"/>`;
    x += l + entre(r, 0, 14);
  }
  t.ajouter(ville, `<path d="M1180 ${mer} V${mer - 150} H1080 M1180 ${mer - 150} L1240 ${mer - 120} M1090 ${mer - 150} V${mer - 95}" stroke="#150f24" stroke-width="6" fill="none"/>`);
  t.ajouter(`<rect y="${mer}" width="${L}" height="${H - mer}" fill="${t.lineaire("mer", [[0, "#1c1b3c"], [1, "#05070f"]])}"/>`);
  let reflets = "";
  for (let i = 0; i < 140; i++) {
    const x = entre(r, 0, L), y = entre(r, mer + 6, H - 40), c = couleurs[i % 4];
    reflets += `<path d="M${n(x)} ${n(y)} h${n(entre(r, 8, 40))}" stroke="${c}" stroke-opacity="${n(entre(r, 0.12, 0.4) * 100) / 100}" stroke-width="2"/>`;
  }
  t.ajouter(reflets);
  // Barges.
  const barge = (x0, x1, pont, h) => `<path d="M${x0} ${pont} H${x1} L${x1 - h * 1.2} ${pont + h} H${x0 + h * 1.2} Z" fill="#1a0f14"/><path d="M${x0} ${pont} H${x1}" stroke="#6a4a3a" stroke-width="3"/>`;
  const danseur = (x, sol, c, bras) => {
    const h = 46;
    return `<path d="M${n(x - 9)} ${sol} L${n(x)} ${n(sol - h * 0.72)} L${n(x + 9)} ${sol} Z" fill="#0e0910"/><circle cx="${n(x)}" cy="${n(sol - h * 0.82)}" r="6" fill="#0e0910"/>` +
      `<rect x="${n(x - 6)}" y="${n(sol - h * 0.86)}" width="12" height="4" fill="${c}"/>` +
      `<path d="M${n(x - 2)} ${n(sol - h * 0.62)} l${n(-14 * Math.cos(bras))} ${n(-14 * Math.sin(bras))} M${n(x + 2)} ${n(sol - h * 0.62)} l${n(14 * Math.cos(bras * 0.7))} ${n(-14 * Math.sin(bras * 0.7))}" stroke="#0e0910" stroke-width="3" stroke-linecap="round"/>`;
  };
  t.ajouter(barge(70, 380, 540, 34), barge(900, 1210, 556, 34));
  for (let i = 0; i < 5; i++) t.ajouter(danseur(110 + i * 58, 540, couleurs[i % 4], entre(r, 0.4, 1.3)), danseur(940 + i * 58, 556, couleurs[(i + 2) % 4], entre(r, 0.4, 1.3)));
  // Le pantin de paille géant sur la barge centrale.
  const pied = 600, cou = 350, cx = 640;
  t.ajouter(t.halo(cx, 470, 330, "#ffb35c", 0.22));
  let paille = "";
  for (let i = 0; i < 46; i++) {
    const u = entre(r, -1, 1), y = entre(r, cou + 10, pied - 8), demiLargeur = 34 + ((y - cou) / (pied - cou)) * 32;
    paille += `M${n(cx + u * demiLargeur)} ${n(y)} l${n(entre(r, -4, 4))} ${n(entre(r, 14, 30))}`;
  }
  let meches = "";
  for (let i = 0; i < 22; i++) { const a = -Math.PI + (i / 21) * Math.PI; meches += `M${n(cx + Math.cos(a) * 34)} ${n(cou - 34 + Math.sin(a) * 34)} l${n(Math.cos(a) * 16)} ${n(Math.sin(a) * 16)}`; }
  const mains = [[cx - 160, 250], [cx + 160, 250]];
  t.ajouter(`<path d="M${cx - 30} ${cou + 6} L${cx - 150} 260 M${cx + 30} ${cou + 6} L${cx + 150} 260" stroke="#c9a24a" stroke-width="22" stroke-linecap="round"/>`,
    `<path d="M${cx - 36} ${cou} L${cx - 68} ${pied} H${cx + 68} L${cx + 36} ${cou} Z" fill="#c9a24a"/>`,
    `<path d="${paille}" stroke="#8a6a28" stroke-opacity="0.7" stroke-width="2"/>`,
    `<path d="M${cx - 50} ${cou + 90} H${cx + 50}" stroke="#b8372a" stroke-width="8"/>`,
    `<circle cx="${cx}" cy="${cou - 34}" r="36" fill="#d9b25a"/><path d="${meches}" stroke="#b08a3a" stroke-width="3" stroke-linecap="round"/>`,
    icone(masque, cx, cou - 36, 74, `fill="#b8372a"`),
    mains.map(([x, y]) => `<path d="M${x} ${y} l-14 -20 M${x} ${y} l0 -24 M${x} ${y} l14 -20" stroke="#c9a24a" stroke-width="5" stroke-linecap="round"/>`).join(""));
  t.ajouter(barge(400, 880, pied, 40));
  for (const [x, k] of [[470, 0], [530, 1], [750, 2], [810, 3]]) t.ajouter(danseur(x, pied, couleurs[k], entre(r, 0.5, 1.2)));
  // Guirlandes de lanternes : des mâts des barges aux mains du pantin.
  const mats = [[300, 540, 360], [990, 556, 380]];
  for (const [x, pont, haut] of mats) t.ajouter(`<path d="M${x} ${pont} V${haut}" stroke="#1a0f14" stroke-width="5"/>`);
  const guirlande = ([ax, ay], [bx, by], creux) => {
    const mx = (ax + bx) / 2, my = Math.max(ay, by) + creux;
    let s = `<path d="M${ax} ${ay} Q${mx} ${my} ${bx} ${by}" stroke="#2a1a1a" stroke-width="1.5" fill="none"/>`;
    for (let i = 1; i < 12; i++) {
      const u = i / 12, x = (1 - u) ** 2 * ax + 2 * (1 - u) * u * mx + u * u * bx, y = (1 - u) ** 2 * ay + 2 * (1 - u) * u * my + u * u * by, c = couleurs[i % 4];
      s += t.halo(x, y + 6, 14, c, 0.35) + `<circle cx="${n(x)}" cy="${n(y + 6)}" r="5" fill="${c}"/>`;
    }
    return s;
  };
  t.ajouter(guirlande([300, 360], mains[0], 70), guirlande(mains[1], [990, 380], 70), guirlande([60, 300], [300, 360], 40), guirlande([990, 380], [1230, 320], 40));
  t.ajouter(vignette(t), frise(t, 36), cadre(t));
}

// ---------------------------------------------------------------- Liste des visuels

// cle, chemin (relatif au dépôt, et à Data/ dans Foundry), dimensions, graine, icônes game-icons (crédits), titre (crédits).
export const VISUELS = [
  { cle: "fond", chemin: `${ASSETS}/monde/fond.jpg`, largeur: 1920, hauteur: 1080, graine: 1871, icones: {},
    titre: "Écran d'accueil — les Tarides au crépuscule", dessin: dessinerFond },
  { cle: "noel", fete: "noel", chemin: `${ASSETS}/fetes/noel.jpg`, largeur: 1280, hauteur: 720, graine: 2412, icones: {},
    titre: "Visuel de fête — La Trêve des Présents", dessin: dessinerNoel },
  { cle: "nouvel-an", fete: "nouvel-an", chemin: `${ASSETS}/fetes/nouvel-an.jpg`, largeur: 1280, hauteur: 720, graine: 101, icones: { lanterne: "lorc/lantern-flame" },
    titre: "Visuel de fête — La Veille des Aïeux", dessin: dessinerNouvelAn },
  { cle: "halloween", fete: "halloween", chemin: `${ASSETS}/fetes/halloween.jpg`, largeur: 1280, hauteur: 720, graine: 3110, icones: {},
    titre: "Visuel de fête — La Nuit des Calebasses", dessin: dessinerHalloween },
  { cle: "musique", fete: "musique", chemin: `${ASSETS}/fetes/musique.jpg`, largeur: 1280, hauteur: 720, graine: 2106, icones: { feu: "lorc/fire-silhouette" },
    titre: "Visuel de fête — Les Tambours du Long Jour", dessin: dessinerMusique },
  { cle: "carnaval", fete: "carnaval", chemin: `${ASSETS}/fetes/carnaval.jpg`, largeur: 1280, hauteur: 720, graine: 1402, icones: { masque: "delapouite/carnival-mask" },
    titre: "Visuel de fête — La Mascarade de Cabestan", dessin: dessinerCarnaval }
];

// Icônes des visuels, au format des jetons ({ icone, titre }) : pour le tableau des crédits (fabriquer-jetons-warcraft).
export const iconesDesVisuels = () => VISUELS.flatMap(v => Object.values(v.icones).map(nom => ({ icone: nom, titre: v.titre })));

// SVG d'un visuel (pur et déterministe : même code, même SVG).
export function svgDuVisuel(v) {
  const icones = Object.fromEntries(Object.entries(v.icones).map(([cle, nom]) => [cle, lireIcone(nom, { auteurs: AUTEURS })]));
  const toile = new Toile(v.largeur, v.hauteur, v.titre.replace(/&/g, "&amp;").replace(/</g, "&lt;"));
  v.dessin(toile, alea(v.graine), icones);
  return toile.svg();
}
export const empreinte = svg => createHash("sha256").update(svg).digest("hex");
export const commentaireDu = svg => `${SIGNATURE} ; svg-sha256=${empreinte(svg)}`;

// ---------------------------------------------------------------- Vérification (utilisée par les essais)

// lire(chemin relatif au dépôt) -> octets (Buffer/Uint8Array) ou null si absent. Renvoie la liste des erreurs.
export function verifierVisuels(lire = chemin => (existsSync(join(RACINE, chemin)) ? readFileSync(join(RACINE, chemin)) : null), visuels = VISUELS) {
  const erreurs = [];
  for (const v of visuels) {
    const octets = lire(v.chemin);
    if (!octets) { erreurs.push(`${v.chemin} absent`); continue; }
    const entete = lireEnteteJpeg(octets);
    if (!entete) { erreurs.push(`${v.chemin} : pas un JPEG lisible`); continue; }
    if (!entete.fin) erreurs.push(`${v.chemin} : JPEG tronqué (pas de marqueur de fin)`);
    if (entete.largeur !== v.largeur || entete.hauteur !== v.hauteur) erreurs.push(`${v.chemin} : ${entete.largeur}×${entete.hauteur} au lieu de ${v.largeur}×${v.hauteur}`);
    if (entete.composantes !== 3) erreurs.push(`${v.chemin} : ${entete.composantes} composante(s) au lieu de 3`);
    const signe = entete.commentaires.find(c => c.startsWith(SIGNATURE));
    if (!signe) erreurs.push(`${v.chemin} : pas la signature de outils/fabriquer-visuels-warcraft.mjs (image d'une autre origine ?)`);
    else if (signe !== commentaireDu(svgDuVisuel(v))) erreurs.push(`${v.chemin} : périmé, relancer npm run fabriquer-visuels-warcraft (le dessin a changé)`);
  }
  return erreurs;
}

// ---------------------------------------------------------------- Fabrication

export async function fabriquerVisuels(visuels = VISUELS) {
  const { Resvg } = await import("@resvg/resvg-js");
  const faits = [];
  for (const v of visuels) {
    const svg = svgDuVisuel(v);
    const image = new Resvg(svg, { fitTo: { mode: "original" }, background: "#000000", font: { loadSystemFonts: false } }).render();
    if (image.width !== v.largeur || image.height !== v.hauteur) throw new Error(`${v.cle} : rendu ${image.width}×${image.height}`);
    const jpeg = encoderJpeg(image.pixels, image.width, image.height, { qualite: QUALITE, commentaire: commentaireDu(svg) });
    const complet = join(RACINE, v.chemin);
    mkdirSync(dirname(complet), { recursive: true });
    writeFileSync(complet, jpeg);
    faits.push({ chemin: v.chemin, octets: jpeg.length });
  }
  return faits;
}

if (lanceDirectement(import.meta.url)) {
  const faits = await fabriquerVisuels();
  for (const f of faits) console.log(`${f.chemin} (${Math.round(f.octets / 1024)} Kio)`);
  console.log(`${faits.length} visuels dessinés par programme. Crédits des icônes : npm run fabriquer-jetons-warcraft`);
}
