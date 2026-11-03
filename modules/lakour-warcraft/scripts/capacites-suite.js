// Automatismes des capacités de sous-classe, suite de scripts/capacites.js (dnd5e 6.0.6, Foundry 14) : logique pure
// exportée (essais) + hooks. Repères par drapeaux posés par le contenu (contenu/sous-classes.mjs, REPERES_AUTOMATISMES),
// jamais par les noms ; seul le MJ actif écrit (les refus avant utilisation se font sur le poste de l'utilisateur, sans
// rien écrire). Positions des jetons lues dans leur source (positionJeton : destination d'un déplacement en cours).
// Les cartes que le MJ actif exploite ne valent que si leur auteur est MJ ou propriétaire de ce qu'elles touchent
// (auteurAutorise) : un joueur ne peut pas forger un message pour déplacer, invoquer ou renverser.
// 9. Châtiment du Fléau (typesVises sur l'activité « Terreur sacrée » et sur son effet) : la sauvegarde ne vise que les
//    morts-vivants et les fiélons (system.details.type.value). Utilisation refusée si toutes les cibles ont un type connu
//    hors de la liste ; cibles de la carte filtrées (dnd5e.preCreateUsageMessage) quand il y en a de plusieurs sortes ;
//    un type inconnu (absent, « custom ») laisse la main au MJ. Filet du MJ actif : l'effet appliqué à une créature
//    d'un autre type connu est retiré.
// 10. Champion de la Lumière (lumiere: { vive } sur l'effet) : tant que l'effet est actif sur l'acteur, ses jetons
//    émettent une lumière vive de 9 m (convertie dans l'unité de la scène ; une lumière déjà plus grande est gardée) ;
//    la lumière d'avant est notée sur le jeton (flags.lumiereAvant) et rétablie à la fin de l'effet.
// 11. Avatar des éléments (recharge sur l'activité « Regagner l'avatar ») : la consommation native de dnd5e rend
//    l'utilisation (itemUses −1) et dépense un emplacement de niveau 5 (spellSlots, cible « 5 ») ; refus si
//    l'utilisation n'est pas dépensée (UsesField.spent ne descend pas sous 0), et refus à la consommation
//    (dnd5e.preActivityConsumption) si l'emplacement est décoché alors que l'utilisation serait rendue.
// 12. Poigne de la mort (attire: "echec" sur la capacité) : sauvegarde ratée (message « save » relié à l'activité) →
//    le jeton est déplacé (action « displace » de Foundry 14 : sans coût ni mesure) jusqu'à l'espace libre voisin du
//    chevalier le plus proche de sa position (fin de la ligne droite), murs de déplacement compris quand la scène est celle du canevas du MJ ; position d'origine notée sur le
//    message, rétablie si une résistance légendaire est dépensée sur ce jet. L'entrave reste posée par l'activité.
// 13. Armée des morts (armee: { profil, nombre, portee, duree } sur l'activité ; armee sur l'effet) : à la carte
//    d'utilisation, le profil du bestiaire du module est importé en acteur du monde marqué (flags.armee, propriétaires
//    du chevalier), ses jetons posés dans les espaces libres les plus proches à 9 m ou moins, ajoutés au combat juste
//    après le chevalier. Renvoyés (combattants, jetons, acteur) au bout de la minute (10 rounds du combat où ils sont
//    levés, au tour de son combattant, sinon 60 s du temps du monde), à la fin de ce combat, ou quand l'effet « Armée
//    des morts » de cette utilisation se termine.
// 14. Aspect de la meute (meute sur l'effet) : copie de l'effet actif du rôdeur sur chaque familier lié (même durée,
//    flags.meuteRecue), ôtée quand l'effet du rôdeur se termine.
// 15. Frénésie bestiale (frenesie sur la capacité) : la capacité est recopiée sur la fiche de chaque familier lié
//    (flags.frenesieRecue), avec son activité de dégâts ; ôtée quand le rôdeur ne l'a plus ou change de familier.
// 16. Totems élémentaires (totem: { cible, rayon, portee } sur les activités, gabarit « radius » fixe) : le gabarit
//    (région dnd5e : émanation dont la base est la case du totem, ou cercle) est le totem ; il est marqué
//    (flags.totem), les alliés à 3 m de sa case (barbare compris) reçoivent l'effet du totem, les créatures hostiles du
//    totem de magma sont nommées au MJ ; il est ôté à la fin de la Rage (effet appliqué à l'acteur, venu d'un objet
//    d'identifiant « rage » comme celle du SRD 2024 ; jamais un effet de l'objet lui-même, que dnd5e prépare actif
//    quand une activité le cite), au plus tard 10 minutes de temps du monde après la pose (durée maximale d'une
//    Rage), à la fin du combat, ou quand son porteur n'existe plus. Planter hors de la Rage est refusé.
// 17. Ivresse du sage (ivresse sur l'effet « Ivresse insondable », renverser sur l'activité « Renverser
//    l'assaillant ») : une attaque au corps à corps ratée contre le moine (message « attack », cibles évaluées comme
//    dnd5e ; une arme lancée ou à distance n'en est pas une) lui propose sa réaction en chuchotement ; à l'utilisation, l'assaillant (ciblé, sinon le dernier qui l'a
//    raté) est mis à terre en une écriture (flags.ivresse = id de la carte). Mémoire des ratés : celle du poste du MJ
//    actif, deux minutes.
// Tout est défensif : une API absente ou changée ne fait qu'éteindre l'automatisme ; une erreur (même asynchrone) est
// écrite en console sans interrompre Foundry.
import { ID, drapeau, estMjActif, liste, pourChacun, prevenir, sur, surPre } from "./automatismes.js";
import {
  convertirLongueur, distanceJetons, ecartAuras, estAllie, estHostile, familiersDe, grilleDe, peutLier, positionJeton, sauvegardeRatee
} from "./capacites.js";

const effetActif = e => Boolean(e) && !e.disabled && !e.isSuppressed && !e.duration?.expired;
const uuidSync = u => (u ? globalThis.fromUuidSync?.(u, { strict: false }) ?? null : null);
// Les noms (jetons, acteurs, activités) sont échappés avant d'entrer dans le HTML d'un message.
export const echapper = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const t = (cle, donnees) => game.i18n.format(cle, Object.fromEntries(Object.entries(donnees ?? {}).map(([k, v]) => [k, echapper(v)])));
// Auteur d'une carte : MJ, ou propriétaire du document qu'elle touche (même règle que peutLier).
export const auteurAutorise = (auteur, doc) => peutLier(auteur, doc);
const mjs = () => liste(game.users).filter(u => u.isGM).map(u => u.id);
const proprietaires = acteur => liste(game.users).filter(u => !u.isGM && acteur?.testUserPermission?.(u, "OWNER")).map(u => u.id);
async function chuchoter(texte, destinataires = []) {
  const ids = [...new Set([...destinataires, ...mjs()])].filter(Boolean);
  await ChatMessage.implementation.create({ content: `<p>${texte}</p>`, whisper: ids, speaker: { alias: game.i18n.localize("LAKOURWOW.Titre") } });
}
const enUnites = (metres, scene) => convertirLongueur(Number(metres), "m", scene?.grid?.units);

