// Établi d'artisanat (modules/lakour-warcraft/scripts/etabli.js) : logique pure (bourse et monnaie rendue, composants
// repérés par leur drapeau « cle », maîtrise d'outil, empêchements, règle d'artisanat appliquée au test d'outil) et
// recettes posées sur le journal « Recettes d'artisanat » fabriqué (flags.lakour-warcraft.recettes : produit par uuid du
// compendium, composants, outil dnd5e, DD, fournitures de fournituresDe). Chaque batterie est rejouée sur des versions
// mutées de la logique ou du contenu : chaque mutation doit être repérée.
// Règle de référence, relevée indépendamment du code dans le texte des recettes (REGLE_ARTISANAT) : fournitures perdues sur
// un échec, composants perdus aussi sur un échec de 5 ou plus, un exemplaire de plus d'un consommable sur une réussite
// de 5 ou plus.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { fabriquer, TYPE_PACK } from "../outils/fabriquer-warcraft.mjs";
import { METIERS_ARTISANAT, RECETTES, fournituresDe, prixPo, valeurComposants } from "../modules/lakour-warcraft/contenu/metiers.mjs";
import * as E from "../modules/lakour-warcraft/scripts/etabli.js";

const M = "lakour-warcraft";
const objet = (id, cle, quantity, extra = {}) => ({ id, name: extra.name ?? cle, flags: cle ? { [M]: { cle } } : {}, system: { quantity }, ...extra });

// ---------------------------------------------------------------- Batterie de la logique pure

