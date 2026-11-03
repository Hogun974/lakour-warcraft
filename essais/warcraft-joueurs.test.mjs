// Essais du contenu joueurs de lakour-warcraft : peuples et traits, historiques et dons, objets, guides et tables.
// Formes dnd5e 6.0.6 (règles 2024), clés connues du système, références résolues, visibilité des journaux.
// Chaque règle est vérifiée deux fois : sur les documents fabriqués (verifier) et à la construction (les
// constructeurs de contenu/objets.mjs lèvent une erreur). Aucun réseau.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { fabriquer, TYPE_PACK } from "../outils/fabriquer-warcraft.mjs";
import { icone } from "../modules/lakour-warcraft/contenu/aides.mjs";
import {
  CARACTERISTIQUES, COMPETENCES, TAILLES, DOMMAGES, SOINS, DONS_SRD, cleTrait,
  peuple, trait, historique, don, arme, consommable, equipement
} from "../modules/lakour-warcraft/contenu/objets.mjs";
import { FACTIONS } from "../modules/lakour-warcraft/contenu/peuples.mjs";

const MODULE = "lakour-warcraft";
const PACKS_JOUEURS = ["peuples", "historiques", "objets", "journaux", "tables"];
const docs = fabriquer().filter(d => PACKS_JOUEURS.includes(d.pack));
const uuidDe = (pack, doc) => `Compendium.${MODULE}.${pack}.${TYPE_PACK[pack]}.${doc._id}`;
const tous = docs.map(d => ({ ...d.doc, __pack: d.pack }));
const avancements = d => Object.values(d.system?.advancement ?? {});
const UUID_DND5E = /^Compendium\.dnd5e\.(feats24|spells24|equipment24|origins24)\.Item\.[A-Za-z0-9]{16}$/;

