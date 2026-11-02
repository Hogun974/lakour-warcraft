// « La Raffinerie de Mèche-Noire » — donjon court de trois boss « à mécaniques » pour 3 à 5 personnages de niveau 5
// (à jouer entre les chapitres 2 et 3 des Braises de la Légion, ou à part). Une vieille mine de cuivre des collines au
// nord de Cabestan, rachetée par le Cartel Baille-Fonds, rival de Gentepression, qui y distille de l'huile de feu en
// pressant un élémentaire enchaîné. Se joue sur la carte générique « Lieu — Mine » du compendium.
// Chaque boss : acteur dnd5e avec actions légendaires et de repaire (acteurs.mjs), une phase 2 à 50 % de ses points de
// vie (capacité « Phase 2 — … » qui s'applique un effet), des zones au sol décrites pour le MJ ; une table de butin
// par boss (qualité = rareté dnd5e) et un ensemble de deux pièces. Journal de rencontre visible des joueurs (comme le
// journal de donjon de WoW) et journal du MJ caché. Profils chiffrés dans l'esprit du SRD 5.2 (CC-BY-4.0), textes originaux.
import { action, attaque, attaquesMultiples, pnj, sauvegarde, trait } from "./acteurs.mjs";
import { MODULE, collection, icone, journal, ref, table } from "./aides.mjs";
import { arme, butin, consommable, equipement } from "./objets.mjs";
import { degats, jet, jetSauvegarde, liens, reference } from "./guides.mjs";
import { BESTIAIRE } from "./bestiaire.mjs";
import { PNJ_CAMPAGNE } from "./campagne.mjs";
import { OBJETS } from "./objets-azeroth.mjs";
import { CARTES_LIEUX } from "./lieux-cartes.mjs";

export const TITRE_DONJON = "La Raffinerie de Mèche-Noire";
const ENSEMBLE = "Tenue réglementaire de Mèche-Noire";

// ---------------------------------------------------------------- Butin (objets)

const texteEnsemble = autre => `**Ensemble « ${ENSEMBLE} » (2 pièces)** : avec ${autre}, équipés tous les deux, vous avez la **résistance aux dégâts de feu** et **+2** aux jets de sauvegarde de Dextérité. Le bonus est l'effet « ${ENSEMBLE} (2 pièces) » des lunettes, éteint par défaut : allumez-le sur votre fiche quand les deux pièces sont portées, éteignez-le quand l'une est retirée.`;

