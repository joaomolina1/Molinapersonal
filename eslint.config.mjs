import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReactHooks from "eslint-plugin-react-hooks";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs"],
  },

  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  ...compat.extends(
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "next/core-web-vitals",
    "next/typescript"
  ),

  {
    settings: {
      react: { version: "detect" },
    },

    languageOptions: {
      parserOptions: {
        project: true,
      },
    },


    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  },

  eslintConfigPrettier
);
