// Copyright IBM Corp. 2026

import { Button, Link, Text } from "@fluentui/react-components";
import { ArrowEnterRegular, Open16Regular } from "@fluentui/react-icons";

import { useAuth } from "../hooks/useAuth";

function EnviziLogin() {
  const { displayLogin, state } = useAuth();

  return (
    <div className="envizi-login-page" id="login-page">
      <div className="envizi-login-content">
        <Text className="envizi-welcome-text" as="h2">
          {state.isLoggedOut ? "You are now logged out" : "Welcome back!"}
        </Text>

        <div>
          <img
            src="assets/envizi-usecase-report-progress.png"
            alt="Envizi usecase report progress"
            className="envizi-illustration"
          />
        </div>

        <div className="envizi-login-actions">
          <Button
            appearance="primary"
            icon={<ArrowEnterRegular />}
            iconPosition="after"
            onClick={displayLogin}
            size="medium"
            className="envizi-login-button"
          >
            Login
          </Button>
        </div>

        <div className="envizi-signup-text">
          If you are not signed up yet,{" "}
          <Link
            href="https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313"
            target="_blank"
          >
            complete the sign-up form.
          </Link>
        </div>
      </div>

      <div className="envizi-footer-link">
        <Link
          href="https://www.ibm.com/docs/envizi-esg-suite?topic=api-calculating-emissions-in-microsoft-excel"
          target="_blank"
        >
          Learn about Envizi Emissions Calculations in Excel <Open16Regular />
        </Link>
      </div>
      <div className="envizi-copyright">
        <img
          src="assets/footer-icon.png"
          alt="Envizi usecase report progress"
          className="envizi-footer-image"
        />
        <span className="envizi-copyright-text">© Copyright IBM Corp. 2025, 2026</span>
      </div>
    </div>
  );
}

export function LoginPage() {
  return <EnviziLogin></EnviziLogin>;
}
