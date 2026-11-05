// Encodeur JPEG minimal, sans dépendance : JPEG de base (baseline, 8 bits), trois composantes YCbCr sans
// sous-échantillonnage (4:4:4), tables de quantification de l'annexe K de la norme mises à l'échelle de la qualité, tables
// de Huffman optimisées pour l'image (deux passes, longueurs limitées à 16 bits comme le prévoit l'annexe K.2), segment
// JFIF et commentaire (COM) facultatif. Sert à outils/fabriquer-visuels-warcraft.mjs, qui rasterise ses SVG avec resvg
// (qui ne sait écrire que du PNG). lireEnteteJpeg relit les segments d'en-tête (dimensions, composantes, commentaires) :
// utilisé par les essais.

// Ordre en zigzag : ZIGZAG[k] = indice naturel (ligne × 8 + colonne) du k-ième coefficient.
export const ZIGZAG = (() => {
  const ordre = [];
  for (let s = 0; s < 15; s++) {
    const diagonale = [];
    for (let y = 0; y < 8; y++) { const x = s - y; if (x >= 0 && x < 8) diagonale.push(y * 8 + x); }
    if (s % 2 === 0) diagonale.reverse();
    ordre.push(...diagonale);
  }
  return ordre;
})();

// Tables de quantification de référence (annexe K, tableaux K.1 et K.2), ordre naturel.
const QUANT_LUMINANCE = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99];
const QUANT_CHROMINANCE = [
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99,
  47, 66, 99, 99, 99, 99, 99, 99, ...new Array(32).fill(99)];

function tableQuant(base, qualite) {
  const q = Math.max(1, Math.min(100, Math.round(qualite)));
  const echelle = q < 50 ? 5000 / q : 200 - 2 * q;
  return base.map(v => Math.max(1, Math.min(255, Math.floor((v * echelle + 50) / 100))));
}

// Cosinus de la DCT 8×8 : COS[u * 8 + x] = c(u)/2 · cos((2x + 1)uπ/16), c(0) = 1/√2.
const COS = new Float64Array(64);
for (let u = 0; u < 8; u++) for (let x = 0; x < 8; x++) COS[u * 8 + x] = (u === 0 ? Math.SQRT1_2 : 1) / 2 * Math.cos((2 * x + 1) * u * Math.PI / 16);

// DCT d'un bloc (64 échantillons centrés sur 0, ordre naturel), quantifiée, rangée en zigzag.
function blocQuantifie(bloc, quant, sortie, decalage) {
  const tmp = new Float64Array(64), coef = new Float64Array(64);
  for (let y = 0; y < 8; y++) for (let u = 0; u < 8; u++) {
    let s = 0; for (let x = 0; x < 8; x++) s += COS[u * 8 + x] * bloc[y * 8 + x];
    tmp[y * 8 + u] = s;
  }
  for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) {
    let s = 0; for (let y = 0; y < 8; y++) s += COS[v * 8 + y] * tmp[y * 8 + u];
    coef[v * 8 + u] = s;
  }
  for (let k = 0; k < 64; k++) { const i = ZIGZAG[k]; sortie[decalage + k] = Math.round(coef[i] / quant[i]); }
}

const categorie = v => { let a = Math.abs(v), n = 0; while (a) { n++; a >>= 1; } return n; };

