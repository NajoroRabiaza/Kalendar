import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import enLocale from "@fullcalendar/core/locales/en-gb";
import "./App.css";

import { calendarConfig } from "./calendarConfig";
import WidgetBuilder from "./WidgetBuilder";
import getUrlParams from "./getUrlParams";
import DocsPage from "./DocsPage";

// Import depuis lib/ pour garantir un comportement identique
// entre l'application de demo et le package npm publie.
import { transformEventData, JOURS } from "../lib/utils";

export default function App() {
  const [showBuilder, setShowBuilder] = useState(false);

  const urlParams = getUrlParams();

  const [dynamicShow,  setDynamicShow]  = useState(urlParams.show);
  const [dynamicTheme, setDynamicTheme] = useState(urlParams.theme);
  const [dynamicLang,  setDynamicLang]  = useState(urlParams.lang);

  const isDocsPage = new URLSearchParams(window.location.search).get("docs") === "1";

  const [externalConfig, setExternalConfig] = useState(null);
  const [configLoading,  setConfigLoading]  = useState(!!urlParams.configUrl);
  const [configError,    setConfigError]    = useState(null);

  useEffect(() => {
    if (!urlParams.cssUrl) return;

    const existingLink = document.getElementById("cal-external-css");
    if (existingLink) return;

    const link = document.createElement("link");
    link.id   = "cal-external-css";
    link.rel  = "stylesheet";
    link.type = "text/css";
    link.href = urlParams.cssUrl;
    document.head.appendChild(link);

    return () => {
      const l = document.getElementById("cal-external-css");
      if (l) l.remove();
    };
  }, [urlParams.cssUrl]);

  useEffect(() => {
    if (!urlParams.configUrl) return;

    setConfigLoading(true);
    setConfigError(null);

    fetch(urlParams.configUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur HTTP " + response.status);
        }
        return response.json();
      })
      .then((json) => {
        if (typeof json !== "object" || json === null) {
          throw new Error("Le fichier JSON est invalide.");
        }
        setExternalConfig(json);
        setConfigLoading(false);
      })
      .catch((err) => {
        setConfigError(err.message || "Erreur inconnue");
        setConfigLoading(false);
      });
  }, [urlParams.configUrl]);

  useEffect(() => {
    const THEMES_VALIDES  = ["light", "dark"];
    const LANGUES_VALIDES = ["fr", "en", "mg"];

    const handleMessage = (event) => {
      if (!event.data || event.data.type !== "KALENDAR_CMD") return;

      const { action, value } = event.data;
      let applied    = false;
      let finalValue = value;

      if (action === "SET_GROUP") {
        const groupe = typeof value === "string" ? value.trim().slice(0, 30) : "";
        setDynamicShow(groupe || null);
        finalValue = groupe || null;
        applied = true;
      } else if (action === "SET_THEME") {
        if (THEMES_VALIDES.includes(value)) {
          setDynamicTheme(value);
          applied = true;
        }
      } else if (action === "SET_LANG") {
        if (LANGUES_VALIDES.includes(value)) {
          setDynamicLang(value);
          applied = true;
        }
      }

      window.parent.postMessage(
        applied
          ? { type: "KALENDAR_ACK", action, value: finalValue, ok: true }
          : { type: "KALENDAR_ACK", action, value, ok: false, reason: "Action ou valeur invalide" },
        "*"
      );
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (isDocsPage) return <DocsPage />;

  if (configLoading) {
    return (
      <div style={stylesChargement.container}>
        <p style={stylesChargement.texte}>Chargement de la configuration...</p>
        <p style={stylesChargement.url}>{urlParams.configUrl}</p>
      </div>
    );
  }

  if (configError) {
    return (
      <div style={stylesChargement.container}>
        <p style={stylesChargement.erreurTitre}>Impossible de charger la configuration externe.</p>
        <p style={stylesChargement.erreurDetail}>{configError}</p>
        <p style={stylesChargement.erreurConseil}>
          Verifiez que le fichier est accessible en https:// et que le serveur envoie
          l'en-tete <code>Access-Control-Allow-Origin: *</code>.
        </p>
      </div>
    );
  }

  const config = {
    apiKey:           externalConfig?.apiKey           ?? calendarConfig.apiKey,
    masterCalendarId: externalConfig?.masterCalendarId ?? calendarConfig.masterCalendarId,
    header: {
      prefix:   externalConfig?.header?.prefix   ?? calendarConfig.header.prefix,
      title:    externalConfig?.header?.title     ?? calendarConfig.header.title,
      dateText: externalConfig?.header?.dateText  ?? calendarConfig.header.dateText,
    },
    colorMapping: externalConfig?.colorMapping ?? calendarConfig.colorMapping,
  };

  const inlineVars = {};
  if (urlParams.primaryColor) inlineVars["--cal-primary"] = urlParams.primaryColor;
  if (urlParams.bgColor)      inlineVars["--cal-bg"]      = urlParams.bgColor;
  if (urlParams.accentColor)  inlineVars["--cal-accent"]  = urlParams.accentColor;
  if (urlParams.textColor)    inlineVars["--cal-text"]    = urlParams.textColor;
  if (urlParams.fontFamily)   inlineVars["--cal-font"]    = urlParams.fontFamily;

  const activeMapping = { ...config.colorMapping };
  for (const [colorId, newLabel] of Object.entries(urlParams.colorOverrides)) {
    if (activeMapping[colorId]) {
      activeMapping[colorId] = { ...activeMapping[colorId], label: newLabel };
    } else {
      activeMapping[colorId] = { label: newLabel, hex: "#888888" };
    }
  }

  const headerTitle = urlParams.title || config.header.title;

  // ----------------------------------------------------------
  //  On utilise transformEventData depuis lib/utils.ts
  //  au lieu de reimplementer la logique localement.
  //  Cela garantit que l'app de demo et le package npm
  //  ont un comportement rigoureusement identique.
  //
  //  NOTE : transformEventData retourne { display: "none" }
  //  pour masquer un evenement, contrairement a l'ancienne
  //  version qui retournait false. Les deux approches
  //  fonctionnent dans FullCalendar v6.
  // ----------------------------------------------------------
  const handleEventDataTransform = (eventData) => {
    return transformEventData(eventData, activeMapping, dynamicShow);
  };

  const renderEventContent = (eventInfo) => {
    const { start, end } = eventInfo.event;
    const groupLabel = eventInfo.event.extendedProps?.groupLabel || "G";
    const fmt = (d) =>
      d ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";

    return (
      <div className="custom-event">
        <div className="custom-event-title">[{groupLabel}] {eventInfo.event.title}</div>
        <div className="custom-event-time">{fmt(start)} - {fmt(end)}</div>
      </div>
    );
  };

  // ----------------------------------------------------------
  //  On utilise JOURS depuis lib/utils.ts
  //  au lieu de le redefinir localement une troisieme fois.
  // ----------------------------------------------------------
  const renderDayHeader = (args) => {
    const noms = JOURS[dynamicLang] || JOURS["fr"];
    return `${noms[args.date.getDay()]} ${args.date.getDate()}/${args.date.getMonth() + 1}`;
  };

  return (
    <div
      className="app-container"
      data-theme={dynamicTheme}
      style={inlineVars}
    >
      {showBuilder && (
        <WidgetBuilder onClose={() => setShowBuilder(false)} />
      )}

      <div className="custom-calendar-header">
        <div className="header-left">
          <span className="header-prefix">{config.header.prefix}</span>,{" "}
          <span className="header-title">{headerTitle}</span>
        </div>
        <div className="header-right">{config.header.dateText}</div>
      </div>

      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin]}
          initialView="timeGridWeek"
          googleCalendarApiKey={config.apiKey}
          events={{ googleCalendarId: urlParams.calId || config.masterCalendarId }}
          eventDataTransform={handleEventDataTransform}
          locales={[frLocale, enLocale]}
          locale={dynamicLang === "mg" ? "fr" : dynamicLang}
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

      {!urlParams.hideBuilder && (
        <button
          onClick={() => setShowBuilder(true)}
          className="builder-fab-button"
        >
          Creer mon Widget
        </button>
      )}
      {!urlParams.hideBuilder && (
        <a href="/?docs=1" className="docs-fab-link">
          Docs
        </a>
      )}
    </div>
  );
}

const stylesChargement = {
  container: {
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    color: "#333",
  },
  texte: {
    fontSize: "14px",
    color: "#555",
  },
  url: {
    fontSize: "11px",
    color: "#999",
    marginTop: "8px",
    wordBreak: "break-all",
  },
  erreurTitre: {
    color: "#cc0000",
    fontWeight: "bold",
    fontSize: "15px",
    marginBottom: "10px",
  },
  erreurDetail: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "8px",
  },
  erreurConseil: {
    fontSize: "12px",
    color: "#999",
    maxWidth: "480px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
};