// ---------------------------------------------------------------- Vérificateur des documents fabriqués
// Renvoie la liste des erreurs (vide si tout va bien). Utilisé sur le vrai contenu et sur des copies cassées.
function verifier(liste) {
  const erreurs = [];
  const err = (d, m) => erreurs.push(`${d.name} : ${m}`);
  const index = new Map(liste.map(d => [uuidDe(d.__pack, d), d]));
  const cible = u => index.get(u);
  const cleValide = (d, k) => { try { cleTrait(k); } catch { err(d, `clé de maîtrise « ${k} » inconnue`); } };

  for (const d of liste) {
    if (d._id !== d._key?.split("!")[2]) err(d, "_key et _id ne correspondent pas");
    if (!d.flags?.[MODULE]?.cle) err(d, "flags.lakour-warcraft.cle manquant");
    for (const e of d.effects ?? []) {
      if (e._key !== `!items.effects!${d._id}.${e._id}`) err(d, `clé d'effet « ${e._key} » incorrecte`);
      for (const c of e.system.changes) if (!c.type || c.phase !== "initial") err(d, `changement d'effet sans type ni phase (${c.key})`);
    }
    // Activités : types de dommages, de soins, caractéristiques de sauvegarde, effets cités.
    for (const a of Object.values(d.system?.activities ?? {})) {
      for (const p of a.damage?.parts ?? []) for (const t of p.types) if (!DOMMAGES.includes(t)) err(d, `type de dommages « ${t} » inconnu`);
      for (const t of a.healing?.types ?? []) if (!SOINS.includes(t)) err(d, `type de soin « ${t} » inconnu`);
      for (const c of a.save?.ability ?? []) if (!CARACTERISTIQUES.includes(c)) err(d, `sauvegarde de « ${c} » inconnue`);
      for (const e of a.effects ?? []) if (!d.effects.some(x => x._id === e._id)) err(d, `l'activité cite un effet absent (${e._id})`);
    }
    for (const t of d.system?.damage?.base?.types ?? []) if (!DOMMAGES.includes(t)) err(d, `type de dommages « ${t} » inconnu`);
    // Avancements : clés de maîtrise et uuid accordés.
    for (const a of avancements(d)) {
      if (a.type === "Trait") for (const k of [...a.configuration.grants, ...a.configuration.choices.flatMap(c => c.pool)]) cleValide(d, k);
      if (a.type === "ItemGrant" || a.type === "ItemChoice") {
        for (const { uuid } of a.configuration.items ?? a.configuration.pool) {
          if (uuid.startsWith(`Compendium.${MODULE}.`) ? !cible(uuid) : !UUID_DND5E.test(uuid)) err(d, `uuid accordé introuvable : ${uuid}`);
        }
      }
    }

    if (d.type === "race") {
      const taille = avancements(d).filter(a => a.type === "Size");
      if (taille.length !== 1) err(d, "il faut exactement un avancement Size");
      for (const s of taille[0]?.configuration.sizes ?? []) if (!TAILLES.includes(s)) err(d, `taille « ${s} » inconnue`);
      const octrois = avancements(d).filter(a => a.type === "ItemGrant" && !a.configuration.spell);
      if (octrois.length !== 1) err(d, "il faut exactement un ItemGrant de traits");
      const traits = (octrois[0]?.configuration.items ?? []).map(i => cible(i.uuid));
      if (traits.length < 2 || traits.length > 4) err(d, `${traits.length} traits (2 à 4 attendus)`);
      for (const t of traits) if (!t || t.type !== "feat" || t.system.type.value !== "race" || t.system.requirements !== d.name) err(d, "un trait accordé n'est pas un trait de ce peuple");
      if (!/^\d+(\.\d+)?$/.test(d.system.movement.walk) || d.system.movement.units !== "m") err(d, "vitesse au sol absente ou pas en mètres");
      if (![null, 18, 36].includes(d.system.senses.ranges.darkvision) || d.system.senses.units !== "m") err(d, "vision dans le noir inattendue ou pas en mètres");
      if (d.system.type.value !== "humanoid") err(d, "un peuple jouable est humanoïde");
    }

    if (d.type === "background") {
      const asi = avancements(d).filter(a => a.type === "AbilityScoreImprovement");
      if (asi.length !== 1) err(d, "il faut exactement un ASI");
      const c = asi[0]?.configuration;
      const libres = CARACTERISTIQUES.filter(k => !c?.locked.includes(k));
      if (c?.points !== 3 || c?.cap !== 2 || libres.length !== 3 || c.locked.some(k => !CARACTERISTIQUES.includes(k))) err(d, "ASI : trois caractéristiques valides, 3 points, +2 au plus");
      const maitrises = avancements(d).find(a => a.type === "Trait" && a.configuration.grants.some(k => k.startsWith("skills:")));
      const competences = (maitrises?.configuration.grants ?? []).filter(k => k.startsWith("skills:")).map(k => k.split(":")[1]);
      if (competences.length !== 2 || competences.some(k => !COMPETENCES.includes(k))) err(d, `compétences invalides : ${competences.join(", ")}`);
      const outils = [...(maitrises?.configuration.grants ?? []), ...(maitrises?.configuration.choices ?? []).flatMap(x => x.pool)].filter(k => k.startsWith("tool:"));
      if (outils.length < 1) err(d, "aucun outil");
      const donAccorde = avancements(d).find(a => a.type === "ItemGrant")?.configuration.items[0]?.uuid;
      const donMaison = donAccorde && cible(donAccorde);
      if (!donAccorde || !(Object.values(DONS_SRD).includes(donAccorde) || donMaison?.system.type.subtype === "origin")) err(d, "pas de don d'origine valide");
      for (const e of d.system.startingEquipment.filter(e => e.type === "linked")) {
        if (e.key.startsWith(`Compendium.${MODULE}.`) ? !cible(e.key) : !UUID_DND5E.test(e.key)) err(d, `équipement introuvable : ${e.key}`);
      }
    }
  }
  return erreurs;
}

test("le contenu joueurs passe toutes les vérifications", () => {
  assert.deepEqual(verifier(tous), []);
});

// ---------------------------------------------------------------- Peuples

