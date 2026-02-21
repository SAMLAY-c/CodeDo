import * as cheerio from 'cheerio';
import DOMPurify from 'dompurify';
import type { ParsedContent, TOCItem } from '../types/article';

/**
 * 解析 HTML 内容，提取文章数据
 */
export function parseArticleHTML(html: string): ParsedContent {
  const $ = cheerio.load(html);

  // 提取标题
  const title = extractTitle($);

  // 提取元数据
  const metadata = extractMetadata($);

  // 清理和转换内容
  const content = cleanContent($);

  // 生成摘要
  const excerpt = extractExcerpt($);

  // 提取核心要点
  const keyPoints = extractKeyPoints($);

  // 生成目录
  const toc = generateTOC($);

  return {
    title,
    content,
    excerpt,
    keyPoints,
    toc,
    metadata,
  };
}

/**
 * 提取标题
 */
function extractTitle($: cheerio.CheerioAPI): string {
  // 尝试从 h1 提取
  const h1 = $('h1').first().text();
  if (h1) return h1.trim();

  // 尝试从 title 标签提取
  const titleTag = $('title').text();
  if (titleTag) return titleTag.trim();

  // 尝试从 meta 标签提取
  const metaTitle = $('meta[property="og:title"]').attr('content') ||
                    $('meta[name="twitter:title"]').attr('content');
  if (metaTitle) return metaTitle.trim();

  return '未命名文章';
}

/**
 * 提取元数据
 */
function extractMetadata($: cheerio.CheerioAPI): any {
  const metadata: any = {};

  // 从 meta 标签提取
  const coverImage = $('meta[property="og:image"]').attr('content') ||
                     $('meta[name="twitter:image"]').attr('content');
  if (coverImage) metadata.coverImage = coverImage;

  // 从自定义 data 属性提取
  const series = $('article').data('series') ||
                 $('body').data('series');
  if (series) metadata.series = series;

  const difficulty = $('article').data('difficulty') ||
                     $('body').data('difficulty');
  if (difficulty) metadata.difficulty = difficulty;

  const episodes = $('article').data('episodes') ||
                    $('body').data('episodes');
  if (episodes) metadata.episodes = parseInt(episodes);

  const duration = $('article').data('duration') ||
                    $('body').data('duration');
  if (duration) metadata.duration = duration;

  return metadata;
}

/**
 * 清理和转换内容
 */
function cleanContent($: cheerio.CheerioAPI): string {
  // 移除标题（已经在文章头部显示）
  $('h1').first().remove();

  // 添加类名到代码块
  $('pre code').each((_, el) => {
    const $el = $(el);
    const language = detectLanguage($el.text());
    $el.parent().attr('data-language', language);
  });

  // 转换提示框
  convertCallouts($);

  // 转换表格
  $('table').each((_, el) => {
    $(el).addClass('comparison-table');
  });

  // 清理内容
  const cleanHTML = $.html();

  // 使用 DOMPurify 清理
  return DOMPurify.sanitize(cleanHTML, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'strong', 'em', 'u', 's',
                   'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody',
                   'tr', 'th', 'td', 'div', 'span', 'br', 'hr', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'data-language', 'title', 'target']
  });
}

/**
 * 检测代码语言
 */
function detectLanguage(code: string): string {
  const patterns: Record<string, RegExp> = {
    javascript: /(?:import|export|const|let|var|function|=>|async|await)/,
    typescript: /(?:interface|type|enum|declare|namespace)/,
    python: /(?:def |class |import |from |print\(|#)/,
    java: /(?:public class|private|protected|void|System\.out)/,
    html: /<\/?[a-z][\s\S]*>/i,
    css: /(?:[.#]?[a-z-]+\s*{[\s\S]*})/i,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(code.substring(0, 200))) {
      return lang;
    }
  }

  return 'text';
}

/**
 * 转换提示框
 */
function convertCallouts($: cheerio.CheerioAPI): void {
  // 转换 blockquote 为提示框
  $('blockquote').each((_, el) => {
    const $el = $(el);
    const text = $el.text().toLowerCase();

    let type = 'tip';
    if (text.includes('注意') || text.includes('警告') || text.includes('warning')) {
      type = 'warning';
    }

    $el.attr('data-callout', type);
    $el.addClass('callout');
  });
}

/**
 * 提取摘要
 */
function extractExcerpt($: cheerio.CheerioAPI): string {
  // 尝试从 meta 描述提取
  const metaDesc = $('meta[name="description"]').attr('content') ||
                   $('meta[property="og:description"]').attr('content');
  if (metaDesc) return metaDesc.trim();

  // 从第一段提取
  const firstP = $('p').first().text();
  if (firstP) {
    return firstP.trim().substring(0, 200) + (firstP.length > 200 ? '...' : '');
  }

  return '暂无摘要';
}

/**
 * 提取核心要点
 */
function extractKeyPoints($: cheerio.CheerioAPI): string[] {
  const points: string[] = [];

  // 尝试从 ul 提取（在 h2 之前的第一个 ul）
  const firstH2 = $('h2').first();
  if (firstH2.length) {
    firstH2.prevAll('ul').first().find('li').each((_, el) => {
      const text = $(el).text().trim();
      if (text) points.push(text);
    });
  }

  // 尝试从特定 class 提取
  $('.key-points li, .要点 li, [data-key-points] li').each((_, el) => {
    const text = $(el).text().trim();
    if (text && !points.includes(text)) {
      points.push(text);
    }
  });

  // 如果没有找到，尝试从第一个 ol/ul 提取
  if (points.length === 0) {
    $('ol, ul').first().find('li').each((_, el) => {
      const text = $(el).text().trim();
      if (text && points.length < 5) {
        points.push(text);
      }
    });
  }

  return points.slice(0, 5); // 最多 5 个要点
}

/**
 * 生成目录
 */
function generateTOC($: cheerio.CheerioAPI): TOCItem[] {
  const toc: TOCItem[] = [];
  let h2Index = 0;

  $('h2, h3').each((_, el) => {
    const $el = $(el);
    const tag = el.tagName;
    const text = $el.text().trim();

    if (!text) return;

    // 生成 ID
    const id = text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    if (tag === 'h2') {
      toc.push({
        id: `section-${h2Index++}`,
        label: text,
        level: 1,
      });
      $el.attr('id', `section-${h2Index - 1}`);
    } else if (tag === 'h3') {
      toc.push({
        id: `subsection-${toc.length}`,
        label: text,
        level: 2,
      });
      $el.attr('id', `subsection-${toc.length}`);
    }
  });

  return toc;
}

/**
 * 验证 HTML 格式
 */
export function validateHTML(html: string): { valid: boolean; error?: string } {
  try {
    const $ = cheerio.load(html);

    // 检查是否有 HTML 标签
    if (!$('html, body, *').length) {
      return { valid: false, error: '无效的 HTML 文件' };
    }

    // 检查是否有内容
    const textContent = $.text().trim();
    if (textContent.length < 50) {
      return { valid: false, error: 'HTML 内容太少' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'HTML 解析失败' };
  }
}
