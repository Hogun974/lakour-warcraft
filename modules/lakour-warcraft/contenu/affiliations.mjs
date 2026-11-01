// Affiliations d'Azeroth : l'équivalent Warcraft du patronage de La Kour 40k. Chaque affiliation est un don (feat)
// qu'on obtient par le jeu, jamais en échange d'un don de niveau : le MJ l'accorde quand un personnage s'engage
// auprès d'un ordre. Elle dit ce que l'ordre exige (devoir), ce qu'il offre à chaque rang (faveur, rangs 1 à 3, rang
// courant dans flags.lakour-warcraft.rang), un avantage mécanique modeste (effet actif permanent ou activité une fois
// par repos long) et la réputation qu'on traîne avec soi. S'y ajoutent les atouts et handicaps de faction.
// Forme dnd5e 6.0.6 : FeatData (type.value "feat", sans sous-type : ni don d'origine, ni don général), activités
// et effets construits par contenu/sorts.mjs. Pack « dons », clés « dons:affiliation-… » (aucune collision possible
// avec les dons de dons.mjs). Textes originaux.
import { MODULE, STATS, identifiant, html, icone } from "./aides.mjs";
import { exiger } from "./objets.mjs";
import { FACTIONS } from "./peuples.mjs";
import { activite, effet, cibleDe, SOURCE, PERIODES } from "./sorts.mjs";

export const CATEGORIES = { affiliation: "Affiliation", atout: "Atout de faction", handicap: "Handicap de faction" };

// ---------- Constructeur
// d = { cle, nom, categorie, faction (clé de FACTIONS), organisation, texte, img, utilisations: { max, periode },
//       effets: [{ nom, changements, texte }] (transférés à l'acteur), activites }
export function donDeFaction(d) {
  const ou = `dons:affiliation-${d.cle}`;
  exiger(/^[a-z0-9-]+$/.test(d.cle ?? ""), `clé invalide : « ${d.cle} »`);
  exiger(d.nom && d.img && d.texte, `${ou} : nom, image ou texte manquant`);
  exiger(CATEGORIES[d.categorie], `${ou} : catégorie « ${d.categorie} » inconnue`);
  exiger(Object.keys(FACTIONS).includes(d.faction), `${ou} : faction « ${d.faction} » inconnue (${Object.keys(FACTIONS).join(", ")})`);
  if (d.utilisations) exiger(PERIODES.includes(d.utilisations.periode), `${ou} : période « ${d.utilisations.periode} » inconnue de dnd5e`);
  const _id = identifiant(ou);
  const effets = (d.effets ?? []).map((e, i) => effet(ou, _id, i, e, d.img, ou, { transfert: true, magique: false }));
  const doc = {
    sort: false, estSort: false, concentration: false,
    activation: { type: "action", value: null, condition: "" }, duration: { value: "", units: "inst" },
    range: { value: "", units: "self" }, target: cibleDe(["", "self"], null, "self", ou)
  };
  const activites = Object.fromEntries((d.activites ?? []).map((a, i) => {
    const act = activite(ou, i, { utilisations: Boolean(d.utilisations), ...a }, effets.map(e => e._id), doc, ou);
    return [act._id, act];
  }));
  const identifier = `affiliation-${d.cle}`;
  return {
    __pack: "dons", __cle: ou,
    _id, _key: `!items!${_id}`, name: d.nom, type: "feat", img: d.img,
    system: {
      description: { value: html(d.texte), chat: "" }, source: SOURCE, identifier,
      activities: activites,
      uses: d.utilisations
        ? { max: String(d.utilisations.max), spent: 0, recovery: [{ period: d.utilisations.periode, type: "recoverAll", formula: "" }] }
        : { max: "", spent: 0, recovery: [] },
      advancement: {}, type: { value: "feat", subtype: "" }, cover: null, crewed: false,
      enchant: { max: "", period: "" }, prerequisites: { items: [], level: null, repeatable: false }, properties: [],
      requirements: `${CATEGORIES[d.categorie]}${d.organisation ? ` — ${d.organisation}` : ""}`
    },
    effects: effets, folder: null, sort: d.ordre ?? 0, ownership: { default: 0 },
    flags: { [MODULE]: { cle: identifier, categorie: d.categorie, faction: d.faction, ...(d.categorie === "affiliation" ? { organisation: d.organisation, rang: 1 } : {}) } },
    _stats: STATS
  };
}

