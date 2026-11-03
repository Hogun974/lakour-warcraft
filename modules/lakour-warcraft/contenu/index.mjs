import { PEUPLES } from "./peuples.mjs";
import { HISTORIQUES } from "./historiques.mjs";
import { OBJETS } from "./objets-azeroth.mjs";
import { GUIDES, TABLES } from "./guides.mjs";
import { BESTIAIRE } from "./bestiaire.mjs";
import { AVENTURE_DOCUMENTS } from "./aventure.mjs";
import { CAMPAGNE_DOCUMENTS } from "./campagne.mjs";
import { ONE_SHOT_DOCUMENTS } from "./one-shot.mjs";
import { ARSENAL } from "./arsenal.mjs";
import { DONS } from "./dons.mjs";
import { AFFLICTIONS } from "./afflictions.mjs";
import { SORTS, LISTES_SORTS } from "./sorts.mjs";
import { AFFILIATIONS } from "./affiliations.mjs";
import { SOUS_CLASSES, CAPACITES_SOUS_CLASSES } from "./sous-classes.mjs";
import { CONSOMMABLES } from "./consommables.mjs";
import { REPUTATION_DOCUMENTS } from "./reputations.mjs";
import { DONJON_DOCUMENTS } from "./donjon.mjs";
import { MONTURES_DOCUMENTS } from "./montures.mjs";
import { RARES_DOCUMENTS } from "./rares.mjs";
import { CONTRATS_DOCUMENTS } from "./contrats.mjs";
import { COMPAGNONS } from "./compagnons.mjs";
import { METIERS_DOCUMENTS } from "./metiers.mjs";
import { GARNISON_DOCUMENTS } from "./garnison.mjs";
import { FETES_DOCUMENTS } from "./fetes.mjs";

// Tout le contenu du module, dans l'ordre des compendiums.
export const DOCUMENTS = [
  ...PEUPLES, ...HISTORIQUES, ...OBJETS, ...ARSENAL,
  ...DONS, ...AFFILIATIONS, ...AFFLICTIONS, ...SORTS,
  ...SOUS_CLASSES, ...CAPACITES_SOUS_CLASSES,
  ...GUIDES, ...TABLES, ...LISTES_SORTS,
  ...BESTIAIRE,
  ...AVENTURE_DOCUMENTS,
  ...CAMPAGNE_DOCUMENTS,
  ...ONE_SHOT_DOCUMENTS,
  // Suppléments « Tarides vivantes » (lot 1) : consommables, réputation, donjon de Mèche-Noire, montures, rares, contrats.
  ...CONSOMMABLES, ...REPUTATION_DOCUMENTS, ...DONJON_DOCUMENTS, ...MONTURES_DOCUMENTS, ...RARES_DOCUMENTS, ...CONTRATS_DOCUMENTS,
  // Lot 2 : familier du rôdeur, métiers (récolte, artisanat), garnison de faction (installations de bastion).
  ...COMPAGNONS, ...METIERS_DOCUMENTS, ...GARNISON_DOCUMENTS,
  // Fêtes de saison des Tarides (déclinaisons du calendrier du MJ IA, enregistrées par scripts/fetes.js).
  ...FETES_DOCUMENTS
];
