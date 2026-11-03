// Automatismes des capacités de sous-classe (modules/lakour-warcraft/scripts/capacites.js) : logique pure des auras
// (distance d'espace à espace, diagonales, altitude, rayon selon le niveau, allégeance, porteur hors d'état, écarts sans
// réécriture, ralentissement), du familier du chasseur (PV et écart de maîtrise), de l'Évasion d'agent et du Fût roulant ;
// et câblage des drapeaux dans le contenu fabriqué (contenu/sous-classes.mjs REPERES_AUTOMATISMES, contenu/compagnons.mjs).
// Chaque batterie est rejouée sur des versions mutées de la logique (ou du contenu) : chaque mutation doit être repérée.
// Références indépendantes du code : Aura de protection du paladin 2024 (dnd5e.classes24, échelle « aura » : 10 pi au
// niveau 6, 30 pi au niveau 18, soit 3 m et 9 m), CONST.GRID_DIAGONALS et CONST.TOKEN_DISPOSITIONS de Foundry 14,
// SaveMessageData de dnd5e 6.0.6 (message « save », system.resisted), CONFIG.DND5E.movementUnits (5 pi = 1,5 m).  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { fabriquer } from "../outils/fabriquer-warcraft.mjs";
import { CAPACITES_EN_PARTIE } from "../modules/lakour-warcraft/contenu/sous-classes.mjs";
import * as C from "../modules/lakour-warcraft/scripts/capacites.js";

const M = "lakour-warcraft";
const GRILLE = { size: 100, distance: 1.5, type: 1, diagonals: 0 };
const j = (col, ligne, extra = {}) => ({ x: col * 100, y: ligne * 100, width: 1, height: 1, elevation: 0, ...extra });
const presque = (a, b) => Math.abs(a - b) < 1e-6;

// ---------------------------------------------------------------- Batteries de la logique pure

