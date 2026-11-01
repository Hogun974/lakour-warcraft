// Icônes peintes des capacités des PNJ d'aventure et de campagne (contenu/aventure.mjs, contenu/campagne.mjs) :
// clé du PNJ -> nom de la capacité (sans suffixe de recharge ni d'usages) -> icône du cœur de Foundry 14. Lues par pnj()
// (contenu/acteurs.mjs) quand la capacité ne donne pas son propre img ; une capacité absente du PNJ y lève une erreur.
// Chaque icône est différente des autres et de celles du bestiaire (essais/warcraft-icones-pnj.test.mjs) ; icone()
// lève une erreur si le chemin n'est pas dans modules/lakour-mj-ia/outils/icones-foundry14.txt.
import { icone } from "./aides.mjs";

const TABLE = {
  // ---------- Aventure : la caravane des Tarides
  "grizzla-tordeboulon": {
    "Protégée du Cartel": "commodities/currency/coins-plain-stack-gold",
    "Pistolet de poche": "weapons/guns/gun-pistol-brass",
    "Affaire conclue": "skills/social/theft-pickpocket-bribery-brown"
  },
  "hanuk-pas-de-pluie": {
    "Massue-totem": "weapons/clubs/club-banded-brown",
    "Piétinement de guerre": "magic/sonic/explosion-impact-shock-wave",
    "Guide des Tarides": "tools/navigation/map-marked-brown"
  },
  "grommel-defense-grise": {
    "Bâton d'épines": "weapons/staves/staff-vines-green",
    "Éclat de terre": "magic/earth/projectile-spiked-stone-boulder-brown",
    "Ronces jaillissantes": "magic/nature/root-vine-thorned-coil-green"
  },
  "gorra-fiel-d-epine": {
    "Peau d'épines": "magic/nature/vines-thorned-curled-green",
    "Gorgée de gangrène": "skills/toxins/poison-bottle-corked-fire-green",
    "Attaques multiples": "skills/melee/strike-axe-red",
    "Hache à épines": "weapons/axes/axe-broad-jagged",
    "Javeline": "weapons/polearms/spear-simple-stone-green",
    "Rugissement de la cheffe": "creatures/abilities/lion-roar-yellow"
  },
  "drogha-cendrelame": {
    "Incantation": "magic/symbols/runes-star-pentagon-orange",
    "Lame ardente": "weapons/swords/sword-flamberge",
    "Trait de gangrefeu": "magic/fire/projectile-fireball-green",
    "Immolation": "magic/fire/flame-burning-earth-yellow",
    "Pacte de cendre": "magic/fire/flame-burning-skeleton-explosion"
  },
  "ezzavel": {
    "Résistance à la magie": "magic/defensive/shield-barrier-glowing-triangle-magenta",
    "Attaques multiples": "skills/melee/weapons-crossed-daggers-orange",
    "Dague gangrenée": "magic/fire/dagger-rune-enchant-flame-strong-green",
    "Sabots": "commodities/bones/hooves-cloven-grey",
    "Air de discorde": "tools/instruments/flute-simple-wood"
  },
  // ---------- Campagne : la Fournaise
  "vizzik-tirelire": {
    "Fusée de secours": "weapons/thrown/rocket",
    "Clé à molette": "tools/hand/wrench-adjustable",
    "Pistolet à éclat": "weapons/guns/gun-pistol-brown",
    "Grenade de chantier": "skills/ranged/bomb-grenade-thrown-orange",
    "Coup de sifflet": "tools/instruments/whistle-copper"
  },
  "dechiqueteur-fonderie": {
    "Moteur à éclat": "commodities/tech/engine-tech-thrust-green",
    "Attaques multiples": "tools/hand/chainsaw-steel-purple",
    "Scie": "environment/traps/saw-mechanical-toothed-steel-red",
    "Jet de vapeur": "magic/air/fog-gas-smoke-dense-white"
  },
  "aelyra-ombrefeuille": {
    "Fille de la nuit": "magic/perception/shadow-stealth-eyes-purple",
    "Attaques multiples": "skills/ranged/person-archery-bow-attack-gray",
    "Lame de guerre": "weapons/polearms/glaive-hooked-steel",
    "Arc long": "weapons/bows/longbow-leather-green"
  },
  "sssthera": {
    "Amphibie": "magic/water/bubbles-air-water-light",
    "Incantation": "magic/water/orb-water-bubbles-blue",
    "Attaques multiples": "skills/melee/spear-tips-three-purple",
    "Trident": "weapons/polearms/trident-jeweled-purple",
    "Queue": "commodities/biological/tail-scaled-green",
    "Trait des abysses": "magic/water/projectile-water-ice-orb",
    "Chant des marées": "magic/sonic/projectile-sound-rings-wave"
  },
  "corwen-haldis": {
    "Vieux soldat": "commodities/treasure/medal-ribbon-gold-blue",
    "Attaques multiples": "skills/melee/strikes-sword-triple-gray",
    "Épée longue": "weapons/swords/sword-guard-blue",
    "Arbalète lourde": "weapons/crossbows/crossbow-heavy",
    "Parade": "skills/melee/swords-parry-block-yellow"
  },
  "garrok-brise-dent": {
    "Attaques multiples": "skills/melee/hand-grip-axe-strike-orange",
    "Hache de guerre": "weapons/axes/axe-battle-heavy-black",
    "Javeline": "weapons/polearms/javelin",
    "Cri de ralliement": "sundries/flags/banner-standard-tattered-red"
  },
  "iselle-marchebrume": {
    "Deux visages": "magic/symbols/mask-yellow-orange",
    "Incantation": "sundries/books/book-open-purple",
    "Dague empoisonnée": "weapons/daggers/dagger-poisoned",
    "Trait de gangrefeu": "magic/fire/projectile-fireball-smoke-green",
    "Mot de discorde": "magic/control/hypnosis-mesmerism-swirl"
  },
  "drogha-embrase": {
    "Incantation": "magic/unholy/hands-praying-fire-green",
    "Corps embrasé": "magic/fire/elemental-fire-humanoid",
    "Attaques multiples": "skills/melee/strike-sword-dagger-runes-red",
    "Lame ardente": "weapons/swords/greatsword-flamberge",
    "Trait de gangrefeu": "magic/unholy/projectile-fireball-green",
    "Immolation": "magic/fire/blast-jet-stream-embers-orange",
    "Pacte de cendre": "magic/fire/flame-burning-creature-skeleton"
  },
  "infernal-brasegouffre": {
    "Résistance à la magie": "magic/symbols/runes-carved-stone-green",
    "Aura de gangrefeu": "magic/fire/barrier-wall-flame-ring-yellow",
    "Chute de météore": "magic/earth/explosion-lava-stone-green",
    "Attaques multiples": "magic/earth/strike-body-stone-crumble",
    "Poing de pierre": "magic/fire/flame-burning-fist-strike"
  },
  "cultiste-lame-ardente": {
    "Fanatisme": "magic/unholy/silhouette-robe-evil-glow",
    "Lame courbe": "weapons/swords/scimitar-broad",
    "Fléchette": "weapons/thrown/dart-feathered"
  },
  "fanatique-lame-ardente": {
    "Incantation": "magic/symbols/runes-triangle-orange",
    "Attaques multiples": "skills/melee/maneuver-daggers-paired-orange",
    "Dague rituelle": "weapons/daggers/dagger-ritual-brown",
    "Flamme corrompue": "magic/fire/projectile-fireball-orange-green"
  },
  "diablotin": {
    "Résistance à la magie": "magic/defensive/shield-barrier-flaming-pentagon-red",
    "Griffes": "creatures/claws/claw-hooked-curved",
    "Trait de feu": "magic/fire/projectile-fireball-orange",
    "Invisibilité": "magic/perception/silhouette-stealth-shadow"
  }
};

export const ICONES_PNJ = Object.fromEntries(Object.entries(TABLE).map(([cle, capacites]) =>
  [cle, Object.fromEntries(Object.entries(capacites).map(([nom, chemin]) => [nom, icone(`icons/${chemin}.webp`)]))]));
