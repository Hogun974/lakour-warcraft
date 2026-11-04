// Identifiant du module, lu dans l'adresse de ce fichier : « lakour-warcraft » (français) ou « lakour-warcraft-en » (version
// anglaise, engendrée par outils/fabriquer-warcraft.mjs --langue en : mêmes scripts, mêmes _id de documents, drapeaux sous sa
// propre portée). Foundry sert chaque module sous /modules/<id>/ ; dans node (essais, contenu/fetes.mjs), le chemin du dépôt
// contient aussi modules/<id>/. Tout ce qui porte l'identifiant du module (réglages, drapeaux flags.<id>.*, compendiums
// « <id>.journaux », chemins « modules/<id>/… », uuid des fêtes, fenêtres) passe par ID : les deux modules fonctionnent
// sans autre changement.
export const ID_FRANCAIS = "lakour-warcraft";
export const ID = /\/modules\/([^/]+)\//.exec(decodeURIComponent(new URL(import.meta.url).pathname))?.[1] ?? ID_FRANCAIS;
// Version anglaise du module ?
export const ANGLAIS = ID !== ID_FRANCAIS;
