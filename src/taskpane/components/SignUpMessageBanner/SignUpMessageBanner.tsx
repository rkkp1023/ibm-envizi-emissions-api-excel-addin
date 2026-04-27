// Copyright IBM Corp. 2026

import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
} from "@fluentui/react-components";
import { getBuyNowUrl } from "../../../common/env";

export function SignUpMessageBanner() {
  return (
    <MessageBar layout="multiline">
      <MessageBarBody>
        <MessageBarTitle>Great news! This add-in is now live.</MessageBarTitle>
        <p>To continue, either extend your trial or buy now to access more features.</p>
      </MessageBarBody>

      <MessageBarActions>
        <Button
          appearance="outline"
          size="medium"
          as="a"
          href="https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313"
          target="_blank"
          rel="noopener noreferrer"
        >
          Extend your trial
        </Button>
        <Button
          appearance="outline"
          size="medium"
          as="a"
          href={getBuyNowUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy now
        </Button>
      </MessageBarActions>
    </MessageBar>
  );
}
