// ============================================================
//  lib/index.js — Point d'entrée du package npm
//
//  Quand un installateur fait :
//    import { Kalendar } from "@najororabiaza/kalendar";
//  C'est cet export qu'il récupère.
//
//  L'import du CSS est automatique : l'installateur n'a pas
//  besoin d'importer kalendar.css manuellement.
//  Vite et webpack détectent cet import et incluent le CSS
//  dans le bundle final de l'installateur automatiquement.
//
//  EXPORTS DISPONIBLES :
//
//  Kalendar — le composant principal
//    import { Kalendar } from "@najororabiaza/kalendar";
//    import Kalendar from "@najororabiaza/kalendar";  // aussi valide
//
//  DEFAULT_COLOR_MAPPING — la correspondance colorId → groupe par défaut
//  Utile pour partir de la base et juste modifier quelques groupes :
//    import { Kalendar, DEFAULT_COLOR_MAPPING } from "@najororabiaza/kalendar";
//    <Kalendar
//      colorMapping={{
//        ...DEFAULT_COLOR_MAPPING,
//        "1": { label: "Licence 1", hex: "#b30000" },
//      }}
//    />
// ============================================================

// Import automatique du CSS — l'installateur n'a rien à faire
import "./Kalendar.css";

export { Kalendar, DEFAULT_COLOR_MAPPING } from "./Kalendar.jsx";
export { default } from "./Kalendar.jsx";
