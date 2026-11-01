// Essais des journaux liés de lakour-warcraft (guides, aventure, campagne, aides de jeu) :
// - chaque @UUID vise un document fabriqué du module, ou une page d'un journal fabriqué, et porte un libellé ;
// - chaque jet cliquable suit la syntaxe des enrichers de dnd5e 6.0.6 (dnd5e.mjs : registerCustomEnrichers,
//   parseConfig, parseCheckConfig, enrichCheck, enrichSave, parseDamageConfig, enrichReference) ;
// - les journaux du MJ sont abondamment liés, aucun test « DD n » n'y reste en clair ;
// - un journal visible des joueurs ne lie que ce que les joueurs peuvent ouvrir ;
// - les aides de jeu sont des pages texte séparées, montrées page par page depuis le journal du MJ.
// Mutations : un lien cassé ou un jet mal formé est repéré ; les constructeurs refusent une cible ou un jet inconnus.
// Aucun réseau, rien n'est écrit.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fabriquer, TYPE_PACK } from "../outils/fabriquer-warcraft.mjs";
import { CARACTERISTIQUES, COMPETENCES, DOMMAGES, SOINS, OUTILS } from "../modules/lakour-warcraft/contenu/objets.mjs";
import { liens, jet, jetSauvegarde, degats, soins, reference } from "../modules/lakour-warcraft/contenu/guides.mjs";
import { BESTIAIRE } from "../modules/lakour-warcraft/contenu/bestiaire.mjs";
import { PNJ_AVENTURE } from "../modules/lakour-warcraft/contenu/aventure.mjs";
import { PNJ_CAMPAGNE } from "../modules/lakour-warcraft/contenu/campagne.mjs";

const M = "lakour-warcraft";
const fabriques = fabriquer();
const journaux = fabriques.filter(d => d.pack === "journaux").map(d => d.doc);
const journal = cle => journaux.find(j => j.flags[M].cle === cle);
const uuidDe = (pack, doc) => `Compendium.${M}.${pack}.${TYPE_PACK[pack]}.${doc._id}`;
const texte = j => j.pages.map(p => p.text.content).join("\n");
// Le HTML des pages échappe « & » : Foundry lit les enrichers dans le texte des nœuds, donc après décodage.
const decode = t => t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

// Compendiums ouverts aux joueurs, d'après module.json (ownership.PLAYER différent de NONE).
const MODULE_JSON = JSON.parse(readFileSync(new URL(`../modules/${M}/module.json`, import.meta.url), "utf8"));
const PACKS_JOUEURS = new Set(MODULE_JSON.packs.filter(p => (p.ownership?.PLAYER ?? "NONE") !== "NONE").map(p => p.name));

// ---------------------------------------------------------------- Syntaxe relevée dans dnd5e.mjs 6.0.6

// registerCustomEnrichers : commandes et motif de l'enricher principal, et de &Reference.
const COMMANDES = ["attack", "award", "check", "concentration", "damage", "heal", "healing", "save", "skill", "tool", "item"];
const ENRICHER = new RegExp(String.raw`\[\[/(?<type>${COMMANDES.join("|")})(?<config> .*?)?]](?!])(?:{(?<label>[^}]+)})?`, "gi");
const REFERENCE = /&(?<type>Reference)\[(?<config>[^\]]+)](?:{(?<label>[^}]+)})?/gi;
// Lien de contenu de Foundry : @UUID[cible]{libellé}.
const LIEN = /@UUID\[(?<uuid>[^\]]+)](?:{(?<label>[^}]+)})?/g;
// CONFIG.DND5E.rules et CONFIG.DND5E.conditionTypes (clés), cibles de &Reference[rule=…] et [condition=…].
const REGLES = new Set(("inspiration carryingcapacity push lift drag encumbrance hiding passiveperception time speed travelpace forcedmarch " +
  "difficultterrainpace climbing swimming longjump highjump falling suffocating vision light lightlyobscured heavilyobscured brightlight " +
  "dimlight darkness blindsight darkvision tremorsense truesight food water resting shortrest longrest surprise initiative bonusaction " +
  "reaction difficultterrain beingprone droppingprone standingup crawling movingaroundothercreatures flying size space squeezing attack " +
  "castaspell dash disengage dodge help hide ready search useanobject attackrolls unseenattackers unseentargets rangedattacks range " +
  "rangedattacksinclosecombat meleeattacks reach unarmedstrike opportunityattacks twoweaponfighting grappling escapingagrapple " +
  "movingagrappledcreature shoving cover halfcover threequarterscover totalcover hitpoints damagerolls criticalhits damagetypes " +
  "damageresistance damagevulnerability healing instantdeath deathsavingthrows deathsaves stabilizing knockingacreatureout " +
  "temporaryhitpoints temphp mounting dismounting controllingamount underwatercombat").split(" "));
