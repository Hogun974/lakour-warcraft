// Automatismes des capacités de sous-classe (dnd5e 6.0.6, Foundry 14), suite de scripts/automatismes.js : logique pure
// exportée (essais) + hooks. Repères par drapeaux posés par le contenu (contenu/sous-classes.mjs, REPERES_AUTOMATISMES ;
// contenu/compagnons.mjs), jamais par les noms ; seul le MJ actif écrit.
// 5. Auras (flags.aura de la capacité : Aura de pureté, Aura de froid). Sur la scène active, chaque créature dont le jeton
//    a la même allégeance (disposition) que celui du porteur et se trouve dans le rayon reçoit une copie de l'effet
//    transféré de la capacité (flags.aura sur l'effet), marquée flags.auraRecue ; elle la perd en sortant. Le porteur
//    garde la sienne par sa capacité. Rayon selon son niveau dans la classe (rayons du drapeau) ; aura éteinte quand son
//    effet est désactivé sur la fiche, quand le porteur tombe à 0 PV ou est inconscient (ou neutralisé, pour l'Aura de
//    pureté : règle de l'Aura de protection). « Les créatures de votre choix » de l'Aura de froid sont les jetons de même
//    allégeance. Seules les allégeances amicale et hostile ont des alliés : un porteur neutre (ou secret) ne donne son
//    aura à personne ; un PJ, amical, la donne aux jetons amicaux. Positions lues dans la source du jeton (destination
//    du déplacement : en Foundry 14, x/y valent la position animée pendant l'animation). Recalcul différé (un seul à la
//    fois) au déplacement (updateToken, moveToken), à la création ou à la suppression d'un jeton, au
//    changement de tour, de scène active, de PV, d'effets ou de niveau ; seuls les écarts sont écrits (pas de boucle :
//    les effets posés ici ne relancent pas le calcul). Ralentissement (drapeau ralentit) : au début du tour d'une
//    créature d'allégeance opposée dans l'aura, effet marqué flags.auraRalenti (vitesses − 3 m, ou − 10 pi si sa fiche
//    est en pieds), revu au début de son tour suivant, ôté quand elle quitte le combat ou à la fin du combat.
//    Distances : en cases, d'espace à espace (deux jetons voisins sont à 1,5 m), avec la règle de diagonale de la scène
//    (5/5/5 par défaut), altitude comprise, niveaux de scène distincts hors de portée ; sans grille ou en hexagones,
//    distance euclidienne (approchée). Le rayon, écrit en mètres, est converti dans l'unité de la scène (grid.units ;
//    facteurs de CONFIG.DND5E.movementUnits, 1,5 m = 5 pi) ; unité inconnue : pas d'aura.
// 6. Familier du chasseur (flags.familier sur la fiche du bestiaire : classe, pvDeBase, pvParNiveau, maitriseDeBase). Lié à
//    son rôdeur (flags.rodeur = uuid du rôdeur) par l'activité « Lier le familier » (flags.lierFamilier ; jeton ciblé sur
//    la carte d'utilisation) ou par l'API (lierFamilier), par un utilisateur qui possède le familier, ou par un MJ. Le
//    drapeau va sur la fiche du monde, qui passe en jeton lié, et le jeton ciblé lui est lié (un jeton non lié du
//    bestiaire n'en aurait qu'une copie synthétique). PV comparés à la source (system._source), pas aux PV préparés :
//    un bonus de PV max venu d'un effet ne fait pas baisser les PV à chaque recopie. Ses PV max (pvDeBase + pvParNiveau × niveau de rôdeur ; les PV
//    actuels suivent l'écart, sans relever un familier à 0) et l'effet « Lien du chasseur » (flags.lienChasseur : CA,
//    toucher et dégâts + écart entre le bonus de maîtrise du rôdeur et celui que la fiche compte déjà) suivent le rôdeur :
//    au lien, à chaque niveau de classe gagné ou perdu, et au chargement du monde.
// 7. Évasion d'agent (flags.evasion sur l'effet) : l'invisibilité tombe quand l'espion attaque (au jet d'attaque, message
//    « attack » ; pas à la carte d'utilisation, qui précède le jet où l'invisibilité compte encore) ou lance un sort
//    (carte d'utilisation d'un sort, d'une activité « cast » ou d'un parchemin de sort).
// 8. Fût roulant (flags.aTerre = "echec" sur la capacité) : dnd5e 6.0.6 relie chaque jet de sauvegarde lancé depuis une
//    carte à son activité (message « save » : system.activity, system.origin = carte d'utilisation ; SaveActivity#rollSave).
//    Une sauvegarde ratée contre la capacité met la créature à terre : état créé en une seule écriture avec sa marque
//    flags.futRoulant = id du jet (comme dnd5e pose ses états : fromStatusEffect, updateSource, create avec keepId) ;
//    une résistance légendaire dépensée ensuite sur ce jet (system.resisted) la relève.
// Tout est défensif : une API absente ou changée ne fait qu'éteindre l'automatisme ; une erreur (même asynchrone) est
// écrite en console sans interrompre Foundry.
import { ID, avertir, drapeau, estMjActif, liste, pourChacun, prevenir, sur } from "./automatismes.js";

