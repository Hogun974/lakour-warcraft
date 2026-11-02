// Constructeurs communs du module lakour-warcraft (D&D 5e 6.0.6, règles 2024) : identifiants stables, icônes de
// Foundry, texte -> HTML, références croisées, journaux et tables. Les objets et acteurs propres à dnd5e sont
// construits dans leurs fichiers (objets.mjs, acteurs.mjs). Utilisés par outils/fabriquer-warcraft.mjs.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const MODULE = "lakour-warcraft";
export const STATS = { coreVersion: "14.369", systemId: "dnd5e", systemVersion: "6.0.6" };

// Identifiant Foundry stable (16 caractères alphanumériques) dérivé de la clé.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export function identifiant(cle) {
  const octets = createHash("sha256").update(`${MODULE}:${cle}`).digest();
  return Array.from(octets.subarray(0, 16), o => ALPHABET[o % ALPHABET.length]).join("");
}

// Icônes : choisies dans la liste réelle de Foundry 14 par mot-clé ; un mot-clé sans résultat est une erreur.
const ICONES = readFileSync(new URL("../../lakour-mj-ia/outils/icones-foundry14.txt", import.meta.url), "utf8").split(/\r?\n/).filter(Boolean);
export function icone(...motifs) {
  const trouvee = ICONES.find(i => motifs.every(m => i.includes(m)));
  if (!trouvee) throw new Error(`Aucune icône Foundry ne correspond à : ${motifs.join(" + ")}`);
  return trouvee;
}

// Texte -> HTML : paragraphes séparés par une ligne vide, **gras**, *italique*, listes « - », titres « # ».
export function html(texte = "") {
  const enLigne = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  return String(texte).trim().split(/\n\s*\n/).filter(Boolean).map(bloc => {
    const lignes = bloc.trim().split("\n");
    if (lignes.every(l => /^\s*-\s+/.test(l))) return `<ul>${lignes.map(l => `<li>${enLigne(l.replace(/^\s*-\s+/, ""))}</li>`).join("")}</ul>`;
    const titre = /^(#{1,3})\s+(.*)$/.exec(bloc.trim());
    if (titre && lignes.length === 1) return `<h${titre[1].length + 1}>${enLigne(titre[2])}</h${titre[1].length + 1}>`;
    return `<p>${lignes.map(enLigne).join("<br>")}</p>`;
  }).join("");
}

// Référence différée vers un autre document du module ("pack:cle"), résolue par le fabricant (uuid, id, name).
// Une référence orpheline fait échouer la fabrication.
export const ref = cle => ({ __ref: cle });

// Range les documents d'un supplément dans sa collection (flags.lakour-warcraft.collection) : les objets des suppléments
// partagent le compendium « objets » avec ceux d'Azeroth et de l'arsenal, et les essais les comptent à part.
export function collection(nom, documents) {
  for (const d of documents) d.flags[MODULE].collection = nom;
  return documents;
}

// ---------- Journaux

export function journal({ cle, nom, pages, visible = true }) {
  const _id = identifiant(`journaux:${cle}`);
  return {
    __pack: "journaux", __cle: `journaux:${cle}`,
    _id, _key: `!journal!${_id}`, name: nom, folder: null, sort: 0, categories: [],
    ownership: { default: visible ? 2 : 0 }, flags: { [MODULE]: { cle } }, _stats: STATS,
    pages: pages.map((p, i) => {
      const pid = identifiant(`journaux:${cle}:${i}`);
      return {
        _id: pid, _key: `!journal.pages!${_id}.${pid}`, name: p.titre, type: "text", sort: (i + 1) * 100,
        title: { show: true, level: 1 }, text: { content: html(p.texte), format: 1 }, ownership: { default: -1 }, flags: {}
      };
    })
  };
}

// Ajoute des pages à un journal déjà construit (un supplément complète un guide sans que le guide l'importe) : mêmes
// identifiants que journal() aurait donnés à ces rangs.
export function ajouterPages(j, pages) {
  const cle = j.flags[MODULE].cle;
  for (const p of pages) {
    const i = j.pages.length;
    const pid = identifiant(`journaux:${cle}:${i}`);
    j.pages.push({
      _id: pid, _key: `!journal.pages!${j._id}.${pid}`, name: p.titre, type: "text", sort: (i + 1) * 100,
      title: { show: true, level: 1 }, text: { content: html(p.texte), format: 1 }, ownership: { default: -1 }, flags: {}
    });
  }
  return j;
}

// ---------- Tables aléatoires : résultats [min, max, texte | { titre, texte } | ref("pack:cle")].

export function table({ cle, nom, formule, description = "", resultats }) {
  const _id = identifiant(`tables:${cle}`);
  return {
    __pack: "tables", __cle: `tables:${cle}`,
    _id, _key: `!tables!${_id}`, name: nom, img: icone("svg/d20"), description: html(description),
    formula: formule, replacement: true, displayRoll: true, folder: null, sort: 0, ownership: { default: 0 },
    flags: { [MODULE]: { cle } }, _stats: STATS,
    results: resultats.map(([min, max, contenu], i) => {
      const rid = identifiant(`tables:${cle}:${i}`);
      const estRef = typeof contenu === "object" && contenu.__ref;
      return {
        _id: rid, _key: `!tables.results!${_id}.${rid}`,
        type: estRef ? "document" : "text",
        name: estRef ? "" : (contenu.titre ?? ""),
        description: estRef ? "" : html(contenu.texte ?? contenu),
        ...(estRef ? { __refUuid: contenu.__ref } : {}),
        range: [min, max], weight: max - min + 1, drawn: false, img: null, flags: {}
      };
    })
  };
}
