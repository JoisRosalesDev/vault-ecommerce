import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**", // Exclude the skills directory from the linter
  ]),
  // Custom rules configuration
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "no-restricted-syntax": [
        "error",
        {
          // Bans presentation emojis in string literals
          selector: "Literal[value=/\\p{Emoji_Presentation}/u]",
          message: "Emojis are strictly forbidden in the codebase by project constitution."
        },
        {
          // Bans presentation emojis in template literals
          selector: "TemplateElement[value.raw=/\\p{Emoji_Presentation}/u]",
          message: "Emojis are strictly forbidden in the codebase by project constitution."
        }
      ]
    }
  }
]);

export default eslintConfig;
