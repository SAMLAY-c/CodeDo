// 本地存储工具（临时方案，生产环境应使用数据库）
import type { Article } from '../types/article';

const STORAGE_KEY = 'uploaded_articles';

/**
 * 保存文章到本地存储
 */
export function saveArticle(article: Article): void {
  const articles = getAllArticles();
  articles[article.id] = article;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

/**
 * 获取所有文章
 */
export function getAllArticles(): Record<string, Article> {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

/**
 * 根据 ID 获取文章
 */
export function getArticleById(id: string): Article | null {
  const articles = getAllArticles();
  return articles[id] || null;
}

/**
 * 删除文章
 */
export function deleteArticle(id: string): void {
  const articles = getAllArticles();
  delete articles[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

/**
 * 获取文章列表
 */
export function getArticleList(): Article[] {
  const articles = getAllArticles();
  return Object.values(articles).sort((a, b) => {
    const bTime = new Date(b.createdAt || b.date || 0).getTime();
    const aTime = new Date(a.createdAt || a.date || 0).getTime();
    return bTime - aTime;
  });
}
