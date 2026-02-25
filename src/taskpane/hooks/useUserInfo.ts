/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { useQuery } from "@tanstack/react-query";
import { UserCredentials } from "../../common/credentials";
import { UserInfo, UserInfoResponse } from "../types/user.types";
import { useAuth } from "./useAuth";

const userInfoQuery = `
  query User {
    me {
      tenantId
      languageCode
      timeZoneId
      contact {
        lastName
        firstName
        emailAddress
      }
    }
    user {
      associateName
      rolesMeta
    }
  }
`;

/**
 * Fetches user info from Envizi UI GraphQL API
 */
const fetchUserInfo = async (token: string): Promise<UserInfo> => {
  // TODO: Replace hardcoded endpoint with dynamic endpoint based on environment
  // const uiEndpoint = `${getApiUrl("saascore", "prod")}/ui/graphql`;
  const uiEndpoint = "https://us006t.envizi.com/graphqlapi-dev/ui/graphql";

  const response = await fetch(uiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: userInfoQuery,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  const result: UserInfoResponse = await response.json();
  const { me, user } = result.data;

  return {
    firstName: me.contact.firstName,
    lastName: me.contact.lastName,
    fullName: `${me.contact.firstName} ${me.contact.lastName}`,
    email: me.contact.emailAddress,
    orgName: user.associateName,
    orgId: me.tenantId.toString(),
    languageCode: me.languageCode,
    timeZoneId: me.timeZoneId,
  };
};

/**
 * React hook to fetch and manage user information using TanStack Query
 * Only works with UserCredentials (token-based auth)
 *
 * @returns Query result with user info data, loading state, and error
 */
export function useUserInfo() {
  const { state } = useAuth();

  const userCredentials =
    state.isAuthenticated && state.credentials && "token" in state.credentials
      ? (state.credentials as UserCredentials)
      : null;

  const token = userCredentials?.token;

  return useQuery({
    queryKey: ["userInfo", token],
    queryFn: () => fetchUserInfo(token!),
    enabled: !!token, // Only run query if token exists
    staleTime: Infinity,
  });
}
