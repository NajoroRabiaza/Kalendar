import React, { useState, useMemo } from "react";
import "./DocsPage.css";

// Paramètres URL supportés (source de vérité pour le tableau)
const URL_PARAMS = [
  {
    param: "calId",
    type: "string",
    defaut: "Calendrier maître",
    exemple: "ecole@group.calendar.google.com",
    description: "ID du calendrier Google à afficher.",
  },
  {
    param: "show",
    type: "string",
    defaut: "Tous les groupes",
    exemple: "H1",
    description: "Filtre les événements pour n'afficher qu'un seul groupe (valeur du label colorMapping).",
  },
  {
    param: "title",
    type: "string",
    defaut: "Titre config",
    exemple: "Emploi+du+Temps+L1",
    description: "Titre affiché dans l'en-tête. Max 100 caractères. Les espaces s'encodent en +.",
  },
  {
    param: "theme",
    type: '"light" | "dark"',
    defaut: "light",
    exemple: "dark",
    description: "Thème visuel du calendrier.",
  },
  {
    param: "lang",
    type: '"fr" | "en" | "mg"',
    defaut: "fr",
    exemple: "en",
    description: "Langue des jours de la semaine (fr = français, en = anglais, mg = malagasy).",
  },
  {
    param: "from",
    type: "HH:MM",
    defaut: "07:00",
    exemple: "08:00",
    description: "Heure de début de la plage affichée.",
  },
  {
    param: "to",
    type: "HH:MM",
    defaut: "18:00",
    exemple: "17:00",
    description: "Heure de fin de la plage affichée.",
  },
  {
    param: "hiddenDays",
    type: "0–6 séparés par virgules",
    defaut: "Aucun",
    exemple: "0,6",
    description: "Jours à masquer. 0 = dimanche, 1 = lundi … 6 = samedi.",
  },
  {
    param: "hideBuilder",
    type: '"true"',
    defaut: "false",
    exemple: "true",
    description: "Masque le bouton « Créer mon Widget ». Recommandé pour les intégrations iframe.",
  },
  {
    param: "primaryColor",
    type: "hex encodé",
    defaut: "#a8cbff",
    exemple: "%230099ff",
    description: "Couleur du bandeau des jours (--cal-primary). Le # doit être encodé en %23.",
  },
  {
    param: "bgColor",
    type: "hex encodé",
    defaut: "#ffffff",
    exemple: "%231a1a2e",
    description: "Couleur de fond général (--cal-bg).",
  },
  {
    param: "accentColor",
    type: "hex encodé",
    defaut: "#eef4ff",
    exemple: "%2316213e",
    description: "Couleur de la colonne des heures (--cal-accent).",
  },
  {
    param: "textColor",
    type: "hex encodé",
    defaut: "#004085",
    exemple: "%23a8cbff",
    description: "Couleur du texte dans le bandeau des jours (--cal-text).",
  },
  {
    param: "fontFamily",
    type: "string",
    defaut: "Arial",
    exemple: "Roboto",
    description: "Police d'écriture (--cal-font). Doit être disponible dans le navigateur ou chargée via cssUrl.",
  },
  {
    param: "color1 … color11",
    type: "string",
    defaut: "Labels config",
    exemple: "color1=Licence+1",
    description: "Renomme le label du groupe associé à la couleur Google Calendar 1 à 11.",
  },
  {
    param: "cssUrl",
    type: "URL https://",
    defaut: "—",
    exemple: "https://monsite.com/cal.css",
    description: "Injecte une feuille CSS externe. Doit commencer par https://. Surcharge toutes les variables.",
  },
];

// Exemples d'intégration par plateforme
function buildIframe(url) {
  return `<iframe
  src="${url}"
  width="100%"
  height="600px"
  style="border:none;"
  title="Emploi du temps"
></iframe>`;
}

