# 教程 API 结构（可覆盖全部内容）

## 数据模型（Article）

```json
{
  "id": "string",
  "title": "string",
  "excerpt": "string",
  "content": "string (HTML)",
  "author": "string",
  "date": "YYYY-MM-DD",
  "createdAt": "ISO datetime",
  "readTime": "string",
  "category": "basic | tools | project",
  "themeId": "string?",
  "themeName": "string?",
  "difficulty": "入门 | 中级 | 进阶",
  "duration": "string",
  "episodes": "number",
  "image": "string?",
  "status": "hot | new | coming ?",
  "statusLabel": "string?",
  "featured": "boolean?",
  "filename": "string?",
  "fileType": "html | image | video ?",
  "url": "string?",
  "articleUrl": "string?",
  "tags": ["string"],
  "keyPoints": ["string"],
  "toc": [{ "id": "string", "label": "string", "level": "number" }]
}
```

## 接口

### 1) 上传并解析文章

- `POST /api/upload`
- 入参：`multipart/form-data`（`file`, `fileType`, `title`, `category`, `tags`）
- 出参：`Article + { success: true }`

### 2) 获取文章详情

- `GET /api/get-article/:id`
- 出参：`Article`

### 3) 获取文章列表

- `GET /api/get-articles?category=all|basic|tools|project&theme=all|{themeId}&limit=50&offset=0`
- 出参：

```json
{
  "items": ["Article"],
  "themes": [{ "id": "string", "name": "string", "count": 3 }],
  "total": 6,
  "category": "all",
  "theme": "all",
  "limit": 50,
  "offset": 0
}
```

### 4) 导入现有教程种子数据

- `POST /api/seed-tutorials`
- 可选 Header：`x-seed-token`（当配置 `SEED_TOKEN` 时必填）
- 出参：

```json
{
  "success": true,
  "count": 6,
  "ids": ["1", "2", "3", "4", "5", "6"]
}
```

### 5) 更新文章（后台管理）

- `PUT /api/article/:id`
- Body：`Article` 的局部字段（JSON）
- 出参：

```json
{
  "success": true,
  "item": "Article"
}
```

### 6) 删除文章（后台管理）

- `DELETE /api/article/:id`
- 出参：

```json
{
  "success": true,
  "id": "string"
}
```

## 推荐流程

1. 先调用 `POST /api/seed-tutorials` 导入现有教程。
2. 前端列表页使用 `GET /api/get-articles`。
3. 详情页使用 `GET /api/get-article/:id`。
4. 新教程继续走 `POST /api/upload`。
5. 后台编辑/删除分别走 `PUT /api/article/:id` 和 `DELETE /api/article/:id`。
