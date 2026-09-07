//
//  injectStyles.ts
//  Injecte le CSS de Kalendar directement dans le DOM
//  via une balise <style>.
//
//  POURQUOI CETTE APPROCHE ?
//  Les imports CSS dans les packages npm ne fonctionnent pas
//  de facon universelle. CRA, Next.js, Remix ont tous des
//  comportements differents pour les CSS dans node_modules/.
//  Injecter via JS est la seule approche qui fonctionne
//  partout sans configuration supplementaire de l'installateur.
//
//  La balise est creee une seule fois (verification de l'id)
//  meme si le composant est monte plusieurs fois sur la page.
//

export function injectKalendarStyles(): void {
  if (document.getElementById("kalendar-styles")) return;

  const style = document.createElement("style");
  style.id = "kalendar-styles";
  style.textContent = `
/*
   VALEURS PAR DEFAUT — THEME CLAIR
   */
.kal-container {
  --kal-bg:                   #ffffff;
  --kal-primary:              #a8cbff;
  --kal-accent:               #eef4ff;
  --kal-text-primary:         #004085;
  --kal-text-secondary:       #333333;
  --kal-text-hour:            #0033cc;
  --kal-header-prefix-color:  #ffcc00;
  --kal-header-title-color:   #28a745;

  --kal-border-top:           2px solid #a8cbff;
  --kal-border-col:           #d0d0d0;
  --kal-border-hour:          1px solid #999999;
  --kal-border-quarter:       1px dashed #cccccc;
  --kal-border-hour-col:      #c0c0c0;
  --kal-slot-height:          22px;
  --kal-day-border:           1px solid #ffffff;

  --kal-font:                 Arial, Helvetica, sans-serif;
  --kal-font-size-base:       11px;
  --kal-font-size-hour:       11px;
  --kal-font-size-header:     12px;
  --kal-font-size-event:      10px;
  --kal-font-size-event-time: 9px;

  --kal-event-border-color:   #ffffff;
  --kal-event-text-color:     #ffffff;
  --kal-event-border-radius:  0px;
  --kal-event-padding:        2px;

  --kal-dark-bg:                  #1a1a2e;
  --kal-dark-primary:             #0f3460;
  --kal-dark-accent:              #16213e;
  --kal-dark-text-primary:        #a8cbff;
  --kal-dark-text-hour:           #7eb8ff;
  --kal-dark-text-secondary:      #aaaaaa;
  --kal-dark-border-hour:         1px solid #444466;
  --kal-dark-border-quarter:      1px dashed #333355;
  --kal-dark-border-col:          #2a2a4a;
  --kal-dark-border-hour-col:     #333355;
  --kal-dark-header-title-color:  #4caf7d;
}

/*
   THEME SOMBRE
   */
.kal-container[data-theme="dark"] {
  --kal-bg:                 var(--kal-dark-bg);
  --kal-primary:            var(--kal-dark-primary);
  --kal-accent:             var(--kal-dark-accent);
  --kal-text-primary:       var(--kal-dark-text-primary);
  --kal-text-hour:          var(--kal-dark-text-hour);
  --kal-text-secondary:     var(--kal-dark-text-secondary);
  --kal-border-hour:        var(--kal-dark-border-hour);
  --kal-border-quarter:     var(--kal-dark-border-quarter);
  --kal-border-col:         var(--kal-dark-border-col);
  --kal-border-hour-col:    var(--kal-dark-border-hour-col);
  --kal-header-title-color: var(--kal-dark-header-title-color);
}

/*
   BASE DU CONTENEUR
   */
*, *::before, *::after { box-sizing: border-box; }

.kal-container {
  background-color: var(--kal-bg);
  font-family:      var(--kal-font);
  font-size:        var(--kal-font-size-base);
  padding:          10px;
  max-width:        100%;
  transition:       background-color 0.3s ease, color 0.3s ease;
}

/*
   EN-TETE
   */
.kal-header {
  display:          flex;
  justify-content:  space-between;
  align-items:      flex-end;
  font-size:        var(--kal-font-size-header);
  font-weight:      bold;
  padding-bottom:   4px;
  background-color: var(--kal-bg);
}
.kal-header-prefix { color: var(--kal-header-prefix-color); }
.kal-header-title  { color: var(--kal-header-title-color);  }
.kal-header-right  { color: var(--kal-text-secondary); font-weight: normal; }

/*
   BORDURE SUPERIEURE DU CALENDRIER
   */
.kal-calendar-wrapper {
  border-top: var(--kal-border-top);
}

.kal-container .fc { font-size: var(--kal-font-size-base); }

/*
   BANDEAU DES JOURS
   */
.kal-container .fc-theme-standard th {
  background-color: var(--kal-primary) !important;
  border:           var(--kal-day-border) !important;
  padding:          2px 0 !important;
}
.kal-container .fc-col-header-cell-cushion {
  color:           var(--kal-text-primary) !important;
  font-weight:     normal !important;
  text-decoration: none !important;
}

/*
   COLONNE DES HEURES
   */
.kal-container .fc-theme-standard .fc-timegrid-axis,
.kal-container .fc-theme-standard .fc-timegrid-slot-label {
  background-color: var(--kal-accent) !important;
  border-right:     1px solid var(--kal-border-hour-col) !important;
  border-top:       none !important;
  border-bottom:    none !important;
}
.kal-container .fc .fc-timegrid-slot-label-cushion {
  color:       var(--kal-text-hour) !important;
  font-size:   var(--kal-font-size-hour) !important;
  font-weight: normal !important;
}

/*
   HAUTEUR DES CRENEAUX
   */
.kal-container .fc-timegrid-slot {
  height: var(--kal-slot-height) !important;
}

/*
   LIGNES DE LA GRILLE
   */
.kal-container .fc-theme-standard td.fc-timegrid-slot-lane {
  border-bottom: none !important;
  border-left:   none !important;
  border-right:  none !important;
}
.kal-container .fc .fc-timegrid-slot-lane {
  border-top: var(--kal-border-hour) !important;
}
.kal-container .fc td.fc-timegrid-slot-minor.fc-timegrid-slot-lane,
.kal-container .fc tr.fc-timegrid-slot-minor .fc-timegrid-slot-lane {
  border-top: var(--kal-border-quarter) !important;
}

/*
   SEPARATIONS VERTICALES
   */
.kal-container .fc-theme-standard .fc-timegrid-col {
  border-right: 1px solid var(--kal-border-col) !important;
  border-left:  1px solid var(--kal-border-col) !important;
}

/*
   EVENEMENTS
   */
.kal-container .fc-timegrid-event-harness { margin: 0 !important; }
.kal-container .fc-v-event {
  border-radius: var(--kal-event-border-radius) !important;
  border:        1px solid var(--kal-event-border-color) !important;
  box-shadow:    none !important;
  padding:       var(--kal-event-padding) !important;
  margin:        0 !important;
}
.kal-container .fc-event-main {
  color:   var(--kal-event-text-color) !important;
  padding: 0 !important;
}

.kal-event {
  display:        flex;
  flex-direction: column;
  line-height:    1.1;
  gap:            2px;
}
.kal-event-title {
  font-weight: bold;
  font-size:   var(--kal-font-size-event);
  white-space: normal;
  overflow:    hidden;
}
.kal-event-time {
  font-size:   var(--kal-font-size-event-time);
  font-weight: normal;
}

/*
   FOND AUJOURD'HUI
   */
.kal-container .fc-day-today {
  background-color: transparent !important;
}
`;
  document.head.appendChild(style);
}