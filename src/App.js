import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
const VOTRE_CLE_API_GOOGLE = "AIzaSyCHFTEMzBJXWu5cOz4ADvSq8HhW4-cIz84";
const VOTRE_ID_CALENDRIER = "jorojanah@gmail.com";

function App() {
  
  return (
    <div style={{ padding: '20px' }}>
      <FullCalendar
        plugins={[
          dayGridPlugin,
          googleCalendarPlugin
        ]}
        initialView="dayGridMonth"
        
        // --- Connexion à Google Calendar ---
        googleCalendarApiKey={VOTRE_CLE_API_GOOGLE}
        eventSources={[
          {
            googleCalendarId: VOTRE_ID_CALENDRIER,
            color: '#1a73e8'
          }
        ]}

        // --- Configuration "Read-Only" ---
        editable={false} // Empecher le glisser-déposer
        selectable={false} // Empecher la sélection de dates
        
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek' // Permet de changer de vue
        }}
      />
    </div>
  );
}

export default App;