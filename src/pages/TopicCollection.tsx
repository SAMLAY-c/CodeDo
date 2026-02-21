import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  BookOpen, 
  Clock, 
  BarChart3, 
  Filter,
  Play,
  Calendar,
  Users,
  ChevronLeft,
  Flame,
  Sparkles,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// 筛选分类
const categories = [
  { id: 'all', label: '全部' },
  { id: 'basic', label: '基础入门' },
  { id: 'tools', label: '工具使用' },
  { id: 'project', label: '实战项目' },
];

// 系列导航数据
const seriesList = [
  { id: 'vibe-coding', name: 'Vibe Coding', count: 12, active: true },
  { id: 'claude', name: 'Claude开发', count: 8, active: false },
  { id: 'openclaw', name: 'OpenClaw工具', count: 6, active: false },
  { id: 'pm-tools', name: 'PM AI工具箱', count: 10, active: false },
];

interface TutorialItem {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  category: string;
  episodes?: number;
  status?: string;
  statusLabel?: string;
  duration?: string;
  difficulty: string;
  featured?: boolean;
}

// 回退文章数据（API 不可用时使用）
const fallbackArticles: TutorialItem[] = [
  {
    id: '1',
    title: 'Vibe Coding 入门：用自然语言编程的新时代',
    excerpt: '探索AI辅助编程的核心理念，学习如何与AI协作高效完成代码编写。从基础概念到实战技巧，带你全面掌握Vibe Coding的精髓。',
    image: '/article-1.jpg',
    category: 'basic',
    episodes: 5,
    status: 'hot',
    statusLabel: '热门',
    duration: '45分钟',
    difficulty: '入门',
    featured: true,
  },
  {
    id: '2',
    title: 'Claude Prompt 工程最佳实践',
    excerpt: '学习如何编写高效的Claude提示词，提升AI代码生成的质量和准确性。',
    image: '/article-2.jpg',
    category: 'tools',
    episodes: 3,
    status: 'new',
    statusLabel: 'NEW',
    duration: '30分钟',
    difficulty: '进阶',
    featured: false,
  },
  {
    id: '3',
    title: '实战：用AI构建一个完整的Web应用',
    excerpt: '从零开始，使用Vibe Coding方法在2小时内完成一个全栈项目。',
    image: '/article-3.jpg',
    category: 'project',
    episodes: 8,
    status: 'coming',
    statusLabel: '即将发布',
    duration: '120分钟',
    difficulty: '中级',
    featured: false,
  },
  {
    id: '4',
    title: 'OpenClaw 自动化工作流配置指南',
    excerpt: '掌握OpenClaw工具链的配置方法，建立高效的开发自动化流程。',
    image: '/article-4.jpg',
    category: 'tools',
    episodes: 4,
    status: '',
    statusLabel: '',
    duration: '60分钟',
    difficulty: '中级',
    featured: false,
  },
  {
    id: '5',
    title: 'AI辅助调试：快速定位代码问题',
    excerpt: '利用AI工具快速分析和解决代码中的bug，提升调试效率。',
    image: '/article-5.jpg',
    category: 'basic',
    episodes: 3,
    status: 'new',
    statusLabel: 'NEW',
    duration: '40分钟',
    difficulty: '入门',
    featured: false,
  },
  {
    id: '6',
    title: '代码重构的AI助手：从混乱到优雅',
    excerpt: '学习如何使用AI辅助进行代码重构，改善代码质量和可维护性。',
    image: '/parallax-1.jpg',
    category: 'project',
    episodes: 6,
    status: '',
    statusLabel: '',
    duration: '90分钟',
    difficulty: '进阶',
    featured: false,
  },
];

