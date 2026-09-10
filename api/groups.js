//  api/groups.js
//  Endpoint : GET /api/groups
//
//  Retourne uniquement la liste des labels de groupes.
import { COLOR_MAPPING } from "./_colorMapping.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Methode non autorisee. Utilisez GET." });
  }

  return res.status(200).json({
    groups: Object.values(COLOR_MAPPING).map((g) => g.label),
  });
}