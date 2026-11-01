// Objets d'Azeroth (dnd5e 6.0.6) : pierre de foyer, potions, armes et armures typées Alliance et Horde, quelques
// objets magiques peu communs, du butin. Prix en pièces d'or (po = gp), d'argent (pa = sp), de cuivre (pc = cp).
// Portées et zones en mètres (5 pieds = 1,5 m).
// Textes originaux.
import { icone } from "./aides.mjs";
import { arme, equipement, consommable, butin } from "./objets.mjs";

export const OBJETS = [
  // ---------- Objets emblématiques

  equipement({
    cle: "pierre-de-foyer", nom: "Pierre de foyer", img: icone("commodities/stone/", "stone"), categorie: "trinket",
    rarete: "uncommon", magique: true, prix: [100, "gp"], poids: 0.5,
    texte: "Une pierre lisse et bleutée, gravée d'une rune d'aubergiste. On la **lie** à une auberge en la confiant une nuit à l'aubergiste (gratuit ou presque : l'aubergiste y gagne un client fidèle).\n\nPar une **action** maintenue pendant **10 minutes** de concentration, vous êtes ramené, avec ce que vous portez, devant le foyer de l'auberge liée, où qu'elle soit sur le même continent. Si vous subissez des dégâts pendant ce temps, l'effet échoue et la pierre ne peut plus servir avant la prochaine aube. Elle se recharge à l'aube.",
    utilisations: { max: 1, periode: "dawn" },
    activites: [{ type: "utility", nom: "Rentrer à l'auberge", activation: "minute", activationValeur: 10, condition: "10 minutes sans subir de dégâts", portee: ["", "self"], duree: ["", "inst"] }]
  }),

  // ---------- Potions et consommables

  consommable({
    cle: "potion-de-soins", nom: "Potion de soins", img: icone("consumables/potions/potion-bottle-corked-labeled-red"), categorie: "potion",
    rarete: "common", magique: true, prix: [50, "gp"], poids: 0.5,
    texte: "Une fiole rouge au goût de cerise amère, brassée par les alchimistes de toutes les capitales. Par une **action bonus**, vous la buvez ou la faites boire à une créature à portée de main : elle récupère **2d4 + 2** points de vie.",
    activites: [{ type: "heal", nom: "Boire", activation: "bonus", portee: ["", "touch"], cible: ["1", "creature"], soin: { des: "2d4", bonus: "2" } }]
  }),
  consommable({
    cle: "potion-de-soins-majeure", nom: "Potion de soins majeure", img: icone("consumables/potions/", "red-glow"), categorie: "potion",
    rarete: "uncommon", magique: true, prix: [150, "gp"], poids: 0.5,
    texte: "Le même remède, concentré au sang de dragon dilué. Par une **action bonus**, la créature qui la boit récupère **4d4 + 4** points de vie.",
    activites: [{ type: "heal", nom: "Boire", activation: "bonus", portee: ["", "touch"], cible: ["1", "creature"], soin: { des: "4d4", bonus: "4" } }]
  }),
  consommable({
    cle: "potion-de-mana-mineure", nom: "Potion de mana mineure", img: icone("consumables/potions/potion-bottle-corked-blue"), categorie: "potion",
    rarete: "uncommon", magique: true, prix: [100, "gp"], poids: 0.5,
    texte: "Une fiole bleue qui pétille sur la langue. Par une **action bonus**, vous la buvez et récupérez **un emplacement de sort dépensé de niveau 1**. Une créature qui ne lance pas de sorts ressent seulement un léger vertige.\n\n*Au plus une potion de mana par repos court : la seconde ne fait aucun effet.*",
    activites: [{ type: "utility", nom: "Boire", activation: "bonus" }]
  }),
  consommable({
    cle: "elixir-de-la-mangouste", nom: "Élixir de la mangouste", img: icone("consumables/potions/potion-bottle-corked-labeled-green"), categorie: "potion",
    rarete: "uncommon", magique: true, prix: [120, "gp"], poids: 0.5,
    texte: "Une décoction verte et nerveuse, appréciée des voleurs de Hurlevent et des chasseurs trolls. Après l'avoir bue (**action bonus**), vous avez pendant **1 heure** l'avantage aux tests de **Dextérité** et votre vitesse augmente de 1,5 m.",
    effets: [{ nom: "Élixir de la mangouste", transfert: false, duree: 3600, changements: [["system.abilities.dex.check.roll.mode", 1], ["system.attributes.movement.walk", 1.5]] }],
    activites: [{ type: "utility", nom: "Boire", activation: "bonus", duree: [1, "hour"], effets: [0] }]
  }),
  consommable({
    cle: "bandage-de-lin", nom: "Bandage de lin", img: icone("tools/medical/bandages-gauze"), categorie: "trinket",
    prix: [5, "sp"], poids: 0.2,
    texte: "Des bandes de lin propres et une poignée d'herbes. Par une **action**, vous pansez une créature à portée de main qui a au moins 1 point de vie : elle récupère **1d4 + votre modificateur de Sagesse** points de vie. Une même créature ne profite que d'un bandage par repos court.",
    activites: [{ type: "heal", nom: "Panser", portee: ["", "touch"], cible: ["1", "creature"], soin: { des: "1d4", bonus: "@abilities.wis.mod" } }]
  }),
  consommable({
    cle: "bombe-gobeline", nom: "Bombe gobeline", img: icone("weapons/thrown/bomb-fuse-black"), categorie: "trinket",
    prix: [25, "gp"], poids: 1,
    texte: "Une sphère de fonte, une mèche trop courte et un autocollant « garanti ou remboursé ». Par une **action**, vous la lancez jusqu'à 9 m : chaque créature dans un rayon de 1,5 m autour du point d'impact fait un jet de sauvegarde de **Dextérité DD 12**, et subit **2d6** dégâts de feu en cas d'échec, moitié moins en cas de réussite.\n\nSur un 1 au jet d'attaque improvisé (si le MJ en demande un), elle explose dans votre main.",
    activites: [{
      type: "save", nom: "Lancer", portee: [9, "m"], gabarit: ["radius", 1.5], cible: ["", "creature"],
      sauvegarde: { carac: ["dex"], dd: 12, reussite: "half" }, degats: [{ des: "2d6", types: ["fire"] }]
    }]
  }),

  // ---------- Armes

  arme({
    cle: "epee-de-la-garde", nom: "Épée de la Garde de Hurlevent", img: icone("weapons/swords/", "shortsword-guard-gold"),
    categorie: "martialM", base: "longsword", degats: { des: "1d8", types: ["slashing"] }, polyvalente: "1d10",
    proprietes: ["ver"], maitrise: "sap", prix: [20, "gp"], poids: 3,
    texte: "Une épée longue droite au pommeau frappé du lion de Hurlevent, forgée en série pour la Garde après la reconstruction. Sobre, bien équilibrée, facile à remplacer."
  }),
  arme({
    cle: "hache-d-orgrimmar", nom: "Hache d'Orgrimmar", img: icone("weapons/axes/axe-battle-heavy-jagged"),
    categorie: "martialM", base: "greataxe", degats: { des: "1d12", types: ["slashing"] },
    proprietes: ["hvy", "two"], maitrise: "cleave", prix: [30, "gp"], poids: 7,
    texte: "Une grande hache à double tranchant dentelé, au manche enveloppé de cuir rouge. Les forgerons de la Vallée de la Force la martèlent dans le fer noir de Durotar."
  }),
  arme({
    cle: "lance-de-sombrelance", nom: "Lance des Sombrelance", img: icone("weapons/polearms/spear-hooked-brown"),
    categorie: "simpleM", base: "spear", degats: { des: "1d6", types: ["piercing"] }, polyvalente: "1d8",
    proprietes: ["thr", "ver"], maitrise: "sap", portee: [6, 18], prix: [2, "gp"], poids: 3,
    texte: "Une lance de chasse à pointe barbelée, ornée de plumes et de petites défenses. Les trolls Sombrelance la lancent aussi bien qu'ils la manient."
  }),
  arme({
    cle: "tromblon-de-forgefer", nom: "Tromblon de Forgefer", img: icone("weapons/guns/gun-blunderbuss-bronze"),
    categorie: "martialR", base: "musket", degats: { des: "1d12", types: ["piercing"] },
    proprietes: ["amm", "lod", "two"], maitrise: "slow", portee: [12, 36], prix: [500, "gp"], poids: 10,
    texte: "Un long fusil à poudre noire de la guilde des fusiliers de Forgefer, lourd et bruyant. Chaque coup réveille la vallée. Il faut de la poudre et des balles, que vend tout armurier nain."
  }),
  arme({
    cle: "glaive-lunaire", nom: "Glaive lunaire", img: icone("weapons/thrown/boomerang"),
    categorie: "martialM", degats: { des: "1d8", types: ["slashing"] }, proprietes: ["thr", "ret", "fin"], maitrise: "vex",
    portee: [6, 18], bonus: 1, rarete: "uncommon", prix: [500, "gp"], poids: 2,
    texte: "Une lame circulaire à trois branches, l'arme des Sentinelles elfes de la nuit. C'est une **arme +1**. Quand vous la lancez, elle revient dans votre main juste après l'attaque, en traçant un arc argenté."
  }),
  arme({
    cle: "marteau-de-la-main-d-argent", nom: "Marteau de la Main d'argent", img: icone("weapons/hammers/hammer-double-glowing-yellow"),
    categorie: "martialM", base: "warhammer", degats: { des: "1d8", types: ["bludgeoning"] }, polyvalente: "1d10",
    proprietes: ["ver"], maitrise: "push", bonus: 1, rarete: "uncommon", harmonisation: true, prix: [600, "gp"], poids: 5,
    texte: "Un marteau de guerre béni par l'ordre des paladins avant sa dissolution. C'est une **arme +1** qui nécessite un **lien**. Contre un mort-vivant ou un démon, elle inflige **1d6 dégâts radiants** supplémentaires.",
    activites: [{ type: "damage", nom: "Lumière contre les impies", activation: "", condition: "La cible touchée est un mort-vivant ou un démon", portee: [1.5, "m"], cible: ["1", "creature"], degats: [{ des: "1d6", types: ["radiant"] }], consomme: false }]
  }),

  // ---------- Armures et équipement

  equipement({
    cle: "cotte-de-la-garde", nom: "Cotte de mailles de la Garde", img: icone("equipment/chest/breastplate-banded-steel-gold"),
    categorie: "heavy", base: "chainmail", ca: 16, dexMax: 0, force: 13, discretion: true, prix: [75, "gp"], poids: 55,
    texte: "Mailles serrées, tabard bleu et or : l'équipement réglementaire des fantassins de Hurlevent."
  }),
  equipement({
    cle: "harnois-de-grunt", nom: "Harnois de grunt", img: icone("equipment/chest/breastplate-layered-leather-studded-brown"),
    categorie: "medium", base: "scalemail", ca: 14, dexMax: 2, discretion: true, prix: [50, "gp"], poids: 45,
    texte: "Plaques de fer rivetées sur du cuir de kodo, épaulières à pointes : l'armure du grunt de la nouvelle Horde, plus solide qu'élégante."
  }),
  equipement({
    cle: "bouclier-du-lion", nom: "Bouclier du lion", img: icone("equipment/shield/heater-embossed-gold"),
    categorie: "shield", base: "shield", ca: 2, prix: [10, "gp"], poids: 6,
    texte: "Un écu peint d'un lion d'or sur fond bleu. Ceux qui le portent ont juré de défendre Hurlevent."
  }),
  equipement({
    cle: "cape-de-sentinelle", nom: "Cape de Sentinelle", img: icone("equipment/back/", "cloak"), categorie: "wondrous",
    rarete: "uncommon", magique: true, harmonisation: true, prix: [400, "gp"], poids: 1,
    texte: "Une cape violette tissée par les prêtresses d'Élune. Tant que vous la portez et y êtes **lié**, vous avez l'avantage aux tests de **Dextérité (Discrétion)** faits dans la pénombre ou l'obscurité, et vous pouvez vous cacher quand vous n'êtes que dans une zone de lumière faible.",
    effets: [{ nom: "Cape de Sentinelle", changements: [["system.skills.ste.roll.mode", 1]] }]
  }),
  equipement({
    cle: "anneau-du-kirin-tor", nom: "Anneau d'apprenti du Kirin Tor", img: icone("equipment/finger/ring-band-engraved-scrolls-silver"), categorie: "ring",
    rarete: "uncommon", magique: true, harmonisation: true, prix: [500, "gp"], poids: 0,
    texte: "Un anneau d'argent gravé de l'œil violet du Kirin Tor, remis aux apprentis prometteurs. Tant que vous y êtes **lié**, le **DD de sauvegarde de vos sorts augmente de 1**. Une fois par repos long, vous pouvez par une **action bonus** l'interroger : il vous indique la direction de Dalaran, ou de l'archimage le plus proche.",
    utilisations: { max: 1, periode: "lr" },
    effets: [{ nom: "Anneau du Kirin Tor", changements: [["system.bonuses.spell.dc", 1]] }],
    activites: [{ type: "utility", nom: "Interroger l'anneau", activation: "bonus" }]
  }),

  // ---------- Butin

  butin({
    cle: "eclat-de-cristal-de-mana", nom: "Éclat de cristal de mana", img: icone("commodities/gems/", "gem"), categorie: "gem",
    prix: [25, "gp"], poids: 0,
    texte: "Un fragment de cristal violet qui bourdonne doucement. Les elfes de sang en paient le double de sa valeur, sans poser de questions."
  }),
  butin({
    cle: "lettre-de-change", nom: "Lettre de change du cartel Gentepression", img: icone("sundries/documents/document-letter-formal-tan"), categorie: "treasure",
    prix: [10, "gp"], poids: 0,
    texte: "Un papier scellé à la cire verte, payable à vue dans n'importe quel comptoir gobelin (Baie-du-Butin, Gadgetzan, Cabestan), moins une commission « raisonnable » de 10 %."
  })
];
