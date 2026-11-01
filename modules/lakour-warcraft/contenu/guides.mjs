// Guides et tables d'Azeroth : le guide du joueur (visible), le guide du MJ (caché, lu par le MJ IA) et des tables
// aléatoires pour improviser (noms, rumeurs, rencontres, complications, trouvailles). Textes originaux.
import { journal, table, ref } from "./aides.mjs";

// ======================================================================= Guide du joueur (visible)

const guideJoueur = journal({
  cle: "guide-du-joueur", nom: "Guide du joueur — Azeroth", visible: true,
  pages: [
    {
      titre: "Bienvenue en Azeroth",
      texte: `# Où et quand nous jouons

Nous jouons dans les **mois qui suivent la Troisième Guerre**. Archimonde est tombé au pied du Mont Hyjal, Nordrassil a brûlé, et les vainqueurs comptent leurs morts. C'est un monde **en ruines et en chantier** : deux factions sont en train de naître sous nos yeux.

- **La Horde** de Thrall s'installe en Kalimdor : les orcs fondent Orgrimmar dans les terres rouges de Durotar, les trolls Sombrelance se réfugient aux îles de l'Écho, les taurens de Cairne Sabot-de-Sang bâtissent Les Pitons-du-Tonnerre en Mulgore.
- **L'Alliance** se recompose : Hurlevent est rebâtie et sans roi véritable, Forgefer tient la montagne, Jaina Portvaillant fonde Theramore sur la côte du marécage d'Âprefange avec les rescapés de Lordaeron, et les elfes de la nuit sortent à peine de leurs forêts.
- Au nord, **Lordaeron est un cimetière**. Le Fléau du Roi-liche le tient encore en partie ; les Réprouvés de Sylvanas viennent d'en arracher la capitale ; la Croisade écarlate brûle tout ce qui lui semble impur.

Thrall et Jaina ont combattu côte à côte à Hyjal. Entre Durotar et Theramore règne une **paix fragile** que beaucoup, des deux côtés, aimeraient voir échouer. C'est le cœur de notre campagne : un monde où l'on peut encore choisir si l'ennemi d'hier sera l'allié de demain.

# Ce que nous assumons

Certains peuples jouables n'arrivent « officiellement » sur le devant de la scène que plus tard (draeneï, elfes de sang dans la Horde, worgens, gobelins de la Horde, pandarens). Nous les gardons, en **avance sur leur temps** :

- les **draeneï** sont un petit groupe d'exilés arrivés avant les autres ;
- les **elfes de sang** existent déjà (Quel'Thalas a été ravagé, ils ont pris ce nom) ; quelques-uns cherchent l'appui de la Horde faute d'aide de l'Alliance ;
- les **worgens** sont des maudits qui ont fui Gilnéas derrière son mur ;
- les **gobelins** travaillent pour les cartels et louent leurs services à la Horde ;
- les **pandarens** sont des vagabonds, comme le brasseur qui a voyagé avec Rexxar.

Leur personnage est **rare** : on le regarde, on le questionne, parfois on le craint. C'est un ressort de jeu, pas un problème.`
    },
    {
      titre: "Les factions",
      texte: `# La Horde

Une alliance de peuples rejetés, née de la libération des orcs. Elle valorise **l'honneur, la force et la solidarité du clan**. Ses chefs : **Thrall**, chef de guerre et chaman ; **Cairne Sabot-de-Sang**, sage des taurens ; **Vol'jin**, chef des Sombrelance. Les Réprouvés de Sylvanas n'y sont qu'une alliance de raison, regardée de travers.

La Horde n'est pas « les méchants ». Elle a des fanatiques, des nostalgiques du sang démoniaque et des rancœurs anciennes ; elle a aussi des chamans, des chasseurs et des guerriers qui veulent seulement une terre à eux.

# L'Alliance

Les royaumes humains, les nains et les gnomes, liés depuis la Deuxième Guerre, rejoints peu à peu par les elfes de la nuit. Elle valorise **l'ordre, la foi en la Lumière et les traditions**. À cette époque, elle est **affaiblie et divisée** : Lordaeron n'existe plus, Hurlevent est gouvernée par une régence et des nobles qui se disputent l'or de la reconstruction, Gilnéas s'est emmurée, Kul Tiras pleure son amiral.

L'Alliance n'est pas « les gentils ». Elle a des héros, mais aussi les camps d'internement où les orcs ont pourri des années, des nobles avides et des croisés fanatiques.

# Les autres

- **Le Cercle cénarien** : druides elfes de la nuit et taurens, neutres, protecteurs de la nature.
- **Le Kirin Tor** : les mages de Dalaran, qui rebâtissent leur cité en secret.
- **Les cartels gobelins** : Gentepression tient les ports neutres (Baie-du-Butin, Gadgetzan, Cabestan) et vend à tout le monde.
- **La Croisade écarlate** : des survivants de Lordaeron devenus des fanatiques qui brûlent les morts… et les vivants suspects.
- **Le Fléau** : l'armée de morts-vivants du Roi-liche. L'ennemi de tous.
- **La Légion ardente** : les démons, vaincus à Hyjal mais pas détruits. Leurs cultes survivent dans l'ombre.`
    },
    {
      titre: "Les peuples",
      texte: `Chaque peuple est un objet du compendium **Peuples** : glissez-le sur votre fiche, ses traits arrivent avec lui.

# Alliance

- **Humain** — tenaces et polyvalents ; un don d'origine en plus. Moyen, 9 m.
- **Nain** — Forgefer ; résistant au poison, robuste, sent la pierre vibrer. Vision dans le noir 36 m.
- **Gnome** — Petit, esprit retors, bricoleur de Gnomeregan. Vision dans le noir 18 m.
- **Elfe de la nuit** — rapide (10,5 m), se fond dans l'ombre, ne dort pas. Vision dans le noir 18 m.
- **Draeneï** — exilé guidé par les naaru ; soigne une fois par jour, résiste aux ténèbres.
- **Worgen** — maudit de Gilnéas ; forme sauvage, griffes, flair.

# Horde

- **Orc** — fureur sanguinaire, se relève à 1 PV, volonté de fer.
- **Troll** — se régénère, parle aux loa, à l'aise dans la jungle.
- **Tauren** — charge qui renverse, carrure massive, très robuste. Pas de vision dans le noir.
- **Réprouvé** — mort-vivant libre : ne respire pas, ne mange pas (sauf…), brise les charmes.
- **Elfe de sang** — torrent arcanique, magie innée, regard exercé.
- **Gobelin** — Petit, file à l'anglaise, négocie tout, saute à la fusée.

# Sans faction

- **Pandaren** — paume tremblante, rebond, gourmet, paix intérieure. Pas de vision dans le noir.

# Langues

Votre **historique** donne vos langues : la langue de votre faction (commun pour l'Alliance, orc pour la Horde), plus deux au choix. Correspondances avec la fiche dnd5e :

- **Commun** → commun ; **Orc** → orc ; **Nain** → nain ; **Gnome** → gnome ; **Gobelin** → gobelin.
- **Darnassien** (elfes de la nuit) et **thalassien** (elfes de sang) → elfique : deux dialectes proches, qui se comprennent avec effort.
- **Taur-ahe** (taurens) → géant.
- **Zandali** (trolls), **draeneï**, **bas-parler** (Réprouvés) et **pandaren** : notez-les dans le champ libre des langues.`
    },
    {
      titre: "Les grandes régions",
      texte: `# Les Royaumes de l'Est

- **Lordaeron** (nord) : l'ancien royaume le plus puissant des humains, aujourd'hui Maleterres de l'Ouest et de l'Est, peuplées de morts. Les Réprouvés tiennent la capitale en ruines, la Croisade écarlate ses monastères.
- **Quel'Thalas** : les bois des Chants éternels et la cité de Lune-d'argent, saccagés par le Fléau. Les elfes de sang s'y accrochent.
- **Gilnéas** : une péninsule fermée par un immense mur. On ne sait plus ce qui s'y passe.
- **Khaz Modan** : Dun Morogh et ses neiges, Forgefer creusée dans la montagne, le Loch Modan et ses barrages.
- **Hurlevent** et la **forêt d'Elwynn** : la capitale blanche rebâtie, ses fermes, ses mines… et les bandits des Marches de l'Ouest.
- **Le Sud** : le Marais des Chagrins, les montagnes des Carmines, la jungle de Strangleronce et ses trolls hostiles.

# Kalimdor

- **Durotar** : terre rouge, sèche et rude, que les orcs ont faite leur. Orgrimmar s'y construit.
- **Les Tarides** : une savane immense, des caravanes, des centaures, des harpies et des quilboars.
- **Mulgore** : des plaines dorées et des pitons où vivent les taurens.
- **Frêneval** : la forêt des elfes de la nuit, où les bûcherons orcs commencent à couper du bois. Les ennuis sont certains.
- **Le Mont Hyjal** : le champ de bataille sacré, encore fumant.
- **Le marécage d'Âprefange** : la cité-forteresse humaine de Theramore, sur une île.
- **Tanaris** et **Gadgetzan** : le désert, ses pirates, ses ruines trolles et le comptoir gobelin.

# Les mers et au-delà

- **Kul Tiras** : un archipel de marins et de chantiers navals, à l'ouest des Royaumes de l'Est.
- **Les îles de l'Écho** : refuge des trolls Sombrelance, au large de Durotar.
- **Le Norfendre** : le continent glacé du Roi-liche, au nord. On n'y va pas. Pas encore.
- **La Pandarie** : cachée dans les brumes, que seuls quelques pandarens ont quittée.`
    },
    {
      titre: "Quelle classe 5e pour quel archétype",
      texte: `Les classes de D&D 5e couvrent les héros de Warcraft. **(SRD)** signale une sous-classe présente dans le compendium dnd5e ; les autres viennent du Manuel des joueurs, si votre table l'utilise.

- **Guerrier** → Guerrier (Champion (SRD), Maître de guerre) ; pour la rage orque, Barbare (Voie du Berserker (SRD)).
- **Paladin de la Main d'argent** → Paladin (Serment de dévotion (SRD)).
- **Prêtre de la Lumière** → Clerc (domaine de la Vie (SRD)) ; prêtre de l'ombre réprouvé : domaine de la Tromperie ou Occultiste.
- **Mage du Kirin Tor** → Magicien (Évocateur (SRD)) ; magistère elfe de sang affamé de magie : Ensorceleur.
- **Démoniste** → Occultiste (patron Fiélon (SRD)) : votre puissance vient d'un démon. Mal vu partout.
- **Chaman** → Druide (Cercle de la Terre (SRD)) ou Clerc (domaine de la Tempête) : vous parlez aux esprits des éléments, sans dieu.
- **Druide cénarien** → Druide (Cercle de la Terre (SRD) ou Cercle de la Lune pour les formes animales).
- **Chasseur** → Rôdeur (Chasseur (SRD) ou Maître des bêtes, pour le familier animal).
- **Voleur, espion de SI:7** → Roublard (Voleur (SRD) ou Assassin).
- **Féticheur troll** → Druide, Occultiste (patron Fée ou Grand Ancien réinterprété en loa) ou Clerc.
- **Moine pandaren** → Moine (Voie de la Main ouverte (SRD)).
- **Ingénieur gnome ou gobelin** → Roublard ou Guerrier avec les outils de bricoleur, Magicien qui « explique » sa magie par des machines, ou Artificier si votre table l'utilise.
- **Barde** → Barde (Collège du Savoir (SRD)) : conteur tauren, ménestrel de Hurlevent, crieur gobelin.
- **Chevalier de la mort** → Paladin (Serment de Vengeance), **réinterprété** : vos sorts sont du givre et de la nécromancie au lieu de la Lumière, et votre serment vous lie à la vengeance contre le Roi-liche qui vous a fait. À cette époque, c'est un concept exceptionnel : parlez-en au MJ.

# Création rapide

- Choisissez une **classe**, puis un **historique** du compendium (vos caractéristiques, compétences, outil, don d'origine et langues), puis un **peuple** (ses traits).
- Monnaie : **pièces d'or (po)**, **d'argent (pa)** et **de cuivre (pc)**. 1 po = 10 pa = 100 pc.
- Chaque personnage commence avec une **pierre de foyer** liée à l'auberge de départ, si le MJ l'accepte.`
    }
  ]
});

