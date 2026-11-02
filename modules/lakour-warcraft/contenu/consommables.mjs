// Buffs de groupe et consommables d'Azeroth (dnd5e 6.0.6, règles 2024) : les tambours de Furie sanguinaire et le cristal
// d'Héroïsme (une fois par combat, suivis d'un « Épuisement de la fureur » de 10 minutes), trois repas « bien nourri »
// (jusqu'au prochain repos long) et quatre flacons (8 heures, un seul à la fois). Objets du compendium « objets »,
// collection « consommables ». Les effets sont appliqués par les activités (bouton de la carte de chat de dnd5e) ;
// clés d'effet canoniques de dnd5e 6.0 (rolls.*, attributes.movement.bonus…). Textes originaux.
import { MODULE, collection, icone } from "./aides.mjs";
import { consommable, equipement } from "./objets.mjs";

const ATTAQUES = ["mwak", "rwak", "msak", "rsak"];

// Furie sanguinaire et Héroïsme : même effet, même lassitude. scripts/automatismes.js refuse l'objet si l'utilisateur ou
// une cible porte l'Épuisement, retire une Furie appliquée (ou réactivée) malgré lui, et ôte l'Épuisement des combattants
// à la fin du combat (la durée de 10 minutes ne s'écoule que si le temps du monde avance).
const EPUISEMENT = {
  nom: "Épuisement de la fureur", transfert: false, duree: 600,
  texte: "Le corps a brûlé ses réserves. Jusqu'à la fin du combat (10 minutes au plus), la créature ne peut plus profiter de **Furie sanguinaire** ni d'**Héroïsme** : si l'un d'eux lui est appliqué, retirez-le aussitôt."
};
const elan = nom => ({
  nom, transfert: false, duree: 60,
  changements: [
    ["system.attributes.movement.bonus", "3"],
    ...ATTAQUES.map(a => [`system.rolls.attack.${a}.bonus`, "1d4"]),
    ["system.abilities.dex.save.roll.mode", 1]
  ],
  texte: "Pendant 1 minute : vitesse augmentée de 3 m, **+1d4** aux jets d'attaque, avantage aux jets de sauvegarde de Dextérité."
});
const regleFureur = "**Une fois par combat.** L'objet se recharge quand le combat suivant commence (jet d'initiative). Chaque créature qui reçoit la fureur gagne aussi **Épuisement de la fureur** jusqu'à la fin du combat (10 minutes au plus) : tant qu'elle le porte, ni Furie sanguinaire ni Héroïsme ne lui font plus d'effet, d'où qu'ils viennent.";

// Drapeaux lus par scripts/automatismes.js : l'objet (fureur: true) et ses effets (fureur: "elan" | "epuisement"), pour
// refuser la fureur à qui porte encore l'épuisement.
const buff = (...args) => {
  const o = objetFureur(...args);
  o.flags[MODULE].fureur = true;
  o.effects[0].flags = { [MODULE]: { fureur: "elan" } };
  o.effects[1].flags = { [MODULE]: { fureur: "epuisement" } };
  return o;
};
function objetFureur(cle, nom, img, prix, texte, nomEffet, nomActivite) { return equipement({
  cle, nom, img, categorie: "wondrous", rarete: "rare", magique: true, prix: [prix, "gp"], poids: 2,
  texte: `${texte}\n\nPar une **action bonus**, vous déclenchez l'objet : chaque allié de votre choix dans un rayon de **9 m** autour de vous, vous compris, reçoit **${nomEffet}** pendant 1 minute (vitesse +3 m, +1d4 aux jets d'attaque, avantage aux sauvegardes de Dextérité).\n\n${regleFureur}`,
  utilisations: { max: 1, periode: "initiative" },
  effets: [elan(nomEffet), EPUISEMENT],
  activites: [{ type: "utility", nom: nomActivite, activation: "bonus", portee: ["", "self"], gabarit: ["radius", 9], cible: ["", "ally"], duree: [1, "minute"], effets: [0, 1] }]
}); }

// Repas : une marmite ou un plateau de six portions ; « bien nourri » jusqu'au prochain repos long, un seul à la fois.
const REGLE_REPAS = "Un seul repas « bien nourri » à la fois : un nouveau repas remplace le précédent. L'effet prend fin au prochain **repos long**.";
const repas = (cle, nom, img, prix, texte, nomEffet, changements, resume) => consommable({
  cle, nom, img, categorie: "food", prix: [prix, "gp"], poids: 4, utilisations: { max: 6, periode: "lr" },
  texte: `${texte}\n\nSix portions. Il faut **10 minutes** pour manger une portion ; la créature qui la mange est **bien nourrie** : ${resume}.\n\n${REGLE_REPAS}`,
  effets: [{ nom: nomEffet, transfert: false, expiration: "longRest", changements, texte: `Bien nourri jusqu'au prochain repos long : ${resume}.` }],
  activites: [{ type: "utility", nom: "Manger une portion", activation: "minute", activationValeur: 10, portee: ["", "touch"], cible: ["1", "creature"], effets: [0] }]
});

// Flacons : 8 heures, un seul à la fois ; boire un second flacon met fin au premier.
const REGLE_FLACON = "Un seul flacon à la fois : en boire un second met fin à l'effet du premier. L'effet dure **8 heures**.";
const flacon = (cle, nom, img, rarete, prix, texte, changements, resume, soin = null) => consommable({
  cle, nom, img, categorie: "potion", rarete, magique: true, prix: [prix, "gp"], poids: 0.5,
  texte: `${texte}\n\nPar une **action bonus**, vous buvez le flacon : ${resume}.\n\n${REGLE_FLACON}`,
  effets: [{ nom, transfert: false, duree: 28800, changements, texte: `Pendant 8 heures : ${resume}.` }],
  activites: [soin
    ? { type: "heal", nom: "Boire", activation: "bonus", portee: ["", "self"], duree: [8, "hour"], soin: { des: "", bonus: soin }, effets: [0] }
    : { type: "utility", nom: "Boire", activation: "bonus", portee: ["", "self"], duree: [8, "hour"], effets: [0] }]
});

