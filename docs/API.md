# Quran Centers API — Frontend Contract

**Base URL (local):** `http://localhost:5000/api/v1`
**Content type:** JSON in and out (`Content-Type: application/json` on requests with a body).
**IDs:** every document has an `id` string (24 hex chars). Use it in URLs.

> **Landing content and analytics** (`/landing-data`, `/settings`, `/services`, `/pricing-plans`, `/showcase`, `/testimonials`, `/analytics`) are documented in [section 6](#6-landing-content) onward. Sections 2–5 cover centers.

---

## 1. Endpoint summary

### Centers

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 1 | GET | `/centers` | Public | List centers (filter, search, paginate, sort) |
| 2 | GET | `/centers/regions` | Public | Distinct region names (for a filter dropdown) |
| 3 | GET | `/centers/:id` | Public | One center. **Counts +1 card view** unless `?track=false` |
| 4 | POST | `/centers/:id/card-click` | Public | Count +1 card view |
| 5 | POST | `/centers/:id/whatsapp-click` | Public | Count +1 WhatsApp click |
| 6 | POST | `/centers` | **Admin** | Create a center |
| 7 | PATCH | `/centers/:id` | **Admin** | Update some fields of a center |
| 8 | DELETE | `/centers/:id` | **Admin** | Delete a center |

### Landing content

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 9 | GET | `/landing-data` | Public | **Everything the home + about pages render, in one request** (cached 60 s) |
| 10 | GET | `/settings` | Public | Site-wide settings document |
| 11 | PATCH | `/settings` | **Admin** | Deep-merge update of settings |
| 12 | GET | `/services` · `/pricing-plans` · `/testimonials` · `/showcase?tab=` | Public* | Active items in display order. *`?includeInactive=true` is admin only |
| 13 | POST | same paths | **Admin** | Create an item |
| 14 | PATCH | `…/:id` | **Admin** | Update some fields of an item |
| 15 | DELETE | `…/:id` | **Admin** | Delete an item |

### Analytics

| # | Method | Path | Auth | Purpose |
|---|--------|------|------|---------|
| 16 | POST | `/analytics/events` | Public | Record an anonymous `page_view` or `service_whatsapp_click` |
| 17 | GET | `/analytics/summary` | **Admin** | Total page views, total WhatsApp clicks, clicks per service/plan |

**Admin auth:** send the header `x-admin-secret: <secret>`. Only use this in the admin panel. **Never** put the secret in the public website bundle.

---

## 2. The Center object

```json
{
  "id": "6ad8ac81ff1566e4ba3a34a0",
  "name": "دار الإخلاص لتحفيظ القرآن",
  "address": "شارع التحرير، بجوار مسجد النور",
  "region": "القاهرة",
  "whatsappNumber": "201001234567",
  "whatsappLink": "https://wa.me/201001234567",
  "details": "حلقات للأطفال والكبار",
  "cardClicks": 12,
  "whatsappClicks": 4,
  "createdAt": "2026-10-21T12:13:54.009Z",
  "updatedAt": "2026-10-21T12:13:54.009Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | MongoDB ObjectId |
| `name` | string | required, max 150 chars |
| `address` | string | optional, max 300 chars (the academy is online, so a center may have no address) |
| `region` | string | optional, max 100 chars (city or area). Centers without one are left out of `/centers/regions` |
| `whatsappNumber` | string | required. Always returned as digits with country code, without `+` (e.g. `201001234567`) |
| `whatsappLink` | string | read-only, ready to use as `href` (`https://wa.me/...`) |
| `details` | string | optional, max 5000 chars, defaults to `""` |
| `cardClicks` | number | read-only analytics counter |
| `whatsappClicks` | number | read-only analytics counter |
| `createdAt` / `updatedAt` | ISO date string | set automatically |

---

## 3. Endpoints in detail

### 3.1 `GET /centers` — list centers

**Query params (all optional):**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `region` | string | — | Matches the whole region name, case-insensitive. Use values from `/centers/regions`. |
| `search` | string | — | Text search across `name`, `address`, `region`, `details`. Ignores أ/إ/آ vs ا, ة vs ه, ى vs ي, and tashkeel. |
| `page` | integer ≥ 1 | `1` | Page number |
| `limit` | integer 1–100 | `20` | Page size (values above 100 are reduced to 100) |
| `sort` | enum | `newest` | `newest`, `oldest`, `name`, `popular` (most card views), `whatsapp` (most WhatsApp clicks) |

**Example:** `GET /centers?region=القاهرة&search=تحفيظ&page=1&limit=10`

**200 response:**
```json
{
  "success": true,
  "count": 1,
  "pagination": { "total": 3, "page": 1, "limit": 10, "pages": 1 },
  "data": [ /* Center objects */ ]
}
```

> In JavaScript, wrap query values in `encodeURIComponent()` so Arabic text is sent correctly. `URLSearchParams` does this for you.

### 3.2 `GET /centers/regions` — region list

**200:**
```json
{ "success": true, "count": 3, "data": ["الإسكندرية", "القاهرة", "المنصورة"] }
```

### 3.3 `GET /centers/:id` — one center

| Query param | Description |
|-------------|-------------|
| `track=false` | Fetch **without** counting a card view (for admin screens, refetching, SSR or prefetch) |

**200:** `{ "success": true, "data": { /* Center */ } }` — `cardClicks` in the response already includes this view.
**400:** the id is not a valid ObjectId · **404:** center not found

### 3.4 `POST /centers/:id/card-click` — count a card view

No body. **200:**
```json
{ "success": true, "data": { "id": "6ad8...", "cardClicks": 13 } }
```

### 3.5 `POST /centers/:id/whatsapp-click` — count a WhatsApp click

No body. **200:**
```json
{ "success": true, "data": { "id": "6ad8...", "whatsappClicks": 5 } }
```

> ⚠️ **Avoid counting a view twice.** `GET /centers/:id` already counts a card view. Pick **one** approach:
> - **A (recommended):** the details page calls `GET /centers/:id` → counted automatically.
> - **B:** the card opens a modal using data from the list → call `POST /centers/:id/card-click` once when it opens.
>
> Never call `GET /centers/:id` **and** `card-click` for the same view. If you need to refetch, use `?track=false`.

**Recommended WhatsApp button pattern** (sends the count without delaying navigation):
```js
function onWhatsappClick(center) {
  fetch(`${API}/centers/${center.id}/whatsapp-click`, { method: 'POST', keepalive: true }).catch(() => {});
  window.open(center.whatsappLink, '_blank', 'noopener');
}
```

### 3.6 `POST /centers` — create (admin)

**Headers:** `x-admin-secret`, `Content-Type: application/json`
**Body:**
```json
{
  "name": "دار الإخلاص",          // required
  "address": "شارع التحرير",       // optional
  "region": "القاهرة",             // optional
  "whatsappNumber": "+20 100 123 4567", // required, include the country code
  "details": "..."                // optional
}
```
`whatsappNumber` accepts `+20 100 123 4567`, `00201001234567`, `20-100-123-4567`, etc., and is stored as `201001234567`. Local numbers without a country code (e.g. `01001234567`) are **rejected**.
`cardClicks` and `whatsappClicks` are ignored if you send them.

**201:** `{ "success": true, "data": { /* Center */ } }`

### 3.7 `PATCH /centers/:id` — update (admin)

Send **only the fields you want to change** (any of `name`, `address`, `region`, `whatsappNumber`, `details`). The same validation rules apply.
```json
{ "details": "تمت إضافة حلقات مسائية" }
```
**200:** `{ "success": true, "data": { /* updated Center */ } }`
**400:** empty body or invalid values · **404:** not found

### 3.8 `DELETE /centers/:id` — delete (admin)

**200:**
```json
{ "success": true, "message": "Center deleted", "data": { "id": "6ad8..." } }
```

---

## 4. Errors

Every error has the same shape:
```json
{
  "success": false,
  "message": "Validation failed",
  "details": [ { "field": "whatsappNumber", "message": "whatsappNumber must be in international format with country code, e.g. 201001234567" } ]
}
```
`details` is only present on validation errors and lists one entry per invalid field, so you can show each message next to its form input.

| Status | Meaning |
|--------|---------|
| 400 | Invalid id, invalid or missing fields, malformed JSON |
| 401 | `x-admin-secret` header missing |
| 403 | `x-admin-secret` is wrong |
| 404 | Document or route not found |
| 429 | Rate limited: 500 req / 15 min per IP overall, 30 click / analytics events per minute per IP (shared) |
| 500 | Server error |

---

## 5. Health check

`GET /health` (no `/api/v1` prefix) → `{ "success": true, "status": "ok", "db": "connected" }`

---

## 6. Landing content

The Mazeed frontend used to hardcode its content in component files. Each array now lives in the database
with **the same keys the components read**, so the frontend swaps its constants for API data without changing JSX.

### 6.1 Conventions

- **Icons are strings**: the FontAwesome export name, e.g. `"faBookQuran"`. The frontend maps names to icon
  objects in `src/lib/icons.js`. A style prefix picks regular vs solid where the site uses both: `"far:faCalendarCheck"`.
  Validation: `^(fa[rsb]:)?fa[A-Z][A-Za-z0-9]*$`.
- **Media are URLs** (`image`, `audio`, `video`, `poster`): an absolute `http(s)` URL or a path starting with `/`.
  `null` means "not uploaded yet", and the frontend shows its built-in placeholder.
- **Ordering**: list items have `order` (ascending) and `isActive` (hidden when `false`). Both, plus
  `createdAt`/`updatedAt`, are **admin-only** and are stripped from public responses.

### 6.2 `GET /landing-data`

One request for everything the home and about pages render. Sent with
`Cache-Control: public, max-age=60, stale-while-revalidate=300` and an `ETag` (revalidation returns `304`).
The server also caches it in memory for 60 s, and every admin write clears that cache, so edits show up on the next request.

```jsonc
{
  "success": true,
  "data": {
    "contact": { "whatsappNumber": "201001234567", "email": "", "socialLinks": { "facebook": "", "instagram": "", "youtube": "", "telegram": "", "tiktok": "" } },
    "whatsappMessages": { "footer": "…", "contactInquiry": "…", "contactTrial": "…", "aboutTrial": "…" },
    "stats": [ { "icon": "faUsers", "value": 20, "label": "محفظ ومحفظة", "key": "teachers" } ],
    "home": {
      "aboutFeatures": ["…"],                                   // Home about.jsx  → features
      "whyUsFeatures": [ { "icon", "title", "description" } ],  // why-us.jsx      → features
      "contactPerks": ["…"]                                     // contact-cta.jsx → perks
    },
    "about": {
      "highlights": ["…"],                                      // intro.jsx    → highlights
      "cards": [ { "icon", "title", "text"?, "list"?, "featured"? } ], // vision.jsx → cards
      "values": [ { "icon", "title", "text" } ],                // values.jsx   → values
      "steps":  [ { "icon", "title", "text" } ],                // journey.jsx  → steps
      "teacherTags": ["…"], "teacherPhotos": ["teachers/1", "https://…"]  // teachers.jsx
    },
    "footerMedia": {
      "featuredVideo": { "title": "…", "video": null, "poster": null },
      "tracks": [ { "title": "سورة الفاتحة", "reciter": "طالب من البراعم", "audio": null } ]
    },
    "services": [ /* Service */ ],
    "plans": [ /* PricingPlan */ ],
    "showcase": { "tabs": [ { "id": "reports", "label": "…", "icon": "faFileLines", "items": [ /* ShowcaseItem */ ] } ] },
    "testimonials": [ /* Testimonial */ ],
    "updatedAt": "2026-10-22T12:00:00.000Z"
  }
}
```

### 6.3 Content objects

**Service**: `/services`, "خدماتنا وبرامجنا القرآنية" (#courses)

| Field | Type | Rules |
|-------|------|-------|
| `icon` | string | required, icon name |
| `badge` | string | required, ≤ 40 |
| `title` | string | required, ≤ 120 |
| `description` | string | required, ≤ 600 |
| `link` | string | required, ≤ 60. The card's CTA label |
| `featured` | boolean | default `false` (gold styling) |

**PricingPlan**: `/pricing-plans`, "باقات وعروض حصرية" (#pricing)

| Field | Type | Rules |
|-------|------|-------|
| `icon`, `label`, `title`, `description`, `note`, `cta` | string | required |
| `price` | object | `{ before?, value, after, suffix? }`, all strings (`"15%"`, `"4"`). Replaced as a whole on PATCH |
| `features` | string[] | ≤ 10 items |
| `featured` | boolean | the middle "العرض الأكثر طلبًا" card |

**ShowcaseItem**: `/showcase?tab=`, "نماذج من أعمالنا" (#works). The `tab` decides which fields are used and returned:

| `tab` | Public fields | Required |
|-------|---------------|----------|
| `reports` | `title, icon, period, caption, fields, note, image` | `title, caption, icon, period, note`, plus `fields` **or** `image` |
| `recitations` | `title, caption, audio` | `title, caption` |
| `certificates` | `title, caption, image` | `title, caption` |

`fields` is a list of `[label, value]` string pairs (max 8), e.g. `[["الحفظ الجديد", "سورة الملك"]]`.

**Testimonial**: `/testimonials`, "ماذا قالوا عنّا؟"

| Field | Type | Rules |
|-------|------|-------|
| `role` | string | required, ≤ 40 (`"ولي أمر"`, `"طالبة"`, …) |
| `image` | URL \| null | chat screenshot |

**Admin writes** (all four collections): `POST` with the fields above (+ optional `order`, `isActive`);
`PATCH /:id` with only the fields to change; `DELETE /:id`. Unknown fields are ignored. Validation errors return `400` with `details`.

---

## 7. Settings

`GET /settings` returns the singleton settings document (the sections listed in 6.2 plus `showcaseTabs` and `updatedAt`).

`PATCH /settings` (admin) **deep-merges** objects and **replaces** arrays:

```json
{ "contact": { "whatsappNumber": "+20 100 123 4567" } }
```
changes only the number, and keeps `email` and `socialLinks`.
```json
{ "stats": [ { "icon": "faUsers", "value": 25, "label": "محفظ ومحفظة", "key": "teachers" } ] }
```
replaces the whole stats list. Allowed top-level sections: `contact`, `whatsappMessages`, `stats`, `home`, `about`,
`showcaseTabs`, `footerMedia`. `whatsappNumber` is normalized like centers (`+20 100…` → `20100…`).

---

## 8. WhatsApp buttons & analytics

### 8.1 How the site uses it

Every WhatsApp contact is **one click**: buttons are plain `wa.me` links (new tab) with a ready message.
The visitor sees the message in WhatsApp and decides whether to send it. Nothing is collected before WhatsApp opens.

**Service and plan buttons** build their message from the item's name (`src/lib/whatsapp-message.js` in the frontend):

```
السلام عليكم، عندي استفسار بخصوص <name>. ممكن أعرف التفاصيل والأسعار المتاحة؟ شكرًا.
```

`<name>` is a service's `title` or a plan's `label`. When an optional place name is passed it becomes `<name> في <place>`,
unless the name already contains it. (No page passes one today; the academy is online.)

**General buttons** use a message from `settings.whatsappMessages`, chosen by where the button sits (its `placement`):

| `placement` | Button | Message key |
|-------------|--------|-------------|
| `hero` | home hero: "تواصل معنا على واتساب" | `contactInquiry` |
| `homeAbout` | home "من نحن": "احجز حصتك التجريبية المجانية" | `trialInquiry` |
| `whyUs` | home "لماذا نحن": "احجز حلقتك التجريبية" | `trialInquiry` |
| `aboutIntro` | about page intro: "احجز حلقتك التجريبية" | `trialInquiry` |
| `contactInquiry` | home contact section: "تواصل عبر واتساب مباشرة" | `contactInquiry` |
| `contactTrial` | home contact section: "حجز الحصة التجريبية الآن" | `contactTrial` |
| `aboutTrial` | about page bottom banner: "احجز عبر واتساب" | `aboutTrial` |
| `footer` | footer button | `footer` |

`trialInquiry` (default): `السلام عليكم، عندي استفسار عن الحلقات في أكاديمية مزيد، وأود حجز الحصة التجريبية المجانية. ممكن أعرف التفاصيل والمواعيد المتاحة؟ شكرًا.`

In the same click handler the site sends `POST /analytics/events` with `navigator.sendBeacon` and does **not** wait for it.
If the request fails, WhatsApp still opens. Page views are sent the same way, once per route change.

### 8.2 `POST /analytics/events` (public)

Strict body: only these fields are accepted, so no personal data can be stored.

```jsonc
// a page was opened (route path only: no query string or hash)
{ "eventType": "page_view", "pagePath": "/about" }

// a service / plan WhatsApp button was clicked
{ "eventType": "service_whatsapp_click", "serviceType": "service", "serviceId": "6ad8…", "pagePath": "/" }

// a general WhatsApp button was clicked
{ "eventType": "general_whatsapp_click", "placement": "whyUs", "pagePath": "/" }
```

| Field | Rules |
|-------|-------|
| `eventType` | `page_view`, `service_whatsapp_click` or `general_whatsapp_click` |
| `pagePath` | starts with `/`, ≤ 300 chars, no spaces, `?` or `#` |
| `serviceType` | service clicks only: `service` (a Service) or `plan` (a PricingPlan) |
| `serviceId` | service clicks only: id of an **active** item of that type, else `404` |
| `placement` | general clicks only: one of the placements in 8.1 |

Both `application/json` and `text/plain` (the `sendBeacon` format) bodies are accepted. **201** `{ "success": true }`.
The server stores the item's current name (`serviceName`) itself; the client never sends names.
Rate limit: shared with click tracking, 30 events / min per IP.

A click means "the WhatsApp button was pressed". It is not a sent message or a completed booking.

### 8.3 `GET /analytics/summary` (admin)

```jsonc
{
  "success": true,
  "data": {
    "totals": {
      "pageViews": 1520,
      "whatsappClicks": 131,         // all WhatsApp buttons = the two below
      "serviceWhatsappClicks": 87,
      "generalWhatsappClicks": 44
    },
    "services": [ // most clicked first
      { "serviceType": "service", "serviceId": "6ad8…", "serviceName": "تحفيظ القرآن الكريم", "clicks": 41, "deleted": false },
      { "serviceType": "plan", "serviceId": "6ad9…", "serviceName": "اشتراك الفصول", "clicks": 23, "deleted": false }
    ],
    "generalButtons": [ // most clicked first
      { "placement": "hero", "clicks": 30 },
      { "placement": "whyUs", "clicks": 14 }
    ]
  }
}
```

`serviceName` is the item's current name. If the item was deleted, it is the name recorded at click time, with
`deleted: true`. Sent with `Cache-Control: no-store`.

The site shows this in its admin panel, **`/admin/analytics`** (not linked anywhere): the admin enters the admin secret, which is
kept in `sessionStorage` for that tab only. The page shows the totals, a contact rate (WhatsApp clicks per 100 page
views), the services/plans table and the general buttons table.