test("treize peuples jouables, six par faction et le pandaren à part", () => {
  const races = tous.filter(d => d.type === "race");
  assert.equal(races.length, 13);
  const cles = new Set(races.map(r => r.flags[MODULE].cle));
  for (const [faction, liste] of Object.entries(FACTIONS)) for (const c of liste) assert.ok(cles.has(c), `${c} (${faction}) absent`);
  assert.deepEqual([FACTIONS.alliance.length, FACTIONS.horde.length, FACTIONS.neutre.length], [6, 6, 1]);
});

test("chaque trait de peuple est accordé par exactement un peuple", () => {
  const accordes = tous.filter(d => d.type === "race").flatMap(r =>
    avancements(r).filter(a => a.type === "ItemGrant" && !a.configuration.spell).flatMap(a => a.configuration.items.map(i => i.uuid)));
  const traits = tous.filter(d => d.type === "feat" && d.system.type.value === "race");
  assert.equal(new Set(accordes).size, accordes.length, "un trait est accordé deux fois");
  assert.deepEqual(new Set(accordes), new Set(traits.map(t => uuidDe("peuples", t))));
});

test("les traits à usages limités ont une activité qui consomme ces usages", () => {
  for (const t of tous.filter(d => d.type === "feat" && d.system.uses.max)) {
    const activites = Object.values(t.system.activities);
    assert.ok(activites.length, `${t.name} : usages sans activité`);
    assert.ok(activites.some(a => a.consumption.targets.some(c => c.type === "itemUses")), `${t.name} : aucune activité ne consomme d'usage`);
    assert.ok(["lr", "sr"].includes(t.system.uses.recovery[0]?.period), `${t.name} : récupération inattendue`);
  }
});

// ---------------------------------------------------------------- Historiques et dons

test("dix historiques, chacun avec ASI, deux compétences, un outil, un don d'origine et des langues", () => {
  const historiques = tous.filter(d => d.type === "background");
  assert.equal(historiques.length, 10);
  for (const h of historiques) {
    const types = avancements(h).map(a => a.type);
    assert.deepEqual(types.toSorted(), ["AbilityScoreImprovement", "ItemGrant", "Trait", "Trait"], h.name);
    assert.ok(avancements(h).some(a => a.type === "Trait" && [...a.configuration.grants, ...a.configuration.choices.flatMap(c => c.pool)].some(k => k.startsWith("languages:"))), `${h.name} : pas de langues`);
    assert.ok(h.system.startingEquipment.length > 1 && Number(h.system.wealth) === 50, `${h.name} : équipement de départ incomplet`);
  }
});

test("les dons du module sont des dons d'origine, et les historiques en utilisent du SRD comme du module", () => {
  const dons = tous.filter(d => d.type === "feat" && d.system.type.value === "feat");
  assert.ok(dons.length >= 4);
  for (const d of dons) assert.equal(d.system.type.subtype, "origin", d.name);
  const accordes = tous.filter(d => d.type === "background").map(h => avancements(h).find(a => a.type === "ItemGrant").configuration.items[0].uuid);
  assert.ok(accordes.some(u => u.startsWith("Compendium.dnd5e.feats24.")), "aucun don du SRD");
  assert.ok(accordes.some(u => u.startsWith(`Compendium.${MODULE}.historiques.`)), "aucun don du module");
});

// ---------------------------------------------------------------- Objets

