// Réputation auprès des factions d'Azeroth : paliers de Haï à Exalté, remises et objets chez l'intendant de chaque
// faction (l'Alliance de Theramore, la Horde du Carrefour et les huit ordres des affiliations), et le journal visible
// « Guide de la réputation ». Le suivi en jeu est une horloge du moteur (type « reputation », identifiant
// « rep-<clé> ») que l'installateur (scripts/main.js) crée pour chaque faction : sa liste REPUTATIONS_INSTALLEES doit
// rester celle-ci (essais/warcraft-tarides-vivantes.test.mjs). Textes originaux.
import { collection, journal } from "./aides.mjs";
import { liens } from "./guides.mjs";
import { OBJETS } from "./objets-azeroth.mjs";
import { ARSENAL } from "./arsenal.mjs";
import { AFFILIATIONS } from "./affiliations.mjs";
import { CONSOMMABLES } from "./consommables.mjs";

// Paliers : points de réputation (valeur de l'horloge rep-<clé>), attitude des gens de la faction, prix chez l'intendant.
export const PALIERS = [
  { cle: "hai", nom: "Haï", min: null, max: -30, prix: null, attitude: "On vous attaque à vue dans ses terres ; ses gardes ont votre signalement." },
  { cle: "hostile", nom: "Hostile", min: -29, max: -15, prix: null, attitude: "Portes fermées, armes tirées. On ne vous vend rien et on vous somme de partir." },
  { cle: "inamical", nom: "Inamical", min: -14, max: -1, prix: 25, attitude: "On vous sert de mauvaise grâce, plus cher, et on vous surveille." },
  { cle: "neutre", nom: "Neutre", min: 0, max: 9, prix: 0, attitude: "Un étranger parmi d'autres : prix affichés, ni faveur ni méfiance." },
  { cle: "amical", nom: "Amical", min: 10, max: 24, prix: -5, attitude: "On connaît votre nom ; l'intendant vous ouvre son premier rayon." },
  { cle: "honore", nom: "Honoré", min: 25, max: 44, prix: -10, attitude: "On vous confie des affaires sérieuses et on vous loge sans poser de questions." },
  { cle: "revere", nom: "Révéré", min: 45, max: 69, prix: -15, attitude: "Les chefs vous reçoivent ; vos ennemis deviennent ceux de la faction." },
  { cle: "exalte", nom: "Exalté", min: 70, max: null, prix: -20, attitude: "Un héros de la faction : on chante votre nom et on vous ouvre la réserve." }
];
export const PALIERS_RECOMPENSES = ["amical", "honore", "revere", "exalte"];

