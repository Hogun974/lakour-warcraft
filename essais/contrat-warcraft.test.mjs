// lakour-warcraft respecte le contrat commun des modules de contenu du MJ IA (modules/lakour-mj-ia/outils/contrat-contenu.mjs) :
// figurants.json, index des jetons de joueur, jetons à plat et en relief, plans.json cohérent avec les scènes.
// Partie Warcraft de l'essai transversal « figurants : les deux modules de contenu fournissent figurants.json » de
// essais/parite.test.mjs de l'archive (foundry-modules@bc94625) ; chaque monde a le sien (parité).
import { test } from "node:test";
import assert from "node:assert/strict";
import { verifierModuleDeContenu } from "../modules/lakour-mj-ia/outils/contrat-contenu.mjs";

test("figurants : lakour-warcraft fournit figurants.json et ses index, avec des jetons qui existent (contrat commun)", () => {
  assert.deepEqual(verifierModuleDeContenu("modules/lakour-warcraft", { minFigurants: 10, minJoueurs: 8 }), []);
});