test("entre 15 et 20 objets, dont la pierre de foyer, des potions, des armes, des armures et des objets peu communs", () => {
  // L'arsenal (contenu/arsenal.mjs, essais/warcraft-arsenal.test.mjs) partage le compendium : il est compté à part.
  // Les suppléments (consommables, butin du donjon et des rares) sont rangés dans leur collection et comptés à part.
  const objets = tous.filter(d => d.__pack === "objets" && !d.flags?.["lakour-warcraft"]?.arsenal && !d.flags?.["lakour-warcraft"]?.collection);
  assert.ok(objets.length >= 15 && objets.length <= 20, `${objets.length} objets`);
  assert.ok(objets.some(o => o.flags[MODULE].cle === "pierre-de-foyer"));
  for (const type of ["weapon", "equipment", "consumable", "loot"]) assert.ok(objets.some(o => o.type === type), `aucun ${type}`);
  assert.ok(objets.filter(o => o.system.type.value === "potion").length >= 3, "pas assez de potions");
  assert.ok(objets.filter(o => o.system.rarity === "uncommon" && o.system.properties.includes("mgc")).length >= 3, "pas assez d'objets magiques peu communs");
  for (const a of objets.filter(o => o.type === "weapon")) assert.ok(Object.values(a.system.activities).some(x => x.type === "attack"), `${a.name} : pas d'attaque`);
  for (const a of objets.filter(o => ["light", "medium", "heavy", "shield"].includes(o.system.type.value))) assert.ok(a.system.armor.value > 0, `${a.name} : CA manquante`);
});

// ---------------------------------------------------------------- Journaux et tables

test("le guide du joueur est visible, le guide du MJ caché", () => {
  const journaux = new Map(tous.filter(d => d.__pack === "journaux").map(j => [j.name, j]));
  assert.equal(journaux.get("Guide du joueur — Azeroth")?.ownership.default, 2);
  assert.equal(journaux.get("Guide du MJ — Azeroth")?.ownership.default, 0);
  for (const j of journaux.values()) for (const p of j.pages) assert.ok(p.text.content.length > 200, `${j.name} / ${p.name} : page vide`);
  const joueur = JSON.stringify(journaux.get("Guide du joueur — Azeroth"));
  for (const mot of ["Troisième Guerre", "Horde", "Alliance", "Kalimdor", "Occultiste", "Druide"]) assert.ok(joueur.includes(mot), `guide du joueur : « ${mot} » absent`);
});

test("les tables couvrent toute leur formule, sans trou ni chevauchement, et leurs documents existent", () => {
  // Les tables des rares tirent un PNJ du bestiaire (compendium du MJ) : la cible se cherche dans tous les compendiums.
  const uuids = new Set(fabriquer().map(({ pack, doc }) => uuidDe(pack, doc)));
  const tables = tous.filter(d => d.__pack === "tables");
  // Sept tables génériques, la table propre au one-shot « Une nuit aux Deux Lanternes », et celles des suppléments :
  // butin des trois boss du donjon, contrats des trois villes, rares des trois zones, récolte des quatre biomes, missions de la garnison,
  // et les fêtes de saison (contrats de chacune des cinq fêtes, paquets-surprises de la Trêve des Présents).
  assert.deepEqual(tables.map(t => t.flags["lakour-warcraft"].cle).sort(), ["bruits-de-la-nuit", "butin-baron-nizzel", "butin-grokka-deux-cles",
    "butin-mere-brasier", "complications", "contrats-cabestan", "contrats-le-carrefour", "contrats-theramore",
    "fete-mascarade-de-cabestan-contrats", "fete-nuit-des-calebasses-contrats", "fete-tambours-du-long-jour-contrats",
    "fete-treve-des-presents-contrats", "fete-treve-des-presents-paquets", "fete-veille-des-aieux-contrats", "missions-des-suivants", "noms-par-peuple",
    "rares-cote-des-tarides", "rares-frontiere-du-sud", "rares-nord-des-tarides", "recolte-collines-rouges", "recolte-cote-et-criques",
    "recolte-marais-d-aprefange", "recolte-plaines-des-tarides", "rencontres-sur-la-route", "rumeurs-de-taverne",
    "temps-et-chemins", "trouvailles", "visages-d-azeroth"]);
  for (const t of tables) {
    const max = Number(/^1d(\d+)$/.exec(t.formula)?.[1]);
    let attendu = 1;
    for (const r of t.results.toSorted((a, b) => a.range[0] - b.range[0])) {
      assert.equal(r.range[0], attendu, `${t.name} : trou ou chevauchement en ${attendu}`);
      attendu = r.range[1] + 1;
      if (r.type === "document") assert.ok(uuids.has(r.documentUuid), `${t.name} : ${r.documentUuid} introuvable`);
    }
    // Une table dont la description ajoute un bonus au jet (« Ajoutez 1 au jet… ») doit couvrir le résultat majoré.
    const bonus = Number(/Ajoutez (\d+) au jet/.exec(t.description)?.[1] ?? 0);
    assert.equal(attendu - 1, max + bonus, `${t.name} : s'arrête à ${attendu - 1} au lieu de ${max + bonus}`);
  }
});

