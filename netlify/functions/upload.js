const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

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
    // 解析 multipart/form-data
    const formData = parseMultipartData(event.body, event.headers['content-type']);

    if (!formData || !formData.file) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '没有收到文件' })
      };
    }

    const file = formData.file;
    const content = file.content;

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
      body: JSON.stringify({ error: '服务器错误', detail: error.message })
    };
  }
};

// 解析 multipart/form-data 的辅助函数
function parseMultipartData(body, contentType) {
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return null;
  }

  const boundary = contentType.match(/boundary=([^;]+)/)?.[1];
  if (!boundary) return null;

  const parts = body.split(`--${boundary}`);
  const result = {};

  for (const part of parts) {
    if (part.includes('Content-Disposition')) {
      const nameMatch = part.match(/name="([^"]+)"/);
      const filenameMatch = part.match(/filename="([^"]+)"/);
      const content = part.split('\r\n\r\n').slice(1).join('\r\n\r\n').trim();

      if (filenameMatch) {
        result.file = {
          filename: filenameMatch[1],
          content: content
        };
      } else if (nameMatch) {
        result[nameMatch[1]] = content;
      }
    }
  }

  return result;
}
