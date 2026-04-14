/**
 * AUDWN'S NOTEBOOK — Notion API Proxy
 * Deploy at: netlify/functions/notion.js
 *
 * Required environment variables in Netlify dashboard:
 *   NOTION_TOKEN      — your Internal Integration Token (secret_xxx)
 *   REVIEWS_DB_ID     — Notion database ID for reviews
 *   ARTICLES_DB_ID    — Notion database ID for articles
 *   TUTORIALS_DB_ID   — Notion database ID for tutorials
 *   ABOUT_PAGE_ID     — Notion page ID for the About page
 *
 * Endpoints (all via /.netlify/functions/notion):
 *   GET  ?action=list&db=reviews|articles|tutorials
 *   GET  ?action=get&id=PAGE_ID
 *   POST ?action=create   body: { db, postType, title, game, content, score, tags, status }
 *   POST ?action=update&id=PAGE_ID  body: same as create
 */

const NOTION_VERSION = "2022-06-28";
const BASE = "https://api.notion.com/v1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

async function notion(path, method = "GET", body = null) {
  const token = process.env.NOTION_TOKEN;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Notion API error");
  return json;
}

// ─── Block converters ──────────────────────────────────────────────────────────

// Convert a Notion rich_text array to a Markdown string, preserving
// bold, italic, inline code, and links.
function richTextToMd(rt) {
  return rt.map((r) => {
    let text = r.plain_text;
    if (r.href) text = `[${text}](${r.href})`;
    if (r.annotations?.code) text = `\`${text}\``;
    if (r.annotations?.bold && r.annotations?.italic) text = `***${text}***`;
    else if (r.annotations?.bold) text = `**${text}**`;
    else if (r.annotations?.italic) text = `*${text}*`;
    return text;
  }).join("");
}

function blocksToMd(blocks) {
  return blocks
    .map((b) => {
      const rt = b[b.type]?.rich_text || [];
      const text = richTextToMd(rt);
      switch (b.type) {
        case "heading_1": return `# ${text}`;
        case "heading_2": return `## ${text}`;
        case "heading_3": return `### ${text}`;
        case "bulleted_list_item": return `- ${text}`;
        case "numbered_list_item": return `1. ${text}`;
        case "code": return `\`\`\`\n${b.code?.rich_text?.map((r) => r.plain_text).join("") || ""}\n\`\`\``;
        case "paragraph": return text;
        default: return text;
      }
    })
    .join("\n");
}

