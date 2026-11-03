// Métiers d'Azeroth (dnd5e 6.0.6, règles 2024) : trois métiers de récolte (herboristerie, minage, dépeçage) et quatre
// d'artisanat (alchimie, forge, ingénierie, cuisine), adossés aux outils de dnd5e (CONFIG.DND5E.tools : herb, smith,
// leatherworker, alchemist, tinker, cook). Composants en objets « butin » (catégorie material, rareté = qualité), trois
// produits nouveaux (les autres produits sont les objets existants : potions, flacons, repas, armes, armures), un journal
// visible « Recettes d'artisanat » (lien vers le produit, composants, test d'outil cliquable, temps, coût), une table de
// récolte par biome des zones de la campagne, une page dans le guide du joueur et une dans le guide du MJ.
// Textes originaux.
import { MODULE, ajouterPages, collection, icone, journal, ref, table } from "./aides.mjs";
import { butin, consommable, equipement } from "./objets.mjs";
import { GUIDES, jet, liens } from "./guides.mjs";
import { OBJETS } from "./objets-azeroth.mjs";
import { CONSOMMABLES } from "./consommables.mjs";
import { BUTIN_DONJON } from "./donjon.mjs";
import { BUTIN_RARES } from "./rares.mjs";

export const METIERS_RECOLTE = {
  herboristerie: { nom: "Herboristerie", outil: "matériel d'herboriste", outilDnd: "herb", sinon: "Nature" },
  minage: { nom: "Minage", outil: "outils de forgeron", outilDnd: "smith", sinon: "Athlétisme" },
  depecage: { nom: "Dépeçage", outil: "outils de maroquinier", outilDnd: "leatherworker", sinon: "Survie" }
};
export const METIERS_ARTISANAT = {
  alchimie: { nom: "Alchimie", outil: "matériel d'alchimiste", outilDnd: "alchemist" },
  forge: { nom: "Forge", outil: "outils de forgeron", outilDnd: "smith" },
  ingenierie: { nom: "Ingénierie gobeline et gnome", outil: "outils de bricoleur", outilDnd: "tinker" },
  cuisine: { nom: "Cuisine", outil: "ustensiles de cuisinier", outilDnd: "cook" }
};
// DD de récolte selon la qualité du composant.
export const DD_RECOLTE = { common: 10, uncommon: 13, rare: 16 };

// ---------------------------------------------------------------- Composants

const composant = (metier, cle, nom, img, rarete, prix, texte) => {
  const o = butin({ cle, nom, img: icone(img), categorie: "material", rarete, prix, poids: 0.5, texte });
  o.flags[MODULE].metier = metier;
  return o;
};

