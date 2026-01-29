/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Button, Field, Input } from "@fluentui/react-components";
import React from "react";
import { getOverviewDashboardUrl } from "../../common/env";
import { useAuth } from "../hooks/useAuth";

export const AccountPage: React.FC = () => {
  const { credentials, logout } = useAuth();
  const overviewDashboardUrl = getOverviewDashboardUrl();

  const handleViewDashboard = () => {
    window.open(overviewDashboardUrl, "_blank", "noopener");
  };

  return (
    <div className="account-panel">
      <form className="form">
        <div className="form-grid">
          <Field label="API key">
            <Input
              type="password"
              appearance="underline"
              value={credentials?.apiKey || ""}
              readOnly
            />
          </Field>
          <Field label="Tenant ID">
            <Input appearance="underline" value={credentials?.tenantId || ""} readOnly />
          </Field>
          <Field label="Organization ID">
            <Input appearance="underline" value={credentials?.orgId || ""} readOnly />
          </Field>
        </div>
      </form>
      <div className="account-buttons">
        <Button appearance="primary" onClick={handleViewDashboard}>
          View dashboard
        </Button>
        <Button appearance="outline" onClick={logout}>
          Logout and switch accounts
        </Button>
      </div>
    </div>
  );
};