const aPropriete = (objet, chemin) => {
  if (globalThis.foundry?.utils?.hasProperty) return foundry.utils.hasProperty(objet ?? {}, chemin);
  return chemin.split(".").reduce((o, k) => (o && typeof o === "object" && k in o ? o[k] : undefined), objet) !== undefined;
};
const effetActif = e => Boolean(e) && !e.disabled && !e.isSuppressed;
const changementsDe = effet => {
  const brut = effet?.toObject?.() ?? effet ?? {};
  return structuredClone(brut.system?.changes ?? brut.changes ?? []);
};

// ---------------------------------------------------------------- 5. Auras : logique pure

// CONST.TOKEN_DISPOSITIONS : SECRET −2, HOSTILE −1, NEUTRAL 0, FRIENDLY 1.
export const SECRETE = -2;
// Seules les allégeances amicale et hostile ont des alliés : un porteur neutre ou secret ne donne son aura à personne.
export const estAllie = (porteur, cible) => porteur === cible && (porteur === 1 || porteur === -1);
export const estHostile = (porteur, cible) => (porteur === 1 && cible === -1) || (porteur === -1 && cible === 1);

// Rayon (m) d'une aura pour un niveau de classe : celui du dernier palier atteint, null avant le premier.
export function rayonAura(aura, niveau) {
  let rayon = null;
  for (const [min, r] of [...(aura?.rayons ?? [])].sort((a, b) => a[0] - b[0])) if (niveau >= min) rayon = r;
  return rayon;
}

// Unités de longueur de dnd5e (CONFIG.DND5E.movementUnits, conversion en pieds ; 5 pi = 1,5 m).
export const UNITES_LONGUEUR = Object.freeze({ ft: 1, mi: 5280, m: 10 / 3, km: 10000 / 3 });
// Conversion d'une longueur ; null si l'une des unités est inconnue.
export function convertirLongueur(valeur, de, vers) {
  if (!Number.isFinite(valeur) || !UNITES_LONGUEUR[de] || !UNITES_LONGUEUR[vers]) return null;
  return de === vers ? valeur : (valeur * UNITES_LONGUEUR[de]) / UNITES_LONGUEUR[vers];
}
// Rayon d'une aura (écrit en mètres) dans l'unité de la scène ; null avant le premier palier ou pour une unité inconnue.
export function rayonEnScene(aura, niveau, unites) {
  const metres = rayonAura(aura, niveau);
  return metres == null ? null : convertirLongueur(metres, "m", unites);
}

// États qui éteignent l'aura (statuses de dnd5e ; « dead » est l'état « mort » de Foundry).
export const COUPURES = {
  neutralise: ["incapacitated", "paralyzed", "petrified", "stunned", "unconscious", "dead"],
  inconscient: ["unconscious", "dead"]
};
export function porteurActif({ statuts, pv, coupure = "inconscient", eteinte = false } = {}) {
  if (eteinte) return false;
  if (Number.isFinite(pv) && pv <= 0) return false;
  const s = new Set(statuts ?? []);
  return !(COUPURES[coupure] ?? COUPURES.inconscient).some(x => s.has(x));
}

// CONST.GRID_DIAGONALS : nombre de cases pour un écart de a et b cases sur deux axes.
export const DIAGONALES = {
  0: (a, b) => Math.max(a, b),                                        // équidistante (5/5/5)
  1: (a, b) => Math.max(a, b) + (Math.SQRT2 - 1) * Math.min(a, b),    // exacte
  2: (a, b) => Math.max(a, b) + 0.5 * Math.min(a, b),                 // approchée
  3: (a, b) => a + b,                                                 // rectiligne
  4: (a, b) => Math.max(a, b) + Math.floor(Math.min(a, b) / 2),       // alternée 5/10/5
  5: (a, b) => Math.max(a, b) + Math.ceil(Math.min(a, b) / 2),        // alternée 10/5/10
  6: (a, b) => a + b                                                  // diagonales interdites
};