export const COMPOSANTS = collection("metiers", [
  // --- Herboristerie
  composant("herboristerie", "herbe-a-fievre", "Herbe-à-fièvre", "commodities/flowers/flower-green", "common", [1, "gp"],
    "Une herbe sèche aux petites fleurs vert pâle, qui pousse en touffes au pied des rochers des Tarides. Mâchée, elle fait tomber la fièvre ; distillée, elle entre dans toutes les potions de soins."),
  composant("herboristerie", "lys-des-oasis", "Lys des oasis", "commodities/flowers/lily-water-white", "common", [2, "gp"],
    "Un lys blanc qui ne fleurit qu'au bord des oasis saines. Quand l'eau se gâte, il noircit : les caravaniers le regardent avant de boire."),
  composant("herboristerie", "varech-des-criques", "Varech des criques", "commodities/flowers/buds-red-green", "common", [1, "gp"],
    "Une algue brune et salée ramassée à marée basse sur la côte des Tarides. Les alchimistes en tirent un sel qui rend les muscles vifs."),
  composant("herboristerie", "mousse-d-aprefange", "Mousse d'Âprefange", "commodities/flowers/clover-purple", "uncommon", [8, "gp"],
    "Une mousse violette et spongieuse des souches du marécage d'Âprefange. Elle garde l'eau des semaines et calme les plaies les plus profondes."),
  composant("herboristerie", "chardon-cendre", "Chardon-cendre", "commodities/flowers/flower-grey-orange", "uncommon", [10, "gp"],
    "Un chardon gris aux fleurs orangées qui pousse sur les pentes noircies autour du cratère de Brasegouffre. Il sent la poudre ; les gobelins en mettent dans leurs bombes."),
  composant("herboristerie", "petale-de-lune", "Pétale de lune", "commodities/flowers/lotus-white", "rare", [25, "gp"],
    "Un pétale blanc qui luit doucement la nuit, cueilli dans les jardins noyés des ruines elfiques. Les prêtresses d'Élune disent qu'il garde un peu de la lumière de la Dame blanche."),
  // --- Minage
  composant("minage", "minerai-de-cuivre", "Minerai de cuivre", "commodities/stone/ore-chunk-copper-orange", "common", [1, "gp"],
    "Un bloc de roche veiné de cuivre, comme on en trouve dans toutes les collines. Le métal des bricoleurs et des chaudronniers."),
  composant("minage", "minerai-de-fer-rouge", "Minerai de fer rouge", "commodities/stone/ore-chunk-brown", "common", [2, "gp"],
    "Le fer rouille-sang des collines de Rouge-Veine, lourd et cassant tant qu'il n'est pas forgé. Les forgerons d'Orgrimmar ne jurent que par lui."),
  composant("minage", "pepite-d-argent", "Pépite d'argent", "commodities/metal/ingot-rough-white", "uncommon", [10, "gp"],
    "Une pépite d'argent natif, tirée d'un filon mince. L'argent mord les morts-vivants et retient la magie des flacons."),
  composant("minage", "eclat-de-verre-noir", "Éclat de verre noir", "commodities/stone/ore-chunk-black", "uncommon", [12, "gp"],
    "Un éclat de la roche fondue en verre par la chute de la Fournaise, ramassé sur les pentes du cratère. Tranchant comme un rasoir, froid même au soleil."),
  composant("minage", "veine-de-mithril", "Veine de mithril", "commodities/metal/ingot-stamped-silver", "rare", [40, "gp"],
    "Un morceau de roche où court un fil de mithril, léger comme une plume et plus dur que l'acier. Un forgeron nain vous embrasserait pour moins que ça."),
  // --- Dépeçage
  composant("depecage", "viande-de-gibier", "Viande de gibier", "consumables/meat/drumstick-bone-pink", "common", [5, "sp"],
    "Un quartier de viande de sanglier, de zhévra ou de loup, salé pour la route. Il tient trois jours."),
  composant("depecage", "cuir-leger", "Cuir léger", "commodities/leather/leather-bolt-tan", "common", [1, "gp"],
    "Des peaux de petit gibier tannées à la hâte. Bonnes pour les poignées, les sangles et les gants."),
  composant("depecage", "peau-de-kodo-epaisse", "Peau de kodo épaisse", "commodities/leather/fur-pelt-brown", "common", [3, "gp"],
    "Un pan de peau de kodo épais comme un doigt. Les taurens n'en prennent que sur les bêtes mortes de vieillesse, et demandent qu'on fasse de même."),
  composant("depecage", "filet-de-poisson", "Filet de poisson", "consumables/meat/fillet-fish-pink-silver-gray", "common", [5, "sp"],
    "Le filet d'un poisson de la baie, vidé et rincé à l'eau de mer. À manger le jour même, ou à cuire en tourte."),
  composant("depecage", "ecailles-de-crocilisque", "Écailles de crocilisque", "commodities/leather/scales-green", "uncommon", [10, "gp"],
    "Une poignée d'écailles dorsales de crocilisque, dures comme de la corne. Les armuriers les cousent en écailles de protection."),
  composant("depecage", "cuir-gangrene", "Cuir gangrené", "commodities/leather/leather-scraps-yellow", "uncommon", [12, "gp"],
    "Le cuir d'une bête touchée par la gangrène, tiède et légèrement verdâtre. Il résiste au feu, mais un druide vous demandera de le brûler.")
]);

