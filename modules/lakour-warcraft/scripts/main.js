// Installation du contenu La Kour Warcraft dans un monde D&D 5e : guides et aventures dans le journal, cartes des
// aventures rangées par dossier (les lieux génériques « lieu-… » restent au compendium, le MJ IA les importe au besoin),
// plans des cartes pour le placement des jetons, style visuel plat ou relief.
const ID = "lakour-warcraft";
const VERSION_CONTENU = "0.4.2";   // 0.4.0 : journaux liés (@UUID, jets), listes de sorts, cartes vivantes (sons, zones, épingles) ;
                                   // 0.4.2 : one-shot « Une nuit aux Deux Lanternes » (journaux, cartes et dossier proposés aux mondes déjà installés)

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;

// ---------- Style visuel (plat / relief) : réglage du module MJ IA s'il est actif, sinon plat.
// Chaque image du module existe en deux versions : assets/<x>/<f>.svg (plat) et assets/<x>/3d/<f>.svg (relief).
const styleVisuel = () => (game.modules.get("lakour-mj-ia")?.active ? game.settings.get("lakour-mj-ia", "styleVisuel") : "2d");

export function cheminSelonStyle(src, style) {
  if (!src?.startsWith(`modules/${ID}/assets/`)) return src;
  const plat = src.replace("/3d/", "/");
  if (style !== "3d") return plat;
  const i = plat.lastIndexOf("/");
  return `${plat.slice(0, i)}/3d${plat.slice(i)}`;
}

async function styliserScene(scene, style) {
  const niveau = scene.levels.contents[0];
  const voulu = cheminSelonStyle(niveau?.background.src, style);
  let n = 0;
  if (niveau && voulu !== niveau.background.src) { await scene.updateEmbeddedDocuments("Level", [{ _id: niveau.id, "background.src": voulu }]); n++; }
  const jetons = scene.tokens.filter(t => cheminSelonStyle(t.texture.src, style) !== t.texture.src)
    .map(t => ({ _id: t.id, "texture.src": cheminSelonStyle(t.texture.src, style) }));
  if (jetons.length) { await scene.updateEmbeddedDocuments("Token", jetons); n += jetons.length; }
  return n;
}

async function styliserActeur(acteur, style) {
  const maj = {};
  if (cheminSelonStyle(acteur.img, style) !== acteur.img) maj.img = cheminSelonStyle(acteur.img, style);
  const tex = acteur.prototypeToken.texture.src;
  if (cheminSelonStyle(tex, style) !== tex) maj["prototypeToken.texture.src"] = cheminSelonStyle(tex, style);
  if (Object.keys(maj).length) await acteur.update(maj);
  return Object.keys(maj).length ? 1 : 0;
}

async function appliquerStyle(style) {
  let n = 0;
  for (const scene of game.scenes) n += await styliserScene(scene, style);
  for (const acteur of game.actors) n += await styliserActeur(acteur, style);
  return n;
}

// Dossier d'un type de document, créé au besoin (une aventure = un dossier de scènes).
async function dossier(type, nom) {
  return game.folders.find(f => f.type === type && f.getFlag(ID, "dossier") === nom)
    ?? Folder.implementation.create({ name: nom, type, color: "#1a3a5a", flags: { [ID]: { dossier: nom } } });
}

// Un guide ou une aventure déjà installé d'une version précédente reprend les pages du compendium (liens, jets, aides de
// jeu découpées) ; son nom, son dossier et ses droits restent. Les retouches faites à la main dans ses pages sont perdues.
export async function rafraichirJournal(existant, source) {
  if (existant.getFlag(ID, "version") === VERSION_CONTENU) return false;
  // Les pages que le MJ IA a ajoutées ou réécrites (modifier_scenario) restent telles quelles, avec leur historique.
  const gardees = new Set(existant.pages.filter(p => p.getFlag("lakour-mj-ia", "ajoutee") || p.getFlag("lakour-mj-ia", "historique")?.length).map(p => p.id));
  const remplacees = existant.pages.filter(p => !gardees.has(p.id)).map(p => p.id);
  if (remplacees.length) await existant.deleteEmbeddedDocuments("JournalEntryPage", remplacees);
  await existant.createEmbeddedDocuments("JournalEntryPage", source.pages.filter(p => !gardees.has(p.id)).map(p => p.toObject()), { keepId: true });
  await existant.setFlag(ID, "version", VERSION_CONTENU);
  return true;
}

