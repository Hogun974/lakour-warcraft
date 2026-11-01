// Essais de l'arsenal d'Azeroth (contenu/arsenal.mjs) : chaque clé « system » appartient aux modèles de dnd5e 6.0.6,
// botte d'arme (weapon mastery) et propriétés existantes, munitions liées à leurs armes par le sous-type, charges et
// récupérations valides, effets actifs sur des clés réelles des acteurs 6.0 (jamais les clés « shim » dépréciées),
// identifiants uniques avec objets-azeroth.mjs, textes non vides. Le vérificateur est rejoué sur des copies mutées
// de l'arsenal, et les constructeurs refusent un contenu faux.  Aucun réseau.  Lancer : npm run essais
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ARSENAL, SOUS_TYPES_MUNITION, FAMILLES, armeArsenal, equipementArsenal, munition, recharge } from "../modules/lakour-warcraft/contenu/arsenal.mjs";
import { OBJETS } from "../modules/lakour-warcraft/contenu/objets-azeroth.mjs";
import { icone } from "../modules/lakour-warcraft/contenu/aides.mjs";
import { CARACTERISTIQUES, COMPETENCES, DOMMAGES, SOINS, ETATS } from "../modules/lakour-warcraft/contenu/objets.mjs";

const MODULE = "lakour-warcraft";

// ---------------------------------------------------------------- Clés de dnd5e 6.0.6 (dnd5e.mjs), recopiées ici
// pour que l'essai ne dépende pas des constructeurs qu'il contrôle.
const DND5E = {
  weaponTypes: ["simpleM", "simpleR", "martialM", "martialR", "natural", "improv", "siege"],
  weaponMasteries: ["cleave", "graze", "nick", "push", "sap", "slow", "topple", "vex"],
  weaponIds: ["battleaxe", "blowgun", "club", "dagger", "dart", "flail", "glaive", "greataxe", "greatclub", "greatsword", "halberd",
    "handaxe", "handcrossbow", "heavycrossbow", "javelin", "lance", "lightcrossbow", "lighthammer", "longbow", "longsword", "mace",
    "maul", "morningstar", "musket", "pike", "pistol", "quarterstaff", "rapier", "scimitar", "shortsword", "sickle", "spear",
    "shortbow", "sling", "trident", "warpick", "warhammer", "whip"],
  armorTypes: ["light", "medium", "heavy", "natural", "shield"],
  armorIds: ["breastplate", "chainmail", "chainshirt", "halfplate", "hide", "leather", "padded", "plate", "ringmail", "scalemail", "splint", "studded"],
  shieldIds: ["shield"],
  miscEquipmentTypes: ["clothing", "ring", "rod", "trinket", "vehicle", "wand", "wondrous"],
  consumableTypes: ["ammo", "potion", "poison", "food", "scroll", "wand", "rod", "trinket", "wondrous"],
  ammoSubtypes: ["arrow", "crossbowBolt", "energyCell", "firearmBullet", "slingBullet", "blowgunNeedle"],
  itemRarity: ["common", "uncommon", "rare", "veryRare", "legendary", "artifact"],
  attunementTypes: ["required", "optional"],
  currencies: ["pp", "gp", "ep", "sp", "cp"],
  limitedUsePeriods: ["lr", "sr", "day", "dawn", "dusk", "initiative", "turnStart", "turnEnd", "turn"],
  recoveryTypes: ["recoverAll", "loseAll", "formula"],
  difficultTerrainTypes: ["ice", "liquid", "plants", "rocks", "mud", "sand", "slope", "snow", "web"],
  // DND5E.validProperties ; pour les munitions, ConsumableData#validProperties ajoute « ret » et les propriétés physiques.
  validProperties: {
    weapon: ["ada", "amm", "fin", "fir", "foc", "hvy", "lgt", "lod", "mgc", "rch", "rel", "ret", "sil", "spc", "thr", "two", "ver"],
    equipment: ["ada", "foc", "mgc", "stealthDisadvantage"],
    consumable: ["mgc"],
    ammo: ["mgc", "ret", "ada", "sil"]
  },
  activityTypes: ["attack", "cast", "check", "damage", "enchant", "forward", "heal", "order", "save", "summon", "transform", "utility"]
};