const CONDITIONS = new Set(("bleeding blinded burning charmed cursed dehydration deafened diseased exhaustion falling frightened grappled " +
  "incapacitated invisible malnutrition paralyzed petrified poisoned prone restrained silenced stunned suffocation surprised transformed " +
  "unconscious").split(" "));
const OUTILS_DND5E = new Set(Object.values(OUTILS).flat());
const FORMULE = /^\d+d\d+(?:[+-]\d+)?$/;

// parseConfig : morceaux séparés par des espaces (guillemets permis), « cle=valeur » ou valeur seule.
function lireConfig(config = "") {
  const c = { valeurs: [] };
  for (const morceau of config.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []) {
    const [cle, valeur] = morceau.split("=");
    if (valeur === undefined) c.valeurs.push(cle);
    else c[cle] = valeur.replace(/(^"|"$)/g, "");
  }
  return c;
}
const liste = v => (v ?? "").split(/[/|]/).filter(Boolean);
const entier = v => /^\d+$/.test(v ?? "");

// Erreurs d'un enricher dnd5e (on n'écrit que la forme « cle=valeur », plus stricte que ce que dnd5e accepte).
function erreursEnricher({ type, config, label }) {
  const e = [];
  const c = lireConfig(config);
  if (c.valeurs.length) e.push(`valeurs sans clé (${c.valeurs.join(" ")})`);
  switch (type.toLowerCase()) {
    case "check": case "skill": case "tool": {
      const comp = liste(c.skill), outils = liste(c.tool);
      for (const k of comp) if (!COMPETENCES.includes(k)) e.push(`compétence « ${k} » inconnue`);
      for (const k of outils) if (!OUTILS_DND5E.has(k)) e.push(`outil « ${k} » inconnu`);
      if (c.ability && !CARACTERISTIQUES.includes(c.ability)) e.push(`caractéristique « ${c.ability} » inconnue`);
      if (!c.ability && !comp.length && !outils.length) e.push("ni caractéristique, ni compétence, ni outil");
      // enrichCheck : un libellé sur un jet à plusieurs compétences ou outils est refusé.
      if (label && comp.length + outils.length > 1) e.push("libellé sur un jet à plusieurs compétences");
      if (!entier(c.dc)) e.push(`DD « ${c.dc} » invalide`);
      break;
    }
    case "save": {
      const caracs = liste(c.ability);
      if (!caracs.length) e.push("sauvegarde sans caractéristique");
      for (const k of caracs) if (!CARACTERISTIQUES.includes(k)) e.push(`caractéristique « ${k} » inconnue`);
      if (!entier(c.dc)) e.push(`DD « ${c.dc} » invalide`);
      break;
    }
    case "damage": case "heal": case "healing": {
      if (!FORMULE.test(c.formula ?? "")) e.push(`formule « ${c.formula} » invalide`);
      const types = liste(c.type), permis = type.toLowerCase() === "damage" ? DOMMAGES : SOINS;
      if (!types.length) e.push("type de dégâts manquant");
      for (const t of types) if (!permis.includes(t)) e.push(`type « ${t} » inconnu`);
      break;
    }
    default: e.push(`commande /${type} non utilisée par les journaux`);
  }
  return e;
}

