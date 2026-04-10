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
        expect(isValidUrl("https://www.ibm.com/docs")).toBe(true);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it("should validate subdomain of IBM.com", () => {
        expect(isValidUrl("https://mediacenter.ibm.com/media/1_700skqlt")).toBe(true);
      });

      it("should validate IBM.com root domain", () => {
        expect(isValidUrl("https://ibm.com")).toBe(true);
      });

      it("should handle case insensitive domain names", () => {
        expect(isValidUrl("https://WWW.IBM.COM/docs")).toBe(true);
        expect(isValidUrl("https://MediaCenter.IBM.com/media/test")).toBe(true);
      });
    });

    describe("Invalid protocols", () => {
      it("should reject http protocol", () => {
        expect(isValidUrl("http://www.ibm.com")).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "http:"');
      });

      it("should reject javascript protocol", () => {
        expect(isValidUrl("javascript:alert('xss')")).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Invalid protocol "javascript:"'
        );
      });

      it("should reject data protocol", () => {
        expect(isValidUrl("data:text/html,<script>alert('xss')</script>")).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "data:"');
      });

      it("should reject file protocol", () => {
        expect(isValidUrl("file:///etc/passwd")).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "file:"');
      });
    });

    describe("Unauthorized domains", () => {
      it("should reject non-IBM domains", () => {
        expect(isValidUrl("https://evil.com")).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Unauthorized domain "evil.com"'
        );
      });

      it("should reject domain spoofing attempts", () => {
        expect(isValidUrl("https://ibm.com.evil.com")).toBe(false);
        expect(isValidUrl("https://ibmcloud.com")).toBe(false);
        expect(isValidUrl("https://ibm.org")).toBe(false);
      });
    });

    describe("Invalid URL formats", () => {
      it("should reject null and empty URLs", () => {
        expect(isValidUrl(null as any)).toBe(false);
        expect(isValidUrl("")).toBe(false);
      });

      it("should reject malformed URLs", () => {
        expect(isValidUrl("not-a-valid-url")).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid URL format:", expect.any(Object));
      });
    });

    describe("Domain matching logic", () => {
      it("should match exact domain and subdomains", () => {
        expect(isValidUrl("https://ibm.com")).toBe(true);
        expect(isValidUrl("https://www.ibm.com")).toBe(true);
        expect(isValidUrl("https://deep.sub.domain.ibm.com")).toBe(true);
      });

      it("should reject domains that don't end with .ibm.com", () => {
        expect(isValidUrl("https://ibm.example.com")).toBe(false);
        expect(isValidUrl("https://notibm.com")).toBe(false);
      });
    });
  });
});

// Made with Bob