// Distance (unités de la scène, ici le mètre) entre deux jetons { x, y (px), width, height (cases), elevation, level },
// d'espace à espace : deux jetons voisins sont à une case, deux jetons qui se chevauchent à 0.
// grille = { size (px), distance (m par case), type (CONST.GRID_TYPES : 1 carrée), diagonals }.
export function distanceJetons(a, b, grille = {}) {
  if (!a || !b) return Infinity;
  if (a.level && b.level && a.level !== b.level) return Infinity;
  const taille = grille.size > 0 ? grille.size : 100;
  const pas = grille.distance > 0 ? grille.distance : 1.5;
  const axe = (p, l, q, m) => {
    const ecart = Math.max(q - (p + l), p - (q + m));
    return ecart < 0 ? 0 : ecart / taille + 1;
  };
  let dx = axe(a.x ?? 0, (a.width ?? 1) * taille, b.x ?? 0, (b.width ?? 1) * taille);
  let dy = axe(a.y ?? 0, (a.height ?? 1) * taille, b.y ?? 0, (b.height ?? 1) * taille);
  let dz = Math.abs((a.elevation ?? 0) - (b.elevation ?? 0)) / pas;
  if ((grille.type ?? 1) !== 1) return Math.hypot(dx, dy, dz) * pas;
  [dx, dy, dz] = [dx, dy, dz].map(Math.round);
  const regle = DIAGONALES[grille.diagonals] ?? DIAGONALES[0];
  return regle(regle(dx, dy), dz) * pas;
}
const dansRayon = (porteur, cible, grille) => distanceJetons(porteur.geometrie, cible.geometrie, grille) <= porteur.rayon + 1e-6;

// porteurs : porteurs ACTIFS [{ jeton, acteur (uuid), disposition, geometrie, cle, rayon, ralentit }] ;
// jetons : [{ jeton, acteur, disposition, geometrie }]. Rend Map(uuid d'acteur -> Set des clés d'aura à recevoir) ; un
// acteur dont plusieurs jetons sont sur la scène reçoit l'aura si l'un d'eux est dedans.
export function aurasVoulues(porteurs, jetons, grille) {
  const voulues = new Map();
  for (const j of jetons) {
    const cles = voulues.get(j.acteur) ?? new Set();
    for (const p of porteurs) {
      if (p.acteur === j.acteur) continue;   // le porteur a déjà l'effet par sa capacité
      if (estAllie(p.disposition, j.disposition) && dansRayon(p, j, grille)) cles.add(p.cle);
    }
    voulues.set(j.acteur, cles);
  }
  return voulues;
}

// presents : effets d'aura reçue que porte un acteur ([{ id, cle }]) ; voulues : clés qu'il doit porter. Rend
// { aCreer: [clés], aOter: [identifiants] }, vides quand tout est juste ; un doublon de même clé est ôté.
export function ecartAuras(presents, voulues) {
  const gardees = new Set();
  const aOter = [];
  for (const e of presents ?? []) {
    if (!voulues.has(e.cle) || gardees.has(e.cle)) aOter.push(e.id);
    else gardees.add(e.cle);
  }
  return { aCreer: [...voulues].filter(c => !gardees.has(c)), aOter };
}

// Au début du tour d'une créature : le premier porteur actif d'une aura qui ralentit, d'allégeance opposée, dans le
// rayon duquel elle se trouve ; sinon null.
export function ralentisseur(jeton, porteurs, grille) {
  return porteurs.find(p => p.ralentit > 0 && p.acteur !== jeton.acteur && estHostile(p.disposition, jeton.disposition) && dansRayon(p, jeton, grille)) ?? null;
}

// Réduction de vitesse dans l'unité de la fiche (5 pi pour 1,5 m) ; unité inconnue : 0 (rien n'est posé).
export function reductionVitesse(metres, unites) {
  if (!unites || unites === "m") return metres;
  if (unites === "ft") return Math.round((metres / 1.5) * 5);
  return 0;
}

// Données des effets posés par les auras (forme Foundry 14 : system.changes).
export function donneesAuraRecue(source, cle, origine) {
  const brut = source?.toObject?.() ?? source ?? {};
  return {
    name: brut.name, img: brut.img, type: "base", origin: origine ?? null, transfer: false, disabled: false, showIcon: 2,
    description: brut.description ?? "", statuses: [], system: { changes: changementsDe(source) },
    flags: { [ID]: { auraRecue: cle } }
  };
}
export function donneesRalenti({ nom, img, reduction, cle, origine }) {
  return {
    name: nom, img: img ?? null, type: "base", origin: origine ?? null, transfer: false, disabled: false, showIcon: 2, statuses: [],
    system: { changes: [{ key: "system.attributes.movement.bonus", type: "add", value: String(-reduction), phase: "initial", priority: null }] },
    flags: { [ID]: { auraRalenti: cle } }
  };
}

// ---------------------------------------------------------------- 6. Familier : logique pure

export const REGLE_FAMILIER = Object.freeze({ classe: "ranger", pvDeBase: 5, pvParNiveau: 5, maitriseDeBase: 2 });

// Chiffres du familier pour un rôdeur : PV max et écart à ajouter à la CA, au toucher et aux dégâts.
export function chiffresFamilier(regle, { niveau, maitrise }) {
  const r = { ...REGLE_FAMILIER, ...(regle ?? {}) };
  const n = Math.max(0, Math.trunc(Number(niveau) || 0));
  return { pvMax: r.pvDeBase + r.pvParNiveau * n, ecart: Math.max(0, Math.trunc(Number(maitrise) || 0) - r.maitriseDeBase) };
}

