// Établi d'artisanat (dnd5e 6.0.6, Foundry 14) : petite fenêtre ApplicationV2 ouverte depuis la fiche d'un personnage
// (contrôle « Établi » de l'en-tête, pour qui possède la fiche) ou par l'API (ouvrirEtabli). Les recettes viennent du
// journal « Recettes d'artisanat » du compendium du module (flags.lakour-warcraft.recettes, posées par
// contenu/metiers.mjs, RECETTES_ETABLI). Pour la recette choisie :
// - maîtrise de l'outil : system.tools.<clé dnd5e>, multiplicateur 1 ou plus (la moitié de « touche-à-tout » ne suffit pas) ;
// - composants de l'inventaire repérés par leur drapeau « cle » (jamais par le nom), quantités additionnées ;
// - or des fournitures (fournituresDe de la recette), payé en or d'abord, la monnaie rendue en or, argent, cuivre ;
// puis test d'outil de dnd5e (actor.rollToolCheck, DD en cible : la fenêtre de jet de dnd5e reste celle du joueur) et
// règle d'artisanat (REGLE_ARTISANAT) : fournitures payées dans tous les cas ; réussite : l'objet du compendium du
// module (uuid de la recette, jamais recréé à la main) rejoint l'inventaire, deux exemplaires d'un consommable à 5 ou
// plus au-dessus du DD ; composants consommés sur une réussite, gardés sur un échec, perdus sur un échec de 5 ou plus.
// Rien n'est écrit hors de la fiche du fabricant : le joueur qui la possède fabrique seul. Un message résume l'issue.
// Sûreté : un verrou par acteur (commun aux fenêtres du poste) ; le produit est résolu avant le jet ; après le jet,
// l'inventaire et l'or sont relus et le plan d'écritures (planFabrication) calculé avant la première écriture — s'il
// manque quoi que ce soit (autre fenêtre, autre client), tout est abandonné, rien n'est dépensé ni créé. Entre deux
// clients, seule cette relecture protège : la fenêtre de course se réduit au temps des écritures.
// Logique pure exportée (essais) ; la fenêtre est construite à la demande (aucune API de Foundry lue au chargement).
import { ID, avertir, drapeau, echapper, formatEchappe, liste, prevenir, surPre } from "./automatismes.js";

// ---------------------------------------------------------------- Logique pure

// Valeur des pièces en pièces de cuivre (dnd5e : pp 10 po, gp 1, ep 0,5, sp 0,1, cp 0,01).
export const PIECES = Object.freeze({ pp: 1000, gp: 100, ep: 50, sp: 10, cp: 1 });
const entier = n => Math.max(0, Math.trunc(Number(n) || 0));
export const valeurBourse = bourse => Object.entries(PIECES).reduce((n, [k, v]) => n + entier(bourse?.[k]) * v, 0);

// Paie po pièces d'or : rend la nouvelle bourse, ou null si elle n'y suffit pas. Or, électrum, argent, cuivre puis
// platine sans dépasser ; le reste avec la plus petite pièce qui suffit, la monnaie rendue en or, argent, cuivre.
export function payer(bourse, po) {
  const du = Math.round(Number(po) * 100);
  if (!(du >= 0)) return null;
  const b = Object.fromEntries(Object.keys(PIECES).map(k => [k, entier(bourse?.[k])]));
  if (valeurBourse(b) < du) return null;
  let reste = du;
  for (const k of ["gp", "ep", "sp", "cp", "pp"]) {
    const n = Math.min(b[k], Math.floor(reste / PIECES[k]));
    b[k] -= n;
    reste -= n * PIECES[k];
  }
  if (reste > 0) {
    const k = ["cp", "sp", "ep", "gp", "pp"].find(x => b[x] > 0 && PIECES[x] >= reste);
    if (!k) return null;
    b[k] -= 1;
    let rendu = PIECES[k] - reste;
    for (const r of ["gp", "sp", "cp"]) {
      const n = Math.floor(rendu / PIECES[r]);
      b[r] += n;
      rendu -= n * PIECES[r];
    }
  }
  return b;
}

