// « Le livre des Tarides » — le livre d'univers des joueurs : Azeroth en l'an 21 vu d'un habitant des Tarides, les lieux
// page par page, les pouvoirs en place, les treize peuples en récit, la vie de tous les jours, la foi et la magie, les fêtes,
// des portraits, des rumeurs et un lexique. Journal visible des joueurs, installé comme le Guide du joueur. Il ne dit rien
// des secrets réservés au MJ (intrigues des aventures, vérités des journaux cachés) : seulement ce que tout le monde sait
// ou raconte. Liens vers les compendiums ouverts aux joueurs (peuples, historiques, dons, objets) et les journaux visibles.
// Textes originaux ; œuvre de fan non officielle.
import { journal } from "./aides.mjs";
import { GUIDES, liens } from "./guides.mjs";
import { PEUPLES } from "./peuples.mjs";
import { HISTORIQUES } from "./historiques.mjs";
import { OBJETS } from "./objets-azeroth.mjs";
import { CONSOMMABLES } from "./consommables.mjs";
import { AFFILIATIONS } from "./affiliations.mjs";
import { GUIDE_REPUTATION } from "./reputations.mjs";
import { JOURNAL_ROUTES } from "./montures.mjs";
import { JOURNAL_RECETTES } from "./metiers.mjs";
import { JOURNAL_GARNISON } from "./garnison.mjs";

export const TITRE_LIVRE = "La Kour Warcraft — Le livre des Tarides";

// Un journal visible ne lie que ce que les joueurs peuvent ouvrir (essais/warcraft-journaux-lies.test.mjs).
const lien = liens(PEUPLES, HISTORIQUES, OBJETS, CONSOMMABLES, AFFILIATIONS, GUIDES, [GUIDE_REPUTATION, JOURNAL_ROUTES, JOURNAL_RECETTES, JOURNAL_GARNISON]);

// Titres des pages, dans l'ordre (la version anglaise, contenu/en/journaux.json, suit le même ordre).
export const PAGES_LIVRE = [
  "Arrivée à Cabestan", "Azeroth en l'an 21, vu des Tarides", "Cabestan et sa Trêve", "Le Carrefour et les plaines du nord",
  "Theramore, le marécage et le Gué-Brumeux", "Les marges : Ronceroc, Fort-Rivet, Mèche-Noire", "Pistes, perchoirs et îles de l'Écho",
  "Les pouvoirs en place", "Les peuples des Tarides — l'Alliance", "Les peuples des Tarides — la Horde et les sans-faction",
  "Vivre dans les Tarides", "La foi et la magie au quotidien", "Une année dans les Tarides", "Portraits de la route",
  "Rumeurs", "Lexique des Tarides"
];

