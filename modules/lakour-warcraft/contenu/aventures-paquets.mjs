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
// Version anglaise (fabriquer-warcraft.mjs --langue en) : paquetsAventures(documents traduits, { module: "lakour-warcraft-en",
// langue: "en" }) : les copies sont celles des documents traduits (mêmes _id), les textes du paquet (légende, résumé, phrase
// d'import, titres des listes) viennent d'ici, par langue ; le titre vient du drapeau « aventure » des cartes traduites (celui
// que l'installateur compare au dossier), ou de « en.nom » pour une aventure sans carte.
import { readFileSync } from "node:fs";
import { MODULE, STATS, identifiant } from "./aides.mjs";
import { AVENTURE_DOCUMENTS } from "./aventure.mjs";
import { CAMPAGNE_DOCUMENTS } from "./campagne.mjs";
import { ONE_SHOT_DOCUMENTS } from "./one-shot.mjs";
import { CARTES_LIEUX } from "./lieux-cartes.mjs";
import { TITRE_AVENTURE } from "./aventure-cartes.mjs";
import { TITRE_CAMPAGNE } from "./campagne-cartes.mjs";
import { TITRE_ONE_SHOT } from "./one-shot-cartes.mjs";
import { DONJON_DOCUMENTS, TITRE_DONJON } from "./donjon.mjs";
import { CONSOMMABLES } from "./consommables.mjs";
import { REPUTATION_DOCUMENTS } from "./reputations.mjs";
import { MONTURES_DOCUMENTS } from "./montures.mjs";
import { RARES_DOCUMENTS, TITRE_TARIDES } from "./rares.mjs";
import { CONTRATS_DOCUMENTS } from "./contrats.mjs";

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
    en: { nom: "The Ash Wells",
      legende: "Starter adventure — levels 1 to 3, two or three sessions. The Barrens, around the neutral port of Ratchet.",
      resume: "A contract from the Steamwheedle Cartel, wells poisoned with ash, a quilboar kraal under a dark influence and a mine where a Burning Blade prophet is waking a shard of the Legion. For 3 to 5 characters of the Alliance, the Horde, or both." },
    cles: PNJ_ET_JOURNAUX(AVENTURE_DOCUMENTS)
  },
  {
    cle: "braises-de-la-legion", nom: TITRE_CAMPAGNE, sort: 200,
    img: `modules/${MODULE}/assets/cartes/cratere-brasegouffre.svg`,
    legende: "Campagne — niveaux 3 à 6, six à neuf séances. La suite des Puits de cendre, en quatre chapitres.",
    resume: "Quatre Braises de la Fournaise, quatre lieux des Tarides et de leur côte : la fonderie de Fort-Rivet, les ruines englouties d'Eldrassal, le sommet de Gué-de-Sel et le cratère de Brasegouffre, où la Lame ardente veut rouvrir un portail de la Légion. Horloge de 24 jours, deux aides de jeu.",
    en: { nom: "Embers of the Legion",
      legende: "Campaign — levels 3 to 6, six to nine sessions. The sequel to The Ash Wells, in four chapters.",
      resume: "Four Embers of the Furnace, four places across the Barrens and their coast: the foundry of Fort Rivet, the drowned ruins of Eldrassal, the summit of Saltford and the crater of Emberchasm, where the Burning Blade means to reopen a Legion portal. A 24-day clock, two handouts." },
    cles: PNJ_ET_JOURNAUX(CAMPAGNE_DOCUMENTS)
  },
  {
    cle: "nuit-aux-deux-lanternes", nom: TITRE_ONE_SHOT, sort: 300,
    img: `modules/${MODULE}/assets/cartes/gue-brumeux-relais.svg`,
    legende: "One-shot — niveau 3, une soirée de 3 à 4 heures. Une nuit d'orage dans un relais au bord du marécage d'Âprefange.",
    resume: "L'orage bloque Alliance et Horde au relais des Deux Lanternes. Une recrue tombe malade, les morts sortent de la cave et tout accuse la réprouvée assise près du feu ; mais le bon docteur de Theramore a disparu, et sur l'îlot voisin, une cloche attend l'heure morte pour réveiller un cimetière de réfugiés. Trois cartes, deux aides de jeu, une table des bruits de la nuit.",
    en: { nom: "A Night at the Two Lanterns",
      legende: "One-shot — level 3, one evening of 3 to 4 hours. A stormy night in a waystation on the edge of Dustwallow Marsh.",
      resume: "The storm traps Alliance and Horde alike in the Two Lanterns waystation. A recruit falls ill, the dead climb out of the cellar and every finger points at the Forsaken woman sitting by the fire; but the good doctor from Theramore has vanished, and on the nearby islet a bell is waiting for the dead hour to wake a refugees' graveyard. Three maps, two handouts, a table of the noises of the night." },
    cles: PNJ_ET_JOURNAUX(ONE_SHOT_DOCUMENTS)
  },
  {
    cle: "raffinerie-de-meche-noire", nom: TITRE_DONJON, sort: 400,
    img: `modules/${MODULE}/assets/cartes/lieu-mine.svg`,
    legende: "Donjon — niveau 5, une séance. Trois boss à mécaniques dans une mine-raffinerie du Cartel Baille-Fonds, au nord de Cabestan.",
    resume: "Un contremaître ogre et ses wagonnets fous, un élémentaire de feu enchaîné à une chaudière qui monte en pression, et un baron gobelin dans un déchiqueteur géant au-dessus d'un broyeur. Actions légendaires et de repaire, phases à mi-vie, zones au sol, journal de rencontre pour les joueurs, une table de butin par boss et un ensemble de deux pièces. Se joue sur la carte générique « Lieu — Mine ».",
    en: { nom: "The Blackwick Refinery",
      legende: "Dungeon — level 5, one session. Three bosses with mechanics in a Bilgewater Cartel mine-refinery north of Ratchet.",
      resume: "An ogre foreman and his runaway mine carts, a fire elemental chained to a boiler building up pressure, and a goblin baron in a giant shredder above a crusher. Legendary and lair actions, half-health phases, ground zones, an encounter journal for the players, a loot table per boss and a two-piece set. Played on the generic map « Location — Mine »." },
    cles: PNJ_ET_JOURNAUX(DONJON_DOCUMENTS)
  },
  {
    cle: "tarides-vivantes", nom: TITRE_TARIDES, sort: 500,
    img: `modules/${MODULE}/assets/cartes/lieu-port.svg`,
    legende: "Supplément — niveaux 3 à 6. Contrats, rares, montures, routes aériennes, consommables et réputation pour la campagne des Tarides.",
    resume: "Les tableaux des contrats de Cabestan, du Carrefour et de Theramore (trois contrats par jour de jeu), neuf rares et élites errants avec leur butin garanti, cinq montures et les routes aériennes, Furie sanguinaire et Héroïsme, repas et flacons, et le guide de la réputation de dix factions, de Haï à Exalté.",
    en: { nom: "The Living Barrens",
      legende: "Supplement — levels 3 to 6. Contracts, rares, mounts, flight paths, consumables and reputation for the Barrens campaign.",
      resume: "The contract boards of Ratchet, the Crossroads and Theramore (three contracts per game day), nine wandering rares and elites with guaranteed loot, five mounts and the flight paths, Bloodlust and Heroism, meals and vials, and the reputation guide for ten factions, from Hated to Exalted." },
    cles: PNJ_ET_JOURNAUX([...CONSOMMABLES, ...REPUTATION_DOCUMENTS, ...MONTURES_DOCUMENTS, ...RARES_DOCUMENTS, ...CONTRATS_DOCUMENTS])
  }
];

