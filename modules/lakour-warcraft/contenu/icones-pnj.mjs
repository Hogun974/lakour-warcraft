// Icônes peintes des capacités des PNJ d'aventure, de campagne, du one-shot et des suppléments (contenu/aventure.mjs, campagne.mjs,
// one-shot.mjs, donjon.mjs, montures.mjs, rares.mjs) :
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
  },
  // ---------- One-shot : une nuit aux Deux Lanternes
  "hilde-brunval": {
    "Maîtresse de maison": "sundries/lights/lantern-iron-lit-yellow",
    "Hachoir": "tools/cooking/knife-cleaver-steel-grey",
    "Arbalète légère": "weapons/crossbows/crossbow-simple-brown",
    "Voix de sergente": "magic/sonic/explosion-shock-sound-wave"
  },
  "durgan-brise-fers": {
    "Plus jamais de chaînes": "magic/control/debuff-chains-shackle-movement-red",
    "Attaques multiples": "magic/control/buff-strength-muscle-damage",
    "Hache de bûcheron": "weapons/axes/axe-broad-worn",
    "Chaîne brisée": "commodities/metal/chain-steel"
  },
  "vesper-lacombe": {
    "Volonté des Réprouvés": "magic/death/hand-withered-gray",
    "Rancune": "magic/death/skull-humanoid-white-red",
    "Couteau de boulangère": "tools/cooking/knife-chef-steel-brown",
    "Arbalète de poing": "weapons/crossbows/crossbow-simple-black"
  },
  "aldwin-crayeval": {
    "Bon docteur": "tools/medical/medkit-white-red",
    "Incantation": "sundries/books/book-symbol-skull-grey",
    "Scalpel": "tools/hand/knife-paring",
    "Rayon de peste": "magic/unholy/projectile-smoke-tendril-green",
    "Fiole de mouches": "skills/wounds/illness-disease-glowing-green",
    "Chair servile": "magic/control/control-influence-puppet"
  },
  // ---------- Donjon : la Raffinerie de Mèche-Noire (boss à actions légendaires)
  "grokka-deux-cles": {
    "Résistance légendaire": "magic/defensive/shield-barrier-deflect-gold",
    "Attaques multiples": "skills/melee/strike-hammer-destructive-blue",
    "Clé à tube": "tools/hand/wrench-adjustable-toothed",
    "Boulon lancé": "tools/hand/hammer-and-nail",
    "Pluie de rivets": "magic/earth/projectile-moonrock-asteroid",
    "Phase 2 — Tuyau arraché": "commodities/tech/pipe-exhaust-vent-brass",
    "Pas lourd": "skills/movement/feet-spurred-boots-brown",
    "Revers de clé": "tools/hand/wrench-double",
    "Coup de sifflet": "tools/instruments/whistle-sports",
    "Wagonnet fou": "commodities/stone/ore-chunk-copper-orange"
  },
  "mere-brasier": {
    "Résistance légendaire": "magic/fire/barrier-shield-explosion-yellow",
    "Forme de feu": "magic/fire/elemental-creature-horse",
    "Enchaînée à la chaudière": "magic/control/debuff-chains-orb-movement-blue",
    "Jauge de pression": "commodities/tech/dial-meter-gauge-blue",
    "Attaques multiples": "magic/fire/beam-strike-whip-red",
    "Fouet de flammes": "weapons/misc/whip-leather",
    "Jet de vapeur": "magic/air/fog-gas-smoke-swirling-white",
    "Phase 2 — Les chaînes cèdent": "magic/control/debuff-chains-purple",
    "Crachat de scories": "magic/fire/projectile-meteor-salvo-heavy-blue",
    "Ruissellement": "magic/earth/lava-explosion-orange",
    "Bouffée de la chaudière": "magic/fire/explosion-embers-evade-silhouette",
    "Soupape hurlante": "commodities/tech/valve-pressure-pipe-copper"
  },
  "baron-nizzel-baille-fonds": {
    "Résistance légendaire": "magic/defensive/shield-barrier-deflect-teal",
    "Pilote à l'abri": "equipment/head/helm-goggles-leather",
    "Attaques multiples": "skills/melee/blade-tips-double-blue",
    "Scie circulaire": "commodities/tech/blade-mechanical-cutter",
    "Pince hydraulique": "tools/hand/claws-climbing",
    "Salve verrouillée": "weapons/artillery/missile-rocket-launch-orange",
    "Lance-flammes rotatif": "weapons/artillery/cannon-spray-chem-red",
    "Phase 2 — Surcharge du réacteur": "commodities/tech/engine-tech-thrust-yellow",
    "Pas mécanique": "commodities/tech/cog-track-steel",
    "Revers de scie": "environment/traps/saw-mechanical-steel",
    "Mines sauteuses": "weapons/thrown/bomb-fuse-blue",
    "Tapis roulant": "commodities/tech/cog-large-steel-white"
  },
  // ---------- Montures des Tarides
  "monture-belier-de-forgefer": {
    "Bête de selle": "creatures/mammals/goat-horned-blue",
    "Pied de montagne": "environment/wilderness/cave-entrance-mountain-blue",
    "Coup de cornes": "commodities/bones/horn-curved-grey"
  },
  "monture-loup-de-guerre": {
    "Bête de selle": "creatures/mammals/wolf-howl-moon-gray",
    "Flair du loup": "creatures/mammals/dog-husky-white-blue",
    "Crocs de guerre": "creatures/abilities/mouth-teeth-crooked-blue"
  },
  "monture-kodo": {
    "Bête de somme": "creatures/mammals/ox-buffalo-horned-green",
    "Coup de tête": "creatures/mammals/bull-horned-blue",
    "Piétinement": "magic/sonic/explosion-shock-wave-teal"
  },
  "monture-raptor": {
    "Bête de selle": "creatures/reptiles/lizard-iguana-green",
    "Bond du raptor": "creatures/mammals/deer-movement-leap-green",
    "Griffe en faucille": "creatures/claws/claw-curved-jagged-gray"
  },
  "monture-hippogriffe": {
    "Bête de selle ailée": "creatures/birds/raptor-hawk-flying",
    "Attaques multiples": "creatures/birds/raptor-owl-flying-moon",
    "Bec": "creatures/birds/corvid-call-sound-blue",
    "Serres": "creatures/claws/claw-talons-glowing-purple"
  },
  // ---------- Rares et élites des Tarides
  "rare-crocs-de-cendre": {
    "Sang gangrené": "skills/wounds/blood-cells-disease-green",
    "Attaques multiples": "creatures/mammals/wolf-shadow-black",
    "Morsure de cendre": "creatures/abilities/fang-tooth-venomous",
    "Hurlement de la meute": "creatures/mammals/wolf-howl-moon-forest-blue"
  },
  "rare-plume-fiel": {
    "Attaques multiples": "creatures/claws/claw-hooked-barbed",
    "Serres empoisonnées": "creatures/claws/claw-hooked-purple",
    "Chant de fiel": "magic/control/hypnosis-mesmerism-pendulum",
    "Nuée de plumes": "commodities/materials/feather-blue-green"
  },
  "rare-rouille-coeur": {
    "Moteur emballé": "commodities/tech/engine-thrust-jet",
    "Attaques multiples": "skills/melee/strike-sword-blood-red",
    "Scie rouillée": "environment/traps/saw-steel-grey",
    "Fuite de vapeur": "commodities/tech/pipe-tech-exhaust-steel"
  },
  "rare-glouglou-premier": {
    "Amphibie": "magic/water/bubbles-air-water-pink",
    "Cour du roi": "commodities/treasure/crown-gold-laurel-wreath",
    "Sceptre de corail": "weapons/staves/staff-ornate-banded-purple",
    "Mrglglgl royal": "magic/sonic/bell-alarm-red-purple"
  },
  "rare-gueule-de-fer": {
    "Écailles de fer": "commodities/leather/scales-green",
    "Mâchoire de fer": "commodities/bones/bone-jaw-teeth-green",
    "Roulade de la mort": "magic/water/vortex-water-whirlpool-blue"
  },
  "rare-capitaine-sel-rouge": {
    "Attaques multiples": "skills/melee/strike-blade-scimitar-gray-red",
    "Sabre d'abordage": "weapons/swords/scimitar-guard-gold",
    "Pistolet à rouet": "weapons/guns/gun-pistol-flintlock-white",
    "Baril de poudre": "containers/barrels/barrel-apple-steel-orange",
    "Esquive du pirate": "skills/movement/figure-running-gray"
  },
  "rare-khan-ventrouge": {
    "Attaques multiples": "skills/ranged/arrows-flying-salvo-blue-light",
    "Lance du khan": "weapons/polearms/spear-flared-gold",
    "Arc composite": "weapons/bows/bow-recurve-black",
    "Charge du khan": "environment/people/cavalry-heavy",
    "Appel de la horde": "tools/instruments/horn-red-brown"
  },
  "rare-sabot-de-verre": {
    "Peau de verre noir": "commodities/gems/gem-faceted-cushion-teal-black",
    "Cornes de verre": "creatures/mammals/ox-bull-horned-glowing-orange",
    "Ruée de verre": "creatures/mammals/bull-horns-eyes-glowin-orange",
    "Barrissement fêlé": "magic/sonic/projectile-shock-wave-blue"
  },
  "rare-vexxa-la-rieuse": {
    "Résistance à la magie": "magic/defensive/shield-barrier-flaming-diamond-acid",
    "Attaques multiples": "skills/melee/strike-dagger-arcane-pink",
    "Dague de gangrecorne": "weapons/daggers/dagger-ritual-green",
    "Flèche gangrenée": "weapons/ammunition/arrow-broadhead-green",
    "Rire moqueur": "magic/unholy/silhouette-evil-horned-giant"
  }
};

export const ICONES_PNJ = Object.fromEntries(Object.entries(TABLE).map(([cle, capacites]) =>
  [cle, Object.fromEntries(Object.entries(capacites).map(([nom, chemin]) => [nom, icone(`icons/${chemin}.webp`)]))]));
