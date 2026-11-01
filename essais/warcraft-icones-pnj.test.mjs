// Icônes des capacités de tous les PNJ de lakour-warcraft (bestiaire, aventure, campagne) : chacune est une icône peinte
// du cœur de Foundry 14 (modules/lakour-mj-ia/outils/icones-foundry14.txt, jamais un glyphe blanc icons/svg/), jamais
// deux fois sur un même PNJ, presque toutes différentes dans le module ; une attaque magique porte une icône de magie.
// Les PNJ d'aventure et de campagne prennent la leur dans ICONES_PNJ (contenu/icones-pnj.mjs), table sans entrée
// orpheline ni ignorée. La batterie est rejouée sur des copies mutées : chaque règle cassée est détectée.
// Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DOCUMENTS } from "../modules/lakour-warcraft/contenu/index.mjs";
import { BESTIAIRE } from "../modules/lakour-warcraft/contenu/bestiaire.mjs";
import { ICONES_PNJ } from "../modules/lakour-warcraft/contenu/icones-pnj.mjs";
import { pnj, trait } from "../modules/lakour-warcraft/contenu/acteurs.mjs";

const MODULE = "lakour-warcraft";
const COEUR = new Set(readFileSync(new URL("../modules/lakour-mj-ia/outils/icones-foundry14.txt", import.meta.url), "utf8").split(/\r?\n/).filter(Boolean));
const VARIETE_MIN = 0.95;  // part minimale d'icônes différentes parmi toutes les capacités du module

const cleDe = a => a.flags?.[MODULE]?.cle;
// Nom d'objet = nom de la capacité, plus « (recharge 5–6) » ou « (1/jour) » le cas échéant.
const estCapacite = (o, nom) => o.name === nom || o.name.startsWith(`${nom} (`);
const capacites = acteurs => acteurs.flatMap(a => a.__objets.map(o => ({ cle: cleDe(a), o })));

