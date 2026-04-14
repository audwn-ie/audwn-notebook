# Audwn's Notebook — Netlify Deployment Guide

## Project structure

```
audwn-notebook/
  netlify/
    functions/
      notion.js         ← Notion API proxy (serverless function)
  src/
    App.jsx             ← Main React app
    main.jsx            ← React entry point
  index.html
  package.json
  vite.config.js
  netlify.toml          ← tells Netlify how to build + where functions live
```

---

## Step 1 — Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. **New integration** → name it `audwns-notebook` → copy the `secret_xxx` token
3. In Notion, open each database → `...` → **Connections** → connect your integration

---

## Step 2 — Deploy to Netlify

### Option A — Drag & Drop (fastest, no Git needed)

```bash
npm install
npm run build
```

Go to https://app.netlify.com → **Add new site → Deploy manually** → drag the `dist/` folder.

> ⚠ Drag & drop deploys the static files only — the serverless function won't run this way.
> Use Option B for full functionality.

### Option B — GitHub + Netlify (recommended, auto-deploys on push)

1. Push this folder to a GitHub repo
2. Go to https://app.netlify.com → **Add new site → Import from Git**
3. Select your repo — Netlify auto-detects `netlify.toml` and configures everything
4. Click **Deploy**

---

## Step 3 — Add environment variables

In Netlify: **Site settings → Environment variables → Add variable**

| Key               | Value                                    |
|-------------------|------------------------------------------|
| `NOTION_TOKEN`    | `secret_xxxxxxxxxxxx`                    |
| `REVIEWS_DB_ID`   | your Reviews database ID                 |
| `ARTICLES_DB_ID`  | your Articles database ID                |
| `TUTORIALS_DB_ID` | your Tutorials database ID               |
| `ABOUT_PAGE_ID`   | your About page ID                       |

Then **Trigger redeploy** (Deploys → Trigger deploy → Deploy site).

Your site is live. Done.

---

## Local development

```bash
npm install
npm install -g netlify-cli

# Create a .env file for local dev
echo 'NOTION_TOKEN=secret_xxx
REVIEWS_DB_ID=your-reviews-db-id
ARTICLES_DB_ID=your-articles-db-id
TUTORIALS_DB_ID=your-tutorials-db-id
ABOUT_PAGE_ID=your-about-page-id' > .env

netlify dev
# → http://localhost:8888
```

`netlify dev` runs Vite and the serverless function together — identical to production.

---

## How it works

```
Your browser
  → loads static React app from Netlify CDN
  → calls /.netlify/functions/notion?action=list&db=reviews
  → Netlify runs notion.js serverlessly
  → notion.js calls api.notion.com with your secret token
  → data renders in the app
```

Your `NOTION_TOKEN` never touches the browser. It only lives in Netlify's environment.

---

## Notes

- **DEMO mode** — if the function is unreachable, the app shows mock data with a ⚠ DEMO banner.
- **Auto-deploy** — every push to `main` triggers a new deploy automatically (Option B only).
- **Custom domain** — Netlify → Domain settings → Add custom domain. Free SSL included.
- **Archives** — stored in session memory. Ask for a v2 that persists them as Notion sub-pages.
