// Fabrique les compendiums du module lakour-warcraft à partir des définitions de modules/lakour-warcraft/contenu/ :
// 1. rassemble les documents, 2. résout les références croisées, 3. copie les objets dans les acteurs,
// 4. emballe chaque aventure en un document Adventure (contenu/aventures-paquets.mjs), 5. écrit les sources JSON (src/),
// 6. compile en LevelDB (packs/).
// Usage : npm run fabriquer-warcraft        (option --sans-compiler pour vérifier seulement)
//
// Version anglaise (module lakour-warcraft-en, docs/traduction.md du moteur) : mêmes sources, mêmes _id, un dictionnaire de
// traduction par pack dans modules/lakour-warcraft/contenu/en/<pack>.json (outils/traduction.mjs du moteur).
//   node outils/fabriquer-warcraft.mjs --extraire   écrit ou met à jour les squelettes contenu/en/<pack>.json (traductions gardées)
//   npm run fabriquer-warcraft-en  (= --langue en)  engendre modules/lakour-warcraft-en/ EN ENTIER (non versionné) : module.json
//     anglais (contenu/en/module.json), src/ et packs/ traduits, copies de lang/, scripts/, templates/, assets/ (plans.json
//     refait avec les noms traduits, index des jetons récrits, libellés des figurants traduits par contenu/en/figurants.json),
//     CREDITS.md ; puis contrôle le contrat du contenu. Une entrée obsolète (le français a changé) est signalée ; un écart de
//     balises ou de liens arrête la fabrication.
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MODULE, identifiant } from "../modules/lakour-warcraft/contenu/aides.mjs";
import { DOCUMENTS } from "../modules/lakour-warcraft/contenu/index.mjs";
import { paquetsAventures } from "../modules/lakour-warcraft/contenu/aventures-paquets.mjs";
import { appliquer, extraire, fusionner, resumerRapport } from "../modules/lakour-mj-ia/outils/traduction.mjs";
import { verifierModuleDeContenu } from "../modules/lakour-mj-ia/outils/contrat-contenu.mjs";

// Écriture atomique (fichier temporaire puis renommage) : un essai ou un serveur qui lit le fichier pendant la fabrication
// ne voit jamais un JSON tronqué (même fonction que dans le fabricant des Veillées).
function ecrire(chemin, texte) {
  const provisoire = `${chemin}.${process.pid}.tmp`;
  writeFileSync(provisoire, texte);
  renameSync(provisoire, chemin);
}

const RACINE = `modules/${MODULE}`;
export const TYPE_PACK = { peuples: "Item", historiques: "Item", objets: "Item", dons: "Item", afflictions: "Item", sorts: "Item", classes: "Item", bestiaire: "Actor", tables: "RollTable", journaux: "JournalEntry", scenes: "Scene", aventures: "Adventure" };

// ---------------------------------------------------------------- Version anglaise
export const MODULE_EN = `${MODULE}-en`;
const RACINE_EN = `modules/${MODULE_EN}`;
export const DOSSIER_DICTIONNAIRES = `${RACINE}/contenu/en`;
// Ce que l'extraction regarde (outils/traduction.mjs) : nos drapeaux sous flags.lakour-warcraft (descriptions des cartes, plans,
// notes du MJ des fiches, recettes de l'établi, titre d'aventure…) ; le pack « aventures » est engendré après coup par
// paquetsAventures (textes par langue dans contenu/aventures-paquets.mjs), donc pas de dictionnaire. Les uuid
// « Compendium.dnd5e.* » ne sont jamais récrits (seul « Compendium.lakour-warcraft. » l'est).
// exclure : « max » et « count » portent des formules de dnd5e (« max(1, @abilities.wis.mod) », « @item.level - 1 »),
// « license » la licence de la source (« CC-BY-4.0 »).
export const OPTIONS_TRADUCTION = { module: MODULE, ignorerPacks: ["aventures"], exclure: ["max", "count", "license"] };
// Dossiers et fichiers du module français copiés tels quels dans le module anglais (les assets : un zip doit être autonome).
const COPIES = ["CREDITS.md", "lang", "scripts", "templates", "assets"];

