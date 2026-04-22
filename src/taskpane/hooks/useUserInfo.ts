// Copyright IBM Corp. 2026

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { getEnviziGraphQLUrl } from "../../common/env";
import { UserInfo, UserInfoResponse } from "../types/user.types";
import { useAuth } from "./useAuth";

const userInfoQuery = `
query UserInfo {
  me {
    id
    tenantId
    language {
      code
    }
    timeZoneId
    contact {
      lastName
      firstName
      emailAddress
    }
    roles {
      id
      name
    }
  }
  currentAssociate {
    name
  }
}
`;

/**
 * Fetches user info from Envizi UI GraphQL API
 */
const fetchUserInfo = async (token: string): Promise<UserInfo> => {
  const graphqlUrl = `${getEnviziGraphQLUrl()}/de/graphql`;

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

  const { me, currentAssociate } = response.data.data;

  return {
    firstName: me.contact.firstName,
    lastName: me.contact.lastName,
    email: me.contact.emailAddress,
    orgName: currentAssociate.name,
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
