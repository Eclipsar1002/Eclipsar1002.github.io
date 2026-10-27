# Atlas 参数说明

这个文件说明 Atlas 模板中主要可修改参数的位置、用途和示例。大部分站点文案都在 `src/config/site.ts`，博客和项目内容在 `src/content/`。

## 多语言结构

Atlas 集成了中英文多语言：

| 语言 | 路径 | 配置 |
| --- | --- | --- |
| 中文 | `/` | `siteConfigs.zh` |
| English | `/en/` | `siteConfigs.en` |

语言相关工具函数位于：

```text
src/config/site.ts
src/config/i18n.ts
```

`src/config/site.ts` 中的重要导出：

| 导出 | 作用 |
| --- | --- |
| `defaultLocale` | 默认语言，目前为 `zh` |
| `locales` | 语言标签和 HTML lang 配置 |
| `getLocaleFromUrl(url)` | 根据 URL 判断当前语言 |
| `localizePath(locale, path)` | 根据语言生成本地化路径 |
| `getSiteConfig(localeOrUrl)` | 获取当前语言的站点配置 |

英文页面位于：

```text
src/pages/en/
```

博客不按语言拆分，中英文页面都会显示同一批 `src/content/blog/` 文章。项目通过 frontmatter 的 `lang: "en"` 或 `lang: "zh"` 过滤显示。

## 站点配置

配置文件：

```text
src/config/site.ts
```

### 基础信息

| 参数 | 类型 | 作用 |
| --- | --- | --- |
| `name` | `string` | 站点名称，会显示在导航品牌、页面标题和头像 `alt` 中 |
| `title` | `string` | 首页头像旁边的身份说明 |
| `description` | `string` | 站点默认描述，用于 SEO 和页面 meta |
| `email` | `string` | 联系邮箱 |
| `location` | `string` | 简历页面的位置字段 |
| `avatar` | `string` | 头像路径，默认 `/avatar.png` |
| `visitorCount` | `string` | 首页访客编号展示文本中的数字 |

示例：

```ts
name: 'Atlas',
title: '学生 / 设计工程学习者',
description: '一个黑色系 Astro 个人网站模板。',
email: 'luckykevvv@gmail.com',
location: 'Campus / Online',
avatar: '/avatar.png',
visitorCount: '0001',
```

## 导航

参数：

```ts
nav: [
  { label: '首页', href: '/' },
  { label: '关于我', href: '/about' },
]
```

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `label` | `string` | 导航显示文字 |
| `href` | `string` | 跳转路径 |

导航会同时用于桌面端和移动端 Header。

## 社交链接

参数：

```ts
socials: [
  { label: 'GitHub', href: 'https://github.com/yourname', icon: 'GH' },
]
```

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `label` | `string` | 平台名称 |
| `href` | `string` | 外部链接 |
| `icon` | `string` | 社交按钮左侧的小字符图标 |

社交链接会显示在 Footer、联系区块和联系页面。

## 首页服务卡片

参数：

```ts
services: [
  '课程作业与学习记录',
  '小项目和奇怪实验',
]
```

这些文字会显示在首页首屏下方，也会被关于我页面的能力模块复用。

## 首页快捷入口

参数：

```ts
quickLinks: [
  { label: '博客', href: '/blog', icon: '书' },
]
```

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `label` | `string` | 按钮文字 |
| `href` | `string` | 跳转路径 |
| `icon` | `string` | 按钮左侧的小字符图标 |

## 今日状态

参数：

```ts
today: {
  title: '今日小状态',
  current: '正在：整理课程笔记',
  next: '稍后：改一个小项目',
  note: '今日目标：把 README 写明白',
}
```

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `title` | `string` | 状态卡片标题 |
| `current` | `string` | 第一行状态 |
| `next` | `string` | 第二行状态，默认蓝色强调 |
| `note` | `string` | 第三行状态，默认白色加粗 |

## 通用 UI 文案

参数：

```ts
ui: {
  headerCta: '打个招呼',
  projectCta: '查看项目 ->',
  projectLiveCta: '访问项目',
  projectRepoCta: '查看代码',
  backToList: '返回列表',
  socialCardCta: '查看主页',
}
```

| 字段 | 作用 |
| --- | --- |
| `headerCta` | Header 右侧按钮 |
| `projectCta` | 项目卡片底部按钮 |
| `projectLiveCta` | 项目详情页外部访问按钮 |
| `projectRepoCta` | 项目详情页代码仓库按钮 |
| `backToList` | 博客/项目详情页返回按钮 |
| `socialCardCta` | 联系页面社交卡片按钮 |

## 首页文案

参数：

```ts
home: {
  eyebrowNote: '一个学生的主页入口，放作品、笔记和正在折腾的东西。',
  visitorText: '访客编号 #{count}，欢迎翻翻这个小角落',
  headline: '把上课、折腾和突然冒出的想法都放在这里。',
  intro: '这是一个更适合学生使用的 Astro 个人主页模板...',
  primaryCta: { label: '看看项目', href: '/projects' },
  secondaryCta: { label: '打个招呼', href: '/contact' },
  projects: {
    kicker: 'Small Builds',
    title: '最近做的小项目',
    description: '不一定成熟，也不一定有很大的目标...',
  },
  notes: {
    kicker: 'Notes',
    title: '最新笔记',
    description: '课堂、前端、设计、生活观察...',
  },
}
```