const quantite = o => (o?.system?.quantity == null ? 1 : entier(o.system.quantity));
// Nombre d'unités d'un composant (drapeau « cle ») dans un inventaire.
export const compterComposant = (objets, cle) => liste(objets).filter(o => drapeau(o, "cle") === cle).reduce((n, o) => n + quantite(o), 0);

// Composants d'une recette, avec ce que l'inventaire en contient : [{ cle, nom, nombre, a, ok }].
export const etatComposants = (objets, composants) => liste(composants).map(c => {
  const a = compterComposant(objets, c.cle);
  return { ...c, a, ok: a >= c.nombre };
});

// Retrait des composants : { maj: [{ _id, "system.quantity" }], suppr: [ids] } (une pile vidée est supprimée), ou null
// s'il en manque.
export function consommation(objets, composants) {
  const maj = [];
  const suppr = [];
  for (const c of liste(composants)) {
    let reste = c.nombre;
    for (const o of liste(objets).filter(x => drapeau(x, "cle") === c.cle)) {
      if (reste <= 0) break;
      const q = quantite(o);
      const pris = Math.min(q, reste);
      if (!pris) continue;
      reste -= pris;
      if (pris === q) suppr.push(o.id);
      else maj.push({ _id: o.id, "system.quantity": q - pris });
    }
    if (reste > 0) return null;
  }
  return { maj, suppr };
}

// Maîtrise d'un outil dnd5e : multiplicateur préparé (prof.multiplier) ou valeur de la source, 1 ou plus.
export const maitriseOutil = (outils, cle) => {
  const o = outils?.[cle];
  return Number(o?.prof?.multiplier ?? o?.effectValue ?? o?.value ?? 0) >= 1;
};

// Ce qui empêche de fabriquer : codes « outil », « composants », « or » (liste vide : on peut).
export function empechements({ maitrise, composants, bourse, fournitures }) {
  const raisons = [];
  if (!maitrise) raisons.push("outil");
  if (liste(composants).some(c => !c.ok)) raisons.push("composants");
  if (valeurBourse(bourse) < Math.round(Number(fournitures) * 100)) raisons.push("or");
  return raisons;
}

// Règle d'artisanat (contenu/metiers.mjs, REGLE_ARTISANAT) appliquée au total du test d'outil.
export function issueArtisanat(total, dd, consommable) {
  const reussite = total >= dd;
  return {
    reussite,
    exemplaires: reussite ? (consommable && total >= dd + 5 ? 2 : 1) : 0,
    composantsConsommes: reussite || total <= dd - 5,
    fournituresPayees: true
  };
}

// Plan des écritures d'une fabrication, calculé APRÈS le jet et AVANT toute écriture, sur l'inventaire relu à ce
// moment (une autre fenêtre ou un autre client a pu dépenser les composants ou l'or pendant le jet) : { erreur } — rien
// n'est écrit — ou { bourse, consommation (null si les composants restent), exemplaires }. Produit introuvable au
// compendium, empêchement apparu, or ou composants qui ne suffisent plus : abandon, jamais un produit sans dépense.
export function planFabrication({ raisons, issue, objets, composants, bourse, fournitures, produitTrouve }) {
  if (!produitTrouve) return { erreur: "produit" };
  if (raisons?.length) return { erreur: "empeche" };
  const nouvelle = payer(bourse, fournitures);
  if (!nouvelle) return { erreur: "or" };
  const conso = issue.composantsConsommes ? consommation(objets, composants) : null;
  if (issue.composantsConsommes && !conso) return { erreur: "composants" };
  return { bourse: nouvelle, consommation: conso, exemplaires: issue.exemplaires };
}

// Verrou par acteur, commun à toutes les fenêtres de ce poste : une seule fabrication à la fois pour une même fiche
// (fermer et rouvrir l'établi pendant le jet ne permet pas d'en lancer une seconde). Rend true si le verrou est pris.
export const prendreVerrou = (verrous, cle) => (verrous.has(cle) ? false : (verrous.add(cle), true));
const VERROUS = new Set();