export const BUTIN_DONJON = collection("donjon-meche-noire", [
  // --- Grokka Deux-Clés
  arme({
    cle: "cle-a-tube-de-grokka", nom: "Clé à tube de Grokka", img: icone("icons/tools/hand/wrench-iron-grey.webp"),
    categorie: "martialM", base: "maul", degats: { des: "2d6", types: ["bludgeoning"] }, proprietes: ["hvy", "two"], maitrise: "topple",
    bonus: 1, rarete: "uncommon", prix: [500, "gp"], poids: 10,
    texte: "Une clé à tube longue comme un humain, dont la mâchoire a serré les boulons de toutes les conduites de la raffinerie, et quelques crânes. C'est une **arme +1** (maillet d'armes). Les ouvriers kobolds de Mèche-Noire s'aplatissent en la voyant."
  }),
  equipement({
    cle: "gantelets-ignifuges-du-contremaitre", nom: "Gantelets ignifugés du contremaître", img: icone("icons/equipment/hand/glove-armored-leather-steel-brown.webp"),
    categorie: "wondrous", rarete: "uncommon", magique: true, prix: [400, "gp"], poids: 2,
    texte: `Des gantelets de cuir épais doublés d'amiante et cerclés d'acier, noircis par les conduites brûlantes. Tant que vous les portez, vous pouvez saisir un objet brûlant sans vous blesser, et vous avez **+1** aux jets de dégâts de vos attaques d'arme au corps à corps.\n\n${texteEnsemble("les Lunettes de sûreté du contremaître")}`,
    effets: [{ nom: "Gantelets ignifugés", changements: [["system.rolls.damage.mwak.bonus", "1"]], texte: "+1 aux dégâts des attaques d'arme au corps à corps." }]
  }),
  equipement({
    cle: "casque-de-mineur-a-lanterne", nom: "Casque de mineur à lanterne", img: icone("icons/equipment/head/helmet-mining-lamp.webp"),
    categorie: "clothing", rarete: "common", prix: [15, "gp"], poids: 3,
    texte: "Un casque de cuir bouilli surmonté d'une lanterne à huile de feu qui ne s'éteint pas sous la pluie. Par une **action bonus**, vous l'allumez ou l'éteignez : elle éclaire en lumière vive sur 9 m devant vous, et en lumière faible sur 9 m de plus. Une flasque d'huile la fait brûler 6 heures.",
    activites: [{ type: "utility", nom: "Allumer la lanterne", activation: "bonus" }]
  }),

  // --- Mère-Brasier
  equipement({
    cle: "coeur-de-braise-captif", nom: "Cœur de braise captif", img: icone("icons/commodities/gems/gem-rough-heart-pink.webp"),
    categorie: "wondrous", rarete: "rare", magique: true, harmonisation: true, prix: [2500, "gp"], poids: 1,
    texte: "Un noyau de flamme vivante gros comme un poing, prisonnier d'une cage de cuivre où battait le cœur de Mère-Brasier. Il est tiède et pulse au rythme de votre pouls. Tant que vous y êtes **lié**, vous avez la **résistance aux dégâts de feu**.\n\nUne fois par jour, par une **action**, vous ouvrez la cage : un souffle de feu jaillit en cône de 4,5 m. Chaque créature dans la zone fait un jet de sauvegarde de **Dextérité DD 13** et subit **3d6 dégâts de feu** en cas d'échec, la moitié en cas de réussite. Il se rallume à l'aube.\n\n*Si vous le plongez dans l'eau d'un bassin lunaire, l'élémentaire est libéré et retourne aux Terres de feu ; le Cercle cénarien saura vous en remercier.*",
    utilisations: { max: 1, periode: "dawn" },
    effets: [{ nom: "Cœur de braise", changements: [["system.traits.dr.value", "fire"]], texte: "Résistance aux dégâts de feu." }],
    activites: [{ type: "save", nom: "Ouvrir la cage", portee: ["", "self"], gabarit: ["cone", 4.5], cible: ["", "creature"], sauvegarde: { carac: ["dex"], dd: 13, reussite: "half" }, degats: [{ des: "3d6", types: ["fire"] }] }]
  }),
  consommable({
    cle: "flasque-d-huile-de-feu", nom: "Flasque d'huile de feu", img: icone("icons/consumables/potions/potion-bottle-labeled-medicine-capped-red-black.webp"),
    categorie: "trinket", rarete: "common", prix: [30, "gp"], poids: 1,
    texte: "Une flasque de terre cuite bouchée à la cire, pleine de l'huile noire et grasse que distille la raffinerie. Par une **action**, vous la lancez jusqu'à 9 m : elle éclate et s'enflamme. Chaque créature dans un rayon de 1,5 m fait un jet de sauvegarde de **Dextérité DD 12** et subit **2d6 dégâts de feu** en cas d'échec, la moitié en cas de réussite. Les flammes brûlent **1 minute** sur ce cercle : une créature qui y entre ou y commence son tour subit 1d6 dégâts de feu.",
    activites: [{ type: "save", nom: "Lancer", portee: [9, "m"], gabarit: ["radius", 1.5], cible: ["", "creature"], sauvegarde: { carac: ["dex"], dd: 12, reussite: "half" }, degats: [{ des: "2d6", types: ["fire"] }] }]
  }),
  arme({
    cle: "fouet-chaine-de-l-enchainee", nom: "Fouet-chaîne de l'Enchaînée", img: icone("icons/weapons/misc/whip-red-yellow.webp"),
    categorie: "martialM", base: "whip", degats: { des: "1d4", types: ["slashing"] }, proprietes: ["fin", "rch"], maitrise: "slow", allonge: 3,
    bonus: 1, rarete: "uncommon", prix: [600, "gp"], poids: 3,
    texte: "Un maillon des chaînes qui retenaient Mère-Brasier, forgé en fouet par un ouvrier qui n'a pas survécu à son œuvre. Il reste rouge sombre et sent la forge. C'est une **arme +1** (fouet) : chaque coup qui touche inflige **1d4 dégâts de feu** supplémentaires.",
    activites: [{ type: "damage", nom: "Chaîne brûlante", activation: "", condition: "La cible est touchée par le fouet", portee: [3, "m"], cible: ["1", "creature"], degats: [{ des: "1d4", types: ["fire"] }], consomme: false }]
  }),

  // --- Baron Nizzel Baille-Fonds
  equipement({
    cle: "lunettes-de-surete-du-contremaitre", nom: "Lunettes de sûreté du contremaître", img: icone("icons/equipment/head/goggles-welding.webp"),
    categorie: "wondrous", rarete: "uncommon", magique: true, prix: [400, "gp"], poids: 0.5,
    texte: `Des lunettes de soudeur aux verres fumés, sanglées de cuir, que le baron faisait porter à ses contremaîtres (il les leur retenait sur la paie). Tant que vous les portez, vous voyez dans le noir jusqu'à 18 m, et vous avez l'avantage aux jets de sauvegarde contre l'état aveuglé causé par une lumière vive ou une explosion.\n\n${texteEnsemble("les Gantelets ignifugés du contremaître")}`,
    effets: [
      { nom: "Lunettes de sûreté", changements: [["system.attributes.senses.ranges.darkvision", 18, "upgrade"]], texte: "Vision dans le noir 18 m." },
      { nom: `${ENSEMBLE} (2 pièces)`, desactive: true, changements: [["system.traits.dr.value", "fire"], ["system.abilities.dex.save.roll.bonus", "2"]],
        texte: "Bonus d'ensemble, à allumer quand les gantelets et les lunettes sont portés tous les deux : résistance au feu et +2 aux jets de sauvegarde de Dextérité." }
    ]
  }),
  arme({
    cle: "pistolet-fusee-du-baron", nom: "Pistolet-fusée du baron", img: icone("icons/weapons/guns/gun-pistol-flintlock-metal.webp"),
    categorie: "martialR", base: "pistol", degats: { des: "1d10", types: ["piercing"] }, proprietes: ["amm", "lod"], maitrise: "vex", portee: [9, 27],
    bonus: 1, rarete: "rare", prix: [1500, "gp"], poids: 3,
    texte: "Un pistolet à canon doré, gravé du sceau du Cartel Baille-Fonds : une bourse percée. C'est une **arme +1** (pistolet). Sous le canon, un second tube tire une fusée éclairante : une fois par jour, par une **action bonus**, vous l'envoyez jusqu'à 90 m ; elle éclaire en lumière vive un rayon de 18 m pendant 1 minute, et on la voit à des kilomètres. Le tube se recharge à l'aube.",
    utilisations: { max: 1, periode: "dawn" },
    activites: [{ type: "utility", nom: "Fusée éclairante", activation: "bonus", portee: [90, "m"], duree: [1, "minute"] }]
  }),
  equipement({
    cle: "bottes-a-ressorts-baille-fonds", nom: "Bottes à ressorts Baille-Fonds", img: icone("icons/equipment/feet/boots-armored-brass.webp"),
    categorie: "wondrous", rarete: "uncommon", magique: true, prix: [500, "gp"], poids: 3,
    texte: "Des bottes de laiton montées sur deux ressorts graissés, qui grincent à chaque pas. Votre vitesse augmente de 1,5 m tant que vous les portez. Trois fois par jour, par une **action bonus**, vous bondissez jusqu'à 6 m en longueur ou 3 m en hauteur, sans élan. Elles retrouvent leurs bonds à l'aube.",
    utilisations: { max: 3, periode: "dawn" },
    effets: [{ nom: "Bottes à ressorts", changements: [["system.attributes.movement.bonus", "1.5"]], texte: "Vitesse +1,5 m." }],
    activites: [{ type: "utility", nom: "Bond à ressorts", activation: "bonus" }]
  }),
  butin({
    cle: "moteur-a-huile-de-feu", nom: "Moteur à huile de feu miniature", img: icone("icons/commodities/tech/motor-rotating.webp"), categorie: "material",
    prix: [250, "gp"], poids: 8,
    texte: "Le petit moteur de secours du Grand Déchiqueteur, encore chaud. Un ingénieur gnome ou gobelin en donnerait un bon prix ; Vizzik Tirelire, s'il est encore en affaires, le double."
  }),
  butin({
    cle: "registre-du-cartel-baille-fonds", nom: "Registre du Cartel Baille-Fonds", img: icone("icons/sundries/documents/document-sealed-signatures-red.webp"), categorie: "treasure",
    prix: [50, "gp"], poids: 1,
    texte: "Le livre de comptes du baron : livraisons d'huile de feu, pots-de-vin versés à des gardes de Cabestan, et une commande de vingt barils « à livrer à la Lame ardente, paiement en pièces anciennes ». Remis à Grizzla Tordeboulon, il vaut une prime de 100 po et **+5** de réputation auprès du Cartel Gentepression."
  })
]);

// Ensemble : chaque pièce porte flags.ensemble ; l'effet de bonus porte ensemble et pieces (nombre de pièces différentes à
// porter). scripts/automatismes.js l'allume et l'éteint selon les pièces équipées.
export const ENSEMBLE_CLE = "tenue-meche-noire";
for (const cle of ["gantelets-ignifuges-du-contremaitre", "lunettes-de-surete-du-contremaitre"]) {
  BUTIN_DONJON.find(d => d.__cle === `objets:${cle}`).flags[MODULE].ensemble = ENSEMBLE_CLE;
}
BUTIN_DONJON.find(d => d.__cle === "objets:lunettes-de-surete-du-contremaitre").effects[1].flags = { [MODULE]: { ensemble: ENSEMBLE_CLE, pieces: 2 } };

