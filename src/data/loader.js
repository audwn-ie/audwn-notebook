import matter from "gray-matter";

// ─── Raw file imports (eager = bundled at build time, zero runtime fetches) ────

const reviewRaw   = import.meta.glob("/content/reviews/*.md",        { query: "?raw", import: "default", eager: true });
const articleRaw  = import.meta.glob("/content/articles/*.md",       { query: "?raw", import: "default", eager: true });
const tutorialRaw = import.meta.glob("/content/tutorials/*.md",      { query: "?raw", import: "default", eager: true });
const archiveRaw  = import.meta.glob("/content/reviews/*/*.md",      { query: "?raw", import: "default", eager: true });
const aboutRaw    = import.meta.glob("/content/about.md",            { query: "?raw", import: "default", eager: true });

// ─── Helpers ────────────────────────────────────────────────────────────────────

function slug(path) {
  return path.split("/").pop().replace(".md", "");
}

function parsePost(raw, postType, id) {
  const { data, content } = matter(raw);
  return {
    id,
    postType,
    title:        data.title        || "",
    game:         data.game         || "",
    score:        data.score        ?? null,
    status:       data.status       || "published",
    createdAt:    data.createdAt    || "",
    updatedAt:    data.updatedAt    || "",
    tags: {
      progress:   data.tags?.progress   || "",
      genre:      data.tags?.genre      || [],
      priority:   data.tags?.priority   || "",
      artType:    data.tags?.artType    || "",
      difficulty: data.tags?.difficulty || "",
    },
    content:      content.trim(),
    archives:     [],
    coverUrl:     data.coverUrl     || null,
    screenshotUrl: data.screenshotUrl || null,
  };
}

// ─── Archives ────────────────────────────────────────────────────────────────────
// Each archive lives at content/reviews/{review-slug}/{date}.md
// Frontmatter: archivedAt, score, tags.progress

const archiveMap = {};
for (const [path, raw] of Object.entries(archiveRaw)) {
  const parts   = path.split("/");
  const reviewId = parts[parts.length - 2];
  const { data, content } = matter(raw);
  if (!archiveMap[reviewId]) archiveMap[reviewId] = [];
  archiveMap[reviewId].push({
    id:         slug(path),
    archivedAt: data.archivedAt || slug(path),
    score:      data.score      ?? null,
    tags:       { progress: data.tags?.progress || "" },
    content:    content.trim(),
  });
}

// Sort each review's archives newest-first
for (const id of Object.keys(archiveMap)) {
  archiveMap[id].sort((a, b) => b.archivedAt.localeCompare(a.archivedAt));
}

// ─── Exports ─────────────────────────────────────────────────────────────────────

export const reviews = Object.entries(reviewRaw)
  .map(([path, raw]) => {
    const id   = slug(path);
    const post = parsePost(raw, "review", id);
    post.archives = archiveMap[id] || [];
    return post;
  })
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

export const articles = Object.entries(articleRaw)
  .map(([path, raw]) => parsePost(raw, "article", slug(path)))
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

export const tutorials = Object.entries(tutorialRaw)
  .map(([path, raw]) => parsePost(raw, "tutorial", slug(path)))
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

const aboutFile = Object.values(aboutRaw)[0] || "";
const { content: aboutBody } = matter(aboutFile);
export const about = { content: aboutBody.trim() };
