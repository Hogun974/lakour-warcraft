# Captures d'écran attendues

Les fichiers PNG de ce dossier illustrent le README (bandeau et sections) et la page du module (`media` du manifeste).
Ils ne sont pas fabriqués par les outils : ils se prennent dans un monde Foundry v14 (dnd5e) où le module est installé,
de préférence avec le MJ IA actif et le style « relief » pour les captures qui le précisent. Format : PNG, 1600 px de
large environ, sans barre d'adresse ni fenêtre inutile ; les noms de fichiers sont ceux attendus par le README et le
manifeste, à respecter.

| Fichier | Ce qu'elle montre | Comment l'obtenir |
|---|---|---|
| `accueil.png` | L'écran d'accueil du monde (fond dessiné par programme `assets/monde/fond.jpg`) avec le bouton « Rejoindre ». | Lancer le monde, page de connexion avant d'entrer. Sert aussi de `cover` et de `setup` dans le manifeste. |
| `compendiums.png` | Le dossier « La Kour Warcraft » déplié dans l'onglet Compendiums, les douze compendiums visibles. | Barre latérale › Compendiums, déplier le dossier, cadrer la barre latérale. |
| `peuple.png` | La fiche d'un peuple (par exemple Tauren) ouverte depuis le compendium Peuples : description, traits, avancements. | Compendium Peuples › ouvrir « Tauren » ; onglet Description puis Avancement si deux captures sont utiles. |
| `sous-classe.png` | Une sous-classe (par exemple « Serment du chevalier de la mort ») et sa liste d'avancements par niveau. | Compendium Sous-classes › ouvrir la sous-classe › onglet Avancement. |
| `carte-cabestan.png` | La carte « Cabestan — Quai des Comptoirs » activée, avec ses épingles de journal, ses lumières et quelques jetons posés. | Installer le contenu (Réglages › La Kour Warcraft › Installer), activer la scène, poser deux ou trois PNJ du bestiaire, masquer les calques inutiles. |
| `carte-relief.png` | La même carte (ou « Tarides — Fonderie de Fort-Rivet ») en style relief. | Réglage du MJ IA « Style visuel » sur relief ; le module rebascule les fonds et les jetons. |
| `bestiaire.png` | Une fiche de PNJ du bestiaire (par exemple « Vieille Plume-Fiel, matriarche des harpies ») avec son jeton, ses attaques et ses capacités aux icônes peintes. | Compendium Bestiaire › ouvrir la fiche ; capturer la fiche et le jeton côte à côte si possible. |
| `etabli.png` | La fenêtre de l'établi d'artisanat ouverte depuis une fiche de personnage, une recette choisie, les composants et le coût affichés. | Créer un personnage avec la maîtrise d'un outil (forgeron…), lui donner des composants du compendium Objets, contrôle « Établi » dans l'en-tête de la fiche. |
| `aura.png` | Une aura en jeu : le paladin au centre, les alliés dans le rayon portant l'effet reçu (icône sur le jeton). | Personnage avec « Aura de pureté » (niveau 6 de la sous-classe), jetons alliés à 3 m ou moins, combat lancé. |
| `fete.png` | Le journal d'une fête de saison (par exemple « Fête — La Trêve des Présents (MJ) ») avec son illustration en tête. | Compendium Guides et aventures › ouvrir le journal de la fête ; avec le MJ IA, forcer la fête dans ses réglages pour voir aussi le décor. |
| `mj-ia.png` | La console du MJ IA en séance, une narration dans le chat et des jetons posés sur une carte du module. | Facultatif : nécessite une clé d'API chez un fournisseur. Flouter toute information personnelle. |

## Captures des tutoriels

Utilisées par [`TUTORIEL.md`](../../TUTORIEL.md) (interface de Foundry en **français**, module `lakour-warcraft`, monde
`la-kour-warcraft`) et par [`TUTORIAL.md`](../../TUTORIAL.md) (même capture avec le suffixe **`-en`** : interface de Foundry
en **anglais**, module `lakour-warcraft-en`, monde `la-kour-warcraft-en`). Huit fichiers en tout, à prendre dans un Foundry
v14 neuf (dnd5e 6.0.6).

> Pas de capture de l'installation du monde par manifeste : Foundry 14 n'a plus de bouton « Installer un monde » (le
> monde vierge se distribue en archive à décompresser dans `Data/worlds/`). Pas de capture des mots de passe non plus.

| Fichier (français / anglais) | Ce qu'elle montre | Comment l'obtenir |
|---|---|---|
| `tuto-installer-module.png` / `tuto-installer-module-en.png` | La fenêtre **Installer un module** avec l'URL du manifeste collée en bas (`…/module.json` ; `…/lakour-warcraft-en.json` pour l'anglais). | Écran d'accueil de Foundry › Modules complémentaires › Installer un module ; coller l'URL avant de cliquer sur Installer. |
| `tuto-premier-lancement.png` / `tuto-premier-lancement-en.png` | Le monde vierge au premier lancement : la carte « Cabestan — Quai des Comptoirs » (« Ratchet — Trading Post Quay ») active, l'onglet Journaux ouvert sur le dossier La Kour Warcraft. | Lancer le monde vierge neuf, se connecter en Gamemaster, ouvrir l'onglet Journaux et déplier le dossier. |
| `tuto-aventures.png` / `tuto-aventures-en.png` | Le compendium **Aventures prêtes à jouer** ouvert, une aventure (Les Puits de cendre / The Ash Wells) affichée avec son bouton **Importer**. | Onglet Compendiums › dossier La Kour Warcraft › Aventures prêtes à jouer › ouvrir l'aventure. |
| `tuto-mj-ia-reglages.png` / `tuto-mj-ia-reglages-en.png` | Les réglages du MJ IA dans le monde vierge : personnalité « Le Conteur épique » (console), autonomie « Validation par le MJ humain », budget par séance 10. | Réglages › Configurer les réglages › La Kour – MJ IA (et la console, chapeau de magicien, pour la personnalité). Aucune clé d'API visible. |

Conseils : pas de données de joueurs réels ni de clés d'API visibles ; préférer un monde d'essai. Les captures en
relief et celle du MJ IA sont facultatives ; les quatre premières plus `carte-cabestan.png`, `sous-classe.png` et
`etabli.png` suffisent au README et au manifeste.