// Factions suivies. cle : identifiant de l'horloge (rep-<cle>) et de la faction ; affiliation : clé du don d'affiliation
// (dons:affiliation-<affiliation>) quand la faction est un ordre ; recompenses : objets du module par palier
// (« objets:<clé> ») et faveurs écrites.
export const REPUTATIONS = [
  {
    cle: "alliance", nom: "Alliance (Theramore)",
    intendant: "Maëlis Hautepierre, intendante du port de Theramore",
    lieu: "Un entrepôt de pierre sur les quais de Theramore, gardé par deux soldats du Guet. Le Bureau de la Trêve lui transmet les états de service de ceux qui travaillent dans les Tarides.",
    gagner: "contrats du tableau de Theramore, patrouilles avec le Guet, réfugiés escortés, preuves rapportées au Bureau de la Trêve.",
    perdre: "un soldat de l'Alliance blessé ou trahi, un accord passé en secret avec la Horde, la Trêve rompue par votre faute.",
    recompenses: {
      amical: ["objets:tourte-de-poisson-de-theramore", "objets:epee-de-la-garde"],
      honore: ["objets:cotte-de-la-garde", "objets:bouclier-du-lion"],
      revere: ["objets:arsenal-pique-de-theramore", "objets:cristal-d-heroisme"],
      exalte: ["objets:arsenal-cuirasse-de-hurlevent", "Un hippogriffe de Theramore prêté pour une saison, et les vols de Theramore gratuits."]
    }
  },
  {
    cle: "horde", nom: "Horde (Le Carrefour)",
    intendant: "Gornak Croc-Gris, intendant du Carrefour",
    lieu: "Une longue hutte de peaux près de l'enclos des wyvernes. Gornak tient ses comptes en nœuds de cuir et n'a jamais perdu une pièce.",
    gagner: "contrats du tableau du Carrefour, caravanes protégées, quilboars et centaures repoussés, hommages rendus aux anciens.",
    perdre: "un membre de la Horde blessé ou trahi, une insulte faite à un ancien, un marché passé dans le dos du chef de guerre.",
    recompenses: {
      amical: ["objets:ragout-de-kodo-epice", "objets:hache-d-orgrimmar"],
      honore: ["objets:harnois-de-grunt", "objets:arsenal-peaux-de-kodo", "objets:brochettes-de-raptor"],
      revere: ["objets:tambours-de-furie-sanguinaire"],
      exalte: ["objets:arsenal-corne-de-guerre-de-la-horde", "Un loup de guerre ou un raptor offert, et les vols de la Horde gratuits."]
    }
  },
  {
    cle: "cartel-gentepression", nom: "Cartel Gentepression", affiliation: "cartel-gentepression",
    intendant: "Nixi Pèse-Juste, comptable du Cartel à Cabestan",
    lieu: "Un comptoir à guichet grillagé au bout du quai de Cabestan. Nixi ne lève les yeux de son boulier que pour un client solvable.",
    gagner: "contrats du tableau de Cabestan, cargaisons livrées à l'heure, concurrents du Cartel Baille-Fonds mis hors d'affaire.",
    perdre: "une dette impayée, un combat dans un port du Cartel, un contrat signé puis rompu.",
    recompenses: {
      amical: ["objets:bombe-gobeline", "objets:lettre-de-change"],
      honore: ["objets:arsenal-canon-main-gobelin", "objets:arsenal-carreaux-explosifs"],
      revere: ["objets:arsenal-bottes-fusees-gobelines", "objets:arsenal-oeil-lunette-gobelin"],
      exalte: ["objets:flacon-des-titans-de-pierre", "Les gyroptères et les navires du Cartel gratuits, et une part dans une affaire de Cabestan."]
    }
  },
  {
    cle: "kirin-tor", nom: "Kirin Tor", affiliation: "kirin-tor",
    intendant: "Magistère Aldren Vif-Argent, quartier-maître du Kirin Tor",
    lieu: "Le rez-de-chaussée de la tour des mages de Theramore, entre deux étagères de grimoires sauvés des ruines de Dalaran.",
    gagner: "artefacts et livres remis à l'ordre, gangrène ou nécromancie signalées, mages sauvés.",
    perdre: "un artefact vendu en douce, un sort interdit lancé devant témoins, un mage de l'ordre blessé.",
    recompenses: {
      amical: ["objets:potion-de-mana-mineure"],
      honore: ["objets:flacon-de-sagesse-distillee", "objets:arsenal-robe-de-bataille-du-kirin-tor"],
      revere: ["objets:anneau-du-kirin-tor"],
      exalte: ["objets:arsenal-lame-de-givre-de-norfendre", "Un portail vers Theramore, une fois par aventure."]
    }
  },
  {
    cle: "cercle-cenarien", nom: "Cercle cénarien", affiliation: "cercle-cenarien",
    intendant: "Tahko Vent-Clair, gardien du Cercle aux oasis des Tarides",
    lieu: "Un bosquet de saules au bord d'une oasis du nord des Tarides, où un druide tauren reçoit sous un toit de branches vivantes.",
    gagner: "oasis et bêtes sauvées de la souillure, gangrène détruite, chasseurs trop gourmands raisonnés.",
    perdre: "un bosquet brûlé, une bête rare tuée pour son trophée, un éclat de gangrène gardé pour soi.",
    recompenses: {
      amical: ["objets:bandage-de-lin", "objets:potion-de-soins"],
      honore: ["objets:arsenal-gourdin-totemique", "objets:elixir-de-la-mangouste"],
      revere: ["objets:arsenal-totem-de-foudre"],
      exalte: ["objets:arsenal-larme-d-elune", "Un refuge sûr dans chaque bosquet du Cercle, et un druide qui répond à l'appel une fois par aventure."]
    }
  },
  {
    cle: "main-d-argent", nom: "Chevaliers de la Main d'argent", affiliation: "main-d-argent",
    intendant: "Frère Odric Pierrelune, quartier-maître des chevaliers",
    lieu: "La sacristie de la chapelle de Theramore, où l'on range autant d'armes que de livres de prières.",
    gagner: "réfugiés protégés, morts-vivants détruits, faibles défendus sans rien demander en retour.",
    perdre: "un innocent abandonné, une cruauté inutile, un serment rompu.",
    recompenses: {
      amical: ["objets:potion-de-soins"],
      honore: ["objets:arsenal-hallebarde-de-lordaeron"],
      revere: ["objets:arsenal-talisman-de-la-lumiere"],
      exalte: ["objets:marteau-de-la-main-d-argent", "Un chevalier de l'ordre rejoint le groupe pour une aventure."]
    }
  },
  {
    cle: "aube-d-argent", nom: "Aube d'argent", affiliation: "aube-d-argent",
    intendant: "Sœur Linnea Clairmatin, émissaire de l'Aube d'argent",
    lieu: "Une chambre louée au-dessus de la taverne de Cabestan, transformée en relais de l'Aube : cartes des Maleterres, caisses de bandages, et un lit toujours libre.",
    gagner: "serviteurs du Fléau abattus, nécromanciens livrés, preuves de la peste rapportées.",
    perdre: "un cadavre du Fléau laissé debout, un pacte avec un nécromancien, un allié de l'Aube abandonné.",
    recompenses: {
      amical: ["objets:potion-de-soins-majeure"],
      honore: ["objets:arsenal-balles-d-argent-de-gilneas"],
      revere: ["objets:flacon-de-peau-de-pierre"],
      exalte: ["objets:arsenal-harnois-de-la-lumiere", "Une place dans les bastions de l'Aube, où qu'ils soient."]
    }
  },
  {
    cle: "kor-kron", nom: "Garde kor'kron", affiliation: "kor-kron",
    intendant: "Grizzak Œil-Fendu, intendant kor'kron",
    lieu: "Une tente noire au cœur du Carrefour, gardée jour et nuit. Grizzak n'ouvre qu'à qui porte une recommandation d'un vétéran.",
    gagner: "émissaires de la Horde protégés, traîtres démasqués, missions discrètes menées sans bavardage.",
    perdre: "une mission ébruitée, un ordre discuté devant témoins, un Kor'kron abandonné.",
    recompenses: {
      amical: ["objets:arsenal-hache-kor-kron"],
      honore: ["objets:arsenal-bouclier-kor-kron"],
      revere: ["objets:flacon-de-rage-du-kodo"],
      exalte: ["objets:arsenal-brassards-du-gladiateur", "Une escorte kor'kron pour une mission, sans question."]
    }
  },
  {
    cle: "sentinelles", nom: "Sentinelles", affiliation: "sentinelles",
    intendant: "Ilwen Ombre-Pâle, intendante des Sentinelles",
    lieu: "Un poste de guet dans les arbres de la lisière, au nord des Tarides, d'où l'on surveille les bûcherons de la Horde.",
    gagner: "forêts défendues, bûcherons dissuadés sans sang versé, démons pourchassés.",
    perdre: "un arbre ancien abattu, une sentinelle blessée, un secret des elfes révélé.",
    recompenses: {
      amical: ["objets:arsenal-glaive-de-sentinelle"],
      honore: ["objets:arsenal-cuir-des-sentinelles", "objets:cape-de-sentinelle"],
      revere: ["objets:glaive-lunaire"],
      exalte: ["objets:arsenal-voile-des-gardiennes", "Un sabre-de-nuit prêté pour une saison."]
    }
  },
  {
    cle: "ligue-des-explorateurs", nom: "Ligue des explorateurs", affiliation: "ligue-des-explorateurs",
    intendant: "Bruni Martelfort, archiviste de la Ligue",
    lieu: "Le comptoir de la Ligue à Cabestan, un entrepôt encombré de caisses de fouilles, de cartes et de pierres gravées.",
    gagner: "ruines cartographiées, artefacts rapportés intacts, notes de fouilles lisibles.",
    perdre: "un site pillé, un artefact vendu au Cartel, une carte fausse.",
    recompenses: {
      amical: ["objets:arsenal-balles-de-forgefer"],
      honore: ["objets:arsenal-fusil-de-dun-morogh", "objets:arsenal-maille-lamellee-de-forgefer"],
      revere: ["objets:arsenal-poigne-de-forgefer"],
      exalte: ["objets:arsenal-demi-plate-de-mithril", "Votre nom gravé sur la plaque des membres d'honneur, et l'accès aux archives de Forgefer."]
    }
  }
];