test("toutes les références du module sont résolues et pointent vers un document existant", () => {
  // Cibles : tous les compendiums (les journaux du MJ lient aussi le bestiaire et les scènes).
  const uuids = new Set(fabriquer().map(({ pack, doc }) => uuidDe(pack, doc)));
  const texte = JSON.stringify(docs.map(d => d.doc));
  assert.ok(!texte.includes("__ref") && !texte.includes("__cle"), "référence ou clé interne non résolue");
  const cites = texte.match(/Compendium\.lakour-warcraft\.[a-z]+\.[A-Za-z]+\.[A-Za-z0-9]{16}/g) ?? [];
  assert.ok(cites.length > 50);
  for (const u of cites) assert.ok(uuids.has(u), `uuid inconnu : ${u}`);
});

test("les clés de compendium sont uniques, y compris pour les effets et les pages", () => {
  const cles = tous.flatMap(d => [d._key, ...(d.effects ?? []).map(e => e._key), ...(d.pages ?? []).map(p => p._key), ...(d.results ?? []).map(r => r._key)]);
  assert.equal(new Set(cles).size, cles.length);
});

// ---------------------------------------------------------------- Mutations : un document faux est refusé

const premier = (liste, filtre) => {
  const d = liste.find(filtre);
  assert.ok(d, "aucun document à casser");
  return d;
};

