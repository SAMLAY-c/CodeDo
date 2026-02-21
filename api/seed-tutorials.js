const { saveArticle } = require('./_lib/articleStore');
const { tutorialSeeds } = require('./_lib/tutorialsSeed');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-seed-token',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const requiredToken = process.env.SEED_TOKEN;
    if (requiredToken) {
      const incomingToken =
        event.headers['x-seed-token'] || event.headers['X-Seed-Token'];
      if (incomingToken !== requiredToken) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized seed token' }),
        };
      }
    }

    for (const tutorial of tutorialSeeds) {
      await saveArticle(tutorial);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: tutorialSeeds.length,
        ids: tutorialSeeds.map((item) => item.id),
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