function batterie(f) {
  const erreurs = [];
  const ok = (cond, msg) => { if (!cond) erreurs.push(msg); };
  const essai = (nom, fn) => { try { fn(); } catch (e) { erreurs.push(`${nom} : ${e.message}`); } };

  essai("bourse", () => {
    ok(f.valeurBourse({ pp: 1, gp: 2, ep: 1, sp: 3, cp: 4 }) === 1284, "valeur en pièces de cuivre");
    ok(JSON.stringify(f.payer({ gp: 30 }, 21)) === JSON.stringify({ pp: 0, gp: 9, ep: 0, sp: 0, cp: 0 }), "payé en or");
    ok(f.payer({ gp: 20, sp: 9 }, 21) === null, "20,9 po pour 21 : refusé, rien à crédit");
    const platine = f.payer({ pp: 3 }, 21);
    ok(platine && f.valeurBourse(platine) === 900 && platine.pp === 0 && platine.gp === 9, "platine entamé : monnaie rendue en or");
    const argent = f.payer({ gp: 1, sp: 5 }, 1.5);
    ok(argent && f.valeurBourse(argent) === 0, "or et argent ensemble");
    const rendu = f.payer({ gp: 2 }, 1.5);
    ok(rendu && rendu.gp === 0 && rendu.sp === 5 && f.valeurBourse(rendu) === 50, "monnaie rendue en argent");
    ok(JSON.stringify(f.payer({ gp: 5, cp: 7 }, 0)) === JSON.stringify({ pp: 0, gp: 5, ep: 0, sp: 0, cp: 7 }), "rien à payer : bourse intacte");
  });

  essai("composants", () => {
    const sac = [objet("a", "herbe-a-fievre", 1), objet("b", "herbe-a-fievre", 2), objet("c", null, 9, { name: "herbe-a-fievre" }), objet("d", "lys-des-oasis", 1)];
    ok(f.compterComposant(sac, "herbe-a-fievre") === 3, "repérés par drapeau, quantités additionnées, jamais par le nom");
    ok(f.compterComposant([objet("x", "lys-des-oasis", 1, { name: "Lys renommé" })], "lys-des-oasis") === 1, "un objet renommé compte encore");
    const etat = f.etatComposants(sac, [{ cle: "herbe-a-fievre", nombre: 2 }, { cle: "lys-des-oasis", nombre: 2 }]);
    ok(etat[0].ok && !etat[1].ok && etat[1].a === 1, "état : ce qu'il y a, ce qui manque");
    const plan = f.consommation(sac, [{ cle: "herbe-a-fievre", nombre: 2 }, { cle: "lys-des-oasis", nombre: 1 }]);
    ok(plan && plan.suppr.includes("a") && plan.suppr.includes("d") && plan.maj.length === 1 && plan.maj[0]._id === "b" && plan.maj[0]["system.quantity"] === 1, "pile vidée supprimée, pile entamée diminuée");
    ok(!plan?.suppr.includes("c") && !plan?.maj.some(m => m._id === "c"), "l'objet sans drapeau n'est pas touché");
    ok(f.consommation(sac, [{ cle: "lys-des-oasis", nombre: 2 }]) === null, "il en manque : rien n'est retiré");
  });

  essai("maîtrise", () => {
    ok(f.maitriseOutil({ alchemist: { value: 1 } }, "alchemist"), "maîtrise de la source");
    ok(f.maitriseOutil({ smith: { value: 0, prof: { multiplier: 2 } } }, "smith"), "expertise préparée");
    ok(!f.maitriseOutil({ cook: { value: 0.5, prof: { multiplier: 0.5 } } }, "cook"), "touche-à-tout : pas une maîtrise");
    ok(!f.maitriseOutil({}, "tinker"), "outil absent");
  });

  essai("empêchements", () => {
    const tout = { maitrise: true, composants: [{ ok: true }], bourse: { gp: 21 }, fournitures: 21 };
    ok(f.empechements(tout).length === 0, "tout y est : on fabrique");
    ok(f.empechements({ ...tout, maitrise: false }).join() === "outil", "outil non maîtrisé");
    ok(f.empechements({ ...tout, composants: [{ ok: true }, { ok: false }] }).join() === "composants", "composant manquant");
    ok(f.empechements({ ...tout, bourse: { gp: 20, sp: 9 } }).join() === "or", "or insuffisant");
  });

  essai("règle", () => {
    const i = (t, dd, c) => f.issueArtisanat(t, dd, c);
    ok(i(12, 12, true).reussite && i(12, 12, true).exemplaires === 1 && i(12, 12, true).composantsConsommes, "réussite au DD : un objet, composants employés");
    ok(i(17, 12, true).exemplaires === 2, "consommable à 5 au-dessus : un exemplaire de plus");
    ok(i(16, 12, true).exemplaires === 1, "4 au-dessus : un seul");
    ok(i(20, 12, false).exemplaires === 1, "arme ou armure : jamais deux");
    ok(!i(11, 12, true).reussite && i(11, 12, true).exemplaires === 0 && !i(11, 12, true).composantsConsommes, "échec : rien, composants gardés");
    ok(!i(8, 12, true).composantsConsommes, "échec de 4 : composants gardés");
    ok(i(7, 12, true).composantsConsommes && i(7, 12, true).exemplaires === 0, "échec de 5 : composants perdus");
    ok([i(20, 12, true), i(11, 12, true), i(1, 12, true)].every(x => x.fournituresPayees), "fournitures payées dans tous les cas");
  });

  essai("plan", () => {
    const sac = [objet("a", "herbe-a-fievre", 2), objet("d", "lys-des-oasis", 1)];
    const composants = [{ cle: "herbe-a-fievre", nombre: 2 }, { cle: "lys-des-oasis", nombre: 1 }];
    const base = { raisons: [], objets: sac, composants, bourse: { gp: 30 }, fournitures: 21, produitTrouve: true };
    const reussi = f.planFabrication({ ...base, issue: f.issueArtisanat(15, 12, true) });
    ok(!reussi.erreur && reussi.bourse.gp === 9 && reussi.consommation?.suppr.length === 2 && reussi.exemplaires === 1, "réussite : or, composants et produit planifiés ensemble");
    const echec = f.planFabrication({ ...base, issue: f.issueArtisanat(10, 12, true) });
    ok(!echec.erreur && echec.consommation === null && echec.exemplaires === 0 && echec.bourse.gp === 9, "échec : fournitures seules");
    ok(f.planFabrication({ ...base, objets: [sac[1]], issue: f.issueArtisanat(15, 12, true) }).erreur === "composants", "composants partis pendant le jet : abandon, pas de produit");
    ok(f.planFabrication({ ...base, raisons: ["or"], issue: f.issueArtisanat(15, 12, true) }).erreur === "empeche", "empêchement apparu pendant le jet : abandon");
    ok(f.planFabrication({ ...base, bourse: { gp: 2 }, issue: f.issueArtisanat(10, 12, true) }).erreur === "or", "or parti pendant le jet : abandon");
    ok(f.planFabrication({ ...base, produitTrouve: false, issue: f.issueArtisanat(15, 12, true) }).erreur === "produit", "produit introuvable : abandon avant toute écriture");
    ok(f.planFabrication({ ...base, produitTrouve: false, issue: f.issueArtisanat(3, 12, true) }).erreur === "produit", "produit introuvable, même sur un échec : rien n'est payé");
    const verrous = new Set();
    ok(f.prendreVerrou(verrous, "Actor.a") && !f.prendreVerrou(verrous, "Actor.a") && f.prendreVerrou(verrous, "Actor.b"), "une fabrication à la fois par acteur");
  });

  essai("groupes", () => {
    const g = f.groupesRecettes([{ id: "a:x", metier: "a", nomMetier: "A", produit: { nom: "X" } }, { id: "b:y", metier: "b", produit: { nom: "Y" } }, { id: "a:z", metier: "a", produit: { nom: "Z" } }], "a:z");
    ok(g.length === 2 && g[0].recettes.map(r => r.nom).join() === "X,Z" && g[0].recettes[1].choisie && !g[0].recettes[0].choisie, "recettes groupées par métier, choix gardé");
  });
  return erreurs;
}