// ---------------------------------------------------------------- Géométrie commune (Poigne, Armée)

// Grilles prises en charge : carrée (1) et sans grille (0, pas d'une taille de case) ; hexagonale : rien n'est posé.
export const grilleCarree = grille => [0, 1].includes(grille?.type ?? 1);
const taille = g => (g?.size > 0 ? g.size : 100);
function chevauche(a, b, s) {
  const ax = a.x + (a.width ?? 1) * s, ay = a.y + (a.height ?? 1) * s, bx = b.x + (b.width ?? 1) * s, by = b.y + (b.height ?? 1) * s;
  return a.x < bx - 1e-6 && b.x < ax - 1e-6 && a.y < by - 1e-6 && b.y < ay - 1e-6;
}
const memeNiveau = (a, b) => !a?.level || !b?.level || a.level === b.level;
const dansLimites = (p, l, s) => !l || (p.x >= l.x && p.y >= l.y && p.x + (p.width ?? 1) * s <= l.x + l.width && p.y + (p.height ?? 1) * s <= l.y + l.height);
const centre = (p, s) => ({ x: p.x + (p.width ?? 1) * s / 2, y: p.y + (p.height ?? 1) * s / 2 });

// ---------------------------------------------------------------- 9. Châtiment du Fléau : logique pure

// « oui » (type visé), « non » (type connu, hors liste) ou « inconnu » (absent ou personnalisé : le MJ décide).
export function verdictType(type, vises) {
  const v = typeof type === "string" ? type : type?.value;
  if (!v || v === "custom" || !Array.isArray(vises)) return "inconnu";
  return vises.includes(v) ? "oui" : "non";
}
// types : type de chaque cible. Rend les indices à garder et s'il faut refuser (toutes les cibles hors liste).
export function filtrerCibles(types, vises) {
  const verdicts = [...(types ?? [])].map(x => verdictType(x, vises));
  const garder = verdicts.flatMap((v, i) => (v === "non" ? [] : [i]));
  return { garder, refuser: verdicts.length > 0 && garder.length === 0 };
}
export const terreurARetirer = (vises, type) => Array.isArray(vises) && vises.length > 0 && verdictType(type, vises) === "non";

// ---------------------------------------------------------------- 10. Champion de la Lumière : logique pure

// Lumière voulue ({ bright, dim } dans l'unité de la scène, au centième) ; null pour une unité inconnue.
export function lumiereVoulue(lumiere, unites) {
  const r = convertirLongueur(Number(lumiere?.vive), "m", unites);
  return r > 0 ? { bright: Math.round(r * 100) / 100, dim: Math.round(r * 100) / 100 } : null;
}
// Rend { light (à écrire ou null), avant (mémo à poser, "oter", ou null) } ; null quand le jeton est déjà juste.
export function planLumiere({ voulue, actuelle = {}, avant = null } = {}) {
  const nb = v => Math.max(0, Number(v) || 0);
  if (voulue) {
    const memo = avant ?? { bright: nb(actuelle.bright), dim: nb(actuelle.dim) };
    const bright = Math.max(nb(memo.bright), voulue.bright);
    const dim = Math.max(nb(memo.dim), voulue.dim, bright);
    const light = nb(actuelle.bright) === bright && nb(actuelle.dim) === dim ? null : { bright, dim };
    return light || !avant ? { light, avant: avant ? null : memo } : null;
  }
  return avant ? { light: { bright: nb(avant.bright), dim: nb(avant.dim) }, avant: "oter" } : null;
}

// ---------------------------------------------------------------- 11. Avatar des éléments : logique pure

// Regagner l'utilisation n'a de sens que si elle est dépensée.
export const rechargeRefusee = depense => !(Number(depense) >= 1);
// consume : usageConfig.consume de dnd5e (true, ou { resources: true | [indices] }) ; cibles : consumption.targets.
// Refus quand l'utilisation serait rendue sans que l'emplacement soit dépensé.
export function rechargeIncomplete(consume, cibles) {
  const toutes = consume === true || consume?.resources === true;
  const indices = toutes ? liste(cibles).map((_, i) => i) : Array.isArray(consume?.resources) ? consume.resources : [];
  const prises = indices.map(i => liste(cibles)[i]).filter(Boolean);
  const rend = prises.some(c => c.type === "itemUses" && Number(c.value) < 0);
  return rend && !prises.some(c => c.type === "spellSlots");
}

// ---------------------------------------------------------------- 12. Poigne de la mort : logique pure

// source, cible : positions { x, y (px), width, height (cases), elevation, level } ; occupes : autres jetons.
// Rend { etat: "deja" } (déjà à côté), { etat: "aucun" } (pas de place, ou grille hexagonale) ou { etat: "ok", x, y,
// elevation } : l'espace libre voisin de la source le plus proche de la cible (au bout de la ligne droite).
export function espaceAttire({ source, cible, occupes = [], grille = {}, limites = null, accessible = () => true } = {}) {
  if (!source || !cible || !grilleCarree(grille)) return { etat: "aucun" };
  const s = taille(grille);
  const pas = grille.distance > 0 ? grille.distance : 1.5;
  if (distanceJetons(source, cible, grille) <= pas + 1e-6) return { etat: "deja" };
  const w = cible.width ?? 1, h = cible.height ?? 1, sw = source.width ?? 1, sh = source.height ?? 1;
  const autres = occupes.filter(o => memeNiveau(o, source));
  const c0 = centre(cible, s);
  const candidats = [];
  for (let dy = -h; dy <= sh; dy++) {
    for (let dx = -w; dx <= sw; dx++) {
      if (!(dx === -w || dx === sw || dy === -h || dy === sh)) continue;   // l'anneau qui touche la source
      const p = { x: source.x + dx * s, y: source.y + dy * s, width: w, height: h, elevation: source.elevation ?? 0, level: source.level };
      if (!dansLimites(p, limites, s) || autres.some(o => chevauche(p, o, s)) || !accessible(p)) continue;
      const c = centre(p, s);
      candidats.push({ p, d: Math.hypot(c.x - c0.x, c.y - c0.y), dx, dy });
    }
  }
  candidats.sort((a, b) => a.d - b.d || a.dy - b.dy || a.dx - b.dx);
  const [m] = candidats;
  return m ? { etat: "ok", x: m.p.x, y: m.p.y, elevation: m.p.elevation } : { etat: "aucun" };
}

