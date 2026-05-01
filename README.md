# Kalendar — Portail d'Emploi du Temps Universitaire

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NajoroRabiaza/Kalendar)
[![npm version](https://badge.fury.io/js/@najororabiaza%2Fkalendar.svg)](https://www.npmjs.com/package/@najororabiaza/kalendar)
[![npm downloads](https://img.shields.io/npm/dm/@najororabiaza/kalendar.svg)](https://www.npmjs.com/package/@najororabiaza/kalendar)

Une application web React qui affiche les emplois du temps universitaires en temps réel, directement synchronisée avec Google Calendar. Conçue pour être réutilisable : n'importe quelle institution peut intégrer Kalendar dans son site existant via une iframe, une API REST, un package npm, ou un fichier de configuration externe, sans toucher au code source.

---

## Sommaire

- [Objectifs](#objectifs)
- [Technologies](#technologies)
- [Package npm](#package-npm)
- [Installation locale](#installation-locale)
- [Configuration](#configuration)
- [Paramètres URL](#paramètres-url)
- [Personnalisation des couleurs](#personnalisation-des-couleurs)
- [Intégration iframe](#intégration-iframe)
- [API postMessage](#api-postmessage)
- [API REST](#api-rest)
- [Configuration externe JSON](#configuration-externe-json)
- [Progressive Web App](#progressive-web-app)
- [Widget Builder](#widget-builder)
- [Page de documentation](#page-de-documentation)
- [Architecture du projet](#architecture-du-projet)
- [Licence](#licence)

---

## Objectifs

**Pour les étudiants :** Une visualisation instantanée, claire et colorée de l'emploi du temps. Les changements de salle ou d'horaire sont répercutés en temps réel sans aucune intervention manuelle.

**Pour l'administration :** Zéro double saisie. L'équipe pédagogique continue d'utiliser Google Agenda normalement. Kalendar synchronise et formate tout automatiquement.

**Pour les intégrateurs :** Un seul déploiement Vercel peut servir plusieurs institutions. Chaque école personnalise son widget via des paramètres URL ou un fichier JSON externe, sans modifier le code.

**Pour les développeurs React :** Le composant est disponible sur npm et s'intègre directement dans n'importe quelle application React avec un contrôle total sur le style et le comportement.

---

## Technologies

| Outil | Rôle |
|---|---|
| React 19 | Framework UI |
| FullCalendar 6 | Moteur d'affichage du calendrier |
| Google Calendar API | Source de données des événements |
| Vercel | Hébergement + Serverless Functions |
| Service Worker | Cache hors-ligne (PWA) |
| npm | Distribution du composant React |

---

## Package npm

Kalendar est disponible en tant que package npm pour les développeurs React qui souhaitent intégrer le composant directement dans leur application.

### Installation

```bash
npm install @najororabiaza/kalendar
```

### Prérequis (peerDependencies)

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/google-calendar @fullcalendar/core
```

### Utilisation de base

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

Le CSS est injecté automatiquement. Aucun import supplémentaire n'est nécessaire.

### Props disponibles

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `apiKey` | string | requis | Clé API Google Calendar |
| `calendarId` | string | requis | ID du calendrier Google |
| `theme` | string | `"light"` | `"light"` ou `"dark"` |
| `lang` | string | `"fr"` | `"fr"`, `"en"`, `"mg"` |
| `from` | string | `"07:00:00"` | Heure de début |
| `to` | string | `"18:00:00"` | Heure de fin |
| `hiddenDays` | array | `[]` | Jours masqués ex: `[0, 6]` |
| `colorMapping` | object | défaut | Correspondance colorId → groupe |
| `group` | string | `null` | Filtre par groupe ex: `"H1"` |
| `headerPrefix` | string | `""` | Préfixe de l'en-tête |
| `headerTitle` | string | `"Emploi du Temps"` | Titre de l'en-tête |
| `headerRight` | string | `""` | Texte à droite de l'en-tête |
| `showHeader` | bool | `true` | Affiche l'en-tête |
| `style` | object | `{}` | CSS Variables inline |
| `className` | string | `""` | Classe CSS supplémentaire |
| `onEventClick` | function | `null` | Callback au clic sur un événement |

### Personnalisation via CSS Variables

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
    console.log(`Cours : ${title}, Groupe : ${group}`);
  }}
/>
```

Pour la documentation complète du package npm, voir [npmjs.com/@najororabiaza/kalendar](https://www.npmjs.com/package/@najororabiaza/kalendar).

---

## Installation locale

### Prérequis

- Node.js 14 ou supérieur
- Un compte Google avec une clé API Google Calendar activée

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/NajoroRabiaza/Kalendar.git
cd Kalendar

# 2. Installer les dépendances
npm install

# 3. Créer le fichier de variables d'environnement local
#    Ce fichier est dans .gitignore, il ne sera jamais commité
echo "GOOGLE_API_KEY=votre_cle_api" > .env.local
echo "GOOGLE_CALENDAR_ID=votre_calendar_id" >> .env.local

# 4. Lancer le serveur de développement
npm start
```

L'application sera accessible sur `http://localhost:3000`.

### Compiler le package npm en local

```bash
npm run build:lib
# Génère dist/index.es.js, dist/index.cjs.js, dist/kalendar.css
```

---

## Configuration

Le fichier `src/calendarConfig.js` centralise toutes les valeurs du projet. C'est le seul fichier à modifier pour adapter Kalendar à votre institution.

```javascript
export const calendarConfig = {
  // Clé API Google Calendar
  apiKey: "VOTRE_CLE_API",

  // ID du calendrier Google principal
  masterCalendarId: "votre-calendrier@group.calendar.google.com",

  // Textes de l'en-tête
  header: {
    prefix: "VOTRE ECOLE",
    title: "Emploi du Temps",
    dateText: "Semaine en cours"
  },

  // Correspondance colorId Google (1 à 11) vers groupe étudiant
  colorMapping: {
    "1":       { label: "Groupe A", hex: "#0099ff" },
    "2":       { label: "Groupe B", hex: "#ff6600" },
    "3":       { label: "Groupe C", hex: "#666666" },
    "default": { label: "Général",  hex: "#333333" }
  }
};
```

Assurez-vous que le calendrier Google est configuré en **Public** dans ses paramètres de partage.

---

## Paramètres URL

Tous les réglages sont accessibles via des paramètres dans l'URL. Aucune modification de code n'est nécessaire.

### Calendrier

| Paramètre | Valeurs | Description |
|---|---|---|
| `?calId=` | ID Google Calendar | Pointe vers un calendrier différent |
| `?show=` | ex: `H1` | Affiche uniquement ce groupe |
| `?title=` | texte libre (max 100 car.) | Remplace le titre de l'en-tête |
| `?color1=` à `?color11=` | texte libre | Renomme le groupe associé à chaque couleur |

### Affichage

| Paramètre | Valeurs | Défaut |
|---|---|---|
| `?theme=` | `light` ou `dark` | `light` |
| `?lang=` | `fr`, `en`, `mg` | `fr` |
| `?from=` | `HH:MM` ex: `08:00` | `07:00` |
| `?to=` | `HH:MM` ex: `17:00` | `18:00` |
| `?hiddenDays=` | `0,6` (0=dim, 6=sam) | aucun |
| `?hideBuilder=` | `true` | `false` |

### Exemples

```
# Emploi du temps du groupe H1 en thème sombre
https://votre-app.vercel.app/?show=H1&theme=dark

# Plage horaire réduite, sans week-end, en anglais
https://votre-app.vercel.app/?from=08:00&to=17:00&hiddenDays=0,6&lang=en

# Iframe sans bouton Widget Builder
https://votre-app.vercel.app/?show=H1&hideBuilder=true
```

---

## Personnalisation des couleurs

Kalendar utilise un système de CSS Variables à deux couches. Les variables publiques `--cal-*` peuvent être surchargées via l'URL ou via un fichier CSS externe.

### Via l'URL

Le caractère `#` doit être encodé en `%23` dans une URL.

| Paramètre | Variable CSS | Description |
|---|---|---|
| `?primaryColor=%23a8cbff` | `--cal-primary` | Couleur du bandeau des jours |
| `?bgColor=%23ffffff` | `--cal-bg` | Couleur de fond général |
| `?accentColor=%23eef4ff` | `--cal-accent` | Couleur de la colonne des heures |
| `?textColor=%23004085` | `--cal-text` | Couleur du texte dans le bandeau |
| `?fontFamily=Roboto` | `--cal-font` | Police d'écriture |
| `?cssUrl=https://...` | toutes | URL d'un fichier CSS externe (https uniquement) |

```
# Thème vert université
https://votre-app.vercel.app/?primaryColor=%23004d00&bgColor=%23f0fff0&textColor=%23002200
```

### Via votre propre CSS (intégration React directe)

```css
.app-container {
  --cal-primary: #votre-couleur;
  --cal-bg:      #votre-couleur;
  --cal-accent:  #votre-couleur;
  --cal-text:    #votre-couleur;
  --cal-font:    'Votre Police', sans-serif;
}
```

---

## Intégration iframe

### Calendrier complet

```html
<iframe
  src="https://votre-app.vercel.app/"
  width="100%"
  height="700px"
  style="border: none; border-radius: 8px;"
  title="Emploi du temps"
></iframe>
```

### Filtré par groupe, thème sombre, sans bouton

```html
<iframe
  src="https://votre-app.vercel.app/?show=H1&hideBuilder=true&theme=dark"
  width="100%"
  height="700px"
  style="border: none;"
  title="Emploi du temps H1"
></iframe>
```

---

## API postMessage

Quand Kalendar est intégré en iframe, la page parente peut lui envoyer des commandes sans recharger l'iframe.

### Envoyer une commande

```javascript
const iframe = document.getElementById("mon-calendrier");

iframe.addEventListener("load", function () {

  // Changer le groupe affiché
  iframe.contentWindow.postMessage(
    { type: "KALENDAR_CMD", action: "SET_GROUP", value: "H2" },
    "*"
  );

  // Passer en mode sombre
  iframe.contentWindow.postMessage(
    { type: "KALENDAR_CMD", action: "SET_THEME", value: "dark" },
    "*"
  );

  // Changer la langue
  iframe.contentWindow.postMessage(
    { type: "KALENDAR_CMD", action: "SET_LANG", value: "en" },
    "*"
  );
});
```

### Écouter les confirmations

```javascript
window.addEventListener("message", function (event) {
  if (event.data && event.data.type === "KALENDAR_ACK") {
    if (event.data.ok) {
      console.log("Commande executee :", event.data.action, "->", event.data.value);
    } else {
      console.warn("Commande refusee :", event.data.reason);
    }
  }
});
```

### Actions disponibles

| Action | Valeurs acceptées |
|---|---|
| `SET_GROUP` | n'importe quel label de groupe, ex: `"H1"` |
| `SET_THEME` | `"light"` ou `"dark"` |
| `SET_LANG` | `"fr"`, `"en"`, `"mg"` |

---

## API REST

Kalendar expose une API REST via Vercel Serverless Functions, accessible depuis n'importe quelle application.

### Endpoints

```
GET /api/config
GET /api/groups
GET /api/events
GET /api/events?group=H1
GET /api/events?group=H1&week=2026-04-21
```

### GET /api/config

Retourne la configuration publique : groupes et en-tête.

```json
{
  "header": { "prefix": "THE", "title": "Holidays in Madagascar" },
  "groups": [
    { "id": "1", "label": "H1", "hex": "#0099ff" },
    { "id": "2", "label": "H4", "hex": "#ff6600" }
  ]
}
```

### GET /api/groups

Retourne uniquement la liste des labels de groupes.

```json
{ "groups": ["H1", "H4", "G3", "Général"] }
```

### GET /api/events

Retourne les événements de la semaine.

| Paramètre | Description |
|---|---|
| `?group=H1` | Filtre par groupe (insensible à la casse) |
| `?week=2026-04-21` | Semaine contenant cette date (`YYYY-MM-DD`). Défaut : semaine en cours |

```json
{
  "group": "H1",
  "weekStart": "2026-04-20",
  "weekEnd": "2026-04-26",
  "count": 3,
  "events": [
    {
      "id": "abc123",
      "title": "Mathématiques",
      "start": "2026-04-21T08:00:00+03:00",
      "end": "2026-04-21T10:00:00+03:00",
      "group": "H1",
      "colorId": "1",
      "hex": "#0099ff"
    }
  ]
}
```

### Variables d'environnement requises

Sur Vercel : **Settings → Environment Variables**

```
GOOGLE_API_KEY       = votre_cle_api_google
GOOGLE_CALENDAR_ID   = votre_calendar_id@group.calendar.google.com
```

En local : créer un fichier `.env.local` à la racine avec ces mêmes valeurs.

---

## Configuration externe JSON

Une institution peut réutiliser l'app Vercel déployée sans modifier le code source, en hébergeant son propre fichier JSON de configuration.

```
https://votre-app.vercel.app/?config=https://monecole.mg/kalendar-config.json
```

### Format du fichier JSON

Voir `config.example.json` à la racine du projet pour le modèle complet.

```json
{
  "apiKey": "VOTRE_CLE_API",
  "masterCalendarId": "votre-calendrier@group.calendar.google.com",
  "header": {
    "prefix": "MON ECOLE",
    "title": "Emploi du Temps",
    "dateText": "Semaine en cours"
  },
  "colorMapping": {
    "1":       { "label": "L1 Info", "hex": "#0099ff" },
    "2":       { "label": "L2 Info", "hex": "#ff6600" },
    "default": { "label": "Général", "hex": "#333333" }
  }
}
```

### Prérequis CORS

Le serveur hébergeant le fichier JSON doit envoyer cet en-tête HTTP :

```
Access-Control-Allow-Origin: *
```

### Priorité des configurations

```
Paramètre URL individuel (?calId=, ?title=...)
          >
Config JSON externe (?config=https://...)
          >
calendarConfig.js (config locale)
```

---

## Progressive Web App

Kalendar est une PWA installable sur mobile et consultable hors-ligne.

### Fonctionnalités

- **Installable** : Chrome et Safari proposent d'ajouter l'app à l'écran d'accueil
- **Hors-ligne** : la structure de l'app est mise en cache par le Service Worker
- **Icône native** : s'affiche avec l'icône et le nom "Kalendar" sur l'écran d'accueil

### Stratégie de cache

Le Service Worker applique une stratégie **Cache-First** pour les fichiers statiques. Les données Google Calendar ne sont jamais mises en cache car elles doivent rester fraîches.

### Forcer un rechargement du cache après un déploiement

Dans `public/sw.js`, incrémentez le numéro de version :

```javascript
const CACHE_NAME = "kalendar-v2"; // était "kalendar-v1"
```

---

## Widget Builder

Un bouton flottant est disponible sur l'app. Il ouvre une interface pour générer un lien ou un code iframe personnalisé sans écrire de code. Il expose tous les paramètres disponibles avec un aperçu live du résultat.

Pour masquer le bouton dans une intégration :

```
?hideBuilder=true
```

---

## Page de documentation

Une page de documentation interactive est accessible directement sur l'app :

```
https://votre-app.vercel.app/?docs=1
```

Elle contient le tableau complet des paramètres URL, un builder avec aperçu live, et des exemples copiables pour WordPress, Moodle et d'autres plateformes.

---

## Architecture du projet

```
Kalendar/
├── public/
│   ├── index.html           # Meta tags PWA
│   ├── manifest.json        # Identité PWA (nom, icones, display mode)
│   └── sw.js                # Service Worker (cache hors-ligne)
│
├── src/
│   ├── App.js               # Composant principal, logique de rendu
│   ├── App.css              # Styles + système de CSS Variables (--cal-*)
│   ├── calendarConfig.js    # Configuration centrale de l'institution
│   ├── getUrlParams.js      # Lecture et validation de tous les params URL
│   ├── WidgetBuilder.js     # Interface de génération d'iframe
│   ├── DocsPage.jsx         # Page de documentation interactive
│   └── index.js             # Point d'entrée + enregistrement du SW
│
├── api/
│   ├── config.js            # GET /api/config
│   ├── groups.js            # GET /api/groups
│   └── events.js            # GET /api/events
│
├── lib/                     # Package npm @najororabiaza/kalendar
│   ├── Kalendar.jsx         # Composant React pur (props uniquement)
│   ├── Kalendar.css         # Styles avec 25 CSS Variables exposées
│   ├── injectStyles.js      # Injection automatique du CSS dans le DOM
│   ├── index.js             # Point d'entrée du package
│   └── README.md            # Documentation du package npm
│
├── dist/                    # Bundle compilé (généré par npm run build:lib)
│   ├── index.es.js          # Format ES Modules
│   ├── index.cjs.js         # Format CommonJS
│   └── kalendar.css         # CSS compilé
│
├── vite.config.lib.js       # Configuration Vite pour le build npm
├── config.example.json      # Modèle de configuration externe JSON
└── package.json
```

---

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE.md` pour plus de détails.