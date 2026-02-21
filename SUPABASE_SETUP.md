# Supabase 持久化配置

## 1) 在 Supabase SQL Editor 执行建表

```sql
create table if not exists public.articles (
  id text primary key,
  article jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_created_at on public.articles (created_at desc);
```

## 2) 配置环境变量（Netlify）

必填：

- `SUPABASE_URL=https://tztlfpnhgcajimzyqnml.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥`

可选：

- `SUPABASE_ANON_KEY=你的publishable/anon密钥`（仅当你不使用 service_role 时兜底）
- `SUPABASE_ARTICLES_TABLE=articles`
- `SEED_TOKEN=自定义导入令牌`（保护 `POST /api/seed-tutorials`）

## 3) 注意事项

- 推荐使用 `SUPABASE_SERVICE_ROLE_KEY`（服务端函数专用，不要放前端）。
- 如果只用 `SUPABASE_ANON_KEY`，需要你自行配置 RLS policy 允许读写，否则会 401/403。
- 当前代码已内置本地文件兜底（`/tmp/codedo-articles.json`），用于未配置 Supabase 时的临时运行。
