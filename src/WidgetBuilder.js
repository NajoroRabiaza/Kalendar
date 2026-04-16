import React, { useState } from "react";
//  WidgetBuilder.js
//  Interface de génération du widget avec tous les paramètres,
//  y compris la personnalisation des couleurs (Point 4).

export default function WidgetBuilder({ onClose }) {

  // Calendrier
  const [calId,setCalId]= useState("");
  const [show,setShow]= useState("");
  const [title,setTitle]= useState("");

  // Affichage
  const [theme,setTheme]= useState("light");
  const [lang,setLang]= useState("fr");
  const [from,setFrom]= useState("07:00");
  const [to,setTo]= useState("18:00");
  const [hideBuilder, setHideBuilder] = useState(true);

  const joursNoms = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
  const [joursCoches, setJoursCoches] = useState([false, false, false, false, false, false, false]);

  // Surcharges noms groupes
  const [color1, setColor1] = useState("");
  const [color2, setColor2] = useState("");
  const [color3, setColor3] = useState("");


  //  POINT 4 — Couleurs personnalisées
  //  On stocke les couleurs comme hex (#aabbcc).
  //  L'input type="color" retourne toujours un hex 6 chiffres.
  //  activerX = true signifie que l'utilisateur veut
  //  surcharger cette couleur (sinon on laisse le défaut).

  const [activerPrimary,setActiverPrimary]= useState(false);
  const [activerBg,setActiverBg]= useState(false);
  const [activerAccent,setActiverAccent]= useState(false);
  const [activerText,setActiverText]= useState(false);
  const [activerFont,setActiverFont]= useState(false);

  const [primaryColor, setPrimaryColor] = useState("#a8cbff");
  const [bgColor,setBgColor]= useState("#ffffff");
  const [accentColor,setAccentColor]= useState("#eef4ff");
  const [textColor,setTextColor]= useState("#004085");
  const [fontFamily,setFontFamily]= useState("Arial");
 
  // POINT 4 — CSS externe
  const [cssUrl, setCssUrl] = useState("");


  //  CONSTRUCTION DE L'URL
  const baseUrl = window.location.origin;
  const params  = new URLSearchParams();

  if (calId) params.set("calId", calId);
  if (show) params.set("show", show);
  if (title) params.set("title", title);
  if (theme !== "light") params.set("theme", theme);
  if (lang !== "fr") params.set("lang", lang);
  if (from !== "07:00") params.set("from", from);
  if (to !== "18:00") params.set("to", to);

  const joursCaches = joursCoches.map((c, i) => c ? i : null).filter(i => i !== null);
  if (joursCaches.length > 0) params.set("hiddenDays", joursCaches.join(","));
  if (hideBuilder) params.set("hideBuilder", "true");

  if (color1) params.set("color1", color1);
  if (color2) params.set("color2", color2);
  if (color3) params.set("color3", color3);


  //  POINT 4 — On ajoute les couleurs si elles sont actives.
  //  Le # dans les couleurs hex doit être encodé en %23.
  //  encodeURIComponent("#a8cbff") → "%23a8cbff"
  //  URLSearchParams.set() fait cet encodage automatiquement.
  if (activerPrimary) params.set("primaryColor", primaryColor);
  if (activerBg)      params.set("bgColor",      bgColor);
  if (activerAccent)  params.set("accentColor",  accentColor);
  if (activerText)    params.set("textColor",    textColor);
  if (activerFont && fontFamily) params.set("fontFamily", fontFamily);
  if (cssUrl && cssUrl.startsWith("https://")) params.set("cssUrl", cssUrl);

  const queryString  = params.toString();
  const generatedUrl = queryString ? `${baseUrl}/?${queryString}` : baseUrl;
  const iframeCode   = `<iframe\n  src="${generatedUrl}"\n  width="100%"\n  height="600px"\n  style="border:none;"\n  title="Emploi du temps"\n></iframe>`;

  
  //  Helpers UI
  const toggleJour = (i) => {
    const j = [...joursCoches];
    j[i] = !j[i];
    setJoursCoches(j);
  };

  const copier = (texte, id) => {
    navigator.clipboard.writeText(texte).then(() => {
      const btn = document.getElementById(id);
      if (btn) {
        const original = btn.textContent;
        btn.textContent = "Copie !";
        setTimeout(() => { btn.textContent = original; }, 2000);
      }
    });
  };

  
  //  RENDU
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>Fermer</button>
        <h2 style={{ marginTop: 0 }}>Generateur de Widget</h2>
        <p style={{ color: "#666", marginTop: "-10px", fontSize: "13px" }}>
          Configurez et copiez le code iframe a integrer dans votre site.
        </p>

        {/* ---- Calendrier ---- */}
        <Section titre="Calendrier">
          <Champ label="ID du calendrier Google" aide="Laissez vide pour le calendrier par defaut">
            <input type="text" placeholder="ex: ecole@group.calendar.google.com"
              value={calId} onChange={e => setCalId(e.target.value)} style={styles.input} />
          </Champ>
          <Champ label="Filtrer par groupe">
            <input type="text" placeholder="ex: H1, Master2"
              value={show} onChange={e => setShow(e.target.value)} style={styles.input} />
          </Champ>
          <Champ label="Titre personnalise">
            <input type="text" placeholder="ex: Emploi du temps L1 Info"
              value={title} onChange={e => setTitle(e.target.value)} style={styles.input} />
          </Champ>
        </Section>

        {/* Affichage */}
        <Section titre="Affichage">
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <Champ label="Theme">
              <select value={theme} onChange={e => setTheme(e.target.value)} style={{ ...styles.input, width: "140px" }}>
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </Champ>
            <Champ label="Langue">
              <select value={lang} onChange={e => setLang(e.target.value)} style={{ ...styles.input, width: "140px" }}>
                <option value="fr">Francais</option>
                <option value="en">English</option>
                <option value="mg">Malagasy</option>
              </select>
            </Champ>
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <Champ label="Debut">
              <input type="time" value={from} onChange={e => setFrom(e.target.value)} style={{ ...styles.input, width: "130px" }} />
            </Champ>
            <Champ label="Fin">
              <input type="time" value={to} onChange={e => setTo(e.target.value)} style={{ ...styles.input, width: "130px" }} />
            </Champ>
          </div>
          <Champ label="Jours a masquer">
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {joursNoms.map((nom, i) => (
                <label key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", fontSize: "12px", cursor: "pointer" }}>
                  <input type="checkbox" checked={joursCoches[i]} onChange={() => toggleJour(i)} />
                  {nom}
                </label>
              ))}
            </div>
          </Champ>
          <Champ label="Bouton Widget Builder">
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
              <input type="checkbox" checked={hideBuilder} onChange={e => setHideBuilder(e.target.checked)} />
              Masquer dans le widget (recommande pour iframe)
            </label>
          </Champ>
        </Section>

        {/*
            POINT 4 — Personnalisation des couleurs
            Chaque ligne a une case a cocher qui active la surcharge.
            Si la case est non cochee, le param n'est pas ajoute a l'URL
            et le calendrier garde sa couleur par defaut du theme choisi.
          */}
        <Section titre="Personnalisation des couleurs">
          <p style={{ margin: "0 0 12px", color: "#888", fontSize: "12px" }}>
            Cochez une couleur pour la personnaliser. Sans coche, le theme par defaut s'applique.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <LigneCouleur
              label="Bandeau des jours (--cal-primary)"
              active={activerPrimary}
              onToggle={() => setActiverPrimary(!activerPrimary)}
              couleur={primaryColor}
              onChangeCouleur={setPrimaryColor}
            />
            <LigneCouleur
              label="Fond general (--cal-bg)"
              active={activerBg}
              onToggle={() => setActiverBg(!activerBg)}
              couleur={bgColor}
              onChangeCouleur={setBgColor}
            />
            <LigneCouleur
              label="Colonne des heures (--cal-accent)"
              active={activerAccent}
              onToggle={() => setActiverAccent(!activerAccent)}
              couleur={accentColor}
              onChangeCouleur={setAccentColor}
            />
            <LigneCouleur
              label="Texte bandeau (--cal-text)"
              active={activerText}
              onToggle={() => setActiverText(!activerText)}
              couleur={textColor}
              onChangeCouleur={setTextColor}
            />
          </div>

          <div style={{ marginTop: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
              <input type="checkbox" checked={activerFont} onChange={() => setActiverFont(!activerFont)} />
              <strong>Police d'ecriture (--cal-font)</strong>
            </label>
            {activerFont && (
              <input
                type="text"
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                placeholder="ex: Roboto, Open Sans, Georgia"
                style={{ ...styles.input, marginTop: "8px" }}
              />
            )}
          </div>
        </Section>

        {/* CSS externe (Point 4 avance) */}
        <Section titre="Feuille CSS externe (avance)">
          <Champ
            label="URL de votre fichier CSS"
            aide="Doit commencer par https://. Surcharge toutes les variables ci-dessus."
          >
            <input
              type="url"
              placeholder="https://monsite.com/mon-calendrier.css"
              value={cssUrl}
              onChange={e => setCssUrl(e.target.value)}
              style={styles.input}
            />
          </Champ>
          {/* Apercu du contenu CSS a ecrire pour les integrateurs */}
          {cssUrl.startsWith("https://") && (
            <div style={styles.codeHint}>
              <strong>Contenu suggere pour votre fichier CSS :</strong>
              <pre style={{ margin: "8px 0 0", fontSize: "11px", whiteSpace: "pre-wrap" }}>{
                `.app-container {
                  --cal-primary:  #votre-couleur;
                  --cal-bg:       #votre-couleur;
                  --cal-accent:   #votre-couleur;
                  --cal-text:     #votre-couleur;
                  --cal-font:     'Votre Police', sans-serif;
                }`
              }</pre>
            </div>
          )}
        </Section>

        {/* Noms des groupes */}
        <Section titre="Noms des groupes (optionnel)">
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Champ label="Couleur 1 (bleu)">
              <input type="text" placeholder="ex: Licence 1" value={color1} onChange={e => setColor1(e.target.value)} style={{ ...styles.input, width: "140px" }} />
            </Champ>
            <Champ label="Couleur 2 (sage)">
              <input type="text" placeholder="ex: Master 2" value={color2} onChange={e => setColor2(e.target.value)} style={{ ...styles.input, width: "140px" }} />
            </Champ>
            <Champ label="Couleur 3 (gris)">
              <input type="text" placeholder="ex: Soir" value={color3} onChange={e => setColor3(e.target.value)} style={{ ...styles.input, width: "140px" }} />
            </Champ>
          </div>
        </Section>

        {/* Resultat */}
        <div style={styles.resultBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "14px" }}>Lien direct</h3>
            <button id="btn-url" onClick={() => copier(generatedUrl, "btn-url")} style={styles.copyBtn}>Copier</button>
          </div>
          <input type="text" readOnly value={generatedUrl} style={styles.readOnlyInput} onClick={e => e.target.select()} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
            <h3 style={{ margin: 0, fontSize: "14px" }}>Code iframe</h3>
            <button id="btn-iframe" onClick={() => copier(iframeCode, "btn-iframe")} style={styles.copyBtn}>Copier</button>
          </div>
          <textarea readOnly value={iframeCode} style={styles.textarea} onClick={e => e.target.select()} />
        </div>

      </div>
    </div>
  );
}


