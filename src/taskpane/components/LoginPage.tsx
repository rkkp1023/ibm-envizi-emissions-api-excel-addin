/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Button, Checkbox, Field, Input, Link } from "@fluentui/react-components";
import { useState } from "react";

import { getOverviewDashboardUrl } from "../../common/env";
import { useAuth } from "../hooks/useAuth";

function EnviziLogin() {
  const { displayLogin } = useAuth();

  return (
    <div className="page login-page" id="login-page">
      <div className="login-header">
        <h2 className="ms-font-xl">Log in</h2>
        <p style={{ textAlign: "center" }}>Log in to perform emissions calculations.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Button type="submit" appearance="primary" onClick={() => displayLogin()}>
          Log in
        </Button>
      </div>
    </div>
  );
}

function ApiLogin() {
  const { login, error, isLoading, clearError } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [orgId, setOrgId] = useState("");
  const [saveCredentials, setSaveCredentials] = useState(true);
  const overviewDashboardUrl = getOverviewDashboardUrl();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    try {
      await login({ apiKey, tenantId, orgId }, saveCredentials);
    } catch (err) {
      // Error is handled by the context
    }
  };

  return (
    <div className="page login-page" id="login-page">
      <div className="login-header">
        <h2 className="ms-font-xl">Account credentials</h2>
        <p>
          Enter the credentials from your{" "}
          <Link href={overviewDashboardUrl} target="_blank">
            Emissions API overview dashboard.
          </Link>
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
