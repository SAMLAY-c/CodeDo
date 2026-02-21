import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  User,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Circle,
  PlayCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getArticleById } from '../utils/storage';
import type { Article } from '../types/article';

// 文章数据（实际项目中应从API获取）
const articleData = {
  id: 1,
  title: 'Vibe Coding 入门：用自然语言编程的新时代',
  author: 'AI编程导师',
  date: '2025-03-01',
  readTime: '15 分钟',
  category: '基础入门',
  image: '/article-1.jpg',
};

// 核心要点
const keyPoints = [
  'Vibe Coding 是一种与AI协作的编程新范式',
  '通过自然语言描述需求，AI生成对应代码',
  '适合快速原型开发和概念验证',
  '需要人工审核和优化生成的代码',
  '掌握Prompt工程是Vibe Coding的关键',
];

// 目录数据
const tocItems = [
  { id: 'intro', label: '什么是 Vibe Coding', level: 1 },
  { id: 'vs-traditional', label: 'Vibe Coding vs 传统开发', level: 1 },
  { id: 'workflow', label: 'Vibe Coding 工作流程', level: 1 },
  { id: 'best-practices', label: '最佳实践', level: 1 },
  { id: 'tips', label: '实用技巧', level: 2 },
  { id: 'warnings', label: '注意事项', level: 2 },
  { id: 'conclusion', label: '总结', level: 1 },
];

// 系列文章进度
const seriesProgress = [
  { id: 1, title: 'Vibe Coding 入门介绍', status: 'completed' },
  { id: 2, title: '环境搭建与工具配置', status: 'completed' },
  { id: 3, title: 'Prompt 工程基础', status: 'completed' },
  { id: 4, title: '实战：第一个AI项目', status: 'current' },
  { id: 5, title: '代码审核与优化', status: 'pending' },
];

// 代码块组件
const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('代码已复制');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <div className="flex items-center justify-between bg-[#1a1a2e] px-4 py-2 rounded-t-lg border border-white/10 border-b-0">
        <span className="text-xs text-white/50 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-cyan-400 transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="bg-[#0d0d15] p-4 rounded-b-lg overflow-x-auto border border-white/10">
        <code className="text-sm text-white/80 font-mono">{code}</code>
      </pre>
    </div>
  );
};

