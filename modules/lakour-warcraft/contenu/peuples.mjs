// Peuples jouables d'Azeroth (dnd5e 6.0.6, règles 2024) : treize peuples, chacun avec deux à quatre traits en
// objets à part (feat de type « race »), donnés par un ItemGrant. Équilibrés sur les peuples du SRD 2024 : une
// taille, une vitesse, une vision dans le noir ou un trait de plus, un trait à usages limités au plus par peuple
// principal. Les langues ne viennent pas du peuple (règle 2024) mais de l'historique.
// Textes originaux. Toutes les distances sont en mètres, dans les textes comme dans les données (5 pieds = 1,5 m).
import { icone } from "./aides.mjs";
import { peuple, trait, SORTS_SRD, DONS_SRD } from "./objets.mjs";
import { DONS_MAISON } from "./historiques.mjs";

// Raccourci : un trait du peuple `p`.
const t = (p, cle, nom, img, texte, options = {}) => trait({ cle: `${p.cle}-${cle}`, nom, peuple: p.nom, img, texte, ...options });
const BM_PAR_REPOS_LONG = { max: "@prof", periode: "lr" };

// ======================================================================= Alliance

const HUMAIN = { cle: "humain", nom: "Humain" };
const humain = [
  t(HUMAIN, "tenacite", "Ténacité humaine", icone("magic/control/buff-strength-muscle-damage-orange"),
    "Les royaumes humains ont survécu aux trolls, aux orcs et au Fléau : ils ne savent pas renoncer. Chaque fois que vous terminez un **repos long**, vous gagnez l'**Inspiration héroïque**."),
  t(HUMAIN, "touche-a-tout", "Touche-à-tout", icone("skills/trades/academics-book-study-purple.webp"),
    "Fermier devenu milicien, apprenti devenu soldat : vous avez appris un peu de tout. Vous gagnez la maîtrise d'une **compétence** de votre choix.",
    { maitrises: { choix: [{ parmi: ["skills:*"] }], indice: "Une compétence au choix." } }),
  t(HUMAIN, "polyvalence", "Polyvalence", icone("magic/control/buff-luck-fortune-green-gold"),
    "Vous gagnez un **don d'origine** de votre choix (ceux du SRD ou ceux de La Kour Warcraft).")
];

const NAIN = { cle: "nain", nom: "Nain" };
const nain = [
  t(NAIN, "sang-de-la-montagne", "Sang de la montagne", icone("magic/life/heart-cross-strong-flame-purple-orange"),
    "Les nains de Forgefer boivent ce qui ferait tomber un ogre. Vous avez la **résistance aux dégâts de poison**, et l'avantage aux jets de sauvegarde pour éviter ou terminer l'état **empoisonné**.",
    { maitrises: { accordees: ["dr:poison"] } }),
  t(NAIN, "robustesse", "Robustesse naine", icone("magic/defensive/armor-stone-skin"),
    "Vos points de vie maximum augmentent de 1, puis de 1 à chaque niveau gagné.",
    { effets: [{ nom: "Robustesse naine", changements: [["system.attributes.hp.bonuses.level", 1]] }] }),
  t(NAIN, "echo-de-la-pierre", "Écho de la pierre", icone("magic/earth/", "rock"),
    "Vous sentez la roche vibrer comme un forgeron entend son enclume. Par une **action bonus**, vous gagnez la **perception des vibrations** sur 18 m pendant 10 minutes, tant que vous touchez la pierre ou le sol. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    {
      utilisations: BM_PAR_REPOS_LONG,
      effets: [{ nom: "Écho de la pierre", transfert: false, duree: 600, changements: [["system.attributes.senses.tremorsense", 18, "upgrade"]] }],
      activites: [{ type: "utility", nom: "Écouter la pierre", activation: "bonus", duree: [10, "minute"], effets: [0] }]
    })
];

const GNOME = { cle: "gnome", nom: "Gnome" };
const gnome = [
  t(GNOME, "esprit-retors", "Esprit retors", icone("magic/perception/third-eye-blue-red"),
    "Un esprit qui calcule trois choses à la fois est difficile à tromper. Vous avez l'avantage aux jets de sauvegarde d'**Intelligence**, de **Sagesse** et de **Charisme**.",
    {
      effets: [{
        nom: "Esprit retors", changements: [
          ["system.abilities.int.save.roll.mode", 1], ["system.abilities.wis.save.roll.mode", 1], ["system.abilities.cha.save.roll.mode", 1]
        ]
      }]
    }),
  t(GNOME, "bricoleur", "Bricoleur de Gnomeregan", icone("tools/hand/wrench-adjustable-toothed.webp"),
    "Vous avez grandi parmi les engrenages. Vous maîtrisez les **outils de bricoleur** et connaissez le tour de magie **Réparation** (Intelligence). En une heure et avec 10 po de pièces, vous pouvez assembler un petit mécanisme (jouet, briquet, boîte à musique, réveil) qui fonctionne jusqu'à ce que vous en fabriquiez un autre.",
    {
      maitrises: { accordees: ["tool:art:tinker"] },
      sorts: [{ uuid: SORTS_SRD.bricolage, carac: ["int"] }]
    })
];

