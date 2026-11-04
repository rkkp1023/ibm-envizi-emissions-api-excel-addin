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

export interface ScopeSectionLink {
  text: string;
  href: string;
  icon?: React.ComponentType;
}

export interface EmissionScopeSectionProps {
  icon: React.ReactNode;
  title: string;
  formulas: EmissionFormula[];
  isFirst?: boolean;
  link?: ScopeSectionLink;
}

export interface EmissionFormulaItemProps {
  formula: EmissionFormula;
}

export interface EmissionScopeConfig {
  title: string;
  formulas: EmissionFormula[];
  iconName?: string;
  link?: ScopeSectionLink;
}
