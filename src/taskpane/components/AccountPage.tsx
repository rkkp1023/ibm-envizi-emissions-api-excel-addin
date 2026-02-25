/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { Button, Field, Input } from "@fluentui/react-components";
import React from "react";

import { ApiCredentials } from "../../common/credentials";
import { getOverviewDashboardUrl } from "../../common/env";
import { useAccountSubscription, useAuth, useUserInfo } from "../hooks";
import { subscriptionTypeKeyMap } from "../types/product-subscriptions.types";

function UserInfoDisplay() {
  const { data: userInfo, isLoading } = useUserInfo();
  const { isLoading: isLoadingSubscription, data: subscriptionData } = useAccountSubscription();
  const subscriptionType = subscriptionData?.subscriptionType;

  if (isLoading && isLoadingSubscription) {
    return (
      <div className="credentials-section">
        <p>Loading user information...</p>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <form className="form">
      <div className="form-grid">
        <Field label="Name">
          <Input type="text" appearance="underline" value={userInfo.fullName || ""} readOnly />
        </Field>
        <Field label="Username">
          <Input appearance="underline" value={userInfo.email || ""} readOnly />
        </Field>
        <Field label="Account type">
          <Input
            appearance="underline"
            value={subscriptionTypeKeyMap[subscriptionType] || ""}
            readOnly
          />
        </Field>
      </div>
    </form>
  );
}

function ApiCredentialsForm() {
  const { state } = useAuth();
  const credentials = state.credentials as ApiCredentials;

  return (
    <form className="form">
      <div className="form-grid">
        <Field label="API key">
          <Input type="password" appearance="underline" value={credentials.apiKey || ""} readOnly />
        </Field>
        <Field label="Tenant ID">
          <Input appearance="underline" value={credentials.tenantId || ""} readOnly />
        </Field>
        <Field label="Organization ID">
          <Input appearance="underline" value={credentials.orgId || ""} readOnly />
        </Field>
      </div>
    </form>
  );
}

export const AccountPage: React.FC = () => {
  const { state, logout } = useAuth();
  const overviewDashboardUrl = getOverviewDashboardUrl();

  const handleViewDashboard = () => {
    window.open(overviewDashboardUrl, "_blank", "noopener");
  };

  return (
    <div className="account-panel">
      {state.credentials["apiKey"] ? <ApiCredentialsForm /> : <UserInfoDisplay />}
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