//  Composant : une ligne de sélection de couleur
//  case a cocher + label + input[type=color]
function LigneCouleur({ label, active, onToggle, couleur, onChangeCouleur }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
      <input type="checkbox" checked={active} onChange={onToggle} />
      <span style={{ flex: 1 }}>{label}</span>
      {/* input type="color" : selecteur de couleur natif du navigateur */}
      <input
        type="color"
        value={couleur}
        onChange={e => onChangeCouleur(e.target.value)}
        disabled={!active}
        style={{
          width: "36px", height: "36px", padding: "2px",
          border: "1px solid #ccc", borderRadius: "6px", cursor: active ? "pointer" : "not-allowed",
          opacity: active ? 1 : 0.4,
        }}
      />
      {/* Affiche la valeur hex a cote */}
      <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#666", minWidth: "70px" }}>
        {active ? couleur : "defaut"}
      </span>
    </label>
  );
}


//  Composants structurels
function Section({ titre, children }) {
  return (
    <div style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
      <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: "#333" }}>{titre}</h3>
      {children}
    </div>
  );
}

function Champ({ label, aide, children }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ display: "block", fontWeight: "bold", fontSize: "13px", marginBottom: "4px" }}>{label}</label>
      {aide && <p style={{ margin: "0 0 4px", color: "#999", fontSize: "11px" }}>{aide}</p>}
      {children}
    </div>
  );
}