// Un journal du module garde la visibilité de son compendium (guide du joueur, aides de jeu : visibles). Sans
// clearOwnership: false, Foundry l'importerait caché. Un journal du monde trop caché est rendu visible ; jamais l'inverse.
export async function visibiliteDuCompendium(existant, source) {
  const voulu = source.ownership?.default ?? 0;
  if ((existant.ownership?.default ?? 0) >= voulu) return false;
  await existant.update({ "ownership.default": voulu });
  return true;
}

// Sons d'ambiance, zones et épingles des cartes du module, marqués comme tels. Les épingles visent les journaux du monde
// (journaux : identifiant au compendium -> identifiant dans le monde ; les pages gardent les leurs).
const COLLECTIONS_VIVANTES = [["AmbientSound", "sounds"], ["Region", "regions"], ["Note", "notes"]];
export function carteVivante(donnees, journaux) {
  const marque = d => foundry.utils.mergeObject(d, { [`flags.${ID}.carte`]: true }, { inplace: false });
  return {
    sounds: (donnees.sounds ?? []).map(marque),
    regions: (donnees.regions ?? []).map(marque),
    notes: (donnees.notes ?? []).map(n => marque({ ...n, entryId: journaux.get(n.entryId) ?? n.entryId }))
  };
}

// Une carte déjà importée d'une version précédente reçoit les sons, zones et épingles du module (ceux d'avant, marqués, sont
// remplacés) ; ses jetons, murs, brouillard et ce que le MJ y a ajouté restent.
export async function rafraichirScene(scene, source, journaux) {
  if (scene.getFlag(ID, "version") === VERSION_CONTENU) return false;
  const donnees = source.toObject();
  const vivante = carteVivante(donnees, journaux);
  for (const [type, champ] of COLLECTIONS_VIVANTES) {
    // Ceux du module : marqués, ou portant un identifiant du compendium (importés avant la marque).
    const duModule = new Set((donnees[champ] ?? []).map(d => d._id));
    const anciens = scene[champ].filter(d => d.getFlag(ID, "carte") || duModule.has(d.id)).map(d => d.id);
    if (anciens.length) await scene.deleteEmbeddedDocuments(type, anciens);
    if (vivante[champ].length) await scene.createEmbeddedDocuments(type, vivante[champ], { keepId: true });
  }
  await scene.setFlag(ID, "version", VERSION_CONTENU);
  return true;
}

// Une seule installation à la fois (bouton cliqué deux fois, ou pendant la proposition du « ready ») ; une erreur est montrée
// au MJ au lieu de laisser l'installation à moitié faite sans rien dire.
let installationEnCours = null;
export function installer() {
  installationEnCours ??= installerContenu()
    .catch(erreur => {
      console.error(`${ID} | installation`, erreur);
      globalThis.ui?.notifications?.error(`La Kour Warcraft : installation interrompue (${erreur.message}). Le détail est dans la console (F12).`, { permanent: true });
    })
    .finally(() => { installationEnCours = null; });
  return installationEnCours;
}