export function fabriquer() {
  const parCle = new Map();
  for (const doc of DOCUMENTS) {
    if (!TYPE_PACK[doc.__pack]) throw new Error(`Compendium inconnu pour ${doc.__cle} : ${doc.__pack}`);
    if (parCle.has(doc.__cle)) throw new Error(`Clé en double : ${doc.__cle}`);
    parCle.set(doc.__cle, doc);
  }
  const cible = cle => {
    const doc = parCle.get(cle);
    if (!doc) throw new Error(`Référence orpheline : ${cle}`);
    return { uuid: `Compendium.${MODULE}.${doc.__pack}.${TYPE_PACK[doc.__pack]}.${doc._id}`, id: doc._id, name: doc.name };
  };
  // { __ref } -> { uuid, id, name } (ou la chaîne uuid seule avec { __ref, __uuid: true }, pour les ItemGrant de dnd5e).
  const resoudre = valeur => {
    if (Array.isArray(valeur)) return valeur.map(resoudre);
    if (!valeur || typeof valeur !== "object") return valeur;
    if (valeur.__ref) {
      const { uuid, id, name } = cible(valeur.__ref);
      if (valeur.__uuid) return uuid;
      const { __ref, ...reste } = valeur;
      return { ...resoudre(reste), uuid, id, name };
    }
    return Object.fromEntries(Object.entries(valeur).map(([k, v]) => [k, resoudre(v)]));
  };
  const propre = doc => Object.fromEntries(Object.entries(doc).filter(([k]) => !k.startsWith("__")));

  return DOCUMENTS.map(doc => {
    const final = resoudre(propre(doc));
    if (doc.__pack === "tables") {
      final.results = final.results.map(r => {
        const { __refUuid, ...reste } = r;
        return __refUuid ? { ...reste, documentUuid: cible(__refUuid).uuid, name: cible(__refUuid).name } : reste;
      });
    }
    // Objets d'un acteur : copies des objets référencés (ref("objets:…")) ou objets propres, avec leur clé imbriquée.
    if (doc.__objets) {
      final.items = doc.__objets.map((o, i) => {
        const source = o.__ref ? parCle.get(o.__ref) : o;
        if (!source) throw new Error(`Référence orpheline dans ${doc.__cle} : ${o.__ref}`);
        const copie = resoudre(propre(structuredClone(source)));
        copie._id = identifiant(`${doc.__cle}:objet:${i}`);
        copie._key = `!actors.items!${final._id}.${copie._id}`;
        // Effets de l'objet copié : clé imbriquée sous l'acteur, sinon deux acteurs copiant le même objet se marchent dessus.
        copie.effects = (copie.effects ?? []).map(e => ({ ...e, _key: `!actors.items.effects!${final._id}.${copie._id}.${e._id}` }));
        delete copie.folder; delete copie.ownership;
        return copie;
      });
    }
    return { pack: doc.__pack, cle: doc.__cle, doc: final };
  });
}

// ---------------------------------------------------------------- Dictionnaires de traduction

// Union des dictionnaires contenu/en/<pack>.json (module.json et figurants.json à part : manifeste et assets).
// Rend { dictionnaire, packs }.
export function lireDictionnaires(dossier = DOSSIER_DICTIONNAIRES) {
  const dictionnaire = {}, packs = [];
  if (!existsSync(dossier)) return { dictionnaire, packs };
  for (const f of readdirSync(dossier).filter(f => f.endsWith(".json") && !["module.json", "figurants.json"].includes(f)).sort()) {
    Object.assign(dictionnaire, JSON.parse(readFileSync(join(dossier, f), "utf8")));
    packs.push(f.slice(0, -5));
  }
  return { dictionnaire, packs };
}

// Écrit ou met à jour les squelettes contenu/en/<pack>.json à partir des documents fabriqués (traductions existantes
// conservées, sources changées signalées). Rend, par pack, { entrees, traduites, nouvelles, conservees, obsoletes, supprimees }.
export function extraireDictionnaires(docs, dossier = DOSSIER_DICTIONNAIRES) {
  const { squelette, tout } = extraire(docs, OPTIONS_TRADUCTION);
  mkdirSync(dossier, { recursive: true });
  const bilan = {};
  for (const pack of Object.keys(TYPE_PACK)) {
    if (!squelette[pack]) continue;
    const fichier = join(dossier, `${pack}.json`);
    const existant = existsSync(fichier) ? JSON.parse(readFileSync(fichier, "utf8")) : {};
    const { dictionnaire, rapport } = fusionner(squelette[pack], existant, tout[pack]);
    ecrire(fichier, `${JSON.stringify(dictionnaire, null, 2)}\n`);
    const entrees = Object.values(dictionnaire).reduce((n, e) => n + Object.keys(e).filter(k => !k.startsWith("_")).length, 0);
    const traduites = Object.values(dictionnaire).reduce((n, e) => n + Object.values(e).filter(t => t?.en).length, 0);
    bilan[pack] = { entrees, traduites, ...rapport };
  }
  return bilan;
}

