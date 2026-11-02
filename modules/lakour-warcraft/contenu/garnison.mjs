// Garnison de faction : six installations de bastion (objets « facility » de dnd5e 6.0.6, règles 2024 : FacilityData,
// CONFIG.DND5E.facilities : type special, sous-type, ordre, taille, niveau, employés), thématisées pour un avant-poste de
// la Horde, de l'Alliance ou du Cartel dans les Tarides. dnd5e gère l'onglet Bastion du personnage, les ordres et les tours
// de bastion (réglage « Bastions » du système, à activer) ; ce module fournit les installations, la table « Missions des
// suivants » pour l'ordre de recrutement de la salle des cartes, et le journal visible « Garnison de faction ».
// Textes originaux.
import { MODULE, STATS, ajouterPages, collection, html, icone, identifiant, journal, ref, table } from "./aides.mjs";
import { GUIDES, liens } from "./guides.mjs";
import { OBJETS } from "./objets-azeroth.mjs";
import { CONSOMMABLES } from "./consommables.mjs";
import { BUTIN_DONJON } from "./donjon.mjs";
import { COMPOSANTS, PRODUITS } from "./metiers.mjs";

// CONFIG.DND5E.facilities (dnd5e 6.0.6) : sous-types spéciaux, ordres et tailles employés ici.
// Règles 2024 des installations spéciales employées ici : niveau d'accès, taille et ordre de chaque sous-type.
export const REGLES_2024 = {
  workshop: { niveau: 5, taille: "roomy", ordre: "craft" }, smithy: { niveau: 5, taille: "roomy", ordre: "craft" },
  sanctuary: { niveau: 5, taille: "roomy", ordre: "craft" }, barrack: { niveau: 5, taille: "roomy", ordre: "recruit" },
  greenhouse: { niveau: 9, taille: "roomy", ordre: "harvest" }, stable: { niveau: 9, taille: "roomy", ordre: "trade" }
};
export const SOUS_TYPES = Object.keys(REGLES_2024);
export const ORDRES = ["craft", "harvest", "recruit", "trade", "empower", "research"];
export const TAILLES = ["cramped", "roomy", "vast"];
const SOURCE = { custom: "La Kour Warcraft", rules: "2024", revision: 1, book: "", page: "", license: "" };

// d = { cle, nom, img, texte, sousType, ordre, taille, niveau, employes, defenseurs, creatures, fabrique (« objets:… ») }
function installation(d) {
  const ou = `objets:${d.cle}`;
  if (!SOUS_TYPES.includes(d.sousType)) throw new Error(`${ou} : sous-type « ${d.sousType} » hors de CONFIG.DND5E.facilities`);
  if (!ORDRES.includes(d.ordre)) throw new Error(`${ou} : ordre « ${d.ordre} » inconnu`);
  if (!TAILLES.includes(d.taille)) throw new Error(`${ou} : taille « ${d.taille} » inconnue`);
  if (![5, 9, 13, 17].includes(d.niveau)) throw new Error(`${ou} : niveau ${d.niveau} (5, 9, 13 ou 17)`);
  const regle = REGLES_2024[d.sousType];
  if (regle.niveau !== d.niveau || regle.taille !== d.taille || regle.ordre !== d.ordre) throw new Error(`${ou} : ${d.sousType} est de niveau ${regle.niveau}, ${regle.taille}, ordre ${regle.ordre}`);
  const _id = identifiant(ou);
  return {
    __pack: "objets", __cle: ou, _id, _key: `!items!${_id}`, name: d.nom, type: "facility", img: icone(d.img),
    system: {
      description: { value: html(d.texte), chat: "" }, identifier: d.cle, source: SOURCE, activities: {},
      building: { built: true, size: d.taille },
      craft: { item: d.fabrique ? { __ref: d.fabrique, __uuid: true } : null, quantity: 1 },
      defenders: { value: [], max: d.defenseurs ?? null },
      disabled: false, enlargeable: false, free: false,
      hirelings: { value: [], max: d.employes },
      level: d.niveau, order: d.ordre,
      progress: { value: 0, max: null, order: "", paid: false },
      size: d.taille,
      trade: {
        creatures: { value: [], max: d.creatures ?? null },
        pending: { creatures: [], operation: null, stocked: false, value: null },
        profit: null, stock: { stocked: false, value: null, max: null }
      },
      type: { value: "special", subtype: d.sousType }
    },
    effects: [], folder: null, sort: 0, ownership: { default: 0 }, flags: { [MODULE]: { cle: d.cle } }, _stats: STATS
  };
}