// ---------------------------------------------------------------- 13. Armée des morts : logique pure

// Espaces libres (taille { w, h } en cases) à portee (unités de la scène) ou moins de la source, les plus proches
// d'abord ; au plus nombre. Grille hexagonale : aucun.
export function espacesLibres({ source, taille: t2 = {}, occupes = [], grille = {}, portee, nombre, limites = null, accessible = () => true } = {}) {
  if (!source || !grilleCarree(grille) || !(portee > 0) || !(nombre > 0)) return [];
  const s = taille(grille);
  const pas = grille.distance > 0 ? grille.distance : 1.5;
  const w = t2.w ?? 1, h = t2.h ?? 1;
  const r = Math.ceil(portee / pas) + 1;
  const candidats = [];
  for (let dy = -r - h; dy <= r + (source.height ?? 1); dy++) {
    for (let dx = -r - w; dx <= r + (source.width ?? 1); dx++) {
      const p = { x: source.x + dx * s, y: source.y + dy * s, width: w, height: h, elevation: source.elevation ?? 0, level: source.level };
      const d = distanceJetons(source, p, grille);
      if (d > portee + 1e-6 || chevauche(p, source, s) || !dansLimites(p, limites, s)) continue;
      candidats.push({ p, d, dx, dy });
    }
  }
  candidats.sort((a, b) => a.d - b.d || a.dy - b.dy || a.dx - b.dx);
  const pris = [];
  const autres = occupes.filter(o => memeNiveau(o, source));
  for (const { p } of candidats) {
    if (pris.length >= nombre) break;
    if (autres.some(o => chevauche(p, o, s)) || pris.some(o => chevauche(p, o, s)) || !accessible(p)) continue;
    pris.push(p);
  }
  return pris.map(p => ({ x: p.x, y: p.y, elevation: p.elevation }));
}

// Initiative « juste après » le chevalier (au centième) ; null s'il n'en a pas.
export const initiativeApres = init => (Number.isFinite(init) ? Math.round((init - 0.01) * 100) / 100 : null);

// debut = { temps, combat, combattant, enCours, round, turn, rounds, secondes } ; maintenant = { temps, combat: { id,
// round, turn, tours: [ids des combattants dans l'ordre] } }. Dans le combat où elle a été levée : au tour du
// combattant du chevalier (repéré par son id, l'ordre a pu changer), rounds plus tard ; sinon au bout de secondes.
export function armeeExpiree(debut, { temps, combat } = {}) {
  if (!debut) return true;
  if (debut.enCours && debut.combat && combat?.id === debut.combat && Number.isFinite(combat.round)) {
    const fin = debut.round + debut.rounds;
    const ici = debut.combattant && Array.isArray(combat.tours) ? combat.tours.indexOf(debut.combattant) : -1;
    const tour = ici >= 0 ? ici : (debut.turn ?? 0);
    return combat.round > fin || (combat.round === fin && (combat.turn ?? 0) >= tour);
  }
  return Number.isFinite(temps) && Number.isFinite(debut.temps) && temps - debut.temps >= debut.secondes;
}

// ---------------------------------------------------------------- 14-15. Meute et Frénésie : logique pure

// sources : clés des originaux actifs ; presents : copies [{ id, source }]. Rend { aCreer: [clés], aOter: [ids] }.
export const ecartCopies = (sources, presents) => ecartAuras(liste(presents).map(p => ({ id: p.id, cle: p.source })), new Set(sources));

export function donneesMeute(source, uuidSource, origine) {
  const brut = source?.toObject?.() ?? source ?? {};
  const d = {
    name: brut.name, img: brut.img, type: "base", origin: origine ?? null, transfer: false, disabled: false,
    showIcon: brut.showIcon ?? 1, description: brut.description ?? "", statuses: [...(brut.statuses ?? [])],
    system: { changes: structuredClone(brut.system?.changes ?? brut.changes ?? []) },
    duration: { ...(brut.duration ?? {}), expired: false },
    flags: { [ID]: { meuteRecue: uuidSource } }
  };
  if (brut.start) d.start = { ...brut.start };
  return d;
}

export function donneesFrenesie(item) {
  const brut = structuredClone(item?.toObject?.() ?? item ?? {});
  delete brut._id;
  delete brut.folder;
  brut.flags = { ...brut.flags, [ID]: { cle: brut.flags?.[ID]?.cle, frenesieRecue: item?.uuid } };
  return brut;
}

// ---------------------------------------------------------------- 16. Totems élémentaires : logique pure

// Case du totem d'après la forme de la région dnd5e : émanation (base { x, y px, width, height en cases }) ou cercle
// (centre x, y). null si la forme n'en dit rien.
export function caseTotem(forme, grille = {}, extra = {}) {
  if (forme?.type === "emanation" && Number.isFinite(forme.base?.x) && Number.isFinite(forme.base?.y)) {
    const b = forme.base;
    return b.type === "token"
      ? { x: b.x, y: b.y, width: b.width ?? 1, height: b.height ?? 1, elevation: extra.elevation ?? 0, level: extra.level }
      : celluleDe({ x: b.x, y: b.y, ...extra }, grille);
  }
  if (Number.isFinite(forme?.x) && Number.isFinite(forme?.y)) return celluleDe({ x: forme.x, y: forme.y, ...extra }, grille);
  return null;
}
// Case qui contient un point.
export function celluleDe(point, grille = {}) {
  const s = taille(grille);
  return { x: Math.floor(point.x / s) * s, y: Math.floor(point.y / s) * s, width: 1, height: 1, elevation: point.elevation ?? 0, level: point.level };
}
// jetons : [{ jeton, acteur, disposition, geometrie }] ; porteur : { acteur, disposition }. cible « allies » : le
// porteur et ses alliés ; « hostiles » : les créatures d'allégeance opposée.
export function jetonsDuTotem({ totem, porteur, jetons, rayon, cible, grille }) {
  return liste(jetons).filter(j => {
    const camp = cible === "hostiles"
      ? estHostile(porteur.disposition, j.disposition)
      : j.acteur === porteur.acteur || estAllie(porteur.disposition, j.disposition);
    return camp && distanceJetons(totem, j.geometrie, grille) <= rayon + 1e-6;
  });
}
export const totemTropLoin = (porteur, totem, portee, grille) => distanceJetons(porteur, totem, grille) > portee + 1e-6;
// effets : [{ identifiant (de l'objet d'où vient l'effet), actif, surObjet (effet porté par l'objet lui-même) }]. Un
// effet de l'objet Rage n'est jamais la Rage en cours : dnd5e prépare actif (transfer et disabled à false) l'effet
// qu'une activité cite (ActiveEffectDataModel#prepareBaseData, isOnActivity).
export const rageActive = effets => liste(effets).some(e => e.identifiant === "rage" && e.actif && !e.surObjet);
export const totemRefuse = ({ aRage, enRage }) => Boolean(aRage) && !enRage;
// Durée maximale d'une Rage (SRD 2024 : 10 minutes).
export const RAGE_MAX = 600;
// totems : [{ id, rage (Rage active à la pose), temps (temps du monde à la pose), porteur (résolu ou non) }]. Tombent :
// ceux d'un porteur disparu, ceux plantés en Rage quand elle cesse, tous au bout de la durée maximale d'une Rage.
export function totemsAOter(totems, enRage, temps) {
  return liste(totems).filter(x => x.porteur === false || (x.rage && !enRage)
    || (Number.isFinite(temps) && Number.isFinite(x.temps) && temps - x.temps >= RAGE_MAX)).map(x => x.id);
}