// Clés d'effet actif reconnues sur un personnage dnd5e 6.0.6 (CommonTemplate, CreatureTemplate, CharacterData,
// AttributesFields, MovementField, SensesField, TraitsField). Les anciennes clés que dnd5e redirige
// (ActiveEffect5e.SHIM_FIELDS : attributes.movement.walk, bonuses.mwak.attack…) sont refusées.
const C = CARACTERISTIQUES.join("|"), S = COMPETENCES.join("|"), D20 = "(bonus|mode|min|max)";
const CLES_EFFET = [
  new RegExp(`^system\\.abilities\\.(${C})\\.(value|max)$`),
  new RegExp(`^system\\.abilities\\.(${C})\\.(check|save)\\.roll\\.${D20}$`),
  new RegExp(`^system\\.skills\\.(${S})\\.roll\\.${D20}$`),
  new RegExp(`^system\\.skills\\.(${S})\\.bonuses\\.passive$`),
  new RegExp(`^system\\.rolls\\.ability\\.(check|save|skill|tool)\\.${D20}$`),
  new RegExp(`^system\\.rolls\\.attack(\\.(mwak|rwak|msak|rsak))?\\.${D20}$`),
  /^system\.rolls\.damage\.(mwak|rwak|msak|rsak)\.bonus$/,
  /^system\.attributes\.ac\.(bonus|flat|min)$/,
  new RegExp(`^system\\.attributes\\.(init|concentration|death)\\.roll\\.${D20}$`),
  /^system\.attributes\.movement\.speeds\.(walk|burrow|climb|fly|jump|swim)$/,
  /^system\.attributes\.movement\.(bonus|ignoredDifficultTerrain)$/,
  /^system\.attributes\.senses\.ranges\.(darkvision|blindsight|tremorsense|truesight)$/,
  /^system\.attributes\.hp\.(bonuses\.(level|overall)|tempmax)$/,
  /^system\.traits\.(dr|di|dv|ci)\.value$/,
  /^system\.bonuses\.spell\.dc$/
];
const MODES_CHANGEMENT = ["add", "multiply", "override", "upgrade", "downgrade", "custom"];
const ICONES = new Set(readFileSync(new URL("../modules/lakour-mj-ia/outils/icones-foundry14.txt", import.meta.url), "utf8").split(/\r?\n/).filter(Boolean));
const texteDe = html => String(html ?? "").replace(/<[^>]+>/g, "").trim();

// Valeur d'un changement d'effet cohérente avec le champ visé.
function valeurInvalide(cle, valeur) {
  if (cle.endsWith(".roll.mode")) return ![1, -1].includes(valeur) && "mode d'avantage hors de -1 et 1";
  if (/\.traits\.d[riv]\.value$/.test(cle)) return !DOMMAGES.includes(valeur) && `type de dommages « ${valeur} » inconnu`;
  if (cle.endsWith(".traits.ci.value")) return !ETATS.includes(valeur) && `état « ${valeur} » inconnu`;
  if (cle.endsWith(".ignoredDifficultTerrain")) return !DND5E.difficultTerrainTypes.includes(valeur) && `terrain « ${valeur} » inconnu`;
  if (cle.includes(".senses.ranges.")) return !(Number.isInteger(valeur) && valeur > 0) && "portée de sens entière en mètres attendue";
  if (cle.includes(".movement.speeds.")) return !(Number.isFinite(valeur) && Math.abs(valeur / 1.5 - Math.round(valeur / 1.5)) < 1e-9) && "vitesse en mètres par pas de 1,5 m attendue";
  return !/^[+-]?\d+$/.test(String(valeur)) && `valeur « ${valeur} » : un nombre entier attendu`;
}

