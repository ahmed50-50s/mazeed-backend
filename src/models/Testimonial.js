import mongoose from 'mongoose';
import { baseSchemaOptions, displayFields, mediaUrl, text } from './shared.js';

// "ماذا قالوا عنّا؟" phone-frame cards: a chat screenshot plus who sent it.
// Mirrors the `testimonials` array in src/pages/Home/components/testimonials.jsx.
const testimonialSchema = new mongoose.Schema(
  {
    // e.g. "ولي أمر", "ولية أمر", "طالب", "طالبة"
    role: text('role', 40),
    // Chat screenshot URL; null shows the built-in chat placeholder
    image: mediaUrl('image'),
    ...displayFields,
  },
  baseSchemaOptions
);

testimonialSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Testimonial', testimonialSchema);
