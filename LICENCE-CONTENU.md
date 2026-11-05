# Licence du contenu — La Kour Warcraft

*English summary at the end.*

Ce dépôt réunit du **code** et du **contenu de jeu**, sous deux licences :

| Quoi | Licence |
|---|---|
| Le code : scripts, outils, essais, gabarits, traductions de l'interface | **MIT** : voir [`LICENSE`](LICENSE) |
| Les textes et les images originaux écrits ou produits pour LaKour | **CC BY-NC-SA 4.0** : ce fichier |
| La propriété intellectuelle de tiers (univers Warcraft, SRD, icônes…) | **à ses titulaires** : voir plus bas |

Titulaire des droits sur le code et le contenu original : **Hogun974**, 2026.

## Œuvre de fan non officielle

Ce projet est une **création de fans non officielle et gratuite**. Il n'est **ni affilié à Blizzard Entertainment, Inc.,
ni approuvé ou soutenu par elle**, ni affilié à Wizards of the Coast LLC. Warcraft, World of Warcraft, Azeroth et les
noms, lieux, peuples, factions et personnages de cet univers sont des marques ou des marques déposées de Blizzard
Entertainment, Inc. aux États-Unis et dans d'autres pays ; Dungeons & Dragons et D&D sont des marques de Wizards of the
Coast LLC. Ils **restent à leurs titulaires**. Le système `dnd5e` pour Foundry VTT appartient à ses auteurs et n'est pas
inclus dans ce dépôt.

La licence CC BY-NC-SA 4.0 ci-dessous **ne couvre que les textes et les images originaux de ce projet** : elle ne
concède **aucun droit sur la propriété intellectuelle de tiers** (marques, noms, univers), ni sur le matériel du SRD, qui
garde sa propre licence. **Aucun usage commercial** n'est permis : ni vente, ni intégration dans une offre payante.

## Sous CC BY-NC-SA 4.0 : les textes et les images

Licence Creative Commons **Attribution – Pas d'utilisation commerciale – Partage dans les mêmes conditions 4.0
International** : <https://creativecommons.org/licenses/by-nc-sa/4.0/> (résumé en français :
<https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr> ; texte juridique :
<https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.fr>).

Sont sous cette licence :

- `modules/lakour-warcraft/contenu/` : les textes et les données de jeu (livre d'univers, aventure, campagne, one-shot,
  donjon, guides, aides de jeu, peuples, historiques, dons, sous-classes, sorts, objets, bestiaire, métiers, garnison,
  réputations, contrats, fêtes, PNJ…), y compris les dictionnaires anglais de `contenu/en/` ;
- `modules/lakour-warcraft/src/` et `modules/lakour-warcraft/packs/` : les compendiums engendrés de `contenu/` ;
- `modules/lakour-warcraft-en/` (module anglais engendré, non versionné) : le même contenu, traduit ;
- `monde/` : les sources du monde vierge (journaux, scènes, dossiers, réglages, titre et description de `world.json` et
  `world.en.json`) ;
