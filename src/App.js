import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import "./App.css";

import { calendarConfig } from "./calendarConfig";

export default function App() {
  
  // 1. LECTURE DES PARAMÈTRES D'URL (Pour l'approche "Zéro Déploiement")
  const queryParams = new URLSearchParams(window.location.search);
  
  // On peut surcharger le calendrier entier via l'URL (?calId=xxx)
  const calendarId = queryParams.get("calId") || calendarConfig.masterCalendarId;
  
  // On récupère le filtre (quel groupe afficher ?) via l'URL (?show=H1)
  const targetGroup = queryParams.get("show"); 

  // 2. CONSTRUCTION DE LA MATRICE ACTIVE
  // On fusionne la config de base avec les potentielles modifications de l'URL
  const activeMapping = { ...calendarConfig.colorMapping };
  for (let i = 1; i <= 11; i++) {
    const urlColorLabel = queryParams.get(`color${i}`); // Ex: ?color1=NouveauGroupe
    if (urlColorLabel) {
      if (activeMapping[i]) {
        activeMapping[i].label = urlColorLabel;
      } else {
        activeMapping[i] = { label: urlColorLabel, hex: "#000000" };
      }
    }
  }

  // 3. LE MOTEUR DE FILTRAGE ET DE TRANSFORMATION
  // Cette fonction intercepte les données brutes de Google AVANT de les afficher
  const handleEventDataTransform = (eventData) => {
    // Récupération de l'ID de la couleur Google (ou "default" si non définie)
    const rawColorId = eventData.colorId || "default";
    const groupInfo = activeMapping[rawColorId] || activeMapping["default"];

    // FILTRAGE : Si l'URL demande un groupe précis et que ça ne correspond pas, on annule l'affichage
    if (targetGroup && groupInfo.label !== targetGroup) {
      return false; // L'événement est ignoré par FullCalendar
    }

    // TRANSFORMATION : On applique les bonnes couleurs et on injecte le nom du groupe
    eventData.backgroundColor = groupInfo.hex;
    eventData.borderColor = "white";
    eventData.textColor = "white";
    // FullCalendar va automatiquement placer cette variable inconnue dans "extendedProps"
    eventData.groupLabel = groupInfo.label; 

    return eventData;
  };

  // 4. PERSONNALISATION DE L'AFFICHAGE (HTML de chaque bloc)
  const renderEventContent = (eventInfo) => {
    const start = eventInfo.event.start;
    const end = eventInfo.event.end;
    
    // On récupère le label qu'on a injecté dans handleEventDataTransform
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
          
          // SOURCE UNIQUE : On écoute uniquement le calendrier maître
          events={{
            googleCalendarId: calendarId
          }}
          
          // Fonction magique qui filtre et colore à la volée
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
    </div>
  );
}