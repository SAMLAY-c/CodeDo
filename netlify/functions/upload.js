const Buffer = require('buffer').Buffer;
const crypto = require('crypto');

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

// 允许的 MIME 类型
const ALLOWED_MIME_TYPES = {
  [FileType.HTML]: ['text/html', 'application/xhtml+xml'],
  [FileType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  [FileType.VIDEO]: ['video/mp4', 'video/webm', 'video/ogg']
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
    const formData = parseMultipartData(body, event.headers['content-type']);

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
    const tags = formData.tags ? JSON.parse(formData.tags) : [];

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
    }

    // 生成唯一 ID
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // 提取 HTML 标题（如果是 HTML 文件）
    let extractedTitle = title;
    if (fileType === FileType.HTML) {
      const titleMatch = file.content.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && !formData.title) {
        extractedTitle = titleMatch[1];
      }
    }

    // 构建响应数据（模拟数据库记录）
    const record = {
      id,
      filename: file.filename,
      fileType,
      title: extractedTitle,
      category,
      tags,
      size: file.content.length,
      createdAt: timestamp,
      // TODO: 实际部署时应该存储文件到数据库和云存储
      // content: file.content,  // HTML 文件可以存储内容
      // url: `https://storage.example.com/${id}/${file.filename}`  // 图片/视频的 URL
    };

    // 根据文件类型返回不同的数据
    if (fileType === FileType.HTML) {
      record.content = file.content;
    } else {
      // 图片和视频应该上传到云存储，这里返回占位符 URL
      record.url = `https://your-storage.com/${id}/${file.filename}`;
    }

    // TODO: 保存到数据库
    // await db.collection('uploads').insertOne(record);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        ...record
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
