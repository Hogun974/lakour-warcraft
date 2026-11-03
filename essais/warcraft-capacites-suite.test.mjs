// Automatismes des capacités de sous-classe, suite (modules/lakour-warcraft/scripts/capacites-suite.js) : logique pure
// du Châtiment du Fléau (type de la cible), du Champion de la Lumière (lumière du jeton), de l'Avatar des éléments
// (recharge), de la Poigne de la mort (espace libre voisin), de l'Armée des morts (espaces libres, minute, initiative),
// de l'Aspect de la meute et de la Frénésie bestiale (copies sur le familier), des Totems élémentaires (zone du totem,
// Rage) et de l'Ivresse du sage (attaques ratées, assaillant choisi) ; câblage des drapeaux dans le contenu fabriqué.
// Chaque batterie est rejouée sur des versions mutées de la logique (ou du contenu) : chaque mutation doit être repérée.
// Références indépendantes du code : CONFIG.DND5E.creatureTypes (undead, fiend), LightData de Foundry 14 (bright, dim),
// ConsumptionTargetData de dnd5e 6.0.6 (spellSlots : cible = niveau ; UsesField.spent ≥ 0),
// AttackMessageData#evaluatedTargets (raté : pas critique, total < CA ou échec critique ; CA inconnue écartée ici),
// CONFIG.time.roundTime (6 s : 1 minute = 10 rounds), règle 5/5/5 de dnd5e (1,5 m par case).  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { fabriquer } from "../outils/fabriquer-warcraft.mjs";
import { CAPACITES_EN_PARTIE } from "../modules/lakour-warcraft/contenu/sous-classes.mjs";
import * as S from "../modules/lakour-warcraft/scripts/capacites-suite.js";
import { distanceJetons } from "../modules/lakour-warcraft/scripts/capacites.js";

const M = "lakour-warcraft";
const GRILLE = { size: 100, distance: 1.5, type: 1, diagonals: 0 };
const j = (col, ligne, extra = {}) => ({ x: col * 100, y: ligne * 100, width: 1, height: 1, elevation: 0, ...extra });
const V = ["undead", "fiend"];
const meme = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------- Batteries de la logique pure

function batterie(nom, corps) {
  return f => {
    const erreurs = [];
    const ok = (cond, msg) => { if (!cond) erreurs.push(`${nom} : ${msg}`); };
    try { corps(f, ok); } catch (e) { erreurs.push(`${nom} : exception ${e.message}`); }
    return erreurs;
  };
}

const batterieFleau = batterie("fléau", (f, ok) => {
  ok(f.verdictType("undead", V) === "oui" && f.verdictType({ value: "fiend" }, V) === "oui", "mort-vivant ou fiélon : visé");
  ok(f.verdictType({ value: "humanoid" }, V) === "non", "humanoïde : pas visé");
  ok(f.verdictType(undefined, V) === "inconnu" && f.verdictType({ value: "" }, V) === "inconnu", "type absent : le MJ décide");
  ok(f.verdictType({ value: "custom", custom: "Abomination" }, V) === "inconnu", "type personnalisé : le MJ décide");
  ok(f.filtrerCibles([{ value: "humanoid" }], V).refuser === true, "seule cible hors liste : refus");
  const mixte = f.filtrerCibles([{ value: "humanoid" }, { value: "undead" }, undefined], V);
  ok(!mixte.refuser && meme(mixte.garder, [1, 2]), "cibles mêlées : on garde le mort-vivant et l'inconnue");
  ok(!f.filtrerCibles([], V).refuser, "sans cible : le MJ garde la main");
  ok(!f.filtrerCibles([undefined], V).refuser, "cible de type inconnu : pas de refus");
  ok(f.terreurARetirer(V, { value: "beast" }) && !f.terreurARetirer(V, { value: "undead" }), "effet sur une bête : retiré ; sur un mort-vivant : gardé");
  ok(!f.terreurARetirer(V, undefined) && !f.terreurARetirer(undefined, { value: "beast" }), "type inconnu, ou effet non marqué : gardé");
});

const batterieChampion = batterie("champion", (f, ok) => {
  ok(meme(f.lumiereVoulue({ vive: 9 }, "m"), { bright: 9, dim: 9 }), "9 m de lumière vive (scène en mètres)");
  ok(meme(f.lumiereVoulue({ vive: 9 }, "ft"), { bright: 30, dim: 30 }), "scène en pieds : 30 pi");
  ok(f.lumiereVoulue({ vive: 9 }, "lieues") === null, "unité inconnue : rien");
  const voulue = { bright: 9, dim: 9 };
  const pose = f.planLumiere({ voulue, actuelle: { bright: 0, dim: 0 }, avant: null });
  ok(meme(pose?.light, voulue) && meme(pose?.avant, { bright: 0, dim: 0 }), "effet posé : lumière allumée, l'ancienne notée");
  const torche = f.planLumiere({ voulue, actuelle: { bright: 6, dim: 12 }, avant: null });
  ok(meme(torche?.light, { bright: 9, dim: 12 }) && meme(torche?.avant, { bright: 6, dim: 12 }), "torche : la lumière vive grandit, la faible plus longue est gardée");
  ok(f.planLumiere({ voulue, actuelle: { bright: 9, dim: 9 }, avant: { bright: 0, dim: 0 } }) === null, "déjà allumée : rien n'est réécrit");
  const grande = f.planLumiere({ voulue, actuelle: { bright: 12, dim: 24 }, avant: null });
  ok(grande?.light === null && meme(grande?.avant, { bright: 12, dim: 24 }), "lumière déjà plus grande : gardée telle quelle");
  const fin = f.planLumiere({ voulue: null, actuelle: { bright: 9, dim: 9 }, avant: { bright: 0, dim: 0 } });
  ok(meme(fin?.light, { bright: 0, dim: 0 }) && fin?.avant === "oter", "fin de l'effet : lumière d'avant rétablie, mémo ôté");
  ok(f.planLumiere({ voulue: null, actuelle: { bright: 6, dim: 12 }, avant: null }) === null, "jamais allumée : rien");
});

