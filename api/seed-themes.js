const { saveTheme } = require('./_lib/themeStore');
const { themeSeeds } = require('./_lib/themesSeed');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-seed-token',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const token = process.env.SEED_TOKEN;
    if (token) {
      const incoming = event.headers['x-seed-token'] || event.headers['X-Seed-Token'];
      if (incoming !== token) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }
    }

    for (const theme of themeSeeds) {
      await saveTheme(theme);
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: themeSeeds.length,
        ids: themeSeeds.map((t) => t.id),
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

const { runNetlifyHandler } = require('./_lib/netlifyAdapter');
const netlifyHandler = exports.handler;
module.exports = async function handler(req, res) {
  return runNetlifyHandler(netlifyHandler, req, res);
};

