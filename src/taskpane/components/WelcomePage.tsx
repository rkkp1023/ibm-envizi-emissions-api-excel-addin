/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Button } from "@fluentui/react-components";
import { displayLoginDialog } from "../auth";

interface WelcomePageProps {
  onGetStarted: () => void;
}

export function WelcomePage({ onGetStarted }: Readonly<WelcomePageProps>) {
  const handleGetStarted = () => {
    // Check if test login mode is enabled
    if (window.localStorage.getItem("testLogin") === "true") {
      displayLoginDialog();
      return;
    }
    onGetStarted();
  };

  return (
    <div id="welcome-page" className="page welcome-page">
      <header className="welcome-header">
        <img
          width="64"
          height="64"
          src="../../assets/icon-128.png"
          alt="IBM Envizi Emissions Calculations"
        />
        <h2 className="ms-font-xl">Welcome to the Envizi Emissions Calculations</h2>
      </header>
      <div className="welcome-body">
        <p className="ms-font-l">Seamlessly integrate emissions data into your workflows.</p>
        <br />
        <br />
        <p>With these APIs, you can:</p>
        <ul className="ms-List">
          <li className="ms-ListItem">Automate data integration</li>
          <li className="ms-ListItem">Access real-time emissions insights</li>
          <li className="ms-ListItem">Get auto-selected emissions factors</li>
          <li className="ms-ListItem">Export your results quickly & easily</li>
        </ul>
        <div className="welcome-bottom">
          <Button
            id="get-started-button"
            type="submit"
            appearance="primary"
            onClick={handleGetStarted}
          >
            Get started
          </Button>
        </div>
      </div>
      <div className="copyright">© Copyright IBM Corp. 2025, 2026</div>
    </div>
  );
}
