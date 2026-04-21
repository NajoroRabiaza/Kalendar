import React, { useState } from "react";
//  WidgetBuilder.js
//  Interface de génération du widget avec tous les paramètres,
//  y compris la personnalisation des couleurs (Point 4)
//  et l'apercu en direct du rendu (Point 7).

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

  //  POINT 7 — APERCU EN DIRECT
  //
  //  Deux états distincts :
  //  showPreview : booleen — true = le panneau apercu est
  //   visible dans la modale.
  //
  //  previewUrl : string — l'URL figee au moment ou
  //   l'utilisateur a clique sur "Actualiser".
  //   On ne pointe PAS directement sur generatedUrl
  //   dans le src de l'iframe pour deux raisons :
  //
  //  1. Chaque frappe dans un champ recalcule generatedUrl,
  //     ce qui declencherait un rechargement complet de l'iframe
  //     a chaque caractere tape. C'est lent et perturbant.
  //
  //  2. L'utilisateur veut voir le resultat final QUAND il est
  //     pret, pas a mi-chemin de sa saisie. Le bouton
  //     "Actualiser" est l'intention explicite.
  //
  //  Quand l'utilisateur clique "Apercu en direct" ou
  //  "Actualiser l'apercu", on copie generatedUrl dans
  //  previewUrl. L'iframe recharge alors avec la nouvelle URL.
  //  On force ce rechargement via la prop key={previewUrl} :
  //  React detruit et recrée l'iframe quand la key change,
  //  garantissant un chargement propre meme si l'URL de base
  //  est identique mais les params changent.
  const [showPreview, setShowPreview]   = useState(false);
  const [previewUrl,  setPreviewUrl]    = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);


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

  //  POINT 7 — Handlers de l'apercu
  //
  //  lancerApercu : appelee au premier clic sur "Apercu en
  //  direct". Active le panneau ET charge l'URL courante.
  //
  //  actualiserApercu : appelee au clic sur "Actualiser".
  //  Copie l'URL courante dans previewUrl pour forcer le
  //  rechargement de l'iframe via changement de key.
  //
  //  fermerApercu : masque le panneau sans le detruire,
  //  ce qui permet de le rouvrir sans rechargement.
  const lancerApercu = () => {
    setPreviewUrl(generatedUrl);
    setShowPreview(true);
    setPreviewLoading(true);
  };

  const actualiserApercu = () => {
    setPreviewUrl(generatedUrl);
    setPreviewLoading(true);
  };

  const fermerApercu = () => {
    setShowPreview(false);
  };


  //  EXEMPLE D'INTEGRATION POSTMESSAGE
  const postMessageExample = `<!-- 1. L'iframe dans votre page HTML -->
<iframe
  id="mon-calendrier"
  src="${generatedUrl}"
  width="100%"
  height="600px"
  style="border:none;"
  title="Emploi du temps"
></iframe>

<script>
  // 2. Reference a l'iframe
  const iframe = document.getElementById("mon-calendrier");

  // 3. Attendre que l'iframe soit chargee avant d'envoyer des commandes
  iframe.addEventListener("load", function () {

    // Changer le groupe affiche
    iframe.contentWindow.postMessage(
      { type: "KALENDAR_CMD", action: "SET_GROUP", value: "H2" },
      "*"
    );

    // Passer en mode sombre
    iframe.contentWindow.postMessage(
      { type: "KALENDAR_CMD", action: "SET_THEME", value: "dark" },
      "*"
    );
  });

  // 4. Ecouter les confirmations du widget
  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "KALENDAR_ACK") {
      console.log("Commande executee :", event.data.action, "->", event.data.value);
    }
  });
<\/script>`;

  //  RENDU
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>Fermer</button>
        <h2 style={{ marginTop: 0 }}>Generateur de Widget</h2>
        <p style={{ color: "#666", marginTop: "-10px", fontSize: "13px" }}>
          Configurez et copiez le code iframe a integrer dans votre site.
        </p>

        {/* Calendrier */}
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

        {/* Personnalisation des couleurs */}
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

        {/* CSS externe */}
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

          {/* 
              POINT 7 — BOUTON D'APERCU EN DIRECT
              Positionne juste apres les champs de resultat.
              L'utilisateur a configure son widget et veut voir
              le rendu final avant de copier le code.
            */}
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
            {!showPreview ? (
              <button onClick={lancerApercu} style={styles.previewBtn}>
                Apercu en direct
              </button>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={actualiserApercu} style={styles.previewBtn}>
                  Actualiser l'apercu
                </button>
                <button onClick={fermerApercu} style={styles.previewBtnSecondary}>
                  Masquer l'apercu
                </button>
              </div>
            )}
          </div>
        </div>

        {/*
            POINT 7 — PANNEAU D'APERCU EN DIRECT
            Ce bloc n'est rendu que si showPreview === true.
            key={previewUrl} force la recreation de l'iframe
            a chaque clic sur Actualiser.
         */}
        {showPreview && (
          <div style={styles.previewSection}>
            <div style={styles.previewHeader}>
              <span style={{ fontWeight: "bold", fontSize: "13px", color: "#333" }}>
                Apercu en direct
              </span>
              {previewLoading && (
                <span style={styles.previewSpinner}>Chargement...</span>
              )}
              <span style={{ fontSize: "11px", color: "#999", marginLeft: "auto", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {previewUrl}
              </span>
            </div>

            <div style={styles.previewNote}>
              L'apercu reflète la configuration au moment du dernier clic sur "Apercu en direct"
              ou "Actualiser l'apercu". Modifiez les parametres ci-dessus puis cliquez Actualiser
              pour voir les changements.
            </div>

            <iframe
              key={previewUrl}
              src={previewUrl}
              title="Apercu du widget"
              style={styles.previewIframe}
              onLoad={() => setPreviewLoading(false)}
            />
          </div>
        )}

        {/* Integration avancee : postMessage */}
        <Section titre="Integration avancee : controle dynamique (postMessage)">
          <p style={{ margin: "0 0 10px", color: "#555", fontSize: "12px", lineHeight: "1.6" }}>
            Une fois l'iframe integree dans votre page, vous pouvez lui envoyer des commandes
            JavaScript sans la recharger. Copiez l'exemple ci-dessous dans votre page parente.
          </p>

          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "#333" }}>
                Exemple complet d'integration
              </span>
              <button id="btn-postmsg" onClick={() => copier(postMessageExample, "btn-postmsg")} style={styles.copyBtn}>
                Copier
              </button>
            </div>
            <textarea
              readOnly
              value={postMessageExample}
              style={{ ...styles.textarea, height: "220px" }}
              onClick={e => e.target.select()}
            />
          </div>

          <div style={{ backgroundColor: "#f0f7ff", border: "1px solid #b3d4ff", borderRadius: "6px", padding: "12px", fontSize: "11px", lineHeight: "1.7" }}>
            <strong style={{ display: "block", marginBottom: "6px", color: "#003d99" }}>
              Commandes disponibles :
            </strong>
            <code style={{ display: "block", marginBottom: "3px" }}>
              {`{ type: "KALENDAR_CMD", action: "SET_GROUP", value: "H1" }`}
            </code>
            <code style={{ display: "block", marginBottom: "3px" }}>
              {`{ type: "KALENDAR_CMD", action: "SET_THEME", value: "dark" | "light" }`}
            </code>
            <code style={{ display: "block", marginBottom: "8px" }}>
              {`{ type: "KALENDAR_CMD", action: "SET_LANG",  value: "fr" | "en" | "mg" }`}
            </code>
            <strong style={{ display: "block", marginBottom: "6px", color: "#003d99" }}>
              Confirmation recue depuis le widget (KALENDAR_ACK) :
            </strong>
            <code style={{ display: "block" }}>
              {`{ type: "KALENDAR_ACK", action, value, ok: true | false }`}
            </code>
          </div>
        </Section>

      </div>
    </div>
  );
}