const ELFE_NUIT = { cle: "elfe-de-la-nuit", nom: "Elfe de la nuit" };
const elfeNuit = [
  t(ELFE_NUIT, "fondu-dans-l-ombre", "Fondu dans l'ombre", icone("magic/perception/silhouette-stealth-shadow"),
    "Les sentinelles de Kalimdor disparaissent dans la pénombre en un battement de cœur. Par une **action bonus**, si vous ne vous êtes pas déplacé ce tour-ci, vous devenez **invisible** jusqu'à ce que vous bougiez, attaquiez, lanciez un sort ou subissiez des dégâts, ou jusqu'à la fin de votre tour suivant. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    {
      utilisations: BM_PAR_REPOS_LONG,
      effets: [{ nom: "Fondu dans l'ombre", transfert: false, duree: 12, etats: ["invisible"] }],
      activites: [{ type: "utility", nom: "Se fondre dans l'ombre", activation: "bonus", duree: [2, "round"], effets: [0] }]
    }),
  t(ELFE_NUIT, "sens-aiguises", "Sens aiguisés", icone("creatures/eyes/", "human-single-blue"),
    "Dix mille ans de veille ont affiné vos sens. Vous maîtrisez **Intuition**, **Perception** ou **Survie** (au choix).",
    { maitrises: { choix: [{ parmi: ["skills:ins", "skills:prc", "skills:sur"] }] } }),
  t(ELFE_NUIT, "reve-vigilant", "Rêve vigilant", icone("magic/nature/moon-crescent"),
    "Vous ne dormez pas comme les mortels : vous méditez au bord du Rêve d'émeraude, conscient de ce qui vous entoure. Un **repos long** ne vous demande que 4 heures de cette transe, et aucune magie ne peut vous endormir.")
];

const DRAENEI = { cle: "draenei", nom: "Draeneï" };
const draenei = [
  t(DRAENEI, "don-des-naaru", "Don des naaru", icone("magic/holy/prayer-hands-glowing-yellow-white"),
    "Les naaru ont guidé votre peuple à travers les étoiles, et un peu de leur lumière vous accompagne. Par une **action**, vous touchez une créature (vous compris) : elle récupère un nombre de points de vie égal à **1d4 par point de votre bonus de maîtrise**. Une utilisation par repos long.",
    {
      utilisations: { max: 1, periode: "lr" },
      activites: [{ type: "heal", nom: "Lumière des naaru", portee: ["", "touch"], cible: ["1", "creature"], soin: { des: "(@prof)d4" } }]
    }),
  t(DRAENEI, "marque-de-la-lumiere", "Marque de la Lumière", icone("magic/holy/barrier-shield-winged-blue"),
    "Ceux qui ont fui la Légion ardente pendant vingt-cinq mille ans portent en eux de quoi repousser les ténèbres. Vous avez la **résistance aux dégâts nécrotiques**.",
    { maitrises: { accordees: ["dr:necrotic"] } }),
  t(DRAENEI, "memoire-de-l-exil", "Mémoire de l'exil", icone("commodities/gems/", "gem"),
    "Votre peuple a traversé mille mondes et en a gardé les leçons. Vous maîtrisez **Arcanes**, **Histoire** ou **Religion** (au choix).",
    { maitrises: { choix: [{ parmi: ["skills:arc", "skills:his", "skills:rel"] }] } })
];

