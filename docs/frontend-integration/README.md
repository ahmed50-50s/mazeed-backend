# Mazeed frontend integration

Drop-in changes for [Mazeed-Frontend](https://github.com/ahmed50-50s/Mazeed-Frontend), checked against `7cd47e8 icons`
(the latest commit when this was prepared; it keeps all of that work: the Contact page, the navbar with icons, hero and testimonials):

- the hardcoded content arrays now come from this API, with the old content kept as the instant / offline fallback;
- every WhatsApp button opens WhatsApp **in one click**: service and plan buttons with a message naming the item, and the
  "احجز" buttons (home "من نحن" / "لماذا نحن", About page intro) with a general trial message instead of scrolling to the
  contact section;
- page views and WhatsApp clicks (per service/plan and per general button) are counted anonymously, in the background;
- the page title no longer mentions branches (the academy is online; the navbar/hero branch buttons were already removed
  upstream), and `index.html` gets a meta description;
- an **admin panel at `/admin`**: site stats, plus editing all the site's content (services, plans, works samples,
  testimonials, contact details, WhatsApp messages, numbers and page texts) without touching code.

## Install

Pick one:

```bash
# A) apply the patch (from the frontend repo root)
git checkout -b feature/api-integration   # a separate branch, so main isn't touched and Vercel gives a preview link
git apply path/to/Mazeed-Back-end/docs/frontend-integration/mazeed-frontend.patch
npm install            # picks up the new axios dependency

# B) copy files: copy src/, .env.example and vercel.json from this folder over the frontend repo,
#    delete src/data/stats.js, then:
npm install axios
```

Then set `VITE_API_URL` (see `.env.example`) locally and in Vercel. On the API, add the site's origin to `CORS_ORIGINS`,
e.g. `https://mazeed-frontend-zeta.vercel.app`, and set the academy WhatsApp number:
`PATCH /api/v1/settings { "contact": { "whatsappNumber": "+20 …" } }`.

The patch was checked against upstream `main`: it applies cleanly, and `npm run lint` and `npm run build` pass.

## The WhatsApp flow

**Before:** a service or plan button scrolled to the `#contact` section. There the visitor picked one of two general
WhatsApp buttons, whose message didn't say which service they wanted.

**Now:** the service or plan button *is* the WhatsApp link (new tab):

```
السلام عليكم، عندي استفسار بخصوص تحفيظ القرآن الكريم. ممكن أعرف التفاصيل والأسعار المتاحة؟ شكرًا.
```

- The name is the service's `title` or the plan's `label`, straight from the API data.
- The message is only prefilled. The visitor sends it, edits it, or closes WhatsApp.
- In the same click, the site sends `{ eventType: 'service_whatsapp_click', serviceType, serviceId }` with
  `navigator.sendBeacon`. It never waits for it, and a failure is ignored.
- `<WhatsappLink service={{ type, id, name, place }} />` accepts an optional `place` (branch or area name). It's added as
  `… بخصوص <name> في <place>` unless the name already contains it. No current page has a place for a service yet.
- The general "احجز" buttons (home "من نحن" and "لماذا نحن", About page intro) used to scroll
  to the contact section; now they open WhatsApp directly with `whatsappMessages.trialInquiry`:
  `السلام عليكم، عندي استفسار عن الحلقات في أكاديمية مزيد، وأود حجز الحصة التجريبية المجانية. ممكن أعرف التفاصيل والمواعيد المتاحة؟ شكرًا.`
- Every general button passes a `placement` (`<WhatsappLink placement="whyUs">`), which picks its message and is what the stats
  page reports. The list lives in `whatsapp-link.jsx` and must match the API's `GENERAL_PLACEMENTS`.

## Page views

`layout.jsx` sends one `page_view` per **route change**, measured on `pathname`:

- `#section` jumps, re-renders and React StrictMode's double effects don't count again;
- the catch-all redirect (`handle: { skipPageView: true }`) doesn't count;
- the admin panel (`/admin/*`) sits outside the site layout, so admin visits aren't counted;
- images, CSS and API calls are never page views.

## Admin panel (`/admin`)

Open `https://<site>/admin` (not linked from the site, `noindex`) and enter the API's `ADMIN_SECRET`.
It stays in `sessionStorage` for that tab only and is never in the code. If it's wrong or gets rotated, the panel signs
out with a notice. All of it is lazy-loaded, so none of it is in the public bundle.

