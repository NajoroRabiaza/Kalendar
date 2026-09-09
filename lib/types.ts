//  lib/types.ts
//  Types partages entre Kalendar.tsx et utils.ts.
//  Ce fichier est la source de verite unique pour tous les
//  types publics du package npm.

/**
 * Correspondance entre un colorId Google Calendar
 * et les informations d'affichage du groupe.
 */
export interface ColorMapping {
  label: string;
  hex:   string;
}

/**
 * Langues supportees par le composant Kalendar.
 */
export type Lang = "fr" | "en" | "mg";

/**
 * Objet transmis au callback onEventClick
 * quand l'utilisateur clique sur un evenement du calendrier.
 */
export interface KalendarEventClickPayload {
  title:   string;
  start:   Date;
  end:     Date;
  group:   string | null;
  colorId: string | null;
}

/**
 * Props du composant Kalendar.
 */
export interface KalendarProps {
  apiKey:        string;
  calendarId:    string;
  theme?:        "light" | "dark";
  lang?:         Lang;
  from?:         string;
  to?:           string;
  hiddenDays?:   number[];
  firstDay?:     number;
  colorMapping?: Record<string, ColorMapping>;
  group?:        string | null;
  headerPrefix?: string;
  headerTitle?:  string;
  headerRight?:  string;
  showHeader?:   boolean;
  style?:        React.CSSProperties & Record<string, string>;
  className?:    string;
  onEventClick?: (event: KalendarEventClickPayload) => void;
}