// ---------------------------------------------------------------- 17. Ivresse du sage : logique pure

// Attaque au corps à corps : activité « melee » jouée sans mode lancé ni à distance (dnd5e : attackMode « thrown »,
// « thrown-offhand » ou « ranged » font une attaque à distance, AttackActivity#getRollData).
export const estMelee = (type, mode) => type === "melee" && !(String(mode ?? "").includes("thrown") || mode === "ranged");
// Cibles ratées par une attaque au corps à corps (comme AttackMessageData#evaluatedTargets, sans les CA inconnues).
export function assaillantsRates({ total, critique, echec, melee, cibles } = {}) {
  if (!melee || !Number.isFinite(total)) return [];
  return liste(cibles).filter(c => Number.isFinite(c?.ac) && !critique && (total < c.ac || echec));
}
// rates : [{ jeton, acteur, quand (ms) }] ; cibles de la carte : [{ token, actor }]. Les cibles déjà ratées, sinon le
// dernier assaillant ; seulement dans le délai.
export function choisirAssaillants({ cibles = [], rates = [], maintenant = Date.now(), delai = 120000 } = {}) {
  const recents = liste(rates).filter(r => maintenant - r.quand <= delai);
  const correspond = (c, r) => (c.token && r.jeton ? c.token === r.jeton : c.actor === r.acteur);
  if (liste(cibles).length) return recents.filter(r => liste(cibles).some(c => correspond(c, r)));
  const dernier = recents.reduce((a, r) => (!a || r.quand > a.quand ? r : a), null);
  return dernier ? [dernier] : [];
}

// ---------------------------------------------------------------- Outils des hooks

const typeDe = acteur => acteur?.system?.details?.type;
const jetonsSurScene = (acteur, scene) => liste(scene?.tokens).filter(x => x.actor && (x.actor === acteur || x.actor.uuid === acteur?.uuid));
const plusProche = (jetons, de) => jetons.map(x => ({ x, d: distanceJetons(positionJeton(x), positionJeton(de), grilleDe(de?.parent)) }))
  .sort((a, b) => a.d - b.d)[0]?.x ?? null;
function limitesDe(scene) {
  try { const r = scene?.dimensions?.sceneRect; return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null; } catch { return null; }
}
// Murs de déplacement : testés depuis le centre de depart quand la scène est celle du canevas du MJ, sinon ignorés.
function testeurMurs(scene, depart) {
  const Fond = globalThis.CONFIG?.Canvas?.polygonBackends?.move;
  if (!globalThis.canvas?.ready || canvas.scene !== scene || typeof Fond?.testCollision !== "function") return () => true;
  const s = taille(scene.grid);
  return p => !Fond.testCollision(centre(depart, s), centre(p, s), { type: "move", mode: "any" });
}
const occupesSauf = (scene, ...exclus) => liste(scene?.tokens).filter(x => !exclus.includes(x)).map(positionJeton);
async function poserATerre(acteur, marque) {
  if (!acteur || acteur.statuses?.has?.("prone") || acteur.system?.traits?.ci?.value?.has?.("prone")) return false;
  const Effet = globalThis.ActiveEffect?.implementation;
  if (typeof Effet?.fromStatusEffect !== "function") return false;
  const etat = await Effet.fromStatusEffect("prone");
  etat.updateSource({ flags: { [ID]: marque } });
  await Effet.create(etat, { parent: acteur, keepId: true });
  return true;
}
// Déplacement forcé : action « displace » de Foundry 14 (CONFIG.Token.movement.actions : téléportation, coût nul,
// ni mesure ni murs), passée en options de mise à jour (TokenDocument#preUpdateMovement lit options.movement[id]).
export const optionsDeplacement = (id, vers) => ({ movement: { [id]: { waypoints: [{ ...vers, action: "displace" }] } } });
const deplacer = (jeton, vers) => jeton.update(vers, optionsDeplacement(jeton.id, vers));
const supprimerDrapeau = cle => (globalThis._del ? { flags: { [ID]: { [cle]: globalThis._del } } } : { [`flags.${ID}.-=${cle}`]: null });

// ---------------------------------------------------------------- Hooks : 9. Châtiment du Fléau

surPre("dnd5e.preUseActivity", activity => {
  const vises = drapeau(activity, "typesVises");
  if (!Array.isArray(vises)) return;
  const acteurs = liste(game.user?.targets).map(x => x.actor).filter(Boolean);
  if (!filtrerCibles(acteurs.map(typeDe), vises).refuser) return;
  prevenir("LAKOURWOW.FleauRefuse", { activite: activity.name, noms: acteurs.map(a => a.name).join(", ") });
  return false;
});
// Synchrone : dnd5e crée la carte juste après ce hook, avec ces données.
surPre("dnd5e.preCreateUsageMessage", (activity, config) => {
  const vises = drapeau(activity, "typesVises");
  const cibles = config?.data?.system?.targets;
  if (!Array.isArray(vises) || !Array.isArray(cibles) || !cibles.length) return;
  const { garder } = filtrerCibles(cibles.map(c => typeDe(uuidSync(c?.actor))), vises);
  if (garder.length && garder.length < cibles.length) config.data.system.targets = garder.map(i => cibles[i]);
});
async function retirerTerreur(effet, userId) {
  const acteur = effet?.parent;
  if (!estMjActif() || !(acteur instanceof Actor) || !effetActif(effet) || !terreurARetirer(drapeau(effet, "typesVises"), typeDe(acteur))) return;
  await effet.delete();
  await chuchoter(t("LAKOURWOW.FleauRetire", { effet: effet.name, nom: acteur.name }), [userId]);
}
sur("createActiveEffect", (effet, _o, userId) => retirerTerreur(effet, userId));
sur("updateActiveEffect", (effet, changements, _o, userId) => { if (changements?.disabled === false) return retirerTerreur(effet, userId); });