// ======================================================================= Guide du MJ (caché)

const guideMJ = journal({
  cle: "guide-du-mj", nom: "Guide du MJ — Azeroth", visible: false,
  pages: [
    {
      titre: "Chronologie",
      texte: `Repères en années avant ou après **l'ouverture de la Porte des Ténèbres** (le premier passage des orcs). Le présent de la campagne est **l'an 21**.

- **Il y a 10 000 ans** : la Guerre des Anciens. Les elfes de la nuit repoussent la Légion ardente ; le Puits d'éternité explose et brise le continent (la Grande Fracture). La Pandarie s'isole.
- **Il y a quelques millénaires** : les hauts-elfes exilés fondent Quel'Thalas ; les humains bâtissent Arathor, puis les sept royaumes.
- **An -2 à 0** : sur Draenor, le démon Kil'jaeden corrompt les orcs ; ils massacrent les draeneï.
- **An 0 – Première Guerre** : la Porte des Ténèbres s'ouvre ; la Horde rase Hurlevent.
- **An 5 à 7 – Deuxième Guerre** : l'Alliance de Lordaeron écrase la Horde. Les orcs vaincus sont parqués dans des **camps d'internement** et sombrent dans la léthargie.
- **An 10 à 18** : Thrall, esclave élevé par un noble humain, s'évade, découvre le chamanisme et libère les camps.
- **An 19 à 20 – Troisième Guerre** : la peste et le Fléau ravagent Lordaeron ; le prince Arthas tue son père et devient chevalier de la mort ; Dalaran tombe ; Quel'Thalas est dévasté. Thrall mène la Horde en Kalimdor, s'allie aux taurens ; Jaina y conduit les rescapés humains. Ensemble, avec les elfes de la nuit, ils vainquent Archimonde au **Mont Hyjal**.
- **An 21 – Maintenant** : Orgrimmar et Theramore sont fondées. Sylvanas libère les Réprouvés et prend Lordaeron. Arthas est parti vers le Norfendre. La paix entre Thrall et Jaina tient… à peine.

**Ne faites pas avancer l'histoire officielle à la place des joueurs.** Les grands noms existent, ils agissent loin, et les joueurs vivent l'histoire d'en bas.`
    },
    {
      titre: "Ton et thèmes",
      texte: `- **Héroïque, mais pas naïf.** Les personnages peuvent changer les choses autour d'eux ; les factions, elles, sont lentes, rancunières et pleines de contradictions.
- **Après la guerre.** Des réfugiés sur les routes, des villages vidés, des soldats qui ne savent rien faire d'autre, des orphelins, des profiteurs. La reconstruction est un sujet aussi riche que les batailles.
- **L'autre camp a un visage.** Un grunt et un fantassin de Hurlevent ont tous deux perdu des frères. Montrez-le.
- **Une touche d'humour.** Gnomes, gobelins, murlocs et ivrognes nains apportent la légèreté propre à Warcraft. Ne tournez pas tout en farce : un gag par scène suffit.
- **La magie a un prix.** La gangrène corrompt, l'arcane rend dépendant, la nécromancie souille. Même la Lumière peut nourrir le fanatisme.`
    },
    {
      titre: "La magie d'Azeroth",
      texte: `# La Lumière

Une force de foi et de volonté, sans dieu unique. Prêtres et paladins la canalisent : soins, protection, feu sacré. **En jeu** : clercs et paladins, dégâts radiants. Les morts-vivants la craignent… mais un Réprouvé prêtre peut encore la toucher, au prix de la douleur.

# L'arcane

La magie des mages : brute, puissante, **addictive**. Elle attire les démons. Les elfes de sang, privés du Puits de soleil, souffrent d'une faim arcanique. **En jeu** : magiciens, ensorceleurs ; dégâts de force, de feu, de froid.

# La gangrène (fel)

La magie verte et chaotique de la Légion ardente. Elle donne la puissance en échange de l'âme : peaux qui verdissent, yeux qui brûlent, folie. C'est elle qui a corrompu les orcs. **En jeu** : occultistes du Fiélon, cultistes, démons ; dégâts de feu (verts) ou nécrotiques. Un démoniste est **toléré** au mieux, jamais aimé.

# Le chamanisme

Le dialogue avec les esprits des éléments (terre, air, feu, eau) et des ancêtres. On **demande**, on ne commande pas : un chaman irrespectueux est abandonné par les éléments. **En jeu** : druides du Cercle de la Terre, clercs de la Tempête ; foudre, tonnerre, soins.

# Le druidisme

L'harmonie avec la nature et le Rêve d'émeraude, enseignée par le demi-dieu Cénarius. Formes animales, croissance, guérison. **En jeu** : druides, rôdeurs.

# L'ombre et la mort

La nécromancie du Fléau et du culte des Damnés, la magie d'ombre des prêtres réprouvés. **En jeu** : dégâts nécrotiques, morts-vivants. Les vivants la haïssent.

# Le vaudou

La magie des trolls : loa (esprits-animaux), poupées, malédictions, potions. **En jeu** : druides, occultistes, clercs réinterprétés.`
    },
    {
      titre: "Monnaie et économie",
      texte: `- **Pièces d'or (po), d'argent (pa), de cuivre (pc)** : 1 po = 10 pa = 100 pc. Les pièces de platine et d'électrum de dnd5e n'existent pas ; convertissez-les en or.
- Chaque royaume frappe sa monnaie, mais l'or est l'or : tout le monde l'accepte, surtout les gobelins.
- **Prix de repère** : une nuit à l'auberge 5 pa, un repas chaud 3 pa, une chope de bière naine 4 pc, un cheval 75 po, un loup de monte ou un bélier 75 po (et pas vendu à l'autre faction), un passage en zeppelin gobelin 5 po.
- **La pierre de foyer** se lie à une auberge (l'aubergiste le fait volontiers). Elle se recharge à l'aube. Elle échoue si l'on subit des dégâts pendant les 10 minutes du rappel, et ne fonctionne pas sur un autre continent : elle sert à rentrer, pas à fuir un combat.
- **Commerce entre factions** : interdit dans les capitales, toléré dans les ports gobelins, pratiqué partout en douce.`
    },
    {
      titre: "Langues",
      texte: `Correspondance avec les clés de langue de dnd5e (utilisées par les historiques du module) :

- **Commun** (Alliance) → commun ; **Orc** (langue commune de la Horde) → orc.
- **Nain** → nain ; **Gnome** → gnome ; **Gobelin** → gobelin.
- **Darnassien** et **thalassien** → elfique (dialectes).
- **Taur-ahe** → géant.
- **Zandali** (trolls), **draeneï**, **bas-parler** (argot des Réprouvés), **pandaren** : langues libres, à noter à la main.
- **Démoniaque** (eredun) → infernal ; **langue des Titans** → céleste ; **kalimag** (élémentaires) → primordial.

**Règle de table** : un membre de la Horde et un membre de l'Alliance ne se comprennent pas sans langue commune. Ne l'oubliez pas : les malentendus font d'excellentes scènes. Un groupe mixte a presque toujours un interprète.`
    },
    {
      titre: "Conseils pour le MJ (et le MJ IA)",
      texte: `# Présenter la Horde et l'Alliance

- **Jamais de camp du mal.** Chaque faction a ses héros, ses brutes et ses gens ordinaires. Quand un PNJ parle de l'autre camp, donnez-lui une raison personnelle (un frère mort, une ferme brûlée, une dette d'honneur).
- **Un groupe mixte est possible** à cette époque : la paix de Thrall et Jaina, un contrat du Cercle cénarien, du Kirin Tor ou d'un cartel gobelin, un ennemi commun (le Fléau, un culte démoniaque). Donnez une **raison de rester ensemble** dès la première scène.
- **Les tensions sont du jeu, pas une punition** : un garde qui refuse l'entrée, une auberge qui ne sert pas les orcs, un réfugié qui crache par terre. Une scène, puis on avance.

# Improviser

- **Commencez par un lieu concret** : une odeur, un bruit, un détail propre à Warcraft (un murloc qui gargouille, une cloche de zeppelin, un totem de vent qui siffle).
- **Les grands noms restent loin.** Thrall, Jaina, Sylvanas ou Cairne peuvent envoyer un messager ou passer au loin ; ils ne résolvent pas les problèmes des joueurs.
- **Tirez dans les tables** (noms, rumeurs, rencontres, complications, trouvailles ; visages d'Azeroth pour un PNJ au pied levé ; temps et chemins pour une journée de voyage) quand l'inspiration manque, puis adaptez.
- **Respectez les règles 2024** : avantage et désavantage plutôt que des modificateurs, DD 10/15/20 pour facile/moyen/difficile, inspiration héroïque pour une belle idée.
- **Les traits des peuples sont dans les fiches** : quand un tauren charge ou qu'un réprouvé dévore un cadavre, décrivez-le, et faites réagir les témoins.

# PNJ typiques

- **Aubergiste** : connaît tout le monde, lie les pierres de foyer, vend la bière locale. Humaine ronde et pressée à Hurlevent, orc borgne à Orgrimmar, gobelin qui facture la chaise.
- **Grunt de garde** : fier, méfiant, respecte la force et la franchise. « Lok'tar ! »
- **Soldat de la Garde de Hurlevent** : fatigué, sous-payé, honnête si on le respecte.
- **Paysan réfugié de Lordaeron** : a tout perdu, a peur des morts, hait les orcs par habitude.
- **Croisé écarlate** : poli, glacial, prêt à brûler n'importe qui « par précaution ».
- **Ingénieur gnome** : parle vite, promet beaucoup, livre en retard, l'appareil fume.
- **Marchand gobelin** : sourire en or, contrat en petits caractères, commission sur tout.
- **Druide cénarien** : neutre, lent à se décider, implacable contre ceux qui abîment la forêt.
- **Apothicaire réprouvé** : courtois, curieux de vos organes, travaille sur « un remède ».
- **Féticheur troll** : rit beaucoup, parle aux loa, connaît un raccourci par la jungle.
- **Cultiste du Marteau du crépuscule ou des Damnés** : voisin ordinaire le jour, fanatique la nuit.

# Ce que le MJ IA doit éviter

- Inventer des événements officiels futurs (la mort d'un grand personnage, une guerre majeure) sans l'accord de la table.
- Faire d'un peuple entier un bloc uniforme.
- Oublier les langues et les tensions de faction dans un groupe mixte.`
    }
  ]
});