// ---------------------------------------------------------------- Vérificateur (aussi pour les mutations)
// Renvoie la liste des erreurs (vide si tout va bien), sur des documents d'objet tels que les fabrique arsenal.mjs.
function verifier(liste, autres = OBJETS) {
  const erreurs = [];
  const err = (d, m) => erreurs.push(`${d.name} : ${m}`);
  const munitions = liste.filter(d => d.type === "consumable" && d.system.type.value === "ammo");

  for (const d of liste) {
    const s = d.system;
    if (d.__pack !== "objets") err(d, `pack « ${d.__pack} » au lieu de « objets »`);
    if (!/^objets:arsenal-[a-z0-9-]+$/.test(d.__cle ?? "")) err(d, `clé « ${d.__cle} » hors de « objets:arsenal-… »`);
    if (d.flags?.[MODULE]?.cle !== d.__cle?.slice("objets:".length) || s.identifier !== d.flags?.[MODULE]?.cle) err(d, "clé, identifiant et drapeau divergent");
    if (!FAMILLES.includes(d.flags?.[MODULE]?.arsenal)) err(d, `famille d'arsenal « ${d.flags?.[MODULE]?.arsenal} » inconnue`);
    if (d._key !== `!items!${d._id}` || !/^[A-Za-z0-9]{16}$/.test(d._id)) err(d, "_id ou _key mal formé");
    if (!d.name?.trim()) err(d, "nom vide");
    if (texteDe(s.description?.value).length < 60) err(d, "description absente ou trop courte");
    if (!ICONES.has(d.img)) err(d, `icône « ${d.img} » absente de Foundry 14`);

    // Commun aux objets physiques
    if (s.rarity && !DND5E.itemRarity.includes(s.rarity)) err(d, `rareté « ${s.rarity} » inconnue`);
    if (s.attunement && !DND5E.attunementTypes.includes(s.attunement)) err(d, `harmonisation « ${s.attunement} » inconnue`);
    if (s.attunement === "required" && !s.rarity) err(d, "un objet à lien a une rareté");
    if (s.properties.includes("mgc") && !s.rarity) err(d, "un objet magique a une rareté");
    if (!DND5E.currencies.includes(s.price?.denomination) || !(s.price.value > 0)) err(d, "prix absent ou monnaie inconnue");
    if (s.weight?.units !== "lb" || !(s.weight.value >= 0)) err(d, "poids absent ou pas en livres (dnd5e convertit en kg)");

    if (d.type === "weapon") {
      if (!DND5E.weaponTypes.includes(s.type.value)) err(d, `type d'arme « ${s.type.value} » inconnu`);
      if (!DND5E.weaponIds.includes(s.type.baseItem)) err(d, `arme de base « ${s.type.baseItem} » inconnue`);
      if (!DND5E.weaponMasteries.includes(s.mastery)) err(d, `botte d'arme « ${s.mastery} » inconnue`);
      for (const p of s.properties) if (!DND5E.validProperties.weapon.includes(p)) err(d, `propriété d'arme « ${p} » inconnue`);
      for (const t of s.damage.base.types) if (!DOMMAGES.includes(t)) err(d, `type de dommages « ${t} » inconnu`);
      if (!s.damage.base.number || !s.damage.base.denomination) err(d, "dés de dégâts absents");
      if (s.properties.includes("ver") !== Boolean(s.damage.versatile.denomination)) err(d, "polyvalente et dé polyvalent vont ensemble");
      if (s.properties.includes("lgt") && s.properties.includes("hvy")) err(d, "une arme ne peut être légère et lourde");
      const distance = s.type.value.endsWith("R") || s.properties.includes("thr");
      if (distance && !(s.range.value > 0 && s.range.long >= s.range.value)) err(d, "arme à distance ou de jet sans portée");
      if (s.range.units !== "m") err(d, "portée pas en mètres");
      if (s.properties.includes("amm")) {
        if (!DND5E.ammoSubtypes.includes(s.ammunition?.type)) err(d, `munition « ${s.ammunition?.type} » inconnue`);
        else if (!munitions.some(m => m.system.type.subtype === s.ammunition.type)) err(d, `aucune munition « ${s.ammunition.type} » dans l'arsenal`);
      } else if (s.ammunition?.type) err(d, "munition sans la propriété « amm »");
      if (s.magicalBonus && !s.properties.includes("mgc")) err(d, "bonus magique sans la propriété « mgc »");
      if (!Object.values(s.activities).some(a => a.type === "attack")) err(d, "pas d'activité d'attaque");
    }

    if (d.type === "equipment") {
      const armure = DND5E.armorTypes.includes(s.type.value);
      if (!armure && !DND5E.miscEquipmentTypes.includes(s.type.value)) err(d, `type d'équipement « ${s.type.value} » inconnu`);
      for (const p of s.properties) if (!DND5E.validProperties.equipment.includes(p)) err(d, `propriété d'équipement « ${p} » inconnue`);
      if (armure) {
        const bases = s.type.value === "shield" ? DND5E.shieldIds : DND5E.armorIds;
        if (!bases.includes(s.type.baseItem)) err(d, `armure de base « ${s.type.baseItem} » inconnue`);
        if (!(s.armor.value > 0)) err(d, "CA manquante");
        if (s.type.value === "heavy" && s.armor.dex !== 0) err(d, "une armure lourde n'ajoute pas la Dextérité");
        if (s.type.value === "medium" && s.armor.dex !== 2) err(d, "une armure intermédiaire plafonne la Dextérité à 2");
      } else if (s.type.baseItem) err(d, `« ${s.type.baseItem} » : un objet porté n'a pas d'objet de base`);
    }

    if (d.type === "consumable") {
      if (!DND5E.consumableTypes.includes(s.type.value)) err(d, `type de consommable « ${s.type.value} » inconnu`);
      if (s.type.value === "ammo") {
        if (!DND5E.ammoSubtypes.includes(s.type.subtype)) err(d, `sous-type de munition « ${s.type.subtype} » inconnu`);
        else if (!liste.some(a => a.type === "weapon" && a.system.ammunition?.type === s.type.subtype)) err(d, "aucune arme de l'arsenal ne la tire");
        for (const p of s.properties) if (!DND5E.validProperties.ammo.includes(p)) err(d, `propriété de munition « ${p} » inconnue`);
        if (!(s.quantity >= 1)) err(d, "lot de munitions vide");
        if (s.uses.autoDestroy || s.uses.max) err(d, "une munition se décompte par sa quantité, pas par des charges");
        if (s.damage.replace) err(d, "les dégâts de la munition s'ajoutent à ceux de l'arme");
        for (const t of s.damage.base.types) if (!DOMMAGES.includes(t)) err(d, `type de dommages « ${t} » inconnu`);
        if (s.damage.base.types.length && !s.damage.base.denomination) err(d, "dégâts de munition sans dés");
      } else for (const p of s.properties) if (!DND5E.validProperties.consumable.includes(p)) err(d, `propriété « ${p} » inconnue`);
      if (s.magicalBonus && !s.properties.includes("mgc")) err(d, "bonus magique sans la propriété « mgc »");
    }

    // Charges
    for (const r of s.uses?.recovery ?? []) {
      if (!DND5E.limitedUsePeriods.includes(r.period)) err(d, `période de récupération « ${r.period} » inconnue`);
      if (!DND5E.recoveryTypes.includes(r.type)) err(d, `type de récupération « ${r.type} » inconnu`);
      if (r.type === "formula" && !/^\d+(d\d+)?([+-]\d+)?$/.test(r.formula ?? "")) err(d, `formule de récupération « ${r.formula} » invalide`);
    }
    if (s.uses?.max && !(s.uses.recovery ?? []).length && d.type !== "consumable") err(d, "des charges qui ne reviennent jamais");

    // Effets actifs
    for (const e of d.effects ?? []) {
      if (e._key !== `!items.effects!${d._id}.${e._id}`) err(d, `clé d'effet « ${e._key} » incorrecte`);
      for (const st of e.statuses ?? []) if (!ETATS.includes(st)) err(d, `état « ${st} » inconnu`);
      if (!e.system.changes.length && !(e.statuses ?? []).length) err(d, `effet « ${e.name} » sans changement ni état`);
      for (const c of e.system.changes) {
        if (!CLES_EFFET.some(r => r.test(c.key))) err(d, `clé d'effet « ${c.key} » inconnue de dnd5e 6.0.6`);
        if (!MODES_CHANGEMENT.includes(c.type) || c.phase !== "initial") err(d, `changement « ${c.key} » sans mode ni phase`);
        const pb = valeurInvalide(c.key, c.value);
        if (pb) err(d, `« ${c.key} » : ${pb}`);
      }
      if (!e.transfer && !Object.values(s.activities).some(a => a.effects.some(x => x._id === e._id))) err(d, `effet « ${e.name} » ni transféré ni appliqué par une activité`);
    }

    // Activités
    for (const a of Object.values(s.activities ?? {})) {
      if (!DND5E.activityTypes.includes(a.type)) err(d, `type d'activité « ${a.type} » inconnu`);
      for (const p of a.damage?.parts ?? []) for (const t of p.types) if (!DOMMAGES.includes(t)) err(d, `type de dommages « ${t} » inconnu`);
      for (const t of a.healing?.types ?? []) if (!SOINS.includes(t)) err(d, `type de soin « ${t} » inconnu`);
      for (const c of a.save?.ability ?? []) if (!CARACTERISTIQUES.includes(c)) err(d, `sauvegarde de « ${c} » inconnue`);
      if (a.attack?.ability && !CARACTERISTIQUES.includes(a.attack.ability)) err(d, `attaque de « ${a.attack.ability} » inconnue`);
      for (const e of a.effects ?? []) if (!(d.effects ?? []).some(x => x._id === e._id)) err(d, `l'activité cite un effet absent (${e._id})`);
      for (const t of a.consumption?.targets ?? []) if (t.type === "itemUses" && !s.uses?.max) err(d, "l'activité consomme des charges que l'objet n'a pas");
      if (a.range?.units && !["self", "touch", "m", "km", "spec", "any", ""].includes(a.range.units)) err(d, `portée « ${a.range.units} » pas en mètres`);
    }
  }

  // Unicité : clés, identifiants et noms, entre eux et avec les objets d'Azeroth du même pack.
  for (const [quoi, f] of [["clé", d => d.__cle], ["identifiant", d => d._id], ["nom", d => d.name]]) {
    const vus = new Map(autres.map(d => [f(d), "objets-azeroth"]));
    for (const d of liste) {
      if (vus.has(f(d))) erreurs.push(`${d.name} : ${quoi} « ${f(d)} » en double (${vus.get(f(d))})`);
      vus.set(f(d), "arsenal");
    }
  }
  const effets = liste.flatMap(d => (d.effects ?? []).map(e => e._key));
  if (new Set(effets).size !== effets.length) erreurs.push("clés d'effet en double");
  return erreurs;
}

