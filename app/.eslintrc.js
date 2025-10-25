module.exports = {
    extends: [
        "next/core-web-vitals"
    ],
    rules: {
        // Disable TypeScript-related rules
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-var-requires": "off",
        // Disable other strict rules that might cause issues
        "react-hooks/exhaustive-deps": "warn",
        "no-unused-vars": "warn",
        "prefer-const": "warn"
    },
    parser: "espree",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    }
}