| 字段 | 作用 |
| --- | --- |
| `eyebrowNote` | 头像旁边的小说明 |
| `visitorText` | 访客编号文字，`{count}` 会替换为 `visitorCount` |
| `headline` | 首页主标题 |
| `intro` | 首页简介 |
| `primaryCta` | 首页主按钮 |
| `secondaryCta` | 首页次按钮 |
| `projects` | 首页项目区标题文案 |
| `notes` | 首页笔记区标题文案 |

## 页面文案

所有页面级文案都在：

```ts
pages: {
  about: {},
  projects: {},
  blog: {},
  resume: {},
  contact: {},
}
```

### 关于我页面

```ts
pages.about
```

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题 |
| `description` | 页面 meta 描述 |
| `kicker` | 区块小标题 |
| `heading` | 页面主标题 |
| `intro` | 页面简介 |
| `profileLabel` | Profile 卡片标签 |
| `profile` | Profile 卡片正文 |
| `paragraphs` | 右侧介绍段落数组 |
| `servicesTitle` | 服务/栏目区标题 |
| `servicesDescription` | 服务/栏目区简介 |
| `serviceDescription` | 每个服务卡片的说明文字 |
| `skillsTitle` | 技能区标题 |

### 项目页面

```ts
pages.projects
```

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题 |
| `description` | 页面 meta 描述 |
| `kicker` | 区块小标题 |
| `heading` | 页面主标题 |
| `intro` | 页面简介 |

### 博客页面

```ts
pages.blog
```

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题 |
| `description` | 页面 meta 描述 |
| `kicker` | 区块小标题 |
| `heading` | 页面主标题 |
| `intro` | 页面简介 |

### 简历页面

```ts
pages.resume
```

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题 |
| `description` | 页面 meta 描述 |
| `kicker` | 区块小标题 |
| `heading` | 页面主标题 |
| `intro` | 页面简介 |
| `locationLabel` | 位置字段标签 |
| `emailLabel` | 邮箱字段标签 |
| `skillsLabel` | 技能字段标签 |

### 联系页面

```ts
pages.contact
```

| 字段 | 作用 |
| --- | --- |
| `title` | 页面标题 |
| `description` | 页面 meta 描述 |
| `kicker` | 区块小标题 |
| `heading` | 页面主标题 |
| `intro` | 页面简介 |

## 底部联系区块

参数：

```ts
contactPanel: {
  kicker: 'Message',
  heading: '看到有意思的项目、笔记或者同样在折腾个人网站，可以来聊聊。',
}
```

这个区块会出现在关于我、简历、联系和首页底部。

## 技能和经历

### 技能

```ts
skills: ['Astro', 'TypeScript', 'Tailwind CSS']
```

用于关于我页面和简历页面。

### 经历

```ts
experience: [
  {
    period: '2025 - Now',
    role: 'Student Builder',
    company: '校园与课余时间',
    description: '把课程作业、个人兴趣和前端练习整理成可以长期维护的项目与笔记。',
  },
]
```

| 字段 | 作用 |
| --- | --- |
| `period` | 时间范围 |
| `role` | 角色或身份 |
| `company` | 学校、组织、项目来源或自由描述 |
| `description` | 经历说明 |

## 博客参数

博客文件目录：

```text
src/content/blog/
```

博客文件格式：

```md
---
title: "我的第一篇笔记"
description: "这是一段笔记摘要。"
pubDate: 2026-05-20
updatedDate: 2026-05-21
tags: ["Astro", "学习"]
draft: false
---

正文内容。
```

| 字段 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `title` | `string` | 是 | 文章标题 |
| `description` | `string` | 是 | 文章摘要 |
| `pubDate` | `date` | 是 | 发布日期，用于排序 |
| `updatedDate` | `date` | 否 | 更新日期 |
| `tags` | `string[]` | 否 | 标签 |
| `draft` | `boolean` | 否 | 是否草稿，`true` 不会出现在列表和动态路由中 |

## 项目参数

项目文件目录：

```text
src/content/projects/
```

项目文件格式：

```md
---
lang: "zh"
title: "课程 Dashboard"
description: "一个为课程作业制作的小型看板。"
date: 2026-05-20
tags: ["Astro", "Tailwind"]
role: "课程项目"
url: "https://example.com"
repo: "https://github.com/yourname/project"
featured: true
---

项目详情正文。
```

| 字段 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `lang` | `'zh' \| 'en'` | 否 | 内容语言，默认 `zh` |
| `title` | `string` | 是 | 项目标题 |
| `description` | `string` | 是 | 项目摘要 |
| `date` | `date` | 是 | 项目日期，用于排序和显示年份 |
| `tags` | `string[]` | 否 | 项目标签 |
| `role` | `string` | 是 | 项目角色、类型或身份 |
| `url` | `url` | 否 | 项目在线链接 |
| `repo` | `url` | 否 | 项目代码仓库 |
| `featured` | `boolean` | 否 | 是否显示在首页项目区 |

首页项目区只显示 `featured: true` 的项目。

## 静态资源

| 文件 | 作用 |
| --- | --- |
| `public/avatar.png` | 首页头像 |
| `public/favicon.svg` | 浏览器标签页图标 |
| `public/favicon.ico` | 旧浏览器 favicon 兜底 |

如果替换头像，保持路径为 `/avatar.png` 最简单；如果改文件名，需要同步修改 `siteConfig.avatar`。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 本地预览生产版本 |

## 模板修改建议

- 修改个人信息优先改 `src/config/site.ts`。
- 新增博客文章放到 `src/content/blog/`。
- 新增项目放到 `src/content/projects/`。
- 想让项目出现在首页，设置 `featured: true`。
- 想隐藏博客草稿，设置 `draft: true`。
- 页面结构和样式在 `src/pages/`、`src/components/` 和 `src/styles/global.css`。
