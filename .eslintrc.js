module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    // Désactiver temporairement les règles problématiques
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "react/no-unescaped-entities": "off",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error"
  }
}