// Texte d'une affiliation : devoir, faveurs par rang, avantage, réputation, montée en rang.
const RANGS = "**Monter en rang.** Le MJ accorde le rang suivant après une mission d'importance accomplie pour l'ordre, ou au bout de quelques aventures de service loyal ; il le note dans le don (rang 1 à 3). Manquer gravement au devoir fait perdre un rang, ou l'affiliation entière.";
const texteAffiliation = ({ presentation, devoir, rangs, avantage, reputation }) => [
  presentation,
  `**Devoir.** ${devoir}`,
  `**Faveur par rang.**`,
  rangs.map(([nom, faveur], i) => `- **Rang ${i + 1} — ${nom}.** ${faveur}`).join("\n"),
  `**Avantage.** ${avantage}`,
  `**Réputation.** ${reputation}`,
  RANGS
].join("\n\n");

const UNE_PAR_REPOS_LONG = { max: 1, periode: "lr" };
const affiliation = (cle, nom, organisation, faction, img, contenu, d = {}) =>
  donDeFaction({ cle, nom, organisation, faction, img, categorie: "affiliation", texte: texteAffiliation(contenu), ...d });

// ---------------------------------------------------------------- Affiliations
export const AFFILIATIONS_ORDRES = [
  affiliation("kirin-tor", "Affiliation : Kirin Tor", "Kirin Tor", "neutre", icone("magic/symbols/runes-star-magenta"), {
    presentation: "Les mages de Dalaran ont perdu leur cité volante sous les coups du Fléau et de la Légion, mais pas leur orgueil. Dispersés entre Theramore, Hurlevent et des tours cachées, ils recrutent quiconque sait tenir une langue et un grimoire — y compris, en théorie, dans la Horde.",
    devoir: "Remettre au Kirin Tor tout artefact magique d'importance et signaler toute trace de gangrène ou de nécromancie. Ne jamais enseigner l'arcane sans autorisation. Ne jamais lever la main contre un mage de l'ordre.",
    rangs: [
      ["Apprenti de la Violette", "Accès aux bibliothèques de secours de Theramore et à la chambre d'un mage ami dans chaque grande ville ; copier un sort de magicien vous coûte moitié moins cher."],
      ["Magus", "On vous confie une pierre de portail : une fois par aventure, un mage vous ramène par portail. Si vous êtes magicien, *Portail du Kirin Tor* s'ajoute à votre grimoire quand vous pouvez le lancer."],
      ["Membre de l'Assemblée", "Vous siégez, sans voix, aux réunions de l'Assemblée. Une fois par campagne, un archimage intervient en personne pour une requête d'importance."]
    ],
    avantage: "*Formation de la Violette* : vous avez l'avantage aux tests d'Intelligence (Arcanes).",
    reputation: "Le Kirin Tor surveille les siens : un sort interdit, une Métamorphose lancée sur un dignitaire ou un artefact vendu se savent en une semaine. Les Réprouvés et nombre d'orcs n'ont pas oublié que Dalaran a dressé les camps d'internement."
  }, { effets: [{ nom: "Formation de la Violette", changements: [["system.skills.arc.roll.mode", 1]], texte: "Avantage aux tests d'Intelligence (Arcanes)." }] }),

  affiliation("cartel-gentepression", "Affiliation : Cartel Gentepression", "Cartel Gentepression", "neutre", icone("containers/bags/coinpouch-gold-red.webp"), {
    presentation: "Le Cartel Gentepression tient les ports neutres de Kalimdor et des Mers du Sud : Cabestan, Gadgetzan, Baie-du-Butin. Ses gobelins vendent à tout le monde et ne combattent que pour leurs contrats. Y entrer, c'est signer un contrat ; en sortir, c'est payer.",
    devoir: "Respecter la trêve des ports du Cartel : aucun combat dans leurs murs, quels que soient vos ennemis. Verser au Cartel un dixième de ce que vous gagnez dans ses ports. Tenir parole sur tout contrat signé.",
    rangs: [
      ["Associé", "Lit, entrepôt et écurie à prix d'ami dans les ports du Cartel ; un marchand vous prévient des arrivages intéressants."],
      ["Partenaire", "Passage gratuit sur les navires et zeppelins du Cartel ; on vous rachète le butin à 60 % de sa valeur au lieu de la moitié."],
      ["Actionnaire", "Une part dans une affaire : 50 po par mois de rente, et un baron du Cartel vous doit une faveur."]
    ],
    avantage: "*Ardoise du Cartel* : une fois par repos long, dans un port ou un comptoir du Cartel, vous obtenez à crédit un objet ou un service d'une valeur maximale de **25 po × votre bonus de maîtrise**, à rembourser dans le mois avec un dixième d'intérêt.",
    reputation: "Le Cartel Baille-Fonds, rival de Gentepression, et les pirates des Mers du Sud vous connaissent. Une dette impayée devient une prime, et une prime finit toujours par trouver preneur."
  }, {
    utilisations: UNE_PAR_REPOS_LONG,
    activites: [{ type: "utility", nom: "Ardoise du Cartel", activation: ["special"], condition: "Dans un port ou un comptoir du Cartel", jet: { nom: "Crédit accordé (po)", formule: "25 * @prof" } }]
  }),

  affiliation("cercle-cenarien", "Affiliation : Cercle cénarien", "Cercle cénarien", "neutre", icone("magic/nature/leaf-flower-wreath-glow-green-blue.webp"), {
    presentation: "Fondé par les druides elfes de la nuit au nom du demi-dieu Cénarius, le Cercle cénarien accueille aujourd'hui des druides taurens et quelques chamans. Il veille sur les bosquets sacrés et sur la frontière fragile entre Azeroth et le Rêve d'émeraude, depuis le refuge de Reflet-de-Lune.",
    devoir: "Protéger les bosquets sacrés et les créatures du Rêve. Signaler toute corruption de la nature (gangrène, peste, satyres). Ne jamais abattre un arbre vivant sans le rite de demande.",
    rangs: [
      ["Gardien des bois", "Abri et soins dans les refuges cénariens ; les dryades et les esprits sylvestres vous laissent passer."],
      ["Druide-éclaireur", "Une chouette messagère du Cercle vous trouve où que vous soyez. Si vous lancez des sorts, *Sève de jouvence* et *Sarments du Rêve* comptent comme des sorts de votre liste."],
      ["Voix du Cercle", "Un archidruide écoute vos requêtes ; une fois par campagne, un Ancien de la forêt se déplace pour vous."]
    ],
    avantage: "*Veillée sous les Anciens* : une fois par repos long, à la fin d'un repos court pris en pleine nature, jusqu'à six créatures de votre choix qui se sont reposées avec vous récupèrent chacune **1d6 + votre bonus de maîtrise** points de vie.",
    reputation: "Les bûcherons de la Horde en Orneval et les mineurs de toutes les factions voient en vous un empêcheur de travailler. Certains druides vous jugent trop jeune pour parler au nom du Cercle."
  }, {
    utilisations: UNE_PAR_REPOS_LONG,
    activites: [{ type: "heal", nom: "Veillée sous les Anciens", activation: ["special"], condition: "À la fin d'un repos court pris en pleine nature",
      portee: [9, "m"], cible: ["6", "ally"], soin: { des: "1d6", bonus: "@prof" } }]
  }),

  affiliation("main-d-argent", "Affiliation : Chevaliers de la Main d'argent", "Ordre de la Main d'argent", "alliance", icone("equipment/hand/gauntlet-plate-steel-gold.webp"), {
    presentation: "Le premier ordre de paladins de Lordaeron a été dissous par son roi, et son fondateur est mort de la main d'Arthas. Pourtant ses chevaliers survivent : dans les abbayes, sur les routes des réfugiés, au service de ceux qui n'ont plus personne. Ils portent encore l'insigne, et ils attendent qu'on les rappelle.",
    devoir: "Protéger les innocents, quelle que soit leur faction. Combattre le Fléau. Ne jamais frapper un ennemi qui se rend. Obéir aux anciens de l'ordre quand ils appellent.",
    rangs: [
      ["Écuyer", "Hospitalité des chapelles et des abbayes de l'Alliance ; un ancien chevalier vous forme et vous conseille."],
      ["Chevalier", "Vous portez l'insigne de la Main ; les miliciens et les gardes de l'Alliance vous écoutent, et un destrier de l'ordre vous est prêté."],
      ["Seigneur paladin", "Deux écuyers vous suivent (PNJ de niveau 1) et vous avez voix dans les conseils de guerre de l'Alliance."]
    ],
    avantage: "*Serment partagé* : une fois par repos long, quand un allié que vous voyez à 9 m ou moins rate un jet de sauvegarde, vous pouvez utiliser votre **réaction** pour lui faire relancer le dé ; il doit garder le nouveau résultat.",
    reputation: "Depuis Stratholme, certains accusent l'ordre d'avoir formé Arthas. La Croisade écarlate vous juge tiède, et les Réprouvés reconnaissent l'insigne de loin."
  }, {
    utilisations: UNE_PAR_REPOS_LONG,
    activites: [{ type: "utility", nom: "Serment partagé", activation: ["reaction"], condition: "Un allié à 9 m ou moins rate un jet de sauvegarde", portee: [9, "m"], cible: ["1", "ally"] }]
  }),

  affiliation("aube-d-argent", "Affiliation : Aube d'argent", "Aube d'argent", "neutre", icone("magic/time/day-night-sunset-sunrise.webp"), {
    presentation: "Née des cendres de la Troisième Guerre, l'Aube d'argent n'a qu'un ennemi : le Fléau. Paladins sans ordre, prêtres, chasseurs, et même quelques orcs et Réprouvés y servent côte à côte, ce qui scandalise à peu près tout le monde. Ses bastions tiennent les Maleterres de l'Ouest et de l'Est.",
    devoir: "Combattre le Fléau partout, sans regarder la faction de qui se bat à vos côtés. Rapporter les foyers de peste. Remettre à l'Aube les pierres du Fléau prises sur les morts-vivants.",
    rangs: [
      ["Initié", "Soins et ravitaillement dans les bastions de l'Aube ; on échange vos pierres du Fléau contre des fioles d'eau bénite."],
      ["Gardien", "Potions de soins au prix coûtant ; un prêtre de l'Aube lève gratuitement une maladie ou une malédiction par aventure."],
      ["Champion", "Vous commandez une patrouille de l'Aube (quatre gardes) le temps d'une mission, et vos rapports remontent jusqu'aux chefs des deux factions."]
    ],
    avantage: "*Frappe de l'Aube* : une fois par repos long, quand vous touchez un mort-vivant avec une attaque, il subit **2d6** dégâts radiants supplémentaires.",
    reputation: "Les deux factions vous soupçonnent de pactiser avec l'autre. Les Réprouvés de Sylvanas sont des morts-vivants : l'Aube les tolère, eux vous tolèrent, et personne n'est dupe."
  }, {
    utilisations: UNE_PAR_REPOS_LONG,
    activites: [{ type: "damage", nom: "Frappe de l'Aube", activation: ["special"], condition: "Vous touchez un mort-vivant avec une attaque",
      portee: [1.5, "m"], cible: ["1", "enemy"], degats: [{ des: "2d6", types: ["radiant"] }] }]
  }),

  affiliation("kor-kron", "Affiliation : Garde kor'kron", "Kor'kron", "horde", icone("creatures/abilities/wolf-howl-moon-purple"), {
    presentation: "Les Kor'kron sont la garde d'élite du chef de guerre. Ils veillent sur Orgrimmar, escortent les émissaires et règlent en silence les affaires que la Horde préfère ne pas voir. On n'y entre que sur recommandation d'un vétéran, et on n'en sort guère.",
    devoir: "Servir le chef de guerre et protéger les dirigeants de la Horde. Garder secret ce que vous voyez et entendez au fort de Grommash. Exécuter un ordre avant de le discuter.",
    rangs: [
      ["Recrue de la garde", "Logement à la caserne d'Orgrimmar ; les grunts vous saluent et les marchands de la ville vous font crédit."],
      ["Garde kor'kron", "Armure aux couleurs de la garde, loup de guerre fourni ; vous pouvez arrêter n'importe qui dans Orgrimmar."],
      ["Capitaine kor'kron", "Vous commandez une escouade de quatre gardes et vous avez accès au chef de guerre pour les affaires de sécurité."]
    ],
    avantage: "*Vigilance kor'kron* : vous ajoutez **1d4** à vos jets d'initiative.",
    reputation: "L'Alliance voit en vous un tueur de la Horde ; les orcs nostalgiques du sang démoniaque, eux, vous méprisent comme le chien de Thrall. Les Kor'kron ont une réputation de brutes : on vous craint plus qu'on ne vous aime."
  }, { effets: [{ nom: "Vigilance kor'kron", changements: [["system.attributes.init.roll.bonus", "1d4"]], texte: "+1d4 aux jets d'initiative." }] }),

  affiliation("sentinelles", "Affiliation : Sentinelles", "Sentinelles", "alliance", icone("magic/nature/symbol-moon-stars-white.webp"), {
    presentation: "L'armée des elfes de la nuit, presque entièrement composée de femmes, garde les forêts de Kalimdor depuis dix mille ans. Ses éclaireuses montent des sabres-de-nuit et parlent par cris de chouette. Elles acceptent quelques étrangers, à l'essai, pour le temps qu'il faudra.",
    devoir: "Défendre l'Orneval et les forêts de Kalimdor contre les bûcherons, les démons et les satyres. Ne jamais révéler les sentiers des Sentinelles. Rendre compte à votre capitaine.",
    rangs: [
      ["Éclaireur", "Accès aux postes de garde de l'Orneval ; les chouettes des Sentinelles portent vos messages."],
      ["Sentinelle", "Un sabre-de-nuit vous est confié, et vous connaissez les sentiers cachés : vos voyages en forêt prennent deux fois moins de temps."],
      ["Capitaine", "Vous commandez un poste de garde et une escouade de cinq Sentinelles, et la générale lit vos rapports."]
    ],
    avantage: "*Œil de la Sentinelle* : vous ajoutez **1d4** à vos tests de Sagesse (Perception).",
    reputation: "Les orcs qui coupent du bois en Orneval ont des comptes à régler avec quiconque porte l'insigne. Les hauts-elfes et les elfes de sang vous rappellent l'Exil, à mots couverts."
  }, { effets: [{ nom: "Œil de la Sentinelle", changements: [["system.skills.prc.roll.bonus", "1d4"]], texte: "+1d4 aux tests de Sagesse (Perception)." }] }),

  affiliation("ligue-des-explorateurs", "Affiliation : Ligue des explorateurs", "Ligue des explorateurs", "alliance", icone("commodities/currency/coin-inset-compass-silver"), {
    presentation: "Fondée par les nains de Forgefer pour percer le mystère de leurs origines titanesques, la Ligue des explorateurs envoie archéologues, cartographes et têtes brûlées dans toutes les ruines du monde. Elle accepte n'importe qui, pourvu qu'il rapporte des notes lisibles.",
    devoir: "Rapporter au Hall des explorateurs de Forgefer vos cartes, découvertes et artefacts. Ne jamais vendre une relique titanesque. Tenir à jour votre carnet de terrain.",
    rangs: [
      ["Membre correspondant", "Accès aux archives du Hall des explorateurs ; on vous prête une longue-vue et une pelle de qualité."],
      ["Explorateur", "Matériel d'expédition prêté (tente, cordes, lanternes, outils), et un guide nain pour une aventure en ruines."],
      ["Explorateur émérite", "La Ligue finance une expédition de votre choix (jusqu'à 500 po), et votre nom figure dans le registre du Hall."]
    ],
    avantage: "*Carnet de la Ligue* : une fois par repos long, après avoir vu le résultat d'un de vos tests d'Intelligence (Histoire ou Investigation), ou d'un test pour désamorcer un piège dans des ruines, vous ajoutez **1d6** au résultat.",
    reputation: "Les pilleurs de tombes et les marchands du Cartel voient en vous un concurrent. Les troggs, les gardiens titanesques et les ruines elles-mêmes ne font aucune différence entre un savant et un voleur."
  }, {
    utilisations: UNE_PAR_REPOS_LONG,
    activites: [{ type: "utility", nom: "Carnet de la Ligue", activation: ["special"], condition: "Après un test d'Histoire, d'Investigation ou de désamorçage en ruines", jet: { nom: "Bonus du carnet", formule: "1d6" } }]
  })
];

