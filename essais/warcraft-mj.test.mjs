// Essais du côté MJ de lakour-warcraft : PNJ dnd5e bien formés (clés valides, attaques avec bonus et dégâts
// cohérents), jetons présents, cartes jouables avec pièces, éléments nommés et description, figurants cohérents,
// aventure (journal du MJ caché qui cite les cartes). Essai de mutation : un PNJ faux est refusé.
// Régénérer : npm run fabriquer-jetons-warcraft, puis npm run fabriquer-warcraft.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fabriquer } from "../outils/fabriquer-warcraft.mjs";
import { FICHIER_FIGURANTS, verifierJetons } from "../outils/fabriquer-jetons-warcraft.mjs";
import { attaque, maitrise, modificateur, pnj, sauvegarde, trait } from "../modules/lakour-warcraft/contenu/acteurs.mjs";
import { BESTIAIRE } from "../modules/lakour-warcraft/contenu/bestiaire.mjs";
import { CARTES, TITRE_AVENTURE } from "../modules/lakour-warcraft/contenu/aventure-cartes.mjs";
import { CARTES_LIEUX } from "../modules/lakour-warcraft/contenu/lieux-cartes.mjs";
import { TYPES_FIGURANTS, cheminJeton, cheminJeton3d } from "../modules/lakour-warcraft/contenu/jetons.mjs";

const M = "lakour-warcraft";
const fabriques = fabriquer();
const docs = fabriques.map(d => d.doc);
const pnjs = fabriques.filter(d => d.pack === "bestiaire").map(d => d.doc);
const scenes = fabriques.filter(d => d.pack === "scenes").map(d => d.doc);
const racine = new URL("../", import.meta.url);
const lire = chemin => { try { return readFileSync(new URL(chemin, racine), "utf8"); } catch { return null; } };

// ---------------------------------------------------------------- Vérification d'un PNJ fabriqué (dnd5e 6.0.6)

const CARACS = ["str", "dex", "con", "int", "wis", "cha"];
const TAILLES = ["tiny", "sm", "med", "lg", "huge", "grg"];
const TYPES = ["aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead"];
const DEGATS = ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
const ETATS = ["blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious"];
const ACTIVITES = ["attack", "save", "utility"];
const ID = /^[A-Za-z0-9]{16}$/;

function erreursPnj(a) {
  const e = [];
  const s = a.system ?? {};
  if (a.type !== "npc") e.push("type d'acteur");
  if (a._key !== `!actors!${a._id}` || !ID.test(a._id)) e.push("_id/_key");
  if (!a.flags?.[M]?.cle) e.push("flags.cle");
  if (Object.keys(s.abilities ?? {}).sort().join() !== [...CARACS].sort().join()) e.push(`caractéristiques ${Object.keys(s.abilities ?? {})}`);
  for (const [k, v] of Object.entries(s.abilities ?? {})) if (!Number.isInteger(v.value) || v.value < 1 || v.value > 30) e.push(`valeur de ${k}`);
  if (!TAILLES.includes(s.traits?.size)) e.push(`taille ${s.traits?.size}`);
  if (!TYPES.includes(s.details?.type?.value)) e.push(`type ${s.details?.type?.value}`);
  if (typeof s.details?.cr !== "number") e.push("FP");
  if (!(s.attributes?.hp?.max > 0) || s.attributes.hp.value !== s.attributes.hp.max) e.push("PV");
  if (!(s.attributes?.ac?.flat >= 5) || s.attributes.ac.calc !== "natural") e.push("CA");
  if (!(Number(s.attributes?.movement?.walk) > 0) || s.attributes.movement.units !== "m") e.push("vitesse");
  for (const t of ["di", "dr", "dv"]) for (const v of s.traits?.[t]?.value ?? []) if (!DEGATS.includes(v)) e.push(`${t} ${v}`);
  for (const v of s.traits?.ci?.value ?? []) if (!ETATS.includes(v)) e.push(`état ${v}`);
  if (!s.details?.biography?.public || !s.details.biography.value.includes("Note du MJ")) e.push("biographie (texte joueur et note MJ)");
  if (!a.items?.length) e.push("aucun objet");
  const prof = maitrise(s.details?.cr ?? 0);
  for (const it of a.items ?? []) {
    const ou = `${it.name}`;
    if (!["weapon", "feat"].includes(it.type)) e.push(`${ou} : type ${it.type}`);
    if (it._key !== `!actors.items!${a._id}.${it._id}` || !ID.test(it._id)) e.push(`${ou} : _id/_key`);
    if (!it.system?.description?.value) e.push(`${ou} : description`);
    const activites = Object.entries(it.system?.activities ?? {});
    if (it.type === "weapon" && !activites.some(([, x]) => x.type === "attack")) e.push(`${ou} : arme sans attaque`);
    for (const [cle, x] of activites) {
      if (cle !== x._id || !ID.test(cle)) e.push(`${ou} : identifiant d'activité`);
      if (!ACTIVITES.includes(x.type)) e.push(`${ou} : activité ${x.type}`);
      for (const p of x.damage?.parts ?? []) {
        if (!(p.number > 0 && p.denomination > 0)) e.push(`${ou} : dés de dégâts`);
        for (const t of p.types) if (!DEGATS.includes(t)) e.push(`${ou} : dégâts ${t}`);
      }
      if (x.type === "attack") {
        if (!CARACS.includes(x.attack?.ability) || x.attack.flat) e.push(`${ou} : caractéristique d'attaque`);
        if (!x.damage?.parts?.length) e.push(`${ou} : attaque sans dégâts`);
        const bonus = modificateur(s.abilities?.[x.attack?.ability]?.value ?? 10) + prof + Number(x.attack?.bonus || 0);
        if (bonus !== it.flags?.[M]?.toucher) e.push(`${ou} : bonus calculé ${bonus} ≠ annoncé ${it.flags?.[M]?.toucher}`);
        if (!new RegExp(`\\${bonus >= 0 ? "+" : ""}${bonus}\\b`).test(it.system.description.value)) e.push(`${ou} : bonus absent du texte`);
      }
      if (x.type === "save") {
        if (!x.save?.ability?.length || !x.save.ability.every(c => CARACS.includes(c))) e.push(`${ou} : caractéristique de sauvegarde`);
        if (!(Number(x.save?.dc?.formula) >= 8)) e.push(`${ou} : DD`);
      }
    }
  }
  return e;
}