// Documents du module anglais, en mémoire : les documents français traduits (uuid, chemins et drapeaux récrits vers
// lakour-warcraft-en), puis les aventures emballées à partir de ces copies. Rend { documents, rapport }.
export function fabriquerAnglais(docs = fabriquer(), dictionnaire = lireDictionnaires().dictionnaire) {
  const { documents, rapport } = appliquer(docs, dictionnaire, { ...OPTIONS_TRADUCTION, deId: MODULE, versId: MODULE_EN });
  documents.push(...paquetsAventures(documents, { module: MODULE_EN, langue: "en" }));
  return { documents, rapport };
}

// Manifeste du module anglais : celui du module français, identifiant, titre, description, étiquettes des packs et dossiers
// pris dans contenu/en/module.json, adresses de publication propres (lakour-warcraft-en.json / .zip), uuid récrits (quickstart,
// listes de sorts), légendes des médias traduites, conflit déclaré avec le module français (mêmes documents : un seul des
// deux actif à la fois).
export function manifesteAnglais(manifeste, traductions) {
  const recrire = v => (typeof v === "string" ? v.replaceAll(`Compendium.${MODULE}.`, `Compendium.${MODULE_EN}.`) : v);
  const en = structuredClone(manifeste);
  en.id = MODULE_EN;
  en.title = traductions.title ?? `${manifeste.title} (English)`;
  en.description = traductions.description ?? manifeste.description;
  if (manifeste.manifest) en.manifest = manifeste.manifest.replace(/module\.json$/, `${MODULE_EN}.json`);
  if (manifeste.download) en.download = manifeste.download.replace(`${MODULE}.zip`, `${MODULE_EN}.zip`);
  en.media = (manifeste.media ?? []).map(m => (m.caption && traductions.media?.[m.caption] ? { ...m, caption: traductions.media[m.caption] } : m));
  en.packs = manifeste.packs.map(p => ({ ...p, label: traductions.packs?.[p.name] ?? p.label }));
  en.packFolders = (manifeste.packFolders ?? []).map(f => ({ ...f, name: traductions.packFolders?.[f.name] ?? f.name }));
  en.relationships = { ...manifeste.relationships, conflicts: [...(manifeste.relationships?.conflicts ?? []).filter(c => c.id !== MODULE), { id: MODULE, type: "module", reason: `Same documents and identifiers as ${MODULE}: enable only one of the two.` }] };
  en.quickstart = JSON.parse(JSON.stringify(manifeste.quickstart ?? {}), (k, v) => recrire(v));
  en.flags = JSON.parse(JSON.stringify(manifeste.flags ?? {}), (k, v) => recrire(v));
  return en;
}

// Copie le dossier du module français (COPIES) dans le module anglais : fichiers JSON des assets récrits (chemins
// « modules/lakour-warcraft/ » -> « modules/lakour-warcraft-en/ »), libellés des figurants traduits (contenu/en/figurants.json :
// { type: libellé anglais }), plans.json refait avec les plans traduits des scènes.
function copierModule(documents) {
  for (const element of COPIES) {
    const source = join(RACINE, element), cible = join(RACINE_EN, element);
    if (!existsSync(source)) continue;
    rmSync(cible, { recursive: true, force: true });
    cpSync(source, cible, { recursive: true });
  }
  const recrireJson = dossier => {
    for (const f of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = join(dossier, f.name);
      if (f.isDirectory()) recrireJson(chemin);
      else if (f.name.endsWith(".json")) ecrire(chemin, readFileSync(chemin, "utf8").replaceAll(`modules/${MODULE}/`, `modules/${MODULE_EN}/`));
    }
  };
  if (existsSync(join(RACINE_EN, "assets"))) recrireJson(join(RACINE_EN, "assets"));
  const figurants = join(RACINE_EN, "assets/jetons/figurants.json"), libelles = join(DOSSIER_DICTIONNAIRES, "figurants.json");
  if (existsSync(figurants) && existsSync(libelles)) {
    const table = JSON.parse(readFileSync(figurants, "utf8")), en = JSON.parse(readFileSync(libelles, "utf8"));
    for (const [type, f] of Object.entries(table)) if (typeof en[type] === "string" && en[type].trim()) f.libelle = en[type];
    ecrire(figurants, `${JSON.stringify(table, null, 2)}\n`);
  }
  const plans = {};
  for (const { pack, doc } of documents) if (pack === "scenes" && doc.flags?.[MODULE_EN]?.plan) plans[doc.flags[MODULE_EN].cle] = doc.flags[MODULE_EN].plan;
  mkdirSync(join(RACINE_EN, "assets/cartes"), { recursive: true });
  ecrire(join(RACINE_EN, "assets/cartes/plans.json"), `${JSON.stringify(plans, null, 1)}\n`);
}

