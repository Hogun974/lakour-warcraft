// Fabrique les jetons du module lakour-warcraft : un SVG autonome de 400×400 par PNJ du bestiaire (y compris les PNJ
// de l'aventure, de la campagne, du one-shot, du donjon de Mèche-Noire, les montures et les rares) et par figurant à part, en version plate (assets/jetons/<cle>.svg) et en relief
// (assets/jetons/3d/<cle>.svg) ; un jeton de personnage joueur par peuple jouable (assets/jetons/joueurs/<cle>.svg et
// joueurs/3d/<cle>.svg) avec leurs index (assets/jetons/index.json et index-3d.json : clé du peuple -> chemin, lus par
// le MJ IA quand il crée un personnage) ; la liste des types de figurants (assets/jetons/figurants.json) et les
// crédits (CREDITS.md : icônes CC BY 3.0, profils SRD 5.2 CC-BY-4.0, illustrations générées localement).
// Le dessin et la lecture des tracés sont les aides communes du moteur (modules/lakour-mj-ia/outils/jetons-commun.mjs,
// sous-module) ; icônes dans modules/lakour-mj-ia/outils/game-icons/.
// Correspondances PNJ -> icône et peuple -> icône : modules/lakour-warcraft/contenu/jetons.mjs.
// Usage : npm run fabriquer-jetons-warcraft                (puis npm run fabriquer-warcraft)
//         npm run fabriquer-jetons-warcraft -- --source <dossier icons-master de l'archive game-icons>
import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  argumentSource, controleurJetons, dessinerJetons, ecrivainDisque, lanceDirectement, lecteurDisque, lireIcone as lireIconeCommune, tableauCredits
} from "../modules/lakour-mj-ia/outils/jetons-commun.mjs";
import { BESTIAIRE } from "../modules/lakour-warcraft/contenu/bestiaire.mjs";
import { AVENTURE_DOCUMENTS } from "../modules/lakour-warcraft/contenu/aventure.mjs";
import { CAMPAGNE_DOCUMENTS } from "../modules/lakour-warcraft/contenu/campagne.mjs";
import { ONE_SHOT_DOCUMENTS } from "../modules/lakour-warcraft/contenu/one-shot.mjs";
import { DONJON_DOCUMENTS } from "../modules/lakour-warcraft/contenu/donjon.mjs";
import { MONTURES_DOCUMENTS } from "../modules/lakour-warcraft/contenu/montures.mjs";
import { RARES_DOCUMENTS } from "../modules/lakour-warcraft/contenu/rares.mjs";
import { COMPAGNONS } from "../modules/lakour-warcraft/contenu/compagnons.mjs";
import { PEUPLES } from "../modules/lakour-warcraft/contenu/peuples.mjs";
import {
  AUTEURS, COULEURS_ANNEAU, DOSSIER_JETONS, INDEX_JOUEURS, JETONS_FIGURANTS, JETONS_PEUPLES, JETONS_PNJ, LISERES, TYPES_FIGURANTS,
  cheminJeton, cheminJeton3d, cheminJetonJoueur, cheminJetonJoueur3d
} from "../modules/lakour-warcraft/contenu/jetons.mjs";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODULE = "lakour-warcraft";
export const FICHIER_FIGURANTS = `${DOSSIER_JETONS}/figurants.json`;

// Tracés d'une icône : copie locale (game-icons du moteur), sinon prise dans l'archive --source, vérifiée puis copiée.
export const lireIcone = (nom, source) => lireIconeCommune(nom, { auteurs: AUTEURS, source });

// ---------------------------------------------------------------- Liste des jetons

const PNJ = [...BESTIAIRE, ...AVENTURE_DOCUMENTS, ...CAMPAGNE_DOCUMENTS, ...ONE_SHOT_DOCUMENTS,
  ...DONJON_DOCUMENTS, ...MONTURES_DOCUMENTS, ...RARES_DOCUMENTS, ...COMPAGNONS].filter(d => d.__pack === "bestiaire" && d.type === "npc");
// Peuples jouables : les objets « race » du compendium peuples (pas leurs traits, qui sont des « feat »).
export const RACES = PEUPLES.filter(d => d.__pack === "peuples" && d.type === "race");

