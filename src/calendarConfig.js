// ============================================================
//  calendarConfig.js
//  Configuration locale de l'application de demo Vercel.
//
//  Les valeurs sensibles (cle API, calendarId) sont lues
//  depuis les variables d'environnement :
//
//  En developpement local :
//    Creer un fichier .env.local a la racine du projet :
//      REACT_APP_GOOGLE_API_KEY=ta_cle_api
//      REACT_APP_CALENDAR_ID=ton_calendar_id
//    .env.local est dans .gitignore et ne sera jamais commite.
//
//  Sur Vercel :
//    Settings → Environment Variables → ajouter les deux
//    variables ci-dessus. Vercel les injecte automatiquement
//    lors du build de production.
//
//  REACT_APP_ est le prefixe obligatoire de CRA pour exposer
//  une variable d'environnement au code JavaScript du navigateur.
//  Sans ce prefixe, la variable reste invisible cote client.
// ============================================================

export const calendarConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || "",

  header: {
    prefix:   "THE",
    title:    "Holidays in Madagascar",
    dateText: "dim. 21 mai - sam. 27 mai 2023 (Heure normale d'Afrique de l'Est)",
  },

  masterCalendarId: process.env.REACT_APP_CALENDAR_ID || "",

  colorMapping: {
    "1":       { label: "H1",      hex: "#0099ff" },
    "2":       { label: "H4",      hex: "#ff6600" },
    "3":       { label: "G3",      hex: "#666666" },
    "default": { label: "General", hex: "#333333" },
  },
};
