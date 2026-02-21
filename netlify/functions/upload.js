const Buffer = require('buffer').Buffer;

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
        body: JSON.stringify({ error: '没有收到文件', debug: formData })
      };
    }

    const file = formData.file;
    const content = file.content;

    // 验证文件类型
    if (!content.toLowerCase().includes('<html') && !content.toLowerCase().includes('<!doctype')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '只允许上传 HTML 文件' })
      };
    }

    // 提取 HTML 的标题
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : file.filename;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        filename: file.filename,
        size: file.content.length,
        title: title,
        content: content,
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '服务器错误', detail: error.message, stack: error.stack })
    };
  }
};

// 解析 multipart/form-data 的辅助函数
function parseMultipartData(body, contentType) {
  if (!contentType) {
    console.log('No content-type');
    return null;
  }

  if (!contentType.includes('multipart/form-data')) {
    console.log('Not multipart/form-data:', contentType);
    return null;
  }

  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  if (!boundaryMatch) {
    console.log('No boundary found');
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
