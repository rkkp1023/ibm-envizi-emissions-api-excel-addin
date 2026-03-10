// Copyright IBM Corp. 2025
import { convertExcelDateToISO, extractSymbolFromDisplay } from "../src/functions/utils";

describe("convertExcelDateToISO", () => {
  it("returns ISO string if input is already in YYYY-MM-DD format", () => {
    expect(convertExcelDateToISO("2024-12-31")).toBe("2024-12-31");
  });

  it("converts Excel serial number to ISO date", () => {
    // Excel date 44562 → 2022-01-01
    expect(convertExcelDateToISO("44562")).toBe("2022-01-01");
  });
});

describe("extractSymbolFromDisplay", () => {
  describe("unit extraction", () => {
    it("should extract unit symbol from display format (symbol before parentheses)", () => {
      expect(extractSymbolFromDisplay("kg(kilogram)")).toBe("kg");
      expect(extractSymbolFromDisplay("g(gram)")).toBe("g");
      expect(extractSymbolFromDisplay("t(metric ton)")).toBe("t");
      expect(extractSymbolFromDisplay("lb(pound)")).toBe("lb");
      expect(extractSymbolFromDisplay("thousand lb(thousand pounds)")).toBe("thousand lb");
      expect(extractSymbolFromDisplay("million lb(million pounds)")).toBe("million lb");
      expect(extractSymbolFromDisplay("st(short ton)")).toBe("st");
    });

    it("should handle direct unit symbol input (backward compatible)", () => {
      expect(extractSymbolFromDisplay("kg")).toBe("kg");
      expect(extractSymbolFromDisplay("g")).toBe("g");
      expect(extractSymbolFromDisplay("t")).toBe("t");
      expect(extractSymbolFromDisplay("lb")).toBe("lb");
      expect(extractSymbolFromDisplay("thousand lb")).toBe("thousand lb");
    });
  });

  describe("country extraction", () => {
    it("should extract country alpha3 from display format (code before parentheses)", () => {
      expect(extractSymbolFromDisplay("USA(United States)")).toBe("USA");
      expect(extractSymbolFromDisplay("CAN(Canada)")).toBe("CAN");
      expect(extractSymbolFromDisplay("GBR(United Kingdom)")).toBe("GBR");
      expect(extractSymbolFromDisplay("AUS(Australia)")).toBe("AUS");
    });

    it("should handle direct alpha3 input (backward compatible)", () => {
      expect(extractSymbolFromDisplay("USA")).toBe("USA");
      expect(extractSymbolFromDisplay("CAN")).toBe("CAN");
      expect(extractSymbolFromDisplay("GBR")).toBe("GBR");
      expect(extractSymbolFromDisplay("AUS")).toBe("AUS");
    });
  });

  describe("edge cases", () => {
    it("should handle empty strings", () => {
      expect(extractSymbolFromDisplay("")).toBe("");
    });

    it("should handle undefined", () => {
      expect(extractSymbolFromDisplay(undefined)).toBe(undefined);
    });

    it("should handle strings with whitespace", () => {
      expect(extractSymbolFromDisplay("  kg(kilogram)  ")).toBe("kg");
      expect(extractSymbolFromDisplay("  kg  ")).toBe("kg");
    });

    it("should handle strings with multiple parentheses (extracts first symbol)", () => {
      expect(extractSymbolFromDisplay("Some(text) with (kg)")).toBe("Some");
    });

    it("should handle strings without parentheses", () => {
      expect(extractSymbolFromDisplay("kilogram")).toBe("kilogram");
      expect(extractSymbolFromDisplay("United States")).toBe("United States");
    });

    it("should trim extracted symbols", () => {
      expect(extractSymbolFromDisplay("kg ( kilogram )")).toBe("kg");
      expect(extractSymbolFromDisplay("USA ( United States )")).toBe("USA");
    });
  });
});
