// Copyright IBM Corp. 2026

import { Text } from "@fluentui/react-components";
import { EmissionFormulaItemProps } from "./types";

export function EmissionFormulaItem({ formula }: Readonly<EmissionFormulaItemProps>) {
  return (
    <div className="emission-formula-item">
      <div className="formula-category-section">
        {formula?.category && <Text weight="semibold">{formula.category}: </Text>}
        <Text>{formula.description}</Text>
      </div>
      <div className="formula-syntax">
        <code>{formula.formulaSyntax}</code>
      </div>
    </div>
  );
}
