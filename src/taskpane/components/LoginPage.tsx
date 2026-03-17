/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Button, Checkbox, Field, Input, Link, Text } from "@fluentui/react-components";
import { ArrowEnterRegular, Open16Regular } from "@fluentui/react-icons";
import { useState } from "react";

import { getOverviewDashboardUrl } from "../../common/env";
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

function ApiLogin() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [orgId, setOrgId] = useState("");
  const [saveCredentials, setSaveCredentials] = useState(true);
  const overviewDashboardUrl = getOverviewDashboardUrl();

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ apiKey, tenantId, orgId }, saveCredentials);
    } catch (error) {
      setError(error.message || "Login failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="page login-page" id="login-page">
      <div className="login-header">
        <h2 className="ms-font-xl">Account credentials</h2>
        <p>
          Enter the credentials from your{" "}
          <Link href={overviewDashboardUrl} target="_blank">
            Emissions API overview dashboard
          </Link>
          .
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <Field label="API key" required>
            <Input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field label="Tenant ID" required>
            <Input
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Field label="Organization ID" required>
            <Input
              value={orgId}
              onChange={(event) => setOrgId(event.target.value)}
              disabled={isLoading}
            />
          </Field>
          <Checkbox
            checked={saveCredentials}
            onChange={(event, data) => setSaveCredentials(!!data.checked)}
            label="Save credentials"
            disabled={isLoading}
          />

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" appearance="primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function LoginPage() {
  const { enableEnviziLogin } = useAuth();

  return enableEnviziLogin ? <EnviziLogin></EnviziLogin> : <ApiLogin></ApiLogin>;
}
