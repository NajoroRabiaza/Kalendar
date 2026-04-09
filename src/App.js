import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import "./App.css";

// 1. On importe le fichier de configuration qu'on vient de créer !
import { calendarConfig } from "./calendarConfig";

// 2. On génère dynamiquement la carte des couleurs à partir de la config
const CLASS_COLOR_MAP = calendarConfig.groups.reduce((acc, g) => {
  acc[g.id] = g.color;
  return acc;
}, {});

export default function App() {
  const [visible, setVisible] = useState(() => {
    const initial = {};
    
    // 1. On va chercher ce qui est écrit dans l'URL (ex: ?group=groupeA)
    const queryParams = new URLSearchParams(window.location.search);
    
    // 2. On extrait spécifiquement la valeur associée à "group"
    const targetGroup = queryParams.get("group"); // targetGroup vaudra "groupeA", "groupeB", ou sera null

    // 3. On boucle sur tous les groupes de notre fichier de configuration
    calendarConfig.groups.forEach(g => {
      if (targetGroup) {
        // SCÉNARIO A : L'URL contient un groupe spécifique.
        // Si l'ID du groupe actuel correspond à celui de l'URL, on met 'true' (visible), sinon 'false' (caché).
        initial[g.id] = (g.id === targetGroup);
      } else {
        // SCÉNARIO B : L'URL est "normale" (http://localhost:3000/).
        // On affiche tout par défaut.
        initial[g.id] = true;
      }
    });
    
    return initial;
  });

  const eventSources = calendarConfig.groups.map(g => ({
    googleCalendarId: g.calendarId,
    className: g.id,
    color: g.color,
  })).filter((_, i) => visible[calendarConfig.groups[i].id]);


  const handleEventDidMount = (info) => {
    try {
      const computedBg = window.getComputedStyle(info.el).backgroundColor;
      const defaultBlueRgb = "rgb(66, 133, 244)";
      if (!computedBg || computedBg === "transparent" || computedBg === "rgba(0, 0, 0, 0)" || computedBg === defaultBlueRgb) {
        for (const cls of Object.keys(CLASS_COLOR_MAP)) {
          if (info.el.classList.contains(cls)) {
            info.el.style.backgroundColor = CLASS_COLOR_MAP[cls];
            info.el.style.borderColor = "white";
            break;
          }
        }
      }
    } catch (e) {}
  };

  const renderEventContent = (eventInfo) => {
    const start = eventInfo.event.start;
    const end = eventInfo.event.end;
    const formatTime = (date) => {
      if (!date) return "";
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ':');
    };

    return (
      <div className="custom-event">
        <div className="custom-event-title">
          [{eventInfo.event.source?.internalEventSource?.className[0] || "G"}] {eventInfo.event.title}
        </div>
        <div className="custom-event-time">
          {formatTime(start)} - {formatTime(end)}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="custom-calendar-header">
        <div className="header-left">
          {/* On utilise les textes de la config */}
          <span style={{ color: '#ffcc00' }}>{calendarConfig.header.prefix}</span>, 
          <span style={{ color: '#28a745' }}> {calendarConfig.header.title}</span>
        </div>
        <div className="header-right">
          {calendarConfig.header.dateText}
        </div>
      </div>

      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin]}
          initialView="timeGridWeek"
          // On utilise la clé API de la config
          googleCalendarApiKey={calendarConfig.apiKey} 
          eventSources={eventSources}
          locales={[frLocale]}
          locale="fr"
          headerToolbar={false}
          firstDay={0}
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          allDaySlot={false}
          slotDuration="00:15:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          height="auto"
          expandRows={false}
          dayHeaderContent={(args) => {
            const jours = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
            const nomJour = jours[args.date.getDay()];
            const numeroJour = args.date.getDate();
            const mois = args.date.getMonth() + 1;
            return `${nomJour} ${numeroJour}/${mois}`;
          }}
          eventDidMount={handleEventDidMount}
          eventContent={renderEventContent}
        />
      </div>
    </div>
  );
}