export const GUIDES = [guideJoueur, guideMJ];

// ======================================================================= Tables

const noms = table({
  cle: "noms-par-peuple", nom: "Noms d'Azeroth par peuple", formule: "1d13",
  description: "Tirez le peuple, ou choisissez-le, puis prenez un prénom et un nom dans la ligne.",
  resultats: [
    [1, 1, { titre: "Humain", texte: "Aldric, Maëlle, Corwin, Isolde, Gareth, Brune. Noms : Fauchebois, Pierreval, Hautepierre, Moissonneur." }],
    [2, 2, { titre: "Nain", texte: "Borin, Hilda, Dunmar, Grimna, Thorgar, Kelda. Noms : Barbe-de-Cuivre, Brasse-Fer, Martelfort, Roc-Profond." }],
    [3, 3, { titre: "Gnome", texte: "Fizzle, Nibbin, Tinkla, Gizmo, Pippa, Sprocket. Noms : Rouage-Fou, Clé-Torse, Pétard, Écrou-d'Argent." }],
    [4, 4, { titre: "Elfe de la nuit", texte: "Aelyn, Thalindra, Ilyrion, Shaelis, Vaeran, Myrelle. Noms : Chant-de-Lune, Feuille-d'Ombre, Brise-Étoile, Veilleur-du-Bois." }],
    [5, 5, { titre: "Draeneï", texte: "Iruun, Malaara, Torvos, Eshia, Kaavon, Noraal. Noms : (pas de nom de famille ; on cite le maître ou le vaisseau d'origine)." }],
    [6, 6, { titre: "Worgen", texte: "Edmund, Rowena, Silas, Agatha, Percival, Lenore. Noms : Blackwald, Hollowmere, Thornbury, Greywick." }],
    [7, 7, { titre: "Orc", texte: "Grokk, Durza, Ragash, Mok'ra, Thogar, Kazgra. Clans : Loup-de-Givre, Chanteguerre, Rochenoire, Lame-Ardente." }],
    [8, 8, { titre: "Troll", texte: "Zul'jen, Mazuna, Rokhan, Tah'zi, Jun'ka, Vashi. Surnoms : Œil-de-Raptor, Rit-Fort, Lance-Rapide." }],
    [9, 9, { titre: "Tauren", texte: "Haruk, Muna, Tahko, Ahanu, Kerra, Orunta. Noms : Pas-de-Pluie, Corne-Sauvage, Grand-Sabot, Vent-des-Plaines." }],
    [10, 10, { titre: "Réprouvé", texte: "Mortimer, Ophelia, Gideon, Cordelia, Ambrose, Vesper. Nom : celui d'avant, ou un surnom choisi (le Pâle, Sans-Souffle)." }],
    [11, 11, { titre: "Elfe de sang", texte: "Caeleth, Saelora, Lorthiel, Vaelith, Dariel, Ithelia. Maisons : Soleil-d'Aube, Brasier-d'Or, Plume-Rouge, Lame-Écarlate." }],
    [12, 12, { titre: "Gobelin", texte: "Grizzik, Noggle, Zappa, Krix, Fizzbit, Vexi. Surnoms : Poche-Pleine, Grand-Profit, Deux-Doigts, l'Allumette." }],
    [13, 13, { titre: "Pandaren", texte: "Li Bao, Mei Tan, Shun, Lun Wei, Pao, Ying. Noms de famille : Feuille-de-Thé, Ventre-Rond, Pas-de-Brume, Chope-Pleine." }]
  ]
});

