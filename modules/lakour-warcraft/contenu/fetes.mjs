// Fêtes de saison des Tarides : cinq fêtes propres à la Kour Warcraft, déclinées du calendrier du moteur lakour-mj-ia
// (modules/lakour-mj-ia/docs/fetes.md) : Noël -> la Trêve des Présents, Nouvel An -> la Veille des Aïeux, Halloween -> la
// Nuit des Calebasses, Fête de la musique (solstice) -> les Tambours du Long Jour, Carnaval -> la Mascarade de Cabestan.
// Pour chacune : un journal du MJ caché (illustration en tête, ambiance au Carrefour, à Theramore, à Cabestan et dans les
// kraals, accroches), une table de trois contrats de fête (même format que contrats.mjs : po et réputation d'une faction de
// reputations.mjs), deux ou trois objets de fête (dnd5e 6.0.6, règles 2024, distances en mètres) ; une table de
// paquets-surprises pour la Trêve ; une page « Fêtes de saison (MJ) » ajoutée au guide du MJ.
// L'enregistrement auprès du moteur (nom, description, consigne au narrateur, décor, liens de la carte) est dans
// scripts/fetes.js, source unique que ce fichier importe ; essais/warcraft-fetes.test.mjs vérifie chaque uuid.
// Illustrations : modules/lakour-warcraft/assets/fetes/<id de la fête du calendrier>.jpg. Textes originaux : les fêtes
// d'Azeroth inspirent l'esprit, pas les noms ni les textes.
import { MODULE, ajouterPages, collection, icone, journal, ref, table } from "./aides.mjs";
import { GUIDES, jet, jetSauvegarde, liens } from "./guides.mjs";
import { consommable, equipement } from "./objets.mjs";
import { resultat, TABLES_CONTRATS } from "./contrats.mjs";
import { reputation, GUIDE_REPUTATION } from "./reputations.mjs";
import { BESTIAIRE } from "./bestiaire.mjs";
import { PNJ_AVENTURE } from "./aventure.mjs";
import { PNJ_CAMPAGNE } from "./campagne.mjs";
import { PNJ_ONE_SHOT } from "./one-shot.mjs";
import { RARES } from "./rares.mjs";
import { DONJON_DOCUMENTS } from "./donjon.mjs";
import { FETES_WARCRAFT, illustrationDeFete } from "../scripts/fetes.js";

export const TITRE_FETES = "Fêtes des Tarides";
// Chemin de l'illustration d'une fête (id du calendrier du moteur : noel, nouvel-an, halloween, musique, carnaval).
export const illustration = illustrationDeFete;

// ---------------------------------------------------------------- Les fêtes
// scripts/fetes.js est la source unique de ce que voit le moteur (id, fete, nom, description publique, consigne du narrateur,
// décor, liens de la carte). On n'ajoute ici que ce qui sert aux journaux : periode (rappel des dates pour le MJ),
// reputation (gains propres à la fête, [faction, points, pour quoi]) et alt (texte de l'illustration).
const DETAILS = {
  "treve-des-presents": {
    periode: "tout le mois de décembre, au plus fort du 24 au 26",
    reputation: [["alliance", 2, "un présent remis en main propre à l'intendante de Theramore par un personnage de la Horde"],
      ["horde", 2, "un présent remis à l'intendant du Carrefour par un personnage de l'Alliance"]],
    alt: "L'Épineux du Carrefour couvert de grelots, la nuit de la Trêve des Présents"
  },
  "veille-des-aieux": {
    periode: "du 31 décembre au 2 janvier, la nuit du 31 surtout",
    reputation: [["horde", 2, "un hommage rendu à un ancien de la Horde (un présent, une histoire écoutée jusqu'au bout, une lampe portée)"],
      ["cercle-cenarien", 2, "une lampe-étoile portée sur la colline des cairns pour un druide ou un ancien tauren"]],
    alt: "Des lampes-étoiles sur la colline des cairns au-dessus du Carrefour, la nuit de la Veille des Aïeux"
  },
  "nuit-des-calebasses": {
    periode: "du 25 octobre au 2 novembre, la nuit du 31 octobre surtout",
    reputation: [["aube-d-argent", 3, "un mort-vivant abattu ou un nid de goules nettoyé pendant la Nuit (en plus du barème habituel)"],
      ["main-d-argent", 2, "une procession de réfugiés protégée jusqu'à son cimetière"]],
    alt: "Des calebasses creusées et éclairées le long d'une piste des Tarides au crépuscule"
  },
  "tambours-du-long-jour": {
    periode: "du 20 au 22 juin, le jour du solstice surtout",
    reputation: [["horde", 2, "la torche de la Chaîne des feux portée d'une colline à la suivante pour le Carrefour"],
      ["alliance", 2, "la torche de la Chaîne des feux portée pour Theramore"],
      ["kirin-tor", 1, "une aide donnée aux mages qui préparent les lumières du port de Theramore"]],
    alt: "Des feux du solstice sur les collines des Tarides au coucher du soleil, des tambours taurens au premier plan"
  },
  "mascarade-de-cabestan": {
    periode: "du jeudi gras au mardi gras (dates mobiles)",
    reputation: [["cartel-gentepression", 2, "l'ordre gardé sur les quais pendant la Mascarade (un voleur arrêté, une rixe évitée)"],
      ["kor-kron", 2, "un espion démasqué et livré discrètement à la Garde kor'kron"]],
    alt: "Le port de Cabestan la nuit de la Mascarade, des danseurs masqués sur les barges et un pantin de paille géant"
  }
};
export const FETES = FETES_WARCRAFT.map(f => {
  if (!DETAILS[f.id]) throw new Error(`Fête sans détails dans contenu/fetes.mjs : ${f.id}`);
  return { ...structuredClone(f), ...DETAILS[f.id] };
});
for (const id of Object.keys(DETAILS)) if (!FETES.some(f => f.id === id)) throw new Error(`Détails d'une fête absente de scripts/fetes.js : ${id}`);
const FETE = Object.fromEntries(FETES.map(f => [f.id, f]));
for (const f of FETES) for (const [faction] of f.reputation) reputation(faction);   // faction inconnue : erreur

// Marque un document comme appartenant à une fête (drapeau lu par les essais et par le MJ IA).
const deFete = (id, doc) => { doc.flags[MODULE].fete = id; return doc; };

// ---------------------------------------------------------------- Objets de fête

const TREVE = "treve-des-presents", AIEUX = "veille-des-aieux", CALEBASSES = "nuit-des-calebasses", LONG_JOUR = "tambours-du-long-jour",
  MASCARADE = "mascarade-de-cabestan";