const TOUS = [...OBJETS, ...CONSOMMABLES, ...BUTIN_DONJON, ...COMPOSANTS, ...PRODUITS];
const lien = liens(TOUS);

// Coût de l'ordre « fabriquer » d'un objet ordinaire, comme dnd5e 6.0.6 le calcule (Item#system.getCraftCost,
// CONFIG.DND5E.crafting.mundane : un jour par tranche de 10 po du prix, arrondi au supérieur ; la moitié du prix en po,
// arrondie à l'inférieur). Un objet magique suit un autre barème, que dnd5e calcule lui-même.
const TAUX = { pp: 10, gp: 1, ep: 0.5, sp: 0.1, cp: 0.01 };
export function coutCommande(o) {
  const po = (o.system.price?.value ?? 0) * (TAUX[o.system.price?.denomination] ?? 1);
  return { jours: Math.ceil(po * 0.1), po: Math.floor(po * 0.5) };
}
const commande = cle => {
  const o = TOUS.find(d => d.__cle === cle);
  const { jours, po } = coutCommande(o);
  return `${lien(cle)} : ${po} po et ${jours} jour${jours > 1 ? "s" : ""}`;
};
const BAREME = "dnd5e calcule le coût et le délai de l'ordre selon l'objet choisi (pour un objet ordinaire : la moitié de son prix en po, et un jour par tranche de 10 po de prix ; pour un objet magique, son propre barème) ; pas de test, pas de recette à suivre";

