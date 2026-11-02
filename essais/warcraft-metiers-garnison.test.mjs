// Essais du lot 2 de lakour-warcraft : métiers (composants, recettes, tables de récolte, pages des guides), garnison de
// faction (installations de bastion « facility » de dnd5e 6.0.6), cinq sous-classes nouvelles et le familier du rôdeur.
// Références relevées dans dnd5e.mjs 6.0.6, indépendamment des constructeurs : FacilityData.defineSchema (clés de
// system), CONFIG.DND5E.facilities (sous-types spéciaux, ordres, tailles, niveaux d'accès 5/9/13/17), CONFIG.DND5E.tools.
// La batterie est rejouée sur des copies mutées : chaque règle cassée est détectée.  Lancer : npm run essais
import { test } from "node:test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { fabriquer, TYPE_PACK } from "../outils/fabriquer-warcraft.mjs";
import { METIERS_ARTISANAT, METIERS_RECOLTE, RECETTES } from "../modules/lakour-warcraft/contenu/metiers.mjs";

const M = "lakour-warcraft";
const FABRIQUES = fabriquer();
const CHAMPS_FACILITY = ["activities", "building", "craft", "defenders", "description", "disabled", "enlargeable", "free", "hirelings",
  "identifier", "level", "order", "progress", "size", "source", "trade", "type"];
const SOUS_TYPES_SPECIAUX = ["arcaneStudy", "armory", "barrack", "garden", "library", "sanctuary", "smithy", "storehouse", "workshop", "gamingHall",
  "greenhouse", "laboratory", "sacristy", "scriptorium", "stable", "teleportationCircle", "theater", "trainingArea", "trophyRoom", "archive",
  "meditationChamber", "menagerie", "observatory", "pub", "reliquary", "demiplane", "guildhall", "sanctum", "warRoom"];
const ORDRES = ["build", "change", "craft", "empower", "enlarge", "harvest", "maintain", "recruit", "repair", "research", "trade"];
const TAILLES = ["cramped", "roomy", "vast"];
const OUTILS = ["herb", "smith", "leatherworker", "alchemist", "tinker", "cook"];
const RARETES = ["common", "uncommon", "rare"];
const NOUVELLES_SOUS_CLASSES = { "serment-du-chevalier-de-la-mort": "paladin", "voie-du-chaman-des-totems": "barbarian",
  "voie-du-maitre-brasseur": "monk", "aspect-des-vols": "sorcerer", "chasseur-et-son-familier": "ranger" };
const texte = h => String(h ?? "").replace(/<[^>]+>/g, " ");
// Règles 2024 des installations spéciales (niveau, taille, ordre), relevées indépendamment du contenu.
const REGLES_2024 = { workshop: [5, "roomy", "craft"], smithy: [5, "roomy", "craft"], sanctuary: [5, "roomy", "craft"], barrack: [5, "roomy", "recruit"],
  armory: [5, "roomy", "trade"], garden: [5, "roomy", "harvest"], library: [5, "roomy", "research"], storehouse: [5, "roomy", "trade"],
  greenhouse: [9, "roomy", "harvest"], stable: [9, "roomy", "trade"], laboratory: [9, "roomy", "craft"], trainingArea: [9, "vast", "empower"],
  warRoom: [17, "vast", "recruit"] };
// dnd5e 6.0.6, CONFIG.DND5E.crafting.mundane : jours = ⌈prix × 0,1⌉, po = ⌊prix × 0,5⌋ (prix en po).
const TAUX = { pp: 10, gp: 1, ep: 0.5, sp: 0.1, cp: 0.01 };
const prixPo = o => (o.system.price?.value ?? 0) * (TAUX[o.system.price?.denomination] ?? 1);
const CREDITS = readFileSync(new URL(`../modules/${M}/CREDITS.md`, import.meta.url), "utf8");
const uuidDe = d => `Compendium.${M}.${d.pack}.${TYPE_PACK[d.pack]}.${d.doc._id}`;