// Recettes regroupées par métier pour la liste de choix.
export function groupesRecettes(recettes, choisie) {
  const groupes = new Map();
  for (const r of liste(recettes)) {
    const g = groupes.get(r.metier) ?? { metier: r.metier, nom: r.nomMetier ?? r.metier, recettes: [] };
    g.recettes.push({ id: r.id, nom: r.produit?.nom ?? r.id, choisie: r.id === choisie });
    groupes.set(r.metier, g);
  }
  return [...groupes.values()];
}

// ---------------------------------------------------------------- Recettes (compendium du module)

let recettesEnCache = null;
export async function chargerRecettes() {
  if (recettesEnCache?.length) return recettesEnCache;
  let journal = null;
  try {
    const pack = game.packs?.get(`${ID}.journaux`);
    const index = await pack?.getIndex({ fields: [`flags.${ID}.cle`] });
    const entree = liste(index).find(e => e.flags?.[ID]?.cle === "recettes-d-artisanat");
    if (entree) journal = await pack.getDocument(entree._id);
  } catch (erreur) { avertir("établi : compendium des journaux", erreur); }
  journal ??= liste(game.journal).find(j => drapeau(j, "cle") === "recettes-d-artisanat");
  const recettes = drapeau(journal, "recettes");
  recettesEnCache = Array.isArray(recettes) ? recettes : [];
  return recettesEnCache;
}

// ---------------------------------------------------------------- Fabrication (fiche du fabricant seulement)

function etatRecette(acteur, recette) {
  const composants = etatComposants(acteur.items, recette.composants);
  const bourse = acteur.system?.currency ?? {};
  const maitrise = maitriseOutil(acteur.system?.tools, recette.outil);
  return { maitrise, composants, bourse, raisons: empechements({ maitrise, composants, bourse, fournitures: recette.fournitures }) };
}
const texteRaison = (code, recette, etat) => ({
  outil: () => game.i18n.format("LAKOURWOW.Etabli.SansOutil", { outil: recette.nomOutil ?? recette.outil }),
  composants: () => game.i18n.format("LAKOURWOW.Etabli.SansComposants", { liste: etat.composants.filter(c => !c.ok).map(c => `${c.nombre - c.a} × ${c.nom}`).join(", ") }),
  or: () => game.i18n.format("LAKOURWOW.Etabli.SansOr", { po: recette.fournitures }),
  produit: () => game.i18n.format("LAKOURWOW.Etabli.ProduitIntrouvable", { produit: recette.produit.nom })
})[code]?.() ?? code;

// source : le produit déjà résolu dans le compendium (avant toute écriture).
async function ajouterProduit(acteur, recette, source, n) {
  const pile = recette.consommable ? liste(acteur.items).find(i => drapeau(i, "cle") === recette.produit.cle && i.type === source.type) : null;
  if (pile) return pile.update({ "system.quantity": quantite(pile) + n });
  const donnees = game.items?.fromCompendium ? game.items.fromCompendium(source) : source.toObject();
  donnees.system = { ...(donnees.system ?? {}), quantity: n };
  return acteur.createEmbeddedDocuments("Item", [donnees]);
}