// Convert a Markdown string to Notion block objects.
// Supports headings (h1–h3), bullet/numbered lists, inline code, bold, italic, and links.
function mdToBlocks(md) {
  // Parse inline Markdown in a line into a Notion rich_text array.
  function parseInline(line) {
    const tokens = [];
    // Regex matches: links, inline code, bold+italic, bold, italic, plain text
    const re = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|([^`*[\]]+)/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      if (m[1] != null) {
        // link
        tokens.push({ type: "text", text: { content: m[1], link: { url: m[2] } } });
      } else if (m[3] != null) {
        // inline code
        tokens.push({ type: "text", text: { content: m[3] }, annotations: { code: true } });
      } else if (m[4] != null) {
        // bold + italic
        tokens.push({ type: "text", text: { content: m[4] }, annotations: { bold: true, italic: true } });
      } else if (m[5] != null) {
        // bold
        tokens.push({ type: "text", text: { content: m[5] }, annotations: { bold: true } });
      } else if (m[6] != null) {
        // italic
        tokens.push({ type: "text", text: { content: m[6] }, annotations: { italic: true } });
      } else if (m[7] != null) {
        // plain text
        tokens.push({ type: "text", text: { content: m[7] } });
      }
    }
    return tokens.length ? tokens : [{ type: "text", text: { content: line } }];
  }

  const lines = (md || "").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        object: "block", type: "code",
        code: { rich_text: [{ type: "text", text: { content: codeLines.join("\n") } }], language: "plain text" },
      });
    } else if (line.startsWith("### ")) {
      blocks.push({ object: "block", type: "heading_3", heading_3: { rich_text: parseInline(line.slice(4)) } });
    } else if (line.startsWith("## ")) {
      blocks.push({ object: "block", type: "heading_2", heading_2: { rich_text: parseInline(line.slice(3)) } });
    } else if (line.startsWith("# ")) {
      blocks.push({ object: "block", type: "heading_1", heading_1: { rich_text: parseInline(line.slice(2)) } });
    } else if (line.startsWith("- ")) {
      blocks.push({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: parseInline(line.slice(2)) } });
    } else if (/^\d+\. /.test(line)) {
      blocks.push({ object: "block", type: "numbered_list_item", numbered_list_item: { rich_text: parseInline(line.replace(/^\d+\. /, "")) } });
    } else {
      blocks.push({ object: "block", type: "paragraph", paragraph: { rich_text: line ? parseInline(line) : [] } });
    }
    i++;
  }

  return blocks;
}

// ─── Property builders ─────────────────────────────────────────────────────────

function buildProps(data) {
  const { postType, title, game, score, tags = {}, status } = data;
  const props = {
    Name: { title: [{ text: { content: title || "" } }] },
    Game: { rich_text: [{ text: { content: game || "" } }] },
    Status: { select: { name: status || "draft" } },
    Genre: { multi_select: (tags.genre || []).map((g) => ({ name: g })) },
  };
  if (postType === "review") {
    props.Score = { number: score || 0 };
    if (tags.progress) props.Progress = { select: { name: tags.progress } };
    if (tags.priority) props.Priority = { select: { name: tags.priority } };
  }
  if (postType === "article" && tags.artType)
    props.ArticleType = { select: { name: tags.artType } };
  if (postType === "tutorial" && tags.difficulty)
    props.Difficulty = { select: { name: tags.difficulty } };
  return props;
}

// ─── Page normaliser ───────────────────────────────────────────────────────────

function normalisePage(p, postType, content = "") {
  const prop = (key) => p.properties?.[key];
  return {
    id: p.id,
    postType,
    notionUrl: p.url,
    title: prop("Name")?.title?.[0]?.plain_text || "",
    game: prop("Game")?.rich_text?.[0]?.plain_text || "",
    score: prop("Score")?.number ?? null,
    tags: {
      progress: prop("Progress")?.select?.name || "",
      genre: prop("Genre")?.multi_select?.map((g) => g.name) || [],
      priority: prop("Priority")?.select?.name || "",
      artType: prop("ArticleType")?.select?.name || "",
      difficulty: prop("Difficulty")?.select?.name || "",
    },
    status: prop("Status")?.select?.name || "draft",
    createdAt: p.created_time?.slice(0, 10) || "",
    updatedAt: p.last_edited_time?.slice(0, 10) || "",
    content,
    archives: [], // populated by fetchArchives() in action=get for reviews
    coverUrl: null,
    screenshotUrl: null,
  };
}

// ─── Archive helpers ──────────────────────────────────────────────────────────

// Save the current state of a review as a child page before overwriting.
// The first block of the archive page is a JSON metadata paragraph;
// the remaining blocks are the archived content.
async function createArchivePage(pageId, currentPage, currentBlocks) {
  const prop = (key) => currentPage.properties?.[key];
  const meta = {
    archivedAt: new Date().toISOString().slice(0, 10),
    score: prop("Score")?.number ?? null,
    progress: prop("Progress")?.select?.name || "",
  };
  const metaBlock = {
    object: "block", type: "paragraph",
    paragraph: { rich_text: [{ type: "text", text: { content: `ARCHIVE_META:${JSON.stringify(meta)}` } }] },
  };
  await notion("/pages", "POST", {
    parent: { page_id: pageId },
    properties: { title: { title: [{ text: { content: `ARCHIVE // ${meta.archivedAt}` } }] } },
    children: [metaBlock, ...currentBlocks.filter((b) => b.type !== "child_page")],
  });
}

// Fetch all archive child pages for a review and return them as archive objects.
async function fetchArchives(pageId) {
  const children = await notion(`/blocks/${pageId}/children?page_size=100`);
  const archiveBlocks = (children.results || []).filter(
    (b) => b.type === "child_page" && b.child_page?.title?.startsWith("ARCHIVE //")
  );
  if (!archiveBlocks.length) return [];

  const archives = await Promise.all(
    archiveBlocks.map(async (b) => {
      const blocks = await notion(`/blocks/${b.id}/children?page_size=100`);
      const results = blocks.results || [];
      // First block is the metadata paragraph
      const metaBlock = results[0];
      const metaText = metaBlock?.paragraph?.rich_text?.[0]?.plain_text || "";
      let meta = {};
      if (metaText.startsWith("ARCHIVE_META:")) {
        try { meta = JSON.parse(metaText.slice(13)); } catch (_) { /* ignore */ }
      }
      const content = blocksToMd(results.slice(1));
      return {
        id: b.id,
        archivedAt: meta.archivedAt || b.child_page.title.replace("ARCHIVE // ", ""),
        score: meta.score ?? null,
        tags: { progress: meta.progress || "" },
        content,
      };
    })
  );
  // Most recent first
  return archives.sort((a, b) => b.archivedAt.localeCompare(a.archivedAt));
}

// ─── Handler ───────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers: CORS, body: "" };

  const DB = {
    reviews:   process.env.REVIEWS_DB_ID,
    articles:  process.env.ARTICLES_DB_ID,
    tutorials: process.env.TUTORIALS_DB_ID,
  };
  const POST_TYPE = { reviews: "review", articles: "article", tutorials: "tutorial" };

  const qs  = event.queryStringParameters || {};
  const action = qs.action;
  const db     = qs.db;
  const id     = qs.id;

  try {
    // ── ABOUT PAGE ────────────────────────────────────────────────────────────
    if (action === "about") {
      const aboutId = process.env.ABOUT_PAGE_ID;
      if (!aboutId) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "ABOUT_PAGE_ID env var is not set" }) };
      const [page, blocks] = await Promise.all([
        notion(`/pages/${aboutId}`),
        notion(`/blocks/${aboutId}/children?page_size=100`),
      ]);
      return { statusCode: 200, headers: CORS, body: JSON.stringify({
        id: page.id, content: blocksToMd(blocks.results || []),
      })};
    }

    // ── LIST ──────────────────────────────────────────────────────────────────
    if (action === "list") {
      const dbId = DB[db];
      if (!dbId) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unknown db" }) };

      const allPages = [];
      let cursor;
      do {
        const result = await notion(`/databases/${dbId}/query`, "POST", {
          sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        });
        allPages.push(...result.results);
        cursor = result.has_more ? result.next_cursor : null;
      } while (cursor);

      const pages = allPages.map((p) => normalisePage(p, POST_TYPE[db]));
      return { statusCode: 200, headers: CORS, body: JSON.stringify(pages) };
    }

    // ── GET SINGLE PAGE ───────────────────────────────────────────────────────
    if (action === "get") {
      const [page, blocks] = await Promise.all([
        notion(`/pages/${id}`),
        notion(`/blocks/${id}/children?page_size=100`),
      ]);
      const content = blocksToMd((blocks.results || []).filter((b) => b.type !== "child_page"));
      // Determine postType from which DB the page belongs to
      const dbId = page.parent?.database_id?.replace(/-/g, "");
      const postType =
        dbId === DB.reviews?.replace(/-/g, "")   ? "review"   :
        dbId === DB.articles?.replace(/-/g, "")  ? "article"  : "tutorial";

      const post = normalisePage(page, postType, content);
      if (postType === "review") post.archives = await fetchArchives(id);

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify(post),
      };
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    if (action === "create" && event.httpMethod === "POST") {
      const data = JSON.parse(event.body);
      const dbId = DB[data.db];
      if (!dbId) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unknown db" }) };

      const page = await notion("/pages", "POST", {
        parent: { database_id: dbId },
        properties: buildProps(data),
        children: mdToBlocks(data.content),
      });

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ id: page.id, notionUrl: page.url }),
      };
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    if (action === "update" && event.httpMethod === "POST") {
      const data = JSON.parse(event.body);

      // 1. Fetch current state before overwriting
      const [currentPage, existing] = await Promise.all([
        notion(`/pages/${id}`),
        notion(`/blocks/${id}/children?page_size=100`),
      ]);

      // 2. Archive the current version for reviews before overwriting
      if (data.postType === "review") {
        await createArchivePage(id, currentPage, existing.results || []);
      }

      // 3. Update properties
      await notion(`/pages/${id}`, "PATCH", { properties: buildProps(data) });

      // 4. Replace content blocks (skip child_page blocks — those are archives)
      const contentBlocks = (existing.results || []).filter((b) => b.type !== "child_page");
      await Promise.all(contentBlocks.map((b) => notion(`/blocks/${b.id}`, "DELETE")));
      await notion(`/blocks/${id}/children`, "PATCH", {
        children: mdToBlocks(data.content),
      });

      return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unknown action" }) };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
