const cookieName = '__Host-cms_oauth_state';
const secureHeaders = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};

function cookie(state, maxAge = 600) {
  return `${cookieName}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function popup(env, type, payload, status = 200) {
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const origin = new URL(env.SITE_ORIGIN).origin;
  const text = type === 'success' ? '登录成功，请返回写作后台。' : '登录未完成，请关闭此窗口并重试。';
  const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>GitHub 登录</title>
<body><p>${text}</p><script nonce="${nonce}">
const origin = ${jsonForScript(origin)};
const result = ${jsonForScript(`authorization:github:${type}:${JSON.stringify(payload)}`)};
if (window.opener) {
  window.addEventListener('message', function receive(event) {
    if (event.source !== window.opener || event.origin !== origin || event.data !== 'authorizing:github') return;
    window.opener.postMessage(result, origin);
    window.removeEventListener('message', receive);
    window.close();
  });
  window.opener.postMessage('authorizing:github', origin);
}
</script></body></html>`;
  return new Response(html, { status, headers: {
    ...secureHeaders,
    'Set-Cookie': cookie('', 0),
    'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'`,
  } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET' } });
    if (url.pathname === '/health') return Response.json({ ok: true });
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.SITE_ORIGIN || !env.GITHUB_USER) {
      return new Response('GitHub login is not configured.', { status: 503 });
    }
    if (url.pathname === '/auth') {
      if (url.searchParams.get('provider') !== 'github') return new Response('Unsupported provider', { status: 400 });
      const state = crypto.randomUUID();
      const github = new URL('https://github.com/login/oauth/authorize');
      github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      github.searchParams.set('redirect_uri', `${url.origin}/callback`);
      github.searchParams.set('scope', 'public_repo');
      github.searchParams.set('state', state);
      return new Response(null, { status: 302, headers: {
        Location: github.href, 'Set-Cookie': cookie(state), 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
      } });
    }
    if (url.pathname === '/callback') {
      const state = url.searchParams.get('state');
      const savedState = request.headers.get('Cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
      if (!state || !savedState || state !== savedState || !url.searchParams.get('code')) {
        return popup(env, 'error', { message: 'Invalid or expired login request.' }, 400);
      }
      try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code: url.searchParams.get('code'),
            redirect_uri: `${url.origin}/callback`,
          }),
        });
        const auth = await response.json();
        if (!response.ok || !auth.access_token) return popup(env, 'error', { message: 'GitHub authorization failed.' }, 401);
        const userResponse = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${auth.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Eclipsar-CMS' },
        });
        const user = await userResponse.json();
        if (!userResponse.ok || user.login?.toLowerCase() !== env.GITHUB_USER.toLowerCase()) {
          return popup(env, 'error', { message: 'This account cannot manage this website.' }, 403);
        }
        return popup(env, 'success', { token: auth.access_token, provider: 'github' });
      } catch {
        return popup(env, 'error', { message: 'Unable to reach GitHub. Please try again.' }, 502);
      }
    }
    return new Response('Not found', { status: 404 });
  },
};
