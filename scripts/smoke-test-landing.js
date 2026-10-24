// End-to-end smoke test for the landing content and analytics endpoints, against a RUNNING server with seeded content.
// Usage:  npm run seed && npm run dev      (in one terminal)
//         npm run test:smoke:landing       (in another)
// Env:    BASE_URL (default http://localhost:5000), ADMIN_SECRET and MONGO_URI (read from .env)
// Everything the test creates is deleted again; settings it changes are restored. Analytics events can't be
// deleted through the API, so the test tags them with pagePath "/__smoke__" and removes them through MONGO_URI
// (which must point at the same database as the server under test).
import 'dotenv/config';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

const SMOKE_PATH = '/__smoke__';

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
const API = `${BASE_URL}/api/v1`;
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
  return { status: res.status, headers: res.headers, body: json };
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

const keys = (obj) => Object.keys(obj).sort();

async function run() {
  console.log(`Smoke testing ${API} (landing + analytics)\n`);
  const unique = `smoke-${Date.now()}`;
  let landing;
  let serviceId;
  let reportId;
  let originalContact;

  await test('GET /landing-data returns every section with cache headers', async () => {
    const { status, headers, body } = await call('GET', `${API}/landing-data`);
    assert.equal(status, 200);
    assert.match(headers.get('cache-control'), /max-age=60/);
    assert.ok(headers.get('etag'));
    landing = body.data;
    for (const section of ['contact', 'whatsappMessages', 'stats', 'home', 'about', 'footerMedia', 'services', 'plans', 'showcase', 'testimonials']) {
      assert.ok(section in landing, `missing section ${section}`);
    }
    assert.ok(landing.services.length > 0, 'no services — run npm run seed first');
    assert.ok(!('branches' in landing), 'branches were removed (the academy is online)');
    assert.ok(landing.whatsappMessages.trialInquiry, 'trialInquiry message present');
  });

  await test('Public items carry exactly the frontend keys (no admin fields)', async () => {
    assert.deepEqual(keys(landing.services[0]), ['badge', 'description', 'featured', 'icon', 'id', 'link', 'title']);
    assert.deepEqual(keys(landing.testimonials[0]), ['id', 'image', 'role']);
    assert.deepEqual(keys(landing.plans[0].price).filter((k) => !['before', 'suffix'].includes(k)), ['after', 'value']);
    const [reports, recitations, certificates] = landing.showcase.tabs;
    assert.deepEqual(keys(reports.items[0]), ['caption', 'fields', 'icon', 'id', 'image', 'note', 'period', 'title']);
    assert.deepEqual(keys(recitations.items[0]), ['audio', 'caption', 'id', 'title']);
    assert.deepEqual(keys(certificates.items[0]), ['caption', 'id', 'image', 'title']);
    assert.ok(Array.isArray(reports.items[0].fields[0]) && reports.items[0].fields[0].length === 2, 'fields must be [label, value] pairs');
  });

  await test('GET /showcase?tab=bogus → 400', async () => {
    const { status } = await call('GET', `${API}/showcase?tab=bogus`);
    assert.equal(status, 400);
  });

  await test('GET /services?includeInactive=true without admin → 401', async () => {
    const { status } = await call('GET', `${API}/services?includeInactive=true`);
    assert.equal(status, 401);
  });

  await test('POST /services rejects an unknown icon name format → 400', async () => {
    const { status, body } = await call('POST', `${API}/services`, {
      headers: ADMIN,
      body: { icon: 'book', badge: 'b', title: 't', description: 'd', link: 'l' },
    });
    assert.equal(status, 400);
    assert.ok(body.details.some((d) => d.field === 'icon'));
  });

  await test('POST /services creates an item that appears in /landing-data immediately (cache invalidated)', async () => {
    const { status, body } = await call('POST', `${API}/services`, {
      headers: ADMIN,
      body: { icon: 'faStar', badge: 'تجربة', title: `خدمة ${unique}`, description: 'وصف', link: 'رابط', order: 999 },
    });
    assert.equal(status, 201);
    serviceId = body.data.id;
    const after = await call('GET', `${API}/landing-data`);
    assert.equal(after.body.data.services.at(-1).id, serviceId);
  });

  await test('PATCH /services/:id isActive=false hides it from the public list', async () => {
    const { status } = await call('PATCH', `${API}/services/${serviceId}`, { headers: ADMIN, body: { isActive: false } });
    assert.equal(status, 200);
    const pub = await call('GET', `${API}/services`);
    assert.ok(!pub.body.data.some((s) => s.id === serviceId));
    const admin = await call('GET', `${API}/services?includeInactive=true`, { headers: ADMIN });
    assert.ok(admin.body.data.some((s) => s.id === serviceId));
  });

  await test('POST /showcase report without fields or image → 400 (per-tab validation)', async () => {
    const { status, body } = await call('POST', `${API}/showcase`, {
      headers: ADMIN,
      body: { tab: 'reports', title: 't', caption: 'c', icon: 'faStar', period: 'p', note: 'n' },
    });
    assert.equal(status, 400);
    assert.ok(body.details.some((d) => d.field === 'fields'));
  });

  await test('POST /showcase report with malformed fields → 400; valid → 201; PATCH runs tab rules', async () => {
    const base = { tab: 'reports', title: `تقرير ${unique}`, caption: 'c', icon: 'faStar', period: 'p', note: 'n' };
    const bad = await call('POST', `${API}/showcase`, { headers: ADMIN, body: { ...base, fields: [['only label']] } });
    assert.equal(bad.status, 400);
    const ok = await call('POST', `${API}/showcase`, { headers: ADMIN, body: { ...base, fields: [['الحفظ', 'سورة الملك']] } });
    assert.equal(ok.status, 201);
    reportId = ok.body.data.id;
    const patch = await call('PATCH', `${API}/showcase/${reportId}`, { headers: ADMIN, body: { note: '' } });
    assert.equal(patch.status, 400);
  });

  await test('PATCH /settings deep-merges (changing whatsappNumber keeps email and socials)', async () => {
    const before = await call('GET', `${API}/settings`);
    originalContact = before.body.data.contact;
    await call('PATCH', `${API}/settings`, { headers: ADMIN, body: { contact: { email: 'info@example.com' } } });
    const { status, body } = await call('PATCH', `${API}/settings`, {
      headers: ADMIN,
      body: { contact: { whatsappNumber: '+20 100 123 4567' } },
    });
    assert.equal(status, 200);
    assert.equal(body.data.contact.whatsappNumber, '201001234567');
    assert.equal(body.data.contact.email, 'info@example.com');
  });

  await test('PATCH /settings without admin → 401; with no known section → 400', async () => {
    assert.equal((await call('PATCH', `${API}/settings`, { body: { contact: {} } })).status, 401);
    assert.equal((await call('PATCH', `${API}/settings`, { headers: ADMIN, body: { nope: 1 } })).status, 400);
  });

  const event = (body, contentType = 'application/json') =>
    fetch(`${API}/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body: JSON.stringify(body),
    }).then(async (res) => ({ status: res.status, body: await res.json().catch(() => null) }));
  const summary = async () => (await call('GET', `${API}/analytics/summary`, { headers: ADMIN })).body.data;
  let before;

  await test('GET /analytics/summary requires admin → 401 / 403', async () => {
    assert.equal((await call('GET', `${API}/analytics/summary`)).status, 401);
    assert.equal((await call('GET', `${API}/analytics/summary`, { headers: { 'x-admin-secret': 'wrong-secret' } })).status, 403);
    before = await summary();
    assert.equal(typeof before.totals.pageViews, 'number');
  });

  await test('POST /analytics/events rejects unknown eventType, extra fields and non-path pagePath → 400', async () => {
    assert.equal((await event({ eventType: 'purchase', pagePath: SMOKE_PATH })).status, 400);
    const extra = await event({ eventType: 'page_view', pagePath: SMOKE_PATH, name: 'أحمد', phone: '201112223333' });
    assert.equal(extra.status, 400, 'personal fields must be rejected');
    assert.equal((await event({ eventType: 'page_view', pagePath: 'https://evil.example/?a=1' })).status, 400);
    const missing = await event({ eventType: 'service_whatsapp_click', pagePath: SMOKE_PATH });
    assert.equal(missing.status, 400);
    assert.deepEqual(missing.body.details.map((d) => d.field).sort(), ['serviceId', 'serviceType']);
  });

  await test('Click on an unknown service id → 404 (counts only attach to real items)', async () => {
    const { status } = await event({
      eventType: 'service_whatsapp_click',
      serviceType: 'service',
      serviceId: '000000000000000000000000',
      pagePath: SMOKE_PATH,
    });
    assert.equal(status, 404);
  });

  await test('page_view sent as text/plain (navigator.sendBeacon format) → 201 and counted', async () => {
    const { status } = await event({ eventType: 'page_view', pagePath: SMOKE_PATH }, 'text/plain;charset=UTF-8');
    assert.equal(status, 201);
    assert.equal((await summary()).totals.pageViews, before.totals.pageViews + 1);
  });

  await test('WhatsApp clicks are counted per service / plan with the DB name, sorted by clicks (desc)', async () => {
    const service = landing.services[0];
    const plan = landing.plans[1];
    const click = (serviceType, serviceId) =>
      event({ eventType: 'service_whatsapp_click', serviceType, serviceId, pagePath: SMOKE_PATH });
    for (const [type, id] of [['service', service.id], ['service', service.id], ['plan', plan.id]]) {
      assert.equal((await click(type, id)).status, 201);
    }

    const after = await summary();
    assert.equal(after.totals.whatsappClicks, before.totals.whatsappClicks + 3);
    const countOf = (data, id) => data.services.find((s) => s.serviceId === id)?.clicks ?? 0;
    assert.equal(countOf(after, service.id), countOf(before, service.id) + 2);
    assert.equal(countOf(after, plan.id), countOf(before, plan.id) + 1);
    assert.equal(after.services.find((s) => s.serviceId === service.id).serviceName, service.title);
    assert.equal(after.services.find((s) => s.serviceId === plan.id).serviceName, plan.label);
    for (let i = 1; i < after.services.length; i += 1) {
      assert.ok(after.services[i - 1].clicks >= after.services[i].clicks, 'services must be sorted by clicks, desc');
    }
  });

  await test('General WhatsApp clicks: unknown placement → 400; valid → counted per placement, separate from services', async () => {
    const before = await summary();
    assert.equal((await event({ eventType: 'general_whatsapp_click', placement: 'navbar', pagePath: SMOKE_PATH })).status, 400);
    const extra = await event({ eventType: 'general_whatsapp_click', placement: 'whyUs', serviceId: landing.services[0].id, pagePath: SMOKE_PATH });
    assert.equal(extra.status, 400, 'no service fields on a general click');
    assert.equal((await event({ eventType: 'general_whatsapp_click', placement: 'whyUs', pagePath: SMOKE_PATH })).status, 201);
    const after = await summary();
    const count = (s) => s.generalButtons.find((b) => b.placement === 'whyUs')?.clicks ?? 0;
    assert.equal(count(after), count(before) + 1);
    assert.equal(after.totals.generalWhatsappClicks, before.totals.generalWhatsappClicks + 1);
    assert.equal(after.totals.serviceWhatsappClicks, before.totals.serviceWhatsappClicks, 'services untouched');
    assert.equal(after.totals.whatsappClicks, after.totals.serviceWhatsappClicks + after.totals.generalWhatsappClicks);
    assert.ok(!after.services.some((s) => s.placement), 'general clicks are not in the services table');
  });

  await test('Old /leads endpoints are gone → 404', async () => {
    assert.equal((await call('POST', `${API}/leads/trial-booking`, { body: { source: 'footer' } })).status, 404);
  });

  // Cleanup
  await test('Cleanup: delete created items, restore contact settings, remove smoke-test events', async () => {
    for (const url of [`${API}/services/${serviceId}`, `${API}/showcase/${reportId}`]) {
      if (url.endsWith('undefined')) continue;
      assert.equal((await call('DELETE', url, { headers: ADMIN })).status, 200);
    }
    if (originalContact) {
      const { status } = await call('PATCH', `${API}/settings`, { headers: ADMIN, body: { contact: originalContact } });
      assert.equal(status, 200);
    }
    if (!process.env.MONGO_URI) {
      console.log(`      (MONGO_URI not set: events with pagePath ${SMOKE_PATH} were left in the database)`);
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    const { deletedCount } = await mongoose.connection.collection('analyticsevents').deleteMany({ pagePath: SMOKE_PATH });
    await mongoose.disconnect();
    assert.equal(deletedCount, 5, `expected to remove the 5 stored smoke-test events (1 view + 3 service clicks + 1 general click; rejected ones are never stored), removed ${deletedCount}`);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error(`Could not reach ${BASE_URL} — is the server running?\n`, err.message);
  process.exit(1);
});
