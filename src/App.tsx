import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import enLocale from "@fullcalendar/core/locales/en-gb";
import type {
  EventInput,
  EventContentArg,
} from "@fullcalendar/core";
import "./App.css";

import { calendarConfig } from "./calendarConfig";
import WidgetBuilder from "./WidgetBuilder";
import getUrlParams from "./getUrlParams";
import DocsPage from "./DocsPage";

//  Types locaux
type Theme = "light" | "dark";
type Lang  = "fr" | "en" | "mg";

interface Config {
  apiKey:           string;
  masterCalendarId: string;
  header: {
    prefix:   string;
    title:    string;
    dateText: string;
  };
  colorMapping: Record<string, { label: string; hex: string }>;
}

//  Constantes
//  Meme valeur que dans lib/utils.ts.
//  CRA interdit les imports hors de src/ donc on la redefinit
//  ici. Les deux doivent rester synchronisees.
const JOURS: Record<Lang, string[]> = {
  fr: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
  en: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
  mg: ["Alah.", "Alats.", "Tal.", "Alar.", "Alak.", "Zom.", "Sab."],
};

//  Composant
export default function App(): React.ReactElement {
  const [showBuilder, setShowBuilder] = useState<boolean>(false);

  const urlParams = getUrlParams();

  const [dynamicShow,  setDynamicShow]  = useState<string | null>(urlParams.show);
  const [dynamicTheme, setDynamicTheme] = useState<Theme>(urlParams.theme as Theme);
  const [dynamicLang,  setDynamicLang]  = useState<Lang>(urlParams.lang as Lang);

  const isDocsPage = new URLSearchParams(window.location.search).get("docs") === "1";

  const [externalConfig, setExternalConfig] = useState<Partial<Config> | null>(null);
  const [configLoading,  setConfigLoading]  = useState<boolean>(!!urlParams.configUrl);
  const [configError,    setConfigError]    = useState<string | null>(null);

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
      .then((json: unknown) => {
        if (typeof json !== "object" || json === null) {
          throw new Error("Le fichier JSON est invalide.");
        }
        setExternalConfig(json as Partial<Config>);
        setConfigLoading(false);
      })
      .catch((err: Error) => {
        setConfigError(err.message || "Erreur inconnue");
        setConfigLoading(false);
      });
  }, [urlParams.configUrl]);

  useEffect(() => {
    const THEMES_VALIDES:  Theme[] = ["light", "dark"];
    const LANGUES_VALIDES: Lang[]  = ["fr", "en", "mg"];

    const handleMessage = (event: MessageEvent): void => {
      if (!event.data || event.data.type !== "KALENDAR_CMD") return;

      const { action, value } = event.data as { action: string; value: string };
      let applied    = false;
      let finalValue: string | null = value;

      if (action === "SET_GROUP") {
        const groupe = typeof value === "string" ? value.trim().slice(0, 30) : "";
        setDynamicShow(groupe || null);
        finalValue = groupe || null;
        applied = true;
      } else if (action === "SET_THEME") {
        if (THEMES_VALIDES.includes(value as Theme)) {
          setDynamicTheme(value as Theme);
          applied = true;
        }
      } else if (action === "SET_LANG") {
        if (LANGUES_VALIDES.includes(value as Lang)) {
          setDynamicLang(value as Lang);
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

  const config: Config = {
    apiKey:           externalConfig?.apiKey           ?? calendarConfig.apiKey,
    masterCalendarId: externalConfig?.masterCalendarId ?? calendarConfig.masterCalendarId,
    header: {
      prefix:   externalConfig?.header?.prefix   ?? calendarConfig.header.prefix,
      title:    externalConfig?.header?.title     ?? calendarConfig.header.title,
      dateText: externalConfig?.header?.dateText  ?? calendarConfig.header.dateText,
    },
    colorMapping: externalConfig?.colorMapping ?? calendarConfig.colorMapping,
  };

  const inlineVars: Record<string, string> = {};
  if (urlParams.primaryColor) inlineVars["--cal-primary"] = urlParams.primaryColor;
  if (urlParams.bgColor)      inlineVars["--cal-bg"]      = urlParams.bgColor;
  if (urlParams.accentColor)  inlineVars["--cal-accent"]  = urlParams.accentColor;
  if (urlParams.textColor)    inlineVars["--cal-text"]    = urlParams.textColor;
  if (urlParams.fontFamily)   inlineVars["--cal-font"]    = urlParams.fontFamily;

  const activeMapping = { ...config.colorMapping };
  for (const [colorId, newLabel] of Object.entries(urlParams.colorOverrides as Record<string, string>)) {
    if (activeMapping[colorId]) {
      activeMapping[colorId] = { ...activeMapping[colorId], label: newLabel };
    } else {
      activeMapping[colorId] = { label: newLabel, hex: "#888888" };
    }
  }

  const headerTitle = urlParams.title || config.header.title;

  const handleEventDataTransform = (eventData: EventInput): EventInput => {
    const rawColorId = (eventData.colorId as string) || "default";
    const groupInfo  = activeMapping[rawColorId] || activeMapping["default"] || { label: "?", hex: "#999" };

    if (dynamicShow && groupInfo.label !== dynamicShow) {
      return { ...eventData, display: "none" };
    }

    return {
      ...eventData,
      backgroundColor: groupInfo.hex,
      borderColor:     "white",
      textColor:       "white",
      groupLabel:      groupInfo.label,
    };
  };

  const renderEventContent = (eventInfo: EventContentArg): React.ReactElement => {
    const { start, end } = eventInfo.event;
    const groupLabel = (eventInfo.event.extendedProps?.groupLabel as string) || "G";
    const fmt = (d: Date | null): string =>
      d ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";

    return (
      <div className="custom-event">
        <div className="custom-event-title">[{groupLabel}] {eventInfo.event.title}</div>
        <div className="custom-event-time">{fmt(start)} - {fmt(end)}</div>
      </div>
    );
  };

  const renderDayHeader = (args: { date: Date }): string => {
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

//  Styles inline pour les ecrans de chargement et d'erreur
const stylesChargement: Record<string, React.CSSProperties> = {
  container: {
    padding:    "40px 20px",
    fontFamily: "Arial, sans-serif",
    textAlign:  "center",
    color:      "#333",
  },
  texte: {
    fontSize: "14px",
    color:    "#555",
  },
  url: {
    fontSize:  "11px",
    color:     "#999",
    marginTop: "8px",
    wordBreak: "break-all",
  },
  erreurTitre: {
    color:        "#cc0000",
    fontWeight:   "bold",
    fontSize:     "15px",
    marginBottom: "10px",
  },
  erreurDetail: {
    fontSize:     "13px",
    color:        "#666",
    marginBottom: "8px",
  },
  erreurConseil: {
    fontSize:   "12px",
    color:      "#999",
    maxWidth:   "480px",
    margin:     "0 auto",
    lineHeight: "1.6",
  },
};