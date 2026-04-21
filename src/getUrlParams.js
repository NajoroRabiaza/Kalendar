// getUrlParams.js
// Lit et valide TOUS les paramètres URL de l'application.
//
// PARAMÈTRES SUPPORTÉS :
//
// Calendrier
// ?calId=xxx@group.cal...  = ID du calendrier Google
// ?show=H1      = affiche uniquement ce groupe
// ?title=Mon+Emploi  = titre de l'en-tête (max 100 car.)
// ?color1=Licence1...color11 = renomme les groupes par couleur
//
// Affichage
// ?theme=light|dark     = thème visuel (défaut: light)
// ?lang=fr|en|mg     = langue (défaut: fr)
// ?from=07:00&to=18:00  = plage horaire
// ?hiddenDays=0,6    = jours masqués (0=dim, 6=sam)
// ?hideBuilder=true     = cache le bouton Widget Builder
//
// Personnalisation des couleurs
// ?primaryColor=%23a8cbff = couleur principale (bandeau des jours)
// ?bgColor=%23ffffff      = couleur de fond général
// ?accentColor=%23eef4ff  = couleur secondaire (colonne heures)
// ?textColor=%23004085  = couleur du texte dans le bandeau
// ?fontFamily=Roboto    = police d'écriture
// ?cssUrl=https://...   = URL d'une feuille CSS externe (https uniquement)
//
// Configuration externe
// ?config=https://...  = URL d'un fichier JSON de configuration complet.
//     Permet à une nouvelle école de réutiliser l'app
//     Vercel déployée sans toucher au code.
//     Doit commencer par https://.
//     Le serveur doit envoyer Access-Control-Allow-Origin: *
//     Voir config.example.json à la racine du projet.
//
// NOTE sur les couleurs dans l'URL :
// Le # est un caractère spécial en URL (il désigne les ancres).
// Il faut l'encoder en %23 pour qu'il soit transmis correctement.
// Ex: ?primaryColor=%23ff0000  =  primaryColor = "#ff0000"
// URLSearchParams le décode automatiquement, donc côté JS on
// récupère bien "#ff0000".

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Helper : lit un param, retourne fallback si absent/vide
  const get = (key, fallback = null) => {
    const val = params.get(key);
    return val !== null && val.trim() !== "" ? val.trim() : fallback;
  };


  // SECTION 1 : PARAMÈTRES D'AFFICHAGE
  // Thème
  const THEMES_VALIDES = ["light", "dark"];
  const rawTheme = get("theme", "light");
  const theme = THEMES_VALIDES.includes(rawTheme) ? rawTheme : "light";

  // Langue
  const LANGUES_VALIDES = ["fr", "en", "mg"];
  const rawLang = get("lang", "fr");
  const lang    = LANGUES_VALIDES.includes(rawLang) ? rawLang : "fr";
  const fcLocale = lang === "mg" ? "fr" : lang;

  // Plage horaire
  const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
  const rawFrom  = get("from", "07:00");
  const rawTo    = get("to",   "18:00");
  const fromOk   = TIME_REGEX.test(rawFrom) ? rawFrom : "07:00";
  const toOk     = TIME_REGEX.test(rawTo)   ? rawTo   : "18:00";
  const fromMin  = timeToMinutes(fromOk);
  const toMin    = timeToMinutes(toOk);
  const from     = fromMin < toMin ? fromOk + ":00" : "07:00:00";
  const to       = fromMin < toMin ? toOk   + ":00" : "18:00:00";

  // Jours cachés
  const rawHiddenDays = get("hiddenDays", "");
  let hiddenDays = [];
  if (rawHiddenDays) {
    hiddenDays = [...new Set(
      rawHiddenDays
        .split(",")
        .map(d => parseInt(d, 10))
        .filter(d => !isNaN(d) && d >= 0 && d <= 6)
    )];
  }

  // Options générales
  const hideBuilder = get("hideBuilder", "false") === "true";
  const rawTitle    = get("title", null);
  const title       = rawTitle ? rawTitle.slice(0, 100) : null;
  const calId       = get("calId", null);
  const show        = get("show",  null);

  // Surcharges des noms de groupes
  const colorOverrides = {};
  for (let i = 1; i <= 11; i++) {
    const val = get(`color${i}`, null);
    if (val) colorOverrides[i] = val.slice(0, 30);
  }


  // SECTION 2 : PERSONNALISATION DES COULEURS

  // Regex de validation d'une couleur hexadécimale.
  // Accepte : #abc (3 chiffres) ou #aabbcc (6 chiffres)
  // URLSearchParams décode %23 → # automatiquement.
  const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  const validerCouleur = (key) => {
    const val = get(key, null);
    if (!val) return null;
    return HEX_REGEX.test(val) ? val : null;
  };

  const primaryColor = validerCouleur("primaryColor");
  const bgColor      = validerCouleur("bgColor");
  const accentColor  = validerCouleur("accentColor");
  const textColor    = validerCouleur("textColor");

  // Police d'écriture : lettres, chiffres, espaces, virgules, apostrophes, tirets uniquement
  const FONT_REGEX = /^[a-zA-Z0-9\s,'-]+$/;
  const rawFont    = get("fontFamily", null);
  const fontFamily = rawFont && FONT_REGEX.test(rawFont) ? rawFont : null;

  // URL CSS externe
  const rawCssUrl = get("cssUrl", null);
  const cssUrl    = rawCssUrl && rawCssUrl.startsWith("https://") ? rawCssUrl : null;


  // SECTION 3 : CONFIGURATION EXTERNE (?config=https://...)
  //
  // Même règle de sécurité que cssUrl : https:// uniquement.
  //
  // La valeur est lue ici mais le fetch() est fait dans App.js
  // via un useEffect, car getUrlParams est une fonction pure :
  // elle ne fait que lire et valider, jamais d'appel réseau.
  // Cela rend la fonction testable et prévisible.
  const rawConfigUrl = get("config", null);
  const configUrl    = rawConfigUrl && rawConfigUrl.startsWith("https://") ? rawConfigUrl : null;


  // RÉSULTAT FINAL
  return {
    theme, lang, fcLocale,
    from, to, hiddenDays,
    hideBuilder, title, calId, show,
    colorOverrides,
    primaryColor, bgColor, accentColor, textColor, fontFamily,
    cssUrl,
    configUrl,
  };
}

// Utilitaire : convertit "07:30" en minutes (450)
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default getUrlParams;