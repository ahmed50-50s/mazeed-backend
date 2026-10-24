import SiteSettings, { SETTINGS_SECTIONS } from '../models/SiteSettings.js';
import ApiError from '../utils/ApiError.js';
import { invalidateLandingCache } from '../services/landingService.js';

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// { contact: { socialLinks: { facebook: 'x' } } } → [['contact.socialLinks.facebook', 'x']]
// Objects are merged key by key; arrays and primitives replace the stored value.
function flatten(value, path, out = []) {
  if (isPlainObject(value) && Object.keys(value).length > 0) {
    for (const [key, child] of Object.entries(value)) flatten(child, `${path}.${key}`, out);
  } else {
    out.push([path, value]);
  }
  return out;
}

// GET /api/v1/settings
export async function getSettings(req, res) {
  const settings = await SiteSettings.getSingleton();
  res.json({ success: true, data: settings });
}

// PATCH /api/v1/settings  (admin) — deep merge, e.g. { "contact": { "whatsappNumber": "+20 100 123 4567" } }
export async function updateSettings(req, res) {
  const body = isPlainObject(req.body) ? req.body : {};
  const sections = Object.keys(body).filter((key) => SETTINGS_SECTIONS.includes(key));
  if (sections.length === 0) {
    throw new ApiError(400, `Provide at least one of: ${SETTINGS_SECTIONS.join(', ')}`);
  }

  const settings = await SiteSettings.getSingleton();
  for (const section of sections) {
    for (const [path, value] of flatten(body[section], section)) settings.set(path, value);
  }
  await settings.save();

  invalidateLandingCache();
  res.json({ success: true, data: settings });
}
