# TypeScript Standards

This uses yarn workspaces to manage dependencies. See [`package.json`](../package.json) for the complete list of workspaces.

This uses jest to run tests. See [`package.json`](../package.json) for the complete list of scripts.

## Type Definitions

Type definition standards are enforced via ESLint. See [`eslint.config.mjs`](../../eslint.config.mjs) for the complete ruleset.

## Naming Conventions

Follow industry best practices for React:

### General

- **Types**: `PascalCase`
- **Variables/Functions**: `camelCase`
- **Constants**: `camelCase`
- **Private fields**: Prefix with `#`
- **Unused params**: Prefix with `_` (enforced by ESLint)

### React-Specific

- **Component folders**: `PascalCase`
- **Components**: `PascalCase.tsx`
- **Component scss**: `PascalCase.scss`
- **Hooks**: Prefix with `use` (e.g., `useCustomHook`)
- **Props Types**: `ComponentNameProps`