const batterieAvatar = batterie("avatar", (f, ok) => {
  ok(f.rechargeRefusee(0) && f.rechargeRefusee(undefined), "utilisation non dépensée : refus (spent ne descend pas sous 0)");
  ok(!f.rechargeRefusee(1), "utilisation dépensée : on peut la regagner");
  const cibles = [{ type: "itemUses", value: "-1", target: "" }, { type: "spellSlots", value: "1", target: "5" }];
  ok(f.rechargeIncomplete({ resources: [0] }, cibles), "emplacement décoché, utilisation rendue : refus");
  ok(!f.rechargeIncomplete({ resources: [0, 1] }, cibles) && !f.rechargeIncomplete(true, cibles) && !f.rechargeIncomplete({ resources: true }, cibles), "tout dépensé : accepté");
  ok(!f.rechargeIncomplete({ resources: [1] }, cibles) && !f.rechargeIncomplete({ resources: [] }, cibles), "rien rendu : rien à refuser");
});

const batterieAuteurs = batterie("auteurs", (f, ok) => {
  const doc = { testUserPermission: (u, n) => n === "OWNER" && u.id === "j" };
  ok(f.auteurAutorise({ isGM: true, id: "mj" }, doc) && f.auteurAutorise({ isGM: false, id: "j" }, doc), "MJ ou propriétaire : la carte vaut");
  ok(!f.auteurAutorise({ isGM: false, id: "autre" }, doc) && !f.auteurAutorise(null, doc), "carte forgée par un autre joueur : ignorée");
  ok(f.echapper(`<img src=x onerror="a">&'`) === "&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;", "noms échappés dans le HTML des messages");
  const o = f.optionsDeplacement("T", { x: 100, y: 0, elevation: 0 });
  ok(o.movement?.T?.waypoints?.[0]?.action === "displace" && o.movement.T.waypoints[0].x === 100, "déplacement forcé : action « displace » (coût nul)");
});

const batteriePoigne = batterie("poigne", (f, ok) => {
  const at = o => f.espaceAttire({ grille: GRILLE, source: j(0, 0), ...o });
  const droite = at({ cible: j(5, 0) });
  ok(droite.etat === "ok" && droite.x === 100 && droite.y === 0, "en ligne droite : la case voisine du côté de la cible");
  const biais = at({ cible: j(5, 3) });
  ok(biais.x === 100 && biais.y === 100, "en biais : la case voisine la plus proche de la cible");
  ok(at({ cible: j(1, 1) }).etat === "deja", "déjà à côté : rien ne bouge");
  const occupe = at({ cible: j(5, 0), occupes: [j(1, 0)] });
  ok(occupe.x === 100 && Math.abs(occupe.y) === 100, "case occupée : la voisine libre suivante");
  const autreNiveau = at({ cible: j(5, 0), occupes: [{ ...j(1, 0), level: "haut" }], source: { ...j(0, 0), level: "bas" } });
  ok(autreNiveau.x === 100 && autreNiveau.y === 0, "un jeton d'un autre niveau ne prend pas la place");
  const anneau = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (dx || dy) anneau.push(j(dx, dy));
  ok(at({ cible: j(5, 0), occupes: anneau }).etat === "aucun", "plus de place : rien");
  ok(at({ cible: j(5, 0), grille: { ...GRILLE, type: 2 } }).etat === "aucun", "grille hexagonale : à la main");
  const mur = at({ cible: j(5, 0), accessible: p => !(p.x === 100 && p.y === 0) });
  ok(mur.etat === "ok" && !(mur.x === 100 && mur.y === 0), "mur sur la ligne : une autre case voisine");
  const grand = at({ cible: j(6, 0, { width: 2, height: 2 }) });
  ok(grand.x === 100 && grand.y === 0, "grande créature : espace de sa taille, sans chevaucher le chevalier");
  ok(at({ cible: j(5, 0, { elevation: 6 }) }).elevation === 0, "créature en vol : ramenée à la hauteur du chevalier");
  const borde = at({ cible: j(-5, 0), limites: { x: 0, y: 0, width: 1000, height: 1000 } });
  ok(borde.x === 0 && borde.y === 100, "bord de la scène : la case voisine la plus proche restée dedans");
  const grandAGauche = at({ cible: j(-6, 0, { width: 2, height: 2 }) });
  ok(grandAGauche.x === -200 && grandAGauche.y === 0, "grande créature venue de gauche : son espace entier touche le chevalier");
});