// ---------------------------------------------------------------- Ligne de commande

// Écrit src/<pack>/*.json puis compile packs/ pour un module (racine), à partir de documents { pack, cle, doc }.
async function ecrireEtCompiler(docs, racine, compiler) {
  const parPack = Object.groupBy(docs, d => d.pack);
  for (const [pack, liste] of Object.entries(parPack)) {
    const dossier = `${racine}/src/${pack}`;
    rmSync(dossier, { recursive: true, force: true });
    mkdirSync(dossier, { recursive: true });
    for (const { cle, doc } of liste) ecrire(`${dossier}/${cle.split(":")[1]}.json`, `${JSON.stringify(doc, null, 2)}\n`);
    console.log(`${pack.padEnd(12)} ${liste.length} documents`);
  }
  if (compiler) {
    for (const pack of Object.keys(parPack)) {
      rmSync(`${racine}/packs/${pack}`, { recursive: true, force: true });
      await compilePack(`${racine}/src/${pack}`, `${racine}/packs/${pack}`);
    }
    console.log("compendiums compilés dans", `${racine}/packs/`);
  }
}

// Lancé directement (npm run fabriquer-warcraft) ; importé par les essais, on ne fait que fabriquer().
if (process.argv[1] && import.meta.url === (await import("node:url")).pathToFileURL((await import("node:path")).resolve(process.argv[1])).href) {
  const docs = fabriquer();
  const langue = process.argv.includes("--langue") ? process.argv[process.argv.indexOf("--langue") + 1] : "fr";
  const compiler = !process.argv.includes("--sans-compiler");

  if (process.argv.includes("--extraire")) {
    // Squelettes des dictionnaires : un fichier par pack, traductions existantes conservées.
    const bilan = extraireDictionnaires(docs);
    for (const [pack, b] of Object.entries(bilan)) {
      console.log(`${pack.padEnd(12)} ${String(b.traduites).padStart(4)}/${String(b.entrees).padEnd(4)} traduites, ${b.nouvelles} nouvelle(s)`
        + `${b.obsoletes.length ? `, ${b.obsoletes.length} obsolète(s) (enAncien à vérifier)` : ""}${b.supprimees.length ? `, ${b.supprimees.length} retirée(s)` : ""}`);
      for (const o of b.obsoletes) console.warn(`  obsolète : ${o}`);
    }
    console.log(`dictionnaires dans ${DOSSIER_DICTIONNAIRES}/`);
  } else if (langue === "fr") {
    // Les aventures emballées sont fabriquées à part : fabriquer() reste la liste des documents des autres compendiums.
    docs.push(...paquetsAventures(docs));
    await ecrireEtCompiler(docs, RACINE, compiler);
  } else if (langue === "en") {
    const { dictionnaire } = lireDictionnaires();
    const { documents, rapport } = fabriquerAnglais(docs, dictionnaire);
    console.log(resumerRapport(rapport));
    for (const o of rapport.obsoletes) console.warn(`avertissement : traduction obsolète (le français a changé, relancer --extraire) : ${o}`);
    if (rapport.erreurs.length) {
      console.error(`${rapport.erreurs.length} traduction(s) en écart de balises ou de liens :`);
      for (const e of rapport.erreurs) console.error(`- ${e.cle}:${e.chemin}\n    ${e.ecarts.join("\n    ")}`);
      process.exit(1);
    }
    const manifeste = JSON.parse(readFileSync(`${RACINE}/module.json`, "utf8"));
    const traductions = existsSync(`${DOSSIER_DICTIONNAIRES}/module.json`) ? JSON.parse(readFileSync(`${DOSSIER_DICTIONNAIRES}/module.json`, "utf8")) : {};
    mkdirSync(RACINE_EN, { recursive: true });
    ecrire(`${RACINE_EN}/module.json`, `${JSON.stringify(manifesteAnglais(manifeste, traductions), null, 2)}\n`);
    copierModule(documents);
    await ecrireEtCompiler(documents, RACINE_EN, compiler);
    const ecarts = verifierModuleDeContenu(RACINE_EN);
    if (ecarts.length) { console.error(`${RACINE_EN} : ${ecarts.length} écart(s) au contrat des modules de contenu :\n- ${ecarts.join("\n- ")}`); process.exit(1); }
    console.log(`${RACINE_EN}/ : module anglais complet (contrat du contenu respecté) ; ${rapport.manquants.length} texte(s) encore en français`);
  } else {
    console.error(`Langue inconnue : ${langue} (fr ou en)`);
    process.exit(2);
  }
}
