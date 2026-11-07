# Eclipsar 的个人网站

记录学习、项目、博客笔记、照片与日常碎片的个人空间。基于 **Atlas** 模板继续开发，使用 Astro 构建静态页面，通过 GitHub Pages 托管；写作后台使用 Decap CMS，GitHub OAuth 登录由 Cloudflare Worker 处理。

- 网站：<https://eclipsar1002.github.io/>
- 写作后台：<https://eclipsar1002.github.io/admin/>
- 个人动态：<https://eclipsar1002.github.io/moments/>
- 源代码：<https://github.com/Eclipsar1002/Eclipsar1002.github.io>

## 来源与致谢

网站由多个开源项目和教程支持。这里区分模板来源、实际使用的依赖，以及设计和实现参考；不代表这些项目的作者参与或背书本站。

| 项目 | 在本站中的作用 |
| --- | --- |
| [luckykevvv/Atlas](https://github.com/luckykevvv/Atlas) | 原始网站模板来源。本站沿用并修改其 Astro 项目结构、页面模块、内容集合、博客排版、项目页、知识图谱和基础视觉设计；保留原项目的 GPL-3.0 许可证。 |
| [Hiweny/rain · 听雨](https://github.com/Hiweny/rain/tree/main/) | 雨景氛围和听雨网站的设计参考，按站主说明记录来源。本站当前实际渲染玻璃雨滴的代码使用下列 raindrop-fx 库，不将两个项目混为同一来源。 |
| [SardineFish/raindrop-fx](https://github.com/SardineFish/raindrop-fx) | 实际安装并使用的 WebGL 雨滴依赖，版本 1.0.8，MIT。`RainEffect.astro` 负责背景图、性能分级、页面切换和外观开关联动。 |
| [JIEJOE-WEB-Tutorial/017-audio-wave](https://github.com/JIEJOE-WEB-Tutorial/017-audio-wave) | 音乐封面周围的径向白色音频线条实现参考。将原教程的 PCM 分组振幅方法改为读取当前播放音频的实时 PCM，并调整线条数量、宽度、振幅和平滑参数。MIT 声明保存在 [public/licenses/jiejoe-audio-wave.txt](public/licenses/jiejoe-audio-wave.txt)。 |
| [WenqiOfficial/StudyWithMiku](https://github.com/WenqiOfficial/StudyWithMiku) | 音乐歌单接入方式的参考：使用 Meting 兼容接口读取网易云歌单。本站播放器、共享 Audio 生命周期和控制界面由本仓库维护，不直接使用其整站播放器。 |
| [metowolf/Meting](https://github.com/metowolf/Meting) | 音乐 API 生态与协议来源。本站通过第三方 Meting 兼容服务获取歌单和音频链接，未在 GitHub Pages 中部署 PHP Meting 服务。 |
| [decaporg/decap-cms](https://github.com/decaporg/decap-cms) | 浏览器写作和媒体上传后台，当前加载 Decap CMS 3.17.3。内容通过 GitHub backend 提交。 |
| [withastro/astro](https://github.com/withastro/astro) | Astro 6 静态构建、路由、内容集合和页面导航。 |
| [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | Tailwind CSS 4 样式。 |
| [KaTeX/KaTeX](https://github.com/KaTeX/KaTeX) | 博客数学公式渲染。 |
| [不蒜子](https://busuanzi.ibruce.info/) | 早期访客统计服务来源；当前已停用，原位置改为随机诗词。 |

感谢上述作者和维护者。完整依赖版本见 `package.json` 和 `package-lock.json`，各第三方项目保留自己的许可条件。歌曲、封面、个人照片及 PDF 的版权属于各自权利人，不因代码开源而自动获得再分发授权。

原 Atlas 模板说明保存在 [instruction/atlas-original-readme.md](instruction/atlas-original-readme.md)，便于追溯原有功能与用法。本站当前功能以下文为准。

## 当前功能

- **首页**：个人介绍、快捷入口、精选项目、最新博客和音乐播放器。
- **项目**：项目列表和 Markdown 详情，支持日期、角色、标签、精选、演示网址、源码仓库及 PDF 附件。
- **博客**：Markdown、标签、封面、公式、阅读统计、双链和知识图谱，支持 PDF 附件。
- **个人动态**：按时间倒序展示碎碎念、多张照片、可选标题和标签。原简历地址跳转至动态页。
- **外观**：右下角面板即时调整亮度、背景图片和雨滴开关，设置保存在当前浏览器；后台只管理全站默认背景、亮度、模糊和歌单。
- **音乐**：网易云歌单、顺序/随机/单曲模式、音质和进度/音量控制。圆形封面与实时 PCM 音频线条；默认歌单 ID 为 `18085490924`。共享 Audio 在站内导航时继续播放。
- **随机诗词**：首页以白色楷体风格显示小字号常规字重诗句，作者与作品名称右对齐，接入今日诗词在线库，进入首页或点击换句；网络异常时使用本地备用诗句。
- **网页管理**：GitHub 登录后可管理文章、项目、动态、图片、PDF 和网站默认设置。

## 本地运行

需要 Node.js **22.12 或更新版本**，推荐 Node.js 22 LTS。

```sh
npm ci
npm run dev
```

构建、预览和认证服务测试：

```sh
npm run build
npm run preview
node --test services/cms-auth/worker.test.mjs
```

访问终端输出的本地地址。默认发布采用静态模式，直接上传 `dist/` 即可。模板仍保留 Node SSR/Steam 等代码，但 GitHub Pages 上不运行 Node 服务，不能将这些 API 当作线上动态服务使用。

## 后台日常使用

1. 打开 `/admin/`，点击 GitHub 登录；本站认证服务仅允许配置的站主账号。
2. 选择 **文章 / 项目 / 个人动态 / 网站设置**。
3. 新建或编辑内容，上传媒体，然后保存发布。
4. 后台将内容提交到 `main`，GitHub Actions 自动构建、测试并部署整个网站。
5. 等待 [Actions](https://github.com/Eclipsar1002/Eclipsar1002.github.io/actions) 中对应提交的构建与部署都成功，再刷新前台。

**后台保存成功不等于网站立即上线。** GitHub Pages 的部署可能需要数分钟；连续提交还可能排队。若未显示，先检查 Actions 是否失败或仍在运行，不要反复创建同一条动态。部署成功后旧页面仍未更新，可使用 `Ctrl+F5` 或手机浏览器重新加载。

### 项目管理

项目后台可以编辑标题、简介、日期、语言、角色/类别、标签、正文、项目网址、源码链接及附件。开启“首页精选”后，该项目才会参与首页精选列表，项目列表仍显示全部项目。中文为当前主要站点语言，旧英文路径保留兼容。

### 上传 PDF

在文章或项目的 **PDF 附件 → 新增** 中，填写显示名称并上传 PDF，可添加多个附件。保存发布后，详情页提供“打开 PDF”和“下载”入口；手机可以在新标签页打开文档，不依赖内嵌阅读器。

媒体文件保存于 `public/uploads/`，网站地址为 `/uploads/文件名.pdf`。建议使用简短且不重复的文件名，并先压缩大型文件；GitHub 普通 Git 单文件存在 100 MiB 上限，图片和 PDF 也会使仓库历史持续增大。

内容示例：

```yaml
attachments:
  - name: 项目报告
    file: /uploads/project-report.pdf
```

后台和源仓库均为公开内容工作流。上传的照片、PDF、已提交的草稿与历史版本都可能公开；删除网页中的附件链接不会自动清除 Git 历史。

### 外观和雨滴

- 右下角“外观”：修改当前浏览器的显示偏好，雨滴开关立即生效，无需等待部署。
- “听雨模式”向所有访客开放，无需登录；手动开启后同时打开背景雨滴，并用独立循环音频播放 [Rainy Mood 雨声](https://media.rainymood.com/0.mp3)，可单独调节音量。参考项目 `Hiweny/rain` 的 `useRainAudio` 为雨声与网易云歌单各建一个 `<audio>`；雨声用 `loop` 循环，歌单走独立队列，因此不会改动主页音乐播放器。站内切换页面可继续听，刷新后需重新点击开启。该参考仓库也注明 Rainy Mood 热链可能不稳定，长期使用建议改成本地授权音频。
- 后台“网站设置 → 背景与音乐”：修改全站默认背景、亮度、模糊和歌单，保存后需要等待部署。
- 浏览器已经保存的背景/亮度优先于全站默认值；“恢复默认”会清除本地偏好并恢复默认开启的雨滴。
- 雨滴需要 WebGL2；浏览器不支持或初始化失败时保留静态背景。移动设备会降低密度和渲染分辨率。

### 随机诗词

原访客编号位置已替换为随机诗词，显示白色诗句和作者、作品名称。优先使用设备自带楷体，缺少时回退宋体／衬线字体，诗句缩小，和出处保持一致的常规字重，保留自然字形，作者与作品名称右对齐；手机无需额外下载大型中文字体，实际字形因系统而异。

进入首页会随机选一句，点击诗词（键盘也可操作）换成其他句子。使用 [今日诗词](https://www.jinrishici.com/) 的公开接口 `https://v1.jinrishici.com/all.json`，无需在前端放密钥。请求超时、异常数据或断网时保留本地诗句；连续点击取消旧请求，避免过期结果覆盖最新内容。第三方诗词库可能重复，也不能保证仅返回冷门诗句。禁用 JavaScript 时仍显示默认诗句。本地备用集在 `src/components/RandomPoem.astro` 中维护。页面不再请求不蒜子统计服务。

### 音乐说明

歌单来自第三方 Meting 兼容接口，当前依次尝试 qijie、injahow、xiaoguan 和 i-meto；服务可用性、授权状态、地区限制、音频格式和链接有效期均由上游决定。前端不存储歌曲文件，也不保证每首歌或每种音质均可用。实时可视化需要音频资源允许跨域访问。

移动浏览器通常要求用户主动点击播放。本站接入 Media Session API，支持系统提供的锁屏/通知栏播放、暂停、上下曲和进度操作；站内导航继续使用同一个原生音频实例。后台只停止绘制音频线条，不主动暂停声音。手机首次加载使用标准音质，音源失败会停止并提示，避免连续跳歌。

iOS 使用原生音频输出，不将声音接入 Web Audio 分析链，减少锁屏时 AudioContext 被挂起导致无声的风险；因此 iPhone/iPad 保留封面旋转，径向音频线条静止，桌面和支持的 Android 浏览器保留实时 PCM 动效。先在 Safari/Chrome 中手动播放，再锁屏或切换应用即可尝试后台听歌。系统是否持续运行网页、显示哪些锁屏按钮，以及后台是否允许加载下一首，仍由设备和浏览器决定；微信内置浏览器、省电模式、关闭标签页或系统清理可能中断播放，添加到主屏幕不会解除这些限制。

## 部署结构与配置

```text
浏览器 → GitHub Pages 静态页面
写作后台 → Cloudflare Worker OAuth → GitHub 登录
后台内容提交 → main 分支 → GitHub Actions → GitHub Pages
```

主要文件：

```text
src/config/site.ts              站点介绍、导航、页面模块、联系方式
src/config/appearance.json      全站默认背景、亮度、模糊、歌单
src/content.config.ts          博客/项目/动态的数据校验
src/content/blog/              博客 Markdown
src/content/projects/          项目 Markdown
src/content/moments/           动态 Markdown
src/components/                播放器、雨滴、外观、统计和附件等组件
src/lib/audio-spectrum.ts      实时 PCM 径向音频线条
src/lib/meting.ts              歌单提供方与音质配置
public/admin/                  Decap CMS 页面、编辑字段、认证服务地址
public/uploads/                图片与 PDF
public/licenses/               第三方署名声明
services/cms-auth/              Cloudflare Worker 认证源码及测试
.github/workflows/deploy.yml    构建、认证测试与 Pages 部署
instruction/admin-setup.md     OAuth 一次性配置步骤
```

### GitHub Pages

在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。工作流监听 `main` 的推送，也可手动运行。构建执行 `npm ci`、`npm run build` 和认证测试，再上传 `dist/` 并部署；仓库需要允许 Pages 与 Actions 所需权限。

迁移到其他账号或域名时，同时更新 Astro 的站点配置（如有）、CMS 的 `repo/site_url/display_url`、Worker 的 `SITE_ORIGIN/GITHUB_USER` 和 OAuth 应用回调地址。

### Cloudflare OAuth

部署 `services/cms-auth/worker.mjs`，设置以下运行时变量：

| 变量 | 用途 |
| --- | --- |
| `SITE_ORIGIN` | 允许接收登录结果的网站 Origin，如 `https://eclipsar1002.github.io` |
| `GITHUB_USER` | 允许管理网站的 GitHub 用户，如 `Eclipsar1002` |
| `GITHUB_CLIENT_ID` | GitHub OAuth 应用 Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 应用密钥，仅存于 Cloudflare Secret |

OAuth 回调设置为 `https://你的-worker.workers.dev/callback`；`public/admin/settings.json` 的 `authBaseUrl` 填 Worker 的 HTTPS Origin。`/health` 供健康检查，`/auth?provider=github` 发起授权。服务使用 HttpOnly/Secure 状态 Cookie、校验 OAuth state、限制 GitHub 账号，并将结果发送到指定站点 Origin。

GitHub 授权请求使用 `public_repo`，不是单仓库权限。不要把 OAuth 密钥或个人访问令牌提交到仓库。详细步骤见 [后台接入说明](instruction/admin-setup.md)。

## 许可证

本仓库延续 Atlas 的 [GNU GPL v3.0](LICENSE)，保留原作者版权及许可声明。第三方依赖和参考代码遵循各自许可证；音频线条改编所需 MIT 声明随仓库提供。本站文章、图片、音乐和附件等内容不因源代码许可证而自动适用同一授权。