// 状态徽章组件
const StatusBadge = ({ status, label }: { status?: string; label?: string }) => {
  const styles: Record<string, string> = {
    new: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    hot: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    coming: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  
  const icons: Record<string, React.ReactNode> = {
    new: <Sparkles className="w-3 h-3" />,
    hot: <Flame className="w-3 h-3" />,
    coming: <Timer className="w-3 h-3" />,
  };

  if (!status || !styles[status]) return null;

  return (
    <Badge 
      variant="outline" 
      className={`${styles[status]} text-xs font-medium flex items-center gap-1`}
    >
      {icons[status]}
      {label || ''}
    </Badge>
  );
};

function TopicCollection() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [progress] = useState(35);
  const [articles, setArticles] = useState<TutorialItem[]>(fallbackArticles);

  useEffect(() => {
    document.title = 'Vibe Coding 主题合集 - Coding入门';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadArticles = async () => {
      try {
        const response = await fetch('/api/get-articles?limit=100');
        if (!response.ok) return;
        const payload = await response.json();
        if (!payload || !Array.isArray(payload.items)) return;
        if (!cancelled && payload.items.length > 0) {
          const normalized = payload.items.map((item: TutorialItem) => ({
            ...item,
            id: String(item.id),
          }));
          setArticles(normalized);
        }
      } catch {
        // keep fallback data
      }
    };

    loadArticles();
    return () => {
      cancelled = true;
    };
  }, []);

  // 筛选文章
  const filteredArticles = activeCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  const featuredArticle = filteredArticles.find(a => a.featured);
  const gridArticles = filteredArticles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Hero区域 */}
      <div className="relative h-[400px] overflow-hidden">
        {/* 背景图 */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/topic-vibe-hero.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/60 via-[#050508]/40 to-[#050508]" />
        </div>

        {/* 内容 */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          {/* 面包屑 */}
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link to="/" className="hover:text-cyan-400 transition-colors">首页</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cyan-400">Vibe Coding</span>
          </nav>

          {/* 标题 */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Vibe Coding
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mb-6">
            用自然语言与AI协作编程，开启高效开发新范式
          </p>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-6 text-white/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span className="text-white">{articles.length} 篇文章</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span className="text-white">入门到进阶</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span className="text-white">约 8 小时</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧内容区 */}
          <div className="flex-1">
            {/* 筛选栏 */}
            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-white/40 flex-shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Featured Card */}
            {featuredArticle && (
              <div 
                onClick={() => navigate(`/article/${featuredArticle.id}`)}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:border-cyan-500/50 transition-all mb-8"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img 
                      src={featuredArticle.image} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <StatusBadge status={featuredArticle.status} label={featuredArticle.statusLabel} />
                      <span className="text-white/40 text-sm flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        {featuredArticle.episodes ?? 1} 集
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-white/60 mb-6 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredArticle.duration || '15分钟'}
                      </span>
                      <span className="px-2 py-1 bg-white/10 rounded text-white/60">
                        {featuredArticle.difficulty || '入门'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 文章网格 */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {gridArticles.map(article => (
                <div 
                  key={article.id}
                  onClick={() => navigate(`/article/${article.id}`)}
                  className="group bg-white/5 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all"
                >
                  {/* 缩略图 */}
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={article.status} label={article.statusLabel} />
                    </div>
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white/80 flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {article.episodes ?? 1} 集
                      </div>
                  </div>

                  {/* 内容 */}
                  <div className="p-5">
                    <h3 className="font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-white/50 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.duration || '15分钟'}
                      </span>
                      <span className="px-2 py-0.5 bg-white/10 rounded">
                        {article.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="lg:w-80 space-y-6">
            {/* 系列导航 */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                系列导航
              </h3>
              <div className="space-y-2">
                {seriesList.map(series => (
                  <div 
                    key={series.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      series.active 
                        ? 'bg-cyan-500/20 border border-cyan-500/30' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className={series.active ? 'text-cyan-400' : 'text-white/70'}>
                      {series.name}
                    </span>
                    <span className="text-white/40 text-sm">{series.count} 篇</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 学习进度 */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                学习进度
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">已完成</span>
                  <span className="text-cyan-400 font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/10" />
              </div>
              <div className="text-sm text-white/40">
                已学完 4 / {articles.length} 篇文章
              </div>
            </div>

            {/* 直播报名入口 */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-sm font-medium">即将开始</span>
              </div>
              <h3 className="text-white font-semibold mb-2">
                Vibe Coding 实战直播
              </h3>
              <p className="text-white/60 text-sm mb-4">
                本周六晚8点，带你实战AI编程项目
              </p>
              <div className="flex items-center gap-4 text-sm text-white/40 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  03/15
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  234 人已报名
                </span>
              </div>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                立即报名
              </Button>
            </div>

            {/* 返回首页 */}
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicCollection;
