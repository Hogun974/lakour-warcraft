// Sous-classes d'Azeroth (dnd5e 6.0.6, règles 2024) : huit sous-classes maison pour les classes du SRD 5.2, qui restent
// dans le compendium dnd5e.classes24 et ne sont jamais recopiées. Une sous-classe est un objet « subclass »
// (SubclassData : identifier, classIdentifier, advancement, spellcasting) dont les avancements accordent ses capacités
// au bon niveau de la classe (ItemGrant), ses sorts toujours préparés (ItemGrant avec configuration de sort), ses
// maîtrises (Trait) et ses dés qui évoluent (ScaleValue, lus par les formules en @scale.<sous-classe>.<identifiant>).
// Les capacités sont des objets « feat » de type { value: "class", subtype: "" }, comme celles des sous-classes du
// SRD 2024, avec prérequis de niveau et nom de la sous-classe en exigence ; elles passent par le constructeur
// `capacite` de dons.mjs (effets actifs à clés vérifiées, activités, usages). Une activité qui dépense le Conduit divin
// ou la Forme sauvage de la classe vise l'objet de classe du SRD par « feat:<identifiant> », que dnd5e relie à l'objet
// de l'acteur (Activity._remapConsumptionTarget, IdentifiedItemsMap.get), comme les capacités du SRD.
// Formes relevées dans le source de dnd5e 6.0.6 (BaseAdvancement : name et non plus title ; ItemGrantConfigurationData ;
// SpellConfigurationData : method/prepared ; ScaleValueTypeDice : number/faces/modifiers) et dans les sous-classes
// SRD 2024 du compendium classes24 (niveaux des capacités, sorts de domaine aux niveaux 3/5/7/9 ou 3/5/9/13/17).
// Textes originaux. Toutes les distances sont en mètres (5 pieds = 1,5 m).
import { MODULE, STATS, identifiant, icone, html } from "./aides.mjs";
import { exiger, cleTrait } from "./objets.mjs";
import { capacite } from "./dons.mjs";
import { SORTS, SOURCE } from "./sorts.mjs";

const PACK = "classes";

// ---------- Classes du SRD 2024 (dnd5e.classes24) : uuid, niveaux des capacités de sous-classe (relevés sur la
// sous-classe SRD de chaque classe), progression d'incantation et niveaux où une sous-classe accorde ses sorts.
// incantation : "plein" (niveau de sort max = ⌈niveau/2⌉), "demi" (⌈niveau/4⌉, 5 au plus), "pacte" (⌈niveau/2⌉, 5 au plus).
const C = id => `Compendium.dnd5e.classes24.Item.${id}`;
export const CLASSES_SRD = {
  barbarian: { uuid: C("phbbrbBarbarian0"), nom: "Barbare", niveaux: [3, 6, 10, 14], incantation: null },
  bard: { uuid: C("phbbrdBard000000"), nom: "Barde", niveaux: [3, 6, 14], incantation: "plein" },
  cleric: { uuid: C("phbclcCleric0000"), nom: "Clerc", niveaux: [3, 6, 17], incantation: "plein", niveauxSorts: [3, 5, 7, 9] },
  druid: { uuid: C("phbdrdDruid00000"), nom: "Druide", niveaux: [3, 6, 10, 14], incantation: "plein", niveauxSorts: [3, 5, 7, 9] },
  fighter: { uuid: C("phbftrFighter000"), nom: "Guerrier", niveaux: [3, 7, 10, 15, 18], incantation: null },
  monk: { uuid: C("phbmnkMonk000000"), nom: "Moine", niveaux: [3, 6, 11, 17], incantation: null },
  paladin: { uuid: C("phbpdnPaladin000"), nom: "Paladin", niveaux: [3, 7, 15, 20], incantation: "demi", niveauxSorts: [3, 5, 9, 13, 17] },
  ranger: { uuid: C("phbrgrRanger0000"), nom: "Rôdeur", niveaux: [3, 7, 11, 15], incantation: "demi", niveauxSorts: [3, 5, 9, 13, 17] },
  rogue: { uuid: C("phbrgeRogue00000"), nom: "Roublard", niveaux: [3, 9, 13, 17], incantation: null },
  sorcerer: { uuid: C("phbscrSorcerer00"), nom: "Ensorceleur", niveaux: [3, 6, 14, 18], incantation: "plein" },
  warlock: { uuid: C("phbwlkWarlock000"), nom: "Occultiste", niveaux: [3, 6, 10, 14], incantation: "pacte", niveauxSorts: [3, 5, 7, 9] },
  wizard: { uuid: C("phbwzdWizard0000"), nom: "Magicien", niveaux: [3, 6, 10, 14], incantation: "plein", niveauxSorts: [3, 5, 7, 9] }
};
export const niveauSortMax = (incantation, niveau) => ({
  plein: Math.min(9, Math.ceil(niveau / 2)), demi: Math.min(5, Math.ceil(niveau / 4)), pacte: Math.min(5, Math.ceil(niveau / 2))
})[incantation] ?? 0;
// Méthode d'incantation des sorts accordés (CONFIG.DND5E.spellcasting) : « pact » pour l'occultiste, « spell » sinon.
const METHODE = { warlock: "pact" };

// Objets de classe du SRD qu'une activité de sous-classe peut dépenser (system.identifier dans classes24).
export const CIBLES_CONSOMMATION = {
  cleric: ["feat:channel-divinity-cleric"],
  paladin: ["feat:channel-divinity-paladin"],
  druid: ["feat:wild-shape"]
};

// Sorts du SRD 2024 (dnd5e.spells24) accordés par les sous-classes : [id, nom français, niveau].
export const SORTS_SRD_SOUS_CLASSES = {
  vagueTonnante: ["phbsplThunderwav", "Vague tonnante", 1],
  bourrasque: ["phbsplGustofWind", "Bourrasque", 2],
  murDeVent: ["phbsplWindWall00", "Mur de vent", 3],
  faconnagePierre: ["phbsplStoneShape", "Façonnage de la pierre", 4],
  elementairesMineurs: ["phbsplConjureMin", "Invocation d'élémentaires mineurs", 4],
  invocationElementaire: ["phbsplConjureEle", "Invocation d'élémentaire", 5],
  murDePierre: ["phbsplWallofSton", "Mur de pierre", 5],
  protectionMalBien: ["phbEvilAndGoodPr", "Protection contre le mal et le bien", 1],
  restaurationPartielle: ["phbsplLesserRest", "Restauration partielle", 2],
  lumiereDuJour: ["phbsplDaylight00", "Lumière du jour", 3],
  protectionMort: ["phbsplDeathWard0", "Protection contre la mort", 4],
  bannissement: ["phbsplBanishment", "Bannissement", 4],
  dissipationMalBien: ["phbsplDispelEvil", "Dissipation du mal et du bien", 5],
  sanctification: ["phbsplHallow0000", "Sanctification", 5],
  sommeil: ["phbsplSleep00000", "Sommeil", 1],
  croissanceVegetale: ["phbsplPlantGrowt", "Croissance végétale", 3],
  parlerPlantes: ["phbsplSpeakwithP", "Communication avec les plantes", 3],
  etresSylvestres: ["phbsplConjureWoo", "Invocation d'êtres sylvestres", 4],
  liberteMouvement: ["phbsplFreedomofM", "Liberté de mouvement", 4],
  reve: ["phbsplDream00000", "Rêve", 5],
  voyageArbres: ["phbsplTreeStride", "Voyage par les arbres", 5],
  voirInvisible: ["phbsplSeeInvisib", "Détection de l'invisibilité", 2],
  cercleMagique: ["phbsplMagicCircl", "Cercle magique", 3],
  represailles: ["phbsplHellishReb", "Représailles infernales", 1],
  tenebres: ["phbsplDarkness00", "Ténèbres", 2],
  rayonAffaiblissant: ["phbsplRayofEnfee", "Rayon affaiblissant", 2],
  caresseVampire: ["phbsplVampiricTo", "Caresse du vampire", 3],
  malediction: ["phbsplBestowCurs", "Malédiction", 3],
  fletrissement: ["phbsplBlight0000", "Flétrissement", 4],
  contagion: ["phbsplContagion0", "Contagion", 5],
  brumeMortelle: ["phbsplCloudkill0", "Brume mortelle", 5],
  contresort: ["phbsplCounterspe", "Contresort", 3]
};
const uuidSrd = cle => `Compendium.dnd5e.spells24.Item.${SORTS_SRD_SOUS_CLASSES[cle][0]}`;

