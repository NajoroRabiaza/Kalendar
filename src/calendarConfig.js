export const calendarConfig = {
    // Clé API Google Calendar
    apiKey: "AIzaSyCHFTEMzBJXWu5cOz4ADvSq8HhW4-cIz84", 
    
    // Textes de l'en-tête (pour que d'autres écoles puissent mettre leur nom)
    header: {
      prefix: "THE",
      title: "Holidays in Madagascar",
      dateText: "dim. 21 mai - sam. 27 mai 2023 (Heure normale d'Afrique de l'Est)"
    },
  
    // Liste des groupes, leurs calendriers et leurs couleurs
    groups: [
      { 
        id: "groupeA", 
        title: "H1", 
        calendarId: "5a7d67665a2a4f9947883ae151366043ac09e229a04a0381e0b6e2476d1f64d2@group.calendar.google.com", 
        color: "#0099ff" 
      },
      { 
        id: "groupeB", 
        title: "H4", 
        calendarId: "923dd993f1ce96964d16621b06a46ef229bc747cc1f58a4302cfb8531629f855@group.calendar.google.com", 
        color: "#ff6600" 
      },
      { 
        id: "groupeC", 
        title: "G3", 
        calendarId: "b52757b92f0708d42f6642f0bc602fb5fcdb38e29bbdd4e1bee34368cc153795@group.calendar.google.com", 
        color: "#666666" 
      },
    ]
  };