// ---------------------------------------------------------------- Hooks : 10. Champion de la Lumière (MJ actif)

const lumiereDe = acteur => liste(acteur?.effects).filter(effetActif).map(e => drapeau(e, "lumiere")).find(l => l?.vive > 0) ?? null;
function jetonsDe(acteur) {
  if (!acteur) return [];
  if (acteur.isToken) return acteur.token ? [acteur.token] : [];
  return liste(game.scenes).flatMap(s => liste(s.tokens).filter(x => x.actorLink && x.actorId === acteur.id));
}
async function synchroniserLumiere(acteur, jetons = jetonsDe(acteur)) {
  if (!estMjActif()) return;
  const lumiere = lumiereDe(acteur);
  await pourChacun(jetons, async jeton => {
    const plan = planLumiere({
      voulue: lumiere ? lumiereVoulue(lumiere, jeton.parent?.grid?.units) : null,
      actuelle: jeton._source?.light ?? jeton.light, avant: drapeau(jeton, "lumiereAvant") ?? null
    });
    if (!plan) return;
    let maj = plan.light ? { light: plan.light } : {};
    if (plan.avant === "oter") maj = { ...maj, ...supprimerDrapeau("lumiereAvant") };
    else if (plan.avant) maj.flags = { [ID]: { lumiereAvant: plan.avant } };
    if (Object.keys(maj).length) await jeton.update(maj);
  }, "lumière du champion");
}
for (const nom of ["createActiveEffect", "updateActiveEffect", "deleteActiveEffect"]) {
  sur(nom, effet => { if (drapeau(effet, "lumiere") && effet.parent instanceof Actor) return synchroniserLumiere(effet.parent); });
}
sur("createToken", jeton => {
  if (estMjActif() && (drapeau(jeton, "lumiereAvant") || lumiereDe(jeton?.actor))) return synchroniserLumiere(jeton.actor, [jeton]);
});

// ---------------------------------------------------------------- Hooks : 11. Avatar des éléments

surPre("dnd5e.preUseActivity", activity => {
  if (!drapeau(activity, "recharge") || !rechargeRefusee(activity.item?.system?.uses?.spent)) return;
  prevenir("LAKOURWOW.RechargeInutile", { objet: activity.item?.name ?? "?" });
  return false;
});

// Emplacement décoché dans la fenêtre d'utilisation : l'utilisation ne revient pas gratuitement.
surPre("dnd5e.preActivityConsumption", (activity, usageConfig) => {
  if (!drapeau(activity, "recharge") || !rechargeIncomplete(usageConfig?.consume, activity.consumption?.targets)) return;
  prevenir("LAKOURWOW.RechargeSansEmplacement", { objet: activity.item?.name ?? "?" });
  return false;
});

// ---------------------------------------------------------------- Hooks : 12. Poigne de la mort (MJ actif)

sur("createChatMessage", async message => {
  if (!estMjActif() || message?.type !== "save") return;
  const item = message.getAssociatedActivity?.()?.item ?? message.getAssociatedItem?.();
  if (drapeau(item, "attire") !== "echec" || message.system?.resisted || !sauvegardeRatee(message.rolls)) return;
  const jeton = message.getAssociatedToken?.();
  const scene = jeton?.parent;
  const chevalier = plusProche(jetonsSurScene(item.actor, scene), jeton);
  if (!jeton || !chevalier || chevalier === jeton || !auteurAutorise(message.author, jeton)) return;
  const de = positionJeton(jeton);
  const plan = espaceAttire({
    source: positionJeton(chevalier), cible: de, occupes: occupesSauf(scene, jeton, chevalier), grille: grilleDe(scene),
    limites: limitesDe(scene), accessible: testeurMurs(scene, de)
  });
  if (plan.etat === "deja") return;
  if (plan.etat !== "ok") {
    await chuchoter(t("LAKOURWOW.PoigneSansPlace", { cible: jeton.name, chevalier: chevalier.name }));
    return;
  }
  const vers = { x: plan.x, y: plan.y, elevation: plan.elevation };
  await deplacer(jeton, vers);
  await message.setFlag(ID, "poigne", { jeton: jeton.uuid, de: { x: de.x, y: de.y, elevation: de.elevation }, vers });
});
// Résistance légendaire dépensée sur ce jet : le jeton revient à sa place s'il n'a pas bougé depuis.
sur("updateChatMessage", async message => {
  if (!estMjActif() || message?.type !== "save" || !message.system?.resisted) return;
  const p = drapeau(message, "poigne");
  if (!p) return;
  const jeton = uuidSync(p.jeton);
  const ici = positionJeton(jeton);
  if (jeton && ici.x === p.vers.x && ici.y === p.vers.y) await deplacer(jeton, p.de);
  await message.unsetFlag(ID, "poigne");
});

// ---------------------------------------------------------------- Hooks : 13. Armée des morts (MJ actif)

async function profilBestiaire(cle) {
  const pack = game.packs?.get(`${ID}.bestiaire`);
  if (!pack) return null;
  const index = await pack.getIndex({ fields: [`flags.${ID}.cle`] });
  const entree = liste(index).find(e => e.flags?.[ID]?.cle === cle);
  return entree ? pack.getDocument(entree._id) : null;
}

