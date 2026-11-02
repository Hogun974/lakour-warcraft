// Compagnons des personnages : le familier du rôdeur « Chasseur et son familier » (contenu/sous-classes.mjs). Acteur
// dnd5e du bestiaire, posé par le MJ ; ses chiffres de base valent pour un rôdeur de niveau 3, et le trait « Lien du
// chasseur » dit comment les ajuster au niveau du rôdeur (bonus de maîtrise, points de vie). Textes originaux.
import { action, attaque, pnj, trait } from "./acteurs.mjs";
import { collection } from "./aides.mjs";

export const COMPAGNONS = collection("compagnons", [
  pnj({ cle: "familier-du-chasseur", nom: "Familier du chasseur", fp: 0.5, type: "bête", alignement: "Non aligné",
    ca: 13, armure: "fourrure ou écailles", pv: 20, carac: { for: 14, dex: 14, con: 14, int: 6, sag: 12, cha: 6 },
    vitesse: { marche: 12 }, sens: { noir: 18 }, competences: { perception: 1, discretion: 1 }, disposition: 1,
    capacites: [
      trait("Lien du chasseur", "Le familier suit les ordres de son rôdeur (action bonus) et agit juste après lui. Il ajoute le bonus de maîtrise du rôdeur à sa CA (11 + bonus), à ses jets d'attaque (Force + bonus) et à ses dégâts (1d8 + Force + bonus) ; les chiffres de cette fiche comptent un bonus de +2, celui d'un rôdeur de niveau 3 à 4. Il a 5 + cinq fois le niveau de rôdeur points de vie (20 au niveau 3). Choisissez son allure : loup, raptor, grand félin, ours ou sanglier ; les chiffres ne changent pas."),
      attaque("Crocs et griffes", { toucher: 4, degats: "1d8+4", type: "perforant", effet: "Bonus de maîtrise du rôdeur compris (+2). Les dégâts peuvent être tranchants ou contondants au lieu de perforants, selon l'animal." }),
      action("Se jeter devant", "Quand une créature que le familier voit attaque son rôdeur à 1,5 m de lui, il impose le désavantage au jet d'attaque.", { activation: "réaction" })
    ],
    texte: "Une bête fidèle, loup, raptor ou grand félin, qui ne quitte pas son chasseur d'une semelle et grogne avant même qu'on ait sorti une lame.",
    mj: "Fiche de base du familier de la sous-classe « Chasseur et son familier » (rôdeur). Posez-le près de son rôdeur, avec l'allégeance du groupe. Recalculez ses PV (5 + 5 × niveau de rôdeur) et ajoutez à sa CA, à son toucher et à ses dégâts la différence entre le bonus de maîtrise du rôdeur et +2. Il ne fuit pas tant que son rôdeur est debout." })
]);
