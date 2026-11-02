// Automatismes des suppléments (modules/lakour-warcraft/scripts/automatismes.js) : logique pure de la fureur (refus et
// retrait), des ensembles (bonus allumé quand toutes les pièces sont équipées), de la phase 2 des boss (une fois par
// combat, réarmée par un nouveau combat) et des liens vers les compendiums du module ; et le câblage des drapeaux dans le
// contenu fabriqué (objets de fureur, pièces et bonus d'ensemble, boss et capacité de phase 2). La batterie de câblage est
// rejouée sur des copies mutées : chaque drapeau manquant ou faux est repéré.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { fabriquer } from "../outils/fabriquer-warcraft.mjs";
import {
  HORS_COMBAT, ID, changementsEnsembles, cleAnnoncePhase2, cleCombat, contenuPhase2, enveloppeAsynchrone, enveloppeSynchrone, epuisementsATerminer,
  effetsRemplaces, epuisesParmi, estObjetFureur, fureurARetirer, memosAPurger, packDuLien, porteEpuisement, pourChacun
} from "../modules/lakour-warcraft/scripts/automatismes.js";

const fl = valeurs => ({ [ID]: valeurs });
const effet = (id, fureur, extra = {}) => ({ id, flags: fl({ fureur }), disabled: false, duration: {}, ...extra });

// ---------------------------------------------------------------- Fureur

test("fureur : l'utilisateur ou une cible épuisés font refuser l'utilisation", () => {
  const frais = { uuid: "A", name: "Thrall", effects: [effet("e1", "elan")] };
  const epuise = { uuid: "B", name: "Jaina", effects: [effet("e2", "epuisement")] };
  const eteint = { uuid: "C", name: "Rexxar", effects: [effet("e3", "epuisement", { disabled: true })] };
  const expire = { uuid: "D", name: "Rokhan", effects: [effet("e4", "epuisement", { duration: { expired: true } })] };
  assert.equal(porteEpuisement(frais), false);
  assert.equal(porteEpuisement(epuise), true);
  assert.deepEqual(epuisesParmi([frais, epuise, epuise, eteint, expire, null]), ["Jaina"], "sans doublon, effets éteints ou expirés ignorés");
  assert.equal(estObjetFureur({ flags: fl({ fureur: true }) }), true);
  assert.equal(estObjetFureur({ name: "Tambours de Furie sanguinaire", flags: {} }), false, "repéré par drapeau, pas par le nom");
});

test("fureur : la Furie d'une nouvelle utilisation est retirée, pas celle qui arrive avec son propre épuisement", () => {
  const msg = m => ({ system: { origin: { message: m } } });
  const nouvelle = effet("f2", "elan", msg("M2"));
  assert.equal(fureurARetirer([effet("x", "epuisement", msg("M1")), nouvelle], nouvelle), true, "épuisement d'une utilisation précédente");
  assert.equal(fureurARetirer([effet("x", "epuisement", msg("M2")), nouvelle], nouvelle), false, "même utilisation");
  assert.equal(fureurARetirer([effet("x", "epuisement", msg("M1"))], effet("x2", "epuisement", msg("M2"))), false, "seule la Furie est retirée");
  // Sans message d'origine : l'ancienneté de la dernière modification de l'épuisement départage (plus de 30 s).
  const t = 1_000_000;
  const sansMessage = effet("f3", "elan", { _stats: { createdTime: t } });
  assert.equal(fureurARetirer([effet("x", "epuisement", { _stats: { createdTime: t - 60000 } }), sansMessage], sansMessage, t), true);
  assert.equal(fureurARetirer([effet("x", "epuisement", { _stats: { createdTime: t - 2000 } }), sansMessage], sansMessage, t), false);
  assert.equal(fureurARetirer([effet("x", "epuisement", { _stats: { createdTime: t - 90000, modifiedTime: t - 1000 } }), sansMessage], sansMessage, t), false,
    "épuisement remis à neuf par la même utilisation");
});

test("fureur : une Furie réactivée par dnd5e (effet existant mis à jour) est jugée comme une nouvelle", () => {
  // dnd5e 6.0.6 (_prepareEffectData) réactive l'effet déjà présent : disabled false, origine du nouveau message.
  const reactivee = effet("f1", "elan", { system: { origin: { message: "M2" } } });
  assert.equal(fureurARetirer([effet("x", "epuisement", { system: { origin: { message: "M1" } } }), reactivee], reactivee), true);
  assert.equal(fureurARetirer([effet("x", "epuisement", { system: { origin: { message: "M1" } } })], { ...reactivee, disabled: true }), false, "une Furie éteinte ne gêne pas");
  assert.equal(fureurARetirer([{ ...effet(undefined, "epuisement"), system: { origin: { message: "M1" } } }], { ...effet(undefined, "elan"), system: { origin: { message: "M2" } } }), true,
    "sans identifiants, l'objet lui-même départage");
});

