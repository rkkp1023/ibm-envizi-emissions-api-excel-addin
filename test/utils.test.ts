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
    it("should extract unit symbol from display format", () => {
      expect(extractSymbolFromDisplay("kilogram (kg)")).toBe("kg");
      expect(extractSymbolFromDisplay("gram (g)")).toBe("g");
      expect(extractSymbolFromDisplay("metric ton (t)")).toBe("t");
      expect(extractSymbolFromDisplay("pound (lb)")).toBe("lb");
      expect(extractSymbolFromDisplay("thousand pounds (thousand lb)")).toBe("thousand lb");
      expect(extractSymbolFromDisplay("million pounds (million lb)")).toBe("million lb");
      expect(extractSymbolFromDisplay("short ton (st)")).toBe("st");
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
    it("should extract country alpha3 from display format", () => {
      expect(extractSymbolFromDisplay("United States (USA)")).toBe("USA");
      expect(extractSymbolFromDisplay("Canada (CAN)")).toBe("CAN");
      expect(extractSymbolFromDisplay("United Kingdom (GBR)")).toBe("GBR");
      expect(extractSymbolFromDisplay("Australia (AUS)")).toBe("AUS");
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
      expect(extractSymbolFromDisplay("  kilogram (kg)  ")).toBe("kg");
      expect(extractSymbolFromDisplay("  kg  ")).toBe("kg");
    });

    it("should handle strings with multiple parentheses (extracts last one)", () => {
      expect(extractSymbolFromDisplay("Some (text) with (kg)")).toBe("kg");
    });

    it("should handle strings without parentheses", () => {
      expect(extractSymbolFromDisplay("kilogram")).toBe("kilogram");
      expect(extractSymbolFromDisplay("United States")).toBe("United States");
    });

    it("should trim extracted symbols", () => {
      expect(extractSymbolFromDisplay("kilogram ( kg )")).toBe("kg");
      expect(extractSymbolFromDisplay("United States ( USA )")).toBe("USA");
    });
  });
});