test("le bestiaire compte 25 à 30 créatures et PNJ types, de FP 1/8 à 5", () => {
  assert.ok(BESTIAIRE.length >= 25 && BESTIAIRE.length <= 30, `${BESTIAIRE.length} créatures`);
  const fps = BESTIAIRE.map(b => b.system.details.cr);
  assert.equal(Math.min(...fps.filter(f => f > 0)), 0.125);
  assert.ok(Math.max(...fps) <= 5);
});

test("chaque PNJ est un acteur dnd5e bien formé, attaques avec bonus et dégâts cohérents", () => {
  assert.ok(pnjs.length >= 30);
  for (const a of pnjs) assert.deepEqual(erreursPnj(a), [], a.name);
  // Au moins une attaque, une sauvegarde et une action utilitaire dans l'ensemble du bestiaire.
  const types = new Set(pnjs.flatMap(a => a.items.flatMap(i => Object.values(i.system.activities ?? {}).map(x => x.type))));
  assert.deepEqual([...types].sort(), ACTIVITES);
});

test("exemple : la goule mord à +4 pour 1d6+2 perforants et 1d6 nécrotiques, ses griffes paralysent (Con DD 10)", () => {
  const goule = pnjs.find(a => a.flags[M].cle === "goule");
  const morsure = goule.items.find(i => i.name === "Morsure");
  const att = Object.values(morsure.system.activities)[0];
  assert.equal(att.attack.ability, "dex");
  assert.equal(modificateur(goule.system.abilities.dex.value) + maitrise(goule.system.details.cr), 4);
  assert.deepEqual(att.damage.parts.map(p => [p.number, p.denomination, p.bonus, p.types[0]]), [[1, 6, "2", "piercing"], [1, 6, "", "necrotic"]]);
  const griffes = goule.items.find(i => i.name === "Griffes");
  const sauv = Object.values(griffes.system.activities).find(x => x.type === "save");
  assert.deepEqual(sauv.save, { ability: ["con"], dc: { calculation: "", formula: "10" } });
  assert.deepEqual(goule.system.traits.di.value, ["poison"]);
  assert.equal(goule.prototypeToken.disposition, -1);
});

test("chaque PNJ a son jeton (plat et relief), présent et de la couleur de son attitude", () => {
  assert.deepEqual(verifierJetons(pnjs, lire), []);
  for (const a of pnjs) {
    const cle = a.flags[M].cle;
    assert.ok(existsSync(new URL(cheminJeton(cle), racine)), cle);
    assert.ok(existsSync(new URL(cheminJeton3d(cle), racine)), `${cle} (3D)`);
    assert.equal(a.prototypeToken.width, { lg: 2, huge: 3, grg: 4 }[a.system.traits.size] ?? 1, `${cle} : taille du jeton`);
  }
});