const OBJETS_TREVE = [
  deFete(TREVE, equipement({
    cle: "grelot-de-l-epineux", nom: "Grelot de l'Épineux", img: icone("instruments/bell-silver"),
    categorie: "trinket", rarete: "uncommon", magique: true, prix: [60, "gp"], poids: 0.5,
    texte: "Un grelot d'os poli décroché de l'Épineux du Carrefour à la fin de la Trêve des Présents, encore noué de son ruban de cuir rouge. Les anciens disent qu'il garde le son des rires de la fête.\n\nPar une **action bonus**, vous agitez le grelot : pendant **1 heure**, vous avez l'avantage aux tests de Charisme (Persuasion).\n\n**Une fois par jour** : le grelot retrouve sa voix à l'aube.",
    utilisations: { max: 1, periode: "dawn" },
    effets: [{ nom: "Bon cœur de la Trêve", transfert: false, duree: 3600, changements: [["system.skills.per.roll.mode", 1]], texte: "Pendant 1 heure : avantage aux tests de Charisme (Persuasion)." }],
    activites: [{ type: "utility", nom: "Agiter le grelot", activation: "bonus", portee: ["", "self"], duree: [1, "hour"], effets: [0] }]
  })),
  deFete(TREVE, consommable({
    cle: "galettes-aux-dattes-de-la-treve", nom: "Galettes aux dattes de la Trêve", img: icone("food/dried-fruit-candy-brown"),
    categorie: "food", prix: [5, "gp"], poids: 0.25, quantite: 4,
    texte: "Des galettes rondes de farine de maïs, fourrées de dattes de l'oasis et de miel de cactus, que les cuisinières du Carrefour cuisent par centaines pendant la Trêve, avec des dattes qui viennent de loin, et que les gobelins revendent au prix fort à Cabestan. On en glisse une dans chaque présent.\n\nPar une **action**, vous mangez une galette et récupérez **1d4 + 1** points de vie.",
    activites: [{ type: "heal", nom: "Manger une galette", activation: "action", portee: ["", "self"], soin: { des: "1d4", bonus: "1" } }]
  })),
  deFete(TREVE, consommable({
    cle: "paquet-surprise-du-cartel", nom: "Paquet-surprise du Cartel", img: icone("boxes/box-gift-green"),
    categorie: "trinket", prix: [10, "gp"], poids: 1,
    texte: "Une boîte de carton ciré, ficelée d'un ruban vert et tamponnée de la roue dentée du Cartel Gentepression : « Contenu garanti surprenant ». Les gobelins de Cabestan en vendent des piles entières pendant la Trêve des Présents, et personne n'a jamais su ce qu'il y aurait dedans.\n\nPar une **action**, vous ouvrez le paquet : lancez **1d8** sur la table **Paquets-surprises du Cartel** (le MJ l'a sous la main).",
    activites: [{ type: "utility", nom: "Ouvrir le paquet", activation: "action", portee: ["", "self"], jet: { nom: "Contenu du paquet", formule: "1d8" } }]
  }))
];

const OBJETS_AIEUX = [
  deFete(AIEUX, consommable({
    cle: "lampe-etoile-des-aieux", nom: "Lampe-étoile des aïeux", img: icone("treasure/brass-lamp-yellow"),
    categorie: "trinket", rarete: "common", magique: true, prix: [10, "gp"], poids: 0.5,
    texte: "Une petite lampe d'argile en forme d'étoile, emplie d'huile de graine-étoile pressée par les druides. Les taurens en allument une pour chaque ancêtre la nuit de la Veille des Aïeux ; on dit que la flamme ne vacille pas quand un aïeul écoute.\n\nPar une **action**, vous allumez la lampe et murmurez le nom d'un ancêtre : pendant **1 heure**, vous ajoutez **1d4** à vos jets de sauvegarde de Sagesse et de Charisme. Puis la lampe s'éteint, vide.",
    effets: [{ nom: "Veille des aïeux", transfert: false, duree: 3600, changements: [["system.abilities.wis.save.roll.bonus", "1d4"], ["system.abilities.cha.save.roll.bonus", "1d4"]], texte: "Pendant 1 heure : +1d4 aux jets de sauvegarde de Sagesse et de Charisme." }],
    activites: [{ type: "utility", nom: "Allumer la lampe", activation: "action", portee: ["", "self"], duree: [1, "hour"], effets: [0] }]
  })),
  deFete(AIEUX, consommable({
    cle: "pain-de-cendre-des-aieux", nom: "Pain de cendre des aïeux", img: icone("grains/bread-loaf-boule-rustic-brown"),
    categorie: "food", prix: [2, "gp"], poids: 2, utilisations: { max: 6, periode: "lr" },
    texte: "Une miche ronde cuite sous la cendre du feu des anciens, où chaque convive a jeté une poignée de grains de son pays. On la rompt à minuit en écoutant les histoires des vieux, et l'on se souvient mieux de tout, même de ce qu'on n'a jamais su.\n\nSix parts. Il faut **10 minutes** pour manger une part ; la créature qui la mange est **bien nourrie** jusqu'à son prochain **repos long** : +2 aux tests d'Intelligence (Histoire) et +1 aux tests de Sagesse (Intuition).\n\nUn seul repas « bien nourri » à la fois : un nouveau repas remplace le précédent.",
    effets: [{ nom: "Bien nourri — pain des aïeux", transfert: false, expiration: "longRest", changements: [["system.skills.his.roll.bonus", "2"], ["system.skills.ins.roll.bonus", "1"]], texte: "Bien nourri jusqu'au prochain repos long : +2 aux tests d'Intelligence (Histoire), +1 aux tests de Sagesse (Intuition)." }],
    activites: [{ type: "utility", nom: "Rompre une part", activation: "minute", activationValeur: 10, portee: ["", "touch"], cible: ["1", "creature"], effets: [0] }]
  }))
];

const OBJETS_CALEBASSES = [
  deFete(CALEBASSES, consommable({
    cle: "calebasse-lanterne", nom: "Calebasse-lanterne", img: icone("vegetable/squash-pumpkin-glow-orange"),
    categorie: "trinket", rarete: "common", magique: true, prix: [15, "gp"], poids: 2,
    texte: "Une calebasse creusée la Nuit des Calebasses, au visage taillé à la ressemblance d'un mort aimé, une chandelle bénie au cœur. Les morts qui ont oublié leur chemin n'en supportent pas le regard, et les vivants superstitieux guère mieux.\n\nPar une **action**, vous brandissez la calebasse allumée : chaque créature de votre choix dans un rayon de **3 m** autour de vous (les créatures que vous ciblez) fait un **jet de sauvegarde de Sagesse DD 12** ; en cas d'échec, elle est **effrayée** jusqu'à la fin de votre prochain tour. La chandelle s'éteint alors, consumée.",
    effets: [{ nom: "Le regard de la calebasse", transfert: false, duree: 6, etats: ["frightened"], texte: "Effrayé jusqu'à la fin du prochain tour de celui qui brandit la calebasse." }],
    activites: [{ type: "save", nom: "Brandir la calebasse", activation: "action", portee: ["", "self"], gabarit: ["radius", 3], cible: ["", "creature"], duree: [1, "round"],
      sauvegarde: { carac: ["wis"], dd: 12, reussite: "none" }, effets: [0] }]
  })),
  deFete(CALEBASSES, consommable({
    cle: "sucre-de-cactus", nom: "Sucre de cactus de la Nuit", img: icone("food/candy-taffy-yellow"),
    categorie: "food", prix: [5, "gp"], poids: 0.1, quantite: 5,
    texte: "Un bâtonnet de pulpe de cactus cuite au miel jusqu'à devenir dure et dorée, que l'on donne aux enfants qui viennent demander « une braise pour mes morts ». Les grands en gardent toujours un dans la poche cette nuit-là : on dit que le sucre chasse le froid des morts.\n\nPar une **action**, vous croquez un bâtonnet et gagnez **1d4 + 1** points de vie temporaires. Le sucre de la Nuit se fait avec la pulpe d'un cactus rare des collines rouges : il se vend cher, sauf aux enfants.",
    activites: [{ type: "heal", nom: "Croquer un bâtonnet", activation: "action", portee: ["", "self"], soin: { des: "1d4", bonus: "1", type: "temphp" } }]
  }))
];

