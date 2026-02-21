const now = new Date().toISOString();

const tutorialSeeds = [
  {
    id: '1',
    title: 'Vibe Coding 入门：用自然语言编程的新时代',
    excerpt:
      '探索 AI 辅助编程的核心理念，学习如何与 AI 协作高效完成代码编写。',
    content: `
      <article>
        <h1>Vibe Coding 入门：用自然语言编程的新时代</h1>
        <p>Vibe Coding 是人与 AI 协作的新开发范式，核心是通过自然语言描述需求并迭代实现。</p>
        <h2 id="intro">什么是 Vibe Coding</h2>
        <p>它不替代工程能力，而是放大工程效率。</p>
        <h2 id="workflow">标准工作流</h2>
        <ul>
          <li>明确需求与验收标准</li>
          <li>生成初稿并审查</li>
          <li>测试与重构</li>
        </ul>
      </article>
    `,
    author: 'AI编程导师',
    date: '2026-02-21',
    readTime: '15 分钟',
    category: 'basic',
    difficulty: '入门',
    image: '/article-1.jpg',
    coverImage: '/article-1.jpg',
    mediaBlocks: [],
    keyPoints: ['自然语言描述需求', '快速生成初稿', '人工审查和测试'],
    toc: [
      { id: 'intro', label: '什么是 Vibe Coding', level: 1 },
      { id: 'workflow', label: '标准工作流', level: 1 },
    ],
    tags: ['vibe-coding', '入门'],
    episodes: 5,
    duration: '45分钟',
    status: 'hot',
    statusLabel: '热门',
    featured: true,
    themeId: 'vibe-coding',
    themeName: 'Vibe Coding',
    createdAt: now,
  },
  {
    id: '2',
    title: 'Claude Prompt 工程最佳实践',
    excerpt: '学习如何编写高质量 Prompt，提高 AI 代码产出的准确率和稳定性。',
    content: `
      <article>
        <h1>Claude Prompt 工程最佳实践</h1>
        <h2 id="principles">核心原则</h2>
        <ul>
          <li>给出明确角色与任务</li>
          <li>给出输入/输出约束</li>
          <li>给出反例和边界条件</li>
        </ul>
      </article>
    `,
    author: 'AI编程导师',
    date: '2026-02-21',
    readTime: '12 分钟',
    category: 'tools',
    difficulty: '进阶',
    image: '/article-2.jpg',
    coverImage: '/article-2.jpg',
    mediaBlocks: [],
    keyPoints: ['角色约束', '结构化输入', '边界条件'],
    toc: [{ id: 'principles', label: '核心原则', level: 1 }],
    tags: ['claude', 'prompt'],
    episodes: 3,
    duration: '30分钟',
    status: 'new',
    statusLabel: 'NEW',
    featured: false,
    themeId: 'claude-dev',
    themeName: 'Claude 开发',
    createdAt: now,
  },
  {
    id: '3',
    title: '实战：用AI构建一个完整的Web应用',
    excerpt: '从需求到上线，完整走一遍 AI 协助的全栈开发流程。',
    content: `
      <article>
        <h1>实战：用AI构建一个完整的Web应用</h1>
        <h2 id="plan">项目规划</h2>
        <p>先定义领域模型和 API 合约，再进入页面和实现。</p>
        <h2 id="delivery">交付路径</h2>
        <p>需求拆分 -> 代码生成 -> 测试修复 -> 部署上线。</p>
      </article>
    `,
    author: 'AI编程导师',
    date: '2026-02-21',
    readTime: '25 分钟',
    category: 'project',
    difficulty: '中级',
    image: '/article-3.jpg',
    coverImage: '/article-3.jpg',
    mediaBlocks: [],
    keyPoints: ['先 API 合约后实现', '迭代测试', '自动化部署'],
    toc: [
      { id: 'plan', label: '项目规划', level: 1 },
      { id: 'delivery', label: '交付路径', level: 1 },
    ],
    tags: ['实战', 'web'],
    episodes: 8,
    duration: '120分钟',
    status: 'coming',
    statusLabel: '即将发布',
    featured: false,
    themeId: 'pm-ai-tools',
    themeName: '产品经理AI工具教程',
    createdAt: now,
  },
  {
    id: '4',
    title: 'OpenClaw 自动化工作流配置指南',
    excerpt: '掌握自动化流水线的配置方式，减少重复劳动。',
    content: `
      <article>
        <h1>OpenClaw 自动化工作流配置指南</h1>
        <h2 id="pipeline">流水线设计</h2>
        <p>建议按 lint/test/build/deploy 四段拆分。</p>
      </article>
    `,
    author: 'AI编程导师',
    date: '2026-02-21',
    readTime: '18 分钟',
    category: 'tools',
    difficulty: '中级',
    image: '/article-4.jpg',
    coverImage: '/article-4.jpg',
    mediaBlocks: [],
    keyPoints: ['流水线分层', '失败快速反馈', '可观测性'],
    toc: [{ id: 'pipeline', label: '流水线设计', level: 1 }],
    tags: ['openclaw', 'automation'],
    episodes: 4,
    duration: '60分钟',
    featured: false,
    themeId: 'openclaw-tools',
    themeName: 'OpenClaw工具教程',
    createdAt: now,
  },
  {
    id: '5',
    title: 'AI辅助调试：快速定位代码问题',
    excerpt: '结合日志、调用链和最小复现，让排障效率提升一个量级。',
    content: `
      <article>
        <h1>AI辅助调试：快速定位代码问题</h1>
        <h2 id="debug-flow">调试流程</h2>
        <ul>
          <li>构造最小复现</li>
          <li>缩小问题边界</li>
          <li>验证修复回归</li>
        </ul>
      </article>
    `,
    author: 'AI编程导师',
    date: '2026-02-21',
    readTime: '10 分钟',
    category: 'basic',
    difficulty: '入门',
    image: '/article-5.jpg',
    coverImage: '/article-5.jpg',
    mediaBlocks: [],
    keyPoints: ['最小复现', '边界定位', '回归验证'],
    toc: [{ id: 'debug-flow', label: '调试流程', level: 1 }],
    tags: ['debug', 'ai'],
    episodes: 3,
    duration: '40分钟',
    status: 'new',
    statusLabel: 'NEW',
    featured: false,
    themeId: 'coding-fundamentals',
    themeName: '编程基础精讲',
    createdAt: now,
  },
  {
    id: '6',
    title: '代码重构的AI助手：从混乱到优雅',
    excerpt: '通过 AI 辅助重构策略，让遗留代码逐步可维护。',
    content: `
      <article>
        <h1>代码重构的AI助手：从混乱到优雅</h1>
        <h2 id="refactor-strategy">重构策略</h2>
        <p>先加测试保护，再做小步重构，最后统一风格。</p>
      </article>
    `,
    author: 'AI编程导师',
    date: '2026-02-21',
    readTime: '20 分钟',
    category: 'project',
    difficulty: '进阶',
    image: '/parallax-1.jpg',
    coverImage: '/parallax-1.jpg',
    mediaBlocks: [],
    keyPoints: ['测试先行', '小步重构', '统一规范'],
    toc: [{ id: 'refactor-strategy', label: '重构策略', level: 1 }],
    tags: ['refactor', 'quality'],
    episodes: 6,
    duration: '90分钟',
    featured: false,
    themeId: 'coding-fundamentals',
    themeName: '编程基础精讲',
    createdAt: now,
  },
];

module.exports = { tutorialSeeds };
