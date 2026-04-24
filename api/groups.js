// ============================================================
//  api/groups.js
//  Endpoint : GET /api/groups
//
//  Retourne uniquement la liste des groupes disponibles.
//  C'est un sous-ensemble de /api/config, mais utile
//  séparément quand une app a juste besoin de peupler
//  une liste déroulante de groupes, sans le reste.
//
//  Exemple de réponse :
//  {
//    "groups": ["H1", "H4", "G3", "Général"]
//  }
//
//  Exemple d'utilisation depuis n'importe quelle app :
//  fetch("https://kalendar.vercel.app/api/groups")
//    .then(res => res.json())
//    .then(data => console.log(data.groups))
//    // affiche : ["H1", "H4", "G3", "Général"]
// ============================================================

// Même liste que dans api/config.js
// On extrait juste les labels pour une réponse plus légère
const GROUPES = [
  { id: "1",       label: "H1"      },
  { id: "2",       label: "H4"      },
  { id: "3",       label: "G3"      },
  { id: "default", label: "Général" },
];


export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Méthode non autorisée. Utilisez GET." });
  }

  // On retourne un tableau des labels uniquement.
  // Simple et direct pour une app qui veut juste afficher
  // une liste de groupes à l'utilisateur.
  return res.status(200).json({
    groups: GROUPES.map((g) => g.label),
  });
}
