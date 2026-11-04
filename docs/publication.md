# Publication — liste de contrôle

Pour passer le dépôt `lakour-warcraft` en public sur GitHub et livrer des paquets installables dans Foundry v14.
Tout ce qui suit est à faire par Jordan ; rien n'est automatique avant le premier tag.

## 1. Avant de rendre le dépôt public

- [ ] **Licences** : trancher la section « Licence » du `README.md` (code MIT ; textes et images CC BY-NC-SA 4.0, ou
      autre choix), retirer le `TODO`, ajouter un fichier `LICENSE` à la racine (et une copie ou un renvoi dans
      `modules/lakour-warcraft/`), puis faire pointer `license` dans `module.json` vers ce fichier
      (`https://github.com/Hogun974/lakour-warcraft/blob/principale/LICENSE`). Même chose dans `README.en.md`.
- [ ] **Relire ce qui sort** : `README.md`, `README.en.md`, `CHANGELOG.md`, `module.json` (description), `CREDITS.md`.
      Vérifier qu'aucun fichier du dépôt ne mentionne une adresse privée, un serveur, un identifiant ou un secret
      (`git grep -nE "172\.|forgejo|\.identifiants|token|motdepasse"`), y compris dans `docs/` et `essais/`.
- [ ] **Historique git** : les 37 commits sont propres (messages de version). Vérifier qu'aucun commit ancien n'a
      embarqué un fichier sensible (`git log --all --stat | grep -iE "identifiant|secret|\.env"`).
- [ ] **Sous-module** : `.gitmodules` pointe sur `../lakour-mj-ia`, soit `https://github.com/Hogun974/lakour-mj-ia` une
      fois sur GitHub. Le dépôt du moteur doit être **public** lui aussi (sinon `git clone --recurse-submodules` échoue
      pour les visiteurs et le workflow de release ne peut pas le récupérer), ou alors créer un jeton d'accès (PAT, lecture
      des dépôts) et le poser dans le secret `SOUS_MODULE_TOKEN` du dépôt pour le workflow seulement.
- [ ] **Branche par défaut** : `principale` est la branche de référence ; les URL du manifeste (`changelog`, `license`,
      `media`) et des README la nomment. Si GitHub attend `main`, soit renommer, soit garder `principale` en branche par
      défaut dans Settings › Branches.
- [ ] **Captures** : fournir les PNG listés dans `docs/captures/LISEZ-MOI.md` (au moins `accueil.png`,
      `carte-cabestan.png`, `sous-classe.png`, `etabli.png`, utilisés par le README et par `media` du manifeste). Pas de
      données de joueurs ni de clé visible.
- [ ] **Description et sujets du dépôt** sur GitHub : « Azeroth pour D&D 5e dans Foundry VTT v14 (module de contenu,
      français) », sujets `foundry-vtt`, `foundryvtt-module`, `dnd5e`, `warcraft`, `french`.
- [ ] **Issues** activées (le manifeste pointe sur `…/issues`).

## 2. Première release

Le workflow `.github/workflows/release.yml` part à chaque tag `vX.Y.Z` : il récupère le sous-module, fabrique les
compendiums, lance les essais, empaquette le module (`outils/empaqueter-module.mjs`), empaquette le monde si le script
`empaqueter-monde` existe dans `package.json`, et publie une release avec `module.json`, `lakour-warcraft.zip`,
`world.json` et l'archive du monde. Les notes de release sont la section `## X.Y.Z` de `CHANGELOG.md`.

- [ ] Mettre `version` dans `modules/lakour-warcraft/module.json` à la version à publier (le workflow refuse un tag qui
      ne correspond pas) et écrire la section correspondante dans `CHANGELOG.md` (remplacer « Non publié »).
- [ ] Vérifier en local : `npm run fabriquer-warcraft && npm run essais && node outils/empaqueter-module.mjs --verifier-version`
      puis installer `dist/lakour-warcraft.zip` dans un Foundry d'essai par « Installer un module » (chemin local ou
      zip) et parcourir les compendiums.
- [ ] Commit, puis tag et poussée : `git tag v0.11.0 && git push github principale --tags` (adapter le numéro).
- [ ] Suivre l'onglet **Actions** ; à la fin, la release doit porter les quatre fichiers. Si le monde manque, c'est que
      le script `empaqueter-monde` n'existe pas encore ou n'écrit pas dans `dist/`.
- [ ] Tester l'installation **depuis GitHub** dans un Foundry vierge : URL du manifeste
      `https://github.com/Hogun974/lakour-warcraft/releases/latest/download/module.json`, puis le monde avec
      `…/releases/latest/download/world.json`. Vérifier que Foundry voit la bonne version et propose la mise à jour à la
      release suivante.