const rumeurs = table({
  cle: "rumeurs-de-taverne", nom: "Rumeurs de taverne", formule: "1d12",
  description: "Ce qu'on entend au comptoir. Vrai, faux ou à moitié vrai : au MJ de décider.",
  resultats: [
    [1, 1, "Des bûcherons orcs ont été retrouvés pendus aux arbres de Frêneval. Les Sentinelles nient, Orgrimmar gronde."],
    [2, 2, "Un fermier d'Elwynn jure avoir vu un murloc porter une couronne. Les autres murlocs s'inclinaient."],
    [3, 3, "Le Kirin Tor paie bien qui rapporte des livres sauvés des ruines de Dalaran. Et il ne demande pas d'où ils viennent."],
    [4, 4, "Une caravane gobeline a disparu dans les Tarides avec une cargaison « qui ne doit surtout pas être ouverte »."],
    [5, 5, "La Croisade écarlate brûle des villages entiers au nord de la Maleterre. Elle dit que la peste se cache dans le grain."],
    [6, 6, "Un vieux grunt affirme que des orcs refusent toujours de quitter les camps d'internement, et que des gardiens les y aident."],
    [7, 7, "On aurait vu un loup qui marche debout près du mur de Gilnéas. Il parlait comme un noble."],
    [8, 8, "Les nains de Forgefer ont trouvé sous Uldaman une porte que personne n'arrive à ouvrir. Ils cherchent des gens qui rentrent par les petits trous."],
    [9, 9, "Les apothicaires de la Fossoyeuse achètent des cadavres frais. Bon prix."],
    [10, 10, "Un brasseur pandaren voyagerait avec une bière qui « fait voir les esprits ». Les taurens le cherchent, les nains aussi."],
    [11, 11, "Theramore manque de bois ; Jaina en achèterait aux orcs. Des nobles de Hurlevent parlent de trahison."],
    [12, 12, "Des feux verts brillent la nuit sur les pentes du Hyjal. Les démons seraient revenus… ou quelqu'un les appelle."]
  ]
});

