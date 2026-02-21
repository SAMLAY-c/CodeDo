const fs = require('fs/promises');
const path = require('path');

const STORE_FILE =
  process.env.THEME_STORE_FILE || path.join('/tmp', 'codedo-themes.json');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_THEMES_TABLE || 'themes';
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY);

async function readStore() {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function writeStore(data) {
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data), 'utf-8');
}

async function saveTheme(theme) {
  if (HAS_SUPABASE) {
    await saveThemeToSupabase(theme);
    return;
  }
  const local = await readStore();
  local[theme.id] = theme;
  await writeStore(local);
}

async function getThemeById(id) {
  if (HAS_SUPABASE) return getThemeByIdFromSupabase(id);
  const local = await readStore();
  return local[id] || null;
}

async function getThemes() {
  if (HAS_SUPABASE) return getThemesFromSupabase();
  const local = await readStore();
  return Object.values(local).sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
}

async function updateTheme(id, patch = {}) {
  const current = await getThemeById(id);
  if (!current) return null;
  const next = { ...current, ...patch, id, updatedAt: new Date().toISOString() };
  await saveTheme(next);
  return next;
}

async function deleteTheme(id) {
  if (HAS_SUPABASE) {
    const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${encodeURIComponent(id)}`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: supabaseHeaders({ Prefer: 'return=minimal' }),
    });
    if (!response.ok) {
      const detail = await safeReadText(response);
      throw new Error(`Supabase theme delete failed: ${response.status} ${detail}`);
    }
    return true;
  }
  const local = await readStore();
  if (!local[id]) return false;
  delete local[id];
  await writeStore(local);
  return true;
}

module.exports = {
  saveTheme,
  getThemeById,
  getThemes,
  updateTheme,
  deleteTheme,
};

async function saveThemeToSupabase(theme) {
  const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?on_conflict=id`;
  const payload = [
    {
      id: theme.id,
      theme,
      created_at: theme.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: supabaseHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await safeReadText(response);
    throw new Error(`Supabase theme save failed: ${response.status} ${detail}`);
  }
}

async function getThemeByIdFromSupabase(id) {
  const query = new URLSearchParams({
    select: 'theme',
    id: `eq.${id}`,
    limit: '1',
  });
  const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: supabaseHeaders(),
  });
  if (!response.ok) {
    const detail = await safeReadText(response);
    throw new Error(`Supabase theme read failed: ${response.status} ${detail}`);
  }
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows[0].theme || null;
}

async function getThemesFromSupabase() {
  const query = new URLSearchParams({
    select: 'theme',
    order: 'created_at.desc',
    limit: '200',
  });
  const endpoint = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: supabaseHeaders(),
  });
  if (!response.ok) {
    const detail = await safeReadText(response);
    throw new Error(`Supabase themes list failed: ${response.status} ${detail}`);
  }
  const rows = await response.json();
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => row.theme)
    .filter(Boolean)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
}

function supabaseHeaders(extra = {}) {
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