// Textes du paquet (description de l'Adventure), par langue.
export const TEXTES = {
  fr: { import: "L'import crée les documents ci-dessous, rangés dans un dossier au nom de l'aventure. Les journaux du MJ restent cachés aux joueurs ; les aides de jeu leur sont visibles.",
    journal: "Journaux", scenes: "Scènes", actors: "Acteurs", items: "Objets", tables: "Tables" },
  en: { import: "Importing creates the documents listed below, filed in a folder named after the adventure. GM journals stay hidden from players; the handouts are visible to them.",
    journal: "Journals", scenes: "Scenes", actors: "Actors", items: "Items", tables: "Tables" }
};

const LIEN = /@UUID\[([^\]]+)\]/g;
const uuidModule = module => new RegExp(`Compendium\\.${module}\\.([a-z-]+)\\.(Actor|Item|JournalEntry|Scene|RollTable)\\.([A-Za-z0-9]{16})`, "g");

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
// module : identifiant du module dont les docs portent les uuid et les drapeaux (« lakour-warcraft », ou « lakour-warcraft-en »
// pour des documents traduits) ; langue : celle des textes du paquet (TEXTES, titre, légende et résumé de chaque aventure).
export function paquetsAventures(docs, { module = MODULE, langue = "fr" } = {}) {
  const parCle = new Map(docs.map(d => [d.cle, d]));
  const parUuid = new Map(docs.filter(d => TYPE_PACK[d.pack]).map(d => [`Compendium.${module}.${d.pack}.${TYPE_PACK[d.pack]}.${d.doc._id}`, d]));
  const UUID_MODULE = uuidModule(module);
  const textes = TEXTES[langue] ?? TEXTES.fr;

  return AVENTURES.map(a => {
    const _id = identifiant(`aventures:${a.cle}`);
    // Titre, légende et résumé dans la langue demandée : le titre est celui que portent les cartes (drapeau « aventure »,
    // traduit avec elles), sinon celui de l'aventure dans cette langue ; légende et résumé ceux de l'aventure (français par défaut).
    const nom = (langue === "fr" ? null : docs.find(d => d.pack === "scenes" && a.cles.includes(d.cle))?.doc.flags?.[module]?.aventure ?? a[langue]?.nom) ?? a.nom;
    const { legende, resume } = langue === "fr" ? a : (a[langue] ?? a);
    // Documents propres, puis acteurs, objets et tables cités par les journaux propres (sans doublon).
    const retenus = new Map();
    for (const cle of a.cles) {
      const d = parCle.get(cle);
      if (!d) throw new Error(`Aventure « ${nom} » : document introuvable ${cle}`);
      retenus.set(cle, d);
    }
    for (const d of [...retenus.values()].filter(d => d.pack === "journaux")) {
      for (const lien of liensDe(d.doc)) {
        const base = lien.split(".").slice(0, 5).join(".");
        if (!base.startsWith(`Compendium.${module}.`)) continue;
        const cible = parUuid.get(base);
        if (!cible) throw new Error(`Aventure « ${nom} » : lien orphelin ${lien} dans ${d.cle}`);
        if (TYPES_CITES.has(TYPE_PACK[cible.pack])) retenus.set(cible.cle, cible);
      }
    }

    // Un dossier par type de document, au nom de l'aventure (même drapeau que les dossiers de l'installateur).
    const types = [...new Set([...retenus.values()].map(d => TYPE_PACK[d.pack]))];
    const dossiers = Object.fromEntries(types.map(type => [type, {
      _id: identifiant(`aventures:${a.cle}:dossier:${type}`), name: nom, type, description: "", folder: null,
      sorting: "a", sort: 0, color: "#1a3a5a", flags: { [module]: { dossier: nom } }, _stats: STATS
    }]));

    // Liens vers un document embarqué : vers sa copie importée dans le monde.
    const embarques = new Set([...retenus.values()].map(d => d.doc._id));
    const versLeMonde = texte => texte.replace(UUID_MODULE, (uuid, _pack, type, id) => (embarques.has(id) ? `${type}.${id}` : uuid));

    const contenu = { actors: [], items: [], journal: [], scenes: [], tables: [] };
    for (const d of retenus.values()) {
      const type = TYPE_PACK[d.pack];
      const copie = sansCles(JSON.parse(versLeMonde(JSON.stringify(d.doc))));
      copie.folder = dossiers[type]._id;
      if (type === "JournalEntry" || type === "Scene") copie.flags = { ...copie.flags, [module]: { ...copie.flags?.[module], version: VERSION_CONTENU } };
      contenu[CHAMP_AVENTURE[type]].push(copie);
    }

    const liste = champ => contenu[champ].length
      ? `<h3>${textes[champ]}</h3><ul>${contenu[champ].map(d => `<li>${echapper(d.name)}</li>`).join("")}</ul>` : "";
    return {
      pack: "aventures", cle: `aventures:${a.cle}`,
      doc: {
        _id, _key: `!adventures!${_id}`, name: nom, img: a.img.replace(`modules/${MODULE}/`, `modules/${module}/`),
        caption: `<p>${legende}</p>`,
        description: `<p>${resume}</p><p>${textes.import}</p>`
          + liste("journal") + liste("scenes") + liste("actors") + liste("items") + liste("tables"),
        ...contenu, combats: [], macros: [], cards: [], playlists: [], folders: Object.values(dossiers),
        folder: null, sort: a.sort, flags: { [module]: { cle: a.cle } }, _stats: STATS
      }
    };
  });
}
