/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { getEnviziGraphQLUrl } from "../../common/env";
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
  const graphqlUrl = `${getEnviziGraphQLUrl()}/ui/graphql`;

  const response = await axios.post<UserInfoResponse>(
    graphqlUrl,
    {
      query: userInfoQuery,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const { me, user } = response.data.data;

  return {
    firstName: me.contact.firstName,
    lastName: me.contact.lastName,
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
      ? state.credentials
      : null;

  const token = userCredentials?.token;

  return useQuery({
    queryKey: ["userInfo", token],
    queryFn: () => fetchUserInfo(token),
    enabled: !!token, // Only run query if token exists
    staleTime: Infinity,
  });
}