const OBJETS_LONG_JOUR = [
  deFete(LONG_JOUR, equipement({
    cle: "tambourin-du-long-jour", nom: "Tambourin du Long Jour", img: icone("instruments/drum-brown-red"),
    categorie: "trinket", rarete: "uncommon", magique: true, prix: [120, "gp"], poids: 2,
    texte: "Un petit tambour de peau de kodo peint d'un soleil rouge, battu de l'aube au couchant le jour le plus long. Son rythme passe dans les jambes de ceux qui l'entendent.\n\nPar une **action bonus**, vous battez le rythme : chaque allié de votre choix dans un rayon de **9 m** autour de vous, vous compris, gagne **Rythme du Long Jour** pendant **10 minutes** (vitesse augmentée de 1,5 m, avantage aux tests de Charisme (Représentation)).\n\n**Une fois par jour** : la peau se retend à l'aube.",
    utilisations: { max: 1, periode: "dawn" },
    effets: [{ nom: "Rythme du Long Jour", transfert: false, duree: 600, changements: [["system.attributes.movement.bonus", "1.5"], ["system.skills.prf.roll.mode", 1]], texte: "Pendant 10 minutes : vitesse augmentée de 1,5 m, avantage aux tests de Charisme (Représentation)." }],
    activites: [{ type: "utility", nom: "Battre le rythme", activation: "bonus", portee: ["", "self"], gabarit: ["radius", 9], cible: ["", "ally"], duree: [10, "minute"], effets: [0] }]
  })),
  deFete(LONG_JOUR, consommable({
    cle: "fusee-gobeline-du-long-jour", nom: "Fusée gobeline du Long Jour", img: icone("light/explosion-star-glow-orange"),
    categorie: "trinket", prix: [25, "gp"], poids: 1,
    texte: "Un tube de carton rouge et or, une mèche courte, et la mention « Ne pas tenir par le mauvais bout » en trois langues. Le Cartel en tire des centaines au-dessus de la baie de Cabestan le soir du Long Jour ; une fusée détournée de son but éclate en gerbe d'étincelles aveuglantes.\n\nPar une **action**, vous allumez la fusée et la lancez vers un point situé à **18 m** au plus : chaque créature dans une sphère de **3 m** de rayon centrée sur ce point fait un **jet de sauvegarde de Dextérité DD 12**. En cas d'échec, elle subit **1d6 dégâts de feu** et elle est **aveuglée** jusqu'à la fin de votre prochain tour ; en cas de réussite, elle subit la moitié de ces dégâts et n'est pas aveuglée.",
    effets: [{ nom: "Ébloui par la fusée", transfert: false, duree: 6, etats: ["blinded"], texte: "Aveuglé jusqu'à la fin du prochain tour du lanceur." }],
    activites: [{ type: "save", nom: "Lancer la fusée", activation: "action", portee: [18, "m"], gabarit: ["sphere", 3], cible: ["", "creature"], duree: [1, "round"],
      sauvegarde: { carac: ["dex"], dd: 12, reussite: "half" }, degats: [{ des: "1d6", types: ["fire"] }], effets: [0] }]
  })),
  deFete(LONG_JOUR, consommable({
    cle: "infusion-de-fleur-de-braise", nom: "Infusion de fleur-de-braise", img: icone("drinks/tea-jug-glowing-brown-pink"),
    categorie: "potion", rarete: "uncommon", magique: true, prix: [80, "gp"], poids: 0.5,
    texte: "Une infusion rouge et tiède de fleurs-de-braise, ces fleurs des collines rouges qui ne s'ouvrent qu'au solstice. Les coureurs de la Chaîne des feux en boivent une gorgée avant de sauter les braises.\n\nPar une **action bonus**, vous buvez l'infusion : pendant **1 heure**, vous avez la **résistance aux dégâts de feu**.",
    effets: [{ nom: "Peau de braise", transfert: false, duree: 3600, changements: [["system.traits.dr.value", "fire"]], texte: "Pendant 1 heure : résistance aux dégâts de feu." }],
    activites: [{ type: "utility", nom: "Boire", activation: "bonus", portee: ["", "self"], duree: [1, "hour"], effets: [0] }]
  }))
];

const OBJETS_MASCARADE = [
  deFete(MASCARADE, equipement({
    cle: "masque-de-la-mascarade", nom: "Masque de la Mascarade", img: icone("treasure/mask-jeweled-gold"),
    categorie: "clothing", rarete: "uncommon", magique: true, harmonisation: true, prix: [150, "gp"], poids: 0.5,
    texte: "Un demi-masque de cuivre doré, serti de verroterie, ouvragé par un illusionniste gobelin de Cabestan. Celui qui le porte a la voix un peu plus grave, la démarche un peu plus souple, et personne ne jurerait l'avoir déjà vu.\n\nTant que vous portez le masque (équipé) et que vous y êtes **harmonisé**, vous avez l'avantage aux tests de Charisme (Tromperie). Par une **action**, vous pouvez changer à volonté la couleur du masque et des pierres qui l'ornent.",
    effets: [{ nom: "Masque de la Mascarade", changements: [["system.skills.dec.roll.mode", 1]], texte: "Masque porté : avantage aux tests de Charisme (Tromperie)." }]
  })),
  deFete(MASCARADE, consommable({
    cle: "sachet-de-confettis-gobelins", nom: "Sachet de confettis gobelins", img: icone("bags/sack-symbol-flower-yellow"),
    categorie: "trinket", prix: [2, "gp"], poids: 0.5, quantite: 3,
    texte: "Un petit sac de papier peint, bourré de confettis de métal brillant et d'une pincée de poudre qui pétille. À la Mascarade, on s'en lance des poignées à la figure ; les pickpockets s'en servent pour disparaître.\n\nPar une **action**, vous lancez le sachet vers un point situé à **9 m** au plus : chaque créature dans une sphère de **1,5 m** de rayon centrée sur ce point fait un **jet de sauvegarde de Dextérité DD 11** ; en cas d'échec, elle est **aveuglée** jusqu'au début de votre prochain tour.",
    effets: [{ nom: "Plein les yeux", transfert: false, duree: 6, etats: ["blinded"], texte: "Aveuglé jusqu'au début du prochain tour du lanceur." }],
    activites: [{ type: "save", nom: "Lancer le sachet", activation: "action", portee: [9, "m"], gabarit: ["sphere", 1.5], cible: ["", "creature"], duree: [1, "round"],
      sauvegarde: { carac: ["dex"], dd: 11, reussite: "none" }, effets: [0] }]
  }))
];