// ---------------------------------------------------------------- Produits nouveaux

export const PRODUITS = collection("metiers", [
  consommable({
    cle: "pierre-a-aiguiser-de-rouge-veine", nom: "Pierre à aiguiser de Rouge-Veine", img: icone("tools/cooking/mill-stone-grey"), categorie: "trinket",
    rarete: "common", prix: [5, "gp"], poids: 1,
    texte: "Une pierre grise taillée dans la roche de Rouge-Veine, où affleurent des grains de fer. En **1 minute**, vous affûtez une arme : pendant **1 heure**, elle inflige **+1** aux jets de dégâts au corps à corps. La pierre s'use en une fois, et deux affûtages ne se cumulent pas : le second remplace le premier.",
    effets: [{ nom: "Lame affûtée", transfert: false, duree: 3600, changements: [["system.rolls.damage.mwak.bonus", "1"]], texte: "+1 aux dégâts au corps à corps pendant 1 heure." }],
    activites: [{ type: "utility", nom: "Affûter", activation: "minute", activationValeur: 1, portee: ["", "self"], duree: [1, "hour"], effets: [0] }]
  }),
  equipement({
    cle: "lunette-de-visee-gnome", nom: "Lunette de visée gnome", img: icone("tools/navigation/spyglass-telescope-brass"), categorie: "trinket",
    rarete: "uncommon", magique: true, harmonisation: true, prix: [150, "gp"], poids: 0.5,
    texte: "Une petite lunette de cuivre à double lentille, aux verres taillés par un mage gnome, vissée sur un arc, une arbalète ou un fusil. Tant que vous y êtes **lié**, vous avez **+1** aux jets d'attaque à distance avec une arme. Plusieurs lunettes ne se cumulent pas : on ne vise qu'à travers une seule.",
    effets: [{ nom: "Lunette de visée", changements: [["system.rolls.attack.rwak.bonus", "1"]], texte: "+1 aux jets d'attaque à distance avec une arme." }]
  }),
  consommable({
    cle: "fusee-de-detresse-gobeline", nom: "Fusée de détresse gobeline", img: icone("magic/light/projectile-flare-blue"), categorie: "trinket",
    rarete: "common", prix: [3, "gp"], poids: 0.5,
    texte: "Un tube de carton ciré et une mèche. Par une **action**, vous l'allumez : elle monte à 90 m et éclate en une gerbe bleue visible à des kilomètres, puis éclaire en lumière vive un rayon de 18 m pendant 1 minute. Les maîtres de vol du Cartel y répondent, contre paiement.",
    activites: [{ type: "utility", nom: "Allumer", activation: "action", portee: [90, "m"], duree: [1, "minute"] }]
  })
]);
// La pierre ne se cumule pas : son effet porte un drapeau « unique » ; scripts/automatismes.js retire l'ancien exemplaire
// quand un nouveau est appliqué à la même créature.
PRODUITS[0].effects[0].flags = { [MODULE]: { unique: "lame-affutee" } };
for (const p of PRODUITS) p.flags[MODULE].metier = { "pierre-a-aiguiser-de-rouge-veine": "forge", "lunette-de-visee-gnome": "ingenierie", "fusee-de-detresse-gobeline": "ingenierie" }[p.flags[MODULE].cle];

// ---------------------------------------------------------------- Recettes