function batterieAuras(f) {
  const erreurs = [];
  const ok = (cond, msg) => { if (!cond) erreurs.push(msg); };
  const essai = (nom, fn) => { try { fn(); } catch (e) { erreurs.push(`${nom} : ${e.message}`); } };

  essai("distance", () => {
    const d = (a, b, g = GRILLE) => f.distanceJetons(a, b, g);
    ok(presque(d(j(0, 0), j(1, 0)), 1.5), "deux jetons voisins sont à 1,5 m");
    ok(presque(d(j(0, 0), j(2, 0)), 3), "deux cases : 3 m");
    ok(presque(d(j(0, 0), j(2, 2)), 3), "diagonale 5/5/5 : 3 m");
    ok(presque(d(j(0, 0), j(2, 2), { ...GRILLE, diagonals: 4 }), 4.5), "diagonale 5/10/5 : 4,5 m");
    ok(presque(d(j(0, 0), j(2, 1), { ...GRILLE, diagonals: 3 }), 4.5), "diagonales rectilignes : 4,5 m");
    ok(presque(d(j(0, 0, { width: 2, height: 2 }), j(3, 0)), 3), "grand jeton : mesuré depuis son bord");
    ok(presque(d(j(0, 0, { width: 2, height: 2 }), j(1, 1)), 0), "jetons qui se chevauchent : 0");
    ok(presque(d(j(0, 0), j(1, 0, { elevation: 3 })), 3), "altitude comptée");
    ok(d(j(0, 0, { level: "a" }), j(1, 0, { level: "b" })) === Infinity, "autre niveau de la scène : hors de portée");
    ok(presque(d(j(0, 0), { x: 150, y: 0, width: 1, height: 1 }, { ...GRILLE, type: 0 }), 2.25), "sans grille : distance continue");
  });

  essai("position", () => {
    // Doublure d'un TokenDocument de Foundry 14 en plein déplacement animé : x/y/elevation valent la position
    // interpolée, _source la destination (mesuré en jeu : x = 649,98 quand _source.x = 1300).
    const anime = { x: 649.98, y: 0, elevation: 0, width: 1, height: 1, level: "n", _source: { x: 1300, y: 0, elevation: 3, width: 1, height: 1, level: "n" } };
    const p = f.positionJeton(anime);
    ok(p.x === 1300 && p.elevation === 3, "position lue dans la source (destination), pas la position animée");
    ok(f.positionJeton({ x: 100, y: 200, width: 2, height: 2 }).x === 100, "sans source : les champs du document");
    const porteur = { jeton: "tP", acteur: "A:P", disposition: 1, geometrie: j(13, 0), cle: "purete", rayon: 3, ralentit: 0 };
    const v = f.aurasVoulues([porteur], [{ jeton: "t1", acteur: "A:1", disposition: 1, geometrie: f.positionJeton(anime) }], GRILLE);
    ok(v.get("A:1")?.has("purete"), "allié arrivé à côté du porteur : dans l'aura dès le hook, pendant l'animation");
  });

  essai("rayon", () => {
    const purete = { rayons: [[1, 3], [18, 9]] };
    ok(f.rayonAura(purete, 7) === 3 && f.rayonAura(purete, 17) === 3, "Aura de protection : 3 m avant le niveau 18");
    ok(f.rayonAura(purete, 18) === 9 && f.rayonAura(purete, 20) === 9, "Aura de protection : 9 m dès le niveau 18");
    ok(f.rayonAura({ rayons: [[1, 3]] }, 0) === null, "avant le premier palier : pas d'aura");
  });

  essai("unités", () => {
    ok(presque(f.convertirLongueur(10, "ft", "m"), 3) && presque(f.convertirLongueur(3, "m", "ft"), 10), "5 pi = 1,5 m (conversion de dnd5e)");
    ok(f.convertirLongueur(3, "m", "lieues") === null, "unité inconnue : pas de conversion");
    const purete = { rayons: [[1, 3], [18, 9]] };
    ok(presque(f.rayonEnScene(purete, 7, "ft"), 10) && presque(f.rayonEnScene(purete, 18, "ft"), 30), "Aura de protection : 10 pi, puis 30 pi");
    ok(f.rayonEnScene(purete, 7, "m") === 3, "scène en mètres : 3 m");
    ok(f.rayonEnScene(purete, 7, "pas") === null && f.rayonEnScene(purete, 7, undefined) === null, "unité de scène inconnue : pas d'aura");
  });

  essai("porteur", () => {
    ok(f.porteurActif({ statuts: [], pv: 30, coupure: "neutralise" }) === true, "porteur debout : aura active");
    ok(f.porteurActif({ statuts: new Set(["unconscious"]), pv: 30 }) === false, "porteur inconscient : aura éteinte");
    ok(f.porteurActif({ statuts: ["stunned"], pv: 30, coupure: "neutralise" }) === false, "pureté : porteur neutralisé (étourdi)");
    ok(f.porteurActif({ statuts: ["stunned"], pv: 30, coupure: "inconscient" }) === true, "froid : étourdi mais conscient, aura gardée");
    ok(f.porteurActif({ statuts: [], pv: 0 }) === false, "porteur à 0 PV : aura éteinte");
    ok(f.porteurActif({ statuts: [], pv: 30, eteinte: true }) === false, "effet désactivé sur la fiche : aura éteinte");
  });

  essai("allégeance", () => {
    ok(f.estAllie(1, 1) && f.estAllie(-1, -1), "même allégeance amicale ou hostile : alliés");
    ok(!f.estAllie(0, 0), "porteur neutre : personne n'est son allié");
    ok(!f.estAllie(1, -1) && !f.estAllie(1, 0), "allégeances différentes : pas alliés");
    ok(!f.estAllie(-2, -2), "jetons secrets : jamais alliés");
    ok(f.estHostile(1, -1) && f.estHostile(-1, 1), "allégeances opposées : hostiles");
    ok(!f.estHostile(1, 0) && !f.estHostile(1, 1) && !f.estHostile(-2, 1), "neutre, allié ou secret : pas hostile");
  });

  essai("auras voulues", () => {
    const porteur = { jeton: "tP", acteur: "A:P", disposition: 1, geometrie: j(0, 0), cle: "purete", rayon: 3, ralentit: 0 };
    const jetons = [
      { jeton: "tP", acteur: "A:P", disposition: 1, geometrie: j(0, 0) },
      { jeton: "t1", acteur: "A:1", disposition: 1, geometrie: j(2, 0) },
      { jeton: "t2", acteur: "A:2", disposition: 1, geometrie: j(3, 0) },
      { jeton: "t3", acteur: "A:3", disposition: -1, geometrie: j(1, 0) },
      { jeton: "t4", acteur: "A:4", disposition: 0, geometrie: j(1, 1) },
      { jeton: "t5", acteur: "A:5", disposition: 1, geometrie: j(9, 9) },
      { jeton: "t6", acteur: "A:5", disposition: 1, geometrie: j(0, 1) }
    ];
    const v = f.aurasVoulues([porteur], jetons, GRILLE);
    const a = acteur => [...(v.get(acteur) ?? [])].join();
    ok(a("A:P") === "", "le porteur ne reçoit pas de copie (il a sa capacité)");
    ok(a("A:1") === "purete", "allié exactement au bord (3 m) : dans l'aura");
    ok(a("A:2") === "", "allié à 4,5 m : hors de l'aura");
    ok(a("A:3") === "" && a("A:4") === "", "hostile et neutre : rien");
    ok(a("A:5") === "purete", "acteur à deux jetons : l'un dans l'aura suffit");
    const neutre = f.aurasVoulues([{ ...porteur, disposition: 0 }], [{ jeton: "tN", acteur: "A:N", disposition: 0, geometrie: j(1, 0) }], GRILLE);
    ok(!neutre.get("A:N")?.size, "porteur neutre : il ne donne son aura à personne");
    // Scène en pieds (défaut de dnd5e) : rayon de 3 m converti en 10 pi, grille de 5 pi.
    const pieds = { ...GRILLE, distance: 5, units: "ft" };
    const rayonPieds = f.rayonEnScene({ rayons: [[1, 3]] }, 7, "ft");
    const enPieds = f.aurasVoulues([{ ...porteur, rayon: rayonPieds }], [{ jeton: "t1", acteur: "A:1", disposition: 1, geometrie: j(2, 0) }, { jeton: "t2", acteur: "A:2", disposition: 1, geometrie: j(3, 0) }], pieds);
    ok(enPieds.get("A:1")?.has("purete") && !enPieds.get("A:2")?.size, "scène en pieds : 10 pi = deux cases, comme 3 m");
  });

  essai("écarts", () => {
    const vide = r => !r.aCreer.length && !r.aOter.length;
    ok(vide(f.ecartAuras([{ id: "e1", cle: "purete" }], new Set(["purete"]))), "déjà juste : rien n'est réécrit");
    ok(f.ecartAuras([], new Set(["purete"])).aCreer.join() === "purete", "entrée dans l'aura : effet créé");
    ok(f.ecartAuras([{ id: "e1", cle: "froid" }], new Set()).aOter.join() === "e1", "sortie de l'aura : effet ôté");
    const doublon = f.ecartAuras([{ id: "e1", cle: "purete" }, { id: "e2", cle: "purete" }], new Set(["purete"]));
    ok(doublon.aOter.join() === "e2" && !doublon.aCreer.length, "doublon : un seul exemplaire gardé");
  });

  essai("ralentissement", () => {
    const froid = { jeton: "tP", acteur: "A:P", disposition: 1, geometrie: j(0, 0), cle: "froid", rayon: 3, ralentit: 3 };
    const purete = { ...froid, cle: "purete", ralentit: 0 };
    const cible = (col, disposition) => ({ jeton: "tX", acteur: "A:X", disposition, geometrie: j(col, 0) });
    ok(f.ralentisseur(cible(2, -1), [froid], GRILLE)?.cle === "froid", "ennemi dans l'aura au début de son tour : ralenti");
    ok(f.ralentisseur(cible(3, -1), [froid], GRILLE) === null, "ennemi hors de l'aura : rien");
    ok(f.ralentisseur(cible(1, 1), [froid], GRILLE) === null && f.ralentisseur(cible(1, 0), [froid], GRILLE) === null, "allié ou neutre : rien");
    ok(f.ralentisseur(cible(1, -1), [purete], GRILLE) === null, "aura sans ralentissement : rien");
    ok(f.reductionVitesse(3, "m") === 3 && f.reductionVitesse(3, "ft") === 10 && f.reductionVitesse(3, undefined) === 3, "3 m, ou 10 pi");
    ok(f.reductionVitesse(3, "mi") === 0, "unité inconnue : rien");
    const effets = [{ id: "r", name: "x", flags: { [M]: { auraRalenti: "froid" } } }, { id: "z", name: "Aura de froid : ralenti", flags: {} }];
    ok(f.ralentisAOter(effets).join() === "r", "fin du ralentissement : effet repéré par drapeau, pas par le nom");
    const d = f.donneesRalenti({ nom: "x", reduction: 3, cle: "froid" });
    ok(d.system.changes[0].key === "system.attributes.movement.bonus" && d.system.changes[0].value === "-3" && d.flags[M].auraRalenti === "froid", "effet de ralentissement : −3 à toutes les vitesses, marqué");
    const recue = f.donneesAuraRecue({ name: "Aura de froid", system: { changes: [{ key: "system.traits.dr.value", value: "cold", type: "add" }] } }, "froid", "Actor.a.Item.b");
    ok(recue.flags[M].auraRecue === "froid" && recue.system.changes[0].value === "cold" && recue.transfer === false, "copie de l'effet de l'aura, marquée");
  });
  return erreurs;
}