export const INSTALLATIONS = collection("garnison", [
  installation({
    cle: "atelier-gobelin", nom: "Atelier gobelin", img: "magic/symbols/cog-orange-red", sousType: "workshop", ordre: "craft", taille: "roomy", niveau: 5, employes: 3,
    fabrique: "objets:bombe-gobeline",
    texte: `Un hangar de tôle où trois apprentis gobelins (ou gnomes, selon la bannière) soudent, vissent et font sauter ce qu'ils ont soudé. **Ordre : fabriquer.** L'atelier produit un objet d'ingénierie ; ${BAREME}. Par exemple ${commande("objets:bombe-gobeline")}, ${commande("objets:casque-de-mineur-a-lanterne")}.`
  }),
  installation({
    cle: "forge-de-garnison", nom: "Forge de garnison", img: "tools/smithing/anvil", sousType: "smithy", ordre: "craft", taille: "roomy", niveau: 5, employes: 2,
    fabrique: "objets:epee-de-la-garde",
    texte: `Une forge de pierre et un soufflet de cuir de kodo, tenus par deux forgerons de la faction. **Ordre : fabriquer.** Elle forge une arme, une armure ou un outil ordinaire ; ${BAREME}. Par exemple ${commande("objets:epee-de-la-garde")}, ${commande("objets:harnois-de-grunt")}, ${commande("objets:pierre-a-aiguiser-de-rouge-veine")}.`
  }),
  installation({
    cle: "jardin-d-herboriste", nom: "Jardin d'herboriste", img: "magic/nature/plant-bamboo-green", sousType: "greenhouse", ordre: "harvest", taille: "roomy", niveau: 9, employes: 1,
    texte: `Des plates-bandes irriguées par une source, à l'abri d'une palissade. **Ordre : récolter.** En un tour de bastion, le jardinier rapporte 1d4 + 2 ${lien("objets:herbe-a-fievre")} et 1d4 ${lien("objets:lys-des-oasis")} ; un jardin bien gardé donne en plus une ${lien("objets:mousse-d-aprefange")} par tour.`
  }),
  installation({
    cle: "enclos-a-montures", nom: "Enclos à montures", img: "commodities/leather/fur-pelt-spotted-tan", sousType: "stable", ordre: "trade", taille: "roomy", niveau: 9, employes: 1, creatures: 3,
    texte: "Une palissade, un abreuvoir et des stalles pour trois montures (loups, kodos, béliers, raptors ou hippogriffes selon la faction). **Ordre : commercer.** En un tour de bastion, le palefrenier achète ou vend une monture au prix de l'éleveur, moins la remise de réputation de la faction. Les montures de l'enclos sont nourries et soignées : elles ne perdent pas de points de vie pendant l'absence du groupe."
  }),
  installation({
    cle: "table-des-missions", nom: "Table des missions des suivants", img: "tools/navigation/map-marked-brown", sousType: "barrack", ordre: "recruit", taille: "roomy", niveau: 5, employes: 1, defenseurs: 12,
    texte: "Une grande table couverte d'une carte des Tarides, de pions de bois et de rapports griffonnés. C'est la caserne de la garnison : un officier y loge les suivants et les envoie en mission. **Ordre : recruter.** En un tour de bastion, la table recrute des défenseurs (douze au plus), ou envoie un suivant en mission : tirez sur la table « Missions des suivants » pour son résultat. Un suivant blessé en mission ne repart pas avant deux tours."
  }),
  installation({
    cle: "autel-des-esprits", nom: "Autel des esprits", img: "commodities/treasure/trinket-totem-bone-green", sousType: "sanctuary", ordre: "craft", taille: "roomy", niveau: 5, employes: 1,
    fabrique: "objets:potion-de-soins",
    texte: `Un cercle de pierres levées, un totem et un feu qui ne s'éteint jamais, veillé par un chaman, un prêtre ou une prêtresse d'Élune. **Ordre : fabriquer.** L'autel prépare une ${lien("objets:potion-de-soins")} ; ${BAREME}. Tant que l'autel est entretenu, un personnage de la garnison qui y finit un repos long perd **un niveau d'Épuisement de plus** que ne le prévoit le repos.`
  })
]);

// Table des missions (ordre « recruter » de la table des missions).
export const TABLE_MISSIONS = table({
  cle: "missions-des-suivants", nom: "Missions des suivants", formule: "1d8",
  description: "Pour un suivant envoyé en mission par la table des missions (un tour de bastion). Ajoutez 1 au jet si la garnison est Honorée ou mieux auprès de sa faction.",
  resultats: [
    [1, 1, { titre: "Embuscade", texte: "Le suivant revient blessé et sans rien. Il ne repart pas avant deux tours." }],
    [2, 2, { titre: "Fausse piste", texte: "Rien trouvé, mais le suivant rapporte une rumeur : tirez sur la table des rumeurs de taverne." }],
    [3, 4, { titre: "Ravitaillement", texte: "Le suivant rapporte 2d6 composants communs du biome le plus proche (table de récolte du biome)." }],
    [5, 5, { titre: "Escorte payée", texte: "Le suivant a escorté une caravane : 3d10 po pour la garnison." }],
    [6, 6, { titre: "Service rendu", texte: "Le suivant a aidé une patrouille de la faction : +2 de réputation auprès d'elle." }],
    [7, 7, { titre: "Trouvaille", texte: "Le suivant rapporte une pépite d'argent (ou, si la garnison est près d'Âprefange, une mousse d'Âprefange) et 2d6 po." }],
    [8, 9, { titre: "Exploit", texte: "Le suivant a vu un rare de la région : la garnison sait où il se trouve (tirez sur la table des rares de la zone ; un contrat de traque l'attend au tableau). +3 de réputation." }]
  ]
});

const lienGarnison = liens(INSTALLATIONS, [TABLE_MISSIONS]);