// Un sort de sous-classe : « sorts:<clé> » (sort maison de sorts.mjs) ou clé de SORTS_SRD_SOUS_CLASSES.
function sortDe(s, ou) {
  if (s.startsWith("sorts:")) {
    const doc = SORTS.find(d => d.__cle === s);
    exiger(doc, `${ou} : sort maison « ${s} » absent de sorts.mjs`);
    return { uuid: { __ref: s, __uuid: true }, nom: doc.name, niveau: doc.system.level };
  }
  exiger(SORTS_SRD_SOUS_CLASSES[s], `${ou} : sort « ${s} » absent de SORTS_SRD_SOUS_CLASSES`);
  const [, nom, niveau] = SORTS_SRD_SOUS_CLASSES[s];
  return { uuid: uuidSrd(s), nom, niveau };
}

// ---------- Automatisation : ce que le MJ applique encore (le reste est porté par effets, activités et avancements).
export const CAPACITES_EN_PARTIE = {
  "main-d-argent-chatiment-du-fleau": "La terreur ne frappe que les morts-vivants et les fiélons : la nature de la cible est connue du seul MJ, qui décide de lancer le jet de sauvegarde.",
  "main-d-argent-aura-de-purete": "La protection des alliés dans l'aura : dnd5e 6.0.6 n'applique pas d'effet de zone permanent autour d'un personnage, seul le paladin la reçoit automatiquement.",
  "main-d-argent-champion": "La lumière vive émise par le champion : éclairage de scène, hors du modèle d'acteur.",
  "si-7-maitre-du-deguisement": "Se grimer en une minute sans matériel : permission de jeu, aucune clé d'acteur ne la porte.",
  "si-7-evasion": "L'invisibilité cesse si l'espion attaque ou lance un sort : fin d'effet conditionnelle, retirée à la main.",
  "elements-avatar": "Regagner l'usage en dépensant un emplacement de niveau 5 : consommation alternative, appliquée par le joueur."
};

// ---------- Avancements (forme dnd5e 6.0.6 : objet indexé par _id, libellé dans `name`).
function avancement(base, n, type, configuration, { niveau, nom = "", indice = "", value = {} } = {}) {
  const _id = identifiant(`${base}:avancement:${n}`);
  return [_id, { _id, type, configuration, value, ...(niveau === undefined ? {} : { level: niveau }), name: nom, hint: indice, flags: {} }];
}
const FACES = [4, 6, 8, 10, 12, 20];

// ---------- Capacité de sous-classe (feat de classe).
// c = { cle, nom, niveau, texte, img, utilisations, activites (+ depense: "feat:…"), effets, maitrises, liste }
function capaciteDe(sc, c, nomSousClasse) {
  const { niveau, maitrises, liste, ...d } = c;
  const ou = `${PACK}:${c.cle}`;
  const classe = CLASSES_SRD[sc.classe];
  exiger(classe.niveaux.includes(niveau), `${ou} : niveau ${niveau} hors des niveaux de sous-classe du ${classe.nom} (${classe.niveaux.join(", ")})`);
  // Une formule libre ignore le bonus séparé (DamageData.formula) : on refuse le mélange.
  for (const a of d.activites ?? []) {
    for (const p of [...(a.degats ?? []), ...(a.soin ? [a.soin] : [])]) {
      if (!/^\d+d\d+$/.test(p.des ?? "")) exiger(!p.bonus, `${ou} : bonus « ${p.bonus} » ignoré par la formule libre « ${p.des} »`);
    }
    if (a.depense) exiger(CIBLES_CONSOMMATION[sc.classe]?.includes(a.depense), `${ou} : « ${a.depense} » n'est pas une ressource du ${classe.nom}`);
  }
  const portePar = maitrises || liste ? "sous-classe" : null;
  const automatisation = CAPACITES_EN_PARTIE[c.cle] ? "partielle" : "complete";
  const doc = capacite(PACK, { ...d, activites: (d.activites ?? []).map(a => (a.depense ? { ...a, consomme: false } : a)) }, {
    type: "class", sousType: "", niveau, exigences: nomSousClasse,
    drapeaux: { sousClasse: sc.cle, classe: sc.classe, niveau, automatisation, ...(portePar ? { portePar } : {}), ...(liste ? { liste: "sorts" } : {}) }
  });
  (d.activites ?? []).forEach((a, i) => {
    if (!a.depense) return;
    const act = doc.system.activities[identifiant(`${ou}:activite:${i}`)];
    act.consumption.targets = [{ type: "itemUses", value: "1", target: a.depense, scaling: { mode: "", formula: "" } }];
  });
  // Formules : @scale.<cette sous-classe>.<échelle déclarée>, @classes.<sa classe>.levels.
  const json = JSON.stringify(doc.system.activities) + JSON.stringify(doc.effects);
  for (const [, id, ech] of json.matchAll(/@scale\.([\w-]+)\.([\w-]+)/g)) {
    exiger(id === sc.cle && (sc.echelles ?? []).some(e => e.id === ech), `${ou} : @scale.${id}.${ech} ne désigne aucune échelle de ${sc.cle}`);
  }
  for (const [, id] of json.matchAll(/@classes\.([\w-]+)\./g)) exiger(id === sc.classe, `${ou} : @classes.${id} n'est pas la classe ${sc.classe}`);
  doc.__maitrises = maitrises ?? null;
  return doc;
}