// PV actuels quand le maximum enregistré change : ils suivent l'écart, bornés à [1, max + bonus des effets] ; un
// familier à 0 reste à 0.
export function pvApres({ valeur, max, bonus = 0 }, nouveauMax) {
  const v = Number(valeur) || 0;
  if (v <= 0) return 0;
  return Math.min(nouveauMax + Math.max(0, Number(bonus) || 0), Math.max(1, v + (nouveauMax - (Number(max) || 0))));
}

// PV tels qu'enregistrés (system._source), et le surplus que les effets ajoutent au maximum préparé : on compare et on
// écrit la source, jamais les PV préparés (sinon un bonus de PV max ferait baisser les PV à chaque recopie).
export function pvSource(acteur) {
  const prepares = acteur?.system?.attributes?.hp ?? {};
  const source = acteur?.system?._source?.attributes?.hp ?? acteur?._source?.system?.attributes?.hp ?? prepares;
  const max = Number(source.max) || 0;
  return { valeur: Number(source.value) || 0, max, bonus: Math.max(0, (Number(prepares.max) || max) - max) };
}

// Qui peut lier un familier : un MJ, ou un utilisateur propriétaire de sa fiche.
export const peutLier = (utilisateur, familier) => Boolean(utilisateur && (utilisateur.isGM || familier?.testUserPermission?.(utilisateur, "OWNER")));

// Écritures du lien : sur la fiche du monde (drapeau, jeton prototype lié) et sur le jeton ciblé s'il n'est pas lié ;
// null de part et d'autre quand tout est déjà en place.
export function majLien({ estJeton, jetonLie, prototypeLie, rodeurActuel }, uuidRodeur) {
  const acteur = {};
  if (rodeurActuel !== uuidRodeur) acteur[`flags.${ID}.rodeur`] = uuidRodeur;
  if (!prototypeLie) acteur["prototypeToken.actorLink"] = true;
  return { acteur: Object.keys(acteur).length ? acteur : null, jeton: estJeton && !jetonLie ? { actorLink: true } : null };
}

// Changements de l'effet « Lien du chasseur » pour un écart donné (aucun pour un écart nul).
export const CLES_LIEN = ["system.attributes.ac.bonus", "system.rolls.attack.bonus", "system.rolls.damage.mwak.bonus", "system.rolls.damage.rwak.bonus"];
export function changementsLien(ecart) {
  if (!(ecart > 0)) return [];
  return CLES_LIEN.map(key => ({ key, type: "add", value: String(ecart), phase: "initial", priority: null }));
}
const signature = changes => JSON.stringify(liste(changes).map(c => [c.key, c.type ?? c.mode, String(c.value)]));

// etat = { valeur, max, bonus (PV de la SOURCE, voir pvSource), effet: { id, changes } | null } ; rend { maj (données de l'acteur ou null), effet: { action:
// "creer" | "maj" | "oter", id, changes } | null } — rien quand la fiche suit déjà le rôdeur.
export function planFamilier(etat, chiffres) {
  const maj = (Number(etat.max) || 0) === chiffres.pvMax ? null : {
    "system.attributes.hp.max": chiffres.pvMax, "system.attributes.hp.value": pvApres(etat, chiffres.pvMax)
  };
  const voulus = changementsLien(chiffres.ecart);
  let effet = null;
  if (!voulus.length && etat.effet) effet = { action: "oter", id: etat.effet.id };
  else if (voulus.length && !etat.effet) effet = { action: "creer", changes: voulus };
  else if (voulus.length && signature(etat.effet.changes) !== signature(voulus)) effet = { action: "maj", id: etat.effet.id, changes: voulus };
  return { maj, effet };
}

// ---------------------------------------------------------------- 7. Évasion d'agent : logique pure

// Le message rompt-il l'invisibilité ? type : type du message dnd5e ; activite : type de l'activité ; objet : type de l'objet.
// sousType : system.type.value de l'objet (« scroll » : parchemin de sort, qui porte les activités du sort).
export function rompEvasion({ type, activite, objet, sousType } = {}) {
  if (type === "attack") return true;
  if (type !== "usage") return false;
  return objet === "spell" || activite === "cast" || (objet === "consumable" && sousType === "scroll");
}
export const evasionsAOter = effets => liste(effets).filter(e => drapeau(e, "evasion")).map(e => e.id);

// ---------------------------------------------------------------- 8. Fût roulant : logique pure

// Un jet de sauvegarde est raté quand son total est sous sa cible (D20Roll#isFailure de dnd5e).
export const sauvegardeRatee = rolls => liste(rolls).some(r => {
  const cible = Number(r?.options?.target);
  return r?.options?.target != null && Number.isFinite(cible) && Number.isFinite(r?.total) && r.total < cible;
});
export function metATerre({ type, marque, rolls, resiste, aTerre, immunise } = {}) {
  return type === "save" && marque === "echec" && !resiste && !aTerre && !immunise && sauvegardeRatee(rolls);
}