function verifier({ docs, recettes, credits = CREDITS }) {
  const erreurs = [];
  const parCle = new Map(docs.map(d => [d.cle, d.doc]));
  const parUuid = new Map(docs.map(d => [uuidDe(d), d]));
  const objets = docs.filter(d => d.pack === "objets").map(d => d.doc);

  // Composants
  const composants = objets.filter(o => METIERS_RECOLTE[o.flags[M].metier]);
  if (composants.length < 12) erreurs.push(`${composants.length} composants seulement`);
  for (const c of composants) {
    if (c.type !== "loot" || c.system.type.value !== "material") erreurs.push(`${c.name} : pas un butin « material »`);
    if (!RARETES.includes(c.system.rarity)) erreurs.push(`${c.name} : qualité « ${c.system.rarity} »`);
  }
  for (const m of Object.keys(METIERS_RECOLTE)) if (!composants.some(c => c.flags[M].metier === m)) erreurs.push(`aucun composant de ${m}`);
  for (const q of RARETES) if (!composants.some(c => c.system.rarity === q)) erreurs.push(`aucun composant ${q}`);

  // Tables de récolte : chaque composant se trouve quelque part, chaque résultat document est un composant.
  const tables = docs.filter(d => d.pack === "tables" && d.cle.startsWith("tables:recolte-")).map(d => d.doc);
  if (tables.length < 4) erreurs.push(`${tables.length} tables de récolte`);
  const recoltables = new Set();
  for (const t of tables) for (const r of t.results.filter(r => r.type === "document")) {
    const cible = parUuid.get(r.documentUuid)?.doc;
    if (!cible || !METIERS_RECOLTE[cible.flags[M].metier]) erreurs.push(`${t.name} : résultat qui n'est pas un composant`);
    else recoltables.add(cible._id);
  }
  for (const c of composants) if (!recoltables.has(c._id)) erreurs.push(`${c.name} : introuvable dans les tables de récolte`);

  // Recettes et journal des recettes
  const journal = parCle.get("journaux:recettes-d-artisanat");
  if (!journal || journal.ownership.default !== 2) erreurs.push("journal des recettes absent ou caché");
  for (const [metier, liste] of Object.entries(recettes)) {
    const outil = METIERS_ARTISANAT[metier]?.outilDnd;
    if (!OUTILS.includes(outil)) erreurs.push(`${metier} : outil « ${outil} » inconnu de dnd5e`);
    const page = journal?.pages.find(p => p.name === METIERS_ARTISANAT[metier]?.nom);
    if (!page) { erreurs.push(`${metier} : pas de page de recettes`); continue; }
    for (const [produit, comps, dd] of liste) {
      const p = parCle.get(`objets:${produit}`);
      if (!p) { erreurs.push(`${produit} : produit inconnu`); continue; }
      // Économie : composants au prix du marchand ≤ moitié du prix ; fournitures annoncées = ce qui complète la moitié.
      const valeur = comps.reduce((n, [c, k]) => n + (parCle.has(`objets:${c}`) ? prixPo(parCle.get(`objets:${c}`)) * k : 0), 0);
      if (valeur > prixPo(p) / 2 + 1e-9) erreurs.push(`${produit} : composants (${valeur} po) au-delà de la moitié du prix (${prixPo(p)} po)`);
      const fournitures = Math.max(0, Math.ceil(prixPo(p) / 2 - valeur - 1e-9));
      const ligne = page.text.content.split("<li>").find(l => l.includes(`Item.${p._id}]`)) ?? "";
      if (!ligne.includes(`; ${fournitures} po de fournitures`)) erreurs.push(`${produit} : fournitures annoncées fausses (attendu ${fournitures} po)`);
      if (p.system.rarity === "rare" && !comps.some(([c]) => parCle.get(`objets:${c}`)?.system.rarity === "rare")) erreurs.push(`${produit} : objet rare sans composant rare`);
      if (!page.text.content.includes(`@UUID[Compendium.${M}.objets.Item.${p._id}]`)) erreurs.push(`${produit} : non lié depuis la page ${metier}`);
      if (!(dd >= 10 && dd <= 20)) erreurs.push(`${produit} : DD ${dd}`);
      if (!page.text.content.includes(`[[/check tool=${outil} dc=${dd}]]`)) erreurs.push(`${produit} : test d'outil cliquable absent`);
      for (const [c, n] of comps) {
        const doc = parCle.get(`objets:${c}`);
        if (!doc || !METIERS_RECOLTE[doc.flags[M].metier]) erreurs.push(`${produit} : composant « ${c} » inconnu`);
        if (!(Number.isInteger(n) && n > 0)) erreurs.push(`${produit} : quantité ${n}`);
      }
    }
  }

  const utilises = new Set(Object.values(recettes).flat().flatMap(([, comps]) => comps.map(([c]) => c)));
  for (const c of composants) if (!utilises.has(c.flags[M].cle)) erreurs.push(`${c.name} : récolté mais utilisé par aucune recette`);

  // Pages des guides
  const pageDe = (cle, titre) => parCle.get(`journaux:${cle}`)?.pages.some(p => p.name === titre);
  if (!pageDe("guide-du-joueur", "Métiers d'Azeroth")) erreurs.push("guide du joueur sans page des métiers");
  if (!pageDe("guide-du-mj", "Métiers : récolte et artisanat (MJ)")) erreurs.push("guide du MJ sans page des métiers");
  if (!pageDe("guide-du-mj", "Garnison de faction (MJ)")) erreurs.push("guide du MJ sans page de la garnison");

  // Installations de bastion
  const installations = objets.filter(o => o.type === "facility");
  if (installations.length < 4 || installations.length > 6) erreurs.push(`${installations.length} installations (4 à 6)`);
  for (const f of installations) {
    const s = f.system;
    if (Object.keys(s).sort().join() !== CHAMPS_FACILITY.join()) erreurs.push(`${f.name} : clés system hors du schéma FacilityData`);
    if (s.type?.value !== "special" || !SOUS_TYPES_SPECIAUX.includes(s.type.subtype)) erreurs.push(`${f.name} : type ${s.type?.value}/${s.type?.subtype}`);
    if (!ORDRES.includes(s.order) || !TAILLES.includes(s.size) || s.building?.size !== s.size) erreurs.push(`${f.name} : ordre ou taille`);
    if (![5, 9, 13, 17].includes(s.level)) erreurs.push(`${f.name} : niveau ${s.level}`);
    if (!(Number.isInteger(s.hirelings?.max) && s.hirelings.max > 0)) erreurs.push(`${f.name} : employés`);
    if (s.craft?.item && parUuid.get(s.craft.item)?.pack !== "objets") erreurs.push(`${f.name} : objet fabriqué introuvable`);
    if (s.order === "craft" && !s.craft?.item) erreurs.push(`${f.name} : atelier sans objet de fabrication`);
    const regle = REGLES_2024[s.type?.subtype];
    if (!regle || regle[0] !== s.level || regle[1] !== s.size || regle[2] !== s.order) erreurs.push(`${f.name} : ${s.type?.subtype} hors des règles 2024 (niveau, taille, ordre)`);
    // Coût et délai annoncés d'un ordre de fabrication : ceux que dnd5e calcule pour un objet ordinaire.
    for (const [, id, po, jours] of s.description.value.matchAll(/Item\.([A-Za-z0-9]{16})\]\{[^}]+\} : (\d+) po et (\d+) jours?/g)) {
      const o = objets.find(x => x._id === id);
      if (!o || o.system.properties.includes("mgc")) { erreurs.push(`${f.name} : coût annoncé pour un objet magique ou inconnu`); continue; }
      if (Number(po) !== Math.floor(prixPo(o) * 0.5) || Number(jours) !== Math.ceil(prixPo(o) * 0.1)) erreurs.push(`${f.name} : coût de ${o.name} faux (${po} po, ${jours} j)`);
    }
    if (/dés de vie/.test(texte(s.description.value))) erreurs.push(`${f.name} : promet des dés de vie, déjà rendus par le repos long de 2024`);
  }
  const missions = parCle.get("tables:missions-des-suivants");
  if (missions) {
    const bonus = Number(/Ajoutez (\d+) au jet/.exec(missions.description)?.[1] ?? 0);
    const max = Math.max(...missions.results.map(r => r.range[1]));
    if (max !== Number(missions.formula.slice(2)) + bonus) erreurs.push(`missions : la table s'arrête à ${max} malgré le bonus de ${bonus}`);
    if (missions.results.some(r => /jusqu'à en obtenir/.test(texte(r.description)))) erreurs.push("missions : relance sans fin possible");
  }
  const garnison = parCle.get("journaux:garnison-de-faction");
  if (!garnison || garnison.ownership.default !== 2) erreurs.push("journal de la garnison absent ou caché");
  else for (const f of installations) if (!JSON.stringify(garnison.pages).includes(f._id)) erreurs.push(`${f.name} : non lié depuis le journal de la garnison`);

  // Sous-classes et familier
  for (const [cle, classe] of Object.entries(NOUVELLES_SOUS_CLASSES)) {
    const sc = parCle.get(`classes:${cle}`);
    if (!sc || sc.system.classIdentifier !== classe) erreurs.push(`sous-classe ${cle} absente ou d'une autre classe`);
  }
  for (const sc of docs.filter(d => d.pack === "classes" && d.doc.type === "subclass").map(d => d.doc)) {
    for (const a of Object.values(sc.system.advancement)) if (a.type === "Trait" && a.configuration.allowReplacements !== true) erreurs.push(`${sc.name} : maîtrise sans remplacement possible`);
  }
  const sortsDk = Object.values(parCle.get("classes:serment-du-chevalier-de-la-mort")?.system.advancement ?? {}).find(a => a.configuration?.spell && a.level === 3);
  if ((sortsDk?.configuration.items.length ?? 0) < 2) erreurs.push("chevalier de la mort : moins de deux sorts de serment au niveau 3");
  const ecailles = parCle.get("classes:aspect-ecailles-de-l-ancetre")?.effects[0]?.system.changes[0];
  if (ecailles?.key !== "system.attributes.hp.bonuses.overall" || ecailles.value !== "@classes.sorcerer.levels") erreurs.push("écailles de l'ancêtre : PV hors du niveau d'ensorceleur");
  const ivresse = parCle.get("classes:brasseur-ivresse-du-sage");
  if (!ivresse || !Object.keys(ivresse.system.activities).length || !ivresse.system.uses.max) erreurs.push("ivresse du sage : capacité de niveau 17 sans activité");
  const pierre = parCle.get("objets:pierre-a-aiguiser-de-rouge-veine");
  if (pierre?.effects[0]?.flags?.[M]?.unique !== "lame-affutee") erreurs.push("pierre à aiguiser cumulable");
  if (parCle.get("objets:lunette-de-visee-gnome")?.system.attunement !== "required") erreurs.push("lunette de visée sans harmonisation");
  if (!/SRD 5\.1/.test(credits) || !/CC BY 4\.0/.test(credits)) erreurs.push("crédits : SRD 5.1 non cité");

  const familier = parCle.get("bestiaire:familier-du-chasseur");
  const compagnon = parCle.get("classes:familier-compagnon");
  if (!familier || !compagnon || !texte(compagnon.system.description.value).includes(familier.name)) erreurs.push("familier du chasseur absent ou non cité par sa capacité");
  // Dégâts du familier : 1d8 + Force + 2 (bonus de maîtrise compté, comme le dit sa fiche).
  const crocs = familier?.items.find(i => i.name === "Crocs et griffes");
  const part = crocs && Object.values(crocs.system.activities)[0].damage.parts[0];
  const force = Math.floor((familier?.system.abilities.str.value - 10) / 2);
  if (!part || Number(part.bonus) !== force + 2) erreurs.push("familier : dégâts sans le bonus de maîtrise annoncé");
  return erreurs;
}

const contexte = () => ({ docs: structuredClone(FABRIQUES), recettes: structuredClone(RECETTES), credits: CREDITS });
const doc = (C, cle) => C.docs.find(d => d.cle === cle).doc;
const MUTATIONS = {
  "composant sans qualité"(C) { doc(C, "objets:herbe-a-fievre").system.rarity = ""; },
  "composant introuvable à la récolte"(C) { for (const d of C.docs.filter(x => x.cle.startsWith("tables:recolte-"))) d.doc.results = d.doc.results.filter(r => !r.documentUuid?.endsWith(doc(C, "objets:veine-de-mithril")._id)); },
  "recette vers un produit inconnu"(C) { C.recettes.forge.push(["epee-en-chocolat", [["minerai-de-cuivre", 1]], 12, "1 heure", 1]); },
  "recette à DD absurde"(C) { C.recettes.cuisine[0][2] = 3; },
  "recette à composant inconnu"(C) { C.recettes.alchimie[0][1].push(["bave-de-murloc", 1]); },
  "guide du joueur sans page des métiers"(C) { const g = doc(C, "journaux:guide-du-joueur"); g.pages = g.pages.filter(p => p.name !== "Métiers d'Azeroth"); },
  "installation hors schéma"(C) { doc(C, "objets:atelier-gobelin").system.atelier = true; },
  "installation de sous-type inconnu"(C) { doc(C, "objets:forge-de-garnison").system.type.subtype = "forge"; },
  "installation à un niveau interdit"(C) { doc(C, "objets:enclos-a-montures").system.level = 7; },
  "atelier sans objet fabriqué"(C) { doc(C, "objets:autel-des-esprits").system.craft.item = null; },
  "sous-classe changée de classe"(C) { doc(C, "classes:voie-du-maitre-brasseur").system.classIdentifier = "fighter"; },
  "recette trop chère en composants"(C) { C.recettes.ingenierie[0][1] = [["minerai-de-cuivre", 1], ["chardon-cendre", 1]]; },
  "objet rare sans composant rare"(C) { C.recettes.alchimie.find(r => r[0] === "flacon-des-titans-de-pierre")[1] = [["chardon-cendre", 2]]; },
  "composant inutilisé"(C) { C.recettes.forge = C.recettes.forge.filter(r => r[0] !== "gantelets-ignifuges-du-contremaitre"); },
  "fournitures annoncées fausses"(C) { const p = doc(C, "journaux:recettes-d-artisanat").pages[1]; p.text.content = p.text.content.replace("; 3 po de fournitures", "; 30 po de fournitures"); },
  "écurie hors des règles 2024"(C) { const s = doc(C, "objets:enclos-a-montures").system; s.size = "vast"; s.building.size = "vast"; },
  "coût de fabrication faux"(C) { const d = doc(C, "objets:forge-de-garnison").system.description; d.value = d.value.replace(/ : (\d+) po et/, " : 99 po et"); },
  "autel qui rend les dés de vie"(C) { doc(C, "objets:autel-des-esprits").system.description.value += "<p>Tous ses dés de vie.</p>"; },
  "exploit hors d'atteinte du bonus"(C) { doc(C, "tables:missions-des-suivants").results.at(-1).range = [8, 8]; },
  "trouvaille sans fin"(C) { doc(C, "tables:missions-des-suivants").results[5].description = "<p>Relancez jusqu'à en obtenir un.</p>"; },
  "maîtrise sans remplacement"(C) { const a = Object.values(doc(C, "classes:aspect-des-vols").system.advancement).find(x => x.type === "Trait"); a.configuration.allowReplacements = false; },
  "serment à un seul sort"(C) { const a = Object.values(doc(C, "classes:serment-du-chevalier-de-la-mort").system.advancement).find(x => x.configuration?.spell && x.level === 3); a.configuration.items.pop(); },
  "écailles au niveau total"(C) { doc(C, "classes:aspect-ecailles-de-l-ancetre").effects[0].system.changes[0].key = "system.attributes.hp.bonuses.level"; },
  "pierre cumulable"(C) { doc(C, "objets:pierre-a-aiguiser-de-rouge-veine").effects[0].flags = {}; },
  "lunette sans harmonisation"(C) { doc(C, "objets:lunette-de-visee-gnome").system.attunement = ""; },
  "familier sans maîtrise aux dégâts"(C) { Object.values(doc(C, "bestiaire:familier-du-chasseur").items.find(i => i.name === "Crocs et griffes").system.activities)[0].damage.parts[0].bonus = "2"; },
  "crédits sans le SRD 5.1"(C) { C.credits = C.credits.replaceAll("SRD 5.1", "SRD"); }
};

test("lot 2 : métiers, garnison, sous-classes et familier passent la batterie", () => {
  assert.deepEqual(verifier(contexte()), []);
});

test("lot 2 : chaque règle cassée est détectée", () => {
  const passees = Object.entries(MUTATIONS).filter(([, muter]) => { const C = contexte(); muter(C); return !verifier(C).length; }).map(([n]) => n);
  assert.deepEqual(passees, [], "mutations passées inaperçues");
});

test("lot 2 : sept métiers, vingt-trois recettes au moins, six installations", () => {
  assert.equal(Object.keys(METIERS_RECOLTE).length + Object.keys(METIERS_ARTISANAT).length, 7);
  assert.ok(Object.values(RECETTES).flat().length >= 23);
  assert.equal(FABRIQUES.filter(d => d.doc.type === "facility").length, 6);
});
