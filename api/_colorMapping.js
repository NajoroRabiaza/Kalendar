//  api/_colorMapping.js
//  Source de verite unique pour le mapping colorId → groupe.
//
//  Le prefixe _ indique a Vercel que ce fichier est un
//  module interne et non un endpoint HTTP expose publiquement.
//  Vercel n'expose que les fichiers sans prefixe _ comme routes.
//
//  Doit rester synchronise avec src/calendarConfig.js
//  pour la partie colorMapping.
export const COLOR_MAPPING = {
  "1":       { label: "H1",      hex: "#0099ff" },
  "2":       { label: "H4",      hex: "#ff6600" },
  "3":       { label: "G3",      hex: "#666666" },
  "default": { label: "General", hex: "#333333" },
};