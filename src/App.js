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

export default function App() {
  // RÈGLE FONDAMENTALE DE REACT :
  // Tous les hooks doivent être appelés INCONDITIONNELLEMENT,
  // tout en haut du composant, avant tout return anticipé.
  // C'est la "Rules of Hooks".

  const [showBuilder, setShowBuilder] = useState(false);

  // Lecture unique de tous les paramètres URL
  const urlParams = getUrlParams();

  // postMessage API :
  // Ces trois states permettent au site parent de changer
  // dynamiquement le groupe affiché, le thème et la langue
  // SANS recharger l'iframe. La valeur initiale vient de
  // l'URL (?show=H1) ; elle peut ensuite être écrasée par
  // un message postMessage de la page parente.
  const [dynamicShow,  setDynamicShow]  = useState(urlParams.show);
  const [dynamicTheme, setDynamicTheme] = useState(urlParams.theme);
  const [dynamicLang,  setDynamicLang]  = useState(urlParams.lang);

  // Routing minimal : ?docs=1 = page de documentation
  const isDocsPage = new URLSearchParams(window.location.search).get("docs") === "1";

  // CONFIGURATION EXTERNE (?config=https://...)
  //
  // Principe : une école peut héberger un fichier JSON sur
  // son propre serveur et passer son URL via ?config=.
  // L'app Vercel déployée récupère ce JSON au démarrage
  // et l'utilise à la place de calendarConfig.js.
  // Cela permet une réutilisation SANS modifier le code
  // et SANS redéployer : un seul déploiement Vercel sert
  // toutes les écoles qui hébergent leur propre config.json.
  //
  // externalConfig démarre à null (= pas encore chargé).
  // Une fois le fetch terminé, il contient l'objet JSON
  // ou reste null si le fetch a échoué.
  //
  // configLoading = true tant que le fetch est en cours.
  // configError   = message d'erreur si le fetch a échoué.
  const [externalConfig, setExternalConfig] = useState(null);
  const [configLoading,  setConfigLoading]  = useState(!!urlParams.configUrl);
  const [configError,    setConfigError]    = useState(null);

  // useEffect : INJECTION DE LA FEUILLE CSS EXTERNE
  // Si ?cssUrl=https://... est fourni dans l'URL, on crée
  // dynamiquement un élément <link> dans le <head>.
  // useEffect s'exécute UNE SEULE FOIS après le premier rendu.
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

  // useEffect : FETCH DU FICHIER JSON DE CONFIGURATION
  //
  // Ce useEffect se déclenche UNE SEULE FOIS au montage
  // (si configUrl est présent dans l'URL).
  //
  // Le JSON attendu suit la structure de calendarConfig.js.
  // Les clés absentes sont ignorées : l'app garde la valeur
  // de calendarConfig comme fallback pour chaque champ.
  // Voir config.example.json à la racine du projet.
  //
  // Pourquoi fetch() et pas import() ?
  // Parce que l'URL est inconnue au moment de la compilation.
  // Elle n'est connue qu'à l'exécution via l'URL.
  // fetch() est la bonne primitive pour ça.
  //
  // Gestion des erreurs :
  // fetch() ne rejette PAS les erreurs HTTP (404, 403...).
  // On vérifie response.ok manuellement.
  // Si le fetch échoue, on affiche un message clair.
  // L'app ne plante pas : elle continue avec calendarConfig.
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

  // useEffect : ECOUTE DES COMMANDES POSTMESSAGE
  //
  // La page parente peut appeler :
  // iframeEl.contentWindow.postMessage(payload, "*")
  // Format attendu :
  // { type: "KALENDAR_CMD", action: "SET_GROUP", value: "H2" }
  // { type: "KALENDAR_CMD", action: "SET_THEME", value: "dark" }
  // { type: "KALENDAR_CMD", action: "SET_LANG",  value: "en"  }
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

  // Return anticipé APRÈS tous les hooks.
  if (isDocsPage) return <DocsPage />;

  // AFFICHAGE PENDANT LE CHARGEMENT DU JSON
  //
  // Si ?config= est dans l'URL, on attend le fetch avant
  // d'afficher le calendrier. Sinon on afficherait le
  // calendrier avec calendarConfig puis il se rechargerait
  // avec la config externe, ce qui est visuellement perturbant.
  if (configLoading) {
    return (
      <div style={stylesChargement.container}>
        <p style={stylesChargement.texte}>Chargement de la configuration...</p>
        <p style={stylesChargement.url}>{urlParams.configUrl}</p>
      </div>
    );
  }

  // AFFICHAGE EN CAS D'ERREUR DE CHARGEMENT
  //
  // On affiche un message clair avec la cause de l'erreur.
  // Les deux causes les plus courantes sont :
  //  1. Le fichier n'existe pas (404)
  //  2. Le serveur n'a pas CORS activé (Access-Control-Allow-Origin)
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

  // FUSION DES CONFIGS : externe (JSON) + locale (calendarConfig)
  //
  // On construit un objet "config" final en deux couches :
  // 1. calendarConfig  : base locale, toujours présente
  // 2. externalConfig  : JSON externe, écrase la base si présent
  //
  // On utilise l'opérateur ?? (nullish coalescing) :
  // "prend la valeur de gauche si elle est non-null/undefined,
  //  sinon prend la valeur de droite"
  //
  // Les paramètres URL individuels (calId, title...) écrasent
  // tout dans la logique métier en dessous.
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

  // CONSTRUCTION DES STYLES INLINE (CSS VARIABLES)
  //
  // En CSS, une variable définie en inline style="--cal-primary: red"
  // a une priorité plus haute que toute règle dans une feuille de style.
  // Donc si l'URL contient ?primaryColor=%23ff0000, on injecte
  // "--cal-primary: #ff0000" directement sur le div principal.
  // Le CSS lit via var(--cal-primary), et tout se met à jour.
  const inlineVars = {};
  if (urlParams.primaryColor) inlineVars["--cal-primary"] = urlParams.primaryColor;
  if (urlParams.bgColor)      inlineVars["--cal-bg"]      = urlParams.bgColor;
  if (urlParams.accentColor)  inlineVars["--cal-accent"]  = urlParams.accentColor;
  if (urlParams.textColor)    inlineVars["--cal-text"]    = urlParams.textColor;
  if (urlParams.fontFamily)   inlineVars["--cal-font"]    = urlParams.fontFamily;

  // Mapping des couleurs (config fusionnée + surcharges URL)
  const activeMapping = { ...config.colorMapping };
  for (const [colorId, newLabel] of Object.entries(urlParams.colorOverrides)) {
    if (activeMapping[colorId]) {
      activeMapping[colorId] = { ...activeMapping[colorId], label: newLabel };
    } else {
      activeMapping[colorId] = { label: newLabel, hex: "#888888" };
    }
  }

  // Titre : ?title= dans l'URL > config externe > calendarConfig
  const headerTitle = urlParams.title || config.header.title;

  // Transformation des événements
  const handleEventDataTransform = (eventData) => {
    const rawColorId = eventData.colorId || "default";
    const groupInfo  = activeMapping[rawColorId] || activeMapping["default"];

    if (dynamicShow && groupInfo.label !== dynamicShow) return false;

    eventData.backgroundColor = groupInfo.hex;
    eventData.borderColor     = "white";
    eventData.textColor       = "white";
    eventData.groupLabel      = groupInfo.label;
    return eventData;
  };

  // Rendu des blocs d'événements
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

  // En-tête des colonnes jours
  const renderDayHeader = (args) => {
    const jours = {
      fr: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
      en: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
      mg: ["Alah.", "Alats.", "Tal.", "Alar.", "Alak.", "Zom.", "Sab."],
    };
    const noms = jours[dynamicLang] || jours["fr"];
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

// Styles pour les écrans de chargement et d'erreur.
// On les met ici plutôt que dans App.css car ils sont
// uniquement utilisés dans des cas temporaires/exceptionnels.
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