// M : { acteurs, table } ; chaque vérification lève une erreur si sa règle est cassée.
const VERIFICATIONS = {
  "chaque capacité de chaque PNJ a une icône peinte du cœur de Foundry 14"({ acteurs }) {
    const fautes = capacites(acteurs).filter(({ o }) => typeof o.img !== "string" || !COEUR.has(o.img) || o.img.startsWith("icons/svg/"))
      .map(({ cle, o }) => `${cle} : ${o.name} -> ${o.img}`);
    assert.deepEqual(fautes, [], "icônes absentes, inconnues ou glyphes blancs");
  },
  "jamais deux capacités d'un même PNJ sous la même icône"({ acteurs }) {
    const doublons = acteurs.filter(a => new Set(a.__objets.map(o => o.img)).size !== a.__objets.length).map(cleDe);
    assert.deepEqual(doublons, [], "icône répétée sur un PNJ");
  },
  "les icônes sont variées dans tout le module"({ acteurs }) {
    const toutes = capacites(acteurs).map(({ o }) => o.img);
    const distinctes = new Set(toutes).size;
    assert.ok(distinctes >= toutes.length * VARIETE_MIN, `${distinctes} icônes pour ${toutes.length} capacités`);
  },
  "une attaque magique porte une icône de magie"({ acteurs }) {
    const fautes = capacites(acteurs).filter(({ o }) => o.type === "weapon"
      && Object.values(o.system.activities).some(act => act.attack?.type?.classification === "spell")
      && !o.img?.startsWith("icons/magic/")).map(({ cle, o }) => `${cle} : ${o.name} -> ${o.img}`);
    assert.deepEqual(fautes, [], "attaques magiques sous une icône d'arme");
  },
  "ICONES_PNJ n'a ni entrée orpheline ni entrée ignorée"({ acteurs, table }) {
    const fautes = [];
    for (const [cle, icones] of Object.entries(table)) {
      const a = acteurs.find(x => cleDe(x) === cle);
      if (!a) { fautes.push(`${cle} : PNJ inconnu`); continue; }
      for (const [nom, img] of Object.entries(icones)) {
        const o = a.__objets.find(x => estCapacite(x, nom));
        if (!o) fautes.push(`${cle} : « ${nom} » absente`);
        else if (o.img !== img) fautes.push(`${cle} : « ${nom} » porte ${o.img} au lieu de ${img}`);
      }
    }
    assert.deepEqual(fautes, [], "table d'icônes désaccordée");
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
const contexte = () => ({ acteurs: structuredClone(ACTEURS), table: structuredClone(ICONES_PNJ) });
const objets = (M, cle) => M.acteurs.find(a => cleDe(a) === cle).__objets;
const objet = (M, cle, nom) => objets(M, cle).find(o => estCapacite(o, nom));
// Repeint une capacité ET son entrée de table, pour que seule la règle visée casse.
function peindre(M, cle, o, img) {
  o.img = img;
  const nom = Object.keys(M.table[cle] ?? {}).find(k => estCapacite(o, k));
  if (nom) M.table[cle][nom] = img;
}

// Mutation -> [règle qui doit la détecter, mutation].
const [ICONE, REPETEE, VARIETE, MAGIE, TABLE] = Object.keys(VERIFICATIONS);
const MUTATIONS = {
  "glyphe blanc sur un PNJ d'aventure": [ICONE, M => peindre(M, "ezzavel", objet(M, "ezzavel", "Sabots"), "icons/svg/sword.svg")],
  "glyphe blanc sur un PNJ de campagne": [ICONE, M => peindre(M, "diablotin", objet(M, "diablotin", "Invisibilité"), "icons/svg/upgrade.svg")],
  "icône absente du cœur (faute de frappe)": [ICONE, M => peindre(M, "vizzik-tirelire", objet(M, "vizzik-tirelire", "Clé à molette"), "icons/tools/hand/wrench-ajustable.webp")],
  "capacité sans icône": [ICONE, M => peindre(M, "hanuk-pas-de-pluie", objet(M, "hanuk-pas-de-pluie", "Guide des Tarides"), undefined)],
  "deux capacités d'un PNJ sous la même icône": [REPETEE, M => { const o = objets(M, "drogha-embrase"); peindre(M, "drogha-embrase", o[3], o[4].img); }],
  "douze capacités sous la même icône": [VARIETE, M => {
    M.acteurs.filter(a => !CLES_BESTIAIRE.has(cleDe(a))).slice(0, 12).forEach(a => peindre(M, cleDe(a), a.__objets[0], "icons/skills/melee/strike-sword-gray.webp"));
  }],
  "attaque magique sous une icône d'épée": [MAGIE, M => peindre(M, "diablotin", objet(M, "diablotin", "Trait de feu"), "icons/weapons/swords/sword-guard-steel-green.webp")],
  "trait de gangrefeu sous une icône d'arc": [MAGIE, M => peindre(M, "drogha-cendrelame", objet(M, "drogha-cendrelame", "Trait de gangrefeu"), "icons/weapons/bows/bow-recurve-black.webp")],
  "table qui nomme une capacité absente": [TABLE, M => { M.table.ezzavel.Sabot = M.table.ezzavel.Sabots; }],
  "table qui nomme un PNJ inconnu": [TABLE, M => { M.table["murloc-fantome"] = { Amphibie: "icons/magic/water/bubbles-air-water-pink.webp" }; }],
  "entrée de table ignorée (icône remplacée sur l'objet seul)": [TABLE, M => { objet(M, "corwen-haldis", "Vieux soldat").img = "icons/commodities/treasure/medal-ribbon-silver-blue.webp"; }]
};

test("icônes des PNJ : le contenu passe toute la batterie", () => {
  assert.deepEqual(echecs(contexte()), []);
});

test("icônes des PNJ : chaque règle cassée est détectée par la batterie", () => {
  const passees = Object.entries(MUTATIONS).filter(([, [regle, muter]]) => {
    const M = contexte();
    muter(M);
    return !echecs(M).some(e => e.startsWith(`${regle} : `));
  }).map(([nom]) => nom);
  assert.deepEqual(passees, [], "mutations passées inaperçues de leur règle");
  assert.deepEqual(Object.keys(VERIFICATIONS).filter(r => !Object.values(MUTATIONS).some(([regle]) => regle === r)), [], "règle sans mutation");
});

test("icônes des PNJ : la table couvre les 82 capacités d'aventure et de campagne, toutes les icônes du module diffèrent", () => {
  const horsBestiaire = ACTEURS.filter(a => !CLES_BESTIAIRE.has(cleDe(a)));
  assert.deepEqual(horsBestiaire.map(cleDe).filter(cle => !ICONES_PNJ[cle]).sort(), [], "PNJ d'aventure ou de campagne hors table");
  const couvertes = Object.values(ICONES_PNJ).reduce((n, icones) => n + Object.keys(icones).length, 0);
  assert.equal(couvertes, horsBestiaire.reduce((n, a) => n + a.__objets.length, 0), "capacités hors table");
  assert.ok(couvertes >= 82, `${couvertes} capacités dans la table`);
  const toutes = capacites(ACTEURS).map(({ o }) => o.img);
  assert.equal(new Set(toutes).size, toutes.length, "deux capacités du module partagent une icône");
});

test("icônes des PNJ : pnj() applique la table, laisse gagner un img explicite et refuse une entrée orpheline", () => {
  const d = cle => ({
    cle, nom: "Murloc fantôme", fp: 0.25, ca: 11, pv: 7, carac: { for: 10, dex: 12, con: 10, int: 6, sag: 10, cha: 6 }, texte: "Essai.", mj: "Essai.",
    capacites: [trait("Amphibie", "Il respire sous l'eau."), trait("Brume", "Il se dissout.", { img: "icons/magic/air/fog-gas-smoke-gray.webp" })]
  });
  ICONES_PNJ["murloc-fantome"] = { Amphibie: "icons/magic/water/bubbles-air-water-pink.webp", Brume: "icons/magic/air/fog-gas-smoke-green.webp" };
  try {
    const [amphibie, brume] = pnj(d("murloc-fantome")).__objets;
    assert.equal(amphibie.img, "icons/magic/water/bubbles-air-water-pink.webp");
    assert.equal(brume.img, "icons/magic/air/fog-gas-smoke-gray.webp", "l'img de la capacité l'emporte sur la table");
    ICONES_PNJ["murloc-fantome"].Ombre = "icons/magic/perception/silhouette-stealth-shadow.webp";
    assert.throws(() => pnj(d("murloc-fantome")), /ICONES_PNJ nomme des capacités absentes \(Ombre\)/);
  } finally { delete ICONES_PNJ["murloc-fantome"]; }
  assert.match(pnj(d("murloc-perdu")).__objets[0].img, /^icons\/svg\//, "hors table et sans img : le glyphe par défaut");
});