// ---------- Sous-classe (subclass).
// sc = { cle, nom, classe, img, texte, echelles: [{ id, nom, des: { niveau: [nombre, faces] } }],
//        sorts: [{ niveau, liste: [...], prepare = 2, usages: { max, per }, nom }], capacites: [...] }
export function sousClasse(sc) {
  const ou = `${PACK}:${sc.cle}`;
  exiger(/^[a-z0-9-]+$/.test(sc.cle ?? ""), `clé invalide : « ${sc.cle} »`);
  const classe = CLASSES_SRD[sc.classe];
  exiger(classe, `${ou} : classe « ${sc.classe} » absente du SRD 2024`);
  exiger(sc.nom && sc.texte && sc.img, `${ou} : nom, texte ou image manquant`);
  const capacites = sc.capacites.map(c => capaciteDe(sc, c, sc.nom));
  for (const niv of classe.niveaux) exiger(sc.capacites.some(c => c.niveau === niv), `${ou} : aucune capacité au niveau ${niv}`);

  let n = 0;
  const avancements = [];
  for (const niv of classe.niveaux) {
    avancements.push(avancement(ou, n++, "ItemGrant", {
      items: capacites.filter(d => d.system.prerequisites.level === niv).map(d => ({ uuid: { __ref: d.__cle, __uuid: true }, optional: false })),
      optional: false, spell: null
    }, { niveau: niv, nom: `Capacités : ${sc.nom}` }));
  }
  for (const d of capacites.filter(d => d.__maitrises)) {
    const m = d.__maitrises;
    avancements.push(avancement(ou, n++, "Trait", {
      mode: "default", allowReplacements: false,
      grants: (m.accordees ?? []).map(k => cleTrait(k, ou)),
      choices: (m.choix ?? []).map(ch => ({ count: ch.nombre ?? 1, pool: ch.parmi.map(k => cleTrait(k, ou)) }))
    }, { niveau: d.system.prerequisites.level, nom: d.name, indice: m.indice ?? "", value: { chosen: [] } }));
  }
  for (const g of sc.sorts ?? []) {
    exiger(classe.incantation, `${ou} : le ${classe.nom} ne lance pas de sorts`);
    exiger([...(classe.niveauxSorts ?? []), ...classe.niveaux].includes(g.niveau), `${ou} : sorts accordés au niveau ${g.niveau}, hors des paliers du ${classe.nom}`);
    const sorts = g.liste.map(s => sortDe(s, ou));
    for (const s of sorts) exiger(s.niveau >= 1 && s.niveau <= niveauSortMax(classe.incantation, g.niveau), `${ou} : ${s.nom} (niveau ${s.niveau}) trop haut pour un ${classe.nom} de niveau ${g.niveau}`);
    avancements.push(avancement(ou, n++, "ItemGrant", {
      items: sorts.map(s => ({ uuid: s.uuid, optional: false })), optional: false,
      spell: {
        ability: [], method: METHODE[sc.classe] ?? "spell", prepared: g.prepare ?? 2,
        uses: g.usages ? { max: String(g.usages.max), per: g.usages.per, requireSlot: false } : { max: "", per: "", requireSlot: false }
      }
    }, { niveau: g.niveau, nom: g.nom ?? sc.titreSorts }));
  }
  for (const e of sc.echelles ?? []) {
    exiger(/^[a-z0-9-]+$/.test(e.id), `${ou} : identifiant d'échelle « ${e.id} » invalide`);
    const scale = Object.fromEntries(Object.entries(e.des).map(([niv, [nombre, faces]]) => {
      exiger(Number(niv) >= 3 && Number(niv) <= 20 && Number.isInteger(nombre) && nombre > 0 && FACES.includes(faces), `${ou} : échelle ${e.id} invalide au niveau ${niv}`);
      return [String(niv), { number: nombre, faces, modifiers: [] }];
    }));
    exiger(capacites.some(d => JSON.stringify(d.system.activities).includes(`@scale.${sc.cle}.${e.id}`)), `${ou} : échelle ${e.id} lue par aucune capacité`);
    avancements.push(avancement(ou, n++, "ScaleValue", { identifier: e.id, type: "dice", distance: { units: "" }, scale }, { nom: e.nom }));
  }

  // Description : texte d'ambiance, capacités par niveau, sorts accordés.
  const lignesCapacites = classe.niveaux.map(niv => `- **Niveau ${niv}** : ${sc.capacites.filter(c => c.niveau === niv).map(c => c.nom).join(", ")}`);
  const lignesSorts = (sc.sorts ?? []).map(g => `- **Niveau ${g.niveau}** : ${g.liste.map(s => sortDe(s, ou).nom).join(", ")}`);
  const texte = [
    sc.texte,
    `*Sous-classe du ${classe.nom}, choisie au niveau 3.*`,
    "# Capacités", lignesCapacites.join("\n"),
    ...(lignesSorts.length ? [`# ${sc.titreSorts}`, lignesSorts.join("\n")] : [])
  ].join("\n\n");

  const _id = identifiant(ou);
  const doc = {
    __pack: PACK, __cle: ou,
    _id, _key: `!items!${_id}`, name: sc.nom, type: "subclass", img: sc.img,
    system: {
      description: { value: html(texte), chat: "" }, identifier: sc.cle, source: SOURCE,
      advancement: Object.fromEntries(avancements), classIdentifier: sc.classe,
      spellcasting: { progression: "none", ability: "", preparation: { formula: "" } }
    },
    effects: [], folder: null, sort: 0, ownership: { default: 0 },
    flags: { [MODULE]: { cle: sc.cle, classe: sc.classe } }, _stats: STATS
  };
  for (const d of capacites) delete d.__maitrises;
  return { sousClasse: doc, capacites };
}

// Texte de la capacité « liste de sorts » (les sorts sont accordés par la sous-classe).
const listeSorts = (intro, sorts) => `${intro}\n\n${sorts.map(g => `- Niveau ${g.niveau} : ${g.liste.map(s => sortDe(s, "liste").nom).join(", ")}`).join("\n")}`;

const PB_PAR_REPOS_LONG = { max: "@prof", periode: "lr" };
const ELEMENTS = ["fire", "cold", "lightning", "thunder"];

// ======================================================================= Clerc : Domaine des Éléments

const SORTS_ELEMENTS = [
  { niveau: 3, liste: ["sorts:egide-d-orage", "vagueTonnante", "sorts:totem-du-flot-guerisseur", "bourrasque"] },
  { niveau: 5, liste: ["sorts:eclair-bondissant", "murDeVent"] },
  { niveau: 7, liste: ["faconnagePierre", "elementairesMineurs"] },
  { niveau: 9, liste: ["invocationElementaire", "murDePierre"] }
];
const ELEMENTS_SC = {
  cle: "domaine-des-elements", nom: "Domaine des Éléments", classe: "cleric", titreSorts: "Sorts du domaine des Éléments",
  img: icone("magic/symbols/elements-air-earth-fire-water"),
  texte: "Sur Azeroth, la terre, l'air, le feu et l'eau ont une volonté. Les chamans orcs, taurens, trolls et nains du Marteau-Hardi ne prient pas des dieux lointains : ils négocient avec les esprits des éléments, apaisent leur colère et la dirigent quand le monde est menacé. Les clercs de ce domaine sont les médiateurs de l'Anneau terrestre ; ils parlent pour les esprits, et les esprits répondent par la foudre, la pierre ou la vague.",
  sorts: SORTS_ELEMENTS,
  capacites: [
    {
      cle: "elements-sorts", nom: "Sorts du domaine des Éléments", niveau: 3, liste: true, img: icone("magic/lightning/bolt-forked-large-blue"),
      texte: listeSorts("Les esprits vous confient leurs prières. Quand vous atteignez les niveaux de clerc indiqués, les sorts suivants vous sont accordés ; ils sont **toujours préparés** et ne comptent pas dans votre nombre de sorts préparés.", SORTS_ELEMENTS)
    },
    {
      cle: "elements-voix-des-esprits", nom: "Voix des esprits", niveau: 3, img: icone("magic/air/air-wave-gust-blue"),
      texte: "Vous parlez, lisez et écrivez le **primordial**, la langue des esprits élémentaires. Vous maîtrisez en outre **Nature** ou **Survie** (au choix) : les esprits vous montrent où passe l'eau et où gronde la pierre.",
      maitrises: { accordees: ["languages:exotic:primordial"], choix: [{ parmi: ["skills:nat", "skills:sur"] }], indice: "Primordial, plus Nature ou Survie." }
    },
    {
      cle: "elements-colere", nom: "Colère des éléments", niveau: 3, img: icone("magic/fire/elemental-fire-humanoid"),
      texte: "Par une **action** (Magie), vous dépensez une utilisation de votre **Conduit divin** et appelez un esprit en colère. Chaque créature de votre choix dans un rayon de **4,5 m** autour de vous fait un jet de sauvegarde de **Dextérité** contre votre DD de sauvegarde des sorts. Elle subit **2d8 + votre modificateur de Sagesse** dégâts de feu, de froid, de foudre ou de tonnerre (au choix, un seul type pour toutes) en cas d'échec, la moitié en cas de réussite.",
      activites: [{
        type: "save", nom: "Déchaîner l'esprit", depense: "feat:channel-divinity-cleric", portee: ["", "self"], gabarit: ["radius", 4.5], cible: ["", "creature"],
        sauvegarde: { carac: ["dex"], dd: "wis", reussite: "half" }, degats: [{ des: "2d8", bonus: "@abilities.wis.mod", types: ELEMENTS }]
      }]
    },
    {
      cle: "elements-harmonie", nom: "Harmonie élémentaire", niveau: 6, img: icone("magic/earth/barrier-stone-brown-green"),
      texte: "Un esprit a choisi de veiller sur vous. Vous avez la **résistance** à un type de dégâts au choix : **feu**, **froid**, **foudre** ou **tonnerre**.\n\n**Écho de l'esprit.** Une fois par tour, quand un sort de clerc que vous lancez inflige des dégâts de feu, de froid, de foudre ou de tonnerre, vous ajoutez votre **modificateur de Sagesse** à l'un des jets de dégâts de ce sort.",
      maitrises: { choix: [{ parmi: ["dr:fire", "dr:cold", "dr:lightning", "dr:thunder"] }], indice: "Résistance au feu, au froid, à la foudre ou au tonnerre." },
      activites: [{ type: "damage", nom: "Écho de l'esprit", activation: "", condition: "Une fois par tour, quand un sort de clerc inflige des dégâts élémentaires", degats: [{ des: "@abilities.wis.mod", types: ELEMENTS }] }]
    },
    {
      cle: "elements-avatar", nom: "Avatar des éléments", niveau: 17, img: icone("magic/air/air-burst-spiral-large-teal-green"),
      texte: "Par une **action bonus**, vous laissez les quatre esprits vous habiter pendant **1 minute** : vous gagnez une **vitesse de vol de 9 m** et vous avez la **résistance** aux dégâts de feu, de froid, de foudre et de tonnerre. Une utilisation par **repos long** ; vous pouvez aussi la regagner en dépensant un emplacement de sort de niveau 5.",
      utilisations: { max: 1, periode: "lr" },
      effets: [{
        nom: "Avatar des éléments", transfert: false, duree: [1, "minutes"], texte: "Vol 9 m ; résistance au feu, au froid, à la foudre et au tonnerre.",
        changements: [["system.attributes.movement.speeds.fly", "9", "upgrade"], ...ELEMENTS.map(t => ["system.traits.dr.value", t])]
      }],
      activites: [{ type: "utility", nom: "Devenir avatar", activation: "bonus", duree: [1, "minute"], effets: [0] }]
    }
  ]
};

