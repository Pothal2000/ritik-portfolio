# Ritik Pothal — Developer Portfolio

A responsive, developer-focused portfolio built with Angular, TypeScript, SCSS, and a lightweight Three.js hero scene.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/` in your browser.

## Build and test

```bash
npm run build
npm test
```

The production build is compatible with static hosting on Vercel.

## Experience

- Responsive single-page portfolio with work, skills, about, journey, and contact sections.
- Searchable command palette; open it with `Ctrl + K` or `⌘ + K`.
- Keyboard navigation and focus management in the command palette.
- Dark and light themes.
- Abstract Three.js hero scene, loaded on demand and paused when offscreen or when reduced motion is enabled.
- Honors the user's reduced-motion preference and keeps core content usable without WebGL.
- Data-driven CV at `/resume`; **Download PDF** immediately saves a searchable PDF with clickable email, phone, LinkedIn, and GitHub links.

## Source structure

```text
src/app/
├── components/
│   └── hero-scene/            # Reusable Three.js canvas component
├── pages/
│   ├── cv-page/               # Data-driven CV and print stylesheet
│   └── portfolio-page/        # Routed portfolio page, template, styles, and tests
├── data/
│   └── cv-data.ts             # Editable CV content
├── app.config.ts              # Application-level providers
├── app.routes.ts              # Lazy-loaded page routes
└── app.ts                     # Root router outlet
```

Generate additional standalone components with Angular CLI:

```bash
npx ng generate component components/component-name
npx ng generate component pages/page-name
```

Project descriptions and technology lists are intentionally limited to details supplied for the portfolio. Edit `src/app/data/cv-data.ts` to update CV content; the `/resume` page and downloaded PDF are generated from that data.