- les images produites pour le projet : `modules/lakour-warcraft/assets/monde/` (écran d'accueil), `assets/fetes/`
  (fêtes de saison), `assets/cartes/` (plans dessinés par programme) et la mise en forme des jetons de `assets/jetons/`
  (médaillons, couleurs, relief ; les silhouettes restent sous CC BY 3.0, voir plus bas), ainsi que les autres données
  de `assets/` (figurants, plans).

Quand un même fichier mêle code et texte (les `.mjs` de `contenu/`), les textes, noms et données de jeu qu'il contient
sont sous CC BY-NC-SA 4.0 et le code JavaScript qui les assemble sous MIT.

### Attribution attendue

Créditer **« LaKour — Hogun974 »**, avec le lien vers le dépôt (<https://github.com/Hogun974/lakour-warcraft>), le nom
et le lien de la licence, et l'indication des modifications. Par exemple :

> D'après *La Kour Warcraft*, LaKour — Hogun974 (https://github.com/Hogun974/lakour-warcraft), licence CC BY-NC-SA 4.0
> (https://creativecommons.org/licenses/by-nc-sa/4.0/). Modifié.

Pas d'utilisation commerciale ; une adaptation se partage sous la même licence. Si elle reprend aussi le matériel du SRD,
elle doit garder les mentions du SRD ci-dessous.

## Sous MIT : le code

`modules/lakour-warcraft/scripts/`, `templates/`, `lang/`, `module.json`, `outils/`, `essais/`, `docs/` (documentation
du code), `.github/`, `package.json`.

## Sous licence tierce

| Quoi | Où | Licence | Mention |
|---|---|---|---|
| Profils chiffrés des créatures, adaptés et renommés | `contenu/` (bestiaire), `src/`, `packs/` | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode) (SRD 5.2.1, Wizards of the Coast LLC) | ci-dessous |
| Progression de la sous-classe « Aspect des Vols draconiques » | `contenu/` (sous-classes), `src/`, `packs/` | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode) (SRD 5.1, Wizards of the Coast LLC) | ci-dessous |
| Silhouettes des jetons : icônes de [game-icons.net](https://game-icons.net) | `modules/lakour-warcraft/assets/jetons/` | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | auteurs icône par icône dans `modules/lakour-warcraft/CREDITS.md` |
| Univers, marques et noms de Warcraft | partout où ils sont nommés | © Blizzard Entertainment, Inc. | voir « Œuvre de fan non officielle » |

Aucun texte du SRD n'est reproduit : seuls des chiffres et une progression sont repris, sous leur licence d'origine.
Mentions exigées par cette licence :

> This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC,
> available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0
> International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

> This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and
> available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative
> Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

Les illustrations (`assets/monde/`, `assets/fetes/`) ont été générées localement avec le modèle d'IA FLUX.2 klein 9B,
publié sous licence non commerciale : elles sont partagées sous CC BY-NC-SA 4.0 dans la mesure où le projet détient des
droits sur elles, et leur usage reste aussi soumis aux conditions de ce modèle. Le moteur `modules/lakour-mj-ia`
(sous-module) a son propre dépôt et sa propre licence (MIT).

Foundry VTT (Foundry Virtual Tabletop) est une marque de Foundry Gaming, LLC ; ce projet n'est ni affilié à Foundry
Gaming ni approuvé par elle.

## English summary

This is an **unofficial, free fan work**, **not affiliated with, endorsed or sponsored by Blizzard Entertainment, Inc.**,
nor affiliated with Wizards of the Coast LLC. Warcraft, World of Warcraft, Azeroth and the associated names are
trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries; Dungeons &
Dragons and D&D are trademarks of Wizards of the Coast LLC. They remain their owners'.

The **code** (scripts, tools, tests, templates, interface translations) is under the **MIT** licence (see `LICENSE`). The
**original texts and images** written or made for LaKour — `contenu/` and its English dictionaries, `src/`, `packs/`,
the generated `lakour-warcraft-en` module, `monde/` and the images in `assets/` — are under **Creative Commons
Attribution-NonCommercial-ShareAlike 4.0 International** (<https://creativecommons.org/licenses/by-nc-sa/4.0/>). That
licence covers **only this project's original texts and images, not any third-party intellectual property** nor the SRD
material (SRD 5.2.1 and SRD 5.1, CC BY 4.0, attribution notices above), and **no commercial use** is allowed. Credit
**"LaKour — Hogun974"** with a link to the repository and to the licence, and indicate changes. The token silhouettes are
game-icons.net icons under CC BY 3.0 (credits in `CREDITS.md`). The illustrations were generated locally with the
non-commercial FLUX.2 klein 9B model. Foundry VTT is a trademark of Foundry Gaming, LLC; this project is not affiliated
with or endorsed by it.
