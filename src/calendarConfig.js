export const calendarConfig = {
  // Clé API Google Calendar
  apiKey: "AIzaSyCHFTEMzBJXWu5cOz4ADvSq8HhW4-cIz84", 
  
  // Textes de l'en-tête
  header: {
    prefix: "THE",
    title: "Holidays in Madagascar",
    dateText: "dim. 21 mai - sam. 27 mai 2023 (Heure normale d'Afrique de l'Est)"
  },

  // LE CALENDRIER MAÎTRE (Le seul qui sera lu par défaut)
  masterCalendarId: "5a7d67665a2a4f9947883ae151366043ac09e229a04a0381e0b6e2476d1f64d2@group.calendar.google.com", 
  
  // LA MATRICE DES COULEURS
  // Google Calendar attribue un "colorId" (de 1 à 11) à chaque événement coloré.
  // Si l'événement n'a pas de couleur spécifique, il prendra la valeur "default".
  colorMapping: {
    "1": { label: "H1", hex: "#0099ff" }, // Correspond à la couleur 1 dans Google
    "2": { label: "H4", hex: "#ff6600" }, // Correspond à la couleur 2
    "3": { label: "G3", hex: "#666666" }, // Correspond à la couleur 3
    "default": { label: "Général", hex: "#333333" } // Si on oublie de mettre une couleur
  }
};