//  Styles
const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999,
    display: "flex", justifyContent: "center", alignItems: "center", padding: "20px",
  },
  modal: {
    backgroundColor: "white", padding: "30px", borderRadius: "12px",
    width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto",
    position: "relative", color: "#333",
  },
  closeButton: {
    position: "absolute", top: "20px", right: "20px",
    background: "none", border: "1px solid #ccc", borderRadius: "6px",
    padding: "4px 10px", fontSize: "13px", cursor: "pointer", color: "#666",
  },
  input: {
    padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc",
    fontSize: "13px", width: "100%", boxSizing: "border-box",
  },
  resultBox: {
    marginTop: "20px", padding: "20px", backgroundColor: "#f8f9fa",
    borderRadius: "8px", border: "1px solid #e9ecef",
  },
  readOnlyInput: {
    width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc",
    backgroundColor: "#e9ecef", boxSizing: "border-box", fontSize: "12px",
    cursor: "pointer", marginTop: "8px",
  },
  textarea: {
    width: "100%", height: "90px", padding: "10px", borderRadius: "6px",
    border: "1px solid #ccc", backgroundColor: "#e9ecef", resize: "none",
    boxSizing: "border-box", fontSize: "11px", fontFamily: "monospace",
    cursor: "pointer", marginTop: "8px",
  },
  copyBtn: {
    padding: "5px 12px", backgroundColor: "#000", color: "white",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
  },
  codeHint: {
    marginTop: "10px", padding: "12px", backgroundColor: "#f0f4ff",
    borderRadius: "6px", border: "1px solid #c0d0ff", fontSize: "12px",
  },
};