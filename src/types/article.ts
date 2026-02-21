// 文章数据类型定义
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML 内容
  author: string;
  date: string;
  readTime: string;
  category: string;
  difficulty: '入门' | '中级' | '进阶';
  episodes?: number;
  image?: string;
  status?: 'hot' | 'new' | 'coming';
  statusLabel?: string;
  featured?: boolean;
  tags?: string[];
  series?: string; // 所属系列
  keyPoints?: string[]; // 核心要点
  toc?: TOCItem[]; // 目录
  metadata?: ArticleMetadata;
}

export interface TOCItem {
  id: string;
  label: string;
  level: number;
}

export interface ArticleMetadata {
  coverImage?: string;
  series?: string;
  difficulty?: '入门' | '中级' | '进阶';
  duration?: string;
  episodes?: number;
}

// 文章系列
export interface ArticleSeries {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
  articles: Article[];
}

// 解析后的 HTML 内容结构
export interface ParsedContent {
  title: string;
  content: string;
  excerpt: string;
  keyPoints: string[];
  toc: TOCItem[];
  metadata: ArticleMetadata;
}