const famille = f => ARSENAL.filter(d => d.flags[MODULE].arsenal === f);

// ---------------------------------------------------------------- L'arsenal

test("l'arsenal passe toutes les vérifications dnd5e 6.0.6", () => {
  assert.deepEqual(verifier(ARSENAL), []);
});

test("une quarantaine d'objets, dans les cinq familles de l'arsenal", () => {
  assert.ok(ARSENAL.length >= 38 && ARSENAL.length <= 48, `${ARSENAL.length} objets`);
  const nombres = Object.fromEntries(FAMILLES.map(f => [f, famille(f).length]));
  assert.ok(nombres.arme >= 12, `armes : ${nombres.arme}`);
  assert.ok(nombres.armure >= 8, `armures : ${nombres.armure}`);
  assert.ok(nombres.munition >= 5, `munitions : ${nombres.munition}`);
  assert.ok(nombres.prothese >= 6, `prothèses : ${nombres.prothese}`);
  assert.ok(nombres.magique >= 9, `objets magiques : ${nombres.magique}`);
  assert.ok(ARSENAL.every(d => d.__pack === "objets"));
});

test("les armes couvrent toutes les bottes d'arme 2024 et les deux catégories de maîtrise", () => {
  const armes = ARSENAL.filter(d => d.type === "weapon");
  for (const m of DND5E.weaponMasteries) assert.ok(armes.some(a => a.system.mastery === m), `aucune arme « ${m} »`);
  for (const t of ["simpleM", "martialM", "martialR"]) assert.ok(armes.some(a => a.system.type.value === t), `aucune arme ${t}`);
  assert.ok(armes.filter(a => a.system.properties.includes("rch")).length >= 2, "pas assez d'armes d'allonge");
});

