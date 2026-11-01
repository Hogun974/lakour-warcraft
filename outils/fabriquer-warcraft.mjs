// Fabrique les compendiums du module lakour-warcraft à partir des définitions de modules/lakour-warcraft/contenu/ :
// 1. rassemble les documents, 2. résout les références croisées, 3. copie les objets dans les acteurs,
// 4. emballe chaque aventure en un document Adventure (contenu/aventures-paquets.mjs), 5. écrit les sources JSON (src/),
// 6. compile en LevelDB (packs/).
// Usage : npm run fabriquer-warcraft        (option --sans-compiler pour vérifier seulement)
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { MODULE, identifiant } from "../modules/lakour-warcraft/contenu/aides.mjs";
import { DOCUMENTS } from "../modules/lakour-warcraft/contenu/index.mjs";
import { paquetsAventures } from "../modules/lakour-warcraft/contenu/aventures-paquets.mjs";

const RACINE = `modules/${MODULE}`;
export const TYPE_PACK = { peuples: "Item", historiques: "Item", objets: "Item", dons: "Item", afflictions: "Item", sorts: "Item", classes: "Item", bestiaire: "Actor", tables: "RollTable", journaux: "JournalEntry", scenes: "Scene", aventures: "Adventure" };

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

// Lancé directement (npm run fabriquer-warcraft) ; importé par les essais, on ne fait que fabriquer().
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  // Les aventures emballées sont fabriquées à part : fabriquer() reste la liste des documents des autres compendiums.
  const docs = fabriquer();
  docs.push(...paquetsAventures(docs));
  const parPack = Object.groupBy(docs, d => d.pack);
  for (const [pack, liste] of Object.entries(parPack)) {
    const dossier = `${RACINE}/src/${pack}`;
    rmSync(dossier, { recursive: true, force: true });
    mkdirSync(dossier, { recursive: true });
    for (const { cle, doc } of liste) writeFileSync(`${dossier}/${cle.split(":")[1]}.json`, `${JSON.stringify(doc, null, 2)}\n`);
    console.log(`${pack.padEnd(12)} ${liste.length} documents`);
  }
  if (!process.argv.includes("--sans-compiler")) {
    for (const pack of Object.keys(parPack)) {
      rmSync(`${RACINE}/packs/${pack}`, { recursive: true, force: true });
      await compilePack(`${RACINE}/src/${pack}`, `${RACINE}/packs/${pack}`);
    }
    console.log("compendiums compilés dans", `${RACINE}/packs/`);
  }
}