export const JOURNAL_GARNISON = journal({
  cle: "garnison-de-faction", nom: "Garnison de faction", visible: true, pages: [
    { titre: "La garnison", texte: `
Quand un groupe a assez servi une faction (en général au niveau 5, ou après le sommet de Gué-de-Sel), elle lui confie un **avant-poste** dans les Tarides : une tour de guet de la Horde, un fortin de l'Alliance ou un entrepôt du Cartel. C'est la **garnison** du groupe.

**Avec dnd5e.** La garnison est un **bastion** au sens des règles de 2024 : chaque personnage de niveau 5 ou plus y possède des **installations** (onglet Bastion de sa fiche), qu'il fait glisser depuis le compendium des objets. Le MJ active les bastions dans les réglages du système (« Bastions »). Tous les **7 jours de jeu**, un **tour de bastion** a lieu : chaque installation exécute l'**ordre** qu'on lui a donné (fabriquer, récolter, recruter, commercer), et dnd5e en tient le compte.

**Combien d'installations.** Deux au niveau 5, quatre au niveau 9, cinq au niveau 13, six au niveau 17 (règle de dnd5e). Une installation ne peut être choisie qu'à partir de son niveau.

**Ordres hebdomadaires sans les bastions de dnd5e.** Si le MJ préfère ne pas les activer, chaque joueur donne chaque semaine de jeu un ordre à chacune de ses installations, et le MJ applique le résultat écrit dans la description de l'installation.` },
    { titre: "Installations", texte: `
${INSTALLATIONS.map(i => `- ${lienGarnison(i.__cle)} — niveau ${i.system.level}, ordre « ${{ craft: "fabriquer", harvest: "récolter", recruit: "recruter", trade: "commercer" }[i.system.order]} », ${i.system.hirelings.max} employé(s).`).join("\n")}

Les ordres de fabrication ne suivent pas les recettes d'artisanat : dnd5e en calcule le coût et le délai d'après l'objet choisi, sans test. La table des missions utilise ${lienGarnison("tables:missions-des-suivants")}.` },
    { titre: "Faction et réputation", texte: `
La garnison porte la bannière d'une faction : ses employés en viennent, et elle en reçoit des visites.

- Une garnison dont le groupe est **Honoré** ou mieux auprès de sa faction reçoit chaque mois un convoi gratuit (2d6 composants communs ou 50 po, au choix du MJ).
- **Inamical** ou pire : les employés partent un à un (un par tour de bastion), jusqu'à ce que la réputation remonte.
- Un ennemi juré de la faction (le Cartel Baille-Fonds, la Lame ardente, une bande kolkar) peut **attaquer** la garnison : les défenseurs recrutés par la table des missions la protègent.` }
  ]
});

const lienMJ = liens(INSTALLATIONS, [TABLE_MISSIONS, JOURNAL_GARNISON]);
ajouterPages(GUIDES.find(g => g.flags[MODULE].cle === "guide-du-mj"), [{
  titre: "Garnison de faction (MJ)", texte: `
Le journal ${lienMJ("journaux:garnison-de-faction")} explique la garnison aux joueurs. Côté MJ :

- **Activer les bastions** : réglages de dnd5e, « Bastions », puis le bouton de tour de bastion apparaît pour le MJ ; dnd5e fait avancer les ordres d'un tour tous les 7 jours de jeu.
- **Installations** : ${INSTALLATIONS.map(i => lienMJ(i.__cle)).join(", ")}.
- **Missions des suivants** : ${lienMJ("tables:missions-des-suivants")}, à tirer quand la table des missions reçoit l'ordre de recruter.
- **Attaque de la garnison** : une fois par mois de jeu, si un ennemi a des raisons d'en vouloir au groupe, lancez 1d6 par défenseur ; chaque 1 est un défenseur perdu. Sans défenseur, une installation (au hasard) est mise hors d'usage jusqu'à réparation (ordre « réparer » de dnd5e).` }]);

export const GARNISON_DOCUMENTS = [...INSTALLATIONS, ...collection("garnison", [TABLE_MISSIONS, JOURNAL_GARNISON])];
