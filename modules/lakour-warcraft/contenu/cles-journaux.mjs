// Épingles de journal des cartes d'aventure et de campagne. Les journaux (aventure.mjs, campagne.mjs) importent les
// cartes pour leurs liens @UUID : les cartes ne peuvent donc pas importer les journaux à leur tour. Les identifiants
// sont recalculés ici comme journal() de aides.mjs les calcule (clé du journal, rang de la page) ; l'ordre des pages
// ci-dessous est comparé aux journaux construits par essais/warcraft-cartes-vivantes.test.mjs.
import { icone, identifiant } from "./aides.mjs";

// Titres des pages, dans l'ordre des journaux.
export const PAGES_JOURNAUX = {
  "aventure-puits-de-cendre": ["Synopsis (MJ)", "Scène 1 — Le contrat du Cartel", "Scène 2 — Le relais pillé",
    "Scène 3 — Le kraal de Ronceroc", "Scène 4 — La mine de Rouge-Veine", "Dénouements et récompenses", "PNJ et forces en présence"],
  "contrat-du-cartel": ["Contrat du Cartel", "La Trêve de Cabestan"],
  "campagne-braises-legion": ["Synopsis (MJ)", "Fil rouge et horloge", "Chapitre 1 — La fonderie de Fort-Rivet",
    "Chapitre 2 — Les ruines d'Eldrassal", "Chapitre 3 — Le sommet de Gué-de-Sel", "Chapitre 4 — La nuit des deux lunes",
    "Dénouements et récompenses", "PNJ et forces en présence"],
  "lettre-lame-ardente": ["Lettre de la Lame ardente"],
  "sauf-conduit-gue-de-sel": ["Sauf-conduit"]
};

// « cle#Titre de la page » (même syntaxe que les liens des journaux) -> { entryId, pageId } ; une cible inconnue est une erreur.
export function pageJournal(cible) {
  const [cle, titre] = cible.split("#");
  const pages = PAGES_JOURNAUX[cle];
  if (!pages) throw new Error(`Épingle vers un journal inconnu : ${cle}`);
  const rang = pages.indexOf(titre);
  if (rang < 0) throw new Error(`Épingle vers une page inconnue : ${cible}`);
  return { entryId: identifiant(`journaux:${cle}`), pageId: identifiant(`journaux:${cle}:${rang}`) };
}

// Épingle d'un plan de carte : cible « cle#Titre », case (x, y), texte affiché sous l'épingle, icône du cœur de
// Foundry (icons/svg/<nom>.svg, vérifiée dans la liste réelle de Foundry 14).
export const epingle = (cible, x, y, texte, nomIcone = "book") =>
  ({ x, y, texte, icone: icone(`icons/svg/${nomIcone}.svg`), ...pageJournal(cible) });
