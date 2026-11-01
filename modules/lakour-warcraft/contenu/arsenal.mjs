// L'arsenal d'Azeroth (dnd5e 6.0.6, règles 2024) : armes de faction avec leur botte d'arme (weapon mastery), armures et
// boucliers, munitions liées à leurs armes, prothèses et bricolages gnomes, gobelins et nains (l'équivalent des
// augmétiques de 40k), objets magiques peu communs et rares avec lien (harmonisation), effets actifs et charges.
// Chantier 3 du plan de contenu (lakour-mj-ia/docs/plan-contenu-optimise.md). Pack « objets », clés « objets:arsenal-… ».
//
// Clés relevées dans dnd5e 6.0.6 (dnd5e.mjs) :
// - armes : DND5E.weaponTypes, weaponMasteries, weaponIds (baseItem) ; WeaponData.ammunition.type = un sous-type de
//   munition (ammunitionOptions filtre les consommables « ammo » de ce sous-type) ;
// - munitions : DND5E.consumableTypes.ammo.subtypes ; ConsumableData.damage { base, replace } (dégâts ajoutés à ceux
//   de l'arme si replace = false, AttackActivity#_getDamageParts) et magicalBonus (ajouté au jet si « mgc ») ;
//   propriétés valides : validProperties.consumable + consumable.ammo (« ret ») + propriétés physiques (ada, mgc, sil) ;
// - armures : DND5E.armorTypes, armorIds, shieldIds ; équipement : miscEquipmentTypes ;
// - charges : UsesField.recovery { period, type: recoverAll | loseAll | formula, formula } ; « dawn » accepte une formule ;
// - effets : schémas d'acteur 6.0 (rolls.*, skills.*.roll.*, abilities.*.check|save.roll.*, attributes.movement.speeds.*,
//   attributes.senses.ranges.*, traits.dr|dv|ci.value, bonuses.spell.dc), jamais les anciennes clés « shim ».
// Prix en po (gp) ; poids en livres (« lb ») comme objets-azeroth.mjs : dnd5e les convertit en kg dans un monde
// en unités métriques (PhysicalItemTemplate, convertWeight). Portées en mètres (5 pieds = 1,5 m). Textes originaux.
import { MODULE, icone } from "./aides.mjs";
import { arme, equipement, consommable, exiger, DOMMAGES } from "./objets.mjs";

// ---------- Clés dnd5e propres à l'arsenal (les autres sont vérifiées par les constructeurs de objets.mjs)

// DND5E.consumableTypes.ammo.subtypes
export const SOUS_TYPES_MUNITION = ["arrow", "crossbowBolt", "energyCell", "firearmBullet", "slingBullet", "blowgunNeedle"];
// ConsumableData#validProperties pour « ammo » : mgc, ret, et les propriétés « isPhysical » (ada, mgc, sil).
export const PROPRIETES_MUNITION = ["ada", "mgc", "ret", "sil"];
// Les familles de l'arsenal, rangées dans flags["lakour-warcraft"].arsenal.
export const FAMILLES = ["arme", "armure", "munition", "prothese", "magique"];

const famille = (doc, f) => {
  exiger(FAMILLES.includes(f), `${doc.__cle} : famille d'arsenal « ${f} » inconnue`);
  doc.flags[MODULE].arsenal = f;
  return doc;
};
const exigerCle = cle => exiger(/^arsenal-[a-z0-9-]+$/.test(cle ?? ""), `clé d'arsenal « ${cle} » : préfixe « arsenal- » attendu`);

// Charges récupérées à l'aube par une formule (« 1d3 ») plutôt qu'en totalité.
export function recharge(doc, formule) {
  exiger(doc.system.uses?.max, `${doc.__cle} : recharge sans charges`);
  exiger(/^\d+(d\d+)?([+-]\d+)?$/.test(formule), `${doc.__cle} : formule de recharge « ${formule} » invalide`);
  doc.system.uses.recovery = [{ period: "dawn", type: "formula", formula: formule }];
  return doc;
}

// Arme de l'arsenal. d.munition = sous-type de munition consommé (exigé si l'arme a la propriété « amm »).
export function armeArsenal(d, f = "arme") {
  exigerCle(d.cle);
  const doc = arme(d);
  const munitions = doc.system.properties.includes("amm");
  exiger(munitions === Boolean(d.munition), `${doc.__cle} : la propriété « amm » et la munition vont ensemble`);
  if (d.munition) {
    exiger(SOUS_TYPES_MUNITION.includes(d.munition), `${doc.__cle} : sous-type de munition « ${d.munition} » inconnu de dnd5e`);
    doc.system.ammunition = { type: d.munition };
  }
  exiger(doc.system.mastery, `${doc.__cle} : une arme de l'arsenal a une botte d'arme`);
  return famille(doc, f);
}

// Équipement de l'arsenal (armure, bouclier, prothèse, objet merveilleux).
export function equipementArsenal(d, f) {
  exigerCle(d.cle);
  return famille(equipement(d), f);
}