const WORGEN = { cle: "worgen", nom: "Worgen" };
const worgen = [
  t(WORGEN, "forme-sauvage", "Forme sauvage", icone("creatures/abilities/wolf-howl-moon-white"),
    "La malédiction de Gilnéas sommeille sous votre peau. Par une **action bonus**, vous prenez votre forme de loup pendant 1 minute : vous gagnez des points de vie temporaires égaux à votre **bonus de maîtrise**, votre vitesse augmente de 3 m, et vous avez l'avantage aux tests de **Force**. Vous reprenez forme humaine par une action bonus, ou si vous tombez inconscient. Une utilisation par repos long.\n\nVous pouvez porter vos armes et votre armure sous les deux formes.",
    {
      utilisations: { max: 1, periode: "lr" },
      effets: [{
        nom: "Forme sauvage", transfert: false, duree: 60,
        changements: [["system.attributes.movement.walk", 3], ["system.abilities.str.check.roll.mode", 1]]
      }],
      activites: [{ type: "heal", nom: "Libérer le loup", activation: "bonus", duree: [1, "minute"], soin: { bonus: "@prof", type: "temphp" }, effets: [0] }]
    }),
  t(WORGEN, "griffes", "Griffes", icone("creatures/claws/", "claw"),
    "Sous vos deux formes, vos ongles sont durs comme de la corne. Vos frappes à mains nues infligent **1d6 + modificateur de Force** dégâts tranchants au lieu des dégâts habituels.",
    { activites: [{ type: "attack", nom: "Coup de griffes", portee: [1.5, "m"], cible: ["1", "creature"], attaque: { type: "melee", carac: "str", classement: "unarmed", base: false }, degats: [{ des: "1d6", bonus: "@mod", types: ["slashing"] }] }] }),
  t(WORGEN, "flair", "Flair du chasseur", icone("creatures/mammals/wolf-howl-moon-gray"),
    "Votre nez vous dit qui est passé ici et quand. Vous maîtrisez **Perception** ou **Survie** (au choix), et vous avez l'avantage aux tests qui reposent sur l'odorat.",
    { maitrises: { choix: [{ parmi: ["skills:prc", "skills:sur"] }] } })
];

// ======================================================================= Horde

const ORC = { cle: "orc", nom: "Orc" };
const orc = [
  t(ORC, "fureur-sanguinaire", "Fureur sanguinaire", icone("skills/melee/strike-axe-blood-red"),
    "Le sang des orcs bout vite. Par une **action bonus**, vous gagnez des points de vie temporaires égaux à votre **bonus de maîtrise**, et la première attaque au corps à corps que vous réussissez avant la fin de ce tour inflige **1d4** dégâts supplémentaires. Nombre d'utilisations : votre bonus de maîtrise par **repos court**.",
    {
      utilisations: { max: "@prof", periode: "sr" },
      activites: [{ type: "heal", nom: "Fureur", activation: "bonus", soin: { bonus: "@prof", type: "temphp" } }]
    }),
  t(ORC, "endurance-de-draenor", "Endurance de Draenor", icone("magic/life/cross-area-circle-green-white"),
    "Les orcs se relèvent quand d'autres restent à terre. Quand vous tombez à 0 point de vie sans être tué sur le coup, vous pouvez revenir à **1 point de vie** à la place. Une utilisation par repos long.",
    {
      utilisations: { max: 1, periode: "lr" },
      activites: [{ type: "heal", nom: "Refuser la chute", activation: "", condition: "Quand vous tombez à 0 point de vie sans être tué", soin: { bonus: "1" } }]
    }),
  t(ORC, "volonte-de-fer", "Volonté de fer", icone("magic/control/buff-strength-muscle-damage-red"),
    "Libérés des chaînes des camps d'internement, les orcs ne plient plus. Vous avez l'avantage aux jets de sauvegarde pour éviter ou terminer les états **effrayé** et **étourdi**.")
];

const TROLL = { cle: "troll", nom: "Troll" };
const troll = [
  t(TROLL, "regeneration", "Régénération", icone("magic/life/heart-cross-strong-flame-green"),
    "Votre chair se referme à vue d'œil. Par une **action bonus**, vous récupérez **1d6 + votre modificateur de Constitution** points de vie (minimum 1). Cette régénération ne fonctionne pas si vous avez subi des dégâts de feu ou d'acide depuis le début de votre dernier tour. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    {
      utilisations: BM_PAR_REPOS_LONG,
      activites: [{ type: "heal", nom: "Se régénérer", activation: "bonus", soin: { des: "1d6", bonus: "@abilities.con.mod" } }]
    }),
  t(TROLL, "faveur-des-loa", "Faveur des loa", icone("commodities/treasure/totem-wood-face-brown"),
    "Les esprits de la jungle répondent à ceux qui leur parlent. Vous connaissez le tour de magie **Thaumaturgie**. À partir du niveau 3, vous pouvez lancer **Lumière** une fois sans emplacement de sort par repos long… sous la forme de feux follets verts autour d'un masque de vaudou. Intelligence, Sagesse ou Charisme est votre caractéristique d'incantation pour ces sorts (choisie quand vous prenez ce peuple).",
    { sorts: [{ uuid: SORTS_SRD.thaumaturgie }] }),
  t(TROLL, "instinct-de-la-jungle", "Instinct de la jungle", icone("magic/nature/stealth-hide-beast-eyes-green.webp"),
    "Les Sombrelance ont survécu aux raptors, aux murlocs et aux trolls rivaux. Vous maîtrisez **Dressage**, **Nature** ou **Survie** (au choix), et le terrain difficile naturel (broussailles, marais, éboulis) ne ralentit pas votre déplacement.",
    { maitrises: { choix: [{ parmi: ["skills:ani", "skills:nat", "skills:sur"] }] } })
];