// Table de Huffman optimale (libjpeg, jpeg_gen_optimal_table) : frequences[0..255] -> { bits[1..16], valeurs, code, taille }.
export function tableHuffman(frequences) {
  const freq = Array.from({ length: 257 }, (_, i) => frequences[i] ?? 0);
  if (!freq.some(Boolean)) freq[0] = 1;
  freq[256] = 1; // symbole réservé : aucun code n'est fait que de 1
  const taille = new Array(257).fill(0), suivant = new Array(257).fill(-1);
  for (;;) {
    let c1 = -1, c2 = -1, v = Infinity;
    for (let i = 0; i < 257; i++) if (freq[i] && freq[i] <= v) { v = freq[i]; c1 = i; }
    v = Infinity;
    for (let i = 0; i < 257; i++) if (freq[i] && freq[i] <= v && i !== c1) { v = freq[i]; c2 = i; }
    if (c2 < 0) break;
    freq[c1] += freq[c2]; freq[c2] = 0;
    taille[c1]++; while (suivant[c1] >= 0) { c1 = suivant[c1]; taille[c1]++; }
    suivant[c1] = c2;
    taille[c2]++; while (suivant[c2] >= 0) { c2 = suivant[c2]; taille[c2]++; }
  }
  const MAX = 64, bits = new Array(MAX + 1).fill(0);
  for (let i = 0; i < 257; i++) if (taille[i]) { if (taille[i] > MAX) throw new Error("table de Huffman trop profonde"); bits[taille[i]]++; }
  for (let i = MAX; i > 16; i--) {
    while (bits[i] > 0) {
      let j = i - 2; while (bits[j] === 0) j--;
      bits[i] -= 2; bits[i - 1]++; bits[j + 1] += 2; bits[j]--;
    }
  }
  let i = 16; while (bits[i] === 0) i--; bits[i]--; // retire le symbole réservé
  const valeurs = [];
  for (let l = 1; l <= MAX; l++) for (let s = 0; s < 256; s++) if (taille[s] === l) valeurs.push(s);
  const code = new Int32Array(256), longueur = new Int32Array(256);
  let c = 0, k = 0;
  for (let l = 1; l <= 16; l++) {
    for (let n = 0; n < bits[l]; n++) { code[valeurs[k]] = c; longueur[valeurs[k]] = l; c++; k++; }
    c <<= 1;
  }
  return { bits: bits.slice(1, 17), valeurs, code, longueur };
}

// Écriture bit à bit, avec l'octet de bourrage après chaque 0xFF.
class Bits {
  constructor() { this.octets = []; this.tampon = 0; this.n = 0; }
  ecrire(valeur, n) {
    for (let i = n - 1; i >= 0; i--) {
      this.tampon = (this.tampon << 1) | ((valeur >> i) & 1);
      if (++this.n === 8) { this.octets.push(this.tampon); if (this.tampon === 0xff) this.octets.push(0); this.tampon = 0; this.n = 0; }
    }
  }
  vider() { while (this.n) this.ecrire(1, 1); return this.octets; }
}

const segment = (marqueur, donnees) => [0xff, marqueur, (donnees.length + 2) >> 8, (donnees.length + 2) & 0xff, ...donnees];

