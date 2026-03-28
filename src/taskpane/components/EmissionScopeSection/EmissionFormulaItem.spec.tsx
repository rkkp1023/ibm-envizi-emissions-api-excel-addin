// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { EmissionFormulaItem } from "./EmissionFormulaItem";
import { EmissionFormula } from "./types";

describe("EmissionFormulaItem", () => {
  const mockFormula: EmissionFormula = {
    category: "Stationary",
    description: "Calculate emissions from stationary combustion sources.",
    formulaSyntax: "=ENVIZI.STATIONARY(type, value, unit, country, [stateProvince], [date])",
  };

  describe("Rendering", () => {
    it("should render the component", () => {
      const { container } = render(<EmissionFormulaItem formula={mockFormula} />);
      expect(container).toBeInTheDocument();
    });

    it("should render the emission formula item container", () => {
      const { container } = render(<EmissionFormulaItem formula={mockFormula} />);
      const formulaItem = container.querySelector(".emission-formula-item");
      expect(formulaItem).toBeInTheDocument();
    });

    it("should render the formula category section", () => {
      const { container } = render(<EmissionFormulaItem formula={mockFormula} />);
      const categorySection = container.querySelector(".formula-category-section");
      expect(categorySection).toBeInTheDocument();
    });

    it("should render the formula syntax section", () => {
      const { container } = render(<EmissionFormulaItem formula={mockFormula} />);
      const syntaxSection = container.querySelector(".formula-syntax");
      expect(syntaxSection).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle formula with all empty strings", () => {
      const emptyFormula: EmissionFormula = {
        category: "",
        description: "",
        formulaSyntax: "",
      };
      const { container } = render(<EmissionFormulaItem formula={emptyFormula} />);
      expect(container.querySelector(".emission-formula-item")).toBeInTheDocument();
    });

    it("should render when only description is provided", () => {
      const descriptionOnlyFormula: EmissionFormula = {
        category: "",
        description: "Only description provided",
        formulaSyntax: "",
      };
      render(<EmissionFormulaItem formula={descriptionOnlyFormula} />);
      expect(screen.getByText("Only description provided")).toBeInTheDocument();
    });

    it("should render when only syntax is provided", () => {
      const syntaxOnlyFormula: EmissionFormula = {
        category: "",
        description: "",
        formulaSyntax: "=ENVIZI.TEST()",
      };
      render(<EmissionFormulaItem formula={syntaxOnlyFormula} />);
      expect(screen.getByText("=ENVIZI.TEST()")).toBeInTheDocument();
    });

    it("should handle very long formula syntax", () => {
      const longSyntax =
        "=ENVIZI.VERY_LONG_FUNCTION_NAME(parameter1, parameter2, parameter3, parameter4, [optionalParameter1], [optionalParameter2], [optionalParameter3])";
      const longSyntaxFormula: EmissionFormula = {
        category: "Test",
        description: "Test",
        formulaSyntax: longSyntax,
      };
      render(<EmissionFormulaItem formula={longSyntaxFormula} />);
      expect(screen.getByText(longSyntax)).toBeInTheDocument();
    });
  });
});
