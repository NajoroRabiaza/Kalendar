//  sw.js = Service Worker de Kalendar
//
//  Un Service Worker est un script JavaScript qui s'exécute
//  en arrière-plan dans le navigateur, SÉPAREMENT de la page.
//  Il intercepte toutes les requêtes réseau de l'app et peut
//  décider de les servir depuis le cache local plutôt que
//  depuis internet.
//
//  CYCLE DE VIE D'UN SERVICE WORKER :
//  1. install   → le navigateur télécharge et installe le SW
//  2. activate  → le SW prend le contrôle de la page
//  3. fetch     → le SW intercepte chaque requête réseau
//
//  STRATÉGIE UTILISÉE : Cache-First pour les ressources statiques
//  On essaie d'abord le cache. Si la ressource y est, on la
//  retourne sans toucher au réseau (rapide, fonctionne hors-ligne).
//  Si elle n'est pas en cache, on va la chercher sur le réseau
//  puis on la met en cache pour la prochaine fois.
//
//  IMPORTANT : les données Google Calendar (les événements)
//  ne sont PAS mises en cache ici. Elles changent souvent et
//  nécessitent toujours d'être fraîches. Seule la "coquille"
//  de l'app (HTML, CSS, JS) est mise en cache.


// Nom du cache. On inclut un numéro de version.
// Quand on veut forcer un rechargement complet du cache
// (ex: après un déploiement), il suffit de changer ce nom
// (ex: "kalendar-v2") et l'ancien cache sera supprimé.
const CACHE_NAME = "kalendar-v1";

// Liste des ressources à mettre en cache immédiatement
// lors de l'installation du Service Worker.
// Ce sont les fichiers minimum pour que l'app s'affiche
// sans connexion internet (la "coquille" de l'app).
const RESSOURCES_A_PRECACHER = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png",
  "/favicon.ico",
];


//  etape 1 — INSTALLATION
//
//  event.waitUntil() dit au navigateur :
//  "n'arrête pas l'installation tant que cette promesse
//   n'est pas résolue". Cela garantit que le cache est
//   rempli avant que le SW soit considéré comme installé.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      // On ouvre (ou crée) le cache avec notre nom de version
      .open(CACHE_NAME)
      .then((cache) => {
        // addAll() télécharge et met en cache toutes les
        // ressources listées dans RESSOURCES_A_PRECACHER.
        // Si une seule ressource échoue, tout l'install échoue.
        return cache.addAll(RESSOURCES_A_PRECACHER);
      })
  );

  // self.skipWaiting() force le nouveau SW à s'activer
  // immédiatement sans attendre que l'utilisateur ferme
  // et rouvre l'app. Sans ça, le nouveau SW attendrait
  // que tous les onglets de l'app soient fermés.
  self.skipWaiting();
});


//  etape 2 — ACTIVATION
//
//  C'est ici qu'on nettoie les anciens caches.
//  Si CACHE_NAME est passé de "kalendar-v1" à "kalendar-v2",
//  on supprime l'ancien cache "kalendar-v1" pour libérer
//  de l'espace sur l'appareil de l'utilisateur.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      // caches.keys() retourne la liste de tous les caches
      // existants sur cet appareil pour ce domaine.
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            // On garde uniquement notre cache actuel.
            // Tous les autres (anciennes versions) sont supprimés.
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
  );

  // clients.claim() fait que le SW prend immédiatement
  // le contrôle de toutes les pages ouvertes, sans attendre
  // un rechargement. Fonctionne en pair avec skipWaiting().
  self.clients.claim();
});


//  etape 3 — INTERCEPTION DES REQUÊTES (fetch)
//
//  C'est le cœur du Service Worker.
//  Chaque fois que l'app fait une requête réseau
//  (charger une image, un fichier JS, une page HTML,
//   ou appeler l'API Google Calendar), cette fonction
//  est appelée.
//
//  DÉCISION PAR TYPE DE REQUÊTE :
//
//  - Requête vers Google Calendar API  → toujours réseau
//    Les données des événements doivent toujours être fraîches.
//    On ne les met jamais en cache.
//
//  - Requête vers googleapis.com ou fonts.gstatic.com → réseau
//    Même raison : données dynamiques ou polices tierces.
//
//  - Tout le reste (fichiers statiques de l'app) → Cache-First
//    On cherche d'abord dans le cache. Si trouvé, on retourne
//    directement. Sinon on va sur le réseau et on met en cache.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // EXCLUSIONS : ces requêtes passent toujours par le réseau
  //
  // Google Calendar API : les événements du calendrier
  if (url.includes("googleapis.com")) {
    return; // on ne fait rien → le navigateur gère normalement
  }
  // Polices Google Fonts
  if (url.includes("fonts.gstatic.com")) {
    return;
  }
  // Requêtes non-GET (POST, PUT...) : jamais mises en cache
  if (event.request.method !== "GET") {
    return;
  }

  // STRATÉGIE CACHE-FIRST pour les ressources statiques
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si la ressource est en cache, on la retourne directement.
      // L'utilisateur voit l'app instantanément, même hors-ligne.
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si la ressource n'est pas en cache, on va la chercher
      // sur le réseau (comme un navigateur normal).
      return fetch(event.request)
        .then((networkResponse) => {
          // On vérifie que la réponse est valide avant de la cacher.
          // status === 0 = réponse opaque (requête cross-origin sans CORS)
          // On ne met pas en cache les réponses invalides.
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === "error"
          ) {
            return networkResponse;
          }

          // On clone la réponse car une réponse réseau ne peut
          // être lue qu'une seule fois. On met une copie en cache
          // et on retourne l'originale à la page.
          const responseACacher = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseACacher);
          });

          return networkResponse;
        })
        .catch(() => {
          // Si le réseau est indisponible ET que la ressource
          // n'est pas en cache, on retourne la page d'accueil
          // mise en cache comme fallback.
          // Cela évite une page d'erreur blanche.
          return caches.match("/index.html");
        });
    })
  );
});