// ---------------------------------------------------------------- Hooks : 5. Auras (MJ actif)

// Position d'un jeton pour les calculs : celle de la SOURCE (destination du déplacement). En Foundry 14, pendant
// l'animation d'un déplacement, TokenDocument#x/y/elevation valent la position animée (interpolée) ; _source porte la
// destination dès le hook updateToken/moveToken (TokenDocument#movement.destination est lue dans _source).
export function positionJeton(t) {
  const s = t?._source ?? t ?? {};
  return { x: s.x, y: s.y, width: s.width, height: s.height, elevation: s.elevation, level: s.level };
}
const geometrie = positionJeton;
export function grilleDe(scene) {
  const g = scene?.grid ?? {};
  let diagonals = g.diagonals;
  if (diagonals === undefined) {
    try { diagonals = game.settings.get("core", "gridDiagonals"); } catch { diagonals = 0; }
  }
  return { size: g.size, distance: g.distance, type: g.type, units: g.units, diagonals };
}
const niveauDeClasse = (acteur, classe) => Number(acteur?.classes?.[classe]?.system?.levels) || 0;
const jetonDe = t => ({ jeton: t.id, acteur: t.actor.uuid, disposition: t.disposition, geometrie: geometrie(t) });

// Porteurs actifs d'une aura sur une scène, avec la capacité et son effet source.
function porteursDe(scene) {
  const porteurs = [];
  const unites = grilleDe(scene).units;
  for (const t of liste(scene?.tokens)) {
    const a = t.actor;
    if (!a) continue;
    for (const item of liste(a.items)) {
      const aura = drapeau(item, "aura");
      if (!aura?.cle) continue;
      const source = liste(item.effects).find(e => drapeau(e, "aura") === aura.cle && effetActif(e));
      // Sans niveau dans la classe (PNJ qui porte la capacité) : niveau de la fiche, sinon le premier palier.
      const niveau = niveauDeClasse(a, aura.classe) || Number(a.system?.details?.level) || 1;
      const rayon = rayonEnScene(aura, niveau, unites);
      if (!rayon || !porteurActif({ statuts: a.statuses, pv: a.system?.attributes?.hp?.value, coupure: aura.coupure, eteinte: !source })) continue;
      porteurs.push({ ...jetonDe(t), cle: aura.cle, rayon, ralentit: aura.ralentit ?? 0, item, source });
    }
  }
  return porteurs;
}

async function recalculerAuras() {
  if (!estMjActif()) return;
  const scene = game.scenes?.active ?? null;
  const jetons = liste(scene?.tokens).filter(t => t.actor);
  const porteurs = porteursDe(scene);
  const voulues = aurasVoulues(porteurs, jetons.map(jetonDe), grilleDe(scene));
  // Acteurs à revoir : ceux de la scène active, et ceux du monde qui portent encore une aura reçue (jeton parti ailleurs).
  const acteurs = new Map(jetons.map(t => [t.actor.uuid, t.actor]));
  for (const a of liste(game.actors)) if (!acteurs.has(a.uuid) && liste(a.effects).some(e => drapeau(e, "auraRecue"))) acteurs.set(a.uuid, a);
  await pourChacun([...acteurs.values()], async a => {
    const presents = liste(a.effects).filter(e => drapeau(e, "auraRecue")).map(e => ({ id: e.id, cle: drapeau(e, "auraRecue") }));
    const { aCreer, aOter } = ecartAuras(presents, voulues.get(a.uuid) ?? new Set());
    if (aOter.length) await a.deleteEmbeddedDocuments("ActiveEffect", aOter);
    const donnees = aCreer.map(cle => porteurs.find(p => p.cle === cle)).filter(p => p?.source).map(p => donneesAuraRecue(p.source, p.cle, p.item.uuid));
    if (donnees.length) await a.createEmbeddedDocuments("ActiveEffect", donnees);
  }, "auras");
}

// Recalcul différé : une rafale de hooks (déplacement, effets) n'en lance qu'un, et jamais deux à la fois.
let minuterie = null;
let file = Promise.resolve();
export function planifierAuras(delai = 150) {
  if (!estMjActif()) return;
  clearTimeout(minuterie);
  minuterie = setTimeout(() => { file = file.then(recalculerAuras).catch(erreur => avertir("auras", erreur)); }, delai);
}

