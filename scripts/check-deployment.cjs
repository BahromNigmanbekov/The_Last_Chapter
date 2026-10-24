const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SESSION_SECRET', 'ADMIN_PASSWORD'];
const errors = [];
for (const name of required) {
  const value = process.env[name];
  if (!value?.trim() || /YOUR_PROJECT|your-publishable|your-secret|replace-with-/i.test(value)) errors.push(`${name}: haqiqiy qiymat kiritilmagan`);
  else if (value !== value.trim()) errors.push(`${name}: boshida yoki oxirida ortiqcha bo‘sh joy bor`);
}
try {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error();
} catch { errors.push('NEXT_PUBLIC_SUPABASE_URL: to‘g‘ri HTTPS loyiha manzili kerak'); }
if ((process.env.SESSION_SECRET || '').length < 32) errors.push('SESSION_SECRET: kamida 32 belgi kerak');
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
let publicRole;
try { publicRole = JSON.parse(Buffer.from(publicKey.split('.')[1], 'base64url').toString()).role; } catch {}
if (publicKey.startsWith('sb_secret_') || publicRole === 'service_role' || publicKey === process.env.SUPABASE_SERVICE_ROLE_KEY) errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY: bu yerda faqat publishable/anon kalit bo‘lishi mumkin');
if (errors.length) {
  console.error('Deploy sozlamalarida xatolik:\n' + errors.map(value => `- ${value}`).join('\n'));
  process.exit(1);
}
console.log('Deploy environment: barcha 5 sozlama tekshirildi (qiymatlar yashirilgan).');

if (process.argv.includes('--remote')) {
  const { createClient } = require('@supabase/supabase-js');
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, publicKey, options);
  (async () => {
    const checks = [
      anon.from('events').select('id').eq('slug', 'main').single(),
      admin.from('students').select('id,registration_code,first_name_key,last_name_key,class_key').limit(0),
      ...['tickets', 'payments', 'login_attempts', 'memories', 'movies', 'movie_votes', 'music_requests'].map(table => admin.from(table).select('id').limit(0)),
      admin.storage.getBucket('memories'),
    ];
    const results = await Promise.all(checks);
    if (results.some(result => result.error)) throw new Error('Database tekshiruvi o‘tmadi: URL/kalitlar, 0001/0002 migratsiyalar va seedni tekshiring.');
    const bucket = results.at(-1).data;
    if (bucket.public || Number(bucket.file_size_limit) < 52428800) throw new Error('Memories bucket private va kamida 50 MB bo‘lishi kerak.');
    console.log('Supabase: public event, kabinet jadvallari va private 50 MB media bucket tekshirildi. Hech qanday ma’lumot o‘zgartirilmadi.');
  })().catch(error => { console.error(error.message); process.exitCode = 1; });
}