const rencontres = table({
  cle: "rencontres-sur-la-route", nom: "Rencontres sur la route", formule: "1d12",
  description: "Une rencontre par demi-journée de voyage en terrain sauvage, si le MJ le souhaite. Adaptez le nombre au groupe.",
  resultats: [
    [1, 1, "Une famille de réfugiés de Lordaeron, un chariot cassé, un enfant malade. Ils ont peur de vous."],
    [2, 2, "Une patrouille de l'autre faction, aussi surprise que vous. Personne ne veut commencer."],
    [3, 3, "Trois murlocs qui gardent un tas de poissons pourris comme un trésor. Il y a peut-être vraiment quelque chose dessous."],
    [4, 4, "Un gnome dans un appareil volant en panne, accroché à un arbre. Il propose un « partenariat »."],
    [5, 5, "Une meute de loups affamés, menée par une louve énorme aux yeux trop intelligents."],
    [6, 6, "Des quilboars ou des gnolls qui rançonnent le passage. Négociables, avec de la viande."],
    [7, 7, "Un marchand gobelin et ses deux gardes ogres. Il vend tout, très cher, et achète tout, très peu cher."],
    [8, 8, "Une poignée de goules qui fouillent une ferme abandonnée. Le Fléau n'est pas loin."],
    [9, 9, "Un druide cénarien qui exige de savoir pourquoi vous traversez sa forêt."],
    [10, 10, "Un orage élémentaire : la foudre frappe trois fois au même endroit. Un chaman dirait que les esprits sont en colère."],
    [11, 11, "Un croisé écarlate blessé, seul. Il demande de l'aide et vous juge déjà."],
    [12, 12, "Un cultiste en fuite qui serre un livre relié de peau verte. Ses poursuivants arrivent."]
  ]
});

