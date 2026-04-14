# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Audwn's Notebook** is a personal blog for documenting strategy and builder games. It is a React SPA deployed to GitHub Pages. All content is written as local Markdown files — there is no backend, no API, and no database.

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview the production build
```

No tests or linters are configured.

## Architecture

### Data flow

All content is loaded at **build time** via Vite's `import.meta.glob`. There are no runtime API calls, no loading states, and no external dependencies.

```
content/*.md files
  → src/data/loader.js  (gray-matter parses frontmatter + body at build time)
  → imported directly into App.jsx as plain JS arrays
  → rendered by React components
```

### Content structure

```
content/
  reviews/
    {slug}.md           ← review post
    {slug}/
      {date}.md         ← archived revision of that review
  articles/
    {slug}.md
  tutorials/
    {slug}.md
  about.md
```

The filename (without `.md`) becomes the post `id`. Tags, score, and metadata live in YAML frontmatter; the Markdown body is the `content` field.

### Frontend (`src/App.jsx`)

Single-file React SPA. No router — navigation is state-driven (`section`, `view`, `selId`). Key sections marked with banner comments:

- **TAG COLORS** → `src/constants/tagColors.js`
- **SECTION\_ACCENT** → `src/constants/tagColors.js`
- **Components** — `Panel`, `TagBadge`, `Score`, `MD`, `PostCard`, `SectionList`, `PostDetail`, `HomePage`, `AboutPage`
- **App** — root component; owns all state and navigation

### Data loader (`src/data/loader.js`)

Imports all `.md` files using `import.meta.glob` with `eager: true` (synchronous, bundled at build). Uses `gray-matter` to parse frontmatter. Exports `reviews`, `articles`, `tutorials`, `about` as plain arrays/objects.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) runs `npm run build` on every push to `main` and deploys `dist/` to GitHub Pages.

**One-time setup:** Repo Settings → Pages → Source: GitHub Actions.

## Key Conventions

- **Inline styles everywhere** — no CSS files. All styling uses the `style` prop.
- **Adding a new tag** — add an entry to `TAG_COLORS` in `src/constants/tagColors.js`.
- **Adding a new post** — create a `.md` file in the correct `content/` subfolder with appropriate frontmatter. The build picks it up automatically.
- **Adding a new section/content type** — add a new `import.meta.glob` in `loader.js`, export the array, update `App.jsx` (DATA map, nav items, SectionList postType, filters).
- **Content is Markdown** — the body of each `.md` file is rendered by the `MD` component using `marked`.
- **Base URL** — set in `vite.config.js`. Use `"/audwn-notebook/"` for GitHub Pages project site, `"/"` for a custom domain.

## Workflow

After completing and pushing a set of changes, always open a pull request against `main`.
