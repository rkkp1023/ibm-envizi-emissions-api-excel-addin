// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import { AuthProvider } from "../context/AuthContext";
import { LoginPage } from "./LoginPage";

// Mock the auth module
const mockDisplayLoginDialog = jest.fn();
jest.mock("../auth", () => ({
  displayLoginDialog: (...args: any[]) => mockDisplayLoginDialog(...args),
}));

// Mock the credentials module
jest.mock("../../common/credentials", () => ({
  loadCredentialsFromStorage: jest.fn().mockResolvedValue(null),
  saveUserCredentialsToStorage: jest.fn(),
  removeCredentialsFromStorage: jest.fn(),
  setUserCredentials: jest.fn(),
  getUserCredentials: jest.fn(),
}));

// Mock the client module
jest.mock("../../functions/client", () => ({
  ensureClient: jest.fn().mockResolvedValue(undefined),
  resetClient: jest.fn(),
}));

// Mock the commands module
jest.mock("../../commands/commands", () => ({
  refreshMetadataOnLogin: jest.fn().mockResolvedValue(undefined),
}));

// Mock the API modules
jest.mock("../../api/coreEnviziAuth", () => ({
  coreEnviziAuth: {
    exchangeToken: jest.fn().mockResolvedValue("mock-core-token"),
  },
}));

jest.mock("../../api/enviziUiGraphQL", () => ({
  enviziUiGraphQL: {
    renewToken: jest.fn().mockResolvedValue({
      data: {
        renewToken: {
          token: "mock-new-token",
          refreshToken: "mock-new-refresh-token",
        },
      },
    }),
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLoginPage = () => {
    return render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
  };

  it("should render the welcome text", () => {
    renderLoginPage();

    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
  });

  it("should render the login button", () => {
    renderLoginPage();

    const loginButton = screen.getByRole("button", { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it("should render the illustration image", () => {
    renderLoginPage();

    const images = screen.getAllByAltText("Envizi usecase report progress");
    const illustrationImage = images.find(
      (img) => img.getAttribute("src") === "assets/envizi-usecase-report-progress.png"
    );
    expect(illustrationImage).toBeInTheDocument();
    expect(illustrationImage).toHaveClass("envizi-illustration");
  });

  it("should render the sign-up link", () => {
    renderLoginPage();

    const signUpLink = screen.getByText(/complete the sign-up form/i);
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest("a")).toHaveAttribute(
      "href",
      "https://www.ibm.com/account/reg/us-en/signup?formid=urx-54313"
    );
    expect(signUpLink.closest("a")).toHaveAttribute("target", "_blank");
  });

  it("should render the documentation link", () => {
    renderLoginPage();

    const docLink = screen.getByText(/Learn about Envizi Emissions Calculations in Excel/i);
    expect(docLink).toBeInTheDocument();
    expect(docLink.closest("a")).toHaveAttribute(
      "href",
      "https://www.ibm.com/docs/envizi-esg-suite?topic=api-calculating-emissions-in-microsoft-excel"
    );
    expect(docLink.closest("a")).toHaveAttribute("target", "_blank");
  });

  it("should render the copyright text", () => {
    renderLoginPage();

    expect(screen.getByText("© Copyright IBM Corp. 2025, 2026")).toBeInTheDocument();
  });

  it("should render the footer icon", () => {
    renderLoginPage();

    const footerImages = screen.getAllByAltText("Envizi usecase report progress");
    const footerIcon = footerImages.find(
      (img) => img.getAttribute("src") === "assets/footer-icon.png"
    );
    expect(footerIcon).toBeInTheDocument();
  });

  it("should call displayLoginDialog when login button is clicked", () => {
    renderLoginPage();

    const loginButton = screen.getByRole("button", { name: /Login/i });
    fireEvent.click(loginButton);

    expect(mockDisplayLoginDialog).toHaveBeenCalledTimes(1);
    expect(mockDisplayLoginDialog).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
  });

  it("should have primary appearance for login button", () => {
    renderLoginPage();

    const loginButton = screen.getByRole("button", { name: /Login/i });
    expect(loginButton).toHaveClass("fui-Button");
  });
});
