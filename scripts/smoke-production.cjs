const assert = require('node:assert/strict');
const base = process.env.SMOKE_BASE_URL || 'http://localhost:3002';
(async () => {
  for (const [path, status, target] of [['/', 200], ['/register', 200], ['/admin/login', 200], ['/dashboard', 307, '/register'], ['/ticket', 307, '/register'], ['/memories', 307, '/register'], ['/admin', 307, '/admin/login'], ['/admin/settings', 307, '/admin/login']]) {
    const response = await fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, status, path);
    if (target) assert.equal(new URL(response.headers.get('location'), base).pathname, target);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    console.log(`${path}: passed`);
  }
})().catch(() => { console.error('Production sahifa/redirect/header tekshiruvi o‘tmadi.'); process.exitCode = 1; });