const TAUREN = { cle: "tauren", nom: "Tauren" };
const tauren = [
  t(TAUREN, "charge", "Charge", icone("creatures/mammals/ox-buffalo-horned-green"),
    "Une tonne de muscles lancée au galop ne s'arrête pas facilement. Si vous vous déplacez d'au moins 6 m en ligne droite vers une créature et la touchez avec une attaque au corps à corps dans le même tour, elle doit réussir un jet de sauvegarde de **Force** (DD 8 + votre modificateur de Constitution + votre bonus de maîtrise) ou tomber **à terre**. La cible doit être de taille Grande ou inférieure. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    {
      utilisations: BM_PAR_REPOS_LONG,
      effets: [{ nom: "Renversé par la charge", transfert: false, etats: ["prone"] }],
      activites: [{ type: "save", nom: "Renverser", activation: "", condition: "Après 6 m en ligne droite et une attaque au corps à corps réussie", portee: [1.5, "m"], cible: ["1", "creature"], sauvegarde: { carac: ["str"], dd: "con", reussite: "none" }, effets: [0] }]
    }),
  t(TAUREN, "carrure", "Carrure des plaines", icone("creatures/abilities/bull-head-horns-glowing.webp"),
    "Vous êtes de taille Moyenne, mais bâti comme un taureau. Vous avez l'avantage aux tests pour mettre fin à l'état **agrippé**, et vous comptez comme une taille de plus pour la charge que vous pouvez porter, pousser, tirer ou soulever.",
    { effets: [{ nom: "Carrure des plaines", changements: [["flags.dnd5e.powerfulBuild", true, "override"]] }] }),
  t(TAUREN, "robustesse", "Robustesse taurène", icone("magic/life/heart-cross-strong-green"),
    "Vos points de vie maximum augmentent de 1, puis de 1 à chaque niveau gagné.",
    { effets: [{ nom: "Robustesse taurène", changements: [["system.attributes.hp.bonuses.level", 1]] }] }),
  t(TAUREN, "enfant-de-la-terre-mere", "Enfant de la Terre-Mère", icone("magic/nature/leaf-glow-triple-green"),
    "Vous avez appris les herbes et les bêtes des Mulgore. Vous maîtrisez **Nature** ou **Survie** (au choix), ainsi que le **matériel d'herboriste**.",
    { maitrises: { accordees: ["tool:herb"], choix: [{ parmi: ["skills:nat", "skills:sur"] }] } })
];

const REPROUVE = { cle: "reprouve", nom: "Réprouvé" };
const reprouve = [
  t(REPROUVE, "corps-sans-vie", "Corps sans vie", icone("magic/death/hand-dirt-undead-zombie"),
    "Libéré du Roi-liche mais pas de la mort, vous n'avez **pas besoin de respirer, de manger, de boire ni de dormir**. Vous avez la **résistance aux dégâts de poison** et l'avantage aux jets de sauvegarde contre les maladies. Les soins magiques fonctionnent normalement sur vous.",
    { maitrises: { accordees: ["dr:poison"] } }),
  t(REPROUVE, "volonte-des-reprouves", "Volonté des Réprouvés", icone("magic/unholy/hand-light-green"),
    "Personne ne possédera plus jamais votre esprit. Au début de votre tour, si vous êtes **charmé** ou **effrayé**, vous pouvez mettre fin à cet état (aucune action requise). Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    {
      utilisations: BM_PAR_REPOS_LONG,
      activites: [{ type: "utility", nom: "Briser l'emprise", activation: "", condition: "Au début de votre tour, si vous êtes charmé ou effrayé" }]
    }),
  t(REPROUVE, "cannibalisme", "Cannibalisme", icone("magic/death/", "skull"),
    "Il faut bien entretenir la machine. Par une **action**, vous vous repaissez du cadavre d'un humanoïde ou d'une bête de taille Petite ou supérieure, mort depuis moins d'une heure et à 1,5 m de vous : vous récupérez **1d8 + votre bonus de maîtrise** points de vie. Les témoins vivants risquent fort de ne pas apprécier. Une utilisation par **repos court**.",
    {
      utilisations: { max: 1, periode: "sr" },
      activites: [{ type: "heal", nom: "Se repaître", condition: "Un cadavre frais à 1,5 m", soin: { des: "1d8", bonus: "@prof" } }]
    })
];