// ======================================================================= Paladin : Serment de la Main d'argent

const SORTS_MAIN = [
  { niveau: 3, liste: ["sorts:egide-de-lumiere", "protectionMalBien"] },
  { niveau: 5, liste: ["sorts:marteau-de-justice", "restaurationPartielle"] },
  { niveau: 9, liste: ["sorts:psaume-de-lumiere", "lumiereDuJour"] },
  { niveau: 13, liste: ["protectionMort", "bannissement"] },
  { niveau: 17, liste: ["dissipationMalBien", "sanctification"] }
];
const MAIN_SC = {
  cle: "serment-de-la-main-d-argent", nom: "Serment de la Main d'argent", classe: "paladin", titreSorts: "Sorts du serment de la Main d'argent",
  img: icone("magic/holy/prayer-hands-glowing-yellow"),
  texte: "La Main d'argent est née dans les cendres de la Deuxième Guerre, quand les premiers paladins de Lordaeron ont juré de protéger les vivants. Elle a vu tomber Uther et s'est relevée contre le Fléau. Ses membres prêtent un serment simple :\n\n- **Nul ne tombe seul.** Aucun compagnon n'est abandonné, vivant ou mort.\n- **La Lumière pour tous.** Le paysan, l'orc repenti et le roi méritent la même protection.\n- **Les morts reposent.** Ce qui a été relevé contre sa volonté doit retrouver la paix.\n- **L'humilité.** Le serment ne sert ni une couronne ni un ordre, mais ceux qui souffrent.",
  sorts: SORTS_MAIN,
  capacites: [
    {
      cle: "main-d-argent-sorts", nom: "Sorts du serment de la Main d'argent", niveau: 3, liste: true, img: icone("magic/holy/chalice-glowing-gold"),
      texte: listeSorts("Votre serment vous ouvre ces prières. Quand vous atteignez les niveaux de paladin indiqués, ces sorts vous sont accordés ; ils sont **toujours préparés**.", SORTS_MAIN)
    },
    {
      cle: "main-d-argent-frere-d-armes", nom: "Frère d'armes de la Main", niveau: 3, img: icone("skills/social/diplomacy-handshake-yellow"),
      texte: "Vous avez soigné des réfugiés et enterré des frères d'armes. Vous maîtrisez **Médecine** ou **Religion** (au choix).",
      maitrises: { choix: [{ parmi: ["skills:med", "skills:rel"] }], indice: "Médecine ou Religion." }
    },
    {
      cle: "main-d-argent-chatiment-du-fleau", nom: "Châtiment du Fléau", niveau: 3, img: icone("magic/light/beam-rays-green"),
      texte: "Quand vous touchez une créature avec une attaque d'arme au corps à corps, vous pouvez dépenser une utilisation de votre **Conduit divin** pour lui infliger **2d10** dégâts radiants supplémentaires. Si la cible est un **mort-vivant** ou un **fiélon**, elle fait aussi un jet de sauvegarde de **Sagesse** contre votre DD de sauvegarde des sorts ; en cas d'échec, elle est **effrayée** jusqu'à la fin de votre prochain tour.",
      effets: [{ nom: "Terreur sacrée", transfert: false, etats: ["frightened"], duree: [null, null, "sourceEnd"] }],
      activites: [
        { type: "damage", nom: "Frapper le Fléau", activation: "", condition: "Quand vous touchez avec une attaque d'arme au corps à corps", depense: "feat:channel-divinity-paladin", degats: [{ des: "2d10", types: ["radiant"] }] },
        { type: "save", nom: "Terreur sacrée", activation: "", condition: "Si la cible du châtiment est un mort-vivant ou un fiélon", consomme: false, portee: [1.5, "m"], cible: ["1", "creature"], sauvegarde: { carac: ["wis"], dd: "cha", reussite: "none" }, effets: [0] }
      ]
    },
    {
      cle: "main-d-argent-aura-de-purete", nom: "Aura de pureté", niveau: 7, img: icone("magic/holy/angel-wings-gray"),
      texte: "Vous et les créatures alliées dans votre **Aura de protection** avez la **résistance aux dégâts nécrotiques** et ne pouvez pas tomber **malades**. La peste du Fléau elle-même recule devant vous.",
      effets: [{ nom: "Aura de pureté", changements: [["system.traits.dr.value", "necrotic"], ["system.traits.ci.value", "diseased"]] }]
    },
    {
      cle: "main-d-argent-nul-ne-tombe-seul", nom: "Nul ne tombe seul", niveau: 15, img: icone("magic/life/heart-cross-strong-flame-blue"),
      texte: "Quand une créature alliée que vous voyez à **9 m** ou moins tombe à 0 point de vie, vous pouvez utiliser votre **réaction** pour lui rendre un nombre de points de vie égal à **deux fois votre niveau de paladin**. Une utilisation par **repos long**.",
      utilisations: { max: 1, periode: "lr" },
      activites: [{ type: "heal", nom: "Relever le compagnon", activation: "reaction", condition: "Une créature alliée à 9 m tombe à 0 point de vie", portee: [9, "m"], cible: ["1", "ally"], soin: { des: "2 * @classes.paladin.levels" } }]
    },
    {
      cle: "main-d-argent-champion", nom: "Champion de la Lumière", niveau: 20, img: icone("magic/holy/chalice-glowing-gold"),
      texte: "Par une **action bonus**, vous devenez pendant **10 minutes** l'image de ce que la Main d'argent a été de plus noble. Vous émettez une lumière vive sur 9 m, vous gagnez **+2 à la classe d'armure** et vous avez l'avantage aux jets de sauvegarde de **Sagesse** et de **Charisme**. Chaque ennemi qui commence son tour à 3 m ou moins de vous subit des dégâts radiants égaux à **votre modificateur de Charisme + votre bonus de maîtrise**. Une utilisation par **repos long**.",
      utilisations: { max: 1, periode: "lr" },
      effets: [{
        nom: "Champion de la Lumière", transfert: false, duree: [10, "minutes"], texte: "+2 à la CA ; avantage aux jets de sauvegarde de Sagesse et de Charisme.",
        changements: [["system.attributes.ac.bonus", "2"], ["system.abilities.wis.save.roll.mode", 1], ["system.abilities.cha.save.roll.mode", 1]]
      }],
      activites: [
        { type: "utility", nom: "Devenir champion", activation: "bonus", duree: [10, "minute"], effets: [0] },
        { type: "damage", nom: "Rayonnement", activation: "", condition: "Un ennemi commence son tour à 3 m ou moins de vous", consomme: false, portee: [3, "m"], cible: ["1", "enemy"], degats: [{ des: "@abilities.cha.mod + @prof", types: ["radiant"] }] }
      ]
    }
  ]
};

// ======================================================================= Druide : Cercle du Rêve d'émeraude