// [produit, [[composant, nombre]…], DD, temps]. Le coût des fournitures n'est pas écrit à la main : il découle de la règle
// d'économie (fournituresDe) — composants au prix du marchand + fournitures = la moitié du prix de vente (arrondi à la po
// supérieure), et la valeur des composants seule n'en dépasse jamais la moitié. Un produit rare demande un composant rare.
export const RECETTES = {
  alchimie: [
    ["potion-de-soins", [["herbe-a-fievre", 2], ["lys-des-oasis", 1]], 10, "4 heures"],
    ["elixir-de-la-mangouste", [["varech-des-criques", 2], ["herbe-a-fievre", 1]], 12, "4 heures"],
    ["flasque-d-huile-de-feu", [["chardon-cendre", 1]], 13, "4 heures"],
    ["potion-de-mana-mineure", [["petale-de-lune", 1], ["lys-des-oasis", 1]], 13, "4 heures"],
    ["potion-de-soins-majeure", [["lys-des-oasis", 2], ["mousse-d-aprefange", 1]], 14, "8 heures"],
    ["flacon-de-sagesse-distillee", [["petale-de-lune", 1], ["mousse-d-aprefange", 2]], 15, "8 heures"],
    ["flacon-de-rage-du-kodo", [["chardon-cendre", 2], ["herbe-a-fievre", 2]], 15, "8 heures"],
    ["flacon-des-titans-de-pierre", [["chardon-cendre", 2], ["veine-de-mithril", 1]], 17, "1 jour"],
    ["flacon-de-peau-de-pierre", [["eclat-de-verre-noir", 1], ["veine-de-mithril", 1]], 17, "1 jour"]
  ],
  forge: [
    ["pierre-a-aiguiser-de-rouge-veine", [["minerai-de-fer-rouge", 1]], 10, "1 heure"],
    ["epee-de-la-garde", [["minerai-de-fer-rouge", 3], ["cuir-leger", 1]], 12, "1 jour"],
    ["hache-d-orgrimmar", [["minerai-de-fer-rouge", 4], ["cuir-leger", 1]], 12, "1 jour"],
    ["harnois-de-grunt", [["minerai-de-fer-rouge", 4], ["peau-de-kodo-epaisse", 2]], 14, "3 jours"],
    ["cotte-de-la-garde", [["minerai-de-fer-rouge", 6], ["cuir-leger", 2]], 14, "3 jours"],
    ["gantelets-ignifuges-du-contremaitre", [["cuir-gangrene", 2], ["minerai-de-fer-rouge", 2]], 15, "3 jours"],
    ["bouclier-en-ecailles-de-gueule-de-fer", [["ecailles-de-crocilisque", 3], ["pepite-d-argent", 1]], 16, "3 jours"]
  ],
  ingenierie: [
    ["fusee-de-detresse-gobeline", [["minerai-de-cuivre", 1]], 10, "1 heure"],
    ["bombe-gobeline", [["minerai-de-cuivre", 2], ["chardon-cendre", 1]], 12, "2 heures"],
    ["casque-de-mineur-a-lanterne", [["minerai-de-cuivre", 2], ["cuir-leger", 1]], 12, "4 heures"],
    ["lunette-de-visee-gnome", [["minerai-de-cuivre", 2], ["eclat-de-verre-noir", 1]], 15, "1 jour"],
    ["bottes-a-ressorts-baille-fonds", [["minerai-de-fer-rouge", 3], ["minerai-de-cuivre", 3], ["veine-de-mithril", 1]], 18, "3 jours"]
  ],
  cuisine: [
    ["ragout-de-kodo-epice", [["viande-de-gibier", 2], ["herbe-a-fievre", 1]], 10, "1 heure"],
    ["brochettes-de-raptor", [["viande-de-gibier", 2]], 11, "1 heure"],
    ["tourte-de-poisson-de-theramore", [["filet-de-poisson", 3]], 12, "2 heures"]
  ]
};

// Prix d'un objet en po (dnd5e : pp 10, gp 1, ep 0,5, sp 0,1, cp 0,01).
const TAUX = { pp: 10, gp: 1, ep: 0.5, sp: 0.1, cp: 0.01 };
export const prixPo = o => (o.system.price?.value ?? 0) * (TAUX[o.system.price?.denomination] ?? 1);
// Fournitures d'une recette (po) : la moitié du prix du produit, arrondie à la po supérieure, moins la valeur des composants.
export const valeurComposants = (composants, prix) => composants.reduce((n, [c, k]) => n + prix(c) * k, 0);
export const fournituresDe = (prixProduit, valeur) => Math.max(0, Math.ceil(prixProduit / 2 - valeur - 1e-9));