function erreursReference({ config }) {
  const c = lireConfig(config);
  const cle = v => v?.toLowerCase().replace(/-/g, "");
  if (c.condition !== undefined) return CONDITIONS.has(cle(c.condition)) ? [] : [`état « ${c.condition} » inconnu`];
  if (c.rule !== undefined) return REGLES.has(cle(c.rule)) ? [] : [`règle « ${c.rule} » inconnue`];
  return ["&Reference sans condition= ni rule="];
}

// ---------------------------------------------------------------- Vérificateur (aussi pour les mutations)

function indexer(liste) {
  const index = new Map();
  for (const { pack, doc } of liste) {
    index.set(uuidDe(pack, doc), { pack, doc });
    for (const p of doc.pages ?? []) index.set(`${uuidDe(pack, doc)}.JournalEntryPage.${p._id}`, { pack, doc, page: p });
  }
  return index;
}

// Renvoie les erreurs des journaux (liens, jets, visibilité) ; vide si tout va bien.
function verifierJournaux(journaux, index) {
  const erreurs = [];
  for (const j of journaux) {
    const visible = j.ownership?.default >= 2;
    for (const p of j.pages) {
      const ou = `${j.name} / ${p.name}`;
      if (p.type === "spells") continue;   // listes de sorts de classe (dnd5e) : pas de texte à lier
      if (p.type !== "text" || p.text?.format !== 1) erreurs.push(`${ou} : page qui n'est pas une page texte HTML`);
      let reste = decode(p.text.content);
      for (const m of reste.matchAll(LIEN)) {
        const { uuid, label } = m.groups;
        const cible = index.get(uuid);
        if (!uuid.startsWith(`Compendium.${M}.`)) erreurs.push(`${ou} : lien hors du module (${uuid})`);
        else if (!cible) erreurs.push(`${ou} : lien introuvable ${uuid}`);
        if (!label?.trim()) erreurs.push(`${ou} : lien sans libellé (${uuid})`);
        if (visible && cible) {
          if (!PACKS_JOUEURS.has(cible.pack)) erreurs.push(`${ou} : journal visible qui lie le compendium fermé « ${cible.pack} »`);
          if (cible.pack === "journaux" && !(cible.doc.ownership?.default >= 2)) erreurs.push(`${ou} : journal visible qui lie un journal caché`);
        }
      }
      for (const m of reste.matchAll(ENRICHER)) for (const e of erreursEnricher(m.groups)) erreurs.push(`${ou} : ${m[0]} : ${e}`);
      for (const m of reste.matchAll(REFERENCE)) for (const e of erreursReference(m.groups)) erreurs.push(`${ou} : ${m[0]} : ${e}`);
      // Ce qui reste après les motifs reconnus ne doit plus contenir de début d'enricher ou de lien.
      reste = reste.replace(LIEN, "").replace(ENRICHER, "").replace(REFERENCE, "");
      for (const debris of reste.match(/\[\[|@UUID|&Reference|@Compendium/g) ?? []) erreurs.push(`${ou} : « ${debris} » mal formé`);
    }
  }
  return erreurs;
}

const INDEX = indexer(fabriques);
const liensDe = j => [...decode(texte(j)).matchAll(LIEN)].map(m => m.groups.uuid);
const jetsDe = j => [...decode(texte(j)).matchAll(ENRICHER)];

// ---------------------------------------------------------------- Le vrai contenu

test("journaux liés : chaque @UUID vise un document fabriqué, chaque jet suit la syntaxe dnd5e 6.0.6", () => {
  assert.ok(journaux.length >= 7, `${journaux.length} journaux`);
  assert.deepEqual(verifierJournaux(journaux, INDEX), []);
});

test("journaux liés : le MJ a des liens et des jets partout (aventure, campagne, guides)", () => {
  const minimum = { "aventure-puits-de-cendre": [50, 25], "campagne-braises-legion": [70, 45], "guide-du-mj": [12, 0], "guide-du-joueur": [13, 0] };
  for (const [cle, [nLiens, nJets]] of Object.entries(minimum)) {
    const j = journal(cle);
    assert.ok(liensDe(j).length >= nLiens, `${j.name} : ${liensDe(j).length} liens au lieu d'au moins ${nLiens}`);
    assert.ok(jetsDe(j).length >= nJets, `${j.name} : ${jetsDe(j).length} jets au lieu d'au moins ${nJets}`);
  }
  // Chaque page des journaux de l'aventure et de la campagne a au moins un lien.
  for (const cle of ["aventure-puits-de-cendre", "campagne-braises-legion"]) {
    for (const p of journal(cle).pages) assert.match(p.text.content, /@UUID\[/, `${cle} / ${p.name} : aucun lien`);
  }
});

test("journaux liés : chaque PNJ nommé, carte et aide de jeu est lié depuis le journal du MJ qui l'emploie", () => {
  const attendus = {
    "aventure-puits-de-cendre": [...PNJ_AVENTURE.map(d => d.__cle), "scenes:cabestan-quai", "scenes:relais-oasis", "scenes:kraal-ronceroc",
      "scenes:mine-rouge-veine", "journaux:contrat-du-cartel"],
    "campagne-braises-legion": [...PNJ_CAMPAGNE.map(d => d.__cle), "bestiaire:ezzavel", "bestiaire:grizzla-tordeboulon", "scenes:fonderie-fort-rivet",
      "scenes:ruines-eldrassal", "scenes:gue-de-sel-sommet", "scenes:cratere-brasegouffre", "journaux:lettre-lame-ardente",
      "journaux:sauf-conduit-gue-de-sel", "journaux:aventure-puits-de-cendre"]
  };
  const parCle = new Map(fabriques.map(f => [f.cle, uuidDe(f.pack, f.doc)]));
  for (const [cle, cibles] of Object.entries(attendus)) {
    const lies = new Set(liensDe(journal(cle)).map(u => u.split(".JournalEntryPage.")[0]));
    for (const c of cibles) assert.ok(lies.has(parCle.get(c)), `${cle} : ${c} non lié`);
  }
  // Le guide du joueur lie chaque peuple jouable, le guide du MJ chaque table.
  const lies = cle => new Set(liensDe(journal(cle)));
  for (const f of fabriques.filter(f => f.pack === "peuples" && f.doc.type === "race")) assert.ok(lies("guide-du-joueur").has(uuidDe("peuples", f.doc)), f.doc.name);
  for (const f of fabriques.filter(f => f.pack === "tables")) assert.ok(lies("guide-du-mj").has(uuidDe("tables", f.doc)), f.doc.name);
});

test("journaux liés : aucun test ni sauvegarde « DD n » laissé en clair dans l'aventure et la campagne", () => {
  for (const cle of ["aventure-puits-de-cendre", "campagne-braises-legion"]) {
    const enClair = decode(texte(journal(cle))).replace(ENRICHER, "").match(/.{0,30}\bDD \d+/g) ?? [];
    assert.deepEqual(enClair, [], `${cle} : jets non cliquables`);
  }
});

test("journaux liés : les aides de jeu sont des pages texte séparées, montrées page par page depuis le journal du MJ", () => {
  const aides = journaux.filter(j => j.name.startsWith("Aide de jeu — "));
  assert.equal(aides.length, 3);
  for (const a of aides) {
    assert.equal(a.ownership.default, 2, `${a.name} : visible`);
    for (const p of a.pages) assert.equal(p.type, "text", `${a.name} / ${p.name}`);
    assert.equal(new Set(a.pages.map(p => p.name)).size, a.pages.length, `${a.name} : titres de page en double`);
  }
  // Le contrat a deux pièces (le contrat, l'affiche de la Trêve) : le journal de l'aventure lie chacune de ses pages.
  const contrat = journal("contrat-du-cartel");
  assert.ok(contrat.pages.length >= 2);
  const lies = new Set(liensDe(journal("aventure-puits-de-cendre")));
  for (const p of contrat.pages) assert.ok(lies.has(`${uuidDe("journaux", contrat)}.JournalEntryPage.${p._id}`), `page « ${p.name} » non liée`);
});

// ---------------------------------------------------------------- Mutations : un lien ou un jet faux est repéré

test("mutation : un lien cassé, une cible absente ou un jet mal formé sont repérés par le vérificateur", () => {
  const mj = "aventure-puits-de-cendre";
  const fausser = (cle, remplacer) => {
    const copie = structuredClone(journaux);
    const j = copie.find(x => x.flags[M].cle === cle);
    j.pages = j.pages.map(p => ({ ...p, text: { ...p.text, content: remplacer(p.text.content) } }));
    return copie;
  };
  const premierLien = liensDe(journal(mj))[0];
  const cas = [
    // Un identifiant altéré d'un caractère.
    [fausser(mj, t => t.replace(premierLien, premierLien.slice(0, -1) + (premierLien.endsWith("A") ? "B" : "A"))), INDEX, /lien introuvable/],
    // La cible disparaît des compendiums.
    [journaux, indexer(fabriques.filter(f => f.cle !== "bestiaire:grizzla-tordeboulon")), /lien introuvable/],
    // Lien sans libellé, lien vers un autre module, lien tronqué.
    [fausser(mj, t => t.replace(/(@UUID\[[^\]]+])\{[^}]+}/, "$1")), INDEX, /sans libellé/],
    [fausser(mj, t => t.replace(`Compendium.${M}.`, "Compendium.dnd5e.")), INDEX, /hors du module/],
    [fausser(mj, t => t.replace("@UUID[", "@UUID ")), INDEX, /« @UUID » mal formé/],
    // Jets : compétence, outil, caractéristique, DD, type de dégâts, formule, libellé sur plusieurs compétences.
    [fausser(mj, t => t.replace("skill=inv", "skill=investigation")), INDEX, /compétence « investigation » inconnue/],
    [fausser(mj, t => t.replace("tool=thief", "tool=voleur")), INDEX, /outil « voleur » inconnu/],
    [fausser(mj, t => t.replace("ability=dex", "ability=dext")), INDEX, /caractéristique « dext » inconnue/],
    [fausser(mj, t => t.replace(/dc=12/, "dc=douze")), INDEX, /DD « douze » invalide/],
    [fausser(mj, t => t.replace("type=fire", "type=feu")), INDEX, /type « feu » inconnu/],
    [fausser(mj, t => t.replace("formula=3d6", "formula=3d")), INDEX, /formule « 3d » invalide/],
    [fausser(mj, t => t.replace("skill=nat", "skill=nat/sur")), INDEX, /libellé sur un jet à plusieurs compétences/],
    [fausser(mj, t => t.replace("[[/check", "[[/chek")), INDEX, /« \[\[ » mal formé/],
    [fausser(mj, t => t.replace("[[/check skill=prc dc=13]]", "[[/check prc 13]]")), INDEX, /valeurs sans clé/],
    // Renvois de règles.
    [fausser(mj, t => t.replace("condition=unconscious", "condition=endormi")), INDEX, /état « endormi » inconnu/],
    [fausser(mj, t => t.replace("rule=difficultTerrain", "rule=terrainDifficile")), INDEX, /règle « terrainDifficile » inconnue/],
    // Une aide de jeu visible qui lie une fiche du bestiaire (compendium fermé aux joueurs).
    [fausser("contrat-du-cartel", t => t + `<p>@UUID[${uuidDe("bestiaire", BESTIAIRE[0])}]{Murloc}</p>`), INDEX, /compendium fermé « bestiaire »/],
    // Une aide de jeu visible qui lie le journal caché du MJ.
    [fausser("contrat-du-cartel", t => t + `<p>@UUID[${uuidDe("journaux", journal(mj))}]{Aventure}</p>`), INDEX, /lie un journal caché/]
  ];
  for (const [liste, index, attendu] of cas) {
    const erreurs = verifierJournaux(liste, index);
    assert.ok(erreurs.some(e => attendu.test(e)), `attendu ${attendu}, obtenu : ${erreurs.join(" | ") || "aucune erreur"}`);
  }
});

test("mutation : les constructeurs de liens et de jets refusent une cible ou un jet inconnus", () => {
  const lien = liens(BESTIAIRE, journaux.map(j => ({ ...j, __pack: "journaux", __cle: `journaux:${j.flags[M].cle}` })));
  // Le modèle passe.
  assert.equal(lien("bestiaire:murloc"), `@UUID[${uuidDe("bestiaire", BESTIAIRE[0])}]{Murloc}`);
  assert.match(lien("journaux:contrat-du-cartel#La Trêve de Cabestan"), /\.JournalEntryPage\.[A-Za-z0-9]{16}]\{La Trêve de Cabestan}$/);
  assert.equal(jet("Nature ou Survie", 12), "[[/check skill=nat dc=12]]{Nature} ou [[/check skill=sur dc=12]]{Survie DD 12}");
  assert.equal(jet("outils de voleur", 13), "[[/check tool=thief dc=13]]{outils de voleur DD 13}");
  assert.equal(jet("Sagesse", 13), "[[/check ability=wis dc=13]]{Sagesse DD 13}");
  assert.equal(jetSauvegarde("Constitution", 14, "jet de sauvegarde de"), "[[/save ability=con dc=14]]{jet de sauvegarde de Constitution DD 14}");
  assert.equal(degats("3d6", "feu"), "[[/damage formula=3d6 type=fire]]{3d6 dégâts de feu}");
  assert.equal(soins("2d4 + 2"), "[[/heal formula=2d4+2 type=healing]]{2d4 + 2 PV}");
  assert.equal(reference("inconscient"), "&Reference[condition=unconscious]{inconscient}");
  // Chaque altération est refusée.
  assert.throws(() => lien("bestiaire:inexistant"), /document inconnu/);
  assert.throws(() => lien("tables:rumeurs-de-taverne"), /document inconnu/);
  assert.throws(() => lien("journaux:contrat-du-cartel#Page absente"), /page inconnue/);
  assert.throws(() => lien("bestiaire:murloc", "Mur}loc"), /crochets\/accolades/);
  assert.throws(() => liens([{ ...BESTIAIRE[0], _key: "!inconnu!x" }])(BESTIAIRE[0].__cle), /type de document inconnu/);
  assert.throws(() => jet("Cuisine", 12), /ni une compétence/);
  assert.throws(() => jet("Survie", 12.5), /DD invalide/);
  assert.throws(() => jetSauvegarde("Chance", 12), /caractéristique inconnue/);
  assert.throws(() => degats("3d6", "glace"), /type inconnu/);
  assert.throws(() => degats("trois", "feu"), /formule invalide/);
  assert.throws(() => soins("beaucoup"), /formule invalide/);
  assert.throws(() => reference("endormi"), /Référence de règle inconnue/);
  // Et ce qu'ils fabriquent passe le vérificateur.
  const page = { name: "Essai", type: "text", text: { format: 1, content: [jet("Nature ou Survie", 12), jetSauvegarde("Dextérité", 12),
    degats("2d6", "poison"), soins("2d4 + 2"), reference("terrain difficile"), reference("à terre"), lien("bestiaire:murloc")].join(" ") } };
  assert.deepEqual(verifierJournaux([{ name: "Essai", ownership: { default: 0 }, pages: [page] }], INDEX), []);
});