const SORTS_REVE = [
  { niveau: 3, liste: ["sorts:sarments-du-reve", "sommeil", "sorts:torpeur-d-emeraude"] },
  { niveau: 5, liste: ["croissanceVegetale", "parlerPlantes"] },
  { niveau: 7, liste: ["etresSylvestres", "liberteMouvement"] },
  { niveau: 9, liste: ["reve", "voyageArbres"] }
];
const REVE_SC = {
  cle: "cercle-du-reve-d-emeraude", nom: "Cercle du Rêve d'émeraude", classe: "druid", titreSorts: "Sorts du cercle du Rêve d'émeraude",
  img: icone("magic/nature/dreamcatcher-green"),
  texte: "Le Rêve d'émeraude est le monde tel qu'il aurait été sans l'empreinte des mortels, veillé par Ysera et le vol vert. Les druides de ce cercle, héritiers de Malfurion et du Cénarion, dorment des siècles dans les tertres de Reflet-de-Lune pour y marcher. Ils en rapportent la rosée qui guérit, les sentiers qui traversent les lieues en un pas, et la vigilance contre le Cauchemar qui ronge le Rêve de l'intérieur.",
  echelles: [{ id: "rosee", nom: "Dés de la Rosée du Rêve", des: { 3: [2, 6], 10: [3, 6], 14: [4, 6] } }],
  sorts: SORTS_REVE,
  capacites: [
    {
      cle: "reve-sorts", nom: "Sorts du cercle du Rêve d'émeraude", niveau: 3, liste: true, img: icone("magic/control/sleep-bubble-purple"),
      texte: listeSorts("Le Rêve vous murmure ses secrets. Quand vous atteignez les niveaux de druide indiqués, ces sorts vous sont accordés ; ils sont **toujours préparés**.", SORTS_REVE)
    },
    {
      cle: "reve-rosee", nom: "Rosée du Rêve", niveau: 3, img: icone("magic/nature/barrier-shield-wood-vines"),
      texte: "Par une **action** (Magie), vous dépensez une utilisation de votre **Forme sauvage** et faites tomber la rosée du Rêve dans une sphère de **3 m** de rayon centrée sur un point situé à **18 m** ou moins. Chaque créature de votre choix dans la sphère récupère **2d6 + votre modificateur de Sagesse** points de vie. Les dés passent à **3d6** au niveau 10 et à **4d6** au niveau 14.",
      activites: [{ type: "heal", nom: "Faire tomber la rosée", depense: "feat:wild-shape", portee: [18, "m"], gabarit: ["radius", 3], cible: ["", "ally"], soin: { des: "@scale.cercle-du-reve-d-emeraude.rosee + @abilities.wis.mod" } }]
    },
    {
      cle: "reve-pas-dans-le-reve", nom: "Pas dans le Rêve", niveau: 6, img: icone("magic/movement/portal-vortex-orange"),
      texte: "Par une **action bonus**, vous traversez un instant le Rêve d'émeraude : vous vous téléportez dans un espace inoccupé que vous voyez à **9 m** ou moins et gagnez un nombre de **points de vie temporaires** égal à votre niveau de druide. Nombre d'utilisations : votre **modificateur de Sagesse** (minimum 1) par repos long.",
      utilisations: { max: "max(1, @abilities.wis.mod)", periode: "lr" },
      activites: [{ type: "heal", nom: "Traverser le Rêve", activation: "bonus", soin: { des: "@classes.druid.levels", type: "temphp" } }]
    },
    {
      cle: "reve-gardien", nom: "Gardien du Rêve", niveau: 10, img: icone("magic/time/day-night-sun-moon"),
      texte: "Vous avez affronté les visions du Cauchemar sans y céder. Vous avez la **résistance aux dégâts psychiques** et vous ne pouvez pas être **effrayé**.",
      effets: [{ nom: "Gardien du Rêve", changements: [["system.traits.dr.value", "psychic"], ["system.traits.ci.value", "frightened"]] }]
    },
    {
      cle: "reve-le-reve-se-referme", nom: "Le Rêve se referme", niveau: 14, img: icone("magic/control/debuff-energy-hold-green"),
      texte: "Par une **action** (Magie), vous entrouvrez le Rêve autour de vous. Chaque ennemi dans un rayon de **9 m** fait un jet de sauvegarde de **Sagesse** contre votre DD de sauvegarde des sorts. En cas d'échec, il subit **4d10 dégâts psychiques** et est **neutralisé** jusqu'à la fin de votre prochain tour ; en cas de réussite, il subit la moitié de ces dégâts seulement. Une utilisation par **repos long**.",
      utilisations: { max: 1, periode: "lr" },
      effets: [{ nom: "Happé par le Rêve", transfert: false, etats: ["incapacitated"], duree: [null, null, "sourceEnd"] }],
      activites: [{ type: "save", nom: "Refermer le Rêve", portee: ["", "self"], gabarit: ["radius", 9], cible: ["", "enemy"], sauvegarde: { carac: ["wis"], dd: "wis", reussite: "half" }, degats: [{ des: "4d10", types: ["psychic"] }], effets: [0] }]
    }
  ]
};

// ======================================================================= Guerrier : Gladiateur d'Orgrimmar

const GLADIATEUR_SC = {
  cle: "gladiateur-d-orgrimmar", nom: "Gladiateur d'Orgrimmar", classe: "fighter",
  img: icone("skills/social/intimidation-impressing"),
  texte: "Dans l'Anneau du Valeur d'Orgrimmar, on ne se bat pas seulement pour vaincre, mais pour être vu. Les gladiateurs, orcs, trolls, ogres ou anciens esclaves des camps d'internement, ont appris que la foule est une arme : son rugissement les tient debout, son silence les tue. Hors de l'arène, ils gardent ce goût du spectacle et cette endurance qui étonnent jusqu'aux Kor'kron.",
  echelles: [{ id: "coup-de-grace", nom: "Dés du coup de grâce", des: { 10: [2, 8], 15: [3, 8] } }],
  capacites: [
    {
      cle: "gladiateur-faveur-de-la-foule", nom: "Faveur de la foule", niveau: 3, img: icone("skills/melee/blood-slash-foam-red"),
      texte: "Quand vous réduisez une créature hostile à 0 point de vie ou réussissez un coup critique contre elle, vous gagnez un nombre de **points de vie temporaires** égal à **votre modificateur de Constitution + votre niveau de guerrier** (minimum 1).",
      activites: [{ type: "heal", nom: "Ovation", activation: "", condition: "Vous réduisez une créature hostile à 0 point de vie ou réussissez un coup critique", soin: { des: "max(1, @abilities.con.mod + @classes.fighter.levels)", type: "temphp" } }]
    },
    {
      cle: "gladiateur-salut-a-la-foule", nom: "Salut à la foule", niveau: 3, img: icone("weapons/swords/sword-guard-gold-red"),
      texte: "Par une **action bonus**, vous levez votre arme vers les gradins, réels ou imaginaires : jusqu'à la fin de ce tour, vous avez l'**avantage** à vos jets d'attaque au corps à corps avec une arme. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
      utilisations: PB_PAR_REPOS_LONG,
      effets: [{ nom: "Salut à la foule", transfert: false, duree: [1, "turns", "turnEnd"], changements: [["system.rolls.attack.mwak.mode", 1]] }],
      activites: [{ type: "utility", nom: "Saluer la foule", activation: "bonus", duree: ["", "turn"], effets: [0] }]
    },
    {
      cle: "gladiateur-endurci-par-le-sable", nom: "Endurci par le sable", niveau: 7, img: icone("skills/melee/shield-block-gray-orange"),
      texte: "Des années de combats sous le soleil de Durotar vous ont endurci. Vos points de vie maximum augmentent de **1 par niveau**, et vous avez l'**avantage** aux tests de **Force**.",
      effets: [{ nom: "Endurci par le sable", changements: [["system.attributes.hp.bonuses.level", "1"], ["system.abilities.str.check.roll.mode", 1]] }]
    },
    {
      cle: "gladiateur-coup-de-grace", nom: "Coup de grâce", niveau: 10, img: icone("skills/melee/blade-tip-acid-poison-green"),
      texte: "Une fois par tour, quand vous touchez avec une arme une créature qui a **la moitié de ses points de vie ou moins**, vous lui infligez **2d8** dégâts supplémentaires du type de l'arme. Ces dés passent à **3d8** au niveau 15.",
      activites: [{ type: "damage", nom: "Achever", activation: "", condition: "Une fois par tour, en touchant une créature à la moitié de ses points de vie ou moins", degats: [{ des: "@scale.gladiateur-d-orgrimmar.coup-de-grace", types: ["slashing", "piercing", "bludgeoning"] }] }]
    },
    {
      cle: "gladiateur-clameur", nom: "Clameur de l'arène", niveau: 15, img: icone("creatures/abilities/bear-roar-bite-brown-green"),
      texte: "Le bruit d'un combat vous porte comme une foule. Vous avez l'**avantage** aux jets d'**initiative**, et quand vous lancez l'initiative, vous gagnez un nombre de **points de vie temporaires** égal à votre niveau de guerrier.",
      effets: [{ nom: "Clameur de l'arène", changements: [["system.attributes.init.roll.mode", 1]] }],
      activites: [{ type: "heal", nom: "Entendre la clameur", activation: "", condition: "Quand vous lancez l'initiative", soin: { des: "@classes.fighter.levels", type: "temphp" } }]
    },
    {
      cle: "gladiateur-legende", nom: "Légende d'Orgrimmar", niveau: 18, img: icone("skills/melee/strike-axe-red"),
      texte: "Votre nom est scandé dans les tavernes de la Vallée de l'Honneur. Vous avez l'**avantage** aux jets de sauvegarde contre la mort. Au début de chacun de vos tours, si vous avez au moins 1 point de vie et au plus la moitié de vos points de vie, vous récupérez **votre bonus de maîtrise + votre modificateur de Constitution** points de vie.",
      effets: [{ nom: "Légende d'Orgrimmar", changements: [["system.attributes.death.roll.mode", 1]] }],
      activites: [{ type: "heal", nom: "Refuser de tomber", activation: "", condition: "Au début de votre tour, entre 1 point de vie et la moitié de vos points de vie", soin: { des: "@prof + @abilities.con.mod" } }]
    }
  ]
};

