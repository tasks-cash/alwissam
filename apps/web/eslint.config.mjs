import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Existing admin/data-loading screens synchronize remote Nest data in effects.
      // The React Compiler lint currently over-flags that established pattern.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "@next/next/no-img-element": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "test-results/**",
    "playwright-report/**",
    "next-env.d.ts",
  ]),
]);