// rgba : pixels RVBA (Uint8Array, largeur × hauteur × 4 ; l'alpha est ignoré). Renvoie un Buffer JPEG.
export function encoderJpeg(rgba, largeur, hauteur, { qualite = 90, commentaire = "" } = {}) {
  if (rgba.length < largeur * hauteur * 4) throw new Error("pixels trop courts pour ces dimensions");
  const quants = [tableQuant(QUANT_LUMINANCE, qualite), tableQuant(QUANT_CHROMINANCE, qualite)];
  const bx = Math.ceil(largeur / 8), by = Math.ceil(hauteur / 8), nBlocs = bx * by;
  // Plans Y, Cb, Cr (centrés sur 0).
  const plans = [new Float32Array(largeur * hauteur), new Float32Array(largeur * hauteur), new Float32Array(largeur * hauteur)];
  for (let p = 0, i = 0; p < largeur * hauteur; p++, i += 4) {
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    plans[0][p] = 0.299 * r + 0.587 * g + 0.114 * b - 128;
    plans[1][p] = -0.168736 * r - 0.331264 * g + 0.5 * b;
    plans[2][p] = 0.5 * r - 0.418688 * g - 0.081312 * b;
  }
  // Première passe : coefficients quantifiés (zigzag) de chaque bloc, et fréquences des symboles.
  const coefs = plans.map(() => new Int16Array(nBlocs * 64));
  const bloc = new Float64Array(64);
  for (let c = 0; c < 3; c++) {
    for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
      for (let y = 0; y < 8; y++) {
        const py = Math.min(hauteur - 1, j * 8 + y);
        for (let x = 0; x < 8; x++) bloc[y * 8 + x] = plans[c][py * largeur + Math.min(largeur - 1, i * 8 + x)];
      }
      blocQuantifie(bloc, quants[c ? 1 : 0], coefs[c], (j * bx + i) * 64);
    }
  }
  const freqDc = [new Array(256).fill(0), new Array(256).fill(0)], freqAc = [new Array(256).fill(0), new Array(256).fill(0)];
  const parcourir = (surDc, surAc) => {
    const pred = [0, 0, 0];
    for (let n = 0; n < nBlocs; n++) for (let c = 0; c < 3; c++) {
      const t = c ? 1 : 0, q = coefs[c], o = n * 64;
      const diff = q[o] - pred[c]; pred[c] = q[o];
      surDc(t, diff);
      let course = 0;
      for (let k = 1; k < 64; k++) {
        const v = q[o + k];
        if (v === 0) { course++; continue; }
        while (course > 15) { surAc(t, 0xf0, 0, 0); course -= 16; }
        surAc(t, (course << 4) | categorie(v), v, categorie(v));
        course = 0;
      }
      if (course > 0) surAc(t, 0x00, 0, 0);
    }
  };
  parcourir((t, diff) => freqDc[t][categorie(diff)]++, (t, symbole) => freqAc[t][symbole]++);
  const dc = freqDc.map(tableHuffman), ac = freqAc.map(tableHuffman);
  // Seconde passe : codage entropique.
  const sortie = new Bits();
  const valeurBits = (v, n) => (v < 0 ? v + (1 << n) - 1 : v);
  parcourir(
    (t, diff) => { const n = categorie(diff); sortie.ecrire(dc[t].code[n], dc[t].longueur[n]); if (n) sortie.ecrire(valeurBits(diff, n), n); },
    (t, symbole, v, n) => { sortie.ecrire(ac[t].code[symbole], ac[t].longueur[symbole]); if (n) sortie.ecrire(valeurBits(v, n), n); }
  );
  const donnees = sortie.vider();
  // En-têtes.
  const octets = [0xff, 0xd8];
  octets.push(...segment(0xe0, [0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]));
  if (commentaire) {
    const texte = [...Buffer.from(commentaire, "utf8")];
    if (texte.length > 65000) throw new Error("commentaire JPEG trop long");
    octets.push(...segment(0xfe, texte));
  }
  octets.push(...segment(0xdb, [0, ...ZIGZAG.map(i => quants[0][i]), 1, ...ZIGZAG.map(i => quants[1][i])]));
  octets.push(...segment(0xc0, [8, hauteur >> 8, hauteur & 0xff, largeur >> 8, largeur & 0xff, 3, 1, 0x11, 0, 2, 0x11, 1, 3, 0x11, 1]));
  const dht = [];
  for (const [classe, tables] of [[0, dc], [1, ac]]) tables.forEach((t, id) => dht.push((classe << 4) | id, ...t.bits, ...t.valeurs));
  octets.push(...segment(0xc4, dht));
  octets.push(...segment(0xda, [3, 1, 0x00, 2, 0x11, 3, 0x11, 0, 63, 0]));
  return Buffer.concat([Buffer.from(octets), Buffer.from(donnees), Buffer.from([0xff, 0xd9])]);
}

// En-tête d'un JPEG : { largeur, hauteur, composantes, commentaires: [texte…], fin } ; null si ce n'est pas un JPEG lisible.
export function lireEnteteJpeg(octets) {
  if (!octets || octets.length < 4 || octets[0] !== 0xff || octets[1] !== 0xd8) return null;
  const sortie = { largeur: 0, hauteur: 0, composantes: 0, commentaires: [], fin: octets[octets.length - 2] === 0xff && octets[octets.length - 1] === 0xd9 };
  let i = 2;
  while (i + 4 <= octets.length) {
    if (octets[i] !== 0xff) return null;
    const marqueur = octets[i + 1], longueur = (octets[i + 2] << 8) | octets[i + 3];
    const debut = i + 4, fin = i + 2 + longueur;
    if (fin > octets.length) return null;
    if (marqueur === 0xfe) sortie.commentaires.push(Buffer.from(octets.subarray(debut, fin)).toString("utf8"));
    if (marqueur >= 0xc0 && marqueur <= 0xc2) {
      sortie.hauteur = (octets[debut + 1] << 8) | octets[debut + 2];
      sortie.largeur = (octets[debut + 3] << 8) | octets[debut + 4];
      sortie.composantes = octets[debut + 5];
    }
    if (marqueur === 0xda) return sortie;
    i = fin;
  }
  return null;
}
