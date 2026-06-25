// Copyright IBM Corp. 2026

import { Button, makeStyles, Text, tokens } from "@fluentui/react-components";
import { Open16Regular } from "@fluentui/react-icons";
import React from "react";

import { getPricingPageUrl } from "../../../common/env";

const useStyles = makeStyles({
  container: {
    position: "relative",
    marginBlockStart: tokens.spacingVerticalM,
    border: `0.5px solid #42BE65`,
  },
  backgroundOverlay: {
    "::before": {
      content: '""',
      position: "absolute",
      width: "100%",
      inset: "0",
      backgroundImage:
        'linear-gradient(to top left, white 40%, rgba(255, 255, 255, 0)), url("assets/upgrade-banner.png")',
      zIndex: 1,
      backgroundSize: "cover",
      backgroundPosition: "right",
      backgroundRepeat: "no-repeat",
      transform: "scaleX(-1)",
    },
  },
  content: {
    position: "relative",
    padding: tokens.spacingVerticalM,
    zIndex: 1,
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  titleLine: {
    backgroundColor: "#42BE65",
    color: "#ffffff",
    paddingBlock: tokens.spacingVerticalXS,
    paddingInline: tokens.spacingHorizontalS,
    width: "fit-content",
  },
  footer: {
    display: "flex",
    paddingBlockStart: tokens.spacingVerticalXXL,
  },
  description: {
    flex: 3,
    color: "black",
    paddingInline: tokens.spacingHorizontalXS,
  },
  buttonSection: {
    alignContent: "center",
  },
  button: {
    color: "black",
    ":hover": {
      color: "black",
    },
  },
});

export function UpgradeBanner(): React.ReactElement {
  const styles = useStyles();

  return (
    <div className={`${styles.container} ${styles.backgroundOverlay}`}>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <Text as="h2" weight="semibold" size={700} className={styles.titleLine}>
            Upgrade Your
          </Text>
          <Text as="h2" weight="semibold" size={700} className={styles.titleLine}>
            Plan
          </Text>
        </div>
        <div className={styles.footer}>
          <Text as="p" size={200} className={styles.description}>
            Unlock premium emission factors for comprehensive analysis and extended capabilities
          </Text>
          <div className={styles.buttonSection}>
            <Button
              appearance="outline"
              size="medium"
              icon={<Open16Regular />}
              iconPosition="after"
              as="a"
              href={getPricingPageUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.button}
            >
              Buy now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
