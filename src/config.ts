// =============================================================================
// Site Configuration
// Edit ONLY this file to customize all content across the site.
// All animations, layouts, and styles are controlled by the components.
// =============================================================================

// -- Site-wide settings -------------------------------------------------------
export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  title: "Coding入门 - AI编程学习平台",
  description: "技术感极简风格的Coding入门学习网站，涵盖Vibe Coding、Claude、OpenClaw、产品经理AI工具、Obsidian+AI等主题",
  language: "zh-CN",
};

// -- Hero Section -------------------------------------------------------------
export interface HeroNavItem {
  label: string;
  sectionId: string;
  icon: "disc" | "play" | "calendar" | "music";
}

export interface HeroConfig {
  backgroundImage: string;
  brandName: string;
  decodeText: string;
  decodeChars: string;
  subtitle: string;
  ctaPrimary: string;
  ctaPrimaryTarget: string;
  ctaSecondary: string;
  ctaSecondaryTarget: string;
  cornerLabel: string;
  cornerDetail: string;
  navItems: HeroNavItem[];
}

export const heroConfig: HeroConfig = {
  backgroundImage: "/hero-bg.jpg",
  brandName: "CODING入门",
  decodeText: "LEARN TO CODE",
  decodeChars: "<>{}[];/\\|",
  subtitle: "用AI赋能编程，从零开始构建你的技术未来",
  ctaPrimary: "开始学习",
  ctaPrimaryTarget: "albums",
  ctaSecondary: "了解更多",
  ctaSecondaryTarget: "gallery",
  cornerLabel: "AI驱动",
  cornerDetail: "智能编程学习平台",
  navItems: [
    { label: "学习主题", sectionId: "albums", icon: "disc" },
    { label: "课程画廊", sectionId: "gallery", icon: "play" },
    { label: "学习路径", sectionId: "tour", icon: "calendar" },
    { label: "关于我们", sectionId: "contact", icon: "music" },
  ],
};

