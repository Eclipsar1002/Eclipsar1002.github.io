const status = document.getElementById('admin-status');
const message = document.getElementById('admin-message');

async function boot() {
  const response = await fetch('/admin/settings.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('无法读取后台设置');
  const settings = await response.json();
  if (!settings.authBaseUrl) {
    message.textContent = '文章、项目、个人动态和外观设置的编辑器已准备好。首次使用还需要接入 GitHub 登录认证服务。';
    const instructions = document.createElement('p');
    const link = document.createElement('a');
    link.href = 'https://github.com/Eclipsar1002/Eclipsar1002.github.io/blob/main/instruction/admin-setup.md';
    link.textContent = '查看一次性接入步骤 ↗';
    link.target = '_blank';
    link.rel = 'noreferrer';
    instructions.append(link);
    status.append(instructions);
    return;
  }
  const authUrl = new URL(settings.authBaseUrl);
  if (authUrl.protocol !== 'https:') throw new Error('登录认证服务必须使用 HTTPS');
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/decap-cms@3.17.3/dist/decap-cms.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('编辑器加载失败，请检查网络后刷新'));
    document.head.append(script);
  });
  window.CMS.init({ config: { backend: { base_url: authUrl.origin } } });
  status.hidden = true;
}

boot().catch((error) => {
  status.hidden = false;
  message.textContent = error.message || '后台加载失败，请刷新重试。';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = '重新加载';
  retry.addEventListener('click', () => location.reload());
  status.append(retry);
});
