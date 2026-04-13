// Copyright IBM Corp. 2026

import { Text, makeStyles, tokens } from "@fluentui/react-components";
import { EmissionFormulaItem } from "./EmissionFormulaItem";
import { EmissionScopeSectionProps } from "./types";

const useStyles = makeStyles({
  emissionScope: {
    paddingBlockEnd: tokens.spacingVerticalM,
  },
  firstEmissionScope: {
    paddingBlockStart: tokens.spacingVerticalM,
  },
  scopeHeader: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  formulaDivider: {
    height: "1px",
    backgroundColor: tokens.colorNeutralStroke2,
  },
});

export function EmissionScopeSection({
  icon,
  title,
  formulas,
  isFirst = false,
}: Readonly<EmissionScopeSectionProps>) {
  const styles = useStyles();

  return (
    <div className={`${styles.emissionScope} ${isFirst ? styles.firstEmissionScope : ""}`}>
      <div className={styles.scopeHeader} data-testid="scope-header">
        {icon}
        <Text size={400} weight="semibold">
          {title}
        </Text>
      </div>
      {formulas.map((formula, index) => (
        <div key={`${formula.category}-${index}`}>
          <EmissionFormulaItem formula={formula} />
          <div className={styles.formulaDivider} data-testid="formula-divider" />
        </div>
      ))}
    </div>
  );
}