// -- Album Cube Section -------------------------------------------------------
export interface Album {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

export interface AlbumCubeConfig {
  albums: Album[];
  cubeTextures: string[];
  scrollHint: string;
}

export const albumCubeConfig: AlbumCubeConfig = {
  albums: [
    { id: 1, title: "Vibe Coding", subtitle: "AI编程新范式", image: "/cube-vibe.jpg" },
    { id: 2, title: "Claude", subtitle: "AI开发助手", image: "/cube-claude.jpg" },
    { id: 3, title: "OpenClaw", subtitle: "开源自动化工具", image: "/cube-openclaw.jpg" },
    { id: 4, title: "PM AI工具", subtitle: "产品经理智能工具箱", image: "/cube-pm.jpg" },
  ],
  cubeTextures: [
    "/cube-vibe.jpg",
    "/cube-claude.jpg",
    "/cube-code.jpg",
    "/cube-obsidian.jpg",
    "/cube-openclaw.jpg",
    "/cube-pm.jpg",
  ],
  scrollHint: "滚动探索更多学习主题",
};

// -- Parallax Gallery Section -------------------------------------------------
export interface ParallaxImage {
  id: number;
  src: string;
  alt: string;
}

export interface GalleryImage {
  id: number;
  src: string;
  title: string;
  date: string;
}

export interface ParallaxGalleryConfig {
  sectionLabel: string;
  sectionTitle: string;
  galleryLabel: string;
  galleryTitle: string;
  marqueeTexts: string[];
  endCtaText: string;
  parallaxImagesTop: ParallaxImage[];
  parallaxImagesBottom: ParallaxImage[];
  galleryImages: GalleryImage[];
}

export const parallaxGalleryConfig: ParallaxGalleryConfig = {
  sectionLabel: "学习资源",
  sectionTitle: "探索编程世界",
  galleryLabel: "精选课程",
  galleryTitle: "热门学习主题",
  marqueeTexts: [
    "VIBE CODING",
    "CLAUDE AI",
    "OPENCLAW",
    "PM TOOLS",
    "OBSIDIAN",
    "AI编程",
    "学习路径",
  ],
  endCtaText: "查看全部课程",
  parallaxImagesTop: [
    { id: 1, src: "/parallax-1.jpg", alt: "AI编程学习" },
    { id: 2, src: "/parallax-2.jpg", alt: "开发工作流" },
    { id: 3, src: "/parallax-3.jpg", alt: "AI辅助编程" },
  ],
  parallaxImagesBottom: [
    { id: 4, src: "/parallax-4.jpg", alt: "全栈技术栈" },
    { id: 5, src: "/parallax-5.jpg", alt: "代码编辑器" },
    { id: 6, src: "/parallax-6.jpg", alt: "学习成长" },
  ],
  galleryImages: [
    { id: 1, src: "/gallery-1.jpg", title: "Vibe Coding入门", date: "2025.01" },
    { id: 2, src: "/gallery-2.jpg", title: "Claude开发实战", date: "2025.01" },
    { id: 3, src: "/gallery-3.jpg", title: "OpenClaw工具链", date: "2025.02" },
    { id: 4, src: "/gallery-4.jpg", title: "PM AI工具箱", date: "2025.02" },
    { id: 5, src: "/gallery-5.jpg", title: "Obsidian+AI笔记", date: "2025.03" },
    { id: 6, src: "/cube-code.jpg", title: "编程基础精讲", date: "2025.03" },
  ],
};

// -- Tour Schedule Section ----------------------------------------------------
export interface TourDate {
  id: number;
  date: string;
  time: string;
  city: string;
  venue: string;
  status: "on-sale" | "sold-out" | "coming-soon";
  image: string;
}

export interface TourStatusLabels {
  onSale: string;
  soldOut: string;
  comingSoon: string;
  default: string;
}

export interface TourScheduleConfig {
  sectionLabel: string;
  sectionTitle: string;
  vinylImage: string;
  buyButtonText: string;
  detailsButtonText: string;
  bottomNote: string;
  bottomCtaText: string;
  statusLabels: TourStatusLabels;
  tourDates: TourDate[];
}

export const tourScheduleConfig: TourScheduleConfig = {
  sectionLabel: "学习路径",
  sectionTitle: "课程时间表",
  vinylImage: "/vinyl-disc.png",
  buyButtonText: "立即报名",
  detailsButtonText: "查看详情",
  bottomNote: "所有课程支持随时回放",
  bottomCtaText: "订阅课程更新",
  statusLabels: {
    onSale: "报名中",
    soldOut: "已满员",
    comingSoon: "即将开课",
    default: "敬请期待",
  },
  tourDates: [
    {
      id: 1,
      date: "2025.03.01",
      time: "20:00",
      city: "基础入门",
      venue: "Vibe Coding初探",
      status: "on-sale",
      image: "/gallery-1.jpg",
    },
    {
      id: 2,
      date: "2025.03.08",
      time: "20:00",
      city: "AI助手",
      venue: "Claude开发实战",
      status: "on-sale",
      image: "/gallery-2.jpg",
    },
    {
      id: 3,
      date: "2025.03.15",
      time: "20:00",
      city: "自动化",
      venue: "OpenClaw工具链",
      status: "coming-soon",
      image: "/gallery-3.jpg",
    },
    {
      id: 4,
      date: "2025.03.22",
      time: "20:00",
      city: "产品工具",
      venue: "PM AI工具箱",
      status: "coming-soon",
      image: "/gallery-4.jpg",
    },
  ],
};

// -- Footer Section -----------------------------------------------------------
export interface FooterImage {
  id: number;
  src: string;
}

export interface SocialLink {
  icon: "instagram" | "twitter" | "youtube" | "music";
  label: string;
  href: string;
}

export interface FooterConfig {
  portraitImage: string;
  portraitAlt: string;
  heroTitle: string;
  heroSubtitle: string;
  artistLabel: string;
  artistName: string;
  artistSubtitle: string;
  brandName: string;
  brandDescription: string;
  quickLinksTitle: string;
  quickLinks: string[];
  contactTitle: string;
  emailLabel: string;
  email: string;
  phoneLabel: string;
  phone: string;
  addressLabel: string;
  address: string;
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterButtonText: string;
  subscribeAlertMessage: string;
  copyrightText: string;
  bottomLinks: string[];
  socialLinks: SocialLink[];
  galleryImages: FooterImage[];
}

export const footerConfig: FooterConfig = {
  portraitImage: "/footer-portrait.jpg",
  portraitAlt: "AI编程学习",
  heroTitle: "开始你的",
  heroSubtitle: "编程之旅",
  artistLabel: "平台",
  artistName: "Coding入门",
  artistSubtitle: "AI驱动的编程学习平台",
  brandName: "CODING入门",
  brandDescription: "致力于用AI技术降低编程学习门槛，让每个人都能轻松掌握编程技能，构建自己的技术未来。",
  quickLinksTitle: "快速链接",
  quickLinks: ["学习主题", "课程画廊", "学习路径", "关于我们"],
  contactTitle: "联系我们",
  emailLabel: "邮箱",
  email: "hello@codingstart.com",
  phoneLabel: "电话",
  phone: "+86 400-888-8888",
  addressLabel: "地址",
  address: "北京市海淀区中关村科技园",
  newsletterTitle: "订阅更新",
  newsletterDescription: "获取最新课程信息和学习资源",
  newsletterButtonText: "订阅",
  subscribeAlertMessage: "感谢订阅！我们会及时推送最新课程信息。",
  copyrightText: "© 2025 Coding入门. All rights reserved.",
  bottomLinks: ["隐私政策", "服务条款", "联系我们"],
  socialLinks: [
    { icon: "twitter", label: "Twitter", href: "#" },
    { icon: "youtube", label: "YouTube", href: "#" },
    { icon: "instagram", label: "Instagram", href: "#" },
  ],
  galleryImages: [
    { id: 1, src: "/parallax-1.jpg" },
    { id: 2, src: "/parallax-2.jpg" },
    { id: 3, src: "/parallax-3.jpg" },
    { id: 4, src: "/parallax-4.jpg" },
  ],
};
