import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import googleCalendarPlugin from '@fullcalendar/google-calendar';

const VOTRE_CLE_API_GOOGLE = "AIzaSyCHFTEMzBJXWu5cOz4ADvSq8HhW4-cIz84";
const VOTRE_ID_CALENDRIER = "jorojanah@gmail.com";

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          googleCalendarPlugin
        ]}
        initialView="timeGridWeek"

        googleCalendarApiKey={VOTRE_CLE_API_GOOGLE}
        eventSources={[
          {
            googleCalendarId: VOTRE_ID_CALENDRIER,
            className: "google-event" // pour le styling custom
          }
        ]}

        editable={false}
        selectable={false}

        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}

        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}

        eventDisplay="block"
      />
    </div>
  );
}

export default App;