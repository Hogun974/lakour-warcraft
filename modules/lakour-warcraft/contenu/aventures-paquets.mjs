// Paquets d'aventure (document Adventure de Foundry v14, compendium « aventures ») : chaque aventure livrée en un clic,
// importable par l'outil natif de Foundry ou proposée à la création d'un monde (quickstart du manifeste).
// Une Adventure embarque des COPIES des documents des autres compendiums, avec les mêmes identifiants : l'import de
// Foundry garde les identifiants (keepId), donc les épingles des scènes (entryId, pageId) visent les journaux importés.
// Contenu d'une aventure : ses propres documents (PNJ, tables, journaux, cartes ; pas les lieux génériques « lieu-… ») et les
// acteurs, objets et tables que ses journaux citent par @UUID. Dans les copies, un lien vers un document embarqué
// devient un lien vers le document du monde (« Actor.<id> ») ; les autres liens restent vers le compendium du module.
// Forme stockée : un seul enregistrement « !adventures!<id> » avec les documents embarqués en entier (la CLI de Foundry
// n'éclate pas une aventure en sous-clés) ; les « _key » des copies sont donc retirées.
// Utilisé par outils/fabriquer-warcraft.mjs, après fabriquer().
import { readFileSync } from "node:fs";
import { MODULE, STATS, identifiant } from "./aides.mjs";
import { AVENTURE_DOCUMENTS } from "./aventure.mjs";
import { CAMPAGNE_DOCUMENTS } from "./campagne.mjs";
import { ONE_SHOT_DOCUMENTS } from "./one-shot.mjs";
import { CARTES_LIEUX } from "./lieux-cartes.mjs";
import { TITRE_AVENTURE } from "./aventure-cartes.mjs";
import { TITRE_CAMPAGNE } from "./campagne-cartes.mjs";
import { TITRE_ONE_SHOT } from "./one-shot-cartes.mjs";

// Version du contenu de l'installateur (scripts/main.js) : posée sur les journaux et scènes embarqués, pour que le bouton
// « Installer » les reconnaisse à jour au lieu de remplacer leurs pages (et leurs liens vers le monde) par celles du compendium.
export const VERSION_CONTENU = /const VERSION_CONTENU = "([^"]+)"/.exec(readFileSync(new URL("../scripts/main.js", import.meta.url), "utf8"))?.[1];
if (!VERSION_CONTENU) throw new Error("VERSION_CONTENU introuvable dans scripts/main.js");

// Champ de l'Adventure (common/documents/adventure.mjs) pour chaque type de document, et compendiums du module.
export const CHAMP_AVENTURE = { Actor: "actors", Item: "items", JournalEntry: "journal", Scene: "scenes", RollTable: "tables" };
const TYPE_PACK = { bestiaire: "Actor", journaux: "JournalEntry", scenes: "Scene", tables: "RollTable",
  peuples: "Item", historiques: "Item", objets: "Item", dons: "Item", afflictions: "Item", sorts: "Item", classes: "Item" };
// Types tirés des liens des journaux : un guide ou une carte de lieu cités restent au compendium.
const TYPES_CITES = new Set(["Actor", "Item", "RollTable"]);

const LIEUX = new Set(CARTES_LIEUX.map(c => c.__cle));
const PNJ_ET_JOURNAUX = docs => docs.map(d => d.__cle).filter(cle => !LIEUX.has(cle));

export const AVENTURES = [
  {
    cle: "puits-de-cendre", nom: TITRE_AVENTURE, sort: 100,
    img: `modules/${MODULE}/assets/cartes/cabestan-quai.svg`,
    legende: "Aventure de départ — niveaux 1 à 3, deux ou trois séances. Les Tarides, autour du port neutre de Cabestan.",
    resume: "Un contrat du Cartel Gentepression, des puits empoisonnés de cendre, un kraal huran sous influence et une mine où un prophète de la Lame ardente réveille un éclat de la Légion. Pour 3 à 5 personnages de l'Alliance, de la Horde ou mélangés.",
    cles: PNJ_ET_JOURNAUX(AVENTURE_DOCUMENTS)
  },
  {
    cle: "braises-de-la-legion", nom: TITRE_CAMPAGNE, sort: 200,
    img: `modules/${MODULE}/assets/cartes/cratere-brasegouffre.svg`,
    legende: "Campagne — niveaux 3 à 6, six à neuf séances. La suite des Puits de cendre, en quatre chapitres.",
    resume: "Quatre Braises de la Fournaise, quatre lieux des Tarides et de leur côte : la fonderie de Fort-Rivet, les ruines englouties d'Eldrassal, le sommet de Gué-de-Sel et le cratère de Brasegouffre, où la Lame ardente veut rouvrir un portail de la Légion. Horloge de 24 jours, deux aides de jeu.",
    cles: PNJ_ET_JOURNAUX(CAMPAGNE_DOCUMENTS)
  },
  {
    cle: "nuit-aux-deux-lanternes", nom: TITRE_ONE_SHOT, sort: 300,
    img: `modules/${MODULE}/assets/cartes/gue-brumeux-relais.svg`,
    legende: "One-shot — niveau 3, une soirée de 3 à 4 heures. Une nuit d'orage dans un relais au bord du marécage d'Âprefange.",
    resume: "L'orage bloque Alliance et Horde au relais des Deux Lanternes. Une recrue tombe malade, les morts sortent de la cave et tout accuse la réprouvée assise près du feu ; mais le bon docteur de Theramore a disparu, et sur l'îlot voisin, une cloche attend l'heure morte pour réveiller un cimetière de réfugiés. Trois cartes, deux aides de jeu, une table des bruits de la nuit.",
    cles: PNJ_ET_JOURNAUX(ONE_SHOT_DOCUMENTS)
  }
];