// ---------------------------------------------------------------- Boss

export const BOSS_DONJON = [
  pnj({ cle: "grokka-deux-cles", nom: "Grokka Deux-Clés, contremaître de Mèche-Noire", fp: 4, taille: "G", type: "géant", sousType: "ogre",
    alignement: "Neutre mauvais", ca: 15, armure: "plaques de chaudière rivetées", pv: 95, dv: "10d10 + 40",
    carac: { for: 20, dex: 8, con: 18, int: 7, sag: 10, cha: 9 }, sauvegardes: ["for", "con"], competences: { athletisme: 1, intimidation: 1 },
    vitesse: { marche: 12 }, sens: { noir: 18 }, langues: "ogre, gobelin, quelques mots de commun", role: "chef",
    legendaire: { actions: 2, resistances: 1, repaire: { initiative: 20 } },
    capacites: [
      attaquesMultiples("Grokka fait deux attaques de Clé à tube."),
      attaque("Clé à tube", { toucher: 7, degats: "2d8+5", type: "contondant", allonge: 3, arme: "guerre", effet: "Si la cible est de taille M ou inférieure, elle est repoussée de 3 m." }),
      attaque("Boulon lancé", { toucher: 7, degats: "2d6+5", type: "contondant", distance: true, portee: [9, 36], carac: "for" }),
      sauvegarde("Pluie de rivets", { carac: "dex", dd: 14, zone: { forme: "rayon", taille: 3 }, degats: "4d6", type: "perforant", recharge: 5,
        texte: "Grokka frappe la passerelle de sa clé : au plafond, les seaux de rivets basculent. Il désigne jusqu'à trois points qu'il voit à 18 m ou moins ; un cercle rouge de 3 m de rayon apparaît au sol autour de chacun (zones annoncées). Les rivets tombent au début du prochain tour de Grokka : une créature encore dans un cercle fait le jet." }),
      action("Phase 2 — Tuyau arraché", "*Se déclenche une seule fois, dès que Grokka tombe à 47 points de vie ou moins (la moitié).* Grokka arrache la conduite d'huile qui court le long de la paroi et la brandit comme une massue. L'huile noire inonde le sol dans un rayon de 6 m autour de lui : c'est un terrain difficile, et la première flamme l'embrase (la nappe brûle 1 minute ; 2d6 dégâts de feu à qui y entre ou y commence son tour). Grokka entre en rage : **+2** aux jets d'attaque au corps à corps, **−2** à la CA, et il ne lance plus de Boulon.", {
        activation: "special",
        effet: { nom: "Rage du contremaître", changements: [["system.rolls.attack.mwak.bonus", "2"], ["system.attributes.ac.bonus", "-2"]], texte: "+2 aux jets d'attaque au corps à corps, −2 à la CA, jusqu'à la fin du combat." }
      }),
      action("Pas lourd", "Grokka se déplace de la moitié de sa vitesse sans provoquer d'attaque d'opportunité. Chaque créature de taille M ou inférieure dont il traverse l'espace est poussée de 1,5 m sur le côté.", { activation: "legendaire" }),
      attaque("Revers de clé", { toucher: 7, degats: "2d8+5", type: "contondant", allonge: 3, arme: "guerre", activation: "legendaire" }),
      action("Coup de sifflet", "Grokka siffle entre ses doigts : deux kobolds mineurs (fiche du bestiaire) surgissent d'une galerie latérale à 9 m ou moins de lui et jouent juste après lui dans l'initiative. Pas plus de quatre kobolds appelés pendant le combat.", { activation: "legendaire", cout: 2 }),
      sauvegarde("Wagonnet fou", { carac: "dex", dd: 13, zone: { forme: "ligne", taille: 18 }, degats: "2d10", type: "contondant", activation: "repaire", moitie: false,
        echec: "La cible tombe à terre", reussite: "la cible se jette hors des rails et ne subit rien",
        texte: "Un wagonnet chargé de minerai dévale les rails de la Galerie principale vers le Front de taille. Le grincement s'entend un round à l'avance : le MJ annonce la ligne de 18 m sur 1,5 m de large au tour précédent." })
    ],
    texte: "Un ogre gris-bleu de plus de trois mètres, sanglé dans des plaques de chaudière rivetées, deux énormes clés à tube passées à la ceinture comme des épées. Il compte les wagonnets à voix haute, et se trompe toujours.",
    mj: "Contremaître de la raffinerie pour le baron Baille-Fonds, payé en viande et en bière. Il tient le Front de taille et sait qu'il sera puni s'il laisse passer quelqu'un. Il cogne d'abord le plus proche, lance des boulons sur ceux qui restent loin, et fait tomber la Pluie de rivets sur les groupes serrés. Phase 2 à 47 PV (voir sa capacité). Il se rend à 15 PV si on lui promet à manger et la vie sauve (Intimidation ou Persuasion DD 14) : il donne alors l'une de ses deux clés, celle de la grille du Puits de descente." }),

  pnj({ cle: "mere-brasier", nom: "Mère-Brasier, l'élémentaire enchaînée", fp: 5, taille: "G", type: "élémentaire", sousType: "feu",
    alignement: "Neutre", ca: 14, pv: 102, dv: "12d10 + 36",
    carac: { for: 12, dex: 17, con: 16, int: 6, sag: 10, cha: 7 },
    vitesse: { marche: 15 }, sens: { noir: 18 }, resistances: ["contondant", "perforant", "tranchant"], immunites: ["feu", "poison"],
    immunitesEtats: ["épuisement", "agrippé", "paralysé", "pétrifié", "empoisonné", "à terre", "entravé", "inconscient"],
    langues: "primordial (igné), comprend le gobelin", role: "chef",
    legendaire: { actions: 3, resistances: 1, repaire: { initiative: 20 } },
    capacites: [
      trait("Forme de feu", "Une créature qui touche Mère-Brasier ou la frappe au corps à corps à 1,5 m ou moins subit 5 (1d10) dégâts de feu. Un objet inflammable qu'elle touche prend feu. Chaque litre d'eau versé sur elle lui inflige 1 dégât de froid ; un bassin lunaire réveillé la tuerait."),
      trait("Enchaînée à la chaudière", "Avant la phase 2, Mère-Brasier ne quitte pas le centre du Puits de descente : sa vitesse est de 0. Quatre chaînes runiques la retiennent (CA 16, 25 PV chacune, immunisées contre le feu et le poison ; à 1,5 m d'une chaîne, on la frappe sans rien risquer de ses fouets). Chaque chaîne brisée lui inflige 10 dégâts de force. Quand la quatrième cède, la phase 2 commence, quels que soient ses points de vie."),
      trait("Jauge de pression", "La chaudière a une jauge de 0 à 6, que le MJ tient en vue de tous. Elle monte de 1 à chaque Soupape hurlante. Une créature à côté de l'une des trois vannes du Puits peut, par une action, la faire baisser de 1 (Force (Athlétisme) ou outils de bricoleur DD 14). À 4 ou plus, Mère-Brasier a l'avantage à ses jets d'attaque. À 6, la chaudière crache : chaque créature dans le Puits fait un jet de sauvegarde de Constitution DD 14 et subit 21 (6d6) dégâts de feu en cas d'échec, la moitié en cas de réussite ; la jauge retombe à 0."),
      attaquesMultiples("Mère-Brasier fait deux attaques de Fouet de flammes."),
      attaque("Fouet de flammes", { toucher: 6, degats: "2d6+3", type: "feu", allonge: 3, carac: "dex", effet: "Si la cible est une créature, elle prend feu : 1d4 dégâts de feu au début de chacun de ses tours, jusqu'à ce qu'elle ou un allié dépense une action pour éteindre les flammes." }),
      sauvegarde("Jet de vapeur", { carac: "con", dd: 14, zone: { forme: "cone", taille: 6 }, degats: "4d6", type: "feu", recharge: 5,
        texte: "La chaudière dans le dos de Mère-Brasier vomit un jet de vapeur brûlante." }),
      action("Phase 2 — Les chaînes cèdent", "*Se déclenche une seule fois, dès que Mère-Brasier tombe à 51 points de vie ou moins (la moitié), ou quand sa dernière chaîne se brise.* Les chaînes fondent comme de la cire. Libérée, elle se déplace enfin (vitesse 15 m, plus 3 m) et a l'avantage aux jets de sauvegarde de Dextérité. Chaque case qu'elle quitte devient une **flaque de scories** jusqu'à la fin du combat : terrain difficile, 5 (1d10) dégâts de feu à qui y entre ou y commence son tour. La jauge de pression ne monte plus, mais garde sa valeur.", {
        activation: "special",
        effet: { nom: "Libérée de ses chaînes", changements: [["system.attributes.movement.bonus", "3"], ["system.abilities.dex.save.roll.mode", 1]], texte: "Vitesse +3 m et avantage aux jets de sauvegarde de Dextérité, jusqu'à la fin du combat." }
      }),
      attaque("Crachat de scories", { toucher: 6, degats: "2d8", type: "feu", distance: true, magique: true, portee: [18], carac: "dex", activation: "legendaire" }),
      action("Ruissellement", "Phase 2 seulement : Mère-Brasier se déplace de la moitié de sa vitesse, sans provoquer d'attaque d'opportunité, et laisse ses flaques de scories derrière elle.", { activation: "legendaire" }),
      sauvegarde("Bouffée de la chaudière", { carac: "dex", dd: 14, zone: { forme: "rayon", taille: 3 }, degats: "3d6", type: "feu", activation: "legendaire", cout: 2,
        texte: "Mère-Brasier se gonfle et souffle une vague de chaleur autour d'elle." }),
      sauvegarde("Soupape hurlante", { carac: "dex", dd: 14, zone: { forme: "rayon", taille: 1.5 }, degats: "3d6", type: "feu", activation: "repaire",
        texte: "L'une des trois bouches de vapeur du Puits, désignée au tour précédent par un sifflement aigu (zone annoncée), crache une colonne de vapeur de 1,5 m de rayon et 6 m de haut. La jauge de pression monte de 1." })
    ],
    texte: "Une silhouette de flammes orangées, haute comme deux hommes, aux bras qui se terminent en longs fouets de feu. Quatre chaînes couvertes de runes la relient à une énorme chaudière de cuivre ; à chaque pulsation, l'huile bout dans les cuves.",
    mj: "Un élémentaire de feu arraché aux Terres de feu par un sorcier du Cartel et enchaîné pour chauffer les alambics. Elle hait ses geôliers plus que les intrus, mais ne fait pas la différence dans sa douleur. Elle frappe tout ce qui approche, souffle sa vapeur sur les groupes, et la chaudière fait monter la pression. Les joueurs ont un vrai choix : briser les chaînes plus tôt (la blesse, mais la libère) ou laisser la jauge monter. Phase 2 à 51 PV. Elle ne parle pas, mais un personnage qui lui parle en primordial (ou qui réussit Arcanes DD 15) comprend qu'elle veut seulement rentrer chez elle : si on détruit les quatre chaînes ET la chaudière sans la tuer, elle s'éteint d'elle-même et laisse son Cœur de braise." }),

  pnj({ cle: "baron-nizzel-baille-fonds", nom: "Baron Nizzel Baille-Fonds, dans le Grand Déchiqueteur", fp: 6, taille: "G", type: "artificiel", sousType: "gobelin aux commandes",
    alignement: "Neutre mauvais", ca: 17, armure: "blindage de déchiqueteur", pv: 127, dv: "15d10 + 45",
    carac: { for: 20, dex: 10, con: 17, int: 16, sag: 11, cha: 14 }, sauvegardes: ["for", "con"],
    vitesse: { marche: 9 }, sens: { noir: 18 }, immunites: ["poison", "psychique"], immunitesEtats: ["charmé", "effrayé", "empoisonné", "épuisement"],
    langues: "gobelin, commun, orc", role: "chef",
    legendaire: { actions: 3, resistances: 2, repaire: { initiative: 20 } },
    capacites: [
      trait("Pilote à l'abri", "Le baron est enfermé dans le poste de pilotage blindé. Quand le Grand Déchiqueteur tombe à 0 point de vie, il s'éjecte grâce à une fusée dorsale : il atterrit à 9 m avec 10 points de vie (CA 12, profil d'un bandit défias) et tente de fuir par la cheminée d'aération. Capturé, il marchande tout : sa vie contre son registre, sa fortune, ses complices de Cabestan."),
      attaquesMultiples("Le Grand Déchiqueteur fait deux attaques : deux de Scie circulaire, ou une de Scie circulaire et une de Pince hydraulique."),
      attaque("Scie circulaire", { toucher: 8, degats: "2d10+5", type: "tranchant", allonge: 3, arme: "guerre" }),
      attaque("Pince hydraulique", { toucher: 8, degats: "2d6+5", type: "contondant", allonge: 3, effet: "La cible est agrippée (évasion DD 16). Tant qu'il la tient, le Déchiqueteur ne peut pas pincer une autre cible." }),
      sauvegarde("Salve verrouillée", { carac: "dex", dd: 14, zone: { forme: "rayon", taille: 3 }, degats: "6d6", type: "feu", recharge: 5,
        texte: "Le baron verrouille une créature qu'il voit à 36 m ou moins : une cible rouge s'allume à ses pieds (zone annoncée). À la fin du prochain tour de cette créature, quatre fusées s'abattent dans un rayon de 3 m centré sur elle. Ses alliés ont donc un tour pour s'écarter d'elle, et elle pour s'écarter d'eux." }),
      sauvegarde("Lance-flammes rotatif", { carac: "dex", dd: 14, zone: { forme: "cone", taille: 9 }, degats: "5d6", type: "feu", recharge: 6,
        texte: "Le bras gauche du Déchiqueteur pivote et balaie la galerie d'un jet d'huile de feu enflammée." }),
      action("Phase 2 — Surcharge du réacteur", "*Se déclenche une seule fois, dès que le Grand Déchiqueteur tombe à 63 points de vie ou moins (la moitié).* Les plaques de blindage sautent et le réacteur à huile de feu rougeoie à nu. Aura de chaleur : chaque créature qui commence son tour à 3 m ou moins du Déchiqueteur subit 7 (2d6) dégâts de feu. Il gagne **+2** aux jets d'attaque au corps à corps mais perd **2** points de CA, et les tapis roulants s'inversent (ils mènent désormais vers la fosse aux scories, à l'ouest). Le MJ porte ses actions légendaires à 4 par round sur la fiche.", {
        activation: "special",
        effet: { nom: "Réacteur en surcharge", changements: [["system.rolls.attack.mwak.bonus", "2"], ["system.attributes.ac.bonus", "-2"]], texte: "+2 aux jets d'attaque au corps à corps, −2 à la CA ; aura de feu de 3 m (2d6), jusqu'à la fin du combat." }
      }),
      action("Pas mécanique", "Le Grand Déchiqueteur se déplace de la moitié de sa vitesse sans provoquer d'attaque d'opportunité.", { activation: "legendaire" }),
      attaque("Revers de scie", { toucher: 8, degats: "2d10+5", type: "tranchant", allonge: 3, arme: "guerre", activation: "legendaire" }),
      sauvegarde("Mines sauteuses", { carac: "dex", dd: 14, zone: { forme: "rayon", taille: 1.5 }, degats: "3d6", type: "feu", activation: "legendaire", cout: 2,
        texte: "Le Déchiqueteur lâche deux mines dans des cases inoccupées à 9 m ou moins de lui (zones au sol, visibles de tous). Une créature qui entre dans une case minée, ou à 1,5 m d'elle, la fait exploser ; une mine dure jusqu'à la fin du combat." }),
      sauvegarde("Tapis roulant", { carac: "dex", dd: 14, zone: { forme: "ligne", taille: 12 }, degats: "3d10", type: "tranchant", activation: "repaire", moitie: false,
        echec: "La créature est entraînée dans le broyeur et tombe à terre", reussite: "elle saute du tapis à temps et ne subit rien",
        texte: "Les deux tapis roulants de la galerie (bandes de 3 m de large) avancent de 3 m vers le broyeur à minerai, à l'est (vers la fosse aux scories, à l'ouest, en phase 2) : chaque créature qui s'y trouve est déplacée d'autant. Seule une créature poussée au bout d'un tapis fait le jet." })
    ],
    texte: "Une carcasse de métal de quatre mètres, hérissée de scies, de tuyaux et de lance-fusées, au milieu de laquelle un petit gobelin en redingote dorée hurle des ordres derrière une vitre blindée. Sur la plaque de poitrine, le sceau du Cartel Baille-Fonds : une bourse percée.",
    mj: "Nizzel Baille-Fonds veut prendre au Cartel Gentepression le marché des Tarides. Il vend son huile de feu à quiconque paie, la Lame ardente comprise (voir son registre). Avare et lâche, il se bat pourtant comme un diable dans sa machine. Il ouvre avec la Salve verrouillée sur le soigneur, garde le Lance-flammes pour les groupes, sème des mines entre lui et les tireurs, et use du tapis roulant pour pousser les combattants au corps à corps vers le broyeur. Phase 2 à 63 PV. À 0 PV, il s'éjecte (voir Pilote à l'abri)." })
];