const pages = [
  // ---------------------------------------------------------------- 1. Arrivée (récit)
  { titre: PAGES_LIVRE[0], texte: `
Le bateau du Cartel ne vous avait rien promis, et il a tenu parole. Des jours de houle depuis l'autre côte, une cale qui sentait le poisson et l'huile de lampe, un capitaine gobelin qui facturait l'eau douce au gobelet. Puis, ce matin, un cri du haut du mât, « Cabestan ! », et tout le monde s'est levé pour voir.

D'abord, c'est la couleur qui frappe. Après le bleu de la mer, la terre est rouge, ocre, jaune, brûlée ; les collines se tassent les unes contre les autres comme des bêtes qui dorment, et au-dessus, un ciel si grand qu'on ne sait plus où poser les yeux. La ville est posée entre les deux, accrochée à sa baie : des entrepôts de planches, des toits de tôle qui renvoient le soleil, une grue qui tourne, des mâts, et une fumée grasse qui monte d'une colline que personne ne vous a encore expliquée.

Le quai sent l'huile chaude, le sel et le poisson grillé. On vous bouscule avant que vous ayez posé le pied à terre : un porteur troll chargé de ballots, deux marins nains qui se disputent une dette, une gobeline en lunettes de cuivre qui crie des prix dans trois langues sans reprendre son souffle. Un orc en armes et un soldat au tabard bleu se croisent sur les planches ; ils se regardent, ils ne se saluent pas, ils ne se touchent pas. Ils continuent. Vous comprenez, à cet instant, ce que vaut la Trêve de Cabestan : pas une amitié, un accord. Ça tient parce que tout le monde y gagne.

Cloué sur un poteau, un panneau en commun, en orc et en gobelin. Quelqu'un a entouré la dernière ligne à la craie.

> **PAR ORDRE DU CARTEL**
> Dans Cabestan, on ne se bat pas entre Horde et Alliance. Jamais.
> Qui tire le premier paie les dégâts, les soins, et l'amende.
> Les gardes du port ont toujours raison.
> Les affaires sont les affaires.

Plus haut sur la Rue des Comptoirs, les portes de la Taverne de la Clé tordue battent au vent, et il en sort une odeur de bière brune et de ragoût qui vous rappelle que vous n'avez rien mangé de chaud depuis Theramore, ou depuis Orgrimmar, ou depuis plus loin encore. Devant le Comptoir du Cartel, une planche de liège croule sous les affiches : des primes, des escortes, des avis de recherche, une main griffonnée qui cherche « quelqu'un de solide, pas regardant ».

Le vent se lève vers midi, ici. Il vient des plaines, il porte la poussière rouge et une odeur d'herbe sèche, et il vous jette au visage ce que tout le monde finit par comprendre dans les Tarides : ce pays ne vous doit rien. Il ne vous attendait pas. Mais il a de la place.

Vous resserrez la courroie de votre sac. Quelqu'un, quelque part sur ce quai, a besoin de bras et paie en or. Il suffit de trouver qui.` },

  // ---------------------------------------------------------------- 2. Azeroth en l'an 21
  { titre: PAGES_LIVRE[1], texte: `
# Ce que tout le monde sait

Demandez à n'importe qui sur le quai de Cabestan, au feu du Carrefour ou sous l'arche de Theramore, et on vous dira la même chose, dans des mots différents : **la guerre vient de finir, et personne ne sait encore si c'est vrai.**

Il y a deux ans, les démons sont revenus. La Légion ardente a traversé le monde comme un incendie, précédée par le Fléau du Roi-liche : Lordaeron est tombé, Dalaran a brûlé, Quel'Thalas a été saccagé. Puis tout s'est joué sur une montagne de Kalimdor, le Hyjal, où les orcs de Thrall, les humains de Jaina Portvaillant et les elfes de la nuit se sont battus côte à côte sous l'arbre-monde. Archimonde est tombé, Nordrassil a brûlé, et les vainqueurs sont redescendus compter leurs morts. On compte l'an 21 depuis l'ouverture de la Porte des Ténèbres, le premier passage des orcs ; les anciens disent encore « l'année d'après Hyjal ».

# Deux maisons neuves, un mur de poussière entre elles

Au nord-est des Tarides, dans la terre rouge de Durotar, les orcs bâtissent **Orgrimmar**. Thrall, chef de guerre et chaman, a fait de la Horde une alliance de peuples rejetés : orcs, trolls Sombrelance des îles de l'Écho, taurens de Cairne Sabot-de-Sang descendus des Mulgore. Le Carrefour est leur relais au cœur des plaines.

Au sud-est, sur une île du marécage d'Âprefange, Jaina Portvaillant a planté **Theramore** avec les rescapés de Lordaeron et les marins de Kul Tiras. C'est l'Alliance en Kalimdor : une forteresse blanche qui sent encore le mortier frais, et des gens qui ont tout perdu de l'autre côté de la mer.

Entre les deux, les Tarides : trop grandes pour qu'on les garde, trop sèches pour qu'on se les dispute vraiment, assez riches pour que tout le monde y passe. Thrall et Jaina ont combattu ensemble à Hyjal ; ils ne se font pas la guerre. Leurs soldats, eux, ont des frères morts, et il suffit d'une caravane pillée pour que chacun accuse l'autre. On appelle ça **la paix**. Elle tient parce que le Cartel y veille à Cabestan, parce que les chefs la veulent, et parce que personne n'a envie de recommencer tout de suite.

# Ce qui fait peur, le soir, autour du feu

- **Le Fléau.** Il est loin, au nord, de l'autre côté de la mer, dans les Maleterres. Mais les réfugiés de Lordaeron ont vu leurs voisins se relever, et ils savent qu'une mort n'est pas toujours la fin. On brûle ses morts dans les Tarides, ou on les enterre sous des pierres lourdes.
- **Les Réprouvés.** Des morts qui ont retrouvé leur volonté et pris Lordaeron pour eux. Sylvanas Coursevent les mène ; la Horde les tolère ; l'Alliance ne veut pas en entendre parler. Il en arrive quelques-uns par bateau, encapuchonnés, et on change de table quand ils s'assoient.
- **Les démons.** Vaincus à Hyjal, pas détruits. On parle à voix basse de feux verts dans les collines, et d'orcs qui regrettent le vieux sang.
- **La guerre.** La vraie, celle d'avant. Les vétérans des deux camps ont la même façon de se taire quand on en parle.

# Et puis le reste du monde

Hurlevent se rebâtit sans roi, Forgefer tient la montagne, Gilnéas s'est emmurée, les elfes de la nuit sortent à peine de leurs forêts du nord. Tout cela est loin. Dans les Tarides, le monde a la taille d'une journée de marche : le prochain puits, la prochaine caravane, le prochain feu. Les grands noms passent au loin ; vous, vous êtes ici.` },

  // ---------------------------------------------------------------- 3. Cabestan
  { titre: PAGES_LIVRE[2], texte: `
Cabestan est un port gobelin, et cela veut tout dire : on y vend tout, on y achète tout, et on y facture même la chaise sur laquelle on s'assoit pour négocier. Le Cartel Gentepression le tient depuis qu'il a planté sa première grue dans la baie ; avant, il n'y avait que des murlocs et des rochers.

# Le quai

La ville descend vers la mer : les collines et leurs entrepôts ; la **Rue des Comptoirs**, qui va du Comptoir du Cartel à la Taverne de la Clé tordue ; et le **Quai**, de longues planches blanchies par le sel, où une grue grince jour et nuit au-dessus des navires de la Compagnie. On y parle le gobelin, le commun et l'orc, souvent dans la même phrase ; les prix se crient, les contrats se tamponnent à la cire dorée, en forme de roue dentée.

- **Le Comptoir du Cartel.** C'est là que règne **Grizzla Tordeboulon**, l'intendante du port : dix anneaux d'or aux oreilles, des lunettes de mécanicienne sur le front et un livre de comptes qu'elle ne pose jamais. Elle parle plus vite que son ombre et paie toujours un peu moins que promis, mais elle paie. Tout contrat sérieux passe par elle.
- **Le guichet de Nixi Pèse-Juste.** Au bout du quai, derrière une grille, une comptable qui ne lève les yeux de son boulier que pour un client solvable. C'est elle qui tient les comptes du Cartel avec chacun, et les lettres de change.
- **La Taverne de la Clé tordue.** Bière brune, ragoût de poisson, un comptoir où l'on vous sert sans demander votre bannière. Au-dessus, une chambre louée est devenue le relais de l'Aube d'argent : des cartes des Maleterres, des caisses de bandages et un lit toujours libre, tenus par Sœur Linnea Clairmatin.
- **Le Bureau de la Trêve.** Une bâtisse de pierre, la seule du port, avec une grande table au milieu. Un lieutenant de Theramore, **Corwen Haldis**, et un grunt d'Orgrimmar, **Garrok Brise-Dent**, y siègent sous l'arbitrage du Cartel. Ils se disputent tous les jours et, tous les jours, la Trêve tient.
- **Le comptoir de la Ligue des explorateurs.** Un entrepôt encombré de caisses de fouilles et de pierres gravées, où l'archiviste naine Bruni Martelfort paie pour des cartes et des tessons.
- **Le perchoir de Zippa Haute-Voltige.** Wyvernes et hippogriffes de location, et le gyroptère du Cartel : elle vole pour tout le monde, d'avance et comptant.
- **Le panneau de liège**, à l'entrée du Comptoir : le tableau des contrats. La moitié des affiches portent la roue dentée, l'autre moitié sont griffonnées par des gens qui ont besoin d'aide et pas d'argent.

# La Trêve

La règle est affichée sur chaque quai : dans Cabestan, la Horde et l'Alliance ne se battent pas. Ce n'est pas de la bonté. Le Cartel vit des caravanes qui passent et des navires qui accostent ; une guerre lui fermerait le port, et le Cartel préfère les amendes. Les gardes du port, des gobelins en cuir et des videurs ogres, ont « toujours raison » et le prouvent volontiers. Qui tire le premier paie tout : les dégâts, les soins de l'autre, et une amende qui ferait pleurer un baron.

Pour un groupe mélangé, c'est une bénédiction : on peut y boire ensemble sans que personne ne crie au traître. Pour les vétérans, c'est une épreuve : on y croise ses ennemis d'hier, et on se tait.

# Ce qu'on y craint

Les pickpockets, qui sont bons. Le Cartel Baille-Fonds, rival de Gentepression, dont les hommes rôdent en ville sans qu'on sache toujours qui ils sont. Les murlocs de la côte, qui pillent les filets. Les marais salés au sud, où les barques de contrebande passent la nuit et où, dit-on, quelque chose de très grand attend sous l'eau. Et la fumée noire qui monte des collines au nord, depuis qu'un cartel rival y a racheté une vieille mine.` },

  // ---------------------------------------------------------------- 4. Le Carrefour
  { titre: PAGES_LIVRE[3], texte: `
À une journée et demie de piste à l'ouest de Cabestan, là où se croisent la route d'Orgrimmar, celle des Mulgore et celle de la côte, la Horde a planté **le Carrefour** : une palissade de troncs, une tour de guet, des huttes de peaux et une longue hutte où l'on fait les comptes. Ce n'est pas une ville, c'est un relais ; mais tout ce qui traverse les Tarides y passe, et tout le monde y connaît tout le monde.

# Ce qu'on y trouve

- **La tour de guet**, et à son pied, le poteau des contrats, couvert d'affiches en orc, en taurahe et en commun. Un grunt lit les affiches à voix haute à qui ne sait pas lire, en les commentant.
- **La hutte de Gornak Croc-Gris**, l'intendant, près de l'enclos des wyvernes. Gornak tient ses comptes en nœuds de cuir et n'a jamais perdu une pièce. C'est à lui qu'on rend les contrats et qu'on rapporte les têtes.
- **Le perchoir de Tal'zun Plume-Rouge**, un troll qui ne confie ses wyvernes qu'aux membres de la Horde et à ceux pour qui un membre de la Horde se porte garant.
- **L'Épineux**, un vieil acacia mort au pied de la tour, couvert de grelots d'os, de rubans de cuir rouge et de dents de raptor percées. On y accroche quelque chose quand on part, on y décroche un grelot quand on revient.
- **La tente noire**, au cœur du camp, gardée jour et nuit. C'est celle des Kor'kron, la garde du chef de guerre, et on n'y entre pas sans recommandation. Grizzak Œil-Fendu en tient le seuil.
- **Les cuisinières**, qui font des galettes de maïs et un ragoût de kodo au piment dont on parle jusqu'à Theramore. Vous ne mangerez pas mieux dans les Tarides. Vous ne mangerez pas plus épicé non plus.

Le Carrefour est de la Horde, mais il n'est pas fermé : un membre de l'Alliance qui s'y présente les mains ouvertes et la réputation propre y achète, y dort et y prend des contrats ; on le regarde, on le laisse faire. Un ancien de la Horde insulté, en revanche, ne s'oublie pas.

# Les plaines

Autour, la savane : de l'herbe jaune jusqu'à l'horizon, des acacias isolés, des troupeaux de zhévras rayés et de trotteurs des plaines, des kodos gris qui marchent lentement vers des points d'eau connus d'eux seuls. Les oasis sont des miroirs bleus bordés de palmiers, et chacune a un nom, un gardien, des règles. Au nord du Carrefour, une colline pelée porte des centaines de **cairns** de pierres plates, un par lignée taurène ; on y monte une lampe à la main, on en redescend en silence. Plus loin, à l'**oasis du Bosquet-aux-Saules**, un druide tauren, Tahko Vent-Clair, reçoit sous un toit de branches vivantes pour le Cercle cénarien.

# Ce qu'on y craint

Les **Kolkar**, centaures pillards qui ne reconnaissent aucune frontière et se moquent de la Trêve. Les **hurans**, ces hommes-sangliers qui défendent leurs kraals de ronces et rançonnent les pistes. Les **harpies** qui nichent sur les pitons de la piste de Fort-Rivet et chantent trop bien. Les loups, la nuit, quand les feux baissent. Et le vent, qui emporte la piste avec la poussière : dans les Tarides, se perdre est la première façon de mourir, et un guide tauren vaut son poids en or.` },

  // ---------------------------------------------------------------- 5. Theramore
  { titre: PAGES_LIVRE[4], texte: `
Au sud-est des plaines, l'herbe jaune devient boue, la boue devient eau, et l'eau devient le **marécage d'Âprefange** : des cyprès aux racines noyées, des brumes qui ne se lèvent jamais tout à fait, des crocilisques et une fièvre qui porte le nom du lieu. Au bout, sur une île, l'Alliance a bâti sa forteresse.

# Theramore

De loin, une tour blanche et des murs neufs ; de près, une ville de réfugiés qui a décidé de tenir. Jaina Portvaillant, la fille de l'amiral de Kul Tiras, y a conduit les rescapés de Lordaeron ; on y parle avec l'accent du nord, et on y rebâtit comme si le mortier pouvait remplacer les morts.

- **Le Guet** tient la ville, les quais et le tableau d'affichage sous l'arche du port, aux affiches bien alignées et tamponnées du lion. Un sergent note le nom de chaque volontaire.
- **L'intendante du port, Maëlis Hautepierre**, tient ses comptes dans un entrepôt de pierre sur les quais, gardé par deux soldats. C'est à elle que se rendent les contrats et les états de service.
- **La tour des mages**, où les rescapés du Kirin Tor rangent des grimoires sauvés des ruines de Dalaran ; le magistère Aldren Vif-Argent y achète des fleurs et des échantillons.
- **La chapelle**, où Frère Odric Pierrelune, quartier-maître de ce qui reste des chevaliers de la Main d'argent, range autant d'armes que de livres de prières.
- **Le perchoir d'Alwen Brise-Nuage**, une naine qui loue ses hippogriffes à l'Alliance et à ses alliés, et à personne d'autre.
- **La tourte de poisson**, qu'on vend sur les quais et qu'on emporte sur la route : c'est la seule chose de Theramore dont la Horde dise du bien.

Un membre de la Horde entre à Theramore si sa réputation le permet, et il y est regardé comme on regarde un chien dans une église. Les orcs y sont rares ; les taurens, tolérés ; les Réprouvés, hors de question.

# Le Gué-Brumeux et les Deux Lanternes

Au nord du marécage, la piste des Tarides traverse une rivière boueuse sur un bac tiré à la corde. Le passeur s'appelle Bram, et il ne discute pas avec la rivière. Sur la rive, un ancien entrepôt de réfugiés est devenu un relais : **les Deux Lanternes**, une bleue et une rouge pendues à la porte, pour que chacun sache qu'il y sera servi.

Le relais est tenu par **Hilde Brunval**, ancienne sergente de la milice de Lordaeron qui compte vite et ne lève jamais la voix deux fois, et par **Durgan Brise-Fers**, un orc massif qui cuisine mieux qu'il ne parle et porte en ceinture la chaîne qu'on lui a ôtée. Ils ne racontent pas comment ils se sont connus. Le règlement est cloué près de la porte, en commun et en orc :

> Les armes dorment au râtelier. Elles se réveillent à l'aube.
> Pas de guerre sous ce toit. Ni la vôtre, ni celle de vos pères.
> Les vivants et les autres paient le même prix.

Une nuit coûte 5 pa, la soupe 3 pa, et les dettes se règlent à la vaisselle. Sur un îlot de la rivière, un peu plus bas, le **cimetière des Rescapés** garde sous des croix de bois une quarantaine de réfugiés emportés par la fièvre au premier hiver ; une cloche de bronze y pend sur un portique, et on la sonne pour chaque enterrement. Les gens du relais n'aiment pas qu'on en parle le soir.

# Ce qu'on y craint

La fièvre des marais, qui fait trembler puis délirer. Les sables mouvants des berges. Les crocilisques, plus longs qu'une barque. Et, chez les réfugiés, une peur qui ne dit pas son nom : celle que le grain, le pain, la farine portent encore ce qu'ils ont fui.` },

  // ---------------------------------------------------------------- 6. Les marges
  { titre: PAGES_LIVRE[5], texte: `
Entre les trois villes, les Tarides ont leurs marges : des endroits qu'on nomme sur les cartes et qu'on évite sur les pistes.

# Le kraal de Ronceroc

Au sud-est du Carrefour, dans un vallon, des ronces géantes montent plus haut qu'un kodo, tressées en murailles vivantes, hérissées d'épines longues comme des dagues. C'est le **kraal de Ronceroc**, le plus grand village huran des Tarides du nord. Les hurans sont des hommes-sangliers au groin couturé, massifs, le dos hérissé de ronces ; ils vivent en meutes derrière leurs sangliers de guerre, écoutent la terre par la voix de leurs géomanciens et tiennent tout étranger pour un voleur, ce qui n'est pas toujours faux. Leur cheffe, **Gorra Fiel-d'Épine**, porte un collier de crânes de kodos. On commerce avec eux, parfois, de loin : de la viande contre le passage. On ne les comprend pas, et ils nous le rendent bien.

# Fort-Rivet et les collines rouges

Au nord, au pied d'une falaise de minerai rouge, un gobelin nommé **Vizzik Tirelire** a monté sa propre fonderie loin du Cartel, et le fait savoir : « FORGES TIRELIRE — on vous fait du métal pas cher ». Ses ouvriers poussent des wagonnets en toussant, son gyroptère de livraison fait l'aller-retour jusqu'à Cabestan quand la fonderie tourne, et Grizzla Tordeboulon prononce son nom comme on crache un noyau. Pour y aller, on suit la piste des pitons, où nichent les harpies ; on y va à plusieurs, et de jour.

Plus à l'est, les **collines de Rouge-Veine** donnent le fer rouille-sang dont les forgerons d'Orgrimmar ne jurent que par lui. Le Cartel y a creusé des mines, puis les a abandonnées sans les sceller ; les kobolds ont repris les galeries, et les vieux panneaux « défense d'entrer sans casque » pendent encore au-dessus des entrées. Les mineurs en parlent avec un respect inquiet.

# Mèche-Noire

Dans les collines au nord de Cabestan, une vieille mine de cuivre a été rachetée pour une bouchée de pain par le **Cartel Baille-Fonds**, le rival de Gentepression. Depuis, une fumée noire et grasse sort de ses cheminées d'aération jour et nuit, et on l'appelle **Mèche-Noire**. On parle d'ouvriers kobolds qui ne remontent plus, et d'une huile qui brûle même sous la pluie ; les contrebandiers de la côte en vendent des flasques bouchées à la cire. Le baron Nizzel Baille-Fonds, un petit gobelin en redingote dorée, ne se montre jamais sans ses gardes.

# Les bords du monde

- **Gué-de-Sel**, au sud : un gué de pierre sur une rivière salée, la frontière de fait entre les terres de la Horde et les avant-postes de l'Alliance. Les caravanes de sel y passent ; les patrouilles des deux camps s'y croisent et se mesurent du regard. Une borne de pierre y attend qu'on y grave quelque chose.
- **La crique d'Eldrassal**, sur la côte au sud de Cabestan : des colonnes blanches qui sortent de l'eau comme les doigts d'une main noyée, les restes d'une cité des Bien-Nés engloutie il y a dix mille ans. Les pêcheurs n'y jettent pas leurs filets ; ils disent que l'eau y chante.
- **Le cratère de Brasegouffre**, au cœur des collines rouges du sud : un trou noir dont le sol est de verre, où rien ne pousse. Les taurens disent qu'une étoile y est tombée aux temps anciens. Personne n'y va, sauf les kodos devenus fous, et on les plaint.` },

  // ---------------------------------------------------------------- 7. Pistes et perchoirs
  { titre: PAGES_LIVRE[6], texte: `
# Les pistes

Dans les Tarides, on voyage à pied, à dos de kodo ou en caravane, et on compte en journées : de Cabestan au Carrefour, une journée et demie ; de Cabestan à Theramore, autant par la côte, ou deux jours par la piste et le bac du Gué-Brumeux ; du Carrefour à Fort-Rivet, une journée ; du Carrefour à Gué-de-Sel, deux ; de Gué-de-Sel au cratère, deux de plus, que personne ne fait. Une caravane part à l'aube, s'arrête au plus chaud de la journée sous le premier acacia et repart quand l'ombre s'allonge. On dort autour du feu, un veilleur par quart ; on ne laisse jamais un kodo attaché seul.

Le voyageur raisonnable emporte deux outres par personne, un chapeau, une couverture pour la nuit (qui est froide ; personne ne vous croit avant de l'avoir vécue), et il demande à chaque relais où l'eau est bonne. Les caravaniers taurens connaissent les oasis par leur nom et par leur humeur ; le plus connu d'entre eux, **Hanuk Pas-de-Pluie**, conduit des kodos à travers les plaines depuis vingt ans et ne promet que ce qu'il peut tenir.

# Les perchoirs

Pour aller vite, on vole. Chaque ville a son perchoir et son maître de vol : des wyvernes aux ailes de cuir pour la Horde, des hippogriffes aux plumes bleu nuit pour l'Alliance, et le gyroptère grinçant du Cartel pour qui paie. On paie le maître de vol, la bête connaît la route, et le voyageur n'a qu'à se tenir et à ne rien manger avant. Un vol de six heures remplace une journée et demie de marche ; on ne vole que de jour. Les prix, les durées et les règles sont dans ${lien("journaux:routes-aeriennes-des-tarides", "les routes aériennes des Tarides")}.

Un maître de vol de faction ne prend pas n'importe qui : un étranger à la réputation douteuse reste au sol, et un ${lien("dons:affiliation-atout-brevet-de-vol", "brevet de vol")} se mérite.

# Les montures

Le loup de guerre des orcs, haut comme un cheval, qui ne reconnaît qu'un maître ; le raptor des Sombrelance, vif, nerveux, qui mord ce qu'il ne connaît pas et saute les palissades ; le kodo, lent, increvable, qui porte quatre voyageurs en palanquin ; le bélier gris des nains, têtu et sûr dans les éboulis ; l'hippogriffe, qu'on ne vend pas et qu'on prête à qui a prouvé sa valeur. Les chevaux de Theramore paniquent à l'odeur des loups, et les orcs trouvent ça très drôle.

# Les îles de l'Écho

Au large de Durotar, au nord-est, les **îles de l'Écho** sont le refuge des trolls Sombrelance : des plages blanches, des huttes sur pilotis, des raptors élevés en sifflant et des totems de bois peint plantés face à la mer. On y arrive par bateau depuis Cabestan ou par la côte de Durotar. Les Sombrelance ont juré fidélité à Thrall, qui les a sauvés des murlocs et des marins de Kul Tiras ; ils gardent leurs loa, leurs masques et leur humour. Un troll de l'Écho rit beaucoup, parle aux esprits et connaît toujours un raccourci.` },

  // ---------------------------------------------------------------- 8. Les pouvoirs
  { titre: PAGES_LIVRE[7], texte: `
Dans les Tarides, personne ne commande tout. Chacun tient son bout de piste, et c'est entre ces bouts que se glissent les aventuriers.

- **Theramore (l'Alliance).** La dame Jaina Portvaillant règne sur une forteresse de rescapés. Son Guet tient le port, ses patrouilles vont jusqu'au Gué-Brumeux et parfois jusqu'à Gué-de-Sel. Elle veut la paix avec la Horde, et une partie de ses soldats ne le lui pardonne pas.
- **Orgrimmar (la Horde).** Thrall, chef de guerre et chaman, bâtit sa cité dans Durotar et tient les Tarides par le Carrefour. La Horde valorise l'honneur, la force et le clan ; un étranger qui tient parole y est mieux reçu qu'un ami qui ment. Les **Kor'kron**, sa garde d'élite, règlent en silence ce que la Horde préfère ne pas voir.
- **Le Cartel Gentepression.** Les gobelins qui tiennent Cabestan, Baie-du-Butin et Gadgetzan. Ils vendent à tout le monde, ne combattent que pour leurs contrats et ont fait de la Trêve de Cabestan une loi. Y entrer, c'est signer ; en sortir, c'est payer.
- **Le Cartel Baille-Fonds.** Le rival, à l'emblème de bourse percée. Il a racheté la mine de Mèche-Noire, arme un corsaire sur la côte, le capitaine Sel-Rouge, et paie des gens en ville pour fermer les yeux. Ses hommes ne portent pas d'uniforme.
- **La Confrérie défias.** Des brigands au foulard rouge venus des Royaumes de l'Est, des tailleurs de pierre floués par les nobles de Hurlevent. Il en débarque de temps en temps par bateau ; dans les Tarides, ils louent leurs arbalètes à qui paie, et on ne demande pas à qui.
- **La Lame ardente.** Un nom qu'on prononce bas au Carrefour : des orcs qui regrettent le sang des démons et jurent que la Horde a trahi sa nature en tournant le dos aux anciens maîtres. On dit qu'ils se tatouent une lame enflammée sur l'avant-bras. Les grunts disent que ce sont des histoires. Les chamans ne disent rien.
- **Le Culte des Damnés.** Ceux qui, à Lordaeron, ont servi le Roi-liche en vendant du grain empoisonné à leurs voisins. Les réfugiés de Theramore en ont peur comme on a peur d'une maladie : on surveille la farine, on regarde ses voisins, on se demande qui a suivi qui jusqu'ici.

# Les ordres

Huit ordres recrutent dans les Tarides, et un personnage peut s'engager auprès de l'un d'eux : on y gagne un devoir, des faveurs, et une réputation qui vous précède.

- ${lien("dons:affiliation-kirin-tor", "Le Kirin Tor")}, les mages de Dalaran dispersés entre Theramore et des tours cachées, qui rachètent les livres sauvés des ruines sans demander d'où ils viennent.
- ${lien("dons:affiliation-cercle-cenarien", "Le Cercle cénarien")}, druides elfes de la nuit et taurens, gardiens des oasis et des bosquets, au-dessus des factions.
- ${lien("dons:affiliation-main-d-argent", "Les Chevaliers de la Main d'argent")}, paladins d'un ordre dissous qui protègent les réfugiés sans demander leur bannière.
- ${lien("dons:affiliation-aube-d-argent", "L'Aube d'argent")}, qui n'a qu'un ennemi, le Fléau, et accueille côte à côte humains, orcs et même Réprouvés, ce qui scandalise à peu près tout le monde.
- ${lien("dons:affiliation-kor-kron", "La Garde kor'kron")}, la garde du chef de guerre, qu'on ne rejoint que sur recommandation.
- ${lien("dons:affiliation-sentinelles", "Les Sentinelles")}, l'armée des elfes de la nuit, qui surveillent les bûcherons de la Horde depuis un poste de guet à la lisière des forêts, au nord.
- ${lien("dons:affiliation-ligue-des-explorateurs", "La Ligue des explorateurs")}, nains de Forgefer et têtes brûlées de toutes tailles, qui fouillent les ruines et exigent des notes lisibles.
- ${lien("dons:affiliation-cartel-gentepression", "Le Cartel Gentepression")} lui-même, qui prend des associés : un dixième de ce qu'on gagne dans ses ports, en échange de lits à prix d'ami et de crédit.

Chaque faction se souvient de ce qu'on a fait pour elle, ou contre elle ; le ${lien("journaux:guide-de-la-reputation", "guide de la réputation")} dit comment, de Haï à Exalté.` },

  // ---------------------------------------------------------------- 9. Peuples (Alliance)
  { titre: PAGES_LIVRE[8], texte: `
Treize peuples se croisent sur les pistes. Chacun a sa fiche dans le compendium des peuples ; ici, on dit ce que ça veut dire d'être l'un d'eux dans les Tarides, et à qui on ressemble quand on arrive sur le quai.

# Humain

Un ${lien("peuples:humain", "humain")} des Tarides est presque toujours quelqu'un qui a perdu quelque chose de l'autre côté de la mer : un ${lien("historiques:refugie-de-lordaeron", "réfugié de Lordaeron")} qui ne fait plus confiance aux bannières, un ${lien("historiques:soldat-de-hurlevent", "soldat de Hurlevent")} envoyé tenir un mur qu'il n'a pas choisi, un ${lien("historiques:marin-de-kul-tiras", "marin de Kul Tiras")} dont la flotte a sombré en route. On les trouve partout et dans tous les métiers, obstinés, bavards, prompts à reconstruire. Dans la Horde, on les regarde comme ceux des camps d'internement ; les plus anciens des orcs se souviennent de gardiens qui n'étaient pas tous cruels.

# Nain

Les ${lien("peuples:nain", "nains")} sont arrivés avec l'Alliance et n'en sont pas repartis : forgerons de Theramore, artilleurs du Guet, archéologues de la Ligue des explorateurs qui grattent les ruines d'Eldrassal avec une pelle et une bière. Ils aiment la pierre, les collines rouges leur plaisent, et ils tiennent l'alcool comme personne, ce que les orcs respectent plus qu'ils ne l'avouent. Un nain qui chante à la Clé tordue finit la soirée avec des amis des deux camps.

# Gnome

Rares, bruyants, et toujours en train de démonter quelque chose. Les ${lien("peuples:gnome", "gnomes")} des Tarides sont des réfugiés de Gnomeregan passés par Forgefer, et ils ont trouvé chez les gobelins des rivaux à leur mesure : les uns inventent pour rentrer chez eux, les autres pour vendre, et les deux font sauter des granges. Un gnome parle vite, promet beaucoup et livre en retard ; mais quand l'appareil fume et marche quand même, personne d'autre ne l'aurait fait.

# Elfe de la nuit

Les ${lien("peuples:elfe-de-la-nuit", "elfes de la nuit")} viennent des forêts du nord, et tout, dans les Tarides, les dérange : la poussière, le bruit, les bûcherons de la Horde en Orneval, la lumière crue. Sentinelles en mission, druides du Cercle cénarien en visite aux oasis, ${lien("historiques:gardien-cenarien", "gardiens cénariens")} au bâton de bois vivant, ils parlent peu, ne dorment pas comme les mortels et voient dans le noir ce que vous ne voulez pas voir. Ils viennent de perdre leur immortalité à Hyjal, et ils ne savent pas encore quoi en penser.

# Draeneï

Presque personne n'a vu un ${lien("peuples:draenei", "draeneï")}, et ceux qui en ont vu un en parlent comme d'une apparition : deux mètres de peau bleue, des sabots, des tentacules au menton et une lumière douce au bout des doigts. Un petit groupe d'exilés est arrivé avant les autres, personne ne sait d'où ; ils disent fuir la Légion depuis des siècles et soignent les blessés sans rien demander. Les prêtres de la Lumière les regardent avec une curiosité fiévreuse. Les orcs, avec quelque chose qui ressemble à de la honte.

# Worgen

Un ${lien("peuples:worgen", "worgen")} ne dit pas qu'il en est un. Derrière le mur de Grisetête, le royaume de Gilnéas s'est coupé du monde, et ceux qui en sont sortis avec la malédiction des loups dans le sang se cachent parmi les réfugiés. Il garde sa raison tant bien que mal, flaire ce que les autres ne sentent pas, et sait qu'un villageois de Theramore qui le verrait changer ne ferait pas la différence avec le Fléau. Les chasseurs taurens, eux, sentent quelque chose et n'en parlent pas.` },

  // ---------------------------------------------------------------- 10. Peuples (Horde et sans faction)
  { titre: PAGES_LIVRE[9], texte: `
# Orc

Un ${lien("peuples:orc", "orc")} de l'an 21 porte sur lui vingt ans d'histoire : les camps d'internement de Lordaeron, la léthargie, la libération par Thrall, la traversée, Hyjal. Les ${lien("historiques:grunt-d-orgrimmar", "grunts d'Orgrimmar")} ont creusé les remparts de la nouvelle cité et montent la garde au Carrefour pour prouver au monde, et à eux-mêmes, qu'ils ne sont plus les monstres de la Première Guerre. Ils rient fort, se fâchent plus fort, respectent qui se bat bien et qui parle franc. Un orc qui a donné sa parole la tient ; un orc qu'on a insulté devant témoins s'en souvient toute sa vie.

# Troll

Les ${lien("peuples:troll", "trolls")} des Tarides sont des Sombrelance : grands, voûtés, les défenses longues et le rire facile. Ils honorent les loa, les esprits-animaux de leur peuple, et portent des masques de bois peint quand ils leur parlent. On les voit sur les quais de Cabestan comme porteurs et marins, au Carrefour comme chasseurs et maîtres de vol, et partout où il y a un raptor à dresser. Leur chair se referme à vue d'œil, ce qui les rend braves, et leur humour est le plus noir des Tarides. Des autres tribus trolles, hostiles à tout le monde, un Sombrelance parle en crachant.

# Tauren

Les ${lien("peuples:tauren", "taurens")} sont chez eux dans les Tarides bien plus que quiconque : les plaines sont le bord de leurs Mulgore, et les kodos leur obéissent à la voix. Calmes, lents à se décider, immenses, ils sont ${lien("historiques:chasseur-des-mulgore", "chasseurs")}, caravaniers, chamans et druides, et ils remercient chaque bête qu'ils abattent. Leur colère est rare ; quand elle vient, une hutte s'effondre. Un tauren prend toujours la défense de ce qui ne peut pas se défendre, ce qui le rend parfois pénible et toujours précieux.

# Réprouvé

Un ${lien("peuples:reprouve", "Réprouvé")} est un mort qui a retrouvé sa volonté quand l'emprise du Roi-liche a faibli, et qui a décidé de ne la rendre à personne. Il en arrive quelques-uns par bateau, encapuchonnés, la mâchoire recousue, sentant la terre froide et la lavande séchée. La Horde les tolère par intérêt ; l'Alliance les chasse ; les réfugiés de Lordaeron, qui ont vu des voisins se relever, les regardent avec une horreur qui n'est pas toujours de la haine. Un Réprouvé ne mange pas, ne dort pas, ne respire pas, et sait exactement ce que pensent les vivants autour de lui. Il y a des apothicaires parmi eux ; on parle bas de ce qu'ils cherchent.

# Elfe de sang

Les ${lien("peuples:elfe-de-sang", "elfes de sang")} ont pris ce nom en mémoire de Quel'Thalas, ravagé par le Fléau, et du Puits de soleil, souillé. Privés de leur source de magie, beaucoup souffrent d'une faim qui les ronge et qu'ils cachent sous des robes impeccables. Quelques magistères ont tendu la main à la Horde faute d'aide de l'Alliance ; dans les Tarides, un elfe de sang est un négociateur, un mage, un ${lien("historiques:rodeur-de-lune-d-argent", "rôdeur")} qui a perdu ses frères d'armes dans les bois brûlés. Les elfes de la nuit leur rappellent l'Exil à mots couverts ; les orcs les trouvent précieux et maniérés ; les gobelins les trouvent solvables.

# Gobelin

Les ${lien("peuples:gobelin", "gobelins")} sont chez eux à Cabestan et à peu près partout où l'or circule. Petits, verts, rapides, ils comptent avant de parler et parlent avant de réfléchir, ce qui marche étonnamment souvent. Un gobelin des Tarides travaille pour le ${lien("historiques:cartel-gobelin", "Cartel")} ou contre lui, loue ses services à la Horde parce qu'elle paie, et le rappelle volontiers ; il a toujours une bombe dans la poche, deux fusées dans les bottes et une dette quelque part. Il sait d'instinct si l'autre partie compte respecter un marché. C'est souvent non.

# Pandaren

Il y a peut-être trois ${lien("peuples:pandaren", "pandarens")} dans toutes les Tarides, et chacun est une légende de taverne : un brasseur rond et calme, une gourde à la hanche, qui offre à boire avant de parler affaires et met un ogre à terre d'une paume ouverte. Ils viennent d'une terre cachée dans les brumes dont ils ne parlent qu'après la troisième chope. Les deux factions les accueillent avec étonnement, les cuisinières du Carrefour avec respect, et les enfants avec des cris.

# Les langues

Votre historique donne vos langues : le commun pour l'Alliance, l'orc pour la Horde, et deux au choix. Un grunt et un soldat de Theramore ne se comprennent pas sans interprète ; le gobelin, lui, se parle sur tous les quais. Le détail est dans le ${lien("journaux:guide-du-joueur", "guide du joueur")}.` },

  // ---------------------------------------------------------------- 11. Vivre dans les Tarides
  { titre: PAGES_LIVRE[10], texte: `
# L'or

Tout se compte en pièces d'or, d'argent et de cuivre : 1 po vaut 10 pa, 1 pa vaut 10 pc. Chaque royaume frappe sa monnaie, mais l'or est l'or, et un gobelin accepte même les vieilles pièces de Lordaeron, avec une commission. Une nuit à l'auberge coûte 5 pa, un repas chaud 3 pa, une chope 4 pc ; un loup de guerre ou un bélier se négocient entre 120 et 150 po, un kodo 300. Pour voyager sans porter sa fortune, le Cartel vend des ${lien("objets:lettre-de-change", "lettres de change")}, payables à vue dans tous ses comptoirs, moins dix pour cent « raisonnables ».

# Le commerce

Les caravanes font vivre tout le reste : sel de Gué-de-Sel, fer rouge de Rouge-Veine, cuir de kodo, poisson salé de la côte, bois du nord que les Sentinelles disent volé, et tout ce que la Compagnie décharge à Cabestan. Le commerce entre factions est interdit dans les capitales, toléré dans les ports gobelins et pratiqué partout en douce ; au Carrefour comme à Theramore, l'intendant vous vend d'autant moins cher qu'il vous connaît, et vous rachète votre butin à la moitié de sa valeur, parce que c'est la règle et parce qu'il le peut.

# La table

On mange ce que le pays donne : galettes de maïs, dattes des oasis, miel de cactus, sanglier, zhévra, poisson de la baie. Le ${lien("objets:ragout-de-kodo-epice", "ragoût de kodo épicé")} du Carrefour vous fait pleurer et vous tient debout une journée ; la ${lien("objets:tourte-de-poisson-de-theramore", "tourte de poisson de Theramore")} se garde sur la route ; les ${lien("objets:brochettes-de-raptor", "brochettes de raptor au piment")} se vendent sur le quai de Cabestan à qui n'a pas peur. Un bon repas répare plus qu'on ne croit : un pandaren vous le dira, et un cuisinier de caravane est aussi recherché qu'un guérisseur.

# Les métiers et l'établi

Entre deux contrats, on récolte et on fabrique. Herboristes, mineurs et dépeceurs tirent du pays l'herbe-à-fièvre, le lys des oasis, le fer rouge, le cuir léger ; alchimistes, forgerons, ingénieurs et cuisiniers en font des potions, des lames, des bombes et des repas. Il suffit de maîtriser l'outil ; les ${lien("journaux:recettes-d-artisanat", "recettes d'artisanat")} disent le reste, et l'établi, en tête de votre fiche, fait le compte des composants, de l'or et du test.

# Le tableau des contrats

Dans chaque ville, un panneau, un poteau ou un tableau porte les petits travaux du jour : une bête à traquer, une caisse à escorter, des plantes à cueillir, un pli à porter, une tête mise à prix. On en prend un, on le fait, on revient toucher l'or et un peu de considération. C'est comme ça que la plupart des aventuriers des Tarides commencent, et comme ça que beaucoup finissent, assez riches pour acheter un kodo et un lit.

# La pierre de foyer

Un aubergiste lie volontiers une ${lien("objets:pierre-de-foyer", "pierre de foyer")} à sa salle commune : une pierre lisse gravée d'une rune, qu'on tient dix minutes en pensant très fort à la bière, et qui vous ramène chez vous. Elle ne sert pas à fuir un combat ; elle sert à rentrer. Changer d'auberge demande une nuit sur place et la bénédiction du patron, souvent payante.

# La garnison

Quand un groupe a assez servi une faction, elle lui confie un avant-poste dans les Tarides : une tour de guet de la Horde, un fortin de l'Alliance, un entrepôt du Cartel. On y installe une forge, un atelier, un enclos, une table des missions ; on y recrute, on y fabrique, on y dort. Le journal de la ${lien("journaux:garnison-de-faction", "garnison de faction")} explique comment.` },

  // ---------------------------------------------------------------- 12. Foi et magie
  { titre: PAGES_LIVRE[11], texte: `
Dans les Tarides, la magie n'est pas une affaire de tours : c'est l'eau qu'on bénit avant de boire, le totem qu'on plante avant de dormir, la prière qu'on marmonne devant un cadavre pour qu'il reste couché. Voici ce que le peuple en croit.

# La Lumière

Les humains, les nains et les quelques draeneï parlent de la Lumière : une force de foi et de volonté, sans dieu ni temple, qui guérit par les mains de ceux qui y croient assez. À Theramore, la chapelle sonne le soir et un prêtre bénit la soupe. Dans la Horde, on s'en méfie comme d'une arme de l'Alliance, et on a tort : la Lumière écoute qui l'appelle, même un orc, même, dit-on, un mort qui s'y brûle. Les paladins qui la portent sont rares ici et regardés avec respect, ou avec rancune, selon ce qu'on a vécu.

# Les esprits

Les orcs et les taurens parlent aux éléments, la terre, l'air, le feu, l'eau, et aux ancêtres. On ne leur commande pas, on demande, et un chaman irrespectueux est abandonné. Un **totem** est un pieu sculpté qu'on plante en terre pour appeler un esprit : le vent y siffle, la foudre s'y accroche, la pluie s'y arrête. Les caravaniers emportent un petit totem de voyage et le saluent au départ ; les grunts touchent le totem du Carrefour en passant, comme on touche du bois. Quand l'orage frappe trois fois au même endroit, tout le monde sait que les esprits sont en colère, et personne ne demande contre qui.

# Les loa et les masques

Les trolls Sombrelance ont leurs loa, des esprits-animaux qu'on honore avec des masques, des danses et des offrandes de poisson ou de sang. Les autres peuples appellent cela du vaudou et changent de trottoir ; les chamans taurens, eux, hochent la tête : ce sont des esprits, avec d'autres noms.

# La Terre-Mère et le Rêve

Les taurens disent que la terre est une mère et qu'on lui rend ce qu'on lui prend. Les druides elfes et taurens du Cercle cénarien disent que derrière le monde il y a un Rêve, vert et sans fin, où dorment les choses qui poussent. Dans les Tarides, cela se voit à l'oasis : un druide y chante trois nuits, et l'eau redevient claire. On ne coupe pas un arbre vivant sans demander. On demande rarement, et les Sentinelles s'en souviennent.

# L'arcane

Les mages du Kirin Tor, les magistères elfes de sang et quelques ${lien("historiques:apprenti-de-dalaran", "apprentis")} trop fiers manient l'arcane : la magie brute des livres, qui gèle, brûle et ouvre des portails. Elle est puissante, elle est respectée, elle rend dépendant, et tout le monde sait qu'elle attire ce qu'on ne veut pas attirer. Un mage qui lance une boule de feu dans une taverne de Cabestan paie l'amende, les dégâts, et la bière.

# Ce qu'on ne nomme pas

La gangrène, ce feu vert qui a corrompu les orcs et qui brûle encore dans les yeux de certains ; la nécromancie, qui fait se lever les morts ; les cultes qui promettent la puissance contre l'âme. Dans les Tarides, un démoniste est toléré au mieux, et un ami qui a touché le feu vert de trop près garde les yeux baissés quand il se fâche. On n'en parle pas au feu. On en parle aux chamans, aux prêtres et aux druides, qui devinent la souillure au premier regard.

# Les gestes de tous les jours

- On verse une goutte de bière par terre pour ceux qui ne boivent plus.
- On ne sonne jamais une cloche la nuit, sauf pour un enterrement.
- On jette une pièce dans la baie avant de prendre la mer.
- On ne siffle pas près d'une oasis : ça appelle le vent, et le vent emporte l'eau.
- On laisse une braise à qui vous en demande une.` },

  // ---------------------------------------------------------------- 13. Une année
  { titre: PAGES_LIVRE[12], texte: `
Il n'y a que deux saisons dans les Tarides : la sèche, qui dure, et la pluie, qui ment. Mais les gens d'ici ont rempli l'année de fêtes, parce que c'est la seule façon de compter les jours sans compter les morts.

# La Mascarade de Cabestan (la fin de l'hiver)

Du jeudi gras au mardi gras, Cabestan se masque. La loi du Cartel est affichée sur chaque quai : sous un masque, on n'est personne, ni Horde ni Alliance, et l'on peut danser avec son ennemi. Les barges sont attachées bord à bord pour faire une piste de danse, on boit du rhum de cactus dans des chopes en forme de tête de gobelin. Les dockers élisent un Baron d'un jour coiffé d'une couronne de boulons, et le soir du mardi gras, on traîne jusqu'au bout de la jetée un pantin de paille de six mètres à l'effigie d'un gobelin trop riche, et on le brûle dans la baie sous les fusées et les huées.

# Les Tambours du Long Jour (le solstice d'été)

Le jour le plus long, les taurens battent les tambours de l'aube au couchant pour remercier le soleil qui fait pousser l'herbe des kodos ; les orcs frappent leurs boucliers, les gobelins des casseroles. Au coucher du soleil, un grand feu s'allume sur la colline du Carrefour, un coureur y prend une torche et court l'allumer sur la colline suivante, et ainsi jusqu'à Gué-de-Sel et à la côte : c'est la **Chaîne des feux**. Theramore allume la sienne depuis le port ; certaines années, les deux se rejoignent. Qui saute au-dessus d'un feu du Long Jour scelle un vœu pour l'année. Qui tombe dedans le raconte longtemps.

# La Nuit des Calebasses (la fin de la saison sèche)

Quand les calebasses sont mûres, chaque famille en creuse une par mort de l'année, y taille un visage qui lui ressemble et y pose une chandelle. Le soir venu, on les aligne au bord des pistes et devant les tentes pour montrer aux morts le chemin des ancêtres, afin qu'ils ne s'égarent pas parmi les vivants. Les enfants vont de tente en tente demander « une braise pour mes morts » ; on leur donne une braise du foyer et du sucre de cactus, et refuser porte malheur. Depuis le Fléau, tout le monde sait que certains morts ne restent pas couchés, et l'Aube d'argent veille jusqu'au matin, l'épée dans une main et une tasse de thé dans l'autre.

# La Trêve des Présents (le cœur de la saison des pluies)

Quand les nuits fraîchissent, les Tarides entrent dans la Trêve des Présents. Cela a commencé par des caravaniers taurens qui laissaient un sac de grain devant la tente d'un voisin ; le Bureau de la Trêve en a fait une coutume : pendant tout le mois, chaque camp peut déposer un présent pour l'autre, et l'on se promet de ne verser le sang sur aucune grande route. Au Carrefour, l'Épineux se couvre de grelots et de rubans ; à Theramore, un sapin venu du nord par bateau trône sur la place du port, et les Sentinelles réclament une amende pour la coupe. La nuit la plus douce, une légende taurène marche à côté d'un kodo blanc et laisse un présent devant chaque tente où dort un enfant, quel que soit son peuple.

# La Veille des Aïeux (la dernière nuit de l'année)

On ne dort pas. On rend visite à l'ancien de son camp avec un présent et une histoire qu'on lui demande de raconter encore, et l'on écoute jusqu'au bout. Les taurens montent à la colline des cairns, une lampe-étoile dans chaque main, et de loin la colline ressemble à un morceau de ciel tombé dans la savane. À Theramore, la cloche du port sonne une fois par mois de l'année écoulée et l'on lit les noms de ceux qu'on a laissés à Lordaeron. À Cabestan, on solde ses dettes avant minuit, parce qu'on n'entre pas dans l'année avec une ardoise. Honorer un ancien de l'autre camp porte chance ; c'est rare, et l'on s'en souvient.

> *Chanson de la Clé tordue, sur l'air qu'on veut :*
> Le sel au sud, le fer au nord, la poussière au milieu,
> la Horde à gauche, le lion à droite, et le Cartel entre les deux ;
> verse à boire, Clé tordue, verse encore, verse à tous,
> demain la piste, ce soir la chope, et qu'ils s'arrangent sans nous.` },

  // ---------------------------------------------------------------- 14. Portraits
  { titre: PAGES_LIVRE[13], texte: `
Une dizaine de figures qu'on finit toujours par croiser. Ce ne sont pas des héros ; ils tiennent le pays.

- **Grizzla Tordeboulon**, intendante du Cartel à Cabestan. Dix anneaux d'or aux oreilles, des lunettes de mécanicienne sur le front, un livre de comptes sous le bras. Elle se moque de la Horde et de l'Alliance : elle veut que l'eau soit bonne et que les caravanes circulent, parce qu'une guerre fermerait le port. Elle paie bien, un peu moins que promis, et tient parole.
- **Hanuk Pas-de-Pluie**, guide caravanier tauren. Cornes ébréchées, crinière tressée de perles de bois, vingt ans de kodos à travers les plaines. Il parle lentement, ne promet que ce qu'il peut tenir, et refuse de tuer ce qui n'est « que malade ». Avec lui, on ne se perd pas.
- **Corwen Haldis**, lieutenant de Theramore au Bureau de la Trêve. Harnois bosselé, moustache au cordeau, il salue tout le monde et ne s'assoit jamais dos à une porte. Il veut sincèrement la paix, et ses soldats ont perdu des amis contre la Horde.
- **Garrok Brise-Dent**, grunt d'Orgrimmar au Bureau de la Trêve. Une défense cassée net, une cape de fourrure sur une cotte trop petite pour lui, il rit fort et se fâche plus fort. Il respecte qui lui parle franchement et méprise les flatteurs ; une insulte publique peut tout gâcher.
- **Hilde Brunval et Durgan Brise-Fers**, hôtes des Deux Lanternes. Elle a les cheveux gris coupés court et un tablier par-dessus un vieux pourpoint de la milice de Lordaeron ; il a des cicatrices de fers aux poignets et parle mieux aux chevaux qu'aux gens. Leur soupe vaut le détour. Leur règlement aussi.
- **Zippa Haute-Voltige**, maîtresse de vol de Cabestan. Elle loue des wyvernes à l'Alliance et des hippogriffes à la Horde si ça paie, et ses bêtes ne se supportent pas. Elle a un mot pour chaque passager qui vomit.
- **Tahko Vent-Clair**, gardien du Cercle cénarien à l'oasis du Bosquet-aux-Saules. Un druide tauren qui reçoit sous un toit de branches vivantes, écoute longtemps, et vous envoie planter des graines à la pleine lune quand vous veniez pour autre chose.
- **Bruni Martelfort**, archiviste de la Ligue des explorateurs à Cabestan. Une naine couverte de poussière de fouilles, qui paie pour des cartes, des tessons et des notes lisibles, et vous fait recommencer la carte si elle ne l'est pas.
- **Sœur Linnea Clairmatin**, émissaire de l'Aube d'argent, dans sa chambre au-dessus de la Clé tordue. Elle a vu les Maleterres, elle a un lit toujours libre, et elle vous demande, poliment, si vous avez bien brûlé le dernier mort que vous avez abattu.
- **Pip Zinguette**, colporteur gobelin, « tout à vendre ». Son chariot grince d'un relais à l'autre ; il a toujours sur lui ce dont vous avez besoin, très cher, et des talismans anti-revenants à deux pièces d'or qui ne marchent pas, mais Pip y croit un peu.
- **Bram**, le passeur du Gué-Brumeux. Il relève ses nasses à midi, tire le bac à la corde quand il le décide, et ne discute pas avec la rivière. Il voit des choses sur l'eau, la nuit, et on lui dit de laisser la gnôle.` },

  // ---------------------------------------------------------------- 15. Rumeurs
  { titre: PAGES_LIVRE[14], texte: `
Ce qu'on entend au comptoir, au feu ou sur le bac. Vrai, faux ou à moitié : à vous de voir.

- Un murloc de la côte porte une couronne de coquillages, et les autres murlocs s'inclinent devant lui. Les pêcheurs disent qu'il lève un impôt sur les filets.
- Un crocilisque long comme une barque chasse dans les marais salés au sud de Cabestan. Il aurait mangé trois pêcheurs et un contremaître du Cartel, et il n'a pas aimé le contremaître.
- Une machine gobeline sans pilote, rouillée et sifflante, erre entre Fort-Rivet et le Carrefour et découpe tout ce qui bouge. Vizzik Tirelire jure que ce n'est pas la sienne.
- Les kodos vont mourir dans un cimetière connu d'eux seuls, quelque part au sud-ouest, et il y a de l'ivoire à ramasser pour qui le trouve. Personne ne l'a trouvé.
- Un loup aux yeux verts attaque les caravanes la nuit, au nord, avec une meute qu'il a pervertie. Là où il a dormi, l'herbe est brûlée en cercle.
- Jaina Portvaillant achèterait du bois aux orcs pour rebâtir Theramore. Des nobles de Hurlevent parlent de trahison ; des bûcherons orcs, d'une bonne affaire.
- Le Cartel Baille-Fonds vend une huile qui brûle sous la pluie, et un capitaine au chapeau à plume rouge coule les navires de Gentepression pour en garder le marché.
- La nuit, des feux verts brillent dans les collines rouges du sud, et l'on entend rire comme une chèvre. Les grunts disent que c'est le vent. Les grunts ne vont pas voir.
- Un trésor nain serait enterré sous l'Épineux du Carrefour, et c'est pour ça que les taurens interdisent d'y creuser. Les taurens disent que c'est pour l'arbre.
- Un brasseur pandaren voyagerait avec une bière qui « fait voir les esprits ». Les taurens le cherchent. Les nains aussi, pour d'autres raisons.` },

  // ---------------------------------------------------------------- 16. Lexique
  { titre: PAGES_LIVRE[15], texte: `
Vingt mots qu'on entend sur les pistes. Les orcs, les gobelins et les réfugiés ne les prononcent pas pareil ; ils veulent dire la même chose.

- **Kraal** : un village huran, une enceinte de ronces géantes tressées. On n'y entre pas, on y est admis.
- **Kodo** : le colosse gris des plaines, gros comme une maison. Bête de somme, viande de fête, monture de ceux qui ne sont pas pressés.
- **Zhévra** : le cheval rayé de la savane, que personne n'a jamais dressé. On le mange.
- **Perchoir** : la plate-forme d'un maître de vol, où dorment les wyvernes et les hippogriffes.
- **Grunt** : un soldat de la Horde. Le dire avec respect ; ils entendent de loin.
- **Le Guet** : la garde de Theramore. Tabard bleu, lion d'or, et des rondes qui doublent la nuit.
- **Tabard** : la tunique aux couleurs de sa cité ou de son ordre, qu'on porte par-dessus l'armure. En terre hostile, c'est une cible.
- **Lok'tar** : le salut des orcs, « victoire ». On répond « lok'tar », ou on se tait.
- **Trotteur des plaines** : un grand oiseau coureur à long cou, méfiant et bon à rôtir.
- **Huran** : les hommes-sangliers des kraals. Les orcs disent « quilboar » ; c'est la même colère.
- **Épineux** : l'acacia mort du Carrefour, où l'on accroche ses présents et ses vœux.
- **Pierre de foyer** : la pierre runique qui vous ramène à votre auberge en dix minutes de concentration et une pensée pour la bière.
- **Lettre de change** : du papier scellé à la cire verte qui vaut de l'or dans tous les comptoirs du Cartel. Moins la commission.
- **Baille-Fonds** : le cartel rival, à la bourse percée. Prononcer en regardant derrière soi.
- **Roue dentée** : le tampon de cire dorée du Cartel Gentepression. Ce qui en porte un est un contrat ; ce qui n'en porte pas est une promesse.
- **Loa** : les esprits-animaux des trolls. Ne pas rire des masques.
- **Totem** : le pieu sculpté d'un chaman, planté pour appeler un esprit. Ne pas s'y appuyer, ne pas le déplacer « pour la vue ».
- **Fièvre des marais** : ce qu'on attrape dans l'Âprefange quand on boit sans faire bouillir. Tremblements, délire, puis la mousse violette du marais comme remède.
- **Maleterres** : ce qu'est devenu Lordaeron, de l'autre côté de la mer. On n'en parle pas aux réfugiés le soir.
- **La Trêve** : à Cabestan, le mot veut dire « on ne se bat pas ». Sur les pistes, il veut dire « pas encore ».` }
];

export const LIVRE_UNIVERS = journal({ cle: "livre-des-tarides", nom: TITRE_LIVRE, visible: true, pages });
export const LIVRE_DOCUMENTS = [LIVRE_UNIVERS];
