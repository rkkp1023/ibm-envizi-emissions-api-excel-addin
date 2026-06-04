// Copyright IBM Corp. 2026

import { TrialCountdown } from "@carbon-labs/react-ui-shell";
import { blue80, gray10 } from "@carbon/colors";
import { Upgrade } from "@carbon/icons-react";
import { spacing01 } from "@carbon/layout";
import { Button, Header, Theme } from "@carbon/react";
import { Spinner } from "@fluentui/react-components";
import { makeStyles } from "@griffel/react";
import { DateTime } from "luxon";

import { getEnviziApiHomeUrl } from "../../../common/env";
import { AccountSubscriptionData } from "../../hooks/useAccountSubscription";

export interface TrialCountHeaderProps {
  isLoading: boolean;
  isError: boolean;
  data?: AccountSubscriptionData;
}

const useStyles = makeStyles({
  trialHeader: {
    background: blue80,
  },
  trialCountHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: gray10,
    width: "100%",
  },
  trialCount: {
    "& span": {
      color: gray10,
      borderRadius: "4px",
      border: "1px solid transparent",
      backgroundImage: `linear-gradient(${blue80}, ${blue80}), linear-gradient(45deg, #0065FF, #B69BFD)`,
      padding: spacing01,
    },
  },
  upgradeButton: {
    color: gray10,
  },
});

export function TrialCountHeader(subscriptionInfo: Readonly<TrialCountHeaderProps>) {
  const styles = useStyles();

  const trialCount = (subscriptionData: AccountSubscriptionData | undefined) => {
    const trialExpirationDate = subscriptionData?.ssmExpirationDate;

    if (!trialExpirationDate) return 0;

    const endDate = DateTime.fromISO(trialExpirationDate, { zone: "utc" });
    const daysRemaining = Math.max(Math.ceil(endDate.diffNow("days").days), 0);

    return daysRemaining;
  };

  if (subscriptionInfo.isLoading) {
    return (
      <div className="credentials-section">
        <Spinner />
      </div>
    );
  }

  if (subscriptionInfo.isError) {
    return null;
  }

  const trialDaysRemaining = trialCount(subscriptionInfo.data);
  const accountAndUsageUrl = getEnviziApiHomeUrl() + "/account-usage";

  return (
    <Theme theme="g100">
      <Header aria-label="IBM Envizi Emissions Calculations" className={styles.trialHeader}>
        <div className={styles.trialCountHeader}>
          <Button
            kind="ghost"
            size="sm"
            href={accountAndUsageUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <TrialCountdown
              className={styles.trialCount}
              count={trialDaysRemaining}
              warning={trialDaysRemaining < 8}
              text={trialDaysRemaining === 1 ? "Trial day left" : "Trial days left"}
            ></TrialCountdown>
          </Button>

          <Button
            className={styles.upgradeButton}
            kind="ghost"
            size="sm"
            renderIcon={Upgrade}
            href="https://www.ibm.com/products/envizi/emissions-calculations"
            rel="noopener noreferrer"
            target="_blank"
          >
            Upgrade
          </Button>
        </div>
      </Header>
    </Theme>
  );
}