// ======================================================================= Rôdeur : Chasseur de démons illidari

const SORTS_ILLIDARI = [
  { niveau: 3, liste: ["protectionMalBien"] },
  { niveau: 5, liste: ["voirInvisible"] },
  { niveau: 9, liste: ["cercleMagique"] },
  { niveau: 13, liste: ["bannissement"] },
  { niveau: 17, liste: ["dissipationMalBien"] }
];
const ILLIDARI_SC = {
  cle: "chasseur-de-demons-illidari", nom: "Chasseur de démons illidari", classe: "ranger", titreSorts: "Sorts du chasseur illidari",
  img: icone("magic/unholy/hand-claw-fire-green"),
  texte: "Les illidari ont donné leurs yeux pour voir ce que la Légion ardente cache, et laissé la gangrène marquer leur chair pour la retourner contre elle. Ces chasseurs ne sont pas les élus d'Illidan : ce sont des rôdeurs qui ont suivi la même voie à leur mesure, traquant les démons dans les forêts de Gangrebois ou sur les falaises d'Outreterre. On les craint, on les évite, et on les appelle quand un seigneur de l'effroi s'installe au village.",
  echelles: [{ id: "gangrene", nom: "Dés des lames gangrenées", des: { 3: [1, 6], 11: [2, 6] } }],
  sorts: SORTS_ILLIDARI,
  capacites: [
    {
      cle: "illidari-sorts", nom: "Sorts du chasseur illidari", niveau: 3, liste: true, img: icone("magic/perception/eye-ringed-glow-angry-red"),
      texte: listeSorts("Votre traque vous a appris quelques protections. Quand vous atteignez les niveaux de rôdeur indiqués, ces sorts vous sont accordés ; ils sont **toujours préparés**.", SORTS_ILLIDARI)
    },
    {
      cle: "illidari-vue-spectrale", nom: "Vue spectrale", niveau: 3, img: icone("magic/perception/eye-ringed-glow-angry-teal"),
      texte: "Vos yeux bandés ou brûlés ne voient plus la lumière, mais la magie et les âmes. Vous gagnez la **vision aveugle** sur **3 m**.",
      effets: [{ nom: "Vue spectrale", changements: [["system.attributes.senses.ranges.blindsight", 3, "upgrade"]] }]
    },
    {
      cle: "illidari-lames-gangrenees", nom: "Lames gangrenées", niveau: 3, img: icone("magic/fire/flame-burning-chain"),
      texte: "Une fois par tour, quand vous touchez une créature avec une attaque d'arme, vous pouvez lui infliger **1d6** dégâts de feu supplémentaires : une flamme verte gangrenée court sur la lame. Ces dés passent à **2d6** au niveau 11.",
      activites: [{ type: "damage", nom: "Embraser la lame", activation: "", condition: "Une fois par tour, après une attaque d'arme réussie", degats: [{ des: "@scale.chasseur-de-demons-illidari.gangrene", types: ["fire"] }] }]
    },
    {
      cle: "illidari-vol-plane", nom: "Vol plané", niveau: 7, img: icone("creatures/abilities/wing-batlike-purple-blue"),
      texte: "Des ailes d'ombre se déploient un instant dans votre dos. Par une **action bonus**, vous gagnez une **vitesse de vol de 9 m** jusqu'à la fin de ce tour. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
      utilisations: PB_PAR_REPOS_LONG,
      effets: [{ nom: "Ailes d'ombre", transfert: false, duree: [1, "turns", "turnEnd"], changements: [["system.attributes.movement.speeds.fly", "9", "upgrade"]] }],
      activites: [{ type: "utility", nom: "Déployer les ailes", activation: "bonus", duree: ["", "turn"], effets: [0] }]
    },
    {
      cle: "illidari-ame-du-chasseur", nom: "Âme du chasseur", niveau: 11, img: icone("magic/perception/eye-slit-orange"),
      texte: "La gangrène que vous portez ne vous brûle plus. Votre **vision aveugle** s'étend à **9 m**, et vous avez la **résistance aux dégâts de feu**.",
      effets: [{ nom: "Âme du chasseur", changements: [["system.attributes.senses.ranges.blindsight", 9, "upgrade"], ["system.traits.dr.value", "fire"]] }]
    },
    {
      cle: "illidari-metamorphose", nom: "Métamorphose", niveau: 15, img: icone("creatures/unholy/demon-fire-horned-winged-roar"),
      texte: "Par une **action bonus**, vous laissez le démon que vous avez enchaîné prendre forme pendant **1 minute** : vous gagnez **+2 à la classe d'armure**, une **vitesse de vol de 9 m**, et vos attaques au corps à corps avec une arme infligent **1d6** dégâts supplémentaires. Une utilisation par **repos long**.",
      utilisations: { max: 1, periode: "lr" },
      effets: [{
        nom: "Métamorphose", transfert: false, duree: [1, "minutes"], texte: "+2 à la CA, vol 9 m, +1d6 aux dégâts des attaques d'arme au corps à corps.",
        changements: [["system.attributes.ac.bonus", "2"], ["system.attributes.movement.speeds.fly", "9", "upgrade"], ["system.rolls.damage.mwak.bonus", "1d6"]]
      }],
      activites: [{ type: "utility", nom: "Se métamorphoser", activation: "bonus", duree: [1, "minute"], effets: [0] }]
    }
  ]
};

// ======================================================================= Occultiste : Pacte de la Gangrène