- [ ] Marquer la release « latest » (c'est le défaut) : les URL `releases/latest/download/…` en dépendent.

## 3. Passage en public

- [ ] Settings › General › Danger Zone › **Change visibility › Public** pour `lakour-warcraft`, et pour
      `lakour-mj-ia` si ce n'est pas déjà fait.
- [ ] Après le passage, recloner dans un dossier vide avec `git clone --recurse-submodules` pour vérifier que tout
      arrive, puis relancer `npm install && npm run fabriquer-warcraft && npm run essais`.
- [ ] Relire le README tel que GitHub l'affiche (images du bandeau, ancres du sommaire, tableau des sous-classes).

## 4. Soumission facultative au catalogue foundryvtt.com

Le catalogue (<https://foundryvtt.com/packages/>) permet l'installation par simple recherche dans Foundry. D'après le
[guide de l'éditeur](https://foundryvtt.com/article/publisher-handbook/) et la page de soumission
(<https://foundryvtt.com/packages/submit>), à revérifier au moment de soumettre :

- il faut un compte foundryvtt.com avec une **licence Foundry active** ; l'auto-publication d'un module gratuit ne
  demande aucun accord ni frais, mais chaque module passe par une **revue manuelle** de l'équipe (quelques jours) ;
- le formulaire demande en substance : le **nom du paquet** (`lakour-warcraft`, identique à `id` du manifeste), le
  titre, une description, l'auteur, le type (module), l'URL du **manifeste de la version** à publier ; ensuite, sur la
  page d'administration du paquet, les versions se déclarent une à une avec l'URL du manifeste **de cette version**
  (`https://github.com/Hogun974/lakour-warcraft/releases/download/vX.Y.Z/module.json`, jamais `/latest/`), la
  compatibilité (minimum 14, vérifiée 14.369), les images (`media` du manifeste : couverture, écran de configuration,
  captures), les catégories (contenu d'aventure, système dnd5e) ;
- la politique de Foundry sur les contenus préparés attend des contenus **faits par des humains** ; les illustrations
  générées par IA (écran d'accueil, fêtes) sont déclarées comme telles dans le README et `CREDITS.md`, à mentionner
  honnêtement dans la description si la question est posée ;
- une fois le paquet accepté, chaque release suppose d'ajouter sa version sur foundryvtt.com (à la main, ou plus tard
  par l'API de release de Foundry avec un jeton de paquet dans le workflow).

Un module gratuit n'a pas besoin du catalogue : l'URL du manifeste suffit aux joueurs.

## 5. URL à donner aux joueurs et aux MJ

| Quoi | URL |
|---|---|
| Module (manifeste, à coller dans « Installer un module ») | `https://github.com/Hogun974/lakour-warcraft/releases/latest/download/module.json` |
| Monde vierge (manifeste, « Installer un monde ») | `https://github.com/Hogun974/lakour-warcraft/releases/latest/download/world.json` |
| Archive du module (installation manuelle) | `https://github.com/Hogun974/lakour-warcraft/releases/latest/download/lakour-warcraft.zip` |
| Moteur MJ IA (facultatif) | `https://github.com/Hogun974/lakour-mj-ia` (manifeste : voir son README) |
| Page du projet, README, journal des versions | `https://github.com/Hogun974/lakour-warcraft` |
| Signaler un problème | `https://github.com/Hogun974/lakour-warcraft/issues` |

## 6. À chaque version suivante

1. Sources modifiées, `npm run fabriquer-warcraft`, `npm run essais`.
2. `version` dans `module.json` (et `VERSION_CONTENU` dans `scripts/main.js` si l'installateur doit rafraîchir les
   journaux et cartes déjà importés), section dans `CHANGELOG.md`.
3. Commit, tag `vX.Y.Z`, poussée des tags : la release se fait seule.
4. Si le paquet est au catalogue foundryvtt.com : y déclarer la version avec l'URL du manifeste de cette version.

## Release à blanc du 4 novembre 2026

Chaque workflow a été rejoué étape par étape (Ubuntu 24.04 sous WSL, **Node 24.22**, npm 10) dans un clone neuf
`git clone --recurse-submodules`, avec un tag local et les variables `GITHUB_REF_NAME` / `GITHUB_REPOSITORY` du runner ;
les archives produites ont été relues (manifeste à la racine, chemins `/`, `packs/` complets, ni `src/`, ni `contenu/`, ni
`essais/`, ni `node_modules`, ni `.git`, CRC vérifiés). Les actions sont passées en versions Node 24
(`actions/checkout@v5`, `actions/setup-node@v5`, `softprops/action-gh-release@v3` : les v4/v2 tournent encore sous
Node 20, en fin de vie sur les runners GitHub).

Constats et corrections :

- **Piège trouvé : les scripts ne s'exécutaient pas sous Linux.** La garde « lancé directement ? » écrite
  ``import.meta.url === `file:///${process.argv[1]…}` `` est toujours fausse sur le runner (`argv[1]` commence déjà par
  `/`, d'où `file:////…`) : le script se termine **sans rien faire et sans erreur**. Corrigé dans `outils/empaqueter-module.mjs`
  (`resolve(process.argv[1]) === fileURLToPath(import.meta.url)`). Sans cela : aucun `dist/`, puis échec des copies du monde.
- `node-version: 25` → **24** (version visée par les autres dépôts ; les essais passent en Node 24).
- Liste de fichiers de la release : `lakour-warcraft.zip` nommé **et** couvert par `dist/*.zip` (double envoi) →
  `dist/*.json` + `dist/*.zip`, `fail_on_unmatched_files: true`.

- [ ] **Bloquant, hors des fichiers touchés ici** : même garde cassée dans `outils/fabriquer-warcraft.mjs` :
      `npm run fabriquer-warcraft(-en)` ne fabrique rien sous Linux, `modules/lakour-warcraft-en/` n'existe pas et
      l'empaquetage échoue (« Compendiums non compilés »). Remplacer la ligne par
      `if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {` (imports `node:path`,
      `node:url`).
- [ ] `CHANGELOG.md` n'a pas de section `## 0.11.0` : texte de release générique.
- [ ] `lakour-mj-ia` public (ou secret `SOUS_MODULE_TOKEN`) avant de pousser le tag.
