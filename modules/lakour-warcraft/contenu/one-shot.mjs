// « Une nuit aux Deux Lanternes » — one-shot d'enquête et d'horreur pour 3 à 5 personnages de niveau 3, à jouer en une
// soirée (3 à 4 heures). Une nuit d'orage au relais du Gué-Brumeux, au nord du marécage d'Âprefange, entre les Tarides
// et Theramore (an 21) : un médecin de Theramore qui est un nécromancien du Culte des Damnés, une réprouvée qu'on
// soupçonne à tort, et un cimetière de réfugiés de Lordaeron qu'il veut relever à l'heure morte. Groupe de l'Alliance,
// de la Horde ou mixte. Textes originaux ; profils chiffrés adaptés du SRD 5.2 (CC-BY-4.0), voir CREDITS.md.
// Réutilise le bestiaire par liens (goule, squelette, abomination, bandit, garde, grunt, loup, marchand, paysan) ; seuls
// les quatre PNJ nommés qui portent l'intrigue ont leur fiche.
import { action, attaque, attaquesMultiples, pnj, sauvegarde, trait } from "./acteurs.mjs";
import { MODULE, journal, table } from "./aides.mjs";
import { CARTES_ONE_SHOT, TITRE_ONE_SHOT } from "./one-shot-cartes.mjs";
import { TITRE_CAMPAGNE } from "./campagne-cartes.mjs";
import { AVENTURE_DOCUMENTS } from "./aventure.mjs";
import { CAMPAGNE_DOCUMENTS } from "./campagne.mjs";
import { BESTIAIRE } from "./bestiaire.mjs";
import { OBJETS } from "./objets-azeroth.mjs";
import { TABLES, degats, jet, jetSauvegarde, liens, reference } from "./guides.mjs";

// ---------------------------------------------------------------- PNJ nommés

