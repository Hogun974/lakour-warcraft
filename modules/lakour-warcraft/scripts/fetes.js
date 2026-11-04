// Fêtes de saison des Tarides : les cinq déclinaisons que le module enregistre auprès du moteur lakour-mj-ia
// (modules/lakour-mj-ia/docs/fetes.md). Noël -> la Trêve des Présents, Nouvel An -> la Veille des Aïeux, Halloween -> la Nuit
// des Calebasses, Fête de la musique (solstice) -> les Tambours du Long Jour, Carnaval -> la Mascarade de Cabestan.
// Ce fichier est la SOURCE UNIQUE de la fête (id, fête du calendrier, nom, description, consigne, décor, liens de la carte) :
// contenu/fetes.mjs l'importe pour écrire les journaux, les contrats et les objets, et essais/warcraft-fetes.test.mjs vérifie
// que chaque uuid vise le bon document fabriqué et que le moteur accepte tout sans rien tronquer.
// Le registre du moteur vit en mémoire : on enregistre dans CHAQUE navigateur (joueurs compris), au crochet
// « lakour-mj-ia.pret » (appelé une fois, dans le « ready » du moteur, avec son API). Sans moteur, sans API des fêtes ou hors
// dnd5e : rien. Une déclinaison refusée (déjà enregistrée, fête déjà déclinée) est écrite en console sans bloquer les autres.
// Liens (contenu) : la carte est publique, et un document de compendium prend les droits du compendium (journaux : OBSERVER
// pour les joueurs) ; elle ne lie donc que ce que les joueurs peuvent lire : les objets et les contrats de la fête, jamais
// le journal du MJ (lié depuis la page « Fêtes de saison (MJ) » du guide du MJ).
//
// Bilingue : les textes français sont ceux des sources (nom, description, consigne, nom de chaque lien) ; leur version anglaise
// est sous « en » (mêmes liens, dans le même ordre : seul le nom affiché change, celui du dictionnaire contenu/en/<pack>.json).
// textesDeFete(f) rend la fête dans la langue du module (anglais dans lakour-warcraft-en, scripts/identite.js) :
// enregistrerFetes enregistre celle-là auprès du moteur. Le fabricant et les essais, dans node, lisent toujours le français.
import { ANGLAIS, ID } from "./identite.js"; // « lakour-warcraft » ou « lakour-warcraft-en » (version anglaise), selon le dossier du module
const C = `Compendium.${ID}`;

// Illustration d'une fête, en tête de la première page de son journal : assets/fetes/<fête du calendrier>.jpg.
export const illustrationDeFete = fete => `modules/${ID}/assets/fetes/${fete}.jpg`;

