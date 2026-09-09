import { useState, useEffect } from "react";
import { injectKalendarStyles } from "./injectStyles.js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import enLocale from "@fullcalendar/core/locales/en-gb";
import type { EventInput, EventContentArg, EventClickArg } from "@fullcalendar/core";
import { transformEventData, formatDayHeader } from "./utils.js";
import type {
  ColorMapping,
  Lang,
  KalendarProps,
  KalendarEventClickPayload,
} from "./types.js";
import "./Kalendar.css";

//  Re-exports publics
export type { ColorMapping, Lang, KalendarProps, KalendarEventClickPayload };

//  Constantes
export const DEFAULT_COLOR_MAPPING: Record<string, ColorMapping> = {
  "1":       { label: "Groupe 1",  hex: "#0099ff" },
  "2":       { label: "Groupe 2",  hex: "#ff6600" },
  "3":       { label: "Groupe 3",  hex: "#666666" },
  "4":       { label: "Groupe 4",  hex: "#9900cc" },
  "5":       { label: "Groupe 5",  hex: "#cc0000" },
  "6":       { label: "Groupe 6",  hex: "#cc6600" },
  "7":       { label: "Groupe 7",  hex: "#006666" },
  "8":       { label: "Groupe 8",  hex: "#333399" },
  "9":       { label: "Groupe 9",  hex: "#660033" },
  "10":      { label: "Groupe 10", hex: "#336600" },
  "11":      { label: "Groupe 11", hex: "#663300" },
  "default": { label: "General",   hex: "#333333" },
};

//  Composant
export function Kalendar({
  apiKey,
  calendarId,
  theme        = "light",
  lang         = "fr",
  from         = "07:00:00",
  to           = "18:00:00",
  hiddenDays   = [],
  firstDay     = 1,
  colorMapping = DEFAULT_COLOR_MAPPING,
  group        = null,
  headerPrefix = "",
  headerTitle  = "Emploi du Temps",
  headerRight  = "",
  showHeader   = true,
  style        = {},
  className    = "",
  onEventClick = undefined,
}: KalendarProps): React.ReactElement {

  const [currentLang, setCurrentLang] = useState<Lang>(lang);

  useEffect(() => { setCurrentLang(lang); }, [lang]);
  useEffect(() => { injectKalendarStyles(); }, []);

  if (!apiKey || !calendarId) {
    return (
      <div style={{ padding: "20px", color: "#cc0000", fontFamily: "Arial, sans-serif", fontSize: "14px" }}>
        <strong>Kalendar : props manquantes.</strong>
        <br />
        {!apiKey     && <span>La prop <code>apiKey</code> est requise. </span>}
        {!calendarId && <span>La prop <code>calendarId</code> est requise.</span>}
      </div>
    );
  }

  const handleEventDataTransform = (eventData: EventInput): EventInput => {
    return transformEventData(eventData, colorMapping, group);
  };

  //  On utilise EventContentArg, le type officiel FullCalendar
  //  pour le parametre de eventContent.
  const renderEventContent = (eventInfo: EventContentArg): React.ReactElement => {
    const { start, end } = eventInfo.event;
    const groupLabel = (eventInfo.event.extendedProps?.groupLabel as string) || "";
    const fmt = (d: Date | null): string =>
      d ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";

    return (
      <div className="kal-event">
        <div className="kal-event-title">
          {groupLabel ? `[${groupLabel}] ` : ""}{eventInfo.event.title}
        </div>
        <div className="kal-event-time">{fmt(start)} - {fmt(end)}</div>
      </div>
    );
  };

  //  On utilise EventClickArg, le type officiel FullCalendar
  //  pour le parametre de eventClick.
  const handleEventClick = (clickInfo: EventClickArg): void => {
    if (onEventClick) {
      clickInfo.jsEvent.preventDefault();
      onEventClick({
        title:   clickInfo.event.title,
        start:   clickInfo.event.start as Date,
        end:     clickInfo.event.end   as Date,
        group:   (clickInfo.event.extendedProps?.groupLabel as string) || null,
        colorId: (clickInfo.event.extendedProps?.colorId    as string) || null,
      });
    }
  };

  const renderDayHeader = (args: { date: Date }): string => {
    return formatDayHeader(args.date, currentLang);
  };

  const fcLocale = currentLang === "mg" ? "fr" : currentLang;

  return (
    <div
      className={`kal-container ${className}`.trim()}
      data-theme={theme}
      style={style}
    >
      {showHeader && (headerPrefix || headerTitle || headerRight) && (
        <div className="kal-header">
          <div className="kal-header-left">
            {headerPrefix && (
              <span className="kal-header-prefix">{headerPrefix}</span>
            )}
            {headerPrefix && headerTitle && <span>, </span>}
            {headerTitle && (
              <span className="kal-header-title">{headerTitle}</span>
            )}
          </div>
          <div className="kal-header-right">{headerRight}</div>
        </div>
      )}

      <div className="kal-calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin]}
          initialView="timeGridWeek"
          googleCalendarApiKey={apiKey}
          events={{ googleCalendarId: calendarId }}
          eventDataTransform={handleEventDataTransform}
          locales={[frLocale, enLocale]}
          locale={fcLocale}
          headerToolbar={false}
          firstDay={firstDay}
          slotMinTime={from}
          slotMaxTime={to}
          hiddenDays={hiddenDays}
          allDaySlot={false}
          slotDuration="00:15:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          height="auto"
          expandRows={false}
          dayHeaderContent={renderDayHeader}
          eventContent={renderEventContent}
          eventClick={onEventClick ? handleEventClick : undefined}
        />
      </div>
    </div>
  );
}

export default Kalendar;