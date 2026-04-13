// Copyright IBM Corp. 2026

import { validateUrl } from "./redirect";

describe("redirect", () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validateUrl", () => {
    describe("Valid URLs", () => {
      it("should validate IBM.com URL with https protocol", () => {
        expect(validateUrl("https://www.ibm.com/docs")).toBe("https://www.ibm.com/docs");
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it("should validate subdomain of IBM.com", () => {
        expect(validateUrl("https://mediacenter.ibm.com/media/1_700skqlt")).toBe(
          "https://mediacenter.ibm.com/media/1_700skqlt"
        );
      });

      it("should validate IBM.com root domain", () => {
        expect(validateUrl("https://ibm.com")).toBe("https://ibm.com/");
      });

      it("should handle case insensitive domain names", () => {
        expect(validateUrl("https://WWW.IBM.COM/docs")).toBe("https://www.ibm.com/docs");
        expect(validateUrl("https://MediaCenter.IBM.com/media/test")).toBe(
          "https://mediacenter.ibm.com/media/test"
        );
      });
    });

    describe("Invalid protocols", () => {
      it("should reject http protocol", () => {
        expect(validateUrl("http://www.ibm.com")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "http:"');
      });

      it("should reject javascript protocol", () => {
        expect(validateUrl("javascript:alert('xss')")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Invalid protocol "javascript:"'
        );
      });

      it("should reject data protocol", () => {
        expect(validateUrl("data:text/html,<script>alert('xss')</script>")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "data:"');
      });

      it("should reject file protocol", () => {
        expect(validateUrl("file:///etc/passwd")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "file:"');
      });
    });

    describe("Unauthorized domains", () => {
      it("should reject non-IBM domains", () => {
        expect(validateUrl("https://evil.com")).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Unauthorized domain "evil.com"'
        );
      });

      it("should reject domain spoofing attempts", () => {
        expect(validateUrl("https://ibm.com.evil.com")).toBeNull();
        expect(validateUrl("https://ibmcloud.com")).toBeNull();
        expect(validateUrl("https://ibm.org")).toBeNull();
      });
    });

    describe("Invalid URL formats", () => {
      it("should reject null and empty URLs", () => {
        expect(validateUrl(null as any)).toBeNull();
        expect(validateUrl("")).toBeNull();
      });

      it("should reject malformed URLs", () => {
        expect(validateUrl("not-a-valid-url")).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid URL format:", expect.any(Object));
      });
    });

    describe("Domain matching logic", () => {
      it("should match exact domain and subdomains", () => {
        expect(validateUrl("https://ibm.com")).toBe("https://ibm.com/");
        expect(validateUrl("https://www.ibm.com")).toBe("https://www.ibm.com/");
        expect(validateUrl("https://deep.sub.domain.ibm.com")).toBe(
          "https://deep.sub.domain.ibm.com/"
        );
      });

      it("should reject domains that don't end with .ibm.com", () => {
        expect(validateUrl("https://ibm.example.com")).toBeNull();
        expect(validateUrl("https://notibm.com")).toBeNull();
      });
    });
  });
});

// Made with Bob
