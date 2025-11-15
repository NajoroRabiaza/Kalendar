import React, { useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import frLocale from '@fullcalendar/core/locales/fr';

const VOTRE_CLE_API_GOOGLE = "AIzaSyCHFTEMzBJXWu5cOz4ADvSq8HhW4-cIz84";
const VOTRE_ID_CALENDRIER = "jorojanah@gmail.com";

function App() {

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  }, []);

  return (
    <div style={{ padding: '20px'}}>
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          googleCalendarPlugin
        ]}

        initialView="timeGridWeek"

        
        height="auto"
        contentHeight="auto"
        expandRows={true}
        handleWindowResize={true}

        locales={[frLocale]}
        locale="fr"
        firstDay={1}

        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}

        googleCalendarApiKey={VOTRE_CLE_API_GOOGLE}
        eventSources={[
          {
            googleCalendarId: VOTRE_ID_CALENDRIER,
            className: "google-event"
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