test("chaque arme à munitions a sa munition, et chaque munition son arme", () => {
  const tirees = new Set(ARSENAL.filter(d => d.system.ammunition?.type).map(d => d.system.ammunition.type));
  const fournies = new Set(famille("munition").map(m => m.system.type.subtype));
  assert.deepEqual(tirees, fournies);
  assert.ok(tirees.size >= 3, "flèches, carreaux et balles");
  for (const m of famille("munition")) assert.ok(SOUS_TYPES_MUNITION.includes(m.system.type.subtype));
  assert.ok(famille("munition").some(m => m.system.damage.base.denomination), "aucune munition à dégâts ajoutés");
  assert.ok(famille("munition").some(m => m.system.properties.includes("sil")), "aucune munition argentée");
  assert.ok(famille("munition").some(m => m.system.magicalBonus && m.system.properties.includes("mgc")), "aucune munition +1");
});

test("les prothèses sont portées, et chacune agit par un effet actif ou une activité", () => {
  for (const p of famille("prothese")) {
    assert.equal(p.type, "equipment", p.name);
    assert.ok(p.effects.some(e => e.transfer) || Object.keys(p.system.activities).length, `${p.name} : rien d'automatisé`);
  }
  assert.ok(famille("prothese").filter(p => p.system.attunement === "required").length >= 2, "pas assez de prothèses à régler (lien)");
});

