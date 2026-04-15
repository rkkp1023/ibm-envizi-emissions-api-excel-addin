// Copyright IBM Corp. 2026

import { Link, Text, makeStyles, tokens } from "@fluentui/react-components";
import { EmissionFormulaItemProps } from "./types";

const useStyles = makeStyles({
  emissionFormulaItem: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    paddingBlock: tokens.spacingVerticalM,
  },
  formulaCategorySection: {
    marginBlockEnd: tokens.spacingVerticalS,
  },
  formulaSyntaxCode: {
    fontSize: "14px",
    color: "#24a148",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
});

export function EmissionFormulaItem({ formula }: Readonly<EmissionFormulaItemProps>) {
  const styles = useStyles();

  return (
    <div className={styles.emissionFormulaItem} data-testid="emission-formula-item">
      <div className={styles.formulaCategorySection} data-testid="formula-category-section">
        {formula?.category && <Text weight="semibold">{formula.category}: </Text>}
        <Text>{formula.description}</Text>
      </div>
      {formula?.formulaSyntax && (
        <div data-testid="formula-syntax">
          <code className={styles.formulaSyntaxCode}>{formula.formulaSyntax}</code>
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