export const OBJETS_FETES = [...OBJETS_TREVE, ...OBJETS_AIEUX, ...OBJETS_CALEBASSES, ...OBJETS_LONG_JOUR, ...OBJETS_MASCARADE];

// ---------------------------------------------------------------- Tables : contrats de fête et paquets-surprises

const lien = liens(BESTIAIRE, PNJ_AVENTURE, PNJ_CAMPAGNE, PNJ_ONE_SHOT, RARES, OBJETS_FETES);
const fiche = (cle, nom) => lien(`bestiaire:${cle}`, nom);

// Trois contrats d'une fête : même forme et mêmes données que les tableaux des villes (contrats.mjs), à tirer en plus.
function contratsDeFete(id, contrats) {
  const f = FETE[id];
  const lignes = contrats.map(resultat);
  const t = table({
    cle: `fete-${id}-contrats`, nom: `Contrats de fête — ${f.nom}`, formule: `1d${lignes.length}`, resultats: lignes.map((r, i) => [i + 1, i + 1, r]),
    description: `Les affiches de ${f.nom}, punaisées sur les tableaux des contrats pendant la fête (${f.periode}). Le MJ IA en ajoute une aux trois contrats du jour, ou les propose toutes le jour le plus fort de la fête.`
  });
  t.results.forEach((r, i) => { r.flags = { [MODULE]: { contrat: lignes[i].contrat } }; });
  Object.assign(t.flags[MODULE], { aventure: TITRE_FETES, fete: id });
  return t;
}

const CONTRATS_FETES = [
  contratsDeFete(TREVE, [
    ["livraison", "Le sapin du capitaine", "le capitaine Corwen Haldis, envoyé de Theramore",
      `Un sapin du nord attend sur le quai de Cabestan : le porter jusqu'à la place du port de Theramore avant la veille du 24, droit, vert et entier. Une sentinelle jure qu'il a été coupé sans permission en Orneval et veut le saisir ; ${jet("Persuasion", 13)} pour la convaincre d'attendre que Theramore paie l'amende.`, 50, "alliance", 3],
    ["escorte", "La Vieille aux Grelots", "Hanuk Pas-de-Pluie, guide caravanier",
      `Hanuk, déguisé en Vieille aux Grelots, mène un kodo blanc chargé de présents vers les fermes et les campements des Tarides, jusqu'aux abords du kraal de Ronceroc. L'escorter trois nuits, sans gâcher la surprise des enfants ni laisser les hurans piller le chariot (${jet("Discrétion", 12)} pour passer devant une tente sans réveiller personne).`, 45, "horde", 3],
    ["traque", "Le voleur de grelots", "Gornak Croc-Gris, intendant du Carrefour",
      `Chaque matin, des grelots manquent à l'Épineux du relais. Les coupables sont les harpies de ${fiche("rare-plume-fiel", "Vieille Plume-Fiel")}, qui en tapissent leur nid sur les pitons de la piste de Fort-Rivet. Rapporter douze grelots ; la matriarche, elle, ne les rendra pas de bon gré.`, 40, "horde", 2]
  ]),
  contratsDeFete(AIEUX, [
    ["escorte", "Le dernier voyage d'Ahote", "Tahko Vent-Clair, gardien du Cercle cénarien",
      `Ahote Corne-Lente, le plus vieux druide des Tarides, veut monter une dernière fois sur la colline des cairns pour allumer ses lampes. Le porter, le soutenir, le défendre : la nuit, des ${fiche("centaure-kolkar", "Kolkar")} rôdent autour des cairns pour les piller.`, 40, "cercle-cenarien", 3],
    ["recolte", "L'huile des lampes", "les gardiens des cairns du Carrefour",
      `Rapporter six gourdes de graines-étoiles, ces graines huileuses qui poussent dans les éboulis du nord des Tarides (${jet("Nature", 12)} pour ne cueillir que les mûres). Sans elles, pas d'huile, et des ancêtres dans le noir.`, 30, "horde", 2],
    ["livraison", "Les noms des disparus", "Maëlis Hautepierre, intendante du port de Theramore",
      `Porter le registre des noms lus à minuit à Theramore jusqu'au cimetière des Rescapés, au bord du marécage d'Âprefange, et le déposer sur l'autel avant l'aube du premier jour de l'année. Il pleut, la piste est noyée et ${fiche("goule", "quelque chose")} rôde entre les tombes.`, 35, "alliance", 3]
  ]),
  contratsDeFete(CALEBASSES, [
    ["avis", "Le semeur de calebasses noires", "Sœur Linnea Clairmatin, de l'Aube d'argent",
      `Quelqu'un dépose des calebasses noires, peintes de runes, au bord des pistes ; là où elles brûlent, les morts se relèvent. Débusquer ce ${fiche("necromancien-culte", "nécromancien du Culte des Damnés")} et le ramener vivant pour qu'il soit jugé.`, 70, "aube-d-argent", 4],
    ["recolte", "Calebasses de l'oasis", "Gornak Croc-Gris, intendant du Carrefour",
      `Le Carrefour manque de calebasses : rapporter vingt grosses calebasses des jardins de l'oasis du Bosquet-aux-Saules, où des ${fiche("huran-guerrier", "hurans")} ont fait leur bauge (${jet("Athlétisme", 12)} pour charger le chariot avant leur retour).`, 25, "horde", 2],
    ["escorte", "La procession des Rescapés", "Frère Odric Pierrelune, de la Main d'argent",
      `Escorter une procession de réfugiés de Lordaeron, calebasses allumées, de Theramore au cimetière des Rescapés. Les ${fiche("goule", "goules")} du marais suivent les lumières comme des papillons.`, 45, "main-d-argent", 3]
  ]),
  contratsDeFete(LONG_JOUR, [
    ["livraison", "La flamme de la Chaîne", "Gornak Croc-Gris, intendant du Carrefour",
      `Porter la torche du feu du Carrefour jusqu'au feu de Gué-de-Sel avant le coucher du soleil, sans qu'elle s'éteigne. Les cavaliers de ${fiche("rare-khan-ventrouge", "Khan Ventrouge")} trouvent drôle de voler la flamme ; ${jet("Athlétisme", 13)} pour tenir le rythme de la course.`, 40, "horde", 3],
    ["recolte", "Poudre pour les fusées", "Grizzla Tordeboulon, intendante du Cartel",
      `Rapporter dix sacs de soufre des collines rouges pour les fusées de Cabestan (${jet("Survie", 12)} pour trouver les bons filons), avant que les ${fiche("harpie", "harpies")} n'emportent les sacs pour en garnir leurs nids.`, 30, "cartel-gentepression", 2],
    ["traque", "Les feux qui s'éteignent", "Tahko Vent-Clair, gardien du Cercle cénarien",
      `Sur trois collines, les feux du Long Jour s'éteignent d'un coup, étouffés par la terre. Les géomanciens de Ronceroc ont éveillé un ${fiche("elementaire-terre", "élémentaire de terre")} pour garder les hauteurs. L'apaiser ou le briser, et que les feux reprennent avant minuit.`, 50, "cercle-cenarien", 3]
  ]),
  contratsDeFete(MASCARADE, [
    ["avis", "Le masque qui vole", "Nixi Pèse-Juste, comptable du Cartel à Cabestan",
      `Un pickpocket au masque serti dépouille les danseurs sur les barges et disparaît dans une gerbe de confettis. C'est un employé du Cartel Baille-Fonds : le ramener vivant, avec sa bourse, et sans ôter le masque d'un innocent (${jet("Perception", 13)} pour le repérer dans la foule).`, 50, "cartel-gentepression", 3],
    ["escorte", "Un ambassadeur sans visage", "Grizzak Œil-Fendu, intendant kor'kron",
      `Escorter, masqué, un envoyé de la Horde jusqu'à une barge où l'attend un officier de Theramore, masqué lui aussi. Personne ne doit savoir qui parle à qui ; un ${fiche("cultiste-lame-ardente", "cultiste de la Lame ardente")} déguisé en danseur le sait déjà.`, 60, "kor-kron", 4],
    ["livraison", "Le Baron de paille", "Grizzla Tordeboulon, intendante du Cartel",
      `Tirer le Baron de paille, un pantin de six mètres sur un chariot, des entrepôts jusqu'au bout de la jetée avant le soir du mardi gras. Les hommes du baron Nizzel Baille-Fonds, vexés par la ressemblance, veulent le brûler trop tôt et au mauvais endroit (${jet("Perception", 12)} pour voir venir les torches).`, 30, "cartel-gentepression", 2]
  ])
];