test("les objets magiques ont un lien, un effet ou des charges qui reviennent", () => {
  const magiques = famille("magique");
  assert.ok(magiques.every(m => m.system.properties.includes("mgc")), "objet magique sans « mgc »");
  assert.ok(magiques.filter(m => m.system.attunement === "required").length >= 7);
  assert.ok(magiques.filter(m => m.system.rarity === "rare").length >= 2, "pas assez d'objets rares");
  assert.ok(magiques.filter(m => m.system.uses.recovery.some(r => r.period === "dawn" && r.type === "formula")).length >= 2, "pas de charges rechargées à l'aube");
  const eclat = magiques.find(m => m.flags[MODULE].cle === "arsenal-eclat-de-gangrene");
  const changements = eclat.effects.flatMap(e => e.system.changes.map(c => c.key));
  assert.ok(changements.includes("system.traits.dv.value") && changements.includes("system.abilities.wis.save.roll.mode"), "la malédiction de l'éclat n'est pas automatisée");
  for (const m of magiques) assert.ok(m.effects.length || Object.keys(m.system.activities).length > (m.type === "weapon" ? 1 : 0), `${m.name} : rien d'automatisé`);
});

test("les activités qui consomment des charges appartiennent à des objets qui en ont", () => {
  for (const d of ARSENAL.filter(x => x.system.uses?.max && x.type !== "consumable")) {
    assert.ok(Object.values(d.system.activities).some(a => a.consumption.targets.some(t => t.type === "itemUses")), `${d.name} : charges jamais dépensées`);
  }
});

// ---------------------------------------------------------------- Mutations : le vérificateur repère un arsenal faussé

