const Buffer = require('buffer').Buffer;
const crypto = require('crypto');
const { saveArticle } = require('./_lib/articleStore');

// 文件类型枚举
const FileType = {
  HTML: 'html',
  IMAGE: 'image',
  VIDEO: 'video'
};

// 文件大小限制（字节）
const MAX_FILE_SIZE = {
  [FileType.HTML]: 10 * 1024 * 1024,    // 10MB
  [FileType.IMAGE]: 20 * 1024 * 1024,   // 20MB
  [FileType.VIDEO]: 100 * 1024 * 1024   // 100MB
};

// 分类映射
const CATEGORY_MAP = {
  'article': 'basic',      // 文章博客 -> 基础入门
  'tech': 'tools',         // 技术文档 -> 工具使用
  'media': 'project',      // 媒体资源 -> 实战项目
  'custom': 'basic'        // 自定义 -> 基础入门
};

exports.handler = async (event, context) => {
  // 设置 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 解码请求体（如果是 base64 编码）
    let body = event.body;
    if (event.isBase64Encoded) {
      body = Buffer.from(body, 'base64').toString('utf-8');
    }

    // 解析 multipart/form-data
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    const formData = parseMultipartData(body, contentType);

    if (!formData || !formData.file) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '没有收到文件' })
      };
    }

    // 获取参数
    const file = formData.file;
    const fileType = formData.fileType || FileType.HTML;
    const title = formData.title?.trim() || file.filename;
    const category = formData.category || 'article';
    const themeId = formData.themeId || '';
    const themeName = formData.themeName || '';
    const tags = formData.tags ? JSON.parse(formData.tags) : [];
    const coverImage = formData.coverImage || '';
    const mediaBlocks = formData.mediaBlocks ? JSON.parse(formData.mediaBlocks) : [];

    // 验证文件类型
    if (!Object.values(FileType).includes(fileType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '无效的文件类型' })
      };
    }

    // 验证文件大小
    const maxSize = MAX_FILE_SIZE[fileType];
    if (file.content.length > maxSize) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `文件过大，最大允许 ${Math.round(maxSize / 1024 / 1024)}MB`
        })
      };
    }

    // 对于 HTML 文件，验证内容
    if (fileType === FileType.HTML) {
      const contentLower = file.content.toLowerCase();
      if (!contentLower.includes('<html') && !contentLower.includes('<!doctype')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '无效的 HTML 文件' })
        };
      }

      // 验证内容长度
      if (file.content.length < 100) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'HTML 内容太少' })
        };
      }
    }

    // 生成唯一 ID
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // 解析 HTML 内容
    let parsedContent = null;
    let extractedTitle = title;
    let excerpt = '';
    let keyPoints = [];
    let toc = [];

    if (fileType === FileType.HTML) {
      // 提取 HTML 标题
      const titleMatch = file.content.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && !formData.title) {
        extractedTitle = titleMatch[1];
      }

      // 提取 h1 标题
      const h1Match = file.content.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (h1Match && !formData.title) {
        extractedTitle = h1Match[1].replace(/<[^>]*>/g, '').trim();
      }

      // 提取摘要（从第一个 p 标签或 meta description）
      const descMatch = file.content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
      if (descMatch) {
        excerpt = descMatch[1];
      } else {
        const pMatch = file.content.match(/<p[^>]*>(.*?)<\/p>/is);
        if (pMatch) {
          excerpt = pMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 200);
        }
      }

      // 提取核心要点（从第一个 ul 或 ol）
      const listMatch = file.content.match(/<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/i);
      if (listMatch) {
        const items = listMatch[2].match(/<li[^>]*>(.*?)<\/li>/gi);
        if (items) {
          keyPoints = items
            .map(item => item.replace(/<[^>]*>/g, '').trim())
            .filter(text => text.length > 0)
            .slice(0, 5);
        }
      }

      // 生成目录（提取 h2, h3）
      const headingMatch = file.content.match(/<(h[23])([^>]*id=["']([^"']+)["']|[^>]*)>(.*?)<\/\1>/gi);
      if (headingMatch) {
        toc = headingMatch
          .map(match => {
            const levelMatch = match.match(/<h([23])>/);
            const idMatch = match.match(/id=["']([^"']+)["']/) ||
                           match.match(/>(.*?)</);
            const textMatch = match.match(/>(.*?)</);
            return {
              id: idMatch ? idMatch[1] : `section-${toc.length}`,
              label: textMatch ? textMatch[1].replace(/<[^>]*>/g, '').trim() : '',
              level: levelMatch ? parseInt(levelMatch[1]) - 1 : 1
            };
          })
          .filter(item => item.label)
          .slice(0, 20);
      }

      // 构建解析后的内容
      parsedContent = {
        title: extractedTitle,
        content: file.content,
        excerpt,
        keyPoints,
        toc
      };
    }

    // 映射分类
    const mappedCategory = CATEGORY_MAP[category] || 'basic';

    // 构建文章数据（兼容现有格式）
    const article = {
      id,
      filename: file.filename,
      fileType,
      title: extractedTitle,
      excerpt,
      author: 'AI编程导师', // 默认作者，可以后续修改
      date: timestamp.split('T')[0],
      readTime: estimateReadTime(file.content),
      category: mappedCategory,
      ...(themeId && { themeId }),
      ...(themeName && { themeName }),
      tags,
      size: file.content.length,
      createdAt: timestamp,
      ...(coverImage && { coverImage }),
      ...(Array.isArray(mediaBlocks) && mediaBlocks.length > 0 && { mediaBlocks }),
      // HTML 文件特有字段
      ...(fileType === FileType.HTML && {
        content: file.content,
        keyPoints,
        toc,
        difficulty: '入门', // 默认难度
        episodes: 1,
        duration: '15分钟'
      }),
      // 图片/视频文件特有字段
      ...(fileType !== FileType.HTML && {
        url: `https://your-storage.com/${id}/${file.filename}`
      })
    };

    const articleUrl = buildArticleUrl(event, id);
    const articleWithUrl = {
      ...article,
      articleUrl,
    };

    await saveArticle(articleWithUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        ...articleWithUrl
      })
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '服务器错误',
        detail: error.message
      })
    };
  }
};