export const PNJ_ONE_SHOT = [
  pnj({ cle: "hilde-brunval", nom: "Hilde Brunval, hôtesse des Deux Lanternes", fp: 1, type: "humanoïde", sousType: "humain",
    alignement: "Neutre bon", ca: 13, armure: "cuir clouté sous le tablier", pv: 33, dv: "6d8 + 6",
    carac: { for: 14, dex: 12, con: 13, int: 11, sag: 14, cha: 13 }, competences: { perception: 1, intuition: 1, intimidation: 1 },
    langues: "commun, orc", disposition: 1, role: "elite",
    capacites: [
      trait("Maîtresse de maison", "Dans le relais des Deux Lanternes, Hilde a l'avantage aux tests de Sagesse (Perception) et (Intuition) : elle connaît chaque latte qui grince et chaque client qui ment."),
      attaque("Hachoir", { toucher: 4, degats: "1d6+2", type: "tranchant", arme: "simple" }),
      attaque("Arbalète légère", { toucher: 3, degats: "1d8+1", type: "perforant", distance: true, portee: [24, 96], arme: "simple" }),
      action("Voix de sergente", "Hilde aboie un ordre comme au temps de la milice : chaque allié à 9 m ou moins qui l'entend peut utiliser sa réaction pour se déplacer de la moitié de sa vitesse sans provoquer d'attaque d'opportunité.", { activation: "bonus", parJour: 1 })
    ],
    texte: "Une femme solide aux cheveux gris coupés court, un tablier par-dessus un vieux pourpoint de la milice de Lordaeron. Elle parle peu, compte vite et ne lève jamais la voix deux fois.",
    mj: "Ancienne sergente de la milice de Lordaeron, gardienne d'un camp d'internement après la Deuxième Guerre. Une nuit, elle a ouvert la porte à un prisonnier au lieu de donner l'alerte : Durgan. Réfugiée en Kalimdor avec les rescapés, elle a perdu son mari Joren au premier hiver, enterré sur l'îlot des Rescapés. Elle croit que le docteur Crayeval est un saint. Elle reste au relais pour garder Fenna et les voyageurs ; si Joren se relève à l'acte 3 devant elle, elle ne peut pas le frapper." }),

  pnj({ cle: "durgan-brise-fers", nom: "Durgan Brise-Fers, hôte des Deux Lanternes", fp: 2, type: "humanoïde", sousType: "orc",
    alignement: "Neutre bon", ca: 14, armure: "tablier de cuir épais", pv: 45, dv: "6d8 + 18",
    carac: { for: 17, dex: 11, con: 16, int: 10, sag: 12, cha: 9 }, competences: { athletisme: 1, survie: 1 }, sens: { noir: 18 },
    langues: "orc, commun", disposition: 1, role: "elite",
    capacites: [
      trait("Plus jamais de chaînes", "Durgan a l'avantage aux jets de sauvegarde contre les états agrippé, entravé et paralysé, et aux tests pour échapper à une prise."),
      attaquesMultiples("Durgan fait deux attaques : une de Hache de bûcheron et une de Chaîne brisée."),
      attaque("Hache de bûcheron", { toucher: 5, degats: "1d12+3", type: "tranchant", arme: "guerre" }),
      attaque("Chaîne brisée", { toucher: 5, degats: "1d6+3", type: "contondant", allonge: 3, arme: "guerre",
        effet: "Si la cible est de taille M ou inférieure, elle est agrippée (évasion DD 13)." })
    ],
    texte: "Un orc massif à la peau vert-gris, des cicatrices de fers aux deux poignets. Il porte autour de la taille, en guise de ceinture, la chaîne qu'on lui a ôtée. Il cuisine bien et parle encore mieux aux chevaux qu'aux gens.",
    mj: "Ancien prisonnier du camp que gardait Hilde ; elle l'a laissé partir, il ne l'a jamais oublié. Ils ont rebâti ensemble l'entrepôt de l'ancien camp de réfugiés pour en faire le relais. Il a muré lui-même le boyau des contrebandiers sous la cave il y a deux ans, et prend sa réouverture comme une insulte personnelle. Il descend avec le groupe à l'acte 2 et le suit jusqu'à l'îlot. Il méprise les cultistes de tout poil : la Horde a déjà payé pour avoir écouté des démons." }),

  pnj({ cle: "vesper-lacombe", nom: "Vesper Lacombe, réprouvée de Brumefeuille", fp: 1, type: "humanoïde", sousType: "réprouvée",
    alignement: "Neutre", ca: 13, armure: "cuir", pv: 27, dv: "6d8", carac: { for: 10, dex: 15, con: 10, int: 12, sag: 13, cha: 11 },
    competences: { discretion: 1, perception: 1, intuition: 1 }, sens: { noir: 18 }, resistances: ["nécrotique"],
    langues: "commun, bas-parler", disposition: 0, role: "elite",
    capacites: [
      trait("Volonté des Réprouvés", "Vesper ne dort pas, ne respire pas et ne mange pas. Elle a l'avantage aux jets de sauvegarde contre les états charmé et effrayé, et la magie ne peut pas l'endormir."),
      trait("Rancune", "Vesper a l'avantage aux jets d'attaque contre Aldwin Crayeval, et lui inflige 7 (2d6) dégâts nécrotiques de plus quand elle le touche."),
      attaque("Couteau de boulangère", { toucher: 4, degats: "1d4+2", type: "perforant", arme: "simple" }),
      attaque("Arbalète de poing", { toucher: 4, degats: "1d6+2", type: "perforant", distance: true, portee: [9, 36], arme: "guerre" })
    ],
    texte: "Une silhouette encapuchonnée, maigre à faire peur, qui sent la terre froide et la lavande séchée. Sous le capuchon, une mâchoire recousue avec soin et deux yeux pâles qui ne clignent jamais.",
    mj: "Boulangère à Brumefeuille, au nord de Lordaeron, quand un certain maître Varn a vendu au village du grain bon marché. Le village est mort, puis s'est relevé ; Vesper avec lui. Libérée du Fléau avec les Réprouvés, elle a traversé la mer pour retrouver Varn, devenu le docteur Aldwin Crayeval. Elle l'a reconnu ce soir. Elle ment d'abord sur ses raisons (« je vais à Theramore voir de la famille ») et laisse les vivants la soupçonner. Défendue, elle devient une alliée loyale ; humiliée, elle part seule et attend Aldwin dans la chapelle de l'îlot. Elle veut le tuer ; on peut la convaincre de le laisser vivre pour qu'il soit jugé." }),

  pnj({ cle: "aldwin-crayeval", nom: "Aldwin Crayeval, le bon docteur", fp: 3, type: "humanoïde", sousType: "humain",
    alignement: "Neutre mauvais", ca: 12, armure: "manteau de cuir huilé", pv: 58, dv: "9d8 + 18",
    carac: { for: 9, dex: 12, con: 14, int: 17, sag: 13, cha: 12 }, sauvegardes: ["int", "sag"],
    competences: { medecine: 2, arcanes: 1, tromperie: 1, persuasion: 1 }, langues: "commun, thalassien, quelques mots d'orc",
    disposition: 0, role: "chef",
    capacites: [
      trait("Bon docteur", "Tant qu'il n'a attaqué personne, Aldwin a l'avantage aux tests de Charisme (Tromperie) et (Persuasion), et percer son jeu par un test de Sagesse (Intuition) demande un DD de 15."),
      trait("Incantation", "Aldwin lance ses sorts avec l'Intelligence (DD 13). À volonté : *contact glacial*, *main de mage*. 1/jour chacun : *simulacre de vie*, *immobilisation de personne*, *animation des morts*."),
      attaque("Scalpel", { toucher: 3, degats: "1d4+1", type: "perforant", plus: [["1d6", "poison"]], arme: "simple" }),
      attaque("Rayon de peste", { toucher: 5, degats: "2d8", type: "nécrotique", distance: true, magique: true, portee: [36] }),
      sauvegarde("Fiole de mouches", { carac: "con", dd: 13, zone: { forme: "sphere", taille: 3 }, degats: "3d6", type: "poison", recharge: 5,
        texte: "Aldwin brise une fiole sur un point qu'il voit à 18 m ou moins : une nuée de mouches grises en jaillit.",
        echec: "La créature est empoisonnée jusqu'à la fin de son prochain tour" }),
      action("Chair servile", "Quand Aldwin subit des dégâts alors qu'un mort-vivant qui lui obéit se trouve à 1,5 m ou moins de lui, ce mort-vivant les subit à sa place.", { activation: "réaction", parJour: 2 })
    ],
    texte: "Un homme mince d'une cinquantaine d'années, rasé de près, lunettes rondes et manteau de médecin bien brossé. Il a une trousse de cuir pour chaque maladie et un mot gentil pour chaque malade.",
    mj: "Nécromancien du Culte des Damnés. À Lordaeron, sous le nom de maître Varn, il vendait aux villages du grain qui portait la peste. Il a suivi les réfugiés en Kalimdor sur ordre du Cercle, se fait passer pour un médecin de Theramore et soigne gratuitement la fièvre des marais pour qu'on lui ouvre toutes les portes. Il paie ses chambres aux Deux Lanternes en farine de peste, a rouvert le boyau des contrebandiers pour y installer son laboratoire, et veut relever le cimetière des Rescapés à l'heure morte. Il n'aime pas se battre : il garde un mort-vivant près de lui, frappe de loin et fuit en barque à 15 PV. Capturé, il marchande sa vie contre les noms des autres « frères »." })
];

// ---------------------------------------------------------------- Table propre au one-shot