const batterieArmee = batterie("armée", (f, ok) => {
  const lib = o => f.espacesLibres({ source: j(0, 0), taille: { w: 1, h: 1 }, grille: GRILLE, portee: 9, nombre: 4, ...o });
  const quatre = lib({});
  ok(quatre.length === 4, "quatre goules");
  ok(quatre.every(p => distanceJetons(j(0, 0), { ...p, width: 1, height: 1 }, GRILLE) <= 1.5 + 1e-6), "au plus près du chevalier");
  ok(new Set(quatre.map(p => `${p.x},${p.y}`)).size === 4 && !quatre.some(p => p.x === 0 && p.y === 0), "espaces distincts, hors de celui du chevalier");
  const anneau = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (dx || dy) anneau.push(j(dx, dy));
  const loin = lib({ occupes: anneau });
  ok(loin.length === 4 && loin.every(p => Math.abs(p.x) === 200 || Math.abs(p.y) === 200), "voisins occupés : l'anneau suivant (3 m)");
  ok(lib({ occupes: anneau, portee: 1.5 }).length === 0, "pas de place à portée : aucune");
  ok(lib({ portee: 3, nombre: 30 }).every(p => distanceJetons(j(0, 0), { ...p, width: 1, height: 1 }, GRILLE) <= 3 + 1e-6), "jamais au-delà de la portée");
  ok(lib({ grille: { ...GRILLE, type: 3 } }).length === 0, "grille hexagonale : à la main");
  ok(lib({ accessible: p => p.y >= 0 }).every(p => p.y >= 0), "murs : espaces inaccessibles écartés");
  ok(lib({ taille: { w: 2, h: 2 }, nombre: 2 }).length === 2, "grandes créatures : espaces de leur taille");
  const grands = lib({ taille: { w: 2, h: 2 }, nombre: 2 });
  ok(!(Math.abs(grands[0].x - grands[1].x) < 200 && Math.abs(grands[0].y - grands[1].y) < 200), "grandes créatures : sans se chevaucher");
  ok(f.initiativeApres(17) === 16.99 && f.initiativeApres(null) === null, "initiative juste après le chevalier");
  const debut = { temps: 100, combat: "c", enCours: true, round: 2, turn: 3, rounds: 10, secondes: 60 };
  const en = (round, turn) => f.armeeExpiree(debut, { temps: 9999, combat: { id: "c", round, turn } });
  ok(!en(12, 2) && en(12, 3) && en(13, 0) && !en(11, 5), "en combat : au tour du chevalier, dix rounds plus tard");
  ok(!f.armeeExpiree(debut, { temps: 159, combat: null }) && f.armeeExpiree(debut, { temps: 160, combat: null }), "combat parti : 60 s du monde");
  ok(!f.armeeExpiree({ ...debut, enCours: false }, { temps: 150, combat: { id: "c", round: 20, turn: 0 } }), "combat pas commencé : le temps du monde compte");
  // Le chevalier était 4e (indice 3) ; deux combattants partis avant lui, il est maintenant 2e (indice 1).
  const parId = (turn, round = 12) => f.armeeExpiree({ ...debut, combattant: "K" }, { temps: 9999, combat: { id: "c", round, turn, tours: ["a", "K", "g1", "g2"] } });
  ok(parId(1) && !parId(0), "fin au tour du combattant du chevalier, repéré par son id et non par l'indice d'origine");
});

const batterieFamilier = batterie("meute et frénésie", (f, ok) => {
  ok(meme(f.ecartCopies(["A"], []).aCreer, ["A"]), "effet du rôdeur : copie créée");
  ok(meme(f.ecartCopies([], [{ id: "x", source: "A" }]).aOter, ["x"]), "effet du rôdeur fini : copie ôtée");
  const juste = f.ecartCopies(["A"], [{ id: "x", source: "A" }]);
  ok(!juste.aCreer.length && !juste.aOter.length, "déjà juste : rien n'est réécrit");
  ok(meme(f.ecartCopies(["A"], [{ id: "x", source: "A" }, { id: "y", source: "A" }]).aOter, ["y"]), "doublon : un seul gardé");
  const src = { name: "Aspect de la meute", img: "i.svg", transfer: false, showIcon: 1, flags: { [M]: { meute: true } },
    duration: { value: 1, units: "minutes", expiry: "turnStart" }, start: { time: 50, round: 2 }, system: { changes: [{ key: "system.rolls.attack.mode", type: "add", value: "1" }] } };
  const d = f.donneesMeute(src, "Actor.r.ActiveEffect.e", "Actor.r");
  ok(d.flags[M].meuteRecue === "Actor.r.ActiveEffect.e" && !d.flags[M].meute, "copie marquée, sans le repère de l'original (pas de boucle)");
  ok(d.duration.value === 1 && d.duration.units === "minutes" && d.start?.time === 50, "même durée et même début que l'effet du rôdeur");
  ok(d.system.changes[0].key === "system.rolls.attack.mode" && d.transfer === false, "même avantage aux attaques");
  const item = { uuid: "Actor.r.Item.f", _id: "f", name: "Frénésie bestiale", folder: "x", flags: { [M]: { cle: "familier-frenesie-bestiale", frenesie: true, sousClasse: "s" } }, system: { activities: { a: { type: "damage" } } } };
  const copie = f.donneesFrenesie(item);
  ok(copie._id === undefined && copie.flags[M].frenesieRecue === "Actor.r.Item.f" && !copie.flags[M].frenesie, "frénésie : copie marquée, sans le repère de l'original");
  ok(copie.system.activities.a.type === "damage", "frénésie : l'activité de dégâts suit sur la fiche du familier");
});

