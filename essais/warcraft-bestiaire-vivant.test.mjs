// Bestiaire vivant de lakour-warcraft : chaque PNJ (bestiaire, aventure, campagne) a un anneau de jeton dynamique
// (prototypeToken.ring, Foundry v12+) conforme au schéma TokenRingData de Foundry 14, aux couleurs de SA faction
// (contenu/jetons.mjs), assez réduit pour ne pas cacher l'anneau sous le médaillon SVG ; chaque capacité embarquée a une
// icône du cœur de Foundry 14 (modules/lakour-mj-ia/outils/icones-foundry14.txt) et celles du bestiaire sont peintes
// (pas de glyphe icons/svg/) et presque toutes différentes. La batterie est rejouée sur des copies mutées : chaque
// règle cassée est détectée.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { DOCUMENTS } from "../modules/lakour-warcraft/contenu/index.mjs";
import { BESTIAIRE } from "../modules/lakour-warcraft/contenu/bestiaire.mjs";
import { ECHELLE_SUJET, FACTIONS, FACTION_PAR_DEFAUT, FACTION_PNJ, anneauJeton } from "../modules/lakour-warcraft/contenu/jetons.mjs";

const MODULE = "lakour-warcraft";
const RACINE = new URL("../", import.meta.url);
const COEUR = new Set(readFileSync(new URL("modules/lakour-mj-ia/outils/icones-foundry14.txt", RACINE), "utf8").split(/\r?\n/).filter(Boolean));
const existe = img => COEUR.has(img) || (img.startsWith(`modules/${MODULE}/`) && existsSync(new URL(img, RACINE)));

// Schéma de prototypeToken.ring dans Foundry 14 (common/documents/token.mjs, BaseToken.defineSchema) : enabled
// (BooleanField), colors.ring et colors.background (ColorField, « #rrggbb » ou null), effects (entier de 0 à 8388607,
// masque de TokenRing.effects : ENABLED = 0x01), subject.scale (nombre, minimum 0,5) et subject.texture (chemin d'image
// ou null). Foundry prend #ffffff pour « pas de couleur » (TokenRing#configureVisuals) : interdit ici.
const CLES_ANNEAU = ["colors", "effects", "enabled", "subject"];
const COULEUR = /^#[0-9a-f]{6}$/i;
// Bande colorée de l'anneau par défaut (colorBand.startRadius) et rayon du médaillon SVG (197 sur 200).
const DEBUT_BANDE = 0.59, BORD_MEDAILLON = 197 / 200;
const ECART_MIN = 60;  // distance RGB minimale entre deux couleurs d'anneau de factions

const cleDe = a => a.flags?.[MODULE]?.cle;
const rgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const distance = (a, b) => Math.hypot(...rgb(a).map((v, i) => v - rgb(b)[i]));
// Faction attendue selon le type de créature : un démon sert la Légion, un mort-vivant le Fléau, une bête est sauvage.
const FACTION_DU_TYPE = { fiend: "legion", undead: "fleau", beast: "sauvages" };