const ELFE_SANG = { cle: "elfe-de-sang", nom: "Elfe de sang" };
const elfeSang = [
  t(ELFE_SANG, "torrent-arcanique", "Torrent arcanique", icone("magic/light/beam-rays-magenta"),
    "Vous libérez d'un coup la magie qui vous ronge. Par une **action**, chaque créature de votre choix dans un rayon de 3 m doit réussir un jet de sauvegarde de **Constitution** (DD 8 + votre modificateur de Constitution + votre bonus de maîtrise) ou ne plus pouvoir lancer de sort à composante verbale jusqu'à la fin de son prochain tour. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    {
      utilisations: BM_PAR_REPOS_LONG,
      activites: [{ type: "save", nom: "Libérer le torrent", gabarit: ["radius", 3], cible: ["", "creature"], portee: ["", "self"], sauvegarde: { carac: ["con"], dd: "con", reussite: "none" } }]
    }),
  t(ELFE_SANG, "affinite-arcanique", "Affinité arcanique", icone("magic/perception/orb-crystal-ball-scrying-blue"),
    "Quel'Thalas a vécu au rythme du Puits de soleil. Vous connaissez le tour de magie **Prestidigitation**. À partir du niveau 3, vous pouvez lancer **Détection de la magie** une fois sans emplacement de sort par repos long. Intelligence, Sagesse ou Charisme est votre caractéristique d'incantation pour ces sorts.",
    { sorts: [{ uuid: SORTS_SRD.prestidigitation }, { uuid: SORTS_SRD.detectionMagie, niveau: 3, parRepos: true }] }),
  t(ELFE_SANG, "regard-de-quel-thalas", "Regard de Quel'Thalas", icone("magic/perception/eye-ringed-green"),
    "Vous savez reconnaître la vraie beauté, et le mensonge qui s'en drape. Vous maîtrisez **Arcanes**, **Intuition** ou **Perception** (au choix).",
    { maitrises: { choix: [{ parmi: ["skills:arc", "skills:ins", "skills:prc"] }] } })
];

const GOBELIN = { cle: "gobelin", nom: "Gobelin" };
const gobelin = [
  t(GOBELIN, "filer-a-l-anglaise", "Filer à l'anglaise", icone("skills/movement/figure-running-gray"),
    "Quand ça tourne mal, un gobelin est déjà ailleurs. Vous pouvez effectuer l'action **Se désengager** ou **Se cacher** par une **action bonus**, à chacun de vos tours."),
  t(GOBELIN, "pacte-du-cartel", "Pacte du cartel", icone("commodities/currency/coin-embossed-crown-gold"),
    "Tout se négocie, surtout ce qui ne devrait pas. Vous maîtrisez **Persuasion**, **Tromperie** ou **Investigation** (au choix), ainsi que les **outils de bricoleur**. Quand vous concluez un marché, vous savez d'instinct si l'autre partie compte le respecter.",
    { maitrises: { accordees: ["tool:art:tinker"], choix: [{ parmi: ["skills:per", "skills:dec", "skills:inv"] }] } }),
  t(GOBELIN, "saut-de-fusee", "Saut de fusée", icone("skills/movement/arrow-upward-yellow"),
    "Vos bottes cachent deux fusées de poche bricolées. Par une **action bonus**, vous bondissez jusqu'à 6 m dans la direction de votre choix (y compris vers le haut), sans provoquer d'attaque d'opportunité, et vous retombez sans dégâts. Nombre d'utilisations : votre **bonus de maîtrise** par repos long.",
    {
      utilisations: BM_PAR_REPOS_LONG,
      activites: [{ type: "utility", nom: "Allumer les fusées", activation: "bonus", portee: [6, "m"], cible: ["", "space"] }]
    })
];

// ======================================================================= Hors faction

