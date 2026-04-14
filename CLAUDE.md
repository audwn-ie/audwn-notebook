# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Audwn's Notebook** is a personal blog for documenting strategy and builder games. It is a React SPA backed by a Netlify serverless function that proxies the Notion API. Notion serves as the CMS — all content is created/edited in Notion and displayed here.

## Development Commands

```bash
npm install                # Install dependencies
netlify dev                # Run locally at http://localhost:8888 (Vite + serverless function together)
npm run build              # Production build → dist/
npm run preview            # Preview the production build locally
```

> `netlify dev` is preferred over `npm run dev` because it also runs `netlify/functions/notion.js`, making the local environment identical to production. Requires `netlify-cli` installed globally (`npm install -g netlify-cli`).

There are no tests or linters configured.

## Environment Variables

Create a `.env` file for local development (never commit it):

```
NOTION_TOKEN=secret_xxx
REVIEWS_DB_ID=<reviews-database-id>
ARTICLES_DB_ID=<articles-database-id>
TUTORIALS_DB_ID=<tutorials-database-id>
ABOUT_PAGE_ID=<about-page-id>
```

These same variables must be set in the Netlify dashboard for production. The `NOTION_TOKEN` must come from a Notion Internal Integration that has been explicitly connected to each of the three databases.

## Architecture

### Data Flow

```
Browser → React SPA (Netlify CDN)
        → /.netlify/functions/notion?action=list&db=reviews
        → netlify/functions/notion.js (serverless)
        → api.notion.com (authenticated with NOTION_TOKEN)
```

`NOTION_TOKEN` is never exposed to the browser — it exists only in the serverless function's environment.

### Frontend (`src/App.jsx`)

The entire frontend is a single 35KB file. All components, state, styles, and data-fetching logic live here. Key sections (marked with banner comments):

- **NOTION CONFIG** — hard-coded Notion DB IDs and `ABOUT_PAGE_ID`
- **NOTION DATA LAYER** — `notionApi` object with `list()`, `get()`, `about()` methods
- **MOCK DATA** — fallback data shown when the API is unreachable (triggers DEMO mode with a warning banner)
- **TAG COLORS** — static map of tag name → `{bg, text, border}` CSS values; add new entries here when adding new tags
- **SECTION\_ACCENT** — per-section primary accent color
- **Components** — `Panel`, `TagBadge`, `Score`, `MD`, `PostCard`, `SectionList`, `PostDetail`, `HomePage`, `AboutPage`
- **App** — root component; owns all state and routing

State is managed entirely with React hooks (`useState`, `useEffect`, `useCallback`) in the `App` component. There is no router — navigation is state-driven (`section`, `post` state variables).

The UI uses a cyberpunk/retro-futuristic theme with inline CSS throughout. Fonts (Share Tech Mono, Rajdhani, Orbitron) are injected via a `<link>` appended to `document.head` at module load time.

### Backend (`netlify/functions/notion.js`)

A single serverless handler that acts as a secure proxy to the Notion API. Key responsibilities:

- **`blocksToMd(blocks)`** — converts Notion block objects to Markdown strings
- **`mdToBlocks(md)`** — converts Markdown strings to Notion block objects for writes
- **`normalizePage(page, blocks)`** — maps a raw Notion page + its blocks into the normalized post shape used everywhere in the frontend
- **Handler** — routes by `action` query param: `list`, `get`, `create`, `update`; responds to `OPTIONS` for CORS preflight

The normalized post shape:
```js
{
  id, postType, notionUrl, title, game, score,
  tags: { progress, genre, priority, artType, difficulty },
  status, createdAt, updatedAt, content,  // content is Markdown
  archives, coverUrl, screenshotUrl
}
```

### Deployment

Deployment is automatic: every push to `main` triggers Netlify to run `npm run build`, publish `dist/`, and deploy the serverless function. Configuration is in `netlify.toml`. The `[[redirects]]` rule (`/* → /index.html`) is what enables SPA client-side routing.

## Key Conventions

- **Inline styles everywhere** — there are no CSS files. All styling is done with the `style` prop. Follow this pattern when adding UI.
- **Adding a new tag** — add an entry to `TAG_COLORS` in `App.jsx`. Without an entry, the tag renders with `DEFAULT_TAG_COLOR`.
- **Adding a new section/content type** — requires changes in both `App.jsx` (UI, state, `notionApi` calls, mock data) and `notion.js` (new DB env var, normalization logic, list/create/update routing).
- **Content is Markdown** — the `content` field on all posts is a Markdown string. The `MD` component in `App.jsx` renders it; `mdToBlocks`/`blocksToMd` in `notion.js` handle the Notion ↔ Markdown conversion.
- **DEMO mode** — if any API call throws, the app silently falls back to `MOCK` data and shows a DEMO banner. This is intentional and should be preserved.

## Workflow

After completing and pushing a set of changes, always open a pull request against `main`.
