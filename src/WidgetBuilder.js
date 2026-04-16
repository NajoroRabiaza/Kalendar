import React, { useState } from "react";

//  WidgetBuilder.js
//  Interface qui permet de générer un lien ou un code iframe
//  personnalisé avec TOUS les paramètres URL supportés.
//
//  Chaque champ correspond à un paramètre URL documenté
//  dans getUrlParams.js

export default function WidgetBuilder({ onClose }) {

  // Paramètres de configuration
  const [calId,       setCalId]       = useState("");
  const [show,        setShow]        = useState("");
  const [title,       setTitle]       = useState("");

  // Apparence
  const [theme,       setTheme]       = useState("light");
  const [lang,        setLang]        = useState("fr");

  // Plage horaire
  const [from,        setFrom]        = useState("07:00");
  const [to,          setTo]          = useState("18:00");

  // Jours cachés (cases à cocher)
  // On stocke un tableau de booléens : index 0=dim ... 6=sam
  const joursNoms = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
  const [joursCoches, setJoursCoches] = useState([false, false, false, false, false, false, false]);

  // Options iframe
  const [hideBuilder, setHideBuilder] = useState(true);

  // Surcharges de noms de groupes
  const [color1, setColor1] = useState("");
  const [color2, setColor2] = useState("");
  const [color3, setColor3] = useState("");

  //
  //  CONSTRUCTION DE L'URL
  //  On ajoute chaque paramètre seulement s'il a une valeur.
  //  On utilise URLSearchParams pour un encodage propre.
  //
  const baseUrl = window.location.origin;
  const params  = new URLSearchParams();

  if (calId)        params.set("calId",  calId);
  if (show)         params.set("show",   show);
  if (title)        params.set("title",  title);
  if (theme !== "light") params.set("theme", theme);   // "light" est le défaut, inutile de le mettre
  if (lang  !== "fr")    params.set("lang",  lang);    // "fr" est le défaut

  // Plage horaire : on ne met que si différent des défauts
  if (from !== "07:00")  params.set("from", from);
  if (to   !== "18:00")  params.set("to",   to);

  // Jours cachés : on construit "0,6" à partir des cases cochées
  const joursCaches = joursCoches
    .map((coche, i) => (coche ? i : null))
    .filter(i => i !== null);
  if (joursCaches.length > 0) params.set("hiddenDays", joursCaches.join(","));

  // hideBuilder : on met "true" seulement si activé
  if (hideBuilder) params.set("hideBuilder", "true");

  // Surcharges de groupes
  if (color1) params.set("color1", color1);
  if (color2) params.set("color2", color2);
  if (color3) params.set("color3", color3);

  // URL finale et code iframe
  const queryString   = params.toString();
  const generatedUrl  = queryString ? `${baseUrl}/?${queryString}` : baseUrl;
  const iframeCode    = `<iframe\n  src="${generatedUrl}"\n  width="100%"\n  height="600px"\n  style="border:none; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"\n  title="Emploi du temps"\n></iframe>`;

  //  Gestion des cases à cocher des jours
  const toggleJour = (index) => {
    const newJours = [...joursCoches];
    newJours[index] = !newJours[index];
    setJoursCoches(newJours);
  };

  //  Copier dans le presse-papiers
  const copier = (texte, boutonId) => {
    navigator.clipboard.writeText(texte).then(() => {
      const btn = document.getElementById(boutonId);
      if (btn) {
        btn.textContent = "✅ Copié !";
        setTimeout(() => { btn.textContent = "📋 Copier"; }, 2000);
      }
    });
  };

  //  RENDU
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>✖ Fermer</button>
        <h2 style={{ marginTop: 0 }}>🛠 Générateur de Widget</h2>
        <p style={{ color: "#666", marginTop: "-10px" }}>
          Configurez votre emploi du temps et copiez le code à intégrer.
        </p>

        {/*- Section 1 : Calendrier- */}
        <Section titre="📅 Calendrier">
          <Champ label="ID du Calendrier Google" aide="Laissez vide pour utiliser le calendrier par défaut">
            <input
              type="text"
              placeholder="ex: ecole@group.calendar.google.com"
              value={calId}
              onChange={(e) => setCalId(e.target.value)}
              style={styles.input}
            />
          </Champ>
          <Champ label="Filtrer par groupe" aide="Affiche uniquement ce groupe (ex: H1, Master2)">
            <input
              type="text"
              placeholder="ex: H1"
              value={show}
              onChange={(e) => setShow(e.target.value)}
              style={styles.input}
            />
          </Champ>
          <Champ label="Titre personnalisé" aide="Remplace le titre affiché dans l'en-tête">
            <input
              type="text"
              placeholder="ex: Emploi du temps L1 Info"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
          </Champ>
        </Section>

        {/*- Section 2 : Apparence- */}
        <Section titre="🎨 Apparence">
          <Champ label="Thème">
            <select value={theme} onChange={(e) => setTheme(e.target.value)} style={styles.input}>
              <option value="light">☀️ Clair</option>
              <option value="dark">🌙 Sombre</option>
            </select>
          </Champ>
          <Champ label="Langue">
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={styles.input}>
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="mg">🇲🇬 Malagasy</option>
            </select>
          </Champ>
          <Champ label="Bouton ⚙️ dans le widget">
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hideBuilder}
                onChange={(e) => setHideBuilder(e.target.checked)}
              />
              Cacher le bouton (recommandé pour iframe)
            </label>
          </Champ>
        </Section>

        {/*- Section 3 : Plage horaire- */}
        <Section titre="🕐 Plage horaire">
          <div style={{ display: "flex", gap: "15px" }}>
            <Champ label="Début">
              <input
                type="time"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                style={{ ...styles.input, width: "130px" }}
              />
            </Champ>
            <Champ label="Fin">
              <input
                type="time"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{ ...styles.input, width: "130px" }}
              />
            </Champ>
          </div>
        </Section>

        {/*- Section 4 : Jours affichés- */}
        <Section titre="📆 Jours à masquer">
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {joursNoms.map((nom, i) => (
              <label key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "12px" }}>
                <input
                  type="checkbox"
                  checked={joursCoches[i]}
                  onChange={() => toggleJour(i)}
                />
                {nom}
              </label>
            ))}
          </div>
        </Section>

        {/*- Section 5 : Noms des groupes- */}
        <Section titre="🏷️ Noms des groupes (optionnel)">
          <p style={{ margin: "0 0 10px", color: "#888", fontSize: "12px" }}>
            Surcharge les noms associés aux couleurs 1, 2, 3 de Google Calendar.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Champ label="Couleur 1 (bleu)">
              <input type="text" placeholder="ex: Licence 1" value={color1} onChange={(e) => setColor1(e.target.value)} style={{ ...styles.input, width: "140px" }} />
            </Champ>
            <Champ label="Couleur 2 (orange)">
              <input type="text" placeholder="ex: Master 2" value={color2} onChange={(e) => setColor2(e.target.value)} style={{ ...styles.input, width: "140px" }} />
            </Champ>
            <Champ label="Couleur 3 (gris)">
              <input type="text" placeholder="ex: Soir" value={color3} onChange={(e) => setColor3(e.target.value)} style={{ ...styles.input, width: "140px" }} />
            </Champ>
          </div>
        </Section>

        {/*- Résultat- */}
        <div style={styles.resultBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>🔗 Lien direct</h3>
            <button id="btn-url" onClick={() => copier(generatedUrl, "btn-url")} style={styles.copyBtn}>📋 Copier</button>
          </div>
          <input type="text" readOnly value={generatedUrl} style={styles.readOnlyInput} onClick={(e) => e.target.select()} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
            <h3 style={{ margin: 0 }}>🖥️ Code iframe</h3>
            <button id="btn-iframe" onClick={() => copier(iframeCode, "btn-iframe")} style={styles.copyBtn}>📋 Copier</button>
          </div>
          <textarea readOnly value={iframeCode} style={styles.textarea} onClick={(e) => e.target.select()} />
        </div>

      </div>
    </div>
  );
}

//  Petits composants internes pour garder le code lisible

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
      <label style={{ display: "block", fontWeight: "bold", fontSize: "13px", marginBottom: "4px" }}>
        {label}
      </label>
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
    background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#888",
  },
  input: {
    padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc",
    fontSize: "13px", width: "100%",
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
};