async function installerContenu() {
  const rapport = [];
  const journauxDuMonde = new Map();   // identifiant au compendium -> identifiant dans le monde

  // Guides et aventures : le guide du joueur reste visible de tous, ceux du MJ restent cachés (droits du compendium).
  const journaux = await game.packs.get(`${ID}.journaux`).getDocuments();
  for (const j of journaux) {
    const existant = game.journal.find(x => x.getFlag(ID, "cle") === j.getFlag(ID, "cle"));
    if (existant) {
      journauxDuMonde.set(j.id, existant.id);
      if (await rafraichirJournal(existant, j)) rapport.push(`${j.name} (mis à jour)`);
      if (await visibiliteDuCompendium(existant, j)) rapport.push(`${j.name} (rendu visible des joueurs)`);
      continue;
    }
    // Même identifiant qu'au compendium (s'il est libre) : les épingles des cartes le visent.
    const libre = !game.journal.get(j.id);
    const donnees = foundry.utils.mergeObject(game.journal.fromCompendium(j, { keepId: libre, clearOwnership: false }), { [`flags.${ID}.version`]: VERSION_CONTENU });
    const cree = await JournalEntry.implementation.create({ ...donnees, folder: (await dossier("JournalEntry", "La Kour Warcraft")).id }, { keepId: libre });
    journauxDuMonde.set(j.id, cree.id);
    rapport.push(j.name);
  }

  // Cartes des aventures, une aventure par dossier ; les dessins (étiquettes de pièces) prennent le MJ pour auteur.
  const scenes = await game.packs.get(`${ID}.scenes`)?.getDocuments() ?? [];
  for (const s of scenes) {
    const cle = s.getFlag(ID, "cle");
    if (cle?.startsWith("lieu-")) continue;
    const existante = game.scenes.find(x => x.getFlag(ID, "cle") === cle);
    if (existante) {
      if (await rafraichirScene(existante, s, journauxDuMonde)) rapport.push(`${s.name} (sons, zones et épingles)`);
      continue;
    }
    const donnees = game.scenes.fromCompendium(s);
    donnees.drawings = donnees.drawings?.map(d => ({ ...d, author: game.user.id }));
    Object.assign(donnees, carteVivante(donnees, journauxDuMonde));
    foundry.utils.setProperty(donnees, `flags.${ID}.version`, VERSION_CONTENU);
    await Scene.implementation.create({ ...donnees, folder: (await dossier("Scene", s.getFlag(ID, "aventure") ?? "La Kour Warcraft")).id });
    rapport.push(s.name);
  }

  // Plan de chaque carte (pièces, éléments, portes), recopié dans les scènes déjà importées s'il a changé.
  try {
    const plans = await (await fetch(foundry.utils.getRoute(`modules/${ID}/assets/cartes/plans.json`), { cache: "no-store" })).json();
    for (const scene of game.scenes.filter(x => plans[x.getFlag(ID, "cle")])) {
      const plan = plans[scene.getFlag(ID, "cle")];
      if (!foundry.utils.objectsEqual(scene.getFlag(ID, "plan") ?? {}, plan)) await scene.setFlag(ID, "plan", plan);
    }
  } catch (erreur) { console.warn(`${ID} | plans des cartes`, erreur); }

  // Tout le contenu est en mètres (grille de 1,5 m) : unités métriques de dnd5e pour les distances, les poids et les volumes,
  // sinon une fiche dont les unités sont vides afficherait « 9 pieds ».
  for (const cle of ["metricLengthUnits", "metricWeightUnits", "metricVolumeUnits"]) {
    if (game.settings.settings.has(`dnd5e.${cle}`) && !game.settings.get("dnd5e", cle)) {
      await game.settings.set("dnd5e", cle, true);
      rapport.push(`unités métriques (${cle})`);
    }
  }

  await appliquerStyle(styleVisuel());
  await game.settings.set(ID, "installe", VERSION_CONTENU);
  ui.notifications.info(game.i18n.format("LAKOURWOW.Installe", { liste: rapport.join(", ") || game.i18n.localize("LAKOURWOW.RienDeNeuf") }));
}

// Bouton « Installer » dans les réglages du module (comme lakour-40k) : relancer l'installation à tout moment.
class FenetreInstallation extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: `${ID}-installation`,
    window: { title: "LAKOURWOW.Titre", icon: "fa-solid fa-dragon" },
    position: { width: 460, height: "auto" },
    actions: { installer: FenetreInstallation.#installer }
  };

  static PARTS = { corps: { template: `modules/${ID}/templates/installation.hbs` } };

  async _prepareContext() {
    return { systemeOk: game.system.id === "dnd5e", installe: game.settings.get(ID, "installe") };
  }

  static async #installer() {
    await installer();
    this.render();
  }
}

Hooks.once("init", () => {
  game.settings.register(ID, "installe", { scope: "world", config: false, type: String, default: "" });
  game.settings.registerMenu(ID, "installation", {
    name: "LAKOURWOW.Titre",
    label: "LAKOURWOW.Ouvrir",
    hint: "LAKOURWOW.Aide",
    icon: "fa-solid fa-dragon",
    type: FenetreInstallation,
    restricted: true
  });
});

// Style changé dans le MJ IA : on bascule cartes et jetons (MJ actif seulement, pour n'écrire qu'une fois).
Hooks.on("lakourStyleVisuel", async style => {
  if (game.user !== game.users.activeGM) return;
  const n = await appliquerStyle(style);
  if (n) ui.notifications.info(game.i18n.format("LAKOURWOW.StyleApplique", { n }));
});

// Un PNJ ou une carte importés plus tard du compendium arrivent en version plate.
Hooks.on("createActor", acteur => {
  if (game.user === game.users.activeGM && styleVisuel() === "3d") styliserActeur(acteur, "3d");
});
Hooks.on("createScene", scene => {
  if (game.user === game.users.activeGM && styleVisuel() === "3d") styliserScene(scene, "3d");
});

Hooks.once("ready", async () => {
  game.modules.get(ID).api = { installer, cheminSelonStyle };
  if (!game.user.isGM || game.user !== game.users.activeGM || game.system.id !== "dnd5e") return;
  if (game.settings.get(ID, "installe") === VERSION_CONTENU) return;
  const ok = await DialogV2.confirm({
    window: { title: "LAKOURWOW.Titre" },
    content: `<p>${game.i18n.localize("LAKOURWOW.Proposer")}</p>`,
    rejectClose: false
  });
  if (ok) await installer();
});
