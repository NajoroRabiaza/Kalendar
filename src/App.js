import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import "./App.css";

const API_KEY = "AIzaSyCHFTEMzBJXWu5cOz4ADvSq8HhW4-cIz84";

const SOURCES = [
  { id: "groupeA", title: "H1", calendarId: "5a7d67665a2a4f9947883ae151366043ac09e229a04a0381e0b6e2476d1f64d2@group.calendar.google.com", color: "#0099ff" },
  { id: "groupeB", title: "H4", calendarId: "923dd993f1ce96964d16621b06a46ef229bc747cc1f58a4302cfb8531629f855@group.calendar.google.com", color: "#ff6600" },
  { id: "groupeC", title: "G3", calendarId: "b52757b92f0708d42f6642f0bc602fb5fcdb38e29bbdd4e1bee34368cc153795@group.calendar.google.com", color: "#666666" },
];

const CLASS_COLOR_MAP = SOURCES.reduce((acc, s) => {
  acc[s.id] = s.color;
  return acc;
}, {});

export default function App() {
  const [visible, setVisible] = useState(() => {
    const initial = {};
    SOURCES.forEach(s => (initial[s.id] = true));
    return initial;
  });

  const eventSources = SOURCES.map(s => ({
    googleCalendarId: s.calendarId,
    className: s.id,
    color: s.color,
  })).filter((_, i) => visible[SOURCES[i].id]);

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
          <span style={{ color: '#ffcc00' }}>THE</span>, <span style={{ color: '#28a745' }}>Holidays in Madagascar</span>
        </div>
        <div className="header-right">
          dim. 21 mai - sam. 27 mai 2023 (Heure normale d'Afrique de l'Est)
        </div>
      </div>

      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin]}
          initialView="timeGridWeek"
          googleCalendarApiKey={API_KEY}
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