sur("createChatMessage", async message => {
  if (!estMjActif() || message?.type !== "usage") return;
  const activite = message.getAssociatedActivity?.();
  const armee = drapeau(activite, "armee");
  const chevalier = activite?.item?.actor;
  if (!armee || !chevalier || !auteurAutorise(message.author, chevalier)) return;
  const sc = game.scenes?.get(message.speaker?.scene) ?? game.scenes?.active;
  const jeton = sc?.tokens?.get(message.speaker?.token) ?? jetonsSurScene(chevalier, sc)[0];
  if (!jeton) { await chuchoter(t("LAKOURWOW.ArmeeSansJeton", { nom: chevalier.name })); return; }
  const scene = jeton.parent;
  const profil = await profilBestiaire(armee.profil);
  if (!profil) { await chuchoter(t("LAKOURWOW.ArmeeSansProfil", { profil: armee.profil })); return; }
  const combat = liste(game.combats).find(c => liste(c.combatants).some(cb => cb.tokenId === jeton.id && cb.sceneId === scene.id)) ?? null;
  const cb = combat ? liste(combat.combatants).find(x => x.tokenId === jeton.id) : null;
  const debut = {
    temps: game.time?.worldTime ?? 0, combat: combat?.id ?? null, combattant: cb?.id ?? null, enCours: Boolean(combat?.started), round: combat?.round ?? null,
    turn: combat?.turn ?? null, secondes: armee.duree, rounds: Math.ceil(armee.duree / (CONFIG.time?.roundTime || 6))
  };
  const donnees = game.actors.fromCompendium(profil, { clearOwnership: true, clearFolder: true });
  donnees.ownership = { default: 0, ...Object.fromEntries(proprietaires(chevalier).map(id => [id, 3])) };
  donnees.flags = { ...donnees.flags, [ID]: { ...donnees.flags?.[ID], armee: { invocateur: chevalier.uuid, message: message.uuid, debut } } };
  foundry.utils.setProperty(donnees, "prototypeToken.actorLink", false);
  foundry.utils.setProperty(donnees, "prototypeToken.disposition", jeton.disposition);
  const invoque = await Actor.implementation.create(donnees);
  const proto = invoque.prototypeToken;
  const source = positionJeton(jeton);
  const places = espacesLibres({
    source, taille: { w: proto?.width ?? 1, h: proto?.height ?? 1 }, occupes: occupesSauf(scene, jeton), grille: grilleDe(scene),
    portee: enUnites(armee.portee, scene), nombre: armee.nombre, limites: limitesDe(scene), accessible: testeurMurs(scene, source)
  });
  let crees = [];
  try {
    const jetons = [];
    for (const p of places) {
      const doc = await invoque.getTokenDocument({ ...p, level: jeton._source?.level ?? jeton.level, disposition: jeton.disposition, actorLink: false }, { parent: scene });
      jetons.push(doc.toObject());
    }
    crees = jetons.length ? await scene.createEmbeddedDocuments("Token", jetons) : [];
  } catch (erreur) {
    await renvoyerArmee(invoque);   // rien d'orphelin : l'acteur importé repart avec l'échec
    throw erreur;
  }
  if (crees.length < armee.nombre) await chuchoter(t("LAKOURWOW.ArmeeIncomplete", { n: crees.length, total: armee.nombre, portee: armee.portee }));
  if (combat && crees.length) {
    await combat.createEmbeddedDocuments("Combatant", crees.map(x => ({
      tokenId: x.id, sceneId: scene.id, actorId: invoque.id, initiative: initiativeApres(cb?.initiative), hidden: x.hidden
    })));
  }
  if (!crees.length) await renvoyerArmee(invoque);
});

const enRenvoi = new Set();
async function renvoyerArmee(acteur) {
  if (!acteur || enRenvoi.has(acteur.id)) return;
  enRenvoi.add(acteur.id);
  try {
    await pourChacun(liste(game.combats), c => {
      const ids = liste(c.combatants).filter(x => x.actorId === acteur.id).map(x => x.id);
      return ids.length ? c.deleteEmbeddedDocuments("Combatant", ids) : null;
    }, "armée des morts : combattants");
    await pourChacun(liste(game.scenes), s => {
      const ids = liste(s.tokens).filter(x => x.actorId === acteur.id).map(x => x.id);
      return ids.length ? s.deleteEmbeddedDocuments("Token", ids) : null;
    }, "armée des morts : jetons");
    if (game.actors?.get(acteur.id)) await acteur.delete();
  } finally { enRenvoi.delete(acteur.id); }
}
const armees = () => liste(game.actors).filter(a => drapeau(a, "armee"));
const etatCombat = c => (c ? { id: c.id, round: c.round, turn: c.turn, tours: liste(c.turns).map(x => x.id) } : null);
async function verifierArmees() {
  if (!estMjActif()) return;
  const finies = armees().filter(a => {
    const debut = drapeau(a, "armee").debut;
    return armeeExpiree(debut, { temps: game.time?.worldTime, combat: etatCombat(game.combats?.get(debut?.combat)) });
  });
  await pourChacun(finies, renvoyerArmee, "armée des morts : fin de la minute");
}
sur("updateCombat", (_c, changements) => { if ("round" in (changements ?? {}) || "turn" in (changements ?? {})) return verifierArmees(); });
sur("updateWorldTime", () => verifierArmees());
sur("deleteCombat", async combat => {
  if (!estMjActif()) return;
  await pourChacun(armees().filter(a => drapeau(a, "armee").debut?.combat === combat?.id), renvoyerArmee, "armée des morts : fin du combat");
});
// L'effet « Armée des morts » de la même utilisation (system.origin.message posé par dnd5e) se termine.
async function finEffetArmee(effet) {
  const acteur = effet?.parent;
  if (!estMjActif() || !drapeau(effet, "armee") || !(acteur instanceof Actor) || (effet.id && acteur.effects?.get(effet.id) && effetActif(effet))) return;
  const origine = effet.system?.origin?.message ?? null;
  const visees = armees().filter(a => {
    const r = drapeau(a, "armee");
    return r.invocateur === acteur.uuid && (!origine || r.message === origine);
  });
  await pourChacun(visees, renvoyerArmee, "armée des morts : fin de l'effet");
}
sur("deleteActiveEffect", finEffetArmee);
sur("updateActiveEffect", finEffetArmee);
// Plus aucun jeton : l'acteur importé pour l'occasion est retiré.
sur("deleteToken", async jeton => {
  const acteur = game.actors?.get(jeton?.actorId);
  if (!estMjActif() || !drapeau(acteur, "armee") || enRenvoi.has(acteur.id)) return;
  if (!liste(game.scenes).some(s => liste(s.tokens).some(x => x.actorId === acteur.id))) await renvoyerArmee(acteur);
});

// ---------------------------------------------------------------- Hooks : 14. Aspect de la meute (MJ actif)

async function synchroniserMeuteFamilier(familier) {
  if (!estMjActif() || !familier) return;
  const rodeur = uuidSync(drapeau(familier, "rodeur"));
  const sources = liste(rodeur?.effects).filter(e => drapeau(e, "meute") && effetActif(e));
  const presents = liste(familier.effects).filter(e => drapeau(e, "meuteRecue")).map(e => ({ id: e.id, source: drapeau(e, "meuteRecue") }));
  const { aCreer, aOter } = ecartCopies(sources.map(e => e.uuid), presents);
  if (aOter.length) await familier.deleteEmbeddedDocuments("ActiveEffect", aOter);
  const donnees = aCreer.map(u => sources.find(e => e.uuid === u)).filter(Boolean).map(e => donneesMeute(e, e.uuid, rodeur.uuid));
  if (donnees.length) await familier.createEmbeddedDocuments("ActiveEffect", donnees);
}
for (const nom of ["createActiveEffect", "updateActiveEffect", "deleteActiveEffect"]) {
  sur(nom, async effet => {
    if (!estMjActif() || !drapeau(effet, "meute") || !(effet.parent instanceof Actor)) return;
    await pourChacun(familiersDe(effet.parent), synchroniserMeuteFamilier, "aspect de la meute");
  });
}