const TOUS_OBJETS = [...OBJETS, ...CONSOMMABLES, ...BUTIN_DONJON, ...BUTIN_RARES, ...COMPOSANTS, ...PRODUITS];
const lien = liens(TOUS_OBJETS);
const QUALITE = { "": "ordinaire", common: "commun", uncommon: "peu commun", rare: "rare", veryRare: "très rare", legendary: "légendaire" };
const objet = cle => {
  const o = TOUS_OBJETS.find(d => d.__cle === `objets:${cle}`);
  if (!o) throw new Error(`Recette : objet inconnu ${cle}`);
  return o;
};
const ligneRecette = metier => ([produit, composants, dd, temps]) => {
  const p = objet(produit);
  const cout = fournituresDe(prixPo(p), valeurComposants(composants, c => prixPo(objet(c))));
  const liste = composants.map(([c, n]) => `${n} × ${lien(`objets:${c}`)}`).join(", ");
  return `- **${lien(`objets:${produit}`)}** (${QUALITE[p.system.rarity ?? ""]}) — ${liste} ; ${jet(METIERS_ARTISANAT[metier].outil, dd)} ; ${temps} ; ${cout} po de fournitures.`;
};

const REGLE_ARTISANAT = "Il faut maîtriser l'outil du métier, avoir les composants et payer les fournitures (fioles, charbon, sel, mèches). À la fin du temps indiqué, faites le test d'outil. **Réussite** : l'objet est prêt. **Réussite de 5 ou plus au-dessus du DD** : pour un consommable, un exemplaire de plus. **Échec** : les fournitures sont perdues, les composants gardés. **Échec de 5 ou plus** : les composants sont perdus aussi. **L'établi** (bouton « Établi » en tête de la fiche de personnage) vérifie l'outil, les composants et l'or, lance le test et applique ce résultat.";

// Recettes lues par l'établi (scripts/etabli.js), posées en flags.lakour-warcraft.recettes du journal « Recettes
// d'artisanat » : le produit par son uuid de compendium (résolu par le fabricant), les composants par leur clé (drapeau
// « cle » des objets d'un inventaire, jamais leur nom), l'outil par sa clé dnd5e et les fournitures par fournituresDe.
export const RECETTES_ETABLI = Object.entries(RECETTES).flatMap(([metier, liste]) => liste.map(([produit, composants, dd, temps]) => {
  const p = objet(produit);
  return {
    id: `${metier}:${produit}`, metier, nomMetier: METIERS_ARTISANAT[metier].nom,
    outil: METIERS_ARTISANAT[metier].outilDnd, nomOutil: METIERS_ARTISANAT[metier].outil,
    produit: { cle: produit, nom: p.name, uuid: { __ref: p.__cle, __uuid: true } }, consommable: p.type === "consumable",
    composants: composants.map(([c, nombre]) => ({ cle: c, nom: objet(c).name, nombre })),
    dd, temps, fournitures: fournituresDe(prixPo(p), valeurComposants(composants, c => prixPo(objet(c))))
  };
}));

export const JOURNAL_RECETTES = journal({
  cle: "recettes-d-artisanat", nom: "Recettes d'artisanat", visible: true, pages: [
    ...Object.entries(METIERS_ARTISANAT).map(([cle, m]) => ({
      titre: m.nom, texte: `
**Outil :** ${m.outil}. ${REGLE_ARTISANAT}

${RECETTES[cle].map(ligneRecette(cle)).join("\n")}` }))
  ]
});
JOURNAL_RECETTES.flags[MODULE].recettes = RECETTES_ETABLI;

// ---------------------------------------------------------------- Tables de récolte par biome