// Faction connue ? (utilisé par les contrats).
export const reputation = cle => {
  const r = REPUTATIONS.find(x => x.cle === cle);
  if (!r) throw new Error(`Faction de réputation inconnue : ${cle} (${REPUTATIONS.map(x => x.cle).join(", ")})`);
  return r;
};

// ---------------------------------------------------------------- Journal visible

const lien = liens(OBJETS, ARSENAL, AFFILIATIONS, CONSOMMABLES);
const bornes = p => (p.min === null ? `${p.max} et moins` : p.max === null ? `${p.min} et plus` : `${p.min} à ${p.max}`);
const prix = p => (p.prix === null ? "aucune vente" : p.prix === 0 ? "prix affichés" : p.prix > 0 ? `+${p.prix} %` : `${p.prix} %`);
const NOM_PALIER = Object.fromEntries(PALIERS.map(p => [p.cle, p.nom]));
const recompense = r => (r.startsWith("objets:") ? lien(r) : r);

const pageFaction = f => ({
  titre: f.nom, texte: `
**Intendant :** ${f.intendant}.
${f.lieu}
${f.affiliation ? `\nAffiliation correspondante : ${lien(`dons:affiliation-${f.affiliation}`)}. Un membre de l'ordre commence au moins **Amical**.\n` : ""}
**Gagner de la réputation :** ${f.gagner}

**En perdre :** ${f.perdre}

**Chez l'intendant** (remise du palier sur le prix de l'objet)

${PALIERS_RECOMPENSES.map(p => `- **${NOM_PALIER[p]}** : ${f.recompenses[p].map(recompense).join(", ")}`).join("\n")}` });

export const GUIDE_REPUTATION = journal({
  cle: "guide-de-la-reputation", nom: "Guide de la réputation", visible: true,
  pages: [
    {
      titre: "Les paliers de réputation", texte: `
Chaque faction d'Azeroth se souvient de ce que vous avez fait pour elle, ou contre elle. Ce souvenir se compte en **points de réputation**, de Haï à Exalté. Tout le monde commence **Neutre (0)** auprès de chaque faction, sauf ce que votre peuple et votre passé y changent : un orc commence Amical auprès de la Horde, un elfe de la nuit auprès des Sentinelles ; le MJ peut aussi faire partir un personnage plus bas.

${PALIERS.map(p => `- **${p.nom}** (${bornes(p)}) — ${p.attitude} *Chez l'intendant : ${prix(p)}.*`).join("\n")}

**Remises.** La remise du palier s'applique à tout ce que vend l'intendant de la faction, et à ses marchands. Un objet d'un palier ne se vend qu'à partir de ce palier : à Honoré, vous achetez les objets Amical et Honoré.

**Une seule faction à la fois ?** Non : vous pouvez être Exalté auprès du Cartel et Haï par la Horde. Mais certaines factions se jalousent : quand vous gagnez de la réputation auprès de l'Alliance par un acte dirigé contre la Horde (ou l'inverse), le MJ peut vous en faire perdre autant de l'autre côté.` },
    {
      titre: "Gagner et perdre de la réputation", texte: `
**Barème** (points de réputation, à ajuster selon l'importance de l'acte)

- Contrat d'un tableau des contrats réussi : **+2 à +5** auprès de son commanditaire.
- Contrat échoué ou abandonné : **−1**.
- Service rendu en personne à un chef de la faction : **+5**.
- Chapitre de campagne ou aventure menés au bénéfice de la faction : **+10 à +15**.
- Butin rare remis à la faction plutôt que vendu (artefact, trophée d'un rare, preuve) : **+2 à +5**.
- Membre de la faction blessé par vous : **−5** ; tué : **−15**.
- Trahison publique : **−25**, et souvent le palier Haï d'un coup.

**Plafond par jour.** Un groupe ne gagne pas plus de **10 points** auprès d'une même faction en un jour de jeu : on ne devient pas un héros en vidant un tableau d'affichage.

**Toute la compagnie.** La réputation se gagne en groupe : chaque personnage présent reçoit les points. Un personnage de la faction adverse les reçoit aussi, mais les siens peuvent le lui reprocher.

**Suivi.** Le MJ IA tient une horloge de réputation par faction, au nom de la faction (identifiant « rep-alliance », « rep-kirin-tor »…), visible de tous : sa valeur est le nombre de points, et le palier se lit dans la liste de la première page.` },
    ...REPUTATIONS.map(pageFaction)
  ]
});

export const REPUTATION_DOCUMENTS = collection("reputation", [GUIDE_REPUTATION]);
