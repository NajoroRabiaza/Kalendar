//  api/config.js
//  Endpoint : GET /api/config
//
//  Retourne la configuration publique du calendrier :
//  les groupes disponibles, leurs couleurs, et le titre
//  de l'en-tete.
import { COLOR_MAPPING } from "./_colorMapping.js";

const CONFIG_PUBLIQUE = {
  header: {
    prefix: "THE",
    title:  "Holidays in Madagascar",
  },
  groups: Object.entries(COLOR_MAPPING).map(([id, { label, hex }]) => ({
    id,
    label,
    hex,
  })),
};

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ erreur: "Methode non autorisee. Utilisez GET." });
  }

  return res.status(200).json(CONFIG_PUBLIQUE);
}