const tableRecolte = (cle, nom, formule, description, resultats) => table({ cle, nom, formule, description, resultats });
const USAGE = "Une heure de récolte : tirez une fois, puis faites le test du métier du composant (matériel d'herboriste ou Nature, outils de forgeron ou Athlétisme, outils de maroquinier ou Survie) : DD 10 pour un composant commun, 13 peu commun, 16 rare. Réussite : 1d4 unités ; échec : une seule. Un personnage récolte au plus quatre heures par jour.";
export const TABLES_RECOLTE = [
  tableRecolte("recolte-plaines-des-tarides", "Récolte — Plaines des Tarides", "1d8", `Autour du Carrefour, de Fort-Rivet et du kraal de Ronceroc. ${USAGE}`, [
    [1, 2, ref("objets:herbe-a-fievre")], [3, 3, ref("objets:lys-des-oasis")], [4, 4, ref("objets:minerai-de-cuivre")],
    [5, 5, ref("objets:viande-de-gibier")], [6, 6, ref("objets:peau-de-kodo-epaisse")], [7, 7, ref("objets:cuir-leger")],
    [8, 8, { titre: "Un témoin gênant", texte: "Une bête défend son territoire, ou une patrouille se demande ce que vous faites là. Tirez sur la table des rencontres sur la route ; la récolte reprend après." }]
  ]),
  tableRecolte("recolte-cote-et-criques", "Récolte — Côte et criques", "1d8", `De Cabestan à la crique d'Eldrassal. ${USAGE}`, [
    [1, 2, ref("objets:varech-des-criques")], [3, 4, ref("objets:filet-de-poisson")], [5, 5, ref("objets:ecailles-de-crocilisque")],
    [6, 6, ref("objets:minerai-de-cuivre")], [7, 7, ref("objets:petale-de-lune")],
    [8, 8, { titre: "La marée monte", texte: "La mer remonte plus vite que prévu : il faut sortir des rochers (Athlétisme DD 12) ou perdre l'heure et son sac de récolte." }]
  ]),
  tableRecolte("recolte-collines-rouges", "Récolte — Collines rouges et cratère", "1d10", `Entre Rouge-Veine, Gué-de-Sel et le cratère de Brasegouffre. ${USAGE}`, [
    [1, 2, ref("objets:minerai-de-fer-rouge")], [3, 4, ref("objets:chardon-cendre")], [5, 5, ref("objets:eclat-de-verre-noir")],
    [6, 6, ref("objets:pepite-d-argent")], [7, 7, ref("objets:cuir-gangrene")], [8, 8, ref("objets:veine-de-mithril")],
    [9, 10, { titre: "Gangrène", texte: "Le filon ou la plante est souillé : une lueur verte, une odeur de soufre. Qui le touche fait un jet de sauvegarde de Constitution DD 12 ou gagne un niveau d'Épuisement. La Lame ardente n'est peut-être pas loin." }]
  ]),
  tableRecolte("recolte-marais-d-aprefange", "Récolte — Marais d'Âprefange", "1d8", `Autour de Theramore et du Gué-Brumeux. ${USAGE}`, [
    [1, 3, ref("objets:mousse-d-aprefange")], [4, 4, ref("objets:herbe-a-fievre")], [5, 5, ref("objets:filet-de-poisson")],
    [6, 6, ref("objets:ecailles-de-crocilisque")], [7, 7, ref("objets:viande-de-gibier")],
    [8, 8, { titre: "Sables mouvants", texte: "La berge s'enfonce sous les pieds : jet de sauvegarde de Force DD 12 ou entravé jusqu'à ce qu'un allié vous tire de là (action, Athlétisme DD 12)." }]
  ])
];

// ---------------------------------------------------------------- Pages des guides (joueur visible, MJ caché)

const lienTables = liens(TABLES_RECOLTE, [JOURNAL_RECETTES]);
const [guideJoueur, guideMJ] = [GUIDES.find(g => g.flags[MODULE].cle === "guide-du-joueur"), GUIDES.find(g => g.flags[MODULE].cle === "guide-du-mj")];
const parMetier = m => COMPOSANTS.filter(c => c.flags[MODULE].metier === m).map(c => `${lien(c.__cle)} (${QUALITE[c.system.rarity]})`).join(", ");