//  Composant : une ligne de sélection de couleur
function LigneCouleur({ label, active, onToggle, couleur, onChangeCouleur }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
      <input type="checkbox" checked={active} onChange={onToggle} />
      <span style={{ flex: 1 }}>{label}</span>
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

  //  POINT 7 — Styles du panneau d'apercu
  previewBtn: {
    padding: "9px 20px", backgroundColor: "#111", color: "white",
    border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
    fontWeight: "bold",
  },
  previewBtnSecondary: {
    padding: "9px 20px", backgroundColor: "transparent", color: "#555",
    border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
  },
  previewSection: {
    marginTop: "20px", borderRadius: "10px",
    border: "1px solid #d0e0ff", overflow: "hidden",
    backgroundColor: "#f4f8ff",
  },
  previewHeader: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "10px 16px", borderBottom: "1px solid #d0e0ff",
    backgroundColor: "#e8f0ff",
  },
  previewSpinner: {
    fontSize: "12px", color: "#5577bb", fontStyle: "italic",
  },
  previewNote: {
    padding: "8px 16px", fontSize: "11px", color: "#778",
    borderBottom: "1px solid #d0e0ff", lineHeight: "1.5",
    backgroundColor: "#edf3ff",
  },
  previewIframe: {
    width: "100%", height: "500px", border: "none", display: "block",
  },
};