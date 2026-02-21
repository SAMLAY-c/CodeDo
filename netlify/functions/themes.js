const { getThemes, saveTheme } = require('./_lib/themeStore');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const items = await getThemes();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ items, total: items.length }),
      };
    }

    if (event.httpMethod === 'POST') {
      const body = parseJsonBody(event.body);
      if (!body || typeof body !== 'object') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid request body' }),
        };
      }
      if (!body.id || !body.name) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Theme id and name are required' }),
        };
      }
      const theme = {
        ...body,
        id: String(body.id),
        name: String(body.name),
        subtitle: String(body.subtitle || ''),
        updatedAt: new Date().toISOString(),
        createdAt: body.createdAt || new Date().toISOString(),
      };
      await saveTheme(theme);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, item: theme }) };
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
      body: JSON.stringify({ error: 'Server error', detail: error.message }),
    };
  }
};

function parseJsonBody(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(String(raw).replace(/^\uFEFF/, '').trim());
  } catch {
    return null;
  }
}