// Munition. d = { cle, nom, img, texte, sousType, quantite, degats: { des, types } (ajoutés à l'arme), bonus, argent,
//                 magique, rarete, prix, poids }
export function munition(d) {
  exigerCle(d.cle);
  exiger(SOUS_TYPES_MUNITION.includes(d.sousType), `objets:${d.cle} : sous-type de munition « ${d.sousType} » inconnu de dnd5e`);
  const doc = consommable({ ...d, categorie: "ammo", magique: Boolean(d.magique || d.bonus) });
  const proprietes = [...doc.system.properties, ...(d.argent ? ["sil"] : [])];
  for (const p of proprietes) exiger(PROPRIETES_MUNITION.includes(p), `${doc.__cle} : propriété de munition « ${p} » inconnue`);
  let base = { number: null, denomination: null, bonus: "", types: [] };
  if (d.degats) {
    const m = /^(\d+)d(\d+)$/.exec(d.degats.des ?? "");
    exiger(m, `${doc.__cle} : dés de dégâts « ${d.degats.des} » invalides`);
    for (const t of d.degats.types) exiger(DOMMAGES.includes(t), `${doc.__cle} : type de dommages « ${t} » inconnu de dnd5e`);
    base = { number: Number(m[1]), denomination: Number(m[2]), bonus: "", types: d.degats.types };
  }
  Object.assign(doc.system, {
    properties: proprietes, magicalBonus: d.bonus ?? null,
    uses: { max: "", spent: 0, recovery: [], autoDestroy: false },
    damage: { base: { ...base, custom: { enabled: false, formula: "" }, scaling: { mode: "", number: null, formula: "" } }, replace: false }
  });
  return famille(doc, "munition");
}

// ---------------------------------------------------------------- Armes de faction

