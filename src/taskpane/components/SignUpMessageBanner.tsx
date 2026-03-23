/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";

export function SignUpMessageBanner() {
  const handleExtendTrial = () => {
    window.open(
      "https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleBuyNow = () => {
    window.open(
      "https://www.ibm.com/products/envizi/emissions-calculations",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <MessageBar>
      <MessageBarBody>
        <MessageBarTitle>Great news! This add-in is now live.</MessageBarTitle>
        <p>To continue, either extend your trial or buy now to access more features.</p>
      </MessageBarBody>

      <MessageBarActions>
        <Button appearance="outline" size="medium" onClick={handleExtendTrial}>
          Extend your trial
        </Button>
        <Button appearance="outline" size="medium" onClick={handleBuyNow}>
          Buy now
        </Button>
      </MessageBarActions>
    </MessageBar>
  );
}
