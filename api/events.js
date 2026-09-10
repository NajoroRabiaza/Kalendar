//  api/events.js
//  Endpoint : GET /api/events?group=H1&week=2026-04-21
//
//  Recupere les evenements du calendrier Google pour un groupe
//  et une semaine donnes, depuis le serveur (Node.js)
import { COLOR_MAPPING } from "./_colorMapping.js";

function getSemaine(dateString) {
  const base = dateString ? new Date(dateString) : new Date();

  const jourSemaine      = base.getDay();
  const reculJusquLundi  = jourSemaine === 0 ? 6 : jourSemaine - 1;

  const lundi = new Date(base);
  lundi.setDate(base.getDate() - reculJusquLundi);
  lundi.setHours(0, 0, 0, 0);

  const dimanche = new Date(lundi);
  dimanche.setDate(lundi.getDate() + 6);
  dimanche.setHours(23, 59, 59, 999);

  return { lundi, dimanche };
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Methode non autorisee. Utilisez GET." });
  }

  const apiKey     = process.env.GOOGLE_API_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!apiKey || !calendarId) {
    return res.status(500).json({
      erreur: "Configuration serveur manquante.",
      detail: "Les variables GOOGLE_API_KEY et GOOGLE_CALENDAR_ID doivent etre definies sur Vercel.",
    });
  }

  const { group, week } = req.query;

  const WEEK_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  if (week && !WEEK_REGEX.test(week)) {
    return res.status(400).json({
      erreur: "Format de date invalide.",
      detail: "Le parametre week doit etre au format YYYY-MM-DD. Exemple : ?week=2026-04-21",
    });
  }

  const { lundi, dimanche } = getSemaine(week);

  const googleUrl = [
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    `?key=${apiKey}`,
    `&timeMin=${lundi.toISOString()}`,
    `&timeMax=${dimanche.toISOString()}`,
    `&singleEvents=true`,
    `&orderBy=startTime`,
    `&maxResults=250`,
  ].join("");

  let googleData;
  try {
    const googleResponse = await fetch(googleUrl);

    if (!googleResponse.ok) {
      const erreurGoogle = await googleResponse.json();
      return res.status(502).json({
        erreur: "Erreur de l'API Google Calendar.",
        detail: erreurGoogle?.error?.message || "Reponse invalide de Google.",
      });
    }

    googleData = await googleResponse.json();
  } catch (err) {
    return res.status(503).json({
      erreur: "Impossible de contacter l'API Google Calendar.",
      detail: err.message,
    });
  }

  const evenements = (googleData.items || [])
    .map((item) => {
      const colorId   = item.colorId || "default";
      const groupInfo = COLOR_MAPPING[colorId] || COLOR_MAPPING["default"];

      return {
        id:      item.id,
        title:   item.summary || "(Sans titre)",
        start:   item.start?.dateTime || item.start?.date,
        end:     item.end?.dateTime   || item.end?.date,
        group:   groupInfo.label,
        colorId: colorId,
        hex:     groupInfo.hex,
      };
    })
    .filter((event) => {
      if (!group) return true;
      return event.group.toLowerCase() === group.toLowerCase();
    });

  return res.status(200).json({
    group:     group || "tous",
    weekStart: formatDate(lundi),
    weekEnd:   formatDate(dimanche),
    count:     evenements.length,
    events:    evenements,
  });
}