// Paquets-surprises du Cartel (Trêve des Présents) : ce qu'il y a dans la boîte. Quelques objets de fête courants, et des
// surprises ; jamais un objet peu commun ou mieux. Le paquet (10 po) coûte plus que ce que son contenu rapporte en moyenne à la
// revente (moitié de la valeur, règle du module) : on l'achète pour la surprise, pas pour s'enrichir.
const PAQUETS = table({
  cle: "fete-treve-des-presents-paquets", nom: "Paquets-surprises du Cartel", formule: "1d8",
  description: "À tirer quand un personnage ouvre un paquet-surprise du Cartel pendant la Trêve des Présents.",
  resultats: [
    [1, 1, { titre: "Rien", texte: "Du papier froissé, un ruban et un petit mot : « Merci de votre confiance. — Le Cartel »." }],
    [2, 2, { titre: "Un écrou en or", texte: "Un écrou de cuivre doré, sans aucune valeur, poli comme un bijou. Un gobelin quelque part trouve ça très drôle." }],
    [3, 3, ref("objets:galettes-aux-dattes-de-la-treve")],
    [4, 4, ref("objets:sucre-de-cactus")],
    [5, 5, { titre: "Un jouet mécanique", texte: "Un petit kodo de fer-blanc à remontoir qui avance de 3 m en meuglant, puis tombe sur le flanc. Les enfants du Carrefour le paieraient 5 pa." }],
    [6, 6, ref("objets:fusee-gobeline-du-long-jour")],
    [7, 7, { titre: "Une lettre de change", texte: "Un bon de 10 po à faire valoir chez Nixi Pèse-Juste, à Cabestan, « sous réserve de frais de dossier » (3 po)." }],
    [8, 8, ref("objets:lampe-etoile-des-aieux")]
  ]
});
Object.assign(PAQUETS.flags[MODULE], { aventure: TITRE_FETES, fete: TREVE });

export const TABLES_FETES = [...CONTRATS_FETES, PAQUETS];

// ---------------------------------------------------------------- Journaux du MJ (un par fête)

const lienMJ = liens(BESTIAIRE, PNJ_AVENTURE, PNJ_CAMPAGNE, PNJ_ONE_SHOT, RARES, DONJON_DOCUMENTS, OBJETS_FETES, TABLES_FETES, TABLES_CONTRATS, [GUIDE_REPUTATION]);
const ficheMJ = (cle, nom) => lienMJ(`bestiaire:${cle}`, nom);
const objetsDe = id => OBJETS_FETES.filter(o => o.flags[MODULE].fete === id);
const tablesDe = id => TABLES_FETES.filter(t => t.flags[MODULE].fete === id);

// Paragraphes communs à la première page : dates, réputation, objets et contrats.
function pratique(id) {
  const f = FETE[id];
  const gains = f.reputation.map(([faction, points, pour]) => `- **+${points}** auprès de : ${reputation(faction).nom}, pour ${pour}.`).join("\n");
  return `**Quand.** ${f.periode}, d'après la date du jour (le MJ IA pose la carte de la fête au chat et peut y faire allusion). Hors saison, le MJ peut forcer la fête dans les réglages du MJ IA, « Fête de saison ».

**Réputation.** En plus des contrats, une fois par fête et par personnage (voir le ${lienMJ("journaux:guide-de-la-reputation")}, plafond de 10 points par jour) :
${gains}

**Objets de la fête**, en vente chez les marchands des trois villes tant qu'elle dure : ${objetsDe(id).map(o => lienMJ(o.__cle)).join(", ")}.

**Contrats et tables** : ${tablesDe(id).map(t => lienMJ(t.__cle)).join(", ")}. Le MJ IA ajoute un contrat de fête aux trois affiches du jour.`;
}

// Journal caché : l'illustration en tête de la première page, puis la fête, l'ambiance et les accroches (une liste).
function journalDeFete(id, { fete, ambiance, accroches }) {
  const f = FETE[id];
  const j = journal({
    cle: `fete-${id}`, nom: `Fête — ${f.nom} (MJ)`, visible: false, pages: [
      { titre: "La fête", texte: `${fete}\n\n${pratique(id)}` },
      { titre: "Ambiance", texte: ambiance },
      { titre: "Accroches", texte: accroches.map(a => `- ${a}`).join("\n") }
    ]
  });
  j.flags[MODULE].fete = id;
  const page = j.pages[0];
  page.text.content = `<figure class="lakour-warcraft-fete"><img src="${illustration(f.fete)}" alt="${f.alt}"></figure>${page.text.content}`;
  return j;
}

