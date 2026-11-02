// Tableaux des contrats des plaques tournantes de la campagne (Cabestan, le Carrefour, Theramore) : une table de dix
// contrats par ville (traque, récolte, escorte, avis de recherche, livraison), chacun avec sa récompense en pièces d'or
// et en points de réputation auprès d'une faction de reputations.mjs. Chaque résultat porte aussi ces données en clair
// pour le moteur (flags.lakour-warcraft.contrat : { type, po, faction, reputation }). Journal caché « Tableau des
// contrats » : comment le MJ IA en tire trois par jour de jeu. Textes originaux.
import { MODULE, collection, journal, table } from "./aides.mjs";
import { jet, liens } from "./guides.mjs";
import { OBJETS } from "./objets-azeroth.mjs";
import { BESTIAIRE } from "./bestiaire.mjs";
import { reputation, GUIDE_REPUTATION } from "./reputations.mjs";
import { RARES, TABLES_RARES, TITRE_TARIDES } from "./rares.mjs";
import { DONJON_DOCUMENTS } from "./donjon.mjs";
import { CONSOMMABLES } from "./consommables.mjs";

export const TYPES_CONTRAT = { traque: "Traque", recolte: "Récolte", escorte: "Escorte", avis: "Avis de recherche", livraison: "Livraison" };

const lien = liens(RARES, BESTIAIRE, OBJETS, CONSOMMABLES, DONJON_DOCUMENTS);
const fiche = (cle, nom) => lien(`bestiaire:${cle}`, nom);

// c = [type, titre, commanditaire, texte, po, faction, points]
function resultat([type, titre, commanditaire, texte, po, faction, points]) {
  if (!TYPES_CONTRAT[type]) throw new Error(`Contrat « ${titre} » : type inconnu ${type}`);
  if (!Number.isInteger(po) || po <= 0 || !Number.isInteger(points) || points < 1 || points > 5) throw new Error(`Contrat « ${titre} » : récompense invalide`);
  const f = reputation(faction);
  return {
    titre: `${TYPES_CONTRAT[type]} — ${titre}`,
    texte: `**Commanditaire :** ${commanditaire}.\n\n${texte}\n\n**Récompense :** ${po} po et **+${points}** de réputation auprès de : ${f.nom}.`,
    contrat: { type, po, faction, reputation: points }
  };
}

function tableau(cle, ville, description, contrats) {
  const lignes = contrats.map(resultat);
  const t = table({ cle, nom: `Contrats — ${ville}`, formule: `1d${lignes.length}`, description, resultats: lignes.map((r, i) => [i + 1, i + 1, r]) });
  t.results.forEach((r, i) => { r.flags = { [MODULE]: { contrat: lignes[i].contrat } }; });
  t.flags[MODULE].aventure = TITRE_TARIDES;
  return t;
}

const AFFICHE = "Le MJ IA tire trois contrats par jour de jeu sur cette table (relancez les doublons et les contrats déjà pris) ; voir le journal « Tableau des contrats ».";

