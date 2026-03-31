/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Button, Link } from "@fluentui/react-components";
import { ArrowRight16Filled, Open16Regular } from "@fluentui/react-icons";
import { getEnableEnviziLogin } from "../../common/env";

interface WelcomePageProps {
  onGetStarted: () => void;
}

export function WelcomePage({ onGetStarted }: Readonly<WelcomePageProps>) {
  const formId = getEnableEnviziLogin() ? "urx-54313" : "urx-53999";
  const signupUrl = `https://www.ibm.com/account/reg/signup?formid=${formId}`;

  return (
    <div id="welcome-page" className="page welcome-page">
      <header className="welcome-header">
        <img
          width="64"
          height="64"
          src="assets/icon-128.png"
          alt="IBM Envizi Emissions Calculations"
        />
        <h2 className="ms-font-xl">Welcome to Envizi Emissions Calculations</h2>
        <h3 className="ms-font-l">Seamlessly integrate emissions data into your workflows.</h3>
      </header>
      <div className="welcome-body">
        <p>This add-in has the following benefits:</p>
        <ul className="ms-List">
          <li className="ms-ListItem">Apply GHG Protocol‑aligned templates</li>
          <li className="ms-ListItem">Calculate Scope 1, 2, or 3 emissions</li>
          <li className="ms-ListItem">Use auto-selected emissions factors</li>
          <li className="ms-ListItem">Reduce manual errors and improve accuracy</li>
        </ul>

        <Button
          as="a"
          iconPosition="after"
          icon={<Open16Regular />}
          href="https://www.ibm.com/docs/envizi-esg-suite?topic=api-calculating-emissions-in-microsoft-excel"
          rel="noopener noreferrer"
          target="_blank"
        >
          Learn more
        </Button>
        <div className="welcome-bottom">
          <Button
            id="get-started-button"
            type="submit"
            appearance="primary"
            iconPosition="after"
            icon={<ArrowRight16Filled />}
            onClick={onGetStarted}
          >
            Get started
          </Button>
          <span>
            If you are not signed up yet,{" "}
            <Link href={signupUrl} target="_blank">
              complete the sign-up form
            </Link>
            .
          </span>
        </div>
      </div>
      <div className="copyright">© Copyright IBM Corp. 2025, 2026</div>
    </div>
  );
}
