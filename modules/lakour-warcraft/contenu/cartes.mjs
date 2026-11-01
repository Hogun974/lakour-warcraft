// Cartes jouables du module : plans en cases convertis en scènes v14 par le même convertisseur que l'outil
// creer_scene du MJ IA (modules/lakour-mj-ia/scripts/cartes.js), fonds dessinés plat et relief, plans.json.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { planVersScene } from "../../lakour-mj-ia/scripts/cartes.js";
import { planVersSVG } from "../../lakour-mj-ia/scripts/cartes-rendu.js";
import { MODULE, STATS, identifiant } from "./aides.mjs";

// Fond dessiné de chaque carte : assets/cartes/<cle>.svg (plat) et assets/cartes/3d/<cle>.svg (relief),
// réécrits seulement s'ils ont changé. La scène pointe vers le plat ; le module bascule selon le style.
function ecrireFond(cle, plan) {
  for (const style of ["2d", "3d"]) {
    const { erreurs, svg } = planVersSVG(plan, { taille: 100, style });
    if (erreurs.length) throw new Error(`Fond de « ${cle} » (${style}) : ${erreurs.join(" ; ")}`);
    const dossier = new URL(style === "3d" ? "../assets/cartes/3d/" : "../assets/cartes/", import.meta.url);
    mkdirSync(dossier, { recursive: true });
    const fichier = new URL(`${cle}.svg`, dossier);
    let actuel = null;
    try { actuel = readFileSync(fichier, "utf8"); } catch { /* pas encore écrit */ }
    if (actuel !== svg) writeFileSync(fichier, svg);
  }
  return `modules/${MODULE}/assets/cartes/${cle}.svg`;
}

// Plans de toutes les cartes (assets/cartes/plans.json) : le MJ IA y lit pièces, éléments et portes pour placer
// les jetons « près de la forge » ; l'installateur les recopie dans les scènes déjà importées. Écrit une fois, après
// le chargement de tous les fichiers de cartes (microtâche).
const PLANS = {};
let ecriturePrevue = false;
function prevoirPlans() {
  if (ecriturePrevue) return;
  ecriturePrevue = true;
  queueMicrotask(() => {
    ecriturePrevue = false;
    const fichier = new URL("../assets/cartes/plans.json", import.meta.url);
    const json = `${JSON.stringify(PLANS, null, 1)}\n`;
    let actuel = null;
    try { actuel = readFileSync(fichier, "utf8"); } catch { /* pas encore écrit */ }
    if (actuel !== json) writeFileSync(fichier, json);
  });
}

// Un dessin exige un auteur (DocumentAuthorField, jamais nul), sinon le serveur rejette les étiquettes des pièces au
// chargement du compendium : auteur fictif fixe, remplacé par le MJ à l'import.
const AUTEUR_CARTES = identifiant("auteur-cartes");

// aventure (facultatif) : titre de l'aventure à laquelle la carte appartient (dossier de scènes à l'installation) ;
// les lieux génériques (clé « lieu-… ») n'en ont pas et restent dans le compendium.
export function scene({ cle, nom, plan, description, aventure }) {
  const { erreurs, scene: s } = planVersScene(plan, { taille: 100, distance: 1.5 });
  if (erreurs.length) throw new Error(`Carte « ${nom} » : ${erreurs.join(" ; ")}`);
  s.levels[0].background.src = ecrireFond(cle, plan);
  PLANS[cle] = plan;
  prevoirPlans();
  s.drawings = s.drawings.filter(d => d.hidden); // restent les étiquettes de pièces (MJ seulement)
  const _id = identifiant(`scenes:${cle}`);
  const embarquer = (liste, collection) => liste.map((d, i) => {
    const eid = d._id ?? identifiant(`scenes:${cle}:${collection}:${i}`);
    return { ...d, _id: eid, _key: `!scenes.${collection}!${_id}.${eid}`, flags: {} };
  });
  return {
    __pack: "scenes", __cle: `scenes:${cle}`,
    _id, _key: `!scenes!${_id}`, name: nom, navName: nom, navigation: true, active: false,
    ...s,
    levels: embarquer(s.levels, "levels"), walls: embarquer(s.walls, "walls"),
    drawings: embarquer(s.drawings, "drawings").map(d => ({ ...d, author: AUTEUR_CARTES })), lights: embarquer(s.lights, "lights"),
    // Scène vivante : sons d'ambiance, épingles de journal et zones ; les comportements d'une zone sont embarqués
    // un niveau plus bas (clé « !scenes.regions.behaviors!scène.zone.comportement », comme les effets des objets d'acteurs).
    sounds: embarquer(s.sounds, "sounds"), notes: embarquer(s.notes, "notes"),
    regions: embarquer(s.regions, "regions").map(r => ({ ...r, behaviors: r.behaviors.map(b => ({ ...b, _key: `!scenes.regions.behaviors!${_id}.${r._id}.${b._id}` })) })),
    tokens: [], tiles: [],
    ownership: { default: 0 }, folder: null, sort: 0,
    flags: { [MODULE]: { cle, description, plan, ...(aventure ? { aventure } : {}) } }, _stats: STATS
  };
}
