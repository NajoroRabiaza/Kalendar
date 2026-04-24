// ============================================================
//  api/events.js
//  Endpoint : GET /api/events?group=H1&week=2026-04-21
//
//  Récupère les événements du calendrier Google pour un groupe
//  et une semaine donnés, depuis le serveur (Node.js).
//
//  PARAMÈTRES ACCEPTÉS :
//  ?group=H1          → filtre par groupe (optionnel)
//  ?week=2026-04-21   → semaine contenant cette date (optionnel)
//                       Si absent, retourne la semaine en cours
//
//  Exemple d'appel :
//  GET /api/events?group=H1&week=2026-04-21
//
//  Exemple de réponse :
//  {
//    "group": "H1",
//    "weekStart": "2026-04-20",
//    "weekEnd": "2026-04-26",
//    "count": 3,
//    "events": [
//      {
//        "id": "abc123",
//        "title": "Mathématiques",
//        "start": "2026-04-21T08:00:00+03:00",
//        "end": "2026-04-21T10:00:00+03:00",
//        "group": "H1",
//        "colorId": "1"
//      }
//    ]
//  }
//
//  POURQUOI CÔTÉ SERVEUR ET PAS CÔTÉ CLIENT ?
//  L'app React appelle déjà Google Calendar directement
//  depuis le navigateur (via FullCalendar). Cet endpoint
//  sert une cible différente : une app mobile, un script
//  Python, un autre site, qui veulent consommer les données
//  sans intégrer FullCalendar. Le serveur devient un
//  intermédiaire propre (Backend-for-Frontend).
//
//  VARIABLE D'ENVIRONNEMENT :
//  La clé API et le calendarId sont lus depuis les variables
//  d'environnement Vercel et non hardcodés ici.
//  Sur Vercel : Settings → Environment Variables
//  En local   : créer un fichier .env.local à la racine :
//    GOOGLE_API_KEY=ta_cle_api
//    GOOGLE_CALENDAR_ID=ton_calendar_id
//  .env.local est dans .gitignore → jamais committé.
// ============================================================


// Mapping colorId → label de groupe
// Doit rester synchronisé avec calendarConfig.js
const COLOR_MAPPING = {
  "1":       { label: "H1",      hex: "#0099ff" },
  "2":       { label: "H4",      hex: "#ff6600" },
  "3":       { label: "G3",      hex: "#666666" },
  "default": { label: "Général", hex: "#333333" },
};


// ----------------------------------------------------------
//  Utilitaire : calcule le lundi et dimanche de la semaine
//  contenant la date fournie.
//
//  Paramètre : dateString = "2026-04-21" (format ISO 8601)
//  Retourne  : { lundi: Date, dimanche: Date }
//
//  Pourquoi lundi ? FullCalendar affiche les semaines du
//  lundi au dimanche dans notre config (firstDay: 1).
//  On reste cohérent.
// ----------------------------------------------------------
function getSemaine(dateString) {
  // Si dateString est absent ou invalide, on prend aujourd'hui
  const base = dateString ? new Date(dateString) : new Date();

  // getDay() retourne 0=dimanche, 1=lundi ... 6=samedi
  // Pour avoir le lundi : on recule de (jourActuel - 1) jours
  // Cas spécial dimanche (0) : on recule de 6 jours
  const jourSemaine = base.getDay();
  const reculJusquLundi = jourSemaine === 0 ? 6 : jourSemaine - 1;

  const lundi = new Date(base);
  lundi.setDate(base.getDate() - reculJusquLundi);
  lundi.setHours(0, 0, 0, 0);

  const dimanche = new Date(lundi);
  dimanche.setDate(lundi.getDate() + 6);
  dimanche.setHours(23, 59, 59, 999);

  return { lundi, dimanche };
}


// ----------------------------------------------------------
//  Utilitaire : formate une Date en "YYYY-MM-DD"
//  Google Calendar API attend ce format pour timeMin/timeMax.
// ----------------------------------------------------------
function formatDate(date) {
  return date.toISOString().split("T")[0];
}