// ---------------------------------------------------------------- Hooks : 15. Frénésie bestiale (MJ actif)

async function synchroniserFrenesie(familier) {
  if (!estMjActif() || !familier || !drapeau(familier, "familier")) return;
  const rodeur = uuidSync(drapeau(familier, "rodeur"));
  const sources = liste(rodeur?.items).filter(i => drapeau(i, "frenesie"));
  const presents = liste(familier.items).filter(i => drapeau(i, "frenesieRecue")).map(i => ({ id: i.id, source: drapeau(i, "frenesieRecue") }));
  const { aCreer, aOter } = ecartCopies(sources.map(i => i.uuid), presents);
  if (aOter.length) await familier.deleteEmbeddedDocuments("Item", aOter);
  const donnees = aCreer.map(u => sources.find(i => i.uuid === u)).filter(Boolean).map(donneesFrenesie);
  if (donnees.length) await familier.createEmbeddedDocuments("Item", donnees);
}
const rodeurDeFrenesie = item => drapeau(item, "frenesie") && item.parent instanceof Actor ? item.parent : null;
for (const nom of ["createItem", "deleteItem"]) {
  sur(nom, async item => {
    const rodeur = rodeurDeFrenesie(item);
    if (estMjActif() && rodeur) await pourChacun(familiersDe(rodeur), synchroniserFrenesie, "frénésie bestiale");
  });
}
// Familier lié à un autre rôdeur (ou délié) : meute et frénésie suivent.
sur("updateActor", async (acteur, changements) => {
  if (!estMjActif() || !foundry.utils.hasProperty(changements ?? {}, `flags.${ID}.rodeur`)) return;
  await synchroniserFrenesie(acteur);
  await synchroniserMeuteFamilier(acteur);
});

// ---------------------------------------------------------------- Hooks : 16. Totems élémentaires

function identifiantSource(e) {
  if (e?.parent instanceof Item) return e.parent.system?.identifier;   // effet transféré par l'objet lui-même
  const src = uuidSync(e?._stats?.duplicateSource ?? e?._stats?.compendiumSource);
  if (src?.parent?.system?.identifier) return src.parent.system.identifier;
  const act = uuidSync(e?.system?.origin?.activity);
  if (act?.item) return act.item.system?.identifier;
  const orig = uuidSync(e?.origin);
  return orig?.system?.identifier ?? orig?.item?.system?.identifier;
}
// Effets appliqués à l'acteur seulement (pas ceux de l'objet Rage, voir rageActive).
function enRage(acteur) {
  return rageActive(liste(acteur?.effects).map(e => ({ identifiant: identifiantSource(e), actif: effetActif(e), surObjet: e.parent instanceof Item })));
}
const aRage = acteur => liste(acteur?.items).some(i => i.system?.identifier === "rage");

surPre("dnd5e.preUseActivity", activity => {
  if (!drapeau(activity, "totem")) return;
  const acteur = activity.item?.actor;
  if (!totemRefuse({ aRage: aRage(acteur), enRage: enRage(acteur) })) return;
  prevenir("LAKOURWOW.TotemSansRage", { objet: activity.item?.name ?? "?" });
  return false;
});

// Effet du totem appliqué comme dnd5e le fait (EffectApplicationElement#_prepareEffectData) : un exemplaire venu du
// même effet source est réactivé plutôt que dupliqué.
async function appliquerEffet(source, acteur, item, region) {
  const existant = liste(acteur.effects).find(e => e._stats?.duplicateSource === source.uuid);
  const debut = globalThis.ActiveEffect?.implementation?.getEffectStart?.();
  if (existant) {
    return existant.update({
      disabled: false, "duration.expired": false, [`flags.${ID}.totemRecu`]: region.uuid, ...(debut ? { start: debut } : {})
    });
  }
  const d = source.toObject();
  delete d._id;
  Object.assign(d, { disabled: false, transfer: false, origin: item.uuid });
  d._stats = { ...d._stats, duplicateSource: source.uuid, compendiumSource: null };
  d.flags = { ...d.flags, [ID]: { ...d.flags?.[ID], totemRecu: region.uuid } };
  return ActiveEffect.implementation.create(d, { parent: acteur });
}

sur("createRegion", async (region, _o, userId) => {
  if (!estMjActif()) return;
  const activite = uuidSync(region?.flags?.dnd5e?.activity);
  const totem = drapeau(activite, "totem");
  const acteur = activite?.item?.actor;
  const scene = region?.parent;
  const forme = liste(region?.shapes)[0];
  if (!totem || !acteur || !scene || !forme) return;
  const jeton = uuidSync(region.flags.dnd5e.origin) ?? jetonsSurScene(acteur, scene)[0];
  const grille = grilleDe(scene);
  const rayon = enUnites(totem.rayon, scene);
  const portee = enUnites(totem.portee, scene);
  if (!jeton || !(rayon > 0)) return;
  const porteur = positionJeton(jeton);
  const case_ = caseTotem(forme?.toObject?.() ?? forme, grille, { elevation: porteur.elevation, level: porteur.level });
  if (!case_) return;
  await region.update({ [`flags.${ID}.totem`]: { porteur: acteur.uuid, rage: enRage(acteur), temps: game.time?.worldTime ?? 0 } });
  if (portee > 0 && totemTropLoin(porteur, case_, portee, grille)) {
    await chuchoter(t("LAKOURWOW.TotemLoin", { totem: activite.name, nom: acteur.name, portee: totem.portee }), [userId]);
  }
  const jetons = liste(scene.tokens).filter(x => x.actor).map(x => ({ jeton: x, acteur: x.actor.uuid, disposition: x.disposition, geometrie: positionJeton(x) }));
  const touches = jetonsDuTotem({ totem: case_, porteur: { acteur: acteur.uuid, disposition: jeton.disposition }, jetons, rayon, cible: totem.cible, grille });
  if (totem.cible === "hostiles") {
    if (touches.length) await chuchoter(t("LAKOURWOW.TotemHostiles", { totem: activite.name, noms: touches.map(x => x.jeton.name).join(", ") }));
    return;
  }
  const source = activite.item.effects?.get(activite.effects?.[0]?._id);
  if (!source) return;
  const acteurs = [...new Map(touches.map(x => [x.acteur, x.jeton.actor])).values()];
  await pourChacun(acteurs, a => appliquerEffet(source, a, activite.item, region), "totems : effet");
});

