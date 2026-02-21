const { getThemeById, updateTheme, deleteTheme } = require('./_lib/themeStore');
const { getArticles } = require('./_lib/articleStore');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const id = extractId(event);
  if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing theme id' }) };

  try {
    if (event.httpMethod === 'GET') {
      const item = await getThemeById(id);
      if (!item) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Theme not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify(item) };
    }

    if (event.httpMethod === 'PUT') {
      const patch = parseJsonBody(event.body);
      if (!patch || typeof patch !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
      }
      const updated = await updateTheme(id, patch);
      if (!updated) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Theme not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, item: updated }) };
    }

    if (event.httpMethod === 'DELETE') {
      const related = await getArticles({ category: 'all', theme: id, limit: 1, offset: 0 });
      if (related.total > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'Theme has related courses, cannot delete directly' }),
        };
      }
      const deleted = await deleteTheme(id);
      if (!deleted) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Theme not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, id }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', detail: error.message }),
    };
  }
};

function extractId(event) {
  if (event.queryStringParameters && event.queryStringParameters.id) {
    return event.queryStringParameters.id;
  }
  const path = event.path || '';
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last || last === 'theme') return '';
  return decodeURIComponent(last);
}

function parseJsonBody(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(String(raw).replace(/^\uFEFF/, '').trim());
  } catch {
    return null;
  }
}

const { runNetlifyHandler } = require('./_lib/netlifyAdapter');
const netlifyHandler = exports.handler;
module.exports = async function handler(req, res) {
  return runNetlifyHandler(netlifyHandler, req, res);
};

