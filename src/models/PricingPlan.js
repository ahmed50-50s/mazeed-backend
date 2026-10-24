import mongoose from 'mongoose';
import { baseSchemaOptions, displayFields, iconField, stringList, text } from './shared.js';

// The coupon-style price: [before] value after [suffix], e.g. "خصم 15% شهريًا" or "4 شهور بسعر 3 شهور فقط".
// `value` is a display string on purpose ("15%", "4"), so the admin controls exactly what is shown.
const priceSchema = new mongoose.Schema(
  {
    before: text('price.before', 30, { required: false }),
    value: text('price.value', 20),
    after: text('price.after', 40),
    suffix: text('price.suffix', 60, { required: false }),
  },
  { _id: false }
);

// Home page "باقات وعروض حصرية" (#pricing) cards.
// Mirrors the `plans` array in src/pages/Home/components/pricing.jsx.
const pricingPlanSchema = new mongoose.Schema(
  {
    icon: iconField(),
    label: text('label', 60),
    title: text('title', 100),
    description: text('description', 400),
    price: { type: priceSchema, required: [true, 'price is required'] },
    note: text('note', 150),
    features: stringList('features', { maxItems: 10, maxlength: 150 }),
    cta: text('cta', 60),
    // The featured plan is rendered in the middle column with the "العرض الأكثر طلبًا" ribbon
    featured: { type: Boolean, default: false },
    ...displayFields,
  },
  baseSchemaOptions
);

pricingPlanSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('PricingPlan', pricingPlanSchema);
