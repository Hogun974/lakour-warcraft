// Empaquette le module lakour-warcraft pour une release GitHub : dist/lakour-warcraft.zip (le module installable) et
// dist/module.json (le manifeste publié, avec version, manifest et download à jour). Aucune dépendance : l'archive ZIP
// est écrite avec node:zlib (deflate + crc32). Lancé par .github/workflows/release.yml, utilisable à la main.
//
// Usage : node outils/empaqueter-module.mjs [--version 0.11.0] [--depot https://github.com/Hogun974/lakour-warcraft]
//                                           [--sortie dist] [--verifier-version] [--module lakour-warcraft-en]
// - sans --version : la version de modules/lakour-warcraft/module.json ;
// - --module lakour-warcraft-en : emballe de la même façon le module anglais engendré par `npm run fabriquer-warcraft-en`
//   (modules/lakour-warcraft-en/, non versionné) : archive lakour-warcraft-en.zip et manifeste publié lakour-warcraft-en.json
//   (le nom « module.json » reste celui du module français ; Foundry lit un manifeste sous n'importe quel nom) ;
// - --verifier-version : échoue si la version demandée n'est pas celle du module.json du dépôt (garde-fou du tag) ;
// - packs/ doit avoir été compilé (npm run fabriquer-warcraft) : sinon l'empaquetage échoue au lieu de livrer un module vide.
// Dans l'archive : module.json (publié), CREDITS.md, lang/, scripts/, templates/, assets/, packs/ ; jamais src/ ni contenu/
// (sources des fabricants), ni les fichiers cachés. Les fichiers sont à la racine de l'archive, comme Foundry l'attend.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { crc32, deflateRawSync } from "node:zlib";

export const MODULE = "lakour-warcraft";
export const DEPOT_PAR_DEFAUT = "https://github.com/Hogun974/lakour-warcraft";
export const EXCLUS = new Set(["src", "contenu"]);
export const ARCHIVE = `${MODULE}.zip`;
// Archive et manifeste publié d'un module : module.json pour le module français, <id>.json pour un module dérivé (lakour-warcraft-en).
export const nomArchive = (module = MODULE) => `${module}.zip`;
export const nomManifeste = (module = MODULE) => (module === MODULE ? "module.json" : `${module}.json`);

// ---------------------------------------------------------------- Options

export function options(argv) {
  const o = { version: null, depot: DEPOT_PAR_DEFAUT, sortie: "dist", verifierVersion: false, module: MODULE };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--version") o.version = argv[++i];
    else if (a === "--depot") o.depot = argv[++i];
    else if (a === "--sortie") o.sortie = argv[++i];
    else if (a === "--verifier-version") o.verifierVersion = true;
    else if (a === "--module") o.module = argv[++i];
    else throw new Error(`Option inconnue : ${a}`);
  }
  if (o.version && !/^\d+\.\d+\.\d+$/.test(o.version)) throw new Error(`Version invalide : « ${o.version} » (attendu : X.Y.Z)`);
  if (!o.module || !/^[a-z0-9-]+$/.test(o.module)) throw new Error(`Module invalide : « ${o.module} »`);
  o.depot = o.depot.replace(/\/+$/, "");
  return o;
}

// ---------------------------------------------------------------- Manifeste publié

// Le manifeste publié pointe toujours vers la dernière release (manifest) et vers l'archive de SA version (download).
export function manifestePublie(manifeste, version, depot, module = manifeste.id ?? MODULE) {
  return {
    ...manifeste,
    version,
    url: depot,
    manifest: `${depot}/releases/latest/download/${nomManifeste(module)}`,
    download: `${depot}/releases/download/v${version}/${nomArchive(module)}`
  };
}

// ---------------------------------------------------------------- Fichiers du module

// Chemins relatifs (séparateur « / ») de tout ce qui part dans l'archive, triés pour une archive reproductible.
export function fichiersDuModule(racine) {
  const liste = [];
  const parcourir = dossier => {
    for (const entree of readdirSync(dossier, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entree.name.startsWith(".")) continue;
      const chemin = join(dossier, entree.name);
      const rel = relative(racine, chemin).split(sep).join("/");
      if (entree.isDirectory()) {
        if (dossier === racine && EXCLUS.has(entree.name)) continue;
        parcourir(chemin);
      } else if (entree.isFile()) liste.push(rel);
    }
  };
  parcourir(racine);
  return liste;
}

// ---------------------------------------------------------------- Archive ZIP (format PKZIP 2.0, deflate)

const u16 = n => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
const u32 = n => { const b = Buffer.alloc(4); b.writeUInt32LE(n >>> 0); return b; };

// Date et heure DOS (deux secondes près) ; une date hors plage DOS est ramenée à 1980.
export function dateDos(date) {
  const d = date.getFullYear() < 1980 ? new Date(1980, 0, 1) : date;
  const heure = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const jour = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { heure, jour };
}