const ARMES = [
  armeArsenal({
    cle: "arsenal-hache-kor-kron", nom: "Hache de bataille kor'kron", img: icone("weapons/axes/axe-broad-black"),
    categorie: "martialM", base: "battleaxe", degats: { des: "1d8", types: ["slashing"] }, polyvalente: "1d10",
    proprietes: ["ver"], maitrise: "topple", prix: [12, "gp"], poids: 4,
    texte: "Une hache au fer noirci, large comme une main ouverte, que la garde d'élite d'Orgrimmar porte à une ou deux mains. Le revers du tranchant est lesté pour faucher les jambes : les Kor'kron apprennent à renverser avant d'achever."
  }),
  armeArsenal({
    cle: "arsenal-fusil-de-dun-morogh", nom: "Fusil à lunette de Dun Morogh", img: icone("weapons/guns/rifle-hunting-scoped-sight"),
    categorie: "martialR", base: "musket", degats: { des: "1d12", types: ["piercing"] },
    proprietes: ["amm", "lod", "two"], maitrise: "slow", portee: [24, 72], munition: "firearmBullet", prix: [750, "gp"], poids: 12,
    texte: "Un long canon rayé, une crosse en noyer des montagnes et une lunette de cuivre réglée au millimètre par les fusiliers de la Garde de Forgefer. Il porte deux fois plus loin qu'un mousquet ordinaire. Il tire des **balles de fusil**, une seule à la fois."
  }),
  armeArsenal({
    cle: "arsenal-arbalete-gnome-a-repetition", nom: "Arbalète gnome à répétition", img: icone("weapons/crossbows/crossbow-slotted"),
    categorie: "martialR", base: "lightcrossbow", degats: { des: "1d8", types: ["piercing"] },
    proprietes: ["amm", "two", "spc"], maitrise: "slow", portee: [24, 96], munition: "crossbowBolt", prix: [250, "gp"], poids: 8,
    texte: "Un chargeur de six carreaux vissé sur le fût, un levier qui réarme la corde : l'arbalète que les ingénieurs de Gnomeregan ont dessinée pour tirer plus vite qu'un nain ne recharge.\n\n**Spécial.** Elle n'a pas la propriété Chargement tant que son chargeur contient des carreaux ; remplir le chargeur demande une **action**. Sur un 1 naturel au jet d'attaque, le mécanisme se coince : il faut une action et un test d'Intelligence DD 10 avec des outils de bricoleur pour le décoincer."
  }),
  armeArsenal({
    cle: "arsenal-glaive-de-sentinelle", nom: "Glaive de Sentinelle", img: icone("weapons/polearms/glaive-hooked-steel"),
    categorie: "martialM", base: "glaive", degats: { des: "1d10", types: ["slashing"] },
    proprietes: ["hvy", "rch", "two"], maitrise: "graze", prix: [20, "gp"], poids: 6,
    texte: "Une lame courbe montée sur une hampe de bois de fer, gravée de croissants. Les Sentinelles de Darnassus s'en servent pour tenir à distance les satyres et les orcs qui pénètrent dans les forêts d'Ashenvale : même une parade arrachée laisse une entaille."
  }),
  armeArsenal({
    cle: "arsenal-javeline-gurubashi", nom: "Javeline barbelée gurubashi", img: icone("weapons/polearms/javelin-hooked"),
    categorie: "simpleM", base: "javelin", degats: { des: "1d6", types: ["piercing"] },
    proprietes: ["thr"], maitrise: "slow", portee: [9, 36], prix: [1, "gp"], poids: 2,
    texte: "Une hampe de bambou et une pointe d'os taillée en harpon, à la manière des chasseurs de la jungle de Strangleronce. La barbelure reste dans la plaie et gêne chaque pas de la proie."
  }),
  armeArsenal({
    cle: "arsenal-canon-main-gobelin", nom: "Canon-main gobelin", img: icone("weapons/guns/gun-pistol-brass"),
    categorie: "martialR", base: "pistol", degats: { des: "1d10", types: ["piercing"] },
    proprietes: ["amm", "lod", "spc"], maitrise: "vex", portee: [9, 27], munition: "firearmBullet", prix: [200, "gp"], poids: 4,
    texte: "Un pistolet trapu au canon évasé, assemblé à Baie-du-Butin avec des pièces de trois armes différentes et vendu « en l'état ». Il tire des **balles de fusil**.\n\n**Spécial.** Sur un 1 naturel au jet d'attaque, la poudre fuse par la culasse : vous subissez 1d4 dégâts de feu et l'arme ne peut plus tirer avant d'avoir été nettoyée (une action)."
  }),
  armeArsenal({
    cle: "arsenal-masse-de-tonnerre", nom: "Masse de tonnerre de Forgefer", img: icone("weapons/hammers/hammer-double-steel-embossed"),
    categorie: "martialM", base: "maul", degats: { des: "2d6", types: ["bludgeoning"] },
    proprietes: ["hvy", "two"], maitrise: "topple", prix: [10, "gp"], poids: 10,
    texte: "Une tête de marteau en acier de Forgefer grosse comme une enclume de voyage, sur un manche cerclé de bronze. Les clans des Barbe-de-Bronze racontent qu'un bon coup s'entend jusqu'au lac de Loch Modan."
  }),
  armeArsenal({
    cle: "arsenal-rapiere-de-lune-d-argent", nom: "Rapière de Lune-d'argent", img: icone("weapons/swords/shortsword-guard-gold-red"),
    categorie: "martialM", base: "rapier", degats: { des: "1d8", types: ["piercing"] },
    proprietes: ["fin"], maitrise: "vex", prix: [25, "gp"], poids: 2,
    texte: "Une lame fine et souple à la garde ajourée de feuilles d'or, l'arme de cour des magistères et des chevaliers de sang. Chaque touche ouvre la garde de l'adversaire pour le coup suivant."
  }),
  armeArsenal({
    cle: "arsenal-dague-de-fossoyeuse", nom: "Dague d'apothicaire de Fossoyeuse", img: icone("weapons/daggers/dagger-poisoned-curved-green"),
    categorie: "simpleM", base: "dagger", degats: { des: "1d4", types: ["piercing"] },
    proprietes: ["fin", "lgt", "thr"], maitrise: "nick", portee: [6, 18], prix: [4, "gp"], poids: 1,
    texte: "Une dague étroite dont la gouttière creuse peut recevoir une dose de poison sans qu'il coule. La Société royale des apothicaires en équipe ses agents de terrain. Enduire la lame d'un poison déjà préparé ne demande qu'une **action bonus**."
  }),
  armeArsenal({
    cle: "arsenal-gourdin-totemique", nom: "Gourdin totémique de Mulgore", img: icone("weapons/clubs/club-banded-brown"),
    categorie: "simpleM", base: "greatclub", degats: { des: "1d8", types: ["bludgeoning"] },
    proprietes: ["two"], maitrise: "push", prix: [1, "gp"], poids: 10,
    texte: "Un tronc de jeune chêne sculpté de visages d'ancêtres et cerclé de cuir de kodo. Les braves taurens le manient comme un bélier : on ne frappe pas l'ennemi, on l'écarte du troupeau."
  }),
  armeArsenal({
    cle: "arsenal-arc-long-de-quel-thalas", nom: "Arc long des Rôdeurs de Quel'Thalas", img: icone("weapons/bows/longbow-recurve-leather-red"),
    categorie: "martialR", base: "longbow", degats: { des: "1d8", types: ["piercing"] },
    proprietes: ["amm", "hvy", "two"], maitrise: "slow", portee: [45, 180], munition: "arrow", prix: [60, "gp"], poids: 2,
    texte: "Un arc à double courbure en bois de la forêt d'Éternelchant, laqué de rouge et d'or. Les Rôdeurs l'apprennent dès l'enfance ; ils disent qu'une flèche bien tirée n'arrête pas l'ennemi, elle le cloue sur place. Il tire des **flèches**."
  }),
  armeArsenal({
    cle: "arsenal-hachette-sombrelance", nom: "Hachette de lancer sombrelance", img: icone("weapons/axes/axe-tomahawk-jagged"),
    categorie: "simpleM", base: "handaxe", degats: { des: "1d6", types: ["slashing"] },
    proprietes: ["lgt", "thr"], maitrise: "vex", portee: [6, 18], prix: [5, "gp"], poids: 2,
    texte: "Un fer dentelé ligaturé sur un manche court et décoré de plumes. Les chasseurs de têtes sombrelance en portent toujours trois à la ceinture : la première fait se retourner, la deuxième fait reculer, la troisième fait tomber."
  }),
  armeArsenal({
    cle: "arsenal-pique-de-theramore", nom: "Pique du Guet de Theramore", img: icone("weapons/polearms/pike-flared-brown"),
    categorie: "martialM", base: "pike", degats: { des: "1d10", types: ["piercing"] },
    proprietes: ["hvy", "rch", "two"], maitrise: "push", prix: [5, "gp"], poids: 18,
    texte: "Une longue hampe de frêne et un fer en feuille de saule. Sur les quais de Theramore, le Guet en dresse un mur face aux marais : un assaillant qui touche la pointe est repoussé dans la vase."
  }),
  armeArsenal({
    cle: "arsenal-hallebarde-de-lordaeron", nom: "Hallebarde de la Garde de Lordaeron", img: icone("weapons/polearms/halberd-crescent-engraved-steel"),
    categorie: "martialM", base: "halberd", degats: { des: "1d10", types: ["slashing"] },
    proprietes: ["hvy", "rch", "two"], maitrise: "cleave", prix: [20, "gp"], poids: 6,
    texte: "Une hallebarde à croissant gravé, rescapée des armureries de la capitale tombée. Les derniers gardes de Lordaeron l'ont gardée pour la Croisade écarlate ou pour l'Aube d'argent : son large fer tranche un goule et emporte celle qui la suit."
  })
];

