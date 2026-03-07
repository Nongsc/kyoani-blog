# Kyoani Blog

京阿尼风格博客前端，采用紫罗兰永恒花园天空色系，提供宁静优雅的阅读体验。

## 功能特性

- **全屏 Hero 区域** - Aurora 极光动画背景，一言（Hitokoto）动态展示
- **文章列表** - 响应式网格布局，支持搜索、分类筛选、标签筛选
- **文章详情** - Markdown 渲染，代码高亮，目录导航，相关文章推荐
- **关于页面** - 个人简介、技能展示、社交链接
- **响应式设计** - 完美适配桌面端和移动端

## 技术栈

| 技术 | 说明 |
|------|------|
| [Next.js 16](https://nextjs.org) | React 框架 (App Router) |
| [shadcn/ui](https://ui.shadcn.com) | UI 组件库 |
| [Tailwind CSS v4](https://tailwindcss.com) | 样式框架 |
| [Supabase](https://supabase.com) | 数据库后端 |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown 渲染 |
| [rehype-highlight](https://github.com/rehypejs/rehype-highlight) | 代码高亮 |

## 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── BlogClient.tsx     # 首页客户端组件
│   ├── globals.css        # 全局样式
│   ├── about/             # 关于页面
│   └── article/[slug]/    # 文章详情页
├── components/            # 组件
│   ├── layout/           # 布局组件 (Header, Footer)
│   ├── home/             # 首页组件 (HeroSection, ArticleCard, etc.)
│   ├── article/          # 文章组件 (TOC, MarkdownRenderer, etc.)
│   └── ui/               # UI 基础组件 (Button, Card, etc.)
├── lib/                   # 工具库
│   ├── articles.ts       # 文章数据获取
│   ├── supabase/         # Supabase 客户端
│   └── utils.ts          # 工具函数
└── types/                 # 类型定义
    └── article.ts        # 文章相关类型
```

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/Nongsc/kyoani-blog.git
cd kyoani-blog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 页面说明

### 首页 (`/`)

- 全屏 Hero 区域，Aurora 极光动画背景
- 一言（Hitokoto）动态展示（可在管理后台开启/关闭）
- 文章网格列表
- 分类导航和标签云
- 搜索功能

### 文章详情 (`/article/[slug]`)

- Markdown 内容渲染
- 代码语法高亮
- 目录导航（TOC）
- 相关文章推荐
- 返回顶部按钮

### 关于页面 (`/about`)

- 个人头像和简介
- 技能标签展示
- 社交链接
- 位置、入职年份等信息

## 部署到 Vercel

### 方式一：通过 Vercel Dashboard

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 点击部署

### 方式二：通过 CLI

```bash
npm i -g vercel
vercel
```

## 配色方案

紫罗兰永恒花园天空色系：

```css
:root {
  --background: #F8FBFD;
  --foreground: #2C3E50;
  --primary: #7CB9E8;
  --accent: #89CFF0;
  --border: #A7D8F0;
  --muted: #EEF6FA;
}
```

## 相关项目

- **管理后台**: [kyoani-admin](https://github.com/Nongsc/kyoani-admin)

---

## 致谢

本项目在 **Tencent CodeBuddy** AI 编程助手的辅助下完成开发与部署，感谢腾讯云提供的高效 AI 编程工具。

<p align="center">
  <a href="https://www.codebuddy.cn/">
    <img src="https://img.shields.io/badge/Powered%20by-Tencent%20CodeBuddy-blue?style=flat-square" alt="Powered by Tencent CodeBuddy" />
  </a>
</p>

### 技术致谢

- [Next.js](https://nextjs.org) - React 框架
- [shadcn/ui](https://ui.shadcn.com) - UI 组件库
- [Supabase](https://supabase.com) - 开源 BaaS 平台
- [Vercel](https://vercel.com) - 部署平台

---

<p align="center">
  Made with ❤️ using Tencent CodeBuddy
</p>