// Fabrique une recette pour un acteur que l'utilisateur possède. Rend l'issue, ou null (empêchée, abandonnée ou jet
// annulé : rien n'est alors dépensé). Ordre : verrou, vérification, produit résolu, jet, nouvelle vérification et plan,
// puis écritures (composants, or, produit) et message.
export async function fabriquer(acteur, recette) {
  if (!acteur?.isOwner || !recette) return null;
  const cle = acteur.uuid ?? acteur.id;
  if (!prendreVerrou(VERROUS, cle)) { prevenir("LAKOURWOW.Etabli.DejaEnCours", { nom: acteur.name }); return null; }
  try {
    const avant = etatRecette(acteur, recette);
    if (avant.raisons.length) { prevenir("LAKOURWOW.Etabli.Empeche", { raisons: avant.raisons.map(c => texteRaison(c, recette, avant)).join(" ") }); return null; }
    const produit = await fromUuid(recette.produit.uuid);
    if (!produit) { prevenir("LAKOURWOW.Etabli.ProduitIntrouvable", { produit: recette.produit.nom }); return null; }
    const jets = await acteur.rollToolCheck({ tool: recette.outil, target: recette.dd });
    const jet = Array.isArray(jets) ? jets[0] : jets;
    if (!Number.isFinite(jet?.total)) return null;   // fenêtre de jet fermée : rien n'est dépensé
    const issue = issueArtisanat(jet.total, recette.dd, recette.consommable);
    const apres = etatRecette(acteur, recette);
    const plan = planFabrication({
      raisons: apres.raisons, issue, objets: acteur.items, composants: recette.composants, bourse: acteur.system?.currency,
      fournitures: recette.fournitures, produitTrouve: Boolean(produit)
    });
    if (plan.erreur) {
      const raisons = plan.erreur === "empeche" ? apres.raisons : [plan.erreur];
      prevenir("LAKOURWOW.Etabli.Abandon", { raisons: raisons.map(c => texteRaison(c, recette, apres)).join(" ") });
      return null;
    }
    if (plan.consommation?.maj.length) await acteur.updateEmbeddedDocuments("Item", plan.consommation.maj);
    if (plan.consommation?.suppr.length) await acteur.deleteEmbeddedDocuments("Item", plan.consommation.suppr);
    await acteur.update({ "system.currency": plan.bourse });
    if (plan.exemplaires) await ajouterProduit(acteur, recette, produit, plan.exemplaires);
    const message = !issue.reussite ? (issue.composantsConsommes ? "LAKOURWOW.Etabli.EchecGrave" : "LAKOURWOW.Etabli.Echec")
      : plan.exemplaires > 1 ? "LAKOURWOW.Etabli.ReussiteDouble" : "LAKOURWOW.Etabli.Reussite";
    const donnees = { nom: acteur.name, produit: recette.produit.nom, total: jet.total, dd: recette.dd, po: recette.fournitures };
    await ChatMessage.implementation.create({
      content: `<p><strong>${game.i18n.localize("LAKOURWOW.Etabli.Titre")}</strong> — ${formatEchappe(message, donnees)}</p>`,
      speaker: ChatMessage.implementation.getSpeaker?.({ actor: acteur }) ?? { alias: acteur.name }
    });
    return issue;
  } finally {
    VERROUS.delete(cle);
  }
}

// ---------------------------------------------------------------- Fenêtre