// ---------------------------------------------------------------- Armures et boucliers

const ARMURES = [
  equipementArsenal({
    cle: "arsenal-cuirasse-de-hurlevent", nom: "Cuirasse de la Garde de Hurlevent", img: icone("equipment/chest/breastplate-cuirass-steel-blue"),
    categorie: "medium", base: "breastplate", ca: 14, dexMax: 2, prix: [400, "gp"], poids: 20,
    texte: "Un plastron d'acier bleui frappé du lion d'or, porté sur une cotte légère. Assez souple pour les rondes du quartier des Mages, assez solide pour les escarmouches de la Marche de l'Ouest."
  }, "armure"),
  equipementArsenal({
    cle: "arsenal-cuir-des-sentinelles", nom: "Cuir clouté des Sentinelles", img: icone("equipment/chest/breastplate-banded-leather-purple"),
    categorie: "light", base: "studded", ca: 12, prix: [45, "gp"], poids: 13,
    texte: "Du cuir de sabre-de-nuit teint en violet sombre, renforcé de rivets d'argent et de plaques en forme de feuilles. Il ne fait aucun bruit sous la lune."
  }, "armure"),
  equipementArsenal({
    cle: "arsenal-maille-lamellee-de-forgefer", nom: "Maille lamellée de Forgefer", img: icone("equipment/chest/breastplate-banded-steel-studded"),
    categorie: "heavy", base: "splint", ca: 17, dexMax: 0, force: 15, discretion: true, prix: [200, "gp"], poids: 60,
    texte: "Des bandes d'acier rivetées sur une cotte de mailles serrée, taillées à la mesure d'un nain puis rallongées pour les autres peuples moyennant supplément. Chaque lame porte le poinçon de la forge royale."
  }, "armure"),
  equipementArsenal({
    cle: "arsenal-harnois-de-la-lumiere", nom: "Harnois de la Lumière", img: icone("equipment/chest/breastplate-layered-gold"),
    categorie: "heavy", base: "plate", ca: 18, dexMax: 0, force: 15, discretion: true, prix: [1500, "gp"], poids: 65,
    texte: "Un harnois complet aux épaulières dorées, forgé pour les paladins de l'Aube d'argent. Des prières sont gravées à l'intérieur du plastron, là où seul celui qui le porte peut les lire."
  }, "armure"),
  equipementArsenal({
    cle: "arsenal-peaux-de-kodo", nom: "Peaux de kodo tannées", img: icone("equipment/chest/breastplate-leather-brown-belted"),
    categorie: "medium", base: "hide", ca: 12, dexMax: 2, prix: [10, "gp"], poids: 12,
    texte: "Plusieurs épaisseurs de cuir de kodo cousues au tendon, telles que les portent les éclaireurs des Tarides. Lourdes, chaudes, et presque impossibles à percer d'une flèche tirée de loin."
  }, "armure"),
  equipementArsenal({
    cle: "arsenal-robe-de-bataille-du-kirin-tor", nom: "Robe de bataille du Kirin Tor", img: icone("equipment/chest/robe-layered-purple"),
    categorie: "light", base: "padded", ca: 11, discretion: true, prix: [15, "gp"], poids: 8,
    texte: "Une robe violette matelassée, doublée de feutre sous les broderies d'argent. Les apprentis de Dalaran la portent en mission : elle n'arrête pas grand-chose, mais elle bruisse à chaque pas."
  }, "armure"),
  equipementArsenal({
    cle: "arsenal-demi-plate-de-mithril", nom: "Demi-plate en mithril de Khaz Modan", img: icone("equipment/chest/breastplate-layered-steel-grey"),
    categorie: "medium", base: "halfplate", ca: 15, dexMax: 2, rarete: "uncommon", magique: true, prix: [800, "gp"], poids: 20,
    texte: "Des plaques de mithril aussi légères que du cuir, que les forgerons nains ne vendent qu'à leurs amis. Contrairement à une demi-plate ordinaire, elle **n'impose pas de désavantage** aux tests de Dextérité (Discrétion)."
  }, "armure"),
  equipementArsenal({
    cle: "arsenal-bouclier-kor-kron", nom: "Bouclier de guerre kor'kron", img: icone("equipment/shield/heater-steel-boss-red"),
    categorie: "shield", base: "shield", ca: 2, prix: [10, "gp"], poids: 6,
    texte: "Un écu d'acier noir à l'umbo pointu, peint du sceau rouge de la Horde. Les Kor'kron s'en servent autant pour frapper que pour parer."
  }, "armure")
];

// ---------------------------------------------------------------- Munitions (liées aux armes par leur sous-type)