const totemsDe = acteur => liste(game.scenes).flatMap(s => liste(s.regions).filter(r => drapeau(r, "totem")?.porteur === acteur?.uuid));
async function oterTotems(regions) {
  const parScene = new Map();
  for (const r of regions) parScene.set(r.parent, [...(parScene.get(r.parent) ?? []), r.id]);
  await pourChacun([...parScene], ([s, ids]) => s.deleteEmbeddedDocuments("Region", ids), "totems : retrait");
}
const tousLesTotems = () => liste(game.scenes).flatMap(s => liste(s.regions).filter(r => drapeau(r, "totem")));
// regions : totems à revoir (par défaut tous) ; un porteur qui ne se résout plus fait tomber ses totems.
async function verifierTotems(regions = tousLesTotems()) {
  if (!estMjActif() || !regions.length) return;
  const parPorteur = new Map();
  for (const r of regions) parPorteur.set(drapeau(r, "totem").porteur, [...(parPorteur.get(drapeau(r, "totem").porteur) ?? []), r]);
  const temps = game.time?.worldTime;
  const aOter = [];
  for (const [uuid, rs] of parPorteur) {
    const acteur = uuidSync(uuid);
    const ids = new Set(totemsAOter(rs.map(r => ({ id: r.id, rage: drapeau(r, "totem").rage, temps: drapeau(r, "totem").temps, porteur: Boolean(acteur) })), enRage(acteur), temps));
    aOter.push(...rs.filter(r => ids.has(r.id)));
  }
  await oterTotems(aOter);
}
for (const nom of ["createActiveEffect", "updateActiveEffect", "deleteActiveEffect"]) {
  sur(nom, effet => {
    const acteur = effet?.actor ?? (effet?.parent instanceof Actor ? effet.parent : null);
    const regions = acteur ? totemsDe(acteur) : [];
    if (regions.length) return verifierTotems(regions);
  });
}
// Un totem qui tombe (fin de la Rage ou du combat, porteur supprimé, région effacée à la main) emporte les effets qu'il
// a donnés (flags.totemRecu = uuid de sa région) : sans temps du monde qui avance, leur minute ne s'écoulerait jamais.
sur("deleteRegion", async region => {
  if (!estMjActif() || !drapeau(region, "totem")) return;
  const acteurs = new Set([...liste(region.parent?.tokens).map(x => x.actor), ...liste(game.actors)].filter(Boolean));
  await pourChacun([...acteurs], a => {
    const ids = liste(a.effects).filter(e => drapeau(e, "totemRecu") === region.uuid).map(e => e.id);
    return ids.length ? a.deleteEmbeddedDocuments("ActiveEffect", ids) : null;
  }, "totems : effets");
});
sur("updateWorldTime", () => verifierTotems());
sur("deleteActor", () => verifierTotems());
sur("deleteCombat", async combat => {
  if (!estMjActif()) return;
  const acteurs = [...new Set(liste(combat?.combatants).map(c => c.actor).filter(Boolean))];
  await oterTotems(acteurs.flatMap(totemsDe));
});

// ---------------------------------------------------------------- Hooks : 17. Ivresse du sage (MJ actif)

const ratesParMoine = new Map();
const ivresseActive = acteur => liste(acteur?.effects).some(e => drapeau(e, "ivresse") && effetActif(e));
const activiteRenverser = acteur => liste(acteur?.items).flatMap(i => liste(i.system?.activities)).find(a => drapeau(a, "renverser")) ?? null;

sur("createChatMessage", async message => {
  if (!estMjActif() || message?.type !== "attack") return;
  const activite = message.getAssociatedActivity?.();
  const [jet] = message.rolls ?? [];
  const assaillant = message.getAssociatedActor?.();
  const jetonAssaillant = message.getAssociatedToken?.();
  if (!auteurAutorise(message.author, jetonAssaillant?.actor ?? assaillant)) return;
  const rates = assaillantsRates({
    total: jet?.total, critique: jet?.isCritical, echec: jet?.isFumble,
    melee: estMelee(activite?.attack?.type?.value, message.system?.mode ?? jet?.options?.attackMode), cibles: message.system?.targets
  });
  for (const c of rates) {
    const moine = uuidSync(c.token)?.actor ?? uuidSync(c.actor);
    const renverser = activiteRenverser(moine);
    if (!assaillant || !renverser || !ivresseActive(moine)) continue;
    const memo = (ratesParMoine.get(moine.uuid) ?? []).filter(r => Date.now() - r.quand <= 120000);
    memo.push({ jeton: jetonAssaillant?.uuid ?? null, acteur: assaillant.uuid, quand: Date.now() });
    ratesParMoine.set(moine.uuid, memo);
    const texte = t("LAKOURWOW.IvressePropose", { assaillant: jetonAssaillant?.name ?? assaillant.name, moine: moine.name });
    await chuchoter(`${texte}</p><p>[[/item ${renverser.uuid}]]{${echapper(renverser.name)}}`, proprietaires(moine));
  }
});

sur("createChatMessage", async message => {
  if (!estMjActif() || message?.type !== "usage") return;
  const activite = message.getAssociatedActivity?.();
  if (!drapeau(activite, "renverser")) return;
  const moine = activite.item?.actor;
  const auteur = message.author?.id ?? message.user;
  if (!auteurAutorise(message.author, moine)) return;
  if (!moine || !ivresseActive(moine)) { await chuchoter(t("LAKOURWOW.IvresseInactive", { nom: moine?.name ?? "?" }), [auteur]); return; }
  const choisis = choisirAssaillants({ cibles: liste(message.system?.targets), rates: ratesParMoine.get(moine.uuid) ?? [] });
  if (!choisis.length) { await chuchoter(t("LAKOURWOW.IvresseRien", { nom: moine.name }), [auteur]); return; }
  await pourChacun(choisis, async r => {
    const acteur = uuidSync(r.jeton)?.actor ?? uuidSync(r.acteur);
    await poserATerre(acteur, { ivresse: message.id });
    ratesParMoine.set(moine.uuid, (ratesParMoine.get(moine.uuid) ?? []).filter(x => x !== r));
  }, "ivresse du sage");
});

// ---------------------------------------------------------------- Chargement (MJ actif)

globalThis.Hooks?.once?.("ready", async () => {
  if (!estMjActif()) return;
  const lumineux = liste(game.scenes).flatMap(s => liste(s.tokens)).filter(x => drapeau(x, "lumiereAvant") || lumiereDe(x.actor));
  await pourChacun(lumineux, x => synchroniserLumiere(x.actor, [x]), "lumière du champion : chargement");
  await verifierArmees();
  const orphelines = armees().filter(a => !liste(game.scenes).some(s => liste(s.tokens).some(x => x.actorId === a.id)));
  await pourChacun(orphelines, renvoyerArmee, "armée des morts : chargement");
  await verifierTotems();
  const familiers = liste(game.actors).filter(a => drapeau(a, "familier"));
  await pourChacun(familiers, async f => { await synchroniserFrenesie(f); await synchroniserMeuteFamilier(f); }, "familier : meute et frénésie");
});
