# 🗺️Atlas

中文 | [English](./README.en.md)

Atlas 是一个黑色系 [Astro](https://astro.build) 个人网站模板

模板使用 Astro Content Collections 管理博客和项目数据，内容以 Markdown 维护，适合长期更新和二次修改。

## ✨ Demo

[![Astro 6](https://img.shields.io/badge/Astro-6-ff5d01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
![Node.js >= 22.12](https://img.shields.io/badge/Node.js-%3E%3D22.12-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Static or Node SSR](https://img.shields.io/badge/Output-Static%20%2F%20Node%20SSR-111827?style=for-the-badge)

🌐 在线预览：[https://blog.chihaya-anon.uk/](https://blog.chihaya-anon.uk/)

🌧️ 可配置背景、雨滴动画、双语导航、状态卡片和个人入口都在这个 Demo 里。

![Atlas demo screenshot](./public/demo.png)

## ✨特性

- [x] 黑色系视觉风格，适合学生个人主页和作品集
- [x] 首页包含头像、状态卡片、快捷入口、项目和最新笔记
- [x] 内置关于、项目、博客、简历、联系方式页面
- [x] 集成中英文多语言：中文默认路径，英文路径为 `/en/`
- [x] 博客使用 Markdown 编写
- [x] 项目详情使用 Markdown 编写
- [x] 主要站点文案集中在 `src/config/site.ts`
- [x] 使用 `src/content.config.ts` 定义 Content Collections
- [x] 使用 Tailwind CSS v4 和 `@tailwindcss/vite`
- [x] 默认静态输出，可选 Node SSR 动态模式用于 Steam 实时状态等服务端功能

## 2025.05.23 更新

本次更新主要是功能和工程结构调整，不包含具体个人文案内容：

- 新增可配置背景系统：支持背景图片、模糊、透明度、缩放、遮罩和雨滴动画控制
- 背景雨动画支持两种模式：`falling` 从上往下落雨，`front` 正对屏幕下雨并产生涟漪
- 首页服务入口和关于页服务列表解耦，分别使用 `home.services` 和 `pages.about.services`
- 简历页新增 PDF 下载入口，PDF 可放在 `public/` 并通过 `resume.files` 配置，可配置多个文件
- 简历项目条目新增 `link` 字段，支持为单个项目配置多个跳转按钮和自定义按钮名称
- 简历数据结构整理为 `summary`、`details`、`links`、`highlights`、`sections`
- 移除旧的未使用字段，如 `experience`、`location`、`locationLabel`
- 新增图标组件，社交链接、快捷入口和邮箱图标支持图片 URL
- 新增知识图谱页面和双链支持，博客可以通过 wiki link 建立文章关系
- 博客动态路由调整为多级路径，方便按课程或主题组织 Markdown 文件
- 新增动态开发入口和 PM2 生产运行方式，用于需要服务端能力的部署

## 2025.05.28 更新

本次更新为页面模块化重构，将固定页面从硬编码组件改为可配置的模块系统：

- 页面模块化：所有固定页面改为通过 `PageRenderer` 动态渲染 `pages` 配置中的模块数组
- 新增 `src/modules/` 目录，包含 14 个可复用模块组件，覆盖首页、关于、项目、博客、图谱、简历、联系等页面
- 模块类型定义集中在 `src/modules/types.ts`，新增模块只需实现组件并在 `types.ts` 添加类型条目
- 新增自定义页面支持：通过站点配置中的 `customPages` 即可生成新页面，无需额外创建 Astro 路由文件
- 清理冗余配置字段：移除页面层级的 `kicker`/`heading`/`intro`（数据已在模块 props 中维护），移除 `home.services`/`home.projects`/`home.notes` 废弃字段，移除 `downloadResumeLabel`
- 本地化逻辑统一：新增 `localizeModuleLinks` 函数自动处理模块内链接的多语言转换，替代旧的页面级 `services.map` 方案
- 新增动态服务器模式：通过 `npm run setup` 交互式选择静态或 Node SSR 模式，支持 Steam 实时状态和访客计数等需要服务端的动态功能
- 新增 Steam 状态 API 和首页 Steam 状态徽章，实时显示在线状态和当前游戏
- 新增 Steam 资料卡组件，关于页通过 `steamProfile` 模块展示 Steam 个人资料和游戏记录
- 新增 `gameList` 模块，关于页支持配置自定义条目列表（游戏、兴趣领域等），支持图标和链接
- 首页问候语和 Steam 状态修复，语言切换后自动刷新
- 新增 PM2 生产运行支持（`npm run pm2:start`）
- 示例 `site.ts` 同步更新，展示完整的模块化配置示例

## 📝项目结构

```text
src/
  components/        可复用 UI 组件
  modules/           可复用页面模块组件
  config/            站点文案、导航、社交链接和经历数据
  content/           博客和项目 Markdown 内容
  layouts/           基础布局和 Markdown 布局
  pages/             页面路由
  styles/            全局 Tailwind 样式
public/
  avatar.png         默认头像占位图
  favicon.svg        浏览器标签页图标
```

## 🚀快速开始

安装依赖：

```sh
npm install
```

也可以使用交互式安装脚本选择静态模式或动态服务器模式：

```sh
npm run setup
```

启动开发服务器：

```sh
npm run dev
```

构建生产版本：

```sh
npm run build
```

本地预览生产版本：

```sh
npm run preview
```

## 📝自定义模板

大部分模板文案都在：

```text
src/config/site.ts
```

你可以在这里修改：

- 站点名称和描述
- 中英文站点文案
- 导航菜单
- 头像路径
- 社交链接
- 首页标题、简介和按钮
- 状态卡片
- 快捷入口
- 关于我、项目、博客、简历、联系页面文案
- 技能和经历
- 通用按钮文案

### 页面模块

固定页面现在也从 `src/config/site.ts` 的 `pages` 配置生成。每个页面包含 `title`、`description` 和 `modules`，页面顺序就是 `modules` 数组顺序：

```ts
pages: {
  about: {
    title: '关于我',
    description: '关于我的个人介绍',
    modules: [
      {
        type: 'aboutIntro',
        props: {
          kicker: 'About',
          heading: '关于我',
          profileLabel: 'Profile',
          profile: '学生 / 开发者',
          paragraphs: ['这里写介绍。'],
        },
      },
      { type: 'steamProfile' },
      {
        type: 'gameList',
        props: {
          title: '最近在玩',
          description: '欢迎来找我玩',
          items: [
            { label: 'Game Name', gameId: 123, icon: '/game/icon.png', href: 'https://example.com' },
          ],
        },
      },
      { type: 'contactPanel' },
    ],
  },
}
```

可用模块类型在 `src/modules/types.ts` 里维护。目前内置模块包括：

- `homeHero`：首页首屏、状态卡和 Steam 小徽章
- `linkGrid`：首页快捷入口
- `projectGrid` / `projectList`：项目列表
- `blogPreview` / `blogIndex`：博客预览和博客索引
- `aboutIntro`：关于页介绍
- `steamProfile`：Steam 资料卡
- `gameList`：自定义游戏/条目列表，支持 `icon`、`href`、`gameId`
- `skillCloud`：技能标签云
- `knowledgeGraph`：知识图谱
- `resume`：简历页主体
- `contactCards`：联系方式卡片
- `contactPanel`：底部联系区块
- `pageHeader`：通用页面标题
- `richText`：简单文本段落

博客详情页和项目详情页仍然来自 `src/content/` 的 Markdown；模块系统负责列表页、固定页面和自定义页面。

### 自定义页面

你可以在对应语言配置里添加 `customPages`，不用新增 Astro 页面文件：

```ts
customPages: [
  {
    path: '/uses',
    title: '我的工具',
    description: '常用设备和软件',
    modules: [
      {
        type: 'pageHeader',
        props: {
          kicker: 'Uses',
          heading: '我的工具',
          intro: '这里记录我常用的工具。',
        },
      },
      {
        type: 'richText',
        props: {
          body: ['第一段内容。', '第二段内容。'],
        },
      },
    ],
  },
]
```

中文配置里的自定义页面会生成 `/uses/`，英文配置里的自定义页面会生成 `/en/uses/`。`about`、`blog`、`contact`、`graph`、`projects`、`resume` 是固定页面根路径，不能被 `customPages` 覆盖。

## 多语言

Atlas 默认使用中文页面，英文页面路径为：

```text
/en/
/en/about/
/en/projects/
/en/blog/
/en/resume/
/en/contact/
```

语言配置在：

```text
src/config/site.ts
```

其中 `zh` 是中文配置，`en` 是英文配置。Header 会自动显示语言切换按钮。

博客默认只有一份内容，中英文页面都会显示同一批文章。项目可以通过 frontmatter 的 `lang` 字段区分中英文版本：

```md
---
lang: "zh"
title: "中文项目"
---
```

```md
---
lang: "en"
title: "English Project"
---
```

替换默认头像：

```text
public/avatar.png
```

替换浏览器标签页图标：

```text
public/favicon.svg
```

社交链接图标可以在 `src/config/site.ts` 的 `socials` 中设置。`icon` 支持短文本，也支持图片地址：

```ts
{ label: 'GitHub', href: 'https://github.com/yourname', icon: 'https://cdn.simpleicons.org/github/white' }
```

邮箱图标可以通过同一个配置文件里的 `emailIcon` 修改：

```ts
emailIcon: 'https://cdn.simpleicons.org/gmail/white'
```

首页标题、页面标题、简介和底部联系区块标题支持 `\n` 手动换行：

```ts
headline: '第一行\n第二行'
```

## 内容管理

博客文章放在：

```text
src/content/blog/
```

项目内容放在：

```text
src/content/projects/
```

博客示例：

```md
---
title: "我的第一篇笔记"
description: "这是一段笔记摘要。"
pubDate: 2026-05-20
tags: ["Astro", "学习"]
draft: false
---

在这里写你的笔记正文。
```

项目示例：

```md
---
lang: "zh"
title: "课程 Dashboard"
description: "一个为课程作业制作的小型看板。"
date: 2026-05-20
tags: ["Astro", "Tailwind"]
role: "课程项目"
featured: true
---

在这里写你的项目介绍。
```

## 双链和知识图谱

博客 Markdown 支持类似 Obsidian 的双链语法：

```md
[[design-engineering]]
[[astro-content-collections|Astro 内容集合]]
```

构建或动态开发模式下会自动转换成站内博客链接。每篇文章底部会显示“反向链接”，列出提到当前文章的其他笔记。

双链默认按文件名解析，不需要写完整目录。比如文件在：

```text
src/content/blog/course-notes/week-02-expectation.md
```

可以直接写：

```md
[[week-02-expectation]]
```

如果不同目录下出现同名文件，再写完整路径：

```md
[[course-notes/week-02-expectation]]
```

知识图谱页面位于：

```text
/graph
```

图谱会扫描博客文章、标签和双链关系。文章节点可以点击跳转到对应博客。

## 部署

Atlas 会构建为 `dist/` 里的静态文件：

```sh
npm run build
```

你可以把它部署到任意静态托管平台。Astro 官方部署说明见 [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/)。

## 动态更新模式

Atlas 默认可以作为静态站点构建。如果你希望启用需要服务端的功能，例如 Steam 实时状态，请使用动态服务器模式：

```sh
npm install
npm run build:dynamic
npm run start
```

默认监听：

```text
http://服务器IP:4321
```

Steam 状态和服务器监听配置统一写入 `.env`：

```sh
STEAM_API_KEY=你的 Steam Web API Key
STEAM_ID_64=你的 64 位 Steam ID
HOST=0.0.0.0
PORT=4321
ATLAS_DATA_DIR=.atlas-data
```

Steam 个人资料和游戏状态需要允许公开，否则只能显示离线或不可用状态。动态访客计数会写入 `ATLAS_DATA_DIR` 下的本地 JSON 文件。不要提交真实 `.env`，仓库只提供 `.env.example` 模板；如果 `.env` 与系统环境变量同名，项目以 `.env` 为准。

更适合长期运行的方式是 PM2，`pm2:start` 会先构建动态版本再启动生产服务器：

```sh
npm install
npm install -g pm2
npm run pm2:start
pm2 save
```

常用命令：

```sh
npm run pm2:restart
npm run pm2:stop
npm run pm2:logs
npm run pm2:delete
```

动态模式会生成 Node SSR 服务器，而不是只生成可直接托管的静态文件。适合个人站、内网预览或你自己维护的 VPS；如果公开访问，建议前面加 Nginx / Caddy 反向代理和 HTTPS。

如果只需要静态站点，不启用 Steam 实时状态，继续使用：

```sh
npm install --omit=optional
npm run build
```

## License

本项目基于 [GNU General Public License v3.0](./LICENSE) 开源。