const MUTATIONS = [
  ["botte d'arme inconnue", /botte d'arme « tranche »/, l => { l.find(d => d.type === "weapon").system.mastery = "tranche"; }],
  ["propriété d'arme inconnue", /propriété d'arme « lourde »/, l => { l.find(d => d.type === "weapon").system.properties.push("lourde"); }],
  ["arme de base inconnue", /arme de base « epee »/, l => { l.find(d => d.type === "weapon").system.type.baseItem = "epee"; }],
  ["munition orpheline", /aucune munition « slingBullet »/, l => { l.find(d => d.system.ammunition?.type).system.ammunition.type = "slingBullet"; }],
  ["munition sans « amm »", /munition sans la propriété « amm »/, l => { const a = l.find(d => d.system.ammunition?.type); a.system.properties = a.system.properties.filter(p => p !== "amm"); }],
  ["munition qui ne sert à rien", /aucune arme de l'arsenal ne la tire/, l => { l.find(d => d.system.type.value === "ammo").system.type.subtype = "blowgunNeedle"; }],
  ["propriété de munition non physique", /propriété de munition « fin »/, l => { l.find(d => d.system.type.value === "ammo").system.properties.push("fin"); }],
  ["clé d'effet inventée", /clé d'effet « system\.skills\.ath\.bonus »/, l => { l.find(d => d.effects.length).effects[0].system.changes[0].key = "system.skills.ath.bonus"; }],
  ["clé d'effet dépréciée (shim)", /clé d'effet « system\.attributes\.movement\.walk »/, l => { l.find(d => d.effects.some(e => e.system.changes.some(c => c.key.includes("speeds.walk")))).effects[0].system.changes[0].key = "system.attributes.movement.walk"; }],
  ["résistance à un dommage inconnu", /type de dommages « givre »/, l => { l.find(d => d.effects.some(e => e.system.changes.some(c => c.key === "system.traits.dr.value"))).effects.find(e => e.system.changes.some(c => c.key === "system.traits.dr.value")).system.changes.find(c => c.key === "system.traits.dr.value").value = "givre"; }],
  ["avantage mal codé", /mode d'avantage hors de -1 et 1/, l => { const c = l.flatMap(d => d.effects.flatMap(e => e.system.changes)).find(x => x.key.endsWith(".roll.mode")); c.value = 2; }],
  ["vision en pieds", /portée de sens entière/, l => { const c = l.flatMap(d => d.effects.flatMap(e => e.system.changes)).find(x => x.key.includes("senses.ranges")); c.value = 1.5; }],
  ["recharge sans période connue", /période de récupération « aube »/, l => { l.find(d => d.system.uses?.recovery?.length).system.uses.recovery[0].period = "aube"; }],
  ["recharge à formule vide", /formule de récupération « +» invalide/, l => { l.find(d => d.system.uses?.recovery?.some(r => r.type === "formula")).system.uses.recovery[0].formula = ""; }],
  ["lien sans rareté", /un objet à lien a une rareté/, l => { const d = l.find(x => x.system.attunement === "required"); d.system.rarity = ""; }],
  ["harmonisation inconnue", /harmonisation « oui »/, l => { l.find(d => d.type === "equipment").system.attunement = "oui"; }],
  ["armure sans CA", /CA manquante/, l => { l.find(d => d.system.type?.value === "heavy").system.armor.value = 0; }],
  ["armure de base inconnue", /armure de base « cuirasse »/, l => { l.find(d => d.system.type?.value === "medium").system.type.baseItem = "cuirasse"; }],
  ["poids en kilos", /pas en livres/, l => { l[0].system.weight.units = "kg"; }],
  ["texte vide", /description absente/, l => { l[0].system.description.value = "<p></p>"; }],
  ["icône inexistante", /icône « icons\/inconnue\.webp »/, l => { l[0].img = "icons/inconnue.webp"; }],
  ["clé hors de l'arsenal", /clé « objets:hache »/, l => { l[0].__cle = "objets:hache"; }],
  ["identifiant d'un objet d'Azeroth", /identifiant « .{16} » en double \(objets-azeroth\)/, l => { l[0]._id = OBJETS[0]._id; l[0]._key = `!items!${OBJETS[0]._id}`; }],
  ["nom d'un objet d'Azeroth", /nom « Pierre de foyer » en double/, l => { l[1].name = "Pierre de foyer"; }],
  ["effet cité absent", /l'activité cite un effet absent/, l => { const d = l.find(x => Object.values(x.system.activities).some(a => a.effects.length)); Object.values(d.system.activities).find(a => a.effects.length).effects[0]._id = "AAAAAAAAAAAAAAAA"; }],
  ["état inconnu", /état « invisibilite »/, l => { l.find(d => d.effects.some(e => e.statuses.length)).effects.find(e => e.statuses.length).statuses = ["invisibilite"]; }],
  ["soin d'un type inconnu", /type de soin « mana »/, l => { Object.values(l.find(d => Object.values(d.system.activities).some(a => a.healing)).system.activities).find(a => a.healing).healing.types = ["mana"]; }]
];

for (const [nom, motif, muter] of MUTATIONS) {
  test(`mutation repérée : ${nom}`, () => {
    const copie = structuredClone(ARSENAL);
    muter(copie);
    const erreurs = verifier(copie);
    assert.ok(erreurs.some(e => motif.test(e)), `non détecté (${motif}) ; erreurs : ${erreurs.join(" | ") || "aucune"}`);
  });
}

// ---------------------------------------------------------------- Mutations : les constructeurs refusent un contenu faux

test("les constructeurs de l'arsenal refusent un contenu faux dès la construction", () => {
  const img = icone("svg/mystery-man");
  const fusil = { cle: "arsenal-essai", nom: "Essai", img, categorie: "martialR", degats: { des: "1d10", types: ["piercing"] }, proprietes: ["amm", "lod"], maitrise: "vex", portee: [9, 27], munition: "firearmBullet" };
  assert.doesNotThrow(() => armeArsenal(fusil));
  assert.throws(() => armeArsenal({ ...fusil, cle: "essai" }), /préfixe « arsenal- »/);
  assert.throws(() => armeArsenal({ ...fusil, munition: "balle" }), /sous-type de munition « balle »/);
  assert.throws(() => armeArsenal({ ...fusil, munition: undefined }), /« amm » et la munition vont ensemble/);
  assert.throws(() => armeArsenal({ ...fusil, proprietes: ["lod"] }), /« amm » et la munition vont ensemble/);
  assert.throws(() => armeArsenal({ ...fusil, maitrise: undefined }), /botte d'arme/);
  assert.throws(() => armeArsenal({ ...fusil, maitrise: "tranche" }), /botte d'arme « tranche »/);
  assert.throws(() => armeArsenal(fusil, "relique"), /famille d'arsenal « relique »/);

  const balles = { cle: "arsenal-essai-balles", nom: "Balles", img, sousType: "firearmBullet", quantite: 10, prix: [3, "gp"], poids: 2 };
  assert.doesNotThrow(() => munition(balles));
  assert.throws(() => munition({ ...balles, sousType: "balle" }), /sous-type de munition « balle »/);
  assert.throws(() => munition({ ...balles, degats: { des: "1d6", types: ["feu"] } }), /type de dommages « feu »/);
  assert.throws(() => munition({ ...balles, degats: { des: "un dé", types: ["fire"] } }), /dés de dégâts/);
  assert.throws(() => munition({ ...balles, rarete: "epique" }), /rareté « epique »/);

  const bottes = { cle: "arsenal-essai-bottes", nom: "Bottes", img, categorie: "wondrous", utilisations: { max: 3, periode: "dawn" }, activites: [{ type: "utility" }] };
  assert.doesNotThrow(() => recharge(equipementArsenal(bottes, "prothese"), "1d3"));
  assert.throws(() => recharge(equipementArsenal({ ...bottes, utilisations: undefined }, "prothese"), "1d3"), /recharge sans charges/);
  assert.throws(() => recharge(equipementArsenal(bottes, "prothese"), "un peu"), /formule de recharge « un peu »/);
  assert.throws(() => equipementArsenal({ ...bottes, utilisations: { max: 3, periode: "aube" } }, "prothese"), /période de récupération « aube »/);
  assert.throws(() => equipementArsenal({ ...bottes, categorie: "amulette" }, "magique"), /type d'équipement « amulette »/);
  assert.throws(() => equipementArsenal({ ...bottes, effets: [{ nom: "x", etats: ["invisibilite"] }] }, "magique"), /état « invisibilite »/);
});