const PANDAREN = { cle: "pandaren", nom: "Pandaren" };
const pandaren = [
  t(PANDAREN, "paume-tremblante", "Paume tremblante", icone("magic/holy/meditation-chi-focus-blue"),
    "Un point de pression, une paume ouverte, et l'adversaire oublie un instant de se battre. Par une **action**, touchez une créature à 1,5 m : elle doit réussir un jet de sauvegarde de **Constitution** (DD 8 + votre modificateur de Sagesse + votre bonus de maîtrise) ou être **neutralisée** jusqu'à la fin de son prochain tour. Une utilisation par repos long.",
    {
      utilisations: { max: 1, periode: "lr" },
      effets: [{ nom: "Paume tremblante", transfert: false, duree: 12, etats: ["incapacitated"] }],
      activites: [{ type: "save", nom: "Frapper le point", portee: ["", "touch"], cible: ["1", "creature"], sauvegarde: { carac: ["con"], dd: "wis", reussite: "none" }, effets: [0] }]
    }),
  t(PANDAREN, "rebond", "Rebond", icone("skills/movement/ball-spinning-blue"),
    "Vous roulez plus que vous ne tombez. Vous subissez **moitié moins de dégâts de chute**, et vous ne tombez pas à terre à cause d'une chute de moins de 6 m."),
  t(PANDAREN, "gourmet", "Gourmet", icone("consumables/meat/", "steak"),
    "Un bon repas répare plus qu'un sort. Vous maîtrisez les **ustensiles de cuisinier**. À la fin d'un **repos court** où vous avez cuisiné pour le groupe, vous et jusqu'à cinq alliés qui ont partagé le repas récupérez des points de vie supplémentaires égaux à votre **bonus de maîtrise** chacun.",
    { maitrises: { accordees: ["tool:art:cook"] } }),
  t(PANDAREN, "paix-interieure", "Paix intérieure", icone("magic/nature/lotus-glow-pink.webp"),
    "La sérénité de la Pandarie vous accompagne. Vous avez l'avantage aux jets de sauvegarde pour éviter ou terminer l'état **effrayé**, et une nuit troublée ne vous empêche jamais de bénéficier d'un repos long.")
];

// ======================================================================= Peuples

const decrire = (lignes) => lignes.join("\n\n");

