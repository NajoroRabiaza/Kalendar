# @najororabiaza/kalendar

Composant React d'emploi du temps universitaire connecté à Google Calendar.
Personnalisable via props React et CSS Variables.

## Installation

```bash
npm install @najororabiaza/kalendar
```

### Prérequis (peerDependencies)

Ces packages doivent être présents dans votre projet :

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/google-calendar @fullcalendar/core
```

---

## Compatibilité SSR (Next.js, Remix)

Ce composant accède au DOM via `useEffect` pour injecter ses styles automatiquement.
Il est incompatible avec les React Server Components.

Dans Next.js 13+ avec l'App Router, vous devez l'encapsuler dans un composant client :

```jsx
// components/MonCalendrier.jsx
"use client";
import { Kalendar } from "@najororabiaza/kalendar";
export default Kalendar;
```

Puis l'utiliser normalement dans vos pages :

```jsx
import MonCalendrier from "@/components/MonCalendrier";

export default function Page() {
  return (
    <MonCalendrier
      apiKey="VOTRE_CLE_API_GOOGLE"
      calendarId="votre-calendrier@group.calendar.google.com"
    />
  );
}
```

Dans Remix, le composant fonctionne sans configuration particulière car Remix
gère automatiquement l'hydratation côté client.

---

## Utilisation de base

```jsx
import { Kalendar } from "@najororabiaza/kalendar";

function App() {
  return (
    <Kalendar
      apiKey="VOTRE_CLE_API_GOOGLE"
      calendarId="votre-calendrier@group.calendar.google.com"
    />
  );
}
```

Le CSS est importé automatiquement. Aucun import supplémentaire n'est nécessaire.

---

## Props

### Obligatoires

| Prop | Type | Description |
|---|---|---|
| `apiKey` | string | Clé API Google Calendar |
| `calendarId` | string | ID du calendrier Google à afficher |

### Affichage

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `theme` | string | `"light"` | `"light"` ou `"dark"` |
| `lang` | string | `"fr"` | `"fr"`, `"en"`, `"mg"` |
| `from` | string | `"07:00:00"` | Heure de début ex: `"08:00:00"` |
| `to` | string | `"18:00:00"` | Heure de fin ex: `"17:00:00"` |
| `hiddenDays` | array | `[]` | Jours à masquer ex: `[0, 6]` (0=dim, 6=sam) |
| `firstDay` | number | `1` | Premier jour de la semaine (1=lundi) |

### Données

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `colorMapping` | object | voir ci-dessous | Correspondance colorId Google → groupe |
| `group` | string | `null` | Affiche uniquement ce groupe ex: `"H1"` |

### En-tête

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `headerPrefix` | string | `""` | Texte du préfixe coloré |
| `headerTitle` | string | `"Emploi du Temps"` | Titre principal |
| `headerRight` | string | `""` | Texte à droite |
| `showHeader` | bool | `true` | Affiche ou cache l'en-tête |

### Style

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `style` | object | `{}` | CSS Variables inline |
| `className` | string | `""` | Classe CSS supplémentaire |

### Callbacks

| Prop | Type | Description |
|---|---|---|
| `onEventClick` | function | Appelé au clic sur un événement. Reçoit `{ title, start, end, group, colorId }` |

---

## Exemples

### Thème sombre, filtre par groupe

```jsx
<Kalendar
  apiKey="..."
  calendarId="..."
  theme="dark"
  group="H1"
  from="08:00:00"
  to="17:00:00"
  hiddenDays={[0, 6]}
/>
```

### En-tête personnalisé

```jsx
<Kalendar
  apiKey="..."
  calendarId="..."
  headerPrefix="UNIVERSITÉ"
  headerTitle="Emploi du Temps L1 Info"
  headerRight="2025-2026"
/>
```

### Couleurs personnalisées via CSS Variables

```jsx
<Kalendar
  apiKey="..."
  calendarId="..."
  style={{
    "--kal-primary":  "#b30000",
    "--kal-bg":       "#1a1a1a",
    "--kal-accent":   "#2a2a2a",
    "--kal-text":     "#ffcccc",
    "--kal-font":     "'Georgia', serif",
  }}
/>
```

### Groupes personnalisés

```jsx
import { Kalendar, DEFAULT_COLOR_MAPPING } from "@najororabiaza/kalendar";

<Kalendar
  apiKey="..."
  calendarId="..."
  colorMapping={{
    ...DEFAULT_COLOR_MAPPING,
    "1": { label: "Licence 1", hex: "#b30000" },
    "2": { label: "Master 2",  hex: "#004d00" },
  }}
/>
```

### Réagir au clic sur un événement

```jsx
<Kalendar
  apiKey="..."
  calendarId="..."
  onEventClick={({ title, start, end, group }) => {
    console.log(`Cours : ${title}`);
    console.log(`Groupe : ${group}`);
    console.log(`De ${start} à ${end}`);
  }}
/>
```

---

## CSS Variables — liste complète

Toutes les variables sont surchargeables depuis votre CSS ou via la prop `style`.

```css
.mon-conteneur {
  /* Couleurs */
  --kal-bg:                   #ffffff;
  --kal-primary:              #a8cbff;
  --kal-accent:               #eef4ff;
  --kal-text-primary:         #004085;
  --kal-text-secondary:       #333333;
  --kal-text-hour:            #0033cc;
  --kal-header-prefix-color:  #ffcc00;
  --kal-header-title-color:   #28a745;

  /* Grille */
  --kal-border-top:           2px solid #a8cbff;
  --kal-border-col:           #d0d0d0;
  --kal-border-hour:          1px solid #999999;
  --kal-border-quarter:       1px dashed #cccccc;
  --kal-border-hour-col:      #c0c0c0;
  --kal-slot-height:          22px;
  --kal-day-border:           1px solid #ffffff;

  /* Typographie */
  --kal-font:                 Arial, Helvetica, sans-serif;
  --kal-font-size-base:       11px;
  --kal-font-size-hour:       11px;
  --kal-font-size-header:     12px;
  --kal-font-size-event:      10px;
  --kal-font-size-event-time: 9px;

  /* Événements */
  --kal-event-border-color:   #ffffff;
  --kal-event-text-color:     #ffffff;
  --kal-event-border-radius:  0px;
  --kal-event-padding:        2px;
}
```

---

## Configuration Google Calendar

1. Créez ou ouvrez votre calendrier sur [Google Calendar](https://calendar.google.com)
2. Paramètres du calendrier → Partage → cochez **Rendre disponible au public**
3. Récupérez l'**ID du calendrier** dans Paramètres → Intégrer le calendrier
4. Créez une **clé API** dans [Google Cloud Console](https://console.cloud.google.com) avec l'API Google Calendar activée

---

## Liens

- [Démo live](https://kalendar.vercel.app)
- [Code source](https://github.com/NajoroRabiaza/Kalendar)
- [Signaler un bug](https://github.com/NajoroRabiaza/Kalendar/issues)

## Licence

MIT