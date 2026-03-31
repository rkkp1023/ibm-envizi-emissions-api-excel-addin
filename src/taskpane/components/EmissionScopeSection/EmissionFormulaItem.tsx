// Copyright IBM Corp. 2026

import { Link, Text } from "@fluentui/react-components";
import { EmissionFormulaItemProps } from "./types";

export function EmissionFormulaItem({ formula }: Readonly<EmissionFormulaItemProps>) {
  return (
    <div className="emission-formula-item">
      <div className="formula-category-section">
        {formula?.category && <Text weight="semibold">{formula.category}: </Text>}
        <Text>{formula.description}</Text>
      </div>
      {formula?.formulaSyntax && (
        <div className="formula-syntax">
          <code>{formula.formulaSyntax}</code>
        </div>
      )}
      {formula?.link && (
        <Link href={formula.link.href} target="_blank">
          {formula.link.title}
        </Link>
      )}
    </div>
  );
}
