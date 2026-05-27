// Copyright IBM Corp. 2026

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";

import { CoreToken } from "../../common/credentials";
import { SubscriptionType } from "../types/product-subscriptions.types";
import { useAuth } from "./useAuth";
import { useUserInfo } from "./useUserInfo";

const subscriptionTypes: Record<string, SubscriptionType | Record<string, SubscriptionType>> = {
  EMISSIONS_TRIAL: "trial", // Preview
  EMISSIONS_TRIAL_GA: "trial", // GA trial
  EMISSIONS_FREE: "standard",
  D11IQZX: "essentials",
  D09SJZX: {
    standard: "standard",
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
  const userInfo = useUserInfo()?.data;

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
    queryFn: async () => {
      const data = await getAccountSubscriptionData(token, tenantId, orgId);
      return {
        ...data,
        ssmExpirationDate: userInfo?.effectiveTo || data.ssmExpirationDate,
      };
    },
    enabled: !!token && !!tenantId && !!orgId && !!userInfo,
    staleTime: Infinity,
  });
}
