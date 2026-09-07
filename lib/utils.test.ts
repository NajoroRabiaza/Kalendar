import { describe, it, expect } from "vitest";
import { transformEventData, formatDayHeader, JOURS } from "./utils.js";
import { DEFAULT_COLOR_MAPPING } from "./Kalendar.js";

//  Tests de transformEventData

describe("transformEventData", () => {

  describe("mapping de couleur", () => {
    it("applique la couleur du groupe correspondant au colorId", () => {
      const result = transformEventData(
        { colorId: "1", title: "Cours Algo" },
        DEFAULT_COLOR_MAPPING,
        null
      );
      expect(result.backgroundColor).toBe("#0099ff");
      expect(result.borderColor).toBe("white");
      expect(result.textColor).toBe("white");
      expect(result.groupLabel).toBe("Groupe 1");
    });

    it("utilise le fallback 'default' quand le colorId est absent", () => {
      const result = transformEventData(
        { title: "Cours sans couleur" },
        DEFAULT_COLOR_MAPPING,
        null
      );
      expect(result.backgroundColor).toBe("#333333");
      expect(result.groupLabel).toBe("General");
    });

    it("utilise le fallback 'default' quand le colorId est inconnu", () => {
      const result = transformEventData(
        { colorId: "99", title: "Cours inconnu" },
        DEFAULT_COLOR_MAPPING,
        null
      );
      expect(result.backgroundColor).toBe("#333333");
      expect(result.groupLabel).toBe("General");
    });

    it("preserve les proprietes originales de l'evenement", () => {
      const result = transformEventData(
        { colorId: "2", title: "Cours Maths", start: "2025-09-01T08:00:00" },
        DEFAULT_COLOR_MAPPING,
        null
      );
      expect(result.title).toBe("Cours Maths");
      expect(result.start).toBe("2025-09-01T08:00:00");
    });

    it("fonctionne avec un colorMapping personnalise", () => {
      const customMapping = {
        "1":       { label: "Licence 1", hex: "#b30000" },
        "default": { label: "General",   hex: "#333333" },
      };
      const result = transformEventData(
        { colorId: "1", title: "Cours L1" },
        customMapping,
        null
      );
      expect(result.backgroundColor).toBe("#b30000");
      expect(result.groupLabel).toBe("Licence 1");
    });
  });

  describe("filtrage par groupe", () => {
    it("retourne display none quand le groupe ne correspond pas au filtre", () => {
      const result = transformEventData(
        { colorId: "1", title: "Cours Groupe 1" },
        DEFAULT_COLOR_MAPPING,
        "Groupe 2"
      );
      expect(result.display).toBe("none");
    });

    it("affiche l'evenement quand le groupe correspond au filtre", () => {
      const result = transformEventData(
        { colorId: "1", title: "Cours Groupe 1" },
        DEFAULT_COLOR_MAPPING,
        "Groupe 1"
      );
      expect(result.display).toBeUndefined();
      expect(result.backgroundColor).toBe("#0099ff");
    });

    it("affiche tous les evenements quand group est null", () => {
      const result1 = transformEventData(
        { colorId: "1", title: "Cours Groupe 1" },
        DEFAULT_COLOR_MAPPING,
        null
      );
      const result2 = transformEventData(
        { colorId: "2", title: "Cours Groupe 2" },
        DEFAULT_COLOR_MAPPING,
        null
      );
      expect(result1.display).toBeUndefined();
      expect(result2.display).toBeUndefined();
    });

    it("masque l'evenement dont le groupe est inconnu quand un filtre est actif", () => {
      const result = transformEventData(
        { colorId: "99", title: "Cours inconnu" },
        DEFAULT_COLOR_MAPPING,
        "Groupe 1"
      );
      expect(result.display).toBe("none");
    });
  });
});

//  Tests de formatDayHeader

describe("formatDayHeader", () => {

  // Lundi 1 septembre 2025 — getDay() = 1
  const lundi    = new Date(2025, 8, 1);
  // Mercredi 3 septembre 2025 — getDay() = 3
  const mercredi = new Date(2025, 8, 3);
  // Dimanche 7 septembre 2025 — getDay() = 0
  const dimanche = new Date(2025, 8, 7);

  describe("langue francaise", () => {
    it("formate correctement un lundi", () => {
      expect(formatDayHeader(lundi, "fr")).toBe("lun. 1/9");
    });

    it("formate correctement un mercredi", () => {
      expect(formatDayHeader(mercredi, "fr")).toBe("mer. 3/9");
    });

    it("formate correctement un dimanche", () => {
      expect(formatDayHeader(dimanche, "fr")).toBe("dim. 7/9");
    });
  });

  describe("langue anglaise", () => {
    it("formate correctement un lundi en anglais", () => {
      expect(formatDayHeader(lundi, "en")).toBe("Mon. 1/9");
    });

    it("formate correctement un dimanche en anglais", () => {
      expect(formatDayHeader(dimanche, "en")).toBe("Sun. 7/9");
    });
  });

  describe("langue malgache", () => {
    it("formate correctement un lundi en malgache", () => {
      expect(formatDayHeader(lundi, "mg")).toBe("Alats. 1/9");
    });

    it("formate correctement un samedi en malgache", () => {
      const samedi = new Date(2025, 8, 6);
      expect(formatDayHeader(samedi, "mg")).toBe("Sab. 6/9");
    });
  });

  describe("coherence avec la constante JOURS", () => {
    it("utilise exactement les noms definis dans JOURS pour chaque langue", () => {
      const date = new Date(2025, 8, 1);
      const jour = date.getDay();
      expect(formatDayHeader(date, "fr")).toContain(JOURS["fr"][jour]);
      expect(formatDayHeader(date, "en")).toContain(JOURS["en"][jour]);
      expect(formatDayHeader(date, "mg")).toContain(JOURS["mg"][jour]);
    });
  });
});