// M : { acteurs, factions, factionPnj, cles } ; chaque vérification lève une erreur si sa règle est cassée.
const VERIFICATIONS = {
  "chaque PNJ a un anneau conforme au schéma TokenRingData de Foundry 14"({ acteurs }) {
    const fautes = [];
    for (const a of acteurs) {
      const r = a.prototypeToken?.ring;
      const ou = cleDe(a);
      if (!r || typeof r !== "object") { fautes.push(`${ou} : pas d'anneau`); continue; }
      if (JSON.stringify(Object.keys(r).sort()) !== JSON.stringify(CLES_ANNEAU)) fautes.push(`${ou} : champs ${Object.keys(r)}`);
      if (r.enabled !== true) fautes.push(`${ou} : anneau désactivé`);
      const { ring, background, ...autres } = r.colors ?? {};
      if (Object.keys(autres).length) fautes.push(`${ou} : couleurs inconnues ${Object.keys(autres)}`);
      for (const c of [ring, background]) {
        if (!COULEUR.test(c ?? "")) fautes.push(`${ou} : couleur « ${c} » invalide`);
        else if (c.toLowerCase() === "#ffffff") fautes.push(`${ou} : #ffffff vaut « pas de couleur » pour Foundry`);
      }
      if (!Number.isInteger(r.effects) || r.effects < 0 || r.effects > 8388607 || !(r.effects & 1)) fautes.push(`${ou} : effects ${r.effects}`);
      const { scale, texture, ...reste } = r.subject ?? {};
      if (Object.keys(reste).length) fautes.push(`${ou} : sujet ${Object.keys(reste)}`);
      if (typeof scale !== "number" || !(scale >= 0.5)) fautes.push(`${ou} : subject.scale ${scale} (minimum 0,5)`);
      if (texture !== null && !(typeof texture === "string" && existe(texture))) fautes.push(`${ou} : subject.texture ${texture}`);
    }
    assert.deepEqual(fautes, [], "anneaux non conformes");
  },
  "l'anneau n'est pas caché sous le médaillon (sujet réduit)"({ acteurs }) {
    const caches = acteurs.filter(a => !(a.prototypeToken?.ring?.subject?.scale * BORD_MEDAILLON <= DEBUT_BANDE * 1.01)).map(cleDe);
    assert.deepEqual(caches, [], "anneau recouvert par le jeton");
  },
  "chaque PNJ a une faction connue, et l'anneau et le fond de cette faction"({ acteurs, factions, factionPnj }) {
    const fautes = [];
    for (const a of acteurs) {
      const f = factions[factionPnj[cleDe(a)]];
      if (!f) { fautes.push(`${cleDe(a)} : sans faction`); continue; }
      const c = a.prototypeToken?.ring?.colors ?? {};
      if (c.ring !== f.anneau || c.background !== f.fond) fautes.push(`${cleDe(a)} : ${c.ring}/${c.background} au lieu de ${f.anneau}/${f.fond} (${f.nom})`);
    }
    assert.deepEqual(fautes, [], "couleurs hors faction");
  },
  "les démons sont de la Légion, les morts-vivants du Fléau, les bêtes sauvages"({ acteurs, factionPnj }) {
    const fautes = acteurs.filter(a => {
      const attendu = FACTION_DU_TYPE[a.system?.details?.type?.value];
      return attendu && factionPnj[cleDe(a)] !== attendu;
    }).map(a => `${cleDe(a)} (${a.system.details.type.value}) : ${factionPnj[cleDe(a)]}`);
    assert.deepEqual(fautes, [], "faction contraire au type de créature");
  },
  "les factions se distinguent d'un coup d'œil et la table n'a pas de clé orpheline"({ acteurs, factions, factionPnj }) {
    const liste = Object.entries(factions);
    const proches = [];
    for (let i = 0; i < liste.length; i++) {
      for (let j = i + 1; j < liste.length; j++) {
        if (distance(liste[i][1].anneau, liste[j][1].anneau) < ECART_MIN) proches.push(`${liste[i][0]} ~ ${liste[j][0]}`);
      }
    }
    assert.deepEqual(proches, [], "couleurs de factions trop proches");
    const cles = new Set(acteurs.map(cleDe));
    assert.deepEqual(Object.keys(factionPnj).filter(k => !cles.has(k)), [], "FACTION_PNJ cite un PNJ inconnu");
    assert.deepEqual(Object.values(factionPnj).filter(f => !factions[f]), [], "FACTION_PNJ cite une faction inconnue");
    assert.ok(liste.length >= 8, `${liste.length} factions seulement`);
  },
  "chaque capacité a une icône du cœur de Foundry 14 (ou un fichier du module)"({ acteurs }) {
    const absentes = acteurs.flatMap(a => a.__objets.filter(o => typeof o.img !== "string" || !existe(o.img)).map(o => `${cleDe(a)} : ${o.name} -> ${o.img}`));
    assert.deepEqual(absentes, [], "icônes introuvables");
  },
  "les capacités du bestiaire ont des icônes peintes, variées, jamais deux fois sur une créature"({ acteurs, cles }) {
    const bestiaire = acteurs.filter(a => cles.has(cleDe(a)));
    const objets = bestiaire.flatMap(a => a.__objets.map(o => ({ cle: cleDe(a), nom: o.name, img: o.img })));
    assert.deepEqual(objets.filter(o => o.img?.startsWith("icons/svg/")).map(o => `${o.cle} : ${o.nom}`), [], "glyphes svg");
    const doublons = bestiaire.filter(a => new Set(a.__objets.map(o => o.img)).size !== a.__objets.length).map(cleDe);
    assert.deepEqual(doublons, [], "même icône pour deux capacités d'une créature");
    const distinctes = new Set(objets.map(o => o.img)).size;
    assert.ok(distinctes >= objets.length * 0.95, `${distinctes} icônes pour ${objets.length} capacités`);
  }
};

function echecs(M) {
  const liste = [];
  for (const [nom, verifier] of Object.entries(VERIFICATIONS)) {
    try { verifier(M); } catch (e) { liste.push(`${nom} : ${e.message.split("\n")[0]}`); }
  }
  return liste;
}

const ACTEURS = DOCUMENTS.filter(d => d.type === "npc");
const CLES_BESTIAIRE = new Set(BESTIAIRE.map(cleDe));
const contexte = () => ({ acteurs: structuredClone(ACTEURS), factions: structuredClone(FACTIONS), factionPnj: { ...FACTION_PNJ }, cles: CLES_BESTIAIRE });
const acteur = (M, cle) => M.acteurs.find(a => cleDe(a) === cle);
const anneau = (M, cle) => acteur(M, cle).prototypeToken.ring;