const JOURNAUX_FETES = [
  journalDeFete(TREVE, {
    fete: `
Quand les pluies s'arrêtent et que les nuits fraîchissent sur la savane, les Tarides entrent dans la **Trêve des Présents**. Rien d'officiel au départ : des caravaniers taurens qui laissaient un sac de grain devant la tente d'un voisin, des grunts qui échangeaient du tabac avec les fermiers de Theramore aux gués. Depuis la Trêve de Cabestan, le **Bureau de la Trêve** en a fait une coutume : pendant tout le mois, chaque camp peut déposer au Bureau un présent pour l'autre, et l'on se promet de ne verser le sang sur aucune grande route.

**L'Épineux.** Au Carrefour, un vieil acacia mort, au pied de la tour de guet, porte les présents de la Horde : grelots d'os, rubans de cuir rouge, calebasses peintes, dents de raptor percées. Chacun y accroche quelque chose ; on décroche un grelot le dernier jour pour se porter chance.

**La Vieille aux Grelots.** Une légende taurène : une vieille femme marche la nuit à côté d'un kodo blanc et laisse un présent devant chaque tente où dort un enfant, quel que soit son peuple. Cette année, Hanuk Pas-de-Pluie a promis de jouer son rôle.`,
    ambiance: `
**Au Carrefour.** Les cuisinières cuisent des galettes aux dattes par centaines ; les grunts de garde ont un ruban rouge au manche de leur hache. Gornak Croc-Gris compte les présents comme des impôts et grogne qu'il n'y en a jamais assez. Le soir, on chante autour de l'Épineux des chants de marche orcs ralentis jusqu'à devenir doux.

**À Theramore.** Un sapin venu du nord par bateau trône sur la place du port, couvert de rubans bleus et de petites lanternes. Le Guet distribue du vin chaud aux réfugiés ; la chapelle sonne le soir. On parle trop fort de « l'arbre volé » : les Sentinelles réclament une amende pour la coupe.

**À Cabestan.** Le Cartel vend de tout : paquets-surprises, rubans, grelots de fer-blanc, sapins en carton. Le Bureau de la Trêve, encombré de caisses, tient le registre des présents échangés ; Nixi Pèse-Juste en touche 2 % de frais d'écriture.

**Dans les kraals.** Les hurans de Ronceroc ne fêtent rien, mais les petits imitent : ils pendent des os aux ronces autour du kraal. Les plus hardis guettent les caravanes de présents, qui ne sont jamais aussi bien gardées qu'elles le devraient.`,
    accroches: [
      `**Le présent piégé.** Au Bureau de la Trêve, une caisse adressée à ${ficheMJ("corwen-haldis", "Corwen Haldis")} « de la part de la Horde » fait tic-tac. Un gobelin du Cartel Baille-Fonds veut faire sauter la Trêve ; ${jet("Investigation", 14)} pour remonter jusqu'à l'expéditeur avant que Theramore et le Carrefour ne s'accusent. Réussite : +2 auprès de l'Alliance et de la Horde.`,
      `**Le kodo blanc a disparu.** La veille de la grande nuit, le kodo blanc de ${ficheMJ("hanuk-pas-de-pluie", "Hanuk")} s'est échappé vers les collines. Le retrouver avant que les ${ficheMJ("centaure-kolkar", "Kolkar")} ne le prennent ; ${jet("Survie", 13)} pour suivre ses traces dans la poussière.`,
      `**L'amende de l'Orneval.** Une éclaireuse des Sentinelles, ${ficheMJ("aelyra-ombrefeuille", "Aelyra Ombrefeuille")}, exige que le sapin de Theramore soit rendu à la forêt, ou payé. Négocier un accord (${jet("Persuasion", 15)}) rapporte +3 auprès des Sentinelles ; laisser l'arbre brûler par dépit coûte −3.`,
      `**Les présents du kraal.** Une petite huranne apporte au Carrefour un présent maladroit : une défense de sanglier gravée. ${ficheMJ("gorra-fiel-d-epine", "Gorra Fiel-d'Épine")} demande, par elle, une trêve de sept jours pour enterrer ses morts. Si le groupe porte la réponse au kraal et la fait respecter, +2 auprès de la Horde.`
    ]
  }),
  journalDeFete(AIEUX, {
    fete: `
La dernière nuit de l'année, on ne dort pas : c'est la **Veille des Aïeux**. Chaque peuple des Tarides honore ses morts anciens et ses vivants les plus vieux. On rend visite à l'ancien de son camp avec un présent (une couverture, du tabac, une histoire qu'on lui demande de raconter encore), et l'on écoute jusqu'au bout.

**La colline des cairns.** Au nord du Carrefour, une colline pelée porte des centaines de cairns de pierres plates, un par lignée taurène. À la nuit tombée, chaque famille y allume une **lampe-étoile** par ancêtre ; vue de loin, la colline ressemble à un morceau de ciel tombé dans la savane.

**Un ancien de l'autre camp.** Honorer un ancien d'un autre peuple, ou de l'autre faction, porte chance pour l'année. C'est rare, et l'on s'en souvient.`,
    ambiance: `
**Au Carrefour.** Les orcs récitent la lignée de leur clan, du plus vieux nom au plus jeune, devant le feu ; les jeunes grunts se trompent et les vieux les reprennent. Les taurens montent à la colline des cairns en file, une lampe dans chaque main. Personne ne monte la garde ce soir-là sans un vieux pour lui tenir compagnie.

**À Theramore.** À minuit, la cloche du port sonne une fois par mois de l'année écoulée. Dans la chapelle, Frère Odric Pierrelune lit les noms de ceux que les réfugiés ont laissés en Lordaeron ; chacun peut en ajouter un au registre. Puis on boit à leur santé, et les marins jettent une pièce dans la baie.

**À Cabestan.** On solde ses dettes avant minuit : on n'entre pas dans l'année avec une ardoise. Les comptoirs restent ouverts tard, Nixi Pèse-Juste encaisse sans lever les yeux, et les mauvais payeurs se cachent sur les navires.

**Dans les kraals.** À Ronceroc, on enterre sous les ronces une défense de sanglier pour chaque ancien mort dans l'année ; cette nuit-là, les hurans ne chassent pas et ne pillent pas. Les caravaniers le savent et voyagent de nuit.`,
    accroches: [
      `**Le cairn renversé.** À l'aube du dernier jour, un cairn de la colline est renversé et ses pierres gravées emportées. Les traces mènent à un campement de ${ficheMJ("centaure-kolkar", "Kolkar")} ; ${jet("Survie", 13)} pour les suivre. Les pierres rapportées avant minuit valent +3 auprès de la Horde.`,
      `**Le dernier conte.** Le vieux ${ficheMJ("hanuk-pas-de-pluie", "Hanuk Pas-de-Pluie")} raconte, cette nuit, une histoire qu'il n'a jamais dite : un puits ancien, une pierre qui chante, plus au sud. L'écouter jusqu'au bout (${jet("Histoire", 13)} pour en tirer un lieu précis) donne une piste d'aventure pour la nouvelle année.`,
      `**Un nom de trop.** Dans le registre de Theramore, quelqu'un a écrit le nom d'un réfugié bien vivant. Menace ou erreur ? ${ficheMJ("vesper-lacombe", "Vesper Lacombe")} affirme que ce nom-là est celui d'un « bon docteur » ; ${jet("Intuition", 14)} pour savoir si elle ment.`,
      `**La dette du baron.** Un comptable du Cartel Baille-Fonds cherche à fuir Cabestan avant minuit avec le registre des dettes du baron. Nixi Pèse-Juste paie 40 po pour le registre ; le livrer à ${ficheMJ("grizzla-tordeboulon", "Grizzla")} rapporte +2 auprès du Cartel Gentepression.`
    ]
  }),
  journalDeFete(CALEBASSES, {
    fete: `
À la fin de la saison sèche, quand les calebasses sont mûres, vient la **Nuit des Calebasses**. Chaque famille en creuse une par mort de l'année, y taille un visage qui lui ressemble et y pose une chandelle. Le soir du 31, on les aligne au bord des pistes, sur les palissades, devant les tentes : elles montrent aux morts le chemin des ancêtres, pour qu'ils ne s'égarent pas parmi les vivants.

**Une braise pour mes morts.** Les enfants vont de tente en tente, une calebasse à la main, et demandent « une braise pour mes morts ». On leur donne une braise du foyer pour leur chandelle, et du sucre de cactus. Refuser porte malheur.

**Les morts qui se trompent de chemin.** Depuis le Fléau, tout le monde sait que certains morts ne restent pas couchés. Cette nuit-là, les nécromanciens le savent aussi.`,
    ambiance: `
**Au Carrefour.** La palissade porte une calebasse par grunt tombé dans l'année ; les chamans les allument une à une en disant les noms. Les enfants orcs et taurens font la tournée des tentes, et Gornak Croc-Gris fait semblant d'être avare pour les voir supplier.

**À Theramore.** Les réfugiés de Lordaeron posent leurs calebasses le long du marais, du côté où sont venus les morts autrefois. L'Aube d'argent, menée par Sœur Linnea Clairmatin, veille jusqu'au matin, l'épée à la main et une tasse de thé dans l'autre ; les gardes du Guet doublent les rondes.

**À Cabestan.** Les gobelins vendent des calebasses déjà taillées, des calebasses à mèche longue (qui éclatent comme des pétards) et des « lanternes éternelles » qui durent jusqu'à minuit. Les dockers parient sur celle qui s'éteindra la dernière.

**Dans les kraals.** Les hurans croient que les calebasses allumées sont des esprits qui regardent : ils évitent les pistes cette nuit-là. Les caravanes en profitent ; les pillards kolkar aussi.`,
    accroches: [
      `**Les calebasses noires.** Le long de la piste de Theramore, des calebasses peintes de runes brûlent d'une flamme verte, et les tombes voisines bougent. Un ${ficheMJ("necromancien-culte", "nécromancien du Culte des Damnés")} prépare un réveil ; ${jet("Arcanes", 14)} pour comprendre le rite et éteindre les flammes dans le bon ordre. Chaque ${ficheMJ("goule", "goule")} abattue cette nuit-là compte double auprès de l'Aube d'argent.`,
      `**La procession égarée.** La procession des réfugiés qui allait au cimetière des Rescapés n'est jamais arrivée. On retrouve ses calebasses alignées vers le marécage, au mauvais endroit, comme si quelqu'un les avait déplacées. ${ficheMJ("aldwin-crayeval", "Le docteur Crayeval")} a-t-il des élèves ?`,
      `**Une braise pour Vesper.** Une enfant demande « une braise pour mes morts » à ${ficheMJ("vesper-lacombe", "Vesper Lacombe")}, la réprouvée, devant tout le relais. Les adultes retiennent leur souffle. Ce que fait le groupe (${jet("Persuasion", 13)} pour calmer la foule) peut valoir +2 auprès de la Main d'argent, ou −2.`,
      `**Les esprits de Ronceroc.** Des hurans terrifiés se rendent au Carrefour : une calebasse géante « marche » autour du kraal de Ronceroc. C'est un ${ficheMJ("elementaire-terre", "élémentaire de terre")} coiffé d'une calebasse par un farceur gobelin, et il n'aime pas ça. L'arrêter avant qu'il n'écrase le kraal vaut +2 auprès du Cercle cénarien.`
    ]
  }),
  journalDeFete(LONG_JOUR, {
    fete: `
Le jour le plus long de l'année, les taurens battent les **Tambours du Long Jour** de l'aube au couchant, pour remercier le soleil qui fait pousser l'herbe des kodos. Tout le monde finit par s'y mettre : les orcs frappent les boucliers, les gobelins des casseroles.

**La Chaîne des feux.** Au coucher du soleil, un grand feu s'allume sur la colline du Carrefour. Un coureur y prend une torche et court l'allumer au feu de la colline suivante, et ainsi de suite jusqu'à Gué-de-Sel et à la côte : en une nuit, une ligne de feux traverse les Tarides. Theramore allume sa propre chaîne depuis le port ; les deux se rejoignent, parfois, au sommet de Gué-de-Sel.

**Sauter les braises.** Qui saute au-dessus d'un feu du Long Jour scelle un vœu pour l'année. Qui tombe dedans le raconte longtemps.`,
    ambiance: `
**Au Carrefour.** Tambours, chants, danses autour du grand feu ; les coureurs de la Chaîne s'échauffent en buvant de l'infusion de fleur-de-braise. On parie sur qui, de la Horde ou de l'Alliance, aura allumé le plus de collines à minuit.

**À Theramore.** Le Guet organise un concours de fifres et de luths sur les quais ; le vainqueur gagne un tonneau de bière et le droit de jouer sous l'arche du port toute l'année. Les mages de la tour préparent des lumières sur l'eau, qui ne marchent pas toujours.

**À Cabestan.** Le Cartel tire des fusées au-dessus de la baie, à la nuit noire. Grizzla Tordeboulon vend les meilleures places sur les toits ; les fusées ratées tombent souvent dans les voiles des navires.

**Dans les kraals.** Les hurans craignent ces feux, qui annoncent pour eux les chasseurs. Certaines années, les géomanciens de Ronceroc tentent d'étouffer ceux des collines voisines du kraal.`,
    accroches: [
      `**La course des deux chaînes.** La chaîne de la Horde et celle de l'Alliance doivent se rejoindre au sommet de Gué-de-Sel, et ${ficheMJ("garrok-brise-dent", "Garrok Brise-Dent")} et ${ficheMJ("corwen-haldis", "Corwen Haldis")} ont parié gros. Un saboteur mouille les torches ; ${jet("Investigation", 13)} pour le trouver. Faire arriver les deux flammes ensemble rapporte +2 auprès des deux factions.`,
      `**La fusée perdue.** Une caisse de fusées du Cartel a disparu ; on la retrouve chez un ${ficheMJ("cultiste-lame-ardente", "cultiste de la Lame ardente")} qui veut les tirer sur le feu du Carrefour, plein de monde. ${jetSauvegarde("Dextérité", 12)} pour qui se trouve près de la caisse quand elle prend feu.`,
      `**Le vœu de Vexxa.** ${ficheMJ("rare-vexxa-la-rieuse", "Vexxa la Rieuse")} a juré de sauter le feu du Carrefour devant toute la Horde, puis de disparaître avec la torche de la Chaîne. Le groupe l'apprend par une rumeur ; à lui de choisir où l'attendre.`,
      `**Le concours de Theramore.** Un barde de Theramore cherche des musiciens pour le concours du Guet ; ${jet("Représentation", 14)} pour le gagner. Le prix (le tonneau, la place sous l'arche et un ${lienMJ("objets:tambourin-du-long-jour", "tambourin du Long Jour")}) vaut surtout l'amitié du Guet : +2 auprès de l'Alliance.`,
      `**Les feux étouffés.** Les feux de trois collines s'éteignent d'un coup, recouverts de terre : voir le contrat « Les feux qui s'éteignent ». ${ficheMJ("grommel-defense-grise", "Grommel Défense-Grise")}, s'il a survécu aux Puits de cendre, en sait plus qu'il ne le dit.`
    ]
  }),
  journalDeFete(MASCARADE, {
    fete: `
Du jeudi gras au mardi gras, Cabestan se masque : c'est la **Mascarade**. La loi du Cartel Gentepression est simple et affichée sur chaque quai : sous un masque, on n'est **personne**. Ni Horde, ni Alliance ; on ne peut être arrêté sur le port pour une querelle de faction, et l'on peut danser avec son ennemi.

**Le Baron d'un jour.** Le premier soir, les dockers élisent l'un des leurs « Baron d'un jour » : il préside les jeux, rend des jugements absurdes et porte une couronne de boulons.

**Le Baron de paille.** Le soir du mardi gras, on traîne jusqu'au bout de la jetée un pantin de paille de six mètres, à l'effigie d'un gobelin trop riche (cette année, la ressemblance avec le baron Nizzel Baille-Fonds est voulue), et on le brûle dans la baie sous les fusées et les huées.`,
    ambiance: `
**À Cabestan.** Les barges sont attachées bord à bord pour faire une piste de danse ; le Grand Bazar vend à moitié prix tout ce qui n'a pas trouvé preneur dans l'année ; on boit du rhum de cactus dans des chopes en forme de tête de gobelin. Les gardes du Cartel portent des masques eux aussi, ce qui ne simplifie rien.

**Au Carrefour.** La Mascarade y est plus rude : les grunts défilent sous des crânes de kodo peints et jouent des tambours de guerre, puis organisent un combat de lutte où l'on n'a pas le droit d'enlever son masque. Les Kor'kron surveillent, sans masque.

**À Theramore.** Le Guet désapprouve. Pourtant, la noblesse donne un bal masqué dans un entrepôt du port, et les espions des deux camps s'y bousculent.

**Dans les kraals.** Les hurans n'ont jamais compris la Mascarade. Les pillards de Ronceroc en ont retenu une chose : des voyageurs masqués, distraits et chargés de souvenirs, sur la route de Cabestan.`,
    accroches: [
      `**Démasquer sans démasquer.** Un espion de la Lame ardente danse quelque part sur les barges ; ${ficheMJ("grizzla-tordeboulon", "Grizzla")} veut qu'on le trouve sans ôter un seul masque (la loi du Cartel). ${jet("Perception", 14)} pour repérer les marques de brûlure sur ses mains, ${jet("Tromperie", 13)} pour le faire parler. Le livrer aux Kor'kron vaut +2 auprès d'eux ; au Cartel, +2 auprès du Cartel.`,
      `**Le Baron d'un jour.** Les dockers ont élu l'un des personnages Baron d'un jour. Coiffé de la couronne de boulons et d'un ${lienMJ("objets:masque-de-la-mascarade", "masque de la Mascarade")} qu'il gardera, il doit rendre trois jugements devant la foule (${jet("Persuasion", 12)} pour chacun) ; un mauvais jugement fâche le Cartel, un bon fait de lui un héros du port (+2 auprès du Cartel Gentepression).`,
      `**La vengeance du baron.** Les hommes du ${ficheMJ("baron-nizzel-baille-fonds", "baron Nizzel Baille-Fonds")} veulent incendier les entrepôts en même temps que le Baron de paille. S'il est tombé dans sa raffinerie, ce sont ses créanciers qui s'en chargent, pour toucher l'assurance du Cartel.`,
      `**Deux masques à la même table.** Au bal de Theramore, ${ficheMJ("corwen-haldis", "Corwen Haldis")} et ${ficheMJ("garrok-brise-dent", "Garrok Brise-Dent")} se retrouvent, masqués, à la même table de cartes, sans le savoir. Le groupe le sait. Les aider à se parler (${jet("Intuition", 13)} pour sentir le moment) prépare la paix ; les faire se reconnaître trop tôt la ruine.`
    ]
  })
];

