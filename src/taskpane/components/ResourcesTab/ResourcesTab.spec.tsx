/*
 * Copyright IBM Corp. 2026
 */

import "@testing-library/jest-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import React from "react";

import { ResourcesTab } from "./ResourcesTab";

// Mock the useAccountSubscription hook
jest.mock("../../hooks/useAccountSubscription", () => ({
  useAccountSubscription: jest.fn(),
}));

// Mock the env module
jest.mock("../../../common/env", () => ({
  getEnableEnviziLogin: jest.fn(),
  getEnviziExcelAddInOverviewUrl: jest.fn(),
}));

const { useAccountSubscription } = require("../../hooks/useAccountSubscription");
const { getEnableEnviziLogin, getEnviziExcelAddInOverviewUrl } = require("../../../common/env");

describe("ResourcesTab", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
    // Default mocks
    getEnableEnviziLogin.mockReturnValue(true);
    getEnviziExcelAddInOverviewUrl.mockReturnValue(
      "https://mock-envizi-url.com/excel-add-in-overview"
    );
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("Rendering", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
    });

    it("should render without crashing", () => {
      render(<ResourcesTab />, { wrapper });
      expect(
        screen.getByText(
          /Everything that you need to get started, build, and succeed with Envizi Emissions Calculations/i
        )
      ).toBeInTheDocument();
    });

    it("should render the main description", () => {
      render(<ResourcesTab />, { wrapper });
      expect(
        screen.getByText(
          /Everything that you need to get started, build, and succeed with Envizi Emissions Calculations/i
        )
      ).toBeInTheDocument();
    });

    it("should render all four resource sections", () => {
      render(<ResourcesTab />, { wrapper });
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Documentation")).toBeInTheDocument();
      expect(screen.getByText("Community")).toBeInTheDocument();
      expect(screen.getByText("Support")).toBeInTheDocument();
    });

    it("should have correct CSS class", () => {
      const { container } = render(<ResourcesTab />, { wrapper });
      expect(container.querySelector(".resouce")).toBeInTheDocument();
    });
  });

  describe("Overview Links", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
    });

    it("should render Excel add-in overview page link", () => {
      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Excel add-in overview page/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Documentation Links", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
    });

    it("should render Excel add-in documentation link with Envizi URL when getEnableEnviziLogin is true", () => {
      getEnableEnviziLogin.mockReturnValue(true);
      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Excel add-in documentation/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://www.ibm.com/docs/envizi-esg-suite?topic=SSFJN8P/topics/c_ctr_new_emissions_excel.html"
      );
      expect(link).toHaveAttribute("target", "_blank");
      expect(getEnableEnviziLogin).toHaveBeenCalled();
    });

    it("should render Excel add-in documentation link with trial URL when getEnableEnviziLogin is false", () => {
      getEnableEnviziLogin.mockReturnValue(false);
      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Excel add-in documentation/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://www.ibm.com/docs/envizi-esg-suite?topic=api-calculating-emissions-in-microsoft-excel"
      );
      expect(link).toHaveAttribute("target", "_blank");
      expect(getEnableEnviziLogin).toHaveBeenCalled();
    });
  });

  describe("Community Links", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
      render(<ResourcesTab />, { wrapper });
    });

    it("should render IBM Envizi community link", () => {
      const link = screen.getByRole("link", { name: /IBM Envizi community/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://community.ibm.com/community/user/communities/community-home?CommunityKey=6853271a-0a5c-45f9-a9a2-0186706f68ec"
      );
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("should render IBM Envizi blog link", () => {
      const link = screen.getByRole("link", { name: /IBM Envizi blog/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://www.ibm.com/think/author/envizi");
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("should render IBM Envizi website link", () => {
      const link = screen.getByRole("link", { name: /IBM Envizi website/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://www.ibm.com/products/envizi/emissions-calculations"
      );
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Support Links", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
    });

    it("should render Provide feedback link with Envizi form ID when getEnableEnviziLogin is true", () => {
      getEnableEnviziLogin.mockReturnValue(true);
      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Provide feedback/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://your.feedback.ibm.com/jfe/form/SV_1YXxfTEf9MKci8u"
      );
      expect(link).toHaveAttribute("target", "_blank");
      expect(getEnableEnviziLogin).toHaveBeenCalled();
    });

    it("should render Provide feedback link with default form ID when getEnableEnviziLogin is false", () => {
      getEnableEnviziLogin.mockReturnValue(false);
      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Provide feedback/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://your.feedback.ibm.com/jfe/form/SV_7Vh96izZeRghY34"
      );
      expect(link).toHaveAttribute("target", "_blank");
      expect(getEnableEnviziLogin).toHaveBeenCalled();
    });

    it("should render Contact IBM link with mailto for trial users", () => {
      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Contact IBM/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "mailto:enviziemissionsapi@ibm.com");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Support Link - Trial Subscription", () => {
    it("should show mailto link when subscription data is undefined", () => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Contact IBM/i });
      expect(link).toHaveAttribute("href", "mailto:enviziemissionsapi@ibm.com");
    });

    it("should show mailto link when subscription type is trial", () => {
      useAccountSubscription.mockReturnValue({
        data: {
          organizationId: "org-123",
          partNumber: "EMISSIONS_TRIAL",
          subscriptionType: "trial",
          totalApiCalls: 1000,
          billingCycleMonths: 12,
          ssmCreationDate: "2024-01-01",
          ssmExpirationDate: "2025-01-01",
          edition: "",
        },
        isLoading: false,
        isError: false,
      });

      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Contact IBM/i });
      expect(link).toHaveAttribute("href", "mailto:enviziemissionsapi@ibm.com");
    });
  });

  describe("Support Link - Paid Subscription", () => {
    it("should show IBM support link for basic subscription", () => {
      useAccountSubscription.mockReturnValue({
        data: {
          organizationId: "org-123",
          partNumber: "D09SJZX",
          subscriptionType: "basic",
          totalApiCalls: 5000,
          billingCycleMonths: 12,
          ssmCreationDate: "2024-01-01",
          ssmExpirationDate: "2025-01-01",
          edition: "basic-edition",
        },
        isLoading: false,
        isError: false,
      });

      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Contact IBM/i });
      expect(link).toHaveAttribute("href", "https://www.ibm.com/mysupport");
    });

    it("should show IBM support link for premium subscription", () => {
      useAccountSubscription.mockReturnValue({
        data: {
          organizationId: "org-123",
          partNumber: "D09SJZX",
          subscriptionType: "premium",
          totalApiCalls: 10000,
          billingCycleMonths: 12,
          ssmCreationDate: "2024-01-01",
          ssmExpirationDate: "2025-01-01",
          edition: "",
        },
        isLoading: false,
        isError: false,
      });

      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Contact IBM/i });
      expect(link).toHaveAttribute("href", "https://www.ibm.com/mysupport");
    });

    it("should show IBM support link for marketplace subscription", () => {
      useAccountSubscription.mockReturnValue({
        data: {
          organizationId: "org-123",
          partNumber: "D11IQZX",
          subscriptionType: "marketplace",
          totalApiCalls: 15000,
          billingCycleMonths: 12,
          ssmCreationDate: "2024-01-01",
          ssmExpirationDate: "2025-01-01",
          edition: "",
        },
        isLoading: false,
        isError: false,
      });

      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Contact IBM/i });
      expect(link).toHaveAttribute("href", "https://www.ibm.com/mysupport");
    });
  });

  describe("Component Structure", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
    });

    it("should render all 7 external links", () => {
      render(<ResourcesTab />, { wrapper });
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(7);
    });

    it("should render block headers for resource sections", () => {
      const { container } = render(<ResourcesTab />, { wrapper });
      const blockHeaders = container.querySelectorAll(".block-header");
      expect(blockHeaders).toHaveLength(4);
    });

    it("should render stack-gap-8 containers for links", () => {
      const { container } = render(<ResourcesTab />, { wrapper });
      const stackGaps = container.querySelectorAll(".stack-gap-8");
      expect(stackGaps).toHaveLength(4);
    });

    it("should render stack-gap-16 container for main content", () => {
      const { container } = render(<ResourcesTab />, { wrapper });
      const stackGap16 = container.querySelector(".stack-gap-16");
      expect(stackGap16).toBeInTheDocument();
    });
  });

  describe("ResourceSection Component", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
    });

    it("should render section titles as block headers", () => {
      render(<ResourcesTab />, { wrapper });
      const overviewHeader = screen.getByText("Overview");
      const documentationHeader = screen.getByText("Documentation");
      const communityHeader = screen.getByText("Community");
      const supportHeader = screen.getByText("Support");

      expect(overviewHeader).toHaveClass("block-header");
      expect(documentationHeader).toHaveClass("block-header");
      expect(communityHeader).toHaveClass("block-header");
      expect(supportHeader).toHaveClass("block-header");
    });

    it("should render links within each section", () => {
      render(<ResourcesTab />, { wrapper });

      // Overview section should have 1 link
      const overviewLinks = [screen.getByRole("link", { name: /Excel add-in overview page/i })];
      expect(overviewLinks).toHaveLength(1);

      // Documentation section should have 1 link
      const docLinks = [screen.getByRole("link", { name: /Excel add-in documentation/i })];
      expect(docLinks).toHaveLength(1);

      // Community section should have 3 links
      const communityLinks = [
        screen.getByRole("link", { name: /IBM Envizi community/i }),
        screen.getByRole("link", { name: /IBM Envizi blog/i }),
        screen.getByRole("link", { name: /IBM Envizi website/i }),
      ];
      expect(communityLinks).toHaveLength(3);

      // Support section should have 2 links
      const supportLinks = [
        screen.getByRole("link", { name: /Provide feedback/i }),
        screen.getByRole("link", { name: /Contact IBM/i }),
      ];
      expect(supportLinks).toHaveLength(2);
    });
  });

  describe("Link Security", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
    });

    it("should open all links in new tab", () => {
      render(<ResourcesTab />, { wrapper });
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("target", "_blank");
      });
    });

    it("should have valid href attributes for all links", () => {
      render(<ResourcesTab />, { wrapper });
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        const href = link.getAttribute("href");
        expect(href).toBeTruthy();
        expect(href).not.toBe("#");
        expect(href).not.toBe("");
      });
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
    });

    it("should have descriptive link text", () => {
      render(<ResourcesTab />, { wrapper });
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.textContent).toBeTruthy();
        expect(link.textContent?.trim().length).toBeGreaterThan(0);
      });
    });

    it("should be keyboard navigable", () => {
      render(<ResourcesTab />, { wrapper });
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).not.toHaveAttribute("tabindex", "-1");
      });
    });

    it("should use semantic HTML for links", () => {
      render(<ResourcesTab />, { wrapper });
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.tagName).toBe("A");
      });
    });
  });

  describe("Hook Integration", () => {
    it("should call useAccountSubscription hook", () => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      render(<ResourcesTab />, { wrapper });

      expect(useAccountSubscription).toHaveBeenCalled();
    });

    it("should handle loading state from useAccountSubscription", () => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });

      render(<ResourcesTab />, { wrapper });

      // Component should still render with loading state
      expect(screen.getByText(/Everything that you need to get started/i)).toBeInTheDocument();
    });

    it("should handle error state from useAccountSubscription", () => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      });

      render(<ResourcesTab />, { wrapper });

      // Component should still render with error state, defaulting to trial support link
      const link = screen.getByRole("link", { name: /Contact IBM/i });
      expect(link).toHaveAttribute("href", "mailto:enviziemissionsapi@ibm.com");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null subscription data", () => {
      useAccountSubscription.mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
      });

      render(<ResourcesTab />, { wrapper });

      const link = screen.getByRole("link", { name: /Contact IBM/i });
      expect(link).toHaveAttribute("href", "mailto:enviziemissionsapi@ibm.com");
    });

    it("should render without QueryClientProvider wrapper", () => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });

      expect(() => render(<ResourcesTab />)).not.toThrow();
    });
  });

  describe("Content Validation", () => {
    beforeEach(() => {
      useAccountSubscription.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      });
    });

    it("should display correct documentation link labels", () => {
      render(<ResourcesTab />, { wrapper });
      expect(screen.getByText(/Excel add-in documentation/i)).toBeInTheDocument();
    });

    it("should display correct overview link labels", () => {
      render(<ResourcesTab />, { wrapper });
      expect(screen.getByText(/Excel add-in overview page/i)).toBeInTheDocument();
    });

    it("should display correct community link labels", () => {
      render(<ResourcesTab />, { wrapper });
      expect(screen.getByText(/IBM Envizi community/i)).toBeInTheDocument();
      expect(screen.getByText(/IBM Envizi blog/i)).toBeInTheDocument();
      expect(screen.getByText(/IBM Envizi website/i)).toBeInTheDocument();
    });

    it("should display correct support link labels", () => {
      render(<ResourcesTab />, { wrapper });
      expect(screen.getByText(/Provide feedback/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact IBM/i)).toBeInTheDocument();
    });
  });
});
