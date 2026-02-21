# Supabase Setup

## 1) Run SQL in Supabase SQL Editor

```sql
create table if not exists public.articles (
  id text primary key,
  article jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_created_at on public.articles (created_at desc);

create table if not exists public.themes (
  id text primary key,
  theme jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_themes_created_at on public.themes (created_at desc);
```

## 2) Netlify Environment Variables

Required:
- `SUPABASE_URL=https://tztlfpnhgcajimzyqnml.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`

Optional:
- `SUPABASE_ANON_KEY=your-publishable-or-anon-key`
- `SUPABASE_ARTICLES_TABLE=articles`
- `SUPABASE_THEMES_TABLE=themes`
- `SEED_TOKEN=your-seed-token`

## 3) Notes

- Prefer `SUPABASE_SERVICE_ROLE_KEY` for server functions.
- If using anon key only, configure RLS policies for read/write.
- Local file fallback is still enabled for development:
  - articles: `/tmp/codedo-articles.json`
  - themes: `/tmp/codedo-themes.json`
