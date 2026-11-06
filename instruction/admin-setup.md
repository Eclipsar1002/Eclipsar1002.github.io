# 网页写作后台：一次性登录配置

网站地址：https://eclipsar1002.github.io/

后台地址：https://eclipsar1002.github.io/admin/

## 1. 部署免费的认证服务

在 Cloudflare 注册账号后，进入 **Workers & Pages → Create → Worker → Hello World**。
不同版本控制台的按钮名称可能略有不同。Worker 命名为 `eclipsar-cms-auth`，选择免费的 workers.dev 域名。

打开 **Edit code**，将仓库里的 `services/cms-auth/worker.mjs` 完整复制到 Worker 入口，保存并部署。

记下它的实际地址，例如 `https://eclipsar-cms-auth.你的子域名.workers.dev`。以下用 `WORKER_URL` 代指这个真实地址。

## 2. 创建 GitHub OAuth 应用

登录 Eclipsar1002，在 https://github.com/settings/developers 进入 **OAuth Apps → New OAuth App**。

- Application name：`Eclipsar 写作后台`
- Homepage URL：`https://eclipsar1002.github.io`
- Authorization callback URL：`WORKER_URL/callback`（替换为上一步真实地址）

创建后获取 **Client ID**，再生成 **Client secret**。
Client secret 只填在下一步 Cloudflare 的 Secret 字段里；不要粘贴到文章、GitHub 仓库或聊天中。

这个 GitHub OAuth 应用使用 `public_repo` 权限，用于后台提交文章和图片。该权限可访问账号有权限的公开仓库，不是 GitHub 提供的单仓库权限。

## 3. 设置 Worker 变量

在 Worker 的 **Settings → Variables and Secrets** 中添加：

| 名称 | 类型 | 值 |
| --- | --- | --- |
| SITE_ORIGIN | 普通变量 | `https://eclipsar1002.github.io` |
| GITHUB_USER | 普通变量 | `Eclipsar1002` |
| GITHUB_CLIENT_ID | Secret | GitHub 应用的 Client ID |
| GITHUB_CLIENT_SECRET | Secret | GitHub 应用的 Client secret |

保存并重新部署。只有 `GITHUB_USER` 指定的账号会收到登录结果。

## 4. 连接后台

把 `public/admin/settings.json` 中的 `authBaseUrl` 改为真实 Worker 地址，例如：

```json
{ "authBaseUrl": "https://eclipsar-cms-auth.你的子域名.workers.dev" }
```

提交并推送，等待 GitHub Actions 部署成功。打开 `/admin/`，点击 GitHub 登录并授权。

这个地址是公开配置，可以提供给协助接入的人；Client secret 不需要提供。

## 日常使用

- **文章**：新增或编辑现有博客，可上传封面和正文图片，支持 Markdown。
- **个人动态**：标题可不填，写碎碎念、上传多张照片，按北京时间展示发布时间。
- **网站设置 → 背景与音乐**：更换全站默认背景、明暗、模糊、雨滴和默认歌单。
- 点击发布后，后台提交到 `main`，GitHub Actions 自动发布；通常几十秒到几分钟生效。
- 图片进入 `public/uploads/`；文章和动态进入各自的内容目录。
- 仓库公开，保存进去的内容和历史版本公开可见。此后台不是私密草稿库。
- 公式和 wiki 双链继续由 Astro 处理，后台预览以基本 Markdown 为主。

## 访问统计和本地外观

访客编号使用不蒜子的**全站累计访问次数**，不是去重人数。刷新和站内页面访问也会计数；JavaScript 被禁用或统计服务被拦截的请求无法统计。数字从接入服务时开始，不能恢复上线之前的历史访问量。

统计失败时显示不可用提示，不显示虚构数字。第三方统计服务按站点来源归集访问量。

右下角“外观”可即时调整当前浏览器的背景和明暗，不会修改其他访客的显示。恢复默认后使用后台设置的全站默认值。

播放器优先保留访客自己选过的歌单；首次访问时使用后台配置的默认歌单。环形条通过 Web Audio AnalyserNode 读取当前歌曲的真实频谱；暂停或静音时归零，不使用随机或模拟跳动。音源必须支持 CORS，当前首选服务的歌单音源已验证支持。