const estSurSceneActive = doc => Boolean(doc?.parent) && doc.parent === game.scenes?.active;
const CHAMPS_JETON = ["x", "y", "elevation", "width", "height", "disposition", "level", "actorId", "actorLink", "delta"];
const estNotreEffet = e => Boolean(drapeau(e, "auraRecue") || drapeau(e, "auraRalenti") || drapeau(e, "lienChasseur"));
sur("updateToken", (jeton, changements) => {
  if (estSurSceneActive(jeton) && CHAMPS_JETON.some(k => k in (changements ?? {}))) planifierAuras();
});
// Foundry 14 : un déplacement passe par le hook moveToken (TokenDocument#_onUpdateMovement), en plus d'updateToken.
sur("moveToken", jeton => { if (estSurSceneActive(jeton)) planifierAuras(); });
sur("createToken", jeton => { if (estSurSceneActive(jeton)) planifierAuras(); });
sur("deleteToken", jeton => { if (estSurSceneActive(jeton)) planifierAuras(); });
sur("deleteActor", () => planifierAuras());
sur("updateScene", (_scene, changements) => { if ("active" in (changements ?? {}) || "grid" in (changements ?? {})) planifierAuras(); });
sur("updateActor", (_acteur, changements) => { if (aPropriete(changements, "system.attributes.hp")) planifierAuras(); });
for (const nom of ["createActiveEffect", "updateActiveEffect", "deleteActiveEffect"]) {
  sur(nom, effet => { if (!estNotreEffet(effet)) planifierAuras(); });
}
for (const nom of ["createItem", "deleteItem"]) {
  sur(nom, item => { if (drapeau(item, "aura") || item?.type === "class") planifierAuras(); });
}
sur("updateItem", (item, changements) => {
  if (drapeau(item, "aura") || (item?.type === "class" && aPropriete(changements, "system.levels"))) planifierAuras();
});
sur("updateCombat", (combat, changements) => {
  if (!("turn" in (changements ?? {}) || "round" in (changements ?? {}))) return;
  planifierAuras();
  return ralentirAuDebutDuTour(combat);
});
globalThis.Hooks?.once?.("ready", () => planifierAuras(500));

// Ralentissement : revu au début du tour de chaque créature (MJ actif).
async function ralentirAuDebutDuTour(combat) {
  if (!estMjActif()) return;
  const jeton = combat?.combatant?.token;
  const acteur = jeton?.actor;
  if (!acteur) return;
  const p = ralentisseur(jetonDe(jeton), porteursDe(jeton.parent), grilleDe(jeton.parent));
  const presents = liste(acteur.effects).filter(e => drapeau(e, "auraRalenti"));
  if (p && presents.length === 1 && drapeau(presents[0], "auraRalenti") === p.cle) return;   // déjà juste
  if (presents.length) await acteur.deleteEmbeddedDocuments("ActiveEffect", presents.map(e => e.id));
  const reduction = p ? reductionVitesse(p.ralentit, acteur.system?.attributes?.movement?.units) : 0;
  if (!reduction) return;
  const nom = game.i18n.format("LAKOURWOW.AuraRalenti", { aura: p.source?.name ?? p.item.name });
  await acteur.createEmbeddedDocuments("ActiveEffect", [donneesRalenti({ nom, img: p.source?.img ?? p.item.img, reduction, cle: p.cle, origine: p.item.uuid })]);
}
// Fin du ralentissement : à la fin du combat, ou quand la créature quitte le combat.
export const ralentisAOter = effets => liste(effets).filter(e => drapeau(e, "auraRalenti")).map(e => e.id);
const oterRalentis = acteurs => pourChacun(acteurs, a => {
  const ids = ralentisAOter(a.effects);
  return ids.length ? a.deleteEmbeddedDocuments("ActiveEffect", ids) : null;
}, "fin du ralentissement des auras");
sur("deleteCombat", async combat => {
  if (!estMjActif()) return;
  await oterRalentis([...new Set(liste(combat?.combatants).map(c => c.actor).filter(Boolean))]);
});
sur("deleteCombatant", async combattant => {
  if (estMjActif() && combattant?.actor) await oterRalentis([combattant.actor]);
});

// ---------------------------------------------------------------- Hooks : 6. Familier du chasseur

const aCompagnon = acteur => liste(acteur?.items).some(i => drapeau(i, "compagnon") === "rodeur");
const resoudreActeur = async x => {
  const doc = typeof x === "string" ? await fromUuid(x) : x;
  return doc?.actor ?? doc?.document?.actor ?? doc ?? null;
};
// Familier désigné par un acteur, un jeton (placeable ou document) ou un uuid : son jeton éventuel, et sa fiche du
// monde (celle d'un acteur synthétique de jeton non lié est l'acteur de base).
async function resoudreFamilier(x) {
  const doc = typeof x === "string" ? await fromUuid(x) : x;
  const jeton = doc?.documentName === "Token" ? doc : doc?.document?.documentName === "Token" ? doc.document : doc?.isToken ? doc.token : null;
  const acteur = jeton?.actor ?? (doc?.documentName === "Actor" ? doc : doc?.actor) ?? null;
  const base = acteur?.isToken ? (acteur.token?.baseActor ?? game.actors?.get(acteur.token?.actorId)) : acteur;
  return { jeton, base: base ?? null };
}

