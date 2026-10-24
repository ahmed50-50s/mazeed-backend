import Center from '../models/Center.js';
import ApiError from '../utils/ApiError.js';
import { buildArabicRegex } from '../utils/arabicSearch.js';

// Only these fields can be set by the admin. Click counters are never writable from the API.
const EDITABLE_FIELDS = ['name', 'address', 'region', 'whatsappNumber', 'details'];

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { name: 1 },
  popular: { cardClicks: -1 },
  whatsapp: { whatsappClicks: -1 },
};

const MAX_LIMIT = 100;

function pickEditable(body = {}) {
  return EDITABLE_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});
}

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

// GET /api/v1/centers?region=&search=&page=&limit=&sort=
export async function getCenters(req, res) {
  const { region, search, sort = 'newest' } = req.query;
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 20), MAX_LIMIT);

  const filter = {};

  if (typeof region === 'string' && region.trim()) {
    const regionRegex = buildArabicRegex(region);
    filter.region = new RegExp(`^${regionRegex.source}$`, 'i');
  }

  if (typeof search === 'string' && search.trim()) {
    const searchRegex = buildArabicRegex(search);
    filter.$or = [
      { name: searchRegex },
      { address: searchRegex },
      { region: searchRegex },
      { details: searchRegex },
    ];
  }

  const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  const [centers, total] = await Promise.all([
    Center.find(filter)
      .sort({ ...sortBy, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Center.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: centers.length,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data: centers,
  });
}

// GET /api/v1/centers/regions — distinct regions for building a filter dropdown
export async function getRegions(req, res) {
  // region is optional, so skip centers without one
  const regions = (await Center.distinct('region')).filter(Boolean);
  regions.sort((a, b) => a.localeCompare(b, 'ar'));
  res.json({ success: true, count: regions.length, data: regions });
}

// GET /api/v1/centers/:id — increments cardClicks unless ?track=false
export async function getCenterById(req, res) {
  const shouldTrack = req.query.track !== 'false';

  const center = shouldTrack
    ? await Center.findByIdAndUpdate(req.params.id, { $inc: { cardClicks: 1 } }, { new: true })
    : await Center.findById(req.params.id);

  if (!center) throw new ApiError(404, 'Center not found');

  res.json({ success: true, data: center });
}

// POST /api/v1/centers  (admin)
export async function createCenter(req, res) {
  const center = await Center.create(pickEditable(req.body));
  res.status(201).json({ success: true, data: center });
}

// PATCH /api/v1/centers/:id  (admin) — partial update
export async function updateCenter(req, res) {
  const updates = pickEditable(req.body);
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, `Provide at least one of: ${EDITABLE_FIELDS.join(', ')}`);
  }

  const center = await Center.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!center) throw new ApiError(404, 'Center not found');

  res.json({ success: true, data: center });
}

// DELETE /api/v1/centers/:id  (admin)
export async function deleteCenter(req, res) {
  const center = await Center.findByIdAndDelete(req.params.id);
  if (!center) throw new ApiError(404, 'Center not found');

  res.json({ success: true, message: 'Center deleted', data: { id: center.id } });
}

// POST /api/v1/centers/:id/card-click  and  /:id/whatsapp-click
function incrementCounter(field) {
  return async function trackClick(req, res) {
    const center = await Center.findByIdAndUpdate(
      req.params.id,
      { $inc: { [field]: 1 } },
      { new: true, projection: { [field]: 1 } }
    );

    if (!center) throw new ApiError(404, 'Center not found');

    res.json({ success: true, data: { id: center.id, [field]: center[field] } });
  };
}

export const trackCardClick = incrementCounter('cardClicks');
export const trackWhatsappClick = incrementCounter('whatsappClicks');