export function listeJetons(documents = PNJ, races = RACES) {
  const pnjs = documents.map(d => {
    const { cle, role } = d.flags[MODULE];
    const disposition = d.prototypeToken?.disposition ?? -1;
    return { cle, titre: d.name, icone: JETONS_PNJ[cle], anneau: COULEURS_ANNEAU[String(disposition)], lisere: LISERES[role] ?? null, plat: cheminJeton(cle), relief: cheminJeton3d(cle) };
  });
  const figurants = Object.entries(JETONS_FIGURANTS).map(([cle, f]) => ({
    cle, titre: f.titre, icone: f.icone, anneau: COULEURS_ANNEAU["0"], lisere: null, plat: cheminJeton(cle), relief: cheminJeton3d(cle), figurant: true
  }));
  const peuples = races.map(d => {
    const cle = d.flags[MODULE].cle;
    return { cle, titre: `Peuple — ${d.name}`, icone: JETONS_PEUPLES[cle], anneau: COULEURS_ANNEAU.joueur, lisere: null,
      plat: cheminJetonJoueur(cle), relief: cheminJetonJoueur3d(cle), peuple: true };
  });
  for (const j of [...pnjs, ...figurants, ...peuples]) {
    if (!j.icone) throw new Error(`Aucune icône pour ${j.cle} : ajouter la ligne dans contenu/jetons.mjs`);
    if (!j.anneau) throw new Error(`${j.cle} : disposition sans couleur d'anneau`);
  }
  const clesPnj = new Set(pnjs.map(j => j.cle));
  for (const cle of Object.keys(JETONS_PNJ)) if (!clesPnj.has(cle)) throw new Error(`contenu/jetons.mjs cite ${cle}, qui n'est pas un PNJ`);
  for (const cle of Object.keys(JETONS_FIGURANTS)) if (clesPnj.has(cle)) throw new Error(`Jeton de figurant ${cle} en double avec un PNJ`);
  const clesPeuples = new Set(peuples.map(p => p.cle));
  for (const cle of Object.keys(JETONS_PEUPLES)) if (!clesPeuples.has(cle)) throw new Error(`contenu/jetons.mjs cite le peuple ${cle}, qui n'est pas un objet race`);
  const connus = new Set([...clesPnj, ...figurants.map(f => f.cle)]);
  for (const [type, f] of Object.entries(TYPES_FIGURANTS)) {
    if (!f.libelle) throw new Error(`Type de figurant ${type} sans libellé`);
    if (!connus.has(f.jeton)) throw new Error(`Type de figurant ${type} : jeton ${f.jeton} inconnu`);
  }
  return { pnjs, figurants, peuples };
}

// Index des jetons de joueur (clé du peuple -> chemin du jeton), plat ("2d") ou relief ("3d").
export const indexJoueurs = (peuples, style) =>
  Object.fromEntries(peuples.map(p => [p.cle, style === "3d" ? cheminJetonJoueur3d(p.cle) : cheminJetonJoueur(p.cle)]));

// ---------------------------------------------------------------- Vérification (utilisée aussi par les essais)

const lireDisque = lecteurDisque(RACINE);

// docs : PNJ fabriqués (fabriquer-warcraft) ; lire(chemin relatif au dépôt) -> texte ou null si absent ;
// races : objets « race » (peuples jouables) dont on vérifie les jetons de joueur et les deux index.
export function verifierJetons(docs, lire = lireDisque, races = RACES) {
  const erreurs = [];
  const controler = controleurJetons(lire, erreurs);
  for (const d of docs.filter(x => x.type === "npc")) {
    const cle = d.flags?.[MODULE]?.cle;
    const attendu = cheminJeton(cle);
    if (d.img !== attendu) erreurs.push(`${d.name} : img ${d.img} au lieu de ${attendu}`);
    if (d.prototypeToken?.texture?.src !== attendu) erreurs.push(`${d.name} : texture du jeton ${d.prototypeToken?.texture?.src} au lieu de ${attendu}`);
    const couleur = COULEURS_ANNEAU[String(d.prototypeToken?.disposition ?? -1)]?.couleur;
    controler(attendu, d.name, couleur);
    controler(cheminJeton3d(cle), `${d.name} (3D)`, couleur);
  }
  // Jetons de joueur : un par peuple, plat et relief, anneau bleu acier, et les deux index qui y mènent.
  const { peuples } = listeJetons(PNJ, races);
  for (const style of ["2d", "3d"]) {
    const chemin = INDEX_JOUEURS[style];
    const brut = lire(chemin);
    if (brut === null) { erreurs.push(`${chemin} absent`); continue; }
    let index;
    try { index = JSON.parse(brut); } catch { erreurs.push(`${chemin} : JSON illisible`); continue; }
    const attendu = indexJoueurs(peuples, style);
    for (const cle of Object.keys(index)) if (!(cle in attendu)) erreurs.push(`${chemin} : clé ${cle} qui n'est pas un peuple`);
    for (const [cle, jeton] of Object.entries(attendu)) {
      if (index[cle] !== jeton) erreurs.push(`${chemin} : ${cle} -> ${index[cle]} au lieu de ${jeton}`);
      else controler(jeton, `peuple ${cle} (${style})`, COULEURS_ANNEAU.joueur.couleur);
    }
  }
  const texte = lire(FICHIER_FIGURANTS);
  if (texte === null) erreurs.push(`${FICHIER_FIGURANTS} absent`);
  else {
    const types = JSON.parse(texte);
    if (Object.keys(types).length < 12) erreurs.push(`figurants.json : ${Object.keys(types).length} types seulement`);
    for (const [type, f] of Object.entries(types)) {
      if (!f.libelle || !f.jeton) { erreurs.push(`figurants.json : ${type} incomplet`); continue; }
      for (const chemin of [cheminJeton(f.jeton), cheminJeton3d(f.jeton)]) if (lire(chemin) === null) erreurs.push(`figurants.json : ${type} -> ${chemin} absent`);
    }
  }
  return erreurs;
}

