const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync('src/lib/event-datetime.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = { exports: {} };
new Function('exports', 'module', compiled)(loaded.exports, loaded);
const { parseEventDateTime } = loaded.exports;

test('Toshkent event time stays the same on UTC and other server time zones', () => {
  const original = process.env.TZ;
  try {
    for (const zone of ['UTC', 'Asia/Tashkent', 'America/New_York', 'Asia/Tokyo']) {
      process.env.TZ = zone;
      assert.equal(parseEventDateTime('2027-05-25T20:00').toISOString(), '2027-05-25T15:00:00.000Z');
      assert.equal(parseEventDateTime('2027-01-01T01:00').toISOString(), '2026-12-31T20:00:00.000Z');
    }
  } finally { if (original === undefined) delete process.env.TZ; else process.env.TZ = original; }
});
test('Invalid calendar dates and ambiguous timezone input are rejected', () => {
  for (const value of ['', 'invalid', '2027-02-30T20:00', '2027-05-25T25:00', '2027-05-25T20:00Z', '2027-05-25']) assert.equal(parseEventDateTime(value), null);
  assert.ok(parseEventDateTime('2028-02-29T20:00'));
});