const MUNITIONS = [
  munition({
    cle: "arsenal-balles-de-forgefer", nom: "Balles de plomb de Forgefer", img: icone("weapons/ammunition/shot-round-lead"),
    sousType: "firearmBullet", quantite: 10, prix: [3, "gp"], poids: 2,
    texte: "Dix balles de plomb coulées dans les moules de la guilde des fusiliers, avec leur charge de poudre noire dans des cornets de papier huilé."
  }),
  munition({
    cle: "arsenal-balles-d-argent-de-gilneas", nom: "Balles d'argent de Gilnéas", img: icone("weapons/ammunition/shot-round-silver"),
    sousType: "firearmBullet", argent: true, quantite: 10, prix: [103, "gp"], poids: 2,
    texte: "Dix balles coulées dans un alliage d'argent, gravées d'une croix par les chasseurs de Gilnéas. Elles sont **argentées** : elles passent les défenses des worgens et des créatures que seul l'argent blesse."
  }),
  munition({
    cle: "arsenal-carreaux-d-acier-gnomes", nom: "Carreaux d'acier gnomes", img: icone("weapons/ammunition/arrow-head-war"),
    sousType: "crossbowBolt", quantite: 20, prix: [1, "gp"], poids: 1.5,
    texte: "Vingt carreaux à empennage de cuivre, calibrés pour les chargeurs des arbalètes de Gnomeregan (et pour n'importe quelle autre arbalète)."
  }),
  munition({
    cle: "arsenal-carreaux-explosifs", nom: "Carreaux explosifs gobelins", img: icone("weapons/ammunition/explosive-charge-timer"),
    sousType: "crossbowBolt", quantite: 5, degats: { des: "1d6", types: ["fire"] }, prix: [25, "gp"], poids: 1.5,
    texte: "Cinq carreaux dont la pointe est une capsule de poudre gobeline. Un carreau qui touche explose et inflige **1d6 dégâts de feu** en plus des dégâts de l'arme. Un carreau qui manque explose quand même, quelque part."
  }),
  munition({
    cle: "arsenal-fleches-de-thorium", nom: "Flèches à pointe de thorium", img: icone("weapons/ammunition/arrowhead-glowing-blue"),
    sousType: "arrow", quantite: 10, bonus: 1, rarete: "uncommon", prix: [400, "gp"], poids: 1,
    texte: "Dix flèches à pointe de thorium, ce métal bleuté qu'on extrait des failles de Gangrebois et du Cratère d'Un'Goro. Elles sont **+1** au jet d'attaque et aux dégâts."
  }),
  munition({
    cle: "arsenal-fleches-incendiaires", nom: "Flèches incendiaires de Quel'Thalas", img: icone("weapons/ammunition/arrow-broadhead-glowing-orange"),
    sousType: "arrow", quantite: 10, degats: { des: "1d4", types: ["fire"] }, prix: [20, "gp"], poids: 1,
    texte: "Dix flèches dont la pointe est enveloppée d'étoupe enduite d'huile de mana. Elles s'enflamment à l'encoche et infligent **1d4 dégâts de feu** en plus des dégâts de l'arme."
  })
];

// ---------------------------------------------------------------- Prothèses et bricolages (équipement porté)

