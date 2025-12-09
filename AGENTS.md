# AI Agent Guidelines

## Code styles

### Comments

- **Conciseness**: Compress texts to the limit without losing entropy.
- **Language**: Write in English.
- **Purpose**: Only explain "why not" or "why".

### Testing

- **Comments**: Use `// Arrange`, `// Act`, and `// Assert` comments exclusively for separation. Don't add extra text to these markers.
- **Structure**: Organize test functions into "Arrange", "Act", and "Assert" sections.

### TypeScript Rules

- **Avoid `any`**: Don't use the `any` type in type annotations, type assertions, or function parameters. Always use specific types or `unknown` with proper narrowing.
- **Documentation**: Use [TSDoc](https://tsdoc.org/) when writing documentation about the code.