const LIEN = /@UUID\[([^\]]+)\]/g;
const UUID_MODULE = new RegExp(`Compendium\\.${MODULE}\\.([a-z-]+)\\.(Actor|Item|JournalEntry|Scene|RollTable)\\.([A-Za-z0-9]{16})`, "g");

// Liens @UUID d'un document (texte des pages, descriptions…), tels qu'écrits.
export const liensDe = doc => [...JSON.stringify(doc).matchAll(LIEN)].map(m => m[1]);

const echapper = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Retire les « _key » (et seulement elles) à toute profondeur.
function sansCles(valeur) {
  if (Array.isArray(valeur)) return valeur.map(sansCles);
  if (!valeur || typeof valeur !== "object") return valeur;
  return Object.fromEntries(Object.entries(valeur).filter(([k]) => k !== "_key").map(([k, v]) => [k, sansCles(v)]));
}

// docs : sortie de fabriquer() ({ pack, cle, doc }). Rend les entrées du compendium « aventures ».
export function paquetsAventures(docs) {
  const parCle = new Map(docs.map(d => [d.cle, d]));
  const parUuid = new Map(docs.filter(d => TYPE_PACK[d.pack]).map(d => [`Compendium.${MODULE}.${d.pack}.${TYPE_PACK[d.pack]}.${d.doc._id}`, d]));

  return AVENTURES.map(a => {
    const _id = identifiant(`aventures:${a.cle}`);
    // Documents propres, puis acteurs, objets et tables cités par les journaux propres (sans doublon).
    const retenus = new Map();
    for (const cle of a.cles) {
      const d = parCle.get(cle);
      if (!d) throw new Error(`Aventure « ${a.nom} » : document introuvable ${cle}`);
      retenus.set(cle, d);
    }
    for (const d of [...retenus.values()].filter(d => d.pack === "journaux")) {
      for (const lien of liensDe(d.doc)) {
        const base = lien.split(".").slice(0, 5).join(".");
        if (!base.startsWith(`Compendium.${MODULE}.`)) continue;
        const cible = parUuid.get(base);
        if (!cible) throw new Error(`Aventure « ${a.nom} » : lien orphelin ${lien} dans ${d.cle}`);
        if (TYPES_CITES.has(TYPE_PACK[cible.pack])) retenus.set(cible.cle, cible);
      }
    }

    // Un dossier par type de document, au nom de l'aventure (même drapeau que les dossiers de l'installateur).
    const types = [...new Set([...retenus.values()].map(d => TYPE_PACK[d.pack]))];
    const dossiers = Object.fromEntries(types.map(type => [type, {
      _id: identifiant(`aventures:${a.cle}:dossier:${type}`), name: a.nom, type, description: "", folder: null,
      sorting: "a", sort: 0, color: "#1a3a5a", flags: { [MODULE]: { dossier: a.nom } }, _stats: STATS
    }]));

    // Liens vers un document embarqué : vers sa copie importée dans le monde.
    const embarques = new Set([...retenus.values()].map(d => d.doc._id));
    const versLeMonde = texte => texte.replace(UUID_MODULE, (uuid, _pack, type, id) => (embarques.has(id) ? `${type}.${id}` : uuid));

    const contenu = { actors: [], items: [], journal: [], scenes: [], tables: [] };
    for (const d of retenus.values()) {
      const type = TYPE_PACK[d.pack];
      const copie = sansCles(JSON.parse(versLeMonde(JSON.stringify(d.doc))));
      copie.folder = dossiers[type]._id;
      if (type === "JournalEntry" || type === "Scene") copie.flags = { ...copie.flags, [MODULE]: { ...copie.flags?.[MODULE], version: VERSION_CONTENU } };
      contenu[CHAMP_AVENTURE[type]].push(copie);
    }

    const liste = (titre, champ) => contenu[champ].length
      ? `<h3>${titre}</h3><ul>${contenu[champ].map(d => `<li>${echapper(d.name)}</li>`).join("")}</ul>` : "";
    return {
      pack: "aventures", cle: `aventures:${a.cle}`,
      doc: {
        _id, _key: `!adventures!${_id}`, name: a.nom, img: a.img,
        caption: `<p>${a.legende}</p>`,
        description: `<p>${a.resume}</p>`
          + "<p>L'import crée les documents ci-dessous, rangés dans un dossier au nom de l'aventure. Les journaux du MJ restent cachés aux joueurs ; les aides de jeu leur sont visibles.</p>"
          + liste("Journaux", "journal") + liste("Scènes", "scenes") + liste("Acteurs", "actors") + liste("Objets", "items") + liste("Tables", "tables"),
        ...contenu, combats: [], macros: [], cards: [], playlists: [], folders: Object.values(dossiers),
        folder: null, sort: a.sort, flags: { [MODULE]: { cle: a.cle } }, _stats: STATS
      }
    };
  });
}
