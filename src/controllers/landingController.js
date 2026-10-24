import { getLandingData as loadLandingData } from '../services/landingService.js';

// GET /api/v1/landing-data — everything the home + about pages need in one request.
// Browsers/CDNs may reuse it for a minute and serve it stale for 5 more while revalidating;
// Express adds an ETag, so revalidation returns 304 when nothing changed.
export async function getLandingData(req, res) {
  const data = await loadLandingData();
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json({ success: true, data });
}