// Rattachée au one-shot (drapeau « aventure ») : le guide du MJ lie les tables génériques, pas celle-ci.
const TABLE_BRUITS = table({
  cle: "bruits-de-la-nuit", nom: "Bruits de la nuit aux Deux Lanternes", formule: "1d8",
  description: "Entre deux scènes de l'acte 1, ou quand la table s'endort : un événement de la nuit d'orage au relais. Chacun peut servir d'indice, de fausse piste ou de prétexte à une dispute.",
  resultats: [
    [1, 1, { titre: "Le coup de tonnerre", texte: "Toutes les chandelles de la salle commune s'éteignent d'un coup. Quand on les rallume, Kazra s'est postée entre Vesper et la porte, la main sur sa hache." }],
    [2, 2, { titre: "Le loup qui gronde", texte: "À l'écurie, Cendre, le loup de Kazra, gronde vers la cuisine, poils hérissés, et refuse de s'éloigner du mur. Juste derrière se trouve la trappe de la cave." }],
    [3, 3, { titre: "On frappe à la porte", texte: "Trois coups. Personne dehors. Dans la boue, des traces de pieds nus viennent de la rivière jusqu'au seuil, puis y retournent." }],
    [4, 4, { titre: "Talismans anti-revenants", texte: "Pip Zinguette fait le tour des tables avec ses talismans anti-revenants, deux pièces d'or l'un. Il en a déjà vendu six. Aucun ne marche, mais Pip y croit un peu." }],
    [5, 5, { titre: "La cloche qui répond", texte: "La clochette du bac tinte seule au bout de sa corde. Très loin sur le marais, une cloche plus grave lui répond, une seule fois." }],
    [6, 6, { titre: "La berceuse", texte: "Fenna fredonne en dormant une berceuse du nord de Lordaeron. Vesper, qui ne dort jamais, la connaît, et la termine à voix basse." }],
    [7, 7, { titre: "Le râtelier", texte: "Le sergent Pell et Kazra s'accusent l'un l'autre d'avoir touché à leurs armes. Personne n'y a touché : l'eau monte sous le plancher et fait pencher le râtelier." }],
    [8, 8, { titre: "L'odeur sucrée", texte: "Une odeur de miel tourné monte entre les lattes de la cuisine. Durgan jure qu'il a muré la vieille cave des contrebandiers il y a deux ans." }]
  ]
});
TABLE_BRUITS.flags[MODULE].aventure = TITRE_ONE_SHOT;
export const TABLES_ONE_SHOT = [TABLE_BRUITS];

// ---------------------------------------------------------------- Aides de jeu (visibles)

const AIDE_RELAIS = journal({ cle: "relais-deux-lanternes", nom: "Aide de jeu — Le Relais des Deux Lanternes", visible: true, pages: [
  { titre: "Le règlement des Deux Lanternes", texte: `
*Une planche peinte, clouée près de la porte. Chaque règle est écrite deux fois : en commun au-dessus, en orc en dessous, d'une autre main.*

**RELAIS DES DEUX LANTERNES — GUÉ-BRUMEUX**
*Lanterne bleue, lanterne rouge : ici, tout le monde mange.*

- Les armes dorment au râtelier. Elles se réveillent à l'aube.
- On paie d'avance : 5 pa la nuit, 3 pa la soupe. Les dettes se règlent à la vaisselle.
- Pas de guerre sous ce toit. Ni la vôtre, ni celle de vos pères.
- Le bac part quand Bram le dit. Bram ne discute pas avec la rivière.
- Les vivants et les autres paient le même prix.

*H. Brunval — D. Brise-Fers.*
*(La dernière règle a été ajoutée plus tard, à la craie, par la main qui écrit en orc.)*` },
  { titre: "Le registre des voyageurs", texte: `
*Un gros cahier taché de cire, ouvert sur le comptoir. L'écriture de Hilde est droite et serrée ; ses remarques sont dans la marge.*

- **Il y a un mois** — Dr A. Crayeval, de Theramore. Chambre du docteur. *A payé en farine : trois sacs. Brave homme.*
- **Neuf jours après** — Dr A. Crayeval. Chambre du docteur. *Deux sacs.* — *Bram : des lumières sur l'îlot cette nuit.*
- **Neuf jours après** — Dr A. Crayeval. *Trois sacs.* — *Bram : encore les lumières. Je lui ai dit de laisser la gnôle.*
- **La semaine dernière** — Une caravane du Carrefour, quatre kodos. *Ont acheté deux sacs de farine pour la route.*
- **Hier** — Dr A. Crayeval. Chambre du docteur. *En avance de deux jours, cette fois.*
- **Aujourd'hui** — Sergent O. Pell et F. Marlow, garde de Theramore. — Kazra, courrière d'Orgrimmar, et un loup (écurie). — Pip Zinguette, « tout à vendre ». — V. de Brumefeuille. *N'a rien mangé. Paie en vieilles pièces de Lordaeron.*
- *Marge : Bram parti relever les nasses à midi. Pas rentré.*
- *(Une ligne vide, pour vous.)*` }
] });

const AIDE_CARNET = journal({ cle: "carnet-crayeval", nom: "Aide de jeu — Le carnet du docteur Crayeval", visible: true, pages: [
  { titre: "Lettre du Cercle", texte: `
*Une lettre pliée en quatre, glissée dans la couverture d'un carnet de cuir noir. L'encre est vert-noir. Pas de signature : une main ouverte, dessinée à la place.*

Frère Varn,

Le Cercle a lu tes comptes. Les villages du Nord sont tombés comme prévu ; tu as bien semé.

Les rescapés ont fui par la mer. Ils croient avoir laissé la peste derrière eux. Ils ont emporté leurs morts, leurs souvenirs et leur faim : suis-les.

Sur l'autre rive, deux peuples qui se haïssent mangent le même pain sans le savoir. Donne-leur le nôtre. Puis rends aux réfugiés ceux qu'ils ont enterrés en chemin : rien ne brise un cœur comme un visage aimé qui revient.

Quand le premier cimetière se lèvera, d'autres frères te rejoindront. Celui qui règne au Nord n'oublie aucun de ses serviteurs.

*— Pour le Cercle, une main qui ne tremble pas.*` },
  { titre: "Croquis du cimetière", texte: `
*Sur une double page du carnet, un plan à la plume, précis comme une planche d'anatomie. Les annotations d'Aldwin sont en petites lettres penchées.*

- **Le ponton**, au sud. *« Une seule barque. Amarrer à gauche : la vase tient. »*
- **La cloche des Rescapés**, au centre, sur son portique. *« Trois fois trois coups, à l'heure morte. Les morts de la fièvre répondent aux cloches : ils l'ont entendue sonner pour chacun d'eux. »*
- **Les tombes**, en rangées. *« Quarante et une. J. Brunval, troisième rang à l'ouest. L'hôtesse ne doit rien savoir avant. »*
- **Le mausolée**, au nord-ouest. *« L'enfant y attendra. Il obéit à la cloche, comme les autres. »*
- **La chapelle**, sans toit. *« Inutile. Leurs prières n'ont sauvé personne. »*

*Dans la marge, souligné deux fois : « Si la cloche se tait, tout s'arrête. Ne lâcher la corde sous aucun prétexte. »*` }
] });