// Composant principal
export default function DocsPage() {
  // État du builder
  const [calId, setCalId] = useState("");
  const [show, setShow] = useState("");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("fr");
  const [from, setFrom] = useState("07:00");
  const [to, setTo] = useState("18:00");
  const [hideBuilder, setHideBuilder] = useState(true);
  const JOURS_NOMS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
  const [joursCoches, setJoursCoches] = useState([false, false, false, false, false, false, false]);

  const [activerPrimary, setActiverPrimary] = useState(false);
  const [activerBg, setActiverBg] = useState(false);
  const [activerAccent, setActiverAccent] = useState(false);
  const [activerText, setActiverText] = useState(false);
  const [activerFont, setActiverFont] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#a8cbff");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#eef4ff");
  const [textColor, setTextColor] = useState("#004085");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [cssUrl, setCssUrl] = useState("");

  // Construction de l'URL
  const { generatedUrl, iframeCode } = useMemo(() => {
    const base = window.location.origin;
    const p = new URLSearchParams();
    if (calId) p.set("calId", calId);
    if (show) p.set("show", show);
    if (title) p.set("title", title);
    if (theme !== "light") p.set("theme", theme);
    if (lang !== "fr") p.set("lang", lang);
    if (from !== "07:00") p.set("from", from);
    if (to !== "18:00") p.set("to", to);
    const joursCaches = joursCoches.map((c, i) => (c ? i : null)).filter((i) => i !== null);
    if (joursCaches.length > 0) p.set("hiddenDays", joursCaches.join(","));
    if (hideBuilder) p.set("hideBuilder", "true");
    if (activerPrimary) p.set("primaryColor", primaryColor);
    if (activerBg) p.set("bgColor", bgColor);
    if (activerAccent) p.set("accentColor", accentColor);
    if (activerText) p.set("textColor", textColor);
    if (activerFont && fontFamily) p.set("fontFamily", fontFamily);
    if (cssUrl.startsWith("https://")) p.set("cssUrl", cssUrl);
    const qs = p.toString();
    const url = qs ? `${base}/?${qs}` : `${base}/`;
    return { generatedUrl: url, iframeCode: buildIframe(url) };
  }, [calId, show, title, theme, lang, from, to, joursCoches, hideBuilder, activerPrimary, primaryColor, activerBg, bgColor, activerAccent, accentColor, activerText, textColor, activerFont, fontFamily, cssUrl]);

  // Helpers
  const toggleJour = (i) => {
    const j = [...joursCoches];
    j[i] = !j[i];
    setJoursCoches(j);
  };

  const [copiedId, setCopiedId] = useState(null);
  const copier = (texte, id) => {
    navigator.clipboard.writeText(texte).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Exemples plateforme
  const plateformes = [
    {
      id: "html",
      label: "HTML / Site statique",
      icon: "🌐",
      code: iframeCode,
    },
    {
      id: "wordpress",
      label: "WordPress",
      icon: "🔵",
      code: `<!-- Dans un bloc HTML personnalisé ou widget texte -->
${iframeCode}`,
    },
    {
      id: "moodle",
      label: "Moodle",
      icon: "🎓",
      code: `<!-- Dans un bloc HTML ou une page de cours Moodle -->
<!-- Activez d'abord : Sécurité > Balises HTML autorisées -->
${iframeCode}`,
    },
    {
      id: "notion",
      label: "Notion",
      icon: "⬛",
      code: `/* Notion ne supporte pas les iframes directement.
   Utilisez un service comme notion.so/embed ou
   copiez simplement le lien direct dans un bloc /embed */

${generatedUrl}`,
    },
    {
      id: "react",
      label: "React",
      icon: "⚛️",
      code: `// Dans votre composant React
export default function MonPage() {
  return (
    <iframe
      src="${generatedUrl}"
      width="100%"
      height="600px"
      style={{ border: "none" }}
      title="Emploi du temps"
    />
  );
}`,
    },
    {
      id: "vue",
      label: "Vue.js",
      icon: "💚",
      code: `<!-- Dans votre template Vue -->
<template>
  <iframe
    src="${generatedUrl}"
    width="100%"
    height="600px"
    style="border:none"
    title="Emploi du temps"
  />
</template>`,
    },
  ];

  // Section active des exemples
  const [plateformeActive, setPlateformeActive] = useState("html");
  const exempleActif = plateformes.find((p) => p.id === plateformeActive);

  // Rendu
  return (
    <div className="docs-root">
      {/* ── NAV ── */}
      <nav className="docs-nav">
        <div className="docs-nav-brand">
          <span className="docs-nav-logo">📅</span>
          <span>Kalendar</span>
          <span className="docs-nav-badge">docs</span>
        </div>
        <a href="/" className="docs-nav-link">← Retour au calendrier</a>
      </nav>

      <div className="docs-layout">
        {/* ── SIDEBAR ── */}
        <aside className="docs-sidebar">
          <ul>
            <li><a href="#builder">Widget Builder</a></li>
            <li><a href="#preview">Prévisualisation</a></li>
            <li><a href="#exemples">Exemples d'intégration</a></li>
            <li><a href="#params">Paramètres URL</a></li>
          </ul>
        </aside>

        {/* ── CONTENU ── */}
        <main className="docs-main">
          <header className="docs-hero">
            <h1>Documentation Kalendar</h1>
            <p>
              Intégrez un emploi du temps Google Calendar dans n'importe quel site ou CMS,
              sans backend, sans inscription — juste une URL ou un <code>&lt;iframe&gt;</code>.
            </p>
          </header>

          {/*
              SECTION 1 — WIDGET BUILDER
          */}
          <section id="builder" className="docs-section">
            <h2>Widget Builder</h2>
            <p>Configurez votre widget et obtenez instantanément l'URL et le code iframe.</p>

            <div className="builder-grid">
              {/* ── Colonne gauche : formulaire ── */}
              <div className="builder-form">

                <BuilderSection titre="Calendrier">
                  <BuilderChamp label="ID du calendrier Google" aide="Laissez vide pour le calendrier par défaut">
                    <input
                      type="text"
                      placeholder="ex: ecole@group.calendar.google.com"
                      value={calId}
                      onChange={(e) => setCalId(e.target.value)}
                      className="b-input"
                    />
                  </BuilderChamp>
                  <BuilderChamp label="Filtrer par groupe">
                    <input
                      type="text"
                      placeholder="ex: H1, Master2"
                      value={show}
                      onChange={(e) => setShow(e.target.value)}
                      className="b-input"
                    />
                  </BuilderChamp>
                  <BuilderChamp label="Titre personnalisé">
                    <input
                      type="text"
                      placeholder="ex: Emploi du temps L1 Info"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="b-input"
                    />
                  </BuilderChamp>
                </BuilderSection>

                <BuilderSection titre="Affichage">
                  <div className="b-row">
                    <BuilderChamp label="Thème">
                      <select value={theme} onChange={(e) => setTheme(e.target.value)} className="b-input b-select">
                        <option value="light">Clair</option>
                        <option value="dark">Sombre</option>
                      </select>
                    </BuilderChamp>
                    <BuilderChamp label="Langue">
                      <select value={lang} onChange={(e) => setLang(e.target.value)} className="b-input b-select">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="mg">Malagasy</option>
                      </select>
                    </BuilderChamp>
                  </div>
                  <div className="b-row">
                    <BuilderChamp label="Début">
                      <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} className="b-input b-time" />
                    </BuilderChamp>
                    <BuilderChamp label="Fin">
                      <input type="time" value={to} onChange={(e) => setTo(e.target.value)} className="b-input b-time" />
                    </BuilderChamp>
                  </div>
                  <BuilderChamp label="Jours à masquer">
                    <div className="b-days">
                      {JOURS_NOMS.map((nom, i) => (
                        <label key={i} className="b-day-label">
                          <input type="checkbox" checked={joursCoches[i]} onChange={() => toggleJour(i)} />
                          {nom}
                        </label>
                      ))}
                    </div>
                  </BuilderChamp>
                  <label className="b-checkbox-label">
                    <input type="checkbox" checked={hideBuilder} onChange={(e) => setHideBuilder(e.target.checked)} />
                    Masquer le bouton Widget Builder (recommandé pour iframe)
                  </label>
                </BuilderSection>

                <BuilderSection titre="Couleurs">
                  <p className="b-hint">Cochez pour activer la surcharge. Sans coche = valeur du thème.</p>
                  {[
                    { label: "Bandeau des jours (--cal-primary)", actif: activerPrimary, toggle: () => setActiverPrimary(!activerPrimary), couleur: primaryColor, set: setPrimaryColor },
                    { label: "Fond général (--cal-bg)", actif: activerBg, toggle: () => setActiverBg(!activerBg), couleur: bgColor, set: setBgColor },
                    { label: "Colonne des heures (--cal-accent)", actif: activerAccent, toggle: () => setActiverAccent(!activerAccent), couleur: accentColor, set: setAccentColor },
                    { label: "Texte bandeau (--cal-text)", actif: activerText, toggle: () => setActiverText(!activerText), couleur: textColor, set: setTextColor },
                  ].map(({ label, actif, toggle, couleur, set }) => (
                    <LigneCouleur key={label} label={label} active={actif} onToggle={toggle} couleur={couleur} onChangeCouleur={set} />
                  ))}
                  <label className="b-checkbox-label" style={{ marginTop: "10px" }}>
                    <input type="checkbox" checked={activerFont} onChange={() => setActiverFont(!activerFont)} />
                    Police d'écriture (--cal-font)
                  </label>
                  {activerFont && (
                    <input
                      type="text"
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      placeholder="ex: Roboto, Open Sans, Georgia"
                      className="b-input"
                      style={{ marginTop: "6px" }}
                    />
                  )}
                </BuilderSection>

                <BuilderSection titre="CSS externe (avancé)">
                  <BuilderChamp label="URL de votre fichier CSS" aide="Doit commencer par https://. Surcharge toutes les variables.">
                    <input
                      type="url"
                      placeholder="https://monsite.com/calendrier.css"
                      value={cssUrl}
                      onChange={(e) => setCssUrl(e.target.value)}
                      className="b-input"
                    />
                  </BuilderChamp>
                  {cssUrl.startsWith("https://") && (
                    <div className="b-code-hint">
                      <strong>Contenu suggéré pour votre fichier CSS&nbsp;:</strong>
                      <pre>{`.app-container {
                        --cal-primary:  #votre-couleur;
                        --cal-bg:       #votre-couleur;
                        --cal-accent:   #votre-couleur;
                        --cal-text:     #votre-couleur;
                        --cal-font:     'Votre Police', sans-serif;
                        }`}</pre>
                    </div>
                  )}
                </BuilderSection>

                {/* Résultat */}
                <div className="b-result">
                  <div className="b-result-row">
                    <span className="b-result-label">Lien direct</span>
                    <button onClick={() => copier(generatedUrl, "url")} className={`b-copy-btn ${copiedId === "url" ? "copied" : ""}`}>
                      {copiedId === "url" ? "✓ Copié !" : "Copier"}
                    </button>
                  </div>
                  <input type="text" readOnly value={generatedUrl} className="b-readonly" onClick={(e) => e.target.select()} />

                  <div className="b-result-row" style={{ marginTop: "14px" }}>
                    <span className="b-result-label">Code iframe</span>
                    <button onClick={() => copier(iframeCode, "iframe")} className={`b-copy-btn ${copiedId === "iframe" ? "copied" : ""}`}>
                      {copiedId === "iframe" ? "✓ Copié !" : "Copier"}
                    </button>
                  </div>
                  <textarea readOnly value={iframeCode} className="b-textarea" onClick={(e) => e.target.select()} />
                </div>
              </div>

              {/* Colonne droite : aperçu live */}
              <div className="builder-preview" id="preview">
                <div className="preview-header">
                  <span className="preview-dot red" />
                  <span className="preview-dot yellow" />
                  <span className="preview-dot green" />
                  <span className="preview-label">Aperçu live</span>
                </div>
                <div className="preview-url-bar">{generatedUrl}</div>
                <div className="preview-frame-wrapper">
                  <iframe
                    key={generatedUrl}
                    src={generatedUrl}
                    title="Aperçu du widget"
                    className="preview-iframe"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
                <p className="preview-note">
                  L'aperçu se met à jour à chaque modification. Le calendrier chargé est le vrai calendrier configuré dans <code>calendarConfig.js</code>.
                </p>
              </div>
            </div>
          </section>

          {/*
              SECTION 2 — EXEMPLES D'INTÉGRATION
           */}
          <section id="exemples" className="docs-section">
            <h2>Exemples d'intégration</h2>
            <p>Le code ci-dessous utilise l'URL générée dans le builder ci-dessus.</p>

            <div className="exemples-tabs">
              {plateformes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlateformeActive(p.id)}
                  className={`tab-btn ${plateformeActive === p.id ? "active" : ""}`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {exempleActif && (
              <div className="exemple-block">
                <div className="exemple-header">
                  <span>{exempleActif.icon} {exempleActif.label}</span>
                  <button
                    onClick={() => copier(exempleActif.code, exempleActif.id)}
                    className={`b-copy-btn ${copiedId === exempleActif.id ? "copied" : ""}`}
                  >
                    {copiedId === exempleActif.id ? "✓ Copié !" : "Copier"}
                  </button>
                </div>
                <pre className="exemple-code"><code>{exempleActif.code}</code></pre>
                {exempleActif.id === "notion" && (
                  <p className="exemple-note">
                    💡 Dans Notion : tapez <code>/embed</code>, collez l'URL, et Notion crée automatiquement un bloc intégré.
                  </p>
                )}
                {exempleActif.id === "moodle" && (
                  <p className="exemple-note">
                    💡 Dans Moodle : allez dans <strong>Administration → Sécurité → Politiques de sécurité du site</strong> et ajoutez votre domaine à la liste des iframes autorisées.
                  </p>
                )}
                {exempleActif.id === "wordpress" && (
                  <p className="exemple-note">
                    💡 Dans WordPress : utilisez un bloc <strong>HTML personnalisé</strong> (éditeur Gutenberg) ou un widget <strong>Texte</strong> (éditeur classique).
                  </p>
                )}
              </div>
            )}
          </section>

          {/* 
              SECTION 3 — TABLEAU DES PARAMÈTRES
           */}
          <section id="params" className="docs-section">
            <h2>Paramètres URL</h2>
            <p>
              Tous les paramètres sont optionnels. Ils se combinent librement dans l'URL.
              Exemple&nbsp;: <code>/?theme=dark&amp;lang=en&amp;from=08:00&amp;hiddenDays=0,6</code>
            </p>

            <div className="params-table-wrapper">
              <table className="params-table">
                <thead>
                  <tr>
                    <th>Paramètre</th>
                    <th>Type / Valeurs</th>
                    <th>Défaut</th>
                    <th>Exemple</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {URL_PARAMS.map((row) => (
                    <tr key={row.param}>
                      <td><code className="param-name">{row.param}</code></td>
                      <td><code className="param-type">{row.type}</code></td>
                      <td><span className="param-default">{row.defaut}</span></td>
                      <td><code className="param-exemple">{row.exemple}</code></td>
                      <td>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="params-tip">
              <strong>⚠️ Couleurs dans l'URL</strong> — Le caractère <code>#</code> est réservé en URL.
              Il doit être encodé en <code>%23</code>. Exemple&nbsp;: <code>#0099ff</code> → <code>%230099ff</code>.
              Le Widget Builder gère cet encodage automatiquement.
            </div>
          </section>

          {/*
              FOOTER
          */}
          <footer className="docs-footer">
            <p>
              Kalendar — projet open source par{" "}
              <a href="https://github.com/NajoroRabiaza" target="_blank" rel="noreferrer">NajoroRabiaza</a>.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Sous-composants builder
function BuilderSection({ titre, children }) {
  return (
    <div className="b-section">
      <h3 className="b-section-title">{titre}</h3>
      {children}
    </div>
  );
}

function BuilderChamp({ label, aide, children }) {
  return (
    <div className="b-champ">
      <label className="b-label">{label}</label>
      {aide && <p className="b-aide">{aide}</p>}
      {children}
    </div>
  );
}

function LigneCouleur({ label, active, onToggle, couleur, onChangeCouleur }) {
  return (
    <label className="b-couleur-ligne">
      <input type="checkbox" checked={active} onChange={onToggle} />
      <span className="b-couleur-label">{label}</span>
      <input
        type="color"
        value={couleur}
        onChange={(e) => onChangeCouleur(e.target.value)}
        disabled={!active}
        className="b-color-input"
        style={{ opacity: active ? 1 : 0.35, cursor: active ? "pointer" : "not-allowed" }}
      />
      <span className="b-color-hex">{active ? couleur : "défaut"}</span>
    </label>
  );
}