const SORTS_GANGRENE = [
  { niveau: 3, liste: ["sorts:fletrissure-gangrenee", "represailles", "tenebres", "rayonAffaiblissant"] },
  { niveau: 5, liste: ["caresseVampire", "malediction"] },
  { niveau: 7, liste: ["sorts:hurlement-de-terreur", "fletrissement"] },
  { niveau: 9, liste: ["contagion", "brumeMortelle"] }
];
const GANGRENE_SC = {
  cle: "pacte-de-la-gangrene", nom: "Pacte de la Gangrène", classe: "warlock", titreSorts: "Sorts du pacte de la Gangrène",
  img: icone("magic/unholy/beam-impact-green"),
  texte: "La gangrène est la magie de la Légion ardente : un feu vert qui dévore la vie pour nourrir la puissance. Les démonistes du Conseil des Ombres, les cultistes du Marteau du Crépuscule et quelques érudits trop curieux de Dalaran ont signé avec un démon, un seigneur de l'effroi ou la gangrène elle-même. Le pacte donne beaucoup, et réclame davantage ; les occultistes qui y survivent apprennent à boire la vie de leurs ennemis avant que la flamme ne boive la leur.",
  echelles: [{ id: "flammes", nom: "Dés des flammes gangrenées", des: { 3: [1, 6], 10: [2, 6] } }],
  sorts: SORTS_GANGRENE,
  capacites: [
    {
      cle: "gangrene-sorts", nom: "Sorts du pacte de la Gangrène", niveau: 3, liste: true, img: icone("magic/death/hand-undead-skeleton-fire-green"),
      texte: listeSorts("Votre patron vous ouvre son grimoire. Quand vous atteignez les niveaux d'occultiste indiqués, ces sorts vous sont accordés ; ils sont **toujours préparés**.", SORTS_GANGRENE)
    },
    {
      cle: "gangrene-flammes", nom: "Flammes gangrenées", niveau: 3, img: icone("creatures/unholy/demon-fire-horned-mask"),
      texte: "Une fois par tour, quand vous touchez une créature avec un jet d'attaque de sort d'occultiste, vous pouvez lui infliger **1d6** dégâts de feu supplémentaires. Ces dés passent à **2d6** au niveau 10.",
      activites: [{ type: "damage", nom: "Attiser la gangrène", activation: "", condition: "Une fois par tour, après une attaque de sort d'occultiste réussie", degats: [{ des: "@scale.pacte-de-la-gangrene.flammes", types: ["fire"] }] }]
    },
    {
      cle: "gangrene-siphon", nom: "Siphon de vie", niveau: 3, img: icone("magic/unholy/beam-ringed-impact-purple"),
      texte: "Une fois par tour, quand un sort d'occultiste que vous lancez inflige des dégâts de feu ou nécrotiques à une créature hostile, vous récupérez un nombre de points de vie égal à votre **modificateur de Charisme** (minimum 1).",
      activites: [{ type: "heal", nom: "Siphonner", activation: "", condition: "Une fois par tour, quand votre sort inflige des dégâts de feu ou nécrotiques à une créature hostile", soin: { des: "max(1, @abilities.cha.mod)" } }]
    },
    {
      cle: "gangrene-peau", nom: "Peau de gangrène", niveau: 6, img: icone("magic/defensive/shield-barrier-flaming-diamond-acid"),
      texte: "La gangrène affleure sous votre peau. Vous avez la **résistance aux dégâts de feu**.\n\n**Retour de flamme.** Quand une créature que vous voyez à **18 m** ou moins vous inflige des dégâts, vous pouvez utiliser votre **réaction** pour lui infliger **2d8 + votre modificateur de Charisme** dégâts de feu. Une utilisation par **repos court**.",
      utilisations: { max: 1, periode: "sr" },
      effets: [{ nom: "Peau de gangrène", changements: [["system.traits.dr.value", "fire"]] }],
      activites: [{ type: "damage", nom: "Retour de flamme", activation: "reaction", condition: "Une créature à 18 m vous inflige des dégâts", portee: [18, "m"], cible: ["1", "creature"], degats: [{ des: "2d8", bonus: "@abilities.cha.mod", types: ["fire"] }] }]
    },
    {
      cle: "gangrene-oeil-du-neant", nom: "Œil du Néant", niveau: 10, img: icone("magic/perception/eye-ringed-glow-angry-large-red"),
      texte: "Vous avez contemplé le Néant distordu sans détourner les yeux. Votre **vision dans le noir** porte à **36 m**, et vous ne pouvez pas être **effrayé**.",
      effets: [{ nom: "Œil du Néant", changements: [["system.attributes.senses.ranges.darkvision", 36, "upgrade"], ["system.traits.ci.value", "frightened"]] }]
    },
    {
      cle: "gangrene-pluie", nom: "Pluie de feu gangrené", niveau: 14, img: icone("magic/fire/explosion-flame-lightning-strike"),
      texte: "Par une **action** (Magie), vous ouvrez une brèche vers les flammes de la Légion au-dessus d'un point que vous voyez à **36 m** ou moins. Chaque créature dans une sphère de **6 m** de rayon centrée sur ce point fait un jet de sauvegarde de **Dextérité** contre votre DD de sauvegarde des sorts : elle subit **8d8 dégâts de feu** en cas d'échec, la moitié en cas de réussite. Une créature qui échoue prend feu et est **en feu** pendant 1 minute ou jusqu'à ce qu'elle éteigne les flammes. Une utilisation par **repos long**.",
      utilisations: { max: 1, periode: "lr" },
      effets: [{ nom: "Flammes de la Légion", transfert: false, etats: ["burning"], duree: [1, "minutes"] }],
      activites: [{ type: "save", nom: "Ouvrir la brèche", portee: [36, "m"], gabarit: ["sphere", 6], cible: ["", "creature"], sauvegarde: { carac: ["dex"], dd: "cha", reussite: "half" }, degats: [{ des: "8d8", types: ["fire"] }], effets: [0] }]
    }
  ]
};

// ======================================================================= Magicien : Tradition du Kirin Tor

const SORTS_KIRIN_TOR = [
  { niveau: 3, liste: ["sorts:nova-de-givre"], prepare: 0 },
  { niveau: 5, liste: ["sorts:metamorphose-ovine"], prepare: 0 },
  { niveau: 7, liste: ["sorts:blizzard"], prepare: 0 },
  { niveau: 9, liste: ["sorts:portail-de-dalaran"], prepare: 0 }
];
const KIRIN_TOR_SC = {
  cle: "tradition-du-kirin-tor", nom: "Tradition du Kirin Tor", classe: "wizard", titreSorts: "Archives de Dalaran",
  img: icone("magic/defensive/shield-barrier-blue"),
  texte: "Le Kirin Tor gouverne Dalaran, la cité des mages, depuis les premiers jours d'Arathor. Ses membres en robe violette ont vu leur ville rasée par Arthas, relevée, puis arrachée au sol pour flotter au-dessus de Norfendre et des Îles brisées. Ils en ont tiré une discipline : la magie doit protéger, se déplacer vite et ne jamais céder à la tentation de la gangrène. Un magicien de cette tradition a étudié dans la Citadelle pourpre et porte un anneau du Kirin Tor, que le Conseil peut rappeler à tout moment.",
  echelles: [{ id: "egide", nom: "Dés de l'Égide du Violet", des: { 3: [2, 6], 6: [3, 6], 10: [4, 6], 14: [5, 6] } }],
  sorts: [
    ...SORTS_KIRIN_TOR,
    { niveau: 14, liste: ["contresort"], prepare: 2, usages: { max: 1, per: "lr" }, nom: "Maître du Kirin Tor : Contresort" }
  ],
  capacites: [
    {
      cle: "kirin-tor-archives", nom: "Archives de Dalaran", niveau: 3, liste: true, img: icone("sundries/scrolls/scroll-bound-blue-white"),
      texte: listeSorts("La bibliothèque de la Citadelle pourpre vous est ouverte. Quand vous atteignez les niveaux de magicien indiqués, ces sorts s'ajoutent gratuitement à votre **grimoire** ; vous les préparez comme vos autres sorts de magicien.", SORTS_KIRIN_TOR)
    },
    {
      cle: "kirin-tor-egide", nom: "Égide du Violet", niveau: 3, img: icone("magic/defensive/shield-barrier-deflect-teal"),
      texte: "Quand vous ou une créature que vous voyez à **9 m** ou moins subissez des dégâts, vous pouvez utiliser votre **réaction** pour tisser un bouclier violet qui réduit ces dégâts de **2d6 + votre modificateur d'Intelligence**. Les dés passent à **3d6** au niveau 6, **4d6** au niveau 10 et **5d6** au niveau 14. Nombre d'utilisations : votre **modificateur d'Intelligence** (minimum 1) par repos long.",
      utilisations: { max: "max(1, @abilities.int.mod)", periode: "lr" },
      activites: [{ type: "utility", nom: "Tisser l'égide", activation: "reaction", condition: "Vous ou une créature à 9 m subissez des dégâts", portee: [9, "m"], cible: ["1", "creature"], jet: { nom: "Dégâts évités", formule: "@scale.tradition-du-kirin-tor.egide + @abilities.int.mod" } }]
    },
    {
      cle: "kirin-tor-erudit", nom: "Érudit de la Citadelle pourpre", niveau: 6, img: icone("magic/symbols/circled-gem-pink"),
      texte: "Les examens du Conseil ne pardonnent rien. Vous avez l'**expertise** en **Arcanes** (votre bonus de maîtrise est doublé), et l'**avantage** aux jets de sauvegarde de Constitution pour maintenir votre **concentration**.",
      effets: [{ nom: "Érudit de la Citadelle pourpre", changements: [["system.skills.arc.value", 2, "upgrade"], ["system.attributes.concentration.roll.mode", 1]] }]
    },
    {
      cle: "kirin-tor-transfert", nom: "Transfert tactique", niveau: 10, img: icone("magic/movement/trail-streak-zigzag-teal"),
      texte: "Par une **action bonus**, vous vous téléportez dans un espace inoccupé que vous voyez à **9 m** ou moins, et un voile de force vous entoure : vous gagnez **+2 à la classe d'armure** jusqu'au début de votre prochain tour. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
      utilisations: PB_PAR_REPOS_LONG,
      effets: [{ nom: "Voile de transfert", transfert: false, duree: [null, null, "sourceStart"], changements: [["system.attributes.ac.bonus", "2"]] }],
      activites: [{ type: "utility", nom: "Se transférer", activation: "bonus", portee: [9, "m"], cible: ["", "space"], effets: [0] }]
    },
    {
      cle: "kirin-tor-maitre", nom: "Maître du Kirin Tor", niveau: 14, img: icone("magic/symbols/mask-metal-silver-white"),
      texte: "Le Conseil des Six vous compte parmi ses égaux. Vous avez la **résistance aux dégâts de force**, et le sort **Contresort** est toujours préparé pour vous ; une fois par **repos long**, vous pouvez le lancer sans dépenser d'emplacement de sort.",
      effets: [{ nom: "Maître du Kirin Tor", changements: [["system.traits.dr.value", "force"]] }]
    }
  ]
};

