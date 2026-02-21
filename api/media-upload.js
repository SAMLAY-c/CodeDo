const crypto = require('crypto');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    let payload = null;

    if (contentType.includes('application/json')) {
      payload = parseJson(event.body);
      if (!payload || !payload.url) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'url is required in JSON mode' }) };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          item: normalizeMedia({
            id: crypto.randomUUID(),
            url: payload.url,
            type: payload.type || guessType(payload.url),
            scope: payload.scope || 'article',
            refId: payload.refId || '',
            poster: payload.poster || '',
            width: payload.width || null,
            height: payload.height || null,
            duration: payload.duration || null,
            size: payload.size || null,
            createdAt: new Date().toISOString(),
          }),
        }),
      };
    }

    if (!contentType.includes('multipart/form-data')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unsupported content type' }) };
    }

    let body = event.body || '';
    if (event.isBase64Encoded) {
      body = Buffer.from(body, 'base64').toString('utf-8');
    }
    const form = parseMultipartData(body, contentType);
    if (!form || !form.file) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing file' }) };
    }

    const id = crypto.randomUUID();
    const type = form.type || guessType(form.file.filename);
    const host = event.headers['x-forwarded-host'] || event.headers.host || 'localhost:8888';
    const protocol = event.headers['x-forwarded-proto'] || 'https';
    const url = `${protocol}://${host}/media/${id}/${encodeURIComponent(form.file.filename)}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        item: normalizeMedia({
          id,
          url,
          type,
          scope: form.scope || 'article',
          refId: form.refId || '',
          poster: form.poster || '',
          size: form.file.content.length,
          width: null,
          height: null,
          duration: null,
          createdAt: new Date().toISOString(),
        }),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', detail: error.message }),
    };
  }
};

function parseJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(String(raw).replace(/^\uFEFF/, '').trim());
  } catch {
    return null;
  }
}

function guessType(nameOrUrl) {
  const value = String(nameOrUrl || '').toLowerCase();
  if (/\.(mp4|webm|mov|m4v)$/i.test(value)) return 'video';
  return 'image';
}

function normalizeMedia(item) {
  return {
    id: item.id,
    url: item.url,
    type: item.type,
    scope: item.scope,
    refId: item.refId,
    size: item.size,
    width: item.width,
    height: item.height,
    duration: item.duration,
    poster: item.poster,
    createdAt: item.createdAt,
  };
}

function parseMultipartData(body, contentType) {
  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  if (!boundaryMatch) return null;
  const boundary = boundaryMatch[1];
  const parts = body.split(`--${boundary}`);
  const result = {};

  for (const part of parts) {
    if (!part.includes('Content-Disposition')) continue;
    const nameMatch = part.match(/name="([^"]+)"/);
    const filenameMatch = part.match(/filename="([^"]+)"/);
    const chunks = part.split('\r\n\r\n');
    if (chunks.length < 2) continue;
    const content = chunks.slice(1).join('\r\n\r\n').trim().replace(/\r\n$/, '');
    if (filenameMatch && nameMatch) {
      result.file = {
        filename: filenameMatch[1],
        content,
      };
    } else if (nameMatch) {
      result[nameMatch[1]] = content;
    }
  }
  return result;
}

const { runNetlifyHandler } = require('./_lib/netlifyAdapter');
const netlifyHandler = exports.handler;
module.exports = async function handler(req, res) {
  return runNetlifyHandler(netlifyHandler, req, res);
};