const batterieTotems = batterie("totems", (f, ok) => {
  ok(meme(f.celluleDe({ x: 250, y: 150 }, GRILLE), { x: 200, y: 100, width: 1, height: 1, elevation: 0, level: undefined }), "case du totem : celle de son centre");
  // Forme réelle d'une émanation dnd5e 6.0.6 (TemplatePlacement#createShapeData, EmanationShapeData de Foundry 14) :
  // pas de x/y au premier niveau, la case est la base « token » (x, y en px, width, height en cases).
  const emanation = { type: "emanation", radius: 200, gridBased: false, hole: false, base: { type: "token", x: 300, y: 200, width: 1, height: 1, shape: 4, hole: false } };
  const c = f.caseTotem(emanation, GRILLE, { elevation: 0 });
  ok(c?.x === 300 && c?.y === 200 && c?.width === 1, "émanation : la case du totem est sa base");
  ok(f.caseTotem({ type: "circle", x: 250, y: 150, radius: 200 }, GRILLE)?.x === 200, "cercle : la case de son centre");
  ok(f.caseTotem({ type: "polygon", points: [] }, GRILLE) === null, "forme inconnue : rien");
  const porteur = { acteur: "B", disposition: 1 };
  const jetons = [
    { jeton: "b", acteur: "B", disposition: 1, geometrie: j(2, 0) },
    { jeton: "a1", acteur: "A1", disposition: 1, geometrie: j(2, 2) },
    { jeton: "a2", acteur: "A2", disposition: 1, geometrie: j(3, 0) },
    { jeton: "h", acteur: "H", disposition: -1, geometrie: j(1, 0) },
    { jeton: "n", acteur: "N", disposition: 0, geometrie: j(0, 1) }
  ];
  const zone = cible => f.jetonsDuTotem({ totem: j(0, 0), porteur, jetons, rayon: 3, cible, grille: GRILLE }).map(x => x.jeton).sort().join();
  ok(zone("allies") === "a1,b", "le barbare et ses alliés à 3 m du totem, pas au-delà, ni l'ennemi ni le neutre");
  ok(zone("hostiles") === "h", "magma : seulement les créatures hostiles");
  ok(!f.totemTropLoin(j(0, 0), j(2, 0), 3, GRILLE) && f.totemTropLoin(j(0, 0), j(3, 0), 3, GRILLE), "totem planté à 3 m ou moins du barbare");
  ok(f.rageActive([{ identifiant: "rage", actif: true }]) && !f.rageActive([{ identifiant: "rage", actif: false }]) && !f.rageActive([{ identifiant: "reckless-attack", actif: true }]), "Rage : effet actif venu de l'objet « rage »");
  ok(!f.rageActive([{ identifiant: "rage", actif: true, surObjet: true }]), "effet de l'objet Rage lui-même (préparé actif par dnd5e) : pas une Rage en cours");
  ok(f.totemRefuse({ aRage: true, enRage: false }) && !f.totemRefuse({ aRage: true, enRage: true }) && !f.totemRefuse({ aRage: false, enRage: false }), "planter hors de la Rage : refusé (si la fiche a la Rage)");
  ok(meme(f.totemsAOter([{ id: "r1", rage: true }, { id: "r2", rage: false }], false), ["r1"]) && !f.totemsAOter([{ id: "r1", rage: true }], true).length, "fin de la Rage : ses totems tombent");
  ok(meme(f.totemsAOter([{ id: "r3", rage: false, temps: 0 }], false, 599), []) && meme(f.totemsAOter([{ id: "r3", rage: false, temps: 0 }], true, 600), ["r3"]), "au plus 10 minutes (durée maximale d'une Rage), même sans Rage reconnue");
  ok(meme(f.totemsAOter([{ id: "r4", rage: false, porteur: false }], true), ["r4"]), "porteur disparu : totem orphelin ôté");
});

