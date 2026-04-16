import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import "./App.css";

import { calendarConfig } from "./calendarConfig";
import WidgetBuilder from "./WidgetBuilder"; // <-- On importe notre nouveau composant !

export default function App() {
  // État pour afficher/cacher le générateur de widget
  const [showBuilder, setShowBuilder] = useState(false);
  
  const queryParams = new URLSearchParams(window.location.search);
  const calendarId = queryParams.get("calId") || calendarConfig.masterCalendarId;
  const targetGroup = queryParams.get("show"); 

  const activeMapping = { ...calendarConfig.colorMapping };
  for (let i = 1; i <= 11; i++) {
    const urlColorLabel = queryParams.get(`color${i}`);
    if (urlColorLabel) {
      if (activeMapping[i]) {
        activeMapping[i].label = urlColorLabel;
      } else {
        activeMapping[i] = { label: urlColorLabel, hex: "#000000" };
      }
    }
  }

  const handleEventDataTransform = (eventData) => {
    const rawColorId = eventData.colorId || "default";
    const groupInfo = activeMapping[rawColorId] || activeMapping["default"];

    if (targetGroup && groupInfo.label !== targetGroup) {
      return false; 
    }

    eventData.backgroundColor = groupInfo.hex;
    eventData.borderColor = "white";
    eventData.textColor = "white";
    eventData.groupLabel = groupInfo.label; 

    return eventData;
  };

  const renderEventContent = (eventInfo) => {
    const start = eventInfo.event.start;
    const end = eventInfo.event.end;
    const groupLabel = eventInfo.event.extendedProps?.groupLabel || "G";
    
    const formatTime = (date) => {
      if (!date) return "";
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ':');
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

  return (
    <div className="app-container">
      {/* Si showBuilder est vrai, on affiche notre interface, sinon on la cache */}
      {showBuilder && <WidgetBuilder onClose={() => setShowBuilder(false)} />}

      <div className="custom-calendar-header">
        <div className="header-left">
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
          googleCalendarApiKey={calendarConfig.apiKey} 
          events={{ googleCalendarId: calendarId }}
          eventDataTransform={handleEventDataTransform}
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
          eventContent={renderEventContent}
        />
      </div>

      {/* Bouton flottant pour ouvrir le générateur */}
      <button 
        onClick={() => setShowBuilder(true)}
        style={{
          position: "fixed", bottom: "20px", right: "20px", padding: "15px 25px",
          backgroundColor: "#000", color: "white", border: "none", borderRadius: "50px",
          fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}
      >
        ⚙️ Créer mon Widget
      </button>
    </div>
  );
}