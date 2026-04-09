# Portail d'Emploi du Temps Universitaire

Une application web interactive développée en React, conçue pour centraliser et afficher les emplois du temps des étudiants en temps réel. Le système utilise l'API Google Calendar comme "Source de Vérité Unique", offrant une interface claire et sans ambiguïté pour les étudiants, tout en simplifiant drastiquement le travail administratif.

## Objectifs du Projet

  - **Pour les Étudiants :** Offrir une visualisation instantanée, claire et colorée de leur journée. Fini les PDF obsolètes ou les erreurs d'emploi du temps ; les changements de salles ou d'horaires sont répercutés en temps réel.
  - **Pour l'Administration :** Éliminer la double saisie. L'équipe pédagogique continue d'utiliser Google Agenda (idéal pour gérer les récurrences et les conflits), et la plateforme web se charge de synchroniser et de formater ces données automatiquement.

## Fonctionnalités Principales

  - **Synchronisation Google Calendar :** Connexion directe et en temps réel à de multiples calendriers Google (par classes/groupes).
  - **Interface Visuelle Sur-Mesure :** Design industriel type "blocs pleins" pour une lecture immédiate des cours et des intervalles.
  - **Grille de Précision :** Affichage optimisé de 07h00 à 18h00 avec une granularité par quarts d'heure (lignes pleines pour les heures, pointillés pour les interlignes).
  - **Filtrage Intelligent par URL :** Possibilité d'isoler l'emploi du temps d'un groupe spécifique via un paramètre dynamique dans l'URL.
  - **Intégration Transparente :** Conçu pour être intégré facilement comme widget iframe sur n'importe quel site web institutionnel.

## Intégration Facile (Widget Iframe)

L'un des grands atouts de ce projet est sa capacité à être intégré sur n'importe quel site web (WordPress, Moodle, site vitrine, etc.) sans aucune compétence en code, via une simple balise iframe.

### 1. Afficher l'emploi du temps complet
Copiez-collez ce code HTML dans votre page web :

```html
<iframe 
  src="https://VOTRE_PROJET.vercel.app" 
  width="100%" 
  height="700px" 
  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" 
  title="Emploi du temps">
</iframe>
```

### 2. Filtrer par groupe spécifique
Pour n'afficher que l'emploi du temps d'un groupe spécifique (par exemple le groupe "H4" dont l'ID est `groupeB`), ajoutez simplement `?group=groupeB` à la fin de l'URL :

```html
<iframe 
  src="https://VOTRE_PROJET.vercel.app/?group=groupeB" 
  width="100%" 
  height="700px" 
  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" 
  title="Emploi du temps - H4">
</iframe>
```

## Technologies Utilisées

  - **Framework :** [React.js](https://reactjs.org/)
  - **Moteur de Calendrier :** [FullCalendar](https://fullcalendar.io/) (Modules `daygrid`, `timegrid`, `google-calendar`)
  - **Source de données :** API Google Calendar

## Configuration Rapide (calendarConfig.js)

Toutes les variables du projet sont centralisées pour faciliter la maintenance. Pour ajouter, modifier ou supprimer un groupe d'étudiants, ou pour changer le titre de l'école, éditez simplement le fichier `src/calendarConfig.js` :

```javascript
export const calendarConfig = {
  apiKey: "VOTRE_CLE_API_GOOGLE_ICI",
  header: {
    prefix: "THE",
    title: "Holidays in Madagascar",
    dateText: "dim. 21 mai - sam. 27 mai 2023"
  },
  groups: [
    { 
      id: "groupeA", 
      title: "H1", 
      calendarId: "ID_DU_CALENDRIER_GOOGLE@group.calendar.google.com", 
      color: "#0099ff" 
    },
    // Ajoutez d'autres groupes ici...
  ]
};
```

Assurez-vous que les calendriers Google cibles sont configurés en **"Public"** dans leurs paramètres de partage pour que l'API puisse récupérer les événements.

## Installation et Démarrage local

### Prérequis

  - [Node.js](https://nodejs.org/) (version 14 ou supérieure)
  - Un gestionnaire de paquets (npm ou yarn)

### Étapes d'installation

1.  **Cloner le dépôt :**

    ```bash
    git clone [https://github.com/votre-nom/votre-projet-emploi-du-temps.git](https://github.com/votre-nom/votre-projet-emploi-du-temps.git)
    cd votre-projet-emploi-du-temps
    ```

2.  **Installer les dépendances :**

    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configurer les données :**
    Ouvrez le fichier `src/calendarConfig.js` et assurez-vous d'insérer votre clé API Google valide et vos identifiants de calendriers.

4.  **Lancer le serveur de développement :**

    ```bash
    npm start
    # ou
    yarn start
    ```

    L'application sera accessible sur http://localhost:3000.

## Architecture CSS et Design

Le rendu spécifique de la grille (lignes continues pour les heures, tirets pour les quarts d'heure) a été implémenté en surchargeant le thème standard de FullCalendar.
Les modifications majeures se trouvent dans `src/App.css`.

  - Lignes d'heures pleines : `tr.fc-timegrid-slot:not(.fc-timegrid-slot-minor)`
  - Interlignes (15, 30, 45) : `tr.fc-timegrid-slot-minor`
  - Suppression des bordures d'événements : `.fc-v-event`

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE.md](LICENSE.md) pour plus de détails.
```