// entrees : [{ nom (chemin « / » dans l'archive), donnees (Buffer), date }] -> Buffer de l'archive.
export function zip(entrees, dateParDefaut = new Date()) {
  const locaux = [];
  const centraux = [];
  let position = 0;
  const DRAPEAUX = 1 << 11;   // noms en UTF-8
  for (const { nom, donnees, date } of entrees) {
    if (nom.startsWith("/") || nom.includes("..")) throw new Error(`Nom d'entrée refusé : ${nom}`);
    const nomOctets = Buffer.from(nom, "utf8");
    const comprime = deflateRawSync(donnees, { level: 9 });
    const stocker = comprime.length >= donnees.length;
    const contenu = stocker ? donnees : comprime;
    const methode = stocker ? 0 : 8;
    const somme = crc32(donnees);
    const { heure, jour } = dateDos(date ?? dateParDefaut);
    const commun = Buffer.concat([u16(20), u16(DRAPEAUX), u16(methode), u16(heure), u16(jour), u32(somme), u32(contenu.length), u32(donnees.length), u16(nomOctets.length)]);
    const local = Buffer.concat([u32(0x04034b50), commun, u16(0), nomOctets, contenu]);
    const central = Buffer.concat([u32(0x02014b50), u16(20), commun, u16(0), u16(0), u16(0), u16(0), u32(0), u32(position), nomOctets]);
    locaux.push(local);
    centraux.push(central);
    position += local.length;
  }
  const repertoire = Buffer.concat(centraux);
  const fin = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(entrees.length), u16(entrees.length), u32(repertoire.length), u32(position), u16(0)]);
  if (entrees.length > 0xffff || position + repertoire.length > 0xffffffff) throw new Error("Archive trop grande pour le format ZIP sans ZIP64");
  return Buffer.concat([...locaux, repertoire, fin]);
}

// ---------------------------------------------------------------- Empaquetage

// module : identifiant du module à emballer (lakour-warcraft, ou lakour-warcraft-en engendré par `npm run fabriquer-warcraft-en`).
export function empaqueter({ racineDepot = process.cwd(), version = null, depot = DEPOT_PAR_DEFAUT, sortie = "dist", verifierVersion = false, module = MODULE, journal = console.log } = {}) {
  const racineModule = resolve(racineDepot, "modules", module);
  const fabricant = `npm run fabriquer-warcraft${module === MODULE ? "" : "-en"}`;
  if (!existsSync(join(racineModule, "module.json"))) throw new Error(`${racineModule} sans module.json — lancez « ${fabricant} » d'abord`);
  const manifeste = JSON.parse(readFileSync(join(racineModule, "module.json"), "utf8"));
  if (manifeste.id !== module) throw new Error(`module.json : id « ${manifeste.id} », attendu « ${module} »`);
  const versionPubliee = version ?? manifeste.version;
  if (verifierVersion && versionPubliee !== manifeste.version) {
    throw new Error(`Le tag demande la version ${versionPubliee} mais module.json est en ${manifeste.version} : mettez module.json à jour avant de poser le tag`);
  }
  const packs = join(racineModule, "packs");
  const packsAttendus = manifeste.packs.map(p => p.path.replace(/^packs\//, ""));
  const manquants = packsAttendus.filter(p => !existsSync(join(packs, p)) || readdirSync(join(packs, p)).length === 0);
  if (manquants.length) throw new Error(`Compendiums non compilés : ${manquants.join(", ")} — lancez « ${fabricant} » d'abord`);

  const publie = manifestePublie(manifeste, versionPubliee, depot, module);
  const archiveNom = nomArchive(module), manifesteNom = nomManifeste(module);
  const texteManifeste = `${JSON.stringify(publie, null, 2)}\n`;
  const fichiers = fichiersDuModule(racineModule).filter(f => f !== "module.json");
  const entrees = [
    { nom: "module.json", donnees: Buffer.from(texteManifeste, "utf8") },
    ...fichiers.map(f => ({ nom: f, donnees: readFileSync(join(racineModule, f)), date: statSync(join(racineModule, f)).mtime }))
  ];
  const archive = zip(entrees);

  const dossierSortie = resolve(racineDepot, sortie);
  mkdirSync(dossierSortie, { recursive: true });
  writeFileSync(join(dossierSortie, archiveNom), archive);
  writeFileSync(join(dossierSortie, manifesteNom), texteManifeste);
  const empreinte = createHash("sha256").update(archive).digest("hex");
  journal(`${module} ${versionPubliee} : ${entrees.length} fichiers, ${(archive.length / 1024 / 1024).toFixed(2)} Mo -> ${join(sortie, archiveNom)} (sha256 ${empreinte.slice(0, 12)}…)`);
  journal(`manifeste publié -> ${join(sortie, manifesteNom)} (manifest ${publie.manifest}, download ${publie.download})`);
  return { version: versionPubliee, fichiers: entrees.length, octets: archive.length, sha256: empreinte, manifeste: publie };
}

if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  try {
    const o = options(process.argv.slice(2));
    empaqueter({ ...o });
  } catch (erreur) {
    console.error(`empaqueter-module : ${erreur.message}`);
    process.exit(1);
  }
}