const batterieIvresse = batterie("ivresse", (f, ok) => {
  const cibles = [{ actor: "M", ac: 15 }, { actor: "X", ac: 12 }, { actor: "Y", ac: null }];
  const r = o => f.assaillantsRates({ total: 12, critique: false, echec: false, melee: true, cibles, ...o }).map(c => c.actor).join();
  ok(r({}) === "M", "12 contre CA 15 : raté ; contre CA 12 : touché ; CA inconnue : écartée");
  ok(r({ critique: true }) === "", "coup critique : jamais raté");
  ok(r({ total: 20, echec: true }) === "M,X", "échec critique : raté quelle que soit la CA");
  ok(r({ melee: false }) === "", "attaque à distance : pas de réaction");
  ok(f.estMelee("melee", undefined) && f.estMelee("melee", "twoHanded"), "attaque au corps à corps");
  ok(!f.estMelee("melee", "thrown") && !f.estMelee("melee", "thrown-offhand") && !f.estMelee("melee", "ranged") && !f.estMelee("ranged"), "arme lancée ou à distance : pas au corps à corps");
  const rates = [{ jeton: "T1", acteur: "A1", quand: 1000 }, { jeton: "T2", acteur: "A2", quand: 2000 }];
  const c = o => f.choisirAssaillants({ rates, maintenant: 3000, ...o }).map(x => x.jeton).join();
  ok(c({}) === "T2", "sans cible : le dernier assaillant qui a raté");
  ok(c({ cibles: [{ token: "T1", actor: "A1" }] }) === "T1", "cible désignée : celle-là, si elle a raté");
  ok(c({ cibles: [{ token: "T9", actor: "A9" }] }) === "", "cible qui n'a rien raté : rien");
  ok(c({ maintenant: 200000 }) === "", "raté trop ancien : oublié");
});

const BATTERIES = [batterieFleau, batterieChampion, batterieAvatar, batterieAuteurs, batteriePoigne, batterieArmee, batterieFamilier, batterieTotems, batterieIvresse];
const toutes = f => BATTERIES.flatMap(b => b(f));

