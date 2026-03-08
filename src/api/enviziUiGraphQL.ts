// Copyright IBM Corp. 2026

import axios from "axios";

import { getEnviziGraphQLUrl } from "../common/env";

export interface GraphQLResponse<T> {
  data: T;
  errors?: Record<string, any>[];
}

export interface RenewTokenResponseData {
  renewToken: {
    token: string;
    refreshToken: string;
  };
}

export class EnviziUiGraphQL {
  async request<T>(options: { token: string; query: string }): Promise<T> {
    const graphqlUrl = `${getEnviziGraphQLUrl()}/ui/graphql`;
    const response = await axios.post<T>(
      graphqlUrl,
      {
        query: options.query,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.token}`,
        },
      }
    );
    return response.data;
  }

  async renewToken(options: {
    token: string;
    refreshToken: string;
  }): Promise<GraphQLResponse<RenewTokenResponseData>> {
    const renewTokenQuery = `
      mutation RenewToken {
        renewToken(
          refreshToken: "${options.refreshToken}"
        ) {
          token
          refreshToken
        }
      }
    `;
    return this.request({ token: options.token, query: renewTokenQuery });
  }
}

export const enviziUiGraphQL = new EnviziUiGraphQL();
