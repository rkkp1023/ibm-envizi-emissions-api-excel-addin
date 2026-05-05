// Copyright IBM Corp. 2026

import { Button, Field, Input, Spinner } from "@fluentui/react-components";
import { ArrowExitRegular, Open16Regular } from "@fluentui/react-icons";
import React from "react";

import { getAccountUsageUrl } from "../../../common/env";
import { useAccountSubscription, useAuth, useUserInfo } from "../../hooks";
import { subscriptionTypeKeyMap } from "../../types/product-subscriptions.types";
import { UpgradeBanner } from "../UpgradeBanner/UpgradeBanner";

function AccountInformation() {
  const { isLoading: isLoadingUser, isError: isErrorUser, data: userInfo } = useUserInfo();
  const {
    isLoading: isLoadingSubscription,
    isError: isErrorAccount,
    data: subscriptionData,
  } = useAccountSubscription();
  const subscriptionType = subscriptionData?.subscriptionType;
  const fullName = userInfo?.firstName + " " + userInfo?.lastName;

  if (isLoadingUser || isLoadingSubscription) {
    return (
      <div className="credentials-section">
        <Spinner />
      </div>
    );
  }

  if (isErrorUser || isErrorAccount) {
    return null;
  }

  return (
    <form className="form">
      <div className="form-grid">
        <Field label="Name">
          <Input type="text" appearance="underline" value={fullName || ""} readOnly />
        </Field>
        <Field label="Username">
          <Input appearance="underline" value={userInfo.email || ""} readOnly />
        </Field>
        <Field label="Subscription type">
          <Input
            appearance="underline"
            value={subscriptionTypeKeyMap[subscriptionType] || ""}
            readOnly
          />
        </Field>
        <Field label="Organization">
          <Input appearance="underline" value={userInfo.orgName || ""} readOnly />
        </Field>
      </div>
    </form>
  );
}

export const AccountTab: React.FC = () => {
  const { logout } = useAuth();
  const { data: subscriptionData } = useAccountSubscription();

  const handleViewDashboard = () => {
    window.open(getAccountUsageUrl(), "_blank", "noopener");
  };

  const shouldShowUpgradeBanner = subscriptionData?.subscriptionType !== "premium";

  return (
    <div className="account-panel">
      <AccountInformation />
      <div className="account-buttons">
        <Button
          appearance="primary"
          icon={<Open16Regular />}
          iconPosition="after"
          onClick={handleViewDashboard}
        >
          View account and usage
        </Button>
        <Button
          appearance="outline"
          icon={<ArrowExitRegular />}
          iconPosition="after"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
      {shouldShowUpgradeBanner && <UpgradeBanner />}
    </div>
  );
};
