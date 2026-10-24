import ApiError from '../utils/ApiError.js';
import { toPublic } from '../models/shared.js';
import { invalidateLandingCache } from '../services/landingService.js';

// Builds list/create/update/delete handlers for an ordered content collection (services, plans, ...).
// Public lists return active items in display order with admin-only fields stripped;
// ?includeInactive=true (admin only, enforced by the router) returns full documents.
export function createCrudController(Model, { label, editableFields, toPublicItem = toPublic, listFilter }) {
  const pickEditable = (body = {}) =>
    editableFields.reduce((acc, key) => {
      if (body[key] !== undefined) acc[key] = body[key];
      return acc;
    }, {});

  async function list(req, res) {
    const includeInactive = req.query.includeInactive === 'true';
    const filter = { ...(listFilter?.(req) || {}), ...(!includeInactive && { isActive: true }) };
    const query = Model.find(filter).sort({ order: 1, createdAt: 1 });

    const items = includeInactive ? await query : (await query.lean()).map((item) => toPublicItem(item));
    res.json({ success: true, count: items.length, data: items });
  }

  async function create(req, res) {
    const item = await Model.create(pickEditable(req.body));
    invalidateLandingCache();
    res.status(201).json({ success: true, data: item });
  }

  // Load, set, save (instead of findByIdAndUpdate) so document-level validators run on updates too
  async function update(req, res) {
    const updates = pickEditable(req.body);
    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, `Provide at least one of: ${editableFields.join(', ')}`);
    }

    const item = await Model.findById(req.params.id);
    if (!item) throw new ApiError(404, `${label} not found`);

    item.set(updates);
    await item.save();
    invalidateLandingCache();
    res.json({ success: true, data: item });
  }

  async function remove(req, res) {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw new ApiError(404, `${label} not found`);

    invalidateLandingCache();
    res.json({ success: true, message: `${label} deleted`, data: { id: item.id } });
  }

  return { list, create, update, remove };
}