// ---------------------------------------------------------------- Journal du MJ (caché)

// Liens @UUID vers les fiches, objets, tables, cartes, aides de jeu et journaux des autres aventures ; une cible inconnue
// fait échouer la construction.
const lien = liens(PNJ_ONE_SHOT, BESTIAIRE, OBJETS, TABLES, TABLES_ONE_SHOT, CARTES_ONE_SHOT, [AIDE_RELAIS, AIDE_CARNET],
  AVENTURE_DOCUMENTS, CAMPAGNE_DOCUMENTS);
const fiche = (cle, nom) => lien(`bestiaire:${cle}`, nom);
const carte = cle => lien(`scenes:${cle}`);

const JOURNAL_MJ = journal({ cle: "one-shot-deux-lanternes", nom: `One-shot — ${TITRE_ONE_SHOT}`, visible: false, pages: [
  { titre: "Synopsis (MJ)", texte: `
**${TITRE_ONE_SHOT}** est un one-shot d'enquête et d'horreur pour 3 à 5 personnages de **niveau 3**, prêt à jouer en une soirée de **3 à 4 heures**. Tout se passe en une seule nuit d'orage, du souper à l'aube. Le groupe peut être de l'Alliance, de la Horde ou mélangé : le relais accueille tout le monde.

**Cadre.** An 21, quelques mois après la fondation d'Orgrimmar et de Theramore. Au nord du marécage d'Âprefange, la piste qui relie les Tarides à Theramore traverse une rivière boueuse au **Gué-Brumeux**. Un bac y passe les voyageurs et un relais les loge : les **Deux Lanternes**. Une lanterne bleue et une rouge pendent à sa porte, pour que chacun sache qu'il y sera servi. Le relais est tenu par **${fiche("hilde-brunval", "Hilde Brunval")}**, ancienne sergente de la milice de Lordaeron, et **${fiche("durgan-brise-fers", "Durgan Brise-Fers")}**, un orc qu'elle gardait autrefois dans un camp d'internement, et à qui elle a ouvert la porte une nuit au lieu de donner l'alerte.

**La vérité.** **${fiche("aldwin-crayeval", "Aldwin Crayeval")}**, « le bon docteur de Theramore », passe au relais tous les neuf jours depuis un mois pour soigner gratuitement la fièvre des marais. C'est un nécromancien du **Culte des Damnés**. À Lordaeron, sous le nom de maître Varn, il vendait aux villages du grain qui portait la peste ; il a suivi les réfugiés en Kalimdor pour y semer le Fléau. Sous le relais, il a rouvert un vieux boyau de contrebandiers que Durgan avait muré, et y a installé son laboratoire. Il paie ses chambres en **sacs de farine** : une farine de peste, qui donne la fièvre et fait se relever ceux qui meurent avec elle dans le ventre. Sur l'îlot voisin, le **cimetière des Rescapés** garde une quarantaine de réfugiés de Lordaeron emportés par la fièvre au premier hiver, dont Joren, le mari de Hilde. À l'**heure morte**, trois heures du matin, Aldwin veut sonner la **cloche des Rescapés** et les relever tous : le premier nid du Fléau sur Kalimdor, à une journée de Theramore et du Carrefour.

**Pourquoi cette nuit.** L'orage a bloqué au relais **${fiche("vesper-lacombe", "Vesper Lacombe")}**, une réprouvée de **Brumefeuille**, le village où maître Varn vendait son grain. Elle l'a reconnu, et il l'a reconnue. Aldwin avance son rituel et lâche ses morts pour couvrir sa fuite. Pour tous les autres, c'est Vesper, la morte, qu'on soupçonnera d'abord.

**Déroulement et cartes** (compendium *La Kour Warcraft — Scènes*)
- Acte 1 — L'orage au relais, environ 75 minutes : carte *${carte("gue-brumeux-relais")}*
- Acte 2 — Sous le relais, environ 60 minutes : carte *${carte("gue-brumeux-caves")}*
- Acte 3 — Le cimetière des Rescapés, environ 60 minutes : carte *${carte("cimetiere-des-rescapes")}*

Les PNJ nommés et les créatures sont dans le compendium *La Kour Warcraft — Bestiaire* (liens dans chaque acte et dans « PNJ et forces en présence »).

**Aides de jeu** (visibles des joueurs) : ${lien("journaux:relais-deux-lanternes")} (acte 1, deux pages) et ${lien("journaux:carnet-crayeval")} (acte 2, deux pages). Pour meubler la nuit : la table ${lien("tables:bruits-de-la-nuit")}.` },

  { titre: "Accroches et minutage", texte: `
**Accroches** (une seule suffit ; dans un groupe mixte, donnez-en une par faction)
- **La route** : le groupe se rend à Theramore ou au Carrefour, et le bac du Gué-Brumeux est le seul passage avant la nuit. L'orage décide pour lui.
- **Le courrier** (Horde ou groupe mixte) : la courrière **Kazra Croc-Gris** (profil de ${fiche("grunt-orgrimmar", "Grunt d'Orgrimmar")}) porte des dépêches de paix d'Orgrimmar à Theramore. Elle paie 10 po par tête pour une escorte jusqu'au bac.
- **La patrouille** (Alliance ou groupe mixte) : le **sergent Odran Pell** (profil de ${fiche("garde-hurlevent", "Garde de Hurlevent")}) ramène à Theramore une jeune recrue, **Fenna Marlow**, et cherche des bras pour la route du marais.
- **Le passeur** : Hilde a fait savoir à Theramore qu'elle cherche quelqu'un de solide. Son passeur, **Bram**, jure voir des lumières sur l'îlot des Rescapés certaines nuits. Elle offre 10 po par personne pour aller voir, « quand l'orage sera passé ».
- **La revenante** (un personnage réprouvé, ou des chasseurs de primes) : ${fiche("vesper-lacombe", "Vesper")} cherche des alliés pour retrouver « un homme de Lordaeron » dont elle ne connaît que l'ancien nom.

**L'horloge de la nuit**
- 18 h : arrivée sous la pluie. Le bac ne traversera plus avant l'aube.
- 19 h : souper. Aldwin est à table et charme tout le monde. Le pain est fait avec sa farine.
- 22 h : Fenna Marlow tombe malade.
- 23 h : Aldwin « monte se coucher ». Il descend en fait par la trappe de la cuisine, avec sa clé.
- Minuit : les morts sortent de la cave (combat).
- 1 h : le groupe descend sous le relais (acte 2).
- 2 h 30 : traversée du marais.
- 3 h, l'heure morte : Aldwin sonne la cloche. Chaque demi-heure de retard du groupe fait commencer le rituel un palier plus haut (voir l'acte 3).
- 6 h : l'aube. La pluie cesse, le bac repart.

**Minutage d'une soirée** : 15 minutes d'installation et d'accroche, 75 pour l'acte 1, 60 pour l'acte 2, 60 pour l'acte 3, 15 pour l'épilogue. Si le temps manque, coupez l'ossuaire de l'acte 2 et faites trouver le carnet par Bram.

**Pour meubler la nuit** : entre deux scènes de l'acte 1, tirez ou choisissez un événement dans ${lien("tables:bruits-de-la-nuit")}. Pour un voyageur de plus, piochez dans ${lien("tables:visages-d-azeroth")}.` },

  { titre: "Acte 1 — L'orage au relais", texte: `
**Carte :** *${carte("gue-brumeux-relais")}*. De 18 h à 1 h du matin environ. Dedans, la lumière de la cheminée et des lampes ; dehors, la nuit, la pluie et les deux lanternes de la porte.

**À lire :** *La pluie tombe si fort qu'elle rebondit dans la boue. Au bout de la piste, deux lanternes se balancent au-dessus d'une porte, une bleue et une rouge ; derrière la fenêtre jaune bouge une ombre énorme. Sur la rivière, un bac vide tire sur sa corde. Une femme aux cheveux gris ouvre avant que vous ayez frappé : « Entrez, ou noyez-vous, mais décidez-vous vite. Les armes au râtelier. Ici, on laisse sa guerre dehors. »*

**Les hôtes.** **${fiche("hilde-brunval", "Hilde")}** tient la salle et les comptes, **${fiche("durgan-brise-fers", "Durgan")}** la cuisine, l'écurie, et le bac quand Bram n'est pas là. Montrez aux joueurs ${lien("journaux:relais-deux-lanternes#Le règlement des Deux Lanternes", "le règlement des Deux Lanternes")}, cloué près de la porte (première page de l'aide de jeu). Une nuit coûte 5 pa, le souper 3 pa. Sur le Comptoir, ${lien("journaux:relais-deux-lanternes#Le registre des voyageurs", "le registre des voyageurs")} attend leurs noms (seconde page) : laissez les joueurs le lire, il cache trois indices.

**Les voyageurs bloqués** (profils du bestiaire)
- **Sergent Odran Pell** et la recrue **Fenna Marlow**, de Theramore (profil de ${fiche("garde-hurlevent", "Garde de Hurlevent")}). Pell a perdu sa famille à Andorhal : il ne supporte pas les morts qui marchent.
- **Kazra Croc-Gris**, courrière d'Orgrimmar (profil de ${fiche("grunt-orgrimmar", "Grunt d'Orgrimmar")}), et son loup **Cendre** (profil de ${fiche("loup", "Loup des bois")}), qui dort à l'Écurie. Elle porte des dépêches scellées et ne dit pas pour qui.
- **Pip Zinguette**, colporteur gobelin (profil de ${fiche("marchand", "Marchand")}), dont le Chariot de Pip attend dans la cour.
- **${fiche("vesper-lacombe", "Vesper Lacombe")}**, encapuchonnée, seule près de la Cheminée. Elle ne mange pas et ne quitte pas le docteur des yeux.
- **${fiche("aldwin-crayeval", "Aldwin Crayeval")}**, affable, qui offre une tournée et prend des nouvelles de chacun.

**La tension.** Au souper, autour de la Grande table, le sergent Pell exige que « la morte » dorme à l'écurie, ou dehors. Kazra répond que les Réprouvés marchent désormais avec la Horde, et que la Horde dort où elle veut. Hilde se tourne vers les personnages : à eux de trancher. **${jet("Persuasion", 12)}** ou **${jet("Intimidation", 13)}** pour calmer la table ; en cas d'échec, Pell et Kazra en viennent aux mains et Durgan les sépare. **${jet("Intuition", 12)}** sur Vesper : elle n'a pas peur des vivants, elle a peur de quelqu'un dans cette pièce. **${jet("Intuition", 15)}** sur Aldwin (son trait Bon docteur rend le test difficile) : son sourire ne monte jamais jusqu'aux yeux quand il regarde Vesper.

**Le registre** (indices)
- Aldwin vient tous les neuf jours et paie en sacs de farine. Hilde ne les a jamais refusés : la farine est rare au marais.
- Bram a noté trois fois des « lumières sur l'îlot », toujours les nuits où le docteur dormait au relais.
- Vesper a signé « V. de Brumefeuille ». **${jet("Histoire", 13)}** : Brumefeuille est un village du nord de Lordaeron, mort de la peste parmi les premiers.

**22 h : Fenna tombe malade.** La recrue tremble, transpire, puis délire. Aldwin se précipite pour la « soigner ». **${jet("Médecine", 13)}** : ce n'est pas la fièvre des marais, mais la **peste** de Lordaeron (des taches grises sous les ongles, une haleine sucrée). **${jet("Médecine", 15)}**, ou **${jet("Investigation", 14)}** dans la Cuisine : la maladie vient du pain du souper, et le pain des Sacs de farine. Aldwin conseille de la laisser dormir et monte se coucher à 23 h.

**Le pain.** Chaque personnage qui a mangé du pain au souper fait à minuit un **${jetSauvegarde("Constitution", 11, "jet de sauvegarde de")}**. En cas d'échec, il est ${reference("empoisonné")} jusqu'à l'aube, ou jusqu'à ce qu'on le soigne (*restauration partielle*, ou le remède du laboratoire de l'acte 2). Fenna, elle, meurt à 2 h si personne ne la soigne, et se relève à 3 h : une ${fiche("goule", "goule")} dans la chambre des voyageurs.

**Minuit : la trappe de la cave.** La Trappe de la cave saute dans la cuisine. **Deux ${fiche("goule", "goules")}**, des noyés du marais qu'Aldwin gardait en bas, sortent et attaquent la personne la plus proche (une goule de plus pour cinq personnages, une de moins pour trois, remplacée par un ${fiche("squelette", "squelette")}). Le loup de Kazra hurle à l'écurie. Si Vesper est dans la salle, le sergent Pell la désigne aussitôt : « C'est elle qui les a appelés ! » Hilde et Durgan défendent la cuisine ; Pip se cache sous la Grande table.

**Après le combat**
- **La Chambre du docteur** est vide, la fenêtre fermée de l'intérieur. **${jet("Investigation", 13)}** sur la Malle du docteur : un double fond, une clé neuve qui ouvre la trappe de la cave, et un flacon d'encre vert-noir. **${jet("Arcanes ou Religion", 13)}** : une encre de nécromancien, celle des grimoires du **Culte des Damnés**.
- **Vesper** parle si on l'a défendue devant Pell, ou si on la presse (**${jet("Persuasion", 13)}**, avantage avec la clé ou l'encre) : « À Brumefeuille, il s'appelait maître Varn. Il vendait du grain pas cher. Un mois plus tard, le village était mort. Puis il s'est relevé. J'en étais. » Elle veut Aldwin, vivant ou non, et met son arbalète au service du groupe.
- **Durgan** se souvient : sous la cave, un vieux **boyau de contrebandiers** mène au marais. Il l'a muré lui-même il y a deux ans. **${jet("Perception", 12)}** au pied de la trappe : des traces de boue fraîche qui remontent de la cave.
- **Bram**, le passeur, n'est pas rentré de l'après-midi. Sa barque n'est plus dans la Remise du passeur, et **${jet("Survie", 12)}** près du Ponton du bac : personne n'est parti par la rivière.

**Qui reste au relais ?** Hilde garde Fenna et les voyageurs. Durgan insiste pour descendre avec le groupe (un allié ; confiez-le à un joueur si le groupe n'a que trois personnages). Vesper suit le groupe, ou part seule si on l'a humiliée : on la retrouvera dans la chapelle de l'îlot à l'acte 3.` },

  { titre: "Acte 2 — Sous le relais", texte: `
**Carte :** *${carte("gue-brumeux-caves")}*. De 1 h à 2 h 30. Obscurité totale hors des lumières de la carte.

**À lire :** *L'escalier grince à chaque marche. En bas, entre les tonneaux de bière, il fait plus froid qu'il ne devrait. Dans le mur du fond, les briques que Durgan avait posées gisent en tas, et derrière s'ouvre un boyau noir, assez haut pour qu'un nain y passe sans baisser la tête. De très loin, au bout du noir, monte une odeur de miel tourné.*

**La cave du relais.** Les Sacs de farine marqués : **${jet("Investigation", 12)}**, un petit sceau cousu dans la toile ; **${jet("Histoire ou Religion", 13)}**, le symbole du **Culte des Damnés**. Les Gravats du mur ont été poussés depuis le boyau. Durgan jure en orc. Dans la Réserve, derrière les Caisses de contrebande : une lanterne sourde et une corde de 15 m, bien utiles dans la galerie noyée.

**Le boyau des contrebandiers.** Bas et humide. À mi-chemin, l'Étai pourri est relié à un fil tendu au ras du sol : **${jet("Perception", 13)}** pour le voir, **${jet("outils de voleur", 12)}** pour le détacher. Qui le déclenche fait tomber le plafond : **${jetSauvegarde("Dextérité", 13)}**, ${degats("2d10", "contondant")} (moitié en cas de réussite), et l'éboulement sépare le groupe en deux pendant 10 minutes (**${jet("Athlétisme", 12)}** pour dégager le passage plus vite).

**Le laboratoire.** **Deux acolytes du Culte** (profil de ${fiche("bandit-defias", "Bandit défias")}, une main noire tatouée sur la paume) chargent les Sacs prêts à partir. Ils se battent, puis fuient vers l'ossuaire pour réveiller les morts.

**À lire :** *Une pièce de pierre, propre comme un cabinet de chirurgien. Des bocaux sur une étagère, des alambics qui fument doucement, un chaudron où bouillonne une pâte grise. Au milieu, une table de dissection aux sangles arrachées. Elle est vide, mais quelque chose y était attaché il y a peu.*

**Indices du laboratoire**
- La Table de dissection : **${jet("Médecine", 12)}**, des fils de suture et les morceaux de plusieurs corps cousus ensemble ; **${jet("Arcanes", 14)}**, une abomination, un « recousu » assez grand pour porter un tonneau. Il n'est plus là (acte 3).
- Le Pupitre du docteur : le carnet d'Aldwin. Montrez aux joueurs ${lien("journaux:carnet-crayeval#Lettre du Cercle", "la lettre du Cercle")} (première page de l'aide de jeu), qui l'a envoyé en Kalimdor, puis ${lien("journaux:carnet-crayeval#Croquis du cimetière", "le croquis du cimetière")} (seconde page) : la cloche, trois fois trois coups à l'heure morte, et le mausolée où il garde « l'enfant ».
- L'Étagère de bocaux : deux ${lien("objets:potion-de-soins", "potions de soins")} et un flacon étiqueté « contre-mesure ». **${jet("Médecine", 12)}** : le remède à la farine de peste, assez pour quatre personnes. Il met fin à l'état empoisonné du pain, et sauve Fenna si on le lui porte avant 2 h.
- Les Sacs prêts à partir portent deux adresses : « intendance de Theramore » et « comptoir du Carrefour ». Les deux camps devaient manger le même pain.

**Le cachot.** Porte verrouillée : **${jet("outils de voleur", 12)}**, ou la clé d'un acolyte. **Bram** le passeur (profil de ${fiche("paysan", "Paysan")}) y est enchaîné, fiévreux mais vivant. Il a surpris Aldwin il y a trois jours et devait être le premier des nouveaux « Rescapés ». Libéré, il connaît le marais par cœur.

**L'ossuaire.** Les contrebandiers y jetaient ceux qui parlaient trop. **Quatre ${fiche("squelette", "squelettes")}** se lèvent des Niches d'ossements quand un vivant entre (deux de plus si les acolytes ont fui jusqu'ici). Dans le Vieux coffre : 40 po en vieilles pièces de Lordaeron.

**La galerie noyée.** De l'eau noire et glacée jusqu'à la taille : un ${reference("terrain difficile")}, et l'obscurité y est totale, même une torche à la main. Les Éboulis cachent un passage étroit (**${jet("Athlétisme", 10)}** pour s'y glisser avec son équipement).

**L'embarcadère caché.** La barque d'Aldwin est partie. Reste la Barque du passeur : Bram la reconnaît, c'est la sienne. Quatre places, six en se serrant.

**La traversée.** Un quart d'heure de rames dans la brume. Avec Bram, aucun test. Sans lui : **${jet("Survie", 13)}** pour trouver l'îlot ; en cas d'échec, le groupe arrive avec une demi-heure de retard.

**Équilibre :** acolytes et squelettes forment un combat facile pour quatre personnages de niveau 3 ; il entame leurs ressources avant l'acte 3. Avec trois personnages, ne gardez que trois squelettes ; avec cinq, ajoutez une ${fiche("goule", "goule")} dans la galerie noyée.` },

  { titre: "Acte 3 — Le cimetière des Rescapés", texte: `
**Carte :** *${carte("cimetiere-des-rescapes")}*. Vers 3 h, l'heure morte. Pluie fine et brume ; aucune autre lumière que celles de la carte.

**À lire :** *La barque racle la vase. L'îlot sort de la brume : des croix de bois penchées, des tombes basses, une chapelle sans toit et, au milieu, sur un portique de chêne noirci, une cloche de bronze. Un homme en manteau de médecin tient la corde à deux mains. Il vous regarde arriver sans surprise. « Vous arrivez à temps pour l'office », dit le docteur Crayeval. Et il tire.*

**Forces en présence.** **${fiche("aldwin-crayeval", "Aldwin Crayeval")}** près de la Cloche des Rescapés, derrière le Brasero de peste. Dans le Mausolée, **le Recousu** (profil d'${fiche("abomination", "Abomination")}), son « enfant », qui sort au premier coup de cloche. Si Vesper est venue seule, elle attend dans la Chapelle en ruine et tire sur Aldwin dès le premier round.

**Le rituel** (un palier tous les 3 rounds, compté dès que le groupe pose le pied sur l'îlot ; un palier de plus par demi-heure de retard) :
1. Les Tombes fraîchement ouvertes se fendent : **trois ${fiche("squelette", "squelettes")}** en sortent.
2. La Tombe de Joren Brunval s'ouvre : **Joren** se relève (une ${fiche("goule", "goule")}), avec une autre goule. Si Hilde est là, elle ne peut pas le frapper ; un personnage peut la ramener à elle (**${jet("Persuasion", 12)}**).
3. **La marée des morts.** Toutes les tombes remuent. Le groupe a encore **3 rounds** pour faire taire la cloche ; ensuite, les quarante et un Rescapés se lèvent et marchent vers le relais (voir les dénouements).

**Faire taire la cloche**
- Couper la corde (CA 11, 5 PV, dégâts tranchants seulement) : Aldwin doit alors frapper la cloche à la main, au contact, par une action à chaque round.
- Bloquer le battant : une action au contact et **${jet("Athlétisme", 13)}**.
- Renverser le portique : une action et **${jet("Athlétisme", 16)}**, ou deux personnages qui réussissent chacun **${jet("Athlétisme", 12)}** au même round.
- Sanctifier la cloche : une action et **${jet("Religion", 14)}** ; après deux réussites, elle ne parle plus aux morts.
- Mettre Aldwin hors de combat (${reference("inconscient")}, ${reference("neutralisé")} ou mort) : plus personne ne sonne. Les morts déjà levés restent et se battent.

**Aldwin** se bat de loin (Rayon de peste, Fiole de mouches sur un groupe serré) et garde toujours un mort-vivant près de lui pour sa réaction Chair servile. À 15 PV, il tente de fuir dans la Barque d'Aldwin ; encerclé, il se rend et propose de « tout dire à Theramore ».

**Vesper** veut tuer Aldwin. Si le groupe le veut vivant, il faut la retenir (**${jet("Persuasion", 14)}**, avantage si le groupe l'a défendue au relais).

**Équilibre :** Aldwin, le Recousu et les paliers 1 et 2 forment un combat difficile pour quatre personnages de niveau 3, avec Durgan et Vesper en alliés. Avec trois personnages, le Recousu reste dans le mausolée tant qu'on ne l'ouvre pas, et le palier 2 n'amène que Joren. Avec cinq, ajoutez deux ${fiche("squelette", "squelettes")} au palier 1 et faites sortir le Recousu dès l'arrivée du groupe.` },

  { titre: "Dénouements et récompenses", texte: `
**La cloche se tait avant la marée des morts.** Les morts levés tombent en poussière à l'aube. La pluie cesse, le bac repart. Hilde enterre Joren une seconde fois, seule, et revient servir le petit déjeuner sans un mot. ${fiche("durgan-brise-fers", "Durgan")} rebouche le boyau, au mortier cette fois.

**Aldwin est capturé.** Le sergent Pell le veut pour la justice de Theramore ; Kazra rappelle que la farine partait aussi au Carrefour. Le groupe décide : le livrer à l'un, à l'autre, ou le faire juger par les deux. ${fiche("vesper-lacombe", "Vesper")} accepte le verdict si on la laisse voir Aldwin enchaîné, « comme on enchaînait les orcs ».

**Aldwin est tué.** Vesper reste un long moment devant le corps, puis s'en va dans la brume, apaisée ou vide, on ne saura pas.

**La marée des morts.** Les quarante et un Rescapés marchent sur le relais. Il faut tenir jusqu'à l'aube derrière les volets : Pell, Kazra, Pip, Hilde et Durgan se battent côte à côte avec le groupe (épilogue de 20 minutes, en vagues de ${fiche("squelette", "squelettes")} et de ${fiche("goule", "goules")}). Au matin, les morts retournent à la vase. Le Culte sait désormais que Kalimdor peut porter le Fléau.

**Récompenses**
- Hilde et Durgan : le gîte gratuit à vie aux Deux Lanternes, et une ${lien("objets:pierre-de-foyer", "pierre de foyer")} liée au relais pour chaque personnage. Si Bram est sauvé, il passe le groupe gratuitement, toujours.
- Le sergent Pell : 50 po par personnage si Aldwin est livré vivant à Theramore, et une lettre de recommandation pour la garde.
- Kazra Croc-Gris : un bracelet de cuir à la marque d'Orgrimmar. Dans un poste de la Horde, il vaut un repas, un lit et une oreille attentive.
- Pip Zinguette, s'il a survécu : un ${lien("objets:elixir-de-la-mangouste", "élixir de la mangouste")}, « offert, pour une fois ».
- Vesper : la bague de mariage de sa sœur, en argent (25 po), et une promesse : « Si vous croisez un autre maître Varn, appelez-moi. »
- Sur Aldwin : le carnet, 60 po, une trousse de chirurgien et ce qui reste du remède.
- Le laboratoire : deux ${lien("objets:potion-de-soins", "potions de soins")}, et 40 po dans l'ossuaire.
- Expérience : si la table continue avec la campagne ${lien("journaux:campagne-braises-legion", TITRE_CAMPAGNE)}, les personnages la commencent au niveau 3 ; sinon, ils passent au **niveau 4**.

**Suites possibles**
- **La farine déjà partie.** Le registre parle d'une caravane du Carrefour repartie avec deux sacs ; le carnet, de livraisons à Theramore. Une course contre la peste dans les deux camps à la fois.
- **Le Cercle.** La lettre parle d'autres « frères » envoyés en Kalimdor. L'un d'eux se cache peut-être à Theramore, ou à Cabestan.
- **Vers les Tarides.** Le bac mène au port neutre de Cabestan : le groupe peut y enchaîner avec ${lien("journaux:campagne-braises-legion", "la campagne")}, ou rejouer plus tôt dans l'histoire ${lien("journaux:aventure-puits-de-cendre", "l'aventure de départ")} avec de nouveaux personnages.
- **Le relais.** Les Deux Lanternes deviennent le port d'attache du groupe : le MJ IA peut y ramener d'autres voyageurs avec ${lien("tables:rumeurs-de-taverne")} et ${lien("tables:visages-d-azeroth")}.` },

  { titre: "PNJ et forces en présence", texte: `
**PNJ nommés** (fiches dans le bestiaire)
- **${fiche("hilde-brunval", "Hilde Brunval")}** — hôtesse, ancienne sergente de Lordaeron, veuve de Joren. Alliée.
- **${fiche("durgan-brise-fers", "Durgan Brise-Fers")}** — hôte, ancien prisonnier des camps. Allié, suit le groupe sous le relais et sur l'îlot.
- **${fiche("vesper-lacombe", "Vesper Lacombe")}** — réprouvée de Brumefeuille. La suspecte idéale, une vraie alliée, une vengeresse.
- **${fiche("aldwin-crayeval", "Aldwin Crayeval")}** — le bon docteur, nécromancien du Culte des Damnés. Le méchant.

**PNJ sans fiche**
- **Sergent Odran Pell** : profil de *${fiche("garde-hurlevent", "Garde de Hurlevent")}*, avec 20 PV. Brave, raide, terrifié par les morts.
- **Fenna Marlow** : profil de *${fiche("garde-hurlevent", "Garde de Hurlevent")}*. Malade dès 22 h.
- **Kazra Croc-Gris** : profil de *${fiche("grunt-orgrimmar", "Grunt d'Orgrimmar")}*. Courrière fière et pressée ; son loup Cendre : profil de *${fiche("loup", "Loup des bois")}*.
- **Pip Zinguette** : profil de *${fiche("marchand", "Marchand")}*. Lâche, drôle, et il a toujours sur lui ce dont on a besoin, très cher.
- **Bram le passeur** : profil de *${fiche("paysan", "Paysan")}*.
- **Les acolytes du Culte des Damnés** : profil de *${fiche("bandit-defias", "Bandit défias")}* (sans foulard, une main noire tatouée sur la paume).
- **Joren Brunval** et les noyés de la cave : profil de *${fiche("goule", "Goule")}*.
- **Le Recousu** : profil d'*${fiche("abomination", "Abomination")}*.

**Créatures du bestiaire utilisées :** ${["goule", "squelette", "abomination", "bandit-defias", "garde-hurlevent", "grunt-orgrimmar", "loup", "marchand", "paysan"].map(c => fiche(c)).join(", ")}.

**Table du one-shot :** ${lien("tables:bruits-de-la-nuit")}.` }
] });

export const ONE_SHOT_DOCUMENTS = [...PNJ_ONE_SHOT, ...TABLES_ONE_SHOT, JOURNAL_MJ, AIDE_RELAIS, AIDE_CARNET, ...CARTES_ONE_SHOT];