// Repère des boss pour scripts/automatismes.js : flags.boss = { phase2: nom exact de la capacité de phase 2 }.
for (const b of BOSS_DONJON) {
  const phase = b.__objets.find(o => o.name.startsWith("Phase 2"));
  b.flags[MODULE].boss = { phase2: phase.name };
}

// ---------------------------------------------------------------- Tables de butin (une par boss)

const tableButin = (cle, nom, formule, description, resultats) => {
  const t = table({ cle, nom, formule, description, resultats });
  t.flags[MODULE].aventure = TITRE_DONJON;
  return t;
};

export const TABLES_DONJON = [
  tableButin("butin-grokka-deux-cles", "Butin — Grokka Deux-Clés (Mèche-Noire)", "1d6",
    "Une fois Grokka vaincu (ou rendu), tirez une fois. Ajoutez toujours ses deux clés (grille du Puits, coffre des paies : 60 po) et 2d10 po dans ses poches.", [
      [1, 2, ref("objets:cle-a-tube-de-grokka")],
      [3, 4, ref("objets:gantelets-ignifuges-du-contremaitre")],
      [5, 5, ref("objets:casque-de-mineur-a-lanterne")],
      [6, 6, ref("objets:potion-de-soins-majeure")]
    ]),
  tableButin("butin-mere-brasier", "Butin — Mère-Brasier (Mèche-Noire)", "1d6",
    "Quand Mère-Brasier s'éteint, tirez une fois. Si elle a été libérée sans être tuée, ne tirez pas : le groupe reçoit le Cœur de braise captif.", [
      [1, 2, ref("objets:coeur-de-braise-captif")],
      [3, 4, ref("objets:flasque-d-huile-de-feu")],
      [5, 5, ref("objets:fouet-chaine-de-l-enchainee")],
      [6, 6, ref("objets:potion-de-mana-mineure")]
    ]),
  tableButin("butin-baron-nizzel", "Butin — Baron Nizzel Baille-Fonds (Mèche-Noire)", "1d8",
    "Dans la carcasse du Grand Déchiqueteur et la cabine du baron : tirez deux fois (relancez un doublon). Le Registre du Cartel Baille-Fonds est toujours dans la cabine, en plus du tirage.", [
      [1, 2, ref("objets:lunettes-de-surete-du-contremaitre")],
      [3, 4, ref("objets:pistolet-fusee-du-baron")],
      [5, 6, ref("objets:bottes-a-ressorts-baille-fonds")],
      [7, 7, ref("objets:moteur-a-huile-de-feu")],
      [8, 8, ref("objets:registre-du-cartel-baille-fonds")]
    ])
];

