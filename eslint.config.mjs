import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore patterns
  {
    ignores: [
      "dist/**",
      "lib/**",
      "lib-amd/**",
      "node_modules/**",
      "coverage/**",
      "docs/**",
      "webpack.config.js",
      "jest.setup.js",
      "jest.config.js",
      "babel.config.json",
      "eslint.config.mjs",
      "*.config.js",
      "*.config.mjs",
    ],
  },

  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Main configuration
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        Office: "readonly",
        Excel: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        Promise: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-key": "error",
      "react/no-unescaped-entities": "warn",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Accessibility rules
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",

      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // Test files
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "test/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
    },
  },

  // Config files
  {
    files: ["*.config.{js,mjs}", "jest.setup.js"],
    languageOptions: {
      globals: {
        module: "writable",
        require: "readonly",
        __dirname: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-undef": "off",
    },
  }
);