// Familiers liés à un rôdeur : fiches du monde (le lien est toujours posé sur elles, jetons liés).
export function familiersDe(rodeur) {
  return liste(game.actors).filter(a => drapeau(a, "familier") && drapeau(a, "rodeur") === rodeur.uuid);
}

// Recopie (MJ actif) ; une file évite deux recopies concurrentes du même familier (lien puis hook de mise à jour).
let fileFamiliers = Promise.resolve();
export function synchroniserFamilier(familier) {
  fileFamiliers = fileFamiliers.then(() => recopierFamilier(familier)).catch(erreur => avertir("familier", erreur));
  return fileFamiliers;
}
async function recopierFamilier(familier) {
  if (!estMjActif()) return false;
  const regle = drapeau(familier, "familier");
  const uuid = drapeau(familier, "rodeur");
  if (!regle || !uuid) return false;
  const rodeur = globalThis.fromUuidSync?.(uuid, { strict: false });
  const niveau = niveauDeClasse(rodeur, regle.classe ?? REGLE_FAMILIER.classe);
  const maitrise = Number(rodeur?.system?.attributes?.prof);
  if (!aCompagnon(rodeur) || niveau < 1 || !Number.isFinite(maitrise)) return false;
  const chiffres = chiffresFamilier(regle, { niveau, maitrise });
  const lien = liste(familier.effects).find(e => drapeau(e, "lienChasseur"));
  const plan = planFamilier({ ...pvSource(familier), effet: lien ? { id: lien.id, changes: changementsDe(lien) } : null }, chiffres);
  if (plan.maj) await familier.update(plan.maj);
  const texte = `<p>${game.i18n.format("LAKOURWOW.LienChasseurTexte", { n: chiffres.ecart, rodeur: rodeur.name })}</p>`;
  if (plan.effet?.action === "oter") await familier.deleteEmbeddedDocuments("ActiveEffect", [plan.effet.id]);
  if (plan.effet?.action === "maj") await familier.updateEmbeddedDocuments("ActiveEffect", [{ _id: plan.effet.id, "system.changes": plan.effet.changes, description: texte }]);
  if (plan.effet?.action === "creer") {
    await familier.createEmbeddedDocuments("ActiveEffect", [{
      name: game.i18n.localize("LAKOURWOW.LienChasseur"), img: rodeur.img, type: "base", origin: rodeur.uuid, transfer: false,
      disabled: false, showIcon: 0, statuses: [], description: texte, system: { changes: plan.effet.changes }, flags: { [ID]: { lienChasseur: true } }
    }]);
  }
  return Boolean(plan.maj || plan.effet);
}

// Lie un familier (acteur, jeton ou uuid ; par défaut le jeton contrôlé) à un rôdeur (par défaut le personnage de
// l'utilisateur), pour le compte d'un utilisateur (par défaut l'utilisateur courant) qui doit posséder le familier ou
// être MJ. Le drapeau va sur la fiche du monde, dont le jeton prototype passe en lié (un compagnon est unique), et le
// jeton désigné est lié à elle. Rend true si le lien est posé.
// API : game.modules.get("lakour-warcraft").api.lierFamilier(familier, rodeur).
export async function lierFamilier(familier, rodeur, { utilisateur = game.user } = {}) {
  const { jeton, base: f } = await resoudreFamilier(familier ?? globalThis.canvas?.tokens?.controlled?.[0]);
  const r = await resoudreActeur(rodeur ?? game.user?.character);
  if (!f || !drapeau(f, "familier")) { prevenir("LAKOURWOW.FamilierInconnu", { nom: f?.name ?? "?" }); return false; }
  if (!peutLier(utilisateur, f)) { prevenir("LAKOURWOW.FamilierPasProprietaire", { nom: f.name, utilisateur: utilisateur?.name ?? "?" }); return false; }
  if (!r || !aCompagnon(r)) { prevenir("LAKOURWOW.RodeurSansCompagnon", { nom: r?.name ?? "?" }); return false; }
  const plan = majLien({ estJeton: Boolean(jeton), jetonLie: jeton?.actorLink, prototypeLie: f.prototypeToken?.actorLink, rodeurActuel: drapeau(f, "rodeur") }, r.uuid);
  if (plan.acteur) await f.update(plan.acteur);
  if (plan.jeton) await jeton.update(plan.jeton);
  await synchroniserFamilier(f);
  try { ui.notifications?.info(game.i18n.format("LAKOURWOW.FamilierLie", { familier: f.name, rodeur: r.name })); } catch { /* interface absente */ }
  return true;
}