// ---------------------------------------------------------------- Crédits

export function credits({ pnjs, figurants, peuples = [] }) {
  const { lignes, auteurs } = tableauCredits([...pnjs, ...figurants, ...peuples], AUTEURS);
  return `# Crédits — La Kour Warcraft

Module de fan, non officiel, pour un usage privé à la table. Warcraft et les noms de son univers appartiennent à
Blizzard Entertainment ; Dungeons & Dragons appartient à Wizards of the Coast. Tous les textes de ce module
(descriptions, notes du MJ, aventure, aides de jeu) sont originaux.

## Règles et profils de créatures

Les profils chiffrés des créatures du bestiaire (caractéristiques, CA, points de vie, attaques et DD) sont adaptés
et renommés à partir du **System Reference Document 5.2** (« SRD 5.2 ») de Wizards of the Coast LLC, disponible sur
<https://www.dndbeyond.com/srd> et publié sous licence **Creative Commons Attribution 4.0 International
(CC BY 4.0)** : <https://creativecommons.org/licenses/by/4.0/legalcode>. Aucun texte du SRD n'est reproduit.

*This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC,
available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0
International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.*

## Sous-classe inspirée du SRD 5.1

La progression de la sous-classe d'ensorceleur **Aspect des Vols draconiques** (ancêtre et type de dégâts au choix,
points de vie supplémentaires par niveau, modificateur de Charisme ajouté aux dégâts du type de l'ancêtre, ailes,
présence effrayante ou charmante) suit celle de la lignée draconique du **System Reference Document 5.1** (« SRD 5.1 »)
de Wizards of the Coast LLC, publié sous licence **Creative Commons Attribution 4.0 International (CC BY 4.0)** :
<https://creativecommons.org/licenses/by/4.0/legalcode>. Les textes sont originaux ; aucun texte du SRD n'est reproduit.

*This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and
available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative
Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.*

## Illustrations

Les illustrations de l'écran d'accueil (\`assets/monde/fond.jpg\`) et des fêtes de saison (\`assets/fetes/*.jpg\`) ont été
générées localement avec ComfyStudio (FLUX.2 klein 9B), sans service distant, pour l'usage privé de la table.

## Icônes des jetons

Les silhouettes des jetons (\`assets/jetons/\`) sont des icônes de **[game-icons.net](https://game-icons.net)**,
publiées sous licence **Creative Commons Attribution 3.0 (CC BY 3.0)** :
<https://creativecommons.org/licenses/by/3.0/>. Source : <https://github.com/game-icons/icons>.

Icons made by ${auteurs}, from game-icons.net (CC BY 3.0).

Modifications : tracés recolorés et composés dans un médaillon (anneau de couleur selon l'attitude, bleu acier
pour les jetons de personnage joueur, fond en dégradé, ombre, liseré, version en relief). Fichiers produits par
\`outils/fabriquer-jetons-warcraft.mjs\` ; les correspondances PNJ → icône et peuple → icône sont dans
\`contenu/jetons.mjs\`.

| Icône | Auteur | Utilisée pour |
|---|---|---|
${lignes}
`;
}

// ---------------------------------------------------------------- Fabrication

export function fabriquerJetons({ source } = {}) {
  const liste = listeJetons();
  const ecrire = ecrivainDisque(RACINE);
  rmSync(join(RACINE, DOSSIER_JETONS), { recursive: true, force: true });
  dessinerJetons([...liste.pnjs, ...liste.figurants, ...liste.peuples], { ecrire, auteurs: AUTEURS, source });
  for (const style of ["2d", "3d"]) ecrire(INDEX_JOUEURS[style], `${JSON.stringify(indexJoueurs(liste.peuples, style), null, 2)}\n`);
  ecrire(FICHIER_FIGURANTS, `${JSON.stringify(TYPES_FIGURANTS, null, 2)}\n`);
  ecrire(`modules/${MODULE}/CREDITS.md`, credits(liste));
  return liste;
}

if (lanceDirectement(import.meta.url)) {
  const { pnjs, figurants, peuples } = fabriquerJetons({ source: argumentSource() });
  console.log(`${pnjs.length} jetons de PNJ, ${figurants.length} jetons de figurants et ${peuples.length} jetons de joueur (un par peuple), en version plate et en relief, dans ${DOSSIER_JETONS}/`);
  console.log(`Index des jetons de joueur : ${INDEX_JOUEURS["2d"]} et ${INDEX_JOUEURS["3d"]}`);
  console.log(`${Object.keys(TYPES_FIGURANTS).length} types de figurants dans ${FICHIER_FIGURANTS}`);
  console.log("Lancer ensuite : npm run fabriquer-warcraft");
}
