// ============================================================
//  lib/index.js — Point d'entrée du package npm
//
//  ORDRE DES IMPORTS CSS :
//  1. CSS de base FullCalendar v6 (@fullcalendar/common)
//  2. Notre CSS personnalisé (surcharge ce qui précède)
//
//  Dans FullCalendar v6, tout le CSS de base est regroupé
//  dans @fullcalendar/common/main.css. Il n'y a plus de
//  fichiers séparés par plugin comme en v5.
// ============================================================

// CSS de base FullCalendar v6 — structure, layout, positionnement
import "@fullcalendar/common/main.css";

// Notre CSS — surcharge avec le système de CSS Variables --kal-*
import "./Kalendar.css";

export { Kalendar, DEFAULT_COLOR_MAPPING } from "./Kalendar.jsx";
export { default } from "./Kalendar.jsx";
