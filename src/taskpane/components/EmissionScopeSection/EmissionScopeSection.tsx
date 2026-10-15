// Copyright IBM Corp. 2026

import { makeStyles, Text, tokens } from "@fluentui/react-components";

import { EmissionFormulaItem } from "./EmissionFormulaItem";
import { EmissionScopeSectionProps } from "./types";
import { Link } from "@carbon/react";

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
  scopeLink: {
    marginBlockStart: tokens.spacingVerticalM,
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
  link,
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
      {link && (
        <div className={styles.scopeLink}>
          <Link href={link.href} target="_blank" rel="noopener noreferrer" renderIcon={link.icon}>
            {link.text}
          </Link>
        </div>
      )}
      {formulas.map((formula, index) => (
        <div key={`${formula.category}-${index}`}>
          <EmissionFormulaItem formula={formula} />
          <div className={styles.formulaDivider} data-testid="formula-divider" />
        </div>
      ))}
    </div>
  );
}