test("fureur : à la fin du combat, seuls les épuisements de fureur sont ôtés", () => {
  assert.deepEqual(epuisementsATerminer([effet("a", "epuisement"), effet("b", "elan"), { id: "c", flags: {} }, effet("d", "epuisement", { disabled: true })]), ["a", "d"]);
  assert.deepEqual(epuisementsATerminer(undefined), []);
});

// ---------------------------------------------------------------- Ensembles

const piece = (cle, equipped, effets = []) => ({ id: cle, flags: fl({ cle, ensemble: "tenue" }), system: { equipped }, effects: effets });
const bonus = disabled => ({ id: "bonus", disabled, flags: fl({ ensemble: "tenue", pieces: 2 }) });

test("ensembles : le bonus s'allume avec les deux pièces équipées, s'éteint sinon, et ne bouge pas s'il est déjà juste", () => {
  const allume = changementsEnsembles([piece("gantelets", true), piece("lunettes", true, [bonus(true)])]);
  assert.deepEqual(allume.map(c => c.disabled), [false]);
  assert.deepEqual(changementsEnsembles([piece("gantelets", false), piece("lunettes", true, [bonus(false)])]).map(c => c.disabled), [true]);
  assert.deepEqual(changementsEnsembles([piece("gantelets", true), piece("lunettes", false, [bonus(false)])]).map(c => c.disabled), [true], "lunettes ôtées");
  assert.deepEqual(changementsEnsembles([piece("lunettes", true, [bonus(true)])]), [], "une seule pièce : reste éteint");
  assert.deepEqual(changementsEnsembles([piece("lunettes", true), piece("lunettes", true, [bonus(true)])]), [], "deux fois la même pièce ne compte qu'une");
  assert.deepEqual(changementsEnsembles([piece("gantelets", true), piece("lunettes", true, [bonus(false)])]), []);
});

// ---------------------------------------------------------------- Phase 2

test("phase 2 : à la moitié des PV ou moins, une fois par combat, jamais à 0 PV", () => {
  assert.equal(cleAnnoncePhase2({ valeur: 48, max: 95, combat: "C1" }), null, "au-dessus de 47");
  assert.equal(cleAnnoncePhase2({ valeur: 47, max: 95, combat: "C1" }), "C1");
  assert.equal(cleAnnoncePhase2({ valeur: 30, max: 95, annoncee: "C1", combat: "C1" }), null, "déjà annoncée ce combat");
  assert.equal(cleAnnoncePhase2({ valeur: 30, max: 95, annoncee: "C1", combat: "C2" }), "C2", "réarmée au combat suivant");
  assert.equal(cleAnnoncePhase2({ valeur: 0, max: 95, combat: "C1" }), null, "tombé d'un coup : plus de phase 2");
  assert.equal(cleAnnoncePhase2({ valeur: 20, max: 95, combat: null }), "hors-combat");
  assert.equal(cleAnnoncePhase2({ valeur: 20, max: undefined }), null, "PV illisibles : rien");
  const html = contenuPhase2("Grokka : phase 2", { uuid: "Actor.a.Item.b", name: "Phase 2 — Tuyau arraché" });
  assert.match(html, /\[\[\/item Actor\.a\.Item\.b\]\]\{Phase 2 — Tuyau arraché\}/, "bouton d'utilisation dnd5e");
  assert.match(html, /@UUID\[Actor\.a\.Item\.b\]/);
  assert.equal(contenuPhase2("x", null), "<p>x</p>");
});

test("phase 2 : la clé est celle du combat dès sa création ; la fin du combat purge ses mémos et ceux faits hors combat", () => {
  assert.equal(cleCombat({ id: "C1", started: false }), "C1", "combat créé mais pas démarré");
  assert.equal(cleCombat(null), HORS_COMBAT);
  const memos = new Set(["A|C1", "B|C2", "C|hors-combat"]);
  assert.deepEqual(memosAPurger(memos, "C1").sort(), ["A|C1", "C|hors-combat"]);
});

test("hooks : erreurs synchrones et rejets asynchrones attrapés, retour gardé pour les pre*, boucle qui continue", async () => {
  const avertir = console.warn;
  const avertissements = [];
  console.warn = (...a) => avertissements.push(a.join(" "));
  try {
    assert.equal(enveloppeSynchrone("pre", () => false)(), false, "un pre* peut toujours annuler");
    assert.equal(enveloppeSynchrone("pre", () => { throw new Error("x"); })(), undefined);
    assert.equal(enveloppeAsynchrone("async", async () => { throw new Error("rejet"); })(), undefined, "rien n'est rendu à Foundry");
    enveloppeAsynchrone("sync", () => { throw new Error("levée"); })();
    await new Promise(r => setTimeout(r, 5));
    assert.equal(avertissements.length, 3, "le rejet et la levée ont été attrapés et écrits");
    const faits = [];
    const n = await pourChacun([1, 2, 3], async x => { if (x === 2) throw new Error("échec"); faits.push(x); }, "essai");
    assert.deepEqual([n, faits], [2, [1, 3]], "un échec n'arrête pas les suivants");
  } finally { console.warn = avertir; }
});

