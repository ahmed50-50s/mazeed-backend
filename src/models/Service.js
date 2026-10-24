import mongoose from 'mongoose';
import { baseSchemaOptions, displayFields, iconField, text } from './shared.js';

// Home page "خدماتنا وبرامجنا القرآنية" (#courses) cards.
// Mirrors the `services` array in src/pages/Home/components/services.jsx.
const serviceSchema = new mongoose.Schema(
  {
    icon: iconField(),
    badge: text('badge', 40),
    title: text('title', 120),
    description: text('description', 600),
    // CTA label at the bottom of the card, e.g. "ابدأ رحلة الحفظ"
    link: text('link', 60),
    featured: { type: Boolean, default: false },
    ...displayFields,
  },
  baseSchemaOptions
);

serviceSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Service', serviceSchema);