const complications = table({
  cle: "complications", nom: "Complications", formule: "1d10",
  description: "Quand tout se passe trop bien. Une seule à la fois.",
  resultats: [
    [1, 1, "Un témoin reconnaît un personnage, ou croit le reconnaître, et crie un nom."],
    [2, 2, "La pierre de foyer de quelqu'un est volée, ou liée à la mauvaise auberge."],
    [3, 3, "Un allié de l'autre faction est arrêté par des gardes zélés. Il faut le sortir de là, légalement ou non."],
    [4, 4, "L'équipement gnome ou gobelin du groupe fait des étincelles, puis de la fumée, puis…"],
    [5, 5, "Le contrat qu'on vient de signer comporte une clause en très petits caractères."],
    [6, 6, "La météo tourne : tempête de sable, brume du marécage ou neige de Dun Morogh."],
    [7, 7, "Un ennemi vaincu revient, avec des amis et une bonne raison."],
    [8, 8, "Une rumeur sur le groupe le précède dans la prochaine ville, très exagérée."],
    [9, 9, "Un PNJ ami demande un service urgent, qui tombe très mal."],
    [10, 10, "Un signe de la Légion (gangrène, cultiste, démon mineur) apparaît là où on ne l'attendait pas."]
  ]
});

const trouvailles = table({
  cle: "trouvailles", nom: "Trouvailles de voyage", formule: "1d8",
  description: "Ce qu'on trouve dans un sac abandonné, un coffre de caravane ou la poche d'un bandit.",
  resultats: [
    [1, 2, ref("objets:potion-de-soins")],
    [3, 3, ref("objets:bandage-de-lin")],
    [4, 4, ref("objets:eclat-de-cristal-de-mana")],
    [5, 5, ref("objets:bombe-gobeline")],
    [6, 6, ref("objets:lettre-de-change")],
    [7, 7, ref("objets:elixir-de-la-mangouste")],
    [8, 8, { titre: "Une pierre de foyer", texte: "Une pierre de foyer liée à une auberge lointaine. À qui appartenait-elle, et qui l'attend là-bas ?" }]
  ]
});

