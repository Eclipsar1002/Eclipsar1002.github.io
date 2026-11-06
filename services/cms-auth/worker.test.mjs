import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';

const env = {
  SITE_ORIGIN: 'https://eclipsar1002.github.io',
  GITHUB_USER: 'Eclipsar1002',
  GITHUB_CLIENT_ID: 'test-client',
  GITHUB_CLIENT_SECRET: 'test-secret',
};
const origin = 'https://cms.example.workers.dev';

test('login binds state to an HttpOnly cookie and uses the registered callback', async () => {
  const response = await worker.fetch(new Request(`${origin}/auth?provider=github`), env);
  assert.equal(response.status, 302);
  const url = new URL(response.headers.get('Location'));
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.searchParams.get('redirect_uri'), `${origin}/callback`);
  const state = url.searchParams.get('state');
  assert.ok(state);
  assert.match(response.headers.get('Set-Cookie'), new RegExp(state));
  assert.match(response.headers.get('Set-Cookie'), /HttpOnly; Secure; SameSite=Lax/);
});

test('callback rejects forged state before contacting GitHub', async () => {
  const originalFetch = globalThis.fetch;
  let contacted = false;
  globalThis.fetch = async () => { contacted = true; throw new Error('unexpected network'); };
  try {
    const response = await worker.fetch(new Request(`${origin}/callback?code=example&state=forged`, {
      headers: { Cookie: '__Host-cms_oauth_state=real' },
    }), env);
    assert.equal(response.status, 400);
    assert.equal(contacted, false);
    assert.match(response.headers.get('Set-Cookie'), /Max-Age=0/);
  } finally { globalThis.fetch = originalFetch; }
});

test('only the configured GitHub account receives a token, and messages target the site origin', async () => {
  const originalFetch = globalThis.fetch;
  let login = 'some-other-account';
  globalThis.fetch = async (url) => String(url).includes('/access_token')
    ? Response.json({ access_token: 'test-token' })
    : Response.json({ login });
  const request = () => new Request(`${origin}/callback?code=example&state=real`, {
    headers: { Cookie: '__Host-cms_oauth_state=real' },
  });
  try {
    const denied = await worker.fetch(request(), env);
    assert.equal(denied.status, 403);
    assert.ok(!(await denied.text()).includes('test-token'));
    login = 'Eclipsar1002';
    const allowed = await worker.fetch(request(), env);
    assert.equal(allowed.status, 200);
    const html = await allowed.text();
    assert.ok(html.includes('test-token'));
    assert.ok(html.includes('https://eclipsar1002.github.io'));
    assert.ok(html.includes('event.source !== window.opener'));
    assert.ok(html.includes('event.origin !== origin'));
    assert.match(allowed.headers.get('Content-Security-Policy'), /script-src 'nonce-/);
  } finally { globalThis.fetch = originalFetch; }
});