export const TABLES_CONTRATS = [
  tableau("contrats-cabestan", "Cabestan", `Le panneau de liège à l'entrée du comptoir du Cartel, sur le quai : affiches tamponnées de la roue dentée, notes griffonnées, primes. ${AFFICHE}`, [
    ["traque", "La bouche de fer des marais", "Nixi Pèse-Juste, au nom des bateliers du Cartel",
      `Un crocilisque énorme, ${fiche("rare-gueule-de-fer", "Gueule-de-Fer")}, coule les barques dans les marais salés au sud du port. Rapporter une de ses écailles dorsales. Les contrebandiers qui passent par là préfèreraient qu'on ne voie pas leur cargaison.`, 80, "cartel-gentepression", 4],
    ["traque", "Le roi aux coquillages", "la guilde des pêcheurs de Cabestan",
      `Un murloc couronné, ${fiche("rare-glouglou-premier", "Glouglou Premier")}, lève « l'impôt » sur les filets de trois villages de la côte. Le chasser, le tuer ou obtenir une trêve écrite (le Cartel accepte une empreinte de nageoire).`, 60, "cartel-gentepression", 3],
    ["recolte", "Sel blanc pour la saumure", "le saleur du quai, un gobelin pressé",
      `Rapporter vingt sacs de sel des marais salés avant la marée haute. Il faut un chariot, et chasser les crabes et les murlocs qui gardent les meilleurs bancs (${jet("Survie", 12)} pour trouver les bancs propres).`, 30, "cartel-gentepression", 2],
    ["recolte", "Tessons pour la Ligue", "Bruni Martelfort, archiviste de la Ligue des explorateurs",
      `Rapporter cinq fragments gravés des ruines d'Eldrassal, intacts et avec l'endroit exact où chacun a été trouvé (${jet("Histoire", 13)} pour reconnaître les bons). Les nagas y fouillent aussi.`, 45, "ligue-des-explorateurs", 3],
    ["escorte", "Le cartographe nerveux", "la Ligue des explorateurs",
      "Accompagner Pip Écrou-d'Argent, cartographe gnome qui sursaute à chaque bruit, jusqu'à la crique d'Eldrassal et le ramener avec ses relevés, en deux jours. Il veut tout mesurer, surtout là où il ne faut pas.", 50, "ligue-des-explorateurs", 3],
    ["escorte", "La caisse qu'on n'ouvre pas", "un intermédiaire du Cartel qui ne donne pas son nom",
      "Escorter un chariot jusqu'au Carrefour sans ouvrir la caisse plombée. Elle est tiède, elle bouge, et elle a faim la nuit (c'est un petit de wyverne promis à un dresseur). Les Kolkar en ont entendu parler.", 60, "cartel-gentepression", 3],
    ["avis", "Le capitaine au chapeau rouge", "le Cartel Gentepression, par affiche officielle",
      `Mort ou vif : ${fiche("rare-capitaine-sel-rouge", "Capitaine Sel-Rouge")}, corsaire du Cartel Baille-Fonds, pour le pillage de trois navires. Vivant, il rapporte 30 po de plus : le Cartel veut l'interroger.`, 90, "cartel-gentepression", 4],
    ["avis", "La raffinerie qui fume", "Grizzla Tordeboulon, en personne",
      `Fermer la raffinerie du baron Nizzel Baille-Fonds, au nord du port, et saisir ses comptes : voir ${lien("journaux:donjon-meche-noire", "le donjon de Mèche-Noire")}. La prime de l'affiche revient au groupe ; à la fermeture, Grizzla y ajoute 150 po par personnage, et 100 po pour le registre du baron.`, 150, "cartel-gentepression", 5],
    ["livraison", "Bandages pour l'Aube", "Sœur Linnea Clairmatin, de l'Aube d'argent",
      `Porter une caisse de ${lien("objets:bandage-de-lin", "bandages")} et d'eau bénite à une ferme en quarantaine sur la route du Carrefour. Les fermiers ont peur de tout le monde, et l'un d'eux cache un parent qui « ne va pas bien du tout ».`, 25, "aube-d-argent", 2],
    ["livraison", "Le pli du Kirin Tor", "un mage de passage, pressé de reprendre le bateau",
      "Porter un pli scellé à la tour des mages de Theramore sans l'ouvrir. Quelqu'un le veut : un voleur à la tire au port, puis un faux garde à l'arrivée. Ouvert, le pli ne contient qu'une liste d'artefacts, et le sceau brisé se voit.", 35, "kirin-tor", 3]
  ]),

  tableau("contrats-le-carrefour", "Le Carrefour", `Un poteau de bois au pied de la tour de guet, couvert d'affiches en orc, en taurahe et en commun. ${AFFICHE}`, [
    ["traque", "La bête aux yeux verts", "Gornak Croc-Gris, intendant du Carrefour",
      `Un loup gangrené, ${fiche("rare-crocs-de-cendre", "Crocs-de-Cendre")}, attaque les caravanes la nuit avec une meute qu'il a pervertie. Rapporter sa tête. Les chamans voudraient aussi savoir à quelle oasis il a bu.`, 60, "horde", 4],
    ["traque", "Le fer qui marche", "les éclaireurs de la route de Fort-Rivet",
      `Une machine gobeline sans pilote, ${fiche("rare-rouille-coeur", "Rouille-Cœur")}, a découpé deux kodos et une tente. L'arrêter. Vizzik Tirelire, à Fort-Rivet, paierait cher pour en récupérer le moteur.`, 70, "horde", 3],
    ["recolte", "Lichen de sang", "Tahko Vent-Clair, gardien du Cercle cénarien",
      `Gratter dix brins de lichen rouge sur les rochers autour du kraal de Ronceroc (${jet("Nature", 12)} pour ne pas abîmer la souche), sans provoquer les hurans. Les chamans en font un onguent contre la fièvre de gangrène.`, 30, "cercle-cenarien", 2],
    ["recolte", "Plumes pour les flèches", "la fléchière du Carrefour, une troll",
      `Rapporter douze longues plumes de ${fiche("harpie", "harpie")}, prises sur les pitons de la piste de Fort-Rivet. Les harpies chantent ; on dit que leur vieille matriarche chante mieux que toutes.`, 35, "horde", 2],
    ["escorte", "Le vieil homme et l'oasis", "le Cercle cénarien",
      "Escorter Ahote Corne-Lente, druide tauren très âgé, jusqu'à une oasis souillée où il veut chanter trois nuits pour la purifier. Il marche lentement et refuse qu'on tue les bêtes malades qui y boivent.", 50, "cercle-cenarien", 3],
    ["escorte", "La caravane de sel", "un marchand orc du Carrefour",
      "Escorter quatre kodos chargés de sel jusqu'à Gué-de-Sel, trois jours de piste. Les Kolkar rôdent, et l'un des conducteurs vend la route aux pillards.", 60, "horde", 3],
    ["avis", "Le déserteur", "Grizzak Œil-Fendu, pour les Kor'kron",
      "Ramener vivant le grunt Rakhar Dent-Fendue, qui a quitté son poste en volant six haches de guerre pour les vendre aux quilboars. Il se cache chez les hurans de Ronceroc. Les Kor'kron veulent les noms de ses acheteurs.", 70, "kor-kron", 4],
    ["avis", "Les pillards kolkar", "le chef de guerre du Carrefour",
      `Mort ou vif : ${fiche("rare-khan-ventrouge", "Khan Ventrouge")}, seigneur kolkar, qui pille les deux côtés de la frontière. Theramore offre la même prime : il ne faut pas que l'Alliance la touche avant nous.`, 80, "horde", 4],
    ["livraison", "Ordres scellés", "un messager kor'kron",
      "Porter des ordres scellés au porte-voix de la Horde à Gué-de-Sel, en mains propres et en deux jours. Un espion de la Lame ardente suit le groupe depuis le départ.", 40, "kor-kron", 3],
    ["livraison", "Graines d'oasis", "Tahko Vent-Clair",
      "Porter un sac de graines bénies par les druides à l'oasis du Bosquet-aux-Saules et les semer à la pleine lune. Les quilboars ont fait leur bauge près de l'eau.", 25, "cercle-cenarien", 2]
  ]),

  tableau("contrats-theramore", "Theramore", `Le tableau d'affichage du Guet, sous l'arche du port de Theramore, aux affiches bien alignées et tamponnées du lion. ${AFFICHE}`, [
    ["traque", "Le rire dans les collines", "Maëlis Hautepierre, au nom du Guet de Theramore",
      `Une chasseresse satyre, ${fiche("rare-vexxa-la-rieuse", "Vexxa la Rieuse")}, abat les éclaireurs de Theramore sur la route de Gué-de-Sel. La tuer, ou la faire fuir pour de bon. Pour des aventuriers aguerris (niveau 5 ou plus).`, 90, "alliance", 4],
    ["traque", "Le monstre de la route du sud", "un convoyeur de Theramore qui a tout perdu",
      `Un kodo couvert de verre noir, ${fiche("rare-sabot-de-verre", "Sabot-de-Verre")}, a renversé deux chariots sur la route de Gué-de-Sel. L'abattre ; les taurens demandent qu'on le fasse sans le faire souffrir, et le diront à qui voudra l'entendre.`, 80, "alliance", 3],
    ["recolte", "Fleurs-de-brume", "Magistère Aldren Vif-Argent, pour le Kirin Tor",
      `Cueillir huit fleurs-de-brume dans le marécage d'Âprefange, à l'aube et pas après (${jet("Nature", 13)} pour les reconnaître). Les alchimistes de la tour en font des potions de mana.`, 30, "kirin-tor", 2],
    ["recolte", "Échantillons de gangrène", "le Kirin Tor",
      `Prélever l'eau de trois oasis souillées des Tarides dans des fioles scellées (${jet("Arcanes", 13)} pour le faire sans se contaminer). Le Kirin Tor veut comprendre d'où vient la gangrène. La Lame ardente préfèrerait qu'il ne le comprenne pas.`, 45, "kirin-tor", 3],
    ["escorte", "Les réfugiés de Lordaeron", "Frère Odric Pierrelune, de la Main d'argent",
      "Escorter une douzaine de réfugiés jusqu'aux terres qu'on leur a promises au bord du marais, en évitant les patrouilles de la Horde nerveuses. L'un d'eux a été mordu par une goule et ne l'a dit à personne.", 40, "main-d-argent", 3],
    ["escorte", "La sentinelle blessée", "les Sentinelles",
      "Ramener l'éclaireuse Ilaria Feuille-Sombre, blessée et fiévreuse, jusqu'au poste de la Lisière au nord des Tarides. Elle a vu quelque chose dans les collines rouges et ne le dira qu'à son intendante.", 50, "sentinelles", 3],
    ["avis", "Le khan des collines rouges", "Maëlis Hautepierre",
      `Mort ou vif : ${fiche("rare-khan-ventrouge", "Khan Ventrouge")}, seigneur kolkar. Le Carrefour offre la même prime ; le Guet tient à ce que ce soit l'Alliance qui la touche.`, 80, "alliance", 4],
    ["avis", "Le docteur des marais", "Sœur Linnea Clairmatin, pour l'Aube d'argent",
      `Débusquer un ${fiche("necromancien-culte", "nécromancien du Culte des Damnés")} qui s'est installé dans une ferme abandonnée d'Âprefange et y « soigne » les mourants. Le ramener vivant pour qu'il soit jugé.`, 70, "aube-d-argent", 4],
    ["livraison", "Le courrier du capitaine", "un officier de Theramore",
      "Porter une lettre du capitaine Corwen Haldis au Bureau de la Trêve de Cabestan, avant le soir du troisième jour. La lettre parle de la Horde en termes peu diplomatiques : mieux vaut qu'elle ne tombe pas dans les mauvaises mains.", 25, "alliance", 2],
    ["livraison", "La caisse de mithril", "Bruni Martelfort, par lettre",
      "Porter une petite caisse de mithril brut, très lourde, du port de Theramore au comptoir de la Ligue à Cabestan. Le Cartel Baille-Fonds a payé quelqu'un pour la détourner en route.", 40, "ligue-des-explorateurs", 3]
  ])
];

