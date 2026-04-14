# Audwn's Notebook

A personal blog for strategy and builder games. Built with React + Vite, deployed to GitHub Pages. All content lives as Markdown files in `content/`.

---

## Adding content

### New review

Create `content/reviews/your-game-title.md`:

```md
---
title: "Your Review Title"
game: "Game Name"
score: 8.5
status: published
updatedAt: "2024-06-01"
tags:
  progress: Completed       # Playing | Completed | On Hold | Abandoned | Backlog
  genre:
    - Builder
    - Strategy
  priority: High            # Critical | High | Medium | Low
---

Your content here in Markdown.
```

### New article

Create `content/articles/your-article-slug.md`:

```md
---
title: "Article Title"
game: "Game Name"
status: published
updatedAt: "2024-06-01"
tags:
  genre:
    - Builder
  artType: Impressions      # Impressions | Deep Dive | Opinion | Update Notes | Retrospective
---
```

### New tutorial

Create `content/tutorials/your-tutorial-slug.md`:

```md
---
title: "Tutorial Title"
game: "Game Name"
status: published
updatedAt: "2024-06-01"
tags:
  genre:
    - City Builder
  difficulty: Beginner      # Beginner | Intermediate | Advanced | Expert
---
```

### Review archives

To add an archived revision to a review, create a subfolder matching the review's filename and add a dated MD file:

```
content/reviews/factorio/2023-06-15.md
```

```md
---
archivedAt: "2023-06-15"
score: 9.5
tags:
  progress: Playing
---

Previous version of the review content.
```

### About page

Edit `content/about.md`.

---

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the build
```

---

## Deployment

Every push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`) which builds and deploys to GitHub Pages automatically.

**One-time setup:**
1. Go to repo **Settings → Pages**
2. Set source to **GitHub Actions**
3. Push to `main` — the workflow handles the rest

The site will be live at `https://<your-username>.github.io/audwn-notebook/`.

**Custom domain:** update `base` in `vite.config.js` from `"/audwn-notebook/"` to `"/"`, then configure your domain in Settings → Pages.