// ---------------------------------------------------------------- Atouts et handicaps de faction
const atout = (cle, nom, faction, img, texte, d = {}) => donDeFaction({ cle: `atout-${cle}`, nom, faction, img, texte, categorie: "atout", ...d });
const handicap = (cle, nom, faction, img, texte, d = {}) => donDeFaction({ cle: `handicap-${cle}`, nom, faction, img, texte, categorie: "handicap", ...d });

export const ATOUTS_HANDICAPS = [
  atout("pierre-de-foyer", "Pierre de foyer", "neutre", icone("commodities/stone/engraved-symbol-water-grey"),
    "Une pierre lisse gravée d'une rune, accordée à une auberge où l'on vous connaît. Une fois par repos long, vous pouvez la tenir et vous concentrer pendant **10 minutes** : à la fin, vous êtes transporté avec ce que vous portez dans la salle commune de cette auberge. Subir des dégâts pendant les 10 minutes interrompt le transfert sans dépenser l'utilisation.\n\nChanger d'auberge demande une nuit sur place et la bénédiction de l'aubergiste (souvent payante).",
    { utilisations: UNE_PAR_REPOS_LONG, activites: [{ type: "utility", nom: "Rentrer à l'auberge", activation: ["minute", 10] }] }),
  atout("brevet-de-vol", "Brevet de vol", "neutre", icone("magic/control/buff-flight-wings-blue"),
    "Les maîtres de vol de votre faction (griffons de l'Alliance, coursiers des vents de la Horde, hippogriffes des elfes de la nuit) vous connaissent et vous font voler gratuitement entre deux relais déjà visités. Un trajet d'une semaine à pied se fait en une journée.\n\nLe brevet ne vaut rien chez l'autre faction, et un maître de vol qui apprend que vous avez trahi les siens le déchire devant vous."),
  atout("tabard-de-heraut", "Tabard de héraut", "neutre", icone("environment/settlement/tent-flag"),
    "Vous portez le tabard d'une cité ou d'un ordre, et ceux qui le respectent vous traitent en envoyé. Une fois par repos long, vous avez l'**avantage** à un test de Charisme fait auprès de membres de cette cité ou de cet ordre.\n\nPorté en territoire hostile, le tabard fait de vous une cible de choix.",
    { utilisations: UNE_PAR_REPOS_LONG, activites: [{ type: "utility", nom: "Parler au nom du tabard", activation: ["special"], condition: "Un test de Charisme auprès des membres de votre cité ou de votre ordre" }] }),
  handicap("tete-mise-a-prix", "Tête mise à prix", "neutre", icone("skills/social/diplomacy-writing-letter"),
    "Quelqu'un paie pour vous voir mort, ou ramené vivant : un baron gobelin, un capitaine écarlate, un chef de clan. La prime vaut **100 po par niveau** de personnage. Dans chaque ville d'une certaine taille, le MJ tire un d6 : sur 1, un chasseur de primes vous a trouvé.\n\nLa prime tombe si vous payez le commanditaire, s'il meurt, ou si vous prouvez votre innocence — ce qui fait souvent une bonne aventure."),
  handicap("dette-envers-le-cartel", "Dette envers le Cartel", "neutre", icone("commodities/currency/coins-assorted-mix-copper"),
    "Vous devez **300 po** à un comptoir du Cartel Gentepression, intérêts compris. À chaque aventure sans remboursement, la dette grossit d'un dixième et les méthodes de recouvrement se durcissent : d'abord des lettres polies, puis des collecteurs, puis des ogres.\n\nUn gobelin accepte parfois un service à la place de l'or. C'est rarement une bonne affaire."),
  handicap("souillure-de-gangrene", "Souillure de la gangrène", "neutre", icone("magic/unholy/orb-collecting-energy-green.webp"),
    "Vous avez touché la gangrène de trop près : un rituel, un artefact, un sang qui n'était pas le vôtre. Vos yeux virent au vert quand vous êtes en colère, et les démons sentent votre présence à un kilomètre.\n\nLes paladins, les prêtres et les druides devinent la souillure au premier regard (test de Sagesse (Perspicacité) DD 10). Une fois par aventure, le MJ peut vous faire entendre une voix qui propose de l'aide — à un prix.")
];

export const AFFILIATIONS = [...AFFILIATIONS_ORDRES, ...ATOUTS_HANDICAPS];