function batterieFamilier(f) {
  const erreurs = [];
  const ok = (cond, msg) => { if (!cond) erreurs.push(msg); };
  try {
    const R = f.REGLE_FAMILIER;
    const c3 = f.chiffresFamilier(R, { niveau: 3, maitrise: 2 });
    ok(c3.pvMax === 20 && c3.ecart === 0, "rôdeur de niveau 3 : 20 PV, fiche telle quelle");
    const c5 = f.chiffresFamilier(R, { niveau: 5, maitrise: 3 });
    ok(c5.pvMax === 30 && c5.ecart === 1, "niveau 5 : 30 PV, +1");
    const c20 = f.chiffresFamilier(R, { niveau: 20, maitrise: 6 });
    ok(c20.pvMax === 105 && c20.ecart === 4, "niveau 20 : 105 PV, +4");
    ok(f.pvApres({ valeur: 20, max: 20 }, 30) === 30, "PV pleins : ils suivent le nouveau maximum");
    ok(f.pvApres({ valeur: 12, max: 20 }, 30) === 22, "blessé : la blessure reste");
    ok(f.pvApres({ valeur: 5, max: 20 }, 15) === 1, "maximum qui baisse : jamais tué par le calcul");
    ok(f.pvApres({ valeur: 0, max: 20 }, 30) === 0, "familier à 0 PV : pas relevé");
    ok(f.pvApres({ valeur: 30, max: 30 }, 25) === 25, "jamais au-dessus du maximum");
    ok(f.pvApres({ valeur: 35, max: 30, bonus: 5 }, 35) === 40, "bonus de PV max d'un effet : plafond relevé d'autant");
    // Un effet ajoute 5 PV max : préparés 35, source 30. Les recopies successives ne touchent à rien.
    const fiche = { system: { attributes: { hp: { value: 35, max: 35 } }, _source: { attributes: { hp: { value: 35, max: 30 } } } } };
    const src = f.pvSource(fiche);
    ok(src.max === 30 && src.valeur === 35 && src.bonus === 5, "PV lus dans la source, bonus des effets à part");
    const c4 = f.chiffresFamilier(R, { niveau: 5, maitrise: 3 });
    ok(!f.planFamilier({ ...src, effet: { id: "L", changes: f.changementsLien(1) } }, c4).maj, "PV max d'effet : rien n'est réécrit, les PV ne baissent pas");
    const monteAvecBonus = f.planFamilier({ ...src, effet: null }, f.chiffresFamilier(R, { niveau: 6, maitrise: 3 }));
    ok(monteAvecBonus.maj?.["system.attributes.hp.max"] === 35 && monteAvecBonus.maj?.["system.attributes.hp.value"] === 40, "niveau gagné : PV de la source + 5, plafond préparé");
    const mj = { isGM: true };
    const joueur = { isGM: false, id: "j" };
    const fam = { testUserPermission: (u, n) => n === "OWNER" && u.id === "j" };
    ok(f.peutLier(mj, fam) && f.peutLier(joueur, fam) && !f.peutLier({ isGM: false, id: "autre" }, fam) && !f.peutLier(null, fam), "seul un propriétaire ou un MJ lie le familier");
    const nonLie = f.majLien({ estJeton: true, jetonLie: false, prototypeLie: false, rodeurActuel: undefined }, "Actor.r");
    ok(nonLie.acteur?.[`flags.${M}.rodeur`] === "Actor.r" && nonLie.acteur?.["prototypeToken.actorLink"] === true && nonLie.jeton?.actorLink === true,
      "jeton non lié du bestiaire : drapeau et jeton prototype lié sur la fiche du monde, jeton ciblé lié");
    const deja = f.majLien({ estJeton: true, jetonLie: true, prototypeLie: true, rodeurActuel: "Actor.r" }, "Actor.r");
    ok(!deja.acteur && !deja.jeton, "lien déjà en place : rien n'est réécrit");
    ok(f.majLien({ estJeton: false, prototypeLie: true, rodeurActuel: "Actor.x" }, "Actor.r").acteur?.[`flags.${M}.rodeur`] === "Actor.r", "changement de rôdeur");
    ok(f.changementsLien(0).length === 0, "écart nul : aucun changement");
    const lien = f.changementsLien(2);
    for (const cle of ["system.attributes.ac.bonus", "system.rolls.attack.bonus", "system.rolls.damage.mwak.bonus"]) {
      ok(lien.some(x => x.key === cle && x.value === "2" && x.type === "add"), `lien : ${cle} +2`);
    }
    const juste = f.planFamilier({ valeur: 20, max: 20, effet: null }, c3);
    ok(!juste.maj && !juste.effet, "fiche déjà juste : rien n'est écrit");
    const monte = f.planFamilier({ valeur: 20, max: 20, effet: null }, c5);
    ok(monte.maj?.["system.attributes.hp.max"] === 30 && monte.maj?.["system.attributes.hp.value"] === 30 && monte.effet?.action === "creer", "niveau 5 : PV et effet créés");
    const garde = f.planFamilier({ valeur: 30, max: 30, effet: { id: "L", changes: f.changementsLien(1) } }, c5);
    ok(!garde.maj && !garde.effet, "effet déjà juste : pas réécrit");
    ok(f.planFamilier({ valeur: 105, max: 105, effet: { id: "L", changes: f.changementsLien(1) } }, c20).effet?.action === "maj", "écart changé : effet mis à jour");
    ok(f.planFamilier({ valeur: 20, max: 20, effet: { id: "L", changes: f.changementsLien(1) } }, c3).effet?.action === "oter", "écart nul : effet ôté");
  } catch (e) { erreurs.push(`exception : ${e.message}`); }
  return erreurs;
}

