/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { SubscriptionType } from "../types/product-subscriptions.types";
import { useCoreToken } from "./useCoreToken";

const subscriptionTypes = {
  EMISSIONS_TRIAL: "trial",
  EMISSIONS_FREE: "basic",
  D11IQZX: "marketplace",
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
  const subscriptionType =
    response.data.partNumber === "D09SJZX"
      ? response.data.edition
        ? "basic"
        : "premium"
      : subscriptionTypes[response.data.partNumber];
  return { ...response.data, subscriptionType };
}

export function useAccountSubscription() {
  const coreToken = useCoreToken();

  // Extract token properties
  const token = coreToken?.raw ?? null;
  const tenantId = coreToken?.tenantId ?? null;
  const orgId = (coreToken?.decoded?.organizationId as string) ?? null;

  return useQuery({
    queryKey: ["account-subscription", token],
    queryFn: () => getAccountSubscriptionData(token!, tenantId!, orgId!),
    enabled: !!token && !!tenantId && !!orgId,
    staleTime: Infinity,
  });
}
