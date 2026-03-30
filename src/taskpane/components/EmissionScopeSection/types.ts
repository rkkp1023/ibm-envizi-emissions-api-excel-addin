// Copyright IBM Corp. 2026

export interface EmissionFormula {
  category: string;
  description: string;
  formulaSyntax: string;
}

export interface EmissionScopeSectionProps {
  icon: React.ReactNode;
  title: string;
  formulas: EmissionFormula[];
}

export interface EmissionFormulaItemProps {
  formula: EmissionFormula;
}