export default async function handler(req, res) {
  // CORS : cette API est publique, accessible depuis n'importe
  // quel domaine
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Méthode non autorisée. Utilisez GET." });
  }

  // ----------------------------------------------------------
  //  LECTURE DES VARIABLES D'ENVIRONNEMENT
  //
  //  process.env est l'objet Node.js qui contient toutes les
  //  variables d'environnement. Sur Vercel, elles sont définies
  //  dans Settings → Environment Variables.
  //
  //  On valide leur présence avant de continuer. Si elles
  //  manquent, l'endpoint retourne une erreur 500 claire
  //  plutôt qu'une erreur cryptique de Google.
  // ----------------------------------------------------------
  const apiKey     = process.env.GOOGLE_API_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!apiKey || !calendarId) {
    return res.status(500).json({
      erreur: "Configuration serveur manquante.",
      detail: "Les variables d'environnement GOOGLE_API_KEY et GOOGLE_CALENDAR_ID doivent être définies sur Vercel.",
    });
  }

  // ----------------------------------------------------------
  //  LECTURE ET VALIDATION DES PARAMÈTRES DE LA REQUÊTE
  //
  //  req.query contient les paramètres URL sous forme d'objet.
  //  Pour /api/events?group=H1&week=2026-04-21 :
  //  req.query = { group: "H1", week: "2026-04-21" }
  // ----------------------------------------------------------
  const { group, week } = req.query;

  // Validation de ?week= : doit être au format YYYY-MM-DD
  const WEEK_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  if (week && !WEEK_REGEX.test(week)) {
    return res.status(400).json({
      erreur: "Format de date invalide.",
      detail: "Le paramètre week doit être au format YYYY-MM-DD. Exemple : ?week=2026-04-21",
    });
  }

  // Calcul de la plage de dates pour la semaine demandée
  const { lundi, dimanche } = getSemaine(week);

  // ----------------------------------------------------------
  //  APPEL À L'API GOOGLE CALENDAR
  //
  //  L'API Google Calendar Events expose un endpoint :
  //  GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events
  //
  //  Paramètres utilisés :
  //  key          = la clé API (authentification)
  //  timeMin      = début de la plage (format ISO 8601)
  //  timeMax      = fin de la plage (format ISO 8601)
  //  singleEvents = true → développe les événements récurrents
  //                 en occurrences individuelles
  //  orderBy      = "startTime" → triés par heure de début
  //  maxResults   = 250 → limite de sécurité (défaut Google = 250)
  //
  //  encodeURIComponent(calendarId) : le calendarId peut contenir
  //  des @ et des # qui doivent être encodés dans une URL.
  // ----------------------------------------------------------
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

    // Même vérification que dans App.js : fetch() ne rejette
    // pas les erreurs HTTP (401, 403, 404...) automatiquement
    if (!googleResponse.ok) {
      const erreurGoogle = await googleResponse.json();
      return res.status(502).json({
        erreur: "Erreur de l'API Google Calendar.",
        detail: erreurGoogle?.error?.message || "Réponse invalide de Google.",
        // 502 = Bad Gateway : notre serveur a reçu une réponse
        // invalide d'un serveur en amont (Google ici)
      });
    }

    googleData = await googleResponse.json();
  } catch (err) {
    // Erreur réseau : impossible de joindre Google
    return res.status(503).json({
      erreur: "Impossible de contacter l'API Google Calendar.",
      detail: err.message,
      // 503 = Service Unavailable
    });
  }

  // ----------------------------------------------------------
  //  TRANSFORMATION ET FILTRAGE DES ÉVÉNEMENTS
  //
  //  Google retourne des événements bruts avec beaucoup de
  //  champs inutiles pour nous (htmlLink, etag, organizer...).
  //  On extrait uniquement ce qui est utile pour l'API.
  //
  //  On filtre également par groupe si ?group= est fourni.
  // ----------------------------------------------------------
  const evenements = (googleData.items || [])
    // Étape 1 : transformer chaque événement Google en objet propre
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
    // Étape 2 : filtrer par groupe si ?group= est fourni
    // On ignore la casse : "h1" et "H1" matchent tous les deux
    .filter((event) => {
      if (!group) return true; // pas de filtre = on garde tout
      return event.group.toLowerCase() === group.toLowerCase();
    });

  // ----------------------------------------------------------
  //  RÉPONSE FINALE
  // ----------------------------------------------------------
  return res.status(200).json({
    group:     group || "tous",
    weekStart: formatDate(lundi),
    weekEnd:   formatDate(dimanche),
    count:     evenements.length,
    events:    evenements,
  });
}