const REEL = { ...S };
const env = (nom, fn) => f => ({ ...f, [nom]: fn(f[nom]) });
const MUTANTS = {
  // Fléau
  "type personnalisé lu comme hors liste": env("verdictType", v => (t, l) => (t?.value === "custom" ? "non" : v(t, l))),
  "type absent lu comme hors liste": env("verdictType", v => (t, l) => (!t ? "non" : v(t, l))),
  "refus dès qu'une cible est hors liste": env("filtrerCibles", fc => (t, l) => ({ ...fc(t, l), refuser: t.some(x => S.verdictType(x, l) === "non") })),
  "aucun filtrage des cibles mêlées": env("filtrerCibles", fc => (t, l) => ({ ...fc(t, l), garder: t.map((_, i) => i) })),
  "effet jamais retiré": env("terreurARetirer", () => () => false),
  "fiélon oublié": env("verdictType", v => (t, l) => v(t, l.filter(x => x !== "fiend"))),
  // Champion
  "pieds non convertis": env("lumiereVoulue", lv => l => lv(l, "m")),
  "lumière plus petite imposée": env("planLumiere", p => o => { const r = p(o); return r?.light && o.voulue ? { ...r, light: o.voulue } : r; }),
  "mémo réécrit à chaque passage": env("planLumiere", p => o => (o.voulue ? { light: p(o)?.light ?? null, avant: o.actuelle } : p(o))),
  "lumière jamais rétablie": env("planLumiere", p => o => (o.voulue ? p(o) : null)),
  // Avatar
  "recharge sans utilisation dépensée": env("rechargeRefusee", () => () => false),
  "emplacement décoché accepté": env("rechargeIncomplete", () => () => false),
  "indices de consommation ignorés": env("rechargeIncomplete", r => (c, t) => r(true, t)),
  // Auteurs, échappement, déplacement
  "n'importe quel auteur": env("auteurAutorise", () => u => Boolean(u)),
  "MJ refusé": env("auteurAutorise", a => (u, d) => !u?.isGM && a(u, d)),
  "noms non échappés": env("echapper", () => v => String(v ?? "")),
  "déplacement ordinaire (mesuré, coûteux)": env("optionsDeplacement", o => (id, v) => ({ movement: { [id]: { waypoints: [{ ...v }] } } })),
  // Poigne
  "voisin déplacé quand même": env("espaceAttire", e => o => { const r = e(o); return r.etat === "deja" ? { etat: "ok", x: o.source.x + 100, y: o.source.y, elevation: 0 } : r; }),
  "occupants ignorés": env("espaceAttire", e => o => e({ ...o, occupes: [] })),
  "murs ignorés": env("espaceAttire", e => o => e({ ...o, accessible: () => true })),
  "grande créature comptée 1×1": env("espaceAttire", e => o => e({ ...o, cible: { ...o.cible, width: 1, height: 1 } })),
  "hauteur de la cible gardée": env("espaceAttire", e => o => { const r = e(o); return r.etat === "ok" ? { ...r, elevation: o.cible.elevation } : r; }),
  "limites de la scène ignorées": env("espaceAttire", e => o => e({ ...o, limites: null })),
  // Armée
  "portée ignorée": env("espacesLibres", e => o => e({ ...o, portee: 99 })),
  "goules empilées": env("espacesLibres", e => o => { const r = e(o); return r.length ? r.map(() => r[0]) : r; }),
  "goules qui chevauchent les jetons": env("espacesLibres", e => o => e({ ...o, occupes: [] })),
  "une goule de trop": env("espacesLibres", e => o => e({ ...o, nombre: o.nombre + 1 })),
  "tour du chevalier ignoré": env("armeeExpiree", a => (d, m) => a({ ...d, turn: 0 }, m)),
  "un round de moins": env("armeeExpiree", a => (d, m) => a({ ...d, rounds: d.rounds - 1 }, m)),
  "temps du monde ignoré": env("armeeExpiree", a => (d, m) => (m.combat ? a(d, m) : false)),
  "fin à l'indice de tour d'origine": env("armeeExpiree", a => (d, m) => a({ ...d, combattant: null }, m)),
  "initiative avant le chevalier": env("initiativeApres", () => i => (Number.isFinite(i) ? i + 0.01 : null)),
  // Meute, frénésie
  "copie qui garde le repère de l'original": env("donneesMeute", dm => (s, u, o) => { const d = dm(s, u, o); d.flags[M].meute = true; return d; }),
  "copie sans la durée": env("donneesMeute", dm => (s, u, o) => ({ ...dm(s, u, o), duration: {}, start: undefined })),
  "copies réécrites à chaque passage": env("ecartCopies", () => (s, p) => ({ aCreer: [...s], aOter: p.map(x => x.id) })),
  "frénésie qui garde son repère": env("donneesFrenesie", df => i => { const d = df(i); d.flags[M].frenesie = true; return d; }),
  // Totems
  "zone autour du barbare": env("jetonsDuTotem", z => o => z({ ...o, totem: o.jetons.find(x => x.acteur === o.porteur.acteur)?.geometrie ?? o.totem })),
  "ennemis dans la zone alliée": env("jetonsDuTotem", z => o => (o.cible === "hostiles" ? z(o) : o.jetons.filter(x => distanceJetons(o.totem, x.geometrie, o.grille) <= o.rayon))),
  "barbare oublié": env("jetonsDuTotem", z => o => z(o).filter(x => x.acteur !== o.porteur.acteur)),
  "Rage repérée par le nom": env("rageActive", () => e => e.some(x => x.actif)),
  "effet de l'objet Rage compté": env("rageActive", r => e => r(e.map(x => ({ ...x, surObjet: false })))),
  "émanation lue comme un cercle": env("caseTotem", c => (fo, g, x) => (fo?.type === "emanation" ? c({ ...fo, type: "circle" }, g, x) : c(fo, g, x))),
  "base d'émanation prise pour son coin de case": env("caseTotem", c => (fo, g, x) => (fo?.type === "emanation" ? S.celluleDe({ x: fo.base.x + 150, y: fo.base.y + 150 }, g) : c(fo, g, x))),
  "totems sans fin hors Rage": env("totemsAOter", a => (t, e) => a(t, e)),
  "orphelins gardés": env("totemsAOter", a => (t, e, tp) => a(t.map(x => ({ ...x, porteur: true })), e, tp)),
  "totem refusé sans Rage sur la fiche": env("totemRefuse", () => ({ enRage }) => !enRage),
  "totems qui ne tombent jamais": env("totemsAOter", () => () => []),
  // Ivresse
  "critique compté comme raté": env("assaillantsRates", a => o => a({ ...o, critique: false })),
  "échec critique ignoré": env("assaillantsRates", a => o => a({ ...o, echec: false })),
  "distance comptée": env("assaillantsRates", a => o => a({ ...o, melee: true })),
  "arme lancée comptée au corps à corps": env("estMelee", () => t => t === "melee"),
  "égalité comptée comme ratée": env("assaillantsRates", () => o => (o.melee ? o.cibles.filter(c => Number.isFinite(c.ac) && !o.critique && (o.total <= c.ac || o.echec)) : [])),
  "cible désignée ignorée": env("choisirAssaillants", c => o => c({ ...o, cibles: [] })),
  "mémoire sans délai": env("choisirAssaillants", c => o => c({ ...o, delai: Infinity }))
};

test("capacités (suite) : la logique pure passe ses batteries", () => {
  assert.deepEqual(toutes(REEL), []);
});