const visages = table({
  cle: "visages-d-azeroth", nom: "Visages d'Azeroth", formule: "1d12",
  description: "Un PNJ au pied levé : son allure, sa manie, ce qu'il veut et ce qu'il cache. Changez le peuple au besoin.",
  resultats: [
    [1, 1, { titre: "Odile, passeuse humaine", texte: "Mains calleuses, chapeau de paille trempé. Compte tout à voix haute. Veut racheter la barque de son défunt mari. Cache qu'elle fait passer des réfugiés sans papiers." }],
    [2, 2, { titre: "Brannok, mineur nain", texte: "Barbe roussie, une lampe éteinte à la ceinture. Tape deux fois sur le bois avant de parler. Veut retrouver son frère, perdu sous la montagne. Cache qu'il a scellé la galerie lui-même." }],
    [3, 3, { titre: "Gazzle, intermédiaire gobelin", texte: "Monocle fêlé, sourire trop large. Cite des taux d'intérêt comme des proverbes. Veut une signature, n'importe laquelle. Cache qu'il doit de l'argent au mauvais cartel." }],
    [4, 4, { titre: "Ysera-lune, sentinelle elfe de la nuit", texte: "Arc au dos, regard qui ne cligne jamais. Parle aux arbres avant de parler aux gens. Veut qu'on quitte sa forêt avant la nuit. Cache qu'elle a laissé passer un ennemi, une fois." }],
    [5, 5, { titre: "Kurgash, vétéran orc", texte: "Une défense cassée, cicatrices de chaînes aux poignets. Rit fort et tard. Veut une mort honorable, pas une vieillesse. Cache qu'il fait encore des cauchemars des camps." }],
    [6, 6, { titre: "Mama Zebu, herboriste troll", texte: "Colliers d'os, pipe éteinte. Répond aux questions par d'autres questions. Veut une plante qui ne pousse que sur une tombe précise. Cache qu'elle parle aux loas d'un mort récent." }],
    [7, 7, { titre: "Ahote, chasseur tauren", texte: "Énorme et silencieux, une plume blanche à la corne. S'excuse auprès de chaque bête qu'il abat. Veut venger un troupeau massacré. Cache qu'il soupçonne un membre de sa propre tribu." }],
    [8, 8, { titre: "Silas Grisemine, apothicaire réprouvé", texte: "Mâchoire recousue, gants toujours propres. Note tout dans un carnet. Veut un échantillon « frais ». Cache qu'il cherche un remède, pas une arme." }],
    [9, 9, { titre: "Lady Caelith, émissaire elfe de sang", texte: "Robe impeccable malgré la boue, gemme verte au cou. Ne touche jamais rien sans gants. Veut un artefact pour sa maison. Cache que la gemme lui murmure la nuit." }],
    [10, 10, { titre: "Frère Aldous, prêtre en route", texte: "Robe usée, chaussures neuves. Bénit tout, même la soupe. Veut escorter des orphelins jusqu'à Hurlevent. Cache que l'un d'eux est un worgen qui s'ignore." }],
    [11, 11, { titre: "Tibbi Rouage-Fou, ingénieuse gnome", texte: "Lunettes à six verres, sourcils brûlés. Démonte ce qu'on lui prête. Veut tester un prototype « presque sûr ». Cache que le précédent a rasé une grange." }],
    [12, 12, { titre: "Shen Pas-de-Brume, brasseur pandaren", texte: "Ventre rond, gourde à la hanche, calme absolu. Offre à boire avant de parler affaires. Veut une recette perdue dans des ruines. Cache qu'il fuit une dette de jeu envers un ogre." }]
  ]
});