let ClasseEtabli = null;
function classeEtabli() {
  if (ClasseEtabli) return ClasseEtabli;
  const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
  ClasseEtabli = class Etabli extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
      classes: ["lakourwow-etabli"],
      window: { title: "LAKOURWOW.Etabli.Titre", icon: "fa-solid fa-hammer", resizable: true },
      position: { width: 540, height: "auto" },
      actions: { fabriquer: Etabli.#fabriquer }
    };

    static PARTS = { corps: { template: `modules/${ID}/templates/etabli.hbs` } };

    #acteur;
    #choix = null;
    #enCours = false;
    #crochets = [];

    constructor(acteur, options = {}) {
      super({ id: idFenetre(acteur), ...options });
      this.#acteur = acteur;
    }

    get title() { return `${game.i18n.localize("LAKOURWOW.Etabli.Titre")} : ${this.#acteur.name}`; }

    async _prepareContext() {
      const recettes = await chargerRecettes();
      const recette = recettes.find(r => r.id === this.#choix) ?? recettes[0] ?? null;
      this.#choix = recette?.id ?? null;
      if (!recette) return { recette: null };
      const etat = etatRecette(this.#acteur, recette);
      let lien = echapper(recette.produit.nom);   // rendu en {{{lien}}} : texte simple échappé
      try { lien = await foundry.applications.ux.TextEditor.implementation.enrichHTML(`@UUID[${recette.produit.uuid}]{${recette.produit.nom}}`); } catch { /* texte simple */ }
      return {
        recette, lien, etat, groupes: groupesRecettes(recettes, recette.id), enCours: this.#enCours,
        bourse: valeurBourse(etat.bourse) / 100, possible: !etat.raisons.length && !this.#enCours,
        raisons: etat.raisons.map(c => texteRaison(c, recette, etat))
      };
    }

    _onRender(context, options) {
      super._onRender?.(context, options);
      this.element.querySelector("select[name='recette']")?.addEventListener("change", e => { this.#choix = e.target.value; this.render(); });
    }

    // L'inventaire, l'or ou les maîtrises changent : la fenêtre se met à jour.
    _onFirstRender(context, options) {
      super._onFirstRender?.(context, options);
      const moi = doc => doc === this.#acteur || doc?.parent === this.#acteur;
      for (const nom of ["updateActor", "createItem", "updateItem", "deleteItem"]) {
        this.#crochets.push([nom, Hooks.on(nom, doc => { if (moi(doc) && this.rendered) this.render(); })]);
      }
    }

    _onClose(options) {
      for (const [nom, id] of this.#crochets) Hooks.off(nom, id);
      this.#crochets = [];
      super._onClose?.(options);
    }

    static async #fabriquer() {
      if (this.#enCours) return;
      const recette = (await chargerRecettes()).find(r => r.id === this.#choix);
      this.#enCours = true;
      try { await fabriquer(this.#acteur, recette); } catch (erreur) {
        avertir("établi", erreur);
        prevenir("LAKOURWOW.Etabli.Erreur", { message: erreur?.message ?? String(erreur) });
      } finally {
        this.#enCours = false;
        if (this.rendered) this.render();
      }
    }
  };
  return ClasseEtabli;
}
const idFenetre = acteur => `${ID}-etabli-${String(acteur.uuid ?? acteur.id).replace(/[^A-Za-z0-9-]/g, "-")}`;

// Ouvre l'établi d'un acteur (acteur ou uuid ; par défaut le jeton contrôlé, sinon le personnage de l'utilisateur).
// API : game.modules.get("lakour-warcraft").api.ouvrirEtabli(acteur).
export async function ouvrirEtabli(acteur) {
  const doc = typeof acteur === "string" ? await fromUuid(acteur) : acteur;
  const a = doc?.actor ?? doc ?? globalThis.canvas?.tokens?.controlled?.[0]?.actor ?? game.user?.character;
  if (!a) { prevenir("LAKOURWOW.Etabli.SansActeur"); return null; }
  if (!a.isOwner) { prevenir("LAKOURWOW.Etabli.PasProprietaire", { nom: a.name }); return null; }
  const ouverte = foundry.applications.instances?.get(idFenetre(a));
  if (ouverte) { ouverte.bringToFront?.(); return ouverte; }
  const Classe = classeEtabli();
  return new Classe(a).render({ force: true });
}

// Contrôle « Établi » dans l'en-tête des fiches de personnage (ApplicationV2 de dnd5e 6.0.6), pour qui les possède.
surPre("getHeaderControlsApplicationV2", (app, controles) => {
  const acteur = app?.document;
  if (!(acteur instanceof Actor) || acteur.type !== "character" || !acteur.isOwner || !Array.isArray(controles)) return;
  if (controles.some(c => c.class === "lakourwow-etabli")) return;
  // onClick seul, sans « action » : déclarer les deux ferait courir le risque d'une double ouverture. C'est la forme
  // qu'emploient item-piles et autoanimations sous Foundry 14, et dnd5e 6.0.6 (_getHeaderControlContextEntries)
  // appelle onClick quand il existe.
  controles.push({
    class: "lakourwow-etabli", icon: "fa-solid fa-hammer", label: "LAKOURWOW.Etabli.Bouton", visible: true,
    onClick: () => { ouvrirEtabli(acteur).catch(erreur => avertir("établi", erreur)); }
  });
});
