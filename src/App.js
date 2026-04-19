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
  // --------------------------------------------------------
  //  RÈGLE FONDAMENTALE DE REACT :
  //  Tous les hooks (useState, useEffect...) doivent être
  //  appelés INCONDITIONNELLEMENT, tout en haut du composant,
  //  avant tout return anticipé. C'est la "Rules of Hooks".
  //  Si on met un return avant un hook, React ne peut plus
  //  garantir que les hooks sont appelés dans le même ordre
  //  à chaque rendu = erreur de compilation.
  // --------------------------------------------------------

  const [showBuilder, setShowBuilder] = useState(false);

  //  Lecture unique de tous les paramètres URL
  const urlParams = getUrlParams();

  // ----------------------------------------------------------
  //  postMessage API
  //  Ces trois states permettent au site parent de changer
  //  dynamiquement le groupe affiche, le theme et la langue
  //  SANS recharger l'iframe. La valeur initiale vient de
  //  l'URL (?show=H1) ; elle peut ensuite etre ecrasee par
  //  un message postMessage de la page parente.
  // ----------------------------------------------------------
  const [dynamicShow,  setDynamicShow]  = useState(urlParams.show);
  const [dynamicTheme, setDynamicTheme] = useState(urlParams.theme);
  const [dynamicLang,  setDynamicLang]  = useState(urlParams.lang);

  // Routing minimal : ?docs=1 = page de documentation
  // On lit le param AVANT les hooks mais on effectue le return APRÈS.
  const isDocsPage = new URLSearchParams(window.location.search).get("docs") === "1";

  //  POINT 4 — INJECTION DE LA FEUILLE CSS EXTERNE
  //  Si ?cssUrl=https://... est fourni dans l'URL, on crée
  //  dynamiquement un élément <link> dans le <head> de la page.
  //  useEffect s'exécute UNE SEULE FOIS après le premier rendu.
  //
  //  Pourquoi useEffect et pas directement dans le JSX ?
  //  Parce que <link> doit être dans le <head>, pas dans le
  //  <body>. useEffect nous donne accès au DOM réel après rendu.
  //
  //  On nettoie aussi le lien si le composant est démonté
  //  (la fonction retournée par useEffect = nettoyage).
  useEffect(() => {
    if (!urlParams.cssUrl) return; // rien à faire si pas de cssUrl

    // On vérifie qu'on n'a pas déjà injecté ce lien
    // (pour éviter les doublons en cas de re-rendu)
    const existingLink = document.getElementById("cal-external-css");
    if (existingLink) return;

    const link = document.createElement("link");
    link.id   = "cal-external-css"; // identifiant unique pour éviter les doublons
    link.rel  = "stylesheet";
    link.type = "text/css";
    link.href = urlParams.cssUrl;

    document.head.appendChild(link);

    // Nettoyage : si le composant est démonté, on retire le lien
    return () => {
      const l = document.getElementById("cal-external-css");
      if (l) l.remove();
    };
  }, [urlParams.cssUrl]); // se re-déclenche uniquement si cssUrl change

  // ----------------------------------------------------------
  //  postMessage : ECOUTE DES COMMANDES DU SITE PARENT
  //
  //  Principe :
  //  La page parente (qui integre l'iframe) peut appeler
  //  iframeElement.contentWindow.postMessage(payload, "*")
  //  Le widget ecoute via window.addEventListener("message").
  //
  //  Format attendu du message :
  //  { type: "KALENDAR_CMD", action: "SET_GROUP", value: "H2" }
  //  { type: "KALENDAR_CMD", action: "SET_THEME", value: "dark" }
  //  { type: "KALENDAR_CMD", action: "SET_LANG",  value: "en"   }
  //
  //  Securite :
  //  On n'accepte que les messages dont le type vaut exactement
  //  "KALENDAR_CMD". Cela evite de reagir aux messages d'autres
  //  scripts (ex : extensions navigateur, bibliotheques tierces).
  //  On valide aussi chaque valeur avant de l'appliquer.
  //
  //  Confirmation :
  //  Apres chaque commande reussie, on repond a la page parente
  //  via window.parent.postMessage(...) avec un ACK contenant
  //  l'action executee et la valeur finale appliquee.
  //  Cela permet au parent de savoir si sa commande a ete prise
  //  en compte, et quelle valeur est desormais active.
  // ----------------------------------------------------------
  useEffect(() => {
    const THEMES_VALIDES = ["light", "dark"];
    const LANGUES_VALIDES = ["fr", "en", "mg"];

    const handleMessage = (event) => {
      // On ignore tout message qui n'a pas notre type propriétaire
      if (!event.data || event.data.type !== "KALENDAR_CMD") return;

      const { action, value } = event.data;

      let applied = false;
      let finalValue = value;

      if (action === "SET_GROUP") {
        // value peut etre une chaine (ex: "H2") ou null/"" pour tout afficher
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

      // Envoi de la confirmation (ACK) vers la page parente
      // window.parent === window si on n'est pas dans une iframe,
      // ce qui est inoffensif (on s'envoie le message a soi-meme).
      if (applied) {
        window.parent.postMessage(
          {
            type: "KALENDAR_ACK",
            action,
            value: finalValue,
            ok: true,
          },
          "*"
        );
      } else {
        // Commande inconnue ou valeur invalide : on signale l'echec
        window.parent.postMessage(
          {
            type: "KALENDAR_ACK",
            action,
            value,
            ok: false,
            reason: "Action inconnue ou valeur invalide",
          },
          "*"
        );
      }
    };

    window.addEventListener("message", handleMessage);

    // Nettoyage : on retire le listener quand le composant est démonté
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []); // [] = ne s'execute qu'une seule fois, au montage

  // --------------------------------------------------------
  //  Return anticipé APRÈS tous les hooks — c'est ici la
  //  bonne place. Tous les hooks ont déjà été appelés
  //  inconditionnellement au-dessus, donc React est content.
  // --------------------------------------------------------
  if (isDocsPage) return <DocsPage />;


  //  POINT 4 — CONSTRUCTION DES STYLES INLINE (CSS VARIABLES)
  //  Voici le mécanisme clé :
  //  En CSS, une variable définie en inline style="--cal-primary: red"
  //  sur un élément a une priorité PLUS HAUTE que toute règle
  //  CSS dans une feuille de style, même avec !important sur
  //  une variable (les custom properties ne supportent pas !important de la même façon).
  //
  //  Donc si l'URL contient ?primaryColor=%23ff0000, on injecte
  //  "--cal-primary: #ff0000" directement sur le div principal.
  //  Le CSS lit ensuite --cal-primary via var(--cal-primary),
  //  et tout le calendrier se met à jour automatiquement.
  //
  //  On ne construit l'objet style que pour les valeurs présentes.
  //  Si une valeur est null (param absent ou invalide),
  //  on ne met rien = le CSS garde sa valeur par défaut.
  const inlineVars = {};

  if (urlParams.primaryColor) inlineVars["--cal-primary"] = urlParams.primaryColor;
  if (urlParams.bgColor)      inlineVars["--cal-bg"]      = urlParams.bgColor;
  if (urlParams.accentColor)  inlineVars["--cal-accent"]  = urlParams.accentColor;
  if (urlParams.textColor)    inlineVars["--cal-text"]    = urlParams.textColor;
  if (urlParams.fontFamily)   inlineVars["--cal-font"]    = urlParams.fontFamily;

  //  Mapping des couleurs (config + surcharges URL)
  const activeMapping = { ...calendarConfig.colorMapping };
  for (const [colorId, newLabel] of Object.entries(urlParams.colorOverrides)) {
    if (activeMapping[colorId]) {
      activeMapping[colorId] = { ...activeMapping[colorId], label: newLabel };
    } else {
      activeMapping[colorId] = { label: newLabel, hex: "#888888" };
    }
  }

  //  Titre
  const headerTitle = urlParams.title || calendarConfig.header.title;

  //  Transformation des événements
  const handleEventDataTransform = (eventData) => {
    const rawColorId = eventData.colorId || "default";
    const groupInfo  = activeMapping[rawColorId] || activeMapping["default"];

    // On utilise dynamicShow (etat React) plutot que urlParams.show
    // pour que les changements via postMessage soient pris en compte
    // sans recharger la page.
    if (dynamicShow && groupInfo.label !== dynamicShow) return false;

    eventData.backgroundColor = groupInfo.hex;
    eventData.borderColor     = "white";
    eventData.textColor       = "white";
    eventData.groupLabel      = groupInfo.label;
    return eventData;
  };

  //  Rendu des blocs d'événements
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

  //  En-tête des colonnes jours
  const renderDayHeader = (args) => {
    const jours = {
      fr: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
      en: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
      mg: ["Alah.", "Alats.", "Tal.", "Alar.", "Alak.", "Zom.", "Sab."],
    };
    // dynamicLang peut avoir ete change par postMessage SET_LANG
    const noms = jours[dynamicLang] || jours["fr"];
    return `${noms[args.date.getDay()]} ${args.date.getDate()}/${args.date.getMonth() + 1}`;
  };

  //  RENDU PRINCIPAL
  //  Le point clé est ici : on passe `inlineVars` comme
  //  prop `style` sur le div principal. React fusionne
  //  correctement les CSS custom properties dans le style
  //  inline du DOM, ce qui écrase les valeurs du CSS.
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
          <span className="header-prefix">{calendarConfig.header.prefix}</span>,{" "}
          <span className="header-title">{headerTitle}</span>
        </div>
        <div className="header-right">{calendarConfig.header.dateText}</div>
      </div>

      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin]}
          initialView="timeGridWeek"
          googleCalendarApiKey={calendarConfig.apiKey}
          events={{ googleCalendarId: urlParams.calId || calendarConfig.masterCalendarId }}
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