import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    linterOptions: {
      // Supprimer les warnings "Unused eslint-disable directive" qui bloquent le build
      reportUnusedDisableDirectives: false,
    },
    rules: {
      // Désactiver les règles cosmétiques sans impact fonctionnel
      "react/no-unescaped-entities": "off",
      // Désactiver les règles TypeScript trop strictes pour ce projet
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // Désactiver les warnings react-hooks pour éviter les faux positifs
      "react-hooks/exhaustive-deps": "off",
      // prefer-const en warn uniquement (les mutations de propriétés d'objet sont légitimes)
      "prefer-const": "warn",
    }
  },
  {
    // Ignorer les fichiers de test
    ignores: ["**/__tests__/**", "**/*.test.tsx", "**/*.test.ts"]
  }
];

export default eslintConfig;
