import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

//  ENREGISTREMENT DU SERVICE WORKER
//
//  "serviceWorker" in navigator
//  Vérifie que le navigateur supporte les Service Workers.
//  Tous les navigateurs modernes (Chrome, Firefox, Safari,
//  Edge) le supportent. Internet Explorer non, mais on s'en
//  fiche pour une app universitaire moderne.
//
//  window.location.protocol === "https:"
//  Les Service Workers ne fonctionnent qu'en HTTPS.
//  En local (http://localhost), ils fonctionnent aussi
//  car localhost est une exception de sécurité reconnue.
//  Sur Vercel, tout est HTTPS donc pas de problème.
//
//  Pourquoi window.addEventListener("load", ...) ?
//  On attend que la page soit complètement chargée avant
//  d'enregistrer le SW. Cela évite de ralentir le premier
//  affichage de l'app : le SW est secondaire par rapport
//  au contenu principal.
//
//  navigator.serviceWorker.register("/sw.js")
//  Indique au navigateur où trouver le fichier du SW.
//  Le "/sw.js" doit être à la RACINE du domaine (pas dans
//  un sous-dossier) pour que le SW puisse contrôler toutes
//  les pages de l'app. C'est pour ça qu'on le met dans
//  public/ et non dans src/.
//
//  .then() / .catch()
//  On log le succès ou l'échec dans la console.
//  En cas d'échec, l'app continue de fonctionner normalement,
//  juste sans les fonctionnalités hors-ligne. Le SW est une
//  amélioration progressive (progressive enhancement) :
//  son absence ne casse rien.
if ("serviceWorker" in navigator && window.location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "[Kalendar] Service Worker enregistre avec succes. Portee :",
          registration.scope
        );
      })
      .catch((erreur) => {
        console.warn(
          "[Kalendar] Echec de l'enregistrement du Service Worker :",
          erreur
        );
      });
  });
}

reportWebVitals();