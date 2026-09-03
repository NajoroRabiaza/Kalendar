import * as React from "react";

//  Types publics exportes par @najororabiaza/kalendar

/**
 * Correspondance entre un colorId Google Calendar
 * et les informations d'affichage du groupe.
 */
export interface ColorMapping {
  /** Nom du groupe affiche dans les blocs evenements */
  label: string;
  /** Couleur hexadecimale du groupe ex: "#0099ff" */
  hex: string;
}

/**
 * Objet transmis au callback onEventClick
 * quand l'utilisateur clique sur un evenement du calendrier.
 */
export interface KalendarEventClickPayload {
  /** Titre de l'evenement Google Calendar */
  title: string;
  /** Date et heure de debut de l'evenement */
  start: Date;
  /** Date et heure de fin de l'evenement */
  end: Date;
  /** Label du groupe auquel appartient l'evenement, ou null */
  group: string | null;
  /** colorId brut de l'evenement Google Calendar, ou null */
  colorId: string | null;
}

/**
 * Props du composant Kalendar.
 *
 * Props obligatoires : apiKey, calendarId.
 * Toutes les autres props ont des valeurs par defaut.
 */
export interface KalendarProps {
  //  Props obligatoires

  /** Cle API Google Calendar activee dans Google Cloud Console */
  apiKey: string;

  /** ID du calendrier Google a afficher */
  calendarId: string;

  //  Props d'affichage

  /** Theme visuel du composant. Defaut : "light" */
  theme?: "light" | "dark";

  /** Langue d'affichage des entetes de jours. Defaut : "fr" */
  lang?: "fr" | "en" | "mg";

  /** Heure de debut de la grille horaire. Defaut : "07:00:00" */
  from?: string;

  /** Heure de fin de la grille horaire. Defaut : "18:00:00" */
  to?: string;

  /**
   * Jours de la semaine a masquer.
   * 0 = dimanche, 1 = lundi, ..., 6 = samedi.
   * Defaut : []
   */
  hiddenDays?: number[];

  /** Premier jour de la semaine. 1 = lundi. Defaut : 1 */
  firstDay?: number;

  //  Props de donnees

  /**
   * Correspondance colorId Google Calendar vers groupe.
   * Defaut : DEFAULT_COLOR_MAPPING
   */
  colorMapping?: Record<string, ColorMapping>;

  /**
   * Filtre d'affichage par groupe.
   * Si fourni, seuls les evenements de ce groupe sont affiches.
   * Defaut : null
   */
  group?: string | null;

  //  Props d'en-tete

  /** Texte du prefixe colore dans l'en-tete. Defaut : "" */
  headerPrefix?: string;

  /** Titre principal dans l'en-tete. Defaut : "Emploi du Temps" */
  headerTitle?: string;

  /** Texte affiche a droite de l'en-tete. Defaut : "" */
  headerRight?: string;

  /** Affiche ou masque l'en-tete. Defaut : true */
  showHeader?: boolean;

  //  Props de style

  /**
   * Objet de style inline permettant de surcharger les CSS Variables.
   * ex: { "--kal-bg": "#1a1a2e", "--kal-primary": "#0f3460" }
   * Defaut : {}
   */
  style?: React.CSSProperties & Record<string, string>;

  /** Classe CSS supplementaire sur le conteneur racine. Defaut : "" */
  className?: string;

  //  Callbacks

  /**
   * Callback appele quand l'utilisateur clique sur un evenement.
   * Recoit un objet KalendarEventClickPayload.
   * Defaut : null
   */
  onEventClick?: (event: KalendarEventClickPayload) => void;
}

//  Exports du package

/**
 * Mapping de couleurs par defaut.
 * Couvre les colorIds Google Calendar de "1" a "11" plus "default".
 * Peut etre etendu via la prop colorMapping du composant.
 */
export declare const DEFAULT_COLOR_MAPPING: Record<string, ColorMapping>;

/**
 * Composant principal Kalendar.
 * Export nomme — usage recommande :
 *   import { Kalendar } from "@najororabiaza/kalendar";
 */
export declare function Kalendar(props: KalendarProps): React.ReactElement;

/**
 * Export par defaut du composant Kalendar.
 * Usage alternatif :
 *   import Kalendar from "@najororabiaza/kalendar";
 */
export default Kalendar;