const REEL = { ...E };
const enveloppe = (nom, fn) => f => ({ ...f, [nom]: fn(f[nom]) });
const MUTANTS = {
  "monnaie non rendue": enveloppe("payer", p => (b, po) => { const r = p(b, po); return r && b?.pp ? { ...r, gp: 0 } : r; }),
  "achat à crédit": enveloppe("payer", p => (b, po) => p(b, po) ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }),
  "argent ignoré": enveloppe("payer", p => (b, po) => p({ ...b, sp: 0 }, po)),
  "pièce d'électrum à 1 po": enveloppe("valeurBourse", () => b => ["pp", "gp", "ep", "sp", "cp"].reduce((n, k) => n + (Number(b?.[k]) || 0) * { pp: 1000, gp: 100, ep: 100, sp: 10, cp: 1 }[k], 0)),
  "composants repérés par le nom": enveloppe("compterComposant", () => (o, cle) => o.filter(x => x.name === cle).reduce((n, x) => n + x.system.quantity, 0)),
  "piles comptées une fois": enveloppe("compterComposant", () => (o, cle) => o.filter(x => x.flags?.[M]?.cle === cle).length),
  "pile entière jetée": enveloppe("consommation", c => (o, cs) => { const r = c(o, cs); return r && { maj: [], suppr: [...r.suppr, ...r.maj.map(m => m._id)] }; }),
  "retrait partiel quand il en manque": enveloppe("consommation", c => (o, cs) => c(o, cs) ?? { maj: [], suppr: [] }),
  "touche-à-tout suffit": enveloppe("maitriseOutil", () => (o, k) => Number(o?.[k]?.prof?.multiplier ?? o?.[k]?.value ?? 0) >= 0.5),
  "or non vérifié": enveloppe("empechements", e => x => e({ ...x, bourse: { pp: 1e6 } })),
  "deux armes sur un 5 de plus": enveloppe("issueArtisanat", i => (t, dd) => i(t, dd, true)),
  "4 de plus suffit": enveloppe("issueArtisanat", i => (t, dd, c) => i(t + 1, dd, c)),
  "échec de 4 perd les composants": enveloppe("issueArtisanat", i => (t, dd, c) => ({ ...i(t, dd, c), composantsConsommes: t >= dd || t <= dd - 4 })),
  "réussite qui garde les composants": enveloppe("issueArtisanat", i => (t, dd, c) => ({ ...i(t, dd, c), composantsConsommes: t <= dd - 5 })),
  "fournitures épargnées sur une réussite": enveloppe("issueArtisanat", i => (t, dd, c) => ({ ...i(t, dd, c), fournituresPayees: t < dd })),
  "produit créé sans composants": enveloppe("planFabrication", p => o => { const r = p(o); return r.erreur === "composants" ? { bourse: o.bourse, consommation: null, exemplaires: o.issue.exemplaires } : r; }),
  "empêchement après le jet ignoré": enveloppe("planFabrication", p => o => p({ ...o, raisons: [] })),
  "produit introuvable ignoré": enveloppe("planFabrication", p => o => p({ ...o, produitTrouve: true })),
  "fournitures payées sans produit trouvé": enveloppe("planFabrication", p => o => (o.produitTrouve ? p(o) : { ...p({ ...o, produitTrouve: true }), exemplaires: 0 })),
  "verrou ignoré": enveloppe("prendreVerrou", () => () => true),
  "verrou commun à tous les acteurs": enveloppe("prendreVerrou", v => (s, c) => v(s, "tous")),
  "réussite au DD comptée comme échec": enveloppe("issueArtisanat", i => (t, dd, c) => i(t - 1, dd, c))
};

test("établi : la logique pure (bourse, composants, maîtrise, règle d'artisanat) passe sa batterie", () => {
  assert.deepEqual(batterie(REEL), []);
});