function batterieEvasionFut(f) {
  const erreurs = [];
  const ok = (cond, msg) => { if (!cond) erreurs.push(msg); };
  try {
    ok(f.rompEvasion({ type: "attack" }), "jet d'attaque : l'invisibilité tombe");
    ok(!f.rompEvasion({ type: "usage", activite: "attack", objet: "weapon" }), "carte d'utilisation d'une attaque : pas encore, l'invisibilité compte au jet");
    ok(f.rompEvasion({ type: "usage", activite: "save", objet: "consumable", sousType: "scroll" }), "sort lancé d'un parchemin");
    ok(!f.rompEvasion({ type: "usage", activite: "heal", objet: "consumable", sousType: "potion" }), "potion : pas un sort");
    ok(f.rompEvasion({ type: "usage", activite: "utility", objet: "spell" }), "sort lancé");
    ok(f.rompEvasion({ type: "usage", activite: "cast", objet: "feat" }), "capacité qui lance un sort");
    ok(!f.rompEvasion({ type: "usage", activite: "utility", objet: "feat" }), "utiliser l'Évasion elle-même ne la rompt pas");
    ok(!f.rompEvasion({ type: "save", activite: "save", objet: "spell" }), "faire une sauvegarde ne la rompt pas");
    ok(!f.rompEvasion({ type: "usage", activite: "save", objet: "consumable" }), "boire une potion ne la rompt pas");
    ok(f.evasionsAOter([{ id: "a", flags: { [M]: { evasion: true } } }, { id: "b", name: "Évasion d'agent", flags: {} }]).join() === "a", "repérée par drapeau, pas par le nom");
    const jet = (total, target) => ({ total, options: { target } });
    const base = { type: "save", marque: "echec", rolls: [jet(10, 14)] };
    ok(f.metATerre(base), "sauvegarde ratée contre le Fût roulant : à terre");
    ok(!f.metATerre({ ...base, rolls: [jet(14, 14)] }), "réussite au DD exact : debout");
    ok(!f.metATerre({ ...base, resiste: true }), "résistance légendaire : debout");
    ok(!f.metATerre({ ...base, marque: undefined }), "autre capacité : rien");
    ok(!f.metATerre({ ...base, type: "check" }), "test, pas sauvegarde : rien");
    ok(!f.metATerre({ ...base, aTerre: true }), "déjà à terre : rien de plus");
    ok(!f.metATerre({ ...base, immunise: true }), "immunisé contre l'état à terre : rien");
    ok(!f.metATerre({ ...base, rolls: [{ total: 3, options: {} }] }), "jet sans DD : rien");
  } catch (e) { erreurs.push(`exception : ${e.message}`); }
  return erreurs;
}