const chemins = table({
  cle: "temps-et-chemins", nom: "Temps et chemins", formule: "1d10",
  description: "Le temps qu'il fait et l'état de la route pour une journée de voyage. Effets en règles 2024 : à appliquer si la scène s'y prête.",
  resultats: [
    [1, 2, { titre: "Beau temps", texte: "Ciel clair, route sèche. Le voyage se passe bien : une rencontre sociale plutôt qu'un danger, si vous en tirez une." }],
    [3, 3, { titre: "Brouillard", texte: "Visibilité réduite à une trentaine de mètres : désavantage aux tests de Sagesse (Perception) basés sur la vue, et s'orienter demande un test de Sagesse (Survie) DD 12." }],
    [4, 4, { titre: "Pluie battante", texte: "Feux difficiles à allumer, cordes d'arc détrempées : désavantage aux tests de Sagesse (Perception) basés sur l'ouïe ; la journée parcourt un tiers de distance en moins." }],
    [5, 5, { titre: "Chaleur écrasante", texte: "Sans eau en abondance, chaque voyageur fait un jet de sauvegarde de Constitution DD 10 en fin de journée ; un échec donne un niveau d'Épuisement." }],
    [6, 6, { titre: "Froid mordant", texte: "Sans vêtements chauds, jet de sauvegarde de Constitution DD 10 à la tombée de la nuit ; un échec donne un niveau d'Épuisement. Le gel rend les pentes glissantes." }],
    [7, 7, { titre: "Pont effondré", texte: "La rivière en crue a emporté le pont. Trouver un gué (Sagesse (Survie) DD 13), construire un passage, ou perdre une demi-journée à contourner." }],
    [8, 8, { titre: "Route gardée", texte: "Un poste de péage ou de faction barre le chemin. Payer, négocier (Charisme (Persuasion) DD 12), ou chercher un autre passage." }],
    [9, 9, { titre: "Orage élémentaire", texte: "La foudre frappe trop souvent au même endroit. Vite, un abri : dehors, chaque heure, jet de sauvegarde de Dextérité DD 12 ou 2d6 dégâts de foudre. Un chaman y verrait des esprits en colère." }],
    [10, 10, { titre: "Ciel de gangrène", texte: "Une lueur verte à l'horizon, une pluie qui sent le soufre. Rien n'arrive aujourd'hui, mais les bêtes sont nerveuses et quelqu'un, quelque part, invoque quelque chose." }]
  ]
});

export const TABLES = [noms, rumeurs, rencontres, complications, trouvailles, visages, chemins];
