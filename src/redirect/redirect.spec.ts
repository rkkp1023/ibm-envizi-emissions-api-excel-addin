// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

// Mock Office globally before importing redirect module
global.Office = {
  onReady: jest.fn((callback) => callback()),
} as any;

// Mock window.location
delete (window as any).location;
(window as any).location = {
  search: "",
  href: "",
};

import { isValidUrl } from "./redirect";

describe("Redirect", () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("isValidUrl function", () => {
    describe("Valid URLs", () => {
      it("should validate IBM.com URL with https protocol", () => {
        expect(isValidUrl("https://www.ibm.com/docs")).toBe("https://www.ibm.com/docs");
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it("should validate subdomain of IBM.com", () => {
        expect(isValidUrl("https://mediacenter.ibm.com/media/1_700skqlt")).toBe(
          "https://mediacenter.ibm.com/media/1_700skqlt"
        );
      });

      it("should validate IBM.com root domain", () => {
        expect(isValidUrl("https://ibm.com")).toBe("https://ibm.com/");
      });

      it("should handle case insensitive domain names", () => {
        expect(isValidUrl("https://WWW.IBM.COM/docs")).toBe("https://www.ibm.com/docs");
        expect(isValidUrl("https://MediaCenter.IBM.com/media/test")).toBe(
          "https://mediacenter.ibm.com/media/test"
        );
      });
    });

    describe("Invalid protocols", () => {
      it("should reject http protocol", () => {
        expect(isValidUrl("http://www.ibm.com")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "http:"');
      });

      it("should reject javascript protocol", () => {
        expect(isValidUrl("javascript:alert('xss')")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Invalid protocol "javascript:"'
        );
      });

      it("should reject data protocol", () => {
        expect(isValidUrl("data:text/html,<script>alert('xss')</script>")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "data:"');
      });

      it("should reject file protocol", () => {
        expect(isValidUrl("file:///etc/passwd")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "file:"');
      });
    });

    describe("Unauthorized domains", () => {
      it("should reject non-IBM domains", () => {
        expect(isValidUrl("https://evil.com")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Unauthorized domain "evil.com"'
        );
      });

      it("should reject domain spoofing attempts", () => {
        expect(isValidUrl("https://ibm.com.evil.com")).toBeNull();
        expect(isValidUrl("https://ibmcloud.com")).toBeNull();
        expect(isValidUrl("https://ibm.org")).toBeNull();
      });
    });

    describe("Invalid URL formats", () => {
      it("should reject null and empty URLs", () => {
        expect(isValidUrl(null as any)).toBeNull();
        expect(isValidUrl("")).toBeNull();
      });

      it("should reject malformed URLs", () => {
        expect(isValidUrl("not-a-valid-url")).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid URL format:", expect.any(Object));
      });
    });

    describe("Domain matching logic", () => {
      it("should match exact domain and subdomains", () => {
        expect(isValidUrl("https://ibm.com")).toBe("https://ibm.com/");
        expect(isValidUrl("https://www.ibm.com")).toBe("https://www.ibm.com/");
        expect(isValidUrl("https://deep.sub.domain.ibm.com")).toBe(
          "https://deep.sub.domain.ibm.com/"
        );
      });

      it("should reject domains that don't end with .ibm.com", () => {
        expect(isValidUrl("https://ibm.example.com")).toBeNull();
        expect(isValidUrl("https://notibm.com")).toBeNull();
      });
    });
  });
});

// Made with Bob
