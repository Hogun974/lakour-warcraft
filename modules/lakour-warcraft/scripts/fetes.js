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
const ID = "lakour-warcraft";

// Illustration d'une fête, en tête de la première page de son journal : assets/fetes/<fête du calendrier>.jpg.
export const illustrationDeFete = fete => `modules/${ID}/assets/fetes/${fete}.jpg`;

export const FETES_WARCRAFT = Object.freeze([
  {
    id: "treve-des-presents", fete: "noel", nom: "La Trêve des Présents",
    description: "Les nuits fraîchissent sur les Tarides : c'est la Trêve des Présents. Au Carrefour, l'Épineux du relais ploie sous les grelots d'os et les rubans de cuir ; à Theramore, un sapin venu du nord par bateau brille sur la place du port. À Cabestan, le Bureau de la Trêve reçoit les cadeaux que Horde et Alliance échangent, et les gobelins vendent des paquets-surprises à tous les coins de quai. On dit que la Vieille aux Grelots passe la nuit avec son kodo blanc et laisse un présent devant chaque tente.",
    consigne: "C'est la Trêve des Présents dans les Tarides : l'Épineux du Carrefour porte des grelots, Theramore a son sapin du nord, et Horde et Alliance échangent des cadeaux au Bureau de la Trêve de Cabestan",
    decor: { palette: "sapin", ornements: ["guirlandes", "bougies"] },
    contenu: [
      { uuid: "Compendium.lakour-warcraft.objets.Item.4eEWnR4a3ypxfeBv", nom: "Grelot de l'Épineux" },
      { uuid: "Compendium.lakour-warcraft.objets.Item.NrePXf1GWBL4FFAr", nom: "Galettes aux dattes de la Trêve" },
      { uuid: "Compendium.lakour-warcraft.objets.Item.VgjcohZu6CVLtYgr", nom: "Paquet-surprise du Cartel" },
      { uuid: "Compendium.lakour-warcraft.tables.RollTable.cQvTkAAcP7SKGDTs", nom: "Contrats de fête — La Trêve des Présents" },
      { uuid: "Compendium.lakour-warcraft.tables.RollTable.6zu15ES8qO7Pn3El", nom: "Paquets-surprises du Cartel" }
    ]
  },
  {
    id: "veille-des-aieux", fete: "nouvel-an", nom: "La Veille des Aïeux",
    description: "La dernière nuit de l'année appartient aux aïeux. Sur la colline des cairns, au-dessus du Carrefour, les taurens allument une lampe-étoile pour chaque ancêtre et les plus vieux racontent jusqu'à l'aube. Les orcs récitent leurs lignées autour du feu ; à Theramore, la cloche du port sonne à minuit et l'on lit les noms de ceux qu'on a laissés en Lordaeron. À Cabestan, on solde ses dettes avant minuit : on n'entre pas dans l'année avec une ardoise. Honorer un ancien, même d'un autre peuple, porte chance.",
    consigne: "C'est la Veille des Aïeux : des lampes-étoiles brillent sur la colline des cairns du Carrefour, les anciens racontent jusqu'à l'aube, Theramore sonne la cloche de minuit et Cabestan solde ses dettes avant la nouvelle année",
    decor: { palette: "nuit", ornements: ["etoiles", "bougies"] },
    contenu: [
      { uuid: "Compendium.lakour-warcraft.objets.Item.YPfb0mtY5GIAoPkO", nom: "Lampe-étoile des aïeux" },
      { uuid: "Compendium.lakour-warcraft.objets.Item.76qAdME0kPDRdtUx", nom: "Pain de cendre des aïeux" },
      { uuid: "Compendium.lakour-warcraft.tables.RollTable.VdzdzwzHctZAc8TV", nom: "Contrats de fête — La Veille des Aïeux" }
    ]
  },
  {
    id: "nuit-des-calebasses", fete: "halloween", nom: "La Nuit des Calebasses",
    description: "À la fin de la saison sèche, chaque famille des Tarides creuse une calebasse pour chacun de ses morts de l'année, y taille un visage et y pose une chandelle : alignées au bord des pistes, elles montrent aux défunts le chemin des ancêtres, pour qu'ils ne s'égarent pas parmi les vivants. Les enfants vont de tente en tente demander « une braise pour mes morts » et repartent les poches pleines de sucre de cactus. À Theramore, les réfugiés de Lordaeron posent les leurs le long du marais, et l'Aube d'argent veille jusqu'au matin.",
    consigne: "C'est la Nuit des Calebasses : des calebasses creusées, une chandelle au cœur, bordent les pistes des Tarides pour guider les morts, les enfants réclament une braise pour leurs morts et l'Aube d'argent veille au bord du marais",
    decor: { palette: "braise", ornements: ["lanternes", "citrouilles", "feuilles"] },
    contenu: [
      { uuid: "Compendium.lakour-warcraft.objets.Item.d4CzjxL1Fxw00OiE", nom: "Calebasse-lanterne" },
      { uuid: "Compendium.lakour-warcraft.objets.Item.4aaQCcIUTwszczSr", nom: "Sucre de cactus de la Nuit" },
      { uuid: "Compendium.lakour-warcraft.tables.RollTable.0C7GDUAyigkK1yyc", nom: "Contrats de fête — La Nuit des Calebasses" }
    ]
  },
  {
    id: "tambours-du-long-jour", fete: "musique", nom: "Les Tambours du Long Jour",
    description: "Le jour le plus long, les tambours taurens battent de l'aube au couchant pour remercier le soleil. Le soir, un feu s'allume sur chaque colline, de Durotar à la côte : un coureur porte une torche du Carrefour jusqu'au feu suivant, et la Chaîne des feux traverse les Tarides en une nuit. On saute par-dessus les braises pour sceller un vœu. Sur les quais de Theramore, le Guet tient un concours de fifres et de luths ; à Cabestan, le Cartel tire des fusées au-dessus de la baie.",
    consigne: "Ce sont les Tambours du Long Jour : les tambours taurens battent du matin au soir, des feux s'allument sur les collines des Tarides, on saute les braises pour faire un vœu et le Cartel tire des fusées sur la baie de Cabestan",
    decor: { palette: "soleil", ornements: ["notes", "lanternes"] },
    contenu: [
      { uuid: "Compendium.lakour-warcraft.objets.Item.cmzugqT3XLvcSc0x", nom: "Tambourin du Long Jour" },
      { uuid: "Compendium.lakour-warcraft.objets.Item.W8GJ32evgwLcCHfF", nom: "Fusée gobeline du Long Jour" },
      { uuid: "Compendium.lakour-warcraft.objets.Item.6iGuNvvhR1ChaY5O", nom: "Infusion de fleur-de-braise" },
      { uuid: "Compendium.lakour-warcraft.tables.RollTable.Dc0oNoBlthbgd1JP", nom: "Contrats de fête — Les Tambours du Long Jour" }
    ]
  },
  {
    id: "mascarade-de-cabestan", fete: "carnaval", nom: "La Mascarade de Cabestan",
    description: "Cinq jours durant, le port neutre de Cabestan se masque. La loi du Cartel est simple : sous un masque, on n'est personne, ni Horde ni Alliance, et nul ne peut être arrêté sur les quais pour une querelle de faction. On danse sur les barges, on marchande au Grand Bazar, on élit un « Baron d'un jour » parmi les dockers. Le soir du mardi gras, le Baron de paille, un pantin géant à l'effigie d'un gobelin trop riche, brûle dans la baie sous les huées et les fusées.",
    consigne: "C'est la Mascarade de Cabestan : sous un masque, on n'est ni Horde ni Alliance, les barges dansent, le Grand Bazar bat son plein et le Baron de paille brûlera dans la baie le soir du mardi gras",
    decor: { palette: "carnaval", ornements: ["masques", "confettis"] },
    contenu: [
      { uuid: "Compendium.lakour-warcraft.objets.Item.qx7bkD7JH5MV2miA", nom: "Masque de la Mascarade" },
      { uuid: "Compendium.lakour-warcraft.objets.Item.aeZ9wnAkoJLpNt6g", nom: "Sachet de confettis gobelins" },
      { uuid: "Compendium.lakour-warcraft.tables.RollTable.UZuebiV03AckjAAz", nom: "Contrats de fête — La Mascarade de Cabestan" }
    ]
  }
]);

// Enregistre les fêtes auprès du moteur (api : celle que passe « lakour-mj-ia.pret »). Rend le nombre de fêtes enregistrées
// (celles déjà présentes dans le registre comptent : un second appel ne fait rien de plus).
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
      fetes.enregistrer(structuredClone(def));
      n++;
    } catch (erreur) { console.warn(`${ID} | fête ${def.id}`, erreur); }
  }
  return n;
}

globalThis.Hooks?.once?.("lakour-mj-ia.pret", api => { enregistrerFetes(api); });