const REEL = { ...C };
const enveloppe = (nom, fn) => f => ({ ...f, [nom]: fn(f[nom]) });
const MUTANTS = {
  // Auras
  "voisins comptés à 0 m": enveloppe("distanceJetons", d => (a, b, g) => Math.max(0, d(a, b, g) - 1.5)),
  "distance de centre à centre": enveloppe("distanceJetons", () => (a, b) => Math.hypot(b.x - a.x, b.y - a.y) / 100 * 1.5),
  "règle de diagonale de la scène ignorée": enveloppe("distanceJetons", d => (a, b, g) => d(a, b, { ...g, diagonals: 0 })),
  "altitude ignorée": enveloppe("distanceJetons", d => (a, b, g) => d({ ...a, elevation: 0 }, { ...b, elevation: 0 }, g)),
  "niveaux de scène ignorés": enveloppe("distanceJetons", d => (a, b, g) => d({ ...a, level: null }, { ...b, level: null }, g)),
  "position animée lue (x au lieu de _source.x)": enveloppe("positionJeton", () => t => ({ x: t.x, y: t.y, width: t.width, height: t.height, elevation: t.elevation, level: t.level })),
  "rayon strict (bord exclu)": enveloppe("aurasVoulues", v => (p, js, g) => v(p.map(x => ({ ...x, rayon: x.rayon - 0.01 })), js, g)),
  "allégeance ignorée": enveloppe("aurasVoulues", v => (p, js, g) => v(p, js.map(x => ({ ...x, disposition: p[0]?.disposition })), g)),
  "le porteur se donne une copie": enveloppe("aurasVoulues", v => (p, js, g) => v(p.map(x => ({ ...x, acteur: `${x.acteur}#` })), js, g)),
  "secrets alliés entre eux": enveloppe("estAllie", () => (a, b) => a === b),
  "hostile = pas allié": enveloppe("estHostile", () => (a, b) => a !== b),
  "neutres alliés entre eux": enveloppe("estAllie", () => (a, b) => a === b && a !== -2),
  "porteur neutre qui donne son aura": enveloppe("aurasVoulues", v => (p, js, g) => v(p.map(x => (x.disposition === 0 ? { ...x, disposition: 1 } : x)), js.map(x => (x.disposition === 0 ? { ...x, disposition: 1 } : x)), g)),
  "rayon en mètres sur une scène en pieds": enveloppe("rayonEnScene", () => (a, n) => C.rayonAura(a, n)),
  "unité inconnue lue comme des mètres": enveloppe("rayonEnScene", r => (a, n, u) => r(a, n, u) ?? C.rayonAura(a, n)),
  "conversion inversée": enveloppe("convertirLongueur", c => (v, de, vers) => c(v, vers, de)),
  "ralentissement repéré par le nom": enveloppe("ralentisAOter", () => e => e.filter(x => x.flags?.[M]?.auraRalenti || /ralenti/.test(x.name ?? "")).map(x => x.id)),
  "palier du niveau 18 oublié": enveloppe("rayonAura", () => a => a?.rayons?.[0]?.[1] ?? null),
  "aura avant le premier palier": enveloppe("rayonAura", r => (a, n) => r(a, n) ?? a?.rayons?.[0]?.[1]),
  "inconscience ignorée": enveloppe("porteurActif", p => o => p({ ...o, statuts: [] })),
  "neutralisation ignorée pour la pureté": enveloppe("porteurActif", p => o => p({ ...o, coupure: "inconscient" })),
  "0 PV ignorés": enveloppe("porteurActif", p => o => p({ ...o, pv: undefined })),
  "aura désactivée ignorée": enveloppe("porteurActif", p => o => p({ ...o, eteinte: false })),
  "réécriture à chaque calcul": enveloppe("ecartAuras", () => (pr, v) => ({ aCreer: [...v], aOter: pr.map(e => e.id) })),
  "doublon gardé": enveloppe("ecartAuras", e => (pr, v) => e(pr.filter((x, i, t) => t.findIndex(y => y.cle === x.cle) === i), v)),
  "allié ralenti": enveloppe("ralentisseur", () => (cible, p, g) => p.find(x => x.ralentit > 0 && x.acteur !== cible.acteur && C.distanceJetons(x.geometrie, cible.geometrie, g) <= x.rayon) ?? null),
  "pieds non convertis": enveloppe("reductionVitesse", () => m => m),
  // Familier
  "PV sans la base de 5": enveloppe("chiffresFamilier", c => (r, x) => ({ ...c(r, x), pvMax: c(r, x).pvMax - 5 })),
  "bonus entier ajouté (compté deux fois)": enveloppe("chiffresFamilier", c => (r, x) => ({ ...c(r, x), ecart: x.maitrise })),
  "familier relevé à 0 PV": enveloppe("pvApres", () => ({ valeur, max }, n) => Math.min(n, valeur + n - max)),
  "PV au-delà du maximum": enveloppe("pvApres", p => (e, n) => (e.valeur > n ? e.valeur : p(e, n))),
  "toucher oublié": enveloppe("changementsLien", l => e => l(e).filter(x => x.key !== "system.rolls.attack.bonus")),
  "PV préparés lus au lieu de la source": enveloppe("pvSource", () => a => ({ valeur: a.system.attributes.hp.value, max: a.system.attributes.hp.max, bonus: 0 })),
  "bonus d'effet ignoré au plafond": enveloppe("pvApres", p => (e, n) => p({ ...e, bonus: 0 }, n)),
  "n'importe qui lie le familier": enveloppe("peutLier", () => u => Boolean(u)),
  "MJ refusé": enveloppe("peutLier", p => (u, fam) => !u?.isGM && p(u, fam)),
  "jeton ciblé laissé non lié": enveloppe("majLien", m => (e, r) => ({ ...m(e, r), jeton: null })),
  "drapeau sur la copie synthétique seulement": enveloppe("majLien", m => (e, r) => (e.estJeton && !e.jetonLie ? { acteur: null, jeton: { [`flags.${M}.rodeur`]: r } } : m(e, r))),
  "lien réécrit à l'identique": enveloppe("planFamilier", p => (e, c) => ({ ...p(e, c), effet: e.effet ? { action: "maj", id: e.effet.id } : p(e, c).effet })),
  // Évasion, Fût roulant
  "sort ignoré": enveloppe("rompEvasion", r => o => r(o) && o.objet !== "spell"),
  "jet d'attaque ignoré": enveloppe("rompEvasion", r => o => o.type !== "attack" && r(o)),
  "toute utilisation rompt": enveloppe("rompEvasion", r => o => o.type === "usage" || r(o)),
  "carte d'attaque qui rompt avant le jet": enveloppe("rompEvasion", r => o => (o.type === "usage" && o.activite === "attack") || r(o)),
  "parchemin ignoré": enveloppe("rompEvasion", r => o => o.sousType !== "scroll" && r(o)),
  "repérée par le nom": enveloppe("evasionsAOter", () => e => e.filter(x => x.flags?.[M]?.evasion || /Évasion/.test(x.name ?? "")).map(x => x.id)),
  "réussite au DD exact renversée": enveloppe("metATerre", () => o => o.type === "save" && o.marque === "echec" && !o.resiste && !o.aTerre && !o.immunise && o.rolls.some(r => r.total <= r.options.target)),
  "résistance légendaire ignorée": enveloppe("metATerre", m => o => m({ ...o, resiste: false })),
  "toute sauvegarde renverse": enveloppe("metATerre", m => o => m({ ...o, marque: "echec" })),
  "immunité ignorée": enveloppe("metATerre", m => o => m({ ...o, immunise: false }))
};
const batteries = f => [...batterieAuras(f), ...batterieFamilier(f), ...batterieEvasionFut(f)];

