// Avec jsxRuntime: "automatic" dans Vite, React n'a plus besoin
// d'être importé pour le JSX. On importe uniquement les hooks utilisés.
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import enLocale from "@fullcalendar/core/locales/en-gb";
import "./Kalendar.css";

// ============================================================
//  Kalendar.jsx — Composant React publiable sur npm
//
//  Ce composant est une version "pure" du calendrier :
//  - Pas de lecture d'URL (pas de getUrlParams)
//  - Pas de WidgetBuilder
//  - Pas de DocsPage
//  - Pas de Service Worker
//  - Pas de postMessage (l'intégrateur gère ça lui-même)
//  - Toutes les valeurs viennent des PROPS
//
//  PROPS DISPONIBLES :
//
//  Obligatoires
//  apiKey         string  Clé API Google Calendar
//  calendarId     string  ID du calendrier Google à afficher
//
//  Affichage
//  theme          string  "light" (défaut) ou "dark"
//  lang           string  "fr" (défaut), "en", "mg"
//  from           string  Heure de début ex: "07:00" (défaut)
//  to             string  Heure de fin   ex: "18:00" (défaut)
//  hiddenDays     array   Jours à masquer ex: [0, 6] (défaut: [])
//  firstDay       number  Premier jour de la semaine (défaut: 1 = lundi)
//
//  Données
//  colorMapping   object  Correspondance colorId → { label, hex }
//  group          string  Filtre pour n'afficher qu'un groupe
//
//  En-tête
//  headerPrefix   string  Texte du préfixe (ex: "THE")
//  headerTitle    string  Titre principal (ex: "Emploi du Temps")
//  headerRight    string  Texte à droite (ex: "Semaine en cours")
//  showHeader     bool    Affiche l'en-tête (défaut: true)
//
//  Style
//  style          object  CSS Variables inline ex: {"--kal-bg": "#1a1a2e"}
//  className      string  Classe CSS supplémentaire sur le conteneur
//
//  Callbacks
//  onEventClick   func    Appelé quand l'utilisateur clique sur un événement
//                         Reçoit { title, start, end, group, colorId }
// ============================================================

// Valeurs par défaut du colorMapping si l'intégrateur n'en fournit pas
export const DEFAULT_COLOR_MAPPING = {
  "1":       { label: "Groupe 1", hex: "#0099ff" },
  "2":       { label: "Groupe 2", hex: "#ff6600" },
  "3":       { label: "Groupe 3", hex: "#666666" },
  "4":       { label: "Groupe 4", hex: "#9900cc" },
  "5":       { label: "Groupe 5", hex: "#cc0000" },
  "6":       { label: "Groupe 6", hex: "#cc6600" },
  "7":       { label: "Groupe 7", hex: "#006666" },
  "8":       { label: "Groupe 8", hex: "#333399" },
  "9":       { label: "Groupe 9", hex: "#660033" },
  "10":      { label: "Groupe 10", hex: "#336600" },
  "11":      { label: "Groupe 11", hex: "#663300" },
  "default": { label: "Général",  hex: "#333333" },
};

// Noms des jours dans les trois langues supportées
const JOURS = {
  fr: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
  en: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
  mg: ["Alah.", "Alats.", "Tal.", "Alar.", "Alak.", "Zom.", "Sab."],
};


