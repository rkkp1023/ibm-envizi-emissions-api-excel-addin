// Copyright IBM Corp. 2025, 2026

import { handleCustomFunctionError } from "../src/functions/metadata-utils";

// Mock CustomFunctions global
(global as any).CustomFunctions = {
  Error: class extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = "CustomFunctions.Error";
    }
  },
  ErrorCode: {
    notAvailable: "NotAvailable",
    invalidValue: "InvalidValue",
  },
};

describe("metadata-utils", () => {
  describe("handleCustomFunctionError", () => {
    it("should re-throw CustomFunctions.Error as-is", () => {
      const customError = new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        "Custom error message"
      );

      expect(() => handleCustomFunctionError(customError, "Default message")).toThrow(
        "Custom error message"
      );
    });

    it("should re-throw error with CustomFunctions.Error name property", () => {
      const errorLikeObject = {
        name: "CustomFunctions.Error",
        code: "InvalidValue",
        message: "Error-like object",
      };

      expect(() => handleCustomFunctionError(errorLikeObject, "Default message")).toThrow(
        errorLikeObject
      );
    });

    it("should wrap regular Error with CustomFunctions.Error", () => {
      const regularError = new Error("Regular error message");

      try {
        handleCustomFunctionError(regularError, "Operation failed");
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.name).toBe("CustomFunctions.Error");
        expect(error.code).toBe("NotAvailable");
        expect(error.message).toBe("Operation failed: Regular error message");
      }
    });

    it("should handle error objects with message property", () => {
      const errorObject = { message: "Error object message" };

      try {
        handleCustomFunctionError(errorObject, "Default message");
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.name).toBe("CustomFunctions.Error");
        expect(error.message).toBe("Default message: Error object message");
      }
    });

    it("should handle errors without message property", () => {
      const errorWithoutMessage = { code: 500 };

      try {
        handleCustomFunctionError(errorWithoutMessage, "Default message");
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.name).toBe("CustomFunctions.Error");
        expect(error.message).toBe("Default message: Unknown error");
      }
    });

    it("should handle null error", () => {
      try {
        handleCustomFunctionError(null, "Default message");
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.name).toBe("CustomFunctions.Error");
        expect(error.message).toBe("Default message: Unknown error");
      }
    });

    it("should handle undefined error", () => {
      try {
        handleCustomFunctionError(undefined, "Default message");
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.name).toBe("CustomFunctions.Error");
        expect(error.message).toBe("Default message: Unknown error");
      }
    });

    it("should handle string error", () => {
      try {
        handleCustomFunctionError("String error", "Default message");
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.name).toBe("CustomFunctions.Error");
        expect(error.message).toBe("Default message: Unknown error");
      }
    });

    it("should use NotAvailable error code for wrapped errors", () => {
      const regularError = new Error("Test error");

      try {
        handleCustomFunctionError(regularError, "Failed");
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("NotAvailable");
      }
    });

    it("should preserve original error code when re-throwing CustomFunctions.Error", () => {
      const customError = new CustomFunctions.Error(
        CustomFunctions.ErrorCode.invalidValue,
        "Invalid input"
      );

      try {
        handleCustomFunctionError(customError, "Default");
        fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("InvalidValue");
      }
    });
  });
});

// Made with Bob