test("figurants.json : une douzaine de types, chacun avec un libellé et un jeton existant", () => {
  const types = JSON.parse(lire(FICHIER_FIGURANTS));
  assert.deepEqual(types, TYPES_FIGURANTS);
  assert.ok(Object.keys(types).length >= 12);
  for (const attendu of ["paysan", "garde-alliance", "grunt", "marchand", "pelerin", "mineur", "marin", "enfant", "pretre", "bandit", "kobold", "murloc"]) {
    assert.ok(types[attendu], `type ${attendu} manquant`);
  }
  for (const [type, f] of Object.entries(types)) {
    assert.ok(f.libelle, type);
    assert.ok(lire(cheminJeton(f.jeton)) && lire(cheminJeton3d(f.jeton)), `${type} : jeton ${f.jeton} absent`);
  }
});

test("les crédits citent game-icons (CC BY 3.0) et le SRD 5.2 (CC BY 4.0)", () => {
  const texte = lire("modules/lakour-warcraft/CREDITS.md");
  assert.match(texte, /CC BY 3\.0/);
  assert.match(texte, /System Reference Document 5\.2/);
  assert.match(texte, /Creative Commons Attribution 4\.0/);
  for (const auteur of ["Lorc", "Delapouite"]) assert.match(texte, new RegExp(`Icons made by .*${auteur}`));
});

test("les cartes : pièces, éléments nommés, description, auteur de chaque dessin, fonds plat et relief", () => {
  const miennes = [...CARTES, ...CARTES_LIEUX].map(c => c.flags[M].cle);
  assert.equal(CARTES.length, 4);
  assert.ok(CARTES_LIEUX.length >= 6 && CARTES_LIEUX.length <= 8);
  const plans = JSON.parse(lire("modules/lakour-warcraft/assets/cartes/plans.json"));
  for (const cle of miennes) {
    const s = scenes.find(x => x.flags[M].cle === cle);
    assert.ok(s, `scène ${cle} absente des compendiums`);
    const { plan, description } = s.flags[M];
    assert.ok(plan.pieces.length >= 3, `${cle} : pièces`);
    assert.ok(plan.elements.some(e => e.nom && e.nom.trim()), `${cle} : aucun élément nommé`);
    assert.ok(description && description.length > 30, `${cle} : description`);
    assert.ok(s.drawings.length && s.drawings.every(d => ID.test(d.author)), `${cle} : dessin sans auteur`);
    assert.ok(s.walls.length > 0 && s.grid.distance === 1.5 && s.grid.units === "m", `${cle} : murs ou grille`);
    for (const chemin of [s.levels[0].background.src, s.levels[0].background.src.replace("/cartes/", "/cartes/3d/")]) {
      assert.ok(lire(chemin)?.startsWith("<svg"), `${cle} : fond ${chemin}`);
    }
    assert.deepEqual(plans[cle], plan, `${cle} : plans.json`);
  }
  for (const c of CARTES) assert.equal(c.flags[M].aventure, TITRE_AVENTURE, c.name);
  for (const c of CARTES_LIEUX) {
    assert.match(c.flags[M].cle, /^lieu-/);
    assert.equal(c.flags[M].aventure, undefined, `${c.name} rattachée à une aventure`);
  }
  // Repères attendus par le MJ IA dans les lieux génériques.
  const elements = CARTES_LIEUX.flatMap(c => c.flags[M].plan.elements.map(e => e.nom.toLowerCase()));
  for (const repere of ["comptoir", "puits", "autel", "forge", "sarcophage", "navire"]) {
    assert.ok(elements.some(n => n.includes(repere)), `aucun « ${repere} » dans les lieux`);
  }
});

test("l'aventure : journal du MJ caché qui cite les cartes par leur nom exact, aide de jeu visible, PNJ nommés", () => {
  const journaux = docs.filter(d => d._key?.startsWith("!journal!"));
  const mj = journaux.find(j => j.flags[M].cle === "aventure-puits-de-cendre");
  assert.ok(mj, "journal du MJ absent");
  assert.equal(mj.ownership.default, 0, "le journal du MJ doit être caché");
  const texte = mj.pages.map(p => p.text.content).join("\n");
  for (const c of CARTES) assert.ok(texte.includes(c.name), `carte « ${c.name} » non citée`);
  for (const titre of ["Synopsis", "Scène 1", "Scène 2", "Scène 3", "Scène 4", "Dénouements"]) {
    assert.ok(mj.pages.some(p => p.name.startsWith(titre)), `page ${titre}`);
  }
  assert.ok((texte.match(/À lire/g) ?? []).length >= 4, "encadrés « À lire »");
  assert.ok((texte.match(/DD \d+/g) ?? []).length >= 15, "indices avec DD");
  for (const nom of ["Grizzla", "Hanuk", "Grommel", "Gorra", "Drogha", "Ezzavel"]) {
    assert.ok(texte.includes(nom), `${nom} absent du journal`);
    assert.ok(pnjs.some(a => a.name.includes(nom)), `${nom} absent du bestiaire`);
  }
  const aide = journaux.find(j => j.flags[M].cle === "contrat-du-cartel");
  assert.equal(aide.ownership.default, 2, "l'aide de jeu doit être visible");
});

