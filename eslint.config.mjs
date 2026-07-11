import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "sanity.types.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
      "prefer-const": "warn",
      // React Compiler advisories (eslint-plugin-react-hooks v7). This codebase
      // predates them; surface as warnings rather than failing the build.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/static-components": "warn",
      // The Sanity Studio (/studio) is a separate SPA that needs a full page
      // load, so a plain <a> is intentional here.
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];

export default eslintConfig;
