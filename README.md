# Quran Centers API (دور تحفيظ القرآن)

Node.js + Express 5 + Mongoose backend for the Mazeed academy site. It covers Quran memorization centers (location fields optional, since the academy teaches online) with WhatsApp links and click analytics, all landing-page content (services, pricing plans, works showcase, testimonials, stats, page copy), and anonymous site stats (page views, WhatsApp clicks per service/plan and per general button) for a small admin dashboard. Content is managed only by admins (shared secret header); there is no user registration.

- **Frontend API contract:** [docs/API.md](docs/API.md)
- **Frontend drop-in integration (patch + files), including the admin panel at `/admin`:** [docs/frontend-integration/](docs/frontend-integration/README.md)
- **Manual request collections:** [tests/api.http](tests/api.http) (centers), [tests/landing.http](tests/landing.http) (content + analytics)

## Folder structure

```
quran-centers-api/
├── src/
│   ├── config/
│   │   ├── env.js              # loads & validates environment variables
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── Center.js           # schema, WhatsApp normalization, whatsappLink virtual
│   │   ├── SiteSettings.js     # singleton: contact, WhatsApp messages, stats, page copy, footer media
│   │   ├── Service.js          # home "#courses" cards
│   │   ├── PricingPlan.js      # home "#pricing" cards
│   │   ├── ShowcaseItem.js     # home "#works" tabs (reports / recitations / certificates)
│   │   ├── Testimonial.js      # home "#testimonials" screenshots
│   │   ├── AnalyticsEvent.js   # anonymous page views + service/plan WhatsApp clicks
│   │   └── shared.js           # icon/media/text field helpers, JSON shape
│   ├── controllers/
│   │   ├── centerController.js
│   │   ├── crudFactory.js      # list/create/update/delete for ordered content collections
│   │   ├── contentControllers.js
│   │   ├── landingController.js
│   │   ├── settingsController.js
│   │   └── analyticsController.js
│   ├── services/
│   │   └── landingService.js   # builds + caches the /landing-data payload
│   ├── validators/
│   │   └── analyticsValidator.js # Zod schema for analytics events
│   ├── routes/
│   │   ├── centerRoutes.js     # /api/v1/centers
│   │   ├── landingRoutes.js    # /api/v1/landing-data, /api/v1/settings
│   │   ├── contentRouter.js    # /services, /pricing-plans, /showcase, /testimonials
│   │   └── analyticsRoutes.js  # /api/v1/analytics
│   ├── middlewares/
│   │   ├── adminAuth.js        # x-admin-secret check (constant-time)
│   │   ├── validate.js         # Zod body validation → 400 with field details
│   │   ├── validateObjectId.js # 400 on malformed :id
│   │   ├── rateLimiters.js     # global + click/analytics-event limits
│   │   └── errorHandler.js     # 404 + unified JSON errors
│   ├── utils/
│   │   ├── ApiError.js
│   │   └── arabicSearch.js     # Arabic-variant-tolerant search regex
│   ├── app.js                  # express app (no listen — easy to test)
│   └── server.js               # DB connect + listen + graceful shutdown
├── scripts/
│   ├── seed.js                 # sample centers + the site's current content
│   ├── seed-data/landing.js    # content copied verbatim from the frontend
│   ├── smoke-test.js           # end-to-end tests: centers
│   └── smoke-test-landing.js   # end-to-end tests: landing content + analytics
├── tests/                      # REST Client / JetBrains request collections
├── docs/
│   ├── API.md                  # contract for the frontend
│   └── frontend-integration/   # patch + files for the Mazeed frontend
└── .env.example
```

## Setup

```bash
npm install
cp .env.example .env        # then set ADMIN_SECRET to a long random string
npm run seed                # 3 sample centers + the site's content (add -- --fresh to wipe centers and content first)
npm run dev                 # http://localhost:5000
```

Generate a secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

| Env var | Required | Description |
|---------|----------|-------------|
| `MONGO_URI` | ✅ | e.g. `mongodb://127.0.0.1:27017/quran_centers` or an Atlas URI |
| `ADMIN_SECRET` | ✅ | ≥ 16 chars; sent by the admin panel as `x-admin-secret` |
| `PORT` | | default `5000` |
| `CORS_ORIGINS` | | comma-separated allowed origins; `*` for all (dev only) |
| `NODE_ENV` | | `production` hides 500 error messages |

## Testing

### Option 1: automated smoke test (recommended)
With the server running:
```bash
npm run test:smoke
```
This runs 23 checks covering every endpoint: auth (401/403), validation (400 + field details), WhatsApp number normalization, filtering, Arabic search, pagination, click counting (including `?track=false`), PATCH partial updates, protection of the counters from writes, 404s, and delete. It cleans up after itself. To test another environment, set `BASE_URL=https://your-api.com`.

