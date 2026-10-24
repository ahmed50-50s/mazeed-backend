import Service from '../models/Service.js';
import PricingPlan from '../models/PricingPlan.js';
import Testimonial from '../models/Testimonial.js';
import ShowcaseItem, { SHOWCASE_TABS, toShowcasePublic } from '../models/ShowcaseItem.js';
import ApiError from '../utils/ApiError.js';
import { createCrudController } from './crudFactory.js';

const DISPLAY = ['order', 'isActive'];

// /api/v1/services
export const serviceController = createCrudController(Service, {
  label: 'Service',
  editableFields: ['icon', 'badge', 'title', 'description', 'link', 'featured', ...DISPLAY],
});

// /api/v1/pricing-plans — `price` is replaced as a whole on PATCH
export const pricingPlanController = createCrudController(PricingPlan, {
  label: 'Pricing plan',
  editableFields: ['icon', 'label', 'title', 'description', 'price', 'note', 'features', 'cta', 'featured', ...DISPLAY],
});

// /api/v1/testimonials
export const testimonialController = createCrudController(Testimonial, {
  label: 'Testimonial',
  editableFields: ['role', 'image', ...DISPLAY],
});

// /api/v1/showcase?tab=reports|recitations|certificates
export const showcaseController = createCrudController(ShowcaseItem, {
  label: 'Showcase item',
  editableFields: ['tab', 'title', 'caption', 'icon', 'period', 'fields', 'note', 'image', 'audio', ...DISPLAY],
  toPublicItem: toShowcasePublic,
  listFilter: (req) => {
    const { tab } = req.query;
    if (tab === undefined) return {};
    if (!SHOWCASE_TABS.includes(tab)) throw new ApiError(400, `tab must be one of: ${SHOWCASE_TABS.join(', ')}`);
    return { tab };
  },
});