// ======================================================================= Roublard : Espion du SI:7

const SI7_SC = {
  cle: "espion-du-si-7", nom: "Espion du SI:7", classe: "rogue",
  img: icone("magic/perception/shadow-stealth-eyes-purple"),
  texte: "Le SI:7 est le service de renseignement de Hurlevent, fondé sous le roi Llane et longtemps dirigé par Mathias Shaw. Ses agents ne portent pas d'uniforme : ce sont des domestiques, des marchands, des ivrognes de la Vieille ville. Ils empoisonnent leurs lames d'extraits des marais du Bois de la Pénombre, changent de visage en une minute et disparaissent avant qu'on ait compris qu'ils étaient là.",
  echelles: [{ id: "poison", nom: "Dés du poison du SI:7", des: { 3: [1, 6], 9: [2, 6], 17: [3, 6] } }],
  capacites: [
    {
      cle: "si-7-formation", nom: "Formation du SI:7", niveau: 3, img: icone("skills/social/diplomacy-handshake-blue"),
      texte: "Vous maîtrisez la **trousse de déguisement** et la **trousse de contrefaçon**. Vous avez aussi l'**avantage** aux jets d'**initiative** : un agent n'est jamais pris de court.",
      maitrises: { accordees: ["tool:disg", "tool:forg"], indice: "Trousse de déguisement et trousse de contrefaçon." },
      effets: [{ nom: "Formation du SI:7", changements: [["system.attributes.init.roll.mode", 1]] }]
    },
    {
      cle: "si-7-lames-enduites", nom: "Lames enduites", niveau: 3, img: icone("skills/toxins/poison-bottle-corked-fire-green"),
      texte: "Par une **action bonus**, vous enduisez vos armes d'un poison du SI:7 pour **1 minute**. Pendant cette durée, la première fois à chacun de vos tours que vous touchez une créature avec une arme, elle fait un jet de sauvegarde de **Constitution** (DD 8 + votre modificateur de Dextérité + votre bonus de maîtrise). En cas d'échec, elle subit **1d6 dégâts de poison** et est **empoisonnée** jusqu'à la fin de votre prochain tour. Ces dés passent à **2d6** au niveau 9 et à **3d6** au niveau 17. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
      utilisations: PB_PAR_REPOS_LONG,
      effets: [{ nom: "Poison du SI:7", transfert: false, etats: ["poisoned"], duree: [null, null, "sourceEnd"] }],
      activites: [
        { type: "utility", nom: "Enduire les lames", activation: "bonus", duree: [1, "minute"] },
        { type: "save", nom: "Poison du SI:7", activation: "", condition: "La première fois à chacun de vos tours que vous touchez avec une arme enduite", consomme: false, portee: [1.5, "m"], cible: ["1", "creature"], sauvegarde: { carac: ["con"], dd: "dex", reussite: "none" }, degats: [{ des: "@scale.espion-du-si-7.poison", types: ["poison"] }], effets: [0] }
      ]
    },
    {
      cle: "si-7-maitre-du-deguisement", nom: "Maître du déguisement", niveau: 9, img: icone("commodities/treasure/mask-wood-tan"),
      texte: "En **1 minute** et sans matériel, vous changez d'allure au point de passer pour une autre personne de votre taille. Vous avez l'**avantage** aux tests de Charisme (**Tromperie**) et de Sagesse (**Intuition**).",
      effets: [{ nom: "Maître du déguisement", changements: [["system.skills.dec.roll.mode", 1], ["system.skills.ins.roll.mode", 1]] }]
    },
    {
      cle: "si-7-evasion", nom: "Évasion d'agent", niveau: 13, img: icone("magic/perception/eye-ringed-glow-angry-small-red"),
      texte: "Par une **action bonus**, vous devenez **invisible** jusqu'au début de votre prochain tour. L'invisibilité cesse si vous attaquez ou lancez un sort. Une utilisation par **repos court**.",
      utilisations: { max: 1, periode: "sr" },
      effets: [{ nom: "Évasion d'agent", transfert: false, etats: ["invisible"], duree: [null, null, "sourceStart"] }],
      activites: [{ type: "utility", nom: "Disparaître", activation: "bonus", effets: [0] }]
    },
    {
      cle: "si-7-dossier-complet", nom: "Dossier complet", niveau: 17, img: icone("skills/melee/blade-tip-smoke-green"),
      texte: "Vous savez où frapper. Quand vous touchez une créature avec votre **Attaque sournoise**, elle fait un jet de sauvegarde de **Constitution** (DD 8 + votre modificateur de Dextérité + votre bonus de maîtrise) ; en cas d'échec, elle est **étourdie** jusqu'à la fin de votre prochain tour. Une utilisation par **repos court**.",
      utilisations: { max: 1, periode: "sr" },
      effets: [{ nom: "Point faible", transfert: false, etats: ["stunned"], duree: [null, null, "sourceEnd"] }],
      activites: [{ type: "save", nom: "Frapper le point faible", activation: "", condition: "Quand vous touchez avec votre Attaque sournoise", portee: [1.5, "m"], cible: ["1", "creature"], sauvegarde: { carac: ["con"], dd: "dex", reussite: "none" }, effets: [0] }]
    }
  ]
};

// ======================================================================= Assemblage

const DEFINITIONS = [ELEMENTS_SC, MAIN_SC, REVE_SC, GLADIATEUR_SC, ILLIDARI_SC, GANGRENE_SC, KIRIN_TOR_SC, SI7_SC];
const CONSTRUITES = DEFINITIONS.map(sousClasse);

// Les huit sous-classes (compendium « classes ») et leurs capacités (même compendium).
export const SOUS_CLASSES = CONSTRUITES.map(c => c.sousClasse);
export const CAPACITES_SOUS_CLASSES = CONSTRUITES.flatMap(c => c.capacites);