const MUTATIONS = {
  "anneau absent"(M) { delete acteur(M, "murloc").prototypeToken.ring; },
  "anneau désactivé"(M) { anneau(M, "ogre").enabled = false; },
  "couleur qui n'est pas #rrggbb"(M) { anneau(M, "loup").colors.ring = "rouge"; },
  "anneau blanc (= pas de couleur)"(M) { anneau(M, "paysan").colors.ring = "#ffffff"; },
  "champ inconnu dans l'anneau"(M) { anneau(M, "gnoll").couleur = "#8b5a2b"; },
  "effets sans le bit ENABLED"(M) { anneau(M, "harpie").effects = 2; },
  "échelle du sujet sous le minimum de Foundry"(M) { anneau(M, "satyre").subject.scale = 0.4; },
  "sujet à l'échelle 1 : le médaillon cache l'anneau"(M) { anneau(M, "goule").subject.scale = 1; },
  "texture de sujet introuvable"(M) { anneau(M, "naga").subject.texture = `modules/${MODULE}/assets/jetons/sujets/naga.webp`; },
  "goule aux couleurs de l'Alliance"(M) { Object.assign(anneau(M, "goule").colors, { ring: FACTIONS.alliance.anneau, background: FACTIONS.alliance.fond }); },
  "fond d'une autre faction"(M) { anneau(M, "grunt-orgrimmar").colors.background = FACTIONS.alliance.fond; },
  "PNJ sans faction"(M) { delete M.factionPnj["dragonnet-noir"]; },
  "diablotin rangé chez les neutres (et peint comme eux)"(M) {
    M.factionPnj.diablotin = "neutres";
    Object.assign(anneau(M, "diablotin").colors, { ring: FACTIONS.neutres.anneau, background: FACTIONS.neutres.fond });
  },
  "deux factions presque de la même couleur"(M) { M.factions.horde.anneau = "#b02a20"; M.factions.defias.anneau = "#b3261e"; },
  "faction orpheline dans la table"(M) { M.factionPnj["murloc-fantome"] = "sauvages"; },
  "icône de capacité absente du cœur (faute de frappe)"(M) { acteur(M, "gnoll").__objets[0].img = "icons/creatures/abilities/fangs-teeth-bitte.webp"; },
  "icône de capacité de l'aventure absente"(M) { acteur(M, "ezzavel").__objets[0].img = "icons/svg/inexistant.svg"; },
  "glyphe blanc dans le bestiaire"(M) { acteur(M, "loup").__objets[1].img = "icons/svg/sword.svg"; },
  "deux capacités d'une créature sous la même icône"(M) { const o = acteur(M, "chef-defias").__objets; o[1].img = o[2].img; },
  "dix capacités sous la même icône"(M) {
    M.acteurs.filter(a => CLES_BESTIAIRE.has(cleDe(a))).slice(0, 10).forEach(a => { a.__objets[0].img = "icons/skills/melee/strike-sword-gray.webp"; });
  }
};

test("bestiaire vivant : le contenu passe toute la batterie", () => {
  assert.deepEqual(echecs(contexte()), []);
});

test("bestiaire vivant : chaque règle cassée est détectée par la batterie", () => {
  const passees = Object.entries(MUTATIONS).filter(([, muter]) => { const M = contexte(); muter(M); return !echecs(M).length; }).map(([nom]) => nom);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

test("bestiaire vivant : 70 PNJ, toutes les factions servent, un PNJ hors table prend les couleurs neutres", () => {
  assert.equal(ACTEURS.length, 70);   // 30 du bestiaire, 6 de l'aventure, 12 de la campagne, 4 du one-shot, 3 boss du donjon, 5 montures, 9 rares, le familier du rôdeur
  assert.equal(CLES_BESTIAIRE.size, 30);
  assert.deepEqual(Object.keys(FACTIONS).filter(f => !Object.values(FACTION_PNJ).includes(f)), [], "faction sans PNJ");
  // Hors table (PNJ d'essai) : anneau neutre, mais la batterie ci-dessus refuse tout PNJ du module absent de FACTION_PNJ.
  assert.equal(anneauJeton("murloc-fantome").colors.ring, FACTIONS[FACTION_PAR_DEFAUT].anneau);
  assert.equal(ECHELLE_SUJET, anneauJeton("murloc").subject.scale);
});

test("bestiaire vivant : 188 capacités, plus de 100 icônes différentes, une par capacité dans le bestiaire", () => {
  const toutes = ACTEURS.flatMap(a => a.__objets);
  const bestiaire = ACTEURS.filter(a => CLES_BESTIAIRE.has(cleDe(a))).flatMap(a => a.__objets);
  assert.ok(toutes.length >= 188, `${toutes.length} capacités`);
  assert.ok(new Set(toutes.map(o => o.img)).size > 100, "trop peu d'icônes différentes");
  assert.equal(new Set(bestiaire.map(o => o.img)).size, bestiaire.length, "deux capacités du bestiaire partagent une icône");
});