For the landing content and analytics (needs `npm run seed` first):
```bash
npm run test:smoke:landing
```
This runs 19 checks: the `/landing-data` shape (every item has exactly the keys its frontend component reads), cache headers, cache invalidation after admin writes, hidden items, per-tab showcase validation on create **and** PATCH, settings deep merge, analytics event validation (unknown types, personal fields and full URLs rejected; unknown service ids → 404), `text/plain` beacon bodies, per-service click counts and their sort order, general-button clicks counted per placement and kept out of the services table, and admin-only access to the summary. It removes what it creates and restores the contact settings. Its analytics events (`pagePath: "/__smoke__"`) are deleted through `MONGO_URI`, so point that at the same database as the server under test.

### Option 2: `.http` file
Install the VS Code **REST Client** extension, open [tests/api.http](tests/api.http), set `@adminSecret`, and click **Send Request** on each block from top to bottom. The create request saves the new id automatically for the requests after it.

### Option 3: Postman
Import [tests/api.http](tests/api.http) (Postman supports `.http`/cURL import), or create a collection with variables `baseUrl = http://localhost:5000/api/v1` and `adminSecret`, and add header `x-admin-secret: {{adminSecret}}` to the POST, PATCH and DELETE requests. Example test script for the create request:
```js
pm.test('201 Created', () => pm.response.to.have.status(201));
pm.collectionVariables.set('centerId', pm.response.json().data.id);
```

## Design decisions

- **PATCH instead of PUT for updates.** The admin usually edits one or two fields. PUT means "replace the whole resource", so a missing field would have to be cleared or rejected. PATCH applies only the fields sent, which matches the use case. Validators still run on the fields that are updated.
- **Counters can't be set through the API.** Create and update accept only `name, address, region, whatsappNumber, details`, so neither admins nor anyone else can set `cardClicks` or `whatsappClicks` directly.
- **Atomic `$inc`** for click tracking: safe under concurrent requests, with no read-modify-write race.
- **`GET /:id?track=false`** lets the admin panel, SSR, and refetches skip inflating the view count.
- **Rate limiting** on click endpoints (30/min/IP) keeps the analytics roughly trustworthy without a login. For stronger protection later, add de-duplication (e.g. one count per IP per center per hour).
- **WhatsApp numbers are normalized** to digits in international format, so `whatsappLink` always works.
- **Search** uses regex with Arabic letter-variant matching. That is fine for hundreds to low thousands of centers. If the data grows a lot, move to MongoDB Atlas Search.
- **Admin secret header** is fine for a small internal team. Rotate it if it leaks, and serve the API over HTTPS only. If you later need multiple admins or an audit trail, switch to JWT login.
- **One `/landing-data` request** for the whole site instead of ~8. The content changes rarely, so it is cached in memory for 60 s, and every admin write clears the cache. HTTP `Cache-Control` + `ETag` let browsers and CDNs reuse it. The per-collection routes (`/services`, ...) are still there for admin screens and future pages.
- **Lists vs settings.** Content an admin adds, removes and reorders (services, plans, showcase items, testimonials) gets its own collection with `order` / `isActive`. Small, fixed copy (stats, why-us, values, journey steps, perks) lives in a single `SiteSettings` document and is edited in one `PATCH`.
- **Icons are stored by name** (`"faBookQuran"`), because FontAwesome objects can't be serialized. Names are validated by format; the frontend's registry falls back to a neutral icon for unknown names, so a typo never breaks a page.
- **One click to WhatsApp, counted in the background.** Service and plan buttons are plain `wa.me` links with a message naming the item. The click event is sent with `navigator.sendBeacon` and never awaited, so a slow or failing API can't block contact. No form, no personal data: the event schema is strict and accepts only an event type, a route path and (for clicks) a service/plan id.
- **Analytics are raw anonymous events** (`AnalyticsEvent`), counted with `countDocuments` / one `$group`. That is plenty for a small site. If volume grows, add a TTL index or roll events up into daily counters.
- **General WhatsApp buttons are counted too, by placement** (`hero`, `whyUs`, `footer`, ...). Together with page views this gives a contact rate, and shows which spots on the page actually make people reach out, which is what marketing needs to decide where CTAs go. They are reported separately so they never mix with the per-service ranking.
- **No branches in the landing payload.** The academy is online, so `/landing-data` no longer includes centers, and a center's `address` / `region` are optional. SEO for an online academy comes from the frontend (title, description, structured data, rendering), not from listing locations.
- **The server names the clicked item.** Clicks send only `serviceType` + `serviceId`; the API checks the item exists and stores its name itself, so the report can't be filled with made-up names.
- **Zod for public input, Mongoose validators for admin input.** Analytics events come from anonymous visitors, so they are validated strictly before touching the database. Admin content relies on schema validation, which already returns the same `{ field, message }` details. Content updates load, set and save the document so cross-field rules (such as per-tab showcase rules) also run on PATCH.
