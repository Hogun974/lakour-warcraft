// Module anglais (lakour-warcraft-en) : les horloges de réputation des factions sont créées sous leur nom anglais, celui des
// dictionnaires (contenu/en/*.json) ; le module français garde les noms français. Les scripts sont copiés sous
// modules/lakour-warcraft-en/ (identite.js lit l'identifiant dans l'adresse), comme le fait le fabricant.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

globalThis.foundry ??= { applications: { api: { ApplicationV2: class {}, HandlebarsApplicationMixin: c => c, DialogV2: {} } }, utils: {} };
globalThis.Hooks ??= { once() {}, on() {} };

const MODULE = fileURLToPath(new URL("../modules/lakour-warcraft/", import.meta.url));
const appels = async main => {
  const faits = [];
  await main.assurerReputations({ modules: { get: () => ({ api: { horloges: { assurer: async o => { faits.push(o); } } } }) } });
  return faits;
};

test("réputations : noms anglais dans lakour-warcraft-en, français dans lakour-warcraft", async () => {
  const fr = await import(pathToFileURL(join(MODULE, "scripts/main.js")).href);
  const dossier = mkdtempSync(join(tmpdir(), "lakour-wow-en-"));
  try {
    cpSync(join(MODULE, "scripts"), join(dossier, "modules/lakour-warcraft-en/scripts"), { recursive: true });
    const en = await import(pathToFileURL(join(dossier, "modules/lakour-warcraft-en/scripts/main.js")).href);
    assert.deepEqual(Object.keys(en.NOMS_ANGLAIS), fr.REPUTATIONS_INSTALLEES.map(([cle]) => cle), "un nom anglais par faction, même ordre");
    const francais = await appels(fr), anglais = await appels(en);
    assert.deepEqual(francais.map(a => a.nom), fr.REPUTATIONS_INSTALLEES.map(([, nom]) => nom));
    assert.deepEqual(anglais.map(a => a.nom), Object.values(en.NOMS_ANGLAIS));
    assert.deepEqual(anglais.map(a => a.id), francais.map(a => a.id), "mêmes identifiants rep-<faction>");
    // Les noms anglais sont ceux des dictionnaires (journaux et tables traduits).
    const dictionnaires = readdirSync(join(MODULE, "contenu/en")).map(f => readFileSync(join(MODULE, "contenu/en", f), "utf8")).join("\n");
    for (const nom of Object.values(en.NOMS_ANGLAIS)) {
      const principal = nom.replace(/ \(.*\)$/, "");
      assert.ok(dictionnaires.includes(principal), `« ${principal} » absent des dictionnaires anglais`);
    }
  } finally { rmSync(dossier, { recursive: true, force: true }); }
});
