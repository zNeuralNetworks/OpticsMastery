import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {ignores: ["dist/**"]},
  {languageOptions: { globals: globals.browser }},
  ...tseslint.configs.recommended,
  {plugins: {react: pluginReact}},
];
