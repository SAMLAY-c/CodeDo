const { updateArticle, deleteArticle } = require('./_lib/articleStore');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const id = extractArticleId(event);
  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: '缺少文章 ID' }),
    };
  }

  try {
    if (event.httpMethod === 'PUT') {
      const patch = parseJsonBody(event.body);
      if (!patch || typeof patch !== 'object') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '无效的更新内容' }),
        };
      }

      const updated = await updateArticle(id, patch);
      if (!updated) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: '文章不存在' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, item: updated }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      const deleted = await deleteArticle(id);
      if (!deleted) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: '文章不存在' }),
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '服务器错误',
        detail: error.message,
      }),
    };
  }
};

function extractArticleId(event) {
  if (event.queryStringParameters && event.queryStringParameters.id) {
    return event.queryStringParameters.id;
  }
  const path = event.path || '';
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last || last === 'article') return '';
  return decodeURIComponent(last);
}

function parseJsonBody(raw) {
  if (!raw) return null;
  try {
    const normalized = String(raw).replace(/^\uFEFF/, '').trim();
    return JSON.parse(normalized);
  } catch {
    return null;
  }
}

const { runNetlifyHandler } = require('./_lib/netlifyAdapter');
const netlifyHandler = exports.handler;
module.exports = async function handler(req, res) {
  return runNetlifyHandler(netlifyHandler, req, res);
};