export const PEUPLES_DOCS = [
  peuple({
    ...HUMAIN, img: icone("environment/people/commoner"), taille: ["med", "sm"], indiceTaille: "Moyen (1,50 à 1,90 m) ou Petit pour un enfant ou un adolescent.",
    vitesse: 9, vision: null, traits: humain,
    donAuChoix: [DONS_SRD.vigilant, DONS_SRD.initieMagie, DONS_SRD.attaquantSauvage, DONS_SRD.doue, ...Object.values(DONS_MAISON)],
    texte: decrire([
      "**Alliance.** Hurlevent rebâtie, Kul Tiras et les restes de Lordaeron : les humains sont le cœur de l'Alliance, nombreux, obstinés, divisés en royaumes qui se méfient les uns des autres autant que de la Horde.",
      "Les humains sont ceux qui ont le plus perdu pendant la Troisième Guerre et ceux qui reconstruisent le plus vite. Paysans devenus soldats, prêtres de la Lumière, mages de Dalaran, marins kultirassiens : on trouve des humains partout et dans tous les métiers.",
      "**Traits.** Ténacité humaine, Touche-à-tout, Polyvalence (un don d'origine au choix). Taille Moyenne, vitesse 9 m, pas de vision dans le noir."
    ])
  }),
  peuple({
    ...NAIN, img: icone("weapons/hammers/hammer-double-steel-embossed"), indiceTaille: "Moyen (1,20 à 1,50 m, mais aussi lourd qu'un humain).",
    vitesse: 9, vision: 36, traits: nain,
    texte: decrire([
      "**Alliance.** Les nains de Forgefer tiennent Dun Morogh et Khaz Modan depuis leur capitale creusée dans la montagne. Mineurs, forgerons, artilleurs et archéologues, ils sont les plus anciens alliés des humains.",
      "Ils cherchent dans les ruines des Titans la vérité sur leurs origines de pierre, et se battent à coups de marteau, de fusil et de bière brune.",
      "**Traits.** Sang de la montagne, Robustesse naine, Écho de la pierre. Taille Moyenne, vitesse 9 m, vision dans le noir 36 m."
    ])
  }),
  peuple({
    ...GNOME, img: icone("commodities/tech/", "cog"), taille: ["sm"], indiceTaille: "Petit (environ 1 m).",
    vitesse: 9, vision: 18, traits: gnome,
    texte: decrire([
      "**Alliance.** Les gnomes ont perdu Gnomeregan, leur cité-machine, inondée de radiations quand ils ont tenté d'en chasser les troggs. Réfugiés chez les nains de Forgefer, ils inventent sans relâche ce qui leur permettra de rentrer chez eux.",
      "Brillants, bavards et souvent trop sûrs de leurs calculs, ils fournissent à l'Alliance ses ingénieurs, ses mages et ses espions de petite taille.",
      "**Traits.** Esprit retors, Bricoleur de Gnomeregan. Taille Petite, vitesse 9 m, vision dans le noir 18 m."
    ])
  }),
  peuple({
    ...ELFE_NUIT, img: icone("creatures/birds/raptor-owl-flying-moon"), indiceTaille: "Moyen (2 à 2,30 m).",
    vitesse: 10.5, vision: 18, traits: elfeNuit,
    texte: decrire([
      "**Alliance (récente).** Les kaldorei ont veillé dix mille ans sur les forêts de Kalimdor. La Troisième Guerre les a forcés à sortir de leur isolement : le Mont Hyjal a brûlé, Nordrassil a été sacrifié pour vaincre Archimonde, et leur immortalité s'est envolée avec lui.",
      "Sentinelles de Tyrande, druides de Malfurion : un peuple ancien qui découvre la mortalité et des voisins bruyants.",
      "**Traits.** Fondu dans l'ombre, Sens aiguisés, Rêve vigilant. Taille Moyenne, vitesse 10,5 m, vision dans le noir 18 m."
    ])
  }),
  peuple({
    ...DRAENEI, img: icone("magic/holy/prayer-hands-glowing-yellow"), indiceTaille: "Moyen (2 à 2,40 m).",
    vitesse: 9, vision: 18, traits: draenei,
    texte: decrire([
      "**Alliance (exilés).** Les draeneï fuient la Légion ardente depuis des millénaires, de monde en monde, guidés par le prophète Velen et par les naaru, êtres de pure Lumière. Leur peuple a été massacré sur Draenor par les orcs corrompus.",
      "Dans cette campagne, un petit groupe d'exilés a déjà atteint Azeroth en avance sur le gros de leur peuple : peu de gens ont vu un draeneï, et presque personne ne sait d'où ils viennent.",
      "**Traits.** Don des naaru, Marque de la Lumière, Mémoire de l'exil. Taille Moyenne, vitesse 9 m, vision dans le noir 18 m."
    ])
  }),
  peuple({
    ...WORGEN, img: icone("creatures/mammals/humanoid-wolf-dog-blue"), indiceTaille: "Moyen (1,70 à 2,10 m sous forme de loup).",
    vitesse: 9, vision: 18, traits: worgen,
    texte: decrire([
      "**Alliance (en secret).** Derrière le mur de Grisetête, le royaume de Gilnéas s'est coupé du monde. Mais une malédiction venue de la forêt des Pins-Argentés s'y répand : des hommes et des femmes deviennent loups.",
      "Un worgen de cette époque est un réfugié maudit, chassé par les siens comme par les Réprouvés, qui garde tant bien que mal sa raison. Son appartenance à l'Alliance reste à écrire.",
      "**Traits.** Forme sauvage, Griffes, Flair du chasseur. Taille Moyenne, vitesse 9 m, vision dans le noir 18 m."
    ])
  }),
  peuple({
    ...ORC, img: icone("commodities/bones/skull-tusked-grey"), indiceTaille: "Moyen (1,80 à 2 m).",
    vitesse: 9, vision: 18, traits: orc,
    texte: decrire([
      "**Horde.** Libérés des camps d'internement par Thrall, les orcs ont traversé la mer jusqu'à Kalimdor et fondé Orgrimmar dans les terres rouges de Durotar. Ils ont renoncé à la magie démoniaque qui les avait corrompus et renouent avec le chamanisme de leurs ancêtres.",
      "Fiers, directs, attachés à l'honneur du clan, ils doivent prouver au monde, et à eux-mêmes, qu'ils ne sont plus les monstres de la Première Guerre.",
      "**Traits.** Fureur sanguinaire, Endurance de Draenor, Volonté de fer. Taille Moyenne, vitesse 9 m, vision dans le noir 18 m."
    ])
  }),
  peuple({
    ...TROLL, img: icone("commodities/treasure/wood-tiki.webp"), indiceTaille: "Moyen (2 à 2,30 m, voûté).",
    vitesse: 9, vision: 18, traits: troll,
    texte: decrire([
      "**Horde.** La tribu Sombrelance, chassée de ses îles par les murlocs et les humains de Kul Tiras, a juré fidélité à Thrall qui l'a sauvée. Ses guerriers, chasseurs et féticheurs vivent aujourd'hui aux îles de l'Écho, au large de Durotar.",
      "Les Sombrelance honorent les loa, les esprits-animaux de leur peuple, et se méfient des autres tribus trolles, restées hostiles à tout le monde.",
      "**Traits.** Régénération, Faveur des loa, Instinct de la jungle. Taille Moyenne, vitesse 9 m, vision dans le noir 18 m."
    ])
  }),
  peuple({
    ...TAUREN, img: icone("creatures/mammals/bull-horned-blue"), indiceTaille: "Moyen (2,40 à 2,70 m, très massif).",
    vitesse: 9, vision: null, traits: tauren,
    texte: decrire([
      "**Horde.** Le grand chef Cairne Sabot-de-Sang a conduit les tribus taurènes, harcelées par les centaures, jusqu'aux plaines de Mulgore, où elles bâtissent Les Pitons-du-Tonnerre. En échange de l'aide de Thrall, les taurens ont rejoint la Horde.",
      "Calmes, patients, profondément liés à la Terre-Mère, ils sont des chasseurs, des druides et des chamans. Leur colère est rare, et terrible.",
      "**Traits.** Charge, Carrure des plaines, Robustesse taurène, Enfant de la Terre-Mère. Taille Moyenne (mais puissante), vitesse 9 m, pas de vision dans le noir."
    ])
  }),
  peuple({
    ...REPROUVE, img: icone("magic/death/undead-zombie-grave-green"), indiceTaille: "Moyen (taille humaine, un peu tassé).",
    vitesse: 9, vision: 18, traits: reprouve,
    texte: decrire([
      "**Horde (alliance de raison).** Des morts-vivants du Fléau ont retrouvé leur libre arbitre quand l'emprise du Roi-liche a faibli. Menés par la Dame noire Sylvanas Coursevent, ils ont pris les ruines de Lordaeron et creusent leur Fossoyeuse sous la capitale.",
      "Rejetés par les vivants qu'ils ont été, ils ne sont dans la Horde que par intérêt. On parle bas de leurs apothicaires.",
      "**Traits.** Corps sans vie, Volonté des Réprouvés, Cannibalisme. Taille Moyenne, vitesse 9 m, vision dans le noir 18 m. Type : humanoïde (mort-vivant, pour le récit ; les sorts le traitent comme un humanoïde)."
    ]),
    sousType: "Réprouvé"
  }),
  peuple({
    ...ELFE_SANG, img: icone("magic/light/beam-rays-magenta-small"), indiceTaille: "Moyen (1,70 à 1,90 m).",
    vitesse: 9, vision: 18, traits: elfeSang,
    texte: decrire([
      "**Horde (dans cette campagne).** Le Fléau a ravagé Quel'Thalas et souillé le Puits de soleil. Les survivants ont pris le nom de sin'dorei, les elfes de sang, en mémoire de leurs morts. Privés de leur source de magie, beaucoup souffrent d'une faim arcanique qui les ronge.",
      "Leur alliance avec la Horde est encore une négociation : nous jouons qu'un petit groupe de magistères a déjà tendu la main à Orgrimmar et aux Réprouvés, faute de soutien de l'Alliance.",
      "**Traits.** Torrent arcanique, Affinité arcanique, Regard de Quel'Thalas. Taille Moyenne, vitesse 9 m, vision dans le noir 18 m."
    ])
  }),
  peuple({
    ...GOBELIN, img: icone("commodities/currency/coin-embossed-ruby-gold"), taille: ["sm"], indiceTaille: "Petit (environ 1 m).",
    vitesse: 9, vision: 18, traits: gobelin,
    texte: decrire([
      "**Horde ou cartels.** Les gobelins vendent à tout le monde. Le cartel Gentepression tient Baie-du-Butin, Gadgetzan et Cabestan, ports neutres où Horde et Alliance commercent sous la menace des videurs.",
      "Un gobelin de cette époque est un marchand, un ingénieur ou un mercenaire qui travaille pour la Horde parce qu'elle paie, et qui le rappelle volontiers.",
      "**Traits.** Filer à l'anglaise, Pacte du cartel, Saut de fusée. Taille Petite, vitesse 9 m, vision dans le noir 18 m."
    ])
  }),
  peuple({
    ...PANDAREN, img: icone("magic/holy/yin-yang-balance-symbol"), indiceTaille: "Moyen (1,80 à 2,10 m, rond et souple).",
    vitesse: 9, vision: null, traits: pandaren,
    texte: decrire([
      "**Sans faction.** La Pandarie est cachée dans les brumes depuis la Grande Fracture. Quelques vagabonds pandarens parcourent pourtant le monde, comme Chen Brune d'Orage, maître brasseur qui a combattu aux côtés de Rexxar et de la Horde naissante.",
      "Un pandaren joueur est un voyageur curieux, gourmand et redoutable à mains nues, que les deux factions accueillent avec étonnement.",
      "**Traits.** Paume tremblante, Rebond, Gourmet, Paix intérieure. Taille Moyenne, vitesse 9 m, pas de vision dans le noir."
    ])
  })
];

// Faction d'usage de chaque peuple (guide du joueur, essais).
export const FACTIONS = {
  alliance: ["humain", "nain", "gnome", "elfe-de-la-nuit", "draenei", "worgen"],
  horde: ["orc", "troll", "tauren", "reprouve", "elfe-de-sang", "gobelin"],
  neutre: ["pandaren"]
};

export const TRAITS = [...humain, ...nain, ...gnome, ...elfeNuit, ...draenei, ...worgen, ...orc, ...troll, ...tauren, ...reprouve, ...elfeSang, ...gobelin, ...pandaren];
export const PEUPLES = [...PEUPLES_DOCS, ...TRAITS];
