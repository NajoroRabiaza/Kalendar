// ============================================================
//  api/config.js
//  Endpoint : GET /api/config
//
//  Retourne la configuration publique du calendrier :
//  les groupes disponibles, leurs couleurs, et le titre
//  de l'en-tête. On ne retourne PAS la clé API ni le
//  masterCalendarId car ce sont des données sensibles.
//
//  Pourquoi cet endpoint est utile ?
//  Une app mobile ou un autre site peut appeler /api/config
//  pour savoir quels groupes existent et leurs couleurs,
//  sans avoir accès au code source du projet.
//
//  Exemple de réponse :
//  {
//    "header": { "title": "Holidays in Madagascar", "prefix": "THE" },
//    "groups": [
//      { "id": "1", "label": "H1", "hex": "#0099ff" },
//      { "id": "2", "label": "H4", "hex": "#ff6600" },
//      { "id": "3", "label": "G3", "hex": "#666666" },
//      { "id": "default", "label": "Général", "hex": "#333333" }
//    ]
//  }
//
//  FONCTIONNEMENT DES VERCEL SERVERLESS FUNCTIONS :
//  Chaque fichier dans le dossier api/ exporte une fonction
//  qui reçoit (req, res). C'est exactement la même interface
//  que Express.js, donc si tu connais Express, tu es à la maison.
//  req = la requête HTTP entrante (méthode, headers, body...)
//  res = l'objet pour construire et envoyer la réponse
// ============================================================

// La configuration est définie ici en dur.
// Elle reflète calendarConfig.js mais sans les données sensibles.
// Si tu modifies calendarConfig.js, pense à mettre à jour ici aussi.
//
// Pourquoi ne pas importer calendarConfig.js directement ?
// Les fichiers dans api/ s'exécutent côté SERVEUR (Node.js).
// Les fichiers dans src/ utilisent la syntaxe "export const"
// (ES Modules pour le navigateur) que Node.js ne gère pas
// nativement sans configuration supplémentaire dans ce projet.
// On duplique donc les données publiques ici, proprement.
const CONFIG_PUBLIQUE = {
  header: {
    prefix: "THE",
    title: "Holidays in Madagascar",
  },
  // colorMapping transformé en tableau pour être plus facile
  // à consommer par une app cliente (pas besoin de connaître
  // les clés de l'objet, on itère directement sur le tableau)
  groups: [
    { id: "1",       label: "H1",      hex: "#0099ff" },
    { id: "2",       label: "H4",      hex: "#ff6600" },
    { id: "3",       label: "G3",      hex: "#666666" },
    { id: "default", label: "Général", hex: "#333333" },
  ],
};


export default function handler(req, res) {
  // ----------------------------------------------------------
  //  CORS : Cross-Origin Resource Sharing
  //
  //  Sans cet en-tête, un navigateur refuse qu'une page web
  //  sur un autre domaine lise la réponse de cet endpoint.
  //  "Access-Control-Allow-Origin: *" = n'importe quelle
  //  origine peut lire la réponse. C'est ce qu'on veut pour
  //  une API publique.
  // ----------------------------------------------------------
  res.setHeader("Access-Control-Allow-Origin", "*");

  // ----------------------------------------------------------
  //  On n'accepte que les requêtes GET.
  //  Si quelqu'un envoie un POST, DELETE, etc., on répond
  //  avec le code HTTP 405 (Method Not Allowed).
  //  Les codes HTTP sont des conventions universelles :
  //  200 = OK, 405 = méthode non autorisée, 500 = erreur serveur
  // ----------------------------------------------------------
  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Méthode non autorisée. Utilisez GET." });
  }

  // Tout va bien : on retourne la config en JSON avec code 200
  return res.status(200).json(CONFIG_PUBLIQUE);
}
