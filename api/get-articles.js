const { getArticles } = require('./_lib/articleStore');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const query = event.queryStringParameters || {};
    const category = query.category || 'all';
    const theme = query.theme || 'all';
    const limit = Number(query.limit || 50);
    const offset = Number(query.offset || 0);

    const result = await getArticles({ category, theme, limit, offset });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        items: result.items,
        total: result.total,
        themes: result.themes || [],
        category,
        theme,
        limit,
        offset,
      }),
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

const { runNetlifyHandler } = require('./_lib/netlifyAdapter');
const netlifyHandler = exports.handler;
module.exports = async function handler(req, res) {
  return runNetlifyHandler(netlifyHandler, req, res);
};

