# API Structure

## Article Model
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
  "coverImage": "string?",
  "mediaBlocks": [
    {
      "id": "string?",
      "type": "image | video | text | gallery",
      "url": "string?",
      "text": "string?",
      "images": ["string"],
      "caption": "string?",
      "order": 1,
      "style": { "layout": "fullWidth | twoColumn | waterfall | inset" },
      "poster": "string?"
    }
  ]
}
```

## Theme Model
```json
{
  "id": "string",
  "code": "01",
  "name": "Vibe Coding教程",
  "subtitle": "Vibe Coding入门",
  "coverImage": "string?",
  "bannerImage": "string?",
  "gallery": ["string"],
  "introVideo": "string?",
  "layout": {
    "heroStyle": "full | split | overlay",
    "cardColumns": 3,
    "sectionOrder": ["banner", "gallery", "articles"]
  },
  "sortOrder": 1,
  "isActive": true
}
```

## APIs
1. `POST /api/upload`
2. `GET /api/get-article/:id`
3. `GET /api/get-articles?category=all|basic|tools|project&theme=all|{themeId}&limit=50&offset=0`
4. `PUT /api/article/:id`
5. `DELETE /api/article/:id`
6. `POST /api/seed-tutorials`
7. `GET /api/themes`
8. `POST /api/themes`
9. `GET /api/theme/:id`
10. `PUT /api/theme/:id`
11. `DELETE /api/theme/:id`
12. `POST /api/seed-themes`
13. `POST /api/media/upload`

## Notes
1. `GET /api/get-articles` includes `themes` aggregation.
2. `DELETE /api/theme/:id` blocks if related courses exist.
3. `POST /api/media/upload` supports JSON mode (`url`) and multipart mode (`file`).