// ---------------------------------------------------------------- Journal du MJ

const lienMJ = liens(TABLES_CONTRATS, TABLES_RARES, [GUIDE_REPUTATION], DONJON_DOCUMENTS);
const page = (ville, cle, texte) => ({ titre: ville, texte: `${texte}\n\nTable : ${lienMJ(`tables:${cle}`)}.` });

const JOURNAL_CONTRATS = journal({
  cle: "tableau-des-contrats", nom: "Tableau des contrats", visible: false, pages: [
    { titre: "Usage (MJ)", texte: `
Chaque plaque tournante de la campagne a son **tableau des contrats** : des petits travaux payés en pièces d'or et en réputation, pour occuper les jours entre deux chapitres et faire voyager le groupe dans les Tarides.

**Tirer trois contrats par jour de jeu.** Chaque matin où le groupe se trouve dans une ville (ou la veille de son départ), le MJ IA tire **trois fois** sur la table de la ville, relance les doublons et les contrats déjà pris ou accomplis, puis montre les trois affiches aux joueurs (titre, commanditaire, récompense). Les contrats qu'on ne prend pas sont arrachés le soir.

**Prendre un contrat.** Le groupe en prend autant qu'il veut parmi les trois, mais pas plus de **trois contrats en cours** à la fois. Un contrat se rend au commanditaire, ou à l'intendant de sa faction.

**Payer.** À la remise : les pièces d'or (outil d'argent du MJ IA), puis la réputation sur l'horloge de la faction (identifiant rep-<faction>, par exemple rep-cartel-gentepression), en respectant le plafond de 10 points par faction et par jour (voir le ${lienMJ("journaux:guide-de-la-reputation")}). Un contrat échoué ou abandonné coûte **1 point** auprès de la faction.

**Niveau.** Les récompenses sont prévues pour des personnages de niveau 3 à 4. Au niveau 5 ou 6, multipliez les pièces d'or par 1,5 (pas la réputation) et ajoutez un ou deux adversaires.

**Les cinq types de contrat**

- **Traque** : une créature précise à abattre, souvent un rare (voir ${lienMJ("tables:rares-nord-des-tarides", "les tables des rares")}) ; il est là où le contrat le dit, sans tirage.
- **Récolte** : rapporter une quantité de quelque chose, avec un test pour bien faire et un danger sur place.
- **Escorte** : protéger quelqu'un ou quelque chose sur une route ; tirez sur la table des rencontres sur la route.
- **Avis de recherche** : une personne recherchée, morte ou vive ; vivante, elle rapporte plus.
- **Livraison** : porter un objet ou un message, avec un délai ; quelqu'un veut l'intercepter.

**Faction et accès.** Au Carrefour, un membre de l'Alliance ne prend un contrat que s'il est **Neutre** ou mieux auprès de la Horde ; à Theramore, l'inverse. À Cabestan, port neutre, tout le monde signe. Un contrat dirigé contre une faction peut faire perdre de la réputation auprès d'elle (au jugement du MJ).

**Pour le moteur.** Chaque affiche porte ses données en clair (type, po, faction, points) dans le drapeau « contrat » de son résultat.` },
    page("Cabestan", "contrats-cabestan", `
Le port neutre du Cartel Gentepression. Le tableau est un panneau de liège à l'entrée du comptoir, sur le quai : la moitié des affiches portent la roue dentée du Cartel, l'autre moitié sont des notes griffonnées par des gens qui ont besoin d'aide et pas d'argent. Un gobelin tamponne chaque contrat pris (1 pa de frais d'écriture).

Factions : Cartel Gentepression, Ligue des explorateurs, Aube d'argent, Kirin Tor. Le contrat « La raffinerie qui fume » ouvre ${lienMJ("journaux:donjon-meche-noire", "le donjon de Mèche-Noire")}.`),
    page("Le Carrefour", "contrats-le-carrefour", `
Le relais de la Horde au cœur des Tarides. Le tableau est un poteau de bois au pied de la tour de guet, couvert d'affiches en orc, en taurahe et en commun ; un grunt lit les affiches à voix haute à qui ne sait pas lire. Les contrats se rendent à l'intendant Gornak Croc-Gris.

Factions : Horde, Garde kor'kron, Cercle cénarien.`),
    page("Theramore", "contrats-theramore", `
La cité portuaire de l'Alliance, au bord du marécage d'Âprefange. Le tableau du Guet est sous l'arche du port, aux affiches bien alignées et tamponnées du lion ; un sergent note le nom de chaque volontaire. Les contrats se rendent à l'intendante Maëlis Hautepierre.

Factions : Alliance, Kirin Tor, Chevaliers de la Main d'argent, Sentinelles, Aube d'argent, Ligue des explorateurs.`)
  ]
});

export const CONTRATS_DOCUMENTS = [...collection("contrats", TABLES_CONTRATS), ...collection("contrats", [JOURNAL_CONTRATS])];