| Tab | What the admin can do |
|-----|-----------------------|
| الإحصائيات (`/admin/analytics`) | See the stats below |
| الإعدادات العامة (`/admin/settings`) | Edit contact details, the WhatsApp messages, the 3 numbers, home / about page texts, works tab names, footer video and recitations. Each section is saved on its own |
| الخدمات · الباقات · نماذج الأعمال · الآراء | Add, edit, delete (with confirmation), reorder (↑ ↓), and hide / show items |

Forms are generated from the field specs in `src/pages/Admin/admin-config.js` (Arabic labels, help texts, required
fields, max lengths, icon picker with preview, link previews for images and audio). Required fields and lengths are checked
in the browser with Arabic messages. Errors the API returns are shown next to the field they belong to. To make a new
field editable, add it to the API schema and to that file.

Edits reach the site within about a minute (the API clears its cache right away; browsers may keep the previous
`/landing-data` for up to 60 s).

### Stats tab

- total page views, total WhatsApp clicks (split into services/plans and general buttons) and the contact rate
  (WhatsApp clicks per 100 page views) (cards);
- services and plans, most clicked first (table);
- general WhatsApp buttons by placement, most clicked first (table);
- an empty state when nothing has been recorded yet, an error message if loading fails, and a lock screen
  again on a wrong secret or after "خروج".

`vercel.json` adds the SPA fallback that makes direct links like `/admin` work on Vercel. It also fixes refreshing `/about`, which returns 404 on the live site today.

## Files

| File | Role |
|------|------|
| `src/services/api.js` | Axios client: `getLandingData()`, modular getters, `trackPageView()`, `trackServiceWhatsappClick()`, `trackGeneralWhatsappClick()` |
| `src/services/admin-api.js` | Admin calls with `x-admin-secret`: list / create / update / remove, settings, stats summary |
| `src/lib/whatsapp-message.js` | The service/plan message template |
| `src/components/whatsapp-link.jsx` | One-click WhatsApp link: `placement` (general button) or `service` (named item); both counted |
| `src/components/layout.jsx` | Page-view tracking |
| `src/pages/Admin/*` + `src/App.jsx` | Admin panel: `AdminLayout` (sign-in, tabs), `Analytics`, `SettingsPage`, `ResourcePage` (lists), `fields.jsx` + `form-utils.js` (generic forms), `admin-config.js` (what is editable) |
| `services.jsx`, `pricing.jsx`, `about.jsx`, `why-us.jsx`, About `intro.jsx` | Buttons now open WhatsApp directly |
| `hero.jsx` | The existing WhatsApp button now goes through `WhatsappLink` (same text and message; counted as `hero`) |
| `index.html` | Page title without branches + meta description |
| `src/data/defaults.js` | Built-in content in the `/landing-data` shape (first paint + offline fallback) |
| `src/lib/icons.js` | Icon name → FontAwesome object (`getIcon("faBookQuran")`) |
| `src/components/landing-data-provider.jsx`, `src/hooks/use-landing-data.js` | Fetch once, `useLandingData()` everywhere |
| Other changed components | `const items = [...]` replaced by `useLandingData()`; `photo.jsx` also accepts URLs |
| `vercel.json` | SPA fallback for direct links |
| `src/data/stats.js` | Removed; its current values (100 / 500 / 100) are now `stats` in the API and in `defaults.js` |

## Not changed (for the frontend engineer to decide)

- **Contact page (`/contact`)**: untouched. Its form asks for name + phone before opening WhatsApp, and its cards, social
  grid and form use `config.js` (`WHATSAPP_NUMBER`, `PHONE_NUMBERS`, `SOCIAL_LINKS`), not the API settings, so they still
  show the placeholder numbers. Its WhatsApp clicks are not counted yet. The form's course list is hardcoded and its
  names differ from the API's service titles.
- `config.js` placeholders (`201000000000`, `contact@mazeed-academy.com`, generic social URLs) are fallbacks; replace them
  with real values or rely on the API settings.

## Content fallback

`getLandingData()` never throws. It merges the API response over `defaults` section by section. A missing or empty value
keeps the built-in one, and non-empty arrays from the API are used whole. So **an admin can't hide a whole section by
deleting all of its items**: the built-in items come back. When the site is showing built-in items (API unreachable), they
have no ids, so their WhatsApp buttons still open but aren't counted.

## Media

The API stores URLs only. Upload files to a CDN or object storage, then set the URL with the admin endpoints,
e.g. `PATCH /showcase/:id { "image": "https://…" }`.
