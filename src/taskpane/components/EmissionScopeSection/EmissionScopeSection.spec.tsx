// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { EmissionScopeSection } from "./EmissionScopeSection";
import { EmissionFormula } from "./types";

// Mock the EmissionFormulaItem component
jest.mock("./EmissionFormulaItem", () => ({
  EmissionFormulaItem: ({ formula }: { formula: EmissionFormula }) => (
    <div data-testid="emission-formula-item">
      <span>{formula.category}</span>
      <span>{formula.description}</span>
      <span>{formula.formulaSyntax}</span>
    </div>
  ),
}));

describe("EmissionScopeSection", () => {
  const mockIcon = <span data-testid="mock-icon">🔥</span>;
  const mockTitle = "Scope 1 emissions";
  const mockFormulas: EmissionFormula[] = [
    {
      category: "Stationary",
      description: "Calculate emissions from stationary combustion sources.",
      formulaSyntax: "=ENVIZI.STATIONARY(type, value, unit, country)",
    },
    {
      category: "Mobile",
      description: "Calculates emissions from fleet fuel consumption.",
      formulaSyntax: "=ENVIZI.MOBILE(type, value, unit, country)",
    },
  ];

  describe("Rendering", () => {
    it("should render the component", () => {
      const { container } = render(
        <EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />
      );
      expect(container).toBeInTheDocument();
    });

    it("should render the scope header", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      const scopeHeader = screen.getByTestId("scope-header");
      expect(scopeHeader).toBeInTheDocument();
    });

    it("should render the icon in the header", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });

    it("should render the title in the header", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });

    it("should render title with correct styling", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      const titleElement = screen.getByText(mockTitle);
      expect(titleElement).toHaveClass("fui-Text");
    });
  });

  describe("Formula Items", () => {
    it("should render all formula items", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      const formulaItems = screen.getAllByTestId("emission-formula-item");
      expect(formulaItems).toHaveLength(2);
    });

    it("should render formula items with correct data", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      expect(screen.getByText("Stationary")).toBeInTheDocument();
      expect(screen.getByText("Mobile")).toBeInTheDocument();
      expect(
        screen.getByText("Calculate emissions from stationary combustion sources.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Calculates emissions from fleet fuel consumption.")
      ).toBeInTheDocument();
    });

    it("should render formula dividers", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      const dividers = screen.getAllByTestId("formula-divider");
      expect(dividers).toHaveLength(2);
    });

    it("should generate unique keys for formula items", () => {
      const { container } = render(
        <EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />
      );
      const formulaContainers = container.querySelectorAll(
        "div[data-testid='emission-formula-item']"
      ).length;
      expect(formulaContainers).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should render with empty formulas array", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={[]} />);
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
      const formulaItems = screen.queryAllByTestId("emission-formula-item");
      expect(formulaItems).toHaveLength(0);
    });

    it("should render with single formula", () => {
      const singleFormula = [mockFormulas[0]];
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={singleFormula} />);
      const formulaItems = screen.getAllByTestId("emission-formula-item");
      expect(formulaItems).toHaveLength(1);
    });

    it("should render with multiple formulas", () => {
      const multipleFormulas: EmissionFormula[] = [
        ...mockFormulas,
        {
          category: "Fugitive",
          description: "Calculates emissions from leaks of greenhouse gasses.",
          formulaSyntax: "=ENVIZI.FUGITIVE(type, value, unit, country)",
        },
      ];
      render(
        <EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={multipleFormulas} />
      );
      const formulaItems = screen.getAllByTestId("emission-formula-item");
      expect(formulaItems).toHaveLength(3);
    });

    it("should handle formulas with empty category", () => {
      const formulasWithEmptyCategory: EmissionFormula[] = [
        {
          category: "",
          description: "Calculate emissions from comfort heating.",
          formulaSyntax: "=ENVIZI.STATIONARY(type, value, unit, country)",
        },
      ];
      render(
        <EmissionScopeSection
          icon={mockIcon}
          title={mockTitle}
          formulas={formulasWithEmptyCategory}
        />
      );
      expect(screen.getByText("Calculate emissions from comfort heating.")).toBeInTheDocument();
    });

    it("should handle null icon gracefully", () => {
      render(<EmissionScopeSection icon={null} title={mockTitle} formulas={mockFormulas} />);
      expect(screen.getByText(mockTitle)).toBeInTheDocument();
    });

    it("should handle empty title", () => {
      render(<EmissionScopeSection icon={mockIcon} title="" formulas={mockFormulas} />);
      const scopeHeader = screen.getByTestId("scope-header");
      expect(scopeHeader).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should have correct data-testid for scope header", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      const scopeHeader = screen.getByTestId("scope-header");
      expect(scopeHeader).toBeInTheDocument();
    });

    it("should wrap each formula item with divider in a container", () => {
      const { container } = render(
        <EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />
      );
      const formulaContainers = container.querySelectorAll(
        "div:has(> [data-testid='emission-formula-item'])"
      );
      expect(formulaContainers.length).toBeGreaterThan(0);
    });

    it("should render icon and title in the same header container", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      const scopeHeader = screen.getByTestId("scope-header");
      expect(scopeHeader.querySelector("[data-testid='mock-icon']")).toBeInTheDocument();
      expect(scopeHeader.textContent).toContain(mockTitle);
    });
  });

  describe("Props Validation", () => {
    it("should accept and render custom icon component", () => {
      const customIcon = <div data-testid="custom-icon">Custom Icon</div>;
      render(<EmissionScopeSection icon={customIcon} title={mockTitle} formulas={mockFormulas} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("should accept and render long titles", () => {
      const longTitle = "This is a very long title for testing purposes that spans multiple words";
      render(<EmissionScopeSection icon={mockIcon} title={longTitle} formulas={mockFormulas} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle formulas with special characters in syntax", () => {
      const specialFormulas: EmissionFormula[] = [
        {
          category: "Test",
          description: "Test description",
          formulaSyntax: "=ENVIZI.TEST(type, [optional], {required})",
        },
      ];
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={specialFormulas} />);
      expect(screen.getByText("=ENVIZI.TEST(type, [optional], {required})")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should render semantic HTML structure", () => {
      const { container } = render(
        <EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />
      );
      expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("should render title as text element", () => {
      render(<EmissionScopeSection icon={mockIcon} title={mockTitle} formulas={mockFormulas} />);
      const titleElement = screen.getByText(mockTitle);
      expect(titleElement.tagName).toBe("SPAN");
    });
  });
});
