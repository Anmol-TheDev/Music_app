import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: [
      "dist",
      "pnpm-lock.yaml",
      "vite.config.js.timestamp-*.mjs",
      ".husky/",
      "postcss.config.js",
      "tailwind.config.js",
      "vite.config.js",
      "components.json",
      "public/",
    ],
  },
  // JavaScript and JSX files configuration
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  // TypeScript and TSX files configuration
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: { react: { version: "detect" } },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",
    },
  },
];
