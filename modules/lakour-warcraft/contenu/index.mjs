import { PEUPLES } from "./peuples.mjs";
import { HISTORIQUES } from "./historiques.mjs";
import { OBJETS } from "./objets-azeroth.mjs";
import { GUIDES, TABLES } from "./guides.mjs";
import { BESTIAIRE } from "./bestiaire.mjs";
import { AVENTURE_DOCUMENTS } from "./aventure.mjs";
import { CAMPAGNE_DOCUMENTS } from "./campagne.mjs";

// Tout le contenu du module, dans l'ordre des compendiums.
export const DOCUMENTS = [
  ...PEUPLES, ...HISTORIQUES, ...OBJETS,
  ...GUIDES, ...TABLES,
  ...BESTIAIRE,
  ...AVENTURE_DOCUMENTS,
  ...CAMPAGNE_DOCUMENTS
];