export const FETES_WARCRAFT = Object.freeze([
  {
    id: "treve-des-presents", fete: "noel", nom: "La Trêve des Présents",
    description: "Les nuits fraîchissent sur les Tarides : c'est la Trêve des Présents. Au Carrefour, l'Épineux du relais ploie sous les grelots d'os et les rubans de cuir ; à Theramore, un sapin venu du nord par bateau brille sur la place du port. À Cabestan, le Bureau de la Trêve reçoit les cadeaux que Horde et Alliance échangent, et les gobelins vendent des paquets-surprises à tous les coins de quai. On dit que la Vieille aux Grelots passe la nuit avec son kodo blanc et laisse un présent devant chaque tente.",
    consigne: "C'est la Trêve des Présents dans les Tarides : l'Épineux du Carrefour porte des grelots, Theramore a son sapin du nord, et Horde et Alliance échangent des cadeaux au Bureau de la Trêve de Cabestan",
    decor: { palette: "sapin", ornements: ["guirlandes", "bougies"] },
    contenu: [
      { uuid: `${C}.objets.Item.4eEWnR4a3ypxfeBv`, nom: "Grelot de l'Épineux" },
      { uuid: `${C}.objets.Item.NrePXf1GWBL4FFAr`, nom: "Galettes aux dattes de la Trêve" },
      { uuid: `${C}.objets.Item.VgjcohZu6CVLtYgr`, nom: "Paquet-surprise du Cartel" },
      { uuid: `${C}.tables.RollTable.cQvTkAAcP7SKGDTs`, nom: "Contrats de fête — La Trêve des Présents" },
      { uuid: `${C}.tables.RollTable.6zu15ES8qO7Pn3El`, nom: "Paquets-surprises du Cartel" }
    ],
    en: {
      nom: "The Truce of Presents",
      description: "The nights grow cool over the Barrens: it is the Truce of Presents. At the Crossroads, the waystation's Thorntree bends under bone bells and leather ribbons; in Theramore, a fir tree brought from the north by ship shines on the harbour square. In Ratchet, the Truce Office receives the gifts that Horde and Alliance exchange, and the goblins sell surprise packages on every corner of the docks. They say the Old Woman of the Bells passes in the night with her white kodo and leaves a present in front of every tent.",
      consigne: "It is the Truce of Presents in the Barrens: the Thorntree of the Crossroads wears bells, Theramore has its fir tree from the north, and Horde and Alliance exchange gifts at the Truce Office in Ratchet",
      contenu: ["Thorntree Bell", "Truce Date Cakes", "Cartel Surprise Package", "Festival Contracts — The Truce of Presents", "Cartel Surprise Packages"]
    }
  },
  {
    id: "veille-des-aieux", fete: "nouvel-an", nom: "La Veille des Aïeux",
    description: "La dernière nuit de l'année appartient aux aïeux. Sur la colline des cairns, au-dessus du Carrefour, les taurens allument une lampe-étoile pour chaque ancêtre et les plus vieux racontent jusqu'à l'aube. Les orcs récitent leurs lignées autour du feu ; à Theramore, la cloche du port sonne à minuit et l'on lit les noms de ceux qu'on a laissés en Lordaeron. À Cabestan, on solde ses dettes avant minuit : on n'entre pas dans l'année avec une ardoise. Honorer un ancien, même d'un autre peuple, porte chance.",
    consigne: "C'est la Veille des Aïeux : des lampes-étoiles brillent sur la colline des cairns du Carrefour, les anciens racontent jusqu'à l'aube, Theramore sonne la cloche de minuit et Cabestan solde ses dettes avant la nouvelle année",
    decor: { palette: "nuit", ornements: ["etoiles", "bougies"] },
    contenu: [
      { uuid: `${C}.objets.Item.YPfb0mtY5GIAoPkO`, nom: "Lampe-étoile des aïeux" },
      { uuid: `${C}.objets.Item.76qAdME0kPDRdtUx`, nom: "Pain de cendre des aïeux" },
      { uuid: `${C}.tables.RollTable.VdzdzwzHctZAc8TV`, nom: "Contrats de fête — La Veille des Aïeux" }
    ],
    en: {
      nom: "Ancestors' Eve",
      description: "The last night of the year belongs to the ancestors. On the cairn hill above the Crossroads, the tauren light a star lamp for each forebear and the eldest tell stories until dawn. The orcs recite their lineages around the fire; in Theramore, the harbour bell rings at midnight and the names of those left behind in Lordaeron are read out. In Ratchet, debts are settled before midnight: no one enters the year with a tab. Honouring an elder, even of another people, brings luck.",
      consigne: "It is Ancestors' Eve: star lamps shine on the cairn hill of the Crossroads, the elders tell stories until dawn, Theramore rings the midnight bell and Ratchet settles its debts before the new year",
      contenu: ["Ancestors' Star Lamp", "Ancestors' Ash Bread", "Festival Contracts — Ancestors' Eve"]
    }
  },
  {
    id: "nuit-des-calebasses", fete: "halloween", nom: "La Nuit des Calebasses",
    description: "À la fin de la saison sèche, chaque famille des Tarides creuse une calebasse pour chacun de ses morts de l'année, y taille un visage et y pose une chandelle : alignées au bord des pistes, elles montrent aux défunts le chemin des ancêtres, pour qu'ils ne s'égarent pas parmi les vivants. Les enfants vont de tente en tente demander « une braise pour mes morts » et repartent les poches pleines de sucre de cactus. À Theramore, les réfugiés de Lordaeron posent les leurs le long du marais, et l'Aube d'argent veille jusqu'au matin.",
    consigne: "C'est la Nuit des Calebasses : des calebasses creusées, une chandelle au cœur, bordent les pistes des Tarides pour guider les morts, les enfants réclament une braise pour leurs morts et l'Aube d'argent veille au bord du marais",
    decor: { palette: "braise", ornements: ["lanternes", "citrouilles", "feuilles"] },
    contenu: [
      { uuid: `${C}.objets.Item.d4CzjxL1Fxw00OiE`, nom: "Calebasse-lanterne" },
      { uuid: `${C}.objets.Item.4aaQCcIUTwszczSr`, nom: "Sucre de cactus de la Nuit" },
      { uuid: `${C}.tables.RollTable.0C7GDUAyigkK1yyc`, nom: "Contrats de fête — La Nuit des Calebasses" }
    ],
    en: {
      nom: "The Night of the Gourds",
      description: "At the end of the dry season, every family of the Barrens hollows out a gourd for each of its dead of the year, carves a face into it and sets a candle inside: lined up along the trails, they show the departed the way to the ancestors, so that they do not wander among the living. Children go from tent to tent asking for \"an ember for my dead\" and come back with their pockets full of cactus sugar. In Theramore, the refugees from Lordaeron set theirs along the marsh, and the Argent Dawn keeps watch until morning.",
      consigne: "It is the Night of the Gourds: hollowed gourds with a candle at their heart line the trails of the Barrens to guide the dead, children ask for an ember for their dead and the Argent Dawn keeps watch at the edge of the marsh",
      contenu: ["Gourd Lantern", "Cactus Sugar of the Night", "Festival Contracts — The Night of the Gourds"]
    }
  },
  {
    id: "tambours-du-long-jour", fete: "musique", nom: "Les Tambours du Long Jour",
    description: "Le jour le plus long, les tambours taurens battent de l'aube au couchant pour remercier le soleil. Le soir, un feu s'allume sur chaque colline, de Durotar à la côte : un coureur porte une torche du Carrefour jusqu'au feu suivant, et la Chaîne des feux traverse les Tarides en une nuit. On saute par-dessus les braises pour sceller un vœu. Sur les quais de Theramore, le Guet tient un concours de fifres et de luths ; à Cabestan, le Cartel tire des fusées au-dessus de la baie.",
    consigne: "Ce sont les Tambours du Long Jour : les tambours taurens battent du matin au soir, des feux s'allument sur les collines des Tarides, on saute les braises pour faire un vœu et le Cartel tire des fusées sur la baie de Cabestan",
    decor: { palette: "soleil", ornements: ["notes", "lanternes"] },
    contenu: [
      { uuid: `${C}.objets.Item.cmzugqT3XLvcSc0x`, nom: "Tambourin du Long Jour" },
      { uuid: `${C}.objets.Item.W8GJ32evgwLcCHfF`, nom: "Fusée gobeline du Long Jour" },
      { uuid: `${C}.objets.Item.6iGuNvvhR1ChaY5O`, nom: "Infusion de fleur-de-braise" },
      { uuid: `${C}.tables.RollTable.Dc0oNoBlthbgd1JP`, nom: "Contrats de fête — Les Tambours du Long Jour" }
    ],
    en: {
      nom: "The Drums of the Long Day",
      description: "On the longest day, the tauren drums beat from dawn to dusk to thank the sun. In the evening, a fire is lit on every hill, from Durotar to the coast: a runner carries a torch from the Crossroads to the next fire, and the Chain of Fires crosses the Barrens in a single night. People leap over the embers to seal a wish. On the docks of Theramore, the Watch holds a contest of fifes and lutes; in Ratchet, the Cartel fires rockets over the bay.",
      consigne: "It is the Drums of the Long Day: the tauren drums beat from morning to evening, fires are lit on the hills of the Barrens, people leap over the embers to make a wish and the Cartel fires rockets over the bay of Ratchet",
      contenu: ["Tambourine of the Long Day", "Goblin Rocket of the Long Day", "Emberbloom Infusion", "Festival Contracts — The Drums of the Long Day"]
    }
  },
  {
    id: "mascarade-de-cabestan", fete: "carnaval", nom: "La Mascarade de Cabestan",
    description: "Cinq jours durant, le port neutre de Cabestan se masque. La loi du Cartel est simple : sous un masque, on n'est personne, ni Horde ni Alliance, et nul ne peut être arrêté sur les quais pour une querelle de faction. On danse sur les barges, on marchande au Grand Bazar, on élit un « Baron d'un jour » parmi les dockers. Le soir du mardi gras, le Baron de paille, un pantin géant à l'effigie d'un gobelin trop riche, brûle dans la baie sous les huées et les fusées.",
    consigne: "C'est la Mascarade de Cabestan : sous un masque, on n'est ni Horde ni Alliance, les barges dansent, le Grand Bazar bat son plein et le Baron de paille brûlera dans la baie le soir du mardi gras",
    decor: { palette: "carnaval", ornements: ["masques", "confettis"] },
    contenu: [
      { uuid: `${C}.objets.Item.qx7bkD7JH5MV2miA`, nom: "Masque de la Mascarade" },
      { uuid: `${C}.objets.Item.aeZ9wnAkoJLpNt6g`, nom: "Sachet de confettis gobelins" },
      { uuid: `${C}.tables.RollTable.UZuebiV03AckjAAz`, nom: "Contrats de fête — La Mascarade de Cabestan" }
    ],
    en: {
      nom: "The Ratchet Masquerade",
      description: "For five days, the neutral port of Ratchet puts on its masks. The Cartel's law is simple: under a mask, you are no one, neither Horde nor Alliance, and no one may be arrested on the docks over a faction quarrel. People dance on the barges, haggle at the Grand Bazaar, and elect a \"Baron for a Day\" from among the dockers. On the evening of Shrove Tuesday, the Straw Baron, a giant effigy of a goblin grown too rich, burns in the bay amid jeers and rockets.",
      consigne: "It is the Ratchet Masquerade: under a mask, you are neither Horde nor Alliance, the barges are dancing, the Grand Bazaar is in full swing and the Straw Baron will burn in the bay on the evening of Shrove Tuesday",
      contenu: ["Masquerade Mask", "Bag of Goblin Confetti", "Festival Contracts — The Ratchet Masquerade"]
    }
  }
]);

