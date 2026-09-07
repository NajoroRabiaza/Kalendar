//  lib/utils.ts
//  Fonctions pures extraites de Kalendar.tsx.
//  Exportees separement pour etre testables en isolation.

import type { ColorMapping } from "./Kalendar.js";
import type { EventInput } from "@fullcalendar/core";

export type Lang = "fr" | "en" | "mg";

export const JOURS: Record<Lang, string[]> = {
  fr: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
  en: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
  mg: ["Alah.", "Alats.", "Tal.", "Alar.", "Alak.", "Zom.", "Sab."],
};

/**
 * Transforme un evenement brut FullCalendar en appliquant
 * la couleur du groupe et le filtrage par groupe.
 *
 * Retourne l'evenement avec display: "none" si le groupe
 * ne correspond pas au filtre demande.
 */
export function transformEventData(
  eventData:    EventInput,
  colorMapping: Record<string, ColorMapping>,
  group:        string | null
): EventInput {
  const rawColorId = (eventData.colorId as string) || "default";
  const groupInfo  = colorMapping[rawColorId] ?? colorMapping["default"] ?? { label: "?", hex: "#999" };

  if (group && groupInfo.label !== group) {
    return { ...eventData, display: "none" };
  }

  return {
    ...eventData,
    backgroundColor: groupInfo.hex,
    borderColor:     "white",
    textColor:       "white",
    groupLabel:      groupInfo.label,
  };
}

/**
 * Formate l'entete d'une colonne jour selon la langue.
 * Retourne ex: "lun. 7/9" en francais.
 */
export function formatDayHeader(date: Date, lang: Lang): string {
  const noms = JOURS[lang] ?? JOURS["fr"];
  return `${noms[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
}