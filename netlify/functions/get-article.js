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
    const id = event.path.split('/').pop();

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '缺少文章 ID' })
      };
    }

    // TODO: 从数据库获取文章
    // 这里应该从数据库查询，现在返回 null
    // 实际上数据应该保存在客户端的 localStorage 或从后端数据库获取

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id,
        // 实际应从数据库获取
      })
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