// Activité « Lier le familier » : le MJ actif lit les cibles de la carte d'utilisation et lie au lanceur.
sur("createChatMessage", async message => {
  if (!estMjActif() || message?.type !== "usage") return;
  const activite = message.getAssociatedActivity?.();
  if (!drapeau(activite, "lierFamilier")) return;
  const rodeur = activite.item?.actor ?? message.getAssociatedActor?.();
  // Le jeton ciblé (document), à défaut l'acteur : lierFamilier remonte à la fiche du monde et lie le jeton.
  const cibles = liste(message.system?.targets).map(t => (t?.token ? globalThis.fromUuidSync?.(t.token, { strict: false }) : null)
    ?? (t?.actor ? globalThis.fromUuidSync?.(t.actor, { strict: false }) : null)).filter(c => drapeau(c?.actor ?? c, "familier"));
  const auteur = message.author ?? game.users?.get(message.user);
  const autorisees = cibles.filter(c => peutLier(auteur, c?.actor?.isToken ? (c.actor.token?.baseActor ?? c.actor) : (c?.actor ?? c)));
  const refus = cibles.length && !autorisees.length;
  if (!autorisees.length) {
    const destinataires = [...new Set([auteur?.id, ...game.users.filter(u => u.isGM).map(u => u.id)])].filter(Boolean);
    const texte = refus
      ? game.i18n.format("LAKOURWOW.FamilierPasProprietaire", { nom: (cibles[0]?.actor ?? cibles[0])?.name ?? "?", utilisateur: auteur?.name ?? "?" })
      : game.i18n.localize("LAKOURWOW.FamilierSansCible");
    await ChatMessage.implementation.create({ content: `<p>${texte}</p>`, whisper: destinataires, speaker: { alias: game.i18n.localize("LAKOURWOW.Titre") } });
    return;
  }
  await pourChacun(autorisees, c => lierFamilier(c, rodeur, { utilisateur: auteur }), "familier : lien");
});

async function synchroniserRodeur(acteur) {
  if (!estMjActif() || !(acteur instanceof Actor) || !aCompagnon(acteur)) return;
  await pourChacun(familiersDe(acteur), synchroniserFamilier, "familier");
}
sur("updateItem", (item, changements) => {
  if (item?.type === "class" && aPropriete(changements, "system.levels")) return synchroniserRodeur(item.parent);
});
sur("createItem", item => { if (item?.type === "class" || drapeau(item, "compagnon")) return synchroniserRodeur(item.parent); });
sur("deleteItem", item => { if (item?.type === "class") return synchroniserRodeur(item.parent); });
sur("updateActor", (acteur, changements) => {
  if (estMjActif() && aPropriete(changements, `flags.${ID}.rodeur`)) return synchroniserFamilier(acteur);
});
globalThis.Hooks?.once?.("ready", async () => {
  if (!estMjActif()) return;
  await pourChacun(liste(game.actors).filter(a => drapeau(a, "familier") && drapeau(a, "rodeur")), synchroniserFamilier, "familier : chargement");
});

// ---------------------------------------------------------------- Hooks : 7. Évasion d'agent et 8. Fût roulant (MJ actif)

sur("createChatMessage", async message => {
  if (!estMjActif() || !["usage", "attack"].includes(message?.type)) return;   // seules ces cartes portent une activité
  const activite = message.getAssociatedActivity?.();
  const item = activite?.item ?? message.getAssociatedItem?.();
  if (!rompEvasion({ type: message.type, activite: activite?.type, objet: item?.type, sousType: item?.system?.type?.value })) return;
  const acteur = item?.actor ?? message.getAssociatedActor?.();
  const ids = evasionsAOter(acteur?.effects);
  if (ids.length) await acteur.deleteEmbeddedDocuments("ActiveEffect", ids);
});

sur("createChatMessage", async message => {
  if (!estMjActif() || message?.type !== "save") return;
  const activite = message.getAssociatedActivity?.();
  const item = activite?.item ?? message.getAssociatedItem?.();
  const acteur = message.getAssociatedActor?.();
  if (!acteur || !metATerre({
    type: message.type, marque: drapeau(item, "aTerre"), rolls: message.rolls, resiste: message.system?.resisted,
    aTerre: acteur.statuses?.has?.("prone"), immunise: acteur.system?.traits?.ci?.value?.has?.("prone")
  })) return;
  const Effet = globalThis.ActiveEffect?.implementation;
  if (typeof Effet?.fromStatusEffect !== "function") return;   // API absente : l'automatisme s'éteint
  const etat = await Effet.fromStatusEffect("prone");
  etat.updateSource({ flags: { [ID]: { futRoulant: message.id } } });
  await Effet.create(etat, { parent: acteur, keepId: true });
});
// Résistance légendaire dépensée sur ce jet : l'état posé par ce jet est retiré.
sur("updateChatMessage", async (message, changements) => {
  if (!estMjActif() || message?.type !== "save" || !aPropriete(changements, "system.resisted") || !message.system?.resisted) return;
  const acteur = message.getAssociatedActor?.();
  const ids = liste(acteur?.effects).filter(e => drapeau(e, "futRoulant") === message.id).map(e => e.id);
  if (ids.length) await acteur.deleteEmbeddedDocuments("ActiveEffect", ids);
});
