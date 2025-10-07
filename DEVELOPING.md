# Technical overview

This is a single-page application (client-side only, no server).

- Language: [TypeScript](https://www.typescriptlang.org/)
- UI framework: [React](https://react.dev/)
- State management: [Redux](https://redux.js.org/)
- Styling: Mostly [Tailwind](https://tailwindcss.com/), with a sprinkling of [CSS Modules](https://github.com/css-modules/css-modules)
- Icon library: [Lucide](https://lucide.dev/), plus some handmade icons in their style
- Build system and dev environment: [Vite](https://vite.dev/)

# Setup

1. Ensure you have a recent version of Node installed. Try `node --version`.
2. Install development dependencies with `npm install`.

Then, you can:

- Run a dev server: `npm run dev`
- Run static checks: `npm run check`
- Run tests: `npm run test`

# Deploying

Pushing to the `main` branch will automatically build and deploy the live site through GitHub Actions.