test("établi : chaque logique mutée est repérée", () => {
  const passees = Object.entries(MUTANTS).filter(([, muter]) => !batterie(muter(REEL)).length).map(([nom]) => nom);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

// ---------------------------------------------------------------- Recettes posées sur le journal fabriqué

const DOCS = fabriquer();
const uuidDe = d => `Compendium.${M}.${d.pack}.${TYPE_PACK[d.pack]}.${d.doc._id}`;

function verifierRecettes(docs, recettes = RECETTES) {
  const erreurs = [];
  const parCle = new Map(docs.map(d => [d.cle, d.doc]));
  const parUuid = new Map(docs.map(d => [uuidDe(d), d]));
  const journal = parCle.get("journaux:recettes-d-artisanat");
  const posees = journal?.flags?.[M]?.recettes;
  if (!Array.isArray(posees)) return ["journal des recettes sans recettes pour l'établi"];
  const attendues = Object.entries(recettes).flatMap(([metier, liste]) => liste.map(r => [metier, ...r]));
  if (posees.length !== attendues.length) erreurs.push(`${posees.length} recettes posées pour ${attendues.length}`);
  if (new Set(posees.map(r => r.id)).size !== posees.length) erreurs.push("identifiants de recettes en double");
  for (const [metier, produit, composants, dd] of attendues) {
    const r = posees.find(x => x.id === `${metier}:${produit}`);
    if (!r) { erreurs.push(`${metier}:${produit} : absente de l'établi`); continue; }
    const cible = parUuid.get(r.produit?.uuid);
    if (cible?.pack !== "objets" || cible.doc.flags[M].cle !== produit || r.produit.cle !== produit) erreurs.push(`${r.id} : produit introuvable au compendium des objets`);
    const p = parCle.get(`objets:${produit}`);
    if (p && r.consommable !== (p.type === "consumable")) erreurs.push(`${r.id} : consommable mal posé`);
    if (r.outil !== METIERS_ARTISANAT[metier]?.outilDnd) erreurs.push(`${r.id} : outil ${r.outil}`);
    if (r.dd !== dd) erreurs.push(`${r.id} : DD ${r.dd} au lieu de ${dd}`);
    if (JSON.stringify(r.composants.map(c => [c.cle, c.nombre])) !== JSON.stringify(composants)) erreurs.push(`${r.id} : composants différents de la recette`);
    for (const c of r.composants) if (parCle.get(`objets:${c.cle}`)?.flags[M].cle !== c.cle) erreurs.push(`${r.id} : composant « ${c.cle} » sans objet marqué`);
    if (p) {
      const attendu = fournituresDe(prixPo(p), valeurComposants(composants, c => prixPo(parCle.get(`objets:${c}`))));
      if (r.fournitures !== attendu) erreurs.push(`${r.id} : fournitures ${r.fournitures} au lieu de ${attendu}`);
      // Le journal annonce les mêmes fournitures que l'établi.
      const ligne = journal.pages.flatMap(pg => pg.text.content.split("<li>")).find(l => l.includes(`Item.${p._id}]`)) ?? "";
      if (!ligne.includes(`; ${r.fournitures} po de fournitures`)) erreurs.push(`${r.id} : journal et établi annoncent des fournitures différentes`);
    }
  }
  if (!journal.pages.every(pg => /établi/i.test(pg.text.content))) erreurs.push("journal des recettes : l'établi n'est pas annoncé");
  return erreurs;
}

const copie = () => structuredClone(DOCS);
const recettesDe = D => D.find(d => d.cle === "journaux:recettes-d-artisanat").doc.flags[M].recettes;
const MUTATIONS_CONTENU = {
  "recettes absentes"(D) { delete D.find(d => d.cle === "journaux:recettes-d-artisanat").doc.flags[M].recettes; },
  "recette oubliée"(D) { recettesDe(D).pop(); },
  "produit recréé hors compendium"(D) { recettesDe(D)[0].produit.uuid = "Item.potionMaison0001"; },
  "produit d'une autre recette"(D) { recettesDe(D)[0].produit.uuid = recettesDe(D)[1].produit.uuid; },
  "arme marquée consommable"(D) { recettesDe(D).find(r => r.id === "forge:epee-de-la-garde").consommable = true; },
  "mauvais outil"(D) { recettesDe(D).find(r => r.metier === "cuisine").outil = "brewer"; },
  "DD changé"(D) { recettesDe(D)[2].dd += 1; },
  "composant repéré par son nom"(D) { recettesDe(D)[0].composants[0].cle = "Herbe-à-fièvre"; },
  "quantité de composant changée"(D) { recettesDe(D)[0].composants[0].nombre = 1; },
  "fournitures fausses"(D) { recettesDe(D)[0].fournitures += 1; },
  "journal muet sur l'établi"(D) { for (const pg of D.find(d => d.cle === "journaux:recettes-d-artisanat").doc.pages) pg.text.content = pg.text.content.replace(/établi/gi, "atelier"); }
};

test("établi : le journal des recettes porte toutes les recettes, produits liés au compendium des objets", () => {
  assert.deepEqual(verifierRecettes(DOCS), []);
});

test("établi : chaque recette faussée est repérée", () => {
  const passees = Object.entries(MUTATIONS_CONTENU).filter(([, muter]) => { const D = copie(); muter(D); return !verifierRecettes(D).length; }).map(([n]) => n);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});