export function Kalendar({
  // Props obligatoires
  apiKey,
  calendarId,

  // Props d'affichage (avec valeurs par défaut)
  theme       = "light",
  lang        = "fr",
  from        = "07:00:00",
  to          = "18:00:00",
  hiddenDays  = [],
  firstDay    = 1,

  // Props de données
  colorMapping = DEFAULT_COLOR_MAPPING,
  group        = null,

  // Props d'en-tête
  headerPrefix = "",
  headerTitle  = "Emploi du Temps",
  headerRight  = "",
  showHeader   = true,

  // Props de style
  style     = {},
  className = "",

  // Callbacks
  onEventClick = null,
}) {

  // ----------------------------------------------------------
  //  RÈGLE HOOKS : useState et useEffect AVANT tout return.
  //  On déplace les hooks ici, avant la validation des props.
  //  La validation avec return vient APRÈS.
  // ----------------------------------------------------------
  const [currentLang, setCurrentLang] = useState(lang);
  useEffect(() => { setCurrentLang(lang); }, [lang]);

  // ----------------------------------------------------------
  //  Validation des props obligatoires — APRÈS les hooks
  //  Si apiKey ou calendarId manquent, on affiche un message
  //  d'erreur clair plutôt que de planter silencieusement.
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  //  TRANSFORMATION DES ÉVÉNEMENTS
  //
  //  FullCalendar appelle cette fonction pour chaque événement
  //  avant de l'afficher. On attribue la couleur et le label
  //  du groupe basé sur le colorId de l'événement Google.
  //
  //  Retourner false = l'événement est masqué (filtrage groupe).
  // ----------------------------------------------------------
  const handleEventDataTransform = (eventData) => {
    const rawColorId = eventData.colorId || "default";
    const groupInfo  = colorMapping[rawColorId] || colorMapping["default"] || { label: "?", hex: "#999" };

    // Filtrage par groupe : si la prop group est fournie,
    // on n'affiche que les événements de ce groupe
    if (group && groupInfo.label !== group) return false;

    eventData.backgroundColor = groupInfo.hex;
    eventData.borderColor     = "white";
    eventData.textColor       = "white";
    eventData.groupLabel      = groupInfo.label;
    return eventData;
  };

  // ----------------------------------------------------------
  //  RENDU D'UN BLOC ÉVÉNEMENT
  // ----------------------------------------------------------
  const renderEventContent = (eventInfo) => {
    const { start, end } = eventInfo.event;
    const groupLabel = eventInfo.event.extendedProps?.groupLabel || "";
    const fmt = (d) =>
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

  // ----------------------------------------------------------
  //  CLIC SUR UN ÉVÉNEMENT
  //  Si l'intégrateur a fourni un callback onEventClick,
  //  on lui transmet un objet propre plutôt que l'objet
  //  FullCalendar brut (qui est complexe et interne).
  // ----------------------------------------------------------
  const handleEventClick = (clickInfo) => {
    // On utilise un if explicite plutôt que && court-circuit.
    // Rollup transforme "u && expr" en une expression que ESLint
    // signale comme "no-unused-expression". Un if {} évite ça.
    if (onEventClick) {
      clickInfo.jsEvent.preventDefault();
      onEventClick({
        title:   clickInfo.event.title,
        start:   clickInfo.event.start,
        end:     clickInfo.event.end,
        group:   clickInfo.event.extendedProps?.groupLabel || null,
        colorId: clickInfo.event.extendedProps?.colorId    || null,
      });
    }
  };

  // ----------------------------------------------------------
  //  EN-TÊTE DES COLONNES JOURS
  // ----------------------------------------------------------
  const renderDayHeader = (args) => {
    const noms = JOURS[currentLang] || JOURS["fr"];
    return `${noms[args.date.getDay()]} ${args.date.getDate()}/${args.date.getMonth() + 1}`;
  };

  // ----------------------------------------------------------
  //  LOCALE FULLCALENDAR
  //  FullCalendar ne supporte pas "mg" (malagasy), on utilise
  //  "fr" comme fallback.
  // ----------------------------------------------------------
  const fcLocale = currentLang === "mg" ? "fr" : currentLang;

  // ----------------------------------------------------------
  //  RENDU
  //
  //  On préfixe toutes les classes par "kal-" pour éviter
  //  les conflits avec les classes CSS du site de l'intégrateur.
  //
  //  L'objet style reçu en prop peut contenir des CSS Variables
  //  pour surcharger le thème : style={{ "--kal-bg": "#1a1a2e" }}
  // ----------------------------------------------------------
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

// Export par défaut également pour la commodité
export default Kalendar;