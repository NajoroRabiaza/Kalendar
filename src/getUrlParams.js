//  getUrlParams.js
//  Lit et valide TOUS les paramètres URL de l'application.
//
//  PARAMÈTRES SUPPORTÉS :
//  ?theme=light|dark          = thème visuel (défaut: light)
//  ?lang=fr|en|mg             = langue du calendrier (défaut: fr)
//  ?from=07:00&to=18:00       = plage horaire (défaut: 07:00 = 18:00)
//  ?hiddenDays=0,6            = jours à masquer (0=dim, 6=sam)
//  ?hideBuilder=true          = cache le bouton ⚙️ (défaut: false)
//  ?title=Mon+Emploi          = surcharge le titre de l'en-tête
//  ?calId=xxx@group.cal...    = ID du calendrier Google à afficher
//  ?show=H1                   = filtre pour n'afficher qu'un groupe
//  ?color1=Licence1           = renomme le groupe de la couleur 1
//  ...jusqu'à ?color11=...

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);


  // Petit helper : lit un param, retourne fallback si absent
  const get = (key, fallback = null) => {
    const val = params.get(key);
    return val !== null && val.trim() !== "" ? val.trim() : fallback;
  };



  // THÈME  =  "light" ou "dark"
  const THEMES_VALIDES = ["light", "dark"];
  const rawTheme = get("theme", "light");
  const theme = THEMES_VALIDES.includes(rawTheme) ? rawTheme : "light";



  // LANGUE  =  "fr", "en" ou "mg" (malagasy = fr dans FullCalendar)
  const LANGUES_VALIDES = ["fr", "en", "mg"];
  const rawLang = get("lang", "fr");
  const lang = LANGUES_VALIDES.includes(rawLang) ? rawLang : "fr";
  // FullCalendar ne connait pas "mg", on le traite comme "fr"
  const fcLocale = lang === "mg" ? "fr" : lang;



  // PLAGE HORAIRE  =  "07:00" et "18:00" (format HH:MM)
  // Validation : on vérifie que c'est bien HH:MM et que
  //              from est strictement avant to
  const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/; // ex: "07:00", "18:30"

  const rawFrom = get("from", "07:00");
  const rawTo   = get("to",   "18:00");

  const fromValide = TIME_REGEX.test(rawFrom) ? rawFrom : "07:00";
  const toValide   = TIME_REGEX.test(rawTo)   ? rawTo   : "18:00";

  // Sécurité : si from >= to, on remet les valeurs par défaut
  const fromMinutes = timeToMinutes(fromValide);
  const toMinutes   = timeToMinutes(toValide);
  const from = fromMinutes < toMinutes ? fromValide + ":00" : "07:00:00";
  const to   = fromMinutes < toMinutes ? toValide   + ":00" : "18:00:00";



  // JOURS CACHÉS  =  ex: "0,6" pour cacher dimanche et samedi
  // 0=dimanche, 1=lundi, ..., 6=samedi
  // On filtre pour ne garder que des entiers entre 0 et 6
  const rawHiddenDays = get("hiddenDays", "");
  let hiddenDays = [];
  if (rawHiddenDays) {
    hiddenDays = rawHiddenDays
      .split(",")
      .map(d => parseInt(d, 10))
      .filter(d => !isNaN(d) && d >= 0 && d <= 6);
    // Dédoublonnage (si quelqu'un écrit "0,0,6")
    hiddenDays = [...new Set(hiddenDays)];
  }



  // CACHER LE BOUTON WIDGET BUILDER
  // Accepte uniquement "true" (strict) pour éviter les erreurs
  const hideBuilder = get("hideBuilder", "false") === "true";



  // TITRE PERSONNALISÉ de l'en-tête
  // On limite à 100 caractères pour éviter les abus
  const rawTitle = get("title", null);
  const title = rawTitle ? rawTitle.slice(0, 100) : null;



  // CALENDRIER & GROUPE (paramètres déjà existants — inchangés)
  const calId = get("calId", null);
  const show  = get("show",  null);



  // SURCHARGE DES NOMS DE GROUPES PAR COULEUR (déjà existant)
  // ?color1=Licence1 ... ?color11=Master2
  // On nettoie chaque valeur (max 30 caractères)
  const colorOverrides = {};
  for (let i = 1; i <= 11; i++) {
    const val = get(`color${i}`, null);
    if (val) {
      colorOverrides[i] = val.slice(0, 30); // limite raisonnable
    }
  }



  // RÉSULTAT FINAL  =  un seul objet propre et prévisible
  return {
    theme,
    lang,
    fcLocale,
    from,
    to,
    hiddenDays,
    hideBuilder,
    title,
    calId,
    show,
    colorOverrides,
  };
}


//  Utilitaire interne : convertit "07:30" en minutes (450)
//  Utilisé pour comparer from et to
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}


export default getUrlParams;
