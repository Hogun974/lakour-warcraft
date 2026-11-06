// Liens « dernière release » selon l'hôte du dépôt : GitHub (vitrine publique) ou Forgejo (dépôt interne de LaKour, dont le
// Foundry de Jordan tire lakour-warcraft).
import { test } from "node:test";
import assert from "node:assert/strict";
import { lienDerniere } from "../outils/empaqueter-module.mjs";

test("lien de la dernière release : forme GitHub ou forme Forgejo", () => {
  assert.equal(lienDerniere("https://github.com/Hogun974/lakour-warcraft", "module.json"), "https://github.com/Hogun974/lakour-warcraft/releases/latest/download/module.json");
  assert.equal(lienDerniere("https://code.lan.egaonoinu.re/hogun/lakour-warcraft", "lakour-warcraft-en.json"), "https://code.lan.egaonoinu.re/hogun/lakour-warcraft/releases/download/latest/lakour-warcraft-en.json");
  assert.equal(lienDerniere("http://172.20.1.191:3200/hogun/lakour-warcraft", "module.json"), "http://172.20.1.191:3200/hogun/lakour-warcraft/releases/download/latest/module.json");
});
