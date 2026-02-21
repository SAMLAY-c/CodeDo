import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filter: function ({ mimetype }) {
      // 只允许 HTML 文件
      return mimetype === 'text/html' || mimetype === 'application/xhtml+xml';
    }
  });

  try {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: '上传失败', detail: err.message });
      }

      const file = files.file?.[0];
      if (!file) {
        return res.status(400).json({ error: '没有收到文件' });
      }

      // 读取 HTML 内容
      const content = fs.readFileSync(file.filepath, 'utf-8');

      // 提取 HTML 的标题和内容
      const titleMatch = content.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : file.originalFilename;

      // 移除临时文件
      fs.unlinkSync(file.filepath);

      res.status(200).json({
        success: true,
        filename: file.originalFilename,
        size: file.size,
        title: title,
        content: content,
      });
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误', detail: error.message });
  }
}
