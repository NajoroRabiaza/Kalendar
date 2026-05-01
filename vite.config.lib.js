// ============================================================
//  vite.config.lib.js
//  Configuration Vite pour compiler lib/ en package npm.
//
//  Ce fichier est SÉPARÉ de la config Vite principale.
//  L'app Vercel continue d'utiliser react-scripts (CRA).
//  Ce fichier est uniquement utilisé quand on lance :
//    npm run build:lib
//
//  QU'EST-CE QUE LE "LIBRARY MODE" DE VITE ?
//  En mode normal, Vite compile une app web complète :
//  il génère un index.html, il bundle TOUT (React, FullCalendar,
//  ton code, les CSS...) en un seul fichier optimisé.
//  En mode "library", Vite compile uniquement un composant.
//  Il exclut les peerDependencies (React, FullCalendar) du
//  bundle car l'installateur les a déjà dans son projet.
//  Il génère deux formats de sortie : ESM et CJS.
// ============================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// En ESM, __dirname n'existe pas nativement.
// On le reconstruit depuis import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export default defineConfig({
  plugins: [
    // @vitejs/plugin-react avec le nouveau JSX transform (React 17+).
    // jsxRuntime: "automatic" signifie que React n'a plus besoin
    // d'être importé manuellement dans chaque fichier JSX.
    // C'est ce qui élimine le warning "default is imported but never used".
    react({ jsxRuntime: "automatic" }),
  ],

  // publicDir: false — empêche Vite de copier le dossier public/
  // dans dist/. En mode library, on ne veut que le code compilé,
  // pas les assets de l'app Vercel (favicon, sw.js, manifest...).
  publicDir: false,

  build: {
    // ----------------------------------------------------------
    //  lib : configuration du mode bibliothèque
    //  entry   : le fichier d'entrée à compiler (lib/index.js)
    //  name    : nom de la variable globale si chargé en <script>
    //            ex: <script src="dist/index.umd.js">
    //            window.Kalendar sera disponible globalement
    //  formats : les formats de sortie à générer
    //    "es"  → dist/index.es.js  (ES Modules, pour Vite/webpack)
    //    "cjs" → dist/index.cjs.js (CommonJS, pour Node.js)
    // ----------------------------------------------------------
    lib: {
      entry:   resolve(__dirname, "lib/index.js"),
      name:    "Kalendar",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },

    // ----------------------------------------------------------
    //  rollupOptions : configuration fine du bundler interne
    //  Vite utilise Rollup en interne pour le build.
    //
    //  external : liste des dépendances à NE PAS inclure
    //  dans le bundle. Ce sont les peerDependencies.
    //
    //  Pourquoi les exclure ?
    //  Si on incluait React dans le bundle, l'installateur
    //  se retrouverait avec DEUX copies de React dans son projet
    //  (la sienne + la nôtre). Cela cause des bugs graves
    //  (hooks qui ne fonctionnent plus, contexte perdu...).
    //  En les marquant comme "external", Rollup génère un
    //  import("react") dans le bundle plutôt que d'inclure
    //  le code de React directement.
    //
    //  output.globals : quand on génère le format UMD
    //  (chargement via <script> sans bundler), Rollup a besoin
    //  de savoir comment s'appellent ces librairies en global.
    //  ex: React est disponible comme window.React
    // ----------------------------------------------------------
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@fullcalendar/react",
        "@fullcalendar/daygrid",
        "@fullcalendar/timegrid",
        "@fullcalendar/google-calendar",
        "@fullcalendar/core",
        "@fullcalendar/core/locales/fr",
        "@fullcalendar/core/locales/en-gb",
      ],
      output: {
        // exports: "named" indique à Rollup qu'on utilise
        // uniquement des exports nommés comme point d'entrée.
        // Cela évite le warning sur le mélange default/named.
        exports: "named",
        globals: {
          "react":          "React",
          "react-dom":      "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
        },
        // ----------------------------------------------------------
        //  assetFileNames : contrôle le nom des fichiers CSS
        //  générés dans dist/. Sans ça, le CSS s'appellerait
        //  "style.css" par défaut. On le renomme "kalendar.css"
        //  pour que ce soit clair pour l'installateur.
        // ----------------------------------------------------------
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "kalendar.css";
          return assetInfo.name;
        },
      },
    },

    // ----------------------------------------------------------
    //  outDir : dossier de sortie du build
    //  On génère dans dist/ à la racine du projet.
    //  Ce dossier sera publié sur npm.
    // ----------------------------------------------------------
    outDir: "dist",

    // ----------------------------------------------------------
    //  sourcemap : génère des fichiers .map pour le debugging
    //  Permet aux installateurs de voir le code source original
    //  dans leurs DevTools quand ils debuggent.
    // ----------------------------------------------------------
    sourcemap: true,

    // ----------------------------------------------------------
    //  emptyOutDir : vide dist/ avant chaque build
    //  Évite que d'anciens fichiers trainent dans dist/
    //  après un changement de configuration.
    // ----------------------------------------------------------
    emptyOutDir: true,

    // ----------------------------------------------------------
    //  minify: false — désactive la minification du bundle.
    //
    //  Pourquoi ne pas minifier une librairie ?
    //  1. Le bundler de l'installateur (webpack, Vite...) se
    //     chargera de minifier lors de son propre build.
    //     Minifier deux fois est inutile.
    //  2. La minification de Rollup transforme if(a){b();c()}
    //     en a&&(b(),c()) — une forme que ESLint strict refuse
    //     avec "no-unused-expression".
    //  3. Sans minification, le code reste lisible dans les
    //     DevTools de l'installateur (les sourcemaps suffisent).
    // ----------------------------------------------------------
    minify: false,
  },
});