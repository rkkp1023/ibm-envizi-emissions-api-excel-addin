// Copyright IBM Corp. 2026

import { CoreEnviziAuth } from "./coreEnviziAuth";
import { EnviziUiGraphQL } from "./enviziUiGraphQL";
import { IDaaSApi } from "./IDaaSApi";

// ── Shared axios mock ────────────────────────────────────────────────────────
const mockAxiosGet = jest.fn();
const mockAxiosPost = jest.fn();
jest.mock("axios", () => ({
  get: (...args: any[]) => mockAxiosGet(...args),
  post: (...args: any[]) => mockAxiosPost(...args),
}));

// ── Shared env mock ──────────────────────────────────────────────────────────
const MOCK_TOKEN_EXCHANGE_URL = "https://mock.exchange/envizi-auth/exchange";
const MOCK_CLIENT_ID = "mock-client-id-1234";
const MOCK_GRAPHQL_BASE = "https://mock.envizi.com/graphqlapi-uxm";

jest.mock("../common/env", () => ({
  getEnviziTokenExchangeConfig: () => ({
    tokenExchangeUrl: MOCK_TOKEN_EXCHANGE_URL,
    enviziTokenExchangeClientId: MOCK_CLIENT_ID,
  }),
  getEnviziGraphQLUrl: () => MOCK_GRAPHQL_BASE,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ── IDaaSApi ─────────────────────────────────────────────────────────────────
describe("IDaaSApi", () => {
  const api = new IDaaSApi();

  describe("getUserStatus", () => {
    it("should call GET on the correct IDaaS URL with withCredentials", async () => {
      mockAxiosGet.mockResolvedValue({ data: { isFederated: true, realmName: "realm", uniqueSecurityName: "usn", user: "u" } });

      await api.getUserStatus();

      expect(mockAxiosGet).toHaveBeenCalledWith(
        "https://login.ibm.com/v1/mgmt/idaas/user/status/",
        { withCredentials: true }
      );
    });

    it("should return response.data on success", async () => {
      const mockData = {
        isFederated: false,
        realmName: "testRealm",
        uniqueSecurityName: "testUSN",
        user: "testUser",
      };
      mockAxiosGet.mockResolvedValue({ data: mockData });

      const result = await api.getUserStatus();

      expect(result).toEqual(mockData);
    });

    it("should log to console.error and rethrow on failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const networkError = new Error("Network failure");
      mockAxiosGet.mockRejectedValue(networkError);

      await expect(api.getUserStatus()).rejects.toThrow("Network failure");
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch user status:", "Network failure");

      consoleSpy.mockRestore();
    });
  });
});

// ── CoreEnviziAuth ────────────────────────────────────────────────────────────
describe("CoreEnviziAuth", () => {
  const auth = new CoreEnviziAuth();
  const TEST_TOKEN = "test-bearer-token";

  describe("exchangeToken", () => {
    it("should POST to the token exchange URL with the correct headers", async () => {
      mockAxiosPost.mockResolvedValue({ data: "exchanged-envizi-token" });

      await auth.exchangeToken(TEST_TOKEN);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        MOCK_TOKEN_EXCHANGE_URL,
        null,
        expect.objectContaining({
          headers: {
            authorization: `Bearer ${TEST_TOKEN}`,
            "x-ibm-client-id": MOCK_CLIENT_ID,
          },
        })
      );
    });

    it("should pass null as the request body with responseType 'text'", async () => {
      mockAxiosPost.mockResolvedValue({ data: "exchanged-envizi-token" });

      await auth.exchangeToken(TEST_TOKEN);

      const [_url, body, config] = mockAxiosPost.mock.calls[0];
      expect(body).toBeNull();
      expect(config.responseType).toBe("text");
    });

    it("should return the text response from axios", async () => {
      const exchangedToken = "envizi-jwt-xyz";
      mockAxiosPost.mockResolvedValue({ data: exchangedToken });

      const result = await auth.exchangeToken(TEST_TOKEN);

      expect(result).toBe(exchangedToken);
    });

    it("should propagate errors without catching them", async () => {
      const axiosError = new Error("Token exchange failed");
      mockAxiosPost.mockRejectedValue(axiosError);

      await expect(auth.exchangeToken(TEST_TOKEN)).rejects.toThrow("Token exchange failed");
    });
  });
});

// ── EnviziUiGraphQL ───────────────────────────────────────────────────────────
describe("EnviziUiGraphQL", () => {
  const client = new EnviziUiGraphQL();
  const TEST_TOKEN = "envizi-bearer-token";
  const GRAPHQL_URL = `${MOCK_GRAPHQL_BASE}/ui/graphql`;

  describe("request", () => {
    it("should POST to the correct GraphQL URL", async () => {
      mockAxiosPost.mockResolvedValue({ data: { data: {} } });

      await client.request({ token: TEST_TOKEN, query: "{ someQuery }" });

      expect(mockAxiosPost).toHaveBeenCalledWith(
        GRAPHQL_URL,
        expect.any(Object),
        expect.any(Object)
      );
    });

    it("should include correct Content-Type and Authorization headers", async () => {
      mockAxiosPost.mockResolvedValue({ data: { data: {} } });

      await client.request({ token: TEST_TOKEN, query: "{ someQuery }" });

      const [_url, _body, config] = mockAxiosPost.mock.calls[0];
      expect(config.headers).toEqual({
        "Content-Type": "application/json",
        Authorization: `Bearer ${TEST_TOKEN}`,
      });
    });

    it("should return response.data as-is", async () => {
      const mockResponseData = { data: { someField: "someValue" } };
      mockAxiosPost.mockResolvedValue({ data: mockResponseData });

      const result = await client.request({ token: TEST_TOKEN, query: "{ someQuery }" });

      expect(result).toEqual(mockResponseData);
    });

    it("should propagate errors without catching them", async () => {
      mockAxiosPost.mockRejectedValue(new Error("GraphQL connection error"));

      await expect(
        client.request({ token: TEST_TOKEN, query: "{ someQuery }" })
      ).rejects.toThrow("GraphQL connection error");
    });
  });

  describe("renewToken", () => {
    const REFRESH_TOKEN = "refresh-token-abc";

    it("should call request with a mutation string containing the refreshToken", async () => {
      const mockResponse = {
        data: { renewToken: { token: "new-token", refreshToken: "new-refresh" } },
      };
      mockAxiosPost.mockResolvedValue({ data: mockResponse });

      await client.renewToken({ token: TEST_TOKEN, refreshToken: REFRESH_TOKEN });

      const [_url, body] = mockAxiosPost.mock.calls[0];
      expect(body.query).toContain("mutation RenewToken");
      expect(body.query).toContain("renewToken");
      expect(body.query).toContain(REFRESH_TOKEN);
    });

    it("should return the GraphQL response with token and refreshToken", async () => {
      const mockResponse = {
        data: { renewToken: { token: "new-token", refreshToken: "new-refresh-token" } },
      };
      mockAxiosPost.mockResolvedValue({ data: mockResponse });

      const result = await client.renewToken({ token: TEST_TOKEN, refreshToken: REFRESH_TOKEN });

      expect(result).toEqual(mockResponse);
      expect(result.data.renewToken.token).toBe("new-token");
      expect(result.data.renewToken.refreshToken).toBe("new-refresh-token");
    });
  });
});