// ---------------------------------------------------------------- Page du guide du MJ

const lienGuide = liens(JOURNAUX_FETES, TABLES_FETES);

ajouterPages(GUIDES.find(g => g.flags[MODULE].cle === "guide-du-mj"), [{
  titre: "Fêtes de saison (MJ)", texte: `
Le MJ IA connaît un petit calendrier de fêtes populaires ; les Tarides en déclinent cinq, à leur façon. Le jour venu (d'après la date réelle, dans le navigateur du MJ), le MJ IA pose une carte au chat, change le décor et peut glisser la fête dans ses descriptions. Le réglage « Fête de saison » du MJ IA force une fête hors saison, ou les coupe toutes.

${FETES.map(f => `- **${f.nom}** (${f.periode}) : ${lienGuide(`journaux:fete-${f.id}`, "journal de la fête")}, ${lienGuide(`tables:fete-${f.id}-contrats`, "contrats")}.`).join("\n")}

Chaque journal donne l'ambiance au Carrefour, à Theramore, à Cabestan et dans les kraals, quatre ou cinq accroches et les gains de réputation propres à la fête. Les objets de fête se vendent chez les marchands des trois villes tant que dure la fête ; ensuite, ils deviennent rares.`
}]);

export const FETES_DOCUMENTS = collection("fetes", [...OBJETS_FETES, ...TABLES_FETES, ...JOURNAUX_FETES]);