const PROTHESES = [
  equipementArsenal({
    cle: "arsenal-bras-mecanique-gnome", nom: "Bras mécanique gnome", img: icone("commodities/tech/claw-mechanical"),
    categorie: "wondrous", rarete: "uncommon", harmonisation: true, prix: [600, "gp"], poids: 8,
    texte: "Un bras de laiton, de pistons et de ressorts qui se fixe sur le moignon par un harnais de cuir. Il faut un **lien** (une heure de réglages) pour qu'il obéisse aux nerfs.\n\nTant qu'il est réglé, vous avez l'avantage aux tests de **Force (Athlétisme)**. Par une action, il peut frapper d'un **poing-piston** (attaque au corps à corps avec la Force, **1d8** dégâts contondants).",
    effets: [{ nom: "Bras mécanique gnome", changements: [["system.skills.ath.roll.mode", 1]] }],
    activites: [{ type: "attack", nom: "Poing-piston", portee: [1.5, "m"], cible: ["1", "creature"], attaque: { type: "melee", carac: "str", base: false }, degats: [{ des: "1d8", types: ["bludgeoning"] }] }]
  }, "prothese"),
  equipementArsenal({
    cle: "arsenal-oeil-lunette-gobelin", nom: "Œil-lunette gobelin", img: icone("equipment/head/goggles-brass-glass"),
    categorie: "wondrous", rarete: "uncommon", harmonisation: true, prix: [450, "gp"], poids: 0.2,
    texte: "Une lentille cerclée de cuivre, vissée sur l'orbite et munie d'une molette de mise au point. Il faut un **lien** pour l'accorder au regard. Tant qu'il est accordé, vous gagnez un bonus de **+2** aux tests de **Sagesse (Perception)** et vous voyez dans le noir jusqu'à **18 m**.",
    effets: [{ nom: "Œil-lunette gobelin", changements: [["system.skills.prc.roll.bonus", "2"], ["system.attributes.senses.ranges.darkvision", 18, "upgrade"]] }]
  }, "prothese"),
  equipementArsenal({
    cle: "arsenal-jambe-de-bois-ferree", nom: "Jambe de bois ferrée de Forgefer", img: icone("weapons/clubs/club-banded-steel"),
    categorie: "trinket", prix: [50, "gp"], poids: 6,
    texte: "Une jambe de chêne cerclée de fer, terminée par un embout à crampons que l'on visse ou dévisse selon le terrain. Un nain qui en porte une ne ralentit ni sur la neige ni sur la glace de Dun Morogh : vous **ignorez le terrain difficile dû à la neige et à la glace**.",
    effets: [{ nom: "Jambe de bois ferrée", changements: [["system.attributes.movement.ignoredDifficultTerrain", "snow"], ["system.attributes.movement.ignoredDifficultTerrain", "ice"]] }]
  }, "prothese"),
  equipementArsenal({
    cle: "arsenal-crochet-pince-gobelin", nom: "Crochet-pince gobelin", img: icone("weapons/fist/hook"),
    categorie: "trinket", prix: [15, "gp"], poids: 1,
    texte: "Un crochet d'acier qui s'ouvre en pince d'une pression du poignet, remplaçant bon marché d'une main perdue. Il mord comme une arme (attaque au corps à corps avec la Force, **1d4** dégâts perforants), mais il est maladroit : vous avez le désavantage aux tests de **Dextérité (Escamotage)**.",
    effets: [{ nom: "Crochet-pince gobelin", changements: [["system.skills.slt.roll.mode", -1]] }],
    activites: [{ type: "attack", nom: "Coup de crochet", portee: [1.5, "m"], cible: ["1", "creature"], attaque: { type: "melee", carac: "str", base: false }, degats: [{ des: "1d4", types: ["piercing"] }] }]
  }, "prothese"),
  equipementArsenal({
    cle: "arsenal-regulateur-cardiaque-gnome", nom: "Régulateur cardiaque gnome", img: icone("commodities/tech/coil-tesla"),
    categorie: "wondrous", rarete: "rare", harmonisation: true, prix: [2000, "gp"], poids: 1,
    texte: "Une bobine de cuivre et une pile arcanique logées sous le sternum, qui tapotent le cœur quand il hésite. Il faut un **lien** pour qu'elle suive son rythme. Vous avez l'avantage aux **jets de sauvegarde contre la mort**.\n\nUne fois par repos long, quand vous tombez à 0 point de vie sans être tué, la bobine décharge : vous récupérez **2d4 + 2** points de vie.",
    utilisations: { max: 1, periode: "lr" },
    effets: [{ nom: "Régulateur cardiaque", changements: [["system.attributes.death.roll.mode", 1]] }],
    activites: [{ type: "heal", nom: "Décharge de relance", activation: "special", condition: "Vous tombez à 0 point de vie sans être tué", cible: ["", "self"], soin: { des: "2d4", bonus: "2" } }]
  }, "prothese"),
  recharge(equipementArsenal({
    cle: "arsenal-bottes-fusees-gobelines", nom: "Bottes-fusées gobelines", img: icone("skills/movement/feet-bladed-boots-fire"),
    categorie: "wondrous", rarete: "uncommon", prix: [350, "gp"], poids: 3,
    texte: "Des bottes cloutées équipées de deux petites fusées au talon. Elles ont **3 charges**. Par une **action bonus**, vous en dépensez une : votre vitesse augmente de **6 m** pendant 1 minute. Elles regagnent **1d3** charges à l'aube.\n\n*Garantie : aucune. Sur un 1 au d6 lancé après usage, une fusée part seule et vous tombez à terre.*",
    utilisations: { max: 3, periode: "dawn" },
    effets: [{ nom: "Fusées allumées", transfert: false, duree: 60, changements: [["system.attributes.movement.speeds.walk", 6]] }],
    activites: [{ type: "utility", nom: "Allumer les fusées", activation: "bonus", duree: [1, "minute"], effets: [0] }]
  }, "prothese"), "1d3"),
  equipementArsenal({
    cle: "arsenal-masque-filtrant-gnome", nom: "Masque filtrant gnome", img: icone("equipment/head/goggles-mask-cloth-wrapped"),
    categorie: "wondrous", rarete: "uncommon", prix: [300, "gp"], poids: 1.5,
    texte: "Un masque de toile caoutchoutée, des lunettes et deux cartouches de charbon actif, conçu par les survivants de Gnomeregan pour retourner dans la cité irradiée. Tant que vous le portez, vous avez la **résistance aux dégâts de poison**.",
    effets: [{ nom: "Masque filtrant gnome", changements: [["system.traits.dr.value", "poison"]] }]
  }, "prothese")
];

// ---------------------------------------------------------------- Objets magiques peu communs et rares

