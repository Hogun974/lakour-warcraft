// Automatismes des suppléments « Tarides vivantes » (dnd5e 6.0.6, Foundry 14). Logique pure exportée (essais) + hooks :
// 1. Furie sanguinaire / Héroïsme : refus de l'utilisation (dnd5e.preUseActivity, sur le poste de qui l'utilise) si
//    l'utilisateur ou une cible porte « Épuisement de la fureur » ; filet du MJ actif : une Furie appliquée par la carte
//    de chat (création, ou réactivation d'un effet existant par dnd5e) à une créature déjà épuisée par une utilisation
//    précédente est retirée, avec un message. L'Épuisement tombe à la fin du combat (sa durée de 10 minutes ne s'écoule
//    que si le temps du monde avance).
// 1 bis. Effets non cumulables (flags.unique) : le nouvel exemplaire remplace l'ancien (MJ actif).
// 2. Ensemble « Tenue réglementaire de Mèche-Noire » : le bonus d'ensemble s'allume quand les deux pièces sont
//    équipées, s'éteint sinon (createItem, updateItem, deleteItem ; MJ actif).
// 3. Phase 2 des boss du donjon (flags.lakour-warcraft.boss) : à 50 % des PV ou moins, une fois par combat (créé, démarré
//    ou non), rappel chuchoté aux MJ avec un bouton vers la capacité « Phase 2 » ; réarmé à la fin du combat (MJ actif).
// 4. Liens morts : dans le chat d'un joueur, un lien vers un compendium du module qu'il ne peut pas ouvrir (bestiaire,
//    scènes) devient du texte simple (tirages des tables de rares, contrats), après le rendu de Foundry et celui de dnd5e.
// Repères par drapeaux posés par le contenu (contenu/consommables.mjs, contenu/donjon.mjs), jamais par les noms.
// Tout est défensif : une API absente ou changée ne fait qu'éteindre l'automatisme ; une erreur (même asynchrone) est
// écrite en console sans interrompre Foundry.
export const ID = "lakour-warcraft";
const drapeau = (doc, cle) => doc?.flags?.[ID]?.[cle];
const liste = c => (c ? [...(c.contents ?? c)] : []);

// ---------------------------------------------------------------- 1. Fureur

export const estObjetFureur = item => drapeau(item, "fureur") === true;
const effetActif = e => e && !e.disabled && !e.duration?.expired;
const estEpuisement = e => drapeau(e, "fureur") === "epuisement";
export const porteEpuisement = acteur => liste(acteur?.effects).some(e => estEpuisement(e) && effetActif(e));

// Noms des créatures épuisées parmi l'utilisateur et ses cibles (sans doublon).
export function epuisesParmi(acteurs) {
  const vus = new Map();
  for (const a of acteurs) if (a && !vus.has(a.uuid ?? a.id ?? a.name)) vus.set(a.uuid ?? a.id ?? a.name, a);
  return [...vus.values()].filter(porteEpuisement).map(a => a.name);
}

// Une Furie qui vient d'être appliquée (créée ou réactivée) doit-elle être retirée ? Oui si la créature porte un
// épuisement venu d'une AUTRE utilisation : autre message d'origine (system.origin.message, posé par dnd5e), ou, faute
// de message des deux côtés, un épuisement touché pour la dernière fois plus de 30 s avant (maintenant, en ms).
const MARGE_MS = 30000;
const messageDe = e => e?.system?.origin?.message ?? null;
export function fureurARetirer(effets, nouvel, maintenant = Date.now()) {
  if (drapeau(nouvel, "fureur") !== "elan" || !effetActif(nouvel)) return false;
  const message = messageDe(nouvel);
  const autre = e => e !== nouvel && (e.id == null || e.id !== nouvel.id);
  return liste(effets).some(e => autre(e) && estEpuisement(e) && effetActif(e) && (message && messageDe(e)
    ? messageDe(e) !== message
    : maintenant - (e._stats?.modifiedTime ?? e._stats?.createdTime ?? maintenant) > MARGE_MS));
}

