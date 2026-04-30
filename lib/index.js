// ============================================================
//  lib/index.js — Point d'entrée du package npm
//
//  C'est CE fichier que Vite va compiler en dist/index.es.js
//  et dist/index.cjs.js lors du build de la librairie.
//
//  Quand un installateur fait :
//    import { Kalendar } from "@najororabiaza/kalendar";
//  C'est cet export qu'il récupère.
//
//  On exporte aussi DEFAULT_COLOR_MAPPING pour que
//  l'installateur puisse partir de la base et juste modifier
//  les groupes qui l'intéressent :
//
//    import { Kalendar, DEFAULT_COLOR_MAPPING } from "@najororabiaza/kalendar";
//
//    <Kalendar
//      colorMapping={{
//        ...DEFAULT_COLOR_MAPPING,
//        "1": { label: "Licence 1", hex: "#b30000" },
//      }}
//    />
// ============================================================

export { Kalendar, DEFAULT_COLOR_MAPPING } from "./Kalendar.jsx";
export { default } from "./Kalendar.jsx";