// La fête dans la langue du module : la même, avec ses textes anglais (nom, description, consigne, nom de chaque lien) quand le
// module est lakour-warcraft-en. Identifiant, fête du calendrier, décor et uuid des liens ne changent pas ; « en » n'est pas repris.
export function textesDeFete(f, anglais = ANGLAIS) {
  if (!anglais || !f.en) return f;
  const { en, ...reste } = f;
  return { ...reste, nom: en.nom, description: en.description, consigne: en.consigne,
    contenu: f.contenu.map((l, i) => ({ ...l, nom: en.contenu?.[i] ?? l.nom })) };
}

// Enregistre les fêtes auprès du moteur (api : celle que passe « lakour-mj-ia.pret »), dans la langue du module. Rend le nombre
// de fêtes enregistrées (celles déjà présentes dans le registre comptent : un second appel ne fait rien de plus).
export function enregistrerFetes(api, jeu = globalThis.game) {
  if (jeu?.system?.id !== "dnd5e") return 0;
  const fetes = api?.fetes;
  if (typeof fetes?.enregistrer !== "function") return 0;
  let deja = [];
  try { deja = (fetes.lister?.() ?? []).map(d => d.id); } catch { deja = []; }
  let n = 0;
  for (const def of FETES_WARCRAFT) {
    if (deja.includes(def.id)) { n++; continue; }
    try {
      fetes.enregistrer(structuredClone(textesDeFete(def)));
      n++;
    } catch (erreur) { console.warn(`${ID} | fête ${def.id}`, erreur); }
  }
  return n;
}

globalThis.Hooks?.once?.("lakour-mj-ia.pret", api => { enregistrerFetes(api); });