// Identifiants des épuisements de fureur à ôter d'un acteur (à la fin d'un combat).
export const epuisementsATerminer = effets => liste(effets).filter(estEpuisement).map(e => e.id);

// ---------------------------------------------------------------- 1 bis. Effets uniques (non cumulables)

// Un effet marqué flags.unique (la pierre à aiguiser…) ne se cumule pas : rend les identifiants des autres effets de même
// clé déjà sur la créature, à retirer au profit du nouveau.
export function effetsRemplaces(effets, nouvel) {
  const cle = drapeau(nouvel, "unique");
  if (!cle) return [];
  return liste(effets).filter(e => e !== nouvel && e.id !== nouvel.id && drapeau(e, "unique") === cle).map(e => e.id);
}

// ---------------------------------------------------------------- 2. Ensembles

// items : objets d'un acteur. Rend les changements { item, effet, disabled } à faire sur les effets de bonus d'ensemble.
export function changementsEnsembles(items) {
  const objets = liste(items);
  const portees = new Map();   // ensemble -> clés des pièces différentes équipées
  for (const o of objets) {
    const ens = drapeau(o, "ensemble");
    if (ens && o.system?.equipped) portees.set(ens, (portees.get(ens) ?? new Set()).add(drapeau(o, "cle") ?? o.id));
  }
  const changements = [];
  for (const o of objets) {
    for (const e of liste(o.effects)) {
      const ens = drapeau(e, "ensemble");
      if (!ens) continue;
      const voulu = !(o.system?.equipped && (portees.get(ens)?.size ?? 0) >= (drapeau(e, "pieces") ?? 2));
      if (Boolean(e.disabled) !== voulu) changements.push({ item: o, effet: e, disabled: voulu });
    }
  }
  return changements;
}

// ---------------------------------------------------------------- 3. Phase 2 des boss

export const HORS_COMBAT = "hors-combat";
// Clé du combat en cours : son identifiant dès qu'il existe, démarré ou non (un combat créé puis lancé garde la même).
export const cleCombat = combat => combat?.id ?? HORS_COMBAT;

// Rend la clé de combat à mémoriser si le rappel doit partir maintenant, sinon null.
export function cleAnnoncePhase2({ valeur, max, annoncee, combat }) {
  if (!(max > 0) || !(valeur > 0) || valeur > Math.floor(max / 2)) return null;
  const cle = combat ?? HORS_COMBAT;
  return annoncee === cle ? null : cle;
}

// Mémo des rappels (« uuid|clé de combat ») : rend les entrées à purger à la fin du combat idCombat (les siennes et
// celles faites hors combat).
export const memosAPurger = (memos, idCombat) => [...memos].filter(m => m.endsWith(`|${idCombat}`) || m.endsWith(`|${HORS_COMBAT}`));

// Contenu du rappel : bouton d'utilisation dnd5e ([[/item uuid]]) et lien vers la capacité.
export function contenuPhase2(phrase, capacite) {
  if (!capacite?.uuid) return `<p>${phrase}</p>`;
  return `<p>${phrase}</p><p>[[/item ${capacite.uuid}]]{${capacite.name}} · @UUID[${capacite.uuid}]{fiche de la capacité}</p>`;
}

// ---------------------------------------------------------------- 4. Liens morts

// Compendium du module visé par un uuid (« Compendium.lakour-warcraft.<pack>.… »), sinon null.
export function packDuLien(uuid) {
  const m = /^Compendium\.([^.]+)\.([^.]+)\./.exec(uuid ?? "");
  return m && m[1] === ID ? m[2] : null;
}

// ---------------------------------------------------------------- Outils des hooks

const avertir = (quoi, erreur) => console.warn(`${ID} | ${quoi}`, erreur);