// 估算阅读时间（分钟）
function estimateReadTime(content) {
  const wordsPerMinute = 200; // 中文阅读速度
  const textLength = content.replace(/<[^>]*>/g, '').length;
  const minutes = Math.ceil(textLength / wordsPerMinute / 3); // 中文约3个字符=1词
  return `${minutes} 分钟`;
}

// 解析 multipart/form-data 的辅助函数
function parseMultipartData(body, contentType) {
  if (!contentType) {
    return null;
  }

  if (!contentType.includes('multipart/form-data')) {
    return null;
  }

  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  if (!boundaryMatch) {
    return null;
  }

  const boundary = boundaryMatch[1];
  const parts = body.split(`--${boundary}`);
  const result = {};

  for (const part of parts) {
    if (part.includes('Content-Disposition')) {
      const nameMatch = part.match(/name="([^"]+)"/);
      const filenameMatch = part.match(/filename="([^"]+)"/);

      // 提取内容（在 header 后的空行之后）
      const contentParts = part.split('\r\n\r\n');
      if (contentParts.length > 1) {
        const content = contentParts.slice(1).join('\r\n\r\n').trim().replace(/\r\n$/, '');

        if (filenameMatch && nameMatch) {
          result.file = {
            filename: filenameMatch[1],
            content: content
          };
        } else if (nameMatch) {
          result[nameMatch[1]] = content;
        }
      }
    }
  }

  return result;
}

function buildArticleUrl(event, id) {
  const host =
    event.headers['x-forwarded-host'] ||
    event.headers.host ||
    'localhost:8888';
  const protocol = event.headers['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}/article/${id}`;
}

const { runNetlifyHandler } = require('./_lib/netlifyAdapter');
const netlifyHandler = exports.handler;
module.exports = async function handler(req, res) {
  return runNetlifyHandler(netlifyHandler, req, res);
};