test("capacités (suite) : chaque logique mutée est repérée par une batterie", () => {
  const passees = Object.entries(MUTANTS).filter(([, muter]) => !toutes(muter(REEL)).length).map(([nom]) => nom);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

// ---------------------------------------------------------------- Câblage des drapeaux dans le contenu fabriqué

const DOCS = fabriquer();
const texte = h => String(h ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const nombre = s => Number(String(s).replace(",", "."));
const AUTOMATISEES = ["main-d-argent-chatiment-du-fleau", "main-d-argent-champion", "elements-avatar", "chevalier-poigne-de-la-mort",
  "chevalier-armee-des-morts", "totems-totems-elementaires", "familier-frenesie-bestiale", "familier-aspect-de-la-meute", "brasseur-ivresse-du-sage"];

function verifierCablage(docs, enPartie = CAPACITES_EN_PARTIE) {
  const erreurs = [];
  const err = m => erreurs.push(m);
  const doc = cle => docs.find(d => d.cle === cle)?.doc;
  const fl = d => d?.flags?.[M] ?? {};
  const acts = d => Object.values(d?.system?.activities ?? {});
  const txt = d => texte(d?.system?.description?.value);

  const fleau = doc("classes:main-d-argent-chatiment-du-fleau");
  const terreur = acts(fleau).filter(a => meme(a.flags?.[M]?.typesVises, V));
  if (terreur.length !== 1 || terreur[0].type !== "save") err("fléau : il faut la sauvegarde marquée");
  else if (!terreur[0].effects.some(x => meme(fleau.effects.find(e => e._id === x._id)?.flags?.[M]?.typesVises, V))) err("fléau : effet de la sauvegarde non marqué");
  if (acts(fleau).some(a => a.type === "damage" && a.flags?.[M]?.typesVises)) err("fléau : les dégâts radiants frappent toute créature");
  if (!/mort-vivant/.test(txt(fleau)) || !/fiélon/.test(txt(fleau))) err("fléau : texte sans les types visés");

  const champion = doc("classes:main-d-argent-champion");
  const lumineux = (champion?.effects ?? []).filter(e => e.flags?.[M]?.lumiere);
  const vive = nombre(/lumière vive sur (\d+(?:,\d+)?) m/.exec(txt(champion))?.[1]);
  if (lumineux.length !== 1 || lumineux[0].transfer || lumineux[0].flags[M].lumiere.vive !== vive) err("champion : lumière différente du texte, ou effet non marqué");

  const avatar = doc("classes:elements-avatar");
  const recharge = acts(avatar).filter(a => a.flags?.[M]?.recharge);
  const niveau = /emplacement de sort de niveau (\d)/.exec(txt(avatar))?.[1];
  const cibles = recharge[0]?.consumption.targets ?? [];
  if (recharge.length !== 1 || !cibles.some(c => c.type === "spellSlots" && c.target === niveau && c.value === "1") || !cibles.some(c => c.type === "itemUses" && c.target === "" && c.value === "-1")) err("avatar : recharge différente du texte");

  const poigne = doc("classes:chevalier-poigne-de-la-mort");
  if (fl(poigne).attire !== "echec" || !acts(poigne).some(a => a.type === "save" && a.save.ability.includes("str"))) err("poigne : capacité non marquée ou sauvegarde de Force absente");

  const armee = doc("classes:chevalier-armee-des-morts");
  const lever = acts(armee).filter(a => a.flags?.[M]?.armee);
  const r = lever[0]?.flags[M].armee;
  const t = txt(armee);
  if (lever.length !== 1 || !r) err("armée : activité non marquée");
  else {
    if (!docs.some(d => d.cle === `bestiaire:${r.profil}`) || !/profil de goule du bestiaire/.test(t) || r.profil !== "goule") err("armée : profil absent du bestiaire ou différent du texte");
    if (r.nombre !== 4 || !/quatre goules/.test(t)) err("armée : nombre différent du texte");
    if (r.portee !== nombre(/à (\d+(?:,\d+)?) m ou moins de vous/.exec(t)?.[1])) err("armée : portée différente du texte");
    if (r.duree !== 60 || !/au bout de 1 minute/.test(t)) err("armée : durée différente du texte");
  }
  if (!(armee?.effects ?? []).some(e => e.flags?.[M]?.armee && !e.transfer)) err("armée : effet du chevalier non marqué");

  const totems = doc("classes:totems-totems-elementaires");
  const tt = txt(totems);
  const plantes = acts(totems).filter(a => a.flags?.[M]?.totem);
  if (plantes.length !== 3) err("totems : trois activités marquées");
  for (const a of plantes) {
    const x = a.flags[M].totem;
    const attendu = a.type === "save" ? "hostiles" : "allies";
    if (x.cible !== attendu) err(`totems : ${a.name} vise ${x.cible}`);
    if (a.type !== "save" && !a.effects.length) err(`totems : ${a.name} sans effet à appliquer`);
    if (!a.target?.template?.stationary || a.target.template.type !== "radius") err(`totems : ${a.name}, gabarit qui suit le jeton (stationary)`);
    if (x.rayon !== nombre(/à (\d+) m ou moins du totem/.exec(tt)?.[1]) || x.portee !== nombre(/espace libre à (\d+) m ou moins de vous/.exec(tt)?.[1])) err(`totems : ${a.name}, distances différentes du texte`);
  }

  const meute = doc("classes:familier-aspect-de-la-meute");
  if (!(meute?.effects ?? []).some(e => e.flags?.[M]?.meute && !e.transfer && e.system.changes.some(c => c.key === "system.rolls.attack.mode"))) err("meute : effet d'avantage non marqué");
  const frenesie = doc("classes:familier-frenesie-bestiale");
  if (!fl(frenesie).frenesie || !acts(frenesie).some(a => a.type === "damage")) err("frénésie : capacité non marquée ou sans dégâts");

  const ivresse = doc("classes:brasseur-ivresse-du-sage");
  const insondable = (ivresse?.effects ?? []).filter(e => e.flags?.[M]?.ivresse);
  if (insondable.length !== 1 || insondable[0].transfer) err("ivresse : l'Ivresse insondable (effet appliqué) doit être marquée");
  const renverser = acts(ivresse).filter(a => a.flags?.[M]?.renverser);
  if (renverser.length !== 1 || renverser[0].activation.type !== "reaction" || renverser[0].consumption.targets.length) err("ivresse : réaction « Renverser l'assaillant » absente, ou qui dépense l'Ivresse");

  for (const cle of AUTOMATISEES) {
    if (enPartie[cle]) err(`${cle} : encore listée comme faite à la main`);
    if (fl(doc(`classes:${cle}`)).automatisation !== "complete") err(`${cle} : automatisation non complète`);
  }
  if (!enPartie["si-7-maitre-du-deguisement"] || fl(doc("classes:si-7-maitre-du-deguisement")).automatisation !== "partielle") err("maître du déguisement : reste au MJ");
  return erreurs;
}

const copie = () => structuredClone(DOCS);
const de = (D, cle) => D.find(d => d.cle === cle).doc;
const act = (D, cle, drap) => Object.values(de(D, cle).system.activities).find(a => a.flags?.[M]?.[drap]);
const MUTATIONS_CONTENU = {
  "fléau : sauvegarde non marquée"(D) { act(D, "classes:main-d-argent-chatiment-du-fleau", "typesVises").flags = {}; },
  "fléau : dégâts filtrés aussi"(D) { Object.values(de(D, "classes:main-d-argent-chatiment-du-fleau").system.activities).forEach(a => { a.flags = { [M]: { typesVises: V } }; }); },
  "fléau : effet non marqué"(D) { de(D, "classes:main-d-argent-chatiment-du-fleau").effects[0].flags = {}; },
  "champion : 6 m"(D) { de(D, "classes:main-d-argent-champion").effects[0].flags[M].lumiere.vive = 6; },
  "avatar : emplacement de niveau 4"(D) { act(D, "classes:elements-avatar", "recharge").consumption.targets[1].target = "4"; },
  "avatar : utilisation non rendue"(D) { act(D, "classes:elements-avatar", "recharge").consumption.targets.shift(); },
  "poigne : non marquée"(D) { delete de(D, "classes:chevalier-poigne-de-la-mort").flags[M].attire; },
  "armée : trois goules"(D) { act(D, "classes:chevalier-armee-des-morts", "armee").flags[M].armee.nombre = 3; },
  "armée : profil inconnu"(D) { act(D, "classes:chevalier-armee-des-morts", "armee").flags[M].armee.profil = "squelette"; },
  "armée : 18 m"(D) { act(D, "classes:chevalier-armee-des-morts", "armee").flags[M].armee.portee = 18; },
  "armée : effet non marqué"(D) { de(D, "classes:chevalier-armee-des-morts").effects[0].flags = {}; },
  "totems : magma sur les alliés"(D) { act(D, "classes:totems-totems-elementaires", "totem"); Object.values(de(D, "classes:totems-totems-elementaires").system.activities).forEach(a => { a.flags[M].totem.cible = "allies"; }); },
  "totems : gabarit qui suit le jeton"(D) { Object.values(de(D, "classes:totems-totems-elementaires").system.activities)[1].target.template.stationary = false; },
  "totems : rayon de 4,5 m"(D) { Object.values(de(D, "classes:totems-totems-elementaires").system.activities)[0].flags[M].totem.rayon = 4.5; },
  "meute : non marquée"(D) { de(D, "classes:familier-aspect-de-la-meute").effects[0].flags = {}; },
  "frénésie : non marquée"(D) { delete de(D, "classes:familier-frenesie-bestiale").flags[M].frenesie; },
  "ivresse : effet permanent marqué"(D) { const e = de(D, "classes:brasseur-ivresse-du-sage").effects; e[0].flags = { [M]: { ivresse: true } }; e[1].flags = {}; },
  "ivresse : réaction qui dépense"(D) { act(D, "classes:brasseur-ivresse-du-sage", "renverser").consumption.targets = [{ type: "itemUses", value: "1", target: "" }]; },
  "capacité automatisée laissée partielle"(D) { de(D, "classes:chevalier-armee-des-morts").flags[M].automatisation = "partielle"; }
};

test("câblage (suite) : les repères des automatismes sont posés dans le contenu fabriqué", () => {
  assert.deepEqual(verifierCablage(DOCS), []);
});

test("câblage (suite) : chaque repère manquant ou faux est repéré", () => {
  const passees = Object.entries(MUTATIONS_CONTENU).filter(([, muter]) => { const D = copie(); muter(D); return !verifierCablage(D).length; }).map(([n]) => n);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
  assert.ok(verifierCablage(DOCS, { ...CAPACITES_EN_PARTIE, "chevalier-armee-des-morts": "remise à la main" }).length, "liste du MJ qui garde une capacité automatisée");
  assert.ok(verifierCablage(DOCS, {}).length, "maître du déguisement retiré de la liste du MJ");
});