// ---------------------------------------------------------------- Mutation : un PNJ faux est refusé

const MODELE = {
  cle: "essai-mutation", nom: "Essai", fp: 0.25, taille: "M", type: "humanoïde", ca: 12, pv: 11, dv: "2d8 + 2",
  carac: { for: 14, dex: 12, con: 12, int: 10, sag: 10, cha: 10 }, texte: "Un essai.", mj: "Pour les essais.",
  capacites: [
    trait("Robuste", "Rien de spécial."),
    attaque("Épée", { toucher: 4, degats: "1d8+2", type: "tranchant" }),
    sauvegarde("Cri", { carac: "sag", dd: 12, zone: { forme: "rayon", taille: 3 }, echec: "La cible est effrayée" })
  ]
};
const muter = (f) => { const d = structuredClone({ ...MODELE, capacites: undefined }); d.capacites = MODELE.capacites.map(c => structuredClone(c)); f(d); return d; };

test("mutation : le modèle passe, chaque altération est refusée par pnj()", () => {
  const ok = pnj(muter(() => {}));
  assert.deepEqual(erreursPnj({ ...ok, items: ok.__objets.map((o, i) => ({ ...o, _id: `essaiObjet${String(i).padStart(6, "0")}`, _key: `!actors.items!${ok._id}.essaiObjet${String(i).padStart(6, "0")}` })) }), []);
  // [altération, message attendu]
  const cas = [
    [d => { d.carac = { ...d.carac, force: 14 }; delete d.carac.for; }, /caractéristique « force » inconnu/],
    [d => { d.taille = "XL"; }, /taille « XL » inconnu/],
    [d => { d.type = "démon"; }, /type de créature « démon » inconnu/],
    [d => { d.capacites[1].type = "sacré"; }, /Épée.*type de dégâts « sacré » inconnu/],
    [d => { d.capacites[2] = { ...d.capacites[2], degats: "1d6", type: "gangrène" }; }, /Cri.*type de dégâts « gangrène » inconnu/],
    [d => { d.immunitesEtats = ["ensorcelé"]; }, /état « ensorcelé » inconnu/],
    [d => { d.capacites[1].toucher = 7; }, /\+7 au toucher ne correspond à aucune caractéristique/],
    [d => { d.pv = 20; }, /20 PV, mais 2d8 \+ 2 donne 11/],
    [d => { d.vitese = { marche: 9 }; }, /champ inconnu « vitese »/],
    [d => { delete d.carac.cha; }, /les six caractéristiques/],
    [d => { d.capacites[1].degats = "d8+2"; }, /formule de dés illisible/],
    [d => { d.capacites[2].zone.forme = "étoile"; }, /forme de zone « étoile » inconnu/],
    [d => { d.fp = 0.3; }, /FP 0.3 invalide/],
    [d => { d.mj = ""; }, /note MJ obligatoires/]
  ];
  for (const [alterer, message] of cas) assert.throws(() => pnj(muter(alterer)), message);
});

test("mutation : un PNJ fabriqué falsifié est repéré par la vérification", () => {
  const vrai = pnjs.find(a => a.flags[M].cle === "loup");
  assert.deepEqual(erreursPnj(vrai), []);
  const faux = structuredClone(vrai);
  faux.system.abilities.str.value = 18; // le +4 annoncé de la morsure ne colle plus
  faux.system.traits.size = "large";
  const morsure = faux.items.find(i => i.type === "weapon");
  Object.values(morsure.system.activities)[0].damage.parts[0].types = ["holy"];
  const erreurs = erreursPnj(faux);
  assert.ok(erreurs.some(e => e.includes("bonus calculé")), erreurs.join(" ; "));
  assert.ok(erreurs.some(e => e.includes("taille")));
  assert.ok(erreurs.some(e => e.includes("dégâts holy")));
});