// ---------------------------------------------------------------- Journaux

const RARETE = { common: "commun (blanc)", uncommon: "peu commun (vert)", rare: "rare (bleu)", veryRare: "très rare (violet)", legendary: "légendaire (orange)" };
const qualite = cle => {
  const o = BUTIN_DONJON.find(d => d.__cle === cle) ?? OBJETS.find(d => d.__cle === cle);
  return RARETE[o.system.rarity] ?? "ordinaire";
};

// Journal de rencontre (visible) : ne lie que les objets et les tables, ouverts aux joueurs.
const lienJoueur = liens(BUTIN_DONJON, OBJETS, TABLES_DONJON);
const butinVisible = cles => cles.map(c => `- ${lienJoueur(c)} — ${qualite(c)}`).join("\n");

const JOURNAL_RENCONTRE = journal({
  cle: "journal-de-rencontre-meche-noire", nom: `Journal de rencontre — ${TITRE_DONJON}`, visible: true, pages: [
    { titre: TITRE_DONJON, texte: `
*Une vieille mine de cuivre dans les collines au nord de Cabestan. Le Cartel Baille-Fonds l'a rachetée pour une bouchée de pain, et depuis, une fumée noire et grasse sort des cheminées d'aération jour et nuit. On parle d'ouvriers kobolds qui ne remontent plus, et d'une huile qui brûle même sous la pluie.*

**Niveau conseillé :** 5 (trois à cinq aventuriers). **Durée :** une séance.

**Rencontres**

- **Grokka Deux-Clés**, contremaître ogre, au front de taille.
- **Mère-Brasier**, l'élémentaire enchaînée, au puits de la chaudière.
- **Baron Nizzel Baille-Fonds**, dans son Grand Déchiqueteur, à la galerie du broyeur.

**Lire ce journal.** Chaque page décrit un boss comme les éclaireurs l'ont rapporté : ses attaques, ce qu'il faut éviter au sol, et ce qui change quand il est à moitié vaincu. *Pour ceux qui encaissent*, *pour ceux qui soignent* et *pour ceux qui frappent* rappellent ce que chacun doit surveiller.

**Qualité du butin** : commun (blanc), peu commun (vert), rare (bleu), très rare (violet). Les **Gantelets ignifugés** et les **Lunettes de sûreté** du contremaître forment l'ensemble « ${ENSEMBLE} » : portés ensemble, ils accordent un bonus de plus.` },
    { titre: "Grokka Deux-Clés", texte: `
*Un ogre de trois mètres en plaques de chaudière, deux clés à tube à la ceinture. Il garde le front de taille pour le baron, et compte les wagonnets en se trompant.*

**Aperçu.** Grokka frappe fort et pousse ses adversaires. Il fait pleuvoir des rivets sur ceux qui restent groupés, siffle ses ouvriers kobolds en renfort, et les wagonnets dévalent les rails sans prévenir… ou presque.

**Capacités**

- **Clé à tube** : deux coups lourds par tour, qui repoussent les petites créatures.
- **Boulon lancé** : sur qui reste à distance.
- **Pluie de rivets** : trois cercles rouges de 3 m apparaissent au sol. Les rivets tombent au tour suivant de Grokka : *sortez des cercles.*
- **Coup de sifflet** : deux kobolds surgissent d'une galerie latérale.
- **Wagonnet fou** : un grincement annonce la ligne des rails ; au début du round suivant, un wagonnet la balaie. *Ne restez pas sur les rails.*

**À la moitié de ses forces — Tuyau arraché.** Grokka arrache une conduite d'huile : le sol autour de lui devient une nappe noire et glissante, que la moindre flamme embrase. Il frappe plus juste, mais se protège moins.

**Pour ceux qui encaissent :** gardez-le dos à la paroi, loin des rails. **Pour ceux qui soignent :** restez hors des cercles, et ne lancez pas de feu dans l'huile. **Pour ceux qui frappent :** les kobolds d'abord s'ils sont trois ou plus.

**Butin possible**
${butinVisible(["objets:cle-a-tube-de-grokka", "objets:gantelets-ignifuges-du-contremaitre", "objets:casque-de-mineur-a-lanterne", "objets:potion-de-soins-majeure"])}` },
    { titre: "Mère-Brasier", texte: `
*Une silhouette de flammes haute comme deux hommes, enchaînée à une énorme chaudière de cuivre. Elle chauffe les alambics de la raffinerie depuis des mois, et elle souffre.*

**Aperçu.** Tant que ses quatre chaînes tiennent, Mère-Brasier ne bouge pas, mais ses fouets de flammes portent loin. La chaudière derrière elle fait monter la pression : il faut fermer les vannes avant qu'elle ne crache sur toute la salle.

**Capacités**

- **Fouet de flammes** : deux coups par tour ; la cible prend feu jusqu'à ce qu'on l'éteigne.
- **Jet de vapeur** : un cône de vapeur brûlante.
- **Forme de feu** : la frapper au contact brûle.
- **Soupape hurlante** : un sifflement aigu désigne l'une des trois bouches de vapeur ; au round suivant, elle crache une colonne brûlante. *Écartez-vous de la bouche qui siffle.* Chaque soupape fait monter la **jauge de pression**.
- **Jauge de pression** : à 4, Mère-Brasier frappe mieux ; à 6, toute la salle brûle. Une action à côté d'une vanne la fait baisser.
- **Les chaînes** : on peut les briser. Chaque chaîne brisée la blesse… mais la quatrième la libère.

**À la moitié de ses forces — Les chaînes cèdent.** Mère-Brasier se libère et se déplace vite ; chaque case qu'elle quitte devient une **flaque de scories** brûlante. La jauge ne monte plus.

**Pour ceux qui encaissent :** dans la phase 2, entraînez-la loin des autres. **Pour ceux qui soignent :** éteignez les alliés en feu, cela compte. **Pour ceux qui frappent :** quelqu'un doit toujours être près d'une vanne. Et l'eau la blesse.

**Butin possible**
${butinVisible(["objets:coeur-de-braise-captif", "objets:flasque-d-huile-de-feu", "objets:fouet-chaine-de-l-enchainee", "objets:potion-de-mana-mineure"])}` },
    { titre: "Baron Nizzel Baille-Fonds", texte: `
*Un petit gobelin en redingote dorée, à l'abri derrière la vitre blindée d'un déchiqueteur de quatre mètres hérissé de scies et de lance-fusées. Il hurle des ordres, des insultes et des prix.*

**Aperçu.** Le Grand Déchiqueteur découpe tout ce qui l'approche, verrouille ses fusées sur un aventurier, sème des mines et balaie la galerie de flammes. Les tapis roulants de la galerie emportent tout le monde vers le broyeur.

**Capacités**

- **Scie circulaire** et **Pince hydraulique** : coups terribles ; la pince retient sa proie.
- **Salve verrouillée** : une cible rouge s'allume sous les pieds d'un aventurier. À la fin de son tour suivant, des fusées frappent 3 m autour de lui. *La cible s'écarte des autres, les autres s'écartent d'elle.*
- **Lance-flammes rotatif** : un large cône de feu.
- **Mines sauteuses** : deux mines tombent au sol, bien visibles. *Ne marchez pas dessus, ni à côté.*
- **Tapis roulant** : à chaque round, les tapis avancent de 3 m vers le broyeur. *Sautez avant le bout.*

**À la moitié de ses forces — Surcharge du réacteur.** Le blindage saute : la machine frappe plus fort mais se protège moins, une chaleur insoutenable brûle quiconque reste à son contact, et les tapis roulants changent de sens, vers la fosse aux scories.

**Pour ceux qui encaissent :** tenez-le loin des tapis ; en phase 2, alternez au contact. **Pour ceux qui soignent :** gardez une réserve pour la salve. **Pour ceux qui frappent :** le baron s'éjecte quand sa machine tombe : quelqu'un doit être prêt à le rattraper.

**Butin possible**
${butinVisible(["objets:lunettes-de-surete-du-contremaitre", "objets:pistolet-fusee-du-baron", "objets:bottes-a-ressorts-baille-fonds", "objets:moteur-a-huile-de-feu", "objets:registre-du-cartel-baille-fonds"])}` }
  ]
});

