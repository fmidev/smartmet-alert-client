# Agent Guidelines for SmartMet Alert Client

## Build & Test Commands

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Production build
- `npm run lint` - Lint .js and .vue files
- `npm run lint:fix` - Auto-fix linting issues
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run all tests once (CI/CD)
- `vitest path/to/file.spec.js` - Run single test file

## Code Style

- **Formatting**: Prettier with single quotes, no semicolons, bracket spacing, arrowParens always
- **Imports**: Use `@/` alias for src imports (e.g., `import AlertClient from '@/components/AlertClient.vue'`)
- **Vue**: Vue 3 composition API, relaxed rules (self-closing, multi-word names, v-html allowed)
- **ESLint**: Standard + Vue3-recommended + SonarJS (cognitive complexity/duplicate strings disabled)
- **Naming**: camelCase for variables/functions, PascalCase for components

## Architecture

- Vue 3 web components with custom elements
- Mixins for shared logic (config, utils, i18n, geojsonsvg, fields, keycodes)
- ES2020 modules, SCSS with modern compiler
- Vitest + @vue/test-utils + jsdom for testing