test("le vérificateur refuse des documents fabriqués volontairement faux (mutation)", () => {
  const casse = structuredClone(tous);
  const race = premier(casse, d => d.type === "race" && d.name === "Tauren");
  avancements(race).find(a => a.type === "Size").configuration.sizes = ["medium"];
  avancements(race).find(a => a.type === "ItemGrant").configuration.items[0].uuid = `Compendium.${MODULE}.peuples.Item.AAAAAAAAAAAAAAAA`;
  const fond = premier(casse, d => d.type === "background" && d.name === "Soldat de Hurlevent");
  avancements(fond).find(a => a.type === "AbilityScoreImprovement").configuration.locked = ["int", "wis"];
  avancements(fond).find(a => a.type === "Trait").configuration.grants[0] = "skills:athletisme";
  const bombe = premier(casse, d => d.name === "Bombe gobeline");
  Object.values(bombe.system.activities)[0].damage.parts[0].types = ["feu"];
  const reprouve = premier(casse, d => d.name === "Corps sans vie");
  reprouve.effects.push({ _id: "x", _key: "!items.effects!faux.x", system: { changes: [] } });
  const erreurs = verifier(casse);
  for (const motif of [/Tauren : taille « medium »/, /Tauren : uuid accordé introuvable/, /Soldat de Hurlevent : ASI/, /clé de maîtrise « skills:athletisme »/,
    /Soldat de Hurlevent : compétences invalides/, /Bombe gobeline : type de dommages « feu »/, /Corps sans vie : clé d'effet/]) {
    assert.ok(erreurs.some(e => motif.test(e)), `non détecté : ${motif}`);
  }
});

test("les constructeurs refusent un contenu faux dès la construction (mutation)", () => {
  const img = icone("svg/mystery-man");
  const unTrait = cle => trait({ cle, nom: cle, peuple: "Essai", img, texte: "" });
  const deuxTraits = [unTrait("essai-a"), unTrait("essai-b")];
  const base = { cle: "essai", nom: "Essai", img, vitesse: 9, vision: 18, traits: deuxTraits };
  assert.doesNotThrow(() => peuple(base));
  assert.throws(() => peuple({ ...base, taille: ["medium"] }), /taille « medium »/);
  assert.throws(() => peuple({ ...base, vitesse: 30 }), /vitesse 30 m/, "une vitesse en pieds est refusée");
  assert.throws(() => peuple({ ...base, vitesse: 10 }), /vitesse 10 m/, "pas un multiple de 1,5 m");
  assert.throws(() => peuple({ ...base, vision: 60 }), /vision dans le noir 60/, "une vision en pieds est refusée");
  assert.throws(() => peuple({ ...base, traits: [deuxTraits[0]] }), /1 traits/);
  assert.throws(() => trait({ cle: "essai-c", nom: "C", peuple: "Essai", img, maitrises: { accordees: ["skills:cuisine"] } }), /clé de maîtrise « skills:cuisine »/);
  assert.throws(() => trait({ cle: "essai-d", nom: "D", peuple: "Essai", img, maitrises: { accordees: ["dr:feu"] } }), /clé de maîtrise « dr:feu »/);

  const fond = { cle: "essai-fond", nom: "Fond", img, carac: ["str", "dex", "con"], competences: ["ath", "itm"], outil: "tool:game:dice", don: DONS_SRD.vigilant };
  assert.doesNotThrow(() => historique(fond));
  assert.throws(() => historique({ ...fond, carac: ["str", "dex"] }), /trois caractéristiques/);
  assert.throws(() => historique({ ...fond, carac: ["str", "dex", "for"] }), /caractéristique « for »/);
  assert.throws(() => historique({ ...fond, competences: ["ath", "cuisine"] }), /compétence « cuisine »/);
  assert.throws(() => historique({ ...fond, outil: "tool:art:sabre" }), /clé de maîtrise « tool:art:sabre »/);
  assert.throws(() => historique({ ...fond, outil: "skills:ath" }), /n'est pas un outil/);
  assert.throws(() => historique({ ...fond, don: undefined }), /don d'origine manquant/);
  assert.throws(() => historique({ ...fond, don: don({ cle: "don-general", nom: "Général", img, categorie: "general" }) }), /n'est pas un don d'origine/);
  assert.throws(() => historique({ ...fond, don: "Compendium.dnd5e.feats24.Item.court" }), /uuid dnd5e mal formé/);

  assert.throws(() => arme({ cle: "essai-arme", nom: "Arme", img, categorie: "martialM", degats: { des: "1d8", types: ["feu"] } }), /type de dommages « feu »/);
  assert.throws(() => arme({ cle: "essai-arme", nom: "Arme", img, categorie: "epee", degats: { des: "1d8", types: ["slashing"] } }), /catégorie d'arme « epee »/);
  assert.throws(() => arme({ cle: "essai-arme", nom: "Arme", img, categorie: "martialM", maitrise: "tranche", degats: { des: "1d8", types: ["slashing"] } }), /botte d'arme « tranche »/);
  assert.throws(() => equipement({ cle: "essai-armure", nom: "Armure", img, categorie: "lourde" }), /type d'équipement « lourde »/);
  assert.throws(() => consommable({ cle: "essai-potion", nom: "Potion", img, categorie: "potion", activites: [{ type: "heal", soin: { des: "1d4", type: "mana" } }] }), /type de soin « mana »/);
  assert.throws(() => consommable({ cle: "essai-potion", nom: "Potion", img, categorie: "potion", rarete: "epique" }), /rareté « epique »/);
  assert.throws(() => consommable({ cle: "essai-potion", nom: "Potion", img, categorie: "potion", activites: [{ type: "save", sauvegarde: { carac: ["for"], dd: 12 } }] }), /caractéristique de sauvegarde « for »/);
  assert.throws(() => consommable({ cle: "essai-potion", nom: "Potion", img, categorie: "potion", activites: [{ type: "utility", effets: [0] }] }), /effet n° 0/);
  assert.throws(() => consommable({ cle: "Essai Potion", nom: "Potion", img, categorie: "potion" }), /clé invalide/);
});
