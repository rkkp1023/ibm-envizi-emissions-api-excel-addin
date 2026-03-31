/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";

import { CoreToken } from "../../common/credentials";
import { SubscriptionType } from "../types/product-subscriptions.types";
import { useAuth } from "./useAuth";

const subscriptionTypes: Record<string, SubscriptionType | Record<string, SubscriptionType>> = {
  EMISSIONS_TRIAL: "trial", // Preview
  EMISSIONS_TRIAL_GA: "trial", // GA trial
  EMISSIONS_FREE: "basic",
  D11IQZX: "marketplace",
  D09SJZX: {
    standard: "basic",
    premium: "premium",
  },
};

export interface AccountSubscriptionData {
  organizationId: string;
  subscriptionType: SubscriptionType;
  totalApiCalls: number;
  billingCycleMonths: number;
  partNumber: string;
  ssmCreationDate: string;
  ssmExpirationDate: string;
  edition: string;
}

export async function getAccountSubscriptionData(
  token: string,
  tenantId: string,
  orgId: string
): Promise<AccountSubscriptionData> {
  const headers = {
    Authorization: `Bearer ${token}`,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "X-IBM-Client-Id": `saascore-${tenantId}`,
  };
  const response = await axios.get<AccountSubscriptionData>(
    `https://api.ibm.com/saascore/run/rolodex-registration/na/api/v1/organizations/${orgId}/ghgapiallotment`,
    { headers }
  );
  let subscriptionType = subscriptionTypes[response.data.partNumber];
  if (typeof subscriptionType === "object") {
    subscriptionType =
      subscriptionType[response.data.edition || "standard"] || Object.values(subscriptionType)[0];
  }
  return { ...response.data, subscriptionType };
}

export function useAccountSubscription() {
  const { state } = useAuth();

  // Decode coreToken and extract properties
  const coreTokenData = useMemo(() => {
    if (!state.isAuthenticated || !state.credentials || !("coreToken" in state.credentials)) {
      return null;
    }

    const userCredentials = state.credentials;
    const coreToken = userCredentials.coreToken;

    if (!coreToken) {
      return null;
    }

    try {
      const decoded = jwtDecode<CoreToken & { organizationId?: string; [key: string]: any }>(
        coreToken
      );

      return {
        token: coreToken,
        tenantId: decoded.tenantId,
        orgId: decoded.organizationId,
      };
    } catch (error) {
      console.error("Failed to decode coreToken:", error);
      return null;
    }
  }, [state.isAuthenticated, state.credentials]);

  const token = coreTokenData?.token ?? null;
  const tenantId = coreTokenData?.tenantId ?? null;
  const orgId = coreTokenData?.orgId ?? null;

  return useQuery({
    queryKey: ["account-subscription", token],
    queryFn: () => getAccountSubscriptionData(token, tenantId, orgId),
    enabled: !!token && !!tenantId && !!orgId,
    staleTime: Infinity,
  });
}
