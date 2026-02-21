const { getArticleById } = require('./_lib/articleStore');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const id = extractArticleId(event);

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '缺少文章 ID' })
      };
    }

    const article = await getArticleById(id);

    if (!article) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: '文章不存在或已过期' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(article)
    };

  } catch (error) {
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

function extractArticleId(event) {
  if (event.queryStringParameters && event.queryStringParameters.id) {
    return event.queryStringParameters.id;
  }

  const path = event.path || '';
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1];

  if (!last || last === 'get-article') {
    return '';
  }

  return decodeURIComponent(last);
}

const { runNetlifyHandler } = require('./_lib/netlifyAdapter');
const netlifyHandler = exports.handler;
module.exports = async function handler(req, res) {
  return runNetlifyHandler(netlifyHandler, req, res);
};

