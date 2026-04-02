// Copyright IBM Corp. 2026

export interface EmissionFormula {
  description: string;
  category?: string;
  link?: Link;
  formulaSyntax?: string;
}

export interface Link {
  title: string;
  href: string;
}

export interface EmissionScopeSectionProps {
  icon: React.ReactNode;
  title: string;
  formulas: EmissionFormula[];
}

export interface EmissionFormulaItemProps {
  formula: EmissionFormula;
}

export interface EmissionScopeConfig {
  title: string;
  formulas: EmissionFormula[];
  iconName?: string;
}
