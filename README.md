# Portail d'Emploi du Temps Universitaire

Une application web interactive développée en React, conçue pour centraliser et afficher les emplois du temps des étudiants en temps réel. Le système utilise l'API Google Calendar comme "Source de Vérité Unique", offrant une interface claire et sans ambiguïté pour les étudiants, tout en simplifiant drastiquement le travail administratif.

## Objectifs du Projet

  - **Pour les Étudiants :** Offrir une visualisation instantanée, claire et colorée de leur journée. Fini les PDF obsolètes ou les erreurs d'emploi du temps ; les changements de salles ou d'horaires sont répercutés en temps réel.
  - **Pour l'Administration :** Éliminer la double saisie. L'équipe pédagogique continue d'utiliser Google Agenda (idéal pour gérer les récurrences et les conflits), et la plateforme web se charge de synchroniser et de formater ces données automatiquement.

## Fonctionnalités Principales

  - **Synchronisation Google Calendar :** Connexion directe et en temps réel à de multiples calendriers Google (par classes/groupes).
  - **Interface Visuelle Sur-Mesure :** Design industriel type "blocs pleins" pour une lecture immédiate des cours et des intervalles.
  - **Grille de Précision :** Affichage optimisé de 07h00 à 18h00 avec une granularité par quarts d'heure (lignes pleines pour les heures, pointillés pour les interlignes).
  - **Filtrage Intelligent :** Possibilité de filtrer l'affichage par groupes (ex: H1, H4, G3) avec un code couleur strict.

## Technologies Utilisées

  - **Framework :** [React.js](https://reactjs.org/)
  - **Moteur de Calendrier :** [FullCalendar](https://fullcalendar.io/) (Modules `daygrid`, `timegrid`, `google-calendar`)
  - **Source de données :** API Google Calendar

## Installation et Démarrage local

### Prérequis

  - [Node.js](https://nodejs.org/) (version 14 ou supérieure)
  - Un gestionnaire de paquets (npm ou yarn)
  - Une clé d'API Google Calendar valide.

### Étapes d'installation

1.  **Cloner le dépôt :**

    ```bash
    git clone https://github.com/votre-nom/votre-projet-emploi-du-temps.git
    cd votre-projet-emploi-du-temps
    ```

2.  **Installer les dépendances :**

    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configuration de la clé API Google :**
    Ouvrez le fichier `src/App.js` et assurez-vous d'insérer votre clé API Google valide dans la constante prévue à cet effet :

    ```javascript
    const API_KEY = "VOTRE_CLE_API_GOOGLE_ICI";
    ```

    *(Note de sécurité : Pour une mise en production, il est recommandé de passer cette clé dans un fichier `.env` via `process.env.REACT_APP_GOOGLE_API_KEY`).*

4.  **Lancer le serveur de développement :**

    ```bash
    npm start
    # ou
    yarn start
    ```

    L'application sera accessible sur [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).

## Configuration des Calendriers (Groupes)

Pour ajouter, modifier ou supprimer un groupe d'étudiants, éditez la constante `SOURCES` dans le fichier `src/App.js` :

```javascript
const SOURCES = [
  { 
    id: "groupeA", 
    title: "H1", 
    calendarId: "ID_DU_CALENDRIER_GOOGLE@group.calendar.google.com", 
    color: "#0099ff" 
  },
  // Ajoutez d'autres groupes ici...
];
```

Assurez-vous que les calendriers Google cibles sont configurés en **"Public"** dans leurs paramètres de partage pour que l'API puisse récupérer les événements.

## Architecture CSS et Design

Le rendu spécifique de la grille (lignes continues pour les heures, tirets pour les quarts d'heure) a été implémenté en surchargeant le thème standard de FullCalendar.
Les modifications majeures se trouvent dans `src/App.css`.

  - Lignes d'heures pleines : `tr.fc-timegrid-slot:not(.fc-timegrid-slot-minor)`
  - Interlignes (15, 30, 45) : `tr.fc-timegrid-slot-minor`
  - Suppression des bordures d'événements : `.fc-v-event`

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE.md](LICENSE.md) pour plus de détails.