export const CONSOMMABLES = collection("consommables", [
  // ---------- Buffs de groupe
  buff("tambours-de-furie-sanguinaire", "Tambours de Furie sanguinaire", icone("icons/tools/instruments/drum-hand-tan.webp"), 900,
    "Un tambour de peau de kodo tendue sur un cerceau d'os, peint de mains rouges. Les chamans du Carrefour y battent le rythme que leurs ancêtres frappaient avant la charge ; ceux qui l'entendent sentent leur sang bouillir et le monde ralentir autour d'eux.",
    "Furie sanguinaire", "Battre la Furie sanguinaire"),
  buff("cristal-d-heroisme", "Cristal chantant d'Héroïsme", icone("icons/commodities/treasure/glass-crystal-green.webp"), 900,
    "Un éclat de cristal draeneï serti dans une monture d'argent. Frappé du doigt, il rend une note claire qui ne s'éteint pas : le courage y résonne comme une cloche. Les vindicateurs de l'Exodar le confient aux compagnies qui partent loin de chez elles.",
    "Héroïsme", "Faire chanter le cristal"),

  // ---------- Repas « bien nourri »
  repas("ragout-de-kodo-epice", "Marmite de ragoût de kodo épicé", icone("icons/consumables/food/bowl-stew-tofu-potato-brown.webp"), 4,
    "Un ragoût noir et brûlant de viande de kodo, de racines des Tarides et de piment de Durotar, mijoté toute une nuit dans une marmite cabossée. Les grunts du Carrefour jurent qu'il tient debout un orc blessé jusqu'au lendemain.",
    "Bien nourri — ragoût de kodo", [["system.abilities.con.save.roll.bonus", "1"], ["system.abilities.str.check.roll.bonus", "1"]],
    "+1 aux jets de sauvegarde de Constitution et aux tests de Force"),
  repas("brochettes-de-raptor", "Brochettes de raptor au piment", icone("icons/consumables/food/cooked-kebab-meat-skewer-red.webp"), 3,
    "Des lanières de raptor marinées dans le jus de cactus et roulées dans un piment qui fait pleurer les trolls eux-mêmes. On les mange avec les doigts, et on regarde autour de soi avec des yeux tout neufs.",
    "Bien nourri — brochettes de raptor", [["system.attributes.init.roll.bonus", "2"], ["system.abilities.dex.save.roll.bonus", "1"]],
    "+2 à l'initiative et +1 aux jets de sauvegarde de Dextérité"),
  repas("tourte-de-poisson-de-theramore", "Tourte au poisson de Theramore", icone("icons/consumables/grains/pastry-bread-brown.webp"), 5,
    "Une tourte dorée farcie de poisson de la baie, d'herbes du marais et de beurre salé, telle qu'on la sert à l'auberge du port de Theramore. Elle réchauffe et donne l'esprit clair, ce qui n'est pas rien dans les brumes d'Âprefange.",
    "Bien nourri — tourte de Theramore", [["system.abilities.wis.save.roll.bonus", "1"], ["system.skills.prc.bonuses.passive", "2"]],
    "+1 aux jets de sauvegarde de Sagesse et +2 à la Sagesse (Perception) passive"),

  // ---------- Flacons
  flacon("flacon-des-titans-de-pierre", "Flacon des Titans de pierre", icone("icons/consumables/potions/flask-corked-yellow-glow.webp"), "rare", 300,
    "Une flasque trapue au liquide doré et lourd, distillée par les alchimistes nains d'après une recette gravée dans les salles d'Uldaman. On dit qu'une gorgée fait sentir le poids de la montagne derrière soi.",
    [["system.attributes.hp.bonuses.overall", "10"]], "vos points de vie maximaux augmentent de **10** et vous récupérez **10** points de vie", "10"),
  flacon("flacon-de-sagesse-distillee", "Flacon de sagesse distillée", icone("icons/consumables/potions/flask-corked-blue-glow.webp"), "uncommon", 200,
    "Un liquide bleu pâle où flottent des paillettes d'argent, que les mages de Theramore boivent avant les longues séances d'étude. Il a un goût d'encre et de neige.",
    [["system.attributes.concentration.roll.bonus", "2"], ["system.skills.arc.roll.mode", 1]], "**+2** aux jets de sauvegarde de concentration et avantage aux tests d'Intelligence (Arcanes)"),
  flacon("flacon-de-rage-du-kodo", "Flacon de rage du kodo", icone("icons/consumables/potions/flask-red-bubbles-vortex.webp"), "uncommon", 200,
    "Une mixture rouge sombre au fumet de musc, que les chasseurs taurens refusent de boire et que les gladiateurs orcs adorent. Elle fait gonfler les veines du cou.",
    [["system.rolls.damage.mwak.bonus", "1"], ["system.rolls.damage.rwak.bonus", "1"], ["system.abilities.str.check.roll.mode", 1]], "**+1** aux jets de dégâts des armes et avantage aux tests de Force"),
  flacon("flacon-de-peau-de-pierre", "Flacon de peau-de-pierre", icone("icons/consumables/potions/flask-corked-purple-glow.webp"), "rare", 300,
    "Un liquide gris et pâteux qui laisse sur la langue un goût de silex. Pendant des heures, la peau prend le grain du granit et sonne mat quand on la frappe.",
    [["system.attributes.ac.bonus", "1"]], "**+1** à la classe d'armure")
]);
