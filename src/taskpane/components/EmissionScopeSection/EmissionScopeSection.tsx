// Copyright IBM Corp. 2026

import { Text } from "@fluentui/react-components";
import { EmissionFormulaItem } from "./EmissionFormulaItem";
import { EmissionScopeSectionProps } from "./types";

export function EmissionScopeSection({
  icon,
  title,
  formulas,
}: Readonly<EmissionScopeSectionProps>) {
  return (
    <div className="emission-scope">
      <div className="scope-header">
        {icon}
        <Text size={400} weight="semibold">
          {title}
        </Text>
      </div>
      {formulas.map((formula, index) => (
        <div key={`${formula.category}-${index}`}>
          <EmissionFormulaItem formula={formula} />
          <div className="formula-divider" />
        </div>
      ))}
    </div>
  );
}
