async function runNetlifyHandler(netlifyHandler, req, res) {
  try {
    const rawBody = await readRawBody(req);
    const query = normalizeQuery(req.query || {});
    const event = {
      httpMethod: req.method,
      headers: req.headers || {},
      path: (req.url || '').split('?')[0] || '',
      queryStringParameters: query,
      body: rawBody,
      isBase64Encoded: false,
    };

    const result = await netlifyHandler(event, {});
    const statusCode = result && result.statusCode ? result.statusCode : 200;
    const headers = (result && result.headers) || {};
    const body = (result && result.body) || '';

    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value !== 'undefined') {
        res.setHeader(key, value);
      }
    });

    if (typeof body === 'string') {
      const contentType = String(res.getHeader('Content-Type') || '');
      if (!contentType.toLowerCase().includes('application/json')) {
        return res.status(statusCode).send(body);
      }
      try {
        const parsed = JSON.parse(body);
        return res.status(statusCode).json(parsed);
      } catch {
        return res.status(statusCode).send(body);
      }
    }

    return res.status(statusCode).json(body);
  } catch (error) {
    return res.status(500).json({
      error: 'Adapter error',
      detail: error.message,
    });
  }
}

function normalizeQuery(query) {
  const result = {};
  Object.entries(query).forEach(([key, value]) => {
    result[key] = Array.isArray(value) ? value[0] : value;
  });
  return result;
}

async function readRawBody(req) {
  if (req.method === 'GET' || req.method === 'DELETE' || req.method === 'OPTIONS') {
    return '';
  }

  if (typeof req.body === 'string') {
    return req.body;
  }

  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return JSON.stringify(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

module.exports = { runNetlifyHandler };
