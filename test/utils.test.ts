// Copyright IBM Corp. 2025, 2026

import { convertExcelDateToISO, extractSymbolFromDisplay, extractValueAfterDash } from "../src/functions/utils";

describe("utils", () => {
  describe("extractSymbolFromDisplay", () => {
    it("should extract symbol from 'Symbol (Name)' format", () => {
      expect(extractSymbolFromDisplay("kg (kilogram)")).toBe("kg");
      expect(extractSymbolFromDisplay("USA (United States)")).toBe("USA");
      expect(extractSymbolFromDisplay("L (liter)")).toBe("L");
    });

    it("should handle backward compatibility - return as-is when no parentheses", () => {
      expect(extractSymbolFromDisplay("kg")).toBe("kg");
      expect(extractSymbolFromDisplay("USA")).toBe("USA");
      expect(extractSymbolFromDisplay("simple text")).toBe("simple text");
    });

    it("should handle whitespace correctly", () => {
      expect(extractSymbolFromDisplay("  kg (kilogram)  ")).toBe("kg");
      expect(extractSymbolFromDisplay("kg  (kilogram)")).toBe("kg");
      expect(extractSymbolFromDisplay("  kg  ")).toBe("kg");
    });

    it("should handle edge cases", () => {
      expect(extractSymbolFromDisplay("")).toBe("");
      expect(extractSymbolFromDisplay("   ")).toBe("");
      expect(extractSymbolFromDisplay(undefined)).toBe(undefined);
    });

    it("should handle invalid parentheses patterns", () => {
      expect(extractSymbolFromDisplay("(no symbol)")).toBe("(no symbol)");
      expect(extractSymbolFromDisplay("symbol (")).toBe("symbol (");
      expect(extractSymbolFromDisplay("symbol )")).toBe("symbol )");
      expect(extractSymbolFromDisplay("symbol ) (")).toBe("symbol ) (");
    });

    it("should handle nested parentheses", () => {
      expect(extractSymbolFromDisplay("kg (kilogram (metric))")).toBe("kg");
    });

    it("should handle non-string inputs", () => {
      expect(extractSymbolFromDisplay(null as any)).toBe(null);
      expect(extractSymbolFromDisplay(123 as any)).toBe(123);
      expect(extractSymbolFromDisplay({} as any)).toEqual({});
    });

    it("should extract symbol with special characters", () => {
      expect(extractSymbolFromDisplay("CO2 (Carbon Dioxide)")).toBe("CO2");
      expect(extractSymbolFromDisplay("m³ (cubic meter)")).toBe("m³");
    });
  });

  describe("extractValueAfterDash", () => {
    it("should extract value after dash from 'Code - Value' format", () => {
      expect(extractValueAfterDash("USA - California")).toBe("California");
      expect(extractValueAfterDash("USA - WECC")).toBe("WECC");
      expect(extractValueAfterDash("CAN - Ontario")).toBe("Ontario");
    });

    it("should handle backward compatibility - return as-is when no dash", () => {
      expect(extractValueAfterDash("California")).toBe("California");
      expect(extractValueAfterDash("WECC")).toBe("WECC");
      expect(extractValueAfterDash("simple text")).toBe("simple text");
    });

    it("should handle whitespace correctly", () => {
      expect(extractValueAfterDash("  USA - California  ")).toBe("California");
      expect(extractValueAfterDash("USA  -  California")).toBe("California");
      expect(extractValueAfterDash("  California  ")).toBe("California");
    });

    it("should handle edge cases", () => {
      expect(extractValueAfterDash("")).toBe("");
      expect(extractValueAfterDash("   ")).toBe("");
      expect(extractValueAfterDash(undefined)).toBe(undefined);
    });

    it("should handle invalid dash patterns", () => {
      expect(extractValueAfterDash(" - ")).toBe("-");
      expect(extractValueAfterDash("USA -")).toBe("USA -");
      expect(extractValueAfterDash("- California")).toBe("- California");
    });

    it("should handle multiple dashes - extract after first", () => {
      expect(extractValueAfterDash("USA - CA - Los Angeles")).toBe("CA - Los Angeles");
    });

    it("should handle non-string inputs", () => {
      expect(extractValueAfterDash(null as any)).toBe(null);
      expect(extractValueAfterDash(123 as any)).toBe(123);
      expect(extractValueAfterDash({} as any)).toEqual({});
    });

    it("should handle dash without spaces", () => {
      expect(extractValueAfterDash("USA-California")).toBe("USA-California");
    });

    it("should extract value with special characters", () => {
      expect(extractValueAfterDash("USA - New York (NY)")).toBe("New York (NY)");
    });
  });

  describe("convertExcelDateToISO", () => {
    it("should return ISO date as-is", () => {
      expect(convertExcelDateToISO("2024-01-15")).toBe("2024-01-15");
      expect(convertExcelDateToISO("2025-12-31")).toBe("2025-12-31");
      expect(convertExcelDateToISO("2023-06-01")).toBe("2023-06-01");
    });

    it("should convert Excel serial date to ISO format", () => {
      // Excel serial 44562 = 2022-01-01
      expect(convertExcelDateToISO("44562")).toBe("2022-01-01");
      // Excel serial 45000 = 2023-03-15 (actual conversion)
      expect(convertExcelDateToISO("45000")).toBe("2023-03-15");
    });

    it("should handle Excel serial dates with decimals", () => {
      // Should round to nearest day
      expect(convertExcelDateToISO("44562.5")).toBe("2022-01-01");
      expect(convertExcelDateToISO("44562.9")).toBe("2022-01-01");
    });

    it("should handle whitespace in input", () => {
      expect(convertExcelDateToISO("  2024-01-15  ")).toBe("2024-01-15");
      expect(convertExcelDateToISO("  44562  ")).toBe("2022-01-01");
    });

    it("should throw error for invalid inputs", () => {
      expect(() => convertExcelDateToISO("invalid")).toThrow("Date should be in YYYY-MM-DD format");
      expect(() => convertExcelDateToISO("not-a-date")).toThrow("Date should be in YYYY-MM-DD format");
      expect(() => convertExcelDateToISO("")).toThrow("Date should be in YYYY-MM-DD format");
    });

    it("should throw error for small numbers (< 20000)", () => {
      // Small numbers are not Excel dates
      expect(() => convertExcelDateToISO("100")).toThrow("Date should be in YYYY-MM-DD format");
      expect(() => convertExcelDateToISO("1000")).toThrow("Date should be in YYYY-MM-DD format");
      expect(() => convertExcelDateToISO("19999")).toThrow("Date should be in YYYY-MM-DD format");
    });

    it("should handle edge case dates", () => {
      // Excel serial 25569 = 1970-01-01 (Unix epoch)
      expect(convertExcelDateToISO("25569")).toBe("1970-01-01");
    });

    it("should handle large Excel serial dates", () => {
      // Excel serial 50000 = 2036-11-21 (actual conversion)
      expect(convertExcelDateToISO("50000")).toBe("2036-11-21");
    });

    it("should throw error for non-numeric strings", () => {
      expect(() => convertExcelDateToISO("abc123")).toThrow("Date should be in YYYY-MM-DD format. Invalid date format provided");
      expect(() => convertExcelDateToISO("12-34-5678")).toThrow("Date should be in YYYY-MM-DD format. Invalid date format provided");
      expect(() => convertExcelDateToISO("2024/01/15")).toThrow("Date should be in YYYY-MM-DD format. Invalid date format provided");
    });

    it("should throw error for empty or whitespace-only strings", () => {
      expect(() => convertExcelDateToISO("")).toThrow("Date should be in YYYY-MM-DD format");
      expect(() => convertExcelDateToISO("   ")).toThrow("Date should be in YYYY-MM-DD format");
      expect(() => convertExcelDateToISO("\t\n")).toThrow("Date should be in YYYY-MM-DD format");
    });
  });
});

// Made with Bob
