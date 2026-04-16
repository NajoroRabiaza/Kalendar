import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import enLocale from "@fullcalendar/core/locales/en-gb";
import "./App.css";

import { calendarConfig } from "./calendarConfig";
import WidgetBuilder from "./WidgetBuilder";
import getUrlParams from "./getUrlParams"; // ← notre nouveau module

export default function App() {
  const [showBuilder, setShowBuilder] = useState(false);

  //  On lit UNE SEULE FOIS tous les paramètres URL ici.
  //  Tout le reste de l'app utilise cet objet.
  const urlParams = getUrlParams();

  //  MAPPING DES COULEURS
  //  On part de la config de base, puis on applique les
  //  éventuelles surcharges venues de l'URL (?color1=...).
  const activeMapping = { ...calendarConfig.colorMapping };
  for (const [colorId, newLabel] of Object.entries(urlParams.colorOverrides)) {
    if (activeMapping[colorId]) {
      activeMapping[colorId] = { ...activeMapping[colorId], label: newLabel };
    } else {
      // Couleur inconnue dans la config → on la crée avec une couleur grise
      activeMapping[colorId] = { label: newLabel, hex: "#888888" };
    }
  }

  //  TITRE DE L'EN-TÊTE
  //  Si ?title= est fourni dans l'URL, il prend le dessus
  //  sur calendarConfig.header.title
  const headerTitle = urlParams.title || calendarConfig.header.title;

  //  TRANSFORMATION DES ÉVÉNEMENTS GOOGLE CALENDAR
  //  Attribue couleur et groupe à chaque événement.
  //  Retourner `false` = l'événement est masqué.
  const handleEventDataTransform = (eventData) => {
    const rawColorId = eventData.colorId || "default";
    const groupInfo = activeMapping[rawColorId] || activeMapping["default"];

    // Filtre par groupe si ?show=NomDuGroupe est dans l'URL
    if (urlParams.show && groupInfo.label !== urlParams.show) {
      return false;
    }

    eventData.backgroundColor = groupInfo.hex;
    eventData.borderColor      = "white";
    eventData.textColor        = "white";
    eventData.groupLabel       = groupInfo.label;

    return eventData;
  };

  //  RENDU PERSONNALISÉ D'UN ÉVÉNEMENT (contenu du bloc)
  const renderEventContent = (eventInfo) => {
    const start      = eventInfo.event.start;
    const end        = eventInfo.event.end;
    const groupLabel = eventInfo.event.extendedProps?.groupLabel || "G";

    const formatTime = (date) => {
      if (!date) return "";
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <div className="custom-event">
        <div className="custom-event-title">
          [{groupLabel}] {eventInfo.event.title}
        </div>
        <div className="custom-event-time">
          {formatTime(start)} - {formatTime(end)}
        </div>
      </div>
    );
  };

  //  RENDU DE L'EN-TÊTE DES JOURS (format "lun. 3/6")
  const renderDayHeader = (args) => {
    const jours = {
      fr: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
      en: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
      mg: ["Alah.", "Alats.", "Tal.", "Alar.", "Alak.", "Zom.", "Sab."],
    };
    const lang  = urlParams.lang;
    const noms  = jours[lang] || jours["fr"];
    const nomJour   = noms[args.date.getDay()];
    const numJour   = args.date.getDate();
    const mois      = args.date.getMonth() + 1;
    return `${nomJour} ${numJour}/${mois}`;
  };

  //  CHOIX DES LOCALES FullCalendar
  //  "mg" n'existe pas dans FullCalendar → on utilise "fr"
  const fcLocales = [frLocale, enLocale];
  const fcLocale  = urlParams.fcLocale; // "fr" ou "en"

  //  RENDU PRINCIPAL
  //  On applique data-theme sur le conteneur principal.
  //  Le CSS utilise [data-theme="dark"] pour le thème sombre.
  return (
    <div className="app-container" data-theme={urlParams.theme}>

      {/* Modale du Widget Builder (cachée si ?hideBuilder=true) */}
      {showBuilder && (
        <WidgetBuilder onClose={() => setShowBuilder(false)} />
      )}

      {/* En-tête */}
      <div className="custom-calendar-header">
        <div className="header-left">
          <span className="header-prefix">{calendarConfig.header.prefix}</span>,{" "}
          <span className="header-title">{headerTitle}</span>
        </div>
        <div className="header-right">
          {calendarConfig.header.dateText}
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin]}
          initialView="timeGridWeek"
          googleCalendarApiKey={calendarConfig.apiKey}
          events={{ googleCalendarId: urlParams.calId || calendarConfig.masterCalendarId }}
          eventDataTransform={handleEventDataTransform}
          locales={fcLocales}
          locale={fcLocale}
          headerToolbar={false}
          firstDay={1}
          slotMinTime={urlParams.from}
          slotMaxTime={urlParams.to}
          hiddenDays={urlParams.hiddenDays}
          allDaySlot={false}
          slotDuration="00:15:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
          height="auto"
          expandRows={false}
          dayHeaderContent={renderDayHeader}
          eventContent={renderEventContent}
        />
      </div>

      {/* Bouton flottant — caché si ?hideBuilder=true */}
      {!urlParams.hideBuilder && (
        <button
          onClick={() => setShowBuilder(true)}
          className="builder-fab-button"
        >
          ⚙️ Créer mon Widget
        </button>
      )}
    </div>
  );
}