// Journal du MJ (caché).
const lien = liens(BOSS_DONJON, BUTIN_DONJON, TABLES_DONJON, BESTIAIRE, PNJ_CAMPAGNE, OBJETS, CARTES_LIEUX, [JOURNAL_RENCONTRE]);
const fiche = (cle, nom) => lien(`bestiaire:${cle}`, nom);
const MINE = lien("scenes:lieu-mine", "Lieu — Mine");

const JOURNAL_MJ = journal({
  cle: "donjon-meche-noire", nom: `Donjon — ${TITRE_DONJON} (MJ)`, visible: false, pages: [
    { titre: "Synopsis (MJ)", texte: `
**${TITRE_DONJON}** est un donjon court de trois boss pour **3 à 5 personnages de niveau 5**, une séance. Il se place entre les chapitres 2 et 3 de la campagne des Braises de la Légion (ou se joue seul). Carte : *${MINE}* (compendium des scènes, carte générique) ; les salles du donjon sont ses pièces.

**Ce qui se passe.** Le baron gobelin **${fiche("baron-nizzel-baille-fonds", "Nizzel Baille-Fonds")}**, du Cartel Baille-Fonds, a racheté une mine de cuivre épuisée au nord de Cabestan. Un sorcier du Cartel y a enchaîné **${fiche("mere-brasier", "Mère-Brasier")}**, un élémentaire de feu, sous une chaudière : sa chaleur distille une **huile de feu** que le baron vend à tout le monde, la Lame ardente comprise. Son contremaître ogre **${fiche("grokka-deux-cles", "Grokka Deux-Clés")}** fait trimer des kobolds enlevés aux galeries voisines.

**Accroches**

- Grizzla Tordeboulon (Cartel Gentepression) veut la raffinerie de son rival fermée et ses comptes saisis : 150 po par personnage, et le contrat « La raffinerie qui fume » du tableau de Cabestan.
- Le Cercle cénarien a senti un élémentaire captif qui souffre : il demande qu'on le libère plutôt qu'on le tue.
- Les registres de Vizzik Tirelire (chapitre 1) mentionnent des barils d'huile « livrés au cratère ».

**Le journal de rencontre.** Montrez aux joueurs ${lien("journaux:journal-de-rencontre-meche-noire", "le journal de rencontre")} (une page par boss) avant d'entrer, ou au fil des salles : il annonce les mécaniques comme le ferait un éclaireur.

**Déroulement** (pièces de la carte)

- **Carreau de la mine** : deux gardes gobelins (profil de ${fiche("bandit-defias", "Bandit défias")}) et quatre ${fiche("kobold-mineur", "kobolds mineurs")} enchaînés aux wagonnets, qui ne se battent que si on les y force. Libérés, les kobolds indiquent la grille du Puits et la cheminée par où le baron s'enfuit toujours.
- **Front de taille** : boss 1, Grokka.
- **Réserve d'outils** : repos court possible ; coffre (${jet("outils de voleur", 14)}) : 2 ${lien("objets:flasque-d-huile-de-feu", "flasques d'huile de feu")} et 40 po.
- **Puits de descente** : boss 2, Mère-Brasier (grille fermée : la clé de Grokka ou ${jet("Athlétisme", 16)}).
- **Galerie effondrée**, devenue la galerie du broyeur : un ${fiche("dechiqueteur-fonderie", "déchiqueteur de la fonderie")} de garde, puis boss 3, le baron.

**Équilibre.** Pour 3 personnages : retirez une action légendaire à chaque boss et la Pluie de rivets n'a que deux cercles. Pour 5 : Grokka appelle six kobolds au lieu de quatre, la jauge de Mère-Brasier commence à 1, et le baron a deux gardes gobelins dans sa galerie. Au niveau 4, retirez 20 PV à chaque boss ; au niveau 6, ajoutez-en 20 ; la phase 2 se déclenche alors à la moitié des nouveaux PV.` },
    { titre: "Boss 1 — Grokka Deux-Clés", texte: `
**Salle :** Front de taille (12 m sur 12). Les rails de la Galerie principale y débouchent par l'est ; une passerelle de bois court au plafond avec ses seaux de rivets. Fiche : ${fiche("grokka-deux-cles", "Grokka Deux-Clés")} (FP 4, actions légendaires 2, résistance légendaire 1, actions de repaire à l'initiative 20).

**Zones au sol** (à annoncer, ou à dessiner en zones de la scène)

- **Cercles de rivets** (Pluie de rivets) : jusqu'à trois cercles de 3 m de rayon, posés au tour de Grokka, qui frappent au début de son tour suivant : ${jetSauvegarde("Dextérité", 14)}, ${degats("4d6", "perforant")} (moitié en cas de réussite).
- **Rails** (Wagonnet fou, action de repaire) : ligne de 18 m sur 1,5 m, annoncée par un grincement au round précédent : ${jetSauvegarde("Dextérité", 13)}, ${degats("2d10", "contondant")} et à terre en cas d'échec.
- **Nappe d'huile** (phase 2) : rayon de 6 m autour de l'endroit où Grokka arrache le tuyau ; ${reference("terrain difficile")}. Embrasée, elle brûle 1 minute : ${degats("2d6", "feu")} à qui y entre ou y commence son tour.

**Phase 2 — Tuyau arraché (47 PV).** Dès que Grokka tombe à 47 PV, utilisez sa capacité « Phase 2 — Tuyau arraché » (elle lui applique l'effet *Rage du contremaître* : +2 aux attaques au corps à corps, −2 à la CA) et posez la nappe d'huile. Il ne lance plus de Boulon.

**Renforts.** Coup de sifflet (2 actions légendaires) : deux ${fiche("kobold-mineur", "kobolds mineurs")}, quatre au plus pendant le combat. Des kobolds déjà libérés au Carreau ne répondent plus.

**Fin.** Il se rend à 15 PV contre de la nourriture et la vie sauve (${jet("Persuasion ou Intimidation", 14)}). Butin : ${lien("tables:butin-grokka-deux-cles")}.` },
    { titre: "Boss 2 — Mère-Brasier", texte: `
**Salle :** Puits de descente (9 m sur 13), sol de pierre ; la chaudière de cuivre occupe le fond, trois vannes rouges sur les parois, trois bouches de vapeur au sol. Fiche : ${fiche("mere-brasier", "Mère-Brasier")} (FP 5, actions légendaires 3, résistance légendaire 1, actions de repaire à l'initiative 20).

**La jauge de pression** (de 0 à 6, visible de tous) : +1 à chaque Soupape hurlante. Faire baisser la jauge de 1 : une action à côté d'une vanne, ${jet("Athlétisme", 14)} ou ${jet("outils de bricoleur", 14)}. À 4 ou plus, Mère-Brasier attaque avec l'avantage. À 6 : ${jetSauvegarde("Constitution", 14)} pour chaque créature du Puits, ${degats("6d6", "feu")} (moitié en cas de réussite), puis la jauge retombe à 0.

**Les chaînes.** Quatre chaînes (CA 16, 25 PV, immunisées contre le feu et le poison). Chaque chaîne brisée inflige 10 dégâts de force à Mère-Brasier ; la quatrième déclenche la phase 2.

**Zones au sol**

- **Bouches de vapeur** (Soupape hurlante, action de repaire) : un sifflement désigne la bouche au round précédent ; colonne de 1,5 m de rayon : ${jetSauvegarde("Dextérité", 14)}, ${degats("3d6", "feu")} (moitié).
- **Cône de vapeur** (Jet de vapeur, recharge 5–6) : cône de 6 m, ${jetSauvegarde("Constitution", 14)}, ${degats("4d6", "feu")}.
- **Flaques de scories** (phase 2) : chaque case qu'elle quitte ; ${reference("terrain difficile")}, ${degats("1d10", "feu")} à qui y entre ou y commence son tour.

**Phase 2 — Les chaînes cèdent (51 PV, ou la quatrième chaîne).** Utilisez sa capacité « Phase 2 — Les chaînes cèdent » (effet *Libérée de ses chaînes* : vitesse +3 m, avantage aux sauvegardes de Dextérité). Ruissellement (action légendaire) devient possible. La jauge ne monte plus.

**L'autre issue.** Si les quatre chaînes sont brisées et la chaudière détruite (CA 15, 40 PV) sans que Mère-Brasier tombe à 0, elle cesse le combat, s'élève par le puits et laisse son ${lien("objets:coeur-de-braise-captif", "Cœur de braise captif")} : le Cercle cénarien offre **+5 de réputation**. Butin sinon : ${lien("tables:butin-mere-brasier")}.` },
    { titre: "Boss 3 — Baron Nizzel Baille-Fonds", texte: `
**Salle :** Galerie effondrée (15 m sur 12), devenue la galerie du broyeur : deux tapis roulants de 3 m de large la traversent d'ouest en est, vers le broyeur à minerai (à l'est) ; à l'ouest, la fosse aux scories ; au plafond, la cheminée d'aération. Fiche : ${fiche("baron-nizzel-baille-fonds", "Baron Nizzel Baille-Fonds")} (FP 6, actions légendaires 3, résistances légendaires 2, actions de repaire à l'initiative 20).

**Zones au sol**

- **Cible verrouillée** (Salve verrouillée, recharge 5–6) : rayon de 3 m centré sur la créature visée, qui tombe à la fin du tour suivant de celle-ci : ${jetSauvegarde("Dextérité", 14)}, ${degats("6d6", "feu")} (moitié).
- **Cône de flammes** (Lance-flammes rotatif, recharge 6) : cône de 9 m, ${jetSauvegarde("Dextérité", 14)}, ${degats("5d6", "feu")} (moitié).
- **Mines sauteuses** (2 actions légendaires) : deux cases minées, visibles ; ${jetSauvegarde("Dextérité", 14)}, ${degats("3d6", "feu")} (moitié) dans un rayon de 1,5 m.
- **Tapis roulants** (action de repaire) : +3 m vers le broyeur pour qui s'y trouve ; au bout, ${jetSauvegarde("Dextérité", 14)} ou ${degats("3d10", "tranchant")} et à terre.
- **Aura du réacteur** (phase 2) : ${degats("2d6", "feu")} à qui commence son tour à 3 m ou moins.

**Phase 2 — Surcharge du réacteur (63 PV).** Utilisez sa capacité « Phase 2 — Surcharge du réacteur » (effet *Réacteur en surcharge* : +2 aux attaques au corps à corps, −2 à la CA), portez ses actions légendaires à 4 sur la fiche, inversez les tapis (vers la fosse aux scories).

**L'éjection.** À 0 PV, le baron s'éjecte avec 10 PV et file vers la cheminée (il l'atteint au bout de deux rounds). Le rattraper : ${jet("Athlétisme", 15)}, ou une attaque à distance. Capturé, il offre 500 po pour sa liberté, et son registre pour sa vie.

**Butin :** ${lien("tables:butin-baron-nizzel")} (deux tirages), et toujours le ${lien("objets:registre-du-cartel-baille-fonds", "Registre du Cartel Baille-Fonds")}.` },
    { titre: "Butin et récompenses", texte: `
**Tables de butin** (une par boss ; les objets sont rangés par qualité : commun, peu commun, rare)

- ${lien("tables:butin-grokka-deux-cles")}
- ${lien("tables:butin-mere-brasier")}
- ${lien("tables:butin-baron-nizzel")}

**L'ensemble « ${ENSEMBLE} »** : ${lien("objets:gantelets-ignifuges-du-contremaitre")} (Grokka) et ${lien("objets:lunettes-de-surete-du-contremaitre")} (le baron). L'effet de bonus d'ensemble est sur les lunettes, éteint par défaut : le joueur l'allume quand il porte les deux. Si un tirage donne une pièce que le groupe possède déjà, donnez plutôt l'autre pièce de l'ensemble : les deux pièces doivent pouvoir se réunir.

**Récompenses**

- Grizzla Tordeboulon : 150 po par personnage si la raffinerie est fermée, 100 po de plus pour le registre ; **+5** de réputation auprès du Cartel Gentepression. Si le groupe a pris le contrat « La raffinerie qui fume » à Cabestan, sa prime de 150 po s'ajoute pour le groupe, mais la réputation ne se compte qu'une fois.
- Mère-Brasier libérée plutôt que tuée : **+5** auprès du Cercle cénarien.
- Kobolds libérés et raccompagnés : la tribu des galeries voisines laisse le groupe passer chez elle.
- Baron capturé vivant et livré au Bureau de la Trêve : **+5** auprès de l'Alliance ou de la Horde, au choix du groupe.

**Suites.** Le registre mène aux acheteurs de la Lame ardente (chapitre 4 de la campagne). Le Cartel Baille-Fonds n'oublie pas : un contrat sur la tête du groupe peut apparaître dans un tableau des contrats.` }
  ]
});

export const DONJON_DOCUMENTS = [
  ...BOSS_DONJON, ...BUTIN_DONJON, ...TABLES_DONJON,
  ...collection("donjon-meche-noire", [JOURNAL_RENCONTRE, JOURNAL_MJ])
];
collection("donjon-meche-noire", [...BOSS_DONJON, ...TABLES_DONJON]);
