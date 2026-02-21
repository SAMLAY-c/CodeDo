const fs = require('fs/promises');
const path = require('path');

const STORE_FILE =
  process.env.ARTICLE_STORE_FILE ||
  path.join('/tmp', 'codedo-articles.json');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_ARTICLES_TABLE || 'articles';
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY);

async function readStore() {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

async function writeStore(data) {
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data), 'utf-8');
}

async function saveArticle(article) {
  if (HAS_SUPABASE) {
    await saveArticleToSupabase(article);
    return;
  }

  const store = await readStore();
  store[article.id] = article;
  await writeStore(store);
}

async function getArticleById(id) {
  if (HAS_SUPABASE) {
    return getArticleByIdFromSupabase(id);
  }

  const store = await readStore();
  return store[id] || null;
}

module.exports = {
  saveArticle,
  getArticleById,
  getArticles,
  updateArticle,
  deleteArticle,
};

async function saveArticleToSupabase(article) {
  const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?on_conflict=id`;
  const payload = [
    {
      id: article.id,
      article,
      created_at: article.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: buildSupabaseHeaders({
      Prefer: 'resolution=merge-duplicates,return=minimal',
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await safeReadText(response);
    throw new Error(`Supabase save failed: ${response.status} ${detail}`);
  }
}

async function getArticleByIdFromSupabase(id) {
  const query = new URLSearchParams({
    select: 'article',
    id: `eq.${id}`,
    limit: '1',
  });
  const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: buildSupabaseHeaders(),
  });

  if (!response.ok) {
    const detail = await safeReadText(response);
    throw new Error(`Supabase read failed: ${response.status} ${detail}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return rows[0].article || null;
}

async function getArticles(options = {}) {
  const category = options.category || 'all';
  const theme = options.theme || 'all';
  const limit = Number(options.limit || 50);
  const offset = Number(options.offset || 0);

  if (HAS_SUPABASE) {
    const rows = await getArticlesFromSupabase();
    const filtered = rows.filter((article) => {
      const categoryMatch = category === 'all' || article.category === category;
      const themeMatch = theme === 'all' || article.themeId === theme;
      return categoryMatch && themeMatch;
    });
    const paged = filtered.slice(offset, offset + limit);
    return {
      items: paged,
      total: filtered.length,
      themes: buildThemeStats(rows),
    };
  }

  const local = await readStore();
  const items = Object.values(local).sort((a, b) => {
    const bTime = new Date(b.createdAt || b.date || 0).getTime();
    const aTime = new Date(a.createdAt || a.date || 0).getTime();
    return bTime - aTime;
  });
  const filtered = items.filter((item) => {
    const categoryMatch = category === 'all' || item.category === category;
    const themeMatch = theme === 'all' || item.themeId === theme;
    return categoryMatch && themeMatch;
  });
  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    themes: buildThemeStats(items),
  };
}

async function updateArticle(id, patch = {}) {
  const current = await getArticleById(id);
  if (!current) {
    return null;
  }

  const next = {
    ...current,
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };

  await saveArticle(next);
  return next;
}

async function deleteArticle(id) {
  if (HAS_SUPABASE) {
    const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${encodeURIComponent(id)}`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: buildSupabaseHeaders({
        Prefer: 'return=minimal',
      }),
    });

    if (!response.ok) {
      const detail = await safeReadText(response);
      throw new Error(`Supabase delete failed: ${response.status} ${detail}`);
    }
    return true;
  }

  const local = await readStore();
  if (!local[id]) {
    return false;
  }
  delete local[id];
  await writeStore(local);
  return true;
}

async function getArticlesFromSupabase() {
  const query = new URLSearchParams({
    select: 'article,created_at',
    order: 'created_at.desc',
    limit: '500',
  });
  const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: buildSupabaseHeaders(),
  });

  if (!response.ok) {
    const detail = await safeReadText(response);
    throw new Error(`Supabase list failed: ${response.status} ${detail}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => row.article).filter(Boolean);
}

function buildThemeStats(items) {
  const map = new Map();
  for (const item of items) {
    const id = item.themeId || 'uncategorized';
    const name = item.themeName || '未分类主题';
    const current = map.get(id) || { id, name, count: 0 };
    current.count += 1;
    map.set(id, current);
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function buildSupabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