ajouterPages(guideJoueur, [{
  titre: "Métiers d'Azeroth", texte: `
Entre deux aventures, on récolte et on fabrique. Un **métier** n'est pas une capacité de classe : il suffit de maîtriser l'outil qui va avec (par votre historique, votre peuple, un don ou un apprentissage). Chacun peut pratiquer autant de métiers qu'il maîtrise d'outils.

**Récolte**
- **${METIERS_RECOLTE.herboristerie.nom}** (${METIERS_RECOLTE.herboristerie.outil}, ou Sagesse (Nature) sans maîtrise) : ${parMetier("herboristerie")}.
- **${METIERS_RECOLTE.minage.nom}** (${METIERS_RECOLTE.minage.outil}, ou Force (Athlétisme) avec une pioche) : ${parMetier("minage")}.
- **${METIERS_RECOLTE.depecage.nom}** (${METIERS_RECOLTE.depecage.outil}, ou Sagesse (Survie)) : ${parMetier("depecage")}.

Une heure de récolte donne une chance de trouver un composant selon le pays traversé ; le MJ tire sur la table du biome. DD 10 pour un composant commun, 13 peu commun, 16 rare. La qualité d'un composant se lit à sa rareté.

**Artisanat**
- **Alchimie** (matériel d'alchimiste) : potions, élixirs et flacons.
- **Forge** (outils de forgeron) : armes, armures, pierres à aiguiser.
- **Ingénierie gobeline et gnome** (outils de bricoleur) : bombes, fusées, lunettes, mécanismes.
- **Cuisine** (ustensiles de cuisinier) : les repas « bien nourri ».

Les recettes, avec leurs composants, leur test, leur temps et leur coût, sont dans ${lienTables("journaux:recettes-d-artisanat")}. Le bouton **« Établi »**, en tête de votre fiche de personnage, choisit la recette, vérifie l'outil, les composants et l'or, lance le test d'outil et range l'objet fabriqué dans votre inventaire.` }]);

ajouterPages(guideMJ, [{
  titre: "Métiers : récolte et artisanat (MJ)", texte: `
**Quand récolter.** Pendant un voyage, un personnage qui renonce à guetter peut récolter une heure par étape (une à quatre heures par jour). Tirez sur la table du biome, puis demandez le test : DD 10, 13 ou 16 selon la qualité du composant. Une réussite rapporte 1d4 unités, un échec une seule.

**Tables de récolte**
${TABLES_RECOLTE.map(t => `- ${lienTables(`tables:${t.flags[MODULE].cle}`)}`).join("\n")}

**Artisanat.** Un objet se fabrique pendant le temps libre ou au camp, jamais en combat. Le temps indiqué peut se fractionner sur plusieurs jours. Les recettes sont dans ${lienTables("journaux:recettes-d-artisanat")}. Un objet rare (flacon des Titans de pierre, flacon de peau-de-pierre) demande un composant rare, la veine de mithril : c'est une bonne raison de partir en expédition.

**Équilibre.** Fabriquer coûte la moitié du prix de vente (arrondie à la po supérieure) : la valeur des composants au prix du marchand, plus les fournitures indiquées dans la recette, qui complètent. L'artisanat fait gagner de l'argent, pas une fortune. Un intendant de faction rachète les composants à la moitié de leur valeur, et les vend à leur valeur moins sa remise de réputation.

**Établi.** Chaque joueur fabrique seul depuis sa fiche (bouton « Établi », ou l'API du module : ouvrirEtabli). L'établi n'écrit que sur la fiche du fabricant : or des fournitures, composants retirés selon la règle, objet du compendium du module ajouté (deux exemplaires d'un consommable sur une réussite de 5 ou plus), et un message dans le chat. Le temps de fabrication reste à votre arbitrage.

**Pour le MJ IA.** Les composants portent un drapeau « metier » (herboristerie, minage, depecage) et les produits nouveaux aussi (forge, ingenierie) : le butin d'une bête ou d'un filon peut se distribuer directement depuis la table du biome.` }]);

export const METIERS_DOCUMENTS = [...COMPOSANTS, ...PRODUITS, ...collection("metiers", [...TABLES_RECOLTE, JOURNAL_RECETTES])];