// Hook « pre* » : appel synchrone, son retour (false pour annuler) est rendu tel quel ; une erreur est écrite, sans
// rien annuler.
export function enveloppeSynchrone(nom, fn) {
  return (...args) => {
    try { return fn(...args); } catch (erreur) { avertir(nom, erreur); return undefined; }
  };
}
// Hook ordinaire, souvent asynchrone : le rejet d'une promesse est attrapé aussi ; rien n'est rendu à Foundry.
export function enveloppeAsynchrone(nom, fn) {
  return (...args) => {
    Promise.resolve().then(() => fn(...args)).catch(erreur => avertir(nom, erreur));
  };
}
// Applique action à chaque élément ; un échec est écrit et n'arrête pas les suivants. Rend le nombre de réussites.
export async function pourChacun(elements, action, quoi = "boucle") {
  let n = 0;
  for (const x of elements) {
    try { await action(x); n++; } catch (erreur) { avertir(quoi, erreur); }
  }
  return n;
}

const surPre = (nom, fn) => globalThis.Hooks?.on?.(nom, enveloppeSynchrone(nom, fn));
const sur = (nom, fn) => globalThis.Hooks?.on?.(nom, enveloppeAsynchrone(nom, fn));
const estMjActif = () => Boolean(globalThis.game?.user) && game.user === game.users?.activeGM;
const prevenir = (cle, donnees) => {
  try { ui.notifications?.warn(game.i18n.format(cle, donnees)); } catch { /* interface absente */ }
};

// ---------------------------------------------------------------- Hooks : 1. Fureur

// Refus avant utilisation (poste de l'utilisateur : c'est lui qui utilise l'objet).
surPre("dnd5e.preUseActivity", activity => {
  const item = activity?.item;
  if (!estObjetFureur(item)) return;
  const cibles = liste(game.user?.targets).map(t => t.actor);
  const epuises = epuisesParmi([item.actor, ...cibles]);
  if (!epuises.length) return;
  prevenir("LAKOURWOW.FureurRefusee", { objet: item.name, noms: epuises.join(", ") });
  return false;
});

// Filet (MJ actif) : une Furie créée ou réactivée sur une créature déjà épuisée est retirée.
async function retirerFureurInterdite(effet, userId) {
  if (!estMjActif()) return;
  const acteur = effet?.parent;
  if (!(acteur instanceof Actor) || !fureurARetirer(acteur.effects, effet)) return;
  await effet.delete();
  const donnees = { nom: acteur.name, effet: effet.name };
  prevenir("LAKOURWOW.FureurRetiree", donnees);
  const destinataires = [...new Set([userId, ...game.users.filter(u => u.isGM).map(u => u.id)])].filter(Boolean);
  await ChatMessage.implementation.create({
    content: `<p>${game.i18n.format("LAKOURWOW.FureurRetiree", donnees)}</p>`, whisper: destinataires,
    speaker: { alias: game.i18n.localize("LAKOURWOW.Titre") }
  });
}
sur("createActiveEffect", (effet, _options, userId) => retirerFureurInterdite(effet, userId));
// Effet unique : le nouvel exemplaire remplace l'ancien (MJ actif).
sur("createActiveEffect", async effet => {
  const acteur = effet?.parent;
  if (!estMjActif() || !(acteur instanceof Actor)) return;
  const anciens = effetsRemplaces(acteur.effects, effet);
  if (anciens.length) await acteur.deleteEmbeddedDocuments("ActiveEffect", anciens);
});
// dnd5e réactive un effet déjà présent (disabled: false, durée remise) au lieu d'en créer un second.
sur("updateActiveEffect", (effet, changements, _options, userId) => {
  const u = foundry.utils;
  if (changements?.disabled === false || u.hasProperty(changements ?? {}, "duration") || u.hasProperty(changements ?? {}, "system.origin")) {
    return retirerFureurInterdite(effet, userId);
  }
});

// ---------------------------------------------------------------- Hooks : 2. Ensembles (MJ actif)

async function majEnsembles(item) {
  const acteur = item?.parent;
  if (!estMjActif() || !(acteur instanceof Actor) || !drapeau(item, "ensemble")) return;
  const parObjet = new Map();
  for (const c of changementsEnsembles(acteur.items)) {
    parObjet.set(c.item, [...(parObjet.get(c.item) ?? []), { _id: c.effet.id, disabled: c.disabled }]);
  }
  await pourChacun([...parObjet], ([objet, maj]) => objet.updateEmbeddedDocuments("ActiveEffect", maj), "ensemble");
}
sur("createItem", majEnsembles);
sur("deleteItem", majEnsembles);
sur("updateItem", (item, changements) => {
  if (foundry.utils.hasProperty(changements ?? {}, "system.equipped")) return majEnsembles(item);
});

