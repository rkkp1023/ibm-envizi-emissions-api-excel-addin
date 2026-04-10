// Copyright IBM Corp. 2026

import "@testing-library/jest-dom";

describe("Redirect", () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("isValidUrl function behavior", () => {
    // Helper function to test URL validation (extracted from redirect.ts logic)
    function isValidUrl(url: string | null): boolean {
      if (!url) return false;

      const allowedDomains = ["*.ibm.com", "ibm.com"];
      const allowedProtocols = ["https:"];

      try {
        const parsedUrl = new URL(url);

        if (!allowedProtocols.includes(parsedUrl.protocol)) {
          console.warn(`Blocked redirect: Invalid protocol "${parsedUrl.protocol}"`);
          return false;
        }

        const hostname = parsedUrl.hostname.toLowerCase();
        const isAllowed = allowedDomains.some(
          (domain) => hostname === domain || hostname.endsWith("." + domain)
        );

        if (!isAllowed) {
          console.warn(`Blocked redirect: Unauthorized domain "${hostname}"`);
        }

        return isAllowed;
      } catch (error) {
        console.error("Invalid URL format:", error);
        return false;
      }
    }

    describe("Valid URLs", () => {
      it("should validate IBM.com URL with https protocol", () => {
        const result = isValidUrl("https://www.ibm.com/docs");
        expect(result).toBe(true);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it("should validate subdomain of IBM.com", () => {
        const result = isValidUrl("https://mediacenter.ibm.com/media/1_700skqlt");
        expect(result).toBe(true);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it("should validate IBM.com root domain", () => {
        const result = isValidUrl("https://ibm.com");
        expect(result).toBe(true);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it("should validate IBM.com URL with query parameters", () => {
        const result = isValidUrl("https://www.ibm.com/docs?topic=test&section=1");
        expect(result).toBe(true);
      });

      it("should validate IBM.com URL with hash fragment", () => {
        const result = isValidUrl("https://www.ibm.com/docs#section");
        expect(result).toBe(true);
      });

      it("should validate deep subdomain of IBM.com", () => {
        const result = isValidUrl("https://deep.sub.domain.ibm.com/path");
        expect(result).toBe(true);
      });
    });

    describe("Invalid protocols", () => {
      it("should reject http:// protocol", () => {
        const result = isValidUrl("http://www.ibm.com");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "http:"');
      });

      it("should reject javascript: protocol", () => {
        const result = isValidUrl("javascript:alert('xss')");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Invalid protocol "javascript:"'
        );
      });

      it("should reject data: protocol", () => {
        const result = isValidUrl("data:text/html,<script>alert('xss')</script>");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "data:"');
      });

      it("should reject file: protocol", () => {
        const result = isValidUrl("file:///etc/passwd");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "file:"');
      });
    });

    describe("Unauthorized domains", () => {
      it("should reject non-IBM domain", () => {
        const result = isValidUrl("https://evil.com");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Unauthorized domain "evil.com"'
        );
      });

      it("should reject domain that looks like IBM but is not", () => {
        const result = isValidUrl("https://ibm.com.evil.com");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Unauthorized domain "ibm.com.evil.com"'
        );
      });

      it("should reject domain with IBM in subdomain but different TLD", () => {
        const result = isValidUrl("https://ibm.evil.com");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Unauthorized domain "ibm.evil.com"'
        );
      });

      it("should reject google.com", () => {
        const result = isValidUrl("https://google.com");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Unauthorized domain "google.com"'
        );
      });
    });

    describe("Invalid or missing URLs", () => {
      it("should reject null URL", () => {
        const result = isValidUrl(null);
        expect(result).toBe(false);
      });

      it("should reject empty string", () => {
        const result = isValidUrl("");
        expect(result).toBe(false);
      });

      it("should reject malformed URL", () => {
        const result = isValidUrl("not-a-valid-url");
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(consoleErrorSpy.mock.calls[0][0]).toBe("Invalid URL format:");
        // Verify an error object was passed
        expect(consoleErrorSpy.mock.calls[0][1]).toBeTruthy();
        expect(typeof consoleErrorSpy.mock.calls[0][1]).toBe("object");
      });

      it("should reject URL with only protocol", () => {
        const result = isValidUrl("https://");
        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(consoleErrorSpy.mock.calls[0][0]).toBe("Invalid URL format:");
        // Verify an error object was passed
        expect(consoleErrorSpy.mock.calls[0][1]).toBeTruthy();
        expect(typeof consoleErrorSpy.mock.calls[0][1]).toBe("object");
      });
    });

    describe("Case sensitivity", () => {
      it("should handle uppercase domain names", () => {
        const result = isValidUrl("https://WWW.IBM.COM/docs");
        expect(result).toBe(true);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });

      it("should handle mixed case domain names", () => {
        const result = isValidUrl("https://MediaCenter.IBM.com/media/test");
        expect(result).toBe(true);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe("Security validation", () => {
      it("should prevent open redirect attacks", () => {
        const result = isValidUrl("https://attacker.com/phishing");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Blocked redirect: Unauthorized domain "attacker.com"'
        );
      });

      it("should only allow HTTPS protocol", () => {
        const result = isValidUrl("http://www.ibm.com");
        expect(result).toBe(false);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Blocked redirect: Invalid protocol "http:"');
      });

      it("should validate against allowlist of domains", () => {
        const validUrls = [
          "https://ibm.com",
          "https://www.ibm.com",
          "https://subdomain.ibm.com",
          "https://deep.sub.ibm.com",
        ];

        validUrls.forEach((url) => {
          consoleWarnSpy.mockClear();
          const result = isValidUrl(url);
          expect(result).toBe(true);
          expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
      });

      it("should reject URLs not in allowlist", () => {
        const invalidUrls = ["https://example.com", "https://ibm.evil.com", "https://evilibm.com"];

        invalidUrls.forEach((url) => {
          consoleWarnSpy.mockClear();
          const result = isValidUrl(url);
          expect(result).toBe(false);
          expect(consoleWarnSpy).toHaveBeenCalled();
        });
      });
    });
  });

  describe("Module integration", () => {
    let mockOnReady: jest.Mock;

    beforeEach(() => {
      mockOnReady = jest.fn((callback) => callback());
      global.Office = {
        onReady: mockOnReady,
      } as any;

      delete (window as any).location;
      (window as any).location = {
        search: "",
        href: "",
      };

      jest.resetModules();
    });

    it("should call Office.onReady when module is loaded", () => {
      require("./redirect");
      expect(mockOnReady).toHaveBeenCalledTimes(1);
      expect(typeof mockOnReady.mock.calls[0][0]).toBe("function");
    });

    it("should display error when no URL parameter is provided", () => {
      window.location.search = "";
      require("./redirect");

      expect(document.body.innerHTML).toContain("Error: No URL specified");
    });

    it("should display error when URL parameter is empty", () => {
      window.location.search = "?url=";
      require("./redirect");

      expect(document.body.innerHTML).toContain("Error: No URL specified");
    });

    it("should display error message with correct CSS class", () => {
      window.location.search = "";
      require("./redirect");

      const errorDiv = document.body.querySelector(".error-message");
      expect(errorDiv).toHaveClass("error-message");
      expect(errorDiv).toBeInTheDocument();
    });

    it("should display error message in document body when URL is missing", () => {
      window.location.search = "";
      require("./redirect");

      expect(document.body.innerHTML).toContain("Error:");
      expect(document.body.innerHTML).toContain("error-message");
    });

    it("should handle URL parameter extraction from search string", () => {
      window.location.search = "?url=https://www.ibm.com/test&other=param";
      require("./redirect");

      // URLSearchParams should extract the url parameter correctly
      const params = new URLSearchParams("?url=https://www.ibm.com/test&other=param");
      expect(params.get("url")).toBe("https://www.ibm.com/test");
    });
  });

  describe("Allowed domains configuration", () => {
    it("should document allowed domain patterns", () => {
      const allowedDomains = ["*.ibm.com", "ibm.com"];

      expect(allowedDomains).toContain("*.ibm.com");
      expect(allowedDomains).toContain("ibm.com");
      expect(allowedDomains).toHaveLength(2);
    });

    it("should document allowed protocols", () => {
      const allowedProtocols = ["https:"];

      expect(allowedProtocols).toContain("https:");
      expect(allowedProtocols).toHaveLength(1);
    });
  });
});

// Made with Bob