test("capacités : la logique pure des auras, du familier, de l'Évasion et du Fût roulant passe ses batteries", () => {
  assert.deepEqual(batterieAuras(REEL), []);
  assert.deepEqual(batterieFamilier(REEL), []);
  assert.deepEqual(batterieEvasionFut(REEL), []);
});

test("capacités : chaque logique mutée est repérée par une batterie", () => {
  const passees = Object.entries(MUTANTS).filter(([, muter]) => !batteries(muter(REEL)).length).map(([nom]) => nom);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

// ---------------------------------------------------------------- Câblage des drapeaux dans le contenu fabriqué

const DOCS = fabriquer();
const texte = h => String(h ?? "").replace(/<[^>]+>/g, " ");
// Aura de protection du paladin 2024 (classes24, échelle « aura ») : 10 pi au niveau 6, 30 pi au niveau 18.
const AURA_DE_PROTECTION = [[1, 3], [18, 9]];

function verifierCablage(docs, enPartie = CAPACITES_EN_PARTIE) {
  const erreurs = [];
  const doc = cle => docs.find(d => d.cle === cle)?.doc;
  const fl = d => d?.flags?.[M] ?? {};

  const purete = doc("classes:main-d-argent-aura-de-purete");
  const froid = doc("classes:chevalier-aura-de-froid");
  for (const [d, cle] of [[purete, "purete"], [froid, "froid"]]) {
    if (fl(d).aura?.cle !== cle || fl(d).aura?.classe !== "paladin") erreurs.push(`aura ${cle} : capacité non marquée`);
    const sources = (d?.effects ?? []).filter(e => e.flags?.[M]?.aura === cle);
    if (sources.length !== 1 || !sources[0].transfer) erreurs.push(`aura ${cle} : il faut un effet transféré marqué`);
  }
  if (JSON.stringify(fl(purete).aura?.rayons) !== JSON.stringify(AURA_DE_PROTECTION)) erreurs.push("aura de pureté : rayon différent de l'Aura de protection 2024");
  if (fl(purete).aura?.coupure !== "neutralise") erreurs.push("aura de pureté : doit s'éteindre quand le paladin est neutralisé");
  const t = texte(froid?.system.description.value);
  const rayonTexte = Number(/rayon de\s+(\d+(?:,\d+)?) m/.exec(t)?.[1]?.replace(",", "."));
  const ralentiTexte = Number(/réduite de\s+(\d+(?:,\d+)?) m/.exec(t)?.[1]?.replace(",", "."));
  if (JSON.stringify(fl(froid).aura?.rayons) !== JSON.stringify([[1, rayonTexte]])) erreurs.push("aura de froid : rayon différent du texte");
  if (fl(froid).aura?.ralentit !== ralentiTexte) erreurs.push("aura de froid : ralentissement différent du texte");
  if (fl(purete).aura?.ralentit) erreurs.push("aura de pureté : ne ralentit personne");

  const evasion = doc("classes:si-7-evasion");
  const invisible = (evasion?.effects ?? []).filter(e => e.flags?.[M]?.evasion);
  if (invisible.length !== 1 || !invisible[0].statuses.includes("invisible")) erreurs.push("évasion : l'effet d'invisibilité n'est pas marqué");
  if (doc("classes:brasseur-fut-roulant") && fl(doc("classes:brasseur-fut-roulant")).aTerre !== "echec") erreurs.push("fût roulant : capacité non marquée");
  const fut = doc("classes:brasseur-fut-roulant");
  if (!Object.values(fut?.system.activities ?? {}).some(a => a.type === "save" && a.save.ability.includes("dex"))) erreurs.push("fût roulant : plus de sauvegarde de Dextérité");

  const compagnon = doc("classes:familier-compagnon");
  if (fl(compagnon).compagnon !== "rodeur") erreurs.push("familier : capacité Compagnon de chasse non marquée");
  const lier = Object.values(compagnon?.system.activities ?? {}).filter(a => a.flags?.[M]?.lierFamilier);
  if (lier.length !== 1) erreurs.push("familier : il faut une activité « Lier le familier » marquée");
  else if (lier[0].consumption.targets.length) erreurs.push("familier : lier le familier ne doit pas dépenser le rituel");
  const familier = doc("bestiaire:familier-du-chasseur");
  const regle = fl(familier).familier;
  if (!regle) erreurs.push("familier : fiche du bestiaire non marquée");
  else {
    // La fiche de base vaut pour un rôdeur de niveau 3 (bonus +2) : PV, CA 11 + bonus, dégâts 1d8 + Force + bonus.
    const force = Math.floor((familier.system.abilities.str.value - 10) / 2);
    if (regle.classe !== "ranger") erreurs.push("familier : classe du rôdeur");
    if (regle.pvDeBase + regle.pvParNiveau * 3 !== familier.system.attributes.hp.max) erreurs.push("familier : règle de PV différente de la fiche (niveau 3)");
    if (!/5 \+ cinq fois votre niveau de rôdeur/.test(texte(compagnon?.system.description.value)) || regle.pvDeBase !== 5 || regle.pvParNiveau !== 5) erreurs.push("familier : règle de PV différente du texte de la capacité");
    if (11 + regle.maitriseDeBase !== familier.system.attributes.ac.flat) erreurs.push("familier : CA de base sans le bonus compté");
    const crocs = familier.items.find(i => i.type === "weapon");
    if (Number(crocs?.system.damage.base.bonus) !== regle.maitriseDeBase) erreurs.push(`familier : dégâts de base sans le bonus compté (Force ${force})`);
  }

  for (const cle of ["main-d-argent-aura-de-purete", "chevalier-aura-de-froid", "si-7-evasion", "brasseur-fut-roulant", "familier-compagnon"]) {
    if (enPartie[cle]) erreurs.push(`${cle} : encore listée comme faite à la main`);
    if (fl(doc(`classes:${cle}`)).automatisation !== "complete") erreurs.push(`${cle} : automatisation non complète`);
  }
  return erreurs;
}

const copie = () => structuredClone(DOCS);
const de = (D, cle) => D.find(d => d.cle === cle).doc;
const MUTATIONS_CONTENU = {
  "pureté non marquée"(D) { delete de(D, "classes:main-d-argent-aura-de-purete").flags[M].aura; },
  "pureté sans palier du niveau 18"(D) { de(D, "classes:main-d-argent-aura-de-purete").flags[M].aura.rayons = [[1, 3]]; },
  "pureté gardée par un paladin neutralisé"(D) { de(D, "classes:main-d-argent-aura-de-purete").flags[M].aura.coupure = "inconscient"; },
  "effet de froid non marqué"(D) { de(D, "classes:chevalier-aura-de-froid").effects[0].flags = {}; },
  "froid à 4,5 m"(D) { de(D, "classes:chevalier-aura-de-froid").flags[M].aura.rayons = [[1, 4.5]]; },
  "froid qui ne ralentit pas"(D) { delete de(D, "classes:chevalier-aura-de-froid").flags[M].aura.ralentit; },
  "pureté qui ralentit"(D) { de(D, "classes:main-d-argent-aura-de-purete").flags[M].aura.ralentit = 3; },
  "évasion non marquée"(D) { de(D, "classes:si-7-evasion").effects[0].flags = {}; },
  "fût non marqué"(D) { delete de(D, "classes:brasseur-fut-roulant").flags[M].aTerre; },
  "compagnon non marqué"(D) { delete de(D, "classes:familier-compagnon").flags[M].compagnon; },
  "lier qui dépense le rituel"(D) { const a = Object.values(de(D, "classes:familier-compagnon").system.activities).find(x => x.flags?.[M]?.lierFamilier); a.consumption.targets = [{ type: "itemUses", value: "1", target: "" }]; },
  "activité de lien non marquée"(D) { for (const a of Object.values(de(D, "classes:familier-compagnon").system.activities)) a.flags = {}; },
  "familier non marqué"(D) { delete de(D, "bestiaire:familier-du-chasseur").flags[M].familier; },
  "familier à 4 PV par niveau"(D) { de(D, "bestiaire:familier-du-chasseur").flags[M].familier.pvParNiveau = 4; },
  "familier qui compte +3"(D) { de(D, "bestiaire:familier-du-chasseur").flags[M].familier.maitriseDeBase = 3; },
  "capacité automatisée laissée partielle"(D) { de(D, "classes:si-7-evasion").flags[M].automatisation = "partielle"; }
};

test("câblage : les repères des automatismes de capacités sont posés dans le contenu fabriqué", () => {
  assert.deepEqual(verifierCablage(DOCS), []);
});

test("câblage : chaque repère manquant ou faux est repéré", () => {
  const passees = Object.entries(MUTATIONS_CONTENU).filter(([, muter]) => { const D = copie(); muter(D); return !verifierCablage(D).length; }).map(([n]) => n);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
  assert.ok(verifierCablage(DOCS, { ...CAPACITES_EN_PARTIE, "si-7-evasion": "remise à la main" }).length, "liste du MJ qui garde une capacité automatisée");
});
