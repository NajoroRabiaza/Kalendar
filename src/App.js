import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import frLocale from "@fullcalendar/core/locales/fr";
import "./App.css";

const API_KEY = "AIzaSyCHFTEMzBJXWu5cOz4ADvSq8HhW4-cIz84";

// les sources a lier avec les calendrier creer
const SOURCES = [
  { id: "groupeA", title: "H1", calendarId: "5a7d67665a2a4f9947883ae151366043ac09e229a04a0381e0b6e2476d1f64d2@group.calendar.google.com", color: "#FF6B6B" },
  { id: "groupeB", title: "H4", calendarId: "923dd993f1ce96964d16621b06a46ef229bc747cc1f58a4302cfb8531629f855@group.calendar.google.com", color: "#999999" },
  { id: "groupeC", title: "G3", calendarId: "b52757b92f0708d42f6642f0bc602fb5fcdb38e29bbdd4e1bee34368cc153795@group.calendar.google.com", color: "#9B5DE5" },
];

// mapping utile pour fallback (className -> couleur)
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
    color: s.color, // FullCalendar devrait appliquer ça, mais on a aussi fallback
  })).filter((_, i) => visible[SOURCES[i].id]);

  // fallback robuste : si l'événement n'a pas la bonne couleur (ou FullCalendar l'a écrasée),
  // on applique notre couleur par className.
  const handleEventDidMount = (info) => {
    try {
      // si l'élément a deja une couleur non vide et différente du bleu par défaut, on laisse
      const computedBg = window.getComputedStyle(info.el).backgroundColor;
      // parfois le bleu par défaut est "rgb(66, 133, 244)" ou similaire ; on force si c'est celui-ci
      const defaultBlueRgb = "rgb(66, 133, 244)";
      // si la couleur est transparente ou le bleu par défaut, on force la couleur de la source
      if (!computedBg || computedBg === "transparent" || computedBg === "rgba(0, 0, 0, 0)" || computedBg === defaultBlueRgb) {
        // cherche la className qui correspond à nos sources
        for (const cls of Object.keys(CLASS_COLOR_MAP)) {
          if (info.el.classList.contains(cls)) {
            const color = CLASS_COLOR_MAP[cls];
            info.el.style.backgroundColor = color;
            info.el.style.borderColor = color;
            info.el.style.color = '#ffffff'; // texte blanc pour contraste — modifie si besoin
            break;
          }
        }
      }
    } catch (e) {
      // noop
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <strong>Groupes :</strong>{" "}
        {SOURCES.map(s => (
          <label key={s.id} style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={visible[s.id]}
              onChange={() => setVisible(v => ({ ...v, [s.id]: !v[s.id] }))}
            />{" "}
            <span style={{ color: s.color, marginLeft: 6 }}>{s.title}</span>
          </label>
        ))}
      </div>

      <div style={{ padding: 16 }}>
  <FullCalendar
    plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin]}
    initialView="timeGridWeek"
    googleCalendarApiKey={API_KEY}
    eventSources={eventSources}
    locales={[frLocale]}
    locale="fr"
    headerToolbar={{
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    }}
    slotMinTime="06:00:00"
    slotMaxTime="22:00:00"
    allDaySlot={false}
    slotDuration="00:30:00"
    slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}

    // === hauteur fixe totale ===
    height={16 * 50} // 16 heures × 40px = 640px
    expandRows={false} // pas besoin
    handleWindowResize={false} // désactive recalcul automatique
    nowIndicator={true}

    eventDidMount={handleEventDidMount}
    eventClick={(info) => {
      info.jsEvent.preventDefault();
      return false;
    }}

    /* ===================== NOM DU JOUR AU-DESSUS ===================== */
  dayHeaderContent={ (args) => {
    // args.date est un objet Date
    const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const nomJour = jours[args.date.getDay()];
    const numeroJour = args.date.getDate();
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontWeight: "100", fontSize: "24px" }}>{nomJour}</div>
        <div style={{ fontWeight: "700", fontSize: "28px" }}>{numeroJour}</div>
      </div>
    );
  }
  }
  />
</div>


    </div>
  );
}