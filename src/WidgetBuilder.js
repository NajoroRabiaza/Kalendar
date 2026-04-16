import React, { useState } from "react";

export default function WidgetBuilder({ onClose }) {
  const [calId, setCalId] = useState("");
  const [color1, setColor1] = useState("");
  const [color2, setColor2] = useState("");
  
  // On récupère l'URL de base du site actuel (ex: localhost:3000 ou ton-site.vercel.app)
  const baseUrl = window.location.origin;

  // Construction dynamique de l'URL magique
  let generatedUrl = `${baseUrl}/?`;
  if (calId) generatedUrl += `calId=${encodeURIComponent(calId)}&`;
  if (color1) generatedUrl += `color1=${encodeURIComponent(color1)}&`;
  if (color2) generatedUrl += `color2=${encodeURIComponent(color2)}&`;
  
  // Nettoyage du dernier "&" ou "?"
  generatedUrl = generatedUrl.replace(/[&?]$/, "");

  const iframeCode = `<iframe src="${generatedUrl}" width="100%" height="600px" style="border:none; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></iframe>`;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>✖ Fermer</button>
        <h2 style={{ marginTop: 0 }}>🛠 Générateur de Widget</h2>
        <p>Remplissez les champs ci-dessous pour générer votre emploi du temps personnalisé.</p>

        <div style={styles.formGroup}>
          <label><strong>ID du Calendrier Google :</strong></label>
          <input 
            type="text" 
            placeholder="ex: ecole@group.calendar.google.com" 
            value={calId} 
            onChange={(e) => setCalId(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label><strong>Nom du Groupe (Couleur 1 - Bleu) :</strong></label>
          <input 
            type="text" 
            placeholder="ex: Licence 1" 
            value={color1} 
            onChange={(e) => setColor1(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label><strong>Nom du Groupe (Couleur 2 - Orange) :</strong></label>
          <input 
            type="text" 
            placeholder="ex: Master 2" 
            value={color2} 
            onChange={(e) => setColor2(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.resultBox}>
          <h3>Votre lien direct :</h3>
          <input type="text" readOnly value={generatedUrl} style={styles.readOnlyInput} />
          
          <h3>Code à intégrer (Iframe) :</h3>
          <textarea readOnly value={iframeCode} style={styles.textarea} />
        </div>
      </div>
    </div>
  );
}

// Quelques styles intégrés
const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999,
    display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"
  },
  modal: {
    backgroundColor: "white", padding: "30px", borderRadius: "12px",
    width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto",
    position: "relative", color: "#333"
  },
  closeButton: {
    position: "absolute", top: "20px", right: "20px",
    background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#888"
  },
  formGroup: { marginBottom: "15px", display: "flex", flexDirection: "column", gap: "5px" },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" },
  resultBox: { marginTop: "25px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" },
  readOnlyInput: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#e9ecef", boxSizing: "border-box" },
  textarea: { width: "100%", height: "80px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#e9ecef", resize: "none", boxSizing: "border-box" }
};