const MAGIQUES = [
  recharge(equipementArsenal({
    cle: "arsenal-talisman-de-la-lumiere", nom: "Talisman de la Lumière", img: icone("equipment/neck/amulet-carved-stone-cross"),
    categorie: "wondrous", rarete: "uncommon", magique: true, harmonisation: true, prix: [500, "gp"], poids: 0,
    texte: "Un disque de pierre blanche gravé d'un soleil, béni à la cathédrale de Hurlevent. Tant que vous y êtes **lié**, vous avez la **résistance aux dégâts nécrotiques**.\n\nIl a **3 charges**. Par une **action bonus**, vous en dépensez une pour toucher une créature : elle récupère **2d4 + 2** points de vie. Il regagne **1d3** charges à l'aube.",
    utilisations: { max: 3, periode: "dawn" },
    effets: [{ nom: "Talisman de la Lumière", changements: [["system.traits.dr.value", "necrotic"]] }],
    activites: [{ type: "heal", nom: "Lumière salvatrice", activation: "bonus", portee: ["", "touch"], cible: ["1", "creature"], soin: { des: "2d4", bonus: "2" } }]
  }, "magique"), "1d3"),
  recharge(equipementArsenal({
    cle: "arsenal-totem-de-foudre", nom: "Totem de foudre", img: icone("commodities/treasure/totem-wooden-glowing-yellow"),
    categorie: "wondrous", rarete: "rare", magique: true, harmonisation: true, prix: [4000, "gp"], poids: 3,
    texte: "Un petit totem de bois sculpté de nuages, où un chaman a lié un esprit de l'air. Il faut un **lien** pour que l'esprit vous écoute.\n\nIl a **3 charges**. Par une **action**, vous en dépensez une et désignez un point à 18 m ou moins : la foudre y tombe. Chaque créature dans un rayon de 3 m fait un jet de sauvegarde de **Dextérité DD 15** ; elle subit **4d6** dégâts de foudre en cas d'échec, moitié moins en cas de réussite. Le totem regagne **1d3** charges à l'aube.",
    utilisations: { max: 3, periode: "dawn" },
    activites: [{
      type: "save", nom: "Appel de la foudre", portee: [18, "m"], gabarit: ["radius", 3], cible: ["", "creature"],
      sauvegarde: { carac: ["dex"], dd: 15, reussite: "half" }, degats: [{ des: "4d6", types: ["lightning"] }]
    }]
  }, "magique"), "1d3"),
  equipementArsenal({
    cle: "arsenal-eclat-de-gangrene", nom: "Éclat de gangrène", img: icone("weapons/wands/wand-carved-stone-shard"),
    categorie: "wondrous", rarete: "uncommon", magique: true, harmonisation: true, prix: [600, "gp"], poids: 0.5,
    texte: "Un éclat de cristal vert, tiède, arraché à une pierre de la Légion ardente. Il murmure dès qu'on le touche. Tant que vous y êtes **lié**, le **DD de sauvegarde de vos sorts** et vos **attaques de sort** gagnent **+1**.\n\nUne fois par repos long, par une **action**, vous pouvez libérer sa flamme sur une créature à 18 m ou moins : elle fait un jet de sauvegarde de **Dextérité DD 13** et subit **3d6** dégâts de feu en cas d'échec, moitié moins en cas de réussite.\n\n**Malédiction.** Une fois lié, vous ne pouvez pas rompre le lien de vous-même ; il faut une délivrance de malédiction. Tant que le lien dure, vous êtes **vulnérable aux dégâts radiants** et vous avez le **désavantage aux jets de sauvegarde de Sagesse**.",
    utilisations: { max: 1, periode: "lr" },
    effets: [{ nom: "Éclat de gangrène", changements: [
      ["system.bonuses.spell.dc", 1], ["system.rolls.attack.msak.bonus", "1"], ["system.rolls.attack.rsak.bonus", "1"],
      ["system.traits.dv.value", "radiant"], ["system.abilities.wis.save.roll.mode", -1]
    ] }],
    activites: [{
      type: "save", nom: "Flamme gangrenée", portee: [18, "m"], cible: ["1", "creature"],
      sauvegarde: { carac: ["dex"], dd: 13, reussite: "half" }, degats: [{ des: "3d6", types: ["fire"] }]
    }]
  }, "magique"),
  equipementArsenal({
    cle: "arsenal-voile-des-gardiennes", nom: "Voile des Gardiennes", img: icone("equipment/back/cloak-hooded-blue"),
    categorie: "wondrous", rarete: "uncommon", magique: true, harmonisation: true, prix: [800, "gp"], poids: 1,
    texte: "Un capuchon de soie sombre tissé pour les Gardiennes, les geôlières de la prison d'Illidan. Tant que vous y êtes **lié**, vous voyez dans le noir jusqu'à **18 m**.\n\nUne fois par jour, par une **action bonus**, vous rabattez le capuchon et devenez **invisible** pendant 1 minute ou jusqu'à ce que vous attaquiez. Le voile retrouve ce pouvoir à l'aube.",
    utilisations: { max: 1, periode: "dawn" },
    effets: [
      { nom: "Voile des Gardiennes", changements: [["system.attributes.senses.ranges.darkvision", 18, "upgrade"]] },
      { nom: "Fondu dans l'ombre", transfert: false, duree: 60, etats: ["invisible"] }
    ],
    activites: [{ type: "utility", nom: "Fondre dans l'ombre", activation: "bonus", duree: [1, "minute"], effets: [1] }]
  }, "magique"),
  equipementArsenal({
    cle: "arsenal-brassards-du-gladiateur", nom: "Brassards du gladiateur d'Orgrimmar", img: icone("equipment/wrist/bracer-armored-steel-worn"),
    categorie: "wondrous", rarete: "uncommon", magique: true, harmonisation: true, prix: [600, "gp"], poids: 1,
    texte: "Des brassards cabossés, gagnés dans l'arène de la Vallée de l'Honneur et jamais redressés. Tant que vous y êtes **lié**, vous gagnez **+1 à la classe d'armure** et **+1 aux jets d'initiative**.",
    effets: [{ nom: "Brassards du gladiateur", changements: [["system.attributes.ac.bonus", "1"], ["system.attributes.init.roll.bonus", "1"]] }]
  }, "magique"),
  equipementArsenal({
    cle: "arsenal-corne-de-guerre-de-la-horde", nom: "Corne de guerre de la Horde", img: icone("commodities/bones/horn-curved-brown"),
    categorie: "wondrous", rarete: "uncommon", magique: true, prix: [450, "gp"], poids: 2,
    texte: "Une corne de bélier cerclée de fer, où un shaman a enfermé le premier cri de guerre de Durotar. Une fois par jour, par une **action**, vous y soufflez : chaque allié dans un rayon de **9 m** qui l'entend gagne **2d6** points de vie temporaires. Elle retrouve sa voix à l'aube.",
    utilisations: { max: 1, periode: "dawn" },
    activites: [{ type: "heal", nom: "Sonner la charge", gabarit: ["radius", 9], cible: ["", "ally"], soin: { des: "2d6", type: "temphp" } }]
  }, "magique"),
  equipementArsenal({
    cle: "arsenal-larme-d-elune", nom: "Larme d'Élune", img: icone("commodities/gems/gem-faceted-teardrop-blue"),
    categorie: "wondrous", rarete: "rare", magique: true, harmonisation: true, prix: [3500, "gp"], poids: 0,
    texte: "Une perle d'eau de lune solidifiée, montée sur une chaîne d'argent. Tant que vous y êtes **lié**, vous gagnez **+1 à tous vos jets de sauvegarde**.\n\nUne fois par jour, par une **action**, vous appelez un rayon de lune sur un point à 36 m ou moins : chaque créature dans un cylindre de 1,5 m de rayon fait un jet de sauvegarde de **Constitution DD 15** et subit **2d10** dégâts radiants en cas d'échec, moitié moins en cas de réussite. La perle retrouve ce pouvoir à l'aube.",
    utilisations: { max: 1, periode: "dawn" },
    effets: [{ nom: "Larme d'Élune", changements: [["system.rolls.ability.save.bonus", "1"]] }],
    activites: [{
      type: "save", nom: "Rayon de lune", portee: [36, "m"], gabarit: ["cylinder", 1.5], cible: ["", "creature"],
      sauvegarde: { carac: ["con"], dd: 15, reussite: "half" }, degats: [{ des: "2d10", types: ["radiant"] }]
    }]
  }, "magique"),
  equipementArsenal({
    cle: "arsenal-poigne-de-forgefer", nom: "Poigne de Forgefer", img: icone("equipment/hand/gauntlet-armored-heavy-steel"),
    categorie: "wondrous", rarete: "uncommon", magique: true, harmonisation: true, prix: [700, "gp"], poids: 2,
    texte: "Des gantelets forgés dans la Grande Forge, dont les jointures portent les runes des Terrestres. Tant que vous y êtes **lié**, vous avez l'avantage aux **tests de Force** et vos attaques d'arme au corps à corps infligent **1** dégât de plus.",
    effets: [{ nom: "Poigne de Forgefer", changements: [["system.abilities.str.check.roll.mode", 1], ["system.rolls.damage.mwak.bonus", "1"]] }]
  }, "magique"),
  armeArsenal({
    cle: "arsenal-lame-de-givre-de-norfendre", nom: "Lame de givre de Norfendre", img: icone("weapons/swords/sword-guard-blue"),
    categorie: "martialM", base: "longsword", degats: { des: "1d8", types: ["slashing"] }, polyvalente: "1d10",
    proprietes: ["ver"], maitrise: "sap", bonus: 1, rarete: "rare", harmonisation: true, prix: [3000, "gp"], poids: 3,
    texte: "Une épée longue couverte de givre qui ne fond jamais, tirée des ruines d'une forteresse vrykule du Fjord Hurlant. C'est une **arme +1** qui nécessite un **lien**. Ses coups infligent **1d6 dégâts de froid** supplémentaires, et tant que vous y êtes lié, vous avez la **résistance aux dégâts de froid**.",
    effets: [{ nom: "Lame de givre", changements: [["system.traits.dr.value", "cold"]] }],
    activites: [{ type: "damage", nom: "Morsure du givre", activation: "", condition: "Une attaque avec la lame touche", portee: [1.5, "m"], cible: ["1", "creature"], degats: [{ des: "1d6", types: ["cold"] }], consomme: false }]
  }, "magique")
];

export const ARSENAL = [...ARMES, ...ARMURES, ...MUNITIONS, ...PROTHESES, ...MAGIQUES];

// Chaque arme à munitions trouve au moins une munition de son sous-type dans l'arsenal, et chaque munition sert.
for (const a of ARSENAL.filter(d => d.system.ammunition?.type)) {
  exiger(ARSENAL.some(m => m.system.type.value === "ammo" && m.system.type.subtype === a.system.ammunition.type),
    `${a.__cle} : aucune munition « ${a.system.ammunition.type} » dans l'arsenal`);
}
for (const m of ARSENAL.filter(d => d.system.type.value === "ammo")) {
  exiger(ARSENAL.some(a => a.system.ammunition?.type === m.system.type.subtype), `${m.__cle} : aucune arme de l'arsenal ne la tire`);
}
