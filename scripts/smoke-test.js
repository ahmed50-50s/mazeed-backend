// End-to-end smoke test against a RUNNING server. No extra dependencies (uses Node's built-in fetch + assert).
// Usage:  npm run dev            (in one terminal)
//         npm run test:smoke     (in another)
// Env:    BASE_URL (default http://localhost:5000), ADMIN_SECRET (read from .env)
import 'dotenv/config';
import assert from 'node:assert/strict';

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
const API = `${BASE_URL}/api/v1/centers`;
const ADMIN = { 'x-admin-secret': process.env.ADMIN_SECRET };
const JSON_HEADERS = { 'Content-Type': 'application/json' };

let passed = 0;
let failed = 0;

async function call(method, url, { body, headers = {} } = {}) {
  const res = await fetch(url, {
    method,
    headers: { ...(body && JSON_HEADERS), ...headers },
    body: body && JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✔ ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`  ✘ ${name}\n      ${err.message.split('\n').join('\n      ')}`);
  }
}

async function run() {
  console.log(`Smoke testing ${API}\n`);
  const unique = `اختبار-${Date.now()}`;
  let id;

  await test('GET /health returns ok with DB connected', async () => {
    const { status, body } = await call('GET', `${BASE_URL}/health`);
    assert.equal(status, 200);
    assert.equal(body.db, 'connected');
  });

  await test('POST /centers without admin secret → 401', async () => {
    const { status } = await call('POST', API, { body: { name: 'x' } });
    assert.equal(status, 401);
  });

  await test('POST /centers with wrong admin secret → 403', async () => {
    const { status } = await call('POST', API, { body: { name: 'x' }, headers: { 'x-admin-secret': 'wrong-secret' } });
    assert.equal(status, 403);
  });

  await test('POST /centers with missing fields → 400 with field details (address/region are optional)', async () => {
    const { status, body } = await call('POST', API, { body: { name: 'ناقص' }, headers: ADMIN });
    assert.equal(status, 400);
    const fields = body.details.map((d) => d.field).sort();
    assert.deepEqual(fields, ['whatsappNumber']);
  });

  await test('POST /centers with invalid WhatsApp number → 400', async () => {
    const { status } = await call('POST', API, {
      body: { name: 'a', address: 'b', region: 'c', whatsappNumber: '0100' },
      headers: ADMIN,
    });
    assert.equal(status, 400);
  });

  await test('POST /centers creates a center, normalizes number, ignores click counters', async () => {
    const { status, body } = await call('POST', API, {
      headers: ADMIN,
      body: {
        name: `دار الإخلاص ${unique}`,
        address: 'شارع التحرير',
        region: `منطقة-${unique}`,
        whatsappNumber: '+20 100 123 4567',
        details: 'حلقات للأطفال',
        cardClicks: 9999,
      },
    });
    assert.equal(status, 201);
    assert.equal(body.data.whatsappNumber, '201001234567');
    assert.equal(body.data.whatsappLink, 'https://wa.me/201001234567');
    assert.equal(body.data.cardClicks, 0);
    assert.equal(body.data.whatsappClicks, 0);
    assert.ok(body.data.createdAt);
    id = body.data.id;
  });

  await test('GET /centers lists centers with pagination', async () => {
    const { status, body } = await call('GET', `${API}?limit=5`);
    assert.equal(status, 200);
    assert.ok(Array.isArray(body.data));
    assert.equal(body.pagination.limit, 5);
    assert.ok(body.pagination.total >= 1);
  });

  await test('GET /centers?region= filters by exact region', async () => {
    const { body } = await call('GET', `${API}?region=${encodeURIComponent(`منطقة-${unique}`)}`);
    assert.equal(body.count, 1);
    assert.equal(body.data[0].id, id);
  });

  await test('GET /centers?search= matches Arabic spelling variants (الاخلاص → الإخلاص)', async () => {
    const { body } = await call('GET', `${API}?search=${encodeURIComponent(`الاخلاص ${unique}`)}`);
    assert.equal(body.count, 1);
  });

  await test('GET /centers/regions includes the new region', async () => {
    const { body } = await call('GET', `${API}/regions`);
    assert.ok(body.data.includes(`منطقة-${unique}`));
  });

  await test('GET /centers/:id returns center and increments cardClicks', async () => {
    const { status, body } = await call('GET', `${API}/${id}`);
    assert.equal(status, 200);
    assert.equal(body.data.cardClicks, 1);
  });

  await test('GET /centers/:id?track=false does NOT increment cardClicks', async () => {
    const { body } = await call('GET', `${API}/${id}?track=false`);
    assert.equal(body.data.cardClicks, 1);
  });

  await test('POST /centers/:id/card-click increments cardClicks', async () => {
    const { status, body } = await call('POST', `${API}/${id}/card-click`);
    assert.equal(status, 200);
    assert.equal(body.data.cardClicks, 2);
  });

  await test('POST /centers/:id/whatsapp-click increments whatsappClicks', async () => {
    const { status, body } = await call('POST', `${API}/${id}/whatsapp-click`);
    assert.equal(status, 200);
    assert.equal(body.data.whatsappClicks, 1);
  });

  await test('GET /centers/:id with malformed id → 400', async () => {
    const { status } = await call('GET', `${API}/not-an-id`);
    assert.equal(status, 400);
  });

  await test('GET /centers/:id with unknown id → 404', async () => {
    const { status } = await call('GET', `${API}/000000000000000000000000`);
    assert.equal(status, 404);
  });

  await test('PATCH /centers/:id without admin secret → 401', async () => {
    const { status } = await call('PATCH', `${API}/${id}`, { body: { details: 'x' } });
    assert.equal(status, 401);
  });

  await test('PATCH /centers/:id with empty body → 400', async () => {
    const { status } = await call('PATCH', `${API}/${id}`, { body: {}, headers: ADMIN });
    assert.equal(status, 400);
  });

  await test('PATCH /centers/:id updates only the sent fields', async () => {
    const { status, body } = await call('PATCH', `${API}/${id}`, {
      headers: ADMIN,
      body: { details: 'تم التحديث', whatsappClicks: 5000 },
    });
    assert.equal(status, 200);
    assert.equal(body.data.details, 'تم التحديث');
    assert.equal(body.data.name, `دار الإخلاص ${unique}`);
    assert.equal(body.data.whatsappClicks, 1, 'counters must not be writable');
  });

  await test('PATCH /centers/:id runs validators (bad number → 400)', async () => {
    const { status } = await call('PATCH', `${API}/${id}`, { headers: ADMIN, body: { whatsappNumber: 'abc' } });
    assert.equal(status, 400);
  });

  await test('DELETE /centers/:id without admin secret → 401', async () => {
    const { status } = await call('DELETE', `${API}/${id}`);
    assert.equal(status, 401);
  });

  await test('DELETE /centers/:id deletes the center', async () => {
    const { status } = await call('DELETE', `${API}/${id}`, { headers: ADMIN });
    assert.equal(status, 200);
    const after = await call('GET', `${API}/${id}`);
    assert.equal(after.status, 404);
  });

  await test('Unknown route → 404 JSON', async () => {
    const { status, body } = await call('GET', `${BASE_URL}/api/v1/nope`);
    assert.equal(status, 404);
    assert.equal(body.success, false);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error(`Could not reach ${BASE_URL} — is the server running?\n`, err.message);
  process.exit(1);
});