test("effets uniques : un nouvel affûtage remplace l'ancien, sans toucher aux autres effets", () => {
  const u = (id, cle) => ({ id, flags: fl({ unique: cle }) });
  const nouvel = u("n", "lame-affutee");
  assert.deepEqual(effetsRemplaces([u("a", "lame-affutee"), u("b", "autre"), { id: "c", flags: {} }, nouvel], nouvel), ["a"]);
  assert.deepEqual(effetsRemplaces([u("a", "lame-affutee")], { id: "x", flags: {} }), [], "un effet ordinaire ne remplace rien");
});

test("liens : seul un compendium du module est reconnu", () => {
  assert.equal(packDuLien("Compendium.lakour-warcraft.bestiaire.Actor.kkJpRCb1TYvyoexd"), "bestiaire");
  assert.equal(packDuLien("Compendium.dnd5e.monsters.Actor.x"), null);
  assert.equal(packDuLien("Actor.abc"), null);
  assert.equal(packDuLien(undefined), null);
});

// ---------------------------------------------------------------- Câblage des drapeaux dans le contenu

const DOCS = fabriquer();
function verifierCablage(docs) {
  const erreurs = [];
  const doc = cle => docs.find(d => d.cle === cle)?.doc;
  for (const cle of ["objets:tambours-de-furie-sanguinaire", "objets:cristal-d-heroisme"]) {
    const o = doc(cle);
    if (o?.flags?.[ID]?.fureur !== true) erreurs.push(`${cle} : objet de fureur non marqué`);
    const etats = (o?.effects ?? []).map(e => e.flags?.[ID]?.fureur);
    if (etats.join() !== "elan,epuisement") erreurs.push(`${cle} : effets marqués ${etats}`);
  }
  const pieces = docs.filter(d => d.pack === "objets" && d.doc.flags[ID].ensemble);
  if (pieces.length !== 2 || new Set(pieces.map(p => p.doc.flags[ID].ensemble)).size !== 1) erreurs.push("ensemble : il faut deux pièces du même ensemble");
  const bonusEnsemble = pieces.flatMap(p => p.doc.effects.filter(e => e.flags?.[ID]?.ensemble));
  if (bonusEnsemble.length !== 1 || bonusEnsemble[0].flags[ID].pieces !== pieces.length || bonusEnsemble[0].disabled !== true) erreurs.push("ensemble : un seul effet de bonus, éteint, qui compte les pièces");
  const boss = docs.filter(d => d.pack === "bestiaire" && d.doc.flags[ID].boss);
  if (boss.length !== 3) erreurs.push(`${boss.length} boss marqués au lieu de 3`);
  for (const { doc: b } of boss) if (!b.items.some(i => i.name === b.flags[ID].boss.phase2)) erreurs.push(`${b.name} : capacité de phase 2 introuvable`);
  return erreurs;
}
const copie = () => structuredClone(DOCS);
const de = (D, cle) => D.find(d => d.cle === cle).doc;
const MUTATIONS = {
  "tambours non marqués"(D) { delete de(D, "objets:tambours-de-furie-sanguinaire").flags[ID].fureur; },
  "épuisement non marqué"(D) { de(D, "objets:cristal-d-heroisme").effects[1].flags = {}; },
  "pièce d'ensemble oubliée"(D) { delete de(D, "objets:gantelets-ignifuges-du-contremaitre").flags[ID].ensemble; },
  "bonus d'ensemble allumé d'office"(D) { de(D, "objets:lunettes-de-surete-du-contremaitre").effects[1].disabled = false; },
  "boss non marqué"(D) { delete de(D, "bestiaire:mere-brasier").flags[ID].boss; },
  "phase 2 renommée"(D) { de(D, "bestiaire:grokka-deux-cles").items.find(i => i.name.startsWith("Phase 2")).name = "Phase deux"; }
};

test("câblage : les drapeaux des automatismes sont posés dans le contenu fabriqué", () => {
  assert.deepEqual(verifierCablage(DOCS), []);
});

test("câblage : chaque drapeau manquant ou faux est repéré", () => {
  const passees = Object.entries(MUTATIONS).filter(([, muter]) => { const D = copie(); muter(D); return !verifierCablage(D).length; }).map(([n]) => n);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});