// Callout 组件
const Callout = ({ type, children }: { type: 'tip' | 'warning'; children: React.ReactNode }) => {
  const styles = {
    tip: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    warning: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  };

  const icons = {
    tip: <Lightbulb className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const titles = {
    tip: '提示',
    warning: '注意',
  };

  return (
    <div className={`my-6 p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-center gap-2 mb-2 font-semibold">
        {icons[type]}
        {titles[type]}
      </div>
      <div className="text-white/70">{children}</div>
    </div>
  );
};

// 对比表格组件
const ComparisonTable = () => (
  <div className="my-8 overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-white/20">
          <th className="text-left py-3 px-4 text-white font-semibold">对比维度</th>
          <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Vibe Coding</th>
          <th className="text-left py-3 px-4 text-white/60 font-semibold">传统开发</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        <tr className="border-b border-white/10">
          <td className="py-3 px-4 text-white/80">开发速度</td>
          <td className="py-3 px-4 text-cyan-400">⚡ 极快（10x+）</td>
          <td className="py-3 px-4 text-white/60">常规速度</td>
        </tr>
        <tr className="border-b border-white/10">
          <td className="py-3 px-4 text-white/80">代码质量</td>
          <td className="py-3 px-4 text-cyan-400">需要人工审核</td>
          <td className="py-3 px-4 text-white/60">取决于开发者水平</td>
        </tr>
        <tr className="border-b border-white/10">
          <td className="py-3 px-4 text-white/80">学习曲线</td>
          <td className="py-3 px-4 text-cyan-400">平缓（自然语言）</td>
          <td className="py-3 px-4 text-white/60">陡峭（语法细节）</td>
        </tr>
        <tr className="border-b border-white/10">
          <td className="py-3 px-4 text-white/80">适用场景</td>
          <td className="py-3 px-4 text-cyan-400">原型、MVP、脚本</td>
          <td className="py-3 px-4 text-white/60">生产级、复杂系统</td>
        </tr>
        <tr>
          <td className="py-3 px-4 text-white/80">核心技能</td>
          <td className="py-3 px-4 text-cyan-400">Prompt工程、需求描述</td>
          <td className="py-3 px-4 text-white/60">语言语法、算法、架构</td>
        </tr>
      </tbody>
    </table>
  </div>
);

function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('intro');
  const contentRef = useRef<HTMLDivElement>(null);

  // 尝试从本地存储获取文章，或使用默认示例数据
  const [articleData, setArticleData] = useState<Article>(() => {
    if (id) {
      const uploadedArticle = getArticleById(id);
      if (uploadedArticle) {
        return uploadedArticle;
      }
    }
    // 默认示例数据
    return {
      id: '1',
      title: 'Vibe Coding 入门：用自然语言编程的新时代',
      excerpt: '探索AI辅助编程的核心理念',
      content: '',
      author: 'AI编程导师',
      date: '2025-03-01',
      readTime: '15 分钟',
      category: 'basic',
      difficulty: '入门',
      image: '/article-1.jpg',
      keyPoints: [
        'Vibe Coding 是一种与AI协作的编程新范式',
        '通过自然语言描述需求，AI生成对应代码',
        '适合快速原型开发和概念验证',
        '需要人工审核和优化生成的代码',
        '掌握Prompt工程是Vibe Coding的关键',
      ],
      toc: [
        { id: 'intro', label: '什么是 Vibe Coding', level: 1 },
        { id: 'vs-traditional', label: 'Vibe Coding vs 传统开发', level: 1 },
        { id: 'workflow', label: 'Vibe Coding 工作流程', level: 1 },
        { id: 'best-practices', label: '最佳实践', level: 1 },
        { id: 'tips', label: '实用技巧', level: 2 },
        { id: 'warnings', label: '注意事项', level: 2 },
        { id: 'conclusion', label: '总结', level: 1 },
      ],
      createdAt: new Date().toISOString(),
    };
  });

  // 更新页面标题
  useEffect(() => {
    document.title = `${articleData.title} - Coding入门`;
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articleData.title]);

  // 示例代码
  const exampleCode = `// 用自然语言描述需求，AI生成代码
// 提示："创建一个函数，接收用户列表并按年龄排序"

function sortUsersByAge(users) {
  return users.sort((a, b) => a.age - b.age);
}

// 使用示例
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 20 }
];

console.log(sortUsersByAge(users));
// 输出: [{Charlie, 20}, {Alice, 25}, {Bob, 30}]`;

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-100"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-[#050508]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/topic-collection"
            className="flex items-center gap-2 text-white/60 hover:text-cyan-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            返回合集
          </Link>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {articleData.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {articleData.date}
            </span>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* 左侧文章区 */}
          <div className="flex-1 max-w-3xl" ref={contentRef}>
            {/* 文章头部 */}
            <div className="mb-8">
              <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                {articleData.category === 'basic' ? '基础入门' :
                 articleData.category === 'tools' ? '工具使用' :
                 articleData.category === 'project' ? '实战项目' : '文章博客'}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {articleData.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {articleData.author}
                </span>
                <span>·</span>
                <span>{articleData.readTime}阅读</span>
              </div>
            </div>

            {/* 封面图 */}
            {articleData.image && (
              <div className="rounded-xl overflow-hidden mb-8">
                <img
                  src={articleData.image}
                  alt={articleData.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
            )}

            {/* 核心要点卡片 */}
            {articleData.keyPoints && articleData.keyPoints.length > 0 && (
              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20 p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-cyan-400" />
                  本文要点
                </h3>
                <ul className="space-y-2">
                  {articleData.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-white/70">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 正文内容 - 渲染HTML或使用默认内容 */}
            {articleData.content ? (
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: articleData.content }}
              />
            ) : (
              <div className="prose prose-invert max-w-none">
              {/* 章节1 */}
              <section id="intro" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                  什么是 Vibe Coding
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Vibe Coding 是一种新兴的编程范式，它强调开发者与 AI 助手的协作。在这种模式下，开发者使用自然语言描述需求，
                  由 AI 生成相应的代码实现。这种方式大大降低了编程的入门门槛，让更多人能够快速构建自己的项目。
                </p>
                <p className="text-white/70 leading-relaxed">
                  与传统编程不同，Vibe Coding 不需要开发者记住复杂的语法细节，而是专注于清晰地表达意图和逻辑。
                  这使得开发过程更加直观和高效，特别适合快速原型开发和概念验证。
                </p>
              </section>

              {/* 章节2 - 对比表格 */}
              <section id="vs-traditional" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                  Vibe Coding vs 传统开发
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  为了更好地理解 Vibe Coding 的特点，让我们通过一个对比表格来看看它与传统开发方式的区别：
                </p>
                <ComparisonTable />
              </section>

              {/* 章节3 */}
              <section id="workflow" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                  Vibe Coding 工作流程
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  一个典型的 Vibe Coding 工作流程包含以下几个步骤：
                </p>
                <ol className="list-decimal list-inside space-y-3 text-white/70 mb-6">
                  <li><strong className="text-white">需求描述</strong> - 用自然语言清晰地描述你想要实现的功能</li>
                  <li><strong className="text-white">AI生成</strong> - AI根据描述生成初始代码</li>
                  <li><strong className="text-white">代码审核</strong> - 检查生成的代码是否符合预期</li>
                  <li><strong className="text-white">迭代优化</strong> - 通过反馈让AI改进代码</li>
                  <li><strong className="text-white">测试验证</strong> - 运行代码确保功能正确</li>
                </ol>

                <CodeBlock 
                  language="javascript" 
                  code={exampleCode}
                />
              </section>

              {/* 章节4 */}
              <section id="best-practices" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                  最佳实践
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  要充分发挥 Vibe Coding 的优势，以下是一些经过验证的最佳实践：
                </p>

                <div id="tips">
                  <h3 className="text-xl font-semibold text-white mb-3">实用技巧</h3>
                  <Callout type="tip">
                    <strong>具体胜于抽象。</strong> 在向 AI 描述需求时，尽可能提供具体的例子和场景。
                    比如不要说"创建一个用户管理系统"，而是说"创建一个可以添加、删除、编辑用户的系统，
                    用户信息包括姓名、邮箱和年龄"。
                  </Callout>
                  <Callout type="tip">
                    <strong>分步骤描述复杂任务。</strong> 对于复杂的功能，将其拆分成多个小步骤，
                    逐步引导 AI 完成。这样不仅能提高代码质量，也便于调试和修改。
                  </Callout>
                </div>

                <div id="warnings">
                  <h3 className="text-xl font-semibold text-white mb-3 mt-8">注意事项</h3>
                  <Callout type="warning">
                    <strong>不要完全依赖 AI 生成的代码。</strong> AI 可能会生成有安全漏洞或性能问题的代码，
                    务必进行代码审核和测试，特别是在处理敏感数据或关键业务逻辑时。
                  </Callout>
                  <Callout type="warning">
                    <strong>注意代码的可维护性。</strong> AI 生成的代码可能缺乏注释和文档，
                    建议在接收代码后添加必要的注释，确保团队成员能够理解代码逻辑。
                  </Callout>
                </div>
              </section>

              {/* 章节5 - 总结 */}
              <section id="conclusion" className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                  总结
                </h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Vibe Coding 代表了编程方式的一次重大转变。它不是要取代传统编程，而是提供了一种新的选择，
                  特别适合快速原型开发、学习编程概念、以及自动化重复性任务。
                </p>
                <p className="text-white/70 leading-relaxed">
                  掌握 Vibe Coding 的关键在于学会如何与 AI 有效沟通——清晰地表达需求，
                  合理地审核和优化生成的代码。随着 AI 技术的不断进步，这种协作编程的方式将会越来越普及。
                </p>
              </section>
            </div>
            )}
            <Separator className="my-8 bg-white/10" />

            <Separator className="my-8 bg-white/10" />

            {/* 上一篇/下一篇导航 */}
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/article/0')}
                className="group p-4 rounded-xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/5 transition-all text-left"
              >
                <span className="text-sm text-white/40 flex items-center gap-1 mb-2">
                  <ChevronLeft className="w-4 h-4" />
                  上一篇
                </span>
                <span className="text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                  环境搭建与工具配置
                </span>
              </button>
              <button 
                onClick={() => navigate('/article/2')}
                className="group p-4 rounded-xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/5 transition-all text-left"
              >
                <span className="text-sm text-white/40 flex items-center gap-1 mb-2 justify-end">
                  下一篇
                  <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-white group-hover:text-cyan-400 transition-colors line-clamp-1 text-right">
                  Prompt 工程基础
                </span>
              </button>
            </div>
          </div>

          {/* 右侧边栏 */}
          <div className="lg:w-72 space-y-6">
            {/* TOC 目录 - 只在有内容时显示 */}
            {articleData.toc && articleData.toc.length > 0 && (
              <div className="sticky top-24 bg-white/5 rounded-xl border border-white/10 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  目录
                </h3>
                <nav className="space-y-1">
                  {articleData.toc.map((item, index) => (
                    <a
                      key={index}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        setActiveSection(item.id);
                      }}
                      className={`block py-2 px-3 rounded text-sm transition-all ${
                        activeSection === item.id
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      } ${item.level === 2 ? 'pl-6' : ''}`}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* 系列进度树 - 只在默认数据时显示 */}
            {!id && (
              <div className="bg-white/5 rounded-xl border border-white/10 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-cyan-400" />
                  系列进度
                </h3>
                <div className="space-y-2">
                  {seriesProgress.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                        ) : item.status === 'current' ? (
                          <div className="w-5 h-5 rounded-full border-2 border-cyan-400 bg-cyan-400/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-white/20" />
                        )}
                        {index < seriesProgress.length - 1 && (
                          <div className={`w-0.5 h-6 ${
                            item.status === 'completed' ? 'bg-cyan-400/50' : 'bg-white/10'
                          }`} />
                        )}
                      </div>
                      <span className={`text-sm ${
                        item.status === 'current' ? 'text-cyan-400 font-medium' :
                        item.status === 'completed' ? 'text-white/70' : 'text-white/40'
                      }`}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 相关推荐 */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <h3 className="text-white font-semibold mb-4">相关文章</h3>
              <div className="space-y-3">
                <Link to="/article/2" className="block group">
                  <div className="text-sm text-white/70 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    Prompt 工程基础：让AI听懂你的话
                  </div>
                  <span className="text-xs text-white/40">5 分钟阅读</span>
                </Link>
                <Link to="/article/3" className="block group">
                  <div className="text-sm text-white/70 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    实战：用AI构建一个完整的Web应用
                  </div>
                  <span className="text-xs text-white/40">15 分钟阅读</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleDetail;