// ---------------------------------------------------------------- Hooks : 3. Phase 2 (MJ actif)

// updateActor couvre les acteurs liés, updateToken les jetons non liés (delta) ; le mémo en mémoire empêche le double
// rappel quand les deux hooks partent pour la même blessure.
const annoncees = new Set();
async function verifierPhase2(acteur) {
  if (!estMjActif() || !drapeau(acteur, "boss")?.phase2) return;
  const pv = acteur.system?.attributes?.hp;
  const cle = cleAnnoncePhase2({ valeur: pv?.value, max: pv?.max, annoncee: acteur.getFlag?.(ID, "phase2Annoncee"), combat: cleCombat(game.combat) });
  const memo = `${acteur.uuid}|${cle}`;
  if (!cle || annoncees.has(memo)) return;
  annoncees.add(memo);
  await acteur.setFlag(ID, "phase2Annoncee", cle);
  const capacite = acteur.items.find(i => i.name === drapeau(acteur, "boss").phase2) ?? acteur.items.find(i => i.name.startsWith("Phase 2"));
  const phrase = game.i18n.format("LAKOURWOW.Phase2", { nom: acteur.name, pv: pv.value, max: pv.max });
  await ChatMessage.implementation.create({
    content: contenuPhase2(phrase, capacite), whisper: game.users.filter(u => u.isGM).map(u => u.id),
    speaker: ChatMessage.implementation.getSpeaker?.({ actor: acteur }) ?? { alias: acteur.name }
  });
}
sur("updateActor", (acteur, changements) => {
  if (foundry.utils.hasProperty(changements ?? {}, "system.attributes.hp")) return verifierPhase2(acteur);
});
sur("updateToken", (jeton, changements) => {
  if (foundry.utils.hasProperty(changements ?? {}, "delta.system.attributes.hp")) return verifierPhase2(jeton.actor);
});

// ---------------------------------------------------------------- Hooks : fin du combat (MJ actif)

// Réarme la phase 2 des boss et ôte l'Épuisement de la fureur des combattants ; chaque échec n'arrête pas les autres.
sur("deleteCombat", async combat => {
  if (!estMjActif()) return;
  for (const m of memosAPurger(annoncees, combat.id)) annoncees.delete(m);
  const acteurs = [...new Set(liste(combat.combatants).map(c => c.actor).filter(Boolean))];
  await pourChacun(acteurs.filter(a => drapeau(a, "boss") && a.getFlag(ID, "phase2Annoncee") !== undefined),
    a => a.unsetFlag(ID, "phase2Annoncee"), "phase 2 : réarmement");
  await pourChacun(acteurs, a => {
    const ids = epuisementsATerminer(a.effects);
    return ids.length ? a.deleteEmbeddedDocuments("ActiveEffect", ids) : null;
  }, "fin de l'Épuisement de la fureur");
});

// ---------------------------------------------------------------- Hooks : 4. Liens morts (poste de chaque joueur)

function masquerLiensFermes(_message, html) {
  if (game.user?.isGM) return;
  const racine = html instanceof HTMLElement ? html : html?.[0];
  for (const a of racine?.querySelectorAll?.("a.content-link[data-uuid]") ?? []) {
    const pack = packDuLien(a.dataset.uuid);
    const compendium = pack && game.packs.get(`${ID}.${pack}`);
    if (!compendium) continue;
    const ouvert = compendium.testUserPermission ? compendium.testUserPermission(game.user, "OBSERVER") : compendium.visible !== false;
    if (ouvert) continue;
    const texte = document.createElement("strong");
    texte.textContent = a.textContent.trim();
    a.replaceWith(texte);
  }
}
// Rendu de Foundry, puis rendu de dnd5e (qui ajoute ses cartes et ses liens après le premier).
surPre("renderChatMessageHTML", masquerLiensFermes);
surPre("dnd5e.renderChatMessage", masquerLiensFermes);
