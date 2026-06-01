# MoneyExchange

Conversor de divisas con tipos de cambio en vivo usando la [Frankfurter API](https://api.frankfurter.dev). Implementado en **Vue 3** y **Svelte 5** dentro de un proyecto **Astro**.

## Project Structure

```text
/
├── public/
├── src/
│   ├── domain/
│   │   └── api.ts              # Frankfurter API client
│   ├── pages/
│   │   └── index.astro          # Entry page
│   ├── Svelte/
│   │   └── App.svelte           # Currency converter (Svelte)
│   └── Vue/
│       └── App.vue              # Currency converter (Vue)
├── vitest.config.ts
├── astro.config.mjs
├── svelte.config.js
└── package.json
```

## Commands

| Command                   | Action                                      |
| :------------------------ | :------------------------------------------ |
| `npm install`             | Installs dependencies                       |
| `npm run dev`             | Starts local dev server at `localhost:4321` |
| `npm run build`           | Build your production site to `./dist/`     |
| `npm run preview`         | Preview your build locally                  |
| `npm test`                | Run all tests                               |
| `npm run test:watch`      | Run tests in watch mode                     |
